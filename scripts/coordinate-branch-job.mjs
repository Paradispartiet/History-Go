import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const id = 'ekeberg_helleristninger';
const placeRel = 'places/historie/oslo/places_historie/ekeberg_helleristninger.json';
const evidenceRel = 'oslo/historie/ekeberg_helleristninger.json';
if (!existsSync(`data/${placeRel}`) || !existsSync(`data/coordinate-evidence/${evidenceRel}`)) throw new Error('Validated Ekeberg payload files are missing.');

const indexRaw = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((p) => p.id === id)) throw new Error(`${id} already exists in runtime index; abort duplicate production.`);

for (const [path, entry] of [['data/places/manifest.json', placeRel], ['data/coordinate-evidence/manifest.json', evidenceRel]]) {
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(manifest.files)) throw new Error(`${path} has no files array.`);
  if (manifest.files.includes(entry)) throw new Error(`${path} already contains ${entry}.`);
  manifest.files.push(entry);
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = readFileSync(protocolPath, 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const nextBatch = Math.max(...batches) + 1;
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse verified Oslo count.');
const oldCount = Number(countMatch[1]);
const newCount = oldCount + 1;
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\./, `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder.`);
const row = `| ${nextBatch} | \`${id}\` | Helleristningene på Ekeberg | verified_geometry | \`kulturminnesok:41907\` |`;
const rows = [...protocol.matchAll(/^\|\s*\d+\s*\|.*$/gm)];
const last = rows.at(-1);
if (!last) throw new Error('No protocol table row found.');
const pos = last.index + last[0].length;
protocol = `${protocol.slice(0, pos)}\n${row}${protocol.slice(pos)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`${id}\` som selve det registrerte helleristningsfeltet ved Sjømannsskolen på Ekeberg. Koordinaten er geometrisenteret for Riksantikvarens offisielle MultiPolygon-feature \`41907-1\`, koblet direkte til Kulturminne-ID 41907. Feltet holdes separat fra \`ekebergparken\`, Kongsveien og brede Ekeberg-områdeankre. Dateringen til omtrent 4 000–5 000 år er bred; år -2500 i place-recorden er et teknisk representasjonspunkt og ikke en eksakt arkeologisk datering.\n`;
writeFileSync(protocolPath, protocol);
console.log(`Registered ${id} as Oslo coordinate batch ${nextBatch}; ${oldCount} -> ${newCount}.`);
rmSync(new URL(import.meta.url));
