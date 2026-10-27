// @ts-nocheck
// js/ui/onboarding-welcome.js
// HGOnboarding — vises én gang per nettleser ved første besøk.
// Forklarer hovedflyten kort: kart → sted → quiz → samle.
//
// Persisterer dismiss via hg_onboarding_shown_v2.
// Kan også åpnes manuelt via window.openOnboarding().

(function () {
  "use strict";

  const FLAG_KEY = "hg_onboarding_shown_v2";
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
            History Go gjør virkelige steder til et historisk spillkart. Besøk steder, oppdag menneskene og historiene deres, og bruk kunnskapen videre i Civication.
          </p>
        </header>
        <ol class="hg-onb-steps">
          <li><span class="hg-onb-step-icon" aria-hidden="true">📍</span><div><strong>Finn og besøk et sted</strong><p>Utforsk kartet og gå til et sted i virkeligheten. Stedskort samles ved fysisk besøk. I testmodus kan du prøve quizene hvor som helst, men stedskort krever fortsatt besøk.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">📖</span><div><strong>Oppdag historien</strong><p>Åpne stedet og les om det som skjedde der, menneskene, bildene og forbindelsene. Personquiz blir tilgjengelig etter at du har besøkt stedet.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🎯</span><div><strong>Ta quiz og samle</strong><p>Svar riktig på alle spørsmålene for å mestre quizen og låse opp quizkortet. Bygg videre på samlingen av kort, merker og kunnskap.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🏛️</span><div><strong>Spill videre i Civication</strong><p>Her spiller du et liv med arbeid, mennesker og valg som får konsekvenser. Noen oppdrag sender deg til History Go for å utforske eller lære, før du vender tilbake.</p></div></li>
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