import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halo Cooking Book · Every recipe you love, kept for good",
  description:
    "Save a full copy of any recipe from the web: ingredients, method, nutrition and photo. Scale servings, cost each portion and find it again in seconds.",
};

const serif = "font-[Georgia,'Times_New_Roman',serif]";
const cta =
  "inline-block rounded-full bg-orange-700 px-7 py-3 text-base font-medium text-white shadow-sm transition hover:bg-orange-800";

const steps = [
  {
    title: "Find a recipe you like",
    body: "On any website, from BBC Good Food to your favourite blog.",
  },
  {
    title: "Tap Save to Cook Book",
    body: "One button on your computer or iPhone. Or paste the page and we'll read it for you.",
  },
  {
    title: "It's yours for good",
    body: "Ingredients, method, nutrition and photo are copied into your book, so it never disappears.",
  },
];

const features = [
  { icon: "⚖️", title: "Scale any recipe", body: "Cooking for two or ten? Change the servings and every quantity updates." },
  { icon: "💷", title: "Know what it costs", body: "Snap your shopping receipts and see the cost per portion of each dish." },
  { icon: "🔎", title: "Find it in seconds", body: "Search by name or ingredient, and sort your book with your own labels." },
  { icon: "⭐", title: "Rate and remember", body: "Star the keepers and add your own photo of how it really turned out." },
  { icon: "✨", title: "Paste anything", body: "Copy a recipe from anywhere, even a page that won't share, and AI tidies it up." },
  { icon: "🛟", title: "Never lose one again", body: "Sites change and links break. Your copy stays exactly as you saved it." },
];

function RecipeCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -right-3 -top-3 h-full w-full rotate-3 rounded-2xl bg-orange-100" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-amber-200 via-orange-300 to-red-300 text-6xl">
          🍝
        </div>
        <div className="space-y-4 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                Weeknight
              </span>
              <span className="text-sm text-amber-500">★★★★★</span>
            </div>
            <h3 className={`${serif} mt-2 text-xl font-semibold`}>Creamy tomato orzo</h3>
            <p className="text-xs text-stone-500">Saved from a recipe site · 25 mins</p>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm">
            <span className="text-stone-600">Serves</span>
            <span className="flex items-center gap-3 font-medium">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300">−</span>4
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300">+</span>
            </span>
            <span className="font-medium text-green-700">£1.12 each</span>
          </div>
          <ul className="space-y-1 text-sm text-stone-700">
            <li>300g orzo</li>
            <li>400g tin chopped tomatoes</li>
            <li>2 garlic cloves, crushed</li>
            <li className="text-stone-400">+ 5 more</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className={`${serif} text-xl font-semibold`}>Halo Cooking Book</span>
        <Link href="/login" className="text-sm font-medium text-stone-700 hover:text-orange-800">
          Sign in
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <h1 className={`${serif} text-4xl font-semibold leading-tight sm:text-5xl`}>
              Every recipe you love, <span className="text-orange-700">kept for good.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-stone-600">
              Save a full copy of any recipe from the web into your own cookbook. Ingredients, method,
              nutrition and photo, all in one place, even if the original page disappears.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login?new=1" className={cta}>
                Start your cook book
              </Link>
              <a href="#how" className="text-sm font-medium text-stone-700 underline-offset-4 hover:underline">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-stone-500">£5 a month. Cancel any time.</p>
          </div>
          <RecipeCard />
        </section>

        {/* Problem */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center">
            <p className={`${serif} text-2xl leading-snug text-stone-800 sm:text-3xl`}>
              Bookmarks break. Pages change. Screenshots get lost in your camera roll.
            </p>
            <p className="mt-4 text-lg text-stone-600">
              Halo Cooking Book keeps the whole recipe, not just a link, so the dish you loved last winter
              is still there next winter.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20">
          <h2 className={`${serif} text-center text-3xl font-semibold`}>How it works</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-700 text-lg font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-stone-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section className="bg-orange-50/60">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className={`${serif} text-center text-3xl font-semibold`}>More than a list of links</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-orange-100 bg-white p-6">
                  <span className="text-3xl" aria-hidden>
                    {f.icon}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1 text-stone-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h2 className={`${serif} text-2xl font-semibold`}>One simple plan</h2>
            <p className="mt-4">
              <span className="text-5xl font-semibold">£5</span>
              <span className="text-stone-500"> / month</span>
            </p>
            <ul className="mt-6 space-y-2 text-left text-stone-700">
              {[
                "Unlimited saved recipes",
                "Save from any site, on computer or iPhone",
                "AI recipe reading included every week",
                "Servings scaling, costs, search and labels",
                "Cancel any time, keep reading your book",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-orange-700">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login?new=1" className={`${cta} mt-8 w-full`}>
              Start your cook book
            </Link>
            <p className="mt-3 text-xs text-stone-500">Sign up with just your email. No password to remember.</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-stone-900 text-white">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center">
            <h2 className={`${serif} text-3xl font-semibold`}>Your recipes deserve a proper home.</h2>
            <Link href="/login?new=1" className={`${cta} mt-8`}>
              Start your cook book
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-8 text-sm text-stone-500">
        <span>© {new Date().getFullYear()} Halo Cooking Book</span>
        <Link href="/login" className="hover:text-orange-800">
          Already have an account? Sign in
        </Link>
      </footer>
    </div>
  );
}
