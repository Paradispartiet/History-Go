#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_7.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-7.test.js";
const PREVIOUS_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-6.test.js";

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
    strategy: "Bevegelig flerbørstemark som søker smådyr i sedimentet og inngår i det bentiske rovdyrsamfunnet.",
    traits: ["segmentert kropp", "tydelige børster", "bevegelig hodeparti", "kjeve- og børstekarakterer krever mikroskopi"],
    roles: ["lite bentisk rovdyr", "sedimentlevende bunndyr", "byttedyr for fisk"], interactions: ["små børstemarker", "krepsdyr", "sediment", "bunnfisk"],
    tips: ["Sikker identifikasjon krever bunnprøve og mikroskopi."]
  },
  bivalve: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["finkornet marint sediment"],
    strategy: "Marin musling som lever helt eller delvis nedgravd og tar opp næring fra vannet eller sedimentoverflaten.",
    traits: ["to skallhalvdeler", "lever skjult i sedimentet", "skallform og hengsel brukes ved artsbestemmelse", "små arter krever lupe eller mikroskop"],
    roles: ["bløtbunnsorganisme", "del av det bentiske næringsnettet", "byttedyr"], interactions: ["organiske partikler", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Påvises gjennom faglig bunnprøvetaking; små skall skal bestemmes med lupe eller mikroskop."]
  },
  limpet: {
    habitat: ["hardbunn i fjæresonen", "berg og stein i grunt fjordvann"], substrate: ["fast fjell og stein"],
    strategy: "Skjellformet snegl som sitter tett mot hardbunnen og skraper alger fra overflaten.",
    traits: ["lav kjegleformet skall", "bred muskuløs fot", "sitter fast mot berg", "radiære skallribber"],
    roles: ["algebeiter", "fjæresoneart", "byttedyr"], interactions: ["mikroalger", "berg", "sjøfugl og krabber"],
    tips: ["Se på berg i fjæresonen uten å løsne dyrene; de tåler dårlig unødvendig håndtering."]
  },
  brittle_star: {
    habitat: ["fjordbunn", "stein-, sand- og mudderbunn"], substrate: ["marint bunnsubstrat"],
    strategy: "Slangestjerne som beveger seg med lange armer og tar små næringspartikler eller smådyr ved bunnen.",
    traits: ["rund sentralskive", "fem lange leddelte armer", "skjør kroppsbygning", "beveger seg med armene"],
    roles: ["bunndyr", "partikkel- og smådyrspiser", "byttedyr"], interactions: ["organiske partikler", "små bunndyr", "bunnfisk"],
    tips: ["Påvises oftest i bunnprøver eller undervannsundersøkelser; armene brekker lett ved håndtering."]
  },
  sea_star: {
    habitat: ["fjordbunn", "stein-, grus- og blandingsbunn"], substrate: ["fast og blandet marint substrat"],
    strategy: "Sjøstjerne som beveger seg langs bunnen og utnytter smådyr, åtsel eller fastsittende organismer.",
    traits: ["fem korte til middels lange armer", "tydelig sentralskive", "kalkplater og pigger i huden", "rørføtter på undersiden"],
    roles: ["bentisk rovdyr eller åtseleter", "del av hard- og blandingsbunnssamfunnet"], interactions: ["muslinger", "andre bunndyr", "åtsel"],
    tips: ["Observer med undervannskamera eller i bunnprøver; levende sjøstjerner skal behandles forsiktig."]
  },
  amphipod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"], substrate: ["marint sediment"],
    strategy: "Lite amfipodekrepsdyr som lever nær bunnen og utnytter organisk materiale og små næringsobjekter.",
    traits: ["liten leddelt kropp", "sideflat kroppsform", "mange beinpar", "mikroskopiske detaljer skiller artene"],
    roles: ["lite krepsdyr", "nedbryter og smådyrspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "mikroorganismer", "andre små bunndyr", "bunnfisk"],
    tips: ["Påvises i faglige bunnprøver; sikker bestemmelse krever mikroskopi."]
  },
  copepod: {
    habitat: ["fjordens frie vannmasser", "planktonlaget"], substrate: ["pelagisk"],
    strategy: "Liten hoppekreps som lever som dyreplankton og beiter på mikroplankton eller mindre partikler i vannmassene.",
    traits: ["svært liten leddelt kropp", "lange antenner", "rykkvis svømming", "sikker artsbestemmelse krever planktonprøve og mikroskopi"],
    roles: ["dyreplankton", "energioverføring i næringsnettet", "bytte for fiskelarver og planktonspisende fisk"], interactions: ["planteplankton", "mikroplankton", "fiskelarver", "stimfisk"],
    tips: ["Arten kan ikke observeres som enkeltindivid fra land; dokumentasjon krever planktonhåv og mikroskopi."]
  },
  oligochaete: {
    habitat: ["fjordens bløtbunn", "organisk rikt mudder"], substrate: ["finkornet marint sediment"],
    strategy: "Liten marin fåbørstemark som lever mellom sedimentpartiklene og utnytter mikroorganismer og organisk materiale.",
    traits: ["smal segmentert kropp", "få børster per ledd", "lever nedgravd", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["sedimenteter", "nedbryter", "byttedyr"], interactions: ["mikroorganismer", "organisk materiale", "sediment", "bunnfisk"],
    tips: ["Påvises bare gjennom faglig bunnprøve og mikroskopi."]
  },
  fish: {
    habitat: ["fjord", "kystvann", "stein-, tare- eller frie vannmasser"], substrate: ["varierende marint habitat"],
    strategy: "Fisk som søker næring i fjorden og inngår som rovdyr eller mellomledd i det marine næringsnettet.",
    traits: ["strømlinjeformet fiskekropp", "artsbestemmes etter finner, farge og kroppsform", "beveger seg aktivt i vannmassene", "kan opptre enkeltvis eller i stim"],
    roles: ["fisk", "rov- eller planktonspiser", "bytte for større rovdyr"], interactions: ["småfisk", "krepsdyr", "plankton", "sjøfugl og større fisk"],
    tips: ["Observer med undervannskamera eller lovlig fiske; sikker artsbestemmelse krever tydelige kjennetegn."]
  }
};

const specs = [
  ["emne_fauna_ophelina_acuminata", "Ophelina acuminata", "Ophelina acuminata", "polychaete_mobile"],
  ["emne_fauna_ophiura_carnea", "Ophiura carnea", "Ophiura carnea", "brittle_star"],
  ["emne_fauna_ophryotrocha_craigsmithi", "Ophryotrocha craigsmithi", "Ophryotrocha craigsmithi", "polychaete_mobile"],
  ["emne_fauna_paramphitrite_birulai", "Paramphitrite birulai", "Paramphitrite birulai", "polychaete_tube"],
  ["emne_fauna_parvicardium_minimum", "Parvicardium minimum", "Parvicardium minimum", "bivalve"],
  ["emne_fauna_albusnegl", "Albusnegl", "Patella vulgata", "limpet"],
  ["emne_fauna_pectinaria_belgica", "Pectinaria belgica", "Pectinaria belgica", "polychaete_tube"],
  ["emne_fauna_pholoe_baltica", "Pholoe baltica", "Pholoe baltica", "polychaete_mobile"],
  ["emne_fauna_polycirrus_norvegicus", "Polycirrus norvegicus", "Polycirrus norvegicus", "polychaete_tube"],
  ["emne_fauna_glattsypute", "Glattsypute", "Porania pulvillus", "sea_star"],
  ["emne_fauna_pseudomystides_spinachia", "Pseudomystides spinachia", "Pseudomystides spinachia", "polychaete_predator"],
  ["emne_fauna_sige_fusigera", "Sige fusigera", "Sige fusigera", "polychaete_predator"],
  ["emne_fauna_spiochaetopterus_bergensis", "Spiochaetopterus bergensis", "Spiochaetopterus bergensis", "polychaete_tube"],
  ["emne_fauna_spiophanes_wigleyi", "Spiophanes wigleyi", "Spiophanes wigleyi", "polychaete_tube"],
  ["emne_fauna_hestmakrell", "Hestmakrell", "Trachurus trachurus", "fish"],
  ["emne_fauna_brungylte", "Brungylte", "Acantholabrus palloni", "fish"],
  ["emne_fauna_acartia_clausi", "Acartia clausi", "Acartia clausi", "copepod"],
  ["emne_fauna_actaedrilus_polyonyx", "Actaedrilus polyonyx", "Actaedrilus polyonyx", "oligochaete"],
  ["emne_fauna_aetideopsis_armata", "Aetideopsis armata", "Aetideopsis armata", "copepod"],
  ["emne_fauna_aetideus_armatus", "Aetideus armatus", "Aetideus armatus", "copepod"]
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
    habitat: { biotop: profile.habitat, jord: profile.substrate, lys: ["varierer med dybde og vannklarhet"], fukt: ["saltvann"] },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: { typiske_steder: ["Åkrafjorden", spec.profile === "copepod" ? "marine planktonprøver" : "fjordens marine habitater"], oslo_observert_typisk: "Artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden." },
    observasjonstips: profile.tips,
    source_urls: [`https://artsdatabanken.no/arter/takson/${source.taxonId}`, "https://artskart.artsdatabanken.no/", "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"],
    evidence: { place_id: "akrafjorden", waterbody_code: audit.source.waterBodyCode, species_audit: AUDIT_PATH, observation_count: source.count, earliest_year: source.earliestYear, latest_year: source.latestYear, precision_min_m: source.minPrecisionM, precision_max_m: source.maxPrecisionM }
  };
});
assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_7.json")) manifest.files.push("marine_akrafjorden_batch_7.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 6);
assert.equal(place.published_species_count, 131);
assert.equal(place.remaining_species_level_taxa_count, 130);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Sju kortbatcher omfatter nå elleve tidligere fjordfugler og hundre og førti nye marine eller fjordtilknyttede arter. Tydelige terrestriske kanttreff og høyere taxa publiseres ikke som fjordarter.";
place.published_species_batch = 7;
place.published_species_count = 151;
place.remaining_species_level_taxa_count = 110;
place.unmatched_taxa_count = 110;
place.excluded_species_level_edge_taxa = ["Motacilla cinerea", "Turdus torquatus", "Xanthoria aureola"];
map.meta.version = "0.17.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let previousTest = await fs.readFile(path.join(ROOT, PREVIOUS_TEST_PATH), "utf8");
previousTest = previousTest
  .replace('assert.equal(place.published_species_batch, 6);', 'assert.ok(place.published_species_batch >= 6);')
  .replace('assert.equal(place.fauna.length, 131);', 'assert.ok(place.fauna.length >= 131);')
  .replace('assert.equal(place.published_species_count, 131);', 'assert.ok(place.published_species_count >= 131);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 130);', 'assert.ok(place.remaining_species_level_taxa_count <= 130);');
for (const expected of ['assert.ok(place.published_species_batch >= 6);','assert.ok(place.fauna.length >= 131);','assert.ok(place.published_species_count >= 131);','assert.ok(place.remaining_species_level_taxa_count <= 130);']) assert.ok(previousTest.includes(expected));
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
assert.ok(manifest.files.includes("marine_akrafjorden_batch_7.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 7);
assert.equal(place.fauna.length, 151);
assert.equal(place.published_species_count, 151);
assert.equal(place.remaining_species_level_taxa_count, 110);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.deepEqual(place.excluded_species_level_edge_taxa, ["Motacilla cinerea", "Turdus torquatus", "Xanthoria aureola"]);
assert.equal(new Set(place.fauna).size, place.fauna.length);
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 7 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
for (const batch of [6,5,4,3,2,1]) run("node", [`tests/etne-akrafjorden-marine-species-batch-${batch}.test.js`]);
for (const testFile of ["etne-jettegrytene-nature-rounds.test.js","etne-langfoss-nature-rounds.test.js","etne-skano-nature-rounds.test.js","etne-brattholmen-nature-rounds.test.js","etne-saevareidberget-nature-rounds.test.js","etne-langebudalen-nature-rounds.test.js","etne-fish-species-rounds.test.js","etne-nature-round-content.test.js"]) run("node", [`tests/${testFile}`]);
console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 7`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 7 full validation OK");
