import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const id = "brugata_storgata_rusmiljo";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read(`data/places/subkultur/oslo/places_subkultur/${id}.json`);
const production = read(`data/places/production/${id}.json`);
const subcultureProduction = read(`data/places/subkultur-production/${id}.json`);
const quiz = read(`data/quiz/subkultur/${id}_sets.json`);
const brief = read(`data/quiz/production_briefs/subkultur/${id}.json`);
const context = read(`data/quiz/production_context/subkultur/${id}.json`);
const article = read(`data/leksikon/places/oslo/subkultur/leksikon_${id}.json`);
const news = read(`data/leksikon/places/oslo/subkultur/leksikon_${id}_news.json`);
const language = read(`data/leksikon/sprak/places/europe/norway/oslo/${id}.json`);
const readings = read("data/lesespor/oslo/lesespor_oslo_subkultur.json").items.filter(item => item.place_ids?.includes(id));
const stories = read(`data/stories/stories_${id}.json`);
const people = read(`data/people/subkultur/oslo/people_${id}.json`);
const brands = read("data/brands/brands_by_place.json");
const related = read("data/places/places_index.json").filter(row => place.related_place_ids.includes(row.id));

test("Brugata/Storgata owns one bounded social territory and fixed PlaceCard contract", () => {
  assert.match(place.spatial_profile.canonical_scope, /sosiale territorium/u);
  for (const exclusion of ["hele Storgata", "hele Brugata", "Folketeaterkvartalet", "Plata", "Prindsen"]) {
    assert.ok(place.spatial_profile.excludes.some(item => item.includes(exclusion)), exclusion);
  }
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.equal(people.length, 4);
  assert.deepEqual(place.related_people_ids, people.map(person => person.id));
  assert.ok(people.every(person => person.initials && person.source_urls.length && /offentlig|fag|kartlegging|værested/iu.test(`${person.desc} ${person.popupDesc}`)));
  assert.equal(place.objects.length, 3);
  assert.ok(place.objects.every(item => item.physicalObject && item.placeSpecific && item.source_urls.length));
  assert.equal(place.related_place_ids.length, 5);
  assert.equal(Object.hasOwn(brands, id), false);
  assert.match(production.roundsReadiness.brandFallback, /honest_empty_state/u);
});

test("popup, history, images and onsite content are substantive and ethically bounded", () => {
  assert.ok(place.popupDesc.split(/\n\n/u).length >= 7);
  assert.equal(article.chronology.length, 8);
  assert.equal(stories.length, 3);
  assert.ok(stories.every(story => story.quality_profile === "episode_v1" && story.sources.length >= 2));
  assert.equal(news.length, 3);
  assert.equal(readings.length, 3);
  assert.equal(language.entries.length, 3);
  assert.match(language.entries.find(item => item.term.includes("Plata")).context, /ikke canonicalt navn/u);
  assert.match(place.for_na.change, /ikke fra identisk kamerastandpunkt/u);
  assert.match(place.for_na.change, /ikke bevis for rusmiljøets alder/u);
  for (const file of [place.for_na.beforeImage, place.for_na.nowImage, place.image, place.cardImage]) assert.ok(fs.existsSync(path.join(root, file)), file);
  assert.match(place.onsite.safety, /Ikke fotografer, følg, kontakt eller kartlegg/u);
  assert.ok(place.onsite.observation_route.every(stop => !/følg personer|transaksjon|kjøp rus/iu.test(stop.instruction)));
  assert.equal(subcultureProduction.quizOpening.status, "PASS");
  assert.equal(subcultureProduction.chronologyStories.status, "PASS");
});

test("description packet, rich quiz and source ownership pass canonical contracts", () => {
  const result = validatePacket({ packet: production, place, packetFile: `data/places/production/${id}.json`, now: new Date("2026-08-25T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "rich_5x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.ok(questions.slice(0, 14).every(question => ["fact", "context"].includes(question.question_type)));
  assert.ok(questions.slice(0, 14).every(question => !question.method_id && !question.thinker_id));
  assert.ok(quiz.sets.at(-1).questions.some(question => question.method_id));
  assert.ok(quiz.sets.at(-1).questions.some(question => question.thinker_id === "henri_lefebvre"));
  const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));
  assert.equal(claims.size, 35);
  for (const question of questions) {
    const claim = claims.get(question.claim_id);
    assert.equal(question.claim_basis, claim.statement, question.id);
    assert.deepEqual(question.source, claim.source_ids, question.id);
    assert.ok(question.source.every(sourceId => /^https:\/\//u.test(quiz.sources[sourceId])), question.id);
  }
});

test("English, Spanish and Portuguese track the full canonical source", () => {
  const normalize = value => String(value || "").normalize("NFC").replace(/\r\n?/gu, "\n").replace(/[ \t]+/gu, " ").replace(/ *\n */gu, "\n").trim();
  const sourceHash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
  for (const languageCode of ["en", "es", "pt"]) {
    const translation = read(`data/i18n/content/places/${languageCode}.json`)[id];
    assert.equal(translation._sourceHash, sourceHash, languageCode);
    assert.equal(translation._status, "human_reviewed", languageCode);
    assert.ok(translation.desc.length >= 250, languageCode);
    assert.ok(translation.popupDesc.split(/\n\n/u).length >= 7, languageCode);
  }
});

const playwrightImport = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? pathToFileURL(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "playwright/index.mjs")).href
  : "playwright";
const { chromium } = await import(playwrightImport);
const browserExecutable = [chromium.executablePath(), "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"].find(candidate => candidate && fs.existsSync(candidate));
const fixture = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/place-rounds-fill-layout.css"><style>body{margin:0}.pc-icons-quad{display:grid;width:360px;height:300px}.pc-round{box-sizing:border-box;background:#315b78;color:white;border:2px solid #fff;display:grid;place-items:center}.pc-round[hidden]{display:none!important}</style></head><body>
<div id="placeCard" data-current-place-id="${id}"><div class="pc-body"><div class="pc-title-row"><h2>Brugata/Storgata</h2><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round">People</div><div id="pcBrandsIcon" class="pc-round">Brands</div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div></div></div><button id="pcQuiz" hidden>Ta quiz</button><div id="capture"></div>
<script>window.PLACES=${JSON.stringify([place, ...related])};window.getPeopleForPlace=()=>${JSON.stringify(people)};window.HGBrands={getByPlace:()=>[]};window.showPlaceCardRoundPopup=payload=>{window.__lastPopup=payload;document.getElementById("capture").innerHTML=payload.html};</script>
<script src="/js/ui/place-rounds-visual-collections.js"></script><script src="/js/ui/place-rounds-fill-layout.js"></script><script>window.addEventListener("DOMContentLoaded",()=>window.HGPlaceRounds.apply(window.PLACES[0]).then(()=>window.__ready=true).catch(error=>window.__error=String(error&&error.stack||error)))</script></body></html>`;

test("mobile and desktop show four full surfaces, separate Badge and prominent Quiz", { skip: !browserExecutable }, async () => {
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/__audit__/brugata.html") { response.writeHead(200, { "content-type": mime[".html"] }); response.end(fixture); return; }
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
      await page.goto(`http://127.0.0.1:${port}/__audit__/brugata.html`, { waitUntil: "networkidle" });
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
    assert.equal(await page.locator("#capture [data-visual-round-item]").count(), 3);
    assert.doesNotMatch(await page.locator("#pcBrandsIcon").textContent(), /^0$/u);
    await page.locator("#pcCategoryCollectionIcon").click();
    await page.waitForFunction(() => window.__lastPopup?.kind === "related");
    assert.equal(await page.locator("#capture [data-visual-round-item]").count(), 5);
    assert.equal(await page.evaluate(() => window.__error || null), null);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
