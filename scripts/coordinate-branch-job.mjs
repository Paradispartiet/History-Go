import { promises as fs } from 'node:fs';
import { pathToFileURL } from 'node:url';

const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/c7180a72cc3a279088b7ba4434ce0ff25645abbf/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Could not fetch original Etne nature batch script: HTTP ${response.status}`);
const original = await response.text();
const fixed = original.replaceAll('coordinate.folgefonna_nasjonalpark_etne', 'coordinate.folgefonnanasjonalpark_etne');
if (fixed === original) throw new Error('Expected Folgefonna key mismatch was not found in original batch script');
const tempPath = '/tmp/etne-natur-batch-2-fixed.mjs';
await fs.writeFile(tempPath, fixed, 'utf8');
await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
