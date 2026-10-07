import { todayKey, uid } from './utils.js';

export const STORAGE_KEY = 'samenThuisV2';
const PEOPLE = ['Kees', 'Daphne', 'Samen'];
const DASH_WIDGETS = ['tasks', 'quote', 'question', 'weather', 'agenda', 'groceries', 'challenges'];
const DASH_DEFAULT_VISIBLE = ['tasks', 'quote', 'question'];
const COLLECTIONS = ['tasks', 'agenda', 'challenges', 'programs', 'meals', 'groceries', 'deals', 'stock', 'home', 'dates', 'travel', 'extras'];
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isFiniteNumber = value => typeof value === 'number' && Number.isFinite(value);

export function defaultState() {
  return {
    version: 2, currentPage: 'today', theme: 'light', appearance: 'normal', minimalColor: '#315f86', showQuote: true, dashboard: [],
    weather: { place: 'Amsterdam', lat: 52.37, lon: 4.9 }, meta: { updatedAt: '' },
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

export function normalizeDashboard(list, showQuote = true) {
  const seen = new Set();
  const result = [];
  (Array.isArray(list) ? list : []).forEach(widget => {
    if (isObject(widget) && DASH_WIDGETS.includes(widget.id) && !seen.has(widget.id)) {
      seen.add(widget.id);
      result.push({ id: widget.id, visible: widget.visible !== false });
    }
  });
  DASH_WIDGETS.forEach(id => {
    if (!seen.has(id)) result.push({ id, visible: id === 'quote' ? showQuote !== false : DASH_DEFAULT_VISIBLE.includes(id) });
  });
  return result;
}

function validWeather(weather, fallback) {
  if (!isObject(weather)) return fallback;
  const lat = Number(weather.lat), lon = Number(weather.lon);
  return typeof weather.place === 'string' && weather.place.length <= 120
    && Number.isFinite(lat) && lat >= -90 && lat <= 90
    && Number.isFinite(lon) && lon >= -180 && lon <= 180
    ? { place: weather.place, lat, lon }
    : fallback;
}

function validItems(items) {
  return items.filter(isObject).map(item => {
    const safe = { ...item };
    safe.id = typeof safe.id === 'string' && safe.id.length <= 200 ? safe.id : uid();
    if ('done' in safe) safe.done = safe.done === true;
    return safe;
  });
}

export function validateState(saved) {
  if (!isObject(saved)) throw new TypeError('Back-up moet een JSON-object zijn');
  if (saved.version !== undefined && (!Number.isInteger(saved.version) || saved.version < 1 || saved.version > 2)) {
    throw new TypeError('Back-upversie wordt niet ondersteund');
  }
  for (const key of COLLECTIONS) {
    if (saved[key] !== undefined && !Array.isArray(saved[key])) throw new TypeError(`Ongeldige lijst: ${key}`);
  }
  if (saved.budget !== undefined && !isObject(saved.budget)) throw new TypeError('Ongeldig budget');
  if (saved.dailyAnswers !== undefined && !isObject(saved.dailyAnswers)) throw new TypeError('Ongeldige antwoorden');
  if (saved.car !== undefined && !isObject(saved.car)) throw new TypeError('Ongeldige autogegevens');
  if (saved.priceReferences !== undefined && !Array.isArray(saved.priceReferences)) throw new TypeError('Ongeldige prijzen');
  return saved;
}

export function mergeState(base, value) {
  const saved = validateState(value);
  const out = { ...base };
  for (const key of COLLECTIONS) {
    if (Array.isArray(saved[key])) out[key] = validItems(saved[key]);
  }
  if (Array.isArray(saved.priceReferences)) out.priceReferences = validItems(saved.priceReferences);

  if (isObject(saved.budget)) {
    out.budget = {
      ...base.budget,
      monthly: isFiniteNumber(saved.budget.monthly) && saved.budget.monthly >= 0 ? saved.budget.monthly : base.budget.monthly,
      items: Array.isArray(saved.budget.items) ? validItems(saved.budget.items) : base.budget.items
    };
  }
  if (isObject(saved.car)) out.car = { ...base.car, ...saved.car };

  if (isObject(saved.dailyAnswers)) {
    out.dailyAnswers = Object.fromEntries(Object.entries(saved.dailyAnswers)
      .filter(([, answers]) => isObject(answers))
      .map(([date, answers]) => [date, Object.fromEntries(PEOPLE
        .filter(person => typeof answers[person] === 'string')
        .map(person => [person, answers[person].slice(0, 800)]))]));
  }
  if (isObject(saved.meta)) out.meta = { updatedAt: typeof saved.meta.updatedAt === 'string' ? saved.meta.updatedAt : '' };
  out.weather = validWeather(saved.weather, base.weather);
  if (['light', 'dark'].includes(saved.theme)) out.theme = saved.theme;
  if (['normal', 'minimal'].includes(saved.appearance)) out.appearance = saved.appearance;
  if (typeof saved.minimalColor === 'string' && /^#[\da-f]{6}$/i.test(saved.minimalColor)) out.minimalColor = saved.minimalColor;
  if (typeof saved.showQuote === 'boolean') out.showQuote = saved.showQuote;
  if (typeof saved.currentPage === 'string' && saved.currentPage.length <= 40) out.currentPage = saved.currentPage;
  out.version = 2;
  out.dashboard = normalizeDashboard(saved.dashboard, out.showQuote);
  return out;
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    return raw ? mergeState(defaultState(), JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

export function persistState(value, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(value));
}
