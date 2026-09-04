import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");

test("Place production checklist requires QuizCard flip support", () => {
  assert.match(checklist, /hvert nytt eller fullprodusert ordinært Place skal ha et dedikert QuizCard/);
  assert.match(checklist, /flippe fra `frontImage` til quizkortet/);
  assert.match(checklist, /Eksisterende aktive, arkiverte og alternative quizfiler auditeres før profilvalg/);
  assert.match(checklist, /eksisterende `bilder\/QuizCards\/\*\*`/);
  assert.match(checklist, /Et eksisterende godt QuizCard gjenbrukes/);
  assert.match(checklist, /`bilder\/QuizCards\/\*\*` er kun QuizCard\/flip-support/);
  assert.match(checklist, /manglende QuizCard, manglende runtime-binding eller en flip som ikke virker/);
  assert.match(checklist, /flip PlaceCard fra `frontImage` til QuizCard og tilbake på faktisk PR-head/);
});
