(function () {
  "use strict";

  function renderPeoplePanel() {
    const host = document.getElementById("civiPeoplePanel");
    if (!host) return;

    const active = window.CivicationState?.getActivePosition?.() || null;
    if (!active) {
      host.innerHTML = `<div class="muted">Du trenger en aktiv rolle før Civication kan vise hvilke mennesker du faktisk krysser med.</div>`;
      return;
    }

    const people = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    if (!Array.isArray(people) || !people.length) {
      host.innerHTML = `<div class="muted">Ingen tydelige personbaner tilgjengelige ennå. Lås opp flere steder i History Go for å utvide miljøene dine.</div>`;
      return;
    }

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">Tilgjengelige mennesker og miljøfigurer</div>
        <div class="lk-text">Disse figurene finnes i livsverdenen din nå fordi rollen din og stedene du har åpnet i History Go peker mot dem.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
        ${people.map(function (person) {
          const style = String(person?.social_style || "generic");
          const type = String(person?.type || "person");
          const name = String(person?.name || "Person");
          const desc = String(person?.description || "");
          const score = Number(person?.score || 0);
          return `
            <div style="padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
              <div style="font-weight:700;">${name}</div>
              <div style="font-size:0.92rem;opacity:0.85;margin-top:4px;">Type: ${type} · Stil: ${style} · Nærhet: ${score}</div>
              <div style="margin-top:8px;line-height:1.45;">${desc}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  window.CivicationPeopleUI = {
    render: renderPeoplePanel
  };

  document.addEventListener("DOMContentLoaded", renderPeoplePanel);
  window.addEventListener("updateProfile", renderPeoplePanel);
})();
