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

  const ROLE_ID = "arealplanlegger"; // pilotrollen

  /** @type {any} */ let content = null;
  /** @type {any} */ let state = null;
  /** @type {Promise<void>|null} */ let loading = null;

  /**
   * @param {unknown} value
   * @returns {string}
   */
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
      Runner.applyChoice(state, content, sceneId, choiceId);
      State.save(state);
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
    } catch (error) {
      console.error("[CivicationLifestoryUI] valg feilet", error);
    }
    render();
  }

  function onRestart() {
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    state = State.createInitialState(content);
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
    return ""
      + "<div class=\"civi-lifestory-status muted\">"
      + "Rolle: " + escapeHtml(content.role.navn)
      + " · Dag " + escapeHtml(state.dag)
      + " · " + escapeHtml(view.fase ? view.fase.navn : state.fase)
      + " · Psyke " + escapeHtml(m.psyke)
      + " · Energi " + escapeHtml(m.energi)
      + " · " + escapeHtml(m.penger) + " PC"
      + "</div>";
  }

  /**
   * @param {any} scene
   * @returns {string}
   */
  function renderSceneHtml(scene) {
    const valgHtml = (scene.valg || []).map((valg) =>
      "<button class=\"civi-btn\" type=\"button\" data-lifestory-scene=\"" + escapeHtml(scene.id) + "\""
      + " data-lifestory-choice=\"" + escapeHtml(valg.id) + "\">"
      + escapeHtml(valg.tekst) + "</button>"
    ).join("");
    return ""
      + "<div class=\"civi-lifestory-scene\">"
      + "<div class=\"civi-lifestory-kicker muted\">NÅ · " + escapeHtml(scene.visningstype)
      + (scene.avsender ? " · fra " + escapeHtml(personNavn(scene.avsender)) : "")
      + "</div>"
      + "<h3>" + escapeHtml(scene.tittel) + "</h3>"
      + "<p>" + escapeHtml(scene.tekst) + "</p>"
      + "<div class=\"civi-lifestory-choices\" style=\"display:flex;flex-direction:column;gap:8px;\">" + valgHtml + "</div>"
      + "</div>";
  }

  /**
   * @param {string} personId
   * @returns {string}
   */
  function personNavn(personId) {
    const person = (content.role.personer || []).find((p) => p.id === personId);
    return person ? person.navn : personId;
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderSummaryHtml(view) {
    const summary = view.oppsummering;
    const valgHtml = summary.valg.map((entry) =>
      "<li>" + escapeHtml(entry.sceneTittel) + " — <em>" + escapeHtml(entry.valgTekst) + "</em></li>"
    ).join("");
    const meterHtml = Object.entries(summary.meterEndringer).map(([key, delta]) =>
      "<span style=\"margin-right:10px;\">" + escapeHtml(key) + " " + (Number(delta) > 0 ? "+" : "") + escapeHtml(delta) + "</span>"
    ).join("");
    return ""
      + "<div class=\"civi-lifestory-summary\">"
      + "<h3>Dag " + escapeHtml(summary.dag) + " er over</h3>"
      + "<p class=\"muted\">Slik flyttet dagen deg:</p>"
      + "<div>" + (meterHtml || "<span class=\"muted\">Ingen målbare endringer.</span>") + "</div>"
      + "<ul>" + valgHtml + "</ul>"
      + "<button class=\"civi-btn\" type=\"button\" data-lifestory-restart>Start dagen på nytt</button>"
      + "</div>";
  }

  /**
   * @param {any} view
   * @returns {string}
   */
  function renderPanelsHtml(view) {
    const traaderHtml = view.aktiveTraader.map((thread) =>
      "<li>" + escapeHtml(thread.tittel) + "</li>"
    ).join("");

    const kalenderHtml = view.dagsplan.map((avtale) =>
      "<li>" + escapeHtml(avtale.klokke) + " " + escapeHtml(avtale.tekst) + "</li>"
    ).join("");
    const senereHtml = view.senereIDag.map((scene) =>
      "<li class=\"muted\">" + escapeHtml(scene.tittel) + "</li>"
    ).join("");

    const arkivHtml = view.arkiv.length
      ? view.arkiv.slice().reverse().map((entry) =>
          "<li>" + escapeHtml(entry.fase) + ": " + escapeHtml(entry.sceneTittel)
          + " — <em>" + escapeHtml(entry.valgTekst) + "</em></li>"
        ).join("")
      : "<li class=\"muted\">Ingen valg tatt ennå.</li>";

    return ""
      + "<div class=\"civi-lifestory-panels\">"
      + "<h4>Aktive tråder</h4><ul>" + traaderHtml + "</ul>"
      + "<h4>Kalender / senere i dag</h4><ul>" + kalenderHtml + senereHtml + "</ul>"
      + "<h4>Arkiv</h4><ul>" + arkivHtml + "</ul>"
      + "</div>";
  }

  /**
   * v2-headeren: rolle, dag, fase og noen få statusverdier.
   * @param {any} view
   */
  function renderHeaderStatus(view) {
    const header = document.getElementById("civiLifestoryHeaderStatus");
    if (!header) return;
    const m = state.meters;
    header.textContent = content.role.navn
      + " · Dag " + state.dag
      + " · " + (view.dagFerdig ? "Dagen er over" : (view.fase ? view.fase.navn : state.fase))
      + " · Psyke " + m.psyke
      + " · Energi " + m.energi
      + " · " + m.penger + " PC";
  }

  function render() {
    const panel = getPanel();
    if (!panel || !content || !state) return;

    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const view = Runner.getView(state, content);

    renderHeaderStatus(view);
    panel.innerHTML = renderStatusHtml(view)
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
