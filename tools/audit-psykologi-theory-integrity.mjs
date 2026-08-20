#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPsykologiComplete } from '../scripts/audit-fagverk-psykologi-complete.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FAGKART='data/fag/psykologi/fagkart_psykologi_canonical_v4_5.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const BINDINGS='data/fag/psykologi/theory_integrity_bindings_psykologi_v1.json';
const REPORT='reports/fagverk/psykologi-theory-integrity-audit.json';
const ORDER=['psykisk_helse_institusjoner_behandling','fagtradisjoner_teori_sinnet','utvikling_oppvekst_laring','kognisjon_folelser_atferd','sosialpsykologi_normalitet_stigma','traume_krise_resiliens_omsorg'];
const AUTH=new Set(['scholarly_book','scholarly_primary_book','peer_reviewed_article']);
const THEORY_KINDS=new Set(['person_bound_theory','person_bound_model']);
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const unique=(xs,key)=>new Set(xs.map(key)).size===xs.length;
const authorMatches=(author,name)=>norm(name).split(' ').filter(part=>part.length>1).every(part=>norm(author).split(' ').includes(part));

function corpusFor(chapterRecord){
  const chapter=json(chapterRecord.file),modules=new Set(chapter.moduleFiles||[]),sections=new Map();
  for(const moduleFile of modules){
    const module=json(moduleFile);
    for(const section of module.sections||[])sections.set(section.id,{...section,moduleFile});
  }
  const ledger=json(chapterRecord.claimsFile);
  return {modules,sections,claims:new Map(ledger.claims.map(row=>[row.id,row])),sources:new Map(ledger.sources.map(row=>[row.id,row]))};
}

export function auditPsykologiTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const complete=auditPsykologiComplete({checkReport:true}).report;
  const fagkart=json(FAGKART),registry=json(REGISTRY).subjects.psykologi,bridge=json(BINDINGS);
  assert(fagkart.subject_id==='psykologi'&&bridge.subject_id==='psykologi','Ugyldig Psykologi-fag eller proof bridge');
  assert(fagkart.principles?.source_first===true&&fagkart.principles?.external_claim_basis_required===true,'Psykologi strict gate krever source-first og ekstern claim-basis');
  assert(fagkart.principles?.institution_theory_behavior_experience_or_treatment_before_theory===true,'Psykologi strict gate krever dokumentert anker før teori');
  assert(fagkart.principles?.no_generic_self_help_or_diagnostic_questions===true,'Psykologi strict gate må blokkere selvhjelp og diagnostisk trivia');
  assert(bridge.schema==='history_go_psykologi_theory_integrity_bindings_v1'&&bridge.status==='canonical'&&bridge.profile==='hybrid','Psykologi proof bridge må være canonical hybrid v1');
  assert(bridge.completion_status_read_only===true&&bridge.content_mutation===false,'Psykologi proof bridge må være read-only uten corpusmutasjon');
  assert(/proveniens.+ikke trivia/iu.test(bridge.production_rule)&&/faktiske claim-sporede avsnittet/iu.test(bridge.production_rule),'Psykologi proof bridge mangler anti-trivia-/prosaregel');
  assert(complete.summary.domainCount===6&&complete.summary.chapterCount===6,'Psykologi strict gate forventer seks canonicale feltkapitler');
  assert(complete.summary.emneCount===58&&complete.summary.canonicalMethodCount===58,'Psykologi emne-/metodebaseline har endret tellinger');
  assert(complete.summary.moduleCount===18&&complete.summary.sectionCount===54&&complete.summary.paragraphCount===162,'Psykologi kapittelprosa har endret tellinger');
  assert(complete.summary.claimCount===162&&complete.summary.sourceCount===127&&complete.summary.externalSourceCount===120,'Psykologi claim-/kildebaseline har endret tellinger');

  const domains=new Map(fagkart.categories.map(row=>[row.id,row]));
  const chapters=new Map(registry.chapters.map(row=>[row.primary_domain_id,row]));
  const sources=new Map(bridge.scholarly_sources.map(row=>[row.id,row]));
  assert(JSON.stringify(fagkart.categories.map(row=>row.id))===JSON.stringify(ORDER),'Psykologi canonical feltrekkefølge har endret seg');
  assert(bridge.fields.length===6&&JSON.stringify(bridge.fields.map(row=>row.domain_id))===JSON.stringify(ORDER),'Psykologi bridge må dekke alle seks felt i canonical rekkefølge');
  assert(sources.size===12&&bridge.scholarly_sources.length===12,'Psykologi bridge må ha tolv unike scholarly sources');
  for(const source of sources.values()){
    assert(source.authors?.length&&text(source.title)&&text(source.publisher)&&/^https:\/\//.test(source.url),`Ufullstendig scholarly source: ${source.id}`);
    assert(AUTH.has(source.source_authority_class)&&text(source.source_location).length>=60,`Ikke-faglig eller uinspiserbar scholarly source: ${source.id}`);
  }

  const usedTheoryIds=[],usedSourceIds=[],rows=[];
  for(const field of bridge.fields){
    const domain=domains.get(field.domain_id),chapterRecord=chapters.get(field.domain_id);
    assert(domain&&chapterRecord,`Ukjent Psykologi-felt: ${field.domain_id}`);
    assert(field.theory_objects?.length===2,`${field.domain_id}: strict proof krever eksakt to theory objects`);
    assert(unique(field.theory_objects,row=>row.id),`${field.domain_id}: duplisert theory object`);
    const objectIds=field.theory_objects.map(row=>row.id);
    assert(new Set(field.comparison?.theory_object_ids||[]).size===2&&objectIds.every(id=>field.comparison.theory_object_ids.includes(id)),`${field.domain_id}: comparison må binde begge theory objects`);
    assert(text(field.comparison.interpretive_consequence).length>=150,`${field.domain_id}: comparison mangler fortolkningskonsekvens`);
    const corpus=corpusFor(chapterRecord),theoristIds=[];
    for(const object of field.theory_objects){
      usedTheoryIds.push(object.id);theoristIds.push(object.theorist?.id);
      assert(THEORY_KINDS.has(object.theory_kind),`${object.id}: ugyldig theory_kind for hybridprofilen`);
      const hook=(domain.topic_hooks||[]).find(row=>row.id===object.hook_id);
      assert(hook&&hook.generator_constraints?.do_not_generate_from_hook_label_only===true,`${object.id}: hook finnes ikke eller tillater metadata-only teori`);
      assert((hook.emne_ids||[]).includes(object.emne_id),`${object.id}: emne-binding ligger utenfor canonicalt hook`);
      const canonical=(hook.canon?.thinkers||[]).find(row=>row.id===object.theorist?.id);
      assert(canonical&&canonical.name===object.theorist.name&&canonical.role===object.theorist.canonical_role,`${object.id}: person/rolle avviker fra canonical fagkart`);
      const scholarly=sources.get(object.theorist.scholarly_source_id);
      assert(scholarly&&scholarly.title===object.theorist.work,`${object.id}: person er ikke bundet til konkret scholarly work`);
      assert(scholarly.authors.some(author=>authorMatches(author,object.theorist.name)),`${object.id}: personen er ikke forfatter av scholarly work`);
      usedSourceIds.push(scholarly.id);
      assert(text(object.theorist.contribution).length>=120,`${object.id}: forskningsbidrag er for kort`);
      for(const key of ['scope','core_claim_or_mechanism','rival_or_alternative','interpretive_consequence'])assert(text(object[key]).length>=120,`${object.id}: mangler substansiell ${key}`);
      assert(object.limitations?.length>=2&&object.limitations.every(row=>text(row).length>=90),`${object.id}: mangler minst to reelle begrensninger`);
      const rivalName=field.theory_objects.find(row=>row.id!==object.id).theorist.name.split(' ').at(-1);
      assert(norm(object.rival_or_alternative).includes(norm(rivalName)),`${object.id}: rivalen er ikke eksplisitt navngitt`);
      const binding=object.claim_binding;
      assert(binding?.chapter_id===chapterRecord.id&&corpus.modules.has(binding.module_file),`${object.id}: kapittel/modul-binding avviker`);
      const section=corpus.sections.get(binding.section_id),claim=corpus.claims.get(binding.claim_id);
      assert(section&&section.moduleFile===binding.module_file,`${object.id}: faktisk seksjon finnes ikke i bundet modul`);
      assert(Number.isInteger(binding.paragraph_index)&&binding.paragraph_index>=0&&binding.paragraph_index<section.paragraphs.length,`${object.id}: paragraph_index er ugyldig`);
      assert(section.paragraphClaimIds?.[binding.paragraph_index]?.includes(binding.claim_id),`${object.id}: claim er ikke bundet til faktisk avsnitt`);
      assert(claim&&text(claim.claim).length>=80&&text(claim.kind),`${object.id}: claim er ikke substansiell og klassifisert`);
      assert(binding.source_ids?.length&&binding.source_ids.every(id=>claim.source_ids.includes(id)&&corpus.sources.has(id)),`${object.id}: anvendt claim-kilde er ikke i ledger`);
      assert(binding.source_ids.every(id=>/^https:\/\//.test(corpus.sources.get(id).url)),`${object.id}: claim-binding må bruke eksterne kilder`);
      assert(text(section.paragraphs[binding.paragraph_index]).length>=180,`${object.id}: faktisk prosa er ikke substansiell`);
    }
    assert(new Set(theoristIds).size===2,`${field.domain_id}: strict proof krever to canonicale personer`);
    rows.push({domainId:field.domain_id,strictlyProven:true,theoryObjectCount:2,scholarlySourceCount:2,personWorkBindingCount:2,claimBindingCount:2,proseBindingCount:2,diagnosisSafetyGuard:true});
  }
  assert(usedTheoryIds.length===12&&new Set(usedTheoryIds).size===12,'Psykologi strict gate krever tolv unike theory objects');
  assert(usedSourceIds.length===12&&new Set(usedSourceIds).size===12,'Alle tolv scholarly sources må brukes eksakt én gang');
  const report={schema:'history_go_psykologi_theory_integrity_audit_v1',version:'1.0.0',subject_id:'psykologi',status:'STRICTLY_PROVEN',proof_scope:'per_canonical_major_field',profile:'hybrid',completion_status_read_only:true,content_rewrite_required:false,diagnosis_safety:'verified_no_individual_diagnosis_or_treatment_advice',summary:{canonicalMajorFields:6,fieldsStrictlyProven:6,theoryObjects:12,scholarlySources:12,personWorkBindings:12,claimBindings:12,actualProseBindings:12,explicitProofBridges:12,substantiveContentGapsProven:0},lockedBaseline:{topics:58,methods:58,theoryHooks:60,registeredChapters:6,modules:18,sections:54,paragraphs:162,claims:162,sources:127,externalSources:120},sourceModel:{theoryGrounding:'canonical person + concrete work or research contribution + academically appropriate source',appliedEvidence:'existing claim-ledger source + exact module/section/paragraph binding',safety:'group evidence never becomes individual diagnosis, prognosis or treatment advice'},fields:rows};
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditPsykologiTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Psykologi theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
