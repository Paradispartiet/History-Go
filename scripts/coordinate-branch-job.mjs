import fs from 'node:fs';

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
const osloStart = protocol.indexOf('## Oslo');
const correctionsMarker = protocol.indexOf('\nRelevante korrigerende merger for de første Oslo-batchene:', osloStart);
if (osloStart < 0 || correctionsMarker < 0) throw new Error('Fant ikke canonical Oslo-hovedtabell.');
const primarySection = protocol.slice(osloStart, correctionsMarker);
const rows = [...primarySection.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/gm)];
const uniqueIds = new Set(rows.map((match) => match[2]));
if (uniqueIds.size < 300) throw new Error(`Uventet lav canonical Oslo-total: ${uniqueIds.size}`);
if (!/Neste nye Oslo-kontroll er batch 115\./.test(protocol)) throw new Error('Forventet batch 115 som neste arbeid.');
protocol = protocol.replace(/Oslo-tabellen inneholder nå \d+ dokumenterte/, `Oslo-tabellen inneholder nå ${uniqueIds.size} dokumenterte`);
fs.writeFileSync(protocolPath, protocol);
console.log(JSON.stringify({ uniqueVerifiedOrControlledPlaceIds: uniqueIds.size, rowCount: rows.length, nextBatch: 115 }, null, 2));
