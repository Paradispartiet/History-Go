// @ts-nocheck
// js/ui/onboarding-welcome.js
// HGOnboarding — vises én gang per oppdatert introduksjon.
// Forklarer sted → besøk → quiz → merke → kort og Civication-broen.
//
// Persisterer dismiss via hg_onboarding_shown_v1.
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
      <div class="hg-onb-inner" role="dialog" aria-modal="true" aria-labelledby="hgOnboardingTitle">
        <button class="hg-onb-close" type="button" aria-label="Lukk">✕</button>
        <header class="hg-onb-head">
          <div class="hg-onb-kicker">Velkommen til</div>
          <h2 class="hg-onb-title" id="hgOnboardingTitle">History Go</h2>
          <p class="hg-onb-sub">
            Oppdag historien der den skjedde. Finn steder på kartet, besøk dem og bygg din egen samling gjennom kunnskap.
          </p>
          <p class="hg-onb-flow">Sted → Besøk → Quiz → Merke → Kort</p>
        </header>
        <ol class="hg-onb-steps">
          <li><span class="hg-onb-step-icon">📍</span><div><strong>1. Finn et sted</strong><p>Utforsk kartet og åpne et sted for bilder, historie og personer knyttet til det.</p></div></li>
          <li><span class="hg-onb-step-icon">🚶</span><div><strong>2. Besøk stedet</strong><p>Gå dit i virkeligheten. Stedskort krever at du er i nærheten av stedet.</p></div></li>
          <li><span class="hg-onb-step-icon">🧩</span><div><strong>3. Ta quizen</strong><p>Test det du har lært. En perfekt quiz låser opp kort når besøkskravet er oppfylt.</p></div></li>
          <li><span class="hg-onb-step-icon">🏅</span><div><strong>4. Samle merker og kort</strong><p>Riktige svar utvikler merkene dine. Fullfør quizer for å bygge samlingen av steder og personer.</p></div></li>
        </ol>
        <section class="hg-onb-civication" aria-label="Civication og History Go">
          <strong>Civication + History Go</strong>
          <p>Oppdrag fra Civication kan følge deg inn i History Go. Utforsk, besøk og løs oppgaver her – resultatene kan brukes når du går tilbake til livet ditt i Civication.</p>
        </section>
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