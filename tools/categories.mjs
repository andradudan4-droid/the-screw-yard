// Builds one page per category (for example /drywall-screws) from js/data.js.
// Called by prerender.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { PRICES, BRAND, CATEGORIES, PRODUCTS } from "../js/data.js";
import { GUIDES, V } from "./guides.mjs";

const root = new URL("../", import.meta.url);
const site = "https://thescrewyard.co.uk/";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const gbp = (n) => "£" + n.toFixed(2);
const img = (p) => `/assets/products/${p.id}.webp`;
const list = (a) => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a.at(-1);

const INTRO = {
  drywall: "Drywall screws fix plasterboard to timber or metal stud. Fine thread grips light gauge metal, coarse thread bites into timber, and collated strips feed an auto-feed screw gun for faster boarding.",
  wood: "Screws for timber, chipboard and sheet materials. Countersunk chipboard screws cover most joinery and carcassing, coach screws take heavier structural fixings, and confirmat screws suit flat-pack and cabinet work.",
  "self-tapping": "Self-tapping screws have a sharp point and cut their own thread into a pilot hole in sheet metal, plastic or timber. Head and drive styles vary by line and are listed below.",
  "self-drilling": "Self-drilling screws have a drill point that makes its own hole in steel, so there is no pilot hole to drill. They are used for cladding, roofing sheets, steel framing and fixing timber to metal.",
  concrete: "Fixings for concrete, brick and block. Concrete screws thread straight into a drilled hole, while wedge, drop-in and nylon anchors expand in the hole to hold heavier loads.",
  bolts: "Hex bolts, threaded bar, nuts, washers and machine screws for steelwork, machinery and general assembly. Tell us the thread size, length and grade and we will match it.",
  nails: "Loose nails for framing, roofing, masonry and finishing work. Finishes depend on the line: polished, electro galvanised or hot dip galvanised.",
  collated: "Collated nails and staples for nail guns and staplers. Tell us the make and model of your tool and we will match the collation and gauge.",
  rivets: "Blind rivets are set from one side of the work with a rivet gun. The range covers standard, large flange and sealed waterproof types, plus rivet nuts for adding a thread to thin sheet.",
  specialist: "The smaller items that finish a job: hooks, pins, cable clips, driver bits, cam fittings and washers.",
};

const ROWS = [["std", "Standard"], ["d", "Diameter"], ["l", "Length"], ["mat", "Material"], ["finish", "Finish"], ["head", "Head"], ["point", "Thread and point"], ["app", "Use"]];

function spec(p, c) {
  const pr = PRICES[p.id];
  const rows = ROWS.filter(([k]) => p[k]).map(([k, label]) => `<dt>${label}</dt><dd>${esc(p[k])}</dd>`).join("");
  return `<li class="spec${pr ? " spec--priced" : ""}">
        <div class="spec__img"><img src="${img(p)}" alt="${esc(p.name)}" width="132" height="132" loading="lazy" decoding="async"></div>
        <div>
          <h2>${esc(p.name)}</h2>
          ${rows ? `<dl>${rows}</dl>` : `<p>Sizes on request.</p>`}
          ${pr ? `<table class="sizes"><thead><tr><th scope="col">Size (mm)</th><th scope="col">Price ${esc(pr.unit)}</th></tr></thead><tbody>${pr.sizes.map(([sz, v]) => `<tr><th scope="row">${esc(sz)}</th><td><span class="sizes__ex"><b>${gbp(v)}</b> ex VAT</span><span class="sizes__inc">${gbp(v * 1.2)} inc VAT</span></td></tr>`).join("")}</tbody></table>` : ""}
          <a class="spec__go" href="/?aisle=${c.id}">${pr ? "Order in the catalogue" : "Ask for a price in the catalogue"}</a>
        </div>
      </li>`;
}

function page(c) {
  const items = PRODUCTS.filter((p) => p.cat === c.id);
  const names = items.map((p) => p.name);
  const url = site + c.slug;
  const desc = `${c.name} from The Screw Yard in Poole, Dorset: ${list(names.slice(0, 4))}${names.length > 4 ? " and more" : ""}. Sold by the box, free delivery on 5 boxes or more.`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Catalogue", item: site }, { "@type": "ListItem", position: 2, name: c.name, item: url }] },
      { "@type": "ItemList", name: c.name, numberOfItems: items.length, itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, image: site + img(p).slice(1) })) },
    ],
  };
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(c.name)} | The Screw Yard, Poole</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#14130f">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(c.name)} | The Screw Yard">
  <meta property="og:description" content="${esc(c.blurb)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="The Screw Yard">
  <meta property="og:image" content="${site}assets/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css?v=${V}">
  <script type="application/ld+json">
  ${JSON.stringify(ld).replace(/</g, "\\u003c")}
  </script>
</head>
<body class="cat-page">
  <header class="legal-top">
    <a class="legal-top__brand" href="/"><img src="/assets/favicon.svg" alt="" width="40" height="40"><span>The Screw <b>Yard</b></span></a>
    <a class="btn btn--ghost" href="/?aisle=${c.id}">Open the catalogue</a>
  </header>
  <div class="hazard" aria-hidden="true"></div>
  <main class="cat">
    <p class="cat__crumb"><a href="/">Catalogue</a> / ${esc(c.name)}</p>
    <h1>${esc(c.name)}</h1>
    <p class="cat__lead">${esc(INTRO[c.id])}</p>
    <p class="cat__lead">This range has ${items.length} lines: ${esc(list(names))}.</p>
    ${GUIDES.filter((g) => g.cats.includes(c.id)).map((g) => `<p class="cat__guide">Guide: <a href="/guides/${g.slug}">${esc(g.title)}</a></p>`).join("\n    ")}
    <p class="cat__terms">Sold by the box. <b>Free delivery</b> on 5 boxes or more. Prices are shown excluding and including VAT where listed. For everything else, send us your list and we will come back with a price.</p>
    <ul class="specs">
      ${items.map((p) => spec(p, c)).join("\n      ")}
    </ul>
    <section class="cat__cta" aria-labelledby="cta-title">
      <div>
        <h2 id="cta-title">Need a size that is not listed?</h2>
        <p>We can source more than what is shown here. Tell us the job and we will find the fixing.</p>
      </div>
      <div>
        <a class="btn btn--hivis" href="tel:${BRAND.phoneTel}">Call ${BRAND.phoneDisplay}</a>
        <a class="btn btn--wa" href="https://wa.me/${BRAND.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </section>
    <nav class="cat__more" aria-labelledby="more-title">
      <h2 id="more-title">Other aisles</h2>
      <p class="legal__nav">${CATEGORIES.filter((x) => x.id !== c.id).map((x) => `<a href="/${x.slug}">${esc(x.name)}</a>`).join("")}</p>
    </nav>
  </main>
  <footer class="footer">
    <p><b>The Screw Yard</b> · Screws, bolts and fasteners</p>
    <p class="footer__small">The Screw Yard is a trading name of CMD Team Ltd, registered in England and Wales, company number 16231862, VAT number GB 485 7981 21. Registered office: 33 Belben Road, Poole, BH12 4PH. Email: ${BRAND.email}. Images are representative.</p>
    <p class="footer__links"><a href="/guides/">Guides</a><a href="/terms">Terms of use</a><a href="/privacy">Privacy policy</a><a href="/cookies">Cookies</a></p>
  </footer>
</body>
</html>
`;
}

export function writeCategoryPages() {
  for (const c of CATEGORIES) writeFileSync(new URL(`${c.slug}.html`, root), page(c));
  // homepage footer links
  const f = new URL("index.html", root);
  let s = readFileSync(f, "utf8");
  s = s.replace(/<!--cats-start-->[\s\S]*?<!--cats-end-->/, () => `<!--cats-start-->${CATEGORIES.map((c) => `<a href="/${c.slug}">${esc(c.name)}</a>`).join("")}<!--cats-end-->`);
  writeFileSync(f, s);
  // sitemap
  const today = new Date().toISOString().slice(0, 10);
  const urls = ["", ...CATEGORIES.map((c) => c.slug), "guides/", ...GUIDES.map((g) => "guides/" + g.slug), "terms", "privacy", "cookies"];
  writeFileSync(new URL("sitemap.xml", root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
}
