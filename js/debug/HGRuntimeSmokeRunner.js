(function () {
  "use strict";

  const root = /** @type {any} */ (typeof window !== "undefined" ? window : globalThis);
  const FORBIDDEN_FIELDS = new Set(["lat", "lng", "latitude", "longitude", "gps", "liveLocation", "presence", "isOnline", "lastSeen", "followers", "followerCount", "following"]);

  function isEnabled() {
    try {
      return root.localStorage?.getItem?.("HG_TEST_MODE") === "1";
    } catch (_error) {
      return false;
    }
  }

  function now() { return new Date().toISOString(); }
  function list(value) { return Array.isArray(value) ? value : []; }
  function count(value) { return Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value).length : 0; }
  function check(ok, status, message, details) { return { ok: !!ok, status, message, details: details || {} }; }
  function blocker(key, message, details, checkName) { return { key, message, details: details || {}, check: checkName || null }; }
  function warning(key, message, details, checkName) { return { key, message, details: details || {}, check: checkName || null }; }
  async function safeAsync(fn) { try { return { value: await fn() }; } catch (error) { return { error }; } }
  function safeSync(fn) { try { return { value: fn() }; } catch (error) { return { error }; } }
  function errorMessage(error) { return String(error?.message || error || "unknown error"); }

  function pushReportIssues(report, blockers, warnings, checkName, options) {
    list(report?.blockers).forEach((item) => blockers.push(blocker(item?.key || `${checkName}_blocker`, item?.message || String(item?.key || item), item, checkName)));
    list(report?.warnings).forEach((item) => warnings.push(warning(item?.key || `${checkName}_warning`, item?.message || String(item?.key || item), item, checkName)));
    if (options?.privacy) list(report?.privacyViolations || report?.privacy_violations).forEach((item) => blockers.push(blocker(item?.key || "privacy_violation", item?.message || "Personvernfelt funnet.", item, checkName)));
  }

  function scanForbidden(value, path, found, seen) {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);
    Object.keys(value).forEach((key) => {
      const nextPath = path ? `${path}.${key}` : key;
      if (FORBIDDEN_FIELDS.has(key)) found.push({ field: key, path: nextPath });
      scanForbidden(value[key], nextPath, found, seen);
    });
  }

  function summaryFor(blockers, warnings, skipped) {
    if (skipped) return "Smoke-test stoppet: testmodus er av.";
    if (blockers.length) return "Smoke-test fant blokkere.";
    if (warnings.length) return "Smoke-test bestått med advarsler.";
    return "Smoke-test bestått.";
  }

  async function run() {
    if (!isEnabled()) return { ok: false, skipped: true, reason: "test_mode_disabled" };

    const checks = {};
    const blockers = [];
    const warnings = [];
    let runtimeReport = null;
    let runtimeSnapshot = null;
    let socialReport = null;
    let socialSnapshot = null;

    if (!root.HG_RuntimeHealth?.health) {
      blockers.push(blocker("runtime_health_missing", "HG_RuntimeHealth.health mangler.", {}, "runtimeHealth"));
      checks.runtimeHealth = check(false, "blocker", "Runtime health mangler.");
    } else {
      const result = await safeAsync(() => root.HG_RuntimeHealth.health());
      if (result.error) {
        blockers.push(blocker("runtime_health_failed", "HG_RuntimeHealth.health feilet.", { error: errorMessage(result.error) }, "runtimeHealth"));
        checks.runtimeHealth = check(false, "blocker", "Runtime health feilet.", { error: errorMessage(result.error) });
      } else {
        runtimeReport = result.value;
        if (typeof root.HG_RuntimeHealth?.snapshot === "function") {
          const snap = await safeAsync(() => root.HG_RuntimeHealth.snapshot());
          if (!snap.error) runtimeSnapshot = snap.value;
        }
        pushReportIssues(runtimeReport, blockers, warnings, "runtimeHealth");
        checks.runtimeHealth = check(list(runtimeReport?.blockers).length === 0, list(runtimeReport?.blockers).length ? "blocker" : list(runtimeReport?.warnings).length ? "warning" : "ok", "Runtime health lest.", { score: runtimeReport?.score, summary: runtimeReport?.summary });
      }
    }

    const places = root.PLACES;
    if (!Array.isArray(places) || places.length < 1) blockers.push(blocker("places_missing", "PLACES mangler eller er tom.", { places: count(places) }, "mapData"));
    if (root.PEOPLE != null && count(root.PEOPLE) === 0) warnings.push(warning("people_empty", "PEOPLE finnes, men er tom.", { people: 0 }, "mapData"));
    if (root.TAGS_REGISTRY != null && count(root.TAGS_REGISTRY) === 0) warnings.push(warning("tags_empty", "TAGS_REGISTRY finnes, men er tom.", { tags: 0 }, "mapData"));
    checks.mapData = check(Array.isArray(places) && places.length > 0, Array.isArray(places) && places.length > 0 ? "ok" : "blocker", "Kartdata kontrollert.", { places: count(places), people: root.PEOPLE == null ? null : count(root.PEOPLE), tags: root.TAGS_REGISTRY == null ? null : count(root.TAGS_REGISTRY) });

    const quiz = safeSync(() => root.HGLearningLog?.getQuizHistory?.());
    const visit = safeSync(() => typeof root.HGLearningLog?.getVisitHistory === "function" ? root.HGLearningLog.getVisitHistory() : undefined);
    if (!root.HGLearningLog) warnings.push(warning("learning_log_missing", "HGLearningLog mangler.", {}, "learningLog"));
    if (quiz.error) warnings.push(warning("quiz_history_failed", "getQuizHistory feilet.", { error: errorMessage(quiz.error) }, "learningLog"));
    if (visit.error) warnings.push(warning("visit_history_failed", "getVisitHistory feilet.", { error: errorMessage(visit.error) }, "learningLog"));
    checks.learningLog = check(!quiz.error && !visit.error, quiz.error || visit.error || !root.HGLearningLog ? "warning" : "ok", "Læringslogg kontrollert.", { hasLog: !!root.HGLearningLog, quizCount: count(quiz.value), visitCount: count(visit.value) });

    for (const [name, globalName] of [["civication", "HG_CiviDebug"], ["social", "HG_SocialDebug"]]) {
      const health = root[globalName]?.health;
      if (typeof health === "function") {
        const result = await safeAsync(() => health());
        if (result.error) blockers.push(blocker(`${name}_health_failed`, `${name} health feilet.`, { error: errorMessage(result.error) }, name));
        else {
          if (name === "social") {
            socialReport = result.value;
            if (typeof root.HG_SocialDebug?.snapshot === "function") {
              const snap = await safeAsync(() => root.HG_SocialDebug.snapshot());
              if (!snap.error) socialSnapshot = snap.value;
            }
          }
          pushReportIssues(result.value, blockers, warnings, name, { privacy: name === "social" });
        }
        checks[name] = check(!result.error && !list(result.value?.blockers).length, result.error || list(result.value?.blockers).length ? "blocker" : list(result.value?.warnings).length ? "warning" : "ok", `${name} health kontrollert.`, { summary: result.value?.summary });
      } else {
        warnings.push(warning(`${name}_health_missing`, `${globalName}.health mangler.`, {}, name));
        checks[name] = check(true, "warning", `${name} health mangler.`);
      }
    }

    const prof = safeSync(() => typeof root.HG_CiviProfileSnapshot === "function" ? root.HG_CiviProfileSnapshot() : undefined);
    if (prof.error) warnings.push(warning("profile_snapshot_failed", "HG_CiviProfileSnapshot feilet.", { error: errorMessage(prof.error) }, "profile"));
    if (typeof root.HG_CiviProfileSnapshot !== "function") warnings.push(warning("profile_snapshot_missing", "HG_CiviProfileSnapshot mangler.", {}, "profile"));
    checks.profile = check(!prof.error, prof.error || typeof root.HG_CiviProfileSnapshot !== "function" ? "warning" : "ok", "Profiltilgjengelighet kontrollert.", { hasSnapshot: typeof root.HG_CiviProfileSnapshot === "function", hasProfileGlobal: !!(root.HGProfile || root.ProfileIdentity || root.initMiniProfile) });

    const placeReady = Array.isArray(places) && places.some((p) => p && (p.id || p.title || p.name));
    const openerReady = typeof root.openPlaceCard === "function" || typeof root.HGMapView?.openPlaceCard === "function";
    if (!placeReady) blockers.push(blocker("place_card_place_missing", "Ingen stedobjekter har id/title/name.", {}, "placeCardReadiness"));
    checks.placeCardReadiness = check(placeReady, placeReady ? openerReady ? "ok" : "warning" : "blocker", "PlaceCard-readiness kontrollert uten å åpne kort.", { hasReadablePlace: placeReady, hasOpener: openerReady });
    if (placeReady && !openerReady) warnings.push(warning("place_card_opener_missing", "openPlaceCard/HGMapView.openPlaceCard mangler.", {}, "placeCardReadiness"));


    const demoSnap = safeSync(() => root.HG_SocialDemo?.snapshot?.());
    if (!isEnabled()) {
      checks.socialDemoVisible = check(true, "ok", "Social demo ikke synlig uten TEST_MODE.");
    } else if (!demoSnap.value?.seeded) {
      warnings.push(warning("social_demo_not_seeded", "HG Social demo er ikke seedet.", {}, "socialDemoVisible"));
      checks.socialDemoVisible = check(true, "warning", "Social demo ikke seedet.");
    } else {
      const profiles = list(demoSnap.value.profiles);
      const adapter = root.HG_SocialDemoAdapter;
      const fakeIds = new Set(profiles.map((p) => p?.userId).filter(Boolean));
      const leaked = list(root.PEOPLE).filter((p) => fakeIds.has(p?.userId || p?.id));
      if (leaked.length) blockers.push(blocker("demo_users_leaked_global_people", "Demo users leaked into global PEOPLE", { count: leaked.length }, "socialDemoVisible"));
      if (!adapter) blockers.push(blocker("social_demo_adapter_missing", "HG_SocialDemoAdapter mangler.", {}, "socialDemoVisible"));
      if (profiles.length < 8) blockers.push(blocker("social_demo_profiles_low", "Demo profile count er under 8.", { count: profiles.length }, "socialDemoVisible"));
      const samplePlace = list(root.PLACES)[0] || { id: "factory_memory" };
      const demoMatches = safeSync(() => adapter?.getPeopleForPlace?.(samplePlace));
      if (!list(demoMatches.value).length) blockers.push(blocker("social_demo_place_matches_missing", "Ingen demo-matcher for teststed.", {}, "socialDemoVisible"));
      if (typeof root.HG_SocialDemo?.sendDemoInvite !== "function") blockers.push(blocker("social_demo_invite_missing", "sendDemoInvite mangler.", {}, "socialDemoVisible"));
      const demoPrivacy = root.HG_SocialDemo?.scanForbiddenFields?.(demoSnap.value);
      if (demoPrivacy && demoPrivacy.ok === false) list(demoPrivacy.blockers).forEach((item) => blockers.push(blocker("social_demo_privacy", "Demo personvernscan feilet.", item, "socialDemoVisible")));
      checks.socialDemoVisible = check(!leaked.length && !!adapter && profiles.length >= 8 && list(demoMatches.value).length > 0, leaked.length ? "blocker" : "ok", "Social demo synlighet kontrollert.", { profiles: profiles.length, matches: list(demoMatches.value).length });
    }

    const privacyFound = [];
    scanForbidden({ runtimeReport, runtimeSnapshot, socialReport, socialSnapshot }, "snapshots", privacyFound, new WeakSet());
    privacyFound.forEach((item) => blockers.push(blocker("privacy_forbidden_field", `Forbudt personvernfelt funnet: ${item.path}`, item, "privacy")));
    checks.privacy = check(privacyFound.length === 0, privacyFound.length ? "blocker" : "ok", privacyFound.length ? "Personvernfelt funnet." : "Ingen forbudte personvernfelt funnet.", { found: privacyFound });

    const score = Math.max(0, 100 - blockers.length * 25 - warnings.length * 5);
    const result = { ok: blockers.length === 0, skipped: false, score, checks, blockers, warnings, summary: summaryFor(blockers, warnings, false), timestamp: now() };
    // Re-scan final result after summary fields exist.
    const finalPrivacy = [];
    scanForbidden(result, "result", finalPrivacy, new WeakSet());
    finalPrivacy.filter((item) => !privacyFound.some((old) => old.path === item.path)).forEach((item) => result.blockers.push(blocker("privacy_forbidden_field", `Forbudt personvernfelt funnet: ${item.path}`, item, "privacy")));
    if (result.blockers.length !== blockers.length) {
      result.ok = false;
      result.score = Math.max(0, 100 - result.blockers.length * 25 - result.warnings.length * 5);
      result.summary = summaryFor(result.blockers, result.warnings, false);
      result.checks.privacy = check(false, "blocker", "Personvernfelt funnet.", { found: finalPrivacy });
    }
    return result;
  }

  async function print() {
    const result = await run();
    if (result.skipped) {
      console.info("HG runtime smoke: skipped", result.reason || result.summary);
      return result;
    }
    console.info(`HG runtime smoke: score ${result.score} – ${result.summary}`);
    if (result.blockers?.length) console.warn("Blockers", result.blockers);
    if (result.warnings?.length) console.warn("Warnings", result.warnings);
    console.table?.(Object.entries(result.checks || {}).map(([name, value]) => ({ check: name, status: value.status, ok: value.ok, message: value.message })));
    return result;
  }

  root.HG_RuntimeSmokeRunner = { run, print, isEnabled };
}());
