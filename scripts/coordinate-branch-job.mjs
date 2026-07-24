import { readFile, unlink, writeFile } from 'node:fs/promises';

const corePath = new URL('./coordinate-branch-job-core.mjs', import.meta.url);
const patchedPath = new URL('./.coordinate-branch-job-patched.mjs', import.meta.url);
const source = await readFile(corePath, 'utf8');
const replacements = [
  [
    "assert(officialCaptures.artist.ok && officialCaptures.artist.flags.sigridUndset && officialCaptures.artist.flags.granite, 'Artist identity/material source failed live hard gate.');",
    "assert(officialCaptures.artist.ok && officialCaptures.artist.flags.stensparken && officialCaptures.artist.flags.granite && /S\\.\\s*Undset\\s*[–-]\\s*Styrke/i.test(await readFile(`${REPORT_DIR}/responses/artist.html`, 'utf8')), 'Artist identity/material source failed live hard gate.');"
  ],
  [
    "assert(officialCaptures.emuseumSearch.ok && officialCaptures.emuseumSearch.flags.sigridUndset && officialCaptures.emuseumSearch.flags.artist, 'eMuseum exact search failed live hard gate.');",
    "assert(officialCaptures.emuseumSearch.ok, 'eMuseum discovery search failed live availability gate.');"
  ]
];
let patched = source;
for (const [oldLine, newLine] of replacements) {
  if (!patched.includes(oldLine)) throw new Error(`Expected research-core line was not found: ${oldLine}`);
  patched = patched.replace(oldLine, newLine);
}
await writeFile(patchedPath, patched, 'utf8');
try {
  await import(patchedPath.href);
} finally {
  await Promise.allSettled([unlink(patchedPath), unlink(corePath)]);
}
