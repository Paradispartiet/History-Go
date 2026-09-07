#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';

const placePath = 'data/places/by/oslo/places/vaalerenga.json';
const packetPath = 'data/places/production/vaalerenga.json';
const place = JSON.parse(fs.readFileSync(placePath, 'utf8'));
const packet = JSON.parse(fs.readFileSync(packetPath, 'utf8'));

const replaceExact = (value, before, after, label) => {
  if (!value.includes(before)) throw new Error(`Missing expected ${label}: ${before}`);
  if (value.split(before).length !== 2) throw new Error(`Expected exactly one ${label}: ${before}`);
  return value.replace(before, after);
};

place.popupDesc = replaceExact(place.popupDesc,
  'mens området ennå lå utenfor Christianias bygrense.',
  'mens området fortsatt lå utenfor Christianias bygrense.',
  'temporal false-positive wording');
place.popupDesc = replaceExact(place.popupDesc,
  'Vålerenga skole i Islands gate ble tatt i bruk i 1895 og var ved åpningen byens største skole.',
  'Vålerenga skole i Islands gate ble tatt i bruk i 1895.',
  'school strong-claim wording');
place.popupDesc = replaceExact(place.popupDesc,
  'Synnøve Finden er derfor både en dokumentert person',
  'Synnøve Finden er både en dokumentert person',
  'Synnøve Finden strong-claim wording');
place.popupDesc = replaceExact(place.popupDesc,
  'Vålerenga kan derfor leses gjennom flere konkrete spor samtidig:',
  'Vålerenga kan leses gjennom flere konkrete spor samtidig:',
  'summary strong-claim wording');

const claimById = new Map(packet.claims.map(claim => [claim.id, claim]));
const setClaim = (id, text) => {
  const claim = claimById.get(id);
  if (!claim) throw new Error(`Missing claim ${id}`);
  claim.claim = text;
};
setClaim('claim_vaalerenga_text_04', 'Vålerenga vokste fram som forstad langs Strømsveien fra 1830-årene, mens området fortsatt lå utenfor Christianias bygrense.');
setClaim('claim_vaalerenga_text_08', 'Vålerenga skole i Islands gate ble tatt i bruk i 1895.');
setClaim('claim_vaalerenga_text_12', 'Synnøve Finden er både en dokumentert person i nabolagets næringshistorie og opphavet til en merkeidentitet som senere ble landsdekkende.');
setClaim('claim_vaalerenga_text_21', 'Vålerenga kan leses gjennom flere konkrete spor samtidig: trehusene viser forstadens tidlige boligform, grensesteinen viser byutvidelsen, skolen og kirken viser institusjonsbygging, Danmarks gate 41 viser småskala næringsliv, og endringen av Strømsveien viser hvordan transportpolitikk kan endre et boligområdes hverdagsrom.');

const sourceTypeMap = new Map([
  ['institutional_reference', 'institutional'],
  ['primary_institutional', 'institutional'],
  ['edited_reference', 'reputable_secondary']
]);
let normalized = 0;
for (const claim of packet.claims) {
  const mapped = sourceTypeMap.get(claim.sourceType);
  if (mapped) {
    claim.sourceType = mapped;
    normalized += 1;
  }
}
if (normalized !== 21) throw new Error(`Expected 21 sourceType normalizations, got ${normalized}`);

const questions = packet?.quizReadiness?.questions;
if (!Array.isArray(questions) || questions.length !== 6) throw new Error(`Expected 6 direct packet questions, got ${questions?.length}`);
questions.push(
  {
    type: 'når',
    question: 'Når ble Vålerenga skole i Islands gate tatt i bruk?',
    answer: '1895',
    normalKnowledgeQuestion: true,
    claimIds: ['claim_vaalerenga_text_08']
  },
  {
    type: 'når',
    question: 'Når ble Vålerenga kirke vigslet på nytt etter gjenoppbyggingen?',
    answer: '2. desember 1984',
    normalKnowledgeQuestion: true,
    claimIds: ['claim_vaalerenga_text_16']
  }
);

const sha256 = value => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
packet.textHashes = {
  algorithm: 'sha256',
  desc: sha256(place.desc),
  popupDesc: sha256(place.popupDesc)
};
if (packet.textHashes.popupDesc !== '7393793342e6c30a3ebb91a097c227d68ce1fa35de99798d8a55f22765ec20b4') {
  throw new Error(`Unexpected popupDesc hash ${packet.textHashes.popupDesc}`);
}

fs.writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);
fs.writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`);
console.log(`Vålerenga CI repair materialized: ${normalized} source types, ${questions.length} packet questions, popup ${packet.textHashes.popupDesc}`);
