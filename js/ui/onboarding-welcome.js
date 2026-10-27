// @ts-nocheck
// js/ui/onboarding-welcome.js
// HGOnboarding — vises én gang per nettleser ved første besøk.
// Snarveier til kart/posisjon, Finn fauna, Finn flora, Stories, Lesespor, Språkatlas, Psykologirommet, profil og Civication.
//
// Persisterer dismiss via hg_onboarding_shown_v1.
// Kan også åpnes manuelt via window.openOnboarding().

(function () {
  "use strict";

  const FLAG_KEY = "hg_onboarding_shown_v1";
  const MODAL_ID = "hgOnboardingModal";
  const MODAL_Z_INDEX = "2147483646";

  function bindDismissControl(control) {
    if (!control) return;

    const dismiss = (event) => {
      try { event?.preventDefault?.(); } catch {}
      try { event?.stopPropagation?.(); } catch {}
      close();
    };

    control.addEventListener("click", dismiss);
    control.addEventListener("pointerup", dismiss);
    control.addEventListener("touchend", dismiss, { passive: false });
  }

  function isMappedPlace(place) {
    if (place?.lat == null || place?.lon == null || place.lat === "" || place.lon === "") return false;
    const lat = Number(place.lat);
    const lon = Number(place.lon);
    return !!place?.id && !place.hidden && !place.stub && place.coordStatus !== "invalid"
      && Number.isFinite(lat) && lat >= -90 && lat <= 90
      && Number.isFinite(lon) && lon >= -180 && lon <= 180;
  }

  function nearestPlace(position, places) {
    const lat = Number(position?.lat);
    const lon = Number(position?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    let nearest = null;
    let distance = Infinity;
    for (const place of Array.isArray(places) ? places : []) {
      if (!isMappedPlace(place)) continue;
      const d = typeof window.distMeters === "function"
        ? window.distMeters({ lat, lon }, { lat: Number(place.lat), lon: Number(place.lon) })
        : Infinity;
      if (Number.isFinite(d) && d < distance) { nearest = place; distance = d; }
    }
    return nearest;
  }

  async function openNearestPlace() {
    window.HGAppRouter?.toMap?.();
    let pos = window.HGPos?.getPos?.() || null;
    if (!pos) pos = await window.HGPos?.request?.() || null;
    if (!pos) {
      window.showToast?.("Kartet er åpnet. Tillat posisjon for å finne nærmeste sted.");
      return false;
    }

    const place = nearestPlace(pos, window.PLACES);
    if (!place) {
      window.HGMap?.setUser?.(Number(pos.lat), Number(pos.lon), { fly: true });
      window.showToast?.("Fant ingen registrerte steder nær denne posisjonen.");
      return false;
    }

    // Route through canonical MapView: fly to the place and open PlaceCard
    // on moveend. Navigation alone must never award a visit.
    if (typeof window.HGAppRouter?.toPlace === "function") {
      window.HGAppRouter.toPlace(place.id);
    } else if (!window.HGMapView?.openPlace?.(place.id)) {
      window.showToast?.("Kunne ikke åpne nærmeste sted.");
      return false;
    }
    return true;
  }

  async function openPsychologyRoom() {
    if (!window.HGPsychologyRoomEntry?.open) {
      await new Promise((resolve, reject) => {
        let script = document.querySelector('script[src="js/ui/psychology-room-entry.js"]');
        if (!script) {
          script = document.createElement("script");
          script.src = "js/ui/psychology-room-entry.js";
          script.async = false;
          document.body.appendChild(script);
        }
        if (window.HGPsychologyRoomEntry?.open) { resolve(); return; }
        script.addEventListener("load", resolve, { once: true });
        script.addEventListener("error", () => reject(new Error("Psychology Room entry unavailable")), { once: true });
      });
    }
    if (!window.HGPsychologyRoomEntry?.open) throw new Error("Psychology Room entry not loaded");
    return window.HGPsychologyRoomEntry.open();
  }

  function build() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "hg-onboarding-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    modal.style.zIndex = MODAL_Z_INDEX;
    modal.style.pointerEvents = "auto";
    modal.style.touchAction = "manipulation";

    modal.innerHTML = `
      <div class="hg-onb-inner" role="dialog" aria-modal="true" aria-labelledby="hgOnboardingTitle" aria-describedby="hgOnboardingIntro">
        <button class="hg-onb-close" type="button" aria-label="Lukk velkomsten">✕</button>
        <header class="hg-onb-head">
          <p class="hg-onb-kicker">UTFORSK • OPPDAG • LÆR</p>
          <h2 class="hg-onb-title" id="hgOnboardingTitle">Velkommen til <span>History Go</span></h2>
          <p class="hg-onb-sub" id="hgOnboardingIntro">Utforsk steder, historier og kunnskap. Bruk snarveiene nedenfor til å gå rett inn i History Go.</p>
        </header>
        <ul class="hg-onb-steps">
          <li class="hg-onb-feature"><span class="hg-onb-step-icon" aria-hidden="true">🗺️</span><div><strong><button type="button" class="hg-onb-card-link" data-hg-welcome-action="nearby">Utforsk kartet og besøk steder <span aria-hidden="true">↗</span></button></strong><p>Se hva som har skjedd rundt deg. Finn steder på kartet, dra dit og registrer besøket når du faktisk er på stedet.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🐾</span><div><strong><a class="hg-onb-card-link" href="finn-fauna.html">Finn fauna <span aria-hidden="true">↗</span></a></strong><p>Utforsk dyr, fugler og insekter. Lær å kjenne igjen arter og se hvilke du har samlet gjennom quiz.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🌿</span><div><strong><a class="hg-onb-card-link" href="finn-flora.html">Finn flora <span aria-hidden="true">↗</span></a></strong><p>Utforsk planter, trær og blomster. Se kjennetegn, voksesteder og arter i samlingen din.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">📚</span><div><strong><button type="button" class="hg-onb-card-link" data-hg-welcome-action="stories">Stories <span aria-hidden="true">↗</span></button></strong><p>Les fortellinger om mennesker, hendelser og steder. Utforsk historiene som knytter fortiden til omgivelsene dine.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">📖</span><div><strong><button type="button" class="hg-onb-card-link" data-hg-welcome-action="lesespor">Lesespor <span aria-hidden="true">↗</span></button></strong><p>Finn tekster, artikler og kilder som gir nye perspektiver på historie, steder og samfunn.</p></div></li>
          <li class="hg-onb-sprakatlas"><span class="hg-onb-step-icon" aria-hidden="true">🗣️</span><div><strong><a class="hg-onb-card-link" href="sprakatlas.html">Språkatlas Norge <span aria-hidden="true">↗</span></a></strong><p>Utforsk norske dialekter og talemål. Se hvordan ord, uttale og språktrekk varierer mellom steder og regioner.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🧠</span><div><strong><button type="button" class="hg-onb-card-link" data-hg-welcome-action="psychology">Psykologirommet <span aria-hidden="true">↗</span></button></strong><p>Utforsk psykologiske temaer, teorier og øvelser. Reflekter over hvordan vi tenker, føler og handler.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🎯</span><div><strong>Ta quiz og samle merker</strong><p>Test kunnskapen din om steder, personer og fagområder. Samle merker og oppdag hva du mestrer.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">🏆</span><div><strong><a class="hg-onb-card-link" href="knowledge.html">Se hva du har samlet <span aria-hidden="true">↗</span></a></strong><p>Se oversikter over steder du har besøkt, kunnskap, historiske personer og merker du har oppnådd.</p></div></li>
          <li><span class="hg-onb-step-icon" aria-hidden="true">👤</span><div><strong><a class="hg-onb-card-link" href="profile.html">Min profil <span aria-hidden="true">↗</span></a></strong><p>Følg fremgangen din og finn samlingene, oppdagelsene og aktiviteten din samlet på ett sted.</p></div></li>
          <li class="hg-onb-civication"><span class="hg-onb-step-icon" aria-hidden="true">🏛️</span><div><strong><a class="hg-onb-card-link" href="Civication.html">Opplev Civication <span aria-hidden="true">↗</span></a></strong><p>Civication er et interaktivt læringsmiljø der du kan utforske interessene dine, ta quizer og kvalifisere deg til spennende roller og jobber. I en simulert livsverden får du prøve ut ulike muligheter, utvikle ferdighetene dine og forme din egen vei.</p></div></li>
        </ul>
        <footer class="hg-onb-actions">
          <button type="button" class="hg-onb-primary" data-action="start">Start History Go <span aria-hidden="true">→</span></button>
        </footer>
      </div>`

    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    bindDismissControl(modal.querySelector(".hg-onb-close"));
    bindDismissControl(modal.querySelector('[data-action="start"]'));
    // Regular page links also mark onboarding as completed before navigation.
    modal.querySelectorAll(".hg-onb-card-link[href]").forEach((anchor) => {
      anchor.addEventListener("click", close);
    });
    modal.querySelectorAll("[data-hg-welcome-action]").forEach((control) => {
      control.addEventListener("click", async (event) => {
        event.preventDefault();
        const action = control.getAttribute("data-hg-welcome-action");
        close();
        try {
          if (action === "nearby") await openNearestPlace();
          if (action === "lesespor") await window.HGLesespor?.openAll?.();
          if (action === "psychology") await openPsychologyRoom();
          if (action === "stories") await window.HGStories?.openAll?.();
        } catch (error) {
          console.warn("[HGOnboarding.openDestination]", action, error);
          window.showToast?.("Kunne ikke åpne innholdet. Prøv igjen.");
        }
      });
    });
    return modal;
  }

  function close() {
    const m = document.getElementById(MODAL_ID);
    if (!m) return;
    m.style.display = "none";
    m.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKey);
    try { localStorage.setItem(FLAG_KEY, "1"); } catch {}
    window.dispatchEvent(new Event("hg:onboardingClosed"));
  }

  function onKey(e) { if (e.key === "Escape") close(); }

  function open() {
    const m = build();
    m.style.display = "flex";
    m.style.pointerEvents = "auto";
    m.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onKey);
    window.dispatchEvent(new Event("hg:onboardingOpened"));
  }

  function whenFullyInteractive(fn) {
    let appReady = window.__HG_APP_READY__ === true || document.body?.classList.contains("hg-loaded");
    let routerReady = window.__HG_ROUTER_STARTED__ === true;
    let fired = false;

    const maybeRun = () => {
      if (fired || !appReady || !routerReady) return;
      fired = true;
      window.removeEventListener("hg:appReady", onAppReady);
      window.removeEventListener("hg:routerReady", onRouterReady);
      fn();
    };

    const onAppReady = () => {
      appReady = true;
      maybeRun();
    };

    const onRouterReady = () => {
      routerReady = true;
      maybeRun();
    };

    if (!appReady) window.addEventListener("hg:appReady", onAppReady);
    if (!routerReady) window.addEventListener("hg:routerReady", onRouterReady);
    maybeRun();
  }

  function maybeShowOnFirstVisit() {
    try {
      if (localStorage.getItem(FLAG_KEY) === "1") return;
      // A Civication deep link carries a live mission. Show that mission first;
      // leave onboarding available for the next ordinary History Go visit.
      const mission = JSON.parse(localStorage.getItem("hg_civication_mode_v1") || "null");
      if (mission && mission.active === true) return;
    } catch { return; }

    whenFullyInteractive(() => {
      setTimeout(open, 250);
    });
  }

  window.openOnboarding = open;
  window.HGOnboarding = { open, close, maybeShowOnFirstVisit, openNearestPlace, nearestPlace, FLAG_KEY };

  // The logo replaces the failed Hurtigmeny shortcut. Never navigate away
  // from the current map/place state just to open the welcome start surface.
  if (typeof document.getElementById === "function") {
    document.getElementById("hgHomeLogo")?.addEventListener("click", () => {
      window.HGHeaderMenu?.close?.();
      open();
    });
  }

  // Other History Go headers can link here and request the same start surface.
  // Wait for the app router so deep-link handling is not interrupted.
  const requestedWelcome = typeof window.location?.search === "string" && typeof URLSearchParams === "function"
    && new URLSearchParams(window.location.search).get("welcome") === "1";
  if (requestedWelcome) {
    whenFullyInteractive(() => {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("welcome");
      window.history.replaceState(window.history.state, "", cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
      open();
    });
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", maybeShowOnFirstVisit);
  } else {
    maybeShowOnFirstVisit();
  }
})();