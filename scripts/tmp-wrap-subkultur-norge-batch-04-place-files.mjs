import { readFile, writeFile } from 'node:fs/promises';

const files = [
  'data/places/subkultur/trondelag/uffa_huset_trondheim.json',
  'data/places/subkultur/trondelag/ressurssenter_kvinner_trondheim.json',
  'data/places/subkultur/vestland/nygardsparken_bergen.json',
  'data/places/subkultur/trondelag/svartlamon_trondheim.json',
];

for (const file of files) {
  const data = JSON.parse(await readFile(file, 'utf8'));
  const wrapped = Array.isArray(data?.places) ? data : { places: [data] };
  if (!Array.isArray(wrapped.places) || wrapped.places.length !== 1) {
    throw new Error(`${file}: expected exactly one place`);
  }
  await writeFile(file, `${JSON.stringify(wrapped, null, 2)}\n`, 'utf8');
  console.log(`Wrapped ${file} as { places: [...] }`);
}
