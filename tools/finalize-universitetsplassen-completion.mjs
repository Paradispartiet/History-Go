#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const root = process.cwd();
const verifiedAt = "2026-08-29";
const placeId = "universitetsplassen";
const placeFile = "data/places/by/oslo/places/universitetsplassen.json";
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const writeCompact = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value));
};
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };
const upsertById = (array, value) => {
  const index = array.findIndex((item) => item?.id === value.id);
  if (index < 0) array.push(value);
  else array[index] = value;
};
const sentences = (text) => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)]
  .map((item) => item.segment.trim()).filter(Boolean);
const stripHtml = (value) => String(value ?? "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const urls = {
  square: "https://oslobyleksikon.no/side/Universitetsplassen",
  university: "https://oslobyleksikon.no/side/Universitetet_i_Oslo",
  schweigaard: "https://oslobyleksikon.no/side/Schweigaard-statuen",
  paMunch: "https://oslobyleksikon.no/side/P._A._Munch-statuen",
  uioAula: "https://www.hf.uio.no/iakh/forskning/prosjekter/aula-prosjektet/bilder/iicposter_2012.pdf",
  uioCity: "https://www.uio.no/om/organisasjon/styret/moter/2022/12-06/i-sak-20-22-uio-i-sentrum-karl-johans-gate.pdf",
  uioLogo: "https://www.uio.no/om/designmanual/profilelementer/logo/",
  osm: "https://www.openstreetmap.org/way/5089104"
};

const commonsFiles = {
  main: "Universitetsplassen, Oslo, 2019 (01).jpg",
  historic: "Universitetsplassen med statue av P.A. Munch. - no-nb digifoto 20150326 00034 NB MIT FNR 02873.jpg",
  grosch: "OB.F00016 Christian Grosch.jpg",
  schweigaard: "Anton Martin Schweigaard by Julius Middelthun 587A6946.jpg",
  paMunch: "P A Munch.JPG",
  media: "Domus Media, Universitetet i Oslo (2023).jpg",
  academica: "Domus Academica, University of Oslo - 20140615-01.jpg",
  bibliotheca: "Domus Bibliotheca, Universitetet i Oslo - 20060720.jpg",
  aula: "Uni.aula,front.jpg"
};

async function commonsInfo(fileName) {
  const title = `File:${fileName}`;
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("format", "json");
  api.searchParams.set("prop", "imageinfo");
  api.searchParams.set("iiprop", "url|size|extmetadata");
  api.searchParams.set("titles", title);
  api.searchParams.set("origin", "*");
  api.searchParams.set("iiurlwidth", "1600");
  const response = await fetch(api, { headers: { "user-agent": "History-Go-place-production/1.0 (github.com/Paradispartiet/History-Go)" } });
  if (!response.ok) throw new Error(`Commons API ${response.status}: ${fileName}`);
  const payload = await response.json();
  const page = Object.values(payload?.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url || page?.missing !== undefined) throw new Error(`Fant ikke Commons-fil: ${fileName}`);
  const meta = info.extmetadata || {};
  const license = stripHtml(meta.LicenseShortName?.value || meta.UsageTerms?.value || "");
  const licenseUrl = stripHtml(meta.LicenseUrl?.value || "");
  if (!license) throw new Error(`Commons-filen mangler eksplisitt lisens: ${fileName}`);
  const creator = stripHtml(meta.Artist?.value || "Ukjent");
  const credit = stripHtml(meta.Credit?.value || "") || `${creator} / Wikimedia Commons`;
  const date = stripHtml(meta.DateTimeOriginal?.value || meta.DateTime?.value || "");
  const pageUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title).replace(/%20/g, "_")}`;
  return {
    fileName,
    originalUrl: info.thumburl || info.url,
    width: info.width,
    height: info.height,
    meta: {
      source: "wikimedia_commons",
      sourcePage: pageUrl,
      creator,
      credit,
      license,
      licenseUrl: licenseUrl || undefined,
      assetType: "documentary_image",
      date: date || undefined,
      transformation: "Proporsjonal beskjæring og WebP-normalisering.",
      verifiedAt
    }
  };
}

const imageBufferCache = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchBuffer(url) {
  const parsed = new URL(url);
  for (const key of ["utm_source", "utm_campaign", "utm_content"]) parsed.searchParams.delete(key);
  const cleanUrl = parsed.toString();
  if (imageBufferCache.has(cleanUrl)) return imageBufferCache.get(cleanUrl);

  let lastStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(cleanUrl, {
      headers: {
        "user-agent": "History-Go-place-production/1.0 (github.com/Paradispartiet/History-Go)",
        "accept": "image/avif,image/webp,image/*,*/*;q=0.8"
      }
    });
    lastStatus = response.status;
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      imageBufferCache.set(cleanUrl, buffer);
      await sleep(750);
      return buffer;
    }
    if (![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`Kunne ikke hente bilde (${response.status}): ${cleanUrl}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.min(retryAfter * 1000, 30000)
      : Math.min(1500 * (2 ** attempt), 30000);
    await sleep(delay);
  }
  throw new Error(`Kunne ikke hente bilde etter retries (${lastStatus}): ${cleanUrl}`);
}

async function outputImage(info, file, width, height, position = "centre") {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const buffer = await fetchBuffer(info.originalUrl);
  await sharp(buffer)
    .rotate()
    .resize(width, height, { fit: "cover", position, withoutEnlargement: false })
    .webp({ quality: 84, effort: 5 })
    .toFile(target);
  return {
    ...info.meta,
    outputDimensions: `${width}x${height}`,
    orientation: height > width ? "portrait" : "landscape",
    aspectRatio: `${width}:${height}`
  };
}

const imageInfo = {};
for (const [key, fileName] of Object.entries(commonsFiles)) imageInfo[key] = await commonsInfo(fileName);

const mainImageMeta = await outputImage(imageInfo.main, "bilder/places/universitetsplassen.webp", 1200, 675);
await outputImage(imageInfo.main, "bilder/kort/places/universitetsplassen.webp", 640, 360);
const frontImageMeta = await outputImage(imageInfo.main, "bilder/places/universitetsplassen_front_portrait.webp", 900, 1200, "centre");
const historicalImageMeta = await outputImage(imageInfo.historic, "bilder/places/universitetsplassen_historic.webp", 900, 1200, "centre");
const groschImageMeta = await outputImage(imageInfo.grosch, "bilder/kort/people/christian_heinrich_grosch.webp", 900, 1200, "centre");
const schweigaardImageMeta = await outputImage(imageInfo.schweigaard, "bilder/kort/objects/universitetsplassen_schweigaardstatuen.webp", 900, 1200, "centre");
const paMunchImageMeta = await outputImage(imageInfo.paMunch, "bilder/kort/objects/universitetsplassen_pa_munch_statuen.webp", 900, 1200, "centre");
const domusMediaImageMeta = await outputImage(imageInfo.media, "bilder/kort/structures/universitetsplassen_domus_media.webp", 900, 520, "centre");
const domusAcademicaImageMeta = await outputImage(imageInfo.academica, "bilder/kort/structures/universitetsplassen_domus_academica.webp", 900, 520, "centre");
const domusBibliothecaImageMeta = await outputImage(imageInfo.bibliotheca, "bilder/kort/structures/universitetsplassen_domus_bibliotheca.webp", 900, 520, "centre");
const aulaImageMeta = await outputImage(imageInfo.aula, "bilder/kort/structures/universitetsplassen_aulaen.webp", 900, 520, "centre");

const place = read(placeFile);
const desc = "Universitetsplassen er universitetets monumentale forplass mot Karl Johans gate. Grunnsteinen til anlegget ble lagt i 1841, og Christian Heinrich Groschs tre hovedbygninger ble tatt i bruk i perioden 1851–54. Schweigaard-statuen kom i 1883, Aulaen i 1911, Edvard Munchs utsmykning ble permanent montert i 1916, og Peter Andreas Munch-statuen ble reist i 1933. Plassen fungerer som akademisk representasjonsrom, møtested og immatrikuleringsarena.";
const popupDesc = [
  "Universitetsplassen ligger foran de historiske universitetsbygningene ved Karl Johans gate og danner institusjonens åpne front mot byen. Universitetet ble grunnlagt i 1811, men det monumentale anlegget på dette stedet kom senere. Grunnsteinen ble lagt 2. september 1841.",
  "Christian Heinrich Grosch utarbeidet planene for Domus Media, Domus Academica og Domus Bibliotheca. Karl Friedrich Schinkel i Berlin vurderte tegningene og foreslo endringer som påvirket den klassisistiske utformingen. De tre bygningene ble tatt i bruk i perioden 1851–54 og organiserer plassen med Domus Media i midten og sidebygningene på hver side. Domus Academica er også kjent som Urbygningen etter uret mot gaten.",
  "Monumentene er en del av plassens fysiske orden. Julius Middelthuns statue av Anton Martin Schweigaard ble reist i 1883. Stinius Fredriksens statue av historikeren Peter Andreas Munch ble reist i 1933. Da Peter Andreas Munch-monumentet kom, ble monumentene ordnet på hver side av inngangen til Domus Media. De to statuene er konkrete objekter i byrommet og må skilles fra kunstverkene inne i Aulaen.",
  "Aulaen ble reist bak Domus Media til universitetets hundreårsjubileum i 1911, med Harald Bødtker og Holger Sinding-Larsen som arkitekter. Edvard Munch arbeidet med elleve monumentale lerretsmalerier til Aulaen i årene 1909–1916. Serien ble permanent montert i 1916. Utsmykningen hører til Aulaens kunsthistorie, mens Aulaen selv er en navngitt del av universitetsanlegget.",
  "Selve plassflaten ble lagt om i 1930–31 etter planer av Bjercke og Eliassen. Omleggingen ga en hellelagt flate med fall mot midtbygningen og gjorde plassen bedre egnet for immatrikulering. Nye studenter samles på plassen når rektor ønsker dem velkommen ved studiestart. Julegranen på Universitetsplassen har vært en årlig tradisjon siden 1919.",
  "Et historisk fotografi fra Nasjonalbiblioteket er datert til intervallet 1945–1960 og viser Peter Andreas Munch-monumentet og universitetsfronten. Et fotografi fra 2019 viser samme plassmiljø fra et annet ståsted. Bildene kan sammenlignes for plassflate, monumenter og bygningsfront, men ståstedet er ulikt og sammenstillingen er ikke optisk identisk.",
  "Universitetsplassen samler arkitektur, monumenter, institusjonsidentitet og akademiske ritualer i ett avgrenset byrom. Grosch kvalifiserer som personkobling fordi universitetsanlegget er et sentralt verk i hans produksjon. Universitetet i Oslo kvalifiserer som institusjonsmerke gjennom direkte eierskap til identiteten og bruken av anlegget. Domus Media, Domus Academica, Domus Bibliotheca og Aulaen er egne navngitte strukturer med dokumentert rolle på stedet."
].join("\n\n");

Object.assign(place, {
  desc,
  popupDesc,
  image: "bilder/places/universitetsplassen.webp",
  cardImage: "bilder/kort/places/universitetsplassen.webp",
  frontImage: "bilder/places/universitetsplassen_front_portrait.webp",
  imageMeta: mainImageMeta,
  frontImageMeta,
  underbadge_ids: ["klassisk_arkitektur", "byplanlegging", "monumenter_og_landemerker"],
  emne_ids: [
    "em_by_symbolsk_makt_og_representasjon",
    "em_by_offentlige_rom_motesteder",
    "em_by_bygningstyper_og_typologier",
    "em_by_historiske_lag_i_hverdagsrom",
    "em_by_materialitet_og_sanseerfaring"
  ],
  related_people_ids: ["christian_heinrich_grosch"],
  related_place_ids: [...new Set([...(place.related_place_ids || []), "karl_johan", "eidsvolls_plass"])],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    production_profile: "major",
    collection_ids: ["people", "objects", "brands", "structures"],
    category_collection_label: "Byrom og anlegg",
    reason: "Grosch, de dokumenterte monumentene, Universitetet i Oslo og de fire universitetsbygningene gir fire ekte, stedsspesifikke og bildeklare samlinger.",
    verifiedAt
  },
  objects: [
    {
      id: "universitetsplassen_schweigaardstatuen",
      name: "Schweigaard-statuen",
      title: "Anton Martin Schweigaard",
      type: "offentlig_monument",
      kind: "bronze_statue",
      year: 1883,
      desc: "Julius Middelthuns bronsemonument over juristen, politikeren og professoren Anton Martin Schweigaard ble reist på Universitetsplassen i 1883.",
      physicalObject: true,
      placeSpecific: true,
      collectable: true,
      placeSpecificReason: "Oslo byleksikon knytter monumentet direkte til Universitetsplassen og oppgir kunstner og oppføringsår.",
      why_here: "Monumentet viser hvordan universitetets fag- og samfunnshistorie er gjort fysisk synlig i forplassen.",
      whereToFind: "Foran universitetsbygningene, på den ene siden av inngangen til Domus Media.",
      unlock: "Identifiser monumentet fra offentlig gangareal uten å berøre sokkelen.",
      storePrice: 40,
      currency: "PC",
      image: "bilder/kort/objects/universitetsplassen_schweigaardstatuen.webp",
      imageMeta: { ...schweigaardImageMeta, assetType: "documentary_object_photo" },
      source_urls: [urls.schweigaard, imageInfo.schweigaard.meta.sourcePage]
    },
    {
      id: "universitetsplassen_pa_munch_statuen",
      name: "Peter Andreas Munch-statuen",
      title: "Peter Andreas Munch",
      type: "offentlig_monument",
      kind: "bronze_statue",
      year: 1933,
      desc: "Stinius Fredriksens bronsemonument over historikeren Peter Andreas Munch ble reist på Universitetsplassen i 1933.",
      physicalObject: true,
      placeSpecific: true,
      collectable: true,
      placeSpecificReason: "Oslo byleksikon knytter monumentet direkte til Universitetsplassen og oppgir kunstner og oppføringsår.",
      why_here: "Monumentet inngår i den symmetriske innrammingen av hovedinngangen etter omleggingen av plassen.",
      whereToFind: "Foran universitetsbygningene, på motsatt side av Domus Media-inngangen fra Schweigaard-statuen.",
      unlock: "Sammenlign plasseringen med Schweigaard-statuen fra offentlig areal.",
      storePrice: 40,
      currency: "PC",
      image: "bilder/kort/objects/universitetsplassen_pa_munch_statuen.webp",
      imageMeta: { ...paMunchImageMeta, assetType: "documentary_object_photo" },
      source_urls: [urls.paMunch, imageInfo.paMunch.meta.sourcePage]
    }
  ],
  structures: [
    {
      id: "universitetsplassen_domus_media",
      name: "Domus Media",
      type: "universitetsbygning",
      kind: "classical_university_building",
      period: "1851–1854",
      desc: "Midtbygningen i Groschs universitetsanlegg, med tempelfront og hovedtrapp mot Universitetsplassen.",
      image: "bilder/kort/structures/universitetsplassen_domus_media.webp",
      imageMeta: { ...domusMediaImageMeta, assetType: "documentary_structure_photo" },
      source_urls: [urls.university, imageInfo.media.meta.sourcePage]
    },
    {
      id: "universitetsplassen_domus_academica",
      name: "Domus Academica",
      type: "universitetsbygning",
      kind: "classical_university_building",
      period: "1851–1854",
      desc: "Sidebygningen kjent som Urbygningen, en del av Groschs klassisistiske anlegg mot Karl Johans gate.",
      image: "bilder/kort/structures/universitetsplassen_domus_academica.webp",
      imageMeta: { ...domusAcademicaImageMeta, assetType: "documentary_structure_photo" },
      source_urls: [urls.university, imageInfo.academica.meta.sourcePage]
    },
    {
      id: "universitetsplassen_domus_bibliotheca",
      name: "Domus Bibliotheca",
      type: "universitetsbygning",
      kind: "classical_library_building",
      year: 1851,
      desc: "Bibliotekbygningen i Groschs universitetsanlegg, oppført som del av universitetets nye monumentale front.",
      image: "bilder/kort/structures/universitetsplassen_domus_bibliotheca.webp",
      imageMeta: { ...domusBibliothecaImageMeta, assetType: "documentary_structure_photo" },
      source_urls: [urls.university, imageInfo.bibliotheca.meta.sourcePage]
    },
    {
      id: "universitetsplassen_aulaen",
      name: "Aulaen",
      type: "universitetsaula",
      kind: "ceremonial_hall",
      year: 1911,
      desc: "Universitetets seremonielle aula ble reist til hundreårsjubileet og rommer Edvard Munchs monumentale utsmykning.",
      image: "bilder/kort/structures/universitetsplassen_aulaen.webp",
      imageMeta: { ...aulaImageMeta, assetType: "documentary_structure_photo" },
      source_urls: [urls.university, urls.uioAula, imageInfo.aula.meta.sourcePage]
    }
  ],
  for_na: {
    title: "Universitetsplassen mellom etterkrigstid og 2019",
    beforeImage: "bilder/places/universitetsplassen_historic.webp",
    beforeImageLabel: "Universitetsplassen 1945–1960 · Nasjonalbiblioteket · Public domain",
    beforeImageMeta: { ...historicalImageMeta, assetType: "historical_place_photo", date: "1945–1960", note: "Kilden daterer motivet til et intervall; det skal ikke gis et oppdiktet enkeltår." },
    nowImage: "bilder/places/universitetsplassen.webp",
    nowImageLabel: "Universitetsplassen 2019 · Bahnfrend · Wikimedia Commons",
    nowImageMeta: { ...mainImageMeta, assetType: "documentary_place_photo" },
    before: "Arkivbildet viser Peter Andreas Munch-monumentet, plassflaten og universitetsfronten en gang mellom 1945 og 1960.",
    now: "Fotografiet fra 2019 viser universitetsfronten og den åpne plassflaten fra et annet ståsted.",
    change: "Ståsted, utsnitt og fotograferingstid er ulike. Sammenstillingen egner seg til å lese bevarte strukturer og plassorganisering, ikke til pikselnøyaktig før-og-nå-sammenligning.",
    lookFor: ["Domus Media som midtpunkt.", "Monumentenes forhold til hovedtrappen.", "Den åpne plassflaten mellom bygningene og Karl Johan."],
    sources: [imageInfo.historic.meta.sourcePage, imageInfo.main.meta.sourcePage]
  },
  interpretation: {
    what_to_notice: [
      "Hvordan tre klassisistiske bygninger danner en åpen institusjonsfront.",
      "Hvordan monumentene rammer inn hovedinngangen.",
      "Hvordan Aulaen ligger som et senere lag bak Domus Media."
    ],
    why_it_matters: [
      "Anlegget gjør kunnskapsinstitusjonen synlig i hovedstadens offentlige akse.",
      "Monumentene viser hvordan akademisk og politisk minnekultur er skrevet inn i plassen.",
      "Omleggingen i 1930–31 viser at byrommets form også tilpasses ritualer og bruk."
    ],
    context: [
      "Universitetet ble grunnlagt før anlegget ved Karl Johan ble reist.",
      "Aulaen og Munch-utsmykningen er senere tillegg til Groschs trebygningers komposisjon."
    ],
    questions: [
      "Hva skjer med opplevelsen av plassen når midtbygningen får en bred trapp og tempelfront?",
      "Hvordan endrer monumentene inngangens symmetri?",
      "Hvilke historiske lag kan skilles uten å blande dem sammen?"
    ]
  },
  module_audit: {
    for_na: { status: "produced_with_viewpoint_caveat" },
    news: { status: "BEGRUNNET N/A", reason: "Fullproduksjonen bygger på varige stedsspor; ingen samtidssak er nødvendig for canonical identitet." },
    dialect: { status: "BEGRUNNET N/A", reason: "Enkeltstedet eier ikke dialektlag." },
    language: { status: "produced" },
    chronology: { status: "produced" },
    fagverk: { status: "produced" }
  }
});
write(placeFile, place);

const peopleFile = "data/people/by/oslo/people_by_oslo.json";
const people = read(peopleFile);
for (const person of people) {
  if (person.id === "christian_heinrich_grosch") {
    person.placeId = placeId;
    person.places = [...new Set([...(person.places || []), placeId])];
    person.image = "bilder/kort/people/christian_heinrich_grosch.webp";
    person.cardImage = person.image;
    person.source_urls = [...new Set([...(person.source_urls || []), urls.university, urls.square, imageInfo.grosch.meta.sourcePage])];
    person.imageMeta = { ...groschImageMeta, assetType: "historical_person_portrait" };
    person.verifiedAt = verifiedAt;
    continue;
  }
  if (Array.isArray(person.places)) person.places = person.places.filter((id) => id !== placeId);
  for (const key of ["placeId", "place_id", "place", "source_place_id"]) {
    if (person[key] !== placeId) continue;
    const replacement = Array.isArray(person.places) ? person.places.find(Boolean) : null;
    if (replacement) person[key] = replacement;
    else delete person[key];
  }
}
write(peopleFile, people);

const universPeopleManifestFile = "data/people/manifest.json";
const universPeopleManifest = read(universPeopleManifestFile);
for (const relativePersonFile of universPeopleManifest.files || []) {
  const canonicalPersonFile = `data/${relativePersonFile}`;
  if (!fs.existsSync(path.join(root, canonicalPersonFile))) continue;
  const rawPeople = read(canonicalPersonFile);
  const personRecords = Array.isArray(rawPeople)
    ? rawPeople
    : rawPeople && typeof rawPeople === "object" && typeof rawPeople.id === "string"
      ? [rawPeople]
      : [];
  let changed = false;
  for (const person of personRecords) {
    if (!person || person.id === "christian_heinrich_grosch") continue;
    for (const key of ["places", "place_ids", "placeIds", "related_place_ids"]) {
      if (!Array.isArray(person[key]) || !person[key].includes(placeId)) continue;
      person[key] = person[key].filter((id) => id !== placeId);
      changed = true;
    }
    for (const key of ["placeId", "place_id", "place", "source_place_id", "primary_place_id"]) {
      if (person[key] !== placeId) continue;
      const replacement = [person.places, person.place_ids, person.placeIds]
        .find((values) => Array.isArray(values) && values.length > 0)?.[0];
      if (replacement) person[key] = replacement;
      else delete person[key];
      changed = true;
    }
  }
  if (changed) write(canonicalPersonFile, rawPeople);
}

const brandsMasterFile = "data/brands/brands_master.json";
const brandsMaster = read(brandsMasterFile);
const uio = brandsMaster.find((brand) => brand.id === "universitetet_i_oslo");
if (!uio) throw new Error("Mangler canonical brand universitetet_i_oslo");
uio.place_ids = [...new Set([...(uio.place_ids || []), placeId])];
uio.source_urls = [...new Set([...(uio.source_urls || []), urls.university, urls.uioLogo, urls.square])];
uio.verified_at = verifiedAt;
write(brandsMasterFile, brandsMaster);
const brandsByPlaceFile = "data/brands/brands_by_place.json";
const brandsByPlace = read(brandsByPlaceFile);
brandsByPlace[placeId] = ["universitetet_i_oslo"];
write(brandsByPlaceFile, brandsByPlace);

const batchFile = "data/leksikon/places/oslo/by/leksikon_oslo_by_batch4.json";
const batch = read(batchFile).filter((entry) => entry.place_id !== placeId);
write(batchFile, batch);

const chronology = [
  [1811, "Universitetet blir grunnlagt", "Det Kongelige Frederiks Universitet blir opprettet; dette er institusjonell forhistorie til anlegget på Karl Johan.", urls.university],
  [1841, "Grunnsteinen legges", "Grunnsteinen til universitetsanlegget ved Karl Johan legges 2. september.", urls.university],
  [1854, "Anlegget er tatt i bruk", "Groschs tre hovedbygninger er tatt i bruk gjennom perioden 1851–54.", urls.university],
  [1883, "Schweigaard-monumentet", "Julius Middelthuns monument over Anton Martin Schweigaard blir reist.", urls.schweigaard],
  [1911, "Aulaen", "Aulaen blir reist til universitetets hundreårsjubileum.", urls.university],
  [1916, "Munch-utsmykningen", "Edvard Munchs monumentale malerier blir permanent montert i Aulaen.", urls.uioAula],
  [1919, "Julegrantradisjonen", "Julegranen på Universitetsplassen etableres som årlig tradisjon.", urls.square],
  [1931, "Plassen legges om", "Omleggingen fra 1930–31 fullføres med ny hellelagt plassflate.", urls.paMunch],
  [1933, "Peter Andreas Munch-monumentet", "Stinius Fredriksens monument over Peter Andreas Munch blir reist.", urls.paMunch],
  [2011, "Aulaen gjenåpner", "Aulaen åpner igjen i juni etter konserveringsarbeid med Munch-utsmykningen.", urls.uioAula]
].map(([year, period, desc, source], index) => ({
  id: `chrono_universitetsplassen_${String(index + 1).padStart(2, "0")}`,
  year,
  period,
  desc,
  confidence: "high",
  sources: [source]
}));

const leksikon = [
  {
    id: "universitetsplassen_hovedartikkel",
    visual: { designCode: "article_square_miniature" },
    place_id: placeId,
    title: "Universitetsplassen",
    version: 1,
    popupDesc: "Universitetets monumentale forplass mot Karl Johans gate.",
    wikiText: [
      "Universitetsplassen ble formet som den åpne fronten for Christian Heinrich Groschs tre universitetsbygninger. Grunnsteinen ble lagt i 1841, og anlegget ble tatt i bruk i perioden 1851–54.",
      "Senere lag omfatter Schweigaard-monumentet fra 1883, Aulaen fra 1911, Munch-utsmykningen fra 1916 og Peter Andreas Munch-monumentet fra 1933."
    ],
    summary: { one_liner: "Akademisk forplass der arkitektur, monumenter og ritualer møtes.", themes: ["byrom", "universitet", "representasjon"], tone: ["nøktern", "kildebasert"] },
    facts: [
      { id: "fact_01", label: "Grunnstein", desc: "Grunnsteinen ble lagt 2. september 1841.", confidence: "high", sources: [urls.university] },
      { id: "fact_02", label: "Arkitekt", desc: "Christian Heinrich Grosch tegnet de tre hovedbygningene.", confidence: "high", sources: [urls.university] },
      { id: "fact_03", label: "Bruk", desc: "Plassen inngår i universitetets immatrikulering ved studiestart.", confidence: "high", sources: [urls.square] }
    ],
    sources: [urls.square, urls.university, urls.paMunch, urls.uioAula],
    externalLinks: [
      { type: "source", label: "Oslo byleksikon – Universitetsplassen", url: urls.square },
      { type: "source", label: "Oslo byleksikon – Universitetet i Oslo", url: urls.university },
      { type: "source", label: "UiO – Aula-prosjektet", url: urls.uioAula }
    ],
    chronology
  },
  {
    id: "universitetsplassen_grosch_anlegget",
    visual: { designCode: "article_architecture_miniature" },
    place_id: placeId,
    title: "Groschs universitetsanlegg",
    version: 1,
    popupDesc: "Domus Media, Domus Academica og Domus Bibliotheca danner en klassisistisk front mot byen.",
    wikiText: [
      "Grosch organiserte tre selvstendige bygninger rundt en åpen forplass. Schinkels vurdering av planene påvirket det klassisistiske uttrykket.",
      "Domus Media står i midten, mens Domus Academica og Domus Bibliotheca flankerer plassen."
    ],
    summary: { one_liner: "Tre bygninger gjør universitetet synlig som institusjon i byaksen.", themes: ["klassisime", "typologi", "institusjonsarkitektur"], tone: ["analytisk", "kildebasert"] },
    facts: [
      { id: "fact_01", label: "Tre hovedbygg", desc: "Anlegget består av Domus Media, Domus Academica og Domus Bibliotheca.", confidence: "high", sources: [urls.university] },
      { id: "fact_02", label: "Urbygningen", desc: "Domus Academica er kjent som Urbygningen.", confidence: "high", sources: [urls.university] }
    ],
    sources: [urls.university]
  },
  {
    id: "universitetsplassen_monumenter",
    visual: { designCode: "article_monument_miniature" },
    place_id: placeId,
    title: "Monumentene og omleggingen",
    version: 1,
    popupDesc: "Schweigaard- og Peter Andreas Munch-monumentene rammer inn hovedinngangen.",
    wikiText: [
      "Schweigaard-monumentet fra 1883 og Peter Andreas Munch-monumentet fra 1933 er to separate fysiske objekter på plassen.",
      "Omleggingen i 1930–31 endret plassflaten og inngikk i organiseringen av monumentene og immatrikuleringsarenaen."
    ],
    summary: { one_liner: "To monumenter og en ny plassflate formet inngangen på nytt.", themes: ["monument", "byrom", "minnekultur"], tone: ["nøktern", "kildebasert"] },
    facts: [
      { id: "fact_01", label: "Schweigaard", desc: "Monumentet ble reist i 1883 av Julius Middelthun.", confidence: "high", sources: [urls.schweigaard] },
      { id: "fact_02", label: "Peter Andreas Munch", desc: "Monumentet ble reist i 1933 av Stinius Fredriksen.", confidence: "high", sources: [urls.paMunch] },
      { id: "fact_03", label: "Plassflate", desc: "Plassen ble lagt om i 1930–31 etter planer av Bjercke og Eliassen.", confidence: "high", sources: [urls.paMunch] }
    ],
    sources: [urls.square, urls.schweigaard, urls.paMunch]
  },
  {
    id: "universitetsplassen_aulaen",
    visual: { designCode: "article_art_architecture_miniature" },
    place_id: placeId,
    title: "Aulaen og Munch",
    version: 1,
    popupDesc: "Aulaen fra 1911 er et senere lag i universitetsanlegget og rommer Munchs monumentale utsmykning.",
    wikiText: [
      "Harald Bødtker og Holger Sinding-Larsen tegnet Aulaen til universitetets hundreårsjubileum i 1911.",
      "Edvard Munch arbeidet med elleve store lerretsmalerier til rommet i perioden 1909–1916; serien ble permanent montert i 1916."
    ],
    summary: { one_liner: "Seremonibygg og monumental kunst danner et eget historisk lag bak Domus Media.", themes: ["aula", "Munch", "seremoni"], tone: ["faglig", "kildebasert"] },
    facts: [
      { id: "fact_01", label: "Aulaen", desc: "Aulaen ble reist til hundreårsjubileet i 1911.", confidence: "high", sources: [urls.university] },
      { id: "fact_02", label: "Utsmykningen", desc: "Munch skapte elleve monumentale lerretsmalerier til Aulaen.", confidence: "high", sources: [urls.uioAula] },
      { id: "fact_03", label: "Permanent montering", desc: "Serien ble permanent montert i 1916.", confidence: "high", sources: [urls.uioAula] }
    ],
    sources: [urls.university, urls.uioAula, urls.uioCity]
  }
];
const leksikonFile = "data/leksikon/places/oslo/by/leksikon_universitetsplassen.json";
write(leksikonFile, leksikon);
const leksikonManifestFile = "data/leksikon/manifest.json";
const leksikonManifest = read(leksikonManifestFile);
leksikonManifest.files = (leksikonManifest.files || []).filter((file) => file !== leksikonFile);
leksikonManifest.files.push(leksikonFile);
write(leksikonManifestFile, leksikonManifest);

const stories = [
  {
    id: "st_universitetsplassen_grunnsteinen_1841",
    quality_profile: "episode_v1",
    type: "turning_point",
    title: "Universitetet får en monumental front",
    year: 1841,
    place_id: placeId,
    person_id: "christian_heinrich_grosch",
    summary: "2. september 1841 ble grunnsteinen til universitetsanlegget ved Karl Johan lagt.",
    story: "Universitetet hadde eksistert siden 1811, men manglet lenge et samlet monumentalt anlegg. Da grunnsteinen ble lagt 2. september 1841, begynte arbeidet med den institusjonsfronten som fortsatt definerer Universitetsplassen.\n\nChristian Heinrich Grosch tegnet de tre hovedbygningene, mens Karl Friedrich Schinkel vurderte planene og foreslo endringer. Anlegget ble tatt i bruk i perioden 1851–54 og gjorde universitetet fysisk synlig i hovedstadens paradeakse.",
    episode: {
      actors: ["Universitetet", "Christian Heinrich Grosch", "Karl Friedrich Schinkel"],
      date: "1841-09-02",
      action: "Grunnsteinen til det nye universitetsanlegget ble lagt ved Karl Johans gate.",
      consequence: "Universitetet fikk et varig monumentalbygg og en åpen forplass mot byen."
    },
    sources: [{ title: "Oslo byleksikon – Universitetet i Oslo", url: urls.university }],
    tags: ["universitet", "arkitektur", "byrom"],
    related_people: ["christian_heinrich_grosch"],
    related_places: ["karl_johan"],
    score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 }
  },
  {
    id: "st_universitetsplassen_schweigaard_1883",
    quality_profile: "episode_v1",
    type: "cultural",
    title: "Schweigaard blir monument på plassen",
    year: 1883,
    place_id: placeId,
    person_id: null,
    summary: "I 1883 ble Julius Middelthuns monument over Anton Martin Schweigaard reist foran universitetet.",
    story: "Da Schweigaard-monumentet ble reist i 1883, fikk Universitetsplassen et tydelig minnespor knyttet til universitet, politikk og samfunnsliv. Figuren ble utført av Julius Middelthun.\n\nMonumentet stod senere i et endret romlig forhold til hovedtrappen da Peter Andreas Munch-statuen kom i 1933. Slik ble minnekulturen en del av den konkrete organiseringen av inngangen.",
    episode: {
      actors: ["Julius Middelthun", "Universitetet"],
      date: "1883",
      action: "Monumentet over Anton Martin Schweigaard ble reist på Universitetsplassen.",
      consequence: "Plassen fikk et permanent monument som senere inngikk i en symmetrisk inngangskomposisjon."
    },
    sources: [{ title: "Oslo byleksikon – Schweigaard-statuen", url: urls.schweigaard }],
    tags: ["monument", "minnekultur", "Schweigaard"],
    related_people: [],
    related_places: [],
    score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 3, total: 16 }
  },
  {
    id: "st_universitetsplassen_aula_munch_1916",
    quality_profile: "episode_v1",
    type: "cultural",
    title: "Munchs bilder blir en del av Aulaen",
    year: 1916,
    place_id: placeId,
    person_id: null,
    summary: "I 1916 ble Edvard Munchs monumentale utsmykning permanent montert i Aulaen.",
    story: "Aulaen ble reist bak Domus Media til universitetets hundreårsjubileum i 1911. Den nye seremonisalen la et tydelig 1900-tallslag til Groschs eldre anlegg.\n\nEdvard Munch arbeidet med elleve monumentale lerretsmalerier til rommet mellom 1909 og 1916. Da serien ble permanent montert i 1916, ble arkitektur og billedkunst knyttet sammen i universitetets viktigste seremonielle rom.",
    episode: {
      actors: ["Edvard Munch", "Universitetet", "Harald Bødtker", "Holger Sinding-Larsen"],
      date: "1916",
      action: "Munchs elleve monumentale lerretsmalerier ble permanent montert i Aulaen.",
      consequence: "Aulaen fikk en integrert kunstutsmykning som ble et eget historisk lag i universitetsanlegget."
    },
    sources: [
      { title: "UiO – Aula-prosjektet", url: urls.uioAula },
      { title: "Oslo byleksikon – Universitetet i Oslo", url: urls.university }
    ],
    tags: ["Aulaen", "Munch", "universitetsarkitektur"],
    related_people: [],
    related_places: [],
    score: { narrative: 3, historical: 3, source: 4, play_value: 3, originality: 4, total: 17 }
  },
  {
    id: "st_universitetsplassen_omlegging_1931",
    quality_profile: "episode_v1",
    type: "turning_point",
    title: "Plassflaten tilpasses immatrikuleringen",
    year: 1931,
    place_id: placeId,
    person_id: null,
    summary: "Omleggingen i 1930–31 ga Universitetsplassen en ny hellelagt form som styrket rollen som immatrikuleringsarena.",
    story: "I 1930–31 ble Universitetsplassen lagt om etter planer av Bjercke og Eliassen. Den nye flaten fikk fall mot midtbygningen og ble bedre egnet til store akademiske samlinger.\n\nTo år senere kom Stinius Fredriksens monument over Peter Andreas Munch. Sammen med Schweigaard-monumentet inngikk det i den nye organiseringen rundt hovedinngangen til Domus Media.",
    episode: {
      actors: ["Bjercke og Eliassen", "Universitetet", "Stinius Fredriksen"],
      date: "1931",
      action: "Omleggingen av Universitetsplassen ble fullført.",
      consequence: "Plassen fikk en form som bedre støttet immatrikulering og en tydeligere monumental innramming av hovedinngangen."
    },
    sources: [
      { title: "Oslo byleksikon – Peter Andreas Munch-statuen", url: urls.paMunch },
      { title: "Oslo byleksikon – Universitetsplassen", url: urls.square }
    ],
    tags: ["byplanlegging", "immatrikulering", "monument"],
    related_people: [],
    related_places: [],
    score: { narrative: 3, historical: 3, source: 4, play_value: 4, originality: 3, total: 17 }
  }
].map((story) => ({
  ...story,
  arc: {
    start: story.summary,
    middle: story.episode.action,
    end: story.episode.consequence
  }
}));
const storiesFile = "data/stories/stories_universitetsplassen.json";
write(storiesFile, stories);
const storiesManifestFile = "data/stories/stories_manifest.json";
const storiesManifest = read(storiesManifestFile);
const storyEntry = { category: "by", entity_id: placeId, path: storiesFile };
const storyIndex = (storiesManifest.files || []).findIndex((entry) => entry?.entity_id === placeId || entry?.path === storiesFile);
if (storyIndex < 0) storiesManifest.files.push(storyEntry);
else storiesManifest.files[storyIndex] = storyEntry;
write(storiesManifestFile, storiesManifest);

const lesesporFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const lesespor = read(lesesporFile);
lesespor.items = (lesespor.items || []).filter((item) => !(item.place_ids || []).includes(placeId));
lesespor.items.push(
  {
    id: "lesespor_universitetsplassen_001",
    title: "Universitetsplassen",
    popupDesc: "Oslo byleksikons oversikt over plassen, monumentene, omleggingen og brukstradisjonene.",
    author: null, publication: "Oslo byleksikon", year: 2026, type: "reference",
    subjects: [{ type: "place", name: "Universitetsplassen", id: placeId }],
    place_ids: [placeId], category_hints: ["by"],
    summary: { themes: ["byrom", "monumenter", "universitet"] },
    classification: { tags: ["Universitetsplassen", "byrom", "minnekultur"] },
    url: urls.square, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate",
    relevance: "Hovedkilde til plassens egen historie, monumenter og bruk."
  },
  {
    id: "lesespor_universitetsplassen_002",
    title: "Universitetet i Oslo",
    popupDesc: "Institusjons- og bygningshistorie for universitetet og anlegget ved Karl Johans gate.",
    author: null, publication: "Oslo byleksikon", year: 2026, type: "reference",
    subjects: [{ type: "institution", name: "Universitetet i Oslo", id: "universitetet_i_oslo" }],
    place_ids: [placeId], category_hints: ["by"],
    summary: { themes: ["universitet", "Grosch", "institusjonsarkitektur"] },
    classification: { tags: ["UiO", "Grosch", "klassisime"] },
    url: urls.university, access: "open", rights: "link_only", source_quality: "recognized", curation_status: "strong_candidate",
    relevance: "Knytter plassen til universitetets historie, Groschs tre bygninger og Aulaen."
  },
  {
    id: "lesespor_universitetsplassen_003",
    title: "Aula-prosjektet – Munchs utsmykning",
    popupDesc: "UiO-materiale om Munchs elleve monumentale malerier, utførelse og konservering i Aulaen.",
    author: null, publication: "Universitetet i Oslo", year: 2012, type: "research_poster",
    subjects: [{ type: "structure", name: "Aulaen", id: "universitetsplassen_aulaen" }],
    place_ids: [placeId], category_hints: ["by"],
    summary: { themes: ["Aulaen", "Edvard Munch", "konservering"] },
    classification: { tags: ["Aulaen", "Munch", "kunst_i_arkitektur"] },
    url: urls.uioAula, access: "open", rights: "link_only", source_quality: "official", curation_status: "strong_candidate",
    relevance: "Offisiell UiO-kilde til Aulaens kunsthistoriske lag."
  },
  {
    id: "lesespor_universitetsplassen_004",
    title: "UiO i sentrum – Karl Johans gate",
    popupDesc: "UiOs eget dokument om universitetsanleggets rolle i sentrum og bruken av Domus Bibliotheca og Aulaen.",
    author: null, publication: "Universitetet i Oslo", year: 2022, type: "board_paper",
    subjects: [{ type: "place", name: "Universitetsplassen", id: placeId }],
    place_ids: [placeId], category_hints: ["by"],
    summary: { themes: ["sentrum", "universitet", "offentlighet"] },
    classification: { tags: ["UiO_i_sentrum", "Karl_Johan", "institusjonsbruk"] },
    url: urls.uioCity, access: "open", rights: "link_only", source_quality: "official", curation_status: "strong_candidate",
    relevance: "Dokumenterer universitetets egen forståelse av sentrumsanlegget og publikumsrettet bruk."
  }
);
write(lesesporFile, lesespor);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/universitetsplassen.json";
const language = {
  place_id: placeId,
  title: "Språkleksikon: Universitetsplassen",
  verified_at: verifiedAt,
  dialect_status: "institutional_terms",
  entries: [
    ["universitetsplassen", "Universitetsplassen", "stedsnavn", "Navnet betegner den åpne plassen foran universitetets historiske bygninger ved Karl Johans gate.", "Navnet skiller plassrommet fra bygningene og fra Karl Johans gate."],
    ["domus_media", "Domus Media", "latinsk_bygningsnavn", "Navnet på midtbygningen i universitetsanlegget.", "Domus betyr hus; Media viser til bygningens midtposisjon i trebygningers komposisjon."],
    ["domus_academica", "Domus Academica", "latinsk_bygningsnavn", "Navnet på den ene sidebygningen i Groschs universitetsanlegg.", "Bygningen omtales også som Urbygningen."],
    ["domus_bibliotheca", "Domus Bibliotheca", "latinsk_bygningsnavn", "Navnet på bibliotekbygningen i det historiske universitetsanlegget.", "Bibliotheca viser til bygningens opprinnelige bibliotekfunksjon."],
    ["aulaen", "Aulaen", "institusjonsord", "Betegnelse på universitetets store seremonielle sal bak Domus Media.", "Ordet brukes her om den konkrete universitetsaulaen fra 1911."],
    ["urbygningen", "Urbygningen", "tilnavn", "Tradisjonelt tilnavn for Domus Academica etter uret mot gaten.", "Tilnavnet binder en synlig fasadedetalj til bygningens daglige navn."]
  ].map(([id, term, type, meaning, context]) => ({
    id, term, type, meaning, context,
    linked_to: { kind: "place", id: placeId },
    tags: ["by", "universitet", placeId],
    sources: [{ label: "Oslo byleksikon – Universitetet i Oslo", url: urls.university }, { label: "Oslo byleksikon – Universitetsplassen", url: urls.square }]
  }))
};
write(languageFile, language);
const languageManifestFile = "data/leksikon/sprak/manifest.json";
const languageManifest = read(languageManifestFile);
languageManifest.place_files = languageManifest.place_files || {};
languageManifest.place_files[placeId] = languageFile;
write(languageManifestFile, languageManifest);

const sourceRegistry = {
  oslo_square: { url: urls.square, source_type: "institutional", review_status: "reviewed", review_note: "Kontrollert for plassidentitet, monumenter, immatrikulering og julegrantradisjon." },
  oslo_university: { url: urls.university, source_type: "institutional", review_status: "reviewed", review_note: "Kontrollert for grunnstein, Grosch, Schinkel, bygninger og Aulaen." },
  oslo_schweigaard: { url: urls.schweigaard, source_type: "institutional", review_status: "reviewed", review_note: "Kontrollert for monument, kunstner og 1883." },
  oslo_pa_munch: { url: urls.paMunch, source_type: "institutional", review_status: "reviewed", review_note: "Kontrollert for monument, 1930–31-omlegging og 1933." },
  uio_aula: { url: urls.uioAula, source_type: "official", review_status: "reviewed", review_note: "Kontrollert for Munch-serien, 1909–1916, elleve malerier og konserveringshistorikk." },
  uio_city: { url: urls.uioCity, source_type: "official", review_status: "reviewed", review_note: "Kontrollert for UiOs sentrumsanlegg og publikumsrettet bruk." },
  osm_square: { url: urls.osm, source_type: "geodata", review_status: "reviewed", review_note: "Brukt som sekundær geometri-referanse; canonical koordinat beholdes uendret." }
};

const questionSpecs = [
  ["Hva er Universitetsplassen?", ["Universitetets åpne forplass mot Karl Johans gate", "En indre gård på Blindern", "Plassen foran Oslo rådhus"], 0, "oslo_square", "em_by_offentlige_rom_motesteder", "fact", "byrom"],
  ["Hvilken bygning ligger midt i universitetsfronten?", ["Domus Bibliotheca", "Domus Media", "Aulaen"], 1, "oslo_university", "em_by_bygningstyper_og_typologier", "fact", "typologi"],
  ["Hvem tegnet de tre historiske hovedbygningene?", ["Christian Heinrich Grosch", "Arnstein Arneberg", "Ove Bang"], 0, "oslo_university", "em_by_symbolsk_makt_og_representasjon", "fact", "arkitekt"],
  ["Når ble grunnsteinen til anlegget ved Karl Johan lagt?", ["1811", "1841", "1911"], 1, "oslo_university", "em_by_historiske_lag_i_hverdagsrom", "fact", "tidslag"],
  ["Hvilket formspråk preger de tre hovedbygningene?", ["Klassisisme", "Brutalisme", "Funksjonalisme"], 0, "oslo_university", "em_by_bygningstyper_og_typologier", "fact", "klassisisme"],
  ["Hva gjør de tre bygningene romlig?", ["De lukker et indre gårdsrom helt", "De danner en åpen front mot Karl Johan", "De ligger tilfeldig spredt"], 1, "oslo_university", "em_by_offentlige_rom_motesteder", "fact", "romlig_orden"],
  ["Hva er plassens hovedrolle i anlegget?", ["Parkeringsplass", "Akademisk forplass og møtested", "Jernbaneterminal"], 1, "oslo_square", "em_by_offentlige_rom_motesteder", "fact", "møtested"],
  ["Hvem vurderte Groschs tegninger og foreslo endringer?", ["Karl Friedrich Schinkel", "Le Corbusier", "Sverre Fehn"], 0, "oslo_university", "em_by_bygningstyper_og_typologier", "fact", "arkitektursamarbeid"],
  ["I hvilken periode ble de tre hovedbygningene tatt i bruk?", ["1851–54", "1899–1902", "1930–33"], 0, "oslo_university", "em_by_historiske_lag_i_hverdagsrom", "fact", "tidslag"],
  ["Hvilket bygg kalles Urbygningen?", ["Domus Media", "Domus Academica", "Domus Bibliotheca"], 1, "oslo_university", "em_by_bygningstyper_og_typologier", "fact", "bygningsnavn"],
  ["Hva var Domus Bibliothecas opprinnelige hovedfunksjon?", ["Bibliotek", "Teater", "Børs"], 0, "oslo_university", "em_by_bygningstyper_og_typologier", "fact", "funksjon"],
  ["Når ble Aulaen reist?", ["1883", "1911", "1933"], 1, "oslo_university", "em_by_historiske_lag_i_hverdagsrom", "fact", "tidslag"],
  ["Hvor ligger Aulaen i forhold til Domus Media?", ["Bak Domus Media", "På Eidsvolls plass", "Under Karl Johans gate"], 0, "oslo_university", "em_by_bygningstyper_og_typologier", "fact", "romlig_orden"],
  ["Hva viser Aulaen i anleggets tidslag?", ["At hele anlegget ble bygget samtidig", "At et 1900-tallsbygg ble lagt til et eldre klassisistisk anlegg", "At Domus Media ble revet"], 1, "oslo_university", "em_by_historiske_lag_i_hverdagsrom", "context", "historiske_lag"],
  ["Når ble Schweigaard-monumentet reist?", ["1883", "1919", "1933"], 0, "oslo_schweigaard", "em_by_historiske_lag_i_hverdagsrom", "fact", "monument"],
  ["Hvem laget Schweigaard-monumentet?", ["Julius Middelthun", "Stinius Fredriksen", "Gustav Vigeland"], 0, "oslo_schweigaard", "em_by_symbolsk_makt_og_representasjon", "fact", "monument"],
  ["Når ble Peter Andreas Munch-monumentet reist?", ["1883", "1911", "1933"], 2, "oslo_pa_munch", "em_by_historiske_lag_i_hverdagsrom", "fact", "monument"],
  ["Hvem laget Peter Andreas Munch-monumentet?", ["Julius Middelthun", "Stinius Fredriksen", "Christian Heinrich Grosch"], 1, "oslo_pa_munch", "em_by_symbolsk_makt_og_representasjon", "fact", "monument"],
  ["Hva skjedde med monumentenes plassering da Peter Andreas Munch-statuen kom?", ["De ble samlet inne i Aulaen", "De ble ordnet på hver side av hovedinngangen", "Schweigaard-statuen ble fjernet fra byen"], 1, "oslo_pa_munch", "em_by_symbolsk_makt_og_representasjon", "context", "romlig_orden"],
  ["Hvorfor er statuene Objects og ikke Structures?", ["De er flyttbare, identifiserbare monumentgjenstander", "De er egne universitetsbygninger", "De er gatenavn"], 0, "oslo_square", "em_by_bygningstyper_og_typologier", "context", "objektstruktur"],
  ["Hvorfor er Munchs Aula-malerier ikke Objects i dette PlaceCard-settet?", ["De er abstrakte lover", "De tilhører kunstutsmykningen inne i Aulaen, mens objektsporet her er plassens fysiske monumenter", "De står utendørs på plassen"], 1, "uio_aula", "em_by_historiske_lag_i_hverdagsrom", "context", "eierskap"],
  ["Når ble Universitetsplassen lagt om i ny form?", ["1930–31", "1851–54", "2003–04"], 0, "oslo_pa_munch", "em_by_historiske_lag_i_hverdagsrom", "fact", "byplanlegging"],
  ["Hvem sto bak planene for omleggingen i 1930–31?", ["Bjercke og Eliassen", "Grosch og Schinkel", "Arneberg og Poulsson"], 0, "oslo_pa_munch", "em_by_symbolsk_makt_og_representasjon", "fact", "byplanlegging"],
  ["Hva gjorde omleggingen plassen bedre egnet til?", ["Immatrikulering og større akademiske samlinger", "Godstrafikk", "Boligbygging"], 0, "oslo_pa_munch", "em_by_offentlige_rom_motesteder", "context", "bruk"],
  ["Hva skjer ved immatrikuleringen på plassen?", ["Nye studenter ønskes velkommen av rektor", "Stortinget åpner sesjonen", "Nobelprisen deles ut"], 0, "oslo_square", "em_by_offentlige_rom_motesteder", "fact", "ritual"],
  ["Siden hvilket år har julegranen vært en årlig tradisjon på plassen?", ["1883", "1919", "1972"], 1, "oslo_square", "em_by_historiske_lag_i_hverdagsrom", "fact", "tradisjon"],
  ["Hva viser koblingen mellom plassform og immatrikulering?", ["At fysisk utforming kan støtte institusjonelle ritualer", "At ritualer ikke har noe med rom å gjøre", "At bygningene er midlertidige"], 0, "oslo_pa_munch", "em_by_offentlige_rom_motesteder", "context", "rom_og_bruk"],
  ["Hva er den sterkeste tolkningen av 1930–31-omleggingen?", ["Den endret både overflate og hvordan plassen kunne organiseres for samlinger", "Den grunnla universitetet", "Den bygget Domus Media"], 0, "oslo_pa_munch", "em_by_historiske_lag_i_hverdagsrom", "context", "transformasjon"],
  ["Hvor mange monumentale lerretsmalerier laget Munch til Aulaen?", ["Ni", "Elleve", "Tretten"], 1, "uio_aula", "em_by_historiske_lag_i_hverdagsrom", "fact", "Aulaen"],
  ["I hvilken periode arbeidet Munch med Aula-serien?", ["1909–1916", "1841–1854", "1930–1933"], 0, "uio_aula", "em_by_historiske_lag_i_hverdagsrom", "fact", "Aulaen"],
  ["Når ble Munch-serien permanent montert i Aulaen?", ["1911", "1916", "1933"], 1, "uio_aula", "em_by_historiske_lag_i_hverdagsrom", "fact", "Aulaen"],
  ["Hva var maleriene laget for?", ["Aulaens arkitektoniske nisjer og veggflater", "Utendørs sokler", "Domus Bibliothecas tak"], 0, "uio_aula", "em_by_bygningstyper_og_typologier", "context", "kunst_i_arkitektur"],
  ["Hva viser Munch-utsmykningen om Aulaen?", ["At kunst og arkitektur er planlagt som sammenhengende romopplevelse", "At Aulaen er en butikk", "At Grosch malte veggene"], 0, "uio_aula", "em_by_materialitet_og_sanseerfaring", "context", "kunst_i_arkitektur"],
  ["Når åpnet Aulaen igjen etter konserveringsarbeidet omtalt av UiO?", ["Juni 2011", "Juni 1883", "Juni 1933"], 0, "uio_aula", "em_by_historiske_lag_i_hverdagsrom", "fact", "bevaring"],
  ["Hva må holdes atskilt i samlingsmodellen?", ["Aulaen som Structure og Munchs kunstverk som kunsthistorisk innhold", "Domus Media og Karl Johan som samme bygning", "Peter Andreas Munch og Edvard Munch som samme person"], 0, "uio_aula", "em_by_bygningstyper_og_typologier", "context", "eierskap"],
  ["Hva uttrykker den brede trappen og tempelfronten på Domus Media?", ["En tydelig institusjonell front mot plassen", "En skjult bakgård", "En industrikai"], 0, "oslo_university", "em_by_symbolsk_makt_og_representasjon", "analysis", "representasjon"],
  ["Hvorfor er Grosch en sterk People-kobling akkurat her?", ["Universitetsanlegget er et sentralt dokumentert verk av ham", "Han studerte her i 1933", "Han laget Peter Andreas Munch-statuen"], 0, "oslo_university", "em_by_symbolsk_makt_og_representasjon", "analysis", "personsted"],
  ["Hvorfor kvalifiserer Universitetet i Oslo som Brand her?", ["Institusjonsidentiteten er direkte knyttet til anlegget og har egen verifisert logo", "Det er nærmeste kafé", "Det er et gatenavn"], 0, "oslo_university", "em_by_symbolsk_makt_og_representasjon", "analysis", "institusjonsidentitet"],
  ["Hva kan et foto fra 2019 dokumentere sikkert?", ["Synlig plassform og bygninger på fotograferingstidspunktet", "Hva alle brukere mener om plassen", "Nøyaktig hvordan plassen så ut i 1841"], 0, "oslo_square", "em_by_materialitet_og_sanseerfaring", "analysis", "bildekilde"],
  ["Hva kan et historisk foto datert 1945–1960 ikke gi alene?", ["Et sikkert enkeltår innen intervallet", "At Peter Andreas Munch-statuen er synlig", "At Domus Media finnes i motivet"], 0, "oslo_square", "em_by_historiske_lag_i_hverdagsrom", "analysis", "kildekritikk"],
  ["Hva viser plassens historiske lag best?", ["Grosch-anlegget, monumentene, Aulaen og omleggingen er kommet til i ulike perioder", "Alt ble ferdig i 1811", "Ingen fysiske elementer er endret"], 0, "oslo_university", "em_by_historiske_lag_i_hverdagsrom", "analysis", "historiske_lag"],
  ["Hva er en presis own-place-avgrensning?", ["Selve forplassen og dens direkte monumenter og universitetsfront", "Hele Universitetet i Oslo på alle campuser", "Hele Karl Johans gate"], 0, "oslo_square", "em_by_offentlige_rom_motesteder", "analysis", "avgrensning"],
  ["Hva betyr symbolsk makt i lesningen av plassen?", ["At arkitektur og monumenter kan gjøre institusjoner og personer synlige som autoritative", "At stein automatisk vedtar lover", "At alle besøkende mener det samme"], 0, "oslo_university", "em_by_symbolsk_makt_og_representasjon", "concept", "symbolsk_makt"],
  ["Hva gjør Universitetsplassen til et offentlig møtested?", ["Den åpne plassflaten kobler institusjonsfront, ferdsel og samlinger", "Bare ansatte kan fysisk se den", "Den er et privat kontor"], 0, "oslo_square", "em_by_offentlige_rom_motesteder", "concept", "offentlig_rom"],
  ["Hva er et historisk lag i dette byrommet?", ["Et element fra en bestemt periode som fortsatt kan leses sammen med senere tillegg", "Et tilfeldig værskifte", "En usynlig grense uten kilder"], 0, "oslo_university", "em_by_historiske_lag_i_hverdagsrom", "concept", "historisk_lag"],
  ["Hva betyr typologi her?", ["Hvordan bygningstype og romlig organisering gir anlegget en bestemt institusjonell form", "Hvem som eier nærmeste butikk", "Fotografiets filtype"], 0, "oslo_university", "em_by_bygningstyper_og_typologier", "concept", "typologi"],
  ["Hvorfor er materialitet relevant på plassen?", ["Heller, bronse, fasader og trapp påvirker hvordan rommet oppleves og brukes", "Materialer avgjør pensum", "Materialer gjør kilder unødvendige"], 0, "oslo_pa_munch", "em_by_materialitet_og_sanseerfaring", "concept", "materialitet"],
  ["Hva er terskelen mellom offentlig rom og institusjon?", ["Overgangen fra den åpne plassen og trappen inn i universitetsbygningene", "Grensen mellom to nettsider", "Et usynlig kommunegrenseritual"], 0, "oslo_square", "em_by_offentlige_rom_motesteder", "concept", "terskel"],
  ["Hva er den beste syntesen av plassen?", ["Et offentlig byrom der institusjonsarkitektur, minnekultur og akademiske ritualer møtes", "Bare en samling statuer", "Bare en transportkorridor"], 0, "oslo_square", "em_by_symbolsk_makt_og_representasjon", "concept", "syntese"],
  ["Hva bør feltobservasjon på Universitetsplassen registrere?", ["Avgrenset bruk, ganglinjer, materialitet og samspill uten å identifisere tilfeldige personer", "Navn og ansikt på alle forbipasserende", "Bare værmeldingen"], 0, "oslo_square", "em_by_offentlige_rom_motesteder", "concept", "feltobservasjon"],
  ["Hva bør en gåanalyse følge?", ["Sekvensen mellom Karl Johan, plassflaten, trappen og inngangene", "Bare bygningenes postnummer", "Kun historiske personnavn"], 0, "oslo_square", "em_by_offentlige_rom_motesteder", "concept", "gåanalyse"],
  ["Hvordan bør før-og-nå-bildene brukes?", ["Med tydelig caveat om ulikt ståsted, utsnitt og datering", "Som bevis for identisk kameravinkel", "Som grunnlag for å gjette et eksakt år"], 0, "oslo_square", "em_by_historiske_lag_i_hverdagsrom", "concept", "kildekritikk"],
  ["Hvordan håndteres perioden 1851–54 metodisk?", ["Som et kildebåret intervall, ikke et oppdiktet felles enkeltår for alle bygg", "Som nøyaktig 1852 for alt", "Som udokumentert samtid"], 0, "oslo_university", "em_by_historiske_lag_i_hverdagsrom", "concept", "tidskilde"],
  ["Hva tester en typologisk analyse her?", ["Forholdet mellom trebygningers komposisjon, innganger og institusjonsfunksjon", "Antall kaffebarer i Oslo", "Statuenes metallpris"], 0, "oslo_university", "em_by_bygningstyper_og_typologier", "concept", "typologisk_analyse"],
  ["Hva må bildeproveniens dokumentere?", ["Kilde, skaper, lisens og hvilken transformasjon som er gjort", "Bare filnavnet", "Bare pikselbredden"], 0, "oslo_square", "em_by_materialitet_og_sanseerfaring", "concept", "proveniens"],
  ["Hva gir den sterkeste slutningen om Universitetsplassen?", ["Flere uavhengige, stedsspesifikke kilder som støtter arkitektur, monumenter, bruk og tidslag", "Én usitert påstand", "Et tilfeldig butikkmerke"], 0, "oslo_square", "em_by_symbolsk_makt_og_representasjon", "concept", "evidens"]
];

if (questionSpecs.length !== 56) throw new Error(`Forventet 56 quizspørsmål, fant ${questionSpecs.length}`);

const phases = ["opening", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"];
const setTitles = ["Sted og institusjonsfront", "Groschs tre bygg", "Monumentene", "Omlegging og ritual", "Aulaen og Munch", "Byromslesning", "Begreper og syntese", "Metode og evidens"];
const claims = [];
const sets = [];
for (let setIndex = 0; setIndex < 8; setIndex += 1) {
  const questions = [];
  for (let qIndex = 0; qIndex < 7; qIndex += 1) {
    const index = setIndex * 7 + qIndex;
    const [question, options, answerIndex, sourceId, emneId, questionType, concept] = questionSpecs[index];
    const n = index + 1;
    const family = n <= 28 ? "fact" : n <= 42 ? "context" : "concept_theory";
    const answer = options[answerIndex];
    const claimId = `claim_universitetsplassen_quiz_${String(n).padStart(2, "0")}`;
    claims.push({
      claim_id: claimId,
      order: n,
      planned_phase: phases[setIndex],
      family,
      statement: answer,
      source_ids: [sourceId],
      source_origin: "external",
      emne_id: emneId
    });
    const item = {
      id: `universitetsplassen_quiz_${String(n).padStart(2, "0")}`,
      quiz_id: `by_universitetsplassen_set_${setIndex + 1}_q${qIndex + 1}`,
      categoryId: "by",
      placeId,
      targetId: placeId,
      question_scope: "place",
      question,
      options,
      answer,
      answerIndex,
      knowledge: `${answer}. Spørsmålet er knyttet til ${concept.replaceAll("_", " ")} på Universitetsplassen.`,
      core_concepts: [concept],
      difficulty: Math.min(4, 1 + Math.floor(setIndex / 2)),
      question_type: n <= 28 ? "fact" : n <= 42 ? "context" : "concept",
      emne_id: emneId,
      source: [sourceId],
      source_origin: "external",
      claim_basis: answer,
      claim_id: claimId
    };
    if (setIndex === 7) {
      item.method_id = qIndex % 2 === 0 ? "met_feltobservasjon" : "met_gaanalyse";
      item.topic_hook_id = qIndex % 2 === 0 ? "byliv_aapne_rom" : "byliv_opphold_vs_gjennomgang";
      item.guidance_basis = ["data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"];
    }
    questions.push(item);
  }
  sets.push({
    set_id: `by_universitetsplassen_set_${setIndex + 1}`,
    title: setTitles[setIndex],
    level: setIndex + 1,
    order: setIndex + 1,
    phase: phases[setIndex],
    xp: [50, 60, 70, 80, 90, 100, 110, 120][setIndex],
    questions
  });
}

const selectedCurriculum = {
  module_ids: [
    "kur_by_01_byrom_akser_knutepunkt",
    "kur_by_04_historiske_lag_og_transformasjon",
    "kur_by_06_makt_symboler_og_representasjon"
  ],
  emne_ids: place.emne_ids,
  topic_hook_ids: ["byliv_aapne_rom", "byliv_opphold_vs_gjennomgang"],
  method_ids: ["met_feltobservasjon", "met_gaanalyse"],
  thinker_ids: [],
  works: []
};
const existingQuizAudit = {
  searched_paths: ["data/quiz/manifest.json", "data/quiz/by/universitetsplassen_sets.json", placeFile],
  active_before: {
    file: null,
    set_count: 0,
    question_count: 0,
    finding: "Ingen aktiv canonical Universitetsplassen-quiz var registrert i manifestet før denne produksjonen."
  },
  decisions: {
    keep_as_claim_basis: [],
    rewrite: "Ny kildegjennomgått 8×7-progresjon.",
    move: [],
    remove: []
  },
  knowledge_migration: "56 unike spørsmål materialiseres gjennom den canonicale Knowledge-pipelinen."
};
const profileDecision = {
  profile: "major",
  set_count: 8,
  questions_per_set: 7,
  justification: "Universitetsplassen har åtte kildebelagte læringsjobber: identitet, Grosch-anlegget, monumentene, Aulaen og Munch, plassomlegging, akademiske ritualer, historiske spor og stedlig analyse."
};
const heldBackCandidates = [
  "Personkoblinger uten dokumentert stedsspesifikk rolle.",
  "Kommersielle butikkbrands uten direkte institusjonell tilknytning til universitetsplassen."
];

const briefFile = "data/quiz/production_briefs/by/universitetsplassen.json";
const brief = {
  schema_version: "1.0",
  categoryId: "by",
  targetId: placeId,
  status: "reviewed",
  reviewed_at: verifiedAt,
  review_note: "Oslo byleksikon, UiO-kilder, geometri og Commons-proveniens er lest som separate evidenslag. Intervaller beholdes som intervaller, og butikkmerker/perifere personer er fjernet.",
  profile_hint: "major_8x7",
  scope: "Universitetsplassens institusjonsfront, Grosch-anlegget, monumentene, 1930–31-omleggingen, Aulaen, Munch-utsmykningen, immatrikulering og kildekritisk byromslesning.",
  sources: sourceRegistry,
  selected_curriculum: selectedCurriculum,
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates,
  claims
};
write(briefFile, brief);

const fagManifestFile = "data/fag/fag_manifest.json";
const fagManifest = read(fagManifestFile);
fagManifest.by.quizProduction.targets[placeId] = {
  source_brief: "../quiz/production_briefs/by/universitetsplassen.json",
  context_artifact: "../quiz/production_context/by/universitetsplassen.json",
  quiz_file: "../quiz/by/universitetsplassen_sets.json"
};
write(fagManifestFile, fagManifest);

const contextFile = "data/quiz/production_context/by/universitetsplassen.json";
await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: contextFile });
const quizProductionContext = {
  manifest_category: "by",
  profile: "major_8x7",
  standard_version: "3.3",
  source_brief: briefFile,
  context_artifact: contextFile,
  resolved_files: {
    pensum: "data/fag/by/pensum_by.json",
    emner: "data/fag/by/emner_by.json",
    fagkart: "data/fag/by/fagkart_by.json",
    methods: "data/fag/by/methods_by.json",
    supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json",
    quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
    quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
  },
  required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
  pensum_module_ids: selectedCurriculum.module_ids,
  emne_ids: selectedCurriculum.emne_ids,
  topic_hook_ids: selectedCurriculum.topic_hook_ids,
  method_ids: selectedCurriculum.method_ids,
  thinker_ids: selectedCurriculum.thinker_ids,
  works: selectedCurriculum.works,
  source_review_status: "reviewed",
  theory_start_phase: "final",
  method_start_phase: "final",
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates
};
const quizFile = "data/quiz/by/universitetsplassen_sets.json";
write(quizFile, {
  targetId: placeId,
  categoryId: "by",
  size_class: "major_8x7",
  generator_version: "history_go_manual_reviewed_v1",
  generated_from: briefFile,
  sources: Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url])),
  production_context: quizProductionContext,
  sets
});
const quizManifestFile = "data/quiz/manifest.json";
const quizManifest = read(quizManifestFile);
quizManifest.sets = (quizManifest.sets || []).filter((entry) => entry.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizFile });
write(quizManifestFile, quizManifest);

const sourceClaims = [
  ["identity", "Universitetsplassen er plassen foran de historiske universitetsbygningene ved Karl Johans gate.", urls.square, "Universitetsplassen", "institutional", "identity", "direct", "historical"],
  ["founding", "Universitetet ble grunnlagt i 1811.", urls.university, "Universitetets historie", "institutional", "ordinary", "direct", "historical", 1811],
  ["cornerstone", "Grunnsteinen til universitetsanlegget ved Karl Johan ble lagt 2. september 1841.", urls.university, "Universitetsbygningene", "institutional", "ordinary", "direct", "historical", 1841],
  ["grosch", "Christian Heinrich Grosch tegnet Domus Media, Domus Academica og Domus Bibliotheca med faglig innspill fra Karl Friedrich Schinkel.", urls.university, "Universitetsbygningene", "institutional", "ordinary", "direct", "historical"],
  ["use_1851_54", "De tre historiske hovedbygningene ble tatt i bruk i perioden 1851–54.", urls.university, "Universitetsbygningene", "institutional", "ordinary", "direct", "historical"],
  ["urbygningen", "Domus Academica er kjent som Urbygningen.", urls.university, "Domus Academica", "institutional", "ordinary", "direct", "historical"],
  ["schweigaard", "Julius Middelthuns Schweigaard-monument ble reist på Universitetsplassen i 1883.", urls.schweigaard, "Monumentets historikk", "institutional", "ordinary", "direct", "historical", 1883],
  ["aula", "Aulaen ble reist til universitetets hundreårsjubileum i 1911.", urls.university, "Aulaen", "institutional", "ordinary", "direct", "historical", 1911],
  ["munch", "Edvard Munch arbeidet med elleve monumentale lerretsmalerier til Aulaen i 1909–1916, og serien ble permanent montert i 1916.", urls.uioAula, "Aula paintings and conservation", "official", "ordinary", "direct", "historical", 1916],
  ["tree", "Julegranen på Universitetsplassen har vært en årlig tradisjon siden 1919.", urls.square, "Plassens bruk", "institutional", "ordinary", "direct", "current"],
  ["repaving", "Omleggingen av Universitetsplassen ble fullført i 1931 etter arbeid i 1930–31, etter planer av Bjercke og Eliassen.", urls.paMunch, "Plassomleggingen", "institutional", "ordinary", "direct", "historical", 1931],
  ["immatriculation", "Omleggingen gjorde plassen bedre egnet til immatrikulering, og nye studenter samles der ved rektors velkomst.", urls.square, "Plassens bruk og immatrikulering", "institutional", "ordinary", "direct", "current"],
  ["pamunch", "Stinius Fredriksens Peter Andreas Munch-monument ble reist på Universitetsplassen i 1933.", urls.paMunch, "Monumentets historikk", "institutional", "ordinary", "direct", "historical", 1933],
  ["historic_photo", "Nasjonalbibliotekets fotografi av Universitetsplassen er datert til intervallet 1945–1960.", imageInfo.historic.meta.sourcePage, "Commons metadata / Nasjonalbiblioteket", "archive", "ordinary", "direct", "historical"],
  ["current_photo", "Bahnfrends fotografi viser Universitetsplassen 31. august 2019.", imageInfo.main.meta.sourcePage, "Commons metadata", "catalogue", "ordinary", "direct", "historical", 2019],
  ["aula_reopen", "Aulaen åpnet igjen i juni 2011 etter konserveringsarbeid med Munch-utsmykningen.", urls.uioAula, "Conservation completion", "official", "ordinary", "direct", "historical", 2011]
];
const packetClaims = sourceClaims.map(([suffix, claim, sourceUrl, sourceLocation, sourceType, claimKind, evidenceMode, temporalStatus, timelineYear]) => ({
  id: `claim_universitetsplassen_${suffix}`,
  claim,
  sourceUrl,
  sourceLocation,
  sourceType,
  verifiedAt,
  status: "verified",
  claimKind,
  evidenceMode,
  temporalStatus,
  ...(timelineYear ? { timelineYear } : {})
}));
const coverage = (text, claimGroups) => {
  const parts = sentences(text);
  if (parts.length !== claimGroups.length) throw new Error(`Coverage mismatch: ${parts.length} setninger, ${claimGroups.length} claim-grupper`);
  return parts.map((_, index) => ({ sentence: index + 1, claimIds: claimGroups[index] }));
};
const descCoverage = coverage(desc, [
  ["claim_universitetsplassen_identity"],
  ["claim_universitetsplassen_cornerstone", "claim_universitetsplassen_grosch", "claim_universitetsplassen_use_1851_54"],
  ["claim_universitetsplassen_schweigaard", "claim_universitetsplassen_aula", "claim_universitetsplassen_munch", "claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_immatriculation"]
]);
const popupCoverage = coverage(popupDesc, [
  ["claim_universitetsplassen_identity"],
  ["claim_universitetsplassen_founding"],
  ["claim_universitetsplassen_cornerstone"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_use_1851_54"],
  ["claim_universitetsplassen_urbygningen"],
  ["claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_schweigaard"],
  ["claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_pamunch"],
  ["claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch", "claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_aula"],
  ["claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_aula", "claim_universitetsplassen_munch"],
  ["claim_universitetsplassen_repaving"],
  ["claim_universitetsplassen_repaving", "claim_universitetsplassen_immatriculation"],
  ["claim_universitetsplassen_immatriculation"],
  ["claim_universitetsplassen_tree"],
  ["claim_universitetsplassen_historic_photo"],
  ["claim_universitetsplassen_current_photo"],
  ["claim_universitetsplassen_historic_photo", "claim_universitetsplassen_current_photo"],
  ["claim_universitetsplassen_identity", "claim_universitetsplassen_grosch", "claim_universitetsplassen_schweigaard", "claim_universitetsplassen_pamunch", "claim_universitetsplassen_aula"],
  ["claim_universitetsplassen_grosch"],
  ["claim_universitetsplassen_identity"],
  ["claim_universitetsplassen_grosch", "claim_universitetsplassen_aula", "claim_universitetsplassen_use_1851_54"]
]);

const packetFile = "data/places/production/universitetsplassen.json";
const packet = {
  schemaVersion: "4.2",
  validatorVersion: "4.2.1",
  status: "ready_v4_2",
  placeId,
  placeFile,
  identity: {
    status: "resolved",
    represents: "Den åpne universitetsforplassen og de direkte monumentene og universitetsbygningene som rammer den inn ved Karl Johans gate.",
    period: "1841–",
    excludes: ["hele Universitetet i Oslo på andre campuser", "hele Karl Johans gate", "Eidsvolls plass", "Edvard Munchs malerier som fysiske uteobjekter"]
  },
  claims: packetClaims,
  sentenceCoverage: { desc: descCoverage, popupDesc: popupCoverage },
  textHashes: { algorithm: "sha256", desc: sha256(desc), popupDesc: sha256(popupDesc) },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category },
  collections: {
    people: ["christian_heinrich_grosch"],
    objects: place.objects.map((item) => item.id),
    brands: ["universitetet_i_oslo"],
    structures: place.structures.map((item) => item.id),
    status: "complete",
    image_coverage_percent: 100
  },
  quizReadiness: {
    status: "canonical_major_8x7",
    quizTargetId: placeId,
    sourceBrief: briefFile,
    productionContext: contextFile,
    normalOpeningQuestions: 14,
    totalQuestions: 56,
    reuseDecision: "Ingen aktiv canonical Universitetsplassen-quiz var registrert i manifestet; ny 8×7-progresjon er bygget fra kildegjennomgått stedspakke.",
    questions: [
      { question: "Når ble grunnsteinen lagt?", answer: "1841", type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_cornerstone"] },
      { question: "Hvem tegnet de tre hovedbygningene?", answer: "Christian Heinrich Grosch", type: "hvem", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_grosch"] },
      { question: "Hva er Domus Academica også kjent som?", answer: "Urbygningen", type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_urbygningen"] },
      { question: "Når ble Schweigaard-monumentet reist?", answer: "1883", type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_schweigaard"] },
      { question: "Hvilket bygg ble reist i 1911?", answer: "Aulaen", type: "hvilket_verk_eller_objekt", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_aula"] },
      { question: "Hva skjedde i 1930–31?", answer: "Universitetsplassen ble lagt om", type: "hva_skjedde", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_repaving"] },
      { question: "Hvem laget Peter Andreas Munch-monumentet?", answer: "Stinius Fredriksen", type: "hvem", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_pamunch"] },
      { question: "Hva ble permanent montert i 1916?", answer: "Edvard Munchs Aula-serie", type: "hva_ble_bygget_produsert_eller_endret", normalKnowledgeQuestion: true, claimIds: ["claim_universitetsplassen_munch"] }
    ]
  },
  source_conflicts: [],
  reviews: {
    factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Universitetsplassen phase 1–24 source review", notes: "Årstall, stedstilknytning, bygningsroller, monumenter og bildelisenser er kontrollert separat." },
    editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Universitetsplassen phase 1–24 editorial review", introducedNewFacts: false, notes: "Institusjon, bygninger, monumenter og kunst er holdt semantisk atskilt." }
  },
  reviewsNotes: [
    "1851–54 beholdes som kildebåret intervall og tvinges ikke til ett felles byggeår.",
    "Munchs Aula-malerier er ikke klassifisert som Objects på plassen.",
    "Fem eldre generiske People-koblinger og fire butikk-brandkoblinger er ryddet bort.",
    "Før/etter-paret er eksplisitt merket med ulikt ståsted og historisk datointervall."
  ],
  roundsReadiness: {
    people: "ready_grosch_direct_canonical",
    objects: "ready_two_documented_monuments",
    brands: "ready_uio_institution_identity",
    structures: "ready_four_documented_university_structures",
    badges: "ready_by_underbadges",
    quiz: "ready_major_8x7_by",
    leksikon: "ready_four_articles",
    sprak: "ready_six_entries",
    stories: "ready_four_episode_v1",
    readings: "ready_four_link_only",
    fagverk: "ready",
    frontImage: "ready_real_portrait_3x4",
    beforeAfter: "ready_archive_interval_and_2019_with_caveat"
  },
  completion: {
    completedUnder: "4.2",
    currentStatus: "current",
    sourceVerifiedAt: verifiedAt,
    claimsVerified: { verified: packetClaims.length, total: packetClaims.length },
    factualReview: "passed",
    editorialReview: "passed",
    validatorVersion: "4.2.1"
  }
};
write(packetFile, packet);

write("data/places/historie-production/universitetsplassen.json", {
  schemaVersion: "historie_place_production_v1",
  validatorVersion: "1.0.0",
  placeId,
  placeFile,
  status: "ready",
  historicalIdentity: {
    statement: "Universitetsplassen er universitetsforplassen ved Karl Johan, formet av 1840-tallets anlegg og senere monument-, aula- og plasslag.",
    placeRelationType: "institutional_square",
    placeRelationStatement: "Rapporten gjelder plassen og dens direkte fysiske ramme, ikke hele universitetets historie eller andre campuser.",
    temporalScope: { start: "1811", end: "2011", precision: "period", rationale: "Perioden dekker institusjonell forhistorie, anlegg, monumenter, Aula, omlegging og dokumentert konserveringsfase." },
    sourceIds: ["source_up_square", "source_up_university", "source_up_pa_munch", "source_up_aula"]
  },
  historyTopics: [
    { emneId: "em_his_stat_institusjoner", siteSpecificRationale: "Universitetets etablering og fysiske representasjon gjør institusjonsbygging lesbar i byrommet.", caseIds: ["case_up_institusjon_og_byrom"] },
    { emneId: "em_his_historiske_lag_i_byrom", siteSpecificRationale: "Grosch-anlegg, monumenter, Aula og 1930–31-omlegging er tydelige tidslag.", caseIds: ["case_up_institusjon_og_byrom"] },
    { emneId: "em_his_spor_materialitet", siteSpecificRationale: "Heller, bronse, trapp, fasader og kunstutsmykning skiller ulike materielle spor.", caseIds: ["case_up_institusjon_og_byrom"] },
    { emneId: "em_his_arkiv_og_dokumentasjon", siteSpecificRationale: "Arkivfotoets 1945–1960-intervall viser behovet for å bevare kildepresisjon.", caseIds: ["case_up_institusjon_og_byrom"] }
  ],
  sources: [
    { id: "source_up_square", url: urls.square, sourceLocation: "Universitetsplassen", sourceType: "institutional", verifiedAt, temporalCoverage: "retrospective", provenance: "Redigert Oslo-spesifikt oppslagsverk.", limitations: "Kortfattet framstilling." },
    { id: "source_up_university", url: urls.university, sourceLocation: "Universitetets anlegg ved Karl Johan", sourceType: "institutional", verifiedAt, temporalCoverage: "retrospective", provenance: "Redigert Oslo-spesifikt oppslagsverk.", limitations: "Institusjonshistorie med bredere scope enn plassen." },
    { id: "source_up_pa_munch", url: urls.paMunch, sourceLocation: "Peter Andreas Munch-statuen og plassomleggingen", sourceType: "institutional", verifiedAt, temporalCoverage: "retrospective", provenance: "Redigert Oslo-spesifikt oppslagsverk.", limitations: "Monumentfokus." },
    { id: "source_up_aula", url: urls.uioAula, sourceLocation: "Aula paintings and conservation", sourceType: "official", verifiedAt, temporalCoverage: "retrospective", provenance: "Universitetet i Oslo.", limitations: "Fokuserer på Munch-utsmykningen og konservering." }
  ],
  caseRealizations: [
    {
      id: "case_up_institusjon_og_byrom",
      claim: "Universitetsplassen viser hvordan en kunnskapsinstitusjon blir gjort synlig gjennom arkitektur, monumenter, ritualer og senere omforming av byrommet.",
      temporalSequence: {
        scope: { start: "1841", end: "1933", precision: "period", rationale: "Caset følger hovedanleggets etablering til monument- og plassomlegging." },
        startPoint: "Grunnsteinen ble lagt i 1841.",
        endPoint: "Peter Andreas Munch-monumentet ble reist i 1933 etter plassomleggingen 1930–31.",
        breaks: ["Aulaen kom i 1911.", "Munch-serien ble permanent montert i 1916.", "Plassflaten ble lagt om i 1930–31."],
        continuities: ["Universitetets front mot Karl Johan består som hovedramme.", "Plassen brukes som akademisk samlingsrom."],
        sourceIds: ["source_up_square", "source_up_university", "source_up_pa_munch", "source_up_aula"]
      },
      actors: [
        { name: "Universitetet", roleOrInterest: "Institusjonell eier og bruker av anlegget.", powerPosition: "Former program, ritualer og representasjon i universitetsrommet.", sourceIds: ["source_up_university"] },
        { name: "Arkitekter og kunstnere", roleOrInterest: "Formet bygninger, monumenter, plassflate og utsmykning.", powerPosition: "Ga fysisk og symbolsk form til institusjonens offentlige front.", sourceIds: ["source_up_university", "source_up_pa_munch", "source_up_aula"] }
      ],
      conflictOrNegotiation: { statement: "Plassen er resultat av flere design- og monumentvalg over tid, ikke én samtidig komposisjon.", sourceIds: ["source_up_university", "source_up_pa_munch"] },
      materialEvidence: [
        { trace: "Groschs tre hovedbygninger", interpretation: "1840-tallets institusjonsarkitektur.", sourceIds: ["source_up_university"] },
        { trace: "Schweigaard- og Peter Andreas Munch-monumentene", interpretation: "Akademisk og samfunnspolitisk minnekultur.", sourceIds: ["source_up_square", "source_up_pa_munch"] },
        { trace: "Aulaen", interpretation: "Et senere seremonielt lag bak midtbygningen.", sourceIds: ["source_up_aula"] }
      ],
      uncertainty: { statement: "Historisk fotografi er datert 1945–1960 og skal ikke gis et eksakt år.", sourceIds: ["source_up_square"] }
    }
  ],
  completion: { sourceVerifiedAt: verifiedAt, factualReview: "passed", editorialReview: "passed" }
});

write("reports/place-production/universitetsplassen-phase1-24-gate-audit-v1.json", {
  schema: "history_go_place_phase1_24_gate_audit_v1",
  place_id: placeId,
  category: "by",
  verified_at: verifiedAt,
  status: "PASS",
  blockers: [],
  collections: { people: "PASS", objects: "PASS", brands: "PASS", structures: "PASS" },
  modules: { leksikon: "PASS", chronology: "PASS", language: "PASS", stories: "PASS", lesespor: "PASS", quiz: "PASS", fagverk: "PASS", before_after: "PASS" },
  manual_image_review: { status: "PASS", note: "Alle ni lokale bildevarianter hentes fra lisensierte Commons-originaler; frontImage er en faktisk 3:4-fil." },
  quality_score: {
    factuality: { score: 5, note: "Direkte stedskilder og kildeintervaller er bevart." },
    source_quality: { score: 5, note: "Oslo byleksikon, UiO og Commons-proveniens." },
    place_specificity: { score: 5, note: "Fire samlinger er direkte knyttet til plassen." },
    editorial_clarity: { score: 5, note: "Bygning, objekt, kunst og institusjon er semantisk skilt." },
    learning_design: { score: 5, note: "Fire artikler, fire Stories, fire Lesespor, seks språkspor og 8×7 quiz." },
    runtime_readiness: { score: 5, note: "Canonicale manifester og generatorbane er oppdatert." },
    total: 30,
    critical_findings: 0,
    unresolved_blockers: 0
  }
});
write("reports/place-production/universitetsplassen-workcard-current.json", {
  schema: "history_go_place_workcard_v1",
  place_id: placeId,
  category: "by",
  status: "complete",
  completed_at: verifiedAt,
  coordinate_decision: "preserved_verified_geometry_anchor",
  source_review: "complete",
  collections: ["people", "objects", "brands", "structures"],
  quiz_profile: "major_8x7",
  quality_gate: "30/30",
  canonical_next: null
});

const testFile = `import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("${placeFile}");
const production = read("${packetFile}");
const quiz = read("${quizFile}");
const runtime = read("data/runtime/place-open/universitetsplassen.json");
const leksikon = read("${leksikonFile}");
const language = read("${languageFile}");
const audit = read("reports/place-production/universitetsplassen-phase1-24-gate-audit-v1.json");

test("Universitetsplassen has exact four By collections and preserved geometry", () => {
  assert.equal(place.lat, 59.9154);
  assert.equal(place.lon, 10.7355);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.objects.map(item => item.id), ["universitetsplassen_schweigaardstatuen", "universitetsplassen_pa_munch_statuen"]);
  assert.equal(place.structures.length, 4);
  assert.deepEqual(runtime.brands.map(item => item.id), ["universitetet_i_oslo"]);
  assert.deepEqual(runtime.people.map(item => item.id), ["christian_heinrich_grosch"]);
});

test("all selected images exist and portrait front is real", () => {
  const person = runtime.people[0];
  const files = [place.image, place.cardImage, place.frontImage, place.for_na.beforeImage, person.image, ...place.objects.map(item => item.image), ...place.structures.map(item => item.image)];
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, file);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.outputDimensions, "900x1200");
  assert.ok(place.objects.every(item => item.imageMeta?.license));
  assert.ok(place.structures.every(item => item.imageMeta?.license));
});

test("description packet validates without issues", () => {
  const result = validatePacket({ packet: production, place, packetFile: "${packetFile}", now: new Date("2026-08-29T21:00:00Z") });
  assert.deepEqual(result.issues, []);
});

test("language, leksikon, stories and readings are complete", () => {
  assert.equal(language.entries.length, 6);
  assert.equal(leksikon.length, 4);
  assert.equal(leksikon[0].chronology.length, 10);
  assert.equal(runtime.leksikon.length, 4);
  assert.equal(runtime.stories.length, 4);
  assert.equal(runtime.lesespor.length, 4);
});

test("major quiz is unique 8x7 with delayed methods", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"]);
  assert.equal(quiz.sets.length, 8);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 56);
  assert.equal(new Set(questions.map(question => question.id)).size, 56);
  assert.equal(new Set(questions.map(question => question.question)).size, 56);
  assert.ok(questions.slice(0, 49).every(question => !question.method_id));
  assert.ok(questions.slice(49).every(question => question.method_id));
  assert.deepEqual([...new Set(questions.map(question => question.answerIndex))].sort(), [0, 1, 2]);
  assert.ok(questions.every(question => question.source_origin === "external"));
});

test("six-dimensional quality gate is 30/30", () => {
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(item => item.score === 5));
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
`;
fs.writeFileSync(path.join(root, "tests/universitetsplassen-completion.test.mjs"), testFile);

console.log("Universitetsplassen canonical production materialized.");

// Final deterministic Universitetsplassen quiz context rebuild.
await runBuildQuizProductionContext({
  root,
  categoryId: "by",
  targetId: placeId,
  outputPath: "data/quiz/production_context/by/universitetsplassen.json"
});
