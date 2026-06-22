/* ============================================================
   Civication Home Module v3
   - Canonical storage: civi_home_v1
   - Velgbare nabolag/distrikter fra start
   - Rent/prestige/visit-gate/housing pressure
   ============================================================ */

(function () {

  const KEY = "civi_home_v1";
  const CAPITAL_KEY = "hg_capital_v1";
  const MERITS_KEY = "merits_by_category";
  const VISITED_KEYS = [
    "hg_visited_places_v1",
    "visited_places",
    "visitedPlaces",
    "HG_VISITED_PLACES"
  ];

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }

  function ensure(state) {
    state = state && typeof state === "object" ? state : {};
    const availableIds = Object.keys(DISTRICTS || {});
    const startId = availableIds.includes("sagene") ? "sagene" : (availableIds[0] || null);

    state.home ||= {};
    state.objects ||= [];

    const currentDistrictId = state.currentDistrictId || state.home.district || null;
    const unlockedDistrictIds = uniqueStrings([
      ...(state.unlockedDistrictIds || []),
      ...(state.home.unlockedDistrictIds || []),
      ...getStartDistricts().map(d => d.id),
      ...(currentDistrictId ? [currentDistrictId] : [])
    ]);

    state.currentDistrictId = currentDistrictId;
    state.unlockedDistrictIds = unlockedDistrictIds;
    state.rentDue = Number(state.rentDue || state.home.rentDue || 0);
    state.rentPaidThisWeek = Boolean(state.rentPaidThisWeek || state.home.rentPaidThisWeek || false);
    state.lastRentTickDate = state.lastRentTickDate || state.home.lastRentTickDate || null;
    state.housingStatus = state.housingStatus || state.home.housingStatus || (currentDistrictId ? "stable" : "homeless");
    state.moveHistory = Array.isArray(state.moveHistory) ? state.moveHistory : (Array.isArray(state.home.moveHistory) ? state.home.moveHistory : []);
    state.evictionWarnings = Array.isArray(state.evictionWarnings) ? state.evictionWarnings : (Array.isArray(state.home.evictionWarnings) ? state.home.evictionWarnings : []);

    state.home.status = currentDistrictId ? "settled" : "homeless";
    state.home.district = currentDistrictId;
    state.home.level = Number(state.home.level || (currentDistrictId ? 1 : 0));
    state.home.moveCount = Number(state.home.moveCount || state.moveHistory.length || 0);
    state.home.housingPressure ||= "none";
    state.home.rentArrears = Number(state.home.rentArrears || 0);
    state.home.rentDue = state.rentDue;
    state.home.rentPaidThisWeek = state.rentPaidThisWeek;
    state.home.lastRentTickDate = state.lastRentTickDate;
    state.home.housingStatus = state.housingStatus;
    state.home.unlockedDistrictIds = unlockedDistrictIds;
    state.home.moveHistory = state.moveHistory;
    state.home.evictionWarnings = state.evictionWarnings;

    if (!state.currentDistrictId && startId && state.home.autoStart !== false) {
      state.unlockedDistrictIds = uniqueStrings(state.unlockedDistrictIds.concat(startId));
    }

    return state;
  }

  function dispatchHomeChanged() {
    window.dispatchEvent(new Event("civi:homeChanged"));
    window.dispatchEvent(new Event("updateProfile"));
  }

  function getCapital() {
    try {
      return JSON.parse(localStorage.getItem(CAPITAL_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveCapital(cap) {
    try {
      localStorage.setItem(CAPITAL_KEY, JSON.stringify(cap));
      window.dispatchEvent(new Event("updateProfile"));
    } catch {}
  }

  function currentPeriodKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function weekKey(date) {
    const d = new Date(date);
    const first = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d.getTime() - first.getTime()) / 86400000);
    return `${d.getFullYear()}-W${String(Math.ceil((days + first.getDay() + 1) / 7)).padStart(2, "0")}`;
  }

  function normalizeList(xs) {
    return Array.isArray(xs) ? xs.map(String).map(x => x.trim()).filter(Boolean) : [];
  }

  function hasCompletedPlace(placeId) {
    const history = window.HGLearningLog?.getQuizHistory?.() ?? [];

    return history.some(q =>
      String(q.targetId || q.id || "").trim() === String(placeId).trim()
    );
  }

  function readVisitedIdsFromValue(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") return item.id || item.placeId || item.targetId;
          return "";
        })
        .map(String)
        .map(x => x.trim())
        .filter(Boolean);
    }

    if (value && typeof value === "object") {
      return Object.keys(value).filter(key => value[key]);
    }

    return [];
  }

  function getVisitedPlaceIds() {
    const out = new Set();

    try {
      const runtimeVisits = window.HGLearningLog?.getVisitHistory?.() || [];
      readVisitedIdsFromValue(runtimeVisits).forEach(id => out.add(id));
    } catch {}

    for (const key of VISITED_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        readVisitedIdsFromValue(JSON.parse(raw)).forEach(id => out.add(id));
      } catch {}
    }

    return Array.from(out);
  }

  function hasVisitedPlace(placeId) {
    const id = String(placeId || "").trim();
    if (!id) return false;
    if (hasCompletedPlace(id)) return true;
    return getVisitedPlaceIds().some(visitedId => String(visitedId).trim() === id);
  }

  function hasVisitedDistrict(district) {
    const ids = normalizeList(district?.visitRequirementPlaceIds);
    if (!ids.length) return true;
    return ids.some(hasVisitedPlace);
  }

  function getDistrict(districtId) {
    const key = String(districtId || "").trim();
    return key ? (DISTRICTS[key] || null) : null;
  }

  function getDistrictName(districtId) {
    const district = getDistrict(districtId);
    return district?.name || String(districtId || "");
  }

  function getCurrentDistrict() {
    const state = ensure(load());
    return getDistrict(state?.currentDistrictId || state?.home?.district);
  }

  function getAvailableDistricts() {
    return Object.values(DISTRICTS);
  }

  function getStartDistricts() {
    return getAvailableDistricts().filter((district) => district.isStartOption === true);
  }

  function getSelectedDistrictAccess() {
    const district = getCurrentDistrict();

    if (!district) {
      return {
        id: null,
        name: null,
        housing: [],
        store: [],
        choice_tags: [],
        rent: 0,
        prestige: 0
      };
    }

    return {
      id: district.id,
      name: district.name,
      housing: normalizeList(district.housing_access),
      store: normalizeList(district.store_access),
      choice_tags: normalizeList(district.choice_tags),
      rent: Number(district.rent || 0),
      prestige: Number(district.prestige || 0)
    };
  }

  function formatCost(district) {
    const cost = Number(district?.baseCost || 0);
    return cost <= 0 ? "Gratis" : `${cost} kapital`;
  }

  function formatRent(district) {
    const rent = Number(district?.rent || 0);
    return rent <= 0 ? "Ingen husleie" : `${rent} PC / periode`;
  }

  function getEconomicCapital(capital = getCapital()) {
    return Number(capital?.economic || 0);
  }

  function getAffordabilityLabel(district, capital = getCapital()) {
    const baseCost = Number(district?.baseCost || 0);
    if (baseCost <= 0) return "Gratis";

    const economic = getEconomicCapital(capital);
    return economic >= baseCost ? "Du har råd" : `Mangler ${baseCost - economic} kapital`;
  }

  function getDistrictTitle(district) {
    return district?.title || district?.name || String(district?.id || "");
  }

  function uniqueStrings(values) {
    return Array.from(new Set(normalizeList(values)));
  }

  function getIncomeSnapshot() {
    const state = /** @type {any} */ (window.CivicationState?.getState?.() || {});
    const active = /** @type {any} */ (window.CivicationState?.getActivePosition?.() || state?.career?.activeJob || null);
    const wallet = /** @type {any} */ (window.CivicationState?.getWallet?.() || {});
    const jobStatus = String(active?.status || state?.career?.status || "").toLowerCase();
    const income = Number(wallet.weekly_income ?? wallet.weeklyIncome ?? active?.salary ?? active?.weekly_income ?? state?.career?.weeklyIncome ?? 0);
    const hasJob = !!(active?.career_id || active?.id || active?.role_id || state?.career?.activeJob);
    const fired = jobStatus === "fired" || jobStatus === "terminated" || state?.stability === "FIRED";
    return { hasJob, fired, income, noIncome: !hasJob || fired || income <= 0 };
  }

  function getSupportEligibility() {
    const income = getIncomeSnapshot();
    const status = getHousingStatus();
    const eligible = income.noIncome || status === "at_risk" || status === "homeless";
    return {
      eligibleForSupport: eligible,
      supportReason: eligible
        ? (income.noIncome ? "Ingen jobb eller inntekt registrert" : "Boligstatus er presset")
        : "Ikke støtteberettiget nå"
    };
  }

  function requirementText(district) {
    const parts = [];
    const reqs = district?.quizRequirements || {};
    const entries = Object.entries(reqs);

    if (entries.length) {
      parts.push(entries.map(([cat, value]) => `${cat}: ${value}`).join(" · "));
    }

    const visitIds = normalizeList(district?.visitRequirementPlaceIds);
    if (visitIds.length) {
      parts.push(hasVisitedDistrict(district) ? "Besøkt" : "Må besøkes først");
    }

    return parts.length ? parts.join(" · ") : "Åpent fra start";
  }

  function getDistrictLockReason(district) {
    if (!district) return "Ukjent nabolag";

    const capital = getCapital();
    if ((capital.economic || 0) < Number(district.baseCost || 0)) return "For lite kapital";

    if (!hasVisitedDistrict(district)) return "Besøk nabolaget først";

    let merits = {};
    try {
      merits = JSON.parse(localStorage.getItem(MERITS_KEY) || "{}");
    } catch {}

    const requirements = district.quizRequirements || {};
    for (const cat in requirements) {
      const needed = requirements[cat];
      const points = merits[cat]?.points || 0;
      if (points < needed) return `Mangler ${cat}: ${needed}`;
    }

    return "";
  }

  function enqueueHousingFallMail(district, deficit, state) {
    const period = currentPeriodKey();
    const eventId = `housing_pressure_${district.id}_${period}`;

    const mail = {
      id: eventId,
      event_id: eventId,
      status: "pending",
      type: "housing_pressure",
      channel: "nav",
      enqueued_at: new Date().toISOString(),
      event: {
        id: eventId,
        type: "housing_pressure",
        channel: "nav",
        stage: "unemployed",
        title: "NAV: Boligpress",
        subject: "NAV: Boligpress",
        from: "NAV / Civication",
        body: `Husleien i ${district.name} presset økonomien din denne perioden. Du manglet ${deficit} PC. Du kan ta en hvilken som helst jobb, bygge kapital raskt eller flytte til et billigere nabolag.`,
        feedback: "Boligpress registrert. Det er ikke game over — det er ny historie.",
        choices: [
          {
            id: "take_any_job",
            label: "Ta hvilken som helst jobb",
            feedback: "Du velger stabilitet først."
          },
          {
            id: "move_cheaper",
            label: "Flytt billigere",
            feedback: "Du reduserer presset, men mister noe status."
          },
          {
            id: "hold_on",
            label: "Hold ut litt til",
            feedback: "Du tar risikoen og blir boende."
          }
        ]
      }
    };

    try {
      const existing = window.CivicationMailEngine?.getInbox?.() || window.CivicationState?.getInbox?.() || [];
      if (Array.isArray(existing) && existing.some(item => String(item?.event?.id || item?.id || "") === eventId)) return false;
      if (Array.isArray(existing) && existing.some(item => item?.status === "pending")) return false;
      const next = Array.isArray(existing) ? existing.concat(mail) : [mail];
      if (window.CivicationMailEngine?.replaceInbox) {
        window.CivicationMailEngine.replaceInbox(next);
      } else if (window.CivicationState?.setInbox) {
        window.CivicationState.setInbox(next);
      }
    } catch {}

    state.home.lastHousingMail = eventId;
    return true;
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  function unlockDistrict(districtId, reason = "manual") {
    const district = getDistrict(districtId);
    if (!district) return false;
    const state = ensure(load());
    state.unlockedDistrictIds = uniqueStrings(state.unlockedDistrictIds.concat(district.id));
    state.unlockReasons ||= {};
    state.unlockReasons[district.id] = String(reason || "manual");
    state.home.unlockedDistrictIds = state.unlockedDistrictIds;
    save(state);
    dispatchHomeChanged();
    return true;
  }

  function canMoveToDistrict(districtId) {
    const district = getDistrict(districtId);
    if (!district) return { ok: false, reason: "Ukjent nabolag" };
    const state = ensure(load());
    const unlocked = state.unlockedDistrictIds.includes(district.id);
    const lockReason = unlocked ? "" : getDistrictLockReason(district);
    return { ok: unlocked || !lockReason, reason: lockReason };
  }

  function moveToDistrict(districtId) {
    const district = getDistrict(districtId);
    if (!district) return false;
    const access = canMoveToDistrict(districtId);
    if (!access.ok) return false;
    const state = ensure(load());
    const from = state.currentDistrictId || null;
    if (from === district.id) return true;
    state.currentDistrictId = district.id;
    state.unlockedDistrictIds = uniqueStrings(state.unlockedDistrictIds.concat(district.id));
    state.housingStatus = state.housingStatus === "homeless" ? "stable" : state.housingStatus;
    state.moveHistory.push({ from, to: district.id, at: new Date().toISOString() });
    state.home.district = district.id;
    state.home.status = "settled";
    state.home.moveCount = Number(state.home.moveCount || 0) + (from ? 1 : 0);
    save(state);
    dispatchHomeChanged();
    return true;
  }

  function getRentPressure() {
    const state = ensure(load());
    const district = getDistrict(state.currentDistrictId);
    const rent = Number(district?.rent || 0);
    const economic = getEconomicCapital();
    const income = getIncomeSnapshot();
    let score = rent <= 0 ? 0 : Math.round((rent / Math.max(1, economic + rent)) * 100);
    if (rent >= 10) score += 15;
    if (rent <= 4) score -= 10;
    if (income.noIncome) score += 30;
    score = Math.max(0, Math.min(100, score));
    return { score, label: score >= 75 ? "Kritisk" : score >= 50 ? "Høyt" : score >= 25 ? "Moderat" : "Lavt", rent, noIncome: income.noIncome };
  }

  function worsenHousingStatus(status) {
    return status === "stable" ? "strained" : status === "strained" ? "at_risk" : "homeless";
  }

  function getHousingStatus() {
    const state = ensure(load());
    const pressure = getRentPressure();
    if (state.housingStatus === "stable" && pressure.noIncome && pressure.rent > 0) return "strained";
    return state.housingStatus || "homeless";
  }

  function getHousingStatusLabel() {
    return ({ stable: "Stabil", strained: "Anstrengt", at_risk: "Utkastelsesfare", homeless: "Uten bolig" })[getHousingStatus()] || "Ukjent";
  }

  function getHomeConsequences() {
    const current = getCurrentDistrict();
    const pressure = getRentPressure();
    return {
      economy: -Number(current?.rent || 0),
      prestige: Number(current?.prestige || 0),
      pressure: pressure.score,
      eligibleForSupport: getSupportEligibility().eligibleForSupport
    };
  }

  function applyRentTick(force = false) {
    const state = ensure(load());
    const district = getDistrict(state.currentDistrictId);
    if (!district) return { ok: false, reason: "no_district" };
    const week = weekKey(new Date());
    if (!force && state.lastRentTickDate === week) return { ok: true, skipped: true, week };
    const rent = Number(district.rent || 0);
    state.lastRentTickDate = week;
    state.rentPaidThisWeek = false;
    state.rentDue = Number(state.rentDue || 0) + rent;
    const capital = getCapital();
    const before = getEconomicCapital(capital);
    if (rent > 0 && before >= rent) {
      capital.economic = before - rent;
      state.rentDue = Math.max(0, state.rentDue - rent);
      state.rentPaidThisWeek = true;
      state.housingStatus = getIncomeSnapshot().noIncome ? "strained" : "stable";
      saveCapital(capital);
    } else if (rent > 0) {
      state.housingStatus = worsenHousingStatus(state.housingStatus || "stable");
      state.evictionWarnings.push({ districtId: district.id, rentDue: state.rentDue, at: new Date().toISOString() });
    }
    state.home.housingStatus = state.housingStatus;
    state.home.rentDue = state.rentDue;
    save(state);
    dispatchHomeChanged();
    return { ok: true, week, rent, before, rentDue: state.rentDue, housingStatus: state.housingStatus };
  }

  function getState() {
    return ensure(load());
  }

  function getHomeInfluence() {
    const state = ensure(load());

    const influence = {
      economic: 0,
      cultural: 0,
      symbolic: 0,
      autonomy: 0,
      prestige: 0,
      rent: 0
    };

    const district = getDistrict(state?.home?.district);
    const districtModifiers = district?.modifiers || {};

    influence.economic += Number(districtModifiers.economic || 0);
    influence.cultural += Number(districtModifiers.cultural || 0);
    influence.symbolic += Number(districtModifiers.symbolic || 0);
    influence.autonomy += Number(districtModifiers.autonomy || 0);
    influence.prestige += Number(district?.prestige || 0);
    influence.rent += Number(district?.rent || 0);

    for (const obj of state.objects) {
      influence.economic += obj.economic || 0;
      influence.cultural += obj.cultural || 0;
      influence.symbolic += obj.symbolic || 0;
      influence.autonomy += obj.autonomy || 0;
    }

    return influence;
  }

  function getDistrictViewModels() {
    const state = ensure(load());
    const currentId = state?.currentDistrictId || state?.home?.district || null;
    const capital = getCapital();

    return getAvailableDistricts().map((district) => {
      const lockReason = getDistrictLockReason(district);
      const isCurrent = String(currentId || "") === String(district.id || "");

      const unlocked = state.unlockedDistrictIds.includes(district.id);
      const unlockReason = state.unlockReasons?.[district.id] || (district.isStartOption ? "Startnabolag" : (unlocked ? "Låst opp" : ""));

      return {
        id: district.id,
        districtId: district.id,
        name: district.name,
        title: getDistrictTitle(district),
        isCurrent,
        isStartOption: district.isStartOption === true,
        canSelect: unlocked || !lockReason || isCurrent,
        unlockReason,
        lockReason: (unlocked || isCurrent) ? "" : lockReason,
        cost: Number(district.baseCost || 0),
        costLabel: formatCost(district),
        rent: Number(district.rent || 0),
        rentLabel: formatRent(district),
        prestige: Number(district.prestige || 0),
        shortDesc: district.shortDesc || "",
        requirementText: requirementText(district),
        visitRequirementPlaceIds: normalizeList(district.visitRequirementPlaceIds),
        requirements: { ...(district.quizRequirements || {}) },
        quizRequirements: { ...(district.quizRequirements || {}) },
        tags: normalizeList(district.choice_tags),
        housing_access: normalizeList(district.housing_access),
        store_access: normalizeList(district.store_access),
        choice_tags: normalizeList(district.choice_tags),
        modifiers: { ...(district.modifiers || {}) },
        affordabilityLabel: getAffordabilityLabel(district, capital)
      };
    });
  }

  function getHomeSnapshot() {
    const state = ensure(load());
    const currentDistrict = getDistrict(state?.home?.district);
    const selectedAccess = getSelectedDistrictAccess();
    const capital = getCapital();
    const districts = getDistrictViewModels();
    const rent = Number(currentDistrict?.rent || 0);

    return {
      state,
      currentDistrict,
      selectedAccess,
      capital,
      economicCapital: getEconomicCapital(capital),
      districts,
      startDistricts: districts.filter((district) => district.isStartOption),
      settled: state?.home?.status === "settled" && !!currentDistrict,
      housingPressure: state?.home?.housingPressure || "none",
      rentArrears: Number(state?.home?.rentArrears || 0),
      lastRentAmount: Number(state?.home?.lastRentAmount || 0),
      moveCount: Number(state?.home?.moveCount || 0),
      monthlyRentLabel: rent <= 0 ? "Ingen husleie" : `${rent} PC / periode`,
      housingStatus: getHousingStatus(),
      rentPressure: getRentPressure(),
      rentDue: Number(state.rentDue || 0),
      unlockedDistrictIds: uniqueStrings(state.unlockedDistrictIds),
      availableMoves: districts.filter(d => d.canSelect && !d.isCurrent),
      blockedMoves: districts.filter(d => !d.canSelect),
      supportEligibility: getSupportEligibility(),
      homeInfluence: getHomeInfluence()
    };
  }

  function applyHousingPeriodCosts(force = false) {
    const state = ensure(load());
    const district = getDistrict(state?.home?.district);
    if (!district) return { ok: false, reason: "no_district" };

    const period = currentPeriodKey();
    if (!force && state.home.lastRentPeriod === period) {
      return { ok: true, skipped: true, period };
    }

    const rent = Number(district.rent || 0);
    state.home.lastRentPeriod = period;
    state.home.lastRentAmount = rent;

    if (rent <= 0) {
      state.home.housingPressure = "none";
      save(state);
      return { ok: true, rent: 0, period };
    }

    const capital = getCapital();
    const before = Number(capital.economic || 0);
    const after = before - rent;

    if (after >= 0) {
      capital.economic = after;
      state.home.housingPressure = "none";
      state.home.rentArrears = Math.max(0, Number(state.home.rentArrears || 0) - rent);
      saveCapital(capital);
      save(state);
      dispatchHomeChanged();
      return { ok: true, rent, before, after, period };
    }

    const deficit = Math.abs(after);
    capital.economic = 0;
    state.home.rentArrears = Number(state.home.rentArrears || 0) + deficit;
    state.home.housingPressure = state.home.rentArrears >= rent * 2 ? "crisis" : "pressure";

    saveCapital(capital);
    enqueueHousingFallMail(district, deficit, state);
    save(state);
    dispatchHomeChanged();

    return { ok: true, rent, before, after: 0, deficit, period, pressure: state.home.housingPressure };
  }

  // ----------------------------------------------------------
  // Purchase Object
  // ----------------------------------------------------------

  function canPurchaseHomeObject(obj) {
    if (!obj || !obj.placeId) return false;
    if (!hasCompletedPlace(obj.placeId)) return false;

    const capital = getCapital();
    if ((capital.economic || 0) < (obj.cost || 0)) return false;

    return true;
  }

  function purchaseHomeObject(obj) {
    if (!obj || !obj.id || !obj.placeId) return false;
    if (!canPurchaseHomeObject(obj)) return false;

    const capital = getCapital();
    const cost = Number(obj.cost || 0);

    capital.economic = Math.max(0, (capital.economic || 0) - cost);
    saveCapital(capital);

    const state = ensure(load());

    if (state.objects.some(o => o.id === obj.id)) return false;

    state.objects.push({
      id: obj.id,
      placeId: obj.placeId,
      unlockedAt: Date.now(),
      economic: obj.capital_effect?.economic || 0,
      cultural: obj.capital_effect?.cultural || 0,
      symbolic: obj.capital_effect?.symbolic || 0,
      autonomy: obj.autonomy || 0
    });

    save(state);
    dispatchHomeChanged();

    return true;
  }

  // ----------------------------------------------------------
  // Sell Object
  // ----------------------------------------------------------

  function sellHomeObject(objectId) {
    if (!objectId) return false;

    const state = ensure(load());
    const index = state.objects.findIndex(o => o.id === objectId);

    if (index === -1) return false;

    const originalDef = window.CIVI_HOME_OBJECTS?.find(o => o.id === objectId);
    const originalCost = Number(originalDef?.cost || 0);
    const refund = Math.round(originalCost * 0.7);

    state.objects.splice(index, 1);
    save(state);

    const capital = getCapital();
    capital.economic = (capital.economic || 0) + refund;
    saveCapital(capital);

    dispatchHomeChanged();

    return true;
  }

  // ----------------------------------------------------------
  // District Logic
  // ----------------------------------------------------------

  function canPurchaseDistrict(districtId) {
    return canMoveToDistrict(districtId).ok;
  }

  function purchaseDistrict(districtId) {
    return moveToDistrict(districtId);
  }

  function moveDistrict(newId) {
    return moveToDistrict(newId);
  }

  function selectDistrict(districtId) {
    return moveToDistrict(districtId);
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  function renderDistrictCard(district, currentId) {
    const isCurrent = String(currentId || "") === String(district.id || "");
    const reason = getDistrictLockReason(district);
    const canSelect = !reason || isCurrent;
    const tagText = normalizeList(district.choice_tags).join(" · ");
    const storeText = normalizeList(district.store_access).join(" · ");
    const classes = ["civi-district-card"];
    const affordability = getAffordabilityLabel(district);

    if (district.isStartOption) classes.push("is-start-option");
    if (isCurrent) classes.push("is-current");

    return `
      <div class="${classes.join(" ")}" style="padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div>
            <div style="font-weight:700;">${getDistrictTitle(district)}</div>
            <div style="font-size:0.88rem;opacity:0.78;margin-top:3px;">${district.isStartOption ? "Startnabolag" : "Låses opp senere"} · ${isCurrent ? "Valgt nå" : "Ikke valgt"}</div>
          </div>
          ${isCurrent ? `<span style="font-size:0.82rem;opacity:0.8;">Valgt</span>` : ""}
        </div>
        <div style="margin-top:8px;line-height:1.45;">${district.shortDesc || ""}</div>
        <div style="font-size:0.86rem;opacity:0.82;margin-top:8px;">Pris: ${formatCost(district)} · Husleie: ${formatRent(district)} · Prestige: ${Number(district.prestige || 0)}</div>
        <div style="font-size:0.86rem;opacity:0.82;margin-top:6px;">Krav: ${requirementText(district)}</div>
        <div style="font-size:0.86rem;opacity:0.82;margin-top:6px;">Råd: ${affordability}</div>
        ${storeText ? `<div style="font-size:0.82rem;opacity:0.72;margin-top:6px;">Butikktilgang: ${storeText}</div>` : ""}
        ${tagText ? `<div style="font-size:0.82rem;opacity:0.72;margin-top:6px;">Valgtagger: ${tagText}</div>` : ""}
        ${!canSelect && reason ? `<div style="font-size:0.82rem;opacity:0.78;margin-top:6px;">Låst: ${reason}</div>` : `<div style="font-size:0.82rem;opacity:0.72;margin-top:6px;">Låst opp: ${district.isStartOption ? "Startnabolag" : "Krav oppfylt"}</div>`}
        <div style="margin-top:10px;">
          <button class="btn" data-civi-district-select="${district.id}" ${canSelect ? "" : "disabled"}>${isCurrent ? "Bor her" : (canSelect ? "Flytt hit" : "Se krav")}</button>
        </div>
      </div>
    `;
  }

  function renderDistrictList() {
    const list = document.getElementById("districtList");
    if (!list) return;

    const state = ensure(load());
    const currentId = state?.home?.district || null;
    const start = getStartDistricts();
    const rest = getAvailableDistricts().filter((district) => district.isStartOption !== true);
    const districts = start.concat(rest);

    list.innerHTML = districts
      .map((district) => renderDistrictCard(district, currentId))
      .join("");
  }

  function renderHomeStatus() {
    const host = document.getElementById("homeStatusContent");
    if (!host) return;

    const state = ensure(load());
    const current = getDistrict(state?.home?.district);

    if (!current) {
      const startDistricts = getStartDistricts().slice(0, 3);

      host.innerHTML = `
        <div class="latest-knowledge-box">
          <div class="lk-topic">Velg nabolag</div>
          <div class="lk-category">Tre gratis alternativer fra start</div>
          <div class="lk-text">Nabolaget setter hjemfølelse, hverdag, butikktilgang, boligspor, husleie og prestige i Civication.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
          ${startDistricts.map((district) => renderDistrictCard(district, null)).join("")}
        </div>
        <button class="btn" data-civi-open-districts style="margin-top:12px;">Se alle nabolag</button>
      `;

      renderDistrictList();
      return;
    }

    const access = getSelectedDistrictAccess();
    const capital = getCapital();
    const influence = getHomeInfluence();
    const storeText = access.store.length ? access.store.join(" · ") : "Ingen ekstra butikktilgang";
    const choiceTagText = access.choice_tags.length ? access.choice_tags.join(" · ") : "Ingen egne valgtagger";
    const influenceText = Object.entries(influence)
      .filter(([, value]) => Number(value || 0) !== 0)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" · ") || "Ingen ekstra påvirkning";
    const pressure = state?.home?.housingPressure || "none";
    const arrears = Number(state?.home?.rentArrears || 0);
    const rentPressure = getRentPressure();
    const support = getSupportEligibility();
    const pressureText = pressure === "crisis"
      ? `Krise: ${arrears} PC i boligpress`
      : pressure === "pressure"
        ? `Press: ${arrears} PC i boligpress`
        : "Stabilt";

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">Hjem</div>
        <div class="lk-category">${current.name}</div>
        <div class="lk-text">${current.shortDesc || "Du har valgt nabolag."}</div>
      </div>
      <div style="margin-top:10px;padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
        <div style="font-weight:700;">Boligstatus</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Økonomisk kapital nå: ${getEconomicCapital(capital)}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Hjem-påvirkning: ${influenceText}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Butikktilgang: ${storeText}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Valgtagger: ${choiceTagText}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Husleie: ${formatRent(current)}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Prestige: ${access.prestige}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Boligtilgang: ${access.housing.length ? access.housing.join(" · ") : "Ingen egne boligtagger"}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Status: ${getHousingStatusLabel()}</div>
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Boligpress: ${pressureText} · ${rentPressure.label} (${rentPressure.score}/100)</div>
        ${rentPressure.noIncome ? `<div style="font-size:0.9rem;color:#ffd27a;margin-top:6px;">Advarsel: ingen jobb eller inntekt registrert. ${support.supportReason}.</div>` : ""}
        <div style="font-size:0.9rem;opacity:0.82;margin-top:6px;">Flyttinger: ${Number(state?.home?.moveCount || 0)}</div>
        <button class="btn" data-civi-open-districts style="margin-top:10px;">Bytt nabolag</button>
        <button class="btn" data-civi-apply-rent style="margin-top:10px;margin-left:6px;">Betal husleie</button>
      </div>
    `;

    renderDistrictList();
  }

  function openDistrictModal() {
    renderDistrictList();
    const modal = document.getElementById("districtModal");
    if (modal) modal.style.display = "flex";
  }

  function closeDistrictModal() {
    const modal = document.getElementById("districtModal");
    if (modal) modal.style.display = "none";
  }

  let handlersBound = false;

  function bindHandlers() {
    if (handlersBound) return;
    handlersBound = true;

    document.addEventListener("click", function (event) {
      const target = /** @type {HTMLElement | null} */ (event.target instanceof HTMLElement ? event.target : null);
      if (!target) return;

      const openButton = target.closest("[data-civi-open-districts]");
      if (openButton) {
        event.preventDefault();
        openDistrictModal();
        return;
      }

      const rentButton = target.closest("[data-civi-apply-rent]");
      if (rentButton) {
        event.preventDefault();
        applyRentTick(true);
        renderHomeStatus();
        return;
      }

      const selectButton = target.closest("[data-civi-district-select]");
      if (selectButton) {
        event.preventDefault();
        const districtId = selectButton.getAttribute("data-civi-district-select");
        if (!districtId) return;
        const ok = selectDistrict(districtId);
        if (ok) closeDistrictModal();
        renderHomeStatus();
        return;
      }

      if (target.id === "closeDistrictModal") {
        event.preventDefault();
        closeDistrictModal();
      }
    });
  }

  function boot() {
    bindHandlers();
    applyRentTick(false);
    renderHomeStatus();
  }

  // ----------------------------------------------------------
  // District Definitions
  // ----------------------------------------------------------

  const DISTRICTS = {

    grunerlokka: {
      id: "grunerlokka",
      name: "Grünerløkka",
      baseCost: 0,
      rent: 6,
      prestige: 5,
      isStartOption: true,
      shortDesc: "Kreativt, sosialt og litt kantete. Bra for kultur, små steder, kollektivfølelse og byliv.",
      quizRequirements: {},
      visitRequirementPlaceIds: [],
      housing_access: ["stable_home", "collective", "edge_district", "creative_collective"],
      store_access: ["home"],
      choice_tags: ["culture", "local", "community", "street"],
      modifiers: {
        cultural: 10,
        visibility: 5,
        autonomy: 5
      }
    },

    sagene: {
      id: "sagene",
      name: "Sagene",
      baseCost: 0,
      rent: 4,
      prestige: 4,
      isStartOption: true,
      shortDesc: "Roligere hverdagsby med park, rutiner og nabolagsfølelse. Bra for stabilitet og hjemlig rytme.",
      quizRequirements: {},
      visitRequirementPlaceIds: [],
      housing_access: ["stable_home", "quiet_district", "family_friendly"],
      store_access: ["home"],
      choice_tags: ["family", "security", "local", "budget"],
      modifiers: {
        integrity: 10,
        autonomy: 5
      }
    },

    sondre_nordstrand: {
      id: "sondre_nordstrand",
      name: "Søndre Nordstrand",
      baseCost: 0,
      rent: 3,
      prestige: 2,
      isStartOption: true,
      shortDesc: "Mer plass, grønnere kanter og større avstand til sentrum. Bra for ro, natur og handlingsrom.",
      quizRequirements: {},
      visitRequirementPlaceIds: [],
      housing_access: ["stable_home", "quiet_district", "green_edge"],
      store_access: ["home"],
      choice_tags: ["outdoor", "security", "family", "frugality"],
      modifiers: {
        integrity: 10,
        visibility: -5,
        autonomy: 5
      }
    },

    gronland: {
      id: "gronland", name: "Grønland", baseCost: 20, rent: 5, prestige: 3, isStartOption: false,
      shortDesc: "Tett, mangfoldig og billigere sentrumsnært. Krever litt lokal kunnskap.",
      quizRequirements: { samfunn: 1 }, visitRequirementPlaceIds: ["gronland"],
      housing_access: ["urban_core", "budget"], store_access: ["home", "food"], choice_tags: ["local", "budget", "community"], modifiers: { cultural: 5, autonomy: 5 }
    },

    toyen: {
      id: "toyen", name: "Tøyen", baseCost: 25, rent: 5, prestige: 4, isStartOption: false,
      shortDesc: "Park, kultur og nabolagsliv med moderat press.",
      quizRequirements: { kunst: 1 }, visitRequirementPlaceIds: ["toyen", "toyenparken"],
      housing_access: ["stable_home", "creative_collective"], store_access: ["home"], choice_tags: ["culture", "local", "budget"], modifiers: { cultural: 8 }
    },

    majorstuen: {
      id: "majorstuen", name: "Majorstuen", baseCost: 55, rent: 9, prestige: 7, isStartOption: false,
      shortDesc: "Knutepunkt med høyere leie, god mobilitet og mer status.",
      quizRequirements: { naeringsliv: 1 }, visitRequirementPlaceIds: ["majorstuen"],
      housing_access: ["central_comfort", "high_density"], store_access: ["home", "coffee"], choice_tags: ["mobility", "status"], modifiers: { visibility: 8 }
    },

    gamle_oslo: {
      id: "gamle_oslo", name: "Gamle Oslo", baseCost: 10, rent: 4, prestige: 3, isStartOption: false,
      shortDesc: "Lavere kostnader og sterk lokal forankring.",
      quizRequirements: {}, visitRequirementPlaceIds: ["gamle_oslo"],
      housing_access: ["stable_home", "budget"], store_access: ["home"], choice_tags: ["local", "frugality"], modifiers: { autonomy: 5 }
    },

    frogner: {
      id: "frogner",
      name: "Frogner",
      baseCost: 70,
      rent: 12,
      prestige: 9,
      isStartOption: false,
      shortDesc: "Status, fasade og tung symbolsk kapital. Dyrt, synlig og sosialt kodet.",
      quizRequirements: {
        naeringsliv: 2,
        kunst: 1
      },
      visitRequirementPlaceIds: ["frogner", "frognerparken", "vigelandsparken"],
      housing_access: ["status_district", "central_comfort", "representational"],
      store_access: ["home", "luxury"],
      choice_tags: ["status", "luxury", "visibility"],
      modifiers: {
        visibility: 10,
        integrity: -5,
        autonomy: 5
      }
    },

    ullern: {
      id: "ullern",
      name: "Ullern",
      baseCost: 65,
      rent: 10,
      prestige: 8,
      isStartOption: false,
      shortDesc: "Komfort, familieøkonomi og trygg avstand. Stabilt, men krevende å opprettholde.",
      quizRequirements: {
        naeringsliv: 2
      },
      visitRequirementPlaceIds: ["ullern"],
      housing_access: ["quiet_district", "family_friendly", "status_district"],
      store_access: ["home"],
      choice_tags: ["family", "security", "status"],
      modifiers: {
        economic: 10,
        visibility: 5
      }
    },

    sentrum: {
      id: "sentrum",
      name: "Sentrum",
      baseCost: 80,
      rent: 14,
      prestige: 7,
      isStartOption: false,
      shortDesc: "Tett, dyrt og effektivt. Gir nærhet til alt, men også mer press og mindre ro.",
      quizRequirements: {
        politikk: 2,
        naeringsliv: 2
      },
      visitRequirementPlaceIds: ["sentrum", "torggata", "youngstorget"],
      housing_access: ["urban_core", "high_density", "central_comfort"],
      store_access: ["home", "electronics", "coffee"],
      choice_tags: ["mobility", "status", "visibility", "process"],
      modifiers: {
        visibility: 15,
        autonomy: -5
      }
    }

  };

  // ----------------------------------------------------------
  // Export
  // ----------------------------------------------------------

  window.CivicationHome = /** @type {any} */ ({
    getState,
    getHomeInfluence,
    getDistrict,
    getDistrictName,
    getCurrentDistrict,
    getAvailableDistricts,
    getStartDistricts,
    getSelectedDistrictAccess,
    getHomeSnapshot,
    getDistrictViewModels,
    getDistrictLockReason,
    unlockDistrict,
    canMoveToDistrict,
    moveToDistrict,
    getRentPressure,
    applyRentTick,
    getHousingStatus,
    getHousingStatusLabel,
    getHomeConsequences,
    getSupportEligibility,
    purchaseHomeObject,
    sellHomeObject,
    purchaseDistrict,
    moveDistrict,
    selectDistrict,
    canPurchaseDistrict,
    canPurchaseHomeObject,
    hasVisitedDistrict,
    applyHousingPeriodCosts,
    render: renderHomeStatus,
    boot,
    DISTRICTS
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    window.setTimeout(boot, 0);
  }

  window.addEventListener("civi:dataReady", renderHomeStatus);
  window.addEventListener("civi:booted", renderHomeStatus);
  window.addEventListener("updateProfile", renderHomeStatus);
  window.addEventListener("civi:homeChanged", renderHomeStatus);

})();