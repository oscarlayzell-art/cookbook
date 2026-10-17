import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PriceError, readReceipt } from "@/lib/prices/receipt";
import { getAccess } from "@/lib/billing/server";
import { READ_ONLY_MESSAGE } from "@/lib/billing/access";

export type ReceiptResult = { added: number; shop: string | null } | { error: string };

// Reading a receipt with AI can take a while.
export const maxDuration = 120;

/** Read a receipt photo or PDF and add its prices to the person's price list. */
export async function POST(request: Request) {
  const reply = (body: ReceiptResult) => NextResponse.json(body);
  try {
    const file = (await request.formData()).get("receipt");
    if (!(file instanceof File) || !file.size) throw new PriceError("Choose a photo or PDF of your receipt.");
    if (file.size > 4_000_000) throw new PriceError("That file is too big. Try a smaller photo or PDF (under 4MB).");

    if (!(await getAccess()).canEdit) throw new PriceError(READ_ONLY_MESSAGE);
    const receipt = await readReceipt(file);
    const supabase = await createClient();
    const boughtOn = /^\d{4}-\d{2}-\d{2}$/.test(receipt.bought_on ?? "") ? receipt.bought_on : null;
    const { error } = await supabase.from("prices").insert(
      receipt.items.map((i) => ({
        item: i.item,
        pack_size: i.pack_size,
        price_pence: Math.max(0, Math.round(i.price_pence)),
        shop: receipt.shop,
        bought_on: boughtOn,
      })),
    );
    if (error) {
      console.error("Saving prices failed", error);
      throw new PriceError("We read the receipt but couldn't save the prices. Please try again.");
    }
    revalidatePath("/book/prices");
    return reply({ added: receipt.items.length, shop: receipt.shop });
  } catch (e) {
    if (e instanceof PriceError) return reply({ error: e.message });
    console.error(e);
    return reply({ error: "Something went wrong reading that receipt. Please try again." });
  }
}
