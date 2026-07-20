import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SOURCE_COMMIT = '6e9eb7338babccee69900a77b1bd8f2fb62cdc8a';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const RUNTIME_PATH = 'scripts/.coordinate-branch-job-batch48-runtime.mjs';

function abs(rel) { return path.join(ROOT, rel); }
function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label}: source text not found`);
  return source.split(before).join(after);
}

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
});

source = source.split('Batch 46').join('Batch 48');
source = source.split('batch 46').join('batch 48');

source = replaceRequired(
  source,
  'Oslo-tabellen inneholder nå 188 verifiserte eller kildekontrollerte canonical steder. Batch 45 legger til Kunstnernes Hus, Vigelandmuseet og Møllergata skole med entydige offisielle Geonorge-adressepunkter og parent-modeller som hindrer duplikatmarkører for Vigelandsparken og Oslo Skolemuseum. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo-tabellen inneholder nå 190 verifiserte eller kildekontrollerte canonical steder. Batch 47 løser Lilleborg Fabrikker med dokumentert fabrikkport som fysisk inngangsanker og korrigert tidslinje. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 37.',
  'current Oslo summary anchor'
);
source = replaceRequired(
  source,
  'Oslo-tabellen inneholder nå 191 verifiserte eller kildekontrollerte canonical steder. Batch 48 legger til TBS Gallery, The Viking Planet Oslo og The Salmon kunnskapssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt avgrensede institusjonsidentiteter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo-tabellen inneholder nå 193 verifiserte eller kildekontrollerte canonical steder. Batch 48 legger til TBS Gallery, The Viking Planet Oslo og The Salmon kunnskapssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt avgrensede institusjonsidentiteter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 37.',
  'new Oslo summary'
);

source = replaceRequired(
  source,
  '| 45 | `mollergata_skole` | Møllergata skole | verified | `geonorge-adresser-v1:0301:14943:49` |',
  '| 47 | `lilleborg_fabrikker` | Lilleborg Fabrikker | verified | `geonorge-adresser-v1:0301:16161:54` |',
  'current batch row anchor'
);
source = source
  .split('| 46 | `tbs_gallery` |').join('| 48 | `tbs_gallery` |')
  .split('| 46 | `viking_planet_oslo` |').join('| 48 | `viking_planet_oslo` |')
  .split('| 46 | `the_salmon_vitensenter` |').join('| 48 | `the_salmon_vitensenter` |');

const oldBatch45Note = 'Batch 45 (2026-07-20) legger til tre fysisk avklarte institusjonssteder fra den lukkede museumsauditen. `kunstnernes_hus` bruker Wergelandsveien 17 som eget kunstinstitusjonsbygg. `vigelandmuseet` bruker Nobels gate 32 som atelier-, bolig- og museumsbygning og holdes separat fra det større parkankeret `vigelandsparken`. `mollergata_skole` bruker Møllergata 49 som canonical skolekompleks, mens Oslo Skolemuseum modelleres som institusjonslag i bygg D i stedet for en separat overlappende markør.';
const currentBatch47Note = 'Batch 47 (2026-07-20) løser `lilleborg_fabrikker` ved å skille selskaps- og produksjonstidslinjen og bruke den dokumenterte fabrikkporten i Sandakerveien 54 som eksplisitt inngangs-/displayanker for det historiske fabrikkomplekset. A/S Lilleborg Fabriker ble grunnlagt i 1897; 1833 gjelder oljemøllen og 1842 såpefabrikken i forhistorien. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:16161:54` representerer fabrikkporten, ikke det geometriske sentrum av det delvis revne og transformerte industriområdet.';
source = replaceRequired(source, oldBatch45Note, currentBatch47Note, 'current batch note anchor');

source = replaceRequired(
  source,
  'Disse kontrollene er fullført, men teller ikke blant de 188 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 190 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'current needs-review count reference'
);
source = replaceRequired(
  source,
  'Disse kontrollene er fullført, men teller ikke blant de 191 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 193 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'new needs-review count reference'
);

fs.writeFileSync(abs(RUNTIME_PATH), source);
try {
  await import(`${pathToFileURL(abs(RUNTIME_PATH)).href}?run=${Date.now()}`);
} finally {
  if (fs.existsSync(abs(RUNTIME_PATH))) fs.unlinkSync(abs(RUNTIME_PATH));
}
