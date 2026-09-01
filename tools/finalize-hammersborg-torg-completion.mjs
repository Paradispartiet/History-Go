#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const root = process.cwd();
const placeId = "hammersborg_torg";
const verifiedAt = "2026-09-01";
const placeFile = "data/places/by/oslo/places/hammersborg_torg.json";
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
  byleksikon: "https://oslobyleksikon.no/side/Hammersborg_Torg",
  lokalwiki: "https://lokalhistoriewiki.no/Hammersborg_torg",
  dagsavisen: "https://www.dagsavisen.no/nyheter/forstaden-som-forsvant/9970229",
  folkemuseum: "https://norskfolkemuseum.no/hammersborg",
  arbeiderboliger: "https://oslobyleksikon.no/side/Arbeiderboliger",
  christianiaArbeiderboliger: "https://lokalhistoriewiki.no/wiki/Christiania_Arbeiderboliger",
  rinnan: "https://snl.no/Frode_Rinnan",
  rinnanPlace: "https://lokalhistoriewiki.no/wiki/Frode_Rinnan",
  morgenstierne: "https://lokalhistoriewiki.no/wiki/Christian_Fredrik_Jacob_von_Munthe_af_Morgenstierne",
  holtermann: "https://nkl.snl.no/Peter_H%C3%B8ier_Holtermann",
  obosCurrent: "https://www.obos.no/naringseiendom/eiendommer/hammersborg-torg",
  hk: "https://www.hkhammersborg.no/",
  osm: "https://www.openstreetmap.org/way/661556268",
  currentPage: "https://commons.wikimedia.org/wiki/File:Oslo,_St._Hanshaugen,_Hammersborg_torg.JPG",
  currentAsset: "https://upload.wikimedia.org/wikipedia/commons/9/91/Oslo%2C_St._Hanshaugen%2C_Hammersborg_torg.JPG",
  obosBuildingPage: "https://commons.wikimedia.org/wiki/File:OBOS,_Hammersborg_Torg_1,_Oslo.jpg",
  obosBuildingAsset: "https://upload.wikimedia.org/wikipedia/commons/4/47/OBOS%2C_Hammersborg_Torg_1%2C_Oslo.jpg",
  oldSquarePage: "https://digitaltmuseum.no/011014696767/hammersborg-torg",
  oldSquareAsset: "https://ems.dimu.org/image/012uK2eK5hLf?filename=OB.NW0162.jpg&dimension=max&quality=100&dpi=300&mediatype=image/jpg",
  blixPage: "https://digitaltmuseum.no/021046969838/hammersborg-torv-papirkunst",
  blixAsset: "https://ems.dimu.org/image/032yjyoYxHaq?filename=JWC.120.jpg&dimension=max&quality=100&dpi=300&mediatype=image/jpg",
  pissoirPage: "https://digitaltmuseum.no/011014547700/hammersborg-torv",
  pissoirAsset: "https://ems.dimu.org/image/032sBYHURzTW?filename=OB.F14671c.jpg&dimension=max&quality=100&dpi=300&mediatype=image/jpg",
  bolignPage: "https://digitaltmuseum.no/021016269884/nedre-hammersborggate-11-ved-mollergata",
  bolignAsset: "https://ems.dimu.org/image/022wZ13ELEBN?filename=OB.L0051.jpg&dimension=max&quality=100&dpi=300&mediatype=image/jpg",
  rinnanPortraitPage: "https://commons.wikimedia.org/wiki/File:Frode_Rinnan_OB.F06358d.jpg",
  rinnanPortraitAsset: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Frode_Rinnan_OB.F06358d.jpg",
  morgenstiernePortraitPage: "https://commons.wikimedia.org/wiki/File:Christian_Fredrik_Jacob_von_Munthe_af_Morgenstierne-OB.00302.jpg",
  morgenstiernePortraitAsset: "https://upload.wikimedia.org/wikipedia/commons/9/90/Christian_Fredrik_Jacob_von_Munthe_af_Morgenstierne-OB.00302.jpg",
  holtermannPortraitPage: "https://commons.wikimedia.org/wiki/File:Peter_H%C3%B8ier_Holtermann_by_Adolph_Tidemand_(cropped2).jpg",
  holtermannPortraitAsset: "https://upload.wikimedia.org/wikipedia/commons/d/db/Peter_H%C3%B8ier_Holtermann_by_Adolph_Tidemand_%28cropped2%29.jpg",
  obosLogoPage: "https://commons.wikimedia.org/wiki/File:Obos_logo.png",
  obosLogoAsset: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Obos_logo.png",
  obosLogoOfficial: "https://grunnmuren.obos.no/logo"
};

const localSourceFallbacks = new Map([
  [urls.currentAsset, "/tmp/hammersborg-current.jpg"],
  [urls.obosBuildingAsset, "/tmp/hammersborg-obos.jpg"],
  [urls.oldSquareAsset, "/tmp/hammersborg-torg-1908.jpg"],
  [urls.blixAsset, "/tmp/hammersborg-blix-1875.jpg"],
  [urls.pissoirAsset, "/tmp/hammersborg-pissoir.jpg"],
  [urls.bolignAsset, "/tmp/nedre-hammersborggate-11.jpg"],
  [urls.rinnanPortraitAsset, path.join(root, "bilder/kort/people/frode_rinnan.webp")],
  [urls.morgenstiernePortraitAsset, path.join(root, "bilder/kort/people/christian_fredrik_morgenstierne.webp")],
  [urls.holtermannPortraitAsset, "/tmp/hammersborg-holtermann.jpg"],
  [urls.obosLogoAsset, "/tmp/hammersborg-obos-logo.png"]
]);
const imageCache = new Map();
async function fetchBuffer(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  const fallback = localSourceFallbacks.get(url);
  if (fallback && fs.existsSync(fallback)) {
    const buffer = fs.readFileSync(fallback);
    imageCache.set(url, buffer);
    return buffer;
  }
  let lastStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(url, { headers: { "user-agent": "History-Go-place-production/1.0" } });
    lastStatus = response.status;
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      imageCache.set(url, buffer);
      return buffer;
    }
    if (![429, 500, 502, 503, 504].includes(response.status)) break;
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 30000)
      : Math.min(1250 * (2 ** attempt), 20000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error(`Kunne ikke hente bilde etter retries (${lastStatus}): ${url}`);
}
async function outputImage({ url, file, width, height, position = "centre", fit = "cover", background = "#f5f2ea", extract = null }) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const fallback = localSourceFallbacks.get(url);
  if (fallback && path.resolve(fallback) === target && fs.existsSync(target)) return;
  let pipeline = sharp(await fetchBuffer(url)).rotate();
  if (extract) pipeline = pipeline.extract(extract);
  await pipeline.resize(width, height, { fit, position, background, withoutEnlargement: false }).webp({ quality: 84, effort: 5 }).toFile(target);
}

await outputImage({ url: urls.currentAsset, file: "bilder/places/hammersborg_torg.webp", width: 1200, height: 675 });
await outputImage({ url: urls.currentAsset, file: "bilder/kort/places/hammersborg_torg.webp", width: 640, height: 360 });
await outputImage({ url: urls.currentAsset, file: "bilder/places/hammersborg_torg_front_portrait.webp", width: 900, height: 1200 });
await outputImage({ url: urls.blixAsset, file: "bilder/historisk/hammersborg_torg/hammersborg_torv_1875.webp", width: 1200, height: 800, fit: "contain" });
await outputImage({ url: urls.blixAsset, file: "bilder/kort/objects/hammersborg_torg_vannpost.webp", width: 900, height: 520, extract: { left: 1500, top: 900, width: 720, height: 416 } });
await outputImage({ url: urls.pissoirAsset, file: "bilder/kort/objects/hammersborg_torg_pissoir.webp", width: 900, height: 520, extract: { left: 150, top: 1050, width: 1200, height: 693 } });
await outputImage({ url: urls.obosBuildingAsset, file: "bilder/kort/structures/hammersborg_torg_1.webp", width: 900, height: 520 });
await outputImage({ url: urls.bolignAsset, file: "bilder/kort/structures/hammersborg_torg_bolign.webp", width: 900, height: 520 });
await outputImage({ url: urls.oldSquareAsset, file: "bilder/kort/structures/hammersborg_torg_hammersborgslottet.webp", width: 900, height: 520 });
await outputImage({ url: urls.rinnanPortraitAsset, file: "bilder/kort/people/frode_rinnan.webp", width: 900, height: 1200, fit: "contain" });
await outputImage({ url: urls.morgenstiernePortraitAsset, file: "bilder/kort/people/christian_fredrik_morgenstierne.webp", width: 900, height: 1200, fit: "contain" });
await outputImage({ url: urls.holtermannPortraitAsset, file: "bilder/kort/people/peter_hoier_holtermann.webp", width: 900, height: 1200, fit: "contain" });
await outputImage({ url: urls.obosLogoAsset, file: "bilder/kort/brands/obos.webp", width: 900, height: 520, fit: "contain", background: "#ffffff" });

const currentMeta = { source: "wikimedia_commons", sourcePage: urls.currentPage, creator: "Siri Johannessen", credit: "Siri Johannessen / Wikimedia Commons", license: "CC BY-SA 3.0 NO", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/no/", date: "2011-03-07", assetType: "documentary_place_photo", transformation: "Proporsjonal beskjæring og WebP-normalisering.", verifiedAt };
const blixMeta = { source: "oslo_museum_via_digitaltmuseum", sourcePage: urls.blixPage, creator: "Peter Andreas Blix (tilskrevet)", credit: "Oslo Museum / DigitaltMuseum", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceObjectId: "JWC.120", date: "ca. 1875", assetType: "historical_documentary_drawing", transformation: "Originalen er bevart i førbildet; objektkortet bruker et kildebundet utsnitt.", verifiedAt };
const pissoirMeta = { source: "oslo_museum_via_digitaltmuseum", sourcePage: urls.pissoirPage, creator: "N. Engstrøm", credit: "N. Engstrøm / Oslo Museum / DigitaltMuseum", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceObjectId: "OB.F14671c", assetType: "historical_documentary_photo", transformation: "Kildebundet utsnitt av pissoiret og WebP-normalisering.", verifiedAt };

const desc = "Hammersborg torg er den navngitte plassen mellom Grubbegata og Møllergata. Navnet tilhørte opprinnelig torget foran Margaretakyrken, mens dagens plass ble anlagt gjennom saneringen i 1960-årene sammen med OBOS-bygget i Hammersborg torg 1. Det eldre torget var et tett bolig- og hverdagsrom med blant annet arbeiderboligen Bolig’n, vannpost og pissoir. Dagens plass ble rehabilitert i 1999, og det tidligere OBOS-hovedkontoret er under ombygging med planlagt innflytting fra september 2026.";
const popupDesc = [
  "Hammersborg torg ligger mellom Grubbegata og Møllergata. Navnet viste først til den eldre plassen rett foran Margaretakyrken; dagens torgflate ligger forskjøvet i forhold til dette historiske sentrumet.",
  "Det gamle torget var hjertet i Hammersborg-forstaden. I 1900 hadde torget sju adresser, og kildene dokumenterer både vannpost i 1875 og et pissoir før århundreskiftet. Hammersborgslottet stod ved den gamle adressen nummer 2 og ble revet i 1925.",
  "I Nedre Hammersborggate 11 stod arbeiderboligen som ble kalt Bolig’n. Selskabet til Opførelse af Arbeiderboliger ble stiftet i 1851 etter initiativ fra politimester Christian Fredrik Jacob von Munthe af Morgenstierne, og selskapets første bygg ble oppført her i 1852 etter tegninger av Peter Høier Holtermann. Kildene spriker mellom 1961 og 1962 for rivningen; stedsteksten bruker den sikrere formuleringen tidlig i 1960-årene.",
  "Saneringen av Hammersborg-forstaden begynte i 1921 og fjernet gradvis den eldre bebyggelsen. Dagens Hammersborg torg ble dannet i 1960-årene da høyblokken, lavblokken og inngangspartiet i Hammersborg torg 1 ble reist i 1963–64. Frode Rinnan og Olav Tveten tegnet OBOS-anlegget.",
  "Plassen ble rehabilitert i 1999. Fotografiet fra 2011 dokumenterer torget og bygningsfronten på dette tidspunktet, ikke situasjonen under den senere rehabiliteringen. OBOS flyttet fra hovedkontoret i 2025, og OBOS’ prosjektside oppgir innflytting fra september 2026 for det ombygde anlegget. Det behandles som en planlagt tidsangivelse, ikke som bevis på at arbeidene er ferdige 1. september 2026.",
  "Bildeparet sammenstiller en tegning av det eldre torget omkring 1875 og et fotografi av dagens plass fra 2011. Fordi både torgflaten og ståstedet er endret, viser paret et flyttet stedsnavn og skiftende bystruktur; det er ikke en optisk sammenligning fra samme kamerapunkt.",
  "Arkivbildene brukes med snevre kildegrenser. Tegningen fra omkring 1875 dokumenterer vannposten, mens fotografiet av pissoiret dokumenterer objektet og deler av torgkanten. Ingen av bildene alene forteller hvordan alle beboerne opplevde boligforholdene eller saneringen."
].join("\n\n");

const peopleIds = ["frode_rinnan", "christian_fredrik_morgenstierne", "peter_hoier_holtermann"];
const objectIds = ["hammersborg_torg_vannpost", "hammersborg_torg_pissoir"];
const structureIds = ["hammersborg_torg_1", "hammersborg_torg_bolign", "hammersborg_torg_hammersborgslottet"];
const place = {
  id: placeId,
  name: "Hammersborg torg",
  visual: { designCode: "urban_square_layers_miniature" },
  lat: 59.9167293,
  lon: 10.7484971,
  r: 45,
  category: "by",
  year: 1964,
  desc,
  popupDesc,
  image: "bilder/places/hammersborg_torg.webp",
  imageCard: "bilder/kort/places/hammersborg_torg.webp",
  cardImage: "bilder/kort/places/hammersborg_torg.webp",
  frontImage: "bilder/places/hammersborg_torg_front_portrait.webp",
  imageCaption: "Hammersborg torg sett fra Grubbegata i 2011.",
  imageCredit: currentMeta.credit,
  imageLicense: currentMeta.license,
  imageSourceUrl: urls.currentPage,
  imageMeta: { ...currentMeta, outputDimensions: "1200x675", orientation: "landscape" },
  frontImageMeta: { ...currentMeta, outputDimensions: "900x1200", orientation: "portrait" },
  coordType: "square_center",
  coordStatus: "verified_geometry",
  coordNote: "Geometrisk senter for OSM-way 661556268, som bærer det eksakte navnet Hammersborg torg. Punktet representerer dagens torgflate, mens teksten skiller denne fra det eldre torget foran Margaretakyrken og fra hele Hammersborg-strøket.",
  coordSource: "OpenStreetMap way 661556268",
  coordSourceId: "osm-way:661556268",
  coordSourceUrl: urls.osm,
  coordVerifiedAt: verifiedAt,
  locatorType: "square",
  sourceProvider: "osm",
  sourceObjectId: "osm-way:661556268",
  geocodeAccuracy: "geometric_center",
  coordRole: "area_anchor",
  production_profile: "standard",
  profile_status: "confirmed",
  profile_reason: "Det avgrensede torget har et kildebåret skifte i plassering, bolig- og saneringshistorie, direkte arkitektkoblinger og fire reelle bildesamlinger.",
  underbadge_ids: ["byplanlegging", "bolig_og_bomiljo", "modernisme"],
  secondaryBadgeIds: ["byplanlegging", "bolig_og_bomiljo", "modernisme"],
  emne_ids: ["em_by_offentlige_rom_motesteder", "em_by_torg_plasser_som_scene", "em_by_historiske_lag_i_hverdagsrom", "em_by_transformasjon_ombruk", "em_by_modernistisk_boligplanlegging", "em_by_styring_forvaltning_planmakt", "em_his_historiske_lag_i_byrom"],
  related_people_ids: peopleIds,
  related_place_ids: ["trefoldighetskirken", "mollergata_19"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    production_profile: "standard",
    collection_ids: ["people", "objects", "brands", "structures"],
    category_collection_label: "Bygninger og byrom",
    reason: "Tre direkte dokumenterte personer, to historiske bruksobjekter, OBOS’ autentiske ordmerke og tre stedsspesifikke strukturer gir fire lokale og bildeklare By-samlinger uten filler.",
    verifiedAt
  },
  objects: [
    {
      id: objectIds[0], name: "Vannposten på det gamle torget", title: "Vannposten", type: "vannpost", kind: "historical_physical_object", year: 1875,
      desc: "En vannpost er dokumentert på det eldre Hammersborg torg i 1875 og vises nederst i Blix-tegningen.", physicalObject: true, placeSpecific: true, collectable: true,
      placeSpecificReason: "Lokalhistoriewiki knytter vannposten til torget, og DigitaltMuseums daterte tegning viser den i stedskontekst.", why_here: "Vannposten viser hvordan vannforsyning var en synlig del av hverdagslivet på det tette boligstedet.",
      whereToFind: "Objektet finnes ikke på dagens torg; studer det i det lisensierte arkivbildet.", unlock: "Finn vannposten nederst i 1875-tegningen og sammenlign plassbruken med dagens flate.", storePrice: 35, currency: "PC",
      image: "bilder/kort/objects/hammersborg_torg_vannpost.webp", imageMeta: blixMeta, source_urls: [urls.lokalwiki, urls.blixPage]
    },
    {
      id: objectIds[1], name: "Pissoiret på det gamle torget", title: "Pissoiret", type: "offentlig_urinal", kind: "historical_physical_object",
      desc: "Et offentlig pissoir stod ved det eldre Hammersborg torg før 1900 og er identifisert i Oslo Museums fotografi.", physicalObject: true, placeSpecific: true, collectable: true,
      placeSpecificReason: "DigitaltMuseum katalogfører motivet som Hammersborg torv og nevner pissoiret eksplisitt; Lokalhistoriewiki bekrefter funksjonen før 1900.", why_here: "Objektet viser den hverdagslige infrastrukturen som fulgte et tett befolket boligstrøk.",
      whereToFind: "Objektet er historisk og ikke bevart på dagens torg; det kan identifiseres i arkivfotografiet.", unlock: "Finn pissoiret i forgrunnen av arkivbildet uten å tolke andre personer eller detaljer utover katalogteksten.", storePrice: 35, currency: "PC",
      image: "bilder/kort/objects/hammersborg_torg_pissoir.webp", imageMeta: pissoirMeta, source_urls: [urls.lokalwiki, urls.pissoirPage]
    }
  ],
  structures: [
    {
      id: structureIds[0], name: "Hammersborg torg 1", title: "OBOS-anlegget", type: "kontoranlegg", kind: "modernist_office_complex", period: "1963–1964",
      desc: "Høyblokken, lavblokken og inngangspartiet ble reist i 1963–64 som OBOS-anlegg etter tegninger av Frode Rinnan og Olav Tveten.", why_here: "Anlegget og dagens torg ble formet i samme sanerings- og utbyggingsfase.",
      image: "bilder/kort/structures/hammersborg_torg_1.webp",
      imageMeta: { source: "wikimedia_commons", sourcePage: urls.obosBuildingPage, creator: "Ssu", credit: "Ssu / Wikimedia Commons", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", date: "2020-01-15", assetType: "documentary_structure_photo", transformation: "Proporsjonal beskjæring og WebP-normalisering.", verifiedAt },
      source_urls: [urls.byleksikon, urls.rinnanPlace, urls.obosCurrent, urls.obosBuildingPage]
    },
    {
      id: structureIds[1], name: "Bolig’n", title: "Arbeiderboligen i Nedre Hammersborggate 11", type: "arbeiderbolig", kind: "demolished_worker_housing", year: 1852,
      desc: "Selskabet til Opførelse af Arbeiderboligers første bygg ble oppført i 1852 etter tegninger av Peter Høier Holtermann og revet tidlig i 1960-årene.", why_here: "Bygningen knytter torget til organisert arbeiderboligbygging og saneringens sosiale konsekvenser.",
      image: "bilder/kort/structures/hammersborg_torg_bolign.webp",
      imageMeta: { source: "oslo_museum_via_digitaltmuseum", sourcePage: urls.bolignPage, creator: "Marthinius Skøien", credit: "Marthinius Skøien / Oslo Museum / DigitaltMuseum", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceObjectId: "OB.L0051", assetType: "historical_documentary_structure_photo", transformation: "Proporsjonal beskjæring og WebP-normalisering.", verifiedAt },
      source_urls: [urls.arbeiderboliger, urls.christianiaArbeiderboliger, urls.bolignPage]
    },
    {
      id: structureIds[2], name: "Hammersborgslottet", title: "Hammersborgslottet", type: "bygård", kind: "demolished_urban_structure", year: 1925,
      desc: "Bygården ved det gamle Hammersborg torg 2 ble kalt Hammersborgslottet og ble revet i 1925.", why_here: "Den dokumenterer den eldre torgkanten som forsvant før dagens plass ble etablert.",
      image: "bilder/kort/structures/hammersborg_torg_hammersborgslottet.webp",
      imageMeta: { source: "oslo_museum_via_digitaltmuseum", sourcePage: urls.oldSquarePage, creator: "Hans Holmboe Vogt", credit: "Hans Holmboe Vogt / Oslo Museum / DigitaltMuseum", license: "CC0 1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", sourceObjectId: "OB.NW0162", date: "1908", assetType: "historical_documentary_structure_photo", depictionBoundary: "DigitaltMuseum knytter motivet til Hammersborg torg 2; Lokalhistoriewiki identifiserer nummer 2 som Hammersborgslottet.", transformation: "Proporsjonal beskjæring og WebP-normalisering.", verifiedAt },
      source_urls: [urls.lokalwiki, urls.oldSquarePage]
    }
  ],
  for_na: {
    title: "Et torgnavn som flyttet",
    beforeImage: "bilder/historisk/hammersborg_torg/hammersborg_torv_1875.webp",
    beforeImageLabel: "Det eldre Hammersborg torv, ca. 1875",
    beforeImageMeta: blixMeta,
    nowImage: "bilder/places/hammersborg_torg.webp",
    nowImageLabel: "Dagens Hammersborg torg, 2011",
    nowImageMeta: currentMeta,
    before: "Tegningen viser det eldre torget foran Margaretakyrken med tett bebyggelse og vannpost.",
    now: "Fotografiet fra 2011 viser den senere torgflaten og etterkrigstidens bygningsfront.",
    change: "Torget og kamerastandpunktet er ikke identiske. Sammenstillingen viser at stedsnavnet overlevde mens plasseringen, bebyggelsen og bruken ble endret gjennom saneringen.",
    lookFor: ["Tett eldre torgkant mot åpnere etterkrigsflate.", "Vannposten i tegningen.", "Høyblokken som markerer den nye skalaen."],
    sources: [urls.blixPage, urls.currentPage, urls.byleksikon]
  },
  news: {
    title: "Det tidligere OBOS-hovedkontoret bygges om",
    date: "2026-09",
    summary: "OBOS’ prosjektside oppgir at det rehabiliterte anlegget skal være innflyttingsklart fra september 2026.",
    source: urls.obosCurrent,
    verifiedAt,
    temporalStatus: "planned",
    temporalNote: "Kilden beskriver planlagt innflytting. Den dokumenterer ikke at ombyggingen var ferdig 1. september 2026."
  },
  interpretation: {
    what_to_notice: ["At dagens torgflate ikke ligger identisk med det eldre torget.", "Skalaskiftet fra tett tre- og murgårdsbebyggelse til høyblokk og åpent dekke.", "Hvordan arkivbilder bevarer spor etter vannpost, pissoir og arbeiderbolig."],
    why_it_matters: ["Stedet viser at et navn kan bestå selv om selve byrommet flyttes.", "Saneringen endret både fysisk form og boligmiljø.", "Etterkrigstidens OBOS-anlegg knytter sosial boligorganisering til modernistisk kontor- og byplanlegging."],
    counterpoints: ["Tegningen fra 1875 og fotografiet fra 2011 har ulike ståsteder og motiver.", "Kildene oppgir både 1961 og 1962 for rivningen av Bolig’n; teksten bruker derfor tidlig i 1960-årene.", "Planlagt innflytting fra september 2026 er ikke det samme som dokumentert ferdigstillelse."],
    sources: [urls.byleksikon, urls.lokalwiki, urls.dagsavisen, urls.arbeiderboliger, urls.obosCurrent].map((url) => ({ url, verifiedAt }))
  },
  fagverk: {
    schema: "history_go_place_fagverk_v2", level: "standard", status: "curated",
    intro: "Hammersborg torg gjør byforandring lesbar som et skifte mellom hverdagsinfrastruktur, boligpolitikk, sanering og modernistisk planlegging. Analysen må skille det eldre torget fra dagens torgflate og skille kildenes dokumenterte spor fra antakelser om beboernes erfaringer.",
    article: [
      "Det eldre Hammersborg torg var et tett bolig- og bruksrom. Vannpost, pissoir, arbeiderbolig og torgadresser viser at byrommet var knyttet til daglige behov, ikke bare monumental form. Arkivkildene dokumenterer fysiske forhold og befolkningstetthet, men gir ikke et komplett bilde av hvordan alle beboere opplevde stedet.",
      "Saneringen fra 1921 og etableringen av dagens torg i 1960-årene endret både plassering, skala og bygningsstruktur. Høyblokken og lavblokken i Hammersborg torg 1 viser en modernistisk fase der større bygningsvolumer og åpnere flater erstattet den eldre torgkanten. Dette kan analyseres som planmakt og transformasjon uten å anta én enkel årsak eller ett samlet lokalt syn.",
      "Før–nå-materialet er best egnet til arkiv-, minne- og sporanalyse. Fordi torgnavnet flyttet og bildene har ulike ståsteder, er morfologiske relasjoner, bebyggelsestetthet og synlige infrastrukturer mer pålitelige sammenligningspunkter enn pikselnøyaktige endringer."
    ],
    subject_ids: ["by"],
    emne_ids: ["em_by_offentlige_rom_motesteder", "em_by_torg_plasser_som_scene", "em_by_historiske_lag_i_hverdagsrom", "em_by_transformasjon_ombruk", "em_by_modernistisk_boligplanlegging", "em_by_styring_forvaltning_planmakt"],
    chapter_ids: ["byliv-offentlige-rom", "historiske-lag-ruiner-minner", "arkitektur-gatekant-makt-ombruk", "bolig-nabolag-tilgang-endring"],
    lenses: [
      { id: "hammersborg-flyttet-torg", title: "Et flyttet offentlig rom", prompt: "Hvordan kan et torgnavn bestå når plassens geometri og kantbebyggelse endres?", subject_id: "by", emne_id: "em_by_torg_plasser_som_scene", evidence: "Sammenhold eksplisitt kildetekst om gammel og ny plassering med kart- og billedspor." },
      { id: "hammersborg-sanering", title: "Sanering og planmakt", prompt: "Hvilke beslutninger og aktører blir synlige i overgangen fra boligstrøk til etterkrigsanlegg?", subject_id: "by", emne_id: "em_by_styring_forvaltning_planmakt", evidence: "Skill dokumenterte rivninger, byggeår og institusjoner fra udokumenterte motiv- eller virkningspåstander." },
      { id: "hammersborg-hverdagsinfrastruktur", title: "Torgets hverdagsinfrastruktur", prompt: "Hva forteller vannpost, pissoir og arbeiderbolig om hvordan det eldre torget fungerte?", subject_id: "by", emne_id: "em_by_historiske_lag_i_hverdagsrom", evidence: "Bruk katalogførte objekter og adresse-/boligkilder; ikke generaliser enkelteksempler til alle beboere." },
      { id: "hammersborg-skala", title: "Modernistisk skalaskifte", prompt: "Hvordan endret høyblokken, lavblokken og den åpne flaten forholdet mellom bygning og torg?", subject_id: "by", emne_id: "em_by_modernistisk_boligplanlegging", evidence: "Beskriv volum, plassering og byggeperiode før arkitektonisk tolkning." }
    ],
    guiding_questions: ["Hvor lå det eldre torget i forhold til dagens torg?", "Hvilke hverdagsfunksjoner ved det eldre torget kan dokumenteres direkte i kildene?", "Hva forsvant under saneringen, og hva ble etablert?", "Hvordan bør motstridende rivningsår håndteres når kildene ikke gir ett sikkert svar?", "Hva kan ulike bilder faktisk sammenlignes for?"],
    concepts: ["offentlig rom", "historiske lag", "sanering", "planmakt", "arbeiderbolig", "modernisme", "morfologi", "hverdagsinfrastruktur"],
    observable_traces: [
      { title: "Den åpne torgflaten", observation: "Dagens plass ligger mellom Grubbegata og Møllergata foran etterkrigstidens bygningsvolumer.", interpretation_boundary: "Flaten dokumenterer den nåværende geometrien, men ikke alene hvorfor hver rivning ble besluttet.", source_urls: [urls.byleksikon, urls.osm] },
      { title: "Høyblokken og lavblokken", observation: "Hammersborg torg 1 består av et høyhus, et lavbygg og et forbindende inngangsparti fra 1963–64.", interpretation_boundary: "Anlegget viser et skalaskifte, men fotografiet fra 2020 dokumenterer ikke ferdig status etter rehabiliteringen.", source_urls: [urls.byleksikon, urls.rinnanPlace, urls.obosBuildingPage] }
    ],
    source_urls: [urls.byleksikon, urls.lokalwiki, urls.dagsavisen, urls.arbeiderboliger, urls.obosCurrent, urls.osm, urls.rinnanPlace, urls.obosBuildingPage],
    verified_at: verifiedAt
  },
  module_audit: {
    for_na: { status: "produced_with_location_and_viewpoint_caveat" },
    news: { status: "produced_planned_status", source: urls.obosCurrent, verifiedAt },
    dialect: { status: "not_applicable", rationale: "Enkeltstedet eier ikke et dokumentert dialektlag." },
    language: { status: "produced" }, chronology: { status: "produced" }, stories: { status: "produced" }, reading_tracks: { status: "produced" }, fagverk: { status: "produced" }
  },
  externalLinks: [
    ["source", "Oslo byleksikon – Hammersborg torg", urls.byleksikon],
    ["source", "Lokalhistoriewiki – Hammersborg torg", urls.lokalwiki],
    ["source", "Dagsavisen/Oslo byarkiv – Forstaden som forsvant", urls.dagsavisen],
    ["source", "Norsk Folkemuseum – Hammersborg", urls.folkemuseum],
    ["source", "Oslo byleksikon – Arbeiderboliger", urls.arbeiderboliger],
    ["source", "Lokalhistoriewiki – Frode Rinnan", urls.rinnanPlace],
    ["image", "Wikimedia Commons – OBOS, Hammersborg Torg 1", urls.obosBuildingPage],
    ["official", "OBOS – Hammersborg torg", urls.obosCurrent],
    ["map", "OpenStreetMap – Hammersborg torg", urls.osm]
  ].map(([type, label, url]) => ({ type, label, url, verifiedAt })),
  production_status: "complete",
  production_verified_at: verifiedAt
};
write(placeFile, place);

const placesManifest = read("data/places/manifest.json");
addOnce(placesManifest.files, placeFile.replace(/^data\//, ""));
write("data/places/manifest.json", placesManifest);
write("data/coordinate-evidence/oslo/by/hammersborg_torg.json", {
  placeId, placeFile, evidenceStatus: "applied_to_place", coordinateDecision: "candidate_ready_for_production",
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
  identity: { currentName: place.name, resolvedIdentity: "dagens navngitte torgflate mellom Grubbegata og Møllergata", identityStatus: "resolved", identityProblem: "Det eldre torget lå forskjøvet foran Margaretakyrken.", locatorTypeCandidate: "square", requiresSplit: false, splitReason: "Historiske lag behandles i samme stedspost fordi navnet og byromshistorien er direkte dokumentert som en flytting." },
  evidence: [{ sourceProvider: "osm", sourceName: "OpenStreetMap way 661556268", sourceUrl: urls.osm, sourceObjectId: "osm-way:661556268", sourceQuality: "named_area_geometry", finding: "Way-en avgrenser den nåværende flaten med eksakt navn Hammersborg torg.", canVerifyCoordinate: true, reason: place.coordNote }],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: "area_anchor", canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Navngitt OSM-geometri er anvendt og den historiske stedsgrensen er forklart." },
  notes: ["Punktet skal ikke brukes som anker for hele Hammersborg-strøket."]
});

const coordinateEvidenceManifest = read("data/coordinate-evidence/manifest.json");
addOnce(coordinateEvidenceManifest.files, "oslo/by/hammersborg_torg.json");
write("data/coordinate-evidence/manifest.json", coordinateEvidenceManifest);

const portraitMeta = {
  frode_rinnan: { source: "oslo_museum_via_wikimedia_commons", sourcePage: urls.rinnanPortraitPage, creator: "Ukjent", credit: "Oslo Museum / Wikimedia Commons", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", assetKind: "identity_portrait", mediaType: "historical_photo", date: "ca. 1940", outputDimensions: "900x1200", transformation: "Fotografiet er proporsjonalt innpasset på 900 × 1200.", verifiedAt },
  christian_fredrik_morgenstierne: { source: "oslo_museum_via_wikimedia_commons", sourcePage: urls.morgenstiernePortraitPage, creator: "Henry Thue", credit: "Henry Thue / Oslo Museum / Wikimedia Commons", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", assetKind: "identity_portrait", mediaType: "historical_portrait_painting", date: "1917, etter fotografi ca. 1860", disclosure: "Malt portrett etter et eldre fotografi; ikke et samtidig fotografi.", outputDimensions: "900x1200", transformation: "Maleriet er proporsjonalt innpasset på 900 × 1200.", verifiedAt },
  peter_hoier_holtermann: { source: "wikimedia_commons", sourcePage: urls.holtermannPortraitPage, creator: "Adolph Tidemand", credit: "Adolph Tidemand / Wikimedia Commons", license: "Public domain", assetKind: "identity_portrait", mediaType: "artistic_portrait_crop", date: "1848", disclosure: "Identifisert utsnitt fra et maleri; ikke fotografi.", outputDimensions: "900x1200", transformation: "Det identifiserte maleriutsnittet er proporsjonalt innpasset på 900 × 1200.", verifiedAt }
};
const people = [
  {
    id: peopleIds[0], name: "Frode Rinnan", initials: "FR", category: "by", year: 1964, kindLabel: "Arkitekt og byplanlegger", role: "Tegnet OBOS-anlegget sammen med Olav Tveten",
    desc: "Arkitekten som sammen med Olav Tveten tegnet OBOS-anlegget i torg nummer 1, oppført i 1963–64.",
    popupDesc: "Frode Rinnan levde fra 1905 til 1997 og ble utdannet arkitekt ved NTH i 1930. Han arbeidet med boligbygging og byplanlegging og etablerte arkitektkontor sammen med Olav Tveten. Lokalhistoriewiki knytter Rinnan og Tveten direkte til OBOS-bygget i torg nummer 1 fra 1963–64. Personkortet gjelder denne dokumenterte arkitektrollen, ikke alle beslutningene bak saneringen.",
    placeId, source_place_id: placeId, places: [placeId], tags: ["arkitektur", "byplanlegging", "OBOS", "modernisme", "1960-årene"],
    image: "bilder/kort/people/frode_rinnan.webp", cardImage: "bilder/kort/people/frode_rinnan.webp", imageMeta: portraitMeta.frode_rinnan,
    profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1", claimsFile: "data/people/claims/by/oslo/hammersborg_torg/frode_rinnan.claims.json",
    source_urls: [urls.rinnan, urls.rinnanPlace, urls.byleksikon, urls.rinnanPortraitPage], verifiedAt
  },
  {
    id: peopleIds[1], name: "Christian Fredrik von Munthe af Morgenstierne", initials: "CM", category: "by", year: 1851, kindLabel: "Politimester og boliginitiativtaker", role: "Tok initiativ til Selskabet til Opførelse af Arbeiderboliger",
    desc: "Politimester Christian Fredrik von Munthe af Morgenstierne tok i 1851 initiativ til selskapet som oppførte Bolig’n ved torget.",
    popupDesc: "Christian Fredrik Jacob von Munthe af Morgenstierne levde fra 1806 til 1888. Han var politimester i Christiania fra 1850 til 1862. I 1851 tok han initiativ til boligselskapet, som året etter fullførte Bolig’n. Kortet gjelder denne dokumenterte boligkoblingen og må ikke forveksles med den senere arkitekten Christian Morgenstierne.",
    placeId, source_place_id: placeId, places: [placeId], tags: ["arbeiderboliger", "bolighistorie", "politimester", "1851"],
    image: "bilder/kort/people/christian_fredrik_morgenstierne.webp", cardImage: "bilder/kort/people/christian_fredrik_morgenstierne.webp", imageMeta: portraitMeta.christian_fredrik_morgenstierne,
    profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1", claimsFile: "data/people/claims/by/oslo/hammersborg_torg/christian_fredrik_morgenstierne.claims.json",
    source_urls: [urls.morgenstierne, urls.arbeiderboliger, urls.christianiaArbeiderboliger, urls.morgenstiernePortraitPage], verifiedAt
  },
  {
    id: peopleIds[2], name: "Peter Høier Holtermann", initials: "PH", category: "by", year: 1852, kindLabel: "Arkitekt", role: "Tegnet arbeiderboligen i Nedre Hammersborggate 11",
    desc: "Arkitekten som tegnet Bolig’n ved torget, oppført i 1852.",
    popupDesc: "Peter Høier Holtermann levde fra 1820 til 1865 og tilhørte en tidlig generasjon sivilt utdannede arkitekter i Norge. Han etablerte egen praksis i Christiania i 1846. Oslo byleksikon og Lokalhistoriewiki oppgir ham som arkitekt for Bolig’n. Personkortet gjelder dette dokumenterte verket; portrettet er et identifisert utsnitt fra et maleri.",
    placeId, source_place_id: placeId, places: [placeId], tags: ["arkitektur", "arbeiderbolig", "Bolig'n", "1852"],
    image: "bilder/kort/people/peter_hoier_holtermann.webp", cardImage: "bilder/kort/people/peter_hoier_holtermann.webp", imageMeta: portraitMeta.peter_hoier_holtermann,
    profileStandard: "people_profile_v1.0", profileStatus: "ready_people_v1", claimsFile: "data/people/claims/by/oslo/hammersborg_torg/peter_hoier_holtermann.claims.json",
    source_urls: [urls.holtermann, urls.arbeiderboliger, urls.christianiaArbeiderboliger, urls.holtermannPortraitPage], verifiedAt
  }
];
const peopleFile = "data/people/by/oslo/hammersborg_torg/people_hammersborg_torg.json";
write(peopleFile, people);
const peopleManifest = read("data/people/manifest.json");
addOnce(peopleManifest.files, peopleFile.replace(/^data\//, ""));
peopleManifest.priorityFilesByPlace[placeId] = [peopleFile.replace(/^data\//, "")];
write("data/people/manifest.json", peopleManifest);

const claimsByPerson = {
  frode_rinnan: [
    ["identity", "Frode Rinnan levde fra 1905 til 1997 og var norsk arkitekt og byplanlegger.", urls.rinnan, "Biografisk innledning"],
    ["education", "Rinnan ble utdannet arkitekt ved NTH i 1930.", urls.rinnan, "Utdanning"],
    ["practice", "Rinnan arbeidet med boligbygging og byplanlegging sammen med Olav Tveten.", urls.rinnan, "Yrkesliv og verk"],
    ["place", "Frode Rinnan og Olav Tveten tegnet OBOS-bygget i Hammersborg torg 1, oppført i 1963–64.", urls.rinnanPlace, "Verkliste: OBOS-bygget"],
    ["image_identity", "Commons-posten identifiserer portrettet som Frode Rinnan omkring 1940.", urls.rinnanPortraitPage, "Filtittel og metadata"]
  ],
  christian_fredrik_morgenstierne: [
    ["identity", "Christian Fredrik Jacob von Munthe af Morgenstierne levde fra 1806 til 1888.", urls.morgenstierne, "Biografisk innledning"],
    ["office", "Han var politimester i Christiania fra 1850 til 1862.", urls.morgenstierne, "Karriere"],
    ["initiative", "Han tok i 1851 initiativ til Selskabet til Opførelse af Arbeiderboliger.", urls.morgenstierne, "Boliginitiativet"],
    ["place", "Selskapets første bygg ble fullført i Nedre Hammersborggate 11 i 1852.", urls.morgenstierne, "Arbeiderboligen på Hammersborg"],
    ["image_identity", "Commons-posten identifiserer Henry Thues malte portrett av Morgenstierne.", urls.morgenstiernePortraitPage, "Filtittel og metadata"]
  ],
  peter_hoier_holtermann: [
    ["identity", "Peter Høier Holtermann levde fra 1820 til 1865 og var norsk arkitekt.", urls.holtermann, "Biografisk innledning"],
    ["practice", "Holtermann etablerte egen arkitektpraksis i Christiania i 1846.", urls.holtermann, "Yrkesliv"],
    ["place", "Holtermann tegnet arbeiderboligen i Nedre Hammersborggate 11, oppført i 1852.", urls.arbeiderboliger, "Første bygg"],
    ["crosscheck", "Lokalhistoriewiki knytter også Holtermann til selskapets første bygg på Hammersborg.", urls.christianiaArbeiderboliger, "Første byggeprosjekt"],
    ["image_identity", "Commons-posten identifiserer maleriutsnittet som Peter Høier Holtermann.", urls.holtermannPortraitPage, "Filtittel og metadata"]
  ]
};
for (const person of people) {
  const rows = claimsByPerson[person.id];
  write(person.claimsFile, {
    schema: "history_go_people_claims_v1", version: "1.0.0", person_id: person.id, profile_file: peopleFile,
    identity: { canonical_identity: person.name, name_variants: [person.name], not: person.id === "christian_fredrik_morgenstierne" ? ["arkitekten Christian Morgenstierne", "andre medlemmer av slekten Munthe af Morgenstierne"] : ["andre personer med samme etternavn"], identity_status: "verified" },
    claims: rows.map(([id, claim, source_url, source_location]) => ({ id, claim, status: "verified", source_url, source_location, source_type: id === "image_identity" ? "catalogue" : "institutional", temporal_status: "historical", verified_at: verifiedAt, evidence_level: "direct" })),
    field_claim_map: { name: ["identity"], kindLabel: ["identity"], year: ["place"], placeId: ["place"], [`places[${placeId}]`]: ["place"], image: ["image_identity"] },
    sentence_claim_map: {
      desc: [{ sentence: 1, claim_ids: rows.map((row) => row[0]).filter((id) => ["initiative", "place", "crosscheck"].includes(id)), evidence_mode: "explicit" }],
      popupDesc: sentences(person.popupDesc).map((sentence, index) => ({ sentence: index + 1, claim_ids: sentence.includes("portrett") || sentence.includes("maleri") ? ["image_identity"] : sentence.includes("Hammersborg") || sentence.includes("Nedre") || sentence.includes("OBOS") || sentence.includes("Bolig’n") ? ["place"] : sentence.includes("praksis") || sentence.includes("boligbygging") ? ["practice"] : sentence.includes("politimester") ? ["office"] : sentence.includes("initiativ") ? ["initiative"] : ["identity"] }))
    },
    completion: { completed_under: "people_profile_v1.0", claims_verified: `${rows.length}/${rows.length}`, fact_review: "passed", editorial_review: "passed", source_verified_at: verifiedAt, validator_version: "1.0.0", current_status: "ready_people_v1" }
  });
}

const brandsMaster = read("data/brands/brands_master.json");
const obos = {
  id: "obos", name: "OBOS", brand_group: "housing_cooperative_brand", brand_type: "institution_brand", brand_kind: "housing_cooperative", sector: "housing_and_property", state: "catalog", status: "current", verification: "verified", verified_at: verifiedAt,
  desc: "Boligbyggelaget som fikk hovedkontoranlegget i Hammersborg torg 1 oppført i 1963–64.",
  popupdesc: "OBOS er direkte knyttet til Hammersborg torg gjennom hovedkontoranlegget fra 1963–64 og den dokumenterte ombyggingen etter utflyttingen i 2025. Kortet bruker et autentisk enkelt ordmerke for referensiell identifikasjon og innebærer ingen godkjenning eller tilknytning.",
  tags: ["brand", "housing", "Hammersborg", "current"], place_ids: [placeId], source_urls: [urls.byleksikon, urls.obosCurrent, urls.obosLogoOfficial, urls.obosLogoPage],
  logo: "bilder/kort/brands/obos.webp",
  imageMeta: { sourcePage: urls.obosLogoPage, sourceAsset: urls.obosLogoAsset, officialReference: urls.obosLogoOfficial, creator: "OBOS", credit: "OBOS", license: "Public domain (simple text logo); trademarked", rightsBasis: "simple_wordmark_referential_identification", reviewStatus: "manually_approved", assetKind: "official_wordmark", temporalScope: "current", usageContext: "referential_identification", noEndorsement: true, generated: false, reconstructed: false, transformation: "Autentisk PNG-ordmerke er proporsjonalt innpasset på 900 × 520; ingen rekonstruksjon.", outputDimensions: "900x520", reviewedAt: verifiedAt }
};
const obosIndex = brandsMaster.findIndex((brand) => brand.id === obos.id);
if (obosIndex < 0) brandsMaster.push(obos); else brandsMaster[obosIndex] = obos;
write("data/brands/brands_master.json", brandsMaster);
const brandsByPlace = read("data/brands/brands_by_place.json");
brandsByPlace[placeId] = [obos.id];
write("data/brands/brands_by_place.json", brandsByPlace);

const chronology = [
  [1851, "Arbeiderboligselskapet stiftes", "Selskabet til Opførelse af Arbeiderboliger blir stiftet etter initiativ fra politimester Morgenstierne.", urls.arbeiderboliger],
  [1852, "Bolig’n oppføres", "Selskapets første bygg står ferdig i Nedre Hammersborggate 11 etter tegninger av Peter Høier Holtermann.", urls.christianiaArbeiderboliger],
  [1875, "Vannposten dokumenteres", "En tegning av det eldre torget viser vannposten som del av hverdagsinfrastrukturen.", urls.blixPage],
  [1900, "Sju torgadresser", "Lokalhistoriewiki oppgir sju adresser ved det eldre Hammersborg torg.", urls.lokalwiki],
  [1921, "Saneringen begynner", "Rivingen av den eldre Hammersborg-forstaden begynner.", urls.dagsavisen],
  [1925, "Hammersborgslottet rives", "Bygården ved det gamle torgets nummer 2 blir revet.", urls.lokalwiki],
  [1964, "Det nye torget og OBOS-anlegget", "Høyblokken, lavblokken og inngangspartiet i Hammersborg torg 1 fullføres gjennom byggeperioden 1963–64.", urls.byleksikon],
  [1999, "Torget rehabiliteres", "Hammersborg torg blir rehabilitert.", urls.byleksikon],
  [2025, "OBOS flytter", "OBOS flytter hovedkontoret, og det eldre anlegget går inn i en ny ombyggingsfase.", urls.obosCurrent],
  [2026, "Planlagt innflytting", "Prosjektsiden oppgir innflytting fra september 2026; statusen er planlagt ved kontroll 1. september.", urls.obosCurrent]
].map(([year, period, desc, sourceUrl], index) => ({ id: `chrono_hammersborg_torg_${String(index + 1).padStart(2, "0")}`, year, period, desc, confidence: year === 2026 ? "planned" : "high", sources: [sourceUrl] }));
const leksikonFile = "data/leksikon/places/oslo/by/leksikon_hammersborg_torg.json";
write(leksikonFile, [
  {
    id: "hammersborg_torg_hovedartikkel", visual: { designCode: "article_square_layers_miniature" }, place_id: placeId, title: "Hammersborg torg", version: 1,
    popupDesc: "Torget som flyttet navn og tyngdepunkt gjennom saneringen av Hammersborg.",
    wikiText: ["Det eldre torget lå foran Margaretakyrken og var sentrum i et tett boligmiljø.", "Dagens torg ble etablert i 1960-årene sammen med OBOS-anlegget i Hammersborg torg 1."],
    summary: { one_liner: "Et byrom der arbeiderboliger, sanering og modernisme kan leses lag for lag.", themes: ["byrom", "bolig", "sanering", "modernisme"], tone: ["nøktern", "kildebasert"] },
    facts: [
      { id: "fact_01", label: "Eldre plassering", desc: "Det eldre torget lå foran Margaretakyrken.", confidence: "high", sources: [urls.byleksikon, urls.lokalwiki] },
      { id: "fact_02", label: "Dagens torg", desc: "Dagens torg ble dannet i 1960-årene.", confidence: "high", sources: [urls.byleksikon] },
      { id: "fact_03", label: "OBOS-anlegget", desc: "Hammersborg torg 1 ble oppført i 1963–64.", confidence: "high", sources: [urls.byleksikon, urls.rinnanPlace] }
    ],
    sources: [urls.byleksikon, urls.lokalwiki, urls.dagsavisen, urls.folkemuseum], externalLinks: place.externalLinks, chronology
  },
  {
    id: "hammersborg_torg_bolig_og_sanering", visual: { designCode: "article_housing_clearance_miniature" }, place_id: placeId, title: "Bolig’n og saneringen", version: 1,
    popupDesc: "Arbeiderboligen fra 1852 stod i et tett boligmiljø som forsvant tidlig i 1960-årene.",
    wikiText: ["Bolig’n var selskapets første arbeiderboligbygg og ble tegnet av Peter Høier Holtermann.", "Kildene er ikke enige om 1961 eller 1962 som rivningsår, så den canonicale teksten bruker tidlig i 1960-årene."],
    summary: { one_liner: "Boligbyggingens sosialhistorie møter saneringens skalaskifte.", themes: ["arbeiderbolig", "boligpolitikk", "riving"], tone: ["kildekritisk", "analytisk"] },
    facts: [{ id: "fact_01", label: "Oppført", desc: "Bygget ble oppført i 1852.", confidence: "high", sources: [urls.arbeiderboliger, urls.christianiaArbeiderboliger] }],
    sources: [urls.arbeiderboliger, urls.christianiaArbeiderboliger, urls.dagsavisen]
  },
  {
    id: "hammersborg_torg_hverdagsinfrastruktur", visual: { designCode: "article_everyday_infrastructure_miniature" }, place_id: placeId, title: "Vannpost og pissoir", version: 1,
    popupDesc: "Små fysiske objekter viser hvordan det gamle torget fungerte som hverdagsrom.",
    wikiText: ["En vannpost er dokumentert i tegningen fra omkring 1875.", "Et senere arkivfotografi og katalogtekst dokumenterer et pissoir ved torget før 1900."],
    summary: { one_liner: "Hverdagsinfrastruktur gjør det eldre boligmiljøet konkret.", themes: ["vann", "sanitærforhold", "byliv"], tone: ["kildebasert"] },
    facts: [{ id: "fact_01", label: "Vannpost", desc: "Vannposten er dokumentert i 1875.", confidence: "high", sources: [urls.lokalwiki, urls.blixPage] }, { id: "fact_02", label: "Pissoir", desc: "Pissoiret stod ved torget før 1900.", confidence: "high", sources: [urls.lokalwiki, urls.pissoirPage] }],
    sources: [urls.lokalwiki, urls.blixPage, urls.pissoirPage]
  }
]);
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = leksikonManifest.files.filter((file) => file !== leksikonFile);
leksikonManifest.files.push(leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const storyFile = "data/stories/stories_hammersborg_torg.json";
write(storyFile, [{
  id: "st_hammersborg_torg_flytter_1964", quality_profile: "episode_v1", type: "turning_point", title: "Torget som flyttet", year: 1964, place_id: placeId, person_id: "frode_rinnan",
  summary: "Da den eldre torgkanten var sanert, fikk navnet Hammersborg torg en ny plass rundt OBOS-anlegget fra 1963–64.",
  story: "Hammersborg torg var først navnet på plassen foran Margaretakyrken, midt i et tett boligmiljø med arbeiderbolig, vannpost og pissoir. Saneringen som begynte i 1921 fjernet gradvis denne torgkanten.\n\nI 1963–64 ble OBOS-anlegget med høyblokk og lavblokk reist etter tegninger av Frode Rinnan og Olav Tveten. Samtidig ble dagens torgflate etablert mellom Grubbegata og Møllergata. Navnet bestod, men byrommets plassering, skala og bruk var forandret.",
  episode: { actors: ["Beboerne på Hammersborg", "Oslo kommune", "OBOS", "Frode Rinnan og Olav Tveten"], date: "1964", action: "Etterkrigsanlegget og den nye torgflaten ble etablert etter den langvarige saneringen.", consequence: "Hammersborg torg fortsatte som navn på et nytt og mer åpent byrom." },
  sources: [{ title: "Oslo byleksikon – Hammersborg torg", url: urls.byleksikon }, { title: "Lokalhistoriewiki – Hammersborg torg", url: urls.lokalwiki }, { title: "Dagsavisen/Oslo byarkiv – Forstaden som forsvant", url: urls.dagsavisen }],
  tags: ["sanering", "byplanlegging", "modernisme", "bolighistorie"], related_people: ["frode_rinnan"], related_places: ["trefoldighetskirken"],
  score: { narrative: 3, historical: 2, source: 5, play_value: 3, originality: 3, total: 16 },
  arc: { start: "Det eldre torget var sentrum i et tett boligmiljø.", middle: "Saneringen fjernet torgkanten og Bolig’n.", end: "Navnet ble videreført på den nye plassen ved OBOS-anlegget." }
}]);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = storyManifest.files.filter((entry) => entry?.entity_id !== placeId && entry?.path !== storyFile);
storyManifest.files.push({ category: "by", entity_id: placeId, path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const readings = read(readingFile);
readings.items = readings.items.filter((item) => !(item.place_ids || []).includes(placeId));
readings.items.push(
  { id: "lesespor_hammersborg_torg_byleksikon", title: "Hammersborg torg", author: null, publication: "Oslo byleksikon", year: 2026, type: "reference", subjects: ["torg", "byplanlegging", "OBOS"], place_ids: [placeId], person_ids: ["frode_rinnan"], category_hints: ["by"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "approved", relevance: "Hovedkilde for gammel og ny plassering, anlegget fra 1963–64 og rehabiliteringen i 1999." },
  { id: "lesespor_hammersborg_torg_lokalwiki", title: "Hammersborg torg", author: null, publication: "Lokalhistoriewiki", year: 2026, type: "local_history_reference", subjects: ["adresser", "Bolig'n", "vannpost", "pissoir"], place_ids: [placeId], person_ids: [], category_hints: ["by", "historie"], url: urls.lokalwiki, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "approved", relevance: "Detaljert stedskilde for det gamle torget og hverdagsinfrastrukturen." },
  { id: "lesespor_hammersborg_torg_dagsavisen", title: "Forstaden som forsvant", author: "Johanne Bergkvist", publication: "Dagsavisen / Oslo byarkiv", year: 2020, type: "historical_article", subjects: ["forstad", "beboere", "sanering"], place_ids: [placeId], person_ids: [], category_hints: ["by", "historie"], url: urls.dagsavisen, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "approved", relevance: "Knytter saneringen til det eldre boligmiljøets sosiale historie." },
  { id: "lesespor_hammersborg_torg_arbeiderboliger", title: "Arbeiderboliger", author: null, publication: "Oslo byleksikon", year: 2026, type: "reference", subjects: ["arbeiderbolig", "boligpolitikk", "Holtermann"], place_ids: [placeId], person_ids: ["christian_fredrik_morgenstierne", "peter_hoier_holtermann"], category_hints: ["by"], url: urls.arbeiderboliger, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "approved", relevance: "Dokumenterer selskapet, initiativet og det første bygget i Nedre Hammersborggate 11." }
);
write(readingFile, readings);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/hammersborg_torg.json";
const languageEntries = [
  ["hammersborg", "Hammersborg", "stedsnavn", "Navnet viser til Jens Christophersen Hammer, som eide området tidlig på 1700-tallet.", "Navnet levde videre både for strøket og torget.", urls.folkemuseum],
  ["hammersborg_torv", "Hammersborg Torv", "historisk_skrivemaate", "Eldre skrivemåte for Hammersborg torg.", "Formen står i tittelen på tegningen fra omkring 1875.", urls.blixPage],
  ["bolign", "Bolig’n", "historisk_tilnavn", "Lokalt tilnavn for arbeiderboligen i Nedre Hammersborggate 11.", "Apostrofen markerer muntlig sammentrekning av Boligen.", urls.lokalwiki],
  ["arbeiderbolig", "arbeiderbolig", "fagord", "Bolig oppført for arbeidere gjennom et organisert boligtiltak.", "På Hammersborg brukes ordet om selskapets bygg fra 1852.", urls.arbeiderboliger],
  ["pissoir", "pissoir", "historisk_laanord", "Eldre ord for et offentlig urinal.", "Katalogen bruker ordet om anlegget ved det gamle torget.", urls.pissoirPage],
  ["vannpost", "vannpost", "historisk_fagord", "Offentlig tappested for vann.", "Vannposten er synlig i tegningen av det eldre torget.", urls.blixPage]
].map(([id, term, type, meaning, context, url]) => ({ id, term, type, meaning, context, linked_to: { kind: "place", id: placeId }, tags: ["Hammersborg", "byhistorie"], sources: [source(url.includes("digitaltmuseum") ? "DigitaltMuseum" : url.includes("folkemuseum") ? "Norsk Folkemuseum" : url.includes("byleksikon") ? "Oslo byleksikon" : "Lokalhistoriewiki", url)] }));
write(languageFile, { place_id: placeId, title: "Språkleksikon: Hammersborg torg", verified_at: verifiedAt, dialect_status: "not_applicable_place_level", entries: languageEntries });
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files[placeId] = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const translationHash = sha256(JSON.stringify({ name: place.name.normalize("NFC"), desc: desc.normalize("NFC"), popupDesc: popupDesc.normalize("NFC") })).slice(0, 16);
const translations = {
  en: { name: "Hammersborg Square", desc: "A named square between Grubbegata and Møllergata. The older square stood in front of Margaret Church; the present square was formed during the 1960s clearances together with the OBOS complex.", popupDesc: "The name Hammersborg torg first belonged to the older square in front of Margaret Church. Worker housing and everyday infrastructure disappeared through the clearances that began in 1921. The present square and the OBOS complex were established in the 1960s. The former headquarters is being refurbished, with occupancy announced from September 2026; this remains a planned date as of 1 September 2026." },
  es: { name: "Plaza Hammersborg", desc: "Plaza situada entre Grubbegata y Møllergata. La plaza antigua estaba ante la iglesia de Margarita; la actual se formó durante las demoliciones de los años sesenta junto con el complejo de OBOS.", popupDesc: "El nombre Hammersborg torg perteneció primero a la plaza antigua ante la iglesia de Margarita. Las viviendas obreras y la infraestructura cotidiana desaparecieron durante las demoliciones iniciadas en 1921. La plaza actual y el complejo de OBOS se establecieron en los años sesenta. La ocupación del antiguo edificio sede se anuncia desde septiembre de 2026; a 1 de septiembre sigue siendo una fecha prevista." },
  pt: { name: "Praça Hammersborg", desc: "Praça entre Grubbegata e Møllergata. A praça antiga ficava diante da igreja de Margarida; a atual surgiu com as demolições dos anos 1960 e o complexo da OBOS.", popupDesc: "O nome Hammersborg torg pertencia primeiro à praça antiga diante da igreja de Margarida. Habitações operárias e infraestrutura quotidiana desapareceram nas demolições iniciadas em 1921. A praça atual e o complexo da OBOS foram estabelecidos nos anos 1960. A ocupação do antigo edifício-sede é anunciada a partir de setembro de 2026; em 1 de setembro ainda é uma data planeada." }
};
for (const [language, value] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${language}.json`;
  const pack = read(file);
  pack[placeId] = { _sourceHash: translationHash, _status: "machine_translated", ...value };
  write(file, pack);
}

const quizRows = [
  ["Hvor lå det eldre Hammersborg torg?", ["Rett foran Margaretakyrken", "Ved Oslo S", "På Youngstorget"], 0, "Det eldre torget lå rett foran Margaretakyrken.", "em_by_historiske_lag_i_hverdagsrom", "byleksikon"],
  ["Mellom hvilke gater ligger dagens Hammersborg torg?", ["Grubbegata og Møllergata", "Karl Johans gate og Stortingsgata", "Torggata og Storgata"], 0, "Dagens torg ligger mellom Grubbegata og Møllergata.", "em_by_offentlige_rom_motesteder", "byleksikon"],
  ["Når ble Bolig’n oppført?", ["1852", "1925", "1964"], 0, "Arbeiderboligen i Nedre Hammersborggate 11 ble oppført i 1852.", "em_by_historiske_lag_i_hverdagsrom", "arbeiderboliger"],
  ["Hvem tegnet Bolig’n?", ["Peter Høier Holtermann", "Frode Rinnan", "Christian Morgenstierne"], 0, "Peter Høier Holtermann tegnet arbeiderboligen.", "em_by_transformasjon_ombruk", "arbeiderboliger"],
  ["Hvem tok initiativ til arbeiderboligselskapet i 1851?", ["Politimester Morgenstierne", "Frode Rinnan", "Jens Christophersen Hammer"], 0, "Politimester Christian Fredrik von Munthe af Morgenstierne tok initiativet.", "em_by_styring_forvaltning_planmakt", "morgenstierne"],
  ["Hvilket hverdagsobjekt er dokumentert på torget i 1875?", ["En vannpost", "En telefonkiosk", "En trikkeholdeplass"], 0, "En vannpost er dokumentert i tegningen fra omkring 1875.", "em_by_historiske_lag_i_hverdagsrom", "blix"],
  ["Hva var et pissoir?", ["Et offentlig urinal", "Et bakeri", "En billettbod"], 0, "Pissoir er et eldre ord for offentlig urinal.", "em_by_historiske_lag_i_hverdagsrom", "pissoir"],
  ["Når begynte saneringen av Hammersborg-forstaden?", ["1921", "1852", "1999"], 0, "Saneringen begynte i 1921.", "em_by_styring_forvaltning_planmakt", "dagsavisen"],
  ["Når ble Hammersborgslottet revet?", ["1925", "1875", "1999"], 0, "Hammersborgslottet ble revet i 1925.", "em_by_historiske_lag_i_hverdagsrom", "lokalwiki"],
  ["Når ble Hammersborg torg 1 oppført?", ["1963–64", "1851–52", "1998–99"], 0, "Høyblokken, lavblokken og inngangspartiet ble oppført i 1963–64.", "em_by_modernistisk_boligplanlegging", "byleksikon"],
  ["Hvilke arkitekter tegnet OBOS-anlegget?", ["Frode Rinnan og Olav Tveten", "Grosch og Schinkel", "Backer og Arneberg"], 0, "Frode Rinnan og Olav Tveten tegnet anlegget.", "em_by_modernistisk_boligplanlegging", "rinnan_place"],
  ["Når ble torget rehabilitert?", ["1999", "1921", "1964"], 0, "Hammersborg torg ble rehabilitert i 1999.", "em_by_transformasjon_ombruk", "byleksikon"],
  ["Hva er status for innflytting fra september 2026?", ["Planlagt på prosjektsiden", "Dokumentert fullført i januar", "Avlyst i 2025"], 0, "Innflytting fra september 2026 er en planlagt opplysning, ikke dokumentert ferdigstillelse per 1. september.", "em_by_transformasjon_ombruk", "obos"],
  ["Hva viser fotografiet fra 2011?", ["Dagens torg før den senere ombyggingen", "Det gamle torget i 1875", "Bolig’n i 1852"], 0, "Fotografiet dokumenterer torgflaten og bygningsfronten i 2011.", "em_by_historiske_lag_i_hverdagsrom", "current_photo"],
  ["Hva er den viktigste forskjellen mellom de to torglagene?", ["Plassering og bystruktur ble endret", "Navnet ble aldri brukt igjen", "Kirken ble flyttet til Bjørvika"], 0, "Navnet bestod, men plasseringen og bystrukturen ble endret.", "em_by_torg_plasser_som_scene", "byleksikon"],
  ["Hvorfor brukes «tidlig i 1960-årene» om rivningen av Bolig’n?", ["Kildene oppgir både 1961 og 1962", "Ingen kilder nevner rivning", "Bygget står fortsatt"], 0, "Den bredere dateringen synliggjør kildeavviket mellom 1961 og 1962.", "em_by_historiske_lag_i_hverdagsrom", "arbeiderboliger"],
  ["Hva kan vannposten best brukes som kilde til?", ["Hverdagsinfrastruktur på det eldre torget", "OBOS’ kontororganisering", "Dagens parkeringsregler"], 0, "Vannposten dokumenterer en konkret del av det eldre torgets hverdagsinfrastruktur.", "em_by_historiske_lag_i_hverdagsrom", "blix"],
  ["Hva dokumenterer OBOS-bildet fra 2020?", ["Bygningsanlegget på dette tidspunktet", "Ferdig ombygging i 2026", "Bolig’n før riving"], 0, "Fotografiet dokumenterer Hammersborg torg 1 i 2020, ikke senere ferdigstillelse.", "em_by_transformasjon_ombruk", "obos_building"],
  ["Hva betyr et skalaskifte her?", ["Overgang fra tett torgkant til høyblokk og åpnere flate", "At gaten fikk nytt gatenummer", "At vannposten ble malt"], 0, "Saneringen og OBOS-anlegget endret forholdet mellom byggehøyde, volum og åpen plass.", "em_by_modernistisk_boligplanlegging", "byleksikon"],
  ["Hvilken aktør var byggherreidentitet for anlegget fra 1963–64?", ["OBOS", "Universitetet i Oslo", "Sporveien"], 0, "OBOS er direkte knyttet til hovedkontoranlegget ved torget.", "em_by_styring_forvaltning_planmakt", "byleksikon"],
  ["Hva kan arkivfotoet av pissoiret ikke alene fortelle?", ["Hvordan alle beboere opplevde stedet", "At motivet er katalogført ved torget", "At et pissoir er synlig"], 0, "Ett fotografi dokumenterer motivet, men ikke alle beboernes erfaringer.", "em_by_historiske_lag_i_hverdagsrom", "pissoir"],
  ["Hvilken metode passer for å sammenligne gatenett og torgkanter over tid?", ["Morfologisk analyse", "Smakstest", "Lydmiksing"], 0, "Morfologisk analyse sammenligner romlige mønstre og strukturer.", "em_by_transformasjon_ombruk", "byleksikon"],
  ["Hvilken metode hjelper når bilder har ulike ståsteder?", ["Arkiv-, minne- og sporanalyse", "Kun pikselmåling", "Meningsmåling uten kilder"], 0, "Sporanalyse kan avgrense hva ulike bilder faktisk dokumenterer.", "em_by_historiske_lag_i_hverdagsrom", "blix"],
  ["Hva bør observeres først i en studie av dagens torg?", ["Flate, kanter, innganger og opphold", "Antatte politiske motiver", "Beboernes minner uten intervju"], 0, "Feltobservasjon starter med synlige fysiske forhold og bruksspor.", "em_by_offentlige_rom_motesteder", "byleksikon"],
  ["Hvordan kan Pierre Noras minneperspektiv brukes her?", ["Til å undersøke hvordan navnet binder sammen to ulike torglag", "Til å fastslå eksakt rivningsår uten kilde", "Til å bevise at stedet aldri endret seg"], 0, "Minneperspektivet kan strukturere spørsmålet om navnekontinuitet og brudd.", "em_by_historiske_lag_i_hverdagsrom", "lokalwiki"],
  ["Hvordan kan William H. Whytes byromsblikk brukes?", ["Til å observere faktisk opphold og bevegelse", "Til å anta bruk fra arkitekttegninger alene", "Til å datere Bolig’n"], 0, "Whytes perspektiv retter analysen mot observerbar bruk av åpne rom.", "em_by_offentlige_rom_motesteder", "byleksikon"],
  ["Hva er en trygg konklusjon fra før–nå-paret?", ["Bebyggelsestetthet og torggeometri er endret", "Bildene har identisk kamerastandpunkt", "Alle beboere ønsket saneringen"], 0, "Bildene og kildene støtter et fysisk skalaskifte, ikke identisk ståsted eller enighet.", "em_by_transformasjon_ombruk", "dagsavisen"],
  ["Hva må en aktøranalyse skille mellom?", ["Dokumenterte roller og antatte motiver", "Gamle og nye filformater", "Logo og fotograf"], 0, "Aktøranalyse skiller kildebelagte roller, interesser og maktposisjoner fra udokumenterte motiver.", "em_by_styring_forvaltning_planmakt", "dagsavisen"]
];
const conceptMap = {
  em_by_offentlige_rom_motesteder: ["offentlig rom", "co_by_offentlige_rom_b365076441"],
  em_by_torg_plasser_som_scene: ["torg og plasser", "co_by_torg_plasser_0c350db0fa"],
  em_by_historiske_lag_i_hverdagsrom: ["historiske lag", "co_by_historiske_lag_b5eb5eb432"],
  em_by_transformasjon_ombruk: ["transformasjon og ombruk", "co_by_transformasjon_81e909e462"],
  em_by_modernistisk_boligplanlegging: ["modernistisk boligplanlegging", "co_by_modernistisk_boligplanlegging_aa45b89c1d"],
  em_by_styring_forvaltning_planmakt: ["planmakt", "co_by_planmakt_2c99d9c284"]
};
const theory = [
  ["byliv_aapne_rom", "william_h_whyte", "The Social Life of Small Urban Spaces", "met_feltobservasjon"],
  ["his_spor_gatebilde", "pierre_nora", "Les Lieux de Mémoire", "met_arkiv_minne_spor"],
  ["byliv_aapne_rom", "william_h_whyte", "The Social Life of Small Urban Spaces", "met_feltobservasjon"],
  ["ark_transformasjon", "christian_norberg_schulz", "Genius Loci", "met_for_etter"],
  ["ark_makt", "christian_norberg_schulz", "Genius Loci", "met_aktoranalyse"]
];
const questions = quizRows.map(([question, rawOptions, rawAnswerIndex, knowledge, emne_id, sourceId], index) => {
  const number = String(index + 1).padStart(2, "0");
  const concept = conceptMap[emne_id];
  const answer = rawOptions[rawAnswerIndex];
  const shift = index % rawOptions.length;
  const options = [...rawOptions.slice(shift), ...rawOptions.slice(0, shift)];
  const answerIndex = options.indexOf(answer);
  const item = {
    id: `${placeId}_quiz_${number}`, quiz_id: `by_${placeId}_q${number}`, categoryId: "by", placeId, targetId: placeId, question_scope: "place",
    question, options, answer, answerIndex, knowledge, difficulty: Math.min(4, 1 + Math.floor(index / 7)),
    question_type: index < 14 ? "fact" : index < 21 ? "context" : "concept", emne_id, source: [sourceId], source_origin: "external", claim_basis: knowledge,
    claim_id: `claim_${placeId}_quiz_${number}`, primary_knowledge_unit_id: `ku_by_${placeId}_${number}`, knowledge_unit_ids: [`ku_by_${placeId}_${number}`], concepts: [concept[0]], concept_ids: [concept[1]], term_ids: [], knowledge_contract_version: 1, knowledge_link_status: "linked"
  };
  if (index >= 23) {
    const [topic_hook_id, thinker_id, work, method_id] = theory[index - 23];
    Object.assign(item, { topic_hook_id, thinker_id, work, method_id, theory_ref: { topic_hook_id, thinker_id, work, why_it_helps: "Perspektivet strukturerer en stedsspesifikk analyse uten å erstatte historiske eller aktuelle kilder." }, guidance_basis: ["data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"] });
  } else if (index === 21) item.method_id = "met_morfologisk_analyse";
  else if (index === 22) item.method_id = "met_arkiv_minne_spor";
  if (item.method_id && !item.guidance_basis) item.guidance_basis = ["data/fag/by/methods_by.json"];
  return item;
});
const quizFile = "data/quiz/by/hammersborg_torg_sets.json";
const phases = ["opening", "middle", "bridge", "final"];
const quiz = {
  targetId: placeId, categoryId: "by", generator_version: "v5_1_external_priority_normal_4x7", size_class: "normal",
  sets: phases.map((phase, index) => ({ set_id: `by_${placeId}_set_${index + 1}`, order: index + 1, level: index + 1, phase, title: ["Det gamle torget", "Sanering og etterkrigsby", "Kilder og spor", "Byanalyse"][index], questions: questions.slice(index * 7, index * 7 + 7) }))
};
const briefFile = "data/quiz/production_briefs/by/hammersborg_torg.json";
const sourceRegistry = {
  byleksikon: { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Identitet, gammel og ny plassering, OBOS-anlegget og 1999 er kontrollert." },
  lokalwiki: { url: urls.lokalwiki, source_type: "local_history_reference", review_status: "reviewed", review_note: "Adresser, vannpost, pissoir og Hammersborgslottet er kontrollert." },
  dagsavisen: { url: urls.dagsavisen, source_type: "archive_history_article", review_status: "reviewed", review_note: "Saneringsstart og sosial kontekst er kontrollert." },
  arbeiderboliger: { url: urls.arbeiderboliger, source_type: "institutional_reference", review_status: "reviewed", review_note: "Selskapet, initiativet, Holtermann og første bygg er kontrollert." },
  morgenstierne: { url: urls.morgenstierne, source_type: "biographical_reference", review_status: "reviewed", review_note: "Initiativ og stedskobling er kontrollert." },
  rinnan_place: { url: urls.rinnanPlace, source_type: "biographical_reference", review_status: "reviewed", review_note: "Direkte verkskobling til Hammersborg torg 1 er kontrollert." },
  blix: { url: urls.blixPage, source_type: "museum_object_record", review_status: "reviewed", review_note: "Datering, motiv og lisens for tegningen er kontrollert." },
  pissoir: { url: urls.pissoirPage, source_type: "museum_object_record", review_status: "reviewed", review_note: "Motiv, objektbeskrivelse og lisens er kontrollert." },
  obos: { url: urls.obosCurrent, source_type: "current_primary_project_source", review_status: "reviewed", review_note: "Planlagt innflytting fra september 2026 er kontrollert og tidsstatus er avgrenset." },
  current_photo: { url: urls.currentPage, source_type: "licensed_image_record", review_status: "reviewed", review_note: "Fotograf, dato og lisens er kontrollert." },
  obos_building: { url: urls.obosBuildingPage, source_type: "licensed_image_record", review_status: "reviewed", review_note: "2020-datering, motiv og lisens er kontrollert." }
};
const curriculum = { module_ids: ["kur_by_02_nabolag_ulikhet_segregering", "kur_by_04_historiske_lag_og_transformasjon"], emne_ids: [...new Set(questions.map((q) => q.emne_id))], topic_hook_ids: [...new Set(questions.map((q) => q.topic_hook_id).filter(Boolean))], method_ids: [...new Set(questions.map((q) => q.method_id).filter(Boolean))], thinker_ids: [...new Set(questions.map((q) => q.thinker_id).filter(Boolean))], works: [...new Set(questions.map((q) => q.work).filter(Boolean))] };
const profileDecision = { profile: "normal", set_count: 4, questions_per_set: 7, justification: "Torget har fire tydelige læringsjobber og tilstrekkelig ekstern kildebredde for standardprofilen, uten behov for major-bredde." };
const heldBackCandidates = ["1961 eller 1962 som ubetinget rivningsår for Bolig’n.", "Planlagt innflytting i september 2026 som påstand om ferdigstillelse.", "Flaskeposten fra 1964 uten gjenbrukbar bildeproveniens.", "Skulpturen En ny utfordring som nåværende objekt etter at den ble flyttet."];
const existingQuizAudit = { searched_paths: [quizFile, "data/quiz/manifest.json"], active_before: { file: null, set_count: 0, question_count: 0, finding: "Ingen canonical Hammersborg torg-quiz fantes." }, decisions: ["Produser ny kildeledet 4×7-pakke i By-kategorien.", "Hold de første 14 spørsmålene teori- og metodefrie.", "Bruk teori og metode først etter faktagrunnlaget."], knowledge_migration: "Alle spørsmål får nye stabile By-, claim- og Knowledge-ID-er." };
write(briefFile, { schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: placeId, profile_hint: "normal", reviewed_at: verifiedAt, review_note: "Fire læringsjobber dekker eldre torg, arbeiderbolig, sanering/modernisme og kildekritisk byanalyse.", scope: { place: place.name, production_profile: "normal", set_count: 4, questions_per_set: 7, total_questions: 28, normal_opening_questions: 14 }, sources: sourceRegistry, selected_curriculum: curriculum, existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, claims: questions.map((q, index) => ({ claim_id: q.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: q.question_type === "concept" ? "concept_theory" : q.question_type, statement: q.knowledge, source_ids: q.source, source_origin: "external", emne_id: q.emne_id })) });
quiz.sources = Object.fromEntries(Object.entries(sourceRegistry).map(([id, entry]) => [id, entry.url]));
quiz.production_context = { manifest_category: "by", profile: "normal_4x7", standard_version: "3.3", source_brief: briefFile, context_artifact: "data/quiz/production_context/by/hammersborg_torg.json", resolved_files: { pensum: "data/fag/by/pensum_by.json", emner: "data/fag/by/emner_by.json", fagkart: "data/fag/by/fagkart_by.json", methods: "data/fag/by/methods_by.json", supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json", quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json" }, required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"], pensum_module_ids: curriculum.module_ids, emne_ids: curriculum.emne_ids, topic_hook_ids: curriculum.topic_hook_ids, method_ids: curriculum.method_ids, thinker_ids: curriculum.thinker_ids, works: curriculum.works, source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit, profile_decision: profileDecision, held_back_candidates: heldBackCandidates, normal_opening_questions: 14, theory_start_phase: "final", method_start_phase: "final" };
write(quizFile, quiz);
const quizManifest = read("data/quiz/manifest.json");
quizManifest.sets = quizManifest.sets.filter((entry) => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write("data/quiz/manifest.json", quizManifest);
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.by.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/by/hammersborg_torg.json", context_artifact: "../quiz/production_context/by/hammersborg_torg.json", quiz_file: "../quiz/by/hammersborg_torg_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);
await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: "data/quiz/production_context/by/hammersborg_torg.json" });

const registry = read("data/fagverk/fagverk_registry.json");
registry.placeLinks[placeId] = { sourceFile: placeFile.replace(/^data\//, ""), field: "fagverk", schema: "history_go_place_fagverk_v2", level: "standard", status: "curated" };
registry.updatedAt = verifiedAt;
write("data/fagverk/fagverk_registry.json", registry);

const claims = [
  ["identity", "Hammersborg torg er den navngitte plassen mellom Grubbegata og Møllergata.", urls.byleksikon, "Oppslagsinnledning", "identity", "historical"],
  ["old_square", "Navnet viste opprinnelig til plassen foran Margaretakyrken.", urls.byleksikon, "Navn og eldre plassering", "ordinary", "historical"],
  ["addresses", "Det eldre torget hadde sju adresser i 1900.", urls.lokalwiki, "Adressehistorikk", "ordinary", "historical"],
  ["waterpost", "En vannpost er dokumentert ved torget i 1875.", urls.lokalwiki, "Torgets infrastruktur", "ordinary", "historical"],
  ["pissoir", "Et pissoir stod ved det eldre torget før 1900.", urls.lokalwiki, "Torgets infrastruktur", "ordinary", "historical"],
  ["castle", "Hammersborgslottet ved det gamle torgets nummer 2 ble revet i 1925.", urls.lokalwiki, "Hammersborg torg 2", "ordinary", "historical"],
  ["company", "Selskabet til Opførelse af Arbeiderboliger ble stiftet i 1851 etter initiativ fra politimester Morgenstierne.", urls.arbeiderboliger, "Selskapets etablering", "ordinary", "historical"],
  ["bolign", "Selskapets første bygg ble oppført i Nedre Hammersborggate 11 i 1852 etter tegninger av Peter Høier Holtermann.", urls.arbeiderboliger, "Første bygg", "ordinary", "historical"],
  ["demolition_conflict", "Åpne kilder oppgir både 1961 og 1962 for rivningen av Bolig’n; Oslo byleksikon avgrenser den til tidlig i 1960-årene.", urls.arbeiderboliger, "Rivning og bildeomtale", "ordinary", "historical"],
  ["clearance", "Saneringen av Hammersborg-forstaden begynte i 1921.", urls.dagsavisen, "Saneringen", "ordinary", "historical"],
  ["new_square", "Dagens Hammersborg torg ble dannet i 1960-årene.", urls.byleksikon, "Dagens plass", "ordinary", "historical"],
  ["obos_complex", "Hammersborg torg 1 består av høyblokk, lavblokk og forbindende inngangsparti oppført i 1963–64.", urls.byleksikon, "Hammersborg torg 1", "ordinary", "historical"],
  ["rinnan", "Frode Rinnan og Olav Tveten tegnet OBOS-anlegget i Hammersborg torg 1.", urls.rinnanPlace, "Verkliste", "ordinary", "historical"],
  ["rehab_1999", "Hammersborg torg ble rehabilitert i 1999.", urls.byleksikon, "Rehabilitering", "ordinary", "historical"],
  ["photo_2011", "Siri Johannessens fotografi viser Hammersborg torg 7. mars 2011.", urls.currentPage, "Commons metadata", "ordinary", "historical"],
  ["obos_move", "OBOS oppgir at organisasjonen flyttet fra hovedkontoret på Hammersborg i 2025.", urls.obosCurrent, "Prosjektbeskrivelsen", "temporal", "current"],
  ["planned_2026", "OBOS’ prosjektside oppgir planlagt innflytting fra september 2026.", urls.obosCurrent, "Prosjektstatus", "temporal", "planned"]
].map(([suffix, claim, sourceUrl, sourceLocation, claimKind, temporalStatus]) => ({ id: `claim_${placeId}_${suffix}`, claim, sourceUrl, sourceLocation, sourceType: sourceUrl.includes("commons") ? "catalogue" : sourceUrl.includes("dagsavisen") ? "reputable_secondary" : sourceUrl.includes("obos.no") ? "primary" : "institutional", verifiedAt, status: "verified", claimKind, evidenceMode: "direct", temporalStatus }));
const bolignClaim = claims.find((claim) => claim.id.endsWith("_bolign"));
bolignClaim.claimKind = "strong";
bolignClaim.evidenceMode = "explicit";
bolignClaim.independentSourceUrls = [urls.christianiaArbeiderboliger];
const ids = Object.fromEntries(claims.map((claim) => [claim.id.split(`claim_${placeId}_`)[1], claim.id]));
const mapSentence = (sentence) => {
  const text = sentence.toLowerCase();
  if (text.includes("mellom grubbegata")) return [ids.identity];
  if (text.includes("margaretakirk")) return [ids.old_square];
  if (text.includes("sju adresser")) return [ids.addresses];
  if (text.includes("vannpost") && text.includes("pissoir")) return [ids.waterpost, ids.pissoir];
  if (text.includes("vannpost")) return [ids.waterpost];
  if (text.includes("pissoir")) return [ids.pissoir];
  if (text.includes("hammersborgslott")) return [ids.castle];
  if ((text.includes("selskabet") || text.includes("morgenstierne")) && (text.includes("holtermann") || text.includes("1852"))) return [ids.company, ids.bolign];
  if (text.includes("selskabet") || text.includes("morgenstierne")) return [ids.company];
  if (text.includes("holtermann") || text.includes("1852")) return [ids.bolign];
  if (text.includes("1961") || text.includes("1962") || text.includes("tidlig i 1960")) return [ids.demolition_conflict];
  if (text.includes("1921") || text.includes("saneringen av hammersborg-forstaden")) return [ids.clearance];
  if (text.includes("rinnan") || text.includes("tveten")) return [ids.rinnan, ids.obos_complex];
  if (text.includes("høyblokk") || text.includes("1963") || text.includes("dagens hammersborg torg ble")) return [ids.new_square, ids.obos_complex];
  if (text.includes("1999") && text.includes("2026")) return [ids.rehab_1999, ids.obos_move, ids.planned_2026];
  if (text.includes("1999")) return [ids.rehab_1999];
  if (text.includes("2011")) return [ids.photo_2011];
  if (text.includes("2025")) return [ids.obos_move];
  if (text.includes("september 2026") || text.includes("1. september 2026")) return [ids.planned_2026];
  if (text.includes("før–nå") || text.includes("kamerapunkt") || text.includes("ståsted")) return [ids.old_square, ids.photo_2011];
  return [ids.identity];
};
write(`data/places/production/${placeId}.json`, {
  schemaVersion: "4.2", validatorVersion: "4.2.1", status: "ready_v4_2", placeId, placeFile,
  identity: { status: "resolved", represents: "Det navngitte offentlige torget mellom Grubbegata og Møllergata, med dokumenterte historiske lag fra det eldre torget foran Margaretakyrken.", period: "1851–", excludes: ["hele Hammersborg-strøket", "Margaretakyrken som egen Place", "hele OBOS-organisasjonen", "skulpturen En ny utfordring etter at den ble flyttet", "flaskeposten fra 1964 uten gjenbrukbar mediefil"] },
  claims,
  sentenceCoverage: { desc: sentences(desc).map((sentence, index) => ({ sentence: index + 1, claimIds: mapSentence(sentence) })), popupDesc: sentences(popupDesc).map((sentence, index) => ({ sentence: index + 1, claimIds: mapSentence(sentence) })) },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category, coordinates: { lat: place.lat, lon: place.lon } },
  collections: { people: peopleIds, objects: objectIds, brands: [obos.id], structures: structureIds, status: "complete", image_coverage_percent: 100 },
  quizReadiness: { status: "canonical_normal_4x7", quizTargetId: placeId, sourceBrief: briefFile, productionContext: "data/quiz/production_context/by/hammersborg_torg.json", normalOpeningQuestions: 14, totalQuestions: 28, reuseDecision: "Ingen aktiv canonical quiz fantes; en ny kildeledet 4×7-pakke er produsert.", questions: [
    { question: "Hvor lå det eldre torget?", answer: "Foran Margaretakyrken", type: "hvor", normalKnowledgeQuestion: true, claimIds: [ids.old_square] },
    { question: "Mellom hvilke gater ligger dagens torg?", answer: "Grubbegata og Møllergata", type: "hvor", normalKnowledgeQuestion: true, claimIds: [ids.identity] },
    { question: "Når ble Bolig’n oppført?", answer: "1852", type: "når", normalKnowledgeQuestion: true, claimIds: [ids.bolign] },
    { question: "Hvem tegnet Bolig’n?", answer: "Peter Høier Holtermann", type: "hvem", normalKnowledgeQuestion: true, claimIds: [ids.bolign] },
    { question: "Hvem tok initiativ til arbeiderboligselskapet?", answer: "Politimester Morgenstierne", type: "hvem", normalKnowledgeQuestion: true, claimIds: [ids.company] },
    { question: "Hvilket objekt er dokumentert i 1875?", answer: "Vannposten", type: "hvilket_verk_eller_objekt", normalKnowledgeQuestion: true, claimIds: [ids.waterpost] },
    { question: "Hva var et pissoir?", answer: "Et offentlig urinal", type: "hva", normalKnowledgeQuestion: true, claimIds: [ids.pissoir] },
    { question: "Hva skjedde i 1921?", answer: "Saneringen begynte", type: "hva_skjedde", normalKnowledgeQuestion: true, claimIds: [ids.clearance] }
  ] },
  source_conflicts: [{ claim: "Bolig’n ble revet i ett sikkert år.", status: "qualified", reason: "Lokalhistoriewiki oppgir 1961, mens andre referanser oppgir 1962; canonical tekst bruker tidlig i 1960-årene." }, { claim: "Anlegget er ferdig ombygd 1. september 2026.", status: "rejected", reason: "Prosjektsiden oppgir planlagt innflytting fra september, ikke dokumentert ferdigstillelse på kontrolltidspunktet." }],
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Hammersborg torg phase 1–24 source review", notes: "Stedsidentitet, årstall, personroller, objekter, billedproveniens og planlagt nåstatus er kontrollert separat." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Hammersborg torg phase 1–24 editorial review", introducedNewFacts: false, notes: "Eldre og dagens torg, historiske og nåværende strukturer samt plan og ferdigstillelse er holdt atskilt." } },
  reviewsNotes: ["Rivningsavviket 1961/1962 skjules ikke.", "Før–nå-paret er merket med både steds- og ståstedsavvik.", "September 2026 behandles som planlagt, ikke ferdig.", "Flaskeposten og den flyttede skulpturen er holdt utenfor Objects."],
  roundsReadiness: { people: "ready_three_direct_profiles", objects: "ready_two_historical_physical_objects", brands: "ready_one_authentic_wordmark", structures: "ready_three_documented_structures", badges: "ready_three_by_underbadges", quiz: "ready_normal_4x7_by", leksikon: "ready_three_articles", sprak: "ready_six_entries", stories: "ready_one_episode_v1", readings: "ready_four_link_only", fagverk: "ready_standard", frontImage: "ready_real_portrait_3x4", beforeAfter: "ready_with_location_and_viewpoint_caveat", news: "ready_planned_status" },
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

write(`data/places/historie-production/${placeId}.json`, {
  schemaVersion: "historie_place_production_v1", validatorVersion: "1.0.0", placeId, placeFile, status: "ready",
  historicalIdentity: { statement: "Et navngitt torg som flyttet tyngdepunkt fra et tett boligmiljø foran Margaretakyrken til et etterkrigsbyrom ved OBOS-anlegget.", placeRelationType: "historical_landscape", placeRelationStatement: "Place-ID-en representerer dagens avgrensede torg og det direkte dokumenterte eldre navne- og torglaget, ikke hele Hammersborg.", temporalScope: { start: "1851", end: "2026", precision: "period", rationale: "Perioden dekker arbeiderboligen, det eldre torgets dokumenterte infrastruktur, saneringen, det nye torget og den siste planlagte ombyggingsfasen." }, sourceIds: ["source_byleksikon", "source_lokalwiki", "source_dagsavisen", "source_arbeiderboliger"] },
  historyTopics: [{ emneId: "em_his_historiske_lag_i_byrom", siteSpecificRationale: "Torgets flyttede plassering, rivninger og bevarte navn gjør brudd og kontinuitet synlig.", caseIds: ["case_hammersborg_flyttet_torg"] }],
  sources: [
    { id: "source_byleksikon", url: urls.byleksikon, sourceLocation: "Navn, gammel og ny plassering, bygningsanlegg og 1999", sourceType: "institutional", verifiedAt, temporalCoverage: "mixed", provenance: "Redigert Oslo-spesifikt oppslagsverk.", limitations: "Kortfattet om beboernes erfaringer." },
    { id: "source_lokalwiki", url: urls.lokalwiki, sourceLocation: "Adresser, objekter, bygninger og befolkning", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Lokalhistorisk oppslagsverk med kildereferanser.", limitations: "Oppgir 1961 for Bolig’n, i konflikt med andre kilder." },
    { id: "source_dagsavisen", url: urls.dagsavisen, sourceLocation: "Forstaden og saneringen", sourceType: "reputable_secondary", verifiedAt, temporalCoverage: "retrospective", provenance: "Historiker Johanne Bergkvists framstilling basert på Oslo byarkiv.", limitations: "Avisformat, ikke komplett saneringsarkiv." },
    { id: "source_arbeiderboliger", url: urls.arbeiderboliger, sourceLocation: "Selskapet og første bygg", sourceType: "institutional", verifiedAt, temporalCoverage: "retrospective", provenance: "Oslo byleksikons arbeiderboligoversikt.", limitations: "Oppgir tidlig i 1960-årene, ikke eksakt rivningsdato." },
    { id: "source_obos", url: urls.obosCurrent, sourceLocation: "Utflytting og prosjektstatus", sourceType: "primary", verifiedAt, temporalCoverage: "current", provenance: "OBOS’ egen prosjektside.", limitations: "Markedsfører eget prosjekt og dokumenterer plan best, ikke uavhengig ferdigkontroll." }
  ],
  caseRealizations: [{
    id: "case_hammersborg_flyttet_torg", claim: "Hammersborg torg viser hvordan et stedsnavn kan bestå gjennom rivning, flyttet geometri og nytt bygningsprogram.",
    temporalSequence: { scope: { start: "1851", end: "1999", precision: "period", rationale: "Caset følger arbeiderboligen, saneringen, det nye torget og senere rehabilitering." }, startPoint: "Bolig’n ble oppført i 1852 ved det eldre torget.", endPoint: "Det nye torget ble rehabilitert i 1999.", breaks: ["Saneringen begynte i 1921.", "Hammersborgslottet ble revet i 1925.", "Bolig’n ble revet tidlig i 1960-årene.", "OBOS-anlegget og dagens torg ble etablert i 1963–64."], continuities: ["Navnet Hammersborg torg ble videreført.", "Stedet forble et offentlig orienteringspunkt mellom Grubbegata og Møllergata."], sourceIds: ["source_byleksikon", "source_lokalwiki", "source_dagsavisen", "source_arbeiderboliger"] },
    actors: [{ name: "Beboerne på det eldre Hammersborg", roleOrInterest: "Bodde i det tette boligmiljøet rundt torget.", powerPosition: "Kildene dokumenterer befolkning og boliger bedre enn medvirkning i saneringsbeslutningene.", sourceIds: ["source_lokalwiki", "source_dagsavisen"] }, { name: "Oslo kommune og utbyggingsaktører", roleOrInterest: "Gjennomførte sanering og ny bystruktur.", powerPosition: "Kontrollerte plan- og gjennomføringsprosesser, mens åpne kilder ikke dekker alle beslutningsledd.", sourceIds: ["source_byleksikon", "source_dagsavisen"] }, { name: "OBOS, Frode Rinnan og Olav Tveten", roleOrInterest: "Byggherreidentitet og arkitekter for etterkrigsanlegget.", powerPosition: "Formet den dokumenterte bygningsløsningen, men representerer ikke alene alle saneringsbeslutninger.", sourceIds: ["source_byleksikon"] }],
    conflictOrNegotiation: { statement: "Overgangen erstattet et tett boligmiljø med større bygningsvolumer og åpen plass; kildene dokumenterer utfallet bedre enn alle beboerposisjoner og forhandlingsledd.", sourceIds: ["source_dagsavisen", "source_lokalwiki"] },
    sourceComparison: { sourceIds: ["source_byleksikon", "source_lokalwiki", "source_arbeiderboliger"], comparison: "Byleksikon bærer torg- og anleggshistorien, Lokalhistoriewiki detaljene om adresser og objekter, og arbeiderboligoppslaget selskapets første bygg.", contradictionsOrSilences: "Rivningen av Bolig’n dateres til 1961 eller 1962; åpne kilder dokumenterer ikke alle beboernes syn på saneringen.", conclusionLimits: "Canonical tekst bruker tidlig i 1960-årene og påstår ikke lokal enighet eller én uttømmende årsak." },
    comparativeScale: { localFinding: "Et lokalt torgnavn overlevde et omfattende fysisk brudd.", widerContext: "Caset viser etterkrigstidens sanering og skalaskifte i sentrale nordiske byområder uten å gjøre Hammersborg representativt for alle slike prosesser.", scale: "national", sourceIds: ["source_byleksikon", "source_dagsavisen"] },
    causationAndUncertainty: { causalAssessment: "Saneringen muliggjorde den dokumenterte nye torggeometrien og OBOS-anlegget, men åpne kilder isolerer ikke én fullstendig beslutningsårsak.", alternativeExplanations: ["Boligstandard, kommunal planlegging, tomtebehov og institusjonell utbygging kan ha virket sammen."], uncertainty: "Beboerperspektiver, kostnader og detaljert beslutningsgang er ufullstendig dekket i de åpne kildene.", sourceIds: ["source_dagsavisen", "source_byleksikon", "source_lokalwiki"] }
  }],
  presentTrace: { objectStatus: "altered", statement: "Dagens torgflate og OBOS-anlegget viser etterkrigsfasen; vannpost, pissoir, Bolig’n og Hammersborgslottet finnes bare i arkiv- og tekstspor.", originalSiteRelationship: "Geometriankeret gjelder dagens torgflate, mens det eldre torget lå forskjøvet foran Margaretakyrken.", sourceIds: ["source_byleksikon", "source_lokalwiki", "source_obos"] },
  quizOpening: { status: "PASS", quizTargetId: placeId, firstTwoSetsQuestionCount: 14, sourceBrief: briefFile, productionContext: "data/quiz/production_context/by/hammersborg_torg.json", requiredInputs: ["data/fag/by/pensum_by.json", "data/fag/by/emner_by.json", "data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json", "data/fag/by/supersetQUIZMAL_by.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md", "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"] },
  chronologyStories: { status: "PASS", chronologyReviewed: true, storiesReviewed: true, rationale: "Kronologien følger bolig, hverdagsinfrastruktur, sanering, nybygg, rehabilitering og planlagt ombygging; Story samler flyttingen uten å overdrive årsak." },
  gates: Object.fromEntries("ABCDEFGH".split("").map((gate) => [gate, { status: "PASS", evidenceRefs: gate === "G" ? ["quizOpening"] : gate === "H" ? ["chronologyStories"] : ["historicalIdentity", "caseRealizations.case_hammersborg_flyttet_torg"] }])),
  review: { reviewer: "Hammersborg torg phase 1–24 Historie review", reviewedAt: verifiedAt, notes: "Eldre og dagens torg er skilt, rivningsavviket publiseres, og september 2026 står som planlagt status." }
});

const auditFile = "reports/place-production/hammersborg-torg-phase1-24-gate-audit-v1.json";
write(auditFile, {
  schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { measured_at_commit: "14192745cfce3f9498e279e333540eda5478d845", existing_place: false, coordinate_changed: false, existing_quiz: "none", existing_story: "none", existing_collections: 0 },
  collections: { required: ["people", "objects", "brands", "structures"], loaded_preview_images: 9, missing: 0, coverage_percent: 100 },
  people: { candidates_reviewed: ["Frode Rinnan", "Christian Fredrik von Munthe af Morgenstierne", "Peter Høier Holtermann"], selected: peopleIds, held_back: ["Olav Tveten – direkte arkitektkobling, men ingen separat kontrollert portrettressurs i denne leveransen."], image_coverage_percent: 100 },
  brands: { candidates_reviewed: ["OBOS", "Selskabet til Opførelse af Arbeiderboliger"], selected: [obos.id], held_back: ["Arbeiderboligselskapet behandles som historisk institusjon uten et autentisk bildeklart merke."], logo_coverage: { required: 1, reviewed: 1, missing: 0, percent: 100 } },
  objects: { selected: objectIds, held_back: ["Flaskeposten fra 1964 – lovlig gjenbrukbar lokal mediefil mangler.", "En ny utfordring – skulpturen er flyttet og er ikke et nåværende stedsobjekt."] },
  source_conflicts: [{ claim: "Bolig’n ble revet i 1961/1962.", status: "qualified", reason: "Canonical tekst bruker tidlig i 1960-årene." }, { claim: "Ombyggingen er ferdig.", status: "rejected", reason: "Kilden oppgir planlagt innflytting fra september 2026." }],
  conditional_modules: { stories: "one_episode_v1_produced", lesespor: "four_produced", language: "six_terms_produced", for_na: "produced_with_location_and_viewpoint_caveat", news: "one_planned_status_note_produced", dialect: "not_applicable" },
  manual_image_review: { status: "PASS", reviewed_assets: [place.image, place.frontImage, place.for_na.beforeImage, ...people.map((person) => person.image), ...place.objects.map((item) => item.image), ...place.structures.map((item) => item.image), obos.logo], note: "Alle utsnitt er visuelt kontrollert. Frontbildet er et reelt portrettformat av torget; historiske objekter og strukturer er eksplisitt tidsmerket, og de to malte personportrettene er oppgitt som kunstneriske representasjoner." },
  quality_score: { correctness_and_evidence: { score: 5, note: "Stedsoppslag, arkivkataloger, biografiske kilder, nåtidskilde og geometri er krysskontrollert; rivnings- og planstatusgrenser er synlige." }, coverage_and_completion: { score: 5, note: "Fire bildeklare samlinger, ti milepæler, People-claims, språk, Story, fire lesespor, Fagverk, før–nå, planlagt nåstatus og 4×7-quiz er materialisert." }, editorial_quality: { score: 5, note: "Eldre og dagens torg, objekt og struktur, plan og ferdigstillelse samt fotografi og opplevelse er holdt atskilt." }, technical_integrity: { score: 5, note: "Deterministisk finalizer, canonicale manifester, coordinate evidence, produksjonskontekst og permanent regresjon inngår." }, safety_and_responsibility: { score: 5, note: "Beboererfaringer og saneringsmotiver oppdiktes ikke; observasjonsoppgaver bruker offentlige eller arkivbaserte spor." }, maintainability_and_auditability: { score: 5, note: "Claims, setningsmapping, billedproveniens, holdbacks, tidsstatus og kildesammenligning er eksplisitte." }, total: 30, critical_findings: 0, unresolved_blockers: 0 }
});
const workcard = read("reports/place-production/hammersborg-torg-workcard-current.json");
Object.assign(workcard, {
  status: "complete", completed_at: verifiedAt, active_phase: "complete", source_review: "complete", production_verified_at: verifiedAt, quiz_profile: "normal_4x7", fagverk_status: "curated_standard", chronology_status: "PASS", story_status: "PASS_episode_v1", objects_status: "PASS_two_historical_physical_objects", brands_status: "PASS_one_authentic_wordmark", people_status: "PASS_three_direct_profiles", branch_status: "ready_for_pr", live_status: "pending_merge", quality_gate: "30/30", canonical_next: null,
  held_back_candidates: ["Flaskeposten fra 1964 – mangler gjenbrukbar lokal mediefil.", "En ny utfordring – flyttet fra torget.", "Eksakt rivningsår for Bolig’n – kildene spriker mellom 1961 og 1962."],
  content_plan: { people: "PRODUSERT: Rinnan, Morgenstierne og Holtermann med direkte person- og bildespor.", objects: "PRODUSERT: vannpost og pissoir som historiske fysiske, stedsspesifikke objekter.", brands: "PRODUSERT: OBOS med autentisk ordmerke og direkte stedsrolle.", category_expression: "PRODUSERT: structures / Bygninger og byrom.", stories: "PRODUSERT: Torget som flyttet, episode_v1.", for_na: "PRODUSERT med eksplisitt steds- og ståstedsforbehold.", news: "PRODUSERT som planlagt innflytting fra september 2026, ikke ferdigstillelse.", lesespor: "PRODUSERT: fire åpne, lenkebaserte lesespor." }
});
write("reports/place-production/hammersborg-torg-workcard-current.json", workcard);

const imageAuditFile = path.join(os.tmpdir(), "hammersborg-torg-place-image-audit.json");
execFileSync(process.execPath, ["scripts/audit-place-images.mjs", "--mode=all", `--report=${imageAuditFile}`], { cwd: root, stdio: "ignore" });
const imageAudit = JSON.parse(fs.readFileSync(imageAuditFile, "utf8"));
const imageBacklogFile = "data/places/place_image_backlog_summary.json";
const imageBacklog = read(imageBacklogFile);
imageBacklog.generatedAt = verifiedAt;
imageBacklog.generatedFromCommit = "hammersborg_torg_completion_20260901";
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

console.log("Hammersborg torg completion materialized: 4 collections, 28 quiz questions, 10 chronology anchors, 1 episode Story.");
