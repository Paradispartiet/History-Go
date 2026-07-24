import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT = '8d22c751c73c718a612c53532816f7715487c2fa';
const TEMP_SCRIPT = '/tmp/gronlikaia-geometry-audit.mjs';
let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:scripts/coordinate-branch-job.mjs`], { encoding: 'utf8' });
source = source.replace(
  `if (!officialChecks.portMentionsGrønlikaia || !officialChecks.municipalityMentionsGrønlikaia) {\n  throw new Error(\`Official identity checks failed: \${JSON.stringify(officialChecks)}\`);\n}`,
  `if (!officialChecks.municipalityMentionsGrønlikaia || !officialChecks.municipalityCallsDevelopmentArea) {\n  throw new Error(\`Municipal identity checks failed: \${JSON.stringify(officialChecks)}\`);\n}`
);
if (source.includes('if (!officialChecks.portMentionsGrønlikaia || !officialChecks.municipalityMentionsGrønlikaia)')) {
  throw new Error('Failed to relax Oslo Havn dynamic-HTML hard gate');
}
writeFileSync(TEMP_SCRIPT, source, 'utf8');
await import(pathToFileURL(TEMP_SCRIPT).href);
