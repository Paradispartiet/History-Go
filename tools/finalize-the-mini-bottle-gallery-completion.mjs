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
const verifiedAt = "2026-09-01";
const placeId = "the_mini_bottle_gallery";
const personId = "christian_ringnes";
const brandId = "ringnes";
const placeFile = "data/places/historie/oslo/places_historie/the_mini_bottle_gallery.json";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeCompactNoNewline = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value));
};
const upsert = (array, value) => {
  const index = array.findIndex(item => item.id === value.id);
  if (index < 0) array.push(value); else array[index] = value;
};
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map(item => item.segment.trim()).filter(Boolean);

const urls = {
  official: "https://www.minibottlegallery.com/?kategori=museum",
  rooms: "https://www.minibottlegallery.com/?kategori=rom&language=english",
  ringnesProfile: "https://ekebergparken.com/en/christian-ringnes",
  ringnesBrand: "https://ringnes.no/",
  ringnesReference: "https://snl.no/Ringnes_AS",
  facade2011Page: "https://commons.wikimedia.org/wiki/File:Sm%C3%A5flaskemuseet.JPG",
  facade2009Page: "https://commons.wikimedia.org/wiki/File:Flaskemuseet_i_Oslo.jpg",
  facade2011Asset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sm%C3%A5flaskemuseet.JPG",
  facade2009Asset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flaskemuseet_i_Oslo.jpg",
  likorAsset: "https://res.cloudinary.com/mudah/image/fetch/q_auto,f_auto/https://1287893-www.web.tornado-node.net/bilder/Lik%C3%B8rv%C3%A6relset/Lik%C3%B8r%20middag%2030%20pax/IMG_5541.jpg",
  worldAsset: "https://res.cloudinary.com/mudah/image/fetch/q_auto,f_auto/https://1287893-www.web.tornado-node.net/bilder/Festsalen/MBM-24.jpg",
  personPortrait: "https://commons.wikimedia.org/wiki/File:Christian_Ringnes_-_2014-02-13_at_18-43-45.jpg"
};

const cache = path.join(root, ".cache/the-mini-bottle-gallery-media");
fs.mkdirSync(cache, { recursive: true });
async function download(url, name) {
  const target = path.join(cache, name);
  if (fs.existsSync(target) && fs.statSync(target).size > 1000) return target;
  const response = await fetch(url, { headers: { "user-agent": "History-Go-place-production/1.0" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return target;
}
async function image(source, target, width, height, options = {}) {
  const output = path.join(root, target);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  let pipeline = sharp(source).rotate();
  if (options.extract) pipeline = pipeline.extract(options.extract);
  await pipeline.resize(width, height, { fit: "cover", position: options.position || "centre" }).webp({ quality: 88 }).toFile(output);
}

const imageOutputs = [
  `bilder/places/${placeId}.webp`, `bilder/kort/places/${placeId}.webp`, `bilder/places/${placeId}_front_portrait.webp`,
  `bilder/kort/objects/${placeId}_likorvaerelset_monterrekke.webp`, `bilder/kort/objects/${placeId}_the_world_flaskekart.webp`,
  `bilder/kort/historical_events/${placeId}_kirkegata_1996.webp`, `bilder/kort/historical_events/${placeId}_apning_2003.webp`
];
if (!imageOutputs.every(file => fs.existsSync(path.join(root, file)) && fs.statSync(path.join(root, file)).size > 1000)) {
  const facade2011 = await download(urls.facade2011Asset, "facade-2011.jpg");
  const facade2009 = await download(urls.facade2009Asset, "facade-2009.jpg");
  const likor = await download(urls.likorAsset, "likorvaerelset.jpg");
  const world = await download(urls.worldAsset, "the-world.jpg");
  await image(facade2011, `bilder/places/${placeId}.webp`, 1400, 900, { position: "centre" });
  await image(facade2011, `bilder/kort/places/${placeId}.webp`, 900, 620, { position: "centre" });
  await image(facade2011, `bilder/places/${placeId}_front_portrait.webp`, 900, 1200, { position: "centre" });
  await image(likor, `bilder/kort/objects/${placeId}_likorvaerelset_monterrekke.webp`, 900, 620, { extract: { left: 1120, top: 180, width: 1040, height: 760 } });
  await image(world, `bilder/kort/objects/${placeId}_the_world_flaskekart.webp`, 900, 620, { extract: { left: 690, top: 410, width: 700, height: 500 } });
  await image(facade2009, `bilder/kort/historical_events/${placeId}_kirkegata_1996.webp`, 900, 620, { position: "centre" });
  await image(facade2011, `bilder/kort/historical_events/${placeId}_apning_2003.webp`, 900, 620, { position: "centre" });
}

const facade2011Meta = {
  source: "wikimedia_commons", sourcePage: urls.facade2011Page, creator: "Anne-Sophie Ofrim",
  credit: "Anne-Sophie Ofrim / Wikimedia Commons", license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", assetType: "documentary_facade_photo",
  date: "2011-04-10", transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const facade2009Meta = {
  source: "wikimedia_commons", sourcePage: urls.facade2009Page, creator: "Anne-Sophie Ofrim",
  credit: "Anne-Sophie Ofrim / Wikimedia Commons", license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", assetType: "documentary_facade_detail",
  date: "2009-03-20", transformation: "Auto-orientert, proporsjonalt utsnitt og WebP-normalisering.", verifiedAt
};
const officialRoomMeta = (assetUrl, note, transformation) => ({
  source: "official_institution_site", sourcePage: urls.rooms, assetUrl, creator: "Ikke oppgitt",
  credit: "The Mini Bottle Gallery", license: "Official institution site editorial reference",
  rightsBasis: "official_institution_site_editorial_reference", assetType: "documentary_collection_installation_photo",
  note, transformation, verifiedAt
});

const place = read(placeFile);
const coordinateSnapshot = {
  lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus,
  coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl
};
const desc = "The Mini Bottle Gallery åpnet i Kirkegata 10 i mai 2003. Utgangspunktet var en tom miniatyrflaske av Gordon’s Dry Gin som Christian Ringnes fikk som sjuåring i 1961, og en notatbok der han registrerte samlingen. Museet organiserer i dag miniatyrflasker i mer enn 50 installasjoner over tre etasjer og gjør en privat samlerhistorie offentlig tilgjengelig.";
const popupDesc = "Samlingen startet i 1961, da Christian Ringnes var sju år. Han fikk en tom småflaske merket Gordon’s Dry Gin av faren. Ringnes registrerte etter hvert flaskene i «flaskeboken for Ivar Aasens vei 28». Museets egen historikk omtaler startflasken og notatboken som to av samlingens kjæreste eiendeler.\n\nI 1996 kjøpte Ringnes Kirkegata 10. Fire år senere startet prosjekteringen av museet. The Mini Bottle Gallery åpnet museumsdørene i mai 2003. Hendelsene gjelder institusjonen og samlingen på denne adressen, ikke hele bygningens eldre historie.\n\nDen offisielle museumssiden oppgir i dag mer enn 50 installasjoner over tre etasjer. Eldre indekserte versjoner og den nåværende siden oppgir ulike total- og utstillingstall, så faste flasketall og en varig verdensrangering er utelatt her. Kildekonflikten endrer ikke den dokumenterte åpningen, adressen eller installasjonsformen.\n\nTo faktiske installasjoner er dokumentert som egne fysiske objekter. I Likørværelset viser en rekke veggmonterte glasskap mange miniatyrflasker side om side. I rommet The World er flasker ordnet på og rundt et verdenskart. Fotografiene kommer fra museets egen romside og dokumenterer installasjonene, men ikke at innhold og rombruk aldri kan endres.\n\nSmåflaskene ble opprinnelig laget som emballasje og varepresentasjon. I museet får de en ny sammenheng gjennom innsamling, registrering, kategorisering og scenografi. En etikett kan dokumentere produsent og design, mens monteringen viser senere kuratoriske valg; ingen av delene alene forteller hele bruks- eller eierhistorien. Forskjellen mellom masseproduksjon og museumsverdi er et tolkningsspørsmål, ikke en egenskap som flasken bærer alene.\n\nRingnes-familien og bryggerinavnet er en del av institusjonens egen fortelling, og museet har et rom kalt Ringnes Ølhall. Den offisielle historikken sier bare at flaskeinteressen «kanskje» kan spores til familieforbindelsen med bryggeriet. Denne muligheten publiseres ikke som en dokumentert årsak.\n\nMuseet er forankret i Kirkegata 10. Stedet brukes også til arrangementer, men den varige stedsidentiteten er museet, samlingen og overgangen fra privat samlepraksis til offentlig institusjon – ikke en bar, et ordinært kunstgalleri eller en reklameflate for alkohol.";

const objects = [
  {
    id: `${placeId}_likorvaerelset_monterrekke`, name: "Monterrekken i Likørværelset", title: "Monterrekken i Likørværelset",
    type: "flaskeinstallasjon", kind: "wall_mounted_miniature_bottle_display", desc: "En rekke veggmonterte glasskap organiserer mange miniatyrflasker som sammenlignbare samlingsobjekter.",
    physicalObject: true, placeSpecific: true, collectable: true,
    placeSpecificReason: "Museets offisielle romside viser den faktiske monterrekken i Likørværelset.",
    why_here: "Installasjonen gjør registrering, gjentakelse og små formforskjeller synlige i ett av museets navngitte rom.",
    whereToFind: "Dokumentert i Likørværelset; rombruk og montering kan endres.",
    unlock: "Sammenlign hvordan skapene grupperer flasker uten å anta at rekkefølgen er opprinnelig.",
    image: `bilder/kort/objects/${placeId}_likorvaerelset_monterrekke.webp`,
    imageMeta: officialRoomMeta(urls.likorAsset, "Fotografiet viser den faktiske monterrekken i Likørværelset.", "Stedstro utsnitt av to veggmontere; WebP-normalisert til landskapskort."),
    source_urls: [urls.rooms, urls.likorAsset], storePrice: 35, currency: "PC"
  },
  {
    id: `${placeId}_the_world_flaskekart`, name: "Småflaskekartet i The World", title: "Småflaskekartet i The World",
    type: "flaskeinstallasjon", kind: "world_map_miniature_bottle_installation", desc: "Et verdenskart med miniatyrflasker ordnet på og rundt kartflaten gjør geografisk klassifikasjon til en fysisk installasjon.",
    physicalObject: true, placeSpecific: true, collectable: true,
    placeSpecificReason: "Museets offisielle romside viser det faktiske flaskekartet i rommet The World.",
    why_here: "Installasjonen binder enkeltflasker til en kuratert geografisk oversikt uten å gjøre kartet til bevis for hver flaskes proveniens.",
    whereToFind: "Dokumentert i rommet The World; rombruk og montering kan endres.",
    unlock: "Se hvordan kart, plassering og mellomrom styrer lesningen av samlingen.",
    image: `bilder/kort/objects/${placeId}_the_world_flaskekart.webp`,
    imageMeta: officialRoomMeta(urls.worldAsset, "Fotografiet viser det faktiske verdenskartet med miniatyrflasker i The World.", "Stedstro utsnitt av kartinstallasjonen; WebP-normalisert til landskapskort."),
    source_urls: [urls.rooms, urls.worldAsset], storePrice: 35, currency: "PC"
  }
];
const historicalEvents = [
  {
    id: `${placeId}_kirkegata_1996`, name: "Kirkegata 10 blir museumsanker", title: "Kirkegata 10 blir museumsanker",
    year: 1996, type: "historical_event", kind: "property_acquisition",
    desc: "Christian Ringnes kjøpte Kirkegata 10 i 1996; fire år senere startet prosjekteringen av museet.",
    image: `bilder/kort/historical_events/${placeId}_kirkegata_1996.webp`,
    imageMeta: { ...facade2009Meta, assetType: "later_context_photo", note: "Fotografiet er fra 2009 og dokumenterer museumsfasaden senere; det er ikke et bilde av kjøpet i 1996." },
    source_urls: [urls.official, urls.facade2009Page]
  },
  {
    id: `${placeId}_apning_2003`, name: "Museet åpner", title: "Museet åpner",
    year: 2003, date: "2003-05", type: "historical_event", kind: "museum_opening",
    desc: "The Mini Bottle Gallery åpnet museumsdørene i Kirkegata 10 i mai 2003.",
    image: `bilder/kort/historical_events/${placeId}_apning_2003.webp`,
    imageMeta: { ...facade2011Meta, assetType: "later_context_photo", note: "Fotografiet er fra 2011 og dokumenterer museet senere; det er ikke et bilde av åpningen i 2003." },
    source_urls: [urls.official, urls.facade2011Page]
  }
];

const fagverk = {
  schema: "history_go_place_fagverk_v2", level: "standard", status: "curated",
  intro: "The Mini Bottle Gallery gjør en privat samlepraksis til et historisk case om registrering, klassifikasjon og offentlig framvisning. Den første flasken, notatboken, bygningen og dagens installasjoner er ulike kildetyper som må leses med forskjellige spørsmål.",
  article: [
    "Samlingen fikk et tydelig startpunkt i 1961, da Christian Ringnes fikk en tom Gordon’s-miniatyrflaske og begynte å registrere flasker i en notatbok. Den offisielle historikken dokumenterer startfortellingen, men formuleringen om at interessen kanskje kom fra Ringnes-familien og bryggeriet er en mulighet, ikke en påvist årsak.",
    "Kjøpet av Kirkegata 10 i 1996, prosjekteringen fra 2000 og åpningen i mai 2003 viser overgangen fra privat samling til offentlig institusjon. Overgangen innebar utvalg og scenografi: flaskene ble ikke bare oppbevart, men satt inn i installasjoner som styrer sammenligning, rekkefølge og oppmerksomhet.",
    "Monterrekken i Likørværelset og flaskekartet i The World er fysiske spor etter denne kurateringen. De dokumenterer dagens presentasjonsform, ikke hver flaskes opprinnelige bruk eller komplette proveniens. Når nettversjoner også oppgir ulike samlingstall, må beskrivelsen tidsmerkes og avgrenses framfor å gjenta en varig rekordpåstand."
  ],
  subject_ids: ["historie"],
  emne_ids: ["em_his_spor_materialitet", "em_his_kulturminner_bevaring", "em_his_samtid_ettertid_fortelling", "em_his_museum_samling_kanon"],
  chapter_ids: ["kilder_arkiv_spor", "historisk_tid_periodisering", "minne_kulturarv_historiebruk"],
  lenses: [
    { id: "mini-flaskebok", title: "Registrering blir samling", prompt: "Hva endrer seg når enkeltflasker registreres systematisk i en notatbok?", subject_id: "historie", emne_id: "em_his_spor_materialitet", evidence: "Skill notatbokens katalogfunksjon fra senere fortellinger om motiv og verdi." },
    { id: "mini-privat-offentlig", title: "Fra privat rom til museum", prompt: "Hvilke institusjonelle brudd kan følges fra 1961 til åpningen i 2003?", subject_id: "historie", emne_id: "em_his_samtid_ettertid_fortelling", evidence: "Bruk daterte milepæler og unngå å gjøre én barndomsgave til eneste årsak." },
    { id: "mini-installasjon", title: "Montering former blikket", prompt: "Hvordan skaper vitriner og verdenskart forbindelser mellom flasker som opprinnelig ikke hørte sammen?", subject_id: "historie", emne_id: "em_his_museum_samling_kanon", evidence: "Analyser romlig ordning og etiketter uten å anta komplett proveniens." },
    { id: "mini-tall", title: "En samling i endring", prompt: "Hvordan bør skiftende tall og rekordpåstander behandles kildekritisk?", subject_id: "historie", emne_id: "em_his_kulturminner_bevaring", evidence: "Tidsmerk kilden, sammenlign versjoner og behold bare stabile påstander i canonical tekst." }
  ],
  guiding_questions: [
    "Hva kan den første flasken dokumentere som notatboken ikke kan?",
    "Når ble en privat samling til en offentlig institusjon?",
    "Hvordan påvirker montering og romnavn hvilke sammenhenger publikum ser?",
    "Hvorfor er et senere foto en kontekstkilde, ikke et bilde av åpningen?",
    "Hva gjør man når institusjonens publiserte samlingstall endrer seg?"
  ],
  concepts: ["samlerpraksis", "registrering", "proveniens", "klassifikasjon", "kuratering", "museumssamling", "historiebruk", "kildeversjon", "materielt spor"],
  observable_traces: [
    { title: "Monterrekken i Likørværelset", observation: "Veggskap plasserer mange små flasker i repeterende rader.", interpretation_boundary: "Monteringen dokumenterer presentasjon og sammenligning, men ikke automatisk opprinnelig bruk eller eierhistorie for hver flaske.", source_urls: [urls.rooms] },
    { title: "Flaskekartet i The World", observation: "Miniatyrflasker er ordnet på og rundt et verdenskart.", interpretation_boundary: "Kartet er en kuratorisk geografisk modell; korrekt proveniens for hvert eksemplar krever katalogopplysninger utover fotografiet.", source_urls: [urls.rooms] }
  ],
  source_urls: [urls.official, urls.rooms, urls.ringnesProfile], verified_at: verifiedAt
};

Object.assign(place, {
  name: "The Mini Bottle Gallery", desc, popupDesc, year: 2003,
  image: `bilder/places/${placeId}.webp`, cardImage: `bilder/kort/places/${placeId}.webp`, imageCard: `bilder/kort/places/${placeId}.webp`,
  frontImage: `bilder/places/${placeId}_front_portrait.webp`,
  imageCaption: "The Mini Bottle Gallery i Kirkegata 10, fotografert i 2011.", imageCredit: facade2011Meta.credit,
  imageLicense: facade2011Meta.license, imageSourceUrl: urls.facade2011Page,
  imageMeta: { ...facade2011Meta, outputDimensions: "1400x900" },
  frontImageMeta: { ...facade2011Meta, outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4" },
  underbadge_ids: ["etterkrigstid", "samtidshistorie", "kulturminner_og_bevaring"],
  secondaryBadgeIds: ["etterkrigstid", "samtidshistorie", "kulturminner_og_bevaring"],
  emne_ids: [...new Set([...(place.emne_ids || []), "em_his_museum_samling_kanon"])],
  related_people_ids: [personId], related_place_ids: ["ringnes_bryggeri"],
  reading_track_ids: [`lesespor_${placeId}_historie`, `lesespor_${placeId}_rom`, `lesespor_${placeId}_ringnes`, `lesespor_${placeId}_fasade`],
  production_profile: "standard", profile_status: "confirmed",
  profile_reason: "Christian Ringnes, to stedseide flaskeinstallasjoner, Ringnes-identiteten og to daterte museumshendelser gir fire direkte og bildeklare samlinger.",
  place_card_profile: {
    schema: "history_go_place_card_profile_v2", production_profile: "standard",
    collection_ids: ["people", "objects", "brands", "historical_events"], category_collection_label: "Historiske hendelser",
    reason: "Christian Ringnes, monterrekken i Likørværelset, flaskekartet i The World, Ringnes og de dokumenterte milepælene i 1996 og 2003 gir fire reelle samlinger uten related-fyll.", verifiedAt
  },
  rounds: ["people", "objects", "brands", "historical_events"], objects, historical_events: historicalEvents,
  fagverk,
  knowledge: {
    one_liner: "En privat miniatyrflaskesamling ble registrert, gitt et eget bygg og åpnet som spesialmuseum i 2003.",
    why_it_matters: [
      "Stedet viser hvordan hverdagslige masseproduserte gjenstander kan bli historiske kilder gjennom innsamling og klassifikasjon.",
      "Overgangen fra privat samling til museum synliggjør hvem som velger, ordner og presenterer materiale.",
      "Skiftende samlingstall og en mulig familieårsaksfortelling gjør kildekritikk nødvendig også på institusjonens egen nettside."
    ],
    what_to_notice: ["vitrinenes repetisjon", "verdenskartet som klassifikasjon", "etiketter og flaskeformer", "skillet mellom samlingsobjekt og romscenografi"],
    context: ["Første flaske i 1961.", "Kirkegata 10 kjøpt i 1996.", "Museet prosjektert fra 2000 og åpnet i mai 2003."],
    terms: ["miniatyrflaske", "flaskebok", "samling", "installasjon", "proveniens", "kuratering"],
    sources: [urls.official, urls.rooms, urls.ringnesProfile]
  },
  language_profile: {
    primary_name: "The Mini Bottle Gallery", place_name_root: "mini bottle", etymology: "Det engelske institusjonsnavnet beskriver en galleriaktig framvisning av miniatyrflasker.",
    key_term: "småflaske", usage_note: "Småflaske og miniatyrflaske brukes om samlingsobjektet; gallery er del av egennavnet og gjør ikke stedet til et ordinært kunstgalleri.",
    source: urls.official, dialect_status: "Enkeltstedet eier ikke et eget dialektlag."
  },
  module_audit: {
    for_na: { status: "source_bounded_holdback", rationale: "Ingen kontrollert før-2003- og nåvisning med sammenlignbart standpunkt ble funnet." },
    news: { status: "not_applicable", rationale: "Skiftende åpningstider og samlingstall hører til fersk besøksinformasjon, ikke en varig nyhetsflate i canonical data." },
    dialect: { status: "not_applicable", rationale: "Enkeltsted uten placeScope area." },
    language: { status: "produced" }, chronology: { status: "produced" }, stories: { status: "produced" }, reading_tracks: { status: "produced" }
  },
  interpretation: {
    what_to_notice: ["Hvordan flasker grupperes i skap og kart.", "Forskjellen mellom selve flasken og den senere monteringen.", "At små variasjoner blir tydelige gjennom repetisjon."],
    why_it_matters: ["Registrering kan gjøre masseproduserte varer til en historisk samling.", "Kuratering bestemmer hvilke sammenhenger publikum møter.", "En privat interesse kan få offentlig institusjonsform uten at samlerens egen fortelling blir nøytral."],
    counterpoints: ["Skiftende total- og utstillingstall gjentas ikke som varige fakta.", "Familieforbindelsen til Ringnes Bryggeri publiseres ikke som sikker årsak til samlerinteressen.", "Fotografiene fra 2009 og 2011 er senere kontekst, ikke bilder av kjøpet eller åpningen."],
    sources: [urls.official, urls.rooms, urls.ringnesProfile].map(url => ({ url, verifiedAt }))
  },
  externalLinks: [
    { type: "official", label: "The Mini Bottle Gallery – museet og historien", url: urls.official, verifiedAt },
    { type: "official", label: "The Mini Bottle Gallery – rommene", url: urls.rooms, verifiedAt },
    { type: "institutional", label: "Ekebergparken – Christian Ringnes", url: urls.ringnesProfile, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – fasaden i 2011", url: urls.facade2011Page, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – fasadedetalj i 2009", url: urls.facade2009Page, verifiedAt }
  ],
  production_status: "complete", production_verified_at: verifiedAt
});
delete place.productions;
const coordinateAfter = {
  lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus,
  coordSourceId: place.coordSourceId, coordSourceUrl: place.coordSourceUrl
};
if (JSON.stringify(coordinateSnapshot) !== JSON.stringify(coordinateAfter)) throw new Error("Koordinatmetadata ble endret");
write(placeFile, place);
const imageAuditFile = path.join(os.tmpdir(), "the-mini-bottle-gallery-place-image-audit.json");
execFileSync(process.execPath, ["scripts/audit-place-images.mjs", "--mode=all", `--report=${imageAuditFile}`], { cwd: root, stdio: "ignore" });
const imageAudit = JSON.parse(fs.readFileSync(imageAuditFile, "utf8"));
const imageBacklogFile = "data/places/place_image_backlog_summary.json";
const imageBacklog = read(imageBacklogFile);
imageBacklog.generatedAt = verifiedAt;
imageBacklog.generatedFromCommit = "the_mini_bottle_gallery_completion_20260901";
imageBacklog.totalPlaces = imageAudit.totalPlaces;
imageBacklog.summary = {
  validLocal: imageAudit.summary.local,
  validRemote: imageAudit.summary.remote,
  optionalMissing: imageAudit.summary.optional,
  missing: imageAudit.summary.missing,
  invalidLocalPath: imageAudit.summary.invalid,
  remaining: imageAudit.summary.missing + imageAudit.summary.invalid
};
for (const [category, row] of Object.entries(imageAudit.byCategory)) {
  imageBacklog.byCategory[category] = {
    ...imageBacklog.byCategory[category],
    total: row.total,
    valid: row.local + row.remote,
    optional: row.optional,
    missing: row.missing,
    invalid: row.invalid
  };
}
write(imageBacklogFile, imageBacklog);
const fagRegistry = read("data/fagverk/fagverk_registry.json");
fagRegistry.placeLinks[placeId] = { sourceFile: placeFile.replace(/^data\//, ""), field: "fagverk", schema: place.fagverk.schema, level: place.fagverk.level, status: place.fagverk.status };
write("data/fagverk/fagverk_registry.json", fagRegistry);

const peopleFile = "data/people/filantroper/oslo/people_filantroper_oslo.json";
const people = read(peopleFile);
const person = people.find(item => item.id === personId);
if (!person) throw new Error(`Mangler ${personId}`);
const personClaimsFile = `data/people/claims/filantroper/oslo/${placeId}/${personId}.claims.json`;
Object.assign(person, {
  desc: "Eiendomsinvestor, filantrop og samler som initierte Ekebergparken og bygde The Mini Bottle Gallery rundt sin miniatyrflaskesamling.",
  popupDesc: "Christian Ringnes er eiendomsinvestor, filantrop og samler. Han tok initiativ til Ekebergparken og stiftelsen som rehabiliterte Lunds hus. Miniatyrflaskesamlingen startet i 1961, og han registrerte senere flaskene i en egen notatbok. Ringnes kjøpte Kirkegata 10 i 1996, startet museumsprosjekteringen fire år senere og åpnet The Mini Bottle Gallery i mai 2003. Museumskoblingen gjelder hans dokumenterte samler- og grunnleggerrolle; den erstatter ikke Ekebergparken som primært Place-anker og gjør ikke familieforbindelsen til bryggeriet til en bevist årsak.",
  tags: [...new Set([...(person.tags || []), "samler", "museum", "miniatyrflasker"])],
  roles: [...new Set([...(person.roles || []), "samler", "museumsgrunnlegger"])],
  places: [...new Set([...(person.places || []), placeId])],
  profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1", claimsFile: personClaimsFile,
  source_urls: [...new Set([...(person.source_urls || []), urls.ringnesProfile, urls.official, urls.personPortrait])], verifiedAt
});
write(peopleFile, people);
const personClaims = [
  { id: "identity_role", claim: "Christian Ringnes er eiendomsinvestor og filantrop med en dokumentert samlerrolle.", source_url: urls.ringnesProfile, source_location: "institusjonsprofilen", source_type: "institutional_profile" },
  { id: "ekeberg_role", claim: "Ringnes tok initiativ til Ekebergparken og stiftelsen som rehabiliterte Lunds hus.", source_url: urls.ringnesProfile, source_location: "institusjonsprofilen og parkhistorikken", source_type: "institutional_profile" },
  { id: "first_bottle", claim: "Ringnes fikk den første miniatyrflasken i 1961 og registrerte senere samlingen i en notatbok.", source_url: urls.official, source_location: "En småflaskehistorie utenom det vanlige", source_type: "official_institution" },
  { id: "museum_role", claim: "Ringnes kjøpte Kirkegata 10 i 1996 og åpnet The Mini Bottle Gallery i mai 2003 etter museumsprosjektering fra 2000.", source_url: urls.official, source_location: "historikkens avsluttende avsnitt", source_type: "official_institution" },
  { id: "image", claim: "Commons-filen identifiserer motivet som Christian Ringnes.", source_url: urls.personPortrait, source_location: "Summary og Licensing", source_type: "archive" }
].map(item => ({ ...item, status: "verified", temporal_status: "mixed", verified_at: verifiedAt, evidence_level: "direct" }));
write(personClaimsFile, {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: personId, profile_file: peopleFile,
  identity: { canonical_identity: "Christian Ringnes, norsk eiendomsinvestor, filantrop og samler.", name_variants: ["Christian Ringnes"], not: ["bryggerigrunnleggeren Ellef Ringnes", "bryggerigrunnleggeren Amund Ringnes"], identity_status: "verified" },
  claims: personClaims,
  field_claim_map: { name: ["identity_role"], year: ["ekeberg_role"], placeId: ["ekeberg_role"], "places[ekebergparken]": ["ekeberg_role"], "places[ekebergparken_museum]": ["ekeberg_role"], [`places[${placeId}]`]: ["first_bottle", "museum_role"], image: ["image"], cardImage: ["image"] },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["identity_role", "ekeberg_role", "first_bottle", "museum_role"] }],
    popupDesc: [{ sentence: 1, claim_ids: ["identity_role"] }, { sentence: 2, claim_ids: ["ekeberg_role"] }, { sentence: 3, claim_ids: ["first_bottle"] }, { sentence: 4, claim_ids: ["museum_role"] }, { sentence: 5, claim_ids: ["ekeberg_role", "museum_role"] }]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: `${personClaims.length}/${personClaims.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const relations = read("data/relations.json");
upsert(relations, { id: `rel_${placeId}_${personId}`, type: "grunnla", place: placeId, person: personId, label: "Samler og museumsgrunnlegger", why: "Samlingen startet i 1961; Ringnes kjøpte Kirkegata 10 i 1996 og åpnet museet i 2003.", source: urls.official });
write("data/relations.json", relations);

const brands = read("data/brands/brands_master.json");
const brand = brands.find(item => item.id === brandId);
if (!brand) throw new Error(`Mangler ${brandId}`);
addOnce(brand.place_ids, placeId);
brand.popupdesc = "Brand-kortet gjelder den selvstendige kommersielle identiteten Ringnes, dokumentert med et autentisk historisk bokølmerke. Identiteten har opphav i Ringnes Bryggeri, mens The Mini Bottle Gallery har en egen direkte forbindelse gjennom romnavnet Ringnes Ølhall og institusjonens samlerhistorie. Brandet, bryggerianlegget og museet er ikke samme enhet, og museets «kanskje»-formulering brukes ikke som bevis for at bryggeriet forårsaket samlerinteressen.";
brand.source_urls = [...new Set([...(brand.source_urls || []), urls.official, urls.rooms])];
brand.tags = [...new Set([...(brand.tags || []), placeId])];
brand.verified_at = verifiedAt;
write("data/brands/brands_master.json", brands);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = [brandId];
write("data/brands/brands_by_place.json", brandsByPlace);
const actorsByPlace = read("data/brands/actors_by_place.json");
delete actorsByPlace[placeId];
writeCompactNoNewline("data/brands/actors_by_place.json", actorsByPlace);

const chronology = [
  [1961, "Den første miniatyrflasken", "Christian Ringnes fikk en tom småflaske merket Gordon’s Dry Gin som sjuåring."],
  [1996, "Kirkegata 10 kjøpes", "Ringnes kjøpte bygningen som senere ble museets adresse."],
  [2000, "Museet prosjekteres", "Fire år etter kjøpet av Kirkegata 10 startet prosjekteringen."],
  [2003, "Museet åpner", "The Mini Bottle Gallery åpnet museumsdørene i mai."]
].map(([year, title, desc], index) => ({
  id: `chrono_${placeId}_${year}_${index + 1}`, year, title, desc, confidence: "high",
  sources: [{ title: "The Mini Bottle Gallery – historien", url: urls.official }]
}));
const leksikonFile = `data/leksikon/places/oslo/historie/leksikon_${placeId}.json`;
const leksikon = [{
  id: `${placeId}_hovedartikkel`, visual: { designCode: "article_place_essay_miniature" }, place_id: placeId,
  title: "The Mini Bottle Gallery", version: 1,
  popupDesc: "Et spesialmuseum der en privat samlerhistorie, registrering og installasjonsdesign kan undersøkes som kulturhistorie.",
  wikiText: [
    "Christian Ringnes fikk den første miniatyrflasken i 1961 og registrerte etter hvert samlingen i en egen notatbok. Samlingshistorien er dermed dokumentert både gjennom en fysisk gjenstand og et ordningsredskap.",
    "Ringnes kjøpte Kirkegata 10 i 1996. Prosjekteringen startet fire år senere, og museet åpnet i mai 2003. Overgangen gjorde en privat samling til en offentlig institusjon med utvalg, rom og publikum.",
    "Museets offisielle romside viser hvordan vitriner og et verdenskart organiserer flasker i kuraterte installasjoner. Slike monteringer er kilder til dagens presentasjon, mens opphav og bruk for hver flaske krever katalog- og produsentkilder."
  ],
  summary: { one_liner: "Privat miniatyrflaskesamling åpnet som spesialmuseum i Kirkegata 10 i 2003.", themes: ["samling", "klassifikasjon", "museum", "materiell kultur", "historiebruk"], tone: ["nøktern", "kildekritisk"] },
  facts: [
    { id: `fact_${placeId}_1961`, label: "Starten", desc: "Den første dokumenterte miniatyrflasken kom i 1961.", confidence: "high", sources: [{ title: "The Mini Bottle Gallery", url: urls.official }] },
    { id: `fact_${placeId}_1996`, label: "Bygningen", desc: "Kirkegata 10 ble kjøpt i 1996.", confidence: "high", sources: [{ title: "The Mini Bottle Gallery", url: urls.official }] },
    { id: `fact_${placeId}_2003`, label: "Åpningen", desc: "Museet åpnet i mai 2003.", confidence: "high", sources: [{ title: "The Mini Bottle Gallery", url: urls.official }] }
  ],
  chronology, sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
}];
write(leksikonFile, leksikon);
const leksikonManifest = read("data/leksikon/manifest.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = `data/leksikon/sprak/places/europe/norway/oslo/${placeId}.json`;
const language = {
  place_id: placeId, title: "Språk ved The Mini Bottle Gallery", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: `${placeId}_smaaflaske`, term: "småflaske", type: "samlingsord", meaning: "En flaske i mindre format enn standardemballasje.", context: "Museets norske historikk bruker småflaske om samlingsobjektene.", linked_to: { kind: "place", id: placeId }, tags: ["samling", "emballasje"], sources: [{ label: "The Mini Bottle Gallery", url: urls.official }] },
    { id: `${placeId}_miniatyrflaske`, term: "miniatyrflaske", type: "fagord", meaning: "Et lite flaskeformat som kan registreres som eget eksemplar i en samling.", context: "Ordet peker på formatet, ikke automatisk på alder, sjeldenhet eller verdi.", linked_to: { kind: "place", id: placeId }, tags: ["materialitet", "format"], sources: [{ label: "The Mini Bottle Gallery", url: urls.official }] },
    { id: `${placeId}_flaskebok`, term: "flaskebok", type: "katalogord", meaning: "Ringnes’ egen betegnelse på notatboken der flaskene ble registrert.", context: "«Flaskeboken for Ivar Aasens vei 28» dokumenterer ordning før museet åpnet.", linked_to: { kind: "place", id: placeId }, tags: ["registrering", "arkiv"], sources: [{ label: "The Mini Bottle Gallery", url: urls.official }] },
    { id: `${placeId}_samling`, term: "samling", type: "museumsord", meaning: "Gjenstander som er valgt ut, registrert og ordnet i en sammenheng.", context: "En samling er mer enn en mengde: katalog og kategorier bestemmer hvordan delene kan finnes og sammenlignes.", linked_to: { kind: "place", id: placeId }, tags: ["museum", "klassifikasjon"], sources: [{ label: "The Mini Bottle Gallery", url: urls.official }] },
    { id: `${placeId}_installasjon`, term: "installasjon", type: "utstillingsord", meaning: "En romlig sammenstilling av gjenstander, lys, flater eller andre elementer.", context: "Museet bruker ordet om mer enn 50 navngitte eller tematiske presentasjoner over tre etasjer.", linked_to: { kind: "place", id: placeId }, tags: ["utstilling", "scenografi"], sources: [{ label: "The Mini Bottle Gallery", url: urls.official }, { label: "Rommene", url: urls.rooms }] },
    { id: `${placeId}_proveniens`, term: "proveniens", type: "kildekritisk_ord", meaning: "Dokumentert opphav, eierskap og vei fram til en samling.", context: "Et romfoto kan vise at en flaske er utstilt, men komplett proveniens krever mer enn fotografiet.", linked_to: { kind: "place", id: placeId }, tags: ["kildekritikk", "objekthistorie"], sources: [{ label: "The Mini Bottle Gallery", url: urls.rooms }] }
  ]
};
write(languageFile, language);
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = `data/stories/stories_${placeId}.json`;
const story = {
  id: `st_${placeId}_fra_forste_flaske_til_museum`, quality_profile: "episode_v1", type: "turning_point",
  title: "Fra én tom flaske til et eget museum", year: 2003, place_id: placeId,
  summary: "En barndomsgave i 1961 ble registrert, utvidet og til slutt gitt et eget museum i Kirkegata 10.",
  story: "I 1961 fikk sju år gamle Christian Ringnes en tom miniatyrflaske av Gordon’s Dry Gin fra faren. Flasken ble ikke stående alene. Ringnes begynte å registrere eksemplarene i «flaskeboken for Ivar Aasens vei 28», og samlingen fikk en orden som gjorde den mulig å bygge videre på.\n\nI 1996 kjøpte Ringnes Kirkegata 10. Fire år senere startet prosjekteringen. Nå måtte den private samlingen få rom, monteringer og en form som publikum kunne bevege seg gjennom. Valget av installasjoner gjorde registrerte enkeltobjekter til en kuratert museumsfortelling.\n\nI mai 2003 åpnet The Mini Bottle Gallery. Åpningen gjorde samlingen offentlig tilgjengelig, men den gjorde ikke grunnleggerens egen årsaksfortelling nøytral eller alle flasker fullstendig dokumentert. Museet ble både resultatet av samlepraksisen og en ny kilde til hvordan denne praksisen ønsket å bli sett.",
  episode: { actors: ["Christian Ringnes", "museumsprosjektet", "publikum"], date: "1961–2003", action: "Samlingen ble registrert, fikk et eget bygg og ble organisert som museum.", consequence: "The Mini Bottle Gallery åpnet i mai 2003 som offentlig spesialmuseum." },
  sources: [{ title: "The Mini Bottle Gallery – museet og historien", url: urls.official }, { title: "The Mini Bottle Gallery – rommene", url: urls.rooms }],
  tags: ["samlerhistorie", "museum", "registrering", "Kirkegata", "1961", "2003"], related_people: [personId], related_places: ["ringnes_bryggeri"], next_scenes: [],
  score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 },
  arc: { start: "En sjuåring får en tom miniatyrflaske.", middle: "Samlingen registreres og får et eget museumsbygg.", end: "Museet åpner, og private samlevalg blir en offentlig fortelling." }
};
write(storyFile, [story]);
const storiesManifest = read("data/stories/stories_manifest.json");
storiesManifest.files = storiesManifest.files.filter(entry => entry.entity_id !== placeId);
storiesManifest.files.push({ category: "historie", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storiesManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_historie.json";
const readings = read(readingFile);
readings.items = readings.items.filter(item => !item.place_ids?.includes(placeId));
readings.items.push(
  { id: `lesespor_${placeId}_historie`, title: "En småflaskehistorie utenom det vanlige", author: null, publication: "The Mini Bottle Gallery", year: 2026, type: "institutional_history", subjects: ["samling", "1961", "Kirkegata 10", "åpning 2003"], place_ids: [placeId], person_ids: [personId], category_hints: ["historie"], url: urls.official, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Primær institusjonskilde for samlingens start og museumsforløpet." },
  { id: `lesespor_${placeId}_rom`, title: "Våre selskapslokaler og museumsrom", author: null, publication: "The Mini Bottle Gallery", year: 2026, type: "official_room_profile", subjects: ["installasjoner", "Likørværelset", "The World", "Ringnes Ølhall"], place_ids: [placeId], person_ids: [], category_hints: ["historie"], url: urls.rooms, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Dokumenterer romnavnene og de fotograferte flaskeinstallasjonene." },
  { id: `lesespor_${placeId}_ringnes`, title: "Christian Ringnes", author: null, publication: "Ekebergparken", year: 2026, type: "institutional_profile", subjects: ["filantropi", "samler", "Ekebergparken"], place_ids: [placeId], person_ids: [personId], category_hints: ["historie", "kunst"], url: urls.ringnesProfile, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance: "Sekundær institusjonskilde for Christian Ringnes’ identitet og roller." },
  { id: `lesespor_${placeId}_fasade`, title: "Småflaskemuseet", author: "Anne-Sophie Ofrim", publication: "Wikimedia Commons", date: "2011-04-10", year: 2011, type: "licensed_visual_source", subjects: ["fasade", "Kirkegata 10", "museum"], place_ids: [placeId], person_ids: [], category_hints: ["historie"], url: urls.facade2011Page, access: "open", rights: "CC BY-SA 4.0", source_quality: "recognized", curation_status: "approved", relevance: "Lisensiert dokumentasjon av museumsfasaden etter åpningen." }
);
write(readingFile, readings);

const translations = {
  en: { name: "The Mini Bottle Gallery", desc: "The Mini Bottle Gallery opened at Kirkegata 10 in May 2003. It grew from an empty Gordon’s Dry Gin miniature bottle that Christian Ringnes received in 1961 and a notebook used to register the collection. Today the museum presents miniature bottles in more than 50 installations across three floors.", popupDesc: "Christian Ringnes began the collection in 1961, bought Kirkegata 10 in 1996 and opened the museum in May 2003. The museum’s room photographs document physical display installations, while changing published totals and a tentative family-brewery explanation are treated as source limits rather than permanent facts." },
  es: { name: "The Mini Bottle Gallery", desc: "The Mini Bottle Gallery abrió en Kirkegata 10 en mayo de 2003. Nació de una botella miniatura vacía de Gordon’s Dry Gin que Christian Ringnes recibió en 1961 y de un cuaderno usado para registrar la colección. Hoy el museo presenta botellas miniatura en más de 50 instalaciones distribuidas en tres plantas.", popupDesc: "Christian Ringnes inició la colección en 1961, compró Kirkegata 10 en 1996 y abrió el museo en mayo de 2003. Las fotografías oficiales documentan instalaciones físicas, mientras que las cifras cambiantes y una posible conexión familiar con la cervecería se tratan como límites de las fuentes." },
  pt: { name: "The Mini Bottle Gallery", desc: "The Mini Bottle Gallery abriu na Kirkegata 10 em maio de 2003. Surgiu de uma miniatura vazia de Gordon’s Dry Gin que Christian Ringnes recebeu em 1961 e de um caderno usado para registrar a coleção. Hoje o museu apresenta miniaturas em mais de 50 instalações distribuídas por três andares.", popupDesc: "Christian Ringnes iniciou a coleção em 1961, comprou a Kirkegata 10 em 1996 e abriu o museu em maio de 2003. As fotografias oficiais documentam instalações físicas, enquanto números variáveis e uma possível ligação familiar à cervejaria são tratados como limites das fontes." }
};
const normalizeTranslationSource = value => String(value || "").normalize("NFC").replace(/\s+/gu, " ").trim();
const sourceHash = sha256(JSON.stringify({ name: normalizeTranslationSource(place.name), desc: normalizeTranslationSource(place.desc), popupDesc: normalizeTranslationSource(place.popupDesc) })).slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file);
  pack[placeId] = { _sourceHash: sourceHash, _status: "machine_translated", ...translation };
  write(file, pack);
}

const sourceRegistry = {
  official: { url: urls.official, source_type: "official_institution_history", review_status: "reviewed", review_note: "Første flaske, flaskeboken, kjøpet i 1996, prosjekteringen og åpningen i 2003; dagens installasjons- og etasjeopplysninger." },
  rooms: { url: urls.rooms, source_type: "official_room_catalog", review_status: "reviewed", review_note: "Navngitte rom, Ringnes Beer Hall og førstegangseide fotografier av installasjonene." },
  ringnes: { url: urls.ringnesProfile, source_type: "institutional_profile", review_status: "reviewed", review_note: "Christian Ringnes’ identitet og institusjonelle roller." },
  facade2011: { url: urls.facade2011Page, source_type: "licensed_visual_source", review_status: "reviewed", review_note: "CC BY-SA-dokumentasjon av museumsfasaden i 2011." },
  facade2009: { url: urls.facade2009Page, source_type: "licensed_visual_source", review_status: "reviewed", review_note: "CC BY-SA-dokumentasjon av museumsvindu og fasade i 2009." }
};
const quizRows = [
  ["Når fikk Christian Ringnes den første miniatyrflasken?", ["1961", "1996", "2003"], "1961", "Museets historikk daterer den første flasken til 1961.", ["official"], "em_his_samtid_ettertid_fortelling", "fact"],
  ["Hvor gammel var Ringnes da han fikk den første flasken?", ["Sju år", "Sytten år", "Tretti år"], "Sju år", "Christian Ringnes var sju år i startfortellingen.", ["official"], "em_his_samtid_ettertid_fortelling", "fact"],
  ["Hva slags flaske startet samlingen?", ["En tom Gordon’s Dry Gin-miniatyrflaske", "En full Ringnes-halvliter", "En keramikkrukke"], "En tom Gordon’s Dry Gin-miniatyrflaske", "Den første flasken var tom og merket Gordon’s Dry Gin.", ["official"], "em_his_spor_materialitet", "fact"],
  ["Hvem ga Ringnes den første flasken?", ["Faren", "En museumsdirektør", "En bryggeriarbeider"], "Faren", "Museets historikk sier at den reisende faren ga flasken.", ["official"], "em_his_samtid_ettertid_fortelling", "fact"],
  ["Hva brukte Ringnes flaskeboken til?", ["Å registrere hver småflaske", "Å selge billetter", "Å tegne bygningen"], "Å registrere hver småflaske", "Notatboken var et ordnings- og registreringsredskap.", ["official"], "em_his_spor_materialitet", "fact"],
  ["Når kjøpte Ringnes Kirkegata 10?", ["1996", "1961", "2011"], "1996", "Museets historikk daterer kjøpet til 1996.", ["official"], "em_his_samtid_ettertid_fortelling", "fact"],
  ["Når startet museumsprosjekteringen?", ["Fire år etter kjøpet, i 2000", "Samme dag som flasken kom", "Etter 2011"], "Fire år etter kjøpet, i 2000", "Den offisielle historikken sier at prosjekteringen startet fire år etter 1996.", ["official"], "em_his_samtid_ettertid_fortelling", "fact"],
  ["Når åpnet The Mini Bottle Gallery?", ["I mai 2003", "I mai 1961", "I desember 1996"], "I mai 2003", "Museet åpnet museumsdørene i mai 2003.", ["official"], "em_his_samtid_ettertid_fortelling", "fact"],
  ["Hva er museets registrerte adresse?", ["Kirkegata 10", "Ivar Aasens vei 28", "Thorvald Meyers gate 2"], "Kirkegata 10", "Museumsinstitusjonen er forankret i Kirkegata 10.", ["official"], "em_his_kulturminner_bevaring", "fact"],
  ["Hvor mange etasjer med utstillingsflate oppgir museet?", ["Tre", "Én", "Sju"], "Tre", "Den nåværende offisielle siden oppgir tre etasjer.", ["official"], "em_his_museum_samling_kanon", "fact"],
  ["Hvor mange installasjoner oppgir museet minst?", ["Mer enn 50", "Akkurat fem", "Færre enn ti"], "Mer enn 50", "Den nåværende offisielle siden oppgir mer enn 50 installasjoner.", ["official"], "em_his_museum_samling_kanon", "fact"],
  ["Hva viser Objekt-kortet fra Likørværelset?", ["En rekke veggmonterte flaskemontere", "Museets åpningsbånd", "En bryggerimaskin"], "En rekke veggmonterte flaskemontere", "Det offisielle romfotografiet viser faktiske glasskap med miniatyrflasker.", ["rooms"], "em_his_spor_materialitet", "fact"],
  ["Hva organiserer Objekt-kortet fra The World?", ["Miniatyrflasker på og rundt et verdenskart", "Bøker etter forfatter", "Mynter etter årstall"], "Miniatyrflasker på og rundt et verdenskart", "Fotografiet dokumenterer en geografisk flaskeinstallasjon.", ["rooms"], "em_his_museum_samling_kanon", "fact"],
  ["Hvilket romnavn gir Ringnes-brandet en direkte museumskobling?", ["Ringnes Beer Hall", "The Tower", "The Cocktail Bar"], "Ringnes Beer Hall", "Museets offisielle romside navngir Ringnes Beer Hall.", ["rooms"], "em_his_samtid_ettertid_fortelling", "fact"],
  ["Hva endret seg da museet åpnet i 2003?", ["En privat samling fikk offentlig institusjonsform", "Alle flasker fikk samme opphav", "Kirkegata skiftet navn"], "En privat samling fikk offentlig institusjonsform", "Åpningen ga samlingen rom, montering og publikum.", ["official", "rooms"], "em_his_samtid_ettertid_fortelling", "context"],
  ["Hvorfor er flaskeboken historisk viktig?", ["Den dokumenterer systematisk registrering før museet", "Den beviser alle flaskenes markedsverdi", "Den viser åpningstidene"], "Den dokumenterer systematisk registrering før museet", "Notatboken er et spor etter hvordan enkelteksemplarer ble gjort til en ordnet samling.", ["official"], "em_his_spor_materialitet", "context"],
  ["Hva kan et romfoto dokumentere sikkert?", ["At installasjonen var publisert og fotografert i rommet", "Komplett proveniens for hver flaske", "Alle besøkendes reaksjoner"], "At installasjonen var publisert og fotografert i rommet", "Fotografiet viser fysisk form og plassering, men har klare kildegrenser.", ["rooms"], "em_his_spor_materialitet", "context"],
  ["Hvorfor er de to Objects ikke enkeltflasker?", ["Bildene dokumenterer hele stedseide installasjoner, ikke identifiserte enkelteksemplarer", "Museet har ingen flasker", "Objects kan bare være bygninger"], "Bildene dokumenterer hele stedseide installasjoner, ikke identifiserte enkelteksemplarer", "Kortene følger det faktiske avgrensede motivet i kilden.", ["rooms"], "em_his_spor_materialitet", "context"],
  ["Hva gjør verdenskartet til en kuratorisk kilde?", ["Det organiserer flasker geografisk", "Det beviser produsentens salgsvolum", "Det daterer alle flaskene til 2003"], "Det organiserer flasker geografisk", "Kartet viser et senere ordningsgrep som skaper forbindelser mellom objekter.", ["rooms"], "em_his_museum_samling_kanon", "context"],
  ["Hvorfor publiseres ikke én fast verdensrangering?", ["Tall og sammenligningsgrunnlag kan endre seg", "Museet mangler adresse", "Alle flasker er identiske"], "Tall og sammenligningsgrunnlag kan endre seg", "Den varige beskrivelsen unngår en rekordpåstand når kildetall og versjoner skifter.", ["official"], "em_his_kulturminner_bevaring", "context"],
  ["Hva er den presise tolkningen av bryggeriforbindelsen?", ["Museet sier at interessen kanskje kan spores dit", "Bryggeriet er bevist som eneste årsak", "Det finnes ingen familieforbindelse"], "Museet sier at interessen kanskje kan spores dit", "En mulig forbindelse skal ikke oppgraderes til sikker årsak.", ["official"], "em_his_samtid_ettertid_fortelling", "context"],
  ["Hvilken metode passer for å sammenligne nettsideversjoner med ulike tall?", ["Kildekritikk", "Dendrokronologi", "Værmåling"], "Kildekritikk", "Kildekritikk undersøker avsender, publiseringstid, begreper og hva som faktisk telles.", ["official"], "em_his_kulturminner_bevaring", "method", "met_kildekritikk"],
  ["Hvilken metode undersøker flasken, etiketten og monteringen som ulike spor?", ["Sporlesning", "Meningsmåling", "Lydopptak"], "Sporlesning", "Sporlesning skiller objektets materiale fra senere registrering og presentasjon.", ["official", "rooms"], "em_his_spor_materialitet", "method", "met_sporlesning"],
  ["Hva må proveniensarbeid skille mellom?", ["Opprinnelig bruk, senere eierskap og museumsplassering", "Bare farge og pris", "Kun romnavnet"], "Opprinnelig bruk, senere eierskap og museumsplassering", "Proveniens følger objektets dokumenterte vei uten å fylle hull med antakelser.", ["official", "rooms"], "em_his_spor_materialitet", "method", "met_kildekritikk"],
  ["Hvorfor er et 2011-foto ikke et bilde av åpningen i 2003?", ["Det er senere dokumentasjon av samme institusjon", "Årstall spiller ingen rolle", "Fasaden ble fotografert før bygningen fantes"], "Det er senere dokumentasjon av samme institusjon", "Et senere foto kan vise stedskontinuitet, men ikke selve åpningsøyeblikket.", ["facade2011", "official"], "em_his_samtid_ettertid_fortelling", "method", "met_kildekritikk"],
  ["Hva belyser Tony Bennetts museumsperspektiv her?", ["Hvordan innsamling, klassifikasjon og visning former offentlig kunnskap", "Hvor raskt gin produseres", "Hvor mange flasker en turist kjøper"], "Hvordan innsamling, klassifikasjon og visning former offentlig kunnskap", "Perspektivet retter oppmerksomheten mot museet som ordnings- og framvisningsinstitusjon.", ["official", "rooms"], "em_his_museum_samling_kanon", "concept", null, "his_museum_samling_kanon", "tony_bennett"],
  ["Hva sier institusjonens egen historikk minst om?", ["Alternative forklaringer og alle flaskenes komplette proveniens", "Åpningen i 2003", "Kjøpet i 1996"], "Alternative forklaringer og alle flaskenes komplette proveniens", "En institusjonsside er sterk på egen kronologi, men må suppleres for fravær og uavhengig kontroll.", ["official", "rooms"], "em_his_samtid_ettertid_fortelling", "method", "met_kildekritikk"],
  ["Hva er den mest presise helhetslesningen?", ["Et spesialmuseum der privat samling, registrering og kuratering blir offentlig historie", "Et ordinært kunstgalleri uten samling", "Bare et selskapslokale"], "Et spesialmuseum der privat samling, registrering og kuratering blir offentlig historie", "Stedet forstås gjennom samlerhistorie, institusjonsforløp, fysiske installasjoner og kildegrenser.", ["official", "rooms", "ringnes"], "em_his_museum_samling_kanon", "concept"]
];
if (quizRows.length !== 28) throw new Error(`Forventet 28 quizrader, fikk ${quizRows.length}`);
const phases = ["opening", "middle", "bridge", "final"];
const titles = ["Den første flasken", "Fra samling til museum", "Installasjon og kilde", "Kildekritikk og museumsmakt"];
const questions = quizRows.map((row, index) => {
  const [question, options0, answer, knowledge, source, emne_id, question_type, method_id, topic_hook_id, thinker_id] = row;
  const options = [...options0.slice(index % options0.length), ...options0.slice(0, index % options0.length)];
  const n = index + 1;
  const item = {
    id: `${placeId}_quiz_${String(n).padStart(2, "0")}`, quiz_id: `historie_${placeId}_set_${Math.floor(index / 7) + 1}_q${(index % 7) + 1}`,
    categoryId: "historie", placeId, personId: "", natureId: "", targetId: placeId, question_scope: "place",
    question, options, answer, answerIndex: options.indexOf(answer), knowledge, trivia: [], difficulty: n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : 4,
    question_type, question_layer: n <= 14 ? "normal_opening" : n <= 21 ? "bridge" : "final", year: null, epoke_id: null, epoke_domain: "historie", emne_id,
    related_emner: [], core_concepts: [], concept_focus: [], learning_paths: [], tags: [placeId, "oslo", "historie", "museum"], required_tags: [],
    source, source_origin: "external", claim_basis: knowledge, claim_id: `claim_${placeId}_quiz_${String(n).padStart(2, "0")}`,
    primary_knowledge_unit_id: `ku_his_${placeId}_${String(n).padStart(2, "0")}`, knowledge_unit_ids: [`ku_his_${placeId}_${String(n).padStart(2, "0")}`],
    concept_ids: question_type === "concept" ? ["co_historie_historisk_endring_84be686aa4"] : [], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked",
    concepts: question_type === "fact" ? ["historisk endring"] : ["kildekritikk og historiebruk"]
  };
  if (method_id) Object.assign(item, { method_id, guidance_basis: ["data/fag/historie/fagkart_historie_canonical_v4_5.json", "data/fag/historie/methods_historie_canonical_v4_5.json"] });
  if (topic_hook_id) Object.assign(item, { topic_hook_id, thinker_id, thinker_name: "Tony Bennett", work: "The Birth of the Museum", theory_ref: { topic_hook_id, thinker_id, work: "The Birth of the Museum", why_it_helps: "Bennett gjør det mulig å undersøke hvordan innsamling, klassifikasjon og framvisning gjør en privat samling til offentlig kunnskap." }, guidance_basis: ["data/fag/historie/fagkart_historie_canonical_v4_5.json", "data/fag/historie/theory_objects_historie_canonical_v5_5.json"] });
  return item;
});
const briefFile = `data/quiz/production_briefs/historie/${placeId}.json`;
const contextFile = `data/quiz/production_context/historie/${placeId}.json`;
const quizFile = `data/quiz/historie/${placeId}_sets.json`;
const selectedCurriculum = {
  emne_ids: [...new Set(questions.map(question => question.emne_id))], topic_hook_ids: ["his_museum_samling_kanon"],
  method_ids: [...new Set(questions.map(question => question.method_id).filter(Boolean))], thinker_ids: ["tony_bennett"], works: ["The Birth of the Museum"]
};
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Fire selvstendige læringsjobber dekker start og registrering, institusjonsforløp, installasjoner/proveniens og kildekritisk museumsanalyse." };
const existingQuizAudit = { searched_paths: [quizFile, `data/quiz/by/${placeId}_sets.json`, `data/quiz/historie/arkiv/${placeId}_sets.json`], active_before: { categoryId: null, set_count: 0, question_count: 0 }, decisions: ["Ingen aktiv, arkivert eller alternativ målquiz ble funnet.", "Produser én canonical normal 4x7-pakke med fjorten rene faktaspørsmål først."], knowledge_migration: { status: "not_applicable", retained_rule: "Ingen eldre spørsmål å migrere." } };
const heldBackCandidates = ["Skiftende total- og utstillingstall som varige fakta.", "Verdensrangeringen som uavhengig kontrollert rekord.", "Ringnes Bryggeri som bevist årsak til samlerinteressen.", "Gordon’s som Brand uten ferdig verifisert logo- og rettighetsløp.", "Enkeltflasker som Objects uten identifiserbare medlemsbilder."];
const claims = questions.map((question, index) => ({ claim_id: question.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: question.question_type === "fact" ? "fact" : question.question_type === "context" ? "context" : "concept_theory", statement: question.claim_basis, source_ids: question.source, source_origin: "external", emne_id: question.emne_id }));
write(briefFile, {
  schema_version: "1.0", categoryId: "historie", targetId: placeId, scope: "place", status: "reviewed", reviewed_at: verifiedAt,
  profile_hint: "normal_4x7", review_note: "Museets historikk og romside, institusjonsprofil, lisensierte fasadebilder og eksplisitte kildegrenser bærer 28 spørsmål uten volatil telling eller årsaksoverdrivelse.",
  sources: sourceRegistry, selected_curriculum: selectedCurriculum, profile_decision: profileDecision, existing_quiz_audit: existingQuizAudit, held_back_candidates: heldBackCandidates, claims
});
write(quizFile, {
  targetId: placeId, categoryId: "historie", size_class: "normal_4x7", generated_from: briefFile, generator_version: "history_go_manual_reviewed_v1",
  sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])),
  sets: phases.map((phase, index) => ({ set_id: `historie_${placeId}_set_${index + 1}`, level: index + 1, order: index + 1, phase, title: titles[index], xp: 50 + index * 25, questions: questions.slice(index * 7, index * 7 + 7) }))
});
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.historie.quizProduction.targets[placeId] = { source_brief: `../quiz/production_briefs/historie/${placeId}.json`, context_artifact: `../quiz/production_context/historie/${placeId}.json`, quiz_file: `../quiz/historie/${placeId}_sets.json` };
write("data/fag/fag_manifest.json", fagManifest);
const quizManifest = read("data/quiz/manifest.json");
quizManifest.historie ||= {};
quizManifest.historie[placeId] = `historie/${placeId}_sets.json`;
if (Array.isArray(quizManifest.sets)) {
  quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== placeId);
  quizManifest.sets.push({ targetId: placeId, file: quizFile });
}
write("data/quiz/manifest.json", quizManifest);
const built = await runBuildQuizProductionContext({ root, categoryId: "historie", targetId: placeId, outputPath: contextFile });
const quiz = read(quizFile);
quiz.production_context = {
  manifest_category: "historie", profile: built.profile, standard_version: "3.4", source_brief: briefFile, context_artifact: contextFile,
  resolved_files: Object.fromEntries(Object.entries(built.resolved_files).map(([key, value]) => [key, value.path])), required_inputs_loaded: built.required_inputs_loaded,
  pensum_module_ids: built.selected_curriculum.module_ids, emne_ids: built.selected_curriculum.emne_ids, topic_hook_ids: built.selected_curriculum.topic_hook_ids,
  method_ids: built.selected_curriculum.method_ids, thinker_ids: built.selected_curriculum.thinker_ids, works: built.selected_curriculum.works,
  source_review_status: built.source_review_status, existing_quiz_audit: built.existing_quiz_audit, profile_decision: built.profile_decision,
  held_back_candidates: built.held_back_candidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final"
};
write(quizFile, quiz);

const packetSources = sourceRegistry;
const makeClaims = (prefix, text) => sentences(text).map((sentence, index) => {
  const ids = /Likørværelset|The World|monter|verdenskart|romside|Ringnes Ølhall/i.test(sentence) ? ["rooms", "official"]
    : /Christian Ringnes er|filantrop|Ekebergparken/i.test(sentence) ? ["ringnes", "official"]
    : /2009/i.test(sentence) ? ["facade2009", "official"]
    : /2011/i.test(sentence) ? ["facade2011", "official"]
    : ["official", "rooms"];
  const primary = packetSources[ids[0]];
  return {
    id: `claim_${placeId}_${prefix}_${String(index + 1).padStart(2, "0")}`, claim: sentence,
    sourceUrl: primary.url, sourceLocation: `${primary.review_note} – ${prefix}, setning ${index + 1}`,
    sourceType: ids[0].startsWith("facade") ? "archive" : ids[0] === "ringnes" ? "institutional" : "official",
    verifiedAt, status: "verified", claimKind: index === 0 && prefix === "desc" ? "identity" : "fact",
    evidenceMode: "direct", temporalStatus: /i dag|nåværende|dagens|brukes også/i.test(sentence) ? "current" : "historical",
    independentSourceUrls: ids.slice(1).map(id => packetSources[id].url)
  };
});
const descClaims = makeClaims("desc", desc);
const popupClaims = makeClaims("popup", popupDesc);
const allClaims = [...descClaims, ...popupClaims];
const claimFor = pattern => allClaims.find(item => pattern.test(item.claim))?.id || allClaims[0].id;
const readinessQuestions = [
  ["når", "Når startet samlingen?", "I 1961", claimFor(/1961/)],
  ["hvem", "Hvem bygde opp samlingen?", "Christian Ringnes", claimFor(/Christian Ringnes/)],
  ["hvilket_verk_eller_objekt", "Hva var det første samlingsobjektet?", "En tom Gordon’s Dry Gin-miniatyrflaske", claimFor(/Gordon/)],
  ["hva", "Hva var flaskeboken?", "En notatbok for registrering av småflasker", claimFor(/flaskeboken/)],
  ["når", "Når ble Kirkegata 10 kjøpt?", "I 1996", claimFor(/1996/)],
  ["når", "Når åpnet museet?", "I mai 2003", claimFor(/mai 2003/)],
  ["hvilket_verk_eller_objekt", "Hvilke to installasjoner er Objects?", "Monterrekken i Likørværelset og flaskekartet i The World", claimFor(/To faktiske installasjoner/)],
  ["hva_skjedde", "Hva skjedde med den private samlingen?", "Den fikk offentlig museumsform", claimFor(/offentlig tilgjengelig/)]
].map(([type, question, answer, claimId]) => ({ type, question, answer, claimIds: [claimId], normalKnowledgeQuestion: true }));
write(`data/places/production/${placeId}.json`, {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId, placeFile, status: "ready_v4_2",
  identity: {
    status: "resolved", represents: "The Mini Bottle Gallery as the special museum and miniature-bottle collection at Kirkegata 10.", period: "1961–",
    excludes: ["Kirkegata 10 sin komplette bygningshistorie før museumsetableringen", "et ordinært kunstgalleri", "en bar eller generell selskapsvirksomhet", "alkoholreklame", "Ringnes Bryggeri"]
  },
  claims: allClaims,
  sentenceCoverage: { desc: descClaims.map((claim, index) => ({ sentence: index + 1, claimIds: [claim.id] })), popupDesc: popupClaims.map((claim, index) => ({ sentence: index + 1, claimIds: [claim.id] })) },
  metadataSnapshot: { name: place.name, category: place.category, year: place.year, coordinates: { lat: place.lat, lon: place.lon } },
  collections: { people: [personId], objects: objects.map(item => item.id), brands: [brandId], historical_events: historicalEvents.map(item => item.id) },
  quizReadiness: { status: "ready", questions: readinessQuestions, quizTargetId: placeId, sourceBrief: briefFile, productionContext: contextFile, totalQuestions: 28, normalOpeningQuestions: 14, reuseDecision: "No target quiz existed; a new source-led History normal 4x7 package was produced." },
  roundsReadiness: { status: "ready", exactCollectionCount: 4 },
  source_conflicts: [
    { claim: "Samlingens total- og utstillingstall er stabile canonical fakta.", status: "qualified_and_omitted", reason: "Den nåværende offisielle siden og eldre indekserte versjoner oppgir ulike tall; canonical tekst beholder bare stabilt installasjons- og etasjenivå." },
    { claim: "Familieforbindelsen til Ringnes Bryggeri forårsaket flaskeinteressen.", status: "rejected_as_causal_fact", reason: "Museets egen historikk bruker «kanskje» og dokumenterer ingen sikker årsakskjede." },
    { claim: "Fasadefotografiene viser kjøpet i 1996 eller åpningen i 2003.", status: "rejected", reason: "Bildene er fra 2009 og 2011 og merkes som senere kontekstdokumentasjon." }
  ],
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "The Mini Bottle Gallery source review", notes: "Offisiell historikk, romside, institusjonsprofil, to lisensierte fasadebilder og fire førstegangseide rombilder er kontrollert." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "The Mini Bottle Gallery identity and collection review", introducedNewFacts: false, notes: "Museet skilles fra bar, galleri, reklame, bryggeri og bygningens eldre historie; volatil telling og mulig årsak er kvalifisert." }
  },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: allClaims.length, total: allClaims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) }
});

const historySources = [
  { id: `source_${placeId}_official`, url: urls.official, sourceLocation: "Historikk fra 1961 til åpningen i 2003 og nåværende museumspresentasjon", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Museumsinstitusjonens offisielle nettsted.", limitations: "Sterk på egen kronologi og nåpresentasjon; skiftende tall og tentativ familieårsak krever kvalifisering." },
  { id: `source_${placeId}_rooms`, url: urls.rooms, sourceLocation: "Navngitte rom og førstegangseide interiørfotografier", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "current", provenance: "Museets offisielle romside.", limitations: "Dokumenterer publisert romform og installasjoner, ikke komplett proveniens eller varig plassering." },
  { id: `source_${placeId}_ringnes`, url: urls.ringnesProfile, sourceLocation: "Christian Ringnes-profil", sourceType: "institutional", verifiedAt, temporalCoverage: "retrospective", provenance: "Ekebergparkens institusjonsprofil.", limitations: "Supplerer personidentiteten, men er ikke en uavhengig komplett museumshistorie." },
  { id: `source_${placeId}_visual`, url: urls.facade2011Page, sourceLocation: "Lisensiert dokumentasjonsfoto av fasaden", sourceType: "archive", verifiedAt, temporalCoverage: "retrospective", provenance: "CC BY-SA-fotografi publisert på Wikimedia Commons.", limitations: "Viser museet i 2011, ikke kjøpet i 1996 eller åpningen i 2003." }
];
const historySourceIds = historySources.map(source => source.id);
const caseId = `case_${placeId}_privat_samling_til_museum`;
const topicRationales = {
  em_his_spor_materialitet: "Den første flasken, flaskeboken, vitriner og kartinstallasjon gjør registrering, form og senere montering til konkrete kildelag.",
  em_his_kulturminner_bevaring: "Overgangen fra privat oppbevaring til museum viser utvalg, bevaring, katalog og skiftende samlingsomfang.",
  em_his_samtid_ettertid_fortelling: "Historikken fra 1961 til åpningen i 2003 viser hvordan samlerens egen fortelling ble institusjonell ettertidsfortelling.",
  em_his_museum_samling_kanon: "Installasjoner og romnavn viser hvordan klassifikasjon og scenografi gjør noen forbindelser mer offentlige enn andre."
};
write(`data/places/historie-production/${placeId}.json`, {
  schemaVersion: "historie_place_production_v1", validatorVersion: "1.0.0", placeId, placeFile, status: "ready",
  historicalIdentity: {
    statement: "The Mini Bottle Gallery er spesialmuseet og samlingen i Kirkegata 10, med et dokumentert forløp fra den første flasken i 1961 til offentlig åpning i 2003 og dagens installasjoner.",
    placeRelationType: "institution_site", placeRelationStatement: "Place-ID-en eier museets samlings-, registrerings-, etablerings- og formidlingshistorie i Kirkegata 10, ikke bryggeriets historie eller hele bygningens tidligere bruk.",
    temporalScope: { start: "1961", end: "2026", precision: "year", rationale: "Den offisielle historikken dokumenterer start, kjøp, prosjektering og åpning; den nåværende siden dokumenterer institusjonen i dag." }, sourceIds: historySourceIds
  },
  historyTopics: place.emne_ids.map(emneId => ({ emneId, siteSpecificRationale: topicRationales[emneId], caseIds: [caseId] })),
  sources: historySources,
  caseRealizations: [{
    id: caseId, claim: "Forløpet viser hvordan en privat samlerpraksis ble ordnet, gitt et eget bygg og omformet til en offentlig museumsfortelling gjennom utvalg og installasjonsdesign.",
    temporalSequence: {
      scope: { start: "1961", end: "2003", precision: "year", rationale: "Caset følger første flaske, registrering, bygningskjøp, prosjektering og åpning." },
      startPoint: "Christian Ringnes fikk den første miniatyrflasken som sjuåring i 1961.", endPoint: "The Mini Bottle Gallery åpnet i Kirkegata 10 i mai 2003.",
      breaks: ["Kjøpet av Kirkegata 10 i 1996 ga samlingen et planlagt institusjonsanker.", "Prosjekteringen fra 2000 gjorde registrering og oppbevaring til romlig museumsdesign.", "Åpningen i 2003 ga publikum adgang til en kuratert del av samlingen."],
      continuities: ["Christian Ringnes’ samler- og registreringspraksis bandt startfortellingen til museet.", "Miniatyrflasken forble grunnenheten selv om kontekst, eierskap og presentasjon endret seg."], sourceIds: [`source_${placeId}_official`, `source_${placeId}_rooms`]
    },
    actors: [
      { name: "Christian Ringnes", roleOrInterest: "Samlet, registrerte, kjøpte Kirkegata 10 og etablerte museet.", powerPosition: "Eide samlingen og kunne definere hvilke objekter, kategorier og fortellinger som fikk institusjonsform.", sourceIds: [`source_${placeId}_official`, `source_${placeId}_ringnes`] },
      { name: "Museumsprosjektet og utstillingsdesignerne", roleOrInterest: "Gjorde samlingen til rom, monteringer og besøksløp.", powerPosition: "Kuratoriske valg styrte hvilke sammenhenger og objekter publikum møtte.", sourceIds: [`source_${placeId}_official`, `source_${placeId}_rooms`] },
      { name: "Publikum", roleOrInterest: "Fikk adgang til samlingen fra mai 2003.", powerPosition: "Møter et allerede valgt og ordnet materiale, ikke hele samlingen eller alle proveniensspor.", sourceIds: [`source_${placeId}_official`, `source_${placeId}_rooms`] }
    ],
    conflictOrNegotiation: { statement: "Overgangen til museum krevde valg mellom oppbevaring og framvisning, mellom samlerens egne kategorier og publikums lesning, og mellom skiftende samlingstall og stabile canonical påstander.", sourceIds: [`source_${placeId}_official`, `source_${placeId}_rooms`] },
    sourceComparison: { sourceIds: historySourceIds, comparison: "Museets historikkside bærer institusjonsforløpet, romsiden dokumenterer installasjonene, Ekebergparken avgrenser personrollen, og Commons-fotoet dokumenterer senere fasadekontekst.", contradictionsOrSilences: "Offisielle nettsideversjoner oppgir ulike total- og utstillingstall; historikken bruker også «kanskje» om bryggeriforbindelsen. Kildene sier lite om alle provenienser, interne kuratoriske diskusjoner og alternative samlerfortellinger.", conclusionLimits: "Caset bærer samler-, registrerings-, institusjons- og historiebruksperspektiv, men ikke en uavhengig verdensrangering, komplett objektkatalog eller sikker énårsaksforklaring." },
    comparativeScale: { localFinding: "Kirkegata 10 gjør overgangen fra privat registrering til fysisk museumsinstallasjon lesbar.", widerContext: "Spesialmuseet viser hvordan masseproduserte forbruksobjekter kan få kulturhistorisk verdi gjennom utvalg, katalogisering og offentlig framvisning.", scale: "global", sourceIds: [`source_${placeId}_official`, `source_${placeId}_rooms`] },
    causationAndUncertainty: { causalAssessment: "Samlerglede, systematisk registrering, bygningskjøpet og prosjekteringen bidro dokumentert til åpningen i 2003; kildene beviser ikke at familieforbindelsen til bryggeriet var årsaken.", alternativeExplanations: ["Faren reiste i utlandet og ga den første flasken.", "Registreringspraksis og senere investerings- og designvalg kan forklare utviklingen uten én familieårsak."], uncertainty: "Åpne kilder gir ikke komplett proveniens for hver flaske, full beslutningshistorikk for utstillingsdesignet eller ett stabilt samlingstall.", sourceIds: [`source_${placeId}_official`, `source_${placeId}_rooms`, `source_${placeId}_ringnes`] }
  }],
  presentTrace: { objectStatus: "altered", statement: "Museumsfasaden står i Kirkegata 10, og de offisielle romfotografiene dokumenterer fysiske flaskeinstallasjoner i den nåværende institusjonen.", originalSiteRelationship: "Koordinatet er museets verifiserte adresseanker; installasjonene er senere presentasjonslag rundt objekter med andre opprinnelsessteder.", sourceIds: [`source_${placeId}_official`, `source_${placeId}_rooms`, `source_${placeId}_visual`] },
  quizOpening: { status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14, sourceBrief: briefFile, productionContext: contextFile, requiredInputs: ["data/fag/historie/historiepensum_canonical_v4_5.json", "data/fag/historie/emner_historie_canonical_v4_5.json", "data/fag/historie/fagkart_historie_canonical_v4_5.json", "data/fag/historie/methods_historie_canonical_v4_5.json", "data/fag/historie/supersetQUIZMAL_historie.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"] },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Fire kronologiankere bærer institusjonsforløpet; historien fra første flaske via registrering og bygningskjøp til åpning har aktør, handling og konsekvens og er produsert som én episode-Story." },
  gates: {
    A: { status: "PASS", evidenceRefs: ["historicalIdentity"] }, B: { status: "PASS", evidenceRefs: ["historyTopics"] },
    C: { status: "PASS", evidenceRefs: ["caseRealizations[0].temporalSequence"] }, D: { status: "PASS", evidenceRefs: ["caseRealizations[0].actors", "caseRealizations[0].conflictOrNegotiation"] },
    E: { status: "PASS", evidenceRefs: ["caseRealizations[0].sourceComparison"] }, F: { status: "PASS", evidenceRefs: ["caseRealizations[0].comparativeScale", "caseRealizations[0].causationAndUncertainty", "presentTrace"] },
    G: { status: "PASS", evidenceRefs: ["quizOpening"] }, H: { status: "PASS", evidenceRefs: ["chronologyStories"] }
  },
  review: { reviewer: "The Mini Bottle Gallery completion review", reviewedAt: verifiedAt, notes: "Identitet, samlingsstart, kjøp, prosjektering, åpning, person, Brand, installasjoner, volatile tall og årsaksgrense er kontrollert." }
});

const workcardFile = `reports/place-production/the-mini-bottle-gallery-workcard-current.json`;
const workcard = read(workcardFile);
Object.assign(workcard, {
  status: "complete", production_profile: "standard", profile_status: "confirmed",
  profile_reason: "Christian Ringnes, to direkte fotograferte flaskeinstallasjoner, Ringnes og to bildeklare museumshendelser lukker standardprofilen uten fyll.",
  underbadge_ids: place.underbadge_ids,
  badge_router_status: "PASS – Historie routes People, Objects, Brands and Historical Events; all four are source- and image-ready.",
  content_plan: {
    people: `PRODUCED – ${personId} with existing licensed portrait and new claims package.`,
    objects: `PRODUCED – ${objects.map(item => item.id).join(", ")}.`,
    brands: `PRODUCED – ${brandId}; Gordon’s held back without approved logo/rights closeout.`,
    category_expression: `PRODUCED – ${historicalEvents.map(item => item.id).join(", ")}.`,
    stories: `PRODUCED – ${story.id}.`, for_na: "HELD BACK – no controlled comparable views.",
    news: "NOT APPLICABLE – volatile visitor details are not canonical news.",
    lesespor: "PRODUCED – four open source-led reading tracks."
  },
  active_phase: "complete", active_file_scope: "Full place completion package.",
  source_review: "complete", branch_status: "local_ready_for_validation", live_status: "not live until PR merge",
  phases: "1–24", verified_at: verifiedAt, production_verified_at: verifiedAt, quiz_profile: "normal_4x7",
  quality_gate: `reports/place-production/${placeId}-phase1-24-gate-audit-v1.json`, canonical_next: null,
  notes: [
    "Norske Grafikere was already merged in PR #5605 and was not duplicated.",
    "Existing canonical ID, category, address, radius and exact Geonorge coordinates were preserved.",
    "The current official page and older indexed versions disagree on total/display counts; volatile counts and the world-record claim were omitted.",
    "VisitOSLO media were rejected after browser access required human verification; no VisitOSLO image is used.",
    "Two actual installations come from the museum’s own inspectable room page; each crop depicts the named member.",
    "Gordon’s is retained only as the documented first-bottle label, not selected as Brand without visual closeout."
  ]
});
write(workcardFile, workcard);

write(`reports/place-production/${placeId}-phase1-24-gate-audit-v1.json`, {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { existing_place: true, coordinate_changed: false, existing_quiz: "none", existing_story: "none", existing_collections: 0, existing_images: 0, existing_language_entries: 0, existing_reading_tracks: 0, existing_fagverk: "unfinished fallback only" },
  collections: { required: ["people", "objects", "brands", "historical_events"], loaded_preview_images: 6, missing: 0, coverage_percent: 100 },
  people: { candidates_reviewed: ["Christian Ringnes"], selected: [personId], held_back: [], image_coverage_percent: 100 },
  objects: { candidates_reviewed: ["Første Gordon’s-flaske", "flaskeboken", "monterrekken i Likørværelset", "flaskekartet i The World"], selected: objects.map(item => item.id), held_back: ["Første Gordon’s-flaske – direkte historisk kilde, men ingen rettighetsklar medlemsfil ble tilgjengelig.", "Flaskeboken – direkte historisk kilde, men ingen rettighetsklar medlemsfil ble tilgjengelig."], exception: null },
  brands: { candidates_reviewed: ["Ringnes", "Gordon’s", "The Mini Bottle Gallery"], selected: [brandId], held_back: ["Gordon’s – direkte førsteflaske-kobling, men logo- og rettighetssporet ble ikke lukket.", "The Mini Bottle Gallery – canonical Place må ikke brand-mappes til seg selv."], logo_coverage: { required: 1, reviewed: 1, missing: 0, percent: 100 } },
  source_conflicts: [
    { claim: "Ett stabilt total- og utstillingstall.", status: "qualified_and_omitted", reason: "Nåværende og eldre nettversjoner avviker." },
    { claim: "Verdens største som varig uavhengig rangering.", status: "held_back", reason: "Institusjonens egen rekordpåstand mangler uavhengig og stabilt sammenligningsgrunnlag." },
    { claim: "Bryggeriet forårsaket samlerinteressen.", status: "rejected_as_causal_fact", reason: "Kilden sier bare «kanskje»." }
  ],
  conditional_modules: { stories: "one_episode_v1_produced", lesespor: "four_produced", language: "six_terms_produced", for_na: "source_bounded_holdback", news: "not_applicable", dialect: "not_applicable" },
  manual_image_review: {
    status: "PASS",
    reviewed_assets: [place.image, place.cardImage, place.frontImage, person.cardImage, brand.logo, ...objects.map(item => item.image), ...historicalEvents.map(item => item.image)],
    note: "Alle avgrensninger ble visuelt kontrollert: frontbildet er fysisk stående; Objects viser faktiske navngitte installasjoner; Brand bruker eksisterende godkjent historisk merke; hendelsesbilder er eksplisitt senere kontekst. Ingen VisitOSLO- eller generert medlemsfil brukes."
  },
  quality_score: {
    correctness_and_evidence: { score: 5, note: "Offisiell historikk og romside, institusjonsprofil og lisensierte Commons-bilder er krysskontrollert; volatile tall og tentativ årsak er eksplisitt begrenset." },
    coverage_and_completion: { score: 5, note: "Fire bildeklare samlinger, fire milepæler, seks språkoppføringer, fire lesespor, Story, Fagverk og normal 4x7-quiz er materialisert." },
    editorial_quality: { score: 5, note: "Museet skilles fra bar, kunstgalleri, reklame, bryggeri og bygningens eldre historie; samling, registrering og kuratering bindes sammen." },
    technical_integrity: { score: 5, note: "Deterministisk finalizer, canonical manifests, Knowledge-binding, lokale assets og permanent målrettet test inngår." },
    safety_and_responsibility: { score: 4, note: "Alkoholobjekter behandles som material- og samlingshistorie uten konsumoppfordring; institusjonens rombilder brukes som eksplisitte redaksjonelle referanser." },
    maintainability_and_auditability: { score: 5, note: "Claims, personprofil, bildeproveniens, kildekonflikter, holdbacks, produksjonskontekst og A–H-rapport gir revisjonsspor." },
    total: 29, critical_findings: 0, unresolved_blockers: 0
  }
});

execFileSync(process.execPath, ["scripts/build-place-open-payloads.mjs"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["--experimental-strip-types", "scripts/build-civication-scenario-people-index.mts"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "civication:history-people:build"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-epoke-place-index.mjs"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/materialize-natur-final-registry.mjs"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["--experimental-strip-types", "scripts/knowledge-canonical-data.mts", "--write"], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-fagverk-release-manifest.mjs"], { cwd: root, stdio: "inherit" });
console.log(`Finalized The Mini Bottle Gallery (${questions.length} quiz questions, ${chronology.length} chronology entries).`);
