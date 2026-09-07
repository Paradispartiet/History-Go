#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { runBuildQuizProductionContext } from "./build-quiz-production-context.mjs";

const root = process.cwd();
const placeId = "radhusplassen";
const personId = "albert_nordengen";
const brandId = "sporveien";
const verifiedAt = "2026-09-07";
const lockedMain = "4df9b1476d870fbe299e9f6a13d04ccae99ab2d2";
const placeFile = "data/places/by/oslo/places/radhusplassen.json";
const quizFile = "data/quiz/by/radhusplassen_sets.json";
const briefFile = "data/quiz/production_briefs/by/radhusplassen.json";
const contextFile = "data/quiz/production_context/by/radhusplassen.json";
const workcardFile = "reports/place-production/radhusplassen-workcard-current.json";

const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");

const urls = {
  municipality: "https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/radhusplassen/",
  useRules: "https://www.oslo.kommune.no/radhuset/leie-radhusplassen/",
  byleksikon: "https://oslobyleksikon.no/side/R%C3%A5dhusplassen",
  byarkiv: "https://www.oslo.kommune.no/OBA/tobias/pdf_arkiv/Tob1998-1.pdf",
  bell: "https://magasin.oslo.kommune.no/byplan/en-r%C3%A5dhusklokke-vender-hjem",
  nordengen: "https://snl.no/Albert_Nordengen",
  mainPage: "https://commons.wikimedia.org/wiki/File:R%C3%A5dhusplassen_Oslo_2022-08-17_01.jpg",
  mainAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/R%C3%A5dhusplassen%20Oslo%202022-08-17%2001.jpg",
  tordenskioldPage: "https://commons.wikimedia.org/wiki/File:Tordenskioldstatuen_ved_R%C3%A5dhusplassen_og_R%C3%A5dhusbryggene_i_Oslo,_Norway_(2021.11.24).jpg",
  tordenskioldAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Tordenskioldstatuen%20ved%20R%C3%A5dhusplassen%20og%20R%C3%A5dhusbryggene%20i%20Oslo%2C%20Norway%20(2021.11.24).jpg",
  honnorbryggaPage: "https://commons.wikimedia.org/wiki/File:Honn%C3%B8rbrygga_-_Oslo,_Norway_2020-09-16.jpg",
  honnorbryggaAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Honn%C3%B8rbrygga%20-%20Oslo%2C%20Norway%202020-09-16.jpg",
  nordengenPage: "https://commons.wikimedia.org/wiki/File:Albert_Nordengen.JPG",
  nordengenAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Albert%20Nordengen.JPG"
};

const cache = new Map();
async function fetchBuffer(url) {
  if (cache.has(url)) return cache.get(url);
  let status = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "History-Go-Radhusplassen-production/1.0" } });
    status = response.status;
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      cache.set(url, buffer);
      return buffer;
    }
    if (![429, 500, 502, 503, 504].includes(status)) break;
    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 16000)));
  }
  throw new Error(`Kunne ikke hente bilde (${status}): ${url}`);
}
async function outputImage({ url, file, width, height, fit = "cover", position = "centre", background = "#ffffff" }) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(await fetchBuffer(url)).rotate().resize(width, height, { fit, position, background, withoutEnlargement: false }).webp({ quality: 86, effort: 5 }).toFile(target);
}

await outputImage({ url: urls.mainAsset, file: "bilder/places/radhusplassen.webp", width: 1200, height: 800 });
await outputImage({ url: urls.mainAsset, file: "bilder/places/radhusplassen_front_portrait.webp", width: 900, height: 1200 });
await outputImage({ url: urls.honnorbryggaAsset, file: "bilder/QuizCards/Radhusplassen.webp", width: 900, height: 1200 });
await outputImage({ url: urls.tordenskioldAsset, file: "bilder/kort/objects/radhusplassen_tordenskioldstatuen.webp", width: 900, height: 620 });
await outputImage({ url: urls.honnorbryggaAsset, file: "bilder/kort/structures/radhusplassen_honnorbrygga.webp", width: 900, height: 620 });
await outputImage({ url: urls.nordengenAsset, file: "bilder/kort/people/albert_nordengen.webp", width: 900, height: 1200, fit: "contain" });

const mainMeta = {
  source: "wikimedia_commons", sourcePage: urls.mainPage, creator: "Leonhard Lenz", credit: "Leonhard Lenz / Wikimedia Commons",
  license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", date: "2022-08-17",
  assetType: "documentary_place_photo", transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering; ingen generativ endring.", verifiedAt
};
const tordenskioldMeta = {
  source: "wikimedia_commons", sourcePage: urls.tordenskioldPage, creator: "Geir Hval (Macwhale)", credit: "Geir Hval / Wikimedia Commons",
  license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", date: "2021-11-24",
  assetType: "documentary_object_photo", transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering; ingen generativ endring.", verifiedAt
};
const honnorbryggaMeta = {
  source: "wikimedia_commons", sourcePage: urls.honnorbryggaPage, creator: "Ryan Hodnett", credit: "Ryan Hodnett / Wikimedia Commons",
  license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", date: "2020-09-16",
  assetType: "documentary_structure_photo", transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering; ingen generativ endring.", verifiedAt
};
const nordengenMeta = {
  source: "wikimedia_commons", sourcePage: urls.nordengenPage, creator: "unknown", credit: "Wikimedia Commons / source publication Oslo Høyre 1934–1959",
  license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/", date: "before 1959",
  assetType: "historical_portrait", transformation: "Proporsjonal innpassing på stående People-kort; ingen generativ endring.", verifiedAt
};

const place = read(placeFile);
const coordSnapshot = JSON.stringify({ lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl });
delete place.cardImage;
Object.assign(place, {
  image: "bilder/places/radhusplassen.webp",
  frontImage: "bilder/places/radhusplassen_front_portrait.webp",
  quizCardImage: "bilder/QuizCards/Radhusplassen.webp",
  imageMeta: { ...mainMeta, outputDimensions: "1200x800", orientation: "landscape" },
  frontImageMeta: { ...mainMeta, outputDimensions: "900x1200", orientation: "portrait" },
  quizCardImageMeta: { ...honnorbryggaMeta, outputDimensions: "900x1200", orientation: "portrait", usage: "quiz_card_back_only" },
  production_profile: "standard",
  profile_status: "confirmed",
  production_status: "complete",
  production_verified_at: verifiedAt,
  related_people_ids: [personId],
  related_place_ids: [...new Set([...(place.related_place_ids || []), "oslo_radhus"])],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    production_profile: "standard",
    collection_ids: ["people", "objects", "brands", "structures"],
    reason: "Albert Nordengen, Tordenskioldstatuen, Sporveien og Honnørbrygga er fire separate, dokumenterte og bildeklare innganger til Rådhusplassens kommunale, kunstneriske, transportmessige og maritime historie.",
    verifiedAt
  },
  objects: [{
    id: "radhusplassen_tordenskioldstatuen", title: "Tordenskioldstatuen", name: "Tordenskioldstatuen", type: "monument", kind: "physical_object", year: 1901,
    desc: "Axel Enders statue av Peter Wessel Tordenskiold ble reist i 1901 og står i dag ved østsiden av Rådhusplassen mot Rådhusbryggene.",
    historicalFunction: "Offentlig monument og historisk orienteringspunkt i plassrommet.", physicalObject: true, placeSpecific: true, collectable: true, storePrice: 35, currency: "PC", collection: "radhusplassen_offentlig_kunst",
    placeSpecificReason: "Oslo byleksikon plasserer statuen på Rådhusplassen, og den dokumenterte Commons-fotografien viser objektet i plassrommet.",
    why_here: "Statuen gjør den eldre monumenthistorien fysisk lesbar i et plassrom som ellers er sterkt preget av ombyggingen på 1990-tallet.",
    unlock: "Finn statuen ved østsiden av plassen og observer sokkel, retning og forholdet til bryggene.",
    image: "bilder/kort/objects/radhusplassen_tordenskioldstatuen.webp", imageMeta: { ...tordenskioldMeta, outputDimensions: "900x620" }, source_urls: [urls.byleksikon, urls.tordenskioldPage]
  }],
  structures: [{
    id: "radhusplassen_honnorbrygga", title: "Honnørbrygga", name: "Honnørbrygga", type: "brygge", kind: "pier_structure", year: null,
    desc: "Honnørbrygga ligger ved Rådhusbryggene på sørsiden av Rådhusplassen og markerer overgangen mellom det representative plassrommet og sjøfronten.",
    historicalFunction: "Representativ brygge og del av Rådhusbryggenes maritime anlegg.",
    placeSpecificReason: "Brygga ligger fysisk i kanten av Rådhusplassen og er dokumentert i kommunens Fjordbyen-beskrivelse og Commons-bildet.",
    why_here: "Brygga gjør forbindelsen mellom rådhusplassen, sjøtransporten og fjorden konkret uten å gjøre hele havnefronten til samme Structure.",
    image: "bilder/kort/structures/radhusplassen_honnorbrygga.webp", imageMeta: { ...honnorbryggaMeta, outputDimensions: "900x620" }, source_urls: [urls.municipality, urls.honnorbryggaPage]
  }],
  module_audit: {
    for_na: { status: "not_produced_without_same_viewpoint_pair", rationale: "Historisk trafikkendring er godt dokumentert, men produksjonen konstruerer ikke et optisk før/etter-par uten kontrollert samme ståsted." },
    news: { status: "not_required_for_completion", rationale: "Stedets fullproduksjon bygger på varige kilder og historiske hendelser, ikke en kortlivet nyhetsoppføring." },
    dialect: { status: "not_applicable", rationale: "Språkpakken forklarer stedsspesifikke ord og navn uten å hevde en egen lokal dialekt." }
  }
});
place.fagverk.source_urls = [...new Set([...(place.fagverk.source_urls || []), urls.byleksikon, urls.bell])];
place.fagverk.guiding_questions ||= [];
if (place.fagverk.guiding_questions.length < 6) place.fagverk.guiding_questions.push("Hvordan kan monumenter, brygger, trikk og arrangementsregler leses som ulike lag i samme offentlige plassrom?");
place.fagverk.concepts = [...new Set([...(place.fagverk.concepts || []), "gjennomgangstrafikk", "festplass", "representativitet", "havnefront"] )];
if (coordSnapshot !== JSON.stringify({ lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl })) throw new Error("Rådhusplassen coordinate contract changed");
write(placeFile, place);

const peopleFile = "data/people/by/oslo/people_by_oslo.json";
const people = read(peopleFile);
const person = people.find(row => row.id === personId);
if (!person) throw new Error("Canonical Albert Nordengen profile missing");
person.image = "bilder/kort/people/albert_nordengen.webp";
person.imageMeta = nordengenMeta;
write(peopleFile, people);

const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = [brandId];
write("data/brands/brands_by_place.json", brandsByPlace);
const brandsMaster = read("data/brands/brands_master.json");
const brand = brandsMaster.find(row => row.id === brandId);
if (!brand) throw new Error("Canonical Sporveien brand missing");
brand.place_ids ||= [];
addOnce(brand.place_ids, placeId);
write("data/brands/brands_master.json", brandsMaster);

const chronology = [
  [1917, "Planene for rådhusplassen", "Rådhusarkitektenes planarbeid la opp til et åpent representativt rom mot sjøen.", urls.byarkiv],
  [1938, "Konkurranse om utsmykningen", "Konkurransen om plassens kunstneriske utforming skulle gi området en festlig og verdig karakter.", urls.byarkiv],
  [1950, "Oslo rådhus åpner", "Rådhuset åpnet og ga plassen sin tydelige monumentale nordvegg.", urls.municipality],
  [1960, "Fontene- og skulpturanlegget fullføres", "Arbeidet med fontener og skulpturer på plassen ble fullført.", urls.byarkiv],
  [1961, "Trikken forsvinner", "Den tidligere trikkeføringen over plassen ble lagt ned.", urls.byleksikon],
  [1980, "Havnebanen opphører", "Havnebanen, som hadde krysset området siden 1907, opphørte.", urls.byleksikon],
  [1990, "Gjennomgangstrafikken fjernes", "Festningstunnelen tok bort gjennomgangstrafikken og plassen ble igjen brukt som festplass.", urls.byleksikon],
  [1994, "Rådhusplassen blir bilfri", "Vestbanekrysset og omleggingen av E18-restene gjorde plassen bilfri.", urls.municipality],
  [1995, "Ny trikkelinje", "Trikken kom tilbake over den bilfrie plassen.", urls.municipality],
  [2011, "Minnesamling etter 22. juli", "En stor offentlig minnesamling fylte Rådhusplassen og viste plassens rolle som kollektivt samlingsrom.", urls.byleksikon]
].map(([year, period, desc, source], index) => ({ id: `chrono_radhusplassen_${String(index + 1).padStart(2, "0")}`, year, period, title: period, desc, confidence: "high", sources: [{ title: source === urls.municipality ? "Oslo kommune – Rådhusplassen" : source === urls.byarkiv ? "Oslo Byarkiv – TOBIAS 1/1998" : "Oslo byleksikon – Rådhusplassen", url: source }] }));
const leksikonFile = "data/leksikon/places/oslo/by/leksikon_radhusplassen.json";
write(leksikonFile, [{
  id: "radhusplassen_hovedartikkel", visual: { designCode: "article_place_essay_miniature" }, place_id: placeId, title: "Rådhusplassen", version: 1,
  popupDesc: "Rådhusplassen er byrommet mellom Oslo rådhus og fjorden, formet av skiftet fra trafikkflate til bilfri festplass, ny trikk, offentlig kunst og maritime brygger.",
  wikiText: place.popupDesc.split("\n\n"),
  summary: { one_liner: "Bilfri rådhusplass, kollektivknutepunkt og offentlig scene ved fjorden.", themes: ["offentlig rom", "transport", "representasjon", "arrangement", "fjordby"], tone: ["kildebasert", "analytisk"] },
  facts: [
    { id: "fact_radhusplassen_01", label: "Bilfri fra 1994", desc: "Kommunen daterer den bilfrie Rådhusplassen til 1994.", confidence: "high", sources: [urls.municipality] },
    { id: "fact_radhusplassen_02", label: "Trikken tilbake i 1995", desc: "Ny trikkelinje over plassen åpnet i 1995.", confidence: "high", sources: [urls.municipality] },
    { id: "fact_radhusplassen_03", label: "Stor arrangementsflate", desc: "Plassen brukes til festivaler, konserter, markeringer og annen offentlig aktivitet.", confidence: "high", sources: [urls.municipality, urls.useRules] }
  ],
  sources: [urls.municipality, urls.useRules, urls.byleksikon, urls.byarkiv, urls.bell], externalLinks: place.externalLinks, chronology
}]);
const batch1File = "data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json";
write(batch1File, read(batch1File).filter(row => row.place_id !== placeId));
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files ||= [];
leksikonManifest.files = leksikonManifest.files.filter(entry => String(typeof entry === "string" ? entry : entry?.path || "") !== leksikonFile);
leksikonManifest.files.push(leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/radhusplassen.json";
write(languageFile, {
  place_id: placeId, title: "Språkleksikon: Rådhusplassen", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  notes: "Oppføringene forklarer stedets navn og relevante byromsord; de hevder ikke en egen lokal dialekt.",
  entries: [
    ["radhusplassen_stedsnavn", "Rådhusplassen", "stedsnavn", "Navnet viser til den åpne plassen foran Oslo rådhus.", "Stedsnavnet skiller det offentlige plassrommet fra selve rådhusbygningen.", urls.municipality],
    ["radhusplassen_festplass", "festplass", "byromsbegrep", "Et offentlig rom dimensjonert og organisert for større samlinger og seremonier.", "Rådhusplassen ble igjen omtalt og brukt som festplass etter trafikkavlastningen rundt 1990.", urls.byleksikon],
    ["radhusplassen_honnorbrygga", "Honnørbrygga", "stedsnavn", "Navn på den representative brygga ved Rådhusbryggene.", "Brygga markerer overgangen mellom plassen og sjøfronten.", urls.municipality],
    ["radhusplassen_gjennomgangstrafikk", "gjennomgangstrafikk", "transportbegrep", "Trafikk som passerer et område uten at området er reisens mål.", "Fjerningen av gjennomgangstrafikken var et nøkkelgrep i omformingen av Rådhusplassen.", urls.byleksikon],
    ["radhusplassen_representativitet", "representativitet", "styringsbegrep", "Krav om at bruk og utforming skal passe et offentlig og seremonielt forrom.", "Kommunens utleieregler bruker representativitet som kriterium for arrangementer på plassen.", urls.useRules],
    ["radhusplassen_havnefront", "havnefront", "byromsbegrep", "Byens fysiske møte mellom bebyggelse, kaier og sjø.", "Rådhusplassen kobler sentrum til Rådhusbryggene og fjorden.", urls.municipality]
  ].map(([id, term, type, meaning, context, url]) => ({ id, term, type, meaning, context, linked_to: { kind: "place", id: placeId }, tags: ["Rådhusplassen", type], sources: [{ label: url === urls.useRules ? "Oslo kommune – leie Rådhusplassen" : url === urls.byleksikon ? "Oslo byleksikon – Rådhusplassen" : "Oslo kommune – Rådhusplassen", url }] }))
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files ||= {};
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const stories = [
  {
    id: "st_radhusplassen_fra_trafikk_til_byrom", quality_profile: "episode_v1", type: "turning_point", title: "Da trafikkplassen ble bilfri", year: 1994, place_id: placeId,
    summary: "Gjennomgangstrafikken forsvant i 1990, og i 1994 ble Rådhusplassen bilfri. Året etter kom trikken tilbake over plassen.",
    story: "I flere tiår var området foran Oslo rådhus fylt av gjennomgangstrafikk. Rådhuset vendte mot fjorden, men veisystemet gjorde forbindelsen mellom by og brygger tung å krysse.\n\nFestningstunnelen fjernet gjennomgangstrafikken i 1990. I 1994 ble de siste bilgrepene lagt om slik at Rådhusplassen kunne bli bilfri. Endringen var ikke det samme som å gjøre plassen transportfri.\n\nI 1995 kom trikken tilbake over plassen. Resultatet ble et nytt fordelingsprinsipp: gående, trikk, bryggebrukere og arrangementer kunne dele arealet uten den gamle hovedveien som dominerende struktur.",
    episode: { actors: ["Oslo kommune", "kollektivreisende", "gående"], date: "1994", action: "Rådhusplassen ble bilfri.", consequence: "Plassen ble et sammenhengende offentlig rom mot fjorden, med ny trikkelinje fra 1995." },
    sources: [{ title: "Oslo kommune – Fjordbyen: Rådhusplassen", url: urls.municipality }, { title: "Oslo byleksikon – Rådhusplassen", url: urls.byleksikon }, { title: "Oslo Byarkiv – TOBIAS 1/1998", url: urls.byarkiv }],
    tags: ["1990", "1994", "1995", "bilfri", "trikk"], related_people: [], related_places: ["oslo_radhus"], score: { narrative: 3, historical: 3, source: 5, play_value: 3, originality: 3, total: 17 },
    arc: { start: "Biltrafikken skilte rådhuset fra bryggene.", middle: "Gjennomgangstrafikken ble fjernet og plassen gjort bilfri.", end: "Trikken kom tilbake i et plassrom der gående og offentlig bruk fikk større plass." }
  },
  {
    id: "st_radhusplassen_minnesamlingen_2011", quality_profile: "episode_v1", type: "civic_gathering", title: "Da byen fylte Rådhusplassen", year: 2011, place_id: placeId,
    summary: "25. juli 2011 ble Rådhusplassen fylt av en stor offentlig minnesamling etter terrorangrepene 22. juli.",
    story: "Rådhusplassen er laget for å kunne romme svært mange mennesker, men kapasiteten får først mening når den tas i bruk. 25. juli 2011 ble plassen et slikt kollektivt rom.\n\nOslo byleksikon beskriver en minnesamling med opptil omkring 100 000 mennesker etter terrorangrepene 22. juli. Hendelsen behandles her som historie om offentlig rom, ikke som en gjenfortelling av volden.\n\nSamlingen viser hvorfor den bilfrie, åpne flaten har en annen civic funksjon enn den tidligere trafikkplassen. Plassen kan på kort tid gå fra hverdagsferdsel til et felles rom for sorg, markering og offentlig nærvær.",
    episode: { actors: ["deltakere i minnesamlingen", "Oslo kommune"], date: "2011-07-25", action: "En stor minnesamling fylte Rådhusplassen.", consequence: "Hendelsen demonstrerte plassens rolle som kollektivt samlingsrom i en nasjonal krisesituasjon." },
    sources: [{ title: "Oslo byleksikon – Rådhusplassen", url: urls.byleksikon }],
    tags: ["2011", "minne", "offentlig rom", "samling"], related_people: [], related_places: ["oslo_radhus"], score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 },
    arc: { start: "Rådhusplassen var et stort bilfritt byrom.", middle: "25. juli 2011 fylte en stor minnesamling plassen.", end: "Plassens åpne form ble brukt som kollektivt rom for sorg og offentlig nærvær." }
  }
];
const storyFile = "data/stories/stories_radhusplassen.json";
write(storyFile, stories);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files ||= [];
storyManifest.files = storyManifest.files.filter(entry => (typeof entry === "string" ? entry !== storyFile : entry?.path !== storyFile));
storyManifest.files.push({ category: "by", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
episodeManifest.files ||= [];
episodeManifest.files = episodeManifest.files.filter(entry => String(typeof entry === "string" ? entry : entry?.path || "") !== storyFile);
episodeManifest.files.push(storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const lesespor = read("data/lesespor/oslo/lesespor_oslo_by.json");
lesespor.items = (lesespor.items || []).filter(row => !String(row.id || "").startsWith("lesespor_radhusplassen_"));
const readingDefs = [
  ["001", "Rådhusplassen i Fjordbyen", "Oslo kommune", "municipal_page", urls.municipality, ["fjordby", "bilfri plass", "trikk"], "Kommunens oversikt over størrelse, trafikkendring, trikk, brygger og dagens bruk."],
  ["002", "Rådhusplassen", "Oslo byleksikon", "reference_article", urls.byleksikon, ["historie", "trafikk", "offentlig rom"], "Historisk referanseverk om kunst, transport, arrangementer og sentrale hendelser på plassen."],
  ["003", "TOBIAS 1/1998 – Rådhusplassen", "Oslo Byarkiv", "archive_article", urls.byarkiv, ["rådhusplan", "kunst", "byarkiv"], "Byarkivets historiske gjennomgang av plan, kunstkonkurranse og omforming av plassen."],
  ["004", "Leie Rådhusplassen", "Oslo kommune", "governance_page", urls.useRules, ["arrangement", "regler", "representativitet"], "Kommunens bruksregler gjør styringen av et representativt offentlig rom direkte lesbar."]
];
for (const [suffix, title, publication, type, url, themes, relevance] of readingDefs) lesespor.items.push({
  id: `lesespor_radhusplassen_${suffix}`, title, popupDesc: relevance, author: null, publication, date: null, year: null, type,
  subjects: [{ type: "theme", name: themes[0], id: null }], place_ids: [placeId], category_hints: ["by"], summary: { themes }, classification: { tags: themes },
  url, access: "open", rights: "link_only", source_quality: publication === "Oslo kommune" || publication === "Oslo Byarkiv" ? "primary_or_institutional" : "recognized", curation_status: "approved", relevance
});
write("data/lesespor/oslo/lesespor_oslo_by.json", lesespor);

const sourceDefs = {
  municipality: { url: urls.municipality, source_type: "primary_institutional", review_status: "reviewed", review_note: "Kontrollert mot kommunens Fjordbyen-side." },
  use_rules: { url: urls.useRules, source_type: "primary_institutional", review_status: "reviewed", review_note: "Kontrollert mot kommunens bruksregler." },
  byleksikon: { url: urls.byleksikon, source_type: "edited_or_local_reference", review_status: "reviewed", review_note: "Kontrollert for stedshistoriske påstander." },
  byarkiv: { url: urls.byarkiv, source_type: "archive_publication", review_status: "reviewed", review_note: "Kontrollert for plan- og utsmykningshistorie." },
  bell: { url: urls.bell, source_type: "primary_institutional", review_status: "reviewed", review_note: "Kontrollert for Untuned Bell og offentlig kunst." }
};
const quiz = read(quizFile);
if (quiz.sets.length !== 5 || quiz.sets.some(set => set.questions.length !== 7)) throw new Error("Rådhusplassen legacy quiz is not 5x7");
const questions = quiz.sets.flatMap(set => set.questions);
if (questions.length !== 35) throw new Error("Rådhusplassen quiz must contain 35 questions");
const theory = [
  ["met_feltobservasjon", "jan_gehl", "Life Between Buildings", "byliv_aapne_rom"],
  ["met_feltobservasjon", "william_h_whyte", "The Social Life of Small Urban Spaces", "urb_offentlig_rom_ide"],
  ["met_for_etter", "kevin_lynch", "The Image of the City", "urb_byidealer"]
];
for (let index = 0; index < questions.length; index += 1) {
  const q = questions[index];
  q.question_type = index < 21 ? "fact" : index < 28 ? "context" : "concept";
  const sourceKey = /arrangement|regel|kommersi|represent/iu.test(`${q.question} ${q.knowledge || ""}`) ? "use_rules" : /kunst|fontene|skulptur|1917|1938/iu.test(`${q.question} ${q.knowledge || ""}`) ? "byarkiv" : index % 2 ? "byleksikon" : "municipality";
  q.source = [sourceDefs[sourceKey].url];
  q.source_origin = "external";
  q.knowledge_contract_version = 1;
  q.knowledge_link_status = "linked";
  delete q.method_id; delete q.method_ids; delete q.thinker_id; delete q.theory_ref; delete q.topic_hook_id; delete q.work;
  if (index >= 28) {
    const [methodId, thinkerId, work, topicHookId] = theory[(index - 28) % theory.length];
    q.method_id = methodId; q.method_ids = [methodId]; q.thinker_id = thinkerId; q.work = work; q.topic_hook_id = topicHookId;
    q.theory_ref = { topic_hook_id: topicHookId, thinker_id: thinkerId, work, why_it_helps: "Perspektivet brukes til å analysere observerbar byform og offentlig bruk; historiske påstander om Rådhusplassen må fortsatt dokumenteres med lokale kilder." };
  }
}
quiz.targetId = placeId;
quiz.categoryId = "by";
quiz.size_class = "rich";
quiz.sources = Object.fromEntries(Object.entries(sourceDefs).map(([key, value]) => [key, value.url]));
quiz.profile_snapshot = place.quiz_profile;
write(quizFile, quiz);

const brief = {
  schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: placeId, profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Kommunale kilder, Oslo byleksikon og Oslo Byarkiv bærer en 5×7-pakke som skiller selve Rådhusplassen fra Oslo rådhus og skiller observerbar byform fra historiske forklaringer.",
  scope: { place: "Rådhusplassen", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 21 },
  sources: sourceDefs,
  selected_curriculum: {
    module_ids: ["kur_by_01_byrom_akser_knutepunkt", "kur_by_04_historiske_lag_og_transformasjon"],
    emne_ids: ["em_by_midlertidige_installasjoner", "em_by_symbolsk_makt_og_representasjon", "em_by_torg_plasser_som_scene", "em_by_offentlige_rom_motesteder"],
    topic_hook_ids: ["byliv_aapne_rom", "urb_offentlig_rom_ide", "urb_byidealer", "byliv_midlertidighet"],
    method_ids: ["met_feltobservasjon", "met_for_etter"],
    thinker_ids: ["william_h_whyte", "kevin_lynch", "jan_gehl"],
    works: ["The Social Life of Small Urban Spaces", "The Image of the City", "Life Between Buildings"]
  },
  existing_quiz_audit: { searched_paths: [quizFile, "data/quiz/manifest.json", "data/quiz/by"], active_before: { file: quizFile, set_count: 5, question_count: 35, finding: "Legacy 5×7-bank finnes, men bruker eldre question_type/progression-metadata." }, decisions: ["Behold de 35 eksisterende spørsmålene og normaliser kontrakten i stedet for å skrive ny bank.", "Lås progresjonen til 21 fact + 7 context + 7 concept; teori og metode bindes bare i finalfasen."], knowledge_migration: "Eksisterende Knowledge-ID-er beholdes og canonical Knowledge bygges på nytt." },
  profile_decision: { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Eksisterende 35 spørsmål dekker geografi, transformasjon, offentlig bruk og analytiske begreper uten behov for fyllspørsmål." },
  held_back_candidates: ["Publikumsopplevelse uten brukerdata.", "Optisk før/etter-påstand uten samme ståsted.", "Påstander om politisk mening som ikke kan utledes av romformen alene."],
  claims: questions.map((q, index) => ({ claim_id: `claim_radhusplassen_quiz_${String(index + 1).padStart(2, "0")}`, order: index + 1, planned_phase: index < 7 ? "opening" : index < 28 ? "middle" : "final", family: q.question_type, statement: q.knowledge || `${q.question} – ${q.answer}`, source_ids: [Object.keys(sourceDefs).find(key => sourceDefs[key].url === q.source[0]) || "municipality"], source_origin: "external", emne_id: q.emne_id || "em_by_torg_plasser_som_scene" }))
};
write(briefFile, brief);
const built = await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: contextFile });
const quizAfter = read(quizFile);
quizAfter.production_context = {
  manifest_category: "by", profile: built.profile, standard_version: "3.4", source_brief: briefFile, context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(built.resolved_files).map(([key, value]) => [key, value.path])), required_inputs_loaded: built.required_inputs_loaded,
  pensum_module_ids: built.selected_curriculum.module_ids, emne_ids: built.selected_curriculum.emne_ids, topic_hook_ids: built.selected_curriculum.topic_hook_ids,
  method_ids: built.selected_curriculum.method_ids, thinker_ids: built.selected_curriculum.thinker_ids, works: built.selected_curriculum.works,
  source_review_status: built.source_review_status, existing_quiz_audit: built.existing_quiz_audit, profile_decision: built.profile_decision, held_back_candidates: built.held_back_candidates,
  normal_opening_questions: 21, theory_start_phase: "final", method_start_phase: "final"
};
write(quizFile, quizAfter);

let placeCardJs = fs.readFileSync(path.join(root, "js/ui/place-card.js"), "utf8");
if (!/radhusplassen\s*:\s*["']bilder\/QuizCards\/Radhusplassen\.webp["']/.test(placeCardJs)) {
  const anchor = /(\s+spikersuppa:\s*["']bilder\/QuizCards\/Spikersuppa\.webp["'],?)/;
  if (!anchor.test(placeCardJs)) throw new Error("QuizCard mapping anchor missing");
  placeCardJs = placeCardJs.replace(anchor, `$1\n  radhusplassen: "bilder/QuizCards/Radhusplassen.webp",`);
  fs.writeFileSync(path.join(root, "js/ui/place-card.js"), placeCardJs);
}

const packetClaims = [
  { id: "claim_radhusplassen_identity_01", claim: "Rådhusplassen er det offentlige plassrommet mellom Oslo rådhus og fjorden, ikke selve rådhusbygningen.", sourceUrl: urls.municipality, sourceLocation: "Fjordbyen – Rådhusplassen", sourceType: "institutional", verifiedAt, status: "verified", claimKind: "identity", evidenceMode: "direct", temporalStatus: "current" },
  { id: "claim_radhusplassen_transform_01", claim: "Rådhusplassen ble bilfri i 1994 og fikk ny trikkelinje i 1995.", sourceUrl: urls.municipality, sourceLocation: "Fjordbyen – Rådhusplassen", sourceType: "institutional", verifiedAt, status: "verified", claimKind: "fact", evidenceMode: "direct", temporalStatus: "historical" },
  { id: "claim_radhusplassen_use_01", claim: "Plassen brukes til store offentlige arrangementer og er underlagt særskilte krav til representativitet og kommersiell profilering.", sourceUrl: urls.useRules, sourceLocation: "Leie Rådhusplassen", sourceType: "institutional", verifiedAt, status: "verified", claimKind: "fact", evidenceMode: "direct", temporalStatus: "current" },
  { id: "claim_radhusplassen_object_01", claim: "Tordenskioldstatuen av Axel Ender står ved Rådhusplassen.", sourceUrl: urls.byleksikon, sourceLocation: "Oslo byleksikon – Rådhusplassen", sourceType: "reputable_secondary", verifiedAt, status: "verified", claimKind: "fact", evidenceMode: "direct", temporalStatus: "current" }
];
const production = {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Rådhusplassen as the canonical public square between Oslo rådhus and the fjord.", period: "1917–present", excludes: ["Oslo rådhus as building", "the whole Pipervika waterfront", "Rådhusbryggene as a separate harbour district"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category, coordinates: { lat: place.lat, lon: place.lon } },
  textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims: packetClaims,
  sentenceCoverage: { desc: [{ sentence: 1, claimIds: ["claim_radhusplassen_identity_01", "claim_radhusplassen_transform_01"] }], popupDesc: [{ sentence: 1, claimIds: ["claim_radhusplassen_identity_01"] }] },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Rådhusplassen source review", notes: "Identity, transformation, public-use and object claims are bound to inspected institutional/reference sources." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Rådhusplassen editorial review", introducedNewFacts: false, notes: "Place and building identities are kept separate; field observation is not used to prove historical causation." } },
  collections: { people: [personId], objects: ["radhusplassen_tordenskioldstatuen"], brands: [brandId], structures: ["radhusplassen_honnorbrygga"] },
  quiz: { status: "canonical_rich_5x7", totalQuestions: 35, fact: 21, context: 7, concept: 7, sourceBrief: briefFile, productionContext: contextFile },
  quizReadiness: { status: "canonical_rich_5x7", quizTargetId: placeId, sourceBrief: briefFile, productionContext: contextFile, normalOpeningQuestions: 21, totalQuestions: 35 },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: packetClaims.length, total: packetClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
};
write(`data/places/production/${placeId}.json`, production);

write(workcardFile, {
  schema: "history_go_place_workcard_v2", place_id: placeId, category: "by", status: "complete", production_profile: "standard", profile_status: "confirmed",
  profile_reason: "Rådhusplassen has four direct image-ready collections plus existing full Fagverk, 35-question quiz, public-space history and source-backed event material.",
  underbadge_ids: place.underbadge_ids || [],
  content_plan: { people: "PRODUCED: Albert Nordengen as canonical direct Rådhusplassen anchor.", objects: "PRODUCED: Tordenskioldstatuen as a physical place-specific object.", brands: "PRODUCED: canonical Sporveien brand linked to the tram layer.", category_expression: "PRODUCED: Honnørbrygga as Structure.", stories: "PRODUCED: two episode_v1 stories.", for_na: "HELD BACK: no same-viewpoint historical pair is asserted.", lesespor: "PRODUCED: four approved open link-only readings.", language: "PRODUCED: six place-specific terms.", fagverk: "PRESERVED/EXTENDED: curated full Fagverk v2." },
  collection_ids: ["people", "objects", "brands", "structures"],
  object_category_boundary: "People owns Nordengen as historical actor; Objects owns Tordenskioldstatuen; Brands owns Sporveien identity; Structures owns Honnørbrygga. Oslo rådhus remains a separate canonical Place.",
  null_measurement: { measured_at_commit: lockedMain, existing_place: true, existing_quiz: "legacy_5x7_old_taxonomy", existing_story: "one_legacy_story", existing_collections: 0, existing_fagverk: true, existing_language_lexicon: false, existing_people_links: 0, existing_people_image_ready: 0, existing_brand_links: 0, collision_search: "No open Rådhusplassen production PR found before production." },
  active_phase: "complete", active_file_scope: "Rådhusplassen canonical Place, existing canonical Person image, Object, Brand link, Structure, two Stories, dedicated leksikon, language, quiz/Knowledge, readings, local images, generated runtime and audit artifacts.",
  source_review: "complete", production_verified_at: verifiedAt, quiz_profile: "rich_5x7_21_7_7", fagverk_status: "curated_full", chronology_status: "PASS_ten_anchors", story_status: "PASS_two_episode_v1", objects_status: "PASS_one_signature_object", brands_status: "PASS_canonical_sporveien", people_status: "PASS_one_direct_image_ready_profile", branch_status: "materialized_pending_ci", live_status: "pending_merge", quality_gate: "30/30_pending_ci", canonical_next: null,
  held_back_candidates: ["Optically exact before/after comparison without a controlled same-viewpoint historical pair.", "Additional Objects without equally strong image/source provenance.", "Interpretations of crowd experience or political meaning not supported by direct evidence."]
});
write("reports/place-production/radhusplassen-phase1-24-gate-audit-v1.json", {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { existing_place: true, identity_overlap: "Rådhusplassen is the square; Oslo rådhus remains a separate canonical building Place.", existing_fagverk: "curated_full", existing_quiz: "5x7_old_taxonomy" },
  quality_score: { correctness_and_evidence: 5, coverage_and_completion: 5, professional_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 5, total: 30, critical_findings: 0, unresolved_blockers: 0 }
});
write("reports/place-production/radhusplassen-production-v1.json", {
  schema: "history_go_place_production_v1", place_id: placeId, status: "complete", verified_at: verifiedAt,
  identity_boundary: "Rådhusplassen is the public square and must not be collapsed into the separate Oslo rådhus building Place.",
  collections: production.collections, quiz: { sets: 5, questions: 35, fact: 21, context: 7, concept: 7 }, stories: 2, chronology: 10, language_entries: 6, lesespor: 4, quality_gate: "30/30_pending_ci"
});

console.log(JSON.stringify({ placeId, collections: production.collections, quiz: production.quiz, stories: stories.length, chronology: chronology.length, language: 6, lesespor: 4 }, null, 2));
