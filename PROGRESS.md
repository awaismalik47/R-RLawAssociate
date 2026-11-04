# Build progress (updated 2026-11-04)

The full brief is in the first message of the original Claude Code session (cf68055f…, started from ~).

## Status: site complete, waiting on client details

All 28 pages are built and verified (`npm run build && npm run check:site`). See README.md section 3 for every placeholder and where to change it.

## Changes the client asked for after the brief
- Homepage hero image is `rr-law-associates-advocate-at-desk-lahore.jpg` (EN and UR).
- advocate-1 is the **Principal Advocate** (`role: "principal"`), shown in a featured block on /advocates/ and the homepage; other advocates are Associate Advocates. "Leading" is not used because it is banned by the brief's ethics rules.
- Homepage practice areas use an auto-advancing slider (`src/components/PracticeSlider.astro`). It pauses on hover, focus and touch, has a pause button, and does not move for visitors who prefer reduced motion. The brief originally said no auto-playing carousels; the client chose this.

## Lighthouse (mobile, local build)
Home 99/100/100/100, practice page 99/100/100/100, contact 99/100/100/100, guide 95+/100/100/100, Urdu home ~93/100/100/100 (LCP about 3s from the 160 KB Noto Nastaliq font).

## Waiting on client
Advocate names, enrolment, years, education, bar memberships and bios; associate portrait(s); credentials strip; founding details; office hours; email; Google Maps listing URL and pin; social links; domain; Web3Forms key; consultation fee policy; landmark and a check of the written directions.
