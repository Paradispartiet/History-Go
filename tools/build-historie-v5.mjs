#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const historyDir = path.join(root, "data/fag/historie");
const blueprintPath = path.join(historyDir, "historie_v5_blueprint.json");
const contractPath = path.join(historyDir, "historie_v5_contract.json");
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, "utf8"));
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

const slug = (value) => value
  .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const methodLabels = {
  met_kildekritikk: "Kildekritikk",
  met_historiografisk_analyse: "Historiografisk analyse",
  met_kronologisk_rekonstruksjon: "Kronologisk rekonstruksjon",
  met_periodisering: "Periodisering",
  met_begrepshistorie: "Begrepshistorie",
  met_komparativ_historie: "Komparativ historie",
  met_arkivlesning: "Arkivlesning",
  met_sporlesning: "Sporlesning",
  met_seriell_kildeanalyse: "Seriell kildeanalyse",
  met_muntlig_historie: "Muntlig historie",
  met_visuell_kildekritikk: "Visuell kildekritikk",
  met_digital_kildekritikk: "Digital kildekritikk",
  met_institusjonshistorisk_analyse: "Institusjonshistorisk analyse",
  met_rettshistorisk_analyse: "Rettshistorisk analyse",
  met_forvaltningshistorisk_saksanalyse: "Forvaltningshistorisk saksanalyse",
  met_prosopografi: "Prosopografi",
  met_diskursanalyse: "Historisk diskursanalyse",
  met_kvantitativ_historie: "Kvantitativ historie",
  met_husholdsanalyse: "Husholds- og familiehistorisk analyse",
  met_mikrohistorisk_analyse: "Mikrohistorisk analyse",
  met_minneanalyse: "Minneanalyse",
  met_livslopsanalyse: "Historisk livsløpsanalyse",
  met_transnasjonal_sporing: "Transnasjonal sporing",
  met_materiell_kulturanalyse: "Materiell kulturanalyse",
  met_romlig_historie: "Romlig historie",
  met_historisk_gis: "Historisk GIS",
  met_miljohistorisk_analyse: "Miljøhistorisk analyse",
  met_nettverksanalyse: "Historisk nettverksanalyse",
  met_teknologisystemanalyse: "Teknologisystemanalyse",
  met_sammenvevd_historie: "Sammenvevd historie",
  met_protesthendelsesanalyse: "Protesthendelsesanalyse"
};

const commonMethods = ["met_kildekritikk", "met_historiografisk_analyse"];
const domains = [];
const emner = [];
const concepts = [];
const theoryObjects = new Map();
const hooks = [];
const methodIds = new Set(commonMethods);

for (const sourceDomain of blueprint.domains) {
  const domainMethods = [...new Set([...commonMethods, ...sourceDomain.methods])];
  domainMethods.forEach((id) => methodIds.add(id));
  const emneIds = [];
  const hookIds = [];

  sourceDomain.theories.forEach((theoryId) => {
    if (!theoryObjects.has(theoryId)) {
      theoryObjects.set(theoryId, {
        theory_id: theoryId,
        label: theoryId.split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
        object_type: "middle_range_model",
        definition: `Analytisk ramme for å undersøke ${theoryId.replaceAll("_", " ")} i historiske prosesser.`,
        explanatory_scope: [sourceDomain.id],
        limitations: [
          "Må brukes med eksplisitt tids-, sted- og kildeavgrensning.",
          "Kan ikke alene erstatte dokumentert historisk årsaksanalyse."
        ],
        status: "canonical"
      });
    } else {
      theoryObjects.get(theoryId).explanatory_scope.push(sourceDomain.id);
    }
  });

  sourceDomain.emner.forEach((title, index) => {
    const emneId = `em_${sourceDomain.id}_${slug(title)}`;
    const hookId = `hook_${sourceDomain.id}_${slug(title)}`;
    const conceptId = `beg_${slug(title)}`;
    const primaryTheory = sourceDomain.theories[index % sourceDomain.theories.length];
    const secondaryTheory = sourceDomain.theories[(index + 1) % sourceDomain.theories.length];
    const methods = [...new Set([
      domainMethods[index % domainMethods.length],
      domainMethods[(index + 1) % domainMethods.length],
      "met_kildekritikk",
      ...domainMethods
    ])].slice(0, 4);

    emneIds.push(emneId);
    hookIds.push(hookId);
    concepts.push({
      concept_id: conceptId,
      label: title,
      definition: `Historiefaglig begrep for ${title.toLowerCase()}, brukt med eksplisitt tids-, steds- og kildeavgrensning.`,
      concept_type: "analytical_concept",
      domain_ids: [sourceDomain.id],
      broader_concepts: [],
      narrower_concepts: [],
      related_concepts: [],
      distinguish_from: [],
      historical_scope: "Må avgrenses eksplisitt etter tid, sted og aktør.",
      common_misuse: ["Brukes som tidløs kategori uten historisk avgrensning."],
      status: "canonical"
    });
    emner.push({
      emne_id: emneId,
      subject_id: "historie",
      domain_id: sourceDomain.id,
      domain_label: sourceDomain.label,
      level: index < 4 ? 3 : 4,
      title,
      short_label: title,
      status: "active",
      definition: `Undersøker ${title.toLowerCase()} som historisk prosess med eksplisitt kildegrunnlag, kronologi og kontekst.`,
      why_it_matters: `Emnet gjør det mulig å forklare hvordan ${title.toLowerCase()} oppstod, virket og ble endret, uten å gjøre samtidens utfall uunngåelige.`,
      core_concept_ids: [conceptId],
      sub_concept_ids: [],
      key_questions: [
        `Hvilke kilder dokumenterer ${title.toLowerCase()}?`,
        "Hvilke aktører, institusjoner og materielle forhold formet prosessen?",
        "Hva endret seg, hva fortsatte, og hvilke alternative forklaringer finnes?"
      ],
      analysis_axes: [
        "aktør vs struktur",
        "formell ordning vs historisk praksis",
        "lokal utvikling vs større forbindelser",
        "brudd vs kontinuitet"
      ],
      historiographical_conflicts: [
        "strukturorientert forklaring vs aktørorientert forklaring",
        "nasjonal ramme vs transnasjonal eller lokal ramme"
      ],
      method_ids: methods,
      primary_theory_ids: [primaryTheory],
      secondary_theory_ids: [secondaryTheory],
      case_requirements: { min_local_cases: 2, min_nonlocal_cases: 1, case_anchor_required: true },
      source_requirements: {
        source_anchor_required: true,
        external_claim_basis_required: true,
        corroboration_required: true,
        limitation_required: true
      },
      generator_constraints: {
        require_chronology: true,
        require_context: true,
        require_method_anchor: true,
        require_critical_distinction: true,
        avoid_theory_name_as_answer: true
      },
      common_misunderstandings: ["Presentisme", "Teleologi", "Én hendelse brukt som full forklaring"],
      progression: ["fakta_og_spor", "kronologi_og_kontekst", "sammenheng_og_sammenligning", "teori_og_historiografi"],
      canonical_status: "canonical",
      registry_version: "historie_v5"
    });
    hooks.push({
      hook_id: hookId,
      domain_id: sourceDomain.id,
      emne_ids: [emneId],
      primary_theory_ids: [primaryTheory],
      secondary_theory_ids: [secondaryTheory],
      use_note: "Introduser teori først etter kilde, kronologi, aktør og kontekst.",
      limitation_required: true,
      status: "canonical"
    });
  });

  domains.push({
    domain_id: sourceDomain.id,
    label: sourceDomain.label,
    status: "complete_v5",
    emne_count: emneIds.length,
    theory_hook_count: hookIds.length,
    method_count: domainMethods.length,
    emne_ids: emneIds,
    theory_hook_ids: hookIds,
    theory_ids: sourceDomain.theories,
    method_ids: domainMethods,
    requirements: {
      min_emner: 8,
      min_theory_hooks: 8,
      min_methods: 6,
      min_core_concepts: 8,
      historiographical_conflict_required: true,
      source_profile_required: true,
      local_and_nonlocal_cases_required: true,
      progression_required: true
    }
  });
}

const methods = [...methodIds].sort().map((methodId) => ({
  method_id: methodId,
  label: methodLabels[methodId] ?? methodId.replaceAll("_", " "),
  definition: `Historisk metode eller analyseteknikk: ${(methodLabels[methodId] ?? methodId).toLowerCase()}.`,
  subject_id: "historie",
  status: "canonical"
}));

const packageData = {
  domains,
  emner,
  concepts,
  theory_objects: [...theoryObjects.values()],
  theory_hooks: hooks,
  methods
};

const errors = [];
const fail = (condition, message) => { if (!condition) errors.push(message); };
const ids = (items, key) => new Set(items.map((item) => item[key]));
const domainIds = ids(domains, "domain_id");
const emneIds = ids(emner, "emne_id");
const conceptIds = ids(concepts, "concept_id");
const theoryIds = ids(packageData.theory_objects, "theory_id");
const hookIds = ids(hooks, "hook_id");
const canonicalMethodIds = ids(methods, "method_id");

fail(domains.length === contract.counts.domains, `Expected ${contract.counts.domains} domains, got ${domains.length}`);
fail(emner.length === contract.counts.emner, `Expected ${contract.counts.emner} emner, got ${emner.length}`);
fail(concepts.length === contract.counts.concepts, `Expected ${contract.counts.concepts} concepts, got ${concepts.length}`);
fail(hooks.length === contract.counts.theory_hooks, `Expected ${contract.counts.theory_hooks} hooks, got ${hooks.length}`);

for (const domain of domains) {
  fail(domain.emne_ids.length >= contract.domain_contract.min_emner, `${domain.domain_id}: too few emner`);
  fail(domain.theory_hook_ids.length >= contract.domain_contract.min_theory_hooks, `${domain.domain_id}: too few hooks`);
  fail(domain.method_ids.length >= contract.domain_contract.min_methods, `${domain.domain_id}: too few methods`);
  domain.emne_ids.forEach((id) => fail(emneIds.has(id), `${domain.domain_id}: unknown emne ${id}`));
  domain.theory_hook_ids.forEach((id) => fail(hookIds.has(id), `${domain.domain_id}: unknown hook ${id}`));
  domain.theory_ids.forEach((id) => fail(theoryIds.has(id), `${domain.domain_id}: unknown theory ${id}`));
  domain.method_ids.forEach((id) => fail(canonicalMethodIds.has(id), `${domain.domain_id}: unknown method ${id}`));
}
for (const emne of emner) {
  fail(domainIds.has(emne.domain_id), `${emne.emne_id}: unknown domain`);
  emne.core_concept_ids.forEach((id) => fail(conceptIds.has(id), `${emne.emne_id}: unknown concept ${id}`));
  emne.method_ids.forEach((id) => fail(canonicalMethodIds.has(id), `${emne.emne_id}: unknown method ${id}`));
  [...emne.primary_theory_ids, ...emne.secondary_theory_ids].forEach((id) => fail(theoryIds.has(id), `${emne.emne_id}: unknown theory ${id}`));
  fail(emne.historiographical_conflicts.length > 0, `${emne.emne_id}: historiography missing`);
  fail(emne.progression.length === 4, `${emne.emne_id}: progression incomplete`);
  fail(emne.source_requirements.corroboration_required, `${emne.emne_id}: corroboration missing`);
}
const stopwords = new Set(["og", "eller", "i", "på", "av", "for", "med", "til"]);
for (const concept of concepts) {
  fail(!stopwords.has(concept.label.toLowerCase()), `${concept.concept_id}: stopword concept`);
  fail(concept.definition.length >= 20, `${concept.concept_id}: weak definition`);
}

if (errors.length) {
  console.error(`Historie V5 failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

if (process.argv.includes("--write")) {
  const targets = {
    [contract.canonical_files.domains]: domains,
    [contract.canonical_files.emner]: emner,
    [contract.canonical_files.concepts]: concepts,
    [contract.canonical_files.theories]: packageData.theory_objects,
    [contract.canonical_files.theory_hooks]: hooks,
    [contract.canonical_files.methods]: methods
  };
  for (const [file, value] of Object.entries(targets)) {
    fs.writeFileSync(path.join(historyDir, file), `${JSON.stringify(value, null, 2)}\n`);
  }
}

const observed = {
  domains: domains.length,
  emner: emner.length,
  concepts: concepts.length,
  theory_objects: packageData.theory_objects.length,
  theory_hooks: hooks.length,
  methods: methods.length
};
console.log("Historie V5 validation passed.");
console.log(JSON.stringify(observed, null, 2));
