// js/Civication/systems/civicationCareerRoleResolver.js
// Civication career role resolver
//
// Purpose:
// - Civication roles must resolve to stable role_scope ids used by mailPlans/mailFamilies.
// - Næringsliv starts on the shop floor, even if legacy badges still exist in data/badges.json.
// - This adapter applies a Civication-specific Næringsliv ladder and makes the mail runtime find the right plan.

(function () {
  "use strict";

  const PATCHED_FLAG = "__civicationCareerRoleResolverPatched";

  const NAERINGSLIV_TIERS = [
    { label: "Ekspeditør / butikkmedarbeider", threshold: 1, role_scope: "ekspeditor", role_id: "naer_ekspeditor" },
    { label: "Erfaren butikkmedarbeider", threshold: 2, role_scope: "erfaren_butikkmedarbeider", role_id: "naer_erfaren_butikkmedarbeider" },
    { label: "Vareansvarlig / områdeansvarlig", threshold: 3, role_scope: "vareansvarlig", role_id: "naer_vareansvarlig" },
    { label: "Skiftansvarlig", threshold: 20, role_scope: "skiftansvarlig", role_id: "naer_skiftansvarlig" },
    { label: "Fagarbeider salg/service", threshold: 35, role_scope: "fagarbeider_salg_service", role_id: "naer_fagarbeider_salg_service" },
    { label: "Assisterende leder", threshold: 50, role_scope: "assisterende_leder", role_id: "naer_assisterende_leder" },
    { label: "Mellomleder", threshold: 70, role_scope: "mellomleder", role_id: "naer_mellomleder" },
    { label: "Driftsleder / formann", threshold: 90, role_scope: "driftsleder_formann", role_id: "naer_driftsleder_formann" },
    { label: "Daglig leder", threshold: 110, role_scope: "daglig_leder", role_id: "naer_daglig_leder" },
    { label: "Gründer", threshold: 140, role_scope: "grunder", role_id: "naer_grunder" },
    { label: "Bedriftseier", threshold: 180, role_scope: "bedriftseier", role_id: "naer_bedriftseier" },
    { label: "Konsernsjef (CEO)", threshold: 230, role_scope: "konsernsjef", role_id: "naer_konsernsjef" },
    { label: "Konserndirektør", threshold: 300, role_scope: "konserndirektor", role_id: "naer_konserndirektor" },
    { label: "Industribygger", threshold: 400, role_scope: "industribygger", role_id: "naer_industribygger" },
    { label: "Investor", threshold: 550, role_scope: "investor", role_id: "naer_investor" },
    { label: "Industrimagnat", threshold: 750, role_scope: "industrimagnat", role_id: "naer_industrimagnat" }
  ];

  const ROLE_ALIASES = {
    arbeider: "ekspeditor",
    ekspeditor: "ekspeditor",
    butikkmedarbeider: "ekspeditor",
    ekspeditor_butikkmedarbeider: "ekspeditor",
    naer_arbeider: "ekspeditor",
    naer_ekspeditor: "ekspeditor",

    fagarbeider: "fagarbeider_salg_service",
    fagarbeider_salg_service: "fagarbeider_salg_service",
    naer_fagarbeider: "fagarbeider_salg_service",
    naer_fagarbeider_salg_service: "fagarbeider_salg_service",

    mellomleder: "mellomleder",
    naer_mellomleder: "mellomleder",

    formann: "driftsleder_formann",
    arbeidsleder: "driftsleder_formann",
    formann_arbeidsleder: "driftsleder_formann",
    driftsleder_formann: "driftsleder_formann",
    naer_formann: "driftsleder_formann",
    naer_driftsleder_formann: "driftsleder_formann",

    erfaren_butikkmedarbeider: "erfaren_butikkmedarbeider",
    naer_erfaren_butikkmedarbeider: "erfaren_butikkmedarbeider",

    vareansvarlig: "vareansvarlig",
    omradeansvarlig: "vareansvarlig",
    vareansvarlig_omradeansvarlig: "vareansvarlig",
    naer_vareansvarlig: "vareansvarlig",

    skiftansvarlig: "skiftansvarlig",
    naer_skiftansvarlig: "skiftansvarlig",

    assisterende_leder: "assisterende_leder",
    nestleder: "assisterende_leder",
    naer_assisterende_leder: "assisterende_leder"
  };

  // Temporary content fallback until every floor role has its own full mail package.
  // This prevents badge offers from resolving to empty inboxes.
  const MAIL_CONTENT_SCOPE_FALLBACK = {
    erfaren_butikkmedarbeider: "ekspeditor",
    vareansvarlig: "ekspeditor",
    skiftansvarlig: "ekspeditor",
    fagarbeider_salg_service: "fagarbeider",
    assisterende_leder: "mellomleder",
    driftsleder_formann: "formann"
  };

  const NATIVE_RUNTIME_SCOPES = new Set(["arbeider", "fagarbeider", "mellomleder", "formann"]);

  function norm(value) {
    return String(value || "").trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
  }

  function resolveRoleScope(activeOrTitle, maybeCareerId) {
    const active = activeOrTitle && typeof activeOrTitle === "object" ? activeOrTitle : null;
    const careerId = norm(active?.career_id || maybeCareerId);
    const candidates = active
      ? [active.role_scope, active.role_key, active.role_id, active.title]
      : [activeOrTitle];

    for (const raw of candidates) {
      const key = slugify(raw);
      if (!key) continue;
      if (careerId === "naeringsliv" && ROLE_ALIASES[key]) return ROLE_ALIASES[key];
      if (ROLE_ALIASES[key]) return ROLE_ALIASES[key];
    }

    const fallback = slugify(active?.role_key || active?.title || activeOrTitle);
    return ROLE_ALIASES[fallback] || fallback;
  }

  function resolveContentScope(activeOrTitle, maybeCareerId) {
    const roleScope = resolveRoleScope(activeOrTitle, maybeCareerId);
    return MAIL_CONTENT_SCOPE_FALLBACK[roleScope] || roleScope;
  }

  function resolveRoleMeta(activeOrTitle, maybeCareerId) {
    const active = activeOrTitle && typeof activeOrTitle === "object" ? activeOrTitle : null;
    const careerId = norm(active?.career_id || maybeCareerId);
    const roleScope = resolveRoleScope(activeOrTitle, maybeCareerId);
    const contentScope = resolveContentScope(activeOrTitle, maybeCareerId);
    const tier = careerId === "naeringsliv"
      ? NAERINGSLIV_TIERS.find(row => row.role_scope === roleScope) || null
      : null;

    return {
      role_scope: roleScope,
      content_scope: contentScope,
      role_key: roleScope,
      role_id: tier?.role_id || (careerId === "naeringsliv" ? `naer_${roleScope}` : roleScope),
      label: tier?.label || norm(active?.title || activeOrTitle)
    };
  }

  function applyBadgeOverrides() {
    if (!Array.isArray(window.BADGES)) return false;

    const badge = window.BADGES.find(row => norm(row?.id) === "naeringsliv");
    if (!badge) return false;

    badge.tiers = NAERINGSLIV_TIERS.map(row => ({
      label: row.label,
      threshold: row.threshold
    }));

    badge.civication_role_ladder = NAERINGSLIV_TIERS.map(row => ({
      label: row.label,
      threshold: row.threshold,
      role_scope: row.role_scope,
      role_id: row.role_id,
      content_scope: MAIL_CONTENT_SCOPE_FALLBACK[row.role_scope] || row.role_scope
    }));

    return true;
  }

  function patchEnsureBadgesLoaded() {
    const original = window.ensureBadgesLoaded;
    if (typeof original !== "function" || original.__careerRoleResolverPatched) return false;

    const wrapped = async function careerRoleEnsureBadgesLoaded() {
      const result = await original.apply(this, arguments);
      applyBadgeOverrides();
      return result;
    };

    wrapped.__careerRoleResolverPatched = true;
    window.ensureBadgesLoaded = wrapped;
    return true;
  }

  function normalizeOffer(offer) {
    if (!offer || norm(offer.career_id) !== "naeringsliv") return offer;
    const meta = resolveRoleMeta(offer.title, "naeringsliv");
    return {
      ...offer,
      title: meta.label || offer.title,
      role_scope: meta.role_scope,
      content_scope: meta.content_scope,
      role_key: meta.role_key,
      role_id: meta.role_id
    };
  }

  function patchJobs() {
    const jobs = window.CivicationJobs;
    if (!jobs || jobs.__careerRoleResolverPatched) return false;

    const originalPushOffer = jobs.pushOffer;
    if (typeof originalPushOffer === "function") {
      jobs.pushOffer = function careerRolePushOffer(offer) {
        return originalPushOffer.call(this, normalizeOffer(offer));
      };
    }

    const originalAcceptOffer = jobs.acceptOffer;
    if (typeof originalAcceptOffer === "function") {
      jobs.acceptOffer = function careerRoleAcceptOffer(offerKey) {
        const result = originalAcceptOffer.call(this, offerKey);
        if (result?.ok) {
          const active = window.CivicationState?.getActivePosition?.() || null;
          if (active && norm(active.career_id) === "naeringsliv") {
            const meta = resolveRoleMeta(active, "naeringsliv");
            window.CivicationState?.setActivePosition?.({
              ...active,
              title: meta.label || active.title,
              role_scope: meta.role_scope,
              content_scope: meta.content_scope,
              role_key: meta.role_key,
              role_id: meta.role_id
            });
          }
        }
        return result;
      };
    }

    jobs.__careerRoleResolverPatched = true;
    return true;
  }

  async function loadJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  }

  function getPlanPath(active) {
    const category = norm(active?.career_id);
    const contentScope = resolveContentScope(active);
    if (!category || !contentScope) return null;
    return `data/Civication/mailPlans/${category}/${contentScope}_plan.json`;
  }

  function getFamilyPaths(active) {
    const category = norm(active?.career_id);
    const contentScope = resolveContentScope(active);
    if (!category || !contentScope) return [];
    return [
      `data/Civication/mailFamilies/${category}/job/${contentScope}_intro_v2.json`,
      `data/Civication/mailFamilies/${category}/job/${contentScope}_job.json`,
      `data/Civication/mailFamilies/${category}/faction_choice/${contentScope}_faction_choice.json`,
      `data/Civication/mailFamilies/${category}/people/${contentScope}_people.json`,
      `data/Civication/mailFamilies/${category}/story/${contentScope}_story.json`,
      `data/Civication/mailFamilies/${category}/conflict/${contentScope}_conflict.json`,
      `data/Civication/mailFamilies/${category}/event/${contentScope}_event.json`
    ];
  }

  function flattenCatalog(catalog) {
    const out = [];
    const catalogType = norm(catalog?.mail_type);
    const families = Array.isArray(catalog?.families) ? catalog.families : [];

    for (const family of families) {
      const familyId = norm(family?.id);
      const mails = Array.isArray(family?.mails) ? family.mails : [];
      for (const mail of mails) {
        const id = norm(mail?.id);
        if (!id) continue;
        out.push({
          ...mail,
          id,
          mail_type: norm(mail.mail_type || catalogType || "job"),
          mail_family: norm(mail.mail_family || familyId),
          category: norm(catalog?.category),
          source_role_scope: norm(mail.role_scope || catalog?.role_scope)
        });
      }
    }

    return out;
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function getConsumedIds(state) {
    const runtime = state.mail_runtime_v1 && typeof state.mail_runtime_v1 === "object" ? state.mail_runtime_v1 : {};
    return new Set(uniqueStrings([
      ...Object.keys(state.consumed || {}),
      ...(Array.isArray(runtime.consumed_ids) ? runtime.consumed_ids : [])
    ]));
  }

  function getRuntimeForPlan(state, plan) {
    const runtime = state.mail_runtime_v1 && typeof state.mail_runtime_v1 === "object" ? state.mail_runtime_v1 : {};
    const planId = norm(plan?.id);
    const samePlan = planId && norm(runtime.role_plan_id) === planId;
    return {
      step_index: samePlan ? Math.max(0, Number(runtime.step_index || 0)) : 0,
      history: samePlan && Array.isArray(runtime.history) ? runtime.history : []
    };
  }

  function normalizeChoices(choices) {
    return (Array.isArray(choices) ? choices : [])
      .map(choice => ({
        ...choice,
        id: norm(choice?.id),
        label: norm(choice?.label),
        effect: Number(choice?.effect || 0),
        tags: Array.isArray(choice?.tags) ? choice.tags.map(norm).filter(Boolean) : [],
        feedback: norm(choice?.feedback)
      }))
      .filter(choice => choice.id && choice.label);
  }

  function toRuntimeMail(active, plan, step, mail, stepIndex) {
    const meta = resolveRoleMeta(active);
    const mailType = norm(mail.mail_type || step?.type || "job");
    const family = norm(mail.mail_family);
    return {
      ...mail,
      id: norm(mail.id),
      source: norm(mail.source || "Civication"),
      source_type: "planned",
      stage: norm(mail.stage || "stable") || "stable",
      subject: norm(mail.subject),
      summary: norm(mail.summary),
      situation: Array.isArray(mail.situation) ? mail.situation.map(norm).filter(Boolean) : [norm(mail.summary)].filter(Boolean),
      choices: normalizeChoices(mail.choices),
      role_id: meta.role_id,
      career_id: norm(active?.career_id),
      tier_label: meta.label || norm(active?.title),
      role_scope: meta.role_scope,
      content_scope: meta.content_scope,
      source_role_scope: norm(mail.source_role_scope || mail.role_scope),
      mail_type: mailType,
      mail_family: family,
      phase: norm(mail.phase || step?.phase || "intro"),
      role_content_meta: {
        ...(mail.role_content_meta || {}),
        role_id: meta.role_id,
        role_scope: meta.role_scope,
        content_scope: meta.content_scope,
        source_role_scope: norm(mail.source_role_scope || mail.role_scope),
        plan_id: norm(plan.id),
        plan_step: Number(step?.step || 0),
        plan_step_index: stepIndex,
        family_id: family,
        storylet_id: norm(mail.id)
      },
      mail_plan_meta: {
        plan_id: norm(plan.id),
        role_scope: meta.role_scope,
        content_scope: meta.content_scope,
        step: Number(step?.step || 0),
        step_index: stepIndex,
        phase: norm(step?.phase),
        type: norm(step?.type),
        fallback_types: Array.isArray(step?.fallback_types) ? step.fallback_types.map(norm).filter(Boolean) : []
      },
      mail_tags: uniqueStrings([
        "planned_mail",
        norm(active?.career_id),
        meta.role_scope,
        meta.content_scope,
        mailType,
        family,
        norm(step?.phase)
      ])
    };
  }

  async function makeCandidateMailsForActiveRole(active, state) {
    if (!active || norm(active.career_id) !== "naeringsliv") return [];

    const roleScope = resolveRoleScope(active);
    const contentScope = resolveContentScope(active);
    if (NATIVE_RUNTIME_SCOPES.has(roleScope) && contentScope === roleScope) return [];

    const planPath = getPlanPath(active);
    const plan = await loadJson(planPath);
    if (!plan || !Array.isArray(plan.sequence) || !plan.sequence.length) return [];

    const catalogs = [];
    for (const path of getFamilyPaths(active)) {
      const json = await loadJson(path).catch(() => null);
      if (json) catalogs.push(json);
    }

    const mails = catalogs.flatMap(flattenCatalog);
    if (!mails.length) return [];

    const runtime = getRuntimeForPlan(state || getState(), plan);
    const consumed = getConsumedIds(state || getState());
    const stepIndex = Math.min(runtime.step_index, plan.sequence.length - 1);
    const step = plan.sequence[stepIndex] || plan.sequence[0];
    const wantedType = norm(step?.type);
    const allowed = new Set((Array.isArray(step?.allowed_families) ? step.allowed_families : []).map(norm).filter(Boolean));

    function candidatesFor(type, strictFamily) {
      return mails
        .filter(mail => {
          if (!mail.id || consumed.has(mail.id)) return false;
          if (type && norm(mail.mail_type) !== type) return false;
          if (strictFamily && allowed.size && !allowed.has(norm(mail.mail_family))) return false;
          return true;
        })
        .map(mail => toRuntimeMail(active, plan, step, mail, stepIndex));
    }

    let out = candidatesFor(wantedType, true);

    if (!out.length) {
      const fallbacks = Array.isArray(step?.fallback_types) ? step.fallback_types.map(norm).filter(Boolean) : [];
      for (const type of fallbacks) {
        out = candidatesFor(type, true);
        if (out.length) break;
        out = candidatesFor(type, false);
        if (out.length) break;
      }
    }

    if (!out.length) out = candidatesFor(null, false);

    return out;
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto[PATCHED_FLAG]) return false;

    const originalBuildMailPool = proto.buildMailPool;
    if (typeof originalBuildMailPool === "function") {
      proto.buildMailPool = async function careerRoleBuildMailPool(active, state, roleKey) {
        const resolvedActive = active || window.CivicationState?.getActivePosition?.() || null;
        const candidates = await makeCandidateMailsForActiveRole(resolvedActive, state || getState());
        if (candidates.length) {
          return {
            role: norm(resolvedActive?.career_id),
            tag_rules: { max_tags_per_choice: 2, memory_window: 12 },
            tracks: [],
            mails: candidates,
            __civication_mail_runtime: true,
            __career_role_resolver_runtime: true,
            __runtime_candidate_count: candidates.length
          };
        }
        return await originalBuildMailPool.call(this, active, state, roleKey);
      };
    }

    const originalAnswer = proto.answer;
    if (typeof originalAnswer === "function") {
      proto.answer = async function careerRoleAnswer(eventId, choiceId) {
        const pending = typeof this.getPendingEvent === "function" ? this.getPendingEvent() : null;
        const eventObj = pending?.event || null;
        const result = await originalAnswer.call(this, eventId, choiceId);

        if (eventObj && norm(eventObj.source_type) === "planned" && norm(eventObj.career_id) === "naeringsliv") {
          const state = getState();
          const meta = resolveRoleMeta(window.CivicationState?.getActivePosition?.() || eventObj, "naeringsliv");
          if (state.mail_runtime_v1 && typeof state.mail_runtime_v1 === "object") {
            window.CivicationState?.setState?.({
              mail_runtime_v1: {
                ...state.mail_runtime_v1,
                role_scope: meta.role_scope,
                content_scope: meta.content_scope
              }
            });
          }
        }

        return result;
      };
    }

    proto[PATCHED_FLAG] = true;
    proto.__civicationCareerRoleResolverPatchedAt = new Date().toISOString();
    return true;
  }

  function patchActivePosition() {
    const state = window.CivicationState;
    if (!state || state.__careerRoleResolverStatePatched) return false;

    const originalSetActivePosition = state.setActivePosition;
    if (typeof originalSetActivePosition === "function") {
      state.setActivePosition = function careerRoleSetActivePosition(position) {
        if (position && norm(position.career_id) === "naeringsliv") {
          const meta = resolveRoleMeta(position, "naeringsliv");
          return originalSetActivePosition.call(this, {
            ...position,
            title: meta.label || position.title,
            role_scope: meta.role_scope,
            content_scope: meta.content_scope,
            role_key: meta.role_key,
            role_id: meta.role_id
          });
        }
        return originalSetActivePosition.call(this, position);
      };
    }

    state.__careerRoleResolverStatePatched = true;
    return true;
  }

  function boot() {
    applyBadgeOverrides();
    patchEnsureBadgesLoaded();
    patchActivePosition();
    patchJobs();
    patchEventEngine();
  }

  function inspect() {
    const active = window.CivicationState?.getActivePosition?.() || null;
    return {
      active,
      resolved: active ? resolveRoleMeta(active) : null,
      badge_override_applied: applyBadgeOverrides(),
      jobs_patched: window.CivicationJobs?.__careerRoleResolverPatched === true,
      state_patched: window.CivicationState?.__careerRoleResolverStatePatched === true,
      event_engine_patched: window.CivicationEventEngine?.prototype?.[PATCHED_FLAG] === true,
      naeringsliv_tiers: NAERINGSLIV_TIERS.map(row => ({
        label: row.label,
        threshold: row.threshold,
        role_scope: row.role_scope,
        content_scope: MAIL_CONTENT_SCOPE_FALLBACK[row.role_scope] || row.role_scope
      }))
    };
  }

  window.CivicationCareerRoleResolver = {
    boot,
    inspect,
    slugify,
    resolveRoleScope,
    resolveContentScope,
    resolveRoleMeta,
    applyBadgeOverrides,
    makeCandidateMailsForActiveRole,
    NAERINGSLIV_TIERS,
    MAIL_CONTENT_SCOPE_FALLBACK
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
