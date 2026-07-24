#!/usr/bin/env node
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const f=read("data/fag/historie/fagkart_historie_canonical_v4_5.json");
const e=read("data/fag/historie/emner_historie_canonical_v4_5.json");
const m=read("data/fag/historie/methods_historie_canonical_v4_5.json");
const map=read("data/fag/historie/emnemapping_historie_canonical_v4_5.json");
const p=read("data/fag/historie/historiepensum_canonical_v4_5.json");
const g=read("data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json");
const b=read("reports/historie-canonical-migration/tid-periodisering-question-blueprints.json");
let pass=0;const fail=[];const ok=(c,s)=>{if(c){pass++;console.log(`PASS | ${s}`)}else{fail.push(s);console.error(`FAIL | ${s}`)}};
const id="his_tid_periodisering",a=f.categories.find(x=>x.id===id),pa=p.domains.find(x=>x.domain_id===id);
ok(a?.status==="complete_revised","domain complete_revised");ok(a?.topic_hooks?.length===10,"10 hooks");ok(new Set(a?.topic_hooks?.map(x=>x.id)).size===10,"unique hooks");
for(const h of a?.topic_hooks??[]){ok(h.canon?.thinkers?.length>=4,`${h.id}: four thinkers`);ok(h.recommended_method_ids?.length>=3,`${h.id}: methods`);ok(h.recommended_oslo_cases?.length>=4,`${h.id}: cases`);ok(h.critical_distinctions?.length>=4,`${h.id}: distinctions`);ok(h.generator_constraints?.require_chronology_or_temporal_claim===true,`${h.id}: temporal claim`);ok(h.generator_constraints?.require_temporal_scope===true,`${h.id}: temporal scope`)}
ok(pa?.status==="complete_revised","pensum complete");ok(pa?.hook_count===10,"pensum hook count");ok(pa?.emne_count===10,"pensum emne count");ok(pa?.method_count===10,"pensum method count");ok(new Set(pa?.emne_ids??[]).size===10,"10 unique emner");
for(const eid of pa?.emne_ids??[]){const x=e.find(z=>z.emne_id===eid),y=map.find(z=>z.emne_id===eid);ok(!!x,`${eid}: exists`);ok(!!x?.temporal_method_profile,`${eid}: temporal profile`);ok(x?.mapping_count===2,`${eid}: mapping count`);ok(y?.mappings?.length===2,`${eid}: two lanes`);for(const l of y?.mappings??[]){ok(l.chronology_required===true,`${eid}/${l.topic_hook}: chronology`);ok(l.temporal_scope_required===true,`${eid}/${l.topic_hook}: temporal scope`);ok(l.critical_distinction_required===true,`${eid}/${l.topic_hook}: distinction`)}}
for(const mid of ["met_kronologisk_rekonstruksjon","met_tidslagsanalyse","met_langvarighetsanalyse","met_hendelsesforlop_analyse","met_temporalitetsanalyse"]){const x=m.methods.find(z=>z.method_id===mid);ok(!!x,`${mid}: exists`);ok(x?.claim_basis_required===true,`${mid}: claim basis`);ok(x?.chronology_required===true,`${mid}: chronology`);ok(x?.temporal_scope_required===true,`${mid}: temporal scope`)}
ok(g.normal_opening_contract?.sets?.["1"]?.question_count===7,"set 1 has seven");ok(g.normal_opening_contract?.sets?.["2"]?.question_count===7,"set 2 has seven");ok(g.normal_opening_contract?.sets?.["1"]?.theory_names_forbidden===true,"set 1 blocks theory");ok(g.normal_opening_contract?.sets?.["2"]?.method_names_forbidden===true,"set 2 blocks methods");ok(g.domain_profiles?.[id]?.status==="complete_revised","generator profile active");ok(b.blueprint_count===10,"10 blueprints");
ok(g.canonical_inputs.emne_count===e.length,"emne count synced");ok(g.canonical_inputs.method_count===m.methods.length,"method count synced");ok(g.canonical_inputs.mapping_count===map.length,"mapping count synced");
console.log(`RESULT | ${pass} PASS, ${fail.length} FAIL`);if(fail.length)process.exit(1);
