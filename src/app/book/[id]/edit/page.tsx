import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAccess } from "@/lib/billing/server";
import { createClient } from "@/lib/supabase/server";
import { updateRecipe } from "../../actions";

const field = "mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getAccess()).canEdit) redirect(`/book/${id}`);
  const supabase = await createClient();
  const { data: r } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (!r) notFound();

  const nutrition = Object.entries((r.nutrition ?? {}) as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/book/${r.id}`} className="text-sm text-orange-800">← Back to recipe</Link>
      <h1 className="mt-3 text-2xl font-semibold">Edit recipe</h1>
      <form action={updateRecipe.bind(null, r.id)} className="mt-6 space-y-5">
        <label className="block">Title<input name="title" defaultValue={r.title} required className={field} /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">Serves<input name="servings" defaultValue={r.servings ?? ""} className={field} /></label>
          <label className="block">Total time<input name="total_time" defaultValue={r.total_time ?? ""} className={field} /></label>
        </div>
        <label className="block">Ingredients (one per line)
          <textarea name="ingredients" rows={10} defaultValue={r.ingredients.join("\n")} className={field} />
        </label>
        <label className="block">Method (one step per line)
          <textarea name="method" rows={10} defaultValue={r.method.join("\n")} className={field} />
        </label>
        <label className="block">Nutrition per serving (one per line, like &quot;Calories: 481 kcal&quot;)
          <textarea name="nutrition" rows={6} defaultValue={nutrition} className={field} />
        </label>
        <label className="block">Tags (comma separated)
          <input name="tags" defaultValue={r.tags.join(", ")} className={field} />
        </label>
        <button className="rounded-md bg-orange-700 px-5 py-2 font-medium text-white">Save changes</button>
      </form>
    </main>
  );
}
