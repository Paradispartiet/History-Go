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

test("version 4 place index requires canonical historical evidence counts", async () => {
  const dom = new JSDOM("<!doctype html>", { runScripts: "outside-only", url: "https://history-go.test/" });
  const w = dom.window;
  let attempts = 0;
  w.fetch = async (url) => {
    if (String(url).includes("epoke-place-index.json")) {
      attempts += 1;
      const base = {
        version: 4,
        contract: "source-backed-history-coverage-v1",
        domains: { historie: {} },
        locations: { contract: "canonical-place-geography-v1", places: {}, countries: [] }
      };
      return { ok: true, status: 200, json: async () => attempts === 1 ? base : ({ ...base, stats: { canonical_claim_count: 315, place_evidence_link_count: 325 } }) };
    }
    return { ok: true, status: 200, json: async () => ({ domain: "historie", epoker: [] }) };
  };
  w.eval(runtimeSource);
  await w.HGEpokerRuntime.ready;

  assert.equal(await w.HGEpokerRuntime.loadPlaceIndex(), null);
  const recovered = await w.HGEpokerRuntime.loadPlaceIndex();
  assert.equal(attempts, 2);
  assert.equal(recovered.contract, "source-backed-history-coverage-v1");
  dom.window.close();
});

test("version 5 place index requires an exhaustive Oslo coverage contract", async () => {
  const dom = new JSDOM("<!doctype html>", { runScripts: "outside-only", url: "https://history-go.test/" });
  const w = dom.window;
  let attempts = 0;
  w.fetch = async (url) => {
    if (String(url).includes("epoke-place-index.json")) {
      attempts += 1;
      const base = {
        version: 5,
        contract: "source-backed-history-coverage-v1",
        stats: { canonical_claim_count: 315, place_evidence_link_count: 325 },
        domains: { historie: {} },
        locations: { contract: "canonical-place-geography-v1", places: {}, countries: [] }
      };
      const coverage = {
        contract: "oslo-history-coverage-v1",
        canonical_place_count: 1,
        dated_evidence_place_count: 1,
        documented_case_place_count: 0,
        awaiting_source_backed_history_count: 0,
        categories: [{ category: "historie", total: 1 }],
        places: [{ place_id: "a", status: "dated_evidence" }]
      };
      return { ok: true, status: 200, json: async () => attempts === 1 ? base : ({ ...base, domains: { historie: { oslo_coverage: coverage } } }) };
    }
    return { ok: true, status: 200, json: async () => ({ domain: "historie", epoker: [] }) };
  };
  w.eval(runtimeSource);
  await w.HGEpokerRuntime.ready;

  assert.equal(await w.HGEpokerRuntime.loadPlaceIndex(), null);
  const recovered = await w.HGEpokerRuntime.loadPlaceIndex();
  assert.equal(attempts, 2);
  assert.equal(recovered.domains.historie.oslo_coverage.contract, "oslo-history-coverage-v1");
  dom.window.close();
});

test("canonical History period coverage is lazy, validated and retryable", async () => {
  const dom = new JSDOM("<!doctype html>", { runScripts: "outside-only", url: "https://history-go.test/" });
  const w = dom.window;
  let guideAttempts = 0;
  w.fetch = async (url) => {
    const path = String(url);
    if (path.includes("period_guides_historie_v1.json")) {
      guideAttempts += 1;
      if (guideAttempts === 1) return { ok: false, status: 503 };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          subject_id: "historie",
          status: "editorially_complete",
          guides: Array.from({ length: 9 }, (_, index) => ({ period_id: `period_${index}` })),
          orientation_sources: []
        })
      };
    }
    if (path.includes("period_modules_historie_v1.json")) {
      return { ok: true, status: 200, json: async () => ({ subject_id: "historie", status: "evidence_ready", modules: [], sources: [], cases: [] }) };
    }
    return { ok: true, status: 200, json: async () => ({ domain: "historie", epoker: [] }) };
  };
  w.eval(runtimeSource);
  await w.HGEpokerRuntime.ready;

  assert.equal(await w.HGEpokerRuntime.loadHistoryCoverage(), null);
  const recovered = await w.HGEpokerRuntime.loadHistoryCoverage();
  assert.equal(guideAttempts, 2);
  assert.equal(recovered.contract, "canonical-history-period-coverage-v1");
  assert.equal(w.HG_EPOKE_HISTORY_COVERAGE, recovered);
  dom.window.close();
});
