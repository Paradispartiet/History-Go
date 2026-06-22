// @ts-nocheck
(function () {
  "use strict";

  const DEMO_FLAG = "HG_SOCIAL_DEMO_MODE";
  const DEMO_BACKUP_KEY = "hg_social_demo_backup_v1";
  const DEMO_KEYS = [
    "hg_public_profiles_v1",
    "hg_public_profile_v1",
    "hg_knowledge_fingerprint_v1",
    "hg_knowledge_meet_invites_v1",
    "hg_learning_circles_v1",
    "hg_shared_routes_v1",
    "hg_shared_quizzes_v1",
    "hg_shared_observations_v1",
    "hg_social_log_v1",
    "hg_social_privacy_settings_v1",
    "hg_social_timeline_v1"
  ];

  function now() { return new Date().toISOString(); }
  function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; } }
  function currentUserId() { return String(window.HGAha?.getProfileIdSync?.() || localStorage.getItem("aha_profile_id") || "local-user"); }

  const BASE_PRIVACY = Object.freeze({
    publicProfile: true,
    visibleInMatchLists: true,
    allowMeetInvites: true,
    allowCircleInvites: true,
    showSocialReputation: true
  });

  const HG_SOCIAL_DEMO_USERS = Object.freeze([
    { userId: "demo-industrial-historian", displayName: "Industrial Historian" },
    { userId: "demo-urban-explorer", displayName: "Urban Explorer" },
    { userId: "demo-art-walker", displayName: "Art Walker" },
    { userId: "demo-nature-observer", displayName: "Nature Observer" },
    { userId: "demo-political-oslo", displayName: "Political Oslo" },
    { userId: "demo-film-history-nerd", displayName: "Film History Nerd" }
  ]);

  const HG_SOCIAL_DEMO_PROFILES = Object.freeze([
    { userId: "demo-industrial-historian", displayName: "Industrial Historian", bio: "Reads factories, labor movements and infrastructure as connected knowledge stories.", avatar: "🏭", badges: ["historie", "naeringsliv", "by"], completedEmner: ["industrial_oslo", "arbeiderhistorie", "transport"], coreConcepts: ["industrialisering", "arbeiderbevegelse", "jernbane", "havneby", "urbanisering"], interests: ["industrial history", "labor", "infrastructure"], publicProfile: true, privacySettings: BASE_PRIVACY },
    { userId: "demo-urban-explorer", displayName: "Urban Explorer", bio: "Connects streets, architecture and city change through thematic walks.", avatar: "🏙️", badges: ["by", "historie", "arkitektur"], completedEmner: ["urbanisering", "oslo", "transport"], coreConcepts: ["urbanisering", "offentlighet", "byrom", "jernbane", "modernisme"], interests: ["city", "routes", "architecture"], publicProfile: true, privacySettings: BASE_PRIVACY },
    { userId: "demo-art-walker", displayName: "Art Walker", bio: "Looks for modernism, public art and museum traces in knowledge routes.", avatar: "🎨", badges: ["kunst", "litteratur", "historie"], completedEmner: ["modernisme", "offentlig_kunst", "oslo"], coreConcepts: ["modernisme", "kanon", "offentlighet", "form", "institusjon"], interests: ["art", "museums", "modernism"], publicProfile: true, privacySettings: BASE_PRIVACY },
    { userId: "demo-nature-observer", displayName: "Nature Observer", bio: "Builds careful observation notes around ecology, science and landscape history.", avatar: "🌿", badges: ["natur", "vitenskap", "historie"], completedEmner: ["okologi", "naturhistorie", "oslofjorden"], coreConcepts: ["økologi", "observasjon", "klassifikasjon", "landskap", "forvaltning"], interests: ["nature", "science", "observations"], publicProfile: true, privacySettings: BASE_PRIVACY },
    { userId: "demo-political-oslo", displayName: "Political Oslo", bio: "Studies institutions, public debate and power in the city knowledge graph.", avatar: "🏛️", badges: ["politikk", "historie", "by"], completedEmner: ["demokrati", "oslo", "arbeiderhistorie"], coreConcepts: ["offentlighet", "arbeiderbevegelse", "demokrati", "urbanisering", "institusjon"], interests: ["politics", "public sphere", "labor"], publicProfile: true, privacySettings: BASE_PRIVACY },
    { userId: "demo-film-history-nerd", displayName: "Film History Nerd", bio: "Connects cinema, media archives and popular culture to historical places.", avatar: "🎬", badges: ["film", "media", "populaerkultur"], completedEmner: ["filmhistorie", "mediearkiv", "modernisme"], coreConcepts: ["montasje", "arkiv", "modernisme", "offentlighet", "fortelling"], interests: ["film", "media", "archives"], publicProfile: true, privacySettings: BASE_PRIVACY }
  ]);

  function buildFingerprint(profile) { return window.buildKnowledgeFingerprint ? window.buildKnowledgeFingerprint(profile) : { profileUserId: profile.userId, concepts: profile.coreConcepts, interests: profile.interests }; }
  const HG_SOCIAL_DEMO_FINGERPRINTS = Object.freeze(HG_SOCIAL_DEMO_PROFILES.map((p) => ({ userId: p.userId, fingerprint: { concepts: p.coreConcepts, badges: p.badges, emner: p.completedEmner, interests: p.interests } })));

  const HG_SOCIAL_DEMO_INVITES = Object.freeze([
    { inviteId: "demo-invite-industrial", fromUserId: "demo-industrial-historian", toUserId: "local-user", spotId: "industrial_route", messagePreset: "Vil du ta denne ruta sammen?", status: "pending", fromDisplayName: "Industrial Historian", toDisplayName: "History Go bruker", spotTitle: "Industrial Oslo Knowledge Route" },
    { inviteId: "demo-invite-urban", fromUserId: "local-user", toUserId: "demo-urban-explorer", spotId: "urban_route", messagePreset: "Vil du utforske dette stedet sammen?", status: "accepted", fromDisplayName: "History Go bruker", toDisplayName: "Urban Explorer", spotTitle: "Urban Change Walk" }
  ]);

  const HG_SOCIAL_DEMO_CIRCLES = Object.freeze([
    { circleId: "demo-circle-industrial-city", title: "Industrial City Circle", focusDomains: ["industrial history", "labor", "city"], members: ["local-user", "demo-industrial-historian", "demo-urban-explorer", "demo-political-oslo"], invites: [] },
    { circleId: "demo-circle-public-culture", title: "Public Culture Circle", focusDomains: ["art", "film", "public sphere"], members: ["demo-art-walker", "demo-film-history-nerd", "demo-political-oslo"], invites: [] }
  ]);

  const HG_SOCIAL_DEMO_ROUTES = Object.freeze([
    { routeId: "demo-route-industrial-oslo", participants: ["local-user", "demo-industrial-historian"], spots: ["factory_memory", "labor_archive", "harbor_history"], routeType: "pair", circleId: "demo-circle-industrial-city", completionState: "active" },
    { routeId: "demo-route-urban-public", participants: ["local-user", "demo-urban-explorer", "demo-political-oslo"], spots: ["public_square", "city_hall_context"], routeType: "circle", circleId: "demo-circle-industrial-city", completionState: "completed" }
  ]);

  const HG_SOCIAL_DEMO_OBSERVATIONS = Object.freeze([
    { observationId: "demo-observation-factory-symbols", spotId: "factory_memory", users: ["local-user", "demo-industrial-historian"], observations: ["work rhythms", "material traces"], tags: ["industrial history", "labor"] }
  ]);

  function seedHGCurrentSocialUser() {
    const uid = currentUserId();
    const profile = {
      userId: uid,
      displayName: "History Go bruker",
      publicProfile: true,
      bio: "Demo profile tuned for industrial history, urban change and political Oslo.",
      avatar: "🧭",
      badges: ["historie", "by", "politikk", "naeringsliv"],
      completedEmner: ["industrial_oslo", "arbeiderhistorie", "urbanisering", "oslo", "demokrati"],
      coreConcepts: ["industrialisering", "arbeiderbevegelse", "urbanisering", "offentlighet", "jernbane", "demokrati", "institusjon"],
      interests: ["industrial history", "city", "labor", "politics", "infrastructure"]
    };
    writeJson("hg_public_profile_v1", profile);
    return profile;
  }

  function withCurrentUser(items) {
    const uid = currentUserId();
    return JSON.parse(JSON.stringify(items)).map((item) => {
      ["fromUserId", "toUserId", "hostUserId"].forEach((key) => { if (item[key] === "local-user") item[key] = uid; });
      ["members", "participants", "users"].forEach((key) => { if (Array.isArray(item[key])) item[key] = item[key].map((id) => id === "local-user" ? uid : id); });
      return item;
    });
  }

  function backupRealSocialData() {
    if (localStorage.getItem(DEMO_BACKUP_KEY)) return;
    writeJson(DEMO_BACKUP_KEY, Object.fromEntries(DEMO_KEYS.map((key) => [key, localStorage.getItem(key)])));
  }

  function seedHGSocialDemoData() {
    backupRealSocialData();
    localStorage.setItem(DEMO_FLAG, "1");
    const current = seedHGCurrentSocialUser();
    const profiles = HG_SOCIAL_DEMO_PROFILES.map((p) => ({ ...p, privacySettings: undefined }));
    writeJson("hg_public_profiles_v1", [...profiles, current]);
    writeJson("hg_knowledge_fingerprint_v1", { userId: current.userId, updatedAt: now(), context: { source: "hg-social-demo" }, fingerprint: buildFingerprint(current) });
    writeJson("hg_knowledge_meet_invites_v1", withCurrentUser(HG_SOCIAL_DEMO_INVITES));
    writeJson("hg_learning_circles_v1", withCurrentUser(HG_SOCIAL_DEMO_CIRCLES));
    writeJson("hg_shared_routes_v1", withCurrentUser(HG_SOCIAL_DEMO_ROUTES));
    writeJson("hg_shared_observations_v1", withCurrentUser(HG_SOCIAL_DEMO_OBSERVATIONS));
    writeJson("hg_shared_quizzes_v1", [{ sharedQuizId: "demo-shared-quiz-industrial", placeId: "factory_memory", quizId: "industrial_oslo", mode: "cooperative", participants: [current.userId, "demo-industrial-historian"], answers: {}, completionState: "active", startedAt: now() }]);
    writeJson("hg_social_timeline_v1", [{ eventId: "demo-private-timeline-route", type: "shared_route_completed", private: true, routeId: "demo-route-urban-public", participants: [current.userId, "demo-urban-explorer", "demo-political-oslo"], createdAt: now() }]);
    writeJson("hg_social_privacy_settings_v1", Object.fromEntries([current, ...HG_SOCIAL_DEMO_PROFILES].map((p) => [p.userId, { ...BASE_PRIVACY }])));
    writeJson("hg_social_log_v1", { userId: current.userId, metUsers: ["demo-urban-explorer"], completedMeetups: ["demo-invite-urban"], relations: [{ userId: "demo-industrial-historian", repeatedMeetCount: 1, sharedRoutes: ["demo-route-industrial-oslo"], sharedQuizzes: [], sharedObservations: ["demo-observation-factory-symbols"] }, { userId: "demo-urban-explorer", repeatedMeetCount: 1, sharedRoutes: ["demo-route-urban-public"], sharedQuizzes: [], sharedObservations: [] }, { userId: "demo-political-oslo", repeatedMeetCount: 0, sharedRoutes: ["demo-route-urban-public"], sharedQuizzes: [], sharedObservations: [] }] });
    window.renderKnowledgeMatches?.(); window.renderMeetInviteInbox?.(); window.renderConfirmedMeets?.(); window.renderSocialProgression?.(); window.renderLearningCircles?.(); window.renderCircleActivity?.(); window.renderSocialTimeline?.(); window.refreshSocialIndex?.();
    return { ok: true, currentUser: current.userId };
  }

  function clearHGSocialDemoData() {
    const backup = readJson(DEMO_BACKUP_KEY, null);
    if (backup && typeof backup === "object") {
      DEMO_KEYS.forEach((key) => {
        if (backup[key] === null || typeof backup[key] === "undefined") localStorage.removeItem(key);
        else localStorage.setItem(key, backup[key]);
      });
    } else {
      DEMO_KEYS.forEach((key) => localStorage.removeItem(key));
    }
    localStorage.removeItem(DEMO_BACKUP_KEY);
    localStorage.removeItem(DEMO_FLAG);
    location.reload?.();
    return { ok: true };
  }
  function enableHGSocialDemoMode() { localStorage.setItem(DEMO_FLAG, "1"); return seedHGSocialDemoData(); }

  Object.assign(window, { HG_SOCIAL_DEMO_USERS, HG_SOCIAL_DEMO_PROFILES, HG_SOCIAL_DEMO_FINGERPRINTS, HG_SOCIAL_DEMO_INVITES, HG_SOCIAL_DEMO_CIRCLES, HG_SOCIAL_DEMO_ROUTES, HG_SOCIAL_DEMO_OBSERVATIONS, seedHGCurrentSocialUser, seedHGSocialDemoData, clearHGSocialDemoData, enableHGSocialDemoMode });
  if (localStorage.getItem(DEMO_FLAG) === "1") document.addEventListener("DOMContentLoaded", () => setTimeout(seedHGSocialDemoData, 0));
})();
