"use server";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { formSpecs, type FormKind, type FormState } from "@/lib/forms";
import { sbInsert, supabaseEnabled } from "@/lib/supabase";
import { getBranch } from "@/content/branches";
import { SITE_URL, site } from "@/content/site";
import { defaultWhatToExpect } from "@/content/words";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 2500; // humans don't submit a form 2.5s after it renders

async function verifyTurnstile(token: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured: honeypot + timing still apply
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || !to) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: to.split(",").map((x) => x.trim()), subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
}

async function store(table: string, row: Record<string, unknown>) {
  if (supabaseEnabled) return sbInsert(table, row);
  if (process.env.NODE_ENV !== "production") {
    // Local preview without Supabase: keep submissions in .data/ so nothing is lost.
    const dir = path.join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "submissions.ndjson"), JSON.stringify({ table, at: new Date().toISOString(), ...row }) + "\n");
    return;
  }
  throw new Error("No storage configured: set SUPABASE_URL and SUPABASE_ANON_KEY.");
}

/**
 * Where a branch-routed notification goes. Preview builds send everything to NETWORK_INBOX so
 * real branch inboxes aren't emailed from a demo; set ROUTE_TO_BRANCH_INBOXES=true at launch.
 */
function inboxFor(branchSlug?: string | null) {
  const network = process.env.NETWORK_INBOX || "";
  if (!branchSlug || process.env.ROUTE_TO_BRANCH_INBOXES !== "true") return network;
  const b = getBranch(branchSlug);
  const override = process.env[`INBOX_${branchSlug.replace(/-/g, "_").toUpperCase()}`];
  return override || b?.emails[0] || network;
}

function visitConfirmation(row: Record<string, unknown>) {
  const b = getBranch(String(row.branch));
  if (!b) return null;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;
  const expect = (b.ext.whatToExpect ?? defaultWhatToExpect).map((x) => `<li><strong>${esc(x.title)}.</strong> ${esc(x.body)}</li>`).join("");
  return `
    <p>Hi ${esc(String(row.name ?? ""))},</p>
    <p>Thank you for planning a visit to <strong>${esc(b.shortName)}</strong>. We can't wait to meet you.</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:4px 16px 4px 0;color:#6b6158">Gathering</td><td><strong>${esc(String(row.gathering))}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#6b6158">When</td><td>${esc(String(row.visit_date))}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#6b6158">Where</td><td>${esc(b.address)} · <a href="${maps}">Open in Maps</a></td></tr>
    </table>
    <p><strong>What to expect</strong></p><ul>${expect}</ul>
    <p>Questions before then? Reply to this email or write to ${esc(b.emails[0] ?? "")}.</p>
    <p>${esc(site.legalName)}<br/><a href="${SITE_URL}/branches/${b.slug}">${SITE_URL.replace("https://", "")}/branches/${b.slug}</a></p>`;
}

export async function submitForm(kind: FormKind, _prev: FormState, formData: FormData): Promise<FormState> {
  const spec = formSpecs[kind];
  if (!spec) return { status: "error", message: "Unknown form." };

  // Spam traps: hidden field must be empty, and the form can't be submitted instantly.
  const honeypot = String(formData.get("website") ?? "");
  const renderedAt = Number(formData.get("_t") ?? 0);
  if (honeypot || (renderedAt && Date.now() - renderedAt < MIN_FILL_MS)) {
    return { status: "success", message: spec.success }; // look successful to bots
  }
  if (!(await verifyTurnstile(formData.get("cf-turnstile-response") as string | null))) {
    return { status: "error", message: "Please complete the verification and try again." };
  }

  const row: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  for (const [name, rule] of Object.entries(spec.fields)) {
    if (rule.checkbox) {
      const on = formData.get(name) === "on";
      if (rule.required && !on) fieldErrors[name] = "Please confirm to continue.";
      row[name] = on;
      continue;
    }
    const value = String(formData.get(name) ?? "").trim();
    if (rule.required && !value) fieldErrors[name] = "This field is required.";
    else if (value && rule.email && !EMAIL_RE.test(value)) fieldErrors[name] = "Enter a valid email address.";
    else if (value && rule.max && value.length > rule.max) fieldErrors[name] = `Keep this under ${rule.max} characters.`;
    else if (value && rule.int) {
      const n = Number(value);
      if (!Number.isInteger(n) || n < rule.int[0] || n > rule.int[1]) fieldErrors[name] = `Enter a number from ${rule.int[0]} to ${rule.int[1]}.`;
      row[name] = n;
      continue;
    }
    row[name] = value || null;
  }
  if (row.branch && !getBranch(String(row.branch)) && row.branch !== "network") fieldErrors.branch = "Choose a branch from the list.";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Please check the highlighted fields.", fieldErrors };

  try {
    await store(spec.table, row);
  } catch (e) {
    console.error(e);
    return { status: "error", message: "Something went wrong sending your form. Please try again in a moment." };
  }

  // Notifications are best-effort: a failed email never loses the stored submission.
  const inbox = spec.routeByBranch ? inboxFor(row.branch as string) : process.env.NETWORK_INBOX || "";
  const email = typeof row.email === "string" ? row.email : undefined;
  const branchName = row.branch ? getBranch(String(row.branch))?.shortName : undefined;
  const table = Object.entries(row)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#777">${esc(k)}</td><td>${esc(String(v ?? ""))}</td></tr>`)
    .join("");
  const confirmation =
    kind === "visit"
      ? visitConfirmation(row)
      : spec.autoReply
        ? `<p>${esc(spec.autoReply.body)}</p><p>${esc(site.legalName)}<br/>${SITE_URL.replace("https://", "")}</p>`
        : null;
  await Promise.allSettled([
    sendEmail(inbox, `${spec.subject}${branchName ? ` · ${branchName}` : ""}`, `<table>${table}</table>`, email),
    confirmation && email
      ? sendEmail(email, kind === "visit" ? `Your visit to ${branchName ?? "RCN"}` : spec.autoReply!.subject, confirmation)
      : Promise.resolve(),
  ]);

  return { status: "success", message: spec.success };
}
