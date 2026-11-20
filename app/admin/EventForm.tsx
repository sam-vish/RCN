"use client";

import { useActionState } from "react";
import { saveEvent, type ActionState } from "./admin-actions";

type Ev = Partial<{
  id: string;
  title: string;
  slug: string;
  scope: string;
  branch_slug: string | null;
  start_at: string | null;
  end_at: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  description: string | null;
  registration_enabled: boolean | null;
  capacity: number | null;
  is_published: boolean | null;
}>;

function L({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="mb-1 block text-[13px] font-semibold">
      {children}
    </label>
  );
}

const input = "w-full rounded-xl border border-line-strong bg-bg px-4 py-2.5 text-[15px] focus:border-accent-deep focus:outline-none";

export function EventForm({ ev = {}, network, branches }: { ev?: Ev; network: boolean; branches: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveEvent, {});
  const k = ev.id ?? "new";
  return (
    <form action={action} className="grid gap-4">
      {ev.id && <input type="hidden" name="id" value={ev.id} />}
      {ev.slug && <input type="hidden" name="slug" value={ev.slug} />}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <L id={`t-${k}`}>Title *</L>
          <input id={`t-${k}`} name="title" required defaultValue={ev.title ?? ""} className={input} />
        </div>
        {network && (
          <>
            <div>
              <L id={`sc-${k}`}>Type</L>
              <select id={`sc-${k}`} name="scope" defaultValue={ev.scope ?? "network"} className={input}>
                <option value="network">Network (national)</option>
                <option value="branch">Branch</option>
                <option value="itinerary">Apostle&apos;s itinerary</option>
              </select>
            </div>
            <div>
              <L id={`b-${k}`}>Branch (for branch events)</L>
              <select id={`b-${k}`} name="branch_slug" defaultValue={ev.branch_slug ?? ""} className={input}>
                <option value="">—</option>
                {branches.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div>
          <L id={`sd-${k}`}>Start date *</L>
          <input id={`sd-${k}`} name="start_date" type="date" required defaultValue={ev.start_at?.slice(0, 10) ?? ""} className={input} />
        </div>
        <div>
          <L id={`ed-${k}`}>End date</L>
          <input id={`ed-${k}`} name="end_date" type="date" defaultValue={ev.end_at?.slice(0, 10) ?? ""} className={input} />
        </div>
        <div>
          <L id={`v-${k}`}>Venue</L>
          <input id={`v-${k}`} name="venue" defaultValue={ev.venue ?? ""} className={input} />
        </div>
        <div>
          <L id={`c-${k}`}>City</L>
          <input id={`c-${k}`} name="city" defaultValue={ev.city ?? ""} className={input} />
        </div>
        <div className="md:col-span-2">
          <L id={`a-${k}`}>Address</L>
          <input id={`a-${k}`} name="address" defaultValue={ev.address ?? ""} className={input} />
        </div>
        <div className="md:col-span-2">
          <L id={`d-${k}`}>Description</L>
          <textarea id={`d-${k}`} name="description" rows={3} defaultValue={ev.description ?? ""} className={input} />
        </div>
        <div>
          <L id={`cap-${k}`}>Capacity (optional)</L>
          <input id={`cap-${k}`} name="capacity" type="number" min={1} defaultValue={ev.capacity ?? ""} className={input} />
        </div>
        <div className="flex flex-col justify-end gap-2 text-[14px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="registration_enabled" defaultChecked={Boolean(ev.registration_enabled)} className="accent-[#c4501a]" /> Open registration
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_published" defaultChecked={Boolean(ev.is_published)} className="accent-[#c4501a]" /> Published (visible on the site)
          </label>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button disabled={pending} className="btn-accent min-h-11 rounded-full px-6 text-[14px] font-semibold disabled:opacity-60">
          {pending ? "Saving…" : ev.id ? "Save event" : "Create event"}
        </button>
        <p role="status" className={`text-[14px] ${state.error ? "text-[#b42318]" : "text-muted"}`}>
          {state.error ?? (state.ok ? "Saved." : "")}
        </p>
      </div>
    </form>
  );
}
