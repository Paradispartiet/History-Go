#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_5.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-5.test.js";
const BATCH4_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-4.test.js";

const readJson = async rel => JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
const writeJson = async (rel, value) => {
  await fs.mkdir(path.dirname(path.join(ROOT, rel)), { recursive: true });
  await fs.writeFile(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const writeText = async (rel, value) => {
  await fs.mkdir(path.dirname(path.join(ROOT, rel)), { recursive: true });
  await fs.writeFile(path.join(ROOT, rel), value.endsWith("\n") ? value : `${value}\n`, "utf8");
};
function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with ${result.status}`);
}

const profiles = {
  polychaete_mobile: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"], substrate: ["marint sediment"],
    strategy: "Marin flerbørstemark som beveger seg i eller på sedimentet og utnytter små næringsobjekter eller organisk materiale.",
    traits: ["segmentert kropp", "børster på kroppsleddene", "hode- og børstekarakterer skiller artene", "sikker bestemmelse krever mikroskopi"],
    roles: ["sedimentlevende bunndyr", "bioturbator", "byttedyr for fisk"], interactions: ["sediment", "organiske partikler", "små bunndyr", "bunnfisk"],
    tips: ["Dokumentasjonen kommer fra faglige bunnprøver; vanlig foto er ikke nok til sikker artsbestemmelse."]
  },
  polychaete_tube: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Rørlevende flerbørstemark som bygger eller bor i sedimentrør og samler små næringspartikler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lever hovedsakelig skjult i rør", "børster og hodevedheng brukes i artsbestemmelsen", "mikroskopi er nødvendig"],
    roles: ["rørbyggende bunndyr", "sedimentstabilisator", "partikkelspiser"], interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom standardiserte bunnprøver; rør og dyr skal ikke samles tilfeldig."]
  },
  polychaete_predator: {
    habitat: ["fjordens sedimentbunn", "mudder-, sand- og blandingsbunn"], substrate: ["marint sediment"],
    strategy: "Bevegelig flerbørstemark som søker smådyr i sedimentet og deltar i det bentiske rovdyrsamfunnet.",
    traits: ["segmentert kropp", "tydelige børster", "bevegelig hodeparti", "kjeve- og børstekarakterer krever mikroskopi"],
    roles: ["lite bentisk rovdyr", "sedimentlevende bunndyr", "byttedyr for fisk"], interactions: ["små børstemarker", "krepsdyr", "sediment", "bunnfisk"],
    tips: ["Sikker identifikasjon krever bunnprøve og mikroskopi."]
  },
  polychaete_detritivore: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["organisk rikt marint sediment"],
    strategy: "Sedimentlevende flerbørstemark som graver i bunnen og utnytter organisk materiale mellom sedimentpartiklene.",
    traits: ["segmentert kropp", "børster på kroppsleddene", "lever hovedsakelig nedgravd", "sikker artsbestemmelse krever mikroskopiske karakterer"],
    roles: ["sedimenteter", "bioturbator", "byttedyr for fisk"], interactions: ["organisk materiale", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Arten påvises gjennom faglig bunnprøvetaking og kan ikke bestemmes sikkert fra land."]
  },
  scaphopod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandbunn"], substrate: ["marint sediment"],
    strategy: "Sjøtann som lever nedgravd med begge ender av det rørformede skallet i kontakt med sediment og vann.",
    traits: ["langt svakt buet rørskall", "åpent i begge ender", "lever nedgravd", "skallform og overflate brukes ved artsbestemmelse"],
    roles: ["sedimentlevende bløtdyr", "smådyrspiser", "del av bløtbunnssamfunnet"], interactions: ["foraminiferer", "mikroorganismer", "sediment"],
    tips: ["Påvises vanligvis som levende dyr eller skall i bunnprøver; ikke samle uten faglig formål."]
  },
  shell_less_mollusk: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Ormelignende, skalløst bløtdyr som lever nede i sedimentet og inngår i den småvokste bunnfaunaen.",
    traits: ["langstrakt ormelignende kropp", "mangler synlig skall", "små kalkspikler i kroppsveggen", "sikker artsbestemmelse krever spesialkarakterer og mikroskopi"],
    roles: ["sedimentlevende bløtdyr", "del av bløtbunnssamfunnet", "byttedyr"], interactions: ["sediment", "mikroorganismer", "små bunndyr", "bunnfisk"],
    tips: ["Arten er ikke synlig fra land og påvises gjennom faglig prøvetaking."]
  },
  cumacean: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Lite cumacekrepsdyr som lever nær eller delvis nede i sedimentet og utnytter små organiske partikler.",
    traits: ["lite krepsdyr", "forstørret framkropp og smal bakkropp", "mange små lemmer", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["lite bentisk krepsdyr", "partikkelspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Arten påvises i bunnprøver og kan ikke bestemmes sikkert med det blotte øye."]
  },
  heart_urchin: {
    habitat: ["fjordens bløtbunn", "sand- og mudderbunn"], substrate: ["marint sediment"],
    strategy: "Uregelmessig sjøpiggsvin som graver gjennom sedimentet og utnytter organisk materiale.",
    traits: ["hjerteformet til oval kropp", "korte bevegelige pigger", "bladformede ambulakralfelt", "lever hovedsakelig nedgravd"],
    roles: ["bioturbator", "sedimenteter", "del av bløtbunnssamfunnet"], interactions: ["organisk materiale", "sediment", "mikroorganismer"],
    tips: ["Påvises i bunnprøver; levende sjømus skal håndteres forsiktig og legges tilbake ved faglig prøvetaking."]
  },
  gastropod: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Liten marin snegl som beveger seg i eller på sedimentet og utnytter små næringspartikler eller byttedyr.",
    traits: ["lite skall", "bløtdyrfot", "lever skjult i sedimentet", "sikker artsbestemmelse krever skallkarakterer og ofte mikroskopi"],
    roles: ["lite bentisk bløtdyr", "partikkel- eller smådyrspiser", "byttedyr"], interactions: ["sediment", "mikroorganismer", "små bunndyr", "bunnfisk"],
    tips: ["Påvises i bunnprøver; små skall må bestemmes med lupe eller mikroskop."]
  },
  sipunculan: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Sipunkulide som lever skjult i sediment eller tomme skall og samler organisk materiale med en innvrengbar framkropp.",
    traits: ["usegmentert kropp", "innvrengbar framkropp", "lever skjult", "mikroskopiske kropps- og krokekarakterer brukes ved artsbestemmelse"],
    roles: ["sedimentlevende bunndyr", "partikkelspiser", "bioturbator"], interactions: ["organiske partikler", "sediment", "mikroorganismer"],
    tips: ["Påvises i bunnprøver; levende dyr skal ikke samles uten faglig formål."]
  }
};

const specs = [
  ["emne_fauna_antalis_entalis", "Antalis entalis", "Antalis entalis", "scaphopod"],
  ["emne_fauna_apistobranchus_tullbergi", "Apistobranchus tullbergi", "Apistobranchus tullbergi", "polychaete_mobile"],
  ["emne_fauna_chaetoderma_nitidulum", "Chaetoderma nitidulum", "Chaetoderma nitidulum", "shell_less_mollusk"],
  ["emne_fauna_chaetozone_setosa", "Chaetozone setosa", "Chaetozone setosa", "polychaete_detritivore"],
  ["emne_fauna_dasybranchus_caducus", "Dasybranchus caducus", "Dasybranchus caducus", "polychaete_detritivore"],
  ["emne_fauna_diastylis_cornuta", "Diastylis cornuta", "Diastylis cornuta", "cumacean"],
  ["emne_fauna_graagronnsjohmus", "Grågrønnsjømus", "Echinocardium flavescens", "heart_urchin"],
  ["emne_fauna_kolleorm", "Kølleorm", "Glycera alba", "polychaete_predator"],
  ["emne_fauna_haliella_stenostoma", "Haliella stenostoma", "Haliella stenostoma", "gastropod"],
  ["emne_fauna_mediomastus_fragilis", "Mediomastus fragilis", "Mediomastus fragilis", "polychaete_detritivore"],
  ["emne_fauna_microclymene_tricirrata", "Microclymene tricirrata", "Microclymene tricirrata", "polychaete_tube"],
  ["emne_fauna_oxydromus_flexuosus", "Oxydromus flexuosus", "Oxydromus flexuosus", "polychaete_predator"],
  ["emne_fauna_paradiopatra_fiordica", "Paradiopatra fiordica", "Paradiopatra fiordica", "polychaete_tube"],
  ["emne_fauna_phascolion_strombus", "Phascolion strombus", "Phascolion strombus", "sipunculan"],
  ["emne_fauna_phylo_norvegica", "Phylo norvegica", "Phylo norvegica", "polychaete_mobile"],
  ["emne_fauna_pilargis_papillata", "Pilargis papillata", "Pilargis papillata", "polychaete_predator"],
  ["emne_fauna_prionospio_dubia", "Prionospio dubia", "Prionospio dubia", "polychaete_tube"],
  ["emne_fauna_retusa_umbilicata", "Retusa umbilicata", "Retusa umbilicata", "gastropod"],
  ["emne_fauna_sosane_wireni", "Sosane wireni", "Sosane wireni", "polychaete_tube"],
  ["emne_fauna_spiochaetopterus_typicus", "Spiochaetopterus typicus", "Spiochaetopterus typicus", "polychaete_tube"]
].map(([id, title, latin, profile]) => ({ id, title, latin, profile }));

const audit = await readJson(AUDIT_PATH);
assert.equal(audit.placeId, "akrafjorden");
assert.equal(audit.source.waterBodyCode, "NO0260020600-C");
const unmatchedByLatin = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));

const cards = specs.map(spec => {
  const source = unmatchedByLatin.get(spec.latin);
  assert.ok(source, `Mangler ${spec.latin} i Åkrafjorden-auditen`);
  assert.equal(source.rankAssessment?.likelySpecies, true, `${spec.latin} er ikke artsnivå`);
  assert.ok(source.taxonId, `Mangler takson-ID for ${spec.latin}`);
  const profile = profiles[spec.profile];
  assert.ok(profile, `Mangler profil ${spec.profile}`);
  return {
    id: spec.id, title: spec.title, latin: spec.latin,
    taxonomy: {
      norsk_navn: source.norwegianName || (spec.title !== spec.latin ? spec.title : null), latin_navn: spec.latin,
      klasse: source.class || "Uavklart klasse", orden: source.order || "Uavklart orden", familie: source.family || "Uavklart familie",
      artskart_taxon_id: Number(source.taxonId)
    },
    habitat: { biotop: profile.habitat, jord: profile.substrate, lys: ["svakt lys til mørke, avhengig av dybde"], fukt: ["saltvann"] },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: { typiske_steder: ["Åkrafjorden", "marine bløtbunnsprøver"], oslo_observert_typisk: "Marint artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden." },
    observasjonstips: profile.tips,
    source_urls: [`https://artsdatabanken.no/arter/takson/${source.taxonId}`, "https://artskart.artsdatabanken.no/", "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"],
    evidence: { place_id: "akrafjorden", waterbody_code: audit.source.waterBodyCode, species_audit: AUDIT_PATH, observation_count: source.count, earliest_year: source.earliestYear, latest_year: source.latestYear, precision_min_m: source.minPrecisionM, precision_max_m: source.maxPrecisionM }
  };
});

assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_5.json")) manifest.files.push("marine_akrafjorden_batch_5.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 4);
assert.equal(place.published_species_count, 91);
assert.equal(place.remaining_species_level_taxa_count, 170);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Fem kortbatcher omfatter nå elleve eksisterende fjordfugler og hundre marine arter, inkludert fisk, sjøpattedyr, plankton og små bløtbunnsdyr. Høyere taxa, samlegrupper og terrestriske kanttreff publiseres ikke som fjordarter.";
place.published_species_batch = 5;
place.published_species_count = 111;
place.remaining_species_level_taxa_count = 150;
place.unmatched_taxa_count = 150;
map.meta.version = "0.15.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let previousTest = await fs.readFile(path.join(ROOT, BATCH4_TEST_PATH), "utf8");
previousTest = previousTest
  .replace('assert.equal(place.published_species_batch, 4);', 'assert.ok(place.published_species_batch >= 4);')
  .replace('assert.equal(place.fauna.length, 91);', 'assert.ok(place.fauna.length >= 91);')
  .replace('assert.equal(place.published_species_count, 91);', 'assert.ok(place.published_species_count >= 91);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 170);', 'assert.ok(place.remaining_species_level_taxa_count <= 170);');
for (const expected of ['assert.ok(place.published_species_batch >= 4);','assert.ok(place.fauna.length >= 91);','assert.ok(place.published_species_count >= 91);','assert.ok(place.remaining_species_level_taxa_count <= 170);']) assert.ok(previousTest.includes(expected));
await writeText(BATCH4_TEST_PATH, previousTest);

const test = `#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const cards = JSON.parse(fs.readFileSync("${OUT_PATH}", "utf8"));
const manifest = JSON.parse(fs.readFileSync("${MANIFEST_PATH}", "utf8"));
const map = JSON.parse(fs.readFileSync("${MAP_PATH}", "utf8"));
const audit = JSON.parse(fs.readFileSync("${AUDIT_PATH}", "utf8"));
assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
assert.ok(cards.every(card => Number.isInteger(card.taxonomy.artskart_taxon_id)));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_5.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 5);
assert.equal(place.fauna.length, 111);
assert.equal(place.published_species_count, 111);
assert.equal(place.remaining_species_level_taxa_count, 150);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 5 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
for (const batch of [4,3,2,1]) run("node", [`tests/etne-akrafjorden-marine-species-batch-${batch}.test.js`]);
for (const testFile of ["etne-jettegrytene-nature-rounds.test.js","etne-langfoss-nature-rounds.test.js","etne-skano-nature-rounds.test.js","etne-brattholmen-nature-rounds.test.js","etne-saevareidberget-nature-rounds.test.js","etne-langebudalen-nature-rounds.test.js","etne-fish-species-rounds.test.js","etne-nature-round-content.test.js"]) run("node", [`tests/${testFile}`]);
console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 5`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 5 full validation OK");
