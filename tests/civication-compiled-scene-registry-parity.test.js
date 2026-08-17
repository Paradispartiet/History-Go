const assert = require("node:assert/strict");
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
  return (Array.isArray(choices) ? choices : []).filter(Boolean).map((choice) => ({
    ...choice,
    id: norm(choice?.id),
    label: norm(choice?.label),
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
      const projection = entry.compatibility_projection || {};
      return {
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
        scene_catalog_version: 1
      };
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

  for (const roleKey of ["naeringsliv/administrasjonsmedarbeider", "by/by_radgiver_plan"]) {
    assert(legacyByRole.has(roleKey), `${roleKey} må finnes som representativ 4H-B-rolle`);
    const legacyRuntime = makeRuntimeContext({ roleKey, legacyMails: legacyByRole.get(roleKey), registry: materialized, mode:"legacy" });
    const compiledRuntime = makeRuntimeContext({ roleKey, legacyMails: legacyByRole.get(roleKey), registry: materialized, mode:"compiled" });
    const before = await legacyRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(legacyRuntime.active, {}, makeBaseRuntime("2026-08-17"));
    const after = await compiledRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(compiledRuntime.active, {}, makeBaseRuntime("2026-08-17"));
    assert.deepEqual(workdayProjection(after), workdayProjection(before), `${roleKey}: representativ arbeidsdag skal være identisk før/etter`);
  }

  const terminalRuntime = makeRuntimeContext({ roleKey:"naeringsliv/administrasjonsmedarbeider", legacyMails: legacyByRole.get("naeringsliv/administrasjonsmedarbeider"), registry: materialized, mode:"compiled", terminal:true });
  const terminalCandidates = await terminalRuntime.windowObject.CivicationSceneDirector.getWorkCandidates(terminalRuntime.active, {});
  assert.equal(terminalCandidates.__career_outcome_terminal_closed, true, "terminal source selection skal eie terminal snapshot");
  const terminalDay = await terminalRuntime.windowObject.CivicationSceneDirector.populateDailyExtraSlots(
    terminalRuntime.active, {}, makeBaseRuntime("2026-08-18")
  );
  assert.equal(terminalDay.daily_extra_terminal_closed, true);
  assert.equal(terminalDay.daily_extra_catalog_count, 0);
  assert.equal(workdayProjection(terminalDay).rows.length, 0, "terminal karriere skal ikke åpne arbeidsfallback");
  const terminalPack = await new terminalRuntime.windowObject.CivicationEventEngine().buildMailPool(terminalRuntime.active, {}, "administrasjonsmedarbeider");
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
