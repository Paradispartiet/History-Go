import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { validatePacket } from "../scripts/validate-place-description-production-v4_2.mjs";
import { auditHistoriePlaceProduction } from "../scripts/audit-historie-place-production.mjs";
import { auditNaeringslivPlaceProduction } from "../scripts/audit-naeringsliv-place-production.mjs";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const place = read("data/places/naeringsliv/oslo/places_naeringsliv/schous_bryggeri.json");
const production = read("data/places/production/schous_bryggeri.json");
const runtime = read("data/runtime/place-open/schous_bryggeri.json");
const quiz = read("data/quiz/naeringsliv/schous_bryggeri_sets_merged.json");
const brief = read("data/quiz/production_briefs/naeringsliv/schous_bryggeri.json");
const context = read("data/quiz/production_context/naeringsliv/schous_bryggeri.json");
const audit = read("reports/place-production/schous-bryggeri-phase8-24-gate-audit-v1.json");
const brands = read("data/brands/brands_master.json");
const brandsByPlace = read("data/brands/brands_by_place.json");

const webpDimensions = file => {
  const buffer = fs.readFileSync(path.join(root, file));
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  if (buffer.toString("ascii", 12, 16) === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  throw new Error(`${file}: unexpected WebP encoding`);
};

test("Schous has the exact Næringsliv PlaceCard collections with real previews", () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(runtime.people.map(person => person.id), ["christian_julius_schou"]);
  assert.deepEqual(place.objects.map(object => object.id), ["schous_bryggeri_lastebil_1899"]);
  assert.deepEqual(brandsByPlace.schous_bryggeri, ["schous_bryggeri_historisk"]);
  assert.deepEqual(place.structures.map(structure => structure.id), ["schous_bryggeri_portbygningen"]);
  const brand = brands.find(item => item.id === "schous_bryggeri_historisk");
  for (const asset of [place.frontImage, runtime.people[0].image, place.objects[0].image, brand.logo, place.structures[0].image]) {
    assert.equal(fs.existsSync(path.join(root, asset)), true, asset);
  }
  assert.equal(brand.imageMeta.reviewStatus, "manually_approved");
  assert.equal(brand.imageMeta.generated, false);
  assert.equal(brand.imageMeta.reconstructed, false);
  assert.equal(audit.collections.coverage_percent, 100);
});

test("frontImage is a real portrait derivative with image provenance", () => {
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.outputDimensions, "900x1200");
  assert.match(place.frontImageMeta.sourcePage, /^https:\/\/commons\.wikimedia\.org\//);
  assert.deepEqual(webpDimensions(place.frontImage), { width: 900, height: 1200 });
});

test("identity, dates and materialized popup surfaces are canonical", () => {
  assert.equal(place.year, 1821);
  assert.match(place.desc, /1821/);
  assert.match(place.desc, /1837/);
  assert.match(place.desc, /1873/);
  assert.doesNotMatch(place.desc, /grunnlagt i 1837/i);
  const result = validatePacket({ packet: production, place, packetFile: "data/places/production/schous_bryggeri.json", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(result.issues, []);
  assert.equal(runtime.leksikon.length, 2);
  assert.equal(runtime.language.entries.length, 4);
  assert.equal(runtime.stories.length, 1);
  assert.equal(runtime.stories[0].quality_profile, "episode_v1");
  assert.equal(runtime.stories[0].type, "turning_point");
  assert.equal(runtime.lesespor.length, 4);
  assert.equal(runtime.place.for_na.beforeImage, "bilder/places/schous_bryggeri_1961.webp");
});

test("the reused quiz is canonical rich 5x7 with a normal opening", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(context.profile, "rich_5x7");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.equal(new Set(questions.map(question => question.claim_id)).size, 35);
  assert.ok(questions.slice(0, 14).every(question => question.question_type === "fact" && !question.method_id && !question.thinker_id));
  assert.ok(questions.slice(28).every(question => question.method_id && question.topic_hook_id && question.thinker_id));
  assert.equal(brief.claims.length, 35);
});

test("all three production contracts and the six-part quality gate are blocker-free", () => {
  const historyAudit = auditHistoriePlaceProduction({ root, mode: "all", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(historyAudit.failures, []);
  const subjectAudit = auditNaeringslivPlaceProduction({ root, mode: "all", now: new Date("2026-08-27T12:00:00Z") });
  assert.deepEqual(subjectAudit.failures, []);
  const dimensions = Object.values(audit.quality_score).filter(value => value && typeof value === "object" && "score" in value);
  assert.equal(dimensions.length, 6);
  assert.ok(dimensions.every(dimension => dimension.score >= 4));
  assert.ok(audit.quality_score.total >= 27);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
