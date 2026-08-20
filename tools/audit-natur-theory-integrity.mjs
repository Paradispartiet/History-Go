#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditNaturePilot } from '../scripts/audit-fagverk-natur-pilot.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BINDINGS='data/fag/natur/theory_integrity_bindings_natur_v1.json';
const REPORT='reports/fagverk/natur-theory-integrity-audit.json';
const ORDER=['okosystem_mangfold_habitat','artskunnskap_systematikk','evolusjon_biologisk_mangfold','botanikk_vegetasjon','zoologi_dyreliv','sopp_lav_mikroorganismer','organismebiologi_fysiologi','vann_hydrologi_kretslop','klima_energi_resiliens','geologi_landskap_tid','urban_okologi_gronnstruktur','miljopavirkning_forvaltning_regenerasjon'];
const MODEL_KINDS=new Set(['mechanism','model','law_or_principle','causal_framework','classification_framework']);
const AUTHORITY_CLASSES=new Set(['scholarly_textbook','national_scientific_authority','intergovernmental_scientific_assessment','university_science_outreach','professional_scientific_society','intergovernmental_restoration_standard']);
const REQUIRED_ROLES=new Set(['mechanism','limitation','alternative']);
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const unique=(xs,key)=>new Set(xs.map(key)).size===xs.length;

export function auditNaturTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const {report:complete,model}=auditNaturePilot({checkReport:true});
  const bridge=json(BINDINGS);
  assert(bridge.schema==='history_go_natur_theory_integrity_bindings_v1'&&bridge.status==='canonical','Natur proof bridge må være canonical v1');
  assert(bridge.subject_id==='natur'&&bridge.profile==='model_evidence','Natur proof bridge må bruke model_evidence-profil');
  assert(bridge.completion_status_read_only===true&&bridge.content_mutation===false,'Natur proof bridge må være read-only uten corpusmutasjon');
  assert(/proveniens.+ikke trivia/iu.test(bridge.production_rule)&&/faktisk kapittelprosa/iu.test(bridge.production_rule),'Natur proof bridge mangler anti-trivia-/prosaregel');
  assert(complete.summary.domainCount===12&&complete.summary.materializedEmneCount===77,'Natur strict gate forventer 12 felt og 77 emner');
  assert(complete.summary.materializedMethodCount===51&&complete.summary.materializedMappingCount===77,'Natur metode-/mappinggrunnlag har endret tellinger');
  assert(complete.summary.materializedHookCount===136&&complete.summary.registeredChapterCount===12,'Natur hook-/kapittelgrunnlag har endret tellinger');
  assert(complete.summary.requiredGapDomainCount===0&&complete.summary.partialDomainCount===0,'Natur har åpne canonicale dekningshull');
  assert(JSON.stringify([...model.domains].map(row=>row.id))===JSON.stringify(ORDER),'Natur canonical domenerekkefølge har endret seg');
  assert(bridge.fields.length===12&&JSON.stringify(bridge.fields.map(row=>row.domain_id))===JSON.stringify(ORDER),'Natur bridge må dekke alle tolv felt i canonical rekkefølge');

  const domains=model.domainsById;
  const emners=model.emnersById;
  const chapters=new Map([...model.chapters].map(row=>[row.primaryDomainId,row]));
  const hooks=new Map();
  for(const category of model.source.fagkart.categories||[]){
    for(const hook of category.topic_hooks||[])hooks.set(hook.id,{categoryId:category.id,...hook});
  }
  const usedObjectIds=[],usedSourceUrls=[],rows=[];
  let contentRoleBindings=0;
  for(const field of bridge.fields){
    const domain=domains.get(field.domain_id),chapterRecord=chapters.get(field.domain_id);
    assert(domain&&chapterRecord,`Ukjent Natur-felt: ${field.domain_id}`);
    assert(field.model_objects?.length===2,`${field.domain_id}: strict proof krever eksakt to modellobjekter`);
    assert(unique(field.model_objects,row=>row.id),`${field.domain_id}: duplisert modellobjekt`);
    const objectIds=field.model_objects.map(row=>row.id);
    assert(new Set(field.comparison?.model_object_ids||[]).size===2&&objectIds.every(id=>field.comparison.model_object_ids.includes(id)),`${field.domain_id}: comparison må binde begge modellobjekter`);
    assert(text(field.comparison.interpretive_consequence).length>=120,`${field.domain_id}: comparison mangler fortolkningskonsekvens`);
    const chapter=json(chapterRecord.file),sections=new Map((chapter.sections||[]).map(row=>[row.id,row]));
    const sources=new Map((chapter.sources||[]).map(row=>[`${row.label}\n${row.url}`,row]));
    for(const object of field.model_objects){
      usedObjectIds.push(object.id);
      assert(MODEL_KINDS.has(object.model_kind),`${object.id}: ugyldig model_kind`);
      assert(text(object.model_name).length>=12,`${object.id}: modellen mangler navn`);
      const hook=hooks.get(object.hook_id),emne=emners.get(object.emne_id);
      assert(hook?.categoryId===field.domain_id,`${object.id}: hook ligger ikke i feltet`);
      assert((hook.emne_ids||[]).includes(object.emne_id),`${object.id}: hook er ikke canonicalt bundet til emnet`);
      assert(emne,`${object.id}: canonicalt emne finnes ikke`);
      for(const key of ['scope','core_claim_or_mechanism','rival_or_alternative','interpretive_consequence'])assert(text(object[key]).length>=90,`${object.id}: mangler substansiell ${key}`);
      assert(object.limitations?.length>=2&&object.limitations.every(row=>text(row).length>=70),`${object.id}: mangler minst to reelle begrensninger`);
      const source=object.scholarly_source;
      assert(sources.has(`${source?.label}\n${source?.url}`),`${object.id}: kilden finnes ikke eksakt i kapittelet`);
      assert(/^https:\/\//.test(source.url)&&AUTHORITY_CLASSES.has(source.authority_class),`${object.id}: kilden mangler godkjent faglig autoritet`);
      assert(text(source.source_role).length>=70&&text(source.use_limit).length>=70,`${object.id}: kilden mangler bruk-/grensekontrakt`);
      usedSourceUrls.push(source.url);
      const bindings=object.content_bindings||[];
      assert(bindings.length===3,`${object.id}: må ha tre rollebaserte prosabindinger`);
      assert(new Set(bindings.map(row=>row.role)).size===3&&bindings.every(row=>REQUIRED_ROLES.has(row.role)),`${object.id}: må binde mechanism, limitation og alternative`);
      assert(new Set(bindings.map(row=>`${row.section_id}:${row.paragraph_index}`)).size>=2,`${object.id}: prosabindingene må bruke minst to faktiske avsnitt`);
      for(const binding of bindings){
        assert(binding.chapter_file===chapterRecord.file,`${object.id}: prosabinding peker til feil kapittel`);
        const section=sections.get(binding.section_id);
        assert(section,`${object.id}: ukjent seksjon ${binding.section_id}`);
        assert(Number.isInteger(binding.paragraph_index)&&binding.paragraph_index>=0&&binding.paragraph_index<section.paragraphs.length,`${object.id}: ugyldig paragraph_index`);
        assert(text(section.paragraphs[binding.paragraph_index]).length>=100,`${object.id}: bundet prosa er ikke substansiell`);
        contentRoleBindings+=1;
      }
    }
    assert(new Set(field.model_objects.map(row=>row.scholarly_source.url)).size===2,`${field.domain_id}: modellene må ha to ulike kilder`);
    rows.push({domainId:field.domain_id,strictlyProven:true,modelObjectCount:2,scholarlySourceCount:2,contentRoleBindingCount:6,proseBindingCount:6,personWorkBinding:'not_applicable_model_evidence_profile'});
  }
  assert(usedObjectIds.length===24&&new Set(usedObjectIds).size===24,'Natur strict gate krever 24 unike modellobjekter');
  assert(usedSourceUrls.length===24&&new Set(usedSourceUrls).size===24,'Natur strict gate krever 24 unike faglige kildeposter');
  assert(contentRoleBindings===72,'Natur strict gate krever 72 rollebaserte prosabindinger');
  const report={
    schema:'history_go_natur_theory_integrity_audit_v1',version:'1.0.0',subject_id:'natur',status:'STRICTLY_PROVEN',proof_scope:'per_canonical_major_field',profile:'model_evidence',
    completion_status_read_only:true,content_rewrite_required:false,person_work_binding:'not_applicable_model_evidence_profile',
    summary:{canonicalMajorFields:12,fieldsStrictlyProven:12,modelObjects:24,scholarlySources:24,contentRoleBindings:72,actualProseBindings:72,explicitProofBridges:24,substantiveContentGapsProven:0},
    lockedBaseline:{topics:77,methods:51,mappings:77,theoryHooks:136,registeredChapters:12,requiredGapDomains:0,partialDomains:0},
    sourceModel:{modelGrounding:'canonical domain + hook + emne + structured scope/mechanism/limitations/alternative',appliedEvidence:'academically appropriate existing chapter source + exact chapter/section/paragraph bindings for mechanism, limitation and alternative'},
    fields:rows
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditNaturTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Natur theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
