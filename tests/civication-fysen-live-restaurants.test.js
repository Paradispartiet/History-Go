#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const src = fs.readFileSync(path.join(__dirname, "..", "js/Civication/systems/civicationFysenLiveRestaurants.js"), "utf8");
const loader = fs.readFileSync(path.join(__dirname, "..", "js/Civication/civicationShellLoader.js"), "utf8");
assert.equal(loader.split('"js/Civication/systems/civicationFysenLiveRestaurants.js"').length - 1,2);

const now=new Date("2026-11-18T10:00:00+01:00");
const menu={
  sourceUrl:"https://example.org/oslo-menu",
  observedAt:"2026-11-18T09:00:00+01:00",
  lastCheckedAt:"2026-11-18T09:20:00+01:00",
  freshUntil:"2026-11-18T17:00:00+01:00"
};
const candidate={
  restaurant:{id:"demo-restaurant",name:"Prøverestaurant",address:"Syntetisk adresse, Oslo",
    city:"Oslo",latitude:59.91,longitude:10.75},
  dish:{name:"Pasta",priceMinor:19900},
  menu,match:{type:"exact"},
  opening:{state:"open"}
};
let mockData={city:"Oslo",query:"pasta",sort:"relevance",results:[candidate]};
let networkStatus=200;const requests=[];
const privateRoutes={listRoutes:()=>{throw Error("MUST NOT READ PRIVATE ROUTES")}};
const privateStorage={getItem:()=>{throw Error("MUST NOT READ PRIVATE STORAGE")}};
const window={CivicationPersonalRoutes:privateRoutes};
async function fetchMock(url,opts){requests.push({url,opts});return {ok:networkStatus===200,json:async()=>mockData};}
vm.runInNewContext(src,{window,fetch:fetchMock,URL,localStorage:privateStorage});
const client=window.CivicationFysenLiveRestaurants;
(async()=>{
  assert.equal((await client.lookup("pasta",{now})).status,"CONSENT_REQUIRED");
  assert.equal((await client.lookup("a",{consent:true,now})).status,"INVALID_QUERY");
  assert.equal(requests.length,0,"neither missing consent nor invalid query can trigger HTTP");
  const result=await client.lookup("  pasta  ",{consent:true,now});
  assert.equal(requests.length,1);
  assert.equal(requests[0].url,"https://fysen-api.vercel.app/v1/dishes/search?q=pasta&city=Oslo&limit=20&sort=relevance");
  assert.equal(requests[0].opts.method,"GET");
  assert.equal(requests[0].opts.credentials,"omit");
  assert.equal(requests[0].opts.referrerPolicy,"no-referrer");
  assert.equal(requests[0].opts.redirect,"error");
  assert(!/lat=|lon=|59\.9|10\.7|home=|work=|route=|day=|people=/.test(requests[0].url));
  assert.equal(requests[0].opts.body,undefined);
  assert.equal(result.status,"DOCUMENTED_PUBLIC_MENUS");
  assert.equal(result.results.length,1);
  assert.equal(result.results[0].restaurant.id,"demo-restaurant");
  assert.equal(result.results[0].menu.sourceUrl,menu.sourceUrl);
  assert.equal(result.results[0].dish.priceMinor,undefined,"never pass a live price to route UI");
  assert.equal(result.results[0].opening,undefined,"open-now must not imply future kitchen availability");
  assert.equal(result.routeMatched,false);
  assert.equal(result.kitchenOpenAtPassTime,"unknown");
  assert.equal(result.realtimeAvailability,false);
  const original=mockData;
  mockData={...original,results:[{...candidate,menu:{...menu,freshUntil:"2026-11-18T09:25:00+01:00"}}]};
  assert.equal((await client.lookup("pasta",{consent:true,now})).status,"NO_CURRENT_PUBLIC_MENUS",
    "expired menu provenance cannot populate location candidates");
  mockData={...original,results:[{...candidate,menu:{...menu,sourceUrl:"http://insecure.example/menu"}}]};
  assert.equal((await client.lookup("pasta",{consent:true,now})).results.length,0);
  mockData={...original,results:[{...candidate,restaurant:{...candidate.restaurant,latitude:999}}]};
  assert.equal((await client.lookup("pasta",{consent:true,now})).results.length,0);
  mockData={...original,results:[{...candidate,match:{type:"fuzzy"}}]};
  assert.equal((await client.lookup("pasta",{consent:true,now})).results.length,0);
  mockData={...original,city:"Trondheim"};
  assert.equal((await client.lookup("pasta",{consent:true,now})).status,"INVALID_RESPONSE");
  mockData={...original,query:"private request"};
  assert.equal((await client.lookup("pasta",{consent:true,now})).status,"INVALID_RESPONSE");
  networkStatus=503;
  assert.equal((await client.lookup("pasta",{consent:true,now})).status,"PUBLIC_API_UNAVAILABLE");
  assert(!/\blocalStorage\b|\bgetPos\s*\(|\bgeolocation\b|\bCivicationPersonalRoutes\b|\bCivicationTravelState\b/.test(src),
    "live discovery cannot access user position, route or persistent state");
  console.log("PASS: city-only public Fysen lookup with explicit consent and fresh menu evidence");
})().catch(error=>{console.error(error);process.exitCode=1});
