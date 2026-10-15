"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("idle");
      setError(
        error.message.includes("invite-only")
          ? "This cookbook is invite-only for now. Ask Oscar for an invite."
          : error.message,
      );
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      {status === "sent" ? (
        <p className="mt-6">Check your inbox. We sent a sign-in link to {email}.</p>
      ) : (
        <form onSubmit={sendLink} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900"
            />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-md bg-orange-700 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Email me a sign-in link"}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      )}
    </main>
  );
}
