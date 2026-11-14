# The Screw Yard

Promotional product catalogue (no checkout) for a screws & fixings business. Visitors browse, build a quote list and send it via WhatsApp or phone.

- **Static site**. plain HTML/CSS/JS, no build step. Deployed on Vercel.
- **Edit products, prices, phone number, brand name:** `js/data.js`
- **Product photos:** `assets/products/<product-id>.webp` (filename must match the product `id`)
- Prices are *indicative UK market estimates*. replace with real supplier pricing.

Run locally: `python3 -m http.server 5178` then open http://localhost:5178
