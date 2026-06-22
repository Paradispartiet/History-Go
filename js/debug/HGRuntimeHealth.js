(function () {
  "use strict";

  const root = /** @type {any} */ (typeof window !== "undefined" ? window : globalThis);

  function now() {
    return new Date().toISOString();
  }

  function isArray(value) {
    return Array.isArray(value);
  }

  function countList(value) {
    if (isArray(value)) return value.length;
    if (value && typeof value === "object") return Object.keys(value).length;
    return 0;
  }

  function hasNonEmptyList(value) {
    return countList(value) > 0;
  }

  function safeCall(fn, fallback) {
    try {
      if (typeof fn !== "function") return fallback;
      const value = fn();
      return value == null ? fallback : value;
    } catch (_error) {
      return fallback;
    }
  }

  async function safeAwait(fn, fallback) {
    try {
      if (typeof fn !== "function") return fallback;
      const value = await fn();
      return value == null ? fallback : value;
    } catch (error) {
      return { error: String(error && error.message || error) };
    }
  }

  function readStorageJson(key, fallback) {
    try {
      const storage = root.localStorage;
      if (!storage || typeof storage.getItem !== "function") return fallback;
      const raw = storage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_error) {
      return fallback;
    }
  }

  function getQuizHistory() {
    const fromLog = safeCall(() => root.HGLearningLog?.getQuizHistory?.(), null);
    if (isArray(fromLog)) return fromLog;
    const fromStorage = readStorageJson("hg_learning_log_v1", null);
    if (isArray(fromStorage)) return fromStorage;
    const progress = readStorageJson("quiz_progress", null);
    if (progress && typeof progress === "object") {
      if (isArray(progress.completed)) return progress.completed;
      if (progress.completed && typeof progress.completed === "object") return Object.keys(progress.completed);
    }
    return null;
  }

  function getVisitHistory() {
    const fromLog = safeCall(() => root.HGLearningLog?.getVisitHistory?.(), null);
    if (isArray(fromLog)) return fromLog;
    const visitedPlaces = readStorageJson("visited_places", null);
    if (isArray(visitedPlaces)) return visitedPlaces;
    if (visitedPlaces && typeof visitedPlaces === "object") return Object.keys(visitedPlaces).filter((key) => !!visitedPlaces[key]);
    if (root.visited && typeof root.visited === "object") return Object.keys(root.visited).filter((key) => !!root.visited[key]);
    return null;
  }

  function getNearbyPlaces() {
    const candidates = [
      root.nearbyPlaces,
      root.NEARBY_PLACES,
      root.HG_NEARBY_PLACES,
      root.renderedPlaces,
      root.HG_RENDERED_PLACES,
      safeCall(() => root.HGMapView?.getNearbyPlaces?.(), null),
      safeCall(() => root.HGMap?.getNearbyPlaces?.(), null)
    ];
    return candidates.find((candidate) => isArray(candidate)) || null;
  }

  function getMapObject() {
    return root.MAP || root.map || root.HGMap?.map || root.HGMap || root.HGMapView || null;
  }

  async function snapshot() {
    const civication = await safeAwait(() => root.HG_CiviDebug?.health?.(), null);
    const social = await safeAwait(() => root.HG_SocialDebug?.health?.(), null);
    const places = root.PLACES;
    const people = root.PEOPLE;
    const tags = root.TAGS_REGISTRY;
    const mapObject = getMapObject();
    const nearby = getNearbyPlaces();
    const quizHistory = getQuizHistory();
    const visitHistory = getVisitHistory();

    return {
      civication,
      social,
      core: {
        hasPLACES: isArray(places),
        hasPEOPLE: isArray(people),
        hasTAGS_REGISTRY: !!tags,
        hasMAP: !!mapObject,
        hasHGLearningLog: !!root.HGLearningLog,
        hasAppRouter: !!(root.AppRouter || root.HGAppRouter),
        hasHGMapView: !!root.HGMapView
      },
      map: {
        placeCount: countList(places),
        peopleCount: countList(people),
        hasMapObject: !!mapObject,
        userLocationStatus: root.HGPos?.status || root.userLocationStatus || root.HG_USER_LOCATION_STATUS || null,
        hasUserLocation: !!(root.userPos || root.USER_POS || root.HGPos?.last || root.HGPos?.current),
        nearbyPlacesCount: isArray(nearby) ? nearby.length : null,
        hasNearbyPlaces: isArray(nearby) ? nearby.length > 0 : false
      },
      profile: {
        hasProfileLink: !!(safeCall(() => root.document?.querySelector?.('a[href*="profile"]'), null)),
        hasProfileGlobal: !!(root.HGProfile || root.ProfileIdentity || root.initMiniProfile),
        hasLearningLog: !!root.HGLearningLog,
        completedQuizCount: isArray(quizHistory) ? quizHistory.length : null,
        visitedCount: isArray(visitHistory) ? visitHistory.length : null
      },
      data: {
        places: countList(places),
        people: countList(people),
        tags: countList(tags),
        badges: root.BADGES == null ? null : countList(root.BADGES),
        careers: root.HG_CAREERS == null ? null : countList(isArray(root.HG_CAREERS) ? root.HG_CAREERS : root.HG_CAREERS?.careers)
      },
      timestamp: now()
    };
  }

  function makeCheck(ok, status, message, details) {
    return { ok: !!ok, status, message, details: details || {} };
  }

  function addBlocker(list, key, message, details, subsystem) {
    list.push({ key, message, details: details || {}, subsystem: subsystem || null });
  }

  function addWarning(list, key, message, details, subsystem) {
    list.push({ key, message, details: details || {}, subsystem: subsystem || null });
  }

  function listFrom(value) {
    return isArray(value) ? value : [];
  }

  function extractSubsystemBlockers(report, subsystem) {
    const blockers = listFrom(report?.blockers).map((item) => ({
      key: item?.key || item?.id || item?.warning || `${subsystem}_blocker`,
      message: item?.message || String(item?.key || item?.id || item || `${subsystem} blocker`),
      details: item,
      subsystem
    }));
    if (subsystem === "social") {
      listFrom(report?.privacyViolations || report?.privacy_violations).forEach((item) => blockers.push({
        key: item?.key || item?.id || "social_privacy_violation",
        message: item?.message || "HG Social privacy violation",
        details: item,
        subsystem
      }));
    }
    return blockers;
  }

  function extractSubsystemWarnings(report, subsystem) {
    return listFrom(report?.warnings).map((item) => ({
      key: item?.key || item?.id || item?.warning || `${subsystem}_warning`,
      message: item?.message || String(item?.key || item?.id || item?.warning || item || `${subsystem} warning`),
      details: item,
      subsystem
    }));
  }

  async function health() {
    const snap = await snapshot();
    const blockers = [];
    const warnings = [];

    if (!hasNonEmptyList(root.PLACES)) addBlocker(blockers, "places_missing", "PLACES mangler eller er tom.", { places: snap.data.places });
    if (!hasNonEmptyList(root.PEOPLE)) addWarning(warnings, "people_missing", "PEOPLE mangler eller er tom.", { people: snap.data.people });
    if (!root.TAGS_REGISTRY) addWarning(warnings, "tags_missing", "TAGS_REGISTRY mangler.", { tags: snap.data.tags });
    if (!root.HGLearningLog) addWarning(warnings, "learning_log_missing", "HGLearningLog mangler.", {});

    const mapExpectsPage = !!(root.document?.getElementById?.("map") || root.document?.getElementById?.("mapView") || root.location?.hash === "#/map" || hasNonEmptyList(root.PLACES));
    if (!snap.map.hasMapObject && mapExpectsPage) addBlocker(blockers, "map_object_missing", "Kartobjekt mangler for kartflyt.", snap.map);
    if (!snap.map.hasUserLocation) addWarning(warnings, "user_location_unavailable", "Brukerposisjon er ikke tilgjengelig.", snap.map);
    if (!snap.map.hasNearbyPlaces) addWarning(warnings, "nearby_places_unavailable", "Ingen nearby/rendered places kunne oppdages.", snap.map);

    if (snap.data.places === 0 && !blockers.some((b) => b.key === "places_missing")) addBlocker(blockers, "places_count_zero", "Stedsdata har 0 steder.", snap.data);
    if (snap.data.badges == null || snap.data.badges === 0) addWarning(warnings, "badges_missing", "BADGES mangler eller er tom.", snap.data);
    if (snap.data.careers == null || snap.data.careers === 0) addWarning(warnings, "careers_missing", "HG_CAREERS mangler eller er tom.", snap.data);
    if (!root.TAGS_REGISTRY || snap.data.tags === 0) addWarning(warnings, "data_tags_missing", "Tags mangler i datalaget.", snap.data);

    if (snap.profile.completedQuizCount == null) addWarning(warnings, "quiz_history_unavailable", "Quizhistorikk er ikke tilgjengelig.", snap.profile);
    if (snap.profile.visitedCount == null) addWarning(warnings, "visited_history_unavailable", "Besøkshistorikk er ikke tilgjengelig.", snap.profile);

    const civBlockers = extractSubsystemBlockers(snap.civication, "civication");
    const civiWarnings = extractSubsystemWarnings(snap.civication, "civication");
    const socialBlockers = extractSubsystemBlockers(snap.social, "social");
    const socialWarnings = extractSubsystemWarnings(snap.social, "social");
    blockers.push(...civBlockers, ...socialBlockers);
    warnings.push(...civiWarnings, ...socialWarnings);

    const checks = {
      core: makeCheck(!blockers.some((b) => b.key === "places_missing"), blockers.some((b) => b.key === "places_missing") ? "blocker" : warnings.some((w) => ["people_missing", "tags_missing", "learning_log_missing"].includes(w.key)) ? "warning" : "ok", "Kjerneglobale er vurdert.", snap.core),
      map: makeCheck(!blockers.some((b) => b.key === "map_object_missing"), blockers.some((b) => b.key === "map_object_missing") ? "blocker" : warnings.some((w) => ["user_location_unavailable", "nearby_places_unavailable"].includes(w.key)) ? "warning" : "ok", "Kartflyt er vurdert.", snap.map),
      data: makeCheck(snap.data.places > 0, snap.data.places > 0 ? (warnings.some((w) => ["badges_missing", "careers_missing", "data_tags_missing"].includes(w.key)) ? "warning" : "ok") : "blocker", "Datagrunnlag er vurdert.", snap.data),
      profile: makeCheck(!!root.HGLearningLog || snap.profile.completedQuizCount != null || snap.profile.visitedCount != null, warnings.some((w) => ["quiz_history_unavailable", "visited_history_unavailable"].includes(w.key)) ? "warning" : "ok", "Profil/learning-log er vurdert.", snap.profile),
      civication: makeCheck(civBlockers.length === 0, civBlockers.length ? "blocker" : civiWarnings.length ? "warning" : snap.civication ? "ok" : "not_loaded", snap.civication ? "Civication diagnostics er aggregert." : "Civication diagnostics er ikke lastet på denne siden.", snap.civication || {}),
      social: makeCheck(socialBlockers.length === 0, socialBlockers.length ? "blocker" : socialWarnings.length ? "warning" : snap.social ? "ok" : "not_loaded", snap.social ? "HG Social diagnostics er aggregert." : "HG Social diagnostics er ikke lastet på denne siden.", snap.social || {})
    };

    const subsystemBlockerCount = civBlockers.length + socialBlockers.length;
    const ownBlockerCount = Math.max(0, blockers.length - subsystemBlockerCount);
    const score = Math.max(0, 100 - ownBlockerCount * 25 - subsystemBlockerCount * 15 - warnings.length * 5);
    const hasPrivacyBlocker = socialBlockers.some((b) => /privacy|personvern/i.test(`${b.key} ${b.message}`));
    const summary = hasPrivacyBlocker
      ? "History Go har personvernblokkere."
      : blockers.length
        ? "History Go har blokkere som bør fikses før testing."
        : warnings.length
          ? "History Go er spillbart, men har advarsler."
          : "History Go ser spillbart ut.";

    return { ok: blockers.length === 0, score, checks, blockers, warnings, summary, timestamp: now() };
  }

  async function printHealth() {
    const report = await health();
    const log = root.console || console;
    log.log?.(`HG Runtime Health: ${report.score}/100`);
    log.log?.(report.summary);
    if (report.blockers.length) log.warn?.("Blockers", report.blockers);
    if (report.warnings.length) log.warn?.("Warnings", report.warnings);
    log.table?.(Object.entries(report.checks).map(([name, check]) => ({ name, ok: check.ok, status: check.status, message: check.message })));
    if (report.checks.civication.details?.summary) log.log?.(`Civication: ${report.checks.civication.details.summary}`);
    if (report.checks.social.details?.summary) log.log?.(`HG Social: ${report.checks.social.details.summary}`);
    return report;
  }

  root.HG_RuntimeHealth = { snapshot, health, printHealth };
}());
