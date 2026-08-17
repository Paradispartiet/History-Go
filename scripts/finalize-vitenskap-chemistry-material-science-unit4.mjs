#!/usr/bin/env node
import fs from 'node:fs';
const read=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const assert=(c,m)=>{if(!c)throw new Error(m)};
const replaceOnce=(file,from,to)=>{const s=fs.readFileSync(file,'utf8');assert(s.includes(from),`Mangler forventet tekst i ${file}: ${from.slice(0,100)}`);const n=s.replace(from,to);assert(n!==s,`Ingen endring i ${file}`);fs.writeFileSync(file,n)};
const chapterId='vitenskap-kjemi-fra-atomstruktur-til-materialegenskap';
const chapterFile='data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap.json';
const readinessPath='data/fag/vitenskap/vitenskap_university_readiness_v1.json';
const registryPath='data/fagverk/fagverk_registry.json';
const readiness=read(readinessPath), registry=read(registryPath), subject=registry.subjects?.vitenskap;
assert(readiness.complete_ready===false,'Vitenskap må være incomplete før Unit 4');
assert(readiness.current_inventory?.vitenskap?.registered_chapter_count===3,'Forventet 3 kapitler før Unit 4');
assert(JSON.stringify(readiness.editorial_blockers)===JSON.stringify(['chemistry_material_science','medicine_biomedicine_public_health']),'Uventet blocker-state før Unit 4');
const chemistry=readiness.coverage_families.find((r)=>r.id==='chemistry_material_science');
assert(chemistry?.status==='inventory_reconciled','Kjemi må være inventory_reconciled før Unit 4');
assert(Array.isArray(subject?.chapters)&&subject.chapters.length===3,'Registry må ha tre Vitenskap-kapitler før Unit 4');
assert(!subject.chapters.some((r)=>r.id===chapterId),'Unit 4 finnes allerede i registry');
assert(fs.existsSync(chapterFile),'Mangler Unit 4 chapter root');
subject.chapters.push({
  id:chapterId,
  title:'Kjemi fra atomstruktur til materialegenskap',
  subtitle:'Fra periodiske mønstre og binding til reaksjonsregnskap, termodynamikk, kinetikk, analytiske signaler og materialkarakterisering – med prøve, instrument og modell synlige i hele evidenskjeden',
  file:chapterFile,
  primary_domain_id:'natur_medisin_miljo',
  chapter_role:'core',
  emne_ids:['em_vit_atomstruktur_og_periodesystem','em_vit_kjemiske_bindinger_og_struktur','em_vit_reaksjoner_stokiometri_og_likevekt','em_vit_kjemisk_termodynamikk_og_kinetikk','em_vit_analytisk_kjemi_og_spektroskopi','em_vit_materialkjemi_og_egenskaper'],
  claimsFile:'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap/claims.json',
  briefFile:'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap/brief.json'
});
readiness.current_inventory.vitenskap.registered_chapter_count=4;
readiness.editorial_blockers=['medicine_biomedicine_public_health'];
chemistry.status='chapter_materialized';
chemistry.reason='Canonical inventory v4.6 dekker seks eksplisitte kjemi- og materialvitenskapsemner. Familien er nå fulltekstmaterialisert i tre redigerte moduler med claimsporing, worked examples, anvendelsesoppgaver og eksplisitte skiller mellom reaksjonsregnskap og mekanisme, termodynamikk og kinetikk, prøve/signal/slutning og sammensetning/mikrostruktur/materialegenskap. Dette lukker kjemi og materialvitenskap som editorial blocker, men gjør ikke Vitenskap complete fordi medisin, biomedisin og folkehelse fortsatt gjenstår.';
chemistry.materialized_chapter_id=chapterId;
chemistry.materialized_evidence={method_count:8,module_count:3,section_count:9,paragraph_count:27,source_count:12,claim_count:20};
write(readinessPath,readiness);write(registryPath,registry);

replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"const EDITORIAL_BLOCKERS = [\n  'chemistry_material_science',\n  'medicine_biomedicine_public_health'\n];","const EDITORIAL_BLOCKERS = [\n  'medicine_biomedicine_public_health'\n];");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.inventory.vitenskap.registered_chapter_count, 3);","assert.equal(report.inventory.vitenskap.registered_chapter_count, 4);");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"    inventory_reconciled: 2,\n    chapter_materialized: 2,","    inventory_reconciled: 1,\n    chapter_materialized: 3,");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.coverageSummary.editorialBlockerCount, 2);","assert.equal(report.coverageSummary.editorialBlockerCount, 1);");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.coverageSummary.materializedBreadthFamilyCount, 2);","assert.equal(report.coverageSummary.materializedBreadthFamilyCount, 3);");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"    { id: 'physics_astronomy', chapterId: 'vitenskap-fysikk-fra-bevegelse-til-kosmos' }\n  ]);","    { id: 'physics_astronomy', chapterId: 'vitenskap-fysikk-fra-bevegelse-til-kosmos' },\n    { id: 'chemistry_material_science', chapterId: 'vitenskap-kjemi-fra-atomstruktur-til-materialegenskap' }\n  ]);");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.registration.registryChapterCount, 3);","assert.equal(report.registration.registryChapterCount, 4);");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.registration.releaseChapterCount, 3);","assert.equal(report.registration.releaseChapterCount, 4);");
replaceOnce('tests/fagverk-vitenskap-university-readiness.test.mjs',"test('matematikk er materialisert mens tre realfagsfamilier fortsatt blokkerer editorial completion', () => {","test('matematikk, fysikk og kjemi er materialisert mens medisin fortsatt blokkerer editorial completion', () => {");

const workflow='.github/workflows/fagverk-vitenskap-pilot.yml';
const scriptBrief="      - 'scripts/audit-fagverk-vitenskap-chemistry-material-science-source-brief.mjs'";
const scriptFull="      - 'scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs'";
replaceOnce(workflow,scriptBrief,`${scriptBrief}\n${scriptFull}`);
replaceOnce(workflow,scriptBrief,`${scriptBrief}\n${scriptFull}`);
const testBrief="      - 'tests/fagverk-vitenskap-chemistry-material-science-source-brief.test.mjs'";
const testFull="      - 'tests/fagverk-vitenskap-chemistry-material-science-fulltext.test.mjs'";
replaceOnce(workflow,testBrief,`${testBrief}\n${testFull}`);
replaceOnce(workflow,testBrief,`${testBrief}\n${testFull}`);
replaceOnce(workflow,"          node --check scripts/audit-fagverk-vitenskap-chemistry-material-science-source-brief.mjs","          node --check scripts/audit-fagverk-vitenskap-chemistry-material-science-source-brief.mjs\n          node --check scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs");
replaceOnce(workflow,"      - name: Validate release manifest remains deterministic",`      - name: Validate Vitenskap Unit 4 chemistry material science fulltext\n        shell: bash\n        run: |\n          set +e\n          output=$(node scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs 2>&1)\n          status=$?\n          set -e\n          if [ \"$status\" -ne 0 ]; then\n            message=$(printf '%s' \"$output\" | tail -n 12 | tr '\\n' ' ' | sed 's/%/%25/g; s/\\r/%0D/g; s/\\n/%0A/g')\n            echo \"::error file=scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs,title=Vitenskap chemistry material science fulltext audit failed::$message\"\n            printf '%s\\n' \"$output\"\n            exit \"$status\"\n          fi\n          printf '%s\\n' \"$output\"\n      - name: Validate release manifest remains deterministic`);
replaceOnce(workflow,"          node --test tests/fagverk-vitenskap-chemistry-material-science-source-brief.test.mjs","          node --test tests/fagverk-vitenskap-chemistry-material-science-source-brief.test.mjs\n          node --test tests/fagverk-vitenskap-chemistry-material-science-fulltext.test.mjs");
console.log('Vitenskap Unit 4 state transition prepared');
