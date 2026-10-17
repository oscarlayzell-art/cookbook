"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bookmarkletHref } from "@/lib/import/bookmarklet";

function isPhoneOrTablet() {
  const ua = navigator.userAgent;
  // iPads report themselves as Macs, but Macs don't have touch screens.
  return /iPhone|iPad|iPod|Android/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export default function SaveButtonPage() {
  const link = useRef<HTMLAnchorElement>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    setCode(bookmarkletHref(window.location.origin));
    setPhone(isPhoneOrTablet());
  }, []);

  useEffect(() => {
    // React refuses to render javascript: links, so set it directly.
    if (code) link.current?.setAttribute("href", code);
  }, [code, phone]);

  const phoneSection = (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">On an iPhone or iPad</h2>
      <p className="mt-2 text-stone-700">This takes about a minute, once. These steps are for Safari.</p>
      <ol className="mt-3 list-decimal space-y-3 pl-5">
        <li>
          Copy the button&apos;s code:
          <div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(code);
                setCopied(true);
              }}
              className="mt-2 rounded-md bg-orange-700 px-4 py-2 font-medium text-white"
            >
              {copied ? "Copied ✓" : "Copy the code"}
            </button>
          </div>
        </li>
        <li>
          While you&apos;re on this page, tap the <strong>Share</strong> button (the square with an arrow), then{" "}
          <strong>Add Bookmark</strong>. Change the name to <strong>Save to Cook Book</strong> and tap{" "}
          <strong>Save</strong>.
        </li>
        <li>
          Open your bookmarks (the book icon), tap <strong>Edit</strong>, then tap the{" "}
          <strong>Save to Cook Book</strong> bookmark.
        </li>
        <li>
          Clear the address underneath the name (tap it, then the ⓧ), paste the code you copied, and tap{" "}
          <strong>Done</strong>.
        </li>
      </ol>
      <h3 className="mt-5 font-semibold">Saving a recipe</h3>
      <p className="mt-1 text-stone-700">
        Open the recipe, tap the address bar, type <strong>Save</strong>, and tap <strong>Save to Cook Book</strong>{" "}
        in the list. Your cookbook opens and asks you to confirm.
      </p>
      <p className="mt-3 text-sm text-stone-500">
        Android or Chrome: the same idea works. Bookmark this page, edit the bookmark&apos;s address to the code, then
        type the bookmark&apos;s name in the address bar on a recipe page.
      </p>
    </section>
  );

  const computerSection = (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">On a computer</h2>
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
      <p className="mt-3 text-stone-700">
        Then open a recipe and click the button. Your cookbook opens and asks you to confirm.
      </p>
    </section>
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/book" className="text-sm text-orange-800">← My cookbook</Link>
      <h1 className="mt-3 text-2xl font-semibold">The Save to Cook Book button</h1>
      <p className="mt-3 text-stone-700">
        Some recipe sites, including big supermarkets, block other websites from reading their pages.
        This button gets round that: you use it while you&apos;re looking at a recipe, and it sends that
        recipe from your own browser straight into your cookbook.
      </p>

      {phone ? (
        <>
          {phoneSection}
          {computerSection}
        </>
      ) : (
        <>
          {computerSection}
          {phoneSection}
        </>
      )}

      <p className="mt-8 text-sm text-stone-500">
        Set the button up before? It still works, but setting it up again gets the newer version, which works
        better on phones.
      </p>
    </main>
  );
}
