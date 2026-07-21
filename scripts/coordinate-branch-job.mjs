import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const DATE = '2026-07-21';
const BATCH = 121;
const SOURCE_COMMIT = '4a05cc98487c19215670d5f13d50285bd15f09d7';
const OLD_REPORT_DIR = 'reports/oslo-coordinate-control-batch-120-sport-main';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-121-sport-main';
const AGGREGATE = 'data/places/sport/europa/norway/oslo_sport.json';
const CHILD_DIR = 'data/places/sport/europa/norway/oslo_sport';
const INDEX = 'data/places/sport/europa/norway/oslo_sport_index.json';
const MANIFEST = 'data/places/sport/europa/norway/oslo_sport_manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const BT = '`';
const COORD_FIELDS = ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordVerifiedAt','coordNote'];

const ADDRESSABLE = {
  bislett_stadion: {
    address: 'Bislettgata 1 Oslo', variants: ['Bislettgata 1'],
    officialName: 'Oslo kommune – Bislett stadion',
    officialUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/bislett-stadion',
    basis: 'Oslo kommune oppgir Bislettgata 1 som besøksadresse for Bislett stadion.'
  },
  ullevaal_stadion: {
    address: 'Sognsveien 75 Oslo', variants: ['Sognsveien 75'],
    officialName: 'Ullevaal Stadion',
    officialUrl: 'https://ullevaal-stadion.no/kontakt/',
    basis: 'Ullevaal Stadion oppgir Sognsveien 75, inngang K, som besøksadresse.'
  },
  intility_arena: {
    address: 'Innspurten 16A Oslo', variants: ['Innspurten 16 A Oslo', 'Innspurten 16A'],
    officialName: 'Vålerenga Fotball – Intility Arena',
    officialUrl: 'https://www.vif-fotball.no/english-information/contact-info',
    basis: 'Vålerenga Fotball oppgir Innspurten 16A som besøksadresse for Intility Arena.'
  },
  jordal_amfi: {
    address: 'Jordalgata 12 Oslo', variants: ['Jordalgata 12'],
    officialName: 'Oslo kommune – Jordal Amfi',
    officialUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/jordal-amfi',
    basis: 'Oslo kommune oppgir Jordalgata 12 som besøksadresse for Jordal Amfi.'
  },
  frogner_stadion: {
    address: 'Middelthuns gate 26 Oslo', variants: ['Middelthuns gate 26'],
    officialName: 'Oslo kommune – Frogner stadion',
    officialUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/frogner-stadion',
    basis: 'Oslo kommune oppgir Middelthuns gate 26 som besøksadresse for Frogner stadion.'
  },
  valle_hovin_stadion: {
    address: 'Innspurten 1 Oslo', variants: ['Innspurten 1'],
    officialName: 'Oslo kommune – Valle Hovin stadion',
    officialUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/valle-hovin-stadion',
    basis: 'Oslo kommune oppgir Innspurten 1 som besøksadresse for Valle Hovin stadion.'
  },
  gressbanen: {
    address: 'Stasjonsveien 24 Oslo', variants: ['Stasjonsveien 24'],
    officialName: 'Oslo kommune – Gressbanen Ready',
    officialUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrettsanlegg/gressbanen-ready/',
    basis: 'Oslo kommune og Ready oppgir Stasjonsveien 24 som besøksadresse for Gressbanen.'
  },
  kfum_arena: {
    address: 'Ekebergveien 109 Oslo', variants: ['Ekebergveien 109'],
    officialName: 'Norges Fotballforbund – KFUM-Arena',
    officialUrl: 'https://www.fotball.no/fotballdata/anlegg/hjem/?fiksId=11688',
    basis: 'Norges Fotballforbund oppgir Ekebergveien 109 som adresse for KFUM-Arena.'
  },
  vallhall_arena: {
    address: 'Dronning Margretes vei 11 Oslo', variants: ['Dronning Margretes vei 11'],
    officialName: 'Vallhall Arena',
    officialUrl: 'https://vallhall.no/kontakt/',
    basis: 'Vallhall Arena oppgir Dronning Margretes vei 11 som besøksadresse.'
  },
  manglerudhallen: {
    address: 'Plogveien 22 B Oslo', variants: ['Plogveien 22B Oslo', 'Plogveien 22 B', 'Plogveien 22B'],
    officialName: 'Manglerudhallen',
    officialUrl: 'https://manglerudhallen.no/kontakt',
    basis: 'Manglerudhallen oppgir Plogveien 22 B som besøksadresse.'
  },
  furuset_forum: {
    address: 'Søren Bulls vei 4 Oslo', variants: ['Søren Bulls vei 4'],
    officialName: 'Furuset Idrettsforening',
    officialUrl: 'https://www.furuset.no/kontaktbli-medlem',
    basis: 'Furuset Idrettsforening oppgir Søren Bulls vei 4 som adresse for anlegget ved Furuset Forum.'
  }
};

const BROAD_VERIFIED = {
  holmenkollen_nasjonalanlegg: 'osm-way:81300521',
  ekebergsletta: 'osm-relation:15951742'
};

const BROAD_NEEDS_REVIEW = {
  daelenenga_idrettspark: {
    name: 'Dælenenga idrettspark',
    conflict: 'Kontrollen ga ikke én legitim samlet eksakt navngitt områdegeometri for hele canonical anlegget. En enkelt bakke, bane eller delarena kan ikke brukes som proxy for hele området.',
    followup: 'Dokumenter én samlet navngitt områdegeometri eller eksplisitt sammensatt canonical modell for hele anlegget.'
  },
  nordre_aasen_idrettspark: {
    name: 'Nordre Åsen idrettspark',
    conflict: 'Kontrollen ga ikke én legitim samlet eksakt navngitt områdegeometri for hele canonical anlegget. En enkelt bakke, bane eller delarena kan ikke brukes som proxy for hele området.',
    followup: 'Dokumenter én samlet navngitt områdegeometri eller eksplisitt sammensatt canonical modell for hele anlegget.'
  }
};

function full(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(full(rel), 'utf8')); }
function writeJson(rel, value) { fs.mkdirSync(path.dirname(full(rel)), { recursive: true }); fs.writeFileSync(full(rel), `${JSON.stringify(value, null, 2)}\n`); }
function sha256(rel) { return crypto.createHash('sha256').update(fs.readFileSync(full(rel))).digest('hex'); }
function sourceText(rel) { return execFileSync('git', ['show', `${SOURCE_COMMIT}:${rel}`], { cwd: ROOT, encoding: 'utf8' }); }
function sourceJson(rel) { return JSON.parse(sourceText(rel)); }
function findRow(rows, id) { const row = rows.find((item) => item?.id === id); if (!row) throw new Error(`Missing ${id}`); return row; }
function currentCoordinate(place) { return { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote }; }

function copySourceReport() {
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', SOURCE_COMMIT, OLD_REPORT_DIR], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  for (const oldPath of paths) {
    const target = oldPath.replace(OLD_REPORT_DIR, REPORT_DIR);
    fs.mkdirSync(path.dirname(full(target)), { recursive: true });
    fs.writeFileSync(full(target), sourceText(oldPath));
  }
}

function runFinder(query) {
  const proc = spawnSync(process.execPath, ['dist/tools/address-first-coordinate-finder.mjs', '--address', query], { cwd: ROOT, encoding: 'utf8' });
  const stdout = String(proc.stdout || '').trim();
  const stderr = String(proc.stderr || '').trim();
  if (!stdout) return { ok: false, status: 'error', reason: `Ingen output${stderr ? `: ${stderr}` : ''}`, query };
  try { return JSON.parse(stdout); }
  catch { return { ok: false, status: 'error', reason: `Ugyldig JSON: ${stdout}${stderr ? ` / ${stderr}` : ''}`, query }; }
}

function runAddressLookup(id, config) {
  const queries = [...new Set([config.address, ...(config.variants || [])])];
  const attempts = [];
  let firstNonError = null;
  for (const query of queries) {
    const result = runFinder(query);
    attempts.push(result);
    if (result.ok && result.status === 'verified_candidate' && result.coordinate) {
      writeJson(`${REPORT_DIR}/geonorge-${id}.json`, result);
      writeJson(`${REPORT_DIR}/geonorge-${id}-attempts.json`, attempts);
      return result;
    }
    if (result.status !== 'error' && !firstNonError) firstNonError = result;
  }
  writeJson(`${REPORT_DIR}/geonorge-${id}-attempts.json`, attempts);
  if (firstNonError) { writeJson(`${REPORT_DIR}/geonorge-${id}.json`, firstNonError); return firstNonError; }
  throw new Error(`Geonorge remained technically unavailable for ${id}; refusing fallback. ${attempts.map((a) => `${a.query}: ${a.reason}`).join(' | ')}`);
}

function applyOfficialAddress(place, result) {
  Object.assign(place, result.coordinate);
  place.coordSourceId = result.sourceObjectId;
  place.coordSourceUrl = result.sourceUrl;
  place.coordVerifiedAt = DATE;
}

function officialEvidence(existing, place, result, config) {
  const secondary = (existing.evidence || []).filter((e) => e?.sourceProvider === 'osm').map((e) => ({ ...e, sourceQuality: 'secondary_geometry_qa', canVerifyCoordinate: false, reason: 'Sekundær geometri-QA; Geonorge er primær koordinatkilde for den konkrete adressebare arenaen.' }));
  return {
    ...existing,
    schemaVersion: existing.schemaVersion || '1.0',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: currentCoordinate(place),
    requiredEvidence: ['entydig offisielt adressepunkt', 'dokumentert at adressen representerer den konkrete canonical arenaen'],
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: result.sourceUrl, sourceObjectId: result.sourceObjectId, sourceQuality: 'official_address_plus_documented_identity', finding: `${result.reason} ${config.basis}`, canVerifyCoordinate: true, reason: result.coordinate.coordNote },
      { sourceProvider: 'official_site', sourceName: config.officialName, sourceUrl: config.officialUrl, sourceObjectId: `official-site:${place.id}:address`, sourceQuality: 'official_venue_address_identity', finding: config.basis, canVerifyCoordinate: false, reason: 'Primærkilden dokumenterer arenaidentitet og besøksadresse; Geonorge dokumenterer koordinatpunktet.' },
      ...secondary
    ],
    addressCandidates: [{ address: config.address, sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: 'display_marker', sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt, arenaidentitet og address-first-anker er anvendt på canonical place.' },
    notes: [result.coordinate.coordNote, config.basis, 'Batch 121 address-first: eksakt OSM-geometri beholdes bare som sekundær QA når Geonorge gir ett entydig relevant adressepunkt.']
  };
}

function fallbackEvidence(existing, place, result, config, hasExactFallback) {
  const reason = `Geonorge address-first ble forsøkt for ${config.address}, men ga ${result.status}: ${result.reason}`;
  place.coordNote = hasExactFallback
    ? `${reason}. Den tidligere kontrollerte eksakte navngitte sportsgeometrien beholdes som dokumentert fallback; ingen nearest/first-hit-logikk brukes.`
    : `${reason}. Ingen separat eksakt canonical arena-geometri er godkjent, så recorden forblir uten godkjent koordinatkilde.`;
  return {
    ...existing,
    evidenceStatus: hasExactFallback ? 'applied_to_place' : 'needs_research',
    coordinateDecision: hasExactFallback ? 'do_not_change_coordinates_yet' : 'needs_geometry',
    currentCoordinate: currentCoordinate(place),
    requiredEvidence: hasExactFallback
      ? ['Geonorge forsøkt først for dokumentert besøksadresse', 'ett eksakt navngitt fysisk sportsobjekt som fallback']
      : ['ett entydig anvendbart Geonorge-adressepunkt eller eksakt canonical arenaobjekt'],
    evidence: [
      { sourceProvider: 'official_address', sourceName: 'geonorge_adresser_v1', sourceUrl: result.sourceUrl || '', sourceObjectId: result.sourceObjectId || `geonorge-address-attempt:${place.id}`, sourceQuality: 'address_first_attempt_not_applicable', finding: `${reason}. ${config.basis}`, canVerifyCoordinate: false, reason: result.reason },
      { sourceProvider: 'official_site', sourceName: config.officialName, sourceUrl: config.officialUrl, sourceObjectId: `official-site:${place.id}:address`, sourceQuality: 'official_venue_address_identity', finding: config.basis, canVerifyCoordinate: false, reason: 'Dokumenterer arenaidentitet og besøksadresse.' },
      ...(existing.evidence || []).filter((e) => e?.sourceProvider === 'osm')
    ],
    addressCandidates: [{ address: config.address, sourceProvider: 'official_address', sourceObjectId: result.sourceObjectId || `geonorge-address-attempt:${place.id}`, canApplyToPlace: false, reason: result.reason }],
    decision: hasExactFallback
      ? { canBecomeVerified: true, blockedReason: '', nextAction: 'Address-first er dokumentert; eksakt navngitt sportsgeometri beholdes som fallback.' }
      : { canBecomeVerified: false, blockedReason: result.reason, nextAction: 'Avklar ett entydig offisielt adressepunkt eller separat eksakt arenaobjekt uten proxy-gjetting.' },
    notes: [reason, config.basis, place.coordNote]
  };
}

execFileSync('npm', ['run', 'build:tools'], { cwd: ROOT, stdio: 'inherit' });
copySourceReport();

const aggregate = readJson(AGGREGATE);
const index = readJson(INDEX);
const manifest = readJson(MANIFEST);
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
const outcomes = {};

for (const [id, config] of Object.entries(ADDRESSABLE)) {
  const sourcePlace = sourceJson(`${CHILD_DIR}/${id}.json`);
  const sourceEvidence = sourceJson(`data/coordinate-evidence/oslo/sport/${id}.json`);
  const hasExactFallback = sourcePlace.coordStatus === 'verified_geometry' && sourcePlace.sourceProvider === 'osm' && Boolean(sourcePlace.sourceObjectId);
  const place = structuredClone(sourcePlace);
  const result = runAddressLookup(id, config);

  if (result.ok && result.status === 'verified_candidate' && result.coordinate) {
    applyOfficialAddress(place, result);
    writeJson(`data/coordinate-evidence/oslo/sport/${id}.json`, officialEvidence(sourceEvidence, place, result, config));
    outcomes[id] = { status: 'verified', method: 'official_address', sourceObjectId: place.sourceObjectId, address: config.address };
  } else if (hasExactFallback) {
    writeJson(`data/coordinate-evidence/oslo/sport/${id}.json`, fallbackEvidence(sourceEvidence, place, result, config, true));
    outcomes[id] = { status: 'verified_geometry', method: 'osm_fallback_after_address_first', sourceObjectId: place.sourceObjectId, address: config.address, lookupStatus: result.status, lookupReason: result.reason };
  } else {
    writeJson(`data/coordinate-evidence/oslo/sport/${id}.json`, fallbackEvidence(sourceEvidence, place, result, config, false));
    outcomes[id] = { status: 'needs_review', method: 'needs_review_after_address_first', sourceObjectId: null, address: config.address, lookupStatus: result.status, lookupReason: result.reason };
  }

  const aggregateIndex = aggregate.findIndex((item) => item?.id === id);
  if (aggregateIndex < 0) throw new Error(`Missing aggregate row ${id}`);
  aggregate[aggregateIndex] = place;
  writeJson(`${CHILD_DIR}/${id}.json`, place);
  const indexRow = findRow(index, id);
  for (const field of COORD_FIELDS) indexRow[field] = place[field] ?? null;
}

for (const [id, expectedSource] of Object.entries(BROAD_VERIFIED)) {
  const place = sourceJson(`${CHILD_DIR}/${id}.json`);
  if (place.coordStatus !== 'verified_geometry' || place.sourceObjectId !== expectedSource) throw new Error(`Unexpected broad geometry baseline for ${id}`);
  const aggregateIndex = aggregate.findIndex((item) => item?.id === id);
  aggregate[aggregateIndex] = place;
  writeJson(`${CHILD_DIR}/${id}.json`, place);
  writeJson(`data/coordinate-evidence/oslo/sport/${id}.json`, sourceJson(`data/coordinate-evidence/oslo/sport/${id}.json`));
  const indexRow = findRow(index, id);
  for (const field of COORD_FIELDS) indexRow[field] = place[field] ?? null;
  outcomes[id] = { status: 'verified_geometry', method: 'broad_named_geometry', sourceObjectId: place.sourceObjectId };
}

for (const id of Object.keys(BROAD_NEEDS_REVIEW)) {
  const place = sourceJson(`${CHILD_DIR}/${id}.json`);
  const aggregateIndex = aggregate.findIndex((item) => item?.id === id);
  aggregate[aggregateIndex] = place;
  writeJson(`${CHILD_DIR}/${id}.json`, place);
  writeJson(`data/coordinate-evidence/oslo/sport/${id}.json`, sourceJson(`data/coordinate-evidence/oslo/sport/${id}.json`));
  const indexRow = findRow(index, id);
  for (const field of COORD_FIELDS) indexRow[field] = place[field] ?? null;
  outcomes[id] = { status: 'needs_review', method: 'broad_area_needs_review', sourceObjectId: null };
}

const allIds = [...Object.keys(ADDRESSABLE), ...Object.keys(BROAD_VERIFIED), ...Object.keys(BROAD_NEEDS_REVIEW)];
for (const id of allIds) {
  const entry = `oslo/sport/${id}.json`;
  if (!evidenceManifest.files.includes(entry)) evidenceManifest.files.push(entry);
}
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);
writeJson(AGGREGATE, aggregate);
writeJson(INDEX, index);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) if (allIds.includes(row.id)) row.sha256 = sha256(`data/places/sport/europa/norway/${row.file}`);
writeJson(MANIFEST, manifest);

const verifiedIds = allIds.filter((id) => outcomes[id].status !== 'needs_review');
const needsReviewIds = allIds.filter((id) => outcomes[id].status === 'needs_review');
const sourceResults = readJson(`${REPORT_DIR}/results.json`);
sourceResults.batch = BATCH;
sourceResults.originalOsmFirstResults = sourceResults.after;
sourceResults.addressFirstCorrectionAt = new Date().toISOString();
sourceResults.method = 'object-type first: concrete stadiums/arenas/halls use Geonorge address-first; exact named sports geometry only as documented fallback after a non-error unresolved address lookup; broad complexes use aggregate geometry; no nearest/first-hit';
sourceResults.addressFirstResults = outcomes;
sourceResults.verified = verifiedIds;
sourceResults.needsReview = needsReviewIds;
sourceResults.after = {};
for (const id of allIds) {
  const place = findRow(aggregate, id);
  sourceResults.after[id] = { lat: place.lat, lon: place.lon, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, sourceObjectId: place.sourceObjectId || place.coordSourceId || null };
}
writeJson(`${REPORT_DIR}/results.json`, sourceResults);

let readme = fs.readFileSync(full(`${REPORT_DIR}/README.md`), 'utf8').replaceAll('batch 120', 'batch 121').replaceAll('Batch 120', 'Batch 121').trimEnd();
readme += `\n\n## Address-first correction\n\nDen opprinnelige sportskontrollen gikk direkte til OSM for konkrete stadioner, arenaer og haller. Batch 121 er bygget om etter den låste objekt-type-først-metoden: de 11 konkrete arenaidentitetene kjøres gjennom Geonorge først med besøksadresse dokumentert av offisiell arena-, klubb- eller kommunekilde. Tekniske Geonorge-feil blokkerer og kan ikke legitimere fallback. Holmenkollen nasjonalanlegg og Ekebergsletta beholdes som brede områdegeometrier. Dælenenga idrettspark og Nordre Åsen idrettspark forblir needs_review uten en godkjent samlet områdegeometri.\n\n- Verifiserte/kildekontrollerte: ${verifiedIds.join(', ')}\n- Needs review: ${needsReviewIds.join(', ')}`;
fs.writeFileSync(full(`${REPORT_DIR}/README.md`), `${readme.trimEnd()}\n`);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const osloIndex = lines.findIndex((line) => line === '## Oslo');
const vestlandIndex0 = lines.findIndex((line, i) => i > osloIndex && line.startsWith('## Vestland'));
const osloEnd = vestlandIndex0 > osloIndex ? vestlandIndex0 : lines.length;
const summaryIndex = lines.findIndex((line, i) => i > osloIndex && i < osloEnd && line.startsWith('Oslo-tabellen inneholder nå '));
const nextWorkIndex = lines.findIndex((line, i) => i > osloIndex && i < osloEnd && line.startsWith('- Neste nye Oslo-kontroll er batch '));
const queueSourceIndex = lines.findIndex((line, i) => i > osloIndex && i < osloEnd && line.includes('Neste aktive manifestkilde er `places/sport/europa/norway/oslo_sport.json`'));
if (summaryIndex < 0 || nextWorkIndex < 0 || queueSourceIndex < 0) throw new Error('Could not resolve Oslo protocol queue structure');
const pointer = Number(lines[nextWorkIndex].match(/batch (\d+)/)?.[1]);
if (pointer !== BATCH) throw new Error(`Expected next batch ${BATCH}, found ${pointer}`);

for (const id of allIds) {
  const token = `${BT}${id}${BT}`;
  if (lines.slice(osloIndex, osloEnd).some((line) => line.includes(token) && (line.startsWith('| ') || line.includes('needs_review')))) throw new Error(`Protocol already contains ${id}`);
}

const numericRows = [];
for (let i = osloIndex; i < osloEnd; i += 1) {
  const m = lines[i].match(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/);
  if (m) numericRows.push({ index: i, batch: Number(m[1]) });
}
if (numericRows.some((r) => r.batch === BATCH)) throw new Error(`Batch ${BATCH} already exists`);
const lastNumericIndex = Math.max(...numericRows.map((r) => r.index));
const verifiedRows = verifiedIds.map((id) => {
  const place = findRow(aggregate, id);
  return `| ${BATCH} | ${BT}${id}${BT} | ${place.name} | ${place.coordStatus} | ${BT}${place.sourceObjectId || place.coordSourceId}${BT} |`;
});
lines.splice(lastNumericIndex + 1, 0, ...verifiedRows);

const refreshedVestland = lines.findIndex((line, i) => i > osloIndex && line.startsWith('## Vestland'));
const needsHeadingIndex = lines.findIndex((line, i) => i > osloIndex && i < refreshedVestland && line === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
const needsHeaderIndex = lines.findIndex((line, i) => i > needsHeadingIndex && i < refreshedVestland && line.startsWith('| kandidat | status |'));
let needsEnd = needsHeaderIndex + 2;
while (needsEnd < lines.length && lines[needsEnd].startsWith('| ')) needsEnd += 1;
const needsRows = needsReviewIds.map((id) => {
  if (BROAD_NEEDS_REVIEW[id]) {
    const n = BROAD_NEEDS_REVIEW[id];
    return `| ${BT}${id}${BT} – ${n.name} | needs_review | ${n.conflict} | ${n.followup} |`;
  }
  const outcome = outcomes[id];
  const place = findRow(aggregate, id);
  return `| ${BT}${id}${BT} – ${place.name} | needs_review | Address-first-kontrollen ga ikke et entydig anvendbart Geonorge-punkt, og ingen separat eksakt canonical arena-geometri er godkjent. | Avklar offisiell adresse/geometri uten proxy-gjetting. |`;
});
lines.splice(needsEnd, 0, ...needsRows);

const controlledBefore = Number(lines[summaryIndex].match(/Oslo-tabellen inneholder nå (\d+)/)?.[1]);
if (!Number.isFinite(controlledBefore)) throw new Error('Could not parse controlled total');
const controlledAfter = controlledBefore + allIds.length;
lines[summaryIndex] = `Oslo-tabellen inneholder nå ${controlledAfter} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${BATCH} fullfører ${BT}places/sport/europa/norway/oslo_sport.json${BT} etter objekt-type-først/address-first-metoden; ${verifiedIds.length} steder er verifisert eller kildekontrollert, mens ${needsReviewIds.length} avsluttes som needs_review uten proxy-gjetting.`;

const finalNeedsHeader = lines.findIndex((line, i) => i > osloIndex && line.startsWith('| kandidat | status |'));
const finalNeedsIds = new Set();
for (let i = finalNeedsHeader + 2; i < lines.length && lines[i].startsWith('| '); i += 1) {
  const m = lines[i].match(/`([^`]+)`/); if (m) finalNeedsIds.add(m[1]);
}
const notCountedIndex = lines.findIndex((line, i) => i > needsHeadingIndex && line.startsWith('Disse kontrollene er fullført, men teller ikke blant de '));
if (notCountedIndex < 0) throw new Error('Missing needs_review count sentence');
lines[notCountedIndex] = `Disse kontrollene er fullført, men teller ikke blant de ${controlledAfter - finalNeedsIds.size} verifiserte eller kildekontrollerte canonical Oslo-stedene.`;
lines[nextWorkIndex] = `- Neste nye Oslo-kontroll er batch ${BATCH + 1}.`;
lines[queueSourceIndex] = '- `places/sport/europa/norway/oslo_sport.json` er nå fullt kontrollert i manifestrekkefølge. Neste aktive manifestkilde er `places/sport/europa/norway/places_oslo_lekeplasser_trening.json`; tidligere kontrollerte placeId-er skal hoppes over.';

const addressPrimary = verifiedIds.filter((id) => outcomes[id].method === 'official_address');
const geometryFallback = verifiedIds.filter((id) => outcomes[id].method === 'osm_fallback_after_address_first');
const narrative = `Batch ${BATCH} (2026-07-21) fullfører Oslo-sport-manifestet etter objekt-type-først/address-first-metoden. Konkrete stadioner, arenaer og haller kjøres mot dokumentert besøksadresse i Geonorge før eventuell geometri-fallback. Geonorge er primærkilde for ${addressPrimary.map((id) => `${BT}${id}${BT}`).join(', ') || 'ingen av de konkrete arenaene'}.${geometryFallback.length ? ` ${geometryFallback.map((id) => `${BT}${id}${BT}`).join(', ')} beholder eksakt navngitt OSM-geometri først etter dokumentert ikke-feilende Geonorge-forsøk uten anvendbart entydig treff.` : ''} ${BT}holmenkollen_nasjonalanlegg${BT} og ${BT}ekebergsletta${BT} bruker legitime brede områdegeometrier. ${needsReviewIds.map((id) => `${BT}${id}${BT}`).join(', ')} forblir needs_review uten proxy-gjetting. Tekniske Geonorge-feil kan ikke legitimere fallback, og ingen nearest/first-hit-logikk brukes.`;
const vestlandIndex = lines.findIndex((line) => line.startsWith('## Vestland'));
lines.splice(vestlandIndex, 0, '', narrative, '');
fs.writeFileSync(full(PROTOCOL), lines.join('\n'));

writeJson(`${REPORT_DIR}/address-first-results.json`, { batch: BATCH, generatedAt: new Date().toISOString(), outcomes, verifiedIds, needsReviewIds, nextBatch: BATCH + 1, nextSource: 'places/sport/europa/norway/places_oslo_lekeplasser_trening.json' });
console.log(JSON.stringify({ ok: true, batch: BATCH, verifiedIds, needsReviewIds, outcomes }, null, 2));
