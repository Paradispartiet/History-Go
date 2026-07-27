#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const BASE="data/fag/musikk/musikkvitenskap_canonical_v1";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
let pass=0,fail=0;
const ok=(v,m)=>{if(v)pass++;else{fail++;console.error(`FAIL ${m}`)}};
const index=read(path.join(BASE,"index.json"));
const pkg=read("data/fag/musikk/scientific_package.json");
const contract=read(path.join(BASE,index.files.source_dossier_contract));
const registries=index.files.scholarly_source_registries.map(f=>read(path.join(BASE,f)));
const dossierFiles=index.files.source_dossiers.map(f=>read(path.join(BASE,f)));
const sources=registries.flatMap(r=>r.sources);
const dossiers=dossierFiles.flatMap(d=>d.topic_dossiers);
const modules=index.files.canonical_modules.map(f=>read(path.join(BASE,f)));
const topicIds=new Set(modules.flatMap(m=>m.topics.map(t=>t.emne_id)));
const byId=new Map(sources.map(s=>[s.source_id,s]));
const requiredSource=contract.required_source_fields;
const requiredDossier=contract.required_dossier_fields;
for(const f of [index.files.source_dossier_contract,...index.files.scholarly_source_registries,...index.files.source_dossiers])ok(fs.existsSync(path.join(BASE,f)),`fil finnes ${f}`);
ok(index.source_revision==="musikkvitenskap-kildegrunnlag-to-domener-v2-2026-07-28","indeks har samlet kilderevisjon");
ok(pkg.source_revision===index.source_revision,"fagpakke og indeks har samme kilderevisjon");
ok(registries.length===5,"fem modulære kilderegistre er aktive");
ok(dossierFiles.length===12,"tolv temadossierfiler er aktive");
ok(sources.length===30,"tretti verifiserte forskningskilder er aktive");
ok(dossiers.length===12,"tolv temaer har kildedossier");
ok(new Set(sources.map(s=>s.source_id)).size===30,"kilde-ID-er er unike");
ok(new Set(dossiers.map(d=>d.emne_id)).size===12,"dossier-ID-er er unike");
const allowedHosts=new Set(["academic.oup.com","boydellandbrewer.com","mitpress.mit.edu","www.routledge.com","online.ucpress.edu","www.cambridge.org","press.uchicago.edu","www.hup.harvard.edu","www.press.umich.edu"]);
for(const r of registries){ok(r.status==="canonical_verified_scholarly_source_registry",`${r.registry_id} er canonicalt`);ok(r.not_a_systematic_review===true,`${r.registry_id} er ikke systematisk review`);ok(r.rilm_scope_control.record_level_search_status==="not_completed_subscription_access_required",`${r.registry_id} oppgir RILM-gap`)}
for(const s of sources){for(const f of requiredSource)ok(Object.hasOwn(s,f),`${s.source_id} har ${f}`);const u=new URL(s.canonical_url);ok(u.protocol==="https:",`${s.source_id} bruker HTTPS`);ok(allowedHosts.has(u.hostname),`${s.source_id} bruker tillatt vert`);ok(s.verification.checked_at==="2026-07-27"||s.verification.checked_at==="2026-07-28",`${s.source_id} har kontrollert dato`);ok(Object.keys(s.identifiers).length>0,`${s.source_id} har identifikator`);ok(s.allowed_use.length>=2&&s.forbidden_use.length>=2,`${s.source_id} har bruksgrenser`)}
const used=new Set();
for(const d of dossiers){for(const f of requiredDossier)ok(Object.hasOwn(d,f),`${d.emne_id} har ${f}`);ok(topicIds.has(d.emne_id),`${d.emne_id} er aktivt tema`);const ids=[...new Set([...d.canonical_source_ids,...d.current_research_source_ids,...d.method_source_ids])];ids.forEach(id=>used.add(id));ok(ids.length>=3,`${d.emne_id} har minst tre kilder`);ok(d.canonical_source_ids.length>=2,`${d.emne_id} har to canonicale kilder`);ok(d.current_research_source_ids.some(id=>byId.get(id)?.year>=2018),`${d.emne_id} har nyere forskning`);ok(d.method_source_ids.length>=1,`${d.emne_id} har metodekilde`);for(const id of ids)ok(byId.has(id),`${d.emne_id} bruker kjent kilde ${id}`);ok(d.direct_object_gate.required_before_question_release===true,`${d.emne_id} krever direkte objekt`);ok(d.direct_object_gate.minimum_metadata.length>=6,`${d.emne_id} har seks metadata`);ok(d.direct_object_gate.minimum_locator_count>=2,`${d.emne_id} krever to lokatorer`);ok(d.documented_research_tensions.length>=3,`${d.emne_id} har faglige spenninger`);ok(d.allowed_claims.length>=3&&d.forbidden_overreach.length>=3,`${d.emne_id} har slutningsgrenser`);ok(d.search_log.record_level_rilm_search==="not_completed_subscription_access_required",`${d.emne_id} oppgir RILM-gap`);ok(d.coverage_bias.length>=2&&d.known_gaps.length>=3,`${d.emne_id} dokumenterer skjevheter og hull`)}
ok([...used].every(id=>byId.has(id)),"alle brukte kilde-ID-er finnes");
ok(index.summary.source_dossier_domain_count===2,"indeksen teller to kildedomener");
ok(index.summary.source_dossier_topic_count===12,"indeksen teller tolv dossierer");
ok(index.summary.verified_scholarly_source_record_count===30,"indeksen teller tretti kilder");
ok(pkg.summary.source_dossier_topic_count===12,"fagpakken eksponerer tolv dossierer");
console.log("MUSIKKVITENSKAP KILDEGRUNNLAG TO DOMENER V2");
console.log(`Kildedomener: ${index.summary.source_dossier_domain_count}`);
console.log(`Temadossierer: ${dossiers.length}`);
console.log(`Verifiserte forskningskilder: ${sources.length}`);
console.log(`RESULTAT ${fail===0?"PASS":"FAIL"}: ${pass} PASS, ${fail} FAIL`);
process.exit(fail===0?0:1);
