// js/Civication/ui/CivicationLifestoryActions.js
//
// Handlinger fra Min dag: et valg med `handling: { type }` skal UTFØRE noe
// ekte i spillet, ikke bare fortelle om det:
//
//   velg_bosted    -> åpner Personlig-panelet der nabolagsvalget bor
//                     (CivicationHome/MiniSections' bostedskontroller)
//   aapne_butikk   -> åpner Kommers-panelet (CivicationStoreUI)
//   aapne_karriere -> åpner Karriere-panelet (jobbtilbudene)
//   gaa_til_quiz   -> navigerer til History GO (index.html#/map) — byen er
//                     spillbrettet, quizzene tas på stedene
//
// Kontrakt:
//   - Utføres ETTER at valget er tatt og Player State er lagret, så en
//     navigasjon bort fra siden aldri mister progresjon.
//   - Uten skall-DOM (ren Min dag-flate) er fanebytte en stille no-op;
//     navigasjonen til History GO virker overalt.
//   - Handlingstypene eies av lifestoryContent.HANDLING_TYPES (fail fast i
//     validatoren); denne modulen utfører kun kjente typer.
//
// Dual-eksportert (window + module.exports) og globalScope-basert som
// lifestory-kjernen, så den testes rett i Node med mocket document.

(function (globalScope) {
  "use strict";

  /** Menneskelig hint per handlingstype — vises på valgknappen i Min dag. */
  const HANDLING_LABELS = {
    velg_bosted: "åpner nabolagsvalget",
    aapne_butikk: "åpner butikken",
    aapne_karriere: "åpner karrierepanelet",
    aapne_livsposisjoner: "åpner livsposisjonene",
    gaa_til_quiz: "går til History GO",
    gaa_til_byen: "går ut i byen (History GO)",
    gaa_til_debatt: "går til debatten i History GO"
  };

  /** Handling -> skallkategori (footer-fanene i Civication.html). */
  const HANDLING_TO_CATEGORY = {
    velg_bosted: "personlig",
    aapne_butikk: "kommers",
    aapne_karriere: "karriere",
    aapne_livsposisjoner: "karriere"
  };

  /**
   * Bytt til en skallkategori ved å klikke footer-fanen — samme vei som
   * spilleren selv, så MiniSections' egen logikk (kartmodus av, filter,
   * scroll) kjører uendret. Uten skall-DOM: stille no-op.
   * @param {string} category
   * @returns {boolean} om fanebyttet skjedde
   */
  function openCategory(category) {
    const doc = /** @type {any} */ (globalScope).document;
    if (!doc || typeof doc.querySelector !== "function") return false;
    const btn = doc.querySelector(`.civi-footer button[data-category="${category}"]`);
    if (!btn || typeof btn.click !== "function") return false;
    btn.click();
    return true;
  }

  // The Life Story records the full application/interview/offer chain.
  // Only the existing CivicationJobs service may turn it into an actual offer;
  // accepting employment remains the player's separate Career-panel action.
  const THREE_WEEK_OFFER_ID = "three_week_local_shop_offer";
  const THREE_WEEK_OFFER_KEY = "naeringsliv:0";

  function materializeEarnedJobOffer() {
    const story = globalScope.CivicationLifestoryState?.load?.();
    const state = globalScope.CivicationState;
    const jobs = globalScope.CivicationJobs;
    if (!story) return { ok: false, reason: "story_unavailable" };
    const flags = { ...(story.tidligereValg || {}), ...(story.privatHistorie?.flagg || {}) };
    const played = (sceneId, choiceId) =>
      [...(story.privatHistorie?.arkiv || []), ...(story.arkiv || [])]
        .some(entry => entry.sceneId === sceneId && entry.valgId === choiceId);
    if (flags.wa_e_c21_job_application !== "sent" ||
        flags.wa_e_c21_job_interview !== "completed" ||
        flags.wa_e_c21_job_offer !== "requested" ||
        !played("wave_e_c21_d12_jobbsok", "send_soknad") ||
        !played("wave_e_c21_d17_intervju", "mot_opp") ||
        !played("wave_e_c21_d20_jobbtilbud", "registrer_tilbud")) {
      return { ok: false, reason: "unearned_offer" };
    }
    if (!state?.getActivePosition || !jobs?.getOffers || !jobs?.pushOffer) {
      return { ok: false, reason: "career_runtime_unavailable" };
    }
    const offers = jobs.getOffers() || [];
    if (offers.some(offer => offer?.offer_key === THREE_WEEK_OFFER_KEY)) {
      return { ok: true, reason: "already_issued" };
    }
    if (state.getActivePosition() || jobs.canReceiveNewOffers?.() === false) {
      return { ok: false, reason: "already_employed" };
    }
    const offer = {
      career_id: "naeringsliv", career_name: "Økonomi og næringsliv",
      title: "Butikkmedarbeider", threshold: 0, points_at_offer: 0,
      employer_context: {
        type: "fictional_lifestory_employer",
        source: "wave_e_c21_d20_jobbtilbud",
        location: "fiktiv nærbutikk"
      }
    };
    const guard = globalScope.CivicationJobEligibilityRuntime?.getJobOfferEligibility?.(
      state.getState?.() || {}, offer, { active: null }
    );
    if (guard?.eligible === false) return { ok: false, reason: "career_eligibility", blockers: guard.blockers };
    // The existing Jobs gate performs all further checks and deduplicates.
    return jobs.pushOffer(offer);
  }

  // If Min dag loaded ahead of the shell, the persisted story archive is the
  // durable recovery source. No shadow employment or pending-offer currency.
  globalScope.addEventListener?.("civi:booted", () => { materializeEarnedJobOffer(); });
  globalScope.addEventListener?.("civi:lifestoryChanged", () => { materializeEarnedJobOffer(); });

  /**
   * Utfør en handling fra et Min dag-valg.
   * @param {{ type?: string, id?: string }|null|undefined} handling
   * @returns {{ utfoert: boolean, type: string|null }}
   */
  function perform(handling) {
    const type = handling && typeof handling === "object" ? String(handling.type || "") : "";
    if (!type) return { utfoert: false, type: null };

    if (type === "aapne_livsposisjoner") {
      if (!openCategory(HANDLING_TO_CATEGORY[type])) return { utfoert: false, type };
      // Valget er nettopp lagret. Hent forslaget fra historien før panelet
      // åpnes, også når valget bare endret flagg og ikke ga updateProfile.
      /** @type {any} */ (globalScope).CivicationLifePositionUI?.render?.();
      // Livsprofilen eies av activeJobCard under Karriere og åpnes med
      // seksjonens vanlige knapp. Ingen rolle eller jobb aktiveres her.
      const btn = /** @type {any} */ (globalScope).document?.querySelector?.("#activeJobSection [data-civi-mini-open]");
      if (!btn || typeof btn.click !== "function") return { utfoert: false, type };
      btn.click();
      return { utfoert: true, type };
    }

    if (type === "aapne_karriere" && handling?.id === THREE_WEEK_OFFER_ID) {
      materializeEarnedJobOffer();
      return { utfoert: openCategory("karriere"), type };
    }

    if (HANDLING_TO_CATEGORY[type]) {
      return { utfoert: openCategory(HANDLING_TO_CATEGORY[type]), type };
    }

    // Navigasjoner til History GO — byen er spillbrettet.
    if (type === "gaa_til_quiz" || type === "gaa_til_byen" || type === "gaa_til_debatt") {
      const g = /** @type {any} */ (globalScope);
      let href = "index.html#/map";
      if (type === "gaa_til_debatt") {
        const id = typeof handling.id === "string" ? handling.id.trim() : "";
        if (!id) return { utfoert: false, type }; // validatoren skal ha stoppet dette
        href = "index.html#/debate/" + encodeURIComponent(id);
      }
      try {
        if (g.location) {
          g.location.href = href;
          return { utfoert: true, type };
        }
      } catch { /* uten navigerbar kontekst (Node) */ }
      return { utfoert: false, type };
    }

    // Ukjent type skal ha blitt stoppet av validatoren — ikke gjett her.
    console.warn(`[CivicationLifestoryActions] ukjent handlingstype "${type}"`);
    return { utfoert: false, type };
  }

  const api = { HANDLING_LABELS, HANDLING_TO_CATEGORY, openCategory, materializeEarnedJobOffer, perform };
  /** @type {any} */ (globalScope).CivicationLifestoryActions = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
