import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const json = file => JSON.parse(read(file));
const rows = value => Array.isArray(value) ? value : [];
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const text = value => String(value == null ? "" : value).trim();

const payloadDir = path.join(root, "data/runtime/place-open");
const payloads = fs.readdirSync(payloadDir)
  .filter(name => name.endsWith(".json"))
  .sort()
  .map(name => json(path.join("data/runtime/place-open", name)))
  .filter(payload => payload?.schema === "history-go-place-open-v1" && payload?.place?.id);

const isMicro = payload => text(payload?.place?.placeTier).toLowerCase() === "micro"
  || Object.keys(object(payload?.place?.micro_place_profile)).length > 0;
const category = payload => text(payload?.place?.category || payload?.place?.categoryId).toLowerCase();
const complete = payload => text(payload?.place?.production_status).toLowerCase() === "complete";
const collections = payload => {
  const profile = object(payload?.place?.place_card_profile);
  const value = rows(profile.collection_ids).length ? rows(profile.collection_ids) : rows(payload?.place?.rounds);
  return value.map(text).filter(Boolean);
};
const hasObject = value => Object.keys(object(value)).length > 0;
const standardCompleteWithFour = payload => !isMicro(payload) && complete(payload) && collections(payload).length === 4;

function choose(label, predicate, score = () => 0) {
  const candidates = payloads.filter(predicate).sort((a, b) => score(b) - score(a));
  assert.ok(candidates.length, `Final Place Sheet acceptance requires a real ${label} representative`);
  return candidates[0];
}

function richness(payload) {
  return rows(payload.people).length
    + rows(payload.brands).length
    + rows(payload.stories).length * 4
    + rows(payload.leksikon).length * 3
    + rows(payload.lesespor).length * 3
    + (payload.language ? 8 : 0)
    + (hasObject(payload?.place?.fagverk) ? 8 : 0)
    + (hasObject(payload?.place?.for_na) ? 5 : 0);
}

const matrix = {
  standardBy: choose("standard By", payload => standardCompleteWithFour(payload) && category(payload) === "by", richness),
  historie: choose("Historie", payload => standardCompleteWithFour(payload) && ["historie", "historisk"].includes(category(payload)), richness),
  natur: choose("Natur", payload => standardCompleteWithFour(payload) && (category(payload) === "natur" || hasObject(payload?.place?.nature_profile)), richness),
  sport: choose("Sport with training", payload => standardCompleteWithFour(payload)
    && ["sport", "trening"].includes(category(payload))
    && hasObject(payload?.place?.training_profile), richness),
  richKnowledge: choose("rich knowledge", payload => standardCompleteWithFour(payload)
    && rows(payload.leksikon).length > 0
    && rows(payload.stories).length > 0
    && rows(payload.lesespor).length > 0
    && Boolean(payload.language)
    && hasObject(payload?.place?.fagverk), richness),
  beforeAfter: choose("Before/after", payload => standardCompleteWithFour(payload) && hasObject(payload?.place?.for_na), richness),
  productionGap: choose("production gap", payload => !isMicro(payload) && !complete(payload)),
  micro: choose("Micro", payload => isMicro(payload), richness)
};

console.log("Place Sheet final representative matrix:", Object.fromEntries(
  Object.entries(matrix).map(([key, payload]) => [key, payload.place.id])
));

test("representative standard profiles retain exactly four canonical collections", () => {
  for (const [label, payload] of Object.entries(matrix)) {
    if (["productionGap", "micro"].includes(label)) continue;
    const ids = collections(payload);
    assert.equal(payload.place.production_status, "complete", `${label} is canonically complete`);
    assert.equal(ids.length, 4, `${label} keeps exactly four collections`);
    assert.equal(new Set(ids).size, 4, `${label} collection ids are unique`);
    assert.equal(ids.some(id => id.toLowerCase() === "related"), false, `${label} never uses Related as a collection`);
  }
});

test("rich knowledge representative carries the owner data required by the full dossier", () => {
  const payload = matrix.richKnowledge;
  assert.ok(rows(payload.leksikon).length > 0, "Leksikon owner data present");
  assert.ok(rows(payload.stories).length > 0, "Stories owner data present");
  assert.ok(rows(payload.lesespor).length > 0, "Lesespor owner data present");
  assert.ok(payload.language, "Språk owner data present");
  assert.ok(hasObject(payload.place.fagverk), "Fagverk place content present");
  assert.ok(text(payload.place.popupDesc || payload.place.desc || payload.place.description), "About copy present");
  const sourceSignals = rows(payload.place.externalLinks).length
    + rows(payload.place?.source_summary?.safe_sources).length
    + rows(payload.place?.sourceSummary?.safe_sources).length;
  assert.ok(sourceSignals > 0 || rows(payload.leksikon).some(article => rows(article.externalLinks).length || rows(article.sources).length), "source-backed content present");
});

test("special profile representatives expose canonical Nature and Sport owner inputs", () => {
  assert.ok(category(matrix.natur) === "natur" || hasObject(matrix.natur.place.nature_profile));
  assert.ok(["sport", "trening"].includes(category(matrix.sport)));
  const training = object(matrix.sport.place.training_profile);
  assert.ok(text(training.summary) || text(training.safety) || rows(training.exercises).length > 0, "Sport representative has real training content");
});

test("Before/after representative contains actual comparison material", () => {
  const data = object(matrix.beforeAfter.place.for_na);
  const signals = [data.before, data.now, data.change, data.beforeImage, data.before_image, data.nowImage, data.now_image]
    .map(text).filter(Boolean);
  assert.ok(signals.length >= 2, "Before/after has at least two canonical comparison signals");
});

test("production gaps and Micro remain honest exceptions rather than synthetic full Places", () => {
  assert.notEqual(text(matrix.productionGap.place.production_status).toLowerCase(), "complete");
  assert.equal(isMicro(matrix.productionGap), false);
  assert.equal(isMicro(matrix.micro), true);
  assert.ok(hasObject(matrix.micro.place.micro_place_profile) || text(matrix.micro.place.placeTier).toLowerCase() === "micro");
});

test("final source contract keeps automatic rendering, cancellation and Phase 7 direct routing", () => {
  const queue = read("js/ui/place-sheet/place-sheet-render-queue.ts");
  const state = read("js/ui/place-sheet/place-sheet-state.ts");
  const unified = read("js/ui/place-unified-surface.ts");
  const shell = read("js/ui/place-sheet/place-sheet-shell.ts");

  assert.match(shell, /startAutomaticPlaceSheetRender\(text\(place\.id\)\)/);
  assert.match(state, /AbortController/);
  assert.match(queue, /markPlaceSheetPhase\(generation, placeId, "full-ready"\)/);
  assert.doesNotMatch(queue, /IntersectionObserver/);
  assert.doesNotMatch(queue, /addEventListener\(["']scroll/);
  assert.doesNotMatch(queue, /data-place-tab/);
  assert.match(unified, /phase:\s*7/);
  assert.match(unified, /directStandardPlaces:\s*true/);
  assert.match(unified, /if \(isMicro\(canonical\)\) return current\.apply/);
  assert.doesNotMatch(unified, /pcUnifiedKnowledgeHost|hg-unified-renderer-embedded|hg-unified-place-staging/);
});
