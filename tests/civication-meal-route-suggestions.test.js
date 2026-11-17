#!/usr/bin/env node
"use strict";
// Only synthetic candidates. No real personal coordinates or assumed shop inventory.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const script = fs.readFileSync(path.join(__dirname, "..", "js/Civication/systems/civicationMealRouteSuggestions.js"), "utf8");
const globalWindow = {};
vm.runInNewContext(script, { window: globalWindow });
const api = globalWindow.CivicationMealRouteSuggestions;
const NOW = new Date("2026-11-17T12:00:00+01:00");
const evidence = {sourceUrl:"https://example.org/evidence",checkedAt:"2026-11-17T08:00:00+01:00",validUntil:"2026-11-18T08:00:00+01:00"};
const route = {
  id:"commute::demo",kind:"commute",status:"planned",visibility:"private",
  weekDay:0,routingStatus:"verified_route",
  geometryRevision:"road-graph-revision-5",roadGeometry:{type:"LineString",coordinates:[[10.7,59.9],[10.8,59.91]]},
  routeEvidence:evidence,waypoints:[{name:"Demo hjem"},{name:"Demo jobb"}]
};
const proof = (passMinutes, detourMinutes=3) => ({
  routeId:route.id,geometryRevision:route.geometryRevision,passMinutes,detourMinutes,evidence
});
const service = (passMinutes,type) => ({
  state:"open_at_pass_time",passMinutes,type,evidence
});
const food = (id,passMinutes,meal,detourMinutes=3) => ({
  id,name:"Demo restaurant " + id,kind:"restaurant",
  routeProof:proof(passMinutes,detourMinutes),service:service(passMinutes,"kitchen"),
  dish:{name:"Mat på meny",meals:[meal],menuEvidence:evidence,priceMinor:12300,
    priceEvidence:evidence}
});
const grocery = (passMinutes) => ({
  id:"demo-shop",name:"Demo matbutikk",kind:"grocery",
  routeProof:proof(passMinutes),service:service(passMinutes,"store"),
  listings:[{ingredientId:"pasta",name:"Pasta",listingEvidence:evidence,
    stockState:"confirmed_available",stockEvidence:evidence}]
});
const weekPlan={meals:{0:{breakfast:"oats",lunch:"wraps",dinner:"pasta",supper:"fruit"}}};
const shoppingList=[{id:"pasta",quantity:200}];
const places=[food("breakfast",480,"breakfast"),food("lunch",720,"lunch"),food("dinner",1080,"dinner"),
  food("supper",1260,"supper"), grocery(930)];
const params={now:NOW,gameDayIndex:1,route,weekPlan,shoppingList,places,ingredientIdsByMeal:{dinner:["pasta"]}};
const select = change => api.eligibleCandidates({...params,...change});
const hits=select();
assert.equal(hits.length,4,"one match per meal, evening and lunch etc");
assert.deepEqual(Array.from(hits, x=>x.meal).sort(),["breakfast","dinner","lunch","supper"]);
assert.equal(hits.find(x=>x.meal==="dinner").kind,"grocery",
  "grocery stop just before dinner takes precedence only when detour beats restaurant");
assert.equal(hits.find(x=>x.meal==="lunch").priceMinor,12300);
assert.equal(select({optedOut:true}).length,0);
assert.equal(select({recentlyAte:true}).length,0);
assert.equal(select({gameDayIndex:2}).length,0,"wrong weekday must not claim another route");
assert.equal(select({route:{...route,routingStatus:"awaiting_road_router",roadGeometry:null}}).length,0,
  "endpoints are not a route");
assert.equal(select({route:{...route,routeEvidence:null}}).length,0);
assert.equal(select({route:{...route,roadGeometry:{}}}).length,0, "a truthy placeholder is not a routed line");
assert.equal(select({route:{...route,roadGeometry:{type:"LineString",coordinates:[[999,59.9],[10.8,59.91]]}}}).length,0,
  "invalid geographic coordinates must not authorize suggestions");
assert.equal(select({route:{...route,geometryRevision:null}}).length,0);
assert.equal(select({places:[{...food("bad-route",720,"lunch"),routeProof:{...proof(720),routeId:"another"}}]}).length,0);
assert.equal(select({places:[{...food("bad-revision",720,"lunch"),routeProof:{...proof(720),geometryRevision:"stale"}}]}).length,0);
assert.equal(select({places:[food("too-far",720,"lunch",11)]}).length,0);
assert.equal(select({places:[food("too-early",645,"lunch")]}).length,0);
assert.equal(select({places:[food("too-late",850,"lunch")]}).length,0);
assert.equal(select({places:[{...food("unknown-open",720,"lunch"),service:{state:"unknown"}}]}).length,0);
assert.equal(select({places:[{...food("wrong-service",720,"lunch"),service:service(720,"store")}]}).length,0);
assert.equal(select({places:[{...food("expired-menu",720,"lunch"),dish:{name:"Retten",meals:["lunch"],
  menuEvidence:{...evidence,validUntil:"2026-11-17T09:00:00+01:00"},priceMinor:100,
  priceEvidence:evidence}}]}).length,0);
assert.equal(select({places:[{...food("price-missing",720,"lunch"),dish:{name:"Retten",meals:["lunch"],
  menuEvidence:evidence,priceMinor:999999,priceEvidence:null}}]})[0].priceMinor,null,
  "never infer real prices without current evidence");
assert.equal(select({places:[grocery(930)],ingredientIdsByMeal:{lunch:["pasta"]}}).length,0,
  "a dinner ingredient cannot trigger a supposed lunch shopping offer");
assert.equal(select({places:[grocery(930)],ingredientIdsByMeal:{}}).length,0,
  "no meal-specific ingredient evidence means no automatic grocery offer");
assert.equal(select({places:[grocery(930)],shoppingList:[]}).length,0,
  "no grocery suggestions when nothing is needed");
assert.equal(select({places:[grocery(930)],weekPlan:{meals:{}}}).length,0);
assert.equal(select({places:[{...grocery(930),listings:[{ingredientId:"pasta",name:"Pasta",
  listingEvidence:evidence,stockState:"unknown",stockEvidence:null}]}]}).length,0,
  "unverified online product listing is NOT an in-stock claim");
assert.equal(select({places:[grocery(600)]}).length,0,"do not prompt three-hours-before-dinner outside lead window");
assert.equal(select({dismissedMeals:["lunch","dinner"]}).some(x=>x.meal==="dinner"||x.meal==="lunch"),false);
const close = food("closest",720,"lunch",0.5);
const further = food("further",720,"lunch",2);
assert.equal(select({places:[further,close]}).length,1,"no repeated popup for restaurants of same meal");
assert.equal(select({places:[further,close]})[0].placeId,"closest");
const shifted = select({places:[food("night-shift",180,"breakfast")],
  mealWindows:{ breakfast:[120,360], lunch:[660,840], dinner:[960,1200], supper:[1200,1380]}});
assert.equal(shifted.length,1,"meal-time rules can be customized for shift workers");
assert.equal(select({places:[food("lunch",720,"lunch")],now:new Date("2026-11-19T12:00:00+01:00")}).length,0,
  "expired route and venue evidence fail closed");
const storageAccess = /\blocalStorage\b|\bfetch\s*\(|\bsetInterval\s*\(|\bgeolocation\b|\bdispatchEvent\s*\(/;
assert(!storageAccess.test(script),"the recommender must remain read-only with no tracking");
console.log("PASS: verified routed meals, grocery lead time, dedupe, shift hours, expiry, privacy");


// Integration of already-selected weekly meals, *private* saved routes and
// externally verified public places. No restaurant/store is invented.
const BRIDGE_ROOT = path.join(__dirname, "..", "js/Civication/systems");
const storage = new Map();
const localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value))
};
globalWindow.CivicationCalendar = { getClock: () => ({ dayIndex: 1 }) };
globalWindow.CivicationState = {
  getActivePosition: () => ({ career_id: "naeringsliv", brand_id: "demo-employer", role_id: "test-job" })
};
const context = { window: globalWindow, localStorage };
for (const file of ["civicationMealPlan.js", "civicationPersonalRoutes.js", "civicationMealRouteBridge.js"]) {
  vm.runInNewContext(fs.readFileSync(path.join(BRIDGE_ROOT, file), "utf8"), context);
}
const menu = globalWindow.CivicationMealPlan;
const privateRoutes = globalWindow.CivicationPersonalRoutes;
const bridge = globalWindow.CivicationMealRouteBridge;
const noPlan = bridge.build({ gameDayIndex: 1, now: NOW, places: [] });
assert.equal(noPlan.status, "weekly_menu_not_selected");

menu.applyTemplate("varied");
assert.deepEqual(Array.from(menu.getIngredientIdsByMeal(1).dinner),["pasta", "tomat", "lok"]);
assert.deepEqual(Array.from(menu.getIngredientIdsByMeal(1).lunch),["tortilla", "bonner", "salat"]);
assert.equal(bridge.build({ gameDayIndex: 1, now: NOW, places: [] }).status,"verified_commute_required");

privateRoutes.setHome({ name: "Syntetisk hjem", address: "Testadresse 1", latitude: 59.9, longitude: 10.7 });
privateRoutes.setWorkplace({ name: "Syntetisk arbeidssted", address: "Testadresse 2", latitude: 59.91, longitude: 10.8 });
const planned = privateRoutes.planCommute({ weekDay: 0, travelMode: "walking" });
assert.equal(planned.ok, true);
const realRoute = privateRoutes.saveResolvedRoute(planned.route.id, {
  ok: true, routeId: planned.route.id, routingStatus: "verified_route",
  roadGeometry: route.roadGeometry, geometryRevision: "ors-geometry-v1-123abcde",
  distanceMeters: 1200, durationMinutes: 16,
  routeEvidence: { ...evidence, sourceUrl:"https://api.openrouteservice.org/v2/directions/foot-walking/geojson" }
});
assert.equal(bridge.build({ gameDayIndex: 1, now: NOW, places: [] }).status, "verified_venues_required");
const matchProof = passMinutes => ({
  routeId: realRoute.id, geometryRevision: realRoute.geometryRevision,
  passMinutes, detourMinutes: 3, evidence
});
const verifiedLunch = {
  ...food("on-commute-lunch",720,"lunch"),
  routeProof: matchProof(720)
};
const verifiedGroceries = {
  ...grocery(930),
  routeProof: matchProof(930)
};
const inputs={gameDayIndex:1, now:NOW, places:[verifiedLunch,verifiedGroceries]};
const joined=bridge.build(inputs);
assert.equal(joined.status,"verified_offers_found");
assert.equal(joined.routesConsidered,1);
assert.deepEqual(Array.from(joined.offers, offer=>offer.meal).sort(),["dinner","lunch"]);
assert.equal(joined.offers.find(offer=>offer.meal==="dinner").kind,"grocery");
assert.equal(joined.offers.find(offer=>offer.meal==="lunch").kind,"restaurant");
assert.equal(bridge.build({...inputs,optedOut:true}).offers.length,0);
assert.equal(bridge.build({...inputs,gameDayIndex:2}).offers.length,0,"wrong weekday cannot use commute");
assert.equal(bridge.build({...inputs,pantry:{pasta:200000}}).offers.some(offer=>offer.kind==="grocery"),false,
  "already owned ingredient must not trigger shop suggestions");
menu.setMeal(0,"dinner","salmon");
assert.equal(bridge.build(inputs).offers.some(offer=>offer.kind==="grocery"),false,
  "shop must match the NEW selected meal");
privateRoutes.clearWorkplace();
assert.equal(bridge.build(inputs).status,"verified_commute_required");
assert.deepEqual(Array.from(storage.keys()).sort(),["hg_civi_meal_plans_v1","hg_civi_personal_routes_v1"]);
assert(!storage.has("aha_import_payload_v1"), "no inferred AHA export");
assert(!storage.has("hg_civi_wallet_v1"), "read-only proposals never spend money");
const bridgeSource=fs.readFileSync(path.join(BRIDGE_ROOT,"civicationMealRouteBridge.js"),"utf8");
assert(!/\bfetch\s*\(|\bgeolocation\b|\blocalStorage\b/.test(bridgeSource.replace(/^\/\/.*$/gm,"")),
  "bridge must not read or transmit private coordinates");
console.log("PASS: weekly menu ingredients join only matching verified private commutes and public places");
