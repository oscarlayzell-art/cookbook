import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, image_url, tags")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">My cookbook</h1>
      {!recipes?.length ? (
        <p className="mt-6 text-stone-600">No recipes yet. Importing from a link is coming next.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <li key={r.id} className="rounded-lg border border-stone-200 p-4">
              <h2 className="font-medium">{r.title}</h2>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
