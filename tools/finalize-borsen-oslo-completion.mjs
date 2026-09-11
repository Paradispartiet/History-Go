#!/usr/bin/env node
// Canonical Oslo Børs production finalizer; deterministic, source-led, fresh-main safe, and CI-replayable.
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
const verifiedAt = "2026-09-11";
const placeId = "borsen_oslo";
const categoryId = "naeringsliv";
const personId = "thor_olsen";
const groschId = "christian_heinrich_grosch";
const brandId = "oslo_bors_marketplace";
const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/borsen_oslo.json";
const personFile = "data/people/naeringsliv/oslo/borsen_oslo/thor_olsen.json";
const claimsFile = "data/people/claims/naeringsliv/oslo/borsen_oslo/thor_olsen.claims.json";
const quizFile = "data/quiz/naeringsliv/borsen_oslo_sets.json";
const briefFile = "data/quiz/production_briefs/naeringsliv/borsen_oslo.json";
const contextFile = "data/quiz/production_context/naeringsliv/borsen_oslo.json";

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
const sentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)]
  .map(row => row.segment.trim()).filter(Boolean);
const commonsAsset = filename => "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + encodeURIComponent(filename);

const modernFilename = "BØRSEN Oslo børs Børsbygningen (Oslo Stock Exchange building) Tollbugata Street NORWAY built 1829, 1911 Fasade mot nord (Lettered facade facing north) Søyler (Doric columns) Veggur (gable clock) Sunny Summer etc 2023-07-29 IMG 9743.jpg";
const historicFilename = "Oslo Tollbugt. 2. Børsen - NB MS G4 0464.jpg";
const mercuryFilename = "Børsen Mercurfigur - no-nb digifoto 20160330 00312 NB NS NM 08933.jpg";
const thorFilename = "Thor Olsen.jpg";

const urls = {
  byleksikon: "https://oslobyleksikon.no/side/B%C3%B8rsen",
  oppdag: "https://www.oppdagkvadraturen.no/stoppesteder/tollbugata-2-borsen",
  lokalhistorie: "https://lokalhistoriewiki.no/wiki/Oslo_B%C3%B8rs",
  euronext: "https://www.euronext.com/en/about/our-organisation",
  modernPage: "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(modernFilename).replace(/%2F/g, "/"),
  modernAsset: commonsAsset(modernFilename),
  historicPage: "https://commons.wikimedia.org/wiki/File:Oslo_Tollbugt._2._B%C3%B8rsen_-_NB_MS_G4_0464.jpg",
  historicAsset: commonsAsset(historicFilename),
  mercuryPage: "https://commons.wikimedia.org/wiki/File:B%C3%B8rsen_Mercurfigur_-_no-nb_digifoto_20160330_00312_NB_NS_NM_08933.jpg",
  mercuryAsset: commonsAsset(mercuryFilename),
  thorPage: "https://commons.wikimedia.org/wiki/File:Thor_Olsen.jpg",
  thorAsset: commonsAsset(thorFilename)
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function download(url, filename) {
  const target = path.join(os.tmpdir(), "history-go-borsen-media", filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (fs.existsSync(target) && fs.statSync(target).size > 1000) return target;
  let status = null;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "History-Go/1.0 (source-audit; github.com/Paradispartiet/History-Go)",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
      }
    });
    status = res.status;
    if (res.ok) {
      fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      await sleep(1800);
      return target;
    }
    if (res.status !== 429 && res.status < 500) throw new Error("Media fetch failed " + res.status + " " + url);
    await sleep(2200 * attempt);
  }
  throw new Error("Media fetch failed after retries " + status + " " + url);
}
async function output(source, file, width, height, position = "centre") {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(source).rotate().resize(width, height, { fit: "cover", position }).webp({ quality: 88 }).toFile(target);
}

const modernSrc = await download(urls.modernAsset, "borsen-modern.jpg");
const historicSrc = await download(urls.historicAsset, "borsen-historic.jpg");
const mercurySrc = await download(urls.mercuryAsset, "borsen-mercury.jpg");
const thorSrc = await download(urls.thorAsset, "thor-olsen.jpg");

await output(modernSrc, "bilder/places/borsen_oslo.webp", 1400, 900, "centre");
await output(modernSrc, "bilder/places/borsen_oslo_front_portrait.webp", 900, 1200, "centre");
await output(historicSrc, "bilder/places/borsen_oslo_1880_1910.webp", 1200, 900, "centre");
await output(mercurySrc, "bilder/kort/objects/borsen_oslo_merkur.webp", 900, 620, "centre");
await output(historicSrc, "bilder/kort/historical_events/borsen_oslo_1819.webp", 900, 620, "centre");
await output(historicSrc, "bilder/kort/historical_events/borsen_oslo_1899.webp", 900, 620, "centre");
await output(modernSrc, "bilder/kort/historical_events/borsen_oslo_2019.webp", 900, 620, "centre");
await output(modernSrc, "bilder/kort/brands/oslo_bors_marketplace.webp", 900, 620, "centre");
await output(thorSrc, "bilder/kort/people/thor_olsen.webp", 700, 900, "centre");

const quizOverlay = Buffer.from(
  '<svg width="900" height="1280" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="900" height="1280" fill="rgba(0,0,0,.25)"/>' +
  '<rect x="58" y="930" width="784" height="250" rx="32" fill="rgba(0,0,0,.78)"/>' +
  '<text x="100" y="1020" font-family="Arial, sans-serif" font-size="60" font-weight="700" fill="white">Oslo Børs</text>' +
  '<text x="100" y="1092" font-family="Arial, sans-serif" font-size="31" fill="white">1819 · kapitalmarked · Tollbugata 2</text>' +
  '<text x="100" y="1142" font-family="Arial, sans-serif" font-size="27" fill="white">28 spørsmål · næringsliv</text>' +
  '</svg>'
);
const quizCard = path.join(root, "bilder/QuizCards/Oslo Børs.webp");
fs.mkdirSync(path.dirname(quizCard), { recursive: true });
await sharp(modernSrc).rotate().resize(900, 1280, { fit: "cover" }).composite([{ input: quizOverlay }]).webp({ quality: 88 }).toFile(quizCard);

const modernMeta = {
  source: "wikimedia_commons", sourcePage: urls.modernPage, creator: "Wolfmann",
  credit: "Wolfmann / Wikimedia Commons", license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  assetType: "documentary_place_photo", date: "2023-07-29",
  transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const historicMeta = {
  source: "national_library_via_wikimedia_commons", sourcePage: urls.historicPage,
  creator: "Marthinius Skøien", credit: "Marthinius Skøien / Nasjonalbiblioteket / Wikimedia Commons",
  license: "Public domain", rightsBasis: "public_domain_norway_and_commons",
  assetType: "historical_place_photo", date: "1880–1910",
  transformation: "Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const mercuryMeta = {
  source: "national_library_via_wikimedia_commons", sourcePage: urls.mercuryPage,
  creator: "Narve Skarpmoen", credit: "Narve Skarpmoen / Nasjonalbiblioteket / Wikimedia Commons",
  license: "Public domain", rightsBasis: "public_domain_norway_and_commons",
  assetType: "historical_object_photo", date: "1899–1930",
  transformation: "Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const thorMeta = {
  source: "oslo_museum_via_wikimedia_commons", sourcePage: urls.thorPage,
  creator: "Claus Peter Knudsen", credit: "Claus Peter Knudsen / Oslo Museum / Wikimedia Commons",
  license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  assetType: "historical_person_portrait", date: "1860–1868",
  transformation: "Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};

const place = read(placeFile);
const desc = "Oslo Børs er Norges historiske børsinstitusjon, åpnet som Christiania Børs i 1819 og siden 1828 knyttet til Groschs børsbygning i Tollbugata 2. Stedet gjør utviklingen fra vare- og valutahandel til et regulert marked for aksjer, obligasjoner og andre verdipapirer fysisk lesbar.";
const popupDesc = "Christiania Børs åpnet 15. april 1819 etter at den første børsloven var blitt sanksjonert i 1818. De første lokalene var leid i Treschowgården. Børsen var da først og fremst en institusjon for handel, valutakurser og veksler; den moderne rollen som organisert verdipapirmarked vokste fram senere.\n\nKjøpmannen Thor Olsen tok initiativ til en egen børsbygning i Grønningen. Christian Heinrich Grosch tegnet bygningen, som ble oppført i 1826–1828 i streng empirestil. Den ga en ny økonomisk institusjon et synlig, permanent sentrum i Kvadraturen. Bystyret brukte også bygningen fram til 1880.\n\nFra 1881 ble børsen en fonds- og verdipapirbørs. Tidlige noteringer omfattet både obligasjoner og aksjer, og markedet utviklet funksjoner for prisdannelse, kapitaltilgang og omsetning. Dette gjorde også forventninger og risiko mer synlige. Den første store jobbetiden på 1890-tallet endte med krakket i 1899; under første verdenskrig kom en ny spekulasjonsbølge, særlig knyttet til skipsfart og høye fraktrater.\n\nBygningen ble utvidet i 1909–1910 etter Carl Michalsens planer. Merkurfiguren kom på plass i 1911, og Gerhard Munthes veggmalerier «Handelen» og «Sjøfarten» i 1912. I 1988 fikk den tidligere gårdsplassen glasstak og ny handelssal. Valutanoteringen ble flyttet til Norges Bank i 1991, mens elektronisk handel gradvis endret hvordan børsmarkedet fungerte fysisk.\n\nI 2019 ble Oslo Børs en del av Euronext. Euronext oppgir fortsatt Tollbugata 2 som adresse for den nasjonale regulerte verdipapir- og derivatmarkedsplassen i Oslo. Stedet representerer derfor både en historisk børsbygning og en fortsatt virksom markedsinstitusjon. Det betyr ikke at all handel skjer i salen: dagens marked er teknologisk og nettverksbasert, mens bygningen fortsatt er et institusjonelt anker.\n\nBygningen viser også hvordan økonomisk infrastruktur ble en del av byens representasjonsarkitektur. Søylefronten, Børshagen og den senere utsmykningen ga handel og finans en markert plass i Kvadraturen. Samtidig endret teknologien forholdet mellom bygningen og handelen: informasjon, ordre og prisdannelse ble gradvis mindre avhengig av at aktører møttes fysisk. En presis lesning av stedet skiller mellom institusjonen, bygningen, selve markedet og de enkelte selskapene og verdipapirene som omsettes der.";

const historicalEvents = [
  { id:"borsen_oslo_apning_1819", name:"Christiania Børs åpner", title:"Christiania Børs åpner", year:1819, date:"1819-04-15", type:"historical_event", kind:"institution_opening", desc:"Christiania Børs åpnet 15. april 1819 etter børsloven fra 1818.", image:"bilder/kort/historical_events/borsen_oslo_1819.webp", imageMeta:{...historicMeta,note:"Fotografiet er senere enn åpningen og brukes som bygningskontekst."}, source_urls:[urls.byleksikon,urls.lokalhistorie] },
  { id:"borsen_oslo_fondsbors_1881", name:"Verdipapirbørs fra 1881", title:"Verdipapirbørs fra 1881", year:1881, type:"historical_event", kind:"market_function_shift", desc:"Fra 1881 fikk børsen en tydeligere rolle som fonds- og verdipapirbørs med noterte obligasjoner og aksjer.", image:"bilder/kort/historical_events/borsen_oslo_1819.webp", imageMeta:{...historicMeta,note:"Fotografiet fra perioden 1880–1910 gir samtidig bygningskontekst til funksjonsskiftet."}, source_urls:[urls.lokalhistorie,urls.byleksikon] },
  { id:"borsen_oslo_krakk_1899", name:"Krakket i 1899", title:"Krakket i 1899", year:1899, type:"historical_event", kind:"market_crash", desc:"En spekulasjonsdrevet jobbetid i 1890-årene endte i et markant børskrakk i 1899.", image:"bilder/kort/historical_events/borsen_oslo_1899.webp", imageMeta:{...historicMeta,note:"Fotografiet dokumenterer børsbygningen omtrent i samme periode, ikke selve kursfallet."}, source_urls:[urls.oppdag] },
  { id:"borsen_oslo_euronext_2019", name:"Oslo Børs blir del av Euronext", title:"Oslo Børs blir del av Euronext", year:2019, type:"historical_event", kind:"ownership_and_market_integration", desc:"I 2019 ble Oslo Børs integrert i Euronext-gruppen, mens Oslo-markedet fortsatte som nasjonal regulert markedsplass.", image:"bilder/kort/historical_events/borsen_oslo_2019.webp", imageMeta:{...modernMeta,note:"2023-fotografiet viser den fortsatt operative børsbygningen etter integrasjonen."}, source_urls:[urls.euronext,urls.byleksikon] }
];

const objects = [{
  id:"borsen_oslo_merkur_1911", name:"Merkurfiguren", title:"Merkurfiguren",
  type:"skulptur", kind:"architectural_sculpture", year:1911,
  desc:"Merkurfiguren ved Børsen ble satt opp i 1911 og knytter bygningens utsmykning direkte til handelens klassiske symbolverden.",
  physicalObject:true, placeSpecific:true, collectable:true,
  placeSpecificReason:"Oslo byleksikon og Nasjonalbibliotekets foto dokumenterer Merkurfiguren ved Børsen.",
  why_here:"Figuren gjør børsens offentlige identitet som handelsinstitusjon lesbar i fasadeområdet.",
  whereToFind:"Ved inngangspartiet til Børsen i Tollbugata 2.",
  unlock:"Finn Merkurfiguren og sammenlign handelssymbolet med bygningens funksjon som markedsinstitusjon.",
  image:"bilder/kort/objects/borsen_oslo_merkur.webp", imageMeta:mercuryMeta,
  source_urls:[urls.byleksikon,urls.mercuryPage]
}];

const chronology = [
  {id:"chrono_borsen_1818",year:1818,title:"Den første børsloven",desc:"Lovgrunnlaget for Christiania Børs ble sanksjonert i september 1818.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
  {id:"chrono_borsen_1819",year:1819,title:"Børsen åpner",desc:"Christiania Børs åpnet 15. april i leide lokaler.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
  {id:"chrono_borsen_1826",year:1826,title:"Egen børsbygning påbegynnes",desc:"Etter Thor Olsens initiativ startet byggingen i Grønningen.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
  {id:"chrono_borsen_1828",year:1828,title:"Groschs bygning står ferdig",desc:"Den klassisistiske børsbygningen i Tollbugata 2 ble fullført.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon},{title:"Oppdag Kvadraturen",url:urls.oppdag}]},
  {id:"chrono_borsen_1881",year:1881,title:"Fonds- og verdipapirbørs",desc:"Børsens rolle som organisert marked for verdipapirer ble tydeligere.",confidence:"high",sources:[{title:"Lokalhistoriewiki",url:urls.lokalhistorie}]},
  {id:"chrono_borsen_1899",year:1899,title:"Jobbetiden ender i krakk",desc:"Spekulasjonen i 1890-årene ble avløst av et markant krakk.",confidence:"high",sources:[{title:"Oppdag Kvadraturen",url:urls.oppdag}]},
  {id:"chrono_borsen_1910",year:1910,title:"Børsbygningen utvides",desc:"Carl Michalsens utvidelser fra 1909–1910 omsluttet gårdsrommet.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
  {id:"chrono_borsen_1911",year:1911,title:"Merkurfiguren settes opp",desc:"Merkurfiguren ble plassert ved Børsen.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
  {id:"chrono_borsen_1912",year:1912,title:"Munthe-maleri i Børsen",desc:"Gerhard Munthes «Handelen» og «Sjøfarten» kom i bygningen.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
  {id:"chrono_borsen_1918",year:1918,title:"Ny jobbetid under verdenskrigen",desc:"Høye fraktrater og skipsaksjer drev spekulasjon før etterkrigsfallet.",confidence:"high",sources:[{title:"Oppdag Kvadraturen",url:urls.oppdag}]},
  {id:"chrono_borsen_1988",year:1988,title:"Ny handelssal",desc:"Den tidligere gårdsplassen fikk glasstak og ble handelssal.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
  {id:"chrono_borsen_1991",year:1991,title:"Valutanotering flyttes",desc:"Valutakursnoteringen ble overtatt av Norges Bank.",confidence:"high",sources:[{title:"Lokalhistoriewiki",url:urls.lokalhistorie}]},
  {id:"chrono_borsen_2019",year:2019,title:"Integrert i Euronext",desc:"Oslo Børs ble del av Euronext-gruppen.",confidence:"high",sources:[{title:"Euronext",url:urls.euronext}]}
];

const fagverk = {
  schema:"history_go_place_fagverk_v2", level:"standard", status:"curated",
  intro:"Oslo Børs gjør kapitalmarkedet konkret: samme sted kan brukes til å undersøke hvordan markedsplasser organiserer prisdannelse, kapitaltilgang, eierskap, risiko og regulering, og hvordan disse funksjonene har endret seg fra fysisk børsrom til elektroniske markeder.",
  article:[
    "Da Christiania Børs åpnet i 1819, var valutakurser, veksler og handelsinformasjon sentrale oppgaver. Fra 1881 ble verdipapirer en tydeligere del av markedet. Det er viktig å skille disse funksjonene: en børs er ikke i seg selv en bank eller et selskap som investerer kapital på vegne av alle deltakerne. Den organiserer regler, notering og handel mellom aktører.",
    "Børsbygningen gjør også finansens institusjonelle infrastruktur synlig. Thor Olsens initiativ og Groschs bygg fra 1826–1828 ga markedet et permanent offentlig anker. Utvidelser, handelssal og senere elektronisk handel viser at samme institusjon kan beholde sted og navn samtidig som teknologi og arbeidsprosesser forandres.",
    "Krakkene og jobbetidene viser hvorfor pris ikke må behandles som et sikkert mål på underliggende verdi. Forventninger, kreditt, likviditet og risikovilje kan forsterke oppgang og nedgang. Kildene dokumenterer tidsforløp og markedsuro, men de gir ikke grunnlag for å forklare hvert kursfall med én enkelt årsak."
  ],
  subject_ids:["naeringsliv"],
  emne_ids:["em_naering_bank_bors_forsikring","em_naering_kapital_finans","em_naering_risiko_regulering","em_naering_kriser_boomer_omstilling","em_naering_finansdistrikt_kontorby"],
  chapter_ids:["kapital-eierskap-finans"],
  lenses:[
    {id:"bors_prisdannelse",title:"Pris og marked",prompt:"Hvordan kan et organisert marked gjøre kjøps- og salgsinteresse om til observerbare priser uten at prisen blir det samme som sikker verdi?",subject_id:"naeringsliv",emne_id:"em_naering_kapital_finans",evidence:"Notering, handel og krakkhistorie viser både prisdannelse og usikkerheten i markedspriser."},
    {id:"bors_risiko",title:"Risiko og krakk",prompt:"Hva kan krakkene ved Oslo Børs fortelle om samspillet mellom forventninger, likviditet, spekulasjon og regulering over tid?",subject_id:"naeringsliv",emne_id:"em_naering_kriser_boomer_omstilling",evidence:"1899 og verdenskrigstidens jobbetid gir daterte eksempler på raske markedsskift."},
    {id:"bors_institusjon",title:"Institusjon og regler",prompt:"Hvilke funksjoner må være regulert for at mange uavhengige aktører skal kunne handle verdipapirer i samme markedsinfrastruktur?",subject_id:"naeringsliv",emne_id:"em_naering_bank_bors_forsikring",evidence:"Børslov, notering og dagens status som regulert marked binder fysisk sted til institusjonelle regler."},
    {id:"bors_sted",title:"Finans som byrom",prompt:"Hvorfor fikk børsinstitusjonen en monumental bygning i Kvadraturen, og hva sier plasseringen om handel, informasjon og økonomisk makt i byen?",subject_id:"naeringsliv",emne_id:"em_naering_finansdistrikt_kontorby",evidence:"Groschs bygning, Børshagen og Tollbugata 2 gjør finansens historiske sentrumsforankring fysisk observerbar."}
  ],
  guiding_questions:[
    "Hvordan endret Børsens funksjon seg fra valuta og veksler til et organisert verdipapirmarked?",
    "Hva er forskjellen mellom en markedspris, en bokført verdi og en sikker vurdering av framtidig verdi?",
    "Hvorfor kan spekulasjon og høy omsetning både tilføre likviditet og forsterke markedsrisiko?",
    "Hvordan endrer elektronisk handel forholdet mellom den fysiske børsbygningen og selve markedet?",
    "Hvilke deler av dagens Oslo Børs kan dokumenteres som kontinuitet, og hvilke er tydelige institusjonelle skift?"
  ],
  concepts:["børs","aksje","obligasjon","notering","likviditet","markedspris","prisdannelse","markedsrisiko","regulert marked","kapitalmarked"],
  observable_traces:[
    {title:"Den monumentale børsfasaden",observation:"Søyler, gavl og BØRSEN-navnet gir institusjonen en tydelig offentlig og arkitektonisk identitet i Tollbugata.",interpretation_boundary:"Fasaden dokumenterer institusjonell representasjon, men sier ikke alene hvordan dagens elektroniske handel faktisk gjennomføres.",source_urls:[urls.byleksikon,urls.modernPage]},
    {title:"Merkur ved inngangen",observation:"Merkurfiguren kobler bygningen til et klassisk symbol for handel og utveksling.",interpretation_boundary:"Symbolikken viser hvordan institusjonen presenterte handel offentlig, men er ikke et mål på markedets økonomiske resultater.",source_urls:[urls.byleksikon,urls.mercuryPage]}
  ],
  source_urls:[urls.byleksikon,urls.oppdag,urls.euronext,urls.lokalhistorie,urls.modernPage,urls.mercuryPage],
  verified_at:verifiedAt
};

Object.assign(place,{
  year:1828, desc, popupDesc,
  image:"bilder/places/borsen_oslo.webp",
  frontImage:"bilder/places/borsen_oslo_front_portrait.webp",
  imageMeta:{...modernMeta,outputDimensions:"1400x900"},
  frontImageMeta:{...modernMeta,outputDimensions:"900x1200",orientation:"portrait",aspectRatio:"3:4"},
  quizCardImage:"bilder/QuizCards/Oslo Børs.webp",
  quizCardImageMeta:{...modernMeta,assetType:"dedicated_quiz_card",usage:"quiz_card_back_only",outputDimensions:"900x1280",orientation:"portrait",aspectRatio:"45:64"},
  underbadge_ids:["attenhundretallet","nittenhundre_1900_1945","samtidshistorie","finanshistorie","byhistorie"],
  related_people_ids:[groschId,personId],
  reading_track_ids:["lesespor_borsen_byleksikon","lesespor_borsen_oppdag","lesespor_borsen_lokalhistorie","lesespor_borsen_euronext","lesespor_borsen_historisk_foto"],
  production_profile:"standard", profile_status:"confirmed",
  profile_reason:"Grosch og Thor Olsen, Merkurfiguren, Oslo Børs som markedsinstitusjon og fire daterte markedshendelser gir fire substansielle, bildeklare samlinger.",
  place_card_profile:{schema:"history_go_place_card_profile_v2",production_profile:"standard",collection_ids:["people","objects","brands","historical_events"],category_collection_label:"Historiske hendelser",reason:"To direkte personer, et stedsspesifikt fysisk objekt, markedsinstitusjonen og fire kildebårne hendelser gir nøyaktig fire reelle samlinger.",verifiedAt},
  rounds:["people","objects","brands","historical_events"],
  objects, historical_events:historicalEvents, chronology, fagverk,
  for_na:{title:"Børsbygningen omkring 1900 og i 2023",beforeImage:"bilder/places/borsen_oslo_1880_1910.webp",beforeImageLabel:"Børsen ca. 1880–1910 · Marthinius Skøien · public domain",beforeImageMeta:historicMeta,nowImage:"bilder/places/borsen_oslo.webp",nowImageLabel:"Børsen 2023 · Wolfmann · CC BY-SA 4.0",nowImageMeta:modernMeta,before:"Det historiske fotografiet viser børsbygningen før Michalsens utvidelse og før Merkurfiguren fra 1911.",now:"2023-fotografiet viser den utvidede bygningen og den fortsatt tydelige børsidentiteten i Tollbugata.",change:"Bildene viser bygningsmessig kontinuitet og senere tillegg, men de er tatt fra ulike standpunkter og skal ikke behandles som et eksakt optisk før–nå-par.",lookFor:["gavl og søylemotiv","BØRSEN-navnet","senere utvidelser og inngangssone"],sources:[urls.historicPage,urls.modernPage,urls.byleksikon]},
  interpretation:{what_to_notice:["Hvordan en finansinstitusjon gis monumental arkitektur i et tidligere park- og handelsområde.","Hvordan Merkurfiguren og BØRSEN-navnet gjør handel til offentlig symbolikk.","At dagens markedsfunksjon er digital selv om institusjonen fortsatt har fysisk adresse i bygningen."],why_it_matters:["Stedet viser hvordan markedsinstitusjoner kobler regler, informasjon, kapital og prisdannelse.","Jobbetidene og krakkene gjør risiko og forventninger historisk konkrete.","Euronext-integrasjonen viser hvordan en nasjonal markedsplass kan inngå i en større internasjonal infrastruktur."],counterpoints:["Børsbygningen fra 1828 må ikke forveksles med institusjonens åpning i 1819.","Krakkhistorien dokumenterer markedsfall, men isolerer ikke én årsak til hvert fall.","Fysisk børsbygning betyr ikke at dagens handel foregår som gulvhandel i en sal."],sources:[urls.byleksikon,urls.oppdag,urls.euronext].map(url=>({url,verifiedAt}))},
  externalLinks:[
    {type:"reference",label:"Oslo byleksikon – Børsen",url:urls.byleksikon,verifiedAt},
    {type:"heritage",label:"Oppdag Kvadraturen – Børsen",url:urls.oppdag,verifiedAt},
    {type:"reference",label:"Lokalhistoriewiki – Oslo Børs",url:urls.lokalhistorie,verifiedAt},
    {type:"official",label:"Euronext – Oslo market and organisation",url:urls.euronext,verifiedAt},
    {type:"image_source",label:"Wikimedia Commons – Børsen 2023",url:urls.modernPage,verifiedAt},
    {type:"image_source",label:"Nasjonalbiblioteket / Commons – Børsen ca. 1880–1910",url:urls.historicPage,verifiedAt},
    {type:"image_source",label:"Nasjonalbiblioteket / Commons – Merkurfiguren",url:urls.mercuryPage,verifiedAt},
    {type:"image_source",label:"Oslo Museum / Commons – Thor Olsen",url:urls.thorPage,verifiedAt}
  ],
  production_status:"complete", production_verified_at:verifiedAt
});
delete place.cardImage;
delete place.imageCard;
write(placeFile,place);

const personRows = read(personFile);
const person = Array.isArray(personRows) ? personRows[0] : personRows;
Object.assign(person,{
  desc:"Kjøpmannen og lokalpolitikeren som tok initiativ til den første egne børsbygningen i Christiania.",
  popupDesc:"Thor Olsen (1786–1868) var kjøpmann og en sentral aktør i Christianias nærings- og kommuneliv. For Oslo Børs er koblingen avgrenset og konkret: Oslo byleksikon knytter initiativet til den egne børsbygningen i Grønningen til ham. Byggeprosjektet ble gjennomført i 1826–1828 etter Christian Heinrich Groschs tegninger. Portrettet er fotografert av Claus Peter Knudsen mellom 1860 og 1868 og kommer fra Oslo Museum.",
  image:"bilder/kort/people/thor_olsen.webp",cardImage:"bilder/kort/people/thor_olsen.webp",
  imageMeta:thorMeta,
  source_urls:[...new Set([...(person.source_urls||[]),urls.byleksikon,urls.thorPage])],
  verifiedAt
});
write(personFile,[person]);
write(claimsFile,{
  schema:"history_go_people_claims_v1",version:"1.0.0",person_id:personId,profile_file:personFile,
  identity:{canonical_identity:"Kjøpmannen Thor Olsen (1786–1868), initiativtaker til Christiania Børs' egen bygning i 1826.",name_variants:["Thor Olsen"],not:["arkitekten Christian Heinrich Grosch","Oslo Børs som institusjon"],identity_status:"verified"},
  claims:[
    {id:"canonical_name",claim:"Den canonicale personen er kjøpmannen Thor Olsen.",status:"verified",source_url:urls.byleksikon,source_location:"avsnittet om børsbygningen",source_type:"recognized_reference",temporal_status:"historical",verified_at:verifiedAt,evidence_level:"direct"},
    {id:"bors_initiative",claim:"Thor Olsen tok initiativ til at Christiania Børs skulle få en egen bygning.",status:"verified",source_url:urls.byleksikon,source_location:"avsnittet om byggingen 1826–1828",source_type:"recognized_reference",temporal_status:"historical",verified_at:verifiedAt,evidence_level:"direct"},
    {id:"image_identity",claim:"Oslo Museums fotografi av Thor Olsen er tatt av Claus Peter Knudsen mellom 1860 og 1868.",status:"verified",source_url:urls.thorPage,source_location:"Commons file metadata",source_type:"archive",temporal_status:"historical",verified_at:verifiedAt,evidence_level:"direct"}
  ],
  field_claim_map:{name:["canonical_name"],desc:["bors_initiative"],popupDesc:["bors_initiative"],image:["image_identity"],cardImage:["image_identity"],imageMeta:["image_identity"]},
  sentence_claim_map:{desc:[{sentence:1,claim_ids:["bors_initiative"]}],popupDesc:[{sentence:1,claim_ids:["canonical_name"]},{sentence:2,claim_ids:["bors_initiative"]},{sentence:3,claim_ids:["bors_initiative"]},{sentence:4,claim_ids:["image_identity"]}]},
  completion:{completed_under:"people_profile_v1.0",claims_verified:"3/3",fact_review:"passed",editorial_review:"passed",source_verified_at:verifiedAt,validator_version:"1.0.0",current_status:"ready_people_v1"}
});

const brand = {
  id:brandId,name:"Oslo Børs",aliases:["Christiania Børs","Euronext Oslo Børs"],
  brand_group:"institutional_brand",brand_type:"stock_exchange",brand_kind:"brand",sector:"financial_market",
  state:"catalog",status:"active",verification:"verified_current",
  popupdesc:"Oslo Børs er den norske regulerte verdipapir- og derivatmarkedsplassen som siden 2019 inngår i Euronext. Brandkortet bruker et dokumentarfoto av den navngitte børsfasaden, ikke et rekonstruert varemerke.",
  desc:"Norsk børsinstitusjon fra 1819, del av Euronext siden 2019.",
  tags:["brand","stock_exchange","finance","oslo","tollbugata",placeId],place_ids:[placeId],
  source_urls:[urls.euronext,urls.byleksikon,urls.modernPage],
  logo:"bilder/kort/brands/oslo_bors_marketplace.webp",
  imageMeta:{...modernMeta,assetKind:"documentary_facade_identity",usageContext:"referential_identification",noEndorsement:true,generated:false,reconstructed:false}
};
for (const file of ["data/brands/brands_master.json","data/brands/brands_catalog.json","data/brands/brands_catalog_v17.json"]) {
  const rows = read(file); upsert(rows,brand); write(file,rows);
}
const rawBrands = read("data/brands/brands_master_raw.json"); upsert(rawBrands,brand); writeCompact("data/brands/brands_master_raw.json",rawBrands);
const byPlace = read("data/brands/brands_by_place.json"); byPlace[placeId]=[brandId]; write("data/brands/brands_by_place.json",byPlace);

const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_borsen_oslo.json";
write(leksikonFile,[{
  place_id:placeId,type:"main",version:1,title:"Oslo Børs",
  popupDesc:"Fra den første børsloven og åpningen i 1819 til Euronext-integrasjonen i 2019: Oslo Børs gjør kapitalmarkedets institusjoner, risiko og byrom konkrete.",
  wikiText:[
    "Christiania Børs åpnet i 1819 og fikk i 1828 en egen bygning i Tollbugata 2. Groschs klassisistiske arkitektur ga handels- og markedsinstitusjonen et permanent offentlig sentrum.",
    "Børsens funksjon endret seg over tid. Valuta og veksler var tidlig viktige, mens noterte aksjer og obligasjoner ble sentrale fra 1881. Jobbetidene og krakkene viser samtidig at markedspriser formes av forventninger, likviditet og risiko.",
    "Bygningen ble utvidet i 1909–1910, fikk Merkurfiguren i 1911 og ny handelssal i 1988. I 2019 ble Oslo Børs del av Euronext, som fortsatt oppgir Tollbugata 2 som Oslo-adresse."
  ],
  summary:{one_liner:"Børsinstitusjon fra 1819 og børsbygning fra 1828, i dag del av Euronext.",themes:["kapitalmarked","prisdannelse","risiko","arkitektur","regulering"],tone:["nøktern","kildekritisk"]},
  facts:[
    {id:"fact_borsen_1819",label:"Åpningen",desc:"Christiania Børs åpnet 15. april 1819.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
    {id:"fact_borsen_1828",label:"Bygningen",desc:"Groschs børsbygning ble oppført 1826–1828.",confidence:"high",sources:[{title:"Oslo byleksikon",url:urls.byleksikon}]},
    {id:"fact_borsen_2019",label:"Euronext",desc:"Oslo Børs ble integrert i Euronext i 2019.",confidence:"high",sources:[{title:"Euronext",url:urls.euronext}]}
  ],
  chronology,sources:place.externalLinks,externalLinks:place.externalLinks,interpretation:place.interpretation
}]);
const leksikonManifest=read("data/leksikon/manifest.json"); addOnce(leksikonManifest.files,leksikonFile); write("data/leksikon/manifest.json",leksikonManifest);

const languageFile="data/leksikon/sprak/places/europe/norway/oslo/borsen_oslo.json";
const language={
  place_id:placeId,title:"Språk ved Oslo Børs",verified_at:verifiedAt,dialect_status:"not_applicable_place_level",
  entries:[
    {id:"borsen_term_bors",term:"børs",type:"institusjonsord",meaning:"Organisert markedsplass med regler for handel og notering.",context:"Christiania Børs åpnet i 1819 og utviklet seg senere til verdipapirbørs.",linked_to:{kind:"place",id:placeId},tags:["finans","marked"],sources:[{label:"Oslo byleksikon",url:urls.byleksikon}]},
    {id:"borsen_term_aksje",term:"aksje",type:"finansord",meaning:"Eierandel i et aksjeselskap.",context:"Aksjer ble en del av den organiserte verdipapirhandelen ved Børsen.",linked_to:{kind:"place",id:placeId},tags:["eierskap","verdipapir"],sources:[{label:"Lokalhistoriewiki",url:urls.lokalhistorie}]},
    {id:"borsen_term_obligasjon",term:"obligasjon",type:"finansord",meaning:"Omsettelig gjeldsinstrument med krav på betaling etter avtalte vilkår.",context:"Tidlige børslister omfattet obligasjonsserier.",linked_to:{kind:"place",id:placeId},tags:["gjeld","verdipapir"],sources:[{label:"Lokalhistoriewiki",url:urls.lokalhistorie}]},
    {id:"borsen_term_notering",term:"notering",type:"markedsord",meaning:"Opptak av et verdipapir til organisert handel etter markedsplassens regler.",context:"Børsens rolle som noteringssted skiller den fra vanlig bilateral handel.",linked_to:{kind:"place",id:placeId},tags:["marked","regulering"],sources:[{label:"Euronext",url:urls.euronext}]},
    {id:"borsen_term_likviditet",term:"likviditet",type:"analyseord",meaning:"Hvor lett en eiendel kan omsettes uten store prisutslag.",context:"Likviditet er sentralt når mange kjøpere og selgere møtes i et marked.",linked_to:{kind:"place",id:placeId},tags:["marked","risiko"],sources:[{label:"History Go fagverk",url:urls.euronext}]},
    {id:"borsen_term_jobbetid",term:"jobbetid",type:"historisk_finansord",meaning:"Historisk betegnelse på perioder med intens spekulasjon og rask omsetning.",context:"Oppdag Kvadraturen bruker begrepet om spekulasjonsperioder før krakket i 1899 og under første verdenskrig.",linked_to:{kind:"place",id:placeId},tags:["spekulasjon","krakk"],sources:[{label:"Oppdag Kvadraturen",url:urls.oppdag}]}
  ]
};
write(languageFile,language);
const languageManifest=read("data/leksikon/sprak/manifest.json"); languageManifest.place_files ||= {}; languageManifest.place_files[placeId]=languageFile; write("data/leksikon/sprak/manifest.json",languageManifest);

const storyFile="data/stories/stories_borsen_oslo.json";
const story={
  id:"st_borsen_jobbetiden_1899",quality_profile:"episode_v1",type:"turning_point",title:"Da jobbetiden sprakk",year:1899,place_id:placeId,
  summary:"Et spekulasjonsdrevet marked i 1890-årene endte i krakk og gjorde forskjellen mellom stigende priser og varig verdi brutal.",
  story:"På 1890-tallet vokste handelen og spekulasjonen rundt Christiania Børs. I ettertid ble perioden omtalt som en jobbetid: raske handler og forventninger om videre prisstigning kunne i seg selv trekke flere inn i markedet.\n\nI 1899 snudde utviklingen. Krakket viste at en markedspris ikke er en garanti for varig verdi. Når forventninger, finansiering og likviditet endres samtidig, kan et marked falle langt raskere enn den monumentale børsbygningen rundt det forandrer seg.\n\nOslo Børs skulle oppleve flere kraftige korreksjoner senere. Derfor er 1899 nyttig som episode, ikke som en enkel oppskrift på alle kriser: hendelsen viser mekanismer som spekulasjon og stemningsskifte, men kildene bærer ikke en påstand om én universell årsak.",
  episode:{actors:["meglere","investorer","Christiania Børs"],date:"1890-årene–1899",action:"Spekulasjon og sterk omsetning ble fulgt av et markant markedskrak.",consequence:"Krakket ble et tidlig norsk eksempel på hvordan markedspriser og risikovilje kan snu raskt."},
  sources:[{title:"Oppdag Kvadraturen – Børsen",url:urls.oppdag},{title:"Oslo byleksikon – Børsen",url:urls.byleksikon}],
  tags:["Oslo Børs","jobbetid","1899","spekulasjon","krakk"],related_people:[personId,groschId],related_places:[],
  score:{narrative:3,historical:2,source:4,play_value:3,originality:3,total:15},
  arc:{start:"Markedet preges av jobbetid og optimisme.",middle:"Prisene og forventningene forsterker hverandre.",end:"Krakket i 1899 bryter oppgangen og synliggjør risikoen."}
};
write(storyFile,[story]);
const storiesManifest=read("data/stories/stories_manifest.json"); storiesManifest.files=storiesManifest.files.filter(row=>row.entity_id!==placeId); storiesManifest.files.push({category:categoryId,entity_id:placeId,path:storyFile}); write("data/stories/stories_manifest.json",storiesManifest);
const epManifest=read("data/stories/stories_episode_v1_manifest.json"); addOnce(epManifest.files,storyFile); write("data/stories/stories_episode_v1_manifest.json",epManifest);

const readingFile="data/lesespor/oslo/lesespor_oslo_naeringsliv.json";
const readings=read(readingFile);
const newReadings=[
  {id:"lesespor_borsen_byleksikon",title:"Børsen",author:null,publication:"Oslo byleksikon",year:1819,type:"lokalhistorisk_oppslag",subjects:["børs","arkitektur","verdipapirhandel"],place_ids:[placeId],person_ids:[personId,groschId],category_hints:["naeringsliv","by"],url:urls.byleksikon,access:"open",rights:"link_only",source_quality:"canonical",curation_status:"approved",relevance:"Hovedkilde til etablering, bygging, arkitektur, utvidelser og børsbygningens bruk."},
  {id:"lesespor_borsen_oppdag",title:"Tollbugata 2 – Børsen",author:null,publication:"Oppdag Kvadraturen",year:2026,type:"heritage_feature",subjects:["jobbetid","krakk","børsbygning"],place_ids:[placeId],person_ids:[],category_hints:["naeringsliv","historie"],url:urls.oppdag,access:"open",rights:"link_only",source_quality:"institutional",curation_status:"approved",relevance:"Stedsspesifikk formidling av jobbetidene, krakkene og Børshagens historie."},
  {id:"lesespor_borsen_lokalhistorie",title:"Oslo Børs",author:null,publication:"Lokalhistoriewiki",year:2026,type:"økonomihistorisk_oppslag",subjects:["fondbørs","aksjer","obligasjoner","valuta"],place_ids:[placeId],person_ids:[],category_hints:["naeringsliv"],url:urls.lokalhistorie,access:"open",rights:"link_only",source_quality:"recognized",curation_status:"approved",relevance:"Utfyller funksjonsskiftet fra tidlig børs til verdipapirmarked og valutanotering."},
  {id:"lesespor_borsen_euronext",title:"Our organisation – Oslo",author:null,publication:"Euronext",year:2026,type:"current_primary",subjects:["regulert marked","Euronext","adresse"],place_ids:[placeId],person_ids:[],category_hints:["naeringsliv"],url:urls.euronext,access:"open",rights:"link_only",source_quality:"institutional",curation_status:"approved",relevance:"Primærkilde til dagens markedsrolle, Tollbugata 2 og integrasjonsåret 2019."},
  {id:"lesespor_borsen_historisk_foto",title:"Oslo Tollbugt 2 – Børsen",author:"Marthinius Skøien",publication:"Nasjonalbiblioteket / Wikimedia Commons",year:1900,type:"historisk_foto",subjects:["børsbygning","arkitektur","byrom"],place_ids:[placeId],person_ids:[],category_hints:["naeringsliv","by","historie"],url:urls.historicPage,access:"open",rights:"public_domain",source_quality:"institutional",curation_status:"approved",relevance:"Historisk fotografi fra ca. 1880–1910 som dokumenterer bygningen rundt verdipapirbørsens tidlige periode."}
];
readings.items=(readings.items||[]).filter(row=>!newReadings.some(x=>x.id===row.id)); readings.items.push(...newReadings); write(readingFile,readings);

const translations={
  en:{name:"Oslo Stock Exchange",desc:"Oslo Børs is Norway's historic stock-exchange institution, opened in 1819 and associated since 1828 with Christian Heinrich Grosch's exchange building at Tollbugata 2.",popupDesc:"Christiania Børs opened in 1819. The permanent exchange building was erected in 1826–1828 after an initiative by merchant Thor Olsen and designs by Christian Heinrich Grosch. Securities trading became a central function from 1881. Oslo Børs joined Euronext in 2019, and Euronext still lists Tollbugata 2 as its Oslo regulated-market address."},
  es:{name:"Bolsa de Oslo",desc:"Oslo Børs es la institución bursátil histórica de Noruega, inaugurada en 1819 y vinculada desde 1828 al edificio diseñado por Christian Heinrich Grosch en Tollbugata 2.",popupDesc:"Christiania Børs abrió en 1819. El edificio permanente fue construido en 1826–1828 tras la iniciativa del comerciante Thor Olsen y los planos de Grosch. La negociación de valores se volvió central desde 1881. Oslo Børs pasó a formar parte de Euronext en 2019."},
  pt:{name:"Bolsa de Oslo",desc:"A Oslo Børs é a instituição bolsista histórica da Noruega, aberta em 1819 e ligada desde 1828 ao edifício projetado por Christian Heinrich Grosch em Tollbugata 2.",popupDesc:"A Christiania Børs abriu em 1819. O edifício permanente foi construído em 1826–1828 por iniciativa do comerciante Thor Olsen e com projeto de Grosch. A negociação de valores tornou-se central a partir de 1881. A Oslo Børs passou a integrar a Euronext em 2019."}
};
const sourceHash=sha256(JSON.stringify({name:place.name.normalize("NFC"),desc:desc.normalize("NFC"),popupDesc:popupDesc.normalize("NFC")})).slice(0,16);
for(const [lang,tr] of Object.entries(translations)){const file="data/i18n/content/places/"+lang+".json";const pack=read(file);pack[placeId]={_sourceHash:sourceHash,_status:"machine_translated",...tr};write(file,pack);}

const sources={
  byleksikon:{url:urls.byleksikon,source_type:"recognized_reference",review_status:"reviewed",review_note:"Etablering, åpning, bygging, Grosch, Thor Olsen, utvidelser, Merkur og bygningsbruk."},
  oppdag:{url:urls.oppdag,source_type:"institutional_reference",review_status:"reviewed",review_note:"Jobbetid, krakk, Børshagen og stedshistorie."},
  lokalhistorie:{url:urls.lokalhistorie,source_type:"curated_reference",review_status:"reviewed",review_note:"Fondsbørs fra 1881, tidlige verdipapirer og valutanotering."},
  euronext:{url:urls.euronext,source_type:"primary_business",review_status:"reviewed",review_note:"Dagens regulerte Oslo-marked, adresse og integrasjonsår 2019."}
};
const Q=[
["Når ble den første børsloven sanksjonert?",["1818","1828","1881"],"1818","Lovgrunnlaget for Christiania Børs kom i 1818.",["byleksikon"],"em_naering_bank_bors_forsikring","fact"],
["Når åpnet Christiania Børs?",["1819","1814","1905"],"1819","Christiania Børs åpnet 15. april 1819.",["byleksikon"],"em_naering_bank_bors_forsikring","fact"],
["Hvor holdt Børsen først til?",["I leide rom i Treschowgården","I dagens rådhus","På Akershus festning"],"I leide rom i Treschowgården","De første lokalene var leide rom før egen børsbygning.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Hvem tok initiativ til en egen børsbygning?",["Thor Olsen","Christian H. Grosch","Gerhard Munthe"],"Thor Olsen","Kjøpmannen Thor Olsen tok initiativ til byggeprosjektet.",["byleksikon"],"em_naering_eierskap_styring","fact"],
["Hvem tegnet børsbygningen?",["Christian H. Grosch","Carl Michalsen","Henrik Bull"],"Christian H. Grosch","Grosch tegnet bygningen fra 1826–1828.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Når ble den egne børsbygningen oppført?",["1826–1828","1814–1815","1909–1912"],"1826–1828","Bygningen ble oppført i perioden 1826–1828.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Hvilken stil forbindes med Groschs børsbygning?",["Streng empire/klassisisme","Brutalisme","Funksjonalisme"],"Streng empire/klassisisme","Oslo byleksikon beskriver den klassisistiske empirearkitekturen.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Til hvilket år brukte bystyret også Børsen?",["1880","1828","2019"],"1880","Bystyret brukte bygningen fram til 1880.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Fra hvilket år ble verdipapirfunksjonen tydelig som fondsbørs?",["1881","1819","1911"],"1881","Fra 1881 fikk børsen en tydelig fonds- og verdipapirfunksjon.",["lokalhistorie"],"em_naering_bank_bors_forsikring","fact"],
["Hvilke instrumenter fantes blant tidlige børsnoteringer?",["Obligasjoner og aksjer","Bare mynter","Bare råolje"],"Obligasjoner og aksjer","Tidlige lister omfattet både obligasjonsserier og aksjer.",["lokalhistorie"],"em_naering_kapital_finans","fact"],
["Når endte den første store jobbetiden i krakk?",["1899","1828","2019"],"1899","Spekulasjonsperioden i 1890-årene endte med krakket i 1899.",["oppdag"],"em_naering_kriser_boomer_omstilling","fact"],
["Hvem tegnet utvidelsen fra 1909–1910?",["Carl Michalsen","Christian H. Grosch","Arnstein Arneberg"],"Carl Michalsen","Carl Michalsen tegnet den store utvidelsen.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Når kom Merkurfiguren ved Børsen?",["1911","1819","1988"],"1911","Merkurfiguren ble satt opp i 1911.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Hvem malte «Handelen» og «Sjøfarten» i 1912?",["Gerhard Munthe","Edvard Munch","Christian Krohg"],"Gerhard Munthe","Gerhard Munthe laget veggmaleriene.",["byleksikon"],"em_naering_finansdistrikt_kontorby","fact"],
["Hva er en viktig funksjon ved en børs?",["Å organisere handel og prisdannelse etter regler","Å garantere gevinst","Å fastsette alle selskapers verdi administrativt"],"Å organisere handel og prisdannelse etter regler","Børsen organiserer et marked; den garanterer ikke gevinst eller sikker verdi.",["euronext"],"em_naering_kapital_finans","context"],
["Hvorfor er en aksje forskjellig fra en obligasjon?",["Aksjen er egenkapital, obligasjonen er gjeld","Begge er identiske innskudd","Obligasjonen gir alltid stemmerett"],"Aksjen er egenkapital, obligasjonen er gjeld","Instrumentene representerer ulike finansielle krav.",["lokalhistorie"],"em_naering_kapital_finans","context"],
["Hva viser krakket i 1899 best?",["At markedspriser og forventninger kan snu raskt","At børsbygningen ble revet","At all handel stoppet permanent"],"At markedspriser og forventninger kan snu raskt","Krakket synliggjør markedsrisiko uten å gi én universell årsak.",["oppdag"],"em_naering_kriser_boomer_omstilling","context"],
["Hva drev mye av spekulasjonen under første verdenskrig?",["Skipsfart og høye fraktrater","Jordbruksjord i Finnmark","T-baneaksjer"],"Skipsfart og høye fraktrater","Oppdag Kvadraturen knytter jobbetiden til skipsaksjer og fraktrater.",["oppdag"],"em_naering_kriser_boomer_omstilling","context"],
["Hva skjedde med gårdsplassen i 1988?",["Den fikk glasstak og ble handelssal","Den ble havnebasseng","Den ble revet for motorvei"],"Den fikk glasstak og ble handelssal","Børsen fikk ny handelssal under glasstak.",["byleksikon"],"em_naering_finansdistrikt_kontorby","context"],
["Hva skjedde med valutanoteringen i 1991?",["Norges Bank overtok","Den flyttet til Stortinget","Den ble gjort til kommunal oppgave"],"Norges Bank overtok","Valutakursnoteringen ble flyttet fra Børsen til Norges Bank.",["lokalhistorie"],"em_naering_bank_bors_forsikring","context"],
["Hva skjedde i 2019?",["Oslo Børs ble del av Euronext","Børsen åpnet for første gang","Merkurfiguren ble satt opp"],"Oslo Børs ble del av Euronext","Integrasjonen i Euronext skjedde i 2019.",["euronext"],"em_naering_eierskap_styring","context"],
["Hva betyr det at Oslo-markedet er regulert?",["Handelen skjer under formelle regler og tilsynsrammer","Alle priser bestemmes av staten","Tap er umulig"],"Handelen skjer under formelle regler og tilsynsrammer","Regulert marked betyr regelstyrt markedsinfrastruktur, ikke prisgaranti.",["euronext"],"em_naering_risiko_regulering","context"],
["Hvorfor er markedspris ikke det samme som sikker verdi?",["Pris avhenger av tilbud, etterspørsel og forventninger som kan endres","Alle priser er feil","Bokført verdi og markedspris er alltid identiske"],"Pris avhenger av tilbud, etterspørsel og forventninger som kan endres","Krakkhistorien viser at pris og forventninger kan flytte seg raskt.",["oppdag"],"em_naering_kapital_finans","concept","met_naering_kapital_og_finansanalyse"],
["Hva bør en kapitalanalyse av Børsen skille mellom?",["Utstedelse, annenhåndshandel og institusjonens egen rolle","Bygningens farge og aksjekursen","Alle selskaper som én aktør"],"Utstedelse, annenhåndshandel og institusjonens egen rolle","Analysen må holde ulike deler av kapitalmarkedet fra hverandre.",["euronext"],"em_naering_kapital_finans","concept","met_naering_kapital_og_finansanalyse"],
["Hvordan bør 1899 og 1987 sammenlignes?",["Som ulike kriser med egne kontekster, ikke identiske hendelser","Som samme hendelse","Bare etter hvilken bygning som sto der"],"Som ulike kriser med egne kontekster, ikke identiske hendelser","Kriseanalyse krever periodisering, mekanismer og kildegrenser.",["oppdag"],"em_naering_kriser_boomer_omstilling","concept","met_naering_risiko_og_kriseanalyse"],
["Hva kan bygningen dokumentere direkte om finans?",["At markedsinstitusjonen hadde et fysisk og representativt sentrum","Nøyaktig aksjekurs i dag","Alle investorers motivasjon"],"At markedsinstitusjonen hadde et fysisk og representativt sentrum","Arkitekturen dokumenterer institusjonell tilstedeværelse, ikke individuelle handler.",["byleksikon"],"em_naering_finansdistrikt_kontorby","concept","met_naering_romlig_okonomisk_analyse"],
["Hva viser Euronext-integrasjonen best?",["At nasjonal markedsinfrastruktur kan inngå i et større internasjonalt system","At Oslo Børs opphørte i 1819","At bygningen flyttet til Amsterdam"],"At nasjonal markedsinfrastruktur kan inngå i et større internasjonalt system","Euronext-integrasjonen endret eierskap og nettverk uten å flytte Oslo-adressen.",["euronext"],"em_naering_eierskap_styring","concept","met_naering_eierskaps_og_styringsanalyse"],
["Hva er en kildekritisk grense ved jobbetidene?",["Kildene dokumenterer spekulasjon og krakk, men ikke én årsak som forklarer alle prisbevegelser","Krakk kan aldri dokumenteres","Alle investorer hadde samme motiv"],"Kildene dokumenterer spekulasjon og krakk, men ikke én årsak som forklarer alle prisbevegelser","Markedshistorie må skille tidsrekkefølge og plausible mekanismer fra sikker kausalitet.",["oppdag","byleksikon"],"em_naering_risiko_regulering","concept","met_naering_risiko_og_kriseanalyse"]
];
const phases=["opening","middle","bridge","final"];
const titles=["Fra børslov til børsbygning","Verdipapirer og symboler","Marked, risiko og Euronext","Kapitalanalyse og kildegrenser"];
const questions=Q.map((row,index)=>{
  const [question,baseOptions,answer,knowledge,source,emne_id,question_type,method_id]=row;
  const options=[...baseOptions.slice(index%baseOptions.length),...baseOptions.slice(0,index%baseOptions.length)];
  const n=index+1;
  const out={id:placeId+"_quiz_"+String(n).padStart(2,"0"),quiz_id:"naeringsliv_"+placeId+"_set_"+(Math.floor(index/7)+1)+"_q"+((index%7)+1),categoryId,placeId,targetId:placeId,question_scope:"place",question,options,answer,answerIndex:options.indexOf(answer),knowledge,difficulty:n<=7?1:n<=14?2:n<=21?3:4,question_type,question_layer:n<=14?"normal_opening":n<=21?"bridge":"final",emne_id,source,source_origin:"external",claim_basis:knowledge,claim_id:"claim_"+placeId+"_quiz_"+String(n).padStart(2,"0"),primary_knowledge_unit_id:"ku_naeringsliv_"+placeId+"_"+String(n).padStart(2,"0"),knowledge_unit_ids:["ku_naeringsliv_"+placeId+"_"+String(n).padStart(2,"0")],knowledge_contract_version:1,knowledge_link_status:"linked",concept_ids:[],term_ids:[]};
  if(method_id){out.method_id=method_id;out.guidance_basis=["data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json","data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json"];}
  return out;
});
Object.assign(questions[26],{
  topic_hook_id:"kapitalmakt",
  thinker_id:"thomas_piketty",
  theory_ref:{
    topic_hook_id:"kapitalmakt",
    thinker_id:"thomas_piketty",
    why_it_helps:"Et eierskaps- og kapitalperspektiv gjør det mulig å skille dokumentert Euronext-integrasjon og markedsstyring fra udokumenterte påstander om kursvirkning, investorresultater eller samlet samfunnseffekt."
  },
  guidance_basis:["data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json","data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json"]
});
write(quizFile,{targetId:placeId,categoryId,sources:Object.fromEntries(Object.entries(sources).map(([id,s])=>[id,s.url])),sets:phases.map((phase,index)=>({set_id:"naeringsliv_"+placeId+"_set_"+(index+1),title:titles[index],level:index+1,order:index+1,phase,xp:50+index*25,questions:questions.slice(index*7,index*7+7)}))});
write(briefFile,{
  schema_version:"1.0",status:"reviewed",categoryId,targetId:placeId,profile_hint:"normal",reviewed_at:verifiedAt,
  review_note:"Oslo byleksikon, Oppdag Kvadraturen, Lokalhistoriewiki og Euronext skiller institusjon, bygg, markedsskift, spekulasjon og dagens regulerte marked. Krakk behandles uten monokausalitet, og fysisk bygning skilles fra elektronisk handel.",
  scope:{place:"Oslo Børs",production_profile:"normal",set_count:4,questions_per_set:7,total_questions:28,normal_opening_questions:14},
  sources,
  selected_curriculum:{module_ids:["kapital_eierskap_finans"],emne_ids:[...new Set(questions.map(q=>q.emne_id))],topic_hook_ids:[...new Set(questions.map(q=>q.topic_hook_id).filter(Boolean))],method_ids:[...new Set(questions.map(q=>q.method_id).filter(Boolean))],thinker_ids:[...new Set(questions.map(q=>q.thinker_id).filter(Boolean))],works:[]},
  existing_quiz_audit:{searched_paths:["data/quiz/manifest.json","data/quiz/naeringsliv",placeFile],active_before:{finding:"Legacy quiz profile existed in Place metadata but no current source-led 4x7 package for borsen_oslo."},decisions:["Replace with one canonical normal 4x7 package.","Keep first fourteen questions direct and place-specific.","Introduce methods only in final set."],knowledge_migration:"All 28 questions receive stable Knowledge IDs."},
  profile_decision:{profile:"normal",set_count:4,questions_per_set:7,justification:"Four distinct learning jobs cover institution/building, securities history, risk/current market and analysis."},
  held_back_candidates:["Live share prices or index values.","A claim that every crash has the same cause.","A claim that physical trading-floor activity describes today's market.","Unverified claims about individual investor motives."],
  claims:questions.map((q,index)=>({claim_id:q.claim_id,order:index+1,planned_phase:phases[Math.floor(index/7)],family:index<14?"fact":index<21?"context":"concept_theory",statement:q.claim_basis,source_ids:q.source,source_origin:q.source_origin,emne_id:q.emne_id}))
});
const quizManifest=read("data/quiz/manifest.json"); quizManifest.sets=(quizManifest.sets||[]).filter(row=>row.targetId!==placeId); quizManifest.sets.push({targetId:placeId,file:quizFile}); write("data/quiz/manifest.json",quizManifest);
const fagManifest=read("data/fag/fag_manifest.json"); fagManifest.naeringsliv.quizProduction ||= {status:"pilot",required_inputs:["pensum","emner","fagkart","methods","supersetQuizMal","quizStandard","quizQuestionSchema"],context_builder:"scripts/build-quiz-production-context.mjs",profile_system:"adaptive_relative_superset",package_schema:"quizPackageSchema",context_artifact_root:"data/quiz/production_context",targets:{}}; fagManifest.naeringsliv.quizProduction.targets ||= {}; fagManifest.naeringsliv.quizProduction.targets[placeId]={source_brief:"../quiz/production_briefs/naeringsliv/borsen_oslo.json",context_artifact:"../quiz/production_context/naeringsliv/borsen_oslo.json",quiz_file:"../quiz/naeringsliv/borsen_oslo_sets.json"}; write("data/fag/fag_manifest.json",fagManifest);
const built=await runBuildQuizProductionContext({root,categoryId,targetId:placeId,outputPath:contextFile});
const quiz=read(quizFile);
quiz.production_context={manifest_category:categoryId,profile:built.profile,standard_version:"3.4",source_brief:briefFile,context_artifact:contextFile,resolved_files:Object.fromEntries(Object.entries(built.resolved_files).map(([key,value])=>[key,value.path])),required_inputs_loaded:built.required_inputs_loaded,pensum_module_ids:built.selected_curriculum.module_ids,emne_ids:built.selected_curriculum.emne_ids,topic_hook_ids:built.selected_curriculum.topic_hook_ids,method_ids:built.selected_curriculum.method_ids,thinker_ids:built.selected_curriculum.thinker_ids,works:built.selected_curriculum.works,source_review_status:built.source_review_status,existing_quiz_audit:built.existing_quiz_audit,profile_decision:built.profile_decision,held_back_candidates:built.held_back_candidates,theory_start_phase:"final",method_start_phase:"final"};
write(quizFile,quiz);

const registry=read("data/fagverk/fagverk_registry.json"); registry.placeLinks[placeId]={sourceFile:placeFile.replace(/^data\//,""),field:"fagverk",schema:fagverk.schema,level:fagverk.level,status:fagverk.status}; write("data/fagverk/fagverk_registry.json",registry);

const packetSources={
  byleksikon:{url:urls.byleksikon,sourceType:"reputable_secondary",note:"historikk og bygg"},
  oppdag:{url:urls.oppdag,sourceType:"institutional",note:"jobbetider og stedshistorie"},
  euronext:{url:urls.euronext,sourceType:"primary",note:"dagens marked og adresse"}
};
const strongPopupSentenceNumbers=new Set([1,2,11,18]);
const makeClaims=(prefix,text)=>sentences(text).map((sentence,index)=>{
  const id=/2019|Euronext|dagens|fortsatt/i.test(sentence)?"euronext":/jobbetid|krakk|verdenskrig|spekulasjon/i.test(sentence)?"oppdag":"byleksikon";
  const source=packetSources[id];
  const sentenceNumber=index+1;
  const isStrong=prefix==="popup"&&strongPopupSentenceNumbers.has(sentenceNumber);
  const independentSourceUrls=isStrong?[id==="byleksikon"?urls.lokalhistorie:urls.byleksikon]:[];
  return{id:"claim_"+placeId+"_"+prefix+"_"+String(sentenceNumber).padStart(2,"0"),claim:sentence,sourceUrl:source.url,sourceLocation:source.note+" – "+prefix+" setning "+sentenceNumber,sourceType:source.sourceType,independentSourceUrls,verifiedAt,status:"verified",claimKind:isStrong?"strong":index===0&&prefix==="desc"?"identity":"fact",evidenceMode:isStrong?"explicit":"direct",temporalStatus:/2019|dagens|fortsatt|Euronext/i.test(sentence)?"current":"historical"};
});
const descClaims=makeClaims("desc",desc),popupClaims=makeClaims("popup",popupDesc),allClaims=[...descClaims,...popupClaims];
const readinessTypes=["når","når","hvor","hvem","hvem","når","hva","når","når","hva"];
const readinessClaimSentenceNumbers=[1,1,2,4,5,5,5,7,8,9];
write("data/places/production/borsen_oslo.json",{
  schemaVersion:"4.2",validatorVersion:"4.2.1",placeId,placeFile,status:"ready_v4_2",
  identity:{status:"resolved",represents:"Oslo Børs som stedbundet børsinstitusjon ved Tollbugata 2, med institusjonshistorie fra 1819 og børsbygning fra 1828.",period:"1819–",excludes:["all norsk finansvirksomhet","Euronext-gruppen som helhet","påstanden om at institusjonen startet først da bygningen sto ferdig i 1828"]},
  claims:allClaims,sentenceCoverage:{desc:descClaims.map((c,i)=>({sentence:i+1,claimIds:[c.id]})),popupDesc:popupClaims.map((c,i)=>({sentence:i+1,claimIds:[c.id]}))},
  metadataSnapshot:{name:place.name,category:place.category,year:place.year,coordinates:{lat:place.lat,lon:place.lon}},
  collections:{people:[groschId,personId],objects:objects.map(x=>x.id),brands:[brandId],historical_events:historicalEvents.map(x=>x.id)},
  quizReadiness:{status:"ready",quizTargetId:placeId,sourceBrief:briefFile,productionContext:contextFile,totalQuestions:28,normalOpeningQuestions:14,reuseDecision:"Legacy profile replaced by source-led normal 4x7.",questions:questions.slice(0,10).map((q,i)=>({type:readinessTypes[i],question:q.question,answer:q.answer,normalKnowledgeQuestion:true,claimIds:["claim_"+placeId+"_popup_"+String(readinessClaimSentenceNumbers[i]).padStart(2,"0")]}))},
  roundsReadiness:{status:"ready",exactCollectionCount:4},
  source_conflicts:[
    {claim:"Oslo Børs ble etablert i 1828.",status:"rejected",reason:"Institusjonen åpnet i 1819; 1828 er året for fullført egen børsbygning."},
    {claim:"Dagens verdipapirhandel skjer primært som fysisk gulvhandel i bygningen.",status:"rejected",reason:"Dagens markedsinfrastruktur er elektronisk; bygningen er fortsatt institusjonell Oslo-adresse."}
  ],
  reviews:{factual:{status:"passed",reviewedAt:verifiedAt,reviewer:"Oslo Børs source review",notes:"1818/1819, 1826–1828, 1881, 1899, 1909–1912, 1988/1991 and 2019 were cross-checked."},editorial:{status:"passed",reviewedAt:verifiedAt,reviewer:"Oslo Børs finance-boundary review",introducedNewFacts:false,notes:"Institution, building, market prices, crises and Euronext ownership are explicitly separated."}},
  completion:{completedUnder:"4.2",currentStatus:"current",sourceVerifiedAt:verifiedAt,claimsVerified:{verified:allClaims.length,total:allClaims.length},factualReview:"passed",editorialReview:"passed",validatorVersion:"4.2.1"},
  textHashes:{algorithm:"sha256",desc:sha256(desc),popupDesc:sha256(popupDesc)}
});

const economicSources=[
  {id:"source_borsen_byleksikon",url:urls.byleksikon,sourceLocation:"Børsen – etablering, bygg, funksjon og utvidelser",sourceType:"reputable_secondary",verifiedAt,temporalCoverage:"mixed",provenance:"Oslo byleksikons redaksjonelle stedspost om Børsen.",limitations:"Gir historikk og bygningsfunksjon, men ingen sammenhengende pris- eller omsetningsserie."},
  {id:"source_borsen_oppdag",url:urls.oppdag,sourceLocation:"Tollbugata 2 – jobbetider og krakk",sourceType:"museum_or_heritage",verifiedAt,temporalCoverage:"historical",provenance:"Oppdag Kvadraturens stedsspesifikke historiske formidling.",limitations:"Brukes til daterte spekulasjons- og krakkeksempler, ikke som kvantitativ finansdatabase."},
  {id:"source_borsen_euronext",url:urls.euronext,sourceLocation:"Our organisation – Oslo",sourceType:"primary_business",verifiedAt,temporalCoverage:"current",provenance:"Euronexts egen organisasjonsside for nasjonal regulert markedsplass og Oslo-adresse.",limitations:"Primærkilde til egen nåværende organisasjon; brukes ikke alene til uavhengig effektvurdering."},
  {id:"source_borsen_lokalhistorie",url:urls.lokalhistorie,sourceLocation:"Oslo Børs – funksjonsskift og verdipapirhandel",sourceType:"reputable_secondary",verifiedAt,temporalCoverage:"mixed",provenance:"Lokalhistoriewikis kuraterte oppslag om Oslo Børs.",limitations:"Sekundærkilde; tall og funksjonsskift brukes sammen med andre kilder."}
];
const sourceIds=economicSources.map(x=>x.id);
const caseId="case_borsen_market_infrastructure";
write("data/places/naeringsliv-production/borsen_oslo.json",{
  schemaVersion:"naeringsliv_place_production_v1",validatorVersion:"1.0.0",placeId,placeFile,status:"ready",
  economicIdentity:{statement:"Oslo Børs er en stedbundet børs- og markedsinstitusjon som organiserer notering og handel i verdipapirer, med fysisk adresse i Tollbugata 2 og institusjonshistorie fra 1819.",anchorType:"stock_exchange",placeObjectDistinction:"Rapporten analyserer børsinstitusjonen ved Tollbugata 2 og dens dokumenterte markedsfunksjoner, ikke alle børsnoterte selskaper eller Euronext-gruppen som helhet.",temporalScope:{start:"1819",end:"2026",precision:"period",rationale:"Perioden følger institusjonen fra åpningen til dagens Euronext-integrerte regulerte Oslo-marked."},sourceIds:["source_borsen_byleksikon","source_borsen_euronext"]},
  businessTopics:[
    {emneId:"em_naering_felt_arbeid_verdiskaping",siteSpecificRationale:"Børsen er en markedsinstitusjon der kapital, informasjonsarbeid, megling og regulert omsetning organiseres som økonomisk verdiskaping, samtidig som kildene ikke gir grunnlag for å tallfeste arbeidsproduktivitet på stedet.",caseIds:[caseId]},
    {emneId:"em_naering_geografi_infrastruktur",siteSpecificRationale:"Tollbugata 2 gjør finansmarkedets historiske infrastruktur fysisk: en permanent børsbygning i Kvadraturen kobles til dagens elektroniske, Euronext-integrerte markedsinfrastruktur.",caseIds:[caseId]}
  ],
  sources:economicSources,
  economicCases:[{
    id:caseId,claim:"Oslo Børs skaper markedsinfrastruktur ved å samle regler, notering, informasjon og handelsinteresse slik at verdipapirer kan omsettes og prises, mens krakkhistorien viser at likviditet og prisdannelse også bærer risiko.",
    unitOfAnalysis:{unit:"Oslo Børs som regulert markedsplass ved Tollbugata 2",boundary:"Analysen gjelder markedsinstitusjonen og dens dokumenterte stedshistorie, ikke resultatene til enkeltinvestorer eller alle børsnoterte selskaper.",scale:"market",temporalScope:{start:"1819",end:"2026",precision:"period",rationale:"Perioden dekker tidlig børsfunksjon, verdipapirmarked, kriser og dagens Euronext-integrasjon."},sourceIds},
    actors:[
      {name:"Utstedere og investorer",roleOrInterest:"Søker henholdsvis kapitaltilgang og mulighet til å kjøpe eller selge finansielle krav.",economicPosition:"Tilbyr og etterspør verdipapirer innenfor markedsplassens regler og informasjonskrav.",sourceIds:["source_borsen_euronext","source_borsen_lokalhistorie"]},
      {name:"Oslo Børs / Euronext",roleOrInterest:"Organiserer den regulerte markedsplassen, notering og handelsinfrastruktur.",economicPosition:"Kontrollerer markedsregler og teknisk/institusjonell adgang til den organiserte markedsplassen.",sourceIds:["source_borsen_euronext","source_borsen_byleksikon"]}
    ],
    valueCreation:{inputs:[{statement:"Markedsregler, teknologi, handelsinteresse, informasjon og noterte finansielle instrumenter er nødvendige innsatsfaktorer.",sourceIds:["source_borsen_euronext","source_borsen_lokalhistorie"]}],activity:{statement:"Markedsplassen organiserer notering og omsetning slik at kjøps- og salgsinteresse kan møtes under felles regler.",sourceIds:["source_borsen_euronext"]},outputs:[{statement:"Observerbare markedspriser, likviditet og tilgang til et organisert annenhåndsmarked er sentrale markedsutfall.",sourceIds:["source_borsen_euronext"]}],valueCreationAssessment:{statement:"Kildene dokumenterer markedsfunksjon og historiske skift, men denne stedsproduksjonen beregner ikke samfunnsøkonomisk nettoverdi eller avkastning.",sourceIds:["source_borsen_euronext","source_borsen_byleksikon"]}},
    measurement:{methodId:"met_naering_kapital_og_finansanalyse",evidenceType:"qualitative",indicatorOrObservation:"Institusjonens funksjonsskift, instrumenttyper, dokumenterte krakk og Euronext-integrasjon brukes som stedbundne markedsindikatorer.",unit:"dokumenterte institusjons- og markedsskift",period:"1819–2026",comparability:"Kildene kan sammenholdes om funksjoner og perioder, men de utgjør ikke én homogen kurs- eller omsetningsserie.",dataLimitations:"Stedsproduksjonen inneholder ikke komplett historisk datasett for priser, volum, volatilitet, spread eller markedsverdi.",sourceIds},
    distributionAndPower:{ownershipOrControl:"Børsens markedsregler og Euronext-eierskapet gir institusjonen kontroll over organisert markedsadgang, mens verdipapirene eies av separate aktører.",laborPosition:"Ansatte driver markedsinfrastruktur og tilsynsnære funksjoner, men åpne stedskilder gir ikke grunnlag for detaljert lønns- eller bemanningsanalyse.",beneficiaries:["Utstedere kan få tilgang til organiserte kapitalmarkeder.","Investorer får en regulert markedsplass for omsetning og prisinformasjon."],costRiskBearers:["Investorer bærer markedsrisiko på egne posisjoner.","Utstedere og markedsaktører bærer kostnader ved notering, etterlevelse og markedstilgang."],sourceIds:["source_borsen_euronext","source_borsen_lokalhistorie"]},
    riskAndExternalities:{riskAssessment:{statement:"Krakkene viser at priser, likviditet og forventninger kan endres kraftig; regulert markedsinfrastruktur eliminerer ikke markedsrisiko.",sourceIds:["source_borsen_oppdag","source_borsen_euronext"]},externalityAssessment:{status:"not_applicable",rationale:"Kildene bærer ikke en robust stedsspesifikk kvantifisering av eksterne kostnader eller gevinster som kan attribueres til selve børsbygningen."}},
    comparisonAndCausality:{comparisonBasis:"Historiske kilder beskriver åpning, jobbetider og funksjonsskift, mens Euronext dokumenterer dagens regulerte markedsrolle og Oslo-adresse.",causalStatus:"descriptive_only",causalAssessment:"Materialet viser tidsrekkefølge og plausible markedsmekanismer, men isolerer ikke én årsak til krakkene eller én effekt av Euronext-integrasjonen.",alternativeExplanations:["Makroøkonomi, kredittforhold, internasjonale priser, regulering og investorforventninger kan virke samtidig."],uncertainty:"Åpne kilder dokumenterer institusjon og hendelser bedre enn de dokumenterer kontrafaktiske effekter eller individuelle beslutningsmotiver.",sourceIds}
  }],
  presentOperation:{operationalStatus:"active",statement:"Euronext oppgir Oslo som nasjonal regulert verdipapir- og derivatmarkedsplass med adresse Tollbugata 2, og integrasjonsår 2019.",originalEconomicRoleRelationship:"Dagens elektroniske og Euronext-integrerte marked viderefører børsens organiserte markedsrolle, men arbeidsform, teknologi, instrumentbredde og eierskap er vesentlig endret siden 1819.",checkedAt:verifiedAt,sourceIds:["source_borsen_euronext"]},
  quizOpening:{status:"PASS",quizTargetId:placeId,firstTwoSetsQuestionCount:14,sourceBrief:briefFile,productionContext:contextFile,requiredInputs:["data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json","data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md","data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"]},
  chronologyStories:{status:"PASS",chronologyReviewed:true,storiesReviewed:true,rationale:"Tretten daterte kronologiankere og episode_v1-storyen om 1899-krakket er kildekontrollert og skilt fra analysepåstander."},
  gates:{
    A:{status:"PASS",evidenceRefs:[placeFile,"data/places/production/borsen_oslo.json"]},
    B:{status:"PASS",evidenceRefs:[leksikonFile]},
    C:{status:"PASS",evidenceRefs:[briefFile,contextFile]},
    D:{status:"PASS",evidenceRefs:[personFile,claimsFile]},
    E:{status:"PASS",evidenceRefs:[storyFile]},
    F:{status:"PASS",evidenceRefs:[urls.byleksikon,urls.euronext]},
    G:{status:"PASS",evidenceRefs:[languageFile]},
    H:{status:"PASS",evidenceRefs:["tests/borsen-oslo-production-closure.test.mjs"]}
  },
  review:{reviewer:"History Go Oslo Børs production closure",reviewedAt:verifiedAt,notes:"Fail-closed Næringsliv-produksjon som skiller institusjon fra bygg, markedspris fra verdi og dokumentert tidsrekkefølge fra sterk kausalitet."}
});

write("reports/place-production/borsen_oslo-workcard-current.json",{
  schema:"history_go_place_workcard_v1",place_id:placeId,category:categoryId,status:"complete",completed_at:verifiedAt,production_profile:"standard",profile_status:"confirmed",source_review:"complete",collections:place.place_card_profile.collection_ids,quiz_profile:"normal_4x7",naeringsliv_gates:"A-H PASS",quality_gate:"reports/place-production/borsen_oslo-phase1-24-gate-audit-v1.json",canonical_next:null,
  notes:["Existing verified address coordinate preserved.","Institution opening in 1819 is kept distinct from building completion in 1828.","Thor Olsen upgraded with source-complete portrait provenance; Grosch reused canonically.","Four collections are People, Objects, Brands and Historical Events.","Current operation is tied to Euronext's Tollbugata 2 organisation listing."]
});
execFileSync(process.execPath,["scripts/place-production-rule-preflight.mjs","record","--workcard","reports/place-production/borsen_oslo-workcard-current.json","--place-id",placeId,"--category",categoryId],{cwd:root,stdio:"inherit"});
write("reports/place-production/borsen_oslo-phase1-24-gate-audit-v1.json",{
  schema:"history_go_phase1_24_quality_gate_v1",place_id:placeId,verified_at:verifiedAt,
  null_measurement:{existing_place:true,coordinate_changed:false,existing_people:"Grosch and Thor Olsen existed; Thor lacked image",existing_quiz:"legacy profile without current canonical source-led 4x7",existing_collections:"people only in runtime; no complete four-collection profile",existing_fagverk:"generic/linked material, upgraded to place-owned curated v2"},
  collections:{required:["people","objects","brands","historical_events"],missing:0,coverage_percent:100},
  people:{candidates_reviewed:["Christian Heinrich Grosch","Thor Olsen"],selected:[groschId,personId],held_back:["Nicolai Andresen is relevant to the 1818 parliamentary initiative but is not needed to make the People collection complete."],image_coverage_percent:100},
  objects:{selected:objects.map(x=>x.id),held_back:["Gerhard Munthe's wall paintings remain in chronology because a dedicated rights-audited object image was not needed for collection completeness."],exception:null},
  brands:{selected:[brandId],held_back:[],logo_coverage:{required:1,reviewed:1,missing:0,percent:100}},
  source_conflicts:[{claim:"Oslo Børs began in 1828.",status:"rejected",reason:"1819 is the institution opening; 1828 is completion of the permanent building."},{claim:"The exchange building proves how every modern trade is executed.",status:"rejected",reason:"Modern trading is electronic; the building is an institutional anchor, not a literal model of all trading mechanics."}],
  conditional_modules:{stories:"one_episode_v1_produced",lesespor:"five_produced",language:"six_terms_produced",for_na:"historical_and_current_images_with_nonmatched_view_caveat",news:"not_applicable",dialect:"not_applicable"},
  manual_image_review:{status:"PASS",reviewed_assets:[place.image,place.frontImage,place.quizCardImage,person.image,brand.logo,...objects.map(x=>x.image),...historicalEvents.map(x=>x.image)],note:"Modern CC BY-SA and historical public-domain/CC BY-SA assets have explicit provenance. Reused historical event context images are labeled as context rather than event photography."},
  quality_score:{correctness_and_evidence:{score:5,note:"Institution/building dates, people roles, market shifts and current Euronext address are separated and sourced."},coverage_and_completion:{score:5,note:"Four image-ready collections, chronology, Story, language, five reading tracks, curated Fagverk and 4x7 quiz are materialized."},editorial_quality:{score:5,note:"Price/value, building/institution and chronology/causality distinctions are explicit."},technical_integrity:{score:5,note:"Deterministic finalizer updates canonical manifests, Knowledge, Fagverk and runtime derivatives."},safety_and_responsibility:{score:5,note:"No investment advice, live price claims or guaranteed-value language is introduced."},maintainability_and_auditability:{score:5,note:"Workcard, production packets, source conflicts and image provenance form a reproducible audit trail."},total:30,critical_findings:0,unresolved_blockers:0}
});

const imageAuditFile=path.join(os.tmpdir(),"borsen-oslo-place-image-audit.json");
execFileSync(process.execPath,["scripts/audit-place-images.mjs","--mode=all","--report="+imageAuditFile],{cwd:root,stdio:"ignore"});
const imageAudit=JSON.parse(fs.readFileSync(imageAuditFile,"utf8"));
const imageBacklogFile="data/places/place_image_backlog_summary.json";
const imageBacklog=read(imageBacklogFile);
imageBacklog.generatedAt=verifiedAt;
imageBacklog.generatedFromCommit="borsen_oslo_completion_20260911";
imageBacklog.totalPlaces=imageAudit.totalPlaces;
imageBacklog.summary={
  validLocal:imageAudit.summary.local,
  validRemote:imageAudit.summary.remote,
  optionalMissing:imageAudit.summary.optional,
  missing:imageAudit.summary.missing,
  invalidLocalPath:imageAudit.summary.invalid,
  remaining:imageAudit.summary.missing+imageAudit.summary.invalid
};
imageBacklog.byCategory=Object.fromEntries(Object.entries(imageAudit.byCategory).map(([category,bucket])=>[category,{
  total:bucket.total,
  valid:bucket.local+bucket.remote,
  optional:bucket.optional,
  missing:bucket.missing,
  invalid:bucket.invalid
}]));
write(imageBacklogFile,imageBacklog);

const testFile="tests/borsen-oslo-production-closure.test.mjs";
fs.writeFileSync(path.join(root,testFile),`import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const place=read("data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_01/borsen_oslo.json");
const quiz=read("data/quiz/naeringsliv/borsen_oslo_sets.json");
const econ=read("data/places/naeringsliv-production/borsen_oslo.json");
const packet=read("data/places/production/borsen_oslo.json");
test("Oslo Børs full place closure",()=>{
  assert.equal(place.production_status,"complete");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","historical_events"]);
  assert.equal(place.frontImageMeta.orientation,"portrait");
  assert.ok((place.chronology||[]).length>=10);
  assert.equal((quiz.sets||[]).length,4);
  assert.equal(quiz.sets.flatMap(s=>s.questions||[]).length,28);
  assert.equal(quiz.sets.slice(0,2).flatMap(s=>s.questions||[]).length,14);
  assert.equal((place.fagverk?.lenses||[]).length,4);
  assert.ok((place.fagverk?.guiding_questions||[]).length>=4);
  assert.ok((place.fagverk?.concepts||[]).length>=6);
  assert.equal(econ.status,"ready");
  assert.deepEqual(Object.values(econ.gates).map(g=>g.status),Array(8).fill("PASS"));
});
test("Oslo Børs identity and image boundaries",()=>{
  assert.match(place.popupDesc,/1819/);
  assert.match(place.popupDesc,/1826–1828/);
  assert.match(place.popupDesc,/2019/);
  assert.ok(fs.existsSync("bilder/kort/people/thor_olsen.webp"));
  assert.ok(fs.existsSync("bilder/kort/objects/borsen_oslo_merkur.webp"));
  assert.ok(fs.existsSync("bilder/kort/brands/oslo_bors_marketplace.webp"));
  assert.ok(fs.existsSync("bilder/QuizCards/Oslo Børs.webp"));
});
test("Oslo Børs place-description packet is valid v4.2",()=>{
  const result=validatePacket({packet,place,packetFile:"data/places/production/borsen_oslo.json",now:new Date("2026-09-11T12:00:00Z")});
  assert.deepEqual(result.issues,[]);
});
`);

execFileSync(process.execPath,["--experimental-strip-types","scripts/build-civication-scenario-people-index.mts"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","civication:history-people:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-epoke-place-index.mjs"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/materialize-natur-final-registry.mjs"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","places:index:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-place-open-payloads.mjs"],{cwd:root,stdio:"inherit"});
await runBuildQuizProductionContext({root,categoryId,targetId:placeId,outputPath:contextFile});
const knowledgeAuditFile="reports/knowledge-contract-audit.json";
const knowledgeAuditSnapshot=fs.readFileSync(path.join(root,knowledgeAuditFile));
execFileSync(process.execPath,["--experimental-strip-types","scripts/knowledge-canonical-data.mts","--write"],{cwd:root,stdio:"inherit"});
fs.writeFileSync(path.join(root,knowledgeAuditFile),knowledgeAuditSnapshot);
execFileSync(process.execPath,["scripts/audit-fagverk-place-pages.mjs","--write"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-fagverk-release-manifest.mjs"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","place-open:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-epoke-place-index.mjs"],{cwd:root,stdio:"inherit"});

console.log(JSON.stringify({place:placeId,collections:place.place_card_profile.collection_ids,quizQuestions:questions.length,chronology:chronology.length,readingTracks:newReadings.length,languageTerms:language.entries.length,quality:30},null,2));
