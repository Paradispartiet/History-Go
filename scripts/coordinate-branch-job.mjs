import fs from 'node:fs';

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');

if (!protocol.includes('Oslo-tabellen inneholder nå 309 dokumenterte verifiserte eller kildekontrollerte canonical steder.')) {
  throw new Error('Forventet canonical Oslo-total 309 før neste-arbeid-synk.');
}
if (!protocol.includes('| 112 | `skraperudtjern` | Skraperudtjern | verified_geometry | `osm-way:23761672` |')) {
  throw new Error('Mangler canonical batch 112-rad for Skraperudtjern.');
}

const stale = `## Neste arbeid\n\n- Neste nye Oslo-kontroll er batch 109.\n- \`places_oslo_natur_ljanselva_rute.json\` er nå fullt kontrollert i manifestrekkefølge. Før batch 109 starter skal neste aktive naturkilde etter denne fila auditeres eksplisitt mot manifestrekkefølgen; tidligere kontrollerte placeId-er skal hoppes over.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.\n`;
const updated = `## Neste arbeid\n\n- Neste nye Oslo-kontroll er batch 113.\n- \`places_oslo_natur_ljanselva_rute.json\` er nå fullt kontrollert og canonical ført som batch 112. Neste aktive naturkilde i køen er \`places_oslo_natur_ostensjovannet.json\`; tidligere kontrollerte placeId-er skal hoppes over.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte \`needs_review\`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.\n`;

if (!protocol.includes(stale)) throw new Error('Fant ikke den forventede stale Neste arbeid-blokken.');
protocol = protocol.replace(stale, updated);
fs.writeFileSync(protocolPath, protocol);
console.log('Neste arbeid er synkronisert til batch 113 og Østensjøvannet-kilden.');
