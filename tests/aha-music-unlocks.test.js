const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("js/integrations/aha-music.js", "utf8");
const storage = {};
let updateProfileEvents = 0;
const window = {
  localStorage: {
    getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
    setItem(key, value) { storage[key] = String(value); }
  },
  dispatchEvent(event) {
    if (event?.type === "updateProfile") updateProfileEvents += 1;
  }
};
class Event { constructor(type) { this.type = type; } }
class CustomEvent extends Event { constructor(type, init = {}) { super(type); this.detail = init.detail; } }
vm.runInNewContext(source, { window, console, Event, CustomEvent });

const result = window.HGAhaMusic.buildIndex(
  {
    artistPlaceRelations: [
      { artistId: "aha", artistName: "a-ha", historyGoPlaceId: "oslo", relationType: "formed_in", confidence: 0.98, status: "verified", spotifyArtistId: "spotify-aha" },
      { artistName: "Navnløs", historyGoPlaceId: "oslo", status: "auto_matched" },
      { artistId: "reject", artistName: "Rejected", historyGoPlaceId: "oslo", status: "rejected" },
      { artistId: "noplace", artistName: "No place", status: "verified" }
    ]
  },
  {
    trackPlaceRelations: [
      { trackId: "take-on-me", trackTitle: "Take on Me", artistId: "aha", artistName: "a-ha", historyGoPlaceId: "oslo", relationType: "through_artist", confidence: 0.9, status: "auto_matched" },
      { trackId: "suggested", trackTitle: "Maybe", artistName: "a-ha", historyGoPlaceId: "oslo", status: "suggested" },
      { trackId: "noplace-track", trackTitle: "No Place", status: "verified" }
    ]
  }
);
window.HGAhaMusic.state.musicByPlace = result.musicByPlace;
window.HG_MUSIC_BY_PLACE = result.musicByPlace;

const unlocks = window.HGAhaMusic.getUnlockableObjectsForPlace("oslo");
assert.equal((result.musicByPlace.oslo.artists.length + result.musicByPlace.oslo.tracks.length), 5, "audit sees all valid-place bridge relations");
assert.equal(unlocks.artists.length, 2, "verified/auto matched artists become unlockable");
assert.equal(unlocks.tracks.length, 1, "verified/auto matched tracks become unlockable");
assert.equal(result.candidates.artists.length, 1, "artist without valid placeId is not indexed as unlockable");
assert.equal(result.candidates.tracks.length, 1, "track without valid placeId is not indexed as unlockable");
assert.equal(unlocks.artists[0].id, "music_artist__oslo__aha", "artist id is stable");
assert.equal(unlocks.tracks[0].id, "music_track__oslo__take-on-me", "track id is stable");
assert.equal(unlocks.artists[1].id, "music_artist__oslo__name_navnlos", "missing artistId falls back to normalized name");

const first = window.HGAhaMusic.unlockMusicObject(unlocks.artists[0]);
assert.equal(first.changed, true, "first unlock stores object");
assert.equal(window.HGAhaMusic.isMusicObjectUnlocked(unlocks.artists[0].id), true, "stored object is readable");
assert.equal(updateProfileEvents, 1, "new unlock dispatches updateProfile");

const second = window.HGAhaMusic.unlockMusicObject(unlocks.artists[0]);
assert.equal(second.changed, false, "duplicate unlock does not double count");
assert.equal(window.HGAhaMusic.getUnlockedMusicObjects().length, 1, "duplicate unlock keeps one stored row");
assert.equal(updateProfileEvents, 1, "duplicate unlock does not dispatch updateProfile again");

const summary = window.HGAhaMusic.getMusicUnlockSummary();
assert.equal(JSON.stringify(summary), JSON.stringify({ total: 1, artists: 1, tracks: 0, places: 1 }));
console.log("AHA Music unlock audit: ok");
