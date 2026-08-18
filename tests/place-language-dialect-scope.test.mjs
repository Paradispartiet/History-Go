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

test("Sagene-utvidelsen er et reelt area-eid og kildebelagt oslomål-lag", () => {
  const places = loadPlacesById();
  const fixtureId = "sagene";
  const place = places.get(fixtureId);
  assert.ok(place, "sagene må finnes i canonical Places");
  assert.equal(place.placeScope, "area", "Sagene-laget må eies av et canonical område-Place");

  const relative = languageManifest.place_files?.[fixtureId];
  assert.equal(relative, "data/leksikon/sprak/places/europe/norway/oslo/sagene.json");
  const article = json(relative);
  assert.equal(article.place_id, fixtureId);
  assert.equal(article.dialect_area, "Tradisjonelt oslomål");
  assert.match(String(article.notes || ""), /ikke[^.]*unik/i, "Sagene-laget må eksplisitt unngå påstand om lokal eksklusivitet");

  const dialectEntries = (article.entries || []).filter(entry => isDialectEntry(entry, article));
  assert.ok(dialectEntries.length >= 4, "Sagene-utvidelsen skal ha flere reelle dialektspor");
  const terms = new Set(dialectEntries.map(entry => text(entry.term).toLowerCase()));
  for (const term of ["værra", "gutta", "hu", "henner"]) {
    assert.ok(terms.has(term), `Sagene-utvidelsen mangler det kildebelagte språksporet ${term}`);
  }

  for (const entry of dialectEntries) {
    assert.equal(entry.layer, "dialect", `${entry.id}: Sagene-innhold skal ha eksplisitt layer=dialect`);
    assert.equal(entry.dialect_area, "Tradisjonelt oslomål", `${entry.id}: dialektområdet skal være bredere enn bare Sagene`);
    assert.ok(text(entry.meaning), `${entry.id}: meaning mangler`);
    assert.ok(text(entry.context), `${entry.id}: kildekontekst mangler`);
    assert.ok(Array.isArray(entry.sources) && entry.sources.length >= 2, `${entry.id}: språksporet trenger flere kildebelegg`);
    for (const source of entry.sources) {
      assert.match(String(source?.url || ""), /^https:\/\//, `${entry.id}: brukerrettet kilde må være HTTPS`);
    }
  }
});

test("Oslo-atlaset skiller historisk øst/vest og multietnisk norsk uten bydelsstereotypier", () => {
  const places = loadPlacesById();
  const fixtures = [
    {
      id: "frogner",
      area: /Oslo vest.*vestkantmål.*dannet dagligtale/i,
      terms: ["trappen", "solen", "guttene", "frogner-r"],
      notes: [/historisk/i, /ikke[^.]*alle/i],
      forbiddenCanonical: /fisefin/i
    },
    {
      id: "vaalerenga",
      area: /østkantmål.*vikamål/i,
      terms: ["trappa", "sola", "komma", "tjukk l"],
      notes: [/ikke[^.]*unik/i, /dagens talemål|dagens.*blandet/i],
      forbiddenCanonical: /østkantfolk|arbeiderklassefolk/i
    },
    {
      id: "holmlia",
      area: /^Multietnisk norsk i Oslo$/i,
      terms: ["wolla / wallah", "kæbe", "sjpa", "baosj"],
      notes: [/ikke alle/i, /kebabnorsk/i, /stigmatiserende|flåsete/i],
      forbiddenCanonical: /kebabnorsk/i
    }
  ];

  for (const fixture of fixtures) {
    const place = places.get(fixture.id);
    assert.ok(place, `${fixture.id}: område-Place må finnes i canonical manifest`);
    assert.equal(place.placeScope, "area", `${fixture.id}: språkankeret må være placeScope=area`);

    const relative = languageManifest.place_files?.[fixture.id];
    assert.ok(relative, `${fixture.id}: språkfil må være registrert i Språkleksikon-manifestet`);
    const article = json(relative);
    assert.equal(article.place_id, fixture.id, `${fixture.id}: place_id må være canonical`);
    assert.match(article.dialect_area, fixture.area, `${fixture.id}: dialektområdet må beskrive språkvarianten, ikke stereotype beboerne`);
    assert.doesNotMatch(`${article.title} ${article.dialect_area}`, fixture.forbiddenCanonical, `${fixture.id}: stereotyp merkelapp skal ikke være canonical tittel eller område`);
    for (const pattern of fixture.notes) {
      assert.match(text(article.notes), pattern, `${fixture.id}: notes mangler nødvendig avgrensning ${pattern}`);
    }

    const dialectEntries = (article.entries || []).filter(entry => isDialectEntry(entry, article));
    assert.ok(dialectEntries.length >= 4, `${fixture.id}: området skal ha flere faktiske språkspor`);
    const terms = new Set(dialectEntries.map(entry => text(entry.term).toLowerCase()));
    for (const term of fixture.terms) {
      assert.ok(terms.has(term), `${fixture.id}: mangler språksporet ${term}`);
    }

    for (const entry of dialectEntries) {
      assert.equal(entry.layer, "dialect", `${entry.id}: Oslo-atlaset krever eksplisitt layer=dialect`);
      assert.equal(entry.dialect_area, article.dialect_area, `${entry.id}: entry og artikkel må bruke samme, nyanserte områdebetegnelse`);
      assert.ok(text(entry.meaning), `${entry.id}: meaning mangler`);
      assert.ok(text(entry.usage), `${entry.id}: usage mangler`);
      assert.ok(text(entry.context), `${entry.id}: context mangler`);
      assert.ok(Array.isArray(entry.sources) && entry.sources.length >= 2, `${entry.id}: språksporet trenger flere kildebelegg`);
      for (const source of entry.sources) {
        assert.match(String(source?.url || ""), /^https:\/\//, `${entry.id}: brukerrettet kilde må være HTTPS`);
      }
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


test("Språkatlas Norge dekker hele dialektlandskapet uten å gjøre språkgrenser eller mennesker absolutte", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  assert.equal(atlas.schema, "history_go_language_atlas_v1");
  assert.equal(atlas.scope, "Norge");

  const macroIds = new Set((atlas.macro_regions || []).map(row => text(row.id)));
  assert.deepEqual(macroIds, new Set(["austlandsk", "vestlandsk", "trondersk", "nordnorsk"]));

  const regionIds = new Set((atlas.dialect_regions || []).map(row => text(row.id)));
  for (const required of [
    "vikvaersk", "midtostlandsk", "opplandsmal", "midlandsmal",
    "sorleg_e_mal", "sorleg_ea_mal", "sorvestlandsk_a_mal", "nordvestlandsk_e_mal",
    "inntrondersk", "uttrondersk", "nordland", "troms", "finnmark"
  ]) assert.ok(regionIds.has(required), `Språkatlaset mangler ${required}`);

  for (const region of atlas.dialect_regions || []) {
    assert.ok(macroIds.has(text(region.macro_region_id)), `${region.id}: ukjent hovedgruppe`);
    assert.ok(text(region.area_summary), `${region.id}: mangler geografisk/faglig avgrensing`);
    assert.ok(Array.isArray(region.sources) && region.sources.length >= 2, `${region.id}: trenger flere kildebelegg`);
    for (const source of region.sources) assert.match(String(source?.url || ""), /^https:\/\//, `${region.id}: kilde må være HTTPS`);
  }

  const languageIds = new Set((atlas.language_status_layers || []).map(row => text(row.id)));
  for (const required of ["nordsamisk", "lulesamisk", "sorsamisk", "pitesamisk", "umesamisk", "skoltesamisk", "kvensk", "romani", "romanes"]) {
    assert.ok(languageIds.has(required), `Atlaset mangler separat språkstatus for ${required}`);
  }
  for (const language of atlas.language_status_layers || []) {
    assert.equal(language.kind, "language", `${language.id}: urfolks-/minoritetsspråk må modelleres som språk`);
    assert.equal(language.not_norwegian_dialect, true, `${language.id}: må eksplisitt være skilt fra norsk dialektinndeling`);
  }

  assert.match(String(atlas.notes || ""), /ikke et kart over faste språkgrenser/i);
  assert.ok((atlas.editorial_principles || []).some(value => /(?:ikke|aldri).*alle|alle.*(?:ikke|aldri)/i.test(String(value))), "Atlaset må avvise generalisering fra område til alle beboere");
});

test("Place-artikler kobler seg til Språkatlas Norge uten å lage en ny PlaceCard-runding", () => {
  const expected = new Map([
    ["frogner", ["austlandsk", "midtostlandsk"]],
    ["sagene", ["austlandsk", "midtostlandsk"]],
    ["vaalerenga", ["austlandsk", "midtostlandsk"]],
    ["holmlia", ["austlandsk", "midtostlandsk"]],
    ["etnesjoen_tettstad", ["vestlandsk", "sorvestlandsk_a_mal"]],
    ["svartlamon_trondheim", ["trondersk"]]
  ]);
  for (const [placeId, regionIds] of expected) {
    const relative = languageManifest.place_files?.[placeId];
    assert.ok(relative, `${placeId}: må være registrert i Språkleksikon-manifestet`);
    const article = json(relative);
    assert.deepEqual(article.atlas_region_ids, regionIds, `${placeId}: feil atlaskobling`);
  }

  const places = loadPlacesById();
  assert.equal(places.get("svartlamon_trondheim")?.placeScope, "area", "Trondheim-piloten må fortsatt være area-eid");
  const trondheim = json(languageManifest.place_files.svartlamon_trondheim);
  assert.ok((trondheim.entries || []).length >= 4, "Trondheim-piloten skal ha reelt språkinnhold");
  for (const entry of trondheim.entries || []) {
    assert.equal(entry.layer, "dialect");
    assert.ok(Array.isArray(entry.sources) && entry.sources.length >= 2, `${entry.id}: trenger flere kildebelegg`);
  }

  const runtime = read("js/ui/place-language-layer.js");
  const css = read("css/place-language-layer.css");
  assert.match(runtime, /ATLAS_PATH\s*=\s*["']data\/leksikon\/sprak\/norge_atlas_v1\.json["']/);
  assert.match(runtime, /function\s+renderLanguageAtlas\s*\(/);
  assert.match(runtime, /Språkatlas Norge/);
  assert.match(runtime, /hg-language-atlas-map/);
  assert.match(runtime, /Egne språk – ikke norske dialekter/);
  assert.match(css, /hg-language-atlas-map-region/);
  assert.doesNotMatch(runtime, /data-place-tab=["']atlas["']/i);
});
