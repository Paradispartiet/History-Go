// @ts-nocheck
(function () {
  "use strict";

  const HG_SOCIAL_FORBIDDEN_FIELDS = Object.freeze([
    "gps",
    "latitude",
    "longitude",
    "coords",
    "location",
    "distance",
    "nearby",
    "visitHistory",
    "visitedPlaces",
    "lastSeen",
    "onlineNow",
    "followers",
    "following",
    "publicActivityFeed",
    "activityTimestamp"
  ]);

  const FORBIDDEN_LOOKUP = new Set(HG_SOCIAL_FORBIDDEN_FIELDS.map((key) => key.toLowerCase()));

  function assertNoSocialPrivacyLeak(payload, context) {
    const seen = new WeakSet();

    function scan(value, path) {
      if (!value || typeof value !== "object") return true;
      if (seen.has(value)) return true;
      seen.add(value);

      if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index += 1) {
          if (!scan(value[index], `${path}[${index}]`)) return false;
        }
        return true;
      }

      const keys = Object.keys(value);
      for (const key of keys) {
        const keyPath = path ? `${path}.${key}` : key;
        if (FORBIDDEN_LOOKUP.has(String(key).toLowerCase())) {
          console.warn("HG_SOCIAL_PRIVACY_VIOLATION", { context, key, path: keyPath });
          return false;
        }
        if (!scan(value[key], keyPath)) return false;
      }

      return true;
    }

    return scan(payload, "");
  }

  function loadHGSocialDemoScript(src) {
    if (typeof document === "undefined") return;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  }

  function loadHGSocialDemoPanel() {
    if (typeof document === "undefined") return;
    if (!document.getElementById("profileSocialLayer") && !document.getElementById("confirmed-meets")) return;
    loadHGSocialDemoScript("js/hgSocialDemoData.js");
    loadHGSocialDemoScript("js/hgSocialSmokePanel.js");
  }

  window.HG_SOCIAL_FORBIDDEN_FIELDS = HG_SOCIAL_FORBIDDEN_FIELDS;
  window.HG_SocialGuards = {
    assertNoSocialPrivacyLeak
  };
  window.assertNoSocialPrivacyLeak = assertNoSocialPrivacyLeak;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadHGSocialDemoPanel);
  else loadHGSocialDemoPanel();
})();
