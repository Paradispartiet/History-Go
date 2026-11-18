/* ============================================================
   Civication Commercial (Shop) – stable runtime
   - Gir window.HG_CiviShop med getInv(), getPacks(), buyPack()
   - Lagrer inventory i localStorage
   - Filtrerer synlige butikker/pakker via History Go → Civication access
   - Leser valgt Civication-nabolag som bolig-/butikktilgang
   ============================================================ */

(function () {
  /**
   * @typedef {Record<string, any>} CiviCommercialRecord
   * @typedef {CiviCommercialRecord & { balance?: number, last_tick_iso?: string | null }} CiviCommercialWallet
   * @typedef {CiviCommercialRecord & { packs?: Record<string, boolean>, ownedItems?: string[], style_counts?: Record<string, number> }} CiviCommercialInventory
   * @typedef {CiviCommercialRecord & { id?: string, store_id?: string, price_pc?: number, price?: number, styles?: unknown[], tags?: unknown[], effects?: CiviCommercialRecord }} CiviCommercialPack
   * @typedef {CiviCommercialRecord & { id?: string, type?: string }} CiviCommercialStore
   */

  const LS_INV = "hg_pc_inventory_v1";
  const LS_WALLET = "hg_pc_wallet_v1";
  const LS_CANONICAL_WALLET = "hg_civi_wallet_v1";

  /**
   * @param {string} k
   * @param {any} fallback
   * @returns {any}
   */
  const readJSON = (k, fallback) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  /**
   * @param {string} k
   * @param {any} v
   * @returns {void}
   */
  const writeJSON = (k, v) =>
    localStorage.setItem(k, JSON.stringify(v));

  // ============================================================
  // WALLET
  // ============================================================

  /**
   * @param {CiviCommercialWallet | CiviCommercialRecord | number | null | undefined} wallet
   * @returns {CiviCommercialWallet}
   */
  function normalizeWallet(wallet) {
    const normalizeBalance = (value) => {
      const n = Number(value || 0);
      return Number.isFinite(n) ? n : 0;
    };

    if (typeof wallet === "number") {
      return { balance: normalizeBalance(wallet), last_tick_iso: null };
    }

    if (!wallet || typeof wallet !== "object") {
      return { balance: 0, last_tick_iso: null };
    }

    return {
      ...wallet,
      balance: normalizeBalance(wallet.balance ?? wallet.pc ?? 0),
      last_tick_iso: wallet.last_tick_iso || null
    };
  }

  /**
   * @returns {CiviCommercialWallet}
   */
  function getLegacyWallet() {
    return normalizeWallet(readJSON(LS_WALLET, {
      balance: 0,
      last_tick_iso: null
    }));
  }

  /**
   * @returns {CiviCommercialWallet}
   */
  function getWallet() {
    const state = window.CivicationState;

    if (state && typeof state.getWallet === "function") {
      const stateWallet = normalizeWallet(state.getWallet());
      // Zero is a real balance, not evidence of an unmigrated wallet.
      // Import old savings only before the canonical owner has persisted state.
      if (localStorage.getItem(LS_CANONICAL_WALLET) === null) {
        const legacyWallet = getLegacyWallet();
        if (legacyWallet.balance <= 0) return stateWallet;
        stateWallet.balance = legacyWallet.balance;
        if (typeof state.updateWallet === "function") {
          state.updateWallet(stateWallet);
        }
      }

      return stateWallet;
    }

    return getLegacyWallet();
  }

  /**
   * @param {CiviCommercialWallet | CiviCommercialRecord | number | null | undefined} wallet
   * @returns {void}
   */
  function setWallet(wallet) {
    const state = window.CivicationState;
    const current = state && typeof state.getWallet === "function"
      ? state.getWallet() : getLegacyWallet();
    // Compatibility callers may pass a number or just { balance }. Neither
    // may erase payroll days, settlement anchors or livelihood idempotency.
    const patch = wallet && typeof wallet === "object"
      ? { ...wallet, balance: wallet.balance ?? wallet.pc ?? current?.balance }
      : { balance: wallet };
    const next = normalizeWallet({ ...normalizeWallet(current), ...patch });

    if (state && typeof state.updateWallet === "function") {
      state.updateWallet(next);
    }

    const legacyWallet = readJSON(LS_WALLET, {});
    writeJSON(LS_WALLET, {
      ...(legacyWallet && typeof legacyWallet === "object" ? legacyWallet : {}),
      balance: next.balance,
      pc: next.balance,
      last_tick_iso: next.last_tick_iso || null
    });
  }

  window.getPCWallet = function () {
    return Number(getWallet().balance || 0);
  };

  window.savePCWallet = function (wallet) {
    setWallet(wallet);
    return getWallet();
  };

  // ============================================================
  // INVENTORY
  // ============================================================

  /**
   * @returns {CiviCommercialInventory}
   */
  function getInv() {

    /** @type {CiviCommercialInventory | CiviCommercialRecord | null} */
    const inv = readJSON(LS_INV, null);

    if (inv && typeof inv === "object") {
      inv.packs = inv.packs && typeof inv.packs === "object" ? inv.packs : {};
      inv.ownedItems = Array.isArray(inv.ownedItems) ? inv.ownedItems.map(String) : [];
      inv.style_counts = inv.style_counts && typeof inv.style_counts === "object" ? inv.style_counts : {};
      return inv;
    }

    const fresh = { packs: {}, ownedItems: [], style_counts: {} };
    if (window.CivicationState?.getWallet?.()?.nok_v1?.active === true) return fresh;
    writeJSON(LS_INV, fresh);
    return fresh;
  }

  /**
   * @param {CiviCommercialInventory | CiviCommercialRecord} inv
   * @returns {void}
   */
  function saveInv(inv) {
    writeJSON(LS_INV, inv);
  }

  // ============================================================
  // DATA LOADING
  // ============================================================

  /**
   * @returns {Promise<CiviCommercialPack[]>}
   */
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
          /** @type {CiviCommercialPack[] | { packs?: CiviCommercialPack[] } | null} */
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

  /**
   * @returns {Promise<CiviCommercialStore[]>}
   */
  async function tryLoadStores() {
    const paths = [
      "data/Civication/stores.json",
      "data/stores.json"
    ];

    for (const p of paths) {
      try {
        if (window.DataHub?.fetchJSON) {
          /** @type {CiviCommercialStore[] | { stores?: CiviCommercialStore[] } | null} */
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

  /** @type {Promise<CiviCommercialPack[]> | null} */
  let _packsPromise = null;
  /** @type {Promise<CiviCommercialStore[]> | null} */
  let _storesPromise = null;

  /**
   * @returns {Promise<CiviCommercialPack[]>}
   */
  function getPacks() {
    const nok = window.CivicationState?.getWallet?.()?.nok_v1;
    if (nok?.active === true) return Promise.resolve(nok.version === 1 && Array.isArray(nok.config?.shopProducts)
      ? nok.config.shopProducts.map(p => ({ ...p, nok_product: true })) : []);
    if (!_packsPromise) {
      _packsPromise = tryLoadPacks();
    }
    return _packsPromise;
  }

  /**
   * @returns {Promise<CiviCommercialStore[]>}
   */
  function getStores() {
    const nok = window.CivicationState?.getWallet?.()?.nok_v1;
    if (nok?.active === true) return Promise.resolve(nok.version === 1 && Array.isArray(nok.config?.shopStores) ? nok.config.shopStores : []);
    if (!_storesPromise) {
      _storesPromise = tryLoadStores();
    }
    return _storesPromise;
  }

  // ============================================================
  // ACCESS FILTERING
  // ============================================================

  function getSelectedNeighborhoodAccess() {
    const access = window.CivicationHome?.getSelectedDistrictAccess?.();

    return access && typeof access === "object"
      ? access
      : { housing: [], store: [] };
  }

  function getStoreAccessPool() {
    const bridge = window.CivicationPlaceAccessBridge;
    const bucket = /** @type {unknown[]} */ (
      bridge?.getBucket ? bridge.getBucket("store") : []
    );
    const neighborhood = /** @type {any} */ (getSelectedNeighborhoodAccess());
    const selectedStore = normalizeList(neighborhood?.store);

    return Array.from(new Set(bucket.map(String).concat(selectedStore)));
  }

  function getHousingAccessPool() {
    const bridge = window.CivicationPlaceAccessBridge;
    const bucket = /** @type {unknown[]} */ (
      bridge?.getBucket ? bridge.getBucket("housing") : []
    );
    const neighborhood = /** @type {any} */ (getSelectedNeighborhoodAccess());
    const selectedHousing = normalizeList(neighborhood?.housing);

    return Array.from(new Set(bucket.map(String).concat(selectedHousing)));
  }

  /**
   * @param {unknown[]} xs
   * @returns {string[]}
   */
  function normalizeList(xs) {
    return Array.isArray(xs) ? xs.map(String).filter(Boolean) : [];
  }

  /**
   * @param {CiviCommercialStore | CiviCommercialRecord} store
   * @returns {boolean}
   */
  function storeMatchesHistoryGoAccess(store) {
    const pool = new Set(getStoreAccessPool().map(String));
    const housing = new Set(getHousingAccessPool().map(String));

    if (!pool.size && !housing.size) return true;

    const storeType = String(store?.type || "").trim();
    const storeId = String(store?.id || "").trim();

    const mapping = {
      grocery_reference: ["food", "home"],
      street_shop_generic: ["clothing"],
      work_shop_generic: ["equipment", "clothing"],
      hifi_shop_generic: ["audio"],
      car_dealer_generic: ["electronics", "equipment"],
      housing_market: ["home", "stable_home"]
    };

    const wanted = mapping[storeId] || mapping[storeType] || [storeType];
    if (storeId === "housing_market") {
      return wanted.some((k) => housing.has(String(k)) || pool.has(String(k)));
    }

    return wanted.some((k) => pool.has(String(k)));
  }

  /**
   * @param {CiviCommercialPack | CiviCommercialRecord} pack
   * @returns {boolean}
   */
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

  /**
   * @param {string} badgeId
   * @returns {string[]}
   */
  function getBadgeIdAliases(badgeId) {
    const id = String(badgeId || "").trim();
    if (!id) return [];

    const aliases = {
      populaerkultur: "popkultur",
      popkultur: "populaerkultur",
      næringsliv: "naeringsliv",
      naeringsliv: "næringsliv"
    };

    return Array.from(new Set([id, aliases[id]].filter(Boolean)));
  }

  /**
   * @param {unknown} merit
   * @returns {number}
   */
  function getMeritPoints(merit) {
    const points = merit && typeof merit === "object"
      ? Number(/** @type {{ points?: unknown }} */ (merit).points)
      : Number(merit);

    return Number.isFinite(points) ? points : 0;
  }

  /**
   * @param {CiviCommercialPack | CiviCommercialStore | CiviCommercialRecord} item
   * @returns {boolean}
   */
  function hasRequiredBadgeAccess(item) {
    const required = normalizeList(item?.gating?.requires_badges_any);
    if (!required.length) return true;

    const merits = readJSON("merits_by_category", {});
    const meritMap = merits && typeof merits === "object" ? merits : {};

    return required.some((badgeId) => (
      getBadgeIdAliases(badgeId).some((alias) => (
        getMeritPoints(/** @type {Record<string, unknown>} */ (meritMap)[alias]) > 0
      ))
    ));
  }

  /**
   * @returns {Promise<CiviCommercialStore[]>}
   */
  async function getVisibleStores() {
    const stores = await getStores();
    return stores.filter((store) => (
      storeMatchesHistoryGoAccess(store) && hasRequiredBadgeAccess(store)
    ));
  }

  /**
   * @returns {Promise<CiviCommercialPack[]>}
   */
  async function getVisiblePacks() {
    const [packs, visibleStores] = await Promise.all([getPacks(), getVisibleStores()]);
    const allowedStoreIds = new Set(visibleStores.map((s) => String(s?.id || "")));

    return packs.filter((pack) => {
      const storeId = String(pack?.store_id || "");
      if (storeId && !allowedStoreIds.has(storeId)) return false;
      if (!hasRequiredNeighborhoodAccess(pack)) return false;
      if (!hasRequiredBadgeAccess(pack)) return false;
      return true;
    });
  }

  let purchaseSequence = 0;
  function createPurchaseRequest() {
    return window.crypto?.randomUUID?.() || `purchase:${Date.now()}:${Math.random()}:${++purchaseSequence}`;
  }

  /** @param {string} productId @param {CiviCommercialWallet} [wallet] @returns {CiviCommercialRecord} */
  function getNokProductStock(productId, wallet = window.CivicationState?.getWallet?.()) {
    const nok = wallet?.nok_v1;
    if (nok?.active !== true || nok.version !== 1) return { ok: false, reason: "NOK_NOT_ACTIVE" };
    const products = Array.isArray(nok.config?.shopProducts) ? nok.config.shopProducts : [];
    const matches = products.filter(p => p?.id === productId);
    const product = matches[0];
    if (matches.length !== 1 || product.category !== "food" || product.repeatable !== true
        || !Number.isSafeInteger(product.packageQuantity) || product.packageQuantity <= 0
        || !["g", "ml"].includes(product.baseUnit) || !Number.isSafeInteger(product.consumptionStep)
        || product.consumptionStep <= 0 || product.consumptionStep > product.packageQuantity)
      return { ok: false, reason: "CONSUMPTION_NOT_MAPPED" };
    const shopping = nok.shopping || {};
    if (typeof shopping !== "object" || Array.isArray(shopping)
        || (shopping.quantities != null && (typeof shopping.quantities !== "object" || Array.isArray(shopping.quantities)))
        || (shopping.openedUnits != null && (typeof shopping.openedUnits !== "object" || Array.isArray(shopping.openedUnits))))
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    const packages = shopping.quantities?.[productId] ?? 0;
    const opened = shopping.openedUnits?.[productId] ?? 0;
    const available = packages * product.packageQuantity + opened;
    if (!Number.isSafeInteger(packages) || packages < 0 || !Number.isSafeInteger(opened)
        || opened < 0 || opened >= product.packageQuantity || !Number.isSafeInteger(available))
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    return { ok: true, product, packages, opened, available };
  }

  function getNokPantry() {
    const wallet = window.CivicationState?.getWallet?.();
    const products = wallet?.nok_v1?.config?.shopProducts;
    if (!Array.isArray(products)) return [];
    return products.map(p => getNokProductStock(p?.id, wallet)).filter(s => s.ok && s.available > 0);
  }

  /** @param {string} productId @param {string} requestId @returns {CiviCommercialRecord} */
  function consumeNokProduct(productId, requestId) {
    const owner = window.CivicationState;
    const wallet = owner?.getWallet?.();
    const stock = getNokProductStock(productId, wallet);
    if (!stock.ok) return stock;
    if (typeof requestId !== "string" || !requestId.trim() || requestId.length > 128)
      return { ok: false, reason: "CONSUMPTION_REQUEST_REQUIRED" };
    const shopping = wallet.nok_v1.shopping || { purchases: [], quantities: {} };
    const used = shopping.consumptions ?? [];
    if (!Array.isArray(used) || used.some(c => !c || typeof c.requestId !== "string")
        || new Set(used.map(c => c.requestId)).size !== used.length
        || !Array.isArray(shopping.purchases) || shopping.purchases.some(p => !p || typeof p.requestId !== "string")
        || new Set(shopping.purchases.map(p => p.requestId)).size !== shopping.purchases.length
        || !shopping.quantities || Array.isArray(shopping.quantities)
        || (shopping.openedUnits != null && (typeof shopping.openedUnits !== "object" || Array.isArray(shopping.openedUnits))))
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    if (shopping.purchases.some(p => !p || p.requestId === requestId)) return { ok: false, reason: "ACTION_REQUEST_CONFLICT" };
    const previous = used.find(c => c.requestId === requestId);
    if (previous) return previous.productId === productId ? { ok: true, skipped: true }
      : { ok: false, reason: "ACTION_REQUEST_CONFLICT" };
    const product = stock.product;
    if (stock.available <= 0) return { ok: false, reason: "NOT_ENOUGH_STOCK" };
    const amount = Math.min(stock.available, product.consumptionStep);
    const date = window.CivicationCalendar?.getGameDate?.();
    if (!date) return { ok: false, reason: "INVALID_NOK_CALENDAR" };
    const remaining = stock.available - amount;
    owner.updateWallet({ ...wallet, nok_v1: { ...wallet.nok_v1, shopping: { ...shopping,
      quantities: { ...shopping.quantities, [productId]: Math.floor(remaining / product.packageQuantity) },
      openedUnits: { ...(shopping.openedUnits || {}), [productId]: remaining % product.packageQuantity },
      consumptions: [...used, { requestId, productId, amount,
        baseUnit: product.baseUnit, gameDateISO: date, kind: product.consumptionKind }] } } });
    return { ok: true, productId, remaining, amount, baseUnit: product.baseUnit };
  }

  // Recipe amounts are explicit game portions in raw package units.
  // Reference cost describes the ingredients, never a second wallet charge.
  /** @returns {CiviCommercialRecord[]} */
  function getNokMeals() {
    const meals = window.CivicationState?.getWallet?.()?.nok_v1?.config?.shopMeals;
    return Array.isArray(meals) ? meals.map(m => getNokMealPreview(m?.id)).filter(m => m.ok) : [];
  }

  /** @returns {CiviCommercialRecord} */
  function getNokMealPreview(mealId, wallet = window.CivicationState?.getWallet?.()) {
    const nok = wallet?.nok_v1;
    if (nok?.active !== true || nok.version !== 1) return { ok: false, reason: "NOK_NOT_ACTIVE" };
    const matches = Array.isArray(nok.config?.shopMeals) ? nok.config.shopMeals.filter(m => m?.id === mealId) : [];
    const meal = matches[0];
    if (matches.length !== 1 || typeof meal.title !== "string" || !meal.title.trim()
        || !Array.isArray(meal.ingredients) || !meal.ingredients.length
        || new Set(meal.ingredients.map(i => i?.productId)).size !== meal.ingredients.length)
      return { ok: false, reason: "MEAL_NOT_MAPPED" };
    const ingredients = [];
    let referenceCents = 0;
    for (const item of meal.ingredients) {
      const stock = getNokProductStock(item?.productId, wallet);
      if (!stock.ok || !Number.isSafeInteger(item?.amount) || item.amount <= 0 || item.baseUnit !== stock.product.baseUnit)
        return { ok: false, reason: "MEAL_NOT_MAPPED" };
      const product = stock.product;
      const cents = Math.round(product.priceNok * 100);
      if (typeof product.priceNok !== "number" || !Number.isSafeInteger(cents) || cents <= 0
          || Math.abs(product.priceNok * 100 - cents) > 0.000001
          || typeof product.sourceId !== "string" || !product.sourceId.startsWith("https://"))
        return { ok: false, reason: "NOK_PRICE_NOT_MAPPED" };
      referenceCents += cents * item.amount / product.packageQuantity;
      ingredients.push({ productId: product.id, title: product.title, amount: item.amount,
        baseUnit: item.baseUnit, available: stock.available, missing: Math.max(0, item.amount - stock.available),
        sourceId: product.sourceId, priceCheckedOn: product.checkedOn });
    }
    if (!Number.isSafeInteger(Math.round(referenceCents))) return { ok: false, reason: "NOK_PRICE_NOT_MAPPED" };
    return { ok: true, mealId, title: meal.title, ingredients, referenceCostCents: Math.round(referenceCents),
      canPrepare: ingredients.every(i => i.missing === 0) };
  }

  /** @returns {CiviCommercialRecord} */
  function previewNokMealPlan(servings, wallet = window.CivicationState?.getWallet?.()) {
    if (wallet?.nok_v1?.active !== true || wallet.nok_v1.version !== 1)
      return { ok: false, reason: "NOK_NOT_ACTIVE" };
    if (!servings || typeof servings !== "object" || Array.isArray(servings))
      return { ok: false, reason: "INVALID_MEAL_PLAN" };
    const selected = {};
    const required = new Map();
    let portions = 0;
    for (const [mealId, count] of Object.entries(servings).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
      if (!Number.isSafeInteger(count) || count < 0 || count > 99 || portions + count > 99)
        return { ok: false, reason: "INVALID_MEAL_PLAN" };
      const meal = getNokMealPreview(mealId, wallet);
      if (!meal.ok) return meal;
      if (!count) continue;
      selected[mealId] = count; portions += count;
      for (const item of meal.ingredients) {
        const amount = (required.get(item.productId) || 0) + item.amount * count;
        if (!Number.isSafeInteger(amount)) return { ok: false, reason: "INVALID_MEAL_PLAN" };
        required.set(item.productId, amount);
      }
    }
    const ingredients = [];
    let shoppingCostCents = 0;
    let referenceCents = 0;
    for (const [id, amount] of required) {
      const stock = getNokProductStock(id, wallet);
      if (!stock.ok) return stock;
      const product = stock.product;
      const priceCents = Math.round(product.priceNok * 100);
      const missing = Math.max(0, amount - stock.available);
      const packagesToBuy = Math.ceil(missing / product.packageQuantity);
      const purchaseCostCents = packagesToBuy * priceCents;
      shoppingCostCents += purchaseCostCents;
      referenceCents += priceCents * amount / product.packageQuantity;
      if (!Number.isSafeInteger(purchaseCostCents) || !Number.isSafeInteger(shoppingCostCents)
          || !Number.isSafeInteger(Math.round(referenceCents))) return { ok: false, reason: "INVALID_MEAL_PLAN" };
      ingredients.push({ productId: id, title: product.title, baseUnit: product.baseUnit, required: amount,
        available: stock.available, missing, packagesToBuy, unitLabel: product.unitLabel,
        packagePriceCents: priceCents, purchaseCostCents, sourceId: product.sourceId, priceCheckedOn: product.checkedOn });
    }
    const balanceCents = Math.round(wallet.balance * 100);
    if (typeof wallet.balance !== "number" || !Number.isSafeInteger(balanceCents)
        || Math.abs(wallet.balance * 100 - balanceCents) > 0.000001)
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    if (!Number.isSafeInteger(balanceCents - shoppingCostCents)) return { ok: false, reason: "INVALID_MEAL_PLAN" };
    return { ok: true, servings: selected, portions, ingredients, shoppingCostCents,
      referenceCostCents: Math.round(referenceCents), canAfford: balanceCents >= shoppingCostCents,
      projectedBalanceCents: balanceCents - shoppingCostCents };
  }

  // One dated entry is one game portion; dates use UTC arithmetic, never wall time.
  const mealSlots = ["breakfast", "lunch", "dinner", "supper"];
  function mealWeekDates(startDate) {
    if (typeof startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null;
    const start = new Date(startDate + "T00:00:00.000Z");
    if (!Number.isFinite(start.getTime()) || start.toISOString().slice(0, 10) !== startDate) return null;
    const dates = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10));
    return dates.every(date => /^\d{4}-\d{2}-\d{2}$/.test(date)) ? dates : null;
  }

  /** @returns {CiviCommercialRecord} */
  function previewNokMealWeek(startDate, entries, wallet = window.CivicationState?.getWallet?.()) {
    const dates = mealWeekDates(startDate);
    if (!dates || !Array.isArray(entries) || entries.length > 28)
      return { ok: false, reason: "INVALID_MEAL_WEEK" };
    const normalized = [];
    const keys = new Set();
    const servings = {};
    for (const entry of entries) {
      if (!entry || !dates.includes(entry.date) || !mealSlots.includes(entry.slot) || typeof entry.mealId !== "string")
        return { ok: false, reason: "INVALID_MEAL_WEEK" };
      const key = entry.date + ":" + entry.slot;
      if (keys.has(key)) return { ok: false, reason: "INVALID_MEAL_WEEK" };
      keys.add(key);
      const meal = getNokMealPreview(entry.mealId, wallet);
      if (!meal.ok) return meal;
      servings[entry.mealId] = (servings[entry.mealId] || 0) + 1;
      normalized.push({ date: entry.date, slot: entry.slot, mealId: entry.mealId });
    }
    normalized.sort((a, b) => a.date.localeCompare(b.date) || mealSlots.indexOf(a.slot) - mealSlots.indexOf(b.slot));
    const view = previewNokMealPlan(servings, wallet);
    return view.ok ? { ...view, version: 2, startDate, dates, entries: normalized } : view;
  }

  /** @returns {CiviCommercialRecord} */
  function getNokMealWeek() {
    const wallet = window.CivicationState?.getWallet?.();
    const plan = wallet?.nok_v1?.shopping?.mealPlan;
    if (plan?.version !== 2) return { ok: false, reason: "NO_MEAL_WEEK" };
    return previewNokMealWeek(plan.startDate, plan.entries, wallet);
  }

  /** @returns {CiviCommercialRecord} */
  function saveNokMealWeek(startDate, entries) {
    const owner = window.CivicationState;
    const wallet = owner?.getWallet?.();
    const view = previewNokMealWeek(startDate, entries, wallet);
    if (!view.ok) return view;
    const shopping = wallet.nok_v1.shopping ?? { purchases: [], quantities: {} };
    if (!shopping || typeof shopping !== "object" || Array.isArray(shopping)
        || !Array.isArray(shopping.purchases) || !shopping.quantities || typeof shopping.quantities !== "object"
        || Array.isArray(shopping.quantities) || (shopping.consumptions != null && !Array.isArray(shopping.consumptions)))
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    const today = window.CivicationCalendar?.getGameDate?.();
    if (!mealWeekDates(today)) return { ok: false, reason: "INVALID_NOK_CALENDAR" };
    // Past pending entries can be retained/removed, but cannot be invented or changed.
    const prior = shopping.mealPlan?.version === 2 ? getNokMealWeek() : null;
    for (const entry of view.entries) {
      const key = entry.date + ":" + entry.slot;
      if ((shopping.consumptions || []).some(c => c?.planEntryKey === key)
          || (entry.date < today && !(prior?.ok && prior.entries.some(old =>
            old.date === entry.date && old.slot === entry.slot && old.mealId === entry.mealId))))
        return { ok: false, reason: "MEAL_DATE_UNAVAILABLE" };
    }
    const mealPlan = { version: 2, startDate, entries: view.entries };
    if (JSON.stringify(shopping.mealPlan) === JSON.stringify(mealPlan)) return { ...view, skipped: true };
    owner.updateWallet({ ...wallet, nok_v1: { ...wallet.nok_v1, shopping: { ...shopping, mealPlan } } });
    return view;
  }

  /** @returns {CiviCommercialRecord} */
  function getNokMealPlan() {
    const plan = window.CivicationState?.getWallet?.()?.nok_v1?.shopping?.mealPlan;
    if (plan?.version === 2) return getNokMealWeek();
    if (plan != null && (plan.version !== 1 || !plan.servings)) return { ok: false, reason: "INVALID_MEAL_PLAN" };
    return previewNokMealPlan(plan?.servings ?? {});
  }

  /** @returns {CiviCommercialRecord} */
  function saveNokMealPlan(servings) {
    const owner = window.CivicationState;
    const wallet = owner?.getWallet?.();
    const view = previewNokMealPlan(servings, wallet);
    if (!view.ok) return view;
    const shopping = wallet.nok_v1.shopping ?? { purchases: [], quantities: {} };
    if (!shopping || typeof shopping !== "object" || Array.isArray(shopping)
        || !Array.isArray(shopping.purchases) || !shopping.quantities || typeof shopping.quantities !== "object"
        || Array.isArray(shopping.quantities)) return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    const mealPlan = { version: 1, servings: view.servings };
    if (JSON.stringify(shopping.mealPlan) === JSON.stringify(mealPlan)) return { ...view, skipped: true };
    owner.updateWallet({ ...wallet, nok_v1: { ...wallet.nok_v1, shopping: { ...shopping, mealPlan } } });
    return view;
  }

  /** @returns {CiviCommercialRecord} */
  function consumeNokMeal(mealId, requestId, planEntryKey = null) {
    const owner = window.CivicationState;
    const wallet = owner?.getWallet?.();
    const view = getNokMealPreview(mealId, wallet);
    if (!view.ok) return view;
    if (typeof requestId !== "string" || !requestId.trim() || requestId.length > 128)
      return { ok: false, reason: "CONSUMPTION_REQUEST_REQUIRED" };
    const shopping = wallet.nok_v1.shopping || { purchases: [], quantities: {} };
    const used = shopping.consumptions ?? [];
    if (!Array.isArray(used) || used.some(c => !c || typeof c.requestId !== "string")
        || new Set(used.map(c => c.requestId)).size !== used.length
        || !Array.isArray(shopping.purchases) || shopping.purchases.some(p => !p || typeof p.requestId !== "string")
        || new Set(shopping.purchases.map(p => p.requestId)).size !== shopping.purchases.length)
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    if (shopping.purchases.some(p => p.requestId === requestId)) return { ok: false, reason: "ACTION_REQUEST_CONFLICT" };
    const previous = used.find(c => c.requestId === requestId);
    if (previous) return previous.kind === "meal" && previous.mealId === mealId && (previous.planEntryKey ?? null) === planEntryKey ? { ok: true, skipped: true }
      : { ok: false, reason: "ACTION_REQUEST_CONFLICT" };
    if (!view.canPrepare) return { ok: false, reason: "NOT_ENOUGH_STOCK", ingredients: view.ingredients };
    const date = window.CivicationCalendar?.getGameDate?.();
    if (!date) return { ok: false, reason: "INVALID_NOK_CALENDAR" };
    let planPatch = {};
    if (planEntryKey !== null) {
      const week = getNokMealWeek();
      const entry = week.ok && week.entries.find(e => e.date + ":" + e.slot === planEntryKey && e.mealId === mealId);
      if (!entry || entry.date !== date || used.some(c => c.planEntryKey === planEntryKey))
        return { ok: false, reason: "MEAL_DATE_UNAVAILABLE" };
      planPatch = { mealPlan: { version: 2, startDate: week.startDate,
        entries: week.entries.filter(e => e !== entry) } };
    } else if (shopping.mealPlan?.version === 2) {
      const week = getNokMealWeek();
      if (!week.ok) return week;
      // Ad-hoc preparation never completes an unrelated dated slot.
    } else if (shopping.mealPlan != null) {
      if (shopping.mealPlan.version !== 1) return { ok: false, reason: "INVALID_MEAL_PLAN" };
      const pending = previewNokMealPlan(shopping.mealPlan.servings, wallet);
      if (!pending.ok) return pending;
      if (pending.servings[mealId] > 0) {
        const servings = { ...pending.servings, [mealId]: pending.servings[mealId] - 1 };
        if (!servings[mealId]) delete servings[mealId];
        planPatch = { mealPlan: { version: 1, servings } };
      }
    }
    const quantities = { ...(shopping.quantities || {}) };
    const openedUnits = { ...(shopping.openedUnits || {}) };
    for (const item of view.ingredients) {
      const stock = getNokProductStock(item.productId, wallet);
      const remaining = stock.available - item.amount;
      quantities[item.productId] = Math.floor(remaining / stock.product.packageQuantity);
      openedUnits[item.productId] = remaining % stock.product.packageQuantity;
    }
    owner.updateWallet({ ...wallet, nok_v1: { ...wallet.nok_v1, shopping: { ...shopping, quantities, openedUnits, ...planPatch,
      consumptions: [...used, { requestId, kind: "meal", mealId, ...(planEntryKey !== null ? { planEntryKey } : {}), title: view.title, gameDateISO: date,
        referenceCostCents: view.referenceCostCents, ingredients: view.ingredients.map(({ available, missing, ...item }) => item) }] } } });
    return { ok: true, mealId, referenceCostCents: view.referenceCostCents };
  }

  /** @param {string} packId @param {string} [requestId] @returns {CiviCommercialRecord} */
  function buyNokProduct(packId, requestId) {
    const owner = window.CivicationState;
    const wallet = owner?.getWallet?.();
    const nok = wallet?.nok_v1;
    if (nok?.active !== true || nok.version !== 1) return { ok: false, reason: "NOK_NOT_ACTIVE" };
    if (typeof requestId !== "string" || !requestId.trim() || requestId.length > 128)
      return { ok: false, reason: "PURCHASE_REQUEST_REQUIRED" };
    const products = Array.isArray(nok.config?.shopProducts) ? nok.config.shopProducts : [];
    const matches = products.filter(p => p?.id === packId);
    if (matches.length !== 1) return { ok: false, reason: "NOK_PRICE_NOT_MAPPED" };
    const product = matches[0];
    const stores = Array.isArray(nok.config?.shopStores) ? nok.config.shopStores : [];
    const store = stores.find(s => s?.id === product.store_id);
    if (!store || !storeMatchesHistoryGoAccess(store) || !hasRequiredBadgeAccess(store)
        || !hasRequiredNeighborhoodAccess(product) || !hasRequiredBadgeAccess(product))
      return { ok: false, reason: "PACK_NOT_FOUND" };
    const price = product.priceNok;
    const priceCents = Math.round(price * 100);
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(priceCents)
        || Math.abs(price * 100 - priceCents) > 0.000001 || typeof product.sourceId !== "string"
        || !product.sourceId.startsWith("https://") || typeof product.unitLabel !== "string" || !product.unitLabel.trim()
        || typeof product.checkedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(product.checkedOn)
        || product.repeatable !== true || product.category !== "food")
      return { ok: false, reason: "NOK_PRICE_NOT_MAPPED" };
    const shopping = nok.shopping || { purchases: [], quantities: {} };
    if (!Array.isArray(shopping.purchases) || !shopping.quantities || typeof shopping.quantities !== "object"
        || Array.isArray(shopping.quantities) || shopping.purchases.some(p => !p || typeof p.requestId !== "string")
        || new Set(shopping.purchases.map(p => p.requestId)).size !== shopping.purchases.length)
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    const consumed = shopping.consumptions ?? [];
    if (!Array.isArray(consumed) || consumed.some(c => !c || typeof c.requestId !== "string")
        || new Set(consumed.map(c => c.requestId)).size !== consumed.length)
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    if (consumed.some(c => c.requestId === requestId)) return { ok: false, reason: "ACTION_REQUEST_CONFLICT" };
    if (product.packageQuantity != null && !getNokProductStock(packId, wallet).ok)
      return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    const previous = shopping.purchases.find(p => p.requestId === requestId);
    if (previous) return previous.productId === packId ? { ok: true, skipped: true, packId }
      : { ok: false, reason: "PURCHASE_REQUEST_CONFLICT" };
    const cents = Math.round(wallet.balance * 100);
    const quantity = shopping.quantities[packId] ?? 0;
    if (typeof wallet.balance !== "number" || !Number.isFinite(wallet.balance) || !Number.isSafeInteger(cents)
        || Math.abs(wallet.balance * 100 - cents) > 0.000001 || !Number.isSafeInteger(quantity) || quantity < 0
        || !Number.isSafeInteger(quantity + 1)) return { ok: false, reason: "INVALID_SHOPPING_STATE" };
    if (cents < priceCents) return { ok: false, reason: "NOT_ENOUGH_PC", balance: wallet.balance, price };
    const date = window.CivicationCalendar?.getGameDate?.();
    if (!date) return { ok: false, reason: "INVALID_NOK_CALENDAR" };
    const purchase = { requestId, productId: packId, title: product.title, unitLabel: product.unitLabel,
      sourceId: product.sourceId, priceCheckedOn: product.checkedOn, amountNok: price, quantity: 1, gameDateISO: date };
    owner.updateWallet({ ...wallet, balance: (cents - priceCents) / 100, nok_v1: { ...nok,
      shopping: { ...shopping, purchases: [...shopping.purchases, purchase],
        quantities: { ...shopping.quantities, [packId]: quantity + 1 } } } });
    return { ok: true, packId, newBalance: (cents - priceCents) / 100 };
  }

  // ============================================================
  // BUY PACK
  // ============================================================

  /**
   * @param {string} packId
   * @param {string} [requestId]
   * @returns {Promise<CiviCommercialRecord>}
   */
  async function buyPack(packId, requestId) {

    const packs = await getVisiblePacks();
    const pack = packs.find(p => String(p.id) === String(packId));

    if (!pack) {
      return { ok: false, reason: "PACK_NOT_FOUND" };
    }

    if (window.CivicationState?.getWallet?.()?.nok_v1?.active === true) return buyNokProduct(packId, requestId);
    if (pack.nok_product) return { ok: false, reason: "NOK_NOT_ACTIVE" };
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

    /** @type {CiviCommercialInventory} */
    const inv = getInv();
    const key = String(pack.id);

    if (!inv.packs) inv.packs = {};
    if (!Array.isArray(inv.ownedItems)) inv.ownedItems = [];
    if (!inv.style_counts) inv.style_counts = {};

    inv.packs[key] = true;
    if (!inv.ownedItems.includes(key)) inv.ownedItems.push(key);

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
    createPurchaseRequest,
    getNokProductStock,
    getNokPantry,
    consumeNokProduct,
    getNokMeals,
    getNokMealPreview,
    consumeNokMeal,
    previewNokMealWeek,
    getNokMealWeek,
    saveNokMealWeek,
    previewNokMealPlan,
    getNokMealPlan,
    saveNokMealPlan,
    getWallet,
    getInv,
    getPacks,
    getStores,
    getVisibleStores,
    getVisiblePacks,
    buyPack
  };

})();
