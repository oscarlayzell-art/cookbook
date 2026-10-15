"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error(error);
  return (
    <main className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-stone-700">
        This can happen just after the site updates. Reloading the page usually fixes it.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-orange-700 px-4 py-2 font-medium text-white"
        >
          Reload
        </button>
        <button type="button" onClick={reset} className="rounded-md border border-stone-300 px-4 py-2">
          Try again
        </button>
      </div>
    </main>
  );
}
