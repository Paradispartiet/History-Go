const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium, webkit, devices } = require("playwright");

// A complete UI smoke in a throwaway profile. No live site, account, database,
// real personal notes, external calls or model usage.
const source = fs.readFileSync("js/psychologyRoom.js", "utf8");
const styles = fs.readFileSync("css/psychologyRoom.css", "utf8");
const origin = "http://127.0.0.1:45778";
const synthetic = {
  id: "synthetic-map-one",
  created_at: "2026-11-17T12:00:00Z",
  situation: "<img src=x onerror=alert(1)> Papirfugl fløy forbi",
  thoughts: "Jeg tenkte på fargen blå.",
  feelings: "Nysgjerrig",
  body: "Lette skuldre",
  actions: "Jeg skrev det ned",
  next_step: "Lage en ny papirfugl",
  follow_ups: [{ id: "follow-synthetic", tried: "Brettet papir", outcome: "Det ble et fly" }]
};

async function browserSmoke(engineName, browserEngine, device = {}) {
  const browser = await browserEngine.launch({ headless: true });
  try {
    const context = await browser.newContext(device);
    const page = await context.newPage();
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      if (route.request().method() !== "GET") return route.abort("blockedbyclient");
      if (url.origin !== origin) return route.abort("blockedbyclient");
      if (url.pathname === "/") {
        return route.fulfill({ status: 200, contentType: "text/html; charset=utf-8",
          body: '<!doctype html><html lang="no"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>' });
      }
      if (url.pathname.startsWith("/data/psychology/") && /^[a-zA-Z0-9_-]+\.json$/.test(url.pathname.split("/").pop())) {
        const filename = path.join("data", "psychology", path.basename(url.pathname));
        return route.fulfill({ status: 200, contentType: "application/json",
          body: fs.readFileSync(filename, "utf8") });
      }
      return route.abort("blockedbyclient");
    });
    await page.goto(origin + "/", { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: styles });
    await page.addScriptTag({ content: source });
    await page.evaluate(() => localStorage.setItem("hg_psychology_workbench_v1",
      JSON.stringify([{
        id: "synthetic-map-one", created_at: "2026-11-17T12:00:00Z",
        situation: "<img src=x onerror=alert(1)> Papirfugl fløy forbi",
        thoughts: "Jeg tenkte på fargen blå.", feelings: "Nysgjerrig",
        body: "Lette skuldre", actions: "Jeg skrev det ned",
        next_step: "Lage en ny papirfugl",
        follow_ups: [{ id: "follow-synthetic", tried: "Brettet papir", outcome: "Det ble et fly" }]
      }, {
        id: "synthetic-map-two", created_at: "2026-11-17T12:10:00Z",
        situation: "En gul papirdrage landet i hagen",
        thoughts: "Jeg sammenlignet den med papirfuglen",
        feelings: "Rolig", body: "Rolige skuldre", actions: "Tegnet den",
        next_step: "Skrive en fortsettelse"
      }])));
    await page.evaluate(() => window.PsychologyRoom.open());
    await page.locator('[data-psych-nav="profile"]').click();
    await page.locator('[data-psych-overview-map]').waitFor({ state: "visible" });
    assert.match(await page.locator(".psychology-room-personal-overview").innerText(),
      /2\s*situasjoner/);
    await page.locator('[data-psych-overview-map]').click();
    assert.equal(await page.locator(".psychology-room-inner-case").count(), 0,
      "nothing enters the map automatically");
    await page.locator('[data-psych-map-add="synthetic-map-one"]').click();
    assert.equal(await page.locator(".psychology-room-inner-case").count(), 1);
    assert.equal(await page.locator(".psychology-room-inner-node").count(), 6);
    assert.equal(await page.locator(".psychology-room-inner-node img").count(), 0,
      "untrusted user text must never create live HTML elements");
    assert.ok((await page.locator(".psychology-room-inner-node").first().innerText())
      .includes(synthetic.situation), "escaped user text remains readable");
    const local = await page.evaluate(() => ({
      map: localStorage.getItem("hg_psychology_inner_map_v1"),
      workbench: localStorage.getItem("hg_psychology_workbench_v1"),
      aha: localStorage.getItem("aha_insight_chamber_v1")
    }));
    assert.deepEqual(JSON.parse(local.map).selected_ids, ["synthetic-map-one"]);
    assert.equal(local.map.includes(synthetic.situation), false);
    assert.equal(local.aha, null, "map activity must not create AHA insights");

    const layout = await page.locator(".psychology-room-inner-map").evaluate(el => ({
      right: el.getBoundingClientRect().right,
      contentRight: el.closest(".psychology-room-content").getBoundingClientRect().right
    }));
    assert.ok(layout.right <= layout.contentRight + 2, "map must stay inside its panel");

    // No link is inferred. User connects precisely two explicitly mapped notes.
    await page.locator('[data-psych-map-add="synthetic-map-two"]').click();
    assert.equal(await page.locator(".psychology-room-inner-case").count(), 2);
    assert.equal(await page.locator(".psychology-room-inner-link").count(), 0);
    await page.locator('#psychologyRoomLinkForm select[name="from"]')
      .selectOption("synthetic-map-one");
    await page.locator('#psychologyRoomLinkForm select[name="to"]')
      .selectOption("synthetic-map-two");
    await page.locator('#psychologyRoomLinkForm select[name="kind"]')
      .selectOption("similar");
    await page.locator('#psychologyRoomLinkForm button[type="submit"]').click();
    assert.equal(await page.locator(".psychology-room-inner-link").count(), 1);
    assert.equal(await page.locator(".psychology-room-inner-link img").count(), 0,
      "unsafe note markup must be escaped in connected nodes");
    const linkedState = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("hg_psychology_inner_map_v1")));
    assert.deepEqual(linkedState.links, [{
      from: "synthetic-map-one", to: "synthetic-map-two", kind: "similar"
    }]);
    assert.equal(JSON.stringify(linkedState).includes(synthetic.situation), false,
      "neither the connection nor its endpoints copy the note content");
    await page.locator('[data-psych-map-unlink="synthetic-map-one"]').click();
    assert.equal(await page.locator(".psychology-room-inner-link").count(), 0);
    await page.locator('#psychologyRoomLinkForm select[name="from"]')
      .selectOption("synthetic-map-one");
    await page.locator('#psychologyRoomLinkForm select[name="to"]')
      .selectOption("synthetic-map-two");
    await page.locator('#psychologyRoomLinkForm button[type="submit"]').click();
    assert.equal(await page.locator(".psychology-room-inner-link").count(), 1);
    await page.locator('[data-psych-map-remove="synthetic-map-two"]').click();
    assert.equal(await page.locator(".psychology-room-inner-case").count(), 1);
    assert.equal(await page.locator(".psychology-room-inner-link").count(), 0,
      "removing a note also removes all connected edges");
    assert.deepEqual(await page.evaluate(() =>
      JSON.parse(localStorage.getItem("hg_psychology_inner_map_v1")).links), []);

    await page.locator('[data-psych-map-open="synthetic-map-one"]').click();
    await page.locator('[data-psych-toggle-map="synthetic-map-one"]').waitFor();
    assert.match(await page.locator('[data-psych-toggle-map]').innerText(), /Fjern fra/);
    await page.locator('[data-psych-open-map]').click();
    await page.locator('[data-psych-map-remove="synthetic-map-one"]').click();
    assert.equal(await page.locator(".psychology-room-inner-case").count(), 0);
    assert.deepEqual(await page.evaluate(() =>
      JSON.parse(localStorage.getItem("hg_psychology_inner_map_v1")).selected_ids), []);

    // Reselect a note and verify "delete all" clears both the source record
    // and its map references. Neither must survive in this browser profile.
    await page.locator('[data-psych-map-add="synthetic-map-one"]').click();
    await page.locator('[data-psych-nav="profile"]').click();
    page.once("dialog", dialog => dialog.accept());
    await page.locator('[data-psych-clear-workbench]').click();
    const cleared = await page.evaluate(() => ({
      workbench: localStorage.getItem("hg_psychology_workbench_v1"),
      map: localStorage.getItem("hg_psychology_inner_map_v1"),
      aha: localStorage.getItem("aha_insight_chamber_v1")
    }));
    assert.equal(cleared.workbench, null, "deleting notes removes the source data");
    assert.equal(cleared.map, null, "deleting notes removes selected map references");
    assert.equal(cleared.aha, null, "the map must never create regular AHA insights");
    await context.close();
    console.log(engineName + ": psychology inner-map UI, escaping and responsive layout passed");
  } finally {
    await browser.close();
  }
}

(async () => {
  await browserSmoke("Chromium", chromium, devices["Desktop Chrome"]);
  await browserSmoke("Phone Chromium", chromium, devices["Pixel 5"]);
  await browserSmoke("iPad WebKit", webkit, devices["iPad Pro 11"]);
})().catch(err => { console.error(err); process.exitCode = 1; });
