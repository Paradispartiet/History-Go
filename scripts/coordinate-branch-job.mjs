#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_9.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-9.test.js";
const PREVIOUS_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-8.test.js";

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
  amphipod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"], substrate: ["marint sediment"],
    strategy: "Lite amfipodekrepsdyr som lever nær bunnen og utnytter organisk materiale og små næringsobjekter.",
    traits: ["liten leddelt kropp", "sideflat kroppsform", "mange beinpar", "mikroskopiske detaljer skiller artene"],
    roles: ["lite krepsdyr", "nedbryter og smådyrspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "mikroorganismer", "andre små bunndyr", "bunnfisk"],
    tips: ["Påvises i faglige bunnprøver; sikker bestemmelse krever mikroskopi."]
  },
  cumacean: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["marint sediment"],
    strategy: "Lite cumacekrepsdyr som lever nær eller delvis nede i sedimentet og utnytter små organiske partikler.",
    traits: ["lite krepsdyr", "forstørret framkropp og smal bakkropp", "mange små lemmer", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["lite bentisk krepsdyr", "partikkelspiser", "byttedyr for fisk"], interactions: ["organisk materiale", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Arten påvises i bunnprøver og kan ikke bestemmes sikkert med det blotte øye."]
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
  shore_gastropod: {
    habitat: ["fjæresone", "berg, stein og brygger i grunt fjordvann"], substrate: ["fast underlag"],
    strategy: "Strandsnegl som beiter på alger og organisk belegg på hardbunnen og tåler perioder over vann.",
    traits: ["kraftig spiralsnodd skall", "mørk gråbrun farge", "bred bløtdyrfot", "lukker skallåpningen med lokk"],
    roles: ["algebeiter", "fjæresoneart", "byttedyr"], interactions: ["mikroalger", "berg og stein", "krabber og sjøfugl"],
    tips: ["Se på stein i fjæresonen uten å løsne dyrene eller forstyrre større kolonier."]
  },
  fish: {
    habitat: ["fjord", "kystvann", "stein-, tare- eller frie vannmasser"], substrate: ["varierende marint habitat"],
    strategy: "Fisk som søker næring i fjorden og inngår som rovdyr eller mellomledd i det marine næringsnettet.",
    traits: ["strømlinjeformet fiskekropp", "artsbestemmes etter finner, farge og kroppsform", "beveger seg aktivt i vannmassene", "kan opptre enkeltvis eller i stim"],
    roles: ["fisk", "rov- eller planktonspiser", "bytte for større rovdyr"], interactions: ["småfisk", "krepsdyr", "plankton", "sjøfugl og større fisk"],
    tips: ["Observer med undervannskamera eller lovlig fiske; sikker artsbestemmelse krever tydelige kjennetegn."]
  },
  seabird: {
    habitat: ["fjord", "kystvann", "åpne vannflater"], substrate: ["frie vannmasser og hvileplasser langs kysten"],
    strategy: "Sjøfugl som bruker fjorden til næringssøk, hvile eller trekk og finner fisk og marine smådyr ved overflaten.",
    traits: ["måkelignende kroppsform", "lange vinger", "svømmeføtter", "artsbestemmes etter fjærdrakt, nebb og vingemønster"],
    roles: ["sjøfugl", "fisk- og smådyrspiser", "åtseleter"], interactions: ["småfisk", "marine virvelløse dyr", "andre sjøfugler"],
    tips: ["Observer med kikkert fra land og hold avstand til hvilende eller beitende fugler."]
  },
  otter: {
    habitat: ["fjordstrand", "elveos", "steinete kyst og gruntvann"], substrate: ["vann, steinstrand og skjulesteder på land"],
    strategy: "Halvakvatisk rovpattedyr som jakter fisk og krepsdyr i vannet og bruker land til hvile, hi og forflytning.",
    traits: ["langstrakt kropp", "kraftig hale", "svømmehud", "mørk pels med lysere strupe"],
    roles: ["marint og limnisk rovpattedyr", "fiskespiser"], interactions: ["fisk", "krepsdyr", "elveos", "steinete strand"],
    tips: ["Se etter spor og ekskrementer uten å oppsøke hi eller forstyrre dyret; observér på lang avstand."]
  },
  copepod: {
    habitat: ["fjordens frie vannmasser", "planktonlaget"], substrate: ["pelagisk"],
    strategy: "Hoppekreps som lever som dyreplankton og beiter på mikroplankton eller mindre partikler i vannmassene.",
    traits: ["liten leddelt kropp", "lange antenner", "rykkvis svømming", "sikker artsbestemmelse krever planktonprøve og mikroskopi"],
    roles: ["dyreplankton", "energioverføring i næringsnettet", "bytte for fiskelarver og planktonspisende fisk"], interactions: ["planteplankton", "mikroplankton", "fiskelarver", "stimfisk"],
    tips: ["Arten kan ikke observeres som enkeltindivid fra land; dokumentasjon krever planktonhåv og mikroskopi."]
  },
  squat_lobster: {
    habitat: ["dypere fjordbunn", "stein-, grus- og blandingsbunn"], substrate: ["fast og blandet marint substrat"],
    strategy: "Trollhummer som kryper på bunnen og tar smådyr, åtsel og organiske partikler.",
    traits: ["flat hummerlignende framkropp", "lang hale bøyd under kroppen", "lange klør", "mange beinpar"],
    roles: ["bentisk krepsdyr", "smådyrspiser og åtseleter", "byttedyr for fisk"], interactions: ["små bunndyr", "åtsel", "steinbunn", "bunnfisk"],
    tips: ["Påvises med undervannskamera eller bunnredskap; håndter levende dyr forsiktig."]
  },
  brittle_star: {
    habitat: ["fjordbunn", "stein-, sand- og mudderbunn"], substrate: ["marint bunnsubstrat"],
    strategy: "Slangestjerne som beveger seg med lange armer og tar små næringspartikler eller smådyr ved bunnen.",
    traits: ["rund sentralskive", "fem lange leddelte armer", "skjør kroppsbygning", "beveger seg med armene"],
    roles: ["bunndyr", "partikkel- og smådyrspiser", "byttedyr"], interactions: ["organiske partikler", "små bunndyr", "bunnfisk"],
    tips: ["Påvises oftest i bunnprøver eller undervannsundersøkelser; armene brekker lett ved håndtering."]
  }
};

const specs = [
  ["emne_fauna_harpinia_crenulata", "Harpinia crenulata", "Harpinia crenulata", "amphipod"],
  ["emne_fauna_harpinia_laevis", "Harpinia laevis", "Harpinia laevis", "amphipod"],
  ["emne_fauna_hemilamprops_roseus", "Hemilamprops roseus", "Hemilamprops roseus", "cumacean"],
  ["emne_fauna_heteroclymene_robusta", "Heteroclymene robusta", "Heteroclymene robusta", "polychaete_tube"],
  ["emne_fauna_blaastaal", "Blåstål", "Labrus mixtus", "fish"],
  ["emne_fauna_laonice_sarsi", "Laonice sarsi", "Laonice sarsi", "polychaete_tube"],
  ["emne_fauna_gronlandsmaake", "Grønlandsmåke", "Larus glaucoides", "seabird"],
  ["emne_fauna_leiochone_johnstoni", "Leiochone johnstoni", "Leiochone johnstoni", "polychaete_tube"],
  ["emne_fauna_limatula_gwyni", "Limatula gwyni", "Limatula gwyni", "bivalve"],
  ["emne_fauna_storstrandsnegl", "Storstrandsnegl", "Littorina littorea", "shore_gastropod"],
  ["emne_fauna_oter", "Oter", "Lutra lutra", "otter"],
  ["emne_fauna_malacoceros_fuliginosus", "Malacoceros fuliginosus", "Malacoceros fuliginosus", "polychaete_tube"],
  ["emne_fauna_melinna_albicincta", "Melinna albicincta", "Melinna albicincta", "polychaete_tube"],
  ["emne_fauna_mesocalanus_tenuicornis", "Mesocalanus tenuicornis", "Mesocalanus tenuicornis", "copepod"],
  ["emne_fauna_munida_tenuimana", "Munida tenuimana", "Munida tenuimana", "squat_lobster"],
  ["emne_fauna_myriochele_danielsseni", "Myriochele danielsseni", "Myriochele danielsseni", "polychaete_tube"],
  ["emne_fauna_neogyptis_rosea", "Neogyptis rosea", "Neogyptis rosea", "polychaete_predator"],
  ["emne_fauna_nephtys_hombergii", "Nephtys hombergii", "Nephtys hombergii", "polychaete_predator"],
  ["emne_fauna_octobranchus_floriceps", "Octobranchus floriceps", "Octobranchus floriceps", "polychaete_tube"],
  ["emne_fauna_sarsslangestjerne", "Sarsslangestjerne", "Ophiura sarsii", "brittle_star"]
].map(([id, title, latin, profile]) => ({ id, title, latin, profile }));

const newEdgeTaxa = [
  "Isothecium alopecuroides",
  "Leptogium cochleatum",
  "Leptogium saturninum",
  "Lobaria virens",
  "Metzgeria furcata",
  "Nephroma parile",
  "Normandina pulchella"
];

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
    habitat: { biotop: profile.habitat, jord: profile.substrate, lys: ["varierer med dybde, årstid og vannklarhet"], fukt: ["saltvann og fjordmiljø"] },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: { typiske_steder: ["Åkrafjorden", ["copepod"].includes(spec.profile) ? "marine planktonprøver" : "fjordens marine habitater"], oslo_observert_typisk: "Artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden." },
    observasjonstips: profile.tips,
    source_urls: [`https://artsdatabanken.no/arter/takson/${source.taxonId}`, "https://artskart.artsdatabanken.no/", "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"],
    evidence: { place_id: "akrafjorden", waterbody_code: audit.source.waterBodyCode, species_audit: AUDIT_PATH, observation_count: source.count, earliest_year: source.earliestYear, latest_year: source.latestYear, precision_min_m: source.minPrecisionM, precision_max_m: source.maxPrecisionM }
  };
});
assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_9.json")) manifest.files.push("marine_akrafjorden_batch_9.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 8);
assert.equal(place.published_species_count, 171);
assert.equal(place.remaining_species_level_taxa_count, 90);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Ni kortbatcher omfatter nå elleve tidligere fjordfugler og hundre og åtti nye marine eller fjordtilknyttede arter. Landplanter, moser, lav, insekter og tydelige landfugler fra grenseområdet protokollføres separat og publiseres ikke som fjordarter.";
place.published_species_batch = 9;
place.published_species_count = 191;
place.remaining_species_level_taxa_count = 70;
place.unmatched_taxa_count = 70;
place.excluded_species_level_edge_taxa = [...new Set([...(place.excluded_species_level_edge_taxa || []), ...newEdgeTaxa])];
map.meta.version = "0.19.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let previousTest = await fs.readFile(path.join(ROOT, PREVIOUS_TEST_PATH), "utf8");
previousTest = previousTest
  .replace('assert.equal(place.published_species_batch, 8);', 'assert.ok(place.published_species_batch >= 8);')
  .replace('assert.equal(place.fauna.length, 171);', 'assert.ok(place.fauna.length >= 171);')
  .replace('assert.equal(place.published_species_count, 171);', 'assert.ok(place.published_species_count >= 171);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 90);', 'assert.ok(place.remaining_species_level_taxa_count <= 90);');
for (const expected of ['assert.ok(place.published_species_batch >= 8);','assert.ok(place.fauna.length >= 171);','assert.ok(place.published_species_count >= 171);','assert.ok(place.remaining_species_level_taxa_count <= 90);']) assert.ok(previousTest.includes(expected));
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
assert.ok(manifest.files.includes("marine_akrafjorden_batch_9.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 9);
assert.equal(place.fauna.length, 191);
assert.equal(place.published_species_count, 191);
assert.equal(place.remaining_species_level_taxa_count, 70);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);
const newEdgeTaxa = ${JSON.stringify(newEdgeTaxa)};
assert.ok(newEdgeTaxa.every(taxon => place.excluded_species_level_edge_taxa.includes(taxon)));
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 9 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
for (const batch of [8,7,6,5,4,3,2,1]) run("node", [`tests/etne-akrafjorden-marine-species-batch-${batch}.test.js`]);
for (const testFile of ["etne-jettegrytene-nature-rounds.test.js","etne-langfoss-nature-rounds.test.js","etne-skano-nature-rounds.test.js","etne-brattholmen-nature-rounds.test.js","etne-saevareidberget-nature-rounds.test.js","etne-langebudalen-nature-rounds.test.js","etne-fish-species-rounds.test.js","etne-nature-round-content.test.js"]) run("node", [`tests/${testFile}`]);
console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 9`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 9 full validation OK");
