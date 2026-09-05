"use client";

import * as React from "react";
import type { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";

/**
 * The bridge between the upload components and react-hook-form.
 *
 * An image reaches the server as one hidden input holding JSON, because `FormData` is flat and
 * the alternative is a `cover[url]` naming convention that every action then has to reassemble
 * by hand. That makes the form's own value for the field a string, while the component editing
 * it wants an object.
 *
 * This hook is that conversion, in one place. Without it every admin form repeats the same
 * parse-and-stringify pair and one of them eventually forgets the `undefined` case, which is
 * how a cleared cover image gets submitted as the string `"undefined"`.
 *
 * Reading is guarded because the string comes back from the form and could be anything the
 * last render put there; a value that will not parse is treated as no value, which is what an
 * empty field means anyway.
 */
export function useJsonField<TValues extends FieldValues, TValue>(
  form: UseFormReturn<TValues>,
  name: Path<TValues>,
): [TValue | undefined, (next: TValue | undefined) => void] {
  const raw = form.watch(name) as unknown;

  const value = React.useMemo<TValue | undefined>(() => {
    if (typeof raw !== "string" || raw.trim() === "") return undefined;

    try {
      return JSON.parse(raw) as TValue;
    } catch {
      return undefined;
    }
  }, [raw]);

  const setValue = React.useCallback(
    (next: TValue | undefined) => {
      form.setValue(
        name,
        (next === undefined ? "" : JSON.stringify(next)) as PathValue<TValues, Path<TValues>>,
        { shouldDirty: true },
      );
    },
    [form, name],
  );

  return [value, setValue];
}
