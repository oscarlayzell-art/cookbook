"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bookmarkletHref } from "@/lib/import/bookmarklet";

export default function SaveButtonPage() {
  const link = useRef<HTMLAnchorElement>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const href = bookmarkletHref(window.location.origin);
    // React refuses to render javascript: links, so set it directly.
    link.current?.setAttribute("href", href);
    setCode(href);
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">The Save to Cook Book button</h1>
      <p className="mt-3 text-stone-700">
        Some recipe sites, including big supermarkets, block other websites from reading their pages.
        This button gets round that: you click it while you&apos;re looking at a recipe, and it sends that
        recipe from your own browser straight into your cookbook.
      </p>

      <h2 className="mt-8 text-lg font-semibold">On a computer</h2>
      <p className="mt-2">
        Drag this button up onto your bookmarks bar. No bookmarks bar (Arc, for example)?{" "}
        <Link href="/book/paste" className="underline">Paste the recipe instead</Link>.
      </p>
      <a
        ref={link}
        onClick={(e) => e.preventDefault()}
        className="mt-3 inline-block cursor-grab rounded-md bg-orange-700 px-4 py-2 font-medium text-white"
      >
        Save to Cook Book
      </a>

      <h2 className="mt-8 text-lg font-semibold">On a phone or tablet</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>Bookmark any page, then edit that bookmark.</li>
        <li>Name it &quot;Save to Cook Book&quot; and replace its address with the code below.</li>
        <li>On a recipe page, tap the address bar, type &quot;Save to Cook Book&quot; and pick the bookmark.</li>
      </ol>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
        }}
        className="mt-3 rounded-md border border-stone-300 bg-white px-4 py-2"
      >
        {copied ? "Copied" : "Copy the code"}
      </button>

      <h2 className="mt-8 text-lg font-semibold">Using it</h2>
      <p className="mt-2">
        Open a recipe, click the button, and a Cook Book tab opens asking you to confirm. If nothing
        happens, allow pop-ups for the recipe site.
      </p>
    </main>
  );
}
