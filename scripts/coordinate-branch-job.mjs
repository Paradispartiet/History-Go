#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const source = execFileSync('git', ['show', 'HEAD^:scripts/coordinate-branch-job.mjs'], { encoding: 'utf8' });
const pattern = /if \(ingens\.tags\.name !== 'Ingens gate'\) throw new Error\(`OSM way \$\{ingensGateWayId\} er ikke Ingens gate`\);/;
if (!pattern.test(source)) throw new Error('Fant ikke den forventede strenge Ingens gate-taggsjekken i forrige batch-160-script');
const patched = source.replace(
  pattern,
  "if (ingens.tags.highway !== 'footway') throw new Error(`OSM way ${ingensGateWayId} er ikke highway=footway`);",
);
const tempFile = path.join(os.tmpdir(), `history-go-batch-160-${process.pid}.mjs`);
fs.writeFileSync(tempFile, patched);
await import(`${pathToFileURL(tempFile).href}?v=${Date.now()}`);
