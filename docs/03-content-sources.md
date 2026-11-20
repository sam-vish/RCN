# Where every piece of content came from

Gathered on **20 Nov 2026**. Rule from the PRD: nothing invented. If it isn't from one of the
sources below, it's either labelled copy written for this redesign (UI labels, empty states, the
draft "what to expect") or a visible **To confirm** / **placeholder** marker.

## 1. The live rcnnorthamerica.com

The live site is a Next.js app; its pages embed their data in the React Server Components payload.
We decoded that payload instead of copying by hand, so the numbers match exactly.

| What | Where it lives now |
|---|---|
| All 13 branches: address, lat/lng, emails, phones, descriptions, socials (incl. WhatsApp links) | `content/branches.data.ts` (generated) |
| Every meeting time with day, time, timezone, recurrence note, Zoom details | same file, parsed into rules (e.g. "Last Saturday of the month" → `{kind:"nth", n:[-1]}`) |
| Branch leaders + which photo belongs to whom (from the image alt text) | same file; photos in `public/images/leaders/` |
| Long-form branch copy (Canada, Houston, Maryland/DMV) | `overview` in the same file |
| Mission, three instruments, core values, Lead Pastor quote, page intros | `content/words.ts` |
| 1,000-message sermon library (title, date, duration) | `content/sermons.snapshot.json` |
| 5 gathering photos (home page) | `public/images/gatherings/` |
| RCN flame mark (PNG) | `public/brand/rcn-mark-white.png`, traced to SVG in `components/layout/Brand.tsx` |
| Network socials: Instagram, Facebook, YouTube, Telegram, Rumble, Twitch | `content/site.ts` |

## 2. YouTube (public data only, never re-hosted)

- **Channels:** Apostle Arome Osayi `UCh6Sn6v_mdhwWTEpNvo5A4A`, RCN Boston `UCVD3b1UwhKYr3008c64FiAA`
  (84 livestreams), RCN Orlando `UC5MWMEqJ0e100z9iY2kPO9Q`, RCN Minnesota `UCjDkFYAXci9ec7-4Rzh3PNw`.
- **Branch playlists on the Apostle's channel** (RCN Houston Texas, RCN Maryland (DMV), RCN California,
  RCN Dallas, RCN Tulsa Oklahoma, RCN Hempstead New York, RCN Minnesota, RCN Canada, RCN Central
  Oklahoma, Marching Orders Conference, USA Apostolic Invasion, Partners Conference 2025 RCNNA, …)
  were used to tag messages by **branch** and **series**. Playlist IDs: `content/branches.ts`.
- **Speaker** is read from the video title (e.g. "EVANGELIST IKECHUKWU PETER"); otherwise the channel.
- **Live updates:** `lib/sermons.ts` merges the snapshot with the channels' RSS feeds every 30 min.
- **Past national gatherings** (Marching Orders 2026, Aug 14–15; USA Apostolic Invasion, Aug 22–23 2025;
  RCNNA Partners Conference, Mar 14–15 2025): dates are from the session titles. `content/events.ts`.

## 3. Footage (motion)

All moving images are cut from RCN's own livestreams, from the highest-bitrate 1080p stream YouTube
offers (HLS format 270, ~5 Mbps), at native resolution (no upscaling), lightly denoised, colour-graded
warm, with channel logos and watermarks cropped out. **Preview only: replace with original b-roll from the media team.**

| File (`public/video/`) | Source |
|---|---|
| `hero.*`, `hero-mobile.*` (17 s loop, 6 shots) | Marching Orders 2026 Day 2 Evening (`YrxzqftWxIg`), RCN Boston service with Dr. Arome Osayi (`6mXwOJ8CREs`) |
| `boston.*` | RCN Boston, "Arise, Shine" service (`6mXwOJ8CREs`) |
| `orlando.*` | RCN Orlando "Christ Crucified" livestream, 28 Dec 2025 (`PDMLddirEY0`) |
| `conference.*` | Marching Orders 2026 (`YrxzqftWxIg`) |
| `worship.*` | Marching Orders 2026 worship (`YrxzqftWxIg`) |

Re-cut with `scripts/render-footage.sh` (shot list at the bottom; needs ffmpeg and the source clips
in a `footage/` folder, gitignored). Download clips with a current yt-dlp that has a JS runtime, e.g.
`yt-dlp --js-runtimes node -f 270 …`; without one YouTube only exposes the ~2 Mbps stream (or 0.8 Mbps
for Orlando), which is what made the first cut look soft.

## 4. RCN Orlando's own livestream slides (28 Dec 2025)

Two slides in the "Christ Crucified" stream carried real, current-looking information:

- **"Events at RCN Florida":** Daily Prayers 10 PM–12 AM (Zoom), Wednesday Bible Study 10 PM–12 AM
  (Zoom), 7 Hours Prayer on the last Saturday (bi-monthly), in person, and a WhatsApp QR code.
  The QR decodes to `https://chat.whatsapp.com/DsHFlHr66PVJoz2WM6wH3Z` (used, marked to confirm).
- **Giving slide:** QR decodes to `https://secure.qgiv.com/for/remnantchristiannetworkorlandoflorida/`
  (used on Orlando's Give button, marked to confirm). The slide also shows Zelle and bank details;
  per the PRD **no account numbers appear on the site**.
- The RCN Florida logo on these slides (flame mark + "Remnant Christian Network / Florida") is
  recreated as a lockup in `BranchLockup` until the real logo file arrives.

## 5. aromeosayi.org (sister site)

Set Man facts (founded RCN in December 2006, headquarters in Makurdi, policy direction Isaiah 37:31)
and the Apostle's photo on the About page.

## 6. Client brief + PRD

Weekly class names for Orlando (Monday Discipleship, Wednesday Foundations, Friday Prayer), kids
(newborn–15, check-in, screened team), serve departments, Boston parking/transit notes. All shown
with **To confirm** markers where the brief itself said so.
