#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditMediaComplete } from '../scripts/audit-fagverk-media-complete.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const FAGKART='data/fag/media/fagkart_media_canonical_v4_5.json';
const REGISTRY='data/fagverk/fagverk_registry.json';
const BINDINGS='data/fag/media/theory_integrity_bindings_media_v1.json';
const REPORT='reports/fagverk/media-theory-integrity-audit.json';
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const text=v=>String(v??'').trim();
const norm=v=>text(v).toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const unique=(xs,key)=>new Set(xs.map(key)).size===xs.length;
const AUTH=new Set(['scholarly_book','peer_reviewed_article','scholarly_book_chapter']);
const authorMatches=(author,name)=>norm(name).split(' ').filter(Boolean).every(part=>norm(author).split(' ').includes(part));

function corpusFor(chapterRecord){
  const chapter=json(chapterRecord.file), sections=new Map(), modules=new Set(chapter.moduleFiles||[]);
  for(const moduleFile of modules){
    const module=json(moduleFile);
    for(const section of module.sections||[])sections.set(section.id,{...section,moduleFile});
  }
  const ledger=json(chapter.claimsFile);
  return {chapter,modules,sections,claims:new Map(ledger.claims.map(row=>[row.id,row])),sources:new Map(ledger.sources.map(row=>[row.id,row]))};
}

export function auditMediaTheoryIntegrity({writeReport=false,checkReport=true}={}){
  const complete=auditMediaComplete({checkReport:true}).report;
  const fagkart=json(FAGKART), registry=json(REGISTRY).subjects.media, bridge=json(BINDINGS);
  assert(fagkart.subject_id==='media'&&bridge.subject_id==='media','Ugyldig Media-fag eller proof bridge');
  assert(fagkart.principles?.source_first===true,'Media strict gate krever source-first');
  assert(fagkart.principles?.external_claim_basis_required===true,'Media strict gate krever ekstern claim-basis');
  assert(fagkart.principles?.newsroom_public_sphere_source_or_platform_before_theory===true,'Media strict gate krever mediecase før teori');
  assert(fagkart.principles?.no_generic_media_questions===true,'Media strict gate må blokkere generisk teori-trivia');
  assert(bridge.schema==='history_go_media_theory_integrity_bindings_v1'&&bridge.status==='canonical','Media proof bridge må være canonical v1');
  assert(bridge.completion_status_read_only===true&&bridge.content_mutation===false,'Media proof bridge må være read-only uten corpusmutasjon');
  assert(/proveniens.+ikke trivia/iu.test(bridge.production_rule)&&/faktiske avsnitt/iu.test(bridge.production_rule),'Media proof bridge mangler anti-trivia-/prosaregel');
  assert(complete.summary.domainCount===6&&complete.summary.chapterCount===6,'Media strict gate forventer seks canonicale feltkapitler');
  assert(complete.summary.emneCount===120&&complete.summary.methodCount===115&&complete.summary.hookCount===60,'Media canonical baseline har endret tellinger');
  assert(complete.summary.claimCount===160&&complete.summary.sourceCount===126,'Media claim-/kildegrunnlag har endret tellinger');

  const domains=new Map(fagkart.categories.map(row=>[row.id,row]));
  const chapters=new Map(registry.chapters.map(row=>[row.primary_domain_id,row]));
  const sources=new Map(bridge.scholarly_sources.map(row=>[row.id,row]));
  assert(domains.size===6&&chapters.size===6,'Media strict gate krever seks unike canonicale felt og kapitler');
  assert(bridge.fields.length===6&&new Set(bridge.fields.map(row=>row.domain_id)).size===6,'Media bridge må dekke seks felt nøyaktig én gang');
  assert(sources.size===12&&bridge.scholarly_sources.length===12,'Media bridge må ha tolv unike scholarly sources');
  for(const source of sources.values()){
    assert(source.authors?.length&&text(source.title)&&text(source.publisher)&&/^https:\/\//.test(source.url),`Ufullstendig scholarly source: ${source.id}`);
    assert(AUTH.has(source.source_authority_class)&&text(source.source_location).length>=25,`Ikke-faglig eller uinspiserbar scholarly source: ${source.id}`);
  }

  const usedTheoryIds=[], usedSourceIds=[], rows=[];
  for(const field of bridge.fields){
    const domain=domains.get(field.domain_id), chapterRecord=chapters.get(field.domain_id);
    assert(domain&&chapterRecord,`Ukjent Media-felt i bridge: ${field.domain_id}`);
    assert(field.theory_objects?.length===2,`${field.domain_id}: strict proof krever eksakt to theory objects`);
    const objectIds=field.theory_objects.map(row=>row.id);
    assert(unique(field.theory_objects,row=>row.id),`${field.domain_id}: duplisert theory object`);
    assert(new Set(field.comparison?.theory_object_ids||[]).size===2&&objectIds.every(id=>field.comparison.theory_object_ids.includes(id)),`${field.domain_id}: comparison må binde begge theory objects`);
    assert(text(field.comparison.interpretive_consequence).length>=120,`${field.domain_id}: comparison mangler fortolkningskonsekvens`);
    const corpus=corpusFor(chapterRecord), theoristIds=[];
    for(const object of field.theory_objects){
      usedTheoryIds.push(object.id); theoristIds.push(object.theorist?.id);
      const hook=(domain.topic_hooks||[]).find(row=>row.id===object.hook_id);
      assert(hook,`${object.id}: hook finnes ikke i canonicalt felt`);
      assert(hook.generator_constraints?.do_not_generate_from_hook_label_only===true,`${object.id}: hook tillater metadata-only teori`);
      assert(object.emne_ids?.length&&object.emne_ids.every(id=>(hook.emne_ids||[]).includes(id)),`${object.id}: emne-binding ligger utenfor hook`);
      const canonical=(hook.canon?.thinkers||[]).find(row=>row.id===object.theorist?.id);
      assert(canonical&&canonical.name===object.theorist.name&&canonical.role===object.theorist.canonical_role,`${object.id}: person/rolle avviker fra canonical fagkart`);
      const scholarly=sources.get(object.theorist.scholarly_source_id);
      assert(scholarly&&scholarly.title===object.theorist.work,`${object.id}: person er ikke bundet til scholarly work`);
      assert(scholarly.authors.some(author=>authorMatches(author,object.theorist.name)),`${object.id}: personen er ikke forfatter av scholarly work`);
      usedSourceIds.push(scholarly.id);
      assert(text(object.theorist.contribution).length>=100,`${object.id}: forskningsbidrag er for kort`);
      for(const key of ['scope','core_claim_or_mechanism','evidence_or_observable_basis','rival_or_alternative','interpretive_consequence'])assert(text(object[key]).length>=100,`${object.id}: mangler substansiell ${key}`);
      assert(object.limitations?.length>=2&&object.limitations.every(row=>text(row).length>=55),`${object.id}: mangler minst to reelle begrensninger`);
      const rivalName=field.theory_objects.find(row=>row.id!==object.id).theorist.name.split(' ').at(-1);
      assert(norm(object.rival_or_alternative).includes(norm(rivalName)),`${object.id}: rivalen er ikke eksplisitt navngitt`);
      assert(object.claim_bindings?.length===1,`${object.id}: forventer én eksplisitt claim/prosa-binding`);
      for(const binding of object.claim_bindings){
        assert(binding.chapter_id===chapterRecord.id&&corpus.modules.has(binding.module_file),`${object.id}: kapittel/modul-binding avviker`);
        const section=corpus.sections.get(binding.section_id), claim=corpus.claims.get(binding.claim_id);
        assert(section&&section.moduleFile===binding.module_file,`${object.id}: faktisk seksjon finnes ikke i bundet modul`);
        assert(Number.isInteger(binding.paragraph_index)&&binding.paragraph_index>=0&&binding.paragraph_index<section.paragraphs.length,`${object.id}: paragraph_index er ugyldig`);
        assert(section.paragraphClaimIds?.[binding.paragraph_index]?.includes(binding.claim_id),`${object.id}: claim er ikke bundet til faktisk avsnitt`);
        assert(claim?.status==='verified'&&claim.used_in?.includes(binding.section_id),`${object.id}: claim er ikke verified/used_in`);
        assert(binding.source_ids?.length&&binding.source_ids.every(id=>claim.source_ids.includes(id)&&corpus.sources.has(id)),`${object.id}: anvendt claim-kilde er ikke i ledger`);
        if(scholarly.existing_source_id)assert(binding.source_ids.includes(scholarly.existing_source_id),`${object.id}: eksisterende scholarly source er ikke claim-bundet`);
        assert(text(section.paragraphs[binding.paragraph_index]).length>=120,`${object.id}: faktisk prosa er ikke substansiell`);
      }
    }
    assert(new Set(theoristIds).size===2,`${field.domain_id}: strict proof krever to canonicale personer`);
    rows.push({domainId:field.domain_id,strictlyProven:true,theoryObjectCount:2,scholarlySourceCount:2,personWorkBindingCount:2,claimBindingCount:2,proseBindingCount:2});
  }
  assert(new Set(usedTheoryIds).size===12&&usedTheoryIds.length===12,'Media strict gate krever tolv unike theory objects');
  assert(new Set(usedSourceIds).size===12&&usedSourceIds.length===12,'Alle tolv scholarly sources må brukes eksakt én gang');
  const report={
    schema:'history_go_media_theory_integrity_audit_v1',version:'1.0.0',subject_id:'media',status:'STRICTLY_PROVEN',proof_scope:'per_canonical_major_field',
    completion_status_read_only:true,content_rewrite_required:false,
    summary:{canonicalMajorFields:6,fieldsStrictlyProven:6,theoryObjects:12,scholarlySources:12,personWorkBindings:12,claimBindings:12,actualProseBindings:12,explicitProofBridges:12,substantiveContentGapsProven:0},
    sourceModel:{theoryGrounding:'canonical person + real work + academically appropriate source',appliedEvidence:'verified claim + inspectable used source + exact module/section/paragraph binding'},
    fields:rows
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(REPORT)),{recursive:true});fs.writeFileSync(abs(REPORT),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(REPORT)),`${REPORT} mangler`);assert(JSON.stringify(json(REPORT))===JSON.stringify(report),`${REPORT} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{console.log(JSON.stringify(auditMediaTheoryIntegrity({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')}),null,2));}
  catch(error){console.error(`Media theory integrity FEIL: ${error.message}`);process.exitCode=1;}
}
