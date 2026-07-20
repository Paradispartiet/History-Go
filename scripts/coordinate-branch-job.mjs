import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const TODAY = '2026-07-21';
const PLACE_ID = 'saevareidberget_landskapsvernomrade';
const PLACE_REL = 'data/places/natur/vestland/saevareidberget_landskapsvernomrade.json';
const EVIDENCE_REL = 'data/coordinate-evidence/vestland/natur/saevareidberget_landskapsvernomrade.json';
const PLACE_MANIFEST_REF = 'places/natur/vestland/saevareidberget_landskapsvernomrade.json';
const KRINGOM_URL = 'https://kringom.no/nb/sunnhordland/etne/stordalen';
const LOVDATA_URL = 'https://lovdata.no/dokument/LF/forskrift/1984-11-23-1913';
const ETNE_URL = 'https://www.etne.kommune.no/naring-natur-og-miljo/natur-og-miljovern/naturforvaltning/';
const ARCGIS_LAYER = 'https://kart.miljodirektoratet.no/arcgis/rest/services/vern/FeatureServer/0';

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function writeText(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : value + '\n', 'utf8');
}

async function fetchJson(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'History-Go-coordinate-runner/1.0' }
      });
      if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(label + ' failed: ' + (lastError?.message || lastError));
}

function textValues(object) {
  return Object.values(object || {}).filter(value => typeof value === 'string');
}

async function fetchFeature() {
  const endpoints = [
    ARCGIS_LAYER + '/query',
    'https://kart.miljodirektoratet.no/arcgis/rest/services/vern/MapServer/0/query'
  ];
  const whereClauses = [
    "navn LIKE '%Sævareidberget%'",
    "offisieltNavn LIKE '%Sævareidberget%'",
    "navn LIKE '%Sae vareidberget%'"
  ];
  const errors = [];

  for (const endpoint of endpoints) {
    for (const where of whereClauses) {
      const query = new URLSearchParams({
        where,
        outFields: '*',
        returnGeometry: 'true',
        outSR: '4326',
        f: 'geojson'
      });
      const url = endpoint + '?' + query.toString();
      try {
        const payload = await fetchJson(url, 'Miljødirektoratet query');
        const matches = (payload.features || []).filter(feature =>
          textValues(feature.properties).some(value => value.toLowerCase().includes('sævareidberget'))
        );
        if (matches.length === 1) return { feature: matches[0], queryUrl: url };
        if (matches.length > 1) {
          const exact = matches.filter(feature =>
            textValues(feature.properties).some(value => /^sævareidberget(?: landskapsvernområde)?$/i.test(value.trim()))
          );
          if (exact.length === 1) return { feature: exact[0], queryUrl: url };
          errors.push(url + ': ' + matches.length + ' ambiguous matches');
        } else {
          errors.push(url + ': no matches');
        }
      } catch (error) {
        errors.push(url + ': ' + error.message);
      }
    }
  }

  throw new Error('Could not resolve official Sævareidberget polygon. ' + errors.join(' | '));
}

function ringArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function ringCentroid(ring) {
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    x += (x1 + x2) * cross;
    y += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    const points = ring.slice(0, -1);
    return [
      points.reduce((sum, point) => sum + point[0], 0) / points.length,
      points.reduce((sum, point) => sum + point[1], 0) / points.length
    ];
  }
  return [x / (3 * twiceArea), y / (3 * twiceArea)];
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function outerRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates.length ? [geometry.coordinates[0]] : [];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(polygon => polygon[0]).filter(Boolean);
  return [];
}

function representativePoint(geometry) {
  const rings = outerRings(geometry);
  if (!rings.length) throw new Error('Unsupported or empty geometry: ' + (geometry?.type || 'missing'));
  const ring = [...rings].sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)))[0];
  let point = ringCentroid(ring);
  if (!pointInRing(point, ring)) {
    const xs = ring.map(([x]) => x);
    const ys = ring.map(([, y]) => y);
    const bboxCenter = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
    if (pointInRing(bboxCenter, ring)) point = bboxCenter;
    else point = ring[0];
  }
  return { lon: Number(point[0].toFixed(7)), lat: Number(point[1].toFixed(7)) };
}

function pick(properties, keys) {
  for (const key of keys) {
    const hit = Object.keys(properties || {}).find(candidate => candidate.toLowerCase() === key.toLowerCase());
    if (hit && properties[hit] !== null && properties[hit] !== '') return properties[hit];
  }
  return null;
}

function makePlace({ lat, lon, sourceObjectId, factsUrl }) {
  return [{
    id: PLACE_ID,
    name: 'Sævareidberget landskapsvernområde',
    lat,
    lon,
    r: 260,
    coordType: 'area_center',
    coordStatus: 'verified_geometry',
    coordSource: 'Miljødirektoratet Naturvernområder – offisiell polygon for Sævareidberget landskapsvernområde',
    coordVerifiedAt: TODAY,
    coordNote: 'Representativt områdeanker beregnet inne i Miljødirektoratets offisielle vernepolygon. Punktet representerer det bratte styvings- og edellauvskogsområdet, ikke en parkeringsplass eller anbefalt inngang.',
    locatorType: 'natural_area',
    sourceProvider: 'official_map',
    sourceObjectId,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    category: 'natur',
    fylke: 'vestland',
    kommune: 'Etne',
    year: 1984,
    period: 'Landskapsvern for kulturpåvirket edellauvskog',
    tags: ['saevareidberget', 'landskapsvernomrade', 'styving', 'lauving', 'edellauvskog', 'ask', 'alm', 'lind', 'kulturlandskap'],
    desc: 'Bratt, kulturpåvirket edellauvskog ved Ytre Åkrafjorden, vernet for å bevare et stort styvingsfelt og tradisjonelle driftsformer med ask, alm og lind.',
    popupDesc: 'Sævareidberget landskapsvernområde ble vernet 23. november 1984 og dekker om lag 250 dekar. Formålet er å bevare en kulturpåvirket edellauvskog som referanseområde for tradisjonelle driftsformer. Kringom beskriver mange hundre gamle styvingstrær av ask, alm og lind. Ved lauving ble greinene jevnlig høstet til vinterfôr, og trærne utviklet kraftige, mosegrodde og ofte forvridde stammer. Området er bratt, og gamle overgrodde kroner kan være tunge og ustabile. Natur-rundingen skal derfor brukes til trygg observasjon fra eksisterende ferdselslinjer, uten klatring, hogst eller inngrep.',
    nature_profile: {
      type: 'kulturpåvirket edellauvskog / styvingsfelt / bratt fjordli',
      title: 'Trær formet av århundrer med lauving',
      summary: 'Sævareidberget er både skog og levende jordbrukshistorie. Ask, alm og lind ble styvet gjentatte ganger for å gi lauvfôr. Driftsformen skapte lyse skoger, grove stammer, hulrom, død ved og særpregede trekroner. Vernet beskytter derfor ikke bare treslagene, men selve samspillet mellom biologisk mangfold, landskap og tradisjonell bruk.',
      themes: [
        'styving og lauving som tradisjonell driftsform',
        'ask, alm og lind i edellauvskog',
        'kulturpåvirket skog som biologisk habitat',
        'gamle trær, hulrom, mose og død ved',
        'skjøtsel, beite og vern av kulturlandskap'
      ],
      nearby_place_ids: ['langebudalen_naturreservat', 'langfoss_etne', 'postvegen_rullestadjuvet']
    },
    quiz_profile: {
      place_type: 'landskapsvernområde',
      subtype: 'styvingsfelt_i_kulturpaavirket_edellauvskog',
      signature_features: [
        'mange hundre styvingstrær',
        'ask, alm og lind',
        'tradisjonell lauving til vinterfôr',
        'bratt edellauvskog ved Åkrafjorden'
      ],
      primary_angles: ['botanikk', 'kulturlandskap', 'tradisjonell ressursbruk', 'naturvern'],
      question_families: ['styving_og_lauving', 'treslagskunnskap', 'kulturpaavirket_skog', 'skjotsel_og_vern'],
      avoid_angles: ['generisk_skogquiz', 'udokumenterte_arter', 'oppfordring_til_klatring_eller_hogst'],
      must_include: ['at styving var en gjentatt høsting av greiner og lauv', 'at ask, alm og lind er uttrykkelig dokumentert'],
      contrast_targets: ['langebudalen_naturreservat', 'stordalsvatnet_etne'],
      notes: 'Skal behandles som et kulturpåvirket skogsystem, ikke som urørt skog. Observasjon må skje uten inngrep i gamle trær.'
    },
    externalLinks: [
      { type: 'reference', label: 'Kringom – Stordalen og styvingsskogene', url: KRINGOM_URL, lang: 'nn', verifiedAt: TODAY },
      { type: 'official', label: 'Lovdata – verneforskriften', url: LOVDATA_URL, lang: 'nn', verifiedAt: TODAY },
      { type: 'official', label: 'Etne kommune – verna område', url: ETNE_URL, lang: 'nn', verifiedAt: TODAY },
      { type: 'official_map', label: 'Miljødirektoratet – naturvernområde', url: factsUrl, lang: 'nb', verifiedAt: TODAY }
    ],
    emne_ids: ['em_natur_arter_habitat_mangfold', 'em_natur_menneske_natur_kulturmark', 'em_natur_vern_forvaltning_politikk'],
    underbadge_ids: ['botanikk', 'biologisk_mangfold', 'naturvern', 'skog', 'kulturlandskap']
  }];
}

function makeEvidence({ lat, lon, sourceObjectId, factsUrl, queryUrl, properties }) {
  return {
    schemaVersion: '1.0',
    placeId: PLACE_ID,
    placeFile: PLACE_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat,
      lon,
      r: 260,
      coordStatus: 'verified_geometry',
      coordSource: 'Miljødirektoratet Naturvernområder – offisiell polygon for Sævareidberget landskapsvernområde',
      coordType: 'area_center',
      coordNote: 'Representativt områdeanker beregnet inne i den offisielle vernepolygonen. Ikke et tilgangs-, parkerings- eller stipunkt.'
    },
    identity: {
      currentName: 'Sævareidberget landskapsvernområde',
      resolvedIdentity: 'Sævareidberget landskapsvernområde',
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'natural_area',
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['offisiell navngitt vernepolygon', 'stabilt verneområde-ID', 'representativt punkt inne i polygonet', 'kildebelagt verneformål og treslag'],
    evidence: [{
      sourceProvider: 'official_map',
      sourceName: 'Miljødirektoratet Naturvernområder',
      sourceUrl: factsUrl,
      sourceObjectId,
      sourceQuality: 'official_protected_area_polygon',
      finding: 'Miljødirektoratets åpne karttjeneste returnerer ett navngitt polygon for Sævareidberget landskapsvernområde. Kringom og Lovdata dokumenterer styvingslandskapet, verneformålet og treslagene ask, alm og lind.',
      canVerifyCoordinate: true,
      reason: 'Landskapsvernområdet er et arealobjekt, og offisiell polygon med stabil identitet tilfredsstiller geometri- og kildekravet for verified_geometry.'
    }],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'official_map', sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [{ geometryType: 'polygon', sourceProvider: 'official_map', sourceObjectId, sourceUrl: queryUrl, canApplyToPlace: true }],
    coordinateCandidates: [{ lat, lon, coordRole: 'area_anchor', canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Offisiell vernepolygon og representativt områdeanker er anvendt på canonical place.' },
    notes: ['Punktet er ikke en inngang eller parkeringsplass.', 'Kildeegenskaper: ' + JSON.stringify(properties)]
  };
}

function makeTest() {
  return `const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const place = readJson('${PLACE_REL}')[0];
assert.strictEqual(place.id, '${PLACE_ID}');
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.strictEqual(place.sourceProvider, 'official_map');
assert(place.sourceObjectId.startsWith('miljodirektoratet-naturvern:'));
assert(place.nature_profile.summary.length >= 180);
assert(place.nature_profile.themes.length >= 5);

const map = readJson('data/natur/nature_etne_place_map.json');
assert.deepStrictEqual(map.places.${PLACE_ID}.flora, ['emne_ved_ask', 'emne_ved_alm', 'emne_ved_lind']);
assert.deepStrictEqual(map.places.${PLACE_ID}.fauna, []);
assert(map.places.${PLACE_ID}.documentation.includes('mange hundre'));

const trees = readJson('data/natur/flora/traer.json');
const flatten = items => items.flatMap(item => item && item.kind === 'emne_pack' ? flatten(item.items || []) : [item]);
const ids = new Set(flatten(trees).filter(Boolean).map(item => item.id));
for (const id of map.places.${PLACE_ID}.flora) assert(ids.has(id), 'Mangler artskort: ' + id);

const evidence = readJson('${EVIDENCE_REL}');
assert.strictEqual(evidence.placeId, '${PLACE_ID}');
assert.strictEqual(evidence.evidenceStatus, 'applied_to_place');
assert.strictEqual(evidence.decision.canBecomeVerified, true);

console.log('Etne Sævareidberget nature round mapping OK');
`;
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(command + ' ' + args.join(' ') + ' failed with ' + result.status);
}

const { feature, queryUrl } = await fetchFeature();
const properties = feature.properties || {};
const { lat, lon } = representativePoint(feature.geometry);
const officialName = String(pick(properties, ['offisieltNavn', 'navn', 'verneomradenavn']) || 'Sævareidberget landskapsvernområde');
const stableId = pick(properties, ['naturvernId', 'naturvernID', 'cddaId', 'cddaID', 'verneomradeId', 'verneområdeId', 'OBJECTID']);
const sourceObjectId = 'miljodirektoratet-naturvern:' + (stableId || 'unknown-saevareidberget');
const factsUrl = String(pick(properties, ['faktaark', 'faktaarkUrl', 'url']) || ARCGIS_LAYER);

if (!/sævareidberget/i.test(officialName)) throw new Error('Unexpected official feature: ' + officialName);
if (!(lat > 58 && lat < 61 && lon > 4 && lon < 8)) throw new Error('Official polygon centroid outside expected Etne region: ' + lat + ', ' + lon);

writeJson(PLACE_REL, makePlace({ lat, lon, sourceObjectId, factsUrl }));
writeJson(EVIDENCE_REL, makeEvidence({ lat, lon, sourceObjectId, factsUrl, queryUrl, properties }));

const placeManifest = readJson('data/places/manifest.json');
if (!placeManifest.files.includes(PLACE_MANIFEST_REF)) placeManifest.files.push(PLACE_MANIFEST_REF);
writeJson('data/places/manifest.json', placeManifest);

const natureMap = readJson('data/natur/nature_etne_place_map.json');
natureMap.meta.version = '0.6.0';
natureMap.meta.updatedAt = TODAY;
for (const source of [KRINGOM_URL, LOVDATA_URL, ETNE_URL, ARCGIS_LAYER]) {
  if (!natureMap.meta.sources.includes(source)) natureMap.meta.sources.push(source);
}
natureMap.places[PLACE_ID] = {
  fauna: [],
  flora: ['emne_ved_ask', 'emne_ved_alm', 'emne_ved_lind'],
  documentation: 'Kringom beskriver mange hundre gamle, mosegrodde og forvridde styvingstrær av ask, alm og lind ved Sævareidberget. Lovdata dokumenterer et kulturpåvirket edellauvskogområde på om lag 250 dekar, vernet som referanseområde for tradisjonelle driftsformer.'
};
writeJson('data/natur/nature_etne_place_map.json', natureMap);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolPath), 'utf8');
if (!protocol.includes('`' + PLACE_ID + '`')) {
  protocol += '\n| 2 | `' + PLACE_ID + '` | Sævareidberget landskapsvernområde | verified_geometry | `' + sourceObjectId + '` |\n\nEtne batch 2 (2026-07-21) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Punktet er et representativt arealanker og ikke en anbefalt inngang i det bratte styvingsfeltet.\n';
}
writeText(protocolPath, protocol);

writeText('reports/etne-natur-batch-3-saevareidberget.md', `# Etne natur batch 3 – Sævareidberget

## Sted

- \`${PLACE_ID}\` – Sævareidberget landskapsvernområde
- Offisiell geometri: Miljødirektoratet Naturvernområder
- Kildeobjekt: \`${sourceObjectId}\`
- Representativt områdeanker: \`${lat}, ${lon}\`
- Vernet 23. november 1984, om lag 250 dekar

## Dokumenterte treslag

- ask – *Fraxinus excelsior*
- alm – *Ulmus glabra*
- lind – *Tilia* spp.

Artsutvalget er begrenset til de tre treslagene Kringom uttrykkelig navngir for styvingsfeltet. Eksisterende kanoniske artskort gjenbrukes.

## Kilder

- ${KRINGOM_URL}
- ${LOVDATA_URL}
- ${ETNE_URL}
- ${factsUrl}
`);

writeText('tests/etne-saevareidberget-nature-rounds.test.js', makeTest());

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log('Sævareidberget batch written at ' + lat + ', ' + lon + ' from ' + sourceObjectId);
