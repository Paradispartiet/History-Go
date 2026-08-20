#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditHistoryCompletion } from './audit-historie-completion.mjs';
import { auditHistorySourceAuthority } from './audit-historie-source-authority.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const list=v=>Array.isArray(v)?v:[];
const unique=xs=>[...new Set(xs.filter(Boolean))];
const norm=v=>String(v||'').toLocaleLowerCase('nb-NO').replace(/\s+/g,' ').trim();
const isAcademic=s=>['academic_monograph','academic_secondary_monograph','peer_reviewed_journal_article'].includes(s?.source_type);

export function auditHistoryTheoryIntegrity(){
  const pensum=readJson('data/fag/historie/historiepensum_canonical_v4_5.json');
  const theories=readJson('data/fag/historie/theory_objects_historie_canonical_v5_5.json');
  const theoryEvidence=readJson('data/fag/historie/theory_evidence_historie_canonical_v1.json');
  const attribution=readJson('data/fag/historie/theory_attribution_historie_canonical_v1.json');
  const universal=readJson('reports/historie-universal-coverage/historie-universal-coverage.json');
  const historiography=readJson('data/fag/historie/historiography_evidence_historie_v1.json');
  const registry=readJson('data/fagverk/fagverk_registry.json');
  const quizRules=readJson('data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json');
  const completion=auditHistoryCompletion();
  const sourceAuthority=auditHistorySourceAuthority();

  assert.equal(completion.status,'PASS','Historie completion må være PASS før strict theory proof');
  assert.equal(sourceAuthority.status,'PASS','Historie source authority må være PASS før strict theory proof');

  const domains=list(pensum.domains);
  const domainIds=new Set(domains.map(d=>d.domain_id));
  assert.equal(pensum.scope,'universal','Historiepensum må deklarere universelt faglig scope');
  assert.equal(domains.length,23,'Historie strict theory proof krever 23 canonicale fagfelt');
  assert.equal(domainIds.size,23,'Historie canonicale fagfelt må være unike');
  assert.ok(domains.every(d=>d.canonical_status==='canonical'&&d.status==='complete_revised'), 'Alle 23 Historie-felt må være canonical complete_revised');

  assert.equal(theories.length,230,'Historie strict theory proof krever 230 canonicale teoriobjekter');
  const theoryById=new Map(theories.map(t=>[t.theory_id,t]));
  assert.equal(theoryById.size,230,'Historie theory IDs må være unike');
  const coveredFields=new Set();
  for(const t of theories){
    assert.ok(t.theory_id&&norm(t.definition).length>=110,`Tynt Historie theory object: ${t.theory_id}`);
    assert.ok(list(t.limitations).length>=3&&list(t.limitations).every(v=>norm(v).length>=45),`Theory mangler substansielle begrensninger: ${t.theory_id}`);
    assert.ok(list(t.thinker_ids).length>=1,`Theory mangler thinker-path: ${t.theory_id}`);
    assert.ok(t.source_hook_id,`Theory mangler source hook: ${t.theory_id}`);
    assert.equal(t.evidence_ready,false,`Frozen V5.8 theory object skal forbli read-only/evidence_ready=false: ${t.theory_id}`);
    const scopes=list(t.explanatory_scope);
    assert.ok(scopes.length>=1,`Theory mangler explanatory_scope: ${t.theory_id}`);
    for(const field of scopes){assert.ok(domainIds.has(field),`Theory peker utenfor canonicale Historie-felt: ${t.theory_id}/${field}`);coveredFields.add(field);}
  }
  assert.equal(coveredFields.size,23,'230 theory objects skal dekke 23/23 canonicale Historie-felt');

  assert.equal(theoryEvidence.completion?.total_theories,230);
  assert.equal(theoryEvidence.completion?.qualifying_entries,230);
  assert.equal(theoryEvidence.completion?.ratio,1);
  assert.equal(theoryEvidence.completion?.universal_status,'COMPLETE','Subject-level theory evidence coverage skal være COMPLETE');
  const evidenceByTheory=new Map(list(theoryEvidence.entries).map(e=>[e.theory_id,e]));
  assert.equal(evidenceByTheory.size,230,'Theory evidence registry skal dekke 230 unike theory IDs');
  for(const t of theories){
    const e=evidenceByTheory.get(t.theory_id);assert.ok(e,`Theory mangler evidence entry: ${t.theory_id}`);assert.equal(e.status,'evidence_ready',`Theory evidence ikke ready: ${t.theory_id}`);assert.ok(list(e.claim_ids).length>=1&&list(e.source_ids).length>=1,`Theory evidence mangler claim/source-binding: ${t.theory_id}`);assert.ok(norm(e.rationale).length>=80,`Theory evidence mangler rationale: ${t.theory_id}`);assert.ok(list(e.limitations).length>=1&&list(e.alternative_interpretations).length>=1&&list(e.disconfirmation_conditions).length>=1,`Theory evidence mangler kritisk avgrensning: ${t.theory_id}`);
    assert.equal(e.universalization_status,'provisional_not_universal',`Per-theory evidens skal ikke feilaktig erklære universell sannhet: ${t.theory_id}`);
  }

  assert.equal(universal.status,'COMPLETE','Historie universal coverage audit må være COMPLETE');
  assert.equal(universal.summary?.covered_cells,58);
  assert.equal(universal.summary?.partial_cells,0);
  assert.equal(universal.summary?.missing_cells,0);
  assert.equal(universal.summary?.production_gaps,0);
  assert.equal(universal.inventory?.domains,23);
  assert.equal(universal.inventory?.theories,230);

  const historiographyById=new Map(list(historiography.sources).map(s=>[s.source_id,s]));
  const historiographyByField=new Map(list(historiography.coverage).map(c=>[c.domain_id,c]));
  assert.equal(historiography.subject_id,'historie');
  assert.equal(historiography.status,'completion_evidence_ready');
  for(const s of historiographyById.values()){
    assert.ok(isAcademic(s),`Historiografisk kilde er ikke akademisk: ${s.source_id}/${s.source_type}`);
    assert.ok(list(s.authors).length>=1&&norm(s.title).length>=8&&norm(s.publisher).length>=4,`Akademisk kilde mangler bibliografisk provenance: ${s.source_id}`);
    assert.ok(norm(s.source_location).length>=45&&norm(s.limitations).length>=55,`Akademisk kilde mangler konkret locator/begrensning: ${s.source_id}`);
  }

  const chapters=list(registry?.subjects?.historie?.chapters);
  assert.equal(chapters.length,23,'Historie registry skal ha 23 fulltekstkapitler');
  const fulltextTheoryIds=new Set(),fulltextEmneIds=new Set(),fulltextFieldIds=new Set();
  let theoryBoundSections=0,claimBoundSections=0,fieldScholarlyCount=0;
  for(const row of chapters){
    assert.ok(domainIds.has(row.primary_domain_id),`Registrert Historie-kapittel har ukjent felt: ${row.primary_domain_id}`);fulltextFieldIds.add(row.primary_domain_id);
    const chapter=readJson(row.file);
    const fieldSourceIds=new Set(list(chapter.narrativeArchitecture?.historiographyEvidenceSourceIds));
    const fieldCoverage=historiographyByField.get(row.primary_domain_id);
    for(const sid of list(fieldCoverage?.source_ids))fieldSourceIds.add(sid);
    for(const modulePath of list(chapter.moduleFiles)){
      const module=readJson(modulePath);
      for(const sid of list(module.historiographyEvidence?.sourceIds))fieldSourceIds.add(sid);
      for(const sec of list(module.sections)){
        if(!sec.emneId)continue;
        fulltextEmneIds.add(sec.emneId);theoryBoundSections++;
        assert.ok(sec.theoryId,`${modulePath}/${sec.id}: canonical emneseksjon mangler theoryId`);
        const theory=theoryById.get(sec.theoryId);assert.ok(theory,`${modulePath}/${sec.id}: ukjent theoryId ${sec.theoryId}`);fulltextTheoryIds.add(sec.theoryId);
        const paragraphs=list(sec.paragraphs).map(norm);assert.ok(paragraphs.length>=5&&paragraphs.every(p=>p.length>=80),`${modulePath}/${sec.id}: theory-bound fulltekst er for tynn`);
        const joined=paragraphs.join(' ');
        const definition=norm(theory.definition);assert.ok(joined.includes(definition),`${modulePath}/${sec.id}: theory-definition er ikke faktisk brukt i canonical prosa (${theory.theory_id})`);
        assert.ok(list(theory.limitations).some(l=>joined.includes(norm(l))),`${modulePath}/${sec.id}: theory-begrensning er ikke faktisk brukt i canonical prosa (${theory.theory_id})`);
        const traceTypes=list(sec.paragraphTraceTypes),claimRows=list(sec.paragraphClaimIds);assert.equal(traceTypes.length,paragraphs.length,`${modulePath}/${sec.id}: paragraphTraceTypes mismatch`);assert.equal(claimRows.length,paragraphs.length,`${modulePath}/${sec.id}: paragraphClaimIds mismatch`);
        const claimIds=unique(claimRows.flat());const evidence=evidenceByTheory.get(theory.theory_id);assert.ok(claimIds.some(id=>list(evidence.claim_ids).includes(id)),`${modulePath}/${sec.id}: theory fulltekst mangler claim fra theory-evidence entry`);assert.ok(traceTypes.includes('claim_supported'),`${modulePath}/${sec.id}: theory fulltekst mangler claim_supported prose`);claimBoundSections++;
      }
    }
    const academicFieldSources=[...fieldSourceIds].map(id=>historiographyById.get(id)).filter(Boolean).filter(isAcademic);
    assert.ok(academicFieldSources.length>=2,`${row.primary_domain_id}: canonical field mangler minst to akademiske historiografikilder`);fieldScholarlyCount++;
  }
  assert.equal(fulltextFieldIds.size,23,'Actual canonical fulltekst skal dekke 23/23 Historie-felt');
  assert.equal(fulltextEmneIds.size,230,'Actual canonical fulltekst skal dekke 230/230 canonicale emner');
  assert.equal(fulltextTheoryIds.size,230,`Actual canonical fulltekst mangler theory objects: ${theories.filter(t=>!fulltextTheoryIds.has(t.theory_id)).map(t=>t.theory_id).sort().join(', ')}`);
  assert.equal(theoryBoundSections,230,'Historie skal ha 230 theory-bound canonicale emneseksjoner');
  assert.equal(claimBoundSections,230,'Historie skal ha claim-sporet theory-prosa i 230/230 emneseksjoner');
  assert.equal(fieldScholarlyCount,23,'23/23 Historie-felt skal ha akademisk historiografi');

  const forbidden=list(quizRules.hard_rules?.forbidden_generation_patterns).join(' ').toLocaleLowerCase('en');
  const validatorRules=list(quizRules.validator_additions).join(' ').toLocaleLowerCase('en');
  assert.ok(forbidden.includes('theory lists')&&forbidden.includes('generic history-theory'), 'Historie quiz-regler må eksplisitt blokkere theory-list/name-only generering');
  assert.equal(quizRules.normal_opening_contract?.sets?.['1']?.theory_names_forbidden,true);
  assert.equal(quizRules.normal_opening_contract?.sets?.['2']?.theory_names_forbidden,true);
  assert.ok(Number(quizRules.normal_opening_contract?.theory_begins_from_set)>=4,'Teori skal ikke introduseres før kilde/stedsgrunnlag er etablert');
  assert.ok(validatorRules.includes('theory overreach'),'Historie validator må flagge theory overreach');

  assert.equal(attribution.schema,'history_go_historie_theory_attribution_v1');
  assert.equal(attribution.subject_id,'historie');
  assert.equal(attribution.rules?.name_only_trivia_forbidden,true);
  assert.equal(attribution.rules?.frozen_theory_objects_read_only,true);
  const requiredThinkers=new Set(theories.flatMap(t=>list(t.thinker_ids)));
  const attributionById=new Map();
  for(const row of list(attribution.thinkers)){
    assert.ok(row.thinker_id&&!attributionById.has(row.thinker_id),`Manglende/duplikat thinker attribution: ${row.thinker_id}`);attributionById.set(row.thinker_id,row);
    assert.ok(norm(row.name).length>=3,`Thinker attribution mangler navn: ${row.thinker_id}`);assert.ok(norm(row.contribution).length>=80,`Thinker attribution mangler substansielt forskningsbidrag: ${row.thinker_id}`);assert.ok(list(row.works).length>=1,`Thinker attribution mangler konkret verk: ${row.thinker_id}`);
    for(const work of list(row.works)){assert.ok(norm(work.title).length>=4,`Thinker work mangler tittel: ${row.thinker_id}`);assert.ok(norm(work.contribution).length>=60,`Thinker work mangler konkret bidrag: ${row.thinker_id}/${work.title}`);assert.ok(norm(work.scholarly_locator).length>=12,`Thinker work mangler scholarly locator: ${row.thinker_id}/${work.title}`);}
  }
  const missingThinkers=[...requiredThinkers].filter(id=>!attributionById.has(id)).sort();
  const extraThinkers=[...attributionById.keys()].filter(id=>!requiredThinkers.has(id)).sort();
  assert.deepEqual(extraThinkers,[],`Attribution registry har thinkers som ikke brukes av canonical theory objects: ${extraThinkers.join(', ')}`);
  assert.deepEqual(missingThinkers,[],`Historie person_work_binding mangler thinker IDs (${missingThinkers.length}): ${missingThinkers.join(', ')}`);
  assert.equal(attributionById.size,requiredThinkers.size,'Alle navngitte Historie-thinkers skal ha work/contribution-attribusjon');

  return {status:'STRICTLY_PROVEN',canonicalFieldCount:23,theoryCount:230,universalCoverageCells:58,theoryEvidenceReadyCount:230,fulltextTheoryCount:fulltextTheoryIds.size,theoryBoundSectionCount:theoryBoundSections,fieldScholarlyCount,thinkerCount:requiredThinkers.size,attributedThinkerCount:attributionById.size,antiTrivia:true};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(auditHistoryTheoryIntegrity(),null,2));}catch(error){console.error(`Historie strict theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
