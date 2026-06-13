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

const unlockableStatuses = new Set(["verified", "auto_matched", "automatic", "matched"]);

function text(value) {
  return value == null ? "" : String(value).trim();
}

function slug(value) {
  return text(value)
    .toLowerCase()
    .replace(/[æǽ]/g, "ae")
    .replace(/[øö]/g, "o")
    .replace(/[å]/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function first(relation, keys) {
  for (const key of keys) {
    if (text(relation?.[key])) return text(relation[key]);
  }
  return "";
}

function unlockId(relation, type, validPlaceIds) {
  const id = placeId(relation);
  const status = first(relation, ["status", "matchStatus", "match_status"]).toLowerCase();
  if (!id || !validPlaceIds.has(id) || !unlockableStatuses.has(status)) return "";
  const isArtist = type === "music_artist";
  const primaryId = first(relation, isArtist ? ["artistId", "artist_id", "id"] : ["trackId", "track_id", "id"]);
  const fallbackName = first(relation, isArtist
    ? ["artistName", "artist_name", "name"]
    : ["trackTitle", "track_title", "title", "name"]);
  const stablePart = primaryId || (fallbackName ? `name_${slug(fallbackName)}` : "");
  return stablePart ? `${type}__${id}__${stablePart}` : "";
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
const artistUnlockIds = artists.map(relation => unlockId(relation, "music_artist", validPlaceIds)).filter(Boolean);
const trackUnlockIds = tracks.map(relation => unlockId(relation, "music_track", validPlaceIds)).filter(Boolean);
const allUnlockIds = [...artistUnlockIds, ...trackUnlockIds];

const audit = {
  artistPlaceRelations: artists.length,
  trackPlaceRelations: tracks.length,
  uniquePlacesWithMusic: new Set(linkedIds.filter(id => validPlaceIds.has(id))).size,
  relationsMissingPlaceId: missingPlaceId,
  relationsWithUnknownPlaceId: allRelations.filter(relation => {
    const id = placeId(relation);
    return id && !validPlaceIds.has(id);
  }).length,
  unlockableMusicObjects: allUnlockIds.length,
  unlockableArtists: artistUnlockIds.length,
  unlockableTracks: trackUnlockIds.length,
  stableUniqueUnlockIds: new Set(allUnlockIds).size,
  duplicateUnlockIds: allUnlockIds.length - new Set(allUnlockIds).size,
  unknownPlaceIds,
  topPlacesByTracks: topByPlace(tracks, validPlaceIds),
  topPlacesByArtists: topByPlace(artists, validPlaceIds)
};

console.log(JSON.stringify(audit, null, 2));
