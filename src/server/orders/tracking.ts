export function trackingUrl(carrier: string | null, number: string) {
  const n = encodeURIComponent(number);
  switch ((carrier ?? "").toUpperCase()) {
    case "USPS":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case "UPS":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "FEDEX":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case "DHL":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`;
    default:
      return null;
  }
}

export const carriers = ["USPS", "UPS", "FedEx", "DHL"] as const;
