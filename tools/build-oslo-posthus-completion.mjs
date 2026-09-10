#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const root = process.cwd();
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const verifiedAt = "2026-09-10";
const placeId = "oslo_posthus";
const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv/oslo_posthus.json";
const personFile = "data/people/naeringsliv/oslo/oslo_posthus/rudolf_emanuel_jacobsen.json";
const claimsFile = "data/people/claims/naeringsliv/oslo/oslo_posthus/rudolf_emanuel_jacobsen.claims.json";
const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_oslo_posthus.json";
const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/oslo_posthus.json";
const storyFile = "data/stories/stories_oslo_posthus.json";
const contextFile = "data/quiz/production_context/naeringsliv/oslo_posthus.json";

const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const addOnce = (items, value) => { if (!items.includes(value)) items.push(value); };
const mediaCache = new Map();

const urls = {
  bylex: "https://oslobyleksikon.no/side/Hovedpostkontoret",
  snlArchitect: "https://snl.no/Rudolf_Emanuel_Jacobsen",
  nklArchitect: "https://nkl.snl.no/Rudolf_Emil_Jacobsen",
  nblArchitect: "https://nbl.snl.no/Rudolf_Emanuel_Jacobsen",
  linstow: "https://www.linstow.no/prosjekter/quadraturen",
  oppdag: "https://www.oppdagkvadraturen.no/stoppesteder/dronningens-gate-15-hovedpostkontoret",
  currentPage: "https://commons.wikimedia.org/wiki/File:Hovedpostkontoret_dronningensgt_15_rk_162995_IMG_8199.JPG",
  currentAsset: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Hovedpostkontoret_dronningensgt_15_rk_162995_IMG_8199.JPG/1280px-Hovedpostkontoret_dronningensgt_15_rk_162995_IMG_8199.JPG",
  frontPage: "https://commons.wikimedia.org/wiki/File:Hovedpostkontoret_Oslo.jpg",
  frontAsset: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hovedpostkontoret_Oslo.jpg/960px-Hovedpostkontoret_Oslo.jpg",
  historicPage: "https://commons.wikimedia.org/wiki/File:Hovedpostkontoret_OB.Y2561.jpg",
  historicAsset: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Hovedpostkontoret_OB.Y2561.jpg/500px-Hovedpostkontoret_OB.Y2561.jpg",
  portraitPage: "https://commons.wikimedia.org/wiki/File:Rudolf_Emanuel_Jacobsen.jpg",
  portraitAsset: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Rudolf_Emanuel_Jacobsen.jpg/500px-Rudolf_Emanuel_Jacobsen.jpg"
};

async function fetchBuffer(url) {
  if (mediaCache.has(url)) return mediaCache.get(url);
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "History-Go-place-production/1.0 (referential media fetch)" },
        signal: AbortSignal.timeout(60000)
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      mediaCache.set(url, buffer);
      return buffer;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError;
}

async function outputImage({ url, file, width, height, position = "centre" }) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const source = await fetchBuffer(url);
  await sharp(source)
    .rotate()
    .resize(width, height, { fit: "cover", position })
    .webp({ quality: 86 })
    .toFile(target);
}

const place = read(placeFile);
Object.assign(place, {
  aliases: ["Hovedpostkontoret", "Oslo hovedpostkontor"],
  year: 1924,
  desc: "Oslo Hovedpostkontor i Dronningens gate 15 ble oppført i etapper 1914–18 og 1921–24 etter Rudolf E. Jacobsens konkurranseutkast. Bygningen var hovedterminal for Oslo postdistrikt til 1975 og samlet postflyt, publikumstjenester og administrasjon før kvartalet senere ble ombrukt til boliger og næring.",
  popupDesc: "Hovedpostkontoret i Dronningens gate 15 ble tegnet av Rudolf Emanuel Jacobsen etter en arkitektkonkurranse i 1912. Bygningen ble oppført i etapper 1914–18 og 1921–24 og tatt i bruk som hovedpostkontor i 1924. Oslo byleksikon beskriver den som en av de siste store murbygningene fra tiden omkring første verdenskrig, med nasjonal nybarokk, mansardtak, tårnhjelmer og granittdekor inspirert av norsk treskurd.\n\nBygningen var hovedterminal for Oslo postdistrikt fram til 1975. Her møttes post som skulle sorteres, ekspederes og sendes videre, samtidig som bygget huset publikumsfunksjoner og sentral administrasjon. Etter at hovedterminalen flyttet, fortsatte Sentrum postkontor, Postdirektoratet og Postmuseet i bygningen fram til 2004.\n\nLinstow kjøpte Posthuskvartalet i 1999 og omformet det tidligere postanlegget til et kvartal med boliger og næring. I ombyggingen ble blant annet fasadene, den tidligere posthallen og sentrale trappeløp bevart. Det gjør stedet til et tydelig eksempel på hvordan en stor offentlig infrastrukturbygning kan skifte funksjon uten at hele det historiske anlegget forsvinner.\n\nPå Tollbugata-siden er en kanonkule fra den svenske beleiringen i 1716 murt inn i veggen. Kulen satt i et eldre hus på tomten og ble bevart da dette ble revet i 1914. Dermed rommer Hovedpostkontoret også et eldre byhistorisk lag som ikke har med postdriften å gjøre.",
  image: "bilder/places/oslo_posthus.webp",
  cardImage: "bilder/kort/places/oslo_posthus.webp",
  frontImage: "bilder/places/oslo_posthus_front_portrait.webp",
  production_profile: "standard",
  profile_status: "confirmed",
  production_status: "complete",
  placeScope: "building",
  related_people_ids: ["rudolf_emanuel_jacobsen"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    collection_ids: ["people", "structures"],
    reason: "Oslo Posthus har en direkte, kildebelagt arkitektprofil for Rudolf Emanuel Jacobsen og en bildeklart dokumentert strukturprofil for Hovedpostkontoret. De to samlingene er stedsspesifikke og unngår å fylle kortet med generiske postobjekter uten lokal proveniens.",
    verifiedAt
  },
  imageMeta: {
    source: "wikimedia_commons",
    sourcePage: urls.currentPage,
    creator: "Bjoertvedt",
    credit: "Bjoertvedt / Wikimedia Commons",
    license: "CC BY-SA 3.0 NO",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
    originalDimensions: "2592x1728",
    outputDimensions: "1200x800",
    assetType: "documentary_place_photo",
    transformation: "Proporsjonal 3:2-beskjæring og WebP-normalisering; ingen generativ endring.",
    verifiedAt
  },
  cardImageMeta: {
    source: "wikimedia_commons",
    sourcePage: urls.currentPage,
    creator: "Bjoertvedt",
    credit: "Bjoertvedt / Wikimedia Commons",
    license: "CC BY-SA 3.0 NO",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
    originalDimensions: "2592x1728",
    outputDimensions: "900x520",
    transformation: "Stedstro kortutsnitt og WebP-normalisering.",
    verifiedAt
  },
  frontImageMeta: {
    source: "wikimedia_commons",
    sourcePage: urls.frontPage,
    creator: "Mahlum",
    credit: "Mahlum / Wikimedia Commons",
    license: "Public domain",
    originalDimensions: "1000x1376",
    outputDimensions: "900x1200",
    orientation: "portrait",
    aspectRatio: "3:4",
    transformation: "Stående 3:4-utnitt av den dokumenterte bygningsfasaden; ingen generativ endring.",
    verifiedAt
  },
  structures: [{
    id: "oslo_posthus_hovedpostkontoret",
    title: "Hovedpostkontoret",
    name: "Hovedpostkontoret",
    type: "posthus",
    kind: "historic_public_infrastructure_building",
    year: 1924,
    desc: "Monumentalt hovedpostkontor i nasjonal nybarokk, tegnet av Rudolf Emanuel Jacobsen og oppført 1914–18 og 1921–24.",
    historicalFunction: "Hovedterminal for Oslo postdistrikt, publikumsfunksjoner og postadministrasjon.",
    placeSpecificReason: "Bygningen er selve canonical Place-objektet i Dronningens gate 15 og er dokumentert direkte av Oslo byleksikon.",
    why_here: "Strukturen viser hvordan postvesenet samlet logistikk, publikumsservice og administrasjon i ett stort byanlegg.",
    image: "bilder/kort/structures/oslo_posthus_hovedpostkontoret.webp",
    imageMeta: {
      source: "wikimedia_commons",
      sourcePage: urls.currentPage,
      creator: "Bjoertvedt",
      credit: "Bjoertvedt / Wikimedia Commons",
      license: "CC BY-SA 3.0 NO",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
      outputDimensions: "900x520",
      transformation: "Stedstro utsnitt og WebP-normalisering.",
      verifiedAt
    },
    source_urls: [urls.bylex, urls.currentPage]
  }],
  for_na: {
    title: "Hovedpostkontoret: 1924 og 2013",
    beforeImage: "bilder/places/oslo_posthus_1924.webp",
    beforeImageLabel: "Hovedpostkontoret i 1924",
    beforeImageMeta: {
      source: "wikimedia_commons_oslo_museum",
      sourcePage: urls.historicPage,
      creator: "Anders Beer Wilse",
      credit: "Anders Beer Wilse / Oslo Museum / Wikimedia Commons",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      date: "1924",
      outputDimensions: "900x1200",
      verifiedAt
    },
    nowImage: "bilder/places/oslo_posthus.webp",
    nowImageLabel: "Hovedpostkontoret i 2013",
    nowImageMeta: {
      sourcePage: urls.currentPage,
      creator: "Bjoertvedt",
      credit: "Bjoertvedt / Wikimedia Commons",
      license: "CC BY-SA 3.0 NO",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
      date: "2013-09-22",
      verifiedAt
    },
    before: "Wilse-fotografiet dokumenterer Hovedpostkontoret i året da anlegget ble tatt i bruk.",
    now: "Fotografiet fra 2013 viser den bevarte fasaden etter at postterminalen og de siste sentrale postfunksjonene var flyttet ut.",
    change: "Bildene er tatt fra ulike standpunkter og skal ikke brukes som geometrisk før/etter-overlay. Sammen dokumenterer de den fysiske kontinuiteten i fasaden, mens kildene dokumenterer funksjonsskiftet.",
    lookFor: ["mansardtak og tårnhjelmer", "granittdekor og bueåpninger", "forholdet mellom tårnet og gatehjørnet"],
    sources: [urls.bylex, urls.historicPage, urls.currentPage, urls.linstow]
  }
});
place.externalLinks = [
  ["source", "Oslo byleksikon – Hovedpostkontoret", urls.bylex],
  ["source", "Store norske leksikon – Rudolf Emanuel Jacobsen", urls.snlArchitect],
  ["official", "Linstow – Quadraturen", urls.linstow],
  ["source", "Oppdag Kvadraturen – Hovedpostkontoret", urls.oppdag],
  ["image_source", "Wikimedia Commons – Hovedpostkontoret 2013", urls.currentPage],
  ["image_source", "Wikimedia Commons – Hovedpostkontoret 2008", urls.frontPage],
  ["historical_image", "Oslo Museum / Wikimedia Commons – Hovedpostkontoret 1924", urls.historicPage]
];
write(placeFile, place);

const person = [{
  id: "rudolf_emanuel_jacobsen",
  name: "Rudolf Emanuel Jacobsen",
  initials: "REJ",
  kindLabel: "Arkitekt",
  birth_date: "1879-10-27",
  death_date: "1937-06-18",
  active_place: "Kristiania",
  desc: "Arkitekten som vant konkurransen om det nye hovedpostkontoret og tegnet den monumentale postbygningen i Dronningens gate 15.",
  popupDesc: "Rudolf Emanuel Jacobsen ble født i Kristiania 27. oktober 1879 og døde i Aker 18. juni 1937. Han utdannet seg ved Den kongelige Tegneskole og Kungliga Tekniska Högskolan og etablerte egen praksis i Kristiania.\n\nJacobsen vant konkurransen om det nye hovedpostkontoret tidlig på 1910-tallet; Oslo byleksikon daterer konkurransen til 1912. Hovedpostkontoret ble oppført i etapper 1914–18 og 1921–24 og regnes av Store norske leksikon som hans hovedverk.\n\nDen direkte koblingen til Oslo Posthus bygger derfor på dokumentert arkitektansvar for bygningen som står i Dronningens gate 15, ikke på en generell kobling til postvesenet.",
  placeId,
  source_place_id: placeId,
  places: [placeId],
  category: "naeringsliv",
  year: 1879,
  works: [{
    id: "hovedpostkontoret_oslo",
    title: "Hovedpostkontoret i Oslo",
    year: 1924,
    role: "arkitekt",
    place: "Dronningens gate 15, Oslo",
    material: "mur, puss og granitt",
    summary: "Tegnet det nye hovedpostkontoret etter konkurranseseier; bygningen ble fullført i etapper fram til 1924."
  }],
  tags: ["naeringsliv", "arkitektur", "post", "infrastruktur", "hovedpostkontoret", "oslo"],
  themes: ["offentlig arkitektur", "infrastruktur", "nasjonsbygging"],
  image: "bilder/kort/people/rudolf_emanuel_jacobsen.webp",
  cardImage: "bilder/kort/people/rudolf_emanuel_jacobsen.webp",
  imageMeta: {
    source: "wikimedia_commons",
    sourcePage: urls.portraitPage,
    creator: "Ukjent fotograf",
    credit: "Ukjent fotograf, før 1916 / Wikimedia Commons",
    license: "Public domain",
    originalDimensions: "529x752",
    outputDimensions: "700x900",
    transformation: "Proporsjonal portrettbeskjæring og WebP-normalisering; ingen generativ endring.",
    verifiedAt
  },
  profileStandard: "people_profile_v1.0",
  claimsFile,
  profileStatus: "ready_people_v1",
  source_urls: [urls.snlArchitect, urls.nklArchitect, urls.nblArchitect, urls.bylex, urls.portraitPage],
  externalLinks: [
    { type: "source", label: "Store norske leksikon – Rudolf Emanuel Jacobsen", url: urls.snlArchitect, verifiedAt },
    { type: "source", label: "Norsk kunstnerleksikon – Rudolf Emil Jacobsen", url: urls.nklArchitect, verifiedAt },
    { type: "source", label: "Oslo byleksikon – Hovedpostkontoret", url: urls.bylex, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – Rudolf Emanuel Jacobsen", url: urls.portraitPage, verifiedAt }
  ],
  verifiedAt
}];
write(personFile, person);

write(claimsFile, {
  schema: "history_go_people_claims_v1",
  version: "1.0.0",
  person_id: "rudolf_emanuel_jacobsen",
  profile_file: personFile,
  identity: {
    canonical_identity: "Den norske arkitekten Rudolf Emanuel Jacobsen (1879–1937).",
    name_variants: ["Rudolf Emanuel Jacobsen", "Rudolf Emil Jacobsen", "R.E. Jacobsen"],
    not: ["en leder i Postverket", "Rudolf Jacobsen som generisk postfunksjonær"],
    identity_status: "verified"
  },
  claims: [
    { id: "canonical_name", claim: "Det kanoniske navnet er Rudolf Emanuel Jacobsen.", source_url: urls.snlArchitect, source_location: "overskrift og faktaboks", source_type: "recognized_reference", status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "identity", claim: "Rudolf Emanuel Jacobsen ble født 27. oktober 1879 i Kristiania og døde 18. juni 1937 i Aker; hans virke var arkitekt.", source_url: urls.snlArchitect, source_location: "faktaboks", source_type: "recognized_reference", status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "education_practice", claim: "Jacobsen var utdannet ved Den kongelige Tegneskole og Kungliga Tekniska Högskolan og hadde egen praksis i Kristiania.", source_url: urls.snlArchitect, source_location: "biografi og utdannelse", source_type: "recognized_reference", status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "posthouse_competition", claim: "Jacobsen vant arkitektkonkurransen om Hovedpostkontoret; Oslo byleksikon daterer konkurransen til 1912.", source_url: urls.bylex, source_location: "innledningen", source_type: "institutional_reference", status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "posthouse_architect", claim: "Hovedpostkontoret i Dronningens gate 15 ble oppført 1914–18 og 1921–24 etter tegninger av Rudolf E. Jacobsen.", source_url: urls.bylex, source_location: "innledningen", source_type: "institutional_reference", status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "posthouse_main_work", claim: "Store norske leksikon omtaler det gamle Hovedpostkontoret som Rudolf Emanuel Jacobsens hovedverk.", source_url: urls.snlArchitect, source_location: "brødtekst og utvalgte bygninger", source_type: "recognized_reference", status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "image_identity", claim: "Commons-filen er katalogisert som et portrett av arkitekt Rudolf Emanuel Jacobsen, hentet fra en publikasjon fra 1916 og merket public domain.", source_url: urls.portraitPage, source_location: "filbeskrivelse og lisens", source_type: "archive", status: "verified", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }
  ],
  field_claim_map: {
    name: ["canonical_name"], kindLabel: ["identity"], birth_date: ["identity"], death_date: ["identity"], active_place: ["identity"], year: ["identity"],
    placeId: ["posthouse_architect"], source_place_id: ["posthouse_architect"], "places[oslo_posthus]": ["posthouse_architect"],
    "works[id=hovedpostkontoret_oslo].title": ["posthouse_architect"], "works[id=hovedpostkontoret_oslo].year": ["posthouse_architect"], "works[id=hovedpostkontoret_oslo].role": ["posthouse_architect"], "works[id=hovedpostkontoret_oslo].place": ["posthouse_architect"], "works[id=hovedpostkontoret_oslo].summary": ["posthouse_architect", "posthouse_main_work"],
    image: ["image_identity"], cardImage: ["image_identity"], imageMeta: ["image_identity"]
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["posthouse_competition", "posthouse_architect"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["identity"] },
      { sentence: 2, claim_ids: ["education_practice"] },
      { sentence: 3, claim_ids: ["posthouse_competition"] },
      { sentence: 4, claim_ids: ["posthouse_architect", "posthouse_main_work"] },
      { sentence: 5, claim_ids: ["posthouse_architect"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: "7/7", fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const peopleManifest = read("data/people/manifest.json");
addOnce(peopleManifest.files, personFile.replace(/^data\//, ""));
write("data/people/manifest.json", peopleManifest);

write(leksikonFile, {
  place_id: placeId,
  title: "Oslo Hovedpostkontor",
  type: "main",
  version: 1,
  visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Et monumentalt post- og administrasjonsbygg fra 1914–24 som var hovedterminal for Oslo postdistrikt til 1975 og senere ble ombrukt til boliger og næring.",
  wikiText: [
    "Rudolf Emanuel Jacobsen tegnet Hovedpostkontoret etter en arkitektkonkurranse tidlig på 1910-tallet. Bygningen ble reist i to hovedetapper, 1914–18 og 1921–24, og fikk et nasjonalt nybarokt preg med mansardtak, tårnhjelmer og granittdekor.",
    "Som hovedterminal samlet bygget poststrømmer, sortering, ekspedisjon, publikumstjenester og administrasjon. Terminalfunksjonen varte til 1975, mens Sentrum postkontor, Postdirektoratet og Postmuseet ble værende fram til 2004.",
    "Etter at Linstow kjøpte Posthuskvartalet i 1999, ble anlegget omformet til boliger og næring. Fasader, posthall og sentrale trappeløp ble bevart, slik at funksjonsskiftet fortsatt kan leses i den historiske bygningsstrukturen."
  ],
  summary: { one_liner: "Fra nasjonal postterminal til ombrukt bykvartal.", themes: ["post", "infrastruktur", "arkitektur", "logistikk", "ombruk"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_oslo_posthus_architekt", label: "Arkitekten", desc: "Rudolf Emanuel Jacobsen tegnet Hovedpostkontoret etter konkurranseseier.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] },
    { id: "fact_oslo_posthus_1924", label: "Åpningen", desc: "Bygningen ble tatt i bruk som hovedpostkontor i 1924.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] },
    { id: "fact_oslo_posthus_1975", label: "Terminalskiftet", desc: "Bygningen var hovedterminal for Oslo postdistrikt til 1975.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] }
  ],
  chronology: [
    { id: "chrono_oslo_posthus_1912", year: 1912, title: "Arkitektkonkurransen", desc: "Rudolf E. Jacobsen vinner konkurransen om det nye hovedpostkontoret.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] },
    { id: "chrono_oslo_posthus_1914", year: 1914, title: "Byggingen starter", desc: "Første byggeetappe varer 1914–18.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] },
    { id: "chrono_oslo_posthus_1924", year: 1924, title: "Hovedpostkontoret tas i bruk", desc: "Andre byggetrinn fullføres og postfunksjonene samles i Dronningens gate 15.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] },
    { id: "chrono_oslo_posthus_1975", year: 1975, title: "Hovedterminalen flytter", desc: "Bygningen slutter å være hovedterminal for Oslo postdistrikt.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] },
    { id: "chrono_oslo_posthus_1999", year: 1999, title: "Linstow kjøper kvartalet", desc: "Posthuskvartalet går inn i en ny ombruksfase.", confidence: "high", sources: [{ title: "Linstow", url: urls.linstow }] },
    { id: "chrono_oslo_posthus_2004", year: 2004, title: "De siste sentrale postfunksjonene flytter", desc: "Sentrum postkontor, Postdirektoratet og Postmuseet er ute av bygningen.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.bylex }] }
  ],
  sources: place.externalLinks,
  externalLinks: place.externalLinks
});
const leksikonManifest = read("data/leksikon/manifest.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

write(languageFile, {
  place_id: placeId,
  title: "Språkleksikon: Oslo Hovedpostkontor",
  verified_at: verifiedAt,
  dialect_status: "not_applicable_place_level",
  entries: [
    { id: "oslo_posthus_hovedpostkontor", term: "hovedpostkontor", type: "institusjonsord", meaning: "Det sentrale postkontoret for et by- eller postdistrikt.", context: "I Dronningens gate 15 betegner ordet bygningens historiske hovedfunksjon fram til terminalfunksjonen ble flyttet i 1975.", linked_to: { kind: "place", id: placeId }, tags: ["post", "institusjon", "infrastruktur"], sources: [{ label: "Oslo byleksikon", url: urls.bylex }] },
    { id: "oslo_posthus_postterminal", term: "postterminal", type: "fagord", meaning: "Et knutepunkt der postsendinger mottas, sorteres og sendes videre.", context: "Begrepet forklarer hvorfor bygningen må forstås som logistisk infrastruktur og ikke bare som publikumsekspedisjon.", linked_to: { kind: "place", id: placeId }, tags: ["logistikk", "sortering", "transport"], sources: [{ label: "Oslo byleksikon", url: urls.bylex }] },
    { id: "oslo_posthus_mansardtak", term: "mansardtak", type: "arkitekturord", meaning: "Takform med knekt takflate som gir en brattere nedre og slakere øvre del.", context: "Oslo byleksikon bruker mansardtaket som et kjennetegn ved Hovedpostkontorets nasjonale nybarokk.", linked_to: { kind: "place", id: placeId }, tags: ["arkitektur", "tak", "nybarokk"], sources: [{ label: "Oslo byleksikon", url: urls.bylex }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

write(storyFile, [{
  id: "st_oslo_posthus_byens_informasjonsmaskin",
  quality_profile: "episode_v1",
  type: "infrastructure",
  title: "Byens informasjonsmaskin",
  year: 1924,
  place_id: placeId,
  summary: "Da Hovedpostkontoret sto ferdig i 1924, samlet det postflyt, publikumstjenester og administrasjon i et monumentalt knutepunkt midt i byen.",
  story: "I 1924 sto Hovedpostkontoret i Dronningens gate ferdig etter to byggeperioder. Rudolf Emanuel Jacobsen hadde vunnet konkurransen om bygget tidlig på 1910-tallet, og den store murbygningen ble utformet som mer enn en ekspedisjonsskranke: den var et fysisk system for å motta, sortere, fordele og sende informasjon og varer videre.\n\nArbeidet foregikk i mange ledd. Brev og pakker måtte inn i bygget, sorteres etter destinasjon, kobles til transport og ekspederes ut igjen. Samtidig skulle publikum kunne kjøpe tjenester og levere sendinger, mens administrasjonen koordinerte et stadig større nettverk. Arkitekturen ga disse funksjonene en monumental ramme.\n\nHovedterminalen ble flyttet i 1975. Sentrum postkontor, Postdirektoratet og Postmuseet ble likevel værende i bygningen fram til 2004. Dermed endret stedet rolle trinnvis før kvartalet ble bygget om til boliger og næring. Fasaden står igjen som et synlig skall rundt en helt annen bruk enn den som formet huset i 1924.",
  why_it_matters: "Historien gjør post synlig som logistisk og organisatorisk infrastruktur: informasjonsflyt krevde bygninger, arbeidsdeling, transport og kapasitet lenge før digitale nettverk.",
  related_people: ["rudolf_emanuel_jacobsen"],
  sources: [urls.bylex, urls.snlArchitect, urls.linstow]
}]);

await outputImage({ url: urls.currentAsset, file: "bilder/places/oslo_posthus.webp", width: 1200, height: 800 });
await outputImage({ url: urls.currentAsset, file: "bilder/kort/places/oslo_posthus.webp", width: 900, height: 520 });
await outputImage({ url: urls.frontAsset, file: "bilder/places/oslo_posthus_front_portrait.webp", width: 900, height: 1200, position: "attention" });
await outputImage({ url: urls.currentAsset, file: "bilder/kort/structures/oslo_posthus_hovedpostkontoret.webp", width: 900, height: 520 });
await outputImage({ url: urls.historicAsset, file: "bilder/places/oslo_posthus_1924.webp", width: 900, height: 1200, position: "attention" });
await outputImage({ url: urls.portraitAsset, file: "bilder/kort/people/rudolf_emanuel_jacobsen.webp", width: 700, height: 900, position: "attention" });

await runBuildQuizProductionContext({ root, categoryId: "naeringsliv", targetId: placeId, outputPath: contextFile });

console.log("Oslo Posthus production closure materialized.");
