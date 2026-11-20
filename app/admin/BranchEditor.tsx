"use client";

import { useActionState } from "react";
import { saveBranch, type SaveState } from "./actions";
import { LeadersEditor, MeetingsEditor } from "./RowEditors";
import type { Leader, Meeting } from "@/content/types";

type Initial = Record<"what_to_expect" | "parking_notes" | "giving_url" | "whatsapp_url" | "telegram_url" | "chmeetings_url" | "hero_image_url", string>;

const input = "w-full rounded-xl border border-line-strong bg-bg px-4 py-3 text-[16px] focus:border-accent-deep focus:outline-none";

export function BranchEditor({ slug, initial, meetings, leaders }: { slug: string; initial: Initial; meetings: Meeting[]; leaders: Leader[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveBranch, {});
  const field = (name: keyof Initial, label: string, hint?: string, rows?: number) => (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[14px] font-semibold">
        {label}
      </label>
      {rows ? <textarea id={name} name={name} defaultValue={initial[name]} rows={rows} className={input} /> : <input id={name} name={name} type="url" defaultValue={initial[name]} placeholder="https://…" className={input} />}
      {hint && <p className="mt-1.5 text-[13px] text-muted">{hint}</p>}
    </div>
  );
  return (
    <form action={action} className="grid gap-6" key={slug}>
      <input type="hidden" name="slug" value={slug} />
      <MeetingsEditor initial={meetings} />
      <LeadersEditor initial={leaders} />
      {field("what_to_expect", "What to expect", "One per line, as “Title: description”. Replaces the network draft on your page.", 7)}
      {field("parking_notes", "Parking & transit", "One note per line.", 3)}
      <div className="grid gap-6 md:grid-cols-2">
        {field("giving_url", "Giving page link", "Your branch's own processor (Qgiv, Tithe.ly, PayPal…). Never paste account numbers.")}
        {field("chmeetings_url", "ChMeetings RSVP link", "Used by signature gatherings, e.g. Orlando's 7 Hours.")}
        {field("whatsapp_url", "WhatsApp group link")}
        {field("telegram_url", "Telegram link")}
        {field("hero_image_url", "Hero photo URL", "A real photo of your branch gathering (upload to Supabase Storage, paste the public URL).")}
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-accent min-h-12 rounded-full px-8 text-[15px] font-semibold disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <p role="status" className={`text-[14px] ${state.error ? "text-[#b42318]" : "text-muted"}`}>
          {state.error ?? (state.ok ? "Saved. The page updates within two minutes." : "")}
        </p>
      </div>
    </form>
  );
}
