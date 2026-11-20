"use client";

import { useState } from "react";
import { branches } from "@/content/branches";
import { Check, Field, FormShell } from "./Form";
import { serveDepartments } from "@/content/words";

type Tone = "light" | "night";

const branchOptions = branches.map((b) => ({ value: b.slug, label: `${b.shortName} · ${b.city}, ${b.region}` }));
const branchOptionsWithNetwork = [{ value: "network", label: "Not sure / the whole network" }, ...branchOptions];

export function NewsletterForm({ source, tone = "light", branch }: { source: string; tone?: Tone; branch?: string }) {
  return (
    <FormShell kind="newsletter" submitLabel="Sign me up" tone={tone}>
      {(state) => (
        <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
          <input type="hidden" name="source" value={source} />
          {branch && <input type="hidden" name="branch" value={branch} />}
          <Field name="first_name" label="First name" autoComplete="given-name" state={state} tone={tone} />
          <Field name="email" label="Email" type="email" autoComplete="email" required state={state} tone={tone} />
        </div>
      )}
    </FormShell>
  );
}

export function PrayerForm({ branch, tone = "light" }: { branch?: string; tone?: Tone }) {
  return (
    <FormShell kind="prayer" submitLabel="Send prayer request" tone={tone}>
      {(state) => (
        <div className="grid gap-5">
          {branch ? (
            <input type="hidden" name="branch" value={branch} />
          ) : (
            <Field
              as="select"
              name="branch"
              label="Which branch should pray with you?"
              options={branchOptionsWithNetwork}
              defaultValue="network"
              hint="Your request goes privately to that branch's leaders."
              state={state}
              tone={tone}
            />
          )}
          <Field as="textarea" name="request" label="How can we pray?" required rows={6} state={state} tone={tone} />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field name="name" label="Name (optional)" autoComplete="name" state={state} tone={tone} />
            <Field name="email" label="Email (optional)" type="email" autoComplete="email" state={state} tone={tone} />
            <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" state={state} tone={tone} />
          </div>
          <Check name="may_contact" label="A leader may contact me for pastoral care." state={state} tone={tone} />
        </div>
      )}
    </FormShell>
  );
}

export function ContactForm({ branch, tone = "light" }: { branch: string; tone?: Tone }) {
  return (
    <FormShell kind="contact" submitLabel="Send message" tone={tone}>
      {(state) => (
        <div className="grid gap-5">
          <input type="hidden" name="branch" value={branch} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="name" label="Name" autoComplete="name" required state={state} tone={tone} />
            <Field name="email" label="Email" type="email" autoComplete="email" required state={state} tone={tone} />
          </div>
          <Field as="textarea" name="message" label="Message or prayer request" required rows={4} state={state} tone={tone} />
        </div>
      )}
    </FormShell>
  );
}

export type VisitOption = { gathering: string; dates: { value: string; label: string }[] };

/** Plan a visit (PRD §6.9): gathering → one of the next dates → details. */
export function VisitForm({ branch, options, tone = "light" }: { branch: string; options: VisitOption[]; tone?: Tone }) {
  const [gathering, setGathering] = useState(options[0]?.gathering ?? "");
  const dates = options.find((o) => o.gathering === gathering)?.dates ?? [];
  return (
    <FormShell kind="visit" submitLabel="Plan my visit" tone={tone}>
      {(state) => (
        <div className="grid gap-8">
          <input type="hidden" name="branch" value={branch} />
          <fieldset>
            <legend className="mb-3 flex items-center gap-3 text-[15px] font-semibold">
              <Step n={1} /> Which gathering?
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((o) => (
                <label
                  key={o.gathering}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                    gathering === o.gathering ? "border-accent bg-accent/[0.06]" : "border-line-strong bg-surface hover:border-ink/40"
                  }`}
                >
                  <input type="radio" name="gathering" value={o.gathering} checked={gathering === o.gathering} onChange={() => setGathering(o.gathering)} className="h-4 w-4 accent-[#c4501a]" />
                  <span className="text-[15px] font-semibold">{o.gathering}</span>
                </label>
              ))}
            </div>
            {state.fieldErrors?.gathering && <p className="mt-2 text-[13px] text-[#b42318]">{state.fieldErrors.gathering}</p>}
          </fieldset>

          <fieldset>
            <legend className="mb-3 flex items-center gap-3 text-[15px] font-semibold">
              <Step n={2} /> Which day?
            </legend>
            {dates.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {dates.map((d, i) => (
                  <label key={d.value} className="cursor-pointer">
                    <input type="radio" name="visit_date" value={d.label} defaultChecked={i === 0} className="peer sr-only" />
                    <span className="block rounded-xl border border-line-strong bg-surface px-3 py-3 text-center text-[14px] font-semibold transition-colors peer-checked:border-accent peer-checked:bg-accent/[0.06] peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                      {d.label}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <Field name="visit_date" label="Preferred date" placeholder="e.g. Sunday, 6 December" required state={state} tone={tone} />
            )}
          </fieldset>

          <fieldset className="grid gap-5">
            <legend className="mb-3 flex items-center gap-3 text-[15px] font-semibold">
              <Step n={3} /> About you
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="name" label="Name" autoComplete="name" required state={state} tone={tone} />
              <Field name="email" label="Email" type="email" autoComplete="email" required state={state} tone={tone} hint="We'll send the address, time and what to expect." />
              <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" state={state} tone={tone} />
              <div className="grid grid-cols-2 gap-4">
                <Field name="adults" label="Adults" type="number" min={1} max={30} defaultValue="1" state={state} tone={tone} />
                <Field name="kids" label="Kids" type="number" min={0} max={30} defaultValue="0" state={state} tone={tone} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 flex items-center gap-3 text-[15px] font-semibold">
              <Step n={4} /> Anything we should know?
            </legend>
            <Field as="textarea" name="notes" label="Optional: accessibility needs, questions, who you're coming with" rows={3} state={state} tone={tone} />
          </fieldset>
        </div>
      )}
    </FormShell>
  );
}

function Step({ n }: { n: number }) {
  return <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[13px] font-bold text-on-night">{n}</span>;
}

export function EventRegistrationForm({ event, tone = "light" }: { event: string; tone?: Tone }) {
  return (
    <FormShell kind="event_registration" submitLabel="Register" tone={tone}>
      {(state) => (
        <div className="grid gap-5">
          <input type="hidden" name="event" value={event} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="name" label="Full name" autoComplete="name" required state={state} tone={tone} />
            <Field name="email" label="Email" type="email" autoComplete="email" required state={state} tone={tone} />
            <Field name="phone" label="Phone" type="tel" autoComplete="tel" state={state} tone={tone} />
            <Field as="select" name="branch" label="Your branch" options={branchOptionsWithNetwork} state={state} tone={tone} placeholder="Choose your branch" />
            <Field name="attending" label="Number attending" type="number" min={1} max={30} defaultValue="1" required state={state} tone={tone} />
          </div>
          <Field as="textarea" name="notes" label="Notes (optional)" rows={3} state={state} tone={tone} />
        </div>
      )}
    </FormShell>
  );
}


export function ServeForm({ team, branch, tone = "light", departments = serveDepartments }: { team?: string; branch?: string; tone?: Tone; departments?: string[] }) {
  const teams = ["Tech & Systems", ...departments];
  return (
    <FormShell kind="serve" submitLabel="I'd like to serve" tone={tone}>
      {(state) => (
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field as="select" name="team" label="Team" options={teams} defaultValue={team} required state={state} tone={tone} placeholder="Choose a team" />
            {branch ? (
              <input type="hidden" name="branch" value={branch} />
            ) : (
              <Field as="select" name="branch" label="Your branch" options={branchOptionsWithNetwork} state={state} tone={tone} placeholder="Choose your branch" />
            )}
            <Field name="name" label="Name" autoComplete="name" required state={state} tone={tone} />
            <Field name="email" label="Email" type="email" autoComplete="email" required state={state} tone={tone} />
            <Field name="phone" label="Phone" type="tel" autoComplete="tel" state={state} tone={tone} />
            <Field name="skills" label="Skills or experience" placeholder="e.g. livestream, sound, web, design, data" state={state} tone={tone} />
          </div>
          <Field as="textarea" name="message" label="Anything else?" rows={3} state={state} tone={tone} />
        </div>
      )}
    </FormShell>
  );
}

export function TestimonyForm({ tone = "light" }: { tone?: Tone }) {
  return (
    <FormShell kind="testimony" submitLabel="Submit for review" tone={tone}>
      {(state) => (
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="name" label="Name (optional)" autoComplete="name" state={state} tone={tone} />
            <Field name="email" label="Email (optional)" type="email" autoComplete="email" state={state} tone={tone} hint="Only so we can follow up. Never published." />
            <Field name="title" label="Title (optional)" state={state} tone={tone} />
            <Field as="select" name="branch" label="Branch (optional)" options={branchOptionsWithNetwork} state={state} tone={tone} placeholder="Choose a branch" />
          </div>
          <Field as="textarea" name="testimony" label="Your testimony" required rows={7} state={state} tone={tone} />
          <Check name="consent_publish" required label="RCN North America may publish this testimony after review (we may edit lightly for length)." state={state} tone={tone} />
        </div>
      )}
    </FormShell>
  );
}
