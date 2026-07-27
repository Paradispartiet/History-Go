#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE = path.join(ROOT, "data/fag/musikk/musikkvitenskap_canonical_v1");
const PACKAGE = path.join(ROOT, "data/fag/musikk/scientific_package.json");
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
let pass = 0;
let fail = 0;
const ok = (condition, label) => {
  if (condition) pass += 1;
  else {
    fail += 1;
    console.error(`FAIL ${label}`);
  }
};
const nonEmptyStrings = values =>
  Array.isArray(values) &&
  values.length > 0 &&
  values.every(value => typeof value === "string" && value.trim().length > 0);
const sameSet = (left, right) =>
  left.length === right.length &&
  left.every(value => right.includes(value)) &&
  right.every(value => left.includes(value));
const collectKeys = value => {
  const keys = [];
  if (Array.isArray(value)) {
    for (const item of value) keys.push(...collectKeys(item));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      keys.push(key);
      keys.push(...collectKeys(item));
    }
  }
  return keys;
};

const index = read(path.join(BASE, "index.json"));
const pkg = read(PACKAGE);
const contract = read(path.join(BASE, index.files.source_dossier_contract));
const sourceStandard = read(path.join(BASE, index.files.scholarly_source_standard));
const modules = index.files.canonical_modules.map(file => read(path.join(BASE, file)));
const moduleByDomain = new Map(modules.map(module => [module.domain.domain_id, module]));
const infrastructureIds = new Set(sourceStandard.infrastructures.map(item => item.source_id));
const forbidden = new Set(contract.forbidden_keys);

ok(index.status === "canonical_scientific_subject", "Indeksen har vitenskapelig fagstatus");
ok(pkg.status === "canonical_scientific_subject", "Fagpakken har vitenskapelig fagstatus");
ok(contract.status === "canonical_source_dossier_contract", "Kildekontrakten er canonical");
ok(index.source_revision === contract.revision, "Indeks og kontrakt har samme aggregerte kilderevisjon");
ok(pkg.source_revision === contract.revision, "Fagpakke og kontrakt har samme aggregerte kilderevisjon");
ok(contract.hard_rules.not_a_reading_list === true, "Kildegrunnlaget er ikke pensumliste");
ok(contract.hard_rules.not_a_systematic_review_unless_explicitly_declared === true, "Systematisk review kan ikke impliseres");
ok(contract.hard_rules.direct_object_required_before_question_release === true, "Direkte objekt kreves før spørsmålsfrigivelse");
ok(contract.hard_rules.full_text_claims_require_locator === true, "Detaljpåstander krever fulltekst og lokator");
ok(contract.hard_rules.catalog_metadata_is_not_object_evidence === true, "Katalogmetadata kan ikke erstatte objektevidens");
ok(Array.isArray(index.source_batches) && index.source_batches.length === 2, "To kildebatcher er aktive");
ok(index.source_batches.every(batch => contract.supported_batch_revisions.includes(batch.revision)), "Kontrakten støtter begge batchrevisjoner");

const flatRegistryFiles = index.source_batches.flatMap(batch => batch.registry_files);
const flatDossierFiles = index.source_batches.flatMap(batch => batch.dossier_files);
ok(sameSet(index.files.scholarly_source_registries, flatRegistryFiles), "Registermanifest samsvarer med batchmanifest");
ok(sameSet(index.files.source_dossiers, flatDossierFiles), "Dossiermanifest samsvarer med batchmanifest");

for (const file of [
  index.files.source_dossier_contract,
  ...index.files.scholarly_source_registries,
  ...index.files.source_dossiers
]) ok(fs.existsSync(path.join(BASE, file)), `Aktiv kildefil finnes: ${file}`);

const allowedHosts = new Set([
  "academic.oup.com",
  "boydellandbrewer.com",
  "mitpress.mit.edu",
  "www.routledge.com",
  "online.ucpress.edu",
  "www.cambridge.org",
  "press.uchicago.edu",
  "www.hup.harvard.edu",
  "www.press.umich.edu",
  "press.umich.edu",
  "www.press.uillinois.edu",
  "manchesteruniversitypress.co.uk",
  "www.dukeupress.edu",
  "www.ucpress.edu"
]);
const allowedTypes = new Set([
  "scholarly_monograph",
  "edited_scholarly_volume",
  "peer_reviewed_article",
  "scholarly_chapter"
]);

const globalSourceIds = [];
const globalDossierIds = [];
const globalUsedIds = new Set();
let totalRegistries = 0;
let totalDossierFiles = 0;
let totalSources = 0;
let totalDossiers = 0;
let totalScopeTerms = 0;

for (const batch of index.source_batches) {
  const module = moduleByDomain.get(batch.domain_id);
  ok(Boolean(module), `${batch.batch_id} peker på aktivt fagdomene`);
  const topicById = new Map(module.topics.map(topic => [topic.emne_id, topic]));

  const registries = batch.registry_files.map(file => read(path.join(BASE, file)));
  const dossierFiles = batch.dossier_files.map(file => read(path.join(BASE, file)));
  const sources = registries.flatMap(registry => registry.sources);
  const dossiers = dossierFiles.flatMap(file => file.topic_dossiers);
  const sourceById = new Map(sources.map(source => [source.source_id, source]));
  const batchUsed = new Set();

  totalRegistries += registries.length;
  totalDossierFiles += dossierFiles.length;
  totalSources += sources.length;
  totalDossiers += dossiers.length;
  globalSourceIds.push(...sources.map(source => source.source_id));
  globalDossierIds.push(...dossiers.map(dossier => dossier.emne_id));

  ok(registries.length === batch.registry_files.length, `${batch.batch_id} laster alle registre`);
  ok(dossierFiles.length === batch.dossier_files.length, `${batch.batch_id} laster alle dossierfiler`);
  ok(sources.length === batch.expected_source_count, `${batch.batch_id} har forventet kildeantall`);
  ok(dossiers.length === batch.expected_topic_count, `${batch.batch_id} har forventet dossierantall`);
  ok(new Set(sources.map(source => source.source_id)).size === sources.length, `${batch.batch_id} har unike kilde-ID-er`);
  ok(new Set(dossiers.map(dossier => dossier.emne_id)).size === dossiers.length, `${batch.batch_id} har unike dossier-ID-er`);

  for (const registry of registries) {
    ok(registry.status === "canonical_verified_scholarly_source_registry", `${registry.registry_id} er canonicalt register`);
    ok(registry.revision === batch.revision, `${registry.registry_id} har riktig batchrevisjon`);
    ok(registry.not_a_systematic_review === true, `${registry.registry_id} hevder ikke systematisk review`);
    ok(registry.rilm_scope_control.record_level_search_status === "not_completed_subscription_access_required", `${registry.registry_id} oppgir RILM-gap`);
    const scopeCount =
      (registry.rilm_scope_control.classes_used?.length ?? 0) +
      (registry.rilm_scope_control.scope_terms_used?.length ?? 0);
    ok(scopeCount >= 4, `${registry.registry_id} har dokumentert søkeavgrensning`);
    totalScopeTerms += scopeCount;
  }

  for (const source of sources) {
    for (const field of contract.required_source_fields)
      ok(Object.hasOwn(source, field), `${source.source_id} har ${field}`);
    ok(nonEmptyStrings(source.creators), `${source.source_id} har navngitte opphavspersoner`);
    ok(Number.isInteger(source.year) && source.year >= 1900 && source.year <= 2026, `${source.source_id} har gyldig år`);
    ok(allowedTypes.has(source.publication_type), `${source.source_id} har tillatt publikasjonstype`);
    try {
      const url = new URL(source.canonical_url);
      ok(url.protocol === "https:", `${source.source_id} bruker HTTPS`);
      ok(allowedHosts.has(url.hostname), `${source.source_id} bruker tillatt offisiell vert`);
    } catch {
      ok(false, `${source.source_id} har gyldig URL`);
      ok(false, `${source.source_id} bruker tillatt offisiell vert`);
    }
    ok(["2026-07-27","2026-07-28"].includes(source.verification.checked_at), `${source.source_id} har kontrollert dato`);
    ok(typeof source.verification.status === "string" && source.verification.status.length > 10, `${source.source_id} har verifikasjonsstatus`);
    ok(typeof source.verification.full_text_status === "string", `${source.source_id} oppgir fulltekststatus`);
    ok(Object.keys(source.identifiers).length >= 1, `${source.source_id} har DOI eller ISBN`);
    if (source.identifiers.doi)
      ok(/^10\.\d{4,9}\/\S+$/.test(source.identifiers.doi), `${source.source_id} har gyldig DOI-format`);
    ok(nonEmptyStrings(source.source_roles), `${source.source_id} har kilderoller`);
    ok(typeof source.scope_note === "string" && source.scope_note.length >= 40, `${source.source_id} har avgrenset rekkevidde`);
    ok(source.allowed_use.length >= 2, `${source.source_id} har minst to tillatte bruksmåter`);
    ok(source.forbidden_use.length >= 2, `${source.source_id} har minst to overtolkningsforbud`);
  }

  for (const wrapper of dossierFiles) {
    ok(wrapper.status === "canonical_topic_source_dossiers", `${batch.batch_id} har canonical dossierfil`);
    ok(wrapper.revision === batch.revision, `${batch.batch_id} har riktig dossierrevisjon`);
    ok(wrapper.contract === "../../source_dossier_contract_v1.json", `${batch.batch_id} peker på aktiv kildekontrakt`);
  }

  for (const dossier of dossiers) {
    const topic = topicById.get(dossier.emne_id);
    for (const field of contract.required_dossier_fields)
      ok(Object.hasOwn(dossier, field), `${dossier.emne_id} har ${field}`);
    ok(Boolean(topic), `${dossier.emne_id} er aktivt tema`);
    const sourceIds = [...new Set([
      ...dossier.canonical_source_ids,
      ...dossier.current_research_source_ids,
      ...dossier.method_source_ids
    ])];
    sourceIds.forEach(sourceId => {
      batchUsed.add(sourceId);
      globalUsedIds.add(sourceId);
    });
    ok(sourceIds.length >= 3, `${dossier.emne_id} har minst tre unike kilder`);
    ok(dossier.canonical_source_ids.length >= 2, `${dossier.emne_id} har minst to canonicale kilder`);
    ok(dossier.current_research_source_ids.some(sourceId => sourceById.get(sourceId)?.year >= 2018), `${dossier.emne_id} har nyere forskning`);
    ok(dossier.method_source_ids.length >= 1, `${dossier.emne_id} har metodekilde`);
    for (const sourceId of sourceIds)
      ok(sourceById.has(sourceId), `${dossier.emne_id} bruker kjent batchkilde ${sourceId}`);
    ok(dossier.direct_object_gate.required_before_question_release === true, `${dossier.emne_id} krever direkte objekt`);
    ok(dossier.direct_object_gate.accepted_object_types.length >= 2, `${dossier.emne_id} har objektavgrensning`);
    ok(dossier.direct_object_gate.accepted_object_types.every(type => topic.research_object_types.includes(type)), `${dossier.emne_id} bruker aktive objekttyper`);
    ok(dossier.direct_object_gate.minimum_metadata.length >= 6, `${dossier.emne_id} har minst seks objektmetadata`);
    ok(dossier.direct_object_gate.minimum_locator_count >= 2, `${dossier.emne_id} krever minst to lokatorer`);
    ok(dossier.documented_research_tensions.length >= 3, `${dossier.emne_id} har faglige spenninger`);
    ok(dossier.allowed_claims.length >= 3, `${dossier.emne_id} avgrenser tillatte påstander`);
    ok(dossier.forbidden_overreach.length >= 3, `${dossier.emne_id} avgrenser overtolkning`);
    ok(dossier.search_log.channels.length >= 3, `${dossier.emne_id} dokumenterer søkekanaler`);
    ok(dossier.search_log.queries.length >= 3, `${dossier.emne_id} dokumenterer søkestrenger`);
    ok(dossier.search_log.record_level_rilm_search === "not_completed_subscription_access_required", `${dossier.emne_id} oppgir RILM-gap`);
    ok(dossier.coverage_bias.length >= 2, `${dossier.emne_id} dokumenterer dekningsskjevhet`);
    ok(dossier.known_gaps.length >= 3, `${dossier.emne_id} dokumenterer kjente hull`);

    if (batch.domain_id === "historisk_musikkvitenskap_historiografi") {
      for (const field of contract.historical_dossier_required_fields)
        ok(Object.hasOwn(dossier, field), `${dossier.emne_id} har historiefeltet ${field}`);
      ok(dossier.primary_source_infrastructure_ids.length >= 3, `${dossier.emne_id} har minst tre kildeinfrastrukturer`);
      ok(dossier.primary_source_infrastructure_ids.every(id => infrastructureIds.has(id)), `${dossier.emne_id} bruker kjente kildeinfrastrukturer`);
      ok(dossier.archive_or_object_identity_requirements.length >= 6, `${dossier.emne_id} har arkiv- og objektidentitetskrav`);
      ok(typeof dossier.catalog_metadata_limit === "string" && dossier.catalog_metadata_limit.length >= 80, `${dossier.emne_id} avgrenser katalogmetadata`);
      ok(dossier.source_chain_requirements.length >= 3, `${dossier.emne_id} har kildekjedekrav`);
    }
  }
  ok(batchUsed.size === sources.length, `${batch.batch_id} bruker alle registrerte kilder`);
}

ok(new Set(globalSourceIds).size === globalSourceIds.length, "Kilde-ID-er er globalt unike");
ok(new Set(globalDossierIds).size === globalDossierIds.length, "Dossier-ID-er er globalt unike");
ok(globalUsedIds.size === globalSourceIds.length, "Alle aktive kilder brukes av minst ett dossier");
ok(index.summary.source_dossier_domain_count === index.source_batches.length, "Indeksen teller kildedomener");
ok(index.summary.source_dossier_topic_count === totalDossiers, "Indeksen teller dossierer");
ok(index.summary.verified_scholarly_source_record_count === totalSources, "Indeksen teller forskningskilder");
ok(pkg.summary.source_dossier_domain_count === index.source_batches.length, "Fagpakken teller kildedomener");
ok(pkg.summary.source_dossier_topic_count === totalDossiers, "Fagpakken teller dossierer");
ok(pkg.summary.verified_scholarly_source_record_count === totalSources, "Fagpakken teller forskningskilder");
ok(pkg.active_source_manifest === "musikkvitenskap_canonical_v1/index.json#files.source_dossiers", "Fagpakken bruker aktivt kildemanifest");

for (const [label, value] of Object.entries({contract,index,pkg})) {
  const hits = collectKeys(value).filter(key => forbidden.has(key));
  ok(hits.length === 0, `${label} inneholder ingen undervisningsnøkler`);
}
for (const file of [...index.files.scholarly_source_registries, ...index.files.source_dossiers]) {
  const value = read(path.join(BASE, file));
  const hits = collectKeys(value).filter(key => forbidden.has(key));
  ok(hits.length === 0, `${file} inneholder ingen undervisningsnøkler`);
}

console.log("MUSIKKVITENSKAP KILDEGRUNNLAG – CUMULATIVE V3");
console.log(`Aktiv kilderevisjon: ${index.source_revision}`);
console.log(`Kildedomener: ${index.source_batches.length}`);
console.log(`Kilderegistre: ${totalRegistries}`);
console.log(`Temadossierfiler: ${totalDossierFiles}`);
console.log(`Temadossierer: ${totalDossiers}`);
console.log(`Verifiserte forskningskilder: ${totalSources}`);
console.log(`Dokumenterte RILM-klasser eller søkeavgrensninger: ${totalScopeTerms}`);
console.log("Fullføringsnivå: publisher_verified_bibliographic_basis");
console.log("Systematisk litteraturreview: nei");
console.log("Record-level RILM-søk: ikke utført; abonnementstilgang kreves");
console.log("Direkte musikk- eller kildeobjekt før spørsmålsfrigivelse: påkrevd");
console.log(`RESULTAT ${fail === 0 ? "PASS" : "FAIL"}: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
