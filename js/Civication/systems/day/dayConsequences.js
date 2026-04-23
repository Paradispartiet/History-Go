(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function uniq(arr) {
    return Array.from(new Set((Array.isArray(arr) ? arr : []).map(normStr).filter(Boolean)));
  }

  function activeCareerId() {
    return normStr(window.CivicationState?.getActivePosition?.()?.career_id);
  }

  function activeRoleScope() {
    const active = window.CivicationState?.getActivePosition?.() || {};
    return normStr(window.CiviMailPlanBridge?.resolveRoleScope?.(active) || active.role_scope);
  }

  function mergeBranchState(delta) {
    const current = window.CivicationState?.getMailBranchState?.() || {
      preferred_types: [],
      preferred_families: [],
      flags: []
    };

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
      integrity: Number(delta.integrity || 0),
      visibility: Number(delta.visibility || 0),
      economicRoom: Number(delta.economicRoom || 0),
      trust: Number(delta.trust || 0)
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

  function applyChoiceConsequences(ctx) {
    const { eventObj, choice, result } = ctx;
    if (!eventObj || !choice) return null;

    const roleScope = activeRoleScope();
    if (roleScope !== "mellomleder") return null;

    const branch = mergeBranchState(inferBranchBias(eventObj, choice, result));
    const psyche = applyPsycheDelta(inferPsycheDelta(eventObj, choice, result));
    const capital = applyCapitalDelta(
      inferCapitalDelta(eventObj, choice, result),
      `mellomleder_${normStr(eventObj.mail_family || eventObj.mail_type || "mail")}`
    );

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
      branch,
      psyche,
      capital,
      burnout,
      collapse
    };
  }

  function register() {
    if (!window.CivicationChoiceDirector) return;

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
