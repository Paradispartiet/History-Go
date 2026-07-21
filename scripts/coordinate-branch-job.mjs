#!/usr/bin/env node

import fs from 'node:fs';

await import('./coordinate-retro-compliance-fix.mjs');

const placeFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/vaterland_historisk_elvelop.json';
const places = JSON.parse(fs.readFileSync(placeFile, 'utf8'));
const place = places.find((item) => item?.id === 'vaterland_historisk_elvelop');
if (!place) throw new Error('Mangler vaterland_historisk_elvelop i aktiv aggregate source');
const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
evidence.currentCoordinate = {
  lat: place.lat ?? null,
  lon: place.lon ?? null,
  r: place.r ?? null,
  coordStatus: place.coordStatus ?? '',
  coordSource: place.coordSource ?? '',
  coordType: place.coordType ?? '',
  coordNote: place.coordNote ?? ''
};
fs.writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2) + '\n');
