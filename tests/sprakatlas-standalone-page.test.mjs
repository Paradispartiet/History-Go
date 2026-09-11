import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");

const page = read("sprakatlas.html");
const language = read("js/ui/place-language-layer.js");
const menu = read("js/ui/header-menu.js");
const contract = read("docs/SPRAKLEKSIKON.md");

test("Språkatlas Norge is a standalone page linked from the header learning menu", () => {
  assert.match(page, /data-sprakatlas-page/);
  assert.match(page, /data-sprakatlas-page-host/);
  assert.match(page, /js\/ui\/place-language-layer\.js/);
  assert.match(page, /js\/ui\/sprakatlas-collection-v4\.js/);
  assert.match(menu, /id:\s*"btnSprakatlas"/);
  assert.match(menu, /href:\s*"sprakatlas\.html"/);
  assert.match(menu, /labelText:\s*"Språkatlas Norge"/);
  assert.match(menu, /headerLearningMenuGroup/);
});

test("PlaceCard language panel never embeds the national atlas", () => {
  const start = language.indexOf("function renderLanguagePanel");
  const end = language.indexOf("function activateTab", start);
  assert.ok(start >= 0 && end > start, "renderLanguagePanel block missing");
  const panelSource = language.slice(start, end);

  assert.doesNotMatch(panelSource, /renderLanguageAtlas\s*\(/);
  assert.doesNotMatch(panelSource, /data-language-atlas/);
  assert.match(panelSource, /stedets eget Språkleksikon|denne fanen viser bare stedets eget Språkleksikon/i);
});

test("Place deep links open the standalone atlas instead of activating an embedded atlas", () => {
  const teaserStart = language.indexOf("function addLanguageTeaser");
  const teaserEnd = language.indexOf("function activateAtlasSelection", teaserStart);
  assert.ok(teaserStart >= 0 && teaserEnd > teaserStart, "language teaser block missing");
  const teaserSource = language.slice(teaserStart, teaserEnd);

  assert.match(teaserSource, /atlasPageHref\(atlasTarget\)/);
  assert.match(teaserSource, /data-open-language-atlas-page/);
  assert.doesNotMatch(teaserSource, /activateAtlasSelection/);
  assert.match(language, /new URL\("sprakatlas\.html", document\.baseURI\)/);
});

test("standalone atlas owns focus navigation and canonical Place return links", () => {
  assert.match(language, /function\s+initStandaloneAtlasPage\s*\(/);
  assert.match(language, /function\s+bindStandaloneAtlas\s*\(/);
  assert.match(language, /searchParams\.get\("focus"\)/);
  assert.match(language, /renderLanguageAtlas\(standaloneAtlasArticle\(atlas, focusId\), atlas\)/);
  assert.match(language, /data-atlas-open-place/);
  assert.match(language, /url\.hash = `#\/place\/\$\{encodeURIComponent\(id\)\}`/);
  assert.match(language, /document\.querySelector\("\[data-sprakatlas-page\]"\)/);
  assert.match(contract, /Språkatlas Norge skal aldri renderes inne i PlaceCard eller stedspopupen/i);
  assert.match(contract, /Header Menu → Læring → Språkatlas Norge/);
});
