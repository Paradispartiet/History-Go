#!/usr/bin/env node
/**
 * generate-place-coordinate-candidates.mjs
 * -----------------------------------------
 * Koordinatkandidat-pipeline v1.
 *
 * Henter koordinatkandidater for aktive place-filer fra åpne/tillatte kilder
 * (Wikidata, OpenStreetMap/Nominatim, OSM Overpass, offisielle adressefelt),
 * matcher på navn/kategori/område, gir en confidence score og en review-status
 * (auto_approved | needs_review | rejected).
 *
 * VIKTIG:
 *  - Dette verktøyet *endrer ikke* place-data. Det skriver bare rapporter.
 *  - Google Maps / Google Places / Google geocodes brukes ALDRI som skrapet
 *    eller lagret datakilde.
 *  - Kilder cacheres lokalt under tmp/coordinate-cache/ (git-ignorert) slik at
 *    verktøyet kan kjøres på nytt uten å spamme kildene. Nominatim/Overpass
 *    kalles med tydelig User-Agent og maks ~1 request/sekund per host.
 *  - Kjører nettverket utilgjengelig (f.eks. egress-allowlist), degraderer
 *    verktøyet trygt: kandidater fra cache brukes der de finnes, ellers settes
 *    stedet til needs_review ("ingen kilde funnet"). Reusables genereres alltid.
 *
 * CLI:
 *   --file data/places/by/oslo/places_by.json   analyser én aktiv fil
 *   --all-active                                 analyser alle aktive manifest-filer
 *   --only-needs-review                          bare steder uten verifisert koordinat
 *   --only-without-coord-metadata                bare steder uten coord-metadata
 *   --limit 25                                   begrens antall steder
 *   --dry-run                                    ikke skriv rapportfiler (bare logg)
 *   --offline / --no-network                     hopp over live nettverk (cache-only)
 *
 * Output:
 *   reports/place-coordinate-candidates.json
 *   reports/place-coordinate-candidates.md
 */

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'data/places/manifest.json');
const OUT_JSON = path.join(ROOT, 'reports/place-coordinate-candidates.json');
const OUT_MD = path.join(ROOT, 'reports/place-coordinate-candidates.md');
const CACHE_DIR = path.join(ROOT, 'tmp/coordinate-cache');
const UA =
  'HistoryGoCoordinateCandidates/1.0 (+https://github.com/paradispartiet/history-go; contact: paradispartiet@gmail.com)';

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const a = {
    file: null,
    allActive: false,
    onlyNeedsReview: false,
    onlyWithoutMeta: false,
    limit: null,
    dryRun: false,
    offline: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--all-active') a.allActive = true;
    else if (t === '--only-needs-review') a.onlyNeedsReview = true;
    else if (t === '--only-without-coord-metadata') a.onlyWithoutMeta = true;
    else if (t === '--dry-run') a.dryRun = true;
    else if (t === '--offline' || t === '--no-network') a.offline = true;
    else if (t === '--file') a.file = argv[++i];
    else if (t.startsWith('--file=')) a.file = t.slice('--file='.length);
    else if (t === '--limit') a.limit = Number(argv[++i]);
    else if (t.startsWith('--limit=')) a.limit = Number(t.slice('--limit='.length));
    else if (t === '--help' || t === '-h') a.help = true;
  }
  return a;
}

// ---------------------------------------------------------------------------
// Geo + tekst-helpere
// ---------------------------------------------------------------------------

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const round = (n, d = 6) => Math.round(n * 10 ** d) / 10 ** d;

function haversineM(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\/\-_,.()'"`’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Token-basert navnelikhet i [0,1] med containment-bonus. */
function nameSimilarity(a, b) {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return 0;
  const ta = na.split(' ').filter(Boolean);
  const tb = nb.split(' ').filter(Boolean);
  const sa = new Set(ta);
  const sb = new Set(tb);
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const jacc = inter / (sa.size + sb.size - inter || 1);
  const contain = na.includes(nb) || nb.includes(na) ? 0.88 : 0;
  const allPlaceTokensPresent = ta.every((t) => sb.has(t)) ? 0.82 : 0;
  return Math.max(jacc, contain, allPlaceTokensPresent);
}

function withinBox(lat, lon, box) {
  return lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon;
}

/** Forventet område/by/land utledet fra filsti (ingen normalisering av domener). */
function regionForFile(file) {
  const f = String(file || '').toLowerCase();
  if (/lisbon|lisboa|portugal/.test(f)) {
    return {
      key: 'lisbon',
      country: ['portugal'],
      cityHints: ['lisbon', 'lisboa', 'portugal'],
      box: { minLat: 38.6, maxLat: 38.95, minLon: -9.35, maxLon: -9.0 },
    };
  }
  if (/london|england|\/uk\//.test(f)) {
    return {
      key: 'london',
      country: ['united kingdom', 'england', 'uk', 'great britain'],
      cityHints: ['london', 'england', 'united kingdom'],
      box: { minLat: 51.2, maxLat: 51.75, minLon: -0.6, maxLon: 0.45 },
    };
  }
  // Standard: Oslo-området + Østlandet (Oslo, Akershus, Østfold/Viken).
  return {
    key: 'oslo',
    country: ['norway', 'norge'],
    cityHints: ['oslo', 'akershus', 'østfold', 'ostfold', 'viken', 'norge', 'norway'],
    box: { minLat: 58.7, maxLat: 60.7, minLon: 9.7, maxLon: 12.0 },
  };
}

// ---------------------------------------------------------------------------
// Fysisk stedstype + coordType/coordStatus-utledning
// ---------------------------------------------------------------------------

const RE_STREET = /(gate|gata|gaten|veien|vei$|vegen|allé|alle|gågate|strekning)/i;
const RE_AREA = /(park|parken|skog|marka|område|omrade|fjord|elv|elva|vann|dam|øy|oy|dal|gravlund|kirkegård|kirkegard|torg|plass|strand|holme|åsen|asen)/i;
const RE_STATUE = /(statue|statuen|byste|minnesmerke|monument|skulptur)/i;
const RE_HISTORICAL = /(revet|reven|tidligere|nedlagt|ruin|forsvunnet|historisk plass|opprinnelig)/i;
const RE_VENUE = /(museum|teater|kino|kirke|katedral|hus|hall|scene|klubb|bar|pub|kafe|kafé|café|restaurant|stadion|arena|bibliotek|galleri|senter|skole|universitet|institutt|fabrikk|bygg|bygning|hotell|kafeteria|domkirke|tempel|synagoge|moské)/i;

function physicalType(place) {
  const name = String(place.name || '');
  const txt = `${name} ${place.category || ''}`;
  const ct = String(place.coordType || '').toLowerCase();
  const note = String(place.coordNote || '');
  if (ct.includes('street') || RE_STREET.test(txt)) return 'street';
  if (RE_HISTORICAL.test(note) || RE_HISTORICAL.test(txt) || ct === 'historical_site') return 'historical';
  if (ct.includes('park') || ct.includes('area') || RE_AREA.test(txt)) return 'area';
  if (ct === 'statue' || RE_STATUE.test(txt)) return 'statue';
  if (RE_VENUE.test(txt)) return 'venue';
  return 'point';
}

function coordTypeFor(physType, place) {
  if (place.coordType) return place.coordType;
  switch (physType) {
    case 'street':
      return 'street_midpoint';
    case 'area':
      return 'area_center';
    case 'statue':
      return 'statue';
    case 'venue':
      return 'building_center';
    case 'historical':
      return 'historical_site';
    default:
      return 'approximate';
  }
}

function defaultPrecisionM(physType) {
  switch (physType) {
    case 'street':
      return 80;
    case 'area':
      return 150;
    case 'statue':
      return 15;
    case 'venue':
      return 40;
    case 'historical':
      return 100;
    default:
      return 50;
  }
}

/**
 * Grov kategori/type-sjekk mot Nominatim/Overpass-klasse/-tags.
 * Returnerer true (passer), false (passer dårlig) eller null (nøytral/ukjent).
 */
function categoryFits(physType, klass, type, tags) {
  const k = String(klass || '').toLowerCase();
  const t = String(type || '').toLowerCase();
  const tagKeys = tags ? Object.keys(tags).map((x) => x.toLowerCase()) : [];

  // Sterke "feil kategori"-signaler: store administrative enheter / land / stat.
  if (k === 'boundary' && /administrative|political/.test(t)) {
    if (physType !== 'area') return false;
  }
  if (k === 'place' && /(country|state|region|county|city|town|municipality)/.test(t)) {
    if (physType !== 'area') return false;
  }

  if (physType === 'street') {
    if (k === 'highway' || /road|street|residential|pedestrian|footway/.test(t)) return true;
    if (tagKeys.includes('highway')) return true;
    return null;
  }
  if (physType === 'area') {
    if (/leisure|natural|landuse|boundary|waterway/.test(k)) return true;
    if (tagKeys.some((x) => ['leisure', 'natural', 'landuse', 'waterway'].includes(x))) return true;
    return null;
  }
  if (physType === 'statue') {
    if (/historic|tourism|memorial|artwork|monument/.test(`${k} ${t}`)) return true;
    return null;
  }
  if (physType === 'venue') {
    if (/amenity|building|tourism|historic|shop|leisure|man_made|office/.test(k)) return true;
    if (tagKeys.some((x) => ['amenity', 'building', 'tourism', 'historic', 'shop', 'leisure'].includes(x)))
      return true;
    return null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Cache + ratelimited fetch (cache-first, degraderer trygt)
// ---------------------------------------------------------------------------

const caches = {}; // source -> { data: {}, dirty: bool }
const lastRequestAt = {}; // host -> ms
let consecutiveNetErrors = 0;
let networkBlocked = false;
const netStats = { attempts: 0, ok: 0, failed: 0, cacheHits: 0 };

async function loadCache(source) {
  if (caches[source]) return caches[source];
  const file = path.join(CACHE_DIR, `${source}.json`);
  let data = {};
  try {
    data = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    data = {};
  }
  caches[source] = { data, dirty: false };
  return caches[source];
}

function cacheGet(source, key) {
  return caches[source]?.data?.[key];
}
function cacheSet(source, key, value) {
  const c = caches[source];
  c.data[key] = value;
  c.dirty = true;
}

async function saveCaches() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  for (const [source, c] of Object.entries(caches)) {
    if (!c.dirty) continue;
    await fs.writeFile(path.join(CACHE_DIR, `${source}.json`), JSON.stringify(c.data, null, 2));
    c.dirty = false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rateLimit(host) {
  const now = Date.now();
  const wait = 1100 - (now - (lastRequestAt[host] || 0));
  if (wait > 0) await sleep(wait);
  lastRequestAt[host] = Date.now();
}

/**
 * Cachet henting. Returnerer { ok, data } eller { ok:false, error }.
 * Hopper over nettverk hvis offline/blokkert; bruker da bare cache.
 */
async function cachedFetch(source, key, url, { offline, json = true } = {}) {
  await loadCache(source);
  const hit = cacheGet(source, key);
  if (hit !== undefined) {
    netStats.cacheHits++;
    return hit;
  }
  if (offline || networkBlocked) {
    return { ok: false, error: 'offline_or_blocked', fromLive: false };
  }
  const host = new URL(url).host;
  await rateLimit(host);
  netStats.attempts++;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = json ? await res.json() : await res.text();
    const out = { ok: true, data, fetchedAt: new Date().toISOString() };
    cacheSet(source, key, out);
    netStats.ok++;
    consecutiveNetErrors = 0;
    return out;
  } catch (err) {
    netStats.failed++;
    consecutiveNetErrors++;
    if (consecutiveNetErrors >= 3 && !networkBlocked) {
      networkBlocked = true;
      console.warn(
        `  ⚠ Nettverk utilgjengelig (${String(err.message || err)}). Bytter til cache-only for resten av kjøringen.`
      );
    }
    const out = { ok: false, error: String(err.message || err), fromLive: true };
    // Cache ikke nettverksfeil – la senere kjøringer prøve igjen.
    return out;
  }
}

// ---------------------------------------------------------------------------
// Kilder
// ---------------------------------------------------------------------------

/** Wikidata: søk etter navn (no, så en), hent P625-koordinat for treff. */
async function wikidataCandidates(place, region, opts) {
  const out = [];
  const langs = ['nb', 'no', 'en'];
  const seen = new Set();
  for (const lang of langs) {
    const searchUrl = `${WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(
      place.name
    )}&language=${lang}&uselang=${lang}&format=json&limit=5&type=item`;
    const res = await cachedFetch('wikidata-search', `${lang}:${normName(place.name)}`, searchUrl, opts);
    if (!res.ok) continue;
    const hits = (res.data?.search || []).slice(0, 5);
    for (const h of hits) {
      if (seen.has(h.id)) continue;
      seen.add(h.id);
      const entUrl = `${WIKIDATA_API}?action=wbgetentities&ids=${h.id}&props=claims|labels|aliases&format=json`;
      const ent = await cachedFetch('wikidata-entity', h.id, entUrl, opts);
      if (!ent.ok) continue;
      const entity = ent.data?.entities?.[h.id];
      const coordClaim = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (!coordClaim || !isNum(coordClaim.latitude) || !isNum(coordClaim.longitude)) continue;
      const labelCandidates = [];
      for (const l of Object.values(entity.labels || {})) labelCandidates.push(l.value);
      for (const arr of Object.values(entity.aliases || {}))
        for (const al of arr) labelCandidates.push(al.value);
      const bestLabel = labelCandidates
        .map((lbl) => ({ lbl, sim: nameSimilarity(place.name, lbl) }))
        .sort((a, b) => b.sim - a.sim)[0] || { lbl: h.label || h.id, sim: nameSimilarity(place.name, h.label || '') };
      // P31 (instance of) brukes ikke for hard kategorisjekk her -> nøytral.
      out.push({
        source: 'wikidata',
        method: 'wikidata',
        lat: coordClaim.latitude,
        lon: coordClaim.longitude,
        matchedName: bestLabel.lbl,
        matchedAddress: '',
        display: `${bestLabel.lbl} (${h.id})`,
        nameSim: bestLabel.sim,
        categoryOk: null,
        sourceId: h.id,
        sourceUrl: `https://www.wikidata.org/wiki/${h.id}`,
        precisionM: isNum(coordClaim.precision) ? Math.max(5, Math.round(coordClaim.precision * 111000)) : 30,
      });
    }
  }
  return out;
}

/** Nominatim: søk navn (+ adresse hvis tilgjengelig) + by + land. */
async function nominatimCandidates(place, region, opts) {
  const out = [];
  const address =
    place.address || place.adresse || place.addr || place.streetAddress || null;
  const queries = [];
  if (address) queries.push({ q: `${address}`, method: 'official_address', addr: address });
  queries.push({ q: `${place.name}, ${region.cityHints[0]}, ${region.country[0]}`, method: 'nominatim', addr: '' });
  for (const { q, method, addr } of queries) {
    const url = `${NOMINATIM_API}?q=${encodeURIComponent(q)}&format=jsonv2&limit=5&addressdetails=1`;
    const res = await cachedFetch('nominatim', normName(q), url, opts);
    if (!res.ok) continue;
    for (const r of (res.data || []).slice(0, 5)) {
      const lat = Number(r.lat);
      const lon = Number(r.lon);
      if (!isNum(lat) || !isNum(lon)) continue;
      out.push({
        source: 'nominatim',
        method,
        lat,
        lon,
        matchedName: r.name || r.display_name || '',
        matchedAddress: addr || r.display_name || '',
        display: r.display_name || '',
        nameSim: nameSimilarity(place.name, r.name || r.display_name || ''),
        categoryOk: categoryFits(place._physType, r.class, r.type, null),
        sourceId: `${r.osm_type}:${r.osm_id}`,
        sourceUrl: r.osm_type && r.osm_id ? `https://www.openstreetmap.org/${r.osm_type}/${r.osm_id}` : '',
        precisionM: r.place_rank && r.place_rank >= 26 ? 30 : 80,
      });
    }
  }
  return out;
}

/** Overpass: nær-søk rundt nåværende punkt for venues/parker/bygninger. */
async function overpassCandidates(place, region, opts) {
  if (!isNum(place.lat) || !isNum(place.lon)) return [];
  if (!['venue', 'area', 'statue', 'point'].includes(place._physType)) return [];
  const safeName = String(place.name).replace(/[\\"\n]/g, ' ').slice(0, 60);
  const around = place._physType === 'area' ? 1200 : 500;
  const query = `[out:json][timeout:25];nwr["name"~"${safeName}",i](around:${around},${place.lat},${place.lon});out center 5;`;
  const url = `${OVERPASS_API}?data=${encodeURIComponent(query)}`;
  const res = await cachedFetch('overpass', `${round(place.lat, 4)},${round(place.lon, 4)}:${normName(safeName)}`, url, opts);
  if (!res.ok) return [];
  const out = [];
  for (const el of (res.data?.elements || []).slice(0, 5)) {
    const lat = isNum(el.lat) ? el.lat : el.center?.lat;
    const lon = isNum(el.lon) ? el.lon : el.center?.lon;
    if (!isNum(lat) || !isNum(lon)) continue;
    const tags = el.tags || {};
    out.push({
      source: 'overpass',
      method: 'overpass',
      lat,
      lon,
      matchedName: tags.name || '',
      matchedAddress: [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' '),
      display: `${tags.name || ''} ${Object.keys(tags).slice(0, 4).join(',')}`,
      nameSim: nameSimilarity(place.name, tags.name || ''),
      categoryOk: categoryFits(place._physType, null, null, tags),
      sourceId: `${el.type}:${el.id}`,
      sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      precisionM: el.type === 'node' ? 25 : 80,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Scoring + approval
// ---------------------------------------------------------------------------

function scoreCandidate(place, cand, region) {
  const reasons = [];
  const warnings = [];
  const inBox = withinBox(cand.lat, cand.lon, region.box);
  const display = normName(cand.display);
  const cityOk =
    region.cityHints.some((h) => display.includes(normName(h))) ||
    region.country.some((h) => display.includes(normName(h)));

  if (!inBox && !cityOk) {
    warnings.push('utenfor forventet område/by/land');
    return { confidence: 0.05, reasons, warnings, regionOk: false, inBox, cityOk };
  }
  if (inBox) reasons.push('innenfor forventet geografisk område');
  else if (cityOk) reasons.push('riktig by/land i kildetekst');

  let c =
    cand.source === 'wikidata'
      ? 0.6
      : cand.source === 'overpass'
        ? 0.58
        : cand.method === 'official_address'
          ? 0.62
          : 0.5;

  const sim = cand.nameSim || 0;
  if (sim >= 0.95) {
    c += 0.27;
    reasons.push('navn matcher svært sterkt');
  } else if (sim >= 0.8) {
    c += 0.18;
    reasons.push('navn matcher godt');
  } else if (sim >= 0.6) {
    c += 0.08;
    reasons.push('navn matcher delvis');
  } else {
    c -= 0.12;
    warnings.push('svak navnematch');
  }

  if (cand.categoryOk === true) {
    c += 0.08;
    reasons.push('kategori/type passer');
  } else if (cand.categoryOk === false) {
    c -= 0.25;
    warnings.push('kategori/type passer dårlig');
  }

  c = Math.max(0, Math.min(0.99, c));
  return { confidence: round(c, 3), reasons, warnings, regionOk: true, inBox, cityOk };
}

function decideApproval(ctx) {
  const { physType, chosen, crossAgree, currentHasCoord, distanceFromCurrentM, regionValid } = ctx;

  if (!chosen) {
    return { status: 'needs_review', reason: 'Ingen kilde funnet (mangler treff eller nettverk utilgjengelig).' };
  }
  if (!regionValid) {
    return { status: 'rejected', reason: 'Beste treff er i feil by/land eller for svakt – ikke brukbart.' };
  }

  const conf = chosen.confidence;
  const sim = chosen.nameSim || 0;
  const strongSource = ['wikidata', 'overpass', 'official_address'].includes(chosen.method);

  // Harde reject-sjekker.
  if (chosen.categoryOk === false) {
    return { status: 'rejected', reason: 'Kandidatens kategori/type passer ikke stedet.' };
  }
  if (sim < 0.45) {
    return { status: 'rejected', reason: 'Navn matcher for dårlig.' };
  }
  if (currentHasCoord && distanceFromCurrentM > 5000 && conf < 0.85) {
    return { status: 'rejected', reason: 'Kandidat ligger urimelig langt unna uten sterkt kildegrunnlag.' };
  }

  // Gater: aldri auto-approve på et tilfeldig midtpunkt.
  if (physType === 'street') {
    return {
      status: 'needs_review',
      reason: 'Gate: hovedpunkt/way-midtpunkt må kontrolleres visuelt (street_marker_needs_visual_review).',
    };
  }

  // Parker/områder: semantic_anchor; auto bare ved sterk, flerkildig enighet.
  if (physType === 'area') {
    if (conf >= 0.9 && crossAgree >= 1) {
      return { status: 'auto_approved', reason: 'Område: representativt punkt med sterk kilde og flerkildig enighet.' };
    }
    return { status: 'needs_review', reason: 'Område/park: bekreft at punktet ligger inne i området (semantic_anchor).' };
  }

  // Historiske/revne steder: ikke auto uten meget sterk kilde.
  if (physType === 'historical') {
    if (conf >= 0.92 && strongSource && sim >= 0.85) {
      return { status: 'auto_approved', reason: 'Historisk sted med meget sterk og presis kilde.' };
    }
    return { status: 'needs_review', reason: 'Historisk/revet sted: plassering må verifiseres manuelt.' };
  }

  // Venue/statue/point.
  // Regel B: flere uavhengige kilder innen 30 m.
  if (crossAgree >= 2 && conf >= 0.85 && sim >= 0.8) {
    return { status: 'auto_approved', reason: 'To uavhengige kilder peker på samme sted (<30 m).' };
  }
  // Regel C: nåværende punkt tydelig feil og kandidat svært sterk.
  if (currentHasCoord && distanceFromCurrentM > 100 && conf >= 0.9 && sim >= 0.85) {
    return {
      status: 'auto_approved',
      reason: `Nåværende punkt ${Math.round(distanceFromCurrentM)} m unna; sterk kandidat med riktig område/kategori.`,
    };
  }
  // Regel A: presist adresse-/byggtreff.
  if (conf >= 0.9 && sim >= 0.85) {
    return { status: 'auto_approved', reason: 'Presist navne-/adressetreff med riktig område og kategori.' };
  }

  return { status: 'needs_review', reason: 'Treff funnet, men confidence under auto-terskel.' };
}

function coordStatusFor(physType, approvalStatus) {
  if (physType === 'street' || physType === 'area') return 'semantic_anchor';
  if (approvalStatus === 'auto_approved') return 'verified';
  return 'needs_review';
}

// ---------------------------------------------------------------------------
// Innlasting av aktive steder
// ---------------------------------------------------------------------------

const isArchivePath = (p) => /(^|\/)arkiv(\/|$)/i.test(p);

function toPlaces(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.places)) return payload.places;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

function normalizeFileArg(arg) {
  let f = String(arg).replace(/\\/g, '/').replace(/^\.\//, '');
  if (f.startsWith('data/')) f = f.slice('data/'.length);
  return f;
}

async function loadActiveFiles(args) {
  const manifest = await readJson(MANIFEST);
  let files = (manifest.files || []).filter((f) => !isArchivePath(f));
  if (args.file) {
    const want = normalizeFileArg(args.file);
    const match = files.find((f) => f === want || f.endsWith(want) || normalizeFileArg(f) === want);
    if (!match) {
      throw new Error(`Fil ikke funnet blant aktive manifest-filer: ${args.file}`);
    }
    files = [match];
  }
  return files;
}

function passesFilters(place, args) {
  const hasMeta =
    typeof place.coordStatus === 'string' ||
    typeof place.coordSource === 'string' ||
    typeof place.coordType === 'string';
  if (args.onlyWithoutMeta && hasMeta) return false;
  if (args.onlyNeedsReview && place.coordStatus === 'verified') return false;
  return true;
}

// ---------------------------------------------------------------------------
// Hovedflyt
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Se filhode for CLI-flagg. Eksempel:');
    console.log('  node tools/generate-place-coordinate-candidates.mjs --all-active --limit 25');
    return;
  }
  // Standard: hvis verken --file eller --all-active er gitt, analyser alle aktive filer.
  if (!args.file && !args.allActive) args.allActive = true;

  const files = await loadActiveFiles(args);

  // Bygg liste over steder å analysere (etter filtre, før limit).
  const places = [];
  for (const rel of files) {
    const abs = path.join(ROOT, 'data', rel);
    let arr;
    try {
      arr = toPlaces(await readJson(abs));
    } catch (err) {
      console.warn(`  ⚠ Hopper over ${rel}: ${String(err.message || err)}`);
      continue;
    }
    for (const p of arr) {
      if (!passesFilters(p, args)) continue;
      places.push({ file: `data/${rel}`, place: p });
    }
  }

  const selected = isNum(args.limit) && args.limit > 0 ? places.slice(0, args.limit) : places;

  console.log(
    `Analyserer ${selected.length} steder fra ${files.length} fil(er)` +
      `${args.offline ? ' (offline)' : ''}${args.dryRun ? ' (dry-run)' : ''}...`
  );

  const opts = { offline: args.offline };
  const candidates = [];

  for (const { file, place } of selected) {
    const region = regionForFile(file);
    place._physType = physicalType(place);
    const physType = place._physType;
    const currentHasCoord = isNum(place.lat) && isNum(place.lon);

    // Hent kandidater fra alle kilder.
    let raw = [];
    try {
      const [wd, nom, over] = [
        await wikidataCandidates(place, region, opts),
        await nominatimCandidates(place, region, opts),
        await overpassCandidates(place, region, opts),
      ];
      raw = [...wd, ...nom, ...over];
    } catch (err) {
      console.warn(`  ⚠ Kildefeil for ${place.id}: ${String(err.message || err)}`);
    }

    // Skår hver kandidat.
    const scored = raw.map((cand) => {
      const s = scoreCandidate(place, cand, region);
      const distanceFromCurrentM = currentHasCoord
        ? Math.round(haversineM(place.lat, place.lon, cand.lat, cand.lon))
        : null;
      return { ...cand, ...s, distanceFromCurrentM };
    });

    const valid = scored.filter((c) => c.regionOk).sort((a, b) => b.confidence - a.confidence);
    const pool = scored.slice().sort((a, b) => b.confidence - a.confidence);
    const chosen = valid[0] || pool[0] || null;
    const regionValid = Boolean(valid[0]);

    // Kryss-kilde-enighet: distinkte kilder innen 30 m av valgt kandidat.
    let crossAgree = 0;
    if (chosen) {
      const sources = new Set();
      for (const c of valid) {
        if (haversineM(chosen.lat, chosen.lon, c.lat, c.lon) <= 30) sources.add(c.source);
      }
      crossAgree = sources.size;
    }

    const distanceFromCurrentM = chosen?.distanceFromCurrentM ?? null;
    const approval = decideApproval({
      physType,
      chosen,
      crossAgree,
      currentHasCoord,
      distanceFromCurrentM: distanceFromCurrentM ?? 0,
      regionValid,
    });

    const coordStatus = coordStatusFor(physType, approval.status);
    const warnings = chosen ? [...new Set(chosen.warnings)] : ['ingen kandidat funnet'];
    if (physType === 'street') warnings.push('street_marker_needs_visual_review');
    if (chosen && crossAgree >= 2) (chosen.reasons || []).push(`${crossAgree} uavhengige kilder innen 30 m`);

    candidates.push({
      placeId: place.id ?? null,
      file,
      name: place.name ?? null,
      category: place.category ?? null,
      physType,
      current: {
        lat: isNum(place.lat) ? place.lat : null,
        lon: isNum(place.lon) ? place.lon : null,
        r: isNum(place.r) ? place.r : null,
      },
      candidate: chosen
        ? {
            lat: round(chosen.lat),
            lon: round(chosen.lon),
            r: isNum(place.r) ? place.r : defaultPrecisionM(physType) * 3,
            coordType: coordTypeFor(physType, place),
            coordStatus,
            coordSource: chosen.source,
            coordSourceId: chosen.sourceId || null,
            coordSourceUrl: chosen.sourceUrl || null,
            coordPrecisionM: chosen.precisionM ?? defaultPrecisionM(physType),
            coordNote: `${chosen.method}-treff "${chosen.matchedName}" (${approval.status}).`,
          }
        : null,
      match: {
        method: chosen?.method ?? null,
        matchedName: chosen?.matchedName ?? null,
        matchedAddress: chosen?.matchedAddress ?? null,
        distanceFromCurrentM,
        confidence: chosen?.confidence ?? 0,
        reasons: chosen ? [...new Set(chosen.reasons)] : [],
        warnings: [...new Set(warnings)],
      },
      approval: {
        status: approval.status,
        reason: approval.reason,
      },
    });
  }

  // category_overlap: samme fysiske navn på tvers av kategorier.
  const byName = new Map();
  for (const c of candidates) {
    const key = normName(c.name);
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(c);
  }
  const categoryOverlap = [];
  for (const [key, group] of byName) {
    const cats = new Set(group.map((g) => g.category));
    if (group.length >= 2 && cats.size >= 2) {
      for (const g of group) {
        if (!g.match.warnings.includes('category_overlap')) g.match.warnings.push('category_overlap');
      }
      categoryOverlap.push({
        name: group[0].name,
        normalized: key,
        categories: [...cats],
        placeIds: group.map((g) => g.placeId),
        files: [...new Set(group.map((g) => g.file))],
      });
    }
  }

  // Oppsummering.
  const summary = {
    generatedAt: new Date().toISOString(),
    analyzed: candidates.length,
    filesAnalyzed: files.length,
    offline: Boolean(args.offline) || networkBlocked,
    dryRun: Boolean(args.dryRun),
    auto_approved: candidates.filter((c) => c.approval.status === 'auto_approved').length,
    needs_review: candidates.filter((c) => c.approval.status === 'needs_review').length,
    rejected: candidates.filter((c) => c.approval.status === 'rejected').length,
    categoryOverlapCount: categoryOverlap.length,
    network: netStats,
  };

  await saveCaches();

  const payload = {
    ...summary,
    userAgent: UA,
    sources: ['wikidata', 'nominatim', 'overpass', 'official_address'],
    note: 'Google Maps / Google Places / Google geocodes brukes ikke som skrapet eller lagret datakilde.',
    categoryOverlap,
    candidates,
  };

  if (args.dryRun) {
    console.log(
      `Dry-run: ${summary.analyzed} steder | auto_approved=${summary.auto_approved} ` +
        `needs_review=${summary.needs_review} rejected=${summary.rejected} | ` +
        `nett: ${netStats.ok} ok / ${netStats.failed} feil / ${netStats.cacheHits} cache. Ingen rapport skrevet.`
    );
    return;
  }

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(payload, null, 2));
  await fs.writeFile(OUT_MD, renderMarkdown(payload));

  console.log(
    `Skrev ${path.relative(ROOT, OUT_JSON)} og ${path.relative(ROOT, OUT_MD)}.\n` +
      `  analysert=${summary.analyzed} auto_approved=${summary.auto_approved} ` +
      `needs_review=${summary.needs_review} rejected=${summary.rejected} ` +
      `category_overlap=${summary.categoryOverlapCount}\n` +
      `  nett: ${netStats.ok} ok / ${netStats.failed} feil / ${netStats.cacheHits} cache-treff` +
      `${summary.offline ? ' (offline/cache-only)' : ''}.`
  );
}

// ---------------------------------------------------------------------------
// Rapport (Markdown)
// ---------------------------------------------------------------------------

function mdEsc(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function renderMarkdown(payload) {
  const c = payload.candidates;
  const byConf = c
    .filter((x) => x.candidate)
    .slice()
    .sort((a, b) => b.match.confidence - a.match.confidence);
  const top50 = byConf.slice(0, 50);
  const farFromCurrent = c
    .filter((x) => isNum(x.match.distanceFromCurrentM) && x.match.distanceFromCurrentM > 150)
    .sort((a, b) => b.match.distanceFromCurrentM - a.match.distanceFromCurrentM);
  const likelyWrong = c.filter(
    (x) =>
      x.candidate &&
      isNum(x.match.distanceFromCurrentM) &&
      x.match.distanceFromCurrentM > 100 &&
      x.match.confidence >= 0.8
  );
  const noMatch = c.filter((x) => !x.candidate || x.approval.status === 'rejected');

  let md = `# Place coordinate candidates (pipeline v1)\n\n`;
  md += `Generert: ${payload.generatedAt}\n\n`;
  md += `> Maskinell, kildebasert kandidatgenerering. **Ingen place-koordinater er endret av dette verktøyet.**\n`;
  md += `> Kilder: ${payload.sources.join(', ')}. ${payload.note}\n\n`;

  md += `## Oppsummering\n`;
  md += `- Steder analysert: **${payload.analyzed}** (fra ${payload.filesAnalyzed} fil(er))\n`;
  md += `- auto_approved: **${payload.auto_approved}**\n`;
  md += `- needs_review: **${payload.needs_review}**\n`;
  md += `- rejected: **${payload.rejected}**\n`;
  md += `- category_overlap-funn: **${payload.categoryOverlapCount}**\n`;
  md += `- Modus: ${payload.offline ? 'offline/cache-only' : 'live'} ` +
    `(nett: ${payload.network.ok} ok / ${payload.network.failed} feil / ${payload.network.cacheHits} cache-treff)\n\n`;
  if (payload.offline) {
    md += `> ⚠ Nettverk var utilgjengelig eller deaktivert. Steder uten cachet kilde står som needs_review ` +
      `(«ingen kilde funnet»). Kjør på nytt med nettverkstilgang for å fylle inn kandidater.\n\n`;
  }

  md += `## Confidence-regler\n`;
  md += `- **auto_approved**: Regel A (presist navne-/adressetreff, riktig område+kategori, conf ≥ 0.90), ` +
    `Regel B (≥2 uavhengige kilder innen 30 m, conf ≥ 0.85) eller Regel C (nåværende punkt > 100 m unna + sterk kandidat, conf ≥ 0.90).\n`;
  md += `- **needs_review**: kun navnematch, upresis kilde, historisk/revet, gate/område-anker, eller flere mulige treff.\n`;
  md += `- **rejected**: feil by/land, feil kategori, dårlig navnematch eller urimelig avstand uten kildegrunnlag.\n\n`;

  md += `## Topp 50 kandidater (høyest confidence)\n\n`;
  md += `| # | placeId | name | kategori | metode | conf | status | dist_m | kilde |\n`;
  md += `| ---: | --- | --- | --- | --- | ---: | --- | ---: | --- |\n`;
  top50.forEach((x, i) => {
    md += `| ${i + 1} | ${mdEsc(x.placeId)} | ${mdEsc(x.name)} | ${mdEsc(x.category)} | ${mdEsc(
      x.match.method
    )} | ${x.match.confidence} | ${x.approval.status} | ${x.match.distanceFromCurrentM ?? ''} | ${mdEsc(
      x.candidate?.coordSourceId
    )} |\n`;
  });
  if (top50.length === 0) md += `| – | – | – | – | – | – | – | – | – |\n`;
  md += `\n`;

  md += `## Steder med stor avstand fra nåværende punkt (> 150 m)\n\n`;
  md += `| placeId | name | dist_m | conf | status | metode |\n| --- | --- | ---: | ---: | --- | --- |\n`;
  for (const x of farFromCurrent.slice(0, 100)) {
    md += `| ${mdEsc(x.placeId)} | ${mdEsc(x.name)} | ${x.match.distanceFromCurrentM} | ${x.match.confidence} | ${x.approval.status} | ${mdEsc(x.match.method)} |\n`;
  }
  if (farFromCurrent.length === 0) md += `| – | – | – | – | – | – |\n`;
  md += `\n`;

  md += `## Steder der nåværende koordinat sannsynligvis er feil\n\n`;
  md += `Sterk kandidat (conf ≥ 0.80) > 100 m fra nåværende punkt.\n\n`;
  md += `| placeId | name | dist_m | conf | status | coordSourceUrl |\n| --- | --- | ---: | ---: | --- | --- |\n`;
  for (const x of likelyWrong.slice(0, 100)) {
    md += `| ${mdEsc(x.placeId)} | ${mdEsc(x.name)} | ${x.match.distanceFromCurrentM} | ${x.match.confidence} | ${x.approval.status} | ${mdEsc(x.candidate?.coordSourceUrl)} |\n`;
  }
  if (likelyWrong.length === 0) md += `| – | – | – | – | – | – |\n`;
  md += `\n`;

  md += `## category_overlap (samme fysiske navn i flere kategorier)\n\n`;
  md += `Kan være samme fysiske venue (f.eks. Blå i musikk og subkultur) – ikke nødvendigvis feil duplikat.\n\n`;
  md += `| name | kategorier | placeIds | filer |\n| --- | --- | --- | --- |\n`;
  for (const o of payload.categoryOverlap) {
    md += `| ${mdEsc(o.name)} | ${mdEsc(o.categories.join(', '))} | ${mdEsc(o.placeIds.join(', '))} | ${mdEsc(
      o.files.map((f) => f.replace(/^data\/places\//, '')).join(', ')
    )} |\n`;
  }
  if (payload.categoryOverlap.length === 0) md += `| – | – | – | – |\n`;
  md += `\n`;

  md += `## Steder der pipeline ikke fant godt treff (needs_review uten kandidat / rejected)\n\n`;
  md += `| placeId | name | kategori | status | grunn |\n| --- | --- | --- | --- | --- |\n`;
  for (const x of noMatch.slice(0, 200)) {
    md += `| ${mdEsc(x.placeId)} | ${mdEsc(x.name)} | ${mdEsc(x.category)} | ${x.approval.status} | ${mdEsc(
      x.approval.reason
    )} |\n`;
  }
  if (noMatch.length === 0) md += `| – | – | – | – | – |\n`;
  md += `\n`;

  md += `## Neste steg\n`;
  md += `- Gå gjennom needs_review manuelt mot kart.\n`;
  md += `- En senere PR kan apply'e auto_approved-kandidater via et eget apply-verktøy (ikke del av denne PR-en).\n`;
  return md;
}

main().catch((err) => {
  console.error(`Feil: ${String(err.stack || err)}`);
  process.exit(1);
});
