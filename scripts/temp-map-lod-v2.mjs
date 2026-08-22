import { promises as fs } from 'node:fs';

const read = (p) => fs.readFile(p, 'utf8');
const write = (p, s) => fs.writeFile(p, s, 'utf8');

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (source.indexOf(from, first + from.length) >= 0) throw new Error(`Patch anchor is not unique: ${label}`);
  return source.slice(0, first) + to + source.slice(first + from.length);
}

function replaceRegexOnce(source, regex, to, label) {
  const matches = [...source.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))];
  if (matches.length !== 1) throw new Error(`Expected exactly one regex match for ${label}; got ${matches.length}`);
  return source.replace(regex, to);
}

async function patchBuildIndex() {
  const path = 'tools/build_places_index.mts';
  let s = await read(path);
  s = replaceOnce(s,
    "  groundhopper?: unknown;\n  coordType?: unknown;",
    "  groundhopper?: unknown;\n  placeScope?: unknown;\n  mapLod?: unknown;\n  coordType?: unknown;",
    'build index PlaceRow map fields');
  s = replaceOnce(s,
    "  'id','name','lat','lon','r','category','year','desc','aliases','image','cardImage','frontImage','hidden','stub','groundhopper','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordVerifiedAt','coordNote','sourceFile'",
    "  'id','name','lat','lon','r','category','year','desc','aliases','image','cardImage','frontImage','hidden','stub','groundhopper','placeScope','mapLod','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordVerifiedAt','coordNote','sourceFile'",
    'build index LIGHT_FIELDS');
  s = replaceOnce(s,
    "  if (sourceFile) out.sourceFile = sourceFile;\n  return out;",
    "  if (sourceFile) out.sourceFile = sourceFile;\n  const placeScope = typeof place.placeScope === 'string' ? place.placeScope.trim().toLowerCase() : '';\n  const explicitMapLod = typeof place.mapLod === 'string' ? place.mapLod.trim().toLowerCase() : '';\n  if (!explicitMapLod && placeScope === 'area') out.mapLod = 'area';\n  return out;",
    'build index derive area mapLod');
  await write(path, s);
}

async function patchIndexCheck() {
  const path = 'tools/check_places_index_sync.mts';
  let s = await read(path);
  s = replaceOnce(s,
    "  groundhopper?: unknown;\n  locatorType?: unknown;",
    "  groundhopper?: unknown;\n  placeScope?: unknown;\n  mapLod?: unknown;\n  locatorType?: unknown;",
    'index check PlaceRow map fields');
  s = replaceOnce(s,
    "  'groundhopper',\n  'locatorType',",
    "  'groundhopper',\n  'placeScope',\n  'mapLod',\n  'locatorType',",
    'index check LIGHT_FIELDS');
  s = replaceOnce(s,
    "  if (sourceFile) out.sourceFile = sourceFile;\n  return out;",
    "  if (sourceFile) out.sourceFile = sourceFile;\n  const placeScope = typeof place.placeScope === 'string' ? place.placeScope.trim().toLowerCase() : '';\n  const explicitMapLod = typeof place.mapLod === 'string' ? place.mapLod.trim().toLowerCase() : '';\n  if (!explicitMapLod && placeScope === 'area') out.mapLod = 'area';\n  return out;",
    'index check derive area mapLod');
  await write(path, s);
}

async function patchMap() {
  const path = 'js/map.ts';
  let s = await read(path);

  s = replaceOnce(s,
`  const L_GLOW = "hg-places-glow";
  const L_HIT  = "hg-places-hit";
  const L_DOTS = "hg-places-dots";
  const L_LAB  = "hg-places-label";
  const PLACE_LABEL_MIN_ZOOM = 13.8;
  const PLACE_DETAIL_MIN_ZOOM = 12;
  const PLACE_SCOPE_AREA = "area";
  const PLACE_ZOOM_LOD_FILTER: any = ["any", [">=", ["zoom"], PLACE_DETAIL_MIN_ZOOM], ["==", ["get", "isAreaPlace"], 1]];
  const PLACE_HIT_LAYERS = [L_HIT, L_DOTS, L_LAB, L_GLOW];
  const PLACE_HIT_PRIORITY = [L_HIT, L_DOTS, L_LAB, L_GLOW];`,
`  const L_GLOW = "hg-places-glow";
  const L_HIT  = "hg-places-hit";
  const L_DOTS = "hg-places-dots";
  const L_LAB  = "hg-places-label";
  const L_AREA_GLOW = "hg-place-areas-glow";
  const L_AREA_HIT = "hg-place-areas-hit";
  const L_AREA_DOTS = "hg-place-areas-dots";
  const L_AREA_LAB = "hg-place-areas-label";
  const PLACE_AREA_LABEL_MIN_ZOOM = 9.5;
  const PLACE_DETAIL_MIN_ZOOM = 11.8;
  const PLACE_DETAIL_HIT_MIN_ZOOM = 12.35;
  const PLACE_DETAIL_LABEL_MIN_ZOOM = 13.15;
  const PLACE_DETAIL_FULL_ZOOM = 13.0;
  const PLACE_SCOPE_AREA = "area";
  const PLACE_MAP_LOD_OVERVIEW = "overview";
  const PLACE_MAP_LOD_AREA = "area";
  const PLACE_MAP_LOD_DETAIL = "detail";
  const PLACE_AREA_LOD_FILTER: any = ["in", ["get", "mapLod"], ["literal", [PLACE_MAP_LOD_OVERVIEW, PLACE_MAP_LOD_AREA]]];
  const PLACE_DETAIL_POINT_FILTER: any = ["all", ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL], [">=", ["zoom"], PLACE_DETAIL_MIN_ZOOM]];
  const PLACE_DETAIL_HIT_FILTER: any = ["all", ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL], [">=", ["zoom"], PLACE_DETAIL_HIT_MIN_ZOOM]];
  const PLACE_DETAIL_LABEL_FILTER: any = ["all", ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL], [">=", ["zoom"], PLACE_DETAIL_LABEL_MIN_ZOOM]];
  const PLACE_HIT_LAYERS = [L_AREA_HIT, L_HIT, L_AREA_DOTS, L_DOTS, L_AREA_LAB, L_LAB, L_AREA_GLOW, L_GLOW];
  const PLACE_HIT_PRIORITY = [L_AREA_HIT, L_HIT, L_AREA_DOTS, L_DOTS, L_AREA_LAB, L_LAB, L_AREA_GLOW, L_GLOW];`,
    'map LOD constants');

  s = replaceOnce(s,
`    [L_LAB, L_HIT, L_DOTS, L_GLOW].forEach(id => {
      if (MAP.getLayer(id)) MAP.removeLayer(id);
    });`,
`    [L_AREA_LAB, L_LAB, L_AREA_HIT, L_HIT, L_AREA_DOTS, L_DOTS, L_AREA_GLOW, L_GLOW].forEach(id => {
      if (MAP.getLayer(id)) MAP.removeLayer(id);
    });`,
    'remove all LOD layers');

  s = replaceRegexOnce(s,
/  function getPlaceGlowPaint\(\) \{[\s\S]*?\n  \}\n\n  function getPlaceLabelPaint\(\) \{[\s\S]*?\n  \}\n\n  function isAreaPlace\(place\) \{[\s\S]*?\n  \}/,
`  function getPlaceDetailVisibility() {
    return [
      "interpolate", ["linear"], ["zoom"],
      PLACE_DETAIL_MIN_ZOOM, 0.0,
      PLACE_DETAIL_FULL_ZOOM, 1.0
    ];
  }

  function getPlaceGlowPaint(isArea = false) {
    const radius = isArea
      ? ["interpolate", ["linear"], ["zoom"], 7, 3.5, 9.5, 6, 12, 8.2, 16, 11.5, 18, 15]
      : ["interpolate", ["linear"], ["zoom"], 10, 2, 12, 3, 14, 5, 16, 9, 18, 14];
    const visibility = isArea ? 1 : getPlaceDetailVisibility();

    if (!isStandardMapStyle()) {
      return {
        "circle-radius": radius,
        "circle-color": "rgba(0,0,0,0.12)",
        "circle-opacity": ["*", 0.45, visibility],
        "circle-blur": 0.8
      };
    }

    return {
      "circle-radius": isArea
        ? radius
        : ["interpolate", ["linear"], ["zoom"], 10, 5, 12, 7, 14, 9, 16, 13, 18, 18],
      "circle-color": ["get", "fill"],
      "circle-opacity": [
        "*",
        [
          "case",
          ["in", ["get", "coordinateTrust"], ["literal", ["review", "unknown"]]], 0.12,
          0.24
        ],
        visibility
      ],
      "circle-blur": 0.65
    };
  }

  function getPlaceLabelPaint(isArea = false) {
    const opacity = isArea
      ? [
          "interpolate", ["linear"], ["zoom"],
          PLACE_AREA_LABEL_MIN_ZOOM, 0.0,
          PLACE_AREA_LABEL_MIN_ZOOM + 0.6, 0.86,
          PLACE_AREA_LABEL_MIN_ZOOM + 1.2, 1.0
        ]
      : [
          "interpolate", ["linear"], ["zoom"],
          PLACE_DETAIL_LABEL_MIN_ZOOM, 0.0,
          PLACE_DETAIL_LABEL_MIN_ZOOM + 0.8, 0.72,
          PLACE_DETAIL_LABEL_MIN_ZOOM + 1.6, 1.0
        ];

    if (!isStandardMapStyle()) {
      return {
        "text-color": "rgba(20,20,20,0.92)",
        "text-halo-color": "rgba(255,255,255,0.95)",
        "text-halo-width": isArea ? 1.8 : 1.4,
        "text-halo-blur": 0.25,
        "text-opacity": opacity
      };
    }

    return {
      "text-color": "rgba(50,61,67,0.96)",
      "text-halo-color": "rgba(255,252,244,0.96)",
      "text-halo-width": isArea ? 2.0 : 1.7,
      "text-halo-blur": 0.22,
      "text-opacity": opacity
    };
  }

  function getPlaceDotPaint(isArea = false) {
    return {
      "circle-radius": isArea
        ? [
            "interpolate", ["linear"], ["zoom"],
            7, ["+", 3.2, ["*", 0.25, ["get", "visited"]]],
            9.5, ["+", 5.2, ["*", 0.35, ["get", "visited"]]],
            12, ["+", 6.4, ["*", 0.45, ["get", "visited"]]],
            16, ["+", 7.2, ["*", 0.7, ["get", "visited"]]],
            18, ["+", 8.8, ["*", 0.9, ["get", "visited"]]]
          ]
        : [
            "interpolate", ["linear"], ["zoom"],
            10, ["+", 2.1, ["*", 0.4, ["get", "visited"]]],
            12, ["+", 2.8, ["*", 0.6, ["get", "visited"]]],
            14, ["+", 4.1, ["*", 0.8, ["get", "visited"]]],
            16, ["+", 6.1, ["*", 1.0, ["get", "visited"]]],
            18, ["+", 8.8, ["*", 1.3, ["get", "visited"]]]
          ],
      "circle-color": ["get", "fill"],
      "circle-stroke-color": ["get", "border"],
      "circle-stroke-width": isArea ? getPlaceMarkerStrokeWidth() + 0.5 : getPlaceMarkerStrokeWidth(),
      "circle-opacity": [
        "*",
        [
          "case",
          ["in", ["get", "coordinateTrust"], ["literal", ["review", "unknown"]]], 0.58,
          1
        ],
        isArea ? 1 : getPlaceDetailVisibility()
      ]
    };
  }

  function getPlaceLabelLayout(isArea = false) {
    return {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
      "text-size": isArea
        ? ["interpolate", ["linear"], ["zoom"], 9, 12.5, 12, 14.5, 16, 16.5, 18, 17.5]
        : ["interpolate", ["linear"], ["zoom"], 11, 12, 14, 13, 18, 16],
      "text-offset": [0, isArea ? 1.0 : 1.2],
      "text-anchor": "top",
      "text-allow-overlap": false,
      "text-ignore-placement": false
    };
  }

  function getPlaceHitPaint(isArea = false) {
    return {
      "circle-radius": isArea
        ? ["interpolate", ["linear"], ["zoom"], 7, 11, 10, 13, 12, 16, 16, 20, 18, 24]
        : ["interpolate", ["linear"], ["zoom"], 10, 9, 12, 11, 14, 14, 16, 18, 18, 23],
      "circle-color": "rgba(0,0,0,0.01)",
      "circle-opacity": 0.01
    };
  }

  function isAreaPlace(place) {
    return String(place?.placeScope || "").trim().toLowerCase() === PLACE_SCOPE_AREA;
  }

  function getMapLod(place) {
    const explicit = String(place?.mapLod || "").trim().toLowerCase();
    if ([PLACE_MAP_LOD_OVERVIEW, PLACE_MAP_LOD_AREA, PLACE_MAP_LOD_DETAIL].includes(explicit)) return explicit;
    return isAreaPlace(place) ? PLACE_MAP_LOD_AREA : PLACE_MAP_LOD_DETAIL;
  }`,
    'map paint helpers and mapLod');

  s = replaceOnce(s,
`          visited: isVisited ? 1 : 0,
          isAreaPlace: isAreaPlace(p) ? 1 : 0,
          coordinateTrust,`,
`          visited: isVisited ? 1 : 0,
          isAreaPlace: isAreaPlace(p) ? 1 : 0,
          mapLod: getMapLod(p),
          coordinateTrust,`,
    'feature mapLod property');

  s = replaceRegexOnce(s,
/    MAP\.addLayer\(\{\n      id: L_GLOW,[\s\S]*?\n    \}\);\n\n    bindPlaceLayerHandlers\(\);/,
`    MAP.addLayer({
      id: L_AREA_GLOW,
      filter: PLACE_AREA_LOD_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceGlowPaint(true)
    });

    MAP.addLayer({
      id: L_GLOW,
      filter: PLACE_DETAIL_POINT_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceGlowPaint(false)
    });

    MAP.addLayer({
      id: L_AREA_DOTS,
      filter: PLACE_AREA_LOD_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceDotPaint(true)
    });

    MAP.addLayer({
      id: L_DOTS,
      filter: PLACE_DETAIL_POINT_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceDotPaint(false)
    });

    MAP.addLayer({
      id: L_LAB,
      filter: PLACE_DETAIL_LABEL_FILTER,
      type: "symbol",
      source: SRC,
      layout: getPlaceLabelLayout(false),
      paint: getPlaceLabelPaint(false)
    });

    MAP.addLayer({
      id: L_AREA_LAB,
      filter: PLACE_AREA_LOD_FILTER,
      type: "symbol",
      source: SRC,
      layout: getPlaceLabelLayout(true),
      paint: getPlaceLabelPaint(true)
    });

    MAP.addLayer({
      id: L_HIT,
      filter: PLACE_DETAIL_HIT_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceHitPaint(false)
    });

    MAP.addLayer({
      id: L_AREA_HIT,
      filter: PLACE_AREA_LOD_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceHitPaint(true)
    });

    bindPlaceLayerHandlers();`,
    'replace one-layer LOD with area/detail layers');

  s = replaceOnce(s,
`  function bindPlaceLayerHandlers() {
    if (!MAP || !hasLayer(L_HIT)) return;

    if (MAP.__hgPlaceHandlers) {
      const prev = MAP.__hgPlaceHandlers;
      MAP.off("mouseenter", L_HIT, prev.setPointer);
      MAP.off("mouseleave", L_HIT, prev.clearPointer);`,
`  function bindPlaceLayerHandlers() {
    if (!MAP || ![L_AREA_HIT, L_HIT].some(hasLayer)) return;

    if (MAP.__hgPlaceHandlers) {
      const prev = MAP.__hgPlaceHandlers;
      for (const layerId of (prev.hoverLayers || [L_HIT])) {
        MAP.off("mouseenter", layerId, prev.setPointer);
        MAP.off("mouseleave", layerId, prev.clearPointer);
      }`,
    'bind LOD hover handlers cleanup');

  s = replaceOnce(s,
`    MAP.__hgPlaceHandlers = {
      canvas,
      setPointer,`,
`    const hoverLayers = [L_AREA_HIT, L_HIT].filter(hasLayer);

    MAP.__hgPlaceHandlers = {
      canvas,
      hoverLayers,
      setPointer,`,
    'store LOD hover layers');

  s = replaceOnce(s,
`    MAP.on("mouseenter", L_HIT, setPointer);
    MAP.on("mouseleave", L_HIT, clearPointer);`,
`    for (const layerId of hoverLayers) {
      MAP.on("mouseenter", layerId, setPointer);
      MAP.on("mouseleave", layerId, clearPointer);
    }`,
    'bind hover to both LOD hits');

  s = replaceOnce(s,
`    [L_GLOW, L_DOTS, L_LAB, L_HIT].forEach(id => {
      if (MAP.getLayer(id)) MAP.moveLayer(id);
    });`,
`    [L_AREA_GLOW, L_GLOW, L_AREA_DOTS, L_DOTS, L_LAB, L_AREA_LAB, L_HIT, L_AREA_HIT].forEach(id => {
      if (MAP.getLayer(id)) MAP.moveLayer(id);
    });`,
    'move all LOD layers on top');

  s = replaceOnce(s,
`    getCoordinateTrust,
    isAreaPlace,

    maybeDrawMarkers,`,
`    getCoordinateTrust,
    isAreaPlace,
    getMapLod,

    maybeDrawMarkers,`,
    'expose getMapLod');

  await write(path, s);
}

async function writeRegressionTest() {
  const path = 'tests/map-place-area-lod.test.mjs';
  const content = `import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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
  assert.match(source, /PLACE_SCOPE_AREA\\s*=\\s*"area"/);
  assert.match(source, /PLACE_MAP_LOD_OVERVIEW\\s*=\\s*"overview"/);
  assert.match(source, /PLACE_MAP_LOD_AREA\\s*=\\s*"area"/);
  assert.match(source, /PLACE_MAP_LOD_DETAIL\\s*=\\s*"detail"/);
  assert.match(source, /function getMapLod\\(place\\)/);
  assert.match(source, /return isAreaPlace\\(place\\) \\? PLACE_MAP_LOD_AREA : PLACE_MAP_LOD_DETAIL/);

  const areaFn = source.match(/function isAreaPlace\\(place\\) \\{[\\s\\S]*?\\n  \\}/)?.[0] || "";
  assert.match(areaFn, /placeScope/);
  assert.doesNotMatch(areaFn, /coordRole|coordType|area_anchor|district_anchor/);
});

test("places_index bevarer placeScope og materialiserer mapLod for områder", () => {
  for (const code of [buildIndex, checkIndex]) {
    assert.match(code, /placeScope/);
    assert.match(code, /mapLod/);
    assert.match(code, /placeScope === 'area'/);
    assert.match(code, /out\\.mapLod = 'area'/);
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
  assert.match(source, /L_AREA_DOTS\\s*=\\s*"hg-place-areas-dots"/);
  assert.match(source, /L_AREA_LAB\\s*=\\s*"hg-place-areas-label"/);
  assert.match(source, /PLACE_DETAIL_MIN_ZOOM\\s*=\\s*11\\.8/);
  assert.match(source, /PLACE_DETAIL_HIT_MIN_ZOOM\\s*=\\s*12\\.35/);
  assert.match(source, /PLACE_DETAIL_LABEL_MIN_ZOOM\\s*=\\s*13\\.15/);
  assert.match(source, /getPlaceDetailVisibility/);
  assert.match(source, /PLACE_DETAIL_FULL_ZOOM, 1\\.0/);
  assert.match(source, /filter: PLACE_AREA_LOD_FILTER/);
  assert.match(source, /filter: PLACE_DETAIL_POINT_FILTER/);
  assert.match(source, /filter: PLACE_DETAIL_HIT_FILTER/);
  assert.match(source, /filter: PLACE_DETAIL_LABEL_FILTER/);
});

test("områdeetiketter prioriteres som eget symbol-lag og begge hit-lag er klikkbare", () => {
  assert.match(source, /id: L_AREA_LAB,[\\s\\S]*?layout: getPlaceLabelLayout\\(true\\)/);
  assert.match(source, /const hoverLayers = \\[L_AREA_HIT, L_HIT\\]\\.filter\\(hasLayer\\)/);
  assert.match(source, /PLACE_HIT_LAYERS = \\[L_AREA_HIT, L_HIT/);
  assert.match(source, /PLACE_HIT_PRIORITY = \\[L_AREA_HIT, L_HIT/);
});

test("TypeScript source og committed runtime-builds inneholder LOD v2", () => {
  for (const [name, code] of [["source", source], ["legacy", legacy], ["dist", dist]]) {
    assert.match(code, /hg-place-areas-dots/, name + ": mangler områdeprikker");
    assert.match(code, /mapLod/, name + ": mangler mapLod");
    assert.match(code, /11\\.8/, name + ": mangler detaljfade-start");
  }
});
`;
  await write(path, content);
}

async function patchDocs() {
  const path = 'docs/PLACE_PRODUCTION_CHECKLIST.md';
  let s = await read(path);
  const marker = '## Kart-LOD v2';
  if (!s.includes(marker)) {
    s += `\n\n${marker}\n\n- \`placeScope\` beskriver hva et Place **er** semantisk. \`placeScope: "area"\` skal bare brukes for reelle område-Places.\n- \`mapLod\` beskriver hvordan Place-et prioriteres i kartet. Runtime-indeksen materialiserer \`mapLod: "area"\` automatisk fra canonical \`placeScope: "area"\` når ingen eksplisitt \`mapLod\` finnes.\n- Kartet har separate område- og detaljlag: områdeprikker/-navn er synlige på oversiktszoom, detaljprikker fader inn fra zoom 11,8, detalj-hitflate åpnes fra 12,35 og detaljetiketter fra 13,15.\n- Koordinatroller som \`area_anchor\` og \`district_anchor\` er geometri, ikke områdeeierskap, og skal aldri alene gjøre et Place til område.\n- \`places_index.json\` må bevare \`placeScope\` og avledet \`mapLod\`; sync- og kart-LOD-testene skal stoppe regresjoner.\n`;
  }
  await write(path, s);
}

await patchBuildIndex();
await patchIndexCheck();
await patchMap();
await writeRegressionTest();
await patchDocs();
console.log('TEMP map LOD v2 migration applied.');
