#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT = "data/natur/fauna/marine_akrafjorden_batch_11.json";
const MANIFEST = "data/natur/fauna/manifest.json";
const MAP = "data/natur/nature_etne_place_map.json";
const BATCH_TEST = "tests/etne-akrafjorden-marine-species-batch-11.test.js";
const COMPLETE_TEST = "tests/etne-akrafjorden-species-audit-complete.test.js";
const PREVIOUS_TEST = "tests/etne-akrafjorden-marine-species-batch-10.test.js";

const readJson = async file => JSON.parse(await fs.readFile(path.join(ROOT, file), "utf8"));
const writeJson = async (file, value) => {
  await fs.mkdir(path.dirname(path.join(ROOT, file)), { recursive: true });
  await fs.writeFile(path.join(ROOT, file), JSON.stringify(value, null, 2) + "\n", "utf8");
};
const writeText = async (file, value) => {
  await fs.mkdir(path.dirname(path.join(ROOT, file)), { recursive: true });
  await fs.writeFile(path.join(ROOT, file), value.endsWith("\n") ? value : value + "\n", "utf8");
};
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) throw new Error(command + " " + args.join(" ") + " failed with " + result.status);
};

const profiles = {
  leptostracan: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    strategy: "Lite krepsdyr som svømmer nær bunnen og utnytter organisk materiale og små næringspartikler.",
    traits: ["skjold over framkroppen", "lang leddelt bakkropp", "mange små lemmer", "mikroskopi kreves for sikker bestemmelse"],
    roles: ["bentisk krepsdyr", "partikkel- og åtselspiser", "byttedyr for fisk"]
  },
  tube_worm: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    strategy: "Rørlevende flerbørstemark som samler næringspartikler ved sedimentoverflaten.",
    traits: ["segmentert kropp", "lever hovedsakelig skjult i rør", "børster og hodevedheng skiller artene", "mikroskopi kreves"],
    roles: ["rørbygger", "partikkelspiser", "sedimentstabilisator"]
  },
  tentacle_worm: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    strategy: "Flerbørstemark som samler organiske partikler med tentakler eller gjellestrukturer ved bunnoverflaten.",
    traits: ["segmentert kropp", "tentakler eller gjeller ved framenden", "mesteparten av kroppen er skjult", "mikroskopi kreves"],
    roles: ["partikkelspiser", "sedimentbearbeider", "byttedyr"]
  },
  shell_less_mollusk: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    strategy: "Ormelignende, skalløst bløtdyr som lever nede i sedimentet.",
    traits: ["langstrakt kropp", "mangler synlig skall", "kalkspikler i kroppsveggen", "spesialkarakterer kreves for bestemmelse"],
    roles: ["sedimentlevende bløtdyr", "del av bløtbunnssamfunnet", "byttedyr"]
  },
  shark: {
    habitat: ["fjord", "kystvann", "bunnnære vannmasser"],
    strategy: "Liten hai som jakter fisk, krepsdyr og blekksprut nær bunnen.",
    traits: ["slank haikropp", "mange små mørke flekker", "to små ryggfinner langt bak", "katteaktige øyne"],
    roles: ["bunnnært rovdyr", "bruskfisk"]
  },
  redfish: {
    habitat: ["dypere fjord", "bratte undersjøiske skråninger"],
    strategy: "Langlivet dypvannsfisk som jakter krepsdyr og fisk i kalde, dypere vannmasser.",
    traits: ["rød kropp", "store øyne", "kraftige ryggpigger", "høy sammenpresset kropp"],
    roles: ["dypvannsrovdyr", "langlivet fjordfisk"]
  },
  sipunculan: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    strategy: "Usegmentert bunndyr som samler organisk materiale med en innvrengbar framkropp.",
    traits: ["usegmentert kropp", "innvrengbar framkropp", "lever skjult i sediment", "mikroskopiske kroker brukes ved bestemmelse"],
    roles: ["partikkelspiser", "bioturbator", "sedimentlevende bunndyr"]
  },
  scale_worm: {
    habitat: ["fjordbunn", "stein-, skall- og bløtbunn"],
    strategy: "Skjellrygg som kryper mellom sediment og andre bunndyr og tar små næringsobjekter.",
    traits: ["flat segmentert kropp", "parvise ryggskjell", "tydelige sidebørster", "mikroskopiske karakterer skiller artene"],
    roles: ["lite bentisk rovdyr eller åtseleter", "byttedyr"]
  },
  bivalve: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    strategy: "Marin musling som lever nedgravd og tar opp næring fra vann eller sedimentoverflate.",
    traits: ["to skallhalvdeler", "lever skjult i sediment", "skallform og hengsel brukes ved bestemmelse", "små arter krever lupe"],
    roles: ["bløtbunnsorganisme", "del av bentisk næringsnett", "byttedyr"]
  },
  copepod: {
    habitat: ["fjordens frie vannmasser", "planktonlaget"],
    strategy: "Hoppekreps som lever som dyreplankton og beiter på mikroplankton.",
    traits: ["liten leddelt kropp", "lange antenner", "rykkvis svømming", "planktonprøve og mikroskopi kreves"],
    roles: ["dyreplankton", "energioverføring", "bytte for fiskelarver"]
  },
  gastropod: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    strategy: "Marin snegl som beveger seg i eller på sedimentet og tar små næringspartikler eller byttedyr.",
    traits: ["spiralsnodd skall", "bløtdyrfot", "lever ofte skjult", "skallkarakterer brukes ved bestemmelse"],
    roles: ["bentisk bløtdyr", "smådyr- eller partikkelspiser", "byttedyr"]
  }
};

const specs = [
  ["emne_fauna_sarsinebalia_typhlops", "Sarsinebalia typhlops", "Sarsinebalia typhlops", "leptostracan"],
  ["emne_fauna_scolelepis_korsuni", "Scolelepis korsuni", "Scolelepis korsuni", "tube_worm"],
  ["emne_fauna_scolelepis_tridentata", "Scolelepis tridentata", "Scolelepis tridentata", "tube_worm"],
  ["emne_fauna_scutopus_robustus", "Scutopus robustus", "Scutopus robustus", "shell_less_mollusk"],
  ["emne_fauna_smaaflekket_rodhai", "Småflekket rødhai", "Scyliorhinus canicula", "shark"],
  ["emne_fauna_vanlig_uer", "Vanlig uer", "Sebastes norvegicus", "redfish"],
  ["emne_fauna_sipunculus_norvegicus", "Sipunculus norvegicus", "Sipunculus norvegicus", "sipunculan"],
  ["emne_fauna_sthenelais_jeffreysii", "Sthenelais jeffreysii", "Sthenelais jeffreysii", "scale_worm"],
  ["emne_fauna_terebellides_atlantis", "Terebellides atlantis", "Terebellides atlantis", "tentacle_worm"],
  ["emne_fauna_terebellides_gracilis", "Terebellides gracilis", "Terebellides gracilis", "tentacle_worm"],
  ["emne_fauna_thyasira_flexuosa", "Thyasira flexuosa", "Thyasira flexuosa", "bivalve"],
  ["emne_fauna_trichobranchus_roseus", "Trichobranchus roseus", "Trichobranchus roseus", "tentacle_worm"],
  ["emne_fauna_triconia_conifera", "Triconia conifera", "Triconia conifera", "copepod"],
  ["emne_fauna_troschelia_berniciensis", "Troschelia berniciensis", "Troschelia berniciensis", "gastropod"]
].map(([id, title, latin, profile]) => ({ id, title, latin, profile }));

const finalEdgeTaxa = [
  "Sagina procumbens", "Schistidium maritimum", "Sedum anglicum", "Sticta fuliginosa",
  "Thelopsis rubella", "Thelotrema lepadinum", "Triglochin maritima", "Ulota crispa",
  "Vicia sepium", "Zygodon rupestris"
];

const audit = await readJson(AUDIT);
assert.equal(audit.placeId, "akrafjorden");
assert.equal(audit.source.waterBodyCode, "NO0260020600-C");
assert.equal(audit.summary.unmatchedLikelySpeciesCount, 250);
const byLatin = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));

const cards = specs.map(spec => {
  const source = byLatin.get(spec.latin);
  assert.ok(source, "Mangler " + spec.latin + " i auditen");
  assert.equal(source.rankAssessment?.likelySpecies, true);
  assert.ok(source.taxonId);
  const profile = profiles[spec.profile];
  return {
    id: spec.id,
    title: spec.title,
    latin: spec.latin,
    taxonomy: {
      norsk_navn: source.norwegianName || (spec.title !== spec.latin ? spec.title : null),
      latin_navn: spec.latin,
      klasse: source.class || "Uavklart klasse",
      orden: source.order || "Uavklart orden",
      familie: source.family || "Uavklart familie",
      artskart_taxon_id: Number(source.taxonId)
    },
    habitat: {
      biotop: profile.habitat,
      jord: ["marint bunnsubstrat eller frie vannmasser"],
      lys: ["varierer med dybde og vannklarhet"],
      fukt: ["saltvann og fjordmiljø"]
    },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: ["fjordens næringsnett", "sediment eller plankton", "fisk og andre marine dyr"] },
    bykontekst: {
      typiske_steder: ["Åkrafjorden", spec.profile === "copepod" ? "marine planktonprøver" : "fjordens marine bunnmiljø"],
      oslo_observert_typisk: "Artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden."
    },
    observasjonstips: [spec.profile === "copepod" ? "Påvises med planktonhåv og mikroskopi." : "Påvises gjennom faglig prøvetaking, undervannskamera eller dokumentert fangst; unngå unødvendig håndtering."],
    source_urls: [
      "https://artsdatabanken.no/arter/takson/" + source.taxonId,
      "https://artskart.artsdatabanken.no/",
      "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"
    ],
    evidence: {
      place_id: "akrafjorden",
      waterbody_code: audit.source.waterBodyCode,
      species_audit: AUDIT,
      observation_count: source.count,
      earliest_year: source.earliestYear,
      latest_year: source.latestYear,
      precision_min_m: source.minPrecisionM,
      precision_max_m: source.maxPrecisionM
    }
  };
});
assert.equal(cards.length, 14);
assert.equal(new Set(cards.map(card => card.id)).size, 14);
await writeJson(OUT, cards);

const manifest = await readJson(MANIFEST);
if (!manifest.files.includes("marine_akrafjorden_batch_11.json")) manifest.files.push("marine_akrafjorden_batch_11.json");
await writeJson(MANIFEST, manifest);

const map = await readJson(MAP);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 10);
assert.equal(place.published_species_count, 211);
assert.equal(place.remaining_species_level_taxa_count, 50);
assert.equal(place.excluded_species_level_edge_taxa.length, 26);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.excluded_species_level_edge_taxa = [...new Set([...place.excluded_species_level_edge_taxa, ...finalEdgeTaxa])];
assert.equal(place.excluded_species_level_edge_taxa.length, 36);
Object.assign(place, {
  documentation: "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artsnivårevisjonen er fullført: 214 nye marine eller fjordtilknyttede kort er produsert, elleve eksisterende fjordkort er koblet, og 36 land- og strandkanttaksoner er klassifisert separat. Ingen publiserbare artstaksoner står ubehandlet. De 99 øvrige unmatched treffene er høyere taxa, slekter eller familier og publiseres ikke som arter.",
  published_species_batch: 11,
  published_species_count: 225,
  published_new_species_card_count: 214,
  linked_existing_species_card_count: 11,
  reviewed_species_level_taxa_count: 250,
  remaining_species_level_taxa_count: 36,
  remaining_publishable_species_level_taxa_count: 0,
  unreviewed_species_level_taxa_count: 0,
  excluded_species_level_edge_taxa_count: 36,
  unmatched_taxa_count: 0,
  species_level_audit_complete: true,
  higher_taxa_review_complete: true
});
map.meta.version = "1.0.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP, map);

let previous = await fs.readFile(path.join(ROOT, PREVIOUS_TEST), "utf8");
previous = previous
  .replace('assert.equal(place.published_species_batch, 10);', 'assert.ok(place.published_species_batch >= 10);')
  .replace('assert.equal(place.fauna.length, 211);', 'assert.ok(place.fauna.length >= 211);')
  .replace('assert.equal(place.published_species_count, 211);', 'assert.ok(place.published_species_count >= 211);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 50);', 'assert.ok(place.remaining_species_level_taxa_count <= 50);');
for (const expected of [
  'assert.ok(place.published_species_batch >= 10);',
  'assert.ok(place.fauna.length >= 211);',
  'assert.ok(place.published_species_count >= 211);',
  'assert.ok(place.remaining_species_level_taxa_count <= 50);'
]) assert.ok(previous.includes(expected));
await writeText(PREVIOUS_TEST, previous);

await writeText(BATCH_TEST, `#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const cards = JSON.parse(fs.readFileSync("${OUT}", "utf8"));
const manifest = JSON.parse(fs.readFileSync("${MANIFEST}", "utf8"));
const map = JSON.parse(fs.readFileSync("${MAP}", "utf8"));
const audit = JSON.parse(fs.readFileSync("${AUDIT}", "utf8"));
const place = map.places.akrafjorden;
assert.equal(cards.length, 14);
assert.equal(new Set(cards.map(card => card.id)).size, 14);
assert.ok(cards.every(card => Number.isInteger(card.taxonomy.artskart_taxon_id)));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_11.json"));
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
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) {
  assert.ok(place.fauna.includes(card.id), card.id);
  const source = audited.get(card.latin);
  assert.ok(source, card.latin);
  assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId));
}
console.log("Etne Åkrafjorden marine species batch 11 OK");
`);

await writeText(COMPLETE_TEST, `#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const map = JSON.parse(fs.readFileSync("${MAP}", "utf8"));
const audit = JSON.parse(fs.readFileSync("${AUDIT}", "utf8"));
const place = map.places.akrafjorden;
let newCardCount = 0;
for (let batch = 1; batch <= 11; batch += 1) {
  const file = "data/natur/fauna/marine_akrafjorden_batch_" + batch + ".json";
  newCardCount += JSON.parse(fs.readFileSync(file, "utf8")).length;
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
`);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [BATCH_TEST]);
run("node", [COMPLETE_TEST]);
for (let batch = 10; batch >= 1; batch -= 1) run("node", ["tests/etne-akrafjorden-marine-species-batch-" + batch + ".test.js"]);
for (const name of [
  "etne-jettegrytene-nature-rounds.test.js", "etne-langfoss-nature-rounds.test.js",
  "etne-skano-nature-rounds.test.js", "etne-brattholmen-nature-rounds.test.js",
  "etne-saevareidberget-nature-rounds.test.js", "etne-langebudalen-nature-rounds.test.js",
  "etne-fish-species-rounds.test.js", "etne-nature-round-content.test.js"
]) run("node", ["tests/" + name]);

console.log("Skrev 14 nye Åkrafjorden-kort i sluttbatchen");
console.log("Åkrafjorden-rundingen har nå 225 fauna-arter");
console.log("Åkrafjorden artsnivårevisjon fullført og validert");
