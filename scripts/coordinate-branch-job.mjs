#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_11.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-11.test.js";
const COMPLETION_TEST_PATH = "tests/etne-akrafjorden-species-audit-complete.test.js";
const PREVIOUS_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-10.test.js";

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
  leptostracan: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Lite leptostrakt krepsdyr som svømmer nær bunnen og utnytter organisk materiale og små næringspartikler.",
    traits: ["liten leddelt kropp", "skjold over framkroppen", "lang bakkropp", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["lite bentisk krepsdyr", "partikkel- og åtselspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "sediment", "små bunndyr", "bunnfisk"],
    tips: ["Påvises i faglige bunnprøver; sikker bestemmelse krever mikroskopi."]
  },
  polychaete_tube: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Rørlevende flerbørstemark som bygger eller bor i sedimentrør og samler små næringspartikler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lever hovedsakelig skjult i rør", "børster og hodevedheng brukes i artsbestemmelsen", "mikroskopi er nødvendig"],
    roles: ["rørbyggende bunndyr", "sedimentstabilisator", "partikkelspiser"], interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom standardiserte bunnprøver; rør og dyr skal ikke samles tilfeldig."]
  },
  polychaete_tentacle: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Rør- eller sedimentlevende flerbørstemark som samler organiske partikler med tentakler ved bunnoverflaten.",
    traits: ["segmentert kropp", "næringstentakler eller gjeller ved framenden", "mesteparten av kroppen er skjult", "sikker bestemmelse krever mikroskopi"],
    roles: ["partikkelspiser", "sedimentbearbeider", "byttedyr"], interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom faglig bunnprøvetaking; dyret er ikke et vanlig synlig strandfunn."]
  },
  shell_less_mollusk: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Ormelignende, skalløst bløtdyr som lever nede i sedimentet og inngår i den småvokste bunnfaunaen.",
    traits: ["langstrakt ormelignende kropp", "mangler synlig skall", "små kalkspikler i kroppsveggen", "sikker artsbestemmelse krever spesialkarakterer og mikroskopi"],
    roles: ["sedimentlevende bløtdyr", "del av bløtbunnssamfunnet", "byttedyr"], interactions: ["sediment", "mikroorganismer", "små bunndyr", "bunnfisk"],
    tips: ["Arten er ikke synlig fra land og påvises gjennom faglig prøvetaking."]
  },
  shark: {
    habitat: ["fjord", "kystvann", "bunnnære vannmasser"], substrate: ["sand-, grus- og blandingsbunn"],
    strategy: "Liten hai som jakter fisk, krepsdyr og blekksprut nær bunnen, særlig i skumring og mørke.",
    traits: ["slank haikropp", "mange små mørke flekker", "to små ryggfinner langt bak", "katteaktige øyne"],
    roles: ["bunnnært rovdyr", "bruskfisk"], interactions: ["småfisk", "krepsdyr", "blekksprut"],
    tips: ["Påvises gjennom undervannskamera eller dokumentert fangst; levende hai skal håndteres skånsomt og settes tilbake når reglene krever det."]
  },
  redfish: {
    habitat: ["dypere fjord", "bratte undersjøiske skråninger", "stein- og blandingsbunn"], substrate: ["dyp hard- og blandingsbunn"],
    strategy: "Langlivet dypvannsfisk som jakter krepsdyr og fisk i kalde, dypere vannmasser.",
    traits: ["rød kropp", "store øyne", "kraftige pigger i ryggfinnen", "høyt og sammenpresset kroppsparti"],
    roles: ["dypvannsrovdyr", "langlivet fjordfisk"], interactions: ["krill", "krepsdyr", "småfisk"],
    tips: ["Arten observeres vanligvis gjennom fiske eller undervannsundersøkelser; følg gjeldende fangst- og minstemålsregler."]
  },
  sipunculan: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Sipunkulide som lever skjult i sedimentet og samler organisk materiale med en innvrengbar framkropp.",
    traits: ["usegmentert kropp", "innvrengbar framkropp", "lever skjult", "mikroskopiske kropps- og krokekarakterer brukes ved artsbestemmelse"],
    roles: ["sedimentlevende bunndyr", "partikkelspiser", "bioturbator"], interactions: ["organiske partikler", "sediment", "mikroorganismer"],
    tips: ["Påvises i bunnprøver; levende dyr skal ikke samles uten faglig formål."]
  },
  scale_worm: {
    habitat: ["fjordbunn", "stein-, skall- og bløtbunn"], substrate: ["marint bunnsubstrat"],
    strategy: "Skjellrygg som kryper mellom sediment og andre bunndyr og tar små næringsobjekter.",
    traits: ["flat segmentert kropp", "parvise ryggskjell", "tydelige sidebørster", "mikroskopiske ryggskjell- og børstekarakterer skiller artene"],
    roles: ["lite bentisk rovdyr eller åtseleter", "byttedyr"], interactions: ["små bunndyr", "organisk materiale", "sediment"],
    tips: ["Sikker artsbestemmelse krever bunnprøve og mikroskopi; dyret er skjørt."]
  },
  bivalve: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["finkornet marint sediment"],
    strategy: "Marin musling som lever helt eller delvis nedgravd og tar opp næring fra vannet eller sedimentoverflaten.",
    traits: ["to skallhalvdeler", "lever skjult i sedimentet", "skallform og hengsel brukes ved artsbestemmelse", "små arter krever lupe eller mikroskop"],
    roles: ["bløtbunnsorganisme", "del av det bentiske næringsnettet", "byttedyr"], interactions: ["organiske partikler", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Påvises gjennom faglig bunnprøvetaking; små skall skal bestemmes med lupe eller mikroskop."]
  },
  copepod: {
    habitat: ["fjordens frie vannmasser", "planktonlaget"], substrate: ["pelagisk"],
    strategy: "Hoppekreps som lever som dyreplankton og beiter på mikroplankton eller mindre partikler i vannmassene.",
    traits: ["liten leddelt kropp", "lange antenner", "rykkvis svømming", "sikker artsbestemmelse krever planktonprøve og mikroskopi"],
    roles: ["dyreplankton", "energioverføring i næringsnettet", "bytte for fiskelarver og planktonspisende fisk"], interactions: ["planteplankton", "mikroplankton", "fiskelarver", "stimfisk"],
    tips: ["Arten kan ikke observeres som enkeltindivid fra land; dokumentasjon krever planktonhåv og mikroskopi."]
  },
  gastropod: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Marin snegl som beveger seg i eller på sedimentet og utnytter små næringspartikler eller byttedyr.",
    traits: ["spiralsnodd skall", "bløtdyrfot", "lever ofte skjult i sedimentet", "skallkarakterer brukes ved artsbestemmelse"],
    roles: ["bentisk bløtdyr", "partikkel- eller smådyrspiser", "byttedyr"], interactions: ["sediment", "små bunndyr", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises i bunnprøver; små skall må bestemmes med lupe eller mikroskop."]
  }
};

const specs = [
  ["emne_fauna_sarsinebalia_typhlops", "Sarsinebalia typhlops", "Sarsinebalia typhlops", "leptostracan"],
  ["emne_fauna_scolelepis_korsuni", "Scolelepis korsuni", "Scolelepis korsuni", "polychaete_tube"],
  ["emne_fauna_scolelepis_tridentata", "Scolelepis tridentata", "Scolelepis tridentata", "polychaete_tube"],
  ["emne_fauna_scutopus_robustus", "Scutopus robustus", "Scutopus robustus", "shell_less_mollusk"],
  ["emne_fauna_smaaflekket_rodhai", "Småflekket rødhai", "Scyliorhinus canicula", "shark"],
  ["emne_fauna_vanlig_uer", "Vanlig uer", "Sebastes norvegicus", "redfish"],
  ["emne_fauna_sipunculus_norvegicus", "Sipunculus norvegicus", "Sipunculus norvegicus", "sipunculan"],
  ["emne_fauna_sthenelais_jeffreysii", "Sthenelais jeffreysii", "Sthenelais jeffreysii", "scale_worm"],
  ["emne_fauna_terebellides_atlantis", "Terebellides atlantis", "Terebellides atlantis", "polychaete_tentacle"],
  ["emne_fauna_terebellides_gracilis", "Terebellides gracilis", "Terebellides gracilis", "polychaete_tentacle"],
  ["emne_fauna_thyasira_flexuosa", "Thyasira flexuosa", "Thyasira flexuosa", "bivalve"],
  ["emne_fauna_trichobranchus_roseus", "Trichobranchus roseus", "Trichobranchus roseus", "polychaete_tentacle"],
  ["emne_fauna_triconia_conifera", "Triconia conifera", "Triconia conifera", "copepod"],
  ["emne_fauna_troschelia_berniciensis", "Troschelia berniciensis", "Troschelia berniciensis", "gastropod"]
].map(([id, title, latin, profile]) => ({ id, title, latin, profile }));

const finalEdgeTaxa = [
  "Sagina procumbens",
  "Schistidium maritimum",
  "Sedum anglicum",
  "Sticta fuliginosa",
  "Thelopsis rubella",
  "Thelotrema lepadinum",
  "Triglochin maritima",
  "Ulota crispa",
  "Vicia sepium",
  "Zygodon rupestris"
];

const audit = await readJson(AUDIT_PATH);
assert.equal(audit.placeId, "akrafjorden");
assert.equal(audit.source.waterBodyCode, "NO0260020600-C");
assert.equal(audit.summary.unmatchedLikelySpeciesCount, 250);
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
    taxonomy: { norsk_navn: source.norwegianName || (spec.title !== spec.latin ? spec.title : null), latin_navn: spec.latin, klasse: source.class || "Uavklart klasse", orden: source.order || "Uavklart orden", familie: source.family || "Uavklart familie", artskart_taxon_id: Number(source.taxonId) },
    habitat: { biotop: profile.habitat, jord: profile.substrate, lys: ["varierer med dybde og vannklarhet"], fukt: ["saltvann og fjordmiljø"] },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: { typiske_steder: ["Åkrafjorden", spec.profile === "copepod" ? "marine planktonprøver" : "fjordens marine bunnmiljø"], oslo_observert_typisk: "Artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden." },
    observasjonstips: profile.tips,
    source_urls: [`https://artsdatabanken.no/arter/takson/${source.taxonId}`, "https://artskart.artsdatabanken.no/", "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"],
    evidence: { place_id: "akrafjorden", waterbody_code: audit.source.waterBodyCode, species_audit: AUDIT_PATH, observation_count: source.count, earliest_year: source.earliestYear, latest_year: source.latestYear, precision_min_m: source.minPrecisionM, precision_max_m: source.maxPrecisionM }
  };
});
assert.equal(cards.length, 14);
assert.equal(new Set(cards.map(card => card.id)).size, 14);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_11.json")) manifest.files.push("marine_akrafjorden_batch_11.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 10);
assert.equal(place.published_species_count, 211);
assert.equal(place.remaining_species_level_taxa_count, 50);
assert.equal(place.excluded_species_level_edge_taxa.length, 26);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.excluded_species_level_edge_taxa = [...new Set([...place.excluded_species_level_edge_taxa, ...finalEdgeTaxa])];
assert.equal(place.excluded_species_level_edge_taxa.length, 36);
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Artsnivårevisjonen er fullført: 214 nye marine eller fjordtilknyttede kort er produsert, elleve eksisterende fjordkort er koblet, og 36 land-, strandkant-, mose-, lav-, sopp-, insekt- eller landfugltaksoner er klassifisert separat. Ingen publiserbare artstaksoner står ubehandlet. De 99 øvrige unmatched treffene er høyere taxa, slekter eller familier og publiseres ikke som arter.";
place.published_species_batch = 11;
place.published_species_count = 225;
place.published_new_species_card_count = 214;
place.linked_existing_species_card_count = 11;
place.reviewed_species_level_taxa_count = 250;
place.remaining_species_level_taxa_count = 36;
place.remaining_publishable_species_level_taxa_count = 0;
place.unreviewed_species_level_taxa_count = 0;
place.excluded_species_level_edge_taxa_count = 36;
place.unmatched_taxa_count = 0;
place.species_level_audit_complete = true;
place.higher_taxa_review_complete = true;
map.meta.version = "1.0.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let previousTest = await fs.readFile(path.join(ROOT, PREVIOUS_TEST_PATH), "utf8");
previousTest = previousTest
  .replace('assert.equal(place.published_species_batch, 10);', 'assert.ok(place.published_species_batch >= 10);')
  .replace('assert.equal(place.fauna.length, 211);', 'assert.ok(place.fauna.length >= 211);')
  .replace('assert.equal(place.published_species_count, 211);', 'assert.ok(place.published_species_count >= 211);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 50);', 'assert.ok(place.remaining_species_level_taxa_count <= 50);');
for (const expected of ['assert.ok(place.published_species_batch >= 10);','assert.ok(place.fauna.length >= 211);','assert.ok(place.published_species_count >= 211);','assert.ok(place.remaining_species_level_taxa_count <= 50);']) assert.ok(previousTest.includes(expected));
await writeText(PREVIOUS_TEST_PATH, previousTest);

const batchTest = `#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const cards = JSON.parse(fs.readFileSync("${OUT_PATH}", "utf8"));
const manifest = JSON.parse(fs.readFileSync("${MANIFEST_PATH}", "utf8"));
const map = JSON.parse(fs.readFileSync("${MAP_PATH}", "utf8"));
const audit = JSON.parse(fs.readFileSync("${AUDIT_PATH}", "utf8"));
assert.equal(cards.length, 14);
assert.equal(new Set(cards.map(card => card.id)).size, 14);
assert.ok(cards.every(card => Number.isInteger(card.taxonomy.artskart_taxon_id)));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_11.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 11);
assert.equal(place.fauna.length, 225);
assert.equal(place.published_species_count, 225);
assert.equal(place.published_new_species_card_count, 214);
assert.equal(place.linked_existing_species_card_count, 11);
assert.equal(place.remaining_publishable_species_level_taxa_count, 0);
assert.equal(place.unreviewed_species_level_taxa_count, 0);
assert.equal(place.excluded_species_level_edge_taxa_count, 36);
assert.equal(place.unmatched_taxa_count, 0);
assert.equal(place.species_level_audit_complete, true);
assert.equal(new Set(place.fauna).size, place.fauna.length);
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 11 OK");
`;
await writeText(TEST_PATH, batchTest);

const completionTest = `#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const map = JSON.parse(fs.readFileSync("${MAP_PATH}", "utf8"));
const audit = JSON.parse(fs.readFileSync("${AUDIT_PATH}", "utf8"));
const place = map.places.akrafjorden;
let newCardCount = 0;
for (let batch = 1; batch <= 11; batch += 1) {
  const cards = JSON.parse(fs.readFileSync(`data/natur/fauna/marine_akrafjorden_batch_\${batch}.json`, "utf8"));
  newCardCount += cards.length;
}
assert.equal(newCardCount, 214);
assert.equal(audit.summary.unmatchedLikelySpeciesCount, 250);
assert.equal(newCardCount + place.excluded_species_level_edge_taxa_count, 250);
assert.equal(place.fauna.length, place.linked_existing_species_card_count + newCardCount);
assert.equal(place.fauna.length, 225);
assert.equal(place.excluded_species_level_edge_taxa.length, 36);
assert.equal(new Set(place.excluded_species_level_edge_taxa).size, 36);
assert.equal(place.reviewed_species_level_taxa_count, 250);
assert.equal(place.unreviewed_species_level_taxa_count, 0);
assert.equal(place.remaining_publishable_species_level_taxa_count, 0);
assert.equal(place.excluded_higher_taxa_count, audit.summary.unmatchedNeedsRankReviewCount);
assert.equal(place.species_level_audit_complete, true);
assert.equal(place.higher_taxa_review_complete, true);
console.log("Etne Åkrafjorden species-level audit complete");
`;
await writeText(COMPLETION_TEST_PATH, completionTest);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
run("node", [COMPLETION_TEST_PATH]);
for (let batch = 10; batch >= 1; batch -= 1) run("node", [`tests/etne-akrafjorden-marine-species-batch-${batch}.test.js`]);
for (const testFile of ["etne-jettegrytene-nature-rounds.test.js","etne-langfoss-nature-rounds.test.js","etne-skano-nature-rounds.test.js","etne-brattholmen-nature-rounds.test.js","etne-saevareidberget-nature-rounds.test.js","etne-langebudalen-nature-rounds.test.js","etne-fish-species-rounds.test.js","etne-nature-round-content.test.js"]) run("node", [`tests/${testFile}`]);
console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i sluttbatchen`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden artsnivårevisjon fullført og validert");
