#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { runBuildQuizProductionContext } from "./build-quiz-production-context.mjs";

const root = process.cwd();
const placeId = "ullern";
const personId = "eilif_peterssen";
const verifiedAt = "2026-09-07";
const placeFile = "data/places/by/oslo/places/ullern.json";
const workcardFile = "reports/place-production/ullern-workcard-current.json";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const upsertById = (array, value) => {
  const index = array.findIndex(item => item.id === value.id);
  if (index < 0) array.push(value); else array[index] = value;
};
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const epokeIndexBefore = read("data/epoker/epoke-place-index.json");
const placeImageSummaryBefore = read("data/places/place_image_backlog_summary.json");

const urls = {
  byleksikon: "https://oslobyleksikon.no/side/Ullern_%28str%C3%B8k%29",
  bydel: "https://oslobyleksikon.no/index.php?title=Ullern_%28bydel%29",
  smestadbanen: "https://oslobyleksikon.no/side/Smestadbanen",
  roabanen: "https://oslobyleksikon.no/side/R%C3%B8abanen",
  sorbyhaugen: "https://oslobyleksikon.no/side/S%C3%B8rbyhaugen_%28str%C3%B8k%29",
  churchOfficial: "https://www.kirken.no/nb-NO/fellesrad/kirkeneioslo/menigheter/Ullern/om-oss/om-ullern-kirke/",
  churchSnl: "https://snl.no/Ullern_kirke",
  peterssenSnl: "https://snl.no/Eilif_Peterssen",
  localHistory: "https://lokalhistoriewiki.no/wiki/Ullern_%28str%C3%B8k%29",
  commonsExteriorPage: "https://commons.wikimedia.org/wiki/File:UllernKirke.jpg",
  commonsExteriorAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/UllernKirke.jpg",
  commonsInteriorPage: "https://commons.wikimedia.org/wiki/File:Ullern_kirke_OB.Y3918.jpg",
  commonsInteriorAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ullern%20kirke%20OB.Y3918.jpg",
  commonsPersonPage: "https://commons.wikimedia.org/wiki/File:Eilif_Peterssen.png",
  commonsPersonAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Eilif%20Peterssen.png",
  commonsHistoricPage: "https://commons.wikimedia.org/wiki/File:Ullern_kirke_og_kirkeg%C3%A5rd_-_1921_-_Anders_Beer_Wilse_-_Oslo_Museum_-_OB.Y2322.jpg",
  commonsHistoricAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ullern%20kirke%20og%20kirkeg%C3%A5rd%20-%201921%20-%20Anders%20Beer%20Wilse%20-%20Oslo%20Museum%20-%20OB.Y2322.jpg"
};

const imageCache = new Map();
async function fetchBuffer(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  let status = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "History-Go-Ullern-production/1.0" } });
    status = response.status;
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      imageCache.set(url, buffer);
      return buffer;
    }
    if (![429, 500, 502, 503, 504].includes(response.status)) break;
    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 16000)));
  }
  throw new Error(`Kunne ikke hente bilde (${status}): ${url}`);
}
async function outputImage({ url, file, width, height, fit = "cover", position = "centre", background = "#ffffff" }) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(await fetchBuffer(url)).rotate().resize(width, height, { fit, position, background, withoutEnlargement: false }).webp({ quality: 86, effort: 5 }).toFile(target);
}

await outputImage({ url: urls.commonsExteriorAsset, file: "bilder/places/ullern.webp", width: 1200, height: 800 });
await outputImage({ url: urls.commonsExteriorAsset, file: "bilder/places/ullern_front_portrait.webp", width: 900, height: 1200, position: "centre" });
await outputImage({ url: urls.commonsHistoricAsset, file: "bilder/QuizCards/Ullern.webp", width: 900, height: 1200, position: "centre" });
await outputImage({ url: urls.commonsInteriorAsset, file: "bilder/kort/objects/ullern_alterbaldakin.webp", width: 900, height: 620, position: "centre" });
await outputImage({ url: urls.commonsExteriorAsset, file: "bilder/kort/structures/ullern_kirke.webp", width: 900, height: 620, position: "centre" });
await outputImage({ url: urls.commonsPersonAsset, file: "bilder/kort/people/eilif_peterssen.webp", width: 900, height: 1200, fit: "contain" });
await outputImage({ url: urls.commonsHistoricAsset, file: "bilder/historisk/ullern/ullern_kirke_1921.webp", width: 1200, height: 800 });
await outputImage({ url: urls.commonsExteriorAsset, file: "bilder/historisk/ullern/ullern_kirke_2007.webp", width: 1200, height: 800 });

const exteriorMeta = {
  source: "wikimedia_commons", sourcePage: urls.commonsExteriorPage, creator: "Hans A. Rosbach", credit: "Hans A. Rosbach / Wikimedia Commons",
  license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", date: "2007-05-27",
  assetType: "documentary_church_photo", transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const interiorMeta = {
  source: "oslo_museum_via_wikimedia_commons", sourcePage: urls.commonsInteriorPage, creator: "Anders Beer Wilse", credit: "Anders Beer Wilse / Oslo Museum / Wikimedia Commons",
  license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/", date: "1939",
  assetType: "historical_interior_photo", transformation: "Proporsjonalt utsnitt av kor, alter og baldakin; WebP-normalisert.", verifiedAt
};
const personMeta = {
  source: "wikimedia_commons", sourcePage: urls.commonsPersonPage, creator: "Christian Krohg", credit: "Christian Krohg / Wikimedia Commons",
  license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/", date: "1884_or_earlier",
  assetType: "historical_portrait_drawing", transformation: "Proporsjonal innpassing på stående kort uten generativ endring.", verifiedAt
};
const historicMeta = {
  source: "oslo_museum_via_wikimedia_commons", sourcePage: urls.commonsHistoricPage, creator: "Anders Beer Wilse", credit: "Anders Beer Wilse / Oslo Museum / Wikimedia Commons",
  license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/", date: "1921",
  assetType: "historical_documentary_photo", transformation: "Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};

const place = read(placeFile);
const coordSnapshot = JSON.stringify({ lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl });
const desc = "Ullern kirke ble innviet i 1903, og Ullern ble eget sogn i 1906. Smestadbanen åpnet til Smestad i 1912, ble forlenget til Røa i 1935, og Kolsåsforbindelsen over Ullernåsen åpnet i 1942. Området ble bygget ut over lang tid og rommer både villaer, rekkehus, terrassehus og blokker.";
const popupDesc = "Ullern er et boligstrøk i ytre by vest med navn etter Ullern-gårdene. Kirken ble innviet i 1903, og Ullern sogn ble skilt ut fra Vestre Aker i 1906. Dette ga området et tydelig institusjonelt tyngdepunkt før den store boligveksten.\n\nKollektivutbyggingen åpnet nye deler av området for daglig pendling. Smestadbanen mellom Majorstuen og Smestad ble satt i drift i 1912. Den ble forlenget til Røa i 1935 og fikk navnet Røabanen. I 1942 åpnet forbindelsen Sørbyhaugen–Jar over Ullernåsen, senere del av Kolsåsbanen.\n\nUllern ble derfor ikke bygget ut i én enkelt fase. Oslo byleksikon beskriver en lang utvikling der villabebyggelse dominerer, samtidig som rekkehus, terrassehus, blokker og høyhus finnes i deler av området. Synlig boligform kan dokumentere tetthet, tomtestørrelse og bygningstype, men ikke alene inntekt, klasse eller hvem som har hatt tilgang til boligene.\n\nKirken gir et konsentrert møte mellom arkitektur og kunst. Harald Bødtker tegnet den nyromanske korskirken. I apsis utførte Eilif Peterssen «Kristi himmelfart» i 1908–1909, mens Gabriel Kielland står bak de store glassmaleriene. Foran apsis står en sjelden alterbaldakin i italiensk marmor og bysantinsk stil.\n\nBestum skole åpnet i 1921, Ullern idrettsplass i 1922, og både Ullern videregående skole og Radiumhospitalet kom i gang i 1931. Slike institusjoner gjorde Ullern til mer enn et boligområde: mennesker reiser hit for skole, idrett, behandling og arbeid uten nødvendigvis å bo i strøket.\n\nUllern er dermed et godt feltsted for å lese hvordan transport, boligstruktur og institusjoner bygges opp lagvis. De historiske kildene dokumenterer tidslinjen; dagens gater, bygninger og banespor kan brukes til observasjon. De to kildetypene må holdes fra hverandre når man forklarer hvorfor området ser ut som det gjør.";

Object.assign(place, {
  desc, popupDesc,
  image: "bilder/places/ullern.webp",
  frontImage: "bilder/places/ullern_front_portrait.webp",
  quizCardImage: "bilder/QuizCards/Ullern.webp",
  imageMeta: { ...exteriorMeta, outputDimensions: "1200x800" },
  frontImageMeta: { ...exteriorMeta, outputDimensions: "900x1200", orientation: "portrait" },
  quizCardImageMeta: { ...historicMeta, outputDimensions: "900x1200", usage: "quiz_card_back_only", note: "Historisk foto fra 1921 brukes som separat QuizCard-flate, ikke som frontImage." },
  production_profile: "standard", profile_status: "confirmed", production_status: "complete", production_verified_at: verifiedAt,
  underbadge_ids: ["bolig_og_bomiljo", "infrastruktur"],
  related_people_ids: [personId],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2", production_profile: "standard",
    collection_ids: ["people", "objects", "brands", "structures"],
    reason: "Ullern har fire separate, kildebårne og bildeklare flater: Eilif Peterssen som kunstner med et hovedverk i kirken, den fysiske alterbaldakinen, Sporveien som kollektiv merkeidentitet og Ullern kirke som sentral struktur.", verifiedAt
  },
  objects: [{
    id: "ullern_alterbaldakin", title: "Alterbaldakinen i Ullern kirke", name: "Alterbaldakinen i Ullern kirke", type: "alterbaldakin", kind: "physical_object", year: 1903,
    desc: "En sjelden baldakin i italiensk marmor i bysantinsk stil står foran apsis og er en selvstendig fysisk del av kirkeinteriøret.",
    historicalFunction: "Markerer og rammer inn alterpartiet i kirkerommet.", physicalObject: true, placeSpecific: true, collectable: true, storePrice: 35, currency: "PC", collection: "ullern_kirkekunst",
    placeSpecificReason: "Den norske kirke og SNL beskriver baldakinen eksplisitt som et særpreget element i Ullern kirke.", why_here: "Baldakinen gjør materialbruk og historisk stilvalg synlig som fysisk objekt, adskilt fra Peterssens veggmaleri.",
    unlock: "Observer baldakinens materiale og form fra offentlig tilgjengelig del av kirkerommet når kirken er åpen.", image: "bilder/kort/objects/ullern_alterbaldakin.webp", imageMeta: interiorMeta,
    source_urls: [urls.churchOfficial, urls.churchSnl, urls.commonsInteriorPage]
  }],
  structures: [{
    id: "ullern_kirke", title: "Ullern kirke", name: "Ullern kirke", type: "kirke", kind: "church_structure", year: 1903,
    desc: "Ullern kirke er en hvitmalt murkirke i romansk stil, tegnet av Harald Bødtker og oppført i 1903.", historicalFunction: "Sognekirke og lokalt institusjonelt anker for Ullern.",
    placeSpecificReason: "Kirken ligger i Ullern og er dokumentert av Den norske kirke som bygg fra 1903.", why_here: "Kirken samler arkitektur, sognedannelse og flere kunstverk i ett fysisk anlegg.",
    image: "bilder/kort/structures/ullern_kirke.webp", imageMeta: { ...exteriorMeta, outputDimensions: "900x620" }, source_urls: [urls.churchOfficial, urls.churchSnl, urls.commonsExteriorPage]
  }],
  for_na: {
    title: "Ullern kirke: 1921 og 2007",
    beforeImage: "bilder/historisk/ullern/ullern_kirke_1921.webp", nowImage: "bilder/historisk/ullern/ullern_kirke_2007.webp",
    before: { year: 1921, image: "bilder/historisk/ullern/ullern_kirke_1921.webp", caption: "Ullern kirke og kirkegård fotografert av Anders Beer Wilse i 1921.", imageMeta: historicMeta },
    now: { year: 2007, image: "bilder/historisk/ullern/ullern_kirke_2007.webp", caption: "Ullern kirke fotografert av Hans A. Rosbach i 2007.", imageMeta: exteriorMeta },
    change: "Bildene dokumenterer kirken i to perioder, men fra ulike ståsteder. De kan brukes til å sammenligne hovedvolum og landskapskontekst, ikke til å bevise alle mellomliggende endringer.",
    lookFor: ["Sammenlign korsform og sentraltårn.", "Se hvordan kirkegård og vegetasjon rammer inn bygget.", "Skill kameravinkel fra faktisk fysisk endring."],
    sources: [urls.commonsHistoricPage, urls.commonsExteriorPage, urls.churchOfficial]
  },
  externalLinks: [
    { type: "local_history", label: "Oslo byleksikon – Ullern (strøk)", url: urls.byleksikon, verifiedAt },
    { type: "local_history", label: "Oslo byleksikon – Ullern (bydel)", url: urls.bydel, verifiedAt },
    { type: "local_history", label: "Oslo byleksikon – Smestadbanen", url: urls.smestadbanen, verifiedAt },
    { type: "local_history", label: "Oslo byleksikon – Røabanen", url: urls.roabanen, verifiedAt },
    { type: "local_history", label: "Oslo byleksikon – Sørbyhaugen (strøk)", url: urls.sorbyhaugen, verifiedAt },
    { type: "official", label: "Ullern menighet – Om Ullern kirke", url: urls.churchOfficial, verifiedAt },
    { type: "reference", label: "Store norske leksikon – Ullern kirke", url: urls.churchSnl, verifiedAt },
    { type: "reference", label: "Store norske leksikon – Eilif Peterssen", url: urls.peterssenSnl, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – UllernKirke.jpg", url: urls.commonsExteriorPage, verifiedAt }
  ]
});
delete place.cardImage;
delete place.imageCard;

place.fagverk = {
  schema: "history_go_place_fagverk_v2", level: "full", status: "curated",
  intro: "Ullern er et feltsted for å undersøke hvordan transport, boligstruktur og institusjoner virker sammen over tid. Områdets lange utbyggingshistorie gjør det særlig egnet til å skille mellom det som kan observeres i dagens byform og det som må dokumenteres historisk.",
  article: [
    "Ullern vokste fram over et langt tidsrom. Oslo byleksikon beskriver tidlig bymessig utbygging i tilknytning til industrien langs Lysakerelva og Skøyen, og senere nye utbyggingsmuligheter gjennom jernbane og forstadsbaner. Dette betyr at én enkelt plan eller epoke ikke forklarer dagens struktur.",
    "Smestadbanen åpnet til Smestad i 1912, ble forlenget til Røa i 1935, og forbindelsen Sørbyhaugen–Jar over Ullernåsen åpnet i 1942. Forstadsbanene reduserte reisetiden til byen og gjorde nye områder tilgjengelige for boligbygging. Den romlige sammenhengen mellom holdeplasser, gatenett og boliger kan observeres i felt, mens årsakssammenhengen må støttes av historiske kilder.",
    "Boligstrukturen er variert. Villabebyggelse dekker store arealer, men kildene dokumenterer også rekkehus, terrassehus, blokker og høyhus. Dette er observerbare typologier. De kan brukes til å analysere tetthet og byform, men de kan ikke alene bevise beboernes inntekt, klasse eller boligtilgang.",
    "Ullern kirke viser hvordan et lokalt institusjonsbygg kan samle flere historiske lag. Bygget er fra 1903, Peterssens apsismaleri fra 1908–1909, og glassmaleriene er utført av Gabriel Kielland. Alterbaldakinen er et eget fysisk objekt. Å skille bygg, objekt og kunstverk hindrer at forskjellige kildetyper blandes sammen.",
    "Bestum skole, Ullern idrettsplass, Ullern videregående skole og Radiumhospitalet viser at området fikk funksjoner som trekker brukere utenfra. Et boligstrøk kan derfor ikke forstås bare gjennom hvem som bor der; skole, behandling, idrett og arbeid skaper egne daglige bevegelsesmønstre.",
    "Ullern forbindes ofte med vestkant og romslige boliger. Faglig analyse krever likevel en grense mellom morfologi og sosial tolkning. Tomtestørrelse, bygningstype, høyde og avstand kan registreres direkte. Påstander om segregasjon, formue eller sosial mobilitet krever egne statistiske og historiske datasett."
  ],
  subject_ids: ["by"],
  emne_ids: ["em_by_boligstruktur", "em_by_bydelsforskjeller_segregering", "em_by_infrastruktur_mobilitet", "em_by_historiske_lag_i_hverdagsrom"],
  chapter_ids: ["arkitektur-type-skala-byform", "bolig-nabolag-tilgang-endring", "urbanisme-idealer-forbindelser-fortetting"],
  lenses: [
    { id: "ullern-transport", title: "Banene som bymotor", prompt: "Hvordan ligger boligområder og institusjoner i forhold til forstadsbanenes traséer?", subject_id: "by", emne_id: "em_by_infrastruktur_mobilitet", evidence: "Smestadbanen åpnet i 1912, Røa-forlengelsen i 1935 og Sørbyhaugen–Jar i 1942." },
    { id: "ullern-boligtypologi", title: "Boligtypologi og tetthet", prompt: "Hvilke boligtyper og tettheter kan skilles i dagens Ullern?", subject_id: "by", emne_id: "em_by_boligstruktur", evidence: "Kildene dokumenterer villaer, rekkehus, terrassehus, blokker og høyhus." },
    { id: "ullern-sosial-grense", title: "Sosial tolkning med grense", prompt: "Hva kan byformen fortelle, og hvilke sosiale påstander krever andre data?", subject_id: "by", emne_id: "em_by_bydelsforskjeller_segregering", evidence: "Boligtype og tetthet er observerbare; inntekt og segregasjon krever egne data." },
    { id: "ullern-institusjoner", title: "Institusjoner og reiser", prompt: "Hvordan skaper skole, kirke, idrett og helse andre bevegelsesmønstre enn boligene alene?", subject_id: "by", emne_id: "em_by_historiske_lag_i_hverdagsrom", evidence: "Flere institusjoner ble etablert mellom 1903 og 1931." },
    { id: "ullern-kirkekunst", title: "Bygg, objekt og kunstverk", prompt: "Hvordan kan kirken analyseres uten å blande Structure, Object og kunstnerisk verk?", subject_id: "by", emne_id: "em_by_historiske_lag_i_hverdagsrom", evidence: "Kirken, baldakinen og Peterssens maleri er ulike fysiske og kunsthistoriske enheter." }
  ],
  guiding_questions: [
    "Hvordan påvirket banene hvilke deler av Ullern som kunne bygges ut?",
    "Hvorfor er Ullern mer presist beskrevet som et blandet boligmiljø enn som et rent villaområde?",
    "Hva kan tomter og boligtyper vise direkte, og hva kan de ikke bevise om sosial status?",
    "Hvordan skiller kirken som Structure seg fra baldakinen som Object og Peterssens maleri som kunstverk?",
    "Hvordan skaper skoler, idrettsanlegg og sykehus reiser til Ullern uten at de reisende bor der?",
    "Hvilke deler av dagens byform kan knyttes sikkert til 1912, 1935 og 1942, og hvilke krever mer detaljert dokumentasjon?"
  ],
  concepts: ["forstadsbane", "boligtypologi", "villabebyggelse", "rekkehus", "terrassehus", "blokk", "morfologi", "tetthet", "institusjon", "mobilitet", "historisk lag", "segregasjon"],
  observable_traces: [
    { title: "Boligtyper i felt", observation: "Registrer forskjeller mellom frittliggende hus, rekkehus, terrassehus og blokker.", interpretation_boundary: "Form dokumenterer ikke alene beboernes økonomi eller klasse.", source_urls: [urls.byleksikon, urls.bydel] },
    { title: "Banespor og forbindelser", observation: "Se hvordan spor, stasjoner, broer og gatenett organiserer bevegelse.", interpretation_boundary: "Dagens anlegg kan være ombygd og er ikke automatisk identisk med 1912- eller 1942-utformingen.", source_urls: [urls.smestadbanen, urls.roabanen, urls.sorbyhaugen] },
    { title: "Kirken som lagdelt anlegg", observation: "Skill eksteriør, baldakin, apsismaleri og glassmalerier som ulike enheter.", interpretation_boundary: "Visuell observasjon alene daterer ikke elementene; datering hentes fra kildene.", source_urls: [urls.churchOfficial, urls.churchSnl] }
  ],
  source_urls: [urls.byleksikon, urls.bydel, urls.churchOfficial, urls.churchSnl, urls.smestadbanen, urls.roabanen, urls.sorbyhaugen, urls.peterssenSnl], verified_at: verifiedAt
};

if (coordSnapshot !== JSON.stringify({ lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl })) throw new Error("Ullern coordinate contract changed");
write(placeFile, place);

const personFile = `data/people/by/oslo/ullern/${personId}.json`;
const person = {
  id: personId, name: "Eilif Peterssen", initials: "EP", category: "by", year: 1908, kindLabel: "Maler",
  role: "Utførte apsismaleriet «Kristi himmelfart» i Ullern kirke 1908–1909",
  desc: "Eilif Peterssen utførte det monumentale apsismaleriet «Kristi himmelfart» i Ullern kirke i 1908–1909.",
  popupDesc: "Eilif Peterssen var en av Norges sentrale malere på slutten av 1800-tallet. I Ullern kirke utførte han «Kristi himmelfart» direkte på apsisveggen i 1908–1909. Personkortet gjelder den direkte dokumenterte Ullern-tilknytningen gjennom dette verket, ikke hele kunstnerskapet.",
  placeId, source_place_id: placeId, places: [placeId], tags: ["kunst", "kirkekunst", "Ullern kirke", "1908", "1909"],
  image: "bilder/kort/people/eilif_peterssen.webp", imageMeta: personMeta,
  profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1", claimsFile: `data/people/claims/by/oslo/ullern/${personId}.claims.json`,
  source_urls: [urls.peterssenSnl, urls.churchOfficial, urls.churchSnl, urls.commonsPersonPage], verifiedAt
};
write(personFile, [person]);
write(`data/people/claims/by/oslo/ullern/${personId}.claims.json`, {
  schema: "history_go_people_claims_v1", personId, placeId, verifiedAt,
  claims: [
    { id: "claim_eilif_peterssen_ullern_01", claim: "Eilif Peterssen utførte apsisutsmykningen «Kristi himmelfart» i Ullern kirke i 1908–1909.", sourceUrl: urls.peterssenSnl, status: "verified" },
    { id: "claim_eilif_peterssen_ullern_02", claim: "Maleriet er tilpasset alterbaldakinen i Ullern kirke.", sourceUrl: urls.churchSnl, status: "verified" },
    { id: "claim_eilif_peterssen_ullern_03", claim: "Peterssen var norsk maler født i 1852 og død i 1928.", sourceUrl: urls.peterssenSnl, status: "verified" }
  ]
});
const peopleManifest = read("data/people/manifest.json");
addOnce(peopleManifest.files, "people/by/oslo/ullern/eilif_peterssen.json");
write("data/people/manifest.json", peopleManifest);

const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = ["sporveien"];
write("data/brands/brands_by_place.json", brandsByPlace);
const brandsMaster = read("data/brands/brands_master.json");
const sporveien = brandsMaster.find(item => item.id === "sporveien");
if (!sporveien) throw new Error("Canonical Sporveien brand missing");
sporveien.place_ids ||= [];
addOnce(sporveien.place_ids, placeId);
write("data/brands/brands_master.json", brandsMaster);

const chronology = [
  [1903, "Ullern kirke innvies", "Ullern kirke ble innviet og ble et markant lokalt anker.", urls.churchOfficial],
  [1906, "Ullern blir eget sogn", "Ullern sogn ble skilt ut fra Vestre Aker.", urls.byleksikon],
  [1912, "Smestadbanen åpner", "Forstadsbanen Majorstuen–Smestad ble satt i drift.", urls.smestadbanen],
  [1921, "Bestum skole åpner", "Bestum skole åpnet som en av områdets institusjoner.", urls.byleksikon],
  [1922, "Ullern idrettsplass", "Det kommunale idrettsanlegget kom i bruk.", urls.byleksikon],
  [1931, "Skole og sykehus", "Ullern videregående skole kom i gang og Radiumhospitalet åpnet.", urls.byleksikon],
  [1935, "Banen forlenges til Røa", "Smestadbanen ble forlenget og fikk navnet Røabanen.", urls.roabanen],
  [1942, "Forbindelsen over Ullernåsen", "Sørbyhaugen–Jar-forbindelsen åpnet som del av banen mot Kolsås.", urls.sorbyhaugen],
  [1948, "Aker innlemmes i Oslo", "Ullern ble del av Oslo da Aker kommune ble innlemmet.", "https://snl.no/Ullern"],
  [1995, "Røabanen får T-banestandard", "Røabanen ble del av T-banenettet med oppgradert standard.", urls.roabanen]
].map(([year, period, text, source], index) => ({ id: `chrono_ullern_${String(index + 1).padStart(2, "0")}`, year, period, title: period, desc: text, confidence: "high", sources: [{ title: source.includes("kirken.no") ? "Ullern menighet" : source.includes("snl.no") ? "Store norske leksikon" : "Oslo byleksikon", url: source }] }));

const leksikonFile = "data/leksikon/places/oslo/by/leksikon_ullern.json";
write(leksikonFile, [{
  id: "ullern_hovedartikkel", visual: { designCode: "article_neighbourhood_miniature" }, place_id: placeId, title: "Ullern", version: 1,
  popupDesc: "Et variert vestlig boligstrøk der kirke, forstadsbaner og institusjoner viser hvordan området ble bygd ut lagvis.",
  wikiText: popupDesc.split("\n\n"),
  summary: { one_liner: "Boligstrøk formet over lang tid av transport, institusjoner og flere boligtypologier.", themes: ["boligstruktur", "forstadsbane", "institusjoner", "kirkekunst", "mobilitet"], tone: ["kildebasert", "analytisk"] },
  facts: [
    { id: "fact_ullern_01", label: "Kirke og sogn", desc: "Ullern kirke ble innviet i 1903 og sognet opprettet i 1906.", confidence: "high", sources: [urls.churchOfficial, urls.byleksikon] },
    { id: "fact_ullern_02", label: "Forstadsbaner", desc: "Smestadbanen åpnet i 1912, Røa-forlengelsen i 1935 og Sørbyhaugen–Jar i 1942.", confidence: "high", sources: [urls.smestadbanen, urls.roabanen, urls.sorbyhaugen] },
    { id: "fact_ullern_03", label: "Blandet boligstruktur", desc: "Villaer dominerer arealmessig, men Ullern har også rekkehus, terrassehus, blokker og høyhus.", confidence: "high", sources: [urls.byleksikon, urls.bydel] }
  ],
  sources: [urls.byleksikon, urls.bydel, urls.churchOfficial, urls.churchSnl, urls.smestadbanen, urls.roabanen, urls.sorbyhaugen, urls.localHistory, urls.peterssenSnl],
  externalLinks: place.externalLinks,
  chronology
}]);
const batch3File = "data/leksikon/places/oslo/by/leksikon_oslo_by_batch3.json";
const batch3 = read(batch3File).filter(item => item.place_id !== placeId);
write(batch3File, batch3);
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files ||= [];
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

write("data/leksikon/sprak/places/europe/norway/oslo/ullern.json", {
  place_id: placeId, title: "Språkleksikon: Ullern", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  notes: "Oppføringene forklarer stedets navn og fagord som er direkte relevante for Ullern; de hevder ikke en egen lokal dialekt.",
  entries: [
    { id: "ullern_stedsnavn", term: "Ullern", type: "stedsnavn", meaning: "Stedsnavnet kommer fra Ullern-gårdene.", context: "Oslo byleksikon knytter boligstrøkets navn til Ullern-gårdene.", linked_to: { kind: "place", id: placeId }, tags: ["stedsnavn", "gårdshistorie"], sources: [{ label: "Oslo byleksikon – Ullern", url: urls.byleksikon }] },
    { id: "ullern_forstadsbane", term: "forstadsbane", type: "fagord", meaning: "Bane som kobler forsteder til den tettere byen og kan påvirke utbyggingsmønsteret.", context: "Smestadbanen og senere Røabanen/Kolsåsforbindelsen er sentrale i Ullerns utbyggingshistorie.", linked_to: { kind: "place", id: placeId }, tags: ["transport", "byutvikling"], sources: [{ label: "Oslo byleksikon – Smestadbanen", url: urls.smestadbanen }] },
    { id: "ullern_villastrok", term: "villastrøk", type: "fagord", meaning: "Boligområde dominert av frittliggende villaer og relativt lav tetthet.", context: "Villastrøk utgjør store deler av Ullern, men er ikke den eneste boligformen.", linked_to: { kind: "place", id: placeId }, tags: ["bolig", "morfologi"], sources: [{ label: "Oslo byleksikon – Ullern", url: urls.byleksikon }] },
    { id: "ullern_terrassehus", term: "terrassehus", type: "fagord", meaning: "Boligbygg som følger terreng eller trappes i høyde, ofte med terrasser.", context: "Terrassehus inngår i den dokumenterte variasjonen i Ullerns boligstruktur.", linked_to: { kind: "place", id: placeId }, tags: ["boligtypologi"], sources: [{ label: "Oslo byleksikon – Ullern", url: urls.byleksikon }] },
    { id: "ullern_sogn", term: "sogn", type: "institusjonsbegrep", meaning: "Kirkelig geografisk og organisatorisk område knyttet til en menighet og kirke.", context: "Ullern ble eget sogn i 1906.", linked_to: { kind: "place", id: placeId }, tags: ["kirke", "institusjon"], sources: [{ label: "Oslo byleksikon – Ullern", url: urls.byleksikon }] },
    { id: "ullern_baldakin", term: "alterbaldakin", type: "arkitekturbegrep", meaning: "Overbygning eller baldakin som markerer alterstedet.", context: "Ullern kirke har en sjelden alterbaldakin i italiensk marmor i bysantinsk stil.", linked_to: { kind: "place", id: placeId }, tags: ["kirkearkitektur", "interiør"], sources: [{ label: "Ullern menighet – Om Ullern kirke", url: urls.churchOfficial }] }
  ]
});

const stories = [
  {
    id: "st_ullern_kirken_og_sognet", quality_profile: "episode_v1", type: "turning_point", title: "Da Ullern fikk kirke og eget sogn", year: 1903, place_id: placeId,
    summary: "Ullern kirke ble innviet i 1903. Tre år senere ble Ullern skilt ut som eget sogn fra Vestre Aker.",
    story: "3. juni 1903 ble Ullern kirke innviet. Den nye murkirken lå høyt i landskapet og ga det spredte området et tydelig institusjonelt anker.\n\nKirken var mer enn et enkelt bygg. I 1906 ble Ullern skilt ut som eget sogn fra Vestre Aker. En ny kirkelig grense organiserte mennesker og lokale funksjoner rundt Ullern før den store boligveksten skjøt fart.\n\nI årene etter ble kirkerommet også et sted for kunst. Eilif Peterssen utførte «Kristi himmelfart» i apsis i 1908–1909. Dermed fikk 1903-bygget et nytt lag uten at bygning og kunstverk ble det samme historiske objektet.",
    episode: { actors: ["Ullern menighet", "Aker kommune", "Eilif Peterssen"], date: "1903-06-03", action: "Ullern kirke ble innviet.", consequence: "Ullern ble eget sogn i 1906 og fikk et tydelig lokalt institusjonelt sentrum." },
    sources: [{ title: "Ullern menighet – Om Ullern kirke", url: urls.churchOfficial }, { title: "Oslo byleksikon – Ullern", url: urls.byleksikon }, { title: "SNL – Ullern kirke", url: urls.churchSnl }],
    tags: ["kirke", "sogn", "1903", "1906", "kirkekunst"], related_people: [personId], related_places: [], score: { narrative: 3, historical: 2, source: 5, play_value: 3, originality: 3, total: 16 },
    arc: { start: "Ullern var et spredt område vest for byen.", middle: "Kirken ble innviet i 1903 og sognet opprettet i 1906.", end: "Kirken fikk nye kunstlag og ble et varig institusjonelt anker." }
  },
  {
    id: "st_ullern_banene_apner_boliglandet", quality_profile: "episode_v1", type: "transformation", title: "Da banene åpnet Ullern", year: 1912, place_id: placeId,
    summary: "Smestadbanen åpnet i 1912, ble forlenget til Røa i 1935 og fikk forbindelse over Ullernåsen mot Jar i 1942.",
    story: "I 1912 åpnet Smestadbanen mellom Majorstuen og Smestad. For deler av Ullern betydde det at avstanden til den tette byen kunne måles i reisetid, ikke bare kilometer.\n\nI 1935 ble banen forlenget til Røa og fikk navnet Røabanen. Nye holdeplasser og dobbeltspor ga en sterkere transportakse gjennom området.\n\nI 1942 åpnet forbindelsen Sørbyhaugen–Jar over Ullernåsen. Tre daterte banegrep over tre tiår viser at Ullern ikke ble en baneforstad i ett sprang, men gjennom flere infrastrukturlag som åpnet ulike arealer for bolig og daglige reiser.",
    episode: { actors: ["A/S Smestad", "A/S Holmenkolbanen", "kollektivreisende"], date: "1912", action: "Smestadbanen ble satt i drift.", consequence: "Senere forlengelser i 1935 og 1942 ga Ullern flere baneforbindelser og nye utbyggingsmuligheter." },
    sources: [{ title: "Oslo byleksikon – Smestadbanen", url: urls.smestadbanen }, { title: "Oslo byleksikon – Røabanen", url: urls.roabanen }, { title: "Oslo byleksikon – Sørbyhaugen", url: urls.sorbyhaugen }],
    tags: ["forstadsbane", "1912", "1935", "1942", "byutvikling"], related_people: [], related_places: [], score: { narrative: 3, historical: 2, source: 5, play_value: 3, originality: 3, total: 16 },
    arc: { start: "Ullern hadde store arealer med lav bymessig tetthet.", middle: "Banene ble åpnet og forlenget i flere trinn.", end: "Transportlagene ble en varig del av områdets bolig- og bevegelsesstruktur." }
  }
];
write("data/stories/stories_ullern.json", stories);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files ||= []; addOnce(storyManifest.files, "data/stories/stories_ullern.json"); write("data/stories/stories_manifest.json", storyManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
episodeManifest.files ||= []; addOnce(episodeManifest.files, "data/stories/stories_ullern.json"); write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const readingPack = read(readingFile);
const readings = [
  { id: "lesespor_ullern_byleksikon", title: "Ullern (strøk)", author: null, publication: "Oslo byleksikon", date: null, year: null, type: "reference_article", subjects: ["Ullern", "boligstruktur", "institusjoner"], place_ids: [placeId], person_ids: [], category_hints: ["by", "historie"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Stedsspesifikk hovedkilde for sogn, institusjoner og boligstruktur." },
  { id: "lesespor_ullern_kirke", title: "Om Ullern kirke", author: null, publication: "Den norske kirke", date: null, year: null, type: "official_institution_page", subjects: ["Ullern kirke", "arkitektur", "kirkekunst"], place_ids: [placeId], person_ids: [personId], category_hints: ["by", "historie", "kunst"], url: urls.churchOfficial, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Primær institusjonskilde for kirken, Bødtker, baldakinen, Peterssen og Kielland." },
  { id: "lesespor_ullern_smestadbanen", title: "Smestadbanen", author: null, publication: "Oslo byleksikon", date: null, year: null, type: "reference_article", subjects: ["Smestadbanen", "1912", "forstadsbane"], place_ids: [placeId], person_ids: [], category_hints: ["by"], url: urls.smestadbanen, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Kilde for åpningen i 1912 og overgangen til Røabanen." },
  { id: "lesespor_ullern_snl_kirke", title: "Ullern kirke", author: null, publication: "Store norske leksikon", date: null, year: null, type: "reference_article", subjects: ["Ullern kirke", "Eilif Peterssen", "alterbaldakin"], place_ids: [placeId], person_ids: [personId], category_hints: ["by", "kunst"], url: urls.churchSnl, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "approved", relevance: "Faglig sekundærkilde for kirkens arkitektur og kunsthistoriske lag." }
];
readingPack.items ||= [];
readingPack.items = readingPack.items.filter(item => !String(item.id || "").startsWith("lesespor_ullern_"));
readingPack.items.push(...readings);
write(readingFile, readingPack);

const sourceDefs = {
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Sogn, kirke, institusjoner og boligtypologi kontrollert." },
  bydel: { url: urls.bydel, source_type: "institutional_reference", review_status: "reviewed", review_note: "Lang utbyggingshistorie og banetidslinje kontrollert." },
  church: { url: urls.churchOfficial, source_type: "primary_institutional", review_status: "reviewed", review_note: "1903, Bødtker, Peterssen, Kielland og baldakin kontrollert." },
  church_snl: { url: urls.churchSnl, source_type: "edited_reference", review_status: "reviewed", review_note: "Kirkearkitektur og kunsthistoriske elementer kontrollert." },
  smestadbanen: { url: urls.smestadbanen, source_type: "institutional_reference", review_status: "reviewed", review_note: "Åpning 1912 og forlengelse 1935 kontrollert." },
  roabanen: { url: urls.roabanen, source_type: "institutional_reference", review_status: "reviewed", review_note: "Røabanens historikk kontrollert." },
  sorbyhaugen: { url: urls.sorbyhaugen, source_type: "institutional_reference", review_status: "reviewed", review_note: "Sørbyhaugen–Jar 1942 kontrollert." },
  peterssen: { url: urls.peterssenSnl, source_type: "edited_biographical_reference", review_status: "reviewed", review_note: "Peterssens Ullern-verk 1908–09 kontrollert." }
};
const F = "em_by_historiske_lag_i_hverdagsrom";
const B = "em_by_boligstruktur";
const I = "em_by_infrastruktur_mobilitet";
const S = "em_by_bydelsforskjeller_segregering";
const specs = [
  ["fact", "Hvor kommer navnet Ullern fra?", ["Ullern-gårdene", "Røabanen", "Radiumhospitalet"], "Ullern-gårdene", "Ullern har navn etter Ullern-gårdene.", ["byleksikon"], F],
  ["fact", "Når ble Ullern kirke innviet?", ["1903", "1931", "1948"], "1903", "Ullern kirke ble innviet i 1903.", ["church"], F],
  ["fact", "Når ble Ullern eget sogn?", ["1906", "1872", "1935"], "1906", "Ullern sogn ble skilt ut fra Vestre Aker i 1906.", ["byleksikon"], F],
  ["fact", "Hvem tegnet Ullern kirke?", ["Harald Bødtker", "Arne Korsmo", "Paul Due"], "Harald Bødtker", "Harald Bødtker var arkitekt for Ullern kirke.", ["church"], F],
  ["fact", "Hvem malte «Kristi himmelfart» i apsis?", ["Eilif Peterssen", "Gabriel Kielland", "Edvard Munch"], "Eilif Peterssen", "Eilif Peterssen utførte apsismaleriet i 1908–1909.", ["church", "peterssen"], F],
  ["fact", "Hvem utførte de store glassmaleriene i tverrskipene?", ["Gabriel Kielland", "Eilif Peterssen", "Harald Bødtker"], "Gabriel Kielland", "Gabriel Kielland utførte de store glassmaleriene.", ["church", "church_snl"], F],
  ["fact", "Hva er alterbaldakinen laget av?", ["Italiensk marmor", "Tre og kobber", "Støpejern"], "Italiensk marmor", "Alterbaldakinen er i italiensk marmor og bysantinsk stil.", ["church", "church_snl"], F],
  ["fact", "Når åpnet Smestadbanen til Smestad?", ["1912", "1903", "1942"], "1912", "Smestadbanen mellom Majorstuen og Smestad åpnet i 1912.", ["smestadbanen"], I],
  ["fact", "Når ble Smestadbanen forlenget til Røa?", ["1935", "1921", "1972"], "1935", "Banen ble forlenget til Røa i 1935 og fikk navnet Røabanen.", ["smestadbanen", "roabanen"], I],
  ["fact", "Når åpnet forbindelsen Sørbyhaugen–Jar over Ullernåsen?", ["1942", "1919", "1995"], "1942", "Sørbyhaugen–Jar-forbindelsen åpnet i 1942.", ["sorbyhaugen", "bydel"], I],
  ["fact", "Hvilken boligform dominerer arealmessig på Ullern?", ["Villaer", "Bare høyhus", "Bare rekkehus"], "Villaer", "Villastrøk utgjør størst areal, men er ikke eneste boligform.", ["byleksikon", "bydel"], B],
  ["fact", "Hvilke boligtyper finnes i tillegg til villaer?", ["Rekkehus, terrassehus og blokker", "Bare sjøboder", "Bare industribygg"], "Rekkehus, terrassehus og blokker", "Ullern har flere boligtypologier i tillegg til villabebyggelse.", ["byleksikon", "bydel"], B],
  ["fact", "Når åpnet Bestum skole?", ["1921", "1906", "1942"], "1921", "Bestum skole åpnet i 1921.", ["byleksikon"], F],
  ["fact", "Når kom Ullern idrettsplass?", ["1922", "1935", "1948"], "1922", "Ullern idrettsplass er et kommunalt anlegg fra 1922.", ["byleksikon"], F],
  ["fact", "Når kom Ullern videregående skole i gang?", ["1931", "1903", "1960"], "1931", "Ullern videregående skole kom i gang i 1931.", ["byleksikon"], F],
  ["fact", "Når åpnet Radiumhospitalet?", ["1931", "1912", "1957"], "1931", "Det Norske Radiumhospital åpnet i 1931.", ["byleksikon"], F],
  ["fact", "Hva slags kirkeplan har Ullern kirke?", ["Korsplan", "Ren langkirke uten tverrskip", "Sirkulær rotunde"], "Korsplan", "Ullern kirke har korsplan med sentraltårn.", ["church"], F],
  ["fact", "Hvor mange sitteplasser oppgir Den norske kirke?", ["800", "250", "1500"], "800", "Den norske kirke oppgir 800 sitteplasser.", ["church"], F],
  ["fact", "Hvilken stil beskrives alterbaldakinen med?", ["Bysantinsk", "Brutalistisk", "Funksjonalistisk"], "Bysantinsk", "Baldakinen beskrives som bysantinsk i stil.", ["church", "church_snl"], F],
  ["fact", "Mellom hvilke områder ligger Ullern-strøket?", ["Røa, Bestum, Lilleaker, Smestad og Skøyen", "Tøyen, Kampen og Ensjø", "Bjørvika, Vaterland og Grønland"], "Røa, Bestum, Lilleaker, Smestad og Skøyen", "Oslo byleksikon avgrenser Ullern-strøket mellom disse naboområdene.", ["byleksikon"], F],
  ["fact", "Hva kjennetegner Ullerns utbyggingshistorie?", ["Den skjedde over et langt tidsrom", "Alt ble bygget samtidig i 1931", "Området var ferdig utbygd før jernbanen"], "Den skjedde over et langt tidsrom", "Ullern er bygget ut over et langt tidsrom og har derfor variert bebyggelse.", ["bydel"], F],
  ["context", "Hva er den sikreste koblingen mellom banene og boligveksten?", ["Banene gjorde nye områder lettere tilgjengelige for daglige reiser", "Banene beviser hvem som hadde høy inntekt", "Alle boliger ble bygget av baneselskapene"], "Banene gjorde nye områder lettere tilgjengelige for daglige reiser", "Transporttilgjengelighet kan knyttes til utbygging uten å gjøre banen til eneste årsak.", ["bydel", "smestadbanen"], I],
  ["context", "Hva kan villaer og store tomter dokumentere direkte?", ["Byform og tetthet", "Beboernes nøyaktige inntekt", "Politiske holdninger"], "Byform og tetthet", "Morfologi kan observeres direkte; sosiale egenskaper krever andre data.", ["byleksikon"], B],
  ["context", "Hvorfor gjør Radiumhospitalet og skolene Ullern til mer enn et boligområde?", ["De skaper reiser for behandling, arbeid og undervisning", "De gjør alle boliger offentlige", "De fjerner behovet for kollektivtransport"], "De skaper reiser for behandling, arbeid og undervisning", "Institusjoner gir stedet funksjoner for både beboere og besøkende.", ["byleksikon"], F],
  ["context", "Hvorfor må kirken, baldakinen og Peterssens maleri skilles analytisk?", ["De er ulike typer enheter med ulike kilder og dateringer", "De ble laget av samme person", "Bare bygget har historisk verdi"], "De er ulike typer enheter med ulike kilder og dateringer", "Structure, Object og kunstverk bør ikke blandes til én entity.", ["church", "church_snl"], F],
  ["context", "Hva viser 1912, 1935 og 1942 samlet?", ["Kollektivnettet ble bygget ut i flere trinn", "Alle tre år gjelder samme stasjon", "Ingen av årstallene gjelder transport"], "Kollektivnettet ble bygget ut i flere trinn", "Flere daterte infrastrukturlag åpnet forskjellige forbindelser over tid.", ["smestadbanen", "roabanen", "sorbyhaugen"], I],
  ["context", "Hva er en forsvarlig slutning fra blandingen av villaer, rekkehus og blokker?", ["Ullern har intern boligtypologisk variasjon", "Alle deler av Ullern har lik tetthet", "Boligtype avslører beboernes yrke"], "Ullern har intern boligtypologisk variasjon", "Variert typologi viser at området ikke er fysisk ensartet.", ["byleksikon", "bydel"], B],
  ["context", "Hvordan bør et foto fra 1921 sammenlignes med et foto fra 2007?", ["Som to dokumenterte tidsbilder med hensyn til ulik kameravinkel", "Som bevis for alle endringer mellom årene", "Som identiske målinger av vegetasjon"], "Som to dokumenterte tidsbilder med hensyn til ulik kameravinkel", "Før/etter-bilder krever avgrensning av hva perspektivet faktisk kan vise.", ["church"], F],
  ["concept", "Hva betyr transportorientert byvekst i Ullern-sammenheng?", ["At tilgjengelighet langs baner påvirker hvor boliger og funksjoner kan utvikles", "At alle bygg må ligge på en stasjon", "At veier ikke spiller noen rolle"], "At tilgjengelighet langs baner påvirker hvor boliger og funksjoner kan utvikles", "Transportorientert vekst beskriver samspillet mellom forbindelser og arealbruk.", ["bydel", "smestadbanen"], I, "met_morfologisk_analyse"],
  ["concept", "Hva er morfologi i en stedsanalyse?", ["Analyse av fysisk form, tomter, bygg og gatenett", "Måling av inntekt alene", "En liste over kjente personer"], "Analyse av fysisk form, tomter, bygg og gatenett", "Morfologi handler om den fysiske organiseringen av byen.", ["byleksikon"], B, "met_morfologisk_analyse"],
  ["concept", "Hva er en viktig kildekritisk grense ved sosial lesning av Ullern?", ["Byform alene beviser ikke inntekt eller segregasjon", "Historiske kilder er alltid unødvendige", "Villaer beviser identisk livsstil"], "Byform alene beviser ikke inntekt eller segregasjon", "Sosiale påstander krever egne data utover visuell morfologi.", ["byleksikon", "bydel"], S, "met_feltobservasjon"],
  ["concept", "Hva menes med historiske lag på Ullern?", ["At bygg, baner og institusjoner fra ulike perioder finnes i samme område", "At alle elementer er fra 1903", "At bare gamle bygg teller"], "At bygg, baner og institusjoner fra ulike perioder finnes i samme område", "Et sted kan bære samtidige spor fra flere historiske perioder.", ["byleksikon", "church"], F, "met_for_etter"],
  ["concept", "Hva er funksjonell blanding?", ["At bolig, skole, helse, idrett og arbeid finnes i samme større område", "At alle bygg har samme funksjon", "At det ikke finnes reiser mellom områder"], "At bolig, skole, helse, idrett og arbeid finnes i samme større område", "Funksjonell blanding beskriver flere formål og brukergrupper i samme område.", ["byleksikon"], F, "met_feltobservasjon"],
  ["concept", "Hva er forskjellen mellom observasjon og historisk forklaring?", ["Observasjon registrerer synlige spor; forklaring krever kilder om hvordan de oppstod", "De er alltid det samme", "Historisk forklaring bruker bare fotografier"], "Observasjon registrerer synlige spor; forklaring krever kilder om hvordan de oppstod", "Feltobservasjon og historiske kilder utfyller hverandre, men beviser ulike ting.", ["bydel", "church"], F, "met_feltobservasjon"],
  ["concept", "Hva er den mest presise helhetslesningen av Ullern?", ["Et lagdelt område der transport, boligtypologi og institusjoner virker sammen uten at én faktor forklarer alt", "Et helt ensartet villaområde", "Et område formet bare av kirken"], "Et lagdelt område der transport, boligtypologi og institusjoner virker sammen uten at én faktor forklarer alt", "Helhetslesningen kombinerer flere dokumenterte systemer og holder tolkningens grenser åpne.", ["byleksikon", "bydel", "church"], F, "met_morfologisk_analyse"]
];

const phases = ["opening", "middle", "middle", "bridge", "final"];
const setTitles = ["Sted, kirke og navn", "Baner og institusjoner", "Boligstruktur og tidslag", "Kildegrenser i felt", "Metode og helhetslesning"];
const questions = specs.map((spec, index) => {
  const [questionType, question, options, answer, knowledge, sourceIds, emneId, methodId] = spec;
  const answerIndex = index % 3;
  const balanced = options.filter(option => option !== answer);
  balanced.splice(answerIndex, 0, answer);
  const q = {
    id: `ullern_quiz_${String(index + 1).padStart(2, "0")}`, quiz_id: `by_ullern_q${String(index + 1).padStart(2, "0")}`,
    categoryId: "by", placeId, personId: "", natureId: "", targetId: placeId, question_scope: "place", question, options: balanced, answer, answerIndex,
    dimension: questionType === "fact" ? "sted_og_historie" : questionType === "context" ? "kontekst_og_kilde" : "begrep_og_metode",
    topic: `ullern_${questionType}_${String(index + 1).padStart(2, "0")}`, knowledge, trivia: [], difficulty: Math.floor(index / 7) + 1, question_type: questionType,
    question_layer: phases[Math.floor(index / 7)], year: null, epoke_id: null, epoke_domain: "by", emne_id: emneId, related_emner: [], core_concepts: [], concept_focus: [], learning_paths: [],
    tags: ["ullern", "oslo", "by"], required_tags: [], source: sourceIds, source_origin: "external", claim_basis: knowledge,
    guidance_basis: ["data/fag/by/pensum_by.json", "data/fag/by/emner_by.json", "data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"],
    claim_id: `claim_ullern_quiz_${String(index + 1).padStart(2, "0")}`, primary_knowledge_unit_id: `ku_by_ullern_${String(index + 1).padStart(2, "0")}`,
    knowledge_unit_ids: [`ku_by_ullern_${String(index + 1).padStart(2, "0")}`], concepts: [], concept_ids: [], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked"
  };
  if (methodId) q.method_ids = [methodId];
  return q;
});
const sets = phases.map((phase, setIndex) => ({
  set_id: `by_ullern_set_${setIndex + 1}`, title: setTitles[setIndex], level: setIndex + 1, order: setIndex + 1, phase, mode: phase, xp: 50 + setIndex * 10,
  questions: questions.slice(setIndex * 7, setIndex * 7 + 7).map((question, localIndex) => ({ ...question, quiz_id: `by_ullern_set_${setIndex + 1}_q${localIndex + 1}` }))
}));
const quizFile = "data/quiz/by/ullern_sets.json";
write(quizFile, {
  targetId: placeId, categoryId: "by", source_quiz_file: "data/quiz/by/ullern_sets_merged.json", generator_version: "ullern-rich-5x7-20260907", size_class: "rich",
  generated_from: ["data/quiz/production_briefs/by/ullern.json", "data/fag/by/pensum_by.json", "data/fag/by/emner_by.json", "data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"],
  merge_notes: { existing_quiz_status: "Legacy 5x6 package audited.", kept: "Strong source-backed topics retained and rewritten into current schema.", corrected: "Progression upgraded to 21 fact + 7 context + 7 concept.", added: "Five source-backed questions plus current Knowledge metadata." },
  profile_snapshot: place.quiz_profile, sets
});
const legacyQuiz = "data/quiz/by/ullern_sets_merged.json";
if (fs.existsSync(path.join(root, legacyQuiz))) fs.unlinkSync(path.join(root, legacyQuiz));
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = (quizManifest.sets || []).filter(entry => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);

const claims = specs.map((spec, index) => ({
  claim_id: `claim_ullern_quiz_${String(index + 1).padStart(2, "0")}`, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: spec[0], statement: spec[4], source_ids: spec[5], source_origin: "external", emne_id: spec[6], ...(spec[7] ? { method_ids: [spec[7]] } : {})
}));
write("data/quiz/production_briefs/by/ullern.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: placeId, profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Oslo byleksikon, Den norske kirke og SNL bærer en 5×7-pakke med eksplisitt skille mellom fakta, kontekst og metode.",
  scope: { place: "Ullern", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 21 },
  sources: sourceDefs,
  selected_curriculum: { module_ids: ["kur_by_02_nabolag_ulikhet_segregering", "kur_by_03_infrastruktur_og_bevegelse", "kur_by_04_historiske_lag_og_transformasjon"], emne_ids: [F, B, I, S], topic_hook_ids: ["ark_bygningstyper", "urb_byidealer", "urb_bil_vs_menneske"], method_ids: ["met_morfologisk_analyse", "met_for_etter", "met_feltobservasjon"], thinker_ids: [], works: [] },
  existing_quiz_audit: { searched_paths: [legacyQuiz, quizFile, "data/quiz/manifest.json"], active_before: { file: legacyQuiz, set_count: 5, question_count: 30, finding: "Legacy 5×6 package did not meet current 5×7 rich profile." }, decisions: ["Migrate to 5×7.", "Use 21 fact + 7 context + 7 concept.", "Keep explicit source ids and stable Knowledge ids."], knowledge_migration: "All 35 questions receive stable Ullern Knowledge ids." },
  profile_decision: { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Ullern has independent learning jobs for church/history, transport, housing morphology, source boundaries and method without filler." },
  held_back_candidates: ["Social class claims inferred only from villa morphology.", "Current resident characteristics without demographic sources.", "Unverified causal claims that one rail line alone produced all development."],
  claims
});
const fagverkRegistry = read("data/fagverk/fagverk_registry.json");
fagverkRegistry.placeLinks ||= {};
fagverkRegistry.placeLinks[placeId] = { sourceFile: placeFile.replace(/^data\//, ""), field: "fagverk", schema: place.fagverk.schema, level: place.fagverk.level, status: place.fagverk.status };
fagverkRegistry.version = "3.15.0";
fagverkRegistry.updatedAt = verifiedAt;
write("data/fagverk/fagverk_registry.json", fagverkRegistry);

const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.by.quizProduction ||= { status: "pilot", required_inputs: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], context_builder: "scripts/build-quiz-production-context.mjs", profile_system: "adaptive_relative_superset", package_schema: "quizPackageSchema", context_artifact_root: "data/quiz/production_context", targets: {} };
fagManifest.by.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/by/ullern.json", context_artifact: "../quiz/production_context/by/ullern.json", quiz_file: "../quiz/by/ullern_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);
await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: "data/quiz/production_context/by/ullern.json" });

write(workcardFile, {
  schema: "history_go_place_workcard_v2", place_id: placeId, category: "by", status: "complete", production_profile: "standard", profile_status: "confirmed",
  profile_reason: "Ullern has four direct image-ready collections and enough source-backed material for full core, rich quiz, stories, language, readings and full Fagverk.",
  underbadge_ids: place.underbadge_ids,
  content_plan: { people: "PRODUCED: Eilif Peterssen with direct Ullern church role.", objects: "PRODUCED: the marble altar baldachin as a physical place-specific object.", brands: "PRODUCED: canonical Sporveien brand linked to the documented rail-development track.", category_expression: "PRODUCED: Ullern church as Structure.", stories: "PRODUCED: two episode_v1 stories.", for_na: "PRODUCED: 1921/2007 church comparison with viewpoint caveat.", lesespor: "PRODUCED: four approved open link-only readings.", language: "PRODUCED: six place-specific terms.", fagverk: "PRODUCED: curated full Fagverk v2." },
  collection_ids: ["people", "objects", "brands", "structures"],
  object_category_boundary: "People owns Peterssen as historical actor; Objects owns the altar baldachin; Brands owns Sporveien identity; Structures owns Ullern church. The same physical entity is not duplicated across these roles.",
  null_measurement: { measured_at_commit: "51e627276bc3b95fc47a4caf65ac47e45b737796", existing_place: true, existing_quiz: "legacy_5x6", existing_story: false, existing_collections: 0, existing_fagverk: false, existing_language_lexicon: false, existing_people_links: 0, existing_people_image_ready: 0, existing_brand_links: 0, collision_search: "No open Ullern PR found before production." },
  active_phase: "complete", active_file_scope: "Ullern canonical Place, People, Object, Brand link, Structure, two Stories, leksikon, language, quiz/Knowledge, readings, local images, generated runtime and audit artifacts.", source_review: "complete", production_verified_at: verifiedAt,
  quiz_profile: "rich_5x7_21_7_7", fagverk_status: "curated_full", chronology_status: "PASS_ten_anchors", story_status: "PASS_two_episode_v1", objects_status: "PASS_one_signature_object", brands_status: "PASS_canonical_sporveien", people_status: "PASS_one_direct_image_ready_profile", branch_status: "materialized_pending_ci", live_status: "pending_merge", quality_gate: "30/30_pending_ci", canonical_next: null,
  held_back_candidates: ["Income/class claims inferred from villa form.", "Additional Structures without a comparably strong image/source package.", "Artificial second Object from the same altar ensemble."]
});

write("data/places/production/ullern.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Ullern as the canonical residential area/strøk in western Oslo, not the administrative borough, Ullern church, Radiumhospitalet or a single station alone.", period: "late 1800s–present", excludes: ["administrative borough as whole", "Ullern church as standalone place", "Radiumhospitalet as standalone place", "single transit station"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category, coordinates: { lat: place.lat, lon: place.lon } },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) },
  claims: [
    { id: "claim_ullern_text_01", claim: "Ullern church was inaugurated in 1903 and Ullern became a separate parish in 1906.", sourceUrl: urls.byleksikon, sourceLocation: "desc/popupDesc", sourceType: "reputable_secondary", verifiedAt, status: "verified", claimKind: "ordinary", evidenceMode: "direct", temporalStatus: "historical" },
    { id: "claim_ullern_text_02", claim: "Smestadbanen opened in 1912, was extended to Røa in 1935, and the Sørbyhaugen–Jar connection opened in 1942.", sourceUrl: urls.bydel, sourceLocation: "desc/popupDesc", sourceType: "reputable_secondary", verifiedAt, status: "verified", claimKind: "ordinary", evidenceMode: "direct", temporalStatus: "historical" },
    { id: "claim_ullern_text_03", claim: "Ullern has a mixed housing structure including villas, row houses, terrace housing and blocks.", sourceUrl: urls.byleksikon, sourceLocation: "desc/popupDesc", sourceType: "reputable_secondary", verifiedAt, status: "verified", claimKind: "ordinary", evidenceMode: "direct", temporalStatus: "current" },
    { id: "claim_ullern_text_04", claim: "Eilif Peterssen painted the Ascension motif in Ullern church in 1908–1909.", sourceUrl: urls.churchOfficial, sourceLocation: "popupDesc", sourceType: "institutional", verifiedAt, status: "verified", claimKind: "ordinary", evidenceMode: "direct", temporalStatus: "historical" }
  ],
  sources: Object.entries(sourceDefs).map(([id, source]) => ({ id, url: source.url, sourceType: source.source_type, reviewStatus: source.review_status, verifiedAt })),
  collections: { people: [personId], objects: ["ullern_alterbaldakin"], brands: ["sporveien"], structures: ["ullern_kirke"] },
  quiz: { profile: "rich", setCount: 5, questionsPerSet: 7, totalQuestions: 35, fact: 21, context: 7, concept: 7 },
  completion: { productionStatus: "complete", fagverk: "curated_full", stories: 2, chronology: 10, languageEntries: 6, readings: 4, quizCard: "bilder/QuizCards/Ullern.webp" },
  verifiedAt
});

execFileSync(process.execPath, ["scripts/build-place-open-payloads.mjs"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "places:index:build"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-epoke-place-index.mjs"], { cwd: root, stdio: "inherit" });

const epokeIndexAfter = read("data/epoker/epoke-place-index.json");
const coverageBefore = epokeIndexBefore.domains.historie.oslo_coverage;
const coverageAfter = epokeIndexAfter.domains.historie.oslo_coverage;
if (epokeIndexAfter.stats.canonical_story_milestone_count !== epokeIndexBefore.stats.canonical_story_milestone_count + 2) {
  throw new Error("Ullern must add exactly two canonical story milestones");
}
if (coverageAfter.dated_evidence_place_count !== coverageBefore.dated_evidence_place_count + 1
    || coverageAfter.awaiting_source_backed_history_count !== coverageBefore.awaiting_source_backed_history_count - 1
    || coverageAfter.documented_case_place_count !== coverageBefore.documented_case_place_count
    || coverageAfter.canonical_place_count !== coverageBefore.canonical_place_count) {
  throw new Error("Ullern must move exactly one Oslo place from awaiting history to dated evidence");
}
const epokeTestFile = path.join(root, "tests/epoke-place-index.test.mjs");
let epokeTest = fs.readFileSync(epokeTestFile, "utf8");
const replaceExpectedCount = (expression, before, after) => {
  const previous = `assert.equal(${expression}, ${before});`;
  if (!epokeTest.includes(previous)) throw new Error(`Epoch test baseline missing: ${previous}`);
  epokeTest = epokeTest.replace(previous, `assert.equal(${expression}, ${after});`);
};
replaceExpectedCount("index.stats.canonical_story_milestone_count", epokeIndexBefore.stats.canonical_story_milestone_count, epokeIndexAfter.stats.canonical_story_milestone_count);
replaceExpectedCount("index.stats.verified_place_production_milestone_count", epokeIndexBefore.stats.verified_place_production_milestone_count, epokeIndexBefore.stats.verified_place_production_milestone_count + 10);
replaceExpectedCount("coverage.dated_evidence_place_count", coverageBefore.dated_evidence_place_count, coverageAfter.dated_evidence_place_count);
replaceExpectedCount("coverage.awaiting_source_backed_history_count", coverageBefore.awaiting_source_backed_history_count, coverageAfter.awaiting_source_backed_history_count);
if (!epokeTest.includes('"ullern"')) {
  const reviewedListTail = '"vinderen"]) {';
  if (!epokeTest.includes(reviewedListTail)) throw new Error("Reviewed Oslo place list tail missing");
  epokeTest = epokeTest.replace(reviewedListTail, '"vinderen", "ullern"]) {');
}
fs.writeFileSync(epokeTestFile, epokeTest);

const imageAuditFile = "/tmp/ullern-place-image-audit-materialized.json";
execFileSync(process.execPath, ["scripts/audit-place-images.mjs", "--mode=all", `--report=${imageAuditFile}`], { cwd: root, stdio: "inherit" });
const imageAudit = JSON.parse(fs.readFileSync(imageAuditFile, "utf8"));
if (imageAudit.totalPlaces !== placeImageSummaryBefore.totalPlaces
    || imageAudit.summary.local !== placeImageSummaryBefore.summary.validLocal + 1
    || imageAudit.summary.remote !== placeImageSummaryBefore.summary.validRemote
    || imageAudit.summary.optional !== placeImageSummaryBefore.summary.optionalMissing
    || imageAudit.summary.missing !== placeImageSummaryBefore.summary.missing
    || imageAudit.summary.invalid !== placeImageSummaryBefore.summary.invalidLocalPath - 1) {
  throw new Error("Ullern image production must convert exactly one invalid local path into one valid local image");
}
const backlogSummary = {
  ...placeImageSummaryBefore,
  generatedAt: verifiedAt,
  generatedFromCommit: `${process.env.LOCKED_MAIN || "unknown-main"}:ullern_replay_20260907`,
  totalPlaces: imageAudit.totalPlaces,
  summary: {
    validLocal: imageAudit.summary.local,
    validRemote: imageAudit.summary.remote,
    optionalMissing: imageAudit.summary.optional,
    missing: imageAudit.summary.missing,
    invalidLocalPath: imageAudit.summary.invalid,
    remaining: imageAudit.summary.missing + imageAudit.summary.invalid
  },
  byCategory: Object.fromEntries(Object.entries(imageAudit.byCategory).map(([category, counts]) => [category, {
    total: counts.total,
    valid: counts.local + counts.remote,
    optional: counts.optional,
    missing: counts.missing,
    invalid: counts.invalid,
    ...(placeImageSummaryBefore.byCategory[category]?.designAlias ? { designAlias: placeImageSummaryBefore.byCategory[category].designAlias } : {})
  }]))
};
write("data/places/place_image_backlog_summary.json", backlogSummary);
execFileSync(process.execPath, ["--experimental-strip-types", "scripts/knowledge-canonical-data.mts", "--write"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "civication:history-people:build"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["--experimental-strip-types", "scripts/build-civication-scenario-people-index.mts"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-fagverk-release-manifest.mjs"], { cwd: root, stdio: "inherit" });
console.log(`Ullern production materialized: ${sets.length} quiz sets / ${questions.length} questions / ${stories.length} stories.`);
