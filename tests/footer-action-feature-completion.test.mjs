import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const source = path => readFileSync(path, "utf8");

test("new observation lens manifest resolves real categories, with valid selections", () => {
  const manifest = JSON.parse(source("data/observations/manifest.json"));
  for (const category of ["generell", "historie", "natur", "sport"]) {
    const path = `data/observations/observations_${category}.json`;
    assert.ok(manifest.files.includes(path), `${category} is registered`);
    const data = JSON.parse(source(path));
    assert.equal(data.subject_id, category);
    assert.ok(data.lenses[0].options.length >= 7);
    assert.ok(data.lenses[0].allow_note);
    assert.equal(new Set(data.lenses[0].options.map(o => o.id)).size, data.lenses[0].options.length);
  }
});

test("nature observation shows its specific lens and saves a learning-log entry", async () => {
  const dom = new JSDOM("<!doctype html><body></body>", {
    url: "https://history-go.test/", runScripts: "outside-only"
  });
  try {
    const w = dom.window;
    w.HG_I18N = { t: (_key, fallback) => fallback };
    const data = JSON.parse(source("data/observations/observations_natur.json"));
    w.fetch = async () => ({ok:true,json:async()=>data});
    w.eval(source("js/observations.js"));
    w.HGObservations.init({showToast: msg => {w.__toast=msg;},dispatchProfileUpdate() {}});
    await w.HGObservations.start({
      target:{targetId:"natursted", targetType:"place", subject_id:"natur", categoryId:"natur", title:"Natursted"},
      lensId:"natur_spor"
    });
    assert.equal(w.document.getElementById("obsModal").style.display, "flex");
    assert.match(w.document.getElementById("obsTitle").textContent, /naturen/);
    const option = w.document.querySelector("#obsChips button[data-opt]");
    assert.ok(option);
    option.click();
    w.document.getElementById("obsSave").click();
    const stored = JSON.parse(w.localStorage.getItem("hg_learning_log_v1") || "[]");
    assert.equal(stored.length,1);
    assert.equal(stored[0].subject_id,"natur");
    assert.equal(stored[0].lens_id,"natur_spor");
    assert.equal(stored[0].targetId,"natursted");
  } finally { dom.window.close(); }
});

test("visit button requests geolocation instead of disabling itself and never bypasses distance gate", async () => {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="park"></div><button id="pcVisit">Registrer besøk</button></body>',{
    url:"https://history-go.test/",runScripts:"outside-only"
  });
  try{
    const w=dom.window;
    const visited={};
    let position=null, requests=0, writes=0;
    w.TEST_MODE=false;
    w.visited=visited;
    w.getPos=()=>position;
    w.distMeters=()=>15;
    w.getPlaceDistanceTargets=place=>[{lat:place.lat,lon:place.lon,r:150}];
    w.HGPos={request:async()=>{requests++;position={lat:59.9,lon:10.7};return position;}};
    w.saveVisitedFromQuiz=id=>{writes++;visited[id]=true;};
    w.openPlaceCard=async()=>true;
    w.HGPlaceOpen={getPlace:()=>null};
    w.setInterval=()=>1;
    w.clearInterval=()=>{};
    w.eval(source("js/ui/place-card-quizcards-patch.js"));
    await w.openPlaceCard({id:"park",name:"Park",lat:59.9,lon:10.7});
    const button=w.document.getElementById("pcVisit");
    assert.equal(button.disabled,false,"no GPS must allow permission prompt");
    assert.equal(button.textContent,"Hent posisjon");
    assert.equal(writes,0);
    button.click();
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(requests,1);
    assert.equal(writes,0,"location request alone must never check in");
    assert.equal(button.textContent,"Registrer besøk");
    button.click();
    assert.equal(writes,1);
    assert.equal(visited.park,true);
    assert.equal(button.disabled,true,"recorded visits cannot duplicate");
  }finally{dom.window.close();}
});
