import fs from 'node:fs';

const packetPath = 'data/places/production/vaalerenga.json';
const validatorPath = 'scripts/validate-place-description-production-v4_2.mjs';
const testPath = 'tests/place-description-production-v4_2.test.mjs';

const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
if (packet.placeId !== 'vaalerenga' || packet.status !== 'ready_v4_2') {
  throw new Error('Unexpected Vålerenga production packet identity/status');
}

const sourceTypeMap = new Map([
  ['institutional_reference', 'reputable_secondary'],
  ['primary_institutional', 'institutional'],
  ['edited_reference', 'reputable_secondary']
]);
const allowed = new Set(['primary', 'official', 'institutional', 'archive', 'catalogue', 'scholarly', 'reputable_secondary']);
for (const claim of packet.claims) {
  if (sourceTypeMap.has(claim.sourceType)) claim.sourceType = sourceTypeMap.get(claim.sourceType);
  if (!allowed.has(claim.sourceType)) throw new Error(`Unsupported sourceType: ${claim.id}=${claim.sourceType}`);
}

const byId = new Map(packet.claims.map(claim => [claim.id, claim]));
function makeStrong(id, independentSourceUrls) {
  const claim = byId.get(id);
  if (!claim) throw new Error(`Missing strong claim ${id}`);
  claim.claimKind = 'strong';
  claim.evidenceMode = 'explicit';
  claim.independentSourceUrls = independentSourceUrls;
}
makeStrong('claim_vaalerenga_text_08', [
  'https://lokalhistoriewiki.no/V%C3%A5lerenga_skole'
]);
makeStrong('claim_vaalerenga_text_12', [
  'https://www.synnove.no/om-selskapet/'
]);
makeStrong('claim_vaalerenga_text_21', [
  'https://oslobyleksikon.no/side/V%C3%A5lerenga_(str%C3%B8k)',
  'https://oslobyleksikon.no/side/Danmarks_gate',
  'https://oslobyleksikon.no/side/Str%C3%B8msveien'
]);

const additions = [
  {
    type: 'når',
    question: 'Når ble Vålerenga kirke vigslet på nytt etter gjenoppbyggingen?',
    answer: '2. desember 1984',
    normalKnowledgeQuestion: true,
    claimIds: ['claim_vaalerenga_text_16']
  },
  {
    type: 'når',
    question: 'Når ble Strømsveien stengt for gjennomgangstrafikk mellom Galgeberg og Etterstad?',
    answer: '1992',
    normalKnowledgeQuestion: true,
    claimIds: ['claim_vaalerenga_text_20']
  }
];
packet.quizReadiness ??= {};
packet.quizReadiness.questions ??= [];
for (const item of additions) {
  if (!packet.quizReadiness.questions.some(existing => existing.question === item.question)) {
    packet.quizReadiness.questions.push(item);
  }
}
if (packet.quizReadiness.questions.length !== 8) {
  throw new Error(`Expected exactly 8 direct factual questions, got ${packet.quizReadiness.questions.length}`);
}
if (new Set(packet.quizReadiness.questions.map(item => item.question)).size !== 8) {
  throw new Error('Duplicate direct factual questions');
}
fs.writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`);

let validator = fs.readFileSync(validatorPath, 'utf8');
const oldTemporal = "  return TEMPORAL_MARKERS.some((marker) => normalized.includes(normalizeComparable(marker)));";
const newTemporal = [
  "  return TEMPORAL_MARKERS.some((marker) => {",
  "    const needle = normalizeComparable(marker);",
  "    return new RegExp(`(?:^|\\\\s)${escapeRegex(needle)}(?=\\\\s|$)`, 'u').test(normalized);",
  "  });"
].join('\n');
if (!validator.includes(oldTemporal)) throw new Error('Temporal validator precondition no longer matches');
validator = validator.replace(oldTemporal, newTemporal);
fs.writeFileSync(validatorPath, validator);

let tests = fs.readFileSync(testPath, 'utf8');
const anchor = [
  "  assert.equal(containsTemporalClaim('Museet drives av kommunen i dag.'), true);",
  "  assert.equal(containsTemporalClaim('Museet stengte i 1984.'), false);"
].join('\n');
const replacement = [
  "  assert.equal(containsTemporalClaim('Museet drives av kommunen i dag.'), true);",
  "  assert.equal(containsTemporalClaim('Museet er nå kommunalt drevet.'), true);",
  "  assert.equal(containsTemporalClaim('Området lå ennå utenfor bygrensen.'), false);",
  "  assert.equal(containsTemporalClaim('Museet stengte i 1984.'), false);"
].join('\n');
if (!tests.includes(anchor)) throw new Error('Temporal regression-test anchor no longer matches');
tests = tests.replace(anchor, replacement);
fs.writeFileSync(testPath, tests);
