"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next, note }: { next: string; note?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const input = "w-full rounded-xl border border-on-night/20 bg-on-night/[0.06] px-4 py-3 text-[16px] text-on-night placeholder:text-on-night/40 focus:border-gold focus:outline-none";
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      {state.error && (
        <p role="alert" className="text-[14px] text-[#ffb59c]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-accent min-h-12 w-full rounded-full text-[15px] font-semibold disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {note && <p className="text-[13px] text-on-night-muted">{note}</p>}
    </form>
  );
}
