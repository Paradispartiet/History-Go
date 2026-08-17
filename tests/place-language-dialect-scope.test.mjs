import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));
const text = value => String(value == null ? "" : value).trim();
const slug = value => text(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");

const languageManifest = json("data/leksikon/sprak/manifest.json");

function loadPlacesById() {
  const manifest = json("data/places/manifest.json");
  const byId = new Map();
  for (const relative of manifest.files || []) {
    const file = path.join(root, "data", relative);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const places = Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : [data];
    for (const place of places) {
      if (place?.id) byId.set(place.id, place);
    }
  }
  return byId;
}

function isDialectEntry(entry, article) {
  const layer = slug(entry?.layer);
  const type = slug(entry?.type || entry?.kind);
  return layer === "dialect"
    || type === "dialect_feature"
    || type === "dialekttrekk"
    || Boolean(text(entry?.dialect_area || article?.dialect_area));
}

test("schemaet skiller eksplisitt mellom vanlig språk og dialektlag", () => {
  const schema = json("data/leksikon/sprak/schema_v2.json");
  assert.deepEqual(schema.$defs.entry.properties.layer.enum, ["language", "dialect"]);
});

test("dialektinnhold kan bare eies av canonical area-Places", () => {
  const places = loadPlacesById();

  for (const [placeId, relative] of Object.entries(languageManifest.place_files || {})) {
    const article = json(relative);
    const dialectEntries = (article.entries || []).filter(entry => isDialectEntry(entry, article));
    const claimsDialect = Boolean(text(article.dialect_area)) || dialectEntries.length > 0;
    if (!claimsDialect) continue;

    const place = places.get(placeId);
    assert.ok(place, `${relative}: språkfilens place_id finnes ikke i canonical Places`);
    assert.equal(place.placeScope, "area", `${relative}: dialektinnhold krever placeScope=area på ${placeId}`);
  }
});

test("Etne-piloten er et reelt, eksplisitt area-eid dialektlag", () => {
  const places = loadPlacesById();
  const fixtureId = "etnesjoen_tettstad";
  const place = places.get(fixtureId);
  assert.ok(place, "Etne-fixturen må finnes i canonical Places");
  assert.equal(place.placeScope, "area", "Etne-piloten må eies av et canonical område-Place");

  const relative = languageManifest.place_files?.[fixtureId];
  assert.ok(relative, "Etne-piloten må være registrert i Språkleksikon-manifestet");
  const article = json(relative);
  assert.equal(article.place_id, fixtureId);
  assert.equal(article.dialect_area, "Etne");

  const dialectEntries = (article.entries || []).filter(entry => isDialectEntry(entry, article));
  assert.ok(dialectEntries.length >= 4, "Etne-piloten skal ha flere reelle dialektspor, ikke en tom kontraktfixture");
  const terms = new Set(dialectEntries.map(entry => text(entry.term).toLowerCase()));
  for (const term of ["snedden", "maula", "himaspøta", "øvegjidde"]) {
    assert.ok(terms.has(term), `Etne-piloten mangler det kildebelagte språksporet ${term}`);
  }

  for (const entry of dialectEntries) {
    assert.equal(entry.layer, "dialect", `${entry.id}: nyprodusert dialektinnhold skal ha eksplisitt layer=dialect`);
    assert.equal(entry.dialect_area, "Etne", `${entry.id}: dialektområdet skal være eksplisitt avgrenset`);
    assert.ok(text(entry.meaning), `${entry.id}: meaning mangler`);
    assert.ok(text(entry.context), `${entry.id}: kildekontekst mangler`);
    assert.ok(Array.isArray(entry.sources) && entry.sources.length >= 2, `${entry.id}: dialektsporet trenger både lokal attestasjon og betydningsbelegg`);
    for (const source of entry.sources) {
      assert.match(String(source?.url || ""), /^https:\/\//, `${entry.id}: brukerrettet kilde må være HTTPS`);
    }
  }
});

test("enkelt-Places kan ha Språkleksikon uten å bli dialekt-eiere", () => {
  const places = loadPlacesById();
  const fixtureId = "tinghuset";
  const place = places.get(fixtureId);
  assert.ok(place, "tinghuset må finnes som canonical Place-fixture");
  assert.notEqual(place.placeScope, "area", "tinghuset skal ikke være område-Place");
  assert.ok(languageManifest.place_files?.[fixtureId], "tinghuset skal fortsatt kunne ha Språkleksikon");

  const article = json(languageManifest.place_files[fixtureId]);
  assert.ok((article.entries || []).some(entry => !isDialectEntry(entry, article)), "enkeltsted-fixturen må ha vanlig språkinnhold");
  assert.equal((article.entries || []).filter(entry => isDialectEntry(entry, article)).length, 0, "enkeltsted-fixturen må ikke eie dialektinnhold");
});

test("runtime nekter dialektlag på ikke-area Places og beholder laget i Knowledge-metadata", () => {
  const runtime = read("js/ui/place-language-layer.js");
  assert.match(runtime, /function\s+languageLayer\s*\(/);
  assert.match(runtime, /function\s+isDialectEntry\s*\(/);
  assert.match(runtime, /function\s+isAllowedLanguageEntry\s*\(/);
  assert.match(runtime, /placeScope[\s\S]{0,120}["']area["']/);
  assert.match(runtime, /language_layer:\s*layer/);
  assert.match(runtime, /filter\(entry\s*=>\s*isAllowedLanguageEntry\(entry,\s*loaded\.article,\s*place\)\)/);
});

test("områdeeid dialektlag fremheves uten å bli en egen PlaceCard-runding", () => {
  const runtime = read("js/ui/place-language-layer.js");
  const css = read("css/place-language-layer.css");
  assert.match(runtime, /data-language-layer=/);
  assert.match(runtime, /hg-language-dialect-intro/);
  assert.match(runtime, /data-language-filter="dialect"/);
  assert.match(runtime, /filter\s*===\s*"dialect"/);
  assert.match(runtime, /Dialektlag/);
  assert.match(css, /hg-language-dialect-intro/);
  assert.match(css, /hg-language-entry\.is-dialect/);
  assert.doesNotMatch(runtime, /dialect.*PlaceCard-runding/i);
});

test("dokumentasjon og checklist skiller Språkleksikon fra det områdebundne dialektlaget", () => {
  const contract = read("docs/SPRAKLEKSIKON.md");
  const checklist = read("docs/PLACE_PRODUCTION_CHECKLIST.md");

  assert.match(contract, /Språkleksikon[^\n]*kan finnes på alle typer Places/i);
  assert.match(contract, /Dialektlaget[^\n]*bare[^\n]*placeScope:\s*"area"/i);
  assert.match(contract, /enkelt-Places[^\n]*kan[^\n]*Språkleksikon/i);
  assert.match(contract, /skal\s+(?:\*\*)?ikke(?:\*\*)?[^\n]*layer:\s*"dialect"/i);
  assert.match(checklist, /DIALEKTLAG — KUN `placeScope: "area"` \/ N\/A/);
  assert.match(checklist, /dialektinnhold[^\n]*kun[^\n]*område-Place/i);
  assert.match(checklist, /enkeltsted[^\n]*Språkleksikon[^\n]*ikke[^\n]*dialekt/i);
});
