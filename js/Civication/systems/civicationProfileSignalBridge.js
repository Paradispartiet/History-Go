// js/Civication/systems/civicationProfileSignalBridge.js
// CivicationProfileSignalBridge — normaliserer History Go-profilen til rene
// spillsignaler for de PRIVATE fase-mailene.
//
// Prinsipp (se js/Civication/README.md «To rytmer»):
//   Arbeidslivsmail kommer fra aktiv jobb/arbeidsgiver/rolle/arbeidsdag.
//   Private fase-mailer kommer fra History Go-profilen: hvem spilleren er
//   UTENFOR jobben — steder samlet, badges, quiz-styrker, kapital, identitet,
//   psyke, folk møtt og nylige aktiviteter.
//
// Broen LESER kun. Den skriver aldri tilbake til History Go-state, og den
// leser aldri mailPlan, role mail families, plannedPrimary, role_scope,
// employer_id eller workday_day_index — jobb-binding er eksplisitt utenfor
// dens ansvar.
//
// Kilder (alle med trygg fallback til tomme verdier hvis de mangler):
//   - window.HG_IdentityCore.getProfile()/getIdentityState()  (ellers hg_identity_v1)
//   - hg_capital_v1
//   - window.CivicationPsyche.getSnapshot()                    (ellers hg_psyche_v1)
//   - visited_places, merits_by_category, people_collected, hg_learning_log_v1
//   - data/places/places_index.json (kun for å slå opp kategori/bydel på
//     besøkte steder — lastes én gang og caches)
(function () {
  "use strict";

  const PLACES_INDEX_URL = "data/places/places_index.json";

  const CAPITAL_KEYS = [
    "economic", "cultural", "social", "symbolic", "political", "institutional", "subculture"
  ];

  const IDENTITY_FOCUS_KEYS = [
    "economic", "cultural", "social", "symbolic", "subculture", "political"
  ];

  // Kulturbærende History Go-domener (matcher canonical domains + historiske varianter).
  const CULTURE_DOMAINS = ["kunst", "litteratur", "musikk", "historie", "film_tv", "teater"];

  const WEIGHT_TAG_THRESHOLD = 0.45;
  const LOW_ENERGY_THRESHOLD = 0.6;

  let placeIndexPromise = null;

  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function clamp0100(value, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, n));
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function idsFrom(value) {
    if (Array.isArray(value)) {
      return value.map((v) => String(v || "").trim()).filter(Boolean);
    }
    if (value && typeof value === "object") {
      return Object.keys(value).filter((k) => !!value[k]).map((k) => String(k).trim()).filter(Boolean);
    }
    return [];
  }

  // ------------------------------------------------------------
  // Identitet (HG_IdentityCore → hg_identity_v1 → tom)
  // ------------------------------------------------------------
  function readIdentity() {
    let state = null;
    try {
      state = window.HG_IdentityCore?.getProfile?.()
        || window.HG_IdentityCore?.getIdentityState?.()
        || null;
    } catch {
      state = null;
    }

    if (!state) {
      const raw = readJson("hg_identity_v1", null);
      if (raw && typeof raw === "object" && raw.focus && typeof raw.focus === "object") {
        const dominant = Object.entries(raw.focus)
          .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0]?.[0] || null;
        state = { dominant, focus: raw.focus };
      }
    }

    const focus = {};
    IDENTITY_FOCUS_KEYS.forEach((key) => {
      focus[key] = clamp01(state?.focus?.[key]);
    });

    return {
      dominant: state?.dominant ? String(state.dominant) : null,
      focus
    };
  }

  // ------------------------------------------------------------
  // Kapital (hg_capital_v1)
  // ------------------------------------------------------------
  function readCapital() {
    const raw = readJson("hg_capital_v1", {});
    const capital = {};
    CAPITAL_KEYS.forEach((key) => {
      capital[key] = clamp0100(raw?.[key], 0);
    });
    return capital;
  }

  // ------------------------------------------------------------
  // Psyke (CivicationPsyche.getSnapshot → hg_psyche_v1 → nøytral)
  // ------------------------------------------------------------
  function readPsyche() {
    try {
      const snap = window.CivicationPsyche?.getSnapshot?.();
      if (snap && typeof snap === "object") {
        return {
          autonomy: clamp0100(snap.autonomy, 50),
          integrity: clamp0100(snap.integrity, 50),
          visibility: clamp0100(snap.visibility, 50),
          trust: clamp0100(snap.trustSummary?.avgPercent, 50)
        };
      }
    } catch {}

    const raw = readJson("hg_psyche_v1", {});
    const integrity = clamp0100(raw?.integrity, 50);
    const visibility = clamp0100(raw?.visibility, 50);
    const economicRoom = clamp0100(raw?.economicRoom, 50);

    const trustValues = raw?.trust && typeof raw.trust === "object"
      ? Object.values(raw.trust).map(Number).filter(Number.isFinite)
      : [];
    const trust = trustValues.length
      ? clamp0100(trustValues.reduce((a, b) => a + b, 0) / trustValues.length, 50)
      : 50;

    // Grov speiling av CivicationPsyche.computeAutonomy uten identity-boost.
    const autonomy = Number.isFinite(Number(raw?.autonomyOverride))
      ? clamp0100(raw.autonomyOverride, 50)
      : clamp0100(economicRoom * 0.4 + trust * 0.3 + integrity * 0.2 - visibility * 0.2, 50);

    return { autonomy, integrity, visibility, trust };
  }

  // ------------------------------------------------------------
  // History Go-samlingen (visited_places, merits, people, learning log)
  // ------------------------------------------------------------
  function readCollectionRaw() {
    const placesVisited = idsFrom(readJson("visited_places", {}));
    const peopleMet = idsFrom(readJson("people_collected", {}));

    const meritsRaw = readJson("merits_by_category", {});
    const merits = {};
    if (meritsRaw && typeof meritsRaw === "object") {
      Object.keys(meritsRaw).forEach((cat) => {
        const points = Number(meritsRaw[cat]?.points || 0);
        if (points > 0) merits[String(cat).trim()] = points;
      });
    }

    const learningLogRaw = readJson("hg_learning_log_v1", []);
    const learningLog = Array.isArray(learningLogRaw) ? learningLogRaw : [];

    return { placesVisited, peopleMet, merits, learningLog };
  }

  async function loadPlaceIndex() {
    if (!placeIndexPromise) {
      placeIndexPromise = (async () => {
        try {
          if (typeof fetch !== "function") return new Map();
          const res = await fetch(PLACES_INDEX_URL);
          if (!res?.ok) return new Map();
          const list = await res.json();
          const map = new Map();
          (Array.isArray(list) ? list : []).forEach((place) => {
            const id = String(place?.id || "").trim();
            if (id) map.set(id, place);
          });
          return map;
        } catch {
          return new Map();
        }
      })();
    }
    return placeIndexPromise;
  }

  function quizStrengthsFrom(merits, learningLog) {
    const score = { ...merits };
    learningLog.forEach((evt) => {
      const cat = String(evt?.categoryId || "").trim();
      if (!cat) return;
      score[cat] = Number(score[cat] || 0) + 2;
    });
    return Object.entries(score)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 6)
      .map(([cat]) => cat);
  }

  function recentPlacesFrom(learningLog, placesVisited) {
    const visitedSet = new Set(placesVisited);
    const seen = new Set();
    const recent = [];
    const sorted = learningLog
      .slice()
      .sort((a, b) => String(b?.date || b?.ts || "").localeCompare(String(a?.date || a?.ts || "")));
    for (const evt of sorted) {
      const target = String(evt?.targetId || evt?.id || "").trim();
      if (!target || seen.has(target)) continue;
      if (!visitedSet.has(target)) continue;
      seen.add(target);
      recent.push(target);
      if (recent.length >= 8) break;
    }
    if (!recent.length) return placesVisited.slice(-8).reverse();
    return recent;
  }

  async function readCollection() {
    const raw = readCollectionRaw();
    const index = await loadPlaceIndex();

    const categoryCounts = {};
    const districts = {};
    raw.placesVisited.forEach((id) => {
      const place = index.get(id);
      if (!place) return;
      const category = String(place.category || "").trim();
      if (category) categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      const district = String(place.district || place.bydel || "").trim();
      if (district) districts[district] = (districts[district] || 0) + 1;
    });

    return {
      placesVisited: raw.placesVisited,
      placeCategories: Object.entries(categoryCounts)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([cat]) => cat),
      placeCategoryCounts: categoryCounts,
      badges: Object.keys(raw.merits),
      meritPoints: raw.merits,
      quizStrengths: quizStrengthsFrom(raw.merits, raw.learningLog),
      quizEventCount: raw.learningLog.length,
      peopleMet: raw.peopleMet,
      recentPlaces: recentPlacesFrom(raw.learningLog, raw.placesVisited),
      favoriteDistricts: Object.entries(districts)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 3)
        .map(([district]) => district)
    };
  }

  // ------------------------------------------------------------
  // Vekter og tags
  // ------------------------------------------------------------

  // Domenesignal 0..1: kombinerer besøkte steder og badge-poeng i domenene.
  function domainSignal(collection, domains) {
    let places = 0;
    let points = 0;
    domains.forEach((domain) => {
      places += Number(collection.placeCategoryCounts?.[domain] || 0);
      points += Number(collection.meritPoints?.[domain] || 0);
    });
    return clamp01((places + points / 10) / 4);
  }

  function computePrivatePhaseWeights(identity, capital, psyche, collection) {
    const focus = identity.focus || {};
    const cap = (key) => clamp01(Number(capital?.[key] || 0) / 100);

    const culture = clamp01(
      0.4 * focus.cultural + 0.4 * cap("cultural") + 0.5 * domainSignal(collection, CULTURE_DOMAINS)
    );
    const sport = clamp01(
      0.9 * domainSignal(collection, ["sport"]) + 0.2 * focus.social
    );
    const nature = clamp01(
      0.95 * domainSignal(collection, ["natur"])
    );
    const politics = clamp01(
      0.4 * focus.political + 0.4 * cap("political") + 0.5 * domainSignal(collection, ["politikk"])
    );
    const social = clamp01(
      0.35 * focus.social + 0.35 * cap("social") + 0.4 * clamp01(collection.peopleMet.length / 8)
    );
    const learning = clamp01(
      0.8 * clamp01(collection.quizEventCount / 12) + 0.3 * clamp01(collection.badges.length / 6)
    );
    const economy = clamp01(
      0.5 * focus.economic + 0.5 * cap("economic")
    );
    // Lav autonomi/integritet → høy hvilevekt. Nøytral psyke (50/50) → 0.5.
    const rest = clamp01(1 - (psyche.autonomy + psyche.integrity) / 200);
    const family = clamp01(0.3 + 0.4 * focus.social);
    const subculture = clamp01(
      0.4 * focus.subculture + 0.4 * cap("subculture") + 0.5 * domainSignal(collection, ["subkultur"])
    );

    return { culture, sport, nature, politics, social, learning, economy, rest, family, subculture };
  }

  function computeProfileTags(identity, weights, collection) {
    const tags = new Set();

    const themeKeys = ["culture", "sport", "nature", "politics", "social", "learning", "economy", "subculture"];
    themeKeys.forEach((key) => {
      if (Number(weights[key] || 0) >= WEIGHT_TAG_THRESHOLD) tags.add(key);
    });

    if (Number(weights.rest || 0) >= LOW_ENERGY_THRESHOLD) {
      tags.add("low_energy");
      tags.add("rest");
    }

    // Domenetags fra samlingen (norske canonical-domener), både steder og badges.
    collection.placeCategories.forEach((cat) => tags.add(cat));
    collection.badges.forEach((cat) => tags.add(cat));

    if (collection.peopleMet.length >= 3) tags.add("people");
    if (identity.dominant) tags.add(`identity_${identity.dominant}`);

    return Array.from(tags);
  }

  // ------------------------------------------------------------
  // Hoved-API
  // ------------------------------------------------------------
  async function getSignals() {
    const identity = readIdentity();
    const capital = readCapital();
    const psyche = readPsyche();
    const collection = await readCollection();

    const privatePhaseWeights = computePrivatePhaseWeights(identity, capital, psyche, collection);
    const profileTags = computeProfileTags(identity, privatePhaseWeights, collection);

    return {
      identity,
      capital,
      psyche,
      historyGoCollection: {
        placesVisited: collection.placesVisited,
        placeCategories: collection.placeCategories,
        badges: collection.badges,
        quizStrengths: collection.quizStrengths,
        peopleMet: collection.peopleMet,
        recentPlaces: collection.recentPlaces,
        favoriteDistricts: collection.favoriteDistricts
      },
      profileTags,
      privatePhaseWeights
    };
  }

  function invalidateCache() {
    placeIndexPromise = null;
  }

  window.CivicationProfileSignalBridge = {
    getSignals,
    readIdentity,
    readCapital,
    readPsyche,
    readCollection,
    computePrivatePhaseWeights,
    computeProfileTags,
    invalidateCache,
    WEIGHT_TAG_THRESHOLD,
    LOW_ENERGY_THRESHOLD
  };
})();
