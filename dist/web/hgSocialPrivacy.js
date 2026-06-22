(() => {
  // js/hgSocialPrivacy.ts
  (function() {
    "use strict";
    const KEYS = Object.freeze({
      profiles: "hg_public_profiles_v1",
      currentProfile: "hg_public_profile_v1",
      invites: "hg_knowledge_meet_invites_v1",
      log: "hg_social_log_v1",
      circles: "hg_learning_circles_v1",
      routes: "hg_shared_routes_v1",
      quizzes: "hg_shared_quizzes_v1",
      observations: "hg_shared_observations_v1",
      blocks: "hg_social_blocks_v1",
      reports: "hg_social_reports_v1",
      privacy: "hg_social_privacy_settings_v1"
    });
    const DEFAULT_PRIVACY = Object.freeze({
      publicProfile: true,
      visibleInMatchLists: false,
      allowMeetInvites: false,
      allowCircleInvites: false,
      showSocialReputation: false
    });
    const REPORT_REASONS = Object.freeze(["Harassment", "Spam", "Manipulation", "Unsafe behavior", "Other"]);
    function readJson(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key) || "") || fallback;
      } catch {
        return fallback;
      }
    }
    function writeJson(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    function cleanList(value) {
      return Array.from(new Set((Array.isArray(value) ? value : []).map((item) => String(item || "").trim()).filter(Boolean)));
    }
    function currentUserId() {
      var _a, _b;
      return String(((_b = (_a = window.HGAha) == null ? void 0 : _a.getProfileIdSync) == null ? void 0 : _b.call(_a)) || localStorage.getItem("aha_profile_id") || "local-user");
    }
    function pairKey(a, b) {
      return cleanList([a, b]).sort().join("::");
    }
    function getProfiles() {
      return (typeof window.getAllProfiles === "function" ? window.getAllProfiles() : readJson(KEYS.profiles, [])).filter(Boolean);
    }
    function getProfile(id) {
      return getProfiles().find((p) => String(p == null ? void 0 : p.userId) === String(id)) || (String(id) === currentUserId() ? readJson(KEYS.currentProfile, {}) : null);
    }
    function getCircles() {
      return typeof window.getLearningCircles === "function" ? window.getLearningCircles() : readJson(KEYS.circles, []);
    }
    function getTrust(a, b) {
      return typeof window.calculateTrustScore === "function" ? window.calculateTrustScore(a, b) : { trustScore: 0, trustTier: "new" };
    }
    function getPrivacySettings(userId = currentUserId()) {
      var _a, _b, _c;
      const all = readJson(KEYS.privacy, {});
      const id = String(userId || currentUserId());
      const legacy = id === currentUserId() ? readJson(KEYS.currentProfile, {}) : {};
      return { ...DEFAULT_PRIVACY, ...all[id] || {}, publicProfile: Boolean((_c = (_b = (_a = all[id]) == null ? void 0 : _a.publicProfile) != null ? _b : legacy.publicProfile) != null ? _c : DEFAULT_PRIVACY.publicProfile) };
    }
    function savePrivacySettings(userId, patch) {
      const id = String(userId || currentUserId());
      const all = readJson(KEYS.privacy, {});
      const next = { ...getPrivacySettings(id), ...patch || {} };
      all[id] = next;
      writeJson(KEYS.privacy, all);
      if (id === currentUserId() && typeof window.savePublicProfile === "function") window.savePublicProfile({ publicProfile: next.publicProfile });
      renderPrivacySettings();
      return next;
    }
    function getBlockedUsers(userId = currentUserId()) {
      return cleanList(readJson(KEYS.blocks, {})[String(userId)]);
    }
    function isBlocked(userId, targetId) {
      return getBlockedUsers(userId).includes(String(targetId)) || getBlockedUsers(targetId).includes(String(userId));
    }
    function removeTrustLink(userId, targetId) {
      const log = readJson(KEYS.log, {});
      log.relations = (Array.isArray(log.relations) ? log.relations : []).filter((r) => String(r == null ? void 0 : r.userId) !== String(targetId));
      log.metUsers = cleanList(log.metUsers).filter((id) => id !== String(targetId));
      writeJson(KEYS.log, log);
    }
    function blockUser(userId, targetId) {
      var _a, _b, _c, _d;
      const uid = String(userId || currentUserId()), tid = String(targetId || "");
      if (!uid || !tid || uid === tid) return false;
      const blocks = readJson(KEYS.blocks, {});
      blocks[uid] = cleanList([...blocks[uid] || [], tid]);
      writeJson(KEYS.blocks, blocks);
      writeJson(KEYS.invites, readJson(KEYS.invites, []).map((i) => pairKey(i.fromUserId, i.toUserId) === pairKey(uid, tid) && i.status === "pending" ? { ...i, status: "cancelled", hiddenByBlock: true } : i));
      writeJson(KEYS.circles, readJson(KEYS.circles, []).map((c) => ({ ...c, members: cleanList(c.members).filter((m) => !(m === uid && cleanList(c.members).includes(tid)) && !(m === tid && cleanList(c.members).includes(uid))), invites: (Array.isArray(c.invites) ? c.invites : []).filter((x) => ![x.fromUserId, x.toUserId].includes(uid) || ![x.fromUserId, x.toUserId].includes(tid)) })));
      removeTrustLink(uid, tid);
      (_a = window.renderKnowledgeMatches) == null ? void 0 : _a.call(window);
      (_b = window.renderMeetInviteInbox) == null ? void 0 : _b.call(window);
      (_c = window.renderConfirmedMeets) == null ? void 0 : _c.call(window);
      (_d = window.renderLearningCircles) == null ? void 0 : _d.call(window);
      return true;
    }
    function unblockUser(userId, targetId) {
      const blocks = readJson(KEYS.blocks, {});
      blocks[String(userId || currentUserId())] = getBlockedUsers(userId).filter((id) => id !== String(targetId));
      writeJson(KEYS.blocks, blocks);
      return true;
    }
    function canSeeProfile(viewerId, targetId) {
      var _a;
      if (String(viewerId) === String(targetId)) return true;
      if (isBlocked(viewerId, targetId)) return false;
      return Boolean(getPrivacySettings(targetId).publicProfile && ((_a = getProfile(targetId)) == null ? void 0 : _a.publicProfile) !== false);
    }
    function canSeeMatch(viewerId, targetId) {
      if (!canSeeProfile(viewerId, targetId)) return false;
      return Boolean(getPrivacySettings(viewerId).visibleInMatchLists && getPrivacySettings(targetId).visibleInMatchLists);
    }
    function canSendInvite(viewerId, targetId) {
      if (!canSeeProfile(viewerId, targetId)) return false;
      return Boolean(getPrivacySettings(targetId).allowMeetInvites && getTrust(viewerId, targetId).trustScore >= 0);
    }
    function canViewCircle(viewerId, circleId) {
      const c = getCircles().find((x) => String(x == null ? void 0 : x.circleId) === String(circleId));
      if (!c) return false;
      if (cleanList(c.members).includes(String(viewerId))) return true;
      return cleanList(c.members).some((id) => !isBlocked(viewerId, id) && getTrust(viewerId, id).trustScore >= 0.25);
    }
    function canViewSocialHistory(viewerId, targetId) {
      if (String(viewerId) === String(targetId)) return true;
      if (!canSeeProfile(viewerId, targetId)) return false;
      return Boolean(getPrivacySettings(targetId).showSocialReputation && getTrust(viewerId, targetId).trustScore >= 0.25);
    }
    function reportUser(userId, targetId, reason) {
      const normalized = REPORT_REASONS.includes(reason) ? reason : "Other";
      const rows = readJson(KEYS.reports, []);
      const report = { reportId: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId: String(userId || currentUserId()), targetId: String(targetId || ""), reason: normalized, status: "open", createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      writeJson(KEYS.reports, [...rows, report]);
      return report;
    }
    function getReports() {
      return readJson(KEYS.reports, []);
    }
    function resolveReport(reportId) {
      const rows = getReports();
      const r = rows.find((x) => x.reportId === String(reportId));
      if (r) {
        r.status = "resolved";
        r.resolvedAt = (/* @__PURE__ */ new Date()).toISOString();
        writeJson(KEYS.reports, rows);
      }
      return r || null;
    }
    function getSocialIndex() {
      return { profiles: getProfiles(), matches: typeof window.getKnowledgeMatches === "function" ? window.getKnowledgeMatches(currentUserId()) : [], invites: readJson(KEYS.invites, []), confirmedMeets: typeof window.getConfirmedMeetInvites === "function" ? window.getConfirmedMeetInvites(currentUserId()) : [], trust: readJson(KEYS.log, {}).relations || [], circles: getCircles(), sharedRoutes: readJson(KEYS.routes, []), sharedQuiz: readJson(KEYS.quizzes, []), sharedObservations: readJson(KEYS.observations, []), blocks: readJson(KEYS.blocks, {}), reports: getReports(), privacySettings: readJson(KEYS.privacy, {}) };
    }
    function escapeHtml(s) {
      return String(s != null ? s : "").replace(/[&<>\"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[ch]);
    }
    function renderPrivacySettings() {
      const root = document.getElementById("social-privacy-settings");
      if (!root) return;
      const settings = getPrivacySettings();
      const controls = [["publicProfile", "Public Profile"], ["visibleInMatchLists", "Visible in Match Lists"], ["allowMeetInvites", "Allow Meet Invites"], ["allowCircleInvites", "Allow Circle Invites"], ["showSocialReputation", "Show Social Reputation"]];
      root.innerHTML = `<section class="meet-invite-inbox-panel social-privacy-panel"><div class="section-head"><h2>Privacy Settings</h2><span class="section-meta">Knowledge graph, never location graph.</span></div>${controls.map(([key, label]) => `<label class="social-privacy-toggle"><span>${escapeHtml(label)}</span><input type="checkbox" data-social-privacy="${key}" ${settings[key] ? "checked" : ""}></label>`).join("")}</section>`;
      root.querySelectorAll("[data-social-privacy]").forEach((el) => el.addEventListener("change", () => savePrivacySettings(currentUserId(), { [el.dataset.socialPrivacy]: el.checked })));
    }
    Object.assign(window, { HG_SOCIAL_INDEX: getSocialIndex(), HG_SOCIAL_INDEX_KEYS: KEYS, HG_SOCIAL_PRIVACY_DEFAULTS: DEFAULT_PRIVACY, getPrivacySettings, savePrivacySettings, canSeeProfile, canSeeMatch, canSendInvite, canViewCircle, canViewSocialHistory, blockUser, unblockUser, getBlockedUsers, isBlocked, reportUser, getReports, resolveReport, refreshSocialIndex: () => window.HG_SOCIAL_INDEX = getSocialIndex(), renderPrivacySettings });
    document.addEventListener("DOMContentLoaded", renderPrivacySettings);
  })();
})();
//# sourceMappingURL=hgSocialPrivacy.js.map
