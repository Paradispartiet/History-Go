import crypto from 'node:crypto';
import fs from 'node:fs';

const packetPath = 'data/places/production/vaalerenga.json';
const placePath = 'data/places/by/oslo/places/vaalerenga.json';

const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));
const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
if (packet.placeId !== 'vaalerenga' || packet.status !== 'ready_v4_2' || place.id !== 'vaalerenga') {
  throw new Error('Unexpected Vålerenga production packet/place identity/status');
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

const oldOpening = 'Vålerenga vokste fram som forstad langs Strømsveien fra 1830-årene, mens området ennå lå utenfor Christianias bygrense.';
const newOpening = 'Vålerenga vokste fram som forstad langs Strømsveien fra 1830-årene, mens området lå utenfor Christianias bygrense.';
if (!place.popupDesc.includes(oldOpening)) throw new Error('Vålerenga popup temporal-text precondition no longer matches');
place.popupDesc = place.popupDesc.replace(oldOpening, newOpening);
const openingClaim = byId.get('claim_vaalerenga_text_04');
if (!openingClaim || openingClaim.claim !== oldOpening) throw new Error('Vålerenga opening claim precondition no longer matches');
openingClaim.claim = newOpening;

packet.textHashes ??= { algorithm: 'sha256' };
packet.textHashes.algorithm = 'sha256';
packet.textHashes.desc = crypto.createHash('sha256').update(String(place.desc ?? ''), 'utf8').digest('hex');
packet.textHashes.popupDesc = crypto.createHash('sha256').update(String(place.popupDesc ?? ''), 'utf8').digest('hex');

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

fs.writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);
fs.writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`);
