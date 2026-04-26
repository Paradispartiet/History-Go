// js/Civication/systems/civicationThreadBridge.js
// HGCivicationThreadBridge — laster mail-familier som inneholder
// `threads`-array (V2 blueprint-format) og eksponerer en lookup
// så vi kan finne en thread-mail ved id når en choice trigges.
//
// Hver mail i en thread har samme felter som en vanlig mail
// (id, from, place_id, subject, situation, choices ...).

(function () {
  "use strict";

  // Files som har V2-blueprint-format med `threads`-array.
  // Utvid listen etter hvert som flere familier konverteres.
  const V2_FAMILY_FILES = [
    "data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json"
  ];

  const _byId = new Map();
  let _loaded = false;
  let _loading = null;

  async function load() {
    if (_loaded) return;
    if (_loading) return _loading;

    _loading = (async () => {
      for (const url of V2_FAMILY_FILES) {
        try {
          const r = await fetch(url, { cache: "no-store" });
          if (!r.ok) continue;
          const cat = await r.json();
          for (const fam of (cat?.families || [])) {
            for (const t of (fam?.threads || [])) {
              const id = String(t?.id || "").trim();
              if (!id) continue;
              _byId.set(id, {
                ...t,
                mail_type: t.mail_type || cat.mail_type,
                mail_family: fam.id,
                role_scope: t.role_scope || cat.role_scope,
                category: cat.category
              });
            }
          }
        } catch (e) {
          if (window.DEBUG) console.warn("[ThreadBridge] kunne ikke laste", url, e);
        }
      }
      _loaded = true;
    })();

    return _loading;
  }

  function lookup(id) {
    const key = String(id || "").trim();
    if (!key) return null;
    return _byId.get(key) || null;
  }

  // Enkø en thread-mail i Civication-inboxen.
  function enqueueThread(threadId, options = {}) {
    const t = lookup(threadId);
    if (!t) {
      if (window.DEBUG) console.warn("[ThreadBridge] ukjent thread:", threadId);
      return false;
    }

    const inbox = window.CivicationState?.getInbox?.() || [];
    if (inbox.some(it => String(it?.event?.id || "").trim() === String(t.id).trim())) {
      return false;
    }

    const event = {
      id: t.id,
      mail_type: t.mail_type || "thread",
      mail_family: t.mail_family,
      role_scope: t.role_scope,
      phase: t.phase || "intro",
      priority: t.priority || 70,
      cooldown: 0,
      stage: "stable",
      from: t.from,
      place_id: t.place_id,
      subject: t.subject,
      situation: t.situation,
      choices: t.choices,
      _is_thread: true,
      _triggered_by: options.triggeredBy || null
    };

    inbox.unshift({ event, queuedAt: Date.now() });
    window.CivicationState?.setInbox?.(inbox);
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return true;
  }

  window.CivicationThreadBridge = { load, lookup, enqueueThread };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { load(); });
  } else {
    load();
  }
})();
