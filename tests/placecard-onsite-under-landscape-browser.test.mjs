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
  "/css/place-onsite-surface.css"
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
  '<div class="pc-sheet-hero-media"><div class="pc-sheet-explore-grid"></div></div></div>',
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
  for (const [width,height] of [[320,700],[390,844],[768,1024],[1024,900],[1440,900]]) {
    const page = await browser.newPage({viewport:{width,height}});
    await page.goto("http://127.0.0.1:"+server.address().port+"/__audit__/onsite-below-landscape.html",{waitUntil:"load"});
    await page.waitForFunction(() =>
      document.querySelector(".pc-text > #pcHeaderHero + #pcEventsBox [data-hg-onsite-action='meet']") !== null);

    const layout = await page.evaluate(() => {
      const box = selector => {
        const node = document.querySelector(selector);
        const r=node.getBoundingClientRect();
        return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
      };
      return {
        image:box("#pcHeaderHero"),
        controls:box("#pcEventsBox"),
        desc:box("#pcDesc"),
        events:box('[data-hg-onsite-action="events"]'),
        meet:box('[data-hg-onsite-action="meet"]'),
        outsideNav:!document.querySelector(".pc-sheet-section-nav #pcEventsBox"),
        count:document.querySelectorAll("#pcEventsBox").length,
        horizontalOverflow:document.documentElement.scrollWidth > innerWidth + 1
      };
    });
    assert.equal(layout.outsideNav,true,"Events/Møtes must be outside horizontal nav at "+width);
    assert.equal(layout.count,1,"One canonical on-site surface at "+width);
    assert.ok(layout.image.bottom <= layout.controls.y + 1 &&
      layout.controls.bottom <= layout.desc.y + 1,
      "Events/Møtes directly after landscape image and before description at "+width+": "+JSON.stringify(layout));
    assert.ok(layout.events.right <= layout.meet.x + 1 &&
      Math.abs(layout.events.y-layout.meet.y)<=1,
      "Two distinct actions on one row at "+width);
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
      document.querySelector(".pc-text > #pcHeaderHero + #pcEventsBox") !== null);
    assert.equal(await page.locator("#pcEventsBox").count(),1,"remount keeps a single node at "+width);
    await page.locator('[data-hg-onsite-action="meet"]').click();
    assert.equal(await page.evaluate(() => window.__actions.meet.length),2);
    await page.close();
    console.log("Events and Møtes below landscape OK at "+width+"x"+height);
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
