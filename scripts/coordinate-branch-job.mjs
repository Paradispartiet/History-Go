#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const inputPath = path.join(ROOT, "reports/etne-natur-batch-8-akrafjorden-waterbody-geometry.json");
const outputPath = path.join(ROOT, "reports/etne-natur-batch-9-akrafjorden-ring-diagnostic.json");

const report = JSON.parse(await fs.readFile(inputPath, "utf8"));
const feature = report.featureCollection.features.find(item => item?.properties?.Name === "Åkrafjorden") || report.featureCollection.features[0];
const rings = feature.geometry.type === "Polygon"
  ? feature.geometry.coordinates
  : feature.geometry.coordinates.flat();

function signedArea(ring) {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += Number(ring[j][0]) * Number(ring[i][1]) - Number(ring[i][0]) * Number(ring[j][1]);
  }
  return sum / 2;
}

function pointOnSegment(point, a, b, epsilon = 1e-10) {
  const [x, y] = point;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
  if (Math.abs(cross) > epsilon) return false;
  const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
  if (dot < -epsilon) return false;
  const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  return dot <= lengthSquared + epsilon;
}

function pointInRing(point, ring) {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j];
    const b = ring[i];
    if (pointOnSegment(point, a, b)) return true;
    const [xi, yi] = b;
    const [xj, yj] = a;
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonCentroid(ring) {
  let areaFactor = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = Number(ring[j][0]) * Number(ring[i][1]) - Number(ring[i][0]) * Number(ring[j][1]);
    areaFactor += cross;
    cx += (Number(ring[j][0]) + Number(ring[i][0])) * cross;
    cy += (Number(ring[j][1]) + Number(ring[i][1])) * cross;
  }
  if (Math.abs(areaFactor) < 1e-15) return null;
  return [cx / (3 * areaFactor), cy / (3 * areaFactor)];
}

const ringStats = rings.map((ring, index) => {
  const xs = ring.map(point => Number(point[0]));
  const ys = ring.map(point => Number(point[1]));
  const area = signedArea(ring);
  const centroid = polygonCentroid(ring);
  const average = [xs.reduce((a, b) => a + b, 0) / xs.length, ys.reduce((a, b) => a + b, 0) / ys.length];
  const testPoint = centroid && pointInRing(centroid, ring) ? centroid : average;
  const containingRings = rings
    .map((candidate, candidateIndex) => candidateIndex !== index && pointInRing(testPoint, candidate) ? candidateIndex : null)
    .filter(value => value !== null);
  return {
    index,
    pointCount: ring.length,
    signedAreaDegrees2: area,
    absoluteAreaDegrees2: Math.abs(area),
    orientation: area < 0 ? "clockwise" : "counterclockwise",
    bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    centroid,
    centroidInsideOwnRing: centroid ? pointInRing(centroid, ring) : false,
    averagePoint: average,
    testPoint,
    containingRings,
    nestingDepth: containingRings.length
  };
}).sort((a, b) => b.absoluteAreaDegrees2 - a.absoluteAreaDegrees2);

const knownPoints = [
  { id: "history_go_name_anchor", point: [5.99829, 59.7476] },
  { id: "langfoss_mouth_area", point: [6.33989, 59.84409] },
  { id: "inner_fjord_test", point: [6.25, 59.82] },
  { id: "middle_fjord_test", point: [6.10, 59.78] }
].map(item => {
  const containingRings = rings.map((ring, index) => pointInRing(item.point, ring) ? index : null).filter(value => value !== null);
  return { ...item, containingRings, oddEvenInside: containingRings.length % 2 === 1 };
});

const output = {
  generatedAt: new Date().toISOString(),
  waterBodyCode: feature.properties.EUSurfaceWaterBodyCode,
  geometryType: feature.geometry.type,
  ringCount: rings.length,
  ringStats,
  knownPoints,
  interpretation: {
    rule: "A point is inside when it is contained by an odd number of rings.",
    note: "Ring order is not assumed. Signed orientation and nesting are recorded for manual verification."
  }
};

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify(output, null, 2));
