"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import type { ReceiptResult } from "./receipt/route";

/** Shrink phone photos so they upload quickly and stay under the server's size limit. */
async function shrinkImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size < 1_500_000) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

export function ReceiptUpload() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMessage(null);
    let result: ReceiptResult;
    try {
      const blob = await shrinkImage(file);
      const body = new FormData();
      body.set("receipt", blob, blob === file ? file.name : "receipt.jpg");
      const res = await fetch("/book/prices/receipt", { method: "POST", body });
      result = res.headers.get("content-type")?.includes("json")
        ? await res.json()
        : { error: "That took too long or you were signed out. Refresh the page and try again." };
    } catch {
      result = { error: "Couldn't upload the receipt. Check your connection and try again." };
    }
    setBusy(false);
    if ("error" in result) {
      setMessage({ ok: false, text: result.error });
    } else {
      setMessage({ ok: true, text: `Added ${result.added} prices${result.shop ? ` from ${result.shop}` : ""}.` });
      router.refresh();
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-md bg-orange-700 px-4 py-2 font-medium text-white ${
          busy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {busy && (
          <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {busy ? "Reading receipt…" : "Upload a receipt"}
        <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={onChange} disabled={busy} />
      </label>
      <p className="mt-2 text-sm text-stone-500">
        A photo of a paper receipt or the PDF from an online order. On a phone you can take the photo straight away.
      </p>
      {message && (
        <p className={`mt-2 text-sm ${message.ok ? "text-green-800" : "text-red-700"}`} aria-live="polite">
          {message.text}
        </p>
      )}
    </div>
  );
}
