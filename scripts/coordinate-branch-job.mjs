import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '84b2bcc8dda10ccb62e86cbec473c95ee5f3ecdf';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const TEMP_SCRIPT = '/tmp/akerhus-slott-duplicate-migration.mjs';

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], { encoding: 'utf8' });
const original = 'writeJson(AGGREGATE, filteredAggregate);';
const replacement = `const aggregateCollisions = [];\nconst normalizedAggregate = replaceExact(filteredAggregate, AGGREGATE, aggregateCollisions);\nif (aggregateCollisions.length) throw new Error(\`Exact-ID collisions remain in historie aggregate: \${JSON.stringify(aggregateCollisions)}\`);\nwriteJson(AGGREGATE, normalizedAggregate);`;
if (!source.includes(original)) throw new Error('Could not patch aggregate normalization into Akershus migration source');
source = source.replace(original, replacement);
fs.writeFileSync(TEMP_SCRIPT, source);
await import(pathToFileURL(TEMP_SCRIPT).href);
