(function () {
  "use strict";

  const PLAN_FILES = {
    naeringsliv: {
      ekspeditor: "data/Civication/mailPlans/naeringsliv/ekspeditor_plan.json",
      arbeider: "data/Civication/mailPlans/naeringsliv/arbeider_plan.json",
      fagarbeider: "data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json",
      mellomleder: "data/Civication/mailPlans/naeringsliv/mellomleder_plan.json",
      formann: "data/Civication/mailPlans/naeringsliv/formann_plan.json"
    }
  };

  const FAMILY_FILES = {
    naeringsliv: {
      ekspeditor: {
        job: "data/Civication/mailFamilies/naeringsliv/job/ekspeditor_job.json",
        brand: [
          "data/Civication/mailFamilies/naeringsliv/brand/ekspeditor_norli.json",
          "data/Civication/mailFamilies/naeringsliv/brand/ekspeditor_narvesen.json"
        ],
        story: "data/Civication/mailFamilies/naeringsliv/story/ekspeditor_story.json",
        event: "data/Civication/mailFamilies/naeringsliv/event/ekspeditor_event.json",
        people: "data/Civication/mailFamilies/naeringsliv/people/ekspeditor_people.json",
        conflict: "data/Civication/mailFamilies/naeringsliv/conflict/ekspeditor_conflict.json"
      },
      arbeider: {
        job: [
          "data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json",
          "data/Civication/mailFamilies/naeringsliv/job/arbeider_job.json"
        ],
        story: "data/Civication/mailFamilies/naeringsliv/story/arbeider_story.json",
        event: "data/Civication/mailFamilies/naeringsliv/event/arbeider_event.json",
        people: "data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json",
        conflict: "data/Civication/mailFamilies/naeringsliv/conflict/arbeider_conflict.json"
      },
      fagarbeider: {
        job: [
          "data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json",
          "data/Civication/mailFamilies/naeringsliv/job/fagarbeider_job.json"
        ],
        story: "data/Civication/mailFamilies/naeringsliv/story/fagarbeider_story.json",
        event: "data/Civication/mailFamilies/naeringsliv/event/fagarbeider_event.json",
        people: "data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json",
        conflict: "data/Civication/mailFamilies/naeringsliv/conflict/fagarbeider_conflict.json"
      },
      mellomleder: {
        job: [
          "data/Civication/mailFamilies/naeringsliv/job/mellomleder_intro_v2.json",
          "data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json"
        ],
        faction_choice: "data/Civication/mailFamilies/naeringsliv/faction_choice/mellomleder_faction_choice.json",
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
    naer_ekspeditor: "ekspeditor",
    naer_arbeider: "arbeider",
    naer_fagarbeider: "fagarbeider",
    naer_mellomleder: "mellomleder",
    naer_formann: "formann"
  };

  const ROLE_SCOPE_BY_TITLE = {
    ekspeditor: "ekspeditor",
    butikkmedarbeider: "ekspeditor",
    ekspeditor_butikkmedarbeider: "ekspeditor",
    arbeider: "arbeider",
    lager_og_driftsmedarbeider: "arbeider",
    fagarbeider: "fagarbeider",
    skiftleder: "formann",
    formann: "formann",
    arbeidsleder: "formann",
    formann_arbeidsleder: "formann",
    okonomi_og_administrasjonsmedarbeider: "mellomleder",
    controller: "mellomleder",
    avdelingsleder: "mellomleder",
    driftsleder: "mellomleder",
    finansanalytiker: "mellomleder",
    produksjonsleder: "mellomleder",
    butikksjef_enhetsleder: "mellomleder",
    okonomi_og_finanssjef: "mellomleder",
    daglig_leder: "mellomleder",
    finansdirektor: "mellomleder",
    grunder: "mellomleder",
    bedriftseier: "mellomleder",
    konserndirektor: "mellomleder",
    konsernsjef: "mellomleder",
    investor: "mellomleder",
    kapitalforvalter: "mellomleder",
    industribygger: "mellomleder",
    industrieier: "mellomleder"
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

  function runtimeOwnsPlanProgress() {
    const proto = window.CivicationEventEngine?.prototype;
    if (proto?.__civicationMailRuntimePatched === true) return true;

    try {
      return window.CivicationMailRuntime?.inspect?.()?.patched === true;
    } catch {
      return false;
    }
  }

  function resolveRoleScope(active) {
    const externalResolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof externalResolver === "function") {
      const resolved = normStr(externalResolver(active));
      if (resolved && resolved !== "unknown") return resolved;
    }

    const roleId = normStr(active?.role_id);
    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];

    const titleKey = slugify(active?.title || "");
    if (ROLE_SCOPE_BY_TITLE[titleKey]) return ROLE_SCOPE_BY_TITLE[titleKey];

    return "";
  }

  function getPlanPath(active) {
    const category = normStr(active?.career_id);
    const roleScope = resolveRoleScope(active);
    return PLAN_FILES?.[category]?.[roleScope] || null;
  }

  function getFamilyPath(active, mailType) {
    const paths = getFamilyPaths(active, mailType);
    return paths[0] || null;
  }

  function getFamilyPaths(active, mailType) {
    const category = normStr(active?.career_id);
    const roleScope = resolveRoleScope(active);
    const mt = normStr(mailType);
    const value = FAMILY_FILES?.[category]?.[roleScope]?.[mt] || null;
    if (Array.isArray(value)) return value.map(normStr).filter(Boolean);
    return normStr(value) ? [normStr(value)] : [];
  }

  function getConsumedMap(state) {
    return state?.consumed && typeof state.consumed === "object" ? state.consumed : {};
  }

  function getPlanProgress(state) {
    const progress = state?.mail_plan_progress && typeof state.mail_plan_progress === "object" ? state.mail_plan_progress : {};
    return {
      role_plan_id: normStr(progress.role_plan_id),
      step_index: Number(progress.step_index || 0),
      current_step_type: normStr(progress.current_step_type)
    };
  }

  function setPlanProgress(plan, step) {
    if (runtimeOwnsPlanProgress()) {
      return getPlanProgress(window.CivicationState?.getState?.() || {});
    }

    const next = {
      role_plan_id: normStr(plan?.id),
      step_index: Math.max(0, Number(step?.step || 0) - 1),
      current_step_type: normStr(step?.type)
    };
    window.CivicationState?.setState?.({ mail_plan_progress: next });
    return next;
  }

  function advancePlanProgress(plan) {
    const state = window.CivicationState?.getState?.() || {};
    const current = getPlanProgress(state);

    if (runtimeOwnsPlanProgress()) {
      return current;
    }

    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    if (!sequence.length) return current;
    const nextIndex = Math.min(sequence.length - 1, Math.max(0, Number(current.step_index || 0)) + 1);
    const nextStep = sequence[nextIndex] || sequence[sequence.length - 1] || null;
    if (!nextStep) return current;
    return setPlanProgress(plan, nextStep);
  }

  function getCurrentStep(plan, state) {
    const sequence = Array.isArray(plan?.sequence) ? plan.sequence : [];
    if (!sequence.length) return null;
    const progress = getPlanProgress(state);
    const samePlan = progress.role_plan_id && progress.role_plan_id === normStr(plan?.id);
    const idx = samePlan ? Math.max(0, Number(progress.step_index || 0)) : 0;
    return sequence[Math.min(idx, sequence.length - 1)] || sequence[0] || null;
  }

  function getBranchState(state) {
    const branch = state?.mail_branch_state && typeof state.mail_branch_state === "object" ? state.mail_branch_state : {};
    return {
      preferred_types: Array.isArray(branch.preferred_types) ? branch.preferred_types.map(normStr).filter(Boolean) : [],
      preferred_families: Array.isArray(branch.preferred_families) ? branch.preferred_families.map(normStr).filter(Boolean) : [],
      flags: Array.isArray(branch.flags) ? branch.flags.map(normStr).filter(Boolean) : []
    };
  }

  function getNpcReactionState() {
    const api = window.CivicationNpcReactions;
    if (!api || typeof api.getLatest !== "function") return [];
    const latest = api.getLatest(6);
    return Array.isArray(latest) ? latest : [];
  }

  function getNpcCharacterState() {
    const api = window.CivicationNpcCharacterThreads;
    if (!api || typeof api.getActiveCharacters !== "function") return [];
    const chars = api.getActiveCharacters();
    return Array.isArray(chars) ? chars : [];
  }

  function getPsycheState(active) {
    const careerId = normStr(active?.career_id);
    const snap = window.CivicationPsyche?.getSnapshot?.(careerId) || null;
    return snap && typeof snap === "object" ? snap : {};
  }

  function getCapitalState() {
    try {
      const raw = JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
      return raw && typeof raw === "object" ? raw : {};
    } catch {
      return {};
    }
  }

  function buildWorldState(active, state) {
    return {
      active,
      branch: getBranchState(state),
      npcReactions: getNpcReactionState(),
      npcCharacters: getNpcCharacterState(),
      psyche: getPsycheState(active),
      capital: getCapitalState()
    };
  }

  function normalizeChoices(choices) {
    return (Array.isArray(choices) ? choices : [])
      .filter(Boolean)
      .map((c) => {
        const out = {
          ...c,
          id: normStr(c.id),
          label: normStr(c.label),
          effect: Number(c.effect || 0),
          tags: Array.isArray(c.tags) ? c.tags.map(normStr).filter(Boolean) : [],
          feedback: normStr(c.feedback),
          next_bias: c?.next_bias && typeof c.next_bias === "object"
            ? {
                prefer_mail_types: Array.isArray(c.next_bias.prefer_mail_types) ? c.next_bias.prefer_mail_types.map(normStr).filter(Boolean) : [],
                prefer_families: Array.isArray(c.next_bias.prefer_families) ? c.next_bias.prefer_families.map(normStr).filter(Boolean) : [],
                set_flags: Array.isArray(c.next_bias.set_flags) ? c.next_bias.set_flags.map(normStr).filter(Boolean) : []
              }
            : null
        };

        const reply = normStr(c.reply);
        const threadId = normStr(c.triggers_on_choice);
        if (reply) out.reply = reply;
        else delete out.reply;
        if (threadId) out.triggers_on_choice = threadId;
        else delete out.triggers_on_choice;

        return out;
      })
      .filter((c) => c.id && c.label);
  }

  function flattenFamilyCatalog(catalog) {
    return (Array.isArray(catalog?.families) ? catalog.families : [])
      .filter(Boolean)
      .flatMap((family) => {
        const familyId = normStr(family?.id);
        return (Array.isArray(family?.mails) ? family.mails : [])
          .filter(Boolean)
          .map((mail) => ({ ...mail, mail_family: normStr(mail?.mail_family || familyId), __family_id: familyId }));
      });
  }

  function buildAllowedFamilySet(step) {
    return new Set((Array.isArray(step?.allowed_families) ? step.allowed_families : []).map(normStr).filter(Boolean));
  }

  function isConsumed(mailId, consumed) {
    const id = normStr(mailId);
    return !!(id && consumed && consumed[id]);
  }

  function scoreBranchComponent(mail, worldState) {
    let score = 0;
    const type = normStr(mail?.mail_type);
    const family = normStr(mail?.mail_family || mail?.__family_id);
    const mailFlags = Array.isArray(mail?.branch_flags) ? mail.branch_flags.map(normStr).filter(Boolean) : [];
    const branch = worldState?.branch || { preferred_types: [], preferred_families: [], flags: [] };

    if (branch.preferred_types.includes(type)) score += 10;
    if (branch.preferred_families.includes(family)) score += 20;
    if (branch.flags.length && mailFlags.length) {
      branch.flags.forEach((flag) => {
        if (mailFlags.includes(flag)) score += 5;
      });
    }
    return score;
  }

  function scoreNpcReactionComponent(mail, worldState) {
    const npcReactions = worldState?.npcReactions || [];
    if (!Array.isArray(npcReactions) || !npcReactions.length) return 0;

    const family = normStr(mail?.mail_family || mail?.__family_id);
    const type = normStr(mail?.mail_type);
    let score = 0;

    npcReactions.forEach((reaction) => {
      const trustDelta = Number(reaction?.trustDelta || 0);
      const title = normStr(reaction?.title).toLowerCase();
      const line = normStr(reaction?.line).toLowerCase();

      if (trustDelta > 0) {
        if (family === "sliten_nokkelperson") score += 8;
        if (family === "mellomleder_identitet") score += 6;
        if (family === "driftskrise") score += 4;
        if (type === "story") score += 2;
      }

      if (trustDelta < 0) {
        if (family === "krysspress") score += 8;
        if (family === "sliten_nokkelperson") score += 4;
        if (type === "conflict") score += 3;
      }

      if ((title.includes("mål") || line.includes("målbare") || line.includes("systemet")) && family === "krysspress") score += 5;
      if ((title.includes("slitasje") || line.includes("slitasje") || line.includes("bæreevne")) && family === "sliten_nokkelperson") score += 6;
      if (title.includes("styring") || line.includes("kontroll") || line.includes("rattet")) {
        if (family === "driftskrise") score += 5;
        if (family === "mellomleder_mastery") score += 5;
      }
    });

    return score;
  }

  function resolveCharacterTone(mail, worldState) {
    const chars = worldState?.npcCharacters || [];
    if (!Array.isArray(chars) || !chars.length) return null;

    const family = normStr(mail?.mail_family || mail?.__family_id);
    const peopleRef = normStr(mail?.people_ref);

    const ranked = chars
      .map((char) => {
        const charId = normStr(char?.id);
        const trustScore = Number(char?.trust_score || 0);
        const appearances = Number(char?.appearances || 0);
        const status = normStr(char?.status || "ustabil");
        const focusFamilies = Array.isArray(char?.focus_families) ? char.focus_families.map(normStr).filter(Boolean) : [];
        const established = appearances >= 2 || Math.abs(trustScore) >= 3;
        if (!established) return null;

        let score = 0;
        if (peopleRef && peopleRef === charId) score += 24;
        if (focusFamilies.includes(family)) score += 16;
        score += Math.min(8, appearances * 2);
        score += Math.min(8, Math.abs(trustScore) * 2);

        if (score < 12) return null;

        let tone = "spent";
        if (status === "alliert" || trustScore >= 3) tone = "støttende";
        if (status === "motspiller" || trustScore <= -3) tone = "kritisk";
        if (status === "ustabil" && Math.abs(trustScore) >= 2) tone = "ambivalent";

        return {
          score,
          character_id: charId,
          character_name: normStr(char?.name),
          status,
          trust_score: trustScore,
          appearances,
          tone,
          reason: peopleRef && peopleRef === charId ? "people_ref" : "focus_family"
        };
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

    return ranked[0] || null;
  }

  function buildToneVariant(mail, toneContext) {
    if (!toneContext) return null;

    const name = normStr(toneContext.character_name || "Denne personen");
    const tone = normStr(toneContext.tone || "spent");
    const subject = normStr(mail?.subject);
    const base = Array.isArray(mail?.situation) ? mail.situation.map(normStr).filter(Boolean) : [];

    let intro = `${name} preger hvordan denne situasjonen lander.`;

    if (tone === "støttende") {
      intro = `${name} kjenner igjen dilemmaet og møter deg med en viss tillit.`;
    } else if (tone === "kritisk") {
      intro = `${name} leser situasjonen med skepsis og legger press på valget ditt.`;
    } else if (tone === "ambivalent") {
      intro = `${name} er ikke sikker på om du kommer til å bære dette riktig.`;
    } else if (tone === "spent") {
      intro = `${name} følger med, og det gjør situasjonen mer ladet.`;
    }

    return {
      tone,
      character_id: normStr(toneContext.character_id),
      character_name: name,
      subject,
      situation: [intro, ...base],
      intro
    };
  }

  function scoreNpcCharacterComponent(mail, worldState) {
    const chars = worldState?.npcCharacters || [];
    if (!Array.isArray(chars) || !chars.length) return 0;

    const family = normStr(mail?.mail_family || mail?.__family_id);
    const type = normStr(mail?.mail_type);
    const peopleRef = normStr(mail?.people_ref);
    let score = 0;

    chars.forEach((char) => {
      const charId = normStr(char?.id);
      const trustScore = Number(char?.trust_score || 0);
      const appearances = Number(char?.appearances || 0);
      const status = normStr(char?.status);
      const focusFamilies = Array.isArray(char?.focus_families) ? char.focus_families.map(normStr) : [];
      const established = appearances >= 2 || Math.abs(trustScore) >= 3;
      if (!established) return;

      if (peopleRef && peopleRef === charId) score += 24 + Math.min(10, appearances * 2) + Math.min(10, Math.abs(trustScore) * 2);
      if (focusFamilies.includes(family)) score += 12 + Math.min(8, Math.abs(trustScore)) + Math.min(6, appearances);
      if (type === "people" && focusFamilies.includes(family)) score += 6;
      if (status === "motspiller" && family === "krysspress") score += 8;
      if (status === "alliert" && (family === "sliten_nokkelperson" || family === "mellomleder_identitet")) score += 8;
    });

    return score;
  }

  function scorePsycheComponent(mail, worldState) {
    const psyche = worldState?.psyche || {};
    const family = normStr(mail?.mail_family || mail?.__family_id);
    const type = normStr(mail?.mail_type);
    const trustValue = Number(psyche?.trust?.value || 0);
    const integrity = Number(psyche?.integrity || 0);
    const visibility = Number(psyche?.visibility || 0);
    const autonomy = Number(psyche?.autonomy || 0);

    let score = 0;
    if (trustValue < 45 && family === "sliten_nokkelperson") score += 5;
    if (trustValue < 40 && family === "krysspress") score += 4;
    if (integrity < 45 && type === "story") score += 3;
    if (visibility > 70 && family === "driftskrise") score += 4;
    if (autonomy < 35 && family === "mellomleder_mastery") score += 5;
    return score;
  }

  function scoreCapitalComponent(mail, worldState) {
    const capital = worldState?.capital || {};
    const family = normStr(mail?.mail_family || mail?.__family_id);
    let score = 0;
    const economic = Number(capital?.economic || capital?.economic_capital || 0);
    const social = Number(capital?.social || capital?.social_capital || 0);
    const institutional = Number(capital?.institutional || capital?.institutional_capital || 0);
    if (economic < 20 && family === "mellomleder_planlegging") score += 3;
    if (social < 20 && family === "sliten_nokkelperson") score += 5;
    if (institutional < 20 && family === "krysspress") score += 3;
    return score;
  }

  function scoreCandidateMail(mail, worldState) {
    const breakdown = {
      branch: scoreBranchComponent(mail, worldState),
      npc_reactions: scoreNpcReactionComponent(mail, worldState),
      npc_characters: scoreNpcCharacterComponent(mail, worldState),
      psyche: scorePsycheComponent(mail, worldState),
      capital: scoreCapitalComponent(mail, worldState)
    };
    const total = Object.values(breakdown).reduce((sum, n) => sum + Number(n || 0), 0);
    return { total, breakdown };
  }

  function toMail(active, roleScope, step, mail, worldState) {
    const roleId = normStr(active?.role_id);
    const category = normStr(active?.career_id || "naeringsliv");
    const roleLabel = normStr(active?.title || roleScope);
    const mailId = normStr(mail?.id);
    const familyId = normStr(mail?.mail_family || mail?.__family_id);
    const sourceType = "planned";
    const toneContext = resolveCharacterTone(mail, worldState);
    const toneVariant = buildToneVariant(mail, toneContext);
    const placeId = normStr(mail?.place_id);
    const sourcePlaceRef = normStr(mail?.source_place_ref || placeId);

    return {
      id: mailId,
      stage: normStr(mail?.stage || "stable") || "stable",
      source: normStr(mail?.source || "Civication") || "Civication",
      subject: normStr(mail?.subject),
      summary: normStr(mail?.summary),
      situation: Array.isArray(mail?.situation) && mail.situation.length ? mail.situation.map(normStr).filter(Boolean) : [normStr(mail?.summary)].filter(Boolean),
      from: normStr(mail?.from),
      place_id: placeId,
      people_ref: normStr(mail?.people_ref),
      source_place_ref: sourcePlaceRef,
      learning_focus: Array.isArray(mail?.learning_focus) ? mail.learning_focus.map(normStr).filter(Boolean) : [],
      tone_context: toneContext,
      tone_variant: toneVariant,
      mail_type: normStr(mail?.mail_type || step?.type),
      mail_family: familyId,
      mail_tags: ["planned_mail", slugify(category), slugify(roleScope), slugify(normStr(step?.type)), slugify(familyId), slugify(normStr(step?.phase))].filter(Boolean),
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
        progress_tags: Array.isArray(mail?.progress_tags) ? mail.progress_tags.map(normStr).filter(Boolean) : [],
        from: normStr(mail?.from),
        place_id: placeId,
        people_ref: normStr(mail?.people_ref),
        source_place_ref: sourcePlaceRef,
        learning_focus: Array.isArray(mail?.learning_focus) ? mail.learning_focus.map(normStr).filter(Boolean) : [],
        tone_context: toneContext,
        tone_variant: toneVariant,
        primary_conflict: normStr(mail?.primary_conflict),
        secondary_conflict: normStr(mail?.secondary_conflict),
        capital_bias: Array.isArray(mail?.capital_bias) ? mail.capital_bias : [],
        psyche_bias: Array.isArray(mail?.psyche_bias) ? mail.psyche_bias : []
      },
      role_id: roleId,
      tier_label: roleLabel,
      career_id: category,
      source_type: sourceType,
      branch_flags: Array.isArray(mail?.branch_flags) ? mail.branch_flags.map(normStr).filter(Boolean) : [],
      mail_plan_meta: {
        plan_id: normStr(step?.plan_id),
        role_scope: roleScope,
        step: Number(step?.step || 0),
        phase: normStr(step?.phase),
        type: normStr(step?.type),
        fallback_types: Array.isArray(step?.fallback_types) ? step.fallback_types.map(normStr).filter(Boolean) : []
      }
    };
  }

  async function getMailsForType(active, step, mailType, consumed) {
    const paths = getFamilyPaths(active, mailType);
    if (!paths.length) return [];

    const allowedFamilies = buildAllowedFamilySet(step);
    const out = [];

    for (const path of paths) {
      const catalog = await loadJson(path);
      if (!catalog) continue;
      const mails = flattenFamilyCatalog(catalog).filter((mail) => {
        const familyId = normStr(mail?.mail_family || mail?.__family_id);
        if (!familyId || !allowedFamilies.has(familyId)) return false;
        if (isConsumed(mail?.id, consumed)) return false;
        return true;
      });
      out.push(...mails);
    }

    return out;
  }

  async function getCandidatesForStep(active, plan, step, consumed, state) {
    const decoratedStep = { ...step, plan_id: normStr(plan?.id) };
    const primaryType = normStr(step?.type);
    let mails = await getMailsForType(active, decoratedStep, primaryType, consumed);

    if (!mails.length) {
      const fallbackTypes = Array.isArray(step?.fallback_types) ? step.fallback_types.map(normStr).filter(Boolean) : [];
      for (const fallbackType of fallbackTypes) {
        mails = await getMailsForType(active, decoratedStep, fallbackType, consumed);
        if (mails.length) break;
      }
    }

    const roleScope = resolveRoleScope(active);
    const worldState = buildWorldState(active, state);

    return mails
      .map((mail) => {
        const shaped = toMail(active, roleScope, decoratedStep, mail, worldState);
        const score = scoreCandidateMail(shaped, worldState);
        return { ...shaped, _score_total: score.total, _score_breakdown: score.breakdown };
      })
      .sort((a, b) => Number(b._score_total || 0) - Number(a._score_total || 0));
  }

  async function makeCandidateMailsForActiveRole(active, state) {
    const planPath = getPlanPath(active);
    if (!planPath) return [];
    const plan = await loadJson(planPath);
    if (!plan || !Array.isArray(plan.sequence) || !plan.sequence.length) return [];

    const consumed = getConsumedMap(state);
    const currentStep = getCurrentStep(plan, state);
    if (!currentStep) return [];

    const samePlan = getPlanProgress(state).role_plan_id === normStr(plan?.id);
    if (!samePlan && !runtimeOwnsPlanProgress()) setPlanProgress(plan, currentStep);

    const candidates = await getCandidatesForStep(active, plan, currentStep, consumed, state);
    if (candidates.length) return candidates;

    const sequence = [...plan.sequence].filter(Boolean).sort((a, b) => Number(a?.step || 0) - Number(b?.step || 0));
    const currentStepNum = Number(currentStep?.step || 0);
    for (const step of sequence) {
      if (Number(step?.step || 0) === currentStepNum) continue;
      const fallbackCandidates = await getCandidatesForStep(active, plan, step, consumed, state);
      if (fallbackCandidates.length) {
        if (!runtimeOwnsPlanProgress()) setPlanProgress(plan, step);
        return fallbackCandidates;
      }
    }
    return [];
  }

  window.CiviMailPlanBridge = {
    loadJson,
    getPlanPath,
    getFamilyPath,
    getFamilyPaths,
    resolveRoleScope,
    getPlanProgress,
    setPlanProgress,
    advancePlanProgress,
    getCurrentStep,
    scoreCandidateMail,
    makeCandidateMailsForActiveRole,
    runtimeOwnsPlanProgress
  };
})();
