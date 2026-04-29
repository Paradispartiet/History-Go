// js/Civication/systems/civicationBrandEmployerBridge.js
// Uses the existing History Go Brands system as employer context for Civication jobs.
// This is a bridge, not a new brand system.

(function () {
  "use strict";

  const PATCHED = "__civicationBrandEmployerBridgePatched";

  const EMPLOYER_SECTORS = new Set([
    "retail",
    "kiosk",
    "books",
    "bookstore",
    "fashion",
    "beauty",
    "coffee",
    "coffee_design",
    "design",
    "jewelry",
    "watches",
    "outdoor",
    "sports",
    "sports_retail",
    "food_and_drink",
    "hospitality"
  ]);

  const EMPLOYER_TYPES = new Set([
    "retail_brand",
    "brand_store",
    "concept_store",
    "bookstore_brand",
    "coffee_brand",
    "fashion_brand",
    "luxury_brand",
    "design_brand",
    "state_brand",
    "hospitality_brand",
    "subculture_store"
  ]);

  function asString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function slugify(value) {
    return asString(value)
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function isNaeringslivOffer(offer) {
    return asString(offer?.career_id) === "naeringsliv";
  }

  function isFirstFloorRole(offer) {
    if (!isNaeringslivOffer(offer)) return false;

    const title = slugify(offer?.title || offer?.role_key || offer?.role_id);
    if (!title) return false;

    if (title.includes("ekspeditor")) return true;
    if (title.includes("butikkmedarbeider")) return true;

    // Legacy first Næringsliv tier. In Civication this should become ekspeditør.
    if (title === "arbeider" || title === "naer_arbeider") return true;

    const resolver = window.CivicationCareerRoleResolver;
    const resolved = resolver?.resolveRoleScope?.(offer, "naeringsliv") || resolver?.resolveRoleScope?.(offer?.title, "naeringsliv");
    return asString(resolved) === "ekspeditor";
  }

  function normalizeBrand(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = asString(raw.id);
    const name = asString(raw.name || raw.title || raw.label);
    if (!id || !name) return null;

    return {
      id,
      name,
      brand_type: asString(raw.brand_type),
      brand_group: asString(raw.brand_group),
      sector: asString(raw.sector),
      status: asString(raw.status),
      state: asString(raw.state || "catalog"),
      verification: asString(raw.verification),
      desc: asString(raw.desc),
      popupdesc: asString(raw.popupdesc),
      tags: safeArray(raw.tags).map(asString).filter(Boolean),
      place_ids: safeArray(raw.place_ids).map(asString).filter(Boolean)
    };
  }

  function getExistingBrandsSync() {
    if (window.HGBrands?.ready && typeof window.HGBrands.getCatalog === "function") {
      return safeArray(window.HGBrands.getCatalog()).map(normalizeBrand).filter(Boolean);
    }

    if (Array.isArray(window.BRANDS) && window.BRANDS.length) {
      return window.BRANDS.map(normalizeBrand).filter(Boolean);
    }

    if (Array.isArray(window.BRANDS_MASTER) && window.BRANDS_MASTER.length) {
      return window.BRANDS_MASTER
        .map(normalizeBrand)
        .filter(Boolean)
        .filter(brand => brand.state === "catalog");
    }

    return [];
  }

  function hasRelevantEmployerShape(brand) {
    const type = asString(brand?.brand_type);
    const sector = asString(brand?.sector);
    const status = asString(brand?.status);

    if (!brand?.id || !brand?.name) return false;
    if (status === "dead") return false;
    if (type.includes("signage")) return false;
    if (type.includes("museum")) return false;
    if (type.includes("venue") && !EMPLOYER_SECTORS.has(sector)) return false;

    return EMPLOYER_TYPES.has(type) || EMPLOYER_SECTORS.has(sector);
  }

  function scoreBrandForEkspeditor(brand) {
    let score = 0;
    const type = asString(brand.brand_type);
    const sector = asString(brand.sector);
    const tags = safeArray(brand.tags);

    if (brand.state === "catalog") score += 20;
    if (brand.status === "active") score += 10;
    if (brand.verification) score += 4;

    if (type === "retail_brand") score += 18;
    if (type === "brand_store") score += 18;
    if (type === "concept_store") score += 16;
    if (type === "bookstore_brand") score += 16;
    if (type === "coffee_brand") score += 12;
    if (type === "fashion_brand") score += 12;
    if (type === "luxury_brand") score += 10;
    if (type === "state_brand") score += 10;

    if (sector === "kiosk") score += 18;
    if (sector === "retail") score += 16;
    if (sector === "books") score += 14;
    if (sector === "fashion") score += 12;
    if (sector === "beauty") score += 12;
    if (sector === "coffee") score += 10;
    if (sector === "jewelry") score += 8;

    if (tags.includes("brand_store")) score += 8;
    if (tags.includes("retail")) score += 6;
    if (tags.includes("logo")) score += 2;

    return score;
  }

  function hashString(value) {
    const s = asString(value);
    let h = 0;
    for (let i = 0; i < s.length; i += 1) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function selectEmployerForOffer(offer) {
    if (!isFirstFloorRole(offer)) return null;
    if (asString(offer?.brand_id) && asString(offer?.brand_name)) {
      return normalizeBrand({
        id: offer.brand_id,
        name: offer.brand_name,
        brand_type: offer.brand_type,
        brand_group: offer.brand_group,
        sector: offer.sector,
        status: offer.brand_status,
        verification: offer.brand_verification,
        place_ids: [offer.place_id].filter(Boolean)
      });
    }

    const candidates = getExistingBrandsSync()
      .filter(hasRelevantEmployerShape)
      .map(brand => ({ brand, score: scoreBrandForEkspeditor(brand) }))
      .filter(row => row.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.brand.name.localeCompare(b.brand.name, "nb");
      });

    if (!candidates.length) return null;

    const topScore = candidates[0].score;
    const topBand = candidates.filter(row => row.score >= topScore - 4).map(row => row.brand);
    const seed = `${offer?.career_id || ""}:${offer?.threshold || ""}:${offer?.points_at_offer || ""}:${offer?.title || ""}`;
    return topBand[hashString(seed) % topBand.length] || candidates[0].brand;
  }

  function toEmployerPatch(brand) {
    if (!brand) return {};
    const placeId = safeArray(brand.place_ids)[0] || null;
    return {
      brand_id: brand.id,
      brand_name: brand.name,
      brand_type: brand.brand_type || null,
      brand_group: brand.brand_group || null,
      sector: brand.sector || null,
      brand_status: brand.status || null,
      brand_verification: brand.verification || null,
      place_id: placeId,
      employer_context: {
        source: "HGBrands",
        brand_id: brand.id,
        brand_name: brand.name,
        brand_type: brand.brand_type || null,
        brand_group: brand.brand_group || null,
        sector: brand.sector || null,
        place_id: placeId,
        status: brand.status || null,
        verification: brand.verification || null
      }
    };
  }

  function enrichOffer(offer) {
    if (!offer || typeof offer !== "object") return offer;
    const employer = selectEmployerForOffer(offer);
    if (!employer) return offer;
    return {
      ...offer,
      ...toEmployerPatch(employer)
    };
  }

  async function ensureReady() {
    if (window.HGBrands?.ready) return true;
    if (window.HGBrands?.init) {
      try {
        await window.HGBrands.init();
        return !!window.HGBrands.ready;
      } catch (error) {
        console.warn("[CivicationBrandEmployerBridge] HGBrands.init failed", error);
      }
    }
    return getExistingBrandsSync().length > 0;
  }

  function patchStoredOfferExtra(result, enriched) {
    if (!result?.ok || !result.offer || !enriched?.brand_id) return result;

    const jobs = window.CivicationJobs;
    if (!jobs?.getOffers || !jobs?.setOffers) return result;

    const offers = jobs.getOffers();
    const offerKey = asString(result.offer.offer_key || enriched.offer_key);
    const next = offers.map(offer => {
      if (!offer || asString(offer.offer_key) !== offerKey) return offer;
      return { ...offer, ...enriched };
    });

    jobs.setOffers(next);
    const updated = next.find(offer => asString(offer?.offer_key) === offerKey) || result.offer;
    return { ...result, offer: updated };
  }

  function patchActivePositionFromAcceptedOffer(result) {
    if (!result?.ok || !result.offer) return result;
    const offer = result.offer;
    if (!offer.brand_id) return result;

    const active = window.CivicationState?.getActivePosition?.();
    if (!active || active.brand_id) return result;

    window.CivicationState?.setActivePosition?.({
      ...active,
      brand_id: offer.brand_id || null,
      brand_name: offer.brand_name || null,
      brand_type: offer.brand_type || null,
      brand_group: offer.brand_group || null,
      sector: offer.sector || null,
      brand_status: offer.brand_status || null,
      brand_verification: offer.brand_verification || null,
      place_id: offer.place_id || null,
      employer_context: offer.employer_context || null
    });

    return result;
  }

  function patchJobs() {
    const jobs = window.CivicationJobs;
    if (!jobs || jobs[PATCHED]) return false;

    const originalPushOffer = jobs.pushOffer;
    if (typeof originalPushOffer === "function") {
      jobs.pushOffer = function brandEmployerPushOffer(offer) {
        const enriched = enrichOffer(offer);
        const result = originalPushOffer.call(this, enriched);
        return patchStoredOfferExtra(result, enriched);
      };
    }

    const originalAcceptOffer = jobs.acceptOffer;
    if (typeof originalAcceptOffer === "function") {
      jobs.acceptOffer = function brandEmployerAcceptOffer(offerKey) {
        const result = originalAcceptOffer.call(this, offerKey);
        return patchActivePositionFromAcceptedOffer(result);
      };
    }

    jobs[PATCHED] = true;
    return true;
  }

  function patchRebuildOffers() {
    const original = window.rebuildJobOffersFromCurrentMerits;
    if (typeof original !== "function" || original.__brandEmployerBridgePatched) return false;

    const wrapped = async function brandEmployerRebuildJobOffersFromCurrentMerits() {
      await ensureReady();
      patchJobs();
      return await original.apply(this, arguments);
    };

    wrapped.__brandEmployerBridgePatched = true;
    window.rebuildJobOffersFromCurrentMerits = wrapped;
    return true;
  }

  function boot() {
    patchJobs();
    patchRebuildOffers();
    ensureReady().then(() => {
      patchJobs();
      patchRebuildOffers();
    });
  }

  function inspect() {
    return {
      brands_ready: !!window.HGBrands?.ready,
      brand_count: getExistingBrandsSync().length,
      jobs_patched: window.CivicationJobs?.[PATCHED] === true,
      rebuild_patched: window.rebuildJobOffersFromCurrentMerits?.__brandEmployerBridgePatched === true,
      sample_employer: selectEmployerForOffer({
        career_id: "naeringsliv",
        title: "Ekspeditør / butikkmedarbeider",
        threshold: 1,
        points_at_offer: 1
      })
    };
  }

  window.CivicationBrandEmployerBridge = {
    boot,
    inspect,
    ensureReady,
    enrichOffer,
    selectEmployerForOffer,
    getExistingBrandsSync
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);
})();
