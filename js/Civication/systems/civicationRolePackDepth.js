// js/Civication/systems/civicationRolePackDepth.js
//
// Leser data/Civication/rolePackIndex.json (generert av
// scripts/audit-civication-role-packs.mjs) og klassifiserer hvor dyp rollepakken
// bak et jobbtilbud / en aktiv rolle er: full / delvis / generisk.
//
// Bakgrunn: bare et fåtall roller har komplette rollepakker (roleModel + FWG +
// mailPlan + mailFamilies). Roller uten pakke faller tilbake til generiske
// arbeidsmailer i runtime ("missing_pack"). Spilleren skal se det FØR hen takker
// ja til et tilbud, slik at valget av rolle signaliserer forventet dybde.
//
// UI henter aldri data selv: dette systemet eier fetch/caching, UI kaller kun
// getPackDepthSync(...) og re-rendrer på "civi:rolePackIndexLoaded".

(function () {
  "use strict";

  const INDEX_URL = "data/Civication/rolePackIndex.json";

  /** @type {null | { version?: number, roles?: Array<Record<string, unknown>> }} */
  let indexData = null;
  /** @type {Promise<typeof indexData> | null} */
  let indexPromise = null;

  const DEPTH_BY_STATUS = {
    complete_reference_v2: {
      level: "full",
      label: "Full rollepakke",
      description: "Komplett arbeidsdag med egne saker, personer og konflikter."
    },
    complete_reference: {
      level: "full",
      label: "Full rollepakke",
      description: "Komplett arbeidsdag med egne saker, personer og konflikter."
    },
    playable_v1: {
      level: "full",
      label: "Spillbar rollepakke",
      description: "Egen arbeidsdag med rollens egne saker."
    },
    partial_pack: {
      level: "partial",
      label: "Delvis rollepakke",
      description: "Noe eget innhold — resten av arbeidsdagen er generisk inntil videre."
    },
    role_model_only: {
      level: "generic",
      label: "Generisk innhold",
      description: "Rollen er definert, men arbeidsdagen bruker generiske mailer inntil videre."
    },
    generated_stub: {
      level: "generic",
      label: "Generisk innhold",
      description: "Rollen er definert, men arbeidsdagen bruker generiske mailer inntil videre."
    },
    broken_mapping: {
      level: "generic",
      label: "Generisk innhold",
      description: "Rollen er definert, men arbeidsdagen bruker generiske mailer inntil videre."
    },
    missing: {
      level: "generic",
      label: "Generisk innhold",
      description: "Rollen er definert, men arbeidsdagen bruker generiske mailer inntil videre."
    }
  };

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .replaceAll("æ", "ae").replaceAll("ø", "o").replaceAll("å", "a")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  async function ensureLoaded() {
    if (indexData) return indexData;
    if (!indexPromise) {
      indexPromise = (async function loadIndex() {
        try {
          const res = await fetch(INDEX_URL, { cache: "no-cache" });
          if (!res || !res.ok) return null;
          const json = await res.json();
          if (!json || !Array.isArray(json.roles)) return null;
          indexData = json;
          try { window.dispatchEvent(new Event("civi:rolePackIndexLoaded")); } catch {}
          // Tilbudskortene rendres på updateProfile — be om re-render nå som dybden kan vises.
          try { window.dispatchEvent(new Event("updateProfile")); } catch {}
          return indexData;
        } catch (error) {
          if (window.DEBUG) console.warn("[CivicationRolePackDepth] kunne ikke laste rollepakke-indeks", error);
          return null;
        }
      })();
    }
    return indexPromise;
  }

  /**
   * Finn indeksraden for et tilbud / en aktiv posisjon.
   * Tilbud har form { career_id, title, ... } — career_id er kategorien
   * (by, naeringsliv, ...), samme felt som mailPlan-stiene bruker.
   * @param {Record<string, unknown> | null | undefined} offerish
   */
  function findRole(offerish) {
    if (!indexData || !Array.isArray(indexData.roles) || !offerish) return null;
    const category = norm(offerish.career_id);
    const roles = indexData.roles;

    const resolved = /** @type {{ role_scope?: unknown, role_id?: unknown } | null} */ (
      window.CivicationCareerRoleResolver?.resolveCareerRole?.(offerish) || null
    );
    const roleScope = norm(resolved?.role_scope);
    if (roleScope && roleScope !== "unknown") {
      const byScope = roles.find((r) => norm(r?.role_scope) === roleScope && (!category || norm(r?.category) === category))
        || roles.find((r) => norm(r?.role_scope) === roleScope);
      if (byScope) return byScope;
    }

    const roleId = norm(resolved?.role_id) || slugify(offerish.role_id);
    if (roleId) {
      const byId = roles.find((r) => norm(r?.role_id) === roleId);
      if (byId) return byId;
    }

    const titleKey = slugify(offerish.title);
    if (titleKey) {
      const byTitle = roles.find((r) => slugify(r?.title) === titleKey && (!category || norm(r?.category) === category));
      if (byTitle) return byTitle;
    }

    return null;
  }

  /**
   * Synkron klassifisering. Returnerer null hvis indeksen ikke er lastet ennå
   * eller rollen ikke finnes i den — UI skal da ikke vise noe (aldri "undefined").
   * @param {Record<string, unknown> | null | undefined} offerish
   * @returns {{ status: string, level: string, label: string, description: string, role_scope: string } | null}
   */
  function getPackDepthSync(offerish) {
    const row = findRole(offerish);
    if (!row) return null;
    const depth = DEPTH_BY_STATUS[norm(row.status)] || null;
    if (!depth) return null;
    return {
      status: norm(row.status),
      level: depth.level,
      label: depth.label,
      description: depth.description,
      role_scope: norm(row.role_scope)
    };
  }

  /**
   * @param {Record<string, unknown> | null | undefined} offerish
   */
  async function getPackDepth(offerish) {
    await ensureLoaded();
    return getPackDepthSync(offerish);
  }

  function boot() {
    ensureLoaded();
  }

  window.CivicationRolePackDepth = {
    boot,
    ensureLoaded,
    getPackDepth,
    getPackDepthSync,
    _inspect() {
      return { loaded: !!indexData, roleCount: indexData?.roles?.length || 0 };
    },
    _setIndexForTest(json) {
      indexData = json && Array.isArray(json.roles) ? json : null;
      indexPromise = indexData ? Promise.resolve(indexData) : null;
    }
  };

  boot();
})();
