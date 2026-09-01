# Turn on Zorbacore Pro (optional income — ~5 minutes)

Zorbacore Pro is an **optional supporter tier**. Your family keeps every core
feature free forever — Pro only unlocks additive extras (PDF/print reports, a
supporter badge, early access). It ships **dormant**: until you finish the steps
below, there is no paywall and no upgrade button anywhere, and nothing can charge
anyone.

## Why Gumroad?

Gumroad is the **merchant of record**. That means Gumroad — not you — is the
legal seller: they take the payment, store the card details, handle PCI
compliance, charge and remit VAT/sales tax, and process refunds and chargebacks.
Your website never sees a card number and never has to file sales tax. This is
the safest possible setup for a solo project, and it keeps your codebase free of
any payment attack surface.

## Steps

1. **Create a Gumroad account** at https://gumroad.com and add a payout method
   (bank/PayPal). This is the one step only you can do — it ties income to your
   identity and bank.
2. **Create a product:**
   - New product → "Digital product" → name it (e.g. *Zorbacore Pro*).
   - Set a price. A small recurring price (a "membership") gives the steady
     trickle; a one-time price is simpler. Either works.
   - Under **Settings → check "Generate a unique license key per sale."** This is
     what the app checks to unlock Pro.
   - Publish. Note the product's URL — `https://gumroad.com/l/XXXXX`. The `XXXXX`
     part is the **permalink**.
3. **Point the app at it.** Edit `src/pro-config.ts` (GitHub's web editor is fine):
   ```ts
   export const PRO_CONFIG: ProConfig = {
     enabled: true,
     productPermalink: 'XXXXX',                       // just the slug
     checkoutUrl: 'https://gumroad.com/l/XXXXX',       // full URL
     priceHint: '$4/mo',                               // shown on the button
   };
   ```
4. **Commit to `main`.** The site redeploys itself. Now:
   - A **Zorbacore Pro** card appears in Settings.
   - The **📄 Report** button on Progress prompts non-supporters to upgrade, and
     opens the PDF/print report for supporters.
   - Buyers paste the license key Gumroad emails them into Settings → Pro to
     unlock.

## How the unlock works

The buyer's license key is verified straight against Gumroad's public API
(`api.gumroad.com`) from the browser — no server needed. Refunded or cancelled
purchases fail the check automatically. It's a low-stakes cosmetic/export gate,
so this honor-system boundary is the right amount of protection: simple, private,
and it never blocks anyone's health data.

## To turn it back off

Set `enabled: false` in `src/pro-config.ts` and commit. The paywall vanishes and
everything is free again.
