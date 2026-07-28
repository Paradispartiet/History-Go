#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT=process.cwd();
const BASE=path.join(ROOT,"data/fag/musikk/musikkvitenskap_canonical_v1");
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
let pass=0,fail=0;
const ok=(value,message)=>{if(value)pass+=1;else{fail+=1;console.error(`FAIL ${message}`)}};
const strings=value=>Array.isArray(value)&&value.length>0&&value.every(item=>typeof item==="string"&&item.trim().length>0);
const same=(left,right)=>left.length===right.length&&left.every(item=>right.includes(item))&&right.every(item=>left.includes(item));
const keys=value=>Array.isArray(value)?value.flatMap(keys):value&&typeof value==="object"?Object.entries(value).flatMap(([key,item])=>[key,...keys(item)]):[];

const index=read(path.join(BASE,"index.json"));
const pkg=read("data/fag/musikk/scientific_package.json");
const contract=read(path.join(BASE,index.files.source_dossier_contract));
const standard=read(path.join(BASE,index.files.scholarly_source_standard));
const modules=index.files.canonical_modules.map(file=>read(path.join(BASE,file)));
const moduleByDomain=new Map(modules.map(module=>[module.domain.domain_id,module]));
const infrastructures=new Set(standard.infrastructures.map(item=>item.source_id));
const forbidden=new Set(contract.forbidden_keys);

ok(index.status==="canonical_scientific_subject","indeks har vitenskapelig status");
ok(pkg.status==="canonical_scientific_subject","fagpakke har vitenskapelig status");
ok(contract.status==="canonical_source_dossier_contract","kildekontrakt er canonical");
ok(index.source_revision===contract.revision&&pkg.source_revision===contract.revision,"samlet kilderevisjon er konsistent");
ok(index.source_batches.length===4,"fire kildebatcher er aktive");
ok(index.source_batches.every(batch=>contract.supported_batch_revisions.includes(batch.revision)),"alle batchrevisjoner støttes");
ok(contract.hard_rules.catalog_metadata_is_not_object_evidence===true,"katalogmetadata er ikke objektevidens");
ok(contract.hard_rules.restricted_material_overrides_question_generation===true,"restriktivt materiale overstyrer spørsmål");
ok(contract.hard_rules.public_access_is_not_reuse_permission===true,"offentlig tilgang er ikke gjenbrukstillatelse");
ok(contract.hard_rules.performance_context_and_rights_required_before_question_release===true,"framføringskontekst og rettigheter kreves");
ok(contract.hard_rules.single_modality_cannot_establish_intention_leadership_or_shared_meaning===true,"én modalitet kan ikke etablere intensjon, ledelse eller felles mening");

const registryPaths=index.source_batches.flatMap(batch=>batch.registry_files);
const dossierPaths=index.source_batches.flatMap(batch=>batch.dossier_files);
ok(same(index.files.scholarly_source_registries,registryPaths),"registermanifest samsvarer med batcher");
ok(same(index.files.source_dossiers,dossierPaths),"dossiermanifest samsvarer med batcher");
for(const file of [index.files.source_dossier_contract,...registryPaths,...dossierPaths])
  ok(fs.existsSync(path.join(BASE,file)),`fil finnes ${file}`);

const hosts=new Set([
  "academic.oup.com","boydellandbrewer.com","mitpress.mit.edu","www.routledge.com",
  "online.ucpress.edu","www.ucpress.edu","www.cambridge.org","press.uchicago.edu",
  "www.hup.harvard.edu","www.press.umich.edu","press.umich.edu","www.press.uillinois.edu",
  "manchesteruniversitypress.co.uk","www.dukeupress.edu","www.bloomsbury.com",
  "www.upress.umn.edu","datascience.codata.org","link.springer.com","www.weslpress.org"
]);
const types=new Set(["scholarly_monograph","edited_scholarly_volume","peer_reviewed_article","scholarly_chapter"]);
let totalRegistries=0,totalDossierFiles=0,totalSources=0,totalDossiers=0,totalScopes=0;
const globalSourceIds=[],globalDossierIds=[],globalUsed=new Set();

for(const batch of index.source_batches){
  const module=moduleByDomain.get(batch.domain_id);
  ok(Boolean(module),`${batch.batch_id} har aktivt domene`);
  const topicById=new Map(module.topics.map(topic=>[topic.emne_id,topic]));
  const registryFiles=batch.registry_files.map(file=>read(path.join(BASE,file)));
  const dossierFiles=batch.dossier_files.map(file=>read(path.join(BASE,file)));
  const sources=registryFiles.flatMap(registry=>registry.sources);
  const dossiers=dossierFiles.flatMap(wrapper=>wrapper.topic_dossiers);
  const sourceById=new Map(sources.map(source=>[source.source_id,source]));
  const used=new Set();

  totalRegistries+=registryFiles.length;
  totalDossierFiles+=dossierFiles.length;
  totalSources+=sources.length;
  totalDossiers+=dossiers.length;
  globalSourceIds.push(...sources.map(source=>source.source_id));
  globalDossierIds.push(...dossiers.map(dossier=>dossier.emne_id));

  ok(sources.length===batch.expected_source_count,`${batch.batch_id} har forventet kildeantall`);
  ok(dossiers.length===batch.expected_topic_count,`${batch.batch_id} har forventet dossierantall`);
  ok(new Set(sources.map(source=>source.source_id)).size===sources.length,`${batch.batch_id} har unike kilder`);
  ok(new Set(dossiers.map(dossier=>dossier.emne_id)).size===dossiers.length,`${batch.batch_id} har unike dossierer`);

  for(const registry of registryFiles){
    ok(registry.status==="canonical_verified_scholarly_source_registry",`${registry.registry_id} er canonicalt`);
    ok(registry.revision===batch.revision,`${registry.registry_id} har riktig revisjon`);
    ok(registry.not_a_systematic_review===true,`${registry.registry_id} er ikke systematisk review`);
    ok(registry.rilm_scope_control.record_level_search_status==="not_completed_subscription_access_required",`${registry.registry_id} oppgir RILM-gap`);
    const scopeCount=(registry.rilm_scope_control.classes_used?.length??0)+(registry.rilm_scope_control.scope_terms_used?.length??0);
    ok(scopeCount>=3,`${registry.registry_id} har søkeavgrensning`);
    totalScopes+=scopeCount;
  }

  for(const source of sources){
    for(const field of contract.required_source_fields)
      ok(Object.hasOwn(source,field),`${source.source_id} har ${field}`);
    ok(strings(source.creators),`${source.source_id} har opphav`);
    ok(Number.isInteger(source.year)&&source.year>=1900&&source.year<=2026,`${source.source_id} har år`);
    ok(types.has(source.publication_type),`${source.source_id} har type`);
    try{
      const url=new URL(source.canonical_url);
      ok(url.protocol==="https:",`${source.source_id} bruker HTTPS`);
      ok(hosts.has(url.hostname),`${source.source_id} bruker offisiell vert`);
    }catch{
      ok(false,`${source.source_id} har gyldig URL`);
      ok(false,`${source.source_id} bruker offisiell vert`);
    }
    ok(["2026-07-27","2026-07-28"].includes(source.verification.checked_at),`${source.source_id} har kontrolldato`);
    ok(typeof source.verification.full_text_status==="string",`${source.source_id} har fulltekststatus`);
    ok(Object.keys(source.identifiers).length>0,`${source.source_id} har identifikator`);
    if(source.identifiers.doi)
      ok(/^10\.\d{4,9}\/\S+$/.test(source.identifiers.doi),`${source.source_id} har DOI`);
    ok(strings(source.source_roles)&&source.scope_note.length>=40,`${source.source_id} har rolle og rekkevidde`);
    ok(source.allowed_use.length>=2&&source.forbidden_use.length>=2,`${source.source_id} har brukssperrer`);
  }

  for(const wrapper of dossierFiles){
    ok(wrapper.status==="canonical_topic_source_dossiers",`${batch.batch_id} har canonical dossierfil`);
    ok(wrapper.revision===batch.revision,`${batch.batch_id} har dossierrevisjon`);
    ok(wrapper.contract==="../../source_dossier_contract_v1.json",`${batch.batch_id} peker på kontrakt`);
  }

  for(const dossier of dossiers){
    const topic=topicById.get(dossier.emne_id);
    for(const field of contract.required_dossier_fields)
      ok(Object.hasOwn(dossier,field),`${dossier.emne_id} har ${field}`);
    ok(Boolean(topic),`${dossier.emne_id} er aktivt tema`);

    const sourceIds=[...new Set([
      ...dossier.canonical_source_ids,
      ...dossier.current_research_source_ids,
      ...dossier.method_source_ids
    ])];
    sourceIds.forEach(sourceId=>{used.add(sourceId);globalUsed.add(sourceId)});
    ok(sourceIds.length>=3,`${dossier.emne_id} har minst tre kilder`);
    ok(dossier.canonical_source_ids.length>=2,`${dossier.emne_id} har minst to canonicale kilder`);
    ok(dossier.method_source_ids.length>=1,`${dossier.emne_id} har metodekilde`);
    for(const sourceId of sourceIds)
      ok(sourceById.has(sourceId),`${dossier.emne_id} bruker kjent kilde ${sourceId}`);
    ok(dossier.current_research_source_ids.some(sourceId=>sourceById.get(sourceId)?.year>=2018),`${dossier.emne_id} har nyere forskning`);
    ok(dossier.direct_object_gate.required_before_question_release===true,`${dossier.emne_id} krever objekt`);
    ok(dossier.direct_object_gate.accepted_object_types.every(type=>topic.research_object_types.includes(type)),`${dossier.emne_id} bruker aktive objekttyper`);
    ok(dossier.direct_object_gate.minimum_metadata.length>=6&&dossier.direct_object_gate.minimum_locator_count>=2,`${dossier.emne_id} har metadata og lokatorer`);
    ok(dossier.documented_research_tensions.length>=3&&dossier.allowed_claims.length>=3&&dossier.forbidden_overreach.length>=3,`${dossier.emne_id} har faglige grenser`);
    ok(dossier.search_log.channels.length>=3&&dossier.search_log.queries.length>=3&&dossier.coverage_bias.length>=2&&dossier.known_gaps.length>=3,`${dossier.emne_id} dokumenterer søk og hull`);

    if(batch.domain_id==="historisk_musikkvitenskap_historiografi"){
      for(const field of contract.historical_dossier_required_fields)
        ok(Object.hasOwn(dossier,field),`${dossier.emne_id} har historiefelt ${field}`);
      ok(dossier.primary_source_infrastructure_ids.length>=3&&dossier.primary_source_infrastructure_ids.every(id=>infrastructures.has(id)),`${dossier.emne_id} har kildeinfrastrukturer`);
      ok(dossier.archive_or_object_identity_requirements.length>=6&&dossier.catalog_metadata_limit.length>=80&&dossier.source_chain_requirements.length>=3,`${dossier.emne_id} har historisk kildekjede`);
    }

    if(batch.domain_id==="etnomusikologi_kultur_samfunn"){
      const requirement=contract.domain_specific_requirements.etnomusikologi_kultur_samfunn;
      ok(Object.hasOwn(dossier,"ethical_governance_gate"),`${dossier.emne_id} har etisk port`);
      const gate=dossier.ethical_governance_gate;
      for(const field of requirement.required_gate_fields)
        ok(Object.hasOwn(gate,field),`${dossier.emne_id} har styringsfelt ${field}`);
      ok(gate.required_before_question_release===true&&gate.question_release_rule==="blocked_unless_all_fields_resolved",`${dossier.emne_id} blokkerer uavklarte spørsmål`);
      for(const field of ["consent_model","participant_authority","language_and_translation","anonymization_and_risk","community_benefit_and_return","access_reuse_and_withdrawal","restricted_or_non_publishable_material"])
        ok(strings(gate[field])&&gate[field].length>=2,`${dossier.emne_id} dokumenterer ${field}`);
    }

    if(batch.domain_id==="framforing_praksis_samspill"){
      const requirement=contract.domain_specific_requirements.framforing_praksis_samspill;
      for(const field of contract.performance_dossier_required_fields)
        ok(Object.hasOwn(dossier,field),`${dossier.emne_id} har framføringsfelt ${field}`);
      ok(dossier.performance_object_identity_requirements.length>=6,`${dossier.emne_id} har framføringsidentitet`);
      ok(dossier.performance_evidence_chain_requirements.length>=3,`${dossier.emne_id} har framføringsevidenskjede`);
      const gate=dossier.performance_research_governance_gate;
      for(const field of requirement.required_gate_fields)
        ok(Object.hasOwn(gate,field),`${dossier.emne_id} har framføringsportfelt ${field}`);
      ok(gate.required_before_question_release===true&&gate.question_release_rule==="blocked_unless_object_context_and_rights_resolved",`${dossier.emne_id} blokkerer uavklart objekt, kontekst eller rettighet`);
      for(const field of ["object_and_version_identity","multimodal_alignment","participant_and_recording_rights","venue_and_technical_context","comparison_or_sampling_design","actor_account_and_analytic_category_separation"])
        ok(strings(gate[field])&&gate[field].length>=2,`${dossier.emne_id} dokumenterer ${field}`);
    }
  }
  ok(used.size===sources.length,`${batch.batch_id} bruker alle kilder`);
}

ok(new Set(globalSourceIds).size===globalSourceIds.length,"kilde-ID-er er globalt unike");
ok(new Set(globalDossierIds).size===globalDossierIds.length,"dossier-ID-er er globalt unike");
ok(globalUsed.size===globalSourceIds.length,"alle aktive kilder brukes");
ok(index.summary.source_dossier_domain_count===4&&pkg.summary.source_dossier_domain_count===4,"fire kildedomener eksponeres");
ok(index.summary.source_dossier_topic_count===totalDossiers&&pkg.summary.source_dossier_topic_count===totalDossiers,"alle dossierer telles");
ok(index.summary.verified_scholarly_source_record_count===totalSources&&pkg.summary.verified_scholarly_source_record_count===totalSources,"alle kilder telles");
ok(pkg.active_source_manifest==="musikkvitenskap_canonical_v1/index.json#files.source_dossiers","fagpakken bruker manifest");

for(const [label,value] of Object.entries({contract,index,pkg}))
  ok(keys(value).filter(key=>forbidden.has(key)).length===0,`${label} har ingen undervisningsnøkler`);
for(const file of [...registryPaths,...dossierPaths])
  ok(keys(read(path.join(BASE,file))).filter(key=>forbidden.has(key)).length===0,`${file} har ingen undervisningsnøkler`);

console.log("MUSIKKVITENSKAP KILDEGRUNNLAG – FIRE DOMENER V5");
console.log(`Kildedomener: ${index.source_batches.length}`);
console.log(`Kilderegistre: ${totalRegistries}`);
console.log(`Temadossierfiler: ${totalDossierFiles}`);
console.log(`Temadossierer: ${totalDossiers}`);
console.log(`Verifiserte forskningskilder: ${totalSources}`);
console.log(`Søkeavgrensninger: ${totalScopes}`);
console.log("Spørsmålsregel: direkte objekt, historisk kildekjede, etisk styringsport eller framføringsport etter domene");
console.log(`RESULTAT ${fail===0?"PASS":"FAIL"}: ${pass} PASS, ${fail} FAIL`);
process.exit(fail===0?0:1);
