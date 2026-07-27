#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const ROOT=process.env.MUSIKK_REPO_ROOT||process.cwd(), BASE=path.join(ROOT,"data/fag/musikk/musikkvitenskap_canonical_v1");
const read=p=>JSON.parse(fs.readFileSync(path.join(BASE,p),"utf8")), index=read("index.json"), contract=read("research_contract.json"), is=read("institutions_sources.json");
const pointer=JSON.parse(fs.readFileSync(path.join(ROOT,"data/fag/musikk/scientific_package.json"),"utf8")), mods=index.files.modules.map(read);
const domains=mods.map(x=>x.domain), topics=mods.flatMap(x=>x.topics), methods=mods.flatMap(x=>x.methods), theories=mods.flatMap(x=>x.theory_models), blueprints=mods.flatMap(x=>x.question_blueprints);
let pass=0; const ok=(v,m)=>{if(!v)throw new Error("FAIL | "+m); console.log("PASS | "+m);pass++}, uniq=a=>new Set(a).size===a.length;
ok(index.status==="canonical_scientific_subject","status"); ok(pointer.active_scientific_package==="musikkvitenskap_canonical_v1/index.json","active pointer");
ok(index.discipline_boundary.scenekunst_is_separate_top_level_subject,"scenekunst boundary");
for(const [a,n,l] of [[domains,8,"domains"],[topics,48,"topics"],[methods,24,"methods"],[theories,32,"theories"],[blueprints,48,"blueprints"]])ok(a.length===n,n+" "+l);
for(const [a,k,l] of [[domains,"domain_id","domains"],[topics,"emne_id","topics"],[methods,"method_id","methods"],[theories,"theory_model_id","theories"],[blueprints,"blueprint_id","blueprints"]])ok(uniq(a.map(x=>x[k])),"unique "+l);
const d=new Set(domains.map(x=>x.domain_id)),e=new Set(topics.map(x=>x.emne_id)),m=new Set(methods.map(x=>x.method_id)),t=new Set(theories.map(x=>x.theory_model_id));
for(const x of mods){ok(x.topics.length===6,x.domain.domain_id+" topics");ok(x.methods.length===3,x.domain.domain_id+" methods");ok(x.theory_models.length===4,x.domain.domain_id+" theories");ok(x.question_blueprints.length===6,x.domain.domain_id+" blueprints");}
for(const x of topics){ok(d.has(x.domain_id),x.emne_id+" domain");ok(x.core_concepts.length===6,x.emne_id+" concepts");ok(x.method_ids.length===2&&x.method_ids.every(y=>m.has(y)),x.emne_id+" methods");ok(x.theory_model_ids.length===2&&x.theory_model_ids.every(y=>t.has(y)),x.emne_id+" theories");}
for(const x of methods){ok(typeof x.title==="string"&&x.title.length>4,x.method_id+" title");ok(typeof x.purpose==="string"&&x.purpose.length>30,x.method_id+" purpose");if(x.specific_validity_threats)ok(x.specific_validity_threats.length>=2,x.method_id+" validity");}
for(const x of theories)ok(x.limit.length>20,x.theory_model_id+" limit");
for(const x of blueprints){ok(e.has(x.emne_id),x.blueprint_id+" topic");ok(m.has(x.method_id),x.blueprint_id+" method");}
ok(contract.topic_contract.evidence_requirements.length===5,"topic evidence");ok(contract.topic_contract.critical_distinctions.length===4,"topic distinctions");
ok(contract.method_contract.question_build_sequence.length===8,"method sequence");ok(contract.method_contract.uncertainty_requirements.length===3,"uncertainty");
ok(contract.blueprint_contract.answer_requirements.length===8,"answer contract");ok(contract.blueprint_contract.distractor_rules.length===4,"distractors");
ok(contract.evidence_contract.claim_types.length===10,"claim types");for(const x of contract.evidence_contract.claim_types){ok(x.minimum_evidence.length===3,x.claim_type_id+" evidence");ok(x.prohibited_inference.length>40,x.claim_type_id+" boundary");}
ok(contract.progression_assessment.levels.length===3,"progression");ok(contract.place_application_contract.required_place_link.length===5,"place requirements");
ok(is.nordic_sami_institution_map.institutions.length===12,"institutions");ok(is.nordic_sami_institution_map.sami_and_indigenous_governance.required_principles.length===5,"CARE/community");
ok(is.sources_registry.sources.length===11,"sources");for(const [k,v] of Object.entries(contract.hard_rules))ok(v===true,"hard rule "+k);
for(const [k,v] of Object.entries(index.summary)){if(k.endsWith("_count"))ok(Number.isInteger(v)&&v>0,"summary "+k);}
console.log("PASS: "+pass);console.log("RESULTAT: PASS");
