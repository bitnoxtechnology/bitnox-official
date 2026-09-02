import { Link, Text } from "@react-email/components";

import { EmailLayout, emailStyles } from "@/lib/mail/templates/email-layout";

/**
 * Confirmation that an address is on the newsletter list.
 *
 * The unsubscribe link is in the first message rather than only in later ones. Somebody who
 * changes their mind immediately should not have to wait for a post they did not want in
 * order to get off the list, and a list nobody can leave is the one that gets marked as spam.
 */

export interface NewsletterWelcomeEmailProps {
  /** Absolute one-click unsubscribe URL carrying the subscriber's token. */
  unsubscribeUrl: string;
  /** Absolute URL of the blog index, so the first email has somewhere to go. */
  blogUrl: string;
}

export function NewsletterWelcomeEmail({ unsubscribeUrl, blogUrl }: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout preview="You are on the Bitnox list">
      <Text style={emailStyles.heading}>You are on the list</Text>
      <Text style={emailStyles.paragraph}>
        Thank you for subscribing. You will get an email when we publish something worth your time:
        what we have built, what we learned building it, and news from the Event Space and the
        training programme. A few times a month at most.
      </Text>
      <Text style={emailStyles.paragraph}>Everything published so far is on the blog.</Text>
      <Link href={blogUrl} style={emailStyles.link}>
        {blogUrl}
      </Link>
      <Text style={{ ...emailStyles.small, marginTop: "20px" }}>
        Changed your mind? Leave the list in one click, no questions asked.
      </Text>
      <Link href={unsubscribeUrl} style={emailStyles.link}>
        Unsubscribe
      </Link>
    </EmailLayout>
  );
}

export function newsletterWelcomeText({
  unsubscribeUrl,
  blogUrl,
}: NewsletterWelcomeEmailProps): string {
  return [
    "You are on the list.",
    "",
    "Thank you for subscribing. You will get an email when we publish something worth your",
    "time: what we have built, what we learned building it, and news from the Event Space and",
    "the training programme. A few times a month at most.",
    "",
    `Everything published so far is on the blog: ${blogUrl}`,
    "",
    `Changed your mind? Unsubscribe here: ${unsubscribeUrl}`,
  ].join("\n");
}
