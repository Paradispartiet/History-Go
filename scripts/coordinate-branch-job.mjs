// One-shot editorial correction after the structural popkultur migration.
// This explicit table replaces the broad classification heuristic used by the first pass.
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");

const PEOPLE = {
  amalia_rodrigues: { category: "musikk", region: "lisbon" },
  herman_jose: { category: "scenekunst", region: "lisbon" },
  ricardo_araujo_pereira: { category: "scenekunst", region: "lisbon" },
  bruno_nogueira: { category: "scenekunst", region: "lisbon" },
  filomena_cautela: { category: "media", region: "lisbon" },
  nuno_markl: { category: "media", region: "lisbon" },

  aud_schonemann: { category: "scenekunst", region: "oslo", anchor: "bla_skilt_aud_schonemann_vetlandsveien_69d" },
  bokken_lasson: { category: "scenekunst", region: "oslo", anchor: "chat_noir" },
  dag_froland: { category: "scenekunst", region: "oslo", anchor: "chat_noir" },
  jens_book_jenssen: { category: "musikk", region: "oslo", anchor: "chat_noir" },
  victor_bernau: { category: "scenekunst", region: "oslo", anchor: "chat_noir" },
  vilhelm_dybwad: { category: "litteratur", region: "oslo", anchor: "chat_noir" },

  anders_moland: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  arvid_nilssen: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  dan_fosse: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  einar_schanke: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  ernst_diesen: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  harald_heide_steen_jr: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  inger_lise_rypdal: { category: "musikk", region: "oslo", anchor: "edderkoppen_scene" },
  jon_eikemo: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  kari_diesen: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  ketil_aamodt: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  kirsti_sparboe: { category: "musikk", region: "oslo", anchor: "edderkoppen_scene" },
  lalla_carlsen: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  leif_juster: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  oivind_blunck: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  ole_paus: { category: "musikk", region: "oslo", anchor: "edderkoppen_scene" },
  per_kvist: { category: "litteratur", region: "oslo", anchor: "edderkoppen_scene" },
  rolv_wesenlund: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  tom_sterri: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },
  willie_hoel: { category: "scenekunst", region: "oslo", anchor: "edderkoppen_scene" },

  andreas_sollund: { category: "subkultur", region: "oslo", anchor: "house_of_nerds" },
  elina_krantz: { category: "scenekunst", region: "oslo", anchor: "latter" },
  kristoffer_olsen: { category: "scenekunst", region: "oslo", anchor: "latter" },
  else_kass_furuseth: { category: "scenekunst", region: "oslo", anchor: "latter" },

  bard_tufte_johansen: { category: "scenekunst", region: "oslo", anchor: "chateau_neuf" },
  harald_eia: { category: "scenekunst", region: "oslo", anchor: "chateau_neuf" },
  oystein_wiik: { category: "scenekunst", region: "oslo", anchor: "folketeateret" },
  rein_alexander: { category: "musikk", region: "oslo", anchor: "folketeateret" },
  wenche_foss: { category: "scenekunst", region: "oslo", anchor: "folketeateret" },
  folketeateret_musikalmiljoet: { category: "scenekunst", region: "oslo", anchor: "folketeateret" },
  christian_morgenstierne: { category: "by", region: "oslo", anchor: "folketeateret" },
  arne_eide: { category: "by", region: "oslo", anchor: "folketeateret" },

  herman_flesvig: { category: "scenekunst", region: "oslo", anchor: "nrk_huset_marienlyst" },
  morten_ramm: { category: "scenekunst", region: "oslo", anchor: "nrk_huset_marienlyst" },
  nils_vogt: { category: "scenekunst", region: "oslo", anchor: "nrk_huset_marienlyst" },
  astrid_s: { category: "musikk", region: "oslo", anchor: "sorenga" },
  colosseum_premierepublikummet: { category: "film_tv", region: "oslo", anchor: "colosseum_kino" },
};

const PLACES = {
  bla_skilt_aud_schonemann_vetlandsveien_69d: {
    category: "scenekunst",
    region: "oslo",
  },
};

const QUIZ_ONLY_PERSON_CATEGORIES = {
  tinashe_williamson: "media",
  stephen_butkus: "kunst",
};

const absFromDataEntry = (entry) => path.join(DATA, String(entry).replace(/^data\//, ""));

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function payloadAdapter(payload) {
  if (Array.isArray(payload)) {
    return { records: payload, rebuild: (records) => records };
  }
  if (payload && Array.isArray(payload.people)) {
    return { records: payload.people, rebuild: (records) => ({ ...payload, people: records }) };
  }
  if (payload && Array.isArray(payload.places)) {
    return { records: payload.places, rebuild: (records) => ({ ...payload, places: records }) };
  }
  if (payload && Array.isArray(payload.items)) {
    return { records: payload.items, rebuild: (records) => ({ ...payload, items: records }) };
  }
  if (payload && typeof payload === "object" && payload.id) {
    return { records: [payload], rebuild: (records) => records[0] ?? null };
  }
  return null;
}

function setCategory(record, category) {
  const next = structuredClone(record);
  next.category = category;
  if (Object.hasOwn(next, "categoryId")) next.categoryId = category;
  if (Object.hasOwn(next, "category_id")) next.category_id = category;
  return next;
}

function canonicalPeopleEntry(id, spec) {
  if (spec.region === "lisbon") {
    return `people/${spec.category}/europe/portugal/lisbon/${id}.json`;
  }
  return `people/${spec.category}/oslo/${spec.anchor}/${id}.json`;
}

function canonicalPlaceEntry(id, spec) {
  return `places/${spec.category}/${spec.region}/${id}.json`;
}

async function extractAndRewriteManifest({ manifestPath, mapping, destinationFor }) {
  const manifest = await readJson(manifestPath);
  const targetIds = new Set(Object.keys(mapping));
  const candidates = new Map([...targetIds].map((id) => [id, []]));
  const keptEntries = [];

  for (const entry of manifest.files || []) {
    const file = absFromDataEntry(entry);
    if (!(await exists(file))) {
      throw new Error(`Manifestfil finnes ikke: ${entry}`);
    }
    const payload = await readJson(file);
    const adapter = payloadAdapter(payload);
    if (!adapter) {
      keptEntries.push(entry);
      continue;
    }

    const extracted = adapter.records.filter((record) => targetIds.has(String(record?.id || "")));
    if (!extracted.length) {
      keptEntries.push(entry);
      continue;
    }

    for (const record of extracted) {
      candidates.get(String(record.id)).push({ record, entry });
    }

    const remaining = adapter.records.filter((record) => !targetIds.has(String(record?.id || "")));
    if (!remaining.length) {
      await fs.rm(file, { force: true });
    } else {
      await writeJson(file, adapter.rebuild(remaining));
      keptEntries.push(entry);
    }
  }

  for (const [id, spec] of Object.entries(mapping)) {
    const found = candidates.get(id) || [];
    if (!found.length) throw new Error(`Fant ikke aktiv record for ${id}`);
    const richest = found
      .map(({ record }) => record)
      .sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length)[0];
    const entry = destinationFor(id, spec);
    await writeJson(absFromDataEntry(entry), setCategory(richest, spec.category));
    keptEntries.push(entry);
  }

  manifest.files = [...new Set(keptEntries)];
  await writeJson(manifestPath, manifest);
}

async function activeCategoryMap(manifestPath) {
  const manifest = await readJson(manifestPath);
  const map = new Map();
  const duplicates = new Set();
  for (const entry of manifest.files || []) {
    const file = absFromDataEntry(entry);
    const payload = await readJson(file);
    const adapter = payloadAdapter(payload);
    if (!adapter) continue;
    for (const record of adapter.records) {
      const id = String(record?.id || "").trim();
      if (!id) continue;
      if (map.has(id)) duplicates.add(id);
      map.set(id, String(record.category || record.categoryId || record.category_id || ""));
    }
  }
  if (duplicates.size) throw new Error(`Dupliserte aktive ID-er: ${[...duplicates].sort().join(", ")}`);
  return map;
}

function rewriteCategoryFields(value, category) {
  if (Array.isArray(value)) return value.map((item) => rewriteCategoryFields(item, category));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    if (["category", "categoryId", "category_id"].includes(key)) out[key] = category;
    else out[key] = rewriteCategoryFields(raw, category);
  }
  return out;
}

async function fixVgQuizSet(quizManifest) {
  const set = (quizManifest.sets || []).find((entry) => entry.targetId === "vg_huset");
  if (!set) return;
  const oldFile = path.join(ROOT, set.file);
  if (!(await exists(oldFile))) throw new Error(`VG-sett mangler: ${set.file}`);
  const data = rewriteCategoryFields(await readJson(oldFile), "media");
  const nextRel = "data/quiz/media/vg_huset_sets.json";
  const nextFile = path.join(ROOT, nextRel);
  await writeJson(nextFile, data);
  if (path.resolve(oldFile) !== path.resolve(nextFile)) await fs.rm(oldFile, { force: true });
  set.file = nextRel;
}

async function regroupPopQuizFiles(peopleCategories, placeCategories) {
  const manifestPath = path.join(DATA, "quiz", "manifest.json");
  const manifest = await readJson(manifestPath);
  const aggregateEntries = (manifest.files || []).filter((entry) => /^data\/quiz\/quiz_.*_from_populaerkultur\.json$/.test(entry));
  const quizzes = [];

  for (const entry of aggregateEntries) {
    const file = path.join(ROOT, entry);
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
      || placeCategories.get(placeId);
    if (!category) throw new Error(`Kan ikke klassifisere quiz ${quiz.id || "(uten id)"}`);
    const next = structuredClone(quiz);
    next.categoryId = category;
    if (Object.hasOwn(next, "category")) next.category = category;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(next);
  }

  manifest.files = (manifest.files || []).filter((entry) => !aggregateEntries.includes(entry));
  for (const [category, items] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const entry = `data/quiz/quiz_${category}_from_populaerkultur.json`;
    await writeJson(path.join(ROOT, entry), items);
    manifest.files.push(entry);
  }

  await fixVgQuizSet(manifest);
  manifest.files = [...new Set(manifest.files)];
  await writeJson(manifestPath, manifest);
}

async function updateAudEvidence(placeCategories) {
  const evidenceManifestPath = path.join(DATA, "coordinate-evidence", "manifest.json");
  const manifest = await readJson(evidenceManifestPath);
  for (const entry of manifest.files || []) {
    const file = path.join(DATA, "coordinate-evidence", entry);
    if (!(await exists(file))) continue;
    const evidence = await readJson(file);
    if (evidence.placeId !== "bla_skilt_aud_schonemann_vetlandsveien_69d") continue;
    evidence.placeFile = "data/places/scenekunst/oslo/bla_skilt_aud_schonemann_vetlandsveien_69d.json";
    await writeJson(file, evidence);
  }
  if (placeCategories.get("bla_skilt_aud_schonemann_vetlandsveien_69d") !== "scenekunst") {
    throw new Error("Aud Schønemann-stedet ble ikke flyttet til scenekunst");
  }
}

async function writeFinalReport() {
  const placeLines = [
    "film_tv: Cinemateket Oslo, Colosseum kino og de fem eldre filmfilene med popkulturkategori",
    "scenekunst: Château Neuf, Chat Noir, Edderkoppen Scene, Folketeateret, Latter, Marchas Populares og Blått skilt: Aud Schønemann",
    "media: Frognerstranda og Grand Hotel",
    "subkultur: House of Nerds",
    "politikk: Slottsplassen",
    "musikk: Casa-Museu Amália Rodrigues",
    "by: Lisboa trikk 28",
    "naeringsliv: Feira da Ladra",
    "religion: Santo António-festivalen",
    "litteratur: Feira do Livro de Lisboa",
  ];
  const peopleLines = Object.entries(PEOPLE)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, spec]) => `- ${id} → ${spec.category}`);
  const report = [
    "# Fjerning av Populærkultur som toppdomene",
    "",
    "Dato: 2026-07-25",
    "",
    "Populærkultur er fjernet som runtime- og fagkategori. Begrepet beholdes som tverrgående tagg/linse. Den kanoniske fagpakken er bevart under `media` som delfeltet `populaerkultur_som_mediefelt`.",
    "",
    "## Endelig stedsklassifisering",
    ...placeLines.map((line) => `- ${line}`),
    "",
    "## Endelig People-klassifisering",
    ...peopleLines,
    "",
    "## Quiz og støttedata",
    "- Populærkulturquizene er gruppert på nytt etter endelig person- eller stedskategori.",
    "- `vg_huset_sets.json` er flyttet fra sport til media.",
    "- Koordinat-evidens og manifeststier følger de nye aktive place-filene.",
    "- Lisboa-People bruker normalisert sti uten duplisert `portugal/lisbon`.",
    "",
  ].join("\n");
  await fs.writeFile(path.join(ROOT, "reports", "remove-popkultur-domain-2026-07-25.md"), `${report}\n`, "utf8");
}

function run(name) {
  execFileSync("npm", ["run", name], { cwd: ROOT, stdio: "inherit", env: process.env });
}

await extractAndRewriteManifest({
  manifestPath: path.join(DATA, "people", "manifest.json"),
  mapping: PEOPLE,
  destinationFor: canonicalPeopleEntry,
});

await extractAndRewriteManifest({
  manifestPath: path.join(DATA, "places", "manifest.json"),
  mapping: PLACES,
  destinationFor: canonicalPlaceEntry,
});

const peopleCategories = await activeCategoryMap(path.join(DATA, "people", "manifest.json"));
const placeCategories = await activeCategoryMap(path.join(DATA, "places", "manifest.json"));
await regroupPopQuizFiles(peopleCategories, placeCategories);
await updateAudEvidence(placeCategories);
await writeFinalReport();

run("audit:categories");
run("audit:people-of-places");
run("audit:quiz-manifest:v2");
run("places:emner:check");

console.log(JSON.stringify({
  correctedPeople: Object.keys(PEOPLE).length,
  correctedPlaces: Object.keys(PLACES).length,
  quizOnlyOverrides: Object.keys(QUIZ_ONLY_PERSON_CATEGORIES).length,
}, null, 2));
