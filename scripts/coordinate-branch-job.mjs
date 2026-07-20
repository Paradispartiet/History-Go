import fs from 'node:fs';
import path from 'node:path';

const protocolPath = path.join(process.cwd(), 'docs/coordinates/coordinate-control-protocol.md');
let protocol = fs.readFileSync(protocolPath, 'utf8');

const broken = /\| 55 \| `holmlia_bad` \| Holmlia bad \| verified \| `geonorge-adresser-v1:0301:13084:34` \|\n\nRelevan\n(\| 56 \| `skimore_oslo` \| Skimore Oslo \| verified \| `geonorge-adresser-v1:0301:17787:64` \|)te korrigerende merger for de første Oslo-batchene:/;
const match = protocol.match(broken);
if (!match) throw new Error('Expected malformed Skimore batch 56 table boundary was not found');

protocol = protocol.replace(
  broken,
  `| 55 | \`holmlia_bad\` | Holmlia bad | verified | \`geonorge-adresser-v1:0301:13084:34\` |\n${match[1]}\n\nRelevante korrigerende merger for de første Oslo-batchene:`
);

const expected = '| 55 | `holmlia_bad` | Holmlia bad | verified | `geonorge-adresser-v1:0301:13084:34` |\n| 56 | `skimore_oslo` | Skimore Oslo | verified | `geonorge-adresser-v1:0301:17787:64` |\n\nRelevante korrigerende merger for de første Oslo-batchene:';
if (!protocol.includes(expected)) throw new Error('Skimore protocol repair did not produce the expected table boundary');

fs.writeFileSync(protocolPath, protocol);
console.log('Repaired Skimore batch 56 row placement without changing counts or coordinate data.');
