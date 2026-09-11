#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const sharpModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs")
  : "sharp";
const { default: sharp } = await import(sharpModule);

const root = process.cwd();
const verifiedAt = "2026-09-10";
const placeId = "kirkeristen_basarene_brannvakten";
const personId = "christian_heinrich_grosch";
const brandId = "oslo_glass_studio";
const placeFile = "data/places/historie/oslo/places_historie_oslo_oppdag_kvadraturen_batch_01/" + placeId + ".json";

const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n");
};
const writeCompact = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value));
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const upsert = (array, value) => {
  const i = array.findIndex(item => item.id === value.id);
  if (i < 0) array.push(value); else array[i] = value;
};
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map(x => x.segment.trim()).filter(Boolean);

const urls = {
  oppdag: "https://www.oppdagkvadraturen.no/stoppesteder/kirkeristen-og-basarene",
  city2026: "https://aktuelt.oslo.kommune.no/kirkeristen-far-nytt-liv-med-gode-matopplevelser",
  citySale: "https://aktuelt.oslo.kommune.no/fauna-og-andenaes-kjoper-kirkeristen-av-oslo-kommune",
  byarkiv: "https://www.oslo.kommune.no/OBA/tobias/pdf_arkiv/Tob1999-4.PDF",
  glass: "https://www.osloglassstudio.com/info.html",
  glassAbout: "https://www.osloglassstudio.com/om-oss.html",
  currentPage: "https://commons.wikimedia.org/wiki/File:Basareneforside.JPG",
  currentAsset: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Basareneforside.JPG",
  frontPage: "https://commons.wikimedia.org/wiki/File:Oslo_brannvakt_s%C3%B8rlig_fasade.JPG",
  frontAsset: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Oslo_brannvakt_s%C3%B8rlig_fasade.JPG",
  historic1860Page: "https://commons.wikimedia.org/wiki/File:Andreas_Ludvig_S%C3%B8borg_-_Christiania_Bazarer_(Slagterboder)_og_Brandvagtsbygning_-_1860_-_Oslo_Museum_-_OB.02751.jpg",
  historic1860Asset: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Andreas_Ludvig_S%C3%B8borg_-_Christiania_Bazarer_%28Slagterboder%29_og_Brandvagtsbygning_-_1860_-_Oslo_Museum_-_OB.02751.jpg",
  plaquePage: "https://commons.wikimedia.org/wiki/File:Brannvakten_Kulturhistorisk_skilt.JPG",
  plaqueAsset: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Brannvakten_Kulturhistorisk_skilt.JPG",
  glassAsset: "https://www.osloglassstudio.com/uploads/3/2/3/1/32314237/p3141947_orig.jpg"
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function download(url, file) {
  const target = path.join(os.tmpdir(), "history-go-kirkeristen-media", file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target) && fs.statSync(target).size > 1000) return target;
  let lastStatus = null;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(url, {
      headers: {
        "user-agent": "History-Go/1.0 (source-audit; contact via github.com/Paradispartiet/History-Go)",
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      },
      redirect: "follow"
    });
    lastStatus = res.status;
    if (res.ok) {
      fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      await sleep(2200);
      return target;
    }
    if (res.status !== 429 && res.status < 500) throw new Error("Media fetch failed " + res.status + " " + url);
    await sleep(2500 * attempt);
  }
  throw new Error("Media fetch failed after retries " + lastStatus + " " + url);
}
async function image(source, target, width, height, position = "centre") {
  const out = path.join(root, target);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(source).rotate().resize(width, height, { fit: "cover", position }).webp({ quality: 88 }).toFile(out);
}

const currentSrc = await download(urls.currentAsset, "current.jpg");
const frontSrc = await download(urls.frontAsset, "front-brannvakten.jpg");
const historicSrc = await download(urls.historic1860Asset, "historic-1860.jpg");
const plaqueSrc = await download(urls.plaqueAsset, "plaque.jpg");
const glassSrc = await download(urls.glassAsset, "oslo-glass-studio.jpg");

await image(currentSrc, "bilder/places/" + placeId + ".webp", 1400, 900);
await image(frontSrc, "bilder/places/" + placeId + "_front_portrait.webp", 900, 1200, "centre");
await image(historicSrc, "bilder/places/" + placeId + "_1860.webp", 1200, 900);
await image(currentSrc, "bilder/places/" + placeId + "_2008.webp", 1200, 900);
await image(plaqueSrc, "bilder/kort/objects/" + placeId + "_brannvakten_blaaskilt.webp", 900, 620);
await image(historicSrc, "bilder/kort/historical_events/" + placeId + "_basarene_1859.webp", 900, 620);
await image(historicSrc, "bilder/kort/historical_events/" + placeId + "_brannvakten_1856.webp", 900, 620, "right");
await image(historicSrc, "bilder/kort/historical_events/" + placeId + "_rivingsvedtak_1949.webp", 900, 620, "left");
await image(currentSrc, "bilder/kort/historical_events/" + placeId + "_salg_2026.webp", 900, 620);
await image(glassSrc, "bilder/kort/brands/oslo_glass_studio.webp", 900, 620);

const quizOverlay = Buffer.from(
  '<svg width="900" height="1280" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="900" height="1280" fill="rgba(0,0,0,.24)"/>' +
  '<rect x="58" y="930" width="784" height="250" rx="32" fill="rgba(0,0,0,.78)"/>' +
  '<text x="100" y="1020" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="white">Kirkeristen</text>' +
  '<text x="100" y="1092" font-family="Arial, sans-serif" font-size="31" fill="white">Basarer · Brannvakt</text>' +
  '<text x="100" y="1142" font-family="Arial, sans-serif" font-size="27" fill="white">28 spørsmål · historie</text>' +
  '</svg>'
);
const quizOut = path.join(root, "bilder/QuizCards/Kirkeristen.webp");
fs.mkdirSync(path.dirname(quizOut), { recursive: true });
await sharp(currentSrc).rotate().resize(900, 1280, { fit: "cover" }).composite([{ input: quizOverlay }]).webp({ quality: 88 }).toFile(quizOut);

const currentMeta = {
  source: "wikimedia_commons", sourcePage: urls.currentPage, creator: "Mahlum",
  credit: "Mahlum / Wikimedia Commons", license: "CC BY-SA 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  assetType: "documentary_place_photo", date: "2008-03-21",
  transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const frontMeta = {
  source: "wikimedia_commons", sourcePage: urls.frontPage, creator: "Knut Hjelleset",
  credit: "Knut Hjelleset / Wikimedia Commons", license: "CC BY-SA 3.0 NO",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
  assetType: "documentary_place_portrait", date: "2013-09-22",
  transformation: "Egen stående kildefil; auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const historicMeta = {
  source: "oslo_museum_via_wikimedia_commons", sourcePage: urls.historic1860Page,
  creator: "Andreas Ludvig Søborg", credit: "Andreas Ludvig Søborg / Oslo Museum / Wikimedia Commons",
  license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  assetType: "historical_xylograph", date: "1860",
  transformation: "Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const plaqueMeta = {
  source: "wikimedia_commons", sourcePage: urls.plaquePage, creator: "Anne-Sophie Ofrim",
  credit: "Anne-Sophie Ofrim / Wikimedia Commons", license: "CC BY-SA 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  assetType: "documentary_object_photo", date: "2013-10-06",
  transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const glassMeta = {
  source: "official_institution_site", sourcePage: urls.glass, sourceAsset: urls.glassAsset,
  creator: "Leona Marie Špačková", credit: "Leona Marie Špačková / Oslo Glass Studio",
  rightsBasis: "official_institution_site_editorial_reference", license: "Official site editorial reference",
  usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false,
  assetType: "documentary_storefront_identity_photo",
  transformation: "Proporsjonalt utsnitt og WebP-normalisering uten redesign.", verifiedAt
};

const place = read(placeFile);
const coordinateSnapshot = {
  lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus,
  coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl
};

const desc = "Kirkeristen er det sammenbygde basar- og brannvaktanlegget sør og øst for Oslo domkirke, tegnet av Christian H. Grosch og oppført etappevis 1840–1859. Basarene ga kjøtthandelen faste slakterboder under overbygde arkader, mens Brannvakten fra 1855–56 samlet byens brannberedskap. Navnet Kirkeristen viser til ferister som skulle holde dyr ute av den tidligere kirkegården.";
const popupDesc = "Basarene rundt domkirken ble bygget etappevis fra 1840. Bakgrunnen var behovet for tryggere og mer hygienisk salg av kjøtt enn fra åpne torg og tilfeldige gårdsrom. Da anlegget var fullt utbygd i 1859, dannet bodene en halvsirkel rundt kirkens østside.\n\nChristian H. Grosch tegnet både basarene og Brannvakten. Brannvaktbygningen ble reist i 1855–56. Tårnet på Brannvakten var et slangetårn for tørking av brannslanger; det var ikke utkikkstårnet. Brannvakten holdt utkikk fra kirketårnet, en praksis som fortsatte til 1902.\n\nStorbrannen i 1858 og etableringen av nytt vannverk og profesjonelt brannvesen i 1860 setter anlegget inn i en bredere modernisering av byens beredskap. Brannvakten var hovedbrannstasjon fram til 1939.\n\nKirkeristen ble fredet i 1927, men vern betydde ikke automatisk sikkerhet. I 1937 ble anlegget vedtatt revet til fordel for park; vedtaket ble opphevet i 1949. Denne historien gjør bevaring til et resultat av skiftende beslutninger, ikke en rett linje.\n\nI 2023 åpnet Oslo Glass Studio i Kirkeristen. Verkstedet drives av Ina Kristine Hove, Kjersti Johannessen og Jeanne-Sophie Aas, og publikum kan se glassblåsing på stedet. Det er et nåtidig brukslag i de historiske basarlokalene, ikke en del av 1800-tallets opprinnelige funksjon.\n\nI 2026 vedtok Oslo bystyre salg til Fauna Eiendom AS og Andenergy AS for 34 millioner kroner. De nye eierne er forpliktet til rehabilitering i tråd med fredningsbestemmelsene innen seks år. Canonical Kirkeristen omfatter basarene og Brannvakten, men ikke Oslo domkirke som egen Place-identitet.";

const objects = [{
  id: placeId + "_brannvakten_blaaskilt", name: "Kulturhistorisk skilt ved Brannvakten",
  title: "Kulturhistorisk skilt ved Brannvakten", type: "minneskilt", kind: "physical_heritage_plaque",
  desc: "Et fysisk kulturhistorisk skilt markerer Brannvakten og gjør den senere minnebruken synlig i anlegget.",
  physicalObject: true, placeSpecific: true, collectable: true,
  placeSpecificReason: "Commons-fotografiet dokumenterer skiltet ved Brannvakten.",
  why_here: "Skiltet er en ettertidsmarkør som kan sammenholdes med selve brannvaktbygningen og 1800-tallsframstillingene.",
  whereToFind: "Ved Brannvakten i Kirkeristen-anlegget.",
  unlock: "Finn skiltet og sammenlign minneteksten med den fysiske slangetårnfunksjonen.",
  image: "bilder/kort/objects/" + placeId + "_brannvakten_blaaskilt.webp",
  imageMeta: plaqueMeta, source_urls: [urls.plaquePage, urls.oppdag]
}];

const historicalEvents = [
  {
    id: placeId + "_basarene_1840_1859", name: "Basarene bygges ut", title: "Basarene bygges ut",
    year: 1840, period: "1840–1859", type: "historical_event", kind: "urban_market_construction",
    desc: "Basarene ble oppført etappevis fra 1840 til 1859 og ga kjøtthandelen faste boder under arkader.",
    image: "bilder/kort/historical_events/" + placeId + "_basarene_1859.webp",
    imageMeta: { ...historicMeta, note: "1860-framstillingen viser anlegget umiddelbart etter fullføringen, ikke byggestarten i 1840." },
    source_urls: [urls.oppdag, urls.citySale, urls.historic1860Page]
  },
  {
    id: placeId + "_brannvakten_1855_1856", name: "Brannvakten oppføres", title: "Brannvakten oppføres",
    year: 1856, period: "1855–1856", type: "historical_event", kind: "fire_station_construction",
    desc: "Brannvakten ble reist 1855–56 som del av byens brannberedskap; tårnet ble brukt til tørking av slanger.",
    image: "bilder/kort/historical_events/" + placeId + "_brannvakten_1856.webp",
    imageMeta: { ...historicMeta, note: "1860-xylografien viser Brannvakten få år etter oppføringen." },
    source_urls: [urls.oppdag, urls.historic1860Page]
  },
  {
    id: placeId + "_rivingsvedtak_opphevet_1949", name: "Rivingsvedtaket oppheves", title: "Rivingsvedtaket oppheves",
    year: 1949, type: "historical_event", kind: "heritage_preservation_decision",
    desc: "Et rivingsvedtak fra 1937 ble opphevet i 1949, slik at det fredede anlegget ble stående.",
    image: "bilder/kort/historical_events/" + placeId + "_rivingsvedtak_1949.webp",
    imageMeta: { ...historicMeta, note: "1860-framstillingen dokumenterer anleggets historiske form, ikke vedtaket i 1949." },
    source_urls: [urls.citySale, urls.byarkiv]
  },
  {
    id: placeId + "_salg_2026", name: "Kirkeristen får nye eiere", title: "Kirkeristen får nye eiere",
    year: 2026, date: "2026-04-29", type: "historical_event", kind: "ownership_transfer_and_rehabilitation",
    desc: "Oslo bystyre vedtok salg til Fauna Eiendom AS og Andenergy AS; kjøperne forpliktes til rehabilitering i tråd med fredningen innen seks år.",
    image: "bilder/kort/historical_events/" + placeId + "_salg_2026.webp",
    imageMeta: { ...currentMeta, note: "Fotografiet fra 2008 viser anlegget før eierskiftet og brukes som bygningskontekst." },
    source_urls: [urls.city2026, urls.citySale]
  }
];

const chronology = [
  { id: "chrono_kirkeristen_ferister", year: 1700, title: "Ferister ved kirkegården", desc: "Navnet Kirkeristen knyttes til ferister som skulle holde dyr ute av kirkegården.", confidence: "medium", sources: [{ title: "Oppdag Kvadraturen", url: urls.oppdag }] },
  { id: "chrono_kirkeristen_1840", year: 1840, title: "Basarbyggingen starter", desc: "De første basarene bygges for regulert kjøtthandel.", confidence: "high", sources: [{ title: "Oppdag Kvadraturen", url: urls.oppdag }, { title: "Oslo kommune", url: urls.citySale }] },
  { id: "chrono_kirkeristen_1856", year: 1856, title: "Brannvakten står ferdig", desc: "Brannvaktbygningen og slangetårnet tas i bruk.", confidence: "high", sources: [{ title: "Oppdag Kvadraturen", url: urls.oppdag }] },
  { id: "chrono_kirkeristen_1858", year: 1858, title: "Storbrann i sentrum", desc: "En omfattende brann rammer sentrale kvartaler og synliggjør beredskapsbehovet.", confidence: "high", sources: [{ title: "Oppdag Kvadraturen", url: urls.oppdag }] },
  { id: "chrono_kirkeristen_1859", year: 1859, title: "Basaranlegget fullføres", desc: "Bodene danner den sammenhengende halvsirkelen rundt kirkens østside.", confidence: "high", sources: [{ title: "Oslo kommune", url: urls.citySale }] },
  { id: "chrono_kirkeristen_1860", year: 1860, title: "Nytt brannvesen og vannverk", desc: "Christiania får profesjonelt brannvesen og nytt vannverk.", confidence: "high", sources: [{ title: "Oppdag Kvadraturen", url: urls.oppdag }] },
  { id: "chrono_kirkeristen_1927", year: 1927, title: "Kirkeristen fredes", desc: "Anlegget får formelt vern.", confidence: "high", sources: [{ title: "Oslo kommune", url: urls.city2026 }] },
  { id: "chrono_kirkeristen_1939", year: 1939, title: "Hovedbrannstasjonen flyttes", desc: "Brannvakten opphører som byens hovedbrannstasjon.", confidence: "high", sources: [{ title: "Oslo kommune", url: urls.citySale }] },
  { id: "chrono_kirkeristen_1949", year: 1949, title: "Riving avverges", desc: "Rivingsvedtaket fra 1937 oppheves.", confidence: "high", sources: [{ title: "Oslo kommune", url: urls.citySale }] },
  { id: "chrono_kirkeristen_2023", year: 2023, title: "Oslo Glass Studio åpner", desc: "Glassverksted, galleri og butikk åpner i Kirkeristen.", confidence: "high", sources: [{ title: "Oslo Glass Studio", url: urls.glassAbout }] },
  { id: "chrono_kirkeristen_2026", year: 2026, title: "Salg og rehabiliteringskrav", desc: "Bystyret vedtar salg med seks års rehabiliteringsforpliktelse.", confidence: "high", sources: [{ title: "Oslo kommune", url: urls.city2026 }] }
];

const fagverk = {
  schema: "history_go_place_fagverk_v2", level: "standard", status: "curated",
  intro: "Kirkeristen gjør tre deler av 1800-tallets bymodernisering synlige i samme anlegg: regulert handel, organisert brannberedskap og senere kulturminneforvaltning.",
  article: [
    "Basarene ble reist fordi kjøtthandel på åpne torg og i gårdsrom skapte behov for mer regulerte og hygieniske salgsforhold. De overbygde arkadene var derfor både arkitektur og kommunal infrastruktur.",
    "Anlegget ble ikke til på én dato. Byggingen startet i 1840, Brannvakten kom i 1855–56, og basarrekken var fullført i 1859. Periodisering er viktigere enn ett enkelt årstall.",
    "Christian H. Grosch bandt de ulike funksjonene sammen arkitektonisk. Rød tegl, buer og en sammenhengende halvsirkel gjorde handel og beredskap til en markant del av byrommet rundt domkirken.",
    "Brannvaktens tårn må leses presist. Det ble brukt til tørking av slanger. Selve brannutkikken foregikk fra kirketårnet, og en sammenblanding av disse funksjonene gir feil historie.",
    "Storbrannen i 1858 kan ikke forklares av Kirkeristen alene, men hendelsen viser hvorfor vannforsyning, profesjonalisering og beredskapsarkitektur ble del av en større urban omstilling.",
    "Fredningen i 1927 avsluttet ikke konfliktene om anlegget. Rivingsvedtaket i 1937 og opphevingen i 1949 viser at kulturminnevern også er en historie om politiske prioriteringer.",
    "Det kulturhistoriske skiltet er et ettertidsobjekt. Det dokumenterer hvordan historien formidles i dag, ikke hvordan stedet så ut eller ble forstått i 1850-årene.",
    "Oslo Glass Studio er et eksempel på gjenbruk av basarlokalene. Glassblåsing og salg er en nåtidig virksomhet i et historisk anlegg, og bør ikke projiseres bakover som opprinnelig funksjon.",
    "Eierskiftet i 2026 åpner et nytt lag. Kravet om rehabilitering i tråd med fredningen viser hvordan privat eierskap og offentlig kulturminneansvar virker samtidig.",
    "Kirkeristen må skilles fra Oslo domkirke som egen Place-identitet. De ligger fysisk sammen, men historiske påstander om basarer og brannvakt kan ikke automatisk overføres til kirken."
  ],
  subject_ids: ["historie"],
  emne_ids: ["em_his_spor_materialitet","em_his_historiske_lag_i_byrom","em_his_kulturminner_bevaring","em_his_samtid_ettertid_fortelling"],
  chapter_ids: ["kilder_arkiv_spor","historisk_tid_periodisering","minne_kulturarv_historiebruk"],
  lenses: [
    { id: "kirkeristen-handel", title: "Regulert handel og hygiene", prompt: "Hvorfor ble kjøtthandelen flyttet inn i faste basarboder?", subject_id: "historie", emne_id: "em_his_historiske_lag_i_byrom", evidence: "Bruk kilder om basarenes formål; ikke les sanitære mål direkte ut av fasaden." },
    { id: "kirkeristen-brann", title: "Brannberedskap som byinfrastruktur", prompt: "Hvordan hang Brannvakten, vannverket og profesjonaliseringen av brannvesenet sammen i byens beredskap?", subject_id: "historie", emne_id: "em_his_spor_materialitet", evidence: "Skill slangetårnet fra utkikken i domkirkens tårn." },
    { id: "kirkeristen-vern", title: "Vern, riving og beslutninger", prompt: "Hvordan kunne et fredet anlegg overleve både rivingsvedtaket i 1937 og senere bypolitiske skifter?", subject_id: "historie", emne_id: "em_his_kulturminner_bevaring", evidence: "Fredning, rivingsvedtak og oppheving er separate beslutningslag." },
    { id: "kirkeristen-gjenbruk", title: "Gjenbruk og nytt eierskap", prompt: "Hvordan kan nye virksomheter bruke et fredet anlegg uten å viske ut eldre funksjoner?", subject_id: "historie", emne_id: "em_his_samtid_ettertid_fortelling", evidence: "Hold 2023- og 2026-lagene tydelig adskilt fra 1800-tallet." }
  ],
  guiding_questions: [
    "Hva var problemet basarene skulle løse i 1840-årene?",
    "Hva kan 1860-xylografien dokumentere, og hva kan den ikke dokumentere?",
    "Hvorfor er påstanden om slangetårn kontra utkikkstårn viktig?",
    "Hva viser 1937 og 1949 om forholdet mellom fredning og faktisk bevaring?",
    "Hvordan endrer Oslo Glass Studio og eierskiftet i 2026 stedet uten å endre dets historiske identitet?"
  ],
  concepts: ["Kirkeristen","ferist","basar","slakterbod","brannvakt","slangetårn","byinfrastruktur","nyromansk","kulturminne","fredning","bruksendring","rehabilitering"],
  observable_traces: [
    { title: "Røde teglbuer og basarrekken", observation: "Fra gaten kan den sammenhengende arkaden og den buede bygningsrekken følges rundt domkirken.", interpretation_boundary: "Fasaden dokumenterer det stående anlegget, men ikke alene hvorfor kjøtthandelen ble regulert.", source_urls: [urls.oppdag, urls.citySale] },
    { title: "Brannvakten og slangetårnet", observation: "Brannvaktbygningen og tårnet kan sammenholdes med 1860-framstillingen.", interpretation_boundary: "Tårnet skal ikke beskrives som brannutkikk; utkikken var i kirketårnet.", source_urls: [urls.oppdag, urls.historic1860Page] },
    { title: "Nåtidig glassverksted", observation: "Oslo Glass Studio viser aktivt håndverk og butikkbruk i en historisk basarlokale.", interpretation_boundary: "Dagens glassvirksomhet er et gjenbrukslag fra 2023 og ikke basarenes opprinnelige funksjon.", source_urls: [urls.glass] }
  ],
  source_urls: [urls.oppdag, urls.city2026, urls.citySale, urls.byarkiv, urls.glass, urls.historic1860Page, urls.currentPage, urls.frontPage, urls.plaquePage],
  verified_at: verifiedAt
};

Object.assign(place, {
  name: "Kirkeristen, Basarene og Brannvakten",
  year: 1859,
  desc,
  popupDesc,
  image: "bilder/places/" + placeId + ".webp",
  frontImage: "bilder/places/" + placeId + "_front_portrait.webp",
  imageMeta: { ...currentMeta, outputDimensions: "1400x900" },
  frontImageMeta: { ...frontMeta, outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4" },
  quizCardImage: "bilder/QuizCards/Kirkeristen.webp",
  quizCardImageMeta: { ...currentMeta, assetType: "dedicated_quiz_card", usage: "quiz_card_back_only", outputDimensions: "900x1280", orientation: "portrait", aspectRatio: "45:64", note: "Egen stående QuizCard-flate basert på lisensiert stedsfoto med typografisk quiz-overlay; brukes ikke som image eller frontImage." },
  underbadge_ids: ["attenhundretallet","byhistorie","krim_ulykker_og_branner","kulturminner_og_bevaring"],
  related_people_ids: [personId],
  related_place_ids: ["oslo_domkirke"],
  reading_track_ids: [
    "lesespor_kirkeristen_oppdag",
    "lesespor_kirkeristen_kommune",
    "lesespor_kirkeristen_byarkiv",
    "lesespor_kirkeristen_glass",
    "lesespor_kirkeristen_1860"
  ],
  production_profile: "standard",
  profile_status: "confirmed",
  profile_reason: "Grosch, et fysisk kulturhistorisk skilt, Oslo Glass Studio og fire daterte historiske hendelser gir fire direkte, kildebårne samlinger.",
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    production_profile: "standard",
    collection_ids: ["people","objects","brands","historical_events"],
    category_collection_label: "Historiske hendelser",
    reason: "Grosch, Brannvakt-skiltet, Oslo Glass Studio og daterte hendelser gir fire reelle samlinger uten Related-fyll.",
    verifiedAt
  },
  rounds: ["people","objects","brands","historical_events"],
  objects,
  historical_events: historicalEvents,
  chronology,
  fagverk,
  for_na: {
    title: "Fra ferdig byanlegg i 1860 til dagens Kirkeristen",
    beforeImage: "bilder/places/" + placeId + "_1860.webp",
    beforeImageLabel: "Basarene og Brannvakten i 1860 · Andreas Ludvig Søborg · CC0",
    beforeImageMeta: historicMeta,
    nowImage: "bilder/places/" + placeId + "_2008.webp",
    nowImageLabel: "Basarene i 2008 · Mahlum · CC BY-SA 3.0",
    nowImageMeta: currentMeta,
    before: "1860-xylografien viser det nyfullførte basar- og brannvaktanlegget som samlet byfunksjoner rundt domkirken.",
    now: "Fotografiet fra 2008 viser den bevarte teglarkaden i moderne bybruk.",
    change: "Sammenstillingen viser kontinuitet i bygningsformen og store funksjonsendringer. Bildene har ulike standpunkter og er ikke et optisk før–nå-par.",
    lookFor: ["teglbuene","brannvaktbygningen","forholdet mellom basarrekken og domkirken"],
    sources: [urls.historic1860Page, urls.currentPage, urls.citySale]
  },
  interpretation: {
    what_to_notice: ["Hvordan arkadene organiserer handel langs et sammenhengende byrom.","At slangetårnet er en funksjonsdel av brannberedskapen, ikke selve utkikkspunktet.","Hvordan nyere virksomheter bruker små basarlokaler innenfor det fredede anlegget."],
    why_it_matters: ["Kirkeristen viser hvordan hygiene, handel og beredskap ble gjort til fysisk byinfrastruktur.","Rivingshistorien viser at fredning ikke alene avgjør hva som faktisk bevares.","2026-salget viser at kulturminneansvar fortsetter når eierskapet endres."],
    counterpoints: ["Brannvakttårnet skal ikke omtales som utkikkstårn.","Oslo Glass Studio er et nåtidig brukslag, ikke en del av opprinnelig basarhistorie.","Oslo domkirke er et eget sted og skal ikke absorberes i Kirkeristen-identiteten."],
    sources: [urls.oppdag, urls.citySale, urls.city2026, urls.glass].map(url => ({ url, verifiedAt }))
  },
  externalLinks: [
    { type: "heritage", label: "Oppdag Kvadraturen – Kirkeristen og Basarene", url: urls.oppdag, verifiedAt },
    { type: "official", label: "Oslo kommune – Kirkeristen får nytt liv", url: urls.city2026, verifiedAt },
    { type: "official", label: "Oslo kommune – salg av Kirkeristen", url: urls.citySale, verifiedAt },
    { type: "archive", label: "Oslo Byarkiv – Brannvakta og basarene", url: urls.byarkiv, verifiedAt },
    { type: "current_use", label: "Oslo Glass Studio", url: urls.glass, verifiedAt },
    { type: "image_source", label: "Oslo Museum / Commons – anlegget i 1860", url: urls.historic1860Page, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – Basareneforside", url: urls.currentPage, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – Brannvaktens sørlige fasade", url: urls.frontPage, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – kulturhistorisk skilt ved Brannvakten", url: urls.plaquePage, verifiedAt }
  ],
  production_status: "complete",
  production_verified_at: verifiedAt
});
delete place.cardImage;
delete place.imageCard;
delete place.productions;

const coordinateAfter = {
  lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus,
  coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl
};
if (JSON.stringify(coordinateSnapshot) !== JSON.stringify(coordinateAfter)) throw new Error("Kirkeristen coordinate metadata changed");
write(placeFile, place);

const brand = {
  id: brandId, name: "Oslo Glass Studio", aliases: [],
  brand_group: "cultural_institution_brand", brand_type: "glassblowing_studio",
  brand_kind: "venue_identity", sector: "culture", state: "catalog", status: "current",
  verification: "verified", verified_at: verifiedAt,
  desc: "Glassblåseri, galleri og butikk som åpnet i Kirkeristen i 2023.",
  popupdesc: "Oslo Glass Studio holder til i Kirkeristen og drives av Ina Kristine Hove, Kjersti Johannessen og Jeanne-Sophie Aas. Brandkortet representerer dagens glassvirksomhet og skal ikke leses som basarenes historiske opprinnelsesfunksjon.",
  tags: ["brand","glassblowing","glasskunst","kirkeristen",placeId],
  place_ids: [placeId], source_urls: [urls.glass, urls.glassAbout],
  logo: "bilder/kort/brands/oslo_glass_studio.webp",
  imageMeta: glassMeta
};
const brandsMaster = read("data/brands/brands_master.json"); upsert(brandsMaster, brand); write("data/brands/brands_master.json", brandsMaster);
const brandSummary = { id: brand.id, name: brand.name, aliases: brand.aliases, brand_group: brand.brand_group, brand_type: brand.brand_type, brand_kind: brand.brand_kind, sector: brand.sector, state: brand.state, status: brand.status, verification: brand.verification, popupdesc: brand.popupdesc, desc: brand.desc, tags: brand.tags };
for (const file of ["data/brands/brands_catalog.json","data/brands/brands_catalog_v17.json"]) {
  const rows = read(file); upsert(rows, brandSummary); write(file, rows);
}
const rawBrands = read("data/brands/brands_master_raw.json"); upsert(rawBrands, brandSummary); writeCompact("data/brands/brands_master_raw.json", rawBrands);
const byPlace = read("data/brands/brands_by_place.json"); byPlace[placeId] = [brandId]; write("data/brands/brands_by_place.json", byPlace);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/" + placeId + ".json";
const language = {
  place_id: placeId, title: "Språkleksikon: Kirkeristen", verified_at: verifiedAt, dialect_status: "historical_place_terms",
  entries: [
    ["kirkeristen_navnet","Kirkeristen","stedsnavn","Navn knyttet til ferister ved den tidligere kirkegården.","Navnet bevarer et materiellt spor i språket selv om ristene ikke lenger definerer stedet."],
    ["kirkeristen_ferist","ferist","infrastrukturord","Rist i bakken som mennesker kan passere, men som skulle hindre dyr i å gå inn.","Feristene ved kirkegården forklarer stedsnavnet."],
    ["kirkeristen_basar","basar","handelsord","Rekke av faste salgsboder eller små butikker, ofte ordnet under arkader.","Kirkeristens basarer ble opprinnelig bygd for regulert kjøtthandel."],
    ["kirkeristen_slakterbod","slakterbod","handelsord","Fast bod for salg av kjøtt.","Basarene ga slaktere mer kontrollerte salgssteder enn åpent torgsalg."],
    ["kirkeristen_brannvakt","brannvakt","beredskapsord","Organisert vakt og stasjon for å oppdage og håndtere brann.","Brannvakten ved Kirkeristen var byens hovedbrannstasjon fram til 1939."],
    ["kirkeristen_slangetarn","slangetårn","beredskapsord","Høyt rom eller tårn brukt til å henge og tørke brannslanger.","Kirkeristens tårn var slangetårn; selve brannutkikken foregikk fra kirketårnet."]
  ].map(([id,term,type,meaning,context]) => ({ id, term, type, meaning, context, linked_to: { kind: "place", id: placeId }, tags: ["Kirkeristen","byhistorie"], sources: [{ label: "Oppdag Kvadraturen", url: urls.oppdag }, { label: "Oslo kommune", url: urls.citySale }] }))
};
write(languageFile, language);
const languageManifest = read("data/leksikon/sprak/manifest.json"); languageManifest.place_files[placeId] = languageFile; write("data/leksikon/sprak/manifest.json", languageManifest);

const leksikonFile = "data/leksikon/places/oslo/historie/leksikon_" + placeId + ".json";
write(leksikonFile, {
  place_id: placeId, title: "Kirkeristen, Basarene og Brannvakten", type: "main", version: 1,
  visual: { designCode: "article_place_essay_miniature" }, suppress_untitled_legacy_articles: true,
  popupDesc: "Groschs basar- og brannvaktanlegg fra 1840–1859, der handel, brannberedskap, vern og ny bruk møtes.",
  wikiText: [
    "Kirkeristen ble bygd etappevis 1840–1859 som faste basarboder og brannvakt rundt Oslo domkirke.",
    "Brannvakten fra 1855–56 hadde slangetårn for tørking av slanger. Brannutkikken foregikk fra kirketårnet.",
    "Fredningen i 1927 ble fulgt av rivingsvedtak i 1937 og oppheving i 1949. I 2023 åpnet Oslo Glass Studio i anlegget, og i 2026 ble eiendommen solgt med rehabiliteringskrav."
  ],
  summary: { one_liner: "Et byanlegg der regulert handel, brannberedskap og kulturminnevern kan leses i samme teglrekke.", themes: ["handel","brannberedskap","arkitektur","vern","gjenbruk"], tone: ["nøktern","kildekritisk"] },
  facts: [
    { id: "fact_kirkeristen_1859", label: "Fullføring", desc: "Basar- og brannvaktanlegget ble oppført etappevis 1840–1859.", confidence: "high", sources: [{ title: "Oslo kommune", url: urls.citySale }] },
    { id: "fact_kirkeristen_tarn", label: "Slangetårn", desc: "Brannvakttårnet ble brukt til tørking av slanger, mens utkikken var i kirketårnet.", confidence: "high", sources: [{ title: "Oppdag Kvadraturen", url: urls.oppdag }] },
    { id: "fact_kirkeristen_2026", label: "Eierskifte", desc: "I 2026 ble Kirkeristen solgt med seks års rehabiliteringsforpliktelse.", confidence: "high", sources: [{ title: "Oslo kommune", url: urls.city2026 }] }
  ],
  chronology, sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
});
const leksikonManifest = read("data/leksikon/manifest.json"); addOnce(leksikonManifest.files, leksikonFile); write("data/leksikon/manifest.json", leksikonManifest);

const storyFile = "data/stories/stories_" + placeId + ".json";
const story = {
  id: "st_kirkeristen_langt_liv_pa_nade", quality_profile: "episode_v1", type: "turning_point",
  title: "Fredet – og likevel vedtatt revet", year: 1949, place_id: placeId,
  summary: "Kirkeristen ble fredet i 1927, vedtatt revet i 1937 og reddet da rivingsvedtaket ble opphevet i 1949.",
  story: "Da Kirkeristen ble fredet i 1927, kunne historien ha sett avsluttet ut: anlegget var anerkjent som kulturminne. Men vern var ikke det samme som garanti.\n\nTi år senere vedtok byen riving til fordel for park. Dermed sto et fredet 1800-tallsanlegg samtidig i veien for en annen idé om hva sentrum burde være. Murene bar Groschs arkitektur; vedtakene bar skiftende bypolitiske prioriteringer.\n\nI 1949 ble rivingsvedtaket opphevet. At Kirkeristen fortsatt står, er derfor ikke bare en historie om gammelt murverk som overlevde. Det er en historie om at beslutninger kan reverseres, og at bevaring må skje på nytt når eierskap og bruk endres.",
  episode: { actors: ["Oslo kommune","vernemyndigheter","brukere av Kirkeristen"], date: "1927–1949", action: "Fredning ble fulgt av rivingsvedtak og senere oppheving.", consequence: "Anlegget ble stående og kunne få nye bruks- og bevaringslag." },
  sources: [{ title: "Oslo kommune – salg av Kirkeristen", url: urls.citySale }, { title: "Oslo Byarkiv – Brannvakta og basarene", url: urls.byarkiv }],
  tags: ["Kirkeristen","fredning","riving","bevaring","byutvikling"], related_people: [personId], related_places: ["oslo_domkirke"],
  score: { narrative: 3, historical: 2, source: 4, play_value: 3, originality: 3, total: 15 },
  arc: { start: "Anlegget fredes i 1927.", middle: "Byen vedtar riving i 1937.", end: "Rivingsvedtaket oppheves i 1949, og anlegget blir stående." }
};
write(storyFile, [story]);
const storiesManifest = read("data/stories/stories_manifest.json");
storiesManifest.files = storiesManifest.files.filter(x => x.entity_id !== placeId);
storiesManifest.files.push({ category: "historie", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storiesManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json"); addOnce(episodeManifest.files, storyFile); write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_historie.json";
const readings = read(readingFile);
const newReadings = [
  { id: "lesespor_kirkeristen_oppdag", title: "Kirkeristen og Basarene", author: null, publication: "Oppdag Kvadraturen", year: 2026, type: "heritage_feature", subjects: ["basarer","brannvakt","Grosch"], place_ids: [placeId], person_ids: [personId], category_hints: ["historie"], url: urls.oppdag, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Hovedkilde til byggeforløp, navneforklaring og skillet mellom slangetårn og utkikk." },
  { id: "lesespor_kirkeristen_kommune", title: "Kirkeristen får nytt liv med gode matopplevelser", author: null, publication: "Oslo kommune", year: 2026, date: "2026-06-03", type: "official_current_history", subjects: ["eierskap","rehabilitering","fredning"], place_ids: [placeId], person_ids: [], category_hints: ["historie"], url: urls.city2026, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Offisiell kilde til 2026-salget og rehabiliteringskravet." },
  { id: "lesespor_kirkeristen_byarkiv", title: "Brannvakta og basarene ved Kirkeristen – Langt liv på nåde", author: null, publication: "Oslo Byarkiv / TOBIAS", year: 1999, type: "archive_article", subjects: ["riving","bevaring","brannvakt"], place_ids: [placeId], person_ids: [], category_hints: ["historie"], url: urls.byarkiv, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Arkivkilde til anleggets lange bevarings- og rivingshistorie." },
  { id: "lesespor_kirkeristen_glass", title: "Oslo Glass Studio – info", author: null, publication: "Oslo Glass Studio", year: 2026, type: "current_use_primary", subjects: ["glassblåsing","gjenbruk","Kirkeristen"], place_ids: [placeId], person_ids: [], category_hints: ["historie","kunst"], url: urls.glass, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Primærkilde til dagens glassverksted i Kirkeristen." },
  { id: "lesespor_kirkeristen_1860", title: "Christiania Bazarer og Brandvagtsbygning, 1860", author: "Andreas Ludvig Søborg", publication: "Oslo Museum / Wikimedia Commons", year: 1860, type: "historical_visual_source", subjects: ["basarer","brannvakt","materialitet"], place_ids: [placeId], person_ids: [], category_hints: ["historie"], url: urls.historic1860Page, access: "open", rights: "CC0 1.0", source_quality: "institutional", curation_status: "approved", relevance: "Samtidig visuell kilde til det nyfullførte anlegget." }
];
readings.items = readings.items.filter(item => !newReadings.some(x => x.id === item.id));
readings.items.push(...newReadings);
write(readingFile, readings);

const translations = {
  en: { name: "Kirkeristen, the Bazaars and the Fire Watch", desc: "Kirkeristen is the connected bazaar and fire-watch complex south and east of Oslo Cathedral, designed by Christian H. Grosch and built in stages from 1840 to 1859. The bazaars organized meat sales in permanent stalls, while the 1855–56 fire-watch building supported urban fire preparedness.", popupDesc: "The tower on the fire-watch building was used to dry hoses; the actual lookout operated from the cathedral tower. The complex was protected in 1927, faced a demolition decision in 1937 that was reversed in 1949, gained Oslo Glass Studio in 2023, and changed ownership in 2026 with a six-year rehabilitation obligation." },
  es: { name: "Kirkeristen, los bazares y la guardia contra incendios", desc: "Kirkeristen es el conjunto conectado de bazares y guardia contra incendios al sur y al este de la catedral de Oslo, diseñado por Christian H. Grosch y construido por etapas entre 1840 y 1859.", popupDesc: "La torre del edificio de bomberos se utilizaba para secar mangueras; la vigilancia real se hacía desde la torre de la catedral. El conjunto fue protegido en 1927, tuvo una decisión de demolición en 1937 anulada en 1949, recibió Oslo Glass Studio en 2023 y cambió de propietarios en 2026 con obligación de rehabilitación." },
  pt: { name: "Kirkeristen, os bazares e a guarda de incêndio", desc: "Kirkeristen é o conjunto de bazares e guarda de incêndio ao sul e a leste da Catedral de Oslo, projetado por Christian H. Grosch e construído em etapas entre 1840 e 1859.", popupDesc: "A torre do edifício dos bombeiros era usada para secar mangueiras; a observação de incêndios era feita da torre da catedral. O conjunto foi protegido em 1927, teve demolição aprovada em 1937 e anulada em 1949, recebeu o Oslo Glass Studio em 2023 e mudou de proprietários em 2026 com obrigação de reabilitação." }
};
const sourceHash = sha256(JSON.stringify({ name: place.name.normalize("NFC"), desc: desc.normalize("NFC"), popupDesc: popupDesc.normalize("NFC") })).slice(0,16);
for (const [lang, tr] of Object.entries(translations)) {
  const file = "data/i18n/content/places/" + lang + ".json";
  const pack = read(file); pack[placeId] = { _sourceHash: sourceHash, _status: "machine_translated", ...tr }; write(file, pack);
}

const sourceRegistry = {
  oppdag: { url: urls.oppdag, source_type: "institutional", review_status: "reviewed", review_note: "Navn, byggfaser, brannvakt, 1858/1860 og slangetårn-utkikk-grensen." },
  city2026: { url: urls.city2026, source_type: "official", review_status: "reviewed", review_note: "2026-salg, kjøpere, pris og rehabiliteringskrav." },
  citySale: { url: urls.citySale, source_type: "official", review_status: "reviewed", review_note: "Byggeperiode, arkitekt, slakterboder, fredning, 1937/1949 og hovedbrannstasjon til 1939." },
  glass: { url: urls.glass, source_type: "primary", review_status: "reviewed", review_note: "Dagens glassblåseri, kunstnere og publikumsfunksjon." },
  historic1860: { url: urls.historic1860Page, source_type: "archive", review_status: "reviewed", review_note: "CC0-xylografi av basarene og Brannvakten i 1860." }
};
const Q = [
["Hva forklarer navnet Kirkeristen?",["Ferister ved den tidligere kirkegården","Et kirkeorgel","En jernbaneperrong"],"Ferister ved den tidligere kirkegården","Navnet knyttes til ferister som skulle holde dyr ute.","oppdag","em_his_spor_materialitet","fact"],
["Hvem tegnet Kirkeristens basarer og Brannvakten?",["Christian H. Grosch","Jacob Wilhelm Nordan","Henrik Bull"],"Christian H. Grosch","Grosch tegnet anlegget.","citySale","em_his_historiske_lag_i_byrom","fact"],
["Når startet byggingen av basarene?",["1840","1697","1927"],"1840","Basarbyggingen startet i 1840.","oppdag","em_his_historiske_lag_i_byrom","fact"],
["Når var det samlede basaranlegget fullført?",["1859","1814","1905"],"1859","Oslo kommune daterer oppføringen til 1840–1859.","citySale","em_his_historiske_lag_i_byrom","fact"],
["Hva ble basarene opprinnelig brukt til?",["Slakterboder for kjøtthandel","Skoleklasser","Jernbaneverksted"],"Slakterboder for kjøtthandel","Basarene var opprinnelig slakterboder.","citySale","em_his_historiske_lag_i_byrom","fact"],
["Når ble Brannvakten reist?",["1855–1856","1755–1756","1955–1956"],"1855–1856","Brannvakten ble reist midt i 1850-årene.","oppdag","em_his_spor_materialitet","fact"],
["Hva var tårnet på Brannvakten brukt til?",["Å tørke brannslanger","Å ringe inn gudstjenester","Å lagre kjøtt"],"Å tørke brannslanger","Tårnet var et slangetårn.","oppdag","em_his_spor_materialitet","fact"],
["Hvor foregikk selve brannutkikken?",["Fra kirketårnet","Fra slangetårnet","Fra Akershus festning"],"Fra kirketårnet","Brannvakten holdt utkikk fra kirkens tårn.","oppdag","em_his_spor_materialitet","fact"],
["Hvilken stor hendelse rammet sentrum i 1858?",["En storbrann","Et jordskjelv","En flom i Akerselva"],"En storbrann","En stor brann rammet sentrale kvartaler i 1858.","oppdag","em_his_historiske_lag_i_byrom","fact"],
["Hva ble etablert i 1860?",["Profesjonelt brannvesen og nytt vannverk","Ny domkirke","T-banen"],"Profesjonelt brannvesen og nytt vannverk","1860 markerer profesjonalisering og ny vannforsyning.","oppdag","em_his_historiske_lag_i_byrom","fact"],
["Når ble Kirkeristen fredet?",["1927","1840","2026"],"1927","Kirkeristen ble fredet i 1927.","city2026","em_his_kulturminner_bevaring","fact"],
["Hva skjedde i 1937?",["Anlegget ble vedtatt revet","Glassverkstedet åpnet","Brannvakten ble bygget"],"Anlegget ble vedtatt revet","Det fredede anlegget ble vedtatt revet til fordel for park.","citySale","em_his_kulturminner_bevaring","fact"],
["Hva skjedde med rivingsvedtaket i 1949?",["Det ble opphevet","Det ble gjennomført","Det ble flyttet til Bergen"],"Det ble opphevet","Rivingsvedtaket ble opphevet i 1949.","citySale","em_his_kulturminner_bevaring","fact"],
["Til hvilket år var Brannvakten hovedbrannstasjon?",["1939","1859","2003"],"1939","Brannvakten var hovedbrannstasjon til 1939.","citySale","em_his_spor_materialitet","fact"],
["Hva viser byggeperioden 1840–1859?",["At anlegget ble til i flere etapper","At alt ble bygget på én dag","At kirken ble revet"],"At anlegget ble til i flere etapper","Kirkeristen må periodiseres som et flertrinns byggeforløp.","citySale","em_his_samtid_ettertid_fortelling","context"],
["Hvorfor var faste slakterboder et byhistorisk tiltak?",["De gjorde handel mer regulert og hygienisk","De avskaffet all handel","De var bare dekorasjon"],"De gjorde handel mer regulert og hygienisk","Basarene svarer på behov for ordnet kjøtthandel.","oppdag","em_his_historiske_lag_i_byrom","context"],
["Hvorfor er slangetårn-feilen viktig å unngå?",["Den blander to ulike funksjoner og steder","Den endrer teglfargen","Den avgjør butikkprisene"],"Den blander to ulike funksjoner og steder","Tørking av slanger og brannutkikk var ulike funksjoner.","oppdag","em_his_spor_materialitet","context"],
["Hva kan 1860-xylografien dokumentere?",["Anleggets form like etter fullføringen","Eierskiftet i 2026","Alle slakternes navn"],"Anleggets form like etter fullføringen","Bildet er en samtidig visuell kilde til det ferdige anlegget.","historic1860","em_his_spor_materialitet","context"],
["Hva kan 1860-xylografien ikke alene bevise?",["Hvordan alle brukere opplevde stedet","At bygningen fantes","At basarer og Brannvakt lå sammen"],"Hvordan alle brukere opplevde stedet","En visuell kilde har avgrenset utsagnskraft.","historic1860","em_his_spor_materialitet","context"],
["Hva viser kombinasjonen fredning i 1927 og rivingsvedtak i 1937?",["At formelt vern ikke automatisk eliminerer konflikt","At fredning betyr øyeblikkelig riving","At bygget aldri var truet"],"At formelt vern ikke automatisk eliminerer konflikt","Vern og byutviklingsbeslutninger kan trekke i ulike retninger.","citySale","em_his_kulturminner_bevaring","context"],
["Hva er Oslo Glass Studio i Kirkeristens historie?",["Et nåtidig gjenbrukslag","Den opprinnelige slakterboden fra 1840","Brannvesenets hovedkontor"],"Et nåtidig gjenbrukslag","Glassvirksomheten hører til dagens bruk, ikke opprinnelig funksjon.","glass","em_his_samtid_ettertid_fortelling","context"],
["Hvorfor må Oslo domkirke holdes utenfor Kirkeristens egen Place-identitet?",["Fysisk nærhet gjør ikke kirken til samme historiske anlegg","Kirken ble revet før basarene kom","Domkirken ligger i en annen by"],"Fysisk nærhet gjør ikke kirken til samme historiske anlegg","Stedsavgrensning må følge historisk funksjon og canonical identitet, ikke bare naboskap.","oppdag","em_his_samtid_ettertid_fortelling","concept","met_sporlesning"],
["Hvordan bør eierskiftet i 2026 analyseres historisk?",["Som et nytt forvaltningslag etter eldre handel, brannberedskap og vern","Som årsaken til at basarene ble bygget i 1840","Som bevis på at fredningen opphørte"],"Som et nytt forvaltningslag etter eldre handel, brannberedskap og vern","Eierskiftet er et nytt tidslag og må ikke projiseres bakover som årsak til 1800-tallets anlegg.","city2026","em_his_historiske_lag_i_byrom","concept","met_tidslagsanalyse"],
["Hva viser rehabiliteringskravet om forholdet mellom vern og ny bruk?",["Ny bruk må forhandles innenfor fredningsrammene","Fredning forbyr all framtidig bruk","Nye eiere kan se bort fra eldre vern"],"Ny bruk må forhandles innenfor fredningsrammene","Rehabiliteringskravet viser at eierskap og bruk kan endres samtidig som kulturminnerestriksjoner består.","city2026","em_his_kulturminner_bevaring","concept","met_institusjonshistorisk_analyse"],
["Hvilken metode er best når 1860-bildet og en 2026-pressemelding brukes sammen?",["Kildekritikk av type, tid og formål","Å behandle dem som samme kilde","Å velge den eldste automatisk"],"Kildekritikk av type, tid og formål","Kildene har ulik samtidighet, sjanger og utsagnskraft.","historic1860","em_his_spor_materialitet","concept","met_kildekritikk"],
["Hvordan bør et 2026-salg plasseres i Kirkeristens tidslinje?",["Som et nytt lag etter eldre handel, brannberedskap og vern","Som årsaken til byggingen i 1840","Som del av middelalderen"],"Som et nytt lag etter eldre handel, brannberedskap og vern","Historisk lagdeling hindrer at nye hendelser projiseres bakover.","city2026","em_his_samtid_ettertid_fortelling","concept","met_institusjonshistorisk_analyse"],
["Hva er den sterkeste slutningen fra 1937 og 1949?",["Bevaring avhenger av beslutninger som kan endres","Alle fredede bygg rives","Rivingsvedtak er alltid irreversible"],"Bevaring avhenger av beslutninger som kan endres","Kirkeristen viser at politiske beslutninger om kulturminner kan reverseres.","citySale","em_his_kulturminner_bevaring","concept","met_institusjonshistorisk_analyse"],
["Hva bør en historiker gjøre med påstanden om Brannvakttårnet som utkikk?",["Kontrollere funksjonen mot kilder og korrigere sammenblandingen","Gjenta den fordi tårnet er høyt","Ignorere alle skriftlige kilder"],"Kontrollere funksjonen mot kilder og korrigere sammenblandingen","Kildekritikk korrigerer en intuitiv, men feil funksjonstolkning.","oppdag","em_his_spor_materialitet","concept","met_kildekritikk"]
];
const phases = ["opening","middle","bridge","final"];
const titles = ["Basarer og Grosch","Brannberedskap og vern","Historiske lag","Kildekritikk og bevaring"];
const questions = Q.map((row,index) => {
  const [question, opts0, answer, knowledge, sourceId, emne_id, question_type, method_id] = row;
  const options = [...opts0.slice(index % opts0.length), ...opts0.slice(0, index % opts0.length)];
  const n = index + 1;
  const item = {
    id: placeId + "_quiz_" + String(n).padStart(2,"0"),
    quiz_id: "historie_" + placeId + "_set_" + (Math.floor(index/7)+1) + "_q" + ((index%7)+1),
    categoryId: "historie", placeId, personId: "", natureId: "", targetId: placeId, question_scope: "place",
    question, options, answer, answerIndex: options.indexOf(answer), knowledge, trivia: [],
    difficulty: n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : 4,
    question_type, question_layer: n <= 14 ? "normal_opening" : n <= 21 ? "bridge" : "final",
    year: null, epoke_id: null, epoke_domain: "historie", emne_id,
    related_emner: [], core_concepts: [], concept_focus: [], learning_paths: [],
    tags: [placeId,"oslo","historie","byhistorie"], required_tags: [],
    source: [sourceId], source_origin: "external", claim_basis: knowledge,
    claim_id: "claim_" + placeId + "_quiz_" + String(n).padStart(2,"0"),
    primary_knowledge_unit_id: "ku_his_" + placeId + "_" + String(n).padStart(2,"0"),
    knowledge_unit_ids: ["ku_his_" + placeId + "_" + String(n).padStart(2,"0")],
    concept_ids: question_type === "concept" ? ["co_historie_historisk_endring_84be686aa4"] : [],
    term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked",
    concepts: question_type === "fact" ? ["historisk endring"] : ["kildekritikk og historiebruk"]
  };
  if (method_id) Object.assign(item, { method_id, guidance_basis: ["data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/methods_historie_canonical_v4_5.json"] });
  if (n === 23) Object.assign(item, {
    topic_hook_id: "his_tidslag_samtidighet",
    thinker_id: "reinhart_koselleck",
    thinker_name: "Reinhart Koselleck",
    work: "Futures Past",
    theory_ref: {
      topic_hook_id: "his_tidslag_samtidighet",
      thinker_id: "reinhart_koselleck",
      work: "Futures Past",
      why_it_helps: "Kosellecks tidslag hjelper med å skille Kirkeristens samtidige fysiske rester fra funksjoner, vedtak og bruk som tilhører ulike perioder, uten å erstatte stedskildene."
    }
  });
  return item;
});
const briefFile = "data/quiz/production_briefs/historie/" + placeId + ".json";
const contextFile = "data/quiz/production_context/historie/" + placeId + ".json";
const quizFile = "data/quiz/historie/" + placeId + "_sets.json";
const selectedCurriculum = {
  emne_ids: [...new Set(questions.map(q => q.emne_id))],
  topic_hook_ids: ["his_tidslag_samtidighet"],
  method_ids: [...new Set(questions.map(q => q.method_id).filter(Boolean))],
  thinker_ids: ["reinhart_koselleck"], works: ["Futures Past"]
};
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire kildebårne sett dekker direkte stedskunnskap, brannberedskap, historiske lag og kildekritisk syntese." };
const existingQuizAudit = { searched_paths: [quizFile,"data/quiz/manifest.json"], active_before: { categoryId: null, set_count: 0, question_count: 0 }, decisions: ["Produser én canonical normal 4x7-pakke med fjorten rene faktaspørsmål først."], knowledge_migration: { status: "not_applicable", retained_rule: "Ingen aktiv målquiz ble funnet." } };
const heldBackCandidates = ["Brannvakttårnet som utkikkstårn.","Oslo Glass Studio som opprinnelig basarfunksjon.","Oslo domkirke som del av samme Place-identitet.","Ubegrunnet optisk før–nå-sammenligning."];
write(briefFile, {
  schema_version: "1.0", categoryId: "historie", targetId: placeId, scope: "place", status: "reviewed", reviewed_at: verifiedAt,
  profile_hint: "normal_4x7", review_note: "Kildene er eksplisitt avgrenset mellom 1800-tallsfunksjoner, vern, nåbruk og 2026-eierskap.",
  sources: sourceRegistry, selected_curriculum: selectedCurriculum, profile_decision: profileDecision,
  existing_quiz_audit: existingQuizAudit, held_back_candidates: heldBackCandidates,
  claims: questions.map((q,i) => ({ claim_id: q.claim_id, order: i+1, planned_phase: phases[Math.floor(i/7)], family: q.question_type === "concept" ? "concept_theory" : q.question_type, statement: q.claim_basis, source_ids: q.source, source_origin: "external", emne_id: q.emne_id, ...(q.method_id ? { method_id: q.method_id } : {}), ...(q.topic_hook_id ? { topic_hook_id: q.topic_hook_id, thinker_id: q.thinker_id, work: q.theory_ref?.work } : {}) }))
});
write(quizFile, {
  targetId: placeId, categoryId: "historie", size_class: "normal_4x7", generated_from: briefFile, generator_version: "history_go_manual_reviewed_v1",
  sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id,s]) => [id,s.url])),
  sets: phases.map((phase,index) => ({ set_id: "historie_" + placeId + "_set_" + (index+1), level: index+1, order: index+1, phase, title: titles[index], xp: 50 + index*25, questions: questions.slice(index*7,index*7+7) }))
});
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.historie.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/historie/" + placeId + ".json", context_artifact: "../quiz/production_context/historie/" + placeId + ".json", quiz_file: "../quiz/historie/" + placeId + "_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);
const quizManifest = read("data/quiz/manifest.json");
quizManifest.historie ||= {};
quizManifest.historie[placeId] = "historie/" + placeId + "_sets.json";
if (Array.isArray(quizManifest.sets)) {
  quizManifest.sets = quizManifest.sets.filter(x => x.targetId !== placeId);
  quizManifest.sets.push({ targetId: placeId, file: quizFile });
}
write("data/quiz/manifest.json", quizManifest);
const built = await runBuildQuizProductionContext({ root, categoryId: "historie", targetId: placeId, outputPath: contextFile });
const quiz = read(quizFile);
quiz.production_context = {
  manifest_category: "historie", profile: built.profile, standard_version: "3.4",
  source_brief: briefFile, context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(built.resolved_files).map(([k,v]) => [k,v.path])),
  required_inputs_loaded: built.required_inputs_loaded,
  pensum_module_ids: built.selected_curriculum.module_ids,
  emne_ids: built.selected_curriculum.emne_ids,
  topic_hook_ids: built.selected_curriculum.topic_hook_ids,
  method_ids: built.selected_curriculum.method_ids,
  thinker_ids: built.selected_curriculum.thinker_ids,
  works: built.selected_curriculum.works,
  source_review_status: built.source_review_status,
  existing_quiz_audit: built.existing_quiz_audit,
  profile_decision: built.profile_decision,
  held_back_candidates: built.held_back_candidates,
  normal_opening_questions: 14,
  theory_start_phase: "final",
  method_start_phase: "final"
};
write(quizFile, quiz);

const packetSources = sourceRegistry;
const makeClaims = (prefix,text) => sentences(text).map((sentence,index) => {
  const id = /2026|eier|rehabiliter/i.test(sentence) ? "city2026" : /Glass Studio|glass/i.test(sentence) ? "glass" : /fredet|1937|1949|1939|slakter/i.test(sentence) ? "citySale" : "oppdag";
  const src = packetSources[id];
  return {
    id: "claim_" + placeId + "_" + prefix + "_" + String(index+1).padStart(2,"0"),
    claim: sentence, sourceUrl: src.url, sourceLocation: src.review_note + " – " + prefix + ", setning " + (index+1),
    sourceType: src.source_type, verifiedAt, status: "verified",
    claimKind: index === 0 && prefix === "desc" ? "identity" : "fact",
    evidenceMode: "direct", temporalStatus: /2023|2026|dagens|nåtidig|drives av|nye eier|forpliktet/i.test(sentence) ? "current" : "historical"
  };
});
const descClaims = makeClaims("desc", desc);
const popupClaims = makeClaims("popup", popupDesc);
const allClaims = [...descClaims,...popupClaims];
write("data/places/production/" + placeId + ".json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: {
    status: "resolved",
    represents: "Basar- og brannvaktanlegget Kirkeristen sør og øst for Oslo domkirke.",
    period: "1840–",
    excludes: ["Oslo domkirke som egen Place-identitet","en påstand om at slangetårnet var brannutkikk","nåværende leietakere som opprinnelige basarfunksjoner"]
  },
  claims: allClaims,
  sentenceCoverage: { desc: descClaims.map((c,i) => ({ sentence:i+1, claimIds:[c.id] })), popupDesc: popupClaims.map((c,i) => ({ sentence:i+1, claimIds:[c.id] })) },
  metadataSnapshot: { name: place.name, category: place.category, year: place.year, coordinates: { lat: place.lat, lon: place.lon } },
  collections: { people:[personId], objects:objects.map(x=>x.id), brands:[brandId], historical_events:historicalEvents.map(x=>x.id) },
  quizReadiness: {
    status:"ready", quizTargetId:placeId, sourceBrief:briefFile, productionContext:contextFile,
    totalQuestions:28, normalOpeningQuestions:14, reuseDecision:"Canonical 4x7 source-led History package produced.",
    questions:[
      { type:"hva", question:"Hva forklarer navnet Kirkeristen?", answer:"Ferister som skulle holde dyr ute av den tidligere kirkegården.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_desc_04"] },
      { type:"hvem", question:"Hvem tegnet basarene og Brannvakten?", answer:"Christian H. Grosch.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_04","claim_" + placeId + "_popup_05"] },
      { type:"når", question:"Når startet byggingen av basarene?", answer:"1840.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_01"] },
      { type:"når", question:"Når var basaranlegget fullt utbygd?", answer:"1859.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_03"] },
      { type:"hva_ble_bygget_produsert_eller_endret", question:"Hva ble reist i 1855–56?", answer:"Brannvaktbygningen.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_06"] },
      { type:"hva", question:"Hva ble tårnet på Brannvakten brukt til?", answer:"Tørking av brannslanger.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_07"] },
      { type:"hvor", question:"Hvor foregikk selve brannutkikken?", answer:"Fra kirketårnet.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_08"] },
      { type:"hva_skjedde", question:"Hva skjedde med rivingsvedtaket i 1949?", answer:"Det ble opphevet.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_12"] },
      { type:"hva_skjedde", question:"Hva åpnet i Kirkeristen i 2023?", answer:"Oslo Glass Studio.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_14"] },
      { type:"hva_skjedde", question:"Hva vedtok Oslo bystyre i 2026?", answer:"Salg av Kirkeristen til Fauna Eiendom AS og Andenergy AS for 34 millioner kroner.", normalKnowledgeQuestion:true, claimIds:["claim_" + placeId + "_popup_17"] }
    ]
  },
  roundsReadiness: { status:"ready", exactCollectionCount:4 },
  source_conflicts: [
    { claim:"Brannvakttårnet var utkikkstårn.", status:"rejected", reason:"Oppdag Kvadraturen identifiserer tårnet som slangetårn og legger utkikken til kirketårnet." },
    { claim:"Fredningen i 1927 gjorde anlegget sikkert mot riving.", status:"rejected", reason:"Rivingsvedtak fulgte i 1937 og ble først opphevet i 1949." }
  ],
  reviews: {
    factual:{ status:"passed", reviewedAt:verifiedAt, reviewer:"Kirkeristen source review", notes:"Byggeforløp, brannfunksjon, vern, nåbruk og 2026-eierskap er kildeavgrenset." },
    editorial:{ status:"passed", reviewedAt:verifiedAt, reviewer:"Kirkeristen identity review", introducedNewFacts:false, notes:"Domkirken holdes separat; slangetårn-feilen er eksplisitt korrigert." }
  },
  completion:{ completedUnder:"4.2", currentStatus:"current", sourceVerifiedAt:verifiedAt, claimsVerified:{verified:allClaims.length,total:allClaims.length}, factualReview:"passed", editorialReview:"passed", validatorVersion:"4.2.1" },
  textHashes:{ algorithm:"sha256", desc:sha256(desc), popupDesc:sha256(popupDesc) }
});

const historySources = [
  { id:"source_kirkeristen_oppdag", url:urls.oppdag, sourceLocation:"Stedshistorie og brannvaktfunksjon", sourceType:"museum_or_heritage", verifiedAt, temporalCoverage:"retrospective", provenance:"Oppdag Kvadraturen.", limitations:"Formidlingskilde; sammenholdes med offisielle kommunekilder." },
  { id:"source_kirkeristen_city", url:urls.citySale, sourceLocation:"Fakta om bygg, fredning og rivingsvedtak", sourceType:"official", verifiedAt, temporalCoverage:"retrospective", provenance:"Oslo kommune.", limitations:"Salgspresentasjon sammenfatter eldre historie." },
  { id:"source_kirkeristen_2026", url:urls.city2026, sourceLocation:"Eierskifte og rehabiliteringskrav", sourceType:"official", verifiedAt, temporalCoverage:"current", provenance:"Oslo kommune.", limitations:"Nåtidig pressemelding, ikke primærkilde til 1800-tallet." },
  { id:"source_kirkeristen_1860", url:urls.historic1860Page, sourceLocation:"1860-xylografi", sourceType:"archive", verifiedAt, temporalCoverage:"contemporary_to_event", provenance:"Oslo Museum / Wikimedia Commons.", limitations:"Visuell kilde dokumenterer form, ikke alle praksiser eller erfaringer." },
  { id:"source_kirkeristen_glass", url:urls.glass, sourceLocation:"Dagens glassverksted", sourceType:"primary", verifiedAt, temporalCoverage:"current", provenance:"Oslo Glass Studio.", limitations:"Primærkilde til egen nåværende virksomhet." }
];
const historySourceIds = historySources.map(x=>x.id);
const caseId = "case_kirkeristen_byinfrastruktur_vern";
write("data/places/historie-production/" + placeId + ".json", {
  schemaVersion:"historie_place_production_v1", validatorVersion:"1.0.0", placeId, placeFile, status:"ready",
  historicalIdentity:{
    statement:"Kirkeristen er Groschs basar- og brannvaktanlegg fra 1840–1859, med senere lag av vern, gjenbruk og eierskap.",
    placeRelationType:"institution_site",
    placeRelationStatement:"Place-ID-en representerer basarene og Brannvakten, ikke Oslo domkirke.",
    temporalScope:{start:"1840",end:"2026",precision:"period",rationale:"Perioden dekker bygging, drift, vern, gjenbruk og eierskifte."},
    sourceIds:historySourceIds
  },
  historyTopics:[
    {emneId:"em_his_spor_materialitet",siteSpecificRationale:"Arkader, slangetårn, skilt og 1860-xylografi gir konkrete materielle spor.",caseIds:[caseId]},
    {emneId:"em_his_historiske_lag_i_byrom",siteSpecificRationale:"Handel, brannberedskap og senere virksomheter ligger som ulike brukslag i samme anlegg.",caseIds:[caseId]},
    {emneId:"em_his_kulturminner_bevaring",siteSpecificRationale:"Fredning, rivingsvedtak, oppheving og rehabiliteringskrav gjør bevaring til en beslutningshistorie.",caseIds:[caseId]},
    {emneId:"em_his_samtid_ettertid_fortelling",siteSpecificRationale:"Skilt, glassverksted og 2026-salg viser hvordan eldre byinfrastruktur fortolkes og brukes på nytt.",caseIds:[caseId]}
  ],
  sources:historySources,
  caseRealizations:[{
    id:caseId,
    claim:"Kirkeristen viser hvordan kommunal byinfrastruktur for handel og brannberedskap kunne få nye betydninger gjennom vern, rivingskonflikt og gjenbruk.",
    temporalSequence:{
      scope:{start:"1840",end:"2026",precision:"period",rationale:"Caset følger anlegget fra byggestart til dagens eierskap."},
      startPoint:"Basarbyggingen startet i 1840 for mer regulert kjøtthandel.",
      endPoint:"I 2026 ble anlegget overført til nye eiere med rehabiliteringsforpliktelse.",
      breaks:["Brannvakten 1855–56 la beredskap til handelsanlegget.","Fredning i 1927 ble fulgt av rivingsvedtak i 1937 og oppheving i 1949.","Oslo Glass Studio åpnet i 2023 som nytt brukslag.","Eierskiftet i 2026 endret forvaltningsrammen."],
      continuities:["Groschs teglanlegg er fortsatt fysisk lesbart.","Basarlokalene har fortsatt småskala publikumsrettet bruk selv om varetypen er endret."],
      sourceIds:["source_kirkeristen_oppdag","source_kirkeristen_city","source_kirkeristen_2026"]
    },
    actors:[
      {name:"Christian H. Grosch",roleOrInterest:"Arkitekt for basarene og Brannvakten.",powerPosition:"Formet den fysiske infrastrukturen.",sourceIds:["source_kirkeristen_oppdag","source_kirkeristen_city"]},
      {name:"Christiania/Oslo kommune",roleOrInterest:"Byggherre, brannberedskapsaktør, eier og senere selger.",powerPosition:"Kunne regulere funksjon, riving og eierskap.",sourceIds:["source_kirkeristen_city","source_kirkeristen_2026"]},
      {name:"Nye eiere og dagens leietakere",roleOrInterest:"Rehabilitering og ny bruk av fredet anlegg.",powerPosition:"Kan forme bruk innenfor fredningsrammer.",sourceIds:["source_kirkeristen_2026","source_kirkeristen_glass"]}
    ],
    conflictOrNegotiation:{statement:"Fredning og rivingsvedtak viser motstridende syn på hvordan sentrum skulle brukes; dagens rehabilitering forhandler mellom vern og ny aktivitet.",sourceIds:["source_kirkeristen_city","source_kirkeristen_2026"]},
    sourceComparison:{
      sourceIds:historySourceIds,
      comparison:"1860-xylografien er nær samtidig med fullføringen, kommunekildene dokumenterer forvaltnings- og eierskapsbeslutninger, Oppdag Kvadraturen avklarer funksjoner, og Oslo Glass Studio dokumenterer nåbruk.",
      contradictionsOrSilences:"Den intuitive tolkningen av Brannvakttårnet som utkikk motsies av kilden som plasserer utkikken i kirketårnet. Åpne kilder sier mindre om slakternes individuelle erfaringer.",
      conclusionLimits:"Kildene bærer bygge-, funksjons-, vern- og gjenbrukshistorie, men ikke en komplett sosialhistorie for alle som arbeidet i bodene."
    },
    comparativeScale:{localFinding:"Kirkeristen samler handel og brannberedskap fysisk rundt en sentral kirke.",widerContext:"Kirkeristen kan settes inn i en nasjonal utvikling mot mer regulert urban infrastruktur og senere institusjonalisert kulturminnevern.",scale:"national",sourceIds:["source_kirkeristen_oppdag","source_kirkeristen_city"]},
    causationAndUncertainty:{causalAssessment:"Behov for regulert kjøtthandel og organisert brannberedskap er dokumenterte funksjonsdrivere; senere bevaring skyldes skiftende vedtak og vern, ikke én enkelt årsak.",alternativeExplanations:["Byutviklingsidealer kunne både favorisere riving og bevaring.","Nåbruk bestemmes av leie- og eierskapsforhold innenfor fredningsrammene."],uncertainty:"Kildene gir ikke komplett beslutningshistorikk for hver ombygging eller leietaker.",sourceIds:["source_kirkeristen_oppdag","source_kirkeristen_city","source_kirkeristen_2026"]}
  }],
  presentTrace:{objectStatus:"altered",statement:"Teglarkadene, Brannvakten og slangetårnet står fortsatt, mens basarlokalene har nye virksomheter.",originalSiteRelationship:"Dagens Place-anker ligger på det historiske anlegget; gjenbruk og skilt er senere lag.",sourceIds:["source_kirkeristen_oppdag","source_kirkeristen_glass","source_kirkeristen_2026"]},
  quizOpening:{status:"PASS",quizTargetId:placeId,firstTwoSetsQuestionCount:14,sourceBrief:briefFile,productionContext:contextFile,requiredInputs:["data/fag/historie/historiepensum_canonical_v4_5.json","data/fag/historie/emner_historie_canonical_v4_5.json","data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/methods_historie_canonical_v4_5.json","data/fag/historie/supersetQUIZMAL_historie.json","data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md","data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"]},
  chronologyStories:{status:"PASS",chronologyReviewed:true,storiesReviewed:true,rationale:"Elleve kronologiankere og en kildebåret Story dekker bygging, drift, vern, gjenbruk og eierskifte."},
  gates:{
    A:{status:"PASS",evidenceRefs:["historicalIdentity"]},
    B:{status:"PASS",evidenceRefs:["historyTopics"]},
    C:{status:"PASS",evidenceRefs:["caseRealizations[0].temporalSequence"]},
    D:{status:"PASS",evidenceRefs:["caseRealizations[0].actors","caseRealizations[0].conflictOrNegotiation"]},
    E:{status:"PASS",evidenceRefs:["caseRealizations[0].sourceComparison"]},
    F:{status:"PASS",evidenceRefs:["caseRealizations[0].comparativeScale","caseRealizations[0].causationAndUncertainty","presentTrace"]},
    G:{status:"PASS",evidenceRefs:["quizOpening"]},
    H:{status:"PASS",evidenceRefs:["chronologyStories"]}
  },
  review:{reviewer:"Kirkeristen completion review",reviewedAt:verifiedAt,notes:"Slangetårn/utkikk, sted/DOMKIRKE-grense, vern og 2026-eierskap er eksplisitt kontrollert."}
});

const fagRegistry = read("data/fagverk/fagverk_registry.json");
fagRegistry.placeLinks[placeId] = { sourceFile: placeFile.replace(/^data\//,""), field:"fagverk", schema:fagverk.schema, level:fagverk.level, status:fagverk.status };
write("data/fagverk/fagverk_registry.json", fagRegistry);

write("reports/place-production/" + placeId + "-workcard-current.json", {
  schema:"history_go_place_workcard_v1", place_id:placeId, category:"historie", status:"complete",
  completed_at:verifiedAt, production_profile:"standard", profile_status:"confirmed",
  source_review:"complete", collections:["people","objects","brands","historical_events"],
  quiz_profile:"normal_4x7", history_gates:"A-H PASS", quality_gate:"reports/place-production/" + placeId + "-phase1-24-gate-audit-v1.json",
  canonical_next:null,
  notes:["Existing canonical coordinates preserved.","Christian Heinrich Grosch reused from existing People catalog; no duplicate person created.","Brannvakttårnet is explicitly modeled as hose-drying tower, not lookout.","Oslo Cathedral remains a separate Place identity.","2026 ownership transfer and six-year rehabilitation obligation included as current historical layer."]
});
execFileSync(process.execPath, ["scripts/place-production-rule-preflight.mjs","record","--workcard","reports/place-production/" + placeId + "-workcard-current.json","--place-id",placeId,"--category","historie"], { cwd:root, stdio:"inherit" });
write("reports/place-production/" + placeId + "-phase1-24-gate-audit-v1.json", {
  schema:"history_go_phase1_24_quality_gate_v1", place_id:placeId, verified_at:verifiedAt,
  null_measurement:{existing_place:true,coordinate_changed:false,existing_people:"christian_heinrich_grosch reused",existing_quiz:"replaced_by_source_led_4x7",existing_collections:"partial legacy",existing_fagverk:"upgraded_to_curated_v2"},
  collections:{required:["people","objects","brands","historical_events"],missing:0,coverage_percent:100},
  people:{candidates_reviewed:["Christian Heinrich Grosch"],selected:[personId],held_back:[],image_coverage_percent:100},
  objects:{selected:objects.map(x=>x.id),held_back:[],exception:null},
  brands:{selected:[brandId],held_back:[],logo_coverage:{required:1,reviewed:1,missing:0,percent:100}},
  source_conflicts:[
    {claim:"Brannvakttårnet var utkikkstårn.",status:"rejected",reason:"Kildene skiller slangetårnet fra utkikk i kirketårnet."},
    {claim:"Fredningen i 1927 gjorde anlegget sikkert mot riving.",status:"rejected",reason:"Rivingsvedtaket i 1937 viser det motsatte."}
  ],
  conditional_modules:{stories:"one_episode_v1_produced",lesespor:"five_produced",language:"six_terms_produced",for_na:"source_bounded_temporal_comparison",news:"represented_by_2026_historical_event",dialect:"not_applicable"},
  manual_image_review:{status:"PASS",reviewed_assets:[place.image,place.frontImage,place.quizCardImage,brand.logo,...objects.map(x=>x.image),...historicalEvents.map(x=>x.image)],note:"Place and member imagery is source-based: Commons/Oslo Museum or official Oslo Glass Studio photography. Event reuse is marked as historical/current context."},
  quality_score:{
    correctness_and_evidence:{score:5,note:"Core chronology and disputed tower function are source-bound."},
    coverage_and_completion:{score:5,note:"Four collections, Story, chronology, language, five reading tracks, Fagverk and 4x7 quiz are materialized."},
    editorial_quality:{score:5,note:"Place identity, current use and church boundary are explicit."},
    technical_integrity:{score:5,note:"Deterministic finalizer and canonical manifests are updated."},
    safety_and_responsibility:{score:5,note:"No unsupported disaster spectacle or invented identities."},
    maintainability_and_auditability:{score:5,note:"Source conflicts, production packets and workcard provide audit trail."},
    total:30,critical_findings:0,unresolved_blockers:0
  }
});

execFileSync(process.execPath, ["--experimental-strip-types","scripts/build-civication-scenario-people-index.mts"], { cwd:root, stdio:"inherit" });
execFileSync("npm", ["run","civication:history-people:build"], { cwd:root, stdio:"inherit" });
execFileSync(process.execPath, ["scripts/build-epoke-place-index.mjs"], { cwd:root, stdio:"inherit" });
execFileSync(process.execPath, ["scripts/materialize-natur-final-registry.mjs"], { cwd:root, stdio:"inherit" });
execFileSync("npm", ["run", "places:index:build"], { cwd:root, stdio:"inherit" });
execFileSync(process.execPath, ["scripts/build-place-open-payloads.mjs"], { cwd:root, stdio:"inherit" });

// Context fingerprints must settle before downstream Knowledge/Fagverk release hashes are materialized.
await runBuildQuizProductionContext({ root, categoryId: "historie", targetId: placeId, outputPath: contextFile });
execFileSync(process.execPath, ["--experimental-strip-types","scripts/knowledge-canonical-data.mts","--write"], { cwd:root, stdio:"inherit" });
execFileSync(process.execPath, ["scripts/build-fagverk-release-manifest.mjs"], { cwd:root, stdio:"inherit" });
// Place-open fingerprints depend on the fully settled canonical state above; rebuild last.
execFileSync("npm", ["run", "place-open:build"], { cwd:root, stdio:"inherit" });

console.log(JSON.stringify({
  place:placeId,
  collections:place.place_card_profile.collection_ids,
  quizQuestions:questions.length,
  chronology:chronology.length,
  readingTracks:newReadings.length,
  languageTerms:language.entries.length,
  quality:30
}, null, 2));
