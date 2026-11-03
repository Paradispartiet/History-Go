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
  assert.match(source, /PLACE_DETAIL_MIN_ZOOM\s*=\s*9\.8/);
  assert.match(source, /PLACE_DETAIL_HIT_MIN_ZOOM\s*=\s*9\.8/);
  assert.match(source, /PLACE_DETAIL_LABEL_MIN_ZOOM\s*=\s*15\.0/);
  assert.match(source, /PLACE_AREA_LABEL_MIN_ZOOM\s*=\s*15\.0/);
  assert.match(source, /PLACE_DETAIL_BADGE_MIN_ZOOM\s*=\s*15\.8/);
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
  assert.match(source, /id: L_AREA_LAB,[\s\S]*?minzoom: PLACE_AREA_LABEL_MIN_ZOOM,[\s\S]*?layout: getPlaceLabelLayout\(true\)/);
  assert.match(source, /const hoverLayers = \[L_AREA_HIT, L_HIT\]\.filter\(hasLayer\)/);
  assert.match(source, /PLACE_HIT_LAYERS = \[L_AREA_HIT, L_HIT/);
  assert.match(source, /PLACE_HIT_PRIORITY = \[L_AREA_HIT, L_HIT/);
});

test("TypeScript source og committed runtime-builds inneholder LOD v2", () => {
  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {
    assert.match(code, /hg-place-areas-dots/, name + ": mangler områdeprikker");
    assert.match(code, /mapLod/, name + ": mangler mapLod");
    assert.match(code, /9\.8/, name + ": mangler detaljfade-start");
  }
});

test("kartets område- og detaljetiketter vises i blokkbokstaver", () => {
  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {
    assert.match(code, /function getPlaceLabelLayout\(isArea = false\)[\s\S]*?"text-transform": "uppercase"/, name + ": kartetiketter skal være store bokstaver");
  }
});

test("detaljprikker beholdes sammen med stedsnavn og er mindre enn gammel profil", () => {
  const dotFn = source.match(/function getPlaceDotPaint\(isArea = false\) \{[\s\S]*?\n  \}/)?.[0] || "";
  assert.ok(dotFn, "mangler getPlaceDotPaint");
  assert.doesNotMatch(dotFn, /getPlaceDetailVisibility/, "selve detaljprikken skal ikke fades bort av LOD-overgangen");
  assert.match(dotFn, /9\.8, \["\+", 3\.1/);
  assert.match(dotFn, /14, \["\+", 4\.2/);
  assert.match(dotFn, /18, \["\+", 6\.0/);
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
  assert.match(source, /PLACE_AREA_MARKER_CLASS\s*=\s*"hg-place-area-marker"/);
  assert.match(source, /function syncPlaceAreaDomMarkers\(features\)/);
  assert.match(source, /new maplibregl\.Marker\(\{ element, anchor: "center" \}\)/);
  assert.match(source, /element\.style\.borderRadius = "0"/);
  assert.match(source, /element\.style\.pointerEvents = "none"/);
  assert.match(source, /element\.style\.backgroundColor = feature\.properties\.fill/);
  assert.match(source, /entry\.element\.style\.borderColor = !markerBorder/);
  assert.match(source, /syncPlaceAreaDomMarkers\(features\);[\s\S]*?const src = MAP\.getSource\(SRC\)/);
  assert.doesNotMatch(source, /addImage|areaSquareImage|sdf:\s*true/, "områdefirkanten skal være en ekte DOM-markør, ikke et spriteikon");
  assert.match(source, /\[7, 7\.0\]/);
  assert.match(source, /\[12, 9\.5\]/);
  assert.match(source, /\[18, 12\.5\]/);

  const app = read("js/app.js");
  const index = read("index.html");
  assert.match(app, /loadScriptOnce\("js\/map\.js\?v=20261028-badges-readable-close5"\)/);
  assert.match(index, /(?:\.\/)?js\/app\.js\?v=[A-Za-z0-9._-]+/);

  assert.doesNotMatch(source, /id: L_AREA_(?:GLOW|DOTS),/);
  assert.match(source, /id: L_DOTS,[\s\S]*?type: "circle",[\s\S]*?paint: getPlaceDotPaint\(false\)/);
  assert.match(source, /id: L_AREA_HIT,[\s\S]*?type: "circle",[\s\S]*?paint: getPlaceHitPaint\(true\)/);
});

test("runtime lager en synlig DOM-firkant over kartcanvaset", () => {
  const markers = [];
  const layers = new Map();
  const sources = new Map();
  const canvas = { addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0 }) };

  class FakeMarker {
    constructor(options) { this.element = options.element; this.anchor = options.anchor; }
    setLngLat(coordinates) { this.coordinates = coordinates; return this; }
    addTo(map) { this.map = map; markers.push(this); return this; }
    remove() { this.removed = true; }
  }

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
    querySelector: () => null,
    createElement: () => ({ className: "", dataset: {}, style: {}, setAttribute() {} })
  };
  const context = {
    console,
    document,
    localStorage: { getItem: () => null, setItem() {} },
    maplibregl: { Map: FakeMap, Marker: FakeMarker, NavigationControl: class {} },
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

  assert.equal(markers.length, 1, "området skal opprette én DOM-markør");
  const marker = markers[0];
  assert.equal(marker.anchor, "center");
  assert.equal(JSON.stringify(marker.coordinates), JSON.stringify([10.7522, 59.9139]));
  assert.equal(marker.element.className, "hg-place-area-marker");
  assert.equal(marker.element.dataset.placeId, "runtime-area");
  assert.equal(marker.element.style.borderRadius, "0");
  assert.equal(marker.element.style.pointerEvents, "none");
  assert.equal(marker.element.style.backgroundColor, "#445566");
  assert.equal(marker.element.style.borderColor, "#112233");
  assert.equal(marker.element.style.width, "8.30px");
  assert.equal(marker.element.style.height, "8.30px");
  assert.equal(marker.element.style.borderWidth, "2px");
  assert.equal(marker.element.style.zIndex, "12");
  assert.equal(layers.has("hg-place-areas-dots"), false, "det gamle symbollaget skal ikke finnes");
});


test("Badge-markører vises på alle zoom, og gamle prikker er reversible", () => {
  const css = read("css/map.css");
  for (const [name, code] of [["TypeScript", source], ["legacy", legacy], ["web", dist]]) {
    assert.match(code, /MARKER_MODE_STORAGE_KEY/, name + ": mangler vedvarende modus");
    assert.match(code, /hg_map_marker_mode/, name + ": mangler lagringsnøkkel");
    assert.match(code, /function setMarkerMode\(nextMode\)/, name + ": kan ikke rulle tilbake");
    assert.match(code, /function mapBadgeDiameter\(zoom\)/, name + ": mangler skalerbare badges");
    assert.match(code, /badgeAvailable/, name + ": må skjule de gamle prikkene kun ved Badge");
    assert.match(code, /const badgesReady = isBadgeMarkerMode\(\) && placeBadgeImages.size > 0/, name + ": må beholde prikkefallback");
    assert.match(code, /\.has\(badgeCategoryId\(feature.properties.category\)\)/, name + ": badger må knyttes til riktig kategori");
    assert.match(code, /getMarkerMode: \(\) => markerMode/, name + ": tilbakekobling må kunne bekreftes");
  }
  assert.match(source, /const showBadge = isBadgeMarkerMode\(\) && !!entry.badgeImage\?\.complete/);
  assert.match(source, /function getPlaceDotPaint\(isArea = false\)/, "prikkemotoren skal bevares");
  assert.match(source, /function interpolatePlaceAreaMarkerSide\(zoom, isVisited\)/, "områdefirkantene skal bevares");
  assert.match(css, /\.hg-place-area-marker\.has-category-badge/);
  assert.match(css, /\.hg-place-detail-marker\.has-category-badge/);
});


test("Badge-størrelse synker kontinuerlig ved utzoom og er markant større ved maksimal zoom", () => {
  for (const [name, code] of [["TypeScript", source], ["legacy", legacy], ["web", dist]]) {
    const functionCode = code.match(/function mapBadgeDiameter\(zoom\) \{[\s\S]*?\n\s*\}/)?.[0];
    assert.ok(functionCode, name + ": missing Badge sizing function");
    const size = vm.runInNewContext("(" + functionCode + ")");
    const zooms = [4, 6, 8, 10, 12, 13, 15, 16, 18, 20, 21, 22];
    const values = zooms.map(size);
    for (let i = 1; i < values.length; i++) {
      assert.ok(values[i] > values[i - 1], name + ": Badge size must grow with zoom " + zooms[i]);
    }
    assert.ok(size(6) <= 1.5, name + ": zoomed out badges must be compact");
    assert.ok(size(10) < 4, name + ": city zoom must stay below four pixels");
    assert.ok(size(15) > 28, name + ": Badge must become legible in neighborhood zoom");
    assert.ok(size(16) > 45, name + ": Badge must grow strongly while zooming in");
    assert.ok(size(17) > size(16) + 17, name + ": Badge must keep growing during close zoom");
    assert.ok(size(13) >= 11 && size(13) <= 12, name + ": street view must remain readable");
    assert.ok(size(18) >= 80 && size(18) <= 85, name + ": close zoom should enlarge smoothly");
    assert.ok(size(22) >= 150 && size(22) <= 160, name + ": maximum zoom badge must be much larger than before");
    assert.equal(size(0), 1, name + ": min-size guard");
    assert.equal(size(24), 160, name + ": max-size guard");
  }
  assert.match(source, /function setMarkerMode\(nextMode\)/, "dot rollback must remain available");
});

test("områdemarkører bruker faktisk Badge-kurven ved utzooming", () => {
  const css = read("css/map.css");
  const block = css.match(/body\.hg-app #map \.hg-place-area-marker\.has-category-badge \{([^}]*)\}/)?.[1] || "";
  assert.match(block, /border-radius:\s*0\s*!important/, "områdebadge skal fortsatt være kvadratisk");
  assert.doesNotMatch(block, /border:\s*0|border-width:\s*0/, "områdebadge skal beholde en synlig ramme");
  assert.match(block, /box-shadow:\s*none\s*!important/, "visuell skygge må ikke forstørre zoomede Badges");
  for (const [name, code] of [["TypeScript", source], ["legacy", legacy], ["web", dist]]) {
    assert.match(code, /const side = showBadge \? mapBadgeDiameter\(zoom\) : interpolatePlaceAreaMarkerSide\(zoom, entry\.visited\)/,
      name + ": områdebadge må ikke låses til gammel minimumsstørrelse");
    assert.match(code, /entry\.element\.style\.borderWidth = showBadge \?/,
      name + ": liten områdebadge må bruke skalert ramme");
    assert.match(code, /side < 6 \? "0px"/, name + ": ingen tykk ramme rundt svært små Badges");
    assert.match(code, /const noBadgeGlow =/, name + ": glow må skjules ved kategori-Badge");
    assert.match(code, /function setMarkerMode\(nextMode\)/,
      name + ": gammelt prikkesystem må fortsatt være reverserbart");
  }
});

test("kartet henter nye JS- og CSS-ressurser etter Badge-oppdatering", () => {
  const app = read("js/app.js");
  const html = read("index.html");
  assert.ok(app.includes("js/map.js?v=20261028-badges-readable-close5"), "kartmodulen må få ny cacheversjon");
  // Startmodulen kan få en nyere cacheversjon når andre funksjoner publiseres etter Badge-oppdateringen.
  const appVersion = html.match(/js\/app\.js\?v=(20\d{6})-[a-z0-9-]+/);
  assert.ok(appVersion && Number(appVersion[1]) >= 20261028, "startmodulen må få en oppdatert cacheversjon");
  assert.ok(html.includes("css/map.css?v=20261028-badges-readable-close5"), "kartstilen må få ny cacheversjon");
});


test("merkene oppdaterer størrelse under faktisk zoom på både område- og detaljmarkører", () => {
  for (const [name, code] of [["TypeScript", source], ["legacy", legacy], ["web", dist]]) {
    assert.match(code, /MAP\.on\("zoom", updatePlaceAreaDomMarkerSizes\)/, name + ": område-Badges må følge zoom");
    assert.match(code, /MAP\.on\("zoom", updateNativeDetailDotSizes\)/, name + ": detalj-Badges må følge zoom");
    assert.match(code, /const side = showBadge \? mapBadgeDiameter\(zoom\)/, name + ": område-Badges må bruke felles størrelseskurve");
    assert.match(code, /if \(isBadgeMarkerMode\(\)\) return mapBadgeDiameter\(zoom\)/, name + ": detalj-Badges må bruke samme kurve");
  }
});
