// js/Civication/systems/civicationNPCs.js
// HGCivicationNPCs — felles NPC-katalog for Civication-mailer.
// Mailer kan referere `from: "<npc_id>"`. Dette skriptet laster
// alle data/Civication/npcs/<kategori>.json-filer og eksponerer
// lookup() så UI kan vise navngitte avsendere.

(function () {
  "use strict";

  const CATEGORIES = ["naeringsliv"];
  const _by = new Map();
  let _loaded = false;
  let _loading = null;

  async function load() {
    if (_loaded) return;
    if (_loading) return _loading;

    _loading = (async () => {
      for (const cat of CATEGORIES) {
        try {
          const url = `data/Civication/npcs/${cat}.json`;
          const r = await fetch(url, { cache: "no-store" });
          if (!r.ok) continue;
          const data = await r.json();
          for (const npc of (data?.npcs || [])) {
            const id = String(npc?.id || "").trim();
            if (id) _by.set(id, { ...npc, category: cat });
          }
        } catch (e) {
          if (window.DEBUG) console.warn("[CivicationNPCs] kunne ikke laste", cat, e);
        }
      }
      _loaded = true;
    })();

    return _loading;
  }

  function lookup(id) {
    const key = String(id || "").trim();
    if (!key) return null;
    return _by.get(key) || null;
  }

  function all() {
    return Array.from(_by.values());
  }

  window.CivicationNPCs = { load, lookup, all };

  // Last automatisk ved boot.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { load(); });
  } else {
    load();
  }
})();
