// CivicationWorkdayMailBuilder + SceneDirector/SceneCatalog migration adapter.
// 4C moves Daily extra-slot catalog loading, normalization and selection behind
// CivicationSceneDirector/CivicationSceneCatalog without changing the day rhythm.
(function () {
  "use strict";
  const WORK_PHASES = ["forenoon", "workday"];
  const WORK_PHASE_SET = new Set(WORK_PHASES);
  const WORK_MAIL_CLASS = "daily_workday";
  const SCENE_DIRECTOR_VERSION = 1;
  const SCENE_CATALOG_VERSION = 1;
  const COMPILED_REGISTRY_PATH = "data/Civication/compiledSceneRegistryV1.json";
  const SELECTION_TRACE_LIMIT = 80;
  const CATALOG_TRACE_LIMIT = 80;
  const SCENE_SOURCE_ADAPTER_QUEUE_KEY = "__civicationSceneSourceAdapterQueue";
  const EVENT_ENGINE_PATCH_FLAG = "__civicationSceneDirectorBuildMailPoolPatched";
  const DAILY_BUILDER_PATCH_FLAG = "__civicationSceneDirectorCatalogPatched";
  const DAILY_RUNTIME_MARKER = "__scene_director_daily_extras";
  const DAY_RUNTIME_KEY = "mail_day_runtime_v1";
  const EXTRA_MAIL_TYPES = [
    "people",
    "story",
    "conflict",
    "event",
    "faction_choice",
    "micro",
    "followup",
    "knowledge",
    "consequence"
  ];
  const CASE_THREAD_TYPES = new Set(["micro", "followup", "knowledge", "consequence"]);
  const REPRESENTATIVE_PHASE_RANK = {
    morning: 0,
    intro: 0,
    forenoon: 1,
    early: 1,
    workday: 2,
    mid: 2,
    lunch: 3,
    stable: 3,
    afternoon: 4,
    dinner: 5,
    evening: 6,
    late: 6,
    day_end: 7,
    advanced: 8,
    mastery: 9
  };
  const REPRESENTATIVE_PHASE_RANK_DEFAULT = 10;
  const WORK_PHASE_LABELS = {
    forenoon: "Formiddag",
    workday: "Arbeidsdag"
  };
  function norm(value) {
    return String(value == null ? "" : value).trim();
  }
  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }
  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
  }
  function getSceneInteraction() {
    return window.CivicationSceneInteraction || null;
  }
  function decorateSceneInteraction(scene) {
    const interaction = getSceneInteraction();
    return typeof interaction?.decorate === "function" ? interaction.decorate(scene) : scene;
  }
  function isActionableSceneCandidate(scene) {
    const interaction = getSceneInteraction();
    return typeof interaction?.isActionable === "function" ? interaction.isActionable(scene) : true;
  }
  function filterActionableSceneCandidates(candidates) {
    const interaction = getSceneInteraction();
    if (typeof interaction?.filterActionable !== "function") return Array.isArray(candidates) ? candidates : [];
    return interaction.filterActionable(candidates);
  }
  function filterAndRankWorkRhythm(candidates, state, options = {}) {
    const helper = window.CivicationWorkRhythm;
    if (typeof helper?.evaluateCandidates !== "function") return Array.isArray(candidates) ? candidates : [];
    return helper.evaluateCandidates(candidates, state, {
      day_index: getWorkdayDayIndex() || 1,
      phase: options.phase
    });
  }
  function isWorkPhase(phaseId) {
    return WORK_PHASE_SET.has(norm(phaseId));
  }
  function phaseLabel(phaseId) {
    return WORK_PHASE_LABELS[norm(phaseId)] || norm(phaseId) || "Arbeidsdag";
  }
  function getState() {
    return window.CivicationState?.getState?.() || {};
  }
  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }
  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }
  function resolveRoleScope(active) {
    const pos = active || getActive();
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(pos));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return norm(pos?.role_scope || pos?.role_key || pos?.role_id);
  }
  function getEmployerId(active) {
    const pos = active || getActive();
    const wr = window.CivicationWorkdayRuntime;
    if (wr?.getEmployerId) {
      const id = norm(wr.getEmployerId(pos));
      if (id) return id;
    }
    return norm(pos?.brand_id || pos?.employer_id);
  }
  function getWorkdayDayIndex() {
    return Number(window.CivicationWorkdayRuntime?.getWorkdayDayIndex?.() || 0);
  }
  function normalizeWorkdayChoices(choices) {
    if (!Array.isArray(choices)) return [];
    return choices
      .map((choice, index) => ({
        ...choice,
        id: norm(choice?.id) || String.fromCharCode(65 + index),
        label: norm(choice?.label || choice?.text || choice?.id)
      }))
      .filter((choice) => choice.id && choice.label);
  }
  function clampWorkPhase(phaseId) {
    const phase = norm(phaseId);
    return isWorkPhase(phase) ? phase : "workday";
  }
  function stampWorkdayFields(event, phaseId, active, options = {}) {
    const phase = clampWorkPhase(phaseId);
    const roleScope = resolveRoleScope(active);
    const employerId = getEmployerId(active);
    const pos = active || getActive();
    return {
      ...event,
      source_type: norm(event?.source_type) || (options.planned ? "planned" : "daily_extra"),
      mail_class: WORK_MAIL_CLASS,
      channel: "job",
      messageChannel: "job",
      workday_related: true,
      phase_tag: phase,
      role_scope: roleScope,
      career_id: norm(pos?.career_id),
      role_id: norm(pos?.role_id || pos?.role_key),
      employer_id: employerId,
      workday_day_index: getWorkdayDayIndex()
    };
  }
  function makeDefaultTagRules() {
    return {
      max_tags_per_choice: 2,
      memory_window: 12
    };
  }
  function threadKeyForMail(mail) {
    const explicit = norm(mail?.thread_key || mail?.threadKey);
    if (explicit) return explicit;
    const scope = slugify(mail?.role_scope) || "role";
    const arc = slugify(mail?.narrative_arc);
    if (arc && CASE_THREAD_TYPES.has(norm(mail?.mail_type))) return `${scope}.case.${arc}`;
    const id = slugify(mail?.source_mail_id || mail?.id);
    return id ? `${scope}.mail.${id}` : "";
  }
  function isCaseThreadKey(key) {
    return norm(key).includes(".case.");
  }
  function representativePhaseRank(mail) {
    const rank = REPRESENTATIVE_PHASE_RANK[norm(mail?.phase)];
    return typeof rank === "number" ? rank : REPRESENTATIVE_PHASE_RANK_DEFAULT;
  }
  function preferAsThreadRepresentative(candidate, current) {
    if (!current) return true;
    const canonicalA = candidate?.thread_canonical === true ? 1 : 0;
    const canonicalB = current?.thread_canonical === true ? 1 : 0;
    if (canonicalA !== canonicalB) return canonicalA > canonicalB;
    const rankA = representativePhaseRank(candidate);
    const rankB = representativePhaseRank(current);
    if (rankA !== rankB) return rankA < rankB;
    const prioA = Number(candidate?.priority || 0);
    const prioB = Number(current?.priority || 0);
    if (prioA !== prioB) return prioA > prioB;
    return norm(candidate?.id) < norm(current?.id);
  }
  function collapsePoolToCanonicalThreads(pool, excludedThreadKeys, consumedIds) {
    const rest = [];
    const byThread = new Map();
    for (const mail of (Array.isArray(pool) ? pool : [])) {
      const key = threadKeyForMail(mail);
      const stamped = norm(mail?.thread_key) ? mail : { ...mail, thread_key: key };
      if (!isCaseThreadKey(key)) {
        rest.push(stamped);
        continue;
      }
      if (excludedThreadKeys?.has?.(key)) continue;
      if (consumedIds?.has?.(norm(mail?.id))) continue;
      const current = byThread.get(key);
      if (preferAsThreadRepresentative(stamped, current)) byThread.set(key, stamped);
    }
    return [...rest, ...byThread.values()];
  }
  function createSceneCatalog() {
    const jsonCache = new Map();
    const jsonInflight = new Map();
    const catalogTrace = [];
    /** @type {Map<string, any>} */
    const sourceAdapters = new Map();
    const sourceAdapterTrace = [];
    let compiledRegistrySnapshot = null;
    let compiledRegistryPromise = null;

    function normalizeSourceAdapterName(value) {
      return norm(value).toLowerCase();
    }

    function registerSourceAdapter(name, adapter) {
      const adapterName = normalizeSourceAdapterName(name || adapter?.name);
      const candidate = /** @type {any} */ (adapter);
      if (!adapterName || typeof candidate?.getScenes !== "function") return false;

      const existing = sourceAdapters.get(adapterName);
      if (existing) return existing === candidate;

      sourceAdapters.set(adapterName, candidate);
      sourceAdapterTrace.push({
        at: new Date().toISOString(),
        action: "registered",
        name: adapterName,
        source_format: norm(candidate.source_format || candidate.sourceFormat)
      });
      if (sourceAdapterTrace.length > CATALOG_TRACE_LIMIT) {
        sourceAdapterTrace.splice(0, sourceAdapterTrace.length - CATALOG_TRACE_LIMIT);
      }
      return true;
    }

    function adoptQueuedSourceAdapters() {
      const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationSceneSourceAdapterQueue?: Array<{ name?: string, adapter?: any }> }} */ (window);
      const queue = Array.isArray(runtimeWindow.__civicationSceneSourceAdapterQueue)
        ? runtimeWindow.__civicationSceneSourceAdapterQueue
        : [];
      for (const entry of queue) registerSourceAdapter(entry?.name, entry?.adapter);
      return sourceAdapters.size;
    }

    function getSourceAdapter(name) {
      adoptQueuedSourceAdapters();
      return sourceAdapters.get(normalizeSourceAdapterName(name)) || null;
    }

    function listSourceAdapters() {
      adoptQueuedSourceAdapters();
      return Array.from(sourceAdapters.entries()).map(([name, adapter]) => ({
        name,
        source_format: norm(adapter?.source_format || adapter?.sourceFormat),
        version: Number(adapter?.version || 1)
      }));
    }

    async function getSourceScenes(name, context = {}) {
      const adapterName = normalizeSourceAdapterName(name);
      const adapter = getSourceAdapter(adapterName);
      if (!adapter) return [];

      const result = await adapter.getScenes(context || {});
      const scenes = Array.isArray(result) ? result : (result ? [result] : []);
      return scenes
        .filter((scene) => scene && typeof scene === "object")
        .map((scene) => decorateSceneInteraction({
          ...scene,
          scene_source_adapter: adapterName,
          scene_source_format: norm(adapter?.source_format || adapter?.sourceFormat),
          scene_catalog_owner: "CivicationSceneCatalog",
          scene_catalog_version: SCENE_CATALOG_VERSION
        }));
    }
    function getPlanPath(active) {
      const category = norm(active?.career_id);
      const roleScope = resolveRoleScope(active);
      if (!category || !roleScope) return null;
      return `data/Civication/mailPlans/${category}/${roleScope}_plan.json`;
    }
    function getFamilyPaths(active) {
      const category = norm(active?.career_id);
      const roleScope = resolveRoleScope(active);
      if (!category || !roleScope) return [];
      const paths = [
        `data/Civication/mailFamilies/${category}/job/${roleScope}_intro_v2.json`,
        `data/Civication/mailFamilies/${category}/job/${roleScope}_job.json`
      ];
      for (const type of EXTRA_MAIL_TYPES) {
        paths.push(`data/Civication/mailFamilies/${category}/${type}/${roleScope}_${type}.json`);
      }
      return paths;
    }
    async function loadJson(path) {
      const p = norm(path);
      if (!p) return null;
      if (jsonCache.has(p)) return jsonCache.get(p);
      if (jsonInflight.has(p)) return jsonInflight.get(p);
      const pending = (async () => {
        try {
          const store = window.CivicationJsonStore;
          if (typeof store?.fetchJson === "function") {
            const value = await store.fetchJson(p);
            jsonCache.set(p, value || null);
            return value || null;
          }
          if (typeof window.fetch !== "function") {
            jsonCache.set(p, null);
            return null;
          }
          const response = await window.fetch(p, { cache: "no-store" });
          if (!response?.ok) {
            jsonCache.set(p, null);
            return null;
          }
          const value = await response.json();
          jsonCache.set(p, value || null);
          return value || null;
        } catch (error) {
          if (window.DEBUG) console.warn("[CivicationSceneCatalog] kunne ikke laste", p, error);
          jsonCache.set(p, null);
          return null;
        }
      })();
      jsonInflight.set(p, pending);
      try {
        return await pending;
      } finally {
        jsonInflight.delete(p);
      }
    }
    async function loadCompiledRegistry() {
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
    function normalizeChoices(choices) {
      const list = Array.isArray(choices) ? choices : [];
      const normalized = list
        .filter(Boolean)
        .map((choice) => ({
          ...choice,
          id: norm(choice.id),
          label: norm(choice.label),
          effect: Number(choice.effect || 0),
          tags: Array.isArray(choice.tags) ? choice.tags.map(norm).filter(Boolean) : [],
          feedback: norm(choice.feedback)
        }))
        .filter((choice) => choice.id && choice.label);
      return normalized;
    }
    function flattenCatalog(catalog, sourcePath = "") {
      const out = [];
      const families = Array.isArray(catalog?.families) ? catalog.families : [];
      const catalogType = norm(catalog?.mail_type);
      for (const family of families) {
        const familyId = norm(family?.id);
        const mails = Array.isArray(family?.mails) ? family.mails : [];
        for (const mail of mails) {
          const id = norm(mail?.id);
          if (!id) continue;
          out.push(decorateSceneInteraction({
            ...mail,
            id,
            category: norm(catalog?.category),
            role_scope: norm(mail?.role_scope || catalog?.role_scope),
            mail_type: norm(mail?.mail_type || catalogType || "job"),
            mail_family: norm(mail?.mail_family || familyId),
            choices: normalizeChoices(mail?.choices),
            situation: Array.isArray(mail?.situation)
              ? mail.situation.map(norm).filter(Boolean)
              : [norm(mail?.summary)].filter(Boolean),
            scene_catalog_source_path: norm(sourcePath),
            scene_catalog_version: SCENE_CATALOG_VERSION
          }));
        }
      }
      return out;
    }
    async function decorateMails(mails) {
      const list = Array.isArray(mails) ? mails : [];
      const bridge = window.CivicationCareerKnowledgeBridge;
      if (typeof bridge?.decorateMail !== "function") return list;
      return Promise.all(list.map((mail) => bridge.decorateMail(mail)));
    }
    async function getRoleMails(active, state = getState(), options = {}) {
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
      const activeBrandId = slugify(active?.brand_id || "");
      const brandFiltered = flattened.filter((mail) => {
        const mailBrandId = slugify(mail?.brand_id || "");
        if (!mailBrandId) return true;
        return !!activeBrandId && mailBrandId === activeBrandId;
      });
      const mails = (await decorateMails(brandFiltered)).map(decorateSceneInteraction);
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
    async function getRolePlan(active) {
      return loadJson(getPlanPath(active));
    }
    async function prewarm(active, options = {}) {
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
    adoptQueuedSourceAdapters();
    return {
      version: SCENE_CATALOG_VERSION,
      getPlanPath,
      getFamilyPaths,
      loadJson,
      normalizeChoices,
      flattenCatalog,
      registerSourceAdapter,
      adoptQueuedSourceAdapters,
      getSourceAdapter,
      listSourceAdapters,
      getSourceScenes,
      getRoleMails,
      getRolePlan,
      prewarm,
      inspect
    };
  }
  function ensureSceneCatalog() {
    if (window.CivicationSceneCatalog?.getRoleMails) return window.CivicationSceneCatalog;
    const catalog = createSceneCatalog();
    window.CivicationSceneCatalog = catalog;
    return catalog;
  }
  function hashString(input) {
    let h = 2166136261;
    const value = String(input || "");
    for (let index = 0; index < value.length; index += 1) {
      h ^= value.charCodeAt(index);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededScore(seed, mail) {
    const priority = Number(mail?.priority || 1);
    return priority * 100000 + hashString(`${seed}:${mail?.id || ""}`);
  }
  function evaluateWorkRhythm(mail, context) {
    const helper = window.CivicationWorkRhythm;
    if (typeof helper?.evaluateScene !== "function") return { eligible: true, priority_score: 0 };
    return helper.evaluateScene(mail, context?.state || getState(), {
      day_index: getWorkdayDayIndex() || 1,
      phase: context?.phase
    });
  }
  function progressionText(mail) {
    return [
      mail?.id,
      mail?.source_mail_id,
      mail?.mail_family,
      mail?.mail_type,
      mail?.phase,
      mail?.stage,
      mail?.package,
      mail?.package_id,
      mail?.family_id,
      ...(Array.isArray(mail?.mail_tags) ? mail.mail_tags : []),
      ...(Array.isArray(mail?.tags) ? mail.tags : [])
    ].map(slugify).filter(Boolean).join(" ");
  }
  function extractProgressionWeek(mail) {
    const text = progressionText(mail);
    const weekMatch = text.match(/(?:^|_)week_?([0-9]+)(?:_|$)|(?:^|_)w_?([0-9]+)(?:_|$)/);
    if (weekMatch) return Number(weekMatch[1] || weekMatch[2] || 0) || null;
    if (/(^|_)first_week(_|$)/.test(text)) return 1;
    if (/(^|_)second_week(_|$)/.test(text)) return 2;
    return null;
  }
  function stepIndexFromState(state, plan) {
    const progress = state?.mail_plan_progress && typeof state.mail_plan_progress === "object"
      ? state.mail_plan_progress
      : {};
    const planId = norm(plan?.id);
    const byPlan = planId && progress[planId] && typeof progress[planId] === "object"
      ? progress[planId]
      : null;
    for (const value of [byPlan?.step_index, progress.step_index, progress.current_step_index]) {
      const number = Number(value);
      if (Number.isFinite(number) && number >= 0) return Math.floor(number);
    }
    return 0;
  }
  function inferMaxWeekFromPlan(plan, stepIndex, plannedPrimary) {
    const plannedWeek = extractProgressionWeek(plannedPrimary);
    if (plannedWeek) return plannedWeek;
    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    const current = sequence[Math.max(0, Math.min(sequence.length - 1, Number(stepIndex || 0)))] || null;
    const currentText = progressionText({
      id: `${current?.phase || ""}_${current?.step_goal || ""}`,
      mail_family: uniqueStrings(current?.allowed_families).join("_")
    });
    if (/(^|_)week2(_|$)|(^|_)second_week(_|$)/.test(currentText)) return 2;
    if (/(^|_)week1(_|$)|(^|_)first_week(_|$)|(^|_)intro(_|$)/.test(currentText)) return 1;
    return Number(stepIndex || 0) >= 10 ? 2 : 1;
  }
  function consumedSet(state) {
    const consumed = state?.consumed && typeof state.consumed === "object"
      ? Object.keys(state.consumed)
      : [];
    const mailRuntime = state?.mail_runtime_v1 && typeof state.mail_runtime_v1 === "object"
      ? state.mail_runtime_v1
      : {};
    const dayRuntime = state?.[DAY_RUNTIME_KEY] && typeof state[DAY_RUNTIME_KEY] === "object"
      ? state[DAY_RUNTIME_KEY]
      : {};
    return new Set(uniqueStrings([
      ...consumed,
      ...(Array.isArray(mailRuntime.consumed_ids) ? mailRuntime.consumed_ids : []),
      ...(Array.isArray(dayRuntime.answered_ids) ? dayRuntime.answered_ids : []),
      ...(Array.isArray(dayRuntime.delivered_ids) ? dayRuntime.delivered_ids : [])
    ]));
  }
  function mailMatchesDailyProgression(mail, context) {
    const id = norm(mail?.id || mail?.source_mail_id);
    if (!id) return false;
    if (context?.used_ids?.has?.(id)) return false;
    if (id === norm(context?.planned_primary_id)) return false;
    if (evaluateWorkRhythm(mail, context).eligible !== true) return false;
    const text = progressionText(mail);
    const week = extractProgressionWeek(mail);
    const maxWeek = Math.max(1, Number(context?.max_week || 1));
    if (week && week > maxWeek) return false;
    if (/(^|_)(advanced|mastery|late_game|later_phase|senere|viderekommen)(_|$)/.test(text) && maxWeek < 2) return false;
    if (/(^|_)(week2|second_week)(_|$)/.test(text) && maxWeek < 2) return false;
    return true;
  }
  function preferredTypesForDailySlot(slotId) {
    const slot = slugify(slotId);
    if (slot === "primary_work_mail" || slot === "main_delivery") return ["job"];
    if (slot === "operational_batch") return ["micro", "consequence", "job"];
    if (slot === "operational_mail") return ["micro", "knowledge", "job"];
    if (slot === "people_ping" || slot.includes("people")) return ["people", "micro"];
    if (slot === "conflict_or_event") return ["conflict", "event"];
    if (slot === "analysis_followup" || slot === "followup") return ["followup", "people", "job"];
    if (slot === "knowledge" || slot.includes("learning")) return ["knowledge", "story", "job"];
    if (slot === "consequence" || slot.includes("consequence")) return ["consequence", "followup", "people"];
    if (slot === "small_choice" || slot === "micro_choice") return ["micro"];
    if (slot === "task_gate") return ["task_gate", "job", "micro"];
    return [];
  }
  function isStrictDailySlot(slotId) {
    const slot = slugify(slotId);
    return slot === "small_choice" || slot === "task_gate" || slot === "main_delivery";
  }
  function pickDailyExtra(pool, wantedTypes, usedSourceIds, seed, phaseId, slotId, context) {
    const wantedList = uniqueStrings(wantedTypes);
    if (!wantedList.length) return null;
    const rhythmContext = { ...context, phase: phaseId };
    const safe = (Array.isArray(pool) ? pool : [])
      .filter((mail) => mailMatchesDailyProgression(mail, rhythmContext))
      .filter(isActionableSceneCandidate);
    let candidates = [];
    for (const wantedType of wantedList) {
      const preferred = safe.filter((mail) => {
        const id = norm(mail?.id);
        return id && !usedSourceIds.has(id) && norm(mail?.mail_type) === wantedType;
      });
      if (preferred.length) {
        candidates = preferred;
        break;
      }
    }
    if (!candidates.length && !isStrictDailySlot(slotId)) {
      candidates = safe.filter((mail) => {
        const id = norm(mail?.id);
        return id && !usedSourceIds.has(id);
      });
    }
    candidates.sort((a, b) => {
      const phase = norm(phaseId);
      const aPhase = norm(a?.phase) === phase ? 500000 : 0;
      const bPhase = norm(b?.phase) === phase ? 500000 : 0;
      const aRhythm = Number(evaluateWorkRhythm(a, rhythmContext).priority_score || 0) * 1000000;
      const bRhythm = Number(evaluateWorkRhythm(b, rhythmContext).priority_score || 0) * 1000000;
      return (bRhythm + bPhase + seededScore(seed, b)) - (aRhythm + aPhase + seededScore(seed, a));
    });
    const selected = candidates[0] || null;
    if (selected) usedSourceIds.add(norm(selected.id));
    return selected;
  }
  function plannedEventFromRuntime(runtime) {
    return (Array.isArray(runtime?.items) ? runtime.items : [])
      .map((row) => row?.event || null)
      .find((event) => event && (
        norm(event?.source_type) === "planned" ||
        event?.daily_mail_meta?.advances_role_plan === true
      )) || null;
  }
  function isDailyExtraRebuildRow(row) {
    const event = row?.event || {};
    if (event?.go_to_work === true) return false;
    const sourceType = norm(event?.source_type);
    if (sourceType === "daily_generated") return true;
    if (sourceType !== "daily_extra") return false;
    return norm(row?.selected_by) === "CivicationSceneDirector" ||
      norm(event?.daily_mail_meta?.selection_owner) === "CivicationSceneDirector";
  }
  function addExistingSourcesToUsed(runtime, usedSourceIds) {
    for (const row of (Array.isArray(runtime?.items) ? runtime.items : [])) {
      const event = row?.event || {};
      if (isDailyExtraRebuildRow(row)) continue;
      const sourceId = norm(event?.source_mail_id || event?.daily_mail_meta?.source_mail_id);
      if (sourceId) usedSourceIds.add(sourceId);
    }
  }
  function occurrenceIndexForRow(items, rowIndex) {
    const row = items[rowIndex] || {};
    const phase = norm(row?.phase || row?.event?.phase_tag);
    const slot = norm(row?.slot || row?.event?.daily_mail_meta?.slot);
    let occurrence = 0;
    for (let index = 0; index < rowIndex; index += 1) {
      const other = items[index] || {};
      if (norm(other?.phase || other?.event?.phase_tag) !== phase) continue;
      if (norm(other?.slot || other?.event?.daily_mail_meta?.slot) !== slot) continue;
      occurrence += 1;
    }
    return occurrence;
  }
  function toDailyCatalogMail(active, sourceMail, row, rowIndex, runtime) {
    const catalog = ensureSceneCatalog();
    const phase = clampWorkPhase(row?.phase || row?.event?.phase_tag);
    const slot = norm(row?.slot || row?.event?.daily_mail_meta?.slot || "operational_mail");
    const slotId = slugify(slot);
    const sourceId = norm(sourceMail?.id);
    const date = norm(runtime?.date) || todayKey();
    const ordinal = rowIndex + 1;
    const runtimeInstanceKey = norm(runtime?.runtime_instance_key);
    const eventId = `${sourceId}__daily_${date}_${phase}_${slotId}_${ordinal}${runtimeInstanceKey}`;
    return stampWorkdayFields({
      ...sourceMail,
      id: eventId,
      source_mail_id: sourceId,
      thread_key: norm(sourceMail?.thread_key) || threadKeyForMail(sourceMail),
      source_type: "daily_extra",
      stage: norm(sourceMail?.stage || "stable") || "stable",
      choices: catalog.normalizeChoices(sourceMail?.choices),
      scene_catalog_owner: "CivicationSceneCatalog",
      scene_catalog_version: SCENE_CATALOG_VERSION,
      daily_mail_meta: {
        date,
        phase,
        phase_label: phaseLabel(phase),
        slot,
        source_mail_id: sourceId,
        source_mail_type: norm(sourceMail?.mail_type),
        source_mail_family: norm(sourceMail?.mail_family),
        advances_role_plan: false,
        workday_day_index: getWorkdayDayIndex(),
        selection_owner: "CivicationSceneDirector"
      },
      mail_tags: uniqueStrings([
        ...(Array.isArray(sourceMail?.mail_tags) ? sourceMail.mail_tags : []),
        "daily_mail",
        "daily_extra",
        "scene_catalog",
        phase,
        slot
      ])
    }, phase, active, { planned: false });
  }
  async function populateDailyExtraSlots(active, state, runtime, options = {}) {
    const catalog = ensureSceneCatalog();
    const base = runtime && typeof runtime === "object" ? runtime : null;
    if (!active || !base || !Array.isArray(base.items)) return base;
    const selectionSnapshot = options.selection_snapshot || null;
    if (selectionSnapshot?.terminal_closed === true) {
      return {
        ...base,
        [DAILY_RUNTIME_MARKER]: true,
        scene_catalog_version: SCENE_CATALOG_VERSION,
        daily_extra_owner: "CivicationSceneDirector",
        daily_extra_catalog_count: 0,
        daily_extra_terminal_closed: true,
        daily_extra_updated_at: new Date().toISOString()
      };
    }
    const currentState = state && typeof state === "object" ? state : getState();
    const [plan, sourcePool] = await Promise.all([
      catalog.getRolePlan(active),
      catalog.getRoleMails(active, currentState, {
        consumer: norm(options.consumer || "daily_extra_slots") || "daily_extra_slots"
      })
    ]);
    const plannedPrimary = /** @type {any} */ (plannedEventFromRuntime(base));
    const usedSourceIds = consumedSet(currentState);
    addExistingSourcesToUsed(base, usedSourceIds);
    const plannedId = norm(
      plannedPrimary?.source_mail_id ||
      plannedPrimary?.daily_mail_meta?.source_mail_id ||
      plannedPrimary?.id
    );
    if (plannedId) usedSourceIds.add(plannedId);
    const plannedThreadKey = plannedPrimary ? threadKeyForMail(plannedPrimary) : "";
    const excludedThreadKeys = new Set(isCaseThreadKey(plannedThreadKey) ? [plannedThreadKey] : []);
    const dayPool = collapsePoolToCanonicalThreads(sourcePool, excludedThreadKeys, usedSourceIds);
    const stepIndex = stepIndexFromState(currentState, plan);
    const context = {
      role_scope: resolveRoleScope(active),
      step_index: stepIndex,
      max_week: Math.max(1, inferMaxWeekFromPlan(plan, stepIndex, plannedPrimary)),
      planned_primary_id: plannedId,
      used_ids: usedSourceIds,
      state: currentState
    };
    let selectedCount = 0;
    const selectedSourceIds = [];
    const items = base.items.map((row, rowIndex, allRows) => {
      const phase = norm(row?.phase || row?.event?.phase_tag);
      const event = row?.event || {};
      if (!isWorkPhase(phase)) return row;
      if (row?.phase_generator) return row;
      if (!isDailyExtraRebuildRow(row)) return row;
      if (event?.go_to_work === true) return row;
      const slot = norm(row?.slot || event?.daily_mail_meta?.slot);
      const wanted = preferredTypesForDailySlot(slot);
      if (!wanted.length) return row;
      const occurrence = occurrenceIndexForRow(allRows, rowIndex);
      const seed = `${norm(base.date) || todayKey()}:${resolveRoleScope(active)}:${phase}:${slot}:${occurrence}:${rowIndex + 1}`;
      const selected = pickDailyExtra(dayPool, wanted, usedSourceIds, seed, phase, slot, context);
      if (!selected) return row;
      selectedCount += 1;
      selectedSourceIds.push(norm(selected.id));
      return {
        ...row,
        event: toDailyCatalogMail(active, selected, row, rowIndex, base),
        selected_by: "CivicationSceneDirector",
        catalog_source_id: norm(selected.id)
      };
    });
    return {
      ...base,
      items,
      [DAILY_RUNTIME_MARKER]: true,
      scene_catalog_version: SCENE_CATALOG_VERSION,
      daily_extra_owner: "CivicationSceneDirector",
      daily_extra_catalog_count: selectedCount,
      daily_extra_source_ids: selectedSourceIds,
      daily_extra_terminal_closed: false,
      daily_extra_updated_at: new Date().toISOString()
    };
  }
  async function buildEventEnginePack(director, engine, active, state, roleKey) {
    const candidates = await director.getWorkCandidates(active, state, {
      consumer: "event_engine_build_mail_pool"
    });
    const terminalClosed = candidates?.__career_outcome_terminal_closed === true;
    const interactionSuppressed = candidates?.__scene_interaction_suppress_legacy_fallback === true;
    const taggedRuntimeMails = candidates.map((mail) => ({
      ...mail,
      source_type: norm(mail?.source_type) || "planned"
    }));
    return {
      role: norm(active?.career_id) || null,
      tag_rules: makeDefaultTagRules(),
      tracks: [],
      mails: taggedRuntimeMails,
      __civication_mail_runtime: true,
      __civication_scene_director: true,
      __runtime_candidate_count: taggedRuntimeMails.length,
      __legacy_fallback: false,
      __terminal_closed: terminalClosed,
      __interaction_suppressed: interactionSuppressed,
      __no_runtime_candidates: taggedRuntimeMails.length === 0
    };
  }
  function patchEventEngineCandidateOwner(director) {
    const proto = /** @type {any} */ (window.CivicationEventEngine?.prototype);
    if (!proto || !director) return false;
    if (proto[EVENT_ENGINE_PATCH_FLAG] === true) return true;
    if (typeof proto.buildMailPool !== "function") return false;
    proto.buildMailPool = async function sceneDirectorBuildMailPool(active, state, roleKey) {
      try {
        return await buildEventEnginePack(director, this, active, state, roleKey);
      } catch (error) {
        if (window.DEBUG) {
          console.warn("[CivicationSceneDirector] EventEngine-pack feilet; gameplay lukkes fail-closed", error);
        }
        return {
          role: norm(active?.career_id) || null,
          tag_rules: makeDefaultTagRules(),
          tracks: [],
          mails: [],
          __civication_mail_runtime: true,
          __civication_scene_director: true,
          __runtime_candidate_count: 0,
          __legacy_fallback: false,
          __terminal_closed: false,
          __interaction_suppressed: false,
          __no_runtime_candidates: true,
          __scene_director_error: true,
          __scene_director_error_message: norm(error?.message || error)
        };
      }
    };
    proto[EVENT_ENGINE_PATCH_FLAG] = true;
    proto.__civicationSceneDirectorBuildMailPoolPatchedAt = new Date().toISOString();
    return true;
  }
  function ensureSceneDirector() {
    if (window.CivicationSceneDirector?.getWorkCandidates) {
      patchEventEngineCandidateOwner(window.CivicationSceneDirector);
      return window.CivicationSceneDirector;
    }
    const runtime = window.CivicationMailRuntime;
    const sourceSelector = runtime?.makeCandidateMailsForActiveRole;
    if (typeof sourceSelector !== "function") return null;
    const boundSourceSelector = sourceSelector.bind(runtime);
    const selectionTrace = [];
    const selectionSnapshots = new Map();
    function recordSelection(active, candidates, options = {}) {
      const first = Array.isArray(candidates) ? candidates[0] || null : null;
      const snapshot = {
        at: new Date().toISOString(),
        consumer: norm(options.consumer || "mail_runtime_compat") || "mail_runtime_compat",
        career_id: norm(active?.career_id),
        role_scope: resolveRoleScope(active),
        candidate_count: Array.isArray(candidates) ? candidates.length : 0,
        selected_id: norm(first?.id) || null,
        selected_type: norm(first?.mail_type) || null,
        selected_family: norm(first?.mail_family) || null,
        terminal_closed: candidates?.__career_outcome_terminal_closed === true,
        interaction_input_count: Number(candidates?.__scene_interaction_input_count || 0),
        interaction_blocked_count: Number(candidates?.__scene_interaction_blocked_count || 0),
        interaction_passive_count: Number(candidates?.__scene_interaction_passive_count || 0)
      };
      selectionTrace.push(snapshot);
      selectionSnapshots.set(snapshot.role_scope, snapshot);
      if (selectionTrace.length > SELECTION_TRACE_LIMIT) {
        selectionTrace.splice(0, selectionTrace.length - SELECTION_TRACE_LIMIT);
      }
    }
    async function getWorkCandidates(active, state = getState(), options = {}) {
      const candidates = await boundSourceSelector(active, state);
      const normalized = filterAndRankWorkRhythm(filterActionableSceneCandidates(candidates), state, options);
      recordSelection(active, normalized, options);
      return normalized;
    }
    async function getPrimaryWorkScene(active, state = getState(), options = {}) {
      const candidates = await getWorkCandidates(active, state, {
        ...options,
        consumer: norm(options.consumer || "primary_work_scene") || "primary_work_scene"
      });
      return candidates[0] || null;
    }
    async function getEventEnginePack(engine, active, state = getState(), roleKey) {
      return buildEventEnginePack(director, engine, active, state, roleKey);
    }
    async function getDailyCatalog(active, state = getState(), options = {}) {
      const catalog = ensureSceneCatalog();
      return {
        role_scope: resolveRoleScope(active),
        plan: await catalog.getRolePlan(active),
        mails: await catalog.getRoleMails(active, state, {
          ...options,
          consumer: norm(options.consumer || "daily_catalog") || "daily_catalog"
        })
      };
    }
    function getLastSelectionSnapshot(active) {
      return selectionSnapshots.get(resolveRoleScope(active)) || null;
    }
    async function populateDirectorOwnedDailyExtras(active, state = getState(), runtimeValue, options = {}) {
      return populateDailyExtraSlots(active, state, runtimeValue, {
        ...options,
        selection_snapshot: getLastSelectionSnapshot(active)
      });
    }
    async function prewarmDailyCatalog(active, options = {}) {
      return ensureSceneCatalog().prewarm(active, options);
    }
    function inspect() {
      const active = getActive();
      const proto = /** @type {any} */ (window.CivicationEventEngine?.prototype);
      const dailyBuilder = window.CivicationDailyMailBuilder;
      return {
        version: SCENE_DIRECTOR_VERSION,
        owner: "CivicationSceneDirector",
        source_adapter: "CivicationMailRuntime.makeCandidateMailsForActiveRole",
        scene_catalog_owner: "CivicationSceneCatalog",
        active_role_scope: active ? resolveRoleScope(active) : null,
        event_engine_candidate_owner: proto?.[EVENT_ENGINE_PATCH_FLAG] === true,
        daily_extra_slot_owner: dailyBuilder?.[DAILY_BUILDER_PATCH_FLAG] === true,
        selection_trace: selectionTrace.slice(),
        scene_catalog: ensureSceneCatalog().inspect()
      };
    }
    const director = {
      version: SCENE_DIRECTOR_VERSION,
      getWorkCandidates,
      getPrimaryWorkScene,
      getEventEnginePack,
      getDailyCatalog,
      getLastSelectionSnapshot,
      populateDailyExtraSlots: populateDirectorOwnedDailyExtras,
      prewarmDailyCatalog,
      inspect
    };
    window.CivicationSceneDirector = director;
    runtime.makeCandidateMailsForActiveRole = director.getWorkCandidates;
    patchEventEngineCandidateOwner(director);
    return director;
  }
  let legacyCatalogSuppressionDepth = 0;
  let restoreSuppressedCatalogSources = null;
  function isLegacyFamilyPath(path) {
    return norm(path).replace(/^\.?\//, "").startsWith("data/Civication/mailFamilies/");
  }
  function installLegacyCatalogSuppression() {
    const restorers = [];
    const store = window.CivicationJsonStore;
    if (typeof store?.fetchJson === "function") {
      const previous = store.fetchJson;
      const wrapper = function sceneCatalogSuppressLegacyFetch(path, ...args) {
        if (isLegacyFamilyPath(path)) return Promise.resolve(null);
        return previous.call(this, path, ...args);
      };
      store.fetchJson = wrapper;
      restorers.push(() => {
        if (store.fetchJson === wrapper) store.fetchJson = previous;
      });
    }
    if (typeof window.fetch === "function") {
      const previous = window.fetch;
      const wrapper = function sceneCatalogSuppressLegacyWindowFetch(path, ...args) {
        if (isLegacyFamilyPath(path)) return Promise.resolve({ ok: false, status: 404 });
        return previous.call(this, path, ...args);
      };
      window.fetch = wrapper;
      restorers.push(() => {
        if (window.fetch === wrapper) window.fetch = previous;
      });
    }
    return () => {
      for (const restore of restorers.reverse()) restore();
    };
  }
  async function withLegacyDailyCatalogSuppressed(callback) {
    legacyCatalogSuppressionDepth += 1;
    if (legacyCatalogSuppressionDepth === 1) {
      restoreSuppressedCatalogSources = installLegacyCatalogSuppression();
    }
    try {
      return await callback();
    } finally {
      legacyCatalogSuppressionDepth = Math.max(0, legacyCatalogSuppressionDepth - 1);
      if (legacyCatalogSuppressionDepth === 0 && restoreSuppressedCatalogSources) {
        restoreSuppressedCatalogSources();
        restoreSuppressedCatalogSources = null;
      }
    }
  }
  function runtimeMatchesActive(runtime, active, date) {
    if (!runtime || !Array.isArray(runtime?.items) || !runtime.items.length) return false;
    return norm(runtime.date) === norm(date) && norm(runtime.role_scope) === resolveRoleScope(active);
  }
  async function ensureCatalogOwnedDailyRuntime(builder, director, active, options = {}) {
    if (!active || !builder || !director) return null;
    const date = norm(options.date || todayKey());
    const state = getState();
    const existing = state?.[DAY_RUNTIME_KEY];
    if (options.forceNew !== true && runtimeMatchesActive(existing, active, date)) {
      if (existing?.[DAILY_RUNTIME_MARKER] === true) return existing;
      const adopted = await director.populateDailyExtraSlots(active, state, existing, {
        consumer: "daily_runtime_adoption"
      });
      setState({ [DAY_RUNTIME_KEY]: adopted });
      return adopted;
    }
    const built = await builder.buildQueue(active, {
      ...options,
      date,
      forceNew: options.forceNew === true
    });
    if (built) setState({ [DAY_RUNTIME_KEY]: built });
    return built;
  }
  function patchDailyEventEngineEntry(builder, director) {
    const proto = /** @type {any} */ (window.CivicationEventEngine?.prototype);
    if (!proto || typeof proto.onAppOpen !== "function") return false;
    if (proto.__civicationSceneDirectorDailyEntry === proto.onAppOpen) return true;
    const previousOnAppOpen = proto.onAppOpen;
    const wrapped = async function sceneDirectorDailyOnAppOpen(options = {}) {
      const active = getActive();
      if (active && options?.skipDailyMailBuilder !== true) {
        await ensureCatalogOwnedDailyRuntime(builder, director, active, {
          date: options?.date,
          forceNew: options?.forceNewDailyMail === true
        });
      }
      return previousOnAppOpen.call(this, options);
    };
    proto.onAppOpen = wrapped;
    proto.__civicationSceneDirectorDailyEntry = wrapped;
    proto.__civicationSceneDirectorDailyEntryPatchedAt = new Date().toISOString();
    return true;
  }
  function defer(callback) {
    Promise.resolve().then(callback).catch((error) => {
      if (window.DEBUG) console.warn("[CivicationSceneDirector] utsatt Daily-patch feilet", error);
    });
  }
  function scheduleDailyEventEnginePatch(builder, director) {
    const schedule = () => defer(() => patchDailyEventEngineEntry(builder, director));
    schedule();
    if (typeof document !== "undefined" && document?.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", schedule, { once: true });
    }
    if (typeof window.addEventListener === "function") {
      window.addEventListener("civi:dataReady", schedule);
      window.addEventListener("civi:booted", schedule);
    }
  }
  function patchDailyBuilder(builder, director) {
    if (!builder || typeof builder !== "object" || !director) return builder;
    if (builder[DAILY_BUILDER_PATCH_FLAG] === true) {
      scheduleDailyEventEnginePatch(builder, director);
      return builder;
    }
    const catalog = ensureSceneCatalog();
    const originalBuildQueue = typeof builder.buildQueue === "function" ? builder.buildQueue : null;
    const originalPrewarm = typeof builder.prewarm === "function" ? builder.prewarm : null;
    const originalStartToday = typeof builder.startToday === "function" ? builder.startToday : null;
    const originalEnqueueNext = typeof builder.enqueueNext === "function" ? builder.enqueueNext : null;
    const originalEnqueuePhaseBundle = typeof builder.enqueuePhaseBundle === "function" ? builder.enqueuePhaseBundle : null;
    const originalInspect = typeof builder.inspect === "function" ? builder.inspect : null;
    if (originalBuildQueue) {
      builder.buildQueue = async function sceneDirectorBuildDailyQueue(active, options = {}) {
        const runtime = await withLegacyDailyCatalogSuppressed(
          () => originalBuildQueue.call(builder, active, options)
        );
        return director.populateDailyExtraSlots(active, getState(), runtime, {
          consumer: "daily_mail_builder_extra_slots"
        });
      };
    }
    if (originalPrewarm) {
      builder.prewarm = async function sceneDirectorPrewarmDaily(activeOverride) {
        const active = activeOverride || getActive();
        const legacy = await withLegacyDailyCatalogSuppressed(
          () => originalPrewarm.call(builder, activeOverride)
        );
        const catalogResult = active
          ? await director.prewarmDailyCatalog(active, { consumer: "daily_mail_builder_prewarm" })
          : { warmed: false, reason: "no_active_role" };
        return {
          ...(legacy && typeof legacy === "object" ? legacy : {}),
          scene_catalog: catalogResult,
          selection_owner: "CivicationSceneDirector"
        };
      };
    }
    if (originalStartToday) {
      builder.startToday = async function sceneDirectorStartToday(options = {}) {
        const active = options.active || getActive();
        if (active) {
          await ensureCatalogOwnedDailyRuntime(builder, director, active, {
            date: options.date,
            forceNew: options.forceNew === true
          });
        }
        return originalStartToday.call(builder, {
          ...options,
          active,
          forceNew: false
        });
      };
    }
    if (originalEnqueueNext) {
      builder.enqueueNext = async function sceneDirectorEnqueueNext(engine, options = {}) {
        const active = options.active || getActive();
        if (active) {
          await ensureCatalogOwnedDailyRuntime(builder, director, active, {
            date: options.date,
            forceNew: options.forceNew === true
          });
        }
        return originalEnqueueNext.call(builder, engine, {
          ...options,
          active,
          forceNew: false
        });
      };
    }
    if (originalEnqueuePhaseBundle) {
      builder.enqueuePhaseBundle = async function sceneDirectorEnqueuePhaseBundle(engine, options = {}) {
        const active = options.active || getActive();
        if (active) {
          await ensureCatalogOwnedDailyRuntime(builder, director, active, {
            date: options.date,
            forceNew: options.forceNew === true
          });
        }
        return originalEnqueuePhaseBundle.call(builder, engine, {
          ...options,
          active,
          forceNew: false
        });
      };
    }
    if (originalInspect) {
      builder.inspect = function sceneDirectorInspectDaily() {
        const base = originalInspect.call(builder);
        return {
          ...(base && typeof base === "object" ? base : {}),
          scene_director_daily_extra_owner: true,
          scene_catalog: catalog.inspect()
        };
      };
    }
    builder.getFamilyPaths = catalog.getFamilyPaths;
    builder.getSceneCatalog = () => catalog;
    builder.ensureSceneDirectorRuntime = (active, options = {}) =>
      ensureCatalogOwnedDailyRuntime(builder, director, active || getActive(), options);
    builder[DAILY_BUILDER_PATCH_FLAG] = true;
    builder.__civicationSceneDirectorCatalogPatchedAt = new Date().toISOString();
    scheduleDailyEventEnginePatch(builder, director);
    return builder;
  }
  function installDailyBuilderBridge(director) {
    if (!director) return false;
    const current = window.CivicationDailyMailBuilder;
    if (current && typeof current === "object") {
      patchDailyBuilder(current, director);
    }
    const descriptor = Object.getOwnPropertyDescriptor(window, "CivicationDailyMailBuilder");
    if (descriptor && descriptor.configurable === false) return !!current;
    const descriptorSetter = /** @type {any} */ (descriptor?.set);
    if (descriptorSetter?.__civicationSceneDirectorBridge === true) return true;
    let value = current;
    const setter = function setDailyBuilder(next) {
      value = patchDailyBuilder(next, director);
    };
    setter.__civicationSceneDirectorBridge = true;
    Object.defineProperty(window, "CivicationDailyMailBuilder", {
      configurable: true,
      enumerable: true,
      get() {
        return value;
      },
      set: setter
    });
    return true;
  }
  async function loadWorkdayCandidates(active, state = getState()) {
    const director = ensureSceneDirector();
    if (!director || typeof director.getWorkCandidates !== "function") return [];
    try {
      const list = await director.getWorkCandidates(active, state, {
        consumer: "workday_mail_builder"
      });
      return Array.isArray(list) ? list : [];
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationWorkdayMailBuilder] kunne ikke laste arbeidslivsscener", error);
      return [];
    }
  }
  function toWorkdayMail(active, sourceMail, phaseId, index, options = {}) {
    const phase = clampWorkPhase(phaseId);
    const date = norm(options.date) || todayKey();
    const runtimeInstanceKey = norm(options.runtimeInstanceKey);
    const sourceId = norm(sourceMail?.id);
    const eventId = `${sourceId || "work"}__workday_${date}_${phase}_${index}${runtimeInstanceKey}`;
    return stampWorkdayFields({
      ...sourceMail,
      id: eventId,
      source_mail_id: sourceId,
      thread_key: norm(sourceMail?.thread_key) || `${resolveRoleScope(active) || "role"}.mail.${slugify(eventId)}`,
      stage: norm(sourceMail?.stage || "stable") || "stable",
      choices: normalizeWorkdayChoices(sourceMail?.choices),
      daily_mail_meta: {
        date,
        phase,
        phase_label: phaseLabel(phase),
        slot: index === 0 ? "primary_work_mail" : "operational_mail",
        source_mail_id: sourceId,
        source_mail_type: norm(sourceMail?.mail_type),
        source_mail_family: norm(sourceMail?.mail_family),
        advances_role_plan: index === 0,
        workday_day_index: getWorkdayDayIndex()
      },
      mail_tags: [
        ...(Array.isArray(sourceMail?.mail_tags) ? sourceMail.mail_tags : []),
        "daily_mail",
        "daily_workday",
        phase
      ].filter(Boolean)
    }, phase, active, { planned: index === 0 });
  }
  async function buildWorkdayItems(active, options = {}) {
    const pos = active || getActive();
    if (!pos) return [];
    const candidates = await loadWorkdayCandidates(pos, options.state || getState());
    if (!candidates.length) return [];
    const items = [];
    candidates.forEach((mail, index) => {
      const phase = index === 0 ? "forenoon" : "workday";
      items.push({
        status: "queued",
        phase,
        slot: index === 0 ? "primary_work_mail" : "operational_mail",
        event: toWorkdayMail(pos, mail, phase, index, options)
      });
    });
    return items;
  }
  ensureSceneCatalog();
  const director = ensureSceneDirector();
  installDailyBuilderBridge(director);
  window.CivicationWorkdayMailBuilder = {
    WORK_PHASES: WORK_PHASES.slice(),
    WORK_MAIL_CLASS,
    isWorkPhase,
    phaseLabel,
    clampWorkPhase,
    resolveRoleScope,
    getEmployerId,
    getWorkdayDayIndex,
    stampWorkdayFields,
    ensureSceneCatalog,
    ensureSceneDirector,
    installDailyBuilderBridge,
    patchEventEngineCandidateOwner,
    patchDailyBuilder,
    loadWorkdayCandidates,
    toWorkdayMail,
    buildWorkdayItems
  };
})();
