import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");

const PEOPLE_MOVES = {
  amalia_rodrigues: { source: "people/musikk/europe/portugal/lisbon/portugal/lisbon/amalia_rodrigues.json", category: "musikk", dest: "people/musikk/europe/portugal/lisbon/amalia_rodrigues.json" },
  herman_jose: { source: "people/scenekunst/europe/portugal/lisbon/portugal/lisbon/herman_jose.json", category: "scenekunst", dest: "people/scenekunst/europe/portugal/lisbon/herman_jose.json" },
  ricardo_araujo_pereira: { source: "people/scenekunst/europe/portugal/lisbon/portugal/lisbon/ricardo_araujo_pereira.json", category: "scenekunst", dest: "people/scenekunst/europe/portugal/lisbon/ricardo_araujo_pereira.json" },
  bruno_nogueira: { source: "people/subkultur/europe/portugal/lisbon/portugal/lisbon/bruno_nogueira.json", category: "scenekunst", dest: "people/scenekunst/europe/portugal/lisbon/bruno_nogueira.json" },
  filomena_cautela: { source: "people/media/europe/portugal/lisbon/portugal/lisbon/filomena_cautela.json", category: "media", dest: "people/media/europe/portugal/lisbon/filomena_cautela.json" },
  nuno_markl: { source: "people/litteratur/europe/portugal/lisbon/portugal/lisbon/nuno_markl.json", category: "media", dest: "people/media/europe/portugal/lisbon/nuno_markl.json" },

  aud_schonemann: { source: "people/sport/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d/aud_schonemann.json", category: "scenekunst", dest: "people/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d/aud_schonemann.json" },
  bokken_lasson: { source: "people/scenekunst/oslo/chat_noir/bokken_lasson.json", category: "scenekunst", dest: "people/scenekunst/oslo/chat_noir/bokken_lasson.json" },
  dag_froland: { source: "people/litteratur/oslo/chat_noir/dag_froland.json", category: "scenekunst", dest: "people/scenekunst/oslo/chat_noir/dag_froland.json" },
  jens_book_jenssen: { source: "people/musikk/oslo/chat_noir/jens_book_jenssen.json", category: "musikk", dest: "people/musikk/oslo/chat_noir/jens_book_jenssen.json" },
  victor_bernau: { source: "people/subkultur/oslo/chat_noir/victor_bernau.json", category: "scenekunst", dest: "people/scenekunst/oslo/chat_noir/victor_bernau.json" },
  vilhelm_dybwad: { source: "people/litteratur/oslo/chat_noir/vilhelm_dybwad.json", category: "litteratur", dest: "people/litteratur/oslo/chat_noir/vilhelm_dybwad.json" },

  anders_moland: { source: "people/scenekunst/oslo/edderkoppen_scene/anders_moland.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/anders_moland.json" },
  arvid_nilssen: { source: "people/subkultur/oslo/edderkoppen_scene/arvid_nilssen.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/arvid_nilssen.json" },
  dan_fosse: { source: "people/subkultur/oslo/edderkoppen_scene/dan_fosse.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/dan_fosse.json" },
  einar_schanke: { source: "people/litteratur/oslo/edderkoppen_scene/einar_schanke.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/einar_schanke.json" },
  ernst_diesen: { source: "people/subkultur/oslo/edderkoppen_scene/ernst_diesen.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/ernst_diesen.json" },
  harald_heide_steen_jr: { source: "people/subkultur/oslo/nrk_huset_marienlyst/harald_heide_steen_jr.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/harald_heide_steen_jr.json" },
  inger_lise_rypdal: { source: "people/musikk/oslo/edderkoppen_scene/inger_lise_rypdal.json", category: "musikk", dest: "people/musikk/oslo/edderkoppen_scene/inger_lise_rypdal.json" },
  jon_eikemo: { source: "people/subkultur/oslo/edderkoppen_scene/jon_eikemo.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/jon_eikemo.json" },
  kari_diesen: { source: "people/subkultur/oslo/edderkoppen_scene/kari_diesen.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/kari_diesen.json" },
  ketil_aamodt: { source: "people/scenekunst/oslo/edderkoppen_scene/ketil_aamodt.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/ketil_aamodt.json" },
  kirsti_sparboe: { source: "people/musikk/oslo/edderkoppen_scene/kirsti_sparboe.json", category: "musikk", dest: "people/musikk/oslo/edderkoppen_scene/kirsti_sparboe.json" },
  lalla_carlsen: { source: "people/subkultur/oslo/edderkoppen_scene/lalla_carlsen.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/lalla_carlsen.json" },
  leif_juster: { source: "people/subkultur/oslo/edderkoppen_scene/leif_juster.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/leif_juster.json" },
  oivind_blunck: { source: "people/subkultur/oslo/edderkoppen_scene/oivind_blunck.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/oivind_blunck.json" },
  ole_paus: { source: "people/musikk/oslo/edderkoppen_scene/ole_paus.json", category: "musikk", dest: "people/musikk/oslo/edderkoppen_scene/ole_paus.json" },
  per_kvist: { source: "people/litteratur/oslo/edderkoppen_scene/per_kvist.json", category: "litteratur", dest: "people/litteratur/oslo/edderkoppen_scene/per_kvist.json" },
  rolv_wesenlund: { source: "people/subkultur/oslo/nrk_huset_marienlyst/rolv_wesenlund.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/rolv_wesenlund.json" },
  tom_sterri: { source: "people/scenekunst/oslo/edderkoppen_scene/tom_sterri.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/tom_sterri.json" },
  willie_hoel: { source: "people/subkultur/oslo/edderkoppen_scene/willie_hoel.json", category: "scenekunst", dest: "people/scenekunst/oslo/edderkoppen_scene/willie_hoel.json" },

  andreas_sollund: { source: "people/subkultur/oslo/house_of_nerds/andreas_sollund.json", category: "subkultur", dest: "people/subkultur/oslo/house_of_nerds/andreas_sollund.json" },
  elina_krantz: { source: "people/scenekunst/oslo/latter/elina_krantz.json", category: "scenekunst", dest: "people/scenekunst/oslo/latter/elina_krantz.json" },
  kristoffer_olsen: { source: "people/litteratur/oslo/latter/kristoffer_olsen.json", category: "scenekunst", dest: "people/scenekunst/oslo/latter/kristoffer_olsen.json" },
  else_kass_furuseth: { source: "people/naeringsliv/oslo/latter/else_kass_furuseth.json", category: "scenekunst", dest: "people/scenekunst/oslo/latter/else_kass_furuseth.json" },

  bard_tufte_johansen: { source: "people/scenekunst/oslo/chateau_neuf/bard_tufte_johansen.json", category: "scenekunst", dest: "people/scenekunst/oslo/chateau_neuf/bard_tufte_johansen.json" },
  harald_eia: { source: "people/scenekunst/oslo/chateau_neuf/harald_eia.json", category: "scenekunst", dest: "people/scenekunst/oslo/chateau_neuf/harald_eia.json" },
  oystein_wiik: { source: "people/subkultur/oslo/folketeateret/oystein_wiik.json", category: "scenekunst", dest: "people/scenekunst/oslo/folketeateret/oystein_wiik.json" },
  rein_alexander: { source: "people/naeringsliv/oslo/folketeateret/rein_alexander.json", category: "musikk", dest: "people/musikk/oslo/folketeateret/rein_alexander.json" },
  wenche_foss: { source: "people/subkultur/oslo/folketeateret/wenche_foss.json", category: "scenekunst", dest: "people/scenekunst/oslo/folketeateret/wenche_foss.json" },
  folketeateret_musikalmiljoet: { source: "people/subkultur/oslo/folketeateret/folketeateret_musikalmiljoet.json", category: "scenekunst", dest: "people/scenekunst/oslo/folketeateret/folketeateret_musikalmiljoet.json" },
  christian_morgenstierne: { source: "people/by/oslo/folketeateret/christian_morgenstierne.json", category: "by", dest: "people/by/oslo/folketeateret/christian_morgenstierne.json" },
  arne_eide: { source: "people/by/oslo/folketeateret/arne_eide.json", category: "by", dest: "people/by/oslo/folketeateret/arne_eide.json" },

  herman_flesvig: { source: "people/subkultur/oslo/nrk_huset_marienlyst/herman_flesvig.json", category: "scenekunst", dest: "people/scenekunst/oslo/nrk_huset_marienlyst/herman_flesvig.json" },
  morten_ramm: { source: "people/scenekunst/oslo/nrk_huset_marienlyst/morten_ramm.json", category: "scenekunst", dest: "people/scenekunst/oslo/nrk_huset_marienlyst/morten_ramm.json" },
  nils_vogt: { source: "people/subkultur/oslo/nrk_huset_marienlyst/nils_vogt.json", category: "scenekunst", dest: "people/scenekunst/oslo/nrk_huset_marienlyst/nils_vogt.json" },
  astrid_s: { source: "people/musikk/oslo/sorenga/astrid_s.json", category: "musikk", dest: "people/musikk/oslo/sorenga/astrid_s.json" },
  colosseum_premierepublikummet: { source: "people/film_tv/oslo/colosseum_kino/colosseum_premierepublikummet.json", category: "film_tv", dest: "people/film_tv/oslo/colosseum_kino/colosseum_premierepublikummet.json" }
};

const QUIZ_ONLY_PERSON_CATEGORIES = {
  tinashe_williamson: "media",
  stephen_butkus: "kunst"
};

const AUD_PLACE = {
  id: "bla_skilt_aud_schonemann_vetlandsveien_69d",
  source: "places/sport/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json",
  category: "scenekunst",
  dest: "places/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json"
};

const dataPath = (entry) => path.join(DATA, entry);
const rootPath = (entry) => path.join(ROOT, entry);

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function records(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.people)) return payload.people;
  if (Array.isArray(payload?.places)) return payload.places;
  if (Array.isArray(payload?.items)) return payload.items;
  return payload && typeof payload === "object" ? [payload] : [];
}

function rebuild(payload, nextRecords) {
  if (Array.isArray(payload)) return nextRecords;
  if (Array.isArray(payload?.people)) return { ...payload, people: nextRecords };
  if (Array.isArray(payload?.places)) return { ...payload, places: nextRecords };
  if (Array.isArray(payload?.items)) return { ...payload, items: nextRecords };
  return nextRecords[0] ?? null;
}

function withCategory(record, category) {
  const next = structuredClone(record);
  next.category = category;
  if (Object.hasOwn(next, "categoryId")) next.categoryId = category;
  if (Object.hasOwn(next, "category_id")) next.category_id = category;
  return next;
}

async function moveExplicitRecords(manifestFile, moves) {
  const manifest = await readJson(manifestFile);
  const removeEntries = new Set();
  const addEntries = new Set();

  for (const [id, move] of Object.entries(moves)) {
    const sourceFile = dataPath(move.source);
    if (!(await exists(sourceFile))) throw new Error(`Mangler kildefil for ${id}: ${move.source}`);
    const payload = await readJson(sourceFile);
    const sourceRecords = records(payload);
    const record = sourceRecords.find((item) => String(item?.id || item?.personId || item?.placeId || "") === id);
    if (!record) throw new Error(`Kildefilen inneholder ikke ${id}: ${move.source}`);

    const destFile = dataPath(move.dest);
    await writeJson(destFile, withCategory(record, move.category));
    addEntries.add(move.dest);

    if (path.resolve(sourceFile) !== path.resolve(destFile)) {
      const remaining = sourceRecords.filter((item) => String(item?.id || item?.personId || item?.placeId || "") !== id);
      if (remaining.length) await writeJson(sourceFile, rebuild(payload, remaining));
      else await fs.rm(sourceFile, { force: true });
      removeEntries.add(move.source);
    }
  }

  manifest.files = (manifest.files || []).filter((entry) => !removeEntries.has(entry));
  for (const entry of addEntries) if (!manifest.files.includes(entry)) manifest.files.push(entry);
  await writeJson(manifestFile, manifest);
}

async function categoryMap(manifestFile) {
  const manifest = await readJson(manifestFile);
  const map = new Map();
  for (const entry of manifest.files || []) {
    const file = dataPath(entry);
    if (!(await exists(file))) throw new Error(`Manifest peker til manglende fil: ${entry}`);
    for (const record of records(await readJson(file))) {
      const id = String(record?.id || record?.personId || record?.placeId || "").trim();
      if (!id) continue;
      map.set(id, String(record.category || record.categoryId || record.category_id || ""));
    }
  }
  return map;
}

function rewriteCategoryFields(value, category) {
  if (Array.isArray(value)) return value.map((item) => rewriteCategoryFields(item, category));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    out[key] = ["category", "categoryId", "category_id"].includes(key)
      ? category
      : rewriteCategoryFields(raw, category);
  }
  return out;
}

async function regroupQuizzes(peopleCategories, placeCategories) {
  const manifestFile = dataPath("quiz/manifest.json");
  const manifest = await readJson(manifestFile);
  const aggregateEntries = (manifest.files || []).filter((entry) => /^data\/quiz\/quiz_.*_from_populaerkultur\.json$/.test(entry));
  const quizzes = [];

  for (const entry of aggregateEntries) {
    const file = rootPath(entry);
    const payload = await readJson(file);
    if (!Array.isArray(payload)) throw new Error(`Forventet quiz-array i ${entry}`);
    quizzes.push(...payload);
    await fs.rm(file, { force: true });
  }

  const groups = new Map();
  for (const quiz of quizzes) {
    const personId = String(quiz.personId || "");
    const placeId = String(quiz.placeId || quiz.targetId || "");
    const category = peopleCategories.get(personId)
      || QUIZ_ONLY_PERSON_CATEGORIES[personId]
      || placeCategories.get(placeId)
      || String(quiz.categoryId || quiz.category || "");
    if (!category || category === "popkultur" || category === "populaerkultur") {
      throw new Error(`Kan ikke klassifisere quiz ${quiz.id || "(uten id)"}`);
    }
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

async function updateAudEvidence() {
  const manifestFile = dataPath("coordinate-evidence/manifest.json");
  const manifest = await readJson(manifestFile);
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
  const peopleLines = Object.entries(PEOPLE_MOVES)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, move]) => `- ${id} → ${move.category}`);
  const report = [
    "# Fjerning av Populærkultur som toppdomene",
    "",
    "Dato: 2026-07-25",
    "",
    "Populærkultur er fjernet som runtime- og fagkategori. Begrepet beholdes som tverrgående tagg/linse. Fagpakken er bevart under `media` som delfeltet `populaerkultur_som_mediefelt`.",
    "",
    "## Endelig stedsklassifisering",
    "- film_tv: Cinemateket Oslo, Colosseum kino og eldre filmsteder med tidligere popkulturkategori",
    "- scenekunst: Château Neuf, Chat Noir, Edderkoppen Scene, Folketeateret, Latter, Marchas Populares og Blått skilt: Aud Schønemann",
    "- media: Frognerstranda og Grand Hotel",
    "- subkultur: House of Nerds",
    "- politikk: Slottsplassen",
    "- musikk: Casa-Museu Amália Rodrigues",
    "- by: Lisboa trikk 28",
    "- naeringsliv: Feira da Ladra",
    "- religion: Santo António-festivalen",
    "- litteratur: Feira do Livro de Lisboa",
    "",
    "## Endelig People-klassifisering",
    ...peopleLines,
    "",
    "## Quiz og støttedata",
    "- Populærkulturquizene er gruppert etter endelig person- eller stedskategori.",
    "- `vg_huset_sets.json` er flyttet til media.",
    "- Lisboa-People bruker normaliserte stier uten duplisert `portugal/lisbon`.",
    "- Koordinat-evidens følger de nye aktive place-filene.",
    ""
  ].join("\n");
  await fs.writeFile(path.join(ROOT, "reports", "remove-popkultur-domain-2026-07-25.md"), `${report}\n`, "utf8");
}

function run(name) {
  execFileSync("npm", ["run", name], { cwd: ROOT, stdio: "inherit", env: process.env });
}

await moveExplicitRecords(dataPath("people/manifest.json"), PEOPLE_MOVES);
await moveExplicitRecords(dataPath("places/manifest.json"), { [AUD_PLACE.id]: AUD_PLACE });
const peopleCategories = await categoryMap(dataPath("people/manifest.json"));
const placeCategories = await categoryMap(dataPath("places/manifest.json"));
await regroupQuizzes(peopleCategories, placeCategories);
await updateAudEvidence();
await writeReport();

run("audit:categories");
run("audit:people-of-places");
run("audit:quiz-manifest:v2");
run("places:emner:check");

console.log(JSON.stringify({
  correctedPeople: Object.keys(PEOPLE_MOVES).length,
  correctedPlaces: 1,
  quizOnlyOverrides: Object.keys(QUIZ_ONLY_PERSON_CATEGORIES).length
}, null, 2));
