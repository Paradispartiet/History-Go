#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const load = relative => fs.readFileSync(path.join(root, relative), "utf8");
const shell = load("js/Civication/civicationShellLoader.js");
for (const pathname of ["js/orsConfig.js", "js/Civication/systems/civicationRoadRouter.js"]) {
  assert.equal(shell.split('"' + pathname + '"').length - 1, 2, "shell and legacy lists each contain one reference");
}
assert(shell.indexOf('"js/orsConfig.js"') < shell.indexOf('"js/Civication/systems/civicationRoadRouter.js"'));
const configWindow = { location: { pathname: "/Civication.html" } };
vm.runInNewContext(load("js/orsConfig.js"), { window: configWindow }, { filename: "orsConfig.js" });
assert(configWindow.HG_ORS?.apiKey, "the already configured existing ORS client is reused");
assert(!configWindow.__HG_NATURE_PLACE_BRIDGE_LOADER__, "do not inject HG nature-map script into Civication");

const local = new Map();
const localStorage = {getItem: k => local.get(k) ?? null, setItem:(k,v) => local.set(k,String(v))};
const active = {career_id:"naeringsliv",role_id:"job-1",brand_id:"employer-1"};
const W = { CivicationState: { getActivePosition: () => active }, HG_ORS: {baseUrl:"https://api.openrouteservice.org",apiKey:"FAKE_TEST_TOKEN"} };
let fetchCalls=0, sent;
let payload = { features: [{
  type:"Feature", geometry: {type:"LineString", coordinates:[[10.7,59.91],[10.75,59.92]]},
  properties: { segments: [{distance:2200,duration:1650}]}
}]};
let httpOk = true;
async function fetchMock(url, options) {
  fetchCalls++;
  sent = {url,options};
  return {ok:httpOk,json:async()=>payload};
}
const ctx = {window:W,localStorage,URL,fetch:fetchMock,Date,Number,Math,JSON};
vm.runInNewContext(load("js/Civication/systems/civicationPersonalRoutes.js"),ctx);
vm.runInNewContext(load("js/Civication/systems/civicationRoadRouter.js"),ctx);
const store = W.CivicationPersonalRoutes, router = W.CivicationRoadRouter;

store.setHome({name:"Demo hjem",address:"Syntetisk sted 1",latitude:59.91,longitude:10.7});
store.setWorkplace({name:"Demo jobb",address:"Syntetisk sted 2",latitude:59.92,longitude:10.75});
const proposal = store.planCommute({weekDay:0,travelMode:"walking"});
assert.equal(proposal.ok,true);
const route=proposal.route;
(async()=>{
  let result = await router.calculate(route);
  assert.equal(result.ok,false);
  assert.equal(result.reason,"CONSENT_REQUIRED");
  assert.equal(fetchCalls,0,"no network before explicit click");
  result = await router.calculate(route,{consent:true});
  assert.equal(result.ok,true);
  assert.equal(fetchCalls,1);
  assert.match(sent.url,/https:\/\/api\.openrouteservice\.org\/v2\/directions\/foot-walking\/geojson/);
  assert.equal(sent.options.method,"POST");
  assert.equal(sent.options.credentials,"omit");
  assert.equal(sent.options.referrerPolicy,"no-referrer");
  assert.equal(sent.options.headers.Authorization,"FAKE_TEST_TOKEN");
  assert.deepEqual(JSON.parse(sent.options.body).coordinates,[[10.7,59.91],[10.75,59.92]]);
  assert.equal(result.distanceMeters,2200);
  assert.equal(result.durationMinutes,27.5);
  const persisted=store.saveResolvedRoute(route.id,result);
  assert.equal(persisted.routingStatus,"verified_route");
  assert.equal(persisted.roadGeometry.type,"LineString");
  assert.equal(persisted.visibility,"private");
  assert.equal(persisted.realWorldTravelConfirmed,false);
  assert.equal(persisted.routeEvidence.sourceUrl,sent.url);
  assert.equal(store.listRoutes().length,1);
  assert(!local.has("hg_civi_travel_v1"),"cannot record actual travel");
  assert(!local.has("aha_import_payload_v1"),"cannot auto-export commute");
  assert(!local.has("hg_civi_wallet_v1"),"cannot charge account");
  assert.deepEqual([...local.keys()],["hg_civi_personal_routes_v1"]);
  assert.throws(()=>store.saveResolvedRoute(route.id,{...result,routeId:"other"}),/Invalid routing result/);
  assert.throws(()=>store.saveResolvedRoute(route.id,{...result,roadGeometry:{type:"LineString",coordinates:[[400,59.9],[10.75,59.92]]}}),/Invalid routed coordinates/);

  const noKey = W.HG_ORS.apiKey;
  W.HG_ORS.apiKey="";
  assert.equal((await router.calculate(route,{consent:true})).reason,"ROUTER_NOT_CONFIGURED");
  W.HG_ORS.apiKey=noKey;
  W.HG_ORS.baseUrl="https://evil.example";
  assert.equal((await router.calculate(route,{consent:true})).reason,"ROUTER_NOT_CONFIGURED");
  W.HG_ORS.baseUrl="https://api.openrouteservice.org";
  assert.equal(fetchCalls,1,"bad endpoint must not receive personal coordinates");
  const transit=store.planCommute({weekDay:0,travelMode:"transit"});
  assert.equal((await router.calculate(transit.route,{consent:true})).reason,"UNSUPPORTED_TRAVEL_MODE");
  assert.equal(fetchCalls,1);
  const bicycle=store.planCommute({weekDay:0,travelMode:"cycling"});
  result=await router.calculate(bicycle.route,{consent:true});
  assert.equal(result.ok,true);
  assert.match(sent.url,/cycling-regular/);
  const car=store.planCommute({weekDay:0,travelMode:"driving"});
  result=await router.calculate(car.route,{consent:true});
  assert.equal(result.ok,true);
  assert.match(sent.url,/driving-car/);

  httpOk=false;
  assert.equal((await router.calculate(route,{consent:true})).reason,"ROUTING_UNAVAILABLE");
  httpOk=true;
  payload={features:[{geometry:{type:"LineString",coordinates:[[10.7,59.91]]},properties:{segments:[{distance:2200,duration:1000}]}}]};
  assert.equal((await router.calculate(route,{consent:true})).reason,"INVALID_ROUTING_RESPONSE");
  payload={features:[{geometry:{type:"LineString",coordinates:[[10.7,59.91],[10.75,59.92]]},properties:{segments:[{distance:-20,duration:1000}]}}]};
  assert.equal((await router.calculate(route,{consent:true})).reason,"INVALID_ROUTING_RESPONSE");
  assert.equal(store.listRoutes()[0].realWorldTravelConfirmed,false);
  console.log("PASS: ORS explicit consent, strict host, real route proof, no actual travel, no cross-app data transfer");
})().catch(error=>{console.error(error);process.exitCode=1});
