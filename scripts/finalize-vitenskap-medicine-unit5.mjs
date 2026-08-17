#!/usr/bin/env node
import fs from 'node:fs';
const read=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const assert=(c,m)=>{if(!c)throw new Error(m)};
const replace=(file,from,to)=>{const s=fs.readFileSync(file,'utf8');assert(s.includes(from),`Mangler forventet tekst i ${file}: ${from.slice(0,120)}`);const n=s.replace(from,to);assert(n!==s,`Ingen endring i ${file}`);fs.writeFileSync(file,n)};
const chapterId='vitenskap-medisin-fra-mekanisme-til-folkehelse';
const chapterFile='data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse.json';
const readinessPath='data/fag/vitenskap/vitenskap_university_readiness_v1.json';
const registryPath='data/fagverk/fagverk_registry.json';
const statusPath='data/fagverk/subject_status.json';
const readiness=read(readinessPath),registry=read(registryPath),status=read(statusPath),subject=registry.subjects?.vitenskap,statusEntry=status.subjects?.find((r)=>r.id==='vitenskap');
assert(readiness.complete_ready===false,'Vitenskap må være incomplete før Unit 5');
assert(readiness.status==='breadth_inventory_reconciled_chapter_production_in_progress','Uventet readiness status før Unit 5');
assert(readiness.current_inventory?.vitenskap?.registered_chapter_count===4,'Forventet 4 kapitler før Unit 5');
assert(JSON.stringify(readiness.editorial_blockers)===JSON.stringify(['medicine_biomedicine_public_health']),'Uventet blocker-state før Unit 5');
const medicine=readiness.coverage_families.find((r)=>r.id==='medicine_biomedicine_public_health');
assert(medicine?.status==='inventory_reconciled','Medisin må være inventory_reconciled før Unit 5');
assert(Array.isArray(subject?.chapters)&&subject.chapters.length===4,'Registry må ha fire Vitenskap-kapitler før Unit 5');
assert(!subject.chapters.some((r)=>r.id===chapterId),'Unit 5 finnes allerede i registry');
assert(fs.existsSync(chapterFile),'Mangler Unit 5 chapter root');
subject.chapters.push({id:chapterId,title:'Medisin fra mekanisme til folkehelse',subtitle:'Fra biomedisinske modeller og biomarkører via diagnostisk validering og randomiserte studier til behandlingseffekt, epidemiologi og kausal forebygging',file:chapterFile,primary_domain_id:'natur_medisin_miljo',chapter_role:'core',emne_ids:['em_vit_biomedisinsk_mekanisme_og_modell','em_vit_diagnostikk_biomarkorer_og_testegenskaper','em_vit_kliniske_studier_og_intervensjoner','em_vit_behandlingsevidens_og_effekt','em_vit_folkehelse_arsak_og_forebygging'],claimsFile:'data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse/claims.json',briefFile:'data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse/brief.json'});
readiness.current_inventory.vitenskap.registered_chapter_count=5;
readiness.editorial_blockers=[];
readiness.status='breadth_chapters_materialized_final_audit_pending';
readiness.next_gate='final_holistic_university_breadth_completion_audit';
medicine.status='chapter_materialized';
medicine.reason='Canonical v4.6-familien er fulltekstmaterialisert i tre redigerte moduler med ni seksjoner, 27 claimsporede fagavsnitt, diagnostisk evidenskjede, randomisert behandlingseffekt og epidemiologisk kausalitetsanalyse. Modelltranslasjon, analytisk versus klinisk validering, sensitivitet/spesifisitet versus prevalensavhengige prediktive verdier, relativ versus absolutt effekt og assosiasjon versus årsak er eksplisitte kvalitetsgrenser. Dette lukker siste breadth-blocker, men complete_ready forblir false fram til separat helhetsaudit.';
medicine.materialized_chapter_id=chapterId;
medicine.materialized_evidence={method_count:9,module_count:3,section_count:9,paragraph_count:27,source_count:12,claim_count:20};
assert(statusEntry?.editorialStatus==='chapters_in_progress','Vitenskap subject status har uventet editorialStatus');
statusEntry.nextGate='final_holistic_university_breadth_completion_audit';
statusEntry.note='Vitenskap har nå materialisert alle fire tidligere reconcilerte universitetsbreddefamilier som egne fulltekstkapitler: matematikk/formelle fag, fysikk/astronomi, kjemi/materialvitenskap og medisin/biomedisin/folkehelse. Canonical inventar forblir 6 fagområder, 117 emner, 84 metoder, 117 mappinger og 64 hooks, med Teknologi som nested spesialisering. Unit 5 lukker siste breadth-blocker med claimsporet forskningsmetode og evidensvurdering, men faget står fortsatt chapters_in_progress og complete_ready=false fram til en separat helhetlig slutt-audit av samlet canonical dekning og kvalitet.';
write(readinessPath,readiness);write(registryPath,registry);write(statusPath,status);

replace('scripts/audit-fagverk-vitenskap-breadth-reconciliation.mjs',"assert(readiness.status === 'breadth_inventory_reconciled_chapter_production_in_progress', 'Readiness har feil post-reconciliation-status');","assert(['breadth_inventory_reconciled_chapter_production_in_progress','breadth_chapters_materialized_final_audit_pending'].includes(readiness.status), 'Readiness har feil post-reconciliation-status');");
replace('scripts/audit-fagverk-vitenskap-breadth-reconciliation.mjs',"assert(editorialBlockers.length >= 1, 'Minst én breadth-family må blokkere mens Vitenskap ikke er complete');","assert(editorialBlockers.length <= EXPECTED_FAMILIES.length, 'Readiness har for mange breadth editorial blockers');");
replace('scripts/audit-fagverk-vitenskap-breadth-reconciliation.mjs',"assert(readiness.next_gate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Readiness har feil neste port');","const expectedProgressGate = editorialBlockers.length === 0 ? 'final_holistic_university_breadth_completion_audit' : 'remaining_chapter_production_across_reconciled_university_breadth';\n  assert(readiness.next_gate === expectedProgressGate, 'Readiness har feil neste port');");
replace('scripts/audit-fagverk-vitenskap-breadth-reconciliation.mjs',"assert(statusEntry?.nextGate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Subject status har feil neste port');","assert(statusEntry?.nextGate === expectedProgressGate, 'Subject status har feil neste port');");
replace('scripts/audit-fagverk-vitenskap-breadth-reconciliation.mjs',"editorialBlockersRemainOpen: true,","editorialBlockersRemainOpen: editorialBlockers.length > 0,");

replace('scripts/audit-fagverk-vitenskap-university-readiness.mjs',"assert(readiness.status === 'breadth_inventory_reconciled_chapter_production_in_progress', 'Vitenskap readiness har feil chapter-production-status');","assert(['breadth_inventory_reconciled_chapter_production_in_progress','breadth_chapters_materialized_final_audit_pending'].includes(readiness.status), 'Vitenskap readiness har feil chapter-production-status');");
replace('scripts/audit-fagverk-vitenskap-university-readiness.mjs',"assert(statusEntry?.nextGate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Vitenskap har feil neste port');","assert(['remaining_chapter_production_across_reconciled_university_breadth','final_holistic_university_breadth_completion_audit'].includes(statusEntry?.nextGate), 'Vitenskap har feil neste port');");
replace('scripts/audit-fagverk-vitenskap-university-readiness.mjs',"assert(editorialBlockers.length >= 1, 'Så lenge complete_ready=false skal minst én breadth-family stå som editorial blocker');","assert(editorialBlockers.length <= BREADTH_FAMILIES.length, 'Readiness har for mange breadth editorial blockers');\n  const expectedProgressGate = editorialBlockers.length === 0 ? 'final_holistic_university_breadth_completion_audit' : 'remaining_chapter_production_across_reconciled_university_breadth';\n  assert(readiness.next_gate === expectedProgressGate, 'Readiness next_gate matcher ikke breadth-fremdriften');\n  assert(statusEntry.nextGate === expectedProgressGate, 'Subject status nextGate matcher ikke breadth-fremdriften');");
replace('scripts/audit-fagverk-vitenskap-university-readiness.mjs',"status: 'breadth_inventory_reconciled_chapter_production_in_progress',","status: readiness.status,");

replace('scripts/audit-fagverk-vitenskap-pilot.mjs',"assert(statusEntry?.nextGate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Vitenskap har feil neste port');","assert(['remaining_chapter_production_across_reconciled_university_breadth','final_holistic_university_breadth_completion_audit'].includes(statusEntry?.nextGate), 'Vitenskap har feil neste port');");

replace('scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs',"assert(readiness.current_inventory?.vitenskap?.registered_chapter_count===4, 'Readiness må registrere fire Vitenskap-kapitler');","assert(readiness.current_inventory?.vitenskap?.registered_chapter_count>=4, 'Readiness må bevare minst fire Vitenskap-kapitler');");
replace('scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs',"assert(isDeepStrictEqual(sorted(readiness.editorial_blockers||[]),sorted(EXPECTED_REMAINING_BLOCKERS)), 'Etter Unit 4 skal bare medisin blokkere breadth completion');","const laterBlockers=readiness.editorial_blockers||[]; assert((laterBlockers.length===1&&isDeepStrictEqual(sorted(laterBlockers),sorted(EXPECTED_REMAINING_BLOCKERS)))||laterBlockers.length===0, 'Unit 4 predecessor har uventet senere blocker-state');");
replace('scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs',"assert(registrySubject?.chapters?.length===4 && registryChapter, 'Vitenskap-registry skal ha fire kapitler inkludert Unit 4');","assert(registrySubject?.chapters?.length>=4 && registryChapter, 'Vitenskap-registry skal bevare Unit 4');");
replace('scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs',"assert(releaseSubject?.chapter_status==='materialized' && releaseSubject?.chapter_count===4 && releaseSubject?.missing_chapter_files?.length===0, 'Release må materialisere fire Vitenskap-kapitler uten manglende filer');","assert(releaseSubject?.chapter_status==='materialized' && releaseSubject?.chapter_count>=4 && releaseSubject?.missing_chapter_files?.length===0, 'Release må bevare Unit 4 uten manglende filer');");
replace('scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs',"registeredChapterCount:4,remainingEditorialBlockerCount:1","registeredChapterCount:readiness.current_inventory.vitenskap.registered_chapter_count,remainingEditorialBlockerCount:(readiness.editorial_blockers||[]).length");
replace('scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs',"oneBreadthEditorialBlockerRemains:true","oneBreadthEditorialBlockerRemains:(readiness.editorial_blockers||[]).length===1");

replace('tests/fagverk-vitenskap-breadth-reconciliation.test.mjs',"assert.equal(report.subject.nextGate, 'remaining_chapter_production_across_reconciled_university_breadth');","assert.equal(report.subject.nextGate, 'final_holistic_university_breadth_completion_audit');");
replace('tests/fagverk-vitenskap-breadth-reconciliation.test.mjs',"assert.ok(report.editorialState.editorialBlockerCount >= 1 && report.editorialState.editorialBlockerCount <= 3);","assert.equal(report.editorialState.editorialBlockerCount, 0);");
replace('tests/fagverk-vitenskap-breadth-reconciliation.test.mjs',"assert.ok(report.editorialState.registeredChapterCount >= 2);","assert.ok(report.editorialState.registeredChapterCount >= 5);");
replace('tests/fagverk-vitenskap-breadth-reconciliation.test.mjs',"assert.equal(report.gates.editorialBlockersRemainOpen, true);","assert.equal(report.gates.editorialBlockersRemainOpen, false);");
replace('tests/fagverk-vitenskap-pilot.test.mjs',"assert.equal(report.subject.nextGate, 'remaining_chapter_production_across_reconciled_university_breadth');","assert.equal(report.subject.nextGate, 'final_holistic_university_breadth_completion_audit');");
replace('tests/fagverk-vitenskap-pilot.test.mjs',"assert.ok(report.subject.registeredChapterCount >= 2);","assert.ok(report.subject.registeredChapterCount >= 5);");

replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"const EDITORIAL_BLOCKERS = [\n  'medicine_biomedicine_public_health'\n];","const EDITORIAL_BLOCKERS = [];");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.subject.nextGate, 'remaining_chapter_production_across_reconciled_university_breadth');","assert.equal(report.subject.nextGate, 'final_holistic_university_breadth_completion_audit');");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.inventory.vitenskap.registered_chapter_count, 4);","assert.equal(report.inventory.vitenskap.registered_chapter_count, 5);");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"inventory_reconciled: 1,\n    chapter_materialized: 3,","inventory_reconciled: 0,\n    chapter_materialized: 4,");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.coverageSummary.editorialBlockerCount, 1);","assert.equal(report.coverageSummary.editorialBlockerCount, 0);");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.coverageSummary.materializedBreadthFamilyCount, 3);","assert.equal(report.coverageSummary.materializedBreadthFamilyCount, 4);");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"    { id: 'chemistry_material_science', chapterId: 'vitenskap-kjemi-fra-atomstruktur-til-materialegenskap' }\n  ]);","    { id: 'chemistry_material_science', chapterId: 'vitenskap-kjemi-fra-atomstruktur-til-materialegenskap' },\n    { id: 'medicine_biomedicine_public_health', chapterId: 'vitenskap-medisin-fra-mekanisme-til-folkehelse' }\n  ]);");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.registration.registryChapterCount, 4);","assert.equal(report.registration.registryChapterCount, 5);");
replace('tests/fagverk-vitenskap-university-readiness.test.mjs',"assert.equal(report.registration.releaseChapterCount, 4);","assert.equal(report.registration.releaseChapterCount, 5);");

replace('tests/fagverk-vitenskap-chemistry-material-science-fulltext.test.mjs',"registeredChapterCount: 4,\n    remainingEditorialBlockerCount: 1","registeredChapterCount: 5,\n    remainingEditorialBlockerCount: 0");
replace('tests/fagverk-vitenskap-chemistry-material-science-fulltext.test.mjs',"assert.equal(report.gates.oneBreadthEditorialBlockerRemains, true);","assert.equal(report.gates.oneBreadthEditorialBlockerRemains, false);");

console.log('Vitenskap Unit 5 canonical transition and predecessor updates prepared');
