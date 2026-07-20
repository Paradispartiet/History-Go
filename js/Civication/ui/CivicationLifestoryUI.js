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

  // Startkontrakten (dashboardet/SYSTEM_MAP): du starter ARBEIDSLEDIG.
  // Jobb kommer via quiz/merker -> jobbtilbud i skallet -> maybeAdoptShellRole
  // bytter til jobbens rolle. Arealplanlegger er pilotrolle, ikke standard.
  const DEFAULT_ROLE_ID = "arbeidsledig";
  const ROLE_STORAGE_KEY = "civication_lifestory_role_v1";

  /**
   * DEV-/TESTVERKTØY — ikke produktflate. Roller velges aldri av spilleren;
   * de fortjenes gjennom quiz (se startkontrakten i civication-life-story-
   * system.md). ?lifestoryRole=<id> tvinger en rolle for utvikling/innholds-
   * arbeid/tester og persisteres; ellers localStorage. Null i normal drift —
   * da følger Min dag skall-jobben (se maybeAdoptShellRole).
   * @returns {string|null}
   */
  function resolveExplicitRoleId() {
    try {
      const fromUrl = new URLSearchParams(window.location.search || "").get("lifestoryRole");
      if (fromUrl && fromUrl.trim()) {
        const roleId = fromUrl.trim();
        try { window.localStorage?.setItem(ROLE_STORAGE_KEY, roleId); } catch { /* uten lagring gjelder valget bare denne lasten */ }
        return roleId;
      }
      const stored = window.localStorage?.getItem(ROLE_STORAGE_KEY);
      if (stored && stored.trim()) return stored.trim();
    } catch { /* blokkert lagring/URL => ingen eksplisitt rolle */ }
    return null;
  }

  const EXPLICIT_ROLE_ID = resolveExplicitRoleId();

  /**
   * Rollen Min dag spiller akkurat nå. Starter som eksplisitt valg eller
   * standardrollen; kan senere byttes av maybeAdoptShellRole når skallet
   * booter eller spilleren tar en jobb. Ukjent rolle-id feiler fast i
   * Content.loadContent (manifest-oppslag) — ingen stille fallback.
   */
  let currentRoleId = EXPLICIT_ROLE_ID || DEFAULT_ROLE_ID;

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

  /**
   * Last innhold + Player State for en rolle. Ny state når lagret state
   * tilhører en annen rolle (én lagringsplass per spiller).
   * @param {string} roleId
   */
  async function loadRole(roleId) {
    const Content = /** @type {any} */ (window).CivicationLifestoryContent;
    const State = /** @type {any} */ (window).CivicationLifestoryState;
    content = await Content.loadContent(roleId);
    state = State.load();
    if (!state || state.rolle !== roleId) {
      state = State.createInitialState(content);
      State.save(state);
    }
    currentRoleId = roleId;
  }

  async function ensureLoaded() {
    if (content && state) return;
    if (!loading) {
      loading = loadRole(currentRoleId);
    }
    return loading;
  }

  // ---- Skall-jobb -> Life Story-rolle ----
  // Uten dev-parameteren følger Min dag skallets aktive jobb: tar
  // spilleren Renholder-jobben, spiller Life Story renholder. Mappingen er
  // canonical resolver (CivicationCareerRoleResolver) + role_scope-binding i
  // lifestory-manifestet — se resolveRoleIdForActivePosition. Jobb uten
  // Life Story-pakke, tom jobb eller manglende resolver endrer ingenting.
  /** Memo: siste sjekkede jobb, så updateProfile-burster ikke koster noe. */
  let lastAdoptKey = null;
  let adopting = false;

  async function maybeAdoptShellRole() {
    if (EXPLICIT_ROLE_ID || adopting) return; // dev-parameteren vinner alltid
    // Ikke memoiser før resolveren finnes — den injiseres av shell-loaderen,
    // og en tidlig updateProfile skal ikke låse sjekken for godt.
    if (!(/** @type {any} */ (window).CivicationCareerRoleResolver?.resolveCareerRoleScope)) return;
    const active = /** @type {any} */ (window).CivicationState?.getActivePosition?.();
    if (!active) return;
    const adoptKey = String(active.career_id || "") + ":" + String(active.role_key || active.title || "");
    if (adoptKey === lastAdoptKey) return;
    lastAdoptKey = adoptKey;

    adopting = true;
    try {
      const Content = /** @type {any} */ (window).CivicationLifestoryContent;
      const mapped = await Content?.resolveRoleIdForActivePosition?.(active);
      if (!mapped || mapped === currentRoleId) return;
      await loadRole(mapped);
      console.info("[CivicationLifestoryUI] Min dag følger skall-jobben: " + mapped);
      render();
    } catch (error) {
      console.warn("[CivicationLifestoryUI] kunne ikke følge skall-jobben", error);
    } finally {
      adopting = false;
    }
  }

  // Skallet booter etter Min dag (shell-loaderen injiserer resolver +
  // CivicationState); jobbaksept dispatcher updateProfile.
  window.addEventListener("civi:booted", () => { maybeAdoptShellRole(); });
  // updateProfile: jobbtilbud kan ha endret rollen, og HG_Lifestyle kan ha
  // telt nye tags (stamp-chipen) — re-render henter begge. render() er ren
  // lesing, så dette kan aldri starte en event-løkke.
  window.addEventListener("updateProfile", () => { maybeAdoptShellRole(); render(); });

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
      // Énveis konsekvensbro: faktiske meter-endringer (etter clamping)
      // skrives til skallets psyke, så dashboardet speiler dagens valg.
      // Broen eier mappingen og testmodus-gaten (lifestoryShellBridge).
      const meterDeltas = {};
      for (const meterKey of Object.keys(state.meters)) {
        const delta = Number(state.meters[meterKey]) - Number(before.meters[meterKey]);
        if (delta) meterDeltas[meterKey] = delta;
      }
      /** @type {any} */ (window).CivicationLifestoryShellBridge?.applyMeterDeltasToShell?.(meterDeltas);
      // Livsstilsbro: valgets tags (pub => nightlife, eget prosjekt => craft, …)
      // teller mot skallets HG_Lifestyle-stamp. Broen eier testmodus-gaten.
      if (valg && Array.isArray(/** @type {any} */ (valg).livsstil)) {
        /** @type {any} */ (window).CivicationLifestoryShellBridge?.applyLifestyleTagsToShell?.(/** @type {any} */ (valg).livsstil);
      }
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
      // Handling: utfør den EKTE spillhandlingen valget lover (fanebytte/
      // History GO-navigasjon). Player State er allerede lagret over, så en
      // navigasjon bort fra siden mister aldri progresjon.
      if (valg && /** @type {any} */ (valg).handling) {
        /** @type {any} */ (window).CivicationLifestoryActions?.perform?.(/** @type {any} */ (valg).handling);
      }
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
   * Dominant livsstil fra skallet (HG_Lifestyle-stamp). Null før valgene har
   * bygget en tydelig retning (score <= 0) eller uten motoren (ren Min dag-
   * flate) — da vises ingenting, vi gjetter aldri en livsstil.
   * @returns {{ id: string, name: string, icon: string, score: number }|null}
   */
  function lifestyleStamp() {
    try {
      const stamp = /** @type {any} */ (window).HG_Lifestyle?.getStamp?.();
      return stamp && Number(stamp.score) > 0 ? stamp : null;
    } catch { return null; }
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
    const stamp = lifestyleStamp();
    if (stamp) items.push(["Livsstil", (stamp.icon ? stamp.icon + " " : "") + stamp.name]);
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
      + (/** @type {any} */ (valg).handling ? "<small class=\"civi-lifestory-action-hint\">→ "
        + escapeHtml(/** @type {any} */ (window).CivicationLifestoryActions?.HANDLING_LABELS?.[/** @type {any} */ (valg).handling.type] || "utfører handlingen")
        + "</small>" : "")
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
    // Livsstilslinjen: dagens valg teller — vis hvem spilleren er i ferd med å bli.
    const stamp = lifestyleStamp();
    const stampHtml = stamp
      ? "<p class=\"civi-lifestory-stamp\">Valgene dine drar mot: <strong>"
        + escapeHtml((stamp.icon ? stamp.icon + " " : "") + stamp.name) + "</strong></p>"
      : "";
    // Uka kåres en slutt på den siste dagen med innhold: da tolkes hele
    // spillet til en ending, og «Start neste dag» erstattes av å begynne på
    // nytt. Uten endings-modulen (ren Min dag-flate) faller vi tilbake til
    // den vanlige dagsoppsummeringen.
    const Endings = /** @type {any} */ (window).CivicationLifestoryEndings;
    const sisteDag = !!(Endings && Endings.isFinalDay(state, content));
    const ending = sisteDag ? Endings.resolveEnding(state, content) : null;
    const endingHtml = ending
      ? "<section class=\"civi-lifestory-ending\" aria-label=\"Ukas slutt\">"
        + "<div class=\"civi-lifestory-section-label\">Slutten på uka</div>"
        + "<h3>" + escapeHtml(ending.navn) + "</h3>"
        + (ending.tekst ? "<p>" + escapeHtml(ending.tekst) + "</p>" : "")
        + "</section>"
      : "";
    const handlingsHtml = sisteDag
      ? "<div class=\"civi-lifestory-actions\">"
        + "<button class=\"civi-btn primary\" type=\"button\" data-lifestory-restart>Start et nytt liv</button>"
        + "</div>"
      : "<div class=\"civi-lifestory-actions\">"
        + "<button class=\"civi-btn primary\" type=\"button\" data-lifestory-next-day>Start neste dag</button>"
        + "<button class=\"civi-btn\" type=\"button\" data-lifestory-restart>Start livet på nytt</button>"
        + "</div>";
    return ""
      + "<section class=\"civi-lifestory-summary\" aria-label=\"Dagsoppsummering\">"
      + "<div class=\"civi-lifestory-section-label\">Dagsoppsummering</div>"
      + "<h3>Dag " + escapeHtml(summary.dag) + " er over</h3>"
      + (narrative ? "<p>" + escapeHtml(narrative) + "</p>" : "<p class=\"muted\">Dagen er avsluttet og valgene dine er lagret i arkivet.</p>")
      + stampHtml
      + "<h4>Meter-endringer siden morgenen</h4><div class=\"civi-lifestory-deltas\">" + (meterHtml || "<span class=\"muted\">Ingen målbare endringer.</span>") + "</div>"
      + (traadHtml ? "<h4>Tråder som endret status</h4><ul>" + traadHtml + "</ul>" : "")
      + "<h4>Viktige valg i dag</h4><ul>" + valgHtml + "</ul>"
      + endingHtml
      + handlingsHtml
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
      // Første scene er oppe — vekk lyttere (kartmarkør, dashboard) som
      // trenger scenens sted/fase uten å måtte polle.
      window.dispatchEvent(new Event("civi:lifestoryChanged"));
    } catch (error) {
      // Innholdsfeil skal synes (fail fast), men aldri stoppe resten av appen.
      console.error("[CivicationLifestoryUI] kunne ikke starte", error);
      panel.innerHTML = "<p class=\"muted\">Min dag kunne ikke lastes. Se konsollen.</p>";
    }
  }

  /**
   * Read-only view-model for NÅ-scenen — brukes av kartmarkøren
   * (CivicationLifestoryPlaceMarker) til å vise hvor dagen foregår.
   * null før innholdet er lastet.
   * @returns {{ sceneId: string|null, tittel: string|null, fase: string,
   *   dagFerdig: boolean, threadId: string|null, threadType: string|null,
   *   rolleNavn: string|null }|null}
   */
  function getCurrentSceneInfo() {
    if (!content || !state) return null;
    const Runner = /** @type {any} */ (window).CivicationLifestoryRunner;
    const view = Runner.getView(state, content);
    const scene = view.scene || null;
    const thread = scene ? (content.threads || []).find((t) => t.id === scene.threadId) : null;
    return {
      sceneId: scene ? scene.id : null,
      tittel: scene ? scene.tittel : null,
      fase: state.fase,
      dagFerdig: !!view.dagFerdig,
      threadId: thread ? thread.id : null,
      threadType: thread ? thread.type : null,
      rolleNavn: content.role && content.role.navn ? String(content.role.navn) : null
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { start(); });
  } else {
    start();
  }

  window.CivicationLifestoryUI = { render, refresh: render, getCurrentSceneInfo };
})();
