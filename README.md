# RCN North America — V1 redesign

The network site for Remnant Christian Network North America: 13 branches, one family.
A complete redesign of rcnnorthamerica.com with the **same routes** as the live site so it can be
merged into the real repo later. Sister project: `../AAO` (aromeosayi.org), same design family.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase · Resend · MapLibre (free tiles) · Vercel

```bash
npm install
cp .env.example .env.local   # optional for local dev
npm run dev                  # http://localhost:3000
```

## What's in the box

| Route | What it is |
|---|---|
| `/` | Footage hero + inline branch search, "this week" ticker across branches, mission, three instruments, latest messages, network map, events, leadership, Lead Pastor quote, get involved |
| `/branches/[slug]` | **The branch template.** One component, every branch. Renders only sections that have data |
| `/branches/boston` | Showcase #1: livestream footage, 3 weekly gatherings, first-Friday vigil, parking/transit, team, 88 Boston messages, WhatsApp |
| `/branches/orlando-florida` | Showcase #2 (extended): RCN Florida lockup, 7 Hours gathering with live countdown (last Saturday), weekly classes, kids, serve departments, Qgiv giving |
| `/branches/[slug]/visit` | Plan a visit: gathering → next 4 dates (timezone-correct) → details → confirmation email |
| `/locations` | Search by city/ZIP, "Nearest to me", MapLibre map + list + side panel |
| `/sermons` | 1,140 messages, live search + filters (speaker, series, branch, year), featured series, modal player |
| `/events`, `/events/[slug]` | Network / branch / itinerary filters, labelled **sample** Marching Orders page with registration, past national gatherings |
| `/giving` | Designation (national or branch) → that branch's own giving page. No payments or account numbers on-site |
| `/prayer`, `/testimonies`, `/newsletters`, `/gallery`, `/serve`, `/about-us` | As PRD §6; every empty section has a designed empty state with a next step |
| `/team`, `/team/dashboard` | Invite-only sign-in (Supabase Auth), placeholder team docs (policies, guidelines, refund form, brand assets) |
| `/admin`, `/admin/events`, `/admin/inbox` | Branch leaders edit meeting times, leaders, what to expect, parking, giving/WhatsApp/ChMeetings links and hero photo; create/publish events; read their branch's visits, prayer, messages, registrations and serve sign-ups; network admins moderate testimonies. All `noindex`, gated in `proxy.ts`, enforced by Supabase RLS |
| `/boston`, `/florida` | Short links from the client brief (redirect to the branch pages) |

## Project structure

```
RCN-NA/
├── docs/                    # 01 client brief · 02 PRD · 03 content sources · 04 open items
├── app/                     # routes (see table above), server actions, OG images, sitemap
├── components/
│   ├── layout/              # Header, Footer, Brand (RCN mark, logo, branch lockup), JsonLd
│   ├── ui/                  # Buttons, Pending markers, placeholders, empty states, icons
│   ├── branch/              # Branch template sections, in-page nav, next-gathering + countdown
│   ├── home/                # Ticker, carousel, "watch latest"
│   ├── map/                 # NetworkMap (SVG motif), MapView (MapLibre), Locator, BranchFinder
│   ├── sermons/             # Sermon card, filters
│   ├── forms/               # Form shell, all public forms, giving router
│   └── motion/              # LoopVideo, VideoModal, Lightbox, reveal-on-scroll
├── content/                 # The data: branches, words, events, site, sermon snapshot, map
├── lib/                     # schedule maths, sermons, YouTube RSS, events, auth, Supabase, SEO
├── supabase/                # schema.sql (tables + RLS), seed.sql (13 branches, times, leaders)
├── scripts/                 # render-footage.sh, build-map.mjs
└── public/                  # brand, leader portraits, gathering photos, footage loops
```

## Design

- Type: **Sora** (headings) + **Source Sans 3** (text), the fonts the live rcnnorthamerica.com
  already uses. Set in `app/layout.tsx`; one swap returns to the AAO pairing (Cormorant + Manrope).
- Palette: warm ivory, RCN orange `#DF6526` (buttons use `#C4501A` so white text passes WCAG AA),
  "night" only for footage. Each showcase branch carries its own accent (Boston crimson, Orlando blue).
- Lighthouse (mobile, production build): home 93 · Orlando 94 · sermons 92 · locations 96;
  accessibility, best practices and SEO 100 on all of them.

## Content rules (read before editing)

- **Nothing invented.** All branch data, leaders, times, copy and photos come from the live site,
  RCN's YouTube channels or the client brief. See `docs/03-content-sources.md`.
- Anything unconfirmed shows a dashed **To confirm** marker or a striped placeholder. The list is in
  `docs/04-open-items.md`. `NEXT_PUBLIC_SHOW_PENDING=false` hides them all.
- No fake events, testimonies, newsletters, gallery photos or giving goals (PRD §9). The one
  exception is the clearly labelled **Sample** Marching Orders event.

## Where to change things

- Branch details, meetings, leaders → `content/branches.data.ts` (scraped; edit freely)
- Branch extras (footage, accent colour, signature gathering, classes, kids, giving link) → `content/branches.ts`
- Page copy, values, quotes, the draft "what to expect" → `content/words.ts`
- Network links → `content/site.ts` · Events → Supabase `events` (sample in `content/events.ts`)
- Leaders edit their own branch in `/admin` (stored in Supabase `branch_content`, merged over the
  defaults). Meeting-time edits reach every countdown, the ticker and the finder via `/api/schedule`.
- After adding a branch: `npm run map:build` to place it on the network map

## How the schedule works

Meetings are stored as wall-clock times in each branch's IANA timezone with a recurrence rule
(`weekly`, `daily`, `nth` with `-1` = last). `lib/schedule.ts` finds the next occurrence in the
branch's zone and converts it to a real instant, so countdowns are right across timezones and DST,
"last Saturday" and "first Friday" included. Visitors see the branch time and their own time.
Every meeting card has an `.ics` download (`/branches/[slug]/calendar?m=…`) with the recurrence rule.

## Forms

One server action (`app/actions.ts`): validation → honeypot + timing (+ optional Turnstile) →
Supabase insert → email to the branch inbox + confirmation to the person (Resend).
Plan-a-visit confirmations include the address, map link, time and what to expect.

- No Supabase locally? Submissions go to `.data/submissions.ndjson`.
- Previews email `NETWORK_INBOX` only; set `ROUTE_TO_BRANCH_INBOXES=true` at launch.

## Supabase

1. Create a project → SQL editor → run `supabase/schema.sql`, then `supabase/seed.sql`.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. Invite team members from Authentication → Users (no public sign-up), then add a row in
   `profiles` with `role` = `network_admin` | `branch_admin` (+ `branch_slug`) | `team`.

RLS: the public can read published content and insert submissions only. Prayer requests are
readable only by that branch's admins and network admins.

## Not in V1

Ask chatbot, multi-language, per-branch payment processing (V1 routes to each branch's own page),
merge into the live repo.
