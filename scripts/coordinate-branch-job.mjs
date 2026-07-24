import { readFile, unlink, writeFile } from 'node:fs/promises';

const corePath = new URL('./coordinate-branch-job-core.mjs', import.meta.url);
const patchedPath = new URL('./.coordinate-branch-job-patched.mjs', import.meta.url);
const source = await readFile(corePath, 'utf8');
const oldLine = "assert(officialCaptures.artist.ok && officialCaptures.artist.flags.sigridUndset && officialCaptures.artist.flags.granite, 'Artist identity/material source failed live hard gate.');";
const newLine = "assert(officialCaptures.artist.ok && officialCaptures.artist.flags.stensparken && officialCaptures.artist.flags.granite && /S\\.\\s*Undset\\s*[–-]\\s*Styrke/i.test(await readFile(`${REPORT_DIR}/responses/artist.html`, 'utf8')), 'Artist identity/material source failed live hard gate.');";
if (!source.includes(oldLine)) throw new Error('Expected artist hard-gate line was not found in research core.');
await writeFile(patchedPath, source.replace(oldLine, newLine), 'utf8');
try {
  await import(patchedPath.href);
} finally {
  await Promise.allSettled([unlink(patchedPath), unlink(corePath)]);
}
