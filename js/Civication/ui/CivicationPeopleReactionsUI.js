(function () {
  "use strict";

  function buildReactionsHtml() {
    const reactions = window.CivicationNpcReactions?.getLatest?.(4) || [];
    if (!reactions.length) return "";

    return `
      <div style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.05);">
        <div style="font-weight:700;margin-bottom:8px;">Reaksjoner</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${reactions.map((r) => `
            <div style="padding:10px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.03);">
              <div style="font-weight:600;">${r.personName}</div>
              <div style="font-size:0.92rem;opacity:0.9;margin-top:4px;">${r.title}</div>
              <div style="font-size:0.88rem;opacity:0.8;margin-top:4px;">${r.line}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function patchPeopleUI() {
    const original = window.CivicationPeopleUI?.render;
    if (!original || original.__npcWrapped) return;

    const wrapped = function () {
      original();

      const host = document.getElementById("civiPeoplePanel");
      if (!host) return;

      const html = buildReactionsHtml();
      if (html) {
        host.insertAdjacentHTML("afterbegin", html);
      }
    };

    wrapped.__npcWrapped = true;
    window.CivicationPeopleUI.render = wrapped;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchPeopleUI, { once: true });
  } else {
    patchPeopleUI();
  }
})();
