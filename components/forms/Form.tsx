"use client";

import { useActionState, useEffect, useId, useRef, type ReactNode } from "react";
import Script from "next/script";
import { submitForm } from "@/app/actions";
import { initialFormState, type FormKind, type FormState } from "@/lib/forms";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Tone = "night" | "light";

export function FormShell({
  kind,
  children,
  submitLabel,
  tone = "light",
  className = "",
}: {
  kind: FormKind;
  children: (state: FormState) => ReactNode;
  submitLabel: string;
  tone?: Tone;
  className?: string;
}) {
  const [state, action, pending] = useActionState(submitForm.bind(null, kind), initialFormState);
  const timeRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Stamp the render time client-side (spam timing check) without a re-render.
  useEffect(() => {
    if (timeRef.current) timeRef.current.value = String(Date.now());
  }, []);
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className={`rounded-2xl border p-6 md:p-8 ${tone === "light" ? "border-line bg-surface text-ink" : "border-on-night/15 bg-on-night/5 text-on-night"}`}
      >
        <p className="display text-3xl md:text-4xl">Thank you.</p>
        <p className={`mt-3 ${tone === "light" ? "text-muted" : "text-on-night-muted"}`}>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className={className}>
      {/* Spam traps: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input ref={timeRef} type="hidden" name="_t" defaultValue="0" />

      {children(state)}

      {TURNSTILE_SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile mt-5" data-sitekey={TURNSTILE_SITE_KEY} data-theme={tone === "night" ? "dark" : "light"} />
        </>
      )}

      {state.status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className={`mt-5 text-[15px] ${tone === "night" ? "text-[#ffb59c]" : "text-[#b42318]"}`}>
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-accent mt-6 inline-flex min-h-12 items-center justify-center rounded-full px-7 text-[15px] font-semibold tracking-wide disabled:opacity-60"
      >
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

const inputCls = {
  night:
    "w-full rounded-xl border border-on-night/20 bg-on-night/[0.06] px-4 py-3 text-[16px] text-on-night placeholder:text-on-night/50 focus:border-gold focus:outline-none focus-visible:outline-none",
  light:
    "w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-[16px] text-ink placeholder:text-muted/70 focus:border-accent-deep focus:outline-none focus:ring-2 focus:ring-accent/20 focus-visible:outline-none",
};

type FieldProps = {
  name: string;
  label: string;
  state: FormState;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  tone?: Tone;
  className?: string;
  hint?: string;
  as?: "input" | "textarea" | "select";
  options?: (string | { value: string; label: string })[];
  rows?: number;
  defaultValue?: string;
  min?: number;
  max?: number;
};

export function Field({
  name,
  label,
  state,
  required,
  type = "text",
  placeholder,
  autoComplete,
  tone = "light",
  className = "",
  hint,
  as = "input",
  options,
  rows = 5,
  defaultValue,
  min,
  max,
}: FieldProps) {
  const id = useId();
  const err = state.fieldErrors?.[name];
  const describedBy = [hint ? `${id}-hint` : "", err ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    required,
    "aria-invalid": err ? true : undefined,
    "aria-describedby": describedBy,
    className: `${inputCls[tone]} ${err ? "border-[#b42318]" : ""}`,
  };
  return (
    <div className={className}>
      <label htmlFor={id} className={`mb-1.5 block text-[14px] font-semibold ${tone === "light" ? "text-ink" : "text-on-night/90"}`}>
        {label}
        {required && <span className={tone === "light" ? "text-accent-ink" : "text-gold"}> *</span>}
      </label>
      {as === "textarea" ? (
        <textarea {...common} rows={rows} placeholder={placeholder} defaultValue={defaultValue} />
      ) : as === "select" ? (
        <select {...common} defaultValue={defaultValue ?? ""}>
          <option value="" disabled>
            {placeholder ?? "Choose one"}
          </option>
          {options?.map((o) => {
            const v = typeof o === "string" ? { value: o, label: o } : o;
            return (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            );
          })}
        </select>
      ) : (
        <input {...common} type={type} placeholder={placeholder} autoComplete={autoComplete} defaultValue={defaultValue} min={min} max={max} />
      )}
      {hint && (
        <p id={`${id}-hint`} className={`mt-1.5 text-[13px] ${tone === "light" ? "text-muted" : "text-on-night-muted"}`}>
          {hint}
        </p>
      )}
      {err && (
        <p id={`${id}-err`} className={`mt-1.5 text-[13px] ${tone === "night" ? "text-[#ffb59c]" : "text-[#b42318]"}`}>
          {err}
        </p>
      )}
    </div>
  );
}

export function Check({
  name,
  label,
  state,
  required,
  tone = "light",
}: {
  name: string;
  label: ReactNode;
  state: FormState;
  required?: boolean;
  tone?: Tone;
}) {
  const id = useId();
  const err = state.fieldErrors?.[name];
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          name={name}
          required={required}
          aria-invalid={err ? true : undefined}
          className="mt-1 h-5 w-5 shrink-0 accent-[#c4501a]"
        />
        <label htmlFor={id} className={`text-[14px] leading-relaxed ${tone === "light" ? "text-muted" : "text-on-night-muted"}`}>
          {label}
        </label>
      </div>
      {err && <p className={`mt-1.5 pl-8 text-[13px] ${tone === "night" ? "text-[#ffb59c]" : "text-[#b42318]"}`}>{err}</p>}
    </div>
  );
}
