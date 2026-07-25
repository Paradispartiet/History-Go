import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");

const PEOPLE_MOVES = {
  amalia_rodrigues: ["people/musikk/europe/portugal/lisbon/portugal/lisbon/amalia_rodrigues.json", "musikk", "people/musikk/europe/portugal/lisbon/amalia_rodrigues.json"],
  herman_jose: ["people/scenekunst/europe/portugal/lisbon/portugal/lisbon/herman_jose.json", "scenekunst", "people/scenekunst/europe/portugal/lisbon/herman_jose.json"],
  ricardo_araujo_pereira: ["people/scenekunst/europe/portugal/lisbon/portugal/lisbon/ricardo_araujo_pereira.json", "scenekunst", "people/scenekunst/europe/portugal/lisbon/ricardo_araujo_pereira.json"],
  bruno_nogueira: ["people/subkultur/europe/portugal/lisbon/portugal/lisbon/bruno_nogueira.json", "scenekunst", "people/scenekunst/europe/portugal/lisbon/bruno_nogueira.json"],
  filomena_cautela: ["people/media/europe/portugal/lisbon/portugal/lisbon/filomena_cautela.json", "media", "people/media/europe/portugal/lisbon/filomena_cautela.json"],
  nuno_markl: ["people/litteratur/europe/portugal/lisbon/portugal/lisbon/nuno_markl.json", "media", "people/media/europe/portugal/lisbon/nuno_markl.json"],
  aud_schonemann: ["people/sport/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d/aud_schonemann.json", "scenekunst", "people/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d/aud_schonemann.json"],
  bokken_lasson: ["people/scenekunst/oslo/chat_noir/bokken_lasson.json", "scenekunst", "people/scenekunst/oslo/chat_noir/bokken_lasson.json"],
  dag_froland: ["people/litteratur/oslo/chat_noir/dag_froland.json", "scenekunst", "people/scenekunst/oslo/chat_noir/dag_froland.json"],
  jens_book_jenssen: ["people/musikk/oslo/chat_noir/jens_book_jenssen.json", "musikk", "people/musikk/oslo/chat_noir/jens_book_jenssen.json"],
  victor_bernau: ["people/subkultur/oslo/chat_noir/victor_bernau.json", "scenekunst", "people/scenekunst/oslo/chat_noir/victor_bernau.json"],
  vilhelm_dybwad: ["people/litteratur/oslo/chat_noir/vilhelm_dybwad.json", "litteratur", "people/litteratur/oslo/chat_noir/vilhelm_dybwad.json"],
  anders_moland: ["people/scenekunst/oslo/edderkoppen_scene/anders_moland.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/anders_moland.json"],
  arvid_nilssen: ["people/subkultur/oslo/edderkoppen_scene/arvid_nilssen.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/arvid_nilssen.json"],
  dan_fosse: ["people/subkultur/oslo/edderkoppen_scene/dan_fosse.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/dan_fosse.json"],
  einar_schanke: ["people/litteratur/oslo/edderkoppen_scene/einar_schanke.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/einar_schanke.json"],
  ernst_diesen: ["people/subkultur/oslo/edderkoppen_scene/ernst_diesen.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/ernst_diesen.json"],
  harald_heide_steen_jr: ["people/subkultur/oslo/nrk_huset_marienlyst/harald_heide_steen_jr.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/harald_heide_steen_jr.json"],
  inger_lise_rypdal: ["people/musikk/oslo/edderkoppen_scene/inger_lise_rypdal.json", "musikk", "people/musikk/oslo/edderkoppen_scene/inger_lise_rypdal.json"],
  jon_eikemo: ["people/subkultur/oslo/edderkoppen_scene/jon_eikemo.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/jon_eikemo.json"],
  kari_diesen: ["people/subkultur/oslo/edderkoppen_scene/kari_diesen.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/kari_diesen.json"],
  ketil_aamodt: ["people/scenekunst/oslo/edderkoppen_scene/ketil_aamodt.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/ketil_aamodt.json"],
  kirsti_sparboe: ["people/musikk/oslo/edderkoppen_scene/kirsti_sparboe.json", "musikk", "people/musikk/oslo/edderkoppen_scene/kirsti_sparboe.json"],
  lalla_carlsen: ["people/subkultur/oslo/edderkoppen_scene/lalla_carlsen.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/lalla_carlsen.json"],
  leif_juster: ["people/subkultur/oslo/edderkoppen_scene/leif_juster.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/leif_juster.json"],
  oivind_blunck: ["people/subkultur/oslo/edderkoppen_scene/oivind_blunck.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/oivind_blunck.json"],
  ole_paus: ["people/musikk/oslo/edderkoppen_scene/ole_paus.json", "musikk", "people/musikk/oslo/edderkoppen_scene/ole_paus.json"],
  per_kvist: ["people/litteratur/oslo/edderkoppen_scene/per_kvist.json", "litteratur", "people/litteratur/oslo/edderkoppen_scene/per_kvist.json"],
  rolv_wesenlund: ["people/subkultur/oslo/nrk_huset_marienlyst/rolv_wesenlund.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/rolv_wesenlund.json"],
  tom_sterri: ["people/scenekunst/oslo/edderkoppen_scene/tom_sterri.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/tom_sterri.json"],
  willie_hoel: ["people/subkultur/oslo/edderkoppen_scene/willie_hoel.json", "scenekunst", "people/scenekunst/oslo/edderkoppen_scene/willie_hoel.json"],
  andreas_sollund: ["people/subkultur/oslo/house_of_nerds/andreas_sollund.json", "subkultur", "people/subkultur/oslo/house_of_nerds/andreas_sollund.json"],
  elina_krantz: ["people/scenekunst/oslo/latter/elina_krantz.json", "scenekunst", "people/scenekunst/oslo/latter/elina_krantz.json"],
  kristoffer_olsen: ["people/litteratur/oslo/latter/kristoffer_olsen.json", "scenekunst", "people/scenekunst/oslo/latter/kristoffer_olsen.json"],
  else_kass_furuseth: ["people/naeringsliv/oslo/latter/else_kass_furuseth.json", "scenekunst", "people/scenekunst/oslo/latter/else_kass_furuseth.json"],
  bard_tufte_johansen: ["people/scenekunst/oslo/chateau_neuf/bard_tufte_johansen.json", "scenekunst", "people/scenekunst/oslo/chateau_neuf/bard_tufte_johansen.json"],
  harald_eia: ["people/scenekunst/oslo/chateau_neuf/harald_eia.json", "scenekunst", "people/scenekunst/oslo/chateau_neuf/harald_eia.json"],
  oystein_wiik: ["people/subkultur/oslo/folketeateret/oystein_wiik.json", "scenekunst", "people/scenekunst/oslo/folketeateret/oystein_wiik.json"],
  rein_alexander: ["people/naeringsliv/oslo/folketeateret/rein_alexander.json", "musikk", "people/musikk/oslo/folketeateret/rein_alexander.json"],
  wenche_foss: ["people/subkultur/oslo/folketeateret/wenche_foss.json", "scenekunst", "people/scenekunst/oslo/folketeateret/wenche_foss.json"],
  folketeateret_musikalmiljoet: ["people/subkultur/oslo/folketeateret/folketeateret_musikalmiljoet.json", "scenekunst", "people/scenekunst/oslo/folketeateret/folketeateret_musikalmiljoet.json"],
  christian_morgenstierne: ["people/by/oslo/folketeateret/christian_morgenstierne.json", "by", "people/by/oslo/folketeateret/christian_morgenstierne.json"],
  arne_eide: ["people/by/oslo/folketeateret/arne_eide.json", "by", "people/by/oslo/folketeateret/arne_eide.json"],
  herman_flesvig: ["people/subkultur/oslo/nrk_huset_marienlyst/herman_flesvig.json", "scenekunst", "people/scenekunst/oslo/nrk_huset_marienlyst/herman_flesvig.json"],
  morten_ramm: ["people/scenekunst/oslo/nrk_huset_marienlyst/morten_ramm.json", "scenekunst", "people/scenekunst/oslo/nrk_huset_marienlyst/morten_ramm.json"],
  nils_vogt: ["people/subkultur/oslo/nrk_huset_marienlyst/nils_vogt.json", "scenekunst", "people/scenekunst/oslo/nrk_huset_marienlyst/nils_vogt.json"],
  astrid_s: ["people/musikk/oslo/sorenga/astrid_s.json", "musikk", "people/musikk/oslo/sorenga/astrid_s.json"],
  colosseum_premierepublikummet: ["people/film_tv/oslo/colosseum_kino/colosseum_premierepublikummet.json", "film_tv", "people/film_tv/oslo/colosseum_kino/colosseum_premierepublikummet.json"]
};

const QUIZ_PERSON_OVERRIDES = Object.fromEntries(Object.entries(PEOPLE_MOVES).map(([id, [, category]]) => [id, category]));
QUIZ_PERSON_OVERRIDES.tinashe_williamson = "media";
QUIZ_PERSON_OVERRIDES.stephen_butkus = "kunst";

const PLACE_CATEGORY_OVERRIDES = {
  cinemateket_oslo: "film_tv", colosseum_kino: "film_tv", house_of_nerds: "subkultur",
  chateau_neuf: "scenekunst", frognerstranda: "media", grand_hotel: "media", slottsplassen: "politikk",
  lisbon_casa_museu_amalia_rodrigues: "musikk", lisbon_tram_28: "by", lisbon_marchas_populares: "scenekunst",
  lisbon_feira_da_ladra: "naeringsliv", lisbon_santo_antonio_festival: "religion", lisbon_feira_do_livro: "litteratur",
  bla_skilt_aud_schonemann_vetlandsveien_69d: "scenekunst"
};

const AUD_PLACE = {
  id: "bla_skilt_aud_schonemann_vetlandsveien_69d",
  source: "places/sport/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json",
  category: "scenekunst",
  dest: "places/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json"
};

const dataPath = (entry) => path.join(DATA, entry);
const rootPath = (entry) => path.join(ROOT, entry);
async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
async function readJson(file) { return JSON.parse(await fs.readFile(file, "utf8")); }
async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function withCategory(record, category) {
  const next = structuredClone(record);
  next.category = category;
  if (Object.hasOwn(next, "categoryId")) next.categoryId = category;
  if (Object.hasOwn(next, "category_id")) next.category_id = category;
  return next;
}

async function moveIndividualRecords(manifestEntry, moves) {
  const manifestFile = dataPath(manifestEntry);
  const manifest = await readJson(manifestFile);
  const removeEntries = new Set();
  const addEntries = new Set();
  for (const [id, [source, category, dest]] of Object.entries(moves)) {
    const sourceFile = dataPath(source);
    if (!(await exists(sourceFile))) throw new Error(`Mangler kildefil for ${id}: ${source}`);
    const record = await readJson(sourceFile);
    if (String(record?.id || record?.personId || record?.placeId || "") !== id) throw new Error(`Kildefilen inneholder ikke ${id}: ${source}`);
    const destFile = dataPath(dest);
    await writeJson(destFile, withCategory(record, category));
    addEntries.add(dest);
    if (path.resolve(sourceFile) !== path.resolve(destFile)) {
      await fs.rm(sourceFile, { force: true });
      removeEntries.add(source);
    }
  }
  manifest.files = (manifest.files || []).filter((entry) => !removeEntries.has(entry));
  for (const entry of addEntries) if (!manifest.files.includes(entry)) manifest.files.push(entry);
  await writeJson(manifestFile, manifest);
}

function rewriteCategoryFields(value, category) {
  if (Array.isArray(value)) return value.map((item) => rewriteCategoryFields(item, category));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, raw] of Object.entries(value)) out[key] = ["category", "categoryId", "category_id"].includes(key) ? category : rewriteCategoryFields(raw, category);
  return out;
}
function rewriteLegacyPlacePath(value) {
  if (Array.isArray(value)) return value.map(rewriteLegacyPlacePath);
  if (typeof value === "string") return value.replaceAll(
    "data/places/popkultur/oslo/places_oslo_populaerkultur/folketeateret.json",
    "data/places/scenekunst/oslo/folketeateret.json"
  );
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, raw]) => [key, rewriteLegacyPlacePath(raw)]));
}

async function normalizeFolketeateretSet() {
  const file = dataPath("quiz/scenekunst/folketeateret_sets.json");
  const doc = rewriteLegacyPlacePath(await readJson(file));
  for (const block of doc.sets || []) {
    for (const question of block.questions || []) {
      question.categoryId = "scenekunst";
      question.question_scope = "place";
    }
  }
  await writeJson(file, doc);
}

async function regroupQuizzes() {
  const manifestFile = dataPath("quiz/manifest.json");
  const manifest = await readJson(manifestFile);
  const aggregateEntries = (manifest.files || []).filter((entry) => /^data\/quiz\/quiz_.*_from_populaerkultur\.json$/.test(entry));
  const quizzes = [];
  for (const entry of aggregateEntries) {
    const payload = await readJson(rootPath(entry));
    if (!Array.isArray(payload)) throw new Error(`Forventet quiz-array i ${entry}`);
    quizzes.push(...payload);
    await fs.rm(rootPath(entry), { force: true });
  }
  const groups = new Map();
  for (const quiz of quizzes) {
    const personId = String(quiz.personId || "");
    const placeId = String(quiz.placeId || quiz.targetId || "");
    const category = QUIZ_PERSON_OVERRIDES[personId] || PLACE_CATEGORY_OVERRIDES[placeId] || String(quiz.categoryId || quiz.category || "");
    if (!category || category === "popkultur" || category === "populaerkultur") throw new Error(`Kan ikke klassifisere quiz ${quiz.id || "(uten id)"}`);
    const next = structuredClone(quiz);
    next.categoryId = category;
    if (Object.hasOwn(next, "category")) next.category = category;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(next);
  }
  manifest.files = (manifest.files || []).filter((entry) => !aggregateEntries.includes(entry));
  for (const [category, items] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const entry = `data/quiz/quiz_${category}_from_populaerkultur.json`;
    await writeJson(rootPath(entry), items);
    manifest.files.push(entry);
  }
  const vgSet = (manifest.sets || []).find((entry) => entry.targetId === "vg_huset");
  if (vgSet) {
    const oldFile = rootPath(vgSet.file);
    const nextEntry = "data/quiz/media/vg_huset_sets.json";
    await writeJson(rootPath(nextEntry), rewriteCategoryFields(await readJson(oldFile), "media"));
    if (vgSet.file !== nextEntry) await fs.rm(oldFile, { force: true });
    vgSet.file = nextEntry;
  }
  manifest.files = [...new Set(manifest.files)];
  await writeJson(manifestFile, manifest);
}

async function validateMigratedQuizzes() {
  const manifest = await readJson(dataPath("quiz/manifest.json"));
  const files = (manifest.files || []).filter((entry) => entry.includes("_from_populaerkultur.json"));
  const ids = new Set();
  for (const entry of files) {
    const data = await readJson(rootPath(entry));
    if (!Array.isArray(data)) throw new Error(`Migrert quizfil er ikke en array: ${entry}`);
    for (const quiz of data) {
      if (!quiz.id || !quiz.categoryId || !quiz.question || !Array.isArray(quiz.options) || quiz.options.length < 2) throw new Error(`Ugyldig migrert quiz i ${entry}`);
      if (["popkultur", "populaerkultur"].includes(quiz.categoryId)) throw new Error(`Gammel kategori i ${quiz.id}`);
      if (ids.has(quiz.id)) throw new Error(`Duplisert migrert quiz-ID: ${quiz.id}`);
      ids.add(quiz.id);
    }
  }
  const folk = await readJson(dataPath("quiz/scenekunst/folketeateret_sets.json"));
  for (const block of folk.sets || []) for (const q of block.questions || []) {
    if (q.categoryId !== "scenekunst" || q.question_scope !== "place") throw new Error(`Ugyldig Folketeateret-spørsmål: ${q.id}`);
  }
}

async function updateAudEvidence() {
  const manifest = await readJson(dataPath("coordinate-evidence/manifest.json"));
  for (const entry of manifest.files || []) {
    const file = dataPath(`coordinate-evidence/${entry}`);
    if (!(await exists(file))) continue;
    const evidence = await readJson(file);
    if (evidence.placeId !== AUD_PLACE.id) continue;
    evidence.placeFile = `data/${AUD_PLACE.dest}`;
    await writeJson(file, evidence);
  }
}

async function writeReport() {
  const peopleLines = Object.entries(PEOPLE_MOVES).sort(([a], [b]) => a.localeCompare(b)).map(([id, [, category]]) => `- ${id} → ${category}`);
  const report = [
    "# Fjerning av Populærkultur som toppdomene", "", "Dato: 2026-07-25", "",
    "Populærkultur er fjernet som runtime- og fagkategori. Begrepet beholdes som tverrgående tagg/linse. Fagpakken er bevart under `media` som delfeltet `populaerkultur_som_mediefelt`.", "",
    "## Endelig stedsklassifisering",
    "- film_tv: Cinemateket Oslo, Colosseum kino og eldre filmsteder med tidligere popkulturkategori",
    "- scenekunst: Château Neuf, Chat Noir, Edderkoppen Scene, Folketeateret, Latter, Marchas Populares og Blått skilt: Aud Schønemann",
    "- media: Frognerstranda og Grand Hotel", "- subkultur: House of Nerds", "- politikk: Slottsplassen",
    "- musikk: Casa-Museu Amália Rodrigues", "- by: Lisboa trikk 28", "- naeringsliv: Feira da Ladra",
    "- religion: Santo António-festivalen", "- litteratur: Feira do Livro de Lisboa", "",
    "## Endelig People-klassifisering", ...peopleLines, "",
    "## Quiz og støttedata", "- Populærkulturquizene er gruppert etter endelig person- eller stedskategori.",
    "- `vg_huset_sets.json` er flyttet til media.", "- Folketeateret-settet er normalisert som scenekunst/place-quiz.",
    "- Lisboa-People bruker normaliserte stier uten duplisert `portugal/lisbon`.", "- Koordinat-evidens følger de nye aktive place-filene.", ""
  ].join("\n");
  await fs.writeFile(path.join(ROOT, "reports", "remove-popkultur-domain-2026-07-25.md"), `${report}\n`, "utf8");
}
function run(name) { execFileSync("npm", ["run", name], { cwd: ROOT, stdio: "inherit", env: process.env }); }

await moveIndividualRecords("people/manifest.json", PEOPLE_MOVES);
await moveIndividualRecords("places/manifest.json", { [AUD_PLACE.id]: [AUD_PLACE.source, AUD_PLACE.category, AUD_PLACE.dest] });
await regroupQuizzes();
await normalizeFolketeateretSet();
await validateMigratedQuizzes();
await updateAudEvidence();
await writeReport();
run("audit:categories");
run("audit:people-of-places");
run("places:emner:check");

console.log(JSON.stringify({ correctedPeople: Object.keys(PEOPLE_MOVES).length, correctedPlaces: 1, migratedQuizValidation: "passed" }, null, 2));
