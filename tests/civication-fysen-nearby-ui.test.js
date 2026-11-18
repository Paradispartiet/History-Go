#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js/Civication/ui/CivicationMealPlanUI.js"), "utf8");
class Node {
  constructor(tag) {
    this.tag = tag;
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.style = {};
    this.listeners = {};
    this.textContent = "";
    this.value = "";
    this.disabled = false;
    this.className = "";
    this.parentNode = null;
  }
  appendChild(child) { this.children.push(child); child.parentNode=this;return child; }
  replaceChildren(...next) { this.children=[...next];for(const x of next)x.parentNode=this; }
  setAttribute(key,value) { this[key]=value; }
  addEventListener(kind,callback) { this.listeners[kind]=callback; }
  visit() { return [this,...this.children.flatMap(child=>child.visit())]; }
}
const host = new Node("section");
const document = {
  createElement: tag => new Node(tag),
  getElementById: id => id === "civiWeeklyMealPlanPanel" ? host : null,
  readyState: "complete"
};
const route={
  id:"private:route",jobKey:"demo-job",geometryRevision:"ors-geometry-v1-abcdef12",kind:"commute",status:"planned",
  visibility:"private",routingStatus:"verified_route",weekDay:0,
  roadGeometry:{type:"LineString",coordinates:[[10.7,59.9],[10.8,59.91]]},
  routeEvidence:{validUntil:new Date(Date.now()+3600000).toISOString()}
};
let currentRoutes=[route];
const calls={fysen:[],corridor:[],ors:[]};
const candidate={
  restaurantId:"public-r1",name:"Syntetisk restaurant",address:"Testgaten 1",
  dishName:"Pasta",approxCorridorMeters:45,
  menuSourceUrl:"https://example.org/meny",routeId:route.id,
  routeGeometryRevision:"ors-geometry-v1-abcdef12",
  latitude:59.905,longitude:10.75
};
const window = {
  addEventListener:()=>{},
  CivicationCalendar:{getClock:()=>({dayIndex:1})},
  CivicationMealPlan:{
    getWeekKey:()=>"game-week-000001",
    getWeek:()=>({people:2,meals:{}}),getShoppingList:()=>[],
    getRecipes:()=>[{id:"pasta",name:"Pasta"}],
    templates:()=>[{id:"varied",label:"Variert"}],
    DAYS:["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag","Søndag"],
    MEALS:{breakfast:{label:"Frokost"},lunch:{label:"Lunsj"},dinner:{label:"Middag"},supper:{label:"Kveldsmat"}}
  },
  CivicationMealRouteBridge:{build:()=>({status:"verified_venues_required"})},
  CivicationPersonalRoutes:{jobKey:()=>"demo-job",listRoutes:()=>currentRoutes},
  CivicationFysenLiveRestaurants:{
    lookup:async (dish,options)=>{calls.fysen.push({dish,options});return {
      status:"DOCUMENTED_PUBLIC_MENUS",city:"Oslo",results:[{restaurant:{id:"public-r1"}}]
    }}
  },
  CivicationFysenRouteCorridor:{
    shortlist:opts=>{calls.corridor.push(opts);return {status:"geographic_candidates",candidates:[candidate]}}
  },
  CivicationRestaurantDetours:{
    calculate:async (inputRoute,inputCandidate,options)=>{calls.ors.push({inputRoute,inputCandidate,options});
      return {ok:true,routeProof:{passMinutes:672,detourMinutes:7},kitchenOpenAtPassTime:"unknown",isVerifiedMealOffer:false}
    }
  }
};
vm.runInNewContext(source,{document,window});
function findText(tag,text) {
  return host.visit().find(node=>node.tag===tag&&node.textContent===text);
}
assert.equal(calls.fysen.length,0,"opening the meal planner must not access Fysen");
assert.equal(calls.ors.length,0,"opening the meal planner must not access ORS");
assert(findText("summary","Restauranter nær arbeidsruten"));
const searchInput=host.visit().find(node=>node.tag==="input"&&node.placeholder==="F.eks. pasta");
const timeInput=host.visit().find(node=>node.tag==="input"&&node.type==="time");
const searchButton=findText("button","Finn nær ruten");
assert(searchInput&&timeInput&&searchButton);
searchInput.value="pasta";
timeInput.value="11:00";
(async()=>{
  await searchButton.parentNode.listeners.submit({preventDefault(){}});
  assert.equal(calls.fysen.length,1);
  assert.equal(calls.fysen[0].dish,"pasta");
  assert.equal(calls.fysen[0].options.consent,true);
  assert.equal(calls.fysen[0].options.route,undefined,
    "Fysen query must not receive a private route");
  assert.equal(calls.corridor.length,1);
  assert.equal(calls.corridor[0].route,route,"local geometry comparison may use private route");
  assert.equal(calls.ors.length,0,"finding nearby public restaurants cannot route via ORS");
  const via=findText("button","Beregn faktisk omvei med OpenRouteService");
  assert(via,"a separate explicit button gates third-party route calculation");
  assert.equal(via.parentNode.children.some(n=>n.tag==="a"&&n.href==="https://example.org/meny"),true);
  await via.listeners.click();
  assert.equal(calls.ors.length,1);
  assert.equal(calls.ors[0].options.consent,true);
  assert.equal(calls.ors[0].options.departureMinute,660);
  assert.equal(calls.ors[0].inputRoute,route);
  assert.equal(calls.ors[0].inputCandidate,candidate);
  const status=via.parentNode.children.find(node=>node.tag==="p");
  assert(status.textContent.includes("Restaurantopplysningene er veiledende"));
  // The initial successful lookup must not authorize a later ORS call
  // if the player removes/changes the private commute in the meantime.
  currentRoutes=[];
  await via.listeners.click();
  assert.equal(calls.ors.length,1,
    "deleting home/work must invalidate old restaurant detour buttons");
  assert(status.textContent.includes("endret eller slettet"));

  currentRoutes=[route];
  let releaseSearch;
  window.CivicationFysenLiveRestaurants.lookup=(dish,options)=>{
    calls.fysen.push({dish,options});
    return new Promise(resolve => { releaseSearch=resolve; });
  };
  const corridorBefore=calls.corridor.length;
  const pending=searchButton.parentNode.listeners.submit({preventDefault(){}});
  assert.equal(calls.fysen.length,2);
  currentRoutes=[];
  releaseSearch({status:"DOCUMENTED_PUBLIC_MENUS",results:[{restaurant:{id:"public-r1"}}]});
  await pending;
  assert.equal(calls.corridor.length,corridorBefore,
    "results of searches in flight must not be matched against a deleted route");
  // Even if the user changes the route *after* the ORS request has started,
  // the eventual response cannot be presented as the player's current route.
  currentRoutes=[route];
  let releaseDetour;
  window.CivicationRestaurantDetours.calculate=(inputRoute,inputCandidate,options)=>{
    calls.ors.push({inputRoute,inputCandidate,options});
    return new Promise(resolve=>{releaseDetour=resolve;});
  };
  const pendingDetour=via.listeners.click();
  assert.equal(calls.ors.length,2);
  currentRoutes=[];
  releaseDetour({ok:true,routeProof:{passMinutes:672,detourMinutes:7}});
  await pendingDetour;
  assert(status.textContent.includes("ble endret under beregningen"),
    "stale ORS result must be discarded after route deletion");
  assert(!/\bgetPos\s*\(|\bgeolocation\b|\baha_import_payload_v1\b/.test(source),
    "meal planner cannot infer actual GPS or AHA history");
  console.log("PASS: Civication nearby Fysen UI gates city search and ORS detour independently");
})().catch(error=>{console.error(error);process.exitCode=1});
