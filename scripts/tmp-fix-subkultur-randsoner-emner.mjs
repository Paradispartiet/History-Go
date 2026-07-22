import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = 'data/places/subkultur/oslo/places_subkultur.json';
const ids = new Set([
  'plata_oslo',
  'prindsen_mottakssenter',
  'fyrlyset_oslo',
  'evangeliesenteret_kontaktsenter_oslo',
]);

const places = JSON.parse(await readFile(sourcePath, 'utf8'));
let changed = 0;
for (const place of places) {
  if (!ids.has(place?.id)) continue;
  place.emne_ids = ['em_sub_rett_til_byen', 'em_sub_tilhorighet_miljo'];
  changed += 1;
}

if (changed !== ids.size) {
  throw new Error(`Expected to update ${ids.size} places, updated ${changed}.`);
}

await writeFile(sourcePath, `${JSON.stringify(places, null, 2)}\n`, 'utf8');
console.log(`Updated canonical emne_ids for ${changed} Subkultur places.`);
