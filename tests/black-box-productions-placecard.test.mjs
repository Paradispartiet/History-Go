import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));

test("Black Box has two source-bound productions on the current Marstrandgata stage", () => {
  const place = read("data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json");
  const research = read("data/places/scenekunst/oslo/black_box_teater/forestillinger_research_v1.json");
  assert.equal(place.id,"black_box_teater");
  assert.equal(research.status,"published_with_disclosed_editorial_artwork");
  assert.equal(research.runtime_collection,"productions");
  assert.deepEqual(place.place_card_profile.collection_ids,["people","productions"]);
  assert.equal(place.productions.length,2);
  assert.deepEqual(place.productions.map(x=>x.year),[2004,2018]);
  assert.ok(place.productions.every(x=>x.venue.includes("Marstrandgata")));
  assert.ok(place.productions.every(x=>x.date >= "2004-02-01"));
  assert.ok(!place.productions.some(x=>/hjelp vi får gjester|blaze/i.test(x.title)));
  for (const production of place.productions) {
    assert.equal(production.type,"production");
    assert.ok(production.source_urls.every(url=>url.startsWith("https://")));
    assert.match(production.productionBoundary,/2004|2018|Sceneweb/);
    assert.match(production.imageMeta.disclosure,/ikke produksjonsfoto/i);
    assert.equal(production.imageMeta.source,"history_go_editorial_illustration");
    assert.equal(production.imageMeta.outputDimensions,"1024x512");
    assert.ok(!production.imageMeta.license || !/^CC BY/i.test(production.imageMeta.license));
    assert.ok(!production.imageMeta.licenseUrl);
    assert.ok(production.image.startsWith("bilder/kort/productions/black_box_"));
    assert.ok(production.image.endsWith(".avif"));
    const asset = fs.readFileSync(path.join(root,production.image));
    assert.ok(asset.byteLength > 20000);
    assert.equal(asset.toString("ascii",4,12),"ftypavif");
  }
});

test("Research record preserves distinct historical photo rights status", () => {
  const place = read("data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json");
  const research = read("data/places/scenekunst/oslo/black_box_teater/forestillinger_research_v1.json");
  assert.equal(research.productions.length,place.productions.length);
  for(const record of research.productions){
    assert.equal(record.media_candidate.approved,false);
    assert.equal(record.media_candidate.rights_status,"not_cleared_for_history_go");
    assert.equal(record.image_status,"original_editorial_illustration_integrated");
    assert.ok(place.productions.some(x=>x.image===record.integrated_place_image));
    assert.match(record.materialization_decision,/editorial_illustration/);
  }
});

test("Black Box QuizCard opens from the real Scenekunst collection via PlaceCard loader", async () => {
  const { JSDOM } = await import("jsdom");
  const manifest = read("data/quizcards/scenekunst/manifest.json");
  const collection = read("data/quizcards/scenekunst/black_box_teater_quizkort_v1.json");
  const place = read("data/places/scenekunst/oslo/places_scenekunst/black_box_teater.json");
  const script = fs.readFileSync(path.join(root, "js/ui/place-card-quizcards-patch.js"), "utf8");
  assert.ok(manifest.collections.includes("black_box_teater_quizkort_v1.json"));
  assert.equal(collection.cards[0].questionCount, 10);
  assert.equal(collection.cards[0].questions.length, 10);
  const dom = new JSDOM(`<!doctype html><body>
    <button id="pcFrontCardFlip" aria-label="Quizkort mangler"></button>
    <div id="pcQuizCardContent" hidden></div>
    <img id="pcQuizCardImage" alt="">
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  try {
    const { window } = dom;
    const requested = [];
    window.TEST_MODE = true;
    window.visited = {};
    window.HG_I18N = { t: (_key, fallback) => fallback };
    window.openPlaceCard = async () => true;
    window.DataHub = {
      loadQuizCardsCollection: async requestedPath => {
        requested.push(requestedPath);
        if (requestedPath === "scenekunst/manifest.json") return manifest;
        if (requestedPath === "scenekunst/black_box_teater_quizkort_v1.json") return collection;
        return null;
      }
    };
    window.eval(script);
    await window.openPlaceCard(place);
    const front = window.document.getElementById("pcFrontCardFlip");
    const back = window.document.getElementById("pcQuizCardContent");
    assert.ok(requested.includes("scenekunst/manifest.json"));
    assert.ok(requested.includes("scenekunst/black_box_teater_quizkort_v1.json"));
    assert.equal(front.getAttribute("aria-label"), "Vis quizkort");
    assert.equal(back.hidden, false);
    assert.match(back.textContent, /Scenekunstquiz/);
    assert.match(back.textContent, /Black Box teater/);
    assert.match(back.textContent, /Konsert for Grønland/);
    assert.ok(!place.frontImage, "actual PlaceCard portrait image remains blocked pending image permission");
  } finally {
    dom.window.close();
  }
});
