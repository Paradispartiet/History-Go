import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const runtimeSource = fs.readFileSync("js/epoker-runtime.js", "utf8");

test("place index failures remain retryable and do not poison the runtime cache", async () => {
  const dom = new JSDOM("<!doctype html>", { runScripts: "outside-only", url: "https://history-go.test/" });
  const w = dom.window;
  let placeIndexAttempts = 0;
  w.fetch = async (url) => {
    if (String(url).includes("epoke-place-index.json")) {
      placeIndexAttempts += 1;
      if (placeIndexAttempts === 1) return { ok: false, status: 503 };
      return { ok: true, status: 200, json: async () => ({ version: 2, domains: { historie: { epochs: {} } } }) };
    }
    return { ok: true, status: 200, json: async () => ({ domain: "historie", epoker: [] }) };
  };
  w.eval(runtimeSource);
  await w.HGEpokerRuntime.ready;

  assert.equal(await w.HGEpokerRuntime.loadPlaceIndex(), null);
  const recovered = await w.HGEpokerRuntime.loadPlaceIndex();
  assert.equal(placeIndexAttempts, 2);
  assert.equal(recovered.version, 2);
  assert.equal(w.HG_EPOKE_PLACE_INDEX, recovered);
  dom.window.close();
});

test("version 3 place index requires the geography contract", async () => {
  const dom = new JSDOM("<!doctype html>", { runScripts: "outside-only", url: "https://history-go.test/" });
  const w = dom.window;
  let placeIndexAttempts = 0;
  w.fetch = async (url) => {
    if (String(url).includes("epoke-place-index.json")) {
      placeIndexAttempts += 1;
      if (placeIndexAttempts === 1) return { ok: true, status: 200, json: async () => ({ version: 3, domains: { historie: {} } }) };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          version: 3,
          domains: { historie: {} },
          locations: { contract: "canonical-place-geography-v1", places: {}, countries: [] }
        })
      };
    }
    return { ok: true, status: 200, json: async () => ({ domain: "historie", epoker: [] }) };
  };
  w.eval(runtimeSource);
  await w.HGEpokerRuntime.ready;

  assert.equal(await w.HGEpokerRuntime.loadPlaceIndex(), null);
  const recovered = await w.HGEpokerRuntime.loadPlaceIndex();
  assert.equal(placeIndexAttempts, 2);
  assert.equal(recovered.locations.contract, "canonical-place-geography-v1");
  dom.window.close();
});
