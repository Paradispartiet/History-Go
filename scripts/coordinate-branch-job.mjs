#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_6.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-6.test.js";
const PREVIOUS_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-5.test.js";

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
  bivalve: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["finkornet marint sediment"],
    strategy: "Marin musling som lever helt eller delvis nedgravd og tar opp næring fra vannet eller sedimentoverflaten.",
    traits: ["to skallhalvdeler", "lever skjult i sedimentet", "skallform og hengsel brukes ved artsbestemmelse", "små arter krever lupe eller mikroskop"],
    roles: ["bløtbunnsorganisme", "del av det bentiske næringsnettet", "byttedyr"], interactions: ["organiske partikler", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Påvises gjennom faglig bunnprøvetaking; små skall skal bestemmes med lupe eller mikroskop."]
  },
  scaphopod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandbunn"], substrate: ["marint sediment"],
    strategy: "Sjøtann som lever nedgravd med begge ender av det rørformede skallet i kontakt med sediment og vann.",
    traits: ["langt rørformet skall", "åpent i begge ender", "lever nedgravd", "skallform og overflate skiller artene"],
    roles: ["sedimentlevende bløtdyr", "smådyrspiser", "del av bløtbunnssamfunnet"], interactions: ["foraminiferer", "mikroorganismer", "sediment"],
    tips: ["Påvises vanligvis som levende dyr eller skall i bunnprøver; ikke samle uten faglig formål."]
  },
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
  cumacean: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Lite cumacekrepsdyr som lever nær eller delvis nede i sedimentet og utnytter små organiske partikler.",
    traits: ["lite krepsdyr", "forstørret framkropp og smal bakkropp", "mange små lemmer", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["lite bentisk krepsdyr", "partikkelspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Arten påvises i bunnprøver og kan ikke bestemmes sikkert med det blotte øye."]
  },
  gastropod: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Marin snegl som beveger seg i eller på sedimentet og utnytter små næringspartikler eller byttedyr.",
    traits: ["spiralsnodd skall", "bløtdyrfot", "lever ofte skjult i sedimentet", "skallkarakterer brukes ved artsbestemmelse"],
    roles: ["bentisk bløtdyr", "partikkel- eller smådyrspiser", "byttedyr"], interactions: ["sediment", "små bunndyr", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises i bunnprøver; små skall må bestemmes med lupe eller mikroskop."]
  },
  shell_less_mollusk: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Ormelignende, skalløst bløtdyr som lever nede i sedimentet og inngår i den småvokste bunnfaunaen.",
    traits: ["langstrakt ormelignende kropp", "mangler synlig skall", "små kalkspikler i kroppsveggen", "sikker artsbestemmelse krever spesialkarakterer og mikroskopi"],
    roles: ["sedimentlevende bløtdyr", "del av bløtbunnssamfunnet", "byttedyr"], interactions: ["sediment", "mikroorganismer", "små bunndyr", "bunnfisk"],
    tips: ["Arten er ikke synlig fra land og påvises gjennom faglig prøvetaking."]
  },
  amphipod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"], substrate: ["marint sediment"],
    strategy: "Lite amfipodekrepsdyr som lever nær bunnen og utnytter organisk materiale og små næringsobjekter.",
    traits: ["liten leddelt kropp", "sideflat kroppsform", "mange beinpar", "mikroskopiske detaljer skiller artene"],
    roles: ["lite krepsdyr", "nedbryter og smådyrspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "mikroorganismer", "andre små bunndyr", "bunnfisk"],
    tips: ["Påvises i faglige bunnprøver; sikker bestemmelse krever mikroskopi."]
  },
  swan: {
    habitat: ["fjord", "brakkvann", "grunne bukter og elveos"], substrate: ["frie vannmasser og gruntvannsområder"],
    strategy: "Stor vannfugl som beiter på vannplanter og annet plantemateriale og bruker isfrie fjordområder som raste- og vinterplass.",
    traits: ["stor hvit svane", "gul og svart nebbtegning", "lang rett hals", "kraftige vingeslag"],
    roles: ["planteeter", "vannfugl", "sesonggjest"], interactions: ["vannplanter", "gruntvann", "andre vannfugler"],
    tips: ["Observer med kikkert og hold avstand til hvilende flokker, særlig vinterstid."]
  },
  sea_duck: {
    habitat: ["fjord", "kystvann", "grunne og middels dype beiteområder"], substrate: ["frie vannmasser og sjøbunn"],
    strategy: "Dykkand som henter muslinger, krepsdyr og andre bunndyr under vann og kan raste i flokker på fjorden.",
    traits: ["mørk sjøand", "kraftig kropp", "dykker etter næring", "hannen er svart med lysere nebbparti"],
    roles: ["bunndyrspisende sjøfugl", "dykkand", "sesonggjest"], interactions: ["muslinger", "krepsdyr", "andre sjøender", "fjordens gruntområder"],
    tips: ["Se med kikkert fra land; ikke gå nær flokker som hviler eller beiter på sjøen."]
  }
};

const specs = [
  ["emne_fauna_thyasira_sarsii", "Thyasira sarsii", "Thyasira sarsii", "bivalve"],
  ["emne_fauna_tropidomya_abbreviata", "Tropidomya abbreviata", "Tropidomya abbreviata", "bivalve"],
  ["emne_fauna_aglaophamus_pulcher", "Aglaophamus pulcher", "Aglaophamus pulcher", "polychaete_predator"],
  ["emne_fauna_ampharete_octocirrata", "Ampharete octocirrata", "Ampharete octocirrata", "polychaete_tube"],
  ["emne_fauna_chaetozone_jubata", "Chaetozone jubata", "Chaetozone jubata", "polychaete_detritivore"],
  ["emne_fauna_chaetozone_monteverdii", "Chaetozone monteverdii", "Chaetozone monteverdii", "polychaete_detritivore"],
  ["emne_fauna_chaetozone_pseudosetosa", "Chaetozone pseudosetosa", "Chaetozone pseudosetosa", "polychaete_detritivore"],
  ["emne_fauna_clymenura_borealis", "Clymenura borealis", "Clymenura borealis", "polychaete_tube"],
  ["emne_fauna_cuspidaria_rostrata", "Cuspidaria rostrata", "Cuspidaria rostrata", "bivalve"],
  ["emne_fauna_sangsvane", "Sangsvane", "Cygnus cygnus", "swan"],
  ["emne_fauna_entalina_tetragona", "Entalina tetragona", "Entalina tetragona", "scaphopod"],
  ["emne_fauna_eudorella_truncatula", "Eudorella truncatula", "Eudorella truncatula", "cumacean"],
  ["emne_fauna_euspira_montagui", "Euspira montagui", "Euspira montagui", "gastropod"],
  ["emne_fauna_falcidens_sagittiferus", "Falcidens sagittiferus", "Falcidens sagittiferus", "shell_less_mollusk"],
  ["emne_fauna_glycera_unicornis", "Glycera unicornis", "Glycera unicornis", "polychaete_predator"],
  ["emne_fauna_harmothoe_antilopes", "Harmothoe antilopes", "Harmothoe antilopes", "polychaete_mobile"],
  ["emne_fauna_leptophoxus_falcatus", "Leptophoxus falcatus", "Leptophoxus falcatus", "amphipod"],
  ["emne_fauna_lipobranchius_jeffreysii", "Lipobranchius jeffreysii", "Lipobranchius jeffreysii", "polychaete_detritivore"],
  ["emne_fauna_lumbrineris_aniara", "Lumbrineris aniara", "Lumbrineris aniara", "polychaete_predator"],
  ["emne_fauna_svartand", "Svartand", "Melanitta nigra", "sea_duck"]
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
  return {
    id: spec.id, title: spec.title, latin: spec.latin,
    taxonomy: { norsk_navn: source.norwegianName || (spec.title !== spec.latin ? spec.title : null), latin_navn: spec.latin, klasse: source.class || "Uavklart klasse", orden: source.order || "Uavklart orden", familie: source.family || "Uavklart familie", artskart_taxon_id: Number(source.taxonId) },
    habitat: { biotop: profile.habitat, jord: profile.substrate, lys: ["varierer med dybde, årstid og vannklarhet"], fukt: ["saltvann"] },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: { typiske_steder: ["Åkrafjorden", ["swan","sea_duck"].includes(spec.profile) ? "fjordoverflaten og gruntvann" : "marine bunnprøver"], oslo_observert_typisk: "Artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden." },
    observasjonstips: profile.tips,
    source_urls: [`https://artsdatabanken.no/arter/takson/${source.taxonId}`, "https://artskart.artsdatabanken.no/", "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"],
    evidence: { place_id: "akrafjorden", waterbody_code: audit.source.waterBodyCode, species_audit: AUDIT_PATH, observation_count: source.count, earliest_year: source.earliestYear, latest_year: source.latestYear, precision_min_m: source.minPrecisionM, precision_max_m: source.maxPrecisionM }
  };
});

assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_6.json")) manifest.files.push("marine_akrafjorden_batch_6.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 5);
assert.equal(place.published_species_count, 111);
assert.equal(place.remaining_species_level_taxa_count, 150);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Seks kortbatcher omfatter nå elleve tidligere fjordfugler og hundre og tjue nye marine eller fjordtilknyttede arter. Høyere taxa, samlegrupper og terrestriske kanttreff publiseres ikke som fjordarter.";
place.published_species_batch = 6;
place.published_species_count = 131;
place.remaining_species_level_taxa_count = 130;
place.unmatched_taxa_count = 130;
map.meta.version = "0.16.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let previousTest = await fs.readFile(path.join(ROOT, PREVIOUS_TEST_PATH), "utf8");
previousTest = previousTest
  .replace('assert.equal(place.published_species_batch, 5);', 'assert.ok(place.published_species_batch >= 5);')
  .replace('assert.equal(place.fauna.length, 111);', 'assert.ok(place.fauna.length >= 111);')
  .replace('assert.equal(place.published_species_count, 111);', 'assert.ok(place.published_species_count >= 111);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 150);', 'assert.ok(place.remaining_species_level_taxa_count <= 150);');
for (const expected of ['assert.ok(place.published_species_batch >= 5);','assert.ok(place.fauna.length >= 111);','assert.ok(place.published_species_count >= 111);','assert.ok(place.remaining_species_level_taxa_count <= 150);']) assert.ok(previousTest.includes(expected));
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
assert.ok(manifest.files.includes("marine_akrafjorden_batch_6.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 6);
assert.equal(place.fauna.length, 131);
assert.equal(place.published_species_count, 131);
assert.equal(place.remaining_species_level_taxa_count, 130);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 6 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
for (const batch of [5,4,3,2,1]) run("node", [`tests/etne-akrafjorden-marine-species-batch-${batch}.test.js`]);
for (const testFile of ["etne-jettegrytene-nature-rounds.test.js","etne-langfoss-nature-rounds.test.js","etne-skano-nature-rounds.test.js","etne-brattholmen-nature-rounds.test.js","etne-saevareidberget-nature-rounds.test.js","etne-langebudalen-nature-rounds.test.js","etne-fish-species-rounds.test.js","etne-nature-round-content.test.js"]) run("node", [`tests/${testFile}`]);
console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 6`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 6 full validation OK");
