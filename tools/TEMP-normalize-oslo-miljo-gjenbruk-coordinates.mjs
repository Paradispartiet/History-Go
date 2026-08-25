#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATE = '2026-08-25';
const DIR = path.join(ROOT, 'data/places/natur/oslo/miljo_gjenbruk');

function parseAddress(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(.*?)\s+(\d+[A-Za-z]?),\s*(\d{4})\s+(.+)$/u);
  if (!match) return null;
  const [, street, number, postcode, city] = match;
  return { street, number, postcode, city, country: 'Norge' };
}

function municipalSourceId(place) {
  const url = place.externalLinks?.find((row) => row?.type === 'reference')?.url || place.coordSourceUrl || '';
  try {
    const slug = new URL(url).pathname.split('/').filter(Boolean).pop();
    return slug ? `oslo-kommune-stasjon:${slug}` : `oslo-kommune-stasjon:${place.id}`;
  } catch {
    return `oslo-kommune-stasjon:${place.id}`;
  }
}

let verified = 0;
let needsQa = 0;
for (const file of fs.readdirSync(DIR).filter((name) => name.endsWith('.json')).sort()) {
  const full = path.join(DIR, file);
  const place = JSON.parse(fs.readFileSync(full, 'utf8'));
  const oldSourceId = String(place.sourceObjectId || '');
  const structuredAddress = parseAddress(place.address);

  if (oldSourceId.startsWith('kartverket-address:')) {
    const [, addressCode = '', number = '', letter = ''] = oldSourceId.split(':');
    const canonicalSourceId = `geonorge-adresser-v1:0301:${addressCode}:${number}${letter}`;
    place.locatorType = 'current_place';
    place.sourceProvider = 'official_address';
    place.sourceObjectId = canonicalSourceId;
    place.geocodeAccuracy = 'rooftop';
    place.coordRole = 'display_marker';
    place.coordType = 'address_point';
    place.coordStatus = 'verified';
    place.coordSource = 'Kartverket / Geonorge Adresser API (Matrikkelen)';
    place.coordSourceId = canonicalSourceId;
    place.coordSourceUrl = 'https://ws.geonorge.no/adresser/v1/';
    place.coordVerifiedAt = DATE;
    place.coordNote = `Offisielt adresse-representasjonspunkt fra Geonorge Adresser API for ${typeof place.address === 'string' ? place.address : place.name}; brukt som display_marker for den aktive kommunale tjenesten.`;
    if (structuredAddress) place.address = structuredAddress;
    verified += 1;
  } else {
    const sourceId = municipalSourceId(place);
    const sourceUrl = place.externalLinks?.find((row) => row?.type === 'reference')?.url || place.coordSourceUrl;
    place.locatorType = 'current_place';
    place.sourceProvider = 'municipality';
    place.sourceObjectId = sourceId;
    place.geocodeAccuracy = 'approximate';
    place.coordRole = 'display_marker';
    place.coordType = 'service_point';
    place.coordStatus = 'needs_manual_visual_qa';
    place.coordSource = 'Oslo kommune – kommunal stasjonsside';
    place.coordSourceId = sourceId;
    place.coordSourceUrl = sourceUrl;
    delete place.coordVerifiedAt;
    place.coordNote = `Kommunal tjenestelokasjon brukt som display_marker for ${place.name}; punktet har ikke et entydig nummerert Geonorge-adressepunkt og beholdes derfor som needs_manual_visual_qa, ikke som verified.`;
    if (structuredAddress) place.address = structuredAddress;
    needsQa += 1;
  }

  fs.writeFileSync(full, `${JSON.stringify(place, null, 2)}\n`);
}

console.log(`normalized coordinates: verified=${verified}, needs_manual_visual_qa=${needsQa}`);
if (verified + needsQa !== 28) throw new Error(`Expected 28 generated places, got ${verified + needsQa}`);
