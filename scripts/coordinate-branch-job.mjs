#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const source = execFileSync('git', ['show', 'HEAD^:scripts/coordinate-branch-job.mjs'], { encoding: 'utf8' });
const oldLine = "if (waterfallNodesOnRiver.length !== 3) throw new Error(`Forventet nøyaktig tre waterfall-noder i systemintervallet; fant ${waterfallNodesOnRiver.length}`);";
if (!source.includes(oldLine)) throw new Error('Fant ikke forventet waterfall-count-sjekk i forrige batch-163-script');
const newLine = "if (waterfallNodesOnRiver.length !== 3) throw new Error(`Forventet nøyaktig tre waterfall-noder i systemintervallet; fant ${waterfallNodesOnRiver.length}: ${waterfallNodesOnRiver.map((row) => `${row.nodeId}@${row.node.lat},${row.node.lon}`).join(' | ')}`);";
const patched = source.replace(oldLine, newLine);
const tempFile = path.join(os.tmpdir(), `history-go-batch-163-diagnostic-${process.pid}.mjs`);
fs.writeFileSync(tempFile, patched);
await import(`${pathToFileURL(tempFile).href}?v=${Date.now()}`);
