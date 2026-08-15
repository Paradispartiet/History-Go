// ============================================================
// HG PlaceCard Epoke – liten UI-runtime
// ------------------------------------------------------------
// Viser en diskret epokelinje i PlaceCard (#pcMeta), under
// kategori/meta, f.eks.:
//
//   Kunst · 1880–1910
//   Epoke: Modernisme og avantgarde
//
// Prinsipper:
// - Ingen hardkodede epoker. All tid/epoke resolves via
//   window.HGTimeResolver.resolvePlaceTime(place) som slår opp i
//   window.EPOKER_INDEX (bygget av js/epoker-runtime.js).
// - Patcher window.openPlaceCard trygt ETTER at js/ui/place-card.js
//   er lastet (samme mønster som leksikon_loader.js), i stedet for å
//   gjøre place-card.js mer skjør med stor inline-logikk.
// - Tåler steder uten år, uten epoke_id og uten domain.
// - Viser ALDRI "Ikke registrert": finnes ingen epoke, vises ingenting.
// ============================================================

(function () {
  "use strict";

  function txt(value) {
    return String(value ?? "").trim();
  }

  function num(value) {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  // "1880–1910" / "1880" / "" – tåler manglende eller delvise år.
  function formatYears(start, end) {
    const s = num(start);
    const e = num(end);
    if (s != null && e != null) return s === e ? String(s) : `${s}–${e}`;
    if (s != null) return String(s);
    if (e != null) return String(e);
    return "";
  }

  // Normaliser domenet til runtime-id (popkultur → populaerkultur osv.)
  // slik epoker-runtime allerede gjør. Faller trygt tilbake til rå verdi
  // for ukjente domener (toRuntimeCategoryId kaster på ukjente id-er).
  function runtimeDomain(place) {
    const raw =
      txt(place?.domain) ||
      txt(place?.category) ||
      txt(place?.categoryId) ||
      txt(place?.fag);
    if (!raw) return "";
    try {
      const mapped = window.DomainRegistry?.toRuntimeCategoryId?.(raw);
      return txt(mapped) || raw;
    } catch {
      return raw;
    }
  }

  function resolvePlaceTime(place) {
    const resolver = window.HGTimeResolver;
    if (!resolver || typeof resolver.resolvePlaceTime !== "function") return null;
    try {
      return resolver.resolvePlaceTime(place, { domain: runtimeDomain(place) });
    } catch (err) {
      console.warn("[HGPlaceCardEpoke] resolvePlaceTime feilet", err);
      return null;
    }
  }

  function renderEpokeLine(place) {
    const metaEl = document.getElementById("pcMeta");
    if (!metaEl || !place) return;

    // Idempotent: fjern tidligere epoke-augmentering før vi ev. legger til ny.
    metaEl.querySelectorAll(".pc-epoke").forEach((node) => node.remove());

    const res = resolvePlaceTime(place);
    const label = txt(res?.epokeLabel);

    // Ingen epoke funnet → vis ingenting (ingen "Ikke registrert"-tekst).
    if (!label) return;

    // Foretrekk epokens egen tidsspenn (f.eks. 1880–1910) for kontekst, og
    // fall tilbake til stedets egne år hvis epoken mangler årstall.
    const domain = txt(res?.domain);
    const epoke =
      res?.epokeId && window.EPOKER_INDEX?.byDomain?.[domain]?.byId?.[res.epokeId]
        ? window.EPOKER_INDEX.byDomain[domain].byId[res.epokeId]
        : null;
    const years =
      formatYears(epoke?.start_year, epoke?.end_year) ||
      formatYears(res?.startYear, res?.endYear);

    // Legg årene på kategori-chipen (første meta-linje) når begge finnes,
    // slik at linje 1 blir "Kunst · 1880–1910". Endrer ikke place-card.js.
    if (years) {
      const firstChip = /** @type {HTMLElement|null} */ (metaEl.querySelector(":scope > *:not(.pc-epoke)"));
      if (firstChip && txt(firstChip.textContent) && !firstChip.dataset.pcEpokeYears) {
        firstChip.dataset.pcEpokeYears = "1";
        firstChip.textContent = `${txt(firstChip.textContent)} · ${years}`;
      }
    }

    const line = document.createElement("div");
    line.className = "pc-epoke";
    line.textContent = `Epoke: ${label}`;
    metaEl.appendChild(line);
  }

  function patchOpenPlaceCard() {
    const original = window.openPlaceCard;
    if (typeof original !== "function" || original.__epokePatched) return false;

    window.openPlaceCard = async function (...args) {
      const result = await original.apply(this, args);
      try {
        // Sørg for at epoke-indexen er klar før vi resolver.
        if (window.HGEpokerRuntime?.ready) {
          await window.HGEpokerRuntime.ready;
        }
        renderEpokeLine(args[0]);
      } catch (err) {
        console.warn("[HGPlaceCardEpoke]", err);
      }
      return result;
    };
    window.openPlaceCard.__epokePatched = true;
    return true;
  }

  // place-card.js lastes før denne (app.js styrer rekkefølgen), men vær robust
  // dersom timingen skulle endre seg: prøv en liten stund om openPlaceCard mangler.
  if (!patchOpenPlaceCard()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (patchOpenPlaceCard() || tries > 50) clearInterval(timer);
    }, 50);
  }
})();
