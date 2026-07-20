import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-37';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';

const corrections = [
  {
    id: 'norli_universitetsgata',
    lat: 59.9152021,
    lon: 10.7371559,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-node:1664967174',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'display_marker',
    coordType: 'bookshop_poi',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap node 1664967174 – Norli, branch Universitetsgata',
    coordSourceId: 'osm-node:1664967174',
    coordSourceUrl: 'https://www.openstreetmap.org/node/1664967174',
    coordNote: 'Norli oppgir Universitetsgata 22–24, og Geonorge-forsøkene for 22 og 24 ga to separate adressepunkter som derfor ikke kunne velges vilkårlig. Det eksakte navngitte OSM-bokhandelspunktet node 1664967174 er merket shop=books, branch=Universitetsgata og peker til Norlis nettsted. Det brukes som fysisk butikkanker etter den dokumenterte adressekonflikten, ikke som erstatning for adresse-first-regelen.'
  },
  {
    id: 'bankall_gard',
    lat: 59.975059,
    lon: 10.9218833,
    locatorType: 'poi',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-relation:11788354',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'area_anchor',
    coordType: 'historic_farm_complex_area',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap relation 11788354 – Bånkall gård',
    coordSourceId: 'osm-relation:11788354',
    coordSourceUrl: 'https://www.openstreetmap.org/relation/11788354',
    coordNote: 'Geonorge-forsøket for Trondheimsveien 640 ga tidligere flere bokstavdelte adressepunkter og ingen vilkårlig bygning ble valgt. Den eksakte navngitte OSM-relasjonen 11788354 representerer Bånkall gård som historic=farm og landuse=farmyard, med Oslo kommune som operator. Relasjonens representasjonspunkt brukes som områdeanker for hele det kommunalt dokumenterte gårdsanlegget.'
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function sha256File(rel) { return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex'); }
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function currentCoordinate(place) {
  return {
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? '',
    coordSource: place.coordSource ?? '',
    coordType: place.coordType ?? '',
    coordNote: place.coordNote ?? ''
  };
}
function splitManifestRel(sourceRel) {
  const p = path.parse(sourceRel);
  return path.join(p.dir, `${p.name}_manifest${p.ext || '.json'}`).replace(/\\/g, '/');
}
function splitIndexRel(sourceRel) {
  const p = path.parse(sourceRel);
  return path.join(p.dir, `${p.name}_index${p.ext || '.json'}`).replace(/\\/g, '/');
}

function findActiveSource(placeId) {
  const manifest = readJson(PLACE_MANIFEST);
  const hits = [];
  for (const entry of manifest.files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    const rows = rowsFrom(data);
    const index = rows.findIndex((row) => row?.id === placeId);
    if (index >= 0) hits.push({ sourceRel: rel, data, rows, index });
  }
  if (hits.length !== 1) throw new Error(`${placeId}: expected one active source, found ${hits.length}`);
  return hits[0];
}

function writeAggregateAndSplit(hit, updatedPlace) {
  const data = hit.data;
  if (Array.isArray(data)) data[hit.index] = updatedPlace;
  else if (Array.isArray(data.places)) data.places[hit.index] = updatedPlace;
  else if (Array.isArray(data.items)) data.items[hit.index] = updatedPlace;
  else Object.assign(data, updatedPlace);
  writeJson(hit.sourceRel, data);

  const manifestRel = splitManifestRel(hit.sourceRel);
  if (!fs.existsSync(abs(manifestRel))) return;
  const splitManifest = readJson(manifestRel);
  const manifestRow = (splitManifest.places || []).find((row) => row?.id === updatedPlace.id);
  if (!manifestRow?.file) throw new Error(`${updatedPlace.id}: split child missing from ${manifestRel}`);
  const childRel = path.join(path.dirname(manifestRel), manifestRow.file).replace(/\\/g, '/');
  writeJson(childRel, updatedPlace);
  manifestRow.sha256 = sha256File(childRel);
  if (splitManifest.source_sha256 !== undefined) splitManifest.source_sha256 = sha256File(hit.sourceRel);
  if (splitManifest.generated_at !== undefined) splitManifest.generated_at = new Date().toISOString();
  writeJson(manifestRel, splitManifest);

  const indexRel = splitIndexRel(hit.sourceRel);
  if (!fs.existsSync(abs(indexRel))) return;
  const indexData = readJson(indexRel);
  const indexRow = rowsFrom(indexData).find((row) => row?.id === updatedPlace.id);
  if (!indexRow) return;
  const fields = [
    'lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole',
    'coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordPrecisionM','coordVerifiedAt',
    'coordNote','geometry','anchors'
  ];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(updatedPlace, field)) indexRow[field] = updatedPlace[field];
    else if (Object.prototype.hasOwnProperty.call(indexRow, field)) delete indexRow[field];
  }
  writeJson(indexRel, indexData);
}

function evidenceEntries() {
  const manifest = readJson(EVIDENCE_MANIFEST);
  return { manifest, files: Array.isArray(manifest.files) ? manifest.files : [] };
}
function findEvidence(placeId) {
  const { files } = evidenceEntries();
  const hits = [];
  for (const entry of files) {
    const rel = `data/coordinate-evidence/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    if (data?.placeId === placeId) hits.push({ rel, data });
  }
  if (hits.length > 1) throw new Error(`${placeId}: multiple evidence files`);
  return hits[0] || null;
}
function ensureEvidenceFile(placeId, sourceRel) {
  const existing = findEvidence(placeId);
  if (existing) return existing;
  const rel = `data/coordinate-evidence/oslo/historie/${placeId}.json`;
  const evidence = {
    schemaVersion: '1.0',
    placeId,
    placeFile: sourceRel,
    evidenceStatus: 'needs_research',
    coordinateDecision: 'needs_geometry',
    currentCoordinate: {},
    identity: {
      currentName: 'Bånkall gård',
      resolvedIdentity: 'Bånkall gård, det bevarte gårdsanlegget på Trondheimsveien 640',
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'poi',
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: [],
    evidence: [],
    addressCandidates: [],
    sourceObjectCandidates: [],
    geometryCandidates: [],
    coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: '', nextAction: '' },
    notes: []
  };
  writeJson(rel, evidence);
  const rootRel = rel.replace(/^data\/coordinate-evidence\//, '');
  const { manifest, files } = evidenceEntries();
  if (!files.includes(rootRel)) {
    manifest.files = [...files, rootRel].sort((a, b) => a.localeCompare(b));
    writeJson(EVIDENCE_MANIFEST, manifest);
  }
  return { rel, data: evidence };
}

function applyCorrection(config) {
  const hit = findActiveSource(config.id);
  const beforePlace = structuredClone(hit.rows[hit.index]);
  const updated = {
    ...beforePlace,
    lat: config.lat,
    lon: config.lon,
    locatorType: config.locatorType,
    sourceProvider: config.sourceProvider,
    sourceObjectId: config.sourceObjectId,
    geocodeAccuracy: config.geocodeAccuracy,
    coordRole: config.coordRole,
    coordType: config.coordType,
    coordStatus: config.coordStatus,
    coordSource: config.coordSource,
    coordSourceId: config.coordSourceId,
    coordSourceUrl: config.coordSourceUrl,
    coordVerifiedAt: VERIFIED_AT,
    coordNote: config.coordNote
  };
  writeAggregateAndSplit(hit, updated);

  const evidenceHit = config.id === 'bankall_gard'
    ? ensureEvidenceFile(config.id, hit.sourceRel)
    : findEvidence(config.id);
  if (!evidenceHit) throw new Error(`${config.id}: evidence file missing`);
  const evidence = evidenceHit.data;
  evidence.placeFile = hit.sourceRel;
  evidence.evidenceStatus = 'applied_to_place';
  evidence.coordinateDecision = 'do_not_change_coordinates_yet';
  evidence.currentCoordinate = currentCoordinate(updated);

  if (config.id === 'norli_universitetsgata') {
    const osmEvidence = {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap node 1664967174 – Norli, branch Universitetsgata',
      sourceUrl: 'https://www.openstreetmap.org/node/1664967174',
      sourceObjectId: 'osm-node:1664967174',
      sourceQuality: 'unique_exact_named_shop_object',
      finding: 'Nominatim returned one exact shop=books object named Norli with branch=Universitetsgata and Norli website metadata.',
      canVerifyCoordinate: true,
      reason: config.coordNote
    };
    evidence.evidence = [...(evidence.evidence || []).filter((item) => item?.sourceObjectId !== osmEvidence.sourceObjectId), osmEvidence];
  } else {
    evidence.evidence = [
      {
        sourceProvider: 'municipality',
        sourceName: 'Oslo kommune – Bånkall gård',
        sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/bankall-gard',
        sourceObjectId: 'oslo-kommune:kultureiendom:bankall-gard',
        sourceQuality: 'official_site_identity',
        finding: 'Oslo kommune dokumenterer det åtte mål store gårdsanlegget og besøksadressen Trondheimsveien 640.',
        canVerifyCoordinate: false,
        reason: 'Brukes som identitets- og scope-kryssjekk; OSM-relasjonen er geometrikilden.'
      },
      {
        sourceProvider: 'osm',
        sourceName: 'OpenStreetMap relation 11788354 – Bånkall gård',
        sourceUrl: 'https://www.openstreetmap.org/relation/11788354',
        sourceObjectId: 'osm-relation:11788354',
        sourceQuality: 'unique_exact_named_farm_complex_geometry',
        finding: 'Den navngitte relasjonen representerer Bånkall gård som historic=farm og landuse=farmyard og har Oslo kommune som operator.',
        canVerifyCoordinate: true,
        reason: config.coordNote
      }
    ];
  }

  evidence.sourceObjectCandidates = [{ sourceProvider: 'osm', sourceObjectId: config.sourceObjectId, canApplyToPlace: true }];
  evidence.geometryCandidates = [{ sourceProvider: 'osm', sourceObjectId: config.sourceObjectId, canApplyToPlace: true }];
  evidence.coordinateCandidates = [{ lat: config.lat, lon: config.lon, coordRole: config.coordRole, canApplyToPlace: true }];
  evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Eksakt navngitt fysisk objekt er anvendt på canonical place.' };
  evidence.notes = [config.coordNote];
  writeJson(evidenceHit.rel, evidence);

  return {
    id: config.id,
    result: 'applied',
    before: currentCoordinate(beforePlace),
    after: currentCoordinate(updated),
    sourceObjectId: config.sourceObjectId,
    sourceFile: hit.sourceRel
  };
}

function updateProtocol(applied) {
  const rel = 'docs/coordinates/coordinate-control-protocol.md';
  let text = fs.readFileSync(abs(rel), 'utf8');
  text = text.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${VERIFIED_AT}`);

  const verifiedRows = [
    ...applied.map((item) => {
      const place = findActiveSource(item.id).rows[findActiveSource(item.id).index];
      return `| 37 | \`${place.id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`;
    }),
    '| 37 | `frysja_33_brekke_kraftstasjon` | Frysja 33 – Brekke kraftstasjon | verified | `geonorge-adresser-v1:0301:13747:151C` |'
  ];

  if (!text.includes('| 37 |')) {
    const anchor = '| 36 | `inger_hagerups_plass` | Inger Hagerups plass | verified | `lokalhistoriewiki:inger-hagerups-plass` |';
    text = text.replace(anchor, `${anchor}\n${verifiedRows.join('\n')}`);
  }

  text = text.split('\n').filter((line) => {
    if (line.includes('| `norli_universitetsgata` –')) return false;
    if (line.includes('| Bånkall gård | needs_review')) return false;
    if (line.includes('| Frysja 33 / Brekke kraftstasjon | needs_review')) return false;
    return true;
  }).join('\n');

  const note = 'Batch 37 (2026-07-20) løser `norli_universitetsgata` med et entydig navngitt OSM-bokhandelspunkt etter dokumentert 22/24-adressekonflikt, oppgraderer `bankall_gard` til eksakt navngitt gårdsrelasjon etter tvetydig Geonorge-oppslag, og synkroniserer protokollen med at `frysja_33_brekke_kraftstasjon` allerede er canonical verified på Geonorge 151C. `seilduksfabrikken_nydalen` forblir needs_review fordi objektoppslagene ikke ga et entydig navngitt Øvre Spinneri-objekt.';
  if (!text.includes(note)) text = text.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${note}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);

  const osloStart = text.indexOf('## Oslo');
  const unresolvedStart = text.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
  const etneStart = text.indexOf('## Etne');
  const verifiedCount = (text.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
  const unresolvedSection = text.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : text.length);
  const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
  text = text.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 37 løser to åpne objektankre og retter protokollen for ett allerede verifisert sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
  text = text.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);

  fs.writeFileSync(abs(rel), text);
}

function updateReports(applied) {
  const research = readJson(`${REPORT_DIR}/research-summary.json`);
  writeJson(`${REPORT_DIR}/application-results.json`, {
    date: VERIFIED_AT,
    method: 'Object-type-first application. Exact named OSM objects only after documented address/identity conflict; no nearest-result guessing.',
    applied,
    unchanged: [
      {
        id: 'seilduksfabrikken_nydalen',
        result: 'unchanged_needs_review',
        reason: 'Nominatim research returned no exact named object for Øvre Spinneri / Seilduksfabrikken.'
      }
    ],
    protocolReconciliation: {
      id: 'frysja_33_brekke_kraftstasjon',
      canonicalStatus: research.staleProtocolCheck.activeSources?.[0]?.coordStatus || '',
      sourceObjectId: research.staleProtocolCheck.activeSources?.[0]?.sourceObjectId || '',
      result: 'removed_stale_unresolved_row_and_added_verified_protocol_row'
    }
  });

  const readme = `# Oslo koordinatkontroll – batch 37\n\nDato: ${VERIFIED_AT}\n\n- \`norli_universitetsgata\` → **verified_geometry** på eksakt OSM-bokhandelspunkt \`osm-node:1664967174\` etter at Geonorge 22/24 tidligere var dokumentert som tvetydig.\n- \`bankall_gard\` → **verified_geometry** på eksakt OSM-gårdsrelasjon \`osm-relation:11788354\`, kryssjekket mot Oslo kommunes kultureiendom.\n- \`frysja_33_brekke_kraftstasjon\` → ingen canonical koordinatendring; den gamle unresolved-protokollraden fjernes fordi stedet allerede er verified på Geonorge \`151C\`.\n- \`seilduksfabrikken_nydalen\` → fortsatt **needs_review**; research ga ikke ett entydig navngitt Øvre Spinneri-objekt.\n\nRå Nominatim-resultater fra research-passet beholdes i \`nominatim-results/\`. Ingen nærmeste- eller første-treff-gjetting er brukt.\n`;
  fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), readme);
}

const applied = corrections.map(applyCorrection);
updateProtocol(applied);
updateReports(applied);
console.log(JSON.stringify({ ok: true, applied }, null, 2));
