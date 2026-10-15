"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/book");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-3xl font-semibold">Set a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm">New password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900"
          />
          <span className="text-xs text-stone-500">At least 8 characters.</span>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-orange-700 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save password"}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
    </main>
  );
}
