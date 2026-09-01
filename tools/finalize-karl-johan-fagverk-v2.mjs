#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-09-01';
const PLACE_FILE = 'data/places/by/oslo/places/karl_johan.json';
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const sources = [
  ['Oslo byleksikon – Karl Johans gate', 'https://oslobyleksikon.no/side/Karl_Johans_gate'],
  ['Store norske leksikon – Karl Johans gate', 'https://snl.no/Karl_Johans_gate'],
  ['Oslo kommune – informasjon om barnetoget', 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/informasjon-om-barnetoget/'],
  ['Stortinget – stortingsbygningen', 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortingsbygningen/'],
  ['Kongehuset – Slottsplassen', 'https://www.kongehuset.no/kongelige-eiendommer/det-kongelige-slott/slottsparken/slottsplassen']
];

const read = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);

function addExternalLink(place, label, url) {
  const field = Array.isArray(place.externalLinks)
    ? 'externalLinks'
    : Array.isArray(place.external_links)
      ? 'external_links'
      : 'externalLinks';
  place[field] ||= [];
  const existing = place[field].find(row => row?.url === url);
  if (existing) {
    if (!String(existing.label || existing.title || existing.name || '').trim()) existing.label = label;
    existing.type ||= 'source';
    existing.verifiedAt ||= VERIFIED_AT;
    return;
  }
  place[field].push({ type: 'source', label, url, verifiedAt: VERIFIED_AT });
}

const place = read(PLACE_FILE);
if (place?.id !== 'karl_johan') throw new Error('Karl Johan Place source not resolved');
if (place.fagverk?.schema !== 'history_go_place_fagverk_v2') throw new Error('Karl Johan Fagverk v2 source missing');
if (place.fagverk?.level !== 'full' || place.fagverk?.status !== 'curated') {
  throw new Error('Karl Johan must be full/curated before finalization');
}
for (const [label, url] of sources) addExternalLink(place, label, url);
write(PLACE_FILE, place);

const registry = read(REGISTRY_FILE);
registry.placeLinks ||= {};
registry.placeLinks.karl_johan = {
  sourceFile: PLACE_FILE.replace(/^data\//u, ''),
  field: 'fagverk',
  schema: place.fagverk.schema,
  level: place.fagverk.level,
  status: place.fagverk.status
};
write(REGISTRY_FILE, registry);

console.log('Finalized Karl Johans gate external source links and Fagverk registry index');
