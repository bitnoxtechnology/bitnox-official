import type { ReactNode } from "react";

import { ActionButton } from "@/components/site/action-button";

/**
 * The shape of a 404 and of an error screen.
 *
 * There are five of these across the app: not-found and error at the root, the same two
 * inside the public route group, and one for the admin. Written once here, they say the same
 * thing in the same voice, and the pages themselves are left holding only what differs,
 * which is the message and where the reader should go next.
 *
 * Every one of them offers a way forward. A dead end with nothing but an apology on it is
 * how a visitor leaves the site, and a 404 on a page that once ranked is a visitor who was
 * looking for something real.
 */

export interface StatusAction {
  href: string;
  label: string;
}

export function StatusPage({
  code,
  title,
  description,
  action,
  secondaryAction,
  children,
}: {
  /** The HTTP status, shown small above the heading. Omitted where there is not one. */
  code?: string;
  title: string;
  description: ReactNode;
  action: StatusAction;
  secondaryAction?: StatusAction;
  /** A retry button, which only an error boundary has. */
  children?: ReactNode;
}) {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          {code ? (
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              Error {code}
            </p>
          ) : null}
          <h1 className="text-foreground text-section font-semibold">{title}</h1>
          <p className="text-muted-foreground text-lead mt-stack">{description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {children}
            <ActionButton href={action.href} variant={children ? "outline" : "default"}>
              {action.label}
            </ActionButton>
            {secondaryAction ? (
              <ActionButton href={secondaryAction.href} variant="outline" size="sm">
                {secondaryAction.label}
              </ActionButton>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
