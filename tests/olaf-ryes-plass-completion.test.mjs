import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/by/oslo/places/olaf_ryes_plass.json");
const production = read("data/places/production/olaf_ryes_plass.json");
const runtime = read("data/runtime/place-open/olaf_ryes_plass.json");
const quiz = read("data/quiz/by/olaf_ryes_plass_sets.json");
const brief = read("data/quiz/production_briefs/by/olaf_ryes_plass.json");
const context = read("data/quiz/production_context/by/olaf_ryes_plass.json");
const article = read("data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass.json");
const news = read("data/leksikon/places/oslo/by/leksikon_olaf_ryes_plass_news.json");
const language = read("data/leksikon/sprak/places/europe/norway/oslo/olaf_ryes_plass.json");
const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter(item => item.place_ids?.includes("olaf_ryes_plass"));
const events = read("data/events/by/events_olaf_ryes_plass.json");
const stories = read("data/stories/stories_olaf_ryes_plass.json");
const brands = read("data/brands/brands_by_place.json");
const brandMaster = read("data/brands/brands_master.json");
const peopleRecords = [
  ...read("data/people/historie/oslo/people_historie_oslo.json"),
  ...read("data/people/vitenskap/oslo/people_vitenskap_oslo.json")
].filter(person => place.related_people_ids.includes(person.id));
const knowledge = read("data/knowledge/knowledge_units.generated.json").units;
const related = read("data/places/places_index.json").filter(row => place.related_place_ids.includes(row.id));
const productionChecklist = fs.readFileSync(path.join(root, "docs/PLACE_PRODUCTION_CHECKLIST.md"), "utf8");
const placeStandard = fs.readFileSync(path.join(root, "docs/PLACE_STANDARD.md"), "utf8");
const roundsRuntime = fs.readFileSync(path.join(root, "js/ui/place-rounds-visual-collections.js"), "utf8");
const placeCardRuntime = fs.readFileSync(path.join(root, "js/ui/place-card.js"), "utf8");

test("verified geometry, scope and historical correction remain exact", () => {
  assert.deepEqual([place.lat, place.lon, place.r], [59.9231, 10.7589, 170]);
  assert.equal(place.spatial_profile.geometry_status, "verified_named_square_geometry");
  assert.match(place.spatial_profile.canonical_scope, /ikke omkringliggende gårder, serveringssteder, holdeplass eller hele Grünerløkka/);
  assert.match(place.popupDesc, /Parkteatret ligger ved Olaf Ryes plass 11/);
  assert.match(place.popupDesc, /ikke en del av den canonicale plassflaten/);
  assert.match(place.popupDesc, /6\. juli 1849/);
  assert.doesNotMatch(place.popupDesc, /død[^.]*1848/i);
});

test("four PlaceCard collections have image-ready own-place content", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.deepEqual(place.related_people_ids, ["olaf_rye", "eilert_sundt"]);
  assert.deepEqual(place.objects.map(item => item.id), ["olaf_ryes_plass_eilert_sundt_bust", "olaf_ryes_plass_fontene"]);
  assert.ok(place.objects.every(item => item.physicalObject && item.placeSpecific && item.source_urls.length >= 2 && item.image && item.imageMeta?.sourcePage));
  assert.deepEqual(place.related_place_ids, ["sofienbergparken", "birkelunden", "markveien", "daelenenga_idrettspark"]);
  assert.deepEqual(brands.olaf_ryes_plass, ["parkteatret"]);
  const parkteatret = brandMaster.find(brand => brand.id === "parkteatret");
  assert.equal(parkteatret.logo, "bilder/kort/brands/parkteatret.webp");
  assert.equal(parkteatret.imageMeta?.sourceForm, "official_inline_svg_logo");
  assert.ok(peopleRecords.every(person => person.image && person.imageMeta?.sourcePage));
  for (const asset of [place.frontImage, ...peopleRecords.map(person => person.image), ...place.objects.map(item => item.image), parkteatret.logo]) {
    assert.equal(fs.existsSync(path.join(root, asset)), true, asset);
  }
  assert.equal(place.frontImageMeta.orientation, "portrait");
  const [frontWidth, frontHeight] = place.frontImageMeta.outputDimensions.split("x").map(Number);
  assert.ok(frontHeight > frontWidth);
  assert.equal(production.roundsReadiness.badgePlacement, "separate_header");
  assert.deepEqual(production.roundsReadiness.brandIds, ["parkteatret"]);
  assert.equal(production.roundsReadiness.previewImageCoveragePercent, 100);
  assert.equal(production.roundsReadiness.frontImageOrientation, "portrait");
});

test("global production contract requires member images and a real portrait frontImage", () => {
  assert.match(productionChecklist, /faktisk stående fil\/variant \(`height > width`\)/i);
  assert.match(productionChecklist, /faktisk bilde av ett canonical medlem/i);
  assert.match(productionChecklist, /runtime-fallback.*produksjonsgaten/i);
  assert.match(placeStandard, /alltid en stående fil\/variant med høyde større enn bredde/i);
  assert.match(placeStandard, /previewbilde av ett faktisk canonical medlem/i);
  assert.match(placeStandard, /fallback er runtime-feilhåndtering, ikke godkjent closeout/i);
});

test("place-open hydration refreshes previews and cannot be downgraded by a later full-place response", () => {
  assert.match(roundsRuntime, /"hg:place-open-ready"/);
  assert.match(placeCardRuntime, /\{ \.\.\.patch, \.\.\.hydratedPlace \}/);
});

test("content layers and date boundaries are complete", () => {
  assert.ok(place.popupDesc.split(/\n\n/u).length >= 6);
  assert.equal(article.chronology.length, 7);
  assert.equal(stories.length, 3);
  assert.ok(stories.every(story => story.quality_profile === "episode_v1" && story.sources.length >= 2));
  assert.equal(news.length, 2);
  assert.ok(news.every(item => item.status === "scheduled" && item.valid_through.startsWith("2026-")));
  assert.equal(events.length, 2);
  assert.ok(events.every(item => item.status === "upcoming" && /^2026-/.test(item.start) && /^https:\/\//.test(item.source_url)));
  assert.equal(readings.length, 3);
  assert.ok(readings.every(item => item.access === "open" && /^https:\/\//.test(item.url)));
  assert.deepEqual(language.entries.map(item => item.term), ["Olaf Ryes plass", "Olaf Ryes Plads", "løkke"]);
  assert.equal(place.for_na.beforeImageMeta.date, "1903");
  assert.equal(place.for_na.nowImageMeta.date, "2009-08-01");
  assert.match(place.for_na.change, /ikke dokumentert som identiske/);
});

test("description packet passes canonical v4.2", () => {
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/olaf_ryes_plass.json", now: new Date("2026-08-25T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(result.sentences.popupDesc.length, production.sentenceCoverage.popupDesc.length);
});

test("rich 5x7 quiz and Knowledge ownership are exact", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "rich_5x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.ok(questions.slice(0, 14).every(question => ["fact", "context"].includes(question.question_type) && !question.method_id && !question.thinker_id));
  const counts = questions.reduce((out, question) => ({ ...out, [question.question_type]: (out[question.question_type] || 0) + 1 }), {});
  assert.deepEqual(counts, { fact: 19, context: 9, concept: 7 });
  assert.ok(questions.slice(28).every(question => question.method_id && question.topic_hook_id && question.thinker_id));
  const claims = new Map(brief.claims.map(claim => [claim.claim_id, claim]));
  const generatedIds = new Set(knowledge.map(unit => unit.knowledge_unit_id));
  for (const question of questions) {
    const claim = claims.get(question.claim_id);
    assert.ok(claim, question.id);
    assert.equal(question.claim_basis, claim.statement, question.id);
    assert.deepEqual(question.source, claim.source_ids, question.id);
    assert.ok(question.source.every(sourceId => /^https:\/\//.test(quiz.sources[sourceId])), question.id);
    assert.ok(generatedIds.has(question.primary_knowledge_unit_id), question.primary_knowledge_unit_id);
  }
});

test("place-open exposes every phase 8–19 surface", () => {
  assert.deepEqual(runtime.people.map(person => person.id), ["olaf_rye", "eilert_sundt"]);
  assert.deepEqual(runtime.place.objects.map(item => item.id), place.objects.map(item => item.id));
  assert.deepEqual(runtime.place.related_place_ids, place.related_place_ids);
  assert.deepEqual(runtime.brands.map(brand => brand.id), ["parkteatret"]);
  assert.equal(runtime.stories.length, 3);
  assert.equal(runtime.language.entries.length, 3);
  assert.equal(runtime.place.tasks_profile.tasks.length, 3);
  assert.deepEqual(runtime.events.map(item => item.id), events.map(item => item.id));
  assert.deepEqual(runtime.lesespor.map(item => item.id), readings.map(item => item.id));
});

test("EN, ES and PT track the canonical source hash", () => {
  const normalize = value => String(value || "").replace(/\r\n/g, "\n").trim();
  const hash = crypto.createHash("sha256").update(JSON.stringify({ name: normalize(place.name), desc: normalize(place.desc), popupDesc: normalize(place.popupDesc) })).digest("hex").slice(0, 16);
  for (const code of ["en", "es", "pt"]) {
    const translation = read(`data/i18n/content/places/${code}.json`).olaf_ryes_plass;
    assert.equal(translation._sourceHash, hash, code);
    assert.ok(translation.desc.length >= 250 && translation.popupDesc.length >= 600, code);
  }
});

const playwrightImport = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? pathToFileURL(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "playwright/index.mjs")).href : "playwright";
const { chromium } = await import(playwrightImport);
const browserExecutable = [chromium.executablePath(), "/usr/bin/google-chrome", "/usr/bin/chromium"].find(candidate => candidate && fs.existsSync(candidate));
const fixtureBrand = brandMaster.find(brand => brand.id === "parkteatret");
const fixture = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"><link rel="stylesheet" href="/css/place-rounds-fill-layout.css"><style>body{margin:0}.pc-icons-quad{display:grid;width:360px;height:300px}.pc-round{box-sizing:border-box;background:#315b78;color:white;border:2px solid #fff;display:grid;place-items:center}.pc-round[hidden]{display:none!important}#pcFrontImage{width:240px;height:320px;object-fit:contain}</style></head><body><div id="placeCard" data-current-place-id="olaf_ryes_plass"><div class="pc-body"><div class="pc-title-row"><h2>Olaf Ryes plass</h2><div id="pcBadgesIcon" class="pc-round"></div></div><img id="pcFrontImage" src="/${place.frontImage}" alt="Olaf Ryes plass"><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round">People</div><div id="pcBrandsIcon" class="pc-round">Brands</div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div></div></div><button id="pcQuiz" hidden>Ta quiz</button><div id="capture"></div><script>window.PLACES=${JSON.stringify([place, ...related])};window.getPeopleForPlace=()=>${JSON.stringify(peopleRecords)};window.HGBrands={getByPlace:()=>[${JSON.stringify(fixtureBrand)}],getById:id=>id==="parkteatret"?${JSON.stringify(fixtureBrand)}:null};window.BRANDS_BY_PLACE={olaf_ryes_plass:[${JSON.stringify(fixtureBrand)}]};window.showPlaceCardRoundPopup=p=>{window.__lastPopup=p;document.getElementById("capture").innerHTML=p.html};</script><script src="/js/ui/place-rounds-visual-collections.js"></script><script src="/js/ui/place-rounds-fill-layout.js"></script><script>window.addEventListener("DOMContentLoaded",()=>window.HGPlaceRounds.apply(window.PLACES[0]).then(()=>window.__ready=true).catch(e=>window.__error=String(e)))</script></body></html>`;

test("responsive fixture shows four collections, separate Badge and prominent Quiz", { skip: !browserExecutable }, async () => {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === "/__audit__/olaf.html") { response.writeHead(200,{"content-type":"text/html; charset=utf-8"}); response.end(fixture); return; }
    const file = path.resolve(root, `.${pathname}`); if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    const contentType = { ".css":"text/css", ".js":"text/javascript", ".webp":"image/webp", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg" }[path.extname(file).toLowerCase()] || "application/octet-stream";
    response.writeHead(200,{"content-type":contentType}); response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true,executablePath:browserExecutable}); const page = await browser.newPage();
    for (const viewport of [{width:1100,height:760},{width:390,height:844}]) { await page.setViewportSize(viewport); await page.goto(`http://127.0.0.1:${server.address().port}/__audit__/olaf.html`,{waitUntil:"networkidle"}); await page.waitForFunction(()=>window.__ready===true); assert.equal(await page.locator(".pc-icons-quad .pc-round:not([hidden])").count(),4); assert.equal(await page.locator(".pc-icons-quad .pc-round:not([hidden]) > img").count(),4); assert.ok(await page.locator(".pc-icons-quad .pc-round:not([hidden]) > img").evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0&&image.naturalHeight>0))); assert.ok(await page.locator("#pcFrontImage").evaluate(image=>image.naturalHeight>image.naturalWidth)); assert.equal(await page.locator("#pcBadgesIcon").evaluate(node=>node.parentElement.classList.contains("pc-title-row")),true); assert.equal(await page.locator("#pcQuiz").isVisible(),true); assert.equal(await page.locator("#pcQuiz").evaluate(node=>node.classList.contains("pc-action-primary")),true); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true); }
    assert.deepEqual(await page.evaluate(()=>window.HGPlaceRounds.get(window.PLACES[0]).map(round=>round.id)),["people","objects","brands","related"]);
  } finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); }
});
