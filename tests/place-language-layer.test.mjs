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

test("språkflaten bruker canonical Knowledge V2-lager og en samlingsfasett, ikke et falskt fag", () => {
  const runtime = read("js/ui/place-language-layer.js");
  assert.match(runtime, /KNOWLEDGE_KEY\s*=\s*"hg_knowledge_entries_v2"/);
  assert.match(runtime, /SOURCE_TYPE\s*=\s*"language_lexicon"/);
  assert.match(runtime, /COLLECTION_KIND\s*=\s*"language"/);
  assert.match(runtime, /resolveSubjectId/);
  assert.match(runtime, /subject_id:\s*subjectId/);
  assert.match(runtime, /collection_kind:\s*COLLECTION_KIND/);
  assert.doesNotMatch(runtime, /subject_id:\s*["']sprak["']/);
  assert.match(runtime, /TAB_ID\s*=\s*"language"/);
  assert.match(runtime, /Språk på stedet/);
  assert.match(runtime, /dialect_feature/);
  assert.match(runtime, /place_name/);
  assert.match(runtime, /language_history/);
  assert.doesNotMatch(runtime, /language_collection|dialect_collection|hg_language_collection/i);
});

test("Knowledge-siden viser Språk som samling uten å legge Språk inn som Subject", () => {
  const page = read("js/knowledgePage.js");
  assert.match(page, /LANGUAGE_COLLECTION_ID\s*=\s*"language"/);
  assert.match(page, /collection=\$\{encodeURIComponent\(collectionId\)\}/);
  assert.match(page, /Språksamlingen din/);
  assert.match(page, /language_lexicon/);
  assert.match(page, /renderLanguageCollection/);
  assert.doesNotMatch(page, /SUBJECT_ICONS[\s\S]{0,800}sprak\s*:/);
});

test("legacy-arrangementer blir ikke løftet som språkinnhold", () => {
  const runtime = read("js/ui/place-language-layer.js");
  assert.match(runtime, /BLOCKED_LANGUAGE_TYPES/);
  assert.match(runtime, /"arrangement"/);
  assert.match(runtime, /"event"/);
  assert.match(runtime, /"stevne"/);
  assert.match(runtime, /function\s+isAllowedLanguageEntry\s*\(/);
  assert.match(runtime, /if\s*\(!isLanguageEntry\(entry\)\)\s*return false/);
  assert.match(runtime, /filter\(entry\s*=>\s*isAllowedLanguageEntry\(entry,\s*loaded\.article,\s*place\)\)/);

  const bislett = json(manifest.place_files.bislett_stadion);
  assert.ok(bislett.entries.some(entry => entry.type === "arrangement"), "fixture må fortsatt dekke legacy-arrangement");
});

test("språkflaten lastes etter både Knowledge V2 og popup-loaderen", () => {
  const config = read("js/config.js");
  const app = read("js/app.js");
  const knowledgeIndex = config.indexOf('"dist/web/knowledgeV2.js"');
  const popupLoaderIndex = app.indexOf('loadPlaceCardStatusSurface');
  const appReadyIndex = app.indexOf('markAppReady();');
  const languageIndex = config.indexOf('"js/ui/place-language-layer.js"');
  const directTabsIndex = config.indexOf('"js/ui/place-popup-direct-tabs.js"');
  assert.ok(knowledgeIndex >= 0, "Knowledge V2 mangler i runtime-listen");
  assert.ok(popupLoaderIndex >= 0, "PlaceCard popup-loader mangler i kritisk app-runtime");
  assert.ok(popupLoaderIndex < appReadyIndex, "PlaceCard popup-loader må være klar før post-ready-kjeden");
  assert.ok(languageIndex > knowledgeIndex, "språkflaten må lastes etter Knowledge V2");
  assert.ok(directTabsIndex > languageIndex, "eierflate-adapteren må lastes etter språkadapteren");
});

test("AHA-importgrensen inkluderer hele Knowledge V2 og dermed språkfasetten", () => {
  const aha = read("AHA/docs/AHA_HISTORYGO_IMPORT.md");
  assert.match(aha, /canonical Knowledge V2/);
  assert.match(aha, /hg_knowledge_entries_v2/);
  const runtime = read("js/ui/place-language-layer.js");
  assert.match(runtime, /source:\s*\{[\s\S]*type:\s*SOURCE_TYPE/);
});

test("Språkleksikon-dokumentasjonen låser Språk som eneste definerte valgfrie direktefane", () => {
  const contract = read("docs/SPRAKLEKSIKON.md");
  const popup = read("docs/PLACE_POPUP_SYSTEM.md");
  assert.match(contract, /ikke.*PlaceCard-runding/i);
  assert.match(contract, /hg_knowledge_entries_v2/);
  assert.match(popup, /én definert, source-eid \*\*valgfri direktefane\*\*/i);
  assert.match(popup, /Språk[\s\S]*eneste definerte valgfrie direktefanen/i);
  assert.match(popup, /Følgende er \*\*ikke selvstendige stedspopupfaner\*\*[\s\S]*Spor & objekter/i);
});


test("place-produksjon låser dialektlaget til område-Places", () => {
  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");
  const contract = read("docs/SPRAKLEKSIKON.md");
  assert.match(checklist, /DIALEKTLAG — KUN `placeScope: "area"` \/ N\/A/);
  assert.match(checklist, /dialektinnhold kan kun eies av et område-Place/i);
  assert.match(checklist, /enkeltsted med Språkleksikon/i);
  assert.match(checklist, /skal ikke diktes/i);
  assert.match(contract, /obligatorisk researchjobb/i);
  assert.match(contract, /Dialektlaget kan bare eies[^\n]*placeScope:\s*"area"/i);
  assert.match(contract, /minst ett reelt kildebelagt \*\*dialektord eller lokalt uttrykk\*\*/i);
  assert.match(contract, /Enkelt-Places kan ha et rikt Språkleksikon, men ikke et dialektlag/i);
  assert.match(contract, /nærmeste relevante område-Place/i);
  assert.match(contract, /related_places.*related_entries/i);
});


test("områdeeierskap bruker canonical placeScope, ikke koordinatrollen", () => {
  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");
  const contract = read("docs/SPRAKLEKSIKON.md");
  assert.match(checklist, /placeScope:\s*"area"/);
  assert.match(contract, /placeScope:\s*"area"/);
  assert.match(checklist, /coordRole[\s\S]{0,120}koordinatgeometri/i);
  assert.match(checklist, /coordRole[\s\S]{0,180}gir aldri dialekt-eierskap/i);
  assert.doesNotMatch(contract, /coordRole:\s*"area_anchor"[^\n]*primær/i);
});
