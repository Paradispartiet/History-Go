import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const original = fs.readFileSync(new URL('./coordinate-branch-job.mjs.parent', import.meta.url), 'utf8');
