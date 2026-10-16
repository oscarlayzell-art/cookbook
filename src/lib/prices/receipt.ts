import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { aiErrorMessage, claudeClient, MODEL } from "@/lib/ai/claude";

export class PriceError extends Error {}

const ReceiptSchema = z.object({
  is_receipt: z.boolean().describe("False if this is not a shopping receipt."),
  shop: z.string().nullable(),
  bought_on: z.string().nullable().describe("Date of purchase as YYYY-MM-DD, if printed."),
  items: z.array(
    z.object({
      item: z.string().describe("Product name as printed, with abbreviations expanded where obvious."),
      pack_size: z.string().nullable().describe('Pack size if printed or obvious, e.g. "500g", "1L", "6 pack", "1.2kg".'),
      price_pence: z.number().int().describe("Price of ONE pack in pence, after any discount on that line."),
    }),
  ),
});

const PROMPT = `This is a photo or scan of a shopping receipt. List every food and drink product bought.
- For "2 x £1.50" lines, give the price of one (150).
- Where a discount or offer line follows an item, take it off that item's price.
- For loose items sold by weight, put the weight bought in pack_size and the amount paid in price_pence.
- Leave out bags, deposits, non-food items, totals, payments, savings summaries and loyalty points.
- Don't invent items you can't read.`;

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

export type ReceiptItems = z.infer<typeof ReceiptSchema>;

/** Read the products and prices off a receipt image or PDF with Claude. */
export async function readReceipt(file: File): Promise<ReceiptItems> {
  const client = claudeClient();
  if (!client) throw new PriceError("Receipts aren't switched on yet. Ask Oscar to add the AI key.");
  const mediaType = file.type as MediaType;
  if (!MEDIA_TYPES.includes(mediaType)) throw new PriceError("Upload a photo (JPEG or PNG) or a PDF of the receipt.");

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const source = { type: "base64" as const, data };
  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: [
            mediaType === "application/pdf"
              ? { type: "document", source: { ...source, media_type: "application/pdf" } }
              : { type: "image", source: { ...source, media_type: mediaType } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ReceiptSchema) },
    });
  } catch (e) {
    console.error("AI receipt reading failed", e);
    throw new PriceError(aiErrorMessage(e));
  }
  const r = response.parsed_output;
  if (response.stop_reason === "refusal" || !r || !r.is_receipt) {
    throw new PriceError("That doesn't look like a receipt. Try a clearer photo of the whole receipt.");
  }
  if (!r.items.length) throw new PriceError("We couldn't read any items. Try a clearer, flatter photo.");
  return r;
}
