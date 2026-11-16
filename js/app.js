import { BRAND, CATEGORIES, USES, PRODUCTS, PRICES } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const gbp = (n) => "£" + n.toFixed(2);
const pad = (n) => String(n).padStart(2, "0");
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const img = (p) => `/assets/products/${p.id}.webp`;
const priced = (p) => PRICES[p.id];
const fromOf = (p) => Math.min(...PRICES[p.id].sizes.map((x) => x[1]));
const ticket = (p) => priced(p)
  ? `<span class="ticket__from">from</span><span class="ticket__v">${gbp(fromOf(p))}</span><span class="ticket__unit">${esc(PRICES[p.id].unit)}</span>`
  : `<span class="ticket__ask">Contact for details</span>`;
const waLink = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
const countIn = (cat) => PRODUCTS.filter((p) => p.cat === cat).length;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = { q: "", use: "", cat: "" };

// Show one aisle (or all with ""), and bring the catalogue into view
function showAisle(id, jump = true) {
  state.cat = id; state.q = ""; state.use = ""; $("#q").value = "";
  syncUses(); render();
  if (jump) { const y = $("#yard").getBoundingClientRect().top + scrollY; scrollTo({ top: y, behavior: "instant" }); }
}

/* ---------- quote list storage ---------- */
const KEY = "tsy-quote-v1";
let quote = {};
try { quote = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { quote = {}; }
for (const id of Object.keys(quote)) if (!byId[id]) delete quote[id];
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(quote)); } catch {} };

/* ---------- static bits ---------- */
$$("[data-count-products]").forEach((el) => (el.textContent = PRODUCTS.length));
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

// Stock board: one row per aisle (hero on desktop, sheet on phones)
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
    const hay = [p.name, p.std, p.d, p.l, p.finish, p.head, p.point, p.app, p.mat, catById[p.cat].name, p.uses.join(" ")].filter(Boolean).join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }
  return true;
}
const specLine = (p) => [p.d && `Ø ${p.d}`, p.l && `L ${p.l}`].filter(Boolean).join(" · ") || "Sizes on request";

function bin(p) {
  const inQ = !!quote[p.id];
  return `<li class="bin">
    <div class="bin__img"><img src="${img(p)}" alt="" loading="lazy" decoding="async"></div>
    <div class="bin__body">
      <h3 class="bin__name"><button type="button" data-open="${p.id}">${esc(p.name)}</button></h3>
      <p class="bin__spec">${esc(specLine(p))}</p>
    </div>
    <div class="ticket">
      <p class="ticket__price" style="margin:0">${ticket(p)}</p>
      <button class="add" type="button" data-add="${p.id}" aria-pressed="${inQ}" aria-label="${inQ ? "Remove" : "Add"} ${esc(p.name)} ${inQ ? "from" : "to"} quote list">${inQ ? "✓" : "+"}</button>
    </div>
  </li>`;
}

function render() {
  const all = PRODUCTS.filter(matches);
  const shown = new Set(all.map((p) => p.cat));
  const list = state.cat ? all.filter((p) => p.cat === state.cat) : all;
  $("#results").innerHTML = CATEGORIES.map((c, i) => {
    const items = list.filter((p) => p.cat === c.id);
    if (!items.length) return "";
    return `<section class="aisle" id="aisle-${c.id}" aria-labelledby="t-${c.id}">
      <header class="aisle__head"><span class="aisle__no" aria-hidden="true">${pad(i + 1)}</span>
        <h2 class="aisle__title" id="t-${c.id}">${esc(c.name)}</h2><p class="aisle__blurb">${esc(c.blurb)}</p></header>
      <ul class="bins">${items.map(bin).join("")}</ul></section>`;
  }).join("");
  const filtered = state.q.trim() || state.use;
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
        ${priced(p)
          ? `<table class="price-table"><thead><tr><th scope="col">Size (mm)</th><th scope="col">Price ${esc(PRICES[p.id].unit)}</th></tr></thead><tbody>${PRICES[p.id].sizes.map(([sz, v]) => `<tr><td>${esc(sz)}</td><td>${gbp(v)}</td></tr>`).join("")}</tbody></table>`
          : `<div class="pd__price"><span class="ticket__v">Contact for details</span></div>`}
        <table class="spec-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
        <div class="sheet__actions">
          <button class="btn btn--hivis" type="button" data-add="${p.id}" aria-pressed="${inQ}">${inQ ? "✓ In quote list" : "+ Add to quote"}</button>
          <a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink(`Hi ${BRAND.name}, I'm interested in: ${p.name}. Can you give me a price?`)}">Ask on WhatsApp</a>
        </div>
        <p class="pd__note">${priced(p) ? "Need a different size? Contact us for details." : "Tell us the size, finish and quantity you need and we will send you a price."}</p>
      </div>
    </div>`;
  pdlg.showModal();
}
pdlg.addEventListener("click", (e) => {
  if (e.target === pdlg || e.target.closest("[data-close]")) return pdlg.close();
  const add = e.target.closest("[data-add]");
  if (add) { toggleQuote(add.dataset.add); const on = !!quote[add.dataset.add]; add.setAttribute("aria-pressed", on); add.textContent = on ? "✓ In quote list" : "+ Add to quote"; }
});

/* ---------- quote list ---------- */
const qdlg = $("#quote");
function toggleQuote(id) {
  if (quote[id]) { delete quote[id]; toast("Removed from quote list"); }
  else { quote[id] = 1; toast("Added to quote list"); $$("[data-quote-open]").forEach((f) => { f.classList.remove("bump"); void f.offsetWidth; f.classList.add("bump"); }); }
  save(); syncQuote();
  $$(`#results [data-add="${id}"]`).forEach((b) => { const on = !!quote[id]; b.setAttribute("aria-pressed", on); b.textContent = on ? "✓" : "+"; });
}
function quoteText() {
  const lines = Object.entries(quote).map(([id, n]) => `• ${n} x ${byId[id].name}`);
  const note = $("#qnote").value.trim();
  return `Hi ${BRAND.name}, please can I get a quote for:\n\n${lines.join("\n")}${note ? `\n\nNotes: ${note}` : ""}\n\nThanks!`;
}
function syncQuote() {
  const ids = Object.keys(quote);
  $$("[data-quote-n]").forEach((el) => (el.textContent = ids.length));
  $$("[data-quote-open]").forEach((el) => el.setAttribute("aria-label", `Open quote list, ${ids.length} item${ids.length === 1 ? "" : "s"}`));
  $("#qempty").hidden = ids.length > 0;
  $("#qactions").hidden = ids.length === 0;
  $("#qnote-wrap").hidden = ids.length === 0;
  $("#qlist").innerHTML = ids.map((id) => {
    const p = byId[id];
    return `<li class="qitem"><img src="${img(p)}" alt="">
      <div><div class="qitem__name">${esc(p.name)}</div><div class="qitem__unit">${priced(p) ? `from ${gbp(fromOf(p))} ${esc(PRICES[p.id].unit)}` : "Price on request"}</div></div>
      <div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}">
        <button type="button" data-dec="${id}" aria-label="Decrease">−</button><output>${quote[id]}</output><button type="button" data-inc="${id}" aria-label="Increase">+</button>
      </div></li>`;
  }).join("");
  $("#q-send").href = waLink(quoteText());
}
$$("[data-quote-open]").forEach((b) => b.addEventListener("click", () => { syncQuote(); qdlg.showModal(); }));
qdlg.addEventListener("click", (e) => {
  if (e.target === qdlg || e.target.closest("[data-close]")) return qdlg.close();
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
  if (inc) quote[inc.dataset.inc] = Math.min(999, quote[inc.dataset.inc] + 1);
  if (dec) { const id = dec.dataset.dec; quote[id] -= 1; if (quote[id] < 1) delete quote[id]; }
  if (inc || dec) { save(); syncQuote(); render(); }
});
$("#qnote").addEventListener("input", () => ($("#q-send").href = waLink(quoteText())));
$("#q-copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(quoteText()); toast("List copied. Paste it in a text or email"); }
  catch { toast("Couldn't copy. Try the WhatsApp button"); }
});
$("#q-clear").addEventListener("click", () => { quote = {}; save(); syncQuote(); render(); toast("Quote list cleared"); });

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
