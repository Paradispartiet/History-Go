import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const json = relative => JSON.parse(read(relative));
const sha256 = value => crypto.createHash("sha256").update(value, "utf8").digest("hex");

const languagePath = "data/leksikon/sprak/places/europe/norway/oslo/birkelunden.json";
const language = json(languagePath);
const manifest = json("data/leksikon/sprak/manifest.json");
const place = json("data/places/by/oslo/places/birkelunden.json");
const runtime = read("js/ui/place-language-layer.js");
const contract = read("docs/SPRAKLEKSIKON.md");

test("Birkelunden har et avgrenset Språkleksikon med to navnespor", () => {
  assert.equal(language.place_id, "birkelunden");
  assert.equal(language.title, "Språkleksikon: Birkelunden");
  assert.equal(language.verified_at, "2026-08-23");
  assert.equal(language.entries.length, 2);
  assert.deepEqual(language.entries.map(entry => entry.id), [
    "birkelunden_name_current",
    "birkelunden_name_bjerkelunden_1926_1955"
  ]);

  const current = language.entries[0];
  assert.equal(current.term, "Birkelunden");
  assert.equal(current.type, "stedsnavn");
  assert.equal(current.layer, "language");
  assert.equal(current.status, "current");
  assert.match(current.meaning, /Bjerkelunden.*1926.*1955/);
  assert.match(current.etymology, /dansk.*birk.*bjørk.*Bjørkelunden/i);
  assert.equal(current.linked_to?.id, "birkelunden");
  assert.deepEqual(current.sources.map(source => source.url), [
    "https://oslobyleksikon.no/index.php/Birkelunden",
    "https://snl.no/Birkelunden"
  ]);

  const historical = language.entries[1];
  assert.equal(historical.term, "Bjerkelunden");
  assert.equal(historical.type, "historisk_navn");
  assert.equal(historical.layer, "language");
  assert.equal(historical.status, "historical");
  assert.equal(historical.historical_period, "1926–1955");
  assert.match(historical.context, /fornorsket.*1926.*rettskrivningen av 1917.*1955/i);
  assert.equal(historical.linked_to?.id, "birkelunden");
  assert.equal(historical.sources[0].url, "https://oslobyleksikon.no/index.php/Birkelunden");
});

test("Birkelunden er enkeltstedsspråk og aldri dialekteier", () => {
  assert.notEqual(place.placeScope, "area");
  assert.equal(language.dialect_area, undefined);
  for (const entry of language.entries) {
    assert.notEqual(entry.layer, "dialect");
    assert.notEqual(entry.type, "dialect_feature");
    assert.notEqual(entry.type, "dialekttrekk");
    assert.equal(entry.dialect_area, undefined);
    for (const source of entry.sources || []) {
      assert.match(source.url, /^https:\/\//);
    }
  }
  assert.match(contract, /Enkelt-Places kan ha et rikt Språkleksikon, men ikke et dialektlag/i);
});

test("Birkelunden-språket er registrert hos canonical manifest og synlig via eksisterende runtime", () => {
  assert.equal(manifest.place_files?.birkelunden, languagePath);
  assert.match(runtime, /TAB_ID\s*=\s*"language"/);
  assert.match(runtime, /Språk på stedet/);
  assert.match(runtime, /place_name/);
  assert.match(runtime, /language_history/);
  assert.match(runtime, /hg_knowledge_entries_v2/);
});

test("fase 7H endrer ikke Birkelundens canonical hovedtekst eller parkareal", () => {
  assert.equal(sha256(place.desc), "ea8efd6ab0ed583485b2c87dd28e4dbb9af7766c32381f57e4cb6a54e9d94dbe");
  assert.equal(sha256(place.popupDesc), "670dcbc8e37004fe1c3a595ae6af1a6dcfe304f1048ce906f37df3f7e8544ff7");
  assert.equal(place.spatial_profile?.area_m2, 16300);
  assert.equal(place.temporal_profile?.official_bjerkelunden_name_period, "1926–1955");
});
