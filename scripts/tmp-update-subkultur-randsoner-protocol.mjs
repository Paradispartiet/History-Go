import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const protocolPath = join(root, 'docs/coordinates/coordinate-control-protocol.md');
const placesPath = join(root, 'data/places/subkultur/oslo/places_subkultur.json');
const batch = 142;
const date = '2026-07-22';

let protocol = await readFile(protocolPath, 'utf8');
if (protocol.includes(`| ${batch} | \`plata_oslo\``)) {
  console.log(`Batch ${batch} already present in coordinate protocol.`);
  process.exit(0);
}

const places = JSON.parse(await readFile(placesPath, 'utf8'));
const ids = ['plata_oslo', 'prindsen_mottakssenter', 'fyrlyset_oslo', 'evangeliesenteret_kontaktsenter_oslo'];
const selected = new Map(places.filter((place) => ids.includes(place?.id)).map((place) => [place.id, place]));
for (const id of ids) {
  if (!selected.has(id)) throw new Error(`Missing ${id} before protocol update.`);
}

protocol = protocol.replace(
  /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
  (_, count) => `Oslo-protokollen dekker nå ${Number(count) + ids.length} aktive current \`verified*\` canonical Oslo-steder.`,
);

const rows = ids.map((id) => {
  const place = selected.get(id);
  return `| ${batch} | \`${id}\` | ${place.name} | ${place.coordStatus} | \`${place.sourceObjectId}\` |`;
}).join('\n');

const note = `\n${rows}\n\nBatch ${batch} (${date}) utvider Subkultur med dokumenterte sosiale randsoner og støttepunkter. \`plata_oslo\` bruker Lokalhistoriewikis dokumenterte historiske koordinat som \`historical_anchor\` for den tidligere åpne russcenen ved Christian Frederiks plass; punktet representerer et historisk sosialt område, ikke enkeltpersoner. \`prindsen_mottakssenter\`, \`fyrlyset_oslo\` og \`evangeliesenteret_kontaktsenter_oslo\` følger address-first-policyen og bruker hvert sitt entydige Geonorge-adressepunkt på dokumentert besøksadresse. Rå Geonorge-oppslag er lagret i batchrapporten. Batchen skiller eksplisitt mellom historisk åpen russcene, sosial møteplass og dagens lavterskel hjelpeinfrastruktur.\n\n`;

const marker = 'Retrospektiv compliance-audit batch 1–120';
const markerIndex = protocol.indexOf(marker);
if (markerIndex === -1) throw new Error(`Could not find protocol insertion marker: ${marker}`);
const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
protocol = `${protocol.slice(0, lineStart)}${note}${protocol.slice(lineStart)}`;

await writeFile(protocolPath, protocol, 'utf8');
console.log(`Recorded coordinate batch ${batch} for ${ids.length} Subkultur places.`);
