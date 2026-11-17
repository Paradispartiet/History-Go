#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "Civication.html"), "utf8");
assert.match(html, /id="civiPersonalRoutePanel"/);
assert.match(html, /js\/Civication\/systems\/civicationPersonalRoutes\.js/);
assert.match(html, /js\/Civication\/ui\/CivicationPersonalRoutesUI\.js/);
assert(html.indexOf("js/Civication/systems/civicationPersonalRoutes.js") <
  html.indexOf("js/Civication/ui/CivicationPersonalRoutesUI.js"));

const storage = new Map();
const localStorage = {
  getItem: k => storage.get(k) ?? null,
  setItem: (k,v) => storage.set(k,String(v)),
};
const currentJob = { career_id: "naeringsliv", role_id: "naer_ekspeditor", brand_id: "butikk-a" };
const W = { CivicationState: { getActivePosition: () => currentJob } };
vm.runInNewContext(
  fs.readFileSync(path.join(root,"js/Civication/systems/civicationPersonalRoutes.js"),"utf8"),
  { window: W, localStorage, console }
);
const api = W.CivicationPersonalRoutes;
assert.equal(storage.size, 0, "reading module has no side effects");
assert.equal(api.getHome(), null);
assert.equal(api.getWorkplace(), null);
assert.equal(api.planCommute({ weekDay: 0 }).reason, "HOME_REQUIRED");
assert.throws(() => api.setWorkplace({name:"Arbeidssted"}), /address is required/);
assert.equal(storage.size, 0, "missing workplace address cannot be stored");
api.setHome({ name:"Hjem", address:"Hjemadresse uten koordinater", source:"player_entered" });
api.setWorkplace({ name:"Arbeidssted", address:"Gate 1, Oslo, Norge" });
assert.equal(api.getWorkplace().geocoded, false);
assert.equal(api.planCommute({ weekDay: 0 }).reason,"COORDINATES_REQUIRED", "no fake map routes from street strings");
assert.throws(() => api.setWorkplace({ address:"Gate 1",latitude:60 }), /Both latitude and longitude/);
assert.throws(() => api.setHome({latitude:91,longitude:10}), /Invalid geographic coordinates/);
api.setHome({name:"Hjem", address:"Adresse H",latitude:59.93,longitude:10.76});
api.setWorkplace({name:"Arbeidssted",address:"Adresse W",latitude:59.91,longitude:10.75});
const result = api.planCommute({weekDay:0,travelMode:"walking",direction:"to_work"});
assert.equal(result.ok,true);
assert.equal(result.route.status,"planned");
assert.equal(result.route.realWorldTravelConfirmed,false);
assert.equal(result.route.roadGeometry,null);
assert.equal(result.route.durationMinutes,null);
assert.equal(result.route.distanceMeters,null);
assert.equal(result.route.routingStatus,"awaiting_road_router");
assert.equal(result.route.waypoints.length,2);
assert.equal(result.route.waypoints[0].name,"Hjem");
assert.equal(result.route.waypoints[1].name,"Arbeidssted");
assert.equal(result.route.visibility,"private");
assert.equal(api.listRoutes().length,1);
const reversed = api.planCommute({weekDay:0,direction:"to_home",travelMode:"cycling"});
assert.equal(reversed.route.waypoints[0].name,"Arbeidssted");
assert.equal(reversed.route.waypoints[1].name,"Hjem");
assert.equal(api.listRoutes().length,2);
assert.equal(api.planCommute({weekDay:7}).reason,"INVALID_WEEKDAY");
assert.equal(api.planCommute({weekDay:0,travelMode:"airplane"}).reason,"INVALID_TRAVEL_MODE");
assert(api.deleteRoute(result.route.id));
assert(!api.deleteRoute(result.route.id));
assert.equal(api.listRoutes().length,1);
const otherJob = { career_id:"naeringsliv",role_id:"naer_ekspeditor",brand_id:"butikk-b" };
assert.equal(api.getWorkplace(otherJob),null,"workplace is scoped to employer, not generic career");
assert.equal(api.planCommute({active:otherJob,weekDay:0}).reason,"WORK_ADDRESS_REQUIRED");
const sourcedJob = {
  career_id: "vitenskap",role_id:"forsker",brand_id:"laboratoriet",
  employer_context:{address:"Verifiseres av arbeidsgiver 9",lat:59.91,lon:10.8}
};
assert.equal(api.getWorkplace(sourcedJob).source,"employer_context", "explicit context address may be read without copying it to storage");
assert.equal(api.planCommute({active:sourcedJob,weekDay:0}).ok,true);
assert(!storage.has("hg_civi_travel_v1"),"planning must not assert a real game journey");
assert(!storage.has("hg_civi_wallet_v1"),"planning must not cost money");
assert(!storage.has("aha_import_payload_v1"),"no automatic AHA transfer");
assert.deepEqual([...storage.keys()],["hg_civi_personal_routes_v1"],"one private storage owner");
api.clearHome();
assert.equal(api.planCommute({weekDay:0}).reason,"HOME_REQUIRED");
api.clearWorkplace();
assert.equal(api.getWorkplace(),null);
storage.set("hg_civi_personal_routes_v1","invalid");
assert.equal(api.getHome(),null,"malformed save fails closed");
console.log("PASS: private Civication workplace address, route status, employer isolation and no GPS/finance writes");
