/**
 * Zorbacore Pro — configuration.
 *
 * DORMANT BY DEFAULT. While `enabled` is false (or `productPermalink` is empty),
 * there is NO paywall and NO upgrade UI anywhere — every feature is free and the
 * family sees the app exactly as before. Nothing can charge anyone in this state.
 *
 * To switch revenue on (one-time, ~5 min — see docs/PRO_SETUP.md):
 *   1. Create a product on gumroad.com (Gumroad is the merchant of record —
 *      they handle the card, PCI, VAT/sales tax and refunds; your code never
 *      sees payment data).
 *   2. Turn ON "generate a license key per sale" for that product.
 *   3. Paste the product's permalink (the slug after gumroad.com/l/…) below and
 *      set enabled = true. Optionally set the full checkout URL.
 *
 * The license key a buyer receives is validated client-side against Gumroad's
 * public license API; a valid key unlocks Pro on that device.
 */
export interface ProConfig {
  enabled: boolean;
  /** Gumroad product permalink — the slug in gumroad.com/l/<permalink>. */
  productPermalink: string;
  /** Full checkout URL opened by the upgrade button. */
  checkoutUrl: string;
  /** What the buyer is supporting / what they get, shown on the upgrade screen. */
  priceHint: string;
}

export const PRO_CONFIG: ProConfig = {
  enabled: false,
  productPermalink: '',
  checkoutUrl: '',
  priceHint: '',
};
