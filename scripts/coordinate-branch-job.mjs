#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
// HEAD~2 is the full structured-query production implementation. HEAD~1 is the
// diagnostic-only run that exposed Geonorge's decorated adressetekst value.
let implementation = execFileSync('git', ['show', 'HEAD~2:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const oldFilter = `  String(candidate?.bokstav ?? '').trim() === '' &&
  String(candidate?.kommunenummer ?? '').trim() === municipalityNumber &&
  norm(candidate?.adressetekst) === norm(\`${'${addressStreet} ${addressNumber}'}\`)
`;
const newFilter = `  String(candidate?.bokstav ?? '').trim() === '' &&
  String(candidate?.kommunenummer ?? '').trim() === municipalityNumber
`;
if (!implementation.includes(oldFilter)) throw new Error('Fant ikke structured exact-filteret som skulle patches');
implementation = implementation.replace(oldFilter, newFilter);

const oldDisplayTextGuard = `if (norm(hit?.adressetekst) !== norm(\`${'${addressStreet} ${addressNumber}'}\`)) throw new Error(\`Uventet Geonorge-adresse: ${'${hit?.adressetekst}'}\`);\n`;
const newDisplayTextGuard = `// adressetekst may include an official address additional name (here: "Skur 13, Filipstadveien 3").\n// Exactness is therefore enforced on adressenavn, nummer, bokstav and kommunenummer above, not on display text.\n`;
if (!implementation.includes(oldDisplayTextGuard)) throw new Error('Fant ikke adressetekst-guardet som skulle patches');
implementation = implementation.replace(oldDisplayTextGuard, newDisplayTextGuard);

const tmp = path.join(root, 'scripts/.coordinate-batch-129-production.tmp.mjs');
fs.writeFileSync(tmp, implementation);
try {
  await import(pathToFileURL(tmp).href + `?run=${Date.now()}`);
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
