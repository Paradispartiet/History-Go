import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_BRANCH = 'agent/oslo-attractions-brannmuseet-production-batch-56';
execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
let source = execFileSync('git', ['show', `FETCH_HEAD:scripts/coordinate-branch-job.mjs`], { encoding: 'utf8' });

const replacements = [
  [
    'Oslo-tabellen inneholder nå 201 verifiserte eller kildekontrollerte canonical steder. Batch 55 legger til Holmlia bad som et eget kommunalt svømme- og idrettsanlegg på det verifiserte Holmlia Senter vei 34-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 32.',
    'Oslo-tabellen inneholder nå 202 verifiserte eller kildekontrollerte canonical steder. Siste kontroll avgrenset `oslo_kraftselskap` til Oslo Lysverkers hovedkontor i Sommerrogata 1 og verifiserte bygget med Geonorge-adressepunkt. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 31.'
  ],
  [
    'Oslo-tabellen inneholder nå 202 verifiserte eller kildekontrollerte canonical steder. Batch 56 legger til Brannmuseet i Oslo i den tidligere Grønland brannstasjon på det verifiserte Grønlandsleiret 32-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 32.',
    'Oslo-tabellen inneholder nå 203 verifiserte eller kildekontrollerte canonical steder. Batch 56 legger til Brannmuseet i Oslo i den tidligere Grønland brannstasjon på det verifiserte Grønlandsleiret 32-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 31.'
  ],
  [
    'Disse kontrollene er fullført, men teller ikke blant de 201 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
    'Disse kontrollene er fullført, men teller ikke blant de 202 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
  ],
  [
    'Disse kontrollene er fullført, men teller ikke blant de 202 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
    'Disse kontrollene er fullført, men teller ikke blant de 203 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
  ]
];

for (const [before, after] of replacements) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one source replacement for: ${before.slice(0, 80)}; found ${count}`);
  source = source.replace(before, after);
}

const tempFile = path.join(os.tmpdir(), `brannmuseet-batch56-${process.pid}.mjs`);
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?v=${Date.now()}`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
