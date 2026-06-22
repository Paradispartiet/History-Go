// @ts-nocheck
(function () {
  "use strict";
  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; } }
  function cleanList(value) { return Array.from(new Set((Array.isArray(value) ? value : []).map((item) => String(item || "").trim()).filter(Boolean))); }
  function currentUserId() { return String(window.HGAha?.getProfileIdSync?.() || localStorage.getItem("aha_profile_id") || "local-user"); }
  function reportsFor(userId) { return (window.getReports?.() || readJson("hg_social_reports_v1", [])).filter((r) => r.targetId === String(userId) && r.status !== "resolved"); }
  function repeatedDeclines(userId, targetId) { const ids = cleanList(readJson("hg_social_log_v1", {}).declinedInvites); const invites = readJson("hg_knowledge_meet_invites_v1", []); return invites.filter((i) => ids.includes(i.inviteId) && i.fromUserId === String(userId) && i.toUserId === String(targetId)).length; }
  function trust(userId, targetId) { return window.calculateTrustScore?.(userId, targetId)?.trustScore || 0; }
  function getModerationFlags(userId = currentUserId()) { const reports = reportsFor(userId); return { reports: reports.length, blockedByViewer: false, repeatedDeclines: readJson("hg_knowledge_meet_invites_v1", []).filter((i) => i.fromUserId === String(userId) && i.status === "declined").length, lowTrust: false, restricted: reports.length >= 3 };
  }
  function canInteract(userId, targetId) { if (window.isBlocked?.(userId, targetId)) return false; if (reportsFor(userId).length >= 3) return false; if (repeatedDeclines(userId, targetId) >= 3) return false; return trust(userId, targetId) >= 0; }
  function canJoinCircle(userId, circleId) { if (!window.canViewCircle?.(userId, circleId)) return false; return !getModerationFlags(userId).restricted; }
  function canAttendMeet(userId, meetId) { const meet = readJson("hg_knowledge_meet_invites_v1", []).find((i) => i.inviteId === String(meetId)) || readJson("hg_open_meetups_v1", []).find((m) => m.meetupId === String(meetId)); const participants = cleanList([meet?.fromUserId, meet?.toUserId, ...(meet?.participants || [])]); return Boolean(meet && !getModerationFlags(userId).restricted && participants.every((id) => !id || id === String(userId) || canInteract(userId, id))); }
  Object.assign(window, { canInteract, canJoinCircle, canAttendMeet, getModerationFlags, HGModeration: { canInteract, canJoinCircle, canAttendMeet, getModerationFlags } });
})();
