#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_2.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-2.test.js";

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
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["finkornet marint sediment"],
    strategy: "Liten marin musling som lever helt eller delvis nedgravd i sedimentet og tar opp næring fra vannet eller sedimentoverflaten.",
    traits: ["to skallhalvdeler", "liten bløtbunnsmusling", "sikker artsbestemmelse krever skallkarakterer og ofte lupe eller mikroskop", "lever skjult i sedimentet"],
    roles: ["bløtbunnsorganisme", "del av fjordens bentiske næringsnett", "byttedyr for fisk og større bunndyr"],
    interactions: ["organiske partikler", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Arten påvises i bunnprøver. Ikke grav i fjordbunnen uten faglig formål og nødvendige tillatelser."]
  },
  polychaete_mobile: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"],
    substrate: ["marint sediment"],
    strategy: "Marin flerbørstemark som beveger seg i eller på sedimentet og deltar i omsetningen av organisk materiale og smådyr.",
    traits: ["segmentert kropp", "børster på kroppsleddene", "små hode- og børstekarakterer brukes i artsbestemmelsen", "sikker bestemmelse krever vanligvis mikroskopi"],
    roles: ["sedimentlevende bunndyr", "bioturbator", "byttedyr for fisk"],
    interactions: ["sediment", "organiske partikler", "små bunndyr", "bunnfisk"],
    tips: ["Arten kan ikke bestemmes sikkert fra land eller vanlig foto; dokumentasjonen kommer fra faglige bunnprøver."]
  },
  polychaete_tube: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    strategy: "Rørlevende flerbørstemark som bygger eller bor i et sedimentrør og samler små næringspartikler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lever hovedsakelig skjult i rør", "børster og hodevedheng skiller artene", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["rørbyggende bunndyr", "sedimentstabilisator", "partikkelspiser"],
    interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom standardiserte bunnprøver. Rør og dyr skal ikke samles tilfeldig fra naturen."]
  },
  polychaete_predator: {
    habitat: ["fjordens sedimentbunn", "mudder-, sand- og blandingsbunn"],
    substrate: ["marint sediment"],
    strategy: "Bevegelig flerbørstemark som leter etter smådyr i sedimentet og bruker et utvrengbart svelg under næringssøk.",
    traits: ["segmentert kropp", "tydelige børster", "bevegelig hodeparti", "kjeve- og børstekarakterer brukes ved sikker artsbestemmelse"],
    roles: ["lite bentisk rovdyr", "sedimentlevende bunndyr", "byttedyr for fisk"],
    interactions: ["små børstemarker", "krepsdyr", "sediment", "bunnfisk"],
    tips: ["Sikker identifikasjon krever bunnprøve og mikroskopi; ikke håndter ukjente flerbørstemarker unødvendig."]
  },
  amphipod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"],
    substrate: ["marint sediment"],
    strategy: "Lite amfipodekrepsdyr som lever nær bunnen og utnytter organisk materiale og små næringsobjekter.",
    traits: ["liten leddelt kropp", "sideflat kroppsform", "mange beinpar", "sikker artsbestemmelse krever mikroskopiske detaljer"],
    roles: ["lite krepsdyr", "nedbryter og smådyrspiser", "byttedyr for fisk"],
    interactions: ["organisk materiale", "mikroorganismer", "andre små bunndyr", "bunnfisk"],
    tips: ["Arten påvises i bunnprøver og kan ikke bestemmes sikkert med det blotte øye."]
  },
  tentacle_feeder: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    strategy: "Rør- eller sedimentlevende flerbørstemark som samler organiske partikler med lange føletentakler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lange næringstentakler", "mesteparten av kroppen er skjult", "sikker artsbestemmelse krever børste- og gjellekarakterer"],
    roles: ["partikkelspiser", "sedimentbearbeider", "byttedyr"],
    interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom faglig bunnprøvetaking; dyret er ikke et vanlig synlig strandfunn."]
  }
};

const specs = [
  ["emne_fauna_mendicula_ferruginosa", "Mendicula ferruginosa", "Mendicula ferruginosa", "bivalve"],
  ["emne_fauna_parathyasira_equalis", "Parathyasira equalis", "Parathyasira equalis", "bivalve"],
  ["emne_fauna_nephtys_hystricis", "Nephtys hystricis", "Nephtys hystricis", "polychaete_predator"],
  ["emne_fauna_paramphinome_jeffreysii", "Paramphinome jeffreysii", "Paramphinome jeffreysii", "polychaete_mobile"],
  ["emne_fauna_spiophanes_kroyeri", "Spiophanes kroyeri", "Spiophanes kroyeri", "polychaete_tube"],
  ["emne_fauna_ceratocephale_loveni", "Ceratocephale loveni", "Ceratocephale loveni", "polychaete_mobile"],
  ["emne_fauna_kelliella_miliaris", "Kelliella miliaris", "Kelliella miliaris", "bivalve"],
  ["emne_fauna_prionospio_fallax", "Prionospio fallax", "Prionospio fallax", "polychaete_tube"],
  ["emne_fauna_pseudopolydora_nordica", "Pseudopolydora nordica", "Pseudopolydora nordica", "polychaete_tube"],
  ["emne_fauna_abra_nitida", "Abra nitida", "Abra nitida", "bivalve"],
  ["emne_fauna_abyssoninoe_hibernica", "Abyssoninoe hibernica", "Abyssoninoe hibernica", "polychaete_mobile"],
  ["emne_fauna_diplocirrus_glaucus", "Diplocirrus glaucus", "Diplocirrus glaucus", "tentacle_feeder"],
  ["emne_fauna_eriopisa_elongata", "Eriopisa elongata", "Eriopisa elongata", "amphipod"],
  ["emne_fauna_galathowenia_oculata", "Galathowenia oculata", "Galathowenia oculata", "polychaete_tube"],
  ["emne_fauna_glycera_lapidum", "Glycera lapidum", "Glycera lapidum", "polychaete_predator"],
  ["emne_fauna_levinsenia_gracilis", "Levinsenia gracilis", "Levinsenia gracilis", "polychaete_mobile"],
  ["emne_fauna_pholoe_pallida", "Pholoe pallida", "Pholoe pallida", "polychaete_mobile"],
  ["emne_fauna_thyasira_obsoleta", "Thyasira obsoleta", "Thyasira obsoleta", "bivalve"],
  ["emne_fauna_amythasides_macroglossus", "Amythasides macroglossus", "Amythasides macroglossus", "tentacle_feeder"],
  ["emne_fauna_aricidea_catherinae", "Aricidea catherinae", "Aricidea catherinae", "polychaete_mobile"]
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
    id: spec.id,
    title: spec.title,
    latin: spec.latin,
    taxonomy: {
      norsk_navn: source.norwegianName || null,
      latin_navn: spec.latin,
      klasse: source.class || "Uavklart klasse",
      orden: source.order || "Uavklart orden",
      familie: source.family || "Uavklart familie",
      artskart_taxon_id: Number(source.taxonId)
    },
    habitat: {
      biotop: profile.habitat,
      jord: profile.substrate,
      lys: ["svakt lys til mørke, avhengig av dybde"],
      fukt: ["saltvann"]
    },
    fenologi: {
      aktiv: ["registrert i Åkrafjorden gjennom Artskart"],
      strategi: profile.strategy
    },
    kjennetegn: profile.traits,
    økologi: {
      rolle: profile.roles,
      samspill: profile.interactions
    },
    bykontekst: {
      typiske_steder: ["Åkrafjorden", "marine bløtbunnsprøver"],
      oslo_observert_typisk: "Marint artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden."
    },
    observasjonstips: profile.tips,
    source_urls: [
      `https://artsdatabanken.no/arter/takson/${source.taxonId}`,
      "https://artskart.artsdatabanken.no/",
      "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1"
    ],
    evidence: {
      place_id: "akrafjorden",
      waterbody_code: audit.source.waterBodyCode,
      species_audit: AUDIT_PATH,
      observation_count: source.count,
      earliest_year: source.earliestYear,
      latest_year: source.latestYear,
      precision_min_m: source.minPrecisionM,
      precision_max_m: source.maxPrecisionM
    }
  };
});

assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
assert.equal(new Set(cards.map(card => card.latin)).size, 20);
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_2.json")) {
  manifest.files.push("marine_akrafjorden_batch_2.json");
}
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.ok(place, "Åkrafjorden mangler i naturkartet");
assert.equal(place.published_species_count, 31);
assert.equal(place.remaining_species_level_taxa_count, 230);

const newIds = cards.map(card => card.id);
place.fauna = [...place.fauna, ...newIds];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. De to første kortbatchene omfatter elleve eksisterende fjordfugler, tjue tydelige marine arter og tjue av de mest dokumenterte små bløtbunnsartene. Høyere taxa, samlegrupper og terrestriske kanttreff publiseres ikke som fjordarter.";
place.published_species_batch = 2;
place.published_species_count = 51;
place.remaining_species_level_taxa_count = 210;
place.unmatched_taxa_count = 210;
map.meta.version = "0.12.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

const test = `#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const cards = JSON.parse(fs.readFileSync("${OUT_PATH}", "utf8"));
const batch1 = JSON.parse(fs.readFileSync("data/natur/fauna/marine_akrafjorden_batch_1.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("${MANIFEST_PATH}", "utf8"));
const map = JSON.parse(fs.readFileSync("${MAP_PATH}", "utf8"));
const audit = JSON.parse(fs.readFileSync("${AUDIT_PATH}", "utf8"));

assert.equal(cards.length, 20);
assert.equal(batch1.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
assert.ok(cards.every(card => Number.isInteger(card.taxonomy.artskart_taxon_id)));
assert.ok(cards.every(card => card.evidence.waterbody_code === "NO0260020600-C"));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_2.json"));

const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 2);
assert.equal(place.fauna.length, 51);
assert.equal(place.published_species_count, 51);
assert.equal(place.remaining_species_level_taxa_count, 210);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);

for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) {
  const source = audited.get(card.latin);
  assert.ok(source, card.latin);
  assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId));
  assert.equal(source.rankAssessment.likelySpecies, true);
}

console.log("Etne Åkrafjorden marine species batch 2 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
run("node", ["tests/etne-akrafjorden-marine-species-batch-1.test.js"]);
run("node", ["tests/etne-jettegrytene-nature-rounds.test.js"]);
run("node", ["tests/etne-langfoss-nature-rounds.test.js"]);
run("node", ["tests/etne-skano-nature-rounds.test.js"]);
run("node", ["tests/etne-brattholmen-nature-rounds.test.js"]);
run("node", ["tests/etne-saevareidberget-nature-rounds.test.js"]);
run("node", ["tests/etne-langebudalen-nature-rounds.test.js"]);
run("node", ["tests/etne-fish-species-rounds.test.js"]);
run("node", ["tests/etne-nature-round-content.test.js"]);

console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 2`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 2 full validation OK");
