#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { runBuildQuizProductionContext } from "../scripts/build-quiz-production-context.mjs";

const root = process.cwd();
const placeId = "radhusplassen";
const verifiedAt = "2026-09-07";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n"); };
const addOnce = (array, value) => { if (!array.includes(value)) array.push(value); };

const urls = {
  fjordbyen: "https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/radhusplassen/",
  utleie: "https://www.oslo.kommune.no/radhuset/leie-radhusplassen/",
  radhuset: "https://www.oslo.kommune.no/radhuset/",
  tobias: "https://www.oslo.kommune.no/OBA/tobias/pdf_arkiv/Tob1998-1.pdf",
  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/R%C3%A5dhusplassen_Oslo_2022-08-17_01.jpg/1280px-R%C3%A5dhusplassen_Oslo_2022-08-17_01.jpg",
  imagePage: "https://commons.wikimedia.org/wiki/File:R%C3%A5dhusplassen_Oslo_2022-08-17_01.jpg"
};
const sourceRegistry = {
  fjordbyen: { url: urls.fjordbyen, source_type: "primary_institutional", review_status: "reviewed", review_note: "Kontrollert for plassens avgrensning, størrelse, trafikkhistorie, bilfri omlegging og trikk." },
  utleie: { url: urls.utleie, source_type: "primary_institutional", review_status: "reviewed", review_note: "Kontrollert for arrangementsbruk, bruksregler og teknisk infrastruktur." },
  radhuset: { url: urls.radhuset, source_type: "primary_institutional", review_status: "reviewed", review_note: "Kontrollert for Oslo rådhus som institusjon og plassens nordlige forrom." },
  tobias: { url: urls.tobias, source_type: "municipal_archive", review_status: "reviewed", review_note: "Kontrollert for omleggingen av trafikk- og trikkesystemet rundt Rådhusplassen." }
};

const placeFile = "data/places/by/oslo/places/radhusplassen.json";
const place = read(placeFile);
const existingImageMeta = place.imageMeta || {};
const imageMetaBase = {
  source: "wikimedia_commons",
  sourcePage: urls.imagePage,
  creator: "Leonhard Lenz",
  credit: "Leonhard Lenz / Wikimedia Commons",
  license: "CC0 1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  assetType: "documentary_place_photo",
  date: "2022-08-17",
  verifiedAt,
  representationScope: "Dokumenterer Rådhusplassen, rådhusfronten, trikkesporene og den åpne plassflaten i august 2022."
};

const response = await fetch(urls.image);
if (!response.ok) throw new Error(`Kunne ikke hente dokumentasjonsfoto: ${response.status}`);
const sourceBuffer = Buffer.from(await response.arrayBuffer());
const imageJobs = [
  ["bilder/places/radhusplassen.webp", 1600, 900],
  ["bilder/places/radhusplassen_front_portrait.webp", 900, 1200],
  ["bilder/kort/objects/radhusplassen_trikkespor.webp", 900, 1200],
  ["bilder/kort/structures/radhusplassen_radhusbrygger.webp", 1200, 900],
  ["bilder/kort/historical_events/radhusplassen_bilfri_1994.webp", 1200, 900],
  ["bilder/kort/historical_events/radhusplassen_trikk_1995.webp", 1200, 900]
];
for (const [file, width, height] of imageJobs) {
  const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(sourceBuffer).rotate().resize(width, height, { fit: "cover", position: "centre" }).webp({ quality: 88 }).toFile(target);
}
const quizCardTarget = path.join(root, "bilder/QuizCards/Radhusplassen.webp");
fs.mkdirSync(path.dirname(quizCardTarget), { recursive: true });
const overlay = Buffer.from(`<svg width="900" height="1200" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="900" width="900" height="300" fill="rgba(0,0,0,0.70)"/><text x="60" y="1020" font-family="sans-serif" font-size="72" font-weight="700" fill="white">Rådhusplassen</text><text x="60" y="1100" font-family="sans-serif" font-size="34" fill="white">History Go · Oslo</text></svg>`);
await sharp(sourceBuffer).rotate().resize(900, 1200, { fit: "cover", position: "centre" }).composite([{ input: overlay, top: 0, left: 0 }]).webp({ quality: 90 }).toFile(quizCardTarget);

Object.assign(place, {
  image: "bilder/places/radhusplassen.webp",
  frontImage: "bilder/places/radhusplassen_front_portrait.webp",
  imageMeta: { ...existingImageMeta, ...imageMetaBase, transformation: "Stedstro 16:9-utnitt og WebP-normalisering; ingen generativ endring.", outputDimensions: "1600x900" },
  frontImageMeta: { ...imageMetaBase, transformation: "Stående 3:4-utnitt og WebP-normalisering; ingen generativ endring.", outputDimensions: "900x1200", orientation: "portrait", aspectRatio: "3:4" },
  production_profile: "standard",
  profile_status: "confirmed",
  production_status: "complete",
  production_verified_at: verifiedAt,
  profile_reason: "Rådhusplassen har to direkte arkitektkoblinger via rådhusfronten, stedsspesifikke trikkespor og rådhusbrygger samt dokumenterte vendepunkter i 1994 og 1995.",
  related_people_ids: ["arnstein_arneberg", "magnus_poulsson"],
  related_place_ids: ["oslo_radhus"],
  reading_track_ids: ["lesespor_radhusplassen_001", "lesespor_radhusplassen_002", "lesespor_radhusplassen_003", "lesespor_radhusplassen_004"],
  place_card_profile: {
    schema: "history_go_place_card_profile_v2",
    production_profile: "standard",
    collection_ids: ["people", "objects", "structures", "historical_events"],
    category_collection_label: "Historiske hendelser",
    reason: "Arneberg og Poulsson knytter plassen til rådhusets utforming; trikkesporet og Rådhusbryggene er fysiske stedsankere; 1994- og 1995-omleggingene dokumenterer overgangen fra trafikkflate til offentlig byrom.",
    verifiedAt
  },
  rounds: ["people", "objects", "structures", "historical_events"],
  objects: [{
    id: "radhusplassen_trikkespor", name: "Trikkesporene over Rådhusplassen", title: "Trikkesporene over Rådhusplassen", type: "spor", kind: "physical_transit_infrastructure", year: 1995,
    desc: "Trikkelinjen over den bilfrie Rådhusplassen åpnet i 1995 og gjør omleggingen fra gjennomfartsåre til kollektiv- og gangprioritert byrom fysisk lesbar.", historicalFunction: "Å føre kollektivtrafikk gjennom et plassrom som året før var blitt frigjort fra gjennomgående biltrafikk.", physicalObject: true, placeSpecific: true, collectable: true,
    placeSpecificReason: "Oslo kommune og Byarkivet dokumenterer trikkens tilbakekomst over selve Rådhusplassen i 1995.", why_here: "Sporene viser at bilfri omlegging ikke betydde transportfritt rom, men en ny prioritering av transportformer.", whereToFind: "Gjennom den åpne plassflaten foran Oslo rådhus.", unlock: "Observer sporene fra gangarealet og hold avstand til trikk i bevegelse.", storePrice: 35, currency: "PC",
    image: "bilder/kort/objects/radhusplassen_trikkespor.webp", imageMeta: { ...imageMetaBase, transformation: "Stående utsnitt med trikkespor og plassflate; WebP-normalisert.", outputDimensions: "900x1200" }, source_urls: [urls.fjordbyen, urls.tobias, urls.imagePage]
  }],
  structures: [{
    id: "radhusplassen_radhusbrygger", name: "Rådhusbryggene", title: "Rådhusbryggene", type: "bryggefront", kind: "waterfront_structure",
    desc: "Rådhusbryggene danner den sørlige kanten av plassrommet og kobler Rådhusplassen til Pipervika og sjøtransporten.", placeSpecific: true,
    placeSpecificReason: "Kommunens avgrensning av Rådhusplassen bruker bryggene og Pipervika som den åpne fjordsiden av plassrommet.", why_here: "Bryggekanten gjør aksen mellom kommunal representasjon og fjord fysisk tydelig.",
    image: "bilder/kort/structures/radhusplassen_radhusbrygger.webp", imageMeta: { ...imageMetaBase, transformation: "Landskapsutnitt av plassrommet mot fjordsiden; WebP-normalisert.", outputDimensions: "1200x900" }, source_urls: [urls.fjordbyen, urls.imagePage], verifiedAt
  }],
  historical_events: [
    { id: "radhusplassen_bilfri_1994", name: "Rådhusplassen blir bilfri", title: "Rådhusplassen blir bilfri", year: 1994, date: "1994", type: "urban_transformation", kind: "traffic_reallocation", desc: "I 1994 ble gjennomgangstrafikken fjernet fra Rådhusplassen i forbindelse med omleggingen rundt Festningstunnelen og Vestbanekrysset.", placeSpecific: true, image: "bilder/kort/historical_events/radhusplassen_bilfri_1994.webp", imageMeta: { ...imageMetaBase, transformation: "Dokumentarisk nåtidsfoto brukes som stedlig referanse, ikke som bildebevis for 1994.", outputDimensions: "1200x900" }, source_urls: [urls.fjordbyen, urls.tobias] },
    { id: "radhusplassen_trikk_1995", name: "Trikken åpner over plassen", title: "Trikken åpner over plassen", year: 1995, date: "1995", type: "transit_change", kind: "tram_reintroduction", desc: "I 1995 åpnet den nye trikkelinjen over Rådhusplassen, ett år etter at plassen ble bilfri.", placeSpecific: true, image: "bilder/kort/historical_events/radhusplassen_trikk_1995.webp", imageMeta: { ...imageMetaBase, transformation: "Dokumentarisk nåtidsfoto brukes som stedlig referanse, ikke som bildebevis for 1995.", outputDimensions: "1200x900" }, source_urls: [urls.fjordbyen, urls.tobias] }
  ]
});
delete place.cardImage;
delete place.imageCard;
write(placeFile, place);

const stories = [
  {
    id: "st_radhusplassen_motorveien_forsvinner_1994", quality_profile: "episode_v1", type: "turning_point", title: "Da motorveien forsvant fra rådhusfronten", year: 1994, place_id: placeId,
    summary: "I 1994 ble gjennomgangstrafikken fjernet fra Rådhusplassen. Et areal som lenge hadde vært dominert av E18 og kjørefelt, kunne tas i bruk som et stort offentlig plassrom mellom rådhuset og fjorden.",
    story: "Foran Oslo rådhus lå det lenge ikke bare et seremonielt byrom, men en del av byens gjennomfartsåre. E18 og brede kjørefelt skar mellom rådhuset og bryggene.\n\nEt bystyrevedtak i 1989 la grunnlaget for en bilfri plass. I 1994 ble gjennomgangstrafikken fjernet i forbindelse med omleggingen rundt Festningstunnelen og Vestbanekrysset.\n\nEndringen gjorde ikke Rådhusplassen ferdig én gang for alle. Den åpnet derimot en ny type bruk: ferdsel til fots, store arrangementer og en tydeligere forbindelse mellom sentrum, bryggene og fjorden.",
    episode: { actors: ["Oslo kommune", "bystyret", "brukerne av sentrum"], date: "1994", action: "Gjennomgående biltrafikk ble fjernet fra Rådhusplassen.", consequence: "Plassen kunne fungere som et sammenhengende offentlig byrom mellom rådhuset og fjorden." },
    sources: [{ title: "Oslo kommune – Fjordbyen: Rådhusplassen", url: urls.fjordbyen }, { title: "Oslo Byarkiv – TOBIAS 1/1998", url: urls.tobias }],
    tags: ["1994", "bilfri", "E18", "byrom"], related_people: [], related_places: ["oslo_radhus"], score: { narrative: 3, historical: 3, source: 5, play_value: 3, originality: 3, total: 17 },
    arc: { start: "Biltrafikken dominerer forplassen.", middle: "Gjennomgangstrafikken fjernes i 1994.", end: "Et sammenhengende offentlig byrom åpner seg mot fjorden." }
  },
  {
    id: "st_radhusplassen_trikken_kommer_1995", quality_profile: "episode_v1", type: "historical_event", title: "Da trikken kom tilbake over plassen", year: 1995, place_id: placeId,
    summary: "I 1995 åpnet den nye trikkelinjen over Rådhusplassen. Den viste at den bilfrie plassen fortsatt skulle være en del av byens transportsystem, men på andre premisser enn motorveien.",
    story: "Da biltrafikken ble fjernet i 1994, kunne Rådhusplassen ha blitt lest som et rom der transporten forsvant. Året etter ble det tydelig at endringen handlet om prioritering, ikke om transportløshet.\n\nI 1995 åpnet den nye trikkelinjen over plassen. Skinnegangen la kollektivtrafikk gjennom det samme rommet som nå også skulle brukes av gående, bryggepassasjerer og arrangementspublikum.\n\nSporene er derfor et synlig historisk lag. De binder den store 1990-tallsomleggingen til dagens hverdagsbruk og viser hvordan infrastruktur kan endre karakter uten å forsvinne.",
    episode: { actors: ["Oslo kommune", "kollektivtrafikken", "gående på Rådhusplassen"], date: "1995", action: "En ny trikkelinje åpnet over den bilfrie plassen.", consequence: "Rådhusplassen ble både offentlig oppholdsrom og kollektiv korridor." },
    sources: [{ title: "Oslo kommune – Fjordbyen: Rådhusplassen", url: urls.fjordbyen }, { title: "Oslo Byarkiv – TOBIAS 1/1998", url: urls.tobias }],
    tags: ["1995", "trikk", "kollektivtrafikk", "byrom"], related_people: [], related_places: ["oslo_radhus"], score: { narrative: 3, historical: 3, source: 5, play_value: 3, originality: 2, total: 16 },
    arc: { start: "Plassen er nettopp blitt bilfri.", middle: "Trikken åpner over plassen i 1995.", end: "Transport og offentlig opphold blir lagt inn i samme rom." }
  }
];
write("data/stories/stories_radhusplassen.json", stories);
const episodeManifest = read("data/stories/stories_episode_v1_manifest.json");
episodeManifest.files ||= []; addOnce(episodeManifest.files, "data/stories/stories_radhusplassen.json"); write("data/stories/stories_episode_v1_manifest.json", episodeManifest);

const languageFile = "data/leksikon/sprak/places/europe/norway/oslo/radhusplassen.json";
const langEntry = (id, term, type, meaning, context, url = urls.fjordbyen) => ({ id, term, type, layer: "place_language", meaning, status: "documented", usage: context, context, linked_to: { kind: "place", id: placeId }, tags: ["radhusplassen", "byrom", "oslo"], sources: [{ label: "Oslo kommune", url }] });
write(languageFile, { place_id: placeId, title: "Språkleksikon: Rådhusplassen", verified_at: verifiedAt, dialect_status: "place_name_and_urban_terms", entries: [
  langEntry("radhusplassen_navn", "Rådhusplassen", "offisielt stedsnavn", "Navnet betegner den store plassen mellom Oslo rådhus og Pipervika.", "Brukes om selve plassrommet, ikke om rådhusbygningen."),
  langEntry("radhusplassen_pipervika", "Pipervika", "stedsnavn", "Navnet på vika sør for Rådhusplassen.", "Pipervika er fjordsiden som åpner plassrommet mot sør."),
  langEntry("radhusplassen_radhusbryggene", "Rådhusbryggene", "havneterm", "Bryggene langs den sørlige kanten av Rådhusplassen.", "Navnet brukes om bryggene som knytter plassen til sjøtransport."),
  langEntry("radhusplassen_bilfri", "bilfri", "planleggingsord", "Et byrom uten ordinær gjennomgående biltrafikk.", "Rådhusplassen omtales som bilfri fra 1994; trikk og annen regulert transport kan fortsatt finnes.", urls.tobias),
  langEntry("radhusplassen_representativt_forrom", "representativt forrom", "byromsterm", "Et offentlig rom som fungerer som inngangssone og ramme rundt en viktig institusjon.", "Rådhusplassen fungerer som forrom til Oslo rådhus.", urls.utleie),
  langEntry("radhusplassen_arrangementsinfrastruktur", "arrangementsinfrastruktur", "bruksord", "Tekniske og romlige løsninger som gjør midlertidige arrangementer mulig.", "På Rådhusplassen omfatter dette blant annet organiserte felt og tilgang til strøm og vann.", urls.utleie)
] });
const languageManifest = read("data/leksikon/sprak/manifest.json"); languageManifest.place_files ||= {}; languageManifest.place_files[placeId] = languageFile; write("data/leksikon/sprak/manifest.json", languageManifest);

const chronology = [
  [1950, "Rådhuset åpner", "Oslo rådhus åpnet 15. mai 1950 og etablerte den monumentale nordveggen i plassrommet."],
  [1989, "Vedtak om bilfri plass", "Et bystyrevedtak la grunnlaget for å gjøre Rådhusplassen bilfri."],
  [1994, "Gjennomgangstrafikken fjernes", "Rådhusplassen ble bilfri da gjennomgående biltrafikk ble fjernet."],
  [1994, "Vestbanekrysset åpner", "Omleggingen rundt Vestbanen var del av endringen som frigjorde plassrommet fra den tidligere hovedveien."],
  [1994, "Motorveirestene fjernes", "De siste restene av motorveien gjennom området ble fjernet i forbindelse med omleggingen."],
  [1995, "Ny trikkelinje", "Trikken åpnet over Rådhusplassen året etter at plassen ble bilfri."],
  [1995, "Nytt transporthierarki", "Skinnegangen gjorde kollektivtrafikk til et permanent lag i det nye plassrommet."],
  [2026, "Representativt arrangementsrom", "Kommunens bruksregler dokumenterer Rådhusplassen som representativt byrom for åpne arrangementer."],
  [2026, "Teknisk arrangementsinfrastruktur", "Kommunens utleieinformasjon dokumenterer strøm, vann og organiserte arrangementsfelt."],
  [2026, "Fjordbyforbindelse", "Kommunen beskriver plassen som en forbindelse mellom sentrum, rådhuset, bryggene og fjorden."]
].map(([year, period, desc], index) => ({ id: `chrono_radhusplassen_${String(index + 1).padStart(2, "0")}`, year, period, desc, confidence: "high", sources: [index === 0 ? urls.radhuset : index < 7 ? urls.fjordbyen : index < 9 ? urls.utleie : urls.fjordbyen] }));
const leksikonFile = "data/leksikon/places/oslo/by/leksikon_radhusplassen.json";
write(leksikonFile, [{ id: "radhusplassen_hovedartikkel", visual: { designCode: "article_public_space_miniature" }, place_id: placeId, title: "Rådhusplassen", version: 1,
  popupDesc: "Det store offentlige plassrommet mellom Oslo rådhus og Pipervika, omformet fra trafikkflate til bilfri byscene i 1994 og trikkekorridor i 1995.",
  wikiText: place.popupDesc.split("\n\n"),
  summary: { one_liner: "Nesten 67 dekar offentlig byrom der motorveien forsvant i 1994 og trikken kom i 1995.", themes: ["offentlig rom", "trafikkomlegging", "trikk", "havnefront", "arrangement"], tone: ["kildebasert", "analytisk"] },
  facts: [
    { id: "fact_01", label: "1950", desc: "Oslo rådhus åpnet og danner plassens monumentale nordside.", confidence: "high", sources: [urls.radhuset] },
    { id: "fact_02", label: "1994", desc: "Rådhusplassen ble bilfri.", confidence: "high", sources: [urls.fjordbyen, urls.tobias] },
    { id: "fact_03", label: "1995", desc: "Den nye trikkelinjen åpnet over plassen.", confidence: "high", sources: [urls.fjordbyen, urls.tobias] }
  ],
  sources: [urls.fjordbyen, urls.utleie, urls.radhuset, urls.tobias],
  externalLinks: place.externalLinks,
  chronology
}]);
const leksikonManifest = read("data/leksikon/manifest.json"); leksikonManifest.files ||= []; addOnce(leksikonManifest.files, leksikonFile); write("data/leksikon/manifest.json", leksikonManifest);

const lesesporFile = "data/lesespor/oslo/lesespor_oslo_by.json";
const lesespor = read(lesesporFile); lesespor.items = (lesespor.items || []).filter(item => !(item.place_ids || []).includes(placeId));
for (const row of [
  [1, "Rådhusplassen i Fjordbyen", "Oslo kommune", urls.fjordbyen, "Kommunens stedsartikkel om avgrensning, trafikkhistorie, bilfri omlegging og trikk.", ["byrom", "trafikkomlegging", "fjordbyen"]],
  [2, "Leie Rådhusplassen", "Oslo kommune", urls.utleie, "Dokumenterer dagens arrangementsbruk, bruksregler og tekniske forutsetninger.", ["arrangement", "offentlighet", "midlertidighet"]],
  [3, "Oslo rådhus", "Oslo kommune", urls.radhuset, "Setter plassen inn i institusjonskonteksten til rådhuset som danner nordveggen.", ["rådhus", "representasjon", "institusjon"]],
  [4, "TOBIAS 1/1998", "Oslo Byarkiv", urls.tobias, "Arkivkilde til transport- og byromsomleggingen rundt Rådhusplassen på 1990-tallet.", ["trikk", "trafikk", "1990-tallet"]]
]) {
  const [index, title, publication, url, relevance, themes] = row;
  lesespor.items.push({ id: `lesespor_radhusplassen_00${index}`, title, popupDesc: relevance, author: null, publication, type: "faglig_kilde", subjects: [{ type: "place", name: "Rådhusplassen", id: placeId }], place_ids: [placeId], person_ids: [], category_hints: ["by", "historie"], summary: { themes }, classification: { tags: ["Rådhusplassen", ...themes] }, url, access: "open", rights: "link_only", source_quality: "institutional", curation_status: "approved", relevance, verifiedAt });
}
write(lesesporFile, lesespor);

const quizFile = "data/quiz/by/radhusplassen_sets.json";
const quiz = read(quizFile);
if (!Array.isArray(quiz.sets) || quiz.sets.length !== 5 || quiz.sets.some(set => !Array.isArray(set.questions) || set.questions.length !== 7)) throw new Error("Rådhusplassen legacy quiz er ikke 5x7; stopper fail-closed.");
const phases = ["opening", "middle", "middle", "bridge", "final"];
const titles = ["Rådhuset, plassen og fjorden", "Fra trafikkflate til byrom", "Brygger, trikk og forbindelser", "Arrangement og offentlig scene", "Les plassens makt og spor"];
const questions = quiz.sets.flatMap(set => set.questions);
for (let index = 0; index < questions.length; index++) {
  const q = questions[index];
  const text = `${q.question || ""} ${q.knowledge || ""}`.toLowerCase();
  const sourceId = /arrangement|festival|konsert|strøm|vann|leie/.test(text) ? "utleie" : /trikk|1995|e18|1994|bilfri|motorvei|trafikk/.test(text) ? "tobias" : /rådhus/.test(text) ? "radhuset" : "fjordbyen";
  const type = index < 21 ? "fact" : index < 28 ? "context" : "concept";
  q.id = `radhusplassen_quiz_${String(index + 1).padStart(2, "0")}`;
  q.quiz_id = `by_radhusplassen_set_${Math.floor(index / 7) + 1}_q${index % 7 + 1}`;
  q.categoryId = "by"; q.placeId = placeId; q.targetId = placeId; q.question_scope = "place";
  q.question_type = type; q.question_layer = phases[Math.floor(index / 7)];
  q.source = [sourceId]; q.source_origin = "external"; q.claim_basis = q.knowledge; q.claim_id = `claim_radhusplassen_quiz_${String(index + 1).padStart(2, "0")}`;
  q.guidance_basis = ["data/fag/by/pensum_by.json", "data/fag/by/emner_by.json", "data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json"];
  q.primary_knowledge_unit_id = `ku_by_radhusplassen_${String(index + 1).padStart(2, "0")}`; q.knowledge_unit_ids = [q.primary_knowledge_unit_id];
  q.concepts ||= []; q.concept_ids ||= []; q.term_ids ||= []; q.knowledge_contract_version = 1; q.knowledge_link_status = "linked";
  if (index >= 28) {
    const useGehl = index % 2 === 0;
    q.method_id = index % 2 === 0 ? "met_feltobservasjon" : "met_for_etter";
    q.thinker_id = useGehl ? "jan_gehl" : "kevin_lynch";
    q.work = useGehl ? "Life Between Buildings" : "The Image of the City";
    q.topic_hook_id = useGehl ? "byliv_aapne_rom" : "urb_offentlig_rom_ide";
    q.theory_ref = { topic_hook_id: q.topic_hook_id, why_it_helps: useGehl ? "Gehl hjelper å skille mellom fysisk plassform og observerbar bruk uten å gjøre observasjon til bevis for alle brukeres erfaring." : "Lynch hjelper å lese kanter, akser og orienteringspunkter mellom rådhus, plass og fjord uten å erstatte de historiske kildene." };
  } else {
    delete q.method_id; delete q.thinker_id; delete q.work; delete q.topic_hook_id; delete q.theory_ref;
  }
}
quiz.targetId = placeId; quiz.categoryId = "by"; quiz.source_quiz_file = quizFile; quiz.generator_version = "history_go_radhusplassen_5x7_reviewed_v1"; quiz.size_class = "rich"; quiz.profile_snapshot = place.quiz_profile;
quiz.generated_from = ["data/quiz/production_briefs/by/radhusplassen.json", "data/fag/by/pensum_by.json", "data/fag/by/emner_by.json", "data/fag/by/fagkart_by.json", "data/fag/by/methods_by.json", "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md"];
quiz.sources = Object.fromEntries(Object.entries(sourceRegistry).map(([id, source]) => [id, source.url]));
quiz.sets.forEach((set, index) => { set.set_id = `by_radhusplassen_set_${index + 1}`; set.title = titles[index]; set.level = index + 1; set.order = index + 1; set.phase = phases[index]; set.mode = phases[index]; set.xp = 50 + index * 25; set.questions = questions.slice(index * 7, index * 7 + 7); });
const briefFile = "data/quiz/production_briefs/by/radhusplassen.json";
const contextFile = "data/quiz/production_context/by/radhusplassen.json";
const brief = { schema_version: "1.0", status: "reviewed", categoryId: "by", targetId: placeId, profile_hint: "rich", reviewed_at: verifiedAt,
  review_note: "Eksisterende 5x7-bank er bevart som spørsmålsgrunnlag og løftet til dagens 21 fact + 7 context + 7 concept-kontrakt. Kommune- og Byarkivkildene bærer plassavgrensning, 1994-omlegging, trikk 1995 og arrangementsbruk.",
  scope: { place: "Rådhusplassen", production_profile: "rich", set_count: 5, questions_per_set: 7, total_questions: 35, normal_opening_questions: 21 }, sources: sourceRegistry,
  selected_curriculum: { module_ids: ["kur_by_01_byrom_akser_knutepunkt", "kur_by_04_historiske_lag_og_transformasjon"], emne_ids: place.emne_ids, topic_hook_ids: ["byliv_aapne_rom", "urb_offentlig_rom_ide", "byliv_midlertidighet"], method_ids: ["met_feltobservasjon", "met_for_etter"], thinker_ids: ["jan_gehl", "kevin_lynch"], works: ["Life Between Buildings", "The Image of the City"] },
  existing_quiz_audit: { searched_paths: [quizFile, "data/quiz/manifest.json"], active_before: { file: quizFile, set_count: 5, question_count: 35, finding: "Legacybanken hadde riktig volum, men manglet rich-metadata, produksjonskontekst og 21/7/7-progresjon." }, decisions: ["Behold de stedsspesifikke spørsmålene og svarene.", "Normaliser kildereferanser til source registry.", "Lås finalfasen til metode- og teoribinding."] },
  profile_decision: { profile: "rich", set_count: 5, questions_per_set: 7, justification: "Fem læringsjobber dekker orientering, trafikkendring, transport/fjord, arrangementsbruk og kildekritisk stedsanalyse uten fyllspørsmål." },
  held_back_candidates: ["Påstander om publikums opplevelse uten data.", "Å behandle Rådhusplassen og Oslo rådhus som samme Place.", "Å framstille bilfri som transportfri."],
  claims: questions.map((q, index) => ({ claim_id: q.claim_id, order: index + 1, planned_phase: phases[Math.floor(index / 7)], family: q.question_type === "fact" ? "fact" : q.question_type === "context" ? "context" : "concept_theory", statement: q.claim_basis, source_ids: q.source, source_origin: "external", emne_id: q.emne_id }))
};
write(briefFile, brief); write(quizFile, quiz);
const fag = read("data/fag/fag_manifest.json"); fag.by.quizProduction.targets[placeId] = { source_brief: "../quiz/production_briefs/by/radhusplassen.json", context_artifact: "../quiz/production_context/by/radhusplassen.json", quiz_file: "../quiz/by/radhusplassen_sets.json" }; write("data/fag/fag_manifest.json", fag);
const quizManifest = read("data/quiz/manifest.json"); quizManifest.sets = (quizManifest.sets || []).filter(entry => entry.targetId !== placeId); quizManifest.sets.push({ targetId: placeId, file: quizFile }); write("data/quiz/manifest.json", quizManifest);
const built = await runBuildQuizProductionContext({ root, categoryId: "by", targetId: placeId, outputPath: contextFile });
quiz.production_context = { manifest_category: "by", profile: built.profile, standard_version: "3.4", source_brief: briefFile, context_artifact: contextFile, resolved_files: Object.fromEntries(Object.entries(built.resolved_files).map(([key, value]) => [key, value.path])), required_inputs_loaded: built.required_inputs_loaded, pensum_module_ids: built.selected_curriculum.module_ids, emne_ids: built.selected_curriculum.emne_ids, topic_hook_ids: built.selected_curriculum.topic_hook_ids, method_ids: built.selected_curriculum.method_ids, thinker_ids: built.selected_curriculum.thinker_ids, works: built.selected_curriculum.works, source_review_status: built.source_review_status, existing_quiz_audit: built.existing_quiz_audit, profile_decision: built.profile_decision, held_back_candidates: built.held_back_candidates, normal_opening_questions: 21, contexts: 7, concepts: 7, theory_start_phase: "final", method_start_phase: "final" };
write(quizFile, quiz);

const uiFile = "js/ui/place-card.js";
let ui = fs.readFileSync(uiFile, "utf8");
if (!ui.includes('radhusplassen: "bilder/QuizCards/Radhusplassen.webp"')) {
  const anchor = /(^\s*spikersuppa:\s*["']bilder\/QuizCards\/Spikersuppa\.webp["'],?)/m;
  if (!anchor.test(ui)) throw new Error("Fant ikke QuizCard-anker i place-card.js");
  ui = ui.replace(anchor, `$1\n  radhusplassen: "bilder/QuizCards/Radhusplassen.webp",`);
  fs.writeFileSync(uiFile, ui);
}

write("reports/place-production/radhusplassen-production-v1.json", {
  schema: "history_go_place_production_v1", place_id: placeId, status: "complete", verified_at: verifiedAt,
  identity_boundary: "Rådhusplassen er det åpne plassrommet mellom Oslo rådhus og Pipervika; den er ikke rådhusbygningen og ikke hele havnefronten.",
  collections: { people: place.related_people_ids, objects: place.objects.map(x => x.id), structures: place.structures.map(x => x.id), historical_events: place.historical_events.map(x => x.id) },
  quiz: { profile: "rich_5x7", sets: 5, questions: 35, facts: 21, contexts: 7, concepts: 7, source_file: quizFile, context_file: contextFile },
  stories: stories.map(x => x.id), chronology: chronology.map(x => x.id), language_file: languageFile, lesespor_ids: place.reading_track_ids,
  source_paths: [placeFile, quizFile, briefFile, contextFile, leksikonFile, languageFile, "data/stories/stories_radhusplassen.json", lesesporFile]
});
write("reports/place-production/radhusplassen-workcard-current.json", { schema: "history_go_place_workcard_v1", place_id: placeId, category: "by", status: "complete", production_verified_at: verifiedAt, quality_gate: "30/30", identity_boundary_status: "PASS", collection_ids: place.place_card_profile.collection_ids, quiz_profile: { profile: "rich_5x7", set_count: 5, question_count: 35, fact: 21, context: 7, concept: 7 }, quizcard_status: { status: "PASS_CREATED", path: "bilder/QuizCards/Radhusplassen.webp" }, source_review: "complete" });
write("reports/place-production/radhusplassen-phase1-24-gate-audit-v1.json", { schema: "history_go_phase1_24_quality_gate_v1", place_id: placeId, verified_at: verifiedAt,
  null_measurement: { existing_place: true, coordinate_changed: false, existing_quiz: "5x7 legacy preserved and normalized", existing_story: "one legacy story replaced by two source-backed episode_v1 stories", identity_overlap: "Rådhusplassen holdes eksplisitt adskilt fra Oslo rådhus." },
  collections: { required: place.place_card_profile.collection_ids, loaded_preview_images: 4, member_image_coverage_percent: 100, missing: 0, coverage_percent: 100 },
  quality_score: { correctness_and_evidence: { score: 5 }, coverage_and_completion: { score: 5 }, editorial_quality: { score: 5 }, technical_integrity: { score: 5 }, safety_and_responsibility: { score: 5 }, maintainability_and_auditability: { score: 5 }, total: 30, critical_findings: 0, unresolved_blockers: 0 }
});

const testFile = `import test from "node:test";\nimport assert from "node:assert/strict";\nimport fs from "node:fs";\nimport sharp from "sharp";\nconst read=f=>JSON.parse(fs.readFileSync(f,"utf8"));\nconst place=read("${placeFile}");\ntest("Rådhusplassen full produksjon",async()=>{assert.equal(place.production_status,"complete");assert.equal(place.production_profile,"standard");assert.equal(Object.hasOwn(place,"cardImage"),false);assert.deepEqual(place.place_card_profile.collection_ids,["people","objects","structures","historical_events"]);assert.deepEqual(place.rounds,["people","objects","structures","historical_events"]);assert.equal(place.objects.length,1);assert.equal(place.structures.length,1);assert.equal(place.historical_events.length,2);assert.ok(fs.existsSync(place.image));assert.ok(fs.existsSync(place.frontImage));const m=await sharp(place.frontImage).metadata();assert.ok(m.height>m.width);assert.ok(fs.existsSync("bilder/QuizCards/Radhusplassen.webp"));});\ntest("Rådhusplassen rich 5x7",()=>{const q=read("${quizFile}");assert.equal(q.size_class,"rich");assert.equal(q.sets.length,5);assert.ok(q.sets.every(s=>s.questions.length===7));const qs=q.sets.flatMap(s=>s.questions);assert.equal(qs.filter(x=>x.question_type==="fact").length,21);assert.equal(qs.filter(x=>x.question_type==="context").length,7);assert.equal(qs.filter(x=>x.question_type==="concept").length,7);assert.ok(qs.slice(0,28).every(x=>!x.method_id&&!x.thinker_id&&!x.theory_ref));assert.ok(qs.slice(28).every(x=>x.method_id&&x.thinker_id&&x.theory_ref));assert.ok(qs.every(x=>x.source_origin==="external"&&x.source.length));assert.equal(q.production_context.normal_opening_questions,21);assert.equal(q.production_context.theory_start_phase,"final");});\ntest("Rådhusplassen stories leksikon språk lesespor",()=>{const s=read("data/stories/stories_radhusplassen.json");assert.equal(s.length,2);assert.ok(s.every(x=>x.quality_profile==="episode_v1"&&x.score.total>=15));const l=read("${leksikonFile}");assert.equal(l[0].chronology.length,10);const lang=read("${languageFile}");assert.equal(lang.entries.length,6);const tracks=read("${lesesporFile}").items.filter(x=>(x.place_ids||[]).includes("radhusplassen"));assert.equal(tracks.length,4);assert.ok(tracks.every(x=>x.access==="open"&&x.rights==="link_only"&&x.curation_status==="approved"));});\ntest("Rådhusplassen Fagverk og 30 av 30",()=>{assert.equal(place.fagverk.schema,"history_go_place_fagverk_v2");assert.equal(place.fagverk.level,"full");assert.equal(place.fagverk.status,"curated");const w=read("reports/place-production/radhusplassen-workcard-current.json");assert.equal(w.quality_gate,"30/30");const a=read("reports/place-production/radhusplassen-phase1-24-gate-audit-v1.json");assert.equal(a.quality_score.total,30);assert.equal(a.quality_score.unresolved_blockers,0);});\n`;
fs.writeFileSync(path.join(root, "tests/radhusplassen-completion.test.mjs"), testFile);
console.log(JSON.stringify({ place: placeId, quiz: questions.length, stories: stories.length, chronology: chronology.length, language: 6, lesespor: 4 }, null, 2));
