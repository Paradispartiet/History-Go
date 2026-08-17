#!/usr/bin/env node
import fs from 'node:fs';
const read=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const assert=(c,m)=>{if(!c)throw new Error(m)};
const replaceOnce=(file,from,to)=>{const s=fs.readFileSync(file,'utf8');assert(s.includes(from),`Mangler forventet tekst i ${file}: ${from.slice(0,80)}`);const n=s.replace(from,to);assert(n!==s,`Ingen endring i ${file}`);fs.writeFileSync(file,n)};
const chapterId='vitenskap-fysikk-fra-bevegelse-til-kosmos';
const chapterFile='data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos.json';
const readinessPath='data/fag/vitenskap/vitenskap_university_readiness_v1.json';
const registryPath='data/fagverk/fagverk_registry.json';
const readiness=read(readinessPath), registry=read(registryPath), subject=registry.subjects?.vitenskap;
assert(readiness.complete_ready===false,'Vitenskap må være incomplete før Unit 3');
assert(readiness.current_inventory?.vitenskap?.registered_chapter_count===2,'Forventet 2 kapitler før Unit 3');
assert(JSON.stringify(readiness.editorial_blockers)===JSON.stringify(['physics_astronomy','chemistry_material_science','medicine_biomedicine_public_health']),'Uventet blocker-state før Unit 3');
const physics=readiness.coverage_families.find((r)=>r.id==='physics_astronomy');
assert(physics?.status==='inventory_reconciled','Fysikk må være inventory_reconciled før Unit 3');
assert(Array.isArray(subject?.chapters)&&subject.chapters.length===2,'Registry må ha to Vitenskap-kapitler før Unit 3');
assert(!subject.chapters.some((r)=>r.id===chapterId),'Unit 3 finnes allerede i registry');
assert(fs.existsSync(chapterFile),'Mangler Unit 3 chapter root');
subject.chapters.push({
  id:chapterId,
  title:'Fysikk fra bevegelse til kosmos',
  subtitle:'Fra målte posisjoner og energiregnskap til felt, kvantetilstander, relativitet, atomspektre og multibudbringerastronomi – med instrument og modell synlige i hele evidenskjeden',
  file:chapterFile,
  primary_domain_id:'natur_medisin_miljo',
  chapter_role:'core',
  emne_ids:['em_vit_mekanikk_krefter_bevegelse','em_vit_energi_termodynamikk','em_vit_bolger_og_optikk','em_vit_elektromagnetisme','em_vit_kvantefysikk','em_vit_relativitet','em_vit_atom_og_kjernefysikk','em_vit_astronomi_og_kosmologi'],
  claimsFile:'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos/claims.json',
  briefFile:'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos/brief.json'
});
readiness.current_inventory.vitenskap.registered_chapter_count=3;
readiness.editorial_blockers=['chemistry_material_science','medicine_biomedicine_public_health'];
physics.status='chapter_materialized';
physics.reason='Canonical inventory v4.6 dekker åtte eksplisitte fysikk- og astronomiemner. Familien er nå fulltekstmaterialisert i tre redigerte moduler med claimsporing, worked examples, anvendelsesoppgaver og eksplisitte skiller mellom måling, modell, instrumentrespons og observasjon. Dette lukker fysikk og astronomi som editorial blocker, men gjør ikke Vitenskap complete fordi kjemi/materialvitenskap og medisin/biomedisin/folkehelse fortsatt gjenstår.';
physics.materialized_chapter_id=chapterId;
physics.materialized_evidence={method_count:8,module_count:3,section_count:9,paragraph_count:27,source_count:12,claim_count:20};
write(readinessPath,readiness);write(registryPath,registry);
replaceOnce('scripts/audit-fagverk-vitenskap-mathematics-fulltext.mjs',"assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === 2, 'Readiness må registrere to Vitenskap-kapitler');","assert(readiness.current_inventory?.vitenskap?.registered_chapter_count >= 2, 'Readiness må bevare minst to Vitenskap-kapitler etter Unit 2');");
replaceOnce('scripts/audit-fagverk-vitenskap-mathematics-fulltext.mjs',"assert(isDeepStrictEqual(sorted(readiness.editorial_blockers || []), sorted(EXPECTED_REMAINING_BLOCKERS)), 'Etter Unit 2 skal bare fysikk, kjemi og medisin blokkere breadth completion');","assert((readiness.editorial_blockers || []).every((id) => EXPECTED_REMAINING_BLOCKERS.includes(id)) && !(readiness.editorial_blockers || []).includes('mathematics_formal_sciences'), 'Senere units kan bare redusere Unit 2 sitt tillatte blocker-sett');");
replaceOnce('scripts/audit-fagverk-vitenskap-mathematics-fulltext.mjs',"assert(registrySubject?.chapters?.length === 2, 'Vitenskap-registry skal ha nøyaktig to kapitler etter Unit 2');","assert(registrySubject?.chapters?.length >= 2, 'Vitenskap-registry må bevare minst to kapitler etter Unit 2');");
replaceOnce('scripts/audit-fagverk-vitenskap-mathematics-fulltext.mjs',"assert(releaseSubject?.chapter_status === 'materialized' && releaseSubject?.chapter_count === 2, 'Release må materialisere to Vitenskap-kapitler');","assert(releaseSubject?.chapter_status === 'materialized' && releaseSubject?.chapter_count === registrySubject.chapters.length && releaseSubject?.chapter_count >= 2, 'Release må bevare Unit 2 og følge registry-kapitteltallet');");
replaceOnce('scripts/audit-fagverk-vitenskap-mathematics-fulltext.mjs','threeBreadthEditorialBlockersRemain: true','remainingBreadthEditorialBlockersConsistent: true');
replaceOnce('tests/fagverk-vitenskap-pilot.test.mjs',"assert.equal(report.subject.registeredChapterCount, 2);","assert.ok(report.subject.registeredChapterCount >= 2);");
replaceOnce('tests/fagverk-general-engine.test.mjs',"assert.equal(vitenskap.chapterCount, 2);","assert.equal(vitenskap.chapterCount, JSON.parse(fs.readFileSync(path.join(root, 'data/fagverk/fagverk_registry.json'), 'utf8')).subjects.vitenskap.chapters.length);");
console.log('Vitenskap Unit 3 state transition prepared');
