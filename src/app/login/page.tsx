"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseUrl } from "@/lib/supabase/config";

type Mode = "signin" | "signup" | "reset";

const TITLES: Record<Mode, string> = {
  signin: "Sign in",
  signup: "Create your account",
  reset: "Reset your password",
};

function friendlyError(message: string) {
  // Supabase reports our invite check as a generic "Database error saving new user".
  if (/invite-only|database error saving new user/i.test(message))
    return "This cookbook is invite-only for now. Ask Oscar for an invite.";
  if (/invalid login credentials/i.test(message))
    return "That email and password don't match. If you used to sign in with an email link, choose \"Forgot your password?\" to set one.";
  if (/email not confirmed/i.test(message))
    return "Please confirm your email first. Check your inbox for the link we sent.";
  if (/already registered/i.test(message)) return "You already have an account. Sign in instead.";
  if (message === "Failed to fetch")
    return `Couldn't reach the sign-in service at ${supabaseUrl}. Check NEXT_PUBLIC_SUPABASE_URL in Vercel, or try turning off any ad or tracker blocker.`;
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function switchTo(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const auth = createClient().auth;
    const origin = window.location.origin;
    let result;
    if (mode === "signin") {
      result = await auth.signInWithPassword({ email, password });
    } else if (mode === "signup") {
      result = await auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
    } else {
      result = await auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/account/password`,
      });
    }
    setBusy(false);
    if (result.error) {
      setError(friendlyError(result.error.message));
      return;
    }
    if (mode === "reset") {
      setNotice(`Check your inbox. We sent a link to ${email} to set a new password.`);
    } else if (mode === "signup" && !("session" in result.data && result.data.session)) {
      setNotice(`Check your inbox. We sent a link to ${email} to confirm your account.`);
    } else {
      router.push("/book");
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-3xl font-semibold">{TITLES[mode]}</h1>
      {notice ? (
        <p className="mt-6">{notice}</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900"
            />
          </label>
          {mode !== "reset" && (
            <label className="block">
              <span className="text-sm">Password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900"
              />
              {mode === "signup" && <span className="text-xs text-stone-500">At least 8 characters.</span>}
            </label>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-orange-700 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Email me a reset link"}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      )}
      <div className="mt-6 space-y-1 text-sm text-orange-800">
        {mode !== "signin" && (
          <button type="button" onClick={() => switchTo("signin")} className="block underline">
            Back to sign in
          </button>
        )}
        {mode === "signin" && (
          <>
            <button type="button" onClick={() => switchTo("signup")} className="block underline">
              New here? Create an account
            </button>
            <button type="button" onClick={() => switchTo("reset")} className="block underline">
              Forgot your password?
            </button>
          </>
        )}
      </div>
    </main>
  );
}
