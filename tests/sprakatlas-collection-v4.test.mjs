import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));
const text = value => String(value == null ? "" : value).trim();

const runtime = read("js/ui/sprakatlas-collection-v4.js");
const config = read("js/config.js");
const language = read("js/ui/place-language-layer.js");
const workflow = read(".github/workflows/language-layer-checks.yml");
const docs = read("docs/SPRAKATLAS_COLLECTION_V4.md");
const ahaSchema = json("AHA/contracts/aha_import_payload_v1.schema.json");
const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
const manifest = json("data/leksikon/sprak/manifest.json");

function linkedLocalIds() {
  const ids = new Set();
  for (const relative of Object.values(manifest.place_files || {})) {
    const article = json(relative);
    for (const id of article.atlas_local_ids || []) ids.add(text(id));
  }
  return ids;
}

test("Språkatlas collection v4 is paced after map v3 and before the popup tail", () => {
  assert.match(
    config,
    /js\/ui\/sprakatlas-map-experience-v3\.js[\s\S]{0,120}js\/ui\/sprakatlas-collection-v4\.js[\s\S]{0,120}js\/ui\/place-popup-direct-tabs\.js/
  );
});

test("atlas evidence collection is an explicit click action only", () => {
  assert.match(runtime, /data-sprakatlas-collect-evidence/);
  assert.match(runtime, /document\.addEventListener\("click"/);
  assert.match(runtime, /if \(collectButton\) \{[\s\S]{0,120}handleCollect\(collectButton\)/);
  const calls = runtime.match(/collectFeatureEvidence\(/g) || [];
  assert.equal(calls.length, 2, "collectFeatureEvidence must only be defined and called from explicit handling");
  assert.doesNotMatch(runtime, /MutationObserver[\s\S]{0,300}collectFeatureEvidence\(/);
});

test("v4 writes only to canonical Knowledge V2 and does not invent a language store", () => {
  assert.match(runtime, /const KNOWLEDGE_KEY = "hg_knowledge_entries_v2"/);
  assert.match(runtime, /HGKnowledgeV2\?\.getEntries/);
  assert.match(runtime, /localStorage\?\.setItem\(KNOWLEDGE_KEY/);
  const storageCalls = [...runtime.matchAll(/localStorage\?\.(?:getItem|setItem)\(([^,)]+)/g)]
    .map(match => match[1].trim());
  assert.deepEqual([...new Set(storageCalls)], ["KNOWLEDGE_KEY"]);
  assert.match(runtime, /collection_kind: COLLECTION_KIND/);
  assert.match(runtime, /const COLLECTION_KIND = "language"/);
});

test("subject ids are canonical History Go subjects and never a fabricated sprak subject", () => {
  assert.match(runtime, /HGKnowledgeV2\?\.SUBJECT_LABELS/);
  assert.match(runtime, /canonicalSubjectIds\(\)\.has\(resolved\)/);
  assert.match(runtime, /raw === "sprak"/);
  assert.match(runtime, /resolved === "sprak"/);
  assert.doesNotMatch(runtime, /subject_id:\s*["']sprak["']/);
  assert.doesNotMatch(runtime, /fagkart_category_id:\s*["']sprak["']/);
});

test("stable identity and provenance are bound to atlas profile plus feature evidence", () => {
  assert.match(runtime, /ku_atlas_\$\{slug\(profile\?\.id\)/);
  assert.match(runtime, /feature_evidence_id/);
  assert.match(runtime, /atlas_profile_id/);
  assert.match(runtime, /source_urls/);
  assert.match(runtime, /time_scope/);
  assert.match(runtime, /evidence_last_verified/);
  assert.match(runtime, /geographic_scope/);
  assert.match(runtime, /place_ids/);
  assert.match(runtime, /owner: "local_varieties\.feature_evidence"/);
  assert.match(runtime, /atlas_owner_preserved: true/);

  for (const profile of atlas.local_varieties || []) {
    const ids = (profile.feature_evidence || []).map(row => text(row.id));
    assert.equal(new Set(ids).size, ids.length, `${profile.id}: feature_evidence ids must be stable and unique inside the profile`);
  }
});

test("repeated collection dedupes before the canonical store write", () => {
  assert.match(runtime, /text\(row\?\.knowledge_unit_id\) === text\(entry\.knowledge_unit_id\)/);
  assert.match(runtime, /text\(row\?\.source\?\.atlas_profile_id\).*text\(entry\?\.source\?\.atlas_profile_id\)/s);
  assert.match(runtime, /if \(existing\) return existing/);
  assert.match(runtime, /const next = \[\.\.\.rows, entry\]/);
});

test("documented_seed stays research-only and cannot gain constructed collection content", () => {
  const linked = linkedLocalIds();
  const seeds = (atlas.local_varieties || []).filter(row => row.profile_status === "documented_seed");
  assert.ok(seeds.length >= 1, "expected documented_seed research queue");
  for (const seed of seeds) {
    assert.equal((seed.feature_evidence || []).length, 0, `${seed.id}: documented_seed must not carry feature_evidence filler`);
    assert.equal(linked.has(text(seed.id)), false, `${seed.id}: documented_seed must not gain a constructed Place relation`);
  }
  assert.match(runtime, /profile_status\) !== "evidence_materialized"/);
});

test("every evidence_materialized profile remains explicitly place-linked before collection", () => {
  const linked = linkedLocalIds();
  const materialized = (atlas.local_varieties || []).filter(row => row.profile_status === "evidence_materialized");
  assert.ok(materialized.length >= 1);
  for (const profile of materialized) {
    assert.ok((profile.feature_evidence || []).length >= 1, `${profile.id}: expected canonical evidence`);
    assert.equal(linked.has(text(profile.id)), true, `${profile.id}: collection context must come from an explicit Place relation`);
  }
  assert.match(runtime, /atlas_local_ids/);
});

test("dialect ownership stays in the atlas or an area Place, never a concrete Place", () => {
  assert.match(language, /slug\(context\.place\?\.placeScope\) !== "area"/);
  assert.match(language, /slug\(place\?\.placeScope\) === "area"/);
  assert.match(runtime, /owner: "local_varieties\.feature_evidence"/);
  assert.doesNotMatch(runtime, /placeScope\s*[:=]\s*["']area["']/);
});

test("AHA continues to receive atlas collections through the existing Knowledge V2 boundary", () => {
  assert.equal(ahaSchema.properties?.hg_knowledge_entries_v2?.type, "array");
  assert.equal(ahaSchema.properties?.hg_knowledge_entries_v2?.items?.type, "object");
  assert.match(runtime, /hg_knowledge_entries_v2/);
  assert.doesNotMatch(runtime, /aha_import_payload|AHA.*export|sprakatlas.*export/i);
});

test("language CI owns v4 syntax and permanent regression checks", () => {
  assert.match(workflow, /js\/ui\/sprakatlas-collection-v4\.js/);
  assert.match(workflow, /node --check js\/ui\/sprakatlas-collection-v4\.js/);
  assert.match(workflow, /tests\/sprakatlas-collection-v4\.test\.mjs/);
  assert.match(workflow, /tests\/place-language-dialect-scope\.test\.mjs/);
  assert.match(docs, /Språkatlas → samling v4/);
  assert.match(docs, /hg_knowledge_entries_v2/);
});
