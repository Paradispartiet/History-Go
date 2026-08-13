const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const retiredAhaRuntime = [
  'AHA/ahaEmneMatcher.js',
  'AHA/ahaFieldProfiles.js',
  'AHA/ahaHistoryGoImport.js',
  'AHA/ahaIngest.js',
  'AHA/ahaInsights.js',
  'AHA/ahaModules.js',
  'AHA/ahaSources.js',
  'AHA/insightsChamber.js',
  'AHA/metaInsightsEngine.js',
  'AHA/insights.html'
];

for (const file of retiredAhaRuntime) {
  assert.equal(fs.existsSync(file), false, `${file} must remain owned by AHA-EchoNet, not History-Go`);
}

function collectTextFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectTextFiles(target);
    return /\.(?:html|js|md)$/.test(entry.name) ? [target] : [];
  });
}

const boundarySources = [...collectTextFiles('AHA'), 'js/aha.js']
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');

for (const prohibitedAuthority of [
  'global.InsightsEngine',
  'global.MetaInsightsEngine',
  'global.AHAHistoryGoImport',
  'global.AHAIngest',
  'global.AHASources'
]) {
  assert.equal(boundarySources.includes(prohibitedAuthority), false, `${prohibitedAuthority} cannot be defined in History-Go`);
}

assert.equal(boundarySources.includes("localStorage.setItem('aha_insight_chamber_v1'"), false, 'History-Go cannot write the AHA insight chamber');
assert.equal(boundarySources.includes('localStorage.setItem("aha_insight_chamber_v1"'), false, 'History-Go cannot write the AHA insight chamber');

const statusPage = fs.readFileSync('AHA/index.html', 'utf8');
assert.match(statusPage, /aha_import_payload_v1/);
assert.match(statusPage, /AHA-EchoNet/);
assert.match(statusPage, /\.\.\/js\/aha\.js/);

const bridge = fs.readFileSync('js/aha.js', 'utf8');
assert.match(bridge, /HG_AHA_IMPORT_SCHEMA_VERSION\s*=\s*["']aha_import_payload_v1["']/);
assert.match(bridge, /localStorage\.setItem\(["']aha_import_payload_v1["'], json\)/);

console.log('aha-ownership-boundary.test.js passed');
