import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const verifiedAt = '2026-07-23';
const reportDir = path.join(root, 'reports', 'etne-natur-batch-2');
const sourceDir = path.join(reportDir, 'sources');
const manifestPath = path.join(root, 'data', 'places', 'manifest.json');
const targetDir = path.join(root, 'data', 'places', 'natur', 'vestland', 'etne');
const kommuneUrl = 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/';
const friluftUrl = 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/friluftsomrade/';
const friluftCurrentUrl = 'https://www.etne.kommune.no/kultur-og-fritid/idrett-og-friluftsliv/friluftsliv/';
const fishingUrl = 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/innlandsfiske/';
const nveMosnesUrl = 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-2-mosneselva/';
const nveEtneUrl = 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/041-1-etnevassdraget/';

await fs.mkdir(sourceDir, { recursive: true });
await fs.mkdir(targetDir, { recursive: true });

const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .trim();

const slug = (value) => normalize(value).replace(/\s+/g, '-');

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go coordinate research (Paradispartiet/History-Go)',
      'Accept': 'application/json, application/geo+json, text/plain;q=0.8, */*;q=0.5'
    }
  });
  const text = await response.text();
  return { response, text };
}

async function fetchJson(url, reportName, { allowFailure = false } = {}) {
  const { response, text } = await fetchText(url);
  await fs.writeFile(path.join(sourceDir, `${reportName}.txt`), text, 'utf8');
  if (!response.ok) {
    if (allowFailure) return null;
    throw new Error(`${url} returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  try {
    const json = JSON.parse(text);
    await writeJson(path.join(sourceDir, `${reportName}.json`), json);
    return json;
  } catch (error) {
    if (allowFailure) return null;
    throw new Error(`Could not parse JSON from ${url}: ${error}`);
  }
}

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pointFrom(value) {
  if (!value || typeof value !== 'object') return null;
  if (value.type === 'Point' && Array.isArray(value.coordinates) && value.coordinates.length >= 2) {
    const lon = numeric(value.coordinates[0]);
    const lat = numeric(value.coordinates[1]);
    if (lat != null && lon != null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
  }
  for (const key of ['representasjonspunkt', 'representationPoint', 'punkt', 'point', 'geometry']) {
    if (value[key] && value[key] !== value) {
      const nested = pointFrom(value[key]);
      if (nested) return nested;
    }
  }
  for (const key of ['coordinates', 'koordinater']) {
    if (Array.isArray(value[key]) && value[key].length >= 2 && !Array.isArray(value[key][0])) {
      const lon = numeric(value[key][0]);
      const lat = numeric(value[key][1]);
      if (lat != null && lon != null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
    }
  }
  const lat = numeric(value.lat ?? value.latitude ?? value.nord ?? value.north ?? value.y);
  const lon = numeric(value.lon ?? value.lng ?? value.longitude ?? value.øst ?? value.ost ?? value.east ?? value.x);
  if (lat != null && lon != null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
  return null;
}

function stringsWithin(value, depth = 0, out = []) {
  if (depth > 4 || value == null) return out;
  if (typeof value === 'string') {
    if (value.trim()) out.push(value.trim());
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) stringsWithin(item, depth + 1, out);
    return out;
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (['geometry', 'coordinates', 'koordinater'].includes(key)) continue;
      stringsWithin(item, depth + 1, out);
    }
  }
  return out;
}

function candidateId(value) {
  if (!value || typeof value !== 'object') return null;
  for (const key of ['stedsnummer', 'stednummer', 'id', 'objectid', 'OBJECTID', 'globalId', 'GlobalID']) {
    const candidate = value[key];
    if (candidate != null && String(candidate).trim()) return String(candidate).trim();
  }
  return null;
}

function collectPointCandidates(value, pathParts = [], out = []) {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectPointCandidates(item, [...pathParts, String(index)], out));
    return out;
  }
  const point = pointFrom(value);
  if (point && (value.representasjonspunkt || value.geometry?.type === 'Point' || value.type === 'Point')) {
    out.push({
      ...point,
      path: pathParts.join('.'),
      strings: [...new Set(stringsWithin(value))],
      sourceId: candidateId(value)
    });
  }
  for (const [key, item] of Object.entries(value)) collectPointCandidates(item, [...pathParts, key], out);
  return out;
}

function scoreCandidate(candidate, aliases) {
  const haystack = candidate.strings.map(normalize).join(' | ');
  let score = 0;
  for (const alias of aliases.map(normalize)) {
    if (!alias) continue;
    if (candidate.strings.some((value) => normalize(value) === alias)) score += 100;
    if (haystack.includes(alias)) score += 25;
  }
  if (haystack.includes('etne')) score += 5;
  return score;
}

async function resolveSsr(label, aliases) {
  const attempts = [];
  for (const alias of aliases) {
    const params = new URLSearchParams({ knr: '4611', sok: alias, treffPerSide: '100', side: '1', utkoordsys: '4258' });
    const primaryUrl = `https://api.kartverket.no/stedsnavn/v1/sted?${params}`;
    let json = await fetchJson(primaryUrl, `ssr-${slug(label)}-${slug(alias)}-4258`, { allowFailure: true });
    let usedUrl = primaryUrl;
    if (!json) {
      params.delete('utkoordsys');
      usedUrl = `https://api.kartverket.no/stedsnavn/v1/sted?${params}`;
      json = await fetchJson(usedUrl, `ssr-${slug(label)}-${slug(alias)}-default`, { allowFailure: true });
    }
    if (!json) continue;
    const candidates = collectPointCandidates(json)
      .map((candidate) => ({ ...candidate, score: scoreCandidate(candidate, [alias, label]) }))
      .filter((candidate) => Number.isFinite(candidate.lat) && Number.isFinite(candidate.lon))
      .sort((a, b) => b.score - a.score);
    attempts.push({ alias, url: usedUrl, candidates });
    if (candidates.length && candidates[0].score >= 25) {
      const best = candidates[0];
      return {
        lat: Number(best.lat.toFixed(7)),
        lon: Number(best.lon.toFixed(7)),
        sourceProvider: 'kartverket',
        sourceObjectId: `kartverket-ssr:${best.sourceId || `${slug(alias)}:${best.lat},${best.lon}`}`,
        sourceUrl: usedUrl,
        matchedAlias: alias,
        score: best.score,
        candidate: best
      };
    }
  }
  await writeJson(path.join(reportDir, `unresolved-${slug(label)}.json`), attempts);
  return null;
}

async function resolveNominatim(label, queries) {
  for (const query of queries) {
    const params = new URLSearchParams({ format: 'jsonv2', limit: '10', countrycodes: 'no', q: `${query}, Etne, Vestland, Norge` });
    const url = `https://nominatim.openstreetmap.org/search?${params}`;
    const json = await fetchJson(url, `osm-${slug(label)}-${slug(query)}`, { allowFailure: true });
    if (!Array.isArray(json)) continue;
    const wanted = normalize(query);
    const candidates = json
      .map((row) => ({
        row,
        lat: numeric(row?.lat),
        lon: numeric(row?.lon),
        name: String(row?.name || row?.display_name || ''),
        score: normalize(row?.display_name || row?.name || '').includes(wanted) ? 50 : 0
      }))
      .filter((row) => row.lat != null && row.lon != null)
      .sort((a, b) => b.score - a.score);
    if (candidates.length && candidates[0].score > 0) {
      const best = candidates[0];
      return {
        lat: Number(best.lat.toFixed(7)),
        lon: Number(best.lon.toFixed(7)),
        sourceProvider: 'osm',
        sourceObjectId: `osm:${best.row.osm_type || 'object'}:${best.row.osm_id}`,
        sourceUrl: url,
        matchedAlias: query,
        score: best.score,
        candidate: best.row
      };
    }
  }
  return null;
}

async function resolveNamedArea(label, aliases, { allowSemanticFallback = false } = {}) {
  const ssr = await resolveSsr(label, aliases);
  if (ssr) return { ...ssr, exact: true };
  const osm = await resolveNominatim(label, aliases);
  if (osm) return { ...osm, exact: true };
  if (!allowSemanticFallback) throw new Error(`Could not resolve a named official/map object for ${label}`);
  return null;
}

function extractGeometry(value) {
  if (!value || typeof value !== 'object') return null;
  if (['Polygon', 'MultiPolygon'].includes(value.type) && Array.isArray(value.coordinates)) return value;
  if (value.type === 'Feature' && value.geometry) return extractGeometry(value.geometry);
  if (value.type === 'FeatureCollection' && Array.isArray(value.features)) {
    for (const feature of value.features) {
      const geometry = extractGeometry(feature);
      if (geometry) return geometry;
    }
  }
  for (const item of Object.values(value)) {
    const geometry = extractGeometry(item);
    if (geometry) return geometry;
  }
  return null;
}

function polygonsFromGeometry(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i][0]);
    const yi = Number(ring[i][1]);
    const xj = Number(ring[j][0]);
    const yj = Number(ring[j][1]);
    const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInGeometry(point, geometry) {
  for (const polygon of polygonsFromGeometry(geometry)) {
    if (!polygon.length || !pointInRing(point, polygon[0])) continue;
    if (polygon.slice(1).some((hole) => pointInRing(point, hole))) continue;
    return true;
  }
  return false;
}

function bbox(geometry) {
  const points = [];
  const walk = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') points.push(value);
    else value.forEach(walk);
  };
  walk(geometry.coordinates);
  const xs = points.map((point) => Number(point[0]));
  const ys = points.map((point) => Number(point[1]));
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

function intersectionAnchor(a, b) {
  const boxA = bbox(a);
  const boxB = bbox(b);
  const minX = Math.max(boxA.minX, boxB.minX);
  const maxX = Math.min(boxA.maxX, boxB.maxX);
  const minY = Math.max(boxA.minY, boxB.minY);
  const maxY = Math.min(boxA.maxY, boxB.maxY);
  if (!(minX < maxX && minY < maxY)) return null;
  const center = [(minX + maxX) / 2, (minY + maxY) / 2];
  let best = null;
  for (let yStep = 0; yStep <= 120; yStep += 1) {
    for (let xStep = 0; xStep <= 120; xStep += 1) {
      const point = [minX + ((maxX - minX) * xStep) / 120, minY + ((maxY - minY) * yStep) / 120];
      if (!pointInGeometry(point, a) || !pointInGeometry(point, b)) continue;
      const distance = ((point[0] - center[0]) ** 2) + ((point[1] - center[1]) ** 2);
      if (!best || distance < best.distance) best = { point, distance };
    }
  }
  return best ? { lon: Number(best.point[0].toFixed(7)), lat: Number(best.point[1].toFixed(7)) } : null;
}

async function resolveFolgefonna() {
  const where = "navn LIKE '%Folgefonna%'";
  const parkUrl = `https://kart.miljodirektoratet.no/arcgis/rest/services/vern/FeatureServer/0/query?where=${encodeURIComponent(where)}&outFields=*&returnGeometry=true&outSR=4326&f=geojson`;
  const parkJson = await fetchJson(parkUrl, 'miljodirektoratet-folgefonna');
  const feature = Array.isArray(parkJson?.features)
    ? parkJson.features.find((item) => normalize(item?.properties?.offisieltNavn || item?.properties?.navn).includes('folgefonn') && normalize(item?.properties?.verneform).includes('nasjonalpark')) || parkJson.features[0]
    : null;
  const parkGeometry = extractGeometry(feature);
  if (!feature || !parkGeometry) throw new Error('Could not resolve Folgefonna national park polygon from Miljødirektoratet');

  const municipalityUrl = 'https://api.kartverket.no/kommuneinfo/v1/kommuner/4611/omrade';
  const municipalityJson = await fetchJson(municipalityUrl, 'kartverket-etne-kommune-geometry');
  const municipalityGeometry = extractGeometry(municipalityJson);
  if (!municipalityGeometry) throw new Error('Could not resolve Etne municipality geometry from Kartverket');

  const anchor = intersectionAnchor(parkGeometry, municipalityGeometry);
  if (!anchor) throw new Error('Could not find a point inside both Folgefonna national park and Etne municipality');
  const properties = feature.properties || {};
  const id = properties.naturvernId || properties.NaturvernId || properties.OBJECTID || properties.GlobalID || 'folgefonnanasjonalpark';
  return {
    ...anchor,
    sourceProvider: 'official_map',
    sourceObjectId: `miljodirektoratet-naturvern:${id}`,
    sourceUrl: parkUrl,
    parkProperties: properties
  };
}

const coordinate = {};
coordinate.folgefonna_nasjonalpark_etne = await resolveFolgefonna();
coordinate.mosneselva_etne = await resolveNamedArea('Mosneselva', ['Mosneselva', 'Mosneselvi']);
coordinate.etnefjella = await resolveNamedArea('Etnefjella', ['Etnefjella', 'Etnefjellet'], { allowSemanticFallback: true });
coordinate.skaneviksfjella = await resolveNamedArea('Skåneviksfjella', ['Skåneviksfjella', 'Skåneviksfjellet'], { allowSemanticFallback: true });
coordinate.bokeskogen_milja = await resolveNamedArea('Bøkeskogen på Milja', ['Bøkeskogen', 'Bøkeskogen på Milja'], { allowSemanticFallback: true });
coordinate.vannes_geologiske_omrade = await resolveNamedArea('Vannes', ['Vannes']);
coordinate.flateskar_stordalen = await resolveNamedArea('Flåteskar', ['Flåteskar', 'Flateskar']);
coordinate.terrasselandskapet_etne = await resolveNamedArea('Terrasselandskapet i Etne', ['Etne'], { allowSemanticFallback: true });
coordinate.rullestadvatnet = await resolveNamedArea('Rullestadvatnet', ['Rullestadvatnet', 'Rullestadvatn']);

async function semanticFallbackFromExisting(id, sourcePath, sourceObjectId, sourceName) {
  const doc = JSON.parse(await fs.readFile(path.join(root, sourcePath), 'utf8'));
  const rows = Array.isArray(doc) ? doc : doc.places || [];
  const place = rows.find((row) => row?.id === id);
  if (!place) throw new Error(`Missing fallback source place ${id}`);
  return {
    lat: place.lat,
    lon: place.lon,
    sourceProvider: 'manual_research',
    sourceObjectId,
    sourceUrl: sourceName,
    exact: false
  };
}

if (!coordinate.etnefjella) {
  coordinate.etnefjella = await resolveNamedArea('Skarstøl', ['Skarstøl']);
  coordinate.etnefjella.exact = false;
}
if (!coordinate.skaneviksfjella) {
  coordinate.skaneviksfjella = await resolveNamedArea('Miljasæter', ['Miljasæter', 'Miljaseter']);
  coordinate.skaneviksfjella.exact = false;
}
if (!coordinate.bokeskogen_milja) {
  coordinate.bokeskogen_milja = await resolveNamedArea('Milja', ['Milja']);
  coordinate.bokeskogen_milja.exact = false;
}
if (!coordinate.terrasselandskapet_etne) {
  coordinate.terrasselandskapet_etne = await semanticFallbackFromExisting(
    'etnesjoen_tettstad',
    'data/places/by/vestland/etne/etnesjoen_tettstad.json',
    'history-go-place:etnesjoen_tettstad',
    'Etne kommune og NVE – terrasselandskapet omkring den nedre Etnebygda'
  );
}

await writeJson(path.join(reportDir, 'resolved-coordinates.json'), coordinate);

function coordFields(id, options = {}) {
  const item = coordinate[id];
  if (!item) throw new Error(`Missing coordinate resolution for ${id}`);
  const exact = options.exact ?? item.exact ?? true;
  const linear = options.linear ?? false;
  const officialGeometry = options.officialGeometry ?? false;
  const status = officialGeometry ? 'verified_geometry' : exact ? (linear ? 'verified_geometry' : 'verified') : 'needs_manual_visual_qa';
  const providerLabel = item.sourceProvider === 'kartverket' ? 'Kartverket SSR' : item.sourceProvider === 'osm' ? 'OpenStreetMap/Nominatim' : item.sourceProvider === 'official_map' ? 'Miljødirektoratet og Kartverket' : 'Kildebelagt semantisk anker';
  return {
    lat: item.lat,
    lon: item.lon,
    r: options.r,
    coordType: linear ? 'route_anchor' : 'area_center',
    coordStatus: status,
    coordSource: options.coordSource || `${providerLabel} – ${options.sourceDescription}`,
    coordVerifiedAt: verifiedAt,
    coordNote: options.coordNote,
    locatorType: linear ? 'linear_area' : 'natural_area',
    sourceProvider: item.sourceProvider,
    sourceObjectId: item.sourceObjectId,
    geocodeAccuracy: officialGeometry ? 'semantic_anchor' : exact ? 'geometric_center' : 'semantic_anchor',
    coordRole: linear ? 'line_anchor' : 'area_anchor'
  };
}

const places = [
  {
    id: 'folgefonnanasjonalpark_etne',
    name: 'Folgefonna nasjonalpark – Etne',
    ...coordFields('folgefonnanasjonalpark_etne', {
      r: 1800,
      officialGeometry: true,
      sourceDescription: 'offisiell nasjonalparkpolygon krysset med offisiell Etne kommunegeometri',
      coordNote: 'Representativt områdeanker beregnet inne i både Miljødirektoratets offisielle polygon for Folgefonna nasjonalpark og Kartverkets offisielle kommunegrense for Etne. Radiusen representerer Etne-delen av et stort verneområde og er ikke en stiinnkomst, parkeringsplass eller anbefalt ferdselslinje.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: 2005,
    period: 'Nasjonalpark fra bre til fjordlandskap',
    tags: ['folgefonnanasjonalpark', 'folgefonn', 'nasjonalpark', 'brelandskap', 'villmark', 'naturvern'],
    desc: 'Etne har en del av Folgefonna nasjonalpark i fjellområdene nord for Åkrafjorden. Her møtes brepåvirket høyfjell, vernede vassdrag og store sammenhengende naturområder.',
    popupDesc: 'Folgefonna nasjonalpark er ett av de sentrale verneområdene som berører Etne kommune. I Etne henger nasjonalparken særlig sammen med de store, lite berørte fjellområdene nord for Åkrafjorden og Mosnesvassdraget, som strekker seg fra Folgefonna mot fjorden. History Go-stedet representerer bare delen av nasjonalparken innenfor Etne kommune og skal leses som et stort vernet landskap, ikke som ett bestemt utsiktspunkt eller en anbefalt rute på breen.',
    nature_profile: { type: 'nasjonalpark / brepåvirket høyfjell / villmark', title: 'Etne-siden av Folgefonna', summary: 'Etne-delen av nasjonalparken viser forbindelsen mellom bre, høyfjell, vassdrag og fjord. Områdeankeret ligger inne i både parkgrensen og kommunegrensen og brukes til å forstå vernet som landskap, ikke som enkeltattraksjon.', themes: ['nasjonalpark', 'brepåvirket høyfjell', 'vernet landskap', 'villmark', 'sammenheng fra bre til fjord'], nearby_place_ids: ['mosneselva_etne', 'akrafjorden', 'langfoss_etne'] },
    quiz_profile: { place_type: 'nasjonalpark', subtype: 'etne_del_av_stort_bre_og_hoyfjellsvern', signature_features: ['del av Folgefonna nasjonalpark innenfor Etne kommune', 'sammenheng med Mosnesvassdraget og fjellene nord for Åkrafjorden', 'stort vernet område med brepåvirket høyfjell'], primary_angles: ['naturvern', 'landskap', 'vassdrag', 'villmark'], question_families: ['verneomrade', 'bre_til_fjord', 'landskapssammenheng', 'naturforvaltning'], avoid_angles: ['påstå_at_ankeret_er_en_breinnkomst', 'generisk_breturisme'], must_include: ['at markøren gjelder Etne-delen av nasjonalparken', 'koblingen mellom Folgefonna og Mosnesvassdraget'], contrast_targets: ['mosneselva_etne', 'langebudalen_naturreservat'], notes: 'Spør som stort vernet landskap. Ingen oppgaver skal oppfordre til ferdsel på bre eller utenfor trygge, etablerte ruter.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – naturforvaltning og verna område', url: kommuneUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'NVE – Mosneselva og Folgefonna', url: nveMosnesUrl, lang: 'nb', verifiedAt }, { type: 'official_map', label: 'Miljødirektoratet – naturvernområde', url: coordinate.folgefonna_nasjonalpark_etne.sourceUrl, lang: 'nb', verifiedAt }],
    emne_ids: ['em_natur_arter_habitat_mangfold', 'em_natur_vern_forvaltning_politikk'],
    underbadge_ids: ['naturvern', 'verneomrade', 'friluftsliv', 'berg_og_knaus']
  },
  {
    id: 'mosneselva_etne', name: 'Mosneselva',
    ...coordFields('mosneselva_etne', { r: 1000, linear: true, sourceDescription: 'offisielt stedsnavnspunkt for Mosneselva i Etne', coordNote: 'Representativt linjeanker for det vernede Mosnesvassdraget fra Folgefonna mot Åkrafjorden, ikke et geometrisk midtpunkt for hele elveløpet eller et bestemt tilgangspunkt. Radiusen dekker et langt vassdragslandskap og markøren skal brukes fra trygg, eksisterende ferdsel.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: 1993, period: 'Vernet type- og referansevassdrag',
    tags: ['mosneselva', 'mosnesvassdraget', 'vernet_vassdrag', 'brevassdrag', 'akrafjorden', 'villmark'],
    desc: 'Vernet vassdrag som går fra Folgefonna gjennom et bratt og lite berørt dallandskap til Åkrafjorden. NVE fremhever bre, elver, vann, urørthet og aktive landskapsprosesser som sentrale verneverdier.',
    popupDesc: 'Mosneselva er et vernet type- og referansevassdrag på nordsiden av Åkrafjorden. Nedbørfeltet strekker seg fra Folgefonna til fjorden og rommer brepåvirkede elver og vann, bratte dalsider, skredmateriale og store kontraster mellom høyfjell og fjord. NVE framhever særlig urørtheten, landskapsprosessene og naturmangfoldet i et område som ellers ligger nær store kraftutbygginger.',
    nature_profile: { type: 'vernet brevassdrag / bratt dal / fjordutløp', title: 'Fra Folgefonna til Åkrafjorden', summary: 'Mosnesvassdraget binder bre, fjellvann, elveløp, skog og fjord sammen i ett vernet nedbørfelt. Natur-rundingen handler om sammenhengene og prosessene i hele systemet.', themes: ['brevassdrag', 'urørthet', 'elveløpsformer', 'bratt dal', 'fjordutløp'], nearby_place_ids: ['folgefonnanasjonalpark_etne', 'akrafjorden', 'langfoss_etne'] },
    quiz_profile: { place_type: 'vernet_vassdrag', subtype: 'brevassdrag_fra_folgefonna_til_akrafjorden', signature_features: ['strekker seg fra Folgefonna til Åkrafjorden', 'vernet som type- og referansevassdrag', 'store kontraster og lite tekniske inngrep'], primary_angles: ['vassdrag', 'landskapsprosesser', 'urort_natur', 'naturvern'], question_families: ['nedborfelt', 'bre_til_fjord', 'vernegrunnlag', 'landskapsprosesser'], avoid_angles: ['generisk_laksefiske', 'påstå_at_hele_vassdraget_er_tilgjengelig_fra_markoren'], must_include: ['rollen som type- og referansevassdrag', 'forbindelsen mellom Folgefonna og Åkrafjorden'], contrast_targets: ['etneelva', 'langfoss_etne'], notes: 'Kartpunktet er et representativt linjeanker. Oppgaver skal ikke sende spilleren ut i bratt, veiløst eller umerket terreng.' },
    externalLinks: [{ type: 'official', label: 'NVE – 042/2 Mosneselva', url: nveMosnesUrl, lang: 'nb', verifiedAt }, { type: 'official', label: 'Etne kommune – verna vassdrag', url: kommuneUrl, lang: 'nn', verifiedAt }],
    emne_ids: ['em_natur_elver_bekker_vassdrag', 'em_natur_arter_habitat_mangfold', 'em_natur_vern_forvaltning_politikk'],
    underbadge_ids: ['vann_og_vassdrag', 'elv', 'ravine_og_dal', 'naturvern', 'friluftsliv']
  },
  {
    id: 'etnefjella', name: 'Etnefjella',
    ...coordFields('etnefjella', { r: 1700, exact: coordinate.etnefjella.exact, sourceDescription: 'navngitt områdeanker for Etnefjella eller nærmeste kildebelagte fjellanker', coordNote: 'Representativt områdeanker for det store fjellområdet Etnefjella. Punktet er ikke et enkelt toppunkt, en parkeringsplass eller en grense for hele fjellområdet; stor radius gjenspeiler at History Go-stedet representerer et sammenhengende høyfjells- og friluftslandskap.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null, period: 'Høyfjellsområde på Haugalandet',
    tags: ['etnefjella', 'hoyfjell', 'friluftsliv', 'fiskevatn', 'turisthytter', 'turloyper'],
    desc: 'Etnefjella er høyfjellsområdet i kommunen med merkede ruter, turisthytter og mange fiskevann. Området er en viktig del av det sammenhengende fjellandskapet sør for Åkrafjorden.',
    popupDesc: 'Etne kommune beskriver Etnefjella som Haugalandets høyfjell og et stort helårs friluftsområde. Her finnes merkede ruter og turisthytter fra Seljestad mot Olalia, mange fiskevann og flere oppganger fra E134, Skarstøl og Rus. History Go-markøren representerer selve fjellområdet som landskap og friluftssystem, ikke én bestemt tur eller topp.',
    nature_profile: { type: 'høyfjell / vannrik fjellnatur / friluftsområde', title: 'Høyfjellet over Etne', summary: 'Etnefjella er et stort nettverk av fjell, vann og ferdselslinjer. Natur-rundingen legger vekt på hvordan høyfjellslandskapet brukes gjennom året og hvordan vann, vær og topografi former ferdselen.', themes: ['høyfjell', 'fiskevann', 'turisthytter', 'merkede ruter', 'helårsfriluftsliv'], nearby_place_ids: ['stordalsvatnet_etne', 'etneelva', 'langfoss_etne'] },
    quiz_profile: { place_type: 'fjellomrade', subtype: 'stort_hoyfjells_og_friluftsomrade', signature_features: ['merkede ruter og turisthytter', 'mange fiskevann', 'flere oppganger fra dal- og vegsystemet'], primary_angles: ['fjellandskap', 'friluftsliv', 'vann', 'ferdsel'], question_families: ['hoyfjell', 'rutenett', 'fiskevatn', 'landskapsbruk'], avoid_angles: ['gjore_ett_toppunkt_til_hele_etnefjella', 'generisk_turistbrosjyre'], must_include: ['at Etnefjella er et stort område og ikke én topp', 'rutenettet og fiskevannene'], contrast_targets: ['skaneviksfjella', 'stordalsvatnet_etne'], notes: 'Bruk markøren som områdeanker. Feltoppgaver må knyttes til trygge, eksisterende ruter eller tilgjengelige utsiktspunkter.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – friluftsområde', url: friluftUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'Etne kommune – innlandsfiske', url: fishingUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'NVE – Etnevassdraget', url: nveEtneUrl, lang: 'nb', verifiedAt }],
    emne_ids: ['em_natur_arter_habitat_mangfold'],
    underbadge_ids: ['berg_og_knaus', 'friluftsliv', 'tursti', 'innsjo']
  },
  {
    id: 'skaneviksfjella', name: 'Skåneviksfjella',
    ...coordFields('skaneviksfjella', { r: 1500, exact: coordinate.skaneviksfjella.exact, sourceDescription: 'navngitt områdeanker for Skåneviksfjella eller nærmeste kildebelagte fjellanker', coordNote: 'Representativt områdeanker for fjellområdet mellom Etne og Skånevik. Punktet er ikke en enkelt topp eller turstart; radiusen gjenspeiler et stort sammenhengende fjellområde med flere ulike oppganger og mål.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null, period: 'Fjellområdet mellom Etne og Skånevik',
    tags: ['skaneviksfjella', 'fjell', 'friluftsliv', 'topptur', 'skanevik', 'etne'],
    desc: 'Fjellområdet mellom Etne og Skånevik, med mange lokale topper og turforbindelser. Kommunen trekker fram ruter fra Skånevik mot blant annet Valdra, Prestafjellet og Miljasæter.',
    popupDesc: 'Skåneviksfjella er fjellområdet mellom Etne og Skånevik. Etne kommune beskriver et nett av turmuligheter fra Børkjenesnuten i vest til Dalanuten i øst, med ruter fra Skånevik mot Valdra, Prestafjellet, Miljasæter, Leknesnibbane, Veten og Stødlehetta. History Go-stedet skal representere dette sammenhengende fjellandskapet og ikke erstatte eventuelle senere, selvstendige toppsteder.',
    nature_profile: { type: 'fjellområde / rygger og topper / friluftsliv', title: 'Fjellene mellom Etne og Skånevik', summary: 'Skåneviksfjella er et overgangslandskap mellom bygdene med mange rygger, topper og lokale ferdselslinjer. Natur-rundingen handler om å lese fjellområdet som sammenheng, ikke bare som en samling toppturer.', themes: ['fjellrygger', 'topper', 'lokale ruter', 'bygdeforbindelser', 'friluftsliv'], nearby_place_ids: ['skanevik_sentrum', 'postvegen_etne_skanevik', 'bokeskogen_milja'] },
    quiz_profile: { place_type: 'fjellomrade', subtype: 'fjellandskap_mellom_etne_og_skanevik', signature_features: ['ligger mellom Etne og Skånevik', 'mange lokale topper og ruter', 'tilkomst fra flere sider'], primary_angles: ['fjellandskap', 'friluftsliv', 'topografi', 'lokale_ferdselslinjer'], question_families: ['fjellomrade', 'rutenett', 'topografi', 'bygdeforbindelser'], avoid_angles: ['redusere_omradet_til_en_topp', 'påstå_lik_merking_pa_alle_ruter'], must_include: ['plasseringen mellom Etne og Skånevik', 'at området består av mange topper og ruter'], contrast_targets: ['etnefjella', 'skanevik_sentrum'], notes: 'Områdeanker for et stort fjellandskap. Feltoppgaver må ikke kreve umerket eller krevende ferdsel.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – friluftsområde', url: friluftUrl, lang: 'nn', verifiedAt }],
    emne_ids: ['em_natur_arter_habitat_mangfold'],
    underbadge_ids: ['berg_og_knaus', 'friluftsliv', 'tursti']
  },
  {
    id: 'bokeskogen_milja', name: 'Bøkeskogen på Milja',
    ...coordFields('bokeskogen_milja', { r: 260, exact: coordinate.bokeskogen_milja.exact, sourceDescription: 'navngitt skogs- eller Milja-anker for bøkeskogen', coordNote: coordinate.bokeskogen_milja.exact ? 'Representativt områdeanker for den navngitte Bøkeskogen på Milja. Punktet markerer skogsområdet, ikke én bestemt bøk eller en privat eiendomsgrense.' : 'Semantisk områdeanker ved Milja for den kommunalt dokumenterte Bøkeskogen på Milja. Kilden dokumenterer skogen og naturstien, men kartobjektet peker på Milja-området snarere enn en lagret offisiell skogspolygon; derfor beholdes markøren til manuell visuell QA.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null, period: 'Om lag hundre år gammel bøkeskog',
    tags: ['bokeskogen', 'milja', 'skog', 'bok', 'natursti', 'skanevik'],
    desc: 'Om lag hundre år gammel bøkeskog på Milja ved Skånevik, med tilrettelagt natursti. Stedet skiller seg ut som et konkret lavlands- og skogsmål i en kommune dominert av fjord og fjell.',
    popupDesc: 'Etne kommune trekker fram Bøkeskogen på Milja som et eget friluftsområde i låglandet og beskriver den som rundt hundre år gammel, med tilrettelagt natursti. History Go-stedet skal handle om selve skogen som lokalt landskaps- og friluftsrom. Det legges ikke til udokumenterte artslister eller påstander om skogens opprinnelse utover det kildene støtter.',
    nature_profile: { type: 'bøkeskog / lavlandsnatur / natursti', title: 'Bøkeskogen ved Skånevik', summary: 'Bøkeskogen på Milja gir et tydelig skogsmiljø med tilrettelagt natursti. Natur-rundingen fokuserer på tresjikt, skogsrom og hvordan et sammenhengende bestand oppleves og brukes som nærnatur.', themes: ['bøkeskog', 'trær', 'skogstruktur', 'natursti', 'lavlandsfriluftsliv'], nearby_place_ids: ['skanevik_sentrum', 'skaneviksfjella', 'skanevik_kyrkje'] },
    quiz_profile: { place_type: 'skogsomrade', subtype: 'eldre_bokeskog_med_natursti', signature_features: ['bøkeskog på Milja', 'om lag hundre år gammel ifølge kommunen', 'tilrettelagt natursti'], primary_angles: ['skog', 'trær', 'friluftsliv', 'lokal_natur'], question_families: ['skogstruktur', 'lokalitet', 'natursti', 'landskapskontrast'], avoid_angles: ['udokumenterte_artsinventar', 'påstå_nasjonal_verneverdi_uten_kilde'], must_include: ['Milja', 'den tilrettelagte naturstien'], contrast_targets: ['skaneviksfjella', 'saevareidberget_landskapsvernomrade'], notes: 'Spør som konkret skogsområde. Dersom kartankeret bygger på Milja som lokalitet, skal det ikke fremstilles som nøyaktig skoggrense.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – friluftsområde', url: friluftUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'Etne kommune – friluftsliv', url: friluftCurrentUrl, lang: 'nn', verifiedAt }],
    emne_ids: ['em_natur_arter_habitat_mangfold'],
    underbadge_ids: ['skog', 'traer', 'friluftsliv', 'tursti']
  },
  {
    id: 'vannes_geologiske_omrade', name: 'Vannes geologiske område',
    ...coordFields('vannes_geologiske_omrade', { r: 420, exact: false, sourceDescription: 'Kartverket-anker for Vannes, brukt som semantisk områdeanker for den kommunalt dokumenterte geologiske lokaliteten', coordNote: 'Semantisk områdeanker ved Vannes i Skånevik for den geologiske lokaliteten Etne kommune trekker fram. Kilden dokumenterer særskilte kvaliteter i berggrunnen, men uten en lagret maskinlesbar geologisk polygon i denne batchen; markøren beholdes derfor til manuell visuell QA og skal ikke tolkes som grensen for hele lokaliteten.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null, period: 'Geologisk lokalitet ved Skånevik',
    tags: ['vannes', 'skanevik', 'geologi', 'berggrunn', 'naturgeologi'],
    desc: 'Geologisk lokalitet på Vannes i Skånevik som Etne kommune trekker fram for særskilte kvaliteter i berggrunnen.',
    popupDesc: 'Vannes i Skånevik er en av de geologiske lokalitetene Etne kommune særskilt nevner i oversikten over berggrunn og løsmasser. Kommunens friluftsside trekker også fram Vannes som et sted for naturopplevelser utenom det vanlige. History Go-stedet skal derfor handle om å lese berggrunn og landskap på stedet, uten å legge til en mer spesifikk geologisk forklaring enn kildene dokumenterer.',
    nature_profile: { type: 'berggrunn / geologisk lokalitet / kystnært landskap', title: 'Berggrunnen på Vannes', summary: 'Vannes er et sted der selve berggrunnen er naturhistorien. Natur-rundingen trener blikket på bergflater, struktur og landskapsform uten å dikte en detaljert bergartshistorie som ikke er dokumentert i kildene.', themes: ['berggrunn', 'geologisk observasjon', 'bergflater', 'landskapsform'], nearby_place_ids: ['skanevik_sentrum', 'skaneviksfjella'] },
    quiz_profile: { place_type: 'geologisk_lokalitet', subtype: 'kommunalt_fremhevet_berggrunnslokalitet', signature_features: ['ligger på Vannes i Skånevik', 'kommunen fremhever berggrunnen for særskilte kvaliteter', 'stedet trekkes fram som en uvanlig naturopplevelse'], primary_angles: ['geologi', 'berggrunn', 'landskapslesning'], question_families: ['berggrunn', 'geologisk_lokalitet', 'observasjon'], avoid_angles: ['navngi_bergart_uten_kilde', 'påstå_detaljert_dannelseshistorie_uten_dokumentasjon'], must_include: ['Vannes', 'at kommunen særskilt fremhever berggrunnen'], contrast_targets: ['flateskar_stordalen', 'jettegrytene_rullestad'], notes: 'Markøren er et semantisk områdeanker ved Vannes og skal gjennom visuell QA før eventuell oppgradering.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – naturforvaltning', url: kommuneUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'Etne kommune – friluftsliv', url: friluftCurrentUrl, lang: 'nn', verifiedAt }],
    emne_ids: [],
    underbadge_ids: ['geologi', 'berggrunn', 'berg_og_knaus']
  },
  {
    id: 'flateskar_stordalen', name: 'Flåteskar i Stordalen',
    ...coordFields('flateskar_stordalen', { r: 320, sourceDescription: 'offisielt navngitt Flåteskar-anker i Etne', coordNote: 'Representativt områdeanker for det navngitte sadelskaret Flåteskar i Stordalen. Punktet markerer landformen som område og er ikke et anbefalt turstartpunkt eller en eksakt grense for hele skaret.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null, period: 'Geologisk sadelskar',
    tags: ['flateskar', 'stordalen', 'geologi', 'sadelskar', 'landform'],
    desc: 'Flåteskar i Stordalen er et særpreget sadelskar som Etne kommune framhever blant kommunens geologiske lokaliteter.',
    popupDesc: 'Etne kommune nevner Flåteskar i Stordalen som en av kommunens geologiske lokaliteter med særskilte kvaliteter. Et sadelskar er et lavere parti mellom høyere terrengformer, og på stedet kan landskapsformen leses direkte i møtet mellom dal og fjell. History Go-stedet holder seg til den dokumenterte landformen og bruker ikke en mer detaljert dannelsesforklaring uten særskilt kilde.',
    nature_profile: { type: 'sadelskar / dalform / geologisk landform', title: 'Det lave skaret mellom høydene', summary: 'Flåteskar gjør topografi til et konkret naturfaglig objekt. Natur-rundingen handler om å se hvordan et skar binder sammen og skiller terreng på samme tid.', themes: ['sadelskar', 'dalform', 'topografi', 'berglandskap'], nearby_place_ids: ['stordalsvatnet_etne', 'driftevegen_stordalen_roldal'] },
    quiz_profile: { place_type: 'geologisk_lokalitet', subtype: 'sadelskar_i_stordalen', signature_features: ['navngitt Flåteskar i Stordalen', 'sadelformet lavpunkt i terrenget', 'kommunalt fremhevet geologisk lokalitet'], primary_angles: ['geologi', 'topografi', 'dalform', 'landskapslesning'], question_families: ['landform', 'topografi', 'geologisk_lokalitet'], avoid_angles: ['udokumentert_istidsforklaring', 'generisk_fjelltur'], must_include: ['at Flåteskar er et sadelskar', 'plasseringen i Stordalen'], contrast_targets: ['vannes_geologiske_omrade', 'jettegrytene_rullestad'], notes: 'Spør som konkret landform og topografi, ikke som en generell turdestinasjon.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – naturforvaltning', url: kommuneUrl, lang: 'nn', verifiedAt }],
    emne_ids: [],
    underbadge_ids: ['geologi', 'dalform', 'berg_og_knaus']
  },
  {
    id: 'terrasselandskapet_etne', name: 'Terrasselandskapet i Etne',
    ...coordFields('terrasselandskapet_etne', { r: 1300, exact: false, sourceDescription: 'semantisk områdeanker i den nedre Etnebygda for det store breelv- og isranddelta-landskapet', coordNote: 'Semantisk områdeanker for det store terrasselandskapet mellom Stordalsvatnet og fjorden. NVE og Etne kommune dokumenterer landskapsformen, men denne batchen har ikke en egen maskinlesbar polygon for hele breelvavsetningen; radiusen er derfor stor og punktet beholdes til manuell visuell QA.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null, period: 'Breelvavsetninger fra siste istid',
    tags: ['etne', 'terrasselandskap', 'breelvavsetning', 'isranddelta', 'morene', 'kvartaergeologi'],
    desc: 'Det brede terrasselandskapet i Etne er blant de største og mest innholdsrike breelvavsetningene i fylket. NVE beskriver et stort isranddelta med randmorener mellom Stordalsvatnet og fjorden.',
    popupDesc: 'Terrasselandskapet i Etne er et av kommunens viktigste kvartærgeologiske landskap. Etne kommune framhever breelvavsetningene som blant de største og mest innholdsrike i fylket, mens NVE beskriver et stort isranddelta mellom Stordalsvatnet og fjorden med overliggende randmorener fra Yngre Dryas. Landskapet viser hvordan smeltevann, sedimenter og isfrontens stillstand bygde opp store terrasser som senere ble grunnlag for bosetning og jordbruk.',
    nature_profile: { type: 'breelvterrasser / isranddelta / morenelandskap', title: 'Et landskap bygd av smeltevann', summary: 'Terrassene i Etne er store avsetningsformer fra slutten av istiden. Natur-rundingen kobler flate nivåer og skrå terrassekanter til sedimenttransport, isrand og dalens senere bruk.', themes: ['breelvavsetninger', 'isranddelta', 'randmorener', 'sedimenter', 'istidslandskap'], nearby_place_ids: ['etneelva', 'etnesjoen_tettstad', 'stodle_kyrkje'] },
    quiz_profile: { place_type: 'kvartaergeologisk_landskap', subtype: 'stort_breelv_og_isranddelta_i_etnebygda', signature_features: ['blant fylkets største og mest innholdsrike breelvavsetninger', 'stort isranddelta mellom Stordalsvatnet og fjorden', 'randmorener knyttet til Yngre Dryas'], primary_angles: ['kvartaergeologi', 'sedimenter', 'istid', 'landskapsdannelse'], question_families: ['breelvavsetning', 'isranddelta', 'morene', 'landskapslesning'], avoid_angles: ['framstille_markoren_som_eksakt_grense', 'generisk_jordbrukslandskap'], must_include: ['breelvavsetningene', 'sammenhengen mellom Stordalsvatnet og fjorden'], contrast_targets: ['jettegrytene_rullestad', 'flateskar_stordalen'], notes: 'Områdeankeret er semantisk og dekker et stort landskap. Observasjon skal skje fra offentlig vei eller tilgjengelig utsiktspunkt.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – naturforvaltning', url: kommuneUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'NVE – Etnevassdraget', url: nveEtneUrl, lang: 'nb', verifiedAt }],
    emne_ids: [],
    underbadge_ids: ['geologi', 'sedimenter', 'istidsspor', 'morene', 'dalform']
  },
  {
    id: 'rullestadvatnet', name: 'Rullestadvatnet',
    ...coordFields('rullestadvatnet', { r: 720, sourceDescription: 'offisielt stedsnavnspunkt for Rullestadvatnet', coordNote: 'Representativt områdeanker for Rullestadvatnet som innsjø. Punktet er ikke et bestemt fiske-, bade- eller bryggepunkt; radiusen dekker den store vannflaten og skal ikke tolkes som en ferdselsanbefaling.' }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null, period: 'Innsjø og friluftsområde i Åkrafjordområdet',
    tags: ['rullestadvatnet', 'innsjo', 'ferskvann', 'fiske', 'friluftsliv', 'rullestad'],
    desc: 'Stor innsjø ved Rullestad og et av de mest brukte ferskvannene i Åkrafjordområdet, med fiske og tilrettelagt tilgang ved innfallsosen.',
    popupDesc: 'Rullestadvatnet er et viktig ferskvanns- og friluftssted i Åkrafjordområdet. Etne kommune beskriver det som det mest brukte vannet i denne delen av kommunen og viser til både båtutleie og tilrettelagt fiskepir ved innfallsosen. History Go-stedet skal først og fremst handle om innsjøen som natur- og vannsystem; tilretteleggingen er sekundær og markøren representerer ikke én bestemt fiskeplass.',
    nature_profile: { type: 'innsjø / ferskvann / friluftsliv', title: 'Ferskvannet ved Rullestad', summary: 'Rullestadvatnet er en stor, tydelig vannflate i et dramatisk dal- og fjellandskap. Natur-rundingen handler om innsjøen, innløp og utløp, vannflate og forholdet til landskapet rundt.', themes: ['innsjø', 'ferskvann', 'fiske', 'friluftsliv', 'dal- og fjellandskap'], nearby_place_ids: ['jettegrytene_rullestad', 'postvegen_rullestadjuvet', 'langebudalen_naturreservat'] },
    quiz_profile: { place_type: 'innsjo', subtype: 'mye_brukt_ferskvann_i_akrafjordomradet', signature_features: ['ligger ved Rullestad', 'kommunen beskriver det som det mest brukte vannet i Åkrafjordområdet', 'tilrettelagt fiske ved innfallsosen'], primary_angles: ['innsjo', 'ferskvann', 'friluftsliv', 'landskap'], question_families: ['innsjo', 'vannsystem', 'friluftsliv', 'lokalitet'], avoid_angles: ['gjore_stedet_til_bare_fiskeplass', 'påstå_spesifikke_fiskearter_uten_stedskilde'], must_include: ['Rullestadvatnet som egen innsjø', 'rollen som mye brukt ferskvann i Åkrafjordområdet'], contrast_targets: ['stordalsvatnet_etne', 'jettegrytene_rullestad'], notes: 'Kartpunktet er et områdeanker for hele innsjøen og ikke en bestemt brygge eller fiskeplass.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – innlandsfiske', url: fishingUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'Etne kommune – friluftsområde', url: friluftUrl, lang: 'nn', verifiedAt }],
    emne_ids: ['em_natur_elver_bekker_vassdrag', 'em_natur_arter_habitat_mangfold'],
    underbadge_ids: ['innsjo', 'vann_og_vassdrag', 'fisk', 'friluftsliv']
  }
];

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
if (!Array.isArray(manifest.files)) throw new Error('data/places/manifest.json is missing files[]');
const manifestSet = new Set(manifest.files);

const activeIds = new Map();
for (const rel of manifest.files) {
  const file = path.join(root, 'data', rel);
  let payload;
  try { payload = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : [];
  for (const row of rows) if (row?.id) activeIds.set(String(row.id), rel);
}

for (const place of places) {
  if (activeIds.has(place.id)) throw new Error(`Refusing duplicate active place id ${place.id}; existing file ${activeIds.get(place.id)}`);
  const fileName = `${place.id}.json`;
  const fullPath = path.join(targetDir, fileName);
  await writeJson(fullPath, [place]);
  const rel = `places/natur/vestland/etne/${fileName}`;
  if (!manifestSet.has(rel)) {
    manifest.files.push(rel);
    manifestSet.add(rel);
  }
}

await writeJson(manifestPath, manifest);

const summary = {
  batch: 'Etne nature batch 2',
  date: verifiedAt,
  addedPlaceIds: places.map((place) => place.id),
  coordinateStatus: Object.fromEntries(places.map((place) => [place.id, place.coordStatus])),
  coordinateSources: Object.fromEntries(places.map((place) => [place.id, { sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon }]))
};
await writeJson(path.join(reportDir, 'summary.json'), summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Etne natur – batch 2\n\nDato: ${verifiedAt}\n\nLagt til ni natursteder:\n\n${places.map((place) => `- ${place.name} (\`${place.id}\`) – ${place.coordStatus}`).join('\n')}\n\nKoordinater er hentet fra offisiell vernegeometri, Kartverket SSR eller eksplisitt dokumenterte semantiske områdeankre. Rå kildeoppslag ligger i \`reports/etne-natur-batch-2/sources/\`.\n`, 'utf8');

console.log(JSON.stringify(summary, null, 2));