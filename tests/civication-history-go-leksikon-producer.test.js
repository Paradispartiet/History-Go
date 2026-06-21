#!/usr/bin/env node
// Verifies the read_leksikon producer helper: HGLeksikon.leksikonReadRecordsForPlace derives
// the HGReads.recordLeksikon payloads (category, emne, place) from a place. The Civication
// bridge later matches these for read_leksikon tasks.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const leksikonPath = path.join(root, "js/leksikon/leksikon_loader.js");

global.window = global;
global.console = { ...console, warn() {}, error() {} };
global.document = {
  addEventListener() {},
  removeEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  readyState: "complete"
};
global.PLACES = [];

vm.runInThisContext(fs.readFileSync(leksikonPath, "utf8"), { filename: leksikonPath });

const HGLeksikon = global.HGLeksikon;
assert(HGLeksikon && typeof HGLeksikon.leksikonReadRecordsForPlace === "function", "helper exposed");

// place with category + emne_ids
{
  const recs = HGLeksikon.leksikonReadRecordsForPlace(
    { category: "litteratur", emne_ids: ["e1", "e2"] },
    "ibsen_museet"
  );
  // base place record + one per emne
  assert.strictEqual(recs.length, 3, "place + two emne records");
  const base = recs.find((r) => r.leksikonId === "ibsen_museet");
  assert.ok(base && base.categoryId === "litteratur", "base keyed by place, carries category");
  const e1 = recs.find((r) => r.leksikonId === "e1");
  assert.ok(e1 && e1.emneId === "e1" && e1.categoryId === "litteratur", "emne record has emne + category");
}

// place without emne_ids -> just the base record
{
  const recs = HGLeksikon.leksikonReadRecordsForPlace({ category: "kunst" }, "nasjonalgalleriet");
  assert.strictEqual(recs.length, 1, "only base record");
  assert.strictEqual(recs[0].categoryId, "kunst", "category recorded");
}

// no place id and no category -> nothing
{
  const recs = HGLeksikon.leksikonReadRecordsForPlace({}, "");
  assert.strictEqual(recs.length, 0, "nothing to record");
}

console.log("hg leksikon producer ok");
