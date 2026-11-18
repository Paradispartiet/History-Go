#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const file = "js/Civication/systems/civicationFysenRouteCorridor.js";
const script = fs.readFileSync(path.join(root, file), "utf8");
const shell = fs.readFileSync(path.join(root, "js/Civication/civicationShellLoader.js"), "utf8");
assert.equal(shell.split('"' + file + '"').length - 1, 2, "shell and legacy load the module once each");
const env = {};
vm.runInNewContext(script, {window:env});
const api = env.CivicationFysenRouteCorridor;
const now = Date.parse("2026-11-18T09:00:00+01:00");
const route = {
  id: "planned:home-to-job",kind:"commute",status:"planned",visibility:"private",
  routingStatus:"verified_route", geometryRevision:"ors-geometry-v1-abc123ab",
  roadGeometry: {type:"LineString",coordinates:[[10.75,59.90],[10.8,59.92]]},
  routeEvidence: {
    sourceUrl:"https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
    checkedAt:"2026-11-18T08:00:00+01:00",validUntil:"2026-11-19T08:00:00+01:00"
  }
};
function result(id,lon,lat,name="Pasta",match="exact") {
  return {dish:{name},restaurant:{
    id,name:"Restaurant " + id,address:"Syntetisk testadresse, Oslo",
    city:"Oslo",latitude:lat,longitude:lon
  },menu:{
    sourceUrl:"https://example.org/documented-menu",
    lastCheckedAt:"2026-11-18T08:00:00+01:00",
    observedAt:"2026-11-18T07:00:00+01:00",
    freshUntil:"2026-11-19T08:00:00+01:00"
  },match:{type:match}};
}
const near = result("near",10.775,59.91);
const far = result("far",10.85,60.1);
const same = result("near",10.775,59.91,"Ramen");
const response = {city:"Oslo",query:"pasta",sort:"relevance",results:[near,far,same]};
function select(changes={}) { return api.shortlist({route,response,nowMillis:now,...changes}); }
const found=select();
assert.equal(found.status,"geographic_candidates");
assert.equal(found.candidates.length,1,"duplicate dishes per restaurant are deduplicated");
assert.equal(found.candidates[0].restaurantId,"near");
assert(found.candidates[0].approxCorridorMeters < 50);
assert.equal(found.candidates[0].routeId,route.id);
assert.equal(found.candidates[0].onRoute,"unverified");
assert.equal(found.candidates[0].detourMinutes,null,"geometric distance is not a road detour");
assert.equal(found.candidates[0].kitchenOpenAtPassTime,"unknown");
assert.equal(found.candidates[0].priceMinor,null,"no unverified current prices");
assert.equal(select({response:{...response,city:"Bergen"}}).status,"verified_public_results_required");
assert.equal(select({route:{...route,roadGeometry:{}}}).status,"verified_route_required");
assert.equal(select({route:{...route,routeEvidence:null}}).status,"verified_route_required");
assert.equal(select({route:{...route,visibility:"public"}}).status,"verified_route_required");
assert.equal(select({route:{...route,routingStatus:"awaiting_road_router"}}).status,"verified_route_required");
assert.equal(select({route:{...route,roadGeometry:{type:"LineString",coordinates:[[999,59.9],[10.8,59.92]]}}}).status,
  "verified_route_required");
assert.equal(select({nowMillis:Date.parse("2026-11-20T08:00:00+01:00")}).status,"verified_route_required",
  "expired ORS geometry cannot be used for restaurant shortlist");
assert.equal(select({corridorMeters:0}).status,"invalid_corridor");
assert.equal(select({corridorMeters:2000}).status,"invalid_corridor");
assert.equal(select({response:{...response,results:[{...near,menu:{...near.menu,freshUntil:"2026-11-18T08:15:00+01:00"}}]}}).candidates.length,0,
  "stale menu must not count as sourced");
assert.equal(select({response:{...response,results:[{...near,match:{type:"fuzzy"}}]}}).candidates.length,0,
  "fuzzy dish matches are not precise enough");
assert.equal(select({response:{...response,results:[{...near,restaurant:{...near.restaurant,city:4}}]}}).candidates.length,0,
  "malformed data must fail closed instead of throwing");
assert.equal(select({response:{...response,results:[{...near,menu:{...near.menu,sourceUrl:"http://example.org/menu"}}]}}).candidates.length,0,
  "non-HTTPS menu provenance is not a verified public candidate");
assert(!/\bfetch\s*\(|\blocalStorage\b|\bgetPos\s*\(|\bgeolocation\b|\bdispatchEvent\s*\(|\baha_import_payload_v1\b/.test(script),
  "corridor screening never accesses GPS, network, private state or AHA");
console.log("PASS: Fysen Oslo route corridor is local, approximate and never claims detours or opening hours");
