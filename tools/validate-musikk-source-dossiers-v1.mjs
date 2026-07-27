#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE = path.join(ROOT, "data/fag/musikk/musikkvitenskap_canonical_v1");
const PACKAGE = path.join(ROOT, "data/fag/musikk/scientific_package.json");
let pass = 0;
let fail = 0;

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const ok = (condition, label) => {
  if (condition) {
    pass += 1;
  } else {
    fail += 1;
    console.error(`FAIL ${label}`);
  }
};
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
const nonEmptyStrings = values =>
  Array.isArray(values) &&
  values.length > 0 &&
  values.every(value => typeof value === "string" && value.trim().length > 0);
const sameSet = (left, right) =>
  left.length === right.length &&
  left.every(value => right.includes(value)) &&
  right.every(value => left.includes(value));

const index = read(path.join(BASE, "index.json"));
const pkg = read(PACKAGE);
const contract = read(path.join(BASE, index.files.source_dossier_contract));
const sourceStandard = read(path.join(BASE, index.files.scholarly_source_standard));
const modules = index.files.canonical_modules.map(file => ({
  file,
  data: read(path.join(BASE, file))
}));
const moduleByDomain = new Map(modules.map(item => [item.data.domain.domain_id, item.data]));
const infrastructureIds = new Set(sourceStandard.infrastructures.map(item => item.source_id));

ok(index.status === "canonical_scientific_subject", "Vitenskapelig fagstatus er bevart");
ok(pkg.status === "canonical_scientific_subject", "Fagpakken har vitenskapelig status");
ok(contract.status === "canonical_source_dossier_contract", "Kildekontrakten er canonical");
ok(contract.hard_rules.not_a_reading_list === true, "Kildegrunnlaget er ikke en pensumliste");
ok(contract.hard_rules.not_a_systematic_review_unless_explicitly_declared === true, "Systematisk review kan ikke impliseres");
ok(contract.hard_rules.direct_object_required_before_question_release === true, "Direkte objekt kreves før spørsmålsfrigivelse");
ok(contract.hard_rules.full_text_claims_require_locator === true, "Detaljpåstander krever fulltekst og lokator");
ok(contract.hard_rules.catalog_metadata_is_not_object_evidence === true, "Katalogmetadata kan ikke erstatte objektevidens");
ok(index.source_revision === contract.revision, "Indeks og kontrakt har samme aktive kilderevisjon");
ok(pkg.source_revision === contract.revision, "Fagpakke og kontrakt har samme aktive kilderevisjon");
ok(Array.isArray(index.source_batches) && index.source_batches.length >= 2, "Kildegrunnlaget er organisert i minst to domenevise batcher");
ok(index.source_batches.every(batch => contract.supported_batch_revisions.includes(batch.revision)), "Kontrakten støtter alle aktive batchrevisjoner");

const expectedRegistryFiles = index.source_batches.flatMap(batch => batch.registry_files);
const expectedDossierFiles = index.source_batches.flatMap(batch => batch.dossier_files);
ok(sameSet(index.files.scholarly_source_registries, expectedRegistryFiles), "Flatt registermanifest samsvarer med batchmanifestet");
ok(sameSet(index.files.source_dossiers, expectedDossierFiles), "Flatt dossiermanifest samsvarer med batchmanifestet");

for (const file of [
  index.files.source_dossier_contract,
  ...index.files.scholarly_source_registries,
  ...index.files.source_dossiers
]) {
  ok(fs.existsSync(path.join(BASE, file)), `Kildegrunnlagsfil finnes: ${file}`);
}

const forbidden = new Set(contract.forbidden_keys);
const allowedTypes = new Set([
  "scholarly_monograph",
  "edited_scholarly_volume",
  "peer_reviewed_article",
  "scholarly_chapter"
]);
const allowedHosts = new Set([
  "academic.oup.com",
  "boydellandbrewer.com",
  "mitpress.mit.edu",
  "www.routledge.com",
  "online.ucpress.edu",
  "www.cambridge.org",
  "press.uchicago.edu",
  "www.ucpress.edu",
  "www.dukeupress.edu",
  "dukeupress.edu",
  "www.press.uillinois.edu",
  "manchesteruniversitypress.co.uk",
  "press.umich.edu"
]);

const allSourceIds = [];
const allUsedSourceIds = new Set();
const allDossierTopicIds = [];
let totalRegistries = 0;
let totalDossierFiles = 0;
let totalSources = 0;
let totalDossiers = 0;
let totalScopeControls = 0;

for (const batch of index.source_batches) {
  ok(typeof batch.batch_id === "string" && batch.batch_id.length > 3, "Batch har identitet");
  ok(moduleByDomain.has(batch.domain_id), `${batch.batch_id} peker på aktivt fagdomene`);
  ok(batch.registry_files.length > 0, `${batch.batch_id} har kilderegistre`);
  ok(batch.dossier_files.length > 0, `${batch.batch_id} har dossierfiler`);

  const registries = batch.registry_files.map(file => read(path.join(BASE, file)));
  const dossierFiles = batch.dossier_files.map(file => read(path.join(BASE, file)));
  totalRegistries += registries.length;
  totalDossierFiles += dossierFiles.length;

  ok(registries.every(item => item.revision === batch.revision), `${batch.batch_id} har konsistent registerrevisjon`);
  ok(dossierFiles.every(item => item.revision === batch.revision), `${batch.batch_id} har konsistent dossierrevisjon`);
  ok(registries.every(item => item.domain_id === batch.domain_id), `${batch.batch_id} har riktig registerdomene`);
  ok(dossierFiles.every(item => item.domain_id === batch.domain_id), `${batch.batch_id} har riktig dossierdomene`);
  ok(registries.every(item => item.status === "canonical_verified_scholarly_source_registry"), `${batch.batch_id} har canonicale kilderegistre`);
  ok(dossierFiles.every(item => item.status === "canonical_topic_source_dossiers"), `${batch.batch_id} har canonicale dossierfiler`);
  ok(registries.every(item => item.not_a_systematic_review === true), `${batch.batch_id} hevder ikke systematisk review`);

  for (const item of registries) {
    const scope = item.rilm_scope_control ?? {};
    const scopeCount = (scope.classes_used?.length ?? 0) + (scope.scope_terms_used?.length ?? 0);
    ok(scope.record_level_search_status === "not_completed_subscription_access_required", `${item.registry_id} skjuler ikke RILM-tilgangsgap`);
    ok(scopeCount >= 4, `${item.registry_id} dokumenterer faglig søkeavgrensning`);
    totalScopeControls += scopeCount;
  }

  for (const item of dossierFiles) {
    ok(item.source_registries === "../../scholarly_source_registries_v1/*.json", "Temadossierfil peker på modulære kilderegistre");
    ok(item.contract === "../../source_dossier_contract_v1.json", "Temadossierfil peker på canonical kildekontrakt");
  }

  const sources = registries.flatMap(item => item.sources);
  const sourceIds = sources.map(item => item.source_id);
  const sourceIdSet = new Set(sourceIds);
  const byId = new Map(sources.map(item => [item.source_id, item]));
  totalSources += sources.length;
  allSourceIds.push(...sourceIds);

  ok(sources.length === batch.expected_source_count, `${batch.batch_id} har forventet kildeantall`);
  ok(sourceIdSet.size === sourceIds.length, `${batch.batch_id} har unike kilde-ID-er`);

  for (const source of sources) {
    for (const field of contract.required_source_fields) {
      ok(Object.hasOwn(source, field), `${source.source_id} har feltet ${field}`);
    }
    ok(nonEmptyStrings(source.creators), `${source.source_id} har navngitte opphavspersoner`);
    ok(Number.isInteger(source.year) && source.year >= 1900 && source.year <= 2026, `${source.source_id} har gyldig år`);
    ok(allowedTypes.has(source.publication_type), `${source.source_id} har tillatt publikasjonstype`);
    let url;
    try {
      url = new URL(source.canonical_url);
      ok(url.protocol === "https:", `${source.source_id} bruker HTTPS`);
      ok(allowedHosts.has(url.hostname), `${source.source_id} peker til tillatt offisiell vert`);
    } catch {
      ok(false, `${source.source_id} har gyldig canonical URL`);
      ok(false, `${source.source_id} peker til tillatt offisiell vert`);
    }
    ok(typeof source.verification.status === "string" && source.verification.status.length > 10, `${source.source_id} har verifikasjonsstatus`);
    ok(source.verification.checked_at === "2026-07-27", `${source.source_id} har kontrollert dato`);
    ok(typeof source.verification.full_text_status === "string", `${source.source_id} oppgir fulltekststatus`);
    ok(nonEmptyStrings(source.source_roles), `${source.source_id} har kilderoller`);
    ok(typeof source.scope_note === "string" && source.scope_note.length >= 40, `${source.source_id} har avgrenset relevans`);
    ok(nonEmptyStrings(source.allowed_use) && source.allowed_use.length >= 2, `${source.source_id} har minst to tillatte bruksmåter`);
    ok(nonEmptyStrings(source.forbidden_use) && source.forbidden_use.length >= 2, `${source.source_id} har minst to forbudte overtolkninger`);
    if (source.identifiers.doi) {
      ok(/^10\.\d{4,9}\/\S+$/.test(source.identifiers.doi), `${source.source_id} har gyldig DOI-format`);
    }
    ok(Object.keys(source.identifiers).length >= 1, `${source.source_id} har DOI eller ISBN`);
  }

  const module = moduleByDomain.get(batch.domain_id);
  const topicIds = module.topics.map(item => item.emne_id);
  const topicById = new Map(module.topics.map(item => [item.emne_id, item]));
  const dossiers = dossierFiles.flatMap(item => item.topic_dossiers);
  totalDossiers += dossiers.length;
  allDossierTopicIds.push(...dossiers.map(item => item.emne_id));

  ok(dossiers.length === batch.expected_topic_count, `${batch.batch_id} har forventet dossierantall`);
  ok(new Set(dossiers.map(item => item.emne_id)).size === dossiers.length, `${batch.batch_id} har unike dossier-ID-er`);
  ok(dossiers.every(item => topicIds.includes(item.emne_id)), `${batch.batch_id} peker bare på aktive temaer`);
  ok(dossiers.every(item => item.completion_level === "publisher_verified_bibliographic_basis"), `${batch.batch_id} har ærlig fullføringsnivå`);

  const batchUsed = new Set();
  for (const item of dossiers) {
    const topic = topicById.get(item.emne_id);
    for (const field of contract.required_dossier_fields) {
      ok(Object.hasOwn(item, field), `${item.emne_id} har feltet ${field}`);
    }
    const ids = [...new Set([
      ...item.canonical_source_ids,
      ...item.current_research_source_ids,
      ...item.method_source_ids
    ])];
    ids.forEach(id => {
      batchUsed.add(id);
      allUsedSourceIds.add(id);
    });
    ok(ids.length >= 3, `${item.emne_id} har minst tre unike kilder`);
    ok(item.canonical_source_ids.length >= 2, `${item.emne_id} har minst to canonicale kilder`);
    ok(item.current_research_source_ids.length >= 1, `${item.emne_id} har nyere forskningsstatus`);
    ok(item.method_source_ids.length >= 1, `${item.emne_id} har metodekilde`);
    for (const id of ids) ok(byId.has(id), `${item.emne_id} bruker kjent kilde ${id}`);
    ok(item.current_research_source_ids.some(id => byId.get(id)?.year >= 2018), `${item.emne_id} har kilde fra 2018 eller senere`);
    ok(item.direct_object_gate.required_before_question_release === true, `${item.emne_id} krever direkte objekt før spørsmål`);
    ok(item.direct_object_gate.accepted_object_types.length >= 2, `${item.emne_id} har objektavgrensning`);
    ok(item.direct_object_gate.accepted_object_types.every(type => topic.research_object_types.includes(type)), `${item.emne_id} bruker aktive objekttyper`);
    ok(item.direct_object_gate.minimum_metadata.length >= 6, `${item.emne_id} har minst seks objektmetadata`);
    ok(item.direct_object_gate.minimum_locator_count >= 2, `${item.emne_id} krever minst to lokatorer`);
    ok(item.documented_research_tensions.length >= 3, `${item.emne_id} dokumenterer minst tre faglige spenninger`);
    ok(item.allowed_claims.length >= 3, `${item.emne_id} avgrenser tillatte påstander`);
    ok(item.forbidden_overreach.length >= 3, `${item.emne_id} avgrenser overtolkning`);
    ok(item.search_log.checked_at === "2026-07-27", `${item.emne_id} har søkedato`);
    ok(item.search_log.channels.length >= 3, `${item.emne_id} dokumenterer søkekanaler`);
    ok(item.search_log.queries.length >= 3, `${item.emne_id} dokumenterer søkestrenger`);
    ok(item.search_log.record_level_rilm_search === "not_completed_subscription_access_required", `${item.emne_id} skjuler ikke RILM-tilgangsgap`);
    ok(item.coverage_bias.length >= 2, `${item.emne_id} dokumenterer dekningsskjevhet`);
    ok(item.known_gaps.length >= 3, `${item.emne_id} dokumenterer kjente hull`);

    if (batch.domain_id === "historisk_musikkvitenskap_historiografi") {
      for (const field of contract.historical_dossier_required_fields) {
        ok(Object.hasOwn(item, field), `${item.emne_id} har historiefeltet ${field}`);
      }
      ok(item.primary_source_infrastructure_ids.length >= 3, `${item.emne_id} har minst tre primærkildeinfrastrukturer`);
      ok(item.primary_source_infrastructure_ids.every(id => infrastructureIds.has(id)), `${item.emne_id} bruker kjente kildeinfrastrukturer`);
      ok(item.archive_or_object_identity_requirements.length >= 6, `${item.emne_id} har objekt- og arkividentitetskrav`);
      ok(typeof item.catalog_metadata_limit === "string" && item.catalog_metadata_limit.length >= 80, `${item.emne_id} avgrenser katalogmetadata`);
      ok(item.source_chain_requirements.length >= 3, `${item.emne_id} har kildekjedekrav`);
    }
  }

  ok(batchUsed.size === sources.length, `${batch.batch_id} bruker alle registrerte kilder`);
}

ok(new Set(allSourceIds).size === allSourceIds.length, "Kilde-ID-er er globalt unike");
ok(new Set(allDossierTopicIds).size === allDossierTopicIds.length, "Dossier-temaer er globalt unike");
ok(allUsedSourceIds.size === allSourceIds.length, "Alle registrerte kilder brukes av minst ett tema");
ok(index.summary.source_dossier_domain_count === index.source_batches.length, "Indeksen teller aktive kildedomener");
ok(index.summary.source_dossier_topic_count === totalDossiers, "Indeksen teller alle kildedossier");
ok(index.summary.verified_scholarly_source_record_count === totalSources, "Indeksen teller alle forskningskilder");
ok(pkg.summary.source_dossier_domain_count === index.source_batches.length, "Fagpakken teller aktive kildedomener");
ok(pkg.summary.source_dossier_topic_count === totalDossiers, "Fagpakken teller alle kildedossier");
ok(pkg.summary.verified_scholarly_source_record_count === totalSources, "Fagpakken teller alle forskningskilder");
ok(pkg.active_source_dossiers === "musikkvitenskap_canonical_v1/source_dossiers_v1/*/*.json", "Fagpakken eksponerer domenevise dossierstier");

for (const [label, value] of Object.entries({contract, index, pkg})) {
  const hits = collectKeys(value).filter(key => forbidden.has(key));
  ok(hits.length === 0, `${label} inneholder ingen undervisningsnøkler`);
}
for (const file of [...index.files.scholarly_source_registries, ...index.files.source_dossiers]) {
  const value = read(path.join(BASE, file));
  const hits = collectKeys(value).filter(key => forbidden.has(key));
  ok(hits.length === 0, `${file} inneholder ingen undervisningsnøkler`);
}

console.log("MUSIKKVITENSKAP KILDEGRUNNLAG – CUMULATIVE VALIDATION");
console.log(`Aktiv kilderevisjon: ${index.source_revision}`);
console.log(`Kildedomener: ${index.source_batches.length}`);
console.log(`Kilderegistre: ${totalRegistries}`);
console.log(`Temadossierfiler: ${totalDossierFiles}`);
console.log(`Temadossierer: ${totalDossiers}`);
console.log(`Verifiserte forskningskilder: ${totalSources}`);
console.log(`Dokumenterte RILM-klasser eller søkeavgrensninger: ${totalScopeControls}`);
console.log("Fullføringsnivå: publisher_verified_bibliographic_basis");
console.log("Systematisk litteraturreview: nei");
console.log("Record-level RILM-søk: ikke utført; abonnementstilgang kreves");
console.log("Direkte musikk- eller kildeobjekt før spørsmålsfrigivelse: påkrevd");
console.log(`RESULTAT ${fail === 0 ? "PASS" : "FAIL"}: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
