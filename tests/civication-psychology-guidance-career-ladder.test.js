#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const Resolver = require("../js/Civication/systems/civicationCareerRoleResolver.js");
const Content = require("../js/Civication/lifestory/lifestoryContent.js");

const badge = readJson("data/badges/psykologi.json");
const evidence = readJson("data/Civication/psychologyGuidanceEvidence.json");
const grammar = readJson("data/Civication/workGrammars/psykologi/psykologi_arbeids_og_karriereveiledning.json");
const canonicalModel = readJson("data/Civication/roleModels/psykologi/psykologi_arbeids_og_karriereveiledning.json");
const manifest = readJson("data/Civication/lifestory/manifest.json");

const EXPECTED = [
  ["Veileder", 40],
  ["Rådgiver", 60],
  ["Seniorrådgiver", 85]
];
const SCOPE = "psykologi_arbeids_og_karriereveiledning";
const ROLE_ID = "psykologi_karriereveileder";

// 1. Canonical badge thresholds stay stable, but their job meaning is no longer generic.
for (const [label, threshold] of EXPECTED) {
  const tier = badge.tiers.find((t) => t.label === label);
  assert.ok(tier, `Psykologi mangler tier ${label}`);
  assert.strictEqual(tier.threshold, threshold, `${label} beholder threshold ${threshold}`);
  assert.strictEqual(tier.career_offer?.policy, "direct", `${label} er fortsatt en direkte, ikke-regulert jobbport`);

  const active = { career_id: "psykologi", title: label, threshold };
  assert.strictEqual(Resolver.resolveCareerRoleScope(active), SCOPE, `${label} routes til shared guidance scope`);
  assert.strictEqual(Resolver.resolveCareerRoleId(active), ROLE_ID, `${label} routes til representative role id`);
}

// 2. Evidence is machine-readable and explicitly excludes clinical authority.
assert.deepStrictEqual(evidence.canonical_badge_titles, EXPECTED.map(([label]) => label));
assert.strictEqual(evidence.canonical_role_scope, SCOPE);
for (const ref of ["utdanning_jobbveileder", "utdanning_karriereveileder"]) {
  assert.ok(evidence.sources[ref]?.url?.startsWith("https://utdanning.no/"), `kilde ${ref} er materialisert`);
}
const evidenceBoundary = JSON.stringify(evidence.scope_boundary.may_not || []).toLowerCase();
for (const forbidden of ["diagnost", "psykoterapi", "klinisk", "sensitive opplysninger", "bestemme utdannings- eller karrierevalg"]) {
  assert.ok(evidenceBoundary.includes(forbidden), `evidence-grensen dekker ${forbidden}`);
}

// 3. Shared role model + FWG encode one work family, not three duplicated fantasies.
assert.strictEqual(canonicalModel.role_scope, SCOPE);
assert.strictEqual(canonicalModel.role_id, ROLE_ID);
assert.strictEqual(grammar.role_scope, SCOPE);
assert.strictEqual(grammar.role_id, ROLE_ID);
assert.deepStrictEqual(grammar.badge_binding.badge_titles, EXPECTED.map(([label]) => label));
assert.ok(grammar.story_world.practice_stories === undefined, "practice stories ligger på grammar-root etter schema-kontrakten");
assert.ok(Array.isArray(grammar.practice_stories) && grammar.practice_stories.length >= 4, "FWG har minst fire praksisfortellinger");
const grammarBoundary = JSON.stringify(grammar.authority_boundary.may_not || []).toLowerCase();
assert.ok(/diagnos/.test(grammarBoundary), "FWG forbyr diagnostikk");
assert.ok(grammarBoundary.includes("psykoterapi"), "FWG forbyr psykoterapi");
assert.ok(grammarBoundary.includes("bestemme utdanning eller jobb"), "FWG forbyr å overta valget");

for (const [legacyFile, tierLabel] of [["veileder.json", "Veileder"], ["radgiver.json", "Rådgiver"], ["seniorradgiver.json", "Seniorrådgiver"]]) {
  const model = readJson(`data/Civication/roleModels/psykologi/${legacyFile}`);
  assert.strictEqual(model.source.tier_label, tierLabel);
  assert.strictEqual(model.role_scope, SCOPE, `${tierLabel} legacy roleModel peker til canonical scope`);
  assert.ok(model.source.evidence_file?.includes("psychologyGuidanceEvidence"), `${tierLabel} har eksplisitt evidensfil`);
  const boundary = JSON.stringify(model.scope_boundary?.cannot || []).toLowerCase();
  assert.ok(/diagnos/.test(boundary), `${tierLabel} har klinisk grense`);
}

// 4. One active Life Story package serves all three tiers and passes the real content validator.
const lifeEntry = manifest.roles[SCOPE];
assert.ok(lifeEntry, "Life Story manifest har guidance-scope");
assert.strictEqual(lifeEntry.badge_id, "psykologi");
assert.deepStrictEqual(lifeEntry.badge_titles, EXPECTED.map(([label]) => label));
const raw = {
  role: readJson(lifeEntry.role),
  phaseDefinitions: readJson(manifest.shared.phaseDefinitions),
  roleThreads: readJson(lifeEntry.threads),
  roleScenes: readJson(lifeEntry.scenes),
  lifeThreads: readJson(manifest.life.threads),
  lifeScenes: readJson(manifest.life.scenes)
};
const content = Content.buildContent(raw);
assert.strictEqual(content.role.id, SCOPE);
assert.ok(raw.roleThreads.threads.length >= 5, "guidance Life Story har minst fem arbeidstråder");
assert.ok(raw.roleScenes.scenes.length >= 5, "guidance Life Story har minst fem arbeidsscener");
assert.ok(raw.roleScenes.scenes.some((s) => s.dag === 2), "guidance Life Story har reell dag-2-progresjon");
for (const [personId, navn] of [["venn", "Jonas"], ["familie", "Søsteren din"]]) {
  const person = raw.role.personer.find((p) => p.id === personId);
  assert.strictEqual(person?.navn, navn, `shared Life Story cast ${personId} er bevart`);
  assert.strictEqual(typeof raw.role.startState.relasjoner[personId], "number", `startrelasjon ${personId} finnes`);
}

// 5. Psychology remains fail-closed above this non-clinical family.
const psychologist = badge.tiers.find((t) => t.label === "Psykolog");
assert.strictEqual(psychologist?.career_offer?.policy, "authorization_required");
assert.ok(psychologist.career_offer.qualification_ids.includes("no_psychologist_authorization_or_license"));
assert.strictEqual(Resolver.resolveCareerRoleScope({ career_id: "psykologi", title: "Psykolog" }), "unknown",
  "Psykolog arver ikke veilednings-scope og må fortsatt håndteres av kvalifikasjonsporten");

console.log("civication psychology guidance career ladder ok (3 tiers -> 1 documented non-clinical work family)");
