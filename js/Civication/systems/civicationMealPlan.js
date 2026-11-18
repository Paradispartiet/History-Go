// Private weekly meal planning for Civication. Not a second day/scene engine.
// The recipes below are illustrative player choices, NOT verified store stock or prices.
(function () {
  "use strict";

  const KEY = "hg_civi_meal_plans_v1";
  const VERSION = 1;
  const DAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
  const MEALS = {
    breakfast: { label: "Frokost", from: 6 * 60, to: 10 * 60 },
    lunch: { label: "Lunsj", from: 11 * 60, to: 14 * 60 },
    dinner: { label: "Middag", from: 16 * 60, to: 20 * 60 },
    supper: { label: "Kveldsmat", from: 20 * 60, to: 23 * 60 }
  };

  // Ingredients are quantities PER PERSON in the stated units. Nothing in this
  // editorial example catalog claims a retailer carries an item.
  const RECIPES = {
    oats: { name: "Havregrøt med banan", meals: ["breakfast", "supper"], ingredients: [["havregryn", "Havregryn", 70, "g"], ["melk", "Melk", 200, "ml"], ["banan", "Banan", 1, "stk"]] },
    bread: { name: "Brødskiver med ost", meals: ["breakfast", "lunch", "supper"], ingredients: [["brod", "Brød", 100, "g"], ["ost", "Ost", 40, "g"]] },
    yogurt: { name: "Yoghurt med frukt", meals: ["breakfast", "supper"], ingredients: [["yoghurt", "Yoghurt", 150, "g"], ["eple", "Eple", 1, "stk"]] },
    eggs: { name: "Egg og knekkebrød", meals: ["breakfast", "lunch", "supper"], ingredients: [["egg", "Egg", 2, "stk"], ["knekkebrod", "Knekkebrød", 40, "g"]] },
    wraps: { name: "Wrap med bønner og salat", meals: ["lunch", "dinner"], ingredients: [["tortilla", "Tortilla", 1, "stk"], ["bonner", "Bønner", 120, "g"], ["salat", "Salat", 50, "g"]] },
    salad: { name: "Grønnsakssalat med kikerter", meals: ["lunch", "dinner"], ingredients: [["kikerter", "Kikerter", 120, "g"], ["salat", "Salat", 100, "g"], ["tomat", "Tomat", 100, "g"]] },
    soup: { name: "Linsesuppe", meals: ["lunch", "dinner"], ingredients: [["linser", "Linser, tørre", 80, "g"], ["gulrot", "Gulrot", 100, "g"], ["buljong", "Buljong", 250, "ml"]] },
    pasta: { name: "Pasta med tomatsaus", meals: ["dinner"], ingredients: [["pasta", "Pasta, tørr", 100, "g"], ["tomat", "Tomat", 150, "g"], ["lok", "Løk", 60, "g"]] },
    wok: { name: "Grønnsakswok med ris", meals: ["dinner"], ingredients: [["ris", "Ris, tørr", 90, "g"], ["wokgront", "Wokgrønnsaker", 200, "g"], ["soyasaus", "Soyasaus", 20, "ml"]] },
    salmon: { name: "Laks med poteter", meals: ["dinner"], ingredients: [["laks", "Laks", 150, "g"], ["potet", "Potet", 200, "g"], ["brokkoli", "Brokkoli", 120, "g"]] },
    chicken: { name: "Kyllinggryte med ris", meals: ["dinner"], ingredients: [["kylling", "Kylling", 150, "g"], ["ris", "Ris, tørr", 90, "g"], ["gulrot", "Gulrot", 100, "g"]] },
    taco: { name: "Taco med bønner", meals: ["dinner"], ingredients: [["tortilla", "Tortilla", 2, "stk"], ["bonner", "Bønner", 130, "g"], ["tomat", "Tomat", 100, "g"], ["salat", "Salat", 50, "g"]] },
    pizza: { name: "Hjemmelaget grønnsakspizza", meals: ["dinner"], ingredients: [["pizzabunn", "Pizzabunn", 0.5, "stk"], ["ost", "Ost", 80, "g"], ["tomat", "Tomat", 100, "g"], ["paprika", "Paprika", 80, "g"]] },
    omelet: { name: "Omelett og salat", meals: ["lunch", "dinner", "supper"], ingredients: [["egg", "Egg", 2, "stk"], ["ost", "Ost", 30, "g"], ["salat", "Salat", 50, "g"]] },
    fruit: { name: "Frukt og knekkebrød", meals: ["supper"], ingredients: [["eple", "Eple", 1, "stk"], ["knekkebrod", "Knekkebrød", 40, "g"]] }
  };

  // A template is a complete seven-day set of choices; it is applied only by
  // explicit user action and can be freely edited afterwards.
  const TEMPLATES = {
    varied: {
      label: "Variert uke",
      breakfast: ["oats", "bread", "yogurt", "oats", "eggs", "bread", "yogurt"],
      lunch: ["wraps", "salad", "soup", "bread", "wraps", "omelet", "salad"],
      dinner: ["pasta", "wok", "salmon", "chicken", "pizza", "taco", "soup"],
      supper: ["fruit", "yogurt", "bread", "fruit", "eggs", "yogurt", "omelet"]
    },
    green: {
      label: "Grønn uke",
      breakfast: ["oats", "yogurt", "oats", "bread", "oats", "yogurt", "oats"],
      lunch: ["salad", "soup", "wraps", "salad", "soup", "wraps", "salad"],
      dinner: ["wok", "pasta", "soup", "taco", "pizza", "salad", "wok"],
      supper: ["fruit", "bread", "yogurt", "fruit", "bread", "fruit", "yogurt"]
    }
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function gameDayIndex() {
    const index = Number(window.CivicationCalendar?.getClock?.()?.dayIndex);
    return Number.isSafeInteger(index) && index > 0 ? index : 1;
  }
  function getWeekKey(dayIndex = gameDayIndex()) {
    const index = Number(dayIndex);
    if (!Number.isSafeInteger(index) || index < 1) throw new Error("Invalid game day");
    return "game-week-" + String(Math.floor((index - 1) / 7) + 1).padStart(6, "0");
  }
  function weekKey(raw) {
    const result = raw == null ? getWeekKey() : String(raw);
    if (!/^game-week-[0-9]{6}$/.test(result) || result.endsWith("000000")) throw new Error("Invalid game week");
    return result;
  }
  function readStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
      return parsed && parsed.version === VERSION && parsed.weeks && typeof parsed.weeks === "object" && !Array.isArray(parsed.weeks)
        ? parsed : { version: VERSION, weeks: {} };
    } catch {
      return { version: VERSION, weeks: {} };
    }
  }
  function makeWeek(key) { return { weekKey: key, people: 2, meals: {}, restaurantMeals: {}, restaurantBudgetNok: null }; }
  function getWeek(rawKey) {
    const key = weekKey(rawKey);
    const stored = readStore().weeks[key];
    return stored && stored.weekKey === key && typeof stored.meals === "object" && !Array.isArray(stored.meals)
      ? clone(stored) : makeWeek(key);
  }
  function saveWeek(value) {
    const store = readStore();
    store.weeks[value.weekKey] = clone(value);
    localStorage.setItem(KEY, JSON.stringify(store));
    return clone(value);
  }
  function validDay(index) { return Number.isInteger(index) && index >= 0 && index < 7; }
  function validMeal(meal) { return Object.prototype.hasOwnProperty.call(MEALS, meal); }
  function validateSlot(day, meal, recipeId) {
    if (!validDay(day) || !validMeal(meal)) throw new Error("Invalid meal slot");
    if (recipeId !== null && (!Object.prototype.hasOwnProperty.call(RECIPES, recipeId) || !RECIPES[recipeId].meals.includes(meal))) {
      throw new Error("Recipe cannot be selected for meal");
    }
  }
  function setMeal(day, meal, recipeId, rawKey) {
    validateSlot(day, meal, recipeId);
    const week = getWeek(rawKey);
    if (!week.meals[day]) week.meals[day] = {};
    if (recipeId === null) delete week.meals[day][meal];
    else week.meals[day][meal] = recipeId;
    if (week.restaurantMeals?.[day]) delete week.restaurantMeals[day][meal];
    return saveWeek(week);
  }
  function setPeople(people, rawKey) {
    if (!Number.isSafeInteger(people) || people < 1 || people > 12) throw new Error("Invalid household size");
    const week = getWeek(rawKey);
    week.people = people;
    return saveWeek(week);
  }
  function applyTemplate(templateId, rawKey) {
    const template = TEMPLATES[templateId];
    if (!template) throw new Error("Unknown template");
    const week = getWeek(rawKey);
    const meals = {};
    for (let day = 0; day < 7; day++) {
      meals[day] = {};
      for (const meal of Object.keys(MEALS)) {
        const recipeId = template[meal][day];
        validateSlot(day, meal, recipeId);
        meals[day][meal] = recipeId;
      }
    }
    week.meals = meals;
    week.restaurantMeals = {};
    return saveWeek(week);
  }
  // Planning only: public Fysen restaurant prices are NOK øre per serving.
  // Never debit PC, simulate eating, contact a restaurant or create AHA records.
  function setRestaurantBudgetNok(amount, rawKey) {
    if (amount !== null && (!Number.isSafeInteger(amount) || amount < 0 || amount > 100000)) {
      throw new Error("Invalid weekly restaurant budget");
    }
    const week = getWeek(rawKey);
    week.restaurantBudgetNok = amount;
    return saveWeek(week);
  }
  function setRestaurantMeal(day, meal, place, rawKey) {
    if (!validDay(day) || !validMeal(meal)) throw new Error("Invalid restaurant meal slot");
    const week = getWeek(rawKey);
    if (!week.restaurantMeals || typeof week.restaurantMeals !== "object") week.restaurantMeals = {};
    if (place === null) {
      if (week.restaurantMeals[day]) delete week.restaurantMeals[day][meal];
      return saveWeek(week);
    }
    if (!place || typeof place !== "object" ||
        typeof place.restaurantId !== "string" || !place.restaurantId.trim() ||
        place.restaurantId.length > 150 ||
        typeof place.name !== "string" || !place.name.trim() || place.name.length > 200 ||
        typeof place.dishName !== "string" || !place.dishName.trim() || place.dishName.length > 300 ||
        !Number.isSafeInteger(place.portions) || place.portions < 1 || place.portions > 12 ||
        (place.priceMinor !== null && place.priceMinor !== undefined &&
          (!Number.isSafeInteger(place.priceMinor) || place.priceMinor < 0 || place.priceMinor > 5000000))) {
      throw new Error("Invalid restaurant meal");
    }
    if (!week.restaurantMeals[day]) week.restaurantMeals[day] = {};
    week.restaurantMeals[day][meal] = {
      restaurantId: place.restaurantId,
      name: place.name.trim(),
      dishName: place.dishName.trim(),
      portions: place.portions,
      priceMinor: place.priceMinor ?? null
    };
    if (week.meals[day]) delete week.meals[day][meal];
    return saveWeek(week);
  }
  function getRestaurantSummary(rawKey) {
    const week = getWeek(rawKey);
    const budget = Number.isSafeInteger(week.restaurantBudgetNok) &&
      week.restaurantBudgetNok >= 0 && week.restaurantBudgetNok <= 100000
      ? week.restaurantBudgetNok : null;
    const entries = [];
    let pricedTotalMinor = 0;
    let unpriced = 0;
    for (let day = 0; day < 7; day++) {
      for (const meal of Object.keys(MEALS)) {
        const item = week.restaurantMeals?.[day]?.[meal];
        if (!item || typeof item.name !== "string" || typeof item.dishName !== "string" ||
            !Number.isSafeInteger(item.portions) || item.portions < 1 || item.portions > 12) continue;
        const priceMinor = Number.isSafeInteger(item.priceMinor) &&
          item.priceMinor >= 0 && item.priceMinor <= 5000000 ? item.priceMinor : null;
        if (priceMinor === null) unpriced++;
        else pricedTotalMinor += priceMinor * item.portions;
        entries.push({
          day, meal, name:item.name, dishName:item.dishName,
          portions:item.portions, priceMinor
        });
      }
    }
    const budgetMinor = budget === null ? null : budget * 100;
    return {
      currency:"NOK", budgetNok:budget, budgetMinor,
      plannedMinor:pricedTotalMinor, unpricedMeals:unpriced,
      remainingMinor:budgetMinor === null ? null : budgetMinor - pricedTotalMinor,
      meals:entries
    };
  }

  function getRecipes(meal) {
    if (!validMeal(meal)) throw new Error("Invalid meal type");
    return Object.entries(RECIPES).filter(([, value]) => value.meals.includes(meal))
      .map(([id, value]) => ({ id, name: value.name }));
  }
  function getShoppingList(rawKey, pantry = {}) {
    const week = getWeek(rawKey);
    const people = Number.isSafeInteger(week.people) && week.people >= 1 && week.people <= 12 ? week.people : 2;
    const totals = new Map();
    for (let day = 0; day < 7; day++) {
      for (const meal of Object.keys(MEALS)) {
        const id = week.meals[day]?.[meal];
        if (!Object.prototype.hasOwnProperty.call(RECIPES, id || "")) continue;
        if (!RECIPES[id].meals.includes(meal)) continue;
        for (const [ingredientId, name, amount, unit] of RECIPES[id].ingredients) {
          const key = ingredientId + ":" + unit;
          const row = totals.get(key) || { id: ingredientId, name, unit, required: 0 };
          row.required += amount * people;
          totals.set(key, row);
        }
      }
    }
    return [...totals.values()].map(row => {
      const available = Number(pantry[row.id]);
      const atHome = Number.isFinite(available) && available > 0 ? available : 0;
      return { ...row, quantity: Math.max(0, Math.round((row.required - atHome) * 100) / 100) };
    }).filter(row => row.quantity > 0).sort((a, b) => a.name.localeCompare(b.name, "no"));
  }
  // Ingredient IDs for the player's actual planned meals on one game day.
  // No retailer, inventory or real price is inferred from recipe ingredients.
  function getIngredientIdsByMeal(dayIndex = gameDayIndex()) {
    if (!Number.isSafeInteger(dayIndex) || dayIndex < 1) throw new Error("Invalid game day");
    const day = (dayIndex - 1) % 7;
    const chosen = getWeek(getWeekKey(dayIndex)).meals[day] || {};
    const output = {};
    for (const meal of Object.keys(MEALS)) {
      const recipeId = chosen[meal];
      if (!Object.prototype.hasOwnProperty.call(RECIPES, recipeId || "")) continue;
      if (!RECIPES[recipeId].meals.includes(meal)) continue;
      output[meal] = [...new Set(RECIPES[recipeId].ingredients.map(item => item[0]))];
    }
    return output;
  }
  /** @param {{ dayIndex?: number, currentMinutes?: number, recentlyAte?: boolean }} [options] */
  function suggestionForTime({ dayIndex = gameDayIndex(), currentMinutes, recentlyAte = false } = {}) {
    if (recentlyAte || typeof currentMinutes !== "number" || !Number.isInteger(currentMinutes) || currentMinutes < 0 || currentMinutes >= 1440) return null;
    if (!Number.isSafeInteger(dayIndex) || dayIndex < 1) return null;
    const meal = Object.keys(MEALS).find(key => currentMinutes >= MEALS[key].from && currentMinutes < MEALS[key].to);
    if (!meal) return null;
    const day = (dayIndex - 1) % 7;
    const week = getWeek(getWeekKey(dayIndex));
    const id = week.meals[day]?.[meal];
    if (!Object.prototype.hasOwnProperty.call(RECIPES, id || "") || !RECIPES[id].meals.includes(meal)) return null;
    return { dayIndex, meal, mealLabel: MEALS[meal].label, recipeId: id, name: RECIPES[id].name, source: "user_week_plan", verifiedStoreAvailability: false };
  }

  window.CivicationMealPlan = Object.freeze({
    DAYS: Object.freeze(DAYS.slice()),
    MEALS: Object.freeze(clone(MEALS)),
    templates: () => Object.entries(TEMPLATES).map(([id, data]) => ({ id, label: data.label })),
    getWeekKey, getWeek, getRecipes, setMeal, setPeople, applyTemplate,
    getShoppingList, getIngredientIdsByMeal, suggestionForTime,
    setRestaurantBudgetNok, setRestaurantMeal, getRestaurantSummary
  });
})();
