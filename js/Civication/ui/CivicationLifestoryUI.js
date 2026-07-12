// js/Civication/ui/CivicationLifestoryUI.js
//
// Civication Life Story System — «Min dag»-visningen.
// Hovedskjermen i det nye fortellingssystemet: NÅ-scenen med valg, aktive
// tråder, kalender/senere i dag og arkiv. Innboks er ikke spillet; innboks
// er arkiv — spillet er scenen du står i nå.
//
// Kun visning og interaksjon: all sannhet bor i Player State
// (CivicationLifestoryState) og all fremdrift går gjennom Day Runner
// (CivicationLifestoryRunner). Rendrer i #civiLifestoryPanel og gjør
// ingenting hvis panelet ikke finnes på siden.

(function () {
  "use strict";

  const DEFAULT_ROLE_ID = "arealplanlegger"; // pilotrollen
  const ROLE_STORAGE_KEY = "civication_lifestory_role_v1";

  /**
   * Hvilken rolle Min dag skal spille. Velges eksplisitt via URL
   * (?lifestoryRole=renholder) eller localStorage; URL vinner og persisteres.
   * Ukjent rolle-id feiler fast i Content.loadContent (manifest-oppslag) og
   * vises som lastefeil — ingen stille fallback til en annen rolle.
   * @returns {string}
   */
  function resolveRoleId() {
    try {
      const fromUrl = new URLSearchParams(window.location.search || "").get("lifestoryRole");
      if (fromUrl && fromUrl.trim()) {
        const roleId = fromUrl.trim();
        try { window.localStorage?.setItem(ROLE_STORAGE_KEY, roleId); } catch { /* uten lagring gjelder valget bare denne lasten */ }
        return roleId;
      }
      const stored = window.localStorage?.getItem(ROLE_STORAGE_KEY);
      if (stored && stored.trim()) return stored.trim();
    } catch { /* blokkert lagring/URL => standardrollen */ }
    return DEFAULT_ROLE_ID;
  }

  const ROLE_ID = resolveRoleId();

  /** @type {any} */ let content = null;
  /** @type {any} */ let state = null;
  /** @type {Promise<void>|null} */ let loading = null;
  /** Siste konsekvenstekst (fortellingsmessig feedback etter et valg). */
  /** @type {{ tekst: string, valgTekst: string, deltas: Array<{ key: string, label: string, delta: number }> }|null} */ let sisteKonsekvens = null;

  /**
   * @param {unknown} value
   * @returns {string}
   */
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function humanizeId(id) {
    return String(id || "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
  }

  function formatThreadStatus(status) {
    return ({ active: "Aktiv", escalated: "Eskalert", dormant: "Hvilende", completed: "Fullført" })[status] || humanizeId(status);
  }

  function formatThreadTitle(thread) {
    if (!thread) return "Ukjent tråd";
    return thread.tittel || humanizeId(thread.id);
  }

  function formatMeterName(key) {
    const person = (content?.role?.personer || []).find((p) => p.id === key);
    if (person) return person.navn;
    return ({ psyke: "Psyke", energi: "Energi", penger: "Penger", integritet: "Integritet", synlighet: "Synlighet", handlingsrom: "Handlingsrom" })[key] || humanizeId(key);
  }

  function formatMeterDelta(delta) {
    const value = Number(delta.delta);
    return formatMeterName(delta.key) + " " + (value > 0 ? "+" : "") + value;
  }

  function snapshotMetersAndRelations() {
    return { meters: Object.assign({}, state.meters), relasjoner: Object.assign({}, state.relasjoner) };
  }

  function diffMetersAndRelations(before) {
    const deltas = [];
    for (const group of ["meters", "relasjoner"]) {
      for (const [key, oldValue] of Object.entries(before[group] || {})) {
        const nextValue = group === "meters" ? state.meters[key] : state.relasjoner[key];
        const delta = Number(nextValue) - Number(oldValue);
        if (delta !== 0) deltas.push({ key, label: formatMeterName(key), delta });
      }
    }
    return deltas;
  }

  function getPanel() {
    return document.getElementById("civiLifestoryPanel");
  }

  async function ensureLoaded() {
    if (content && state) return;
    if (!loading) {
      loading = (async () => {
        const Content = /** @type {any} */ (window).CivicationLifestoryContent;
        const State = /** @type {any} */ (window).CivicationLifestoryState;
        content = await Content.loadContent(ROLE_ID);
        state = State.load();
        if (!state || state.rolle !== ROLE_ID) {
          state = State.createInitialState(content);
          State.save(state);
        }
      })();
    }
    return loading;
  }

  /**
   * @param {string} sceneId
   * @param {string} choiceId
   */
  function onChoose(sceneId, choiceId) {
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    try {
      const scene = content.scenes.find((s) => s.id === sceneId);
      const valg = scene ? (scene.valg || []).find((c) => c.id === choiceId) : null;
      const before = snapshotMetersAndRelations();
      const result = Runner.applyChoice(state, content, sceneId, choiceId);
      const deltas = diffMetersAndRelations(before);
      sisteKonsekvens = result.konsekvensTekst || deltas.length
        ? { tekst: result.konsekvensTekst || "Valget er registrert.", valgTekst: valg ? valg.tekst : "", deltas }
        : null;
      State.save(state);
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
    } catch (error) {
      console.error("[CivicationLifestoryUI] valg feilet", error);
    }
    render();
  }

  function onNextDay() {
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    try {
      Runner.startNextDay(state, content);
      sisteKonsekvens = null;
      State.save(state);
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
    } catch (error) {
      console.error("[CivicationLifestoryUI] neste dag feilet", error);
    }
    render();
  }

  function onRestart() {
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    state = State.createInitialState(content);
    sisteKonsekvens = null;
    State.save(state);
    window.dispatchEvent(new Event("civi:lifestoryChanged"));
    render();
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderStatusHtml(view) {
    const m = state.meters;
    const items = [
      ["Rolle", content.role.navn], ["Dag", state.dag], ["Fase", view.dagFerdig ? "Dagen er over" : (view.fase ? view.fase.navn : state.fase)],
      ["Psyke", m.psyke], ["Energi", m.energi], ["Penger", m.penger + " PC"]
    ];
    return "<div class=\"civi-lifestory-status\" aria-label=\"Statuslinje\">" + items.map(([label, value]) =>
      "<span class=\"civi-lifestory-status-chip\"><small>" + escapeHtml(label) + "</small><strong>" + escapeHtml(value) + "</strong></span>"
    ).join("") + "</div>";
  }

  /**
   * @param {any} scene
   * @returns {string}
   */
  function renderSceneHtml(scene) {
    const thread = content.threads.find((t) => t.id === scene.threadId);
    const ts = state.threadState[scene.threadId];
    const valgHtml = (scene.valg || []).map((valg) =>
      "<button class=\"civi-lifestory-choice\" type=\"button\" data-lifestory-scene=\"" + escapeHtml(scene.id) + "\""
      + " data-lifestory-choice=\"" + escapeHtml(valg.id) + "\">"
      + "<span>" + escapeHtml(valg.tekst) + "</span>"
      + (valg.tone ? "<small>" + escapeHtml(valg.tone) + "</small>" : "")
      + "</button>"
    ).join("");
    return ""
      + "<article class=\"civi-lifestory-scene\" aria-label=\"Nå-scene\">"
      + "<div class=\"civi-lifestory-kicker\"><span>NÅ</span><span>" + escapeHtml(viewPhaseName(scene.fase)) + "</span><span>" + escapeHtml(scene.visningstype) + "</span>" + (scene.avsender ? "<span>Fra " + escapeHtml(personNavn(scene.avsender)) + "</span>" : "") + "</div>"
      + "<h3>" + escapeHtml(scene.tittel) + "</h3>"
      + "<p>" + escapeHtml(scene.tekst) + "</p>"
      + "<div class=\"civi-lifestory-threadline\">Tråd: <strong>" + escapeHtml(formatThreadTitle(thread || { id: scene.threadId })) + "</strong>" + (ts ? " <span class=\"civi-thread-badge is-" + escapeHtml(ts.status) + "\">" + escapeHtml(formatThreadStatus(ts.status)) + "</span>" : "") + "</div>"
      + "<div class=\"civi-lifestory-choices\" aria-label=\"Valg\">" + valgHtml + "</div>"
      + "</article>";
  }

  /**
   * @param {string} phaseId
   * @returns {string}
   */
  function viewPhaseName(phaseId) {
    const phase = (content?.faser || []).find((f) => f.id === phaseId);
    return phase ? phase.navn : humanizeId(phaseId);
  }

  function personNavn(personId) {
    const person = (content.role.personer || []).find((p) => p.id === personId);
    return person ? person.navn : personId;
  }

  /**
   * Fortellingsmessig feedback etter forrige valg (konsekvensTekst).
   * @returns {string}
   */
  function renderKonsekvensHtml() {
    if (!sisteKonsekvens) return "";
    const chips = (sisteKonsekvens.deltas || []).map((delta) =>
      "<span class=\"civi-lifestory-delta " + (delta.delta > 0 ? "is-positive" : "is-negative") + "\">" + escapeHtml(formatMeterDelta(delta)) + "</span>"
    ).join("");
    return ""
      + "<section class=\"civi-lifestory-konsekvens\" aria-live=\"polite\">"
      + "<div class=\"civi-lifestory-section-label\">Konsekvens</div>"
      + (sisteKonsekvens.valgTekst ? "<div class=\"muted\">Etter «" + escapeHtml(sisteKonsekvens.valgTekst) + "»</div>" : "")
      + "<p>" + escapeHtml(sisteKonsekvens.tekst) + "</p>"
      + (chips ? "<div class=\"civi-lifestory-deltas\">" + chips + "</div>" : "")
      + "</section>";
  }

  /**
   * @param {string} threadId
   * @returns {string}
   */
  function traadTittel(threadId) {
    const thread = content.threads.find((t) => t.id === threadId);
    return thread ? thread.tittel : threadId;
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderSummaryHtml(view) {
    const summary = view.oppsummering;
    const valgHtml = summary.valg.map((entry) =>
      "<li><strong>" + escapeHtml(entry.sceneTittel) + "</strong><br><em>" + escapeHtml(entry.valgTekst) + "</em>"
      + (entry.konsekvensTekst ? "<p>" + escapeHtml(entry.konsekvensTekst) + "</p>" : "")
      + "</li>"
    ).join("") || "<li class=\"muted\">Ingen valg ble tatt.</li>";
    const meterHtml = Object.entries(summary.meterEndringer).map(([key, delta]) =>
      "<span class=\"civi-lifestory-delta " + (Number(delta) > 0 ? "is-positive" : "is-negative") + "\">" + escapeHtml(formatMeterDelta({ key, delta })) + "</span>"
    ).join("");
    const traadHtml = [
      [summary.traader.fullfoert, "Fullført"],
      [summary.traader.eskalert, "Eskalert"],
      [summary.traader.hvilende, "Hvilende"]
    ]
      .filter(([ids]) => ids.length)
      .map(([ids, label]) =>
        "<li><strong>" + escapeHtml(label) + ":</strong> " + ids.map((id) => escapeHtml(traadTittel(id))).join(", ") + "</li>"
      ).join("");
    const narrative = summary.valg.filter((entry) => entry.konsekvensTekst).slice(-2).map((entry) => entry.konsekvensTekst).join(" ");
    return ""
      + "<section class=\"civi-lifestory-summary\" aria-label=\"Dagsoppsummering\">"
      + "<div class=\"civi-lifestory-section-label\">Dagsoppsummering</div>"
      + "<h3>Dag " + escapeHtml(summary.dag) + " er over</h3>"
      + (narrative ? "<p>" + escapeHtml(narrative) + "</p>" : "<p class=\"muted\">Dagen er avsluttet og valgene dine er lagret i arkivet.</p>")
      + "<h4>Meter-endringer siden morgenen</h4><div class=\"civi-lifestory-deltas\">" + (meterHtml || "<span class=\"muted\">Ingen målbare endringer.</span>") + "</div>"
      + (traadHtml ? "<h4>Tråder som endret status</h4><ul>" + traadHtml + "</ul>" : "")
      + "<h4>Viktige valg i dag</h4><ul>" + valgHtml + "</ul>"
      + "<div class=\"civi-lifestory-actions\">"
      + "<button class=\"civi-btn primary\" type=\"button\" data-lifestory-next-day>Start neste dag</button>"
      + "<button class=\"civi-btn\" type=\"button\" data-lifestory-restart>Start livet på nytt</button>"
      + "</div>"
      + "</section>";
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderPanelsHtml(view) {
    const allThreads = Object.entries(state.threadState || {}).map(([id, ts]) => {
      const thread = content.threads.find((t) => t.id === id) || { id };
      return Object.assign({}, thread, { status: ts.status, step: ts.step });
    }).sort((a, b) => {
      const rank = { escalated: 0, active: 1, dormant: 2, completed: 3 };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    });
    const hiddenCount = Math.max(0, allThreads.length - 6);
    const traaderHtml = allThreads.slice(0, 6).map((thread) =>
      "<li class=\"civi-thread-row is-" + escapeHtml(thread.status) + "\"><span>" + escapeHtml(formatThreadTitle(thread)) + "</span><span class=\"civi-thread-badge is-" + escapeHtml(thread.status) + "\">" + escapeHtml(formatThreadStatus(thread.status)) + "</span></li>"
    ).join("") + (hiddenCount ? "<li class=\"muted\">+ " + hiddenCount + " flere tråder</li>" : "");

    const kalenderHtml = view.dagsplan.map((avtale) =>
      "<li><span class=\"muted\">" + escapeHtml(avtale.klokke) + "</span> " + escapeHtml(avtale.tekst) + "</li>"
    ).join("");
    const senereHtml = view.senereIDag.map((scene) =>
      "<li><span class=\"muted\">" + escapeHtml(viewPhaseName(scene.fase)) + "</span> " + escapeHtml(scene.tittel || scene.visningstype) + "</li>"
    ).join("");

    const arkivHtml = view.arkiv.length
      ? view.arkiv.slice(-4).reverse().map((entry) =>
          "<li><strong>" + escapeHtml(viewPhaseName(entry.fase)) + ": " + escapeHtml(entry.sceneTittel)
          + "</strong><br><em>" + escapeHtml(entry.valgTekst) + "</em>"
          + (entry.konsekvensTekst ? "<br><small>" + escapeHtml(entry.konsekvensTekst) + "</small>" : "") + "</li>"
        ).join("")
      : "<li class=\"muted\">Ingen valg tatt ennå.</li>";

    return ""
      + "<aside class=\"civi-lifestory-panels\" aria-label=\"Oversikt\">"
      + "<section><h4>Aktive tråder</h4><ul>" + (traaderHtml || "<li class=\"muted\">Ingen tråder ennå.</li>") + "</ul></section>"
      + "<section><h4>Senere i dag</h4><ul>" + (kalenderHtml + senereHtml || "<li class=\"muted\">Ingen flere planlagte scener.</li>") + "</ul></section>"
      + "<section><h4>Arkiv / tidligere valg</h4><ul>" + arkivHtml + "</ul></section>"
      + "</aside>";
  }

  /**
   * v2-headeren: rolle, dag, fase og noen få statusverdier.
   * @param {any} view
   */
  function renderHeaderStatus(view) {
    const header = document.getElementById("civiLifestoryHeaderStatus");
    if (!header) return;

    if (window.CivicationDashboardUI?.updateHeaderStatus) {
      window.CivicationDashboardUI.updateHeaderStatus({ state, view });
      return;
    }

    const m = state.meters;
    const chips = [
      // Rollechipen viser canonical aktiv rolle (skall-jobben), aldri Life
      // Story-rollen — kontrakten håndheves av civication-v2-min-dag-ui-testen.
      ["role is-empty", "Ingen aktiv rolle"],
      ["day", "Dag " + state.dag],
      ["phase", view.dagFerdig ? "Dagen er over" : (view.fase ? view.fase.navn : state.fase)],
      ["meter", "Psyke " + m.psyke],
      ["meter", "Energi " + m.energi],
      ["pc", m.penger + " PC"]
    ];
    header.textContent = "";
    chips.map(function (chip) {
      const el = document.createElement("span");
      el.className = "civi-header-chip civi-header-chip--" + chip[0].replace(/\s+/g, " civi-header-chip--");
      el.textContent = chip[1];
      el.title = chip[1];
      return el;
    }).forEach(function (chip) { header.appendChild(chip); });
  }

  function render() {
    const panel = getPanel();
    if (!panel || !content || !state) return;

    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const view = Runner.getView(state, content);

    renderHeaderStatus(view);
    panel.innerHTML = renderStatusHtml(view)
      + renderKonsekvensHtml()
      + (view.dagFerdig ? renderSummaryHtml(view) : (view.scene ? renderSceneHtml(view.scene) : ""))
      + renderPanelsHtml(view);
  }

  function bindDelegation(panel) {
    if (/** @type {any} */ (panel)._lifestoryBound) return;
    /** @type {any} */ (panel)._lifestoryBound = true;
    panel.addEventListener("click", (event) => {
      const target = /** @type {HTMLElement} */ (event.target);
      const choiceBtn = target.closest("[data-lifestory-choice]");
      if (choiceBtn) {
        onChoose(
          choiceBtn.getAttribute("data-lifestory-scene") || "",
          choiceBtn.getAttribute("data-lifestory-choice") || ""
        );
        return;
      }
      if (target.closest("[data-lifestory-next-day]")) { onNextDay(); return; }
      if (target.closest("[data-lifestory-restart]")) onRestart();
    });
  }

  async function start() {
    const panel = getPanel();
    if (!panel) return; // siden har ikke Min dag-seksjonen
    try {
      bindDelegation(panel);
      await ensureLoaded();
      render();
    } catch (error) {
      // Innholdsfeil skal synes (fail fast), men aldri stoppe resten av appen.
      console.error("[CivicationLifestoryUI] kunne ikke starte", error);
      panel.innerHTML = "<p class=\"muted\">Min dag kunne ikke lastes. Se konsollen.</p>";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { start(); });
  } else {
    start();
  }

  window.CivicationLifestoryUI = { render, refresh: render };
})();
