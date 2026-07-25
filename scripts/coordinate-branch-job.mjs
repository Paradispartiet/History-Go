import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const root = process.cwd();
const parts = [
  'scripts/.historie-v55-completion.gz.b64.00',
  'scripts/.historie-v55-completion.gz.b64.01',
  'scripts/.historie-v55-completion.gz.b64.02'
];

for (const relative of parts) {
  if (!fs.existsSync(path.join(root, relative))) throw new Error(`Missing payload part: ${relative}`);
}

const encoded = parts.map((relative) => fs.readFileSync(path.join(root, relative), 'utf8')).join('');
const sourceBuffer = zlib.gunzipSync(Buffer.from(encoded, 'base64'));
const digest = crypto.createHash('sha256').update(sourceBuffer).digest('hex');
const expected = 'a239a315a1b8311cd1f8afb3dc5486252d5182b198efa9f435d471d6fa96bcda';
if (digest !== expected) throw new Error(`Completion payload checksum mismatch: ${digest}`);

let source = sourceBuffer.toString('utf8');
const oldImport = "const qlib=await import('./quiz-production-lib.mjs');";
const newImport = "const qlib=await import('file://' + path.join(root,'scripts/quiz-production-lib.mjs'));";
if (!source.includes(oldImport)) throw new Error('Could not locate quiz production import in completion payload');
source = source.replace(oldImport, newImport);

const loopStart = "const hist=manifest.historie?.quizProduction?.targets||{};";
const loopEnd = "run('npm',['run','knowledge:canonical:check']);";
const startIndex = source.indexOf(loopStart);
const endIndex = source.indexOf(loopEnd);
if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) throw new Error('Could not locate production-context rebuild block');
const globalLoop = [
  "for(const [categoryId,entry] of Object.entries(manifest)){",
  "  const targets=entry?.quizProduction?.targets||{};",
  "  for(const [targetId,targetConfig] of Object.entries(targets)){",
  "    const output=qlib.resolveFagPath(root,targetConfig.context_artifact);",
  "    run(process.execPath,['scripts/build-quiz-production-context.mjs','--category',categoryId,'--target',targetId,'--output',output]);",
  "  }",
  "}",
  ""
].join('\n');
source = source.slice(0, startIndex) + globalLoop + source.slice(endIndex);
source = source.replace("'data/quiz/production_context/historie'", "'data/quiz/production_context'");

const target = path.join('/tmp', 'history-v5-5-completion-job.mjs');
fs.writeFileSync(target, source);
for (const relative of parts) fs.rmSync(path.join(root, relative));
await import(`file://${target}?v=${Date.now()}`);
