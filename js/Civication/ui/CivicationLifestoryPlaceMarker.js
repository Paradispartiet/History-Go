// js/Civication/ui/CivicationLifestoryPlaceMarker.js
//
// «Min dag»-markøren på Civication-kartet: viser HVOR nå-scenen i Life Story
// foregår — byen er spillebrettet, ikke bare bakgrunn.
//
// Stedsoppløsningen er en ærlig ladder (ingen gjetting):
//   - arbeidsliv-scene -> arbeidsplassen: employer_context-bydel fra skallets
//     aktive posisjon når den finnes (mapZone -> bydelssenter-anker), ellers
//     merkelapp med arbeidsgiver/rollenavn uten kartanker.
//   - privatliv-scene  -> hjemmet: valgt bydel fra CivicationHome (mapZone),
//     ellers «Hjemme» uten kartanker.
//   - dagen er over    -> hjemme.
//
// Forankringen GJENBRUKER CivicationCityLayer.resolveLocationAnchor (samme
// projeksjon som steds-/vennemarkørene: skjermpiksler når en kartmotor er
// aktiv, normalisert prosent ellers, bydelssenter via mapZone). Uten anker
// dokkes markøren i kartets hjørne i stedet for å flyte feil — å vise stedet
// som tekst er bedre enn å plassere det galt.
//
// Kun visning: leser scene-info fra CivicationLifestoryUI.getCurrentSceneInfo,
// skriver aldri state. Inline-stilt (CSS-fillisten er låst, jf. CLAUDE.md).
// De rene hjelperne er dual-eksportert for Node-tester.

(function (globalScope) {
  "use strict";

  const MARKER_ID = "civiLifestoryPlaceMarker";

  /**
   * Ren: hent bydels-id fra skallets aktive posisjon (employer_context).
   * Godtar de feltnavnene skallet faktisk bruker; alt annet gir null.
   * @param {any} activePosition
   * @returns {string|null}
   */
  function employerZone(activePosition) {
    const ctx = activePosition && typeof activePosition === "object" ? activePosition.employer_context : null;
    if (!ctx || typeof ctx !== "object") return null;
    const zone = ctx.district || ctx.districtId || ctx.mapZone || null;
    return typeof zone === "string" && zone.trim() ? zone.trim() : null;
  }

  /**
   * Ren: scene-info + skall-avhengigheter -> hvor dagen foregår.
   * @param {{ threadType?: string|null, dagFerdig?: boolean, fase?: string, rolleNavn?: string|null }|null} sceneInfo
   *   fra CivicationLifestoryUI.getCurrentSceneInfo()
   * @param {{ activePosition?: any, homeDistrictId?: string|null, homeDistrictName?: string|null }} deps
   * @returns {{ kind: "jobb"|"hjem", label: string, mapZone: string|null }|null}
   *   null = ingen scene-info ennå (marker skjules).
   */
  function resolveSceneMapLoc(sceneInfo, deps) {
    if (!sceneInfo) return null;
    const d = deps || {};

    if (!sceneInfo.dagFerdig && sceneInfo.threadType === "arbeidsliv") {
      const active = d.activePosition;
      const workplace = active && typeof active === "object"
        ? String(active.brand_name || active.title || "").trim()
        : "";
      const label = "På jobb" + (workplace ? ": " + workplace : (sceneInfo.rolleNavn ? " som " + sceneInfo.rolleNavn.toLowerCase() : ""));
      return { kind: "jobb", label, mapZone: employerZone(active) };
    }

    // Privatliv — og dagen-er-over ender også hjemme.
    const homeName = typeof d.homeDistrictName === "string" && d.homeDistrictName.trim() ? d.homeDistrictName.trim() : null;
    const label = sceneInfo.dagFerdig
      ? "Dagen er over" + (homeName ? " · hjemme i " + homeName : "")
      : "Hjemme" + (homeName ? " i " + homeName : "");
    return { kind: "hjem", label, mapZone: d.homeDistrictId || null };
  }

  // ---------------------------------------------------------------------------
  // DOM-delen under kjører kun i nettleser (Civication.html med kart).
  // ---------------------------------------------------------------------------

  /** Skall-avhengigheter lest i sanntid — alle valgfrie. */
  function currentDeps() {
    const w = /** @type {any} */ (globalScope);
    const home = w.CivicationHome && w.CivicationHome.getState ? w.CivicationHome.getState() : null;
    const homeDistrictId = home ? (home.currentDistrictId || (home.home && home.home.district) || null) : null;
    const districts = Array.isArray(w.CIVI_MAP_DISTRICTS) ? w.CIVI_MAP_DISTRICTS : [];
    const dEntry = districts.find((x) => String(x && x.id) === String(homeDistrictId || ""));
    return {
      activePosition: w.CivicationState && w.CivicationState.getActivePosition ? w.CivicationState.getActivePosition() : null,
      homeDistrictId: homeDistrictId,
      homeDistrictName: dEntry && dEntry.name ? String(dEntry.name) : null
    };
  }

  function ensureMarkerEl() {
    const doc = /** @type {any} */ (globalScope).document;
    if (!doc) return null;
    const host = doc.getElementById("civiMapWorld");
    if (!host) return null;

    let el = doc.getElementById(MARKER_ID);
    if (el) return el;

    el = doc.createElement("div");
    el.id = MARKER_ID;
    el.setAttribute("role", "status");
    el.style.cssText = [
      "position:absolute",
      "z-index:40",
      "display:flex",
      "align-items:center",
      "gap:6px",
      "padding:4px 10px 4px 6px",
      "border-radius:999px",
      "background:rgba(16,20,28,0.82)",
      "border:1px solid rgba(255,255,255,0.22)",
      "color:#fff",
      "font:12px/1.3 system-ui,-apple-system,sans-serif",
      "pointer-events:none",
      "max-width:60%",
      "white-space:nowrap",
      "overflow:hidden",
      "text-overflow:ellipsis",
      "transform:translate(-50%,-120%)"
    ].join(";");

    const dot = doc.createElement("span");
    dot.style.cssText = "width:9px;height:9px;border-radius:50%;background:#ffd166;box-shadow:0 0 0 3px rgba(255,209,102,0.25);flex:0 0 auto";
    el.appendChild(dot);

    const text = doc.createElement("span");
    text.setAttribute("data-lifestory-marker-text", "");
    el.appendChild(text);

    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.appendChild(el);
    return el;
  }

  /** Plasser markøren: CityLayer-anker når mulig, ellers dokket i hjørnet. */
  function positionMarker(el, loc) {
    const w = /** @type {any} */ (globalScope);
    const anchorApi = w.CivicationCityLayer && w.CivicationCityLayer.resolveLocationAnchor;
    const anchor = loc.mapZone && typeof anchorApi === "function"
      ? anchorApi({ mapZone: loc.mapZone })
      : null;

    if (anchor && anchor.mode === "screen") {
      el.style.left = anchor.x.toFixed(1) + "px";
      el.style.top = anchor.y.toFixed(1) + "px";
      el.style.right = "auto";
      el.style.transform = "translate(-50%,-120%)";
      return "anchored";
    }
    if (anchor && anchor.mode === "normalized") {
      el.style.left = (anchor.x * 100).toFixed(2) + "%";
      el.style.top = (anchor.y * 100).toFixed(2) + "%";
      el.style.right = "auto";
      el.style.transform = "translate(-50%,-120%)";
      return "anchored";
    }
    // Dokket: synlig i kartets hjørne uten å påstå en posisjon vi ikke har.
    el.style.left = "10px";
    el.style.top = "10px";
    el.style.right = "auto";
    el.style.transform = "none";
    return "docked";
  }

  function refresh() {
    const w = /** @type {any} */ (globalScope);
    const info = w.CivicationLifestoryUI && w.CivicationLifestoryUI.getCurrentSceneInfo
      ? w.CivicationLifestoryUI.getCurrentSceneInfo()
      : null;
    const el = ensureMarkerEl();
    if (!el) return;

    const loc = resolveSceneMapLoc(info, currentDeps());
    if (!loc) { el.hidden = true; return; }

    el.hidden = false;
    const mode = positionMarker(el, loc);
    el.setAttribute("data-lifestory-marker-mode", mode);
    el.setAttribute("data-lifestory-marker-kind", loc.kind);
    const text = el.querySelector("[data-lifestory-marker-text]");
    if (text) text.textContent = "Min dag · " + loc.label;
    el.title = "Min dag · " + loc.label;
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    // Scenen skifter / skallet booter / hjem velges / kartet flytter seg.
    for (const eventName of ["civi:lifestoryChanged", "civi:booted", "civi:homeChanged", "civi:canvasMapTransformChanged", "updateProfile"]) {
      window.addEventListener(eventName, () => { try { refresh(); } catch { /* markøren må aldri velte noe */ } });
    }
    window.addEventListener("resize", () => { setTimeout(() => { try { refresh(); } catch { /* som over */ } }, 80); });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => { refresh(); });
    } else {
      refresh();
    }
  }

  const api = { resolveSceneMapLoc, employerZone, refresh, MARKER_ID };
  /** @type {any} */ (globalScope).CivicationLifestoryPlaceMarker = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
