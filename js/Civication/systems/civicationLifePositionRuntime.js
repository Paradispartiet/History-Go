(function initCivicationLifePositionRuntime(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);
  const LS_KEY = "hg_civi_life_positions_v1";
  const CATALOG_PATH = "data/Civication/lifePositionCatalog.json";
  let catalogPromise = null;

  // These are not a second progression model. They are always-open choices in the
  // existing life-position profile, for life paths that should not require Badge points.
  const OPEN_LIFE_POSITIONS = [
    {
      badge_id: "liv_bosituasjon",
      badge_name: "Fritt livsvalg",
      id: "uteligger",
      label: "Uteligger",
      threshold: 0,
      kind: "self_selected_life_path",
      description: "Du velger å leve uten fast bolig. Spillet skiller dette fra ufrivillig bostedsløshet.",
      hooks: ["gate_og_byrom", "nettverk", "vaer", "saarbarhet", "frihet"],
      employment_independent: true,
      source: "open_choice",
      effects: { housing_status: "unhoused", housing_choice: "chosen" }
    },
    {
      badge_id: "liv_bosituasjon",
      badge_name: "Fritt livsvalg",
      id: "boms",
      label: "Boms",
      threshold: 0,
      kind: "self_selected_life_path",
      description: "En bevisst, omflakkende og lite institusjonsbundet livsstil. Dette er en spilleretikett, aldri en etikett spillet setter på andre mennesker.",
      hooks: ["omflakkende_liv", "tilfeldige_moter", "lavt_forbruk", "frihet", "ustabilitet"],
      employment_independent: true,
      source: "open_choice",
      effects: { housing_status: "unhoused", housing_choice: "chosen" }
    },
    {
      badge_id: "liv_lovsbane",
      badge_name: "Fritt livsvalg",
      id: "kriminell",
      label: "Kriminell",
      threshold: 0,
      kind: "self_selected_life_path",
      description: "Du velger en kriminell livsbane i fortellingen. Det kan gi risiko, relasjons- og konsekvenshistorier, men gir aldri gratis penger, ferdigheter eller strafferettslig status.",
      hooks: ["risiko", "omdomme", "lojalitet", "konsekvenser", "myndighetskontakt"],
      employment_independent: true,
      source: "open_choice"
    },
    {
      badge_id: "liv_alternativ",
      badge_name: "Fritt livsvalg",
      id: "bohem",
      label: "Bohem",
      threshold: 0,
      kind: "self_selected_life_path",
      description: "Du prioriterer miljø, kunst, mennesker og frihet høyere enn en ryddig karrierestige.",
      hooks: ["kunstmiljo", "venner", "kvelder", "prosjekter", "ustabil_okonomi"],
      employment_independent: true,
      source: "open_choice"
    },
    {
      badge_id: "liv_alternativ",
      badge_name: "Fritt livsvalg",
      id: "nomade",
      label: "Nomade",
      threshold: 0,
      kind: "self_selected_life_path",
      description: "Du velger et mobilt liv der bosted, miljø og nettverk kan skifte oftere enn jobb eller identitet.",
      hooks: ["reise", "midlertidige_steder", "nye_miljoer", "frihet", "forankring"],
      employment_independent: true,
      source: "open_choice"
    }
  ];

  const CIRCUMSTANCE_OPTIONS = Object.freeze({
    activity_status: [
      { id: "none", label: "Ingen særstatus" },
      { id: "jobseeker", label: "Arbeidssøker / arbeidsledig" },
      { id: "student", label: "Student" },
      { id: "retired", label: "Pensjonist" },
      { id: "home_caregiver", label: "Hjemmeværende / omsorg" },
      { id: "voluntary_no_job", label: "Frivillig uten formell jobb" }
    ],
    benefit_status: [
      { id: "none", label: "Ingen registrert ytelse" },
      { id: "aap", label: "AAP (arbeidsavklaringspenger; tidl. attføring)" },
      { id: "disability_benefit", label: "Uføretrygdet" },
      { id: "sick_leave", label: "Sykmeldt" },
      { id: "other_support", label: "Annen innvilget støtte / ytelse" }
    ],
    housing_status: [
      { id: "housed", label: "Har fast bolig" },
      { id: "temporary_housing", label: "Midlertidig bolig" },
      { id: "unhoused", label: "Uten fast bolig" }
    ],
    housing_choice: [
      { id: "unspecified", label: "Ikke angitt" },
      { id: "chosen", label: "Selvvalgt" },
      { id: "involuntary", label: "Ufrivillig" },
      { id: "mixed", label: "Blandet / sammensatt" }
    ]
  });

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function optionIds(key) {
    return new Set((CIRCUMSTANCE_OPTIONS[key] || []).map((entry) => entry.id));
  }

  const VALID_CIRCUMSTANCES = {
    activity_status: optionIds("activity_status"),
    benefit_status: optionIds("benefit_status"),
    housing_status: optionIds("housing_status"),
    housing_choice: optionIds("housing_choice")
  };

  function normalizeCircumstances(input) {
    const raw = input && typeof input === "object" ? input : {};
    const defaults = {
      activity_status: "none",
      benefit_status: "none",
      housing_status: "housed",
      housing_choice: "unspecified"
    };
    return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => {
      const candidate = String(raw?.[key] || fallback);
      return [key, VALID_CIRCUMSTANCES[key].has(candidate) ? candidate : fallback];
    }));
  }

  function normalizeState(raw) {
    const value = raw && typeof raw === "object" ? raw : {};
    return {
      version: 2,
      primary: value?.primary && typeof value.primary === "object" ? value.primary : null,
      active_by_badge: value?.active_by_badge && typeof value.active_by_badge === "object"
        ? value.active_by_badge
        : {},
      circumstances: normalizeCircumstances(value?.circumstances),
      history: Array.isArray(value?.history) ? value.history : []
    };
  }

  function getState() {
    return normalizeState(safeParse(localStorage.getItem(LS_KEY), {}));
  }

  function setState(next) {
    const normalized = normalizeState(next);
    localStorage.setItem(LS_KEY, JSON.stringify(normalized));
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    try { window.dispatchEvent(new Event("civi:lifePositionChanged")); } catch {}
    return normalized;
  }

  async function ensureCatalogLoaded() {
    if (Array.isArray(window.CIVI_LIFE_POSITION_CATALOG?.badges)) {
      return window.CIVI_LIFE_POSITION_CATALOG;
    }
    if (catalogPromise) return catalogPromise;
    if (typeof fetch !== "function") return null;

    catalogPromise = fetch(CATALOG_PATH, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !Array.isArray(json.badges)) {
          throw new Error("catalog badges must be an array");
        }
        window.CIVI_LIFE_POSITION_CATALOG = json;
        try { window.dispatchEvent(new Event("civi:lifePositionCatalogLoaded")); } catch {}
        try { window.dispatchEvent(new Event("updateProfile")); } catch {}
        return json;
      })
      .catch((error) => {
        console.warn("[CivicationLifePositions] life position catalog kunne ikke lastes", error);
        return null;
      });

    return catalogPromise;
  }

  function getBadge(badgeId) {
    const id = String(badgeId || "").trim();
    if (!id || !Array.isArray(window.BADGES)) return null;
    return window.BADGES.find((badge) => String(badge?.id || "").trim() === id) || null;
  }

  function getBadgeProfile(badgeId) {
    const id = String(badgeId || "").trim();
    const profiles = Array.isArray(window.CIVI_LIFE_POSITION_CATALOG?.badges)
      ? window.CIVI_LIFE_POSITION_CATALOG.badges
      : [];
    return profiles.find((profile) => String(profile?.badge_id || "").trim() === id) || null;
  }

  function getBadgePoints(badgeId) {
    const merits = safeParse(localStorage.getItem("merits_by_category"), {});
    return Number(merits?.[String(badgeId || "").trim()]?.points || 0);
  }

  function toTierPosition(badge, tier, descriptor) {
    const data = descriptor && typeof descriptor === "object" ? descriptor : {};
    return {
      badge_id: String(badge.id),
      badge_name: String(badge.name || badge.id),
      id: String(data.id || "").trim() || null,
      label: String(data.label || tier.label || ""),
      threshold: Number(tier.threshold),
      kind: String(data.kind || "life_position"),
      description: String(data.description || "").trim() || null,
      hooks: Array.isArray(data.hooks) ? data.hooks.map(String).filter(Boolean) : [],
      employment_independent: data.employment_independent !== false,
      source: "badge_tier"
    };
  }

  function getTierPositions(badgeId, points) {
    const badge = getBadge(badgeId);
    if (!badge || !Array.isArray(badge.tiers)) return [];

    return badge.tiers.flatMap((tier) => {
      if (Number(tier?.threshold) > points) return [];
      const descriptors = [];
      if (tier?.life_position && typeof tier.life_position === "object") {
        descriptors.push({ ...tier.life_position, label: tier.label });
      }
      if (Array.isArray(tier?.life_positions)) {
        descriptors.push(...tier.life_positions.filter((entry) => entry && typeof entry === "object"));
      }
      return descriptors.map((descriptor) => toTierPosition(badge, tier, descriptor));
    });
  }

  function getCatalogPositions(badgeId, points) {
    const badge = getBadge(badgeId);
    const profile = getBadgeProfile(badgeId);
    if (!badge || !profile || !Array.isArray(profile.positions)) return [];

    return profile.positions
      .filter((position) => Number(position?.threshold) <= points)
      .map((position) => ({
        badge_id: String(badge.id),
        badge_name: String(badge.name || badge.id),
        id: String(position?.id || "").trim() || null,
        label: String(position?.label || ""),
        threshold: Number(position?.threshold),
        kind: String(position?.kind || "life_position"),
        description: String(position?.description || "").trim() || null,
        hooks: Array.isArray(position?.hooks) ? position.hooks.map(String).filter(Boolean) : [],
        employment_independent: position?.employment_independent !== false,
        source: "catalog"
      }));
  }

  function getOpenPositions(scopeId) {
    const wanted = String(scopeId || "").trim();
    return OPEN_LIFE_POSITIONS
      .filter((position) => !wanted || position.badge_id === wanted)
      .map((position) => ({ ...position }));
  }

  function dedupePositions(positions) {
    const seen = new Set();
    return positions.filter((position) => {
      const key = `${position.badge_id}::${position.label}`;
      if (!position.label || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getUnlockedPositions(badgeId) {
    const id = String(badgeId || "").trim();
    const open = getOpenPositions(id);
    if (open.length) return open;

    const badge = getBadge(id);
    if (!badge || !Array.isArray(badge.tiers)) return [];
    const points = getBadgePoints(id);
    return dedupePositions([
      ...getTierPositions(id, points),
      ...getCatalogPositions(id, points)
    ]).sort((a, b) => a.threshold - b.threshold || a.label.localeCompare(b.label, "nb"));
  }

  function getAllUnlockedPositions() {
    const badgePositions = Array.isArray(window.BADGES)
      ? window.BADGES.flatMap((badge) => getUnlockedPositions(badge?.id))
      : [];
    return dedupePositions([
      ...getOpenPositions(),
      ...badgePositions
    ]);
  }

  function findUnlockedPosition(badgeId, label) {
    const wanted = String(label || "").trim();
    return getUnlockedPositions(badgeId).find((position) => position.label === wanted) || null;
  }

  function setCircumstances(patch, options) {
    const input = patch && typeof patch === "object" ? patch : {};
    const opts = options && typeof options === "object" ? options : {};
    const current = getState();
    const nextCircumstances = { ...current.circumstances };

    for (const key of Object.keys(nextCircumstances)) {
      if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
      const value = String(input[key] || "");
      if (!VALID_CIRCUMSTANCES[key].has(value)) {
        return { ok: false, reason: "invalid_life_circumstance", field: key, value };
      }
      nextCircumstances[key] = value;
    }

    if (nextCircumstances.housing_status !== "unhoused" && !Object.prototype.hasOwnProperty.call(input, "housing_choice")) {
      nextCircumstances.housing_choice = "unspecified";
    }

    const at = new Date().toISOString();
    const history = [{
      type: "circumstances_changed",
      patch: Object.fromEntries(Object.keys(nextCircumstances)
        .filter((key) => nextCircumstances[key] !== current.circumstances[key])
        .map((key) => [key, nextCircumstances[key]])),
      source: String(opts.source || "player"),
      at
    }].concat(current.history).slice(0, 100);

    const state = setState({ ...current, circumstances: nextCircumstances, history });
    return { ok: true, circumstances: state.circumstances };
  }

  function activate(badgeId, label, options) {
    const position = findUnlockedPosition(badgeId, label);
    if (!position) return { ok: false, reason: "life_position_locked" };

    const opts = options && typeof options === "object" ? options : {};
    const current = getState();
    const activated = {
      ...position,
      activated_at: new Date().toISOString()
    };
    const activeByBadge = {
      ...current.active_by_badge,
      [position.badge_id]: activated
    };
    const primary = opts.primary === false ? current.primary : activated;
    let circumstances = current.circumstances;
    if (position.effects && typeof position.effects === "object") {
      circumstances = normalizeCircumstances({ ...circumstances, ...position.effects });
    }
    const history = [{
      type: "activated",
      badge_id: position.badge_id,
      label: position.label,
      at: activated.activated_at
    }].concat(current.history).slice(0, 100);

    setState({ primary, active_by_badge: activeByBadge, circumstances, history });
    return { ok: true, position: activated };
  }

  function clearBadge(badgeId) {
    const id = String(badgeId || "").trim();
    const current = getState();
    if (!id || !current.active_by_badge[id]) return current;
    const nextByBadge = { ...current.active_by_badge };
    delete nextByBadge[id];
    const primary = current.primary?.badge_id === id ? null : current.primary;
    return setState({ ...current, primary, active_by_badge: nextByBadge });
  }

  function setPrimary(badgeId) {
    const id = String(badgeId || "").trim();
    const current = getState();
    const position = current.active_by_badge[id] || null;
    if (!position) return { ok: false, reason: "life_position_not_active" };
    setState({ ...current, primary: position });
    return { ok: true, position };
  }

  function getFormalEmploymentStatus() {
    const job = window.CivicationState?.getActivePosition?.() || null;
    const employed = !!job?.career_id;
    return {
      // status is kept for compatibility with existing callers/tests.
      status: employed ? "employed" : "unemployed",
      formal_status: employed ? "employed" : "no_formal_job",
      is_employed: employed,
      active_job: job
    };
  }

  function getCircumstanceOptions() {
    return Object.fromEntries(Object.entries(CIRCUMSTANCE_OPTIONS)
      .map(([key, values]) => [key, values.map((entry) => ({ ...entry }))]));
  }

  function getLifeContext() {
    const state = getState();
    return {
      employment: getFormalEmploymentStatus(),
      circumstances: { ...state.circumstances },
      circumstance_options: getCircumstanceOptions(),
      primary_life_position: state.primary,
      active_life_positions: Object.values(state.active_by_badge),
      unlocked_life_positions: getAllUnlockedPositions()
    };
  }

  window.CivicationLifePositions = {
    getState,
    ensureCatalogLoaded,
    getBadgeProfile,
    getUnlockedPositions,
    getAllUnlockedPositions,
    getOpenPositions,
    activate,
    clearBadge,
    setPrimary,
    setCircumstances,
    getCircumstanceOptions,
    getFormalEmploymentStatus,
    getLifeContext
  };

  ensureCatalogLoaded();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = window.CivicationLifePositions;
  }
})(typeof window !== "undefined" ? window : globalThis);
