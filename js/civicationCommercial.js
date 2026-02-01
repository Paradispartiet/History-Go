// js/civicationCommercial.js
// Minimal shop/wallet layer for Civication (V1)
// Safe-by-default: if no catalogs, shows empty shop.

(function () {
  const LS_WALLET = "hg_pc_wallet_v1";
  const LS_INV    = "hg_pc_inventory_v1";
  const LS_CATALOGS = "hg_pc_catalogs_v1";

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const v = JSON.parse(raw);
      return (v && typeof v === "object") ? v : fallback;
    } catch {
      return fallback;
    }
  }
  function writeJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
  }

  function getWallet() {
    const w = readJSON(LS_WALLET, null) || {};
    if (!Number.isFinite(Number(w.balance))) w.balance = 0;
    if (!w.last_tick_iso) w.last_tick_iso = null;
    return w;
  }

  function setWallet(w) {
    writeJSON(LS_WALLET, w);
  }

  function getInv() {
    const inv = readJSON(LS_INV, null) || {};
    if (!Array.isArray(inv.items)) inv.items = [];
    if (!inv.packs || typeof inv.packs !== "object") inv.packs = {};
    return inv;
  }

  function setInv(inv) {
    writeJSON(LS_INV, inv);
  }

  async function getCatalogs() {
    // 1) prefer local catalogs if present
    const cached = readJSON(LS_CATALOGS, null);
    if (cached && (Array.isArray(cached.stores) || Array.isArray(cached.packs))) {
      return {
        stores: Array.isArray(cached.stores) ? cached.stores : [],
        packs: Array.isArray(cached.packs) ? cached.packs : []
      };
    }

    // 2) fallback: empty shop
    return { stores: [], packs: [] };
  }

  async function buyPack(packId, storeId) {
    const catalogs = await getCatalogs();
    const packs = Array.isArray(catalogs.packs) ? catalogs.packs : [];
    const pack = packs.find(p => String(p?.id || "") === String(packId || ""));
    if (!pack) return { ok: false, reason: "unknown_pack" };

    const price = Number(pack.price_pc || 0);
    if (!Number.isFinite(price) || price < 0) return { ok: false, reason: "bad_price" };

    const inv = getInv();
    if (inv.packs && inv.packs[packId]) return { ok: true, already: true };

    const w = getWallet();
    if (Number(w.balance || 0) < price) return { ok: false, reason: "insufficient_funds" };

    w.balance = Number(w.balance || 0) - price;
    setWallet(w);

    inv.packs[packId] = { bought_iso: new Date().toISOString(), store_id: storeId || null };
    setInv(inv);

    return { ok: true };
  }

  // Expose global API expected by profile.js
  window.HG_CiviShop = {
    getWallet,
    getInv,
    getCatalogs,
    buyPack
  };
})();
