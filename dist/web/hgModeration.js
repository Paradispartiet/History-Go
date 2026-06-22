(() => {
  // js/hgModeration.ts
  (function() {
    "use strict";
    function readJson(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key) || "") || fallback;
      } catch {
        return fallback;
      }
    }
    function cleanList(value) {
      return Array.from(new Set((Array.isArray(value) ? value : []).map((item) => String(item || "").trim()).filter(Boolean)));
    }
    function currentUserId() {
      var _a, _b;
      return String(((_b = (_a = window.HGAha) == null ? void 0 : _a.getProfileIdSync) == null ? void 0 : _b.call(_a)) || localStorage.getItem("aha_profile_id") || "local-user");
    }
    function reportsFor(userId) {
      var _a;
      return (((_a = window.getReports) == null ? void 0 : _a.call(window)) || readJson("hg_social_reports_v1", [])).filter((r) => r.targetId === String(userId) && r.status !== "resolved");
    }
    function repeatedDeclines(userId, targetId) {
      const ids = cleanList(readJson("hg_social_log_v1", {}).declinedInvites);
      const invites = readJson("hg_knowledge_meet_invites_v1", []);
      return invites.filter((i) => ids.includes(i.inviteId) && i.fromUserId === String(userId) && i.toUserId === String(targetId)).length;
    }
    function trust(userId, targetId) {
      var _a, _b;
      return ((_b = (_a = window.calculateTrustScore) == null ? void 0 : _a.call(window, userId, targetId)) == null ? void 0 : _b.trustScore) || 0;
    }
    function getModerationFlags(userId = currentUserId()) {
      const reports = reportsFor(userId);
      return { reports: reports.length, blockedByViewer: false, repeatedDeclines: readJson("hg_knowledge_meet_invites_v1", []).filter((i) => i.fromUserId === String(userId) && i.status === "declined").length, lowTrust: false, restricted: reports.length >= 3 };
    }
    function canInteract(userId, targetId) {
      var _a;
      if ((_a = window.isBlocked) == null ? void 0 : _a.call(window, userId, targetId)) return false;
      if (reportsFor(userId).length >= 3) return false;
      if (repeatedDeclines(userId, targetId) >= 3) return false;
      return trust(userId, targetId) >= 0;
    }
    function canJoinCircle(userId, circleId) {
      var _a;
      if (!((_a = window.canViewCircle) == null ? void 0 : _a.call(window, userId, circleId))) return false;
      return !getModerationFlags(userId).restricted;
    }
    function canAttendMeet(userId, meetId) {
      const meet = readJson("hg_knowledge_meet_invites_v1", []).find((i) => i.inviteId === String(meetId)) || readJson("hg_open_meetups_v1", []).find((m) => m.meetupId === String(meetId));
      const participants = cleanList([meet == null ? void 0 : meet.fromUserId, meet == null ? void 0 : meet.toUserId, ...(meet == null ? void 0 : meet.participants) || []]);
      return Boolean(meet && !getModerationFlags(userId).restricted && participants.every((id) => !id || id === String(userId) || canInteract(userId, id)));
    }
    Object.assign(window, { canInteract, canJoinCircle, canAttendMeet, getModerationFlags, HGModeration: { canInteract, canJoinCircle, canAttendMeet, getModerationFlags } });
  })();
})();
//# sourceMappingURL=hgModeration.js.map
