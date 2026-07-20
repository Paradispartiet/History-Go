import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-38';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';

const corrections = [
  {
    id: 'bislett',
    folder: 'by',
    changes: {
      lat: 59.9255533,
      lon: 10.7318943,
      locatorType: 'current_place',
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:1126526860',
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'area_anchor',
      coordType: 'neighbourhood_place_anchor',
      coordStatus: 'verified_geometry',
      coordSource: 'OpenStreetMap node 1126526860 – Bislett; identity cross-checked with Oslo byleksikon and Oslo kommune',
      coordSourceId: 'osm-node:1126526860',
      coordSourceUrl: 'https://www.openstreetmap.org/node/1126526860',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Bislett-recorden representerer strøket og det urbane knutepunktet, ikke Bislett stadion. Det eksakte navngitte OSM place=suburb-punktet for Bislett brukes som semantisk områdeanker og ligger separat fra canonical `bislett_stadion`. Oslo byleksikon dokumenterer Bislett som boligstrøk med idrettsplassen som midtpunkt, mens Oslo kommune behandler Bislettrundkjøringen og gatene rundt som et eget byrom/knutepunkt.'
    }
  },
  {
    id: 'st_halvard_bryggeri',
    folder: 'naeringsliv',
    changes: {
      year: 1877,
      desc: 'Historisk bryggeri i Pilestredet 75C, etablert som Nora Bryggeri i 1877 og senere drevet som St. Halvards Bryggeri og Nora Mineralvand-Fabrik før nedleggelsen i 1918.',
      popupDesc: 'Bryggerivirksomheten i Pilestredet 75C startet i 1877 som Nora Bryggeri. Fra 1882 ble det også produsert mineralvann under Nora-navnet, og etter flere selskapsendringer fikk anlegget i 1905 navnet St. Halvards Bryggeri og Nora Mineralvandfabrik. Bryggeriet ble nedlagt i 1918, da Nora-virksomheten flyttet videre til Maridalsveien 3.\n\nHistory Go modellerer dette som det historiske bryggeristedet i Pilestredet 75C. Det offisielle adressepunktet brukes som et dokumentert historisk stedsanker for adressen der virksomheten lå, ikke som en påstand om at punktet er sentrum av et bevart 1877-bygg.',
      lat: 59.926947161930386,
      lon: 10.728609002744596,
      locatorType: 'historic_site',
      sourceProvider: 'manual_research',
      sourceObjectId: 'oslobyleksikon:st-halvards-bryggeri',
      address: { street: 'Pilestredet', number: '75C', postcode: '0354', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'historical_approximation',
      coordRole: 'historical_anchor',
      coordType: 'historical_site_address_anchor',
      coordStatus: 'verified_historical_source',
      coordSource: 'Oslo byleksikon – St. Halvards Bryggeri; Geonorge Adresser API v1 – Pilestredet 75C',
      coordSourceId: 'geonorge-adresser-v1:0301:15670:75C',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Pilestredet%2075C%20Oslo',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Oslo byleksikon dokumenterer bryggeristedet i Pilestredet 75C: virksomheten startet som Nora Bryggeri i 1877, fikk St. Halvards-navnet i 1905 og ble nedlagt i 1918. Det allerede lagrede entydige Geonorge-punktet for Pilestredet 75C brukes som historisk adresseanker for stedet etter at recordens feilaktige år og østkant-identitet er korrigert; koblingen mellom dagens adressepunkt og det historiske anleggets eksakte bygningsutstrekning behandles derfor som en historisk tilnærming, ikke som et eksakt historisk bygningssentrum.'
    }
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
function snapshot(place) {
  return {
    lat: place.lat ?? null, lon: place.lon ?? null, r: place.r ?? null,
    coordStatus: place.coordStatus ?? '', coordSource: place.coordSource ?? '',
    coordType: place.coordType ?? '', coordNote: place.coordNote ?? ''
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
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
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

function writePlaceCopies(hit, place) {
  if (Array.isArray(hit.data)) hit.data[hit.index] = place;
  else if (Array.isArray(hit.data.places)) hit.data.places[hit.index] = place;
  else if (Array.isArray(hit.data.items)) hit.data.items[hit.index] = place;
  else Object.assign(hit.data, place);
  writeJson(hit.sourceRel, hit.data);

  const manifestRel = splitManifestRel(hit.sourceRel);
  if (!fs.existsSync(abs(manifestRel))) return;
  const splitManifest = readJson(manifestRel);
  const manifestRow = (splitManifest.places || []).find((row) => row?.id === place.id);
  if (!manifestRow?.file) throw new Error(`${place.id}: split child missing`);
  const childRel = path.join(path.dirname(manifestRel), manifestRow.file).replace(/\\/g, '/');
  writeJson(childRel, place);
  manifestRow.sha256 = sha256File(childRel);
  if (splitManifest.source_sha256 !== undefined) splitManifest.source_sha256 = sha256File(hit.sourceRel);
  if (splitManifest.generated_at !== undefined) splitManifest.generated_at = new Date().toISOString();
  writeJson(manifestRel, splitManifest);

  const indexRel = splitIndexRel(hit.sourceRel);
  if (!fs.existsSync(abs(indexRel))) return;
  const indexData = readJson(indexRel);
  const indexRow = rowsFrom(indexData).find((row) => row?.id === place.id);
  if (!indexRow) return;
  const fields = ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordSourceId','coordSourceUrl','coordPrecisionM','coordVerifiedAt','coordNote','geometry','anchors'];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(place, field)) indexRow[field] = place[field];
    else if (Object.prototype.hasOwnProperty.call(indexRow, field)) delete indexRow[field];
  }
  writeJson(indexRel, indexData);
}

function evidenceManifest() {
  const manifest = readJson(EVIDENCE_MANIFEST);
  return { manifest, files: Array.isArray(manifest.files) ? manifest.files : [] };
}
function findEvidence(placeId) {
  const hits = [];
  for (const entry of evidenceManifest().files) {
    const rel = `data/coordinate-evidence/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    const data = readJson(rel);
    if (data?.placeId === placeId) hits.push({ rel, data });
  }
  if (hits.length > 1) throw new Error(`${placeId}: multiple evidence files`);
  return hits[0] || null;
}
function ensureEvidence(config, sourceRel) {
  const existing = findEvidence(config.id);
  if (existing) return existing;
  const rel = `data/coordinate-evidence/oslo/${config.folder}/${config.id}.json`;
  const data = {
    schemaVersion: '1.0', placeId: config.id, placeFile: sourceRel,
    evidenceStatus: 'needs_research', coordinateDecision: 'needs_geometry', currentCoordinate: {},
    identity: { currentName: config.id, resolvedIdentity: config.id, identityStatus: 'resolved', identityProblem: '', requiresSplit: false, splitReason: '' },
    requiredEvidence: [], evidence: [], addressCandidates: [], sourceObjectCandidates: [], geometryCandidates: [], coordinateCandidates: [],
    decision: { canBecomeVerified: false, blockedReason: '', nextAction: '' }, notes: []
  };
  writeJson(rel, data);
  const rootRel = rel.replace(/^data\/coordinate-evidence\//, '');
  const { manifest, files } = evidenceManifest();
  manifest.files = [...new Set([...files, rootRel])].sort((a, b) => a.localeCompare(b));
  writeJson(EVIDENCE_MANIFEST, manifest);
  return { rel, data };
}

function updateEvidence(config, place, sourceRel) {
  const hit = ensureEvidence(config, sourceRel);
  const e = hit.data;
  e.placeFile = sourceRel;
  e.evidenceStatus = 'applied_to_place';
  e.coordinateDecision = 'do_not_change_coordinates_yet';
  e.currentCoordinate = snapshot(place);
  if (config.id === 'bislett') {
    e.evidence = [
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Bislett (strøk)', sourceUrl: 'https://oslobyleksikon.no/side/Bislett_%28str%C3%B8k%29', sourceObjectId: 'oslobyleksikon:bislett-strok', sourceQuality: 'documented_neighbourhood_identity', finding: 'Bislett dokumenteres som eget strøk og trafikknutepunkt, med idrettsplassen som midtpunkt.', canVerifyCoordinate: false, reason: 'Identitets- og scope-kryssjekk.' },
      { sourceProvider: 'municipality', sourceName: 'Oslo kommune – Konseptvalgutredning for Bislett', sourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/konseptvalgutredning-for-bislett/', sourceObjectId: 'oslo-kommune:kvu:bislettrundkjoringen', sourceQuality: 'official_current_area_definition', finding: 'Kommunen behandler Bislettrundkjøringen og gatene rundt som et eget urbant område/knutepunkt.', canVerifyCoordinate: false, reason: 'Kryssjekker separat fysisk scope fra stadion.' },
      { sourceProvider: 'osm', sourceName: 'OpenStreetMap node 1126526860 – Bislett', sourceUrl: 'https://www.openstreetmap.org/node/1126526860', sourceObjectId: 'osm-node:1126526860', sourceQuality: 'unique_exact_named_place_object', finding: 'Ett eksakt navngitt place=suburb-objekt for Bislett.', canVerifyCoordinate: true, reason: place.coordNote }
    ];
    e.sourceObjectCandidates = [{ sourceProvider: 'osm', sourceObjectId: 'osm-node:1126526860', canApplyToPlace: true }];
    e.geometryCandidates = [{ sourceProvider: 'osm', sourceObjectId: 'osm-node:1126526860', canApplyToPlace: true }];
  } else {
    e.evidence = [
      { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – St. Halvards Bryggeri', sourceUrl: 'https://oslobyleksikon.no/side/St._Halvards_Bryggeri', sourceObjectId: 'oslobyleksikon:st-halvards-bryggeri', sourceQuality: 'documented_historical_identity_and_address', finding: 'Bryggeristedet dokumenteres i Pilestredet 75C fra 1877, med St. Halvards-navnet fra 1905 og nedleggelse i 1918.', canVerifyCoordinate: true, reason: place.coordNote },
      { sourceProvider: 'official_address', sourceName: 'Geonorge Adresser API v1 – Pilestredet 75C', sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Pilestredet%2075C%20Oslo', sourceObjectId: 'geonorge-adresser-v1:0301:15670:75C', sourceQuality: 'official_address_site_anchor', finding: 'Ett entydig adressepunkt for den historisk dokumenterte adressen.', canVerifyCoordinate: true, reason: 'Historisk adresseanker, ikke eksakt historisk bygningssentrum.' }
    ];
    e.addressCandidates = [{ address: 'Pilestredet 75C Oslo', sourceProvider: 'official_address', sourceObjectId: 'geonorge-adresser-v1:0301:15670:75C', canApplyToPlace: true }];
    e.sourceObjectCandidates = [{ sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:st-halvards-bryggeri', canApplyToPlace: true }];
    e.geometryCandidates = [];
  }
  e.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }];
  e.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildebelagt anker er anvendt på canonical place.' };
  e.notes = [place.coordNote];
  writeJson(hit.rel, e);
}

function applyCorrection(config) {
  const hit = findActiveSource(config.id);
  const before = structuredClone(hit.rows[hit.index]);
  const place = { ...before, ...config.changes };
  if (config.id === 'st_halvard_bryggeri' && place.quiz_profile) {
    place.quiz_profile = structuredClone(place.quiz_profile);
    place.quiz_profile.signature_features = [
      'bryggeristed i Pilestredet 75C fra 1877',
      'Nora Bryggeri og Nora Mineralvand-Fabrik før St. Halvards-navnet fra 1905',
      'historisk industristed som ble avviklet som bryggeri i 1918'
    ];
    place.quiz_profile.notes = 'Spør stedet gjennom dokumentert bryggeri- og industrihistorie i Pilestredet 75C, ikke som et oppdiktet østkantbryggeri.';
  }
  writePlaceCopies(hit, place);
  updateEvidence(config, place, hit.sourceRel);
  return { id: config.id, before: snapshot(before), after: snapshot(place), sourceObjectId: place.sourceObjectId, sourceFile: hit.sourceRel };
}

function updateProtocol(applied) {
  const rel = 'docs/coordinates/coordinate-control-protocol.md';
  let text = fs.readFileSync(abs(rel), 'utf8').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${VERIFIED_AT}`);
  const rows = applied.map((item) => {
    const hit = findActiveSource(item.id); const p = hit.rows[hit.index];
    return `| 38 | \`${p.id}\` | ${p.name} | ${p.coordStatus} | \`${p.sourceObjectId}\` |`;
  });
  if (!text.includes('| 38 |')) {
    const anchor = '| 37 | `frysja_33_brekke_kraftstasjon` | Frysja 33 – Brekke kraftstasjon | verified | `geonorge-adresser-v1:0301:13747:151C` |';
    text = text.replace(anchor, `${anchor}\n${rows.join('\n')}`);
  }
  text = text.split('\n').filter((line) => !line.includes('| `bislett` –') && !line.includes('| `st_halvard_bryggeri` –')).join('\n');
  const note = 'Batch 38 (2026-07-20) skiller `bislett` fysisk fra `bislett_stadion` ved å bruke det entydige navngitte OSM-strøksobjektet som områdeanker, og retter `st_halvard_bryggeri` til det dokumenterte historiske bryggeristedet i Pilestredet 75C før det tidligere lagrede entydige Geonorge-punktet tas i bruk som historisk adresseanker. `sigrid_undset_statue` forblir needs_review uten sokkelpunkt, og `grensen_kjopesenter` holdes tilbake til en egen lineær gate-modell med flere segmenter/ankre.';
  if (!text.includes(note)) text = text.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${note}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
  const osloStart = text.indexOf('## Oslo');
  const unresolvedStart = text.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');
  const etneStart = text.indexOf('## Etne');
  const verifiedCount = (text.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
  const unresolvedSection = text.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : text.length);
  const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
  text = text.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 38 løser Bislett-strøket separat fra stadion og retter St. Halvards Bryggeri før historisk adresseanker godkjennes. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
  text = text.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
  fs.writeFileSync(abs(rel), text);
}

const applied = corrections.map(applyCorrection);
updateProtocol(applied);
writeJson(`${REPORT_DIR}/application-results.json`, {
  date: VERIFIED_AT,
  applied,
  unchanged: [
    { id: 'sigrid_undset_statue', result: 'unchanged_needs_review', reason: 'No exact monument/pedestal object found.' },
    { id: 'grensen_kjopesenter', result: 'deferred_linear_model', reason: 'Grensen consists of multiple street ways and requires a dedicated line/segment model.' }
  ]
});
fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 38\n\nDato: ${VERIFIED_AT}\n\n- \`bislett\` → **verified_geometry** på eget navngitt OSM-strøksanker \`osm-node:1126526860\`, fysisk og semantisk skilt fra \`bislett_stadion\`.\n- \`st_halvard_bryggeri\` → historikken er korrigert til Nora Bryggeri fra 1877 / St. Halvards-navnet fra 1905 / nedlagt 1918, og recorden får **verified_historical_source** på det dokumenterte Pilestredet 75C-stedet med Geonorge-adressepunkt som historisk tilnærmet site-anchor.\n- \`sigrid_undset_statue\` → fortsatt **needs_review**; eksakt sokkelpunkt mangler.\n- \`grensen_kjopesenter\` → utsatt til eget lineært gatepass; tre separate OSM-way-er skal ikke presses inn i ett tilfeldig punkt.\n`);
console.log(JSON.stringify({ ok: true, applied }, null, 2));
