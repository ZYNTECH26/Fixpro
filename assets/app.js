/* FixPro — shared site behaviour.
   Everything you'll realistically need to change lives in CONFIG below. */

const CONFIG = {
  // Used for tel: links. Displayed on the pages as 068 685 1537.
  phone: '0686851537',

  // WhatsApp needs a FULL INTERNATIONAL number: country code + number, digits only,
  // no leading zero and no "+".
  //
  // 27 is the South African dialling code, matching the 068 685 1537 format above.
  // If FixPro is NOT in South Africa this is wrong and messages will go nowhere —
  // swap 27 for your country code (e.g. 31 for the Netherlands).
  //
  // Set this to '' and every WhatsApp button quietly falls back to a phone call.
  whatsapp: '27686851537',

  // Paste a Formspree ('https://formspree.io/f/xxxxxxxx') or Web3Forms endpoint here
  // to receive form submissions by email. While it's empty, the booking form falls
  // back to the WhatsApp/phone handoff instead of silently discarding the request.
  formEndpoint: ''
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

async function postToEndpoint(form){
  const res = await fetch(CONFIG.formEndpoint, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(form)
  });
  if (!res.ok) throw new Error('Request failed with status ' + res.status);
}

function initForms(){
  document.querySelectorAll('form[data-form]').forEach(form => {
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    const heading = form.getAttribute('data-message-heading') || 'New enquiry via the FixPro website';

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
        await postToEndpoint(form);
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

/* ---------- boot ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initWhatsAppLinks();
  initYear();
  initForms();
  initServicePrefill();
  initQuickStart();
});
