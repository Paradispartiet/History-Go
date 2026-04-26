// js/Civication/ui/CivicationEmptyPanels.js
// Markerer Civication-seksjoner som .is-empty når deres primære
// innhold-container kun inneholder placeholder-tegn (—, –, …) eller
// faktisk er tom. CSS i civi-refresh.css skjuler .is-empty-seksjoner.
//
// Kjører ved load + når DOM endrer seg via MutationObserver, så
// seksjoner dukker opp/forsvinner automatisk når innhold trekkes inn.

(function () {
  "use strict";

  // section-id → primær innhold-container-id
  const PANEL_MAP = {
    civiPeopleSection: "civiPeoplePanel",
    civiStoreSection: "civiStorePanel",
    civiDebateSection: "civiDebatePanel",
    civiPublicFeedSection: "civiPublicFeed",
    civiHomeStatus: "homeStatusContent",
    civiOnboardingSection: "civiOnboardingPanel",
    civiInboxSection: "civiInbox",
  };

  const PLACEHOLDER_RE = /^[—–\-…\s]+$/;

  function isContentEmpty(el) {
    if (!el) return true;
    if (!el.children.length && PLACEHOLDER_RE.test(el.textContent || "")) return true;
    if (!el.children.length && !(el.textContent || "").trim()) return true;
    return false;
  }

  function refresh() {
    for (const [sectionId, contentId] of Object.entries(PANEL_MAP)) {
      const section = document.getElementById(sectionId);
      const content = document.getElementById(contentId);
      if (!section) continue;
      if (isContentEmpty(content)) section.classList.add("is-empty");
      else section.classList.remove("is-empty");
    }

    // Track HUD: skjul hvis name-feltet er tomt eller bare "–"
    const hud = document.getElementById("civiTrackHUD");
    const name = document.getElementById("civiTrackName");
    if (hud && name) {
      const txt = (name.textContent || "").trim();
      if (!txt || PLACEHOLDER_RE.test(txt)) hud.classList.add("is-empty");
      else hud.classList.remove("is-empty");
    }
  }

  function start() {
    refresh();

    // Observer kun de relevante panel-containerne; billig.
    const observer = new MutationObserver(() => {
      // debounce
      if (start._t) cancelAnimationFrame(start._t);
      start._t = requestAnimationFrame(refresh);
    });

    for (const contentId of Object.values(PANEL_MAP)) {
      const el = document.getElementById(contentId);
      if (el) observer.observe(el, { childList: true, characterData: true, subtree: true });
    }
    const trackName = document.getElementById("civiTrackName");
    if (trackName) observer.observe(trackName, { childList: true, characterData: true, subtree: true });

    // Re-kjør når app utløser updateProfile / inbox
    window.addEventListener("updateProfile", refresh, { passive: true });
    window.addEventListener("civi:inboxChanged", refresh, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.CivicationEmptyPanels = { refresh };
})();
