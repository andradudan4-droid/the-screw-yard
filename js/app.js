import { BRAND, CATEGORIES, USES, PRODUCTS, PRICES } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const gbp = (n) => "£" + n.toFixed(2);
const pad = (n) => String(n).padStart(2, "0");
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const img = (p) => `/assets/products/${p.id}.webp`;
const waLink = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;

/* ---------- prices ---------- */
const VAT_RATE = 0.2;   // prices in data.js are ex VAT
const PER_AISLE = 4;   // products shown per aisle when browsing everything
const FREE_OVER = 50;   // free delivery when the order total inc VAT reaches this (£)
const incVat = (n) => n * (1 + VAT_RATE);
const priced = (p) => PRICES[p.id];
const fromOf = (p) => Math.min(...PRICES[p.id].sizes.map((x) => x[1]));
// A basket line is "productId" (price on request) or "productId|size" (priced box)
const keyOf = (id, size) => (size ? `${id}|${size}` : id);
const parseKey = (k) => { const i = k.indexOf("|"); return i < 0 ? { id: k, size: "" } : { id: k.slice(0, i), size: k.slice(i + 1) }; };
const unitPrice = (k) => { const { id, size } = parseKey(k); const s = size && PRICES[id]?.sizes.find((x) => x[0] === size); return s ? s[1] : null; };

const state = { q: "", use: "", cat: "" };

// Show one aisle (or all with ""), and bring the catalogue into view
function showAisle(id, jump = true) {
  state.cat = id; state.q = ""; state.use = ""; $("#q").value = "";
  syncUses(); render();
  if (jump) { const y = $("#yard").getBoundingClientRect().top + scrollY; scrollTo({ top: y, behavior: "instant" }); }
}

/* ---------- basket storage ---------- */
const KEY = "tsy-quote-v1";
let quote = {};
try { quote = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { quote = {}; }
for (const k of Object.keys(quote)) {
  const { id, size } = parseKey(k);
  if (!byId[id] || (size ? unitPrice(k) == null : !!PRICES[id])) delete quote[k];
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(quote)); } catch {} };

/* ---------- static bits ---------- */
$$("[data-count-products]").forEach((el) => (el.textContent = PRODUCTS.length));
$$("[data-free-over]").forEach((el) => (el.textContent = `£${FREE_OVER}`));
$$("[data-wa-general]").forEach((a) => {
  a.href = waLink(`Hi ${BRAND.name}, I'd like a price on some fixings.`);
  a.target = "_blank"; a.rel = "noopener";
});

// Aisle chips: each one shows just that aisle
$("#chips").innerHTML = `<button class="chip" type="button" data-aisle="">All</button>` +
  CATEGORIES.map((c) => `<button class="chip" type="button" data-aisle="${c.id}">${esc(c.short)}</button>`).join("");
$("#chips").addEventListener("click", (e) => {
  const b = e.target.closest("[data-aisle]"); if (!b) return;
  showAisle(b.dataset.aisle, false);
  scrollTo({ top: Math.min(scrollY, $("#yard").getBoundingClientRect().top + scrollY), behavior: "instant" });
});

// Aisle list in the phone sheet
$$("[data-board]").forEach((ul) => {
  ul.innerHTML = CATEGORIES.map((c, i) => {
    const items = PRODUCTS.filter((p) => p.cat === c.id);
    const pr = items.filter(priced).map(fromOf);
    const from = pr.length ? `from ${gbp(Math.min(...pr))}` : "contact for details";
    return `
    <li><button class="row" type="button" data-row="${c.id}" aria-label="${esc(c.name)}, ${items.length} lines, ${from}">
      <span class="row__n">${pad(i + 1)}</span>
      <img class="row__img" src="${img(items[0])}" alt="" width="40" height="40" loading="lazy">
      <span class="row__name">${esc(c.short)}</span>
      <span class="row__dots" aria-hidden="true"></span>
      <span class="row__count">${items.length} lines</span>
      <span class="row__from">${pr.length ? `from <b>${gbp(Math.min(...pr))}</b>` : "<b>Ask</b>"}</span>
    </button></li>`;
  }).join("");
  ul.addEventListener("click", (e) => {
    const b = e.target.closest("[data-row]"); if (!b) return;
    $("#aisles-sheet").open && $("#aisles-sheet").close();
    showAisle(b.dataset.row);
  });
});

// "Fixing into" toggles
$("#uses").innerHTML = USES.map((u) => `<button class="use" type="button" data-use="${u.id}" aria-pressed="false">${esc(u.label)}</button>`).join("");
const syncUses = () => $$("#uses .use").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.use === state.use)));
$("#uses").addEventListener("click", (e) => {
  const b = e.target.closest("[data-use]"); if (!b) return;
  state.use = state.use === b.dataset.use ? "" : b.dataset.use; syncUses(); render();
});
let t; $("#q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; if (state.q.trim()) state.cat = ""; render(); }, 120); });

/* ---------- render ---------- */
function matches(p) {
  if (state.use && !p.uses.includes(state.use)) return false;
  if (state.q.trim()) {
    const sizes = priced(p) ? PRICES[p.id].sizes.map((x) => x[0].replace(/\s/g, "")).join(" ") : "";
    const hay = [p.name, p.std, p.d, p.l, p.finish, p.head, p.point, p.app, p.mat, catById[p.cat].name, p.uses.join(" "), sizes].filter(Boolean).join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }
  return true;
}
const specLine = (p) => [p.d && `Ø ${p.d}`, p.l && `L ${p.l}`].filter(Boolean).join(" · ") || "Sizes on request";

// Size picker: one row per size, with ex VAT and inc VAT prices and an add control
function sizeTable(p) {
  const pr = PRICES[p.id];
  return `<table class="sizes" data-sizes="${p.id}">
    <thead><tr><th scope="col">Size (mm)</th><th scope="col">Price ${esc(pr.unit)}</th><th scope="col"><span class="sr-only">Add to basket</span></th></tr></thead>
    <tbody>${pr.sizes.map(([sz, v]) => {
      const k = esc(keyOf(p.id, sz)), n = quote[keyOf(p.id, sz)] || 0;
      return `<tr${n ? ' class="is-in"' : ""}><th scope="row">${esc(sz)}</th>
        <td><span class="sizes__ex"><b>${gbp(incVat(v))}</b> inc VAT</span><span class="sizes__inc">${gbp(v)} ex VAT</span></td>
        <td class="sizes__act">${n
          ? `<span class="qty qty--sm" role="group" aria-label="Boxes of ${esc(sz)}"><button type="button" data-dec="${k}" aria-label="One box fewer">−</button><output>${n}</output><button type="button" data-inc="${k}" aria-label="One box more">+</button></span>`
          : `<button class="btn btn--hivis btn--sm" type="button" data-inc="${k}" aria-label="Add ${esc(sz)} to basket">Add</button>`}</td></tr>`;
    }).join("")}</tbody></table>`;
}

function pcard(p) {
  return `<article class="pcard">
    <button class="pcard__img" type="button" data-open="${p.id}" aria-label="${esc(p.name)} details"><img src="${img(p)}" alt="" loading="lazy" decoding="async"></button>
    <div class="pcard__body">
      <h3 class="pcard__name">${esc(p.name)}</h3>
      <p class="pcard__spec">${esc([p.finish, p.head].filter(Boolean).join(". ") || catById[p.cat].name)}</p>
      ${sizeTable(p)}
    </div>
  </article>`;
}

function bin(p) {
  const inQ = !!quote[p.id];
  return `<li class="bin">
    <div class="bin__img"><img src="${img(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async"></div>
    <div class="bin__body">
      <h3 class="bin__name"><button type="button" data-open="${p.id}">${esc(p.name)}</button></h3>
      <p class="bin__spec">${esc(specLine(p))}</p>
    </div>
    <div class="ticket">
      <p class="ticket__price" style="margin:0"><span class="ticket__ask">Contact for details</span></p>
      <button class="add" type="button" data-add="${p.id}" aria-pressed="${inQ}" aria-label="${inQ ? "Remove" : "Add"} ${esc(p.name)} ${inQ ? "from" : "to"} basket">${inQ ? "✓" : "+"}</button>
    </div>
  </li>`;
}

function render() {
  const all = PRODUCTS.filter(matches);
  const shown = new Set(all.map((p) => p.cat));
  const list = state.cat ? all.filter((p) => p.cat === state.cat) : all;
  const deals = list.filter(priced);
  const rest = list.filter((p) => !priced(p));
  // Priced lines always come first, in one place
  const dealsHtml = deals.length ? `<section class="aisle deals" id="aisle-priced" aria-labelledby="t-priced">
      <header class="deals__head">
        <div><h2 class="aisle__title" id="t-priced">Ready to order</h2><p class="aisle__blurb">Priced per box. Pick your size and add it to your basket.</p></div>
        <p class="deals__offer"><b>Free delivery</b> on orders over £${FREE_OVER}</p>
      </header>
      <div class="pcards">${deals.map(pcard).join("")}</div></section>` : "";
  const filtered = state.q.trim() || state.use;
  // Browsing everything: show a few per aisle so the page stays short
  const preview = !state.cat && !filtered;
  $("#results").innerHTML = dealsHtml + CATEGORIES.map((c, i) => {
    const items = rest.filter((p) => p.cat === c.id);
    if (!items.length) return "";
    const cut = preview && items.length > PER_AISLE;
    const more = cut ? `<button class="aisle__more" type="button" data-show-aisle="${c.id}">See all ${items.length} ${esc(c.name.toLowerCase())}</button>` : "";
    return `<section class="aisle" id="aisle-${c.id}" aria-labelledby="t-${c.id}">
      <header class="aisle__head"><span class="aisle__no" aria-hidden="true">${pad(i + 1)}</span>
        <h2 class="aisle__title" id="t-${c.id}">${esc(c.name)}</h2><p class="aisle__blurb">${esc(c.blurb)} <a href="/${c.slug}">Full specs</a></p></header>
      <ul class="bins">${(cut ? items.slice(0, PER_AISLE) : items).map(bin).join("")}</ul>${more}</section>`;
  }).join("");
  $("#count").textContent = filtered ? `${list.length} of ${PRODUCTS.length} products match` : "";
  $("#empty").hidden = list.length > 0;
  $$("[data-aisle]").forEach((a) => {
    a.classList.toggle("is-empty", !!a.dataset.aisle && !shown.has(a.dataset.aisle));
    a.setAttribute("aria-pressed", String(a.dataset.aisle === state.cat));
  });
  const chip = $(`#chips [data-aisle="${state.cat}"]`), row = $("#chips");
  if (chip && row.clientWidth) row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2, behavior: "instant" });
}

$("#results").addEventListener("click", (e) => {
  if (e.target.closest("[data-inc], [data-dec]")) return; // handled by the basket handler below
  const add = e.target.closest("[data-add]");
  if (add) return toggleQuote(add.dataset.add);
  const open = e.target.closest("[data-open]") || e.target.closest(".bin")?.querySelector("[data-open]");
  if (open) openProduct(open.dataset.open);
});

/* ---------- product sheet ---------- */
const pdlg = $("#product");
function openProduct(id) {
  const p = byId[id], c = catById[p.cat];
  const rows = [["Size", p.d], ["Length", p.l], ["Material", p.mat], ["Finish", p.finish], ["Head", p.head], ["Thread / point", p.point], ["Use", p.app]].filter(([, v]) => v);
  if (!p.d && !p.l) rows.unshift(["Sizes", "On request"]);
  const inQ = !!quote[id];
  $("#product-body").innerHTML = `
    <button class="icon-btn pd__close" type="button" data-close aria-label="Close">✕</button>
    <div class="pd">
      <div class="pd__media"><img src="${img(p)}" alt="${esc(p.name)}"></div>
      <div>
        <p class="pd__cat">${esc(c.name)}</p>
        <h2 class="pd__name" id="p-name">${esc(p.name)}</h2>
        ${priced(p) ? sizeTable(p) : `<div class="pd__price"><span class="ticket__v">Contact for details</span></div>`}
        <table class="spec-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
        <div class="sheet__actions">
          ${priced(p) ? `<button class="btn btn--hivis" type="button" data-basket>View basket</button>` : `<button class="btn btn--hivis" type="button" data-add="${p.id}" aria-pressed="${inQ}">${inQ ? "✓ In basket" : "+ Add to basket"}</button>`}
          <a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink(`Hi ${BRAND.name}, I'm interested in: ${p.name}. Can you give me a price?`)}">Ask on WhatsApp</a>
        </div>
        <p class="pd__note">${priced(p) ? `Free delivery on orders over £${FREE_OVER}. Need a different size? Contact us for details.` : "Tell us the size, finish and quantity you need and we will send you a price."}</p>
      </div>
    </div>`;
  pdlg.showModal();
}
pdlg.addEventListener("click", (e) => {
  if (e.target === pdlg || e.target.closest("[data-close]")) return pdlg.close();
  if (e.target.closest("[data-basket]")) { pdlg.close(); syncQuote(); return qdlg.showModal(); }
  const add = e.target.closest("[data-add]");
  if (add) { toggleQuote(add.dataset.add); const on = !!quote[add.dataset.add]; add.setAttribute("aria-pressed", on); add.textContent = on ? "✓ In basket" : "+ Add to basket"; }
});

/* ---------- basket ---------- */
const qdlg = $("#quote");
const bump = () => $$("[data-quote-open]").forEach((f) => { f.classList.remove("bump"); void f.offsetWidth; f.classList.add("bump"); });

function toggleQuote(id) {
  if (quote[id]) { delete quote[id]; toast("Removed from basket"); }
  else { quote[id] = 1; toast("Added to basket"); bump(); }
  save(); syncQuote();
  $$(`#results [data-add="${id}"]`).forEach((b) => { const on = !!quote[id]; b.setAttribute("aria-pressed", on); b.textContent = on ? "✓" : "+"; });
}

// + and − anywhere: size pickers and basket lines
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-inc], [data-dec]"); if (!btn) return;
  const up = btn.hasAttribute("data-inc");
  const k = up ? btn.dataset.inc : btn.dataset.dec;
  const was = quote[k] || 0;
  if (up) quote[k] = Math.min(999, was + 1);
  else if (was <= 1) delete quote[k];
  else quote[k] = was - 1;
  if (up && !was) { toast("Added to basket"); bump(); }
  save();
  const scope = btn.closest("dialog") || document;
  syncQuote();
  $$("[data-sizes]").forEach((el) => { el.outerHTML = sizeTable(byId[el.dataset.sizes]); });
  if (!parseKey(k).size) $$(`#results [data-add="${k}"]`).forEach((b) => { const on = !!quote[k]; b.setAttribute("aria-pressed", on); b.textContent = on ? "✓" : "+"; });
  (scope.querySelector(`[data-inc="${CSS.escape(k)}"]`) || scope.querySelector("[data-close]"))?.focus();
});

function totals() {
  let sub = 0, boxes = 0, ask = 0;
  for (const [k, n] of Object.entries(quote)) { const u = unitPrice(k); if (u == null) ask += 1; else { sub += u * n; boxes += n; } }
  return { sub, vat: sub * VAT_RATE, total: incVat(sub), boxes, ask };
}
const isFree = (tt) => tt.total >= FREE_OVER;
const deliveryLine = (tt) => !tt.boxes ? "" : isFree(tt) ? "Free delivery" : `Add ${gbp(FREE_OVER - tt.total)} more for free delivery`;

function quoteText() {
  const lines = Object.entries(quote).map(([k, n]) => {
    const { id, size } = parseKey(k), u = unitPrice(k);
    return u == null ? `• ${n} x ${byId[id].name} (price on request)` : `• ${n} x ${byId[id].name}, ${size} mm, ${gbp(incVat(u * n))} inc VAT`;
  });
  const tt = totals();
  const sum = tt.boxes ? `\n\nSubtotal ex VAT: ${gbp(tt.sub)}\nVAT 20%: ${gbp(tt.vat)}\nTotal inc VAT: ${gbp(tt.total)}\n${isFree(tt) ? `Free delivery (over £${FREE_OVER})` : "Delivery: please quote"}` : "";
  const note = $("#qnote").value.trim();
  return `Hi ${BRAND.name}, I'd like to order:\n\n${lines.join("\n")}${sum}${note ? `\n\nNotes: ${note}` : ""}\n\nThanks!`;
}

function syncQuote() {
  const keys = Object.keys(quote), tt = totals();
  $$("[data-quote-n]").forEach((el) => (el.textContent = keys.length));
  $$("[data-quote-total]").forEach((el) => { el.textContent = tt.boxes ? gbp(tt.total) : ""; el.hidden = !tt.boxes; });
  $$("[data-quote-open]").forEach((el) => el.setAttribute("aria-label", `Open basket, ${keys.length} item${keys.length === 1 ? "" : "s"}${tt.boxes ? `, ${gbp(tt.total)} including VAT` : ""}`));
  $("#qempty").hidden = keys.length > 0;
  $("#qactions").hidden = keys.length === 0;
  $("#qnote-wrap").hidden = keys.length === 0;
  $("#qlist").innerHTML = keys.map((k) => {
    const { id, size } = parseKey(k), p = byId[id], u = unitPrice(k), n = quote[k], kk = esc(k);
    return `<li class="qitem"><img src="${img(p)}" alt="">
      <div><div class="qitem__name">${esc(p.name)}</div>
        <div class="qitem__unit">${u == null ? "Price on request" : `${esc(size)} mm, ${gbp(incVat(u))} ${esc(PRICES[id].unit)} inc VAT`}</div>
        ${u == null ? "" : `<div class="qitem__line">${gbp(incVat(u * n))} <span>inc VAT</span></div>`}</div>
      <div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}${size ? " " + esc(size) : ""}">
        <button type="button" data-dec="${kk}" aria-label="Decrease">−</button><output>${n}</output><button type="button" data-inc="${kk}" aria-label="Increase">+</button>
      </div></li>`;
  }).join("");
  const d = deliveryLine(tt);
  $("#qtotals").hidden = !tt.boxes;
  $("#qtotals").innerHTML = !tt.boxes ? "" : `
    <p class="qdel ${isFree(tt) ? "is-free" : ""}">${esc(d)}</p>
    <dl class="qsum">
      <div><dt>Subtotal, ex VAT</dt><dd>${gbp(tt.sub)}</dd></div>
      <div><dt>VAT at 20%</dt><dd>${gbp(tt.vat)}</dd></div>
      <div class="qsum__total"><dt>Total, inc VAT</dt><dd>${gbp(tt.total)}</dd></div>
    </dl>
    ${tt.ask ? `<p class="qsum__ask">Plus ${tt.ask} item${tt.ask === 1 ? "" : "s"} priced on request.</p>` : ""}`;
  $("#q-send").href = waLink(quoteText());
}
$$("[data-quote-open]").forEach((b) => b.addEventListener("click", () => { syncQuote(); qdlg.showModal(); }));
qdlg.addEventListener("click", (e) => { if (e.target === qdlg || e.target.closest("[data-close]")) qdlg.close(); });
$("#qnote").addEventListener("input", () => ($("#q-send").href = waLink(quoteText())));
$("#q-copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(quoteText()); toast("Order copied. Paste it in a text or email"); }
  catch { toast("Couldn't copy. Try the WhatsApp button"); }
});
$("#q-clear").addEventListener("click", () => { quote = {}; save(); syncQuote(); render(); toast("Basket emptied"); });

/* ---------- dock (phones) ---------- */
const adlg = $("#aisles-sheet");
$("[data-aisles-open]").addEventListener("click", () => adlg.showModal());
adlg.addEventListener("click", (e) => { if (e.target === adlg || e.target.closest("[data-close]")) adlg.close(); });
$("[data-search-focus]").addEventListener("click", () => {
  $("#yard").scrollIntoView({ behavior: "instant" });
  $("#q").focus();
});

let tt; function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2200); }

render();
syncQuote();

// Links from the category pages open the catalogue on that aisle
const qa = new URLSearchParams(location.search).get("aisle");
if (qa && catById[qa]) showAisle(qa);

// "See all" on a shortened aisle opens that aisle
document.addEventListener("click", (e) => { const b = e.target.closest("[data-show-aisle]"); if (b) showAisle(b.dataset.showAisle); });
