"use client";

import * as React from "react";

/**
 * The local draft, and the warning before leaving with unsaved work.
 *
 * Two hooks that solve the same problem from opposite ends. Autosave is what makes a closed
 * tab survivable; the beforeunload guard is what stops the tab being closed by accident in the
 * first place. Neither replaces saving to the database, and the editor says so on screen: this
 * is a recovery copy in one browser, not a version of the post anybody else can see.
 *
 * `localStorage` rather than the server, deliberately. A keystroke-frequency write to a server
 * action is a write per keystroke to Mongo, and the failure it protects against, a browser
 * closing or crashing mid-sentence, is entirely local. Writing to a server would also mean a
 * draft of a draft: two representations of an unsaved post, and a question about which one the
 * next person to open the record should see.
 */

/** Namespaced per record, so two posts open in two tabs do not overwrite each other. */
function storageKey(scope: string): string {
  return `bitnox:draft:${scope}`;
}

export interface StoredDraft {
  json: string;
  savedAt: number;
}

/**
 * Reads a stored draft, and treats anything unreadable as absent.
 *
 * Every access is wrapped: `localStorage` throws outright in a browser configured to block
 * site data, and in a private window it can be present and empty. A recovery convenience is
 * not worth an editor that fails to mount.
 */
export function readDraft(scope: string): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(storageKey(scope));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredDraft;

    return typeof parsed.json === "string" && typeof parsed.savedAt === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(scope: string): void {
  try {
    window.localStorage.removeItem(storageKey(scope));
  } catch {
    // Nothing to do. The draft was a convenience and the post is saved.
  }
}

/**
 * Writes the document to local storage, at most once every couple of seconds.
 *
 * Debounced rather than throttled: a writer types in bursts, and what matters is that the copy
 * is current a moment after they stop, not that it is written on a fixed cadence while they
 * are mid-sentence.
 */
export function useDraftAutosave(scope: string, json: string, dirty: boolean): number | null {
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!dirty) return;

    const timer = window.setTimeout(() => {
      try {
        const now = Date.now();
        window.localStorage.setItem(storageKey(scope), JSON.stringify({ json, savedAt: now }));
        setSavedAt(now);
      } catch {
        // Quota exceeded, or storage blocked. The editor keeps working.
      }
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [scope, json, dirty]);

  return savedAt;
}

/**
 * The browser's own "leave site?" prompt, while there are unsaved changes.
 *
 * The wording is the browser's and cannot be set, which is the point: a page that could write
 * its own message there would be a page that could lie about what leaving costs. All this does
 * is ask for the prompt.
 *
 * It covers closing the tab and following an external link. It does not cover a client-side
 * navigation inside the admin, which React handles without the browser ever unloading; the
 * editor's own links are what deal with that, and the autosaved copy is the backstop.
 */
export function useUnsavedGuard(dirty: boolean): void {
  React.useEffect(() => {
    if (!dirty) return;

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}
