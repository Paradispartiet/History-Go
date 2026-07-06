// @ts-nocheck
(function(){
  "use strict";

  // Kompatibilitets-/demo-wrapper. Canonical Kunnskapsmøte-UI eies av
  // js/social/HGSpotmeetingUI.js (window.HG_SpotmeetingUI). Denne fila
  // beholdes bare fordi eldre flows og tester fortsatt laster den.
  const root = typeof window !== "undefined" ? window : globalThis;

  function getPlaceId(){
    const card = root.document?.getElementById?.("placeCard");
    const box = root.document?.getElementById?.("pcEventsBox");
    return String(
      card?.dataset?.currentPlaceId ||
      box?.querySelector?.("[data-hg-spotmeeting-onsite]")?.getAttribute?.("data-hg-spotmeeting-place") ||
      ""
    ).trim();
  }

  function installSocialMeetRefreshGuard(){
    if (root.__HG_SOCIAL_MEET_UI_REFRESH_GUARD__) return;
    root.__HG_SOCIAL_MEET_UI_REFRESH_GUARD__ = true;

    // HGSocialMeetUI har egen public enhance-funksjon. Her bruker vi en liten
    // placeId-guard slik at PlaceCard kan oppdateres uten at statuskortet
    // trigges i en unødvendig render-sløyfe.
    root.__HG_SOCIAL_MEET_UI_OBSERVER__?.disconnect?.();
    root.__HG_SOCIAL_MEET_UI_OBSERVER__ = null;

    let lastPlaceId = "";
    const refresh = () => {
      const box = root.document?.getElementById?.("pcEventsBox");
      if (!box) return;
      const placeId = getPlaceId();
      const hasLink = Boolean(box.querySelector?.("[data-hg-social-meet-onsite='1']"));
      if (!placeId || (hasLink && placeId === lastPlaceId)) return;
      lastPlaceId = placeId;
      root.HG_SocialMeetUI?.enhanceOnSiteLinks?.(box);
    };

    root.addEventListener?.("hg:spotmeetingChanged", () => root.HG_SocialMeetUI?.enhanceOnSiteLinks?.());
    root.document?.addEventListener?.("hg:placeCardUpdated", refresh);
    root.setTimeout?.(refresh, 0);
    root.setTimeout?.(refresh, 250);
    root.setTimeout?.(refresh, 1000);
  }

  function loadSocialMeetUI(){
    if (root.HG_SocialMeetUI) {
      root.HG_SocialMeetUI.bind?.();
      installSocialMeetRefreshGuard();
      return;
    }
    if (!root.document || root.document.getElementById("hgSocialMeetUIScript")) return;
    const script = root.document.createElement("script");
    script.id = "hgSocialMeetUIScript";
    script.src = "js/social/HGSocialMeetUI.js";
    script.defer = true;
    script.onload = installSocialMeetRefreshGuard;
    root.document.head?.appendChild(script);
  }

  function bind(){
    root.HG_SpotmeetingUI?.bind?.();
    loadSocialMeetUI();
  }

  root.HG_SpotmeetingPlaceCardDemo = {
    bind,
    isTestMode: () => {
      try { return root.localStorage?.getItem("HG_TEST_MODE") === "1"; }
      catch { return false; }
    },
    contextFor: (action, place) =>
      root.HG_SpotmeetingUI?.buildPlaceContext?.(place, {
        preferredAction: action,
        sourceSurface: "placeCardPeople"
      }),
    renderCandidates: (...args) =>
      root.HG_SpotmeetingUI?.renderCandidates?.(...args),
    sendInvite: (...args) =>
      root.HG_SpotmeetingUI?.sendInvite?.(...args)
  };

  bind();
}());
