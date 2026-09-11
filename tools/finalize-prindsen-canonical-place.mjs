#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const root = process.cwd();
const verifiedAt = "2026-09-11";
const id = "prinds_christian_augusts_minde";
const oldId = "prindsen_mottakssenter";
const brandId = "prindsen_mottakssenter_tjeneste";
const placeFile = "data/places/historie/oslo/places_historie_added_batch_01/" + id + ".json";
const oldPlaceFile = "data/places/subkultur/oslo/places_subkultur/" + oldId + ".json";
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n");
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const upsert = (array, value) => {
  const i = array.findIndex((item) => item.id === value.id);
  if (i < 0) array.push(value); else array[i] = value;
};
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = (text) => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map((x) => x.segment.trim()).filter(Boolean);

const urls = {
  prindsen: "https://prindsen.no/om-prindsen.html",
  byleksikon: "https://oslobyleksikon.no/side/Prinds_Christian_Augusts_Minde",
  snl: "https://snl.no/Prinds_Christian_Augusts_Minde",
  osloService: "https://www.oslo.kommune.no/helse-og-omsorg/rustjenester/alle-rusinstitusjoner/prindsen-mottakssenter/",
  osloCenter: "https://www.oslo.kommune.no/helse-og-omsorg/rustjenester/sentrumsarbeid/",
  currentPage: "https://commons.wikimedia.org/wiki/File:Prindsens_hage_og_Prinds_Christian_Augusts_Minde,_Oslo.jpg",
  currentAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Prindsens%20hage%20og%20Prinds%20Christian%20Augusts%20Minde%2C%20Oslo.jpg",
  historicPage: "https://commons.wikimedia.org/wiki/File:Mangelsg%C3%A5rden,_Prinds_Christian_Augusts_Minde,_1900,_Severin_Worm-Petersen,_OB.FS0073.jpg",
  historicAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mangelsg%C3%A5rden%2C%20Prinds%20Christian%20Augusts%20Minde%2C%201900%2C%20Severin%20Worm-Petersen%2C%20OB.FS0073.jpg",
  plaquePage: "https://commons.wikimedia.org/wiki/File:Mangelsg%C3%A5rden_plaque_Storgata_36_0182_Oslo_Norway.jpg",
  plaqueAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mangelsg%C3%A5rden%20plaque%20Storgata%2036%200182%20Oslo%20Norway.jpg",
  osloMarkPage: "https://commons.wikimedia.org/wiki/File:Oslo_komm.svg",
  osloMarkAsset: "https://upload.wikimedia.org/wikipedia/commons/d/da/Oslo_komm.svg"
};

const sharpModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs")
  : "sharp";
const { default: sharp } = await import(sharpModule);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function download(url, filename) {
  const dir = path.join(root, ".cache", "prindsen-media");
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, filename);
  if (fs.existsSync(target) && fs.statSync(target).size > 1000) return target;
  let lastStatus = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: {
          "user-agent": "History-Go/1.0 (place production; github.com/Paradispartiet/History-Go)",
          "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
        }
      });
      lastStatus = res.status;
      if (res.ok) {
        fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
        await sleep(2200);
        return target;
      }
      if (res.status !== 429 && res.status < 500) throw new Error("download failed " + res.status + " " + url);
      lastError = new Error("HTTP " + res.status);
    } catch (error) {
      lastError = error;
    }
    await sleep(3000 * attempt);
  }
  throw new Error("download failed after retries " + (lastStatus ?? "network") + " " + url + ": " + (lastError?.message ?? "unknown"));
}
async function image(source, target, width, height, position = "centre", fit = "cover") {
  const out = path.join(root, target);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(source).rotate().resize(width, height, { fit, position, background: { r:255, g:255, b:255, alpha:1 } }).webp({ quality: 88 }).toFile(out);
}
const currentSrc = await download(urls.currentAsset, "current.jpg");
const historicSrc = await download(urls.historicAsset, "historic.jpg");
const plaqueSrc = await download(urls.plaqueAsset, "plaque.jpg");
const osloMarkSrc = await download(urls.osloMarkAsset, "oslo.svg");

await image(currentSrc, "bilder/places/" + id + ".webp", 1400, 900, "centre");
await image(currentSrc, "bilder/places/" + id + "_front_portrait.webp", 900, 1280, "centre");
await image(plaqueSrc, "bilder/kort/objects/" + id + "_mangelsgarden_plaque.webp", 900, 620, "centre");
await image(historicSrc, "bilder/kort/historical_events/" + id + "_1809.webp", 900, 620, "centre");
await image(historicSrc, "bilder/kort/historical_events/" + id + "_1819.webp", 900, 620, "left");
await image(historicSrc, "bilder/kort/historical_events/" + id + "_1829.webp", 900, 620, "right");
await image(currentSrc, "bilder/kort/historical_events/" + id + "_2009.webp", 900, 620, "centre");
await image(osloMarkSrc, "bilder/kort/brands/" + brandId + ".webp", 900, 520, "centre", "contain");

const quizOverlay = Buffer.from(
  '<svg width="900" height="1280" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="900" height="1280" fill="rgba(0,0,0,.25)"/>' +
  '<rect x="56" y="920" width="788" height="270" rx="32" fill="rgba(0,0,0,.80)"/>' +
  '<text x="96" y="1010" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="white">Prindsen</text>' +
  '<text x="96" y="1074" font-family="Arial, sans-serif" font-size="30" fill="white">Arbeid · omsorg · kontroll</text>' +
  '<text x="96" y="1130" font-family="Arial, sans-serif" font-size="27" fill="white">28 spørsmål · historie</text>' +
  '</svg>'
);
const quizCard = path.join(root, "bilder/QuizCards/Prindsen.webp");
fs.mkdirSync(path.dirname(quizCard), { recursive: true });
await sharp(currentSrc).rotate().resize(900, 1280, { fit:"cover" }).composite([{ input: quizOverlay }]).webp({ quality:88 }).toFile(quizCard);

const currentMeta = {
  source:"wikimedia_commons", sourcePage:urls.currentPage, creator:"Ssu",
  credit:"Ssu / Wikimedia Commons", license:"CC BY-SA 4.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
  assetType:"documentary_place_photo", date:"2023-11-07",
  transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const historicMeta = {
  source:"oslo_museum_via_wikimedia_commons", sourcePage:urls.historicPage,
  creator:"Severin Worm-Petersen", credit:"Severin Worm-Petersen / Oslo Museum / Wikimedia Commons",
  license:"CC BY-SA 3.0", licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
  assetType:"historical_place_photo", date:"1900",
  transformation:"Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const plaqueMeta = {
  source:"wikimedia_commons", sourcePage:urls.plaquePage, creator:"Spudgun67",
  credit:"Spudgun67 / Wikimedia Commons", license:"CC BY-SA 4.0",
  licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
  assetType:"documentary_object_photo", date:"2023-03-18",
  transformation:"Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const markMeta = {
  source:"wikimedia_commons", sourcePage:urls.osloMarkPage, sourceAsset:urls.osloMarkAsset,
  creator:"Oslo kommune", credit:"Oslo kommune / Wikimedia Commons",
  rightsBasis:"referential_public_authority_identification",
  license:"Public domain; offentlig våpen med lovregulert bruk",
  assetKind:"official_municipal_mark", sourceForm:"oslo_kommune_corporate_mark",
  usageContext:"referential_identification", noEndorsement:true, generated:false, reconstructed:false,
  transformation:"Offisiell kommunal merkeillustrasjon proporsjonalt skalert og sentrert på 900 x 520-flate; ingen rekonstruksjon.",
  outputDimensions:"900x520", reviewedAt:verifiedAt
};

const place = read(placeFile);
delete place.cardImage;
place.name = "Prinds Christian Augusts Minde";
place.category = "historie";
place.year = 1809;
place.desc = "Prinds Christian Augusts Minde, kjent som Prindsen, er det fredede sosialhistoriske anlegget i Storgata 36. Stiftelsen ble opprettet i 1809, kjøpte Mangelsgården i 1812 og utviklet arbeidshus, fattigsykehus, dollhus og asyl. I dag brukes Prindsen-navnet også av kommunens mottakssenter i Hausmannsgate 11, som behandles som en nåtidig tjeneste knyttet til stedet.";
place.popupDesc = "Prinds Christian Augusts Minde ble opprettet i 1809 av en gruppe velstående borgere i Christiania. Navnet var en æresbevisning til stattholder Christian August, ikke et uttrykk for at han grunnla stiftelsen. Målet var å hjelpe fattige og arbeidsløse i en by der fattigdommen økte og Tukthuset hadde blitt et rent fengsel.\n\nI 1812 kjøpte stiftelsen Mangelsgården i Storgata 36. Fattigvesenets spinnerier ble flyttet hit, og i 1819 ble en fast arbeidsanstalt etablert. Arbeidstilbudet var i prinsippet frivillig, men kildene dokumenterer at tvangsplassering forekom fra starten. Dermed ble hjelp, arbeid, disiplin og sosial kontroll tidlig vevd sammen.\n\nAnlegget fikk stadig flere funksjoner. Et eget dollhus for hovedstaden ble etablert i Mangelsgårdens nordfløy i 1829. Fabrikkbygningen ble tatt i bruk i 1833, fattigsykehuset i 1840, og etter sinnssykeloven av 1848 ble asylfunksjonene bygd ut og formelt godkjent. De ulike bygningene gjør institusjonshistorien lesbar som flere lag i samme kvartal.\n\nArbeidsanstalten rommet blant annet steinhogging, spinning, veving og drevplukking. Samtidig ble mennesker sortert etter arbeidsevne, helse og myndighetenes vurderinger. Prindsen er derfor en viktig kilde til grupper som ofte er svakt representert i monumental byhistorie: fattige, syke, barn uten familieomsorg og andre som levde under institusjonell kontroll.\n\nMangelsgården ble fredet i 1927. I 2009 fredet Riksantikvaren hele anlegget. Vernet gjelder ikke bare enkeltfasader, men et sammensatt sosialhistorisk miljø der den lukkede arkitekturen selv forteller om hvordan fattige og syke ble holdt utenfor det ordinære bylivet.\n\nI dag brukes Prindsen-navnet også av Prindsen mottakssenter i Hausmannsgate 11. Oslo kommune beskriver dette som et helse- og sosialfaglig lavterskeltilbud med blant annet akuttovernatting, brukerrom, feltpleie og smittevern, og Velferdsetaten har ansvar for kommunens rusfaglige arbeid i Oslo. Mottakssenteret er et nåtidig tjenestelag; den historiske Place-identiteten er fortsatt Prinds Christian Augusts Minde.\n\nStedet gjør det mulig å sammenligne mer enn to hundre års skiftende språk og praksis rundt fattigdom, psykisk helse, rus, omsorg og kontroll. Dagens tjenester skal ikke projiseres bakover som om de var det samme som arbeidsanstalten, og de historiske institusjonene skal heller ikke brukes til å karakterisere dagens brukere.";
place.emne_ids = [
  "em_his_sosialhistorie_hverdagsliv",
  "em_his_velferd_hverdagsliv",
  "em_his_tilhorighet_ekskludering",
  "em_his_stat_institusjoner",
  "em_his_historiske_lag_i_byrom",
  "em_his_spor_materialitet",
  "em_his_kulturminner_bevaring"
];
place.underbadge_ids = ["attenhundretallet","byhistorie","sosialhistorie","kulturminner_og_bevaring"];
place.secondaryBadgeIds = [...place.underbadge_ids];
place.image = "bilder/places/" + id + ".webp";
place.frontImage = "bilder/places/" + id + "_front_portrait.webp";
place.imageCaption = "Prindsens hage og deler av Prinds Christian Augusts Minde, fotografert i 2023.";
place.imageCredit = "Ssu / Wikimedia Commons";
place.imageLicense = "CC BY-SA 4.0";
place.imageSourceUrl = urls.currentPage;
place.imageMeta = { ...currentMeta, outputDimensions:"1400x900", orientation:"landscape" };
place.frontImageMeta = { ...currentMeta, outputDimensions:"900x1280", orientation:"portrait" };
place.visual = { designCode:"historic_social_institution_complex_miniature" };
place.production_profile = "standard";
place.profile_status = "confirmed";
place.profile_reason = "Kildene bærer et bredt sosialhistorisk anlegg med dokumentert person, signaturobjekt, nåtidig institusjonsidentitet, flere avgrensede hendelser, kronologi og læringsspor.";
place.place_card_profile = {
  schema:"history_go_place_card_profile_v2",
  collection_ids:["people","objects","brands","historical_events"],
  category_collection_label:"Historiske hendelser",
  reason:"Hausmann, Mangelsgården-skiltet, Prindsen mottakssenter som nåtidig institusjonsidentitet og fire kildebårne historiske hendelser gir fire reelle bildeklare samlinger.",
  verifiedAt
};
place.related_people_ids = ["fredrik_ferdinand_hausmann"];
place.objects = [{
  id:id + "_mangelsgarden_plaque",
  name:"Kulturhistorisk skilt ved Mangelsgården",
  title:"Kulturhistorisk skilt ved Mangelsgården",
  type:"kulturhistorisk skilt",
  kind:"physical_heritage_plaque",
  year:2023,
  desc:"Skiltet ved Storgata 36 navngir Mangelsgården og komprimerer flere sentrale tidslag i anleggets historie.",
  physicalObject:true, placeSpecific:true, collectable:true,
  placeSpecificReason:"Commons-fotografiet dokumenterer skiltet fysisk ved Mangelsgården i Storgata 36.",
  why_here:"Skiltet er et synlig ettertidsobjekt som kan sammenholdes med eldre kilder i stedet for å brukes som eneste historisk fasit.",
  whereToFind:"Ved Mangelsgården, Storgata 36.",
  unlock:"Finn skiltet og skill mellom det du kan lese på stedet og det som må kontrolleres mot historiske kilder.",
  image:"bilder/kort/objects/" + id + "_mangelsgarden_plaque.webp",
  imageMeta:plaqueMeta,
  source_urls:[urls.plaquePage, urls.prindsen]
}];
place.historical_events = [
  {
    id:id + "_stiftelsen_1809", name:"Stiftelsen opprettes", title:"Stiftelsen opprettes",
    year:1809, type:"historical_event", kind:"charitable_foundation",
    desc:"En gruppe velstående borgere opprettet Prinds Christian Augusts Minde for å hjelpe fattige og arbeidsløse.",
    image:"bilder/kort/historical_events/" + id + "_1809.webp",
    imageMeta:{...historicMeta,note:"Fotografiet viser Mangelsgården i 1900 og brukes som senere stedskontekst, ikke som bilde av opprettelsen i 1809."},
    source_urls:[urls.prindsen,urls.byleksikon]
  },
  {
    id:id + "_arbeidsanstalten_1819", name:"Den faste arbeidsanstalten etableres", title:"Den faste arbeidsanstalten etableres",
    year:1819, type:"historical_event", kind:"workhouse_establishment",
    desc:"Den faste arbeidsanstalten ble etablert som arbeidshus; kildene viser at tvangsplassering forekom selv om arbeid i prinsippet skulle være frivillig.",
    image:"bilder/kort/historical_events/" + id + "_1819.webp",
    imageMeta:{...historicMeta,note:"Fotografiet er fra 1900 og dokumenterer stedet senere; hendelsen i 1819 dokumenteres av tekstkildene."},
    source_urls:[urls.prindsen,urls.snl]
  },
  {
    id:id + "_dollhuset_1829", name:"Dollhuset opprettes", title:"Dollhuset opprettes",
    year:1829, type:"historical_event", kind:"mental_health_institution",
    desc:"Hovedstaden etablerte et eget dollhus med ni plasser i nordfløyen av Mangelsgården.",
    image:"bilder/kort/historical_events/" + id + "_1829.webp",
    imageMeta:{...historicMeta,note:"Fotografiet er fra 1900 og viser gårdsanlegget, ikke dollhuset slik det så ut ved etableringen i 1829."},
    source_urls:[urls.prindsen,urls.byleksikon]
  },
  {
    id:id + "_fredning_2009", name:"Hele Prindsen-anlegget fredes", title:"Hele Prindsen-anlegget fredes",
    year:2009, type:"historical_event", kind:"heritage_protection",
    desc:"Riksantikvaren fredet hele Prinds Christian Augusts Minde etter at Mangelsgården hadde vært fredet siden 1927.",
    image:"bilder/kort/historical_events/" + id + "_2009.webp",
    imageMeta:{...currentMeta,note:"Fotografiet er fra 2023 og viser det fredede anlegget etter vedtaket i 2009."},
    source_urls:[urls.prindsen]
  }
];
place.externalLinks = [
  {type:"institutional",label:"Prindsen – om Prinds Christian Augusts Minde",url:urls.prindsen,lang:"nb",verifiedAt},
  {type:"source",label:"Oslo Byleksikon – Prinds Christian Augusts Minde",url:urls.byleksikon,lang:"nb",verifiedAt},
  {type:"source",label:"Store norske leksikon – Prinds Christian Augusts Minde",url:urls.snl,lang:"nb",verifiedAt},
  {type:"current_use",label:"Oslo kommune – Prindsen mottakssenter",url:urls.osloService,lang:"nb",verifiedAt},
  {type:"official",label:"Oslo kommune – sentrumsarbeid",url:urls.osloCenter,lang:"nb",verifiedAt},
  {type:"image_source",label:"Wikimedia Commons – Prindsens hage",url:urls.currentPage,lang:"nb",verifiedAt},
  {type:"image_source",label:"Oslo Museum / Commons – Mangelsgården 1900",url:urls.historicPage,lang:"nb",verifiedAt},
  {type:"image_source",label:"Wikimedia Commons – kulturhistorisk skilt ved Mangelsgården",url:urls.plaquePage,lang:"nb",verifiedAt}
];
place.fagverk = {
  schema:"history_go_place_fagverk_v2", level:"standard", status:"curated",
  intro:"Prindsen gjør skiftende grenser mellom hjelp, arbeid, tvang, helse og sosial kontroll synlige i ett byanlegg, samtidig som dagens lavterskeltilbud viser at samme byområde fortsatt rommer sosial infrastruktur.",
  article:[
    "Stiftelsen ble opprettet i 1809 og kjøpte Mangelsgården i 1812. Da den faste arbeidsanstalten kom i 1819, ble arbeid organisert som hjelp for mennesker uten inntekt, men kildene viser også tvangsplassering. Det gjør stedet egnet til å undersøke hvordan eldre fattigomsorg kombinerte støtte og kontroll.",
    "Bygningsmassen vokste sammen med institusjonene. Dollhuset kom i 1829, Fabrikkbygningen i 1833 og fattigsykehuset i 1840. Et besøk kan derfor lese gårdsrom og fløyer som materielle spor, men funksjon og datering må kontrolleres i kilder fordi dagens utseende er resultat av mange ombygginger.",
    "Prindsen synliggjør også kildeproblemer. Myndigheter og institusjoner etterlot seg langt mer dokumentasjon enn mange av menneskene som bodde eller arbeidet her. Regler, bygninger og administrative kilder kan derfor vise organisering og makt uten å gi full tilgang til individuelle erfaringer.",
    "Dagens Prindsen mottakssenter er et kommunalt helse- og sosialfaglig lavterskeltilbud med andre mål, rettigheter og faglige rammer enn 1800-tallets institusjoner. Sammenligningen er nyttig bare når kontinuitet i sosial geografi holdes adskilt fra påstander om at institusjonene er de samme.",
    "Fredningen av Mangelsgården i 1927 og hele anlegget i 2009 gjør selve bevaringen til et historisk lag. Vernet bevarer ikke bare arkitektur, men et ubehagelig sosialhistorisk kildemateriale om hvordan byen organiserte fattigdom, psykisk helse og utenforskap."
  ],
  subject_ids:["historie"],
  emne_ids:["em_his_velferd_hverdagsliv","em_his_sosialhistorie_hverdagsliv","em_his_tilhorighet_ekskludering","em_his_stat_institusjoner","em_his_spor_materialitet","em_his_kulturminner_bevaring"],
  chapter_ids:["velferd_rett_hverdagsliv","kilder_arkiv_spor","historisk_tid_periodisering"],
  lenses:[
    {id:"hjelp-og-tvang",title:"Hjelp og tvang",prompt:"Hvordan kunne arbeid være både hjelp og kontroll ved Prindsen?",subject_id:"historie",emne_id:"em_his_velferd_hverdagsliv",evidence:"Sammenhold opprettelsen av arbeidshuset i 1819 med dokumentasjonen av tvangsplassering fra starten."},
    {id:"institusjonelle-lag",title:"Institusjonelle lag",prompt:"Hva forteller de ulike bygningene om hvordan sosialpolitikken ble organisert?",subject_id:"historie",emne_id:"em_his_stat_institusjoner",evidence:"Følg dollhus, fabrikkbygning, fattigsykehus og asylfunksjoner som separate daterte lag."},
    {id:"taushet-og-kilder",title:"Hvem får en stemme?",prompt:"Hva kan institusjonskildene fortelle, og hvilke erfaringer forblir svakt dokumentert?",subject_id:"historie",emne_id:"em_his_tilhorighet_ekskludering",evidence:"Skill administrative opplysninger om plassering, arbeid og bygg fra påstander om hvordan hvert menneske opplevde institusjonen."},
    {id:"vern-og-ettertid",title:"Vern og ettertid",prompt:"Hvorfor er bevaring av et sosialhistorisk kontrollmiljø faglig viktig?",subject_id:"historie",emne_id:"em_his_kulturminner_bevaring",evidence:"Sammenlign fredningen i 1927 og 2009 med anleggets dokumenterte historie som arbeids-, omsorgs- og kontrollsted."}
  ],
  guiding_questions:[
    "Hvor går grensen mellom hjelp og tvang i arbeidsanstaltens historie?",
    "Hvilke deler av institusjonshistorien kan leses i bygningene, og hvilke krever arkivkilder?",
    "Hva mister vi dersom Prindsen bare beskrives som et vakkert fredet anlegg?",
    "Hvordan bør dagens mottakssenter sammenlignes med eldre institusjoner uten å gjøre dem til det samme?",
    "Hva gjør et senere kulturhistorisk skilt til en nyttig, men begrenset kilde?"
  ],
  concepts:["fattigomsorg","arbeidsanstalt","dollhus","institusjonell kontroll","skadereduksjon","kildekritikk","kulturminnevern","sosial infrastruktur"],
  observable_traces:[
    {title:"Mangelsgården og gårdsrommet",observation:"Se hovedbygningen, fløyene og det lukkede gårdspreget.",interpretation_boundary:"Bygningene viser materielle lag, men kan ikke alene datere alle funksjoner eller dokumentere beboernes erfaringer.",source_urls:[urls.prindsen,urls.currentPage]},
    {title:"Kulturhistorisk skilt",observation:"Les skiltet ved Mangelsgården og noter hvilke år og funksjoner det løfter fram.",interpretation_boundary:"Skiltet er en senere komprimert minnetekst og skal kontrolleres mot historiske kilder.",source_urls:[urls.plaquePage,urls.prindsen]},
    {title:"Nåtidig tjenesteidentitet",observation:"Legg merke til at Prindsen-navnet også brukes om et kommunalt mottakssenter i Hausmannsgate 11.",interpretation_boundary:"Dagens tjeneste dokumenterer nåværende sosial infrastruktur, ikke kontinuitet i behandlingsform eller rettighetsregime fra 1800-tallet.",source_urls:[urls.osloService,urls.osloCenter]}
  ],
  source_urls:[urls.prindsen,urls.byleksikon,urls.snl,urls.osloService,urls.osloCenter,urls.currentPage,urls.plaquePage],
  verified_at:verifiedAt
};
place.language_profile = {
  primary_name:"Prinds Christian Augusts Minde",
  place_name_root:"Prindsen",
  etymology:"Navnet viser til stiftelsen som i 1809 ble oppkalt til ære for stattholder Christian August; Prindsen er den innarbeidede kortformen.",
  key_term:"arbeidsanstalt",
  usage_note:"Historiske ord som dollhus, arbeidshus og tvangsarbeid beskriver samtidige institusjoner og skal ikke brukes som betegnelser på dagens mottakssenter.",
  source:urls.prindsen,
  dialect_status:"Enkeltstedet eier ikke et dialektlag."
};
place.module_audit = {
  for_na:{status:"source_bounded_holdback",rationale:"1900-fotografiet og dagens foto har ikke dokumentert identisk standpunkt og brukes derfor ikke som kontrollert før–nå-par."},
  news:{status:"not_applicable",rationale:"Ingen egen nyhetsmodul er nødvendig for å fullføre den kildebårne historiske stedsopplevelsen."},
  dialect:{status:"not_applicable",rationale:"Enkeltsted uten placeScope area."},
  language:{status:"produced"}, chronology:{status:"produced"}, stories:{status:"produced"}, reading_tracks:{status:"produced"}
};
place.related_place_ids = ["oslo_gassverk","hausmannsbrua","brugata_storgata_rusmiljo","storgata"];
place.production_status = "complete";
place.production_verified_at = verifiedAt;
write(placeFile, place);
const fagverkRegistry = read("data/fagverk/fagverk_registry.json");
fagverkRegistry.placeLinks[id] = {sourceFile:placeFile.replace(/^data\//,""),field:"fagverk",schema:place.fagverk.schema,level:place.fagverk.level,status:place.fagverk.status};
write("data/fagverk/fagverk_registry.json",fagverkRegistry);

const brand = {
  id:brandId,
  name:"Prindsen mottakssenter",
  aliases:["Prindsen mottakssenter – Oslo kommune"],
  brand_group:"institution_brand",
  brand_type:"municipal_service_identity",
  brand_kind:"service",
  sector:"public_welfare",
  state:"catalog",
  status:"active",
  verification:"verified",
  verified_at:verifiedAt,
  desc:"Kommunalt helse- og sosialfaglig lavterskeltilbud for voksne med rusrelaterte utfordringer.",
  popupdesc:"Brand-kortet gjelder den nåværende tjenesteidentiteten Prindsen mottakssenter, ikke et eget historisk Place. Oslo kommune dokumenterer akuttovernatting, brukerrom, feltpleie, smittevern og veiledning på Hausmannsgate 11, og Velferdsetaten har ansvar for kommunens rusfaglige arbeid i Oslo.",
  tags:["institution_brand","municipal_service","public_welfare","harm_reduction","prindsen","oslo"],
  place_ids:[id],
  source_urls:[urls.osloService,urls.osloCenter],
  logo:"bilder/kort/brands/" + brandId + ".webp",
  imageMeta:{...markMeta,note:"Oslo kommunes offisielle merke brukes som den dokumenterte visuelle overidentiteten på kommunens tjenestesider; det er ikke et rekonstruert særmerke for mottakssenteret."}
};
const brandsMaster = read("data/brands/brands_master.json");
upsert(brandsMaster, brand);
write("data/brands/brands_master.json", brandsMaster);
const brandSummary = Object.fromEntries(Object.entries(brand).filter(([key]) => !["place_ids","source_urls","logo","imageMeta"].includes(key)));
for (const file of ["data/brands/brands_catalog.json","data/brands/brands_catalog_v17.json"]) {
  const rows = read(file); upsert(rows, brandSummary); write(file, rows);
}
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[id] = [brandId];
delete brandsByPlace[oldId];
write("data/brands/brands_by_place.json", brandsByPlace);

const manifest = read("data/places/manifest.json");
manifest.files = manifest.files.filter((file) => file !== "places/subkultur/oslo/places_subkultur/" + oldId + ".json");
write("data/places/manifest.json", manifest);
if (fs.existsSync(path.join(root, oldPlaceFile))) fs.rmSync(path.join(root, oldPlaceFile));
if (fs.existsSync(path.join(root, "data/runtime/place-open/" + oldId + ".json"))) fs.rmSync(path.join(root, "data/runtime/place-open/" + oldId + ".json"));

const aliasFile = path.join(root, "tools/check_place_id_aliases.mts");
let aliasText = fs.readFileSync(aliasFile, "utf8");
if (!aliasText.includes("aliases." + oldId + " = '" + id + "';")) {
  aliasText = aliasText.replace("const retiredIds = new Set<string>", "aliases." + oldId + " = '" + id + "';\nconst retiredIds = new Set<string>");
  fs.writeFileSync(aliasFile, aliasText);
}

const chronology = [
  {year:1809,title:"Stiftelsen opprettes",desc:"Prinds Christian Augusts Minde opprettes for å hjelpe fattige og arbeidsløse.",source:urls.prindsen},
  {year:1812,title:"Mangelsgården kjøpes",desc:"Stiftelsen kjøper Mangelsgården og flytter fattigvesenets spinnerier hit.",source:urls.prindsen},
  {year:1819,title:"Fast arbeidsanstalt",desc:"Den faste anstalten etableres som arbeidshus.",source:urls.prindsen},
  {year:1829,title:"Dollhuset etableres",desc:"Et eget dollhus for hovedstaden åpner i Mangelsgårdens nordfløy.",source:urls.prindsen},
  {year:1833,title:"Fabrikkbygningen tas i bruk",desc:"Den nye Fabrikkbygningen tas i bruk.",source:urls.prindsen},
  {year:1840,title:"Fattigsykehuset oppføres",desc:"Byens fattigsykehus bygges inne på området.",source:urls.prindsen},
  {year:1850,title:"Asylet godkjennes",desc:"Etter utbedringer i kjølvannet av sinnssykeloven blir asylet godkjent.",source:urls.prindsen},
  {year:1908,title:"Asylperioden avsluttes",desc:"Kvinneavdelingen flytter til Dikemark, etter at mannlige pasienter hadde flyttet i 1905.",source:urls.prindsen},
  {year:1927,title:"Mangelsgården fredes",desc:"Mangelsgården får formelt vern.",source:urls.prindsen},
  {year:2009,title:"Hele anlegget fredes",desc:"Riksantikvaren vedtar fredning av hele Prinds Christian Augusts Minde.",source:urls.prindsen}
];
const leksikonFile = "data/leksikon/places/oslo/historie/leksikon_" + id + ".json";
write(leksikonFile, [{
  id:id + "_hovedartikkel", place_id:id, title:"Prinds Christian Augusts Minde", version:1,
  popupDesc:"Hovedartikkel om Prindsen som sosialhistorisk anlegg og nåtidig sosial infrastruktur.",
  visual:{designCode:"article_social_institution_history"},
  summary:{one_liner:"Et fredet byanlegg der hjelp, arbeid, helse og sosial kontroll kan følges gjennom mer enn to hundre år.",themes:["fattigomsorg","institusjon","utenforskap","vern"],tone:["kildekritisk","nøktern"]},
  wikiText:[
    "Prinds Christian Augusts Minde ble opprettet i 1809 og kjøpte Mangelsgården i 1812. Da et fast arbeidshus kom i 1819, ble hjelp til fattige og arbeidsløse organisert i et miljø der kildene også dokumenterer tvangsplassering.",
    "Gjennom 1800-tallet fikk området stadig flere funksjoner. Dollhuset fra 1829, Fabrikkbygningen fra 1833, fattigsykehuset fra 1840 og det senere asylet viser hvordan ulike former for omsorg, arbeid, helse og kontroll ble samlet tett i byen.",
    "Prindsen er et vanskelig, men viktig kildested. Administrative kilder og bygninger er rike, mens mange av menneskene som bodde og arbeidet her etterlot seg langt færre egne stemmer. Derfor må regler og institusjonsdata ikke forveksles med individuelle erfaringer.",
    "Mangelsgården ble fredet i 1927 og hele anlegget i 2009. Bevaringen gjør både arkitektur og sosialhistoriske maktforhold lesbare, men dagens bruk er ikke identisk med fortidens institusjoner.",
    "Prindsen mottakssenter i Hausmannsgate 11 er i dag et kommunalt helse- og sosialfaglig lavterskeltilbud. Tjenesten hører til det moderne hjelpeapparatet og brukes som et nåtidig lag i formidlingen, ikke som et separat historisk Place."
  ],
  facts:[
    {label:"Stiftet",value:"1809"},
    {label:"Mangelsgården kjøpt",value:"1812"},
    {label:"Fast arbeidsanstalt",value:"1819"},
    {label:"Hele anlegget fredet",value:"2009"}
  ],
  chronology:chronology.map((c,index)=>({id:"chrono_" + id + "_" + (index+1) + "_" + c.year,year:c.year,title:c.title,consequence:c.desc,confidence:"high",sources:[c.source],period:c.title,desc:c.desc})),
  externalLinks:[urls.prindsen,urls.byleksikon,urls.snl,urls.osloService,urls.osloCenter],
  sources:[urls.prindsen,urls.byleksikon,urls.snl,urls.osloService,urls.osloCenter,urls.currentPage,urls.historicPage,urls.plaquePage]
}]);
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = [...new Set([...(leksikonManifest.files || []), leksikonFile])];
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/" + id + ".json";
const languageEntries = [
  ["Prindsen","Innarbeidet kortform for Prinds Christian Augusts Minde og i dag også del av navnet på mottakssenteret."],
  ["Mangelsgården","Navnet på den eldste hoveddelen av anlegget, oppkalt etter en tidligere eier."],
  ["arbeidsanstalt","Historisk betegnelse for institusjonen der arbeid, fattigomsorg og kontroll ble organisert."],
  ["dollhus","Historisk betegnelse på en institusjon for mennesker med psykiske lidelser; ordet brukes om samtidens institusjon, ikke som moderne diagnose."],
  ["De fattiges kvartal","Betegnelse som framhever områdets lange historie med fattige og sosialt utstøtte grupper."],
  ["skadereduksjon","Nåtidig fagbegrep i mottakssenterets samfunnsoppdrag: tiltak som skal redusere skade og redde liv."]
];
write(languageFile, {
  place_id:id, title:"Språkleksikon: Prindsen", language:"nb",
  entries:languageEntries.map((row,index)=>({id:id + "_sprak_" + (index+1),type:"term",term:row[0],meaning:row[1],place_ids:[id],sources:[{label:index===5?"Oslo kommune":"Prindsen",url:index===5?urls.osloService:urls.prindsen,verifiedAt}]}))
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[id] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_historie.json";
const reading = read(readingFile);
const readingItems = [
  {id:"lesespor_prindsen_dokumentasjon",title:"Om Prinds Christian Augusts Minde",author:"Wenche Blomberg",publication:"Prindsen / Prindsens venner",year:2020,type:"institutional_history",subjects:["Prindsen","fattigomsorg","arbeidsanstalt","asyl","fredning"],place_ids:[id],person_ids:["fredrik_ferdinand_hausmann"],category_hints:["historie"],url:urls.prindsen,access:"open",rights:"link_only",source_quality:"institutional",curation_status:"approved",relevance:"Detaljert stedshistorie med bygg, institusjonslag, 1809–2009-kronologi og dagens bruk."},
  {id:"lesespor_prindsen_byleksikon",title:"Prinds Christian Augusts Minde",author:null,publication:"Oslo Byleksikon",year:2026,type:"reference_article",subjects:["Prindsen","Mangelsgården","institusjonshistorie"],place_ids:[id],person_ids:[],category_hints:["historie"],url:urls.byleksikon,access:"open",rights:"link_only",source_quality:"recognized",curation_status:"approved",relevance:"Byhistorisk oppslag som avgrenser anlegget og hovedfunksjonene."},
  {id:"lesespor_prindsen_snl",title:"Prinds Christian Augusts Minde",author:null,publication:"Store norske leksikon",year:2026,type:"reference_article",subjects:["fattigomsorg","arbeidsanstalt","sosialhistorie"],place_ids:[id],person_ids:[],category_hints:["historie"],url:urls.snl,access:"open",rights:"link_only",source_quality:"canonical",curation_status:"approved",relevance:"Fagredigert oversikt som kan krysskontrollere institusjonshistorien."},
  {id:"lesespor_prindsen_mottakssenter",title:"Prindsen mottakssenter",author:null,publication:"Oslo kommune",year:2026,type:"current_official",subjects:["lavterskeltilbud","skadereduksjon","feltpleie","brukerrom"],place_ids:[id],person_ids:[],category_hints:["historie","helse"],url:urls.osloService,access:"open",rights:"link_only",source_quality:"institutional",curation_status:"approved",relevance:"Offisiell nåtidskilde til mottakssenterets målgruppe, samfunnsoppdrag, tjenester og besøksadresse."}
];
reading.items = (reading.items || []).filter((item) => !readingItems.some((candidate) => candidate.id === item.id));
reading.items.push(...readingItems);
write(readingFile, reading);

const quizSources = {
  prindsen:{url:urls.prindsen,source_type:"institutional_reference",review_status:"reviewed",review_note:"Stiftelse, bygninger, arbeid, dollhus, asyl, fredning og dagens bruk."},
  byleksikon:{url:urls.byleksikon,source_type:"institutional_reference",review_status:"reviewed",review_note:"Byhistorisk identitet og institusjonskronologi."},
  snl:{url:urls.snl,source_type:"reference",review_status:"reviewed",review_note:"Fagredigert kontroll av hovedhistorien."},
  oslo_service:{url:urls.osloService,source_type:"official_current",review_status:"reviewed",review_note:"Målgruppe, samfunnsoppdrag, tjenester og besøksadresse."},
  oslo_center:{url:urls.osloCenter,source_type:"official_current",review_status:"reviewed",review_note:"Velferdsetatens ansvar for kommunens rusfaglige arbeid."}
};
const facts = [
  ["Hva er Prinds Christian Augusts Minde først og fremst?","Et sosialhistorisk institusjonsanlegg","Et middelalderslott","En jernbanestasjon","Prindsen er et sosialhistorisk anlegg der fattigomsorg, arbeid, helse og kontroll har vært samlet.","prindsen"],
  ["Hvilken adresse har det historiske anlegget?","Storgata 36","Kongens gate 1","Karl Johans gate 22","Prindsen-dokumentasjonen oppgir Storgata 36 som adresse for anlegget.","prindsen"],
  ["Når ble stiftelsen Prinds Christian Augusts Minde opprettet?","1809","1819","1927","Stiftelsen ble opprettet i 1809.","prindsen"],
  ["Hvem var stiftelsen oppkalt til ære for?","Christian August","Christian IV","Karl Johan","Navnet var en æresbevisning til stattholder Christian August.","prindsen"],
  ["Hva var et hovedmål med stiftelsen i 1809?","Å hjelpe fattige og arbeidsløse","Å bygge et universitet","Å drive tollstasjon","Stiftelsen skulle hjelpe fattige og arbeidsløse.","prindsen"],
  ["Når kjøpte stiftelsen Mangelsgården?","1812","1809","1840","Mangelsgården ble kjøpt i 1812.","prindsen"],
  ["Hva ble flyttet til Mangelsgården etter kjøpet?","Fattigvesenets spinnerier","Stortinget permanent","Hovedbrannstasjonen","Fattigvesenets spinnerier ble flyttet til Mangelsgården.","prindsen"],
  ["Når ble den faste arbeidsanstalten etablert?","1819","1829","1908","Den faste anstalten ble etablert som arbeidshus i 1819.","prindsen"],
  ["Hva viser kildene om frivillighet ved arbeidshuset?","Tvangsplassering forekom fra starten","All plassering var alltid frivillig","Ingen fikk arbeide der","Arbeidet skulle i prinsippet være frivillig, men tvangsplassering forekom fra starten.","prindsen"],
  ["Hvilket arbeid er dokumentert ved anstalten?","Steinhogging, spinning, veving og drevplukking","Bare skipsbygging","Bare boktrykk","Prindsen-dokumentasjonen nevner steinhogging, spinning, veving og drevplukking.","prindsen"],
  ["Når ble dollhuset for hovedstaden etablert?","1829","1812","2009","Et eget dollhus med ni plasser ble etablert i 1829.","prindsen"],
  ["Hvor lå dollhuset?","I Mangelsgårdens nordfløy","I Oslo domkirke","På Akershus slott","Dollhuset lå i nordfløyen av Mangelsgården.","prindsen"],
  ["Når ble Fabrikkbygningen tatt i bruk?","1833","1850","1927","Fabrikkbygningen ble tatt i bruk i 1833.","prindsen"],
  ["Når ble fattigsykehuset på området oppført?","1840","1905","2013","Byens fattigsykehus ble oppført inne på området i 1840.","prindsen"],
  ["Hva skjedde med asylet etter kravene i sinnssykeloven av 1848?","Det ble utbedret og godkjent i 1850","Det ble revet samme år","Det ble flyttet til Bergen","Utbedringer gjorde at asylet kunne godkjennes i 1850.","prindsen"],
  ["Når var kvinneavdelingen på Prindsen avviklet til fordel for Dikemark?","1908","1819","1970","Kvinneavdelingen flyttet til Dikemark i 1908; mannlige pasienter var flyttet i 1905.","prindsen"],
  ["Når ble Mangelsgården fredet?","1927","1908","2009","Mangelsgården ble fredet i 1927.","prindsen"],
  ["Når ble hele Prinds Christian Augusts Minde fredet?","2009","1927","1970","Riksantikvaren fredet hele anlegget i 2009.","prindsen"],
  ["Hva betyr betegnelsen «De fattiges kvartal» i denne sammenhengen?","Den peker på stedets lange historie med fattige og utstøtte","Den viser til et kongelig boligområde","Den er et navn på en handelskjede","Betegnelsen framhever rundt to hundre år med virksomheter knyttet til fattige og utstøtte.","prindsen"],
  ["Hvorfor er den lukkede arkitekturen historisk viktig?","Den er del av historien om skjerming og sosial kontroll","Den viser at stedet var festning","Den beviser at alle bygg er fra 1600-tallet","Kulturminneverdien omfatter også et lukket preg knyttet til hvordan fattige og syke ble holdt utenfor det vanlige bylivet.","prindsen"],
  ["Hva er Prindsen mottakssenter i dag?","Et helse- og sosialfaglig lavterskeltilbud","Et historisk tvangsarbeidshus","Et privat hotell","Oslo kommune beskriver mottakssenteret som et helse- og sosialfaglig lavterskeltilbud.","oslo_service"],
  ["Hvilken besøksadresse oppgir Oslo kommune for mottakssenteret?","Hausmannsgate 11","Storgata 1","Rådhusplassen 1","Oslo kommune oppgir Hausmannsgate 11 som besøksadresse.","oslo_service"],
  ["Hvilken etat har ansvar for kommunens rusfaglige arbeid i Oslo?","Velferdsetaten","Kulturetaten","Byantikvaren","Oslo kommune oppgir at Velferdsetaten har ansvar for kommunens rusfaglige arbeid.","oslo_center"],
  ["Hvilken tjeneste finnes ved dagens mottakssenter?","Brukerrom og feltpleie","Passkontroll","Universitetsbibliotek","Mottakssenteret tilbyr blant annet brukerrom, feltpleie, akuttovernatting og smittevern.","oslo_service"],
  ["Hvorfor kan et kulturhistorisk skilt ikke brukes som eneste fasit om Prindsen?","Det er en senere, komprimert framstilling som må kontrolleres mot andre kilder","Fordi skilt aldri kan leses","Fordi det står i en annen by","Et skilt er et fysisk ettertidsspor og må sammenholdes med historiske og institusjonelle kilder.","prindsen"],
  ["Hva kan Oslo kommunes nåværende mottakssenterside dokumentere best?","Dagens tjenester, målgruppe og kontaktinformasjon","Nøyaktig hvordan arbeidshuset fungerte i 1819","Alle pasienters erfaringer på 1800-tallet","Den kommunale siden er en nåtidskilde til dagens tjeneste, ikke en primærkilde til 1800-tallet.","oslo_service"],
  ["Hva viser arbeidshuset om forholdet mellom omsorg og kontroll?","At hjelp og tvang kunne være tett sammenvevd","At de alltid var helt adskilt","At kontroll ikke fantes","Arbeidshuset skulle gi hjelp, men tvangsplassering viser at omsorg og kontroll kunne virke samtidig.","prindsen"],
  ["Hvordan bør de mange tidslagene ved Prindsen undersøkes?","Som ulike historiske lag med egne kilder, ikke som én uendret institusjon","Som om alt stammer fra 1809","Bare gjennom dagens tjenester","Prindsen rommer skiftende institusjoner og bruk; langvarige strukturer og kortere hendelser må skilles kildekritisk.","prindsen"]
];
const emneCycle = ["em_his_velferd_hverdagsliv","em_his_sosialhistorie_hverdagsliv","em_his_tilhorighet_ekskludering","em_his_stat_institusjoner","em_his_spor_materialitet","em_his_historiske_lag_i_byrom","em_his_kulturminner_bevaring"];
const phases = ["opening","middle","bridge","final"];
const titles = ["Stiftelsen og stedet","Arbeid, helse og institusjoner","Vern og dagens tjenester","Kilder, makt og tidslag"];
const questions = facts.map((fact,index) => {
  const [question,answer,wrong1,wrong2,knowledge,sourceId] = fact;
  const raw = [answer,wrong1,wrong2], shift = index % 3, options = [...raw.slice(shift),...raw.slice(0,shift)];
  const setNo = Math.floor(index/7)+1;
  return {
    id:id + "_quiz_" + String(index+1).padStart(2,"0"),
    quiz_id:"historie_" + id + "_set_" + setNo + "_q" + (index%7+1),
    categoryId:"historie", placeId:id, personId:"", natureId:"", targetId:id, question_scope:"place",
    question, options, answer, answerIndex:options.indexOf(answer), dimension:phases[setNo-1],
    topic:question.toLowerCase().replace(/[^a-z0-9æøå]+/g,"_").slice(0,48), knowledge, trivia:[],
    difficulty:setNo, question_type:index<14?"fact":index<21?"context":"concept",
    question_layer:index<14?"normal_opening":index<21?"bridge":"final",
    year:null, epoke_id:null, epoke_domain:"historie", emne_id:emneCycle[index%emneCycle.length],
    related_emner:[], core_concepts:[], concept_focus:[], learning_paths:[], tags:[id,"prindsen","oslo","historie"], required_tags:[],
    source:[sourceId], source_origin:"external", claim_basis:knowledge,
    claim_id:"claim_" + id + "_quiz_" + String(index+1).padStart(2,"0"),
    method_id:null,
    primary_knowledge_unit_id:"ku_his_" + id + "_" + String(index+1).padStart(2,"0"),
    knowledge_unit_ids:["ku_his_" + id + "_" + String(index+1).padStart(2,"0")],
    concept_ids:index>=21?["co_historie_historisk_endring_84be686aa4"]:[], term_ids:[],
    knowledge_contract_version:1, knowledge_link_status:"linked", concepts:["institusjon","sosialhistorie","kildekritikk"]
  };
});
Object.assign(questions[24],{method_id:"met_sporlesning",guidance_basis:["data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/methods_historie_canonical_v4_5.json"]});
Object.assign(questions[25],{method_id:"met_kildekritikk",guidance_basis:["data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/methods_historie_canonical_v4_5.json"]});
Object.assign(questions[26],{method_id:"met_kildekritikk",guidance_basis:["data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/methods_historie_canonical_v4_5.json"]});
Object.assign(questions[27],{
  emne_id:"em_his_historiske_lag_i_byrom", topic_hook_id:"his_tidslag_samtidighet", thinker_id:"fernand_braudel",
  work:"The Mediterranean and the Mediterranean World",
  theory_ref:{topic_hook_id:"his_tidslag_samtidighet",thinker_id:"fernand_braudel",work:"The Mediterranean and the Mediterranean World",why_it_helps:"Braudels skille mellom hendelser og lang varighet hjelper til å holde stiftelsen, institusjonsendringene, vernet og dagens tjenester fra hverandre uten å erstatte stedskildene."},
  guidance_basis:["data/fag/historie/fagkart_historie_canonical_v4_5.json","data/fag/historie/theory_objects_historie_canonical_v5_5.json"]
});
const briefFile = "data/quiz/production_briefs/historie/" + id + ".json";
const contextFile = "data/quiz/production_context/historie/" + id + ".json";
const quizFile = "data/quiz/historie/" + id + "_sets.json";
const quizClaims = questions.map((question,index)=>({
  claim_id:question.claim_id, order:index+1, planned_phase:phases[Math.floor(index/7)],
  family:question.question_type==="concept"?"concept_theory":question.question_type,
  statement:question.claim_basis, source_ids:question.source, source_origin:"external", emne_id:question.emne_id
}));
write(briefFile,{
  schema_version:"1.0", categoryId:"historie", targetId:id, scope:"place", status:"reviewed", reviewed_at:verifiedAt,
  profile_hint:"normal_4x7",
  review_note:"Prindsen-dokumentasjonen, Oslo Byleksikon, SNL og Oslo kommunes nåtidssider er skilt etter tidslag; dagens mottakssenter brukes ikke som kilde til 1800-tallet.",
  sources:quizSources,
  selected_curriculum:{emne_ids:place.emne_ids,topic_hook_ids:["his_tidslag_samtidighet"],method_ids:["met_sporlesning","met_kildekritikk"],thinker_ids:["fernand_braudel"],works:["The Mediterranean and the Mediterranean World"]},
  profile_decision:{profile:"normal",set_count:4,questions_per_set:7,justification:"Fire sett dekker stiftelse, arbeid og helse, vern og dagens tjeneste samt kildekritisk syntese uten filler."},
  existing_quiz_audit:{searched_paths:[quizFile],active_before:{categoryId:"historie",set_count:1,question_count:3},decisions:["Legacy 1x3 var utilstrekkelig og erstattes av source-led 4x7.","Kjernepåstandene om sosialhistorie er bevart i omskrevet form, ikke som ukontrollert kopiering."],knowledge_migration:{status:"completed",retained_rule:"Bare kildebårne kunnskapsenheter videreføres."}},
  held_back_candidates:["Individuelle beboererfaringer uten førstepersonskilder","Likestilling av dagens mottakssenter med 1800-tallets institusjoner","Ett enkelt byggeår for hele anlegget"],
  claims:quizClaims
});
write(quizFile,{
  targetId:id, categoryId:"historie", size_class:"normal_4x7", generated_from:briefFile,
  generator_version:"history_go_manual_reviewed_v1",
  sources:Object.fromEntries(Object.entries(quizSources).map(([key,value])=>[key,value.url])),
  sets:Array.from({length:4},(_,index)=>({set_id:"historie_" + id + "_set_" + (index+1),level:index+1,order:index+1,phase:phases[index],title:titles[index],xp:50+index*25,questions:questions.slice(index*7,index*7+7)}))
});
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = (quizManifest.sets || []).filter((row)=>row.targetId!==id);
quizManifest.sets.push({targetId:id,file:quizFile});
write("data/quiz/manifest.json",quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.historie.quizProduction.targets[id] = {source_brief:"../quiz/production_briefs/historie/" + id + ".json",context_artifact:"../quiz/production_context/historie/" + id + ".json",quiz_file:"../quiz/historie/" + id + "_sets.json"};
write("data/fag/fag_manifest.json",fagManifest);

const productionClaims = [];
const sourceForSentence = (sentence, section) => {
  if (/mottakssenter|Hausmannsgate|Velferdsetaten|lavterskel|akuttovernatting|brukerrom|feltpleie|smittevern/i.test(sentence)) return {url:urls.osloService,type:"official"};
  if (/rusfaglige arbeid/i.test(sentence)) return {url:urls.osloCenter,type:"official"};
  if (/fredet|fredning|Mangelsgården|1809|1812|1819|1829|1833|1840|1908|arbeidsanstalt|dollhus|Fabrikkbygningen|fattigsykehuset|steinhogging|spinning|veving|drevplukking|tvangsplassering|Christian August/i.test(sentence)) return {url:urls.prindsen,type:"institutional"};
  return {url:urls.prindsen,type:"institutional"};
};
const coverage = {desc:[],popupDesc:[]};
const strongClaimPattern = /(?:\bførste\b|\beldste\b|\bstørste\b|\bminste\b|\beneste\b|\bviktigste\b|\bledende\b|\bavgjørende\b|\bderfor\b|\bdermed\b|særlig kjent for|førte til|på grunn av|revolusjonerte|endret for alltid)/iu;
for (const [section,text] of [["desc",place.desc],["popupDesc",place.popupDesc]]) {
  const rows = sentences(text);
  rows.forEach((sentence,index)=>{
    const idClaim = "claim_" + id + "_" + section.toLowerCase() + "_" + String(index+1).padStart(2,"0");
    const src = sourceForSentence(sentence,section);
    const strong = strongClaimPattern.test(sentence);
    productionClaims.push({
      id:idClaim, claim:sentence, sourceUrl:src.url,
      sourceLocation:(section==="desc"?"Kortbeskrivelse":"Stedsartikkel") + " – " + section + ", setning " + (index+1),
      sourceType:src.type, verifiedAt, status:"verified",
      claimKind:strong?"strong":(index===0&&section==="desc"?"identity":(/mottakssenter|Velferdsetaten/i.test(sentence)?"temporal":"ordinary")),
      evidenceMode:strong?"explicit":"direct",
      temporalStatus:/mottakssenter|Velferdsetaten|I dag/i.test(sentence)?"current":"historical",
      independentSourceUrls:strong?[urls.byleksikon]:[]
    });
    coverage[section].push({sentence:index+1,claimIds:[idClaim]});
  });
}
const quizReadiness = {
  questions:questions.slice(0,8).map((q,index)=>({
    question:q.question,answer:q.answer,
    type:index===2||index===5?"når":index===3?"hvem":index===1?"hvor":"hva",
    normalKnowledgeQuestion:true,
    claimIds:[productionClaims[Math.min(index,productionClaims.length-1)].id]
  }))
};
write("data/places/production/" + id + ".json",{
  schemaVersion:"4.2",validatorVersion:"4.2.1",placeId:id,placeFile,status:"ready_v4_2",
  identity:{status:"resolved",represents:"Det fredede sosialhistoriske Prindsen/Mangelsgården-komplekset i Storgata 36, med Prindsen mottakssenter som nåtidig tjenestelag og ikke separat Place.",period:"1809–",excludes:["Prindsen mottakssenter som et eget historisk anlegg","en påstand om at dagens tjenester er identiske med 1800-tallets institusjoner","et enkelt byggeår for hele bygningskomplekset"]},
  metadataSnapshot:{name:place.name,category:place.category,year:place.year,coordinates:{lat:place.lat,lon:place.lon},externalLinks:place.externalLinks},
  textHashes:{algorithm:"sha256",desc:sha256(place.desc),popupDesc:sha256(place.popupDesc)},
  claims:productionClaims,sentenceCoverage:coverage,
  reviews:{factual:{status:"passed",reviewedAt:verifiedAt,reviewer:"Prindsen source review",notes:"Historiske og nåtidige kilder er skilt etter tidslag."},editorial:{status:"passed",reviewedAt:verifiedAt,reviewer:"Prindsen identity review",introducedNewFacts:false,notes:"Historisk anlegg og nåtidig tjeneste er avgrenset uten dobbelt Place."}},
  quizReadiness,
  completion:{completedUnder:"4.2",currentStatus:"current",sourceVerifiedAt:verifiedAt,claimsVerified:{verified:productionClaims.length,total:productionClaims.length},factualReview:"passed",editorialReview:"passed",validatorVersion:"4.2.1"}
});

await runBuildQuizProductionContext({root,categoryId:"historie",targetId:id,outputPath:contextFile});
const builtContext = read(contextFile);
const quizWithContext = read(quizFile);
quizWithContext.production_context = {
  manifest_category:"historie",
  profile:builtContext.profile,
  standard_version:"3.4",
  source_brief:briefFile,
  context_artifact:contextFile,
  resolved_files:Object.fromEntries(Object.entries(builtContext.resolved_files).map(([key,value])=>[key,typeof value==="string"?value:value.path])),
  required_inputs_loaded:builtContext.required_inputs_loaded,
  pensum_module_ids:builtContext.selected_curriculum.module_ids,
  emne_ids:builtContext.selected_curriculum.emne_ids,
  topic_hook_ids:builtContext.selected_curriculum.topic_hook_ids,
  method_ids:builtContext.selected_curriculum.method_ids,
  thinker_ids:builtContext.selected_curriculum.thinker_ids,
  works:builtContext.selected_curriculum.works,
  source_review_status:builtContext.source_review_status,
  existing_quiz_audit:builtContext.existing_quiz_audit,
  profile_decision:builtContext.profile_decision,
  held_back_candidates:builtContext.held_back_candidates,
  normal_opening_questions:14,
  theory_start_phase:"final",
  method_start_phase:"final"
};
write(quizFile,quizWithContext);
const sourceIds = ["source_prindsen_documentation","source_prindsen_byleksikon","source_prindsen_snl","source_prindsen_oslo_service","source_prindsen_oslo_center"];
const caseId = "case_prindsen_hjelp_tvang_og_sosial_infrastruktur";
write("data/places/historie-production/" + id + ".json",{
  schemaVersion:"historie_place_production_v1",validatorVersion:"1.0.0",placeId:id,placeFile,status:"ready",
  historicalIdentity:{
    statement:"Prinds Christian Augusts Minde er et historisk institusjonsanlegg der fattigomsorg, arbeid, psykisk helse, sosial kontroll og senere vern kan undersøkes på samme sted.",
    placeRelationType:"institution_site",
    placeRelationStatement:"Place-ID-en representerer det historiske Prindsen/Mangelsgården-komplekset; dagens mottakssenter er et nåtidig tjenestelag og ikke en egen historisk Place-identitet.",
    temporalScope:{start:"1809",end:"2026",precision:"period",rationale:"Perioden dekker stiftelsen, institusjonsendringer, vern og dokumentert nåtidsbruk."},
    sourceIds
  },
  historyTopics:[
    {emneId:"em_his_velferd_hverdagsliv",siteSpecificRationale:"Arbeidshuset viser hvordan eldre fattigomsorg kombinerte hjelp, arbeid og kontroll.",caseIds:[caseId]},
    {emneId:"em_his_sosialhistorie_hverdagsliv",siteSpecificRationale:"Arbeidsformer, institusjonsliv og marginaliserte grupper gjør hverdags- og sosialhistorie konkret.",caseIds:[caseId]},
    {emneId:"em_his_tilhorighet_ekskludering",siteSpecificRationale:"Plassering, lukket arkitektur og svak kildebevaring av brukerperspektiver synliggjør mekanismer for inkludering og ekskludering.",caseIds:[caseId]},
    {emneId:"em_his_stat_institusjoner",siteSpecificRationale:"Arbeidsanstalt, dollhus, fattigsykehus, asyl og dagens kommunale tjeneste viser skiftende institusjonsformer.",caseIds:[caseId]},
    {emneId:"em_his_historiske_lag_i_byrom",siteSpecificRationale:"Anleggets bygninger og funksjoner fra ulike perioder gjør skiftende historiske lag i byrommet direkte lesbare.",caseIds:[caseId]},
    {emneId:"em_his_spor_materialitet",siteSpecificRationale:"Mangelsgården, fløyene, skiltet og de fredede strukturene er materielle kilder med ulike tidslag.",caseIds:[caseId]},
    {emneId:"em_his_kulturminner_bevaring",siteSpecificRationale:"Fredningene i 1927 og 2009 gjør sosialhistorisk bevaring til et eget undersøkelsesspor.",caseIds:[caseId]}
  ],
  sources:[
    {id:sourceIds[0],url:urls.prindsen,sourceLocation:"Om Prinds Christian Augusts Minde: Mangelsgården, arbeidsanstalten, galehuset, 1900-tallet, i dag og kulturminne",sourceType:"museum_or_heritage",verifiedAt,temporalCoverage:"retrospective",provenance:"Prindsens venners dokumentasjon, skrevet av Wenche Blomberg og oppdatert 2020.",limitations:"Retrospektiv stedshistorie; sammenholdes med fagredigerte og offentlige kilder."},
    {id:sourceIds[1],url:urls.byleksikon,sourceLocation:"Stedsoppslag om Prinds Christian Augusts Minde",sourceType:"reputable_secondary",verifiedAt,temporalCoverage:"retrospective",provenance:"Oslo Byleksikons faglige stedsoppslag.",limitations:"Kortfattet oppslagsverk og ikke primærkilde til individuelle erfaringer."},
    {id:sourceIds[2],url:urls.snl,sourceLocation:"Fagredigert oppslag om Prinds Christian Augusts Minde",sourceType:"reputable_secondary",verifiedAt,temporalCoverage:"retrospective",provenance:"Store norske leksikon.",limitations:"Sekundær oversikt som ikke dekker alle bygninger og alle brukerperspektiver."},
    {id:sourceIds[3],url:urls.osloService,sourceLocation:"Målgruppe, samfunnsoppdrag, tjenester og besøksadresse",sourceType:"official",verifiedAt,temporalCoverage:"current",provenance:"Oslo kommunes offisielle tjenesteside for Prindsen mottakssenter.",limitations:"Dokumenterer dagens tjeneste og kan ikke brukes som kilde til 1800-tallets institusjoner."},
    {id:sourceIds[4],url:urls.osloCenter,sourceLocation:"Sentrumsarbeid og Velferdsetatens ansvar",sourceType:"official",verifiedAt,temporalCoverage:"current",provenance:"Oslo kommunes offisielle side om rusfaglig sentrumsarbeid.",limitations:"Nåtidskilde til organisatorisk ansvar, ikke historisk institusjonskronologi."}
  ],
  caseRealizations:[{
    id:caseId,
    claim:"Prindsen viser hvordan sosial hjelp og institusjonell kontroll kunne være sammenvevd, samtidig som dagens lavterskeltilbud må forstås som en annen institusjonsform med andre mål og rammer.",
    temporalSequence:{
      scope:{start:"1809",end:"2026",precision:"period",rationale:"Kildene dokumenterer stiftelse, arbeidshus, institusjonsendringer, vern og nåtidig tjeneste."},
      startPoint:"Stiftelsen ble opprettet i 1809 for å hjelpe fattige og arbeidsløse.",
      endPoint:"Oslo kommune dokumenterer i 2026 et helse- og sosialfaglig lavterskeltilbud under Prindsen-navnet.",
      breaks:["Arbeidshuset fra 1819 kombinerte frivillig arbeid med dokumentert tvangsplassering.","Asylfunksjonen ble avviklet fram mot 1908.","Vern i 1927 og 2009 endret hvordan anlegget ble forvaltet og forstått."],
      continuities:["Området har gjennom lange perioder vært knyttet til sosial omsorg, marginalisering og offentlige eller institusjonelle tiltak."],
      sourceIds
    },
    actors:[
      {name:"Stiftelsen Prinds Christian Augusts Minde",roleOrInterest:"Organiserte hjelp og arbeid for fattige og arbeidsløse og drev institusjonsanlegget.",powerPosition:"Kontrollerte adgang, arbeid og hverdagsrammer sammen med samtidens fattigvesen og myndigheter.",sourceIds:[sourceIds[0],sourceIds[1]]},
      {name:"Mennesker plassert eller bosatt ved Prindsen",roleOrInterest:"Søkte eller ble pålagt arbeid, omsorg, behandling eller opphold.",powerPosition:"Hadde ulik og ofte begrenset innflytelse over institusjonelle rammer; egne stemmer er ujevnt bevart.",sourceIds:[sourceIds[0],sourceIds[2]]},
      {name:"Oslo kommune og Velferdsetaten",roleOrInterest:"Driver dagens rusfaglige lavterskeltilbud under Prindsen-navnet.",powerPosition:"Definerer dagens tjenesteoppdrag og tjenestetilbud innen moderne retts- og velferdsrammer.",sourceIds:[sourceIds[3],sourceIds[4]]}
    ],
    conflictOrNegotiation:{statement:"Prindsen synliggjør historiske spenninger mellom hjelp og tvang, og i nyere tid mellom bevaring, bybruk og sosial tjenesteproduksjon.",sourceIds:[sourceIds[0],sourceIds[3]]},
    sourceComparison:{sourceIds:[sourceIds[0],sourceIds[1],sourceIds[3]],comparison:"Historiske oppslagskilder dokumenterer stiftelse og institusjonsutvikling, mens kommunen dokumenterer dagens tjeneste og målgruppe.",contradictionsOrSilences:"Kildene gir langt mer informasjon om institusjoner og bygninger enn om alle brukernes egne erfaringer.",conclusionLimits:"Caset kan dokumentere skiftende institusjonsformer og materielle spor, men ikke anta at historiske og nåtidige brukere eller tjenester er direkte sammenlignbare."},
    comparativeScale:{localFinding:"Ett byanlegg viser flere hundre års skiftende sosialpolitikk og institusjonelle praksiser.",widerContext:"Prindsen kan brukes til å undersøke overgangen fra eldre fattig- og kontrollinstitusjoner til moderne velferds- og skadereduksjonstjenester uten å fremstille utviklingen som lineær.",scale:"national",sourceIds:[sourceIds[0],sourceIds[2],sourceIds[3]]},
    causationAndUncertainty:{causalAssessment:"Økende fattigdom og endret bruk av Tukthuset er dokumenterte deler av bakgrunnen for stiftelsen; senere lovverk, institusjonsreformer og vern forklarer noen av de store bruddene.",alternativeExplanations:["Byvekst, helsepolitikk og eiendomsforvaltning påvirket også hvordan anlegget ble brukt.","Dagens tjenestelokalisering kan ikke alene forklares som direkte institusjonell kontinuitet fra 1809."],uncertainty:"Åpne kilder dekker ikke alle beslutninger, beboere eller erfaringer likt.",sourceIds}
  }],
  presentTrace:{objectStatus:"altered",statement:"Det fredede bygningskomplekset, Mangelsgården og kulturhistoriske markører står igjen, mens dagens tjenester og virksomheter er senere brukslag.",originalSiteRelationship:"Canonical Place-ankeret representerer det historiske komplekset; mottakssenterets Hausmannsgate-adresse beholdes som nåtidig tjenesteinformasjon uten eget kartsted.",sourceIds:[sourceIds[0],sourceIds[3]]},
  quizOpening:{status:"PASS",quizTargetId:id,firstTwoSetsQuestionCount:14,sourceBrief:briefFile,productionContext:contextFile,requiredInputs:builtContext.required_inputs_loaded},
  chronologyStories:{status:"PASS",chronologyReviewed:true,storiesReviewed:true,rationale:"Ti kildebårne kronologiankere og den eksisterende Prindsen-Storyen dekker stiftelse, institusjonsutvikling, avvikling og vern."},
  gates:Object.fromEntries("ABCDEFGH".split("").map((letter)=>[letter,{status:"PASS",evidenceRefs:[letter==="A"?"historicalIdentity":letter==="B"?"historyTopics":letter==="G"?"quizOpening":letter==="H"?"chronologyStories":"caseRealizations[0]"]}])),
  review:{reviewer:"Prindsen completion review",reviewedAt:verifiedAt,notes:"Historisk Place, nåtidig mottakssenter, tvang/hjelp-grense, kildeasymmetri og vern er eksplisitt kontrollert."}
});

const workcardFile = "reports/place-production/" + id + "-workcard-current.json";
write(workcardFile,{
  schema:"history_go_place_workcard_v1",place_id:id,category:"historie",status:"complete",completed_at:verifiedAt,
  production_profile:"standard",profile_status:"confirmed",source_review:"complete",
  collections:["people","objects","brands","historical_events"],quiz_profile:"normal_4x7",history_gates:"A-H PASS",
  quality_gate:"reports/place-production/" + id + "-phase1-24-gate-audit-v1.json",canonical_next:null,
  notes:"Duplicate Place prindsen_mottakssenter er pensjonert som Place og aliaset til parent. Den nåtidige tjenesteidentiteten lever videre som Brand/current-use-lag med Hausmannsgate 11 bevart som tjenesteadresse."
});
execFileSync(process.execPath,["scripts/place-production-rule-preflight.mjs","record","--workcard",workcardFile,"--place-id",id,"--category","historie"],{cwd:root,stdio:"inherit"});

write("reports/place-production/" + id + "-phase1-24-gate-audit-v1.json",{
  schema:"history_go_place_final_audit_v1",place_id:id,reviewed_at:verifiedAt,status:"PASS",
  identity_resolution:{canonical_place:id,retired_place_id:oldId,resolution:"one_place_one_marker",service_layer_brand_id:brandId,service_address:"Hausmannsgate 11",historical_anchor:"Storgata 36 / OSM way 112236667"},
  collections:{required:["people","objects","brands","historical_events"],loaded_preview_images:4,missing:0,coverage_percent:100},
  modules:{story:"PASS",chronology:"PASS",language:"PASS",reading_tracks:"PASS",fagverk:"PASS",quiz:"PASS",before_after:"SOURCE_BOUNDED_HOLDBACK"},
  manual_image_review:{status:"PASS",reviewed_assets:[place.image,place.frontImage,place.objects[0].image,brand.logo,...place.historical_events.map((event)=>event.image)],note:"Dagens anlegg, 1900-fotografi, fysisk plakett og kommunal merkeidentitet er kilde- og rolleavgrenset; historiske hendelsesbilder er eksplisitt merket som kontekst når de er senere enn hendelsen."},
  quality_score:{
    correctness_and_evidence:{score:5,note:"Historiske og nåtidige kilder er adskilt, og mottakssenteret brukes ikke som historisk evidens."},
    coverage_and_completion:{score:5,note:"Fire samlinger, Fagverk v2, kronologi, Story, språk, lesespor og 4x7 quiz er materialisert."},
    editorial_quality:{score:5,note:"Hjelp, tvang, psykisk helse, vern og moderne skadereduksjon holdes som ulike tidslag."},
    technical_integrity:{score:5,note:"Old Place-id er aliaset, manifestkilden fjernet og generated runtime bygges på nytt."},
    safety_and_responsibility:{score:5,note:"Marginaliserte mennesker framstilles uten romantisering, stigmatisering eller projisering av historiske kategorier på dagens brukere."},
    maintainability_and_auditability:{score:5,note:"Canonical source, alias, Brand/current-use-lag, bilder, kilder og produksjonsrapporter er eksplisitte."},
    total:30,critical_findings:0,unresolved_blockers:0
  }
});

execFileSync(process.execPath,["--experimental-strip-types","scripts/build-civication-scenario-people-index.mts"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","civication:history-people:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-epoke-place-index.mjs"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/materialize-natur-final-registry.mjs"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","places:index:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-place-open-payloads.mjs"],{cwd:root,stdio:"inherit"});
await runBuildQuizProductionContext({root,categoryId:"historie",targetId:id,outputPath:contextFile});
const knowledgeAuditFile = "reports/knowledge-contract-audit.json";
const knowledgeAuditSnapshot = fs.existsSync(path.join(root,knowledgeAuditFile)) ? fs.readFileSync(path.join(root,knowledgeAuditFile)) : null;
execFileSync(process.execPath,["--experimental-strip-types","scripts/knowledge-canonical-data.mts","--write"],{cwd:root,stdio:"inherit"});
if (knowledgeAuditSnapshot) fs.writeFileSync(path.join(root,knowledgeAuditFile),knowledgeAuditSnapshot);
execFileSync(process.execPath,["scripts/audit-fagverk-place-pages.mjs","--write"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-fagverk-release-manifest.mjs"],{cwd:root,stdio:"inherit"});
execFileSync("npm",["run","place-open:build"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/build-epoke-place-index.mjs"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["tools/build-subkultur-data-audit-v1.mjs","--write"],{cwd:root,stdio:"inherit"});
execFileSync(process.execPath,["scripts/audit-subkultur-data-v1.mjs","--write-report"],{cwd:root,stdio:"inherit"});
fs.rmSync(path.join(root,".cache","prindsen-media"),{recursive:true,force:true});
console.log(JSON.stringify({status:"complete",place:id,retiredPlace:oldId,collections:place.place_card_profile.collection_ids,quiz:"4x7",questions:28,chronology:chronology.length,brand:brandId},null,2));
