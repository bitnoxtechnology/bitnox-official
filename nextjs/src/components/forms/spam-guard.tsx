"use client";

import { useEffect, useRef } from "react";

import { FORM_STARTED_FIELD, HONEYPOT_FIELD } from "@/lib/validations/spam-guard";

/**
 * The two hidden inputs behind the spam guard. Drop one of these inside every public form.
 *
 * Both are `<input type="hidden">`, which is the one native control the UI kit has no
 * business replacing: the shadcn `Input` is a visible field, and its height, border and
 * focus ring mean nothing on an element that never renders.
 *
 * The honeypot is genuinely hidden rather than moved off-screen, and it is marked
 * `aria-hidden` with a negative tab index as well, so no assistive technology announces it
 * and no keyboard user can land in it. A bot reading the markup fills it; a person cannot.
 *
 * The timestamp is written in an effect rather than during render, because these forms sit
 * on statically generated pages. Rendering `Date.now()` would bake the build time into the
 * HTML, and every visitor would then look like they had the form open since the deploy.
 */
export function SpamGuard() {
  const startedRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  return (
    <>
      <input
        type="hidden"
        name={HONEYPOT_FIELD}
        defaultValue=""
        tabIndex={-1}
        aria-hidden
        autoComplete="off"
      />
      <input ref={startedRef} type="hidden" name={FORM_STARTED_FIELD} defaultValue="" />
    </>
  );
}
