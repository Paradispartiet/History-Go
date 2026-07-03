// js/Civication/core/civicationJsonStore.js
//
// Delt JSON-henter for Civication-runtimene. Flere motorer (MailRuntime,
// DailyMailBuilder, LifeMailRuntime, PeopleEngine) trenger de samme datafilene
// (mailplaner, mailfamilier, personfiler); med hver sin private cache hentet de
// samme fil dobbelt over nettet. Dette lageret gir:
//   - én fetch per sti uansett hvor mange motorer som spør (inflight-dedupe),
//   - verdi-cache inkludert 404 (null) — feilstier hamrer ikke serveren,
//   - synkron getCached(path) for lesing etter at noe er varmet.
//
// Motorene bruker lageret defensivt (fallback til egen fetch når fila lastes
// standalone i tester), så lasterekkefølge aldri er kritisk.

(function () {
  "use strict";

  const values = new Map();
  const inflight = new Map();

  function norm(path) {
    return String(path == null ? "" : path).trim();
  }

  async function fetchJson(path) {
    const p = norm(path);
    if (!p) return null;
    if (values.has(p)) return values.get(p);
    if (inflight.has(p)) return inflight.get(p);

    const promise = (async () => {
      try {
        const res = await fetch(p, { cache: "no-store" });
        if (!res || !res.ok) {
          values.set(p, null);
          return null;
        }
        const json = await res.json();
        values.set(p, json);
        return json;
      } catch (error) {
        if (window.DEBUG) console.warn("[CivicationJsonStore] kunne ikke laste", p, error);
        values.set(p, null);
        return null;
      } finally {
        inflight.delete(p);
      }
    })();

    inflight.set(p, promise);
    return promise;
  }

  function getCached(path) {
    const p = norm(path);
    return values.has(p) ? values.get(p) : undefined;
  }

  function invalidate(path) {
    const p = norm(path);
    if (!p) { values.clear(); inflight.clear(); return; }
    values.delete(p);
    inflight.delete(p);
  }

  window.CivicationJsonStore = {
    fetchJson,
    getCached,
    invalidate,
    _inspect() {
      return { cached: values.size, inflight: inflight.size };
    }
  };
})();
