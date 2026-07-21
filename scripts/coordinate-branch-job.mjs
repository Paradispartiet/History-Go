#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_3.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-3.test.js";
const BATCH2_TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-2.test.js";

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
    strategy: "Liten marin musling som lever helt eller delvis nedgravd og tar opp næring fra vannet eller sedimentoverflaten.",
    traits: ["to skallhalvdeler", "liten bløtbunnsmusling", "lever skjult i sedimentet", "sikker artsbestemmelse krever skallkarakterer og mikroskopi"],
    roles: ["bløtbunnsorganisme", "del av det bentiske næringsnettet", "byttedyr for fisk og større bunndyr"],
    interactions: ["organiske partikler", "mikroorganismer", "sediment", "bunnfisk"],
    tips: ["Arten påvises gjennom faglig bunnprøvetaking og kan ikke bestemmes sikkert fra land."]
  },
  polychaete_mobile: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"],
    substrate: ["marint sediment"],
    strategy: "Marin flerbørstemark som beveger seg i eller på sedimentet og utnytter små næringsobjekter eller organisk materiale.",
    traits: ["segmentert kropp", "børster på kroppsleddene", "hode- og børstekarakterer skiller artene", "sikker bestemmelse krever mikroskopi"],
    roles: ["sedimentlevende bunndyr", "bioturbator", "byttedyr for fisk"],
    interactions: ["sediment", "organiske partikler", "små bunndyr", "bunnfisk"],
    tips: ["Dokumentasjonen kommer fra faglige bunnprøver; vanlig foto er ikke nok til sikker artsbestemmelse."]
  },
  polychaete_tube: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    strategy: "Rørlevende flerbørstemark som bygger eller bor i sedimentrør og samler små partikler ved bunnoverflaten.",
    traits: ["segmentert kropp", "lever hovedsakelig skjult i rør", "børster og hodevedheng brukes i artsbestemmelsen", "mikroskopi er nødvendig"],
    roles: ["rørbyggende bunndyr", "sedimentstabilisator", "partikkelspiser"],
    interactions: ["organiske partikler", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Påvises gjennom standardiserte bunnprøver; rør og dyr skal ikke samles tilfeldig."]
  },
  polychaete_predator: {
    habitat: ["fjordens sedimentbunn", "mudder-, sand- og blandingsbunn"],
    substrate: ["marint sediment"],
    strategy: "Bevegelig flerbørstemark som søker smådyr i sedimentet og deltar i det bentiske rovdyrsamfunnet.",
    traits: ["segmentert kropp", "tydelige børster", "bevegelig hodeparti", "kjeve- og børstekarakterer krever mikroskopi"],
    roles: ["lite bentisk rovdyr", "sedimentlevende bunndyr", "byttedyr for fisk"],
    interactions: ["små børstemarker", "krepsdyr", "sediment", "bunnfisk"],
    tips: ["Sikker identifikasjon krever bunnprøve og mikroskopi."]
  },
  cumacean: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    strategy: "Lite cumacekrepsdyr som lever nær eller delvis nede i sedimentet og utnytter små organiske partikler.",
    traits: ["lite krepsdyr", "forstørret framkropp og smal bakkropp", "mange små lemmer", "sikker artsbestemmelse krever mikroskopi"],
    roles: ["lite bentisk krepsdyr", "partikkelspiser", "byttedyr for fisk"],
    interactions: ["organisk materiale", "sediment", "mikroorganismer", "bunnfisk"],
    tips: ["Arten påvises i bunnprøver og kan ikke bestemmes sikkert med det blotte øye."]
  },
  amphipod: {
    habitat: ["fjordens bløtbunn", "mudder- og sandblandet sediment"],
    substrate: ["marint sediment"],
    strategy: "Lite amfipodekrepsdyr som lever nær bunnen og utnytter organisk materiale og små næringsobjekter.",
    traits: ["liten leddelt kropp", "sideflat kroppsform", "mange beinpar", "mikroskopiske detaljer skiller artene"],
    roles: ["lite krepsdyr", "nedbryter og smådyrspiser", "byttedyr for fisk"],
    interactions: ["organisk materiale", "mikroorganismer", "andre små bunndyr", "bunnfisk"],
    tips: ["Påvises i faglige bunnprøver; sikker bestemmelse krever mikroskopi."]
  },
  shell_less_mollusk: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    strategy: "Ormelignende, skalløst bløtdyr som lever nede i sedimentet og inngår i den småvokste bunnfaunaen.",
    traits: ["langstrakt ormelignende kropp", "mangler synlig skall", "små kalkspikler i kroppsveggen", "sikker artsbestemmelse krever mikroskopi og spesialkarakterer"],
    roles: ["sedimentlevende bløtdyr", "del av bløtbunnssamfunnet", "byttedyr"],
    interactions: ["sediment", "mikroorganismer", "små bunndyr", "bunnfisk"],
    tips: ["Arten er ikke synlig fra land og påvises gjennom faglig prøvetaking."]
  },
  sipunculan: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    strategy: "Liten sipunkulide som lever skjult i sedimentet og samler organisk materiale med en inn- og utvrengbar framkropp.",
    traits: ["usegmentert kropp", "innvrengbar framkropp", "lever skjult i sedimentet", "mikroskopiske karakterer brukes ved artsbestemmelse"],
    roles: ["sedimentlevende bunndyr", "partikkelspiser", "bioturbator"],
    interactions: ["organiske partikler", "sediment", "mikroorganismer"],
    tips: ["Påvises i bunnprøver; levende dyr skal ikke samles uten faglig formål."]
  },
  brittle_star: {
    habitat: ["fjordbunn", "stein-, sand- og mudderbunn"],
    substrate: ["marint bunnsubstrat"],
    strategy: "Liten slangestjerne som beveger seg med de lange armene og tar små næringspartikler eller smådyr ved bunnen.",
    traits: ["rund sentralskive", "fem lange tydelig leddelte armer", "skjør kroppsbygning", "kan være svært liten"],
    roles: ["bunndyr", "partikkel- og smådyrspiser", "byttedyr"],
    interactions: ["organiske partikler", "små bunndyr", "bunnfisk"],
    tips: ["Dvergslangestjerne påvises oftest i bunnprøver; håndter den ikke unødvendig fordi armene er skjøre."]
  },
  generic_soft_bottom: {
    habitat: ["fjordens bløtbunn", "mudder- og finsandbunn"],
    substrate: ["marint sediment"],
    strategy: "Lite marint virvelløst dyr som lever i eller på sedimentet og inngår i fjordens bentiske næringsnett.",
    traits: ["småvokst bunnorganisme", "lever hovedsakelig skjult i sedimentet", "artsbestemmelse bygger på spesialiserte anatomiske karakterer", "mikroskopi er nødvendig"],
    roles: ["bløtbunnsorganisme", "del av bentisk stoffomsetning", "byttedyr"],
    interactions: ["sediment", "organisk materiale", "mikroorganismer", "bunnfisk"],
    tips: ["Arten påvises gjennom faglig bunnprøvetaking og kan ikke bestemmes sikkert i felt uten spesialkunnskap."]
  }
};

const specs = [
  ["emne_fauna_heteromastus_filiformis", "Heteromastus filiformis", "Heteromastus filiformis", "polychaete_mobile"],
  ["emne_fauna_scutopus_ventrolineatus", "Scutopus ventrolineatus", "Scutopus ventrolineatus", "shell_less_mollusk"],
  ["emne_fauna_tellimya_tenella", "Tellimya tenella", "Tellimya tenella", "bivalve"],
  ["emne_fauna_axinulus_croulinensis", "Axinulus croulinensis", "Axinulus croulinensis", "bivalve"],
  ["emne_fauna_boudemos_ardabilia", "Boudemos ardabilia", "Boudemos ardabilia", "generic_soft_bottom"],
  ["emne_fauna_diastyloides_biplicata", "Diastyloides biplicata", "Diastyloides biplicata", "cumacean"],
  ["emne_fauna_eudorella_emarginata", "Eudorella emarginata", "Eudorella emarginata", "cumacean"],
  ["emne_fauna_nephtys_paradoxa", "Nephtys paradoxa", "Nephtys paradoxa", "polychaete_predator"],
  ["emne_fauna_nucula_tumidula", "Nucula tumidula", "Nucula tumidula", "bivalve"],
  ["emne_fauna_oediceropsis_brevicornis", "Oediceropsis brevicornis", "Oediceropsis brevicornis", "amphipod"],
  ["emne_fauna_onchnesoma_steenstrupi", "Onchnesoma steenstrupi", "Onchnesoma steenstrupi", "sipunculan"],
  ["emne_fauna_ophryotrocha_scutellus", "Ophryotrocha scutellus", "Ophryotrocha scutellus", "polychaete_mobile"],
  ["emne_fauna_sosane_wahrbergi", "Sosane wahrbergi", "Sosane wahrbergi", "polychaete_tube"],
  ["emne_fauna_westwoodilla_caecula", "Westwoodilla caecula", "Westwoodilla caecula", "amphipod"],
  ["emne_fauna_amaeana_trilobata", "Amaeana trilobata", "Amaeana trilobata", "polychaete_tube"],
  ["emne_fauna_exogone_verugera", "Exogone verugera", "Exogone verugera", "polychaete_mobile"],
  ["emne_fauna_praxillella_affinis", "Praxillella affinis", "Praxillella affinis", "polychaete_tube"],
  ["emne_fauna_streblosoma_intestinale", "Streblosoma intestinale", "Streblosoma intestinale", "polychaete_tube"],
  ["emne_fauna_yoldiella_philippiana", "Yoldiella philippiana", "Yoldiella philippiana", "bivalve"],
  ["emne_fauna_dvergslangestjerne", "Dvergslangestjerne", "Amphipholis squamata", "brittle_star"]
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
      lys: ["svakt lys til mørke, avhengig av dybde"],
      fukt: ["saltvann"]
    },
    fenologi: {
      aktiv: ["registrert i Åkrafjorden gjennom Artskart"],
      strategi: profile.strategy
    },
    kjennetegn: profile.traits,
    økologi: { rolle: profile.roles, samspill: profile.interactions },
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
await writeJson(OUT_PATH, cards);

const manifest = await readJson(MANIFEST_PATH);
if (!manifest.files.includes("marine_akrafjorden_batch_3.json")) manifest.files.push("marine_akrafjorden_batch_3.json");
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
const place = map.places.akrafjorden;
assert.equal(place.published_species_count, 51);
assert.equal(place.remaining_species_level_taxa_count, 210);
place.fauna = [...place.fauna, ...cards.map(card => card.id)];
place.documentation = "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen beholdt 1 093 presise observasjoner innenfor den eksakte fjordpolygonen. Tre kortbatcher omfatter nå elleve eksisterende fjordfugler og seksti marine arter, inkludert fisk, sjøpattedyr, plankton og små bløtbunnsdyr. Høyere taxa, samlegrupper og terrestriske kanttreff publiseres ikke som fjordarter.";
place.published_species_batch = 3;
place.published_species_count = 71;
place.remaining_species_level_taxa_count = 190;
place.unmatched_taxa_count = 190;
map.meta.version = "0.13.0";
map.meta.updatedAt = "2026-07-21";
await writeJson(MAP_PATH, map);

let batch2Test = await fs.readFile(path.join(ROOT, BATCH2_TEST_PATH), "utf8");
batch2Test = batch2Test
  .replace('assert.equal(place.fauna.length, 51);', 'assert.ok(place.fauna.length >= 51);')
  .replace('assert.equal(place.published_species_count, 51);', 'assert.ok(place.published_species_count >= 51);')
  .replace('assert.equal(place.remaining_species_level_taxa_count, 210);', 'assert.ok(place.remaining_species_level_taxa_count <= 210);');
assert.ok(batch2Test.includes('assert.ok(place.fauna.length >= 51);'));
assert.ok(batch2Test.includes('assert.ok(place.published_species_count >= 51);'));
assert.ok(batch2Test.includes('assert.ok(place.remaining_species_level_taxa_count <= 210);'));
await writeText(BATCH2_TEST_PATH, batch2Test);

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
assert.ok(manifest.files.includes("marine_akrafjorden_batch_3.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 3);
assert.equal(place.fauna.length, 71);
assert.equal(place.published_species_count, 71);
assert.equal(place.remaining_species_level_taxa_count, 190);
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
console.log("Etne Åkrafjorden marine species batch 3 OK");
`;
await writeText(TEST_PATH, test);

run("npx", ["tsx", "tools/validate_nature_maps.mts"]);
run("node", [TEST_PATH]);
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

console.log(`Skrev ${cards.length} nye Åkrafjorden-kort i batch 3`);
console.log(`Åkrafjorden-rundingen har nå ${place.fauna.length} fauna-arter`);
console.log("Åkrafjorden marine species batch 3 full validation OK");
