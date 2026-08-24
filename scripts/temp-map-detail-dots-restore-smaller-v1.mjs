import fs from "node:fs";

const mapPath = "js/map.ts";
const testPath = "tests/map-place-area-lod.test.mjs";

let source = fs.readFileSync(mapPath, "utf8");

function replaceExact(input, before, after, label) {
  const count = input.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one match, got ${count}`);
  }
  return input.replace(before, after);
}

source = replaceExact(
  source,
  `  function getPlaceMarkerStrokeWidth() {\n    return isStandardMapStyle() ? 2.4 : 1.8;\n  }`,
  `  function getPlaceMarkerStrokeWidth(isArea = false) {\n    // Preserve the established area-marker border, but keep detail markers\n    // visually subordinate to their labels and to the overview layer.\n    if (isArea) return isStandardMapStyle() ? 2.4 : 1.8;\n    return isStandardMapStyle() ? 1.45 : 1.15;\n  }`,
  "detail marker stroke"
);

const glowStart = source.indexOf("  function getPlaceGlowPaint(isArea = false) {");
const glowEnd = source.indexOf("\n\n  function getPlaceLabelPaint", glowStart);
if (glowStart < 0 || glowEnd < 0) throw new Error("Could not locate getPlaceGlowPaint");
const newGlow = `  function getPlaceGlowPaint(isArea = false) {\n    const radius = isArea\n      ? [\"interpolate\", [\"linear\"], [\"zoom\"], 7, 3.5, 9.5, 6, 12, 8.2, 16, 11.5, 18, 15]\n      : [\"interpolate\", [\"linear\"], [\"zoom\"], 10, 1.8, 12, 2.5, 14, 3.7, 16, 5.2, 18, 7.4];\n    const visibility = isArea ? 1 : getPlaceDetailVisibility();\n\n    if (!isStandardMapStyle()) {\n      return {\n        \"circle-radius\": radius,\n        \"circle-color\": \"rgba(0,0,0,0.12)\",\n        \"circle-opacity\": [\"*\", 0.45, visibility],\n        \"circle-blur\": 0.8\n      };\n    }\n\n    return {\n      \"circle-radius\": isArea\n        ? radius\n        : [\"interpolate\", [\"linear\"], [\"zoom\"], 10, 3.0, 12, 3.8, 14, 5.0, 16, 6.8, 18, 9.2],\n      \"circle-color\": [\"get\", \"fill\"],\n      \"circle-opacity\": [\n        \"*\",\n        [\n          \"case\",\n          [\"in\", [\"get\", \"coordinateTrust\"], [\"literal\", [\"review\", \"unknown\"]]], 0.12,\n          0.24\n        ],\n        visibility\n      ],\n      \"circle-blur\": 0.65\n    };\n  }`;
source = source.slice(0, glowStart) + newGlow + source.slice(glowEnd);

const dotStart = source.indexOf("  function getPlaceDotPaint(isArea = false) {");
const dotEnd = source.indexOf("\n\n  function getPlaceLabelLayout", dotStart);
if (dotStart < 0 || dotEnd < 0) throw new Error("Could not locate getPlaceDotPaint");
const newDot = `  function getPlaceDotPaint(isArea = false) {\n    return {\n      \"circle-radius\": isArea\n        ? [\n            \"interpolate\", [\"linear\"], [\"zoom\"],\n            7, [\"+\", 3.2, [\"*\", 0.25, [\"get\", \"visited\"]]],\n            9.5, [\"+\", 5.2, [\"*\", 0.35, [\"get\", \"visited\"]]],\n            12, [\"+\", 6.4, [\"*\", 0.45, [\"get\", \"visited\"]]],\n            16, [\"+\", 7.2, [\"*\", 0.7, [\"get\", \"visited\"]]],\n            18, [\"+\", 8.8, [\"*\", 0.9, [\"get\", \"visited\"]]]\n          ]\n        : [\n            \"interpolate\", [\"linear\"], [\"zoom\"],\n            10, [\"+\", 1.6, [\"*\", 0.2, [\"get\", \"visited\"]]],\n            12, [\"+\", 2.2, [\"*\", 0.3, [\"get\", \"visited\"]]],\n            14, [\"+\", 3.0, [\"*\", 0.4, [\"get\", \"visited\"]]],\n            16, [\"+\", 4.0, [\"*\", 0.6, [\"get\", \"visited\"]]],\n            18, [\"+\", 5.6, [\"*\", 0.8, [\"get\", \"visited\"]]]\n          ],\n      \"circle-color\": [\"get\", \"fill\"],\n      \"circle-stroke-color\": [\"get\", \"border\"],\n      \"circle-stroke-width\": isArea ? getPlaceMarkerStrokeWidth(true) + 0.5 : getPlaceMarkerStrokeWidth(false),\n      // The layer minzoom already owns when detail markers appear. Do not fade\n      // the actual dot away: once a place label can render, its dot must exist.\n      \"circle-opacity\": [\n        \"case\",\n        [\"in\", [\"get\", \"coordinateTrust\"], [\"literal\", [\"review\", \"unknown\"]]], 0.58,\n        1\n      ]\n    };\n  }`;
source = source.slice(0, dotStart) + newDot + source.slice(dotEnd);

fs.writeFileSync(mapPath, source);

let tests = fs.readFileSync(testPath, "utf8");
const marker = 'test("detaljprikker beholdes sammen med stedsnavn og er mindre enn gammel profil"';
if (!tests.includes(marker)) {
  tests += `\n\ntest("detaljprikker beholdes sammen med stedsnavn og er mindre enn gammel profil", () => {\n  const dotFn = source.match(/function getPlaceDotPaint\\(isArea = false\\) \\{[\\s\\S]*?\\n  \\}/)?.[0] || \"\";\n  assert.ok(dotFn, \"mangler getPlaceDotPaint\");\n  assert.doesNotMatch(dotFn, /getPlaceDetailVisibility/, \"selve detaljprikken skal ikke fades bort av LOD-overgangen\");\n  assert.match(dotFn, /10, \\[\"\\+\", 1\\.6/);\n  assert.match(dotFn, /14, \\[\"\\+\", 3\\.0/);\n  assert.match(dotFn, /18, \\[\"\\+\", 5\\.6/);\n  assert.match(dotFn, /getPlaceMarkerStrokeWidth\\(false\\)/);\n\n  assert.match(source, /function getPlaceMarkerStrokeWidth\\(isArea = false\\)/);\n  assert.match(source, /if \\(isArea\\) return isStandardMapStyle\\(\\) \\? 2\\.4 : 1\\.8/);\n  assert.match(source, /return isStandardMapStyle\\(\\) \\? 1\\.45 : 1\\.15/);\n\n  const detailZoom = Number(source.match(/PLACE_DETAIL_MIN_ZOOM\\s*=\\s*([0-9.]+)/)?.[1]);\n  const labelZoom = Number(source.match(/PLACE_DETAIL_LABEL_MIN_ZOOM\\s*=\\s*([0-9.]+)/)?.[1]);\n  assert.ok(Number.isFinite(detailZoom) && Number.isFinite(labelZoom));\n  assert.ok(detailZoom < labelZoom, \"detaljprikken må være aktiv før stedsnavnet kan vises\");\n});\n`;
}
fs.writeFileSync(testPath, tests);

console.log("Applied smaller always-visible detail dot restoration.");
