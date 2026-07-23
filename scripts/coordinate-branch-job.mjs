#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-161-fossveien-research');
const sourceFile = path.join(reportDir, 'candidate-summary.json');
const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

const localMinLat = 59.9215;
const localMaxLat = 59.9262;
const preferredRiverWayIds = new Set([80915045, 132814790, 1454917517]);

const localCrossings = [];
for (const row of source.bridgeCrossings || []) {
  for (const hit of row.intersections || []) {
    if (hit.lat < localMinLat || hit.lat > localMaxLat) continue;
    if (!preferredRiverWayIds.has(Number(row.riverWayId))) continue;
    localCrossings.push({
      riverWayId: row.riverWayId,
      bridgeWayId: row.bridgeWayId,
      bridgeName: row.bridgeTags?.name || null,
      highway: row.bridgeTags?.highway || null,
      bridgeTags: row.bridgeTags || {},
      lat: hit.lat,
      lon: hit.lon,
      riverMeasureM: hit.leftMeasureM,
    });
  }
}
localCrossings.sort((a, b) => b.lat - a.lat);

const adjacent = Object.fromEntries((source.adjacentCanonical || []).map((row) => [row.id, row]));
const fossveien = (source.fossveienWays || [])[0] || null;
const fossveienSouth = fossveien?.geometry?.[0] || null;
const fossveienNorth = fossveien?.geometry?.at?.(-1) || null;

const compact = {
  generatedAt: new Date().toISOString(),
  placeId: source.placeId,
  fossveien: fossveien ? {
    osmWayId: fossveien.id,
    southEndpoint: fossveienSouth,
    northEndpoint: fossveienNorth,
    tags: fossveien.tags,
  } : null,
  exactStreetToMainRiverDistanceM: (source.fossveienToRiver || []).find((row) => row.fossveienWayId === 3235603 && row.riverWayId === 80915045)?.distanceM ?? null,
  localCrossings,
  adjacentCanonical: {
    nedre_foss: adjacent.nedre_foss || null,
    kuba_parken: adjacent.kuba_parken || null,
    elvestrekning_bla_brenneriveien: adjacent.elvestrekning_bla_brenneriveien || null,
  },
  decisionNotes: [
    'Fossveien way 3235603 does not intersect Akerselva; street proximity alone cannot define the river record.',
    'Any production bracket must be justified by explicit physical crossings or canonical named features that match the record narrative, not by nearest-distance selection.',
    'This report only exposes candidate physical boundaries in the local latitude band for manual source-scope evaluation.',
  ],
};

fs.writeFileSync(path.join(reportDir, 'local-bracket-summary.json'), `${JSON.stringify(compact, null, 2)}\n`);
console.log(JSON.stringify(compact, null, 2));
