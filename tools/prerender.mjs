// Writes the catalogue into index.html as plain HTML so search engines can read it
// without running JavaScript. Run after editing js/data.js:  node tools/prerender.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { writeCategoryPages } from "./categories.mjs";
import { writeGuides } from "./guides.mjs";
import { PRICES, BRAND, CATEGORIES, PRODUCTS } from "../js/data.js";

const file = new URL("../index.html", import.meta.url);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const gbp = (n) => "£" + n.toFixed(2);
const pad = (n) => String(n).padStart(2, "0");
const img = (p) => `/assets/products/${p.id}.webp`;
const spec = (p) => [p.d && `Ø ${p.d}`, p.l && `L ${p.l}`].filter(Boolean).join(" · ") || "Sizes on request";
const detail = (p) => [p.std, p.mat, p.finish, p.head, p.point, p.app].filter(Boolean).join(". ");

const deals = PRODUCTS.filter((p) => PRICES[p.id]);
const rest = PRODUCTS.filter((p) => !PRICES[p.id]);

const pcard = (p) => `<article class="pcard">
  <div class="pcard__img"><img src="${img(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div>
  <div class="pcard__body"><h3 class="pcard__name">${esc(p.name)}</h3>
  <p class="pcard__spec">${esc(detail(p))}</p>
  <table class="sizes"><thead><tr><th scope="col">Size (mm)</th><th scope="col">Price ${esc(PRICES[p.id].unit)}</th></tr></thead>
  <tbody>${PRICES[p.id].sizes.map(([sz, v]) => `<tr><th scope="row">${esc(sz)}</th><td><span class="sizes__ex"><b>${gbp(v)}</b> ex VAT</span><span class="sizes__inc">${gbp(v * 1.2)} inc VAT</span></td></tr>`).join("")}</tbody></table></div>
</article>`;

const bin = (p) => `<li class="bin"><div class="bin__img"><img src="${img(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div>
  <div class="bin__body"><h3 class="bin__name">${esc(p.name)}</h3><p class="bin__spec">${esc(spec(p))}</p><p class="sr-only">${esc(detail(p))}</p></div></li>`;

const html = `
<section class="aisle deals" id="aisle-priced"><header class="deals__head"><div><h2 class="aisle__title">Ready to order</h2><p class="aisle__blurb">Priced per box. Pick your size and add it to your basket.</p></div></header>
<div class="pcards">${deals.map(pcard).join("\n")}</div></section>
${CATEGORIES.map((c, i) => {
  const items = rest.filter((p) => p.cat === c.id);
  return !items.length ? "" : `<section class="aisle" id="aisle-${c.id}"><header class="aisle__head"><span class="aisle__no" aria-hidden="true">${pad(i + 1)}</span>
<h2 class="aisle__title">${esc(c.name)}</h2><p class="aisle__blurb">${esc(c.blurb)} <a href="/${c.slug}">Full specs</a></p></header>
<ul class="bins">${items.map(bin).join("\n")}</ul></section>`;
}).join("\n")}
`;

const site = "https://thescrewyard.co.uk/";
const ld = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": site + "#website", url: site, name: BRAND.name, inLanguage: "en-GB" },
    {
      "@type": "HardwareStore", "@id": site + "#business", name: BRAND.name, url: site,
      description: "Screws, nails, bolts, anchors and rivets for trade and DIY, supplied from Poole, Dorset.",
      telephone: BRAND.phoneTel, email: BRAND.email, vatID: "GB485798121",
      image: site + "assets/og.png", logo: site + "assets/logo.png",
      address: { "@type": "PostalAddress", streetAddress: "33 Belben Road", addressLocality: "Poole", addressRegion: "Dorset", postalCode: "BH12 4PH", addressCountry: "GB" },
      currenciesAccepted: "GBP",
      parentOrganization: { "@type": "Organization", name: "CMD Team Ltd" },
      hasOfferCatalog: {
        "@type": "OfferCatalog", name: "Fixings catalogue",
        itemListElement: CATEGORIES.map((c) => ({
          "@type": "OfferCatalog", name: c.name,
          itemListElement: PRODUCTS.filter((p) => p.cat === c.id).map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name: p.name, image: site + img(p).slice(1) } })),
        })),
      },
    },
  ],
};

let s = readFileSync(file, "utf8");
s = s.replace(/<!--pre-start-->[\s\S]*?<!--pre-end-->/, () => `<!--pre-start-->${html}<!--pre-end-->`);
s = s.replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, (_, a, b) => `${a}\n  ${JSON.stringify(ld).replace(/</g, "\\u003c")}\n  ${b}`);
s = s.replace(/(<span data-count-products>)\d+(<\/span>)/, `$1${PRODUCTS.length}$2`);
writeFileSync(file, s);
writeCategoryPages();
writeGuides();
console.log(`${PRODUCTS.length} products written`);
