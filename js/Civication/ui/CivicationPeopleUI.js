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
          const escapeHtml = function (value) {
            return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          };
          const style = escapeHtml(person?.social_style || "generic");
          const type = escapeHtml(person?.type || "person");
          // Pre-migration local saves could still contain a historical person's
          // name and bio over a fictional archetype. Never render that as an NPC.
          const legacyHistoryPerson = person?.hg_person || null;
          const name = escapeHtml(legacyHistoryPerson
            ? (person?.archetype_name || "Fiktiv miljøfigur")
            : (person?.name || "Person"));
          const desc = escapeHtml(legacyHistoryPerson ? "" : (person?.description || ""));
          const score = Number(person?.score || 0);
          const source = person?.history_go_learning_reference || legacyHistoryPerson;
          // A historical person is a factual learning reference, never this NPC.
          const safePersonName = escapeHtml(source?.name);
          const collectedLine = source
            ? `<div style="font-size:0.85rem;margin-top:4px;color:#ffd479;">Historisk fagreferanse fra History Go: ${safePersonName}</div>`
            : "";
          const thumb = "";
          return `
            <div style="padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
              <div style="display:flex;align-items:center;gap:10px;">
                ${thumb}
                <div>
                  <div style="font-weight:700;">${name}</div>
                  ${collectedLine}
                </div>
              </div>
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
