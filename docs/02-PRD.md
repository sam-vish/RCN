# PRD: RCN North America V1 (Network site + Boston + Orlando)

**Project:** Remnant Christian Network North America (RCN NA) website redesign + upgrade
**Live site today:** https://www.rcnnorthamerica.com (Next.js + Supabase, hosted on Vercel)
**This build:** a standalone V1 preview on Vercel, with the same route structure as the live site so it can be merged into the real repo later
**Prepared:** 20 Nov 2026
**Sister project:** aromeosayi.org (AAO), the Apostle's personal site. Same network, same design family.

> **For Claude Code:** You have creative freedom on layout, motion and visual details, inside the guardrails in Section 7. Content in Section 6 is real, taken from the live site in Nov 2026. Use it as-is. Anything marked **[PLACEHOLDER]** must render as an obviously labeled placeholder (e.g. a dashed box saying "Branch photo coming soon"). **Never invent** events, dates, testimonies, leaders, addresses, phone numbers, giving details, quotes or stats. A church site with fake details is worse than one with empty boxes.

---

## 1. What this is

RCN North America is the network hub for every RCN branch in the US and Canada. The current site works, but it looks generic (system font, plain white, few photos) and many sections sit empty ("No events yet", "Giving will open shortly", "No published newsletters yet").

**V1 goal:** show the ministry what the network could look like. That means a premium, warm, cinematic design, a real branch experience (Boston and Orlando as the showcase branches) and the missing features from the brief. The ministry will judge it on how it looks and feels, so visual quality matters most.

**Three things to deliver in one project:**
1. **RCN North America:** the network site (home, about, locations, sermons, events, give, prayer, testimonies, newsletters, gallery)
2. **RCN Boston:** `/branches/boston`, the branch template at its fullest
3. **RCN Orlando, Florida:** `/branches/orlando-florida`, the same template extended with weekly classes, the 7 Hour gathering, kids and serve

The branch template is the core idea: **one template, every branch.** Boston and Orlando prove it works, and the other 11 branches use the same component with their own data.

---

## 2. Goals and audience

**Goals**
1. A first-time visitor finds the nearest branch and knows exactly when and where to show up, in under 30 seconds.
2. Members find messages, events and ways to serve or give.
3. Every branch looks like part of one family. No more each-branch-does-its-own-thing.
4. Leaders can update branch times, events and content without a developer.
5. It looks as good as the AAO site, so the network feels unified.

**Audience**
- **First-time visitors:** often people new to a city, or who already follow the Apostle on YouTube, looking for an apostolic church nearby. Usually on a phone. They need address, times, what to expect, who to contact.
- **Members:** want messages, the event calendar, prayer, giving.
- **Branch leaders (Pointmen):** need their branch page to look good and stay current.
- **Network leadership:** want one consistent brand across all branches.

---

## 3. Current site audit (Nov 2026)

**Navigation today:** About · Locations · Sermons · Events · Newsletters · Testimonies · Prayer · Gallery · Bookstore (links to aaobooks.com) · **Give** (orange button)

**Routes today** (keep the same paths in V1):
| Route | What's there now |
|---|---|
| `/` | Hero "Striving for the rebirth of Apostolic Christianity.", mission, recent messages, map of branches, leadership roster |
| `/about-us` | Mission, 3 instruments (Prayer / The Word / Breaking of Bread), Lead Pastor quote, 7 core values |
| `/locations` | Searchable map (Mapbox) + list of 13 branches, "Nearest to me", side panel per branch |
| `/branches/[slug]` | Branch page: meeting times, leadership, events, address, contact, socials, "Get Directions" |
| `/sermons` | "Sermon library": 1,000 messages from YouTube, live search, 21 pages |
| `/events` | Two sections: branch events + "Where Apostle Arome is ministering next". **Both empty** |
| `/giving` | **Empty:** "Giving will open shortly" |
| `/prayer` | Prayer form (name, email, phone optional + request). Private, leaders only |
| `/testimonies` | Moderated submissions. **None published yet** |
| `/newsletters` | **Empty** |
| `/gallery` | **Empty:** "New galleries coming soon" |

**Visual identity today**
- White background, near-black text `#171717`
- System sans-serif font (no brand font)
- Accent: orange `#DF6526` (Give button, primary CTAs)
- Warm off-white hero background
- Logo: RCN flame/torch mark + "RCN North America" wordmark

**What works (keep):**
- Branch data model (meeting times, leadership, events, contact, socials per branch)
- `/branches/[slug]` pattern: the template already exists, it just needs to be great
- Sermon library pulling from YouTube
- Private prayer + moderated testimonies (good trust/safety pattern)
- Mapbox locator with search and "Nearest to me"
- Copy tone: "Come as you are."

**What's weak (fix in V1):**
- Looks like a starter template. No photography, no motion, no brand font.
- Empty sections everywhere. V1 needs **good empty states** that still invite action (e.g. "No events this month. Join the newsletter to hear first.") and the design should look complete even with little content.
- Branch pages are data dumps (cards saying "1 listed", "1 profile"). No story, no photos, no "what to expect".
- No plan-a-visit flow.
- No event registration.
- Sermon library is search-only. No filters by speaker, series or branch.
- No giving at all.
- No way for branches to share their own media (Boston has its own YouTube with 90 videos).

---

## 4. Reference sites (what to borrow)

| Site | Borrow |
|---|---|
| **life.church** | One look across many locations; each location page has service times, what to expect, plan-a-visit. The gold standard for a multi-site church. |
| **vineyardusa.org** | Church finder across a national network (search by city/ZIP, map + list). |
| **hillsong.com** | Network to region to local navigation; strong photography; big confident type. |
| **parkstreet.org** (Boston) | Clear first-time-visitor info for a Boston church: parking, transit, what to expect. |
| **aromeosayi.org V1** (our AAO build) | Same design family: shared type system, quote styling, video modal, message cards. |

---

## 5. Sitemap

```
/                              Home
/about-us                      About RCN North America
/locations                     Find a branch (map + list)
/branches/[slug]               Branch template (13 branches)
   /branches/boston            ← showcase branch #1
   /branches/orlando-florida   ← showcase branch #2 (extended)
/branches/[slug]/visit         Plan-a-visit form for that branch
/sermons                       Sermon library (filters)
/events                        Network + branch events, Apostle's itinerary
/events/[slug]                 Event detail + registration (e.g. Marching Orders)
/giving                        Give: national or a specific branch
/prayer                        Prayer request (routes to a branch)
/testimonies                   Testimonies (moderated)
/newsletters                   Newsletter archive + signup
/gallery                       Gallery
/serve                         Tech & systems team + department interest form
/team                          Internal team area (login only) — see 6.12
```

**Primary nav:** About · Locations · Sermons · Events · Serve · **Give** (accent button). Put Newsletters, Testimonies, Prayer, Gallery and Bookstore in a "More" dropdown or the footer.
**Mobile:** hamburger + sticky bottom "Find a branch" pill.
**Global:** a "Find your branch" quick search (city/ZIP) reachable from anywhere.

---

## 6. Page requirements + content

### 6.1 Home (`/`)

1. **Hero:** full-bleed photo or muted video from a real gathering (worship, prayer, crowds).
   - Eyebrow: `REMNANT CHRISTIAN NETWORK · NORTH AMERICA`
   - H1: `Striving for the rebirth of Apostolic Christianity.`
   - Sub: `A growing fellowship of branches across the United States and Canada. Come as you are.`
   - CTAs: `Find a gathering` (to `/locations`) · `Watch the latest message`
   - Inline branch search: "Enter your city or ZIP"
   - **[PLACEHOLDER]** hero media until the media team provides footage
2. **Mission strip:** "RCN North America is an interdenominational ministry restoring the order of the first generation of apostles — through prayer, the Word, and fellowship."
3. **Three instruments:** Prayer / The Word / Breaking of Bread (copy in 6.2). Big, editorial, one per row or 3-up.
4. **Recent messages:** latest 6 from YouTube (see 6.4), with a "Watch the latest" featured card.
5. **Find a branch:** interactive map + list of all 13 branches with next meeting time. Click to go to the branch page.
6. **Upcoming events:** next 3 (network + branches + Apostle's itinerary). Good empty state.
7. **Leadership:** Apostle Arome Osayi (Set Man) + Reverend Philip Gbir (Lead Pastor), then a "Meet the Pointmen" carousel (full list in 6.3).
8. **Lead Pastor quote:** "At RCN North America you will be taught to access and navigate the immortal realm. You will receive the requisite training and equipment to stand as a soldier in the army of God." (Pastor Philip Gbir, Lead Pastor)
9. **Get involved:** 3 cards: Plan a visit · Serve · Give
10. **Newsletter signup**
11. **Footer:** Explore / More / Headquarters / socials / "Visit aromeosayi.org" / RCN Global link

### 6.2 About (`/about-us`)

**Hero:** "Striving for the rebirth of Apostolic Christianity."

**Our mission (existing copy):**
> Remnant Christian Network is an interdenominational Ministry to the body of Christ with the mandate of restoring the apostolic order and Christianity as it was seen in the days of the first generation of apostles of Jesus Christ — and thereby heralding the coming of the Lord Jesus Christ in this end of the age.
>
> We seek only to see the coming of the King and His Kingdom, until His reality is furnished in the hearts of the sons of men. Our major instruments of realizing this vision are prayer, the study of the Word, and the breaking of bread with one another.

**Three instruments. One calling. (existing copy)**
- **Prayer: Prayer that contends.** We carry the prayer commission of the church: unbroken fellowship with God, standing in the gap for cities and nations, and pressing into heaven until earth feels it.
- **The Word: Apostolic teaching.** We teach Scripture with clarity and weight so believers know what they believe, why they believe it, and how to stand firm in truth when testing comes.
- **Breaking of Bread: Community that heals.** We gather around the table — local hubs, shared meals, honest conversation — because the apostolic life was never meant to be lived alone.

**Core values:** 01 Dedication · 02 Excellence · 03 Resilience · 04 Faithfulness · 05 Accountability · 06 Forbearance · 07 Righteousness

**Our Set Man:** short block on Apostle Arome Osayi, Set Man of Remnant Christian Network (founded December 2006, headquartered in Makurdi, Nigeria), with a link to aromeosayi.org. Mission line: "Towards the rebirth of Apostolic Christianity." Network policy direction: Isaiah 37:31.

**Leadership:** full roster (6.3).

**Global network:** RCN Global (rcnglobal.org), with churches across Nigeria, Africa, Europe and North America.

### 6.3 Network data (real, from the live site)

**Headquarters:** Minnesota, 4215 Fairview Avenue, Minnetonka, MN 55343. Sunday Service 3:00 PM CT · Tuesday Service 7:00 PM CT

**Branches (13):**
| Branch | City | Main meeting | Pointman / leadership |
|---|---|---|---|
| Canada | Hamilton, Ontario | Sunday 1:00 PM | Pastor Joseph Olatiregun |
| Minnesota (HQ) | Minnetonka, MN | Sunday 3:00 PM | (HQ) |
| California | Anaheim, CA | Sunday 6:00–9:00 PM | Pastor Dimeji Okewole |
| New York | Hempstead, NY | Sunday 1:00 PM | Femi Adeyeye |
| Houston, Texas | Katy, TX | Sunday 12:00 PM | Pastor Barivure Love Mii (Pointwoman), Pastor Niyi Olaniran (Co-Pointman) |
| Dallas, Texas | De Soto, TX | Wednesday 10:00 PM | **[PLACEHOLDER]** |
| Orlando, Florida | Orlando, FL | Saturday 9:00 AM–4:00 PM | Minister Mica-El Mumba |
| Oklahoma City | Oklahoma City, OK | **[PLACEHOLDER]** | Minister Geoffery Madu |
| Tulsa | Tulsa, OK | Sunday 12:00 PM | Pastor Emmanuel Ola Morafa |
| Boston | Littleton, MA | Sunday 11:00 AM | Minister Peter Mitch |
| Delaware | Middletown, DE | Sunday 12:00–2:30 PM | Pastor Ben Elue |
| Philadelphia | Philadelphia, PA | Sunday 7:00 PM | Pastor Damilola Arigi |
| Maryland (DMV) | Hyattsville, MD | Sunday 3:30 PM | Minister Jean Claude Abeck |

**Network leadership:**
- Apostle Arome Osayi: Set Man, Remnant Christian Network
- Reverend Philip Gbir: RCN North America Lead Pastor
- Pointmen as listed above

Seed these into the database (`branches`, `meeting_times`, `leaders`). Only Boston and Orlando need full content in V1; the other 11 render with the template using the data above plus placeholders.

### 6.4 Sermons (`/sermons`)

- Intro (existing): "Browse over 1,000 teachings from Apostle Arome Osayi and leaders across the network—free to watch, easy to search, and here whenever you want to study or revisit a message."
- Source: Apostle Arome Osayi YouTube (`@ApostleAromeOsayi`, channel ID `UCh6Sn6v_mdhwWTEpNvo5A4A`) + branch channels (Boston: `@RCNBoston-MA`, Orlando: `@RCNOrlandoFlorida`)
- **New in V1: filters** by speaker, series/playlist, branch and year, plus the existing live search
- Featured series row (examples of real playlists on the Apostle's channel: Marching Orders Conference, The Chadash Experience, Divine Visitation Series at Houston Texas, Chadash Midwest Experience, CMFI Maryland, RCN Hamilton)
- Card: thumbnail, duration, title, speaker, date. Click opens a modal embed (`youtube-nocookie.com`), plus "Open on YouTube"
- Recent real titles for realistic seed data: "Understanding The Apostolic Office", "The Reality Of The Unseen Realm", "Conquest And Spiritual Warfare", "How God Raises Men Of Spiritual Authority"
- Data: YouTube RSS for latest (no key) + YouTube Data API for playlists (server-side, cached). Never re-host video.

### 6.5 Events (`/events`, `/events/[slug]`)

Keep the two existing sections, make them look great:
- **From our branches:** retreats, conferences, special meetings
- **On the mission field:** where Apostle Arome is ministering next (shared data with the AAO site's itinerary if possible)

**New in V1:**
- **Event detail page** with date, venue, map, speakers, schedule, "Add to calendar" (.ics), **registration form** (name, email, phone, branch, number attending, notes) saving to Supabase with a confirmation email
- **Marching Orders Conference** as the flagship national conference template. **[PLACEHOLDER]** for dates, venue and schedule (the Apostle's YouTube has a Marching Orders Conference playlist to link for past sessions)
- Filters: network / branch / Apostle's itinerary
- Empty state: "Nothing on the calendar just yet. Join the newsletter and we'll tell you first." + signup

### 6.6 Branch template (`/branches/[slug]`)

The most important component. It should feel like a mini church website, not a database record.

**Sections (render only what has data; hide empty ones gracefully):**
1. **Hero:** branch name, city, a big photo of that branch gathering ([PLACEHOLDER] if none), one-line description, next meeting as a live countdown ("Next gathering: Sunday 11:00 AM · in 2 days"), CTAs `Plan a visit` · `Get directions`
2. **Meeting times:** weekly rhythm as clear cards (day, name, time, timezone, recurrence note e.g. "First Friday of the month", online join link if virtual)
3. **What to expect:** first-visit info: how long, what happens, dress, kids, who greets you. **[PLACEHOLDER]** copy per branch until leaders supply it; provide a sensible default network-wide version for leaders to approve, clearly marked as draft
4. **Leadership:** Pointman + team with photos ([PLACEHOLDER] portraits)
5. **Location:** address, map, `Open in Maps`, parking/transit notes
6. **Branch events**
7. **Branch messages:** from the branch YouTube channel if it has one, otherwise sermons tagged to the branch
8. **Get connected:** WhatsApp / Telegram group, Instagram, YouTube, Facebook
9. **Prayer + contact:** short form that routes to that branch's inbox
10. **Give:** button to `/giving?branch=[slug]`
11. **Other branches nearby** strip

**Branch extensions (optional sections, per-branch toggle):** weekly online classes, kids ministry, serve departments, signature gathering, custom logo. Orlando uses these.

### 6.7 RCN Boston (`/branches/boston`) — real data

- **Name:** Boston
- **City:** Littleton, MA
- **Description (existing):** "RCN Boston — apostolic teaching and community in the Greater Boston area."
- **Address:** 160 Ayer Road, Littleton, MA 01460, USA
- **Contact:** boston@rcnnorthamerica.com · +1 (781) 513-2716 / +1 (617) 592-1056
- **Meeting times:**
  - Sunday: Sunday Worship Service, 11:00 AM EST
  - Wednesday: Bible Study & Prayer, 7:00 PM EST
  - Friday: Monthly Vigil, 11:59 PM EST (first Friday of the month)
- **Leadership:** Minister Peter Mitch (Boston Pointman) · Minister Wellington Dornevile (Boston Leadership)
- **Socials:** Instagram `instagram.com/rcnboston` · YouTube `youtube.com/@RCNBoston-MA` (≈521 subscribers, ≈90 videos) · Facebook `facebook.com/p/RCN-Boston-61573080835704` · WhatsApp group link (from live site)
- **Brief asks for:** service times, address, map, parking/transit notes, plan-a-visit (what to expect, who greets you), Pointman + local team, local events + weekly schedule, Boston sermons + livestream, prayer/contact, Give (to RCN NA or a Boston fund), WhatsApp/Telegram group
- **[PLACEHOLDER]:** branch photos, leader portraits, parking/transit notes (Littleton is outside Boston; note it's reachable by car via Route 2 / I-495 and the MBTA Fitchburg Line has a Littleton/Route 495 station — **[CONFIRM]** with branch before publishing), "what to expect" copy
- **Reference:** parkstreet.org for visitor clarity

### 6.8 RCN Orlando, Florida (`/branches/orlando-florida`) — real data + brief

- **Name:** Orlando, Florida
- **City:** Orlando, FL
- **Description (existing):** "RCN Orlando — Central Florida gatherings for prayer and spiritual formation."
- **Address:** 12150 Pioneers Way, Orlando, FL 32832, USA
- **Contact:** orangecounty@rcnnorthamerica.com · +1 (407) 897-9648
- **Pointman:** Minister Mica-El Mumba
- **Socials:** Instagram `instagram.com/rcnorlandoflorida` · YouTube `youtube.com/@RCNOrlandoFlorida`

**Signature gathering: 7 Hour Prayer / 7 Hours Apostolic Gathering**
- Saturday, 9:00 AM–4:00 PM EST, **last Saturday of the month** (live site)
- Section: next date (auto-computed: last Saturday of the current/next month), what to expect, **RSVP via ChMeetings** ([PLACEHOLDER] ChMeetings RSVP link)
- **[CONFIRM]** preferred name: live site says "7 Hour Prayer", brief says "7 Hours Apostolic Gathering"

**Weekly rhythm (online, from the brief):**
- Monday: Discipleship
- Wednesday: Foundations
- Friday: Prayer
- Each with an online join link **[PLACEHOLDER] times + links**

**Kids:** room for newborn to 15, safe check-in, screened team (from brief)
**Serve:** join a department: worship, protocol, hospitality, children, media (form)
**Events:** conferences and Marching Orders
**Messages:** from 7 Hours and conferences, linked from YouTube
**Give:** to RCN NA or a Florida fund
**Brand:** RCN Florida logo throughout **[PLACEHOLDER] logo file**. Design the branch template so a branch logo can sit beside the RCN mark.

This is the Pointman's own branch page, so make it the best page in the build.

### 6.9 Plan a visit (`/branches/[slug]/visit`)

Short, friendly flow (life.church style):
1. Which gathering? (choose from the branch's meeting times)
2. Date (next 4 occurrences)
3. Name, email, phone, number of adults/kids
4. Anything we should know? (optional)

On submit: save to Supabase `visits`, email the branch inbox, send the visitor a confirmation with address, map link, time and "what to expect". Orlando can alternatively link out to ChMeetings.

### 6.10 Giving (`/giving`)

Existing intro: "Partner with the gospel in North America. Your generosity helps carry the Word, serve communities, and strengthen local churches."

- **Designation:** National (RCN North America) or a specific branch (dropdown, preselect from `?branch=`)
- Each designation has its own giving link/processor. The ministry confirmed **each branch has its own processor**. Store per-branch giving URLs in the database; the page just routes people to the right one.
- Sections already in the live design: Ways to give · Current giving goals · Stewardship updates. Keep them, with good empty states.
- **[PLACEHOLDER]** all giving links and methods. Do not show any account numbers.

### 6.11 Prayer, Testimonies, Newsletters, Gallery, Serve

- **Prayer:** keep the existing private model ("Requests are kept private and are seen only by authorized leaders"). Add a branch selector so requests route to the right branch inbox.
- **Testimonies:** keep moderated submission. Published wall + "Share your story" form. Never seed fake testimonies; use a beautiful empty state.
- **Newsletters:** archive cards + signup. Empty state with signup.
- **Gallery:** event albums (grid + lightbox). Empty state links to events.
- **Serve (`/serve`, new):** Tech & systems team interest form (from the brief) + department interest (worship, protocol, hospitality, children, media) with branch selector.

### 6.12 Internal team area (`/team`, login only)

Requested by the ministry: a private section for the internal team: policies, guidelines, refund forms.
- Supabase Auth, invite-only (no public signup)
- V1: login screen + a simple dashboard with placeholder sections: Policies, Guidelines, Forms (refund request form), Brand assets (logos, templates for branches)
- Must not be indexed (`noindex`, excluded from sitemap)
- **[PLACEHOLDER]** all documents

### 6.13 Admin (V1, simple)

Leaders log in to edit their branch: meeting times, events, leadership, socials, giving link, "what to expect" text, photos. Network admins can edit everything. Role per user: `network_admin` or `branch_admin` (scoped to a branch).

---

## 7. Design direction (creative freedom with guardrails)

**Mood:** warm, welcoming, alive. Where the AAO site is dark, cinematic and reverent (one man's ministry), RCN NA is **light, warm and communal** (a family of churches). Same family, different room. "Come as you are" should be felt.

**Shared with the AAO site (keep consistent):**
- Display font: **Cormorant Garamond** (headings, quotes, big numbers)
- UI/body font: **Manrope**
- Quote treatment, message cards, video modal, form styling

**RCN NA palette (suggested; adjust freely if you keep the spirit):**
```
--bg:          #FAF7F2   (warm ivory)
--surface:     #FFFFFF
--surface-alt: #F1EBE2
--ink:         #171412
--ink-muted:   #6B6158
--accent:      #DF6526   (existing RCN NA orange: keep for continuity)
--accent-deep: #B84A17
--gold:        #C8925F   (bridge to the AAO palette)
--night:       #14110F   (for dark feature sections, e.g. hero overlay, Marching Orders)
--line:        rgba(23,20,18,0.10)
```

**Guardrails**
- Real photography of real gatherings only. Use labeled placeholders until assets arrive; no stock photos of random churches passed off as RCN.
- Big confident type; generous spacing; mobile-first.
- Motion is subtle: fades, gentle parallax on hero, map pins animating in. Respect `prefers-reduced-motion`.
- Every empty state must look intentional and give a next action.
- Branch pages must look great with minimal data (only name, city, one meeting time) AND with full data (Orlando).
- Accessibility: WCAG 2.1 AA contrast (orange on white only for large text/buttons; check), keyboard navigation, focus states, alt text.

**Ideas you're free to run with:**
- A "network" visual motif: a North America map with glowing branch points that connects to each branch page
- Live "Happening now / Next gathering" ticker across branches
- Countdown to the next 7 Hour gathering on Orlando's page
- Branch pages with a local color accent pulled from each branch's logo

---

## 8. Technical spec

- **Next.js (App Router) + TypeScript + Tailwind CSS**, Vercel preview
- **Supabase** (Postgres + Auth + Storage). Mirror the live site's concepts so data can migrate:
  - `branches` (slug, name, city, region, country, description, address, lat, lng, email, phone, socials jsonb, giving_url, logo_url, hero_image_url, what_to_expect, parking_notes, extensions jsonb)
  - `meeting_times` (branch_id, day, title, start_time, end_time, timezone, recurrence_note, online_url)
  - `leaders` (branch_id nullable, name, title, photo_url, sort_order)
  - `events` (branch_id nullable, scope: network|branch|itinerary, title, slug, start_at, end_at, venue, address, description, registration_enabled, capacity, image_url)
  - `event_registrations`, `visits`, `prayer_requests` (branch_id), `testimonies` (status), `newsletter_signups`, `serve_signups`, `contact_messages`
  - `newsletters`, `gallery_albums`, `gallery_items`, `team_docs`
  - RLS: public reads published content and inserts submissions only; prayer requests readable only by leaders of that branch + network admins
- **Maps:** Mapbox GL (live site uses Mapbox) or MapLibre with free tiles. Geolocation "Nearest to me".
- **YouTube:** RSS for latest uploads per channel (no key), Data API v3 for playlists/series (server-side, cached via ISR ~30 min). Facade embeds for speed.
- **Email:** Resend for confirmations and branch notifications.
- **Spam:** Cloudflare Turnstile + honeypot on all public forms.
- **Calendar:** `.ics` download for events and meeting times.
- **Timezones:** store meeting times with IANA timezone; display in the visitor's local time with the branch time shown too.
- **SEO:** unique title + meta per page; Open Graph images (dynamic via `next/og`); JSON-LD `Church` / `PlaceOfWorship` per branch (address, geo, openingHours from meeting times), `Event` per event, `Organization` for RCN NA; sitemap.xml; robots.txt; one H1 per page.
  - Branch title pattern: `RCN Boston | Apostolic Church in Littleton, MA | RCN North America`
  - Target searches: "apostolic church near me", "[city] apostolic church", "RCN [city]", "Remnant Christian Network [city]", "Arome Osayi church [city]"
- **Performance:** Lighthouse mobile ≥ 90 across the board; LCP < 2.5s.
- **Footer credit:** small muted line "Built by Oasis Strategy × BrainChain Labs" **[CONFIRM]** with Mica-El before shipping.

---

## 9. Seed data rules

- Seed all 13 branches, leaders and meeting times from Section 6.3 / 6.7 / 6.8.
- Seed sermons from the live YouTube feeds (real).
- **Do not seed** fake events, testimonies, newsletters, gallery photos or giving goals. Leave them empty to show the empty states.
- Exception: one clearly labeled **sample** event card on `/events` ("Sample: Marching Orders Conference — dates TBA") so the ministry can see the event design. Label it "Sample" in the UI.

---

## 10. Scope

**V1 (this build)**
- All pages in Section 5 designed and working on preview
- Branch template + Boston + Orlando at full quality; other 11 branches render from data
- Plan-a-visit, event registration, prayer routing, serve form, newsletter signup working end-to-end
- Sermon filters
- Giving routing (links placeholdered)
- Internal team area (login + placeholder sections)
- Simple admin for branch leaders

**Later**
- Ask chatbot across the network (answers from the Apostle's messages; branch-aware)
- Merge into the live repo (needs repo + hosting access)
- Multi-language
- Online giving processor integration per branch

---

## 11. Acceptance criteria

- [ ] Home, About, Locations, Sermons, Events (+ detail), Giving, Prayer, Testimonies, Newsletters, Gallery, Serve, Team login: all built and responsive (360px → 1920px)
- [ ] `/branches/boston` and `/branches/orlando-florida` look like premium standalone church pages, with all real data from 6.7 and 6.8
- [ ] Any other branch slug renders cleanly from minimal data
- [ ] Locator works: search by city/ZIP + "Nearest to me" + map
- [ ] Next gathering countdown correct across timezones (incl. "last Saturday of the month" for Orlando and "first Friday" for Boston's vigil)
- [ ] Plan-a-visit, event registration, prayer, serve and newsletter forms save to Supabase and send emails
- [ ] Sermon filters work with real YouTube data
- [ ] Team area blocked without login and not indexed
- [ ] No invented content anywhere. Every placeholder is visibly labeled.
- [ ] Lighthouse mobile ≥ 90; JSON-LD validates

---

## 12. Open items for the ministry

1. Repo + hosting access to the live rcnnorthamerica.com (who built it?)
2. Photos/video of RCN NA gatherings, Boston and Orlando (media team)
3. RCN Florida logo; RCN NA logo as SVG
4. Orlando weekly class times + online join links; ChMeetings RSVP link
5. Next 7 Hour gathering date confirmation + preferred name ("7 Hour Prayer" vs "7 Hours Apostolic Gathering")
6. Boston parking/transit notes + "what to expect" copy; leader photos
7. Giving links per branch and for national
8. Next Marching Orders Conference details (dates, venue, registration)
9. Branch inbox emails for routing (prayer, visits, contact)
10. Internal team area: documents, policies, refund form fields, who gets access
11. Approval for the footer credit
