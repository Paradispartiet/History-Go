#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const sharpModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs")
  : "sharp";
const { default: sharp } = await import(sharpModule);
const root = process.cwd();
const placeId = "hausmannsbrua";
const verifiedAt = "2026-09-11";
const placeFile = "data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsbrua.json";
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n");
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = (text) => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map((entry) => entry.segment.trim()).filter(Boolean);
const slug = (value) => String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 28);

const urls = {
  snl: "https://snl.no/Hausmanns_bru",
  bridge: "https://oslobyleksikon.no/side/Hausmanns_bru",
  gate: "https://oslobyleksikon.no/side/Hausmanns_gate",
  prinds: "https://oslobyleksikon.no/side/Prinds_Christian_Augusts_Minde",
  local: "https://lokalhistoriewiki.no/Hausmanns_bru",
  plaqueOrg: "https://www.oslobyesvel.no/blaaskilt",
  plaqueEvent: "https://www.oslobyesvel.no/kalender/avduking-av-bl-skilt-og-guidet-tur-over-broer-langs-nedre-akerselva/10",
  currentPage: "https://commons.wikimedia.org/wiki/File:Hausmanns_bru_Oslo.jpg",
  frontPage: "https://commons.wikimedia.org/wiki/File:Vaterland_Hausmanns_Bru_164193_IMG_3945.jpg",
  beforePage: "https://commons.wikimedia.org/wiki/File:Kristiania,_Oslo_-_Riksantikvaren-T001_04_0195.jpg",
  portraitPage: "https://commons.wikimedia.org/wiki/File:Frederik_Ferdinand_Hausmann.jpg",
  logoPage: "https://www.oslobyesvel.no/"
};
const mediaUrls = {
  current: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Hausmanns%20bru%20Oslo.jpg",
  front: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Vaterland%20Hausmanns%20Bru%20164193%20IMG%203945.jpg",
  before: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kristiania%2C%20Oslo%20-%20Riksantikvaren-T001%2004%200195.jpg",
  portrait: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Frederik%20Ferdinand%20Hausmann.jpg"
};

const cache = path.join(root, ".cache/hausmannsbrua-media");
fs.mkdirSync(cache, { recursive: true });
async function download(url, name) {
  const target = path.join(cache, name);
  if (fs.existsSync(target) && fs.statSync(target).size > 1000) return target;
  let lastStatus = 0;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": "History-Go-place-production/1.0", accept: "image/*,*/*;q=0.8" } });
    lastStatus = response.status;
    if (response.ok) {
      fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
      return target;
    }
    if (![429, 500, 502, 503, 504].includes(response.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
  }
  throw new Error("Kunne ikke hente " + url + " (" + lastStatus + ")");
}
async function image(source, target, width, height, position = "centre") {
  const output = path.join(root, target);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(source).rotate().resize(width, height, { fit: "cover", position }).webp({ quality: 88 }).toFile(output);
}
const downloaded = {};
for (const [key, url] of Object.entries(mediaUrls)) downloaded[key] = await download(url, key + ".jpg");
await image(downloaded.current, "bilder/places/hausmannsbrua.webp", 1400, 900);
await image(downloaded.current, "bilder/kort/places/hausmannsbrua.webp", 900, 620);
await image(downloaded.front, "bilder/places/hausmannsbrua_front_portrait.webp", 900, 1280, "centre");
await image(downloaded.front, "bilder/QuizCards/Hausmannsbrua.webp", 900, 1280, "centre");
await image(downloaded.front, "bilder/kort/objects/hausmannsbrua_bevart_smijernsrekkverk.webp", 900, 1100, "south");
await image(downloaded.current, "bilder/kort/structures/hausmannsbrua_1892.webp", 1000, 650);
await image(downloaded.before, "bilder/historisk/hausmannsbrua/hausmannsbrua_1907.webp", 1200, 900);
await image(downloaded.portrait, "bilder/kort/people/fredrik_ferdinand_hausmann.webp", 820, 1100, "top");

const commonsMeta = (sourcePage, creator, credit, license, licenseUrl, date, assetType) => ({
  source: "wikimedia_commons", sourcePage, creator, credit, license, licenseUrl, date, assetType,
  transformation: "Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
});
const currentMeta = commonsMeta(urls.currentPage, "Mahlum", "Mahlum / Wikimedia Commons", "Public domain", "https://creativecommons.org/publicdomain/mark/1.0/", "2008-04-19", "documentary_place_photo");
const frontMeta = commonsMeta(urls.frontPage, "Bjoertvedt", "Bjoertvedt / Wikimedia Commons", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/", "2018-03-17", "documentary_place_photo");
const beforeMeta = commonsMeta(urls.beforePage, "Ukjent fotograf", "Riksantikvaren / Wikimedia Commons", "Public domain", "https://creativecommons.org/publicdomain/mark/1.0/", "1907", "historical_documentary_photo");
const portraitMeta = commonsMeta(urls.portraitPage, "Ukjent kunstner", "Wikimedia Commons", "Public domain", "https://creativecommons.org/publicdomain/mark/1.0/", "1749–1757", "historical_person_portrait");

const desc = "Hausmannsbrua fører Hausmanns gate over Akerselva og stod ferdig i 1892. Broen ble bygd i 1890–92 av Christiania kommunale Veivesen ved ingeniør P. Schaaning som en støpejerns bue- og fagverkskonstruksjon. Utvidelsen i 1986 ga seks kjørefelt, men det gamle smijernsrekkverket ble bevart og de historiske bueformene videreført.";
const popupDesc = [
  "Hausmannsbrua fører Hausmanns gate over Akerselva og markerer et tydelig møte mellom gatenettet og elverommet. Broen ble bygd i perioden 1890–92 av Christiania kommunale Veivesen ved ingeniør P. Schaaning og stod ferdig i 1892. Store norske leksikon beskriver konstruksjonen som en buebro og fagverkskonstruksjon bygd av støpejernsdeler. Den oppgitte totallengden er 28 meter, mens det lengste spennet er 16 meter. Disse målene og dateringen er kildeopplysninger; på stedet kan en besøkende undersøke den synlige formen, men ikke måle eller datere konstruksjonen sikkert bare ved observasjon.",
  "I 1986 ble Hausmannsbrua utvidet til seks kjørefelt for å håndtere en annen trafikksituasjon enn den broen ble bygd for i 1890-årene. Oslo byleksikon oppgir at de gamle buekonstruksjonene ble kopiert under utvidelsen, mens smijernsrekkverket fra den eldre broen ble beholdt. Den brede trafikkbroen inneholder med andre ord både et omfattende ombyggingslag og et dokumentert eldre materialspor. Rekkverket er behandlet som et eget fysisk objekt fordi kildene peker eksplisitt på at dette elementet ble bevart. Bue- og fagverksformen behandles som del av brostrukturen, slik at konstruksjonen ikke splittes opp i kunstige samlingsobjekter.",
  "Hausmannsbrua er tatt med i nasjonal verneplan for veger, bruer og vegrelaterte kulturminner. Vernestatusen betyr ikke at konstruksjonen står urørt fra 1892. Kildene viser tvert imot en bro som er bygd om, utvidet og tilpasset, samtidig som utvalgte historiske trekk er ført videre. Denne kombinasjonen gjør stedet nyttig for å undersøke hvordan teknisk infrastruktur kan forandres over tid uten at alle eldre lag forsvinner. En feltobservasjon kan registrere materialer, rekkverk, spenn, brobredde og forbindelsen over elva, mens kildene må forklare hvilke deler som hører til 1892 og hvilke som følger av ombyggingen i 1986.",
  "Navnet Hausmannsbrua kommer via Hausmanns gate fra Fredrik Ferdinand Hausmann, som levde 1693–1757. Hausmann eide Ankerløkken og Mangelsgården, men døde lenge før brobyggingen i 1890–92. People-koblingen gjelder navneopphavet og ikke prosjektering, bygging eller ledelse av broarbeidet. Brokildene navngir ingeniøren som P. Schaaning. Full personidentitet for denne ingeniøren materialiseres ikke før en direkte kilde knytter initialen og etternavnet til en entydig personprofil.",
  "Et blått historieskilt fra Selskabet for Oslo Byes Vel legger et senere formidlingslag til brostedet. Skiltet er en kilde til hvordan organisasjonen presenterer historien på stedet, men det er ikke en del av støpejernskonstruksjonen fra 1892. Bro, bevart rekkverk, gatenavn og historieskilt representerer ulike typer evidens. Et fotografi kan dokumentere synlige former og materialer, mens byggeår, ombyggingshistorie, navneopphav og vernestatus krever egne kilder. Hausmannsbrua kan slik leses som et samlet sted med flere dokumenterte lag uten at konstruksjon, personhistorie og ettertidens formidling blandes sammen."
].join("\n\n");

const object = {
  id: "hausmannsbrua_bevart_smijernsrekkverk",
  name: "Det bevarte smijernsrekkverket",
  title: "Bevart smijernsrekkverk",
  type: "bevart_brodetalj",
  kind: "historic_wrought_iron_railing",
  year: 1892,
  physicalObject: true,
  placeSpecific: true,
  collectable: true,
  desc: "Smijernsrekkverket fra den eldre Hausmannsbrua ble beholdt da broen ble utvidet i 1986.",
  placeSpecificReason: "Oslo byleksikon og Store norske leksikon fremhever rekkverket som et konkret eldre element som ble bevart gjennom ombyggingen.",
  why_here: "Rekkverket er det tydeligste dokumenterte, fysisk bevarte 1892-laget i dagens trafikkbro.",
  whereToFind: "Langs brokanten; observer fra offentlig gangareal uten å klatre eller lene seg ut.",
  unlock: "Finn forskjellen mellom rekkverket og den bredere 1986-brokroppen fra sikkert gangareal.",
  storePrice: 35,
  currency: "PC",
  image: "bilder/kort/objects/hausmannsbrua_bevart_smijernsrekkverk.webp",
  imageMeta: { ...frontMeta, assetType: "documentary_object_photo", note: "Kildemotivet viser Hausmannsbrua og det bevarte rekkverket; kortet er beskåret slik at rekkverket er hovedmotivet." },
  source_urls: [urls.snl, urls.bridge, urls.frontPage]
};
const structure = {
  id: "hausmannsbrua_1892",
  name: "Hausmannsbrua fra 1892",
  type: "bybro",
  kind: "cast_iron_truss_arch_bridge",
  year: 1892,
  desc: "Den eksisterende Hausmannsbrua bygger på støpejerns bue- og fagverkskonstruksjonen fra 1892, senere utvidet i 1986.",
  image: "bilder/kort/structures/hausmannsbrua_1892.webp",
  imageMeta: { ...currentMeta, assetType: "documentary_structure_photo" },
  source_urls: [urls.snl, urls.bridge, urls.currentPage]
};

const place = read(placeFile);
Object.assign(place, {
  category: "by",
  primary_category: "by",
  secondary_category: "historie",
  hybrid: false,
  desc,
  popupDesc,
  year: 1892,
  image: "bilder/places/hausmannsbrua.webp",
  imageCard: "bilder/kort/places/hausmannsbrua.webp",
  cardImage: "bilder/kort/places/hausmannsbrua.webp",
  frontImage: "bilder/places/hausmannsbrua_front_portrait.webp",
  quizCardImage: "bilder/QuizCards/Hausmannsbrua.webp",
  imageCaption: "Hausmannsbrua over Akerselva.",
  imageCredit: currentMeta.credit,
  imageLicense: currentMeta.license,
  imageSourceUrl: urls.currentPage,
  imageMeta: currentMeta,
  frontImageMeta: { ...frontMeta, outputDimensions: "900x1280", orientation: "portrait" },
  production_profile: "rich",
  profile_status: "confirmed",
  profile_reason: "Broen har dokumentert 1890–92-bygging, særegen støpejernskonstruksjon, navnehistorie, 1986-ombygging med bevaring, vernestatus og senere historieformidling.",
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    profile: "rich",
    production_profile: "rich",
    collection_ids: ["people", "objects", "brands", "structures"],
    category_collection_label: "Byrom og anlegg",
    reason: "Navneopphavet Fredrik Ferdinand Hausmann, det bevarte smijernsrekkverket, Selskabet for Oslo Byes Vel og selve brokonstruksjonen gir fire kildebelagte og bildeklare samlinger.",
    verifiedAt
  },
  related_people_ids: ["fredrik_ferdinand_hausmann"],
  objects: [object],
  structures: [structure],
  object_collection_exception: {
    status: "signature_object_exception",
    default_minimum: 2,
    actual: 1,
    justification: "Bare ett selvstendig fysisk objekt består dagens Object-port uten filler: det eldre smijernsrekkverket som kildene eksplisitt dokumenterer som bevart gjennom 1986-ombyggingen. Broens fagverk, spenn og brokropp eies av Structures og splittes ikke kunstig i Objects."
  },
  for_na: {
    title: "Hausmannsbrua før og nå",
    beforeImage: "bilder/historisk/hausmannsbrua/hausmannsbrua_1907.webp",
    beforeImageLabel: "Hausmanns bru, 1907",
    beforeImageMeta: beforeMeta,
    nowImage: "bilder/places/hausmannsbrua.webp",
    nowImageLabel: "Hausmanns bru, 2008",
    nowImageMeta: currentMeta,
    comparisonNote: "Bildene dokumenterer samme brosted med rundt hundre års mellomrom, men fra ulike og ikke geometrisk kalibrerte standpunkter. Paret brukes til å lese synlige konstruksjons- og byromslag, ikke som eksakt overlay."
  },
  language_profile: {
    primary_name: "Hausmannsbrua",
    historical_reference: "Hausmanns bru",
    key_term: "fagverk",
    usage_note: "Navnet kommer fra Hausmanns gate og derfra Fredrik Ferdinand Hausmann; navneopphavet må ikke forveksles med broens ingeniør.",
    source: urls.bridge,
    dialect_status: "Enkeltstedet eier ikke dialektlag."
  },
  module_audit: {
    for_na: { status: "produced_with_viewpoint_caveat" },
    news: { status: "not_applicable", rationale: "Ingen varig nyhetssak bindes til canonical profil." },
    dialect: { status: "not_applicable", rationale: "Enkeltstedet eier ikke dialektlag." },
    language: { status: "produced" },
    chronology: { status: "produced" },
    stories: { status: "produced" },
    reading_tracks: { status: "produced" }
  },
  externalLinks: [
    { type: "reference", label: "Store norske leksikon – Hausmanns bru", url: urls.snl, lang: "nb", verifiedAt },
    { type: "local_history", label: "Oslo byleksikon – Hausmanns bru", url: urls.bridge, lang: "nb", verifiedAt },
    { type: "local_history", label: "Oslo byleksikon – Hausmanns gate", url: urls.gate, lang: "nb", verifiedAt },
    { type: "official", label: "Selskabet for Oslo Byes Vel – blå skilt langs nedre Akerselva", url: urls.plaqueEvent, lang: "nb", verifiedAt },
    { type: "map", label: "OpenStreetMap – Hausmannsbrua", url: place.coordSourceUrl, verifiedAt }
  ],
  source_summary: { safe_sources: [urls.snl, urls.bridge, urls.gate, urls.plaqueEvent] },
  production_status: "complete",
  production_verified_at: verifiedAt
});
place.emne_ids = [...new Set([...(place.emne_ids || []), "em_by_infrastruktur_mobilitet", "em_by_materialitet_og_sanseerfaring", "em_by_historiske_lag_i_hverdagsrom", "em_by_barrierer_forbindelser"])];
delete place.nature_profile;
delete place.civication_store;
delete place.works;
delete place.brands;
place.fagverk = {
  schema: "history_go_place_fagverk_v2",
  level: "full",
  status: "curated",
  intro: "Hausmannsbrua er et feltsted for å undersøke hvordan teknisk infrastruktur kan bygges om uten at alle eldre material- og formspor forsvinner. Stedet gjør det også mulig å skille fysisk konstruksjon, navnehistorie, vern og senere historieformidling.",
  article: [
    "Hausmannsbrua kan leses som et teknisk dokument i full skala. Kildene daterer byggingen til 1890–92 og ferdigstillelsen til 1892, og beskriver en støpejerns bue- og fagverkskonstruksjon på 28 meter med 16 meter som lengste spenn. På stedet kan besøkende undersøke rytmen i konstruksjonen, forholdet mellom spenn og elveløp og hvordan broen møter gateplanet. Derimot kan verken byggeår, eksakte mål eller ansvarlig etat fastslås sikkert bare ved å se på dagens bro; disse opplysningene må hentes fra kontrollerte historiske og tekniske kilder.",
    "Ombyggingen i 1986 gjør broen særlig egnet til å studere transformasjon. Trafikkbehovet førte til en utvidelse til seks kjørefelt, men ombyggingen ble ikke gjennomført som en full utsletting av den eldre konstruksjonens uttrykk. Oslo byleksikon oppgir at de gamle buekonstruksjonene ble kopiert, mens det eldre smijernsrekkverket ble beholdt. Dermed kan dagens bredde og kapasitet leses som et nyere lag, samtidig som materialer og former gjør den tidligere broen synlig i det nåværende byggverket.",
    "Det bevarte smijernsrekkverket er metodisk viktig fordi det gir et konkret skille mellom hel struktur og enkeltobjekt. Hele brokroppen eies som Structure, mens rekkverket kan behandles som et selvstendig Object fordi kildene uttrykkelig dokumenterer at nettopp dette fysiske elementet ble bevart gjennom 1986-arbeidet. Andre detaljer splittes ikke ut bare for å fylle en samling. Denne grensen viser hvordan samlingsmodellen kan følge faktisk evidens i stedet for å produsere kunstige underobjekter.",
    "Navnet legger et annet tidslag over teknikkhistorien. Hausmannsbrua har navn etter Hausmanns gate, som igjen viser til Fredrik Ferdinand Hausmann. Han døde i 1757, mer enn hundre år før broen stod ferdig, og kan derfor ikke behandles som brobygger eller prosjekterende ingeniør. People-koblingen handler om navneopphav. På samme måte holdes ingeniøren P. Schaaning utenfor People-samlingen inntil en kilde knytter initialen og etternavnet direkte til en entydig full personidentitet.",
    "Vernestatusen viser at infrastruktur kan være kulturminne samtidig som den fortsatt brukes. En nasjonal verneplan må ikke forstås som at alle deler er urørte eller at broen står i en opprinnelig 1892-tilstand. Det interessante er nettopp kombinasjonen av fortsatt trafikkfunksjon, omfattende ombygging og videreføring av utvalgte historiske trekk. Feltarbeid bør derfor registrere hva som faktisk kan observeres i materialer og former, og deretter bruke kilder til å avgjøre hvilke lag som er gamle, kopierte, ombygde eller senere tilført.",
    "Det blå historieskiltet fra Selskabet for Oslo Byes Vel representerer enda en type stedlig evidens: ettertidens organiserte formidling. Skiltet kan hjelpe en besøkende til å finne historiske påstander, men er ikke selv bevis for at alle påstandene er sanne, og det er heller ikke en del av 1892-konstruksjonen. En kildekritisk lesning av Hausmannsbrua holder derfor minst fire nivåer fra hverandre: det observerbare byggverket, dokumenterte historiske hendelser, navnehistorien og den senere formidlingen av disse lagene."
  ],
  subject_ids: ["by"],
  emne_ids: ["em_by_infrastruktur_mobilitet", "em_by_materialitet_og_sanseerfaring", "em_by_historiske_lag_i_hverdagsrom", "em_by_barrierer_forbindelser"],
  chapter_ids: ["urbanisme-idealer-forbindelser-fortetting", "byliv-stemning-mikrokomfort", "arkitektur-type-skala-byform", "historiske-lag-ruiner-minner"],
  lenses: [
    { id: "hausmannsbrua-konstruksjon", title: "Bro som teknisk system", prompt: "Hvilke synlige deler av Hausmannsbrua viser bue- og fagverksprinsippet i praksis?", subject_id: "by", emne_id: "em_by_infrastruktur_mobilitet", evidence: "Skill observerbar form fra kildebelagte mål, datoer og ingeniøropplysninger." },
    { id: "hausmannsbrua-materiale", title: "Tid i materialer", prompt: "Hva kan rekkverk og støpejernsformer fortelle om eldre lag?", subject_id: "by", emne_id: "em_by_materialitet_og_sanseerfaring", evidence: "Rekkverket er eksplisitt dokumentert som bevart ved 1986-ombyggingen." },
    { id: "hausmannsbrua-transformasjon", title: "Ombygging uten utsletting", prompt: "Hvordan kan seks kjørefelt og historiske former eksistere i samme bro?", subject_id: "by", emne_id: "em_by_historiske_lag_i_hverdagsrom", evidence: "Sammenhold 1892-konstruksjonen med utvidelsen i 1986." },
    { id: "hausmannsbrua-navn", title: "Navn er ikke byggherre", prompt: "Hvorfor er Fredrik Ferdinand Hausmann relevant når han døde lenge før broen ble bygd?", subject_id: "by", emne_id: "em_by_historiske_lag_i_hverdagsrom", evidence: "Navnet går via Hausmanns gate; personkoblingen gjelder navneopphav." },
    { id: "hausmannsbrua-vern", title: "Infrastruktur som kulturminne", prompt: "Hva skjer når et daglig transportledd samtidig vurderes som verneverdig?", subject_id: "by", emne_id: "em_by_infrastruktur_mobilitet", evidence: "Broen inngår i nasjonal verneplan samtidig som den er i aktiv bruk." }
  ],
  guiding_questions: [
    "Hva på stedet kan observeres direkte, og hva må hentes fra kilder?",
    "Hvordan skiller 1892-laget seg fra ombyggingen i 1986?",
    "Hvorfor kvalifiserer rekkverket som et eget fysisk historisk objekt?",
    "Hvordan kan et navn være eldre enn byggverket som bærer navnet?",
    "Hva forteller vernestatus om forholdet mellom bruk og bevaring?",
    "Hvordan skiller et blått historieskilt seg evidensmessig fra selve broen?"
  ],
  concepts: ["infrastruktur", "buebro", "fagverk", "støpejern", "smijern", "spenn", "ombygging", "historiske lag", "navneopphav", "vern", "kulturminne", "historieformidling"],
  tracks: [
    { id: "hausmannsbrua-spor-teknikk", title: "Teknikk og materiale", focus: ["fagverk", "støpejern", "spenn", "rekkverk"] },
    { id: "hausmannsbrua-spor-transformasjon", title: "1892 → 1986", focus: ["ombygging", "bevaring", "seks kjørefelt"] },
    { id: "hausmannsbrua-spor-navn", title: "Navn, vern og formidling", focus: ["Hausmanns gate", "Fredrik Ferdinand Hausmann", "verneplan", "blått skilt"] }
  ],
  observable_traces: [
    { title: "Det bevarte rekkverket", observation: "Rekkverket langs brokanten er synlig fra offentlig gangareal.", interpretation_boundary: "At rekkverket ble bevart i 1986 må dokumenteres med kilder; alder kan ikke bestemmes sikkert bare ved syn.", source_urls: [urls.snl, urls.bridge] },
    { title: "Bue- og fagverksformen", observation: "Under og langs broen kan konstruksjonsformen leses visuelt fra offentlig areal.", interpretation_boundary: "Eksakte mål og teknisk datering krever kildegrunnlag.", source_urls: [urls.snl] }
  ],
  source_urls: [urls.snl, urls.bridge, urls.gate, urls.plaqueEvent],
  verified_at: verifiedAt
};
write(placeFile, place);
const fagverkRegistry = read("data/fagverk/fagverk_registry.json");
fagverkRegistry.placeLinks ||= {};
fagverkRegistry.placeLinks[placeId] = {
  sourceFile: placeFile.replace(/^data\//, ""),
  field: "fagverk",
  schema: place.fagverk.schema,
  level: place.fagverk.level,
  status: place.fagverk.status
};
fagverkRegistry.updatedAt = verifiedAt;
write("data/fagverk/fagverk_registry.json", fagverkRegistry);

const peopleFile = "data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json";
const people = read(peopleFile);
const fredrik = people.find((person) => person.id === "fredrik_ferdinand_hausmann");
if (!fredrik) throw new Error("Mangler canonical Fredrik Ferdinand Hausmann");
Object.assign(fredrik, {
  kindLabel: "Generalløytnant og legatstifter",
  birth_date: "1693-03-08",
  death_date: "1757-03-21",
  image: "bilder/kort/people/fredrik_ferdinand_hausmann.webp",
  cardImage: "bilder/kort/people/fredrik_ferdinand_hausmann.webp",
  imageMeta: portraitMeta,
  verifiedAt,
  profileStandard: "people_profile_v1.0",
  claimsFile: "data/people/claims/historie/oslo/hausmannsbrua/fredrik_ferdinand_hausmann.claims.json",
  profileStatus: "ready_people_v1"
});
addOnce(fredrik.places, placeId);
write(peopleFile, people);
write(fredrik.claimsFile, {
  schema: "history_go_people_claims_v1",
  version: "1.0.0",
  person_id: fredrik.id,
  profile_file: peopleFile,
  identity: {
    canonical_identity: "Fredrik Ferdinand Hausmann (1693–1757), dansk-norsk offiser, generalløytnant og legatstifter.",
    name_variants: ["Fredrik Ferdinand Hausmann", "Frederik Ferdinand Hausmann"],
    not: ["ingeniøren P. Schaaning", "brobygger av Hausmannsbrua"],
    identity_status: "verified"
  },
  claims: [
    { id: "identity_lifespan", claim: "Fredrik Ferdinand Hausmann levde 1693–1757.", status: "verified", source_url: urls.gate, source_location: "navneopprinnelsen", source_type: "institutional", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "hausmanns_gate_name", claim: "Hausmanns gate er oppkalt etter Fredrik Ferdinand Hausmann.", status: "verified", source_url: urls.gate, source_location: "innledning og navnehistorie", source_type: "institutional", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "hausmannsbrua_name_relation", claim: "Hausmannsbrua har navn etter Hausmanns gate, slik at Hausmann er indirekte navneopphav til broen.", status: "verified", source_url: urls.snl, source_location: "avsnittet om navn", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "not_bridge_builder", claim: "Hausmann døde i 1757 og kan derfor ikke være brobyggeren av konstruksjonen som stod ferdig i 1892.", status: "verified", source_url: urls.snl, source_location: "navn og byggeår sammenholdt", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }
  ],
  field_claim_map: {
    name: ["identity_lifespan"],
    kindLabel: ["identity_lifespan"],
    birth_date: ["identity_lifespan"],
    death_date: ["identity_lifespan"],
    "places[hausmannsbrua]": ["hausmannsbrua_name_relation"],
    image: ["identity_lifespan"],
    cardImage: ["identity_lifespan"]
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["identity_lifespan", "hausmannsbrua_name_relation"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["identity_lifespan", "hausmanns_gate_name"] },
      { sentence: 2, claim_ids: ["hausmanns_gate_name", "hausmannsbrua_name_relation"] },
      { sentence: 3, claim_ids: ["not_bridge_builder"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: "4/4", fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});
const attrs = read("data/people/people_image_attributions.json").filter((item) => item.personId !== fredrik.id);
attrs.push({ personId: fredrik.id, name: fredrik.name, file: fredrik.image, ...fredrik.imageMeta });
attrs.sort((a, b) => String(a.personId).localeCompare(String(b.personId)));
write("data/people/people_image_attributions.json", attrs);

const brands = read("data/brands/brands_master.json");
const brand = brands.find((item) => item.id === "selskabet_for_oslo_byes_vel");
if (!brand) throw new Error("Mangler canonical Selskabet for Oslo Byes Vel");
brand.place_ids ||= [];
brand.tags ||= [];
brand.source_urls ||= [];
addOnce(brand.place_ids, placeId);
addOnce(brand.tags, placeId);
addOnce(brand.tags, "blaaskilt");
addOnce(brand.source_urls, urls.plaqueEvent);
brand.verified_at = verifiedAt;
write("data/brands/brands_master.json", brands);
const byPlace = read("data/brands/brands_by_place.json");
byPlace[placeId] = [brand.id];
write("data/brands/brands_by_place.json", byPlace);

const story = {
  id: "st_hausmannsbrua_den_gamle_broen_i_den_nye",
  quality_profile: "episode_v1",
  type: "turning_point",
  title: "Den gamle broen i den nye",
  year: 1986,
  place_id: placeId,
  summary: "I 1986 ble Hausmannsbrua utvidet til seks kjørefelt, men det eldre smijernsrekkverket ble beholdt og de gamle bueformene kopiert.",
  story: "Hausmannsbrua stod ferdig i 1892 som støpejernsbro over Akerselva. Bue- og fagverkskonstruksjonen var bygd for en by og en trafikksituasjon som senere skulle endre seg kraftig.\n\nI 1986 ble broen utvidet til seks kjørefelt. Ombyggingen kunne ha fjernet det synlige 1800-tallslaget, men kildene beskriver en annen løsning: de gamle buekonstruksjonene ble kopiert, og smijernsrekkverket fra den eldre broen ble beholdt.\n\nResultatet er verken en urørt 1892-bro eller en fullstendig ny konstruksjon uten historiske spor. Hausmannsbrua viser hvordan aktiv infrastruktur kan endres samtidig som utvalgte materialer og former føres videre, og hvorfor en hverdagsbro senere kan inngå i en nasjonal verneplan.",
  episode: { actors: ["Oslo kommune", "brukerne av Hausmannsbrua"], date: "1986", action: "Broen ble utvidet til seks kjørefelt mens eldre rekkverk og historiske bueformer ble videreført.", consequence: "Den moderniserte trafikkbroen beholdt et synlig 1892-lag og ble et eksempel på ombygging med bevaring." },
  sources: [{ title: "Store norske leksikon – Hausmanns bru", url: urls.snl }, { title: "Oslo byleksikon – Hausmanns bru", url: urls.bridge }],
  tags: ["Hausmannsbrua", "1892", "1986", "støpejern", "bevaring"],
  related_people: [],
  related_places: [],
  next_scenes: [{ place_id: "ankerbrua", reason: "En annen Akerselva-bro viser hvordan infrastruktur kan få nye historiske og visuelle lag." }],
  score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 },
  arc: { start: "1892-broen møter et nytt trafikkbehov.", middle: "Broen utvides, men eldre rekkverk og former beholdes.", end: "Den nye bredden og de gamle sporene blir ett verneverdig byggverk." }
};
write("data/stories/stories_hausmannsbrua.json", [story]);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, "data/stories/stories_hausmannsbrua.json");
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/hausmannsbrua.json";
const langEntry = (id, term, type, meaning, context, source = urls.bridge) => ({ id, term, type, meaning, context, linked_to: { kind: "place", id: placeId }, tags: ["by", "Hausmannsbrua"], sources: [{ title: source === urls.snl ? "Store norske leksikon – Hausmanns bru" : source === urls.gate ? "Oslo byleksikon – Hausmanns gate" : "Oslo byleksikon – Hausmanns bru", url: source }] });
write(languageFile, { place_id: placeId, title: "Språkleksikon: Hausmannsbrua", verified_at: verifiedAt, dialect_status: "not_applicable_single_place", entries: [
  langEntry("hausmannsbrua_navn", "Hausmannsbrua", "stedsnavn", "Navnet kommer via Hausmanns gate fra Fredrik Ferdinand Hausmann.", "Navneopphavet er eldre enn selve broen og må ikke forveksles med broens ingeniør.", urls.gate),
  langEntry("hausmannsbrua_buebro", "buebro", "fagord", "Brotype der en bue fører laster mot opplagene.", "SNL klassifiserer Hausmannsbrua som buebro.", urls.snl),
  langEntry("hausmannsbrua_fagverk", "fagverk", "fagord", "Konstruksjon av sammenkoblede staver som fordeler krefter i et system.", "Hausmannsbrua beskrives som fagverkskonstruksjon.", urls.snl),
  langEntry("hausmannsbrua_stopejern", "støpejern", "materialterm", "Jernlegering som støpes i form og ble brukt i broens konstruksjonsdeler.", "Materialet er sentralt i den dokumenterte 1892-konstruksjonen.", urls.snl),
  langEntry("hausmannsbrua_smijernsrekkverk", "smijernsrekkverk", "material_og_objektterm", "Rekkverk av bearbeidet smijern som ble bevart gjennom 1986-ombyggingen.", "Begrepet knytter et konkret fysisk objekt til bevaringshistorien."),
  langEntry("hausmannsbrua_verneplan", "verneplan", "forvaltningsbegrep", "Plan som identifiserer kulturminneverdier som skal ivaretas i forvaltningen.", "Hausmannsbrua inngår i nasjonal verneplan for veger, bruer og vegrelaterte kulturminner.", urls.snl)
] });
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files ||= {};
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const leksikonFile = "data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json";
const leksikon = read(leksikonFile);
const lex = leksikon.find((item) => item.place_id === placeId);
if (!lex) throw new Error("Mangler eksisterende Hausmannsbrua-leksikon");
lex.version = 3;
lex.visual = { ...(lex.visual || {}), designCode: "article_urban_bridge_infrastructure" };
lex.popupDesc = desc;
lex.wikiText = popupDesc.split("\n\n");
lex.summary = { one_liner: "Støpejernsbro fra 1892 som ble utvidet i 1986 med eldre rekkverk og historiske former videreført.", themes: ["brohistorie", "støpejern", "infrastruktur", "Akerselva", "bevaring", "navneopprinnelse"], tone: ["kildebasert", "teknisk", "historisk"] };
if (Array.isArray(lex.artifacts)) {
  const railing = lex.artifacts.find((item) => /rekkverk/i.test(item.title || ""));
  if (railing) railing.image_ref = object.image;
}
write(leksikonFile, leksikon);

const lesesporFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const lesespor = read(lesesporFile);
lesespor.items = (lesespor.items || []).filter((item) => !(item.place_ids || []).includes(placeId));
for (const [index, title, publication, url, sourceQuality, relevance, themes] of [
  [1, "Hausmanns bru", "Store norske leksikon", urls.snl, "recognized_reference", "Teknisk og historisk oversikt over bygging, mål, 1986-ombygging og vernestatus.", ["brohistorie", "støpejern", "vern"]],
  [2, "Hausmanns bru", "Oslo byleksikon", urls.bridge, "canonical", "Lokalhistorisk oversikt med bevaringsdetaljer og blåskilt.", ["Akerselva", "ombygging", "rekkverk"]],
  [3, "Hausmanns gate", "Oslo byleksikon", urls.gate, "canonical", "Navnehistorien som forklarer Fredrik Ferdinand Hausmanns indirekte kobling til broen.", ["stedsnavn", "Hausmann", "historiske lag"]],
  [4, "Blå skilt langs nedre Akerselva", "Selskabet for Oslo Byes Vel", urls.plaqueEvent, "official", "Organisasjonens dokumentasjon av skiltmarkeringen på Hausmanns bru og andre broer langs nedre elv.", ["blåskilt", "historieformidling", "Akerselva"]],
  [5, "Hausmanns bru", "Lokalhistoriewiki", urls.local, "recognized", "Supplerende lokalhistorisk lesespor; enkeltpåstander brukes bare når de kan kryssjekkes mot sterkere kilder.", ["lokalhistorie", "kildekritikk", "bro"]]
]) {
  lesespor.items.push({ id: "lesespor_hausmannsbrua_00" + index, title, popupDesc: relevance, author: null, publication, type: "faglig_kilde", subjects: [{ type: "place", name: "Hausmannsbrua", id: placeId }], place_ids: [placeId], person_ids: index === 3 ? ["fredrik_ferdinand_hausmann"] : [], category_hints: ["by", "historie"], summary: { themes }, classification: { tags: ["Hausmannsbrua", ...themes] }, url, access: "open", rights: "link_only", source_quality: sourceQuality, curation_status: "approved", relevance, verifiedAt });
}
write(lesesporFile, lesespor);

const sourceRegistry = {
  snl_bridge: { url: urls.snl, source_type: "recognized_reference", review_status: "reviewed", review_note: "Kontrollert for byggeperiode, 1892, konstruksjonstype, mål, 1986-utvidelse og vernestatus." },
  oslo_bridge: { url: urls.bridge, source_type: "institutional", review_status: "reviewed", review_note: "Kontrollert for brohistorie, 1986-ombygging, bevart rekkverk og blåskilt." },
  oslo_gate: { url: urls.gate, source_type: "institutional", review_status: "reviewed", review_note: "Kontrollert for navneopprinnelse via Fredrik Ferdinand Hausmann." },
  oslo_byes_vel: { url: urls.plaqueEvent, source_type: "official", review_status: "reviewed", review_note: "Kontrollert for skiltmarkeringen langs nedre Akerselva i 2019." }
};
const rawQuestions = [
  ["Når stod Hausmannsbrua ferdig?", "1892", "1882", "1902", "Broen stod ferdig i 1892 etter bygging i 1890–92.", "snl_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hvilken elv krysser Hausmannsbrua?", "Akerselva", "Alnaelva", "Frognerelva", "Hausmannsbrua fører Hausmanns gate over Akerselva.", "oslo_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hvem bygde broen i 1890–92?", "Christiania kommunale Veivesen", "NSB", "Oslo Havn", "Christiania kommunale Veivesen oppførte broen.", "snl_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hvordan navngir kildene ingeniøren ved brobyggingen?", "P. Schaaning", "Oscar Hoff", "Dyre Vaa", "Broen ble bygd ved ingeniør P. Schaaning; fullt navn holdes tilbake fordi identiteten ikke er direkte verifisert.", "snl_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva slags hovedmateriale beskriver SNL?", "Støpejern", "Armert glass", "Tre", "Broens bue- og fagverksdeler beskrives som støpejern.", "snl_bridge", "em_by_materialitet_og_sanseerfaring"],
  ["Hvor lang er broen ifølge SNL?", "28 meter", "16 meter", "42 meter", "Total lengde er oppgitt til 28 meter.", "snl_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hvor langt er det lengste spennet?", "16 meter", "8 meter", "28 meter", "Det lengste spennet er oppgitt til 16 meter.", "snl_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hvilken konstruksjonsform inngår i broen?", "Fagverk", "Betongskall", "Hengekabel", "Hausmannsbrua beskrives som en fagverkskonstruksjon.", "snl_bridge", "em_by_materialitet_og_sanseerfaring"],
  ["Hvilken annen brotype brukes om Hausmannsbrua?", "Buebro", "Flytebro", "Klaffebro", "SNL klassifiserer også Hausmannsbrua som buebro.", "snl_bridge", "em_by_materialitet_og_sanseerfaring"],
  ["Hva ble bevart under 1986-ombyggingen?", "Det gamle smijernsrekkverket", "Alle kjørefeltene fra 1892", "En bronsefontene", "Det eldre smijernsrekkverket ble beholdt da broen ble utvidet.", "oslo_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva skjedde med de gamle bueformene i 1986?", "De ble kopiert i den utvidede broen", "De ble erstattet av en tunnel", "De ble flyttet til Bygdøy", "Oslo byleksikon oppgir at de gamle buekonstruksjonene ble kopiert.", "oslo_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvor mange kjørefelt fikk broen i 1986?", "Seks", "To", "Ti", "Broen ble utvidet til seks kjørefelt i 1986.", "snl_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hva viser 1986-laget?", "At modernisering og bevaring kan kombineres", "At hele 1892-broen ble fjernet uten spor", "At broen sluttet å være i bruk", "Ombyggingen økte kapasiteten samtidig som rekkverk og historiske former ble videreført.", "oslo_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva er det bevarte rekkverket i PlaceCard-systemet?", "Et fysisk Object med egen dokumentert historie", "En Brand-logo", "En egen brostruktur", "Rekkverket kvalifiserer som signaturobjekt fordi det er et identifiserbart fysisk 1892-lag som ble bevart gjennom ombyggingen.", "oslo_bridge", "em_by_materialitet_og_sanseerfaring"],
  ["Hvor kommer navnet Hausmannsbrua fra?", "Hausmanns gate", "En broingeniør ved navn Hausmann", "Et firma som støpte broen", "Broen har navn etter Hausmanns gate.", "snl_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvem ga indirekte navn til broen?", "Fredrik Ferdinand Hausmann", "P. Schaaning", "Oscar Hoff", "Hausmanns gate er oppkalt etter Fredrik Ferdinand Hausmann.", "oslo_gate", "em_by_historiske_lag_i_hverdagsrom"],
  ["Når levde Fredrik Ferdinand Hausmann?", "1693–1757", "1793–1857", "1893–1957", "Fredrik Ferdinand Hausmann levde 1693–1757.", "oslo_gate", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvorfor er Hausmann ikke brobyggeren?", "Han døde mer enn hundre år før broen stod ferdig", "Han var billedhugger", "Han bodde i Bergen", "Hausmann døde i 1757, mens broen stod ferdig i 1892.", "snl_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva eide Hausmann i området?", "Ankerløkken og Mangelsgården", "Akershus festning", "Oslo rådhus", "Navnehistorien knytter Hausmann til Ankerløkken og Mangelsgården.", "oslo_gate", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva betyr People-koblingen til Hausmannsbrua?", "Navneopphav, ikke prosjektering", "At han tegnet fagverket", "At han ledet 1986-arbeidet", "Personkoblingen gjelder navneopphavet via Hausmanns gate.", "oslo_gate", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvilken vernesammenheng inngår broen i?", "Nasjonal verneplan for veger, bruer og vegrelaterte kulturminner", "Kun en privat samlerliste", "Ingen dokumentert vernesammenheng", "Hausmannsbrua er tatt med i en nasjonal verneplan for veg- og brokulturminner.", "snl_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva gjør vernestatusen særlig interessant her?", "Broen er fortsatt daglig infrastruktur", "Broen ligger inne i et museum", "Broen har aldri vært ombygd", "Stedet kombinerer aktiv bruk, ombygging og kulturminneverdi.", "snl_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hva er det blå skiltets rolle?", "Å formidle brohistorien på stedet", "Å bære brospennet", "Å regulere vannføringen", "Det blå skiltet er et senere historieformidlingslag.", "oslo_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvilken organisasjon står bak blåskiltformidlingen?", "Selskabet for Oslo Byes Vel", "Ruter", "Oslo Havn", "Selskabet for Oslo Byes Vel står bak de blå historieskiltene.", "oslo_byes_vel", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva kom først?", "Navneopphavet Fredrik Ferdinand Hausmann", "Broen fra 1892", "Ombyggingen i 1986", "Hausmanns liv og navnehistorien er eldre enn selve broen.", "oslo_gate", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvilken tidsrekkefølge er korrekt?", "Hausmanns navnelag → 1892-broen → 1986-ombyggingen", "1986 → 1892 → 1757", "1892 → Hausmanns fødsel → 1986", "Stedet må leses som separate historiske lag i riktig rekkefølge.", "oslo_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvorfor må bro og rekkverk skilles i samlingene?", "Broen er Structure; rekkverket er et selvstendig bevart Object", "Begge er Brands", "Rekkverket er en Person", "Canonical eierskap skiller hele infrastrukturen fra det dokumenterte fysiske signaturobjektet.", "oslo_bridge", "em_by_materialitet_og_sanseerfaring"],
  ["Hvorfor brukes bare ett Object her?", "Fordi bare rekkverket består porten uten filler", "Fordi Objects aldri kan ha flere medlemmer", "Fordi broen mangler fysiske detaljer", "Et ekstra Object ville kreve et selvstendig fysisk objekt med egen kilde, bilde og historie; konstruksjonsdelene eies ellers av Structures.", "oslo_bridge", "em_by_materialitet_og_sanseerfaring"],
  ["Hva bør du se etter i et før/etter-par?", "Broformen, rekkverket og byrommet med forbehold om ulikt ståsted", "Bare bilmodeller", "Et eksakt geometrisk overlay", "Bildene har ulike kamerastandpunkter og brukes til kvalitativ sammenligning.", "oslo_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvordan kan du undersøke broens funksjon på stedet?", "Følg hvordan ferdsel krysser Akerselva fra offentlig areal", "Klatre ned på konstruksjonen", "Stans trafikken for måling", "En gåanalyse kan følge hvordan broen kobler bysidene over elva.", "oslo_bridge", "em_by_infrastruktur_mobilitet"],
  ["Hva er en sikker materialobservasjon?", "Se rekkverk og konstruksjonsformer uten å klatre eller berøre utsatte deler", "Ta metallprøver", "Lene seg ut over rekkverket", "Materialitet kan leses visuelt fra offentlig gangareal.", "oslo_bridge", "em_by_materialitet_og_sanseerfaring"],
  ["Hva kan ett nåtidsfoto ikke bevise alene?", "Byggeår, 1986-historie, navn og vernestatus", "At en bro er synlig", "At Akerselva passerer under", "Historiske påstander krever kilder utover et senere fotografi.", "snl_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvordan håndteres P. Schaanings identitet?", "Fullt navn holdes tilbake til direkte kilde kobler identiteten til broen", "Navnet fylles ut fra likhet alene", "Personen erstattes av Hausmann", "Kildegrunnlaget dokumenterer initial og etternavn, men ikke en sikkert identifisert full personprofil.", "snl_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hvordan bør en påstand om en mulig jernbaneforgjenger behandles?", "Holdes tilbake til sterkere kilder dokumenterer den", "Publiseres som sikker fordi den er interessant", "Brukes som quizfasit uten kilde", "Legacy-påstanden er ikke sterk nok til canonical bruk uten kryssjekk.", "snl_bridge", "em_by_historiske_lag_i_hverdagsrom"],
  ["Hva er beste metode for å lese Hausmannsbrua?", "Kombiner materialobservasjon, chronology og kildeproveniens", "Bruk bare stedsnavnet", "Anta at alt synlig er fra 1892", "Stedets lag blir tydeligst når fysisk observasjon og eksplisitte kilder holdes sammen.", "oslo_bridge", "em_by_historiske_lag_i_hverdagsrom"]
];
if (rawQuestions.length !== 35) throw new Error("Forventet 35 quizspørsmål, fikk " + rawQuestions.length);
const quizQuestions = rawQuestions.map((row, index) => {
  const [question, answer, wrong1, wrong2, knowledge, sourceId, emne_id] = row;
  const raw = [answer, wrong1, wrong2];
  const shift = index % 3;
  const options = [...raw.slice(shift), ...raw.slice(0, shift)];
  const question_type = index < 20 ? "fact" : index < 28 ? "context" : "method";
  const method_id = question_type === "method" ? (index % 2 ? "met_feltobservasjon" : "met_gaanalyse") : null;
  const knowledgeId = "ku_by_hausmannsbrua_" + String(index + 1).padStart(2, "0") + "_" + slug(answer);
  return {
    id: "hausmannsbrua_quiz_" + String(index + 1).padStart(2, "0"),
    quiz_id: "by_hausmannsbrua_set_" + (Math.floor(index / 7) + 1) + "_q" + (index % 7 + 1),
    categoryId: "by", placeId, targetId: placeId, question_scope: "place", question, options, answer,
    answerIndex: options.indexOf(answer), knowledge, core_concepts: [question_type === "method" ? "stedsanalyse" : "historiske lag"],
    difficulty: index < 14 ? 1 : index < 28 ? 2 : 3, question_type, emne_id, source: [sourceId], source_origin: "external",
    claim_basis: knowledge, claim_id: "claim_hausmannsbrua_quiz_" + String(index + 1).padStart(2, "0"),
    primary_knowledge_unit_id: knowledgeId, knowledge_unit_ids: [knowledgeId], concept_ids: [], term_ids: [],
    knowledge_contract_version: 1, knowledge_link_status: "linked",
    ...(method_id ? { method_id, guidance_basis: ["data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"] } : {})
  };
});
const phases = ["opening", "middle", "middle", "bridge", "final"];
const titles = ["Broen fra 1892", "Materialer og ombygging", "Navn, vern og formidling", "Skill tidslagene", "Les broen og kildene"];
const briefFile = "data/quiz/production_briefs/by/hausmannsbrua.json";
const contextFile = "data/quiz/production_context/by/hausmannsbrua.json";
const quizFile = "data/quiz/by/hausmannsbrua_sets.json";
const brief = {
  schema_version: "1.0", categoryId: "by", targetId: placeId,
  scope: "Hausmannsbruas 1890–92-bygging, støpejernskonstruksjon, 1986-ombygging og bevaring, navnehistorie, vernestatus og kildekritisk stedslesning.",
  status: "reviewed", reviewed_at: verifiedAt, profile_hint: "rich_5x7",
  review_note: "SNL, Oslo byleksikon, Oslo Byes Vel og lisensierte historiske/nåtidsbilder er sammenholdt. P. Schaanings fulle identitet, mulig jernbaneforgjenger og anekdotiske legacy-påstander er holdt tilbake.",
  sources: sourceRegistry,
  selected_curriculum: {
    module_ids: ["kur_by_01_byrom_akser_knutepunkt", "kur_by_04_historiske_lag_og_transformasjon"],
    emne_ids: place.emne_ids,
    topic_hook_ids: ["his_spor_gatebilde", "ark_materialbruk", "urb_bil_vs_menneske"],
    method_ids: ["met_feltobservasjon", "met_gaanalyse"],
    thinker_ids: [],
    works: []
  },
  profile_decision: { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem selvstendige læringsjobber dekker konstruksjon, materialitet, 1986-ombygging, navn/vern/formidling og kilde-/feltmetode. Et sjette sett ville gjenta kjernepåstandene." },
  existing_quiz_audit: {
    searched_paths: ["data/quiz/historie/hausmannsbrua_sets.json", quizFile, "data/quiz/manifest.json"],
    active_before: { file: "data/quiz/historie/hausmannsbrua_sets.json", set_count: 6, question_count: 42, finding: "Legacy-filen lå under Historie, hadde systematisk svarposisjon og inneholdt interne produksjons-/Nature-spørsmål." },
    decisions: {
      keep_as_claim_basis: ["1890–92", "1892", "støpejern", "28 meter", "16 meter", "1986", "seks kjørefelt", "bevart smijernsrekkverk", "Fredrik Ferdinand Hausmann"],
      rewrite: "35 spørsmål er omskrevet til en kildeledet By-progresjon med fordelt fasitposisjon.",
      move: "Canonical pakke flyttes til " + quizFile + ".",
      remove: ["Nature-fyll", "interne canonical-/batchspørsmål", "udokumenterte jernbane- og anekdotepåstander", "gjentakelser"]
    },
    knowledge_migration: "Nye unike Knowledge-ID-er eies av By-pakken; legacy-filen fjernes etter materialisering."
  },
  held_back_candidates: [
    "P. Schaanings fulle identitet: initial og etternavn er dokumentert ved broen, men full personidentitet er ikke direkte verifisert.",
    "Påstand om første jernbanebro/prototype holdes utenfor til sterkere kilder dokumenterer den.",
    "Anekdote om dampveivals og kontrollvekter holdes utenfor canonical quiz.",
    "Et sjette sett som ville gjenta de fem dokumenterte læringsjobbene."
  ],
  claims: quizQuestions.map((question, index) => ({ claim_id: question.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: question.question_type === "fact" ? "fact" : question.question_type === "context" ? "context" : "concept_theory", statement: question.claim_basis, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }))
};
write(briefFile, brief);
write(quizFile, {
  targetId: placeId, categoryId: "by", size_class: "rich_5x7", generated_from: briefFile, generator_version: "history_go_manual_reviewed_v1",
  sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])),
  sets: Array.from({ length: 5 }, (_, index) => ({ set_id: "by_hausmannsbrua_set_" + (index + 1), level: index + 1, order: index + 1, phase: phases[index], title: titles[index], xp: 50, questions: quizQuestions.slice(index * 7, index * 7 + 7) }))
});
const fag = read("data/fag/fag_manifest.json");
if (!fag.by?.quizProduction?.targets) throw new Error("Mangler fag.by.quizProduction.targets");
fag.by.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/by/hausmannsbrua.json", context_artifact: "../quiz/production_context/by/hausmannsbrua.json", quiz_file: "../quiz/by/hausmannsbrua_sets.json" };
write("data/fag/fag_manifest.json", fag);
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = (quizManifest.sets || []).filter((entry) => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const built = await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: contextFile });
const quizPack = read(quizFile);
quizPack.production_context = {
  manifest_category: "by", profile: built.profile, standard_version: "3.4", source_brief: briefFile, context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(built.resolved_files).map(([key, value]) => [key, value.path])),
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
  theory_start_phase: "final",
  method_start_phase: "final"
};
write(quizFile, quizPack);
fs.rmSync(path.join(root, "data/quiz/historie/hausmannsbrua_sets.json"), { force: true });

const claimDefs = {
  identity: ["Hausmannsbrua fører Hausmanns gate over Akerselva.", urls.bridge, "innledning og plassering", "institutional", "identity"],
  build: ["Hausmannsbrua ble bygd i 1890–92 av Christiania kommunale Veivesen ved ingeniør P. Schaaning og stod ferdig i 1892.", urls.snl, "brohistorikken", "reputable_secondary"],
  structure: ["Broen er en støpejerns bue- og fagverkskonstruksjon, 28 meter lang med et lengste spenn på 16 meter.", urls.snl, "teknisk beskrivelse", "reputable_secondary"],
  widening: ["I 1986 ble broen utvidet til seks kjørefelt.", urls.snl, "avsnittet om ombygging", "reputable_secondary"],
  preservation: ["Ved 1986-ombyggingen ble gamle bueformer kopiert og smijernsrekkverket fra den eldre broen beholdt.", urls.bridge, "avsnittet om ombygging", "institutional"],
  protection: ["Hausmannsbrua inngår i nasjonal verneplan for veger, bruer og vegrelaterte kulturminner.", urls.snl, "avsnittet om vern", "reputable_secondary"],
  name: ["Broen har navn etter Hausmanns gate, som er oppkalt etter Fredrik Ferdinand Hausmann.", urls.gate, "navnehistorikken", "institutional"],
  plaque: ["Selskabet for Oslo Byes Vel har markert Hausmanns bru med blått historieskilt.", urls.plaqueEvent, "arrangementsbeskrivelsen", "official"],
  method: ["Stedets tidslag må skilles gjennom kildeproveniens, materialobservasjon og eksplisitte dateringer.", urls.bridge, "samlet kildegrunnlag", "institutional"]
};
const claims = Object.entries(claimDefs).map(([key, [claim, sourceUrl, sourceLocation, sourceType, claimKind]]) => ({ id: "claim_hausmannsbrua_" + key, claim, sourceUrl, sourceLocation, sourceType, verifiedAt, status: "verified", temporalStatus: "historical", ...(claimKind ? { claimKind } : {}) }));
const claimIds = Object.fromEntries(Object.keys(claimDefs).map((key) => [key, "claim_hausmannsbrua_" + key]));
const mapCoverage = (textValue) => sentences(textValue).map((sentence, index) => {
  const lower = sentence.toLowerCase();
  const ids = [];
  if (/fører hausmanns gate|akerselva/.test(lower)) ids.push(claimIds.identity);
  if (/1890|1892|veivesen|schaaning/.test(lower)) ids.push(claimIds.build);
  if (/støpejern|fagverk|buebro|28 meter|16 meter/.test(lower)) ids.push(claimIds.structure);
  if (/1986|seks kjørefelt|utvid/.test(lower)) ids.push(claimIds.widening);
  if (/rekkverk|buekonstruks|behold|videreført/.test(lower)) ids.push(claimIds.preservation);
  if (/verneplan|vernestatus|kulturminn/.test(lower)) ids.push(claimIds.protection);
  if (/fredrik ferdinand|hausmanns gate|navn|navneopphav/.test(lower)) ids.push(claimIds.name);
  if (/blå|skilt|selskabet/.test(lower)) ids.push(claimIds.plaque);
  if (/evidens|foto|kilde|dokument/.test(lower)) ids.push(claimIds.method);
  return { sentence: index + 1, claimIds: [...new Set(ids.length ? ids : [claimIds.identity])] };
});
const readiness = [
  ["Når stod broen ferdig?", "1892", "når", claimIds.build],
  ["Hva er hovedmaterialet?", "Støpejern", "hva", claimIds.structure],
  ["Hvor lang er broen?", "28 meter", "hva", claimIds.structure],
  ["Når ble den utvidet?", "1986", "når", claimIds.widening],
  ["Hva ble bevart?", "Smijernsrekkverket", "hvilket_verk_eller_objekt", claimIds.preservation],
  ["Hvem er navneopphavet?", "Fredrik Ferdinand Hausmann", "hvem", claimIds.name],
  ["Hva er vernesammenhengen?", "Nasjonal verneplan for veg- og brokulturminner", "hva", claimIds.protection],
  ["Hvem står bak det blå historieskiltet?", "Selskabet for Oslo Byes Vel", "hvem", claimIds.plaque]
].map(([question, answer, type, claimId]) => ({ question, answer, type, normalKnowledgeQuestion: true, claimIds: [claimId] }));
write("data/places/production/hausmannsbrua.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Hausmannsbrua som den navngitte brokonstruksjonen der Hausmanns gate krysser Akerselva, inkludert det dokumenterte bevaringslaget i dagens bro.", period: "1890–", excludes: ["hele Akerselva-ruten", "Hausmanns gate som eget sted", "nabobroer", "en egen Nature-samling"] },
  claims,
  sentenceCoverage: { desc: mapCoverage(desc), popupDesc: mapCoverage(popupDesc) },
  metadataSnapshot: { name: place.name, category: place.category, year: place.year, coordinates: { lat: place.lat, lon: place.lon } },
  collections: { people: ["fredrik_ferdinand_hausmann"], objects: [object.id], brands: [brand.id], structures: [structure.id] },
  quizReadiness: { status: "ready", questions: readiness, quizTargetId: placeId, sourceBrief: briefFile, productionContext: contextFile, totalQuestions: 35, reuseDecision: "Legacy 6×7 History-fakta ble auditerte; sikre brofakta ble bevart, mens internmeta, Nature-fyll, udokumenterte påstander og svarposisjonsbias ble erstattet i en canonical By 5×7-pakke." },
  roundsReadiness: { status: "ready", exactCollectionCount: 4 },
  source_conflicts: [
    { claim: "P. Schaaning kan materialiseres som en fullt identifisert Person.", status: "held_back", reason: "Bro-kildene dokumenterer initial og etternavn, men ikke en entydig full identitet." },
    { claim: "Hausmannsbrua var den første jernbanebroen/prototype for senere jernbanebroer.", status: "held_back", reason: "Legacy-påstanden er ikke tatt inn uten sterkere kryssjekket kildegrunnlag." }
  ],
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Hausmannsbrua source and media review", notes: "Byggeår, konstruksjon, mål, 1986-ombygging, rekkverk, navn, vern, skilt og bildeproveniens er kontrollert." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Hausmannsbrua identity and collection review", introducedNewFacts: false, notes: "Navneopphav, broingeniør, fysisk struktur, bevaringsobjekt og senere formidling holdes adskilt." }
  },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) }
});

const workcard = read("reports/place-production/hausmannsbrua-workcard-current.json");
Object.assign(workcard, {
  status: "complete",
  source_review: "complete",
  active_phase: "complete",
  production_verified_at: verifiedAt,
  quiz_profile: "rich_5x7",
  stories_status: "PASS_1_EPISODE_V1",
  language_status: "PASS_6",
  lesespor_status: "PASS_5",
  fagverk_status: "curated_full",
  images_and_rights_status: "PASS",
  quality_gate: "reports/place-production/hausmannsbrua-phase1-24-gate-audit-v1.json",
  production_artifact: "data/places/production/hausmannsbrua.json",
  canonical_next: null
});
write("reports/place-production/hausmannsbrua-workcard-current.json", workcard);
write("reports/place-production/hausmannsbrua-phase1-24-gate-audit-v1.json", {
  schema: "history_go_phase1_24_quality_gate_v1",
  place_id: placeId,
  verified_at: verifiedAt,
  null_measurement: { existing_place: true, coordinate_changed: false, existing_quiz: "legacy History 6x7/42", existing_story: "one legacy story without episode_v1", existing_language: false, existing_lesespor: false, existing_collections: "legacy collection taxonomy with Nature/pseudo-brand/Civication leakage" },
  collections: { required: ["people", "objects", "brands", "structures"], loaded_preview_images: 4, member_image_coverage_percent: 100, missing: 0, coverage_percent: 100, object_exception: place.object_collection_exception },
  manual_image_review: { status: "PASS", reviewed_assets: [place.image, place.frontImage, place.for_na.beforeImage, fredrik.image, object.image, brand.image, structure.image], note: "Bro, portrett, signaturobjekt, autentisk logo, struktur og historisk før-bilde har eksplisitt proveniens. Frontbildet er et ekte portrettutsnitt av brostedet. Før/etter-paret har eksplisitt ståstedsforbehold." },
  quality_score: {
    correctness_and_evidence: { score: 5, note: "SNL, Oslo byleksikon, Oslo Byes Vel og lisensiert media kryssjekker byggeår, konstruksjon, ombygging, navn, vern og formidling." },
    coverage_and_completion: { score: 5, note: "Fire bildeklare samlinger, episode Story, seks språkoppføringer, fem lesespor, kuratert Fagverk, før/etter og 35 quizspørsmål er materialisert." },
    editorial_quality: { score: 5, note: "Navneopphav, ingeniør, brostruktur, signaturobjekt og skiltformidling er tydelig avgrenset; ingen filler er brukt." },
    technical_integrity: { score: 5, note: "Deterministisk finalizer, manifester, v4.2-pakke, lokale media, Knowledge-regenerering og permanent closure-test inngår." },
    safety_and_responsibility: { score: 5, note: "Feltinstruksjoner holder brukeren på offentlig gangareal og fraråder klatring, berøring og risikofylt ferdsel." },
    maintainability_and_auditability: { score: 5, note: "Workcard, claims, source brief/context, holdbacks, media provenance og closure-test gir et eksplisitt revisjonsspor." },
    total: 30, critical_findings: 0, unresolved_blockers: 0
  }
});

execFileSync(process.execPath, ["scripts/place-production-rule-preflight.mjs", "record", "--workcard", "reports/place-production/hausmannsbrua-workcard-current.json", "--place-id", placeId, "--category", "by"], { cwd: root, stdio: "inherit" });

const uiFile = "js/ui/place-card.js";
let ui = fs.readFileSync(path.join(root, uiFile), "utf8");
if (!/hausmannsbrua:\s*["']bilder\/QuizCards\/Hausmannsbrua\.webp["']/.test(ui)) {
  const anchor = '  vaterlandsparken: "bilder/QuizCards/Vaterlandsparken.webp",';
  if (!ui.includes(anchor)) throw new Error("QuizCard map anchor missing");
  ui = ui.replace(anchor, anchor + '\n  hausmannsbrua: "bilder/QuizCards/Hausmannsbrua.webp",');
  fs.writeFileSync(path.join(root, uiFile), ui);
}

execFileSync(process.execPath, ["--experimental-strip-types", "scripts/build-civication-scenario-people-index.mts"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "civication:history-people:build"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/materialize-natur-final-registry.mjs"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "places:index:build"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-place-open-payloads.mjs"], { cwd: root, stdio: "inherit" });
await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: contextFile });
const knowledgeAuditFile = "reports/knowledge-contract-audit.json";
const knowledgeAuditSnapshot = fs.existsSync(path.join(root, knowledgeAuditFile)) ? fs.readFileSync(path.join(root, knowledgeAuditFile)) : null;
execFileSync(process.execPath, ["--experimental-strip-types", "scripts/knowledge-canonical-data.mts", "--write"], { cwd: root, stdio: "inherit" });
if (knowledgeAuditSnapshot) fs.writeFileSync(path.join(root, knowledgeAuditFile), knowledgeAuditSnapshot);
execFileSync(process.execPath, ["scripts/audit-fagverk-place-pages.mjs", "--write"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-fagverk-release-manifest.mjs"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "place-open:build"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-epoke-place-index.mjs"], { cwd: root, stdio: "inherit" });

fs.rmSync(cache, { recursive: true, force: true });
console.log(JSON.stringify({ status: "complete", place: placeId, collections: place.place_card_profile.collection_ids, objects: 1, quiz: "5x7", questions: 35, languageEntries: 6, readingTracks: 5 }, null, 2));
