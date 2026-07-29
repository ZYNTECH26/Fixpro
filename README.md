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

### `formEndpoint`

Paste a [Formspree](https://formspree.io) (`https://formspree.io/f/xxxxxxxx`) or
[Web3Forms](https://web3forms.com) endpoint to receive submissions by email.

While it's empty, submitting a form opens WhatsApp with the answers formatted
as a message, so requests still reach you rather than being silently discarded.

Both forms include a honeypot field for basic spam filtering.

## Before launch

Details only the business can supply are marked in the page with
`<span class="tbd">FILL IN: …</span>`, which renders as a red dashed chip —
impossible to miss, and easy to find:

```
grep -rn 'class="tbd"' *.html
```

Currently outstanding:

| Where | Detail |
|---|---|
| `index.html` | Guarantee period, call-out fee |
| `about.html` | Founder background / qualifications / coverage, guarantee period, commercial work |
| `contact.html` | Operating hours |

Also worth doing:

- Confirm the WhatsApp country code (see above)
- Set `formEndpoint` so submissions arrive by email rather than via WhatsApp
- Add a `sitemap.xml` and reference it from `robots.txt` once a real domain is live

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
