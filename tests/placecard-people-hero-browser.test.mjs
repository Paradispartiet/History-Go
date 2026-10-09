import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const image = "data:image/svg+xml;base64," + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><rect width="600" height="360" fill="#61767b"/></svg>'
).toString("base64");
const portrait = "data:image/svg+xml;base64," + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="50" fill="#ead59a"/></svg>'
).toString("base64");
const sample = {
  id:"vaterlandsparken", name:"Vaterlandsparken", category:"by",
  place_card_profile:{ schema:"history_go_place_card_profile_v2", collection_ids:["people","objects","brands","structures"], reason:"Test canonical card" }
};
const fixture = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="stylesheet" href="/css/theme.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="stylesheet" href="/css/placeCard.css">
<link rel="stylesheet" href="/css/place-rounds-fill-layout.css">
</head><body class="hg-app">
<div id="placeCard" class="is-open" data-current-place-id="vaterlandsparken">
<div class="pc-body">
<div class="pc-text">
  <div id="pcHeaderHero" class="pc-heading-hero has-photo-source has-image">
    <img id="pcHeaderImage" class="pc-heading-image" alt="" src="${image}">
    <div class="pc-heading-content">
      <div id="pcMeta"></div>
      <div class="pc-title-row">
        <h2 id="pcTitle">Vaterlandsparken</h2>
        <button id="pcFavorite" type="button" class="pc-favorite-btn">☆</button>
      </div>
    </div>
  </div>
  <p id="pcDesc">Historisk park</p>
</div>
<div class="pc-grid">
  <div class="pc-frontcard"></div>
  <div class="pc-side-stack"><div class="pc-icons-quad">
    <div id="pcPeopleIcon" class="pc-round"></div>
    <div id="pcBadgesIcon" class="pc-round"><img src="${portrait}" alt="Merker"></div>
    <div id="pcBrandsIcon" class="pc-round"></div>
  </div></div>
</div>
<div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div>
</div></div>
<button id="pcQuiz" type="button" hidden>Quiz</button>
<script>
  window.PLACES = [${JSON.stringify(sample)}];
  window.__linkedPeople = [{id:"olafia",name:"Ólafía Jóhannsdóttir",image:${JSON.stringify(portrait)}}];
  window.getPeopleForPlace = () => window.__linkedPeople;
  window.__peopleClicks = 0;
  document.getElementById("pcPeopleIcon").addEventListener("click", () => window.__peopleClicks++);
</script>
<script src="/js/ui/place-rounds-visual-collections.js"></script>
<script src="/js/ui/place-rounds-fill-layout.js"></script>
<script>
  window.addEventListener("DOMContentLoaded", () => {
    window.HGPlaceCardCollections.apply(window.PLACES[0]).then(() => {
      window.__auditReady = true;
    }).catch(error => { window.__auditError = String(error?.stack || error); });
  });
</script>
</body></html>`;

const files = new Set([
  "/css/theme.css", "/css/base.css", "/css/layout.css", "/css/placeCard.css",
  "/css/place-rounds-fill-layout.css",
  "/js/ui/place-rounds-visual-collections.js", "/js/ui/place-rounds-fill-layout.js"
]);
const server = http.createServer((req,res) => {
  const url = new URL(req.url,"http://localhost");
  if(url.pathname === "/__audit__/people-hero.html"){
    res.writeHead(200,{"content-type":"text/html; charset=utf-8"});
    res.end(fixture);return;
  }
  if(files.has(url.pathname)){
    const f = url.pathname.slice(1);
    res.writeHead(200,{"content-type": f.endsWith(".css") ? "text/css" : "text/javascript"});
    res.end(fs.readFileSync(path.join(root,f)));return;
  }
  res.writeHead(404);res.end("not found");
});
await new Promise(resolve => server.listen(0, "127.0.0.1",resolve));
let browser;
try{
  browser = await chromium.launch({headless:true});
  const {port} = server.address();
  for(const [width,height] of [[320,700],[390,844],[768,1024],[1024,900],[1440,900]]){
    const page = await browser.newPage({viewport:{width,height}});
    await page.goto(`http://127.0.0.1:${port}/__audit__/people-hero.html`,{waitUntil:"load"});
    await page.waitForFunction(() => window.__auditReady || window.__auditError);
    assert.equal(await page.evaluate(() => window.__auditError || null), null);
    const state = await page.evaluate(() => {
      const box = sel => {
        const r=document.querySelector(sel).getBoundingClientRect();
        return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
      };
      const people=document.getElementById("pcPeopleIcon");
      const badge=document.getElementById("pcBadgesIcon");
      return {
        hero:box("#pcHeaderHero"),title:box("#pcTitle"),star:box("#pcFavorite"),
        people:box("#pcPeopleIcon"),badge:box("#pcBadgesIcon"),
        peopleParent:people.parentElement.className,
        badgeParent:badge.parentElement.className,
        peopleHidden:people.hidden,
        peopleRole:people.getAttribute("role"),
        peopleTab:people.tabIndex,
        peopleImage:people.querySelector("img")?.getAttribute("src") || "",
        gridCount:document.querySelector(".pc-icons-quad").dataset.collectionCount,
        gridHasPeople:!!document.querySelector(".pc-icons-quad #pcPeopleIcon"),
        overflow:document.documentElement.scrollWidth > innerWidth + 1
      };
    });
    assert.equal(await page.locator("#pcPeopleIcon").count(),1,"one canonical People circle");
    assert.equal(state.peopleParent,"pc-title-row","People relocated to title row");
    assert.equal(state.badgeParent,"pc-title-row","Merker remains in title row");
    assert.equal(state.gridHasPeople,false,"People no longer occupies a lower grid cell");
    assert.equal(state.gridCount,"3","grid counts only the three remaining collections");
    assert.equal(state.peopleHidden,false,"real linked people show the heading round");
    assert.equal(state.peopleRole,"button");
    assert.equal(state.peopleTab,0);
    assert.equal(state.peopleImage,portrait,"linked person's portrait is reused");
    assert.ok(state.star.right <= state.people.x + 1,"People follows favourite button at "+width);
    assert.ok(state.people.right <= state.badge.x + 1,"People immediately precedes Merker at "+width);
    assert.ok(state.people.y >= state.hero.y - 1 && state.people.bottom <= state.hero.bottom + 1
      && state.badge.bottom <= state.hero.bottom + 1,"both rounds stay on landscape hero at "+width);
    assert.ok(Math.abs(state.people.width-state.people.height)<=1
      && Math.abs(state.badge.width-state.badge.height)<=1,"both round previews stay circular at "+width);
    assert.ok(!state.overflow,"no horizontal page overflow at "+width);
    await page.locator("#pcPeopleIcon").click();
    assert.equal(await page.evaluate(() => window.__peopleClicks),1,"moving the node preserves click listener");
    await page.evaluate(() => window.__linkedPeople=[]);
    await page.evaluate(() => window.HGPlaceCardCollections.apply(window.PLACES[0]));
    assert.equal(await page.locator("#pcPeopleIcon").isVisible(),false,
      "no empty People round if a place has no linked people");
    assert.equal(await page.locator("#pcBadgesIcon").isVisible(),true,
      "Merker remains visible independently");
    console.log("People beside Merker on landscape hero OK at "+width+"x"+height);
    await page.close();
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
