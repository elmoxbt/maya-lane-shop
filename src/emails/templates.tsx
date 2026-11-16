import { Column, Img, Link, Row, Section, Text } from "@react-email/components";
import { CTA, EmailLayout, H1, Muted, P, colors, siteUrl } from "./components";
import { formatPriceExact, orderNumber } from "@/lib/format";

export function MagicLinkEmail({ url }: { url: string }) {
  return (
    <EmailLayout preview="Your sign-in link for Maya Lane Shop">
      <H1>Your sign-in link</H1>
      <P>Tap the button below to sign in to your Maya Lane account. The link works once and expires in 24 hours.</P>
      <Section style={{ margin: "24px 0" }}>
        <CTA href={url}>Sign in to Maya Lane</CTA>
      </Section>
      <Muted>If you didn&apos;t ask for this, you can safely ignore this email.</Muted>
    </EmailLayout>
  );
}

export type EmailOrder = {
  number: number;
  email: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  hasPhysical: boolean;
  shippingName?: string | null;
  shippingAddress?: { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null } | null;
  items: { name: string; variantLabel: string | null; quantity: number; unitPriceCents: number; imageUrl: string | null }[];
};

export type EmailDownload = { name: string; url: string };

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Row>
      <Column>
        <Text style={{ color: bold ? colors.ink : colors.muted, fontSize: 14, fontWeight: bold ? 700 : 400, margin: "4px 0" }}>{label}</Text>
      </Column>
      <Column align="right">
        <Text style={{ color: colors.ink, fontSize: 14, fontWeight: bold ? 700 : 400, margin: "4px 0" }}>{value}</Text>
      </Column>
    </Row>
  );
}

export function OrderConfirmationEmail({ order, downloads, orderUrl }: { order: EmailOrder; downloads: EmailDownload[]; orderUrl: string }) {
  const addr = order.shippingAddress;
  return (
    <EmailLayout preview={`Order ${orderNumber(order.number)} confirmed. Thank you!`}>
      <H1>You&apos;re the best. Order confirmed!</H1>
      <P>
        Thank you so much for supporting my small business. It genuinely means the world. Your order{" "}
        <strong>{orderNumber(order.number)}</strong> is confirmed
        {order.hasPhysical ? " and we'll email you a tracking number as soon as it ships." : "."}
      </P>
      <P>— Maya</P>

      {downloads.length > 0 && (
        <Section style={{ backgroundColor: colors.paper, borderRadius: 12, margin: "8px 0 24px", padding: "16px 20px" }}>
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>Your downloads</Text>
          {downloads.map((d) => (
            <Text key={d.url} style={{ fontSize: 14, margin: "6px 0" }}>
              <Link href={d.url} style={{ color: colors.emberStrong, fontWeight: 700 }}>
                ↓ {d.name}
              </Link>
            </Text>
          ))}
          <Muted>These links expire in 72 hours. You can always get fresh ones from your account or order page.</Muted>
        </Section>
      )}

      {order.items.map((item, i) => (
        <Row key={i} style={{ marginBottom: 12 }}>
          <Column width={64}>
            {item.imageUrl ? <Img src={item.imageUrl.replace("w=1400", "w=160")} width={56} height={56} alt="" style={{ borderRadius: 8, objectFit: "cover" }} /> : null}
          </Column>
          <Column>
            <Text style={{ color: colors.ink, fontSize: 14, fontWeight: 600, margin: 0 }}>{item.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, margin: 0 }}>
              {[item.variantLabel, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ color: colors.ink, fontSize: 14, margin: 0 }}>{formatPriceExact(item.unitPriceCents * item.quantity)}</Text>
          </Column>
        </Row>
      ))}

      <Section style={{ borderTop: `1px solid ${colors.border}`, marginTop: 8, paddingTop: 8 }}>
        <Line label="Subtotal" value={formatPriceExact(order.subtotalCents)} />
        {order.discountCents > 0 && <Line label="Discount" value={`−${formatPriceExact(order.discountCents)}`} />}
        {order.hasPhysical && <Line label="Shipping" value={order.shippingCents ? formatPriceExact(order.shippingCents) : "Free"} />}
        {order.taxCents > 0 && <Line label="Tax" value={formatPriceExact(order.taxCents)} />}
        <Line label="Total" value={formatPriceExact(order.totalCents)} bold />
      </Section>

      {order.hasPhysical && addr && (
        <Section style={{ marginTop: 16 }}>
          <Text style={{ color: colors.ink, fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>Shipping to</Text>
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: "20px", margin: 0 }}>
            {order.shippingName}
            <br />
            {addr.line1}
            {addr.line2 ? `, ${addr.line2}` : ""}
            <br />
            {addr.city}, {addr.state} {addr.postal_code} {addr.country}
          </Text>
        </Section>
      )}

      <Section style={{ marginTop: 28 }}>
        <CTA href={orderUrl}>View your order</CTA>
      </Section>
    </EmailLayout>
  );
}

export function ShippingEmail({ order, carrier, trackingNumber, trackingUrl, orderUrl }: { order: { number: number; shippingName?: string | null }; carrier: string; trackingNumber: string; trackingUrl: string | null; orderUrl: string }) {
  return (
    <EmailLayout preview={`Order ${orderNumber(order.number)} is on its way`}>
      <H1>Your order is on its way 📦</H1>
      <P>
        Good news{order.shippingName ? `, ${order.shippingName.split(" ")[0]}` : ""}! Order <strong>{orderNumber(order.number)}</strong> just left the studio
        and is heading to you with {carrier}.
      </P>
      <Section style={{ backgroundColor: colors.paper, borderRadius: 12, margin: "8px 0 24px", padding: "16px 20px" }}>
        <Text style={{ color: colors.muted, fontSize: 13, margin: 0 }}>Tracking number</Text>
        <Text style={{ color: colors.ink, fontFamily: "monospace", fontSize: 16, fontWeight: 700, margin: "4px 0 0" }}>{trackingNumber}</Text>
      </Section>
      <Section>
        <CTA href={trackingUrl ?? orderUrl}>Track your package</CTA>
      </Section>
      <Muted>Tag me in your unboxing (@mayalane) so I can see it. I reshare my favourites every Friday!</Muted>
    </EmailLayout>
  );
}

export function LeadMagnetEmail({ downloadUrl }: { downloadUrl: string }) {
  return (
    <EmailLayout preview="Your free 7-day workout plan is here">
      <H1>Your 7-Day Kickstart is here!</H1>
      <P>
        Welcome to the Lane Club. I made this plan for anyone who wants to start moving again without overthinking it. Thirty minutes a day, no
        gym, no equipment.
      </P>
      <Section style={{ margin: "24px 0" }}>
        <CTA href={downloadUrl}>Download your free plan</CTA>
      </Section>
      <P>
        Little tip from me: put day one in your calendar right now, like an actual appointment. And when you&apos;re ready for more, use code{" "}
        <strong>KICKSTART10</strong> for 10% off anything in the shop.
      </P>
      <P>— Maya</P>
      <Muted>You&apos;re getting this because you signed up at mayalane.shop. One email a week, max. Unsubscribe anytime.</Muted>
    </EmailLayout>
  );
}

export function InquiryNotificationEmail({ inquiry }: { inquiry: { name: string; email: string; company: string; website?: string | null; budget: string; message: string } }) {
  return (
    <EmailLayout preview={`New brand inquiry from ${inquiry.company}`}>
      <H1>New brand inquiry</H1>
      <P>
        <strong>{inquiry.company}</strong> ({inquiry.name}, {inquiry.email}) · Budget: {inquiry.budget}
      </P>
      {inquiry.website && <Muted>{inquiry.website}</Muted>}
      <Section style={{ backgroundColor: colors.paper, borderRadius: 12, padding: "16px 20px" }}>
        <Text style={{ color: colors.ink, fontSize: 14, lineHeight: "22px", margin: 0, whiteSpace: "pre-wrap" }}>{inquiry.message}</Text>
      </Section>
      <Section style={{ marginTop: 24 }}>
        <CTA href={`${siteUrl}/admin/inquiries`}>Open in dashboard</CTA>
      </Section>
    </EmailLayout>
  );
}

export function InquiryReceiptEmail({ name }: { name: string }) {
  return (
    <EmailLayout preview="Thanks for reaching out to Maya Lane">
      <H1>Thanks for reaching out, {name.split(" ")[0]}!</H1>
      <P>
        We&apos;ve got your partnership inquiry and our team reviews every one personally. You&apos;ll hear back within three business days with
        availability and next steps.
      </P>
      <P>— Team Maya Lane</P>
    </EmailLayout>
  );
}
