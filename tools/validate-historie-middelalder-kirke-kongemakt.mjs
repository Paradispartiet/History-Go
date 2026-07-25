#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const h=path.join(root,'data/fag/historie');
const read=(f)=>JSON.parse(fs.readFileSync(path.join(h,f),'utf8'));
const pensum=read('historiepensum_canonical_v4_5.json');
const fagkart=read('fagkart_historie_canonical_v4_5.json');
const emner=read('emner_historie_canonical_v4_5.json');
const mappings=read('emnemapping_historie_canonical_v4_5.json');
const methods=read('methods_historie_canonical_v4_5.json').methods||[];
const domainId='his_middelalder_kirke_kongemakt';
const domain=pensum.domains.find(x=>x.domain_id===domainId);
const category=fagkart.categories.find(x=>x.id===domainId);
const emneById=new Map(emner.map(x=>[x.emne_id,x]));
const mappingById=new Map(mappings.map(x=>[x.emne_id,x]));
const methodIds=new Set(methods.map(x=>x.method_id));
const hookIds=new Set((category?.topic_hooks||[]).map(x=>x.id));
const errors=[];
const fail=(ok,msg)=>{if(!ok)errors.push(msg)};
fail(domain?.status==='complete_revised','domain status');
fail(domain?.emne_ids?.length===10,'10 emner');
fail(domain?.hook_ids?.length===10,'10 hooks');
fail(domain?.method_ids?.length>=9,'9 methods');
fail(domain?.recommended_oslo_cases?.length>=8,'8 cases');
fail(domain?.canonical_thinker_ids?.length>=6,'6 thinkers');
fail(domain?.norwegian_thinker_ids?.length>=1,'Norwegian path');
fail(domain?.domain_chain?.length>=10,'domain chain');
fail(Object.keys(domain?.boundary_rules||{}).length>=3,'boundary rules');
fail(domain?.source_limitation_required===true,'source limitation');
fail(domain?.critical_distinction_required===true,'critical distinction');
for(const id of domain?.hook_ids||[]) fail(hookIds.has(id),'missing hook '+id);
for(const id of domain?.method_ids||[]) fail(methodIds.has(id),'missing method '+id);
for(const id of domain?.emne_ids||[]){const e=emneById.get(id);const m=mappingById.get(id);fail(!!e,'missing emne '+id);if(!e)continue;fail((e.core_concepts||[]).length>=4,id+' core concepts');fail((e.sub_concepts||[]).length>=4,id+' sub concepts');fail((e.key_questions||[]).length>=3,id+' questions');fail((e.analysis_axes||[]).length>=3,id+' axes');fail((e.method_ids||[]).length>=2,id+' methods');fail((e.recommended_oslo_cases||[]).length>=4,id+' cases');fail((e.historiographical_conflicts||e.conflicts||[]).length>0,id+' historiography');fail((e.anti_patterns||[]).length>0,id+' anti patterns');fail(e.generator_constraints?.require_external_claim_basis===true,id+' external source');fail(e.generator_constraints?.require_temporal_scope===true,id+' temporal scope');fail(e.generator_constraints?.require_source_limitation===true,id+' source limitation');fail(e.generator_constraints?.require_critical_distinction===true,id+' critical distinction');fail((e.distinguish_from_emners||[]).length>0&&typeof e.overlap_resolution_note==='string',id+' overlap');fail(!!m,id+' mapping');if(m){const tiers=new Set((m.mappings||[]).map(x=>x.mapping_tier));fail((m.mappings||[]).length>=2&&tiers.has('primary')&&tiers.has('secondary'),id+' two lane mapping');for(const lane of m.mappings||[])fail(hookIds.has(lane.topic_hook),id+' unknown mapping hook '+lane.topic_hook)}}
const legacy=category?.topic_hooks?.find(x=>x.id==='his_middelalder_by_kirke');
for(const id of ['em_his_middelalder_oslo','em_his_kirke_kloster_middelalder','em_his_kongemakt_kirke_konflikt'])fail(legacy?.emne_ids?.includes(id),'legacy hook compatibility '+id);
if(errors.length){console.error('Middelalder V5.5 validation failed ('+errors.length+')');for(const e of errors)console.error('- '+e);process.exit(1)}
console.log(JSON.stringify({status:'PASS',domain_id:domainId,emner:domain.emne_ids.length,hooks:domain.hook_ids.length,methods:domain.method_ids.length,cases:domain.recommended_oslo_cases.length,thinkers:domain.canonical_thinker_ids.length},null,2));
