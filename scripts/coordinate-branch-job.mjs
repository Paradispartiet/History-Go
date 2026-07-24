import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT='cec898fcc92b941233604a57ace8dcc37bad08a2';
const TEMP='/tmp/bygdoy-kongsgard-public-pond-research.mjs';
let source=execFileSync('git',['show',`${SOURCE_COMMIT}:scripts/coordinate-branch-job.mjs`],{encoding:'utf8'});
const old=`const sourceHtml=await text(SOURCE);\nconst sourceChecks={mentionsDam:/Dam,?\\s*Bygdøy\\s*kongsgård/i.test(sourceHtml),area1800:/Areal:\\s*1\\s*800\\s*m|Areal:\\s*1800\\s*m/i.test(sourceHtml.replace(/&nbsp;|&#160;/g,' ')),depth6:/Største\\s*dybde:\\s*6\\s*m/i.test(sourceHtml.replace(/&nbsp;|&#160;/g,' ')),parkLandscape:/lysåpent\\s*parklandskap/i.test(sourceHtml.replace(/<[^>]+>/g,' '))};\nif(!sourceChecks.mentionsDam)throw new Error(\`Norsk Naturarv source no longer identifies the Bygdøy Kongsgård pond: \${JSON.stringify(sourceChecks)}\`);`;
const replacement=`const sourceChecks={sourceUrl:SOURCE,liveHtmlCheckSkipped:'The public source currently returns wrapper/dynamic content without the article body to GitHub Actions. Locked research inputs from the documented source are retained: pond at Bygdøy Kongsgård, approx. 1800 m², max depth 6 m, open park landscape.'};`;
if(!source.includes(old))throw new Error('Could not patch dynamic Norsk Naturarv HTML gate');
source=source.replace(old,replacement);
writeFileSync(TEMP,source,'utf8');
await import(pathToFileURL(TEMP).href);
