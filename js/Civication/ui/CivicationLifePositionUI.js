(function initCivicationLifePositionUI(globalScope) {
  "use strict";

  const window = /** @type {any} */ (globalScope);
  let initialized = false;
  let renderQueued = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function encodeChoice(position) {
    return encodeURIComponent(String(position?.badge_id || "")) + "|" +
      encodeURIComponent(String(position?.label || ""));
  }

  function decodeChoice(value) {
    const raw = String(value || "");
    const splitAt = raw.indexOf("|");
    if (splitAt < 0) return null;
    try {
      return {
        badge_id: decodeURIComponent(raw.slice(0, splitAt)),
        label: decodeURIComponent(raw.slice(splitAt + 1))
      };
    } catch {
      return null;
    }
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    const run = () => {
      renderQueued = false;
      render();
    };
    if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(run);
    else window.setTimeout(run, 0);
  }

  function render() {
    const host = document.getElementById("activeJobCard");
    const api = window.CivicationLifePositions;
    if (!host || !api?.getLifeContext) return;

    host.querySelector("[data-civi-life-position]")?.remove();

    const context = api.getLifeContext();
    const unlocked = Array.isArray(context?.unlocked_life_positions)
      ? context.unlocked_life_positions
      : [];
    const primary = context?.primary_life_position || null;
    const employment = context?.employment || { status: "unemployed", active_job: null };

    if (!unlocked.length && !primary) return;

    const block = document.createElement("div");
    block.setAttribute("data-civi-life-position", "1");
    block.style.cssText = "margin-top:12px;padding-top:12px;border-top:1px solid rgba(0,0,0,.15)";

    const employmentText = employment.status === "employed"
      ? `I jobb: ${employment.active_job?.title || employment.active_job?.career_name || employment.active_job?.career_id || "aktiv jobb"}`
      : "Arbeidsledig / ingen fast jobb";
    const primaryText = primary
      ? `${primary.label} · ${primary.badge_name || primary.badge_id}`
      : "Ingen valgt";
    const primaryDescription = primary?.description ? String(primary.description) : "";
    const primaryHooks = Array.isArray(primary?.hooks) ? primary.hooks.map(String).filter(Boolean) : [];

    const options = unlocked.map((position) => {
      const selected = primary && primary.badge_id === position.badge_id && primary.label === position.label;
      return `<option value="${escapeHtml(encodeChoice(position))}"${selected ? " selected" : ""}>${escapeHtml(position.badge_name || position.badge_id)} · ${escapeHtml(position.label)}</option>`;
    }).join("");

    block.innerHTML = `
      <div><strong>🧭 Livsposisjon</strong></div>
      <div style="margin-top:4px;opacity:.78">Arbeidsstatus: ${escapeHtml(employmentText)}</div>
      <div style="margin-top:2px">Liv: <strong>${escapeHtml(primaryText)}</strong></div>
      ${primaryDescription ? `<div style="margin-top:5px;font-size:.9em">${escapeHtml(primaryDescription)}</div>` : ""}
      ${primaryHooks.length ? `<div style="margin-top:4px;font-size:.82em;opacity:.68">Kan prege livet ditt: ${escapeHtml(primaryHooks.join(" · "))}</div>` : ""}
      ${unlocked.length ? `
        <label style="display:block;margin-top:8px;font-size:.9em" for="civiLifePositionSelect">Velg blant opplåste livsposisjoner</label>
        <select id="civiLifePositionSelect" style="width:100%;margin-top:4px">
          ${primary ? "" : '<option value="">Velg livsposisjon…</option>'}
          ${options}
        </select>
      ` : ""}
      <div style="margin-top:6px;font-size:.84em;opacity:.7">Livsposisjon er selvvalgt og uavhengig av jobb. Den gir ikke lønn, autorisasjon, verv eller ansettelse i seg selv.</div>
    `;

    host.appendChild(block);

    block.querySelector("#civiLifePositionSelect")?.addEventListener("change", (event) => {
      const select = /** @type {HTMLSelectElement|null} */ (event.currentTarget);
      const parsed = decodeChoice(select?.value);
      if (!parsed?.badge_id || !parsed?.label) return;
      const result = api.activate(parsed.badge_id, parsed.label);
      if (!result?.ok) return;
      queueRender();
    });
  }

  function init() {
    if (initialized) {
      queueRender();
      return;
    }
    initialized = true;
    window.addEventListener("updateProfile", queueRender);
    window.addEventListener("civi:lifePositionChanged", queueRender);
    window.addEventListener("civi:lifePositionCatalogLoaded", queueRender);
    window.addEventListener("civi:dataReady", queueRender);
    queueRender();
  }

  window.CivicationLifePositionUI = { init, render };
})(typeof window !== "undefined" ? window : globalThis);
