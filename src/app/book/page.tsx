import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/billing/server";
import { ReadOnlyBanner } from "../read-only-banner";
import { AddRecipeForm } from "./add-recipe-form";
import { RecipeList, type ListRecipe } from "./recipe-list";

export default async function BookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { canEdit } = await getAccess();
  const { data: recipes } = await supabase
    .from("recipes")
    // "*" so the list still loads if a newer column has not been added to the database yet.
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold">My cookbook</h1>
        <div className="flex gap-4 text-sm text-orange-800">
          <Link href="/book/prices" className="underline">My prices</Link>
          <Link href="/account" className="underline">My account</Link>
        </div>
      </div>
      {canEdit ? <AddRecipeForm /> : <ReadOnlyBanner />}
      {!recipes?.length ? (
        <p className="mt-10 text-stone-600">No recipes yet.{canEdit && " Paste a link above to add your first."}</p>
      ) : (
        <RecipeList recipes={recipes as ListRecipe[]} />
      )}
    </main>
  );
}
