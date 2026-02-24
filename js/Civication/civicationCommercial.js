/* ============================================================
   Civication Commercial (Shop) – minimal runtime
   - Gir window.HG_CiviShop med getInv(), getPacks(), buyPack()
   - Lagrer inventory i localStorage
   ============================================================ */

(function () {
  const LS_INV = "hg_pc_inventory_v1";
  const LS_WALLET = "hg_pc_wallet_v1"; // fallback hvis du ikke har wallet-funksjoner

  const readJSON = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k) || ""); } catch { return fallback; }
  };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  function getWallet() {
  if (typeof window.getPCWallet === "function") {
    const w = window.getPCWallet();
    if (w && typeof w.balance === "number") {
      return w;
    }
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
    return window.savePCWallet(wallet);
  }

  writeJSON(LS_WALLET, wallet);
}

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

  // Packs kan ligge hvor som helst – denne prøver et par vanlige paths.
  async function tryLoadPacks() {
    const paths = [
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

  let _packsPromise = null;
  function getPacks() {
    if (!_packsPromise) _packsPromise = tryLoadPacks();
    return _packsPromise;
  }

  async function buyPack(packId) {
    const packs = await getPacks();
    const pack = packs.find(p => String(p.id) === String(packId));
    if (!pack) return { ok: false, reason: "PACK_NOT_FOUND" };

    const price = Number(pack.price_pc ?? pack.price ?? 0);
    const bal = getWallet();
    if (bal < price) return { ok: false, reason: "NOT_ENOUGH_PC", bal, price };

    const inv = getInv();
    const key = String(pack.id);

    if (!inv.packs) inv.packs = {};
    if (!inv.style_counts) inv.style_counts = {};

    // mark pack owned
    inv.packs[key] = true;

    // style counts (valgfritt) – hvis pack har styles/tags
    const styles = Array.isArray(pack.styles) ? pack.styles : (Array.isArray(pack.tags) ? pack.tags : []);
    for (const s of styles) {
      const st = String(s);
      if (!st) continue;
      inv.style_counts[st] = (Number(inv.style_counts[st] || 0) + 1);
    }

    setWallet(bal - price);
    saveInv(inv);

    window.dispatchEvent(new Event("updateProfile"));
    return { ok: true, packId: key, newBalance: getWallet() };
  }

  window.HG_CiviShop = {
    getInv,
    getPacks,
    buyPack
  };
})();
