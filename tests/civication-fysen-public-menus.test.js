#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const script = fs.readFileSync(path.join(root, "js/Civication/systems/civicationFysenPublicMenus.js"), "utf8");
const html = fs.readFileSync(path.join(root, "Civication.html"), "utf8");
const loader = fs.readFileSync(path.join(root, "js/Civication/civicationShellLoader.js"), "utf8");
const ui = fs.readFileSync(path.join(root, "js/Civication/ui/CivicationMealPlanUI.js"), "utf8");
assert.match(html, /civiWeeklyMealPlanPanel/);
assert.equal(loader.split('"js/Civication/systems/civicationFysenPublicMenus.js"').length - 1, 2);
assert(loader.indexOf('"js/Civication/systems/civicationFysenPublicMenus.js"') <
  loader.indexOf('"js/Civication/ui/CivicationMealPlanUI.js"'));
assert.match(ui, /Søk i Fysens menyarkiv/);
assert.match(ui, /Fysen-restauranter og butikker|Butikkforslag|Mat langs min arbeidsrute|Mat langs/);

const requests = [];
const state = {
  status: 200, json: {
    source: "verified-menu-archive", realtime: false, city: "Oslo",
    archiveDate: "2026-11-17", count: 1,
    results: [{
      name: "Linsesuppe",
      restaurant: { name: "Prøverestaurant", address: "Testgaten 2, Oslo", city: "Oslo" },
      menu: { observedAt: "2026-11-16T10:00:00+01:00", sourceUrl: "https://example.org/menu" },
      priceMinor: 32000
    }]
  }
};
const testWindow = {
  CivicationPersonalRoutes: { listRoutes: () => [{waypoints: [{latitude:59.9,longitude:10.7}]}] },
  CivicationMealPlan: { getWeek: () => ({meals:{0:{dinner:"soup"}}}) }
};
const storage = { getItem: () => { throw Error("must not access private storage"); } };
const mockFetch = async (url, options) => {
  requests.push({ url, options });
  return { ok: state.status === 200, json: async () => state.json };
};
vm.runInNewContext(script, { window:testWindow, fetch:mockFetch, URL, localStorage:storage });
const api = testWindow.CivicationFysenPublicMenus;
(async () => {
  assert.equal((await api.search("p")).status, "invalid_query");
  assert.equal(requests.length, 0, "invalid searches make no network request");
  const response = await api.search("  linsesuppe  ");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url,
    "https://fysen-api.vercel.app/v1/dishes/archive/search?q=linsesuppe&city=Oslo&limit=8");
  assert.equal(requests[0].options.method, "GET");
  assert.equal(requests[0].options.credentials, "omit");
  assert.equal(requests[0].options.referrerPolicy, "no-referrer");
  assert(!/lat=|lon=|59\.9|10\.7|address=|week=|route=|meal=|work=|home=/i.test(requests[0].url),
    "no precise locations, private routes or meal plan may enter Fysen URL");
  assert.equal(requests[0].options.body, undefined);
  assert.equal(response.status, "archive_results");
  assert.equal(response.realtime, false);
  assert.equal(response.items.length, 1);
  assert.equal(response.items[0].name, "Linsesuppe");
  assert.equal(response.items[0].restaurant, "Prøverestaurant");
  assert.equal(response.items[0].priceMinor, null, "historical prices cannot be shown as live NOK");
  assert.equal(response.items[0].availability, "unknown");
  assert.equal(response.items[0].onCommuteRoute, "unverified");
  assert.equal(response.items[0].openingAtPassTime, "unknown");
  assert.equal(response.items[0].sourceUrl, "https://example.org/menu");

  state.json = {...state.json,source:"untrusted-response"};
  assert.equal((await api.search("linsesuppe")).status, "unverified_response");
  state.json = {...state.json,source:"verified-menu-archive",realtime:true};
  assert.equal((await api.search("linsesuppe")).status, "unverified_response");
  state.json = {...state.json,realtime:false,results:[{
    name:"Suppe",restaurant:{name:"R",address:"Testvei 1",city:"Oslo"},
    menu:{observedAt:"2026-11-16",sourceUrl:"javascript:alert(1)"}
  }]};
  assert.equal((await api.search("suppe")).status, "no_archive_results",
    "unsafe provenance must not become a clickable menu link");
  state.json = {...state.json,results:[{
    name:"Suppe",restaurant:{name:"R",address:"Testvei 1",city:"Oslo"},
    menu:{observedAt:"2026-11-16",sourceUrl:"http://example.org/insecure"}
  }]};
  assert.equal((await api.search("suppe")).status, "no_archive_results");
  state.status = 503;
  assert.equal((await api.search("suppe")).status, "unavailable");
  assert(!/\bCivicationPersonalRoutes\b|\bCivicationTravelState\b|\bgetPos\s*\(|\bgeolocation\b|\blocalStorage\b/.test(script),
    "public menu discovery must never read private route or position objects");
  console.log("PASS: Fysen archive city-only lookup, source provenance and privacy boundary");
})().catch(error => { console.error(error); process.exitCode = 1 });
