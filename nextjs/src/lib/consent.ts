/**
 * Analytics consent, in the browser.
 *
 * Bitnox operates in the United Kingdom as well as Nigeria, so the UK GDPR and PECR apply to
 * anybody reading this site from there, and the privacy policy already names consent as the
 * lawful basis for non-essential analytics. This file is what makes that statement true
 * rather than aspirational.
 *
 * The mechanism is Google Consent Mode v2 rather than withholding the Tag Manager script
 * until a click. Consent Mode is what Google's own tags read, and it covers the case that
 * blocking the container does not: a container holds tags this site did not write, and
 * loading it late says nothing about what those tags are then allowed to store. With
 * `analytics_storage` defaulting to denied, a tag that fires before an answer stores nothing
 * and sets no cookie, and the same tag starts storing the moment consent is granted, without
 * a page reload.
 *
 * The choice is kept in `localStorage` rather than in a cookie, because a cookie recording
 * that somebody declined cookies is a joke the ICO has heard, and because nothing on the
 * server needs to read it: the whole decision happens in the browser, and the pages are
 * statically generated, so a value that varied per visitor could not reach them anyway.
 *
 * Every read is wrapped, because `localStorage` throws rather than returning null in a
 * browser configured to block site data, and a thrown exception in the banner would leave the
 * page without one.
 */

export type ConsentChoice = "granted" | "denied";

/** Namespaced, so it is obvious what wrote it when somebody opens the storage inspector. */
export const CONSENT_STORAGE_KEY = "bitnox.consent.analytics";

/** Dispatched on `window` by the footer link, listened for by the banner. */
export const CONSENT_SETTINGS_EVENT = "bitnox:consent-settings";

declare global {
  interface Window {
    /** Defined by the consent defaults script in the root layout, before anything else runs. */
    gtag?: (...args: unknown[]) => void;
  }
}

export function readConsent(): ConsentChoice | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Record the answer and tell the tags about it.
 *
 * The storage write and the Consent Mode update are one operation as far as the rest of the
 * application is concerned. Doing one without the other produces the two states that are
 * hardest to notice: a banner that never comes back but never granted anything, and analytics
 * that quietly reverts to denied on the next page.
 */
export function setConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // A browser blocking site data will ask again next time, which is the correct outcome.
  }

  window.gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  });
}

/**
 * The banner's open state, as an external store.
 *
 * It is not React state, because the thing it reflects is not in React: it lives in
 * `localStorage`, which does not exist while the page is being prerendered, and it is changed
 * by a button in the footer that is nowhere near the banner in the tree. `useSyncExternalStore`
 * is the API for exactly that shape, and it is what lets the banner render nothing on the
 * server and the correct thing on the client without a hydration mismatch and without setting
 * state from inside an effect.
 *
 * `snapshot` is cached rather than recomputed on every call, because `useSyncExternalStore`
 * compares the value it gets back by identity and a function that recomputed would re-render
 * forever.
 */

let promptForced = false;
let promptSnapshot: boolean | undefined;

const promptListeners = new Set<() => void>();

function computePrompt(): boolean {
  return promptForced || readConsent() === null;
}

function publishPrompt(): void {
  promptSnapshot = computePrompt();
  for (const listener of promptListeners) listener();
}

export function subscribeConsentPrompt(listener: () => void): () => void {
  promptListeners.add(listener);

  const reopen = () => {
    promptForced = true;
    publishPrompt();
  };

  window.addEventListener(CONSENT_SETTINGS_EVENT, reopen);

  return () => {
    promptListeners.delete(listener);
    window.removeEventListener(CONSENT_SETTINGS_EVENT, reopen);
  };
}

export function consentPromptSnapshot(): boolean {
  promptSnapshot ??= computePrompt();
  return promptSnapshot;
}

/** Nothing is asked during prerendering. There is no browser to have answered yet. */
export function consentPromptServerSnapshot(): boolean {
  return false;
}

/** Record the answer, tell the tags, and close the banner. */
export function answerConsent(choice: ConsentChoice): void {
  setConsent(choice);
  promptForced = false;
  publishPrompt();
}
