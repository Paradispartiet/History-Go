import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-retro-audit-from-batch-6');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const fixes = [
  {
    id: 'gronland_basarene',
    name: 'Grønland basarene',
    aggregate: 'data/places/by/oslo/places_by.json',
    child: 'data/places/by/oslo/places/gronland_basarene.json',
    manifest: 'data/places/by/oslo/places_by_manifest.json',
    index: 'data/places/by/oslo/places_by_index.json',
    fields: {
      lat: 59.91278287002734,
      lon: 10.76391148376898,
      r: 60,
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:17875:2',
      address: { street: 'Tøyengata', number: '2', postcode: '0190', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordType: 'address_point',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Tøyengata 2, OSLO. Punktet er representasjonspunktet for adressen og brukes som display-marker, ikke som kai-, vei-, vannflate- eller generelt områdeanker.',
      coordVerifiedAt: VERIFIED_AT
    }
  },
  {
    id: 'mollergata_19',
    name: 'Møllergata 19',
    aggregate: 'data/places/historie/oslo/places_historie.json',
    child: 'data/places/historie/oslo/places_historie/mollergata_19.json',
    manifest: 'data/places/historie/oslo/places_historie_manifest.json',
    index: 'data/places/historie/oslo/places_historie_index.json',
    fields: {
      lat: 59.91528413168428,
      lon: 10.747869191554551,
      r: 60,
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:14943:19',
      address: { street: 'Møllergata', number: '19', postcode: '0179', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordType: 'address_point',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Møllergata 19, OSLO. Punktet er representasjonspunktet for adressen og brukes som display-marker, ikke som kai-, vei-, vannflate- eller generelt områdeanker.',
      coordVerifiedAt: VERIFIED_AT
    }
  },
  {
    id: 'villa_grande',
    name: 'Villa Grande',
    aggregate: 'data/places/historie/oslo/places_historie.json',
    child: 'data/places/historie/oslo/places_historie/villa_grande.json',
    manifest: 'data/places/historie/oslo/places_historie_manifest.json',
    index: 'data/places/historie/oslo/places_historie_index.json',
    fields: {
      lat: 59.89911019330011,
      lon: 10.678158888428362,
      r: 60,
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:13153:56',
      address: { street: 'Huk aveny', number: '56', postcode: '0287', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordType: 'address_point',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Huk aveny 56, OSLO. Punktet er representasjonspunktet for adressen og brukes som display-marker, ikke som kai-, vei-, vannflate- eller generelt områdeanker.',
      coordVerifiedAt: VERIFIED_AT
    }
  }
];

const obsoleteCoordinateFields = ['coordPrecision', 'coordPrecisionM', 'coordSourceId', 'coordSourceUrl'];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, value) { fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`); }
function sha256(rel) { return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex'); }

function findPlace(data, id, rel) {
  if (Array.isArray(data)) {
    const matches = data.filter((row) => row && row.id === id);
    if (matches.length !== 1) throw new Error(`${rel}: expected exactly one ${id}, found ${matches.length}`);
    return matches[0];
  }
  if (data && typeof data === 'object' && data.id === id) return data;
  throw new Error(`${rel}: place ${id} not found`);
}

function applyFields(place, fields) {
  for (const key of obsoleteCoordinateFields) delete place[key];
  Object.assign(place, fields);
}

const beforeAfter = [];
for (const fix of fixes) {
  for (const rel of [fix.aggregate, fix.child]) {
    const data = readJson(rel);
    const place = findPlace(data, fix.id, rel);
    const before = {
      lat: place.lat,
      lon: place.lon,
      coordType: place.coordType,
      coordStatus: place.coordStatus,
      sourceProvider: place.sourceProvider,
      sourceObjectId: place.sourceObjectId
    };
    applyFields(place, fix.fields);
    writeJson(rel, data);
    if (rel === fix.child) beforeAfter.push({ id: fix.id, name: fix.name, before, after: { ...fix.fields } });
  }

  if (fs.existsSync(abs(fix.index))) {
    const index = readJson(fix.index);
    const row = findPlace(index, fix.id, fix.index);
    row.lat = fix.fields.lat;
    row.lon = fix.fields.lon;
    row.r = fix.fields.r;
    row.coordStatus = fix.fields.coordStatus;
    row.coordType = fix.fields.coordType;
    writeJson(fix.index, index);
  }
}

const manifestGroups = new Map();
for (const fix of fixes) {
  const key = `${fix.manifest}|${fix.aggregate}`;
  if (!manifestGroups.has(key)) manifestGroups.set(key, { manifest: fix.manifest, aggregate: fix.aggregate, children: [] });
  manifestGroups.get(key).children.push({ id: fix.id, child: fix.child });
}
for (const group of manifestGroups.values()) {
  const manifest = readJson(group.manifest);
  manifest.source_sha256 = sha256(group.aggregate);
  manifest.generated_at = new Date().toISOString();
  for (const child of group.children) {
    const row = (manifest.places || []).find((item) => item.id === child.id);
    if (!row) throw new Error(`${group.manifest}: missing manifest row for ${child.id}`);
    row.sha256 = sha256(child.child);
  }
  writeJson(group.manifest, manifest);
}

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8');
const protocolReplacements = [
  ['| 6 | `gronland_basarene` | Grønland basarene | verified | `osm-node:1022312515` |', '| 6 | `gronland_basarene` | Grønland basarene | verified | `geonorge-adresser-v1:0301:17875:2` |'],
  ['| 6 | `mollergata_19` | Møllergata 19 | verified | `osm-way:112207578` |', '| 6 | `mollergata_19` | Møllergata 19 | verified | `geonorge-adresser-v1:0301:14943:19` |'],
  ['| 6 | `villa_grande` | Villa Grande | verified | `osm-node:12591050047` |', '| 6 | `villa_grande` | Villa Grande | verified | `geonorge-adresser-v1:0301:13153:56` |']
];
for (const [from, to] of protocolReplacements) {
  if (!protocol.includes(from)) throw new Error(`Protocol row not found: ${from}`);
  protocol = protocol.replace(from, to);
}
const auditNote = 'Retrokontroll fra batch 6 (2026-07-20): Batch 6 er korrigert tilbake til den låste adresse-first-metoden. `gronland_basarene`, `mollergata_19` og `villa_grande` bruker igjen de entydige Geonorge-resultatene fra den opprinnelige batch-6-kjøringen; senere OSM-baserte visual-marker-overstyringer er fjernet fra canonical koordinatkilde. OSM kan fortsatt brukes som visuell QA, men ikke som primær koordinatkilde for disse tre konkrete adressebare byggene.';
if (!protocol.includes(auditNote)) {
  const marker = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  if (!protocol.includes(marker)) throw new Error('Protocol insertion marker not found');
  protocol = protocol.replace(marker, `${auditNote}\n\n${marker}`);
}
fs.writeFileSync(abs(protocolRel), protocol);

writeJson('reports/oslo-coordinate-retro-audit-from-batch-6/batch-6-summary.json', {
  auditStartBatch: 6,
  auditedThroughBatch: 6,
  date: VERIFIED_AT,
  status: 'batch_6_corrected_address_first',
  finding: 'Three addressable buildings had later OSM visual-marker overrides despite stored unambiguous Geonorge verified candidates.',
  correctedPlaces: beforeAfter,
  sourceEvidence: 'reports/geonorge-address-batch-6/*.json and reports/address-first-coordinate-batch-6-apply.md',
  nextBatch: 7
});

const readme = `# Oslo coordinate retro-audit from batch 6\n\n## Scope\n\nRetroactive method audit of Oslo coordinate-control batches starting at batch 6, against the locked address-first/object-geometry documentation. The audit proceeds sequentially; no later batch is assumed compliant merely because it is marked verified.\n\n## Batch 6 — corrected\n\nThe original batch-6 Geonorge run stored unambiguous verified candidates for three concrete addressable buildings. Those results were applied, but later visual-marker corrections replaced the canonical source with OSM building/entrance geometry. Under the locked method this was a source-priority regression: for a concrete relevant Norwegian address, Geonorge must be the primary coordinate source. OSM may be used for visual QA, not as the canonical replacement when the address itself represents the place.\n\nCorrected back to the stored Geonorge candidates:\n\n- \`gronland_basarene\` — Tøyengata 2 — \`geonorge-adresser-v1:0301:17875:2\`\n- \`mollergata_19\` — Møllergata 19 — \`geonorge-adresser-v1:0301:14943:19\`\n- \`villa_grande\` — Huk aveny 56 — \`geonorge-adresser-v1:0301:13153:56\`\n\nThe aggregate source files, split child files, split indexes, split-manifest hashes and running coordinate-control protocol are updated together. The runtime place index is regenerated by the coordinate branch runner.\n\n## Batch 7 — method audit\n\n- \`blaa\`: address-first was attempted for Brenneriveien 9C and Geonorge returned \`not_found\`; exact named OSM POI is a documented fallback.\n- \`tinghuset\`: official Geonorge address point.\n- \`bogstad_gard\`: address-first was attempted; the estate address resolves to multiple lettered address points, while the record models the whole named manor complex. Exact estate geometry is retained instead of arbitrarily selecting one address point.\n- \`salt\`: Langkaia 1 is documented as the nearest GPS address and its Geonorge point belongs to Havnelageret, not the SALT site; exact named site POI is appropriate.\n- \`tollbukaia\`: historical quay identity; historical-source treatment is appropriate.\n- \`akershus_kaier\`: quay/linear object; geometry treatment is appropriate.\n- \`oslo_mek\`: historical industrial site; historical-source treatment is appropriate.\n\nBatch 7 is therefore classified as method-compliant after source-priority review.\n\n## Next\n\nContinue with batch 8 and classify every record by physical object before deciding whether it must use an official address or object/geometry evidence.\n`;
fs.writeFileSync(path.join(REPORT_DIR, 'README.md'), readme);

console.log(JSON.stringify({ ok: true, correctedBatch6: fixes.map((f) => f.id), auditedThroughBatch: 7 }, null, 2));
