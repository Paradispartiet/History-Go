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
  const MANIFEST_PATH = "data/Civication/roleModels/manifest.json";

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
  }

  async function loadManifestSet() {
    const manifest = await loadJson(MANIFEST_PATH);
    const files = Array.isArray(manifest?.files) ? manifest.files.map(norm).filter(Boolean) : [];
    return new Set(files);
  }

  async function resolveRoleModelPath(active) {
    const category = norm(active?.career_id);
    if (!category) {
      return { category: "", role_scope: "", path: null, strategy: "none", manifest_has_path: false };
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
          role_scope: legacyRoleScope,
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

  function buildRoleModelMeta(roleModel, refs) {
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
      refs: normalizedRefs
    };
  }

  async function decorateMail(mail, active, roleModel) {
    if (!mail || typeof mail !== "object") return mail;

    const model = roleModel || await loadRoleModel(active);
    if (!model) return mail;

    const refs = normalizeRoleModelRefs(mail.role_model_refs);
    const roleModelMeta = buildRoleModelMeta(model, refs);

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
    resolveRoleModelPath,
    resolveLegacyRoleScope,
    resolveSluggedRoleScope
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
