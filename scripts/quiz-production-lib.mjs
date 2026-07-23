import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const MANIFEST_PATH = "data/fag/fag_manifest.json";
export const PACKAGE_SCHEMA_PATH = "data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json";

export function toPosix(value) {
  return value.split(path.sep).join("/");
}

export function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function unique(values) {
  return [...new Set(values.filter(hasText))];
}

export async function exists(root, relativePath) {
  try {
    await access(path.resolve(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

export async function readFileRecord(root, relativePath) {
  const normalizedPath = toPosix(relativePath);
  const absolutePath = path.resolve(root, normalizedPath);
  const buffer = await readFile(absolutePath);
  const text = buffer.toString("utf8");
  let data = null;

  if (normalizedPath.endsWith(".json")) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`${normalizedPath}: ugyldig JSON (${error.message})`);
    }
  }

  return {
    path: normalizedPath,
    bytes: buffer.byteLength,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    format: normalizedPath.endsWith(".json") ? "json" : "text",
    text,
    data
  };
}

export async function readJson(root, relativePath) {
  return (await readFileRecord(root, relativePath)).data;
}

export function resolveFagPath(root, manifestValue) {
  const absolutePath = path.resolve(root, "data/fag", manifestValue);
  return toPosix(path.relative(root, absolutePath));
}

export async function loadProductionInputs({ root = process.cwd(), categoryId }) {
  const manifestRecord = await readFileRecord(root, MANIFEST_PATH);
  const manifest = manifestRecord.data;
  const entry = manifest?.[categoryId];

  if (!entry || typeof entry !== "object") {
    throw new Error(`Ukjent manifestkategori: ${categoryId}`);
  }
  if (!entry.quizProduction || typeof entry.quizProduction !== "object") {
    throw new Error(`Kategorien ${categoryId} har ikke aktiv quizProduction`);
  }

  const requiredInputs = asArray(entry.quizProduction.required_inputs);
  if (!requiredInputs.length) {
    throw new Error(`Kategorien ${categoryId} mangler quizProduction.required_inputs`);
  }

  const records = {};
  const resolvedFiles = {};
  for (const key of requiredInputs) {
    const manifestValue = entry[key];
    if (!hasText(manifestValue)) {
      throw new Error(`${categoryId}: obligatorisk manifestnøkkel mangler: ${key}`);
    }
    const relativePath = resolveFagPath(root, manifestValue);
    if (!(await exists(root, relativePath))) {
      throw new Error(`${categoryId}: obligatorisk fil mangler: ${relativePath}`);
    }
    const record = await readFileRecord(root, relativePath);
    records[key] = record;
    resolvedFiles[key] = {
      path: record.path,
      bytes: record.bytes,
      sha256: record.sha256,
      format: record.format
    };
  }

  return {
    root,
    categoryId,
    manifest,
    manifestEntry: entry,
    manifestRecord,
    requiredInputs,
    records,
    resolvedFiles
  };
}

export async function loadProductionTarget({ root = process.cwd(), loaded, targetId }) {
  const config = loaded.manifestEntry.quizProduction?.targets?.[targetId];
  if (!config || typeof config !== "object") {
    throw new Error(`${loaded.categoryId}: målet ${targetId} mangler quizProduction.targets-oppføring`);
  }

  const paths = {};
  for (const key of ["source_brief", "context_artifact", "quiz_file"]) {
    if (!hasText(config[key])) {
      throw new Error(`${loaded.categoryId}/${targetId}: target-konfigurasjonen mangler ${key}`);
    }
    paths[key] = resolveFagPath(root, config[key]);
  }

  if (!(await exists(root, paths.source_brief))) {
    throw new Error(`${loaded.categoryId}/${targetId}: kildegrunnlaget mangler: ${paths.source_brief}`);
  }
  const briefRecord = await readFileRecord(root, paths.source_brief);
  const brief = briefRecord.data;
  if (brief?.categoryId !== loaded.categoryId || brief?.targetId !== targetId) {
    throw new Error(`${paths.source_brief}: categoryId eller targetId stemmer ikke med manifestet`);
  }
  if (!asArray(brief.claims).length) {
    throw new Error(`${paths.source_brief}: kildegrunnlaget mangler påstander`);
  }
  if (!["reviewed", "partial", "pending"].includes(brief.status)) {
    throw new Error(`${paths.source_brief}: kildegrunnlaget mangler gyldig status`);
  }
  if (!brief.sources || typeof brief.sources !== "object" || Array.isArray(brief.sources)) {
    throw new Error(`${paths.source_brief}: kildegrunnlaget mangler kilderegister`);
  }

  const claimIds = new Set();
  const claimOrders = new Set();
  for (const claim of brief.claims) {
    if (!hasText(claim.claim_id) || claimIds.has(claim.claim_id)) {
      throw new Error(`${paths.source_brief}: ugyldig eller duplisert claim_id`);
    }
    if (!Number.isInteger(claim.order) || claim.order < 1 || claimOrders.has(claim.order)) {
      throw new Error(`${paths.source_brief}: ugyldig eller duplisert påstandsrekkefølge`);
    }
    if (!hasText(claim.statement) || !asArray(claim.source_ids).length) {
      throw new Error(`${paths.source_brief}: ${claim.claim_id} mangler påstand eller kilde`);
    }
    for (const sourceId of claim.source_ids) {
      if (!brief.sources[sourceId]) {
        throw new Error(`${paths.source_brief}: ${claim.claim_id} viser til ukjent kilde ${sourceId}`);
      }
    }
    claimIds.add(claim.claim_id);
    claimOrders.add(claim.order);
  }

  for (const [sourceId, source] of Object.entries(brief.sources)) {
    if (!hasText(source?.url) || !["reviewed", "partial", "pending"].includes(source?.review_status)) {
      throw new Error(`${paths.source_brief}: kilden ${sourceId} mangler URL eller gyldig review_status`);
    }
  }

  return {
    config,
    paths,
    brief,
    briefRecord
  };
}

export function collectQuestions(node, output = []) {
  if (Array.isArray(node)) {
    for (const value of node) collectQuestions(value, output);
    return output;
  }
  if (!node || typeof node !== "object") return output;

  if (typeof node.question === "string" && Array.isArray(node.options)) {
    output.push(node);
  }
  for (const value of Object.values(node)) collectQuestions(value, output);
  return output;
}

export function findObjectById(node, targetId) {
  if (Array.isArray(node)) {
    for (const value of node) {
      const match = findObjectById(value, targetId);
      if (match) return match;
    }
    return null;
  }
  if (!node || typeof node !== "object") return null;
  if (node.id === targetId) return node;

  for (const value of Object.values(node)) {
    const match = findObjectById(value, targetId);
    if (match) return match;
  }
  return null;
}

function objectReferencesTarget(item, targetId) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  const keys = [
    "id",
    "targetId",
    "placeId",
    "place_id",
    "personId",
    "person_id",
    "natureId",
    "nature_id",
    "place",
    "person",
    "from",
    "to",
    "fromId",
    "toId"
  ];
  return keys.some((key) => item[key] === targetId);
}

export function collectReferencingObjects(node, targetId, output = []) {
  if (Array.isArray(node)) {
    for (const value of node) collectReferencingObjects(value, targetId, output);
    return output;
  }
  if (!node || typeof node !== "object") return output;

  if (objectReferencesTarget(node, targetId)) output.push(node);
  for (const value of Object.values(node)) collectReferencingObjects(value, targetId, output);
  return output;
}

async function listJsonFiles(root, relativeDir) {
  const absoluteDir = path.resolve(root, relativeDir);
  if (!(await exists(root, relativeDir))) return [];
  const files = [];

  async function visit(currentDir) {
    for (const entry of await readdir(currentDir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(toPosix(path.relative(root, absolutePath)));
      }
    }
  }

  await visit(absoluteDir);
  return files.sort();
}

async function resolveTargetRecord({ root, targetId }) {
  const indexCandidates = [
    "data/places/places_index.json",
    "data/people/manifest.json"
  ];

  for (const indexPath of indexCandidates) {
    if (!(await exists(root, indexPath))) continue;
    const indexRecord = await readFileRecord(root, indexPath);
    const indexItem = findObjectById(indexRecord.data, targetId);
    if (!indexItem) continue;

    const sourceFile = hasText(indexItem.sourceFile)
      ? toPosix(path.join("data", indexItem.sourceFile))
      : null;
    if (sourceFile && await exists(root, sourceFile)) {
      const sourceRecord = await readFileRecord(root, sourceFile);
      return {
        indexPath,
        indexRecord,
        indexItem,
        path: sourceRecord.path,
        record: sourceRecord,
        item: findObjectById(sourceRecord.data, targetId) || sourceRecord.data
      };
    }

    return {
      indexPath,
      indexRecord,
      indexItem,
      path: indexRecord.path,
      record: indexRecord,
      item: indexItem
    };
  }

  return null;
}

async function resolveRelationSources({ root, targetId }) {
  const dataEntries = await readdir(path.resolve(root, "data"), { withFileTypes: true });
  const relationPaths = dataEntries
    .filter((entry) => entry.isFile() && /^relations.*\.json$/u.test(entry.name))
    .map((entry) => `data/${entry.name}`)
    .sort();
  const results = [];

  for (const relationPath of relationPaths) {
    const record = await readFileRecord(root, relationPath);
    const matches = collectReferencingObjects(record.data, targetId);
    if (matches.length) results.push({ record, matches });
  }
  return results;
}

async function resolveStorySources({ root, targetId }) {
  const results = [];
  for (const storyPath of await listJsonFiles(root, "data/stories")) {
    const record = await readFileRecord(root, storyPath);
    const matches = collectReferencingObjects(record.data, targetId).filter((item) => {
      return hasText(item.id) && (
        hasText(item.story)
        || hasText(item.summary)
        || hasText(item.title)
      );
    });
    if (matches.length) results.push({ record, matches });
  }
  return results;
}

export function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function objectContainsTerm(value, terms) {
  const normalized = normalizeSearch(JSON.stringify(value));
  return terms.some((term) => term && normalized.includes(term));
}

function collectIdsForKeys(node, wantedKeys, output = []) {
  if (Array.isArray(node)) {
    for (const value of node) collectIdsForKeys(value, wantedKeys, output);
    return output;
  }
  if (!node || typeof node !== "object") return output;

  for (const [key, value] of Object.entries(node)) {
    if (wantedKeys.has(key)) {
      if (Array.isArray(value)) output.push(...value.filter(hasText));
      else if (hasText(value)) output.push(value);
    }
    collectIdsForKeys(value, wantedKeys, output);
  }
  return output;
}

export function curriculumIndexes(records) {
  const pensum = records.pensum?.data || {};
  const emner = records.emner?.data || [];
  const fagkart = records.fagkart?.data || {};
  const methods = records.methods?.data || {};

  const modules = asArray(pensum.modules).length
    ? asArray(pensum.modules)
    : asArray(pensum.domains).map((domain) => ({
        ...domain,
        module_id: domain.domain_id,
        emner: asArray(domain.emne_ids)
      }));
  const emneItems = Array.isArray(emner) ? emner : asArray(emner.emner);
  const methodItems = asArray(methods.methods);
  const hooks = [];

  for (const category of asArray(fagkart.categories)) {
    for (const hook of asArray(category.topic_hooks)) {
      hooks.push({ ...hook, category_id: category.id });
    }
  }

  return {
    modules,
    emneItems,
    methodItems,
    hooks,
    moduleById: new Map(modules.map((item) => [item.module_id, item])),
    emneById: new Map(emneItems.map((item) => [item.emne_id, item])),
    methodById: new Map(methodItems.map((item) => [item.method_id, item])),
    hookById: new Map(hooks.map((item) => [item.id, item]))
  };
}

function selectedOrFallback(productionContext, key, fallback) {
  const selected = asArray(productionContext?.[key]);
  return unique(selected.length ? selected : fallback);
}

function selectCurriculum({ indexes, targetItem, brief, targetId }) {
  const claims = asArray(brief.claims);
  const targetName = targetItem?.name || targetItem?.title || targetId;
  const terms = unique([normalizeSearch(targetId), normalizeSearch(targetName)]);
  const explicitEmneIds = unique([
    ...collectIdsForKeys(targetItem, new Set(["emne_id", "emne_ids"])),
    ...collectIdsForKeys(claims, new Set(["emne_id", "emne_ids", "related_emner"])),
    ...asArray(brief.selected_curriculum?.emne_ids)
  ]).filter((id) => indexes.emneById.has(id));

  const candidateEmnes = indexes.emneItems
    .map((item) => {
      let score = explicitEmneIds.includes(item.emne_id) ? 100 : 0;
      if (objectContainsTerm(item.recommended_oslo_cases, terms)) score += 20;
      if (objectContainsTerm(item, terms)) score += 5;
      return { id: item.emne_id, title: item.title, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const selectedCurriculum = brief.selected_curriculum || {};
  const emneIds = selectedOrFallback(selectedCurriculum, "emne_ids", explicitEmneIds);
  const moduleFallback = indexes.modules
    .filter((item) => asArray(item.emner).some((id) => emneIds.includes(id)))
    .map((item) => item.module_id);
  const moduleIds = selectedOrFallback(selectedCurriculum, "module_ids", moduleFallback);

  const candidateHooks = indexes.hooks
    .map((hook) => {
      let score = asArray(hook.emne_ids).some((id) => emneIds.includes(id)) ? 10 : 0;
      if (objectContainsTerm(hook.recommended_oslo_cases, terms)) score += 20;
      if (objectContainsTerm(hook, terms)) score += 3;
      return { id: hook.id, title: hook.title, category_id: hook.category_id, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const hookFallback = candidateHooks.slice(0, 4).map((item) => item.id);
  const topicHookIds = selectedOrFallback(selectedCurriculum, "topic_hook_ids", hookFallback);
  const methodFallback = unique(topicHookIds.flatMap((hookId) => {
    return asArray(indexes.hookById.get(hookId)?.recommended_method_ids);
  })).slice(0, 4);
  const methodIds = selectedOrFallback(selectedCurriculum, "method_ids", methodFallback);

  const thinkerIds = selectedOrFallback(selectedCurriculum, "thinker_ids", []);
  const works = selectedOrFallback(selectedCurriculum, "works", []);

  return {
    considered: {
      counts: {
        pensum_modules: indexes.modules.length,
        emner: indexes.emneItems.length,
        topic_hooks: indexes.hooks.length,
        methods: indexes.methodItems.length
      },
      candidate_emner: candidateEmnes,
      candidate_topic_hooks: candidateHooks,
      note: "Alle autoritative filer er lest i sin helhet. Kandidatlistene viser treff; bare selected_curriculum er valgt for synlig bruk."
    },
    selected: {
      module_ids: moduleIds,
      emne_ids: emneIds,
      topic_hook_ids: topicHookIds,
      method_ids: methodIds,
      thinker_ids: thinkerIds,
      works
    }
  };
}

export function parseProfile(profile) {
  const match = String(profile ?? "").match(/^([a-z_]+)_(\d+)x(\d+)$/u);
  if (!match) return null;
  return {
    id: match[1],
    setCount: Number(match[2]),
    questionsPerSet: Number(match[3])
  };
}

function profileRange(profile) {
  return {
    minimum: Number(profile.sets ?? profile.sets_min),
    maximum: Number(profile.sets ?? profile.sets_max)
  };
}

function inferProfile(superset, brief) {
  const profiles = superset.adaptive_profiles || {};
  const questionsPerSet = Number(profiles.normal?.questions_per_set || profiles.narrow?.questions_per_set || 7);
  const claimCount = asArray(brief.claims).length;
  const setCount = Math.max(3, Math.ceil(claimCount / questionsPerSet));
  const candidates = Object.entries(profiles).filter(([, profile]) => {
    const range = profileRange(profile);
    return setCount >= range.minimum && setCount <= range.maximum;
  });
  const hinted = candidates.find(([profileId]) => profileId === brief.profile_hint);
  const [profileId, profile] = hinted || candidates[0] || [];
  if (!profileId || !profile) {
    throw new Error(`Ingen adaptiv profil dekker ${setCount} sett for ${claimCount} påstander`);
  }

  return {
    id: profileId,
    setCount,
    questionsPerSet: Number(profile.questions_per_set || questionsPerSet)
  };
}

function questionFamily(question) {
  if (question.topic_hook_id || question.thinker_id || question.theory_ref || question.method_id) {
    return "concept_theory";
  }
  if (question.question_type === "concept") return "concept_theory";
  if (["analysis", "context", "comparison"].includes(question.question_type)) return "context";
  return "fact";
}

export function summarizeQuestionBalance(questions) {
  const counts = { fact: 0, context: 0, concept_theory: 0 };
  for (const question of questions) counts[questionFamily(question)] += 1;
  const total = questions.length;
  const ratios = Object.fromEntries(Object.entries(counts).map(([key, count]) => {
    return [key, total ? Math.round((count / total) * 1000) / 1000 : 0];
  }));
  return { total, counts, ratios };
}

function sourceFileMetadata(record) {
  if (!record) return null;
  return {
    path: record.path,
    bytes: record.bytes,
    sha256: record.sha256
  };
}

function sourceSelectionMetadata(record, matches) {
  const selection = JSON.stringify(matches);
  return {
    path: record.path,
    matches: matches.length,
    selection_bytes: Buffer.byteLength(selection, "utf8"),
    selection_sha256: createHash("sha256").update(selection, "utf8").digest("hex")
  };
}

function manifestSelectionForTarget(manifestEntry, targetId) {
  const quizProduction = manifestEntry.quizProduction || {};
  const target = quizProduction.targets?.[targetId];
  return {
    ...manifestEntry,
    quizProduction: {
      ...quizProduction,
      targets: {
        [targetId]: target
      }
    }
  };
}

function claimBankFromBrief(brief) {
  return [...asArray(brief.claims)]
    .sort((a, b) => a.order - b.order)
    .map((claim) => ({ ...claim }));
}

function summarizeClaimBalance(claims) {
  const counts = { fact: 0, context: 0, concept_theory: 0 };
  for (const claim of claims) {
    if (!Object.hasOwn(counts, claim.family)) {
      throw new Error(`${claim.claim_id}: ukjent påstandsfamilie ${claim.family}`);
    }
    counts[claim.family] += 1;
  }
  const total = claims.length;
  const ratios = Object.fromEntries(Object.entries(counts).map(([key, count]) => {
    return [key, total ? Math.round((count / total) * 1000) / 1000 : 0];
  }));
  return { total, counts, ratios };
}

function storyUnits(relationSources, storySources) {
  const units = [];
  for (const { record, matches } of relationSources) {
    for (const item of matches) {
      units.push({
        type: "relation",
        id: item.id || null,
        source_file: record.path,
        summary: item.why || item.label || null
      });
    }
  }
  for (const { record, matches } of storySources) {
    for (const item of matches) {
      units.push({
        type: "story",
        id: item.id || null,
        source_file: record.path,
        summary: item.summary || item.title || item.text || null
      });
    }
  }
  return units;
}

export async function buildQuizProductionContext({
  root = process.cwd(),
  categoryId,
  targetId
}) {
  const loaded = await loadProductionInputs({ root, categoryId });
  const targetProduction = await loadProductionTarget({ root, loaded, targetId });
  const brief = targetProduction.brief;
  const claims = claimBankFromBrief(brief);
  const target = await resolveTargetRecord({ root, targetId });
  const relationSources = await resolveRelationSources({ root, targetId });
  const storySources = await resolveStorySources({ root, targetId });
  const indexes = curriculumIndexes(loaded.records);
  const curriculum = selectCurriculum({
    indexes,
    targetItem: target?.item || null,
    brief,
    targetId
  });
  const superset = loaded.records.supersetQuizMal.data;
  const profile = inferProfile(superset, brief);
  const phaseSequence = asArray(superset.relative_progression?.phase_sequences?.[String(profile.setCount)]);

  if (phaseSequence.length !== profile.setCount) {
    throw new Error(`${categoryId}: mangler relativ faseplan for ${profile.setCount} sett`);
  }

  const setPlan = Array.from({ length: profile.setCount }, (_, index) => {
    const plannedClaims = claims.slice(
      index * profile.questionsPerSet,
      (index + 1) * profile.questionsPerSet
    );
    for (const claim of plannedClaims) {
      if (hasText(claim.planned_phase) && claim.planned_phase !== phaseSequence[index]) {
        throw new Error(`${claim.claim_id}: planned_phase stemmer ikke med relativ progresjon`);
      }
    }
    return {
      set_id: `${categoryId}_${targetId}_set_${index + 1}`,
      order: index + 1,
      phase: phaseSequence[index],
      planned_questions: plannedClaims.length,
      questions_per_set: profile.questionsPerSet,
      claim_ids: plannedClaims.map((claim) => claim.claim_id)
    };
  });

  return {
    schema_version: "1.0",
    generator_version: "1.0",
    categoryId,
    targetId,
    profile: `${profile.id}_${profile.setCount}x${profile.questionsPerSet}`,
    manifest: {
      ...sourceSelectionMetadata(loaded.manifestRecord, [
        manifestSelectionForTarget(loaded.manifestEntry, targetId)
      ]),
      category_id: categoryId,
      target_id: targetId
    },
    resolved_files: loaded.resolvedFiles,
    required_inputs_loaded: loaded.requiredInputs,
    source_files: {
      brief: sourceFileMetadata(targetProduction.briefRecord),
      target: sourceFileMetadata(target?.record),
      target_index: target
        ? sourceSelectionMetadata(target.indexRecord, [target.indexItem])
        : null,
      relations: relationSources.map(({ record, matches }) => sourceSelectionMetadata(record, matches)),
      stories: storySources.map(({ record, matches }) => sourceSelectionMetadata(record, matches))
    },
    planned_quiz_file: targetProduction.paths.quiz_file,
    source_registry: brief.sources,
    source_review_status: brief.status || "pending",
    considered_curriculum: curriculum.considered,
    selected_curriculum: curriculum.selected,
    claim_bank: claims,
    story_units: storyUnits(relationSources, storySources),
    set_plan: setPlan,
    question_balance: summarizeClaimBalance(claims)
  };
}

export async function writeJson(root, relativePath, value) {
  const absolutePath = path.resolve(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function hookThinker(indexes, hookId, thinkerId) {
  const hook = indexes.hookById.get(hookId);
  const thinker = asArray(hook?.canon?.thinkers).find((item) => item.id === thinkerId);
  return { hook, thinker };
}

export function isCli(importMetaUrl) {
  if (!process.argv[1]) return false;
  return importMetaUrl === new URL(`file://${path.resolve(process.argv[1])}`).href;
}
