import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4">
      <h1 className="text-4xl font-semibold">Cook Book</h1>
      <p className="mt-4 text-lg text-stone-600">
        Save recipes from anywhere on the web into your own cookbook, with the ingredients,
        method and nutrition kept safe even if the original page disappears.
      </p>
      <Link
        href="/book"
        className="mt-8 w-fit rounded-md bg-orange-700 px-5 py-2.5 font-medium text-white"
      >
        Open my cookbook
      </Link>
    </main>
  );
}
