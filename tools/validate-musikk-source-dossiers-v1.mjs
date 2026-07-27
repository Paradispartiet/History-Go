#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BASE = "data/fag/musikk/musikkvitenskap_canonical_v1";
const REV = "musikkvitenskap-kildegrunnlag-tre-domener-v3-2026-07-28";
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
let pass = 0;
let fail = 0;
const ok = (value, message) => {
  if (value) pass += 1;
  else {
    fail += 1;
    console.error(`FAIL ${message}`);
  }
};
const nonEmptyStrings = values =>
  Array.isArray(values) && values.length > 0 &&
  values.every(value => typeof value === "string" && value.trim().length > 0);
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
const pkg = read("data/fag/musikk/scientific_package.json");
const contract = read(path.join(BASE, index.files.source_dossier_contract));
const registries = index.files.scholarly_source_registries.map(file => read(path.join(BASE, file)));
const dossierFiles = index.files.source_dossiers.map(file => read(path.join(BASE, file)));
const modules = index.files.canonical_modules.map(file => read(path.join(BASE, file)));
const sources = registries.flatMap(registry => registry.sources);
const dossiers = dossierFiles.flatMap(file => file.topic_dossiers);
const topicIds = new Set(modules.flatMap(module => module.topics.map(topic => topic.emne_id)));
const byId = new Map(sources.map(source => [source.source_id, source]));
const requiredSource = contract.required_source_fields;
const requiredDossier = contract.required_dossier_fields;
const forbidden = new Set(contract.forbidden_keys);

for (const file of [
  index.files.source_dossier_contract,
  ...index.files.scholarly_source_registries,
  ...index.files.source_dossiers
]) ok(fs.existsSync(path.join(BASE, file)), `fil finnes ${file}`);

ok(index.source_revision === REV, "indeks har samlet kilderevisjon");
ok(pkg.source_revision === REV, "fagpakke har samlet kilderevisjon");
ok(contract.revision === REV, "kildekontrakten har samlet kilderevisjon");
ok(pkg.source_revision === index.source_revision, "fagpakke og indeks har samme kilderevisjon");
ok(registries.length === 6, "seks modulære kilderegistre er aktive");
ok(dossierFiles.length === 18, "atten temadossierfiler er aktive");
ok(sources.length === 39, "trettini verifiserte forskningskilder er aktive");
ok(dossiers.length === 18, "atten temaer har kildedossier");
ok(new Set(sources.map(source => source.source_id)).size === 39, "kilde-ID-er er unike");
ok(new Set(dossiers.map(dossier => dossier.emne_id)).size === 18, "dossier-ID-er er unike");

const allowedHosts = new Set([
  "academic.oup.com",
  "boydellandbrewer.com",
  "mitpress.mit.edu",
  "www.routledge.com",
  "online.ucpress.edu",
  "www.ucpress.edu",
  "www.cambridge.org",
  "press.uchicago.edu",
  "www.hup.harvard.edu",
  "www.press.umich.edu",
  "www.bloomsbury.com",
  "www.upress.umn.edu",
  "datascience.codata.org"
]);
const allowedTypes = new Set([
  "scholarly_monograph",
  "edited_scholarly_volume",
  "peer_reviewed_article",
  "scholarly_chapter"
]);

for (const registry of registries) {
  ok(registry.status === "canonical_verified_scholarly_source_registry", `${registry.registry_id} er canonicalt`);
  ok(registry.not_a_systematic_review === true, `${registry.registry_id} er ikke systematisk review`);
  ok(registry.rilm_scope_control.record_level_search_status === "not_completed_subscription_access_required", `${registry.registry_id} oppgir RILM-gap`);
  ok(registry.rilm_scope_control.classes_used.length >= 3, `${registry.registry_id} dokumenterer faglig søkeavgrensning`);
}

for (const source of sources) {
  for (const field of requiredSource) ok(Object.hasOwn(source, field), `${source.source_id} har ${field}`);
  ok(nonEmptyStrings(source.creators), `${source.source_id} har navngitte opphavspersoner`);
  ok(Number.isInteger(source.year) && source.year >= 1900 && source.year <= 2026, `${source.source_id} har gyldig år`);
  ok(allowedTypes.has(source.publication_type), `${source.source_id} har tillatt publikasjonstype`);
  const url = new URL(source.canonical_url);
  ok(url.protocol === "https:", `${source.source_id} bruker HTTPS`);
  ok(allowedHosts.has(url.hostname), `${source.source_id} bruker tillatt offisiell vert`);
  ok(source.verification.checked_at === "2026-07-27" || source.verification.checked_at === "2026-07-28", `${source.source_id} har kontrollert dato`);
  ok(typeof source.verification.status === "string" && source.verification.status.length >= 12, `${source.source_id} har verifikasjonsstatus`);
  ok(typeof source.verification.full_text_status === "string" && source.verification.full_text_status.length >= 8, `${source.source_id} oppgir fulltekststatus`);
  ok(Object.keys(source.identifiers).length > 0, `${source.source_id} har identifikator`);
  if (source.identifiers.doi) ok(/^10\.\d{4,9}\/\S+$/.test(source.identifiers.doi), `${source.source_id} har gyldig DOI-format`);
  ok(nonEmptyStrings(source.source_roles), `${source.source_id} har kilderoller`);
  ok(typeof source.scope_note === "string" && source.scope_note.length >= 40, `${source.source_id} har avgrenset relevans`);
  ok(nonEmptyStrings(source.allowed_use) && source.allowed_use.length >= 2, `${source.source_id} har tillatt bruk`);
  ok(nonEmptyStrings(source.forbidden_use) && source.forbidden_use.length >= 2, `${source.source_id} har forbudt overtolkning`);
}

const used = new Set();
for (const dossier of dossiers) {
  for (const field of requiredDossier) ok(Object.hasOwn(dossier, field), `${dossier.emne_id} har ${field}`);
  ok(topicIds.has(dossier.emne_id), `${dossier.emne_id} er aktivt tema`);
  ok(dossier.completion_level === "publisher_verified_bibliographic_basis", `${dossier.emne_id} har ærlig fullføringsnivå`);
  const ids = [...new Set([
    ...dossier.canonical_source_ids,
    ...dossier.current_research_source_ids,
    ...dossier.method_source_ids
  ])];
  ids.forEach(id => used.add(id));
  ok(ids.length >= 3, `${dossier.emne_id} har minst tre kilder`);
  ok(dossier.canonical_source_ids.length >= 2, `${dossier.emne_id} har to canonicale kilder`);
  ok(dossier.current_research_source_ids.some(id => byId.get(id)?.year >= 2018), `${dossier.emne_id} har nyere forskning`);
  ok(dossier.method_source_ids.length >= 1, `${dossier.emne_id} har metodekilde`);
  for (const id of ids) ok(byId.has(id), `${dossier.emne_id} bruker kjent kilde ${id}`);
  ok(dossier.direct_object_gate.required_before_question_release === true, `${dossier.emne_id} krever direkte objekt`);
  ok(dossier.direct_object_gate.accepted_object_types.length >= 2, `${dossier.emne_id} har objektavgrensning`);
  ok(dossier.direct_object_gate.minimum_metadata.length >= 6, `${dossier.emne_id} har seks metadata`);
  ok(dossier.direct_object_gate.minimum_locator_count >= 2, `${dossier.emne_id} krever to lokatorer`);
  ok(dossier.documented_research_tensions.length >= 3, `${dossier.emne_id} har faglige spenninger`);
  ok(dossier.allowed_claims.length >= 3, `${dossier.emne_id} har tillatte påstander`);
  ok(dossier.forbidden_overreach.length >= 3, `${dossier.emne_id} har overtolkningssperrer`);
  ok(dossier.search_log.channels.length >= 3 && dossier.search_log.queries.length >= 3, `${dossier.emne_id} dokumenterer søk`);
  ok(dossier.search_log.record_level_rilm_search === "not_completed_subscription_access_required", `${dossier.emne_id} oppgir RILM-gap`);
  ok(dossier.coverage_bias.length >= 2 && dossier.known_gaps.length >= 3, `${dossier.emne_id} dokumenterer skjevheter og hull`);
}

const ethnoModule = modules.find(module => module.domain.domain_id === "etnomusikologi_kultur_samfunn");
const ethnoIds = new Set(ethnoModule.topics.map(topic => topic.emne_id));
const ethnoDossiers = dossiers.filter(dossier => ethnoIds.has(dossier.emne_id));
const ethnoRequirements = contract.domain_specific_requirements.etnomusikologi_kultur_samfunn;
ok(ethnoDossiers.length === 6, "seks etnomusikologiske temaer har dossier");
ok(ethnoModule.topics.every(topic => ethnoDossiers.some(dossier => dossier.emne_id === topic.emne_id)), "alle etnomusikologiske temaer er dekket");
for (const dossier of ethnoDossiers) {
  ok(Object.hasOwn(dossier, "ethical_governance_gate"), `${dossier.emne_id} har etisk styringsport`);
  const gate = dossier.ethical_governance_gate;
  for (const field of ethnoRequirements.required_gate_fields) ok(Object.hasOwn(gate, field), `${dossier.emne_id} har styringsfeltet ${field}`);
  ok(gate.required_before_question_release === true, `${dossier.emne_id} krever etisk avklaring før spørsmål`);
  for (const field of [
    "consent_model",
    "participant_authority",
    "language_and_translation",
    "anonymization_and_risk",
    "community_benefit_and_return",
    "access_reuse_and_withdrawal",
    "restricted_or_non_publishable_material"
  ]) ok(nonEmptyStrings(gate[field]) && gate[field].length >= 2, `${dossier.emne_id} dokumenterer ${field}`);
  ok(gate.question_release_rule === "blocked_unless_all_fields_resolved", `${dossier.emne_id} blokkerer uavklarte spørsmål`);
}

for (const [label, value] of Object.entries({contract, registries, dossierFiles})) {
  const hits = collectKeys(value).filter(key => forbidden.has(key));
  ok(hits.length === 0, `${label} inneholder ingen undervisningsnøkler`);
}

ok([...used].every(id => byId.has(id)), "alle brukte kilde-ID-er finnes");
ok(index.summary.source_dossier_domain_count === 3, "indeksen teller tre kildedomener");
ok(index.summary.source_dossier_topic_count === 18, "indeksen teller atten dossierer");
ok(index.summary.verified_scholarly_source_record_count === 39, "indeksen teller trettini kilder");
ok(pkg.summary.source_dossier_domain_count === 3, "fagpakken eksponerer tre kildedomener");
ok(pkg.summary.source_dossier_topic_count === 18, "fagpakken eksponerer atten dossierer");
ok(pkg.summary.verified_scholarly_source_record_count === 39, "fagpakken eksponerer trettini kilder");
ok(contract.hard_rules.restricted_material_overrides_question_generation === true, "restriktivt materiale overstyrer spørsmålsproduksjon");
ok(contract.hard_rules.public_access_is_not_reuse_permission === true, "offentlig tilgang er ikke gjenbrukstillatelse");

console.log("MUSIKKVITENSKAP KILDEGRUNNLAG TRE DOMENER V3");
console.log(`Kildedomener: ${index.summary.source_dossier_domain_count}`);
console.log(`Temadossierer: ${dossiers.length}`);
console.log(`Verifiserte forskningskilder: ${sources.length}`);
console.log(`Etnomusikologiske styringsporter: ${ethnoDossiers.length}`);
console.log("Spørsmålsregel: blocked_unless_all_fields_resolved");
console.log(`RESULTAT ${fail === 0 ? "PASS" : "FAIL"}: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
