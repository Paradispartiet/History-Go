#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_4.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-4.test.js";
const BATCH3_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-3.test.js";

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
  polychaete_detritivore: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["organisk rikt marint sediment"],
    light: ["svakt lys til mørke, avhengig av dybde"],
    strategy: "Sedimentlevende flerbørstemark som graver i bunnen og utnytter organisk materiale mellom sedimentpartiklene.",
    traits: ["segmentert kropp", "børster på kroppsleddene", "lever hovedsakelig nedgravd", "sikker artsbestemmelse krever mikroskopiske børste- og leddkarakterer"],
    roles: ["sedimenteter", "bioturbator", "byttedyr for fisk"],
    interactions: ["organisk materiale", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Arten påvises gjennom faglig bunnprøvetaking og kan ikke bestemmes sikkert fra land."]
  },
  polychaete_tube: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    light: ["svakt lys til mørke, avhengig av dybde"],
    strategy: "Rørlevende flerbørstemark som bygger eller bor i et sedimentrør og samler næringspartikler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lever hovedsakelig skjult i rør", "børster, gjeller og hodevedheng skiller artene", "mikroskopi er nødvendig"],
    roles: ["rørbyggende bunndyr", "sedimentstabilisator", "partikkelspiser"],
    interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom standardiserte bunnprøver; rør og dyr skal ikke samles tilfeldig."]
  },
  polychaete_predator: {
    habitat: ["fjordens sedimentbunn", "mudder-, sand- og blandingsbunn"],
    substrate: ["marint sediment"],
    light: ["svakt lys til mørke, avhengig av dybde"],
    strategy: "Bevegelig flerbørstemark som søker etter smådyr i sedimentet og inngår i det bentiske rovdyrsamfunnet.",
    traits: ["segmentert kropp", "tydelige børster", "bevegelig hodeparti", "kjeve- og børstekarakterer krever mikroskopi"],
    roles: ["lite bentisk rovdyr", "sedimentlevende bunndyr", "byttedyr for fisk"],
    interactions: ["små børstemarker", "krepsdyr", "sediment", "bunnfisk"],
    tips: ["Sikker identifikasjon krever bunnprøve og mikroskopi."]
  },
  polychaete_tentacle: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    light: ["svakt lys til mørke, avhengig av dybde"],
    strategy: "Rør- eller sedimentlevende flerbørstemark som samler organiske partikler med lange tentakler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lange næringstentakler", "mesteparten av kroppen er skjult", "børste- og gjellekarakterer brukes ved sikker artsbestemmelse"],
    roles: ["partikkelspiser", "sedimentbearbeider", "byttedyr"],
    interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom faglig bunnprøvetaking; dyret er ikke et vanlig synlig strandfunn."]
  },
  copepod: {
    habitat: ["fjordens frie vannmasser", "planktonlaget"],
    substrate: ["pelagisk"],
    light: ["varierer gjennom vannsøylen og døgnet"],
    strategy: "Liten hoppekreps som lever som dyreplankton og beiter på mikroplankton eller mindre partikler i vannmassene.",
    traits: ["svært liten leddelt kropp", "lange antenner", "rykkvis svømming", "sikker artsbestemmelse krever planktonprøve og mikroskopi"],
    roles: ["dyreplankton", "energioverføring i næringsnettet", "bytte for fiskelarver og planktonspisende fisk"],
    interactions: ["planteplankton", "mikroplankton", "fiskelarver", "stimfisk"],
    tips: ["Arten kan ikke observeres som enkeltindivid fra land; dokumentasjon krever planktonhåv og mikroskopi."]
  },
  appendicularian: {
    habitat: ["fjordens frie vannmasser", "planktonlaget"],
    substrate: ["pelagisk"],
    light: ["varierer gjennom vannsøylen"],
    strategy: "Lite planktonisk halesekkdyr som filtrerer vann gjennom et slimhus og fanger svært små næringspartikler.",
    traits: ["gjennomsiktig kropp", "tydelig hale", "lever inne i et skjørt slimhus", "sikker artsbestemmelse krever planktonprøve og mikroskopi"],
    roles: ["filterspisende dyreplankton", "produsent av synkende organisk materiale", "bytte for planktonspisere"],
    interactions: ["mikroplankton", "organiske partikler", "fiskelarver", "andre planktondyr"],
    tips: ["Slimhuset ødelegges lett; arten dokumenteres best i ferske planktonprøver og er ikke synlig fra land."]
  },
  amphipod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"],
    substrate: ["marint sediment"],
    light: ["svakt lys til mørke, avhengig av dybde"],
    strategy: "Lite amfipodekrepsdyr som lever nær bunnen og utnytter organisk materiale og små næringsobjekter.",
    traits: ["liten leddelt kropp", "sideflat kroppsform", "mange beinpar", "mikroskopiske detaljer skiller artene"],
    roles: ["lite krepsdyr", "nedbryter og smådyrspiser", "byttedyr for fisk"],
    interactions: ["organisk materiale", "mikroorganismer", "andre små bunndyr", "bunnfisk"],
    tips: ["Påvises i faglige bunnprøver; sikker bestemmelse krever mikroskopi."]
  },
  shell_less_mollusk: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    light: ["svakt lys til mørke, avhengig av dybde"],
    strategy: "Ormelignende, skalløst bløtdyr som lever nede i sedimentet og inngår i den småvokste bunnfaunaen.",
    traits: ["langstrakt ormelignende kropp", "mangler synlig skall", "små kalkspikler i kroppsveggen", "sikker artsbestemmelse krever spesialkarakterer og mikroskopi"],
    roles: ["sedimentlevende bløtdyr", "del av bløtbunnssamfunnet", "byttedyr"],
    interactions: ["sediment", "mikroorganismer", "små bunndyr", "bunnfisk"],
    tips: ["Arten er ikke synlig fra land og påvises gjennom faglig prøvetaking."]
  },
  bivalve: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["finkornet marint sediment"],
    light: ["svakt lys til mørke, avhengig av dybde"],
    strategy: "Liten marin musling som lever helt eller delvis nedgravd og tar opp næring fra vannet eller sedimentoverflaten.",
    traits: ["to skallhalvdeler", "liten bløtbunnsmusling", "lever skjult i sedimentet", "sikker artsbestemmelse krever skallkarakterer og mikroskopi"],
    roles: ["bløtbunnsorganisme", "del av det bentiske næringsnettet", "byttedyr for fisk og større bunndyr"],
    interactions: ["organiske partikler", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Arten påvises gjennom faglig bunnprøvetaking og kan ikke bestemmes sikkert fra land."]
  }
};

const specs = [
  ["emne_fauna_capitella_capitata", "Capitella capitata", "Capitella capitata", "polychaete_detritivore"],
  ["emne_fauna_eclysippe_eliasoni", "Eclysippe eliasoni", "Eclysippe eliasoni", "polychaete_tube"],
  ["emne_fauna_eclysippe_vanelli", "Eclysippe vanelli", "Eclysippe vanelli", "polychaete_tube"],
  ["emne_fauna_falcidens_crossotus", "Falcidens crossotus", "Falcidens crossotus", "shell_less_mollusk"],
  ["emne_fauna_fritillaria_borealis", "Fritillaria borealis", "Fritillaria borealis", "appendicularian"],
  ["emne_fauna_krolleorm", "Krølleorm", "Goniada maculata", "polychaete_predator"],
  ["emne_fauna_lumbrineris_cingulata", "Lumbrineris cingulata", "Lumbrineris cingulata", "polychaete_predator"],
  ["emne_fauna_microcalanus_pusillus", "Microcalanus pusillus", "Microcalanus pusillus", "copepod"],
  ["emne_fauna_microsetella_norvegica", "Microsetella norvegica", "Microsetella norvegica", "copepod"],
  ["emne_fauna_nereimyra_punctata", "Nereimyra punctata", "Nereimyra punctata", "polychaete_predator"],
  ["emne_fauna_nicippe_tumida", "Nicippe tumida", "Nicippe tumida", "amphipod"],
  ["emne_fauna_notomastus_latericeus", "Notomastus latericeus", "Notomastus latericeus", "polychaete_detritivore"],
  ["emne_fauna_paradiopatra_quadricuspis", "Paradiopatra quadricuspis", "Paradiopatra quadricuspis", "polychaete_tube"],
  ["emne_fauna_pista_cristata", "Pista cristata", "Pista cristata", "polychaete_tentacle"],
  ["emne_fauna_polycirrus_plumosus", "Polycirrus plumosus", "Polycirrus plumosus", "polychaete_tentacle"],
  ["emne_fauna_prionospio_cirrifera", "Prionospio cirrifera", "Prionospio cirrifera", "polychaete_tube"],
  ["emne_fauna_scalibregma_inflatum", "Scalibregma inflatum", "Scalibregma inflatum", "polychaete_detritivore"],
  ["emne_fauna_streblosoma_bairdi", "Streblosoma bairdi", "Streblosoma bairdi", "polychaete_tentacle"],
  ["emne_fauna_adontorhina_similis", "Adontorhina similis", "Adontorhina similis", "bivalve"],
  ["emne_fauna_anobothrus_laubieri", "Anobothrus laubieri", "Anobothrus laubieri", "polychaete_tube"]
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
      norsk_navn: source.norwegianName || (spec.title !== spec.latin ? spec.title : null),
      latin_navn: spec.latin,
      klasse: source.class || "Uavklart klasse",
      orden: source.order || "Uavklart orden",
      familie: source.family || "Uavklart familie",
      artskart_taxon_id: Number(source.taxonId)
    },
    habitat: {
      biotop: profile.habitat,
      jord: profile.substrate,
      lys: profile.light,
      fukt: ["saltvann"]
    },
    fenologi: {
      aktiv: ["registrert i Åkrafjorden gjennom Artskart"],
      strategi: profile.strategy
    },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
    bykontekst: {
      typiske_steder: ["Åkrafjorden", spec.profile === "copepod" || spec.profile === "appendicularian" ? "marine planktonprøver" : "marine bløtbunnsprøver"],
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
if (!manifest.files.includes("marine_akrafjorden_batch_4.json")) manifest.files.push("marine_akrafjorden_batch_4.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 3);
assert.equal(place.published_species_count, 71);
assert.equal(place.remaining_species_level_taxa_count, 190);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Fire kortbatcher omfatter nå elleve eksisterende fjordfugler og åtti marine arter, inkludert fisk, sjøpattedyr, plankton og små bløtbunnsdyr. Høyere taxa, samlegrupper og terrestriske kanttreff publiseres ikke som fjordarter.";
place.published_species_batch = 4;
place.published_species_count = 91;
place.remaining_species_level_taxa_count = 170;
place.unmatched_taxa_count = 170;
map.meta.version = "0.14.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let batch3Test = await fs.readFile(path.join(ROOT, BATCH3_TEST_PATH), "utf8");
batch3Test = batch3Test
  .replace('assert.equal(place.published_species_batch, 3);', 'assert.ok(place.published_species_batch >= 3);')
  .replace('assert.equal(place.fauna.length, 71);', 'assert.ok(place.fauna.length >= 71);')
  .replace('assert.equal(place.published_species_count, 71);', 'assert.ok(place.published_species_count >= 71);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 190);', 'assert.ok(place.remaining_species_level_taxa_count <= 190);');
assert.ok(batch3Test.includes('assert.ok(place.published_species_batch >= 3);'));
assert.ok(batch3Test.includes('assert.ok(place.fauna.length >= 71);'));
assert.ok(batch3Test.includes('assert.ok(place.published_species_count >= 71);'));
assert.ok(batch3Test.includes('assert.ok(place.remaining_species_level_taxa_count <= 190);'));
await writeText(BATCH3_TEST_PATH, batch3Test);

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
assert.ok(manifest.files.includes("marine_akrafjorden_batch_4.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 4);
assert.equal(place.fauna.length, 91);
assert.equal(place.published_species_count, 91);
assert.equal(place.remaining_species_level_taxa_count, 170);
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
console.log("Etne Åkrafjorden marine species batch 4 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
run("node", ["tests/etne-akrafjorden-marine-species-batch-3.test.js"]);
run("node", ["tests/etne-akrafjorden-marine-species-batch-2.test.js"]);
run("node", ["tests/etne-akrafjorden-marine-species-batch-1.test.js"]);
run("node", ["tests/etne-jettegrytene-nature-rounds.test.js"]);
run("node", ["tests/etne-langfoss-nature-rounds.test.js"]);
run("node", ["tests/etne-skano-nature-rounds.test.js"]);
run("node", ["tests/etne-brattholmen-nature-rounds.test.js"]);
run("node", ["tests/etne-saevareidberget-nature-rounds.test.js"]);
run("node", ["tests/etne-langebudalen-nature-rounds.test.js"]);
run("node", ["tests/etne-fish-species-rounds.test.js"]);
run("node", ["tests/etne-nature-round-content.test.js"]);

console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 4`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 4 full validation OK");
