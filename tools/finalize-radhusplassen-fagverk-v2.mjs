import fs from 'node:fs';

const registryPath = 'data/fagverk/fagverk_registry.json';
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

registry.places ??= {};
registry.places.radhusplassen = {
  sourceFile: 'places/by/oslo/places/radhusplassen.json',
  field: 'fagverk',
  schema: 'history_go_place_fagverk_v2',
  level: 'full',
  status: 'curated'
};

fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
