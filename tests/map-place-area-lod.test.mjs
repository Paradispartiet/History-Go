import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));

const source = read("js/map.ts");
const legacy = read("js/map.js");
const dist = read("dist/web/map.js");
const buildIndex = read("tools/build_places_index.mts");
const checkIndex = read("tools/check_places_index_sync.mts");

test("kart-LOD skiller semantisk placeScope fra avledet mapLod", () => {
  assert.match(source, /PLACE_SCOPE_AREA\s*=\s*"area"/);
  assert.match(source, /PLACE_MAP_LOD_OVERVIEW\s*=\s*"overview"/);
  assert.match(source, /PLACE_MAP_LOD_AREA\s*=\s*"area"/);
  assert.match(source, /PLACE_MAP_LOD_DETAIL\s*=\s*"detail"/);
  assert.match(source, /function getMapLod\(place\)/);
  assert.match(source, /return isAreaPlace\(place\) \? PLACE_MAP_LOD_AREA : PLACE_MAP_LOD_DETAIL/);

  const areaFn = source.match(/function isAreaPlace\(place\) \{[\s\S]*?\n  \}/)?.[0] || "";
  assert.match(areaFn, /placeScope/);
  assert.doesNotMatch(areaFn, /coordRole|coordType|area_anchor|district_anchor/);
});

test("places_index bevarer placeScope og materialiserer mapLod for områder", () => {
  for (const code of [buildIndex, checkIndex]) {
    assert.match(code, /placeScope/);
    assert.match(code, /mapLod/);
    assert.match(code, /placeScope === 'area'/);
    assert.match(code, /out\.mapLod = 'area'/);
  }

  const index = json("data/places/places_index.json");
  const byId = new Map(index.map(place => [place.id, place]));
  for (const id of ["sagene", "bjorvika", "torshov", "ullern", "skoyen"]) {
    const place = byId.get(id);
    assert.ok(place, "mangler " + id + " i places_index");
    assert.equal(place.placeScope, "area", id + ": placeScope gikk tapt i runtime-index");
    assert.equal(place.mapLod, "area", id + ": mapLod ble ikke materialisert");
  }
});

test("kartet har separate område- og detaljlag med gradvis detaljövergang", () => {
  assert.match(source, /L_AREA_DOTS\s*=\s*"hg-place-areas-dots"/);
  assert.match(source, /L_AREA_LAB\s*=\s*"hg-place-areas-label"/);
  assert.match(source, /PLACE_DETAIL_MIN_ZOOM\s*=\s*11\.8/);
  assert.match(source, /PLACE_DETAIL_HIT_MIN_ZOOM\s*=\s*12\.35/);
  assert.match(source, /PLACE_DETAIL_LABEL_MIN_ZOOM\s*=\s*13\.15/);
  assert.match(source, /getPlaceDetailVisibility/);
  assert.match(source, /PLACE_DETAIL_FULL_ZOOM, 1\.0/);
  assert.match(source, /filter: PLACE_AREA_LOD_FILTER/);
  assert.match(source, /PLACE_DETAIL_LOD_FILTER/);
  assert.match(source, /id: L_GLOW,[\s\S]*?minzoom: PLACE_DETAIL_MIN_ZOOM,[\s\S]*?filter: PLACE_DETAIL_LOD_FILTER/);
  assert.match(source, /id: L_DOTS,[\s\S]*?minzoom: PLACE_DETAIL_MIN_ZOOM,[\s\S]*?filter: PLACE_DETAIL_LOD_FILTER/);
  assert.match(source, /id: L_LAB,[\s\S]*?minzoom: PLACE_DETAIL_LABEL_MIN_ZOOM,[\s\S]*?filter: PLACE_DETAIL_LOD_FILTER/);
  assert.match(source, /id: L_HIT,[\s\S]*?minzoom: PLACE_DETAIL_HIT_MIN_ZOOM,[\s\S]*?filter: PLACE_DETAIL_LOD_FILTER/);
  assert.doesNotMatch(source, /PLACE_DETAIL_(?:POINT|HIT|LABEL)_FILTER/);
});

test("områdeetiketter prioriteres som eget symbol-lag og begge hit-lag er klikkbare", () => {
  assert.match(source, /id: L_AREA_LAB,[\s\S]*?layout: getPlaceLabelLayout\(true\)/);
  assert.match(source, /const hoverLayers = \[L_AREA_HIT, L_HIT\]\.filter\(hasLayer\)/);
  assert.match(source, /PLACE_HIT_LAYERS = \[L_AREA_HIT, L_HIT/);
  assert.match(source, /PLACE_HIT_PRIORITY = \[L_AREA_HIT, L_HIT/);
});

test("TypeScript source og committed runtime-builds inneholder LOD v2", () => {
  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {
    assert.match(code, /hg-place-areas-dots/, name + ": mangler områdeprikker");
    assert.match(code, /mapLod/, name + ": mangler mapLod");
    assert.match(code, /11\.8/, name + ": mangler detaljfade-start");
  }
});

test("detaljprikker beholdes sammen med stedsnavn og er mindre enn gammel profil", () => {
  const dotFn = source.match(/function getPlaceDotPaint\(isArea = false\) \{[\s\S]*?\n  \}/)?.[0] || "";
  assert.ok(dotFn, "mangler getPlaceDotPaint");
  assert.doesNotMatch(dotFn, /getPlaceDetailVisibility/, "selve detaljprikken skal ikke fades bort av LOD-overgangen");
  assert.match(dotFn, /10, \["\+", 1\.6/);
  assert.match(dotFn, /14, \["\+", 3\.0/);
  assert.match(dotFn, /18, \["\+", 5\.6/);
  assert.match(dotFn, /getPlaceMarkerStrokeWidth\(false\)/);

  assert.match(source, /function getPlaceMarkerStrokeWidth\(isArea = false\)/);
  assert.match(source, /if \(isArea\) return isStandardMapStyle\(\) \? 2\.4 : 1\.8/);
  assert.match(source, /return isStandardMapStyle\(\) \? 1\.45 : 1\.15/);

  const detailZoom = Number(source.match(/PLACE_DETAIL_MIN_ZOOM\s*=\s*([0-9.]+)/)?.[1]);
  const labelZoom = Number(source.match(/PLACE_DETAIL_LABEL_MIN_ZOOM\s*=\s*([0-9.]+)/)?.[1]);
  assert.ok(Number.isFinite(detailZoom) && Number.isFinite(labelZoom));
  assert.ok(detailZoom < labelZoom, "detaljprikken må være aktiv før stedsnavnet kan vises");
});

test("områdemarkører er mindre firkanter uten å redusere hitflaten", () => {
  const squareLayout = source.match(/function getPlaceAreaSquareLayout\(isGlow = false\) \{[\s\S]*?\n  \}/)?.[0] || "";
  const squarePaint = source.match(/function getPlaceAreaSquarePaint\(isGlow = false\) \{[\s\S]*?\n  \}/)?.[0] || "";
  assert.ok(squareLayout, "mangler layout for firkantede områdemarkører");
  assert.ok(squarePaint, "mangler paint for firkantede områdemarkører");
  assert.match(source, /PLACE_AREA_SQUARE_IMAGE_PREFIX\s*=\s*"hg-place-area-square-rgba"/);
  assert.match(source, /function buildPlaceAreaSquareImage\(fill, border, size = 32\)/);
  assert.match(source, /MAP\.addImage\(imageId, buildPlaceAreaSquareImage\(fill, border\), \{ pixelRatio: 1 \}\)/);
  assert.doesNotMatch(source, /sdf:\s*true/, "områdefirkanten skal ikke være avhengig av SDF-rendering");
  assert.match(source, /ensurePlaceAreaSquareImages\(features\);[\s\S]*?const src = MAP\.getSource\(SRC\)/);
  assert.match(source, /feature\.properties\.areaSquareImage = imageId/);
  assert.match(squareLayout, /"icon-image": \["get", "areaSquareImage"\]/);
  assert.match(squareLayout, /"icon-size": \["\/", side, 16\]/);
  assert.doesNotMatch(squareLayout, /text-field|■/, "områdefirkanten skal ikke være avhengig av kartfonten");
  assert.match(squareLayout, /7, \["\+", 5\.0/);
  assert.match(squareLayout, /12, \["\+", 7\.4/);
  assert.match(squareLayout, /18, \["\+", 10\.5/);
  assert.doesNotMatch(squarePaint, /icon-color|icon-halo/, "farge og kant skal være bakt inn i RGBA-ikonet");

  const app = read("js/app.js");
  const index = read("index.html");
  assert.match(app, /loadScriptOnce\("js\/map\.js\?v=20260824-area-square-runtime2"\)/);
  assert.match(index, /js\/app\.js\?v=20260824-area-square-runtime2/);

  assert.match(source, /id: L_AREA_GLOW,[\s\S]*?type: "symbol",[\s\S]*?layout: getPlaceAreaSquareLayout\(true\),[\s\S]*?paint: getPlaceAreaSquarePaint\(true\)/);
  assert.match(source, /id: L_AREA_DOTS,[\s\S]*?type: "symbol",[\s\S]*?layout: getPlaceAreaSquareLayout\(false\),[\s\S]*?paint: getPlaceAreaSquarePaint\(false\)/);
  assert.match(source, /id: L_DOTS,[\s\S]*?type: "circle",[\s\S]*?paint: getPlaceDotPaint\(false\)/);
  assert.match(source, /id: L_AREA_HIT,[\s\S]*?type: "circle",[\s\S]*?paint: getPlaceHitPaint\(true\)/);
});

test("runtime lager et synlig RGBA-kvadrat og binder det til områdelaget", () => {
  const images = new Map();
  const layers = new Map();
  const sources = new Map();
  const canvas = { addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0 }) };

  class FakeMap {
    addControl() {}
    on(event, layerOrHandler, maybeHandler) {
      const handler = typeof layerOrHandler === "function" ? layerOrHandler : maybeHandler;
      if (event === "load") handler();
      return this;
    }
    once(_event, handler) { handler(); return this; }
    resize() {}
    isStyleLoaded() { return true; }
    getStyle() { return { layers: [] }; }
    getCanvas() { return canvas; }
    getZoom() { return 10; }
    hasImage(id) { return images.has(id); }
    addImage(id, image, options) { images.set(id, { image, options }); }
    getSource(id) { return sources.get(id); }
    addSource(id, source) {
      sources.set(id, { ...source, setData(data) { this.data = data; } });
    }
    removeSource(id) { sources.delete(id); }
    getLayer(id) { return layers.get(id); }
    addLayer(layer) { layers.set(layer.id, layer); }
    removeLayer(id) { layers.delete(id); }
    moveLayer() {}
  }

  const mapElement = { dataset: {}, setAttribute() {} };
  const document = {
    getElementById: id => id === "map" ? mapElement : null,
    querySelector: () => null
  };
  const context = {
    console,
    document,
    localStorage: { getItem: () => null, setItem() {} },
    maplibregl: { Map: FakeMap, NavigationControl: class {} },
    setTimeout,
    clearTimeout
  };
  context.window = context;
  context.addEventListener = () => {};
  context.catSecondaryColor = () => "#112233";
  vm.createContext(context);
  vm.runInContext(legacy, context, { filename: "js/map.js" });

  context.HGMap.initMap();
  context.HGMap.setCatColor(() => "#445566");
  context.HGMap.setPlaces([{
    id: "runtime-area",
    name: "Runtime area",
    category: "historie",
    placeScope: "area",
    mapLod: "area",
    lat: 59.9139,
    lon: 10.7522,
    r: 100
  }]);

  assert.equal(images.size, 1, "området skal registrere ett farget runtime-ikon");
  const [{ image, options }] = [...images.values()];
  assert.equal(options.pixelRatio, 1);
  assert.equal(Object.keys(options).length, 1);
  assert.equal(image.width, 32);
  assert.equal(image.height, 32);
  const pixels = Array.from({ length: image.width * image.height }, (_, i) =>
    Array.from(image.data.slice(i * 4, i * 4 + 4)).join(",")
  );
  assert.ok(pixels.includes("68,85,102,255"), "ikonet mangler fyllfargen");
  assert.ok(pixels.includes("17,34,51,255"), "ikonet mangler kantfargen");
  assert.ok(pixels.includes("0,0,0,0"), "ikonet mangler transparent luft rundt firkanten");

  const feature = sources.get("hg-places").data.features[0];
  assert.match(feature.properties.areaSquareImage, /^hg-place-area-square-rgba-/);
  assert.equal(
    JSON.stringify(layers.get("hg-place-areas-dots").layout["icon-image"]),
    JSON.stringify(["get", "areaSquareImage"])
  );
});
