import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));
const nonEmpty = value => typeof value === "string" && value.trim().length > 0;

const manifestPath = "data/leksikon/sprak/manifest.json";
const manifest = json(manifestPath);

test("Språkleksikon-manifestet bruker v2 og peker på schema", () => {
  assert.equal(manifest.version, 2);
  assert.equal(manifest.schema, "data/leksikon/sprak/schema_v2.json");
  assert.ok(fs.existsSync(path.join(root, manifest.schema)));
  assert.ok(manifest.place_files && typeof manifest.place_files === "object");
  assert.ok(Object.keys(manifest.place_files).length > 0);
});

test("alle stedsspråkfiler har stabil identitet og gyldig grunnstruktur", () => {
  const globalIds = new Set();

  for (const [placeId, relative] of Object.entries(manifest.place_files)) {
    const absolute = path.join(root, relative);
    assert.ok(fs.existsSync(absolute), `mangler språkfil for ${placeId}: ${relative}`);
    const article = JSON.parse(fs.readFileSync(absolute, "utf8"));
    assert.equal(article.place_id, placeId, `${relative}: place_id matcher ikke manifestet`);
    assert.ok(nonEmpty(article.title), `${relative}: title mangler`);
    assert.ok(Array.isArray(article.entries), `${relative}: entries må være array`);

    const localIds = new Set();
    for (const entry of article.entries) {
      assert.ok(nonEmpty(entry?.id), `${relative}: entry.id mangler`);
      assert.ok(nonEmpty(entry?.term), `${relative}/${entry?.id}: term mangler`);
      assert.ok(nonEmpty(entry?.type), `${relative}/${entry?.id}: type mangler`);
      assert.ok(nonEmpty(entry?.meaning), `${relative}/${entry?.id}: meaning mangler`);
      assert.ok(!localIds.has(entry.id), `${relative}: duplikat entry.id ${entry.id}`);
      assert.ok(!globalIds.has(entry.id), `duplikat språk-id på tvers av steder: ${entry.id}`);
      localIds.add(entry.id);
      globalIds.add(entry.id);

      for (const source of Array.isArray(entry.sources) ? entry.sources : []) {
        const url = typeof source === "string" ? source : source?.url;
        assert.match(String(url || ""), /^https:\/\//, `${relative}/${entry.id}: brukerrettet kilde må være HTTPS`);
      }
    }
  }
});

test("språkflaten bruker canonical Knowledge V2-lager og ikke separat samlingslager", () => {
  const runtime = read("js/ui/place-language-layer.js");
  assert.match(runtime, /KNOWLEDGE_KEY\s*=\s*"hg_knowledge_entries_v2"/);
  assert.match(runtime, /SOURCE_TYPE\s*=\s*"language_lexicon"/);
  assert.match(runtime, /subject_id:\s*"sprak"/);
  assert.match(runtime, /TAB_ID\s*=\s*"language"/);
  assert.match(runtime, /Språk på stedet/);
  assert.match(runtime, /dialect_feature/);
  assert.match(runtime, /place_name/);
  assert.match(runtime, /language_history/);
  assert.doesNotMatch(runtime, /language_collection|dialect_collection|hg_language_collection/i);
});

test("legacy-arrangementer blir ikke løftet som språkinnhold", () => {
  const runtime = read("js/ui/place-language-layer.js");
  assert.match(runtime, /BLOCKED_LANGUAGE_TYPES/);
  assert.match(runtime, /"arrangement"/);
  assert.match(runtime, /"event"/);
  assert.match(runtime, /"stevne"/);
  assert.match(runtime, /filter\(isLanguageEntry\)/);

  const bislett = json(manifest.place_files.bislett_stadion);
  assert.ok(bislett.entries.some(entry => entry.type === "arrangement"), "fixture må fortsatt dekke legacy-arrangement");
});

test("språkflaten lastes etter både Knowledge V2 og popup-loaderen", () => {
  const config = read("js/config.js");
  const knowledgeIndex = config.indexOf('"dist/web/knowledgeV2.js"');
  const popupLoaderIndex = config.indexOf('"js/ui/place-card-status-surface.js"');
  const languageIndex = config.indexOf('"js/ui/place-language-layer.js"');
  assert.ok(knowledgeIndex >= 0, "Knowledge V2 mangler i runtime-listen");
  assert.ok(popupLoaderIndex >= 0, "PlaceCard popup-loader mangler i runtime-listen");
  assert.ok(languageIndex > knowledgeIndex, "språkflaten må lastes etter Knowledge V2");
  assert.ok(languageIndex > popupLoaderIndex, "språkflaten må lastes etter popup-tab-loaderen");
});

test("Språkleksikon-dokumentasjonen låser valgfri språkfane og ingen ny runding", () => {
  const contract = read("docs/SPRAKLEKSIKON.md");
  const popup = read("docs/PLACE_POPUP_SYSTEM.md");
  assert.match(contract, /ikke.*PlaceCard-runding/i);
  assert.match(contract, /hg_knowledge_entries_v2/);
  assert.match(popup, /datastyrt, valgfri/);
  assert.match(popup, /Språk/);
});
