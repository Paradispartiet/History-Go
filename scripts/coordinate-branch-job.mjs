import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const ORIGINAL_PRODUCTION_BLOB = '8875053729cfade607988359c2e319b29cd77e9c';

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Could not locate ${label} in pinned production script.`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`Found duplicate ${label} in pinned production script.`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const original = spawnSync('git', ['cat-file', '-p', ORIGINAL_PRODUCTION_BLOB], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});
if (original.status !== 0 || !original.stdout) {
  throw new Error(`Could not load pinned batch-194 production blob ${ORIGINAL_PRODUCTION_BLOB}: ${original.stderr || original.status}`);
}

let script = original.stdout;
script = replaceOnce(
  script,
  "import { createHash } from 'node:crypto';",
  "import { spawnSync } from 'node:child_process';\nimport { createHash } from 'node:crypto';",
  'crypto import',
);
script = replaceOnce(
  script,
  "const governmentDecisionUrl = 'https://www.regjeringen.no/no/dokumenter/vedtak-av-statlig-reguleringsplan-for-nytt-regjeringskvartal/id2538263/';",
  "const governmentDecisionUrl = 'https://www.regjeringen.no/contentassets/0d818c1beaa54b8f94671cc598c225ef/vedtak_statlig_reguleringsplan_rkv.pdf';",
  'government decision URL',
);
script = replaceOnce(
  script,
  "const governmentHtml = await fetchText(governmentDecisionUrl);\nconst governmentText = normalizeText(governmentHtml);",
  `const governmentPdfResponse = await fetch(governmentDecisionUrl, {\n  headers: {\n    'user-agent': 'History-Go coordinate production/1.0',\n    accept: 'application/pdf,*/*;q=0.8',\n  },\n});\nassert(governmentPdfResponse.ok, \`Official decision PDF fetch failed \${governmentPdfResponse.status} \${governmentPdfResponse.statusText}: \${governmentDecisionUrl}\`);\nconst governmentPdfBuffer = Buffer.from(await governmentPdfResponse.arrayBuffer());\nassert(governmentPdfBuffer.subarray(0, 4).toString('ascii') === '%PDF', 'Official government decision response is not a PDF.');\nlet governmentPdfText = '';\nconst extractionAttempts = [\n  { command: 'pdftotext', args: ['-layout', '-', '-'] },\n  { command: 'mutool', args: ['draw', '-F', 'txt', '-o', '-', '-'] },\n];\nconst extractionErrors = [];\nfor (const attempt of extractionAttempts) {\n  const result = spawnSync(attempt.command, attempt.args, {\n    input: governmentPdfBuffer,\n    encoding: 'utf8',\n    maxBuffer: 20 * 1024 * 1024,\n  });\n  if (result.status === 0 && result.stdout?.trim()) {\n    governmentPdfText = result.stdout;\n    break;\n  }\n  extractionErrors.push({ command: attempt.command, status: result.status, error: result.error?.message || '', stderr: result.stderr || '' });\n}\nassert(governmentPdfText, \`Could not extract text from official decision PDF: \${JSON.stringify(extractionErrors)}\`);\nconst governmentHtml = governmentPdfText;\nconst governmentText = governmentPdfText.replace(/\\s+/g, ' ').trim();`,
  'government HTML identity gate',
);

const temporaryScript = '/tmp/history-go-regjeringskvartalet-batch-194-production.mjs';
writeFileSync(temporaryScript, script, 'utf8');
const run = spawnSync(process.execPath, [temporaryScript], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd(),
});
if (run.error) throw run.error;
if (run.status !== 0) process.exit(run.status ?? 1);
