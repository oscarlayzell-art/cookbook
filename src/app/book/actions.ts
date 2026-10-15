"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cleanUrl, importRecipe, ImportError } from "@/lib/import/fetch";

export type ImportState = { error: string | null };

export async function addRecipeFromUrl(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const supabase = await createClient();
  let url: string;
  let id: string;
  try {
    url = cleanUrl(String(formData.get("url") ?? ""));

    const { data: existing } = await supabase
      .from("recipes")
      .select("id")
      .eq("source_url", url)
      .maybeSingle();
    if (existing) redirect(`/book/${existing.id}`);

    const recipe = await importRecipe(url);
    const { data, error } = await supabase
      .from("recipes")
      .insert({ ...recipe, source_url: url })
      .select("id")
      .single();
    if (error) throw new ImportError("We found the recipe but couldn't save it. Please try again.");
    id = data.id;
  } catch (e) {
    if (e instanceof ImportError) return { error: e.message };
    throw e;
  }
  revalidatePath("/book");
  redirect(`/book/${id}`);
}

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const nutrition: Record<string, string> = {};
  for (const line of lines(formData.get("nutrition"))) {
    const [label, ...rest] = line.split(":");
    if (label && rest.length) nutrition[label.trim()] = rest.join(":").trim();
  }
  await supabase
    .from("recipes")
    .update({
      title: text(formData.get("title")) ?? "Untitled recipe",
      servings: text(formData.get("servings")),
      total_time: text(formData.get("total_time")),
      ingredients: lines(formData.get("ingredients")),
      method: lines(formData.get("method")),
      nutrition,
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath(`/book/${id}`);
  revalidatePath("/book");
  redirect(`/book/${id}`);
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  await supabase.from("recipes").delete().eq("id", id);
  revalidatePath("/book");
  redirect("/book");
}
