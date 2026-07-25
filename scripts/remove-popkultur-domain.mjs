import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const POP_IDS = new Set(["popkultur", "populaerkultur", "populærkultur"]);
const report = {
  places: [],
  people: [],
  quizzes: [],
  auxiliary: [],
  skippedExistingPeople: [],
  fag: [],
};

const PLACE_TARGETS = {
  cinemateket_oslo: "film_tv",
  colosseum_kino: "film_tv",
  house_of_nerds: "subkultur",
  chateau_neuf: "scenekunst",
  frognerstranda: "media",
  grand_hotel: "media",
  slottsplassen: "politikk",
  lisbon_casa_museu_amalia_rodrigues: "musikk",
  lisbon_tram_28: "by",
  lisbon_marchas_populares: "scenekunst",
  lisbon_feira_da_ladra: "naeringsliv",
  lisbon_santo_antonio_festival: "religion",
  lisbon_feira_do_livro: "litteratur",
};

const PERSON_TARGETS = {
  astrid_s: "musikk",
  kirsti_sparboe: "musikk",
  inger_lise_rypdal: "musikk",
  ole_paus: "musikk",
  jens_book_jenssen: "musikk",
  colosseum_premierepublikummet: "film_tv",
  christian_morgenstierne: "by",
  arne_eide: "by",
  andreas_sollund: "subkultur",
  stephen_butkus: "kunst",
  tinashe_williamson: "media",
};

const abs = (...parts) => path.join(ROOT, ...parts);
const rel = (file) => path.relative(ROOT, file).split(path.sep).join("/");

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

async function walk(dir) {
  if (!(await exists(dir))) return [];
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function isPop(value) {
  return POP_IDS.has(String(value ?? "").trim().toLowerCase());
}

function textOf(value) {
  try { return JSON.stringify(value).toLowerCase(); } catch { return ""; }
}

function classify(value, fallback = "media") {
  const id = String(value?.id ?? value?.personId ?? value?.placeId ?? "");
  if (PLACE_TARGETS[id]) return PLACE_TARGETS[id];
  if (PERSON_TARGETS[id]) return PERSON_TARGETS[id];
  if (PLACE_TARGETS[value?.placeId]) return PLACE_TARGETS[value.placeId];
  if (PERSON_TARGETS[value?.personId]) return PERSON_TARGETS[value.personId];

  const t = textOf(value);
  if (/arkitekt|arkitektur|byrom|transport|trikk|urban|vannfront|plassrom/.test(t)) return "by";
  if (/bokmesse|forfatter|litteratur|roman|poesi|bokhandel|lesekultur/.test(t)) return "litteratur";
  if (/helgen|religi|liturgi|messe|kirke|santo ant[oó]nio|skytshelgen/.test(t)) return "religion";
  if (/marked|handel|hotell|bedrift|næringsliv|naeringsliv|kommersiell/.test(t)) return "naeringsliv";
  if (/sport|fotball|ski|idrett|olymp/.test(t)) return "sport";
  if (/spill|gaming|nerd|fandom|cosplay|fanmiljø|fanmiljo|subkultur/.test(t)) return "subkultur";
  if (/revy|teater|scenekunst|standup|impro|komiker|humor|skuespiller|musikal|koreografi|parade/.test(t)) return "scenekunst";
  if (/fado|sanger|musiker|popartist|musikk|konsert|plate|artist/.test(t)) return "musikk";
  if (/film|kino|cinema|filmskaper|tv-serie/.test(t)) return "film_tv";
  if (/fotograf|billedkunst|visuell kunst|galleri|museumskunst/.test(t)) return "kunst";
  if (/slott|kongelig|nasjonal seremoni|politikk|samfunnsdebatt|offentlig styring/.test(t)) return "politikk";
  if (/avis|journalist|redaksjon|kringkasting|radio|tv|presse|medie|programleder|plattform|algoritme/.test(t)) return "media";
  return fallback;
}

function updateCategoryFields(value, target) {
  if (Array.isArray(value)) return value.map((item) => updateCategoryFields(item, target));
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    let next = raw;
    if (["category", "categoryId", "category_id", "domainId", "domain_id", "badgeId", "badge_id"].includes(key) && isPop(raw)) {
      next = target;
    }
    if (["subject_id", "subjectId", "subject"].includes(key) && isPop(raw)) {
      next = target === "media" ? "media" : target;
    }
    out[key] = updateCategoryFields(next, target);
  }
  return out;
}

function migrateAcademicIds(value) {
  if (Array.isArray(value)) return value.map(migrateAcademicIds);
  if (typeof value === "string") {
    return value
      .replaceAll("em_pop_", "em_media_pop_")
      .replaceAll("met_pop_", "met_media_pop_")
      .replaceAll("populaerkulturpensum_v4_5", "mediapensum_v4_5_populaerkultur")
      .replaceAll("popkultur/populaerkultur", "media/populaerkultur_som_mediefelt");
  }
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    if (["subject_id", "subjectId"].includes(key) && isPop(raw)) out[key] = "media";
    else out[key] = migrateAcademicIds(raw);
  }
  return out;
}

function recordsFromJson(data) {
  if (Array.isArray(data)) return data.filter((x) => x && typeof x === "object" && x.id);
  if (data && typeof data === "object" && data.id) return [data];
  return [];
}

async function updateJsonRecordsOutside(dir, entityKind) {
  for (const file of (await walk(dir)).filter((f) => f.endsWith(".json") && !f.includes(`${path.sep}popkultur${path.sep}`))) {
    let data;
    try { data = await readJson(file); } catch { continue; }
    let changed = false;
    const mutate = (node) => {
      if (Array.isArray(node)) return node.map(mutate);
      if (!node || typeof node !== "object") return node;
      const hasPop = isPop(node.category) || isPop(node.categoryId) || isPop(node.category_id);
      const target = hasPop ? classify(node) : null;
      const out = {};
      for (const [key, raw] of Object.entries(node)) {
        if (hasPop && ["category", "categoryId", "category_id"].includes(key) && isPop(raw)) {
          out[key] = target;
          changed = true;
        } else out[key] = mutate(raw);
      }
      return out;
    };
    const next = mutate(data);
    if (changed) {
      await writeJson(file, next);
      report[entityKind].push(`${rel(file)} (in-place)`);
    }
  }
}

async function migratePlaces() {
  const root = abs("data/places");
  await updateJsonRecordsOutside(root, "places");
  const popRoot = path.join(root, "popkultur");
  const candidates = new Map();
  for (const file of (await walk(popRoot)).filter((f) => f.endsWith(".json"))) {
    let data;
    try { data = await readJson(file); } catch { continue; }
    for (const record of recordsFromJson(data)) {
      if (!PLACE_TARGETS[record.id] && !isPop(record.category) && record.category !== "film_tv") continue;
      const score = JSON.stringify(record).length + (file.includes("places_oslo_populaerkultur/") || file.includes("places_lisbon_populaerkultur/") ? 100000 : 0);
      if (!candidates.has(record.id) || candidates.get(record.id).score < score) candidates.set(record.id, { record, file, score });
    }
  }

  const newPaths = [];
  for (const [id, { record, file }] of candidates) {
    const target = PLACE_TARGETS[id] || classify(record);
    const region = id.startsWith("lisbon_") || file.includes(`${path.sep}lisbon${path.sep}`)
      ? "europe/portugal/lisbon"
      : "oslo";
    const dest = path.join(root, target, region, `${id}.json`);
    const next = updateCategoryFields({ ...record, category: target }, target);
    await writeJson(dest, migrateAcademicIds(next));
    newPaths.push(rel(dest).replace(/^data\//, ""));
    report.places.push(`${id} → ${target}`);
  }
  await fs.rm(popRoot, { recursive: true, force: true });

  const manifestFile = path.join(root, "manifest.json");
  const manifest = await readJson(manifestFile);
  manifest.files = (manifest.files || []).filter((p) => !p.includes("places/popkultur/"));
  for (const p of newPaths.sort()) if (!manifest.files.includes(p)) manifest.files.push(p);
  await writeJson(manifestFile, manifest);
}

async function scanExistingPersonIds(popRoot) {
  const ids = new Set();
  for (const file of (await walk(abs("data/people"))).filter((f) => f.endsWith(".json") && !f.startsWith(popRoot))) {
    let data;
    try { data = await readJson(file); } catch { continue; }
    for (const record of recordsFromJson(data)) ids.add(record.id);
  }
  return ids;
}

async function migratePeople() {
  const root = abs("data/people");
  await updateJsonRecordsOutside(root, "people");
  const popRoot = path.join(root, "popkultur");
  const existingIds = await scanExistingPersonIds(popRoot);
  const candidates = new Map();
  for (const file of (await walk(popRoot)).filter((f) => f.endsWith(".json"))) {
    let data;
    try { data = await readJson(file); } catch { continue; }
    for (const record of recordsFromJson(data)) {
      const score = JSON.stringify(record).length + (Array.isArray(data) ? 0 : 100000);
      if (!candidates.has(record.id) || candidates.get(record.id).score < score) candidates.set(record.id, { record, file, score });
    }
  }

  const newPaths = [];
  for (const [id, { record, file }] of candidates) {
    if (existingIds.has(id)) {
      report.skippedExistingPeople.push(id);
      continue;
    }
    const target = PERSON_TARGETS[id] || classify(record, "scenekunst");
    const region = file.includes(`${path.sep}lisbon${path.sep}`) || String(record.placeId || "").startsWith("lisbon_")
      ? "europe/portugal/lisbon"
      : "oslo";
    const sourceParts = file.split(path.sep);
    const popIndex = sourceParts.lastIndexOf("popkultur");
    const trailingDirs = sourceParts.slice(popIndex + 2, -1).filter((x) => x && x !== "oslo");
    const anchor = trailingDirs.length ? trailingDirs.join("/") : String(record.placeId || "misc").replace(/[^a-z0-9_/-]/gi, "_");
    const dest = path.join(root, target, region, anchor, `${id}.json`);
    const next = updateCategoryFields({ ...record, category: target }, target);
    await writeJson(dest, migrateAcademicIds(next));
    newPaths.push(rel(dest).replace(/^data\//, ""));
    report.people.push(`${id} → ${target}`);
  }
  await fs.rm(popRoot, { recursive: true, force: true });

  const manifestFile = path.join(root, "manifest.json");
  const manifest = await readJson(manifestFile);
  manifest.files = (manifest.files || []).filter((p) => !p.includes("people/popkultur/"));
  for (const p of newPaths.sort()) if (!manifest.files.includes(p)) manifest.files.push(p);
  await writeJson(manifestFile, manifest);
}

function classifyQuiz(item, filename = "") {
  if (PLACE_TARGETS[item?.targetId]) return PLACE_TARGETS[item.targetId];
  if (PLACE_TARGETS[item?.placeId]) return PLACE_TARGETS[item.placeId];
  if (PERSON_TARGETS[item?.personId]) return PERSON_TARGETS[item.personId];
  const f = filename.toLowerCase();
  const byFile = [
    ["folketeater", "scenekunst"], ["latter", "scenekunst"], ["chateau", "scenekunst"], ["edderkoppen", "scenekunst"], ["chat_noir", "scenekunst"],
    ["arquivo_rtp", "media"], ["antena_1", "media"], ["diario_de_noticias", "media"], ["dagbladet", "media"], ["aftenposten", "media"],
    ["feira_da_ladra", "naeringsliv"], ["amalia", "musikk"], ["tram_28", "by"], ["marchas", "scenekunst"], ["santo_antonio", "religion"],
    ["feira_do_livro", "litteratur"], ["cinemateket", "film_tv"], ["colosseum", "film_tv"], ["house_of_nerds", "subkultur"], ["slottsplassen", "politikk"],
  ];
  for (const [needle, target] of byFile) if (f.includes(needle)) return target;
  return classify(item, "media");
}

async function migrateQuizzes() {
  const root = abs("data/quiz");
  const aggregate = path.join(root, "quiz_populaerkultur.json");
  const addedFiles = [];
  if (await exists(aggregate)) {
    const data = await readJson(aggregate);
    const groups = new Map();
    for (const item of Array.isArray(data) ? data : []) {
      const target = classifyQuiz(item, path.basename(aggregate));
      const next = updateCategoryFields(item, target);
      if (!groups.has(target)) groups.set(target, []);
      groups.get(target).push(migrateAcademicIds(next));
    }
    for (const [target, items] of groups) {
      const dest = path.join(root, `quiz_${target}_from_populaerkultur.json`);
      await writeJson(dest, items);
      addedFiles.push(rel(dest));
      report.quizzes.push(`${path.basename(aggregate)} → ${path.basename(dest)} (${items.length})`);
    }
    await fs.rm(aggregate, { force: true });
  }

  const popRoot = path.join(root, "popkultur");
  const movedSetPaths = new Map();
  for (const file of (await walk(popRoot)).filter((f) => f.endsWith(".json"))) {
    let data;
    try { data = await readJson(file); } catch { continue; }
    const sample = Array.isArray(data) ? data[0] : data;
    const target = classifyQuiz(sample, path.basename(file));
    const dest = path.join(root, target, path.basename(file));
    await writeJson(dest, migrateAcademicIds(updateCategoryFields(data, target)));
    movedSetPaths.set(rel(file), rel(dest));
    report.quizzes.push(`${rel(file)} → ${rel(dest)}`);
  }
  await fs.rm(popRoot, { recursive: true, force: true });

  for (const file of (await walk(root)).filter((f) => f.endsWith(".json") && !f.endsWith("manifest.json"))) {
    let data;
    try { data = await readJson(file); } catch { continue; }
    let changed = false;
    const mutate = (node) => {
      if (Array.isArray(node)) return node.map(mutate);
      if (!node || typeof node !== "object") return node;
      const target = classifyQuiz(node, path.basename(file));
      const out = {};
      for (const [key, raw] of Object.entries(node)) {
        if (["category", "categoryId", "category_id", "subject_id"].includes(key) && isPop(raw)) {
          out[key] = target;
          changed = true;
        } else out[key] = mutate(raw);
      }
      return out;
    };
    const next = migrateAcademicIds(mutate(data));
    if (changed || JSON.stringify(next) !== JSON.stringify(data)) await writeJson(file, next);
  }

  const manifestFile = path.join(root, "manifest.json");
  const manifest = await readJson(manifestFile);
  manifest.files = (manifest.files || []).filter((p) => !p.includes("quiz_populaerkultur.json") && !p.includes("/popkultur/"));
  for (const p of addedFiles) if (!manifest.files.includes(p)) manifest.files.push(p);
  manifest.sets = (manifest.sets || []).map((entry) => {
    const oldRel = String(entry.file || "");
    const mapped = movedSetPaths.get(oldRel);
    if (mapped) return { ...entry, file: mapped };
    if (oldRel.includes("data/quiz/popkultur/")) {
      const target = PLACE_TARGETS[entry.targetId] || classify(entry, "media");
      return { ...entry, file: oldRel.replace("data/quiz/popkultur/", `data/quiz/${target}/`) };
    }
    return entry;
  });
  await writeJson(manifestFile, manifest);
}

async function migrateFag() {
  const root = abs("data/fag");
  const source = path.join(root, "popkultur");
  const media = path.join(root, "media");
  const supplement = path.join(media, "populaerkultur_som_mediefelt");
  await fs.mkdir(supplement, { recursive: true });

  const emnerSource = path.join(source, "emner_populaerkultur_canonical_v4_5.json");
  const emnerDest = path.join(media, "emner_media_populaerkultur_canonical_v4_5.json");
  if (await exists(emnerSource)) {
    await writeJson(emnerDest, migrateAcademicIds(await readJson(emnerSource)));
    report.fag.push(`${rel(emnerSource)} → ${rel(emnerDest)}`);
  }

  const methodsSource = path.join(source, "methods_populaerkultur_canonical_v4_5.json");
  const methodsTarget = path.join(media, "methods_media_canonical_v4_5.json");
  if (await exists(methodsSource) && await exists(methodsTarget)) {
    const sourceData = migrateAcademicIds(await readJson(methodsSource));
    const targetData = await readJson(methodsTarget);
    const existing = new Set((targetData.methods || []).map((m) => m.method_id));
    for (const method of sourceData.methods || []) if (!existing.has(method.method_id)) targetData.methods.push(method);
    targetData.migrated_subfields = Array.from(new Set([...(targetData.migrated_subfields || []), "populaerkultur_som_mediefelt"]));
    await writeJson(methodsTarget, targetData);
    report.fag.push(`${rel(methodsSource)} → merged into ${rel(methodsTarget)}`);
  }

  for (const file of await walk(source)) {
    if (file === emnerSource || file === methodsSource) continue;
    const dest = path.join(supplement, path.basename(file));
    if (file.endsWith(".json")) await writeJson(dest, migrateAcademicIds(updateCategoryFields(await readJson(file), "media")));
    else {
      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(dest, `> Migrert fra det tidligere toppdomenet Populærkultur. Materialet er nå et mediefaglig delfelt.\n\n${content}`);
    }
    report.fag.push(`${rel(file)} → ${rel(dest)}`);
  }

  const oldAlt = path.join(root, "populaerkultur");
  if (await exists(oldAlt)) {
    for (const file of await walk(oldAlt)) {
      const dest = path.join(supplement, path.basename(file));
      await fs.copyFile(file, dest);
      report.fag.push(`${rel(file)} → ${rel(dest)}`);
    }
  }

  const manifestFile = path.join(root, "fag_manifest.json");
  const manifest = await readJson(manifestFile);
  delete manifest.popkultur;
  manifest.media.emner = "media/emner_media_populaerkultur_canonical_v4_5.json";
  manifest.media.supplements = {
    ...(manifest.media.supplements || {}),
    populaerkultur_som_mediefelt: {
      status: "migrated_subfield",
      root: "media/populaerkultur_som_mediefelt",
      rationale: "Populærkultur er en tverrgående analyse- og tagglinse, ikke et toppdomene. Fagpakken er bevart som mediefaglig delfelt."
    }
  };
  await writeJson(manifestFile, manifest);

  await fs.rm(source, { recursive: true, force: true });
  await fs.rm(oldAlt, { recursive: true, force: true });
}

async function migrateAuxiliaryData() {
  const dataRoot = abs("data");
  const handled = new Set(["places", "people", "quiz", "fag", "reports"]);
  for (const top of await fs.readdir(dataRoot, { withFileTypes: true })) {
    if (!top.isDirectory() || handled.has(top.name)) continue;
    const topDir = path.join(dataRoot, top.name);
    for (const file of await walk(topDir)) {
      const normalized = rel(file);
      if (!/(^|\/)(popkultur|populaerkultur)(\/|$)/.test(normalized)) continue;
      if (!(await exists(file))) continue;
      let target = "media";
      const base = path.basename(file, path.extname(file));
      for (const [id, cat] of Object.entries(PLACE_TARGETS)) if (base.includes(id.replace(/^lisbon_/, "")) || base.includes(id)) target = cat;
      const dest = file
        .replace(`${path.sep}popkultur${path.sep}`, `${path.sep}${target}${path.sep}`)
        .replace(`${path.sep}populaerkultur${path.sep}`, `${path.sep}${target}${path.sep}`);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      if (file.endsWith(".json")) {
        let data;
        try { data = await readJson(file); } catch { data = null; }
        if (data != null) await writeJson(dest, migrateAcademicIds(updateCategoryFields(data, target)));
        else await fs.copyFile(file, dest);
      } else await fs.copyFile(file, dest);
      await fs.rm(file, { force: true });
      report.auxiliary.push(`${normalized} → ${rel(dest)}`);
    }
  }
}

async function editText(file, fn) {
  if (!(await exists(file))) return;
  const before = await fs.readFile(file, "utf8");
  const after = fn(before);
  if (after !== before) await fs.writeFile(file, after);
}

async function migrateRuntime() {
  await editText(abs("js/DomainRegistry.js"), (text) => text
    .replace(/^\s*"popkultur",\s*$/gm, "")
    .replace(/^\s*"populaerkultur",\s*$/gm, "")
    .replace(/^\s*"populærkultur".*$/gm, "")
    .replace(/^\s*"popular[_ -]?culture".*$/gmi, "")
    .replace(/^\s*"popularculture".*$/gmi, "")
    .replace(/^\s*"popular_kultur".*$/gmi, ""));

  const removeCategoryBlock = (text) => text.replace(/\n\s*\{\n\s*id: "populaerkultur",[\s\S]*?aliases: \["popkultur"\]\n\s*\},?/m, "");
  await editText(abs("js/core/categories.ts"), removeCategoryBlock);
  await editText(abs("js/core/categories.js"), removeCategoryBlock);

  const contractFile = abs("data/categories/category_contract.json");
  const contract = await readJson(contractFile);
  contract.version = "1.3";
  contract.updatedAt = "2026-07-25";
  contract.rule = "Én kategori har én runtime-id og én fag-id. Populærkultur brukes som tverrgående tagg og mediefaglig analysefelt, ikke som toppkategori.";
  contract.runtimeCategories = contract.runtimeCategories.filter((x) => !isPop(x));
  contract.fagSubjects = contract.fagSubjects.filter((x) => !isPop(x));
  delete contract.runtimeToFag?.populaerkultur;
  delete contract.fagToRuntime?.popkultur;
  for (const key of Object.keys(contract.aliases || {})) if (isPop(key) || isPop(contract.aliases[key])) delete contract.aliases[key];
  delete contract.labels?.populaerkultur;
  contract.decisions.populaerkultur = "Ikke eget domene. Beholdes som tagg/linse; fagpakken er flyttet til media som delfelt.";
  await writeJson(contractFile, contract);

  await editText(abs("js/emnerLoader.ts"), (text) => {
    let next = text
      .replace(/^\s*\/\/ populaerkultur.*$/gm, "")
      .replace(/^\s*popkultur:\s*.*$/gm, "")
      .replace(/^\s*populaerkultur:\s*.*$/gm, "");
    if (!/^\s*media:\s*/m.test(next)) next = next.replace(/(\s*litteratur:\s*[^\n]+\n)/, `$1    media:          "data/fag/media/emner_media_populaerkultur_canonical_v4_5.json",\n`);
    return next;
  });

  for (const file of ["CLAUDE.md", "docs/DOMAIN_CONTRACT.md", "docs/DOMAIN_REGISTRY_README.md", "README/SYSTEM_REGISTRY.md"]) {
    await editText(abs(file), (text) => text
      .replace(/,\s*popkultur(?=,|\.)/g, "")
      .replace(/popkultur,\s*/g, "")
      .replace(/`popkultur`\s*\/\s*`populaerkultur`[^\n]*/g, "Populærkultur er nå en tverrgående tagg/linse under mediefaget."));
  }

  const redirect = (target) => `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${target}"><title>Flyttet</title><p>Populærkultur er flyttet til Medier som tverrgående linse. <a href="${target}">Åpne Medier</a>.</p>\n`;
  for (const [file, target] of [
    ["knowledge_popkultur.html", "knowledge/knowledge_media.html"],
    ["knowledge/knowledge_popkultur.html", "knowledge_media.html"],
    ["merker/merke_popkultur.html", "merke_media.html"],
  ]) if (await exists(abs(file))) await fs.writeFile(abs(file), redirect(target));
}

async function rewriteAcademicRefs() {
  for (const top of ["data/places", "data/people", "data/quiz", "data/stories", "data/leksikon", "data/fag/media"]) {
    for (const file of (await walk(abs(top))).filter((f) => f.endsWith(".json"))) {
      let data;
      try { data = await readJson(file); } catch { continue; }
      const next = migrateAcademicIds(data);
      if (JSON.stringify(next) !== JSON.stringify(data)) await writeJson(file, next);
    }
  }
}

async function audit() {
  const failures = [];
  for (const top of ["data/places", "data/people", "data/quiz", "data/fag", "data/categories"]) {
    for (const file of (await walk(abs(top))).filter((f) => f.endsWith(".json"))) {
      let data;
      try { data = await readJson(file); } catch { continue; }
      const inspect = (node, pointer = "$") => {
        if (Array.isArray(node)) return node.forEach((item, i) => inspect(item, `${pointer}[${i}]`));
        if (!node || typeof node !== "object") return;
        for (const [key, value] of Object.entries(node)) {
          if (["category", "categoryId", "category_id", "subject_id", "subjectId"].includes(key) && isPop(value)) failures.push(`${rel(file)} ${pointer}.${key}=${value}`);
          inspect(value, `${pointer}.${key}`);
        }
      };
      inspect(data);
    }
  }
  for (const file of await walk(abs("data"))) {
    const p = rel(file);
    if (!p.startsWith("data/reports/") && /\/(popkultur|populaerkultur)\//.test(p)) failures.push(`remaining active path: ${p}`);
  }
  if (failures.length) throw new Error(`Popkultur migration audit failed:\n${failures.join("\n")}`);
}

async function writeReport() {
  const lines = [
    "# Fjerning av Populærkultur som toppdomene",
    "",
    "Dato: 2026-07-25",
    "",
    "Populærkultur er fjernet som runtime- og fagkategori. Begrepet beholdes som tverrgående tagg/linse. Den kanoniske fagpakken er bevart som et mediefaglig delfelt.",
    "",
    "## Steder",
    ...report.places.map((x) => `- ${x}`),
    "",
    "## People",
    ...report.people.map((x) => `- ${x}`),
    "",
    "## Eksisterende people-ID-er som allerede lå utenfor domenet",
    ...(report.skippedExistingPeople.length ? report.skippedExistingPeople.map((x) => `- ${x}`) : ["- Ingen"]),
    "",
    "## Quiz",
    ...report.quizzes.map((x) => `- ${x}`),
    "",
    "## Fagfiler",
    ...report.fag.map((x) => `- ${x}`),
    "",
    "## Andre aktive datafiler",
    ...(report.auxiliary.length ? report.auxiliary.map((x) => `- ${x}`) : ["- Ingen"]),
    "",
  ];
  await fs.mkdir(abs("reports"), { recursive: true });
  await fs.writeFile(abs("reports/remove-popkultur-domain-2026-07-25.md"), `${lines.join("\n")}\n`);
}

await migratePlaces();
await migratePeople();
await migrateQuizzes();
await migrateFag();
await migrateAuxiliaryData();
await migrateRuntime();
await rewriteAcademicRefs();
await audit();
await writeReport();

console.log(JSON.stringify({
  places: report.places.length,
  people: report.people.length,
  quizzes: report.quizzes.length,
  fag: report.fag.length,
  auxiliary: report.auxiliary.length,
}, null, 2));
