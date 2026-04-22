"use client";

import { FormEvent, useActionState, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SignInState = {
  error?: string;
  success?: string;
  otpSent?: boolean;
  authMethod?: "otp" | "magic" | "password";
};

type SignInAction = (
  previousState: SignInState | null | void,
  formData: FormData
) => Promise<SignInState | void | null>;
type GoogleSignInAction = () => Promise<{ error?: string } | void>;

export default function SignInForm({
  redirectedFrom,
  signInAction,
  signInWithGoogleAction,
}: {
  redirectedFrom?: string;
  signInAction: SignInAction;
  signInWithGoogleAction: GoogleSignInAction;
}) {
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const [authMethod, setAuthMethod] = useState<"otp" | "magic" | "password">(
    "otp"
  );
  const [hashError, setHashError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [clientSuccess, setClientSuccess] = useState<string | null>(null);
  const [clientPending, setClientPending] = useState(false);
  const [otpSentLocal, setOtpSentLocal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const isOtp = authMethod === "otp";
  const isMagic = authMethod === "magic";
  const isPassword = authMethod === "password";
  const otpSent = isOtp && (otpSentLocal || (state?.authMethod === "otp" && Boolean(state?.otpSent)));
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!window.location.hash) return;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errorCode = params.get("error_code");
    const errorDescription = params.get("error_description");

    if (errorCode === "otp_expired") {
      setHashError(
        "Your magic link expired or was already used. Request a new magic link and use only the latest email."
      );
    } else if (errorDescription) {
      setHashError(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
    }
  }, []);

  useEffect(() => {
    const destination = redirectedFrom || "/dashboard";

    const redirectIfSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        window.location.href = destination;
      }
    };

    void redirectIfSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        window.location.href = destination;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [redirectedFrom, supabase]);

  useEffect(() => {
    setClientError(null);
    setClientSuccess(null);
  }, [authMethod]);

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setClientError("Email is required");
      return;
    }

    setClientPending(true);
    setClientError(null);
    setClientSuccess(null);

    try {
      const normalizedCode = otp.trim().replace(/\s|-/g, "");

      if (!normalizedCode) {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
        });
        if (error) {
          setClientError(error.message);
          return;
        }
        setOtpSentLocal(true);
        setClientSuccess(
          "We sent a 6-digit code to your email. Enter it below to complete sign-in."
        );
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: normalizedCode,
        type: "email",
      });
      if (error) {
        setClientError(
          "Invalid or expired code. Request a new email code and enter the latest 6-digit code."
        );
        return;
      }

      window.location.href = redirectedFrom || "/dashboard";
    } finally {
      setClientPending(false);
    }
  }

  return (
    <form
      className="mt-8 space-y-6"
      action={isOtp ? undefined : formAction}
      onSubmit={isOtp ? handleOtpSubmit : undefined}
    >
      <input type="hidden" name="authMethod" value={authMethod} />
      <input type="hidden" name="redirectedFrom" value={redirectedFrom ?? ""} />
      
      {hashError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{hashError}</p>
        </div>
      )}

      {state?.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
        </div>
      )}
      {clientError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{clientError}</p>
        </div>
      )}

      {state?.success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">{state.success}</p>
        </div>
      )}
      {clientSuccess && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <p className="text-sm text-green-800 dark:text-green-200">{clientSuccess}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
            placeholder="you@example.com"
          />
        </div>

        {isOtp && (
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              6-digit code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required={false}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
              placeholder="Enter code when you have it (optional)"
            />
          </div>
        )}

        {isPassword && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required={isPassword}
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
              placeholder="••••••••"
            />
          </div>
        )}

        {isOtp ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Use email code to avoid magic-link expiry from email scanners.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={isPending || clientPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black dark:bg-zinc-50 dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(isPending || clientPending)
            ? "Processing..."
            : isOtp
              ? otpSent
                ? "Send another code / verify code"
                : "Send email code / verify code"
              : isMagic
                ? "Send Magic Link"
                : "Sign in"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signInWithGoogleAction()}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={() => setAuthMethod(isPassword ? "otp" : "password")}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          {isPassword ? "Use email code instead" : "Sign in with password instead"}
        </button>

        <button
          type="button"
          onClick={() => setAuthMethod(isMagic ? "otp" : "magic")}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
        >
          {isMagic ? "Use email code instead" : "Use magic link instead"}
        </button>
      </div>
    </form>
  );
}

