// Normalize selected one-place JSON array files to plain JSON objects.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const targets = [
  'data/places/by/agder/arendal_stasjon.json',
  'data/places/by/agder/arendal_tollbod.json',
  'data/places/by/agder/audnedal_stasjon_lyngdal.json',
  'data/places/by/agder/dampskipet_bjoren_bygland.json',
  'data/places/by/agder/farsund_byhistorie_havn.json',
  'data/places/by/agder/fiskebrygga_kristiansand.json',
  'data/places/by/agder/flekkefjord_hollenderbyen.json',
  'data/places/by/agder/flekkefjordbanen_sira.json',
  'data/places/by/agder/fullriggeren_sorlandet_kristiansand.json',
  'data/places/by/agder/grimstad_byhistorie_og_havn.json',
];

const normalized = [];
const alreadyObjects = [];

for (const target of targets) {
  const abs = join(root, target);
  const parsed = JSON.parse(await readFile(abs, 'utf8'));

  if (Array.isArray(parsed)) {
    if (parsed.length !== 1) {
      throw new Error(`${target} is an array with ${parsed.length} entries; expected exactly 1.`);
    }
    const [place] = parsed;
    if (!place?.id || typeof place.id !== 'string') {
      throw new Error(`${target} contains a place without valid id.`);
    }
    await writeFile(abs, `${JSON.stringify(place, null, 2)}\n`, 'utf8');
    normalized.push({ file: target, id: place.id });
  } else if (parsed && typeof parsed === 'object') {
    alreadyObjects.push({ file: target, id: parsed.id ?? null });
  } else {
    throw new Error(`${target} is neither array nor object.`);
  }
}

const report = {
  status: 'ok',
  description: 'Normalized selected one-place array files to plain JSON objects.',
  normalized_count: normalized.length,
  already_object_count: alreadyObjects.length,
  normalized,
  alreadyObjects,
};

await mkdir(join(root, 'reports'), { recursive: true });
await writeFile(join(root, 'reports/normalize-single-place-arrays-agder-batch1-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Normalized ${normalized.length} single-place array files.`);
