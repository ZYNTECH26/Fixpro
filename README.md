# FixPro

Marketing and booking site for FixPro, a domestic appliance repair business.
Static HTML, CSS and vanilla JavaScript — no build step, no dependencies.

## Pages

| Path | File | Purpose |
|---|---|---|
| `/` | `index.html` | Home — services overview, how it works, FAQ |
| `/services` | `services.html` | Per-appliance detail, common faults, what a visit involves |
| `/booking` | `booking.html` | Full repair booking form |
| `/about` | `about.html` | How the business works |
| `/contact` | `contact.html` | Contact details and general enquiry form |
| `/coming-soon` | `coming-soon.html` | The original launch-countdown page (kept, `noindex`) |
| — | `404.html` | Served automatically by Vercel on unknown paths |

Shared assets live in `assets/` — `styles.css` (all styling), `app.js` (all
behaviour), `favicon.svg`.

## Configuration

Everything you'd realistically want to change is at the top of
[`assets/app.js`](assets/app.js):

```js
const CONFIG = {
  phone: '0686851537',
  whatsapp: '27686851537',
  formEndpoint: ''
};
```

### `phone`

Used for `tel:` links. Displayed on the pages as `068 685 1537`.

### `whatsapp`

Must be the **full international number** — country code, digits only, no
leading zero and no `+`.

`27` is the South African dialling code, chosen to match the `068 685 1537`
number format. **If FixPro is not in South Africa this is wrong** and WhatsApp
messages will go nowhere — replace `27` with the correct country code (e.g.
`31` for the Netherlands, giving `31686851537`).

Set it to `''` and every WhatsApp button falls back to a phone call and
relabels itself, so nothing breaks.

### `formEndpoint` / `formAccessKey`

Submissions go to [Web3Forms](https://web3forms.com), which emails them to the
address the access key was issued for.

The access key is **public by design** — it ships in client-side JavaScript, and
is safe to commit. It only allows submissions to its own inbox.

`postToEndpoint()` adds `access_key`, a `subject`, `from_name`, and a `replyto`
taken from the customer's email address, so replying in your inbox goes straight
back to them. The honeypot value is stripped before sending.

Swapping providers: for Formspree, Getform or Basin, put their URL in
`formEndpoint` and set `formAccessKey` to `''` — they key off the URL alone.

If the endpoint errors, the form falls back to the WhatsApp handoff rather than
losing the request. Set `formEndpoint` to `''` to use that path deliberately.

Both forms use `novalidate` so the custom inline validation in `app.js` runs;
without it the browser's native bubbles fire first and the submit handler never
sees the event.

## Before launch

No `FILL IN` placeholders remain. But the site now states business terms in
front of customers, and **these were chosen as sensible defaults, not supplied
by the owner** — check each one still matches what you actually offer:

| Claim | Where | Value used |
|---|---|---|
| Repair guarantee | `index.html`, `about.html` | 3 months on parts and labour |
| Operating hours | `contact.html` | Mon–Fri 08:00–17:00, Sat 08:00–13:00, closed Sun |
| Commercial work | `about.html` | Light commercial accepted, case by case |
| WhatsApp country code | `assets/app.js` | `27` (South Africa) |

The call-out fee is deliberately **not** stated as a number — the copy says it's
confirmed at booking. Add a figure only if you want to commit to it publicly.

There's no founder or company-history section. That's intentional: it needs your
own words, and invented credentials are worse than none. `/about` reads fine
without one — add it when you're ready.

Also worth doing:

- **Send one real booking through the deployed site and confirm the email
  arrives.** The payload has been verified field by field, but Web3Forms sits
  behind Cloudflare, which challenges automated requests — so end-to-end
  delivery has not been confirmed from a live browser.
- Add a `sitemap.xml` and reference it from `robots.txt` once a real domain is live

The `.tbd` style in `styles.css` is kept for future placeholders — wrap anything
unfinished in `<span class="tbd">` and it renders as an obvious red chip:

```
grep -rn 'class="tbd"' *.html
```

## Local preview

The pages use root-relative links (`/services`), so open them through a server
rather than double-clicking the files:

```
npx serve .
```

## Deploy

Hosted on Vercel as a static site. Pushes to `main` deploy to production
automatically. `vercel.json` enables `cleanUrls`, which is what makes
`/services` resolve to `services.html`.
