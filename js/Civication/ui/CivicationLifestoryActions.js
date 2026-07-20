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
    gaa_til_quiz: "går til History GO",
    gaa_til_byen: "går ut i byen (History GO)",
    gaa_til_debatt: "går til debatten i History GO"
  };

  /** Handling -> skallkategori (footer-fanene i Civication.html). */
  const HANDLING_TO_CATEGORY = {
    velg_bosted: "personlig",
    aapne_butikk: "kommers",
    aapne_karriere: "karriere"
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

  /**
   * Utfør en handling fra et Min dag-valg.
   * @param {{ type?: string, id?: string }|null|undefined} handling
   * @returns {{ utfoert: boolean, type: string|null }}
   */
  function perform(handling) {
    const type = handling && typeof handling === "object" ? String(handling.type || "") : "";
    if (!type) return { utfoert: false, type: null };

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

  const api = { HANDLING_LABELS, HANDLING_TO_CATEGORY, openCategory, perform };
  /** @type {any} */ (globalScope).CivicationLifestoryActions = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
