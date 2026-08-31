#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REGISTRY_FILE = 'data/fagverk/fagverk_registry.json';

const patches = {
  'data/places/politikk/oslo/places_politikk/stortinget.json': {
    sourceUrl: 'https://www.stortinget.no/no/Stortinget-og-demokratiet/Historikk/stortingsbygningen/om-stortingsbygningen/stortingslovene/',
    sourceLabel: 'Stortinget – Stortingsløvene'
  },
  'data/places/politikk/oslo/places_politikk/eidsvolls_plass.json': {
    sourceUrl: 'https://oslobyleksikon.no/side/Henrik_Wergeland-statuen',
    sourceLabel: 'Oslo Byleksikon – Henrik Wergeland-statuen',
    traceTitleFrom: 'Wergelandmonumentet',
    traceTitleTo: 'Wergelandmonumentet på plassen'
  },
  'data/places/politikk/oslo/slottet/slottet.json': {
    sourceUrl: 'https://www.kongehuset.no/monarkiet/kongelige-symboler/flagging-fra-slottet',
    sourceLabel: 'Kongehuset – Flagging fra Slottet'
  },
  'data/places/politikk/oslo/slottsplassen.json': {}
};

const read = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const write = (relative, value) => fs.writeFileSync(path.join(ROOT, relative), `${JSON.stringify(value, null, 2)}\n`);

const registry = read(REGISTRY_FILE);
registry.placeLinks ||= {};

for (const [relative, patch] of Object.entries(patches)) {
  const place = read(relative);
  const fagverk = place.fagverk;
  if (!fagverk || fagverk.schema !== 'history_go_place_fagverk_v2' || fagverk.status !== 'curated') {
    throw new Error(`${relative}: expected freshly curated Place-owned Fagverk`);
  }

  if (patch.sourceUrl) {
    if (!fagverk.source_urls.includes(patch.sourceUrl)) fagverk.source_urls.push(patch.sourceUrl);

    const field = Array.isArray(place.externalLinks)
      ? 'externalLinks'
      : Array.isArray(place.external_links)
        ? 'external_links'
        : 'externalLinks';
    place[field] ||= [];
    const existing = place[field].find((row) => row?.url === patch.sourceUrl);
    if (existing) {
      if (!String(existing.label || existing.title || existing.name || '').trim()) existing.label = patch.sourceLabel;
    } else {
      place[field].push({ label: patch.sourceLabel, url: patch.sourceUrl });
    }
  }

  if (patch.traceTitleFrom) {
    const trace = fagverk.observable_traces.find((row) => row?.title === patch.traceTitleFrom);
    if (!trace) throw new Error(`${place.id}: expected trace ${patch.traceTitleFrom}`);
    trace.title = patch.traceTitleTo;
  }

  registry.placeLinks[place.id] = {
    sourceFile: relative.replace(/^data\//u, ''),
    field: 'fagverk',
    schema: fagverk.schema,
    level: fagverk.level,
    status: fagverk.status
  };

  write(relative, place);
  console.log(`Patched Fagverk contracts: ${place.id}`);
}

write(REGISTRY_FILE, registry);
console.log('Indexed four Place-owned Fagverk packages in registry');
