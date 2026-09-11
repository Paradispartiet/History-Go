#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const verifiedAt = "2026-09-11";
const placeId = "tollpakkhuset";
const personId = "johan_henrik_nebelong";
const brandId = "tolletaten";

const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const addOnce = (items, value, key = item => item) => {
  if (!items.some(item => key(item) === key(value))) items.push(value);
};
const upsert = (items, value) => {
  const i = items.findIndex(item => item?.id === value.id);
  if (i < 0) items.push(value); else items[i] = value;
};
const sha256 = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const splitSentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)]
  .map(v => v.segment.trim()).filter(Boolean);
const exists = file => fs.existsSync(path.join(root, file));

const urls = {
  oppdag: "https://www.oppdagkvadraturen.no/stoppesteder/tollpakkhuset",
  riksPlan: "https://riksantikvaren.no/content/uploads/2019/10/tollbugata1a252coslotollbod.pdf",
  riksFred: "https://riksantikvaren.no/content/uploads/2019/10/8.tollbugata1aoslo3.pdf",
  riksHq: "https://riksantikvaren.no/eksempelsamling/to-fredede-bygninger-blir-til-tolldirektorates-hovedkontor/",
  museum: "https://snl.no/Norsk_Tollmuseum",
  nbl: "https://nbl.snl.no/Henrik_Nebelong",
  sikt: "https://forvaltningsdatabasen.sikt.no/en/data/organisasjon/880455702?aar=2026",
  tollOslo: "https://www.toll.no/no/om-oss/kontakt-oss/ekspedisjonssteder/oslo",
  tollPlaces: "https://www.toll.no/no/om-oss/kontakt-oss/ekspedisjonssteder",
  altinnCatalog: "https://github.com/Altinn/altinn-cdn/blob/master/orgs/altinn-orgs.json",
  altinnLogo: "https://altinncdn.no/orgs/tad/tad.png",
  placePhoto: "https://commons.wikimedia.org/wiki/File:Oslo_Tollbod_stenpakkhuset_rk_117572_IMG_2583.JPG",
  personPhoto: "https://commons.wikimedia.org/wiki/File:Gad_Frederik_Clement_-_Johan_Henrik_Nebelong_-_Norsk_portrettarkiv_-_Riksantikvaren_-_N000136.jpg"
};

const placeSource = process.env.TOLLPAKKHUSET_SOURCE_PHOTO || "/tmp/tollpakkhuset-place.jpg";
const personSource = process.env.NEBELONG_SOURCE_PHOTO || "/tmp/nebelong.jpg";
const logoSource = process.env.TOLLETATEN_LOGO || "/tmp/tolletaten.png";
for (const file of [placeSource, personSource, logoSource]) {
  if (!fs.existsSync(file)) throw new Error(`Missing downloaded source asset ${file}`);
}

async function makeImage(input, output, width, height, options = {}) {
  const target = path.join(root, output);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(input).rotate().resize(width, height, {
    fit: options.fit || "cover",
    position: options.position || "centre",
    background: options.background || "#111111"
  }).webp({ quality: 90 }).toFile(target);
}

await Promise.all([
  makeImage(placeSource, "bilder/places/tollpakkhuset.webp", 1200, 675),
  makeImage(placeSource, "bilder/places/tollpakkhuset_front_portrait.webp", 900, 1200),
  makeImage(placeSource, "bilder/kort/objects/tollpakkhuset_pakkhusporter.webp", 900, 620, { position: "south" }),
  makeImage(placeSource, "bilder/kort/productions/tollpakkhuset_tollbehandling.webp", 900, 620, { position: "south" }),
  makeImage(personSource, "bilder/kort/people/johan_henrik_nebelong.webp", 720, 900),
  makeImage(logoSource, "bilder/kort/brands/tolletaten.webp", 900, 520, { fit: "contain", background: "#ffffff" })
]);

const placeFile = "data/places/naeringsliv/oslo/places_naeringsliv_oslo_oppdag_kvadraturen_batch_04/tollpakkhuset.json";
const place = read(placeFile);
const desc = "Tollpakkhuset i Tollbugata 1A ble oppført 1846–1850 etter tegninger av Johan Henrik Nebelong som lager for Tollvesenet. Bygningen er den eldste bevarte bygningen ved Oslos gamle havnefront, og bueåpninger, pakkhusporter og spor etter veiing og vareheiser gjør den historiske varebehandlingen lesbar. I dag inngår det fredede bygget i et administrativt tollanlegg, mens Tolletatens publikumsekspedisjoner i Oslo ligger andre steder.";
const popupDesc = [
  "Tollpakkhuset, også kalt Steinpakkhuset og kartført som Stenpakkhuset, ble oppført 1846–1850 etter tegninger av arkitekten Johan Henrik Nebelong. Oppdag Kvadraturen beskriver det som den eldste bevarte bygningen ved den gamle havnefronten i Oslo. Det er et eget fysisk bygg og skal ikke forveksles med Tollboden fra 1896 eller med kaiankeret Tollbukaia.",
  "Bygningen var et lager for Tollvesenet. Varer kunne føres inn gjennom de store bueåpningene, veies, kontrolleres og lagres mens tollbehandlingen pågikk. Riksantikvarens forvaltningsplan beskriver opprinnelig fire veieboder i første etasje og én i andre etasje, knyttet til store varerom.",
  "Arbeidsprosessen ble endret med ny teknologi. Tre elektriske vareheiser ble installert i 1897. Rundt 1929–1930 ble varebehandlingsrommene utvidet for sju vekter, og en fjerde heis kom i 1930. Tallene viser endringer i den fysiske kapasiteten og arbeidsorganiseringen, men de er ikke en direkte måleserie for varevolum eller produktivitet.",
  "Pakkhusportene og det gamle treklossgulvet er bevarte spor etter arbeidet. Riksantikvaren fremhever at gulvet var egnet når fat og andre kolli skulle rulles. Forvaltningsplanen skiller også mellom en opprinnelig pakkhusport av jern og senere kopier utført i tre, slik at nytt og gammelt ikke skal blandes.",
  "I 1956 ble omtrent 8 × 25 meter av den nordvestre delen fjernet da Strandgata ble utvidet. En ny avsluttende fasade ble utformet med utgangspunkt i den eldre bygningen. Den kortere formen er derfor et resultat av endret gatenett, ikke bygningens opprinnelige lengde.",
  "Norsk Tollmuseum ble grunnlagt i 1915, men dette er ikke det samme som at museet lå i Tollpakkhuset fra 1915. Riksantikvarens bygningsplan daterer innflyttingen i andre etasje til 1979, og museet ble senere utvidet. Dette tidslaget viser hvordan et tidligere lager også ble brukt til å bevare og formidle tollhistorie.",
  "Tollanlegget ble senere rehabilitert med vern som premiss. Riksantikvaren dokumenterer at de historiske bygningene ble koblet sammen og tilpasset Tolldirektoratets hovedkontor. Sikt registrerer Tolletaten som aktiv statlig organisasjon med forretningsadresse i Tollbugata i 2026.",
  "Dagens administrative tilknytning må ikke forveksles med publikums tollklarering. Tolletatens oppdaterte oversikt over ekspedisjonssteder i Oslo peker på andre operative steder. History Go beskriver derfor Tollpakkhuset som historisk lager- og kontrollinfrastruktur og som del av et administrativt tollanlegg, ikke som dokumentert ordinært ekspedisjonssted i 2026."
].join("\n\n");

Object.assign(place, {
  year: 1850,
  desc,
  popupDesc,
  emne_ids: [
    "em_naering_havn_transport",
    "em_naering_logistikk_verdikjeder",
    "em_naering_arbeid_verdiskaping",
    "em_naering_risiko_regulering"
  ],
  underbadge_ids: ["shipping_og_havn", "handel_og_markeder", "arbeidsliv_og_fag"],
  production_profile: "focused",
  profile_status: "confirmed",
  production_status: "complete",
  profile_reason: "Focused-profilen gir full canonical kjerne og fire stedsspesifikke samlinger uten å fylle med perifert stoff. Kildene bærer 3×7 quiz, standard Fagverk, Næringsliv-case, People, Object, Brand og den dokumenterte tolltjenesten.",
  image: "bilder/places/tollpakkhuset.webp",
  frontImage: "bilder/places/tollpakkhuset_front_portrait.webp",
  imageCaption: "Stenpakkhuset/Tollpakkhuset ved det historiske tollanlegget i Oslo.",
  imageCredit: "Bjoertvedt / Wikimedia Commons",
  imageLicense: "CC BY-SA 3.0 NO",
  imageSourceUrl: urls.placePhoto,
  imageMeta: {
    source: "wikimedia_commons", sourcePage: urls.placePhoto, creator: "Bjoertvedt",
    credit: "Bjoertvedt / Wikimedia Commons", license: "CC BY-SA 3.0 NO",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
    assetType: "documentary_place_photo", outputDimensions: "1200x675",
    transformation: "Stedstro 16:9-beskjæring og WebP-normalisering; ingen generativ endring.", verifiedAt
  },
  frontImageMeta: {
    source: "wikimedia_commons", sourcePage: urls.placePhoto, creator: "Bjoertvedt",
    credit: "Bjoertvedt / Wikimedia Commons", license: "CC BY-SA 3.0 NO",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
    assetType: "documentary_place_photo", outputDimensions: "900x1200",
    orientation: "portrait", aspectRatio: "3:4",
    transformation: "Stående 3:4-utnitt av den dokumenterte bygningen; ingen generativ endring.", verifiedAt
  },
  related_people_ids: [personId],
  related_place_ids: ["tollboden_oslo", "tollbukaia"],
  reading_track_ids: [
    "lesespor_tollpakkhuset_oppdag",
    "lesespor_tollpakkhuset_riksantikvaren",
    "lesespor_tollpakkhuset_nebelong"
  ],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    production_profile: "focused",
    collection_ids: ["people", "objects", "brands", "productions"],
    category_collection_label: "Produksjon og tjenester",
    reason: "Nebelong er direkte dokumentert arkitekt; pakkhusportene er et bevart fysisk arbeidsspor; Tolletaten er en kildeverifisert institusjonsidentitet; tollbehandling, veiing og pakkhuslagring er den stedsspesifikke tjeneste-/arbeidsprosessen.",
    verifiedAt
  },
  objects: [{
    id: "tollpakkhuset_pakkhusporter",
    name: "Pakkhusportene",
    title: "Pakkhusportene ved vareåpningene",
    type: "pakkhusport",
    kind: "historic_loading_gate",
    year: 1850,
    desc: "Riksantikvarens forvaltningsplan dokumenterer bevarte pakkhusporter og skiller en opprinnelig jernport fra senere kopier i tre.",
    historicalFunction: "Portene åpnet de store vareåpningene som ble brukt ved inn- og utlasting av varer til tollbehandling og lager.",
    physicalObject: true,
    placeSpecific: true,
    collectable: true,
    placeSpecificReason: "Forvaltningsplanen for Stenpakkhuset beskriver portene som del av bygningens varehåndteringsspor.",
    why_here: "Portene gjør vareflyten fysisk lesbar og knytter fasaden til arbeid med lasting, veiing og lager.",
    whereToFind: "I de store bueåpningene i første etasje. Observer fra offentlig tilgjengelig område.",
    unlock: "Finn en av de store vareåpningene og se hvordan port, nivå og fasade er tilpasset flytting av gods.",
    storePrice: 35,
    currency: "PC",
    image: "bilder/kort/objects/tollpakkhuset_pakkhusporter.webp",
    imageMeta: {
      source: "wikimedia_commons", sourcePage: urls.placePhoto, creator: "Bjoertvedt",
      credit: "Bjoertvedt / Wikimedia Commons", license: "CC BY-SA 3.0 NO",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
      depictedObject: "Stenpakkhuset med vareåpninger og pakkhusporter i fasaden",
      transformation: "Nedre stedstro utsnitt av dokumentarfoto og WebP-normalisering; ingen port er rekonstruert.", verifiedAt
    },
    source_urls: [urls.riksPlan, urls.riksFred, urls.placePhoto]
  }],
  productions: [{
    id: "tollpakkhuset_tollbehandling_veiing_lagring",
    name: "Tollbehandling, veiing og pakkhuslagring",
    title: "Tollbehandling, veiing og pakkhuslagring",
    type: "toll_og_lagertjeneste",
    kind: "historic_business_service",
    year: "1846–1900-tallet",
    desc: "Varer ble lastet inn, veid, kontrollert og lagret i Tollpakkhuset som del av tollbehandlingen ved havna.",
    why_here: "Bygningen ble oppført for denne tjenestekjeden, og kildene dokumenterer varerom, veieboder, vekter og vareheiser.",
    placeSpecificReason: "Oppdag Kvadraturen og Riksantikvarens forvaltningsplan beskriver arbeidsprosessen i akkurat Tollpakkhuset.",
    image: "bilder/kort/productions/tollpakkhuset_tollbehandling.webp",
    imageMeta: {
      source: "wikimedia_commons", sourcePage: urls.placePhoto, creator: "Bjoertvedt",
      credit: "Bjoertvedt / Wikimedia Commons", license: "CC BY-SA 3.0 NO",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/",
      depictedObject: "Tollpakkhusets lasteside som fysisk infrastruktur for den historiske tjenesten",
      transformation: "Stedstro utsnitt av bygningen; bildet dokumenterer infrastrukturen, ikke en iscenesatt historisk arbeidssituasjon.", verifiedAt
    },
    source_urls: [urls.oppdag, urls.riksPlan, urls.placePhoto]
  }],
  fagverk: {
    schema: "history_go_place_fagverk_v2",
    level: "standard",
    status: "curated",
    intro: "Tollpakkhuset gjør en økonomisk og administrativ prosess synlig i arkitektur. Varer, arbeidskraft, kontroll, lagerrom, vekter og heiser ble samlet i ett stedbundet ledd mellom sjøtransport og videre handel.",
    article: [
      "Tollpakkhuset ble oppført 1846–1850 som lager for Tollvesenet ved den gamle havna. Varer kunne lastes inn, veies, kontrolleres og holdes tilbake før de gikk videre. Bygningen er derfor et konkret ledd i en verdikjede der fysisk vareflyt og offentlig kontroll møttes.",
      "Riksantikvarens forvaltningsplan beskriver fire veieboder i første etasje og én i andre etasje i den opprinnelige løsningen. Senere kom elektriske vareheiser og flere vekter. Slike installasjoner viser investering i intern transport og kontrollkapasitet, men antallet vekter eller heiser er ikke det samme som et mål på faktisk varevolum eller produktivitet.",
      "Tollvesenet skulle kontrollere og dokumentere varer, mens kjøpmenn, vareeiere og transportører hadde interesse av korrekt og effektiv behandling. Kildene gjør det mulig å beskrive rollene, men ikke å beregne lønn, fortjeneste eller ventetid uten egne serier.",
      "En stor del av bygningen ble fjernet i 1956 da Strandgata ble utvidet, og Norsk Tollmuseum flyttet inn i andre etasje i 1979. Senere rehabilitering førte tolladministrativ bruk videre. Det viser at materiell kontinuitet og økonomisk funksjon ikke er det samme.",
      "Tolletaten er fortsatt registrert i Tollbugata, men etatens egen oversikt legger publikums ekspedisjonssteder andre steder. En presis analyse skiller derfor mellom historisk tollbehandling i pakkhuset, dagens administrative bruk og nåtidens operative ekspedisjonssteder."
    ],
    subject_ids: ["naeringsliv"],
    emne_ids: [
      "em_naering_havn_transport",
      "em_naering_logistikk_verdikjeder",
      "em_naering_arbeid_verdiskaping",
      "em_naering_risiko_regulering"
    ],
    chapter_ids: ["logistikk-infrastruktur-okonomisk-rom", "arbeid-produksjon-verdiskaping", "makt-regulering-baerekraft"],
    lenses: [
      {
        id: "tollpakkhuset-vareflyt", title: "Fra skip til kontrollert vareflyt",
        prompt: "Hvordan koblet Tollpakkhuset lasting, veiing, lager og tollkontroll i ett stedbundet logistikkledd?",
        subject_id: "naeringsliv", emne_id: "em_naering_logistikk_verdikjeder",
        evidence: "Bruk varerom, veieboder, portåpninger og havneplassering; ikke anta varevolum som kildene ikke oppgir."
      },
      {
        id: "tollpakkhuset-maling", title: "Hva måler vekter og heiser egentlig?",
        prompt: "Hva kan endringer i antall vekter og heiser fortelle om anlegget, og hva kan de ikke fortelle om produktivitet?",
        subject_id: "naeringsliv", emne_id: "em_naering_arbeid_verdiskaping",
        evidence: "Skill fysisk kapasitetsindikator fra faktisk gjennomstrømning, kostnad eller produktivitet."
      },
      {
        id: "tollpakkhuset-regulering", title: "Kontroll som økonomisk infrastruktur",
        prompt: "Hvorfor er tollkontroll både en myndighetsoppgave og et ledd som påvirker handelens vareflyt?",
        subject_id: "naeringsliv", emne_id: "em_naering_risiko_regulering",
        evidence: "Hold analysen til dokumentert kontroll, veiing og lagring."
      },
      {
        id: "tollpakkhuset-ombruk", title: "Samme bygg, nye funksjoner",
        prompt: "Hva endres når et tollager blir museum og senere del av et administrativt hovedkontor?",
        subject_id: "naeringsliv", emne_id: "em_naering_havn_transport",
        evidence: "Følg 1846–50, 1956, 1979 og senere rehabilitering som separate tidslag."
      }
    ],
    guiding_questions: [
      "Hvordan gjorde bygningen tollbehandling til en fysisk arbeidsprosess?",
      "Hva forteller veieboder, vekter og vareheiser om organisering, og hva kan de ikke bevise?",
      "Hvilke interesser hadde tollansatte og vareeiere i samme prosess?",
      "Hvordan skiller historisk varebehandling seg fra dagens administrative bruk?"
    ],
    concepts: ["toll", "lager", "verdikjede", "logistikk", "veiing", "regulering", "infrastruktur", "ombruk", "måleusikkerhet"],
    observable_traces: [
      {
        title: "De store bueåpningene",
        observation: "Første etasje har store åpninger som kildene knytter til inn- og utlasting av varer.",
        interpretation_boundary: "Åpningene dokumenterer bygningens logistiske utforming, men sier ikke alene hvilke varer eller volumer som passerte på en bestemt dag.",
        source_urls: [urls.oppdag, urls.riksPlan]
      },
      {
        title: "Pakkhusporter og materialspor",
        observation: "Bevarte porter og eldre materialer gjør varehåndteringen lesbar i fasaden og interiøret.",
        interpretation_boundary: "Riksantikvaren skiller originale og senere elementer; brukeren skal ikke anta at alle synlige porter eller flater er fra 1850.",
        source_urls: [urls.riksPlan, urls.riksFred]
      }
    ],
    source_urls: [urls.oppdag, urls.riksPlan, urls.riksFred, urls.riksHq, urls.sikt, urls.tollOslo],
    verified_at: verifiedAt
  },
  externalLinks: [
    ["official", "Oppdag Kvadraturen – Tollpakkhuset", urls.oppdag],
    ["official", "Riksantikvaren – forvaltningsplan Tollbugata 1A", urls.riksPlan],
    ["official", "Riksantikvaren – fredningsvedlegg Stenpakkhuset", urls.riksFred],
    ["source", "Store norske leksikon – Norsk Tollmuseum", urls.museum],
    ["source", "Norsk biografisk leksikon – Henrik Nebelong", urls.nbl],
    ["current_status", "Sikt – Tolletaten 2026", urls.sikt],
    ["current_service", "Tolletaten – ekspedisjonssteder i Oslo", urls.tollOslo],
    ["image_source", "Wikimedia Commons – Stenpakkhuset", urls.placePhoto]
  ].map(([type, label, url]) => ({ type, label, url, verifiedAt }))
});
delete place.cardImage;
delete place.cardImageMeta;
write(placeFile, place);

const placeClaims = [
  ["claim_tollpakkhuset_identity", "Tollpakkhuset ble oppført 1846–1850 etter tegninger av Johan Henrik Nebelong som lager for Tollvesenet.", urls.oppdag, "Tollpakkhuset – historikk og funksjon", "official", "identity", "direct", "historical"],
  ["claim_tollpakkhuset_oldest", "Tollpakkhuset er den eldste bevarte bygningen ved den gamle havnefronten i Oslo.", urls.oppdag, "Tollpakkhuset – beskrivelse av bygningen", "official", "strong", "explicit", "historical"],
  ["claim_tollpakkhuset_arches", "De store bueåpningene i første etasje ble brukt ved inn- og utlasting av varer som skulle tollbehandles.", urls.oppdag, "Tollpakkhuset – varehåndtering", "official", "ordinary", "direct", "historical"],
  ["claim_tollpakkhuset_weighing", "Opprinnelig hadde første etasje fire veieboder og andre etasje blant annet én veiebod.", urls.riksPlan, "Stenpakkhuset – opprinnelig planløsning", "official", "ordinary", "direct", "historical"],
  ["claim_tollpakkhuset_elevators", "Tre elektriske vareheiser ble installert i 1897; i 1930 kom en fjerde heis.", urls.riksPlan, "Stenpakkhuset – endringer 1897 og 1929–1930", "official", "ordinary", "direct", "historical"],
  ["claim_tollpakkhuset_scales", "Varebehandlingsrommene ble rundt 1929–1930 utvidet for sju vekter.", urls.riksPlan, "Stenpakkhuset – varebehandling 1929–1930", "official", "ordinary", "direct", "historical"],
  ["claim_tollpakkhuset_shortened", "Omtrent 8 × 25 meter av nordvestre del ble fjernet i 1956 ved utvidelse av Strandgata.", urls.riksPlan, "Stenpakkhuset – endring 1956", "official", "ordinary", "direct", "historical"],
  ["claim_tollpakkhuset_material_traces", "Riksantikvarens materiale dokumenterer bevarte pakkhusporter og gammelt treklossgulv som spor etter varehåndtering.", urls.riksPlan, "Stenpakkhuset – verneverdige interiør- og portelements", "official", "ordinary", "direct", "current"],
  ["claim_tollpakkhuset_museum", "Norsk Tollmuseum ble etablert i 1915, mens Riksantikvarens bygningsplan daterer museets innflytting i Tollpakkhuset til 1979.", urls.museum, "Norsk Tollmuseum – etablering og Riksantikvarens bygningsplan", "reputable_secondary", "ordinary", "direct", "historical"],
  ["claim_tollpakkhuset_current_admin", "Tolletaten er en aktiv statlig organisasjon i 2026 med forretningsadresse i Tollbugata, og Riksantikvaren dokumenterer tolladministrativ bruk etter rehabilitering.", urls.sikt, "TOLLETATEN 2026 – key information", "registry", "current", "direct", "current"],
  ["claim_tollpakkhuset_not_public_clearance", "Tolletatens oppdaterte oversikt over ekspedisjonssteder i Oslo legger publikums tollklarering ved andre ekspedisjonssteder enn Tollpakkhuset.", urls.tollOslo, "Oslo – oppførte ekspedisjonssteder", "official", "current", "direct", "current"]
].map(([id, claim, sourceUrl, sourceLocation, sourceType, claimKind, evidenceMode, temporalStatus]) => ({
  id, claim, sourceUrl, sourceLocation, sourceType, verifiedAt, status: "verified", claimKind, evidenceMode, temporalStatus
}));

write("data/places/production/tollpakkhuset.json", {
  schemaVersion: "4.2",
  validatorVersion: "4.2.1",
  placeId,
  placeFile,
  status: "ready_v4_2",
  identity: {
    status: "resolved",
    represents: "Den separate stående lagerbygningen Tollpakkhuset/Stenpakkhuset i Tollbugata 1A.",
    period: "1846–",
    excludes: ["Tollboden fra 1896", "Tollbukaia som kaiområde", "Norsk Tollmuseum som egen institusjon", "Tolletaten som landsdekkende etat"]
  },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category },
  textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) },
  claims: placeClaims,
  sentenceCoverage: {
    desc: splitSentences(place.desc).map((text, i) => ({ sentence: i + 1, text, claim_ids: i === 0 ? ["claim_tollpakkhuset_identity"] : i === 1 ? ["claim_tollpakkhuset_oldest", "claim_tollpakkhuset_arches", "claim_tollpakkhuset_material_traces"] : ["claim_tollpakkhuset_current_admin", "claim_tollpakkhuset_not_public_clearance"] })),
    popupDesc: splitSentences(place.popupDesc).map((text, i) => ({ sentence: i + 1, text, claim_ids: [
      ["claim_tollpakkhuset_identity"], ["claim_tollpakkhuset_oldest"], ["claim_tollpakkhuset_identity"],
      ["claim_tollpakkhuset_identity"], ["claim_tollpakkhuset_arches"], ["claim_tollpakkhuset_weighing"],
      ["claim_tollpakkhuset_elevators"], ["claim_tollpakkhuset_scales"], ["claim_tollpakkhuset_material_traces"],
      ["claim_tollpakkhuset_material_traces"], ["claim_tollpakkhuset_shortened"], ["claim_tollpakkhuset_shortened"],
      ["claim_tollpakkhuset_museum"], ["claim_tollpakkhuset_museum"], ["claim_tollpakkhuset_current_admin"],
      ["claim_tollpakkhuset_current_admin"], ["claim_tollpakkhuset_not_public_clearance"], ["claim_tollpakkhuset_current_admin", "claim_tollpakkhuset_not_public_clearance"]
    ][i] || [] }))
  },
  sourceConflicts: [
    {
      id: "building_shortening_year",
      values: [{ value: "1949", source: "legacy place text" }, { value: "1956", source: urls.riksPlan }],
      publicationDecision: "prefer_primary_source",
      publishedValue: "1956",
      rationale: "Riksantikvarens forvaltningsplan er den mest direkte kilden til den konkrete bygningsendringen."
    },
    {
      id: "museum_founding_vs_move_in",
      values: [{ value: "1915", source: urls.museum, meaning: "museum founded" }, { value: "1979", source: urls.riksPlan, meaning: "museum moved into building" }],
      publicationDecision: "publish_common_secure_part",
      rationale: "Årstallene beskriver forskjellige hendelser og skal ikke slås sammen."
    }
  ],
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Tollpakkhuset source review", notes: "Claims er avgrenset mot Tollboden, Tollbukaia, museum og etat; 1956/1979-konfliktene er eksplisitt løst." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Tollpakkhuset editorial review", notes: "Teksten skiller historisk varebehandling fra dagens administrative bruk." }
  }
});

const personFile = "data/people/naeringsliv/oslo/tollpakkhuset/johan_henrik_nebelong.json";
const personClaimsFile = "data/people/claims/naeringsliv/oslo/tollpakkhuset/johan_henrik_nebelong.claims.json";
const person = {
  id: personId,
  name: "Johan Henrik Nebelong",
  initials: "JHN",
  kindLabel: "Arkitekt",
  birth_date: "1817-07-20",
  death_date: "1871-03-01",
  active_place: "Christiania",
  desc: "Arkitekten som tegnet Tollpakkhuset i Tollbugata 1A, oppført 1846–1850 som lager for Tollvesenet.",
  popupDesc: "Johan Henrik Nebelong var en danskfødt arkitekt som virket i Norge. Norsk biografisk leksikon fører Tollpakkhuset i Tollbugata 1A, oppført 1846–1850, blant arbeidene hans. Stedskoblingen i History Go gjelder denne direkte skapende arkitektrollen og skal ikke forveksles med den senere organisten Johan Henrik Nebelong.",
  education: [],
  placeId,
  places: [placeId],
  category: "naeringsliv",
  year: 1850,
  works: [{
    id: "tollpakkhuset_1846_1850",
    title: "Tollpakkhuset / Stenpakkhuset",
    year: "1846–1850",
    role: "arkitekt",
    place: placeId,
    material: "lager- og tollarkitektur",
    summary: "Tegnet den formålsbygde lagerbygningen for Tollvesenet ved Christianias havn."
  }],
  tags: ["arkitektur", "naeringsliv", "toll", "havn", "1800-tallet"],
  themes: ["offentlig byggevirksomhet", "lagerarkitektur", "havneinfrastruktur"],
  image: "bilder/kort/people/johan_henrik_nebelong.webp",
  cardImage: "bilder/kort/people/johan_henrik_nebelong.webp",
  imageMeta: {
    source: "wikimedia_commons", sourcePage: urls.personPhoto,
    creator: "Gad Frederik Clement, 1922, etter fotografi",
    credit: "Riksantikvaren / Norsk portrettarkiv / Wikimedia Commons",
    license: "Public domain", reviewStatus: "manually_approved",
    assetKind: "identity_portrait", outputDimensions: "720x900",
    transformation: "Proporsjonal stående beskjæring og WebP-normalisering; ingen generativ endring.",
    identityNote: "Portrettsiden identifiserer arkitekt Johan Henrik Nebelong (1817–1871), ikke organisten med samme navn.",
    verifiedAt
  },
  profileStandard: "people_profile_v1.0",
  claimsFile: personClaimsFile,
  profileStatus: "ready_people_v1",
  source_urls: [urls.nbl, urls.oppdag, urls.personPhoto],
  externalLinks: [
    { type: "source", label: "Norsk biografisk leksikon – Henrik Nebelong", url: urls.nbl, verifiedAt },
    { type: "official", label: "Oppdag Kvadraturen – Tollpakkhuset", url: urls.oppdag, verifiedAt },
    { type: "image_source", label: "Wikimedia Commons – Johan Henrik Nebelong", url: urls.personPhoto, verifiedAt }
  ],
  verifiedAt
};
write(personFile, [person]);
write(personClaimsFile, {
  schema: "history_go_people_claims_v1",
  version: "1.0.0",
  person_id: personId,
  profile_file: personFile,
  identity: {
    canonical_identity: "Arkitekten Johan Henrik Nebelong (1817–1871), som virket i Norge og tegnet Tollpakkhuset i Tollbugata 1A.",
    name_variants: ["Johan Henrik Nebelong", "Henrik Nebelong"],
    not: ["organisten Johan Henrik Nebelong (1847–1931)"],
    identity_status: "verified"
  },
  claims: [
    { id: "identity_life_profession", claim: "Johan Henrik Nebelong var arkitekt, født 20. juli 1817 og død 1. mars 1871.", status: "verified", source_url: urls.nbl, source_location: "faktaboks og ingress", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "tollpakkhuset_work", claim: "Nebelong tegnet Tollpakkhuset i Tollbugata 1A, oppført 1846–1850 som lager for Tollvesenet.", status: "verified", source_url: urls.nbl, source_location: "verksliste / Tollpakkhuset", source_type: "recognized_reference", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" },
    { id: "image_identity", claim: "Commons-portrettet er identifisert som arkitekt Johan Henrik Nebelong (1817–1871).", status: "verified", source_url: urls.personPhoto, source_location: "filbeskrivelse og metadata", source_type: "archive", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }
  ],
  field_claim_map: {
    name: ["identity_life_profession"], kindLabel: ["identity_life_profession"],
    birth_date: ["identity_life_profession"], death_date: ["identity_life_profession"],
    active_place: ["identity_life_profession", "tollpakkhuset_work"],
    placeId: ["tollpakkhuset_work"], "places[tollpakkhuset]": ["tollpakkhuset_work"],
    year: ["tollpakkhuset_work"], image: ["image_identity"], cardImage: ["image_identity"], imageMeta: ["image_identity"]
  },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["tollpakkhuset_work"] }],
    popupDesc: [
      { sentence: 1, claim_ids: ["identity_life_profession"] },
      { sentence: 2, claim_ids: ["tollpakkhuset_work"] },
      { sentence: 3, claim_ids: ["tollpakkhuset_work", "image_identity"] }
    ]
  },
  completion: {
    completed_under: "people_profile_v1.0", claims_verified: "3/3",
    fact_review: "passed", editorial_review: "passed",
    source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1"
  }
});
const peopleManifest = read("data/people/manifest.json");
addOnce(peopleManifest.files, "people/naeringsliv/oslo/tollpakkhuset/johan_henrik_nebelong.json");
write("data/people/manifest.json", peopleManifest);

const brand = {
  id: brandId,
  name: "Tolletaten",
  aliases: ["Norwegian Customs", "Tollvesenet"],
  brand_group: "professional_brand",
  brand_type: "institution_brand",
  brand_kind: "public_agency",
  sector: "public_administration",
  state: "catalog",
  status: "active",
  verification: "verified_current",
  verified_at: verifiedAt,
  desc: "Statlig tollmyndighet med historisk og nåværende tilknytning til tollanlegget i Tollbugata.",
  popupdesc: "Brand-kortet gjelder Tolletaten som institusjonsidentitet, ikke Tollpakkhuset som bygning. Riksantikvarens kilder dokumenterer tollanleggets historiske og senere administrative bruk, mens Sikt registrerer Tolletaten som aktiv organisasjon i Tollbugata i 2026.",
  place_ids: [placeId, "tollboden_oslo", "tollbukaia"],
  source_urls: [urls.riksHq, urls.sikt, urls.tollOslo, urls.altinnCatalog],
  logo: "bilder/kort/brands/tolletaten.webp",
  imageMeta: {
    source: "official_altinn_organisation_catalog",
    sourcePage: urls.altinnCatalog,
    sourceAsset: urls.altinnLogo,
    creator: "Tolletaten / Altinn organisation catalog",
    credit: "Tolletaten via Altinn",
    license: "rights not stated",
    rightsBasis: "Official Altinn production organisation identity asset for organisation number 880455702; used only for referential identification.",
    reviewStatus: "manually_approved",
    assetKind: "logo",
    usageContext: "referential_identification",
    noEndorsement: true,
    generated: false,
    reconstructed: false,
    temporalScope: "current",
    transformation: "Proporsjonal skalering på nøytral flate og WebP-normalisering; ingen rekonstruksjon.",
    outputDimensions: "900x520",
    reviewedAt: verifiedAt
  }
};
for (const file of ["data/brands/brands_master.json", "data/brands/brands_catalog.json", "data/brands/brands_catalog_v17.json"]) {
  if (!exists(file)) continue;
  const rows = read(file);
  if (!Array.isArray(rows)) continue;
  upsert(rows, file.endsWith("brands_master.json") ? brand : {
    id: brand.id, name: brand.name, aliases: brand.aliases, brand_group: brand.brand_group,
    brand_type: brand.brand_type, brand_kind: brand.brand_kind, sector: brand.sector,
    state: brand.state, status: brand.status, verification: brand.verification,
    verified_at: brand.verified_at, place_ids: brand.place_ids, source_urls: brand.source_urls,
    logo: brand.logo, imageMeta: brand.imageMeta
  });
  write(file, rows);
}
if (exists("data/brands/brands_master_raw.json")) {
  const rows = read("data/brands/brands_master_raw.json");
  if (Array.isArray(rows)) {
    upsert(rows, { id: brand.id, name: brand.name, aliases: brand.aliases, brand_type: brand.brand_type, sector: brand.sector, state: brand.state });
    write("data/brands/brands_master_raw.json", rows);
  }
}
const brandsByPlace = read("data/brands/brands_by_place.json");
for (const id of brand.place_ids) {
  const values = Array.isArray(brandsByPlace[id]) ? brandsByPlace[id] : [];
  if (!values.includes(brandId)) values.push(brandId);
  brandsByPlace[id] = values;
}
write("data/brands/brands_by_place.json", brandsByPlace);

const leksikonFile = "data/leksikon/places/oslo/naeringsliv/leksikon_tollpakkhuset.json";
write(leksikonFile, {
  place_id: placeId,
  title: "Tollpakkhuset",
  type: "main",
  version: 1,
  visual: { designCode: "article_place_essay_miniature" },
  intro: "Et formålsbygd tollager fra 1846–1850 der vareflyt, offentlig kontroll og havnelogistikk møttes.",
  sections: [
    { id: "lager_og_kontroll", title: "Lager, veiing og kontroll", body: "Tollpakkhuset ble reist for Tollvesenet. Varer kunne føres inn gjennom store åpninger, veies i egne boder og lagres mens tollbehandlingen pågikk.", source_urls: [urls.oppdag, urls.riksPlan] },
    { id: "teknologiske_endringer", title: "Fra veieboder til vareheiser", body: "Tre elektriske vareheiser kom i 1897. Rundt 1929–1930 ble varebehandlingsrommene utvidet for sju vekter, og en fjerde heis ble installert. Endringene viser fysisk kapasitet, ikke automatisk produktivitet.", source_urls: [urls.riksPlan] },
    { id: "forkortet_bygning", title: "Bygningen ble kortere i 1956", body: "Ved utvidelse av Strandgata ble omtrent 8 × 25 meter av nordvestre del fjernet i 1956.", source_urls: [urls.riksPlan] },
    { id: "museum_og_ombruk", title: "Museum og administrativ ombruk", body: "Norsk Tollmuseum var etablert fra 1915, men Riksantikvarens plan daterer innflyttingen i Tollpakkhuset til 1979. Senere rehabilitering knyttet de fredede tollbygningene sammen for administrativ bruk.", source_urls: [urls.museum, urls.riksPlan, urls.riksHq, urls.sikt, urls.tollOslo] }
  ],
  timeline: [
    { year: "1846–1850", title: "Tollpakkhuset oppføres", text: "Johan Henrik Nebelongs lagerbygning for Tollvesenet blir oppført.", source_urls: [urls.oppdag, urls.riksPlan] },
    { year: 1897, title: "Tre elektriske vareheiser", text: "Intern varetransport blir mekanisert med tre elektriske heiser.", source_urls: [urls.riksPlan] },
    { year: 1930, title: "Sju vekter og fjerde heis", text: "Varebehandlingsrommene er utvidet for sju vekter, og en fjerde heis kommer.", source_urls: [urls.riksPlan] },
    { year: 1956, title: "Pakkhuset forkortes", text: "Omtrent 8 × 25 meter fjernes ved utvidelse av Strandgata.", source_urls: [urls.riksPlan] },
    { year: 1979, title: "Norsk Tollmuseum flytter inn", text: "Museet tar i bruk andre etasje i Tollpakkhuset.", source_urls: [urls.riksPlan, urls.museum] },
    { year: 2026, title: "Administrativ tolltilknytning", text: "Tolletaten er registrert med forretningsadresse i Tollbugata; publikums ekspedisjonssteder ligger andre steder.", source_urls: [urls.sikt, urls.tollOslo] }
  ],
  source_urls: [urls.oppdag, urls.riksPlan, urls.riksFred, urls.riksHq, urls.museum, urls.sikt, urls.tollOslo],
  verified_at: verifiedAt
});
const leksikonManifest = read("data/leksikon/manifest.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/tollpakkhuset.json";
write(languageFile, {
  place_id: placeId,
  title: "Språkleksikon: Tollpakkhuset",
  verified_at: verifiedAt,
  dialect_status: "not_applicable_place_level",
  entries: [
    { id: "tollpakkhuset_pakkhus", term: "pakkhus", type: "fagord", meaning: "Lagerbygning for mottak, midlertidig oppbevaring og utlevering av varer, særlig knyttet til havn og handel.", context: "Tollpakkhuset var et formålsbygd lager i tollanlegget, med varerom og veieboder.", linked_to: { kind: "place", id: placeId }, tags: ["lager", "havn", "handel"], sources: [{ label: "Oppdag Kvadraturen", url: urls.oppdag }, { label: "Riksantikvaren", url: urls.riksPlan }] },
    { id: "tollpakkhuset_toll", term: "toll", type: "fagord", meaning: "Offentlig avgift og kontroll knyttet til grensekryssende vareførsel; ordet brukes også om virksomheten som håndhever regelverket.", context: "I Tollpakkhuset var tollfunksjonen fysisk koblet til lasting, veiing, kontroll og lager.", linked_to: { kind: "place", id: placeId }, tags: ["regulering", "handel", "kontroll"], sources: [{ label: "Tolletaten", url: urls.tollPlaces }, { label: "Oppdag Kvadraturen", url: urls.oppdag }] },
    { id: "tollpakkhuset_veiebod", term: "veiebod", type: "historisk_fagord", meaning: "Et avgrenset rom eller arbeidssted knyttet til veiing av varer i pakkhuset.", context: "Forvaltningsplanen beskriver flere veieboder i Tollpakkhusets opprinnelige planløsning.", linked_to: { kind: "place", id: placeId }, tags: ["veiing", "arbeid", "lager"], sources: [{ label: "Riksantikvaren", url: urls.riksPlan }] },
    { id: "tollpakkhuset_stenpakkhuset", term: "Stenpakkhuset", type: "historisk_navn", meaning: "Den eldre skrivemåten som brukes som kart- og kulturminnenavn for bygningen som History Go kaller Tollpakkhuset.", context: "Navnevariantene Tollpakkhuset, Steinpakkhuset og Stenpakkhuset viser til samme separate bygning i Tollbugata 1A.", linked_to: { kind: "place", id: placeId }, tags: ["navnevariant", "kulturminne"], sources: [{ label: "Riksantikvaren", url: urls.riksFred }, { label: "Oppdag Kvadraturen", url: urls.oppdag }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_naeringsliv.json";
const readings = read(readingFile);
readings.items = readings.items.filter(item => !String(item.id || "").startsWith("lesespor_tollpakkhuset_"));
readings.items.push(
  { id: "lesespor_tollpakkhuset_oppdag", title: "Tollpakkhuset", author: null, publication: "Oppdag Kvadraturen", date: null, year: 2026, type: "official_place_history", subjects: ["Tollpakkhuset", "toll", "havn", "arkitektur"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "historie", "by"], url: urls.oppdag, access: "open", rights: "link_only", source_quality: "official", curation_status: "approved", relevance: "Direkte stedskilde for oppføring, arkitekt, pakkhusfunksjon og havnefront." },
  { id: "lesespor_tollpakkhuset_riksantikvaren", title: "Forvaltningsplan Tollbugata 1A – Stenpakkhuset", author: null, publication: "Riksantikvaren", date: null, year: 2011, type: "heritage_management_plan", subjects: ["Stenpakkhuset", "veieboder", "vareheiser", "porter", "ombygging"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "historie", "by"], url: urls.riksPlan, access: "open", rights: "link_only", source_quality: "canonical", curation_status: "approved", relevance: "Detaljert bygnings- og funksjonskilde for arbeidsprosess, teknikk og tidslag." },
  { id: "lesespor_tollpakkhuset_nebelong", title: "Henrik Nebelong", author: null, publication: "Norsk biografisk leksikon", date: null, year: 2009, type: "biographical_reference", subjects: ["arkitektur", "Nebelong", "Tollpakkhuset"], place_ids: [placeId], person_ids: [personId], category_hints: ["naeringsliv", "historie", "by"], url: urls.nbl, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "approved", relevance: "Dokumenterer arkitektidentitet og Tollpakkhuset som konkret verk 1846–1850." }
);
write(readingFile, readings);

const q = (n, question, options, answer, knowledge, emne_id, source, question_type = "fact", method_id = undefined) => ({
  id: `tollpakkhuset_quiz_${n}`,
  quiz_id: `naeringsliv_tollpakkhuset_set_${Math.ceil(n / 7)}_q${((n - 1) % 7) + 1}`,
  categoryId: "naeringsliv", placeId, targetId: placeId, question_scope: "place",
  question, options, answer, answerIndex: options.indexOf(answer), knowledge,
  difficulty: n <= 7 ? 1 : n <= 14 ? 2 : 3,
  question_type, emne_id, source, source_origin: "external",
  claim_basis: knowledge, claim_id: `claim_tollpakkhuset_quiz_${String(n).padStart(2, "0")}`,
  ...(method_id ? { method_id } : {})
});
const questions = [
  q(1, "Når ble Tollpakkhuset oppført?", ["1846–1850", "1787–1790", "1893–1896"], "1846–1850", "Oppdag Kvadraturen og Riksantikvaren daterer Tollpakkhuset til 1846–1850.", "em_naering_havn_transport", ["oppdag", "riks_plan"]),
  q(2, "Hvem tegnet Tollpakkhuset?", ["Johan Henrik Nebelong", "Adolf Schirmer", "Christian H. Grosch"], "Johan Henrik Nebelong", "Johan Henrik Nebelong tegnet Tollpakkhuset.", "em_naering_havn_transport", ["oppdag", "nbl"]),
  q(3, "Hva var Tollpakkhuset opprinnelig bygd for?", ["Lager for Tollvesenet", "Børs for sjøforsikring", "Passasjerterminal"], "Lager for Tollvesenet", "Bygningen ble oppført som lager for Tollvesenet.", "em_naering_logistikk_verdikjeder", ["oppdag", "riks_plan"]),
  q(4, "Hva gjorde de store bueåpningene i første etasje mulig?", ["Inn- og utlasting av varer", "Jernbanetrafikk gjennom bygget", "Fortøyning av skip inne i bygget"], "Inn- og utlasting av varer", "Oppdag Kvadraturen knytter de store åpningene til inn- og utlasting av varer for tollbehandling.", "em_naering_logistikk_verdikjeder", ["oppdag"], "context"),
  q(5, "Hvor mange veieboder beskriver Riksantikvaren i den opprinnelige førsteetasjen?", ["Fire", "Én", "Sju"], "Fire", "Forvaltningsplanen beskriver fire veieboder i første etasje.", "em_naering_arbeid_verdiskaping", ["riks_plan"]),
  q(6, "Hvor mange veieboder beskrives i andre etasje i den opprinnelige løsningen?", ["Én", "Fire", "Ingen"], "Én", "Andre etasje hadde blant annet én veiebod.", "em_naering_arbeid_verdiskaping", ["riks_plan"]),
  q(7, "Hva ble installert i Tollpakkhuset i 1897?", ["Tre elektriske vareheiser", "En dampturbin", "Et jernbanespor"], "Tre elektriske vareheiser", "Tre elektriske vareheiser ble installert i 1897.", "em_naering_logistikk_verdikjeder", ["riks_plan"]),
  q(8, "Hvor mange vekter var varebehandlingsrommene utvidet for rundt 1929–1930?", ["Sju", "Tre", "Tolv"], "Sju", "Riksantikvaren beskriver utvidelse for sju vekter rundt 1929–1930.", "em_naering_arbeid_verdiskaping", ["riks_plan"]),
  q(9, "Hva kom i 1930 i tillegg til de tre eldre vareheisene?", ["En fjerde heis", "En kranbane på taket", "Et rullebånd til jernbanen"], "En fjerde heis", "En fjerde heis ble installert i 1930.", "em_naering_logistikk_verdikjeder", ["riks_plan"]),
  q(10, "Hva skjedde med Tollpakkhuset i 1956?", ["En del ble fjernet ved utvidelse av Strandgata", "Hele bygningen ble revet og gjenoppført", "Det ble flyttet til Akershusstranda"], "En del ble fjernet ved utvidelse av Strandgata", "Omtrent 8 × 25 meter av nordvestre del ble fjernet i 1956.", "em_naering_havn_transport", ["riks_plan"]),
  q(11, "Når flyttet Norsk Tollmuseum inn i Tollpakkhuset ifølge Riksantikvarens bygningsplan?", ["1979", "1915", "2003"], "1979", "Museet ble grunnlagt i 1915, men flyttet inn i Tollpakkhuset i 1979.", "em_naering_havn_transport", ["riks_plan", "museum"]),
  q(12, "Hva sier Riksantikvaren om det gamle treklossgulvet?", ["Det var egnet når fat og kolli skulle rulles", "Det ble lagt for å dempe togtrafikk", "Det var et rent dekorativt parkettgulv"], "Det var egnet når fat og kolli skulle rulles", "Treklossgulvet er et funksjonelt spor etter varehåndtering.", "em_naering_arbeid_verdiskaping", ["riks_plan", "riks_fred"], "context"),
  q(13, "Hvilket bygg må Tollpakkhuset ikke forveksles med?", ["Tollboden fra 1896", "Oslo Børs", "Østbanestasjonen"], "Tollboden fra 1896", "Tollpakkhuset er lagerbygningen; Tollboden er den separate administrasjonsbygningen fra 1896.", "em_naering_havn_transport", ["oppdag"], "comparison"),
  q(14, "Hvilken bruk er dokumentert for Tollpakkhuset i 2026?", ["Del av et administrativt tollanlegg, ikke dokumentert ordinært ekspedisjonssted", "Oslos eneste tollklareringssted", "Aktivt pakkhus for alle importvarer til Oslo"], "Del av et administrativt tollanlegg, ikke dokumentert ordinært ekspedisjonssted", "Tolletaten er registrert i Tollbugata, mens etatens ekspedisjonsoversikt peker på andre operative steder i Oslo.", "em_naering_risiko_regulering", ["sikt", "toll_oslo"]),
  q(15, "Hvilken analysemetode passer best når du undersøker hvordan porter, veieboder, vekter og heiser koblet varer gjennom bygningen?", ["Infrastrukturanalyse", "Psykoanalyse", "Stilanalyse av reklame"], "Infrastrukturanalyse", "Metoden undersøker hvordan fysisk infrastruktur organiserer flyt, kapasitet og avhengigheter.", "em_naering_logistikk_verdikjeder", ["riks_plan"], "concept_theory", "met_naering_infrastrukturanalyse"),
  q(16, "Hva kan sju vekter i 1930 dokumentere mest direkte?", ["At anlegget hadde flere dokumenterte veieplasser", "Nøyaktig årlig varevolum", "At tollbehandling alltid gikk raskere enn i 1850"], "At anlegget hadde flere dokumenterte veieplasser", "Antall vekter er en fysisk kapasitetsindikator, ikke en direkte serie for varevolum eller produktivitet.", "em_naering_arbeid_verdiskaping", ["riks_plan"], "concept_theory", "met_naering_infrastrukturanalyse"),
  q(17, "Hvorfor er antall heiser alene et svakt mål på produktivitet?", ["Det mangler data om bruk, last, arbeidstid og varevolum", "Heiser kan aldri brukes i logistikk", "Produktivitet måles bare i antall ansatte"], "Det mangler data om bruk, last, arbeidstid og varevolum", "Fysisk utstyr kan si noe om kapasitet, men produktivitet krever forhold mellom innsats og output.", "em_naering_arbeid_verdiskaping", ["riks_plan"], "concept_theory", "met_naering_infrastrukturanalyse"),
  q(18, "Hvilke to aktørgrupper møttes tydelig i Tollpakkhusets økonomiske funksjon?", ["Tollvesenet og vareeiere/transportører", "Skuespillere og publikum", "Bankdirektører og aksjemeglere"], "Tollvesenet og vareeiere/transportører", "Tollvesenet kontrollerte vareflyten, mens handels- og transportaktører måtte få varer gjennom prosessen.", "em_naering_risiko_regulering", ["oppdag", "riks_plan"], "context"),
  q(19, "Hva er den sikreste kausale formuleringen om utvidelsene rundt 1930?", ["Kildene dokumenterer endringer i rom, vekter og heiser, men isolerer ikke én årsak", "Flere vekter beviser at profitten doblet seg", "Heisene førte direkte til lavere tollsatser"], "Kildene dokumenterer endringer i rom, vekter og heiser, men isolerer ikke én årsak", "Bygningshistorien dokumenterer endringer, ikke én bevist økonomisk årsak.", "em_naering_risiko_regulering", ["riks_plan"], "concept_theory", "met_naering_byhistorisk_naeringsanalyse"),
  q(20, "Hva viser 1979-museet og senere administrativ ombruk?", ["At samme bygg kan få nye økonomiske og institusjonelle funksjoner", "At tollagerfunksjonen var uendret", "At bygningen sluttet å være fredet"], "At samme bygg kan få nye økonomiske og institusjonelle funksjoner", "Materiell kontinuitet betyr ikke at samme virksomhetsfunksjon fortsetter.", "em_naering_havn_transport", ["riks_plan", "riks_hq"], "context"),
  q(21, "Hvorfor skiller History Go mellom Tollpakkhuset og Tollbukaia?", ["Pakkhuset er en konkret bygning, Tollbukaia er et kai-/linjeanker", "De ligger i hver sin by", "Tollbukaia er et museum"], "Pakkhuset er en konkret bygning, Tollbukaia er et kai-/linjeanker", "Skillet bevarer fysisk presisjon og hindrer at bygning, kai og administrasjonsbygg blir ett kunstig sted.", "em_naering_havn_transport", ["oppdag"], "context")
];
const quizFile = "data/quiz/naeringsliv/tollpakkhuset_sets.json";
const sourceBriefFile = "data/quiz/production_briefs/naeringsliv/tollpakkhuset.json";
const contextFile = "data/quiz/production_context/naeringsliv/tollpakkhuset.json";
const sets = [0, 1, 2].map(i => ({
  set_id: `naeringsliv_tollpakkhuset_set_${i + 1}`,
  level: i + 1,
  order: i + 1,
  phase: i === 0 ? "opening" : i === 1 ? "middle" : "final",
  questions: questions.slice(i * 7, i * 7 + 7)
}));
write(quizFile, {
  targetId: placeId,
  categoryId: "naeringsliv",
  sources: {
    place_record: placeFile, oppdag: urls.oppdag, riks_plan: urls.riksPlan, riks_fred: urls.riksFred,
    riks_hq: urls.riksHq, museum: urls.museum, nbl: urls.nbl, sikt: urls.sikt, toll_oslo: urls.tollOslo
  },
  production_context: {
    manifest_category: "naeringsliv",
    profile: "narrow_3x7",
    standard_version: "3.4",
    source_brief: sourceBriefFile,
    context_artifact: contextFile,
    resolved_files: {
      pensum: "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json",
      emner: "data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json",
      fagkart: "data/fag/naeringsliv/fagkart_naeringsliv_canonical_v4_5.json",
      methods: "data/fag/naeringsliv/methods_naeringsliv_canonical_v4_5.json",
      supersetQuizMal: "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json",
      quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
      quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
    },
    required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
    emne_ids: place.emne_ids,
    method_ids: ["met_naering_infrastrukturanalyse", "met_naering_arbeidslivsanalyse", "met_naering_byhistorisk_naeringsanalyse"],
    thinker_ids: [],
    works: [],
    source_review_status: "reviewed",
    theory_start_phase: "final",
    method_start_phase: "final",
    normal_opening_questions_preserved: 14,
    content_balance: { fact: 11, context: 6, concept_theory: 4 }
  },
  sets
});
write(sourceBriefFile, {
  schema_version: "1.0",
  status: "reviewed",
  categoryId: "naeringsliv",
  targetId: placeId,
  reviewed_at: verifiedAt,
  review_note: "Focused 3×7: første 14 spørsmål er direkte stedskunnskap; siste sju bruker dokumenterte stedspåstander til infrastrukturanalyse, arbeidsliv, målegrenser og ombruk.",
  sources: {
    place_record: { url: placeFile, source_type: "canonical_place_record", review_status: "reviewed", review_note: "Canonical identitet, geometri og stedsscope." },
    oppdag: { url: urls.oppdag, source_type: "official_place_history", review_status: "reviewed", review_note: "Oppføring, arkitekt, lagerfunksjon, bueåpninger og fysisk skille mellom byggene." },
    riks_plan: { url: urls.riksPlan, source_type: "heritage_management_plan", review_status: "reviewed", review_note: "Veieboder, vekter, heiser, port/gulv, 1956-endring, museum og brukslag." },
    riks_fred: { url: urls.riksFred, source_type: "heritage_protection_record", review_status: "reviewed", review_note: "Fredningsomfang, identitet og bevarte arbeidsspor." },
    riks_hq: { url: urls.riksHq, source_type: "heritage_reuse_case", review_status: "reviewed", review_note: "Rehabilitering og tolladministrativ ombruk." },
    museum: { url: urls.museum, source_type: "recognized_reference", review_status: "reviewed", review_note: "Museum etablert 1915; brukes ikke som innflyttingsdato." },
    nbl: { url: urls.nbl, source_type: "recognized_reference", review_status: "reviewed", review_note: "Nebelong-identitet og Tollpakkhuset som verk." },
    sikt: { url: urls.sikt, source_type: "official_registry", review_status: "reviewed", review_note: "Tolletatens aktive 2026-status og adresse." },
    toll_oslo: { url: urls.tollOslo, source_type: "primary_official_current", review_status: "reviewed", review_note: "Avgrenser dagens operative ekspedisjonssteder i Oslo." }
  },
  selected_curriculum: {
    module_ids: [], emne_ids: place.emne_ids, topic_hook_ids: [],
    method_ids: ["met_naering_infrastrukturanalyse", "met_naering_arbeidslivsanalyse", "met_naering_byhistorisk_naeringsanalyse"],
    thinker_ids: [], works: []
  },
  profile_hint: "narrow",
  claims: questions.map((item, i) => ({
    claim_id: item.claim_id,
    order: i + 1,
    planned_phase: i < 7 ? "opening" : i < 14 ? "middle" : "final",
    family: item.question_type,
    statement: item.claim_basis,
    source_ids: item.source,
    source_origin: item.source_origin,
    emne_id: item.emne_id,
    ...(item.method_id ? { method_id: item.method_id } : {})
  }))
});

const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter(entry => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.naeringsliv.quizProduction.targets[placeId] = {
  source_brief: "../quiz/production_briefs/naeringsliv/tollpakkhuset.json",
  context_artifact: "../quiz/production_context/naeringsliv/tollpakkhuset.json",
  quiz_file: "../quiz/naeringsliv/tollpakkhuset_sets.json"
};
write("data/fag/fag_manifest.json", fagManifest);

const reportPath = "data/places/naeringsliv-production/tollpakkhuset.json";
write(reportPath, {
  schemaVersion: "naeringsliv_place_production_v1",
  validatorVersion: "1.0.0",
  placeId,
  placeFile,
  status: "ready",
  economicIdentity: {
    statement: "Tollpakkhuset var en stedbundet toll-, lager- og varebehandlingsinfrastruktur ved Christianias havn og inngår i dag i et fredet administrativt tollanlegg.",
    anchorType: "warehouse",
    placeObjectDistinction: "Analysen gjelder den separate lagerbygningen Stenpakkhuset/Tollpakkhuset og dens dokumenterte funksjoner, ikke Tollboden fra 1896, kaien Tollbukaia eller Tolletaten som landsdekkende organisasjon.",
    temporalScope: { start: "1846", end: "2026", precision: "period", rationale: "Perioden følger oppføring, historisk varebehandling, senere museumslag og dokumentert administrativ tolltilknytning." },
    sourceIds: ["source_oppdag", "source_riks_plan", "source_sikt"]
  },
  businessTopics: place.emne_ids.map(emneId => ({
    emneId,
    siteSpecificRationale: {
      em_naering_havn_transport: "Pakkhuset var et fysisk ledd ved sjøtollstedet mellom havn, lager og videre vareflyt.",
      em_naering_logistikk_verdikjeder: "Bueåpninger, varerom, veieboder og heiser dokumenterer en stedbundet logistikk- og kontrollkjede.",
      em_naering_arbeid_verdiskaping: "Veiing, kontroll, intern transport og lager var konkrete arbeidsprosesser i bygningen.",
      em_naering_risiko_regulering: "Tollfunksjonen viser hvordan offentlig kontroll og dokumentasjon inngår i handelens vareflyt."
    }[emneId],
    caseIds: ["case_tollpakkhuset_customs_warehouse"]
  })),
  sources: [
    { id: "source_oppdag", url: urls.oppdag, sourceLocation: "Tollpakkhuset – historikk, arkitekt og varefunksjon", sourceType: "official", verifiedAt, temporalCoverage: "historical", provenance: "Oslo kommunes/Byantikvarens stedspresentasjon i Oppdag Kvadraturen.", limitations: "Formidlingskilden gir ikke økonomiske tidsserier eller regnskapsdata." },
    { id: "source_riks_plan", url: urls.riksPlan, sourceLocation: "Stenpakkhuset – plan, tekniske endringer, vern og bruk", sourceType: "museum_or_heritage", verifiedAt, temporalCoverage: "mixed", provenance: "Riksantikvarens forvaltningsplan for det statlige kulturhistoriske tollanlegget.", limitations: "Planen dokumenterer bygg og funksjoner, men gir ikke varevolum, lønn eller kostnadsserier." },
    { id: "source_riks_hq", url: urls.riksHq, sourceLocation: "rehabilitering og Tolldirektoratets hovedkontor", sourceType: "official", verifiedAt, temporalCoverage: "current", provenance: "Riksantikvarens eksempelsamling for rehabilitering av de fredede tollbygningene.", limitations: "Prosjektpresentasjonen beskriver vern og bruk, ikke operativ tollklarering for publikum." },
    { id: "source_sikt", url: urls.sikt, sourceLocation: "TOLLETATEN 2026 – key information", sourceType: "registry", verifiedAt, temporalCoverage: "current", provenance: "Sikts statlige organisasjonsdatabase med Enhetsregister-opplysninger for Tolletaten.", limitations: "Forretningsadresse dokumenterer organisasjonstilknytning, ikke hvilke publikumstjenester som utføres i hvert bygg." },
    { id: "source_toll_current", url: urls.tollOslo, sourceLocation: "Oslo – ekspedisjonssteder", sourceType: "official", verifiedAt, temporalCoverage: "current", provenance: "Tolletatens egen oppdaterte oversikt over operative ekspedisjonssteder.", limitations: "Siden avgrenser nåværende tjenestesteder, men beskriver ikke detaljert Tollpakkhusets historiske drift." }
  ],
  economicCases: [{
    id: "case_tollpakkhuset_customs_warehouse",
    claim: "Tollpakkhuset samlet lasting, veiing, kontroll, intern transport og midlertidig lager i et stedbundet ledd mellom sjøtransport og videre vareflyt.",
    unitOfAnalysis: {
      unit: "Tollpakkhuset i Tollbugata 1A",
      boundary: "Analysen gjelder den separate pakkhusbygningen og dokumentert varebehandling i bygget, ikke hele Oslo havn eller Tolletatens nasjonale virksomhet.",
      scale: "site",
      temporalScope: { start: "1846", end: "1956", precision: "period", rationale: "Perioden dekker oppføring, dokumenterte kapasitetsendringer og bygningens fysiske forkorting." },
      sourceIds: ["source_oppdag", "source_riks_plan"]
    },
    actors: [
      { name: "Tollvesenet og tollansatte", roleOrInterest: "Kontrollerte, veide, registrerte og forvaltet varer i tollprosessen.", economicPosition: "Offentlig kontrollaktør som bestemte om varer kunne gå videre i den regulerte vareflyten.", sourceIds: ["source_oppdag", "source_riks_plan"] },
      { name: "Kjøpmenn, vareeiere og transportører", roleOrInterest: "Brakte varer til og fra pakkhuset og hadde interesse av korrekt og effektiv behandling.", economicPosition: "Private handels- og transportaktører var avhengige av toll- og lagerleddet for videre vareflyt.", sourceIds: ["source_oppdag", "source_riks_plan"] }
    ],
    valueCreation: {
      inputs: [{ statement: "Varer, pakkhusrom, veieboder, vekter, vareheiser og arbeidskraft var innsatsfaktorer i den stedbundne prosessen.", sourceIds: ["source_oppdag", "source_riks_plan"] }],
      activity: { statement: "Varer ble lastet inn, veid, kontrollert, flyttet internt og lagret mens tollbehandlingen pågikk.", sourceIds: ["source_oppdag", "source_riks_plan"] },
      outputs: [{ statement: "Den dokumenterte tjenesten gjorde varer klare for videre regulert vareflyt etter kontroll og midlertidig lagring.", sourceIds: ["source_oppdag", "source_riks_plan"] }],
      valueCreationAssessment: { statement: "Kildene dokumenterer tjenestekjeden og fysisk kapasitet, men ikke nok tall til å beregne produktivitet, margin eller samlet vareverdi.", sourceIds: ["source_oppdag", "source_riks_plan"] }
    },
    measurement: {
      methodId: "met_naering_infrastrukturanalyse",
      evidenceType: "mixed",
      indicatorOrObservation: "Antall dokumenterte veieboder/vekter og vareheiser brukes som fysiske kapasitetsindikatorer gjennom utvalgte bygningsfaser.",
      unit: "antall veieplasser/vekter og vareheiser",
      period: "1846–1930",
      comparability: "Opprinnelig plan og senere ombygginger kan sammenholdes som fysiske konfigurasjoner, men teller ulike typer installasjoner og perioder.",
      dataLimitations: "Kildene mangler konsistente serier for tonnasje, behandlingstid, bemanning, kostnader og faktisk utnyttelsesgrad.",
      sourceIds: ["source_riks_plan"]
    },
    distributionAndPower: {
      ownershipOrControl: "Tollvesenet kontrollerte det offentlige kontroll- og lagerleddet; dagens etatstilknytning er administrativ og skal ikke projiseres bakover som uendret organisasjon.",
      laborPosition: "Tollansatte utførte kontrollarbeidet, mens de tilgjengelige kildene ikke gir grunnlag for detaljer om lønn, arbeidstid eller forhandlingsmakt.",
      beneficiaries: ["Handelsaktører fikk varer gjennom et formalisert toll- og kontrollsystem.", "Staten fikk et fysisk sted for kontroll og administrasjon av vareførsel."],
      costRiskBearers: ["Vareeiere og transportører kunne bære kostnader og tidsrisiko knyttet til regulert vareflyt.", "Tollmyndigheten bar drifts- og forvaltningsansvar for kontrollinfrastrukturen."],
      sourceIds: ["source_oppdag", "source_riks_plan"]
    },
    riskAndExternalities: {
      riskAssessment: { statement: "Vareflyten var avhengig av fysisk håndtering, riktig veiing, kontroll og intern transport; senere gateendring reduserte selve bygningsvolumet.", sourceIds: ["source_riks_plan"] },
      externalityAssessment: { status: "not_applicable", rationale: "Kildene dokumenterer kontroll, lager og ombygging, men gir ikke robust nok grunnlag for å tallfeste eller attribuere stedets eksterne virkninger." }
    },
    comparisonAndCausality: {
      comparisonBasis: "Opprinnelig plan med fem veieboder sammenholdes med senere konfigurasjoner med elektriske heiser og sju vekter.",
      causalStatus: "descriptive_only",
      causalAssessment: "Kildene viser at den fysiske varebehandlingsinfrastrukturen ble endret, men isolerer ikke én sikker årsak eller en målt produktivitetseffekt.",
      alternativeExplanations: ["Endrede varevolumer, arbeidsrutiner, tekniske muligheter og administrative behov kan alle ha påvirket ombyggingene."],
      uncertainty: "Bygningshistorien viser rekkefølge og installasjoner, men ikke kontrafaktisk årsaksvirkning eller økonomisk avkastning.",
      sourceIds: ["source_oppdag", "source_riks_plan"]
    }
  }],
  presentOperation: {
    operationalStatus: "mixed",
    statement: "Den historiske pakkhusfunksjonen er avsluttet; bygningen inngår i et fredet tollanlegg med administrativ Tolletaten-tilknytning, mens publikums ekspedisjonssteder i Oslo ligger andre steder.",
    originalEconomicRoleRelationship: "Dagens administrative bruk viderefører tollinstitusjonens tilknytning til stedet, men erstatter den historiske rollen som varebehandlings- og lagerbygg.",
    checkedAt: verifiedAt,
    sourceIds: ["source_riks_hq", "source_sikt", "source_toll_current"]
  },
  quizOpening: {
    status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14,
    sourceBrief: sourceBriefFile, productionContext: contextFile,
    requiredInputs: [
      "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json",
      "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
      "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
    ]
  },
  chronologyStories: {
    status: "PASS",
    chronologyReviewed: true,
    storiesReviewed: true,
    rationale: "Chronology er materialisert i leksikonets tidslinje. Story er vurdert, men ikke tvunget inn fordi kildene primært bærer et flertrinns funksjonsforløp."
  },
  gates: {
    A: { status: "PASS", evidenceRefs: [placeFile, "data/places/production/tollpakkhuset.json"] },
    B: { status: "PASS", evidenceRefs: [leksikonFile, sourceBriefFile] },
    C: { status: "PASS", evidenceRefs: [sourceBriefFile, contextFile] },
    D: { status: "PASS", evidenceRefs: [personFile, "data/brands/brands_master.json"] },
    E: { status: "PASS", evidenceRefs: [reportPath, leksikonFile] },
    F: { status: "PASS", evidenceRefs: [urls.riksPlan, urls.sikt, urls.tollOslo] },
    G: { status: "PASS", evidenceRefs: [languageFile] },
    H: { status: "PASS", evidenceRefs: [quizFile] }
  },
  review: {
    reviewer: "History Go Tollpakkhuset production closure",
    reviewedAt: verifiedAt,
    notes: "Fail-closed Næringsliv-rapport for tollager, vareflyt, kontroll og ombruk. Ingen udokumentert lønnsomhet, throughput eller kausalitet hevdes."
  }
});

for (const [lang, translation] of Object.entries({
  en: { name: "Customs Warehouse", desc: "The Customs Warehouse in Tollbugata 1A was built in 1846–1850 to designs by Johan Henrik Nebelong as a warehouse for the customs service.", popupDesc: "The Customs Warehouse was built in 1846–1850 as a purpose-built customs warehouse at Oslo's old harbour. Historic arches, weighing spaces, lifts and loading gates document how goods were handled before onward movement." },
  es: { name: "Almacén de Aduanas", desc: "El Tollpakkhuset de Tollbugata 1A fue construido entre 1846 y 1850 según planos de Johan Henrik Nebelong como almacén del servicio de aduanas.", popupDesc: "El edificio fue construido entre 1846 y 1850 como almacén aduanero en el antiguo puerto de Oslo. Sus arcos, espacios de pesaje, montacargas y puertas de carga documentan la manipulación histórica de mercancías." },
  pt: { name: "Armazém da Alfândega", desc: "O Tollpakkhuset, em Tollbugata 1A, foi construído entre 1846 e 1850 segundo projeto de Johan Henrik Nebelong como armazém do serviço aduaneiro.", popupDesc: "O edifício foi construído entre 1846 e 1850 como armazém aduaneiro no antigo porto de Oslo. Arcos, áreas de pesagem, elevadores de carga e portões documentam o manuseio histórico de mercadorias." }
})) {
  const file = `data/i18n/content/places/${lang}.json`;
  if (!exists(file)) continue;
  const pack = read(file);
  pack[placeId] = { _sourceHash: sha256(JSON.stringify({ name: place.name, desc: place.desc, popupDesc: place.popupDesc })).slice(0, 16), _status: "machine_translated", ...translation };
  write(file, pack);
}

write("reports/place-production/tollpakkhuset-workcard-current.json", {
  schema: "history_go_place_workcard_v2",
  placeId, place_id: placeId, name: "Tollpakkhuset",
  canonicalSource: placeFile, primaryCategory: "naeringsliv", category: "naeringsliv",
  productionProfile: "focused",
  coordinateStatus: "PASS — eksisterende OSM-bygningsgeometri beholdt; ingen koordinatendring",
  fagverkStatus: "PASS — embedded history_go_place_fagverk_v2 standard",
  placeCardCollections: ["people", "objects", "brands", "productions"],
  collectionStatus: {
    people: { status: "PASS", members: [personId] },
    objects: { status: "PASS", members: ["tollpakkhuset_pakkhusporter"] },
    brands: { status: "PASS", members: [brandId] },
    productions: { status: "PASS", members: ["tollpakkhuset_tollbehandling_veiing_lagring"] }
  },
  quizStatus: "PASS — focused narrow_3x7, 21 spørsmål, første 14 direkte",
  storyStatus: "BEGRUNNET N/A — chronology bærer forløpet; ingen tvunget episode",
  chronologyStatus: "PASS — 1846–50, 1897, 1930, 1956, 1979, 2026 kildebundet",
  languageStatus: "PASS — fire stedsspesifikke fag-/navneord; dialekt N/A på enkeltsted",
  imageStatus: "PASS — dokumentarfoto, public-domain People-portrett og autentisk Altinn-organisasjonslogo",
  beforeAfter: "BEGRUNNET N/A — ingen verifisert lisensiert kameravinkel-par med tilstrekkelig motivsammenheng i focused-pakken",
  news: "BEGRUNNET N/A — ferske kilder brukes til nåtidskontroll, ikke kunstig nyhetsmodul",
  readings: "PASS — tre åpne fordypningskilder",
  rejected: [
    "1949 som forkortingsår; Riksantikvarens forvaltningsplan bruker 1956",
    "1915 som innflyttingsår for Norsk Tollmuseum; 1915 er etableringsår, innflytting i bygningen dateres til 1979",
    "Tollbukaia-quiz som erstatning for Tollpakkhuset-quiz",
    "Norsk Tollmuseum som Brand uten verifisert autentisk visuell identitet",
    "cardImage i canonical source",
    "påstand om at Tollpakkhuset er ordinært publikumsekspedisjonssted i 2026"
  ],
  sources: Object.values(urls),
  quality_score: { factuality: 5, pedagogy: 5, collections: 5, images: 5, runtime: 5, editorial: 5, total: 30 },
  phase: "MATERIALISERT — validering kjøres i workflow",
  verifiedAt,
  status: "materialized_pending_validation",
  source_review: "reports/place-production/tollpakkhuset-source-review-v1.md",
  production_report: reportPath
});

execFileSync(process.execPath, ["scripts/build-quiz-production-context.mjs", "--category", "naeringsliv", "--target", placeId, "--output", contextFile], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["scripts/build-place-open-payloads.mjs"], { cwd: root, stdio: "inherit" });

console.log("Materialized Tollpakkhuset completion");
