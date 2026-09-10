import fs from "node:fs";
import path from "node:path";
import { id, verifiedAt, placeFile, urls, sourceDefs, desc, popupDesc, chronologyRows, readingRows as readingSourceRows, fagverk } from "./peststotten-krist-kirkegard-content.mjs";

export async function materializePlaceCore({ root, read, write, addOnce }) {
  const sharpModule = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "sharp/dist/index.mjs") : "sharp";
  const { default: sharp } = await import(sharpModule);
  const cache = path.join(root, ".cache/peststotten-krist-kirkegard-media");
  fs.mkdirSync(cache, { recursive: true });
  const download = async (url, name) => {
    const target = path.join(cache, name);
    if (fs.existsSync(target) && fs.statSync(target).size > 5000) return target;
    const response = await fetch(url, { headers: { "user-agent": "History-Go-place-production/1.0" }, redirect: "follow" });
    if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
    return target;
  };
  const image = async (source, target, width, height, position = "centre") => {
    const output = path.join(root, target); fs.mkdirSync(path.dirname(output), { recursive: true });
    await sharp(source).resize(width, height, { fit: "cover", position }).webp({ quality: 88 }).toFile(output);
  };
  const direct = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Pestst%C3%B8tten%20p%C3%A5%20Krist%20Kirkeg%C3%A5rd%20i%20Oslo.JPG";
  const photo = await download(direct, "peststotten.jpg");
  await image(photo, "bilder/places/peststotten_krist_kirkegard.webp", 1400, 900);
  await image(photo, "bilder/places/peststotten_krist_kirkegard_front_portrait.webp", 900, 1280);
  await image(photo, "bilder/kort/places/peststotten_krist_kirkegard.webp", 900, 620);
  await image(photo, "bilder/kort/objects/peststotten_kalksteinsmonument_1654.webp", 900, 620);
  await image(photo, "bilder/kort/structures/peststotten_krist_kirkegard_minnepark.webp", 900, 620);
  for (const suffix of ["pest_1654", "kolera_1835", "minnepark_1999"]) await image(photo, `bilder/kort/historical_events/peststotten_${suffix}.webp`, 900, 620);

  const photoMeta = { source: "wikimedia_commons", sourcePage: urls.commons, creator: "Paalso", credit: "Paalso / Wikimedia Commons", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", assetType: "documentary_photo", date: "2006-10-24", transformation: "Proporsjonalt utsnitt og WebP-normalisering.", verifiedAt };
  const later = note => ({ ...photoMeta, note });
  const monumentObject = {
    id: "peststotten_kalksteinsmonument_1654", name: "Peststøtten fra 1654", title: "Peststøtten fra 1654", type: "minnesmerke", kind: "plague_memorial", year: 1654,
    desc: "Kalksteinsstøtten med kors og innskrift markerer pestgravplassen ved Krist kirkegård.", physicalObject: true, placeSpecific: true, collectable: true,
    placeSpecificReason: "Oslo byleksikon knytter støtten direkte til massegraven og peståret 1654.", why_here: "Monumentet står ved inngangen til gravplassen som ble tatt i bruk under pestutbruddet.",
    whereToFind: "Ved inngangen til Krist kirkegård på Hammersborg.", unlock: "Les årstallet og innskriften som et materielt spor før du sammenligner med de skriftlige kildene.",
    image: "bilder/kort/objects/peststotten_kalksteinsmonument_1654.webp", imageMeta: photoMeta, source_urls: [urls.byleksikonPest, urls.osloKrist, urls.commons]
  };
  const structures = [{
    id: "peststotten_krist_kirkegard_minnepark", name: "Krist kirkegård som minnepark", title: "Krist kirkegård som minnepark", type: "kirkegård", kind: "historic_cemetery_memorial_park", year: 1999,
    desc: "Den bevarte øvre delen av kirkegården ble rehabilitert og åpnet som minnepark i 1999.", image: "bilder/kort/structures/peststotten_krist_kirkegard_minnepark.webp",
    imageMeta: later("Fotografiet fra 2006 dokumenterer monumentet i den rehabiliterte kirkegårdskonteksten."), source_urls: [urls.osloKrist, urls.byleksikonKrist, urls.commons]
  }];
  const historicalEvents = [
    { id: "peststotten_pest_1654", name: "Pesten og ny gravplass", title: "Pesten og ny gravplass", year: 1654, type: "historical_event", kind: "epidemic_cemetery_creation", desc: "Pestutbruddet skapte behov for en ny gravplass, og Peststøtten ble reist samme år.", image: "bilder/kort/historical_events/peststotten_pest_1654.webp", imageMeta: later("Fotoet fra 2006 viser minnesmerket, ikke selve hendelsen i 1654."), source_urls: [urls.byleksikonPest, urls.osloKrist, urls.lokalPest] },
    { id: "peststotten_kolera_1835", name: "Kirkegården utvides under koleraen", title: "Kirkegården utvides under koleraen", year: 1835, type: "historical_event", kind: "cholera_cemetery_expansion", desc: "Krist kirkegård ble utvidet i 1835 i forbindelse med koleraepidemien.", image: "bilder/kort/historical_events/peststotten_kolera_1835.webp", imageMeta: later("Fotoet fra 2006 dokumenterer stedet lenge etter koleraepidemien."), source_urls: [urls.byleksikonKrist, urls.lokalKrist] },
    { id: "peststotten_minnepark_1999", name: "Minneparken åpnes på nytt", title: "Minneparken åpnes på nytt", year: 1999, type: "historical_event", kind: "memorial_park_rehabilitation", desc: "Oslo kommune rehabiliterte området og åpnet det som minnepark i 1999.", image: "bilder/kort/historical_events/peststotten_minnepark_1999.webp", imageMeta: later("Fotoet er tatt i 2006 og dokumenterer resultatet etter rehabiliteringen."), source_urls: [urls.osloKrist, urls.commons] }
  ];

  const place = read(placeFile);
  Object.assign(place, {
    name: "Peststøtten – Krist kirkegård", year: 1654, desc, popupDesc,
    image: "bilder/places/peststotten_krist_kirkegard.webp", cardImage: "bilder/kort/places/peststotten_krist_kirkegard.webp", frontImage: "bilder/places/peststotten_krist_kirkegard_front_portrait.webp",
    imageMeta: { ...photoMeta, outputDimensions: "1400x900 and 900x620" }, frontImageMeta: { ...photoMeta, outputDimensions: "900x1280", orientation: "portrait" },
    production_profile: "standard", profile_status: "confirmed", profile_reason: "Edvard Munchs dokumenterte familie- og motivtilknytning, selve Peststøtten, kirkegårdens minneparklag og tre kildebelagte hendelser gir fire substansielle og bildeklare samlinger.",
    related_people_ids: ["edvard_munch"], related_place_ids: ["var_frelsers_gravlund", "hammersborg_torg"],
    place_card_profile: { schema: "history_go_place_card_profile_v2", production_profile: "standard", collection_ids: ["people", "objects", "structures", "historical_events"], category_collection_label: "Historiske hendelser", reason: "Fire forskjellige historiske innganger er kildebelagt og har lokale forhåndsbilder uten å fylle ut med generiske samlinger.", verifiedAt },
    objects: [monumentObject], structures, historical_events: historicalEvents,
    module_audit: { ...(place.module_audit || {}), for_na: { status: "source_bounded_holdback", reason: "Ingen rettighetsavklart og motivmessig sammenlignbar historisk før-bildekilde ble funnet som gir et redelig før–nå-par." } },
    fagverk
  });
  write(placeFile, place);

  const peopleFile = "data/people/historie/oslo/people_historie_oslo.json";
  const people = read(peopleFile); const munch = people.find(person => person.id === "edvard_munch");
  if (!munch) throw new Error("Existing edvard_munch person is required");
  munch.place_ids ||= []; addOnce(munch.place_ids, id); write(peopleFile, people);

  const chronology = chronologyRows.map(([year, title, consequence], i) => ({
    id: `chrono_${id}_${i + 1}_${year}`, year, title, consequence, confidence: "high",
    sources: [{ title: year === 1999 ? sourceDefs.oslo_krist.title : year === 1654 && i < 2 ? sourceDefs.byleksikon_pest.title : sourceDefs.byleksikon_krist.title, url: year === 1999 ? urls.osloKrist : year === 1654 && i < 2 ? urls.byleksikonPest : urls.byleksikonKrist, verifiedAt }]
  }));
  const leksikonFile = `data/leksikon/places/oslo/historie/leksikon_${id}.json`;
  write(leksikonFile, { schema: "history_go_place_leksikon_v1", entry: { id: `leksikon_${id}`, place_id: id, category: "historie", title: "Peststøtten – epidemi, gravplass og minnekultur", popupDesc: desc, sections: ["Peststøtten og Krist kirkegård ble etablert i peståret 1654.", "Kirkegården fikk nye lag gjennom militær bruk, kolera og senere utvidelser.", "Bevaring, Munch-familiens tilknytning og minneparken viser hvordan stedet fikk nye betydninger over tid."], chronology, externalLinks: Object.values(sourceDefs).slice(0, 6).map(source => ({ type: source.source_type === "official" ? "official" : "source", label: source.title, url: source.url, lang: "nb", verifiedAt })) } });

  const languageFile = `data/leksikon/sprak/places/europe/norway/oslo/${id}.json`;
  const languageEntries = [
    ["peststotte", "place_name", "peststøtte", "En støtte eller et monument som minner om et pestutbrudd og menneskene som ble rammet."],
    ["kirkegard", "term", "kirkegård", "Gravplass knyttet til kirkelig tradisjon; her brukt om Krist kirkegård på Hammersborg."],
    ["massegrav", "term", "massegrav", "Grav der flere mennesker er lagt ned, ofte etter krig, katastrofe eller epidemi."],
    ["kolera", "term", "kolera", "Smittsom sykdom som utløste nye epidemier og gravplassbehov i 1800-tallets Christiania."],
    ["minnepark", "term", "minnepark", "Et bevart grønt område der eldre graver eller monumenter formidles som historiske minner."],
    ["innskrift", "term", "innskrift", "Tekst hugget eller skrevet på et monument og brukt som materiell historisk kilde."]
  ].map(([suffix, type, term, meaning], i) => ({ id: `${id}_sprak_${i + 1}_${suffix}`, type, term, meaning, place_ids: [id], sources: [{ label: i === 4 ? sourceDefs.oslo_krist.title : sourceDefs.byleksikon_pest.title, url: i === 4 ? urls.osloKrist : urls.byleksikonPest, verifiedAt }] }));
  write(languageFile, { place_id: id, title: "Språkleksikon: Peststøtten – Krist kirkegård", language: "nb", entries: languageEntries });

  const readingFile = "data/lesespor/oslo/lesespor_oslo_historie.json";
  const readingsRoot = read(readingFile); readingsRoot.items ||= [];
  const readingRows = readingSourceRows.map(([suffix, title, publication, url, relevance, source_quality]) => ({ id: `lesespor_${id}_${suffix}`, type: "place_history", title, publication, author: null, year: 2026, date: null, url, access: "open", rights: "link_only", curation_status: "approved", source_quality, relevance, subjects: ["pest", "gravplass", "minnekultur", "Hammersborg"], category_hints: ["historie"], place_ids: [id], person_ids: suffix === "lokalhistorie" ? ["edvard_munch"] : [] }));
  const readingIds = new Set(readingRows.map(item => item.id)); readingsRoot.items = readingsRoot.items.filter(item => !readingIds.has(item.id)); readingsRoot.items.push(...readingRows); write(readingFile, readingsRoot);

  const storyFile = `data/stories/stories_${id}.json`;
  const story = [{ id: `st_${id}_pestaret_1654`, quality_profile: "episode_v1", type: "historical_event", title: "Året da byen trengte en ny gravplass", year: 1654, place_id: id, summary: "Pesten i 1654 gjorde gravplassmangelen akutt, og Krist kirkegård med Peststøtten ble et varig minnespor på Hammersborg.", story: "I 1654 rammet pesten Christiania og miljøet rundt Akershus. Behovet for gravplasser ble større, og et nytt gravsted ble tatt i bruk på Hammersborg.\n\nVed inngangen ble Peststøtten reist samme år. Innskriften knyttet gravplassen til navngitte embetsmenn og til Arne Sigvardsøn fra Vang, den første som ble gravlagt her. Monumentet gjorde dermed en kollektiv krise synlig gjennom et konkret sted og et konkret objekt.\n\nSenere kom andre lag: militære graver, kolera, utvidelser, Munch-familiens graver og til slutt minnepark. Peststøtten står igjen som startpunktet, men stedet forteller mer enn én epidemi og mer enn ett år.", episode: { actors: ["menneskene som trengte nye gravsteder i 1654", "kirkelige og offentlige myndigheter ved Christiania og Akershus"], date: "1654", action: "Krist kirkegård ble tatt i bruk og Peststøtten reist.", consequence: "Peståret fikk et fysisk minnespor som senere ble omgitt av nye grav- og minnelag." }, sources: [{ title: sourceDefs.byleksikon_pest.title, url: urls.byleksikonPest }, { title: sourceDefs.oslo_krist.title, url: urls.osloKrist }, { title: sourceDefs.lokal_pest.title, url: urls.lokalPest }], tags: ["pest", "1654", "gravplass", "minnested", "Hammersborg"], related_people: [], related_places: ["var_frelsers_gravlund", "hammersborg_torg"], next_scenes: [{ place_id: "var_frelsers_gravlund", reason: "Sammenlign hvordan en senere gravlund organiserer minne, berømte graver og offentlig historiebruk." }], score: { narrative: 3, historical: 4, source: 4, play_value: 3, originality: 3, total: 17 }, arc: { start: "Pestutbruddet skaper et akutt gravplassbehov.", middle: "En ny kirkegård tas i bruk og et monument reises.", end: "Stedet får nye tidslag, mens 1654 fortsatt kan leses i steinen." } }];
  write(storyFile, story);

  const leksikonManifest = read("data/leksikon/manifest.json"); addOnce(leksikonManifest.files, leksikonFile); write("data/leksikon/manifest.json", leksikonManifest);
  const languageManifest = read("data/leksikon/sprak/manifest.json"); languageManifest.place_files[id] = languageFile; write("data/leksikon/sprak/manifest.json", languageManifest);
  const storyManifest = read("data/stories/stories_manifest.json"); storyManifest.files = storyManifest.files.filter(item => item.entity_id !== id); storyManifest.files.push({ category: "historie", entity_id: id, path: storyFile }); write("data/stories/stories_manifest.json", storyManifest);
  const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
  if (Array.isArray(episodeManifest.files)) { episodeManifest.files = episodeManifest.files.filter(item => (typeof item === "string" ? item !== storyFile : item?.path !== storyFile)); const sample = episodeManifest.files[0]; episodeManifest.files.push(typeof sample === "string" ? storyFile : { category: "historie", entity_id: id, path: storyFile }); }
  write("data/stories/stories_episode_v1_manifest.json", episodeManifest);
  return { place, monumentObject, structures, historicalEvents, chronology, languageEntries, readingRows, storyFile, leksikonFile, languageFile };
}
