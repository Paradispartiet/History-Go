// js/Civication/lifestory/lifestoryShellBridge.js
//
// Life Story -> skallet: énveis konsekvensbro.
// Når spilleren tar et valg i Min dag, skrives bare semantisk kompatible
// konsekvenser videre til skallet:
//   - faktiske meter-endringer -> CivicationPsyche
//   - livsstilstags -> HG_Lifestyle
//   - eksplisitte livelihood-muligheter -> CivicationLivelihoods
//
// Pengemåleren i Life Story er FORTSATT en egen narrativ skala. Den broes
// aldri direkte til skallets PC-wallet. Et Life Story-valg kan bare skape et
// kildeført tilbud som spilleren deretter må akseptere i livelihood-systemet.
//
// Kontrakt:
//   - Énveis: leser ALDRI psyke/wallet tilbake inn i Player State.
//   - Testmodus skriver ALDRI progresjon til skallet.
//   - Mangler en skallmotor => stille no-op eller persistent outbox.
//   - Ingen direkte wallet-skriv.
//   - Dispatcher updateProfile bare via de canonicale mål-systemene.
//
// DOM-fri og dual-eksportert (window + module.exports) som resten av
// lifestory-kjernen, så den kan testes rett i Node med mocks.

(function (globalScope) {
  "use strict";

  /** Life Story-måler -> metodenavn på CivicationPsyche. Kun 1:1-semantikk. */
  const METER_TO_PSYCHE = {
    integritet: "updateIntegrity",
    synlighet: "updateVisibility",
    handlingsrom: "updateEconomicRoom"
  };

  const LIVELIHOOD_OVERLAY_PATH = "data/Civication/lifestory/livelihoodOpportunityOverlays.json";
  const LIVELIHOOD_OUTBOX_KEY = "hg_civi_lifestory_livelihood_outbox_v1";
  const STRICT_ID = /^[a-z0-9][a-z0-9_-]*$/;
  let livelihoodOverlayPromise = null;
  let livelihoodFlushPromise = null;

  /**
   * Test-/debugøkter skal aldri skrive progresjon til skallet. Samme
   * signaler som skallet selv bruker (CivicationUI/CivicationTestModeUI).
   * @returns {boolean}
   */
  function isTestOrDebugSession() {
    const g = /** @type {any} */ (globalScope);
    try {
      if (g.CIVICATION_TEST_MODE === true || g.TEST_MODE === true || g.CiviTestMode === true) return true;
      if (g.localStorage?.getItem?.("civication_test_mode_v1") === "true") return true;
      const active = g.CivicationState?.getActivePosition?.();
      if (active && active.is_test_session === true) return true;
    } catch { /* blokkert lagring => behandle som vanlig økt */ }
    return false;
  }

  /**
   * Skriv Life Story-meterdeltaer til skallets psyke.
   * @param {Record<string, number>|null|undefined} meterDeltas
   *   Faktiske endringer fra ett valg (etter clamping), f.eks.
   *   { integritet: 5, energi: -4 }. Umappede målere ignoreres stille.
   * @returns {{ applied: Record<string, number>, skipped: string|null }}
   *   applied: det som faktisk ble skrevet. skipped: hvorfor ingenting ble
   *   skrevet ("test_mode" | "psyche_unavailable" | null).
   */
  function applyMeterDeltasToShell(meterDeltas) {
    const psyche = /** @type {any} */ (globalScope).CivicationPsyche;
    if (!psyche) return { applied: {}, skipped: "psyche_unavailable" };
    if (isTestOrDebugSession()) return { applied: {}, skipped: "test_mode" };

    /** @type {Record<string, number>} */
    const applied = {};
    for (const [meter, rawDelta] of Object.entries(meterDeltas || {})) {
      const method = METER_TO_PSYCHE[meter];
      if (!method || typeof psyche[method] !== "function") continue;
      const delta = Number(rawDelta);
      if (!Number.isFinite(delta) || delta === 0) continue;
      try {
        psyche[method](delta);
        applied[meter] = delta;
      } catch (error) {
        console.warn(`[CivicationLifestoryShellBridge] psyke-skriv feilet for ${meter}`, error);
      }
    }

    if (Object.keys(applied).length && typeof /** @type {any} */ (globalScope).dispatchEvent === "function" && typeof /** @type {any} */ (globalScope).Event === "function") {
      try { /** @type {any} */ (globalScope).dispatchEvent(new (/** @type {any} */ (globalScope).Event)("updateProfile")); } catch { /* uten event-miljø (Node) er skrivet fortsatt gjort */ }
    }
    return { applied, skipped: null };
  }

  /**
   * Skriv et valgs livsstilstags til skallets HG_Lifestyle (path dependency:
   * tellingene akkumuleres i hg_lifestyle_v1 og kårer dominant livsstil).
   * Samme kontrakt som psyke-broen: énveis, testmodus skriver aldri,
   * mangler motoren => stille no-op. HG_Lifestyle.addTags dispatcher selv
   * updateProfile ved endring — ingen ekstra event her.
   * @param {string[]|null|undefined} tags Tags fra valgets `livsstil`-felt.
   * @returns {{ applied: string[], skipped: string|null }}
   */
  function applyLifestyleTagsToShell(tags) {
    const lifestyle = /** @type {any} */ (globalScope).HG_Lifestyle;
    if (!lifestyle || typeof lifestyle.addTags !== "function") {
      return { applied: [], skipped: "lifestyle_unavailable" };
    }
    if (isTestOrDebugSession()) return { applied: [], skipped: "test_mode" };

    const clean = (Array.isArray(tags) ? tags : []).filter((t) => typeof t === "string" && t);
    if (!clean.length) return { applied: [], skipped: null };
    try {
      // addTags er async (laster lifestyles.json ved behov) — fire and forget.
      lifestyle.addTags(clean, "lifestory");
    } catch (error) {
      console.warn("[CivicationLifestoryShellBridge] livsstil-skriv feilet", error);
      return { applied: [], skipped: "lifestyle_error" };
    }
    return { applied: clean, skipped: null };
  }

  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 72);
  }

  function getLivelihoodOutbox() {
    const storage = /** @type {any} */ (globalScope).localStorage;
    if (!storage?.getItem) return [];
    const parsed = safeParse(storage.getItem(LIVELIHOOD_OUTBOX_KEY), []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function saveLivelihoodOutbox(entries) {
    const storage = /** @type {any} */ (globalScope).localStorage;
    if (!storage?.setItem) return false;
    storage.setItem(LIVELIHOOD_OUTBOX_KEY, JSON.stringify(Array.isArray(entries) ? entries.slice(-100) : []));
    return true;
  }

  async function ensureLivelihoodOverlaysLoaded() {
    const g = /** @type {any} */ (globalScope);
    if (Array.isArray(g.CIVI_LIFESTORY_LIVELIHOOD_OVERLAYS?.overlays)) {
      return g.CIVI_LIFESTORY_LIVELIHOOD_OVERLAYS;
    }
    if (livelihoodOverlayPromise) return livelihoodOverlayPromise;
    if (typeof g.fetch !== "function") return null;

    livelihoodOverlayPromise = g.fetch(LIVELIHOOD_OVERLAY_PATH, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !Array.isArray(json.overlays)) throw new Error("overlays must be an array");
        g.CIVI_LIFESTORY_LIVELIHOOD_OVERLAYS = json;
        return json;
      })
      .catch((error) => {
        console.warn("[CivicationLifestoryShellBridge] livelihood overlays kunne ikke lastes", error);
        return null;
      });
    return livelihoodOverlayPromise;
  }

  function collectInlineLivelihoodOpportunities(choice) {
    if (!choice || typeof choice !== "object") return [];
    const values = [];
    const push = (value) => {
      if (Array.isArray(value)) values.push(...value);
      else if (value && typeof value === "object") values.push(value);
    };
    push(choice.livelihood_opportunity);
    push(choice.livelihood_opportunities);
    return values;
  }

  async function collectOverlayLivelihoodOpportunities(roleId, sceneId, choiceId) {
    const catalog = await ensureLivelihoodOverlaysLoaded();
    const overlays = Array.isArray(catalog?.overlays) ? catalog.overlays : [];
    return overlays
      .filter((entry) => String(entry?.role_id || "") === String(roleId || "") &&
        String(entry?.scene_id || "") === String(sceneId || "") &&
        String(entry?.choice_id || "") === String(choiceId || ""))
      .flatMap((entry) => entry?.opportunity && typeof entry.opportunity === "object"
        ? [{ ...entry.opportunity, __overlay_id: String(entry.id || "") }]
        : []);
  }

  function buildLifestoryOpportunity(raw, context, index) {
    if (!raw || typeof raw !== "object") return null;
    const roleId = String(context?.roleId || "").trim();
    const sceneId = String(context?.sceneId || "").trim();
    const choiceId = String(context?.choiceId || "").trim();
    const overlayId = String(raw.__overlay_id || "").trim();
    const explicitId = String(raw.id || "").trim();
    const generatedId = overlayId
      ? `lifestory_${slug(overlayId)}`
      : `lifestory_${slug(roleId)}_${slug(sceneId)}_${slug(choiceId)}_${index}`;
    const id = explicitId || generatedId;
    if (!STRICT_ID.test(id)) return null;

    const source = raw.source && typeof raw.source === "object"
      ? raw.source
      : {
          type: "lifestory_choice",
          id: `${slug(roleId)}_${slug(sceneId)}_${slug(choiceId)}`,
          label: `${roleId || "Life Story"}: ${sceneId || "scene"}`
        };

    return {
      id,
      kind_id: String(raw.kind_id || "").trim(),
      label: String(raw.label || "").trim(),
      description: String(raw.description || "").trim() || null,
      source,
      income: raw.income,
      cadence: raw.cadence,
      direct_costs: raw.direct_costs,
      requires_unemployed: raw.requires_unemployed,
      requires_life_positions: raw.requires_life_positions,
      related_life_positions: raw.related_life_positions,
      starts_week: raw.starts_week,
      ends_week: raw.ends_week,
      expires_at: raw.expires_at,
      metadata: {
        ...(raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {}),
        producer: "lifestory_choice",
        lifestory_role_id: roleId || null,
        lifestory_scene_id: sceneId || null,
        lifestory_choice_id: choiceId || null,
        overlay_id: overlayId || null
      }
    };
  }

  function enqueueLivelihoodOpportunities(opportunities) {
    if (isTestOrDebugSession()) return { queued: 0, skipped: "test_mode" };
    const clean = (Array.isArray(opportunities) ? opportunities : []).filter((entry) => entry?.id && entry?.kind_id && entry?.label);
    if (!clean.length) return { queued: 0, skipped: null };

    const existing = getLivelihoodOutbox();
    const knownIds = new Set(existing.map((entry) => String(entry?.id || "")));
    const additions = clean.filter((entry) => !knownIds.has(String(entry.id)));
    if (!additions.length) return { queued: 0, skipped: "duplicate" };
    saveLivelihoodOutbox(existing.concat(additions));
    flushLivelihoodOutbox();
    return { queued: additions.length, skipped: null };
  }

  async function flushLivelihoodOutbox() {
    if (livelihoodFlushPromise) return livelihoodFlushPromise;
    livelihoodFlushPromise = (async () => {
      if (isTestOrDebugSession()) return { materialized: 0, pending: getLivelihoodOutbox().length, skipped: "test_mode" };
      const g = /** @type {any} */ (globalScope);
      const livelihood = g.CivicationLivelihoods;
      if (!livelihood || typeof livelihood.createOpportunity !== "function") {
        return { materialized: 0, pending: getLivelihoodOutbox().length, skipped: "livelihood_unavailable" };
      }
      await livelihood.ensureCatalogLoaded?.();

      const outbox = getLivelihoodOutbox();
      const keep = [];
      let materialized = 0;
      for (const opportunity of outbox) {
        try {
          const result = livelihood.createOpportunity(opportunity);
          if (result?.ok) {
            materialized += 1;
            continue;
          }
          if (result?.reason === "duplicate_livelihood_id") {
            // Deterministisk ID betyr at tilbudet allerede finnes i canonical
            // livelihood-state. Det er terminalt, ikke en outbox-feil.
            continue;
          }
          keep.push(opportunity);
        } catch (error) {
          console.warn("[CivicationLifestoryShellBridge] livelihood opportunity feilet", error);
          keep.push(opportunity);
        }
      }
      saveLivelihoodOutbox(keep);
      return { materialized, pending: keep.length, skipped: null };
    })().finally(() => { livelihoodFlushPromise = null; });
    return livelihoodFlushPromise;
  }

  async function queueLivelihoodFromChoice(content, sceneId, choiceId, choice) {
    if (isTestOrDebugSession()) return { queued: 0, skipped: "test_mode" };
    const roleId = String(content?.role?.id || content?.roleId || content?.id || "").trim();
    const inline = collectInlineLivelihoodOpportunities(choice);
    const overlays = await collectOverlayLivelihoodOpportunities(roleId, sceneId, choiceId);
    const all = inline.concat(overlays)
      .map((raw, index) => buildLifestoryOpportunity(raw, { roleId, sceneId, choiceId }, index))
      .filter(Boolean);
    return enqueueLivelihoodOpportunities(all);
  }

  function installLivelihoodChoiceBridge() {
    const g = /** @type {any} */ (globalScope);
    const runner = g.CivicationLifestoryRunner;
    if (!runner || typeof runner.applyChoice !== "function") return false;
    if (runner.__livelihoodChoiceBridgeAttached) return true;

    const baseApplyChoice = runner.applyChoice.bind(runner);
    runner.applyChoice = function applyChoiceWithLivelihood(state, content, sceneId, choiceId) {
      const scene = Array.isArray(content?.scenes)
        ? content.scenes.find((entry) => String(entry?.id || "") === String(sceneId || ""))
        : null;
      const choice = Array.isArray(scene?.valg)
        ? scene.valg.find((entry) => String(entry?.id || "") === String(choiceId || ""))
        : null;

      // Canonical Life Story-fremdrift skjer alltid først. Hvis runneren
      // kaster på et ugyldig valg, kommer vi aldri hit og ingen økonomisk
      // opportunity kan lekke fra et mislykket valg.
      const result = baseApplyChoice(state, content, sceneId, choiceId);
      if (choice) {
        queueLivelihoodFromChoice(content, sceneId, choiceId, choice).catch((error) => {
          console.warn("[CivicationLifestoryShellBridge] choice livelihood queue feilet", error);
        });
      }
      return result;
    };
    runner.__livelihoodChoiceBridgeAttached = true;
    return true;
  }

  /**
   * Profil-snapshot: ProfileSignalBridge er async, men runnerens conditions
   * er synkrone. Broen holder derfor et synkront snapshot i
   * globalScope.CivicationLifestoryProfileTags. Uten bridge (ren Min dag-
   * flate/Node) forblir snapshotet borte, og profilgatede scener fyrer ikke.
   * @returns {Promise<string[]|null>}
   */
  async function refreshProfileSnapshot() {
    const g = /** @type {any} */ (globalScope);
    const bridge = g.CivicationProfileSignalBridge;
    if (!bridge || typeof bridge.getProfileTags !== "function") return null;
    try {
      const tags = await bridge.getProfileTags();
      if (Array.isArray(tags)) {
        g.CivicationLifestoryProfileTags = tags;
        return tags;
      }
    } catch (error) {
      console.warn("[CivicationLifestoryShellBridge] profil-snapshot feilet", error);
    }
    return null;
  }

  /**
   * Skalltilstands-snapshot: runnerens conditions er synkrone, så sann
   * spilltilstand (bosted valgt? jobb aktiv?) speiles inn i den synkrone
   * globalen CivicationLifestoryShellState. Uten skallet (ren Min dag-flate/
   * Node) settes ingen snapshot, og shell-gatede scener fyrer aldri.
   * @returns {{ harBosted: boolean, harJobb: boolean, harHusleiepress?: boolean }|null}
   */
  function refreshShellStateSnapshot() {
    const g = /** @type {any} */ (globalScope);
    const home = g.CivicationHome;
    if (!home || typeof home.getCurrentDistrict !== "function") return null;
    try {
      let harHusleiepress = false;
      try { harHusleiepress = Number(home.getRentPressure?.()?.score || 0) >= 50; } catch { /* uten økonomi-motor: ikke press */ }
      const snap = {
        harBosted: !!home.getCurrentDistrict(),
        harJobb: !!g.CivicationState?.getActivePosition?.(),
        harHusleiepress
      };
      g.CivicationLifestoryShellState = snap;
      return snap;
    } catch (error) {
      console.warn("[CivicationLifestoryShellBridge] skalltilstands-snapshot feilet", error);
      return null;
    }
  }

  const api = {
    METER_TO_PSYCHE,
    isTestOrDebugSession,
    applyMeterDeltasToShell,
    applyLifestyleTagsToShell,
    ensureLivelihoodOverlaysLoaded,
    queueLivelihoodFromChoice,
    flushLivelihoodOutbox,
    installLivelihoodChoiceBridge,
    refreshProfileSnapshot,
    refreshShellStateSnapshot
  };
  /** @type {any} */ (globalScope).CivicationLifestoryShellBridge = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;

  // Runneren er lastet rett før denne filen i Civication.html, så broen kan
  // festes før Min dag-UI-en blir interaktiv. Det lukker oppstartsvinduet der
  // spilleren ellers kunne rukket å velge før skallet/livelihood var klart.
  installLivelihoodChoiceBridge();

  if (typeof window !== "undefined") {
    for (const eventName of ["civi:booted", "updateProfile"]) {
      window.addEventListener(eventName, () => { refreshProfileSnapshot(); refreshShellStateSnapshot(); });
    }
    window.addEventListener("civi:homeChanged", () => { refreshShellStateSnapshot(); });
    // Outbox kan ha blitt skrevet før shell/livelihood-runtimen var ferdig.
    // Flush når canonical livelihood er klart; ingen direct-wallet fallback.
    window.addEventListener("civi:booted", () => { flushLivelihoodOutbox(); });
    window.addEventListener("civi:livelihoodCatalogLoaded", () => { flushLivelihoodOutbox(); });
  }
})(typeof window !== "undefined" ? window : globalThis);
