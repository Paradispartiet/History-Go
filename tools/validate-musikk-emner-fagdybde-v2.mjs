#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.MUSIKK_SCIENTIFIC_BASE || "data/fag/musikk/musikkvitenskap_canonical_v1";
const PACKAGE = process.env.MUSIKK_SCIENTIFIC_PACKAGE || "data/fag/musikk/scientific_package.json";
const REV = "musikkvitenskap-emnemigrasjon-v2-2026-07-27";
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
let pass = 0;
const ok = (value, message) => {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass++;
};
const arraysEqual = (a,b) => a.length === b.length && a.every((x,i) => x === b[i]);
const collectKeys = value => {
  const keys=[];
  if (Array.isArray(value)) for (const item of value) keys.push(...collectKeys(item));
  else if (value && typeof value === "object") for (const [key,item] of Object.entries(value)) { keys.push(key); keys.push(...collectKeys(item)); }
  return keys;
};
const collectStrings = value => {
  const strings=[];
  if (typeof value === "string") strings.push(value);
  else if (Array.isArray(value)) for (const item of value) strings.push(...collectStrings(item));
  else if (value && typeof value === "object") for (const item of Object.values(value)) strings.push(...collectStrings(item));
  return strings;
};

const index=read(path.join(BASE,"index.json"));
const pkg=read(PACKAGE);
const domains=read(path.join(BASE,index.files.domain_catalog));
const defaults=read(path.join(BASE,index.files.content_contract_defaults));
const modules=index.files.canonical_modules.map(file=>read(path.join(BASE,file)));
const topics={topics:modules.flatMap(module=>module.topics),topic_contract_defaults:defaults.topic_contract_defaults};
const blueprints={question_blueprints:modules.flatMap(module=>module.question_blueprints),blueprint_contract_defaults:defaults.blueprint_contract_defaults};
const idMap=read(path.join(BASE,index.files.legacy_id_map));
const contract=read(path.join(BASE,index.files.research_contract));
const discipline=read(path.join(BASE,index.files.disciplinary_architecture));
const methods=read(path.join(BASE,index.files.method_protocols));
const theory=read(path.join(BASE,index.files.theory_and_debates));
const sources=read(path.join(BASE,index.files.scholarly_source_standard));

for (const [key,value] of Object.entries(index.files)) {
  if (Array.isArray(value)) for (const file of value) ok(fs.existsSync(path.join(BASE,file)),`Aktiv vitenskapelig fil finnes: ${file}`);
  else ok(fs.existsSync(path.join(BASE,value)),`Aktiv vitenskapelig fil finnes: ${value}`);
}
for (const file of index.legacy_compatibility.module_inventories) ok(fs.existsSync(path.join(BASE,file)),`Legacy modulfil finnes: ${file}`);
ok(index.revision===REV,"Indeks har emnemigrasjon v2-revisjon");
ok(pkg.revision===REV,"Scientific package har emnemigrasjon v2-revisjon");
ok(index.version==="2.0.0","Indeks er versjon 2.0.0");
ok(pkg.version==="2.0","Scientific package er versjon 2.0");
ok(index.status==="canonical_scientific_subject" && pkg.status==="canonical_scientific_subject","Status er vitenskapelig fag");
ok(index.files.modules===undefined,"Legacy moduler er ikke aktive fagfiler");
ok(index.legacy_compatibility.module_inventory_role==="legacy_source_inventory_not_active_scientific_authority","Modulenes legacy-rolle er eksplisitt");
ok(pkg.active_content_modules.endsWith("modules_v2/*.json"),"Aktive innholdsmoduler peker på v2");
ok(index.files.canonical_modules.length===8,"Åtte canonicale v2-moduler er aktive");

const forbiddenKeys=new Set(["progression_stage","ects","semester","course_id","teaching_and_learning","compulsory_activities","assessment","programme_learning_outcomes"]);
for (const [label,value] of Object.entries({index,pkg,domains,defaults,modules,topics,blueprints,idMap})) {
  const hits=collectKeys(value).filter(key=>forbiddenKeys.has(key));
  ok(hits.length===0,`${label} inneholder ingen undervisningsnøkler`);
}
const activeStrings=collectStrings({domains,defaults,modules,topics,blueprints});
ok(!activeStrings.some(x=>x.startsWith("met_musikk_vit_")),"Ingen gamle metode-ID-er finnes i aktivt innhold");
ok(!activeStrings.some(x=>x.startsWith("tm_musikk_vit_")),"Ingen gamle teori-ID-er finnes i aktivt innhold");

ok(domains.domains.length===8,"Åtte aktive domener");
ok(modules.length===8,"Åtte aktive innholdsmoduler");
for (const module of modules) {
  ok(module.status==="canonical_topic_and_blueprint_module_v2",`${module.domain.domain_id} har canonical v2-status`);
  ok(module.topics.length===6,`${module.domain.domain_id} har seks temaer i modul`);
  ok(module.question_blueprints.length===6,`${module.domain.domain_id} har seks spørsmålsplaner i modul`);
}
const domainIds=domains.domains.map(x=>x.domain_id);
ok(new Set(domainIds).size===domainIds.length,"Domene-ID-er er unike");
for (const d of domains.domains) {
  ok(d.definition.length>=80,`${d.domain_id} har substansiell definisjon`);
  ok(d.research_objects.length>=5,`${d.domain_id} har forskningsobjekter`);
  ok(d.boundary_note.length>=70,`${d.domain_id} har faglig avgrensning`);
}

const methodIds=new Set(methods.protocols.map(x=>x.method_id));
const theoryIds=new Set(theory.theoretical_traditions.map(x=>x.theory_id));
const debateIds=new Set(theory.research_debates.map(x=>x.debate_id));
const claimIds=new Set(contract.evidence_contract.claim_types.map(x=>x.claim_type_id));
const objectIds=new Set(discipline.research_object_types);
ok(methodIds.size===18,"Atten canonicale metodeprotokoller");
ok(theoryIds.size===25,"Tjuefem canonicale teoritradisjoner");
ok(debateIds.size===16,"Seksten canonicale forskningsdebatter");
ok(claimIds.size===10,"Ti canonicale påstandstyper");
ok(objectIds.size>=20,"Minst tjue forskningsobjekttyper");

ok(topics.topics.length===48,"Førtiåtte aktive temaer");
ok(topics.topic_contract_defaults.common_evidence_requirements.length>=4,"Temaregisteret har felles evidenskontrakt");
ok(topics.topic_contract_defaults.common_analytical_requirements.length>=5,"Temaregisteret har felles analysekontrakt");
const topicIds=topics.topics.map(x=>x.emne_id);
ok(new Set(topicIds).size===topicIds.length,"Tema-ID-er er unike");
const topicById=new Map(topics.topics.map(x=>[x.emne_id,x]));
for (const topic of topics.topics) {
  ok(domainIds.includes(topic.domain_id),`${topic.emne_id} har gyldig domene`);
  ok(topic.research_question.length>=55,`${topic.emne_id} har forskbart spørsmål`);
  ok(topic.core_concepts.length>=6,`${topic.emne_id} har presise kjernebegreper`);
  ok(topic.research_object_types.length>=2,`${topic.emne_id} har konkrete forskningsobjekter`);
  for (const id of topic.research_object_types) ok(objectIds.has(id),`${topic.emne_id} bruker kjent objekttype ${id}`);
  ok(topic.claim_type_ids.length>=1,`${topic.emne_id} deklarerer påstandstype`);
  for (const id of topic.claim_type_ids) ok(claimIds.has(id),`${topic.emne_id} bruker kjent påstandstype ${id}`);
  ok(topic.method_protocol_ids.length>=2,`${topic.emne_id} har minst to metodeprotokoller`);
  for (const id of topic.method_protocol_ids) ok(methodIds.has(id),`${topic.emne_id} bruker canonical metode ${id}`);
  ok(topic.theoretical_tradition_ids.length>=2,`${topic.emne_id} har minst to teoritradisjoner`);
  for (const id of topic.theoretical_tradition_ids) ok(theoryIds.has(id),`${topic.emne_id} bruker canonical teori ${id}`);
  ok(topic.research_debate_ids.length>=2,`${topic.emne_id} er plassert i fagdebatt`);
  for (const id of topic.research_debate_ids) ok(debateIds.has(id),`${topic.emne_id} bruker canonical debatt ${id}`);
  ok(topic.evidence_focus.length>=80,`${topic.emne_id} har tema-spesifikt evidenskrav`);
  ok(topic.topic_specific_inference_limit.length>=80,`${topic.emne_id} har tema-spesifikk slutningsgrense`);
}
for (const id of domainIds) ok(topics.topics.filter(x=>x.domain_id===id).length===6,`${id} har seks temaer`);

ok(blueprints.question_blueprints.length===48,"Førtiåtte aktive spørsmålsplaner");
const bpIds=blueprints.question_blueprints.map(x=>x.blueprint_id);
ok(new Set(bpIds).size===bpIds.length,"Spørsmålsplan-ID-er er unike");
ok(blueprints.blueprint_contract_defaults.answer_contract.length>=8,"Felles svarkontrakt er fullstendig");
ok(blueprints.blueprint_contract_defaults.source_contract.length>=4,"Felles kildekontrakt er fullstendig");
ok(blueprints.blueprint_contract_defaults.distractor_contract.length>=4,"Felles distraktorkontrakt er fullstendig");
for (const bp of blueprints.question_blueprints) {
  const topic=topicById.get(bp.emne_id);
  ok(!!topic,`${bp.blueprint_id} peker på kjent tema`);
  ok(arraysEqual(bp.required_object_types,topic.research_object_types),`${bp.blueprint_id} arver temaets objekttyper`);
  ok(arraysEqual(bp.claim_type_ids,topic.claim_type_ids),`${bp.blueprint_id} arver temaets påstandstyper`);
  ok(arraysEqual(bp.method_protocol_ids,topic.method_protocol_ids),`${bp.blueprint_id} arver temaets metoder`);
  ok(arraysEqual(bp.theoretical_tradition_ids,topic.theoretical_tradition_ids),`${bp.blueprint_id} arver temaets teorier`);
  ok(arraysEqual(bp.research_debate_ids,topic.research_debate_ids),`${bp.blueprint_id} arver temaets fagdebatter`);
  ok(bp.question_pattern.includes(topic.research_question),`${bp.blueprint_id} bygger på forskningsspørsmålet`);
  ok(bp.question_pattern.includes("alternativ forklaring eller begrensning"),`${bp.blueprint_id} krever motlesning`);
  ok(bp.uncertainty_required===true,`${bp.blueprint_id} krever usikkerhet`);
}
for (const id of topicIds) ok(blueprints.question_blueprints.filter(x=>x.emne_id===id).length===1,`${id} har nøyaktig én canonical spørsmålsplan`);

ok(idMap.status==="compatibility_map_not_scientific_authority","ID-kartet er kun kompatibilitet");
ok(idMap.legacy_method_ids.length===24,"Alle 24 gamle metode-ID-er er kartlagt");
ok(idMap.legacy_theory_model_ids.length===32,"Alle 32 gamle teori-ID-er er kartlagt");
const legacyMethodIds=idMap.legacy_method_ids.map(x=>x.legacy_id);
const legacyTheoryIds=idMap.legacy_theory_model_ids.map(x=>x.legacy_id);
ok(new Set(legacyMethodIds).size===legacyMethodIds.length,"Gamle metode-ID-er er unike i kartet");
ok(new Set(legacyTheoryIds).size===legacyTheoryIds.length,"Gamle teori-ID-er er unike i kartet");
for (const row of idMap.legacy_method_ids) {
  ok(row.legacy_id.startsWith("met_musikk_vit_"),`${row.legacy_id} er eksplisitt legacy metode`);
  ok(row.canonical_method_protocol_ids.length>=1,`${row.legacy_id} har canonical mål`);
  for (const id of row.canonical_method_protocol_ids) ok(methodIds.has(id),`${row.legacy_id} peker på gyldig metode ${id}`);
}
for (const row of idMap.legacy_theory_model_ids) {
  ok(row.legacy_id.startsWith("tm_musikk_vit_"),`${row.legacy_id} er eksplisitt legacy teori`);
  ok(row.canonical_theoretical_tradition_ids.length>=1,`${row.legacy_id} har canonical mål`);
  for (const id of row.canonical_theoretical_tradition_ids) ok(theoryIds.has(id),`${row.legacy_id} peker på gyldig teori ${id}`);
}

ok(index.summary.domain_count===domains.domains.length,"Domeneantall matcher indeks");
ok(index.summary.topic_count===topics.topics.length,"Temaantall matcher indeks");
ok(index.summary.question_blueprint_count===blueprints.question_blueprints.length,"Spørsmålsantall matcher indeks");
ok(index.summary.legacy_method_id_count===idMap.legacy_method_ids.length,"Legacy metodeantall matcher indeks");
ok(index.summary.legacy_theory_model_id_count===idMap.legacy_theory_model_ids.length,"Legacy teoriantall matcher indeks");
ok(contract.hard_rules.teaching_framework_forbidden===true,"Undervisningsramme er fortsatt forbudt");

console.log(`PASS: ${pass}`);
console.log("RESULTAT: PASS");
