// =======================================================
// Capital Engine v4 – Runtime bridge + Home Influence
// =======================================================

(function () {
  "use strict";

  const LS_CAPITAL_VALUES = "hg_capital_v1";

  function readStoredCapital() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_CAPITAL_VALUES) || "{}");
      return raw && typeof raw === "object" ? raw : {};
    } catch {
      return {};
    }
  }

  function writeStoredCapital(capital) {
    try {
      localStorage.setItem(LS_CAPITAL_VALUES, JSON.stringify(capital || {}));
    } catch {}
  }

  function emptyCapital() {
    return {
      economic: 0,
      cultural: 0,
      social: 0,
      symbolic: 0,
      political: 0,
      institutional: 0,
      subculture: 0
    };
  }

  function normalizeCapitalShape(capital) {
    const out = emptyCapital();
    const src = capital && typeof capital === "object" ? capital : {};

    Object.keys(out).forEach((key) => {
      out[key] = Number(src[key] || 0);
    });

    return out;
  }

  function calculateCapital(
    user,
    CIVI_ITEMS,
    CIVI_SYNERGIES,
    CAREERS,
    LIFESTYLES
  ) {
    const capital = emptyCapital();

    // ----------------------------------------------------
    // 1️⃣ Jobb-base
    // ----------------------------------------------------
    if (user.currentCareer) {
      const career = CAREERS?.[user.currentCareer];

      if (career && career.capital_base) {
        Object.keys(career.capital_base).forEach((key) => {
          capital[key] += Number(career.capital_base[key] || 0);
        });
      }
    }

    // ----------------------------------------------------
    // 2️⃣ Items
    // ----------------------------------------------------
    if (Array.isArray(user.ownedItems)) {
      user.ownedItems.forEach((id) => {
        const item = CIVI_ITEMS?.[id];
        if (!item || !item.capital_effect) return;

        Object.keys(item.capital_effect).forEach((key) => {
          capital[key] += Number(item.capital_effect[key] || 0);
        });
      });
    }

    // ----------------------------------------------------
    // 3️⃣ Livsstil
    // ----------------------------------------------------
    if (user.currentLifestyle) {
      const lifestyle = LIFESTYLES?.[user.currentLifestyle];

      if (lifestyle && lifestyle.capital_shift) {
        Object.keys(lifestyle.capital_shift).forEach((key) => {
          capital[key] += Number(lifestyle.capital_shift[key] || 0);
        });
      }
    }

    // ----------------------------------------------------
    // 4️⃣ Synergier
    // ----------------------------------------------------
    if (Array.isArray(CIVI_SYNERGIES)) {
      CIVI_SYNERGIES.forEach((synergy) => {
        if (typeof synergy?.condition !== "function") return;
        if (!synergy.condition(user)) return;

        Object.keys(synergy.effect || {}).forEach((key) => {
          capital[key] += Number(synergy.effect[key] || 0);
        });
      });
    }

    // ----------------------------------------------------
    // 5️⃣ Home influence
    // ----------------------------------------------------
    const homeInfluence = window.CivicationHome?.getHomeInfluence?.();

    if (homeInfluence) {
      capital.economic += Number(homeInfluence.economic || 0);
      capital.cultural += Number(homeInfluence.cultural || 0);
      capital.symbolic += Number(homeInfluence.symbolic || 0);
    }

    return normalizeCapitalShape(capital);
  }

  function applyCareerCapital(career, tier, capitalState) {
    if (!career || !career.capital_base) return normalizeCapitalShape(capitalState);

    const tierMultiplier = tier === 3 ? 2 : tier === 2 ? 1.5 : 1;
    const updated = normalizeCapitalShape(capitalState);

    Object.keys(career.capital_base).forEach((type) => {
      const base = Number(career.capital_base[type] || 0);
      updated[type] = Number(updated[type] || 0) + base * tierMultiplier;
    });

    return updated;
  }

  // ----------------------------------------------------
  // Runtime bridge
  // ----------------------------------------------------

  function getPrimaryLifestyleId() {
    const stamp = window.getPrimaryLifestyle?.() || window.HG_Lifestyle?.getStamp?.();
    return stamp?.id ? String(stamp.id) : null;
  }

  function getOwnedItemIds() {
    const inv = window.HG_CiviShop?.getInv?.();
    if (!inv || typeof inv !== "object") return [];

    // Foreløpig trygg minimumsvariant:
    // dersom inventory bare har packs, ikke map dem til items her.
    if (Array.isArray(inv.ownedItems)) {
      return inv.ownedItems.map(String);
    }

    return [];
  }

  function buildRuntimeUser() {
    const active = window.CivicationState?.getActivePosition?.() || {};
    const state = window.CivicationState?.getState?.() || {};

    const currentCareer =
      String(active?.career_id || state?.career || "").trim() || null;

    const currentLifestyle = getPrimaryLifestyleId();

    return {
      currentCareer,
      currentLifestyle,
      ownedItems: getOwnedItemIds()
    };
  }

  function getRuntimeCapital(CIVI_ITEMS, CIVI_SYNERGIES, CAREERS, LIFESTYLES) {
    const runtimeUser = buildRuntimeUser();

    return calculateCapital(
      runtimeUser,
      CIVI_ITEMS || window.CIVI_ITEMS || {},
      CIVI_SYNERGIES || window.CIVI_SYNERGIES || [],
      CAREERS || window.HG_CAREERS || window.CAREERS || {},
      LIFESTYLES || window.CIVI_LIFESTYLES || window.LIFESTYLES || {}
    );
  }

  // Skriver jobbbasert grunnkapital inn i hg_capital_v1
  // slik at maintenance/identity/UI faktisk har noe å lese.
  function syncRuntimeCapitalToStorage(CIVI_ITEMS, CIVI_SYNERGIES, CAREERS, LIFESTYLES) {
    const runtimeCapital = getRuntimeCapital(
      CIVI_ITEMS,
      CIVI_SYNERGIES,
      CAREERS,
      LIFESTYLES
    );

    const stored = normalizeCapitalShape(readStoredCapital());
    const next = emptyCapital();

    Object.keys(next).forEach((key) => {
      // Jobben skal minst kvalifisere deg til basekapital.
      // Vi senker ikke eksisterende lagret kapital her.
      next[key] = Math.max(
        Number(stored[key] || 0),
        Number(runtimeCapital[key] || 0)
      );
    });

    writeStoredCapital(next);
    return next;
  }

  window.CAPITAL_ENGINE = {
    calculateCapital,
    applyCareerCapital,
    buildRuntimeUser,
    getRuntimeCapital,
    syncRuntimeCapitalToStorage
  };

  // Første sync ved lasting
  try {
    syncRuntimeCapitalToStorage();
  } catch {}
})();
