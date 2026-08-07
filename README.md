# MAHWITA Repairs

Marketing and booking site for MAHWITA Repairs, a domestic appliance repair business.
Static HTML, CSS and vanilla JavaScript — no build step, no dependencies.

## Pages

| Path | File | Purpose |
|---|---|---|
| `/` | `index.html` | Home — services overview, how it works, FAQ |
| `/services` | `services.html` | Per-appliance detail, common faults, what a visit involves |
| `/booking` | `booking.html` | Full repair booking form |
| `/about` | `about.html` | How the business works |
| `/contact` | `contact.html` | Contact details and general enquiry form |
| `/dashboard` | `dashboard.html` | Visitor stats for the client (`noindex`, unlinked) |
| `/coming-soon` | `coming-soon.html` | The original launch-countdown page (`noindex`) |
| — | `404.html` | Served automatically by Vercel on unknown paths |

Shared assets live in `assets/` — `styles.css` (all styling), `app.js` (all
behaviour), `favicon.svg`, `og-image.png` (social preview card).

## Design

Electrical palette, defined as tokens at the top of `assets/styles.css`:

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0B0F1E` | Page background — deep voltage navy |
| `--ink-deep` | `#070A15` | Alternating section bands |
| `--panel` | `#141A30` | Cards, form fields, header |
| `--volt` | `#9D8AFF` | Electric violet — the live accent, links, icons |
| `--volt-deep` | `#5B3FD9` | Solid buttons with light text |
| `--spark` | `#FFC93C` | Amber — step numbers only, a deliberate second signal |
| `--offwhite` | `#F3F4FA` | Body text |

Change a token and it propagates everywhere. The WhatsApp button keeps
WhatsApp's own green on purpose — recolouring it costs recognition.

Amber is used sparingly. If you spread it further, check contrast: it needs dark
text on top, never light.

## Configuration

Everything you'd realistically want to change is at the top of
[`assets/app.js`](assets/app.js):

```js
const CONFIG = {
  phone: '0686851537',
  whatsapp: '27686851537',
  formEndpoint: 'https://api.web3forms.com/submit',
  formAccessKey: '9677b1f9-…',
  analyticsCode: ''
};
```

### `phone`

Used for `tel:` links. Displayed on the pages as `068 685 1537`.

### `whatsapp`

Must be the **full international number** — country code, digits only, no
leading zero and no `+`.

`27` is the South African dialling code, chosen to match the `068 685 1537`
number format. **If MAHWITA Repairs is not in South Africa this is wrong** and
WhatsApp messages will go nowhere — replace `27` with the correct country code.

Set it to `''` and every WhatsApp button falls back to a phone call and
relabels itself, so nothing breaks.

### `formEndpoint` / `formAccessKey`

Submissions go to [Web3Forms](https://web3forms.com), which emails them to the
address the access key was issued for. The access key is **public by design** —
it ships in client-side JavaScript and is safe to commit.

`postToEndpoint()` adds `access_key`, a `subject`, `from_name`, and a `replyto`
taken from the customer's email, so replying in your inbox goes straight back to
them. The honeypot value is stripped before sending.

If the endpoint errors, the form falls back to the WhatsApp handoff rather than
losing the request.

Both forms use `novalidate` so the custom inline validation runs; without it the
browser's native bubbles fire first and the submit handler never sees the event.

### `analyticsCode`

**Currently empty — no analytics are being collected.**

Sign up free at [goatcounter.com](https://www.goatcounter.com/signup), choose a
site code (`mahwita` is the obvious one), and set `analyticsCode` to just that
code — not the full URL. That single value switches on tracking across every page
*and* populates `/dashboard`.

Then set the GoatCounter dashboard to **public** in its settings, so the client
can view stats without an account.

GoatCounter sets no cookies and stores no personal data, which is why the site
carries no cookie banner. Keep it that way — swapping in a tracker that does
would create a legal obligation this site isn't built for.

## SEO

In place:

- Unique `<title>` and meta description per page
- `rel=canonical` on every indexable page
- Open Graph and Twitter card tags, with a rendered 1200×630 `og-image.png`
- `sitemap.xml`, referenced from `robots.txt`
- JSON-LD on the home page: `LocalBusiness`, `WebSite`, and `FAQPage`
  (the FAQ markup mirrors the visible text exactly, which Google requires)
- `/dashboard` and `/coming-soon` are `noindex` and disallowed in `robots.txt`

### ⚠ The site URL is assumed

Every absolute URL — canonical tags, `og:url`, sitemap entries, JSON-LD — uses
`https://mahwita-repairs.vercel.app`. **If your Vercel project resolves to a different
subdomain, these are all wrong** and Google will index nothing useful.

Check the real URL in the Vercel dashboard, then find every occurrence:

```
grep -rl 'mahwita-repairs.vercel.app' . --exclude-dir=.git
```

and replace it. Do the same when you move to a custom domain.

### To actually appear in Google

The technical groundwork is done, but it doesn't put you in results by itself.
What moves the needle, in order:

1. **Submit the sitemap** in [Google Search Console](https://search.google.com/search-console).
   Nothing gets indexed quickly without this.
2. **Buy a real domain.** `vercel.app` subdomains rank poorly — the single
   biggest limitation right now.
3. **Create a Google Business Profile.** For a local repair trade this drives far
   more calls than the website will, and it's free.
4. **Add a real street address** to the site and the `LocalBusiness` JSON-LD.
   Local search is largely address-driven; the schema is deliberately
   address-free because none was supplied.
5. Expect several weeks before rankings settle. New sites are not indexed fast.

## Before launch

No `FILL IN` placeholders remain. But the site states business terms in front of
customers, and **these were chosen as sensible defaults, not supplied by the
owner** — check each still matches what you actually offer:

| Claim | Where | Value used |
|---|---|---|
| Repair guarantee | `index.html`, `about.html` | 3 months on parts and labour |
| Operating hours | `contact.html`, JSON-LD | Mon–Fri 08:00–17:00, Sat 08:00–13:00 |
| Commercial work | `about.html` | Light commercial accepted, case by case |
| WhatsApp country code | `assets/app.js` | `27` (South Africa) |

The call-out fee is deliberately **not** stated as a number — the copy says it's
confirmed at booking.

There's no founder or company-history section. That's intentional: it needs your
own words, and invented credentials are worse than none.

Also outstanding:

- **Send one real booking through the deployed site and confirm the email
  arrives.** The payload is verified field by field, but Web3Forms sits behind
  Cloudflare, which challenges automated requests — end-to-end delivery has not
  been confirmed from a live browser.
- Verify the `mahwita-repairs.vercel.app` URL is correct (see above). Every
  absolute URL in the SEO markup assumes the Vercel project is named
  `mahwita-repairs` — if you name it anything else, they are all wrong.

The `.tbd` style is kept for future placeholders — wrap anything unfinished in
`<span class="tbd">` and it renders as an obvious red chip:

```
grep -rn 'class="tbd"' *.html
```

## Local preview

Pages use root-relative links (`/services`), so serve them rather than opening
the files directly:

```
npx serve .
```

## Deploy

Hosted on Vercel as a static site. Pushes to `main` deploy to production
automatically. `vercel.json` enables `cleanUrls`, which makes `/services` resolve
to `services.html`.
