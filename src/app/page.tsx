import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "./logo";

export const metadata: Metadata = {
  title: "Halo Cooking Book · Your cookbook in the clouds",
  description:
    "Save any recipe from the web to your cookbook in the clouds. Halo keeps a full copy and shows the nutrition and cost of every serving.",
};

const serif = "font-[Georgia,'Times_New_Roman',serif]";
const cta =
  "inline-block rounded-full bg-sky-700 px-7 py-3 text-base font-medium text-white shadow-lg shadow-sky-700/20 transition hover:bg-sky-800";

/** A soft decorative cloud. */
function Cloud({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 90" className={`pointer-events-none absolute ${className}`} aria-hidden>
      <path
        d="M40 85h120a30 30 0 0 0 4-59.7A42 42 0 0 0 84 18a32 32 0 0 0-44 67z"
        fill="currentColor"
      />
    </svg>
  );
}

const steps = [
  {
    title: "Find a recipe",
    body: "On any website, from BBC Good Food to your favourite blog.",
  },
  {
    title: "Send it up",
    body: "Tap Save to Cook Book on your computer or iPhone, or paste the page and let AI read it.",
  },
  {
    title: "Halo does the sums",
    body: "The whole recipe is kept in the clouds, with nutrition and cost worked out for every serving.",
  },
];

const features = [
  { icon: "☁️", title: "Safe in the clouds", body: "Sites change and links break. Your copy stays exactly as you saved it." },
  { icon: "📱", title: "On every device", body: "Laptop, tablet or phone at the hob. Your book is wherever you are." },
  { icon: "⚖️", title: "Scale any recipe", body: "Cooking for two or ten? Every quantity, calorie and penny updates." },
  { icon: "🔎", title: "Find it in seconds", body: "Search by name or ingredient, and sort your book with your own labels." },
  { icon: "⭐", title: "Rate and remember", body: "Star the keepers and add your own photo of how it turned out." },
  { icon: "✨", title: "Paste anything", body: "Copy a recipe from anywhere, even a page that won't share, and AI tidies it up." },
];

function RecipeCard() {
  const macros = [
    { label: "Protein", value: "18g", pct: 60, color: "bg-sky-500" },
    { label: "Carbs", value: "64g", pct: 85, color: "bg-amber-400" },
    { label: "Fat", value: "12g", pct: 35, color: "bg-rose-400" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <Cloud className="-bottom-10 -left-16 w-72 text-white" />
      <Cloud className="-right-14 -top-8 w-48 text-white/90" />
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-sky-900/15 ring-1 ring-sky-100">
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 text-6xl">
          🍝
        </div>
        <div className="space-y-4 p-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">Weeknight</span>
              <span className="text-sm text-amber-500">★★★★★</span>
            </div>
            <h3 className={`${serif} mt-2 text-xl font-semibold text-sky-950`}>Creamy tomato orzo</h3>
            <p className="text-xs text-slate-500">Serves 4 · 25 mins</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-sky-50 p-3">
              <p className="text-xs text-slate-500">Per serving</p>
              <p className="text-2xl font-semibold text-sky-950">
                452 <span className="text-sm font-normal text-slate-500">kcal</span>
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <p className="text-xs text-slate-500">Cost per serving</p>
              <p className="text-2xl font-semibold text-emerald-700">£1.12</p>
            </div>
          </div>
          <div className="space-y-2">
            {macros.map((m) => (
              <div key={m.label} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-slate-600">{m.label}</span>
                <span className="h-1.5 flex-1 rounded-full bg-slate-100">
                  <span className={`block h-1.5 rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                </span>
                <span className="w-8 text-right font-medium text-slate-700">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-800">
      {/* Sky */}
      <div className="relative bg-gradient-to-b from-sky-300 via-sky-100 to-white">
        <Cloud className="left-[-60px] top-24 w-64 text-white/70" />
        <Cloud className="right-[8%] top-6 w-40 text-white/60" />
        <Cloud className="bottom-10 left-[35%] w-80 text-white/50" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo />
          <Link href="/login" className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-sky-900 backdrop-blur hover:bg-white">
            Sign in
          </Link>
        </header>

        <section className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pb-24 pt-10 md:grid-cols-2 md:pt-16">
          <div>
            <h1 className={`${serif} text-4xl font-semibold leading-tight text-sky-950 sm:text-6xl`}>
              Your cookbook, <span className="text-sky-700">in the clouds.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-700">
              Save any recipe from the web and Halo keeps a full copy safe in the clouds, then shows
              you the nutrition and cost of every serving.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login?new=1" className={cta}>
                Start your cook book
              </Link>
              <a href="#how" className="text-sm font-medium text-sky-900 underline-offset-4 hover:underline">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-600">£5 a month. Cancel any time.</p>
          </div>
          <RecipeCard />
        </section>
      </div>

      <main>
        {/* The sums */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className={`${serif} text-3xl font-semibold text-sky-950 sm:text-4xl`}>Know what&apos;s on every plate</h2>
            <p className="mt-4 text-lg text-slate-600">
              Every recipe in your book comes with the numbers that matter, per serving, and they update
              when you change how many you&apos;re cooking for.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-sky-50 p-8">
              <span className="text-4xl" aria-hidden>🥗</span>
              <h3 className="mt-4 text-xl font-semibold text-sky-950">Nutrition per serving</h3>
              <p className="mt-2 text-slate-600">
                Calories, protein, carbs, fat and more for each portion, so you can eat well without a
                spreadsheet.
              </p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-8">
              <span className="text-4xl" aria-hidden>💷</span>
              <h3 className="mt-4 text-xl font-semibold text-sky-950">Cost per serving</h3>
              <p className="mt-2 text-slate-600">
                Snap your shopping receipts and Halo learns what you pay, then prices every portion of
                every dish.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-6 flex max-w-3xl items-start gap-4 rounded-3xl bg-amber-50 p-6">
            <span className="text-3xl" aria-hidden>📈</span>
            <div>
              <h3 className="text-lg font-semibold text-sky-950">Track prices</h3>
              <p className="mt-1 text-slate-600">
                Halo remembers what you&apos;ve paid for every item, so in the supermarket you can see at a glance
                whether today&apos;s price is a good one.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-8 bg-gradient-to-b from-white via-sky-50 to-white">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className={`${serif} text-center text-3xl font-semibold text-sky-950`}>How it works</h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-sky-700 shadow-md ring-1 ring-sky-100">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-sky-950">{s.title}</h3>
                  <p className="mt-2 text-slate-600">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className={`${serif} text-center text-3xl font-semibold text-sky-950`}>Everything floats in one place</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
                <span className="text-3xl" aria-hidden>{f.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-sky-950">{f.title}</h3>
                <p className="mt-1 text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-sky-900/10 ring-1 ring-sky-100">
            <h2 className={`${serif} text-2xl font-semibold text-sky-950`}>One simple plan</h2>
            <p className="mt-4">
              <span className="text-5xl font-semibold text-sky-950">£5</span>
              <span className="text-slate-500"> / month</span>
            </p>
            <ul className="mt-6 space-y-2 text-left text-slate-700">
              {[
                "Unlimited recipes, kept safe in the clouds",
                "Nutrition and cost for every serving",
                "Save from any site, on computer or iPhone",
                "AI recipe reading included every week",
                "Cancel any time and keep reading your book",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-sky-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login?new=1" className={`${cta} mt-8 w-full`}>
              Start your cook book
            </Link>
            <p className="mt-3 text-xs text-slate-500">Sign up with just your email. No password to remember.</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-800 to-sky-950 text-white">
          <Cloud className="-left-10 bottom-0 w-72 text-white/10" />
          <Cloud className="right-0 top-6 w-56 text-white/10" />
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
            <h2 className={`${serif} text-3xl font-semibold sm:text-4xl`}>Put your recipes on cloud nine.</h2>
            <Link href="/login?new=1" className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-medium text-sky-900 shadow-lg hover:bg-sky-50">
              Start your cook book
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-sky-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-sky-200">
          <Logo light />
          <span>© {new Date().getFullYear()} Halo Cooking Book</span>
          <Link href="/login" className="hover:text-white">
            Already have an account? Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
