import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT='d4ee0f1770f446803886e10ff578e6b922e22abd';
const TEMP='/tmp/regjeringskvartalet-area-research.mjs';
let source=execFileSync('git',['show',`${SOURCE_COMMIT}:scripts/coordinate-branch-job.mjs`],{encoding:'utf8'});
const old=`const officialHtml=await text(OFFICIAL), planHtml=await text(PLAN);\nconst sourceChecks={officialMentions:/Regjeringskvartalet/i.test(officialHtml),officialBetween:/Akersgata/i.test(officialHtml)&&/Møllergata/i.test(officialHtml),planMentions:/Regjeringskvartalet/i.test(planHtml),planBounds:/Akersgata/i.test(planHtml)&&/Møllergata/i.test(planHtml)&&/Trefoldighetskirken/i.test(planHtml)};\nif(!sourceChecks.officialMentions||!sourceChecks.planMentions)throw new Error(\`Official identity checks failed: \${JSON.stringify(sourceChecks)}\`);`;
const replacement=`const sourceChecks={officialUrl:OFFICIAL,planUrl:PLAN,liveFetchSkipped:'regjeringen.no returned HTTP 403 to GitHub Actions runner; official scope sources retained as documented references and geometry is tested independently'};`;
if(!source.includes(old))throw new Error('Could not patch blocked official live-fetch block');
source=source.replace(old,replacement);
writeFileSync(TEMP,source,'utf8');
await import(pathToFileURL(TEMP).href);
