import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

import { BUSINESS } from "@/content/business";

/**
 * The shell every transactional email uses.
 *
 * Email clients ignore most of a stylesheet, so the styling is inline and the layout is a
 * single column. The brand appears as the accent rule and the wordmark rather than as a dark
 * background, because dark bodies are what many clients invert badly.
 */

const styles = {
  body: {
    backgroundColor: "#f4f6f8",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "32px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    borderTop: "4px solid #05e4fc",
    margin: "0 auto",
    maxWidth: "520px",
    padding: "32px",
  },
  wordmark: {
    color: "#0a0a0a",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    margin: "0 0 24px",
  },
  divider: { borderColor: "#e2e8f0", margin: "28px 0 16px" },
  footer: { color: "#64748b", fontSize: "12px", lineHeight: "18px", margin: 0 },
} as const;

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>{BUSINESS.legalName}</Text>
          {children}
          <Hr style={styles.divider} />
          <Section>
            <Text style={styles.footer}>
              {BUSINESS.streetAddress}, {BUSINESS.locality}, {BUSINESS.region}, {BUSINESS.country}
              <br />
              {BUSINESS.phone} | {BUSINESS.email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  heading: {
    color: "#0a0a0a",
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: "28px",
    margin: "0 0 12px",
  },
  paragraph: {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  small: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 8px",
  },
  code: {
    backgroundColor: "#0a0a0a",
    borderRadius: "10px",
    color: "#05e4fc",
    display: "block",
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
    fontSize: "32px",
    fontWeight: 700,
    letterSpacing: "0.24em",
    margin: "0 0 20px",
    padding: "20px 0",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#05e4fc",
    borderRadius: "8px",
    color: "#0a0a0a",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 24px",
    textDecoration: "none",
  },
  link: {
    color: "#0369a1",
    fontSize: "13px",
    lineHeight: "20px",
    wordBreak: "break-all",
  },
} as const;
