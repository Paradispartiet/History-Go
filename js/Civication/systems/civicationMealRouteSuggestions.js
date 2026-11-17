// Pure read-only candidate selection for Fysen along *routed* Civication trips.
// An endpoint pair is NOT an on-route proof. Never infer shops/restaurants from it.
// Does not fetch, track, persist, charge, generate notifications or contact AHA.
(function () {
  "use strict";
  const DEFAULT_WINDOWS = Object.freeze({
    breakfast: [360, 600], // 06:00–10:00
    lunch: [660, 840],     // 11:00–14:00
    dinner: [960, 1200],   // 16:00–20:00
    supper: [1200, 1380]   // 20:00–23:00
  });
  const MAX_DETOUR_MINUTES = 10;
  const MAX_SHOPPING_LEAD_MINUTES = 180;

  function own(object, key) {
    return !!object && Object.prototype.hasOwnProperty.call(object, key);
  }
  function fresh(evidence, nowMillis) {
    if (!evidence || typeof evidence !== "object" || typeof evidence.sourceUrl !== "string" ||
        !/^https:\/\//i.test(evidence.sourceUrl)) return false;
    const seen = Date.parse(evidence.checkedAt || evidence.verifiedAt || "");
    const expires = Date.parse(evidence.validUntil || evidence.expiresAt || "");
    return Number.isFinite(seen) && Number.isFinite(expires) &&
      seen <= nowMillis && expires > nowMillis;
  }
  function validMinute(value) {
    return Number.isInteger(value) && value >= 0 && value < 1440;
  }
  function windowsFrom(input) {
    const windows = input && typeof input === "object" ? input : DEFAULT_WINDOWS;
    const output = {};
    for (const [meal, defaultRange] of Object.entries(DEFAULT_WINDOWS)) {
      const range = own(windows, meal) ? windows[meal] : defaultRange;
      if (!Array.isArray(range) || range.length !== 2 ||
          !validMinute(range[0]) || !Number.isInteger(range[1]) ||
          range[1] <= range[0] || range[1] > 1440) return null;
      output[meal] = range;
    }
    return output;
  }
  function mealOfMinute(minutes, windows) {
    return Object.keys(windows).find(meal =>
      minutes >= windows[meal][0] && minutes < windows[meal][1]) || null;
  }
  function validGeometry(geometry) {
    return geometry?.type === "LineString" && Array.isArray(geometry.coordinates) &&
      geometry.coordinates.length >= 2 && geometry.coordinates.length <= 10000 &&
      geometry.coordinates.every(pair => Array.isArray(pair) && pair.length >= 2 &&
        Number.isFinite(pair[0]) && pair[0] >= -180 && pair[0] <= 180 &&
        Number.isFinite(pair[1]) && pair[1] >= -90 && pair[1] <= 90);
  }
  function validRoute(route, gameDayIndex, nowMillis) {
    if (!route || route.kind !== "commute" || route.status !== "planned" ||
      route.visibility !== "private" || route.routingStatus !== "verified_route" ||
      !validGeometry(route.roadGeometry) || !fresh(route.routeEvidence, nowMillis) ||
      !Array.isArray(route.waypoints) || route.waypoints.length < 2) return false;
    const day = Number(gameDayIndex);
    return Number.isSafeInteger(day) && day >= 1 &&
      route.weekDay === ((day - 1) % 7);
  }
  function verifiedPass(place, route, nowMillis) {
    if (!place || !place.routeProof || place.routeProof.routeId !== route.id ||
      !fresh(place.routeProof.evidence, nowMillis)) return false;
    const detour = place.routeProof.detourMinutes;
    const passage = place.routeProof.passMinutes;
    if (!Number.isFinite(detour) || detour < 0 || detour > MAX_DETOUR_MINUTES ||
        !validMinute(passage)) return false;
    // A route match must refer to the EXACT currently routed geometry revision.
    if (!route.geometryRevision || place.routeProof.geometryRevision !== route.geometryRevision) return false;
    return true;
  }
  function verifiedService(place, nowMillis) {
    const service = place.service;
    return !!service && service.state === "open_at_pass_time" &&
      validMinute(service.passMinutes) &&
      service.passMinutes === place.routeProof.passMinutes &&
      fresh(service.evidence, nowMillis) &&
      (place.kind !== "restaurant" || service.type === "kitchen") &&
      (place.kind !== "grocery" || service.type === "store");
  }
  function verifiedMenu(place, nowMillis) {
    return place.kind === "restaurant" &&
      !!place.dish && typeof place.dish.name === "string" &&
      !!place.dish.name.trim() &&
      Array.isArray(place.dish.meals) &&
      fresh(place.dish.menuEvidence, nowMillis);
  }
  function verifiedRetail(place, nowMillis, shoppingIds) {
    if (place.kind !== "grocery" || !Array.isArray(place.listings)) return false;
    return place.listings.some(item =>
      shoppingIds.has(String(item.ingredientId || "")) &&
      item.name && fresh(item.listingEvidence, nowMillis) &&
      // Confirmed shelf stock requires independent evidence; unknown is not a positive offer.
      item.stockState === "confirmed_available" && fresh(item.stockEvidence, nowMillis));
  }
  function publicPrice(data, nowMillis) {
    return Number.isSafeInteger(data?.priceMinor) && data.priceMinor >= 0 &&
      fresh(data.priceEvidence, nowMillis) ? data.priceMinor : null;
  }
  function eligibleCandidates(input) {
    const params = input && typeof input === "object" ? input : {};
    if (params.optedOut === true || params.recentlyAte === true ||
      !Array.isArray(params.places)) return [];
    const dayIndex = params.gameDayIndex;
    // Dates supplied by Civication's VM/test contexts have a different Date prototype.
    const nowMillis = params.now && typeof params.now.getTime === "function"
      ? Number(params.now.getTime()) : Number(params.nowMillis);
    if (!Number.isFinite(nowMillis)) return [];
    const route = params.route;
    if (!validRoute(route, dayIndex, nowMillis)) return [];
    const windows = windowsFrom(params.mealWindows);
    if (!windows) return [];
    const gameDay = (dayIndex - 1) % 7;
    const meals = params.weekPlan?.meals?.[gameDay] || {};
    const shoppingIds = new Set((Array.isArray(params.shoppingList) ? params.shoppingList : [])
      .filter(item => Number(item.quantity) > 0)
      .map(item => String(item.id || "")));

    const matches = [];
    for (const place of params.places) {
      if (!verifiedPass(place, route, nowMillis) || !verifiedService(place, nowMillis)) continue;
      if (!["grocery", "restaurant"].includes(place.kind) || !place.id || !place.name) continue;
      const passMinutes = place.routeProof.passMinutes;
      if (place.kind === "restaurant") {
        const meal = mealOfMinute(passMinutes, windows);
        if (!meal || !verifiedMenu(place, nowMillis) || !place.dish.meals.includes(meal)) continue;
        if (Array.isArray(params.dismissedMeals) && params.dismissedMeals.includes(meal)) continue;
        matches.push({
          placeId: place.id, name: place.name, kind: "restaurant", meal,
          dishName: place.dish.name, passMinutes,
          detourMinutes: place.routeProof.detourMinutes,
          priceMinor: publicPrice(place.dish, nowMillis),
          currency: "NOK", source: "verified_fysen_menu",
          routeId: route.id
        });
      } else {
        // Weekly shopping list alone does not prove which meal requires a product.
        // The caller must supply explicit ingredient IDs for each day's meal.
        if (!shoppingIds.size || !Object.keys(meals).length) continue;
        const meal = Object.keys(windows).find(key => {
          if (!meals[key]) return false;
          const plannedTime = params.mealTimes?.[key] ?? Math.floor((windows[key][0] + windows[key][1]) / 2);
          if (!validMinute(plannedTime) || plannedTime < windows[key][0] || plannedTime >= windows[key][1]) return false;
          return passMinutes >= Math.max(0, plannedTime - MAX_SHOPPING_LEAD_MINUTES) &&
            passMinutes < plannedTime;
        });
        if (!meal || (Array.isArray(params.dismissedMeals) && params.dismissedMeals.includes(meal))) continue;
        const perMeal = Array.isArray(params.ingredientIdsByMeal?.[meal])
          ? params.ingredientIdsByMeal[meal] : [];
        const required = new Set(perMeal.map(String).filter(id => shoppingIds.has(id)));
        if (!required.size || !verifiedRetail(place, nowMillis, required)) continue;
        const inStock = place.listings.filter(item =>
          required.has(String(item.ingredientId || "")) &&
          item.stockState === "confirmed_available" &&
          fresh(item.stockEvidence, nowMillis) &&
          fresh(item.listingEvidence, nowMillis));
        matches.push({
          placeId: place.id, name: place.name, kind: "grocery", meal,
          ingredientIds: inStock.map(item => item.ingredientId),
          passMinutes, detourMinutes: place.routeProof.detourMinutes,
          source: "verified_grocery_listings", routeId: route.id
        });
      }
    }
    // Keep the shortest detour in each meal slot. No repetitive popup or push.
    matches.sort((a,b) => a.detourMinutes - b.detourMinutes ||
      a.passMinutes - b.passMinutes || String(a.placeId).localeCompare(String(b.placeId)));
    const chosen = [];
    const seenMeals = new Set();
    for (const match of matches) {
      if (seenMeals.has(match.meal)) continue;
      chosen.push(match);
      seenMeals.add(match.meal);
    }
    return chosen;
  }
  window.CivicationMealRouteSuggestions = Object.freeze({
    DEFAULT_WINDOWS, eligibleCandidates
  });
})();
