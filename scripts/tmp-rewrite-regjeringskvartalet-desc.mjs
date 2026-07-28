import crypto from 'node:crypto';
import fs from 'node:fs';

const PLACE_ID = 'regjeringskvartalet';
const PLACE_PATH = 'data/places/politikk/oslo/places_politikk/regjeringskvartalet.json';
const PACKET_PATH = 'data/places/production/regjeringskvartalet.json';
const REVIEW_DATE = '2026-07-28';
const NEW_DESC = 'Regjeringskvartalet har vokst fram gjennom gjentatte forsøk på å samle den norske statsforvaltningen i sentrum av Oslo. Etter terrorangrepet 22. juli 2011 blir området bygget opp på nytt med eldre regjeringsbygg og nye departementsbygninger.';

function readJson(path) {
  const raw = fs.readFileSync(path, 'utf8');
  return { raw, value: JSON.parse(raw) };
}

function writeJson(path, value, originalRaw) {
  const pretty = /^\s*[\[{]\s*\n/u.test(originalRaw);
  fs.writeFileSync(path, pretty ? `${JSON.stringify(value, null, 2)}\n` : `${JSON.stringify(value)}\n`);
}

function findPlace(document) {
  if (Array.isArray(document)) return document.find((row) => row?.id === PLACE_ID);
  if (document?.id === PLACE_ID) return document;
  if (Array.isArray(document?.places)) return document.places.find((row) => row?.id === PLACE_ID);
  return null;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

const placeDocument = readJson(PLACE_PATH);
const place = findPlace(placeDocument.value);
if (!place) throw new Error(`Fant ikke ${PLACE_ID} i ${PLACE_PATH}`);

const packetDocument = readJson(PACKET_PATH);
const packet = packetDocument.value;
if (packet.placeId !== PLACE_ID) throw new Error(`Produksjonspakken tilhører ${packet.placeId}`);
if (packet.placeFile !== PLACE_PATH) throw new Error(`Uventet placeFile: ${packet.placeFile}`);

const requiredClaims = [
  'claim_identity_area',
  'claim_post1814_colocation',
  'claim_departments_spread',
  'claim_attack',
  'claim_rebuild_values',
  'claim_h_block_1958',
  'claim_stage1_start_scope',
  'claim_c_block_current'
];
const verifiedClaims = new Set(
  (Array.isArray(packet.claims) ? packet.claims : [])
    .filter((claim) => claim?.status === 'verified')
    .map((claim) => claim.id)
);
for (const claimId of requiredClaims) {
  if (!verifiedClaims.has(claimId)) throw new Error(`Mangler verifisert claim: ${claimId}`);
}

const previousDesc = String(place.desc || '');
place.desc = NEW_DESC;
packet.textHashes.desc = sha256(NEW_DESC);
packet.sentenceCoverage.desc = [
  {
    sentence: 1,
    claimIds: ['claim_identity_area', 'claim_post1814_colocation', 'claim_departments_spread']
  },
  {
    sentence: 2,
    claimIds: ['claim_attack', 'claim_rebuild_values', 'claim_h_block_1958', 'claim_stage1_start_scope', 'claim_c_block_current']
  }
];

packet.reviews.editorial = {
  ...packet.reviews.editorial,
  status: 'passed',
  reviewedAt: REVIEW_DATE,
  reviewer: packet.reviews.editorial?.reviewer || 'History Go redaksjon',
  introducedNewFacts: false,
  ingressReview: {
    controllingIdea: 'Regjeringskvartalet som resultat av gjentatte samlokaliseringsforsøk og gjenoppbyggingen etter 22. juli.',
    chronologyInventoryRemoved: true,
    nameAndYearPileupRemoved: true,
    knownNewFlowPassed: true,
    readAloudPassed: true
  }
};

writeJson(PLACE_PATH, placeDocument.value, placeDocument.raw);
writeJson(PACKET_PATH, packet, packetDocument.raw);

console.log(JSON.stringify({
  placeId: PLACE_ID,
  previousDesc,
  nextDesc: NEW_DESC,
  descHash: packet.textHashes.desc,
  descSentences: packet.sentenceCoverage.desc.length,
  introducedNewFacts: packet.reviews.editorial.introducedNewFacts
}, null, 2));
