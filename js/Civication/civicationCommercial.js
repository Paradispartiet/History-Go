/* ============================================================
   Civication Commercial (Shop) – stable runtime
   - Gir window.HG_CiviShop med getInv(), getPacks(), buyPack()
   - Lagrer inventory i localStorage
   - Filtrerer synlige butikker/pakker via History Go → Civication access
   ============================================================ */

(function () {

  const LS_INV = "hg_pc_inventory_v1";
  const LS_WALLET = "hg_pc_wallet_v1";

  const readJSON = (k, fallback) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJSON = (k, v) =>
    localStorage.setItem(k, JSON.stringify(v));

  // ============================================================
  // WALLET
  // ============================================================

  function getWallet() {

    if (typeof window.getPCWallet === "function") {
      const w = window.getPCWallet();
      if (w && typeof w.balance === "number") return w;
    }

    const w = readJSON(LS_WALLET, {
      balance: 0,
      last_tick_iso: null
    });

    return {
      balance: Number(w.balance || 0),
      last_tick_iso: w.last_tick_iso || null
    };
  }

  function setWallet(wallet) {

    if (!wallet || typeof wallet.balance !== "number") {
      wallet = { balance: 0, last_tick_iso: null };
    }

    if (typeof window.savePCWallet === "function") {
      window.savePCWallet(wallet);
      return;
    }

    writeJSON(LS_WALLET, wallet);
  }

  // ============================================================
  // INVENTORY
  // ============================================================

  function getInv() {

    const inv = readJSON(LS_INV, null);

    if (inv && typeof inv === "object") return inv;

    const fresh = { packs: {}, style_counts: {} };
    writeJSON(LS_INV, fresh);
    return fresh;
  }

  function saveInv(inv) {
    writeJSON(LS_INV, inv);
  }

  // ============================================================
  // DATA LOADING
  // ============================================================

  async function tryLoadPacks() {

    const paths = [
      "data/Civication/commercial_packs.json",
      "data/civication_packs.json",
      "data/commercial_packs.json",
      "data/packs.json"
    ];

    for (const p of paths) {
      try {

        if (window.DataHub?.fetchJSON) {
          const j = await window.DataHub.fetchJSON(p);
          if (Array.isArray(j)) return j;
          if (j && Array.isArray(j.packs)) return j.packs;
        } else {
          const r = await fetch(p, { cache: "no-store" });
          if (!r.ok) continue;
          const j = await r.json();
          if (Array.isArray(j)) return j;
          if (j && Array.isArray(j.packs)) return j.packs;
        }

      } catch {}
    }

    return [];
  }

  async function tryLoadStores() {
    const paths = [
      "data/Civication/stores.json",
      "data/stores.json"
    ];

    for (const p of paths) {
      try {
        if (window.DataHub?.fetchJSON) {
          const j = await window.DataHub.fetchJSON(p);
          if (Array.isArray(j)) return j;
          if (j && Array.isArray(j.stores)) return j.stores;
        } else {
          const r = await fetch(p, { cache: "no-store" });
          if (!r.ok) continue;
          const j = await r.json();
          if (Array.isArray(j)) return j;
          if (j && Array.isArray(j.stores)) return j.stores;
        }
      } catch {}
    }

    return [];
  }

  let _packsPromise = null;
  let _storesPromise = null;

  function getPacks() {
    if (!_packsPromise) {
      _packsPromise = tryLoadPacks();
    }
    return _packsPromise;
  }

  function getStores() {
    if (!_storesPromise) {
      _storesPromise = tryLoadStores();
    }
    return _storesPromise;
  }

  // ============================================================
  // ACCESS FILTERING
  // ============================================================

  function getStoreAccessPool() {
    const bridge = window.CivicationPlaceAccessBridge;
    return bridge?.getBucket ? bridge.getBucket("store") : [];
  }

  function getHousingAccessPool() {
    const bridge = window.CivicationPlaceAccessBridge;
    return bridge?.getBucket ? bridge.getBucket("housing") : [];
  }

  function normalizeList(xs) {
    return Array.isArray(xs) ? xs.map(String).filter(Boolean) : [];
  }

  function storeMatchesHistoryGoAccess(store) {
    const pool = new Set(getStoreAccessPool().map(String));
    const housing = new Set(getHousingAccessPool().map(String));

    if (!pool.size && !housing.size) return true;

    const storeType = String(store?.type || "").trim();
    const storeId = String(store?.id || "").trim();

    const mapping = {
      street_shop_generic: ["clothing"],
      work_shop_generic: ["equipment", "clothing"],
      hifi_shop_generic: ["audio"],
      car_dealer_generic: ["electronics", "equipment"],
      housing_market: ["home"]
    };

    const wanted = mapping[storeId] || mapping[storeType] || [storeType];
    if (storeId === "housing_market") {
      return wanted.some((k) => housing.has(String(k)) || pool.has(String(k)));
    }

    return wanted.some((k) => pool.has(String(k)));
  }

  function hasRequiredNeighborhoodAccess(pack) {
    const housing = new Set(getHousingAccessPool().map(String));
    const required = normalizeList(pack?.gating?.requires_neighborhood_any);
    if (!required.length) return true;

    const translated = required.map((key) => {
      if (key === "nabolag_basic_unlocked") return "stable_home";
      if (key === "bilforhandler_distrikt") return "central_comfort";
      return key;
    });

    return translated.some((key) => housing.has(String(key)));
  }

  async function getVisibleStores() {
    const stores = await getStores();
    return stores.filter(storeMatchesHistoryGoAccess);
  }

  async function getVisiblePacks() {
    const [packs, visibleStores] = await Promise.all([getPacks(), getVisibleStores()]);
    const allowedStoreIds = new Set(visibleStores.map((s) => String(s?.id || "")));

    return packs.filter((pack) => {
      const storeId = String(pack?.store_id || "");
      if (storeId && !allowedStoreIds.has(storeId)) return false;
      if (!hasRequiredNeighborhoodAccess(pack)) return false;
      return true;
    });
  }

  // ============================================================
  // BUY PACK
  // ============================================================

  async function buyPack(packId) {

    const packs = await getVisiblePacks();
    const pack = packs.find(p => String(p.id) === String(packId));

    if (!pack) {
      return { ok: false, reason: "PACK_NOT_FOUND" };
    }

    const price = Number(pack.price_pc ?? pack.price ?? 0);

    const wallet = getWallet();
    const balance = Number(wallet.balance || 0);

    if (balance < price) {
      return {
        ok: false,
        reason: "NOT_ENOUGH_PC",
        balance,
        price
      };
    }

    const inv = getInv();
    const key = String(pack.id);

    if (!inv.packs) inv.packs = {};
    if (!inv.style_counts) inv.style_counts = {};

    inv.packs[key] = true;

    const styles =
      Array.isArray(pack.styles)
        ? pack.styles
        : (Array.isArray(pack.tags)
            ? pack.tags
            : (Array.isArray(pack.effects?.style_tags_gain) ? pack.effects.style_tags_gain : []));

    for (const s of styles) {
      const st = String(s);
      if (!st) continue;
      inv.style_counts[st] =
        Number(inv.style_counts[st] || 0) + 1;
    }

    wallet.balance = balance - price;
    setWallet(wallet);

    saveInv(inv);

    window.dispatchEvent(new Event("updateProfile"));

    return {
      ok: true,
      packId: key,
      newBalance: wallet.balance
    };
  }

  // ============================================================
  // EXPORT
  // ============================================================

  window.HG_CiviShop = {
    getInv,
    getPacks,
    getStores,
    getVisibleStores,
    getVisiblePacks,
    buyPack
  };

})();
