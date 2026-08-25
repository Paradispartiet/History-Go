// ============================================================
// HG PlaceCard Epoke – liten UI-runtime
// ------------------------------------------------------------
// Viser en diskret epokelinje i PlaceCard (#pcMeta), under kategori/meta.
// Epokelinjen åpner den dedikerte tidslinjeviseren; viewer-runtime lastes
// lazy første gang brukeren trenger den eller en delt epoke-URL åpnes.
// ============================================================

(function () {
  "use strict";

  let epokeViewerLoadPromise = null;
  let patchedOpenPlaceCard = null;

  function txt(value) {
    return String(value ?? "").trim();
  }

  function num(value) {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function formatYears(start, end) {
    const s = num(start);
    const e = num(end);
    if (s != null && e != null) return s === e ? String(s) : `${s}–${e}`;
    if (s != null) return String(s);
    if (e != null) return String(e);
    return "";
  }

  function runtimeDomain(place) {
    const raw = txt(place?.domain) || txt(place?.category) || txt(place?.categoryId) || txt(place?.fag);
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

  function getEpokeViewer() {
    return /** @type {{open?: Function, openFromUrl?: Function}|undefined} */ (
      /** @type {any} */ (window).HGEpokeViewer
    );
  }

  function loadEpokeViewer() {
    const readyViewer = getEpokeViewer();
    if (readyViewer?.open) return Promise.resolve(readyViewer);
    if (epokeViewerLoadPromise) return epokeViewerLoadPromise;

    epokeViewerLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-hg-epoke-viewer="1"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(getEpokeViewer() || null), { once: true });
        existing.addEventListener("error", () => reject(new Error("epoke-viewer load failed")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = new URL("js/ui/epoke-viewer.js", document.baseURI).toString();
      script.async = true;
      script.dataset.hgEpokeViewer = "1";
      script.addEventListener("load", () => resolve(getEpokeViewer() || null), { once: true });
      script.addEventListener("error", () => reject(new Error("epoke-viewer load failed")), { once: true });
      document.head.appendChild(script);
    }).catch((err) => {
      epokeViewerLoadPromise = null;
      throw err;
    });

    return epokeViewerLoadPromise;
  }

  async function openEpokeViewer(place, resolution) {
    try {
      const currentViewer = getEpokeViewer();
      const viewer = currentViewer?.open ? currentViewer : await loadEpokeViewer();
      if (!viewer?.open) throw new Error("HGEpokeViewer.open mangler");
      return await viewer.open({ place, resolution });
    } catch (err) {
      console.warn("[HGPlaceCardEpoke] epokeviser kunne ikke åpnes", err);
      window.showToast?.("Kunne ikke åpne epoketidslinjen");
      return null;
    }
  }

  async function openSharedEpokeUrl() {
    const params = new URL(window.location.href).searchParams;
    if (!params.has("epoke") && !params.has("epoke_domain")) return null;
    try {
      const viewer = getEpokeViewer()?.openFromUrl ? getEpokeViewer() : await loadEpokeViewer();
      return await viewer?.openFromUrl?.();
    } catch (err) {
      console.warn("[HGPlaceCardEpoke] delt epoke-URL kunne ikke åpnes", err);
      return null;
    }
  }

  function renderEpokeLine(place) {
    const metaEl = document.getElementById("pcMeta");
    if (!metaEl || !place) return;
    metaEl.querySelectorAll(".pc-epoke").forEach((node) => node.remove());

    const res = resolvePlaceTime(place);
    const resolvedLabel = txt(res?.epokeLabel);
    const label = resolvedLabel || "Ikke registrert";
    const domain = txt(res?.domain);
    const epoke = res?.epokeId && window.EPOKER_INDEX?.byDomain?.[domain]?.byId?.[res.epokeId]
      ? window.EPOKER_INDEX.byDomain[domain].byId[res.epokeId]
      : null;
    const years = formatYears(epoke?.start_year, epoke?.end_year) || formatYears(res?.startYear, res?.endYear);

    if (years) {
      const firstChip = /** @type {HTMLElement|null} */ (metaEl.querySelector(":scope > *:not(.pc-epoke)"));
      if (firstChip && txt(firstChip.textContent) && !firstChip.dataset.pcEpokeYears) {
        firstChip.dataset.pcEpokeYears = "1";
        firstChip.textContent = `${txt(firstChip.textContent)} · ${years}`;
      }
    }

    const line = document.createElement("button");
    line.type = "button";
    line.className = "pc-epoke";
    line.textContent = `Epoke: ${label}`;
    line.dataset.epokeStatus = resolvedLabel ? "resolved" : "unknown";
    line.setAttribute("aria-label", `Åpne epoketidslinje: ${label}`);
    line.title = "Åpne epoketidslinje";
    line.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void openEpokeViewer(place, res);
    });
    metaEl.appendChild(line);
    return line;
  }

  async function render(place) {
    if (window.HGEpokerRuntime?.ready) await window.HGEpokerRuntime.ready;
    const currentPlaceId = txt(document.getElementById("placeCard")?.dataset?.currentPlaceId);
    const incomingPlaceId = txt(place?.id || place?.placeId);
    if (currentPlaceId && incomingPlaceId && currentPlaceId !== incomingPlaceId) return null;
    return renderEpokeLine(place);
  }

  function patchOpenPlaceCard() {
    const original = window.openPlaceCard;
    if (original === patchedOpenPlaceCard) return true;
    if (typeof original !== "function") return false;

    const patched = async function (...args) {
      const result = await original.apply(this, args);
      try {
        await render(args[0]);
      } catch (err) {
        console.warn("[HGPlaceCardEpoke]", err);
      }
      return result;
    };
    patchedOpenPlaceCard = patched;
    window.openPlaceCard = patched;
    return true;
  }

  if (!patchOpenPlaceCard()) {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (patchOpenPlaceCard() || tries > 50) clearInterval(timer);
    }, 50);
  }

  Object.assign(window, { HGPlaceCardEpoke: { render, openEpokeViewer, openSharedEpokeUrl } });
  void openSharedEpokeUrl();
})();
