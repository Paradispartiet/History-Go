// js/Civication/systems/civicationRoleModelRuntime.js
// Kobler Civication-mailer til eksplisitte yrkes-/fagmodeller.
// Prinsipp:
// - MailRuntime/EventEngine eier fortsatt mailflyten.
// - Dette laget legger bare faglig metadata på mailene som allerede velges.
// - Ingen økonomi, NAV, job offers eller UI endres her.

(function () {
  "use strict";

  const PATCHED_FLAG = "__civicationRoleModelRuntimePatched";
  const CACHE = new Map();
  const INFLIGHT = new Map();
  const MANIFEST_PATH = "data/Civication/roleModels/manifest.json";
  const RELEVANCE_PATH = "data/Civication/historyPeople_relevance_v1.json";
  // Fail-closed scope remains known even if the relevance file fails to load.
  const EXPLICIT_ART_ROLES = new Set([
    "kunst_kuratering_og_program", "kunst_konservering_og_samling",
    "kunst_utstillingsproduksjon", "kunst_kunstnerisk_ledelse",
    "kunst_museumsledelse", "kunst_publikum_og_formidling"
  ]);

  function norm(value) {
    return String(value || "").trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80);
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
  }

  const ROLE_SCOPE_BY_ROLE_ID = {
    naer_ekspeditor: "ekspeditor",
    naer_arbeider: "arbeider",
    naer_fagarbeider: "fagarbeider",
    naer_formann: "formann",
    naer_controller: "controller",
    naer_avdelingsleder: "avdelingsleder",
    naer_finansanalytiker: "finansanalytiker",
    naer_okonomi_og_finanssjef: "okonomi_og_finanssjef",
    naer_finansdirektor: "finansdirektor",
    naer_mellomleder: "mellomleder"
  };

  const ROLE_SCOPE_BY_TITLE = {
    ekspeditor: "ekspeditor",
    butikkmedarbeider: "ekspeditor",
    ekspeditor_butikkmedarbeider: "ekspeditor",
    arbeider: "arbeider",
    lager_og_driftsmedarbeider: "arbeider",
    fagarbeider: "fagarbeider",
    formann: "formann",
    arbeidsleder: "formann",
    formann_arbeidsleder: "formann",
    controller: "controller",
    avdelingsleder: "avdelingsleder",
    finansanalytiker: "finansanalytiker",
    okonomi_og_finanssjef: "okonomi_og_finanssjef",
    finansdirektor: "finansdirektor",
    mellomleder: "mellomleder"
  };

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function resolveLegacyRoleScope(active) {
    const roleId = norm(active?.role_id);
    if (ROLE_SCOPE_BY_ROLE_ID[roleId]) return ROLE_SCOPE_BY_ROLE_ID[roleId];

    const titleKey = slugify(active?.title || "");
    if (ROLE_SCOPE_BY_TITLE[titleKey]) return ROLE_SCOPE_BY_TITLE[titleKey];

    const roleKey = slugify(active?.role_key || "");
    if (ROLE_SCOPE_BY_ROLE_ID[roleKey]) return ROLE_SCOPE_BY_ROLE_ID[roleKey];
    if (ROLE_SCOPE_BY_TITLE[roleKey]) return ROLE_SCOPE_BY_TITLE[roleKey];

    return "";
  }

  function resolveSluggedRoleScope(active) {
    return slugify(active?.title || active?.tier_label || active?.role_key || "");
  }

  async function loadJson(path) {
    const p = norm(path);
    if (!p) return null;
    if (CACHE.has(p)) return CACHE.get(p);
    if (INFLIGHT.has(p)) return INFLIGHT.get(p);
    const pending = (async () => {
      try {
        const res = await fetch(p, { cache: "no-store" });
        if (!res.ok) {
          CACHE.set(p, null);
          return null;
        }

        const json = await res.json();
        CACHE.set(p, json);
        return json;
      } catch (error) {
        if (window.DEBUG) console.warn("[CivicationRoleModelRuntime] kunne ikke laste", p, error);
        CACHE.set(p, null);
        return null;
      }
    })();
    INFLIGHT.set(p, pending);
    try { return await pending; } finally { INFLIGHT.delete(p); }
  }

  async function loadManifestSet() {
    const manifest = await loadJson(MANIFEST_PATH);
    const files = Array.isArray(manifest?.files) ? manifest.files.map(norm).filter(Boolean) : [];
    return new Set(files);
  }

  function resolveCanonicalRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver;
    if (!resolver || typeof resolver.resolveCareerRoleScope !== "function") return "";
    try {
      const roleScope = norm(resolver.resolveCareerRoleScope(active));
      return roleScope && roleScope !== "unknown" ? roleScope : "";
    } catch {
      return "";
    }
  }

  async function resolveRoleModelPath(active) {
    const category = norm(active?.career_id);
    if (!category) {
      return { category: "", role_scope: "", path: null, strategy: "none", manifest_has_path: false };
    }

    // Først: canonical Civication Career Role Resolver. Dette gjør role_scope
    // til felles kontrakt mellom jobb, Life Story, FWG og roleModel. Dersom
    // en delt roleModel finnes på <category>/<role_scope>.json, vinner den.
    const canonicalRoleScope = resolveCanonicalRoleScope(active);
    const canonicalPath = canonicalRoleScope
      ? `data/Civication/roleModels/${category}/${canonicalRoleScope}.json`
      : null;
    if (canonicalPath) {
      const canonicalModel = await loadJson(canonicalPath);
      if (canonicalModel) {
        const manifestSet = await loadManifestSet();
        return {
          category,
          role_scope: norm(canonicalModel.role_scope || canonicalRoleScope),
          path: canonicalPath,
          strategy: "canonical_role_scope",
          manifest_has_path: manifestSet.has(canonicalPath)
        };
      }
    }

    const legacyRoleScope = resolveLegacyRoleScope(active);
    const legacyPath = legacyRoleScope
      ? `data/Civication/roleModels/${category}/${legacyRoleScope}.json`
      : null;

    if (legacyPath) {
      const legacyModel = await loadJson(legacyPath);
      if (legacyModel) {
        return {
          category,
          role_scope: norm(legacyModel.role_scope || legacyRoleScope),
          path: legacyPath,
          strategy: "explicit_mapping",
          manifest_has_path: true
        };
      }
    }

    const slugRoleScope = resolveSluggedRoleScope(active);
    const path = slugRoleScope
      ? `data/Civication/roleModels/${category}/${slugRoleScope}.json`
      : null;

    let manifestHasPath = false;
    if (path) {
      const manifestSet = await loadManifestSet();
      manifestHasPath = manifestSet.has(path);
    }

    return {
      category,
      role_scope: slugRoleScope,
      path,
      strategy: "badge_tier_slug",
      manifest_has_path: manifestHasPath
    };
  }

  async function loadRoleModel(active) {
    const resolved = await resolveRoleModelPath(active);
    if (!resolved.path) return null;
    return await loadJson(resolved.path);
  }

  function pickByIds(list, ids) {
    const wanted = new Set(uniqueStrings(ids));
    if (!wanted.size) return [];
    return (Array.isArray(list) ? list : []).filter(item => wanted.has(norm(item?.id)));
  }

  function normalizeRoleModelRefs(refs) {
    const src = refs && typeof refs === "object" ? refs : {};
    return {
      competence_axes: uniqueStrings(src.competence_axes),
      ideal_type_problems: uniqueStrings(src.ideal_type_problems)
    };
  }

  function stableHash(value) {
    const text = String(value || "");
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  function resolveHistoryPeopleDayIndex(mail) {
    const candidates = [
      mail?.daily_mail_meta?.dayIndex,
      mail?.daily_mail_meta?.day_index,
      mail?.dayIndex,
      mail?.day_index,
      window.CivicationCalendar?.getPhaseModel?.()?.dayIndex,
      window.CivicationCalendar?.getDisplayModel?.()?.dayIndex
    ];
    for (const value of candidates) {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 1) return Math.floor(n);
    }
    return 1;
  }

  function selectHistoryPeopleForMail(people, roleModel, mail) {
    const rows = (Array.isArray(people) ? people : [])
      .filter(person => norm(person?.id) && norm(person?.name));
    if (rows.length <= 3) return rows;

    const mailIdentity = norm(mail?.source_mail_id || mail?.daily_mail_meta?.source_mail_id || mail?.id || mail?.mail_key || mail?.task_id || mail?.subject || "mail");
    const seed = [
      norm(roleModel?.category),
      norm(roleModel?.role_scope),
      mailIdentity
    ].join("|");
    const baseStart = stableHash(seed) % rows.length;
    const dayOffset = (resolveHistoryPeopleDayIndex(mail) - 1) * 3;
    const start = (baseStart + dayOffset) % rows.length;

    return [0, 1, 2].map(offset => rows[(start + offset) % rows.length]);
  }

  // Samlede History Go-personer i rollemodellens kategori. Disse følger den
  // konkrete rollemailen som faglige perspektiver; de er ikke en fri kontaktliste.
  // Maks tre per mail holder koblingen lesbar. Utvalget roterer deterministisk
  // mellom mailer/dager, slik at hele den relevante samlingen kan komme frem over tid.
  async function loadHistoryPeople(roleModel, mail) {
    const bridge = window.CivicationHistoryPeopleBridge;
    const category = norm(roleModel?.category);
    if (!bridge?.load || !category) return [];
    try {
      await bridge.load();
      const relevant = bridge.getCollectedByCategory(category) || [];
      return selectHistoryPeopleForMail(relevant, roleModel, mail)
        .map(person => ({
          id: norm(person?.id),
          name: norm(person?.name),
          category: norm(person?.category || category),
          description: norm(person?.desc),
          place_id: norm(person?.placeId) || null,
          year: Number.isFinite(Number(person?.year)) ? Number(person.year) : null,
          image: norm(person?.cardImage || person?.image) || null
        }))
        .filter(person => person.id && person.name);
    } catch {
      return [];
    }
  }

  function usesExplicitHistoryPeople(roleModel) {
    return norm(roleModel?.category) === "kunst" && EXPLICIT_ART_ROLES.has(norm(roleModel?.role_scope));
  }

  async function loadExplicitHistoryPeople(model, mail, active) {
    const sourceId = norm(mail?.source_mail_id);
    const dailySourceId = norm(mail?.daily_mail_meta?.source_mail_id);
    const identity = sourceId || dailySourceId || norm(mail?.id);
    const result = (status, people = []) => ({ people, diagnostic: { status, source_mail_id: identity || null } });
    if (sourceId && dailySourceId && sourceId !== dailySourceId) return result("conflicting_source_ids");
    const category = norm(model.category), roleScope = norm(model.role_scope);
    const activeCategory = norm(active?.career_id);
    const activeScope = resolveCanonicalRoleScope(active) || norm(active?.role_scope);
    if (!identity || norm(mail?.category) !== category || norm(mail?.role_scope) !== roleScope ||
        (activeCategory && activeCategory !== category) || (activeScope && activeScope !== roleScope)) {
      return result("context_mismatch");
    }
    const registry = await loadJson(RELEVANCE_PATH);
    if (registry?.schema !== "civication_history_people_relevance_v1" || registry?.version !== 1 ||
        !Array.isArray(registry?.bindings) || !Array.isArray(registry?.cases) || !Array.isArray(registry?.sources) ||
        !Array.isArray(registry?.scope) || !registry.scope.some(row => row.category === category && row.role_scope === roleScope)) {
      return result("registry_unavailable");
    }
    const matches = registry.bindings.filter(row => row.category === category && row.role_scope === roleScope && row.mail_id === identity);
    if (matches.length !== 1) return result("missing_or_duplicate_binding");
    const binding = matches[0];
    if (["task_domain", "place_id", "people_ref"].some(key => !norm(binding[key]) || norm(mail?.[key]) !== norm(binding[key])) ||
        (mail?.scene_catalog_source_path && (norm(mail.scene_catalog_source_path) !== norm(binding.source_path) ||
          norm(mail.scene_catalog_source_hash) !== norm(binding.source_hash))) ||
        (mail?.scene_catalog_source_hash && norm(mail.scene_catalog_source_hash) !== norm(binding.source_hash))) {
      return result("context_mismatch");
    }
    if (!Array.isArray(binding.people)) return result("invalid_binding");
    if (binding.review_status === "no_supported_link" && !binding.people.length) return result("no_supported_link");
    if (binding.review_status !== "linked" || !binding.people.length) return result("invalid_binding");
    const bridge = window.CivicationHistoryPeopleBridge;
    if (!bridge?.load || !bridge?.getPersonById || !bridge?.getCollectedByIds) return result("index_unavailable");
    try {
      await bridge.load();
      const relevantById = new Map();
      for (const link of binding.people) {
        const personId = norm(link?.person_id);
        const person = bridge.getPersonById(personId);
        if (!person || norm(person.category) !== category || relevantById.has(personId) ||
            !norm(link.reason) || !norm(link.question) || !Array.isArray(link.case_ids) || !link.case_ids.length) return result("invalid_binding");
        const evidence = [];
        for (const caseId of link.case_ids) {
          const cases = registry.cases.filter(row => row.id === caseId && row.person_id === personId);
          const item = cases[0];
          if (cases.length !== 1 || !norm(item.verified_claim) || !norm(item.application_limit) ||
              !Array.isArray(item.source_ids) || !item.source_ids.length) return result("invalid_binding");
          const sources = [];
          for (const source of item.source_ids) {
            const found = registry.sources.filter(row => row.id === source);
            if (found.length !== 1 || !/^https:\/\//.test(norm(found[0].url))) return result("invalid_binding");
            sources.push({ id: found[0].id, title: norm(found[0].title), url: found[0].url });
          }
          evidence.push({ id: item.id, claim: item.verified_claim, application_limit: item.application_limit, sources });
        }
        relevantById.set(personId, { case_ids: [...link.case_ids], reason: link.reason, question: link.question, evidence });
      }
      const collected = bridge.getCollectedByIds([...relevantById.keys()]);
      const selected = selectHistoryPeopleForMail(collected, model, { ...mail, source_mail_id: identity });
      const people = selected.map(person => ({
        id: person.id, name: person.name, category: person.category,
        description: norm(person.desc), place_id: norm(person.placeId) || null,
        year: Number.isFinite(Number(person.year)) ? Number(person.year) : null,
        image: norm(person.cardImage || person.image) || null,
        relevance: relevantById.get(person.id)
      }));
      return result(people.length ? "linked" : "no_collected_candidate", people);
    } catch {
      return result("index_unavailable");
    }
  }

  function buildRoleModelMeta(roleModel, refs, historyPeople, diagnostic = null) {
    if (!roleModel) return null;

    const normalizedRefs = normalizeRoleModelRefs(refs);

    return {
      schema: norm(roleModel.schema || "civication_role_model_v1"),
      category: norm(roleModel.category),
      role_scope: norm(roleModel.role_scope),
      role_id: norm(roleModel.role_id),
      title: norm(roleModel.title),
      education_basis: Array.isArray(roleModel.education_basis)
        ? roleModel.education_basis.map(norm).filter(Boolean)
        : [],
      professional_description: Array.isArray(roleModel.professional_description)
        ? roleModel.professional_description.map(norm).filter(Boolean)
        : [],
      selected_competence_axes: pickByIds(roleModel.competence_axes, normalizedRefs.competence_axes),
      selected_ideal_type_problems: pickByIds(roleModel.ideal_type_problems, normalizedRefs.ideal_type_problems),
      people_connections: uniqueStrings(roleModel.required_knowledge?.people_connections),
      history_people: Array.isArray(historyPeople) ? historyPeople : [],
      ...(diagnostic ? { history_people_relevance: diagnostic } : {}),
      refs: normalizedRefs
    };
  }

  async function decorateMail(mail, active, roleModel) {
    if (!mail || typeof mail !== "object") return mail;

    const model = roleModel || await loadRoleModel(active);
    if (!model) {
      const scope = resolveCanonicalRoleScope(active) || norm(active?.role_scope || mail.role_scope);
      const category = norm(active?.career_id || mail.category);
      if (!usesExplicitHistoryPeople({ category, role_scope: scope })) return mail;
      return { ...mail, role_model_meta: {
        ...(mail.role_model_meta || {}), category, role_scope: scope, history_people: [],
        history_people_relevance: { status: "role_model_unavailable", source_mail_id: norm(mail.source_mail_id || mail.id) || null }
      } };
    }

    const refs = normalizeRoleModelRefs(mail.role_model_refs);
    const explicit = usesExplicitHistoryPeople(model)
      ? await loadExplicitHistoryPeople(model, mail, active)
      : null;
    const historyPeople = explicit ? explicit.people : await loadHistoryPeople(model, mail);
    const roleModelMeta = buildRoleModelMeta(model, refs, historyPeople, explicit?.diagnostic);

    return {
      ...mail,
      role_model_refs: refs,
      role_model_meta: roleModelMeta,
      mail_tags: uniqueStrings([
        ...(Array.isArray(mail.mail_tags) ? mail.mail_tags : []),
        roleModelMeta?.role_id,
        ...(refs.competence_axes || []),
        ...(refs.ideal_type_problems || [])
      ])
    };
  }

  async function decoratePack(pack, active) {
    if (!pack || !Array.isArray(pack.mails) || !pack.mails.length) return pack;

    const resolved = await resolveRoleModelPath(active);
    const roleModel = resolved.path ? await loadJson(resolved.path) : null;
    if (!roleModel) return pack;

    const mails = await Promise.all(
      pack.mails.map(mail => decorateMail(mail, active, roleModel))
    );

    return {
      ...pack,
      mails,
      __civication_role_model_runtime: true,
      __role_model_path: resolved.path,
      __role_model_id: norm(roleModel.role_id)
    };
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto) return false;
    if (proto[PATCHED_FLAG] === true) return true;

    const originalBuildMailPool = proto.buildMailPool;
    if (typeof originalBuildMailPool !== "function") return false;

    proto.buildMailPool = async function roleModelBuildMailPool(active, state, roleKey) {
      const pack = await originalBuildMailPool.call(this, active, state, roleKey);
      const resolvedActive = active || getActive();
      return await decoratePack(pack, resolvedActive);
    };

    proto[PATCHED_FLAG] = true;
    proto.__civicationRoleModelRuntimePatchedAt = new Date().toISOString();
    return true;
  }

  async function inspect() {
    const active = getActive();
    const proto = window.CivicationEventEngine?.prototype;
    const resolved = active
      ? await resolveRoleModelPath(active)
      : { category: "", role_scope: "", path: null, strategy: "none", manifest_has_path: false };
    const loaded = resolved.path ? Boolean(await loadJson(resolved.path)) : false;

    return {
      active,
      category_or_career_id: resolved.category || null,
      role_scope: resolved.role_scope || null,
      role_model_path: resolved.path,
      strategy: resolved.strategy,
      manifest_has_path: resolved.manifest_has_path,
      file_loaded: loaded,
      patched: proto?.[PATCHED_FLAG] === true,
      cache_size: CACHE.size
    };
  }

  function boot() {
    return patchEventEngine();
  }

  window.CivicationRoleModelRuntime = {
    boot,
    inspect,
    loadRoleModel,
    decorateMail,
    decoratePack,
    usesExplicitHistoryPeople,
    resolveRoleModelPath,
    resolveLegacyRoleScope,
    resolveSluggedRoleScope,
    resolveCanonicalRoleScope
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
