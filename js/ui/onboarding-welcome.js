// js/ui/onboarding-welcome.js
// HGOnboarding — vises én gang per nettleser ved første besøk.
// Forklarer hovedflyten kort: kart → sted → quiz → samle.
//
// Persisterer dismiss via hg_onboarding_shown_v1.
// Kan også åpnes manuelt via window.openOnboarding().

(function () {
  "use strict";

  const FLAG_KEY = "hg_onboarding_shown_v1";
  const MODAL_ID = "hgOnboardingModal";

  function build() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "hg-onboarding-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";

    modal.innerHTML = `
      <div class="hg-onb-inner" role="dialog" aria-modal="true">
        <button class="hg-onb-close" type="button" aria-label="Lukk">✕</button>

        <header class="hg-onb-head">
          <div class="hg-onb-kicker">Velkommen til</div>
          <h2 class="hg-onb-title">History GO</h2>
          <p class="hg-onb-sub">Byen er ditt spillbrett. Sted, kunnskap og samling — i bevegelse.</p>
        </header>

        <ol class="hg-onb-steps">
          <li>
            <span class="hg-onb-step-icon">📍</span>
            <div>
              <strong>Sjekk inn på et sted</strong>
              <p>Bruk kartet eller Steder-fanen. Det dukker opp ting i nærheten av deg.</p>
            </div>
          </li>
          <li>
            <span class="hg-onb-step-icon">🎯</span>
            <div>
              <strong>Ta quizen</strong>
              <p>3–5 spørsmål. Riktig svar låser opp innhold: arter, personer, historier.</p>
            </div>
          </li>
          <li>
            <span class="hg-onb-step-icon">🌿</span>
            <div>
              <strong>Samle naturen</strong>
              <p>Natur-fanen fyller seg med flora og fauna du har låst opp i nærheten.</p>
            </div>
          </li>
          <li>
            <span class="hg-onb-step-icon">🏅</span>
            <div>
              <strong>Bli ekspert</strong>
              <p>Fullførte quizer gir merke-poeng. Nok poeng → nytt nivå (Amatør → Student → Doktor → Professor).</p>
            </div>
          </li>
        </ol>

        <footer class="hg-onb-actions">
          <button type="button" class="hg-onb-primary" data-action="start">Begynn å utforske</button>
        </footer>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    modal.querySelector(".hg-onb-close").addEventListener("click", close);
    modal.querySelector('[data-action="start"]').addEventListener("click", close);

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
    m.style.display = "";
    m.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onKey);
  }

  function maybeShowOnFirstVisit() {
    try {
      if (localStorage.getItem(FLAG_KEY) === "1") return;
    } catch { return; }
    // Vent litt så kartet får lastes først, og overlay-en ikke blokkerer
    // første visuelle inntrykket helt.
    setTimeout(open, 1200);
  }

  window.openOnboarding = open;
  window.HGOnboarding = { open, close, maybeShowOnFirstVisit, FLAG_KEY };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", maybeShowOnFirstVisit);
  } else {
    maybeShowOnFirstVisit();
  }
})();
