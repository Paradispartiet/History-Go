(function () {
  "use strict";

  const root = /** @type {any} */ (typeof window !== "undefined" ? window : globalThis);
  const FORBIDDEN_FIELDS = new Set(["lat", "lng", "latitude", "longitude", "gps", "location", "coords", "liveLocation", "presence", "isOnline", "lastSeen", "visitLog", "visitedAt", "timestampedVisits", "followers", "followerCount", "following", "feed", "chat", "freeText", "publicVisitHistory", "visitedPlaces", "feedTracking"]);

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

    if (!root.HG_SocialSignals) {
      warnings.push(warning("social_signals_missing", "HG_SocialSignals mangler.", {}, "socialSignals"));
      checks.socialSignals = check(true, "warning", "Social signals module mangler.");
    } else {
      const signalHealth = safeSync(() => root.HG_SocialSignals.health());
      if (signalHealth.value && signalHealth.value.ok === false) pushReportIssues(signalHealth.value, blockers, warnings, "socialSignals", { privacy: true });
      const signalSummary = safeSync(() => root.HG_SocialSignals.getSummary());
      const signals = safeSync(() => root.HG_SocialSignals.getSignals());
      const demoMixed = list(signals.value).filter((x) => x?.demoOnly === true || x?.userId || x?.handle || x?.displayName);
      if (demoMixed.length) blockers.push(blocker("social_signals_demo_mixed", "Demo users/data finnes i real signals.", { count: demoMixed.length }, "socialSignals"));
      checks.socialSignals = check(!signalHealth.error && signalHealth.value?.ok !== false && demoMixed.length === 0, signalHealth.value?.ok === false || demoMixed.length ? "blocker" : "ok", "Social signals kontrollert.", { signalCount: signalSummary.value?.signalCount || 0 });
    }

    if (!root.HG_PublicProfileReadModel) {
      blockers.push(blocker("public_profile_read_model_missing", "HG_PublicProfileReadModel mangler.", {}, "publicProfileReadModel"));
      checks.publicProfileReadModel = check(false, "blocker", "Public profile read-model mangler.");
    } else {
      const modelResult = safeSync(() => root.HG_PublicProfileReadModel.getReadModel());
      const previewResult = safeSync(() => root.HG_PublicProfileReadModel.getPreview());
      const healthResult = safeSync(() => root.HG_PublicProfileReadModel.health());
      if (modelResult.error) blockers.push(blocker("public_profile_read_model_failed", "getReadModel feilet.", { error: errorMessage(modelResult.error) }, "publicProfileReadModel"));
      if (previewResult.error) blockers.push(blocker("public_profile_preview_failed", "getPreview feilet.", { error: errorMessage(previewResult.error) }, "publicProfileReadModel"));
      if (healthResult.value && healthResult.value.ok === false) pushReportIssues(healthResult.value, blockers, warnings, "publicProfileReadModel", { privacy: true });
      const model = modelResult.value || {};
      const preview = previewResult.value || {};
      const signalCount = Number(model.counts?.signalCount || 0);
      if (model.publicProfileEnabled === true && signalCount === 0) warnings.push(warning("public_profile_enabled_no_signals", "Offentlig profil er på uten signaler.", { signalCount }, "publicProfileReadModel"));
      if (signalCount > 0 && Number(model.source?.signalCount || 0) !== signalCount) blockers.push(blocker("public_profile_signal_count_mismatch", "Public profile source/count mismatch.", { counts: model.counts, source: model.source }, "publicProfileReadModel"));
      const forbidden = safeSync(() => root.HG_PublicProfileReadModel.validate(model));
      if (forbidden.value && forbidden.value.publicSafe === false) pushReportIssues(forbidden.value, blockers, warnings, "publicProfileReadModel", { privacy: true });
      if (model.identity?.demoOnly === true || JSON.stringify(model).includes('demoOnlyUser')) blockers.push(blocker("public_profile_demo_mixed", "Demo users finnes i real public profile.", {}, "publicProfileReadModel"));
      const hasSections = Array.isArray(preview.sections) && preview.sections.length > 0;
      checks.publicProfileReadModel = check(!modelResult.error && !previewResult.error && healthResult.value?.ok !== false && hasSections, modelResult.error || previewResult.error || healthResult.value?.ok === false ? "blocker" : (model.publicProfileEnabled === true && signalCount === 0) ? "warning" : "ok", "Public profile read-model kontrollert.", { signalCount, publicProfileEnabled: !!model.publicProfileEnabled, sections: preview.sections?.length || 0 });
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


    checks.socialSurfaceContract = check(!!root.HG_SocialSurfaceContract, root.HG_SocialSurfaceContract ? "ok" : "blocker", "Social Surface Contract kontrollert.");
    if (!root.HG_SocialSurfaceContract) blockers.push(blocker("social_surface_contract_missing", "HG_SocialSurfaceContract mangler.", {}, "socialSurfaceContract"));

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
      const blockHtml = String(adapter?.renderPlaceSocialBlock?.(samplePlace) || "");
      const visibleScan = root.HG_SocialSurfaceContract?.scanVisibleText?.(blockHtml);
      if (visibleScan && !visibleScan.ok) list(visibleScan.blockers).forEach((item) => blockers.push(blocker("social_visible_text_privacy", "Synlig demo-tekst bryter personvernspråk.", item, "socialDemoVisible")));
      const beforeInvites = list(root.HG_SocialDemo?.snapshot?.().invites).length;
      const target = profiles[0]?.userId;
      const invA = root.HG_SocialDemo?.sendDemoInvite?.({toUserId:target,placeId:"smoke-demo-place",presetMessageId:"meet_here",sourceSurface:"demoPanel"});
      const invB = root.HG_SocialDemo?.sendDemoInvite?.({toUserId:target,placeId:"smoke-demo-place",presetMessageId:"meet_here",sourceSurface:"demoPanel"});
      const afterInvites = list(root.HG_SocialDemo?.snapshot?.().invites).length;
      if (!invA?.ok || !invB?.ok || afterInvites > beforeInvites + 1) blockers.push(blocker("social_demo_invite_duplicate", "Demo-invitasjon dupliseres.", {beforeInvites,afterInvites}, "socialDemoVisible"));
      const actionKeysOk = Object.keys(root.localStorage?.dump?.()||{}).every((k)=>["HG_TEST_MODE","hg_social_demo_state_v1","hg_social_demo_actions_v1"].includes(k));
      if (!actionKeysOk) blockers.push(blocker("social_demo_action_keys", "Demo action log bruker uventet lagringsnøkkel.", {}, "socialDemoVisible"));
      checks.socialDemoVisible = check(!leaked.length && !!adapter && profiles.length >= 8 && list(demoMatches.value).length > 0, leaked.length ? "blocker" : "ok", "Social demo synlighet kontrollert.", { profiles: profiles.length, matches: list(demoMatches.value).length });
    }


    if (!root.HG_Spotmeeting) {
      blockers.push(blocker("spotmeeting_missing", "HG_Spotmeeting mangler.", {}, "spotmeeting"));
      checks.spotmeeting = check(false, "blocker", "HG Spotmeeting mangler.");
    } else {
      const h = safeSync(() => root.HG_Spotmeeting.health());
      if (h.value?.ok === false) pushReportIssues(h.value, blockers, warnings, "spotmeeting", { privacy: true });
      const c = safeSync(() => root.HG_Spotmeeting.getSpotmeetingConfig());
      const context = { contextType:"place", contextId:"factory_memory", title:"Factory", reason:"Smoke", sourceSurface:"smoke" };
      const suggestions = safeSync(() => root.HG_Spotmeeting.getSpotmeetingSuggestions(context));
      const bad = safeSync(() => root.HG_Spotmeeting.createSpotmeetingInvite("demo-industrial-historian", { ...context, latitude: 1 }, "quiz_together"));
      if (bad.value?.ok !== false) blockers.push(blocker("spotmeeting_forbidden_allowed", "Spotmeeting tillot forbudt felt.", {}, "spotmeeting"));
      const presetsOnly = list(c.value?.presetMessages).length === 5 && list(c.value?.presetMessages).every((p)=>p.presetMessageId && p.label && !p.freeText);
      if (!presetsOnly) blockers.push(blocker("spotmeeting_presets_invalid", "Spotmeeting er ikke preset-only.", {}, "spotmeeting"));
      checks.spotmeeting = check(!h.error && h.value?.ok !== false && presetsOnly && bad.value?.ok === false, h.value?.ok === false ? "blocker" : "ok", "HG Spotmeeting kontrollert.", { suggestions: count(suggestions.value?.suggestions), testMode: isEnabled() });
    }

    const hasSocialMeetTab = !!root.document?.querySelector?.('.profile-tab[data-tab="socialmeet"], [role="tab"][data-tab="socialmeet"]');
    const hasSpotmeetingInbox = !!root.document?.getElementById?.("spotmeeting-inbox");
    const hasSpotmeetingInboxRenderer = typeof root.renderSpotmeetingInbox === "function";
    const hasPlaceCardDemo = !!root.HG_SpotmeetingPlaceCardDemo;
    const hasNoDemoPeople = !list(root.PEOPLE).some((person) => String(person?.id || person?.userId || "").startsWith("demo-"));
    if (!hasPlaceCardDemo) blockers.push(blocker("spotmeeting_placecard_demo_missing", "HG_SpotmeetingPlaceCardDemo mangler.", {}, "socialMeet"));
    if (!hasSocialMeetTab) blockers.push(blocker("social_meet_tab_missing", "Social Meet tab mangler.", {}, "socialMeet"));
    if (!hasSpotmeetingInbox) blockers.push(blocker("spotmeeting_inbox_missing", "spotmeeting-inbox mangler.", {}, "spotmeetingInbox"));
    if (!hasSpotmeetingInboxRenderer) blockers.push(blocker("spotmeeting_inbox_renderer_missing", "spotmeeting-inbox renderer mangler.", {}, "spotmeetingInbox"));
    if (!hasNoDemoPeople) blockers.push(blocker("demo_users_leaked_global_people", "Demo users leaked into global PEOPLE.", {}, "privacy"));
    checks.socialMeet = check(hasPlaceCardDemo && hasSocialMeetTab, hasPlaceCardDemo && hasSocialMeetTab ? "ok" : "blocker", "Social Meet mount kontrollert.", { hasPlaceCardDemo, hasSocialMeetTab });
    checks.spotmeetingInbox = check(hasSpotmeetingInbox && hasSpotmeetingInboxRenderer, hasSpotmeetingInbox && hasSpotmeetingInboxRenderer ? "ok" : "blocker", "Spotmeeting inbox kontrollert.", { hasSpotmeetingInbox, hasSpotmeetingInboxRenderer });

    if (!root.HG_SocialMatchGraph) {
      blockers.push(blocker("social_match_graph_missing", "HG_SocialMatchGraph mangler.", {}, "socialMatchGraph"));
      checks.socialMatchGraph = check(false, "blocker", "Social match graph mangler.");
    } else {
      const a = safeSync(() => root.HG_SocialMatchGraph.buildMatchGraph({ limit: 10 }));
      const b = safeSync(() => root.HG_SocialMatchGraph.buildMatchGraph({ limit: 10 }));
      const h = safeSync(() => root.HG_SocialMatchGraph.health());
      if (a.error) blockers.push(blocker("social_match_graph_build_failed", "buildMatchGraph feilet.", { error: errorMessage(a.error) }, "socialMatchGraph"));
      if (h.value && h.value.ok === false) pushReportIssues(h.value, blockers, warnings, "socialMatchGraph", { privacy: true });
      const matches = list(a.value?.matches);
      if (isEnabled()) {
        const seeded = root.HG_SocialDemo?.snapshot?.().seeded === true;
        if (seeded && matches.length < 3) blockers.push(blocker("social_match_graph_demo_low", "TEST_MODE demo gir færre enn 3 matcher.", { matches: matches.length }, "socialMatchGraph"));
      }
      const samplePlace = list(root.PLACES)[0]?.id || "factory_memory";
      const placeMatches = safeSync(() => root.HG_SocialMatchGraph.getMatchesForPlace(samplePlace, { limit: 10 }));
      if (placeMatches.error) blockers.push(blocker("social_match_graph_place_failed", "getMatchesForPlace feilet.", { error: errorMessage(placeMatches.error) }, "socialMatchGraph"));
      const stable = JSON.stringify(list(a.value?.matches).map((m)=>[m.candidateId,m.score])) === JSON.stringify(list(b.value?.matches).map((m)=>[m.candidateId,m.score]));
      if (!stable) blockers.push(blocker("social_match_graph_not_deterministic", "Match graph scoring er ikke deterministisk.", {}, "socialMatchGraph"));
      const fakeIds = new Set(list(root.HG_SocialDemo?.snapshot?.().profiles).map((p)=>p?.userId).filter(Boolean));
      const leaked = list(root.PEOPLE).filter((p)=>fakeIds.has(p?.id)||fakeIds.has(p?.userId));
      if (leaked.length) blockers.push(blocker("demo_users_leaked_global_people", "Demo users leaked into global PEOPLE", { count: leaked.length }, "socialMatchGraph"));
      checks.socialMatchGraph = check(!a.error && !placeMatches.error && stable && (!isEnabled() || matches.length >= 3), a.error || placeMatches.error || !stable ? "blocker" : "ok", "Social match graph kontrollert.", { matches: matches.length, candidates: count(a.value?.candidates), placeMatches: count(placeMatches.value) });
    }

    const todayBefore = JSON.stringify(root.localStorage?.dump?.() || {});
    let todaySurfaceOk = !!(root.HG_TodayHub && root.HG_TodayHubPanel && root.HG_TodayActionRouter);
    if (!root.HG_TodayHub) warnings.push(warning("today_hub_missing", "HG_TodayHub mangler.", {}, "todayHubProductSurface"));
    if (!root.HG_TodayHubPanel) warnings.push(warning("today_panel_missing", "HG_TodayHubPanel mangler.", {}, "todayHubProductSurface"));
    if (!root.HG_TodayActionRouter) warnings.push(warning("today_action_router_missing", "HG_TodayActionRouter mangler.", {}, "todayHubProductSurface"));
    if (root.HG_TodayHub && root.HG_TodayHubPanel && root.HG_TodayActionRouter) {
      const snapR = await safeAsync(() => root.HG_TodayHub.snapshot());
      const healthR = await safeAsync(() => root.HG_TodayHub.health());
      const renderR = await safeAsync(() => root.HG_TodayHubPanel.render({ context: { sourceSurface: "smoke" } }));
      const actions = list(snapR.value?.priority || snapR.value?.actions);
      const routeR = safeSync(() => root.HG_TodayActionRouter.route(actions[0] || { title: "Lesemodus", routeKey: "read_only", enabled: true }));
      const after = JSON.stringify(root.localStorage?.dump?.() || {});
      todaySurfaceOk = !snapR.error && !healthR.error && !renderR.error && !routeR.error && actions.length >= 0 && todayBefore === after && healthR.value?.privacy?.ok !== false && !list(healthR.value?.privacyViolations).length;
      if (snapR.error) blockers.push(blocker("today_snapshot_failed", "Min dag snapshot feilet.", { error: errorMessage(snapR.error) }, "todayHubProductSurface"));
      if (healthR.error) blockers.push(blocker("today_health_failed", "Min dag health feilet.", { error: errorMessage(healthR.error) }, "todayHubProductSurface"));
      if (renderR.error) blockers.push(blocker("today_render_failed", "Min dag render feilet.", { error: errorMessage(renderR.error) }, "todayHubProductSurface"));
      if (routeR.error) blockers.push(blocker("today_route_failed", "Min dag action route feilet.", { error: errorMessage(routeR.error) }, "todayHubProductSurface"));
      if (todayBefore !== after) blockers.push(blocker("today_local_storage_mutation", "Min dag endret localStorage under smoke.", {}, "todayHubProductSurface"));
      pushReportIssues(healthR.value, blockers, warnings, "todayHubProductSurface", { privacy: true });
    }
    checks.todayHubProductSurface = check(todaySurfaceOk, todaySurfaceOk ? "ok" : "warning", "Min dag product surface kontrollert.", { hasHub: !!root.HG_TodayHub, hasPanel: !!root.HG_TodayHubPanel, hasRouter: !!root.HG_TodayActionRouter });


    const agendaBefore = JSON.stringify(root.localStorage?.dump?.() || {});
    let dailyOk = !!root.HG_DailyObjectives;
    if (!root.HG_DailyObjectives) {
      warnings.push(warning("daily_objectives_missing", "HG_DailyObjectives mangler.", {}, "dailyObjectives"));
    } else {
      const genR = safeSync(() => root.HG_DailyObjectives.generate());
      const getR = safeSync(() => root.HG_DailyObjectives.getAgenda());
      const afterGet = JSON.stringify(root.localStorage?.dump?.() || {});
      const healthR = safeSync(() => root.HG_DailyObjectives.health());
      const routes = list(genR.value?.objectives).map((o)=>o?.routeKey).filter(Boolean);
      const unsafeRoutes = routes.filter((r)=>!list(root.HG_DailyObjectives._safeRoutes).includes(r));
      const forbiddenRejected = ["complete_quiz","complete_route","save_observation","run_economy_tick","start_workday","send_real_invite","buy_item","move_home","unlock_place"].every((routeKey)=>root.HG_TodayActionRouter?.canRoute?.({routeKey,enabled:true})?.ok === false);
      if (genR.error) blockers.push(blocker("daily_objectives_generate_failed", "Agenda generate feilet.", { error: errorMessage(genR.error) }, "dailyObjectives"));
      if (getR.error) blockers.push(blocker("daily_objectives_get_failed", "Agenda getAgenda feilet.", { error: errorMessage(getR.error) }, "dailyObjectives"));
      if (agendaBefore !== afterGet) blockers.push(blocker("daily_objectives_get_mutated_storage", "getAgenda endret localStorage.", {}, "dailyObjectives"));
      if (unsafeRoutes.length) blockers.push(blocker("daily_objectives_unsafe_routes", "Agenda har utrygge routeKeys.", { unsafeRoutes }, "dailyObjectives"));
      if (!forbiddenRejected) blockers.push(blocker("daily_objectives_mutating_route_allowed", "Muterende routeKey ble ikke avvist.", {}, "dailyObjectives"));
      if (healthR.value?.ok === false) pushReportIssues(healthR.value, blockers, warnings, "dailyObjectives", { privacy: true });
      const beforeSave = root.localStorage?.dump?.() || {};
      const saveR = safeSync(() => root.HG_DailyObjectives.saveAgenda(genR.value));
      const afterSave = root.localStorage?.dump?.() || {};
      const changed = Object.keys(afterSave).filter((k)=>beforeSave[k] !== afterSave[k]);
      if (saveR.error) blockers.push(blocker("daily_objectives_save_failed", "Agenda saveAgenda feilet.", { error: errorMessage(saveR.error) }, "dailyObjectives"));
      if (changed.some((k)=>k !== "hg_daily_objectives_v1")) blockers.push(blocker("daily_objectives_storage_scope", "Agenda skrev uventet localStorage key.", { changed }, "dailyObjectives"));
      const resetOutside = safeSync(() => { const old = root.localStorage?.getItem?.("HG_TEST_MODE"); root.localStorage?.setItem?.("HG_TEST_MODE", "0"); const r = root.HG_DailyObjectives.resetAgendaForTestMode(); root.localStorage?.setItem?.("HG_TEST_MODE", old || "1"); return r; });
      if (resetOutside.value !== false) blockers.push(blocker("daily_objectives_reset_outside_test", "Reset virket uten TEST_MODE.", {}, "dailyObjectives"));
      dailyOk = !genR.error && !getR.error && !saveR.error && agendaBefore === afterGet && !unsafeRoutes.length && forbiddenRejected;
      checks.dailyObjectives = check(dailyOk, dailyOk ? "ok" : "blocker", "Daily objectives kontrollert.", { objectiveCount: list(genR.value?.objectives).length });
    }



    const progressBefore = JSON.stringify(root.localStorage?.dump?.() || {});
    let dailyProgressOk = !!root.HG_DailyProgress;
    if (!root.HG_DailyProgress) {
      warnings.push(warning("daily_progress_missing", "HG_DailyProgress mangler.", {}, "dailyProgress"));
    } else {
      const bindR = safeSync(() => { root.HG_DailyProgress.bind(); root.HG_DailyProgress.unbind(); return true; });
      const getR = safeSync(() => root.HG_DailyProgress.getProgress());
      const afterGet = JSON.stringify(root.localStorage?.dump?.() || {});
      const readR = safeSync(() => root.HG_DailyProgress.refreshFromSignals({ save: false }));
      const afterRead = JSON.stringify(root.localStorage?.dump?.() || {});
      const badField = safeSync(() => root.HG_DailyProgress.recordProgressEvent({ type: "objective_completed", source: "quiz", title: "Mål", lat: 1 }));
      const badWord = safeSync(() => root.HG_DailyProgress.recordProgressEvent({ type: "objective_completed", source: "quiz", title: "GPS" }));
      const saveR = safeSync(() => root.HG_DailyProgress.refreshFromSignals({ save: true }));
      const afterSave = root.localStorage?.dump?.() || {};
      const changed = Object.keys(afterSave).filter((k)=>JSON.parse(progressBefore || "{}")[k] !== afterSave[k]);
      const resetOutside = safeSync(() => { const old = root.localStorage?.getItem?.("HG_TEST_MODE"); root.localStorage?.setItem?.("HG_TEST_MODE", "0"); const r = root.HG_DailyProgress.clearProgressForTestMode(); root.localStorage?.setItem?.("HG_TEST_MODE", old || "1"); return r; });
      if (bindR.error) blockers.push(blocker("daily_progress_bind_failed", "Framgang bind/unbind feilet.", { error: errorMessage(bindR.error) }, "dailyProgress"));
      if (getR.error) blockers.push(blocker("daily_progress_get_failed", "getProgress feilet.", { error: errorMessage(getR.error) }, "dailyProgress"));
      if (progressBefore !== afterGet) blockers.push(blocker("daily_progress_get_mutated_storage", "getProgress endret localStorage.", {}, "dailyProgress"));
      if (afterGet !== afterRead) blockers.push(blocker("daily_progress_refresh_read_mutated_storage", "refreshFromSignals read-only endret localStorage.", {}, "dailyProgress"));
      if (badField.value?.ok !== false || badWord.value?.ok !== false) blockers.push(blocker("daily_progress_privacy_save_allowed", "Personvernbrudd ble lagret.", {}, "dailyProgress"));
      if (changed.some((k)=>!["hg_daily_progress_v1","hg_daily_objectives_v1","HG_TEST_MODE"].includes(k))) blockers.push(blocker("daily_progress_storage_scope", "Framgang skrev uventet localStorage key.", { changed }, "dailyProgress"));
      if (resetOutside.value !== false) blockers.push(blocker("daily_progress_clear_outside_test", "Clear progress virket uten TEST_MODE.", {}, "dailyProgress"));
      dailyProgressOk = !bindR.error && !getR.error && progressBefore === afterGet && afterGet === afterRead && badField.value?.ok === false && badWord.value?.ok === false;
      const healthR = safeSync(() => root.HG_DailyProgress.health());
      if (healthR.value?.ok === false) pushReportIssues(healthR.value, blockers, warnings, "dailyProgress", { privacy: true });
    }
    checks.dailyProgress = check(dailyProgressOk, dailyProgressOk ? "ok" : "blocker", "Daily progress kontrollert.", { hasModule: !!root.HG_DailyProgress });

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
