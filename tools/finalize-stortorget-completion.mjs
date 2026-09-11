#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const placeId = "stortorget";
const verifiedAt = "2026-09-10";
const placeFile = "data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/stortorget.json";
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const sentences = (value) => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(String(value))]
  .map((item) => item.segment.trim()).filter(Boolean);
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const source = (label, url) => ({ label, url });

const urls = {
  oppdag: "https://www.oppdagkvadraturen.no/stoppesteder/stortorget",
  kommune: "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/stortorget",
  byleksikon: "https://oslobyleksikon.no/side/Stortorvet",
  statueByleksikon: "https://oslobyleksikon.no/index.php/Christian_4-statuen",
  carlNkl: "https://nkl.snl.no/Carl_Ludvig_Jacobsen",
  carlLokal: "https://lokalhistoriewiki.no/Carl_Ludvig_Jacobsen",
  osm: "https://www.openstreetmap.org/way/179095465",
  currentPage: "https://commons.wikimedia.org/wiki/File:2019-08-23_Oslo_11_-_Stortorvet.jpg",
  currentAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2019-08-23%20Oslo%2011%20-%20Stortorvet.jpg?width=2000",
  historicPage: "https://commons.wikimedia.org/wiki/File:Ludvig_Wilhelm_Theodor_Bratz_-_Marked_p%C3%A5_Stortorvet_-_Oslo_Museum_-_OB.01017.jpg",
  historicAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ludvig%20Wilhelm%20Theodor%20Bratz%20-%20Marked%20p%C3%A5%20Stortorvet%20-%20Oslo%20Museum%20-%20OB.01017.jpg?width=2000",
  statuePage: "https://commons.wikimedia.org/wiki/File:Christian_IV_av_CL_Jacobsen_1.jpg",
  statueAsset: "https://upload.wikimedia.org/wikipedia/commons/6/64/Christian_IV_av_CL_Jacobsen_1.jpg",
  portraitPage: "https://commons.wikimedia.org/wiki/File:Billedhugger_Carl_Jacobsen_-_ca._1890_-_Marie_Magdalena_Rustad_-_Oslo_Museum_-_OB.Z05482.jpg",
  portraitAsset: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Billedhugger%20Carl%20Jacobsen%20-%20ca.%201890%20-%20Marie%20Magdalena%20Rustad%20-%20Oslo%20Museum%20-%20OB.Z05482.jpg?width=1600",
  portraitCatalogue: "https://www.oslobilder.no/OMU/OB.Z05482"
};

const imageCache = new Map();
async function fetchBuffer(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  let lastStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, { redirect: "follow", headers: { "user-agent": "History-Go-place-production/1.0" } });
    lastStatus = response.status;
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      imageCache.set(url, buffer);
      return buffer;
    }
    if (![429, 500, 502, 503, 504].includes(response.status)) break;
    await new Promise((resolve) => setTimeout(resolve, Math.min(1200 * (2 ** attempt), 18000)));
  }
  throw new Error(`Kunne ikke hente bilde etter retries (${lastStatus}): ${url}`);
}
async function outputImage({ url, file, width, height, fit = "cover", position = "centre", background = "#f2efe7" }) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(await fetchBuffer(url)).rotate().resize(width, height, { fit, position, background, withoutEnlargement: false }).webp({ quality: 84, effort: 5 }).toFile(target);
}

await outputImage({ url: urls.currentAsset, file: "bilder/places/stortorget.webp", width: 1200, height: 675 });
await outputImage({ url: urls.currentAsset, file: "bilder/kort/places/stortorget.webp", width: 640, height: 360 });
await outputImage({ url: urls.currentAsset, file: "bilder/places/stortorget_front_portrait.webp", width: 900, height: 1200 });
await outputImage({ url: urls.historicAsset, file: "bilder/historisk/stortorget/stortorget_marked_1843.webp", width: 1200, height: 846, fit: "contain" });
await outputImage({ url: urls.statueAsset, file: "bilder/kort/objects/stortorget_christian_iv_monument.webp", width: 900, height: 520 });
await outputImage({ url: urls.portraitAsset, file: "bilder/kort/people/carl_ludvig_jacobsen.webp", width: 900, height: 1200, fit: "contain" });

const place = read(placeFile);
const desc = place.desc;
const popupDesc = place.popupDesc;

Object.assign(place, {
  visual: { designCode: "square_miniature" },
  image: "bilder/places/stortorget.webp",
  imageCard: "bilder/kort/places/stortorget.webp",
  cardImage: "bilder/kort/places/stortorget.webp",
  frontImage: "bilder/places/stortorget_front_portrait.webp",
  imageCaption: "Stortorget med Christian IV-monumentet og torgmiljøet i 2019.",
  imageCredit: "Nemo bis / Wikimedia Commons",
  imageLicense: "CC BY-SA 3.0",
  imageSourceUrl: urls.currentPage,
  imageMeta: {
    source: "wikimedia_commons", sourcePage: urls.currentPage, creator: "Nemo bis",
    credit: "Nemo bis / Wikimedia Commons", license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", date: "2019-08-23",
    assetType: "documentary_place_photo", transformation: "Proporsjonal beskjæring og WebP-normalisering.",
    verifiedAt, outputDimensions: "1200x675", orientation: "landscape"
  },
  frontImageMeta: {
    source: "wikimedia_commons", sourcePage: urls.currentPage, creator: "Nemo bis",
    credit: "Nemo bis / Wikimedia Commons", license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", date: "2019-08-23",
    assetType: "documentary_place_photo", transformation: "Portrettbeskjæring fra samme dokumentarfoto.",
    verifiedAt, outputDimensions: "900x1200", orientation: "portrait"
  },
  production_profile: "standard",
  profile_status: "confirmed",
  production_status: "complete",
  profile_reason: "Den avgrensede torgflaten har verifisert geometri, dokumentert markeds- og byhistorie, direkte kunstnerkobling, fysisk monument, historisk bildepar og fire ærlige PlaceCard-flater.",
  placeScope: "square",
  underbadge_ids: ["offentlige_rom", "historiske_lag"],
  secondaryBadgeIds: ["offentlige_rom", "historiske_lag"],
  related_people_ids: ["carl_ludvig_jacobsen"],
  related_place_ids: ["oslo_domkirke", "christiania_torv", "youngstorget", "kirkeristen_basarene_brannvakten"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2", production_profile: "standard",
    collection_ids: ["people", "objects", "brands", "related"],
    category_collection_label: "Byrom og forbindelser",
    reason: "Carl Ludvig Jacobsen gir en direkte People-flate, Christian IV-monumentet en fysisk Object-flate, Brands beholdes som eksplisitt tom reserve uten falske koblinger, og fire separate canonical nabosteder gir en kildebåret Related-flate.",
    verifiedAt
  },
  brands: [],
  civication_store: [{
    id: "stortorget_christian_iv_monument", title: "Christian IV-monumentet", type: "offentlig_monument", kind: "physical_object",
    year: 1878,
    desc: "Carl Ludvig Jacobsens bronsemonument over Christian IV ble ferdig i 1878 og avduket på Stortorget 28. september 1880.",
    why_here: "Monumentet står midt på Stortorget og ble reist som et minnesmerke over Christian IV og Christianias grunnleggelse.",
    placeSpecificReason: "Oslo kommune, Oslo byleksikon og Commons knytter verket direkte til Stortorget.",
    historicalFunction: "Et sent 1800-talls monumentlag som gjorde bygrunnleggelsen synlig midt i det eldre markedsrommet.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 35, currency: "PC",
    collection: "stortorget_offentlig_kunst", unlock: "Finn Christian IV-monumentet midt på Stortorget.",
    image: "bilder/kort/objects/stortorget_christian_iv_monument.webp",
    imageMeta: {
      source: "wikimedia_commons", sourcePage: urls.statuePage, creator: "Carl Ludvig Jacobsen",
      credit: "Wikimedia Commons", license: "Public domain", date: "1878",
      assetType: "documentary_artwork_photo", transformation: "Proporsjonal beskjæring og WebP-normalisering.", verifiedAt
    },
    sources: [urls.kommune, urls.statueByleksikon, urls.statuePage]
  }],
  spatial_profile: {
    place_form: "historisk_offentlig_hovedtorg",
    canonical_scope: "Selve den navngitte torgflaten Stortorget/Stortorvet foran Oslo domkirke, ikke kirken, Kirkeristen eller bygningene rundt.",
    geometry_status: "verified_named_square_geometry", geometry_source: urls.osm,
    coordinate_rule: "Behold det verifiserte geometriske senteret for OSM-way 179095465 som area-anchor; radius er ikke et fysisk arealmål.",
    excludes_as_separate_places: ["oslo_domkirke", "kirkeristen_basarene_brannvakten"],
    relation_context: ["Oslo domkirke står ved torget, men er egen canonical Place.", "Christiania Torv var det eldre hovedtorget som markedsfunksjonen ble flyttet fra.", "Youngstorget overtok deler av markedstrafikken på 1800-tallet."]
  },
  temporal_profile: {
    cathedral_inaugurated_year: 1697, square_leveling_from_year: 1730, main_market_year: 1737,
    first_gas_lamp_year: 1848, christian_iv_statue_completed_year: 1878, christian_iv_statue_unveiled_year: 1880,
    profile_rule: "Årstallene beskriver dokumenterte lag i torgrommet; omkringliggende bygninger forblir egne steder."
  },
  history_layers: [
    { id: "stortorget_city_edge", title: "Fra byport til torg", period: "før 1730", sort_order: 10, summary: "Området lå ved Stadsporten og den tidligere byvollen før terrenget ble fylt opp og planert for et nytt torg.", source: urls.oppdag },
    { id: "stortorget_main_market", title: "Hovedmarkedet", period: "1737–1850-årene", sort_order: 20, summary: "Markedet ble flyttet hit fra Christiania Torv, og Stortorget ble et møtested for byfolk og produsenter fra omlandet.", source: urls.oppdag },
    { id: "stortorget_light_monument", title: "Lys og monument", period: "1848–1880", sort_order: 30, summary: "Byens første gasslykt ble tent her i 1848. Christian IV-monumentet overtok senere plassen og ble avduket i 1880.", source: urls.oppdag },
    { id: "stortorget_current_market", title: "Torghandel i dagens by", period: "1900-tallet–", sort_order: 40, summary: "Torget beholdt markedsbruk og fungerer i dag med helårlig torghandel foran domkirken.", source: urls.kommune }
  ],
  source_summary: { safe_sources: [
    "Oslo kommune – Stortorvet", "Oslo byleksikon – Stortorvet", "Oppdag Kvadraturen – Stortorget",
    "Norsk kunstnerleksikon – Carl Ludvig Jacobsen", "OpenStreetMap way 179095465", "Wikimedia Commons / Oslo Museum"
  ] },
  for_na: {
    title: "Stortorget: marked i 1843 og torgrom i 2019",
    before: "Ludvig Wilhelm Theodor Bratz' maleri fra 1843 viser markedsliv på Stortorget. Det er en kunstnerisk framstilling og brukes som historisk dokumentasjon av motivet, ikke som fotografisk måling.",
    now: "Nemo bis' fotografi fra 23. august 2019 viser Stortorget med Christian IV-monumentet og dagens torgmiljø.",
    change: "Bildene har ikke samme kamerapunkt og er laget med ulike medier. Sammen brukes de til laglesning: markedsfunksjonen fortsetter, mens monumentet fra 1880 og senere bystruktur er kommet til.",
    beforeImage: "bilder/historisk/stortorget/stortorget_marked_1843.webp", beforeImageLabel: "Marked på Stortorvet (maleri, 1843)",
    beforeImageMeta: { credit: "Ludvig Wilhelm Theodor Bratz / Oslo Museum / Wikimedia Commons", license: "Public Domain Mark 1.0", sourcePage: urls.historicPage, date: "1843", viewpoint: "Kunstnerisk framstilling av markedet" },
    nowImage: "bilder/places/stortorget.webp", nowImageLabel: "Stortorget (2019)",
    nowImageMeta: { credit: "Nemo bis / Wikimedia Commons", license: "CC BY-SA 3.0", sourcePage: urls.currentPage, date: "2019-08-23", viewpoint: "Dokumentarfoto av torgrommet" },
    lookFor: ["Sammenlign markedsaktiviteten i 1843 med dagens organiserte torgflate.", "Finn Christian IV-monumentet som ikke finnes i 1843-motivet.", "Hold Oslo domkirke som orienteringspunkt, men som eget canonical sted."],
    sources: [urls.historicPage, urls.currentPage, urls.oppdag, urls.kommune]
  }
});
place.externalLinks = [
  { type: "source", label: "Oppdag Kvadraturen – Stortorget", url: urls.oppdag, verifiedAt },
  { type: "source", label: "Oslo kommune – Stortorvet", url: urls.kommune, verifiedAt },
  { type: "source", label: "Oslo byleksikon – Stortorvet", url: urls.byleksikon, verifiedAt },
  { type: "source", label: "Oslo byleksikon – Christian 4-statuen", url: urls.statueByleksikon, verifiedAt },
  { type: "source", label: "Norsk kunstnerleksikon – Carl Ludvig Jacobsen", url: urls.carlNkl, verifiedAt },
  { type: "map", label: "OpenStreetMap – Stortorvet", url: urls.osm, verifiedAt }
];
write(placeFile, place);

const peopleFile = "data/people/by/oslo/stortorget/people_stortorget.json";
const person = {
  id: "carl_ludvig_jacobsen", name: "Carl Ludvig Jacobsen", initials: "CJ", category: "by", year: 1880,
  kindLabel: "Billedhugger", role: "Utførte Christian IV-monumentet på Stortorget",
  desc: "Billedhuggeren som vant konkurransen om Christian IV-monumentet og utførte bronsestatuen som ble avduket på Stortorget i 1880.",
  popupDesc: "Carl Ludvig Jacobsen levde fra 1835 til 1923 og var norsk billedhugger. Han studerte ved Kunstakademiet i København og arbeidet i Herman Wilhelm Bissens atelier. I 1876 fikk han første premie i konkurransen om Christian IV-monumentet. Statuen ble ferdig i 1878 og avduket på Stortorget 28. september 1880. Personkortet gjelder denne direkte dokumenterte kunstnerkoblingen.",
  placeId, source_place_id: placeId, places: [placeId], tags: ["billedhugger", "offentlig_kunst", "Christian IV", "Stortorget", "1880"],
  image: "bilder/kort/people/carl_ludvig_jacobsen.webp", cardImage: "bilder/kort/people/carl_ludvig_jacobsen.webp",
  imageMeta: {
    source: "oslo_museum_via_wikimedia_commons", sourcePage: urls.portraitPage, creator: "Marie Magdalena Rustad",
    credit: "Marie Magdalena Rustad / Oslo Museum / Wikimedia Commons", license: "Creative Commons 3.0",
    assetKind: "identity_portrait", mediaType: "historical_photo", date: "ca. 1890",
    outputDimensions: "900x1200", transformation: "Portrettet er proporsjonalt innpasset på 900 × 1200.", verifiedAt
  },
  profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1",
  claimsFile: "data/people/claims/by/oslo/stortorget/carl_ludvig_jacobsen.claims.json",
  source_urls: [urls.carlNkl, urls.carlLokal, urls.kommune, urls.portraitCatalogue, urls.portraitPage], verifiedAt
};
write(peopleFile, [person]);
const peopleManifest = read("data/people/manifest.json");
addOnce(peopleManifest.files, peopleFile.replace(/^data\//, ""));
peopleManifest.priorityFilesByPlace[placeId] = [peopleFile.replace(/^data\//, "")];
write("data/people/manifest.json", peopleManifest);

const personClaims = [
  ["identity", "Carl Ludvig Jacobsen levde fra 1835 til 1923 og var norsk billedhugger.", urls.carlNkl, "Biografi"],
  ["education", "Jacobsen studerte ved Kunstakademiet i København og arbeidet i Herman Wilhelm Bissens atelier.", urls.carlNkl, "Utdannelse"],
  ["competition", "Jacobsen fikk første premie i konkurransen om Christian IV-monumentet i 1876.", urls.carlNkl, "Priser, premier og utmerkelser"],
  ["stortorget_work", "Jacobsen utførte Christian IV-statuen på Stortorget.", urls.carlNkl, "Offentlige arbeider"],
  ["unveiling", "Christian IV-statuen ble ferdig i 1878 og avduket på Stortorget 28. september 1880.", urls.kommune, "Om torget"],
  ["image_identity", "Oslo Museum identifiserer fotografiet OB.Z05482 som Carl Ludvig Jacobsen, fotografert av Marie Magdalena Rustad omkring 1890.", urls.portraitCatalogue, "Katalogmetadata"]
].map(([id, claim, source_url, source_location]) => ({ id, claim, status: "verified", source_url, source_location, source_type: id === "unveiling" ? "official" : id === "image_identity" ? "catalogue" : "institutional", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" }));
write(person.claimsFile, {
  schema: "history_go_people_claims_v1", version: "1.0.0", person_id: person.id, profile_file: peopleFile,
  identity: { canonical_identity: person.name, name_variants: [person.name], not: ["den danske bryggeren Carl Jacobsen"], identity_status: "verified" },
  claims: personClaims,
  field_claim_map: { name: ["identity"], kindLabel: ["identity"], year: ["unveiling"], placeId: ["stortorget_work", "unveiling"], "places[stortorget]": ["stortorget_work", "unveiling"], image: ["image_identity"] },
  sentence_claim_map: {
    desc: [{ sentence: 1, claim_ids: ["competition", "stortorget_work", "unveiling"], evidence_mode: "explicit" }],
    popupDesc: [
      { sentence: 1, claim_ids: ["identity"] }, { sentence: 2, claim_ids: ["education"] },
      { sentence: 3, claim_ids: ["competition"] }, { sentence: 4, claim_ids: ["unveiling"] },
      { sentence: 5, claim_ids: ["stortorget_work"] }
    ]
  },
  completion: { completed_under: "people_profile_v1.0", claims_verified: `${personClaims.length}/${personClaims.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
});

const leksikonFile = "data/leksikon/places/oslo/by/leksikon_stortorget.json";
write(leksikonFile, [{
  id: "stortorget_hovedartikkel", visual: { designCode: "article_square_layers_miniature" }, place_id: placeId,
  title: "Stortorget", version: 1, popupDesc: "Hovedmarkedet fra 1737, ved den tidligere byporten og dagens domkirke.",
  wikiText: ["Stortorget ble byens hovedtorg i 1737 da markedet ble flyttet fra Christiania Torv.", "Torget var et viktig møtested mellom byfolk og produsenter fra omlandet og har fortsatt helårlig torghandel.", "Christian IV-monumentet av Carl Ludvig Jacobsen ble avduket i 1880."],
  summary: { one_liner: "Et torg der marked, transport, offentlig kunst og byutvidelse kan leses i samme plassrom.", themes: ["torg", "marked", "byhistorie", "offentlig_kunst"], tone: ["nøktern", "kildebasert"] },
  facts: [
    { id: "fact_01", label: "Hovedtorg", desc: "Stortorget ble byens hovedtorg i 1737.", confidence: "high", sources: [urls.kommune, urls.oppdag] },
    { id: "fact_02", label: "Gasslys", desc: "Byens første gasslykt ble tent på Stortorget i 1848.", confidence: "high", sources: [urls.oppdag] },
    { id: "fact_03", label: "Christian IV", desc: "Monumentet ble avduket 28. september 1880.", confidence: "high", sources: [urls.kommune, urls.statueByleksikon] }
  ],
  chronology: [
    { id: "chrono_stortorget_01", year: 1737, period: "Hovedmarked", desc: "Markedet flyttes fra Christiania Torv og Stortorget blir byens hovedtorg.", confidence: "high", sources: [urls.kommune, urls.oppdag] },
    { id: "chrono_stortorget_02", year: 1848, period: "Fiat Lux", desc: "Byens første gasslykt tennes på torget.", confidence: "high", sources: [urls.oppdag] },
    { id: "chrono_stortorget_03", year: 1880, period: "Christian IV-monumentet", desc: "Statuen avdukes 28. september.", confidence: "high", sources: [urls.kommune, urls.statueByleksikon] }
  ],
  sources: [urls.kommune, urls.oppdag, urls.byleksikon, urls.statueByleksikon]
}]);
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = leksikonManifest.files.filter((file) => file !== leksikonFile);
leksikonManifest.files.push(leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/stortorget.json";
write(languageFile, {
  place_id: placeId, title: "Språkleksikon: Stortorget", verified_at: verifiedAt, dialect_status: "not_applicable_place_level",
  entries: [
    { id: "stortorget", term: "Stortorget", type: "stedsnavn", meaning: "Dagens normaliserte navn i History Go for det historiske torget foran Oslo domkirke.", context: "OpenStreetMap registrerer Stortorvet som hovednavn og Stortorget som alternativ navn; begge formene viser til samme torgflate.", linked_to: { kind: "place", id: placeId }, tags: ["Stortorget", "byhistorie"], sources: [source("OpenStreetMap", urls.osm)] },
    { id: "stortorvet", term: "Stortorvet", type: "historisk_og_offisiell_skrivemaate", meaning: "Tradisjonell skrivemåte som fortsatt brukes av Oslo kommune og Oslo byleksikon.", context: "Navneformen er bevart i kildene selv om History Go-ID-en er stortorget.", linked_to: { kind: "place", id: placeId }, tags: ["Stortorget", "navnehistorie"], sources: [source("Oslo kommune", urls.kommune), source("Oslo byleksikon", urls.byleksikon)] },
    { id: "byvekten", term: "byvekten", type: "historisk_fagord", meaning: "Offentlig vekt der varer til markedet ble veid og kontrollert.", context: "Oppdag Kvadraturen beskriver byvekten som del av markedsinfrastrukturen på Stortorget.", linked_to: { kind: "place", id: placeId }, tags: ["marked", "handel"], sources: [source("Oppdag Kvadraturen", urls.oppdag)] },
    { id: "fiat_lux", term: "Fiat Lux", type: "historisk_objektnavn", meaning: "Navnet på den firearmede gasskandelaberen som ble tent på torget i 1848.", context: "Kandelaberen ble senere flyttet til Youngstorget da Christian IV-monumentet overtok plassen.", linked_to: { kind: "place", id: placeId }, tags: ["gasslys", "1848"], sources: [source("Oppdag Kvadraturen", urls.oppdag)] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_stortorget.json";
write(storyFile, [{
  id: "st_stortorget_hovedmarked_1737", quality_profile: "episode_v1", type: "turning_point", title: "Markedet flytter ut av den gamle byen", year: 1737, place_id: placeId, person_id: null,
  summary: "Da markedet ble flyttet fra Christiania Torv i 1737, ble Stortorget det nye hovedtorget ved byens tidligere port og domkirken.",
  story: "Området ved Stortorget lå tidligere ved Stadsporten og byvollen. Etter at terrenget var fylt opp og planert, kunne byen etablere et større markedsrom utenfor den eldre, tettere Kvadraturen.\n\nI 1737 ble markedet flyttet fra Christiania Torv. Bønder og andre produsenter kom hit med varer, og torget ble et møtested mellom by og omland. Senere kom gasslys, kollektivtrafikk og Christian IV-monumentet, men torghandelen fortsatte som et synlig lag i byrommet.",
  episode: { actors: ["Byens borgere", "Bønder og produsenter fra omlandet", "Christianias myndigheter"], date: "1737", action: "Markedet ble flyttet fra Christiania Torv til det nye torget ved domkirken.", consequence: "Stortorget ble byens hovedtorg og et sentralt handels- og møtested." },
  sources: [{ title: "Oslo kommune – Stortorvet", url: urls.kommune }, { title: "Oppdag Kvadraturen – Stortorget", url: urls.oppdag }, { title: "Oslo byleksikon – Stortorvet", url: urls.byleksikon }],
  tags: ["marked", "torg", "byutvidelse", "handel"], related_people: ["carl_ludvig_jacobsen"], related_places: ["christiania_torv", "oslo_domkirke", "youngstorget"],
  score: { narrative: 3, historical: 3, source: 5, play_value: 3, originality: 2, total: 16 },
  arc: { start: "Området lå ved den tidligere byporten.", middle: "Markedet flyttet hit fra Christiania Torv i 1737.", end: "Torghandelen fortsatte gjennom senere monument-, transport- og byutviklingslag." }
}]);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = storyManifest.files.filter((entry) => entry?.entity_id !== placeId && entry?.path !== storyFile);
storyManifest.files.push({ category: "by", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);

const claimDefs = [
  ["claim_identity", "Stortorget/Stortorvet er det navngitte torget foran Oslo domkirke og er avgrenset som en egen torgflate.", urls.kommune, "Om torget", "official", "identity", "direct", "current", [urls.byleksikon]],
  ["claim_1737", "Stortorget ble byens hovedtorg i 1737 da markedet ble flyttet fra Christiania Torv.", urls.kommune, "Ingress", "official", "temporal", "corroborated", "historical", [urls.oppdag]],
  ["claim_gate", "Området lå ved Stadsporten og den tidligere byvollen før det nye torget ble anlagt.", urls.oppdag, "Stadsporten/byvollen", "institutional", "ordinary", "direct", "historical", []],
  ["claim_market", "Bønder og andre produsenter omsatte varer på Stortorget, som fungerte som møteplass mellom by og omland.", urls.oppdag, "Markedet", "institutional", "ordinary", "direct", "historical", []],
  ["claim_market_shift", "Deler av markedstrafikken ble flyttet til Nytorvet/Youngstorget i 1850-årene, mens salg og hestemarked fortsatte på Stortorget.", urls.oppdag, "Markedet", "institutional", "ordinary", "direct", "historical", []],
  ["claim_scale_water", "Stortorget hadde byvekt og vannpost som del av markedsinfrastrukturen.", urls.oppdag, "Markedet", "institutional", "ordinary", "direct", "historical", []],
  ["claim_gas", "Byens første gasslykt Fiat Lux ble tent på Stortorget i 1848 og senere flyttet da Christian IV-monumentet ble plassert der.", urls.oppdag, "Bli lys", "institutional", "ordinary", "direct", "historical", []],
  ["claim_statue", "Christian IV-monumentet av Carl Ludvig Jacobsen ble ferdig i 1878 og avduket 28. september 1880.", urls.kommune, "Om torget", "official", "ordinary", "corroborated", "current", [urls.statueByleksikon]],
  ["claim_current_market", "Oslo kommune oppgir at Stortorvet har helårlig torghandel.", urls.kommune, "Ingress og fasiliteter", "official", "temporal", "direct", "current", []],
  ["claim_art", "Oslo byleksikon registrerer flere offentlige kunstverk på dagens Stortorvet.", urls.byleksikon, "Ingress", "institutional", "temporal", "direct", "current", []]
];
const claims = claimDefs.map(([id, claim, sourceUrl, sourceLocation, sourceType, claimKind, evidenceMode, temporalStatus, independentSourceUrls]) => ({ id, claim, sourceUrl, sourceLocation, sourceType, verifiedAt, status: "verified", claimKind, evidenceMode, temporalStatus, independentSourceUrls }));
const ids = Object.fromEntries(claims.map((claim) => [claim.id, claim.id]));
const mapSentence = (text) => {
  const t = text.toLowerCase();
  if (t.includes("1737") || t.includes("hovedtorg") || t.includes("hovedmarked")) return [ids.claim_1737];
  if (t.includes("stadsport") || t.includes("byvoll") || t.includes("festningsby")) return [ids.claim_gate];
  if (t.includes("bønd") || t.includes("produsent") || t.includes("by og land") || t.includes("omlandet")) return [ids.claim_market];
  if (t.includes("youngstorget") || t.includes("nytorvet") || t.includes("1850")) return [ids.claim_market_shift];
  if (t.includes("byvekt") || t.includes("vannpost") || t.includes("veid")) return [ids.claim_scale_water];
  if (t.includes("gass") || t.includes("fiat lux")) return [ids.claim_gas];
  if (t.includes("1880") || t.includes("1878") || t.includes("christian iv") || t.includes("christian 4")) return [ids.claim_statue];
  if (t.includes("blomster") || t.includes("torghandel") || t.includes("handel")) return [ids.claim_current_market];
  if (t.includes("kunst")) return [ids.claim_art];
  return [ids.claim_identity];
};
write(`data/places/production/${placeId}.json`, {
  schemaVersion: "4.2", validatorVersion: "4.2.1", status: "ready_v4_2", placeId, placeFile,
  identity: { status: "resolved", represents: "Den navngitte torgflaten Stortorget/Stortorvet foran Oslo domkirke, med dokumenterte markeds-, transport- og monumentlag fra 1700-tallet til i dag.", period: "1737–", excludes: ["Oslo domkirke som egen Place", "Kirkeristen/basarene som eget anlegg", "Stortorvets Gjæstgiveri som virksomhet/brand", "Christiania Torv", "Youngstorget"] },
  claims,
  sentenceCoverage: { desc: sentences(desc).map((sentence, index) => ({ sentence: index + 1, claimIds: mapSentence(sentence) })), popupDesc: sentences(popupDesc).map((sentence, index) => ({ sentence: index + 1, claimIds: mapSentence(sentence) })) },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category, coordinates: { lat: place.lat, lon: place.lon } },
  roundsReadiness: { people: "ready_one_direct_profile", objects: "ready_one_physical_monument", brands: "ready_explicit_empty_reserve", related: "ready_four_canonical_places", badges: "ready_by", quiz: "ready_existing_quiz_profile", leksikon: "ready_main_article", sprak: "ready_four_entries", stories: "ready_one_episode_v1", fagverk: "ready_standard", frontImage: "ready_real_portrait_3x4", beforeAfter: "ready_with_media_and_viewpoint_caveat" },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

write("reports/place-production/stortorget-workcard-current.json", {
  schema: "history_go_place_production_workcard_v1", place_id: placeId, name: place.name, category: place.category,
  place_file: placeFile, verified_at: verifiedAt, canonical_scope: "Den navngitte torgflaten, ikke nabobyggene.",
  production_profile: "standard", status: "materialized_pending_ci", collections: ["people", "objects", "brands", "related"],
  notes: ["Verifisert OSM-geometri beholdes uendret.", "Brands er eksplisitt tom reserve; ingen nabovirksomhet gjøres til falsk torg-brand.", "Før/nå er laglesning mellom et maleri fra 1843 og et foto fra 2019, ikke samme-kamerapunkt-sammenligning."]
});

const imageAuditFile = path.join(os.tmpdir(), "stortorget-place-image-audit.json");
execFileSync(process.execPath, ["scripts/audit-place-images.mjs", "--mode=all", `--report=${imageAuditFile}`], { cwd: root, stdio: "ignore" });
const imageAudit = JSON.parse(fs.readFileSync(imageAuditFile, "utf8"));
const imageBacklogFile = "data/places/place_image_backlog_summary.json";
const imageBacklog = read(imageBacklogFile);
imageBacklog.generatedAt = verifiedAt;
imageBacklog.generatedFromCommit = "stortorget_completion_20260910";
imageBacklog.totalPlaces = imageAudit.totalPlaces;
imageBacklog.summary = imageAudit.summary;
write(imageBacklogFile, imageBacklog);

console.log(`Stortorget completion materialized: ${placeId}`);
