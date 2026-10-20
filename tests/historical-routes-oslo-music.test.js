const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const manifest = readJson("data/routes/historical/manifest.json");
const routes = readJson("data/routes/historical/routes_historical_oslo_music.json");
const places = readJson("data/places/manifest.json");
const evidence = readJson("data/routes/historical/sources_oslo_music_20261020.json");
assert.equal(routes.length, 1);
assert.ok(manifest.files.includes("routes_historical_oslo_music.json"));
const r = routes[0];
assert.equal(r.id, "oslo_scener_fra_bad_til_kulturby");
assert.equal(r.type, "historical_route");
assert.equal(r.feature, "historiske_ruter");
assert.equal(r.routeArchetype, "urban_time_route");
assert.equal(r.playModes.online.enabled, true);
assert.equal(r.chapters.length, 6);
assert.equal(evidence.routeId, r.id);
assert.equal(evidence.chapters.length, 6);
const seen = new Set();
for (const [i, c] of r.chapters.entries()) {
  assert.equal(c.sequence, i + 1);
  assert.ok(!seen.has(c.id)); seen.add(c.id);
  assert.equal(c.placeId, c.physical.placeId);
  assert.equal(c.physical.enabled, true);
  assert.equal(c.physical.physicalCollected, false);
  assert.ok(c.physical.gpsRadius > 0);
  assert.ok(c.narrativeText.trim().split(/\s+/).length > 90);
  assert.ok(c.tasks.length > 0 && c.tasks.every(t => t.prompt));
  const s = evidence.chapters.find(x => x.chapterId === c.id);
  assert.ok(s && s.placeId === c.placeId && s.sources.length >= 2 && s.sources.every(x => x.startsWith("https://")));
  const match = places.files.find(p => p.endsWith("/" + c.placeId + ".json"));
  assert.ok(match, "Place in manifest: " + c.placeId);
  assert.equal(readJson("data/" + match).id, c.placeId);
}
const storage = new Map(), events = [];
const context = {
  console, Date, Promise, Set, JSON,
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v) },
  Event: class Event { constructor(type) { this.type=type; } },
  CustomEvent: class CustomEvent { constructor(type, init={}) { this.type=type; this.detail=init.detail; } },
  document: { addEventListener(){}, getElementById(){ return null; } },
  window: { DataHub: {loadHistoricalRoutes: async ()=>routes}, dispatchEvent: e=>events.push(e), rerenderActiveLeftPanelMode(){} }
};
context.window.window=context.window;
context.window.localStorage=context.localStorage;
context.window.Event=context.Event;
context.window.CustomEvent=context.CustomEvent;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "js/historical-routes.js"), "utf8"), context);
(async()=>{
  const game=context.window.HGHistoricalRoutes;
  await game.load();
  assert.equal(game.getAll().length, 1);
  assert.ok(game.renderCards().includes(r.title));
  let progress=game.startRoute(r.id);
  assert.equal(progress.online.currentStopId, r.chapters[0].id);
  for(let i=0;i<6;i++) progress=game.completeCurrentChapter(r.id);
  assert.equal(progress.status, "online_completed");
  assert.equal(progress.online.completedStopIds.length, 6);
  assert.equal(progress.physical.completed, false);
  console.log("historical-routes-oslo-music.test.js: PASS (6 chapters and online progression)");
})().catch(e=>{console.error(e);process.exitCode=1;});
