#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={
  index:'data/fag/teknologi/teknologi_scientific_v2/index.json',
  fagkart:'data/fag/teknologi/fagkart_teknologi_canonical_v3.json',
  emner:'data/fag/teknologi/emner_teknologi_canonical_v3.json',
  methods:'data/fag/teknologi/methods_teknologi_canonical_v3.json',
  theoryRegistry:'data/fag/teknologi/teknologi_scientific_v2/theory_quality_registry_v2_1.json',
  sources:'data/fag/teknologi/teknologi_scientific_v2/source_registry_v2_3.json',
  editorialContract:'data/fag/teknologi/editorial_contract_teknologi_v3.json',
  editorialReport:'reports/teknologi-editorial-v3-validation.json',
  binding:'data/fag/teknologi/theory_integrity_bindings_teknologi_v1.json',
  report:'reports/fagverk/teknologi-theory-integrity-audit.json'
};
const abs=p=>path.join(ROOT,p);
const json=p=>JSON.parse(fs.readFileSync(abs(p),'utf8'));
const arr=v=>Array.isArray(v)?v:[];
const clean=v=>String(v??'').trim();
const uniq=xs=>[...new Set(xs)];
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const normalized=v=>clean(v).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const SOURCE_TYPES=new Set([
  'official_handbook','scholarly_textbook','technical_standard','scholarly_monograph','official_investigation',
  'primary_research','official_research_report','official_specification','professional_reference','official_framework',
  'official_standard_guidance','official_web_standard','scholarly_collection'
]);
const PROSE_FIELDS=['definition','why_it_matters','learning_outcomes','canonical_mechanisms','mandatory_failure_modes','misconceptions','boundary_note','assessment_prompt'];

function load(){
  return {
    index:json(P.index), fagkart:json(P.fagkart), emner:json(P.emner), methods:json(P.methods),
    theoryRegistry:json(P.theoryRegistry), sources:json(P.sources), contract:json(P.editorialContract), editorial:json(P.editorialReport)
  };
}
function sourceIdsForTheory(sources,theoryId){
  return uniq(arr(sources.sources).filter(s=>arr(s.supports?.knowledge_object_ids).includes(theoryId)).map(s=>s.id)).sort();
}
function thinkerWorkBindings(category,theoryId){
  const thinkerById=new Map(arr(category.thinkers).map(t=>[t.id,t]));
  const ids=uniq(arr(category.topic_hooks).filter(h=>arr(h.theory_ids).includes(theoryId)).flatMap(h=>arr(h.thinker_ids)));
  return ids.map(id=>thinkerById.get(id)).filter(Boolean).map(t=>({thinker_id:t.id,name:t.name,work:t.work,role:t.role}));
}
function topicIdsForTheory(category,topics,theoryId){
  const allowed=new Set(arr(category.focus));
  return topics.filter(t=>allowed.has(t.emne_id)&&arr(t.theory_ids).includes(theoryId)).map(t=>t.emne_id).sort();
}

export function buildTechnologyTheoryIntegrityBindings(){
  const {fagkart,emner,sources}=load();
  const fields=arr(fagkart.categories).map(category=>({
    area_id:category.id,
    emne_ids:[...arr(category.focus)].sort(),
    theory_ids:arr(category.theory_objects).map(t=>t.id).sort(),
    hook_ids:arr(category.topic_hooks).map(h=>h.id).sort(),
    comparison_basis:[...arr(category.comparison_basis)],
    theory_bindings:arr(category.theory_objects).map(t=>({
      theory_id:t.id,
      canonical_emne_ids:topicIdsForTheory(category,emner,t.id),
      thinker_work_bindings:thinkerWorkBindings(category,t.id),
      scholarly_source_ids:sourceIdsForTheory(sources,t.id),
      prose_binding_fields:[...PROSE_FIELDS]
    })).sort((a,b)=>a.theory_id.localeCompare(b.theory_id))
  })).sort((a,b)=>a.area_id.localeCompare(b.area_id));
  return {
    schema:'history_go_teknologi_theory_integrity_bindings_v1',version:'1.0.0',status:'read_only_proof_sidecar',
    subject_id:'teknologi',profile:'hybrid',parent_subject:'vitenskap',completion_status_read_only:true,content_mutation:false,
    proof_rule:'Strict proof is derived from the active Technology V3 canonical emne prose plus the V2 scientific theory, thinker/work and source layers. The sidecar adds no subject claims and is reproducible from those sources.',
    source_files:[P.index,P.fagkart,P.emner,P.methods,P.theoryRegistry,P.sources,P.editorialContract,P.editorialReport],
    fields
  };
}

export function auditTechnologyTheoryIntegrity({writeBindings=false,checkBindings=true,writeReport=false,checkReport=true}={}){
  const d=load();
  assert(d.index.subject_id==='teknologi'&&d.index.status==='canonical_scientific_subject','Teknologi scientific index er ikke canonical');
  assert(d.fagkart.subject_id==='teknologi'&&d.fagkart.version==='3.0-canonical'&&d.fagkart.status==='canonical','Teknologi fagkart er ikke active canonical V3');
  assert(d.contract.subject_id==='teknologi'&&d.contract.version==='3.0'&&d.contract.status==='canonical','Teknologi editorial contract er ikke canonical V3');
  assert(d.editorial.status==='passed'&&d.editorial.failures_count===0&&d.editorial.passes>=1600,'Teknologi editorial V3 validator må være grønn');

  const categories=arr(d.fagkart.categories), topics=arr(d.emner), methods=arr(d.methods.methods), theories=arr(d.theoryRegistry.theories), sources=arr(d.sources.sources);
  const hooks=categories.flatMap(c=>arr(c.topic_hooks)), thinkers=categories.flatMap(c=>arr(c.thinkers)), fieldTheories=categories.flatMap(c=>arr(c.theory_objects));
  assert(categories.length===12,'Teknologi skal ha 12 canonicale hovedfelt');
  assert(topics.length===48,'Teknologi skal ha 48 canonicale emner');
  assert(methods.length===35,'Teknologi skal ha 35 canonicale metoder');
  assert(hooks.length===36,'Teknologi skal ha 36 canonicale hooks');
  assert(thinkers.length===60,'Teknologi skal ha 60 registrerte faglige bidragsytere');
  assert(fieldTheories.length===24&&theories.length===24,'Teknologi skal ha 24 theory objects i både fagkart og quality registry');
  assert(sources.length===37,'Teknologi skal ha 37 canonicale kilder');
  assert(new Set(categories.map(c=>c.id)).size===12,'Teknologi har dupliserte hovedfelt');
  assert(new Set(topics.map(t=>t.emne_id)).size===48,'Teknologi har dupliserte emner');
  assert(new Set(fieldTheories.map(t=>t.id)).size===24,'Teknologi har dupliserte theory objects');
  assert(new Set(thinkers.map(t=>t.id)).size===60,'Teknologi har dupliserte thinker IDs');

  const topicById=new Map(topics.map(t=>[t.emne_id,t]));
  const theoryById=new Map(theories.map(t=>[t.id,t]));
  const sourceById=new Map(sources.map(s=>[s.id,s]));
  const allFocus=categories.flatMap(c=>arr(c.focus));
  assert(allFocus.length===48&&new Set(allFocus).size===48,'Hvert Teknologi-emne må eies av nøyaktig ett canonicalt hovedfelt');
  assert(allFocus.every(id=>topicById.has(id)),'Fagkart focus peker til ukjent Teknologi-emne');

  const fieldProof=[];
  for(const category of categories){
    assert(category.editorial_status==='reviewed_v3'&&category.coverage_status==='strong',`Hovedfelt er ikke reviewed/strong: ${category.id}`);
    assert(arr(category.focus).length===4,`Hovedfelt må ha fire canonicale emner: ${category.id}`);
    assert(arr(category.theory_objects).length===2,`Hovedfelt må ha to bærende theory objects: ${category.id}`);
    assert(arr(category.thinkers).length===5,`Hovedfelt må ha fem faglige bidragsytere: ${category.id}`);
    assert(arr(category.topic_hooks).length===3,`Hovedfelt må ha tre problem-hooks: ${category.id}`);
    assert(arr(category.canonical_mechanisms).length>=5&&arr(category.mandatory_failure_modes).length>=3&&arr(category.comparison_basis).length>=4,`Hovedfelt mangler mekanisme/feil/sammenligning: ${category.id}`);
    assert(clean(category.boundary_note).length>=60,`Hovedfelt mangler eksplisitt faggrense: ${category.id}`);
    const q=[];
    for(const theory of arr(category.theory_objects)){
      const quality=theoryById.get(theory.id);
      assert(quality&&quality.area_id===category.id,`Theory quality record mangler: ${theory.id}`);
      assert(clean(quality.scope).length>=40&&arr(quality.assumptions).length>=2&&clean(quality.mechanism_or_logic).length>=50,`Theory mangler scope/forutsetninger/mekanisme: ${theory.id}`);
      assert(arr(quality.observable_indicators).length>=2&&arr(quality.limitations).length>=2&&arr(quality.misuse_risks).length>=2,`Theory mangler evidens/begrensning/misbruk: ${theory.id}`);
      const boundTopics=topicIdsForTheory(category,topics,theory.id);
      assert(boundTopics.length>=1,`Theory mangler canonical emne-binding: ${theory.id}`);
      for(const emneId of boundTopics){
        const t=topicById.get(emneId);
        assert(clean(t.why_it_matters).length>=120&&arr(t.learning_outcomes).length>=3&&clean(t.assessment_prompt).length>=80,`Theory-bound emne mangler substansiell læringsprosa: ${theory.id}/${emneId}`);
        assert(arr(t.canonical_mechanisms).length>=5&&arr(t.mandatory_failure_modes).length>=3&&arr(t.misconceptions).length>=2,`Theory-bound emne mangler mekanisme/feil/avgrensning: ${theory.id}/${emneId}`);
        assert(t.source_gate==='blocked_without_external_source_anchor_and_locator'&&t.requires_uncertainty_statement===true,`Theory-bound emne mangler source/uncertainty gate: ${emneId}`);
        assert(!clean(t.why_it_matters).startsWith('Emnet gjør det mulig å analysere'),`Generisk theory-padding funnet: ${emneId}`);
      }
      const works=thinkerWorkBindings(category,theory.id);
      assert(works.length>=2&&works.every(x=>clean(x.name).length>3&&clean(x.work).length>5&&clean(x.role).length>5),`Theory mangler person→verk-bidrag i hook: ${theory.id}`);
      const sourceIds=sourceIdsForTheory(d.sources,theory.id);
      assert(sourceIds.length>=1,`Theory mangler scholarly/authoritative source: ${theory.id}`);
      for(const id of sourceIds){
        const s=sourceById.get(id);
        assert(s&&SOURCE_TYPES.has(s.type),`Theory bruker ikke-faglig source type: ${theory.id}/${id}`);
        assert(clean(s.title).length>5&&clean(s.publisher_or_author).length>2&&clean(s.locator).length>8,`Theory source mangler bibliografisk lokator: ${theory.id}/${id}`);
        assert(arr(s.claim_classes).length>=1,`Theory source mangler claim classes: ${theory.id}/${id}`);
      }
      q.push({theory_id:theory.id,emne_count:boundTopics.length,person_work_count:works.length,source_count:sourceIds.length,limitations:arr(quality.limitations).length});
    }
    const [a,b]=arr(category.theory_objects).map(t=>theoryById.get(t.id));
    assert(a&&b&&a.id!==b.id&&normalized(a.scope)!==normalized(b.scope)&&normalized(a.mechanism_or_logic)!==normalized(b.mechanism_or_logic),`Hovedfelt mangler reelt alternativt teori-/modellpar: ${category.id}`);
    fieldProof.push({area_id:category.id,status:'STRICTLY_PROVEN',emne_count:4,theory_count:2,hook_count:3,thinker_count:5,comparison_basis_count:arr(category.comparison_basis).length,theories:q});
  }

  for(const t of topics){
    assert(arr(t.theory_ids).length>=1&&arr(t.theory_ids).every(id=>theoryById.has(id)),`Emne mangler gyldig theory binding: ${t.emne_id}`);
  }
  for(const theory of theories){
    assert(topics.some(t=>arr(t.theory_ids).includes(theory.id)),`Theory er metadata-only og mangler emnebruk: ${theory.id}`);
    assert(hooks.some(h=>arr(h.theory_ids).includes(theory.id)),`Theory mangler problem-hook: ${theory.id}`);
    assert(sourceIdsForTheory(d.sources,theory.id).length>=1,`Theory mangler source binding: ${theory.id}`);
  }

  const expectedBinding=buildTechnologyTheoryIntegrityBindings();
  if(writeBindings){fs.mkdirSync(path.dirname(abs(P.binding)),{recursive:true});fs.writeFileSync(abs(P.binding),`${JSON.stringify(expectedBinding,null,2)}\n`);}
  if(checkBindings){assert(fs.existsSync(abs(P.binding)),`${P.binding} mangler`);assert(JSON.stringify(json(P.binding))===JSON.stringify(expectedBinding),`${P.binding} er utdatert`);}

  const strictDimensions={canonical_field_coverage:'verified',structured_scope_mechanism:'verified',limitations:'verified',rival_or_alternative:'verified',person_work_binding:'verified',scholarly_source_quality:'verified',claim_or_content_binding:'verified',actual_prose_binding:'verified',anti_trivia_rule:'verified',universal_subject_scope:'verified'};
  const report={
    schema:'history_go_teknologi_theory_integrity_audit_v1',version:'1.0.0',status:'STRICTLY_PROVEN',subject_id:'teknologi',profile:'hybrid',parent_subject:'vitenskap',
    completion_status_read_only:true,content_rewrite_required:false,substantive_content_gaps:[],strict_dimensions:strictDimensions,
    summary:{canonical_fields:12,strictly_proven_fields:12,canonical_emner:48,methods:35,hooks:36,theory_objects:24,thinkers:60,scholarly_or_authoritative_sources:37,editorial_validator_passes:d.editorial.passes},
    field_proof:fieldProof
  };
  if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(report,null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(P.report)),`${P.report} mangler`);assert(JSON.stringify(json(P.report))===JSON.stringify(report),`${P.report} er utdatert`);}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Set(process.argv.slice(2));
  try{
    const result=auditTechnologyTheoryIntegrity({writeBindings:args.has('--write-bindings'),checkBindings:!args.has('--no-check-bindings'),writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')});
    console.log(JSON.stringify(result,null,2));
  }catch(error){console.error(`Teknologi theory integrity FEIL: ${error.message}`);process.exit(1);}
}
