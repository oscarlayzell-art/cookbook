"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseUrl } from "@/lib/supabase/config";
import Link from "next/link";
import { Logo } from "../logo";
import { verifyEmailCode } from "./actions";

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
    const { error } = await verifyEmailCode(email, code.trim());
    setBusy(false);
    if (error) return setError(friendlyError(error));
    router.push("/book");
    router.refresh();
  }

  const input = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900";
  const button = "w-full rounded-full bg-sky-700 px-4 py-2 font-medium text-white disabled:opacity-60";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-100 to-[#f5faff] px-4 py-10">
      <div className="mx-auto max-w-sm">
        <Link href="/" className="mb-10 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-3xl bg-white p-7 shadow-xl shadow-sky-900/10 ring-1 ring-sky-100">
          <h1 className="font-[Georgia,'Times_New_Roman',serif] text-3xl font-semibold text-sky-950">{sent ? "Check your inbox" : isNew ? "Create your account" : "Sign in"}</h1>
          {!sent ? (
            <form onSubmit={sendEmail} className="mt-6 space-y-4">
              <p className="text-slate-700">
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
              <p className="text-slate-700">
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
              <div className="space-y-1 text-sm text-sky-800">
                <button type="button" disabled={busy} onClick={() => sendEmail()} className="block underline">
                  Send another email
                </button>
                <button type="button" onClick={() => { setSent(false); setCode(""); setError(null); }} className="block underline">
                  Use a different email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
