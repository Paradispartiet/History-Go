import fs from 'node:fs';
import { execSync } from 'node:child_process';

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, value) => {
  const dir = p.split('/').slice(0, -1).join('/');
  if (dir) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
};
const addUnique = (arr, value) => { if (!arr.includes(value)) arr.push(value); };
const normalize = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ø/g, 'o').replace(/[^a-z0-9]+/g, ' ').trim();
const haversine = (a, b) => {
  const R = 6371000;
  const rad = (d) => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const polygonCentroid = (pts) => {
  let twiceArea = 0, cx = 0, cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const x1 = pts[i].lon, y1 = pts[i].lat, x2 = pts[i + 1].lon, y2 = pts[i + 1].lat;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) throw new Error('Degenerate Bygdø Kongsgård polygon.');
  return { lon: cx / (3 * twiceArea), lat: cy / (3 * twiceArea) };
};
const findExactId = (value, id) => {
  if (Array.isArray(value)) return value.some((v) => findExactId(v, id));
  if (!value || typeof value !== 'object') return false;
  if (value.id === id) return true;
  return Object.values(value).some((v) => findExactId(v, id));
};

execSync('git fetch origin main && git reset --hard origin/main', { stdio: 'inherit' });

const placeId = 'bygdoy_kongsgard';
const placePath = `data/places/historie/oslo/places_historie/${placeId}.json`;
const evidencePath = `data/coordinate-evidence/oslo/historie/${placeId}.json`;
const runtimeIndex = readJson('data/places/places_index.json');
if (fs.existsSync(placePath) || findExactId(runtimeIndex, placeId)) throw new Error(`${placeId} already exists on latest main; aborting duplicate production.`);

const osmUrl = 'https://api.openstreetmap.org/api/0.6/way/100155933/full.json';
const response = await fetch(osmUrl, { headers: { 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`OSM API ${response.status} for way 100155933`);
const osm = await response.json();
writeJson('reports/visitoslo-bygdoy-audit-20260721/coordinate-intake/bygdoy-kongsgard-osm-way-100155933-full.json', osm);

const way = osm.elements?.find((e) => e.type === 'way' && e.id === 100155933);
if (!way) throw new Error('OSM way 100155933 missing from direct API response.');
const name = way.tags?.name ?? '';
if (!normalize(name).includes('bygdoy kongsgard')) throw new Error(`Unexpected OSM way name: ${name}`);
if (way.tags?.landuse !== 'farmyard') throw new Error(`Expected landuse=farmyard, got ${way.tags?.landuse}`);
if (!Array.isArray(way.nodes) || way.nodes.length < 4 || way.nodes[0] !== way.nodes.at(-1)) throw new Error('OSM way 100155933 is not a closed polygon.');
const nodeMap = new Map(osm.elements.filter((e) => e.type === 'node').map((n) => [n.id, n]));
const polygon = way.nodes.map((id) => {
  const n = nodeMap.get(id);
  if (!n || typeof n.lat !== 'number' || typeof n.lon !== 'number') throw new Error(`Missing geometry node ${id}`);
  return { lat: n.lat, lon: n.lon };
});
const center = polygonCentroid(polygon);
const maxRadius = Math.max(...polygon.map((p) => haversine(center, p)));
const radius = Math.ceil(maxRadius + 15);
if (radius < 80 || radius > 400) throw new Error(`Derived farmyard radius ${radius} m is outside expected bounds.`);

const nearby = [];
const collect = (value) => {
  if (Array.isArray(value)) return value.forEach(collect);
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && typeof value.lat === 'number' && typeof value.lon === 'number') {
    if (['bygdoy_kongsgard_salamanderdam', 'oscarshall', 'norsk_folkemuseum', 'bygdoy_natur'].includes(value.id)) {
      nearby.push({ id: value.id, name: value.name, lat: value.lat, lon: value.lon, distanceMeters: Number(haversine(center, value).toFixed(1)) });
    }
  }
  Object.values(value).forEach(collect);
};
collect(runtimeIndex);

const coordNote = 'Geometrisk senter for den eksakt navngitte OSM-farmyard-geometrien way 100155933, Bygdøy kongsgård. Punktet representerer den offentlige og operative gårds-/besøkskjernen, ikke den private kongelige hovedbygningen, Oscarshall, salamanderdammen eller hele den om lag 2 000 dekar store kongsgårdseiendommen.';
const place = {
  id: placeId,
  name: 'Bygdø Kongsgård',
  lat: center.lat,
  lon: center.lon,
  r: radius,
  category: 'historie',
  year: 1305,
  desc: 'Historisk kongsgård og aktivt gårdsbruk på Bygdøy, knyttet til norske monarker siden 1305 og i dag drevet som offentlig besøkssted og økologisk gård av Stiftelsen Norsk Folkemuseum.',
  popupDesc: 'Bygdø Kongsgård har vært knyttet til kongemakten siden 1305, da Håkon V Magnusson ga eiendommen til dronning Eufemia. Dagens hovedbygning skriver seg fra 1730-årene og brukes fortsatt som kongelig sommerresidens, mens den større kongsgården samtidig er et aktivt gårdsbruk og offentlig besøkssted drevet av Stiftelsen Norsk Folkemuseum.\n\nHistory Go modellerer den offentlige gårds- og besøksidentiteten som ett canonical sted. Det fysiske kartankeret er den eksakt navngitte gårdstun-/farmyard-geometrien, ikke den private hovedbygningen og ikke hele det omtrent 2 000 dekar store eiendomslandskapet. Oscarshall er allerede et eget historisk sted, og `bygdoy_kongsgard_salamanderdam` er en separat natur-lokalitet.\n\nStedet gjør det mulig å følge både lang kongelig eiendomshistorie, gårdsdrift, landskap og skiftet mellom privat residens, statlig eiendom og offentlig formidling uten å blande sammen de forskjellige fysiske delstedene.',
  emne_ids: ['em_his_stat_institusjoner', 'em_his_spor_materialitet', 'em_his_historiske_lag_i_byrom', 'em_his_kulturminner_bevaring'],
  quiz_profile: {
    place_type: 'kongsgard_og_aktivt_historisk_gardsbruk',
    subtype: 'kongelig_eiendom_offentlig_besoksgard_og_kulturmiljo',
    signature_features: ['kongelig bruk og eiendomshistorie siden 1305', 'hovedbygning fra 1730-årene innenfor et større gårds- og kulturlandskap', 'aktiv offentlig besøksgård og økologisk drift'],
    primary_angles: ['kongelig_og_statlig_historie', 'gardsdrift_og_landskap', 'historiske_lag', 'kulturminne_og_formidling'],
    question_families: ['historisk_endring', 'institusjonshistorie', 'materielle_spor', 'bruk_og_landskap', 'kontrast'],
    avoid_angles: ['behandle_hovedbygningen_som_offentlig_unlock_punkt', 'slå_sammen_oscarshall', 'slå_sammen_salamanderdammen', 'late_som_farmyard_geometrien_er_hele_eiendomsgrensen'],
    must_include: ['den lange kongelige tilknytningen fra 1305', 'skillet mellom hovedbygning, gårdsbruk og større eiendom', 'dagens offentlige besøks- og gårdsdrift'],
    contrast_targets: ['oscarshall', 'norsk_folkemuseum', 'bygdoy_kongsgard_salamanderdam', 'bogstad_gard'],
    notes: 'Spør som et historisk gårds- og eiendomsmiljø med aktiv bruk. Synlig quizinnhold skal drives av offisielle historie-, gårdsdrifts- og kulturmiljøkilder.'
  },
  locatorType: 'site',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:100155933',
  coordRole: 'site_center',
  coordStatus: 'verified_geometry',
  coordSource: 'osm',
  coordSourceId: 'osm-way:100155933',
  coordSourceUrl: osmUrl,
  coordType: 'site_center',
  coordVerifiedAt: '2026-07-21',
  coordNote,
  externalLinks: [
    { type: 'official', label: 'Det norske kongehus – Bygdø Kongsgård', url: 'https://www.royalcourt.no/the-royal-residences/bygdo-royal-farm', lang: 'nb', verifiedAt: '2026-07-21' },
    { type: 'official', label: 'Stiftelsen Norsk Folkemuseum – museer og besøkssteder', url: 'https://norskfolkemuseum.no/stiftelsen', lang: 'nb', verifiedAt: '2026-07-21' },
    { type: 'reference', label: 'VisitOSLO – Bygdø Royal Manor', url: 'https://www.visitoslo.com/en/product/?tlp=2997593', lang: 'en', verifiedAt: '2026-07-21' }
  ]
};

writeJson(placePath, place);
const manifest = readJson('data/places/manifest.json');
addUnique(manifest.files, placePath.replace(/^data\//, ''));
writeJson('data/places/manifest.json', manifest);

const evidence = {
  placeId,
  placeFile: placePath,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'The public and operational Bygdø Kongsgård farm/visitor-site core, represented by exact named farmyard geometry rather than the private main residence or the entire royal estate',
    identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'site', requiresSplit: false, splitReason: ''
  },
  requiredEvidence: [
    'direkte OSM API-bekreftelse av way 100155933 som lukket, eksakt navngitt landuse=farmyard-geometri',
    'offisiell dokumentasjon av Bygdø Kongsgård som aktiv offentlig besøksgård og separat kongelig eiendom',
    'eksplisitt fysisk avgrensning mot Oscarshall, privat hovedbygning, salamanderdam og hele eiendomslandskapet'
  ],
  evidence: [
    {
      sourceProvider: 'osm', sourceName: 'OpenStreetMap API', sourceUrl: osmUrl, sourceObjectId: 'osm-way:100155933',
      sourceQuality: 'exact_named_geometry_plus_official_identity',
      finding: `Direkte OSM API bekrefter way 100155933 som lukket polygon med name=${name} og landuse=farmyard. Geometrisk sentrum beregnes fra de faktiske way-nodene.`,
      canVerifyCoordinate: true, reason: coordNote
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:100155933', canApplyToPlace: true }],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:100155933', geometryType: 'polygon', canApplyToPlace: true }],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: 'site_center', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied the exact named farmyard polygon center as the public operational site anchor for Bygdø Kongsgård.' },
  notes: [coordNote]
};
writeJson(evidencePath, evidence);
const evidenceManifest = readJson('data/coordinate-evidence/manifest.json');
addUnique(evidenceManifest.files, evidencePath.replace(/^data\/coordinate-evidence\//, ''));
writeJson('data/coordinate-evidence/manifest.json', evidenceManifest);

let protocol = fs.readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
const osloStart = protocol.indexOf('## Oslo');
const osloEnd = protocol.indexOf('## Vestland – Etne');
if (osloStart < 0 || osloEnd < 0) throw new Error('Could not locate Oslo protocol section.');
const osloSection = protocol.slice(osloStart, osloEnd);
const countMatch = osloSection.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse Oslo documented-place count.');
const oldCount = Number(countMatch[1]);
const batchNumbers = [...osloSection.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const batch = Math.max(...batchNumbers) + 1;
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ dokumenterte verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  `Oslo-tabellen inneholder nå ${oldCount + 1} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Bygdø Kongsgård med eksakt navngitt gårdstun-geometri etter fullført VisitOSLO Bygdøy scope- og objektaudit.`
);
const marker = 'Relevante korrigerende merger for de første Oslo-batchene:';
const markerIndex = protocol.indexOf(marker);
if (markerIndex < 0) throw new Error('Could not locate Oslo protocol insertion marker.');
const protocolInsert = `| ${batch} | \`bygdoy_kongsgard\` | Bygdø Kongsgård | verified_geometry | \`osm-way:100155933\` |\n\nBatch ${batch} (2026-07-21) produserer \`bygdoy_kongsgard\` som den offentlige og operative gårds-/besøkskjernen, ikke som et punkt for den private kongelige hovedbygningen og ikke som en påstått geometri for hele den om lag 2 000 dekar store eiendommen. Direkte OSM API må bekrefte way 100155933 som lukket, eksakt navngitt \`landuse=farmyard\`-polygon før geometrisk sentrum brukes som \`site_center\`. Oscarshall og \`bygdoy_kongsgard_salamanderdam\` beholdes som fysisk separate canonical steder.\n\n`;
protocol = `${protocol.slice(0, markerIndex)}${protocolInsert}${protocol.slice(markerIndex)}`;
fs.writeFileSync('docs/coordinates/coordinate-control-protocol.md', protocol);

writeJson('reports/visitoslo-bygdoy-audit-20260721/bygdoy-kongsgard-production.json', {
  createdAt: '2026-07-21',
  placeId,
  batch,
  osmWayId: 100155933,
  osmTags: way.tags,
  center,
  derivedRadiusMeters: radius,
  maxVertexDistanceMeters: Number(maxRadius.toFixed(1)),
  nearbyCanonicalPlaces: nearby,
  representationDecision: 'Use the exact named farmyard geometry as the public operational site anchor. Do not use the private main house, the whole 2000-decare estate, Oscarshall, or the salamander pond as proxy coverage.'
});

console.log(JSON.stringify({ ok: true, placeId, batch, countBefore: oldCount, countAfter: oldCount + 1, center, radius, nearby }, null, 2));
