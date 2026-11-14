import { BRAND, CATEGORIES, USES, PRODUCTS } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const gbp = (n) => "£" + n.toFixed(2);
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const img = (p) => `/assets/products/${p.id}.webp`;
const waLink = (text) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;

const state = { q: "", cat: "", use: "", sort: "cat" };

/* ---------- storage (quote list) ---------- */
const KEY = "tsy-quote-v1";
let quote = {};
try { quote = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { quote = {}; }
for (const id of Object.keys(quote)) if (!byId[id]) delete quote[id];
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(quote)); } catch {} };

/* ---------- static bits ---------- */
document.querySelectorAll("[data-count-products]").forEach((el) => (el.textContent = PRODUCTS.length));
document.querySelectorAll("[data-wa-general]").forEach((a) => {
  a.href = waLink(`Hi ${BRAND.name}, I'd like a price on some fixings.`);
  a.target = "_blank"; a.rel = "noopener";
});

const countIn = (cat) => PRODUCTS.filter((p) => p.cat === cat).length;

// Parts cabinet drawers
$("#cabinet").innerHTML = CATEGORIES.map((c) => `
  <li><button class="drawer" type="button" data-drawer="${c.id}" aria-label="${esc(c.name)}, ${countIn(c.id)} products">
    <span class="drawer__label">${esc(c.short)}</span><span class="drawer__n">${String(countIn(c.id)).padStart(2, "0")}</span>
    <span class="drawer__handle" aria-hidden="true"></span>
  </button></li>`).join("");
$("#cabinet").addEventListener("click", (e) => {
  const b = e.target.closest("[data-drawer]"); if (!b) return;
  setCat(b.dataset.drawer);
  $("#catalogue").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});

// Chips
$("#chips").innerHTML = [`<button class="chip" type="button" data-cat="" aria-pressed="true">All<small>${PRODUCTS.length}</small></button>`]
  .concat(CATEGORIES.map((c) => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="false">${esc(c.short)}<small>${countIn(c.id)}</small></button>`)).join("");
$("#chips").addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) setCat(b.dataset.cat); });

// Uses select
$("#use").insertAdjacentHTML("beforeend", USES.map((u) => `<option value="${u.id}">${esc(u.label)}</option>`).join(""));
$("#use").addEventListener("change", (e) => { state.use = e.target.value; render(); });
$("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
let t; $("#q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });

function setCat(id) {
  state.cat = id;
  document.querySelectorAll("#chips .chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === id)));
  const active = $(`#chips .chip[data-cat="${id}"]`);
  if (active) { const row = $("#chips"); row.scrollLeft = active.offsetLeft - row.clientWidth / 2 + active.clientWidth / 2; }
  render();
}

/* ---------- filtering & render ---------- */
function matches(p) {
  if (state.cat && p.cat !== state.cat) return false;
  if (state.use && !p.uses.includes(state.use)) return false;
  if (state.q.trim()) {
    const hay = [p.name, p.code, p.d, p.l, p.finish, p.head, p.app, p.mat, catById[p.cat].name, p.uses.join(" ")].join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }
  return true;
}

function card(p) {
  const inQ = !!quote[p.id];
  return `<li class="card">
    <div class="card__media"><span class="card__code">${esc(p.code)}</span>
      <img src="${img(p)}" alt="" loading="lazy" decoding="async" width="320" height="240"></div>
    <div class="card__body">
      <h3 class="card__name"><button type="button" data-open="${p.id}">${esc(p.name)}</button></h3>
      <dl class="specs">
        <dt>Ø</dt><dd>${esc(p.d)}</dd>
        <dt>L</dt><dd>${esc(p.l)}</dd>
        <dt class="opt">Use</dt><dd class="opt">${esc(p.app)}</dd>
      </dl>
      <div class="card__foot">
        <p class="price" style="margin:0"><span class="price__from">from</span><span class="price__v">${gbp(p.p[0])}</span><span class="price__unit">${esc(p.p[1])}</span></p>
        <button class="add" type="button" data-add="${p.id}" aria-pressed="${inQ}" aria-label="${inQ ? "Remove" : "Add"} ${esc(p.name)} ${inQ ? "from" : "to"} quote list">${inQ ? "✓ Added" : "+ Quote"}</button>
      </div>
    </div>
  </li>`;
}

function render() {
  let list = PRODUCTS.filter(matches);
  const out = $("#results");
  if (state.sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === "price") list = [...list].sort((a, b) => a.p[0] - b.p[0]);

  if (state.sort === "cat") {
    out.innerHTML = CATEGORIES.map((c) => {
      const items = list.filter((p) => p.cat === c.id);
      if (!items.length) return "";
      return `<section class="group" aria-labelledby="g-${c.id}">
        <div class="group__head"><h3 class="group__title" id="g-${c.id}">${esc(c.name)}</h3><p class="group__blurb">${esc(c.blurb)}</p></div>
        <ul class="grid">${items.map(card).join("")}</ul></section>`;
    }).join("");
  } else {
    out.innerHTML = `<ul class="grid" style="margin-top:16px">${list.map(card).join("")}</ul>`;
  }
  $("#count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}${state.cat ? " in " + catById[state.cat].name : ""}`;
  $("#empty").hidden = list.length > 0;
}

$("#results").addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { toggleQuote(add.dataset.add); return; }
  const open = e.target.closest("[data-open]") || e.target.closest(".card")?.querySelector("[data-open]");
  if (open) openProduct(open.dataset.open);
});

/* ---------- product dialog ---------- */
const pdlg = $("#product");
function openProduct(id) {
  const p = byId[id]; const c = catById[p.cat];
  const rows = [["Standard / type", p.code], ["Diameter / size", p.d], ["Length", p.l], ["Material", p.mat], ["Finish", p.finish], ["Head / drive", p.head], ["Point", p.point], ["Best for", p.app]]
    .filter(([, v]) => v && v !== "—");
  const inQ = !!quote[id];
  $("#product-body").innerHTML = `
    <button class="icon-btn pd__close" type="button" data-close aria-label="Close">✕</button>
    <div class="pd">
      <div class="pd__media"><img src="${img(p)}" alt="${esc(p.name)}"></div>
      <div>
        <p class="pd__cat">${esc(c.name)}</p>
        <h2 class="pd__name" id="p-name">${esc(p.name)}</h2>
        <div class="pd__price"><span class="price__from">from</span><span class="price__v">${gbp(p.p[0])}</span><span class="price__unit">${esc(p.p[1])} · ex. VAT</span></div>
        <table class="spec-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
        <div class="sheet__actions">
          <button class="btn btn--hivis" type="button" data-add="${p.id}" aria-pressed="${inQ}">${inQ ? "✓ In quote list" : "+ Add to quote"}</button>
          <a class="btn btn--wa" target="_blank" rel="noopener" href="${waLink(`Hi ${BRAND.name}, I'm interested in: ${p.name} (${p.code}). Can you give me a price?`)}">Ask on WhatsApp</a>
        </div>
        <p class="pd__note">Indicative price for the pack shown. Other sizes, finishes and bulk quantities priced on request.</p>
      </div>
    </div>`;
  pdlg.showModal();
}
pdlg.addEventListener("click", (e) => {
  if (e.target === pdlg || e.target.closest("[data-close]")) pdlg.close();
  const add = e.target.closest("[data-add]");
  if (add) { toggleQuote(add.dataset.add); const on = !!quote[add.dataset.add]; add.setAttribute("aria-pressed", on); add.textContent = on ? "✓ In quote list" : "+ Add to quote"; }
});

/* ---------- quote list ---------- */
const qdlg = $("#quote");
function toggleQuote(id) {
  if (quote[id]) { delete quote[id]; toast("Removed from quote list"); }
  else { quote[id] = 1; toast("Added to quote list"); bump(); }
  save(); syncQuote(); render();
}
function bump() { const f = $("#quote-fab"); f.classList.remove("bump"); void f.offsetWidth; f.classList.add("bump"); }
function quoteText() {
  const lines = Object.entries(quote).map(([id, n]) => `• ${n} × ${byId[id].name} (${byId[id].code}) — ${byId[id].p[1]}`);
  const note = $("#qnote").value.trim();
  return `Hi ${BRAND.name}, please can I get a quote for:\n\n${lines.join("\n")}${note ? `\n\nNotes: ${note}` : ""}\n\nThanks!`;
}
function syncQuote() {
  const ids = Object.keys(quote);
  $("#quote-n").textContent = ids.length;
  $("#quote-fab").setAttribute("aria-label", `Open quote list, ${ids.length} item${ids.length === 1 ? "" : "s"}`);
  $("#qempty").hidden = ids.length > 0;
  $("#qactions").hidden = ids.length === 0;
  $("#qnote-wrap").hidden = ids.length === 0;
  $("#qlist").innerHTML = ids.map((id) => {
    const p = byId[id];
    return `<li class="qitem"><img src="${img(p)}" alt="">
      <div><div class="qitem__name">${esc(p.name)}</div><div class="qitem__unit">${esc(p.p[1])}</div></div>
      <div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}">
        <button type="button" data-dec="${id}" aria-label="Decrease">−</button><output aria-live="polite">${quote[id]}</output><button type="button" data-inc="${id}" aria-label="Increase">+</button>
      </div></li>`;
  }).join("");
  $("#q-send").href = waLink(quoteText());
}
$("#quote-fab").addEventListener("click", () => { syncQuote(); qdlg.showModal(); });
qdlg.addEventListener("click", (e) => {
  if (e.target === qdlg || e.target.closest("[data-close]")) return qdlg.close();
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
  if (inc) quote[inc.dataset.inc] = Math.min(999, quote[inc.dataset.inc] + 1);
  if (dec) { const id = dec.dataset.dec; quote[id] -= 1; if (quote[id] < 1) delete quote[id]; }
  if (inc || dec) { save(); syncQuote(); render(); }
});
$("#qnote").addEventListener("input", () => ($("#q-send").href = waLink(quoteText())));
$("#q-copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(quoteText()); toast("List copied — paste it in a text or email"); }
  catch { toast("Couldn't copy — try the WhatsApp button"); }
});
$("#q-clear").addEventListener("click", () => { quote = {}; save(); syncQuote(); render(); toast("Quote list cleared"); });

let tt; function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2200); }

render();
syncQuote();
