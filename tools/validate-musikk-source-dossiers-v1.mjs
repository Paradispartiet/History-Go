#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const ROOT=process.cwd();
const BASE=path.join(ROOT,"data/fag/musikk/musikkvitenskap_canonical_v1");
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
let pass=0,fail=0;
const ok=(v,m)=>{if(v)pass++;else{fail++;console.error(`FAIL ${m}`)}};
const strings=v=>Array.isArray(v)&&v.length>0&&v.every(x=>typeof x==="string"&&x.trim());
const same=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x))&&b.every(x=>a.includes(x));
const keys=v=>Array.isArray(v)?v.flatMap(keys):v&&typeof v==="object"?Object.entries(v).flatMap(([k,x])=>[k,...keys(x)]):[];
const index=read(path.join(BASE,"index.json"));
const pkg=read("data/fag/musikk/scientific_package.json");
const contract=read(path.join(BASE,index.files.source_dossier_contract));
const standard=read(path.join(BASE,index.files.scholarly_source_standard));
const modules=index.files.canonical_modules.map(f=>read(path.join(BASE,f)));
const moduleByDomain=new Map(modules.map(m=>[m.domain.domain_id,m]));
const infrastructures=new Set(standard.infrastructures.map(x=>x.source_id));
const forbidden=new Set(contract.forbidden_keys);
ok(index.status==="canonical_scientific_subject","indeks har vitenskapelig status");
ok(pkg.status==="canonical_scientific_subject","fagpakke har vitenskapelig status");
ok(contract.status==="canonical_source_dossier_contract","kildekontrakt er canonical");
ok(index.source_revision===contract.revision&&pkg.source_revision===contract.revision,"samlet kilderevisjon er konsistent");
ok(index.source_batches.length===3,"tre kildebatcher er aktive");
ok(index.source_batches.every(b=>contract.supported_batch_revisions.includes(b.revision)),"alle batchrevisjoner støttes");
ok(contract.hard_rules.catalog_metadata_is_not_object_evidence===true,"katalogmetadata er ikke objektevidens");
ok(contract.hard_rules.restricted_material_overrides_question_generation===true,"restriktivt materiale overstyrer spørsmål");
ok(contract.hard_rules.public_access_is_not_reuse_permission===true,"offentlig tilgang er ikke gjenbrukstillatelse");
const regs=index.source_batches.flatMap(b=>b.registry_files),doss=index.source_batches.flatMap(b=>b.dossier_files);
ok(same(index.files.scholarly_source_registries,regs),"registermanifest samsvarer med batcher");
ok(same(index.files.source_dossiers,doss),"dossiermanifest samsvarer med batcher");
for(const f of [index.files.source_dossier_contract,...regs,...doss])ok(fs.existsSync(path.join(BASE,f)),`fil finnes ${f}`);
const hosts=new Set(["academic.oup.com","boydellandbrewer.com","mitpress.mit.edu","www.routledge.com","online.ucpress.edu","www.ucpress.edu","www.cambridge.org","press.uchicago.edu","www.hup.harvard.edu","www.press.umich.edu","press.umich.edu","www.press.uillinois.edu","manchesteruniversitypress.co.uk","www.dukeupress.edu","www.bloomsbury.com","www.upress.umn.edu","datascience.codata.org"]);
const types=new Set(["scholarly_monograph","edited_scholarly_volume","peer_reviewed_article","scholarly_chapter"]);
let totalRegs=0,totalDossierFiles=0,totalSources=0,totalDossiers=0,totalScopes=0;
const globalSources=[],globalDossiers=[],globalUsed=new Set();
for(const batch of index.source_batches){
 const module=moduleByDomain.get(batch.domain_id);ok(!!module,`${batch.batch_id} har aktivt domene`);
 const topicById=new Map(module.topics.map(t=>[t.emne_id,t]));
 const registryFiles=batch.registry_files.map(f=>read(path.join(BASE,f)));
 const dossierFiles=batch.dossier_files.map(f=>read(path.join(BASE,f)));
 const sources=registryFiles.flatMap(r=>r.sources),dossiers=dossierFiles.flatMap(d=>d.topic_dossiers);
 const byId=new Map(sources.map(s=>[s.source_id,s])),used=new Set();
 totalRegs+=registryFiles.length;totalDossierFiles+=dossierFiles.length;totalSources+=sources.length;totalDossiers+=dossiers.length;
 globalSources.push(...sources.map(s=>s.source_id));globalDossiers.push(...dossiers.map(d=>d.emne_id));
 ok(sources.length===batch.expected_source_count,`${batch.batch_id} har forventet kildeantall`);
 ok(dossiers.length===batch.expected_topic_count,`${batch.batch_id} har forventet dossierantall`);
 ok(new Set(sources.map(s=>s.source_id)).size===sources.length,`${batch.batch_id} har unike kilder`);
 for(const r of registryFiles){
  ok(r.status==="canonical_verified_scholarly_source_registry",`${r.registry_id} er canonicalt`);
  ok(r.revision===batch.revision,`${r.registry_id} har riktig revisjon`);
  ok(r.not_a_systematic_review===true,`${r.registry_id} er ikke systematisk review`);
  ok(r.rilm_scope_control.record_level_search_status==="not_completed_subscription_access_required",`${r.registry_id} oppgir RILM-gap`);
  const n=(r.rilm_scope_control.classes_used?.length??0)+(r.rilm_scope_control.scope_terms_used?.length??0);ok(n>=3,`${r.registry_id} har søkeavgrensning`);totalScopes+=n;
 }
 for(const s of sources){
  for(const f of contract.required_source_fields)ok(Object.hasOwn(s,f),`${s.source_id} har ${f}`);
  ok(strings(s.creators),`${s.source_id} har opphav`);ok(Number.isInteger(s.year)&&s.year>=1900&&s.year<=2026,`${s.source_id} har år`);ok(types.has(s.publication_type),`${s.source_id} har type`);
  try{const u=new URL(s.canonical_url);ok(u.protocol==="https:",`${s.source_id} bruker HTTPS`);ok(hosts.has(u.hostname),`${s.source_id} bruker offisiell vert`)}catch{ok(false,`${s.source_id} har URL`)}
  ok(["2026-07-27","2026-07-28"].includes(s.verification.checked_at),`${s.source_id} har kontrolldato`);ok(typeof s.verification.full_text_status==="string",`${s.source_id} har fulltekststatus`);ok(Object.keys(s.identifiers).length>0,`${s.source_id} har identifikator`);
  if(s.identifiers.doi)ok(/^10\.\d{4,9}\/\S+$/.test(s.identifiers.doi),`${s.source_id} har DOI`);
  ok(strings(s.source_roles)&&s.scope_note.length>=40,`${s.source_id} har rolle og rekkevidde`);ok(s.allowed_use.length>=2&&s.forbidden_use.length>=2,`${s.source_id} har brukssperrer`);
 }
 for(const wrap of dossierFiles){ok(wrap.status==="canonical_topic_source_dossiers",`${batch.batch_id} har canonical dossierfil`);ok(wrap.revision===batch.revision,`${batch.batch_id} har dossierrevisjon`);ok(wrap.contract==="../../source_dossier_contract_v1.json",`${batch.batch_id} peker på kontrakt`)}
 for(const d of dossiers){
  const topic=topicById.get(d.emne_id);for(const f of contract.required_dossier_fields)ok(Object.hasOwn(d,f),`${d.emne_id} har ${f}`);ok(!!topic,`${d.emne_id} er aktivt tema`);
  const ids=[...new Set([...d.canonical_source_ids,...d.current_research_source_ids,...d.method_source_ids])];ids.forEach(id=>{used.add(id);globalUsed.add(id)});ok(ids.length>=3,`${d.emne_id} har tre kilder`);for(const id of ids)ok(byId.has(id),`${d.emne_id} bruker kjent kilde ${id}`);
  ok(d.current_research_source_ids.some(id=>byId.get(id)?.year>=2018),`${d.emne_id} har nyere forskning`);ok(d.direct_object_gate.required_before_question_release===true,`${d.emne_id} krever objekt`);ok(d.direct_object_gate.accepted_object_types.every(t=>topic.research_object_types.includes(t)),`${d.emne_id} bruker aktive objekttyper`);ok(d.direct_object_gate.minimum_metadata.length>=6&&d.direct_object_gate.minimum_locator_count>=2,`${d.emne_id} har metadata og lokatorer`);ok(d.documented_research_tensions.length>=3&&d.allowed_claims.length>=3&&d.forbidden_overreach.length>=3,`${d.emne_id} har faglige grenser`);ok(d.search_log.channels.length>=3&&d.search_log.queries.length>=3&&d.coverage_bias.length>=2&&d.known_gaps.length>=3,`${d.emne_id} dokumenterer søk og hull`);
  if(batch.domain_id==="historisk_musikkvitenskap_historiografi"){
   for(const f of contract.historical_dossier_required_fields)ok(Object.hasOwn(d,f),`${d.emne_id} har historiefelt ${f}`);ok(d.primary_source_infrastructure_ids.length>=3&&d.primary_source_infrastructure_ids.every(id=>infrastructures.has(id)),`${d.emne_id} har kildeinfrastrukturer`);ok(d.archive_or_object_identity_requirements.length>=6&&d.catalog_metadata_limit.length>=80&&d.source_chain_requirements.length>=3,`${d.emne_id} har historisk kildekjede`);
  }
  if(batch.domain_id==="etnomusikologi_kultur_samfunn"){
   const req=contract.domain_specific_requirements.etnomusikologi_kultur_samfunn;ok(Object.hasOwn(d,"ethical_governance_gate"),`${d.emne_id} har etisk port`);const g=d.ethical_governance_gate;for(const f of req.required_gate_fields)ok(Object.hasOwn(g,f),`${d.emne_id} har styringsfelt ${f}`);ok(g.required_before_question_release===true&&g.question_release_rule==="blocked_unless_all_fields_resolved",`${d.emne_id} blokkerer uavklarte spørsmål`);for(const f of ["consent_model","participant_authority","language_and_translation","anonymization_and_risk","community_benefit_and_return","access_reuse_and_withdrawal","restricted_or_non_publishable_material"])ok(strings(g[f])&&g[f].length>=2,`${d.emne_id} dokumenterer ${f}`);
  }
 }
 ok(used.size===sources.length,`${batch.batch_id} bruker alle kilder`);
}
ok(new Set(globalSources).size===globalSources.length,"kilde-ID-er er globalt unike");ok(new Set(globalDossiers).size===globalDossiers.length,"dossier-ID-er er globalt unike");ok(globalUsed.size===globalSources.length,"alle aktive kilder brukes");
ok(index.summary.source_dossier_domain_count===3&&pkg.summary.source_dossier_domain_count===3,"tre kildedomener eksponeres");ok(index.summary.source_dossier_topic_count===totalDossiers&&pkg.summary.source_dossier_topic_count===totalDossiers,"alle dossierer telles");ok(index.summary.verified_scholarly_source_record_count===totalSources&&pkg.summary.verified_scholarly_source_record_count===totalSources,"alle kilder telles");ok(pkg.active_source_manifest==="musikkvitenskap_canonical_v1/index.json#files.source_dossiers","fagpakken bruker manifest");
for(const [label,v] of Object.entries({contract,index,pkg}))ok(keys(v).filter(k=>forbidden.has(k)).length===0,`${label} har ingen undervisningsnøkler`);for(const f of [...regs,...doss])ok(keys(read(path.join(BASE,f))).filter(k=>forbidden.has(k)).length===0,`${f} har ingen undervisningsnøkler`);
console.log("MUSIKKVITENSKAP KILDEGRUNNLAG – TRE DOMENER V4");console.log(`Kildedomener: ${index.source_batches.length}`);console.log(`Kilderegistre: ${totalRegs}`);console.log(`Temadossierfiler: ${totalDossierFiles}`);console.log(`Temadossierer: ${totalDossiers}`);console.log(`Verifiserte forskningskilder: ${totalSources}`);console.log(`Søkeavgrensninger: ${totalScopes}`);console.log("Spørsmålsregel: direkte objekt, historisk kildekjede og etisk styringsport etter domene");console.log(`RESULTAT ${fail===0?"PASS":"FAIL"}: ${pass} PASS, ${fail} FAIL`);process.exit(fail===0?0:1);
