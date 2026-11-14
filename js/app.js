import { BRAND, CATEGORIES, USES, PRODUCTS } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const gbp = (n) => "£" + n.toFixed(2);
const pad = (n) => String(n).padStart(2, "0");
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const img = (p) => `/assets/products/${p.id}.webp`;
const waLink = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
const countIn = (cat) => PRODUCTS.filter((p) => p.cat === cat).length;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = { q: "", use: "" };

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

// Aisle chips: plain anchor links
$("#chips").innerHTML = CATEGORIES.map((c) => `<a class="chip" href="#aisle-${c.id}" data-aisle="${c.id}">${esc(c.short)}</a>`).join("");

// Stock board: one row per aisle (hero on desktop, sheet on phones)
$$("[data-board]").forEach((ul) => {
  ul.innerHTML = CATEGORIES.map((c, i) => {
    const items = PRODUCTS.filter((p) => p.cat === c.id);
    const from = Math.min(...items.map((p) => p.p[0]));
    return `
    <li><button class="row" type="button" data-row="${c.id}" aria-label="${esc(c.name)}, ${items.length} lines, from ${gbp(from)}">
      <span class="row__n">${pad(i + 1)}</span>
      <img class="row__img" src="${img(items[0])}" alt="" width="40" height="40" loading="lazy">
      <span class="row__name">${esc(c.short)}</span>
      <span class="row__dots" aria-hidden="true"></span>
      <span class="row__count">${items.length} lines</span>
      <span class="row__from">from <b>${gbp(from)}</b></span>
    </button></li>`;
  }).join("");
  ul.addEventListener("click", (e) => {
    const b = e.target.closest("[data-row]"); if (!b) return;
    $("#aisles-sheet").open && $("#aisles-sheet").close();
    if (state.q || state.use) { state.q = ""; state.use = ""; $("#q").value = ""; syncUses(); render(); }
    $(`#aisle-${b.dataset.row}`)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
  });
});

// "Fixing into" toggles
$("#uses").innerHTML = USES.map((u) => `<button class="use" type="button" data-use="${u.id}" aria-pressed="false">${esc(u.label)}</button>`).join("");
const syncUses = () => $$("#uses .use").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.use === state.use)));
$("#uses").addEventListener("click", (e) => {
  const b = e.target.closest("[data-use]"); if (!b) return;
  state.use = state.use === b.dataset.use ? "" : b.dataset.use; syncUses(); render();
});
let t; $("#q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });

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
      <p class="ticket__price" style="margin:0"><span class="ticket__from">from</span><span class="ticket__v">${gbp(p.p[0])}</span><span class="ticket__unit">${esc(p.p[1])}</span></p>
      <button class="add" type="button" data-add="${p.id}" aria-pressed="${inQ}" aria-label="${inQ ? "Remove" : "Add"} ${esc(p.name)} ${inQ ? "from" : "to"} quote list">${inQ ? "✓" : "+"}</button>
    </div>
  </li>`;
}

let spy;
function render() {
  const list = PRODUCTS.filter(matches);
  const shown = new Set();
  $("#results").innerHTML = CATEGORIES.map((c, i) => {
    const items = list.filter((p) => p.cat === c.id);
    if (!items.length) return "";
    shown.add(c.id);
    return `<section class="aisle" id="aisle-${c.id}" aria-labelledby="t-${c.id}">
      <header class="aisle__head"><span class="aisle__no" aria-hidden="true">${pad(i + 1)}</span>
        <h2 class="aisle__title" id="t-${c.id}">${esc(c.name)}</h2><p class="aisle__blurb">${esc(c.blurb)}</p></header>
      <ul class="bins">${items.map(bin).join("")}</ul></section>`;
  }).join("");
  const filtered = state.q.trim() || state.use;
  $("#count").textContent = filtered ? `${list.length} of ${PRODUCTS.length} products match` : "";
  $("#empty").hidden = list.length > 0;
  $$("[data-aisle]").forEach((a) => a.classList.toggle("is-empty", !shown.has(a.dataset.aisle)));

  // Scroll spy: highlight the aisle you are in
  spy?.disconnect();
  spy = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) setCurrent(en.target.id.replace("aisle-", ""));
  }, { rootMargin: "-25% 0px -70% 0px" });
  $$(".aisle").forEach((s) => spy.observe(s));
}
function setCurrent(id) {
  $$("[data-aisle]").forEach((a) => a.setAttribute("aria-current", String(a.dataset.aisle === id)));
  const chip = $(`#chips [data-aisle="${id}"]`), row = $("#chips");
  if (chip && row.clientWidth) row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2, behavior: reduced() ? "auto" : "smooth" });
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
        <div class="pd__price"><span class="ticket__from">from</span><span class="ticket__v">${gbp(p.p[0])}</span><span class="ticket__unit">${esc(p.p[1])}, ex. VAT</span></div>
        <table class="spec-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
        <div class="sheet__actions">
          <button class="btn btn--hivis" type="button" data-add="${p.id}" aria-pressed="${inQ}">${inQ ? "✓ In quote list" : "+ Add to quote"}</button>
          <a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink(`Hi ${BRAND.name}, I'm interested in: ${p.name}. Can you give me a price?`)}">Ask on WhatsApp</a>
        </div>
        <p class="pd__note">Guide price. Tell us the size, finish and quantity you need and we will confirm the exact price.</p>
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
  const lines = Object.entries(quote).map(([id, n]) => `• ${n} x ${byId[id].name} (${byId[id].p[1]})`);
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
      <div><div class="qitem__name">${esc(p.name)}</div><div class="qitem__unit">${esc(p.p[1])}</div></div>
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
  $("#yard").scrollIntoView({ behavior: "auto" });
  $("#q").focus();
});

let tt; function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2200); }

render();
syncQuote();
