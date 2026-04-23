(function () {
  "use strict";

  const PLAN_FILES = {
    naeringsliv: {
      arbeider: "data/Civication/mailPlans/naeringsliv/arbeider_plan.json",
      fagarbeider: "data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json",
      mellomleder: "data/Civication/mailPlans/naeringsliv/mellomleder_plan.json",
      formann: "data/Civication/mailPlans/naeringsliv/formann_plan.json"
    }
  };

  const FAMILY_FILES = {
    naeringsliv: {
      arbeider: {
        job: "data/Civication/mailFamilies/naeringsliv/job/arbeider_job.json",
        story: "data/Civication/mailFamilies/naeringsliv/story/arbeider_story.json",
        event: "data/Civication/mailFamilies/naeringsliv/event/arbeider_event.json",
        people: "data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json",
        conflict: "data/Civication/mailFamilies/naeringsliv/conflict/arbeider_conflict.json"
      },
      fagarbeider: {
        job: "data/Civication/mailFamilies/naeringsliv/job/fagarbeider_job.json",
        story: "data/Civication/mailFamilies/naeringsliv/story/fagarbeider_story.json",
        event: "data/Civication/mailFamilies/naeringsliv/event/fagarbeider_event.json",
        people: "data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json",
        conflict: "data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json"
      },
      mellomleder: {
        job: "data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json",
        story: "data/Civication/mailFamilies/naeringsliv/story/mellomleder_story.json",
        event: "data/Civication/mailFamilies/naeringsliv/event/mellomleder_event.json",
        people: "data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json",
        conflict: "data/Civication/mailFamilies/naeringsliv/conflict/mellomleder_conflict.json"
      },
      formann: {
        job: "data/Civication/mailFamilies/naeringsliv/job/formann_job.json",
        story: "data/Civication/mailFamilies/naeringsliv/story/formann_story.json",
        event: "data/Civication/mailFamilies/naeringsliv/event/formann_event.json",
        people: "data/Civication/mailFamilies/naeringsliv/people/formann_people.json",
        conflict: "data/Civication/mailFamilies/naeringsliv/conflict/formann_conflict.json"
      }
    }
  };

  const ROLE_SCOPE_BY_ROLE_ID = {
    naer_arbeider: "arbeider",
    naer_fagarbeider: "fagarbeider",
    naer_mellomleder: "mellomleder"
  };

  const ROLE_SCOPE_BY_TITLE = {
    arbeider: "arbeider",
    fagarbeider: "fagarbeider",
    mellomleder: "mellomleder",
    formann: "formann"
  };

  const JSON_CACHE = {};

  function normStr(v) {
    return String(v || "").trim();
  }

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  async function loadJson(path) {
    const p = normStr(path);
    if (!p) return null;
    if (JSON_CACHE[p]) return JSON_CACHE[p];

    const res = await fetch(p, { cache: "no-store" });
    if (!res.ok) return null;

    const json = await res.json();
    JSON_CACHE[p] = json;
    return json;
  }

  function resolveRoleScope(active) {
    const roleId = normStr(active?.role_id);
    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) {
      return ROLE_SCOPE_BY_ROLE_ID[roleId];
    }

    const titleKey = slugify(active?.title || "");
    if (ROLE_SCOPE_BY_TITLE[titleKey]) {
      return ROLE_SCOPE_BY_TITLE[titleKey];
    }

    return "";
  }

  function getPlanPath(active) {
    const category = normStr(active?.career_id);
    const roleScope = resolveRoleScope(active);
    return PLAN_FILES?.[category]?.[roleScope] || null;
  }

  function getFamilyPath(active, mailType) {
    const category = normStr(active?.career_id);
    const roleScope = resolveRoleScope(active);
    const mt = normStr(mailType);
    return FAMILY_FILES?.[category]?.[roleScope]?.[mt] || null;
  }

  function getConsumedMap(state) {
    return state?.consumed && typeof state.consumed === "object"
      ? state.consumed
      : {};
  }

  function normalizeChoices(choices) {
    return (Array.isArray(choices) ? choices : [])
      .filter(Boolean)
      .map((c) => ({
        id: normStr(c.id),
        label: normStr(c.label),
        effect: Number(c.effect || 0),
        tags: Array.isArray(c.tags) ? c.tags.map(normStr).filter(Boolean) : [],
        feedback: normStr(c.feedback)
      }))
      .filter((c) => c.id && c.label);
  }

  function flattenFamilyCatalog(catalog) {
    return (Array.isArray(catalog?.families) ? catalog.families : [])
      .filter(Boolean)
      .flatMap((family) => {
        const familyId = normStr(family?.id);
        return (Array.isArray(family?.mails) ? family.mails : [])
          .filter(Boolean)
          .map((mail) => ({
            ...mail,
            mail_family: normStr(mail?.mail_family || familyId),
            __family_id: familyId
          }));
      });
  }

  function buildAllowedFamilySet(step) {
    return new Set(
      (Array.isArray(step?.allowed_families) ? step.allowed_families : [])
        .map(normStr)
        .filter(Boolean)
    );
  }

  function isConsumed(mailId, consumed) {
    const id = normStr(mailId);
    return !!(id && consumed && consumed[id]);
  }

  function toMail(active, roleScope, step, mail) {
    const roleId = normStr(active?.role_id);
    const category = normStr(active?.career_id || "naeringsliv");
    const roleLabel = normStr(active?.title || roleScope);
    const mailId = normStr(mail?.id);
    const familyId = normStr(mail?.mail_family || mail?.__family_id);
    const sourceType = "planned";

    return {
      id: mailId,
      stage: normStr(mail?.stage || "stable") || "stable",
      source: normStr(mail?.source || "Civication") || "Civication",
      subject: normStr(mail?.subject),
      summary: normStr(mail?.summary),
      situation:
        Array.isArray(mail?.situation) && mail.situation.length
          ? mail.situation.map(normStr).filter(Boolean)
          : [normStr(mail?.summary)].filter(Boolean),
      mail_type: normStr(mail?.mail_type || step?.type),
      mail_family: familyId,
      mail_tags: [
        "planned_mail",
        slugify(category),
        slugify(roleScope),
        slugify(normStr(step?.type)),
        slugify(familyId),
        slugify(normStr(step?.phase))
      ].filter(Boolean),
      gating: {
        require_tags: [],
        prefer_tags: [],
        avoid_tags: [],
        prefer_tracks: [],
        require_tracks: [],
        require_track_step_min: {},
        require_story_flags: [],
        avoid_story_flags: [],
        prefer_story_flags: [],
        prefer_story_tags: []
      },
      choices: normalizeChoices(mail?.choices),
      role_content_meta: {
        role_id: roleId,
        tier_label: roleLabel,
        family_id: familyId,
        storylet_id: mailId,
        progress_tags: Array.isArray(mail?.progress_tags)
          ? mail.progress_tags.map(normStr).filter(Boolean)
          : [],
        primary_conflict: normStr(mail?.primary_conflict),
        secondary_conflict: normStr(mail?.secondary_conflict),
        capital_bias: Array.isArray(mail?.capital_bias) ? mail.capital_bias : [],
        psyche_bias: Array.isArray(mail?.psyche_bias) ? mail.psyche_bias : []
      },
      role_id: roleId,
      tier_label: roleLabel,
      career_id: category,
      source_type: sourceType,
      mail_plan_meta: {
        plan_id: normStr(step?.plan_id),
        role_scope: roleScope,
        step: Number(step?.step || 0),
        phase: normStr(step?.phase),
        type: normStr(step?.type),
        fallback_types: Array.isArray(step?.fallback_types)
          ? step.fallback_types.map(normStr).filter(Boolean)
          : []
      }
    };
  }

  async function getMailsForType(active, step, mailType, consumed) {
    const path = getFamilyPath(active, mailType);
    if (!path) return [];

    const catalog = await loadJson(path);
    if (!catalog) return [];

    const allowedFamilies = buildAllowedFamilySet(step);

    return flattenFamilyCatalog(catalog)
      .filter((mail) => {
        const familyId = normStr(mail?.mail_family || mail?.__family_id);
        if (!familyId || !allowedFamilies.has(familyId)) return false;
        if (isConsumed(mail?.id, consumed)) return false;
        return true;
      });
  }

  async function getCandidatesForStep(active, plan, step, consumed) {
    const decoratedStep = {
      ...step,
      plan_id: normStr(plan?.id)
    };

    const primaryType = normStr(step?.type);
    let mails = await getMailsForType(active, decoratedStep, primaryType, consumed);

    if (!mails.length) {
      const fallbackTypes = Array.isArray(step?.fallback_types)
        ? step.fallback_types.map(normStr).filter(Boolean)
        : [];

      for (const fallbackType of fallbackTypes) {
        mails = await getMailsForType(active, decoratedStep, fallbackType, consumed);
        if (mails.length) break;
      }
    }

    const roleScope = resolveRoleScope(active);
    return mails.map((mail) => toMail(active, roleScope, decoratedStep, mail));
  }

  async function makeCandidateMailsForActiveRole(active, state) {
    const planPath = getPlanPath(active);
    if (!planPath) return [];

    const plan = await loadJson(planPath);
    if (!plan || !Array.isArray(plan.sequence) || !plan.sequence.length) {
      return [];
    }

    const consumed = getConsumedMap(state);
    const sortedSteps = [...plan.sequence]
      .filter(Boolean)
      .sort((a, b) => Number(a?.step || 0) - Number(b?.step || 0));

    for (const step of sortedSteps) {
      const candidates = await getCandidatesForStep(active, plan, step, consumed);
      if (candidates.length) {
        return candidates;
      }
    }

    return [];
  }

  window.CiviMailPlanBridge = {
    loadJson,
    getPlanPath,
    getFamilyPath,
    resolveRoleScope,
    makeCandidateMailsForActiveRole
  };
})();
