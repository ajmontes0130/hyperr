/**
 * Consent-gated deferred script loader.
 *
 * Scripts registered via registerDeferredScript() are only executed after
 * BOTH conditions are met:
 *   1. The user has accepted cookies (hyperr_consent = "accepted")
 *   2. The page has finished its first paint (window load + idle)
 *
 * If consent hasn't been given yet, scripts wait. When the user accepts
 * via the ConsentBanner, a 'hyperr:consent-change' event is dispatched
 * and pending scripts are flushed.
 */

const CONSENT_KEY = 'hyperr_consent';
const pending = [];
let listening = false;

export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw).choice;
  } catch {
    return null;
  }
}

/**
 * Register a script loader to run after consent + first paint.
 * @param {() => void} loader - function that injects/loads the third-party script
 */
export function registerDeferredScript(loader) {
  if (getConsent() === 'accepted') {
    runAfterPaint(loader);
  } else {
    pending.push(loader);
  }
}

function runAfterPaint(fn) {
  const exec = () => {
    try { fn(); } catch (e) { console.error('[analytics-loader]', e); }
  };
  if (document.readyState === 'complete') {
    if ('requestIdleCallback' in window) requestIdleCallback(exec);
    else setTimeout(exec, 300);
  } else {
    window.addEventListener('load', () => {
      if ('requestIdleCallback' in window) requestIdleCallback(exec);
      else setTimeout(exec, 300);
    }, { once: true });
  }
}

function flushPending() {
  if (getConsent() !== 'accepted') return;
  while (pending.length) {
    runAfterPaint(pending.shift());
  }
}

if (typeof window !== 'undefined' && !listening) {
  listening = true;
  window.addEventListener('hyperr:consent-change', flushPending);
  // Flush immediately in case consent was already given before this module loaded.
  flushPending();
}