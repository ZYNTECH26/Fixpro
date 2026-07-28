# FixPro — Coming Soon

Static single-page "coming soon" site for FixPro, with a countdown to midnight
(local time) and an email notify form.

## Files

- `index.html` — the entire page (inline CSS + JS, no build step)
- `vercel.json` — Vercel static hosting config

## Local preview

Open `index.html` in a browser, or serve it:

```
npx serve .
```

## Deploy

Hosted on Vercel as a static site. Pushes to `main` deploy to production
automatically once the repo is connected.

## Notes

- The notify form is not wired to a backend yet — hook it up to an email
  service (Mailchimp, ConvertKit, a form endpoint) to collect real signups.
- The countdown targets the next local midnight in the visitor's timezone.
