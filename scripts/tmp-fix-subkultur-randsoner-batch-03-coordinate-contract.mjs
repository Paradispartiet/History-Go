import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = 'data/places/subkultur/oslo/places_subkultur.json';
const places = JSON.parse(await readFile(sourcePath, 'utf8'));
const place = places.find((item) => item?.id === 'brugata_storgata_rusmiljo');
if (!place) throw new Error('Missing brugata_storgata_rusmiljo');

place.locatorType = 'current_place';
place.coordRole = 'area_anchor';
place.coordNote = 'Semantisk områdeanker. Oslo kommune beskriver rusmiljøet i krysningen Storgata/Brugata og trekker konkret fram Storgata 33. Det eksakte offisielle Geonorge-adressepunktet for Storgata 33 brukes som stabilt områdeanker for det sosialhistoriske miljøet, ikke som markør for hele gaten.';

await writeFile(sourcePath, `${JSON.stringify(places, null, 2)}\n`, 'utf8');
console.log('Fixed Brugata coordinate-contract fields.');
