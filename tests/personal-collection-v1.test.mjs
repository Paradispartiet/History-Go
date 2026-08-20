import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");

const profile = read("profile.html");
const knowledge = read("knowledge.html");
const classic = read("knowledge-profile.html");
const collectionRuntime = read("js/ui/personal-collection-v1.js");
const mapBridge = read("js/ui/personal-collection-map-bridge.js");
const knowledgeRuntime = read("js/knowledgePage.js");
const nextUp = read("js/nextUpRuntime.js");
const config = read("js/config.js");
const css = read("css/personal-collection-v1.css");
const docs = read("docs/PERSONAL_COLLECTION_V1.md");
const aha = read("js/aha.js");

function storageWriteKeys(source) {
  return [...source.matchAll(/localStorage\??\.setItem\(\s*["'`]([^"'`]+)["'`]/g)].map(match => match[1]);
}

test("profile.html is the canonical Min samling home", () => {
  assert.match(profile, /<title>Min samling \| History Go<\/title>/);
  assert.match(profile, /data-tab="oversikt"[^>]*>Oversikt/);
  assert.match(profile, /data-tab="samling"[^>]*>Samling/);
  assert.match(profile, /data-tab="kunnskap"[^>]*>Kunnskap/);
  assert.match(profile, /data-tab="merker"[^>]*>Merker/);
  assert.match(profile, /js\/ui\/personal-collection-v1\.js/);
  assert.match(profile, /css\/personal-collection-v1\.css/);
  assert.match(collectionRuntime, /Det du har oppdaget\.<br>Samlet på ett sted\./);
  assert.match(collectionRuntime, /visited_places/);
  assert.match(collectionRuntime, /people_collected/);
  assert.match(collectionRuntime, /hg_knowledge_entries_v2/);
  assert.match(collectionRuntime, /merits_by_category/);
  assert.match(collectionRuntime, /hg_user_notes_v1/);
});

test("Min samling creates no parallel personal collection store", () => {
  assert.deepEqual(storageWriteKeys(collectionRuntime), []);
  assert.deepEqual(storageWriteKeys(mapBridge), []);
  assert.doesNotMatch(collectionRuntime, /personal_collection_v\d|profile_collection_v\d|my_collection_v\d/i);
  assert.match(collectionRuntime, /HGKnowledgeV2\?\.getEntries/);
  assert.match(docs, /oppretter ingen ny localStorage-key eller collection-store/);
});

test("canonical footer Next Up remains the only suggestion/action surface", () => {
  assert.match(nextUp, /const PANEL_ID = "footerNextUpPanel"/);
  assert.match(nextUp, /const BUTTON_ID = "pcNextUpBtn"/);
  assert.match(nextUp, /btn\.textContent = "➜"/);
  assert.match(nextUp, /function renderNextUpV2/);
  assert.match(nextUp, /window\.toggleFooterNextUp = toggleNextUp/);

  assert.match(collectionRuntime, /footer `➜` is the authoritative Next Up surface|footer `➜`|autoritative Next Up|autoritative/i);
  assert.match(collectionRuntime, /index\.html\?nextup=1/);
  assert.doesNotMatch(collectionRuntime, /renderNextUpV2\s*\(/);
  assert.doesNotMatch(collectionRuntime, /HGNavigator\?\.buildForPlace|normalizeSuggestions|handleSuggestionClick/);

  assert.match(mapBridge, /footerNextUpPanel/);
  assert.match(mapBridge, /pcNextUpBtn/);
  assert.match(mapBridge, /toggleFooterNextUp/);
  assert.match(config, /js\/ui\/personal-collection-map-bridge\.js/);
});

test("Knowledge is consolidated into one canonical user-facing page", () => {
  assert.match(knowledge, /<title>Kunnskapen min \| History Go<\/title>/);
  assert.match(knowledge, /Min samling/);
  assert.match(knowledge, /js\/knowledgePage\.js/);
  assert.doesNotMatch(knowledge, /Klassisk kunnskapsprofil/);
  assert.match(classic, /location\.replace\(target\.href\)/);
  assert.match(classic, /knowledge\.html/);
});

test("Knowledge keeps language atlas, source and place provenance", () => {
  assert.match(knowledgeRuntime, /language_atlas/);
  assert.match(knowledgeRuntime, /language_lexicon/);
  assert.match(knowledgeRuntime, /atlas_provenance/);
  assert.match(knowledgeRuntime, /feature_evidence_id/);
  assert.match(knowledgeRuntime, /source_urls/);
  assert.match(knowledgeRuntime, /source_file/);
  assert.match(knowledgeRuntime, /collectionPlace/);
  assert.match(mapBridge, /HGMapView\?\.openPlace/);
  assert.match(mapBridge, /openPlaceCard/);
});

test("AHA remains the existing History Go import boundary", () => {
  assert.match(collectionRuntime, /exportHistoryGoData/);
  assert.match(knowledgeRuntime, /exportHistoryGoData/);
  assert.match(aha, /HG_AHA_IMPORT_SCHEMA_VERSION = "aha_import_payload_v1"/);
  assert.match(aha, /hg_knowledge_entries_v2/);
  assert.doesNotMatch(collectionRuntime, /personal_collection.*export|profile_collection.*export/i);
  assert.doesNotMatch(knowledgeRuntime, /personal_collection.*export|profile_collection.*export/i);
});

test("Social Meet and privacy remain available as secondary profile functionality", () => {
  assert.match(profile, /data-tab="socialmeet"[^>]*>Social Meet/);
  assert.match(profile, /data-panel="socialmeet"/);
  assert.match(profile, /id="spotmeeting-inbox"/);
  assert.match(profile, /id="profileSettingsSocialMount"/);
  assert.match(profile, /id="social-privacy-settings"/);
  assert.match(profile, /window\.renderSpotmeetingInbox = renderSpotmeetingInbox/);
  assert.match(collectionRuntime, /\["socialmeet", "Social Meet"\]/);
});

test("the new personal surfaces do not use History Go yellow as global accent", () => {
  assert.doesNotMatch(css, /#f6c800|#ffd700|rgba\(246\s*,\s*200\s*,\s*0/i);
  assert.match(css, /--pc-accent:#a8d8c7/);
  assert.match(css, /--kv2-accent:var\(--pc-accent\)/);
  assert.match(docs, /gult er ikke global accent/i);
});
