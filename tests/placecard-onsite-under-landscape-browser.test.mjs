import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const styles = [
  "/css/placeCard.css",
  "/css/place-unified-surface.css",
  "/css/place-sheet.css",
  "/css/place-sheet-phase6.css",
  "/css/place-onsite-surface.css",
  "/css/place-rounds-fill-layout.css"
];
const body = [
  '<!doctype html><html lang="nb"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  ...styles.map(url => '<link rel="stylesheet" href="'+url+'">'),
  '</head><body class="hg-app">',
  '<div id="placeCard" class="is-open is-unified-place is-place-sheet-phase1 is-place-sheet-direct" data-current-place-id="stortorget">',
  '<div class="pc-body"><section class="pc-sheet-shell">',
  '<nav class="pc-sheet-section-nav" data-hg-place-sheet-nav="1"><button type="button" data-hg-place-sheet-jump="about">Om</button>',
  '<div id="pcEventsBox" class="pc-quad pc-events-quad"></div>',
  '<button type="button" data-hg-place-sheet-jump="history">Historie</button></nav>',
  '<div class="pc-sheet-hero">',
  '<div class="pc-sheet-hero-copy"><div class="pc-text">',
  '<div id="pcStatusBar"><button type="button">Status</button></div>',
  '<div id="pcHeaderHero" class="pc-heading-hero has-photo-source has-image">',
  '<div class="pc-heading-content"><div class="pc-title-row"><h2 id="pcTitle">Stortorget</h2>',
  '<div id="pcPeopleIcon" class="pc-round">Personer</div>',
  '<div id="pcBadgesIcon" class="pc-round">Merker</div></div></div></div>',
  '<p id="pcDesc">Historisk beskrivelse av Stortorget.</p>',
  '</div></div>',
  '<div class="pc-sheet-hero-media">',
  '<div class="pc-frontcard" id="pcFrontCardFlip"><div class="pc-card-flip-inner">',
   '<div class="pc-card-face pc-card-face-front"><img id="pcFrontImage" alt="" /></div>',
   '</div></div>',
  '<div class="pc-sheet-explore-grid"><div class="pc-side-stack">',
  '<div class="pc-icons-quad" data-collection-count="4">',
  '<div class="pc-collection" data-collection-id="objects" data-collection-shape="rectangle" aria-label="Gjenstander"></div>',
  '<div class="pc-collection" data-collection-id="brands" data-collection-shape="rectangle" aria-label="Brands"></div>',
  '<div class="pc-collection" data-collection-id="competitions" data-collection-shape="rectangle" aria-label="Kamper og konkurranser"></div>',
   '<div class="pc-collection" data-collection-id="related" data-collection-shape="rectangle" aria-label="Relaterte steder"></div>',
  '</div></div></div></div>',
  '</section><div class="pc-grid" hidden></div></div></div>',
  '<script>',
  'window.PLACES=[{id:"stortorget",name:"Stortorget",category:"by"}];',
  'window.HGEvents={ready:true,getUpcomingByPlace:()=>[]};',
  'window.__actions={events:[],meet:[]};',
  'window.showPlaceCardRoundPopup=options=>window.__actions.events.push(options);',
  'window.HG_SpotmeetingUI={open:options=>window.__actions.meet.push(options)};',
  'window.fetch=async()=>({ok:false});',
  '</script>',
  '<script src="/js/ui/place-onsite-surface.js"></script>',
  '</body></html>'
].join("\n");

const served = new Set([...styles, "/js/ui/place-onsite-surface.js"]);
const server = http.createServer((request,response) => {
  const url = new URL(request.url,"http://localhost").pathname;
  if (url === "/__audit__/onsite-below-landscape.html") {
    response.writeHead(200,{"content-type":"text/html; charset=utf-8"});
    response.end(body);
  } else if (served.has(url)) {
    response.writeHead(200,{"content-type":url.endsWith(".css") ? "text/css" : "text/javascript"});
    response.end(fs.readFileSync(path.join(root,url.slice(1))));
  } else {
    response.writeHead(404);
    response.end("not found");
  }
});
await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
let browser;
try {
  browser = await chromium.launch({headless:true});
  for (const [width,height] of [[320,700],[390,844],[768,1024],[820,1180],[1024,900],[1180,820],[1440,900]]) {
    const page = await browser.newPage({viewport:{width,height}});
    await page.goto("http://127.0.0.1:"+server.address().port+"/__audit__/onsite-below-landscape.html",{waitUntil:"load"});
    await page.waitForFunction(() =>
      document.querySelector(".pc-sheet-explore-grid > .pc-side-stack + #pcEventsBox [data-hg-onsite-action='meet']") !== null);

    const layout = await page.evaluate(() => {
      const box = selector => {
        const node = document.querySelector(selector);
        const r=node.getBoundingClientRect();
        return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
      };
      return {
        front:box(".pc-frontcard"),
        frontImage:box("#pcFrontImage"),
        collectionAspect:getComputedStyle(document.querySelector(".pc-icons-quad")).aspectRatio,
        typography:{
          title:parseFloat(getComputedStyle(document.querySelector("#pcTitle")).fontSize),
          description:parseFloat(getComputedStyle(document.querySelector("#pcDesc")).fontSize),
          navigation:parseFloat(getComputedStyle(document.querySelector(".pc-sheet-section-nav button")).fontSize),
          collectionLabel:parseFloat(getComputedStyle(document.querySelector(".pc-collection"),"::after").fontSize),
          onsiteLabel:parseFloat(getComputedStyle(document.querySelector(".pc-onsite-action-label")).fontSize)
        },
        rounds:box(".pc-side-stack"),
        competitions:box('[data-collection-id="competitions"]'),
        controls:box("#pcEventsBox"),
        events:box('[data-hg-onsite-action="events"]'),
        meet:box('[data-hg-onsite-action="meet"]'),
        rightColumn:box(".pc-sheet-explore-grid"),
        parentClass:document.getElementById("pcEventsBox").parentElement.className,
        previousClass:document.getElementById("pcEventsBox").previousElementSibling?.className,
        outsideNav:!document.querySelector(".pc-sheet-section-nav #pcEventsBox"),
        count:document.querySelectorAll("#pcEventsBox").length,
        rightDisplay:getComputedStyle(document.querySelector(".pc-sheet-explore-grid")).display,
        rightHeight:document.querySelector(".pc-sheet-explore-grid").getBoundingClientRect().height,
        lastVisibleCollectionBottom:Math.max(...[...document.querySelectorAll(".pc-sheet-explore-grid .pc-collection:not([hidden])")]
          .filter(element => getComputedStyle(element).display !== "none")
          .map(element => element.getBoundingClientRect().bottom)),
        horizontalOverflow:document.documentElement.scrollWidth > innerWidth + 1
      };
    });
    assert.equal(layout.outsideNav,true,"Events/Møtes must be outside horizontal nav at "+width);
    assert.equal(layout.count,1,"One canonical on-site surface at "+width);
    assert.equal(layout.parentClass,"pc-sheet-explore-grid","Events/Møtes belong to right-hand grid at "+width);
    assert.equal(layout.previousClass,"pc-side-stack","Events/Møtes follow the collection rounds at "+width);
    assert.ok(layout.front.right <= layout.controls.x + 1,
      "Events/Møtes stay to the right of frontImage at "+width+": "+JSON.stringify(layout));
    assert.ok(layout.competitions.bottom <= layout.controls.y + 1,
      "Events/Møtes directly below Kamper og konkurranser at "+width+": "+JSON.stringify(layout));
    assert.ok(layout.controls.x >= layout.rightColumn.x - 1 &&
      layout.controls.right <= layout.rightColumn.right + 1,
      "Events/Møtes stay within right column at "+width);
    assert.equal(layout.rightDisplay,"flex","right-hand column stretches as flex at "+width);
    assert.equal(layout.collectionAspect,"auto","Place Sheet collections must not reserve legacy 3:4 empty height at "+width);
    assert.ok(layout.typography.title >= 30 && layout.typography.description >= (width <= 720 ? 16 : 17) &&
      layout.typography.navigation >= 13 && layout.typography.collectionLabel >= 14 &&
      layout.typography.onsiteLabel >= (width <= 700 ? 11 : 13),
      "PlaceCard typography uses the modestly enlarged scale at "+width+": "+JSON.stringify(layout.typography));
    if (width >= 768) {
      assert.ok(Math.abs(layout.front.height - layout.front.width * 4 / 3) <= 2,
        "frontImage must retain its natural 3:4 proportions at "+width+": "+JSON.stringify(layout));
      assert.ok(Math.abs(layout.frontImage.bottom - layout.front.bottom) <= 2,
        "visible frontImage must reach the card baseline at "+width+": "+JSON.stringify(layout));
      assert.ok(Math.abs(layout.controls.bottom - layout.front.bottom) <= 2,
        "Events/Møtes bottom must align with frontImage bottom at "+width+": "+
        JSON.stringify({frontBottom:layout.front.bottom,controlsBottom:layout.controls.bottom,roundsBottom:layout.rounds.bottom,rightHeight:layout.rightHeight}));
      assert.ok(layout.controls.y - layout.lastVisibleCollectionBottom >= 7,
        "Events/Møtes must not overlap any rendered collection tile at "+width+": "+
        JSON.stringify({front:layout.front,rounds:layout.rounds,controls:layout.controls,lastVisibleCollectionBottom:layout.lastVisibleCollectionBottom}));
    }
    if (width <= 700) {
      assert.ok(layout.events.bottom <= layout.meet.y + 1,
        "On narrow screens controls stack to remain readable at "+width);
    } else {
      assert.ok(layout.events.right <= layout.meet.x + 1 &&
        Math.abs(layout.events.y - layout.meet.y) <= 1,
        "Events and Møtes are side by side at "+width);
    }
    assert.equal(layout.horizontalOverflow,false,"No horizontal overflow at "+width);
    await page.locator('[data-hg-onsite-action="events"]').click();
    await page.waitForFunction(() => window.__actions.events.length === 1);
    await page.locator('[data-hg-onsite-action="meet"]').click();
    assert.deepEqual(await page.evaluate(() => ({
      kind:window.__actions.events[0]?.kind,
      contextType:window.__actions.meet[0]?.contextType,
      contextId:window.__actions.meet[0]?.contextId
    })),{kind:"events",contextType:"place",contextId:"stortorget"});

    // Simulate a later Place Sheet remount: the live on-site owner restores
    // the exact same node to the photo area without duplicating listeners.
    await page.evaluate(() => {
      const node=document.getElementById("pcEventsBox");
      document.querySelector(".pc-sheet-section-nav").appendChild(node);
    });
    await page.waitForFunction(() =>
      document.querySelector(".pc-sheet-explore-grid > .pc-side-stack + #pcEventsBox") !== null);
    assert.equal(await page.locator("#pcEventsBox").count(),1,"remount keeps a single node at "+width);
    await page.locator('[data-hg-onsite-action="meet"]').click();
    assert.equal(await page.evaluate(() => window.__actions.meet.length),2);
    await page.close();
    console.log("Events and Møtes below collections beside frontImage OK at "+width+"x"+height);
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
