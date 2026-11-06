# Commercial insurance comparison site (white-label)

A ready-to-brand website for an insurance agency. A business owner answers eight questions (or uploads their current certificate of insurance), sees quotes from several carriers side by side, and requests the policy they want.

The site ships unbranded: the header says "Your Company Name" next to a "Your logo here" placeholder. Set it up for a client in a few minutes (see below).

Built with React, Vite and Framer Motion. Deploys to Vercel with no configuration.

## Set it up for a company

1. **Name, logo and contact details:** edit `src/brand.js`. The header, footer, page titles, legal pages, product screens and lead emails all read from it.
   - Put the logo in `public/` (SVG or PNG, about 32 px tall in the header) and set `logo: "/logo.svg"`. If the logo already includes the company name, also set `logoHasName: true`.
   - Set `legalName` to the agency's legal entity name. It appears in the footer and on the legal pages.
2. **Icons and share image:** replace `public/favicon.svg`, `public/apple-touch-icon.png` (180×180) and `public/og.png` (1200×630). The current files are neutral placeholders.
3. **Colors:** the palette is in `src/styles/base.css` under `:root` (light) and the dark-mode blocks. `--accent` is the yellow highlight, `--ink` and `--band` are the navy.
4. **Lead delivery:** set the environment variables in "Get leads in your inbox" so leads go to the client's inbox.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The `/api/lead` endpoint only runs on Vercel or with `npx vercel dev`.

## Deploy to Vercel

**From GitHub (recommended)**
1. Push this folder to a GitHub repository.
2. Go to https://vercel.com/new and import the repository.
3. Vercel detects Vite automatically. Keep the defaults (build command `npm run build`, output directory `dist`) and click **Deploy**.

**From your computer**
```bash
npx vercel        # first run links the project and creates a preview deployment
npx vercel --prod # deploys to production
```

`vercel.json` sends every page URL (`/quote/zip`, `/quotes`, `/checkout/...`) to the app, so deep links and refreshes work.

## Get leads in your inbox

Every quote request, callback request and policy request is sent to `POST /api/lead` (`api/lead.js`) and written to the Vercel function logs. To have leads delivered, add environment variables in **Vercel → Project → Settings → Environment Variables**, then redeploy:

| Variable | What it does |
| --- | --- |
| `RESEND_API_KEY` | API key from https://resend.com. Turns on lead emails. |
| `LEAD_NOTIFY_EMAIL` | Where lead emails go. Separate several addresses with commas. |
| `LEAD_FROM_EMAIL` | Optional sender, like `Your Company <leads@yourdomain.com>`. Needs your domain verified in Resend. Without it, Resend's test sender is used, which can only email the address on your Resend account. |
| `LEAD_WEBHOOK_URL` | Optional. Any URL that accepts a JSON POST: Zapier, Make, a Slack workflow, your CRM, or the Google Sheet below. |
| `SEND_CUSTOMER_EMAILS` | Optional. Set to `true` to email customers a copy of their quotes and a confirmation when they request a policy. Needs `RESEND_API_KEY` and `LEAD_FROM_EMAIL`. Never sent while `DEMO_QUOTES` is on. |

### Free lead log in Google Sheets

`docs/google-sheets-leads.gs` turns a Google Sheet into a lead log, with one row per lead. Setup steps are at the top of the file and take about two minutes. Paste the web app URL it gives you into `LEAD_WEBHOOK_URL`.

## Document upload (fast quotes for insured businesses)

Businesses that already have insurance can start at `/quote/upload` and drag in, browse to, paste, or photograph their certificate of insurance (ACORD 25), ACORD applications, declarations pages or loss runs. `api/documents.js` reads them with Claude and prefills the quote. The customer checks the results at `/quote/review`, and is asked only the questions the documents didn't answer.

| Variable | What it does |
| --- | --- |
| `ANTHROPIC_API_KEY` | Turns on automatic reading (create a key at https://console.anthropic.com). Without it, uploads still work: the files are emailed to you and the customer is told an advisor will follow up. |
| `ANTHROPIC_MODEL` | Optional. Defaults to `claude-opus-5-5`. |

Notes:
- With `RESEND_API_KEY` and `LEAD_NOTIFY_EMAIL` set, every upload is emailed to you with the files attached and what was read from them.
- Photos are compressed in the browser, and the total upload is capped at about 3 MB, because Vercel limits a function request to 4.5 MB. For larger files, add Vercel Blob storage later.
- Document contents are never written to logs. Only file names, types and sizes are.
- The request uses Claude's server-side safety fallback (`fallbacks: "default"`), so if a request is ever declined by a safety check, it's retried on another model automatically.

## Analytics

Page views are tracked with Vercel Web Analytics, which doesn't use cookies. Turn it on in **Vercel → Project → Analytics → Enable**. Nothing else is needed. Until you turn it on, the browser console shows a harmless 404 for `/_vercel/insights/script.js`.

## Industry pages

`/insurance/restaurants`, `/insurance/contractors` and 10 more pages are built from `src/data/industryPages.js`. Each one has a pre-filled quote button, so they work well as ad landing pages: send "restaurant insurance" ads to `/insurance/restaurants`. Add an industry by adding an entry to that file.

## Tests

```bash
npm test
```

Checks the pricing engine, ZIP-to-state lookup, business search and coverage recommendations.

## Before you launch

- **Company details:** fill in `src/brand.js` (name, logo, support email, phone, license line, domain). Empty contact fields stay hidden.
- **Real quotes:** the carriers in `src/data/carriers.js` are fictional, and `src/lib/pricing.js` calculates sample prices. Replace `computeQuotes()` with calls to carrier APIs or a commercial comparative rater, keeping the same return shape, then set `DEMO_QUOTES = false` in `src/config.js` to remove the "sample estimates" labels.
- **Licensing:** you need a property and casualty agency license in each state you sell in, plus carrier appointments, before binding policies.
- **Share image:** once you have a domain, change `og:image` in `index.html` to the full URL, such as `https://yourdomain.com/og.png`.
- **Legal pages:** `/privacy` and `/terms` (`src/pages/Legal.jsx`) are plain-language drafts that describe how this site handles data. Have an attorney review them. Insurance agencies have extra privacy duties, such as Gramm-Leach-Bliley privacy notices. The "Draft" label disappears when you set `DEMO_QUOTES = false`.

## How it's organized

```
api/lead.js                 Vercel function that receives leads
api/documents.js            Vercel function that reads uploaded insurance documents
src/brand.js                Company name, logo and contact details
src/config.js               The demo-quotes switch
src/data/                   Business types, coverage, carriers, states, form options
src/lib/pricing.js          Sample pricing engine (swap for real carrier quotes)
src/lib/store.jsx           Saves answers in the browser so people can resume
src/lib/leads.js            Sends leads to /api/lead
src/pages/Home.jsx          Landing page
src/pages/Quote.jsx         The 8-question quote form with live estimate
src/pages/Results.jsx       Quotes, sorting, compare and details
src/pages/Checkout.jsx      Start date, payment plan, business details
src/pages/Confirmation.jsx  What happens next
src/pages/IndustryPage.jsx  /insurance/:industry landing pages
src/pages/Legal.jsx         Privacy policy and terms of use
src/data/industryPages.js   Copy for the industry pages
src/styles/                 Design tokens (light and dark) and page styles
docs/google-sheets-leads.gs Google Sheets lead log
tests/                      npm test
```

`npm run build:artifact` makes a single-file preview build for claude.ai. Vercel doesn't use it.
