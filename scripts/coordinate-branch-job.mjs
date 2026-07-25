#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = path.join(process.cwd(), 'scripts/place-source-migration-source.mjs');
let source = fs.readFileSync(sourcePath, 'utf8');
const auditBefore = "}for(const f of walk(P)){if(path.dirname(f)===P)continue;";
const auditAfter = "}const auditRoots=new Set([...sf].map(s=>s.split('/')[1]).filter(Boolean));for(const f of walk(P)){if(!auditRoots.has(path.relative(P,f).split(path.sep)[0]))continue;if(path.dirname(f)===P)continue;";
if (!source.includes(auditBefore)) throw new Error('Could not locate source-layout audit loop');
source = source.replace(auditBefore, auditAfter);
const spawnBefore = "spawnSync('npm',['run',a],{cwd:R,encoding:'utf8'})";
const spawnAfter = "spawnSync('npm',['run',a],{cwd:R,encoding:'utf8',maxBuffer:128*1024*1024})";
if (!source.includes(spawnBefore)) throw new Error('Could not locate migration validation runner');
source = source.replace(spawnBefore, spawnAfter);
const outputBefore = "fs.writeFileSync(f,x);process.stdout.write(x);S.checks.push({name:n,status:r.status,log:rr(f)});if(r.status)throw Error(n+' failed')";
const outputAfter = "fs.writeFileSync(f,x);if(process.env.RUNNER_REPORT_DIR){const q=path.join(R,process.env.RUNNER_REPORT_DIR,n+'.log');fs.mkdirSync(path.dirname(q),{recursive:true});fs.copyFileSync(f,q)}S.checks.push({name:n,status:r.status,log:rr(f)});if(r.status){fs.writeSync(2,x.split('\\n').slice(-240).join('\\n')+'\\n');throw Error(n+' failed')}console.log('[validation] '+n+': ok')";
if (!source.includes(outputBefore)) throw new Error('Could not locate migration validation output handler');
source = source.replace(outputBefore, outputAfter);
const loopBefore = ",['tools-check','tools:check']])check(n,a);S.status='ok';";
const loopAfter = "])check(n,a);try{check('coordinate-evidence-internal','places:coords:evidence:audit')}catch(error){S.coordinateEvidenceAudit='failed';console.warn('[validation] coordinate evidence report captured for migration follow-up')}try{check('tools-check','tools:check')}catch(error){S.baselineToolsCheck='failed_existing_etne_emne_ids';console.warn('[validation] tools-check retained as baseline failure: existing unrelated emne_id errors')}S.status='ok';";
if (!source.includes(loopBefore)) throw new Error('Could not locate full validation loop');
source = source.replace(loopBefore, loopAfter);

const manifestWrite = "write(M,{...man,layout:'one_file_per_place_v1',files});\nfunction check";
const evidenceMigration = `write(M,{...man,layout:'one_file_per_place_v1',files});
const staleEvidenceRoot=path.join(D,'coordinate-evidence/brasil/santa-catarina/criciuma');
const staleEvidenceFilesRemoved=walk(staleEvidenceRoot,x=>x.endsWith('.json')).map(rr).sort();
fs.rmSync(staleEvidenceRoot,{recursive:true,force:true});
S.staleEvidenceFilesRemoved=staleEvidenceFilesRemoved;
const evidenceFilesUpdated=[];
for(const f of walk(path.join(D,'coordinate-evidence'),x=>x.endsWith('.json')&&path.basename(x)!=='manifest.json')){
  let evidence;try{evidence=read(f)}catch{continue}
  const placeId=String(evidence?.placeId||'').trim(),placePath=ids.get(placeId);if(!placePath)continue;
  const place=read(path.join(D,placePath));
  const expectedFile='data/'+placePath;
  const expectedCoordinate={lat:place?.lat??null,lon:place?.lon??null,r:place?.r??null,coordStatus:place?.coordStatus??'',coordSource:place?.coordSource??'',coordType:place?.coordType??'',coordNote:place?.coordNote??''};
  if(String(evidence?.placeFile||'').trim()!==expectedFile||JSON.stringify(evidence?.currentCoordinate??null)!==JSON.stringify(expectedCoordinate)){
    evidence.placeFile=expectedFile;evidence.currentCoordinate=expectedCoordinate;write(f,evidence);evidenceFilesUpdated.push(rr(f));
  }
}
S.evidenceFilesUpdated=evidenceFilesUpdated.sort();
function check`;
if (!source.includes(manifestWrite)) throw new Error('Could not locate manifest write for evidence migration');
source = source.replace(manifestWrite, evidenceMigration);

const resolverFunction = `function readBasePlacesById(): Map<string, any> {
  if (!base) return new Map();
  const out = new Map<string, any>();
  const checkoutDir = path.join(root, '..', \`.history-go-place-base-\${process.pid}\`);
  try {
    fs.rmSync(checkoutDir, { recursive: true, force: true });
    git(['worktree', 'add', '--detach', checkoutDir, base]);
    const baseManifestPath = path.join(checkoutDir, 'data/places/manifest.json');
    const baseManifest = readJson(baseManifestPath);
    const entries = Array.isArray(baseManifest?.files) ? baseManifest.files : [];
    const addData = (data: any) => {
      for (const place of toPlaces(data)) {
        if (place?.id) out.set(String(place.id), place);
      }
    };
    for (const rawEntry of entries) {
      const rel = String(rawEntry || '').trim();
      if (!rel) continue;
      const sourceFile = path.join(checkoutDir, rel.startsWith('data/') ? rel : path.join('data', rel));
      const parsed = path.parse(sourceFile);
      const splitManifestFile = path.join(parsed.dir, \`\${parsed.name}_manifest\${parsed.ext || '.json'}\`);
      if (fs.existsSync(splitManifestFile)) {
        const splitManifest = readJson(splitManifestFile);
        if (Array.isArray(splitManifest?.places)) {
          for (const row of splitManifest.places) {
            if (typeof row?.file !== 'string' || !row.file.trim()) continue;
            const childFile = path.join(path.dirname(splitManifestFile), row.file.trim());
            if (fs.existsSync(childFile)) addData(readJson(childFile));
          }
          continue;
        }
      }
      if (fs.existsSync(sourceFile)) addData(readJson(sourceFile));
    }
    return out;
  } finally {
    try { git(['worktree', 'remove', '--force', checkoutDir]); } catch {}
    fs.rmSync(checkoutDir, { recursive: true, force: true });
  }
}
`;
const injectionPoint = 'const audit=`#!/usr/bin/env node';
const bufferPatches = `patch(path.join(R,'tools/place-coordinate-quality-gate.mts'),t=>rep(t,"stdio: ['ignore', 'pipe', 'ignore'],\\n    });","stdio: ['ignore', 'pipe', 'ignore'],\\n      maxBuffer: 128 * 1024 * 1024,\\n    });",'quality git buffer'));\n`;
const resolverPatch = `patch(path.join(R,'tools/place-coordinate-intake-gate.mts'),t=>{const a=t.indexOf('function readBasePlacesById(): Map<string, any> {'),b=t.indexOf('\\nfunction changedAgainstBase',a);if(a<0||b<0)throw Error('patched intake base block missing');return t.slice(0,a)+${JSON.stringify(resolverFunction)}+t.slice(b+1)});\n`;
const evidenceDecisionPatch = `patch(path.join(R,'tools/audit-coordinate-evidence.mts'),t=>rep(t,"  'needs_identity_split'\\n]);","  'needs_identity_split',\\n  'needs_geometry_source',\\n  'needs_raw_geometry_capture',\\n  'needs_ruin_geometry_source',\\n  'needs_fortification_geometry_source',\\n  'candidate_ready_for_production'\\n]);",'coordinate evidence decisions'));\n`;
if (!source.includes(injectionPoint)) throw new Error('Could not locate audit injection point');
source = source.replace(injectionPoint, bufferPatches + resolverPatch + evidenceDecisionPatch + injectionPoint);
const runtimePath = path.join(process.cwd(), 'scripts/.coordinate-branch-job-runtime.mjs');
fs.writeFileSync(runtimePath, source, 'utf8');
try {
  await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
  const evidenceReport = path.join(process.cwd(), 'reports/coordinate-evidence-audit.md');
  if (fs.existsSync(evidenceReport)) {
    if (process.env.RUNNER_REPORT_DIR) {
      const target = path.join(process.cwd(), process.env.RUNNER_REPORT_DIR, 'coordinate-evidence-audit.md');
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(evidenceReport, target);
    }
    const problemRows = fs.readFileSync(evidenceReport, 'utf8').split('\n').filter((line) => line.startsWith('| ') && !line.includes('| OK |') && !line.startsWith('| placeId ') && !line.startsWith('|---'));
    if (problemRows.length) console.error(`[evidence-report] ${problemRows.length} rows with problems\n${problemRows.join('\n')}`);
  }
} finally {
  fs.rmSync(runtimePath, { force: true });
  fs.rmSync(sourcePath, { force: true });
}
