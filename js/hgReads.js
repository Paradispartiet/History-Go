// js/hgReads.js
// ------------------------------------------------------------
// HGReads v1 — History Go-signal for "content engagement": leste stories, leste leksikon-noder
// og åpnede personer. Mirrors HGUnlocks/HGDebates: en persistert logg som History Go-flatene
// kaller når spilleren leser/åpner innhold. Civication leser den via delt localStorage
// (completion-bridgen) for å fullføre read_story / read_leksikon / open_person / read_profile.
// Ingen ny "kilde", bare en logg.
// ------------------------------------------------------------

(function () {
  "use strict";

  const KEY = "hg_reads_v1";

  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function load() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!x || typeof x !== "object") return { stories: {}, leksikon: {}, persons: {} };
      x.stories = x.stories && typeof x.stories === "object" ? x.stories : {};
      x.leksikon = x.leksikon && typeof x.leksikon === "object" ? x.leksikon : {};
      x.persons = x.persons && typeof x.persons === "object" ? x.persons : {};
      return x;
    } catch {
      return { stories: {}, leksikon: {}, persons: {} };
    }
  }

  function save(x) {
    try { localStorage.setItem(KEY, JSON.stringify(x)); } catch {}
  }

  function normId(s) {
    return String(s || "").trim();
  }

  // Generisk: skriv en oppføring i en bucket under en id, slå sammen ekstra felt.
  function put(bucket, id, extra) {
    const cleanId = normId(id);
    if (!cleanId) return null;

    const db = load();
    db[bucket] = db[bucket] || {};
    const now = Date.now();
    const wasNew = !db[bucket][cleanId];
    const row = db[bucket][cleanId] || { id: cleanId, ts_first: now };

    let changed = wasNew;
    Object.keys(extra || {}).forEach(function (k) {
      const v = normId(extra[k]);
      if (v && row[k] !== v) { row[k] = v; changed = true; }
    });

    db[bucket][cleanId] = row;
    if (changed) {
      row.ts_last = now;
      save(db);
      dispatchProfileUpdate();
    }

    try {
      window.dispatchEvent(new CustomEvent("hg:content-read", {
        detail: { bucket, id: cleanId }
      }));
    } catch {}

    return row;
  }

  // recordStory({ storyId, placeId, personId })
  /** @param {{ storyId?: string, placeId?: string, personId?: string }} [opts] */
  function recordStory({ storyId, placeId, personId } = {}) {
    return put("stories", storyId || placeId || personId, { placeId, personId });
  }

  // recordLeksikon({ leksikonId, categoryId, emneId })
  /** @param {{ leksikonId?: string, categoryId?: string, emneId?: string }} [opts] */
  function recordLeksikon({ leksikonId, categoryId, emneId } = {}) {
    return put("leksikon", leksikonId || emneId || categoryId, { categoryId, emneId });
  }

  // recordPerson({ personId }) — personprofil/popup åpnet
  /** @param {{ personId?: string }} [opts] */
  function recordPerson({ personId } = {}) {
    return put("persons", personId, {});
  }

  window.HGReads = {
    key: KEY,
    load,
    recordStory,
    recordLeksikon,
    recordPerson
  };
})();
