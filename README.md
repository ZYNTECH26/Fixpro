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
  phone: '0686851530',
  whatsapp: '',      // full international number, digits only
  formEndpoint: ''   // Formspree / Web3Forms URL
};
```

### `whatsapp`

Must be the **full international number** — country code, digits only, no
leading zero and no `+`. A South African `068 685 1530` becomes `27686851530`;
a Dutch `06 8685 1530` becomes `31686851530`.

While it's empty every WhatsApp button falls back to a phone call and relabels
itself, so nothing on the site is broken — it just isn't offering WhatsApp yet.

### `formEndpoint`

Paste a [Formspree](https://formspree.io) (`https://formspree.io/f/xxxxxxxx`) or
[Web3Forms](https://web3forms.com) endpoint to receive submissions by email.

While it's empty, submitting a form opens WhatsApp (or the phone dialler) with
the answers formatted as a message, so requests still reach you rather than
being silently discarded.

Both forms include a honeypot field for basic spam filtering.

## Before launch

The phone number is real; some business details are not filled in. Anything
still outstanding is wrapped in `<span class="tbd">`, which renders with a
dashed red underline so it's visible on the page:

```
grep -rn 'class="tbd"' *.html
```

Currently that covers the guarantee period, the call-out fee, operating hours,
whether you take commercial work, and the "about us" background on `/about`.

Also worth doing:

- Set `whatsapp` and `formEndpoint` in `assets/app.js`
- Add a `sitemap.xml` and reference it from `robots.txt` once a real domain is live
- Replace the placeholder background on `/about` with your own

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
