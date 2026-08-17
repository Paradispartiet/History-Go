from pathlib import Path
import json
import re

ROOT = Path('.')


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one exact anchor, found {count}')
    return text.replace(old, new, 1)


def replace_regex_once(text, pattern, replacement, label, flags=re.S):
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'{label}: expected one regex anchor, found {count}')
    return updated


# 1) Runtime cutover: keep the existing SceneCatalog/SceneDirector ownership, but
# make work-scene materialization read the committed compiled registry only.
work_path = 'js/Civication/systems/civicationWorkdayMailBuilder.js'
work = read(work_path)
work = replace_once(
    work,
    '  const SCENE_CATALOG_VERSION = 1;\n',
    '  const SCENE_CATALOG_VERSION = 1;\n  const COMPILED_REGISTRY_PATH = "data/Civication/compiledSceneRegistryV1.json";\n',
    'runtime registry path'
)
work = replace_once(
    work,
    '    const sourceAdapterTrace = [];\n',
    '    const sourceAdapterTrace = [];\n    let compiledRegistrySnapshot = null;\n    let compiledRegistryPromise = null;\n',
    'runtime registry cache'
)

registry_loader = '''    async function loadCompiledRegistry() {
      if (compiledRegistrySnapshot) return compiledRegistrySnapshot;
      if (compiledRegistryPromise) return compiledRegistryPromise;
      compiledRegistryPromise = (async () => {
        const registry = await loadJson(COMPILED_REGISTRY_PATH);
        if (!registry || registry.schema !== "compiled_scene_registry_v1" || Number(registry.version) !== 1) {
          throw new Error("Civication compiled scene registry mangler eller har ugyldig schema/version");
        }
        if (Number(registry?.stats?.shadowed_duplicate_count || 0) !== 0 || (registry.shadowed_duplicates || []).length !== 0) {
          throw new Error("Civication compiled scene registry kan ikke brukes med shadowed duplicates");
        }
        if (!Array.isArray(registry.entries) || !registry.role_index || typeof registry.role_index !== "object") {
          throw new Error("Civication compiled scene registry mangler entries/role_index");
        }
        const byId = new Map();
        for (const entry of registry.entries) {
          const id = norm(entry?.id);
          if (!id || byId.has(id)) throw new Error(`Civication compiled scene registry har duplikat/manglende id: ${id || "<tom>"}`);
          if (!entry?.compatibility_projection || typeof entry.compatibility_projection !== "object") {
            throw new Error(`Civication compiled scene registry mangler compatibility_projection for ${id}`);
          }
          byId.set(id, entry);
        }
        for (const [roleKey, ids] of Object.entries(registry.role_index)) {
          if (!Array.isArray(ids)) throw new Error(`Civication compiled scene registry har ugyldig role_index for ${roleKey}`);
          for (const id of ids) {
            if (!byId.has(norm(id))) throw new Error(`Civication compiled scene registry role_index peker på ukjent scene ${id}`);
          }
        }
        compiledRegistrySnapshot = { registry, byId };
        return compiledRegistrySnapshot;
      })();
      try {
        return await compiledRegistryPromise;
      } finally {
        compiledRegistryPromise = null;
      }
    }
'''
work = replace_once(work, '    function normalizeChoices(choices) {\n', registry_loader + '    function normalizeChoices(choices) {\n', 'runtime registry loader')

new_get_role_mails = '''    async function getRoleMails(active, state = getState(), options = {}) {
      const category = norm(active?.career_id);
      const roleScope = resolveRoleScope(active);
      if (!category || !roleScope) return [];
      const compiled = await loadCompiledRegistry();
      const roleKey = `${category}/${roleScope}`;
      const ids = Array.isArray(compiled.registry.role_index?.[roleKey])
        ? compiled.registry.role_index[roleKey]
        : [];
      const flattened = ids.map((id) => {
        const entry = compiled.byId.get(norm(id));
        if (!entry) throw new Error(`Civication compiled scene registry mangler ${id} for ${roleKey}`);
        const projection = entry.compatibility_projection || {};
        return decorateSceneInteraction({
          ...projection,
          id: norm(projection.id || entry.id),
          category: norm(projection.category || entry.category),
          role_scope: norm(projection.role_scope || entry.role_scope),
          mail_type: norm(projection.mail_type || entry.mail_type || "job"),
          mail_family: norm(projection.mail_family),
          choices: normalizeChoices(projection.choices),
          situation: Array.isArray(projection.situation)
            ? projection.situation.map(norm).filter(Boolean)
            : [norm(projection.summary)].filter(Boolean),
          scene_catalog_source_path: norm(entry.source_path || projection.scene_catalog_source_path),
          scene_catalog_version: SCENE_CATALOG_VERSION
        });
      });
      const mails = (await decorateMails(flattened)).map(decorateSceneInteraction);
      catalogTrace.push({
        at: new Date().toISOString(),
        consumer: norm(options.consumer || "scene_director") || "scene_director",
        career_id: category,
        role_scope: roleScope,
        registry_path: COMPILED_REGISTRY_PATH,
        registry_hash: norm(compiled.registry.registry_hash),
        path_count: 1,
        catalog_count: 1,
        mail_count: mails.length
      });
      if (catalogTrace.length > CATALOG_TRACE_LIMIT) {
        catalogTrace.splice(0, catalogTrace.length - CATALOG_TRACE_LIMIT);
      }
      return mails;
    }
    async function getRolePlan'''
work = replace_regex_once(
    work,
    r'    async function getRoleMails\(active, state = getState\(\), options = \{\}\) \{.*?\n    \}\n    async function getRolePlan',
    new_get_role_mails,
    'runtime getRoleMails'
)

new_prewarm_inspect = '''    async function prewarm(active, options = {}) {
      if (!active) return { warmed: false, reason: "no_active_role" };
      const planPath = getPlanPath(active);
      const [compiled] = await Promise.all([
        loadCompiledRegistry(),
        planPath ? loadJson(planPath) : Promise.resolve(null)
      ]);
      return {
        warmed: true,
        owner: "CivicationSceneCatalog",
        role_scope: resolveRoleScope(active),
        family_path_count: 0,
        registry_path: COMPILED_REGISTRY_PATH,
        registry_hash: norm(compiled.registry.registry_hash),
        consumer: norm(options.consumer || "daily_prewarm") || "daily_prewarm"
      };
    }
    function inspect() {
      return {
        version: SCENE_CATALOG_VERSION,
        owner: "CivicationSceneCatalog",
        source_format: "compiled_scene_registry_v1",
        compiled_registry_ready: true,
        compiled_registry_path: COMPILED_REGISTRY_PATH,
        compiled_registry_loaded: !!compiledRegistrySnapshot,
        compiled_registry_hash: norm(compiledRegistrySnapshot?.registry?.registry_hash),
        cache_size: jsonCache.size,
        inflight_count: jsonInflight.size,
        source_adapters: listSourceAdapters(),
        source_adapter_trace: sourceAdapterTrace.slice(),
        catalog_trace: catalogTrace.slice()
      };
    }
'''
work = replace_regex_once(
    work,
    r'    async function prewarm\(active, options = \{\}\) \{.*?\n    \}\n    function inspect\(\) \{.*?\n    \}\n',
    new_prewarm_inspect,
    'runtime prewarm/inspect'
)
write(work_path, work)

# 2) 4H-A compiler test becomes the permanent zero-shadowed-debt contract.
test_path = 'tests/civication-compiled-scene-registry.test.js'
test = read(test_path)
test = replace_once(
    test,
    'const keptDuplicateSource = `data/Civication/mailFamilies/naeringsliv/job/${duplicateRoleScope}_job.json`;\nconst shadowedDuplicateSource = `data/Civication/mailFamilies/naeringsliv/faction_choice/${duplicateRoleScope}_faction_choice.json`;\n',
    '',
    'compiler duplicate constants'
)
test = replace_regex_once(
    test,
    r'  // To canonicale runtime-paths har i dagens datatre samme scene-ID.*?  assert\.match\(duplicateDebt\.routing_signature, /\^\[a-f0-9\]\{64\}\$/\);\n',
    '  // 4H-B fjerner den eneste runtime-reachable skyggekopien uten å endre vinnerscenen.\n  assert.equal(first.stats.shadowed_duplicate_count, 0, "4H-B krever null shadowed duplicate-gjeld");\n  assert.deepEqual(first.shadowed_duplicates, []);\n  assert.equal(first.entries.filter((entry) => entry.id === duplicateSceneId).length, 1);\n',
    'compiler duplicate debt block'
)
test = test.replace('"4G-adapterne skal beskrives som runtime-materialiserte under 4H-A"', '"4G-adapterne skal fortsatt være runtime-materialiserte etter 4H-B"')
write(test_path, test)

# 3) Existing Daily catalog regression becomes an explicit anti-raw-read runtime test.
daily_test_path = 'tests/civication-scene-director-daily-catalog.test.js'
daily = read(daily_test_path)
fixture_registry = '''
const COMPILED_REGISTRY_PATH = "data/Civication/compiledSceneRegistryV1.json";
const fixtureEntries = Object.entries(catalogs)
  .filter(([sourcePath]) => sourcePath.includes("/mailFamilies/"))
  .flatMap(([sourcePath, value]) => (value.families || []).flatMap((family) => (family.mails || []).map((sourceMail) => ({
    id: sourceMail.id,
    category: value.category,
    role_scope: value.role_scope,
    mail_type: sourceMail.mail_type || value.mail_type || "job",
    source_path: sourcePath,
    compatibility_projection: {
      ...sourceMail,
      id: sourceMail.id,
      category: value.category,
      role_scope: sourceMail.role_scope || value.role_scope,
      mail_type: sourceMail.mail_type || value.mail_type || "job",
      mail_family: sourceMail.mail_family || family.id,
      choices: (sourceMail.choices || []).map((choice) => ({
        ...choice,
        id: String(choice.id || "").trim(),
        label: String(choice.label || choice.text || choice.id || "").trim(),
        effect: Number(choice.effect || 0),
        tags: Array.isArray(choice.tags) ? choice.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
        feedback: String(choice.feedback || "").trim()
      })),
      situation: Array.isArray(sourceMail.situation) ? sourceMail.situation : [sourceMail.summary].filter(Boolean),
      scene_catalog_source_path: sourcePath,
      scene_catalog_version: 1
    }
  }))));
catalogs[COMPILED_REGISTRY_PATH] = {
  schema: "compiled_scene_registry_v1",
  version: 1,
  registry_hash: "fixture_registry_hash",
  stats: { shadowed_duplicate_count: 0 },
  shadowed_duplicates: [],
  entries: fixtureEntries,
  role_index: { "fixture/fixture_role": fixtureEntries.map((entry) => entry.id) }
};
'''
daily = replace_once(
    daily,
    'const underlyingCalls = [];\n',
    fixture_registry + '\nconst underlyingCalls = [];\n',
    'daily compiled fixture'
)
daily = replace_once(
    daily,
    '''  assert.equal(
    underlyingCalls.filter((sourcePath) => sourcePath === microPath).length,
    1,
    "Katalogfilen skal lastes én gang av SceneCatalog, ikke av Daily"
  );
''',
    '''  assert.equal(
    underlyingCalls.filter((sourcePath) => sourcePath === microPath).length,
    0,
    "Etter 4H-B skal normal runtime aldri lese rå mailFamilies"
  );
  assert.equal(
    underlyingCalls.filter((sourcePath) => sourcePath === COMPILED_REGISTRY_PATH).length,
    1,
    "SceneCatalog skal lese det materialiserte registryet én gang"
  );
''',
    'daily raw read assertion'
)
daily = replace_once(
    daily,
    '  assert.equal(inspection.scene_catalog.owner, "CivicationSceneCatalog");\n',
    '  assert.equal(inspection.scene_catalog.owner, "CivicationSceneCatalog");\n  assert.equal(inspection.scene_catalog.source_format, "compiled_scene_registry_v1");\n  assert.equal(inspection.scene_catalog.compiled_registry_ready, true);\n',
    'daily inspect assertion'
)
write(daily_test_path, daily)

# 4) Full before/after parity test, including representative real workdays.
parity_path = ROOT / 'tests/civication-compiled-scene-registry-parity.test.js'
parity_path.write_text(r'''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const registryPath = path.join(repoRoot, "data/Civication/compiledSceneRegistryV1.json");
const compilerPath = path.join(repoRoot, "scripts/build-civication-scene-registry.mjs");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const bridgePath = path.join(repoRoot, "js/Civication/systems/civicationCareerKnowledgeBridge.js");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const bridgeSource = fs.readFileSync(bridgePath, "utf8");

function norm(value) { return String(value == null ? "" : value).trim(); }
function slugify(value) {
  return norm(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function readJson(relativePath) { return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8")); }
function normalizeChoices(choices) {
  return (Array.isArray(choices) ? choices : []).filter(Boolean).map((choice, index) => ({
    ...choice,
    id: norm(choice?.id) || String.fromCharCode(65 + index),
    label: norm(choice?.label || choice?.text || choice?.id),
    effect: Number(choice?.effect || 0),
    tags: Array.isArray(choice?.tags) ? choice.tags.map(norm).filter(Boolean) : [],
    feedback: norm(choice?.feedback)
  })).filter((choice) => choice.id && choice.label);
}
function flattenCatalog(catalog, sourcePath) {
  const out = [];
  const catalogType = norm(catalog?.mail_type);
  for (const family of (Array.isArray(catalog?.families) ? catalog.families : [])) {
    const familyId = norm(family?.id);
    for (const mail of (Array.isArray(family?.mails) ? family.mails : [])) {
      const id = norm(mail?.id);
      if (!id) continue;
      out.push({
        ...mail,
        id,
        category: norm(catalog?.category),
        role_scope: norm(mail?.role_scope || catalog?.role_scope),
        mail_type: norm(mail?.mail_type || catalogType || "job"),
        mail_family: norm(mail?.mail_family || familyId),
        choices: normalizeChoices(mail?.choices),
        situation: Array.isArray(mail?.situation) ? mail.situation.map(norm).filter(Boolean) : [norm(mail?.summary)].filter(Boolean),
        scene_catalog_source_path: norm(sourcePath),
        scene_catalog_version: 1
      });
    }
  }
  return out;
}
function threadKeyForMail(mail) {
  const explicit = norm(mail?.thread_key || mail?.threadKey);
  if (explicit) return explicit;
  const scope = slugify(mail?.role_scope) || "role";
  const arc = slugify(mail?.narrative_arc);
  if (arc && new Set(["micro", "followup", "knowledge", "consequence"]).has(norm(mail?.mail_type))) return `${scope}.case.${arc}`;
  const id = slugify(mail?.source_mail_id || mail?.id);
  return id ? `${scope}.mail.${id}` : "";
}
const PHASE_RANK = { morning:0, intro:0, forenoon:1, early:1, workday:2, mid:2, lunch:3, stable:3, afternoon:4, dinner:5, evening:6, late:6, day_end:7, advanced:8, mastery:9 };
function preferRepresentative(a, b) {
  if (!b) return true;
  const ca = a?.thread_canonical === true ? 1 : 0, cb = b?.thread_canonical === true ? 1 : 0;
  if (ca !== cb) return ca > cb;
  const ra = PHASE_RANK[norm(a?.phase)] ?? 10, rb = PHASE_RANK[norm(b?.phase)] ?? 10;
  if (ra !== rb) return ra < rb;
  const pa = Number(a?.priority || 0), pb = Number(b?.priority || 0);
  if (pa !== pb) return pa > pb;
  return norm(a?.id) < norm(b?.id);
}
function collapseThreads(pool) {
  const rest = [], byThread = new Map();
  for (const mail of pool) {
    const key = threadKeyForMail(mail);
    const stamped = norm(mail?.thread_key) ? mail : { ...mail, thread_key: key };
    if (!key.includes(".case.")) { rest.push(stamped); continue; }
    if (preferRepresentative(stamped, byThread.get(key))) byThread.set(key, stamped);
  }
  return [...rest, ...byThread.values()];
}
function hashString(input) {
  let h = 2166136261;
  for (const ch of String(input || "")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seededScore(seed, mail) { return Number(mail?.priority || 1) * 100000 + hashString(`${seed}:${mail?.id || ""}`); }
function deterministicPick(pool, seed) {
  return [...pool].sort((a, b) => seededScore(seed, b) - seededScore(seed, a))[0]?.id || null;
}

function createBridge() {
  const windowObject = {
    DEBUG: false,
    localStorage: { getItem: () => null },
    CivicationJsonStore: {
      fetchJson: async (relativePath) => {
        const full = path.join(repoRoot, relativePath);
        if (!fs.existsSync(full)) return null;
        return readJson(relativePath);
      }
    }
  };
  windowObject.window = windowObject;
  const context = vm.createContext({ window: windowObject, globalThis: windowObject, console, Promise, Map, Set, Object, Array, String, Number, JSON });
  vm.runInContext(bridgeSource, context, { filename: bridgePath });
  return windowObject.CivicationCareerKnowledgeBridge;
}

function makeGenerated(id) {
  return { id, source_type: "daily_generated", mail_type: "phase", choices: [{ id:"A", label:"A" }, { id:"B", label:"B" }] };
}
function makeBaseRuntime(date) {
  const slots = [
    ["forenoon", "operational_mail"], ["forenoon", "people_ping"], ["forenoon", "small_choice"],
    ["workday", "main_delivery"], ["workday", "conflict_or_event"], ["workday", "analysis_followup"], ["workday", "operational_batch"]
  ];
  return {
    version: 1, date, items: slots.map(([phase, slot], i) => ({ status:"queued", phase, slot, event: makeGenerated(`generated_${i}`) })),
    delivered_ids: [], answered_ids: [], current_index: 0, runtime_instance_key: ""
  };
}
function makeRuntimeContext({ roleKey, legacyMails, registry, mode, terminal = false }) {
  const [category, roleScope] = roleKey.split("/");
  const active = { career_id: category, role_scope: roleScope, role_id: roleScope, role_key: roleScope, brand_id: "parity_employer" };
  let state = {};
  const sourceSelector = async () => {
    const rows = [];
    if (terminal) rows.__career_outcome_terminal_closed = true;
    return rows;
  };
  function MockEventEngine() {}
  MockEventEngine.prototype.buildMailPool = async function () { return { role:"legacy", mails:[{ id:"legacy_fallback" }], tag_rules:{}, tracks:[] }; };
  const store = {
    fetchJson: async (relativePath) => {
      if (relativePath === "data/Civication/compiledSceneRegistryV1.json") return clone(registry);
      const full = path.join(repoRoot, relativePath);
      return fs.existsSync(full) ? readJson(relativePath) : null;
    }
  };
  const windowObject = {
    DEBUG: false,
    CivicationState: { getState: () => state, setState: (patch) => (state = { ...state, ...patch }), getActivePosition: () => active },
    CivicationCareerRoleResolver: { resolveCareerRoleScope: () => roleScope },
    CivicationWorkdayRuntime: { getEmployerId: () => "parity_employer", getWorkdayDayIndex: () => 3 },
    CivicationMailRuntime: { makeCandidateMailsForActiveRole: sourceSelector },
    CivicationEventEngine: MockEventEngine,
    CivicationJsonStore: store,
    CivicationCareerKnowledgeBridge: { decorateMail: async (mail) => mail }
  };
  if (mode === "legacy") {
    windowObject.CivicationSceneCatalog = {
      version: 1,
      normalizeChoices,
      getRoleMails: async () => clone(legacyMails),
      getRolePlan: async () => readJson(`data/Civication/mailPlans/${category}/${roleScope}_plan.json`),
      inspect: () => ({ owner:"CivicationSceneCatalog", source_format:"legacy_mail_families_adapter", compiled_registry_ready:false })
    };
  }
  windowObject.window = windowObject;
  const context = vm.createContext({ window: windowObject, console, Date, Array, Object, String, Number, Promise, Set, Map, Math });
  vm.runInContext(workdaySource, context, { filename: workdayPath });
  return { windowObject, active };
}
function workdayProjection(runtime) {
  return {
    source_ids: clone(runtime.daily_extra_source_ids || []),
    rows: (runtime.items || []).filter((row) => row?.event?.source_type === "daily_extra").map((row) => ({
      phase: row.phase, slot: row.slot, source_mail_id: row.event.source_mail_id, mail_type: row.event.mail_type,
      mail_family: row.event.mail_family, thread_key: row.event.thread_key, choices: clone(row.event.choices)
    }))
  };
}

(async () => {
  const compiler = await import(pathToFileURL(compilerPath).href);
  const materialized = readJson("data/Civication/compiledSceneRegistryV1.json");
  const rebuilt = await compiler.compileRegistryFromRepo(repoRoot);
  assert.deepEqual(materialized, rebuilt, "materialized registry skal være byte-semantisk synkron med source-of-build");
  assert.equal(materialized.stats.shadowed_duplicate_count, 0);
  assert.deepEqual(materialized.shadowed_duplicates, []);

  const roleSources = new Map();
  for (const sourcePath of materialized.compiled_source_files) {
    const catalog = readJson(sourcePath);
    const rank = compiler.runtimeSourceRank(sourcePath, catalog);
    assert.notEqual(rank, null, `${sourcePath} skal være legacy-runtime-reachable i parity-baselinen`);
    const roleKey = `${norm(catalog.category)}/${norm(catalog.role_scope)}`;
    if (!roleSources.has(roleKey)) roleSources.set(roleKey, []);
    roleSources.get(roleKey).push({ sourcePath, catalog, rank });
  }
  const legacyByRole = new Map();
  for (const [roleKey, sources] of roleSources) {
    sources.sort((a, b) => a.rank - b.rank || a.sourcePath.localeCompare(b.sourcePath));
    legacyByRole.set(roleKey, sources.flatMap(({ sourcePath, catalog }) => flattenCatalog(catalog, sourcePath)));
  }

  assert.deepEqual([...legacyByRole.keys()].sort(), Object.keys(materialized.role_index).sort(), "samme rollepakker før/etter");
  const eligibilityFields = ["requires", "forbids", "required_flags", "forbidden_flags", "phase", "stage", "priority", "cooldown", "repeatable", "thread_key", "threadKey", "narrative_arc", "thread_canonical"];
  for (const roleKey of Object.keys(materialized.role_index).sort()) {
    const legacy = legacyByRole.get(roleKey) || [];
    const compiled = materialized.role_index[roleKey].map((id) => {
      const entry = materialized.entries.find((candidate) => candidate.id === id);
      assert(entry, `${roleKey}: registry-id ${id} mangler entry`);
      return entry.compatibility_projection;
    });
    assert.deepEqual(compiled, legacy, `${roleKey}: full runtime-projeksjon skal være identisk`);
    assert.deepEqual(compiled.map((m) => m.id), legacy.map((m) => m.id), `${roleKey}: samme scene-ID-er og rekkefølge`);
    for (let i = 0; i < legacy.length; i += 1) {
      const before = legacy[i], after = compiled[i];
      assert.equal(after.mail_type, before.mail_type);
      assert.equal(after.mail_family, before.mail_family);
      assert.equal(after.scene_catalog_source_path, before.scene_catalog_source_path);
      assert.deepEqual(after.choices, before.choices, `${after.id}: choices/tags/effect/feedback/reply skal være identiske`);
      for (const field of eligibilityFields) assert.deepEqual(after[field], before[field], `${after.id}: ${field} skal være identisk`);
    }
    assert.deepEqual(collapseThreads(compiled).map((m) => [m.id, m.thread_key]), collapseThreads(legacy).map((m) => [m.id, m.thread_key]), `${roleKey}: thread/dedupe-paritet`);
    for (const seed of ["parity:1", "parity:2", `parity:${roleKey}`]) {
      assert.equal(deterministicPick(compiled, seed), deterministicPick(legacy, seed), `${roleKey}: deterministic selection ${seed}`);
    }
  }

  const bridge = createBridge();
  let bridgeChecks = 0;
  for (const roleKey of Object.keys(materialized.role_index).sort()) {
    const legacy = legacyByRole.get(roleKey) || [];
    const compiled = materialized.role_index[roleKey].map((id) => materialized.entries.find((entry) => entry.id === id).compatibility_projection);
    for (let i = 0; i < legacy.length; i += 1) {
      if (!Array.isArray(legacy[i].knowledge_refs) || legacy[i].knowledge_refs.length === 0) continue;
      const before = clone(await bridge.decorateMail(clone(legacy[i])));
      const after = clone(await bridge.decorateMail(clone(compiled[i])));
      assert.deepEqual(after, before, `${compiled[i].id}: Career Knowledge Bridge-dekorering skal være identisk`);
      bridgeChecks += 1;
    }
  }
  assert(bridgeChecks > 0, "parity-porten skal faktisk treffe Career Knowledge Bridge-dekorerte scener");

  for (const roleKey of ["offentlig/renholder", "by/arealplanlegger_plan"]) {
    assert(legacyByRole.has(roleKey), `${roleKey} må finnes som representativ 4H-B-rolle`);
    const legacyRuntime = makeRuntimeContext({ roleKey, legacyMails: legacyByRole.get(roleKey), registry: materialized, mode:"legacy" });
    const compiledRuntime = makeRuntimeContext({ roleKey, legacyMails: legacyByRole.get(roleKey), registry: materialized, mode:"compiled" });
    const before = await legacyRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(legacyRuntime.active, {}, makeBaseRuntime("2026-08-17"));
    const after = await compiledRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(compiledRuntime.active, {}, makeBaseRuntime("2026-08-17"));
    assert.deepEqual(workdayProjection(after), workdayProjection(before), `${roleKey}: representativ arbeidsdag skal være identisk før/etter`);
  }

  const terminalRuntime = makeRuntimeContext({ roleKey:"offentlig/renholder", legacyMails: legacyByRole.get("offentlig/renholder"), registry: materialized, mode:"compiled", terminal:true });
  const terminalDay = await terminalRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(
    terminalRuntime.active, {}, makeBaseRuntime("2026-08-18"), { selection_snapshot: { terminal_closed:true } }
  );
  assert.equal(terminalDay.daily_extra_terminal_closed, true);
  assert.equal(terminalDay.daily_extra_catalog_count, 0);
  assert.equal(workdayProjection(terminalDay).rows.length, 0, "terminal karriere skal ikke åpne arbeidsfallback");
  const terminalPack = await new terminalRuntime.windowObject.CivicationEventEngine().buildMailPool(terminalRuntime.active, {}, "renholder");
  assert.equal(terminalPack.__legacy_fallback, false, "terminal karriere skal ikke åpne EventEngine legacy-fallback");
  assert.equal(terminalPack.__terminal_closed, true);

  const roleMailBlock = workdaySource.slice(workdaySource.indexOf("async function getRoleMails"), workdaySource.indexOf("async function getRolePlan"));
  assert(roleMailBlock.includes("loadCompiledRegistry()"), "getRoleMails må eie compiled-registry-lesingen");
  assert(!roleMailBlock.includes("getFamilyPaths(active)"), "getRoleMails kan ikke gå tilbake til rå family paths");
  assert(!roleMailBlock.includes("flattenCatalog("), "getRoleMails kan ikke flattene rå mailFamilies etter cutover");
  const prewarmBlock = workdaySource.slice(workdaySource.indexOf("async function prewarm"), workdaySource.indexOf("function inspect()"));
  assert(prewarmBlock.includes("loadCompiledRegistry()"));
  assert(!prewarmBlock.includes("paths.map"), "prewarm kan ikke reaktivere rå mailFamilies");
  assert(workdaySource.includes('source_format: "compiled_scene_registry_v1"'));
  assert(workdaySource.includes("compiled_registry_ready: true"));

  console.log(`civication-compiled-scene-registry-parity.test.js: PASS (${materialized.stats.scene_count} scener / ${materialized.stats.role_count} roller / ${bridgeChecks} bridge-scener)`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
''', encoding='utf-8')

# 5) Permanent CI sync gate.
ci_path = '.github/workflows/civication.yml'
ci = read(ci_path)
ci = replace_once(
    ci,
    '      - name: Run Civication tests\n        run: node tests/run-civication-tests.mjs\n',
    '      - name: Verify compiled scene registry is synchronized\n        run: node scripts/build-civication-scene-registry.mjs --check\n      - name: Run Civication tests\n        run: node tests/run-civication-tests.mjs\n',
    'Civication CI registry check'
)
write(ci_path, ci)

# 6) Machine-readable policy flips only after parity/cutover implementation exists.
policy_path = ROOT / 'data/Civication/scenePipelinePolicyV1.json'
policy = json.loads(policy_path.read_text(encoding='utf-8'))
contract = policy['compiled_scene_registry_contract']
contract['status'] = 'materialized_runtime_cutover_complete'
contract['runtime_reads_registry'] = True
contract['sync_gate'] = 'node scripts/build-civication-scene-registry.mjs --check'
contract['parity_test'] = 'tests/civication-compiled-scene-registry-parity.test.js'
contract['completed_phase'] = '4H-B'
contract['next_phase'] = '4H-C'
policy_path.write_text(json.dumps(policy, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# 7) Normative documentation: 4H-B complete, 4H-C next.
doc_path = 'data/Civication/COMPILED_SCENE_REGISTRY_V1.md'
doc = read(doc_path)
doc = replace_regex_once(
    doc,
    r'## Status\n\n4H-A etablerer kontrakten.*?compiled_registry_ready` skal derfor fortsatt være `false` i produksjonsruntime etter 4H-A\.\n',
    '''## Status

4H-A etablerte kontrakten og den deterministiske compileren for `compiled_scene_registry_v1`. **4H-B er nå runtime-cutoveren:** det materialiserte `data/Civication/compiledSceneRegistryV1.json` er den statiske work-scene-kilden som `CivicationSceneCatalog` leser i runtime.

`mailFamilies` er fortsatt source-of-build i denne fasen, men kan ikke leses direkte av normal work-runtime. `node scripts/build-civication-scene-registry.mjs --check` er permanent sync-gate, parity-testen låser før/etter-semantikken, og `compiled_registry_ready` er `true` først etter at shadowed duplicate-gjelden er null.
''',
    'compiled registry status'
)
doc = replace_regex_once(
    doc,
    r'## 4H-B — neste port\n.*?(?=## 4H-C — fjern parallelle legacyveier)',
    '''## 4H-B — fullført runtime-cutover

4H-B materialiserer og committer registryet, håndhever `--check`, og gjør `CivicationSceneCatalog` til runtime-leser av registryet for work-scenes. Den ene runtime-reachable skyggekopien av `ml_faction_001` er fjernet; den eksisterende vinnerscenen i `naeringsliv/job/mellomleder_job.json` er uendret. `shadowed_duplicate_count` er derfor null før cutover.

Den permanente parity-porten beviser hele runtime-projeksjonen før/etter, inkludert scene-ID-er per rolle, mailtype/familie/source-path, choices/tags/effect/feedback/reply, priority/cooldown/repeatable/phase/stage og øvrige eligibility-felt, thread/dedupe, Career Knowledge Bridge, kandidatsett og deterministisk utvalg. Renholder og Arealplanlegger brukes som representative arbeidsdager. Terminal karriere forblir lukket.

`private`, `life`, `narrative` og `social` forblir runtime-materialiserte source adapters bak samme SceneCatalog. De flates ikke inn i det statiske registryet.

''',
    'compiled registry 4HB section'
)
write(doc_path, doc)

pipeline_path = 'data/Civication/SCENE_PIPELINE_V1.md'
pipeline = read(pipeline_path)
pipeline = pipeline.replace(
    'Dette er en kildeadapter mot legacy `mailFamilies`, ikke sluttens `compiled_scene_registry_v1`. Registry-cutoveren kommer senere uten at Daily igjen får katalogeierskap.',
    '`CivicationSceneCatalog` leser nå det materialiserte `compiled_scene_registry_v1` for work-scenes. `mailFamilies` er source-of-build med permanent `--check`-gate, men normal runtime går ikke tilbake til rå kataloglesing. `private`, `life`, `narrative` og `social` forblir runtime-materialiserte source adapters.'
)
pipeline = pipeline.replace(
    '2. SceneCatalog leser fortsatt registrerte kildekataloger. Ett kompilert scene-register er måltilstanden nå som `private`, `life`, `narrative` og `social` er samlet bak registrerte kildeadaptre.',
    '2. 4H-C skal fjerne/blokkere parallelle legacyveier, særlig `data/Civication/jobbmails`, slik at arkiv/migreringsdata aldri kan fungere som gameplaykilde eller fallback.'
)
pipeline = pipeline.replace(
    '8. **Neste:** La runtime lese ett kompilert scene-register; fjern parallelle kildeveier og gamle `jobbmails`.\n9. Slå på blokkerende semantisk spilltest: plansteg → scene → valg/oppgave/info → konsekvens → progresjon → neste steg.',
    '8. **Fullført 4H-A–4H-B:** Materialiser `compiled_scene_registry_v1`, bevis før/etter-paritet og la SceneCatalog lese registryet for work-scenes.\n   - **Neste 4H-C:** fjern/blokker parallelle legacyveier og gamle `jobbmails` som gameplay/fallback.\n9. **Deretter 4H-D:** slå på blokkerende semantisk spilltest: plansteg → scene → valg/oppgave/info → konsekvens → progresjon → neste steg.'
)
write(pipeline_path, pipeline)

print('Applied Civication 4H-B source/runtime/test/docs patch set')
