// js/Civication/systems/day/dayConsequences.js
// Konsekvensmotor (data-lag, ikke UI): utleder kapital-/psyke-/grenbias-deltaer fra valgets
// etiketter og bruker dem. Eier ikke visning — den ligger i dayConsequencesUI /
// dayNarrativeConsequencesUI.
(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function uniq(arr) {
    return Array.from(new Set((Array.isArray(arr) ? arr : []).map(normStr).filter(Boolean)));
  }

  const WORK_WORLD_SCRIPT = "js/Civication/core/civicationWorkWorld.js";
  const AUTHORITY_SCRIPT = "js/Civication/core/civicationInstitutionAuthority.js";
  const SOCIAL_STANDING_SCRIPT = "js/Civication/core/civicationSocialStanding.js";
  let workWorldLoadPromise = null;
  let authorityLoadPromise = null;
  let socialStandingLoadPromise = null;

  function runtimeWindow() {
    return /** @type {any} */ (window);
  }

  function attachWorkWorldFromFactory() {
    const rt = runtimeWindow();
    if (rt.CivicationWorkWorld?.applyOperations) return rt.CivicationWorkWorld;
    if (rt.CivicationWorkWorldFactory?.createAdapter && rt.CivicationState?.getState && rt.CivicationState?.setState) {
      rt.CivicationWorkWorld = rt.CivicationWorkWorldFactory.createAdapter(rt.CivicationState);
      return rt.CivicationWorkWorld;
    }
    return null;
  }

  function ensureWorkWorld() {
    const attached = attachWorkWorldFromFactory();
    if (attached) return Promise.resolve(attached);
    if (workWorldLoadPromise) return workWorldLoadPromise;

    workWorldLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = WORK_WORLD_SCRIPT;
      script.async = false;
      script.onload = () => {
        const adapter = attachWorkWorldFromFactory();
        if (!adapter) reject(new Error("CivicationWorkWorld lastet uten state-adapter"));
        else resolve(adapter);
      };
      script.onerror = () => reject(new Error(`Kunne ikke laste ${WORK_WORLD_SCRIPT}`));
      (document.head || document.documentElement).appendChild(script);
    }).catch((error) => {
      workWorldLoadPromise = null;
      throw error;
    });

    return workWorldLoadPromise;
  }

  function attachAuthorityResolver() {
    const rt = runtimeWindow();
    return rt.CivicationInstitutionAuthority?.evaluate ? rt.CivicationInstitutionAuthority : null;
  }

  function ensureAuthorityResolver() {
    const attached = attachAuthorityResolver();
    if (attached) return Promise.resolve(attached);
    if (authorityLoadPromise) return authorityLoadPromise;
    authorityLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = AUTHORITY_SCRIPT;
      script.async = false;
      script.onload = () => {
        const resolver = attachAuthorityResolver();
        if (!resolver) reject(new Error("CivicationInstitutionAuthority lastet uten resolver"));
        else resolve(resolver);
      };
      script.onerror = () => reject(new Error(`Kunne ikke laste ${AUTHORITY_SCRIPT}`));
      (document.head || document.documentElement).appendChild(script);
    }).catch((error) => {
      authorityLoadPromise = null;
      throw error;
    });
    return authorityLoadPromise;
  }

  function attachSocialStanding() {
    const rt = runtimeWindow();
    if (rt.CivicationSocialStanding?.applyOperations) return rt.CivicationSocialStanding;
    if (rt.CivicationSocialStandingFactory?.createAdapter && rt.CivicationState?.getState && rt.CivicationState?.setState) {
      rt.CivicationSocialStanding = rt.CivicationSocialStandingFactory.createAdapter(rt.CivicationState);
      return rt.CivicationSocialStanding;
    }
    return null;
  }

  function ensureSocialStanding() {
    const attached = attachSocialStanding();
    if (attached) return Promise.resolve(attached);
    if (socialStandingLoadPromise) return socialStandingLoadPromise;
    socialStandingLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SOCIAL_STANDING_SCRIPT;
      script.async = false;
      script.onload = () => {
        const adapter = attachSocialStanding();
        if (!adapter) reject(new Error("CivicationSocialStanding lastet uten state-adapter"));
        else resolve(adapter);
      };
      script.onerror = () => reject(new Error(`Kunne ikke laste ${SOCIAL_STANDING_SCRIPT}`));
      (document.head || document.documentElement).appendChild(script);
    }).catch((error) => {
      socialStandingLoadPromise = null;
      throw error;
    });
    return socialStandingLoadPromise;
  }

  function collectWorkObjectOps(eventObj, choice) {
    const sceneOps = Array.isArray(eventObj?.effects?.work_object_ops) ? eventObj.effects.work_object_ops : [];
    const choiceOps = Array.isArray(choice?.effects?.work_object_ops) ? choice.effects.work_object_ops : [];
    return [...sceneOps, ...choiceOps];
  }

  function collectSocialStandingOps(eventObj, choice) {
    const sceneOps = Array.isArray(eventObj?.effects?.social_standing_ops) ? eventObj.effects.social_standing_ops : [];
    const choiceOps = Array.isArray(choice?.effects?.social_standing_ops) ? choice.effects.social_standing_ops : [];
    return [...sceneOps, ...choiceOps];
  }

  function makeShadowStateAdapter() {
    let shadowState = JSON.parse(JSON.stringify(window.CivicationState?.getState?.() || {}));
    return {
      getState() { return JSON.parse(JSON.stringify(shadowState)); },
      setState(patch) {
        shadowState = { ...shadowState, ...JSON.parse(JSON.stringify(patch || {})) };
        return JSON.parse(JSON.stringify(shadowState));
      }
    };
  }

  async function prepareSocialStandingConsequences(eventObj, choice) {
    const operations = collectSocialStandingOps(eventObj, choice);
    if (!operations.length) return null;
    const sceneId = normStr(eventObj?.id);
    const choiceId = normStr(choice?.id);
    if (!sceneId || !choiceId) throw new Error("social_standing_ops krever scene-id og choice-id");
    const adapter = await ensureSocialStanding();
    const factory = runtimeWindow().CivicationSocialStandingFactory;
    if (!factory?.createAdapter) throw new Error("CivicationSocialStandingFactory mangler for preflight");
    const context = { scene_id: sceneId, choice_id: choiceId, at: new Date().toISOString() };
    factory.createAdapter(makeShadowStateAdapter()).applyOperations(operations, context);
    return { adapter, operations, context };
  }

  function commitSocialStandingConsequences(prepared) {
    if (!prepared) return null;
    const applied = prepared.adapter.applyOperations(prepared.operations, prepared.context);
    const audienceIds = uniq(applied.map((entry) => entry.audience_id));
    return {
      applied_count: applied.filter((entry) => entry.idempotent !== true).length,
      event_ids: applied.map((entry) => entry.event_id),
      audience_ids: audienceIds,
      values: Object.fromEntries(audienceIds.map((id) => [id, prepared.adapter.getStanding(id)]))
    };
  }

  function makeShadowWorkWorld(adapter, factory) {
    let shadowState = { work_world: adapter.getWorldState() };
    const shadowApi = {
      getState() {
        return JSON.parse(JSON.stringify(shadowState));
      },
      setState(patch) {
        shadowState = { ...shadowState, ...JSON.parse(JSON.stringify(patch || {})) };
        return JSON.parse(JSON.stringify(shadowState));
      }
    };
    return factory.createAdapter(shadowApi);
  }

  async function applyWorkWorldConsequences(eventObj, choice) {
    const operations = collectWorkObjectOps(eventObj, choice);
    if (!operations.length) return null;

    const sceneId = normStr(eventObj?.id);
    const choiceId = normStr(choice?.id);
    if (!sceneId || !choiceId) throw new Error("work_object_ops krever scene-id og choice-id");

    const eventIds = operations.map((operation) => normStr(operation?.event_id));
    if (eventIds.some((eventId) => !eventId)) throw new Error("work_object_ops krever stabile event_id");
    if (new Set(eventIds).size !== eventIds.length) {
      throw new Error("work_object_ops kan ikke gjenbruke event_id i samme svarbatch");
    }

    const adapter = await ensureWorkWorld();
    const factory = runtimeWindow().CivicationWorkWorldFactory;
    if (!factory?.createAdapter) {
      throw new Error("CivicationWorkWorldFactory mangler for transaksjonell preflight");
    }

    const context = {
      scene_id: sceneId,
      choice_id: choiceId,
      at: new Date().toISOString()
    };
    const before = eventObj?.work_context
      ? adapter.resolveWorkContext(eventObj.work_context)
      : null;

    // Preflight hele batchen mot et isolert work-world snapshot. Ingen reell
    // Civication-state skal muteres dersom en senere operasjon er ugyldig.
    const shadow = makeShadowWorkWorld(adapter, factory);
    shadow.applyOperations(operations, context);

    const applied = adapter.applyOperations(operations, context);
    const after = eventObj?.work_context
      ? adapter.resolveWorkContext(eventObj.work_context)
      : null;

    try {
      window.dispatchEvent(new Event("updateProfile"));
    } catch {}

    return {
      applied_count: applied.length,
      operation_event_ids: eventIds,
      object_ids: applied.map((entry) => entry.work_object_id),
      work_context_before: before,
      work_context_after: after
    };
  }

  function activeCareerId() {
    return normStr((/** @type {{ career_id?: unknown }} */ (window.CivicationState?.getActivePosition?.() || {})).career_id);
  }

  function activeRoleScope() {
    const active = /** @type {{ role_scope?: unknown }} */ (window.CivicationState?.getActivePosition?.() || {});
    return normStr(window.CiviMailPlanBridge?.resolveRoleScope?.(active) || active.role_scope);
  }

  async function authorityAnswerMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const choiceId = normStr(ctx?.choiceId);
    const choice = Array.isArray(eventObj?.choices) ? eventObj.choices.find((candidate) => normStr(candidate?.id) === choiceId) : null;
    if (!choice?.authority_action) return next();
    const [resolver, workWorld] = await Promise.all([ensureAuthorityResolver(), ensureWorkWorld()]);
    const decision = resolver.evaluate(eventObj?.authority_context, choice.authority_action, { role_scope: activeRoleScope(), work_world: workWorld });
    if (!decision?.allowed) return { ok: false, reason: "authority_blocked", authority: decision || { allowed: false, reason: "authority_resolution_failed" } };
    const result = await next();
    if (result && typeof result === "object" && result.ok) result.authority = decision;
    return result;
  }

  function mergeBranchState(delta) {
    const current = /** @type {{ preferred_types?: unknown[], preferred_families?: unknown[], flags?: unknown[] }} */ (window.CivicationState?.getMailBranchState?.() || {
      preferred_types: [],
      preferred_families: [],
      flags: []
    });

    const next = {
      preferred_types: uniq([...(current.preferred_types || []), ...((delta && delta.preferred_types) || [])]).slice(-6),
      preferred_families: uniq([...(current.preferred_families || []), ...((delta && delta.preferred_families) || [])]).slice(-8),
      flags: uniq([...(current.flags || []), ...((delta && delta.flags) || [])]).slice(-16)
    };

    window.CivicationState?.setMailBranchState?.(next);
    return next;
  }

  function applyCapitalDelta(map, sourceTag) {
    const entries = Object.entries(map || {}).filter(([, amount]) => Number(amount || 0) !== 0);
    if (!entries.length) return null;

    entries.forEach(([type, amount]) => {
      window.HG_CapitalMaintenance?.maintain?.(type, Number(amount || 0), {
        source: sourceTag || "mail_consequence",
        useIdentityBoost: true
      });
    });

    return Object.fromEntries(entries);
  }

  function applyPsycheDelta(delta) {
    if (!delta) return null;

    const careerId = activeCareerId();
    const resilience = {};
    const preview = (key, value) => {
      const meta = /** @type {any} */ (window.CivicationPsyche?.applyPsycheResilienceModifier?.(Number(value || 0), window.CivicationState?.getState?.(), { metric: key, source: "day_consequence" }));
      if (meta?.applied) resilience[key] = meta;
      return meta?.adjustedDelta ?? Number(value || 0);
    };

    const adjusted = {
      integrity: preview("integrity", delta.integrity),
      visibility: preview("visibility", delta.visibility),
      economicRoom: preview("economicRoom", delta.economicRoom),
      trust: preview("trust", delta.trust)
    };

    if (Number(delta.integrity || 0)) {
      window.CivicationPsyche?.updateIntegrity?.(Number(delta.integrity || 0));
    }

    if (Number(delta.visibility || 0)) {
      window.CivicationPsyche?.updateVisibility?.(Number(delta.visibility || 0));
    }

    if (Number(delta.economicRoom || 0)) {
      window.CivicationPsyche?.updateEconomicRoom?.(Number(delta.economicRoom || 0));
    }

    if (careerId && Number(delta.trust || 0)) {
      window.CivicationPsyche?.updateTrust?.(careerId, Number(delta.trust || 0));
    }

    return {
      integrity: adjusted.integrity,
      visibility: adjusted.visibility,
      economicRoom: adjusted.economicRoom,
      trust: adjusted.trust,
      original: {
        integrity: Number(delta.integrity || 0),
        visibility: Number(delta.visibility || 0),
        economicRoom: Number(delta.economicRoom || 0),
        trust: Number(delta.trust || 0)
      },
      resilience,
      resilienceMessage: Object.keys(resilience).length ? "Psykologisk kompetanse dempet belastningen." : ""
    };
  }

  function labelHas(label, needle) {
    return normStr(label).toLowerCase().includes(String(needle || "").toLowerCase());
  }

  function inferBranchBias(eventObj, choice, result) {
    const explicit = choice?.next_bias;
    if (explicit && typeof explicit === "object") {
      return {
        preferred_types: uniq(explicit.prefer_mail_types || []),
        preferred_families: uniq(explicit.prefer_families || []),
        flags: uniq(explicit.set_flags || [])
      };
    }

    const family = normStr(eventObj?.mail_family);
    const type = normStr(eventObj?.mail_type);
    const effect = Number(choice?.effect ?? result?.effect ?? 0);
    const good = effect >= 1;

    const out = {
      preferred_types: [],
      preferred_families: [],
      flags: []
    };

    if (type) out.preferred_types.push(type);
    if (family) out.preferred_families.push(family);

    if (family === "mellomleder_rolleforstaelse") {
      out.flags.push(good ? "helhetsblikk" : "markering_foran_forstaaelse");
    }

    if (family === "mellomleder_planlegging") {
      out.flags.push(good ? "realistisk_planlegging" : "underbemannet_plan");
    }

    if (family === "sliten_nokkelperson") {
      out.flags.push(good ? "beskytter_baereevne" : "bruker_nokkelperson_hardt");
      out.preferred_types.push(good ? "story" : "conflict");
    }

    if (family === "krysspress") {
      out.flags.push(good ? "systemsannhet" : "maalstyrt_tilpasning");
      out.preferred_types.push(good ? "event" : "job");
    }

    if (family === "driftskrise") {
      out.flags.push(good ? "krisegrep" : "forsinket_styring");
    }

    if (!family && type === "job") out.flags.push(good ? "driftsansvar" : "overflatestyring");
    if (!family && type === "people") out.flags.push(good ? "lagvern" : "drift_foran_menneske");
    if (!family && type === "conflict") out.flags.push(good ? "praksis_foran_maaling" : "maal_foran_praksis");

    return {
      preferred_types: uniq(out.preferred_types),
      preferred_families: uniq(out.preferred_families),
      flags: uniq(out.flags)
    };
  }

  function inferPsycheDelta(eventObj, choice, result) {
    const effect = Number(choice?.effect ?? result?.effect ?? 0);
    const good = effect >= 1;
    const family = normStr(eventObj?.mail_family);
    const type = normStr(eventObj?.mail_type);
    const label = normStr(choice?.label);

    const delta = {
      integrity: 0,
      visibility: 0,
      economicRoom: 0,
      trust: 0
    };

    if (family === "mellomleder_rolleforstaelse") {
      delta.integrity += good ? 1 : -1;
      delta.trust += good ? 1 : 0;
      delta.visibility += good ? 0 : 1;
    }

    if (family === "mellomleder_planlegging") {
      delta.integrity += good ? 2 : -2;
      delta.economicRoom += good ? -1 : 1;
      delta.trust += good ? 1 : -1;
    }

    if (family === "mellomleder_mastery") {
      delta.integrity += good ? 2 : -2;
      delta.trust += good ? 2 : -2;
      delta.visibility += good ? 1 : 2;
    }

    if (family === "sliten_nokkelperson") {
      delta.integrity += good ? 2 : -2;
      delta.trust += good ? 3 : -3;
      delta.economicRoom += good ? -1 : 1;
    }

    if (family === "krysspress") {
      delta.integrity += good ? 2 : -3;
      delta.trust += good ? 2 : -2;
      delta.visibility += good ? -1 : 2;
      delta.economicRoom += good ? -1 : 1;
    }

    if (family === "driftskrise") {
      delta.integrity += good ? 1 : -2;
      delta.trust += good ? 2 : -2;
      delta.visibility += good ? 2 : 1;
    }

    if (!family && type === "job") {
      delta.integrity += good ? 1 : -1;
      delta.trust += good ? 1 : 0;
    }

    if (!family && type === "people") {
      delta.trust += good ? 2 : -2;
      delta.integrity += good ? 1 : -1;
    }

    if (!family && type === "conflict") {
      delta.integrity += good ? 2 : -2;
      delta.visibility += good ? -1 : 1;
    }

    if (labelHas(label, "oppover") || labelHas(label, "synlig") || labelHas(label, "kontroll")) {
      delta.visibility += good ? 1 : 2;
    }

    if (labelHas(label, "avlaste") || labelHas(label, "beskytte") || labelHas(label, "realistisk") || labelHas(label, "virkeligheten")) {
      delta.integrity += 1;
      delta.trust += 1;
    }

    return delta;
  }

  function inferCapitalDelta(eventObj, choice, result) {
    const effect = Number(choice?.effect ?? result?.effect ?? 0);
    const good = effect >= 1;
    const family = normStr(eventObj?.mail_family);
    const type = normStr(eventObj?.mail_type);

    const delta = {};
    const add = (key, amount) => {
      delta[key] = Number(delta[key] || 0) + Number(amount || 0);
    };

    if (family === "mellomleder_rolleforstaelse") {
      add("institutional", good ? 0.08 : 0.02);
      add("symbolic", good ? 0.02 : 0.05);
    }

    if (family === "mellomleder_planlegging") {
      add("institutional", good ? 0.10 : 0.03);
      add("economic", good ? -0.02 : 0.06);
    }

    if (family === "mellomleder_mastery") {
      add("institutional", good ? 0.12 : 0.04);
      add("symbolic", good ? 0.06 : 0.08);
      add("social", good ? 0.05 : -0.03);
    }

    if (family === "sliten_nokkelperson") {
      add("social", good ? 0.12 : -0.05);
      add("institutional", good ? 0.06 : 0.02);
      add("economic", good ? -0.03 : 0.04);
    }

    if (family === "krysspress") {
      add("institutional", good ? 0.10 : 0.02);
      add("political", good ? 0.04 : 0.02);
      add("symbolic", good ? 0.01 : 0.06);
    }

    if (family === "driftskrise") {
      add("institutional", good ? 0.12 : 0.03);
      add("symbolic", good ? 0.05 : 0.04);
      add("economic", good ? 0.02 : -0.04);
    }

    if (!family && type === "people") add("social", good ? 0.08 : -0.03);
    if (!family && type === "job") add("institutional", good ? 0.08 : 0.03);
    if (!family && type === "conflict") add("political", good ? 0.03 : 0.01);

    return delta;
  }

  function finishChoiceConsequences(ctx, workWorld, socialStanding) {
    const { eventObj, choice, result } = ctx;
    const roleScope = activeRoleScope();
    const hasExplicitNextBias = !!(choice?.next_bias && typeof choice.next_bias === "object");

    if (roleScope !== "mellomleder" && !hasExplicitNextBias) {
      if (!workWorld && !socialStanding) return null;
      return {
        ...(workWorld ? { work_world: workWorld } : {}),
        ...(socialStanding ? { social_standing: socialStanding } : {})
      };
    }

    const branch = mergeBranchState(inferBranchBias(eventObj, choice, result));
    const psyche = roleScope === "mellomleder"
      ? applyPsycheDelta(inferPsycheDelta(eventObj, choice, result))
      : null;
    const capital = roleScope === "mellomleder"
      ? applyCapitalDelta(
          inferCapitalDelta(eventObj, choice, result),
          `mellomleder_${normStr(eventObj.mail_family || eventObj.mail_type || "mail")}`
        )
      : null;

    let burnout = null;
    let collapse = null;

    try {
      burnout = window.CivicationPsyche?.checkBurnout?.() || null;
    } catch {}

    try {
      collapse = window.CivicationPsyche?.processCollapse?.() || null;
    } catch {}

    window.dispatchEvent(new Event("updateProfile"));

    return {
      ...(workWorld ? { work_world: workWorld } : {}),
      ...(socialStanding ? { social_standing: socialStanding } : {}),
      branch,
      psyche,
      capital,
      burnout,
      collapse
    };
  }

  function applyChoiceConsequences(ctx) {
    const { eventObj, choice } = ctx;
    if (!eventObj || !choice) return null;

    const operations = collectWorkObjectOps(eventObj, choice);
    const standingOperations = collectSocialStandingOps(eventObj, choice);
    if (!operations.length && !standingOperations.length) return finishChoiceConsequences(ctx, null, null);

    return prepareSocialStandingConsequences(eventObj, choice)
      .then(async (preparedStanding) => {
        const workWorld = operations.length ? await applyWorkWorldConsequences(eventObj, choice) : null;
        const socialStanding = commitSocialStandingConsequences(preparedStanding);
        return finishChoiceConsequences(ctx, workWorld, socialStanding);
      });
  }

  function register() {
    if (!window.CivicationChoiceDirector) return;

    window.CivicationChoiceDirector.registerAnswerMiddleware?.(
      "institutionAuthority",
      authorityAnswerMiddleware,
      25
    );
    window.CivicationChoiceDirector.registerHandler(
      "dayConsequences",
      applyChoiceConsequences,
      10
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
