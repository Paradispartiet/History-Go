#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..");
const file="js/Civication/systems/civicationRestaurantDetours.js";
const src=fs.readFileSync(path.join(root,file),"utf8");
const loader=fs.readFileSync(path.join(root,"js/Civication/civicationShellLoader.js"),"utf8");
assert.equal(loader.split('"' + file + '"').length-1,2);
const now=new Date("2026-11-18T10:00:00+01:00");
const evidence={
  sourceUrl:"https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
  checkedAt:"2026-11-18T09:00:00+01:00",validUntil:"2026-11-19T09:00:00+01:00"
};
const route={
  id:"private-route-1",kind:"commute",status:"planned",visibility:"private",
  routingStatus:"verified_route",travelMode:"walking",geometryRevision:"ors-geometry-v1-1234abcd",
  roadGeometry:{type:"LineString",coordinates:[[10.7,59.9],[10.8,59.92]]},
  waypoints:[{longitude:10.7,latitude:59.9},{longitude:10.8,latitude:59.92}],
  routeEvidence:evidence
};
const candidate={
  restaurantId:"restaurant-public-1",routeId:route.id,
  routeGeometryRevision:route.geometryRevision,latitude:59.91,longitude:10.775,
  approxCorridorMeters:30,
  menuCheckedAt:"2026-11-18T09:00:00+01:00",menuFreshUntil:"2026-11-19T09:00:00+01:00",
  menuSourceUrl:"https://example.org/documented-menu"
};
const window={HG_ORS:{baseUrl:"https://api.openrouteservice.org",apiKey:"TEST_TOKEN_ONLY"}};
const calls=[];
let mode="ok";
const fetchMock=async (url,opts)=>{
  calls.push({url,opts});
  const points=JSON.parse(opts.body).coordinates;
  if(mode==="offline")throw Error("Network unavailable");
  if(mode==="invalid")return {ok:true,json:async()=>({features:[]})};
  const segments=points.length===2
    ?[{distance:1600,duration:1200}]
    :[{distance:950,duration:720},{distance:1350,duration:900}];
  return {ok:true,json:async()=>({
    features:[{geometry:{type:"LineString",coordinates:points},properties:{segments}}]
  })};
};
vm.runInNewContext(src,{window,URL,fetch:fetchMock});
const api=window.CivicationRestaurantDetours;
(async()=>{
  assert.equal((await api.calculate(route,candidate,{now,departureMinute:660})).reason,"CONSENT_REQUIRED");
  assert.equal(calls.length,0,"no network before explicit consent");
  const result=await api.calculate(route,candidate,{consent:true,now,departureMinute:660});
  assert.equal(result.ok,true);
  assert.equal(calls.length,2,"direct and via-stop compared in the same explicit action");
  assert(calls.every(call=>call.url==="https://api.openrouteservice.org/v2/directions/foot-walking/geojson"));
  assert(calls.every(call=>call.opts.method==="POST"&&call.opts.credentials==="omit"&&
    call.opts.redirect==="error"&&call.opts.referrerPolicy==="no-referrer"));
  assert.deepEqual(JSON.parse(calls[0].opts.body).coordinates,[[10.7,59.9],[10.8,59.92]]);
  assert.deepEqual(JSON.parse(calls[1].opts.body).coordinates,[[10.7,59.9],[10.775,59.91],[10.8,59.92]]);
  assert.equal(result.routeProof.passMinutes,672,"11:00 departure plus 12-minute leg");
  assert.equal(result.routeProof.detourMinutes,7);
  assert.equal(result.detourWithinTenMinutes,true);
  assert.equal(result.baselineMinutes,20);
  assert.equal(result.viaStopMinutes,27);
  assert.equal(result.kitchenOpenAtPassTime,"unknown");
  assert.equal(result.isVerifiedMealOffer,false);
  assert.equal(result.isActualVisit,false);
  assert.equal(result.routeProof.routeId,route.id);
  assert.equal(result.routeProof.geometryRevision,route.geometryRevision);
  assert.equal(result.routeProof.evidence.sourceUrl,calls[1].url);
  assert.equal((await api.calculate({...route,visibility:"public"},candidate,{consent:true,now,departureMinute:660})).reason,"VERIFIED_ROUTE_REQUIRED");
  assert.equal((await api.calculate({...route,routingStatus:"awaiting_road_router"},candidate,{consent:true,now,departureMinute:660})).reason,"VERIFIED_ROUTE_REQUIRED");
  assert.equal((await api.calculate({...route,travelMode:"driving"},candidate,{consent:true,now,departureMinute:660})).reason,"VERIFIED_ROUTE_REQUIRED",
    "routing transport profile must match the actual verified ORS evidence");
  assert.equal((await api.calculate(route,{...candidate,restaurantId:""},{consent:true,now,departureMinute:660})).reason,"MATCHING_RESTAURANT_CANDIDATE_REQUIRED");
  assert.equal((await api.calculate(route,{...candidate,routeGeometryRevision:"other"},{consent:true,now,departureMinute:660})).reason,
    "MATCHING_RESTAURANT_CANDIDATE_REQUIRED");
  assert.equal((await api.calculate(route,{...candidate,menuFreshUntil:"2026-11-18T09:30:00+01:00"},{consent:true,now,departureMinute:660})).reason,
    "FRESH_MENU_REQUIRED");
  assert.equal((await api.calculate(route,candidate,{consent:true,now,departureMinute:1440})).reason,"DEPARTURE_TIME_REQUIRED");
  assert.equal(calls.length,2,"invalid inputs never make routing calls");
  window.HG_ORS.baseUrl="https://attacker.example";
  assert.equal((await api.calculate(route,candidate,{consent:true,now,departureMinute:660})).reason,"ROUTER_NOT_CONFIGURED");
  window.HG_ORS.baseUrl="https://api.openrouteservice.org";
  assert.equal(calls.length,2,"untrusted router endpoint cannot receive private points");
  mode="offline";
  assert.equal((await api.calculate(route,candidate,{consent:true,now,departureMinute:660})).reason,"ROUTING_UNAVAILABLE");
  mode="invalid";
  assert.equal((await api.calculate(route,candidate,{consent:true,now,departureMinute:660})).reason,"INVALID_ROUTING_RESPONSE");
  assert(!/\blocalStorage\b|\bgeolocation\b|\baha_import_payload_v1\b|\bdispatchEvent\s*\(/.test(src),
    "no travel state, user tracking, wallet or AHA mutations");
  console.log("PASS: explicit consent, ORS direct/via detour, passage time, no unverified kitchen offer");
})().catch(error=>{console.error(error);process.exitCode=1});
