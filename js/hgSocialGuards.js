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

  window.HG_SOCIAL_FORBIDDEN_FIELDS = HG_SOCIAL_FORBIDDEN_FIELDS;
  window.HG_SocialGuards = {
    assertNoSocialPrivacyLeak
  };
})();
