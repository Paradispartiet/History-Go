#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE = path.join(ROOT, "data/fag/musikk/musikkvitenskap_canonical_v1");
const PACKAGE = path.join(ROOT, "data/fag/musikk/scientific_package.json");
const REV = "musikkvitenskap-kildegrunnlag-analyse-v1-2026-07-27";
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
const nonEmptyStrings = values => Array.isArray(values) && values.length > 0 && values.every(x => typeof x === "string" && x.trim().length > 0);

const index = read(path.join(BASE, "index.json"));
const pkg = read(PACKAGE);
const contract = read(path.join(BASE, index.files.source_dossier_contract));
const registries = index.files.scholarly_source_registries.map(file => read(path.join(BASE, file)));
const dossierFiles = index.files.source_dossiers.map(file => read(path.join(BASE, file)));
const registry = {
  revision: registries[0].revision,
  status: registries[0].status,
  not_a_systematic_review: registries.every(x => x.not_a_systematic_review === true),
  rilm_scope_control: registries[0].rilm_scope_control,
  sources: registries.flatMap(x => x.sources)
};
const dossier = {
  revision: dossierFiles[0].revision,
  status: dossierFiles[0].status,
  topic_dossiers: dossierFiles.flatMap(x => x.topic_dossiers)
};
const module = read(path.join(BASE, "modules_v2/musikalsk_analyse_lyd_struktur.json"));

for (const file of [
  index.files.source_dossier_contract,
  ...index.files.scholarly_source_registries,
  ...index.files.source_dossiers
]) ok(fs.existsSync(path.join(BASE, file)), `Kildegrunnlagsfil finnes: ${file}`);

ok(index.source_revision === REV, "Indeks har riktig kilderevisjon");
ok(pkg.source_revision === REV, "Fagpakke har riktig kilderevisjon");
ok(contract.revision === REV, "Kildekontrakten har riktig revisjon");
ok(registries.length === 4, "Fire modulære kilderegistre er aktive");
ok(dossierFiles.length === 6, "Seks modulære temadossierfiler er aktive");
for (const item of registries) ok(item.revision === REV, `${item.registry_id} har riktig revisjon`);
for (const item of dossierFiles) ok(item.revision === REV, "Temadossierfil har riktig revisjon");
for (const item of dossierFiles) {
  ok(item.source_registries === "../../scholarly_source_registries_v1/*.json", "Temadossierfil peker på modulære kilderegistre");
  ok(item.contract === "../../source_dossier_contract_v1.json", "Temadossierfil peker på canonical kildekontrakt");
}
ok(index.status === "canonical_scientific_subject", "Vitenskapelig fagstatus er bevart");
ok(contract.status === "canonical_source_dossier_contract", "Kildekontrakten er canonical");
ok(registry.status === "canonical_verified_scholarly_source_registry", "Kilderegisteret er canonicalt og verifisert");
ok(dossier.status === "canonical_topic_source_dossiers", "Temadossieret er canonicalt");
ok(contract.hard_rules.not_a_reading_list === true, "Kildegrunnlaget er ikke en pensumliste");
ok(contract.hard_rules.not_a_systematic_review_unless_explicitly_declared === true, "Systematisk review kan ikke impliseres");
ok(contract.hard_rules.direct_object_required_before_question_release === true, "Direkte objekt kreves før spørsmålsfrigivelse");
ok(registry.not_a_systematic_review === true, "Registeret hevder ikke systematisk review");
ok(registry.rilm_scope_control.record_level_search_status === "not_completed_subscription_access_required", "Manglende record-level RILM-søk er eksplisitt");
ok(registry.rilm_scope_control.classes_used.length >= 6, "RILM-fagklassene dokumenterer søkeavgrensningen");

const forbidden = new Set(contract.forbidden_keys);
for (const [label, value] of Object.entries({contract, registries, dossierFiles})) {
  const hits = collectKeys(value).filter(key => forbidden.has(key));
  ok(hits.length === 0, `${label} inneholder ingen undervisningsnøkler`);
}

const allowedTypes = new Set(["scholarly_monograph","edited_scholarly_volume","peer_reviewed_article","scholarly_chapter"]);
const allowedHosts = new Set([
  "academic.oup.com","boydellandbrewer.com","mitpress.mit.edu","www.routledge.com",
  "online.ucpress.edu","www.cambridge.org","press.uchicago.edu"
]);
const sources = registry.sources;
ok(sources.length === 21, "Registeret har 21 verifiserte forskningskilder");
const sourceIds = sources.map(x => x.source_id);
ok(new Set(sourceIds).size === sourceIds.length, "Kilde-ID-er er unike");
const byId = new Map(sources.map(x => [x.source_id, x]));

for (const source of sources) {
  for (const field of contract.required_source_fields) ok(Object.hasOwn(source, field), `${source.source_id} har feltet ${field}`);
  ok(nonEmptyStrings(source.creators), `${source.source_id} har navngitte opphavspersoner`);
  ok(Number.isInteger(source.year) && source.year >= 1900 && source.year <= 2026, `${source.source_id} har gyldig år`);
  ok(allowedTypes.has(source.publication_type), `${source.source_id} har tillatt publikasjonstype`);
  const url = new URL(source.canonical_url);
  ok(url.protocol === "https:", `${source.source_id} bruker HTTPS`);
  ok(allowedHosts.has(url.hostname), `${source.source_id} peker til tillatt offisiell vert`);
  ok(typeof source.verification.status === "string" && source.verification.status.length > 10, `${source.source_id} har verifikasjonsstatus`);
  ok(source.verification.checked_at === "2026-07-27", `${source.source_id} har kontrollert dato`);
  ok(typeof source.verification.full_text_status === "string", `${source.source_id} oppgir fulltekststatus`);
  ok(nonEmptyStrings(source.source_roles), `${source.source_id} har kilderoller`);
  ok(typeof source.scope_note === "string" && source.scope_note.length >= 40, `${source.source_id} har avgrenset relevans`);
  ok(nonEmptyStrings(source.allowed_use) && source.allowed_use.length >= 2, `${source.source_id} har minst to tillatte bruksmåter`);
  ok(nonEmptyStrings(source.forbidden_use) && source.forbidden_use.length >= 2, `${source.source_id} har minst to forbudte overtolkninger`);
  if (source.identifiers.doi) ok(/^10\.\d{4,9}\/\S+$/.test(source.identifiers.doi), `${source.source_id} har gyldig DOI-format`);
  ok(Object.keys(source.identifiers).length >= 1, `${source.source_id} har DOI eller ISBN`);
}

const topicIds = module.topics.map(x => x.emne_id);
const dossiers = dossier.topic_dossiers;
ok(dossiers.length === 6, "Seks analyse-temaer har kildedossier");
ok(new Set(dossiers.map(x => x.emne_id)).size === dossiers.length, "Dossier-ID-er er unike");
ok(topicIds.length === 6, "Aktiv analysemodul har seks temaer");
ok(topicIds.every(id => dossiers.some(d => d.emne_id === id)), "Alle seks aktive temaer har dossier");
ok(dossiers.every(d => topicIds.includes(d.emne_id)), "Ingen dossier peker til ukjent tema");

const used = new Set();
for (const item of dossiers) {
  for (const field of contract.required_dossier_fields) ok(Object.hasOwn(item, field), `${item.emne_id} har feltet ${field}`);
  ok(item.completion_level === "publisher_verified_bibliographic_basis", `${item.emne_id} har ærlig fullføringsnivå`);
  const ids = [...new Set([...item.canonical_source_ids, ...item.current_research_source_ids, ...item.method_source_ids])];
  ids.forEach(id => used.add(id));
  ok(ids.length >= 3, `${item.emne_id} har minst tre unike kilder`);
  ok(item.canonical_source_ids.length >= 2, `${item.emne_id} har minst to canonicale kilder`);
  ok(item.current_research_source_ids.length >= 1, `${item.emne_id} har nyere forskningsstatus`);
  ok(item.method_source_ids.length >= 1, `${item.emne_id} har metodekilde`);
  for (const id of ids) ok(byId.has(id), `${item.emne_id} bruker kjent kilde ${id}`);
  ok(item.current_research_source_ids.some(id => byId.get(id)?.year >= 2018), `${item.emne_id} har kilde fra 2018 eller senere`);
  ok(item.direct_object_gate.required_before_question_release === true, `${item.emne_id} krever direkte objekt før spørsmål`);
  ok(item.direct_object_gate.accepted_object_types.length >= 2, `${item.emne_id} har objektavgrensning`);
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
}
ok(used.size === sources.length, "Alle 21 kilder brukes av minst ett tema");
ok(index.summary.source_dossier_domain_count === 1, "Indeksen teller ett kildedomene");
ok(index.summary.source_dossier_topic_count === 6, "Indeksen teller seks kildedossier");
ok(index.summary.verified_scholarly_source_record_count === 21, "Indeksen teller 21 kilder");
ok(pkg.summary.source_dossier_topic_count === 6, "Fagpakken eksponerer seks kildedossier");
ok(pkg.active_source_dossiers === "musikkvitenskap_canonical_v1/source_dossiers_v1/*.json", "Fagpakken eksponerer aktiv dossiersti");

console.log("MUSIKKVITENSKAP KILDEGRUNNLAG ANALYSE V1");
console.log(`Revision: ${REV}`);
console.log(`Kildedomener: ${index.summary.source_dossier_domain_count}`);
console.log(`Temadossierer: ${dossiers.length}`);
console.log(`Verifiserte forskningskilder: ${sources.length}`);
console.log(`RILM-klasser brukt til søkeavgrensning: ${registry.rilm_scope_control.classes_used.length}`);
console.log("Fullføringsnivå: publisher_verified_bibliographic_basis");
console.log("Systematisk litteraturreview: nei");
console.log("Record-level RILM-søk: ikke utført; abonnementstilgang kreves");
console.log("Direkte musikk- eller kildeobjekt før spørsmålsfrigivelse: påkrevd");
console.log(`RESULTAT ${fail === 0 ? "PASS" : "FAIL"}: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
