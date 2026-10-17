import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cleanUrl, importRecipe, ImportError } from "@/lib/import/fetch";
import { getAccess } from "@/lib/billing/server";
import { READ_ONLY_MESSAGE } from "@/lib/billing/access";

export type ImportResult =
  | { id: string; title: string; existing: boolean }
  | { error: string; blocked?: boolean };

export const maxDuration = 60;

/**
 * Import a recipe from a link without leaving the page. A route rather than a server action
 * because Next.js runs server actions one at a time, and people add several links at once.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const reply = (body: ImportResult) => NextResponse.json(body);
  try {
    const { url: raw } = (await request.json()) as { url?: unknown };
    const url = cleanUrl(String(raw ?? ""));
    const { data: existing } = await supabase
      .from("recipes")
      .select("id, title")
      .eq("source_url", url)
      .maybeSingle();
    if (existing) return reply({ id: existing.id, title: existing.title, existing: true });

    if (!(await getAccess()).canEdit) throw new ImportError(READ_ONLY_MESSAGE);
    const recipe = await importRecipe(url);
    const { data, error } = await supabase
      .from("recipes")
      .insert({ ...recipe, source_url: url })
      .select("id, title")
      .single();
    if (error) throw new ImportError("We found the recipe but couldn't save it. Please try again.");
    revalidatePath("/book");
    return reply({ id: data.id, title: data.title, existing: false });
  } catch (e) {
    if (e instanceof ImportError) return reply({ error: e.message, blocked: e.blocked });
    console.error(e);
    return reply({ error: "Something went wrong saving that link. Please try again." });
  }
}
