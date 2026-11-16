import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("PlaceCard sticky header never jumps to ordinary flow on passive iPad scroll", () => {
  const script = read("js/ui/place-card-sticky-header.js");
  const css = read("css/place-card-sticky-header.css");
  assert.doesNotMatch(script, /classList\.toggle\("is-quizcard-reading"/);
  assert.doesNotMatch(css, /:has\(#pcFrontCardFlip\.is-flipped\)/);
  assert.match(script, /naturalHeight \* 0\.46/);
  assert.match(css, /\.pc-sheet-hero\s*\{\s*position:\s*sticky/);
  assert.match(css, /\.is-section-reading \.pc-sheet-hero\s*\{\s*position:\s*relative/);
});

test("The next quiz action shares the epoch baseline without a full-width epoch strip", () => {
  const css = read("css/placeCard.css");
  const html = read("index.html");
  assert.match(css, /\.pc-heading-content #pcStatusBar\s*\{[^}]*position:absolute;[^}]*right:15px;[^}]*bottom:14px;/);
  assert.match(css, /#pcMeta > \.pc-epoke\s*\{[^}]*width:max-content;[^}]*max-width:calc\(100% - 106px\)/);
  assert.doesNotMatch(html, /#pcMeta > \.pc-epoke\s*\{\s*flex-basis:100%!important;/);
});

test("Grønland police headquarters uses different documented landscape and portrait sources", () => {
  const source = JSON.parse(read("data/places/politikk/oslo/places_politikk/politihuset_gronland.json"));
  const payload = JSON.parse(read("data/runtime/place-open/politihuset_gronland.json")).place;
  for (const place of [source, payload]) {
    assert.equal(place.id, "politihuset_gronland");
    assert.notEqual(place.image, place.frontImage);
    assert.notEqual(place.imageMeta.sourcePage, place.frontImageMeta.sourcePage);
    const [w, h] = place.imageMeta.sourceDimensions.split("x").map(Number);
    assert.ok(w > h && w >= 1280, "Overview must be a sharp landscape photograph");
    assert.equal(place.imageMeta.creator, "Chell Hill");
    assert.ok(place.externalLinks.some((link) => link.url === place.imageMeta.sourcePage));
  }
  assert.equal(source.image, payload.image);
  assert.deepEqual(source.imageMeta, payload.imageMeta);
});
