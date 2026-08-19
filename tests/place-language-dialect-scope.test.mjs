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

test("Språkatlaset er klikkbart og tastaturnavigerbart uten å endre canonical eierskap", () => {
  const runtime = read("js/ui/place-language-layer.js");
  const css = read("css/place-language-layer.css");
  const contract = read("docs/SPRAKLEKSIKON.md");

  assert.match(runtime, /data-atlas-focus=/);
  assert.match(runtime, /data-atlas-region=/);
  assert.match(runtime, /role="group"/);
  assert.match(runtime, /function\s+activateAtlasSelection\s*\(/);
  assert.match(runtime, /details\.open\s*=\s*true/);
  assert.match(runtime, /scrollIntoView/);
  assert.match(runtime, /data-atlas-selection-summary/);
  assert.match(runtime, /aria-pressed/);
  assert.match(css, /hg-language-atlas-regions button/);
  assert.match(css, /focus-visible/);
  assert.match(contract, /Interaktiv atlasnavigasjon/);
  assert.match(contract, /oppretter ingen nye språkdata/i);
});


test("Språkatlaset behandler hovedområder som orientering og lokale talemål som eget nivå", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const runtime = read("js/ui/place-language-layer.js");
  const contract = read("docs/SPRAKLEKSIKON.md");

  assert.match(atlas.notes, /hovedområdene[^.]*ikke dialektnavn/i);
  assert.ok(Array.isArray(atlas.local_varieties));
  const byName = new Map(atlas.local_varieties.map(row => [row.name, row]));
  for (const name of ["Oslo", "Fredrikstad", "Lillehammer", "Arendal", "Kristiansand", "Stavanger", "Haugesund", "Bergen"]) {
    assert.ok(byName.has(name), `mangler lokal talemålsprofil for ${name}`);
    assert.equal(byName.get(name).kind, "local_speech");
    assert.ok(text(byName.get(name).variation_note), `${name}: lokal profil må eksplisitt bevare intern variasjon`);
  }
  assert.notEqual(byName.get("Arendal").id, byName.get("Kristiansand").id);
  assert.notEqual(byName.get("Stavanger").id, byName.get("Haugesund").id);
  assert.notEqual(byName.get("Haugesund").id, byName.get("Bergen").id);

  assert.match(runtime, /data-atlas-local=/);
  assert.match(runtime, /Lokale talemål/);
  assert.match(runtime, /grove orienteringsområder, ikke dialekter/i);
  assert.match(runtime, /local_research_required/);
  assert.match(contract, /hovedområder er ikke dialekter/i);
  assert.match(contract, /Konkrete lokale språkdrag skal ikke arves automatisk/i);
});


test("Språkatlas research coverage er nasjonal og kildebåret", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  assert.ok(atlas.research_basis, "atlaset må dokumentere research-grunnlaget");
  assert.ok((atlas.research_basis.methodology || []).length >= 4);
  const coverage = (atlas.research_basis.source_coverage || []).map(row => `${row.id} ${row.coverage}`).join(" ");
  assert.ok(coverage.includes("ndc_v4") && coverage.includes("111"), "Nordisk dialektkorpus-dekningen må være eksplisitt");
  assert.ok(coverage.includes("lia_norsk") && coverage.includes("227"), "LIA-dekningen må være eksplisitt");
  assert.ok(coverage.includes("uit_nordnorsk") && coverage.includes("13"), "UiTs nordnorske mellomnivå må være eksplisitt");

  const regions = new Set((atlas.dialect_regions || []).map(row => text(row.id)));
  for (const id of [
    "hallingmal", "valdresmal", "gudbrandsdalsmal", "osterdalsmal",
    "setesdalsmal", "jaermal", "ryfylkemal", "sunnmorsmal", "romsdalsmal",
    "fosenmal", "nordmorsmal", "indre_namdalsmal", "ytre_namdalsmal",
    "austfinnmarksmal", "indre_finnmarksmal", "vestfinnmarksmal", "nordtromsmal",
    "midttromsmal", "senjamal", "indre_tromsmal", "sor_troms_vesteralen_ofoten",
    "lofotmal", "saltenmal", "ranamal", "vefsnmal", "bronnoymal"
  ]) assert.ok(regions.has(id), `mangler forskningsbasert mellomnivå ${id}`);

  const locals = atlas.local_varieties || [];
  assert.ok(locals.length >= 40, `for få lokale research-ankre: ${locals.length}`);
  const perMacro = new Map();
  for (const row of locals) {
    perMacro.set(row.macro_region_id, (perMacro.get(row.macro_region_id) || 0) + 1);
    assert.ok(Array.isArray(row.sources) && row.sources.length >= 1, `${row.id}: lokal profil mangler kilde`);
    for (const source of row.sources) assert.ok(String(source?.url || "").startsWith("https://"), `${row.id}: kilden må være HTTPS`);
    assert.ok(text(row.variation_note), `${row.id}: variasjonsavgrensning mangler`);
  }
  for (const macro of ["austlandsk", "vestlandsk", "trondersk", "nordnorsk"]) {
    assert.ok((perMacro.get(macro) || 0) >= 8, `${macro}: utilstrekkelig lokal research-dekning`);
  }

  const localIds = new Set(locals.map(row => text(row.id)));
  for (const id of [
    "aal_local_speech", "vang_valdres_local_speech", "lom_local_speech", "trysil_local_speech",
    "valle_setesdal_local_speech", "suldal_local_speech", "voss_local_speech", "aandalsnes_local_speech",
    "trondheim_local_speech", "surnadal_local_speech", "bodo_local_speech", "narvik_local_speech",
    "tromso_local_speech", "hammerfest_local_speech", "senja_local_speech", "soemna_local_speech"
  ]) assert.ok(localIds.has(id), `mangler lokalt research-anker ${id}`);

  for (const id of ["kautokeino_norwegian_local_speech", "kirkenes_norwegian_local_speech", "tana_norwegian_local_speech", "hattfjelldal_local_speech"]) {
    const row = locals.find(item => item.id === id);
    assert.ok(row, `${id}: flerspråklig profil mangler`);
    assert.match(`${row.summary} ${row.variation_note}`, /eget språk|egne språk|språklig område|språkområde/i, `${id}: minoritetsspråk må skilles eksplisitt fra norsk dialekt`);
  }
});


test("Lokale talemålsprofiler materialiserer konkrete påstander med direkte kildebelegg", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const schema = json("data/leksikon/sprak/atlas_schema_v1.json");
  const runtime = read("js/ui/place-language-layer.js");
  const contract = read("docs/SPRAKLEKSIKON.md");
  const materializedIds = [
    "oslo_local_speech",
    "bergen_local_speech",
    "stavanger_local_speech",
    "trondheim_local_speech",
    "tromso_local_speech"
  ];
  const locals = new Map((atlas.local_varieties || []).map(row => [row.id, row]));
  for (const id of materializedIds) {
    const row = locals.get(id);
    assert.ok(row, id + ": lokalprofil mangler");
    assert.equal(row.profile_status, "evidence_materialized", id + ": skal være evidensmaterialisert");
    assert.match(String(row.evidence_last_verified || ""), /^\d{4}-\d{2}-\d{2}$/);
    assert.ok((row.feature_labels || []).length >= 4, id + ": for få synlige målmerkelapper");
    assert.ok((row.feature_evidence || []).length >= 4, id + ": for få beleggpunkter");
    assert.ok((row.sources || []).length >= 2, id + ": evidensmaterialisert profil trenger minst to profilkilder");
    for (const item of row.feature_evidence || []) {
      assert.ok(text(item.label), id + "/" + item.id + ": label mangler");
      assert.ok(text(item.claim).length >= 20, id + "/" + item.id + ": påstanden er for tynn");
      assert.ok(["structural_feature", "social_variation", "language_change", "contact_history", "corpus_basis"].includes(item.kind), id + "/" + item.id + ": ukjent evidenstype");
      assert.ok((item.source_urls || []).length >= 1, id + "/" + item.id + ": mangler direkte kilde");
      for (const url of item.source_urls || []) assert.ok(String(url).startsWith("https://"), id + "/" + item.id + ": kilde må være HTTPS");
    }
  }

  assert.ok(locals.get("oslo_local_speech").feature_labels.includes("kløyvd infinitiv"));
  assert.ok(locals.get("bergen_local_speech").feature_labels.includes("to grammatiske kjønn"));
  assert.ok(locals.get("stavanger_local_speech").feature_labels.includes("skarre-r"));
  assert.ok(locals.get("trondheim_local_speech").feature_labels.includes("jamvekt og apokope"));
  assert.ok(locals.get("tromso_local_speech").feature_labels.includes("e/a-mål"));

  assert.ok(schema.properties.local_varieties.items.properties.profile_status.enum.includes("evidence_materialized"));
  assert.ok(schema.properties.local_varieties.items.properties.feature_evidence);
  assert.match(runtime, /Dokumentert profil/);
  assert.match(runtime, /data-atlas-selection-evidence/);
  assert.match(runtime, /Dokumenterte målmerker og endringer/);
  assert.match(contract, /evidence_materialized/);
  assert.match(contract, /Historiske trekk skal aldri presenteres/i);
});


test("Evidensmaterialiserte lokalprofiler har en generell kvalitetsport og forskningsstyrt andre gruppe", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const schema = json("data/leksikon/sprak/atlas_schema_v1.json");
  const contract = read("docs/SPRAKLEKSIKON.md");
  const locals = atlas.local_varieties || [];
  const materialized = locals.filter(row => row.profile_status === "evidence_materialized");
  assert.ok(materialized.length >= 10, `for få evidensmaterialiserte lokalprofiler: ${materialized.length}`);
  for (const row of materialized) {
    assert.match(String(row.evidence_last_verified || ""), /^\d{4}-\d{2}-\d{2}$/, `${row.id}: mangler verifiseringsdato`);
    assert.ok((row.feature_labels || []).length >= 4, `${row.id}: trenger minst fire synlige målmerker`);
    assert.ok((row.feature_evidence || []).length >= 4, `${row.id}: trenger minst fire beleggpunkter`);
    assert.ok((row.sources || []).length >= 2, `${row.id}: trenger minst to profilkilder`);
    for (const item of row.feature_evidence || []) {
      assert.ok(text(item.claim).length >= 20, `${row.id}/${item.id}: påstanden er for tynn`);
      assert.ok(text(item.time_scope), `${row.id}/${item.id}: time_scope mangler`);
      assert.ok((item.source_urls || []).length >= 1, `${row.id}/${item.id}: direkte kilde mangler`);
      for (const url of item.source_urls || []) assert.ok(String(url).startsWith("https://"), `${row.id}/${item.id}: kilde må være HTTPS`);
    }
  }

  const expected = new Map([
    ["kristiansand_local_speech", ["e-infinitiv", "høgtone"]],
    ["valle_setesdal_local_speech", ["e-infinitiv", "tradisjonelt Setesdalsmål"]],
    ["bodo_local_speech", ["apokope", "nu og ikke"]],
    ["narvik_local_speech", ["e-infinitiv", "retroflektering"]],
    ["hammerfest_local_speech", ["e/a-mål", "tre kjønn"]]
  ]);
  const byId = new Map(locals.map(row => [row.id, row]));
  for (const [id, labels] of expected) {
    const row = byId.get(id);
    assert.ok(row, `${id}: profil mangler`);
    assert.equal(row.profile_status, "evidence_materialized", `${id}: skal være evidensmaterialisert`);
    for (const label of labels) assert.ok((row.feature_labels || []).includes(label), `${id}: mangler ${label}`);
  }

  const localItem = schema.properties.local_varieties.items;
  assert.ok(localItem.properties.feature_labels.minItems >= 4);
  assert.ok(localItem.properties.feature_evidence.minItems >= 4);
  const rule = (localItem.allOf || []).find(row => row["x-history-go-rule"] === "evidence-materialized");
  assert.ok(rule?.then?.properties?.sources?.minItems >= 2, "schema må kreve minst to profilkilder for evidence_materialized");
  assert.match(contract, /dokumentasjonsstyrke/i);
  assert.match(contract, /tradisjonelt talemål[^\n]*ikke[^\n]*universelt nåtidsspråk/i);
});


test("Lokal evidens skiller regional ramme, direkte korpus og separate språk", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const contract = read("docs/SPRAKLEKSIKON.md");
  const locals = atlas.local_varieties || [];
  const materialized = locals.filter(row => row.profile_status === "evidence_materialized");
  assert.ok(materialized.length >= 15, `for få evidensmaterialiserte lokalprofiler: ${materialized.length}`);

  const expected = new Map([
    ["voss_local_speech", ["a-infinitiv", "vossa-u", "skarre-r i framgang"]],
    ["aal_local_speech", ["kløyvd infinitiv", "NDC-opptak fra Ål", "dativ i tilbakegang"]],
    ["hattfjelldal_local_speech", ["apokope i infinitiv", "delt hunkjønn", "sørsamisk er eget språk"]],
    ["soemna_local_speech", ["kløyvd/nullinfinitiv", "delt hunkjønn", "ungdomsvariasjon"]],
    ["tana_norwegian_local_speech", ["e-infinitiv", "presens -r hos yngre", "samiske språk er egne språk"]]
  ]);
  const byId = new Map(locals.map(row => [row.id, row]));
  for (const [id, labels] of expected) {
    const row = byId.get(id);
    assert.ok(row, `${id}: profil mangler`);
    assert.equal(row.profile_status, "evidence_materialized", `${id}: skal være evidensmaterialisert`);
    assert.ok((row.sources || []).length >= 2, `${id}: trenger minst to profilkilder`);
    assert.ok((row.feature_evidence || []).length >= 4, `${id}: trenger minst fire beleggpunkter`);
    for (const label of labels) assert.ok((row.feature_labels || []).includes(label), `${id}: mangler ${label}`);
  }

  const aal = byId.get("aal_local_speech");
  assert.ok((aal.feature_evidence || []).some(item => item.kind === "corpus_basis" && /Ål/.test(item.claim)), "Ål må ha direkte korpusbelegg");
  assert.match(`${aal.summary} ${aal.variation_note}`, /regional|Hallingdal/i, "Ål må skille regional ramme fra lokale påstander");

  for (const id of ["hattfjelldal_local_speech", "tana_norwegian_local_speech"]) {
    const row = byId.get(id);
    assert.match(`${row.summary} ${row.variation_note}`, /eget språk|egne språk|separat/i, `${id}: samiske språk må holdes separate fra norsk dialekt`);
    assert.ok((row.feature_evidence || []).some(item => item.kind === "contact_history"), `${id}: dokumentert språkkontaktkontekst mangler`);
  }

  assert.match(contract, /regionalt målmerke/i);
  assert.match(contract, /separate språk[^\n]*dialekttrekk/i);
});

// SPRÅKATLAS → PLACES V1
test("Språkatlas kobler bare eksplisitte talemåls-Places til lokale profiler", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const schema = json("data/leksikon/sprak/schema_v2.json");
  const places = loadPlacesById();
  const localsByName = new Map((atlas.local_varieties || []).map(row => [text(row.name), row]));
  assert.equal(schema.properties.atlas_local_ids.type, "array");
  assert.match(schema.properties.atlas_local_ids.description, /navigasjonsrelasjon.*aldri.*eierskap/i);

  const expectedNew = new Map([
    ["bergen", "Bergen"],
    ["valle_setesdal", "Valle i Setesdal"],
    ["narvik", "Narvik"],
    ["aal", "Ål"]
  ]);
  for (const [placeId, profileName] of expectedNew) {
    const place = places.get(placeId);
    assert.ok(place, `${placeId}: canonical Place mangler`);
    assert.equal(place.placeScope, "area", `${placeId}: talemålsankeret må være placeScope=area`);
    const relative = languageManifest.place_files?.[placeId];
    assert.ok(relative, `${placeId}: språkfil mangler i manifest`);
    const article = json(relative);
    const profile = localsByName.get(profileName);
    assert.ok(profile && profile.profile_status === "evidence_materialized", `${profileName}: trenger evidensmaterialisert atlasprofil`);
    assert.deepEqual(article.atlas_local_ids, [profile.id], `${placeId}: feil lokal atlasprofil`);
    assert.equal((article.entries || []).length, 0, `${placeId}: lokale atlasbelegg skal ikke dupliseres som Place-entries`);
    assert.ok((profile.feature_evidence || []).length >= 4, `${profileName}: atlasprofilen må eie de konkrete beleggpunktene`);
  }

  const explicitExisting = new Map([
    ["frogner", "oslo_local_speech"],
    ["holmlia", "oslo_local_speech"],
    ["sagene", "oslo_local_speech"],
    ["vaalerenga", "oslo_local_speech"],
    ["svartlamon_trondheim", "trondheim_local_speech"]
  ]);
  for (const [placeId, localId] of explicitExisting) {
    assert.deepEqual(json(languageManifest.place_files[placeId]).atlas_local_ids, [localId]);
  }

  for (const placeId of ["bislett_stadion", "gronland_basarene", "karl_johan", "regjeringskvartalet", "tinghuset", "torggata"]) {
    assert.equal(json(languageManifest.place_files[placeId]).atlas_local_ids, undefined, `${placeId}: generisk språkinnhold skal ikke feilmerkes som oslomål`);
  }
});

test("Språkatlas → Places bruker canonical manifest og sentral kartnavigasjon også for atlas-only Places", () => {
  const runtime = read("js/ui/place-language-layer.js");
  const css = read("css/place-language-layer.css");
  const contract = read("docs/SPRAKLEKSIKON.md");

  assert.match(runtime, /loadAtlasPlaceLinks/);
  assert.match(runtime, /manifest\?\.place_files/);
  assert.match(runtime, /kind === "local"\) return row\.localIds\.includes\(id\)/);
  assert.match(runtime, /data-atlas-selection-places/);
  assert.match(runtime, /data-atlas-open-place/);
  assert.match(runtime, /HGMapView\?\.openPlace/);
  assert.doesNotMatch(runtime, /fallbackPlace[\s\S]{0,160}openPlaceCard/);
  assert.match(runtime, /if \(!entries\.length && !atlasTarget\) return/);
  assert.match(runtime, /Dokumentert talemålsprofil/);
  assert.match(runtime, /Se talemålet i Språkatlas/);
  assert.match(runtime, /ikke en fullstendig oversikt over hvor talemålet finnes/i);
  assert.match(css, /hg-language-atlas-place-links/);
  assert.match(contract, /lokale profiler matches bare via eksplisitt.*atlas_local_ids/i);
});
// /SPRÅKATLAS → PLACES V1
