import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.equal((index.match(/<link[^>]*place-card-sticky-header\.css/g) || []).length, 1,
  "Original hero CSS loads once");
assert.equal((index.match(/<script[^>]*place-card-sticky-header\.js/g) || []).length, 1,
  "Original hero runtime loads once");

const files = [
  "/css/placeCard.css", "/css/place-popup-shortcuts.css",
  "/css/place-unified-surface.css", "/css/place-sheet.css",
  "/css/place-sheet-phase6.css", "/css/place-card-sticky-header.css",
  "/js/ui/place-card-sticky-header.js"
];
const fixture = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${files.filter(x=>x.endsWith(".css")).map(file=>`<link rel="stylesheet" href="${file}">`).join("")}
<style>
html,body{margin:0;background:#111;color:white;font-family:system-ui;}
#placeCard{top:12px;bottom:12px}
#placeCard .pc-body .pc-sheet-shell{min-height:2000px;flex:0 0 auto}
#placeCard .pc-sheet-canonical-about{height:1400px}
#placeCard .pc-sheet-section-nav{flex:0 0 auto}
</style></head><body class="hg-app">
<div id="placeCard" class="is-open is-unified-place is-place-sheet-phase1 is-place-sheet-direct">
<button id="pcCollapseBtn" class="pc-collapse-btn" type="button">▾</button>
<div class="pc-body"><section class="pc-sheet-shell">
<div class="pc-sheet-hero" data-hg-place-sheet-hero><div class="pc-sheet-hero-copy">
<div class="pc-text"><div id="pcHeaderHero" class="pc-heading-hero">
<img id="pcHeaderImage" class="pc-heading-image" alt="">
<div class="pc-heading-content">
<div class="pc-title-row"><h2 id="pcTitle">VG-huset</h2>
<button id="pcFavorite" class="pc-favorite-btn">☆</button>
<button id="pcPeopleIcon" class="pc-round" type="button">Person</button>
<button id="pcBadgesIcon" class="pc-round" type="button">Medier</button>
</div>
<div id="pcMeta" class="pc-meta"><button class="pc-category-meta" type="button">MEDIER · 1980–1999</button>
<button class="pc-epoke" type="button">Epoke: Kommersialisering, kabel og konkurranse</button></div>
<div id="pcStatusBar" class="pc-status-bar"><button class="pc-progress-status-line" type="button">STATUS: IKKE FULLFØRT · TA QUIZ</button></div>
</div></div></div></div>
<nav class="pc-sheet-section-nav"><button type="button">Om</button><button type="button">Fortellinger</button></nav>
<div class="pc-sheet-intro"><p id="pcDesc">Historisk beskrivelse</p></div>
<section class="pc-sheet-canonical-about">Langt historisk innhold</section>
</section></div></div>
<script defer src="/js/ui/place-card-sticky-header.js"></script>
</body></html>`;

const server = http.createServer((req,res)=>{
  const u = new URL(req.url,"http://localhost");
  if (u.pathname === "/__audit__/original-hero.html") {
    res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(fixture);return;
  }
  if (files.includes(u.pathname)) {
    res.writeHead(200,{"content-type":u.pathname.endsWith(".css")?"text/css":"text/javascript"});
    res.end(fs.readFileSync(path.join(root,u.pathname.slice(1))));return;
  }
  res.writeHead(404);res.end("not found");
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
let browser;
try {
  browser = await chromium.launch({headless:true});
  for (const [width,height] of [[390,844],[768,1024],[1280,900]]) {
    const page = await browser.newPage({viewport:{width,height}});
    await page.goto(`http://127.0.0.1:${server.address().port}/__audit__/original-hero.html`);
    await page.evaluate(()=>{
      if (innerWidth<=520) document.body.classList.add("hg-phone");
      window.__initialHero = document.getElementById("pcHeaderHero");
      window.__initialTitle = document.getElementById("pcTitle");
      window.__initialPeople = document.getElementById("pcPeopleIcon");
      window.__initialBadges = document.getElementById("pcBadgesIcon");
      window.__clicks=0;
      document.getElementById("pcStatusBar").querySelector("button")
        .addEventListener("click",()=>window.__clicks++);
      const canvas=document.createElement("canvas");
      canvas.width=1200;canvas.height=750;
      const ctx=canvas.getContext("2d");
      ctx.fillStyle="#f1efe6";ctx.fillRect(0,0,1200,750);
      document.getElementById("pcHeaderImage").src=canvas.toDataURL();
      document.getElementById("pcHeaderHero").classList.add("has-photo-source","has-image");
    });
    await page.waitForFunction(()=>document.querySelector("#placeCard")?.classList.contains("is-original-photo-pinned")
      && document.querySelector("#pcHeaderHero")?.dataset.pcContrast==="dark");
    const initial=await page.evaluate(()=>{
      const rect=(s)=>document.querySelector(s).getBoundingClientRect();
      const style=getComputedStyle(document.querySelector("#pcTitle"));
      return {
        heading:rect("#pcHeaderHero").height,
        titleFont:style.fontSize,
        titleTop:rect("#pcTitle").top,
        titleColor:style.color,
        badgeX:rect("#pcBadgesIcon").x,
        peopleX:rect("#pcPeopleIcon").x,
        source:document.querySelector("#pcHeaderImage").src,
        duplicates:document.querySelectorAll(".pc-sticky-image-header").length,
        full:parseFloat(getComputedStyle(document.querySelector("#placeCard")).getPropertyValue("--pc-original-hero-height"))
      };
    });
    assert.equal(initial.duplicates,0,"No substitute title/photo strip");
    assert.equal(initial.titleColor,"rgb(17, 25, 35)","Bright original image uses dark title");
    await page.evaluate(()=>{window.__initialImageSource=document.querySelector("#pcHeaderImage").src;document.querySelector(".pc-body").scrollTop=280});
    // Unified PlaceCard uses smooth native scrolling: wait until the real
    // scroll container has actually moved, not merely for an initial CSS var.
    await page.waitForFunction(()=>document.querySelector(".pc-body").scrollTop>=250);
    await page.waitForFunction(()=>{
      const c=document.querySelector("#placeCard");
      return parseFloat(c.style.getPropertyValue("--pc-visible-hero-height"))>0;
    });
    const scrolled=await page.evaluate(()=>{
      const r=(s)=>{const x=document.querySelector(s).getBoundingClientRect();
        return {top:x.top,bottom:x.bottom,height:x.height}};
      const hero=document.querySelector("#pcHeaderHero");
      const title=document.querySelector("#pcTitle");
      return {
        originalNodes:hero===window.__initialHero&&title===window.__initialTitle
          &&document.querySelector("#pcPeopleIcon")===window.__initialPeople
          &&document.querySelector("#pcBadgesIcon")===window.__initialBadges,
        duplicate:document.querySelectorAll(".pc-sticky-image-header").length,
        hero:r("#pcHeaderHero"), visible:r(".pc-sheet-hero"),
        title:r("#pcTitle"), badge:r("#pcBadgesIcon"), people:r("#pcPeopleIcon"),
        status:r("#pcStatusBar"), meta:r("#pcMeta"), nav:r(".pc-sheet-section-nav"),
        scroller:r(".pc-body"), scrollTop:document.querySelector(".pc-body").scrollTop,
        scrollHeight:document.querySelector(".pc-body").scrollHeight,
        clientHeight:document.querySelector(".pc-body").clientHeight,
        stickyPosition:getComputedStyle(document.querySelector(".pc-sheet-hero")).position,
        titleFont:getComputedStyle(title).fontSize,
        sameImage:document.querySelector("#pcHeaderImage").src===window.__initialImageSource,
        value:parseFloat(document.querySelector("#placeCard").style.getPropertyValue("--pc-visible-hero-height"))
      };
    });
    assert.ok(scrolled.originalNodes,"Original heading, badges and icons remain single live DOM nodes");
    assert.equal(scrolled.duplicate,0,"Never creates a different-format heading");
    assert.equal(scrolled.titleFont,initial.titleFont,"No title restyling during scroll");
    assert.ok(scrolled.sameImage,"Photo source never changes");
    assert.ok(scrolled.visible.top <= scrolled.scroller.top + 1
      && scrolled.visible.top >= scrolled.scroller.top-1, "Same original image remains pinned: "+JSON.stringify(scrolled));
    assert.ok(scrolled.visible.height<=initial.heading+4,"Image bottom may crop, never expands");
    assert.ok(scrolled.title.bottom<=scrolled.visible.bottom+1,"Title stays visible");
    assert.ok(scrolled.people.bottom<=scrolled.visible.bottom+1
      && scrolled.badge.bottom<=scrolled.visible.bottom+1,"Icon circles stay visible");
    assert.ok(scrolled.meta.bottom<=scrolled.visible.bottom+1
      && scrolled.status.bottom<=scrolled.visible.bottom+1,"Original category, epoch and status stay visible");
    assert.ok(scrolled.nav.top>=scrolled.visible.bottom-1,"Navigation follows pinned image");

    await page.locator("#pcStatusBar button").click();
    assert.equal(await page.evaluate(()=>window.__clicks),1,"Real original progress action still clickable");

    await page.evaluate(()=>{
      const c=document.createElement("canvas");c.width=1200;c.height=750;
      const cx=c.getContext("2d");cx.fillStyle="#101827";cx.fillRect(0,0,c.width,c.height);
      document.querySelector("#pcHeaderImage").src=c.toDataURL();
    });
    await page.waitForFunction(()=>document.querySelector("#pcHeaderHero")?.dataset.pcContrast==="light");
    assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector("#pcTitle")).color),
      "rgb(255, 255, 255)","Dark original image uses light title");
    await page.evaluate(()=>document.querySelector(".pc-body").scrollTop=0);
    await page.waitForFunction(()=>document.querySelector(".pc-body").scrollTop===0);
    await page.waitForFunction(()=>{
      const c=document.querySelector("#placeCard");
      return Math.abs(parseFloat(c.style.getPropertyValue("--pc-visible-hero-height"))-
        parseFloat(c.style.getPropertyValue("--pc-original-hero-height")))<3;
    });
    await page.close();
    console.log("Original PlaceCard hero stays pinned, unchanged and interactive at "+width+"x"+height);
  }
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
