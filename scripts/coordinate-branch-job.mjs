import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT='c32cf210764ccc213c78446e0fbea0cb14e8227c';
const TEMP='/tmp/regjeringskvartalet-wfs-area-research.mjs';
let source=execFileSync('git',['show',`${SOURCE_COMMIT}:scripts/coordinate-branch-job.mjs`],{encoding:'utf8'});
source=source.replace(
  `const capabilitiesUrl=\`${'${ENDPOINT}'}?\`+new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetCapabilities',version:'2.0.0');`,
  `const capabilitiesUrl=\`${'${ENDPOINT}'}?\`+new URLSearchParams({map:'REGTILLEGG',service:'WFS',request:'GetCapabilities',version:'2.0.0'});`
);
if(source.includes(`version:'2.0.0');\nconst caps=`))throw new Error('Failed to repair capabilities URL syntax');
writeFileSync(TEMP,source,'utf8');
await import(pathToFileURL(TEMP).href);
