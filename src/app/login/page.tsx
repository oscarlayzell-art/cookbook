"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseUrl } from "@/lib/supabase/config";

function friendlyError(message: string) {
  // Supabase reports our invite check as a generic "Database error saving new user".
  if (/invite-only|database error saving new user/i.test(message))
    return "This cookbook is invite-only for now. Ask Oscar for an invite.";
  if (/rate limit|too many|only request this after/i.test(message))
    return "We've sent a lot of sign-in emails just now. Please wait a minute and try again.";
  if (/token has expired|invalid|otp/i.test(message))
    return "That code didn't work. It may have expired, so ask for a new email and use the newest code.";
  if (message === "Failed to fetch")
    return `Couldn't reach the sign-in service at ${supabaseUrl}. Check NEXT_PUBLIC_SUPABASE_URL in Vercel, or try turning off any ad or tracker blocker.`;
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("new")) setIsNew(true);
    if (new URLSearchParams(window.location.search).get("error") === "link") {
      setError("That sign-in link didn't work. It may have expired or been opened in a different browser. Ask for a new one below.");
    }
  }, []);

  async function sendEmail(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) return setError(friendlyError(error.message));
    setSent(true);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError(friendlyError(error.message));
    router.push("/book");
    router.refresh();
  }

  const input = "mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900";
  const button = "w-full rounded-md bg-orange-700 px-4 py-2 font-medium text-white disabled:opacity-60";

  return (
    <main className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-3xl font-semibold">{sent ? "Check your inbox" : isNew ? "Create your account" : "Sign in"}</h1>
      {!sent ? (
        <form onSubmit={sendEmail} className="mt-6 space-y-4">
          <p className="text-stone-700">
            {isNew
              ? "Enter your email and we'll send you a link to get started. No password needed."
              : "Enter your email and we'll send you a sign-in link. No password needed."}
          </p>
          <label className="block">
            <span className="text-sm">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </label>
          <button type="submit" disabled={busy} className={button}>
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-6 space-y-4">
          <p className="text-stone-700">
            We sent an email to <strong>{email}</strong>. Click the link in it, or type the code from the email here.
          </p>
          <label className="block">
            <span className="text-sm">Code from the email</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,10}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={`${input} tracking-widest`}
            />
          </label>
          <button type="submit" disabled={busy} className={button}>
            {busy ? "Checking…" : "Sign in"}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="space-y-1 text-sm text-orange-800">
            <button type="button" disabled={busy} onClick={() => sendEmail()} className="block underline">
              Send another email
            </button>
            <button type="button" onClick={() => { setSent(false); setCode(""); setError(null); }} className="block underline">
              Use a different email
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
