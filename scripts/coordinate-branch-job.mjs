#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const originalRunnerUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/3ef450b11fa53ad7b7e0ef77fb0ce111889f302d/scripts/coordinate-branch-job.mjs';
const response = await fetch(originalRunnerUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch original batch-176 runner: ${response.status} ${response.statusText}`);
const source = await response.text();
const tempScript = path.join('/tmp', `history-go-batch-176-original-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);

const aggregateFile = 'data/places/natur/oslo/places_oslo_alna.json';
const childFile = 'data/places/natur/oslo/places_oslo_alna/hellerud_gard.json';
const indexFile = 'data/places/natur/oslo/places_oslo_alna_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_alna_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/hellerud_gard.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const resultFile = 'reports/oslo-coordinate-control-batch-176-nedre-hellerud-production/batch-176-result.json';
const primarySourceObjectId = 'history-go-research:nedre-hellerud-cadastral:143-3';
const addressSourceObjectId = 'geonorge-adresser-v1:0301:20892:7';
const researchUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/bc778b5dc7e2cd9fd03927246e052a6b711c16be/reports/oslo-coordinate-control-batch-168-nedre-hellerud-cadastral-research/cadastral-summary.json';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');

const applyHistoricalContract = (place) => {
  place.sourceProvider = 'manual_research';
  place.sourceObjectId = primarySourceObjectId;
  place.geocodeAccuracy = 'semantic_anchor';
  place.coordRole = 'historical_anchor';
  place.coordType = 'cadastral_site_anchor';
  place.coordStatus = 'verified_historical_source';
  place.coordSource = 'Pinned Nedre Hellerud cadastral identity research + exact Geonorge Hellerud gårdsvei 7 match for gnr. 143 / bnr. 3';
  place.coordSourceId = primarySourceObjectId;
  place.coordSourceUrl = researchUrl;
  place.coordNote = 'Batch 176 historical-site resolution: pinned research resolves the intended identity as Nedre Hellerud and the historical cadastral site as gnr. 143 / bnr. 3. Current Geonorge address Hellerud gårdsvei 7 matches that cadastral identity exactly and supplies the site anchor coordinate. Because this is a historical place, the canonical trust is manual_research / verified_historical_source / historical_anchor rather than treating the modern address as the sole historical proof. The marker anchors the historical cadastral farm site and does not claim that the present building is the original eighteenth-century farmhouse. Haugerudtunet 1, Tvetenveien 157 and the legacy point remain rejected proxies.';
  return place;
};

const aggregate = readJson(aggregateFile);
const aggregateRow = aggregate.find((row) => row?.id === 'hellerud_gard');
if (!aggregateRow) throw new Error('hellerud_gard missing from aggregate after original batch-176 runner');
applyHistoricalContract(aggregateRow);
writeJson(aggregateFile, aggregate);

const child = applyHistoricalContract(readJson(childFile));
writeJson(childFile, child);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === 'hellerud_gard');
if (!indexRow) throw new Error('hellerud_gard missing from split index after original batch-176 runner');
for (const key of ['sourceProvider', 'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource', 'coordSourceId', 'coordSourceUrl', 'coordNote']) indexRow[key] = child[key];
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === 'hellerud_gard');
if (!manifestRow) throw new Error('hellerud_gard missing from split manifest after original batch-176 runner');
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = child.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

const evidence = readJson(evidenceFile);
evidence.currentCoordinate = {
  lat: child.lat,
  lon: child.lon,
  r: child.r,
  coordStatus: child.coordStatus,
  coordSource: child.coordSource,
  coordType: child.coordType,
  coordNote: child.coordNote,
};
if (evidence.identity) evidence.identity.locatorTypeCandidate = 'historic_site';
const officialAddressEvidence = (evidence.evidence || []).find((row) => row?.sourceProvider === 'official_address');
if (officialAddressEvidence) {
  officialAddressEvidence.sourceObjectId = addressSourceObjectId;
  officialAddressEvidence.canVerifyCoordinate = false;
  officialAddressEvidence.reason = 'Supplies the exact current coordinate and cadastral match, but historical-site trust requires the independently resolved historical identity as the primary source.';
}
const historicalEvidence = (evidence.evidence || []).find((row) => row?.sourceObjectId === 'history-go-research:nedre-hellerud-cadastral:bc778b5d');
if (!historicalEvidence) throw new Error('Pinned Nedre Hellerud research evidence missing after original runner');
historicalEvidence.sourceObjectId = primarySourceObjectId;
historicalEvidence.canVerifyCoordinate = true;
historicalEvidence.reason = 'Primary historical identity source; combined with the exact official address/cadastral match, it verifies the historical cadastral site anchor.';
evidence.sourceObjectCandidates = [
  { sourceProvider: 'manual_research', sourceObjectId: primarySourceObjectId, canApplyToPlace: true },
  { sourceProvider: 'official_address', sourceObjectId: addressSourceObjectId, canApplyToPlace: false },
  { sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:hellerud-nordre', canApplyToPlace: false },
];
evidence.coordinateCandidates = [{
  sourceProvider: 'manual_research',
  sourceObjectId: primarySourceObjectId,
  supportingAddressSourceObjectId: addressSourceObjectId,
  lat: child.lat,
  lon: child.lon,
  coordRole: 'historical_anchor',
  canApplyToPlace: true,
}];
evidence.decision = {
  canBecomeVerified: true,
  blockedReason: '',
  nextAction: 'Nedre Hellerud is verified as a historical cadastral site anchor using pinned historical identity research supported by the exact Geonorge gnr. 143 / bnr. 3 address match.',
};
evidence.notes = [child.coordNote];
writeJson(evidenceFile, evidence);

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
const oldRow = '| 176 | `hellerud_gard` | Nedre Hellerud – historisk gårdssted | verified | `geonorge-adresser-v1:0301:20892:7` |';
const newRow = '| 176 | `hellerud_gard` | Nedre Hellerud – historisk gårdssted | verified_historical_source | `history-go-research:nedre-hellerud-cadastral:143-3` |';
if (!protocol.includes(oldRow)) throw new Error('Expected original batch-176 protocol row not found for historical-contract correction');
protocol = protocol.replace(oldRow, newRow);
fs.writeFileSync(abs(protocolFile), protocol);

const result = readJson(resultFile);
result.status = 'verified_historical_source';
result.sourceProvider = 'manual_research';
result.sourceObjectId = primarySourceObjectId;
result.supportingAddressSourceObjectId = addressSourceObjectId;
result.coordinate = { ...result.coordinate, coordRole: 'historical_anchor', coordType: 'cadastral_site_anchor' };
result.originalBuildingClaimed = false;
writeJson(resultFile, result);

console.log(JSON.stringify({
  batch: 176,
  placeId: 'hellerud_gard',
  coordStatus: child.coordStatus,
  sourceProvider: child.sourceProvider,
  sourceObjectId: child.sourceObjectId,
  supportingAddressSourceObjectId: addressSourceObjectId,
  geocodeAccuracy: child.geocodeAccuracy,
  coordRole: child.coordRole,
  originalBuildingClaimed: false,
}, null, 2));
