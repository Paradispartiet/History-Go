#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditHistoryCompletion } from './audit-historie-completion.mjs';
import { auditHistorySourceAuthority } from './audit-historie-source-authority.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const GENERATOR_ID='tools/materialize-historie-editorial-chapters.mjs';
const readJson=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const list=v=>Array.isArray(v)?v:[];
const unique=xs=>[...new Set(xs.filter(Boolean))];
const norm=v=>String(v||'').toLocaleLowerCase('nb-NO').replace(/\s+/g,' ').trim();
const isAcademic=s=>['academic_monograph','academic_secondary_monograph','peer_reviewed_journal_article'].includes(s?.source_type);
const isInlineAcademic=s=>['scholarly_book','academic_monograph','academic_secondary_monograph','peer_reviewed_journal_article'].includes(s?.type||s?.source_type);
const THEORY_STOPWORDS=new Set(['og','eller','som','for','med','til','fra','ved','mot','uten','etter','under','over','mellom','gjennom','den','det','de','en','et','av','på','i','er','var','blir','kan','skal','må','samt','slik','hvordan','historisk','historiske','historie','analytisk','analyse','analyserer','forklarer','undersøker','modellen','modell']);
const significantTokens=value=>unique(norm(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9æøå]+/g,' ').split(/\s+/).filter(token=>token.length>=4&&!THEORY_STOPWORDS.has(token)));
function semanticBinding(reference,prose){
  const referenceTokens=significantTokens(reference);
  const proseTokens=new Set(significantTokens(prose));
  const matched=referenceTokens.filter(token=>proseTokens.has(token));
  return {referenceTokens,matched,ratio:referenceTokens.length?matched.length/referenceTokens.length:0};
}

function visit(value,callback){
  if(Array.isArray(value)){for(const item of value)visit(item,callback);return;}
  if(!value||typeof value!=='object')return;
  callback(value);
  for(const child of Object.values(value))visit(child,callback);
}

function existingCanonicalThinkerEvidence(canonicalThinkerIds){
  const wanted=new Set(canonicalThinkerIds);
  const matches=new Map(canonicalThinkerIds.map(id=>[id,[]]));
  const fagkart=readJson('data/fag/historie/fagkart_historie_canonical_v4_5.json');
  visit(fagkart,row=>{
    const id=row.thinker_id||row.id;
    if(!wanted.has(id))return;
    const name=row.name||row.label;
    const works=list(row.works).map(work=>typeof work==='string'?work:(work?.title||work?.name)).filter(Boolean);
    const contribution=row.why||row.contribution||row.role;
    if(name&&works.length&&norm(contribution).length>=20)matches.get(id).push({name,works,contribution});
  });
  return matches;
}

function isGeneratorOwnedChapter(chapter){
  if(!chapter?.productionBriefFile)return false;
  const absolute=path.join(ROOT,chapter.productionBriefFile);
  if(!fs.existsSync(absolute))return false;
  const brief=readJson(chapter.productionBriefFile);
  return brief.generatedFrom?.generator===GENERATOR_ID
    || brief.generatedFrom?.pensum==='data/fag/historie/historiepensum_canonical_v4_5.json';
}

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
  const domainById=new Map(domains.map(d=>[d.domain_id,d]));
  const domainIds=new Set(domainById.keys());
  assert.equal(pensum.scope,'universal','Historiepensum må deklarere universelt faglig scope');
  assert.equal(domains.length,23,'Historie strict theory proof krever 23 canonicale fagfelt');
  assert.equal(domainIds.size,23,'Historie canonicale fagfelt må være unike');
  assert.ok(domains.every(d=>d.canonical_status==='canonical'&&d.status==='complete_revised'),'Alle 23 Historie-felt må være canonical complete_revised');

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
    const e=evidenceByTheory.get(t.theory_id);
    assert.ok(e,`Theory mangler evidence entry: ${t.theory_id}`);
    assert.equal(e.status,'evidence_ready',`Theory evidence ikke ready: ${t.theory_id}`);
    assert.ok(list(e.claim_ids).length>=1&&list(e.source_ids).length>=1,`Theory evidence mangler claim/source-binding: ${t.theory_id}`);
    assert.ok(norm(e.rationale).length>=80,`Theory evidence mangler rationale: ${t.theory_id}`);
    assert.ok(list(e.limitations).length>=1&&list(e.alternative_interpretations).length>=1&&list(e.disconfirmation_conditions).length>=1,`Theory evidence mangler kritisk avgrensning: ${t.theory_id}`);
    assert.equal(e.universalization_status,'provisional_not_universal',`Per-theory evidens skal ikke feilaktig erklære universell sannhet: ${t.theory_id}`);
  }

  assert.equal(universal.status,'COMPLETE','Historie universal coverage audit må være COMPLETE');
  assert.equal(universal.summary?.covered_cells,58);
  assert.equal(universal.summary?.partial_cells,0);
  assert.equal(universal.summary?.missing_cells,0);
  assert.equal(universal.summary?.production_gaps,0);
  assert.equal(universal.inventory?.domains,23);
  assert.equal(universal.inventory?.theories,230);

  assert.equal(attribution.schema,'history_go_historie_theory_attribution_v1');
  assert.equal(attribution.subject_id,'historie');
  assert.equal(attribution.status,'strict_proof_bridge_ready');
  assert.equal(attribution.rules?.name_only_trivia_forbidden,true);
  assert.equal(attribution.rules?.frozen_theory_objects_read_only,true);
  assert.equal(attribution.rules?.existing_thinker_work_evidence_from_fagkart,true);
  assert.equal(attribution.rules?.supplement_only_when_existing_binding_missing,true);
  assert.equal(attribution.rules?.minimum_named_people_or_works_per_major_field,4);

  const bridgeById=new Map();
  for(const source of list(attribution.scholarly_bridge_sources)){
    assert.ok(source.source_id&&!bridgeById.has(source.source_id),`Manglende/duplisert scholarly bridge source: ${source.source_id}`);
    bridgeById.set(source.source_id,source);
    assert.ok(isAcademic(source),`${source.source_id}: scholarly bridge må være akademisk monografi eller fagfellevurdert artikkel`);
    assert.ok(list(source.authors).length>=1&&norm(source.title).length>=8&&norm(source.publisher).length>=4,`${source.source_id}: scholarly bridge mangler bibliografisk provenance`);
    assert.ok(Number.isInteger(source.year)&&source.year>=1800,`${source.source_id}: scholarly bridge har ugyldig år`);
    assert.ok(/^https:\/\/\S+$/i.test(String(source.scholarly_locator||'')),`${source.source_id}: scholarly bridge mangler direkte https-locator`);
    assert.ok(norm(source.source_location).length>=45,`${source.source_id}: scholarly bridge mangler konkret source_location`);
    assert.ok(norm(source.authority).length>=55,`${source.source_id}: scholarly bridge mangler autoritetsbegrunnelse`);
    assert.ok(norm(source.limitations).length>=55,`${source.source_id}: scholarly bridge mangler eksplisitt begrensning`);
  }
  for(const [field,sourceIds] of Object.entries(attribution.field_scholarly_bridge||{})){
    assert.ok(domainIds.has(field),`Scholarly bridge peker på ukjent Historie-felt: ${field}`);
    assert.equal(unique(list(sourceIds)).length,list(sourceIds).length,`${field}: dupliserte scholarly bridge source IDs`);
    for(const sourceId of list(sourceIds))assert.ok(bridgeById.has(sourceId),`${field}: ukjent scholarly bridge source ${sourceId}`);
  }

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
  const fieldProofMatrix=[];
  const scholarlyFieldMatrix=[];
  let generatorOwnedFieldCount=0,handBuiltFieldCount=0,fieldScholarlyCount=0;
  let generatorExplicitTheoryBindingCount=0,generatorClaimBoundSectionCount=0;
  let minimumGeneratorDefinitionBindingRatio=1,minimumGeneratorLimitationBindingRatio=1;
  let handBuiltSubstantiveTheoryBindingMinimum=Infinity,handBuiltLimitationOrRivalSignalMinimum=Infinity;

  for(const row of chapters){
    assert.ok(domainIds.has(row.primary_domain_id),`Registrert Historie-kapittel har ukjent felt: ${row.primary_domain_id}`);
    const domain=domainById.get(row.primary_domain_id);
    const chapter=readJson(row.file);
    const generatorOwned=isGeneratorOwnedChapter(chapter);
    const fieldSourceIds=new Set(list(chapter.narrativeArchitecture?.historiographyEvidenceSourceIds));
    const fieldCoverage=historiographyByField.get(row.primary_domain_id);
    for(const sid of list(fieldCoverage?.source_ids))fieldSourceIds.add(sid);
    const inlineAcademicSources=new Map();
    let inlineSourceLimitations=0;
    const modules=list(chapter.moduleFiles).map(modulePath=>({modulePath,module:readJson(modulePath)}));
    for(const {modulePath,module} of modules){
      for(const sid of list(module.historiographyEvidence?.sourceIds))fieldSourceIds.add(sid);
      inlineSourceLimitations+=list(module.sourceLimitations).filter(v=>norm(v).length>=45).length;
      for(const source of list(module.sources)){
        if(!isInlineAcademic(source))continue;
        assert.ok(norm(source.label||source.title).length>=12,`${modulePath}: scholarly-kilde mangler bibliografisk label`);
        assert.ok(/^https:\/\/\S+$/i.test(String(source.url||'')),`${modulePath}: scholarly-kilde mangler direkte https-locator (${source.label||source.title||'ukjent'})`);
        inlineAcademicSources.set(`${norm(source.label||source.title)}|${source.url}`,source);
      }
    }
    const canonicalAcademic=[...fieldSourceIds].map(id=>historiographyById.get(id)).filter(Boolean).filter(isAcademic);
    const bridgeAcademic=unique(list(attribution.field_scholarly_bridge?.[row.primary_domain_id])).map(id=>bridgeById.get(id)).filter(Boolean);
    const scholarlyEvidenceCount=canonicalAcademic.length+inlineAcademicSources.size+bridgeAcademic.length;
    assert.ok(scholarlyEvidenceCount>=2,`${row.primary_domain_id}: canonical field mangler minst to eksplisitte akademiske/scholarly kilder`);
    if(inlineAcademicSources.size>0)assert.ok(inlineSourceLimitations>=1,`${row.primary_domain_id}: inline scholarly-kilder mangler feltspesifikk kildebegrensning`);
    scholarlyFieldMatrix.push({field:row.primary_domain_id,canonical:canonicalAcademic.length,inline:inlineAcademicSources.size,bridge:bridgeAcademic.length,total:scholarlyEvidenceCount});
    fieldScholarlyCount++;

    if(generatorOwned){
      generatorOwnedFieldCount++;
      const expectedEmneIds=new Set(list(domain.emne_ids));
      const seenEmneIds=new Set();
      let fieldTheoryBindings=0,fieldClaimBindings=0;
      for(const {modulePath,module} of modules){
        for(const sec of list(module.sections)){
          if(!sec.emneId)continue;
          fieldTheoryBindings++;
          generatorExplicitTheoryBindingCount++;
          seenEmneIds.add(sec.emneId);
          assert.ok(expectedEmneIds.has(sec.emneId),`${modulePath}/${sec.id}: emneId ligger utenfor canonicalt hovedfelt`);
          assert.ok(sec.theoryId,`${modulePath}/${sec.id}: generator-eid canonical emneseksjon mangler theoryId`);
          const theory=theoryById.get(sec.theoryId);
          assert.ok(theory,`${modulePath}/${sec.id}: ukjent theoryId ${sec.theoryId}`);
          assert.equal(sec.editorialHookId,theory.source_hook_id,`${modulePath}/${sec.id}: theoryId er ikke bundet til theory-objektets canonical source hook`);
          assert.ok(list(theory.explanatory_scope).includes(row.primary_domain_id),`${modulePath}/${sec.id}: theoryId er ikke bundet til kapittelets canonicale fagfelt`);
          const paragraphs=list(sec.paragraphs).map(norm);
          assert.ok(paragraphs.length>=5&&paragraphs.every(p=>p.length>=80),`${modulePath}/${sec.id}: theory-bound fulltekst er for tynn`);
          const traceTypes=list(sec.paragraphTraceTypes),claimRows=list(sec.paragraphClaimIds);
          assert.equal(traceTypes.length,paragraphs.length,`${modulePath}/${sec.id}: paragraphTraceTypes mismatch`);
          assert.equal(claimRows.length,paragraphs.length,`${modulePath}/${sec.id}: paragraphClaimIds mismatch`);
          const analyticalProse=paragraphs.filter((_,index)=>traceTypes[index]!=='claim_supported').join(' ');
          const definitionBinding=semanticBinding(theory.definition,analyticalProse);
          minimumGeneratorDefinitionBindingRatio=Math.min(minimumGeneratorDefinitionBindingRatio,definitionBinding.ratio);
          assert.ok(definitionBinding.referenceTokens.length>=5&&definitionBinding.matched.length>=5&&definitionBinding.ratio>=0.45,`${modulePath}/${sec.id}: theory-definition er ikke substansielt integrert i analytisk prosa (${theory.theory_id}; matched=${definitionBinding.matched.length}/${definitionBinding.referenceTokens.length})`);
          const limitationBindings=list(theory.limitations).map(limitation=>semanticBinding(limitation,analyticalProse));
          const bestLimitation=limitationBindings.sort((a,b)=>b.ratio-a.ratio||b.matched.length-a.matched.length)[0];
          minimumGeneratorLimitationBindingRatio=Math.min(minimumGeneratorLimitationBindingRatio,bestLimitation?.ratio||0);
          assert.ok(bestLimitation&&bestLimitation.matched.length>=4&&bestLimitation.ratio>=0.4,`${modulePath}/${sec.id}: theory-begrensning er ikke substansielt brukt i analytisk prosa (${theory.theory_id})`);
          const claimIds=unique(claimRows.flat());
          const evidence=evidenceByTheory.get(theory.theory_id);
          assert.ok(claimIds.some(id=>list(evidence.claim_ids).includes(id)),`${modulePath}/${sec.id}: theory fulltekst mangler claim fra theory-evidence entry`);
          assert.ok(traceTypes.includes('claim_supported'),`${modulePath}/${sec.id}: theory fulltekst mangler claim_supported prose`);
          fieldClaimBindings++;
          generatorClaimBoundSectionCount++;
        }
      }
      assert.equal(fieldTheoryBindings,10,`${row.primary_domain_id}: generator-eid felt skal ha 10 eksplisitte theory/prose-bindinger`);
      assert.equal(fieldClaimBindings,10,`${row.primary_domain_id}: generator-eid felt skal ha 10 claim-sporede theory/prose-bindinger`);
      assert.equal(seenEmneIds.size,10,`${row.primary_domain_id}: generator-eid felt skal dekke 10 unike canonicale emner`);
      assert.deepEqual([...seenEmneIds].sort(),[...expectedEmneIds].sort(),`${row.primary_domain_id}: generator-eid fulltekst dekker ikke eksakt canonical emne-sett`);
      fieldProofMatrix.push({field:row.primary_domain_id,mode:'generator_explicit',substantiveTheoryBindings:fieldTheoryBindings,limitationOrRivalSignals:fieldClaimBindings,pass:true});
      continue;
    }

    handBuiltFieldCount++;
    const sections=modules.flatMap(({module})=>list(module.sections));
    const prose=sections.flatMap(sec=>list(sec.paragraphs)).map(norm).filter(Boolean).join(' ');
    assert.ok(prose.length>=1000,`${row.primary_domain_id}: håndbygget felt mangler nok registrert prosa for field-level strict proof`);
    const fieldTheories=theories.filter(t=>list(t.explanatory_scope).includes(row.primary_domain_id));
    assert.equal(fieldTheories.length,10,`${row.primary_domain_id}: håndbygget felt skal ha 10 canonicale theory candidates`);
    let substantiveTheoryBindings=0,limitationOrRivalSignals=0;
    const theorySignals=[];
    for(const theory of fieldTheories){
      const definitionBinding=semanticBinding(theory.definition,prose);
      const evidence=evidenceByTheory.get(theory.theory_id);
      const criticalReferences=unique([
        ...list(theory.limitations),
        ...list(evidence?.limitations),
        ...list(evidence?.alternative_interpretations),
        ...list(evidence?.disconfirmation_conditions)
      ]);
      const criticalBindings=criticalReferences.map(reference=>semanticBinding(reference,prose));
      const bestCritical=criticalBindings.sort((a,b)=>b.ratio-a.ratio||b.matched.length-a.matched.length)[0]||{referenceTokens:[],matched:[],ratio:0};
      const substantive=definitionBinding.matched.length>=5&&definitionBinding.ratio>=0.4;
      const critical=bestCritical.matched.length>=4&&bestCritical.ratio>=0.4;
      if(substantive)substantiveTheoryBindings++;
      if(critical)limitationOrRivalSignals++;
      theorySignals.push({theoryId:theory.theory_id,definitionMatched:definitionBinding.matched.length,definitionRatio:Math.round(definitionBinding.ratio*1000)/1000,criticalMatched:bestCritical.matched.length,criticalRatio:Math.round(bestCritical.ratio*1000)/1000,substantive,critical});
    }
    assert.ok(substantiveTheoryBindings>=4,`${row.primary_domain_id}: håndbygget felt trenger minst fire substansielle theory/prose-bindinger; fant ${substantiveTheoryBindings}`);
    assert.ok(limitationOrRivalSignals>=2,`${row.primary_domain_id}: håndbygget felt trenger minst to substansielle limitation/rival-signaler; fant ${limitationOrRivalSignals}`);
    handBuiltSubstantiveTheoryBindingMinimum=Math.min(handBuiltSubstantiveTheoryBindingMinimum,substantiveTheoryBindings);
    handBuiltLimitationOrRivalSignalMinimum=Math.min(handBuiltLimitationOrRivalSignalMinimum,limitationOrRivalSignals);
    fieldProofMatrix.push({field:row.primary_domain_id,mode:'hand_built_field_prose',substantiveTheoryBindings,limitationOrRivalSignals,sectionCount:sections.length,paragraphCount:sections.reduce((sum,sec)=>sum+list(sec.paragraphs).length,0),theorySignals,pass:true});
  }

  assert.equal(generatorOwnedFieldCount,18,'Historie strict proof forventer 18 generator-eide hovedfelt');
  assert.equal(handBuiltFieldCount,5,'Historie strict proof forventer fem håndbygde hovedfelt');
  assert.equal(generatorExplicitTheoryBindingCount,180,'18 generator-eide felt skal ha 180 eksplisitte theory/prose-bindinger');
  assert.equal(generatorClaimBoundSectionCount,180,'18 generator-eide felt skal ha 180 claim-sporede theory/prose-bindinger');
  assert.equal(fieldProofMatrix.length,23,'Strict proof skal avgjøres per 23 canonicale hovedfelt');
  assert.equal(new Set(fieldProofMatrix.map(row=>row.field)).size,23,'Field-level strict proof skal ha én rad per canonicalt hovedfelt');
  assert.ok(fieldProofMatrix.every(row=>row.pass),'Alle 23 canonicale Historie-felt skal passere sin eiermodell');
  assert.equal(fieldScholarlyCount,23,'23/23 Historie-felt skal ha eksplisitt scholarly kildegrunnlag');

  const forbidden=list(quizRules.hard_rules?.forbidden_generation_patterns).join(' ').toLocaleLowerCase('en');
  const validatorRules=list(quizRules.validator_additions).join(' ').toLocaleLowerCase('en');
  assert.ok(forbidden.includes('theory lists')&&forbidden.includes('generic history-theory'),'Historie quiz-regler må eksplisitt blokkere theory-list/name-only generering');
  assert.equal(quizRules.normal_opening_contract?.sets?.['1']?.theory_names_forbidden,true);
  assert.equal(quizRules.normal_opening_contract?.sets?.['2']?.theory_names_forbidden,true);
  assert.ok(Number(quizRules.normal_opening_contract?.theory_begins_from_set)>=4,'Teori skal ikke introduseres før kilde/stedsgrunnlag er etablert');
  assert.ok(validatorRules.includes('theory overreach'),'Historie validator må flagge theory overreach');

  const canonicalThinkerIds=unique(domains.flatMap(domain=>list(domain.canonical_thinker_ids))).sort();
  assert.equal(canonicalThinkerIds.length,112,'Historie forventer 112 unike canonicale field-level thinker anchors');
  const existingThinkers=existingCanonicalThinkerEvidence(canonicalThinkerIds);
  const supplementById=new Map();
  for(const row of list(attribution.thinker_supplements)){
    assert.ok(row.thinker_id&&!supplementById.has(row.thinker_id),`Manglende/duplikat thinker supplement: ${row.thinker_id}`);
    supplementById.set(row.thinker_id,row);
    assert.ok(norm(row.name).length>=3,`Thinker supplement mangler navn: ${row.thinker_id}`);
    assert.ok(norm(row.contribution).length>=80,`Thinker supplement mangler substansielt forskningsbidrag: ${row.thinker_id}`);
    assert.ok(list(row.works).length>=1,`Thinker supplement mangler konkret verk: ${row.thinker_id}`);
    for(const work of list(row.works)){
      assert.ok(norm(work.title).length>=4,`Thinker work mangler tittel: ${row.thinker_id}`);
      assert.ok(norm(work.contribution).length>=60,`Thinker work mangler konkret bidrag: ${row.thinker_id}/${work.title}`);
      assert.ok(/^https:\/\/\S+$/i.test(String(work.scholarly_locator||'')),`Thinker work mangler scholarly https-locator: ${row.thinker_id}/${work.title}`);
    }
  }
  const extras=[...supplementById.keys()].filter(id=>!canonicalThinkerIds.includes(id)).sort();
  assert.deepEqual(extras,[],`Thinker supplement har ID som ikke er canonical field anchor: ${extras.join(', ')}`);
  const existingResolved=canonicalThinkerIds.filter(id=>list(existingThinkers.get(id)).length>0);
  const missingExisting=canonicalThinkerIds.filter(id=>!existingResolved.includes(id));
  for(const id of supplementById.keys())assert.ok(missingExisting.includes(id),`Supplement dupliserer eksisterende frozen thinker/work-evidens: ${id}`);
  const unresolved=canonicalThinkerIds.filter(id=>!existingResolved.includes(id)&&!supplementById.has(id));
  assert.deepEqual(unresolved,[],`Historie person_work_binding mangler canonical thinker IDs (${unresolved.length}): ${unresolved.join(', ')}`);
  for(const domain of domains){
    const ids=unique(list(domain.canonical_thinker_ids));
    assert.ok(ids.length>=4,`${domain.domain_id}: trenger minst fire canonical thinker/work-ankre`);
    assert.ok(ids.every(id=>canonicalThinkerIds.includes(id)),`${domain.domain_id}: ukjent canonical thinker ID`);
    const resolved=ids.filter(id=>list(existingThinkers.get(id)).length>0||supplementById.has(id));
    assert.ok(resolved.length>=4,`${domain.domain_id}: færre enn fire substansielt bundne thinker/work-ankre`);
  }
  const personWorkBoundCount=existingResolved.length+supplementById.size;
  assert.equal(personWorkBoundCount,112,'Alle 112 canonicale field-level thinker anchors skal ha name/work/contribution-binding');

  return {
    status:'STRICTLY_PROVEN',
    canonicalFieldCount:23,
    theoryCount:230,
    universalCoverageCells:58,
    theoryEvidenceReadyCount:230,
    generatorOwnedFieldCount,
    handBuiltFieldCount,
    generatorExplicitTheoryBindingCount,
    generatorClaimBoundSectionCount,
    actualProseBoundFieldCount:fieldProofMatrix.length,
    fieldProofMatrix,
    handBuiltSubstantiveTheoryBindingMinimum,
    handBuiltLimitationOrRivalSignalMinimum,
    fieldScholarlyCount,
    scholarlyFieldMatrix,
    minimumGeneratorDefinitionBindingRatio:Math.round(minimumGeneratorDefinitionBindingRatio*1000)/1000,
    minimumGeneratorLimitationBindingRatio:Math.round(minimumGeneratorLimitationBindingRatio*1000)/1000,
    canonicalThinkerCount:canonicalThinkerIds.length,
    existingThinkerWorkCount:existingResolved.length,
    supplementalThinkerWorkCount:supplementById.size,
    personWorkBoundCount,
    antiTrivia:true
  };
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  try{console.log(JSON.stringify(auditHistoryTheoryIntegrity(),null,2));}
  catch(error){console.error(`Historie strict theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
