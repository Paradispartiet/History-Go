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
    const socialSignals = safeCall(() => root.HG_SocialSignals?.getSummary?.(), null);
    const socialSignalHealth = safeCall(() => root.HG_SocialSignals?.health?.(), null);
    const publicProfile = safeCall(() => root.HG_PublicProfileReadModel?.getReadModel?.(), null);
    const publicProfileHealth = safeCall(() => root.HG_PublicProfileReadModel?.health?.(), null);
    const matchGraph = safeCall(() => root.HG_SocialMatchGraph?.buildMatchGraph?.({ limit: 10 }), null);
    const matchGraphHealth = safeCall(() => root.HG_SocialMatchGraph?.health?.(), null);
    const spotmeetingHealth = safeCall(() => root.HG_Spotmeeting?.health?.(), null);
    const spotmeetingConfig = safeCall(() => root.HG_Spotmeeting?.getSpotmeetingConfig?.(), null);
    const dailyObjectives = safeCall(() => root.HG_DailyObjectives?.getSummary?.(), null);
    const dailyObjectivesHealth = safeCall(() => root.HG_DailyObjectives?.health?.(), null);
    const dailyProgress = safeCall(() => root.HG_DailyProgress?.getSummary?.(), null);
    const dailyProgressHealth = safeCall(() => root.HG_DailyProgress?.health?.(), null);
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
      socialSignals,
      socialSignalHealth,
      publicProfile,
      publicProfileHealth,
      matchGraph,
      matchGraphHealth,
      spotmeetingHealth,
      spotmeetingConfig,
      profileSocialMeet: {
        hasSocialMeetTab: !!root.document?.querySelector?.('.profile-tab[data-tab="socialmeet"], [role="tab"][data-tab="socialmeet"]'),
        hasSpotmeetingInbox: !!root.document?.getElementById?.("spotmeeting-inbox"),
        hasSpotmeetingInboxRenderer: typeof root.renderSpotmeetingInbox === "function",
        hasPlaceCardDemo: !!root.HG_SpotmeetingPlaceCardDemo
      },
      dailyObjectives,
      dailyObjectivesHealth,
      dailyProgress,
      dailyProgressHealth,
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

  let healthDepth = 0;

  async function health() {
    if (healthDepth > 0) {
      return { ok: true, score: 100, checks: {}, blockers: [], warnings: [{ key: "runtime_health_reentrant", message: "RuntimeHealth health is already running.", subsystem: "runtime" }], summary: "RuntimeHealth reentrant call skipped.", timestamp: now() };
    }
    healthDepth += 1;
    try {
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
    const signalBlockers = listFrom(snap.socialSignalHealth?.blockers).map((item) => ({
      key: item?.key || "social_signal_privacy",
      message: item?.message || "HG Social Signals privacy blocker",
      details: item,
      subsystem: "social"
    }));
    const matchGraphBlockers = listFrom(snap.matchGraphHealth?.blockers).map((item)=>({key:item?.key||'match_graph_privacy',message:item?.message||'Match graph privacy blocker',details:item,subsystem:'social'}));
    if (snap.matchGraphHealth?.warnings) listFrom(snap.matchGraphHealth.warnings).forEach((item)=>warnings.push({key:item?.key||item||'match_graph_warning',message:item?.message||String(item?.key||item||'Match graph warning'),details:item,subsystem:'social'}));
    const dailyProgressBlockers = listFrom(snap.dailyProgressHealth?.blockers).map((item)=>({key:item?.key||'daily_progress_blocker',message:item?.message||'Daily progress blocker',details:item,subsystem:'dailyProgress'}));
    if (snap.dailyProgressHealth?.warnings) listFrom(snap.dailyProgressHealth.warnings).forEach((item)=>warnings.push({key:item?.key||'daily_progress_warning',message:item?.message||String(item?.key||item||'Daily progress warning'),details:item,subsystem:'dailyProgress'}));
    const dailyObjectiveBlockers = listFrom(snap.dailyObjectivesHealth?.blockers).map((item)=>({key:item?.key||'daily_objectives_blocker',message:item?.message||'Daily objectives blocker',details:item,subsystem:'dailyObjectives'}));
    if (snap.dailyObjectivesHealth?.warnings) listFrom(snap.dailyObjectivesHealth.warnings).forEach((item)=>warnings.push({key:item?.key||'daily_objectives_warning',message:item?.message||String(item?.key||item||'Daily objectives warning'),details:item,subsystem:'dailyObjectives'}));
    const spotmeetingBlockers = listFrom(snap.spotmeetingHealth?.blockers).map((item)=>({key:item?.key||'spotmeeting_privacy',message:item?.message||'Spotmeeting privacy blocker',details:item,subsystem:'social'}));
    if (snap.spotmeetingHealth?.warnings) listFrom(snap.spotmeetingHealth.warnings).forEach((item)=>warnings.push({key:item?.key||'spotmeeting_warning',message:item?.message||String(item?.key||item||'Spotmeeting warning'),details:item,subsystem:'social'}));
    const spotmeetingPrivacyReject = safeCall(() => root.HG_Spotmeeting?.canCreateSpotmeetingInvite?.("runtime-health-target", { contextType: "place", contextId: "runtime-health-place", title: "Runtime health", reason: "Runtime health", sourceSurface: "runtimeHealth", latitude: 1 }), null);
    const spotmeetingPresetOnly = listFrom(snap.spotmeetingConfig?.presetMessages).length > 0 && listFrom(snap.spotmeetingConfig?.presetMessages).every((preset) => preset?.presetMessageId && preset?.label && !preset?.freeText);
    const spotmeetingReadiness = snap.spotmeetingConfig ? { backendReady: snap.spotmeetingConfig.backendReady === true, identityReady: snap.spotmeetingConfig.identityReady === true, invitePersistenceReady: snap.spotmeetingConfig.invitePersistenceReady === true, moderationReady: snap.spotmeetingConfig.moderationReady === true, productionDiscoveryEnabled: snap.spotmeetingConfig.productionDiscoveryEnabled === true } : null;
    const spotmeetingDiscoverySafe = !spotmeetingReadiness || spotmeetingReadiness.productionDiscoveryEnabled === (spotmeetingReadiness.backendReady && spotmeetingReadiness.identityReady && spotmeetingReadiness.invitePersistenceReady && spotmeetingReadiness.moderationReady);
    const spotmeetingDiscoveryDisabledByDefault = !spotmeetingReadiness || (spotmeetingReadiness.productionDiscoveryEnabled === false && spotmeetingReadiness.backendReady === false && spotmeetingReadiness.identityReady === false && spotmeetingReadiness.invitePersistenceReady === false && spotmeetingReadiness.moderationReady === false);
    const spotmeetingDemoLeaked = listFrom(root.PEOPLE).filter((person) => String(person?.id || person?.userId || "").startsWith("demo-"));
    if (!root.HG_Spotmeeting) addBlocker(blockers, "spotmeeting_missing", "HG_Spotmeeting mangler.", {}, "social");
    if (root.HG_Spotmeeting && snap.spotmeetingHealth?.ok !== true) addBlocker(blockers, "spotmeeting_health_failed", "HG_Spotmeeting.health() bestod ikke.", snap.spotmeetingHealth || {}, "social");
    if (!root.HG_SpotmeetingPlaceCardDemo) addBlocker(blockers, "spotmeeting_placecard_demo_missing", "HG_SpotmeetingPlaceCardDemo mangler.", {}, "social");
    if (!snap.profileSocialMeet.hasSocialMeetTab) addBlocker(blockers, "social_meet_tab_missing", "profile.html mangler Social Meet-tab mount i DOM.", snap.profileSocialMeet, "social");
    if (!snap.profileSocialMeet.hasSpotmeetingInbox) addBlocker(blockers, "spotmeeting_inbox_missing", "profile.html mangler spotmeeting-inbox mount i DOM.", snap.profileSocialMeet, "social");
    if (!snap.profileSocialMeet.hasSpotmeetingInboxRenderer) addBlocker(blockers, "spotmeeting_inbox_renderer_missing", "spotmeeting-inbox renderer mangler.", snap.profileSocialMeet, "social");
    if (root.HG_Spotmeeting && !spotmeetingPresetOnly) addBlocker(blockers, "spotmeeting_presets_invalid", "Spotmeeting er ikke preset-only.", { presetMessages: snap.spotmeetingConfig?.presetMessages || [] }, "social");
    if (root.HG_Spotmeeting && !spotmeetingDiscoverySafe) addBlocker(blockers, "spotmeeting_production_discovery_gate_invalid", "Spotmeeting production discovery must require backend, identity, invite persistence and moderation readiness.", spotmeetingReadiness || {}, "social");
    if (root.HG_Spotmeeting && spotmeetingPrivacyReject?.ok !== false) addBlocker(blockers, "spotmeeting_forbidden_privacy_allowed", "Spotmeeting avviste ikke forbudt personvernfelt.", { result: spotmeetingPrivacyReject }, "social");
    if (spotmeetingDemoLeaked.length) addBlocker(blockers, "demo_users_leaked_global_people", "Demo users leaked into global PEOPLE.", { count: spotmeetingDemoLeaked.length }, "social");
    const profileBlockers = listFrom(snap.publicProfileHealth?.blockers).map((item) => ({key:item?.key||'public_profile_privacy',message:item?.message||'Public profile privacy blocker',details:item,subsystem:'social'}));
    if (snap.publicProfileHealth?.warnings) listFrom(snap.publicProfileHealth.warnings).forEach((item)=>warnings.push({key:item?.key||'public_profile_warning',message:item?.message||'Public profile warning',details:item,subsystem:'social'}));
    blockers.push(...civBlockers, ...socialBlockers, ...signalBlockers, ...profileBlockers, ...matchGraphBlockers, ...spotmeetingBlockers, ...dailyObjectiveBlockers, ...dailyProgressBlockers);
    warnings.push(...civiWarnings, ...socialWarnings);

    const checks = {
      core: makeCheck(!blockers.some((b) => b.key === "places_missing"), blockers.some((b) => b.key === "places_missing") ? "blocker" : warnings.some((w) => ["people_missing", "tags_missing", "learning_log_missing"].includes(w.key)) ? "warning" : "ok", "Kjerneglobale er vurdert.", snap.core),
      map: makeCheck(!blockers.some((b) => b.key === "map_object_missing"), blockers.some((b) => b.key === "map_object_missing") ? "blocker" : warnings.some((w) => ["user_location_unavailable", "nearby_places_unavailable"].includes(w.key)) ? "warning" : "ok", "Kartflyt er vurdert.", snap.map),
      data: makeCheck(snap.data.places > 0, snap.data.places > 0 ? (warnings.some((w) => ["badges_missing", "careers_missing", "data_tags_missing"].includes(w.key)) ? "warning" : "ok") : "blocker", "Datagrunnlag er vurdert.", snap.data),
      profile: makeCheck(!!root.HGLearningLog || snap.profile.completedQuizCount != null || snap.profile.visitedCount != null, warnings.some((w) => ["quiz_history_unavailable", "visited_history_unavailable"].includes(w.key)) ? "warning" : "ok", "Profil/learning-log er vurdert.", snap.profile),
      civication: makeCheck(civBlockers.length === 0, civBlockers.length ? "blocker" : civiWarnings.length ? "warning" : snap.civication ? "ok" : "not_loaded", snap.civication ? "Civication diagnostics er aggregert." : "Civication diagnostics er ikke lastet på denne siden.", snap.civication || {}),
      social: makeCheck(socialBlockers.length === 0 && signalBlockers.length === 0 && profileBlockers.length === 0 && matchGraphBlockers.length === 0 && spotmeetingBlockers.length === 0, socialBlockers.length || signalBlockers.length || profileBlockers.length || (matchGraphBlockers.length || spotmeetingBlockers.length) ? "blocker" : socialWarnings.length ? "warning" : (snap.social || snap.socialSignals) ? "ok" : "not_loaded", snap.social ? "HG Social diagnostics er aggregert." : "HG Social diagnostics er ikke lastet på denne siden.", { ...(snap.social || {}), details: { signals: snap.socialSignals, signalHealth: snap.socialSignalHealth, publicProfile: snap.publicProfile ? { ...snap.publicProfile, timestamp: null } : null, publicProfileHealth: snap.publicProfileHealth, matchGraph: snap.matchGraph ? { matchCount: snap.matchGraph.matches?.length || 0, candidateCount: snap.matchGraph.candidates?.length || 0, warnings: snap.matchGraph.warnings } : null, matchGraphHealth: snap.matchGraphHealth, spotmeetingHealth: snap.spotmeetingHealth } }),
      socialMeet: makeCheck(!!root.HG_SpotmeetingPlaceCardDemo && snap.profileSocialMeet.hasSocialMeetTab, blockers.some((b) => ["spotmeeting_placecard_demo_missing", "social_meet_tab_missing"].includes(b.key)) ? "blocker" : "ok", "Social Meet mount er vurdert.", snap.profileSocialMeet),
      spotmeeting: makeCheck(!!root.HG_Spotmeeting && snap.spotmeetingHealth?.ok === true && spotmeetingDiscoverySafe, blockers.some((b) => ["spotmeeting_missing", "spotmeeting_health_failed", "spotmeeting_presets_invalid", "spotmeeting_production_discovery_gate_invalid"].includes(b.key)) ? "blocker" : "ok", "HG Spotmeeting runtime er vurdert.", { health: snap.spotmeetingHealth, config: snap.spotmeetingConfig, readiness: spotmeetingReadiness, productionDiscoveryDisabledByDefault: spotmeetingDiscoveryDisabledByDefault }),
      spotmeetingInbox: makeCheck(snap.profileSocialMeet.hasSpotmeetingInbox && snap.profileSocialMeet.hasSpotmeetingInboxRenderer, blockers.some((b) => ["spotmeeting_inbox_missing", "spotmeeting_inbox_renderer_missing"].includes(b.key)) ? "blocker" : "ok", "Spotmeeting inbox mount og renderer er vurdert.", snap.profileSocialMeet),
      privacy: makeCheck(spotmeetingPrivacyReject?.ok === false && !spotmeetingDemoLeaked.length, blockers.some((b) => ["spotmeeting_forbidden_privacy_allowed", "demo_users_leaked_global_people"].includes(b.key)) ? "blocker" : "ok", "Social Meet personvern er vurdert.", { forbiddenPrivacyRejected: spotmeetingPrivacyReject?.ok === false, noDemoUsersInPeople: !spotmeetingDemoLeaked.length }) ,
      dailyObjectives: makeCheck(dailyObjectiveBlockers.length === 0, dailyObjectiveBlockers.length ? "blocker" : snap.dailyObjectivesHealth?.warnings?.length ? "warning" : snap.dailyObjectives ? "ok" : "not_loaded", snap.dailyObjectives ? "Agenda er aggregert." : "Agenda er ikke lastet.", { summary: snap.dailyObjectives, health: snap.dailyObjectivesHealth }),
      dailyProgress: makeCheck(dailyProgressBlockers.length === 0, dailyProgressBlockers.length ? "blocker" : snap.dailyProgressHealth?.warnings?.length ? "warning" : snap.dailyProgress ? "ok" : "not_loaded", snap.dailyProgress ? "Dagens framgang er aggregert." : "Dagens framgang er ikke lastet.", { summary: snap.dailyProgress, health: snap.dailyProgressHealth })
    };

    const subsystemBlockerCount = civBlockers.length + socialBlockers.length + signalBlockers.length + profileBlockers.length + matchGraphBlockers.length + spotmeetingBlockers.length + dailyObjectiveBlockers.length + dailyProgressBlockers.length;
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
    } finally {
      healthDepth = Math.max(0, healthDepth - 1);
    }
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
