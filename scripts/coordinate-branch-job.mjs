#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const placeId = 'noklevann_ljanselva_start';
const expectedNearby = ['skraperudtjern', 'ljanselva_skullerud', 'ljanselva_hauketo'];
const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/noklevann_ljanselva_start.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-141-noklevann-outflow-topology');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((place) => place?.id === placeId).length !== 1) {
  throw new Error(`${placeId} må finnes nøyaktig én gang i aggregate`);
}

const updatedAggregate = aggregate.map((place) => {
  if (place?.id !== placeId) return place;
  if (place.coordStatus !== 'verified_geometry' || place.sourceObjectId !== 'osm-node:1636570783') {
    throw new Error('Batch 141-koordinatresultatet mangler eller har endret seg før nearby-fiks');
  }
  return {
    ...place,
    nature_profile: {
      ...(place.nature_profile || {}),
      nearby_place_ids: expectedNearby,
    },
  };
});

const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} mangler i split-manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(path.join(reportDir, 'nearby-links-preservation.json'), {
  generatedAt: new Date().toISOString(),
  placeId,
  preservedNearbyPlaceIds: expectedNearby,
  coordinateUnchanged: { lat: updatedPlace.lat, lon: updatedPlace.lon, sourceObjectId: updatedPlace.sourceObjectId },
});

console.log(JSON.stringify({ placeId, preservedNearbyPlaceIds: expectedNearby }, null, 2));
