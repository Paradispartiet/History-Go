#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_10.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-10.test.js";
const PREVIOUS_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-9.test.js";

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
  polychaete_predator: {
    habitat: ["fjordens sedimentbunn", "mudder-, sand- og blandingsbunn"], substrate: ["marint sediment"],
    strategy: "Bevegelig flerbørstemark som søker smådyr i sedimentet og inngår i det bentiske rovdyrsamfunnet.",
    traits: ["segmentert kropp", "tydelige børster", "bevegelig hodeparti", "kjeve- og børstekarakterer krever mikroskopi"],
    roles: ["lite bentisk rovdyr", "sedimentlevende bunndyr", "byttedyr for fisk"], interactions: ["små børstemarker", "krepsdyr", "sediment", "bunnfisk"],
    tips: ["Sikker identifikasjon krever bunnprøve og mikroskopi."]
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
    strategy: "Rør- eller sedimentlevende flerbørstemark som samler organiske partikler med lange tentakler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lange næringstentakler", "mesteparten av kroppen er skjult", "børste- og gjellekarakterer brukes ved sikker artsbestemmelse"],
    roles: ["partikkelspiser", "sedimentbearbeider", "byttedyr"], interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom faglig bunnprøvetaking; dyret er ikke et vanlig synlig strandfunn."]
  },
  polychaete_detritivore: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["organisk rikt marint sediment"],
    strategy: "Sedimentlevende flerbørstemark som graver i bunnen og utnytter organisk materiale mellom sedimentpartiklene.",
    traits: ["segmentert kropp", "børster på kroppsleddene", "lever hovedsakelig nedgravd", "sikker artsbestemmelse krever mikroskopiske karakterer"],
    roles: ["sedimenteter", "bioturbator", "byttedyr for fisk"], interactions: ["organisk materiale", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Arten påvises gjennom faglig bunnprøvetaking og kan ikke bestemmes sikkert fra land."]
  },
  amphipod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"], substrate: ["marint sediment"],
    strategy: "Lite amfipodekrepsdyr som lever nær bunnen og utnytter organisk materiale og små næringsobjekter.",
    traits: ["liten leddelt kropp", "sideflat kroppsform", "mange beinpar", "mikroskopiske detaljer skiller artene"],
    roles: ["lite krepsdyr", "nedbryter og smådyrspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "mikroorganismer", "andre små bunndyr", "bunnfisk"],
    tips: ["Påvises i faglige bunnprøver; sikker bestemmelse krever mikroskopi."]
  },
  scaphopod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandbunn"], substrate: ["marint sediment"],
    strategy: "Sjøtann som lever nedgravd med begge ender av det rørformede skallet i kontakt med sediment og vann.",
    traits: ["langt rørformet skall", "åpent i begge ender", "lever nedgravd", "skallform og overflate skiller artene"],
    roles: ["sedimentlevende bløtdyr", "smådyrspiser", "del av bløtbunnssamfunnet"], interactions: ["foraminiferer", "mikroorganismer", "sediment"],
    tips: ["Påvises vanligvis som levende dyr eller skall i bunnprøver; ikke samle uten faglig formål."]
  },
  microcrustacean: {
    habitat: ["grunt fjord- og brakkvann", "vannvegetasjon og fint sediment"], substrate: ["frie vannmasser og grunt bunnmiljø"],
    strategy: "Svært lite krepsdyr som lever mellom vegetasjon eller i vannmassene og filtrerer eller samler små næringspartikler.",
    traits: ["mikroskopisk leddelt kropp", "svømmebein", "tydelig hodeparti", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["mikrokreps", "plankton- eller bunnnært smådyr", "bytte for fiskelarver"], interactions: ["mikroalger", "organiske partikler", "fiskelarver"],
    tips: ["Arten påvises gjennom vann- eller sedimentprøver og kan ikke bestemmes med det blotte øye."]
  },
  gastropod: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Marin snegl som beveger seg i eller på sedimentet og utnytter små næringspartikler eller byttedyr.",
    traits: ["spiralsnodd skall", "bløtdyrfot", "lever ofte skjult i sedimentet", "skallkarakterer brukes ved artsbestemmelse"],
    roles: ["bentisk bløtdyr", "partikkel- eller smådyrspiser", "byttedyr"], interactions: ["sediment", "små bunndyr", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises i bunnprøver; små skall må bestemmes med lupe eller mikroskop."]
  },
  fan_worm: {
    habitat: ["fjordbunn", "stein-, skall- og bløtbunn"], substrate: ["fast underlag eller sedimentrør"],
    strategy: "Stor rørlevende flerbørstemark som filtrerer plankton og organiske partikler med en fjærformet tentakelkrans.",
    traits: ["fjærformet tentakelkrans", "langt rør", "segmentert kropp skjult i røret", "trekker kronen raskt inn ved forstyrrelse"],
    roles: ["filterspiser", "rørbygger", "habitatstruktur"], interactions: ["plankton", "organiske partikler", "fast underlag"],
    tips: ["Observer med undervannskamera og unngå berøring; tentakelkronen er svært følsom."]
  }
};

const specs = [
  ["emne_fauna_ophryotrocha_maculata", "Ophryotrocha maculata", "Ophryotrocha maculata", "polychaete_mobile"],
  ["emne_fauna_oxydromus_vittatus", "Oxydromus vittatus", "Oxydromus vittatus", "polychaete_predator"],
  ["emne_fauna_paramphitrite_tetrabranchia", "Paramphitrite tetrabranchia", "Paramphitrite tetrabranchia", "polychaete_tentacle"],
  ["emne_fauna_parexogone_hebes", "Parexogone hebes", "Parexogone hebes", "polychaete_mobile"],
  ["emne_fauna_parexogone_longicirris", "Parexogone longicirris", "Parexogone longicirris", "polychaete_mobile"],
  ["emne_fauna_parougia_eliasoni", "Parougia eliasoni", "Parougia eliasoni", "polychaete_predator"],
  ["emne_fauna_pholoe_assimilis", "Pholoe assimilis", "Pholoe assimilis", "polychaete_mobile"],
  ["emne_fauna_phylo_grubei", "Phylo grubei", "Phylo grubei", "polychaete_detritivore"],
  ["emne_fauna_pista_lornensis", "Pista lornensis", "Pista lornensis", "polychaete_tentacle"],
  ["emne_fauna_pista_malmgreni", "Pista malmgreni", "Pista malmgreni", "polychaete_tentacle"],
  ["emne_fauna_platynereis_dumerilii", "Platynereis dumerilii", "Platynereis dumerilii", "polychaete_mobile"],
  ["emne_fauna_polycirrus_medusa", "Polycirrus medusa", "Polycirrus medusa", "polychaete_tentacle"],
  ["emne_fauna_pontocrates_altamarinus", "Pontocrates altamarinus", "Pontocrates altamarinus", "amphipod"],
  ["emne_fauna_protodorvillea_kefersteini", "Protodorvillea kefersteini", "Protodorvillea kefersteini", "polychaete_predator"],
  ["emne_fauna_protomystides_exigua", "Protomystides exigua", "Protomystides exigua", "polychaete_predator"],
  ["emne_fauna_pulsellum_lofotense", "Pulsellum lofotense", "Pulsellum lofotense", "scaphopod"],
  ["emne_fauna_raricirrus_beryli", "Raricirrus beryli", "Raricirrus beryli", "polychaete_detritivore"],
  ["emne_fauna_krumsnutekreps", "Krumsnutekreps", "Rhynchotalona falcata", "microcrustacean"],
  ["emne_fauna_roxania_utriculus", "Roxania utriculus", "Roxania utriculus", "gastropod"],
  ["emne_fauna_sabella_pavonina", "Sabella pavonina", "Sabella pavonina", "fan_worm"]
].map(([id, title, latin, profile]) => ({ id, title, latin, profile }));

const newEdgeTaxa = ["Peniophora limitata"];

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
    taxonomy: { norsk_navn: source.norwegianName || (spec.title !== spec.latin ? spec.title : null), latin_navn: spec.latin, klasse: source.class || "Uavklart klasse", orden: source.order || "Uavklart orden", familie: source.family || "Uavklart familie", artskart_taxon_id: Number(source.taxonId) },
    habitat: { biotop: profile.habitat, jord: profile.substrate, lys: ["varierer med dybde og vannklarhet"], fukt: ["saltvann og fjordmiljø"] },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: { typiske_steder: ["Åkrafjorden", spec.profile === "microcrustacean" ? "grunt brakkvann og vannprøver" : "fjordens marine bunnmiljø"], oslo_observert_typisk: "Artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden." },
    observasjonstips: profile.tips,
    source_urls: [`https://artsdatabanken.no/arter/takson/${source.taxonId}`, "https://artskart.artsdatabanken.no/", "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"],
    evidence: { place_id: "akrafjorden", waterbody_code: audit.source.waterBodyCode, species_audit: AUDIT_PATH, observation_count: source.count, earliest_year: source.earliestYear, latest_year: source.latestYear, precision_min_m: source.minPrecisionM, precision_max_m: source.maxPrecisionM }
  };
});
assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_10.json")) manifest.files.push("marine_akrafjorden_batch_10.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 9);
assert.equal(place.published_species_count, 191);
assert.equal(place.remaining_species_level_taxa_count, 70);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Ti kortbatcher omfatter nå elleve tidligere fjordfugler og to hundre nye marine eller fjordtilknyttede arter. Landplanter, moser, lav, sopp, insekter og tydelige landfugler fra grenseområdet protokollføres separat og publiseres ikke som fjordarter.";
place.published_species_batch = 10;
place.published_species_count = 211;
place.remaining_species_level_taxa_count = 50;
place.unmatched_taxa_count = 50;
place.excluded_species_level_edge_taxa = [...new Set([...(place.excluded_species_level_edge_taxa || []), ...newEdgeTaxa])];
map.meta.version = "0.20.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let previousTest = await fs.readFile(path.join(ROOT, PREVIOUS_TEST_PATH), "utf8");
previousTest = previousTest
  .replace('assert.equal(place.published_species_batch, 9);', 'assert.ok(place.published_species_batch >= 9);')
  .replace('assert.equal(place.fauna.length, 191);', 'assert.ok(place.fauna.length >= 191);')
  .replace('assert.equal(place.published_species_count, 191);', 'assert.ok(place.published_species_count >= 191);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 70);', 'assert.ok(place.remaining_species_level_taxa_count <= 70);');
for (const expected of ['assert.ok(place.published_species_batch >= 9);','assert.ok(place.fauna.length >= 191);','assert.ok(place.published_species_count >= 191);','assert.ok(place.remaining_species_level_taxa_count <= 70);']) assert.ok(previousTest.includes(expected));
await writeText(PREVIOUS_TEST_PATH, previousTest);

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
assert.ok(manifest.files.includes("marine_akrafjorden_batch_10.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 10);
assert.equal(place.fauna.length, 211);
assert.equal(place.published_species_count, 211);
assert.equal(place.remaining_species_level_taxa_count, 50);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);
assert.ok(place.excluded_species_level_edge_taxa.includes("Peniophora limitata"));
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 10 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
for (const batch of [9,8,7,6,5,4,3,2,1]) run("node", [`tests/etne-akrafjorden-marine-species-batch-${batch}.test.js`]);
for (const testFile of ["etne-jettegrytene-nature-rounds.test.js","etne-langfoss-nature-rounds.test.js","etne-skano-nature-rounds.test.js","etne-brattholmen-nature-rounds.test.js","etne-saevareidberget-nature-rounds.test.js","etne-langebudalen-nature-rounds.test.js","etne-fish-species-rounds.test.js","etne-nature-round-content.test.js"]) run("node", [`tests/${testFile}`]);
console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 10`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 10 full validation OK");
