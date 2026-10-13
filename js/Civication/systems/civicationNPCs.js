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
  let _roleCatalog = null;
  let _roleCatalogLoading = null;

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

  // An explicit canonical role_ref may exist on a fictional catalog NPC.
  // Load the shared index ONLY for an actual actor lookup, never on normal
  // mail lookup/render. Old mail IDs and display names remain unchanged.
  async function getRoleCatalog() {
    const contract = window.CivicationActorRoleContract;
    if (!contract?.buildRoleCatalog) return null;
    if (_roleCatalog) return _roleCatalog;
    if (_roleCatalogLoading) return _roleCatalogLoading;
    _roleCatalogLoading = (async () => {
      try {
        const response = await fetch("/data/Civication/roleWorlds/index.json", { cache: "no-store" });
        if (!response.ok) return null;
        return contract.buildRoleCatalog(await response.json());
      } catch (error) {
        if (window.DEBUG) console.warn("[CivicationNPCs] rolleindeks kunne ikke leses", error);
        return null;
      }
    })();
    try {
      const catalog = await _roleCatalogLoading;
      if (catalog) _roleCatalog = catalog;
      return catalog;
    } finally {
      _roleCatalogLoading = null;
    }
  }

  async function resolveActor(id) {
    await load();
    const npc = lookup(id);
    // Unmapped NPCs remain fully valid mail senders, but must never receive
    // an invented role by interpreting their title or social archetype.
    if (!npc?.role_ref) return null;
    const contract = window.CivicationActorRoleContract;
    const catalog = await getRoleCatalog();
    if (!catalog || !contract?.createActor) return null;
    try {
      return contract.createActor(catalog, {
        actor_id: "npc:" + npc.id,
        actor_type: "fictional_npc",
        role_ref: npc.role_ref
      });
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationNPCs] ugyldig eksplisitt rolle", npc.id, error);
      return null;
    }
  }

  window.CivicationNPCs = { load, lookup, all, resolveActor };

  // Last automatisk ved boot.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { load(); });
  } else {
    load();
  }
})();
