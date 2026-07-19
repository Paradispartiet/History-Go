import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const aggregatePath = path.join(root, 'data/places/by/oslo/places_by.json');
const splitDir = path.join(root, 'data/places/by/oslo/places');
const categoryIndexPath = path.join(root, 'data/places/by/oslo/places_by_index.json');
const splitManifestPath = path.join(root, 'data/places/by/oslo/places_by_manifest.json');
const evidenceRoot = path.join(root, 'data/coordinate-evidence');
const evidenceManifestPath = path.join(evidenceRoot, 'manifest.json');
const protocolPath = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-27');
const today = '2026-07-19';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const writeJsonAndHash = (file, value) => {
  const text = JSON.stringify(value, null, 2) + '\n';
  fs.writeFileSync(file, text);
  return sha256(text);
};

const verified = {
  'ullevål_hageby': {
    lat: 59.9435082,
    lon: 10.7337546,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:1125978057',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 1125978057 – Ullevål hageby',
    coordSourceId: 'osm-node:1125978057',
    coordSourceUrl: 'https://www.openstreetmap.org/node/1125978057',
    coordVerifiedAt: today,
    coordNote: 'Navngitt OSM-neighbourhood-node for Ullevål hageby, kryssjekket mot Oslo byleksikons dokumenterte hagebyområde. Punktet brukes som representativt area-anchor for boligområdet og hevdes ikke å være et geometrisk sentrum eller en full områdeavgrensning.'
  },
  'romsaås': {
    lat: 59.9664278,
    lon: 10.89815,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:963813366',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 963813366 – Romsås',
    coordSourceId: 'osm-node:963813366',
    coordSourceUrl: 'https://www.openstreetmap.org/node/963813366',
    coordVerifiedAt: today,
    coordNote: 'Navngitt OSM-suburb-node for Romsås, kryssjekket mot Oslo byleksikons dokumenterte boligstrøk. Suburb-noden brukes som representativt area-anchor; Romsås T-banestasjon er eksplisitt avvist som hovedanker for hele området.'
  },
  rodelokka: {
    lat: 59.9246703,
    lon: 10.7696441,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:1290871351',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 1290871351 – Rodeløkka',
    coordSourceId: 'osm-node:1290871351',
    coordSourceUrl: 'https://www.openstreetmap.org/node/1290871351',
    coordVerifiedAt: today,
    coordNote: 'Navngitt OSM-suburb-node for Rodeløkka, kryssjekket mot Oslo byleksikons avgrensede boligstrøk. Punktet brukes som representativt area-anchor og ikke som geometrisk sentrum for trehusområdet.'
  },
  vaalerenga: {
    lat: 59.9076477,
    lon: 10.7872813,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:366154118',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 366154118 – Vålerenga',
    coordSourceId: 'osm-node:366154118',
    coordSourceUrl: 'https://www.openstreetmap.org/node/366154118',
    coordVerifiedAt: today,
    coordNote: 'Navngitt OSM-suburb-node for Vålerenga, kryssjekket mot Oslo byleksikons dokumenterte boligstrøk. Punktet brukes som representativt area-anchor for strøket, ikke som anker for Vålerenga kirke, stadion eller én enkelt gate.'
  },
  vinderen: {
    lat: 59.9418585,
    lon: 10.7068248,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:1125573258',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 1125573258 – Vinderen',
    coordSourceId: 'osm-node:1125573258',
    coordSourceUrl: 'https://www.openstreetmap.org/node/1125573258',
    coordVerifiedAt: today,
    coordNote: 'Navngitt OSM-suburb-node for Vinderen, kryssjekket mot Oslo byleksikons dokumenterte boligstrøk. Suburb-noden brukes som representativt area-anchor; Vinderen stasjon er eksplisitt avvist som hovedanker for hele boligområdet.'
  },
  ullern: {
    lat: 59.9255671,
    lon: 10.6557981,
    locatorType: 'linear_area',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:1370932493',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'area_anchor',
    coordType: 'district_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 1370932493 – Ullern',
    coordSourceId: 'osm-node:1370932493',
    coordSourceUrl: 'https://www.openstreetmap.org/node/1370932493',
    coordVerifiedAt: today,
    coordNote: 'Navngitt OSM-suburb-node for Ullern, kryssjekket mot Oslo byleksikons dokumenterte strøk. Den bredere administrative bydel-relasjonen er eksplisitt avvist; dette punktet er et representativt area-anchor for strøket som place-recorden beskriver.'
  },
  spikersuppa: {
    lat: 59.9138411,
    lon: 10.7372086,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-relation:11158886',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'site_center',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 11158886 – Spikersuppa',
    coordSourceId: 'osm-relation:11158886',
    coordSourceUrl: 'https://www.openstreetmap.org/relation/11158886',
    coordVerifiedAt: today,
    coordNote: 'Eksakt navngitt OSM-relasjon for Spikersuppa-bassenget, kryssjekket mot Oslo byleksikon og Oslo kommunes omtale av Spikersuppa/Studenterlunden. Relasjonens geometriske senter brukes som site-center; eksisterende radius dekker den bredere offentlige byromsbruken recorden formidler.'
  }
};

const aggregate = readJson(aggregatePath);
const categoryIndex = readJson(categoryIndexPath);
const splitManifest = readJson(splitManifestPath);
const metadataFields = [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource',
  'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote'
];

for (const [id, patch] of Object.entries(verified)) {
  const splitPath = path.join(splitDir, `${id}.json`);
  const split = readJson(splitPath);
  const aggregateRow = aggregate.find((item) => item?.id === id);
  const indexRow = categoryIndex.find((item) => item?.id === id);
  const manifestRow = splitManifest.places.find((item) => item?.id === id);
  if (!aggregateRow || !indexRow || !manifestRow) throw new Error(`Mangler sync-rad for ${id}`);
  for (const [key, value] of Object.entries(patch)) {
    split[key] = value;
    aggregateRow[key] = value;
  }
  manifestRow.sha256 = writeJsonAndHash(splitPath, split);
  for (const field of metadataFields) {
    if (Object.prototype.hasOwnProperty.call(split, field)) indexRow[field] = split[field];
    else delete indexRow[field];
  }
}

const aggregateText = JSON.stringify(aggregate, null, 2) + '\n';
fs.writeFileSync(aggregatePath, aggregateText);
splitManifest.source_sha256 = sha256(aggregateText);
splitManifest.generated_at = new Date().toISOString();
writeJson(splitManifestPath, splitManifest);
writeJson(categoryIndexPath, categoryIndex);

const placeById = new Map(aggregate.map((p) => [p.id, p]));
const placeFile = 'data/places/by/oslo/places_by.json';
const snapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? ''
});

const specs = {
  'ullevål_hageby': {
    identity: 'Ullevål hageby som planlagt bolig- og hagebyområde',
    identitySource: 'Oslo byleksikon – Ullevål hageby',
    identityUrl: 'https://oslobyleksikon.no/side/Ullev%C3%A5l_hageby',
    objectId: 'osm-node:1125978057',
    objectName: 'OpenStreetMap node 1125978057 – Ullevål hageby',
    objectUrl: 'https://www.openstreetmap.org/node/1125978057'
  },
  'romsaås': {
    identity: 'Romsås som boligstrøk og drabantby',
    identitySource: 'Oslo byleksikon – Romsås (strøk)',
    identityUrl: 'https://oslobyleksikon.no/side/Roms%C3%A5s_(str%C3%B8k)',
    objectId: 'osm-node:963813366',
    objectName: 'OpenStreetMap node 963813366 – Romsås',
    objectUrl: 'https://www.openstreetmap.org/node/963813366'
  },
  rodelokka: {
    identity: 'Rodeløkka som avgrenset historisk boligstrøk',
    identitySource: 'Oslo byleksikon – Rodeløkka (strøk)',
    identityUrl: 'https://oslobyleksikon.no/side/Rodel%C3%B8kka_(str%C3%B8k)',
    objectId: 'osm-node:1290871351',
    objectName: 'OpenStreetMap node 1290871351 – Rodeløkka',
    objectUrl: 'https://www.openstreetmap.org/node/1290871351'
  },
  vaalerenga: {
    identity: 'Vålerenga som historisk boligstrøk',
    identitySource: 'Oslo byleksikon – Vålerenga (strøk)',
    identityUrl: 'https://oslobyleksikon.no/side/V%C3%A5lerenga_(str%C3%B8k)',
    objectId: 'osm-node:366154118',
    objectName: 'OpenStreetMap node 366154118 – Vålerenga',
    objectUrl: 'https://www.openstreetmap.org/node/366154118'
  },
  vinderen: {
    identity: 'Vinderen som boligstrøk',
    identitySource: 'Oslo byleksikon – Vinderen (strøk)',
    identityUrl: 'https://oslobyleksikon.no/side/Vinderen_(str%C3%B8k)',
    objectId: 'osm-node:1125573258',
    objectName: 'OpenStreetMap node 1125573258 – Vinderen',
    objectUrl: 'https://www.openstreetmap.org/node/1125573258'
  },
  ullern: {
    identity: 'Ullern som boligstrøk, ikke hele administrative bydel',
    identitySource: 'Oslo byleksikon – Ullern (strøk)',
    identityUrl: 'https://oslobyleksikon.no/side/Ullern_(str%C3%B8k)',
    objectId: 'osm-node:1370932493',
    objectName: 'OpenStreetMap node 1370932493 – Ullern',
    objectUrl: 'https://www.openstreetmap.org/node/1370932493'
  },
  spikersuppa: {
    identity: 'Spikersuppa-bassenget og det tilknyttede offentlige byrommet i Studenterlunden',
    identitySource: 'Oslo byleksikon – Spikersuppa',
    identityUrl: 'https://oslobyleksikon.no/side/Spikersuppa',
    objectId: 'osm-relation:11158886',
    objectName: 'OpenStreetMap relation 11158886 – Spikersuppa',
    objectUrl: 'https://www.openstreetmap.org/relation/11158886'
  }
};

for (const [id, spec] of Object.entries(specs)) {
  const place = placeById.get(id);
  if (!place) throw new Error(`Mangler place ${id}`);
  const evidence = {
    placeId: id,
    placeFile,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: spec.identity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: place.locatorType,
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['dokumentert fysisk område-/objektidentitet', 'navngitt OSM-objekt', 'canonical duplikatkontroll'],
    evidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: spec.identitySource,
        sourceUrl: spec.identityUrl,
        sourceObjectId: `identity:${id}`,
        sourceQuality: 'documented_physical_identity',
        finding: `${spec.identitySource} dokumenterer ${spec.identity}.`,
        canVerifyCoordinate: true,
        reason: 'Kilden løser place-identiteten og avgrenser hvilken type fysisk sted recorden representerer.'
      },
      {
        sourceProvider: 'osm',
        sourceName: spec.objectName,
        sourceUrl: spec.objectUrl,
        sourceObjectId: spec.objectId,
        sourceQuality: 'named_object_geometry',
        finding: `OSM-objektet er eksplisitt navngitt ${place.name} og brukes som det sporbare fysiske ankeret.`,
        canVerifyCoordinate: true,
        reason: 'Navngitt objekt matcher den dokumenterte place-identiteten; alternative stasjons-/administrative treff er avvist der de finnes.'
      }
    ],
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: spec.objectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Koordinatkontrakt anvendt på canonical place.'
    },
    notes: ['Koordinatkontrakt anvendt i batch 27.']
  };
  writeJson(path.join(evidenceRoot, 'oslo/by', `${id}.json`), evidence);
}

const evidenceManifest = readJson(evidenceManifestPath);
for (const id of Object.keys(specs)) {
  const rel = `oslo/by/${id}.json`;
  if (!evidenceManifest.files.includes(rel)) evidenceManifest.files.push(rel);
}
writeJson(evidenceManifestPath, evidenceManifest);

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo koordinatkontroll – batch 27\n\nDato: 2026-07-19\n\nKontroll 166–172 fortsetter i den første ukontrollerte aktive sekundærkøen etter top-level manifestrekkefølgen: by-manifestet. Alle sju records får sporbare, objekttilpassede coordinate contracts.\n\n| placeId | resultat | kildeobjekt |\n|---|---|---|\n| \`ullevål_hageby\` | verified_geometry | \`osm-node:1125978057\` |\n| \`romsaås\` | verified_geometry | \`osm-node:963813366\` |\n| \`rodelokka\` | verified_geometry | \`osm-node:1290871351\` |\n| \`vaalerenga\` | verified_geometry | \`osm-node:366154118\` |\n| \`vinderen\` | verified_geometry | \`osm-node:1125573258\` |\n| \`ullern\` | verified_geometry | \`osm-node:1370932493\` |\n| \`spikersuppa\` | verified_geometry | \`osm-relation:11158886\` |\n\n## Metode\n\n- De seks bolig-/bydelsstedene bruker navngitte OSM place-noder som semantic area anchors; ingen adressepunkt er brukt for hele områder.\n- Romsås- og Vinderen-stasjoner er avvist som hovedankre for områdene.\n- Ullerns administrative bydel-relasjon er avvist til fordel for suburb-noden som matcher place-scope.\n- Rodeløkken på Bygdøy er avvist som navnelik feilmatch for Rodeløkka.\n- Spikersuppa bruker den eksakte navngitte OSM-relasjonen for bassenget som site-center; radiusen beholder den bredere byromsbruken.\n- Repo-wide duplikataudit fant ingen alternative canonical place-records for de sju ID-ene.\n`);

let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 137 verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 144 verifiserte eller kildekontrollerte canonical steder. Batch 27 godkjenner sju nye objekttilpassede ankere fra by-manifestet: seks navngitte bolig-/bydelsområder som semantic area anchors og Spikersuppa som eksakt navngitt OSM-objekt. Antallet fullførte kontroller uten godkjent Oslo-koordinat er fortsatt 30.'
);
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 137 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 144 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);

const anchor = '| 26 | `christiania_seildugsfabrik` | Christiania Seildugsfabrik | verified | `geonorge-adresser-v1:0301:11891:24` |';
const rows = `${anchor}\n| 27 | \`ullevål_hageby\` | Ullevål Hageby | verified_geometry | \`osm-node:1125978057\` |\n| 27 | \`romsaås\` | Romsås | verified_geometry | \`osm-node:963813366\` |\n| 27 | \`rodelokka\` | Rodeløkka | verified_geometry | \`osm-node:1290871351\` |\n| 27 | \`vaalerenga\` | Vålerenga | verified_geometry | \`osm-node:366154118\` |\n| 27 | \`vinderen\` | Vinderen | verified_geometry | \`osm-node:1125573258\` |\n| 27 | \`ullern\` | Ullern | verified_geometry | \`osm-node:1370932493\` |\n| 27 | \`spikersuppa\` | Spikersuppa | verified_geometry | \`osm-relation:11158886\` |`;
if (!protocol.includes('| 27 | `ullevål_hageby`')) {
  if (!protocol.includes(anchor)) throw new Error('Mangler batch 26 protokollanker');
  protocol = protocol.replace(anchor, rows);
}

protocol = protocol.replace('- Neste nye Oslo-kontroll er nummer 166 og starter batch 27.', '- Neste nye Oslo-kontroll er nummer 173 og starter batch 28.');
protocol = protocol.replace('- Batch 26 er fullført med to nye godkjente ankere og tre nye dokumenterte `needs_review`-utfall; `places_naeringsliv_manifest.json` er nå ferdig kontrollert.', '- Batch 27 er fullført med sju nye godkjente ankere fra `places_by_manifest.json`.');
protocol = protocol.replace('- Næringslivsmanifestet er uttømt etter `akerselva_industri`. Før batch 27 starter skal neste sekundære Oslo-kildekø auditeres eksplisitt; ikke gjett neste manifest eller kategori.', '- By-manifestet har to ukontrollerte records igjen etter batch 27: `bankplassen` og `christiania_torv`. Batch 28 avslutter denne kildekøen med disse to før neste sekundære Oslo-kilde velges eksplisitt.');
fs.writeFileSync(protocolPath, protocol);

console.log('Batch 27 applied: 7 verified coordinate contracts, protocol advanced to control 173.');
