// Buying guides (/guides/...). Content lives here; product names, photos and
// prices are pulled from js/data.js. Called by prerender.mjs.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { PRICES, BRAND, CATEGORIES, PRODUCTS } from "../js/data.js";

const root = new URL("../", import.meta.url);
const site = "https://thescrewyard.co.uk/";
export const V = 11; // stylesheet version
const UPDATED = "2026-11-17";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const cat = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const table = (head, rows) => `<div class="legal__table"><table><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const chip = PRICES["csk-chipboard"].sizes.map(([s]) => s).join(", ");

export const GUIDES = [
  {
    slug: "which-screw-for-plasterboard",
    title: "Which screw for plasterboard?",
    desc: "Coarse thread for timber, fine thread for metal stud. Screw lengths for 9.5, 12.5 and 15 mm plasterboard, spacing, and when to use self-drilling or collated screws.",
    answer: "Into timber, use a <b>coarse thread</b> drywall screw: 38 mm for 12.5 mm board. Into metal stud, use a <b>fine thread</b> drywall screw: 25 mm for 12.5 mm board.",
    cats: ["drywall"],
    picks: ["coarse-thread-drywall", "fine-thread-drywall", "bugle-head-self-drilling", "collated-drywall"],
    body: `
<h2>Screw length by board thickness</h2>
<p>The screw should go at least 25 mm into timber, or at least 10 mm through a metal stud. That gives these lengths:</p>
${table(["Board", "Into timber (coarse thread)", "Into metal stud (fine thread)"], [
  ["9.5 mm", "32 mm", "25 mm"],
  ["12.5 mm", "38 mm", "25 mm"],
  ["15 mm", "42 mm", "32 mm"],
  ["Two layers of 12.5 mm", "50 to 60 mm", "42 mm"],
])}
<h2>Coarse or fine thread</h2>
<p><b>Coarse thread</b> has a wide, deep thread that grips softwood studs, joists and battens without stripping. <b>Fine thread</b> has two shallow threads close together. It bites into thin steel where a coarse thread would chew the hole out and spin.</p>
<p>Both have a bugle head. The curved underside presses the paper face down without tearing it, which is why an ordinary countersunk wood screw is the wrong choice for plasterboard.</p>
<h2>Heavier steel</h2>
<p>A fine thread screw only pierces light gauge stud. For steel from about 2 mm thick, such as structural framing or heavy channel, use a bugle head self-drilling screw. Its drill point cuts the hole before the thread engages.</p>
<h2>Spacing and depth</h2>
<ul>
  <li>Walls: a screw every 300 mm along each stud.</li>
  <li>Ceilings: a screw every 230 mm along each joist.</li>
  <li>Keep at least 10 mm in from the paper-bound long edges and 13 mm from cut ends.</li>
  <li>Drive the head just below the surface. If it breaks through the paper it is holding very little, so put another screw beside it.</li>
</ul>
<h2>Finish</h2>
<p>Black or grey phosphate is the normal finish for dry indoor work, and filler keys to it well. In kitchens, bathrooms and other damp areas, choose a galvanised finish.</p>
<h2>Boarding a lot?</h2>
<p>Collated drywall screws come on a plastic strip for auto-feed screw guns. On a full house they save a good deal of time, and the gun sets every head to the same depth.</p>`,
    faq: [
      ["Can I use wood screws for plasterboard?", "It is not a good idea. A countersunk wood screw has a sharp cone under the head that cuts the paper face, and the paper is what gives the board its strength. A drywall screw has a bugle head made to seat without tearing."],
      ["How many screws does one sheet need?", "A 2400 x 1200 mm sheet on a wall with studs at 400 mm centres takes about 36 screws. With studs at 600 mm centres it takes about 27. Ceilings need more because the spacing is closer."],
      ["Do drywall screws rust?", "Phosphate screws are for dry indoor use and will rust if they stay damp. Use a galvanised finish anywhere moisture is likely."],
    ],
  },
  {
    slug: "what-size-screws-for-decking",
    title: "What size screws for decking?",
    desc: "Decking screw length and diameter for 21, 28, 32 and 38 mm boards, how many screws per square metre, and which coating to use outdoors.",
    answer: "Use a screw <b>4.5 to 5 mm</b> in diameter and at least <b>two and a half times as long as the board is thick</b>. For a 28 mm deck board that means 65 to 70 mm.",
    cats: ["wood"],
    picks: ["coloured-deck-screws", "csk-chipboard", "wafer-head-timber-screws", "din571-hex-coach-screw"],
    body: `
<h2>Screw length by board thickness</h2>
${table(["Deck board", "Screw length", "Diameter"], [
  ["20 to 21 mm", "50 mm", "4.5 mm"],
  ["28 mm", "65 to 70 mm", "4.5 to 5 mm"],
  ["32 mm", "75 to 80 mm", "5 mm"],
  ["38 mm", "90 to 100 mm", "5 to 6 mm"],
])}
<p>The aim is to get about two thirds of the screw into the joist. A screw that is too short holds for a season, then works loose as the timber swells and shrinks.</p>
<h2>How many screws</h2>
<ul>
  <li>Two screws through each board at every joist.</li>
  <li>Set each screw about a quarter of the board width in from the edge, and never closer than 15 mm.</li>
  <li>With joists at 400 mm centres, allow 35 to 40 screws per square metre of deck.</li>
</ul>
<h2>Stop the boards splitting</h2>
<p>Drill a pilot hole for any screw near the end of a board. In hardwood, pilot and countersink every screw. In softwood, a sharp screw will usually start itself away from the ends.</p>
<h2>Coating matters more than size</h2>
<p>Ordinary bright or yellow zinc screws are for indoor use. Outdoors they rust, and the preservative in treated timber speeds that up. For decking, use screws with an exterior coating or stainless steel. Stainless is the safer choice near the coast and in oak or other hardwoods, where a rusting screw leaves black stains.</p>
<h2>The frame underneath</h2>
<p>Joists and bearers need longer, heavier fixings than the boards. Long wafer head timber screws pull a frame together without washers. Coach screws suit bolting joists and bearers to posts.</p>
<p>Our countersunk chipboard screws are priced in ${chip} mm. Tell us the job when you order and we will confirm the right finish for outdoor use.</p>`,
    faq: [
      ["Can I use chipboard screws outside?", "Only if they have an exterior coating. Indoor zinc plated chipboard screws will rust in a deck, usually within a couple of winters."],
      ["Do I need to pre-drill decking?", "At board ends, yes, in any timber. In hardwood, pre-drill every screw. In softwood away from the ends, most decking screws drive without a pilot hole."],
      ["Screws or nails for decking?", "Screws. They hold better as boards move with the weather, and a board can be lifted later to reach what is underneath."],
    ],
  },
  {
    slug: "self-tapping-vs-self-drilling-screws",
    title: "Self-tapping vs self-drilling screws",
    desc: "The difference between self-tapping and self-drilling (Tek) screws, what metal thickness each one suits, and which to use for roofing and cladding.",
    answer: "A <b>self-tapping</b> screw cuts its own thread but needs a pilot hole in metal. A <b>self-drilling</b> screw has a drill point, so it makes the hole and the thread in one go.",
    cats: ["self-tapping", "self-drilling"],
    picks: ["din7981-pan-self-tapping", "pan-head-self-drilling", "din7504k-hex-self-drilling", "csk-wings-self-drilling", "hex-washer-self-drilling-epdm"],
    body: `
<h2>Side by side</h2>
${table(["", "Self-tapping", "Self-drilling"], [
  ["Point", "Sharp point", "Drill bit point"],
  ["Pilot hole in metal", "Needed", "Not needed"],
  ["Metal thickness", "Thin sheet, up to about 1.5 mm", "About 2 to 4 mm for standard points, up to 10 mm for hex head types"],
  ["Typical jobs", "Sheet metal, ducting, plastics, brackets to timber", "Steel framing, cladding, roofing sheets to steel purlins"],
])}
<h2>When self-tapping is the right choice</h2>
<p>Thin sheet is too light for a drill point: the point punches through before the thread has anything to bite. A self-tapping screw in a small pilot hole gives a tighter fixing. They also work well in plastics and for fixing metal brackets to timber.</p>
<h2>When self-drilling is the right choice</h2>
<p>On steel from about 2 mm upwards, drilling a pilot hole for every fixing is slow. A self-drilling screw does it in one pass. The rule is that the drill point must be longer than the steel is thick, so the hole is finished before the thread starts. That is why thicker steel needs the longer point found on hex head screws.</p>
<h2>Timber to steel</h2>
<p>Use a self-drilling screw with wings. The wings ream a clearance hole through the timber so the thread does not jack the board away from the steel, then snap off when they reach the metal.</p>
<h2>Roofing and cladding</h2>
<ul>
  <li>Sheets to steel purlins: hex head self-drilling screws with a bonded sealing washer.</li>
  <li>Sheets to timber: roofing screws with a sharp point and a washer.</li>
  <li>Tighten until the washer is just compressed. If the rubber squeezes out sideways it is overtightened and will leak.</li>
</ul>
<h2>Driving them</h2>
<p>Use a moderate drill speed and steady pressure on thick steel. Too fast and the point overheats and goes blunt before it is through.</p>`,
    faq: [
      ["Are Tek screws the same as self-drilling screws?", "Yes. Tek is a brand name that has become the trade word for self-drilling screws."],
      ["Do self-tapping screws need a pilot hole?", "In metal, yes. In thin soft sheet, plastics and timber, a sharp point will often start without one."],
      ["Can I use self-drilling screws in wood?", "They will hold, but the drill point does nothing useful in timber. Use them where timber is being fixed to steel, ideally the winged type."],
    ],
  },
  {
    slug: "fixing-into-concrete-brick-and-block",
    title: "How to fix into concrete, brick and block",
    desc: "Which fixing to use in concrete, brick and block: wall plugs, frame anchors, concrete screws, wedge anchors and drop-in anchors, with drill sizes.",
    answer: "Light loads: a <b>plug and screw</b>. Medium loads: a <b>concrete screw</b>, straight into a drilled hole. Heavy loads in solid concrete: a <b>wedge anchor</b>.",
    cats: ["concrete"],
    picks: ["wall-plugs", "nylon-frame-anchor", "flat-head-concrete-screw", "hex-concrete-screws", "wedge-anchor", "drop-in-anchor"],
    body: `
<h2>Which fixing for which wall</h2>
${table(["Fixing", "Use it in", "Good for"], [
  ["Plastic wall plug and screw", "Brick, block, concrete", "Light loads: shelves, clips, small brackets"],
  ["Nylon frame anchor", "Brick and block, including lighter blocks", "Fixing battens, door and window frames straight through the timber"],
  ["Concrete screw", "Concrete, solid brick, dense block", "Medium loads. No plug, and it can be taken out again"],
  ["Hex head concrete screw bolt", "Concrete", "Heavy brackets, racking, base plates"],
  ["Wedge anchor", "Solid concrete only", "Heavy loads. Fast to fit through the fixture"],
  ["Drop-in anchor", "Solid concrete", "A flush threaded socket for threaded bar, often overhead"],
])}
<h2>Concrete screws</h2>
<p>A 7.5 mm concrete screw goes into a 6 mm hole. The thread cuts into the wall of the hole, so there is no plug and no expansion. That makes them a good choice near an edge, where an expanding anchor could crack the concrete.</p>
<h2>Wedge and drop-in anchors</h2>
<p>Both grip by expanding against the hole. They need solid concrete around them, so keep them away from edges and do not use them in brick, block or mortar joints. A drop-in anchor is set with a setting tool and leaves an internal thread flush with the surface, ready for threaded bar.</p>
<h2>Wall plug sizes</h2>
${table(["Plug", "Drill bit", "Screw diameter"], [
  ["Yellow", "5 mm", "3 to 4 mm"],
  ["Red", "6 mm", "3.5 to 5 mm"],
  ["Brown", "7 mm", "4.5 to 6 mm"],
  ["Blue", "10 mm", "6 to 8 mm"],
])}
<h2>Getting a hole that holds</h2>
<ul>
  <li>Use the drill size marked for the fixing. A worn or oversize bit is the usual reason a fixing spins.</li>
  <li>Drill at least 10 mm deeper than the fixing goes in, so dust has somewhere to sit.</li>
  <li>Blow or brush the dust out. A dusty hole can halve the grip.</li>
  <li>Fix into the brick or block itself, not the mortar joint.</li>
</ul>
<p>This is general guidance. For structural or safety-critical fixings, follow the anchor maker's load data or an engineer's specification.</p>`,
    faq: [
      ["Can I use wedge anchors in brick?", "No. Wedge anchors are made for solid concrete. In brick they can split the brick or pull out. Use a concrete screw or a frame anchor instead."],
      ["What size hole for a concrete screw?", "A 7.5 mm concrete screw needs a 6 mm hole, drilled at least 10 mm deeper than the screw will go."],
      ["What is the best fixing close to an edge?", "A concrete screw. It does not expand, so it puts much less stress on the concrete than a wedge or shield anchor."],
    ],
  },
  {
    slug: "screw-sizes-explained",
    title: "Screw sizes explained: gauge and length",
    desc: "What screw sizes mean, with a gauge to mm conversion chart, inch to mm lengths, pilot hole sizes and how to choose the right length.",
    answer: "A metric screw size is <b>diameter x length in millimetres</b>. A 5 x 80 screw is 5 mm across the thread and 80 mm long.",
    cats: ["wood", "bolts"],
    picks: ["csk-chipboard", "din7997-flat-wood", "din571-hex-coach-screw", "hex-bolt"],
    body: `
<h2>Gauge to millimetres</h2>
<p>Older screws and many plans still use gauge numbers. These are the nearest metric sizes:</p>
${table(["Gauge", "Nearest metric diameter"], [
  ["4", "3.0 mm"], ["6", "3.5 mm"], ["8", "4.0 mm"], ["10", "5.0 mm"], ["12", "5.5 mm, often sold as 6.0 mm"], ["14", "6.5 mm"],
])}
<h2>Inches to millimetres</h2>
${table(["Imperial length", "Metric length"], [
  ["1/2 inch", "12 mm"], ["3/4 inch", "20 mm"], ["1 inch", "25 mm"], ["1 1/4 inch", "30 mm"], ["1 1/2 inch", "40 mm"], ["2 inch", "50 mm"], ["2 1/2 inch", "60 mm"], ["3 inch", "75 to 80 mm"], ["4 inch", "100 mm"],
])}
<p>So the old "8 by 2 inch" is a 4 x 50 today, and a "10 by 3 inch" is a 5 x 80.</p>
<h2>How length is measured</h2>
<p>Length is the part that ends up in the material. A countersunk screw is measured over its whole length, head included, because the head sits flush. A pan head or hex head screw is measured from under the head.</p>
<h2>Choosing the length</h2>
<p>About two thirds of the screw should be in the piece you are fixing into. A quick rule: pick a screw two and a half to three times as long as the piece on top is thick. An 18 mm board onto a frame takes a 45 to 50 mm screw.</p>
<h2>Pilot hole sizes</h2>
${table(["Screw diameter", "Pilot in softwood", "Pilot in hardwood"], [
  ["3.5 mm", "2.0 mm", "2.5 mm"], ["4.0 mm", "2.5 mm", "3.0 mm"], ["5.0 mm", "3.0 mm", "3.5 mm"], ["6.0 mm", "4.0 mm", "4.5 mm"],
])}
<h2>Bolt sizes</h2>
<p>Bolts and machine screws use M sizes. M8 means a thread 8 mm in diameter. The spanner size is different: 10 mm for M6, 13 mm for M8, 17 mm for most M10 and 19 mm for most M12.</p>
<h2>Sizes we price by the box</h2>
<p>Our countersunk chipboard screws are listed in ${chip} mm. Other diameters and lengths are available on request.</p>`,
    faq: [
      ["What is an 8 gauge screw in mm?", "About 4.0 mm in diameter. A 10 gauge is about 5.0 mm and a 6 gauge about 3.5 mm."],
      ["What does 5 x 80 mean on a box of screws?", "The screw is 5 mm in diameter and 80 mm long."],
      ["Is a 4 mm screw the same as an 8 gauge?", "For practical purposes, yes. Metric 4.0 mm replaced 8 gauge and they use the same plugs and pilot holes."],
    ],
  },
];

const head = (title, desc, url, ld) => `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)} | The Screw Yard</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#14130f">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="article">
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
    <a class="btn btn--ghost" href="/">Open the catalogue</a>
  </header>
  <div class="hazard" aria-hidden="true"></div>`;

const foot = `
  <footer class="footer">
    <p><b>The Screw Yard</b> · Screws, bolts and fasteners</p>
    <p class="footer__small">The Screw Yard is a trading name of CMD Team Ltd, registered in England and Wales, company number 16231862, VAT number GB 485 7981 21. Registered office: 33 Belben Road, Poole, BH12 4PH. Email: ${BRAND.email}. Guides are general advice, not a specification.</p>
    <p class="footer__links"><a href="/faq">FAQ</a><a href="/guides/">Guides</a><a href="/terms">Terms of use</a><a href="/privacy">Privacy policy</a><a href="/cookies">Cookies</a></p>
  </footer>
</body>
</html>
`;

const strip = (h) => h.replace(/<[^>]+>/g, "");

function page(g) {
  const url = `${site}guides/${g.slug}`;
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Catalogue", item: site }, { "@type": "ListItem", position: 2, name: "Guides", item: site + "guides/" }, { "@type": "ListItem", position: 3, name: g.title, item: url }] },
    { "@type": "Article", headline: g.title, description: g.desc, datePublished: UPDATED, dateModified: UPDATED, mainEntityOfPage: url, image: site + "assets/og.png", author: { "@type": "Organization", name: "The Screw Yard", url: site }, publisher: { "@type": "Organization", name: "The Screw Yard", logo: { "@type": "ImageObject", url: site + "assets/logo.png" } } },
    { "@type": "FAQPage", mainEntity: g.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ] };
  const picks = g.picks.map((id) => { const p = byId[id]; if (!p) throw new Error("no product " + id); const c = cat[p.cat];
    return `<li><a href="/${c.slug}"><img src="/assets/products/${p.id}.webp" alt="" width="72" height="72" loading="lazy" decoding="async"><span><b>${esc(p.name)}</b>${esc(c.name)}</span></a></li>`; }).join("\n      ");
  return `${head(g.title, g.desc, url, ld)}
  <main class="legal guide">
    <p class="cat__crumb"><a href="/">Catalogue</a> / <a href="/guides/">Guides</a> / ${esc(g.title)}</p>
    <h1>${esc(g.title)}</h1>
    <p class="legal__lead">${g.answer}</p>
${g.body}
    <h2>From the catalogue</h2>
    <ul class="picks">
      ${picks}
    </ul>
    <h2>Common questions</h2>
    ${g.faq.map(([q, a]) => `<h3>${esc(q)}</h3>\n    <p>${esc(a)}</p>`).join("\n    ")}
    <section class="cat__cta" aria-labelledby="cta-title">
      <div>
        <h2 id="cta-title">Not sure which fixing?</h2>
        <p>Tell us the job and we will find the fixing. Sold by the box, free delivery on orders over £50.</p>
      </div>
      <div>
        <a class="btn btn--hivis" href="tel:${BRAND.phoneTel}">Call ${BRAND.phoneDisplay}</a>
        <a class="btn btn--wa" href="https://wa.me/${BRAND.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </section>
    <nav class="cat__more" aria-labelledby="more-title">
      <h2 id="more-title">More guides</h2>
      <p class="legal__nav">${GUIDES.filter((x) => x !== g).map((x) => `<a href="/guides/${x.slug}">${esc(x.title)}</a>`).join("")}</p>
    </nav>
  </main>${foot}`;
}

function index() {
  const url = site + "guides/";
  const desc = "Plain answers to common fixing questions: plasterboard screws, decking screws, self-tapping and self-drilling screws, masonry fixings and screw sizes.";
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Fixing guides", url, hasPart: GUIDES.map((g) => ({ "@type": "Article", headline: g.title, url: `${url}${g.slug}` })) };
  return `${head("Fixing guides", desc, url, ld)}
  <main class="legal guide">
    <p class="cat__crumb"><a href="/">Catalogue</a> / Guides</p>
    <h1>Fixing guides</h1>
    <p class="cat__lead">Plain answers to the questions we get asked most, with sizes and tables you can use on the job.</p>
    <ul class="guide-list">
      ${GUIDES.map((g) => `<li><a href="/guides/${g.slug}"><b>${esc(g.title)}</b><span>${strip(g.answer)}</span></a></li>`).join("\n      ")}
    </ul>
  </main>${foot}`;
}

export function writeGuides() {
  mkdirSync(new URL("guides/", root), { recursive: true });
  for (const g of GUIDES) writeFileSync(new URL(`guides/${g.slug}.html`, root), page(g));
  writeFileSync(new URL("guides/index.html", root), index());
  const f = new URL("index.html", root);
  let s = readFileSync(f, "utf8");
  s = s.replace(/<!--guides-start-->[\s\S]*?<!--guides-end-->/, () => `<!--guides-start--><a href="/guides/">Fixing guides</a>${GUIDES.map((g) => `<a href="/guides/${g.slug}">${esc(g.title)}</a>`).join("")}<!--guides-end-->`);
  writeFileSync(f, s);
}
