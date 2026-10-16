"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cleanUrl, ImportError, recipeFromHtml } from "@/lib/import/fetch";
import { recipeFromText } from "@/lib/import/ai";
import type { ImportedRecipe } from "@/lib/import/parse";
import { costRecipe, type PriceRow } from "@/lib/prices/cost";
import { PriceError } from "@/lib/prices/receipt";
import { baseServings } from "@/lib/servings/scale";

export type ImportState = { error: string | null; blocked?: boolean };

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Let Next.js redirects through; turn anything else into a message instead of crashing the page. */
function unexpected(e: unknown): ImportState {
  unstable_rethrow(e);
  console.error("Saving a recipe failed", e);
  return { error: "Something went wrong saving that recipe. Please try again." };
}

async function existingRecipeId(supabase: Supabase, url: string) {
  const { data } = await supabase.from("recipes").select("id").eq("source_url", url).maybeSingle();
  return data?.id as string | undefined;
}

async function saveRecipe(supabase: Supabase, url: string | null, recipe: ImportedRecipe) {
  const { data, error } = await supabase
    .from("recipes")
    .insert({ ...recipe, source_url: url })
    .select("id")
    .single();
  if (error) throw new ImportError("We found the recipe but couldn't save it. Please try again.");
  return data.id as string;
}

/** Save a recipe from page content the Save to Cook Book bookmarklet sent from the user's own browser. */
export async function addRecipeFromPage(pageUrl: string, html: string): Promise<ImportState> {
  const supabase = await createClient();
  let id: string;
  try {
    const url = cleanUrl(pageUrl);
    const existing = await existingRecipeId(supabase, url);
    if (existing) redirect(`/book/${existing}`);
    id = await saveRecipe(supabase, url, recipeFromHtml(html, url));
  } catch (e) {
    if (e instanceof ImportError) return { error: e.message };
    return unexpected(e);
  }
  revalidatePath("/book");
  redirect(`/book/${id}`);
}

/** Save a recipe from page text the user copied and pasted in, read by AI. */
export async function addRecipeFromText(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const supabase = await createClient();
  let id: string;
  try {
    const pasted = String(formData.get("text") ?? "").trim();
    if (pasted.length < 50) throw new ImportError("Paste the whole recipe page, including ingredients and method.");
    if (pasted.length > 100_000) throw new ImportError("That's a lot of text. Try copying just the recipe part of the page.");
    const rawUrl = String(formData.get("url") ?? "").trim();
    const url = rawUrl ? cleanUrl(rawUrl) : null;
    if (url) {
      const existing = await existingRecipeId(supabase, url);
      if (existing) redirect(`/book/${existing}`);
    }
    id = await saveRecipe(supabase, url, await recipeFromText(pasted));
  } catch (e) {
    if (e instanceof ImportError) return { error: e.message };
    return unexpected(e);
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

export async function deletePrice(id: string) {
  const supabase = await createClient();
  await supabase.from("prices").delete().eq("id", id);
  revalidatePath("/book/prices");
}

export type CostState = { error: string | null };

/** Estimate a recipe's cost from the latest price of each item on the person's price list. */
export async function priceRecipe(id: string): Promise<CostState> {
  const supabase = await createClient();
  const [{ data: recipe }, { data: rows }] = await Promise.all([
    supabase.from("recipes").select("ingredients, servings").eq("id", id).maybeSingle(),
    supabase.from("prices").select("item, pack_size, price_pence").order("created_at", { ascending: false }).limit(1000),
  ]);
  if (!recipe) return { error: "We couldn't find that recipe." };
  const latest = new Map<string, PriceRow>();
  for (const row of rows ?? []) {
    const key = row.item.trim().toLowerCase();
    if (!latest.has(key)) latest.set(key, row);
  }
  try {
    const cost = await costRecipe(recipe.ingredients, [...latest.values()].slice(0, 400), baseServings(recipe.servings));
    await supabase.from("recipes").update({ cost }).eq("id", id);
  } catch (e) {
    if (e instanceof PriceError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/book/${id}`);
  return { error: null };
}
