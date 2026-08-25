import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const playwrightImport = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? pathToFileURL(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "playwright/index.mjs")).href
  : "playwright";
const { chromium } = await import(playwrightImport);

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/politikk/oslo/places_politikk/youngstorget.json");
const production = read("data/places/production/youngstorget.json");
const politics = read("data/places/politikk-production/youngstorget.json");
const quiz = read("data/quiz/politikk/youngstorget_sets.json");
const brief = read("data/quiz/production_briefs/politikk/youngstorget.json");
const contextArtifact = read("data/quiz/production_context/politikk/youngstorget.json");
const mainArticle = read("data/leksikon/places/oslo/politikk/leksikon_youngstorget.json");
const news = read("data/leksikon/places/oslo/politikk/leksikon_youngstorget_news.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/youngstorget.json");
const readingsPackage = read("data/lesespor/lesespor_oslo_batch2.json");
const related = read("data/places/places_index.json").filter(row => place.related_place_ids.includes(row.id));

test("Youngstorget has one canonical scope and the fixed PlaceCard contract", () => {
  assert.equal(Object.hasOwn(place, "rounds"), false);
  assert.equal(Object.hasOwn(place, "layers"), false);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.deepEqual(place.related_people_ids, ["jorgen_young", "jacob_wilhelm_nordan", "per_palle_storm", "hagbart_sollos"]);
  assert.equal(place.objects.length, 4);
  assert.ok(place.objects.every(item => item.physicalObject && item.placeSpecific && item.source_urls.length));
  assert.equal(place.related_place_ids.length, 5);
  assert.match(place.spatial_profile.canonical_scope, /ikke Folkets Hus, Folketeateret, Møllergata, Youngs gate, Torggata/);
  assert.ok(place.externalLinks.length >= 10);
  assert.ok(place.externalLinks.every(link => /^https:\/\//.test(link.url)));
  assert.equal(production.roundsReadiness.brandIds.length, 0);
  assert.equal(production.roundsReadiness.brandFallback, "honest_empty_state_after_candidate_and_logo_audit");
});

test("popup-owned collections provide chronology, current news, open reading and language", () => {
  assert.equal(mainArticle.chronology.length, 10);
  assert.equal(news.length, 3);
  assert.ok(news.some(item => item.status === "scheduled" && item.valid_through === "2026-09-19"));
  const openReadings = readingsPackage.items.filter(item => item.place_ids?.includes("youngstorget") && item.access === "open");
  assert.equal(openReadings.length, 3);
  assert.ok(openReadings.every(item => /^https:\/\//.test(item.url)));
  assert.deepEqual(language.entries.map(item => item.term), ["Nytorvet", "Youngstorget", "meningstorg"]);
  assert.ok(language.entries.every(item => item.sources?.every(source => /^https:\/\//.test(source.url))));
  assert.equal(place.for_na.beforeImageMeta.date, "1939");
  assert.equal(place.for_na.nowImageMeta.date, "2025-09-26");
  assert.match(place.for_na.change, /86 år/);
});

test("canonical rich quiz has normal opening, balanced progression and claim ownership", () => {
  const all = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.production_context.profile, "rich_5x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(all.length, 35);
  const first14 = all.slice(0, 14);
  assert.ok(first14.every(question => ["fact", "context"].includes(question.question_type)));
  assert.ok(first14.every(question => !question.method_id && !question.topic_hook_id && !question.thinker_id));
  const counts = all.reduce((acc, question) => { acc[question.question_type] += 1; return acc; }, { fact:0, context:0, concept:0 });
  assert.deepEqual(counts, { fact:19, context:9, concept:7 });
  const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));
  assert.equal(claims.size, 35);
  for (const question of all) {
    const claim = claims.get(question.claim_id);
    assert.ok(claim, question.id);
    assert.equal(question.claim_basis, claim.statement, question.id);
    assert.deepEqual(question.source, claim.source_ids, question.id);
    assert.ok(question.source.every(sourceId => /^https:\/\//.test(quiz.sources[sourceId])), question.id);
  }
  assert.equal(contextArtifact.profile, "rich_5x7");
  assert.equal(politics.quizOpening.status, "PASS");
  assert.equal(politics.gates.F.status, "PASS");
});

const fixture = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/css/place-rounds-fill-layout.css"><style>
body{margin:0}.pc-icons-quad{display:grid;width:360px;height:300px}.pc-round{box-sizing:border-box;background:#315b78;color:white;border:2px solid #fff;display:grid;place-items:center}.pc-round[hidden]{display:none!important}
</style></head><body><div id="placeCard" data-current-place-id="youngstorget"><div class="pc-body"><div class="pc-title-row"><h2>Youngstorget</h2><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round">People</div><div id="pcBrandsIcon" class="pc-round">Brands</div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div></div></div><button id="pcQuiz" hidden>Ta quiz</button><div id="capture"></div>
<script>window.PLACES=${JSON.stringify([place, ...related])};window.getPeopleForPlace=()=>${JSON.stringify(place.related_people_ids.map(id => ({id,name:id.replaceAll("_"," ")})))};window.HGBrands={getByPlace:()=>[]};window.showPlaceCardRoundPopup=payload=>{window.__lastPopup=payload;document.getElementById("capture").innerHTML=payload.html};</script>
<script src="/js/ui/place-rounds-visual-collections.js"></script><script src="/js/ui/place-rounds-fill-layout.js"></script>
<script>window.addEventListener("DOMContentLoaded",()=>window.HGPlaceRounds.apply(window.PLACES[0]).then(()=>window.__ready=true).catch(error=>window.__error=String(error&&error.stack||error)))</script></body></html>`;

test("desktop and mobile render four full collections, separate Badge and prominent Quiz", { skip: !fs.existsSync(chromium.executablePath()) }, async () => {
  const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8" };
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/__audit__/youngstorget.html") { response.writeHead(200,{"content-type":mime[".html"]}); response.end(fixture); return; }
    const file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end("not found"); return; }
    response.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream"}); response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
  const { port } = server.address();
  let browser;
  try {
    browser = await chromium.launch({headless:true});
    const page = await browser.newPage({viewport:{width:1100,height:760}});
    for (const viewport of [{width:1100,height:760},{width:390,height:844}]) {
      await page.setViewportSize(viewport);
      await page.goto(`http://127.0.0.1:${port}/__audit__/youngstorget.html`,{waitUntil:"networkidle"});
      await page.waitForFunction(()=>window.__ready===true);
      assert.equal(await page.locator(".pc-icons-quad .pc-round:not([hidden])").count(),4);
      assert.equal(await page.locator(".pc-icons-quad").getAttribute("data-collection-profile-source"),"place_card_profile_v2");
      assert.equal(await page.locator("#pcBadgesIcon").evaluate(node=>node.parentElement.classList.contains("pc-title-row")),true);
      assert.equal(await page.locator("#pcQuiz").isVisible(),true);
      assert.equal(await page.locator("#pcQuiz").evaluate(node=>node.classList.contains("pc-action-primary")),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true);
      assert.deepEqual(await page.evaluate(()=>window.HGPlaceRounds.get(window.PLACES[0]).map(round=>round.id)),["people","objects","brands","related"]);
    }
    await page.locator("#pcObjectsIcon").click();
    await page.waitForFunction(()=>window.__lastPopup?.kind==="objects");
    assert.equal(await page.locator("#capture [data-visual-round-item]").count(),4);
    assert.doesNotMatch(await page.locator("#pcBrandsIcon").textContent(),/^0$/);
    await page.locator("#pcCategoryCollectionIcon").click();
    await page.waitForFunction(()=>window.__lastPopup?.kind==="related");
    assert.equal(await page.locator("#capture [data-visual-round-item]").count(),5);
    assert.equal(await page.evaluate(()=>window.__error||null),null);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
