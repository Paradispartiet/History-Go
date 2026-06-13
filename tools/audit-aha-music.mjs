import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const integrationDir = path.join(root, "data/integrations/aha-music");
const artistPath = path.join(integrationDir, "musicArtistPlaceRelations.json");
const trackPath = path.join(integrationDir, "musicTrackPlaceRelations.json");
const placeIndexPath = path.join(root, "data/places/places_index.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function rows(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return Array.isArray(payload?.relations) ? payload.relations : [];
}

function placeId(relation) {
  return String(
    relation?.historyGoPlaceId
    ?? relation?.history_go_place_id
    ?? relation?.placeId
    ?? relation?.place_id
    ?? ""
  ).trim();
}

function topByPlace(relations, validPlaceIds, limit = 10) {
  const counts = new Map();
  for (const relation of relations) {
    const id = placeId(relation);
    if (!id || !validPlaceIds.has(id)) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nb"))
    .slice(0, limit)
    .map(([historyGoPlaceId, count]) => ({ historyGoPlaceId, count }));
}

const artists = rows(readJson(artistPath), ["artistPlaceRelations", "artists"]);
const tracks = rows(readJson(trackPath), ["trackPlaceRelations", "tracks"]);
const validPlaceIds = new Set(readJson(placeIndexPath).map(place => String(place?.id || "").trim()).filter(Boolean));
const allRelations = [...artists, ...tracks];
const linkedIds = allRelations.map(placeId).filter(Boolean);
const missingPlaceId = allRelations.filter(relation => !placeId(relation)).length;
const unknownPlaceIds = [...new Set(linkedIds.filter(id => !validPlaceIds.has(id)))].sort();

const audit = {
  artistPlaceRelations: artists.length,
  trackPlaceRelations: tracks.length,
  uniquePlacesWithMusic: new Set(linkedIds.filter(id => validPlaceIds.has(id))).size,
  relationsMissingPlaceId: missingPlaceId,
  relationsWithUnknownPlaceId: allRelations.filter(relation => {
    const id = placeId(relation);
    return id && !validPlaceIds.has(id);
  }).length,
  unknownPlaceIds,
  topPlacesByTracks: topByPlace(tracks, validPlaceIds),
  topPlacesByArtists: topByPlace(artists, validPlaceIds)
};

console.log(JSON.stringify(audit, null, 2));
