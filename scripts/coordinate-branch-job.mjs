import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_roykenvika.json';
const aggregateRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/bygdoy_roykenvika.json';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .trim();

const variants = [
  'Røykensvika',
  'Røykensvik',
  'Røykenvika',
  'Røykenvik',
  'Røykensviken',
  'Røykensviga',
  'Røikensvika',
  'Røkensvika',
];
const normalizedVariants = new Set(variants.map(normalize));
const containsExactVariant = (value) => normalizedVariants.has(normalize(value));
const containsVariant = (value) => {
  const text = normalize(value);
  return [...normalizedVariants].some((variant) => text.includes(variant));
};
const containsBygdoy = (value) => {
  const text = normalize(value);
  return text.includes(normalize('Bygdøy')) || text.includes('bygdoy');
};
const inBygdoyBounds = (lat, lon) => Number.isFinite(lat) && Number.isFinite(lon) &&
  lat >= 59.87 && lat <= 59.94 && lon >= 10.62 && lon <= 10.75;

const protocol = await readText('docs/coordinates/coordinate-control-protocol.md');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 already exists; rerun from the new protocol state.');

const exhaustionAudit = await readJson('reports/oslo-coordinate-research-exhaustion-audit-post-195/summary.json');
assert(exhaustionAudit.nextCandidate?.placeId === 'bygdoy_roykenvika', 'Røykensvika is no longer the audited next candidate.');

const placeBeforeText = await readText(placeRel);
const aggregateBeforeText = await readText(aggregateRel);
const evidenceBeforeText = await readText(evidenceRel);
const place = JSON.parse(placeBeforeText);
const evidence = JSON.parse(evidenceBeforeText);
assert(place.id === 'bygdoy_roykenvika', 'Split place record has the wrong placeId.');
assert(place.coordStatus === 'needs_source', 'Røykensvika is no longer needs_source.');
assert(evidence.identity?.identityStatus === 'unresolved', 'Røykensvika identity is no longer unresolved.');

const previousSummary = await readJson(`${reportRel}/summary.json`);
assert(previousSummary.placeId === 'bygdoy_roykenvika', 'Previous research summary has the wrong placeId.');
assert(previousSummary.canonicalChanged === false, 'Previous research unexpectedly changed canonical data.');
assert(previousSummary.authoritativeAvailability?.kartverketSuccessfulQueries === 16, 'Kartverket source family is incomplete.');
assert(previousSummary.authoritativeAvailability?.mediaWikiSuccessfulQueries === 6, 'Reference source family is incomplete.');
assert(previousSummary.authoritativeAvailability?.nationalLibrarySuccessfulQueries === 5, 'National Library source family is incomplete.');
assert(previousSummary.authoritativeAvailability?.osloMunicipalitySuccessfulQueries === 3, 'Oslo municipality source family is incomplete.');

const files = await fs.readdir(reportDir);
const parseJsonFiles = async (prefix) => {
  const selected = files.filter((file) => file.startsWith(prefix) && file.endsWith('.json')).sort();
  const output = [];
  for (const file of selected) {
    const text = await fs.readFile(path.join(reportDir, file), 'utf8');
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    output.push({ file, json, sha256: sha256(text) });
  }
  return output;
};

const kartverketFiles = await parseJsonFiles('kartverket-stedsnavn-');
const kartverketCandidates = kartverketFiles.flatMap(({ file, json }) =>
  (Array.isArray(json?.navn) ? json.navn : []).map((candidate) => ({ file, candidate })));
const kartverketExactCandidates = kartverketCandidates.filter(({ candidate }) => containsExactVariant(candidate.skrivemåte));
const kartverketOsloCandidates = kartverketExactCandidates.filter(({ candidate }) =>
  (candidate.kommuner ?? []).some((municipality) =>
    municipality.kommunenummer === '0301' || normalize(municipality.kommunenavn) === 'oslo'));
const kartverketBygdoyHits = kartverketOsloCandidates.filter(({ candidate }) =>
  inBygdoyBounds(Number(candidate.representasjonspunkt?.nord), Number(candidate.representasjonspunkt?.øst)));

const mediaWikiFiles = [
  ...(await parseJsonFiles('oslo-byleksikon-search-')),
  ...(await parseJsonFiles('lokalhistoriewiki-search-')),
];
const mediaWikiRows = mediaWikiFiles.flatMap(({ file, json }) =>
  (Array.isArray(json?.query?.search) ? json.query.search : []).map((row) => ({ file, row })));
const mediaWikiBygdoyHits = mediaWikiRows.filter(({ row }) => {
  const text = `${row.title ?? ''} ${row.snippet ?? ''}`;
  return containsVariant(text) && containsBygdoy(text);
});

const nationalLibraryFiles = await parseJsonFiles('nasjonalbiblioteket-');
const nationalLibraryItems = nationalLibraryFiles.flatMap(({ file, json }) =>
  (Array.isArray(json?._embedded?.items) ? json._embedded.items : []).map((item) => ({ file, item })));
const nationalLibraryBygdoyHits = nationalLibraryItems.filter(({ item }) => {
  const metadataText = JSON.stringify(item?.metadata ?? {});
  return containsVariant(metadataText) && containsBygdoy(metadataText);
});

const wikidataFiles = await parseJsonFiles('wikidata-search-');
const wikidataRows = wikidataFiles.flatMap(({ file, json }) =>
  (Array.isArray(json?.search) ? json.search : []).map((row) => ({ file, row })));
const wikidataBygdoyHits = wikidataRows.filter(({ row }) => {
  const text = `${row.label ?? ''} ${row.description ?? ''} ${row.match?.text ?? ''}`;
  return containsVariant(text) && containsBygdoy(text);
});

const nominatimFiles = await parseJsonFiles('nominatim-search-');
const nominatimRows = nominatimFiles.flatMap(({ file, json }) =>
  (Array.isArray(json) ? json : []).map((row) => ({ file, row })));
const nominatimBygdoyHits = nominatimRows.filter(({ row }) =>
  containsVariant(row.display_name ?? row.name ?? '') &&
  containsBygdoy(JSON.stringify(row)) &&
  inBygdoyBounds(Number(row.lat), Number(row.lon)));

const overpass = await readJson(`${reportRel}/overpass-bygdoy-name-variants.json`);
const overpassHits = (Array.isArray(overpass?.elements) ? overpass.elements : []).filter((element) => {
  const name = element.tags?.name ?? element.tags?.alt_name ?? element.tags?.old_name ?? '';
  const lat = Number(element.lat ?? element.center?.lat);
  const lon = Number(element.lon ?? element.center?.lon);
  return containsVariant(name) && inBygdoyBounds(lat, lon);
});

const strongIdentitySignals = [
  ...kartverketBygdoyHits.map((hit) => ({ source: 'Kartverket stedsnavn', hit })),
  ...mediaWikiBygdoyHits.map((hit) => ({ source: hit.file.startsWith('oslo-byleksikon') ? 'Oslo Byleksikon' : 'Lokalhistoriewiki', hit })),
  ...nationalLibraryBygdoyHits.map((hit) => ({ source: 'Nasjonalbiblioteket metadata', hit })),
];

assert(strongIdentitySignals.length === 0,
  'A source-backed Bygdøy identity candidate now exists and must be reviewed instead of recommending retirement.');

const reverseContext = await readJson(`${reportRel}/nominatim-reverse-current-legacy-marker.json`);
const decision = 'identity_unsubstantiated_recommend_retirement';
const recommendation = 'Do not select or verify a coordinate. Retire the active place marker and its synthetic place content unless a new independent credible source documents a local Bygdøy identity named Røykensvika/Røykensvik.';

const correctedCandidateGroups = {
  kartverket: {
    rawCandidateCount: kartverketCandidates.length,
    exactVariantCandidateCount: kartverketExactCandidates.length,
    exactOsloCandidateCount: kartverketOsloCandidates.length,
    exactBygdoyCandidateCount: kartverketBygdoyHits.length,
    exactCandidatesOutsideOslo: kartverketExactCandidates
      .filter(({ candidate }) => !(candidate.kommuner ?? []).some((municipality) => municipality.kommunenummer === '0301'))
      .slice(0, 100),
  },
  mediaWiki: {
    resultCount: mediaWikiRows.length,
    bygdoyIdentityHits: mediaWikiBygdoyHits,
  },
  nationalLibrary: {
    resultCount: nationalLibraryItems.length,
    note: 'Catalogue query hits are not treated as identity evidence unless the returned item metadata itself contains both the name variant and Bygdøy context.',
    bygdoyMetadataHits: nationalLibraryBygdoyHits,
  },
  contextualOnly: {
    wikidataBygdoyHits,
    nominatimBygdoyHits,
    overpassHits,
    currentLegacyMarkerReverse: reverseContext,
  },
};

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId: place.id,
  researchOnly: true,
  canonicalChanged: false,
  sourceAudit: 'reports/oslo-coordinate-research-exhaustion-audit-post-195/summary.json',
  correction: {
    reason: 'The first pass incorrectly treated every response from a URL carrying kommunenummer=0301 as an Oslo hit even though the API returned nationwide fuzzy results. This pass post-filters each named object by explicit municipality and Bygdøy bounds.',
    nationwideFuzzyResultsAreNotOsloEvidence: true,
    nationalLibraryQueryResultsRequireMetadataContext: true,
  },
  hardGates: {
    queueHeadIsRoykenvika: true,
    identityWasUnresolved: true,
    coordinateWasNeedsSource: true,
    noBatch196: true,
    canonicalFilesByteStable: true,
  },
  variants,
  authoritativeAvailability: previousSummary.authoritativeAvailability,
  matchCounts: {
    kartverketRawCandidates: kartverketCandidates.length,
    kartverketExactVariantCandidates: kartverketExactCandidates.length,
    kartverketExactOsloCandidates: kartverketOsloCandidates.length,
    kartverketExactBygdoyHits: kartverketBygdoyHits.length,
    mediaWikiRows: mediaWikiRows.length,
    mediaWikiBygdoyHits: mediaWikiBygdoyHits.length,
    nationalLibraryItems: nationalLibraryItems.length,
    nationalLibraryBygdoyMetadataHits: nationalLibraryBygdoyHits.length,
    wikidataBygdoyHits: wikidataBygdoyHits.length,
    nominatimBygdoyHits: nominatimBygdoyHits.length,
    overpassBygdoyHits: overpassHits.length,
  },
  strongIdentitySignals,
  correctedCandidateGroups,
  decision,
  recommendation,
  sourceHashesBefore: {
    splitPlace: sha256(placeBeforeText),
    aggregate: sha256(aggregateBeforeText),
    evidence: sha256(evidenceBeforeText),
  },
  preservedCaptures: previousSummary.captures,
};

await fs.writeFile(path.join(reportDir, 'candidate-groups.json'), `${JSON.stringify(correctedCandidateGroups, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Bygdøy Røykensvika identity research after batch 195\n\n- Place: **\`${place.id}\` — ${place.name}**\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical data changed: **no**\n- Decision: **\`${decision}\`**\n- Kartverket exact Oslo candidates: **${kartverketOsloCandidates.length}**\n- Kartverket exact Bygdøy candidates: **${kartverketBygdoyHits.length}**\n- Oslo Byleksikon/Lokalhistoriewiki Bygdøy hits: **${mediaWikiBygdoyHits.length}**\n- National Library metadata hits tying the name to Bygdøy: **${nationalLibraryBygdoyHits.length}**\n\nThe original pass was corrected because Kartverket returned nationwide fuzzy results even when the request URL carried an Oslo municipality parameter. Every candidate is now post-filtered by its explicit municipality and, for Bygdøy, by geographic bounds. National Library catalogue query hits are contextual only unless the returned metadata itself contains both the name and Bygdøy.\n\n${recommendation}\n`, 'utf8');

assert(await readText(placeRel) === placeBeforeText, 'Research-only correction changed the split place record.');
assert(await readText(aggregateRel) === aggregateBeforeText, 'Research-only correction changed the aggregate place source.');
assert(await readText(evidenceRel) === evidenceBeforeText, 'Research-only correction changed coordinate evidence.');

console.log(JSON.stringify({
  status: 'research_corrected',
  reportDir: reportRel,
  placeId: place.id,
  decision,
  kartverketExactOsloCandidates: kartverketOsloCandidates.length,
  kartverketExactBygdoyHits: kartverketBygdoyHits.length,
  mediaWikiBygdoyHits: mediaWikiBygdoyHits.length,
  nationalLibraryBygdoyMetadataHits: nationalLibraryBygdoyHits.length,
  canonicalChanged: false,
}, null, 2));
