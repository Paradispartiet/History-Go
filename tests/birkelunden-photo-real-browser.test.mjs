#!/usr/bin/env node
// Real History Go app: decoded, independent Birkelunden images across responsive sizes.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const place = read("data/places/by/oslo/places/birkelunden.json");
const runtime = read("data/runtime/place-open/birkelunden.json").place;
assert.equal(place.id, "birkelunden");
assert.equal(runtime.image, place.image);
assert.equal(runtime.frontImage, place.frontImage);
assert.notEqual(place.image, place.frontImage);

const mime = {
  ".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript",
  ".json":"application/json", ".css":"text/css", ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg", ".png":"image/png", ".webp":"image/webp",
  ".svg":"image/svg+xml", ".woff2":"font/woff2", ".wasm":"application/wasm"
};
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400); res.end(); return; }
  const file = path.resolve(ROOT, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end("not found"); return;
  }
  res.writeHead(200, {"content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream"});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + server.address().port;
const viewports = [
  {name:"mobile", width:390, height:844, mobile:true},
  {name:"ipad-portrait", width:820, height:1180, mobile:true},
  {name:"ipad-landscape", width:1180, height:820, mobile:true},
  {name:"desktop", width:1440, height:960, mobile:false}
];
const out = path.join(ROOT, "artifacts", "birkelunden-photo-real-browser");
fs.mkdirSync(out, {recursive:true});
const results = [];
let browser;
try {
  browser = await chromium.launch({
    headless:true,
    executablePath:process.env.CHROME_BIN || undefined,
    args:["--no-sandbox","--disable-dev-shm-usage"]
  });
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport:{width:viewport.width,height:viewport.height},
      isMobile:viewport.mobile, hasTouch:viewport.mobile, locale:"nb-NO"
    });
    let page;
    try {
      await context.addInitScript(() => {
        localStorage.setItem("hg_onboarding_shown_v1", "1");
        localStorage.setItem("HG_TEST_MODE", "1");
        localStorage.setItem("hg_lang", "nb");
      });
      page = await context.newPage();
      await page.goto(base+"/index.html?hgTest=1#/place/birkelunden", {waitUntil:"domcontentloaded",timeout:80000});
      await page.waitForFunction(() =>
        window.__HG_APP_READY__ === true &&
        window.__HG_ROUTER_STARTED__ === true &&
        document.querySelector("#placeCard")?.dataset.currentPlaceId === "birkelunden",
        null, {timeout:85000});
      await page.waitForFunction(() => {
        const hero = document.querySelector("#pcHeaderImage");
        const front = document.querySelector("#pcFrontImage");
        return hero?.complete && front?.complete && hero.naturalWidth>0 &&
          hero.naturalHeight>0 && front.naturalWidth>0 && front.naturalHeight>0;
      }, null, {timeout:50000});
      const actual = await page.evaluate(() => {
        const meta = id => {
          const el = document.getElementById(id);
          const rect = el.getBoundingClientRect();
          return {src:el.currentSrc, width:el.naturalWidth, height:el.naturalHeight,
            inDocument:document.contains(el), rectWidth:rect.width, rectHeight:rect.height};
        };
        return {hero:meta("pcHeaderImage"),front:meta("pcFrontImage")};
      });
      assert.ok(actual.hero.src.endsWith("/"+place.image), viewport.name+": unexpected header image");
      assert.ok(actual.front.src.endsWith("/"+place.frontImage), viewport.name+": unexpected front image");
      assert.ok(actual.hero.width > actual.hero.height, viewport.name+": header is not landscape");
      assert.ok(actual.front.height > actual.front.width, viewport.name+": front is not portrait");
      assert.notEqual(actual.hero.src, actual.front.src, viewport.name+": photos must be distinct");
      assert.ok(actual.hero.inDocument && actual.front.inDocument);
      assert.ok(actual.hero.rectWidth > 0 && actual.front.rectWidth > 0, viewport.name+": image has no rendered width");
      await page.locator("#placeCard").screenshot({path:path.join(out,viewport.name+".png")});
      results.push({viewport:viewport.name,status:"passed",actual});
      console.log("PASS Birkelunden photo",viewport.name,actual.hero.width+"x"+actual.hero.height,actual.front.width+"x"+actual.front.height);
    } catch (err) {
      results.push({viewport:viewport.name,status:"failed",error:String(err.stack||err).slice(0,2500)});
      await page?.screenshot({path:path.join(out,viewport.name+"-failed.png"),fullPage:true,timeout:10000}).catch(()=>{});
    } finally {
      await page?.close().catch(()=>{});
      await context.close();
    }
  }
} finally {
  await browser?.close().catch(()=>{});
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(out,"results.json"),JSON.stringify(results,null,2)+"\n");
}
assert.equal(results.length,4);
assert.deepEqual(results.filter(row=>row.status!=="passed"),[]);
