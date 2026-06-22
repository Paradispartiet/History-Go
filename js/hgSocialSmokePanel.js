// @ts-nocheck
(function () {
  "use strict";

  function currentUserId() { return String(window.HGAha?.getProfileIdSync?.() || localStorage.getItem("aha_profile_id") || "local-user"); }
  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; } }
  function check(id, label, fn) { try { const result = fn(); return { id, label, ok: Boolean(result), details: typeof result === "string" ? result : (result ? "ok" : "failed") }; } catch (error) { return { id, label, ok: false, details: error?.message || String(error) }; } }
  function hasText(id) { return Boolean((document.getElementById(id)?.textContent || "").trim()); }
  function privacyGuard() { return window.assertNoSocialPrivacyLeak || window.HG_SocialGuards?.assertNoSocialPrivacyLeak || null; }

  function runHGSocialSmokeTest() {
    window.seedHGSocialDemoData?.();
    const uid = currentUserId();
    const matches = window.getKnowledgeMatches?.(uid) || [];
    const top = matches[0]?.targetUserId || "demo-industrial-historian";
    const popup = window.openMatchProfile?.(top);
    const invite = window.sendMeetInvite?.("demo-industrial-historian", "demo-smoke-topic", { spotTitle: "Smoke-test knowledge topic" });
    if (invite?.inviteId) window.acceptMeetInvite?.(invite.inviteId);
    const route = window.startSharedRoute?.({ participants: [uid, "demo-industrial-historian"], spots: ["smoke-topic"], routeType: "pair" });
    const completedRoute = route?.routeId ? window.completeSharedRoute?.(route.routeId) : null;
    const quiz = window.startSharedQuiz?.({ placeId: "smoke-topic", quizId: "smoke-quiz", participants: ["demo-industrial-historian"], mode: "cooperative" });
    const completedQuiz = quiz?.sharedQuizId ? window.completeSharedQuiz?.(quiz.sharedQuizId, { smoke: "answer" }) : null;
    window.renderKnowledgeMatches?.(); window.renderMeetInviteInbox?.(); window.renderConfirmedMeets?.(); window.renderLearningCircles?.(); window.renderSocialProgression?.(); window.renderCircleActivity?.(); window.renderSocialTimeline?.();
    const badPayload = { userId: "bad_test_user", latitude: 59.91, longitude: 10.75, lastSeen: "now" };
    const guard = privacyGuard();
    const leakCaught = guard ? guard(badPayload, "hgSocialSmokeTest") === false : false;
    const timeline = readJson("hg_social_timeline_v1", []);
    const checks = [
      check("public_profiles", "Public profiles render", () => (readJson("hg_public_profiles_v1", []).length >= 6) && hasText("knowledge-match-list")),
      check("knowledge_matches", "Knowledge matches render", () => matches.length >= 3),
      check("match_popup", "Match profile popup opens", () => Boolean(popup || document.getElementById("matchProfilePopup"))),
      check("meet_invite_create", "Meet invite can be created", () => Boolean(invite?.inviteId)),
      check("inbox", "Incoming/outgoing inbox renders", () => hasText("meet-invite-inbox")),
      check("confirmed_meets", "Confirmed meets render", () => hasText("confirmed-meets")),
      check("circles", "Learning circles render", () => (window.getLearningCircles?.() || []).length >= 2 && hasText("learning-circles")),
      check("trust", "Trust score calculates", () => Number(window.calculateTrustScore?.(uid, "demo-industrial-historian")?.trustScore || 0) > 0),
      check("route_complete", "Shared route can complete", () => completedRoute?.completionState === "completed"),
      check("quiz_complete", "Shared quiz can complete", () => completedQuiz?.completionState === "completed"),
      check("timeline_private", "Social timeline remains private", () => timeline.length > 0 && timeline.every((e) => e.private === true)),
      check("privacy_guard", "Privacy guard detects forbidden fields", () => leakCaught)
    ];
    const ok = checks.every((c) => c.ok);
    renderHGSocialSmokePanel({ ok, checks });
    return { ok, checks };
  }

  function renderHGSocialSmokePanel(result) {
    let root = document.getElementById("hg-social-smoke-panel");
    if (!root) { const after = document.getElementById("confirmed-meets"); root = document.createElement("div"); root.id = "hg-social-smoke-panel"; after?.insertAdjacentElement("afterend", root); }
    const checks = result?.checks || [];
    root.innerHTML = `<section class="meet-invite-inbox-panel hg-social-smoke-panel"><div class="section-head"><h2>HG Social Smoke Test</h2><span class="section-meta">Demo/seed/verify batch</span></div><div class="meet-invite-actions"><button data-smoke-enable>Enable Demo Mode</button><button data-smoke-seed>Seed Demo Data</button><button data-smoke-run>Run Smoke Test</button><button data-smoke-clear>Clear Demo Data</button></div>${checks.length ? `<ul class="hg-social-smoke-checks">${checks.map((c) => `<li class="${c.ok ? "is-pass" : "is-fail"}">${c.ok ? "✅" : "❌"} <strong>${c.label}</strong> <span>${c.details || ""}</span></li>`).join("")}</ul>` : `<p class="knowledge-match-empty">Run smoke test to verify the social layer.</p>`}</section>`;
    root.querySelector("[data-smoke-enable]")?.addEventListener("click", () => { window.enableHGSocialDemoMode?.(); renderHGSocialSmokePanel(); });
    root.querySelector("[data-smoke-seed]")?.addEventListener("click", () => { window.seedHGSocialDemoData?.(); renderHGSocialSmokePanel(); });
    root.querySelector("[data-smoke-run]")?.addEventListener("click", runHGSocialSmokeTest);
    root.querySelector("[data-smoke-clear]")?.addEventListener("click", () => window.clearHGSocialDemoData?.());
  }

  window.HGSocialSmokeTest = { runHGSocialSmokeTest };
  window.runHGSocialSmokeTest = runHGSocialSmokeTest;
  document.addEventListener("DOMContentLoaded", () => renderHGSocialSmokePanel());
})();
