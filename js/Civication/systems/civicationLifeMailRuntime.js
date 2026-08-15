// js/Civication/systems/civicationLifeMailRuntime.js
// CivicationLifeMailRuntime — realistiske livssituasjonsmailer utenfor vanlig jobbrolle.
//
// Brukes når spilleren ikke har aktiv jobb, eller når staten har eksplisitte life-/identity-tags
// som matcher en pakke i data/Civication/lifeMails/life_manifest.json.

(function () {
  "use strict";

  const STATE_KEY = "life_mail_runtime_v1";
  const MANIFEST_PATH = "data/Civication/lifeMails/life_manifest.json";
  const ANSWER_MIDDLEWARE_NAME = "life_mail_runtime";
  const ANSWER_MIDDLEWARE_PRIORITY = 30;
  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";
  const SCENE_SOURCE_ADAPTER_NAME = "life";
  const SCENE_SOURCE_FORMAT = "life_mail_manifest_v1";
  const SCENE_SOURCE_ADAPTER_QUEUE_KEY = "__civicationSceneSourceAdapterQueue";

  const jsonCache = new Map();

  function norm(value) {
    return String(value || "").trim();
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getInbox() {
    const fromEngine = window.CivicationMailEngine?.getInbox?.();
    if (Array.isArray(fromEngine)) return fromEngine;
    const fromState = window.CivicationState?.getInbox?.();
    return Array.isArray(fromState) ? fromState : [];
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function getPhase() {
    return norm(window.CivicationCalendar?.getPhase?.() || "morning") || "morning";
  }

  // Dedupe samtidige kall mot samme fil: cache lagrer verdier, inflight lagrer
  // pågående promises, slik at N samtidige kall gir ÉN fetch (ikke N).
  const jsonInflight = new Map();

  async function loadJson(path) {
    const p = norm(path);
    if (!p) return null;
    if (jsonCache.has(p)) return jsonCache.get(p);
    if (jsonInflight.has(p)) return jsonInflight.get(p);
    const promise = loadJsonUncached(p);
    jsonInflight.set(p, promise);
    try {
      return await promise;
    } finally {
      jsonInflight.delete(p);
    }
  }

  async function loadJsonUncached(p) {
    // Delt lager først: én fetch per fil på tvers av alle Civication-motorer.
    const sharedStore = window.CivicationJsonStore;
    if (sharedStore?.fetchJson) {
      const shared = await sharedStore.fetchJson(p);
      jsonCache.set(p, shared);
      return shared;
    }
    try {
      const res = await fetch(p, { cache: "no-store" });
      if (!res.ok) {
        jsonCache.set(p, null);
        return null;
      }
      const json = await res.json();
      jsonCache.set(p, json);
      return json;
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationLifeMailRuntime] kunne ikke laste", p, error);
      jsonCache.set(p, null);
      return null;
    }
  }

  function getRuntime(state = getState()) {
    const runtime = state?.[STATE_KEY] && typeof state[STATE_KEY] === "object"
      ? state[STATE_KEY]
      : {};

    return {
      version: 1,
      consumed_ids: uniqueStrings(runtime.consumed_ids),
      history: Array.isArray(runtime.history) ? runtime.history.slice(-80) : [],
      cycle_count: Math.max(0, Number(runtime.cycle_count || 0)),
      updated_at: runtime.updated_at || null
    };
  }

  function getConsumedIds(state = getState()) {
    /** @type {{ consumed?: Record<string, unknown> } | null | undefined} */
    const localState = state;
    const consumedMap = localState?.consumed && typeof localState.consumed === "object"
      ? Object.keys(localState.consumed)
      : [];

    return uniqueStrings([
      ...consumedMap,
      ...getRuntime(state).consumed_ids
    ]);
  }

  function getStateTags(state = getState()) {
    /** @type {{ identity_tags?: unknown, life_tags?: unknown, life_flags?: unknown, tracks?: unknown, mail_branch_state?: { flags?: unknown[] } } | null | undefined} */
    const localState = state;
    const branchFlags = localState?.mail_branch_state && Array.isArray(localState.mail_branch_state.flags)
      ? localState.mail_branch_state.flags
      : [];

    return new Set(uniqueStrings([
      ...(Array.isArray(localState?.identity_tags) ? localState.identity_tags : []),
      ...(Array.isArray(localState?.life_tags) ? localState.life_tags : []),
      ...(Array.isArray(localState?.life_flags) ? localState.life_flags : []),
      ...(Array.isArray(localState?.tracks) ? localState.tracks : []),
      ...branchFlags
    ]));
  }

  function packMatches(pack, ctx) {
    const when = pack?.when && typeof pack.when === "object" ? pack.when : {};
    const active = ctx.active || null;
    const tags = ctx.tags || new Set();

    if (pack?.disabled === true) return false;

    if (when.no_active_job === true && active) return false;
    if (when.requires_active_job === true && !active) return false;

    const activeCareers = Array.isArray(when.active_career_any)
      ? when.active_career_any.map(norm).filter(Boolean)
      : [];
    if (activeCareers.length && !activeCareers.includes(norm(active?.career_id))) return false;

    const anyTags = Array.isArray(when.tags_any)
      ? when.tags_any.map(norm).filter(Boolean)
      : [];
    if (anyTags.length && !anyTags.some(tag => tags.has(tag))) return false;

    const allTags = Array.isArray(when.tags_all)
      ? when.tags_all.map(norm).filter(Boolean)
      : [];
    if (allTags.length && !allTags.every(tag => tags.has(tag))) return false;

    return true;
  }

  function normalizeChoices(choices) {
    return (Array.isArray(choices) ? choices : [])
      .filter(Boolean)
      .map(choice => {
        const out = { ...choice };
        out.id = norm(out.id);
        out.label = norm(out.label);
        out.reply = norm(out.reply);
        out.effect = Number(out.effect || 0);
        out.tags = Array.isArray(out.tags) ? choice.tags.map(norm).filter(Boolean) : [];
        out.feedback = norm(out.feedback);
        if (!out.reply) delete out.reply;
        return out;
      })
      .filter(choice => choice.id && choice.label);
  }

  function flattenPack(pack, packMeta) {
    const out = [];
    const families = Array.isArray(pack?.families) ? pack.families : [];

    for (const family of families) {
      const familyId = norm(family?.id);
      const mails = Array.isArray(family?.mails) ? family.mails : [];

      for (const mail of mails) {
        const id = norm(mail?.id);
        if (!id) continue;

        out.push({
          ...mail,
          id,
          source_type: "life",
          mail_class: "life",
          mail_type: norm(mail?.mail_type || pack?.mail_type || "life"),
          mail_family: norm(mail?.mail_family || familyId),
          life_pack_id: norm(pack?.id || packMeta?.id),
          life_context: norm(pack?.life_context || packMeta?.id),
          priority: Number(mail?.priority || packMeta?.priority || 1),
          choices: normalizeChoices(mail?.choices)
        });
      }
    }

    return out;
  }

  function toRuntimeEvent(mail, ctx) {
    const situation = Array.isArray(mail?.situation)
      ? mail.situation.map(norm).filter(Boolean)
      : [norm(mail?.summary)].filter(Boolean);

    return {
      ...mail,
      id: norm(mail.id),
      source: norm(mail.source || "Civication"),
      stage: norm(mail.stage || "stable") || "stable",
      phase_tag: "morning",
      subject: norm(mail.subject),
      summary: norm(mail.summary),
      situation,
      from: norm(mail.from),
      place_id: norm(mail.place_id),
      choices: normalizeChoices(mail.choices),
      mail_tags: uniqueStrings([
        "life_mail",
        norm(mail.life_pack_id),
        norm(mail.life_context),
        norm(mail.mail_family),
        ...(Array.isArray(mail.mail_tags) ? mail.mail_tags : [])
      ]),
      life_mail_meta: {
        pack_id: norm(mail.life_pack_id),
        context: norm(mail.life_context),
        family_id: norm(mail.mail_family),
        no_active_job: !ctx.active,
        active_career_id: norm(ctx.active?.career_id),
        generated_at: new Date().toISOString()
      }
    };
  }

  async function makeCandidateLifeMails(ctx = {}) {
    const active = ctx.active ?? getActive();
    const state = ctx.state || getState();
    const tags = getStateTags(state);

    const manifest = await loadJson(MANIFEST_PATH);
    const packs = Array.isArray(manifest?.packs) ? manifest.packs : [];
    if (!packs.length) return [];

    const matchingPacks = packs
      .filter(pack => packMatches(pack, { active, state, tags }))
      .sort((a, b) => Number(b?.priority || 0) - Number(a?.priority || 0));

    const mails = [];
    for (const packMeta of matchingPacks) {
      const pack = await loadJson(packMeta.path);
      if (!pack) continue;
      mails.push(...flattenPack(pack, packMeta));
    }

    const consumed = new Set(getConsumedIds(state));
    let candidates = mails.filter(mail => !consumed.has(norm(mail.id)) || mail.repeatable === true);

    // Ingen dead end: når en livspakke er brukt opp, åpner vi den på nytt i ny syklus.
    if (!candidates.length && mails.length) {
      candidates = mails;
      const runtime = getRuntime(state);
      setState({
        [STATE_KEY]: {
          ...runtime,
          consumed_ids: [],
          cycle_count: Number(runtime.cycle_count || 0) + 1,
          updated_at: new Date().toISOString()
        }
      });
    }

    return candidates
      .map(mail => toRuntimeEvent(mail, { active, state }))
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
  }

  async function makeNextLifeMail(ctx = {}) {
    const candidates = await makeCandidateLifeMails(ctx);
    return candidates[0] || null;
  }

  async function getSourceScenes(context = {}) {
    const event = await makeNextLifeMail({
      active: context.active ?? getActive(),
      state: context.state || getState()
    });
    return event ? [event] : [];
  }

  const LIFE_SOURCE_ADAPTER = Object.freeze({
    name: SCENE_SOURCE_ADAPTER_NAME,
    version: 1,
    source_format: SCENE_SOURCE_FORMAT,
    getScenes: getSourceScenes
  });

  function registerSceneSourceAdapter() {
    const catalog = window.CivicationSceneCatalog;
    if (typeof catalog?.registerSourceAdapter === "function") {
      return catalog.registerSourceAdapter(SCENE_SOURCE_ADAPTER_NAME, LIFE_SOURCE_ADAPTER);
    }

    const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationSceneSourceAdapterQueue?: Array<{ name?: string, adapter?: any }> }} */ (window);
    const queue = Array.isArray(runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY])
      ? runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY]
      : (runtimeWindow[SCENE_SOURCE_ADAPTER_QUEUE_KEY] = []);
    const existing = queue.find((entry) => entry?.name === SCENE_SOURCE_ADAPTER_NAME);
    if (existing) return existing.adapter === LIFE_SOURCE_ADAPTER;
    queue.push({ name: SCENE_SOURCE_ADAPTER_NAME, adapter: LIFE_SOURCE_ADAPTER });
    return true;
  }

  function markLifeMailAnswered(eventObj, choiceId) {
    const id = norm(eventObj?.id);
    if (!id) return null;

    const state = getState();
    const runtime = getRuntime(state);
    const consumedIds = uniqueStrings([...runtime.consumed_ids, id]);
    /** @type {{ consumed?: Record<string, unknown> } | null | undefined} */
    const localState = state;
    const consumedMap = localState?.consumed && typeof localState.consumed === "object" ? localState.consumed : {};

    const history = [
      ...runtime.history,
      {
        id,
        choice_id: norm(choiceId),
        life_pack_id: norm(eventObj?.life_mail_meta?.pack_id || eventObj?.life_pack_id),
        life_context: norm(eventObj?.life_mail_meta?.context || eventObj?.life_context),
        mail_family: norm(eventObj?.mail_family),
        at: new Date().toISOString()
      }
    ].slice(-80);

    return setState({
      consumed: {
        ...consumedMap,
        [id]: true
      },
      [STATE_KEY]: {
        ...runtime,
        consumed_ids: consumedIds,
        history,
        updated_at: new Date().toISOString()
      }
    });
  }

  function shouldTryLifeMail(active, state) {
    if (!active) return true;

    const tags = getStateTags(state);
    return tags.has("alcohol_risk") ||
      tags.has("alkohol_risk") ||
      tags.has("ruspress") ||
      tags.has("subkultur_skurk") ||
      tags.has("skurk") ||
      tags.has("subculture_edge");
  }

  async function lifeMailAnswerMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const isLifeMail = norm(eventObj?.source_type) === "life" || norm(eventObj?.mail_class) === "life";
    const result = await next();

    if (result?.ok !== false && isLifeMail) {
      markLifeMailAnswered(eventObj, ctx?.choiceId);
      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    }

    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        lifeMailAnswerMiddleware,
        ANSWER_MIDDLEWARE_PRIORITY
      );
    }

    const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationChoiceAnswerMiddlewareQueue?: Array<{ name: string, fn: Function, priority: number }> }} */ (window);
    const queue = Array.isArray(runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY])
      ? runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY]
      : (runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY] = []);
    if (!queue.some(entry => entry?.name === ANSWER_MIDDLEWARE_NAME)) {
      queue.push({
        name: ANSWER_MIDDLEWARE_NAME,
        fn: lifeMailAnswerMiddleware,
        priority: ANSWER_MIDDLEWARE_PRIORITY
      });
    }
    return true;
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__civicationLifeMailRuntimePatched === true) {
      registerAnswerMiddleware();
      return false;
    }

    const legacyOnAppOpen = proto.onAppOpen;
    proto.onAppOpen = async function lifeRuntimeOnAppOpen(opts = {}) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      if (pending?.event) return { enqueued: false, reason: "pending_exists" };

      const phase = getPhase();
      const active = getActive();
      const state = this.getState ? this.getState() : getState();

      if (phase === "morning" && shouldTryLifeMail(active, state)) {
        const catalog = window.CivicationSceneCatalog;
        const scenes = typeof catalog?.getSourceScenes === "function"
          ? await catalog.getSourceScenes(SCENE_SOURCE_ADAPTER_NAME, {
            active,
            state,
            consumer: "civicationLifeMailRuntime.onAppOpen"
          })
          : [];
        const ev = Array.isArray(scenes) ? scenes[0] || null : null;
        if (ev) {
          this.enqueueEvent?.(ev);
          return {
            enqueued: true,
            type: "life",
            event: ev,
            source_adapter: norm(ev?.scene_source_adapter || SCENE_SOURCE_ADAPTER_NAME)
          };
        }
      }

      if (typeof legacyOnAppOpen === "function") {
        return legacyOnAppOpen.call(this, opts);
      }

      return { enqueued: false, reason: active ? "life_no_match" : "no_active_job" };
    };

    registerAnswerMiddleware();
    proto.__civicationLifeMailRuntimePatched = true;
    proto.__civicationLifeMailRuntimePatchedAt = new Date().toISOString();
    return true;
  }

  function inspect() {
    const state = getState();
    return {
      active: getActive(),
      phase: getPhase(),
      runtime: getRuntime(state),
      tags: Array.from(getStateTags(state)),
      pending: Array.isArray(getInbox()) ? getInbox().find(item => item?.status === "pending")?.event || null : null,
      patched: window.CivicationEventEngine?.prototype?.__civicationLifeMailRuntimePatched === true,
      answer_middleware_registered: window.CivicationChoiceDirector?.listAnswerMiddlewares?.().some?.(entry => entry?.name === ANSWER_MIDDLEWARE_NAME) === true,
      source_adapter_registered: window.CivicationSceneCatalog?.getSourceAdapter?.(SCENE_SOURCE_ADAPTER_NAME) === LIFE_SOURCE_ADAPTER,
      cache_size: jsonCache.size
    };
  }

  async function debugCandidates() {
    return makeCandidateLifeMails({ active: getActive(), state: getState() });
  }

  function boot() {
    registerSceneSourceAdapter();
    patchEventEngine();
  }

  window.CivicationLifeMailRuntime = {
    STATE_KEY,
    MANIFEST_PATH,
    boot,
    inspect,
    debugCandidates,
    loadJson,
    makeCandidateLifeMails,
    makeNextLifeMail,
    getSourceScenes,
    sourceAdapter: LIFE_SOURCE_ADAPTER,
    registerSceneSourceAdapter,
    markLifeMailAnswered,
    registerAnswerMiddleware,
    patchEventEngine
  };

  registerSceneSourceAdapter();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
