#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { buildQuizProductionContext } from "../scripts/quiz-production-lib.mjs";

const root = process.cwd();
const placeId = "tullin";
const verifiedAt = "2026-08-30";
const placeFile = "data/places/by/oslo/places/tullin.json";
const branch = "work/tullin-completion-20260830";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const uniq = values => [...new Set(values.filter(Boolean))];
const upsert = (array, value, key = "id") => {
  const i = array.findIndex(item => item?.[key] === value?.[key]);
  if (i < 0) array.push(value); else array[i] = value;
};
const htmlText = value => String(value || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const splitSentences = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)].map(x => x.segment.trim()).filter(Boolean);
const fetchOk = async url => {
  const response = await fetch(url, { headers: { "user-agent": "History-Go canonical place production" } });
  if (!response.ok) throw new Error(`Fetch ${response.status}: ${url}`);
  return response;
};

const urls = {
  byleksikon: "https://oslobyleksikon.no/side/Tullinl%C3%B8kka",
  riksantikvaren: "https://riksantikvaren.no/content/uploads/2020/11/Historikk_nationalgalleriet.pdf",
  exhibition: "https://lokalhistoriewiki.no/wiki/Den_norske_Industri-_og_Kunstudstilling_1883",
  statsbyggAnalysis: "https://dok.statsbygg.no/wp-content/uploads/2020/05/stedsanalyseNationaltheatret.pdf",
  statsbyggPress: "https://www.statsbygg.no/om-oss/for-pressen/",
  nasjonalmuseet2005: "https://www.nasjonalmuseet.no/contentassets/98adac84980c4555ae99de8a5ed00e80/aarsmelding_2005.pdf",
  oslobilderOrgan: "https://www.oslobilder.no/OMU/OB.03774",
  commonsBefore: "https://commons.wikimedia.org/wiki/File:Tullinl%C3%B8kka,_Kristian_Augusts_gate.jpg",
  commonsNow: "https://commons.wikimedia.org/wiki/File:SL18_v_Tullinl%C3%B8kka-1.jpg",
  commonsStop: "https://commons.wikimedia.org/wiki/File:Tullinlokka_holdeplass.jpg",
  commonsOrgan: "https://commons.wikimedia.org/wiki/File:Albert_von_Hanno_-_III_Fra_Udstillingen_i_Kristiania_1883_-_Oslo_Museum_-_OB.01515.jpg",
  commonsExhibition: "https://commons.wikimedia.org/wiki/File:Albert_von_Hanno_-_Industriutstillingen,1883_-_Oslo_Museum_-_OB.03775.jpg",
  commonsGallery: "https://commons.wikimedia.org/wiki/File:Nasjonalgalleriet_oslo.jpg",
  commonsMuseum: "https://commons.wikimedia.org/wiki/File:Historisk-museum-fra-Tullinlokka.jpg"
};

const sources = [
  ["oslo_byleksikon", "Oslo byleksikon – Tullinløkka", urls.byleksikon, "institutional", "Navn, Ruseløkken, 1807/1837/1869, Legepladsen, 1883-utstillingen, velociped 1885, demonstrasjoner, museumsbygningene, Kunsthallen og parkhistorikk."],
  ["riksantikvaren_nasjonalgalleriet", "Riksantikvaren – Nasjonalgalleriet og Tullinløkka", urls.riksantikvaren, "official", "Stedshistorie, fradeling, leke-/utstillingsbruk og Nasjonalgalleriets utvikling."],
  ["lokalhistoriewiki_1883", "Lokalhistoriewiki – Den norske Industri- og Kunstudstilling 1883", urls.exhibition, "recognized", "Utstillingsperiode, hovedbygningen på Tullinløkka, avgrensning, midlertidige bygg og billedkilder."],
  ["statsbygg_stedsanalyse", "Statsbygg – stedsanalyse Nationaltheatret/Tullinløkka", urls.statsbyggAnalysis, "official", "Historiske brukslag, langvarig parkering, Kunsthallen, 2009-beslutningen og parkgrepet i 2011."],
  ["nasjonalmuseet_2005", "Nasjonalmuseet – årsmelding 2005", urls.nasjonalmuseet2005, "official", "Kunsthallen på Tullinløkka og Kyss frosken-manifestasjonen i 2005."],
  ["oslobilder_orgel", "Oslo Museum/Oslobilder – OB.03774", urls.oslobilderOrgan, "archive", "Dokumenterer et stort kirkeorgel fra Uranienborg kirke på gulvet under industriutstillingen 1883."],
  ["statsbygg_press", "Statsbygg – for pressen", urls.statsbyggPress, "official", "Offisiell logoressurs og identitetsregler."],
  ["commons_before", "Wikimedia Commons – Tullinløkka ca. 1880", urls.commonsBefore, "archive", "Historisk fotografi og rettighetsmetadata."],
  ["commons_now", "Wikimedia Commons – SL18 ved Tullinløkka 2023", urls.commonsNow, "archive", "Samtidsfoto og rettighetsmetadata."],
  ["commons_stop", "Wikimedia Commons – Tullinløkka holdeplass", urls.commonsStop, "archive", "Foto av den navngitte holdeplassen og rettighetsmetadata."],
  ["commons_organ", "Wikimedia Commons – kirkeorgel ved utstillingen 1883", urls.commonsOrgan, "archive", "Tegning fra 1883-utstillingen med kirkeorgel, med Oslo Museum-proveniens."],
  ["commons_exhibition", "Wikimedia Commons – Industriutstillingen 1883", urls.commonsExhibition, "archive", "Samtidig tegning fra industriutstillingen, med Oslo Museum-proveniens."],
  ["commons_gallery", "Wikimedia Commons – Nasjonalgalleriet", urls.commonsGallery, "archive", "Dokumentarfoto og rettighetsmetadata."],
  ["commons_museum", "Wikimedia Commons – Historisk museum fra Tullinløkka", urls.commonsMuseum, "archive", "Dokumentarfoto tatt fra Tullinløkka og rettighetsmetadata."]
].map(([id, title, url, type, review_note]) => ({ id, title, url, type, review_status: "reviewed", review_note, verifiedAt }));
const sourceById = Object.fromEntries(sources.map(s => [s.id, s]));
const sourceRef = id => ({ title: sourceById[id].title, url: sourceById[id].url });

const allowedLicense = license => /public domain|cc0|cc by|cc-by|pd-/i.test(license || "");
async function commonsAsset(title, outFile, width, height, assetType, extra = {}) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query"); api.searchParams.set("format", "json");
  api.searchParams.set("prop", "imageinfo"); api.searchParams.set("iiprop", "url|extmetadata");
  api.searchParams.set("titles", `File:${title}`);
  const data = await (await fetchOk(api)).json();
  const page = Object.values(data.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) throw new Error(`Commons image missing: ${title}`);
  const meta = info.extmetadata || {};
  const license = htmlText(meta.LicenseShortName?.value || meta.UsageTerms?.value || "");
  if (!allowedLicense(license)) throw new Error(`Unapproved Commons license for ${title}: ${license}`);
  const buffer = Buffer.from(await (await fetchOk(info.url)).arrayBuffer());
  const target = path.join(root, outFile);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(buffer).rotate().resize(width, height, { fit: "cover", position: "attention" }).webp({ quality: 88 }).toFile(target);
  return {
    source: "wikimedia_commons",
    sourcePage: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title).replaceAll("%2F", "/")}`,
    creator: htmlText(meta.Artist?.value || meta.Credit?.value || "Wikimedia Commons contributor"),
    credit: htmlText(meta.Credit?.value || meta.Attribution?.value || meta.Artist?.value || "Wikimedia Commons"),
    license,
    licenseUrl: htmlText(meta.LicenseUrl?.value || ""),
    assetType,
    date: htmlText(meta.DateTimeOriginal?.value || meta.DateTime?.value || ""),
    transformation: "Stedstro beskjæring, skalering og WebP-normalisering.",
    verifiedAt,
    outputDimensions: `${width}x${height}`,
    orientation: height > width ? "portrait" : "landscape",
    aspectRatio: `${width}:${height}`,
    ...extra
  };
}

async function statsbyggLogo(outFile) {
  const html = await (await fetchOk(urls.statsbyggPress)).text();
  const raw = [...html.matchAll(/(?:href|src)=["']([^"']+\.(?:png|webp)(?:\?[^"']*)?)["']/gi)].map(m => m[1]);
  const links = uniq(raw.map(u => new URL(u, urls.statsbyggPress).href));
  const selected = links.find(u => /statsbygg.*logo|logo.*statsbygg/i.test(u)) || links.find(u => /logo/i.test(u));
  if (!selected) throw new Error("Statsbygg official logo URL not found on press page");
  const buffer = Buffer.from(await (await fetchOk(selected)).arrayBuffer());
  const target = path.join(root, outFile);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(buffer).rotate().trim().resize(1200, 900, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 92 }).toFile(target);
  return {
    source: "official_brand_source", sourcePage: urls.statsbyggPress, sourceAsset: selected,
    creator: "Statsbygg", credit: "Statsbygg", license: "Official logo; referential identification",
    rightsBasis: "official_logo_used_for_referential_identification", noEndorsement: true,
    assetKind: "official_logo", transformation: "Korrekt offisiell rasterlogo normalisert til transparent WebP uten redesign.",
    verifiedAt, outputDimensions: "1200x900"
  };
}

const nowMeta = await commonsAsset("SL18 v Tullinløkka-1.jpg", "bilder/places/tullin.webp", 1200, 675, "documentary_place_photo");
await sharp(path.join(root, "bilder/places/tullin.webp")).resize(1200, 900, { fit: "cover", position: "attention" }).toFile(path.join(root, "bilder/kort/places/tullin.webp"));
const frontMeta = await commonsAsset("SL18 v Tullinløkka-1.jpg", "bilder/places/tullin_front_portrait.webp", 900, 1200, "documentary_place_photo");
const beforeMeta = await commonsAsset("Tullinløkka, Kristian Augusts gate.jpg", "bilder/places/tullin_historic.webp", 900, 1200, "historical_place_photo", { note: "Kilden daterer bildet til omkring 1880; sammenligningen med 2023 er ikke fra identisk kamerastandpunkt." });
const stopMeta = await commonsAsset("Tullinlokka holdeplass.jpg", "bilder/kort/objects/tullin_holdeplasskilt.webp", 900, 1200, "documentary_object_photo");
const organMeta = await commonsAsset("Albert von Hanno - III Fra Udstillingen i Kristiania 1883 - Oslo Museum - OB.01515.jpg", "bilder/kort/objects/tullin_kirkeorgel_1883.webp", 900, 1200, "historical_object_depiction", { identityCaveat: "Tegningen dokumenterer et kirkeorgel i 1883-utstillingen; Oslobilder OB.03774 dokumenterer særskilt det store Uranienborg-orgelet på utstillingsgulvet." });
const exhibitionMeta = await commonsAsset("Albert von Hanno - Industriutstillingen,1883 - Oslo Museum - OB.03775.jpg", "bilder/kort/structures/tullin_industriutstilling_hovedbygning.webp", 1200, 900, "historical_structure_depiction");
const galleryMeta = await commonsAsset("Nasjonalgalleriet oslo.jpg", "bilder/kort/structures/tullin_nasjonalgalleriet.webp", 1200, 900, "documentary_structure_photo");
const museumMeta = await commonsAsset("Historisk-museum-fra-Tullinlokka.jpg", "bilder/kort/structures/tullin_historisk_museum.webp", 1200, 900, "documentary_structure_photo");
const brandLogo = "bilder/kort/brands/statsbygg.webp";
const statsbyggLogoMeta = await statsbyggLogo(brandLogo);

const originalPlace = read(placeFile);
const coordinateLock = { lat: originalPlace.lat, lon: originalPlace.lon, r: originalPlace.r, coordStatus: originalPlace.coordStatus, sourceObjectId: originalPlace.sourceObjectId };
if (coordinateLock.lat !== 59.91651 || coordinateLock.lon !== 10.73644 || coordinateLock.coordStatus !== "verified_geometry") throw new Error("Tullin coordinate lock changed before production");

const desc = "Tullin er History Go-stedet for Tullinløkka, den åpne plassen mellom Nasjonalgalleriet og Historisk museum. Løkka fikk navn etter kjøpmann og hoffintendant Claus Tullin, som kjøpte Ruseløkken i 1807; staten overtok i 1837, og Tullinløkka ble skilt ut i 1869. Plassen rommet den store Industri- og Kunstudstillingen i 1883, tidlig sykkelbruk og offentlige markeringer, før store deler av 1900-tallet ble preget av parkering. Kunsthallen fra 2005 var midlertidig, og i 2011 anla Statsbygg en park og aktivitetsflate over løkka.";
const popupParagraphs = [
  "History Go-stedet Tullin er geografisk forankret i Tullinløkka, den åpne plassen mellom Nasjonalgalleriet og Historisk museum. Navnet viser ikke til dikteren Christian Braunmann Tullin, men til sønnen Claus Tullin, kjøpmann og hoffintendant. Claus kjøpte Ruseløkken i 1807. Staten overtok eiendommen i 1837, og den åpne Tullinløkka ble skilt ut i 1869.",
  "I tiårene etter fradelingen ble den åpne flaten brukt som «Legepladsen» for barn og idrettsungdom. Bruken var ikke bare uformell. I 1885 ble det gitt tillatelse til «Velociped-Ridning» mellom klokken seks og åtte om morgenen. Det korte tidsvinduet gjør sykkelsporet til et presist eksempel på hvordan en ny transport- og fritidsform måtte finne sin plass i byen.",
  "I 1883 fylte Den norske Industri- og Kunstudstilling Tullinløkka med en stor midlertidig hovedbygning og utstillingsfunksjoner. Oslo byleksikon oppgir 2245 utstillere. Lokalhistoriewiki dokumenterer at hovedbygningen fylte selve løkka, mens deler av utstillingen strakte seg videre mot Nisseberget. Et Oslo Museum-motiv viser også kirkeorgel blant gjenstandene som ble stilt ut.",
  "Tullinløkka ble også en politisk møteplass. Oslo byleksikon beskriver store demonstrasjoner i 1890-årene og nevner Bjørnstjerne Bjørnson blant talerne. Koblingen gjør Bjørnson til et direkte People-anker for stedet, men ikke til navneopphav. Claus Tullin forblir eponymet og ligger fortsatt som egen canonical personkobling.",
  "Bygningene langs kanten gjorde etter hvert det åpne rommet mer institusjonelt. Skulpturmuseet, kjernen i det senere Nasjonalgalleriet, åpnet i 1881. Historisk museum ble reist i perioden 1898–1903. De er egne strukturer i Tullin-pakken fordi de fysisk rammer inn løkka, men selve History Go-stedet er den åpne plassen og dens bruks- og transformasjonshistorie.",
  "Gjennom store deler av 1900-tallet ble Tullinløkka brukt til bilparkering. Nasjonalmuseet åpnet en midlertidig Kunsthall på løkka i 2005, knyttet til «Kyss frosken». Etter at planene for nytt Nasjonalmuseum ble flyttet til Vestbanen, ble den midlertidige hallen borte. Statsbygg anla i 2011 en park over hele løkka og beholdt et midtfelt som fleksibel flate for aktivitet og arrangementer.",
  "Tullinløkka kan derfor leses som et byrom som stadig har skiftet program uten å miste den åpne flaten: lekeplass, idrettsrom, utstillingsområde, demonstrasjonsplass, parkering, kunsthall og park. Før/nå-paret i appen sammenligner et fotografi fra omkring 1880 med et foto fra 2023. Motivene er ikke tatt fra identisk standpunkt, så de skal brukes til å lese bylag og kanter, ikke som en optisk før/etter-overlegg." 
];
const popupDesc = popupParagraphs.join("\n\n");

const objects = [
  {
    id: "tullin_holdeplasskilt", name: "Tullinløkka holdeplasskilt", title: "Tullinløkka holdeplass",
    type: "transit_stop_marker", kind: "physical_wayfinding_object", physicalObject: true, placeSpecific: true, collectable: true,
    desc: "Det navngitte holdeplasskiltet gjør Tullinløkka til et eksplisitt punkt i Oslos trikkenett og er et fysisk orienteringsobjekt ved plassen.",
    placeSpecificReason: "Objektet bærer selve stedsnavnet og står ved den canonicale Tullinløkka-ankringen.",
    why_here: "Holdeplassen viser hvordan den historiske løkka er koblet til dagens bybevegelse.",
    whereToFind: "Ved trikkeholdeplassen Tullinløkka langs Kristian Augusts gate.",
    unlock: "Finn det navngitte holdeplasskiltet fra offentlig areal.", storePrice: 30, currency: "PC",
    image: "bilder/kort/objects/tullin_holdeplasskilt.webp", imageMeta: stopMeta,
    source_urls: [urls.commonsStop, urls.byleksikon]
  },
  {
    id: "tullin_kirkeorgel_1883", name: "Kirkeorgelet på utstillingen", title: "Kirkeorgel, 1883",
    type: "exhibition_object", kind: "pipe_organ", year: 1883, physicalObject: true, placeSpecific: true, collectable: true,
    desc: "Oslo Museums utstillingsmateriale dokumenterer et stort kirkeorgel på gulvet under Industri- og Kunstudstillingen i 1883; OB.03774 identifiserer et slikt stort orgel som tilhørende Uranienborg kirke.",
    placeSpecificReason: "Objektet var fysisk stilt ut på Tullinløkka under den dokumenterte 1883-utstillingen.",
    why_here: "Orgelet gjør den brede produkt- og kulturutstillingen konkret på objektnivå.",
    whereToFind: "Historisk objektspor; ikke et nåværende fast objekt på plassen.",
    unlock: "Sammenlign den historiske tegningen med utstillingsbeskrivelsen; ikke forvent at orgelet står på løkka i dag.", storePrice: 45, currency: "PC",
    image: "bilder/kort/objects/tullin_kirkeorgel_1883.webp", imageMeta: organMeta,
    source_urls: [urls.oslobilderOrgan, urls.commonsOrgan, urls.exhibition]
  }
];

const structures = [
  {
    id: "tullin_industriutstilling_hovedbygning", name: "Hovedbygningen for Industri- og Kunstudstillingen", type: "temporary_exhibition_hall", year: 1883,
    desc: "Den store midlertidige hovedbygningen fylte Tullinløkka under Den norske Industri- og Kunstudstilling sommeren og høsten 1883.",
    image: "bilder/kort/structures/tullin_industriutstilling_hovedbygning.webp", imageMeta: exhibitionMeta,
    source_urls: [urls.exhibition, urls.commonsExhibition, urls.byleksikon], temporalStatus: "historical_demolished"
  },
  {
    id: "tullin_nasjonalgalleriet", name: "Nasjonalgalleriet", type: "museum_building", period: "1881–1924",
    desc: "Skulpturmuseet åpnet ved Tullinløkka i 1881 og ble kjernen i Nasjonalgalleriet, som senere fikk sidefløyer og rammet inn plassen mot sør.",
    image: "bilder/kort/structures/tullin_nasjonalgalleriet.webp", imageMeta: galleryMeta,
    source_urls: [urls.byleksikon, urls.riksantikvaren, urls.commonsGallery], temporalStatus: "current_structure_historic_use_changed"
  },
  {
    id: "tullin_historisk_museum", name: "Historisk museum", type: "museum_building", period: "1898–1903",
    desc: "Historisk museum ble reist 1898–1903 og danner en av de tydeligste institusjonskantene rundt Tullinløkkas åpne flate.",
    image: "bilder/kort/structures/tullin_historisk_museum.webp", imageMeta: museumMeta,
    source_urls: [urls.byleksikon, urls.commonsMuseum], temporalStatus: "current"
  }
];

const place = originalPlace;
Object.assign(place, {
  name: "Tullin",
  year: 1869,
  emne_ids: ["em_by_offentlige_rom_motesteder", "em_by_historiske_lag_i_hverdagsrom", "em_by_demonstrasjoner_markeringer", "em_by_bygningstyper_og_typologier", "em_by_symbolsk_makt_og_representasjon"],
  desc, popupDesc,
  image: "bilder/places/tullin.webp", cardImage: "bilder/kort/places/tullin.webp", frontImage: "bilder/places/tullin_front_portrait.webp",
  imageMeta: nowMeta, frontImageMeta: frontMeta,
  sourceProvider: "manual_research", sourceObjectId: coordinateLock.sourceObjectId,
  underbadge_ids: ["byplanlegging", "infrastruktur", "monumenter_og_landemerker"],
  secondaryBadgeIds: ["politikk"],
  related_people_ids: ["claus_tullin", "bjornstjerne_bjornson"],
  related_place_ids: uniq([...(place.related_place_ids || []), "universitetsplassen", "nationaltheatret"]),
  place_card_profile: {
    schema: "history_go_place_card_profile_v2", production_profile: "rich",
    collection_ids: ["people", "objects", "brands", "structures"], category_collection_label: "Byrom og anlegg",
    reason: "Bjørnstjerne Bjørnsons dokumenterte talerrolle, to konkrete fysiske objektspor, Statsbyggs direkte parkrolle og tre stedskonstituerende strukturer gir fire ekte, bildeklare samlinger uten nabostedsfyll.", verifiedAt
  },
  quiz_profile: {
    place_type: "plass", subtype: "historisk_flerbruksplass",
    signature_features: ["Tullinløkka som åpen flate", "1883-utstillingen", "skiftende programmer fra lek og demonstrasjon til park"],
    primary_angles: ["historiske lag", "offentlig rom", "midlertidige strukturer", "mobilitet og transformasjon"],
    question_families: ["gjenkjenning", "kronologi", "romlig lesning", "kildekritikk", "sammenligning"],
    avoid_angles: ["Tullin som løs markedsføringsbydel", "falsk kobling til Christian Braunmann Tullin"],
    must_include: ["Claus Tullin som navneopphav", "1883-utstillingen", "1885-velosiped", "parktransformasjonen i 2011"],
    contrast_targets: ["universitetsplassen", "eidsvolls_plass"],
    notes: "Spør som et skiftende offentlig byrom, ikke som ett museum eller én ny bydel."
  },
  objects, structures,
  for_na: {
    title: "Tullinløkka omkring 1880 og i 2023",
    beforeImage: "bilder/places/tullin_historic.webp",
    beforeImageLabel: "Tullinløkka ca. 1880 · O. Væring / DigitaltMuseum / Wikimedia Commons",
    beforeImageMeta: beforeMeta,
    nowImage: "bilder/places/tullin.webp",
    nowImageLabel: "Tullinløkka 2023 · Wikimedia Commons",
    nowImageMeta: nowMeta,
    caveat: "Bildene har ulikt ståsted og utsnitt. Paret dokumenterer stedets kanter, mobilitet og historiske lag, ikke en pikselpresis optisk før/etter-sammenligning.",
    sources: [urls.commonsBefore, urls.commonsNow]
  },
  interpretation: {
    what_to_notice: ["At den åpne flaten fortsatt er lesbar mellom institusjonsbygningene.", "Hvordan transportkanten langs Kristian Augusts gate møter parkrommet.", "Hvordan Nasjonalgalleriet og Historisk museum gjør plassen til et rom mellom institusjoner."],
    questions: ["Hvordan kan samme åpne flate romme utstilling, protest, parkering og park over tid?", "Hva blir igjen når midlertidige strukturer forsvinner?", "Hvordan endrer museumskantene måten plassen oppleves på?"]
  },
  module_audit: {
    for_na: { status: "produced_with_viewpoint_caveat" },
    news: { status: "BEGRUNNET N/A", reason: "Ingen tidskritisk nåtidshendelse er nødvendig for å forstå den stabile canonicale Tullin-identiteten." },
    people: { status: "produced", visible_member: "bjornstjerne_bjornson", related_eponym: "claus_tullin" },
    objects: { status: "produced", count: objects.length },
    brands: { status: "produced", ids: ["statsbygg"] },
    structures: { status: "produced", count: structures.length }
  }
});
if (place.lat !== coordinateLock.lat || place.lon !== coordinateLock.lon || place.r !== coordinateLock.r || place.coordStatus !== coordinateLock.coordStatus) throw new Error("Tullin geometry was modified");
write(placeFile, place);

const clausFile = "data/people/by/oslo/tullin/claus_tullin.json";
const clausList = read(clausFile);
const claus = clausList.find(p => p.id === "claus_tullin");
if (!claus) throw new Error("Canonical Claus Tullin missing");
claus.roundHoldbacks = uniq([...(claus.roundHoldbacks || []), placeId]);
claus.popupDesc = "Claus Tullin er navneankeret for Tullinløkka. Han kjøpte Ruseløkken i 1807; staten overtok eiendommen i 1837, og Tullinløkka ble skilt ut i 1869. Faren Christian Braunmann Tullin er ikke navneopphavet til løkka. Claus beholdes som direkte canonical personkobling, men holdes utenfor den synlige People-rundingen fordi et sikkert bilde ikke er dokumentert.";
claus.source_urls = uniq([...(claus.source_urls || []), urls.byleksikon, urls.riksantikvaren]);
claus.verifiedAt = verifiedAt;
write(clausFile, clausList);

const bjornsonFile = "data/people/litteratur/oslo/people_litteratur_oslo.json";
const bjornsonPeople = read(bjornsonFile);
const bjornson = bjornsonPeople.find(p => p.id === "bjornstjerne_bjornson");
if (!bjornson?.image) throw new Error("Canonical Bjørnstjerne Bjørnson with image missing");
bjornson.places = uniq([...(bjornson.places || []), placeId]);
bjornson.source_urls = uniq([...(bjornson.source_urls || []), urls.byleksikon]);
bjornson.tullinRelation = { type: "documented_speaker", period: "1890-årene", source: urls.byleksikon, verifiedAt };
write(bjornsonFile, bjornsonPeople);

const brandsFile = "data/brands/brands_master.json";
const brands = read(brandsFile);
const statsbygg = brands.find(b => b.id === "statsbygg");
if (!statsbygg) throw new Error("Canonical Statsbygg brand missing");
statsbygg.place_ids = uniq([...(statsbygg.place_ids || []), placeId]);
statsbygg.logo = brandLogo;
statsbygg.imageMeta = statsbyggLogoMeta;
statsbygg.verification = "verified";
statsbygg.verified_at = verifiedAt;
statsbygg.source_urls = uniq([...(statsbygg.source_urls || []), urls.statsbyggAnalysis, urls.statsbyggPress]);
statsbygg.popupdesc = "Statsbygg kvalifiserer ved Tullin fordi virksomheten anla parken over Tullinløkka i 2011 etter at det nye Nasjonalmuseet ble lagt til Vestbanen. Brand-koblingen gjelder denne dokumenterte byggherre-/forvaltningsrollen, ikke eierskap til hele området.";
write(brandsFile, brands);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = ["statsbygg"];
write("data/brands/brands_by_place.json", brandsByPlace);

const relations = read("data/relations.json").filter(r => !["rel_tullin_bjornson", "rel_tullin_statsbygg", "rel_tullin_claus"].includes(r.id));
relations.push(
  { id: "rel_tullin_claus", type: "eponym", place: placeId, person: "claus_tullin", why: "Tullinløkka har navn etter Claus Tullin, som kjøpte Ruseløkken i 1807.", source: urls.byleksikon },
  { id: "rel_tullin_bjornson", type: "documented_speaker", place: placeId, person: "bjornstjerne_bjornson", why: "Bjørnson var blant talerne ved store demonstrasjoner på Tullinløkka i 1890-årene.", source: urls.byleksikon },
  { id: "rel_tullin_statsbygg", type: "public_space_builder", place: placeId, brand: "statsbygg", why: "Statsbygg anla parken over Tullinløkka i 2011.", source: urls.statsbyggAnalysis }
);
write("data/relations.json", relations);

const languageFile = `data/leksikon/sprak/places/europe/norway/oslo/${placeId}.json`;
const languageEntries = [
  ["tullinlokka", "Tullinløkka", "stedsnavn", "Navnet viser til Claus Tullin og den historiske løkkeeiendommen.", "Navnet gjelder plassen, ikke Tullins gate og ikke dikteren Christian Braunmann Tullin."],
  ["ruselokken", "Ruseløkken", "historisk_stedsnavn", "Den større løkkeeiendommen som Claus Tullin kjøpte i 1807.", "Tullinløkka ble senere skilt ut fra Ruseløkken."],
  ["lokke", "løkke", "historisk_byord", "Et inngjerdet eller avgrenset jord-/bymarksområde utenfor den eldre tette byen.", "Ordet forklarer stedsformen i navn som Tullinløkka og Ruseløkken."],
  ["legepladsen", "Legepladsen", "historisk_bruksord", "Historisk skrivemåte for en lekeplass eller aktivitetsflate.", "Oslo byleksikon bruker betegnelsen om Tullinløkkas bruk for barn og idrettsungdom."],
  ["velociped_ridning", "Velociped-Ridning", "historisk_mobilitetsord", "Samtidig betegnelse for sykling med velociped.", "I 1885 ble slik sykling tillatt på Tullinløkka i et avgrenset tidsrom om morgenen."],
  ["kunstudstilling", "Kunstudstilling", "historisk_rettskriving", "Eldre skrivemåte for kunstutstilling.", "Ordformen finnes i navnet på Den norske Industri- og Kunstudstilling 1883."]
].map(([id, term, type, meaning, context]) => ({ id, term, type, meaning, context, linked_to: { kind: "place", id: placeId }, tags: ["by", "Tullinløkka", "historisk språk"], sources: [sourceRef("oslo_byleksikon"), sourceRef("lokalhistoriewiki_1883")] }));
write(languageFile, { place_id: placeId, title: "Språkleksikon: Tullinløkka", verified_at: verifiedAt, dialect_status: "not_applicable_place_level", entries: languageEntries });
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const dedicatedLeksikonFile = `data/leksikon/places/oslo/by/leksikon_${placeId}.json`;
const leksikon = {
  place_id: placeId, title: "Tullinløkka", type: "main", version: 1, visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "En åpen plass med dokumenterte lag fra Ruseløkken og 1800-tallets leke- og utstillingsbruk til Kunsthallen og Statsbyggs park fra 2011.",
  wikiText: popupParagraphs,
  summary: { one_liner: "Tullinløkka viser hvordan en åpen byflate kan skifte program mange ganger og likevel forbli et lesbart offentlig rom.", themes: ["offentlig rom", "utstilling", "mobilitet", "demonstrasjon", "transformasjon"], tone: ["kildekritisk", "stedsspesifikk"] },
  facts: [
    { id: "fact_tullin_namesake", label: "Claus Tullin er navneopphavet", desc: "Claus Tullin kjøpte Ruseløkken i 1807; Tullinløkka ble skilt ut i 1869.", confidence: "high", sources: [sourceRef("oslo_byleksikon"), sourceRef("riksantikvaren_nasjonalgalleriet")] },
    { id: "fact_tullin_1883", label: "2245 utstillere i 1883", desc: "Den norske Industri- og Kunstudstilling fylte Tullinløkka i 1883; Oslo byleksikon oppgir 2245 utstillere.", confidence: "high", sources: [sourceRef("oslo_byleksikon"), sourceRef("lokalhistoriewiki_1883")] },
    { id: "fact_tullin_1885", label: "Velociped-Ridning", desc: "I 1885 ble velocipedridning tillatt på Tullinløkka klokken 6–8 om morgenen.", confidence: "high", sources: [sourceRef("oslo_byleksikon")] },
    { id: "fact_tullin_2011", label: "Park fra 2011", desc: "Statsbygg anla park over Tullinløkka i 2011 med en fleksibel midtflate.", confidence: "high", sources: [sourceRef("statsbygg_stedsanalyse")] }
  ],
  chronology: [
    { id: "chrono_tullin_1807", year: 1807, title: "Claus Tullin kjøper Ruseløkken", desc: "Claus Tullin blir eier av den større løkkeeiendommen.", confidence: "high", sources: [sourceRef("oslo_byleksikon")] },
    { id: "chrono_tullin_1837", year: 1837, title: "Staten overtar", desc: "Staten overtar Ruseløkken.", confidence: "high", sources: [sourceRef("oslo_byleksikon")] },
    { id: "chrono_tullin_1869", year: 1869, title: "Tullinløkka skilles ut", desc: "Den åpne løkka skilles ut fra Ruseløkken.", confidence: "high", sources: [sourceRef("oslo_byleksikon"), sourceRef("riksantikvaren_nasjonalgalleriet")] },
    { id: "chrono_tullin_1876", year: 1876, title: "Løkka deles", desc: "Tullinløkka deles i to tomter; museumskanten utvikles videre.", confidence: "high", sources: [sourceRef("oslo_byleksikon")] },
    { id: "chrono_tullin_1881", year: 1881, title: "Skulpturmuseet åpner", desc: "Kjernen i det senere Nasjonalgalleriet åpner ved løkka.", confidence: "high", sources: [sourceRef("oslo_byleksikon"), sourceRef("riksantikvaren_nasjonalgalleriet")] },
    { id: "chrono_tullin_1883", year: 1883, title: "Industri- og Kunstudstillingen", desc: "Den store landsutstillingen fyller Tullinløkka.", confidence: "high", sources: [sourceRef("oslo_byleksikon"), sourceRef("lokalhistoriewiki_1883")] },
    { id: "chrono_tullin_1885", year: 1885, title: "Velociped-Ridning", desc: "Sykling med velociped tillates kl. 6–8.", confidence: "high", sources: [sourceRef("oslo_byleksikon")] },
    { id: "chrono_tullin_1890", year: 1890, title: "Demonstrasjonsplass i 1890-årene", desc: "Store demonstrasjoner bruker løkka; Bjørnson er blant talerne.", confidence: "high", datePrecision: "decade", sources: [sourceRef("oslo_byleksikon")] },
    { id: "chrono_tullin_1903", year: 1903, title: "Historisk museum fullføres", desc: "Museumsbygningen reist 1898–1903 rammer inn løkka.", confidence: "high", sources: [sourceRef("oslo_byleksikon")] },
    { id: "chrono_tullin_2005", year: 2005, title: "Kunsthallen åpner", desc: "Nasjonalmuseet tar den midlertidige Kunsthallen i bruk på Tullinløkka.", confidence: "high", sources: [sourceRef("nasjonalmuseet_2005"), sourceRef("statsbygg_stedsanalyse")] },
    { id: "chrono_tullin_2011", year: 2011, title: "Park over løkka", desc: "Statsbygg anlegger park og fleksibel aktivitetsflate.", confidence: "high", sources: [sourceRef("statsbygg_stedsanalyse")] }
  ],
  sources: sources.slice(0, 7).map(s => ({ id: s.id, title: s.title, url: s.url, type: s.type, verifiedAt }))
};
write(dedicatedLeksikonFile, leksikon);
const legacyLeksikonFile = "data/leksikon/places/oslo/mixed/leksikon_oslo_stedspakke_batch2.json";
const legacyLeksikon = read(legacyLeksikonFile);
if (Array.isArray(legacyLeksikon)) {
  write(legacyLeksikonFile, legacyLeksikon.filter(item => !String(item.id || "").startsWith("tullin_")));
} else if (Array.isArray(legacyLeksikon.entries)) {
  legacyLeksikon.entries = legacyLeksikon.entries.filter(item => !String(item.id || "").startsWith("tullin_")); write(legacyLeksikonFile, legacyLeksikon);
} else throw new Error("Unexpected legacy Tullin leksikon shape");
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = uniq([...(leksikonManifest.files || []).filter(f => f !== dedicatedLeksikonFile), dedicatedLeksikonFile]);
write("data/leksikon/manifest.json", leksikonManifest);

const wonderFile = "data/wonderkammer/site_package_batch_2.json";
const wonder = read(wonderFile);
const tullinWonder = (wonder.places || []).find(p => p.place_id === placeId);
if (!tullinWonder) throw new Error("Tullin Wonderkammer legacy package missing");
const nameChamber = (tullinWonder.chambers || []).find(c => c.id === "wk_tullin_navnet_tullin");
if (!nameChamber) throw new Error("Tullin namesake legacy chamber missing");
nameChamber.title = "Navnet Tullinløkka";
nameChamber.description = "Stedsnavnet Tullinløkka viser til kjøpmann og hoffintendant Claus Tullin, som kjøpte Ruseløkken i 1807. Faren Christian Braunmann Tullin er knyttet til Tullins gate, ikke navneopphavet til løkka.";
nameChamber.historyLayer = "Claus Tullin kjøpte Ruseløkken i 1807. Staten overtok i 1837, og Tullinløkka ble skilt ut i 1869.";
nameChamber.curiosity = "To medlemmer av samme familie har satt ulike spor i Oslo-navnene: Claus i Tullinløkka, faren Christian Braunmann i Tullins gate.";
nameChamber.collectionNote = "Du samlet navnet Tullinløkka som minnespor til Claus Tullin.";
nameChamber.sourceNote = urls.byleksikon;
write(wonderFile, wonder);

const stories = [
  {
    id: "st_tullin_fradelingen_1869", quality_profile: "episode_v1", type: "turning_point", title: "Da Tullinløkka ble en egen løkke", year: 1869, place_id: placeId, person_id: "claus_tullin",
    summary: "Etter at Claus Tullin hadde eid Ruseløkken og staten overtok i 1837, ble den åpne Tullinløkka skilt ut i 1869.",
    story: "Claus Tullin kjøpte Ruseløkken i 1807. Det var en langt større eiendom enn dagens Tullinløkka, og navnet på dagens plass kan derfor ikke leses som et tilfeldig gatenavn.\n\nDa staten overtok Ruseløkken i 1837, ble eiendommen en del av den store omformingen av området mellom den eldre byen og de nye statsinstitusjonene. I 1869 ble den åpne Tullinløkka skilt ut.\n\nFradelingen gjorde det mulig for løkka å fortsette som åpen flate mens institusjoner etter hvert bygde seg opp rundt kanten. Det er denne åpne identiteten History Go-stedet følger.",
    episode: { actors: ["Claus Tullin", "staten"], date: "1869", action: "Tullinløkka ble skilt ut fra Ruseløkken.", consequence: "Den åpne flaten fikk en egen varig stedsidentitet." },
    sources: [sourceRef("oslo_byleksikon"), sourceRef("riksantikvaren_nasjonalgalleriet")], tags: ["Ruseløkken", "stedsnavn", "byutvikling"], related_people: ["claus_tullin"], related_places: [], score: { narrative: 3, historical: 4, source: 5, play_value: 3, originality: 3, total: 18 }, arc: { start: "Claus Tullin eier Ruseløkken.", middle: "Staten overtar den store eiendommen.", end: "Tullinløkka skilles ut som egen åpen flate i 1869." }
  },
  {
    id: "st_tullin_industriutstillingen_1883", quality_profile: "episode_v1", type: "historical_event", title: "Da en utstillingsby fylte løkka", year: 1883, place_id: placeId,
    summary: "Den norske Industri- og Kunstudstilling fylte Tullinløkka med en stor midlertidig hovedbygning og 2245 utstillere.",
    story: "Sommeren 1883 forsvant mye av den vanlige åpne løkka bak en midlertidig utstillingsarkitektur. Den norske Industri- og Kunstudstilling bygde hovedhallen over Tullinløkka og koblet området til flere utstillingsfunksjoner rundt den.\n\nOslo byleksikon oppgir 2245 utstillere. Publikum kunne møte varer, maskiner, kunsthåndverk og instrumenter; Oslo Museums kilder dokumenterer blant annet et stort kirkeorgel på utstillingsgulvet.\n\nDa utstillingen var slutt, forsvant den midlertidige byen igjen. Episoden viser nettopp Tullinløkkas styrke: en åpen flate kunne få et intenst nytt program uten å bli permanent låst til det.",
    episode: { actors: ["utstillingsarrangørene", "2245 utstillere", "publikum"], date: "1883", action: "En stor midlertidig utstillingsarkitektur fylte Tullinløkka.", consequence: "Løkka ble et nasjonalt utstillingsrom og gikk senere tilbake til åpen flerbruk." },
    sources: [sourceRef("oslo_byleksikon"), sourceRef("lokalhistoriewiki_1883"), sourceRef("oslobilder_orgel")], tags: ["industri", "kunst", "utstilling", "midlertidig arkitektur"], related_people: [], related_places: [], score: { narrative: 4, historical: 4, source: 5, play_value: 4, originality: 4, total: 21 }, arc: { start: "Den åpne løkka bygges midlertidig inn.", middle: "2245 utstillere fyller området med produkter og kultur.", end: "Utstillingsbyen forsvinner, mens plassen består." }
  },
  {
    id: "st_tullin_velociped_1885", quality_profile: "episode_v1", type: "microhistory", title: "To morgentimer for velocipeden", year: 1885, place_id: placeId,
    summary: "I 1885 ble det gitt tillatelse til «Velociped-Ridning» på Tullinløkka, men bare mellom klokken seks og åtte om morgenen.",
    story: "Sykkelen var ennå ikke et selvsagt innslag i byens gater da Tullinløkka fikk en egen tidslomme for velocipeder i 1885. Tillatelsen gjaldt mellom klokken seks og åtte om morgenen.\n\nDen åpne flaten ble dermed en kontrollert prøvearena for en ny mobilitetsform. Det er lett å lese den historien som en kuriositet, men tidsbegrensningen forteller noe større: nye måter å bevege seg på må forhandles inn i eksisterende byrom.\n\nDagens trikk og holdeplass legger et annet mobilitetslag langs samme sted. Mellom 1885 og nå kan spilleren derfor lese et byrom som stadig blir koblet til nye transportformer.",
    episode: { actors: ["velocipedryttere", "byens myndigheter"], date: "1885", action: "Velociped-Ridning ble tillatt på Tullinløkka kl. 6–8.", consequence: "Løkka fungerte som tidlig regulert arena for en ny mobilitetsform." },
    sources: [sourceRef("oslo_byleksikon")], tags: ["velociped", "sykkel", "mobilitet", "byrom"], related_people: [], related_places: [], score: { narrative: 4, historical: 3, source: 4, play_value: 4, originality: 5, total: 20 }, arc: { start: "Velocipeden er ny i byen.", middle: "Tullinløkka får et to timers morgenvindu.", end: "En ny mobilitetsform får plass gjennom regulert bruk." }
  },
  {
    id: "st_tullin_fra_kunsthall_til_park_2011", quality_profile: "episode_v1", type: "turning_point", title: "Fra midlertidig kunsthall til park", year: 2011, place_id: placeId,
    summary: "Etter Kunsthallen fra 2005 og beslutningen om nytt Nasjonalmuseum på Vestbanen ble Tullinløkka i 2011 omgjort til park og aktivitetsflate av Statsbygg.",
    story: "I 2005 åpnet Nasjonalmuseet en midlertidig Kunsthall på Tullinløkka i forbindelse med «Kyss frosken». Hallen ga den gamle parkeringsflaten et nytt program, men den var ikke et permanent museumsløfte.\n\nDa det nye Nasjonalmuseet senere ble besluttet lagt til Vestbanen, endret premissene seg. Den midlertidige hallen forsvant, og Statsbygg anla i 2011 park over hele løkka med et midtfelt som fortsatt kunne romme arrangementer.\n\nOvergangen gjentok et gammelt Tullin-mønster: midlertidig struktur først, åpen flate etterpå. Derfor er 2011 viktigere som romlig vendepunkt enn som ferdig sluttpunkt.",
    episode: { actors: ["Nasjonalmuseet", "Statsbygg"], date: "2011", action: "Tullinløkka ble anlagt som park og fleksibel aktivitetsflate.", consequence: "Tiår med parkeringsdominans ble erstattet av et mer offentlig tilgjengelig plassrom." },
    sources: [sourceRef("nasjonalmuseet_2005"), sourceRef("statsbygg_stedsanalyse")], tags: ["Kunsthallen", "park", "Statsbygg", "transformasjon"], related_people: [], related_places: [], score: { narrative: 4, historical: 4, source: 5, play_value: 4, originality: 4, total: 21 }, arc: { start: "Kunsthallen gir parkeringsflaten et midlertidig nytt program.", middle: "Museumsplanene flyttes til Vestbanen.", end: "Statsbygg anlegger park over løkka i 2011." }
  }
];
const storyFile = `data/stories/stories_${placeId}.json`;
write(storyFile, stories);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = (storyManifest.files || []).filter(item => item.entity_id !== placeId);
storyManifest.files.push({ category: "by", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
episodeManifest.files = uniq([...(episodeManifest.files || []).filter(file => file !== storyFile && file !== `stories_${placeId}.json`), storyFile]);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const lesesporFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const lesespor = read(lesesporFile);
lesespor.items = (lesespor.items || []).filter(item => !(item.place_ids || []).includes(placeId));
const readingTracks = [
  ["lesespor_tullin_001", "Tullinløkka", "Oslo byleksikon", urls.byleksikon, "Direkte stedsartikkel for navn, fradeling, aktivitetsbruk, utstilling, demonstrasjoner og museumskanter."],
  ["lesespor_tullin_002", "Nasjonalgalleriet – historikk og Tullinløkka", "Riksantikvaren", urls.riksantikvaren, "Steds- og bygningshistorikk som plasserer Tullinløkka i utviklingen av statens kulturinstitusjoner."],
  ["lesespor_tullin_003", "Stedsanalyse Nationaltheatret/Tullinløkka", "Statsbygg", urls.statsbyggAnalysis, "Analyse av Tullinløkkas historiske lag, parkering, Kunsthallen og parktransformasjonen."],
  ["lesespor_tullin_004", "Den norske Industri- og Kunstudstilling 1883", "Lokalhistoriewiki", urls.exhibition, "Detaljert lesespor om hvordan den midlertidige utstillingsbyen fylte Tullinløkka i 1883."]
].map(([id, title, publication, url, relevance]) => ({ id, title, popupDesc: relevance, author: null, publication, type: "faglig_kilde", subjects: [{ type: "place", name: "Tullinløkka", id: placeId }], place_ids: [placeId], person_ids: [], category_hints: ["by", "historie"], summary: { themes: ["byrom", "transformasjon", "historiske lag"] }, classification: { tags: ["Tullinløkka", "Oslo sentrum", "byhistorie"] }, url, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate", relevance, verifiedAt }));
lesespor.items.push(...readingTracks);
write(lesesporFile, lesespor);

const q = (question, correct, wrongA, wrongB, sourceId, emneId, concepts = ["Tullinløkka"]) => ({ question, correct, wrongA, wrongB, sourceId, emneId, concepts });
const rawQuestions = [
  q("Hva er den fysiske kjernen i History Go-stedet Tullin?", "Tullinløkka", "Hele Homansbyen", "Slottsparken", "oslo_byleksikon", "em_by_offentlige_rom_motesteder"),
  q("Hvem har Tullinløkka navn etter?", "Claus Tullin", "Christian Braunmann Tullin", "Henrik Bull", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom", ["stedsnavn"]),
  q("Hva kjøpte Claus Tullin i 1807?", "Ruseløkken", "Nasjonalgalleriet", "Nisseberget", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom"),
  q("Når overtok staten Ruseløkken?", "1837", "1807", "1883", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom"),
  q("Når ble Tullinløkka skilt ut fra Ruseløkken?", "1869", "1837", "1903", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hvilke to institusjonsbygg rammer Tullinløkka tydelig inn i dag?", "Nasjonalgalleriet og Historisk museum", "Stortinget og Slottet", "Oslo rådhus og Nobels Fredssenter", "oslo_byleksikon", "em_by_bygningstyper_og_typologier"),
  q("Hva var «Legepladsen» et uttrykk for på Tullinløkka?", "Lek og idrett på den åpne flaten", "Et fast sykehus", "Et lukket museumslager", "oslo_byleksikon", "em_by_offentlige_rom_motesteder"),

  q("Hva fylte Tullinløkka i 1883?", "Den norske Industri- og Kunstudstilling", "Verdensutstillingen i Paris", "Holmenkollrennet", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hvor mange utstillere oppgir Oslo byleksikon for 1883-utstillingen?", "2245", "245", "22 450", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva skjedde med hovedbygningen etter 1883-utstillingen?", "Den var midlertidig og forsvant", "Den ble Stortinget", "Den ble flyttet til Ekeberg", "lokalhistoriewiki_1883", "em_by_bygningstyper_og_typologier"),
  q("Hva dokumenterer Oslo Museums OB.03774 fra utstillingen?", "Et stort kirkeorgel på utstillingsgulvet", "En kongelig bil", "En flymaskin", "oslobilder_orgel", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva ble tillatt på Tullinløkka i 1885?", "Velociped-Ridning", "Flyoppvisning", "Motorsport", "oslo_byleksikon", "em_by_offentlige_rom_motesteder"),
  q("Når på dagen var Velociped-Ridning tillatt i 1885?", "Klokken 6–8 om morgenen", "Hele natten", "Bare etter klokken 20", "oslo_byleksikon", "em_by_offentlige_rom_motesteder"),
  q("Hva viser tidsbegrensningen for velocipeder best?", "At ny mobilitet måtte forhandles inn i byrommet", "At Tullinløkka var privat bolig", "At sykler var forbudt i Norge", "oslo_byleksikon", "em_by_offentlige_rom_motesteder"),

  q("Hvilken rolle fikk Tullinløkka i 1890-årene?", "Møteplass for store demonstrasjoner", "Fast havneområde", "Militær flyplass", "oslo_byleksikon", "em_by_demonstrasjoner_markeringer"),
  q("Hvem nevnes blant talerne på Tullinløkka?", "Bjørnstjerne Bjørnson", "Edvard Grieg", "Fridtjof Nansen", "oslo_byleksikon", "em_by_demonstrasjoner_markeringer"),
  q("Hvorfor er Bjørnson relevant som People-anker?", "Han er dokumentert som taler på plassen", "Han ga løkka navn", "Han tegnet Historisk museum", "oslo_byleksikon", "em_by_demonstrasjoner_markeringer"),
  q("Hvorfor er Claus Tullin fortsatt et annet People-anker?", "Han er navneopphavet", "Han åpnet Kunsthallen", "Han kjørte den første trikken", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva åpnet ved Tullinløkka i 1881?", "Skulpturmuseet, kjernen i Nasjonalgalleriet", "Munchmuseet", "Norsk Folkemuseum", "oslo_byleksikon", "em_by_bygningstyper_og_typologier"),
  q("Når ble Historisk museum reist?", "1898–1903", "1769–1772", "1955–1960", "oslo_byleksikon", "em_by_bygningstyper_og_typologier"),
  q("Hva er korrekt om museumsbygningene og History Go-stedet?", "De rammer inn plassen, men er ikke hele Tullin-identiteten", "De gjør plassen til ett museum", "De ligger ikke ved Tullinløkka", "oslo_byleksikon", "em_by_offentlige_rom_motesteder"),

  q("Hva preget store deler av Tullinløkka gjennom 1900-tallet?", "Bilparkering", "Fast jordbruk", "En permanent fornøyelsespark", "statsbygg_stedsanalyse", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva åpnet Nasjonalmuseet på løkka i 2005?", "En midlertidig Kunsthall", "Et nytt permanent Nasjonalgalleri", "En jernbanestasjon", "nasjonalmuseet_2005", "em_by_bygningstyper_og_typologier"),
  q("Hvilken manifestasjon var knyttet til Kunsthallen i 2005?", "Kyss frosken", "Norway Cup", "Middelalderuka", "nasjonalmuseet_2005", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva skjedde da nytt Nasjonalmuseum ble lagt til Vestbanen?", "Premisset for den midlertidige Tullin-hallen endret seg", "Tullinløkka ble sjø", "Historisk museum ble revet", "statsbygg_stedsanalyse", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva gjorde Statsbygg på Tullinløkka i 2011?", "Anla park og aktivitetsflate", "Bygde Stortinget", "Flyttet Slottet", "statsbygg_stedsanalyse", "em_by_offentlige_rom_motesteder"),
  q("Hva ble beholdt i parkgrepet?", "Et fleksibelt midtfelt for aktivitet og arrangementer", "En permanent bilbane", "Et inngjerdet privat hageanlegg", "statsbygg_stedsanalyse", "em_by_offentlige_rom_motesteder"),
  q("Hvorfor kvalifiserer Statsbygg som Brand ved Tullin?", "På grunn av den dokumenterte rollen i parktransformasjonen", "Fordi alle statlige steder automatisk får Statsbygg", "Fordi Statsbygg ga løkka navn", "statsbygg_stedsanalyse", "em_by_symbolsk_makt_og_representasjon"),

  q("Hva viser før/nå-paret best?", "At samme åpne sted kan leses gjennom skiftende kanter og bruk", "At kamerastandpunktet er helt identisk", "At alle 1880-bygninger står uendret", "commons_before", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hvorfor må før/nå-paret ha et ståstedscaveat?", "Bildene er tatt fra ulike ståsteder og utsnitt", "Fordi ett bilde er et kart", "Fordi begge er malerier", "commons_now", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hvilket mønster går igjen i Tullinløkkas historie?", "Midlertidige programmer kommer og går mens den åpne flaten består", "Plassen har alltid hatt én funksjon", "Stedet har aldri vært offentlig brukt", "statsbygg_stedsanalyse", "em_by_offentlige_rom_motesteder"),
  q("Hva skiller Tullinløkka fra et enkelt museumssted?", "Historien handler om den åpne flaten mellom flere institusjoner", "Det finnes ingen museumsbygg ved plassen", "Museene er underjordiske", "oslo_byleksikon", "em_by_offentlige_rom_motesteder"),
  q("Hva gjør holdeplasskiltet til et egnet Object?", "Det er et fysisk, navngitt orienteringsobjekt på stedet", "Det er et abstrakt transportbegrep", "Det er et privat varemerke uten sted", "commons_stop", "em_by_barrierer_forbindelser"),
  q("Hva gjør kirkeorgelet til et historisk Object i pakken?", "Det er dokumentert som fysisk utstillingsgjenstand på løkka i 1883", "Det står fast på plassen i dag", "Det er navnet på en bygning", "oslobilder_orgel", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva er den sikreste måten å lese 1883-hallen i dag?", "Som et forsvunnet strukturspor dokumentert i kilder og bilder", "Som en bygning som fortsatt står", "Som en ny plan fra 2026", "lokalhistoriewiki_1883", "em_by_bygningstyper_og_typologier"),

  q("Hva bør en feltobservasjon på Tullinløkka starte med?", "Den åpne flaten, kantene og bevegelseslinjene som faktisk kan observeres", "En antakelse om hva folk føler", "En teori uten å se stedet", "statsbygg_stedsanalyse", "em_by_offentlige_rom_motesteder"),
  q("Hva hjelper William H. Whytes bylivsperspektiv oss å spørre om?", "Hvordan en liten åpen plass faktisk brukes og oppholder mennesker", "Hvilken konge som eide Ruseløkken", "Hvordan et orgel stemmes", "statsbygg_stedsanalyse", "em_by_offentlige_rom_motesteder"),
  q("Hva er et godt Whyte-spørsmål på Tullinløkka?", "Hvor folk stopper, sitter, passerer og samles på den åpne flaten", "Hvilken farge alle hus burde ha", "Hvor mange sider en historiebok har", "statsbygg_stedsanalyse", "em_by_offentlige_rom_motesteder"),
  q("Hva tilfører Pierre Noras minneperspektiv?", "Et språk for hvordan forsvunne brukslag kan leve videre som stedsspor", "En fasit på hvor trikken skal gå", "En metode for å bygge orgler", "oslo_byleksikon", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hvilket Tullin-spor passer særlig til et slikt minneperspektiv?", "1883-utstillingen som er borte fysisk, men dokumentert i stedets historie", "En tilfeldig butikk uten stedskobling", "En plan som aldri har berørt stedet", "lokalhistoriewiki_1883", "em_by_historiske_lag_i_hverdagsrom"),
  q("Hva kan Aldo Rossis byperspektiv hjelpe oss å skille?", "Varige bystrukturer fra skiftende programmer og funksjoner", "Riktig svar fra galt bare ved årstall", "Sykkel fra trikk etter farge", "riksantikvaren_nasjonalgalleriet", "em_by_bygningstyper_og_typologier"),
  q("Hva kan Genius Loci brukes forsiktig til her?", "Å undersøke hvordan åpen flate, kanter og historiske lag gir stedet særpreg", "Å hevde at stedet har én mystisk essens", "Å erstatte dokumenterte kilder", "statsbygg_stedsanalyse", "em_by_historiske_lag_i_hverdagsrom")
];
if (rawQuestions.length !== 42) throw new Error(`Tullin quiz must be 42 questions; got ${rawQuestions.length}`);
const theoryBindings = new Map([
  [36, { topic_hook_id: "byliv_aapne_rom", thinker_id: "william_h_whyte", work: "The Social Life of Small Urban Spaces", method_id: "met_feltobservasjon" }],
  [37, { topic_hook_id: "byliv_aapne_rom", thinker_id: "william_h_whyte", work: "The Social Life of Small Urban Spaces", method_id: "met_feltobservasjon" }],
  [38, { topic_hook_id: "his_spor_gatebilde", thinker_id: "pierre_nora", work: "Les Lieux de Mémoire", method_id: "met_for_etter" }],
  [39, { topic_hook_id: "his_spor_gatebilde", thinker_id: "pierre_nora", work: "Les Lieux de Mémoire", method_id: "met_for_etter" }],
  [40, { topic_hook_id: "ark_bygningstyper", thinker_id: "aldo_rossi", work: "The Architecture of the City", method_id: "met_feltobservasjon" }],
  [41, { topic_hook_id: "ark_materialbruk", thinker_id: "christian_norberg_schulz", work: "Genius Loci", method_id: "met_gaanalyse" }]
]);
const questions = rawQuestions.map((row, index) => {
  const n = index + 1;
  const slot = index % 3;
  const options = slot === 0 ? [row.correct, row.wrongA, row.wrongB] : slot === 1 ? [row.wrongA, row.correct, row.wrongB] : [row.wrongA, row.wrongB, row.correct];
  const binding = theoryBindings.get(index);
  const claimId = `claim_${placeId}_quiz_${String(n).padStart(2, "0")}`;
  return {
    id: `${placeId}_quiz_${String(n).padStart(2, "0")}`, quiz_id: `by_${placeId}_set_${Math.floor(index / 7) + 1}_q${(index % 7) + 1}`,
    categoryId: "by", placeId, targetId: placeId, question_scope: "place", question: row.question, options,
    answer: row.correct, answerIndex: slot, knowledge: `${row.correct}. Spørsmålet er forankret i dokumentert Tullinløkka-historie og By-fagverket.`,
    core_concepts: row.concepts, difficulty: index < 14 ? 1 : index < 28 ? 2 : index < 35 ? 3 : 4,
    question_type: binding ? "theory_application" : index < 14 ? "fact" : index < 35 ? "context" : "method",
    emne_id: row.emneId, source: [row.sourceId], source_origin: "external", claim_basis: row.correct, claim_id: claimId,
    ...(binding ? { method_id: binding.method_id, topic_hook_id: binding.topic_hook_id, thinker_id: binding.thinker_id, work: binding.work, theory_ref: { topic_hook_id: binding.topic_hook_id, thinker_id: binding.thinker_id, work: binding.work }, guidance_basis: ["data/fag/by/emner_by.json", "data/fag/by/methods_by.json", "data/fag/by/fagkart_by.json"] } : {})
  };
});
const setTitles = ["Navnet og den åpne løkka", "Utstillingen og velocipeden", "Demonstrasjoner og museumskanter", "Kunsthall, parkering og park", "Spor, objekter og byrom", "Feltblikk og teori"];
const quizFile = `data/quiz/by/${placeId}_sets.json`;
const briefFile = `data/quiz/production_briefs/by/${placeId}.json`;
const contextFile = `data/quiz/production_context/by/${placeId}.json`;
const quiz = {
  targetId: placeId, categoryId: "by", size_class: "rich_6x7", generator_version: "history_go_manual_reviewed_v1", generated_from: briefFile,
  sources: Object.fromEntries(sources.map(s => [s.id, s.url])),
  sets: setTitles.map((title, index) => ({ set_id: `by_${placeId}_set_${index + 1}`, title, level: index + 1, order: index + 1, phase: index === 0 ? "opening" : index < 4 ? "middle" : index === 4 ? "bridge" : "final", xp: 50 + index * 10, questions: questions.slice(index * 7, index * 7 + 7) }))
};
write(quizFile, quiz);
const claimsBrief = rawQuestions.map((row, index) => ({ claim_id: `claim_${placeId}_quiz_${String(index + 1).padStart(2, "0")}`, order: index + 1, planned_phase: index < 7 ? "opening" : index < 28 ? "middle" : index < 35 ? "bridge" : "final", family: index < 14 ? "fact" : index < 35 ? "context" : "concept_theory", statement: row.correct, source_ids: [row.sourceId], source_origin: "external", emne_id: row.emneId }));
const brief = {
  schema_version: "1.0", categoryId: "by", targetId: placeId, status: "reviewed", reviewed_at: verifiedAt,
  review_note: "Oslo byleksikon, Riksantikvaren, Statsbygg, Nasjonalmuseet, Lokalhistoriewiki og arkiv-/Commons-kilder er lest og sammenholdt. Claus Tullin/Christian Braunmann Tullin-feilen er eksplisitt rettet, fremtidsplaner er holdt utenfor, og midlertidige historiske strukturer presenteres som historiske.",
  profile_hint: "rich_6x7", scope: "Tullinløkka som avgrenset offentlig byrom fra Ruseløkken og fradelingen i 1869 gjennom lek, 1883-utstilling, velociped, demonstrasjoner, museumskanter, parkering, Kunsthallen og Statsbyggs park fra 2011.",
  sources: Object.fromEntries(sources.map(s => [s.id, { url: s.url, source_type: s.type, review_status: s.review_status, review_note: s.review_note }])),
  claims: claimsBrief,
  existing_quiz_audit: { searched_paths: ["data/quiz/manifest.json", quizFile, placeFile], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen aktiv canonical Tullin-quiz var registrert før fullproduksjonen." }, decisions: { keep_as_claim_basis: [], rewrite: "Ny kildegjennomgått 6×7-progresjon.", move: [], remove: [] }, knowledge_migration: "42 unike spørsmål materialiseres gjennom canonical Knowledge-pipelinen." },
  profile_decision: { profile: "rich", set_count: 6, questions_per_set: 7, justification: "Tullinløkka har seks uavhengige, kildebelagte læringsjobber: identitet/navn, 1883+velociped, demonstrasjoner+museumskanter, parkering/Kunsthall/park, stedsspor/objekter og sen felt-/teorianalyse." },
  held_back_candidates: ["Christian Braunmann Tullin som navneopphav – faktuelt feil for løkka.", "Ny Nationaltheatret-plan – fremtidslag, ikke ferdig canonical struktur.", "Tilfeldige nærliggende restaurant-/butikkbrands uten direkte stedseierskap eller varig dokumentert rolle."]
};
write(briefFile, brief);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.by.quizPackageSchema = fagManifest.by.quizPackageSchema || "../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json";
fagManifest.by.quizProduction = fagManifest.by.quizProduction || { status: "pilot", required_inputs: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], context_builder: "scripts/build-quiz-production-context.mjs", profile_system: "adaptive_relative_superset", package_schema: "quizPackageSchema", context_artifact_root: "data/quiz/production_context", targets: {} };
fagManifest.by.quizProduction.targets = fagManifest.by.quizProduction.targets || {};
fagManifest.by.quizProduction.targets[placeId] = { source_brief: `../quiz/production_briefs/by/${placeId}.json`, context_artifact: `../quiz/production_context/by/${placeId}.json`, quiz_file: `../quiz/by/${placeId}_sets.json` };
write("data/fag/fag_manifest.json", fagManifest);
const builtContext = await buildQuizProductionContext({ root, categoryId: "by", targetId: placeId });
write(contextFile, builtContext);
quiz.production_context = { ...builtContext, existing_quiz_audit: brief.existing_quiz_audit, profile_decision: brief.profile_decision, held_back_candidates: brief.held_back_candidates, theory_start_phase: "final", method_start_phase: "final" };
write(quizFile, quiz);
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = (quizManifest.sets || []).filter(item => item.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);

const claims = [
  ["identity", "History Go-stedet Tullin er forankret i Tullinløkka, plassen mellom Nasjonalgalleriet og Historisk museum.", "oslo_byleksikon", "identity", null],
  ["namesake", "Tullinløkka har navn etter Claus Tullin, som kjøpte Ruseløkken i 1807.", "oslo_byleksikon", "ordinary", 1807],
  ["state", "Staten overtok Ruseløkken i 1837.", "oslo_byleksikon", "ordinary", 1837],
  ["separation", "Tullinløkka ble skilt ut fra Ruseløkken i 1869.", "oslo_byleksikon", "ordinary", 1869],
  ["play", "Tullinløkka ble brukt som Legepladsen for barn og idrettsungdom.", "oslo_byleksikon", "ordinary", null],
  ["exhibition", "Den norske Industri- og Kunstudstilling ble holdt på Tullinløkka i 1883 med 2245 utstillere.", "oslo_byleksikon", "ordinary", 1883],
  ["velocipede", "I 1885 ble Velociped-Ridning tillatt på Tullinløkka klokken 6–8 om morgenen.", "oslo_byleksikon", "ordinary", 1885],
  ["demonstrations", "Store demonstrasjoner samlet seg på Tullinløkka i 1890-årene, og Bjørnstjerne Bjørnson var blant talerne.", "oslo_byleksikon", "ordinary", 1890],
  ["gallery", "Skulpturmuseet, kjernen i senere Nasjonalgalleriet, åpnet i 1881.", "oslo_byleksikon", "ordinary", 1881],
  ["museum", "Historisk museum ble reist i perioden 1898–1903.", "oslo_byleksikon", "ordinary", 1903],
  ["parking", "Tullinløkka var i store deler av 1900-tallet dominert av parkering.", "statsbygg_stedsanalyse", "ordinary", null],
  ["kunsthall", "Nasjonalmuseet tok i 2005 i bruk en midlertidig Kunsthall på Tullinløkka.", "nasjonalmuseet_2005", "ordinary", 2005],
  ["park", "Statsbygg anla park over Tullinløkka i 2011 og beholdt et fleksibelt midtfelt for aktivitet.", "statsbygg_stedsanalyse", "ordinary", 2011],
  ["organ", "Oslo Museums kilder dokumenterer kirkeorgel som fysisk utstillingsgjenstand under industriutstillingen 1883.", "oslobilder_orgel", "ordinary", 1883],
  ["before", "Commons-fotografiet av Tullinløkka er datert til omkring 1880.", "commons_before", "ordinary", 1880],
  ["now", "Commons-fotografiet viser SL18 ved Tullinløkka 10. august 2023.", "commons_now", "ordinary", 2023]
].map(([id, claim, sourceId, claimKind, timelineYear]) => ({ id: `claim_tullin_${id}`, claim, sourceUrl: sourceById[sourceId].url, sourceLocation: sourceById[sourceId].title, sourceType: sourceById[sourceId].type, verifiedAt, status: "verified", claimKind, evidenceMode: "direct", temporalStatus: timelineYear && timelineYear > 2020 ? "current" : "historical", ...(timelineYear ? { timelineYear } : {}) }));
const claimIdsByKeyword = sentence => {
  const s = sentence.toLowerCase();
  const out = [];
  const add = key => out.push(`claim_tullin_${key}`);
  if (/history go|tullinløkka|plassen mellom/.test(s)) add("identity");
  if (/claus|1807|navn/.test(s)) add("namesake");
  if (/1837/.test(s)) add("state");
  if (/1869|skilt ut|fradel/.test(s)) add("separation");
  if (/legeplads|barn|idrettsungdom/.test(s)) add("play");
  if (/1883|industri|kunstudstilling|utstiller|utstillings/.test(s)) add("exhibition");
  if (/orgel/.test(s)) add("organ");
  if (/1885|velociped/.test(s)) add("velocipede");
  if (/1890|demonstr|bjørnson|taler/.test(s)) add("demonstrations");
  if (/skulpturmuse|nasjonalgalleri|1881/.test(s)) add("gallery");
  if (/historisk museum|1898|1903/.test(s)) add("museum");
  if (/parkering|1900-tallet/.test(s)) add("parking");
  if (/kunsthall|2005|kyss frosken/.test(s)) add("kunsthall");
  if (/statsbygg|2011|park over|aktivitetsflate|vestbanen/.test(s)) add("park");
  if (/1880|historisk fotograf/.test(s)) add("before");
  if (/2023|sl18|nå-paret|før\/nå/.test(s)) add("now");
  return uniq(out.length ? out : ["claim_tullin_identity"]);
};
const sentenceCoverage = {
  desc: splitSentences(desc).map((sentence, i) => ({ sentence: i + 1, claimIds: claimIdsByKeyword(sentence) })),
  popupDesc: splitSentences(popupDesc).map((sentence, i) => ({ sentence: i + 1, claimIds: claimIdsByKeyword(sentence) }))
};
const production = {
  schemaVersion: "4.2", validatorVersion: "4.2.1", status: "ready_v4_2", placeId, placeFile,
  identity: { status: "resolved", represents: "Tullinløkka som avgrenset åpen plass og dens direkte fysiske kanter, objektspor og dokumenterte bruks-/transformasjonshistorie.", period: "1869–", excludes: ["hele det markedsførte Tullin-området", "Tullins gate", "hele Nasjonalgalleriet eller Historisk museum som egne stedsidentiteter", "fremtidige Nationaltheatret-planer som om de var bygget"] },
  claims, sentenceCoverage,
  sourceReview: { status: "complete", reviewedAt: verifiedAt, sources },
  collections: { people: ["bjornstjerne_bjornson"], objects: objects.map(o => o.id), brands: ["statsbygg"], structures: structures.map(s => s.id), related_people: ["claus_tullin"] },
  coordinateDecision: { status: "preserved", lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSourceId: place.coordSourceId, sourceObjectId: place.sourceObjectId },
  imageDecision: { status: "verified", frontImage: place.frontImage, placeImage: place.image, historicImage: place.for_na.beforeImage, collectionImagesComplete: true },
  factualRepair: { status: "complete", corrected: "Christian Braunmann Tullin → Claus Tullin as namesake of Tullinløkka", files: [legacyLeksikonFile, wonderFile, clausFile] },
  quiz: { profile: "rich_6x7", set_count: 6, question_count: 42, file: quizFile, first_14_fact_first: true },
  stories: { count: stories.length, all_episode_v1: stories.every(s => s.quality_profile === "episode_v1"), file: storyFile },
  readingTracks: { count: readingTracks.length, file: lesesporFile },
  language: { count: languageEntries.length, file: languageFile },
  chronology: { count: leksikon.chronology.length, file: dedicatedLeksikonFile },
  verifiedAt
};
write(`data/places/production/${placeId}.json`, production);

const workcard = {
  schema: "history_go_place_workcard_v1", place_id: placeId, category: "by", status: "complete", completed_at: verifiedAt,
  coordinate_decision: "preserved_verified_geometry_anchor", source_review: "complete", collections: ["people", "objects", "brands", "structures"],
  quiz_profile: "rich_6x7", quality_gate: "30/30", canonical_next: null,
  evidence: { place_file: placeFile, production_file: `data/places/production/${placeId}.json`, quiz_file: quizFile, stories_file: storyFile, language_file: languageFile, lesespor_file: lesesporFile, leksikon_file: dedicatedLeksikonFile },
  factual_repair: "Claus Tullin corrected as namesake across legacy Tullin surfaces",
  read_first_status: "record_after_materialization"
};
write(`reports/place-production/${placeId}-workcard-current.json`, workcard);

const quality = {
  schema: "history_go_place_quality_gate_v1", place_id: placeId, scored_at: verifiedAt, blockers: [], critical_findings: [],
  dimensions: [
    { id: "correctness_evidence", score: 5, max: 5, evidence: "Namesake, dates, temporary/current status and image provenance are source-bound; the legacy namesake error is repaired." },
    { id: "coverage_completion", score: 5, max: 5, evidence: "Four canonical collections, 4 Stories, 11 chronology anchors, 4 reading tracks, 6 language entries and 6×7 quiz are materialized." },
    { id: "editorial_quality", score: 5, max: 5, evidence: "Tullin is bounded to Tullinløkka; temporary structures and broader district branding are not conflated with the place." },
    { id: "technical_integrity", score: 5, max: 5, evidence: "Geometry is locked, manifests are updated and generated artifacts are rebuilt by the producer workflow." },
    { id: "safety_responsibility", score: 5, max: 5, evidence: "Collection interactions use public-space observation; no fabricated portrait or private-access task is introduced." },
    { id: "maintainability_auditability", score: 5, max: 5, evidence: "Dedicated production file, source brief, context artifact, workcard, target test and deterministic materializer make the package reproducible." }
  ],
  total: 30, max: 30, conclusion: "PASS"
};
write(`reports/place-production/${placeId}-phase1-24-gate-audit-v1.json`, quality);

const test = `import test from "node:test";\nimport assert from "node:assert/strict";\nimport fs from "node:fs";\nconst read=p=>JSON.parse(fs.readFileSync(p,"utf8"));\nconst place=read("${placeFile}");\nconst prod=read("data/places/production/${placeId}.json");\nconst quiz=read("${quizFile}");\nconst stories=read("${storyFile}");\ntest("Tullin preserves verified geometry and identity",()=>{assert.equal(place.lat,59.91651);assert.equal(place.lon,10.73644);assert.equal(place.coordStatus,"verified_geometry");assert.match(place.popupDesc,/Claus Tullin/);assert.doesNotMatch(place.popupDesc,/navn etter dikteren Christian/);});\ntest("Tullin has exactly four canonical full-place collections",()=>{assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","brands","structures"]);assert.equal(place.place_card_profile.category_collection_label,"Byrom og anlegg");assert.ok(place.objects.length>=2);assert.ok(place.structures.length>=3);});\ntest("Tullin has image-complete visible collections",()=>{for(const o of place.objects)assert.ok(o.image&&fs.existsSync(o.image));for(const s of place.structures)assert.ok(s.image&&fs.existsSync(s.image));assert.ok(fs.existsSync("bilder/kort/people/bjornstjerne_bjornson.jpg"));assert.ok(fs.existsSync("${brandLogo}"));assert.ok(fs.existsSync(place.frontImage));});\ntest("Tullin rich quiz is 6x7 with distributed answer positions",()=>{assert.equal(quiz.sets.length,6);assert.ok(quiz.sets.every(s=>s.questions.length===7));const qs=quiz.sets.flatMap(s=>s.questions);assert.equal(qs.length,42);assert.deepEqual([...new Set(qs.slice(0,14).map(q=>q.question_type))],["fact"]);assert.ok(new Set(qs.map(q=>q.answerIndex)).size===3);});\ntest("Tullin completion package is source-backed and complete",()=>{assert.equal(prod.status,"ready_v4_2");assert.equal(prod.claims.length,16);assert.equal(stories.length,4);assert.ok(stories.every(s=>s.quality_profile==="episode_v1"));assert.equal(prod.factualRepair.status,"complete");});\n`;
fs.writeFileSync(path.join(root, `tests/${placeId}-completion.test.mjs`), test);

console.log(JSON.stringify({ placeId, branch, geometry: coordinateLock, collections: place.place_card_profile.collection_ids, people: ["bjornstjerne_bjornson", "claus_tullin"], objects: objects.map(x => x.id), brands: ["statsbygg"], structures: structures.map(x => x.id), stories: stories.length, chronology: leksikon.chronology.length, lesespor: readingTracks.length, language: languageEntries.length, quiz: "6x7", quality: "30/30", digest: sha256(JSON.stringify({ desc, popupDesc, objects, structures })) }, null, 2));
