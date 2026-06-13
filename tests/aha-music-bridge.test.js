const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("js/integrations/aha-music.js", "utf8");
const window = {};
vm.runInNewContext(source, { window, console, CustomEvent: class {} });

const result = window.HGAhaMusic.buildIndex(
  {
    artistPlaceRelations: [
      {
        artistId: "artist-1",
        artistName: "a-ha",
        historyGoPlaceId: "oslo",
        relationType: "formed_in",
        confidence: 0.98,
        status: "verified"
      },
      { artistId: "candidate", artistName: "Kandidat" }
    ]
  },
  {
    trackPlaceRelations: [
      {
        trackId: "track-1",
        trackTitle: "Take on Me",
        artistId: "artist-1",
        artistName: "a-ha",
        place_id: "oslo",
        relation_type: "through_artist",
        match_confidence: 0.82,
        match_status: "automatic"
      }
    ]
  }
);

assert.equal(result.counts.artistRelations, 2);
assert.equal(result.counts.trackRelations, 1);
assert.equal(result.candidates.artists.length, 1);
assert.equal(result.candidates.tracks.length, 0);
assert.deepEqual(Object.keys(result.musicByPlace), ["oslo"]);
assert.equal(result.musicByPlace.oslo.artists[0].artistName, "a-ha");
assert.equal(result.musicByPlace.oslo.tracks[0].trackTitle, "Take on Me");
assert.deepEqual(
  [...result.musicByPlace.oslo.relationTypes].sort(),
  ["formed_in", "through_artist"]
);
assert.equal(result.musicByPlace.oslo.confidenceSummary.average, 0.9);

console.log("AHA Music bridge index: ok");
