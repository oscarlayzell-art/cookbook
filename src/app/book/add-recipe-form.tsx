"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { ImportResult } from "./import/route";

type Job = { key: number; url: string } & (
  | { status: "saving" }
  | { status: "saved"; id: string; title: string; existing: boolean }
  | { status: "failed"; error: string; blocked?: boolean }
);

export function AddRecipeForm() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const nextKey = useRef(0);

  const update = (key: number, job: Job) => setJobs((all) => all.map((j) => (j.key === key ? job : j)));
  const dismiss = (key: number) => setJobs((all) => all.filter((j) => j.key !== key));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const url = String(new FormData(form).get("url") ?? "").trim();
    if (!url) return;
    form.reset();
    const key = nextKey.current++;
    setJobs((all) => [{ key, url, status: "saving" }, ...all]);

    let result: ImportResult;
    try {
      const res = await fetch("/book/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      result = res.headers.get("content-type")?.includes("json")
        ? await res.json()
        : { error: "That took too long or you were signed out. Refresh the page and try again." };
    } catch {
      result = { error: "Couldn't reach the cookbook. Check your connection and try again." };
    }
    if ("error" in result) {
      update(key, { key, url, status: "failed", error: result.error, blocked: result.blocked });
    } else {
      update(key, { key, url, status: "saved", ...result });
      router.refresh();
    }
  }

  return (
    <div className="mt-6">
      <form onSubmit={onSubmit}>
        <label className="block text-sm font-medium" htmlFor="url">
          Add a recipe from a link
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://www.bbcgoodfood.com/recipes/…"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2"
          />
          <button type="submit" className="rounded-full bg-sky-700 px-4 py-2 font-medium text-white">
            Save
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          You can add another link while one is saving. Site won&apos;t let us in?{" "}
          <Link href="/book/save-button" className="underline">Use the Save to Cook Book button</Link> or{" "}
          <Link href="/book/paste" className="underline">paste the recipe</Link>.
        </p>
      </form>

      {jobs.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {jobs.map((job) => (
            <li
              key={job.key}
              className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-sm ${
                job.status === "failed" ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
              }`}
            >
              <StatusIcon status={job.status} />
              <div className="min-w-0 flex-1">
                {job.status === "saving" && (
                  <>
                    <p className="font-medium">Saving recipe…</p>
                    <p className="truncate text-slate-500">{job.url}</p>
                  </>
                )}
                {job.status === "saved" && (
                  <p>
                    {job.existing ? "Already in your cookbook: " : "Saved "}
                    <Link href={`/book/${job.id}`} className="font-medium text-sky-800 underline">
                      {job.title}
                    </Link>
                  </p>
                )}
                {job.status === "failed" && (
                  <>
                    <p className="text-red-800">{job.error}</p>
                    <p className="truncate text-slate-500">{job.url}</p>
                    {job.blocked && (
                      <p className="mt-1">
                        <Link href="/book/save-button" className="underline">Set up the button</Link> or{" "}
                        <Link href="/book/paste" className="underline">paste it</Link>
                      </p>
                    )}
                  </>
                )}
              </div>
              {job.status !== "saving" && (
                <button onClick={() => dismiss(job.key)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-700">
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: Job["status"] }) {
  if (status === "saving") {
    return (
      <span
        aria-hidden
        className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700"
      />
    );
  }
  return (
    <span aria-hidden className={`mt-px shrink-0 font-bold ${status === "saved" ? "text-green-700" : "text-red-700"}`}>
      {status === "saved" ? "✓" : "!"}
    </span>
  );
}
