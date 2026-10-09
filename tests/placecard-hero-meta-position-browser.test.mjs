import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const source = fs.readFileSync(path.join(root,"index.html"),"utf8");
const start = source.indexOf('<div id="placeCard" aria-hidden="true">');
const end = source.indexOf('<footer class="site-footer', start);
assert.ok(start >= 0 && end > start, "Canonical PlaceCard exists");
const markup = source.slice(start,end).replace('aria-hidden="true"','aria-hidden="false"');
assert.match(markup, /id="pcStatusBar"/);
assert.ok(markup.indexOf('id="pcStatusBar"') < markup.indexOf('id="pcHeaderHero"'),
  "Status must precede landscape image in canonical markup");
assert.ok(markup.indexOf('id="pcTitle"') < markup.indexOf('id="pcMeta"'),
  "Title precedes badge metadata");

const cssFiles = ["/css/placeCard.css","/css/place-popup-shortcuts.css"];
const svg = "data:image/svg+xml,"+encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="#60747b"/></svg>'
);
const fixture = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="stylesheet" href="/css/placeCard.css">
<link rel="stylesheet" href="/css/place-popup-shortcuts.css">
<style>html,body{margin:0;background:#111;color:#fff;font-family:system-ui}</style>
</head><body class="hg-app">
${markup}
<script>
 const card=document.getElementById("placeCard");
 card.classList.add("is-open");
 const title=document.getElementById("pcTitle");
 title.textContent="Vaterlandsparken";
 document.getElementById("pcHeaderImage").src=${JSON.stringify(svg)};
 document.getElementById("pcHeaderHero").classList.add("has-photo-source","has-image");
 const heading=document.querySelector(".pc-title-row");
 const badge=document.getElementById("pcBadgesIcon");
 const people=document.getElementById("pcPeopleIcon");
 badge.hidden=false;
 badge.classList.add("pc-title-badge");
 people.hidden=false;
 people.classList.add("pc-title-people");
 heading.append(people,badge);
 const meta=document.getElementById("pcMeta");
 const category=document.createElement("button");
 category.type="button";category.className="pc-category-meta";
 category.textContent="BY & ARKITEKTUR · 1980–2000";
 const epoke=document.createElement("button");
 epoke.type="button";epoke.className="pc-epoke";
 epoke.textContent="Epoke: Senmoderne byutvikling";
 meta.append(category,epoke);
 const status=document.createElement("button");
 status.type="button";status.className="pc-progress-status-line";
 status.dataset.pcProgressStatus="1";
 status.textContent="STATUS: IKKE FULLFØRT · GJENSTÅR: TA QUIZ";
 document.getElementById("pcStatusBar").append(status);
 window.__clicks={status:0,category:0,epoke:0};
 for(const key of ["status","category","epoke"]){
   const node=key==="status"?status:key==="category"?category:epoke;
   node.addEventListener("click",()=>window.__clicks[key]++);
 }
 document.body.classList.toggle("hg-phone",innerWidth<=520);
</script></body></html>`;

const server = http.createServer((req,res) => {
 const url=new URL(req.url,"http://localhost");
 if(url.pathname==="/__audit__/hero-geometry.html"){
   res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(fixture);return;
 }
 if(cssFiles.includes(url.pathname)){
   res.writeHead(200,{"content-type":"text/css; charset=utf-8"});
   res.end(fs.readFileSync(path.join(root,url.pathname.slice(1))));return;
 }
 res.writeHead(404);res.end("not found");
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const [width,height] of [[320,700],[390,844],[768,1024],[1024,900],[1440,900]]){
   const page=await browser.newPage({viewport:{width,height}});
   await page.goto(`http://127.0.0.1:${server.address().port}/__audit__/hero-geometry.html`,{waitUntil:"load"});
   const m=await page.evaluate(()=>{
     const rect=sel=>{
       const r=document.querySelector(sel).getBoundingClientRect();
       return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
     };
     return {
       hero:rect("#pcHeaderHero"), status:rect("#pcStatusBar > .pc-progress-status-line"),
       title:rect("#pcTitle"),badge:rect("#pcBadgesIcon"),people:rect("#pcPeopleIcon"),
       category:rect("#pcMeta > .pc-category-meta"),epoke:rect("#pcMeta > .pc-epoke"),
       statusParent:document.querySelector(".pc-progress-status-line").parentElement.id,
       categoryParent:document.querySelector(".pc-category-meta").parentElement.id,
       titleParent:document.querySelector("#pcTitle").parentElement.className,
       overflow:document.documentElement.scrollWidth>innerWidth+1
     };
   });
   assert.equal(m.statusParent,"pcStatusBar","progress action is outside image at "+width);
   assert.equal(m.categoryParent,"pcMeta","category stays inside image at "+width);
   assert.equal(m.titleParent,"pc-title-row","title stays in hero heading row at "+width);
   assert.ok(m.status.bottom<=m.hero.y+1 && m.hero.y-m.status.bottom<=14,
     "status directly above image at "+width+": "+JSON.stringify(m));
   assert.ok(m.title.x>=m.hero.x-1 && m.title.x<=m.hero.x+26
     && m.title.y>=m.hero.y-1 && m.title.y<=m.hero.y+27,
     "title top-left on image at "+width+": "+JSON.stringify(m));
   assert.ok(m.category.y>=m.badge.bottom-2 && m.category.y-m.badge.bottom<=22
     && Math.abs(m.category.right-m.badge.right)<=16,
     "category button directly below Merker logo at "+width+": "+JSON.stringify(m));
   assert.ok(m.epoke.y>=m.category.bottom-1,"epoch stays below category at "+width);
   assert.ok(m.category.bottom<=m.hero.bottom+1
     && m.epoke.bottom<=m.hero.bottom+1,"metadata stays inside landscape hero at "+width);
   assert.ok(m.people.right<=m.badge.x+1,"People remains next to Merker at "+width);
   assert.equal(m.overflow,false,"no horizontal scroll at "+width);
   await page.locator("#pcStatusBar > button").click();
   await page.locator("#pcMeta > .pc-category-meta").click();
   await page.locator("#pcMeta > .pc-epoke").click();
   assert.deepEqual(await page.evaluate(()=>window.__clicks),{status:1,category:1,epoke:1},
     "three controls retain click handling at "+width);
   await page.close();
   console.log("PlaceCard hero composition OK at "+width+"x"+height);
 }
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
