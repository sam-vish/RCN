# Open items for the ministry

Everything the preview shows with a dashed **To confirm** marker or a striped placeholder, plus
things we noticed while gathering content. Set `NEXT_PUBLIC_SHOW_PENDING=false` to hide all markers.

## From the PRD (§12)

1. Repo + hosting access to the live rcnnorthamerica.com
2. Photos/video of RCN NA gatherings, Boston and Orlando (the motion is cut from livestreams for now)
3. RCN Florida logo; RCN NA logo as SVG (the mark is traced from the site's PNG)
4. Orlando weekly class **times + join links**; **ChMeetings RSVP link**
5. 7 Hours gathering: preferred name ("7 Hour Prayer" vs "7 Hours Apostolic Gathering") **and cadence**
6. Boston parking/transit + "what to expect" copy; leader photos for the wider team
7. Giving links per branch and national (only Orlando has one so far, see below)
8. Next Marching Orders Conference: dates, venue, schedule, registration
9. Branch inbox emails for routing (prayer, visits, contact)
10. Team area: documents, policies, refund form fields, who gets access
11. Footer credit approval ("Built by Oasis Strategy × BrainChain Labs")

## Found while gathering content (need a decision)

| # | What we found | What the preview does |
|---|---|---|
| A | **Orlando cadence conflict.** Live site: 7 Hour Prayer on the *last Saturday of the month*. Orlando's Dec 2025 stream slide: *"Last Saturday (Bi-monthly)"*. | Countdown uses last Saturday monthly; marked to confirm. |
| B | **Orlando weekly schedule conflict.** Brief: Mon Discipleship / Wed Foundations / Fri Prayer. Stream slide: Daily Prayers + Wednesday Bible Study, both 10 PM–12 AM on Zoom. | Shows the brief's three classes, times "coming"; marked to confirm. |
| C | **Orlando contact details differ.** Live site: orangecounty@rcnnorthamerica.com, +1 (407) 897-9648. Stream slide: contact@rcnorlando.org, +1 (407) 434-1898 (rcnorlando.org doesn't resolve). | Uses the live-site details. |
| D | **Orlando giving + WhatsApp** decoded from stream QR codes (Qgiv page, WhatsApp community). | Both shown, marked to confirm. |
| E | **Two different photos of Rev. Philip Gbir** on the live site (home page vs Dallas page). | Network roster uses the home-page photo; Dallas uses the branch-page one. Please confirm. |
| F | **Giving details in YouTube descriptions** (PayPal, CashApp, Zelle, a Nigerian bank account) and on Boston's stream slide. | Not used. Each branch's link should come from the branch. |
| G | **Maryland (DMV) meeting dates are for June 2026** ("June 7, 14, 21 and 28"…). | Shown with a "confirm current schedule" marker; no countdown. |
| H | **Boston's "21 Days Fasting & Prayer"** (June 1–21, 2026) is still listed on the live site. | Hidden automatically (expired). |
| I | **Oklahoma City** has no meeting times; **Dallas** has no phone number. | Template shows a "times coming soon" state. |
| J | Dallas "Midweek Service" is listed at **Wednesday 10:00 PM** CDT, unusual for an in-person service. | Shown as listed; worth a quick check. |
| K | The PRD lists Minnesota leadership as "(HQ)"; the live site lists **Dr. Arome Osayi** as Minnesota Leadership. | Follows the live site. |
| L | **Fonts.** The PRD says the live site uses a system font and asks for the AAO pairing; the live site actually uses Sora + Source Sans 3. | Uses Sora + Source Sans 3 for continuity with the current site (one-line swap back). |

## Preview-only behaviour to switch at launch

- `ROUTE_TO_BRANCH_INBOXES=true` to email real branch inboxes (preview sends everything to `NETWORK_INBOX`).
- Replace footage with original b-roll, then re-run `scripts/render-footage.sh`.
- `NEXT_PUBLIC_SHOW_PENDING=false` once the items above are resolved.
