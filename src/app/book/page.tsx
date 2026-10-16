import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddRecipeForm } from "./add-recipe-form";

export default async function BookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, image_url, total_time")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold">My cookbook</h1>
        <Link href="/book/prices" className="text-sm text-orange-800 underline">My prices</Link>
      </div>
      <AddRecipeForm />
      {!recipes?.length ? (
        <p className="mt-10 text-stone-600">No recipes yet. Paste a link above to add your first.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <li key={r.id}>
              <Link href={`/book/${r.id}`} className="block overflow-hidden rounded-lg border border-stone-200 bg-white hover:shadow">
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full bg-stone-100" />
                )}
                <div className="p-3">
                  <h2 className="font-medium">{r.title}</h2>
                  {r.total_time && <p className="text-sm text-stone-500">{r.total_time}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
