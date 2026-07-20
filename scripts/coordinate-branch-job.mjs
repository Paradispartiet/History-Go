import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const P = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(P(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(P(rel)), { recursive: true });
  fs.writeFileSync(P(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const rowsFrom = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : Array.isArray(data?.items) ? data.items : data?.id ? [data] : [];

const PLACE_ID = 'vestre_gravlund';
const PLACE_FILE = 'data/places/historie/oslo/places_historie/vestre_gravlund.json';
const PLACE_ENTRY = 'places/historie/oslo/places_historie/vestre_gravlund.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/historie/vestre_gravlund.json';
const EVIDENCE_ENTRY = 'oslo/historie/vestre_gravlund.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const OSM_REPORT = 'reports/oslo-attractions-completeness-20260720/vestre-gravlund/osm-way-4740772.json';
const DECISION_REPORT = 'reports/oslo-attractions-completeness-20260720/vestre-gravlund/decision.md';
const VERIFIED_AT = '2026-07-20';
const OSM_WAY_ID = 4740772;

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i][0]);
    const yi = Number(ring[i][1]);
    const xj = Number(ring[j][0]);
    const yj = Number(ring[j][1]);
    const intersects = ((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInGeoJson(lon, lat, geometry) {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') {
    const [outer, ...holes] = geometry.coordinates || [];
    return Boolean(outer && pointInRing(lon, lat, outer) && !holes.some((ring) => pointInRing(lon, lat, ring)));
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates || []).some((polygon) => {
      const [outer, ...holes] = polygon;
      return Boolean(outer && pointInRing(lon, lat, outer) && !holes.some((ring) => pointInRing(lon, lat, ring)));
    });
  }
  return false;
}

const activeHits = [];
for (const entry of readJson(PLACE_MANIFEST).files || []) {
  const rel = `data/${entry}`;
  if (!fs.existsSync(P(rel))) continue;
  if (rowsFrom(readJson(rel)).some((place) => place?.id === PLACE_ID)) activeHits.push(rel);
}
if (activeHits.length) throw new Error(`${PLACE_ID}: active canonical duplicate in ${activeHits.join(', ')}`);
if (fs.existsSync(P(PLACE_FILE)) || fs.existsSync(P(EVIDENCE_FILE))) throw new Error(`${PLACE_ID}: target file already exists`);

const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=W${OSM_WAY_ID}&format=jsonv2&polygon_geojson=1`;
const response = await fetch(lookupUrl, {
  headers: {
    'User-Agent': 'HistoryGo-coordinate-audit/1.0 (https://github.com/Paradispartiet/History-Go)',
    'Accept': 'application/json'
  }
});
if (!response.ok) throw new Error(`OSM lookup failed: ${response.status} ${response.statusText}`);
const results = await response.json();
if (!Array.isArray(results) || results.length !== 1) throw new Error(`Expected exactly one OSM way result, got ${JSON.stringify(results)}`);
const osm = results[0];
if (osm.osm_type !== 'way' || Number(osm.osm_id) !== OSM_WAY_ID) throw new Error(`Unexpected OSM identity: ${JSON.stringify(osm)}`);
if (!String(osm.display_name || '').toLowerCase().includes('vestre gravlund')) throw new Error(`OSM way name mismatch: ${osm.display_name}`);
if (osm.category !== 'landuse' || osm.type !== 'cemetery') throw new Error(`OSM way is not the expected cemetery geometry: ${osm.category}/${osm.type}`);
const lat = Number(osm.lat);
const lon = Number(osm.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('OSM result lacks a finite representative point');
if (!pointInGeoJson(lon, lat, osm.geojson)) throw new Error('OSM representative point is not inside way 4740772 cemetery geometry');
writeJson(OSM_REPORT, osm);

const coordNote = `Representativt områdeanker inne i Vestre gravlund, hentet fra den navngitte OpenStreetMap-geometrien way ${OSM_WAY_ID} og kryssjekket mot Oslo kommunes dokumentasjon av gravlunden. Besøksadressen Sørkedalsveien 66 brukes ikke som snarvei for det 243 dekar store gravplassområdet. Punktet brukes som display- og unlock-anker for hele gravlunden, ikke som koordinat for et bestemt kapell eller gravfelt.`;

const place = {
  id: PLACE_ID,
  visual: { designCode: 'cemetery_miniature' },
  name: 'Vestre gravlund',
  lat,
  lon,
  r: 320,
  category: 'historie',
  rounds_exclude: ['nature'],
  year: 1902,
  desc: 'Norges største gravplass, anlagt i 1902 vest i Oslo. Vestre gravlund rommer et stort historisk minnelandskap med kapeller, urnefelt og byens største samling av internasjonale krigsgraver.',
  popupDesc: 'Vestre gravlund ble anlagt i 1902 og er med sine om lag 243 dekar Norges største gravplass. Landskapet er utformet gjennom flere perioder og rommer både eldre kistegravfelt, urnegraver og kapeller. De frittliggende urnegravene med natursteiner fra 1939 er et særpreget lag i gravlundens utvikling.\n\nStedet har også en særlig rolle i Oslos krigsminnekultur. Vestre gravlund rommer byens største krigsgravfelt, med gravsteder og minneområder for mennesker fra en rekke land. Dermed er gravlunden både et lokalt gravsted og et internasjonalt minnelandskap. I History Go skal stedet leses som et stort historisk område der gravskikk, landskapsforming, krigserfaring og offentlig minnekultur møtes — ikke bare som en samling enkeltgraver.',
  emne_ids: [
    'em_his_minnesteder_historiebruk',
    'em_his_spor_materialitet',
    'em_his_kulturminner_bevaring',
    'em_his_nasjonal_identitet_fortellinger'
  ],
  quiz_profile: {
    place_type: 'gravlund',
    subtype: 'storbygravlund_og_internasjonalt_krigsminnelandskap',
    signature_features: [
      'anlagt i 1902 og i dag Norges største gravplass',
      'frittliggende urnegraver med natursteiner fra 1939',
      'Oslos største krigsgravfelt med mange nasjonale grupper'
    ],
    primary_angles: ['historie', 'minnekultur', 'krigsminner', 'gravskikk', 'landskapsutforming'],
    question_families: ['tidslag', 'historisk_endring', 'saertrekk', 'minnekultur', 'kontrast'],
    avoid_angles: ['generisk_gravlund', 'generisk_kjente_graver', 'redusere_stedet_til_bare_krigsgravene', 'bruke_adressepunktet_som_om_det_var_hele_gravlunden'],
    must_include: [
      'etableringen i 1902 og skalaen som Norges største gravplass',
      'krigsgravfeltenes internasjonale karakter',
      'urnefeltene fra 1939 som et eget historisk landskapslag'
    ],
    contrast_targets: ['var_frelsers_gravlund', 'gamlebyen_gravlund', 'frognerparken'],
    notes: 'Spør som et utstrakt historisk minnelandskap. Skill gravlundens område, kapellene, urnefeltene og krigsgravfeltene fra hverandre uten å splitte dem i overlappende canonical hovedsteder.'
  },
  underbadge_ids: ['kulturminner_og_bevaring'],
  safe_facts: [
    'Vestre gravlund ble anlagt i 1902.',
    'Vestre gravlund er Norges største gravplass og dekker om lag 243 dekar.',
    'Gravlunden ligger vest i Oslo, bak Frognerparken og Vigelandsparken.',
    'Frittliggende urnegraver med natursteiner ble anlagt fra 1939.',
    'Vestre gravlund rommer Oslos største krigsgravfelt.',
    'Krigsgravene omfatter mennesker fra en rekke land og gjør stedet til et internasjonalt minnelandskap.',
    'Gravlunden har flere kapeller og mange historiske gravfelt.',
    'Stedet kan leses som både gravplass, landskapsarkitektur og offentlig minnekultur.'
  ],
  subplaces: [
    {
      id: 'vestre_gravlund_krigsgravfeltene',
      name: 'Krigsgravfeltene',
      type: 'internasjonalt krigsminnelandskap',
      status: 'safe_to_build',
      summary: 'Samlede krigsgravfelt for flere nasjonaliteter gjør Vestre gravlund til Oslos viktigste internasjonale gravminnelandskap.'
    },
    {
      id: 'vestre_gravlund_urnegravene_1939',
      name: 'Urnegravene fra 1939',
      type: 'gravskikk / landskapsutforming',
      status: 'safe_basic',
      summary: 'Frittliggende urnegraver med natursteiner viser et særpreget mellomkrigs- og etterkrigslag i gravlundens utforming.'
    },
    {
      id: 'vestre_gravlund_kapellene',
      name: 'Kapellene',
      type: 'seremonirom / gravlundsinstitusjon',
      status: 'safe_basic',
      summary: 'Kapellene markerer gravlundens rolle som både landskap og institusjonelt seremonirom.'
    }
  ],
  cemetery_profile: {
    type: 'historisk_storbygravlund',
    title: 'Gravlund som internasjonalt minnelandskap',
    summary: 'Vestre gravlund samler gravskikk, landskapsarkitektur og internasjonale krigsminner i Norges største gravplass.',
    features: ['kistegravfelt', 'urnegraver', 'natursteiner', 'kapeller', 'krigsgravfelt', 'gangveier', 'trær', 'minnesmerker'],
    themes: ['minnekultur', 'krigshistorie', 'gravskikk', 'internasjonal historie', 'landskapsarkitektur', 'kulturminner']
  },
  locatorType: 'linear_area',
  sourceProvider: 'osm',
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `Oslo kommune – Vestre gravlund + OpenStreetMap way ${OSM_WAY_ID}`,
  coordSourceId: `osm-way:${OSM_WAY_ID}`,
  coordSourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  coordType: 'cemetery_area_anchor',
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Oslo kommune – Vestre gravlund',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/vestre-gravlund/',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'reference',
      label: 'VisitOSLO – Vestre gravlund',
      url: 'https://www.visitoslo.com/no/produkt/?name=Vestre-gravlund&tlp=2979923',
      lang: 'nb',
      verifiedAt: VERIFIED_AT
    },
    {
      type: 'map',
      label: 'OpenStreetMap – Vestre gravlund',
      url: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
      lang: 'en',
      verifiedAt: VERIFIED_AT
    }
  ]
};
writeJson(PLACE_FILE, place);

writeJson(EVIDENCE_FILE, {
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Vestre gravlund as the full municipal cemetery area represented by OSM way 4740772',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'linear_area',
    requiresSplit: false,
    splitReason: 'The chapels, urn fields and war-grave fields are meaningful subplaces inside one coherent cemetery area, not separate overlapping canonical main places.'
  },
  requiredEvidence: [
    'stable municipal identity for Vestre gravlund',
    'verified OSM geometry for the named cemetery area',
    'representative point inside the cemetery polygon',
    'explicit rejection of the postal address as a shortcut for the whole area'
  ],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: `Oslo kommune – Vestre gravlund + OSM way ${OSM_WAY_ID}`,
      sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/vestre-gravlund/',
      sourceObjectId: 'oslo-kommune:gravplass:vestre',
      sourceQuality: 'official_area_identity_plus_verified_osm_geometry',
      finding: `Oslo kommune identifies Vestre gravlund as the 243-decare municipal cemetery. OSM way ${OSM_WAY_ID} is the named landuse=cemetery geometry for the same physical area, and its representative point is verified inside the polygon.`,
      canVerifyCoordinate: true,
      reason: coordNote
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'municipality', sourceObjectId: 'oslo-kommune:gravplass:vestre', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true }
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${OSM_WAY_ID}`, geometryType: osm.geojson.type, canApplyToPlace: true }
  ],
  coordinateCandidates: [
    { lat: place.lat, lon: place.lon, coordRole: 'area_anchor', canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Use the verified representative point inside OSM way 4740772 as the cemetery area anchor; do not substitute Sørkedalsveien 66 as a building-style address marker.'
  },
  notes: [place.coordNote]
});

const placeManifest = readJson(PLACE_MANIFEST);
if (!Array.isArray(placeManifest.files) || placeManifest.files.includes(PLACE_ENTRY)) throw new Error('Place manifest collision');
placeManifest.files.push(PLACE_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files) || evidenceManifest.files.includes(EVIDENCE_ENTRY)) throw new Error('Evidence manifest collision');
evidenceManifest.files.push(EVIDENCE_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

fs.mkdirSync(path.dirname(P(DECISION_REPORT)), { recursive: true });
fs.writeFileSync(P(DECISION_REPORT), `# Vestre gravlund — VisitOSLO Oslo West completeness decision\n\nDate: ${VERIFIED_AT}\n\n- Canonical duplicate gate: PASS.\n- Primary category: \`historie\`.\n- Coordinate method: cemetery area anchor, not address-first.\n- Official identity: Oslo kommune, Vestre gravlund.\n- Geometry: OpenStreetMap way ${OSM_WAY_ID}, \`landuse=cemetery\`, representative point verified inside polygon.\n- PlaceCard rounds: exclude \`nature\`, retaining the eight prioritized rounds.\n- Split decision: keep chapels, urn fields and war-grave fields as subplaces inside one canonical cemetery place.\n`);

let protocol = fs.readFileSync(P(PROTOCOL), 'utf8');
if (protocol.includes('`vestre_gravlund`')) throw new Error('Vestre gravlund already recorded in coordinate protocol');
const existingBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const batch = (existingBatches.length ? Math.max(...existingBatches) : 0) + 1;
const tableEnd = protocol.indexOf('\n\nRelevante korrigerende merger');
if (tableEnd < 0) throw new Error('Coordinate protocol table end not found');
const row = `| ${batch} | \`vestre_gravlund\` | Vestre gravlund | verified | \`osm-way:${OSM_WAY_ID}\` |`;
protocol = `${protocol.slice(0, tableEnd)}\n${row}${protocol.slice(tableEnd)}`;
const note = `Batch ${batch} (${VERIFIED_AT}) legger til \`vestre_gravlund\` som et dokumentert \`cemetery_area_anchor\`. Oslo kommune identifiserer det 243 dekar store gravplassområdet, mens OpenStreetMap way ${OSM_WAY_ID} gir den konkrete, navngitte gravlundsgeometrien. Det representative punktet er kontrollert inne i polygonet. Besøksadressen Sørkedalsveien 66 brukes bevisst ikke som snarvei for hele gravlunden.`;
const migration = protocol.indexOf('\nDuplikatmigrering');
if (migration < 0) throw new Error('Coordinate protocol migration section not found');
protocol = `${protocol.slice(0, migration)}\n\n${note}${protocol.slice(migration)}`;
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const etneStart = protocol.indexOf('\n## Etne', unresolvedStart);
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\|\s*\d+\s*\|/gm) || []).length;
const unresolvedCount = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length).split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til Vestre gravlund med et verifisert områdeanker i selve gravlundsgeometrien, ikke et adressepunkt. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(P(PROTOCOL), protocol);

console.log(JSON.stringify({
  ok: true,
  placeId: PLACE_ID,
  batch,
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  coordinate: { lat, lon, pointInsideGeometry: true },
  verifiedCount,
  unresolvedCount
}, null, 2));
