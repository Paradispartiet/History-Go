import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SOURCE_COMMIT='20ab4addfc1a7f5bd476f1333353ce1be3df4aa9';
const TEMP='/tmp/tjernsmyr-batch-193.mjs';
let source=execFileSync('git',['show',`${SOURCE_COMMIT}:scripts/coordinate-branch-job.mjs`],{encoding:'utf8'});
source=source.replace(
  `const OVERPASS='https://overpass.kumi.systems/api/interpreter';`,
  `const OVERPASS_ENDPOINTS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.nchc.org.tw/api/interpreter'];`
);
source=source.replace(
  `const raw=await fetchText(OVERPASS,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}).toString()});`,
  `let raw=null,lastOverpassError=null,overpassEndpoint=null;\nfor(const endpoint of OVERPASS_ENDPOINTS){\n  try{raw=await fetchText(endpoint,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query}).toString()});overpassEndpoint=endpoint;break;}catch(error){lastOverpassError=error;}\n}\nif(raw==null)throw lastOverpassError||new Error('All Overpass endpoints failed');`
);
source=source.replace(
  `liveTags:way.tags,geometryPointCount:geometry.length,exactNameDuplicateCount:nameDup.length,nearestCanonicalBeforeWrite:nearby[0]||null,civicationUpdates,updatedCiviFiles,`,
  `liveTags:way.tags,overpassEndpoint,geometryPointCount:geometry.length,exactNameDuplicateCount:nameDup.length,nearestCanonicalBeforeWrite:nearby[0]||null,civicationUpdates:civiUpdates,updatedCiviFiles,`
);
if(source.includes(`const OVERPASS='https://overpass.kumi.systems/api/interpreter';`))throw new Error('Failed to install Overpass fallback endpoints');
if(source.includes(`const raw=await fetchText(OVERPASS,`))throw new Error('Failed to patch exact-way Overpass fetch');
if(source.includes(`nearestCanonicalBeforeWrite:nearby[0]||null,civicationUpdates,updatedCiviFiles`))throw new Error('Failed to fix Civication report variable');
writeFileSync(TEMP,source,'utf8');
await import(pathToFileURL(TEMP).href);
