/* MAHWITA Repairs — shared site behaviour.
   Everything you'll realistically need to change lives in CONFIG below. */

const CONFIG = {
  // Used for tel: links. Displayed on the pages as 068 685 1537.
  phone: '0686851537',

  // WhatsApp needs a FULL INTERNATIONAL number: country code + number, digits only,
  // no leading zero and no "+".
  //
  // 27 is the South African dialling code, matching the 068 685 1537 format above.
  // If MAHWITA Repairs is NOT in South Africa this is wrong and messages will go nowhere —
  // swap 27 for your country code (e.g. 31 for the Netherlands).
  //
  // Set this to '' and every WhatsApp button quietly falls back to a phone call.
  whatsapp: '27686851537',

  // Where form submissions are emailed. Currently Web3Forms.
  // Set to '' and the forms fall back to the WhatsApp/phone handoff instead of
  // silently discarding the request.
  formEndpoint: 'https://api.web3forms.com/submit',

  // Web3Forms access key. This is public by design — it ships in client-side
  // JavaScript and is safe to commit. It only permits submissions to the inbox
  // it was issued for. Leave empty for providers that key off the URL alone
  // (Formspree, Getform, Basin).
  formAccessKey: '9677b1f9-bb03-47ca-a1df-e2d799cb8c86',

  // GoatCounter site code — the subdomain part of https://<code>.goatcounter.com
  // Sign up at goatcounter.com, then put just the code here (e.g. 'mahwita').
  //
  // While it's empty no analytics script loads at all, and /dashboard shows
  // setup instructions instead of stats.
  analyticsCode: ''
};

/* ---------- helpers ---------- */

const hasWhatsApp = () => /^\d{8,15}$/.test(CONFIG.whatsapp);

function waLink(message){
  if (!hasWhatsApp()) return 'tel:' + CONFIG.phone;
  const base = 'https://wa.me/' + CONFIG.whatsapp;
  return message ? base + '?text=' + encodeURIComponent(message) : base;
}

/* ---------- nav ---------- */

function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Collapse the mobile menu when a link is chosen.
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A'){
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- wire up WhatsApp links ---------- */

function initWhatsAppLinks(){
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    const msg = el.getAttribute('data-whatsapp');
    el.setAttribute('href', waLink(msg || ''));

    // Without a configured number these become plain calls — relabel so the
    // button never promises something it can't do.
    if (!hasWhatsApp()){
      const label = el.querySelector('[data-wa-label]');
      if (label) label.textContent = label.getAttribute('data-wa-fallback') || 'Call us';
    }
  });
}

/* ---------- footer year ---------- */

function initYear(){
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
}

/* ---------- forms ---------- */

function fieldError(input, message){
  const wrap = input.closest('.field');
  const slot = wrap && wrap.querySelector('.error');
  if (slot) slot.textContent = message || '';
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function validate(form){
  let firstBad = null;

  form.querySelectorAll('input,select,textarea').forEach(input => {
    if (input.type === 'hidden' || input.disabled) return;

    let message = '';
    if (input.required && !input.value.trim()){
      message = 'This field is required.';
    } else if (input.value.trim() && !input.checkValidity()){
      message = input.type === 'email' ? 'Enter a valid email address.' : 'Check this value.';
    }

    if (!fieldError(input, message) && !firstBad) firstBad = input;
  });

  if (firstBad){
    firstBad.focus();
    return false;
  }
  return true;
}

/* Turn the form into a readable WhatsApp message using each field's label. */
function formToMessage(form, heading){
  const lines = [heading];
  form.querySelectorAll('input,select,textarea').forEach(input => {
    if (input.type === 'hidden' || !input.value.trim()) return;
    const wrap = input.closest('.field');
    const label = wrap && wrap.querySelector('label');
    const name = label ? label.textContent.replace('*','').trim() : input.name;
    lines.push(name + ': ' + input.value.trim());
  });
  return lines.join('\n');
}

async function postToEndpoint(form, heading){
  const data = new FormData(form);

  // The honeypot is only useful to us — don't clutter the notification email.
  data.delete('_gotcha');

  if (CONFIG.formAccessKey) data.append('access_key', CONFIG.formAccessKey);

  // Give the email a useful subject. The contact form supplies its own via the
  // "subject" select, so only fall back to the form's heading when it's absent.
  if (!data.get('subject')) data.append('subject', heading);
  data.append('from_name', 'MAHWITA Repairs website');

  // So hitting reply in the inbox goes straight back to the customer.
  const email = data.get('email');
  if (email) data.append('replyto', email);

  const res = await fetch(CONFIG.formEndpoint, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: data
  });

  // Web3Forms answers 200 with {success:false} on a rejected submission,
  // so the status code alone isn't enough.
  let body = {};
  try { body = await res.json(); } catch (e) { /* non-JSON provider */ }

  if (!res.ok || body.success === false){
    throw new Error(body.message || 'Request failed with status ' + res.status);
  }
}

function initForms(){
  document.querySelectorAll('form[data-form]').forEach(form => {
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    const heading = form.getAttribute('data-message-heading') || 'New enquiry via the MAHWITA Repairs website';

    const say = (text, tone) => {
      if (!status) return;
      status.textContent = text;
      status.setAttribute('data-tone', tone);
    };

    // Clear an error as soon as the customer starts fixing it.
    form.addEventListener('input', e => {
      if (e.target.getAttribute('aria-invalid') === 'true') fieldError(e.target, '');
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      say('', '');

      // Honeypot: only a bot fills a field that's positioned off-screen.
      // Show the normal success message so it has nothing to learn from.
      const trap = form.querySelector('[name="_gotcha"]');
      if (trap && trap.value){
        say('Thanks — your request is in.', 'ok');
        return;
      }

      if (!validate(form)){
        say('Please correct the highlighted fields.', 'err');
        return;
      }

      const message = formToMessage(form, heading);

      // No endpoint configured: hand off to WhatsApp (or a call) so the
      // request actually reaches someone.
      if (!CONFIG.formEndpoint){
        say(
          hasWhatsApp()
            ? 'Opening WhatsApp with your details — press send there to finish.'
            : 'Opening your phone app — give us a call and we\'ll take the details.',
          'ok'
        );
        window.location.href = waLink(message);
        return;
      }

      submit.disabled = true;
      const originalLabel = submit.textContent;
      submit.textContent = 'Sending…';
      say('Sending your request…', 'ok');

      try {
        await postToEndpoint(form, heading);
        form.reset();
        say('Thanks — your request is in. We\'ll be in touch shortly to confirm a time.', 'ok');
      } catch (err) {
        // Never strand the customer: offer the WhatsApp route as a fallback.
        say('That didn\'t go through. Opening WhatsApp instead so your request isn\'t lost.', 'err');
        window.location.href = waLink(message);
      } finally {
        submit.disabled = false;
        submit.textContent = originalLabel;
      }
    });
  });
}

/* ---------- prefill the booking form from a ?service= link ---------- */

function initServicePrefill(){
  const select = document.getElementById('service');
  if (!select) return;

  const wanted = new URLSearchParams(window.location.search).get('service');
  if (!wanted) return;

  const match = Array.from(select.options).find(
    o => o.value.toLowerCase() === wanted.toLowerCase()
  );
  if (match) select.value = match.value;
}

/* ---------- homepage quick-start ---------- */

function initQuickStart(){
  const form = document.getElementById('quick-start');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const value = form.querySelector('select').value;
    window.location.href = value
      ? '/booking?service=' + encodeURIComponent(value)
      : '/booking';
  });
}

/* ---------- analytics ---------- */

const analyticsBase = () =>
  CONFIG.analyticsCode ? 'https://' + CONFIG.analyticsCode + '.goatcounter.com' : '';

/* GoatCounter counts a pageview per visit. It sets no cookies and stores no
   personal data, which is why the site needs no cookie banner. */
function initAnalytics(){
  if (!analyticsBase()) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', analyticsBase() + '/count');
  document.head.appendChild(s);
}

/* ---------- dashboard page ---------- */

function initDashboard(){
  const root = document.getElementById('dashboard');
  if (!root) return;

  const configured = !!analyticsBase();
  root.querySelector('[data-when="unset"]').hidden = configured;
  root.querySelector('[data-when="set"]').hidden = !configured;
  if (!configured) return;

  const base = analyticsBase();
  root.querySelectorAll('[data-stats-link]').forEach(a => { a.href = base; });

  const host = root.querySelector('[data-stats-host]');
  if (host) host.textContent = base.replace('https://', '');

  // Embed the live dashboard. GoatCounter only allows framing when the site is
  // set to public, so a visible link sits underneath as the reliable route.
  const frame = root.querySelector('iframe');
  if (frame) frame.src = base;
}

/* ---------- boot ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initWhatsAppLinks();
  initYear();
  initForms();
  initServicePrefill();
  initQuickStart();
  initAnalytics();
  initDashboard();
});
