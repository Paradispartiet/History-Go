(function () {
  "use strict";

  const HG_PUBLIC_PROFILES = "hg_public_profiles_v1";
  const CURRENT_PROFILE_KEY = "hg_public_profile_v1";
  const INVITES_KEY = "hg_knowledge_meet_invites_v1";
  const HG_SOCIAL_LOG = "hg_social_log_v1";
  const PRESETS = Object.freeze([
    "Vil du utforske dette stedet sammen?",
    "Vil du ta denne ruta sammen?",
    "Vil du ta quizen her sammen?",
    "Vil du sammenligne observasjoner her?"
  ]);
  const VALID_STATUSES = new Set(["pending", "accepted", "declined", "confirmed", "cancelled"]);

  const MOCK_PROFILES = Object.freeze([
    { userId: "mock-saga", displayName: "Saga", publicProfile: true, bio: "Liker byhistorie, arkitektur og små spor i gatene.", avatar: "", badges: ["historie", "by"], completedEmner: ["oslo", "arkitektur"], coreConcepts: ["urbanisering", "offentlighet", "modernisme"], interests: ["by", "politikk"] },
    { userId: "mock-ask", displayName: "Ask", publicProfile: true, bio: "Samler på natur- og vitenskapsspor i History Go.", avatar: "", badges: ["natur", "vitenskap"], completedEmner: ["biologi", "oslo"], coreConcepts: ["økologi", "observasjon", "klassifikasjon"], interests: ["natur", "vitenskap"] },
    { userId: "mock-ida", displayName: "Ida", publicProfile: true, bio: "Kunst, litteratur og idehistorie sett gjennom steder.", avatar: "", badges: ["kunst", "litteratur", "historie"], completedEmner: ["modernisme", "oslo"], coreConcepts: ["modernisme", "kanon", "offentlighet"], interests: ["kunst", "litteratur"] }
  ]);

  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; } }
  function writeJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function cleanList(value) { return Array.from(new Set((Array.isArray(value) ? value : []).map((item) => String(item || "").trim()).filter(Boolean))); }
  function escapeHtml(s) { return String(s ?? "").replace(/[&<>\"']/g, (ch) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#039;" }[ch])); }
  function getCurrentUserId() { return String(window.HGAha?.getProfileIdSync?.() || localStorage.getItem("aha_profile_id") || "local-user"); }
  function getDisplayName() { const name = window.HGUserProfile?.getDisplayName?.() || localStorage.getItem("user_name") || "History Go bruker"; return name === "Logg inn" ? "History Go bruker" : name; }
  function addWeight(vector, key, weight) { const id = String(key || "").trim(); if (id) vector[id] = Number(vector[id] || 0) + Number(weight || 0); }
  function badgeTierWeight(value) { const n = Number(value?.tier || value?.level || value?.points || value?.count || 1); return Math.max(1, Math.min(12, n)); }

  function normalizeProfile(profile) {
    return {
      userId: String(profile?.userId || "").trim(),
      displayName: String(profile?.displayName || "History Go bruker"),
      publicProfile: profile?.publicProfile === true,
      bio: String(profile?.bio || ""),
      avatar: String(profile?.avatar || profile?.avatarUrl || ""),
      badges: cleanList(profile?.badges),
      completedEmner: cleanList(profile?.completedEmner),
      coreConcepts: cleanList(profile?.coreConcepts),
      interests: cleanList(profile?.interests)
    };
  }

  function deriveCurrentSignals(profile) {
    const quizProgress = readJson("quiz_progress", {});
    Object.entries(quizProgress || {}).forEach(([badgeId, progress]) => {
      const completed = cleanList(progress?.completed);
      if (completed.length) profile.badges.push(badgeId);
      completed.forEach((quizId) => profile.coreConcepts.push(quizId));
    });
    const history = window.HGLearningLog?.getQuizHistory?.() || readJson("hg_learning_log_v1", []);
    (Array.isArray(history) ? history : []).forEach((entry) => {
      [entry?.concept, entry?.topic, entry?.id, entry?.targetId].forEach((v) => v && profile.coreConcepts.push(v));
      [entry?.category, entry?.domain, entry?.badgeId].forEach((v) => v && profile.interests.push(v));
    });
    profile.badges = cleanList(profile.badges); profile.completedEmner = cleanList(profile.completedEmner); profile.coreConcepts = cleanList(profile.coreConcepts); profile.interests = cleanList(profile.interests);
    return profile;
  }

  function getCurrentPublicProfile() {
    const stored = readJson(CURRENT_PROFILE_KEY, {});
    return deriveCurrentSignals(normalizeProfile({ userId: getCurrentUserId(), displayName: stored.displayName || getDisplayName(), publicProfile: Boolean(stored.publicProfile), bio: stored.bio, avatar: stored.avatar, badges: stored.badges, completedEmner: stored.completedEmner, coreConcepts: stored.coreConcepts, interests: stored.interests }));
  }

  function getAllProfiles() {
    const saved = readJson(HG_PUBLIC_PROFILES, []);
    const merged = [...MOCK_PROFILES, ...(Array.isArray(saved) ? saved : []), getCurrentPublicProfile()].map(normalizeProfile);
    const byId = new Map(); merged.forEach((p) => { if (p.userId) byId.set(p.userId, { ...(byId.get(p.userId) || {}), ...p }); });
    return Array.from(byId.values());
  }

  function savePublicProfile(patch) {
    const next = normalizeProfile({ ...getCurrentPublicProfile(), ...(patch || {}) });
    next.publicProfile = Boolean(next.publicProfile);
    writeJson(CURRENT_PROFILE_KEY, next);
    const others = getAllProfiles().filter((p) => p.userId !== next.userId && !String(p.userId).startsWith("mock-"));
    writeJson(HG_PUBLIC_PROFILES, [...others, next]);
    window.HG_PUBLIC_PROFILE = next;
    renderKnowledgeMatches(); renderMeetInviteInbox(); renderConfirmedMeets(); renderSocialHistory();
    return next;
  }
  function togglePublicProfile(force) { const current = getCurrentPublicProfile(); return savePublicProfile({ publicProfile: typeof force === "boolean" ? force : !current.publicProfile }); }

  function buildKnowledgeFingerprint(profile) {
    const p = profile ? normalizeProfile(profile) : getCurrentPublicProfile();
    const conceptVector = {}, domainVector = {}, badgeVector = {}, emneVector = {};
    p.coreConcepts.forEach((id) => addWeight(conceptVector, id, 3));
    p.interests.forEach((id) => addWeight(domainVector, id, 2));
    p.completedEmner.forEach((id) => { addWeight(emneVector, id, 4); addWeight(domainVector, id, 1.5); });
    p.badges.forEach((id) => addWeight(badgeVector, id, 3));
    if (!profile || p.userId === getCurrentUserId()) {
      const quizProgress = readJson("quiz_progress", {});
      Object.entries(quizProgress || {}).forEach(([badgeId, progress]) => { const completed = cleanList(progress?.completed); addWeight(badgeVector, badgeId, 2 + completed.length); completed.forEach((quizId) => addWeight(conceptVector, quizId, 1.5)); });
      Object.entries(readJson("merits_by_category", {}) || {}).forEach(([badgeId, merit]) => addWeight(badgeVector, badgeId, badgeTierWeight(merit)));
      (window.HGLearningLog?.getQuizHistory?.() || readJson("hg_learning_log_v1", []) || []).forEach((entry) => { addWeight(conceptVector, entry?.concept || entry?.topic || entry?.id || entry?.targetId, entry?.correct === false ? 0.5 : 2); addWeight(domainVector, entry?.category || entry?.domain || entry?.badgeId, 1.5); addWeight(badgeVector, entry?.badgeId || entry?.category, 1); });
    }
    return { conceptVector, domainVector, badgeVector, emneVector };
  }
  function dotSimilarity(a, b) { const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]); let dot = 0, ma = 0, mb = 0; keys.forEach((k) => { const av = Number(a?.[k] || 0), bv = Number(b?.[k] || 0); dot += av * bv; ma += av * av; mb += bv * bv; }); return ma && mb ? dot / (Math.sqrt(ma) * Math.sqrt(mb)) : 0; }
  function shared(a, b, key) { return cleanList(a?.[key]).filter((id) => cleanList(b?.[key]).includes(id)); }
  function calculateMatchScore(userA, userB) { const fa = buildKnowledgeFingerprint(userA), fb = buildKnowledgeFingerprint(userB); return Math.round(Math.min(100, (dotSimilarity(fa.conceptVector, fb.conceptVector) * 35) + (dotSimilarity(fa.domainVector, fb.domainVector) * 25) + (dotSimilarity(fa.badgeVector, fb.badgeVector) * 20) + (dotSimilarity(fa.emneVector, fb.emneVector) * 20))); }
  function getKnowledgeMatches(userId) { const current = getAllProfiles().find((p) => p.userId === String(userId || getCurrentUserId())) || getCurrentPublicProfile(); if (!current.publicProfile) return []; return getAllProfiles().filter((p) => p.publicProfile && p.userId !== current.userId).map((target) => { const sharedConcepts = shared(current, target, "coreConcepts"), sharedBadges = shared(current, target, "badges"), sharedEmner = shared(current, target, "completedEmner"); const matchScore = calculateMatchScore(current, target); const reasonText = sharedConcepts.length ? `Deler ${sharedConcepts.length} kjernebegrep` : sharedEmner.length ? `Deler ${sharedEmner.length} emner` : sharedBadges.length ? `Deler ${sharedBadges.length} merker` : "Lignende kunnskapsdomener"; return { targetUserId: target.userId, displayName: target.displayName, avatar: target.avatar, matchScore, sharedConcepts, sharedBadges, sharedEmner, reasonText }; }).filter((m) => m.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore); }
  function getProfileByUserId(userId) { return getAllProfiles().find((p) => p.userId === String(userId || "")) || null; }
  function initials(name) { return String(name || "HG").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "HG"; }
  function chips(items, empty) { const list = cleanList(items); return list.length ? `<div class="match-profile-chips">${list.map((i) => `<span>${escapeHtml(i)}</span>`).join("")}</div>` : `<p class="match-profile-empty">${escapeHtml(empty)}</p>`; }
  function avatarHtml(profile, cls = "match-profile-avatar") { return profile.avatar ? `<img class="${cls}" src="${escapeHtml(profile.avatar)}" alt="">` : `<div class="${cls} match-profile-avatar-fallback" aria-hidden="true">${escapeHtml(initials(profile.displayName))}</div>`; }

  function renderMatchProfile(profile) { const match = getKnowledgeMatches(getCurrentUserId()).find((m) => m.targetUserId === profile.userId) || { sharedConcepts: [], sharedBadges: [], sharedEmner: [], reasonText: "Lignende kunnskapsdomener" }; return `<div class="hg-modal match-profile-modal"><header class="hg-modal-header match-profile-header">${avatarHtml(profile)}<div><p class="hg-modal-meta">Offentlig kunnskapsprofil</p><h2 class="hg-modal-title">${escapeHtml(profile.displayName)}</h2><p class="match-profile-bio">${escapeHtml(profile.bio || "Offentlig profil i History Go.")}</p></div></header><div class="hg-modal-body match-profile-body"><section class="hg-section match-profile-section"><h3>Læringsidentitet</h3><div class="match-profile-grid"><div><h4>Badges</h4>${chips(profile.badges, "Ingen badges.")}</div><div><h4>Fullførte emner</h4>${chips(profile.completedEmner, "Ingen emner.")}</div><div><h4>Kjernebegrep</h4>${chips(profile.coreConcepts, "Ingen begrep.")}</div><div><h4>Interesser</h4>${chips(profile.interests, "Ingen interesser.")}</div></div></section><section class="hg-section match-profile-section"><h3>Felles lag</h3><div class="match-profile-grid"><div><h4>Delte begrep</h4>${chips(match.sharedConcepts, "Ingen delte begrep.")}</div><div><h4>Delte badges</h4>${chips(match.sharedBadges, "Ingen delte badges.")}</div><div><h4>Delte emner</h4>${chips(match.sharedEmner, "Ingen delte emner.")}</div><div><h4>Matchgrunn</h4><p>${escapeHtml(match.reasonText)}</p></div></div></section><div class="match-profile-actions"><button type="button" data-match-action="meet">Foreslå møte</button><button type="button" data-match-action="close">Lukk</button></div></div></div>`; }
  function closeMatchProfilePopup() { document.getElementById("matchProfilePopup")?.remove(); }
  function openMatchProfile(userId) { const profile = getProfileByUserId(userId); if (!profile?.publicProfile) return null; closeMatchProfilePopup(); const popup = document.createElement("div"); popup.id = "matchProfilePopup"; popup.className = "hg-popup match-profile-popup"; popup.setAttribute("role", "dialog"); popup.setAttribute("aria-modal", "true"); popup.innerHTML = `<div class="hg-popup-inner">${renderMatchProfile(profile)}</div>`; popup.addEventListener("click", (event) => { if (event.target === popup) closeMatchProfilePopup(); const action = event.target?.closest?.("[data-match-action]")?.getAttribute("data-match-action"); if (action === "close") closeMatchProfilePopup(); if (action === "meet") { closeMatchProfilePopup(); openMeetInviteModal(profile.userId); } }); document.body.appendChild(popup); return popup; }

  function getSocialLog() { const log = readJson(HG_SOCIAL_LOG, {}); return { metUsers: cleanList(log.metUsers), acceptedInvites: cleanList(log.acceptedInvites), declinedInvites: cleanList(log.declinedInvites), completedMeetups: cleanList(log.completedMeetups) }; }
  function saveSocialLog(log) { writeJson(HG_SOCIAL_LOG, getSocialLogFromPatch(log)); }
  function getSocialLogFromPatch(patch) { const base = getSocialLog(); return { metUsers: cleanList([...(base.metUsers || []), ...cleanList(patch?.metUsers)]), acceptedInvites: cleanList([...(base.acceptedInvites || []), ...cleanList(patch?.acceptedInvites)]), declinedInvites: cleanList([...(base.declinedInvites || []), ...cleanList(patch?.declinedInvites)]), completedMeetups: cleanList([...(base.completedMeetups || []), ...cleanList(patch?.completedMeetups)]) }; }
  function getMeetInvites() { return (Array.isArray(readJson(INVITES_KEY, [])) ? readJson(INVITES_KEY, []) : []).map((i) => ({ inviteId: String(i?.inviteId || ""), fromUserId: String(i?.fromUserId || ""), toUserId: String(i?.toUserId || ""), spotId: String(i?.spotId || ""), proposedTime: String(i?.proposedTime || ""), messagePreset: PRESETS.includes(i?.messagePreset) ? i.messagePreset : PRESETS[0], status: VALID_STATUSES.has(i?.status) ? i.status : "pending", fromDisplayName: String(i?.fromDisplayName || ""), toDisplayName: String(i?.toDisplayName || ""), spotTitle: String(i?.spotTitle || "") })).filter((i) => i.inviteId && i.fromUserId && i.toUserId); }
  function saveMeetInvites(invites) { writeJson(INVITES_KEY, Array.isArray(invites) ? invites : []); renderMeetInviteInbox(); renderConfirmedMeets(); renderSocialHistory(); }
  function getSpotTitle(invite) { const id = String(invite?.spotId || ""); const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((p) => String(p?.id || p?.placeId || "") === id); return invite?.spotTitle || place?.title || place?.name || id || "Valgt sted"; }
  function sendMeetInvite(toUserId, spotId = "", options = {}) { const target = getProfileByUserId(toUserId); const invite = { inviteId: `hg-invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, fromUserId: getCurrentUserId(), toUserId: String(toUserId || ""), spotId: String(spotId || ""), proposedTime: String(options.proposedTime || ""), messagePreset: PRESETS.includes(options.messagePreset) ? options.messagePreset : PRESETS[0], status: "pending", fromDisplayName: getDisplayName(), toDisplayName: target?.displayName || "", spotTitle: String(options.spotTitle || "") }; saveMeetInvites([...getMeetInvites(), invite]); return invite; }
  function updateInvite(inviteId, status) { const invites = getMeetInvites(); const invite = invites.find((i) => i.inviteId === String(inviteId || "")); if (!invite) return null; invite.status = status; if (status === "accepted") saveSocialLog({ acceptedInvites: [invite.inviteId], metUsers: [invite.fromUserId] }); if (status === "declined") saveSocialLog({ declinedInvites: [invite.inviteId] }); saveMeetInvites(invites); return invite; }
  function cancelMeetInvite(id) { return updateInvite(id, "cancelled"); } function acceptMeetInvite(id) { return updateInvite(id, "accepted"); } function declineMeetInvite(id) { return updateInvite(id, "declined"); } function cancelConfirmedMeet(id) { return updateInvite(id, "cancelled"); }
  function getIncomingMeetInvites(userId = getCurrentUserId()) { return getMeetInvites().filter((i) => i.toUserId === String(userId)); } function getOutgoingMeetInvites(userId = getCurrentUserId()) { return getMeetInvites().filter((i) => i.fromUserId === String(userId)); } function getConfirmedMeetInvites(userId = getCurrentUserId()) { const id = String(userId); return getMeetInvites().filter((i) => ["accepted", "confirmed"].includes(i.status) && (i.fromUserId === id || i.toUserId === id)); }
  function inviteCards(invites, dir) { return invites.length ? invites.map((i) => { const other = dir === "incoming" ? i.fromUserId : i.toUserId; const name = (dir === "incoming" ? i.fromDisplayName : i.toDisplayName) || getProfileByUserId(other)?.displayName || "History Go bruker"; const actions = dir === "incoming" ? `<button data-invite-action="accept" data-invite-id="${escapeHtml(i.inviteId)}" ${i.status !== "pending" ? "disabled" : ""}>Godta</button><button data-invite-action="decline" data-invite-id="${escapeHtml(i.inviteId)}" ${i.status !== "pending" ? "disabled" : ""}>Avslå</button>` : `<button data-invite-action="cancel" data-invite-id="${escapeHtml(i.inviteId)}" ${i.status !== "pending" ? "disabled" : ""}>Avbryt</button>`; return `<article class="knowledge-match-card meet-invite-card"><div><strong>${dir === "incoming" ? "Fra" : "Til"}: ${escapeHtml(name)}</strong><b>${escapeHtml(i.status)}</b></div><p><strong>Sted:</strong> ${escapeHtml(getSpotTitle(i))}</p><p><strong>Tid:</strong> ${escapeHtml(i.proposedTime || "Ikke satt")}</p><p>${escapeHtml(i.messagePreset)}</p><div class="meet-invite-actions">${actions}</div></article>`; }).join("") : `<p class="knowledge-match-empty">Ingen ${dir === "incoming" ? "innkommende" : "utgående"} møteforslag.</p>`; }
  function renderMeetInviteInbox() { const root = document.getElementById("meet-invite-inbox"); if (!root) return; const selected = root.dataset.selectedTab === "outgoing" ? "outgoing" : "incoming"; root.innerHTML = `<section class="meet-invite-inbox-panel"><div class="section-head"><h2>Meet Inbox</h2><span class="section-meta">Preset-only. Ingen chat, GPS eller visit logs.</span></div><div class="knowledge-match-controls meet-invite-tabs" role="tablist"><button data-meet-tab="incoming" aria-selected="${selected === "incoming"}">Incoming (${getIncomingMeetInvites().length})</button><button data-meet-tab="outgoing" aria-selected="${selected === "outgoing"}">Outgoing (${getOutgoingMeetInvites().length})</button></div><div class="meet-invite-list">${inviteCards(selected === "incoming" ? getIncomingMeetInvites() : getOutgoingMeetInvites(), selected)}</div></section>`; root.querySelectorAll("[data-meet-tab]").forEach((b) => b.addEventListener("click", () => { root.dataset.selectedTab = b.getAttribute("data-meet-tab") || "incoming"; renderMeetInviteInbox(); })); root.querySelectorAll("[data-invite-action]").forEach((b) => b.addEventListener("click", () => ({ accept: acceptMeetInvite, decline: declineMeetInvite, cancel: cancelMeetInvite }[b.getAttribute("data-invite-action")]?.(b.getAttribute("data-invite-id"))))); }
  function renderConfirmedMeets() { const root = document.getElementById("confirmed-meets"); if (!root) return; const rows = getConfirmedMeetInvites(); root.innerHTML = `<section class="meet-invite-inbox-panel"><div class="section-head"><h2>Confirmed Meets</h2><span class="section-meta">Avtalte møter fra kunnskapsmatcher.</span></div>${rows.length ? rows.map((i) => { const otherId = i.fromUserId === getCurrentUserId() ? i.toUserId : i.fromUserId; const other = getProfileByUserId(otherId); return `<article class="knowledge-match-card"><div><strong>${escapeHtml(getSpotTitle(i))}</strong><b>${escapeHtml(i.status)}</b></div><p><strong>Tid:</strong> ${escapeHtml(i.proposedTime || "Ikke satt")}</p><p><strong>Match:</strong> ${escapeHtml(other?.displayName || "History Go bruker")}</p><p>${escapeHtml(i.messagePreset)}</p><div class="meet-invite-actions"><button data-view-spot="${escapeHtml(i.spotId)}">View Spot</button><button data-cancel-confirmed="${escapeHtml(i.inviteId)}">Cancel Meet</button></div></article>`; }).join("") : `<p class="knowledge-match-empty">Ingen bekreftede møter ennå.</p>`}</section>`; root.querySelectorAll("[data-cancel-confirmed]").forEach((b) => b.addEventListener("click", () => cancelConfirmedMeet(b.getAttribute("data-cancel-confirmed")))); root.querySelectorAll("[data-view-spot]").forEach((b) => b.addEventListener("click", () => { const id = b.getAttribute("data-view-spot"); const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((p) => String(p?.id) === id); if (place && window.openPlaceCard) window.openPlaceCard(place); })); }
  function renderSocialHistory() { const root = document.getElementById("social-history"); if (!root) return; const log = getSocialLog(); root.innerHTML = `<section class="meet-invite-inbox-panel"><div class="section-head"><h2>Social History</h2><span class="section-meta">Privat lokalt minnelag. Ikke offentlig.</span></div><div class="social-history-grid"><span>Møtt: ${log.metUsers.length}</span><span>Godtatt: ${log.acceptedInvites.length}</span><span>Avslått: ${log.declinedInvites.length}</span><span>Fullført: ${log.completedMeetups.length}</span></div></section>`; }
  function renderKnowledgeMatches() { const root = document.getElementById("knowledge-match-list"); if (!root) return; const profile = getCurrentPublicProfile(); const matches = getKnowledgeMatches(profile.userId); root.innerHTML = `<div class="knowledge-match-controls"><label><input type="checkbox" id="knowledgePublicToggle" ${profile.publicProfile ? "checked" : ""}> Gjør kunnskapsprofilen offentlig</label><span>Matcher på begrep, emner, badges og domener – aldri GPS, nærhet, besøkshistorikk, følgere eller sist sett.</span></div>${profile.publicProfile ? (matches.length ? matches.map((m) => `<article class="knowledge-match-card"><div class="knowledge-match-card-head">${avatarHtml(m, "knowledge-match-avatar")}<div><strong>${escapeHtml(m.displayName)}</strong><span>${escapeHtml(m.reasonText)}</span></div><b>${m.matchScore}%</b></div><p><strong>Begrep:</strong> ${escapeHtml(m.sharedConcepts.slice(0, 4).join(", ") || "Felles domenespor")}</p><p><strong>Badges:</strong> ${escapeHtml(m.sharedBadges.slice(0, 4).join(", ") || "—")}</p><button type="button" data-view-profile="${escapeHtml(m.targetUserId)}">View Profile</button></article>`).join("") : `<p class="knowledge-match-empty">Ingen offentlige kunnskapsmatcher ennå.</p>`) : `<p class="knowledge-match-empty">Slå på offentlig profil for å finne People Like You.</p>`}`; document.getElementById("knowledgePublicToggle")?.addEventListener("change", (e) => togglePublicProfile(Boolean(e.target.checked))); root.querySelectorAll("[data-view-profile]").forEach((b) => b.addEventListener("click", () => openMatchProfile(b.getAttribute("data-view-profile")))); }
  function openMeetInviteModal(targetUserId, spotId = "") { const profile = getProfileByUserId(targetUserId); if (!profile) return null; const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((p) => String(p?.id || "") === String(spotId || "")); const preset = PRESETS[0]; const invite = sendMeetInvite(targetUserId, spotId, { messagePreset: preset, spotTitle: place?.name || place?.title || "" }); window.showToast?.("Møteforslag sendt"); return invite; }
  function openSpotMatchList(placeId) { const matches = getKnowledgeMatches(getCurrentUserId()); const place = (Array.isArray(window.PLACES) ? window.PLACES : []).find((p) => String(p?.id || "") === String(placeId || "")); document.getElementById("spotMatchPopup")?.remove(); const popup = document.createElement("div"); popup.id = "spotMatchPopup"; popup.className = "hg-popup match-profile-popup"; popup.innerHTML = `<div class="hg-popup-inner"><div class="hg-modal match-profile-modal"><header class="hg-modal-header"><div><p class="hg-modal-meta">Møteforslag for valgt sted</p><h2 class="hg-modal-title">Møt folk${place ? ` · ${escapeHtml(place.name || place.title)}` : ""}</h2><p class="match-profile-bio">Dette viser kun kunnskapsmatcher. Det betyr ikke at noen har besøkt eller er nær stedet.</p></div></header><div class="hg-modal-body">${matches.length ? matches.map((m) => `<article class="knowledge-match-card"><div><strong>${escapeHtml(m.displayName)}</strong><b>${m.matchScore}%</b></div><p>${escapeHtml(m.reasonText)}</p><button data-spot-invite="${escapeHtml(m.targetUserId)}">Foreslå dette stedet</button></article>`).join("") : `<p class="knowledge-match-empty">Ingen matcher tilgjengelig.</p>`}<div class="match-profile-actions"><button data-spot-close>Lukk</button></div></div></div></div>`; popup.addEventListener("click", (e) => { if (e.target === popup || e.target?.closest?.("[data-spot-close]")) popup.remove(); const id = e.target?.closest?.("[data-spot-invite]")?.getAttribute("data-spot-invite"); if (id) { sendMeetInvite(id, placeId, { messagePreset: PRESETS[0], spotTitle: place?.name || place?.title || "" }); popup.remove(); window.showToast?.("Møteforslag sendt"); } }); document.body.appendChild(popup); return popup; }

  window.HG_PUBLIC_PROFILES = HG_PUBLIC_PROFILES; window.HG_SOCIAL_LOG = HG_SOCIAL_LOG; window.HG_PUBLIC_PROFILE = getCurrentPublicProfile();
  Object.assign(window, { getCurrentPublicProfile, savePublicProfile, togglePublicProfile, buildKnowledgeFingerprint, getKnowledgeMatches, calculateMatchScore, renderKnowledgeMatches, openMatchProfile, renderMatchProfile, sendMeetInvite, cancelMeetInvite, acceptMeetInvite, declineMeetInvite, renderMeetInviteInbox, getIncomingMeetInvites, getOutgoingMeetInvites, renderConfirmedMeets, getConfirmedMeetInvites, cancelConfirmedMeet, openSpotMatchList });
  window.HGKnowledgeMatch = { HG_PUBLIC_PROFILES, HG_SOCIAL_LOG, presets: PRESETS, getCurrentPublicProfile, savePublicProfile, togglePublicProfile, buildKnowledgeFingerprint, getKnowledgeMatches, calculateMatchScore, renderKnowledgeMatches, openMatchProfile, renderMatchProfile, sendMeetInvite, cancelMeetInvite, acceptMeetInvite, declineMeetInvite, renderMeetInviteInbox, getIncomingMeetInvites, getOutgoingMeetInvites, renderConfirmedMeets, getConfirmedMeetInvites, cancelConfirmedMeet, openSpotMatchList };
  document.addEventListener("DOMContentLoaded", () => { renderKnowledgeMatches(); renderMeetInviteInbox(); renderConfirmedMeets(); renderSocialHistory(); });
})();
