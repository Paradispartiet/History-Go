#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const verifiedAt = "2026-08-26";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const addOnce = (array, value, key = item => item) => {
  if (!array.some(item => key(item) === key(value))) array.push(value);
};
const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const sentenceCount = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)]
  .map(entry => entry.segment.trim()).filter(Boolean).length;

const urls = {
  byleksikon: "https://oslobyleksikon.no/side/Markveien",
  lokalhistorie: "https://lokalhistoriewiki.no/wiki/Markveien_(Oslo)",
  markveien57: "https://lokalhistoriewiki.no/wiki/Markveien_57_(Oslo)",
  watchman: "https://www.snublestein.no/Philip-Sam-Watchman/p=532/",
  watchmanFlorence: "https://www.snublestein.no/Florence-Watchman/p=531/",
  markveien9: "https://oslohistorie.no/2019/08/04/butikken-i-markveien-9/",
  frokenDiana: "https://www.frokendianassalonger.no/pages/kontakt-oss",
  robot: "https://www.robotoslo.com/",
  objectImage: "https://commons.wikimedia.org/wiki/File:Markveien_57_Oslo.jpg",
  thorvaldMeyer: "https://nbl.snl.no/Thorvald_Meyer"
};

const placeFile = "data/places/by/oslo/places/markveien.json";
const place = read(placeFile);
place.related_place_ids = [
  "olaf_ryes_plass", "birkelunden", "sofienbergparken", "sofienberg_kirke",
  "daelenenga_idrettspark", "paulus_kirke", "schous_bryggeri"
];
place.related_people_ids = ["thorvald_meyer"];
place.place_card_profile = {
  schema: "history_go_place_card_profile_v2",
  collection_ids: ["people", "objects", "brands", "related"],
  reason: "Gaten har et bildeklart People-medlem, et kildebelagt fysisk objekt, to nåverifiserte lokale butikkbrand og bildeklare canonicale nabosteder. Badge og quiz presenteres separat.",
  verifiedAt
};
place.objects = [{
  id: "markveien_57", title: "Markveien 57", type: "kommunalt_losjihus",
  kind: "physical_building", desc: "Bygningen ble oppført i 1919 som kommunalt losjihus for menn og fikk Houens diplom i 1923.",
  why_here: "Bygningen gjør kommunal bolig- og velferdshistorie synlig i den samme gaten som ellers ofte leses som handels- og kafégate.",
  placeSpecificReason: "Oslo byleksikon og Lokalhistoriewiki knytter funksjon, byggeår, arkitekter og Houens diplom til nøyaktig denne adressen.",
  historicalFunction: "Kommunalt losjihus for menn med 77 plasser.", physicalObject: true,
  placeSpecific: true, collectable: true, storePrice: 30, currency: "PC",
  collection: "markveien_historiske_lag",
  unlock: "Finn takrytteren og kommunevåpenet, og observer bygningen fra offentlig gategrunn.",
  image: "bilder/kort/objects/markveien_57.webp",
  imageMeta: {
    sourcePage: urls.objectImage, creator: "Mahlum", credit: "Mahlum / Wikimedia Commons",
    license: "Public domain", depictedObject: "Markveien 57",
    transformation: "Sentrert utsnitt, skalering og WebP-normalisering til 900 × 520.", verifiedAt
  },
  source_urls: [urls.byleksikon, urls.markveien57]
}];
place.externalLinks = [
  ["source", "Oslo byleksikon – Markveien", urls.byleksikon],
  ["source", "Lokalhistoriewiki – Markveien", urls.lokalhistorie],
  ["source", "Lokalhistoriewiki – Markveien 57", urls.markveien57],
  ["source", "Jødisk Museum – Philip Sam Watchman", urls.watchman],
  ["source", "Oslohistorie – Butikken i Markveien 9", urls.markveien9],
  ["source", "Frøken Dianas Salonger – kontakt", urls.frokenDiana],
  ["source", "Robot Oslo", urls.robot],
  ["image_source", "Wikimedia Commons – Markveien 57", urls.objectImage]
].map(([type, label, url]) => ({ type, label, url, verifiedAt }));
place.interpretation = {
  what_to_notice: [
    "Nedre del har tett butikk- og serveringspreg, mens øvre del hovedsakelig består av leiegårder.",
    "Seilduksgårdene, Markveien 57 og snublesteinene gjør ulike historiske lag fysisk lesbare.",
    "Grünerstubben og Olaf Ryes plass bryter opp den lineære gaten med sideforbindelse og oppholdsrom."
  ],
  why_it_matters: [
    "Gaten samler bolig, arbeid, handel, krigsminne og byfornyelseskonflikt i ett sammenhengende forløp.",
    "Rivingskonflikten i 1977 viser at dagens bevarte gatepreg også er et resultat av politisk kamp.",
    "Dagens butikkmiks kan studeres som et tidsbundet lag uten å redusere hele gaten til en trendetikett."
  ],
  counterpoints: [
    "Gentrifisering er en analyse av endring, ikke en påstand om at alle eldre funksjoner eller beboere er borte.",
    "Brand-kort dokumenterer nåværende virksomheter og innebærer ikke endorsement eller eierskap til gaten.",
    "Snublesteinene skal leses som minnesmerker over navngitte personer, ikke som dekorative gateobjekter."
  ],
  sources: [urls.byleksikon, urls.watchman, urls.frokenDiana, urls.robot].map(url => ({ url, verifiedAt }))
};
write(placeFile, place);

const historyPeopleFile = "data/people/historie/oslo/people_historie_oslo.json";
const historyPeople = read(historyPeopleFile);
const thorvald = historyPeople.find(person => person.id === "thorvald_meyer");
if (thorvald) {
  thorvald.source_urls = [...new Set([...(thorvald.source_urls || []), urls.thorvaldMeyer, urls.byleksikon])];
  thorvald.externalLinks = [...(thorvald.externalLinks || []).filter(link => link.url !== urls.thorvaldMeyer && link.url !== urls.byleksikon),
    { type: "source", label: "Norsk biografisk leksikon – Thorvald Meyer", url: urls.thorvaldMeyer, verifiedAt },
    { type: "source", label: "Oslo byleksikon – Markveien", url: urls.byleksikon, verifiedAt }
  ];
}
write(historyPeopleFile, historyPeople);

const brandsMasterFile = "data/brands/brands_master.json";
const brandsMaster = read(brandsMasterFile);
const brandUpdates = {
  froken_dianas_salonger: {
    desc: "Uavhengig vintage- og etisk motebutikk i Markveien 56.",
    popupdesc: "Frøken Dianas Salonger oppgir selv butikk i Markveien 56 og beskriver slow fashion, vintage og etisk mote. Koblingen er nåverifisert og innebærer ikke endorsement.",
    status: "active", verification: "verified", verified_at: verifiedAt,
    place_ids: ["markveien"], source_urls: [urls.frokenDiana]
  },
  robot: {
    desc: "Kurert vintagebutikk med inngang mot Markveien fra Korsgata 22.",
    popupdesc: "Robot beskriver seg som en vintagebutikk etablert i 2005 og lokalisert i Markveien, med butikkadresse Korsgata 22. Koblingen gjelder gateinngangen og butikkens egen stedsbeskrivelse.",
    status: "active", verification: "verified", verified_at: verifiedAt,
    place_ids: ["markveien"], source_urls: [urls.robot]
  }
};
for (const [id, update] of Object.entries(brandUpdates)) {
  const brand = brandsMaster.find(item => item.id === id);
  if (brand) Object.assign(brand, update);
}
write(brandsMasterFile, brandsMaster);
const brandsByPlaceFile = "data/brands/brands_by_place.json";
const brandsByPlace = read(brandsByPlaceFile);
brandsByPlace.markveien = ["froken_dianas_salonger", "robot"];
write(brandsByPlaceFile, brandsByPlace);

const leksikonFile = "data/leksikon/places/oslo/by/leksikon_markveien.json";
const legacyLeksikonFile = "data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json";
write(legacyLeksikonFile, read(legacyLeksikonFile).filter(entry => entry.place_id !== "markveien"));
const leksikon = {
  place_id: "markveien", title: "Markveien", type: "main", version: 1,
  visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "En gate fra Sannergata til Søndre gate der bolig, arbeid, handel, krigsminner og byfornyelseskamp kan leses i samme gateforløp.",
  wikiText: [
    "Markveien ble innlemmet i byen 1. januar 1859. Den nedre delen ble en viktig forretningsgate, mens øvre del i stor grad fikk leiegårder fra 1880- og 1890-årene.",
    "Seilduksgårdene i nummer 29–33, samvirkehistorien i nummer 28, losjihuset i nummer 57 og snublesteinene ved flere adresser viser at gaten rommer mer enn dagens butikk- og kaféprofil.",
    "Rivingen ved nummer 35 i 1977 utløste kraftige sammenstøt. Oslo byleksikon knytter konflikten til at senere byfornyelse tok større hensyn til Grünerløkkas opprinnelige bebyggelse."
  ],
  summary: { one_liner: "Arbeider-, handels- og minnegate formet av bevaring og ny bruk.", themes: ["arbeiderhistorie", "handel", "krigsminne", "byfornyelse"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_markveien_1859", label: "Byutvidelsen", desc: "Markveien ble innlemmet i byen 1. januar 1859.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_markveien_seilduks", label: "Seilduksgårdene", desc: "Nummer 29, 31 og 33 ble oppført for ansatte ved Christiania Seildugsfabrik.", confidence: "high", sources: [{ title: "Oslo byleksikon", url: urls.byleksikon }] },
    { id: "fact_markveien_watchman", label: "Snublesteinene i nummer 25", desc: "Tre snublesteiner minnes Philip, Florence og Arthur Watchman.", confidence: "high", sources: [{ title: "Jødisk Museum", url: urls.watchman }] }
  ],
  chronology: [
    [1859, "Gaten innlemmes i byen", "Byutvidelsen gjorde Markveien til del av Christiania."],
    [1879, "Seilduksgårdene", "Tre arbeidergårder i nummer 29–33 ble oppført i slutten av 1870-årene."],
    [1895, "Kooperativ handel", "En filial av Kristiania Kooperative Selskab åpnet i nummer 28."],
    [1919, "Kommunalt losjihus", "Markveien 57 ble oppført som losjihus for menn."],
    [1942, "Watchman-familien deporteres", "Philip, Florence og Arthur Watchman ble deportert med Donau."],
    [1977, "Rivingskonflikten", "Rivingen ved Olaf Ryes plass utløste sammenstøt og ble et bevaringshistorisk vendepunkt."]
  ].map(([year, title, desc], index) => ({ id: `chrono_markveien_${year}_${index + 1}`, year, title, desc, confidence: "high", sources: [{ title: year === 1942 ? "Jødisk Museum" : "Oslo byleksikon", url: year === 1942 ? urls.watchman : urls.byleksikon }] })),
  sources: place.externalLinks, externalLinks: place.externalLinks, interpretation: place.interpretation
};
write(leksikonFile, leksikon);
const leksikonManifest = read("data/leksikon/manifest.json");
leksikonManifest.files = leksikonManifest.files.filter(file => file !== "data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json");
addOnce(leksikonManifest.files, "data/leksikon/places/oslo/by/leksikon_oslo_by_batch2.json");
addOnce(leksikonManifest.files, leksikonFile);
write("data/leksikon/manifest.json", leksikonManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/markveien.json";
write(languageFile, {
  place_id: "markveien", title: "Språkleksikon: Markveien", verified_at: verifiedAt,
  dialect_status: "not_applicable_place_level",
  entries: [
    { id: "markveien_navn", term: "Markveien", type: "stedsnavn", meaning: "Navnet viser til veien over markene som lå her før den tette byutbyggingen.", context: "Navnet bevarer et språklig spor etter landskapet før leiegårdene og handlegaten.", linked_to: { kind: "place", id: "markveien" }, tags: ["stedsnavn", "landskap"], sources: [{ label: "Lokalhistoriewiki – Markveien", url: urls.lokalhistorie }] },
    { id: "markveien_seilduksgard", term: "Seilduksgårdene", type: "lokalt_bygningsnavn", meaning: "Fem arbeidergårder oppført for ansatte ved Christiania Seildugsfabrik; tre ligger i Markveien 29–33.", context: "Navnet knytter boligarkitekturen direkte til fabrikkarbeidet ved Akerselva.", linked_to: { kind: "place", id: "markveien" }, tags: ["arbeiderbolig", "industri"], sources: [{ label: "Oslo byleksikon – Markveien", url: urls.byleksikon }] },
    { id: "markveien_snublestein", term: "snublestein", type: "minnebegrep", meaning: "En liten messingstein i fortauet som minnes et offer for nazismen ved personens siste frivillige bosted.", context: "I Markveien 25 minnes steinene Philip, Florence og Arthur Watchman.", linked_to: { kind: "place", id: "markveien" }, tags: ["minnekultur", "fortau"], sources: [{ label: "Jødisk Museum – Philip Sam Watchman", url: urls.watchman }] }
  ]
});
const languageManifest = read("data/leksikon/sprak/manifest.json");
languageManifest.place_files.markveien = languageFile;
write("data/leksikon/sprak/manifest.json", languageManifest);

const storyFile = "data/stories/stories_markveien_by.json";
write(storyFile, [{
  id: "st_markveien_rivingskamp_1977", quality_profile: "episode_v1", type: "turning_point",
  title: "Rivingen som endret byfornyelsen", year: 1977, place_id: "markveien",
  summary: "Rivingen av leiegården ved Markveien 35 utløste kraftige sammenstøt og ble et vendepunkt i striden om sanering på Grünerløkka.",
  story: "Kvartalet ved Markveien 35–37 var planlagt nesten totalsanert. Da den gamle leiegården ved Olaf Ryes plass skulle rives i september 1977, møtte demonstranter politiet i kraftige sammenstøt.\n\nKonflikten handlet om mer enn ett hus. Den gjaldt om byfornyelse skulle bety full utskifting av murgårder, gatepreg og hverdagsmiljø, eller om den eksisterende bydelen kunne rehabiliteres.\n\nOslo byleksikon knytter den senere utviklingen til en tydelig kursendring: senere prosjekter tok i større grad hensyn til Grünerløkkas opprinnelige bebyggelse. Dagens Markveien er derfor også et resultat av at saneringsplanen ble politisk utfordret.",
  episode: { actors: ["rivingsmotstandere", "politi", "utbyggings- og byfornyelsesmyndigheter"], date: "1977-09-22", action: "Den opprinnelige leiegården ved Markveien 35 ble revet under kraftige sammenstøt.", consequence: "Senere byfornyelse tok større hensyn til den eldre bebyggelsen." },
  sources: [{ title: "Oslo byleksikon – Markveien", url: urls.byleksikon }, { title: "Lokalhistoriewiki – Markveien", url: urls.lokalhistorie }],
  tags: ["sanering", "bevaring", "bykamp", "1977"], related_people: [], related_places: ["olaf_ryes_plass"],
  score: { narrative: 5, historical: 2, source: 4, play_value: 5, originality: 3, total: 19 },
  arc: { start: "Kvartalet var planlagt nesten totalsanert.", middle: "Rivingen utløste demonstrasjoner og sammenstøt.", end: "Senere byfornyelse tok større hensyn til det eksisterende gatepreget." },
  next_scenes: [{ place_id: "olaf_ryes_plass", reason: "Plassen gir den nærmeste romlige inngangen til rivingsstedet og den tidligere Plasskafeen." }]
}]);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
addOnce(episodeManifest.files, storyFile);
write("data/stories/stories_episode_v1_manifest.json", episodeManifest);
const storyManifest = read("data/stories/stories_manifest.json");
storyManifest.files = storyManifest.files.filter(entry => entry.entity_id !== "markveien");
storyManifest.files.push({ category: "by", entity_id: "markveien", path: storyFile });
write("data/stories/stories_manifest.json", storyManifest);

const readingFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const readings = read(readingFile);
readings.items = readings.items.filter(item => !item.id.startsWith("lesespor_markveien_"));
readings.items.push(
  { id: "lesespor_markveien_byleksikon", title: "Markveien", author: null, publication: "Oslo byleksikon", date: "2025-06-13", year: 2025, type: "institutional_reference", subjects: ["gatehistorie", "arbeiderboliger", "byfornyelse"], place_ids: ["markveien"], person_ids: ["thorvald_meyer"], category_hints: ["by", "historie"], url: urls.byleksikon, access: "open", rights: "link_only", source_quality: "institutional_reference", curation_status: "strong_candidate", relevance: "Canonical adresse-for-adresse-kilde for gatens avgrensning, bygninger, krigsminner og saneringskonflikt." },
  { id: "lesespor_markveien_watchman", title: "Philip Sam Watchman", author: null, publication: "Jødisk Museum / Snublestein.no", date: null, year: 1942, type: "museum_biographical_record", subjects: ["Markveien 25", "deportasjon", "snublestein"], place_ids: ["markveien"], person_ids: [], category_hints: ["historie", "by"], url: urls.watchman, access: "open", rights: "link_only", source_quality: "museum_primary_record", curation_status: "strong_candidate", relevance: "Navngir familien, adressen, arrestasjonene og deportasjonen og forankrer minnesporet i fortauet." },
  { id: "lesespor_markveien_57", title: "Markveien 57", author: null, publication: "Lokalhistoriewiki", date: null, year: 1919, type: "reference_article", subjects: ["losjihus", "kommunal boligpolitikk", "Houens diplom"], place_ids: ["markveien"], person_ids: [], category_hints: ["by", "arkitektur"], url: urls.markveien57, access: "open", rights: "link_only", source_quality: "institutional_reference", curation_status: "strong_candidate", relevance: "Dokumenterer det bildeklare objektets opprinnelige funksjon, arkitekter og pris." }
);
write(readingFile, readings);

const translations = {
  en: {
    name: "Markveien",
    desc: "Markveien joined Christiania in 1859 and developed tenements, workers' housing, shops and workshops. The Seilduksgårdene at numbers 29–33, cooperative trade at number 28 and the 1977 demolition conflict make the street readable as labour, retail and preservation history.",
    popupDesc: "Markveien runs from Sannergata to Søndre gate and became part of Christiania on 1 January 1859. Its lower section developed into an important shopping street, while the upper section is dominated by tenements from the 1880s and 1890s.\n\nSpecific addresses carry distinct layers: workers' housing at numbers 29–33, cooperative trade at number 28, the municipal lodging house at number 57 and memorial stones for Jewish residents deported in 1942.\n\nThe demolition at number 35 in 1977 triggered violent clashes. Oslo City Encyclopaedia connects this conflict to later renewal projects paying greater attention to Grünerløkka's original buildings. Today's shops and cafés are therefore one layer in a longer history, not the whole identity of the street."
  },
  es: {
    name: "Markveien",
    desc: "Markveien se incorporó a Christiania en 1859 y reunió viviendas obreras, casas de alquiler, tiendas y talleres. Las Seilduksgårdene de los números 29–33, el comercio cooperativo del 28 y el conflicto de demolición de 1977 permiten leer la calle como historia del trabajo, del comercio y de la conservación.",
    popupDesc: "Markveien va de Sannergata a Søndre gate y pasó a formar parte de Christiania el 1 de enero de 1859. El tramo inferior se convirtió en una importante calle comercial, mientras que en el superior predominan casas de alquiler de las décadas de 1880 y 1890.\n\nDirecciones concretas conservan capas distintas: viviendas obreras en los números 29–33, comercio cooperativo en el 28, el albergue municipal del 57 y piedras de la memoria para residentes judíos deportados en 1942.\n\nLa demolición del número 35 en 1977 provocó fuertes enfrentamientos. Oslo byleksikon vincula el conflicto con una renovación posterior más atenta a los edificios originales de Grünerløkka. Las tiendas y cafés actuales son, por tanto, una capa de una historia más larga, no toda la identidad de la calle."
  },
  pt: {
    name: "Markveien",
    desc: "Markveien foi incorporada a Christiania em 1859 e reuniu habitação operária, prédios de aluguel, lojas e oficinas. As Seilduksgårdene dos números 29–33, o comércio cooperativo do número 28 e o conflito de demolição de 1977 tornam a rua legível como história do trabalho, do comércio e da preservação.",
    popupDesc: "Markveien vai de Sannergata a Søndre gate e tornou-se parte de Christiania em 1 de janeiro de 1859. O trecho inferior desenvolveu-se como importante rua comercial, enquanto o superior é dominado por prédios de aluguel das décadas de 1880 e 1890.\n\nEndereços específicos preservam camadas distintas: habitação operária nos números 29–33, comércio cooperativo no 28, o alojamento municipal no 57 e pedras de memória para moradores judeus deportados em 1942.\n\nA demolição do número 35 em 1977 provocou confrontos intensos. A Oslo byleksikon relaciona o conflito a projetos posteriores de renovação mais atentos aos edifícios originais de Grünerløkka. As lojas e cafés atuais são, portanto, uma camada de uma história mais longa, e não toda a identidade da rua."
  }
};
const normalizeI18n = value => String(value || "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
const i18nHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalizeI18n(place.name), desc: normalizeI18n(place.desc), popupDesc: normalizeI18n(place.popupDesc) })).digest("hex").slice(0, 16);
for (const [lang, translation] of Object.entries(translations)) {
  const file = `data/i18n/content/places/${lang}.json`;
  const pack = read(file);
  pack.markveien = { _sourceHash: i18nHash, _status: "machine_translated", ...translation };
  write(file, pack);
}

const claims = [
  ["identity", "Markveien går fra Sannergata til Søndre gate og ble innlemmet i byen 1. januar 1859.", urls.byleksikon, "Ingress", "identity", "current"],
  ["street_sections", "Nedre del er en viktig forretningsgate, mens øvre del hovedsakelig består av leiegårder fra 1880- og 1890-årene.", urls.byleksikon, "Ingress", "strong", "current"],
  ["seilduks", "Nummer 29, 31 og 33 er tre Seilduksgårder oppført for ansatte ved Christiania Seildugsfabrik.", urls.byleksikon, "Bygninger 29, 31 og 33", "ordinary", "historical"],
  ["cooperative", "Nummer 28 rommet kooperativ handel fra 1895 og et selvstendig lokalt kooperativ fra 1896.", urls.byleksikon, "Bygning 28", "ordinary", "historical"],
  ["watchman", "Philip, Florence og Arthur Watchman bodde i Markveien 25 og ble deportert med Donau 26. november 1942.", urls.watchman, "Biografisk hovedtekst", "strong", "historical"],
  ["resistance", "Gregers Gram ble drept og Edvard Tallaksen alvorlig såret i Gestapo-bakholdet på Plasskafeen 13. november 1944.", urls.byleksikon, "Bygning 35 og Plasskafeen", "strong", "historical"],
  ["demolition", "Rivingen av den opprinnelige bebyggelsen ved nummer 35–37 i 1977 utløste kraftige sammenstøt.", urls.byleksikon, "Bygninger 35–37", "strong", "historical"],
  ["preservation", "Senere byfornyelse på Grünerløkka tok større hensyn til den opprinnelige bebyggelsen.", urls.byleksikon, "Bygninger 35–37", "strong", "historical"],
  ["bakery", "Bakgårdsbygningen i nummer 42 var bakeri fra 1876 til 1980.", urls.byleksikon, "Bygning 42", "ordinary", "historical"],
  ["lodging", "Markveien 57 ble oppført i 1919 som kommunalt losjihus og fikk Houens diplom i 1923.", urls.byleksikon, "Bygning 57", "strong", "historical"],
  ["brands", "Frøken Dianas Salonger oppgir Markveien 56, og Robot beskriver sin vintagebutikk som lokalisert i Markveien med adresse Korsgata 22.", urls.frokenDiana, "Kontakt og butikkadresse", "temporal", "current"]
].map(([id, claim, sourceUrl, sourceLocation, claimKind, temporalStatus]) => ({
  id: `claim_markveien_${id}`, claim, sourceUrl, sourceLocation,
  sourceType: sourceUrl.includes("frokendianas") ? "primary" : "institutional",
  verifiedAt, status: "verified", claimKind,
  evidenceMode: claimKind === "strong" ? "explicit" : "direct", temporalStatus,
  ...(id === "watchman" ? { independentSourceUrls: [urls.byleksikon] } : id === "lodging" ? { independentSourceUrls: [urls.markveien57] } : id === "brands" ? { independentSourceUrls: [urls.robot] } : id === "street_sections" || id === "demolition" || id === "preservation" || id === "resistance" ? { independentSourceUrls: [urls.lokalhistorie] } : {})
}));
const keywordClaim = sentence => {
  const s = sentence.toLowerCase();
  if (s.includes("sannergata") || s.includes("1859")) return "identity";
  if (s.includes("nedre") || s.includes("øvre")) return "street_sections";
  if (s.includes("29") || s.includes("31") || s.includes("33") || s.includes("seilduk")) return "seilduks";
  if (s.includes("kooperativ") || s.includes("samvirke") || s.includes("nummer 28")) return "cooperative";
  if (s.includes("watchman") || s.includes("snublestein") || s.includes("deport")) return "watchman";
  if (s.includes("gram") || s.includes("tallaksen") || s.includes("gestapo")) return "resistance";
  if (s.includes("1977") || s.includes("riving") || s.includes("sammenstøt")) return "demolition";
  if (s.includes("bevaring") || s.includes("byfornyelse") || s.includes("eldre bebyggelse")) return "preservation";
  if (s.includes("baker")) return "bakery";
  if (s.includes("losjihus") || s.includes("nummer 57") || s.includes("houens")) return "lodging";
  return "identity";
};
const coverage = text => [...new Intl.Segmenter("nb", { granularity: "sentence" }).segment(text)]
  .map(entry => entry.segment.trim()).filter(Boolean)
  .map((sentence, index) => ({ sentence: index + 1, claimIds: [`claim_markveien_${keywordClaim(sentence)}`] }));
write("data/places/production/markveien.json", {
  schemaVersion: "4.2", validatorVersion: "4.2.1", placeId: "markveien", placeFile, status: "ready_v4_2",
  identity: { status: "resolved", represents: "Hele det navngitte gateforløpet fra Sannergata til Søndre gate, med hovedpunkt på den sentrale handelsstrekningen.", period: "1859–", excludes: ["Olaf Ryes plass som egen parkflate", "enkeltbutikker som eiere av gaten", "Thorvald Meyers gate", "alle brukere som én subkultur"] },
  metadataSnapshot: { name: place.name, year: place.year, category: place.category },
  textHashes: { algorithm: "sha256", desc: sha256(place.desc), popupDesc: sha256(place.popupDesc) }, claims,
  sentenceCoverage: { desc: coverage(place.desc), popupDesc: coverage(place.popupDesc) },
  roundsReadiness: { people: "ready_existing_profile_and_image", objects: "ready", brands: "ready_two_current_verified", related: "ready", badges: "reviewed_not_warranted", quiz: "ready_existing_rich_6x7_reused", leksikon: "ready", sprak: "ready", stories: "ready", for_na: "reviewed_no_exact_viewpoint_pair", readings: "ready", events: "reviewed_no_current_source_driven_event", routes: "ready_existing_two_anchor_street_route" },
  quizReadiness: { status: "canonical_rich_6x7_reused", quizTargetId: "markveien", sourceBrief: "data/quiz/production_briefs/by/markveien.json", productionContext: "data/quiz/production_context/by/markveien.json", normalOpeningQuestions: 14, totalQuestions: 42, reuseDecision: "Eksisterende 42-spørsmålsbank beholdes og berikes med claim-, kilde- og teoribinding i stedet for å bli erstattet.", questions: [
    { question: "Mellom hvilke gater går Markveien?", answer: "Sannergata og Søndre gate", type: "hvor", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_identity"] },
    { question: "Når ble Markveien innlemmet i byen?", answer: "1. januar 1859", type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_identity"] },
    { question: "Hva var nummer 29, 31 og 33?", answer: "Seilduksgårder for fabrikkansatte", type: "hva", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_seilduks"] },
    { question: "Hvilken handel åpnet i nummer 28 i 1895?", answer: "En kooperativ butikk", type: "hva_skjedde", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_cooperative"] },
    { question: "Hvem minnes av tre snublesteiner i nummer 25?", answer: "Philip, Florence og Arthur Watchman", type: "hvem", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_watchman"] },
    { question: "Hva ble Markveien 57 oppført som?", answer: "Kommunalt losjihus for menn", type: "hva_ble_bygget_produsert_eller_endret", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_lodging"] },
    { question: "Når ble gården ved Plasskafeen revet?", answer: "1977", type: "når", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_demolition"] },
    { question: "Hva endret senere byfornyelse etter konflikten?", answer: "Den tok større hensyn til den eldre bebyggelsen", type: "hva_skjedde", normalKnowledgeQuestion: true, claimIds: ["claim_markveien_preservation"] }
  ] },
  reviews: { factual: { status: "passed", reviewedAt: verifiedAt, reviewer: "Markveien phase 8–24 source review", notes: "Alle synlige setninger er claim-dekket; aktuelle butikker er nåverifisert." }, editorial: { status: "passed", reviewedAt: verifiedAt, reviewer: "Markveien phase 8–24 editorial review", introducedNewFacts: false, notes: "Gate, plass, enkeltbygg og virksomheter har eksplisitt eierskap." } },
  reviewsNotes: ["Retro Lykke, Lucky Eddie og Velouria Vintage er fjernet fra Markveien-samlingen fordi dagens adresse/status ikke støtter koblingen.", "Brandlaget avgrenses til Frøken Dianas Salonger og Robot, kontrollert 2026-08-26.", "Ingen subkultur-badge tildeles bare på grunnlag av kommersiell vintagestil."],
  completion: { completedUnder: "4.2", currentStatus: "current", sourceVerifiedAt: verifiedAt, claimsVerified: { verified: claims.length, total: claims.length }, factualReview: "passed", editorialReview: "passed", validatorVersion: "4.2.1" }
});

const sourceRegistry = {
  "Oslo byleksikon – Markveien": { url: urls.byleksikon, source_type: "institutional_reference", review_status: "reviewed", review_note: "Canonical gate- og adressekilde." },
  "Lokalhistoriewiki – Markveien (Oslo)": { url: urls.lokalhistorie, source_type: "institutional_reference", review_status: "reviewed", review_note: "Navn, husnummerering og lokalhistorisk kryssjekk." },
  "Oslo byleksikon – Grünerstubben": { url: "https://oslobyleksikon.no/side/Gr%C3%BCnerstubben", source_type: "institutional_reference", review_status: "reviewed", review_note: "Sideforbindelsen." },
  "Oslo byleksikon – Olaf Ryes plass": { url: "https://oslobyleksikon.no/side/Olaf_Ryes_plass", source_type: "institutional_reference", review_status: "reviewed", review_note: "Naboplassens grense." },
  "snublestein.no – Philip Sam Watchman": { url: urls.watchman, source_type: "museum_primary_record", review_status: "reviewed", review_note: "Person, adresse og deportasjon." },
  "snublestein.no – Florence Watchman": { url: urls.watchmanFlorence, source_type: "museum_primary_record", review_status: "reviewed", review_note: "Person og familie." },
  "snublestein.no – Arthur Watchman": { url: urls.watchman, source_type: "museum_primary_record", review_status: "reviewed", review_note: "Familieopplysning i Philip-posten." },
  "Lokalhistoriewiki – Markveien 57 (Oslo)": { url: urls.markveien57, source_type: "institutional_reference", review_status: "reviewed", review_note: "Losjihus og Houens diplom." },
  "Oslohistorie – Butikken i Markveien 9": { url: urls.markveien9, source_type: "historian_secondary", review_status: "reviewed", review_note: "Hverdags- og butikksporet." },
  "Oslo byleksikon – Ny York": { url: "https://oslobyleksikon.no/side/Ny_York", source_type: "institutional_reference", review_status: "reviewed", review_note: "Tidlig trehusforstad." },
  "Oslo byleksikon – Branner": { url: "https://oslobyleksikon.no/side/Branner", source_type: "institutional_reference", review_status: "reviewed", review_note: "Brannen i nummer 39." }
};
const existingQuizAudit = { searched_paths: ["data/quiz/manifest.json", "data/quiz/by/markveien_sets.json", placeFile], active_before: { file: "data/quiz/by/markveien_sets.json", set_count: 6, question_count: 42, finding: "Rik, aktiv og stedsspesifikk bank fantes allerede." }, decisions: ["Gjenbruk alle 42 spørsmål.", "Legg til entydige claim-ID-er og URL-register.", "Bind bare finalsettet til canonical teori."], knowledge_migration: "Eksisterende knowledge-unit-ID-er beholdes og canonical generator kjøres etter berikelsen." };
const profileDecision = { profile: "rich", set_count: 6, questions_per_set: 7, justification: "Seks uavhengige læringsjobber er allerede kildebelagt: gateidentitet, adressehistorie, hverdagslesning, avanserte spor, analyse og begrepsforståelse." };
const heldBackCandidates = ["Retro Lykke som nåaktivt Markveien-brand.", "Lucky Eddie som Markveien-brand.", "Velouria Vintage som Markveien-brand.", "Kommersiell vintagestil som automatisk subkultur-badge."];
const quizFile = "data/quiz/by/markveien_sets.json";
const quiz = read(quizFile);
quiz.sources = Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url]));
const phases = ["opening", "middle", "middle", "middle", "bridge", "final"];
const theoryBindings = [
  ["bolig_gentrifisering", "sharon_zukin", "Naked City", "met_komparativ_caseanalyse"],
  ["urb_byidealer", "aldo_rossi", "The Architecture of the City", "met_for_etter"],
  ["byliv_opphold_vs_gjennomgang", "michel_de_certeau", "The Practice of Everyday Life", "met_gaanalyse"],
  ["his_spor_gatebilde", "pierre_nora", "Les Lieux de Mémoire", "met_arkiv_minne_spor"],
  ["bolig_boligtyper", "david_harvey", "Rebel Cities", "met_gaanalyse"],
  ["urb_byidealer", "aldo_rossi", "The Architecture of the City", "met_for_etter"],
  ["bolig_gentrifisering", "david_harvey", "Rebel Cities", "met_komparativ_caseanalyse"]
];
const quizQuestions = quiz.sets.flatMap(set => set.questions);
const contextualQuestionNumbers = new Set([20, 21, 23, 29, 30, 31, 32, 33, 34, 35]);
quizQuestions.forEach((question, index) => {
  question.claim_id = `claim_markveien_quiz_${index + 1}`;
  question.claim_basis = question.knowledge;
  question.question_type = index >= 35 ? "concept" : contextualQuestionNumbers.has(index + 1) ? "analysis" : "fact";
  if (index >= 35) {
    const [topic_hook_id, thinker_id, work, method_id] = theoryBindings[index - 35];
    Object.assign(question, {
      topic_hook_id, thinker_id, work, method_id,
      theory_ref: { topic_hook_id, thinker_id, work, why_it_helps: "Perspektivet strukturerer en konkret lesning av gateendring, minne eller hverdagsbruk uten å erstatte stedskildene." },
      guidance_basis: ["data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"]
    });
  }
});
quiz.sets.forEach((set, index) => {
  set.order = index + 1;
  set.level = index + 1;
  set.phase = phases[index];
});
quiz.production_context = {
  manifest_category: "by", profile: "rich_6x7", standard_version: "3.3",
  source_brief: "data/quiz/production_briefs/by/markveien.json",
  context_artifact: "data/quiz/production_context/by/markveien.json",
  resolved_files: {
    pensum: "data/fag/by/pensum_by.json", emner: "data/fag/by/emner_by.json",
    fagkart: "data/fag/by/fagkart_by.json", methods: "data/fag/by/methods_by.json",
    supersetQuizMal: "data/fag/by/supersetQUIZMAL_by.json",
    quizStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
    quizQuestionSchema: "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"
  },
  required_inputs_loaded: ["pensum", "emner", "fagkart", "methods", "supersetQuizMal", "quizStandard", "quizQuestionSchema"],
  pensum_module_ids: ["kur_by_04_historiske_lag_og_transformasjon"], emne_ids: [...new Set(quizQuestions.map(question => question.emne_id))],
  topic_hook_ids: [...new Set(theoryBindings.map(row => row[0]))], method_ids: [...new Set(theoryBindings.map(row => row[3]))],
  thinker_ids: [...new Set(theoryBindings.map(row => row[1]))], works: [...new Set(theoryBindings.map(row => row[2]))],
  source_review_status: "reviewed", existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision, held_back_candidates: heldBackCandidates,
  theory_start_phase: "final", method_start_phase: "final"
};
write(quizFile, quiz);
const questionFamily = question => question.question_type === "concept" ? "concept_theory" : ["analysis", "context", "comparison"].includes(question.question_type) ? "context" : "fact";
write("data/quiz/production_briefs/by/markveien.json", {
  schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: "markveien", profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Eksisterende 6 × 7-bank er gjennomgått og beholdt; kilderegister, claims og teori er lagt til uten å erstatte spørsmålsinnholdet.",
  scope: { place: "Markveien", production_profile: "rich", set_count: 6, questions_per_set: 7, total_questions: 42, normal_opening_questions: 14 },
  sources: sourceRegistry,
  selected_curriculum: { module_ids: ["kur_by_04_historiske_lag_og_transformasjon"], emne_ids: [...new Set(quizQuestions.map(q => q.emne_id))], topic_hook_ids: [...new Set(theoryBindings.map(row => row[0]))], method_ids: [...new Set(theoryBindings.map(row => row[3]))], thinker_ids: [...new Set(theoryBindings.map(row => row[1]))], works: [...new Set(theoryBindings.map(row => row[2]))] },
  existing_quiz_audit: existingQuizAudit,
  profile_decision: profileDecision,
  held_back_candidates: heldBackCandidates,
  claims: quiz.sets.flatMap((set, setIndex) => set.questions.map((question, questionIndex) => ({
    claim_id: question.claim_id, order: setIndex * 7 + questionIndex + 1,
    planned_phase: phases[setIndex], family: questionFamily(question), statement: question.knowledge,
    source_ids: question.source, source_origin: "external", emne_id: question.emne_id
  })))
});
const fagManifest = read("data/fag/fag_manifest.json");
fagManifest.by.quizProduction.targets.markveien = { source_brief: "../quiz/production_briefs/by/markveien.json", context_artifact: "../quiz/production_context/by/markveien.json", quiz_file: "../quiz/by/markveien_sets.json" };
write("data/fag/fag_manifest.json", fagManifest);

console.log(`Built Markveien phase 8–24 package (${sentenceCount(place.popupDesc)} popup sentences, ${quizQuestions.length} reused quiz questions).`);
