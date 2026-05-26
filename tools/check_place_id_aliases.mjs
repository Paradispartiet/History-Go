import fs from 'fs';import path from 'path';
const aliases={sagene_film:'sagene',kampen_film:'kampen',psykologirommet_oslo:'psykologisk_institutt_uio'};
const root=process.cwd();const targets=['data/i18n/content/places','data/leksikon','data/places','data/quiz'];
function walk(d){if(!fs.existsSync(d))return [];return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.json')?[path.join(d,e.name)]:[])}
let bad=0;for(const f of targets.flatMap(t=>walk(path.join(root,t)))){const txt=fs.readFileSync(f,'utf8');for(const [oldId,newId] of Object.entries(aliases)){if(txt.includes(`"${oldId}"`)){bad++;console.error(`${path.relative(root,f)} references legacy place id ${oldId} (canonical: ${newId})`);}}}
if(bad) process.exit(1);console.log('OK: no legacy place IDs found in checked JSON data.');
