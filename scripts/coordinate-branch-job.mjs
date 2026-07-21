#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const ROOT = process.cwd();
const AUDIT_PATH = "reports/etne-natur-batch-9-akrafjorden-artskart.json";
const OUT_PATH = "data/natur/fauna/marine_akrafjorden_batch_1.json";
const MANIFEST_PATH = "data/natur/fauna/manifest.json";
const MAP_PATH = "data/natur/nature_etne_place_map.json";
const TEST_PATH = "tests/etne-akrafjorden-marine-species-batch-1.test.js";

const readJson = async rel => JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8"));
const writeJson = async (rel, value) => {
  await fs.mkdir(path.dirname(path.join(ROOT, rel)), { recursive: true });
  await fs.writeFile(path.join(ROOT, rel), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const writeText = async (rel, value) => {
  await fs.mkdir(path.dirname(path.join(ROOT, rel)), { recursive: true });
  await fs.writeFile(path.join(ROOT, rel), value.endsWith("\n") ? value : `${value}\n`, "utf8");
};

const specs = [
  {
    id: "emne_fauna_glassvar",
    title: "Glassvar",
    latin: "Lepidorhombus whiffiagonis",
    habitat: ["dypere fjord- og kystvann", "sand-, grus- og mudderbunn"],
    substrate: ["bløtbunn og blandingsbunn"],
    strategy: "Bunnlevende flatfisk som ligger nær sedimentet og tar småfisk og bunndyr.",
    traits: ["flat og avlang kropp", "begge øyne på samme kroppsside", "stor munn", "lys brunlig overside"],
    roles: ["bunnlevende rovfisk", "del av fjordens fiskesamfunn"],
    interactions: ["småfisk", "krepsdyr", "bløtbunn"],
    tips: ["Arten sees sjelden fra land; registreringer kommer vanligvis fra fiske eller marine undersøkelser."]
  },
  {
    id: "emne_fauna_sandflyndre",
    title: "Sandflyndre",
    latin: "Limanda limanda",
    habitat: ["grunt og middels dypt kyst- og fjordvann", "sand- og grusbunn"],
    substrate: ["sandbunn", "grusbunn"],
    strategy: "Flatfisk som kamuflerer seg mot bunnen og leter etter små bunndyr.",
    traits: ["ru overside", "buet sidelinje over brystfinnen", "flat oval kropp", "brunlig overside"],
    roles: ["bunndyrspiser", "bytte for større fisk og sjøfugl"],
    interactions: ["børstemark", "små krepsdyr", "sandbunn"],
    tips: ["Arten ligger på bunnen og er vanskelig å oppdage uten prøvetaking eller fiske."]
  },
  {
    id: "emne_fauna_skrubbe",
    title: "Skrubbe",
    latin: "Platichthys flesus",
    habitat: ["grunt fjordvann", "brakkvann", "elveos og poller"],
    substrate: ["sand", "mudder", "grus"],
    strategy: "Tåler store variasjoner i saltholdighet og kan vandre mellom fjord, brakkvann og nedre deler av elver.",
    traits: ["flat kropp", "ru beinknuter langs sidelinjen", "brungrønn overside", "lys underside"],
    roles: ["bunndyrspiser", "forbinder fjord og elveos"],
    interactions: ["børstemark", "muslinger", "små krepsdyr", "brakkvann"],
    tips: ["Se etter flatfiskspor på svært grunt sand- eller mudderområde, men ikke gå ut i sårbar bløtbunn."]
  },
  {
    id: "emne_fauna_nise",
    title: "Nise",
    latin: "Phocoena phocoena",
    habitat: ["fjord", "kystvann", "åpent hav"],
    substrate: ["frie vannmasser"],
    strategy: "Liten tannhval som finner fisk med ekkolokalisering og ofte opptrer alene eller i små grupper.",
    traits: ["kort og butt hodeprofil", "liten trekantet ryggfinne", "mørk grå rygg", "rolig rullende bevegelse i overflaten"],
    roles: ["rovpattedyr", "fiskespiser"],
    interactions: ["små stimfisk", "fjordens frie vannmasser"],
    tips: ["Se etter en lav, rullende rygg og liten trekantet finne; hold god avstand med båt og ikke forfølg dyret."]
  },
  {
    id: "emne_fauna_lange",
    title: "Lange",
    latin: "Molva molva",
    habitat: ["dypere fjord", "bratte undersjøiske skråninger", "stein- og blandingsbunn"],
    substrate: ["stein", "berg", "blandingsbunn"],
    strategy: "Langstrakt rovfisk som lever nær bunnen og tar fisk, krepsdyr og andre bunndyr.",
    traits: ["svært lang kropp", "skjeggtråd under haken", "to ryggfinner", "marmorert brungrå farge"],
    roles: ["bunnnær rovfisk", "større fjordfisk"],
    interactions: ["fisk", "krepsdyr", "dype fjordpartier"],
    tips: ["Lange observeres vanligvis gjennom fiske eller marine undersøkelser, ikke fra land."]
  },
  {
    id: "emne_fauna_grov_mudderslangestjerne",
    title: "Grov mudderslangestjerne",
    latin: "Amphiura chiajei",
    habitat: ["fjordens bløtbunn", "mudderbunn på dypere vann"],
    substrate: ["mudder", "finkornet sediment"],
    strategy: "Ligger nedgravd med deler av armene over sedimentet og samler små næringspartikler.",
    traits: ["liten sentralskive", "fem lange smale armer", "bevegelige ledd i armene", "skjult liv i sedimentet"],
    roles: ["sedimentlevende bunndyr", "partikkel- og smådyrspiser", "byttedyr for fisk"],
    interactions: ["organiske partikler", "mudderbunn", "bunnfisk"],
    tips: ["Arten krever bunnprøve for sikker observasjon; ikke grav i bløtbunnen for å lete etter den."]
  },
  {
    id: "emne_fauna_lyresjomus",
    title: "Lyresjømus",
    latin: "Brissopsis lyrifera",
    habitat: ["mudder- og sandblandet fjordbunn", "dypere bløtbunn"],
    substrate: ["mudder", "sandholdig mudder"],
    strategy: "Uregelmessig sjøpiggsvin som graver seg gjennom sedimentet og utnytter organisk materiale.",
    traits: ["oval til svakt hjerteformet kropp", "korte pigger", "bladlignende mønster på oversiden", "lever nedgravd"],
    roles: ["bioturbator", "sedimenteter", "del av bløtbunnssamfunnet"],
    interactions: ["organisk materiale", "sediment", "mikroorganismer"],
    tips: ["Påvises i bunnprøver; levende dyr skal legges tilbake dersom de håndteres i en faglig undersøkelse."]
  },
  {
    id: "emne_fauna_raudaate",
    title: "Raudåte",
    latin: "Calanus finmarchicus",
    habitat: ["frie vannmasser i fjord og hav", "planktonlaget"],
    substrate: ["pelagisk"],
    strategy: "Hoppekreps som beiter på planteplankton og lagrer energi i en oljerik kropp før dypere overvintring.",
    traits: ["noen få millimeter lang", "gjennomsiktig til rødlig kropp", "lange antenner", "synlig fettsekk hos godt ernærte dyr"],
    roles: ["dyreplankton", "nøkkelbytte for fisk", "energioverføring fra planteplankton"],
    interactions: ["planteplankton", "brisling", "sild", "fiskelarver"],
    tips: ["Raudåte kan bare studeres ordentlig med planktonhåv eller prøve; den er ikke synlig som enkeltindivid fra land."]
  },
  {
    id: "emne_fauna_brisling",
    title: "Brisling",
    latin: "Sprattus sprattus",
    habitat: ["fjord", "kystvann", "frie vannmasser"],
    substrate: ["pelagisk"],
    strategy: "Liten stimfisk som følger planktonproduksjonen og samler seg i tette stimer.",
    traits: ["liten sølvblank fisk", "mørkere rygg", "skarpe bukskjell", "underkjeven stikker noe fram"],
    roles: ["planktonspiser", "viktig byttefisk", "stimfisk"],
    interactions: ["dyreplankton", "sjøfugl", "rovfisk", "nise"],
    tips: ["Se etter tette småfiskstimer og jaktende sjøfugl; enkeltarten må ofte bekreftes gjennom fangst eller faglig registrering."]
  },
  {
    id: "emne_fauna_buet_kamborstemark",
    title: "Buet kambørstemark",
    latin: "Amphictene auricoma",
    habitat: ["sand- og mudderbunn i fjord", "bløtbunn"],
    substrate: ["sand", "fint sediment"],
    strategy: "Rørbyggende flerbørstemark som lever i et konisk rør av sammenkittede sandkorn.",
    traits: ["konisk sandrør", "kam av kraftige børster ved hodet", "segmentert kropp", "mest skjult i sedimentet"],
    roles: ["rørbyggende bunndyr", "sedimentbearbeider", "byttedyr"],
    interactions: ["sandkorn", "organiske partikler", "bunnfisk"],
    tips: ["Tomt eller levende sandrør kan finnes i bunnprøver; ikke samle prøver uten faglig formål og nødvendige tillatelser."]
  },
  {
    id: "emne_fauna_langarmet_slangestjerne",
    title: "Langarmet slangestjerne",
    latin: "Amphilepis norvegica",
    habitat: ["dypere fjordbunn", "mudder- og finsandbunn"],
    substrate: ["finkornet sediment"],
    strategy: "Liten slangestjerne som lever på eller delvis i sedimentet og bruker de lange armene til bevegelse og næringssøk.",
    traits: ["liten rund sentralskive", "fem svært lange tynne armer", "tydelige armledd", "skjør kroppsbygning"],
    roles: ["bunndyr", "partikkel- og smådyrspiser", "byttedyr"],
    interactions: ["sediment", "små organismer", "bunnfisk"],
    tips: ["Arten påvises med bunnprøve og skal ikke letes fram ved tilfeldig graving i sedimentet."]
  },
  {
    id: "emne_fauna_brosme",
    title: "Brosme",
    latin: "Brosme brosme",
    habitat: ["dypere fjord", "stein- og bergbunn", "undersjøiske skråninger"],
    substrate: ["stein", "berg", "grov blandingsbunn"],
    strategy: "Bunnnær torskefisk som søker skjul i steinrik bunn og tar fisk og større bunndyr.",
    traits: ["kraftig langstrakt kropp", "én lang sammenhengende ryggfinne", "skjeggtråd under haken", "avrundet halefinne"],
    roles: ["bunnnær rovfisk", "større fjordfisk"],
    interactions: ["fisk", "krepsdyr", "steinbunn"],
    tips: ["Brosme registreres vanligvis gjennom fiske eller marine undersøkelser; bruk artsbestemmelse og fangstregler korrekt."]
  },
  {
    id: "emne_fauna_sild",
    title: "Sild",
    latin: "Clupea harengus",
    habitat: ["fjord", "kystvann", "åpent hav"],
    substrate: ["pelagisk"],
    strategy: "Stimfisk som filtrerer og fanger plankton og gjennomfører sesongvise vandringer mellom beite- og gyteområder.",
    traits: ["sølvblank kropp", "mørk blågrønn rygg", "tynn kropp", "stor stimdannelse"],
    roles: ["planktonspiser", "nøkkelart som byttefisk", "stimfisk"],
    interactions: ["dyreplankton", "rovfisk", "sjøfugl", "sjøpattedyr"],
    tips: ["Stimer kan avsløres av uro i vannet og jaktende fugl, men sikker artsbestemmelse krever nærmere observasjon."]
  },
  {
    id: "emne_fauna_havmus",
    title: "Havmus",
    latin: "Chimaera monstrosa",
    habitat: ["dypere fjord- og havbunn", "bløtbunn og blandingsbunn"],
    substrate: ["mudder", "sand", "blandingsbunn"],
    strategy: "Bruskfisk som søker nær bunnen etter muslinger, krepsdyr og andre harde eller myke bunndyr.",
    traits: ["stort hode", "store brystfinner", "lang piskformet hale", "kraftig pigg foran ryggfinnen"],
    roles: ["bunnnær rovfisk", "bruskfisk"],
    interactions: ["muslinger", "krepsdyr", "børstemark"],
    tips: ["Arten sees normalt bare i fangst eller undervannsundersøkelser; ryggpiggen kan skade og dyret skal ikke håndteres unødvendig."]
  },
  {
    id: "emne_fauna_norsk_storkrill",
    title: "Norsk storkrill",
    latin: "Meganyctiphanes norvegica",
    habitat: ["fjordens og havets frie vannmasser", "dypere vann på dagtid"],
    substrate: ["pelagisk"],
    strategy: "Krill som ofte vandrer oppover i vannmassene om natten og danner tette ansamlinger.",
    traits: ["rekelignende kropp", "store mørke øyne", "lysorganer", "flere centimeter lang"],
    roles: ["planktondyr", "viktig bytte for fisk og sjøpattedyr", "vertikal vandrer"],
    interactions: ["plankton", "sild", "makrell", "hval"],
    tips: ["Enkeltindivider ses sjelden fra land; arten registreres med ekkolodd, planktonredskap eller mageprøver."]
  },
  {
    id: "emne_fauna_blaaskjell",
    title: "Blåskjell",
    latin: "Mytilus edulis",
    habitat: ["fjæresone", "grunt fjordvann", "stein, berg og menneskeskapte flater"],
    substrate: ["fast underlag"],
    strategy: "Filtrerer mikroskopiske partikler fra vannet og fester seg med sterke byssustråder.",
    traits: ["blåsvart avlangt skall", "to like skallhalvdeler", "fester seg i klynger", "mørke byssustråder"],
    roles: ["filtrerer", "habitatbygger", "byttedyr"],
    interactions: ["planteplankton", "sjøstjerner", "ærfugl", "krabber"],
    tips: ["Se på stein og brygger i fjæresonen uten å rive løs kolonier. Ikke spis skjell uten å kontrollere offentlige kostholdsråd."]
  },
  {
    id: "emne_fauna_hvitting",
    title: "Hvitting",
    latin: "Merlangius merlangus",
    habitat: ["fjord og kystvann", "sand-, mudder- og blandingsbunn"],
    substrate: ["sand", "mudder", "blandingsbunn"],
    strategy: "Torskefisk som beveger seg nær bunnen og i de frie vannmassene etter småfisk og krepsdyr.",
    traits: ["slank sølvgrå kropp", "tre ryggfinner", "mørk flekk ved brystfinnen", "liten eller manglende skjeggtråd"],
    roles: ["rovfisk", "bytte for større fisk"],
    interactions: ["småfisk", "krepsdyr", "fjordbunn"],
    tips: ["Hvitting bestemmes vanligvis i fangst; sammenlign den mørke brystfinneflekken og finnene med andre torskefisk."]
  },
  {
    id: "emne_fauna_sjokreps",
    title: "Sjøkreps",
    latin: "Nephrops norvegicus",
    habitat: ["dypere fjordbunn", "fast mudderbunn"],
    substrate: ["mudder som kan holde ganger"],
    strategy: "Graver permanente ganger i mudderet og kommer oftest ut for å søke næring i svakt lys eller mørke.",
    traits: ["slank hummerlignende kropp", "lange smale klør", "oransjerød farge", "lange antenner"],
    roles: ["gravende bunndyr", "rov- og åtselspiser", "bioturbator"],
    interactions: ["børstemark", "muslinger", "åtsel", "mudderbunn"],
    tips: ["Sjøkrepsen er skjult i ganger og observeres vanligvis med undervannskamera eller i lovlig fangst."]
  },
  {
    id: "emne_fauna_makrell",
    title: "Makrell",
    latin: "Scomber scombrus",
    habitat: ["fjord", "kystvann", "åpent hav"],
    substrate: ["pelagisk"],
    strategy: "Rask stimfisk som følger temperatur og mattilgang og beiter på plankton og småfisk.",
    traits: ["spoleformet kropp", "mørke bølgestriper på blågrønn rygg", "sølvblank underside", "små finletter bak rygg- og gattfinne"],
    roles: ["plankton- og fiskespiser", "stimfisk", "bytte for større rovdyr"],
    interactions: ["raudåte", "krill", "småfisk", "sjøfugl"],
    tips: ["Om sommeren kan stimer vise seg som jaktende fisk i overflaten; følg lokale fiskeregler."]
  },
  {
    id: "emne_fauna_spekkhogger",
    title: "Spekkhogger",
    latin: "Orcinus orca",
    habitat: ["fjord", "kystvann", "åpent hav"],
    substrate: ["frie vannmasser"],
    strategy: "Sosial tannhval som jakter koordinert; ulike grupper kan spesialisere seg på fisk eller sjøpattedyr.",
    traits: ["svart kropp med tydelige hvite felt", "lys salflekk bak ryggfinnen", "høy ryggfinne", "kraftig kropp"],
    roles: ["toppredator", "sosial jeger"],
    interactions: ["stimfisk", "andre marine dyr", "familiegrupper"],
    tips: ["Åkrafjorden har ett presist Artskart-funn i revisjonen. Hold stor avstand, senk fart og aldri skjær foran dyrene med båt."]
  }
];

const existingFjordFauna = [
  "emne_fauna_graamaake",
  "emne_fauna_fiskemaake",
  "emne_fauna_knoppsvane",
  "emne_fauna_svartbak",
  "emne_fauna_havoern",
  "emne_fauna_sildemaake",
  "emne_fauna_tjeld",
  "emne_fauna_siland",
  "emne_fauna_graagas",
  "emne_fauna_graahegre",
  "emne_fauna_storskarv"
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

  return {
    id: spec.id,
    title: spec.title,
    latin: spec.latin,
    taxonomy: {
      norsk_navn: spec.title,
      latin_navn: spec.latin,
      klasse: source.class || "Uavklart klasse",
      orden: source.order || "Uavklart orden",
      familie: source.family || "Uavklart familie",
      artskart_taxon_id: Number(source.taxonId)
    },
    habitat: {
      biotop: spec.habitat,
      jord: spec.substrate,
      lys: ["varierer med dybde og vannklarhet"],
      fukt: ["saltvann"]
    },
    fenologi: {
      aktiv: ["registrert i Åkrafjorden gjennom Artskart"],
      strategi: spec.strategy
    },
    kjennetegn: spec.traits,
    økologi: {
      rolle: spec.roles,
      samspill: spec.interactions
    },
    bykontekst: {
      typiske_steder: ["Åkrafjorden"],
      oslo_observert_typisk: "Marint artskort opprettet fra den eksakte Artskart-revisjonen av Åkrafjorden."
    },
    observasjonstips: spec.tips,
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
assert.ok(Array.isArray(manifest.files));
if (!manifest.files.includes("marine_akrafjorden_batch_1.json")) {
  manifest.files.push("marine_akrafjorden_batch_1.json");
}
await writeJson(MANIFEST_PATH, manifest);

const map = await readJson(MAP_PATH);
map.meta.version = "0.11.0";
map.meta.updatedAt = "2026-07-21";
for (const source of [
  "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1",
  "https://artskart.artsdatabanken.no/publicapi/api/observations/list/"
]) {
  if (!map.meta.sources.includes(source)) map.meta.sources.push(source);
}

const newIds = cards.map(card => card.id);
map.places.akrafjorden = {
  fauna: [...existingFjordFauna, ...newIds],
  flora: [],
  documentation: "Åkrafjorden er avgrenset med Vann-Nett-vannforekomsten NO0260020600-C. Artskart-revisjonen spurte 104 fliser, dedupliserte 17 964 råobservasjoner og beholdt 1 093 observasjoner innenfor den eksakte fjordpolygonen etter år- og presisjonsfilter. Første publiserte kortbatch omfatter elleve eksisterende fjordfugler og tjue tydelige marine arter. Høyere taxa, samlegrupper og terrestriske kanttreff publiseres ikke som fjordarter.",
  species_audit: AUDIT_PATH,
  geometry_audit: "reports/etne-natur-batch-8-akrafjorden-waterbody-geometry.json",
  waterbody_code: audit.source.waterBodyCode,
  analysis_scope: "exact_vann_nett_waterbody_polygon",
  published_species_batch: 1,
  published_species_count: existingFjordFauna.length + newIds.length,
  remaining_species_level_taxa_count: 230,
  excluded_higher_taxa_count: 99,
  unmatched_taxa_count: 230
};
await writeJson(MAP_PATH, map);

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
assert.ok(cards.every(card => card.evidence.waterbody_code === "NO0260020600-C"));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_1.json"));

const place = map.places.akrafjorden;
assert.ok(place);
assert.equal(place.analysis_scope, "exact_vann_nett_waterbody_polygon");
assert.equal(place.fauna.length, 31);
assert.equal(place.published_species_count, 31);
assert.equal(place.remaining_species_level_taxa_count, 230);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);

for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
for (const forbidden of ["emne_fauna_byfluer", "emne_kratt_einer", "emne_flora_parkslirekne", "emne_lav_ringlav"]) {
  assert.ok(!place.fauna.includes(forbidden), forbidden);
}

const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) {
  const source = audited.get(card.latin);
  assert.ok(source, card.latin);
  assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId));
}

console.log("Etne Åkrafjorden marine species batch 1 OK");
`;
await writeText(TEST_PATH, test);

const allIds = new Set(cards.map(card => card.id));
for (const id of newIds) assert.ok(allIds.has(id));
assert.equal(map.places.akrafjorden.fauna.length, 31);

console.log(`Skrev ${cards.length} nye Åkrafjorden-kort`);
console.log(`Åkrafjorden-rundingen har nå ${map.places.akrafjorden.fauna.length} fauna-arter`);
console.log("Etne Åkrafjorden marine species batch 1 OK");
