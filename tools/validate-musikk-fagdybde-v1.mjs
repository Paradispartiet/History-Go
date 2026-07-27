#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.MUSIKK_SCIENTIFIC_BASE || "data/fag/musikk/musikkvitenskap_canonical_v1";
const PACKAGE = process.env.MUSIKK_SCIENTIFIC_PACKAGE || "data/fag/musikk/scientific_package.json";
const REV = "musikkvitenskap-fagdybde-v1-2026-07-27";
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
let pass = 0;
const ok = (value, message) => {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass++;
};
const collectKeys = value => {
  const keys = [];
  if (Array.isArray(value)) for (const item of value) keys.push(...collectKeys(item));
  else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      keys.push(key);
      keys.push(...collectKeys(item));
    }
  }
  return keys;
};

const index = read(path.join(BASE, "index.json"));
const pkg = read(PACKAGE);
const contract = read(path.join(BASE, index.files.research_contract));
const discipline = read(path.join(BASE, index.files.disciplinary_architecture));
const methods = read(path.join(BASE, index.files.method_protocols));
const theory = read(path.join(BASE, index.files.theory_and_debates));
const sources = read(path.join(BASE, index.files.scholarly_source_standard));

for (const file of [
  index.files.research_contract,
  index.files.institutions_sources,
  index.files.disciplinary_architecture,
  index.files.method_protocols,
  index.files.theory_and_debates,
  index.files.scholarly_source_standard,
  ...index.files.modules
]) ok(fs.existsSync(path.join(BASE, file)), `Vitenskapelig fil finnes: ${file}`);

ok(index.revision === REV, "Indeks har riktig fagdybderevisjon");
ok(pkg.revision === REV, "Fagpakke har riktig fagdybderevisjon");
ok(index.status === "canonical_scientific_subject", "Status er vitenskapelig fag, ikke studieprogram");
ok(pkg.status === "canonical_scientific_subject", "Aktiv pakke er vitenskapelig fag");
ok(pkg.active_scientific_package === "musikkvitenskap_canonical_v1/index.json", "Vitenskapelig autoritet er entydig");
ok(!fs.existsSync(path.join(BASE, "university_v1")), "Ingen undervisnings- eller universitetsprogramkatalog finnes");
ok(!fs.existsSync("tools/validate-musikk-university-framework-v1.mjs"), "Gammel undervisningsvalidator er fjernet");
ok(!fs.existsSync("reports/musikk-canonical-migration/musikk-university-framework-v1.md"), "Gammel undervisningsrapport er fjernet");

const forbiddenKeys = new Set([
  "ects","semester","course_id","course_files","teaching_and_learning",
  "compulsory_activities","assessment","programme_learning_outcomes",
  "qualification_alignment","university_framework","active_university_framework"
]);
for (const [label, value] of Object.entries({index,pkg,contract,discipline,methods,theory,sources})) {
  const hits = collectKeys(value).filter(key => forbiddenKeys.has(key));
  ok(hits.length === 0, `${label} inneholder ingen undervisningsnøkler`);
}

ok(discipline.subdisciplines.length === 12, "Tolv deldisipliner er definert");
ok(discipline.cross_cutting_axes.length === 8, "Åtte tverrgående analyseakser er definert");
ok(discipline.research_object_types.length >= 20, "Minst tjue forskningsobjekttyper er definert");
ok(discipline.epistemic_distinctions.length >= 10, "Epistemiske hovedskiller er eksplisitte");
ok(discipline.hard_quality_rules.length >= 10, "Bindende faglige kvalitetsregler er eksplisitte");
const subIds = discipline.subdisciplines.map(x => x.id);
ok(new Set(subIds).size === subIds.length, "Deldisiplin-ID-er er unike");
for (const sub of discipline.subdisciplines) {
  ok(sub.objects.length >= 3, `${sub.id} har konkrete forskningsobjekter`);
  ok(sub.core_questions.length >= 2, `${sub.id} har disiplinære kjernespørsmål`);
}

ok(methods.protocols.length === 18, "Atten metodeprotokoller er definert");
const methodIds = methods.protocols.map(x => x.method_id);
ok(new Set(methodIds).size === methodIds.length, "Metode-ID-er er unike");
const objects = new Set(discipline.research_object_types);
for (const method of methods.protocols) {
  ok(method.procedure.length >= 5, `${method.method_id} har full arbeidsprosedyre`);
  ok(method.validity_threats.length >= 3, `${method.method_id} har metodebestemte gyldighetstrusler`);
  ok(method.permitted_claims.length >= 3, `${method.method_id} avgrenser tillatte påstander`);
  ok(method.required_reporting.length >= 5, `${method.method_id} har rapporteringskrav`);
  for (const object of method.compatible_evidence) ok(objects.has(object), `${method.method_id} bruker kjent evidenstype ${object}`);
}

ok(theory.theoretical_traditions.length === 25, "Tjuefem teoritradisjoner er definert");
ok(theory.research_debates.length === 16, "Seksten aktive forskningsdebatter er definert");
const theoryIds = theory.theoretical_traditions.map(x => x.theory_id);
const debateIds = theory.research_debates.map(x => x.debate_id);
ok(new Set(theoryIds).size === theoryIds.length, "Teori-ID-er er unike");
ok(new Set(debateIds).size === debateIds.length, "Debatt-ID-er er unike");
for (const item of theory.theoretical_traditions) {
  ok(item.analytical_use.length >= 45, `${item.theory_id} har substansiell anvendelse`);
  ok(item.eligible_objects.length >= 1, `${item.theory_id} er koblet til forskningsobjekt`);
  ok(item.limit.length >= 35, `${item.theory_id} har eksplisitt begrensning`);
}
for (const debate of theory.research_debates) {
  ok(debate.required_handling.length === 4, `${debate.debate_id} krever balansert faglig behandling`);
}

ok(sources.infrastructures.length === 14, "Fjorten vitenskapelige infrastrukturer er registrert");
for (const source of sources.infrastructures) {
  ok(source.url.startsWith("https://"), `${source.source_id} har inspectable URL`);
  ok(source.role.length >= 5, `${source.source_id} har eksplisitt kildefunksjon`);
}
ok(sources.minimum_metadata_by_object.audio.length >= 6, "Lydobjekter har minimumsmetadata");
ok(sources.minimum_metadata_by_object.dataset_code.length >= 7, "Datasett og kode har minimumsmetadata");
ok(sources.generator_rules.length >= 5, "Kildebruk har bindende generatorregler");

ok(contract.version === "2.0", "Forskningskontrakten er oppgradert til v2");
ok(contract.purpose.includes("beskriver ikke undervisning"), "Forskningskontrakten avviser undervisningsramme");
ok(contract.analytical_depth_contract.minimum_dimensions.length >= 7, "Analytisk dybde er eksplisitt definert");
ok(contract.analytical_depth_contract.depth_levels.research_front.length >= 50, "Forskningsfrontnivå er definert");
ok(contract.hard_rules.teaching_framework_forbidden === true, "Undervisningsramme er uttrykkelig forbudt");
ok(contract.evidence_contract.claim_types.length === 10, "Ti påstandstyper er bevart");
ok(contract.place_application_contract.required_place_link.length >= 5, "Stedskobling er fortsatt vitenskapelig kontrollert");

ok(index.summary.subdiscipline_count === discipline.subdisciplines.length, "Deldisiplinantall matcher indeks");
ok(index.summary.method_protocol_count === methods.protocols.length, "Metodeprotokollantall matcher indeks");
ok(index.summary.theoretical_tradition_count === theory.theoretical_traditions.length, "Teoriantall matcher indeks");
ok(index.summary.research_debate_count === theory.research_debates.length, "Debattantall matcher indeks");
ok(index.summary.scholarly_infrastructure_count === sources.infrastructures.length, "Infrastrukturantall matcher indeks");

console.log(`PASS: ${pass}`);
console.log("RESULTAT: PASS");
