const STORAGE_KEY = 'samenThuisV2';
const QUOTE_KEY = 'samenThuisV2-quote';
const PEOPLE = ['Kees', 'Daphne', 'Samen'];
const PAGES = {
  today: 'Vandaag', weather: 'Weer', tasks: 'Taken', agenda: 'Agenda', challenges: 'Challenges', programs: "Programma's",
  mealplan: 'Weekmenu', groceries: 'Boodschappen', deals: 'Acties & aanbiedingen', stock: 'Voorraad',
  home: 'Woning', car: 'Auto', budget: 'Budget', dates: 'Date ideeën', travel: 'Reizen', extras: 'Extra', settings: 'Instellingen'
};
const person = { name: 'person', label: 'Voor wie', type: 'select', options: PEOPLE };
const SECTIONS = {
  tasks: { label: 'Taak', empty: 'Nog geen taken.', fields: [{ name: 'text', label: 'Taak', required: true }, person, { name: 'category', label: 'Categorie', value: 'Huishouden' }, { name: 'due', label: 'Deadline', type: 'date' }], title: i => i.text, meta: i => [i.person, i.category, i.due].filter(Boolean).join(' · '), check: true },
  agenda: { label: 'Afspraak', empty: 'Geen afspraken.', fields: [{ name: 'title', label: 'Titel', required: true }, { name: 'date', label: 'Datum', type: 'date' }, person], title: i => i.title, meta: i => [i.date, i.person].filter(Boolean).join(' · ') },
  challenges: { label: 'Challenge', empty: 'Geen challenges.', fields: [{ name: 'title', label: 'Titel', required: true }, { name: 'category', label: 'Categorie' }], title: i => i.title, meta: i => i.category || '', check: true },
  programs: { label: 'Programma', empty: 'Geen programma’s.', fields: [{ name: 'title', label: 'Titel', required: true }, { name: 'notes', label: 'Notities' }], title: i => i.title, meta: i => i.notes || '' },
  mealplan: { key: 'meals', label: 'Maaltijd', empty: 'Plan je week.', fields: [{ name: 'name', label: 'Maaltijd', required: true }, { name: 'date', label: 'Datum', type: 'date' }], title: i => i.name, meta: i => i.date || '' },
  groceries: { label: 'Product', empty: 'Boodschappenlijst is leeg.', fields: [{ name: 'name', label: 'Product', required: true }, { name: 'quantity', label: 'Aantal' }], title: i => i.name, meta: i => i.quantity || '', check: true },
  deals: { label: 'Aanbieding', empty: 'Geen aanbiedingen.', fields: [{ name: 'title', label: 'Aanbieding', required: true }, { name: 'store', label: 'Winkel' }], title: i => i.title, meta: i => i.store || '' },
  stock: { label: 'Voorraad', empty: 'Geen voorraad.', fields: [{ name: 'name', label: 'Product', required: true }, { name: 'quantity', label: 'Aantal' }], title: i => i.name, meta: i => i.quantity || '' },
  home: { label: 'Woning', empty: 'Niets genoteerd.', fields: [{ name: 'title', label: 'Klus of notitie', required: true }, { name: 'notes', label: 'Details' }], title: i => i.title, meta: i => i.notes || '', check: true },
  dates: { label: 'Date idee', empty: 'Nog geen ideeën.', fields: [{ name: 'title', label: 'Idee', required: true }, { name: 'notes', label: 'Details' }], title: i => i.title, meta: i => i.notes || '' },
  travel: { label: 'Reis', empty: 'Nog geen reizen.', fields: [{ name: 'title', label: 'Bestemming', required: true }, { name: 'date', label: 'Datum', type: 'date' }], title: i => i.title, meta: i => i.date || '' },
  extras: { label: 'Extra', empty: 'Niets toegevoegd.', fields: [{ name: 'title', label: 'Titel', required: true }, { name: 'notes', label: 'Details' }], title: i => i.title, meta: i => i.notes || '' }
};
const listOf = (page, st = state) => st[SECTIONS[page].key || page];
const CAR_FIELDS = [['model', 'Model'], ['plate', 'Kenteken'], ['year', 'Bouwjaar'], ['mileage', 'Kilometerstand'], ['apkDate', 'APK-datum', 'date'], ['insuranceDate', 'Verzekering tot', 'date']];

const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const $ = (s, r = document) => r.querySelector(s);
const refCache = {};
const $$cached = id => { const el = refCache[id]; if (el && el.isConnected) return el; return (refCache[id] = document.querySelector(id)); };
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function defaultState() {
  return {
    version: 2, currentPage: 'today', theme: 'light', appearance: 'normal', minimalColor: '#315f86',
    tasks: [
      { id: uid(), text: 'Wasmachine aanzetten', person: 'Kees', category: 'Huishouden', due: todayKey(), done: false },
      { id: uid(), text: 'Boodschappenlijst controleren', person: 'Samen', category: 'Boodschappen', due: todayKey(), done: false }
    ],
    agenda: [], challenges: [
      { id: uid(), title: '3× bewegen deze week', category: 'Sport', done: false },
      { id: uid(), title: '30 minuten lezen', category: 'Lezen', done: false }
    ],
    programs: [], meals: [], groceries: [], deals: [], stock: [], home: [], dates: [], travel: [], extras: [],
    budget: { monthly: 0, items: [] }, car: {}, dailyAnswers: {}, priceReferences: []
  };
}
function merge(base, saved) {
  const out = { ...base };
  if (!saved || typeof saved !== 'object') return out;
  Object.keys(base).forEach(k => {
    if (!(k in saved)) return;
    if (Array.isArray(base[k])) { if (Array.isArray(saved[k])) out[k] = saved[k]; }
    else if (base[k] && typeof base[k] === 'object') { if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k])) out[k] = { ...base[k], ...saved[k] }; }
    else if (typeof saved[k] === typeof base[k]) out[k] = saved[k];
  });
  if (!Array.isArray(out.budget.items)) out.budget.items = [];
  if (!PAGES[out.currentPage]) out.currentPage = 'today';
  return out;
}
function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? merge(defaultState(), JSON.parse(raw)) : defaultState(); }
  catch { return defaultState(); }
}
let state = loadState();

function esc(v = '') { return String(v ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])); }
let toastTimer;
function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2400);
}
function saveState(message = '') {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const s = $('#saveState'); if (s) s.textContent = 'Lokaal bewaard';
    if (message) toast(message);
    scheduleSync();
    return true;
  } catch { toast('Opslag niet beschikbaar'); return false; }
}

/* ---------- Quote ---------- */
const QUOTE_URL = 'https://www.brainyquote.com/link/quotebr.rss';
const QUOTE_FALLBACK = '<p class="quote-note muted">De quote van vandaag is nu niet beschikbaar (offline of bron onbereikbaar). Probeer het later opnieuw.</p>';
function readCachedQuote() {
  try { const c = JSON.parse(localStorage.getItem(QUOTE_KEY) || 'null'); return c && c.date === todayKey() && c.html ? c : null; }
  catch { return null; }
}
function quoteMarkup(q) {
  return `<blockquote class="daily-quote">${esc(q.text)}</blockquote>${q.author ? `<p class="muted">— ${esc(q.author)}</p>` : ''}`;
}
function quoteBodyMarkup() {
  const c = readCachedQuote();
  return c ? c.html : QUOTE_FALLBACK;
}
function renderQuote() {
  return `<section class="panel quote-panel"><div class="panel-heading"><div><p class="eyebrow">Dagelijkse inspiratie</p><h2>Quote van de dag</h2></div><span class="panel-icon">✦</span></div><div id="quoteBody">${quoteBodyMarkup()}</div></section>`;
}
async function fetchQuoteFromRss() {
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl && setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(QUOTE_URL, { signal: ctrl && ctrl.signal });
    if (!res.ok) return null;
    const xml = new DOMParser().parseFromString(await res.text(), 'application/xml');
    const item = xml.querySelector('item');
    if (!item) return null;
    const title = (item.querySelector('title')?.textContent || '').trim();
    const desc = new DOMParser().parseFromString(item.querySelector('description')?.textContent || '', 'text/html').body.textContent.trim();
    const generic = /^(today'?s )?quote/i.test(title);
    const text = generic ? desc : title;
    return text ? { text, author: generic || desc === title ? '' : desc } : null;
  } catch { return null; }
  finally { if (timer) clearTimeout(timer); }
}
let quoteLoading = false;
async function captureBrainyQuote() {
  if (readCachedQuote()) return true;
  if (quoteLoading || navigator.onLine === false) return false;
  quoteLoading = true;
  try {
    const q = await fetchQuoteFromRss();
    if (!q) return false;
    const html = quoteMarkup(q);
    try { localStorage.setItem(QUOTE_KEY, JSON.stringify({ date: todayKey(), html })); } catch { /* cache niet beschikbaar */ }
    const box = $('#quoteBody');
    if (box) box.innerHTML = html;
    return true;
  } finally { quoteLoading = false; }
}

/* ---------- Weer ---------- */
const WEATHER_KEY = 'samenThuisV2-weather';
const WEATHER_CODES = { 0: 'Helder', 1: 'Overwegend helder', 2: 'Half bewolkt', 3: 'Bewolkt', 45: 'Mist', 48: 'Rijpmist', 51: 'Lichte motregen', 53: 'Motregen', 55: 'Zware motregen', 61: 'Lichte regen', 63: 'Regen', 65: 'Zware regen', 71: 'Lichte sneeuw', 73: 'Sneeuw', 75: 'Zware sneeuw', 80: 'Regenbuien', 81: 'Regenbuien', 82: 'Zware buien', 95: 'Onweer', 96: 'Onweer met hagel', 99: 'Zwaar onweer' };
function readWeather() {
  try { const w = JSON.parse(localStorage.getItem(WEATHER_KEY) || 'null'); return w && w.days ? w : null; }
  catch { return null; }
}
function weatherBodyMarkup() {
  const w = readWeather();
  if (!w) return '<p class="quote-note muted">Het weer is nu niet beschikbaar (offline of bron onbereikbaar).</p>';
  const cfg = config();
  const day = d => `<article class="challenge-card"><div class="challenge-main"><p class="eyebrow">${esc(new Date(d.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' }))}</p><h3>${esc(WEATHER_CODES[d.code] || 'Onbekend')}</h3><p class="muted">${Math.round(d.min)}° / ${Math.round(d.max)}° · regen ${Math.round(d.rain || 0)}%</p></div></article>`;
  return `<p class="muted">${esc(cfg.weatherCity)} · bijgewerkt ${esc(new Date(w.fetched).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }))}</p><div class="challenge-grid">${w.days.map(day).join('')}</div>`;
}
function renderWeather() {
  return `<section class="panel" id="page-weather"><div class="panel-heading"><div><p class="eyebrow">Weeroverzicht</p><h2>Weer</h2></div><button class="button button-secondary button-small" data-action="refresh-weather">Vernieuwen</button></div><div id="weatherBody">${weatherBodyMarkup()}</div></section>`;
}
async function fetchWeather() {
  const cfg = config();
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl && setTimeout(() => ctrl.abort(), 8000);
  try {
    const geo = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=1&language=nl&name=${encodeURIComponent(cfg.weatherCity)}`, { signal: ctrl && ctrl.signal })).json();
    const loc = geo.results && geo.results[0];
    if (!loc) return false;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`;
    const res = await fetch(url, { signal: ctrl && ctrl.signal });
    if (!res.ok) return false;
    const d = (await res.json()).daily;
    if (!d || !d.time) return false;
    const days = d.time.map((date, i) => ({ date, code: d.weathercode[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i], rain: d.precipitation_probability_max[i] }));
    try { localStorage.setItem(WEATHER_KEY, JSON.stringify({ city: cfg.weatherCity, fetched: Date.now(), days })); } catch { /* cache niet beschikbaar */ }
    return true;
  } catch { return false; }
  finally { if (timer) clearTimeout(timer); }
}
async function loadWeather(force) {
  const w = readWeather();
  if (!force && w && w.city === config().weatherCity && Date.now() - w.fetched < 3600000) return;
  if (navigator.onLine === false) { if (force) toast('Offline: weer niet vernieuwd'); return; }
  const ok = await fetchWeather();
  const box = $('#weatherBody');
  if (box) box.innerHTML = weatherBodyMarkup();
  if (force) toast(ok ? 'Weer vernieuwd' : 'Weer kon niet worden geladen');
}

/* ---------- Instellingen & synchronisatie (Supabase, optioneel) ---------- */
const CONFIG_KEY = 'samenThuisV2-config';
const SYNC_TABLE = 'household_state';
let cfgCache;
function config() {
  if (cfgCache) return cfgCache;
  let c = {};
  try { c = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') || {}; } catch { c = {}; }
  return (cfgCache = { supabaseUrl: '', supabaseKey: '', household: '', weatherCity: 'Amsterdam', updatedAt: '', ...c });
}
function saveConfig(patch) {
  cfgCache = { ...config(), ...patch };
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfgCache)); return true; } catch { toast('Opslag niet beschikbaar'); return false; }
}
function syncEnabled() { const c = config(); return !!(c.supabaseUrl && c.supabaseKey && c.household); }
function setSyncState(text) { const el = $('#syncState'); if (el) el.textContent = text; }
function syncRequest(path, options = {}) {
  const c = config();
  const base = c.supabaseUrl.replace(/\/+$/, '');
  if (!/^https:\/\//i.test(base)) throw new Error('URL moet met https:// beginnen');
  return fetch(`${base}/rest/v1/${SYNC_TABLE}${path}`, { ...options, headers: { apikey: c.supabaseKey, Authorization: 'Bearer ' + c.supabaseKey, 'Content-Type': 'application/json', ...(options.headers || {}) } });
}
async function pushState() {
  const updatedAt = new Date().toISOString();
  const res = await syncRequest('?on_conflict=household_code', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ household_code: config().household, data: state, updated_at: updatedAt }) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  saveConfig({ updatedAt });
}
async function syncNow(manual) {
  if (!syncEnabled()) { setSyncState('Alleen dit apparaat'); if (manual) toast('Vul eerst de synchronisatie-instellingen in'); return; }
  if (navigator.onLine === false) { setSyncState('Offline'); return; }
  setSyncState('Synchroniseren…');
  try {
    const res = await syncRequest(`?household_code=eq.${encodeURIComponent(config().household)}&select=data,updated_at`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const row = (await res.json())[0];
    if (row && row.data && row.updated_at > (config().updatedAt || '')) {
      state = merge(defaultState(), row.data);
      saveConfig({ updatedAt: row.updated_at });
      applyTheme();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* lokaal niet beschikbaar */ }
      renderPage(state.currentPage);
    } else await pushState();
    setSyncState('Gesynchroniseerd');
    if (manual) toast('Gesynchroniseerd');
  } catch (err) { setSyncState('Sync mislukt'); if (manual) toast(`Synchronisatie mislukt: ${err.message}`); }
}
let syncTimer;
function scheduleSync() {
  if (!syncEnabled()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    if (navigator.onLine === false) return setSyncState('Offline');
    try { await pushState(); setSyncState('Gesynchroniseerd'); } catch { setSyncState('Sync mislukt'); }
  }, 1500);
}

/* ---------- Pagina's ---------- */
function itemMarkup(page, item) {
  const s = SECTIONS[page];
  const check = s.check ? `<input class="task-check" type="checkbox" data-toggle="${page}" data-id="${esc(item.id)}" ${item.done ? 'checked' : ''} aria-label="Afronden">` : '';
  return `<li class="list-card task-row ${item.done ? 'is-done' : ''}">${check}<div><strong>${esc(s.title(item))}</strong><small>${esc(s.meta(item))}</small></div><button class="icon-button task-delete" data-delete="${page}" data-id="${esc(item.id)}" aria-label="Verwijderen">×</button></li>`;
}
function listMarkup(page, items = listOf(page)) {
  return `<ul class="data-list task-list">${items.map(i => itemMarkup(page, i)).join('') || `<li class="empty-row">${esc(SECTIONS[page].empty)}</li>`}</ul>`;
}
function renderToday() {
  const open = state.tasks.filter(t => !t.done);
  const a = state.dailyAnswers[todayKey()] || {};
  const date = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  const q = 'Wat zou vandaag voor jou een fijne dag maken?';
  const who = ['Kees', 'Daphne'].map(p => a[p] ? `<article><strong>${p}</strong><p>${esc(a[p])}</p></article>` : `<button class="button button-secondary button-small" data-answer="${p}">${p} beantwoordt</button>`).join(' ');
  return `<div class="page-grid">
    <section class="panel tasks-panel"><div class="panel-heading"><div><p class="eyebrow">${esc(date)}</p><h2>Open taken (${open.length})</h2></div></div>
      <form class="inline-form" data-quick-task><input name="text" placeholder="Nieuwe taak…" required maxlength="120"><button class="button button-primary">Toevoegen</button></form>
      ${listMarkup('tasks', open.slice(0, 8))}</section>
    ${renderQuote()}
    <section class="panel question-panel"><div class="panel-heading"><div><p class="eyebrow">Even samen stilstaan</p><h2>Vraag van de dag</h2></div><span class="panel-icon">♡</span></div><p>${esc(q)}</p><div class="button-row">${who}</div></section>
  </div>`;
}
function renderSection(page) {
  const items = listOf(page);
  const extra = page === 'tasks' ? `<form class="inline-form" data-quick-task><input name="text" placeholder="Nieuwe taak…" required maxlength="120"><button class="button button-primary">Toevoegen</button></form>` : '';
  return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">${items.length} items</p><h2>${esc(PAGES[page])}</h2></div></div>${extra}${listMarkup(page, items)}</section>`;
}
function renderBudget() {
  const spent = state.budget.items.reduce((n, i) => n + (Number(i.amount) || 0), 0);
  const fmt = n => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);
  return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Maandbudget</p><h2>${fmt(state.budget.monthly)} · uitgegeven ${fmt(spent)}</h2></div></div>
    <form class="inline-form" data-budget-form><input name="monthly" type="number" min="0" step="0.01" value="${esc(state.budget.monthly)}" aria-label="Maandbudget"><button class="button button-secondary">Budget opslaan</button></form>
    <form class="inline-form" data-budget-item><input name="name" placeholder="Uitgave" required><input name="amount" type="number" step="0.01" min="0" placeholder="Bedrag" required><button class="button button-primary">Toevoegen</button></form>
    <ul class="data-list">${state.budget.items.map(i => `<li class="list-card"><div><strong>${esc(i.name)}</strong><small>${fmt(Number(i.amount) || 0)}</small></div><button class="icon-button" data-delete="budget" data-id="${esc(i.id)}" aria-label="Verwijderen">×</button></li>`).join('') || '<li class="empty-row">Nog geen uitgaven.</li>'}</ul></section>`;
}
function renderCar() {
  return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Auto</p><h2>Autogegevens</h2></div></div><form class="stack-form form-grid" data-car-form>${CAR_FIELDS.map(([k, l, t]) => `<div class="field"><label>${l}<input name="${k}" type="${t || 'text'}" value="${esc(state.car[k] || '')}"></label></div>`).join('')}<button class="button button-primary">Opslaan</button></form></section>`;
}
function renderSettings() {
  const c = config();
  const sel = (key, opts) => opts.map(([v, l]) => `<option value="${v}" ${state[key] === v ? 'selected' : ''}>${l}</option>`).join('');
  return `<section class="panel"><div class="panel-heading"><div><p class="eyebrow">Weergave</p><h2>Instellingen</h2></div></div>
    <div class="setting-row"><label>Thema <select data-setting="theme">${sel('theme', [['light', 'Licht'], ['dark', 'Donker']])}</select></label></div>
    <div class="setting-row"><label>Vormgeving <select data-setting="appearance">${sel('appearance', [['normal', 'Normaal'], ['minimal', 'Minimaal']])}</select></label></div>
    <div class="setting-row"><label>Accentkleur (minimaal) <input type="color" data-setting="minimalColor" value="${esc(state.minimalColor)}"></label></div>
    <form class="stack-form" data-weather-form><div class="setting-row"><label>Plaats voor het weer <input name="weatherCity" value="${esc(c.weatherCity)}" required maxlength="80"></label><button class="button button-secondary">Opslaan</button></div></form>
    <p class="small-note">Gegevens worden lokaal in je browser bewaard. Gebruik de knoppen links voor een back-up.</p></section>
    <section class="panel" id="syncPanel"><div class="panel-heading"><div><p class="eyebrow">Optioneel</p><h2>Synchronisatie (Supabase)</h2></div></div>
    <form class="stack-form" data-sync-form autocomplete="off">
      <div class="field"><label>Project-URL<input name="supabaseUrl" type="url" placeholder="https://xyz.supabase.co" value="${esc(c.supabaseUrl)}"></label></div>
      <div class="field"><label>Publishable / anon key<input name="supabaseKey" type="password" value="${esc(c.supabaseKey)}"></label></div>
      <div class="field"><label>Huishoudcode<input name="household" maxlength="64" value="${esc(c.household)}"></label></div>
      <div class="button-row"><button class="button button-primary">Opslaan</button><button type="button" class="button button-secondary" data-action="sync-now">Nu synchroniseren</button></div>
    </form>
    <p class="small-note">Zonder deze gegevens blijft alles alleen op dit apparaat. Gebruik nooit een service-role key. De tabel <code>${SYNC_TABLE}</code> heeft de kolommen <code>household_code</code> (text, primary key), <code>data</code> (jsonb) en <code>updated_at</code> (timestamptz). Deze instellingen worden niet in back-ups opgenomen.</p></section>`;
}
function renderPage(page = state.currentPage) {
  if (!PAGES[page]) page = 'today';
  state.currentPage = page;
  const view = $$cached('#view');
  const title = $$cached('#pageTitle');
  if (title && title.textContent !== PAGES[page]) title.textContent = PAGES[page];
  const eyebrow = $$cached('#eyebrow');
  if (eyebrow) { const h = new Date().getHours(); eyebrow.textContent = h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond'; }
  const add = $$cached('#addBtn');
  if (add) add.hidden = !SECTIONS[page];
  renderNav();
  if (!view) return;
  if (page === 'weather') loadWeather(false);
  view.innerHTML = page === 'today' ? renderToday() : page === 'budget' ? renderBudget() : page === 'car' ? renderCar() : page === 'settings' ? renderSettings() : page === 'weather' ? renderWeather() : renderSection(page);
}
function renderNav() {
  const nav = $$cached('#nav');
  if (!nav) return;
  if (nav.childElementCount !== Object.keys(PAGES).length) {
    nav.innerHTML = Object.entries(PAGES).map(([k, l]) => `<button class="nav-item" data-page="${k}">${esc(l)}</button>`).join('');
  }
  for (const b of nav.children) b.classList.toggle('is-active', b.dataset.page === state.currentPage);
}
function applyTheme() {
  const root = document.documentElement;
  root.dataset.theme = state.theme;
  root.dataset.appearance = state.appearance;
  if (state.appearance === 'minimal' && /^#[0-9a-f]{6}$/i.test(state.minimalColor)) root.style.setProperty('--blue', state.minimalColor);
  else root.style.removeProperty('--blue');
}

/* ---------- Acties ---------- */
function addItem(page, values) {
  const key = SECTIONS[page].key || page;
  state[key].unshift({ id: uid(), done: false, ...values });
  saveState('Toegevoegd');
  renderPage(state.currentPage);
}
function addTask(text, values = {}) {
  text = String(text || '').trim();
  if (!text) return;
  addItem('tasks', { text, person: 'Samen', category: 'Huishouden', due: todayKey(), ...values });
}
function openItemDialog() {
  const page = state.currentPage;
  const s = SECTIONS[page] || SECTIONS.tasks;
  const dlg = $('#itemDialog');
  const fields = $('#formFields');
  if (!dlg || !fields || typeof dlg.showModal !== 'function') return;
  dlg.dataset.page = SECTIONS[page] ? page : 'tasks';
  $('#dialogTitle') && ($('#dialogTitle').textContent = `${s.label} toevoegen`);
  fields.innerHTML = s.fields.map(f => `<div class="field"><label>${esc(f.label)}${f.type === 'select'
    ? `<select name="${f.name}">${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`
    : `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value || '')}" ${f.required ? 'required' : ''}>`}</label></div>`).join('');
  dlg.showModal();
}
function closeDialog(id) { const d = $(id); if (d && d.open) d.close(); }
function openQuestion(p) {
  const dlg = $$cached('#questionDialog');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const qTitle = $$cached('#questionTitle'), qText = $$cached('#questionText'), qPerson = $$cached('#questionPerson'), qAnswer = $$cached('#questionAnswer');
  if (qTitle) qTitle.textContent = `${p}, jouw antwoord`;
  if (qText) qText.textContent = 'Wat zou vandaag voor jou een fijne dag maken?';
  if (qPerson) qPerson.value = p;
  if (qAnswer) qAnswer.value = '';
  dlg.showModal();
}
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportData() { download(`samen-thuis-backup-${todayKey()}.json`, JSON.stringify(state, null, 2), 'application/json'); toast('Back-up gemaakt'); }
function importData(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try { state = merge(defaultState(), JSON.parse(r.result)); applyTheme(); saveState('Back-up geladen'); renderPage(state.currentPage); }
    catch { toast('Back-up kon niet worden geladen'); }
  };
  r.readAsText(file);
}
function exportPrices() {
  const rows = [['product', 'winkel', 'prijs'], ...state.priceReferences.map(p => [p.product, p.store || '', p.price ?? ''])];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  download(`prijzen-${todayKey()}.csv`, csv, 'text/csv');
  toast(state.priceReferences.length ? 'Prijzen geëxporteerd' : 'Nog geen prijzen, leeg bestand geëxporteerd');
}
function importPrices(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const text = String(r.result);
      let list;
      if (/\.json$/i.test(file.name)) { const d = JSON.parse(text); list = (Array.isArray(d) ? d : d.products || []).map(p => ({ product: p.product || p.name, store: p.store || '', price: Number(p.price) })); }
      else {
        list = [];
        for (const line of text.split(/\r?\n/)) {
          if (!line) continue;
          const c = line.split(/[;,\t]/).map(x => x.replace(/^"|"$/g, '').trim());
          const price = parseFloat(c[c.length - 1].replace(',', '.'));
          if (c[0] && !isNaN(price)) list.push({ product: c[0], store: c.length > 2 ? c[1] : '', price });
        }
      }
      state.priceReferences = [];
      for (const p of list) if (p.product && isFinite(p.price)) state.priceReferences.push({ id: uid(), ...p });
      list = state.priceReferences;
      saveState(`${list.length} prijzen geïmporteerd`);
    } catch { toast('Prijsbestand kon niet worden gelezen'); }
  };
  r.readAsText(file);
}

/* ---------- Events ---------- */
function handleClick(e) {
  const t = e.target.closest ? e.target : null;
  if (!t) return;
  const nav = t.closest('[data-page]');
  if (nav) { renderPage(nav.dataset.page); saveState(); return; }
  const action = t.closest('[data-action]');
  if (action) {
    const a = action.dataset.action;
    if (a === 'backup') exportData();
    else if (a === 'restore') $('#restoreInput')?.click();
    else if (a === 'export-prices') exportPrices();
    else if (a === 'sync-now') syncNow(true);
    else if (a === 'refresh-weather') loadWeather(true);
    return;
  }
  if (t.closest('#addBtn')) { openItemDialog(); return; }
  if (t.closest('[data-close-dialog]')) { closeDialog('#itemDialog'); return; }
  if (t.closest('[data-close-question]')) { closeDialog('#questionDialog'); return; }
  const ans = t.closest('[data-answer]');
  if (ans) { openQuestion(ans.dataset.answer); return; }
  const del = t.closest('[data-delete]');
  if (del) {
    if (del.dataset.delete === 'budget') state.budget.items = state.budget.items.filter(i => i.id !== del.dataset.id);
    else { const key = SECTIONS[del.dataset.delete].key || del.dataset.delete; state[key] = state[key].filter(i => i.id !== del.dataset.id); }
    saveState('Verwijderd'); renderPage(state.currentPage);
  }
}
function handleChange(e) {
  const t = e.target;
  if (t.matches && t.matches('[data-toggle]')) {
    const item = listOf(t.dataset.toggle).find(i => i.id === t.dataset.id);
    if (item) { item.done = t.checked; saveState(); renderPage(state.currentPage); }
  } else if (t.matches && t.matches('[data-setting]')) { state[t.dataset.setting] = t.value; applyTheme(); saveState('Opgeslagen'); }
  else if (t.id === 'restoreInput') { importData(t.files && t.files[0]); t.value = ''; }
  else if (t.id === 'priceFileInput') { importPrices(t.files && t.files[0]); t.value = ''; }
}
function handleSubmit(e) {
  const f = e.target;
  if (!f.matches) return;
  const data = Object.fromEntries(new FormData(f));
  if (f.matches('[data-quick-task]')) { e.preventDefault(); addTask(data.text); }
  else if (f.matches('[data-budget-form]')) { e.preventDefault(); state.budget.monthly = Number(data.monthly) || 0; saveState('Budget opgeslagen'); renderPage('budget'); }
  else if (f.matches('[data-budget-item]')) { e.preventDefault(); state.budget.items.unshift({ id: uid(), name: data.name, amount: Number(data.amount) || 0 }); saveState('Toegevoegd'); renderPage('budget'); }
  else if (f.matches('[data-weather-form]')) { e.preventDefault(); const city = String(data.weatherCity || '').trim(); if (city && saveConfig({ weatherCity: city })) { toast('Plaats opgeslagen'); loadWeather(true); } }
  else if (f.matches('[data-sync-form]')) {
    e.preventDefault();
    if (saveConfig({ supabaseUrl: String(data.supabaseUrl || '').trim(), supabaseKey: String(data.supabaseKey || '').trim(), household: String(data.household || '').trim(), updatedAt: '' })) {
      toast('Synchronisatie-instellingen opgeslagen');
      if (syncEnabled()) syncNow(true); else setSyncState('Alleen dit apparaat');
    }
  }
  else if (f.matches('[data-car-form]')) { e.preventDefault(); state.car = { ...state.car, ...data }; saveState('Autogegevens opgeslagen'); }
  else if (f.id === 'itemForm') {
    e.preventDefault();
    const page = $('#itemDialog')?.dataset.page || 'tasks';
    if (page === 'tasks') addTask(data.text, data); else addItem(page, data);
    closeDialog('#itemDialog');
  } else if (f.id === 'questionForm') {
    e.preventDefault();
    const answer = String(data.answer || '').trim();
    if (answer && data.person) {
      const day = state.dailyAnswers[todayKey()] = state.dailyAnswers[todayKey()] || {};
      day[data.person] = answer;
      saveState('Antwoord bewaard'); renderPage(state.currentPage);
    }
    closeDialog('#questionDialog');
  }
}

function init() {
  applyTheme();
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('submit', handleSubmit);
  renderPage(state.currentPage);
  window.addEventListener('online', () => { captureBrainyQuote(); syncNow(); });
  window.addEventListener('offline', () => setSyncState(syncEnabled() ? 'Offline' : 'Alleen dit apparaat'));
  captureBrainyQuote();
  syncNow();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
