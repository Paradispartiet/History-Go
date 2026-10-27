// @ts-nocheck
// js/ui/onboarding-welcome.js
// HGOnboarding — vises én gang per nettleser ved første besøk.
// Forklarer hovedflyten: kart → besøk → quiz → merke/kort → Civication.
//
// Persisterer dismiss via hg_onboarding_shown_v1.
// Kan også åpnes manuelt via window.openOnboarding().

(function () {
  "use strict";

  const FLAG_KEY = "hg_onboarding_shown_v1";
  const MODAL_ID = "hgOnboardingModal";
  const MODAL_Z_INDEX = "2147483646";

  function bindDismissControl(control) {
    if (!control) return;

    const dismiss = (event) => {
      try { event?.preventDefault?.(); } catch {}
      try { event?.stopPropagation?.(); } catch {}
      close();
    };

    control.addEventListener("click", dismiss);
    control.addEventListener("pointerup", dismiss);
    control.addEventListener("touchend", dismiss, { passive: false });
  }

  function build() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "hg-onboarding-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    modal.style.zIndex = MODAL_Z_INDEX;
    modal.style.pointerEvents = "auto";
    modal.style.touchAction = "manipulation";

    modal.innerHTML = `
      <div class="hg-onb-inner" role="dialog" aria-modal="true">
        <button class="hg-onb-close" type="button" aria-label="Lukk">✕</button>
        <header class="hg-onb-head">
          <div class="hg-onb-kicker">Velkommen til</div>
          <h2 class="hg-onb-title">History GO</h2>
          <p class="hg-onb-sub">
            Utforsk ekte steder og historier. Besøk, lær og løs quizer for å bygge samlingen din – eller ta med et oppdrag fra Civication.
          </p>
        </header>
        <ol class="hg-onb-steps">
          <li><span class="hg-onb-step-icon">🗺️</span><div><strong>Finn et sted på kartet</strong><p>Utforsk parker, bygninger, plasser og historiske spor. Åpne stedets historie, bilder og forbindelser.</p></div></li>
          <li><span class="hg-onb-step-icon">📍</span><div><strong>Besøk stedet og samle stedskortet</strong><p>Stedskortet krever at du faktisk er ved stedet. Du kan lese om stedene før du drar dit.</p></div></li>
          <li><span class="hg-onb-step-icon">🎯</span><div><strong>Les og ta quiz</strong><p>Bruk kunnskapen fra stedet. En perfekt quiz låser opp quizkortet; besøk åpner også for personquizer knyttet til stedet.</p></div></li>
          <li><span class="hg-onb-step-icon">🏅</span><div><strong>Samle merker og bygg profilen</strong><p>Quizer gir fremgang i fagkategoriene. Samle kort, merker og oppdagelser på tvers av byen.</p></div></li>
          <li><span class="hg-onb-step-icon">🏛️</span><div><strong>Fortsett historien i Civication</strong><p>Valg, jobber og hverdagsliv kan gi deg oppdrag i History Go. Oppdraget følger deg på skjermen, og du kan gå tilbake til Civication.</p></div></li>
          <li><span class="hg-onb-step-icon">🧪</span><div><strong>Prøv quizer i testmodus</strong><p>I testmodus kan du ta quizer hvor som helst. Stedskort krever fortsatt et fysisk besøk.</p></div></li>
        </ol>
        <footer class="hg-onb-actions">
          <button type="button" class="hg-onb-primary" data-action="start">Start History Go</button>
        </footer>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    bindDismissControl(modal.querySelector(".hg-onb-close"));
    bindDismissControl(modal.querySelector('[data-action="start"]'));
    return modal;
  }

  function close() {
    const m = document.getElementById(MODAL_ID);
    if (!m) return;
    m.style.display = "none";
    m.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKey);
    try { localStorage.setItem(FLAG_KEY, "1"); } catch {}
    window.dispatchEvent(new Event("hg:onboardingClosed"));
  }

  function onKey(e) { if (e.key === "Escape") close(); }

  function open() {
    const m = build();
    m.style.display = "flex";
    m.style.pointerEvents = "auto";
    m.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onKey);
    window.dispatchEvent(new Event("hg:onboardingOpened"));
  }

  function whenFullyInteractive(fn) {
    let appReady = window.__HG_APP_READY__ === true || document.body?.classList.contains("hg-loaded");
    let routerReady = window.__HG_ROUTER_STARTED__ === true;
    let fired = false;

    const maybeRun = () => {
      if (fired || !appReady || !routerReady) return;
      fired = true;
      window.removeEventListener("hg:appReady", onAppReady);
      window.removeEventListener("hg:routerReady", onRouterReady);
      fn();
    };

    const onAppReady = () => {
      appReady = true;
      maybeRun();
    };

    const onRouterReady = () => {
      routerReady = true;
      maybeRun();
    };

    if (!appReady) window.addEventListener("hg:appReady", onAppReady);
    if (!routerReady) window.addEventListener("hg:routerReady", onRouterReady);
    maybeRun();
  }

  function maybeShowOnFirstVisit() {
    try {
      if (localStorage.getItem(FLAG_KEY) === "1") return;
      // A Civication deep link carries a live mission. Show that mission first;
      // leave onboarding available for the next ordinary History Go visit.
      const mission = JSON.parse(localStorage.getItem("hg_civication_mode_v1") || "null");
      if (mission && mission.active === true) return;
    } catch { return; }

    whenFullyInteractive(() => {
      setTimeout(open, 250);
    });
  }

  window.openOnboarding = open;
  window.HGOnboarding = { open, close, maybeShowOnFirstVisit, FLAG_KEY };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", maybeShowOnFirstVisit);
  } else {
    maybeShowOnFirstVisit();
  }
})();