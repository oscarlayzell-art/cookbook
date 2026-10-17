"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { setCustomImage } from "../actions";

/** The recipe photo, with a button in the corner to use your own photo or go back to the original. */
export function RecipeImage({
  id,
  original,
  custom,
}: {
  id: string;
  original: string | null;
  custom: string | null;
}) {
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();
  const file = useRef<HTMLInputElement>(null);
  const src = custom ?? original;

  async function upload(f: File) {
    setError(null);
    if (!f.type.startsWith("image/")) return setError("Please choose a photo.");
    if (f.size > 10 * 1024 * 1024) return setError("That photo is over 10MB. Please choose a smaller one.");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setError("Please sign in again.");
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${user.id}/${id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("recipe-images").upload(path, f, { contentType: f.type });
    if (upErr) return setError(`Couldn't upload that photo: ${upErr.message}`);
    const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
    await setCustomImage(id, data.publicUrl);
    setMenu(false);
  }

  return (
    <div className="relative mt-6">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full rounded-2xl object-cover" />
      ) : (
        <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100" />
      )}
      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) startBusy(() => upload(f));
        }}
      />
      <div className="absolute right-3 bottom-3 flex flex-col items-end gap-2">
        {menu && (
          <div className="flex flex-col overflow-hidden rounded-xl bg-white text-sm shadow-lg">
            <button type="button" onClick={() => file.current?.click()} className="px-4 py-2 text-left hover:bg-slate-100">
              {custom ? "Use a different photo" : "Use my own photo"}
            </button>
            {custom && (
              <button
                type="button"
                onClick={() => startBusy(async () => { await setCustomImage(id, null); setMenu(false); })}
                className="px-4 py-2 text-left hover:bg-slate-100"
              >
                Back to the original photo
              </button>
            )}
            <button type="button" onClick={() => setMenu(false)} className="px-4 py-2 text-left text-slate-500 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          disabled={busy}
          aria-label="Change photo"
          className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium shadow disabled:opacity-60"
        >
          {busy ? "Saving…" : "📷 Change"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
