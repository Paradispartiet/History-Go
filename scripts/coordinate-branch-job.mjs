#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
// HEAD~3 is the original full batch-133 implementation. The next two commits were
// a URLSearchParams typo wrapper and an evidence diagnostic wrapper.
let implementation = execFileSync('git', ['show', 'HEAD~3:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const paramFrom = "  nummer,\n  kommunenummer: municipality,";
const paramTo = "  nummer: number,\n  kommunenummer: municipality,";
if (!implementation.includes(paramFrom)) throw new Error('Fant ikke Club 7 URLSearchParams-feilen');
implementation = implementation.replace(paramFrom, paramTo);

// Contract v1 requires historic_site to use a historical source provider as the primary
// contract identity. Sceneweb resolves the represented 1971–1985 occupancy; the structured
// Munkedamsveien 15 address and Geonorge point remain the exact physical coordinate basis.
implementation = implementation.replace(
  "  sourceProvider: 'official_address',\n  sourceObjectId,",
  "  sourceProvider: 'manual_research',\n  sourceObjectId: 'sceneweb-organisation:39671:club7-munkedamsveien15-1971-1985',"
);
implementation = implementation.replace(
  "  coordSource: 'Geonorge Adresser API v1 – Munkedamsveien 15; historical occupancy documented by Sceneweb and Oslo byleksikon',\n  coordSourceId: sourceObjectId,\n  coordSourceUrl: geonorgeUrl,",
  "  coordSource: 'Sceneweb + Oslo byleksikon – Club 7 at Munkedamsveien 15, 1971–1985; exact physical address point from Geonorge Adresser API v1',\n  coordSourceId: 'sceneweb-organisation:39671:club7-munkedamsveien15-1971-1985',\n  coordSourceUrl: scenewebUrl,"
);

const tmp = path.join(root, 'scripts/.coordinate-batch-133-production.tmp.mjs');
fs.writeFileSync(tmp, implementation);
try {
  await import(pathToFileURL(tmp).href + `?run=${Date.now()}`);
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
