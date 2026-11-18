// Read-only local bridge: weekly menu -> missing ingredients -> verified route candidates.
// Does not call Fysen, ORS, AHA, location services, localStorage or any wallet.
// A source adapter must provide already verified public venue facts; if absent,
// the result must explicitly say "not available", never fabricate offers.
(function () {
  "use strict";
  const W = /** @type {any} */ (window);

  function dateMillis(value) {
    if (value && typeof value.getTime === "function") return Number(value.getTime());
    return Number(value);
  }
  function fail(status) { return { status, offers: [], routesConsidered: 0 }; }
  function freshRoute(route, nowMillis) {
    const proof = route?.routeEvidence;
    const checked = Date.parse(proof?.checkedAt || "");
    const expires = Date.parse(proof?.validUntil || "");
    const geometry = route?.roadGeometry;
    return proof?.sourceUrl?.startsWith("https://api.openrouteservice.org/v2/directions/") &&
      Number.isFinite(checked) && Number.isFinite(expires) &&
      checked <= nowMillis && expires > nowMillis &&
      geometry?.type === "LineString" &&
      Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2 &&
      typeof route.geometryRevision === "string" && !!route.geometryRevision;
  }

  function build(options) {
    const args = options && typeof options === "object" ? options : {};
    if (args.optedOut === true) return fail("opted_out");
    const mealPlan = W.CivicationMealPlan;
    const routes = W.CivicationPersonalRoutes;
    const candidateFilter = W.CivicationMealRouteSuggestions;
    if (!mealPlan || !routes || !candidateFilter) return fail("not_initialized");
    const currentDay = W.CivicationCalendar?.getClock?.()?.dayIndex;
    const dayIndex = args.gameDayIndex === undefined ? Number(currentDay) : Number(args.gameDayIndex);
    if (!Number.isSafeInteger(dayIndex) || dayIndex < 1) return fail("invalid_game_day");
    const nowMillis = dateMillis(args.nowMillis ?? args.now);
    if (!Number.isFinite(nowMillis)) return fail("invalid_time");

    const weekKey = mealPlan.getWeekKey(dayIndex);
    const plan = mealPlan.getWeek(weekKey);
    const weekday = (dayIndex - 1) % 7;
    const selected = plan.meals?.[weekday] || {};
    const mealKeys = Object.keys(mealPlan.MEALS);
    const plannedMeals = mealKeys.filter(key => !!selected[key]);
    if (!plannedMeals.length) return fail("weekly_menu_not_selected");

    const jobKey = routes.jobKey();
    if (!jobKey) return fail("active_job_required");
    const savedRoutes = routes.listRoutes().filter(item =>
      item && item.jobKey === jobKey &&
      item.status === "planned" && item.kind === "commute" &&
      item.visibility === "private" && item.weekDay === weekday &&
      item.routingStatus === "verified_route" && freshRoute(item, nowMillis));
    const chosenRoutes = args.routeId
      ? savedRoutes.filter(item => item.id === args.routeId) : savedRoutes;
    if (!chosenRoutes.length) return fail("verified_commute_required");

    // Only verified, public venue candidates supplied by a separate adapter.
    // We do not send home/work coordinates or weekly menus to Fysen.
    if (!Array.isArray(args.places) || !args.places.length) {
      return { status: "verified_venues_required", offers: [], routesConsidered: chosenRoutes.length };
    }
    const shopping = mealPlan.getShoppingList(weekKey, args.pantry || {});
    const byMeal = mealPlan.getIngredientIdsByMeal(dayIndex);
    const matches = [];
    for (const route of chosenRoutes) {
      const hits = candidateFilter.eligibleCandidates({
        route,
        places: args.places,
        nowMillis,
        gameDayIndex: dayIndex,
        weekPlan: plan,
        shoppingList: shopping,
        ingredientIdsByMeal: byMeal,
        mealTimes: args.mealTimes,
        mealWindows: args.mealWindows,
        recentlyAte: args.recentlyAte === true,
        optedOut: args.optedOut === true,
        dismissedMeals: args.dismissedMeals
      });
      for (const hit of hits) matches.push(hit);
    }
    matches.sort((a,b) => a.detourMinutes - b.detourMinutes ||
      a.passMinutes - b.passMinutes ||
      String(a.placeId).localeCompare(String(b.placeId)));
    const accepted = [], mealsSeen = new Set();
    for (const match of matches) {
      if (mealsSeen.has(match.meal)) continue;
      mealsSeen.add(match.meal);
      accepted.push(match);
    }
    return {
      status: accepted.length ? "verified_offers_found" : "no_verified_offers",
      offers: accepted,
      routesConsidered: chosenRoutes.length
    };
  }

  W.CivicationMealRouteBridge = Object.freeze({ build });
})();