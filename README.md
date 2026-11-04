# R&R Law Associates — website

Static website for **R&R Law Associates** (Raza & Raza Law Associates), Lahore, built with [Astro](https://astro.build). The site has no server code: `npm run build` produces plain HTML, CSS and images in `dist/`, which can be hosted free on Cloudflare Pages or Netlify.

## 1. Run it on your computer

Requirements: **Node.js 22** (22.12 or newer) and npm.

```bash
npm install          # first time only
npm run dev          # http://localhost:4321 — live preview while you edit
npm run build        # builds the production site into dist/
npm run preview      # serves dist/ at http://localhost:4321
npm run check:site   # after a build: checks titles, links, headings, JSON-LD
```

> Astro is pinned to **7.4.1** because newer 7.4.x releases need Node 22.23.4+. If you upgrade Node, you can upgrade Astro with `npm i astro@latest`.

The build **fails on purpose** if any English page has a `<title>` outside 50–60 characters or a meta description outside 140–155 characters. The error message names the page and shows the current length.

## 2. Project layout

```
src/
  data/site.ts            ← firm details (NAP, hours, email, social, map, form key): edit here first
  data/ur.ts              ← Urdu names and summaries of practice areas
  content/practice-areas/ ← one Markdown file per practice area page
  content/guides/         ← legal guides (Markdown)
  content/advocates/      ← one Markdown file per advocate
  assets/images/          ← office photos and advocate portraits (optimised automatically)
  assets/brand/           ← logo files used in the header and footer
  components/             ← Header, Footer, SEO, ContactForm, FAQAccordion, cards, etc.
  layouts/                ← BaseLayout, PracticeAreaLayout, GuideLayout
  pages/                  ← one file per URL (ur/ holds the Urdu pages)
  lib/schema.ts           ← structured data (JSON-LD) builders
  lib/i18n.ts             ← English/Urdu interface text and the Urdu page pairs
  styles/global.css       ← the design system (colours, type, layout)
public/                   ← copied as-is: favicons, fonts, OG image, _headers, _redirects, robots.txt
scripts/prepare-assets.mjs← regenerates favicons, logos and the share image from assets-src/
scripts/verify-site.mjs   ← post-build checks
```

## 3. What still needs your input

Search the project for `PLACEHOLDER` to find every item. Run `npm run build && npm run check:site` to see which pages still show placeholder text.

| Item | Where to change it |
|---|---|
| **Domain** (currently `https://www.rrlawassociates.com`) | `astro.config.mjs` (`SITE_URL`), `src/data/site.ts` (`url`), `public/robots.txt` (and the Cloudflare Redirect Rule, see section 6) |
| **Office hours** | `src/data/site.ts` → `hours` (used on the site and in schema) |
| **Email** | `src/data/site.ts` → `email` (hidden until filled in) |
| **Google Maps listing URL** and **embed** | `src/data/site.ts` → `googleMapsUrl`, `googleMapsEmbedSrc` (Google Maps → Share → Embed a map → copy only the `src` URL) |
| **Exact map coordinates** | `src/data/site.ts` → `geo` (take them from the Google Business Profile pin) |
| **Facebook / Instagram / LinkedIn** | `src/data/site.ts` → `social` (icons appear in the footer once filled in) |
| **Web3Forms key** | `src/data/site.ts` → `web3formsAccessKey` (see section 5) |
| **Advocates** | `src/content/advocates/advocate-1.md` and `advocate-2.md`: name, enrolment, years of practice, education, bar memberships and biography |
| **Advocate photos** | replace `src/assets/images/advocate-1-portrait-rr-law-associates.jpg` (and `-2-`) with real portraits, ideally 4:5 portrait, at least 800 px wide |
| **Credentials strip** (home page) | `src/pages/index.astro`, section "2. Credentials" |
| **Founding details** | `src/pages/about.astro` |
| **Landmark and directions check** | `src/pages/contact.astro` and `src/pages/ur/contact/index.astro` |
| **Consultation fee policy** | `src/pages/process.astro` (first FAQ) |
| **Analytics** (if added later) | describe it in `src/pages/disclaimer.astro` |

**Renaming an advocate's URL:** rename `advocate-1.md` to the advocate's name, for example `muhammad-raza.md`, so the URL becomes `/advocates/muhammad-raza/`. Then update `author: "advocate-1"` in any guide in `src/content/guides/` to the new name. The build reports an error if a reference is missing.

**NAP consistency:** the name, address and phone in `src/data/site.ts` are used everywhere (footer, contact page, schema). They must match the Google Business Profile character for character: `R&R Law Associates, First Floor, Siddiqi Plaza, 7 Turner Road, Mozang Chungi, Lahore 54000, Pakistan, +92 343 4653357`.

## 4. Replacing images

- **Office photos:** put new JPGs in `src/assets/images/` with descriptive file names (for example `rr-law-associates-reception-lahore.jpg`) and update the `image:` path in the Markdown file or the `import` in the page. Astro creates AVIF/WebP versions in several sizes automatically.
- **Home page hero:** `src/pages/index.astro` and `src/pages/ur/index.astro` import `rr-law-associates-advocate-at-desk-lahore.jpg`. Change the import to use a different photo, and update the `alt` text.
- **Logo, favicons, share image:** replace `assets-src/logo-original.jpg` and run `npm run assets`. This regenerates the transparent logos, favicon set, apple-touch icon, manifest icons and the 1200×630 Open Graph image.

## 5. Connect the consultation form (Web3Forms, free)

1. Go to <https://web3forms.com>, enter the email address that should receive enquiries, and copy the **Access Key** they email you.
2. In `src/data/site.ts`, replace `'[ACCESS_KEY]'` with the key, for example `web3formsAccessKey: 'a1b2c3d4-…'`.
3. Rebuild and deploy. Send a test enquiry from the live site.

Until the key is set, the form shows a notice asking visitors to call or WhatsApp instead. The form has client-side validation, a honeypot field against spam bots, and success and error messages. In the Web3Forms dashboard you can also restrict submissions to your domain.

## 6. Deploy free on Cloudflare Workers (recommended)

The site deploys as a **Cloudflare Worker with static assets**. `wrangler.jsonc` in the project root tells Cloudflare to serve the built `dist/` folder and to use `dist/404.html` for missing pages. No server code or Cloudflare adapter is involved; the site stays fully static.

1. The code lives at <https://github.com/awaismalik47/R-RLawAssociate> (branch `main`).
2. Sign in at <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Import a repository**, connect GitHub and choose the repository.
3. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Environment variable (build): `NODE_VERSION` = `22`
4. Click **Deploy**. You get a free `rr-law-associates.<your-subdomain>.workers.dev` address. Every push to `main` rebuilds and redeploys automatically.

**Custom domain**

1. Add the domain to Cloudflare (**Add a domain**) and change the nameservers at your registrar to the two Cloudflare shows.
2. In the Worker → **Settings → Domains & Routes** → **Add** → **Custom domain**, enter `www.yourdomain.com`. Add `yourdomain.com` the same way.
3. Redirect the bare domain to `www`: in the domain's dashboard → **Rules → Redirect Rules** → **Create rule** → template **"Redirect from root to WWW"** (301, preserve path and query string). Host redirects like this cannot go in `public/_redirects` on Cloudflare.
4. Under **SSL/TLS → Edge Certificates**, turn on **Always Use HTTPS**. Certificates are issued automatically.

`public/_headers` adds HSTS, `X-Content-Type-Options`, `Referrer-Policy` and long cache lifetimes for fonts and built assets. `public/_redirects` holds path redirects (for example `/about-us` → `/about/`). Cloudflare static assets and Netlify both read these files.

## 7. Alternative: Netlify

1. Sign in at <https://app.netlify.com> → **Add new site** → **Import an existing project** → choose the repository.
2. Build command `npm run build`, publish directory `dist`. Under **Site configuration → Environment variables**, add `NODE_VERSION` = `22`.
3. Deploy. For a custom domain: **Domain management** → **Add a domain**, then follow Netlify's DNS instructions. HTTPS is automatic. Set the `www` version as the primary domain.

Netlify reads the same `public/_headers` and `public/_redirects` files. Netlify redirects the bare domain to the primary (`www`) domain automatically.

## 8. After launch

- Verify the site in **Google Search Console** and submit `https://www.yourdomain.com/sitemap-index.xml`.
- Test the home page, contact page, one practice page and one guide with Google's **Rich Results Test**.
- Put the website URL on the Google Business Profile, and make sure the profile's name, address and phone match the site exactly.
- Review the guides and practice pages at least once a year, and change the `updated:` date in their frontmatter. The date feeds the visible "last reviewed" line, the Article schema and the sitemap's `lastmod`.

## 9. Writing new content

- **New practice area:** copy an existing file in `src/content/practice-areas/`, change every frontmatter field (keep `seoTitle` to 50–60 characters and `description` to 140–155), and add an Urdu summary to `src/data/ur.ts`. It appears automatically on the hub, the home page and the footer.
- **New guide:** copy a file in `src/content/guides/`. `author` must be an advocate file name and `practiceArea` a practice-area file name. Write at least 1,000 words using `##` headings, which build the table of contents.
- **Ethics:** keep copy informational. Do not use "best", "top", "No. 1" or "leading", do not promise outcomes or quote success rates, and do not add testimonials or star ratings. `npm run check:site` flags some of these words.
