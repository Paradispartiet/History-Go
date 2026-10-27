// @ts-nocheck
// js/ui/onboarding-welcome.js
// HGOnboarding — vises én gang per nettleser ved første besøk.
// Forklarer hovedflyten: kart → besøk → historier → quiz/merker → samling → Civication.
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
      <div class="hg-onb-inner" role="dialog" aria-modal="true" aria-labelledby="hgOnboardingTitle" aria-describedby="hgOnboardingIntro">
        <button class="hg-onb-close" type="button" aria-label="Lukk velkomsten">✕</button>
        <header class="hg-onb-head">
          <p class="hg-onb-kicker">UTFORSK • OPPDAG • LÆR</p>
          <h2 class="hg-onb-title" id="hgOnboardingTitle">Velkommen til <span>History Go</span></h2>
          <p class="hg-onb-sub" id="hgOnboardingIntro">
            Oppdag historiene rundt deg. Besøk steder, utforsk kunnskap, møt mennesker fra historien og følg med på det du samler.
          </p>
        </header>
        <ul class="hg-onb-steps">
          <li><span class="hg-onb-step-icon" aria-hidden="true">🗺️</span><div><strong>Utforsk kartet</strong><p>Oppdag historiske bygninger, parker, plasser og andre interessante steder. Se hva som har skjedd der, og hvem som har satt spor.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">📍</span><div><strong>Besøk steder</strong><p>Oppsøk steder i virkeligheten og registrer besøkene dine. Utforsk byen og oppdag stadig nye steder.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">📖</span><div><strong>Oppdag historiene</strong><p>Les om hendelser, historiske personer og samfunnene som har formet verden rundt oss.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🎯</span><div><strong>Ta quiz og samle merker</strong><p>Test kunnskapen din gjennom quizer om steder, personer og ulike fagområder. Oppnå merker og bygg videre på kunnskapen din.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🏆</span><div><strong>Se hva du har samlet</strong><p>Se lister over steder du har besøkt, kunnskap du har tilegnet deg, historiske personer og merker du har samlet. Følg fremgangen din i de ulike kategoriene.</p></div></li>
          <li class="hg-onb-civication"><span class="hg-onb-step-icon" aria-hidden="true">🏛️</span><div><strong>Opplev Civication</strong><p>Civication er et interaktivt læringsmiljø der du kan utforske interessene dine, ta quizer og kvalifisere deg til spennende roller og jobber. I en simulert livsverden får du prøve ut ulike muligheter, utvikle ferdighetene dine og forme din egen vei. Oppdrag kan ta deg videre til History Go.</p></div></li>
        </ul>
        <footer class="hg-onb-actions">
          <button type="button" class="hg-onb-primary" data-action="start">Start History Go <span aria-hidden="true">→</span></button>
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