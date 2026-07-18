import fs from 'node:fs';

const toolPath = 'tools/coordinate-source-contract.mts';
const testPath = 'tests/coordinate-source-contract-anchor-trust.test.mjs';
const docPath = 'docs/coordinates/coordinate-source-contract-v1.md';

let tool = fs.readFileSync(toolPath, 'utf8');
const oldBlock = `  const verifiedGeometrySemanticAnchor = status === 'verified_geometry'
    && accuracy === 'semantic_anchor'
    && hasGeometryOrAnchors(place)
    && ['line_anchor', 'area_anchor'].includes(String(place?.coordRole ?? ''));
  const verifiedHistoricalApproximation = status === 'verified_historical_source'
    && accuracy === 'historical_approximation'
    && ['historical_map', 'manual_research'].includes(sourceProvider)
    && String(place?.coordRole ?? '') === 'historical_anchor';
  const acceptedLowAccuracy = verifiedGeometrySemanticAnchor || verifiedHistoricalApproximation;`;
const newBlock = `  const verifiedGeometrySemanticAnchor = status === 'verified_geometry'
    && accuracy === 'semantic_anchor'
    && hasGeometryOrAnchors(place)
    && ['line_anchor', 'area_anchor'].includes(String(place?.coordRole ?? ''));
  const verifiedHistoricalApproximation = status === 'verified_historical_source'
    && accuracy === 'historical_approximation'
    && ['historical_map', 'manual_research'].includes(sourceProvider)
    && String(place?.coordRole ?? '') === 'historical_anchor';
  const verifiedHistoricalSemanticAnchor = status === 'verified_historical_source'
    && accuracy === 'semantic_anchor'
    && ['historical_map', 'manual_research'].includes(sourceProvider)
    && hasGeometryOrAnchors(place)
    && ['line_anchor', 'area_anchor', 'historical_anchor'].includes(String(place?.coordRole ?? ''));
  const acceptedLowAccuracy = verifiedGeometrySemanticAnchor || verifiedHistoricalApproximation || verifiedHistoricalSemanticAnchor;`;
if (!tool.includes(oldBlock)) throw new Error('Fant ikke forventet trust-blokk');
tool = tool.replace(oldBlock, newBlock);
fs.writeFileSync(toolPath, tool);

let test = fs.readFileSync(testPath, 'utf8');
const marker = `assert.equal(validateCoordinateSource(historicalAnchor).trust, 'verified');`;
const addition = `${marker}\nconst historicalSemanticAnchor = { ...historicalAnchor, geocodeAccuracy: 'semantic_anchor', coordRole: 'area_anchor', anchors: [{ id: 'h1', name: 'Historisk markør', type: 'historic_marker', lat: 59.9081, lon: 10.7553, r: 25 }] };\nassert.equal(validateCoordinateSource(historicalSemanticAnchor).trust, 'verified');`;
if (!test.includes(marker)) throw new Error('Fant ikke historisk testmarkør');
test = test.replace(marker, addition);
fs.writeFileSync(testPath, test);

let doc = fs.readFileSync(docPath, 'utf8');
const oldText = '`geocodeAccuracy: "historical_approximation"` kan gi canonical verified trust bare sammen med `coordStatus: "verified_historical_source"`, `coordRole: "historical_anchor"` og historisk kildeidentitet.';
const newText = '`geocodeAccuracy: "historical_approximation"` kan gi canonical verified trust bare sammen med `coordStatus: "verified_historical_source"`, `coordRole: "historical_anchor"` og historisk kildeidentitet. Et dokumentert historisk linje-/områdeanker kan også bruke `geocodeAccuracy: "semantic_anchor"` når status er `verified_historical_source`, kilden er `historical_map` eller `manual_research`, og geometry/anchors eller eksplisitt linje-/område-/historisk anker dokumenterer representasjonen.';
if (!doc.includes(oldText)) throw new Error('Fant ikke dokumentasjonsteksten');
doc = doc.replace(oldText, newText);
fs.writeFileSync(docPath, doc);

console.log('Patched historical semantic anchor trust');
