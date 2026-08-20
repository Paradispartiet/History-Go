#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditRepository } from '../scripts/audit-fagverk-musikk.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='data/fag/musikk/musikkvitenskap_canonical_v1';
const INDEX=`${BASE}/index.json`;
const THEORY=`${BASE}/theory_and_debates_v1.json`;
const BINDINGS=`${BASE}/theory_integrity_bindings_v1.json`;
const REGISTRY='data/fagverk/fagverk_registry.json';
const REPORT='reports/fagverk/musikk-theory-integrity-audit.json';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const unique=(xs,key)=>new Set(xs.map(key)).size===xs.length;
const authorMatches=(creators,name)=>norm(name).split(' ').filter(Boolean).every(part=>norm(creators.join(' ')).split(' ').includes(part));

function corpusFor(chapterRecord){
  const chapter=json(chapterRecord.file), sections=new Map(), modules=new Set(chapter.moduleFiles||[]);
  for(const moduleFile of modules){
    const module=json(moduleFile);
    for(const section of module.sections||[])sections.set(section.id,{...section,moduleFile});
  }
  const ledger=json(chapter.claimsFile);
  return {chapter,modules,sections,claims:new Map(ledger.claims.map(row=>[row.id,row])),sources:new Map(ledger.sources.map(row=>[row.id,row]))};
}

export function auditMusikkTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const complete=auditRepository({checkReport:true}).report;
  const index=json(INDEX), theory=json(THEORY), bridge=json(BINDINGS), registry=json(REGISTRY).subjects.musikk;
  assert(index.subject_id==='musikk'&&bridge.subject_id==='musikk','Ugyldig Musikk-fag eller proof bridge');
  assert(bridge.schema==='history_go_musikk_theory_integrity_bindings_v1'&&bridge.status==='canonical','Musikk proof bridge må være canonical v1');
  assert(bridge.completion_status_read_only===true&&bridge.content_mutation===false,'Musikk proof bridge må være read-only uten corpusmutasjon');
  assert(/proveniens.+ikke trivia/iu.test(bridge.production_rule)&&/faktiske avsnitt/iu.test(bridge.production_rule),'Musikk proof bridge mangler anti-trivia-/prosaregel');
  assert(complete.summary.domainCount===8&&complete.summary.chapterCount===8,'Musikk strict gate forventer åtte canonicale feltkapitler');
  assert(complete.summary.emneCount===48&&complete.summary.methodCount===18,'Musikk canonical emne-/metodegrunnlag har endret tellinger');
  assert(index.summary.theoretical_tradition_count===25&&index.summary.research_debate_count===16,'Musikk teori-/debattgrunnlag har endret tellinger');
  assert(complete.summary.verifiedScholarlySourceRecordCount===156,'Musikk scholarly source-grunnlag har endret telling');
  assert(complete.summary.chapterClaimCount===55&&complete.summary.chapterSourceCount===67,'Musikk claim-/kildeprojeksjon har endret tellinger');
  assert(complete.summary.chapterModuleCount===24&&complete.summary.chapterSectionCount===72&&complete.summary.chapterParagraphCount===216,'Musikk materialisert corpus har endret tellinger');

  const moduleRows=index.files.canonical_modules.map(pointer=>json(`${BASE}/${pointer}`));
  const domains=new Map(moduleRows.map(row=>[row.domain.domain_id,row]));
  const topics=new Map(moduleRows.flatMap(row=>row.topics.map(topic=>[topic.emne_id,topic])));
  const traditions=new Map(theory.theoretical_traditions.map(row=>[row.theory_id,row]));
  const debates=new Map(theory.research_debates.map(row=>[row.debate_id,row]));
  const chapters=new Map(registry.chapters.map(row=>[row.primary_domain_id,row]));
  const scholarlyRows=index.files.scholarly_source_registries.flatMap(pointer=>{
    const registryPath=`${BASE}/${pointer}`;
    return json(registryPath).sources.map(source=>({...source,registryPath}));
  });
  const scholarly=new Map(scholarlyRows.map(row=>[row.source_id,row]));
  assert(domains.size===8&&chapters.size===8&&topics.size===48,'Musikk strict gate krever åtte felt og 48 unike emner');
  assert(traditions.size===25&&debates.size===16,'Musikk strict gate krever 25 teoritradisjoner og 16 forskningsdebatter');
  assert(scholarly.size===156&&scholarlyRows.length===156,'Musikk strict gate krever 156 unike scholarly source records');
  assert(bridge.fields.length===8&&new Set(bridge.fields.map(row=>row.domain_id)).size===8,'Musikk bridge må dekke åtte felt nøyaktig én gang');

  const usedObjectIds=[], usedSourceIds=[], rows=[];
  for(const field of bridge.fields){
    const domain=domains.get(field.domain_id), chapterRecord=chapters.get(field.domain_id);
    assert(domain&&chapterRecord,`Ukjent Musikk-felt i bridge: ${field.domain_id}`);
    assert(field.theory_objects?.length===2,`${field.domain_id}: strict proof krever eksakt to theory objects`);
    assert(unique(field.theory_objects,row=>row.id),`${field.domain_id}: duplisert theory object`);
    const objectIds=field.theory_objects.map(row=>row.id);
    assert(new Set(field.comparison?.theory_object_ids||[]).size===2&&objectIds.every(id=>field.comparison.theory_object_ids.includes(id)),`${field.domain_id}: comparison må binde begge theory objects`);
    assert(text(field.comparison.interpretive_consequence).length>=120,`${field.domain_id}: comparison mangler fortolkningskonsekvens`);
    const corpus=corpusFor(chapterRecord), names=[];
    for(const object of field.theory_objects){
      usedObjectIds.push(object.id); names.push(object.theorist?.name);
      const topic=topics.get(object.emne_id), tradition=traditions.get(object.theory_id), debate=debates.get(object.debate_id);
      assert(topic?.domain_id===field.domain_id,`${object.id}: emnet ligger ikke i feltet`);
      assert(topic.theoretical_tradition_ids?.includes(object.theory_id)&&tradition,`${object.id}: teorien er ikke canonicalt bundet til emnet`);
      assert(topic.research_debate_ids?.includes(object.debate_id)&&debate,`${object.id}: debatten er ikke canonicalt bundet til emnet`);
      assert(text(tradition.analytical_use)&&text(tradition.limit)&&debate.required_handling?.includes('vis minst én motposisjon eller begrensning'),`${object.id}: canonical teori/debatt mangler strict struktur`);
      const source=scholarly.get(object.theorist?.scholarly_source_id);
      assert(source&&source.title===object.theorist.work,`${object.id}: person er ikke bundet til eksisterende scholarly work`);
      assert(authorMatches(source.creators||[],object.theorist.name),`${object.id}: personen er ikke forfatter/redaktør av scholarly work`);
      assert(/^https:\/\//.test(source.canonical_url)&&text(source.publisher_or_journal),`${object.id}: scholarly source er ikke inspiserbar`);
      assert(/scholarly|peer_reviewed|edited_scholarly/.test(source.publication_type)&&text(source.verification?.status),`${object.id}: scholarly source mangler faglig verifikasjon`);
      assert(source.source_roles?.length&&source.allowed_use?.length&&source.forbidden_use?.length,`${object.id}: scholarly source mangler bruk-/grensekontrakt`);
      usedSourceIds.push(source.source_id);
      for(const key of ['scope','core_claim_or_mechanism','evidence_or_observable_basis','rival_or_alternative','interpretive_consequence'])assert(text(object[key]).length>=90,`${object.id}: mangler substansiell ${key}`);
      assert(object.limitations?.length>=2&&object.limitations.every(row=>text(row).length>=55),`${object.id}: mangler minst to reelle begrensninger`);
      const rivalSurname=field.theory_objects.find(row=>row.id!==object.id).theorist.name.split(' ').at(-1);
      assert(norm(object.rival_or_alternative).includes(norm(rivalSurname)),`${object.id}: rivalen er ikke eksplisitt navngitt`);
      const binding=object.claim_binding;
      assert(binding?.chapter_id===chapterRecord.id&&corpus.modules.has(binding.module_file),`${object.id}: kapittel/modul-binding avviker`);
      const section=corpus.sections.get(binding.section_id), claim=corpus.claims.get(binding.claim_id);
      assert(section?.moduleFile===binding.module_file,`${object.id}: faktisk seksjon finnes ikke i bundet modul`);
      assert(Number.isInteger(binding.paragraph_index)&&binding.paragraph_index>=0&&binding.paragraph_index<section.paragraphs.length,`${object.id}: paragraph_index er ugyldig`);
      assert(section.paragraphClaimIds?.[binding.paragraph_index]?.includes(binding.claim_id),`${object.id}: claim er ikke bundet til faktisk avsnitt`);
      assert(claim?.status==='verified',`${object.id}: claim er ikke verified`);
      assert(binding.source_ids?.length&&binding.source_ids.every(id=>claim.source_ids.includes(id)&&corpus.sources.has(id)),`${object.id}: anvendt claim-kilde er ikke i ledger`);
      assert(text(section.paragraphs[binding.paragraph_index]).length>=120,`${object.id}: faktisk prosa er ikke substansiell`);
    }
    assert(new Set(names).size===2,`${field.domain_id}: strict proof krever to forskjellige personer`);
    rows.push({domainId:field.domain_id,strictlyProven:true,theoryObjectCount:2,scholarlySourceCount:2,personWorkBindingCount:2,claimBindingCount:2,proseBindingCount:2});
  }
  assert(new Set(usedObjectIds).size===16&&usedObjectIds.length===16,'Musikk strict gate krever 16 unike theory objects');
  assert(new Set(usedSourceIds).size===16&&usedSourceIds.length===16,'Alle 16 scholarly sources må brukes eksakt én gang');
  const report={
    schema:'history_go_musikk_theory_integrity_audit_v1',version:'1.0.0',subject_id:'musikk',status:'STRICTLY_PROVEN',proof_scope:'per_canonical_major_field',
    completion_status_read_only:true,content_rewrite_required:false,
    summary:{canonicalMajorFields:8,fieldsStrictlyProven:8,theoryObjects:16,scholarlySources:16,personWorkBindings:16,claimBindings:16,actualProseBindings:16,explicitProofBridges:16,substantiveContentGapsProven:0},
    lockedBaseline:{topics:48,methods:18,theoreticalTraditions:25,researchDebates:16,verifiedScholarlySourceRecords:156,chapterClaims:55,chapterSources:67,modules:24,sections:72,paragraphs:216},
    sourceModel:{theoryGrounding:'canonical topic + tradition + debate + named person + existing verified scholarly work',appliedEvidence:'verified claim + inspectable ledger source + exact module/section/paragraph binding'},
    fields:rows
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditMusikkTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Musikk theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
