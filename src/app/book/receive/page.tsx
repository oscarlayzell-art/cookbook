"use client";

import { useEffect, useState, useTransition } from "react";
import { addRecipeFromPage } from "../actions";
import { RECEIVE_KEY } from "@/lib/import/receive";

type Page = { url: string; html: string };

export default function ReceivePage() {
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // The newer button arrives via /save, which leaves the recipe in session storage.
    try {
      const stored = sessionStorage.getItem(RECEIVE_KEY);
      if (stored) {
        sessionStorage.removeItem(RECEIVE_KEY);
        const d = JSON.parse(stored);
        if (typeof d?.url === "string" && typeof d?.html === "string") setPage({ url: d.url, html: d.html });
      }
    } catch {
      // Storage blocked or bad data: wait for the older pop-up button instead.
    }

    // The older button opens this page in a new tab and sends the recipe by message.
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (d?.type !== "cookbook-page" || typeof d.url !== "string" || typeof d.html !== "string") return;
      (e.source as Window | null)?.postMessage("cookbook-received", e.origin);
      setPage({ url: d.url, html: d.html });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!page) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-stone-700">
        Waiting for the recipe… If nothing happens, go back to the recipe page and tap Save to Cook Book again.
      </main>
    );
  }

  const host = new URL(page.url).hostname.replace(/^www\./, "");
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Save this recipe?</h1>
      <p className="mt-2 break-all text-stone-600">{page.url}</p>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await addRecipeFromPage(page.url, page.html);
            if (result?.error) setError(result.error);
          })
        }
        className="mt-6 rounded-md bg-orange-700 px-5 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : `Save from ${host}`}
      </button>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </main>
  );
}
