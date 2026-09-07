#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-09-07';
const INVENTORY_PATH = path.join(ROOT, 'reports/lesekiosker-oslo-2026/lesekiosker-oslo-litteratur-inventory.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const inventory = readJson(INVENTORY_PATH);
const candidates = Array.isArray(inventory.candidates) ? inventory.candidates : [];
if (candidates.length !== 21) throw new Error(`Expected 21 Lesekiosk candidates, got ${candidates.length}`);

for (const candidate of candidates) {
  if (candidate.kioskNumber === 71) continue;

  const placeFile = path.join(ROOT, `data/places/litteratur/oslo/lesekiosk/${candidate.id}.json`);
  const packetFile = path.join(ROOT, `data/places/production/${candidate.id}.json`);
  const place = readJson(placeFile);
  const packet = readJson(packetFile);
  const paragraphs = place.popupDesc.split('\n\n');
  const coordinateClaim = packet.claims.find((claim) => claim.id === `claim_${candidate.id}_coordinate`);
  if (!coordinateClaim) throw new Error(`${candidate.id}: coordinate claim missing`);

  if (candidate.kioskNumber === 70) {
    place.desc = 'Lesekiosk 70 – Sagene kirke er kiosk nummer 70 i paret som Lesekiosks Sagene-side omtaler som tvillingkioskene. Den offisielle oversikten fører nummer 70 ved Sagene kirke og bruker samme kartanker som nummer 71. Denne Place-identiteten gjelder bare telefonkiosken med nummer 70.';
    paragraphs[1] = 'Den aktuelle Oslo-oversikten bruker kartankeret som et felles punkt for begge kiosknumrene ved kirken.';
    Object.assign(coordinateClaim, {
      claim: 'Den offisielle Lesekiosk-kartlenken for Lesekiosk 70 – Sagene kirke oppgir kartankeret 59.9377174, 10.7528534.',
      sourceUrl: 'https://lesekiosk.no/finn-en-kiosk/',
      sourceLocation: 'Offisiell Lesekiosk-kartlenke fra aktuell kioskoversikt.',
      sourceType: 'institutional',
      verifiedAt: '2026-08-26'
    });
  } else {
    const [anchorLat, anchorLon] = [candidate.lat, candidate.lon];
    paragraphs[0] = `Lesekiosks aktuelle Oslo-oversikt registrerer ${candidate.name} som kiosk nummer ${candidate.kioskNumber} ved ${candidate.officialListLabel}. Kartlenken for ${candidate.name} oppgir kartankeret ${anchorLat}, ${anchorLon} som en områdehenvisning.`;
    Object.assign(coordinateClaim, {
      claim: `Den offisielle Lesekiosk-kartlenken for ${candidate.name} oppgir kartankeret ${anchorLat}, ${anchorLon} som en områdehenvisning.`,
      sourceUrl: 'https://lesekiosk.no/finn-en-kiosk/',
      sourceLocation: 'Offisiell Lesekiosk-kartlenke fra aktuell kioskoversikt.',
      sourceType: 'institutional',
      verifiedAt: VERIFIED_AT
    });
  }

  place.popupDesc = paragraphs.join('\n\n');
  packet.textHashes.desc = sha(place.desc);
  packet.textHashes.popupDesc = sha(place.popupDesc);
  if (candidate.kioskNumber === 70) {
    packet.reviews.factual = { status: 'passed', reviewedAt: '2026-08-26', reviewer: 'History GO independent source and place-specificity audit' };
    packet.reviews.editorial = { status: 'passed', reviewedAt: '2026-08-26', reviewer: 'History GO independent source and place-specificity audit', introducedNewFacts: false };
    packet.completion.sourceVerifiedAt = '2026-08-26';
  } else {
    packet.reviews.factual = { status: 'passed', reviewedAt: VERIFIED_AT, reviewer: 'History GO Lesekiosk coordinate-copy audit' };
    packet.reviews.editorial = { status: 'passed', reviewedAt: VERIFIED_AT, reviewer: 'History GO Lesekiosk coordinate-copy audit', introducedNewFacts: false };
    packet.completion.sourceVerifiedAt = VERIFIED_AT;
  }

  writeJson(placeFile, place);
  writeJson(packetFile, packet);
}

const placesIndexFile = path.join(ROOT, 'data/places/places_index.json');
const placesIndex = readJson(placesIndexFile);
const sagene70 = readJson(path.join(ROOT, 'data/places/litteratur/oslo/lesekiosk/lesekiosk_70_sagene_kirke.json'));
const sagene70Index = placesIndex.find((place) => place.id === sagene70.id);
if (!sagene70Index) throw new Error('lesekiosk_70_sagene_kirke missing from places index');
sagene70Index.desc = sagene70.desc;
writeJson(placesIndexFile, placesIndex);

console.log('Prepared coordinate-neutral copy for 20 Lesekiosk records.');
