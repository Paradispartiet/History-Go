import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

function abs(rel) {
  return path.join(ROOT, rel);
}

function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected text not found`);
  if (text.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${label}: expected exactly one match`);
  }
  return text.slice(0, first) + after + text.slice(first + before.length);
}

let text = fs.readFileSync(abs(PROTOCOL), 'utf8');

text = replaceOnce(
  text,
  'Oslo-tabellen inneholder nå 175 verifiserte eller kildekontrollerte canonical steder. Batch 40 løser trikk 17/18 som et forgrenet rutepar med fem offisielle stoppankre. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo-tabellen inneholder nå 178 verifiserte eller kildekontrollerte canonical steder. Batch 41 etterfører tre museums- og kultursteder som allerede er produsert og runtime-synkronisert med kildebelagte geometriankre: Norges Hjemmefrontmuseum, Forsvarsmuseet og Roseslottet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 40.',
  'Oslo summary'
);

text = replaceOnce(
  text,
  '| 40 | `trikk_17_18` | Trikkelinje 17/18 | verified_geometry | `ruter:tram-lines:17+18:2026-04-20` |',
  '| 40 | `trikk_17_18` | Trikkelinje 17/18 | verified_geometry | `ruter:tram-lines:17+18:2026-04-20` |\n| 41 | `norges_hjemmefrontmuseum` | Norges Hjemmefrontmuseum | verified_geometry | `osm-way:111833902` |\n| 41 | `forsvarsmuseet` | Forsvarsmuseet | verified_geometry | `osm-way:54830211` |\n| 41 | `roseslottet` | Roseslottet | verified_geometry | `osm-way:1004591108` |',
  'Batch 41 rows'
);

text = replaceOnce(
  text,
  'Batch 40 (2026-07-20) modellerer `trikk_17_18` som et forgrenet rutepar i stedet for ett symbolsk midtpunkt. Ruters gjeldende rutetabell definerer de to grenene, og fem entydige parent-stopp fra Enturs nasjonale stoppregister brukes som felles vestende, felles sentrums-/linjeanker ved Nybrua, grenankre ved Sinsenkrysset og Storo og felles ende ved Grefsen stasjon.',
  'Batch 40 (2026-07-20) modellerer `trikk_17_18` som et forgrenet rutepar i stedet for ett symbolsk midtpunkt. Ruters gjeldende rutetabell definerer de to grenene, og fem entydige parent-stopp fra Enturs nasjonale stoppregister brukes som felles vestende, felles sentrums-/linjeanker ved Nybrua, grenankre ved Sinsenkrysset og Storo og felles ende ved Grefsen stasjon.\n\nBatch 41 (2026-07-20) etterfører de tre geometri-verifiserte stedene fra PR #2594 etter at batch 40 samtidig synkroniserte runtime-indeks og evidence-snapshotene. `norges_hjemmefrontmuseum` bruker Det dobbelte batteri / bygning 21 (`osm-way:111833902`) som eget bygningsanker, og `forsvarsmuseet` bruker Hovedarsenalet / bygning 62 (`osm-way:54830211`); begge er fysisk separate understeder inne på Akershus festning. `roseslottet` bruker den navngitte installasjonsgeometrien `osm-way:1004591108` som `site_center`, og aktiv status skal revurderes etter 2026-12-31.',
  'Batch 41 note'
);

text = replaceOnce(
  text,
  'Disse kontrollene er fullført, men teller ikke blant de 175 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 178 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);

fs.writeFileSync(abs(PROTOCOL), text);
fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));

console.log('After-registered three museum/place coordinates as Oslo coordinate batch 41.');
