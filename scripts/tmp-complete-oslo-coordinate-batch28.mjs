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
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-28');
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
  bankplassen: {
    lat: 59.9088335,
    lon: 10.7409519,
    locatorType: 'square',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-relation:12044741',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 12044741 – Bankplassen',
    coordSourceId: 'osm-relation:12044741',
    coordSourceUrl: 'https://www.openstreetmap.org/relation/12044741',
    coordVerifiedAt: today,
    coordNote: 'Eksakt navngitt OSM-relasjon med place=square for Bankplassen, kryssjekket mot Wikidata Q4856441 og den separate canonical bygningen `grunnlovsbygget_bankplassen`. Relasjonens geometriske senter brukes som area-anchor for selve plassen; den gamle Norges Bank er et separat fysisk sted.'
  },
  christiania_torv: {
    lat: 59.9102351,
    lon: 10.7395879,
    locatorType: 'square',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:594329484',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'square_center',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 594329484 – Christiania torv',
    coordSourceId: 'osm-way:594329484',
    coordSourceUrl: 'https://www.openstreetmap.org/way/594329484',
    coordVerifiedAt: today,
    coordNote: 'Eksakt navngitt OSM-way med place=square for Christiania torv, kryssjekket mot den separate canonical bygningen `gamle_radhus`. Wayens geometriske senter brukes som area-anchor for selve torvet; Gamle Rådhus er et eget fysisk sted ved plassen.'
  }
};

const aggregate = readJson(aggregatePath);
const categoryIndex = readJson(categoryIndexPath);
const splitManifest = readJson(splitManifestPath);
const metadataFields = [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'address',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource',
  'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote', 'coordPrecisionM'
];

for (const [id, patch] of Object.entries(verified)) {
  const splitPath = path.join(splitDir, `${id}.json`);
  const split = readJson(splitPath);
  const aggregateRow = aggregate.find((item) => item?.id === id);
  const indexRow = categoryIndex.find((item) => item?.id === id);
  const manifestRow = splitManifest.places.find((item) => item?.id === id);
  if (!aggregateRow || !indexRow || !manifestRow) throw new Error(`Mangler sync-rad for ${id}`);
  delete split.coordPrecisionM;
  delete aggregateRow.coordPrecisionM;
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
  bankplassen: {
    resolvedIdentity: 'Bankplassen som offentlig plass i Kvadraturen, fysisk separat fra Den gamle Norges Bank',
    objectId: 'osm-relation:12044741',
    objectName: 'OpenStreetMap relation 12044741 – Bankplassen',
    objectUrl: 'https://www.openstreetmap.org/relation/12044741',
    extraEvidence: {
      sourceProvider: 'manual_research',
      sourceName: 'Wikidata Q4856441 – Bankplassen',
      sourceUrl: 'https://www.wikidata.org/wiki/Q4856441',
      sourceObjectId: 'wikidata:Q4856441',
      sourceQuality: 'independent_named_place_crosscheck',
      finding: 'Wikidata identifiserer Bankplassen som eget navngitt sted og gir et punkt innenfor den eksakte OSM-plassrelasjonen.',
      canVerifyCoordinate: true,
      reason: 'Uavhengig navne- og lokasjonskryssjekk støtter OSM-relasjonens identitet.'
    }
  },
  christiania_torv: {
    resolvedIdentity: 'Christiania torv som offentlig plass i Kvadraturen, fysisk separat fra Gamle Rådhus',
    objectId: 'osm-way:594329484',
    objectName: 'OpenStreetMap way 594329484 – Christiania torv',
    objectUrl: 'https://www.openstreetmap.org/way/594329484',
    extraEvidence: null
  }
};

for (const [id, spec] of Object.entries(specs)) {
  const place = placeById.get(id);
  const evidenceItems = [
    {
      sourceProvider: 'osm',
      sourceName: spec.objectName,
      sourceUrl: spec.objectUrl,
      sourceObjectId: spec.objectId,
      sourceQuality: 'named_object_geometry',
      finding: `OSM-objektet er eksplisitt navngitt ${place.name}, klassifisert som place=square og avgrenser selve plassen.`,
      canVerifyCoordinate: true,
      reason: 'Eksakt navngitt plassgeometri gir et sporbart area-anchor uten å bruke et nærliggende bygg som stedserstatning.'
    }
  ];
  if (spec.extraEvidence) evidenceItems.push(spec.extraEvidence);
  const evidence = {
    placeId: id,
    placeFile,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: spec.resolvedIdentity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'square',
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['eksakt navngitt plassgeometri', 'fysisk overlap-audit mot separate canonical bygg'],
    evidence: evidenceItems,
    addressCandidates: [],
    sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId: spec.objectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Koordinatkontrakt anvendt på canonical place.'
    },
    notes: ['Koordinatkontrakt anvendt i batch 28.']
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
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo koordinatkontroll – batch 28\n\nDato: 2026-07-19\n\nKontroll 173–174 avslutter \`places_by_manifest.json\`. Begge stedene får full coordinate source contract basert på eksakt navngitt plassgeometri.\n\n| placeId | resultat | kildeobjekt |\n|---|---|---|\n| \`bankplassen\` | verified_geometry | \`osm-relation:12044741\` |\n| \`christiania_torv\` | verified_geometry | \`osm-way:594329484\` |\n\n## Overlap-audit\n\n- Bankplassen er selve plassen og er fysisk modellert separat fra \`grunnlovsbygget_bankplassen\` / Den gamle Norges Bank.\n- Christiania Torv er selve torvet og er fysisk modellert separat fra \`gamle_radhus\`.\n- Ingen bygningsadresse er brukt som erstatning for et plassanker.\n- Bankplassens tidligere Wikidata-punkt er beholdt som uavhengig identitetskryssjekk, mens det eksakte OSM-plassobjektet er canonical koordinatkilde.\n`);

let protocol = fs.readFileSync(protocolPath, 'utf8');
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 144 verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 146 verifiserte eller kildekontrollerte canonical steder. Batch 28 avslutter by-manifestet med to eksakte navngitte plassgeometrier: Bankplassen og Christiania Torv. Antallet fullførte kontroller uten godkjent Oslo-koordinat er fortsatt 30.'
);
protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 144 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 146 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);

const anchor = '| 27 | `spikersuppa` | Spikersuppa | verified_geometry | `osm-relation:11158886` |';
const rows = `${anchor}\n| 28 | \`bankplassen\` | Bankplassen | verified_geometry | \`osm-relation:12044741\` |\n| 28 | \`christiania_torv\` | Christiania Torv | verified_geometry | \`osm-way:594329484\` |`;
if (!protocol.includes('| 28 | `bankplassen`')) {
  if (!protocol.includes(anchor)) throw new Error('Mangler batch 27 protokollanker');
  protocol = protocol.replace(anchor, rows);
}

protocol = protocol.replace('- Neste nye Oslo-kontroll er nummer 173 og starter batch 28.', '- Neste nye Oslo-kontroll er nummer 175 og starter batch 29.');
protocol = protocol.replace('- Batch 27 er fullført med sju nye godkjente ankere fra `places_by_manifest.json`.', '- Batch 28 er fullført med to nye godkjente plassankere; `places_by_manifest.json` er nå ferdig kontrollert.');
protocol = protocol.replace('- By-manifestet har to ukontrollerte records igjen etter batch 27: `bankplassen` og `christiania_torv`. Batch 28 avslutter denne kildekøen med disse to før neste sekundære Oslo-kilde velges eksplisitt.', '- By-manifestet er uttømt etter `christiania_torv`. Før batch 29 starter skal neste aktive sekundære Oslo-kildekø auditeres eksplisitt mot top-level manifestrekkefølgen; ikke gjett neste kategori.');
fs.writeFileSync(protocolPath, protocol);

console.log('Batch 28 applied: 2 verified square geometries, by manifest exhausted, next control 175.');
