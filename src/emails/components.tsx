import type { ReactNode } from "react";
import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";

export const colors = { ink: "#1a1918", ember: "#f2551d", emberStrong: "#b8400f", muted: "#6b6863", paper: "#f6f3ee", border: "#e7e2da" };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.paper, fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: 16, maxWidth: 560, overflow: "hidden" }}>
          <Section style={{ backgroundColor: colors.ink, padding: "20px 32px" }}>
            <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              MAYA LANE<span style={{ color: colors.ember }}>.</span>
            </Text>
          </Section>
          <Section style={{ padding: "32px" }}>{children}</Section>
          <Hr style={{ borderColor: colors.border, margin: 0 }} />
          <Section style={{ padding: "20px 32px" }}>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: "18px", margin: 0 }}>
              Maya Lane Shop · Made with love in Austin, TX ·{" "}
              <Link href={siteUrl} style={{ color: colors.muted }}>
                mayalane.shop
              </Link>
              <br />
              Questions? Just reply to this email. A real human on Maya&apos;s team reads every one.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return <Text style={{ color: colors.ink, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: "32px", margin: "0 0 12px" }}>{children}</Text>;
}

export function P({ children }: { children: ReactNode }) {
  return <Text style={{ color: colors.ink, fontSize: 15, lineHeight: "24px", margin: "0 0 16px" }}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={{ color: colors.muted, fontSize: 13, lineHeight: "20px", margin: "0 0 12px" }}>{children}</Text>;
}

export function CTA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      style={{ backgroundColor: colors.ember, borderRadius: 999, color: colors.ink, display: "inline-block", fontSize: 15, fontWeight: 700, padding: "14px 28px", textDecoration: "none" }}
    >
      {children}
    </Button>
  );
}

export { siteUrl };
