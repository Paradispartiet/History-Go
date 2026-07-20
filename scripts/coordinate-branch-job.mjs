import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SOURCE_COMMIT = '6e9eb7338babccee69900a77b1bd8f2fb62cdc8a';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const RUNTIME_PATH = 'scripts/.coordinate-branch-job-batch47-runtime.mjs';

function abs(rel) {
  return path.join(ROOT, rel);
}

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label}: source text not found`);
  return source.split(before).join(after);
}

let source = execFileSync(
  'git',
  ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
);

// Shift the intended museum batch from 46 to 47 before adapting its current-main anchors.
source = source.split('Batch 46').join('Batch 47');
source = source.split('batch 46').join('batch 47');

source = replaceRequired(
  source,
  'Oslo-tabellen inneholder nå 188 verifiserte eller kildekontrollerte canonical steder. Batch 45 legger til Kunstnernes Hus, Vigelandmuseet og Møllergata skole med entydige offisielle Geonorge-adressepunkter og parent-modeller som hindrer duplikatmarkører for Vigelandsparken og Oslo Skolemuseum. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo-tabellen inneholder nå 189 verifiserte eller kildekontrollerte canonical steder. Batch 46 løser Fiskehallen på Vippetangen med entydig Geonorge-adresse og korrigert place-scope. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 38.',
  'current Oslo summary anchor'
);
source = replaceRequired(
  source,
  'Oslo-tabellen inneholder nå 191 verifiserte eller kildekontrollerte canonical steder. Batch 47 legger til TBS Gallery, The Viking Planet Oslo og The Salmon kunnskapssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt avgrensede institusjonsidentiteter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo-tabellen inneholder nå 192 verifiserte eller kildekontrollerte canonical steder. Batch 47 legger til TBS Gallery, The Viking Planet Oslo og The Salmon kunnskapssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt avgrensede institusjonsidentiteter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 38.',
  'new Oslo summary'
);

source = replaceRequired(
  source,
  '| 45 | `mollergata_skole` | Møllergata skole | verified | `geonorge-adresser-v1:0301:14943:49` |',
  '| 46 | `vippetangen_fisketorg` | Fiskehallen på Vippetangen | verified | `geonorge-adresser-v1:0301:10077:23` |',
  'current batch row anchor'
);
source = source
  .split('| 46 | `tbs_gallery` |').join('| 47 | `tbs_gallery` |')
  .split('| 46 | `viking_planet_oslo` |').join('| 47 | `viking_planet_oslo` |')
  .split('| 46 | `the_salmon_vitensenter` |').join('| 47 | `the_salmon_vitensenter` |');

const oldBatch45Note = 'Batch 45 (2026-07-20) legger til tre fysisk avklarte institusjonssteder fra den lukkede museumsauditen. `kunstnernes_hus` bruker Wergelandsveien 17 som eget kunstinstitusjonsbygg. `vigelandmuseet` bruker Nobels gate 32 som atelier-, bolig- og museumsbygning og holdes separat fra det større parkankeret `vigelandsparken`. `mollergata_skole` bruker Møllergata 49 som canonical skolekompleks, mens Oslo Skolemuseum modelleres som institusjonslag i bygg D i stedet for en separat overlappende markør.';
const currentBatch46Note = 'Batch 46 (2026-07-20) løser `vippetangen_fisketorg` ved å avgrense den tidligere blandede fisketorg/fiskehavn/Fiskehallen-recorden til dagens konkrete Fiskehallen på Akershusstranda 23. Fisketorget ble flyttet til Vippetangen i 1905; dagens større hall ble oppført 1932–33 og åpnet i 1933. Det entydige Geonorge-adressepunktet `geonorge-adresser-v1:0301:10077:23` brukes som canonical bygningsanker. Punktet representerer ikke hele Vippetangen eller den historiske fiskehavna.';
source = replaceRequired(source, oldBatch45Note, currentBatch46Note, 'current batch note anchor');

source = replaceRequired(
  source,
  'Disse kontrollene er fullført, men teller ikke blant de 188 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 189 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'current needs-review count reference'
);
source = replaceRequired(
  source,
  'Disse kontrollene er fullført, men teller ikke blant de 191 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 192 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'new needs-review count reference'
);

fs.writeFileSync(abs(RUNTIME_PATH), source);
try {
  await import(`${pathToFileURL(abs(RUNTIME_PATH)).href}?run=${Date.now()}`);
} finally {
  if (fs.existsSync(abs(RUNTIME_PATH))) fs.unlinkSync(abs(RUNTIME_PATH));
}
