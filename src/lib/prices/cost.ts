import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { aiErrorMessage, claudeClient, MODEL } from "@/lib/ai/claude";
import type { RecipeCost } from "./format";
import { PriceError } from "./receipt";

export type PriceRow = { item: string; pack_size: string | null; price_pence: number };

const CostSchema = z.object({
  lines: z.array(
    z.object({
      ingredient: z.string(),
      price_index: z.number().int().nullable().describe("Index of the best matching price, or null if none is a fair match."),
      cost_pence: z
        .number()
        .nullable()
        .describe("Cost of the amount this recipe uses, in pence: pack price × fraction of the pack used. Null when unmatched."),
    }),
  ),
});

const PROMPT = `Work out what this recipe's ingredients cost, using the person's own shopping prices below.
For each ingredient, pick the price line for the same kind of product (ignore brand) and estimate the cost of
the amount the recipe uses: pack price × the share of the pack used, using pack sizes and typical weights
(e.g. one onion is about 150g). Count store-cupboard items used in small amounts (salt, pepper, a splash of oil)
at their share of the pack too. If nothing in the list is a fair match, give null rather than guessing.`;

/** Estimate a recipe's cost from the price list with Claude. */
export async function costRecipe(
  ingredients: string[],
  prices: PriceRow[],
  servings: number | null,
): Promise<RecipeCost> {
  const client = claudeClient();
  if (!client) throw new PriceError("Costing isn't switched on yet. Ask Oscar to add the AI key.");
  if (!prices.length) throw new PriceError("Upload a receipt first so there are prices to work from.");
  if (!ingredients.length) throw new PriceError("This recipe has no ingredients to price.");

  const priceList = prices
    .map((p, i) => `${i}. ${p.item}${p.pack_size ? ` (${p.pack_size})` : ""}: ${p.price_pence}p`)
    .join("\n");
  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: `${PROMPT}\n\n<prices>\n${priceList}\n</prices>\n\n<ingredients>\n${ingredients.join("\n")}\n</ingredients>`,
        },
      ],
      output_config: { format: zodOutputFormat(CostSchema) },
    });
  } catch (e) {
    console.error("AI costing failed", e);
    throw new PriceError(aiErrorMessage(e));
  }
  const r = response.parsed_output;
  if (response.stop_reason === "refusal" || !r) throw new PriceError("We couldn't work out a cost just now. Please try again.");

  const lines = r.lines.map((l) => {
    const match = l.price_index !== null ? prices[l.price_index] : undefined;
    const cost = match && l.cost_pence !== null ? Math.max(0, Math.round(l.cost_pence)) : null;
    return { ingredient: l.ingredient, item: match?.item ?? null, cost_pence: cost };
  });
  return {
    total_pence: lines.reduce((sum, l) => sum + (l.cost_pence ?? 0), 0),
    servings,
    priced_at: new Date().toISOString(),
    lines,
  };
}
