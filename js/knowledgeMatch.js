(function () {
  "use strict";

  const PROFILE_KEY = "hg_public_profile_v1";
  const DIRECTORY_KEY = "hg_public_profiles_v1";
  const INVITES_KEY = "hg_knowledge_meet_invites_v1";
  const PRESETS = [
    "Want to explore this place together?",
    "Want to take this route together?",
    "Want to do this quiz together?"
  ];

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function cleanList(value) {
    return Array.from(new Set((Array.isArray(value) ? value : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)));
  }

  function addWeight(vector, key, weight) {
    const id = String(key || "").trim();
    if (!id) return;
    vector[id] = Number(vector[id] || 0) + weight;
  }

  function getCurrentUserId() {
    return String(window.HGAha?.getProfileIdSync?.() || localStorage.getItem("aha_profile_id") || "local-user");
  }

  function getDisplayName() {
    const name = window.HGUserProfile?.getDisplayName?.() || localStorage.getItem("user_name") || "History Go bruker";
    return name === "Logg inn" ? "History Go bruker" : name;
  }

  function getPublicProfile() {
    const stored = readJson(PROFILE_KEY, {});
    return {
      userId: getCurrentUserId(),
      displayName: String(stored.displayName || getDisplayName()),
      publicProfile: Boolean(stored.publicProfile),
      bio: String(stored.bio || ""),
      badges: cleanList(stored.badges),
      completedEmner: cleanList(stored.completedEmner),
      coreConcepts: cleanList(stored.coreConcepts),
      interests: cleanList(stored.interests)
    };
  }

  function savePublicProfile(patch) {
    const next = { ...getPublicProfile(), ...(patch || {}) };
    next.publicProfile = Boolean(next.publicProfile);
    next.badges = cleanList(next.badges);
    next.completedEmner = cleanList(next.completedEmner);
    next.coreConcepts = cleanList(next.coreConcepts);
    next.interests = cleanList(next.interests);
    writeJson(PROFILE_KEY, next);
    window.HG_PUBLIC_PROFILE = next;
    return next;
  }

  function buildKnowledgeFingerprint(user) {
    const conceptVector = {};
    const domainVector = {};
    const badgeVector = {};
    const profile = user || getPublicProfile();

    cleanList(profile.coreConcepts).forEach((id) => addWeight(conceptVector, id, 3));
    cleanList(profile.completedEmner).forEach((id) => addWeight(domainVector, id, 2));
    cleanList(profile.interests).forEach((id) => addWeight(domainVector, id, 1));
    cleanList(profile.badges).forEach((id) => addWeight(badgeVector, id, 3));

    const quizProgress = readJson("quiz_progress", {});
    Object.entries(quizProgress || {}).forEach(([badgeId, progress]) => {
      const completed = cleanList(progress?.completed);
      if (completed.length) addWeight(badgeVector, badgeId, 2 + completed.length);
      completed.forEach((quizId) => addWeight(conceptVector, quizId, 1));
    });

    const merits = readJson("merits_by_category", {});
    Object.entries(merits || {}).forEach(([badgeId, merit]) => addWeight(badgeVector, badgeId, Math.max(1, Number(merit?.points || 0))));

    const history = window.HGLearningLog?.getQuizHistory?.() || readJson("hg_learning_log_v1", []);
    (Array.isArray(history) ? history : []).forEach((entry) => {
      addWeight(conceptVector, entry?.concept || entry?.topic || entry?.id || entry?.targetId, entry?.correct === false ? 0.5 : 2);
      addWeight(domainVector, entry?.category || entry?.domain || entry?.badgeId, 1.5);
      addWeight(badgeVector, entry?.badgeId || entry?.category, 1);
    });

    const emneCoverage = readJson("emne_coverage", {});
    Object.entries(emneCoverage || {}).forEach(([emneId, value]) => {
      const weight = typeof value === "number" ? value : Number(value?.completed || value?.score || 1);
      addWeight(domainVector, emneId, Math.max(1, weight));
    });

    return { conceptVector, domainVector, badgeVector };
  }

  function dotSimilarity(a, b) {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    let dot = 0, magA = 0, magB = 0;
    keys.forEach((key) => { const av = Number(a?.[key] || 0); const bv = Number(b?.[key] || 0); dot += av * bv; magA += av * av; magB += bv * bv; });
    return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  }

  function getDirectory() {
    return cleanDirectory(readJson(DIRECTORY_KEY, []));
  }

  function cleanDirectory(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      userId: String(row?.userId || "").trim(),
      displayName: String(row?.displayName || "History Go bruker"),
      publicProfile: row?.publicProfile === true,
      bio: String(row?.bio || ""),
      badges: cleanList(row?.badges),
      completedEmner: cleanList(row?.completedEmner),
      coreConcepts: cleanList(row?.coreConcepts),
      interests: cleanList(row?.interests)
    })).filter((row) => row.userId && row.publicProfile);
  }

  function getKnowledgeMatches(userId) {
    const current = getPublicProfile();
    if (!current.publicProfile) return [];
    const sourceId = userId || current.userId;
    const sourceFp = buildKnowledgeFingerprint(current);
    return getDirectory().filter((target) => target.userId !== sourceId).map((target) => {
      const targetFp = buildKnowledgeFingerprint(target);
      const sharedConcepts = cleanList(current.coreConcepts).filter((id) => target.coreConcepts.includes(id));
      const sharedBadges = cleanList(current.badges).filter((id) => target.badges.includes(id));
      const sharedEmner = cleanList(current.completedEmner).filter((id) => target.completedEmner.includes(id));
      const domainSimilarity = dotSimilarity(sourceFp.domainVector, targetFp.domainVector);
      const raw = (sharedConcepts.length * 18) + (sharedBadges.length * 14) + (sharedEmner.length * 10) + (domainSimilarity * 40);
      const matchScore = Math.max(0, Math.min(100, Math.round(raw)));
      const reasonText = sharedConcepts.length ? `Deler ${sharedConcepts.length} kjernebegrep` : sharedBadges.length ? `Deler ${sharedBadges.length} merker` : "Lignende kunnskapsdomener";
      return { targetUserId: target.userId, displayName: target.displayName, matchScore, sharedConcepts, sharedBadges, sharedEmner, reasonText };
    }).filter((match) => match.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
  }

  function sendMeetInvite(targetUserId, spotId, options) {
    const invite = {
      inviteId: `hg-invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fromUserId: getCurrentUserId(),
      toUserId: String(targetUserId || ""),
      spotId: String(spotId || ""),
      proposedTime: String(options?.proposedTime || ""),
      messagePreset: PRESETS.includes(options?.messagePreset) ? options.messagePreset : PRESETS[0],
      status: "pending"
    };
    const invites = readJson(INVITES_KEY, []);
    invites.push(invite);
    writeJson(INVITES_KEY, invites);
    return invite;
  }

  function renderKnowledgeMatches() {
    const root = document.getElementById("knowledge-match-list");
    if (!root) return;
    const profile = getPublicProfile();
    const matches = getKnowledgeMatches(profile.userId).slice(0, 6);
    root.innerHTML = `
      <div class="knowledge-match-controls">
        <label><input type="checkbox" id="knowledgePublicToggle" ${profile.publicProfile ? "checked" : ""}> Gjør kunnskapsprofilen offentlig</label>
        <span>History Go matcher kun på læring – aldri GPS, avstand, besøkshistorikk eller sist sett.</span>
      </div>
      ${profile.publicProfile ? (matches.length ? matches.map((m) => `
        <article class="knowledge-match-card">
          <div><strong>${escapeHtml(m.displayName)}</strong><span>${escapeHtml(m.reasonText)}</span></div>
          <b>${m.matchScore}%</b>
          <p>${m.sharedConcepts.slice(0, 4).map(escapeHtml).join(", ") || "Felles domenespor"}</p>
          <p>${m.sharedBadges.slice(0, 4).map(escapeHtml).join(", ")}</p>
          <button type="button" data-view-profile="${escapeHtml(m.targetUserId)}">View Profile</button>
        </article>`).join("") : `<p class="knowledge-match-empty">Ingen offentlige kunnskapsmatcher ennå.</p>`) : `<p class="knowledge-match-empty">Slå på offentlig profil for å finne People Like You.</p>`}`;
    document.getElementById("knowledgePublicToggle")?.addEventListener("change", (event) => {
      savePublicProfile({ publicProfile: Boolean(/** @type {HTMLInputElement} */ (event.target).checked) });
      renderKnowledgeMatches();
    });
  }

  function escapeHtml(s) { return String(s ?? "").replace(/[&<>\"']/g, (ch) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;" }[ch])); }

  window.HG_PUBLIC_PROFILE = getPublicProfile();
  window.buildKnowledgeFingerprint = buildKnowledgeFingerprint;
  window.getKnowledgeMatches = getKnowledgeMatches;
  window.sendMeetInvite = sendMeetInvite;
  window.HGKnowledgeMatch = { getPublicProfile, savePublicProfile, buildKnowledgeFingerprint, getKnowledgeMatches, sendMeetInvite, renderKnowledgeMatches, presets: PRESETS };
})();
