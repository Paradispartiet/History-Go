#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_8.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-8.test.js";
const PREVIOUS_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-7.test.js";

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
  hydromedusa: {
    habitat: ["fjordens frie vannmasser", "planktonlaget"], substrate: ["pelagisk"],
    strategy: "Liten hydrozo-manet som driver og svømmer i vannmassene og fanger små planktonorganismer med tentaklene.",
    traits: ["gjennomsiktig klokke", "fine tentakler", "liten planktonisk manet", "sikker artsbestemmelse krever fersk prøve og lupe eller mikroskop"],
    roles: ["planktonisk rovdyr", "bytte for fisk og større planktondyr"], interactions: ["hoppekreps", "fiskelarver", "annet dyreplankton"],
    tips: ["Påvises i planktonprøver; den skjøre kroppen gjør at levende eksemplarer må håndteres svært forsiktig."]
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
  polychaete_detritivore: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"], substrate: ["organisk rikt marint sediment"],
    strategy: "Sedimentlevende flerbørstemark som graver i bunnen og utnytter organisk materiale mellom sedimentpartiklene.",
    traits: ["segmentert kropp", "børster på kroppsleddene", "lever hovedsakelig nedgravd", "sikker artsbestemmelse krever mikroskopiske karakterer"],
    roles: ["sedimenteter", "bioturbator", "byttedyr for fisk"], interactions: ["organisk materiale", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Arten påvises gjennom faglig bunnprøvetaking og kan ikke bestemmes sikkert fra land."]
  },
  sea_mouse: {
    habitat: ["fjordens bløtbunn", "mudder-, sand- og blandingsbunn"], substrate: ["marint sediment"],
    strategy: "Stor, bevegelig flerbørstemark som lever på eller delvis i bunnen og tar smådyr og organisk materiale.",
    traits: ["oval og flat kropp", "tett dekke av børster", "iriserende sidebørster", "tydelig segmentert underside"],
    roles: ["bentisk rovdyr og åtseleter", "bioturbator", "byttedyr"], interactions: ["små bunndyr", "åtsel", "sediment", "bunnfisk"],
    tips: ["Påvises i bunnprøver eller som tilfeldig fangst; børstene kan irritere huden og dyret skal ikke håndteres unødvendig."]
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
  shrimp: {
    habitat: ["fjordbunn", "mudder-, sand- og blandingsbunn"], substrate: ["marint sediment"],
    strategy: "Bunnlevende reke som søker smådyr og organisk materiale på eller like over sedimentet.",
    traits: ["langstrakt rekelignende kropp", "lange antenner", "flere beinpar", "rostrum og leddkarakterer brukes ved artsbestemmelse"],
    roles: ["bentisk krepsdyr", "smådyrspiser og åtseleter", "byttedyr for fisk"], interactions: ["små bunndyr", "organisk materiale", "bunnfisk"],
    tips: ["Påvises med bunnredskap eller undervannskamera; sikker artsbestemmelse krever nærstudium."]
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
  octopus: {
    habitat: ["fjordbunn", "stein-, grus- og blandingsbunn"], substrate: ["fast og blandet marint substrat"],
    strategy: "Blekksprut som jakter aktivt på krepsdyr, muslinger og fisk og skjuler seg i hulrom ved bunnen.",
    traits: ["åtte armer", "myk kropp uten ytre skall", "to finner på kappen", "kan endre farge og hudstruktur"],
    roles: ["bentisk rovdyr", "intelligent jeger"], interactions: ["krepsdyr", "muslinger", "fisk", "hulrom på bunnen"],
    tips: ["Observer med undervannskamera eller som dokumentert fangst; levende blekksprut skal ikke forstyrres eller håndteres unødvendig."]
  }
};

const specs = [
  ["emne_fauna_aglantha_digitale", "Aglantha digitale", "Aglantha digitale", "hydromedusa"],
  ["emne_fauna_ampharete_lindstroemi", "Ampharete lindstroemi", "Ampharete lindstroemi", "polychaete_tube"],
  ["emne_fauna_sjomus", "Sjømus", "Aphrodita aculeata", "sea_mouse"],
  ["emne_fauna_arenicolides_ecaudata", "Arenicolides ecaudata", "Arenicolides ecaudata", "polychaete_detritivore"],
  ["emne_fauna_astarte_sulcata", "Astarte sulcata", "Astarte sulcata", "bivalve"],
  ["emne_fauna_augeneria_tentaculata", "Augeneria tentaculata", "Augeneria tentaculata", "polychaete_predator"],
  ["emne_fauna_bathyarca_pectunculoides", "Bathyarca pectunculoides", "Bathyarca pectunculoides", "bivalve"],
  ["emne_fauna_ishavsaate", "Ishavsåte", "Calanus glacialis", "copepod"],
  ["emne_fauna_calanus_helgolandicus", "Calanus helgolandicus", "Calanus helgolandicus", "copepod"],
  ["emne_fauna_candacia_armata", "Candacia armata", "Candacia armata", "copepod"],
  ["emne_fauna_chone_duneri", "Chone duneri", "Chone duneri", "polychaete_tube"],
  ["emne_fauna_kurvskjell", "Kurvskjell", "Corbula gibba", "bivalve"],
  ["emne_fauna_crangon_allmanni", "Crangon allmanni", "Crangon allmanni", "shrimp"],
  ["emne_fauna_cuspidaria_obesa", "Cuspidaria obesa", "Cuspidaria obesa", "bivalve"],
  ["emne_fauna_cylichna_cylindracea", "Cylichna cylindracea", "Cylichna cylindracea", "gastropod"],
  ["emne_fauna_eledoneblekksprut", "Eledoneblekksprut", "Eledone cirrhosa", "octopus"],
  ["emne_fauna_eudorella_hirsuta", "Eudorella hirsuta", "Eudorella hirsuta", "cumacean"],
  ["emne_fauna_exogone_naidina", "Exogone naidina", "Exogone naidina", "polychaete_mobile"],
  ["emne_fauna_glyphohesione_klatti", "Glyphohesione klatti", "Glyphohesione klatti", "polychaete_mobile"],
  ["emne_fauna_harmothoe_fragilis", "Harmothoe fragilis", "Harmothoe fragilis", "scale_worm"]
].map(([id, title, latin, profile]) => ({ id, title, latin, profile }));

const newEdgeTaxa = [
  "Antitrichia curtipendula",
  "Atriplex prostrata",
  "Carex nigra subsp. nigra",
  "Collema flaccidum",
  "Collema subflaccidum",
  "Corvus corax",
  "Corvus corone subsp. cornix",
  "Deilephila elpenor",
  "Eleocharis quinqueflora",
  "Equisetum sylvaticum",
  "Filipendula ulmaria",
  "Frullania fragilifolia",
  "Frullania tamarisci",
  "Fuscopannaria mediterranea",
  "Gyalecta flotowii"
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
    habitat: { biotop: profile.habitat, jord: profile.substrate, lys: ["varierer med dybde og vannklarhet"], fukt: ["saltvann"] },
    fenologi: { aktiv: ["registrert i Åkrafjorden gjennom Artskart"], strategi: profile.strategy },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: { typiske_steder: ["Åkrafjorden", ["hydromedusa", "copepod"].includes(spec.profile) ? "marine planktonprøver" : "fjordens marine bunnmiljø"], oslo_observert_typisk: "Artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden." },
    observasjonstips: profile.tips,
    source_urls: [`https://artsdatabanken.no/arter/takson/${source.taxonId}`, "https://artskart.artsdatabanken.no/", "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"],
    evidence: { place_id: "akrafjorden", waterbody_code: audit.source.waterBodyCode, species_audit: AUDIT_PATH, observation_count: source.count, earliest_year: source.earliestYear, latest_year: source.latestYear, precision_min_m: source.minPrecisionM, precision_max_m: source.maxPrecisionM }
  };
});
assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_8.json")) manifest.files.push("marine_akrafjorden_batch_8.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 7);
assert.equal(place.published_species_count, 151);
assert.equal(place.remaining_species_level_taxa_count, 110);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Åtte kortbatcher omfatter nå elleve tidligere fjordfugler og hundre og seksti nye marine eller fjordtilknyttede arter. Landplanter, moser, lav, insekter og landfugler fra grenseområdet protokollføres separat og publiseres ikke som fjordarter.";
place.published_species_batch = 8;
place.published_species_count = 171;
place.remaining_species_level_taxa_count = 90;
place.unmatched_taxa_count = 90;
place.excluded_species_level_edge_taxa = [...new Set([...(place.excluded_species_level_edge_taxa || []), ...newEdgeTaxa])];
map.meta.version = "0.18.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let previousTest = await fs.readFile(path.join(ROOT, PREVIOUS_TEST_PATH), "utf8");
previousTest = previousTest
  .replace('assert.equal(place.published_species_batch, 7);', 'assert.ok(place.published_species_batch >= 7);')
  .replace('assert.equal(place.fauna.length, 151);', 'assert.ok(place.fauna.length >= 151);')
  .replace('assert.equal(place.published_species_count, 151);', 'assert.ok(place.published_species_count >= 151);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 110);', 'assert.ok(place.remaining_species_level_taxa_count <= 110);')
  .replace('assert.deepEqual(place.excluded_species_level_edge_taxa, ["Motacilla cinerea", "Turdus torquatus", "Xanthoria aureola"]);', 'assert.ok(["Motacilla cinerea", "Turdus torquatus", "Xanthoria aureola"].every(taxon => place.excluded_species_level_edge_taxa.includes(taxon)));');
for (const expected of ['assert.ok(place.published_species_batch >= 7);','assert.ok(place.fauna.length >= 151);','assert.ok(place.published_species_count >= 151);','assert.ok(place.remaining_species_level_taxa_count <= 110);']) assert.ok(previousTest.includes(expected));
await writeText(PREVIOUS_TEST_PATH, previousTest);

const expectedEdgeTaxa = ["Motacilla cinerea", "Turdus torquatus", "Xanthoria aureola", ...newEdgeTaxa];
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
assert.ok(manifest.files.includes("marine_akrafjorden_batch_8.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 8);
assert.equal(place.fauna.length, 171);
assert.equal(place.published_species_count, 171);
assert.equal(place.remaining_species_level_taxa_count, 90);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);
const expectedEdgeTaxa = ${JSON.stringify(expectedEdgeTaxa)};
assert.ok(expectedEdgeTaxa.every(taxon => place.excluded_species_level_edge_taxa.includes(taxon)));
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 8 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
for (const batch of [7,6,5,4,3,2,1]) run("node", [`tests/etne-akrafjorden-marine-species-batch-${batch}.test.js`]);
for (const testFile of ["etne-jettegrytene-nature-rounds.test.js","etne-langfoss-nature-rounds.test.js","etne-skano-nature-rounds.test.js","etne-brattholmen-nature-rounds.test.js","etne-saevareidberget-nature-rounds.test.js","etne-langebudalen-nature-rounds.test.js","etne-fish-species-rounds.test.js","etne-nature-round-content.test.js"]) run("node", [`tests/${testFile}`]);
console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 8`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 8 full validation OK");
