(function () {
  "use strict";

  function renderOnboardingPanel() {
    const host = document.getElementById("civiOnboardingPanel");
    if (!host) return;

    const onboarding = window.HGOnboarding;
    if (!onboarding?.getState || !onboarding?.getCurrentStepMeta) {
      host.innerHTML = `<div class="muted">Onboarding-data er ikke tilgjengelig ennå.</div>`;
      return;
    }

    const state = onboarding.getState();
    const meta = onboarding.getCurrentStepMeta();

    if (!state?.current_step || !meta) {
      host.innerHTML = `<div class="muted">Ingen aktiv onboarding-retning akkurat nå.</div>`;
      return;
    }

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">Neste naturlige steg</div>
        <div class="lk-category">Steg: ${meta.title || "Videre progresjon"}</div>
        <div class="lk-text">${meta.nextText || "Fortsett å utforske byen og la Civication reagere på det du åpner."}</div>
        <div class="lk-category" style="margin-top:10px;">Hvorfor dette betyr noe</div>
        <div class="lk-text">${meta.unlockText || "Dette steget bygger bro mellom History Go og Civication."}</div>
      </div>
    `;
  }

  window.CivicationOnboardingUI = {
    render: renderOnboardingPanel
  };

  document.addEventListener("DOMContentLoaded", renderOnboardingPanel);
  window.addEventListener("updateProfile", renderOnboardingPanel);
})();
