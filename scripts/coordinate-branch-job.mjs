import { promises as fs } from 'node:fs';
import { pathToFileURL } from 'node:url';

const templateUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/c7180a72cc3a279088b7ba4434ce0ff25645abbf/scripts/coordinate-branch-job.mjs';
const batchSourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/71cced5e636483cf766f9f7e396a5f4ccc9107c6/scripts/coordinate-branch-job.mjs';

const [templateResponse, batchResponse] = await Promise.all([fetch(templateUrl), fetch(batchSourceUrl)]);
if (!templateResponse.ok) throw new Error(`Could not fetch Etne nature runner template: HTTP ${templateResponse.status}`);
if (!batchResponse.ok) throw new Error(`Could not fetch committed Etne nature batch 3 source: HTTP ${batchResponse.status}`);

const template = await templateResponse.text();
const batchSource = await batchResponse.text();
const prefixMarker = 'const coordinate = {};';
const prefixIndex = template.indexOf(prefixMarker);
if (prefixIndex < 0) throw new Error('Could not locate coordinate body marker in Etne nature runner template');
const prefix = template.slice(0, prefixIndex).replaceAll("'etne-natur-batch-2'", "'etne-natur-batch-3'");

const bodyStartMarker = 'const body = String.raw`\n';
const bodyEndMarker = '\n`;\n\nconst tempPath';
const bodyStart = batchSource.indexOf(bodyStartMarker);
const bodyEnd = batchSource.lastIndexOf(bodyEndMarker);
if (bodyStart < 0 || bodyEnd < 0 || bodyEnd <= bodyStart) throw new Error('Could not extract committed Etne nature batch 3 body');
const body = batchSource.slice(bodyStart + bodyStartMarker.length, bodyEnd);

const tempPath = '/tmp/etne-natur-batch-3-fixed.mjs';
await fs.writeFile(tempPath, `${prefix}${body}`, 'utf8');
await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
