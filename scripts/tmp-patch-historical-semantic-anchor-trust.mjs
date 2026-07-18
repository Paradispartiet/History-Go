import fs from 'node:fs';

const toolPath = 'tools/coordinate-source-contract.mts';
const testPath = 'tests/coordinate-source-contract-anchor-trust.test.mjs';
const docPath = 'docs/coordinates/coordinate-source-contract-v1.md';

let tool = fs.readFileSync(toolPath, 'utf8');
const acceptedPattern = /  const acceptedLowAccuracy = verifiedGeometrySemanticAnchor \|\| verifiedHistoricalApproximation;/;
if (!acceptedPattern.test(tool)) throw new Error('Fant ikke acceptedLowAccuracy-linjen');
tool = tool.replace(
  acceptedPattern,
  `  const verifiedHistoricalSemanticAnchor = status === 'verified_historical_source' && accuracy === 'semantic_anchor' && ['historical_map', 'manual_research'].includes(sourceProvider) && hasGeometryOrAnchors(place) && ['line_anchor', 'area_anchor', 'historical_anchor'].includes(String(place?.coordRole ?? ''));\n  const acceptedLowAccuracy = verifiedGeometrySemanticAnchor || verifiedHistoricalApproximation || verifiedHistoricalSemanticAnchor;`
);
fs.writeFileSync(toolPath, tool);

let test = fs.readFileSync(testPath, 'utf8');
if (!test.includes('historicalSemanticAnchor')) {
  test += `\nconst historicalSemanticAnchor = {\n  id: 'test_historic_semantic', lat: 59.9107593, lon: 10.7265121, r: 260,\n  locatorType: 'historic_site', sourceProvider: 'manual_research', sourceObjectId: 'source:test-historic-semantic',\n  geocodeAccuracy: 'semantic_anchor', coordRole: 'area_anchor', coordType: 'historic_site_anchor',\n  coordStatus: 'verified_historical_source', coordNote: 'Dokumentert historisk områdeanker støttet av flere fysiske markører.',\n  anchors: [{ id: 'h1', name: 'Historisk markør', type: 'historic_marker', lat: 59.9108, lon: 10.7265, r: 25 }]\n};\nassert.equal(validateCoordinateSource(historicalSemanticAnchor).trust, 'verified');\n`;
}
fs.writeFileSync(testPath, test);

let doc = fs.readFileSync(docPath, 'utf8');
const heading = '### Historiske semantiske ankre';
if (!doc.includes(heading)) {
  doc += `\n\n${heading}\n\nEt dokumentert historisk linje- eller områdeanker kan bruke \`geocodeAccuracy: "semantic_anchor"\` med \`coordStatus: "verified_historical_source"\` når kildeleverandøren er \`historical_map\` eller \`manual_research\`, kildeidentiteten er stabil, og geometry, anchors eller et eksplisitt \`line_anchor\`, \`area_anchor\` eller \`historical_anchor\` dokumenterer representasjonen. Dette gjelder blant annet historiske kai- og industriområder som ikke kan reduseres til ett presist adressepunkt.\n`;
}
fs.writeFileSync(docPath, doc);

console.log('Patched historical semantic anchor trust');
