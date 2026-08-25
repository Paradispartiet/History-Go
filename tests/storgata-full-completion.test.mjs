import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/places/storgata.json");
const production = read("data/places/production/storgata.json");
const quiz = read("data/quiz/by/storgata_sets.json");
const brief = read("data/quiz/production_briefs/by/storgata.json");
const context = read("data/quiz/production_context/by/storgata.json");
const article = read("data/leksikon/places/oslo/by/leksikon_storgata.json");
const news = read("data/leksikon/places/oslo/by/leksikon_storgata_news.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/storgata.json");
const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter(item => item.place_ids?.includes("storgata"));
const stories = read("data/stories/stories_storgata.json");
const brands = read("data/brands/brands_by_place.json");
const related = read("data/places/places_index.json").filter(row => place.related_place_ids.includes(row.id));

test("Storgata owns one bounded street route and the fixed PlaceCard contract", () => {
  assert.equal(place.routeSegments.length, 15);
  assert.equal(Number(place.routeSegments.reduce((sum, row) => sum + row.lengthM, 0).toFixed(1)), 875.0);
  assert.match(place.spatial_profile.canonical_scope, /Kirkeristen til Nybrua/);
  for (const separatePlace of ["Torggata", "Youngstorget", "Folketeateret", "Brugata/Storgata-rusmiljøet"]) {
    assert.match(place.spatial_profile.canonical_scope, new RegExp(separatePlace.replace("/", "\\/")));
  }
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.equal(place.related_people_ids.length, 3);
  assert.equal(place.objects.length, 4);
  assert.ok(place.objects.every(item => item.physicalObject && item.placeSpecific && item.source_urls.length));
  assert.equal(place.related_place_ids.length, 5);
  assert.equal(Object.hasOwn(brands, "storgata"), false);
  assert.equal(production.roundsReadiness.brandFallback, "honest_empty_state_after_candidate_and_logo_audit");
});

test("Storgata popup layers are substantive, sourced and date-honest", () => {
  assert.ok(place.popupDesc.split(/\n\n/).length >= 7);
  assert.equal(article.chronology.length, 11);
  assert.equal(stories.length, 3);
  assert.ok(stories.every(story => story.quality_profile === "episode_v1" && story.sources.length >= 2));
  assert.equal(news.length, 3);
  assert.ok(news.some(item => item.status === "scheduled" && item.valid_through === "2026-10-31"));
  assert.equal(readings.length, 3);
  assert.ok(readings.every(item => item.access === "open" && /^https:\/\//.test(item.url)));
  assert.deepEqual(language.entries.map(item => item.term), ["Vaterlands Storgade", "Storgata", "sporarrangement"]);
  assert.equal(place.for_na.beforeImageMeta.date, "1938");
  assert.equal(place.for_na.nowImageMeta.date, "2013-09-22");
  assert.match(place.for_na.change, /ikke brukes som bildebevis for dagens/);
  for (const file of [place.for_na.beforeImage, place.for_na.nowImage, place.image, place.cardImage]) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
});

test("Storgata description production packet passes canonical v4.2", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/storgata.json", now: new Date("2026-08-25T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(result.sentences.desc.length, production.sentenceCoverage.desc.length);
  assert.equal(result.sentences.popupDesc.length, production.sentenceCoverage.popupDesc.length);
});

test("Storgata has a canonical rich quiz with normal opening and source ownership", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "rich_5x7");
  assert.equal(quiz.production_context.profile, "rich_5x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.equal(fs.existsSync(path.join(root, "data/quiz/by/storgata_sets_merged.json")), false, "legacy duplicate quiz must be removed after migration");
  assert.ok(questions.slice(0, 14).every(question => ["fact", "context"].includes(question.question_type)));
  assert.ok(questions.slice(0, 14).every(question => !question.method_id && !question.thinker_id));
  const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));
  assert.equal(claims.size, 35);
  for (const question of questions) {
    const claim = claims.get(question.claim_id);
    assert.ok(claim, question.id);
    assert.equal(question.claim_basis, claim.statement, question.id);
    assert.deepEqual(question.source, claim.source_ids, question.id);
    assert.ok(question.source.every(sourceId => /^https:\/\//.test(quiz.sources[sourceId])), question.id);
  }
});

test("Storgata translations track the current canonical source", () => {
  const normalize = value => String(value || "").replace(/\r\n/g, "\n").trim();
  const sourceHash = crypto.createHash("sha256").update(JSON.stringify({
    name: normalize(place.name),
    desc: normalize(place.desc),
    popupDesc: normalize(place.popupDesc)
  })).digest("hex").slice(0, 16);
  for (const languageCode of ["en", "es", "pt"]) {
    const translation = read(`data/i18n/content/places/${languageCode}.json`).storgata;
    assert.equal(translation._sourceHash, sourceHash, languageCode);
    assert.ok(translation.desc.length >= 300, languageCode);
    assert.ok(translation.popupDesc.split(/\n\n/).length >= 5, languageCode);
  }
});

const playwrightImport = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? pathToFileURL(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "playwright/index.mjs")).href
  : "playwright";
const { chromium } = await import(playwrightImport);
const browserExecutable = [chromium.executablePath(), "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"].find(candidate => candidate && fs.existsSync(candidate));
const fixture = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/place-rounds-fill-layout.css"><style>body{margin:0}.pc-icons-quad{display:grid;width:360px;height:300px}.pc-round{box-sizing:border-box;background:#315b78;color:white;border:2px solid #fff;display:grid;place-items:center}.pc-round[hidden]{display:none!important}</style></head><body>
<div id="placeCard" data-current-place-id="storgata"><div class="pc-body"><div class="pc-title-row"><h2>Storgata</h2><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round">People</div><div id="pcBrandsIcon" class="pc-round">Brands</div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div></div></div><button id="pcQuiz" hidden>Ta quiz</button><div id="capture"></div>
<script>window.PLACES=${JSON.stringify([place, ...related])};window.getPeopleForPlace=()=>${JSON.stringify(place.related_people_ids.map(id => ({id,name:id.replaceAll("_"," ")})))};window.HGBrands={getByPlace:()=>[]};window.showPlaceCardRoundPopup=payload=>{window.__lastPopup=payload;document.getElementById("capture").innerHTML=payload.html};</script>
<script src="/js/ui/place-rounds-visual-collections.js"></script><script src="/js/ui/place-rounds-fill-layout.js"></script><script>window.addEventListener("DOMContentLoaded",()=>window.HGPlaceRounds.apply(window.PLACES[0]).then(()=>window.__ready=true).catch(error=>window.__error=String(error&&error.stack||error)))</script></body></html>`;

test("desktop and mobile show four full collection surfaces, separate Badge and Quiz", { skip: !browserExecutable }, async () => {
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/__audit__/storgata.html") { response.writeHead(200, { "content-type": mime[".html"] }); response.end(fixture); return; }
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end("not found"); return; }
    response.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" }); response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: browserExecutable });
    const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
    for (const viewport of [{ width: 1100, height: 760 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto(`http://127.0.0.1:${port}/__audit__/storgata.html`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__ready === true);
      assert.equal(await page.locator(".pc-icons-quad .pc-round:not([hidden])").count(), 4);
      assert.equal(await page.locator(".pc-icons-quad").getAttribute("data-collection-profile-source"), "place_card_profile_v2");
      assert.equal(await page.locator("#pcBadgesIcon").evaluate(node => node.parentElement.classList.contains("pc-title-row")), true);
      assert.equal(await page.locator("#pcQuiz").isVisible(), true);
      assert.equal(await page.locator("#pcQuiz").evaluate(node => node.classList.contains("pc-action-primary")), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true);
      assert.deepEqual(await page.evaluate(() => window.HGPlaceRounds.get(window.PLACES[0]).map(round => round.id)), ["people", "objects", "brands", "related"]);
    }
    await page.locator("#pcObjectsIcon").click();
    await page.waitForFunction(() => window.__lastPopup?.kind === "objects");
    assert.equal(await page.locator("#capture [data-visual-round-item]").count(), 4);
    assert.doesNotMatch(await page.locator("#pcBrandsIcon").textContent(), /^0$/);
    await page.locator("#pcCategoryCollectionIcon").click();
    await page.waitForFunction(() => window.__lastPopup?.kind === "related");
    assert.equal(await page.locator("#capture [data-visual-round-item]").count(), 5);
    assert.equal(await page.evaluate(() => window.__error || null), null);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
