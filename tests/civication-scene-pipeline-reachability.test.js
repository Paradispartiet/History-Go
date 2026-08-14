const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

function write(root, relative, content) {
  const target = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}\n`);
}

function listFiles(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else out.push(path.relative(root, full).split(path.sep).join("/"));
    }
  }
  return out.sort();
}

function makeCatalog({ category, roleScope, mailType, familyId, id }) {
  return {
    schema: "civication_mail_family_catalog_v1",
    version: 1,
    category,
    role_scope: roleScope,
    mail_type: mailType,
    families: [
      {
        id: familyId,
        mails: [
          {
            id,
            mail_type: mailType,
            mail_family: familyId,
            role_scope: roleScope,
            subject: `${mailType} subject`,
            summary: `${mailType} summary`,
            situation: [`${mailType} situation`],
            choices: [
              { id: "A", label: "A", effect: 1 },
              { id: "B", label: "B", effect: 0 }
            ]
          }
        ]
      }
    ]
  };
}

(async () => {
  const repoRoot = path.resolve(__dirname, "..");
  const modulePath = path.join(repoRoot, "scripts/audit-civication-scene-pipeline.mjs");
  const { auditRepository, renderMarkdown, validateScene } = await import(pathToFileURL(modulePath).href);

  const validInfoScene = {
    schema: "civication_scene_v1",
    version: 1,
    id: "scene.info.1",
    domain: "work",
    scene_kind: "knowledge",
    delivery: "mail",
    day_phase: "workday",
    arc_stage: "early",
    interaction_mode: "info",
    thread_id: "thread.info.1",
    content: {
      subject: "Informasjon",
      summary: "Kort informasjon",
      situation: ["Dette er en informasjonsscene uten et kunstig valg."]
    },
    choices: [],
    effects: {},
    knowledge_contract: {
      version: 1,
      mode: "none",
      source_refs: [],
      frozen_fields: []
    },
    provenance: {
      adapter: "manual",
      source_path: "fixture/info.json",
      source_id: "fixture.info.1"
    }
  };
  assert.deepEqual(validateScene(validInfoScene), [], "info-scene med null valg skal være lovlig");

  const invalidDecision = {
    ...validInfoScene,
    id: "scene.decision.invalid",
    interaction_mode: "decision",
    choices: []
  };
  assert(validateScene(invalidDecision).some((issue) => issue.code === "decision_requires_two_choices"));

  const invalidInfoChoice = {
    ...validInfoScene,
    id: "scene.info.invalid",
    choices: [
      { id: "A", label: "Ikke et reelt informasjonsvalg", effects: {} }
    ]
  };
  assert(validateScene(invalidInfoChoice).some((issue) => issue.code === "info_must_not_have_choices"));

  const invalidPinnedKnowledge = {
    ...validInfoScene,
    id: "scene.knowledge.invalid",
    knowledge_contract: {
      version: 1,
      mode: "pinned",
      source_refs: ["fagverk:plan"],
      frozen_fields: []
    }
  };
  const pinnedIssues = validateScene(invalidPinnedKnowledge).map((issue) => issue.code);
  assert(pinnedIssues.includes("pinned_knowledge_requires_ruleset_ref"));
  assert(pinnedIssues.includes("pinned_knowledge_requires_ruleset_version"));
  assert(pinnedIssues.includes("pinned_knowledge_requires_frozen_fields"));

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "civication-scene-audit-"));
  try {
    const policy = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/Civication/scenePipelinePolicyV1.json"), "utf8"));
    const contract = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/Civication/sceneContractV1.schema.json"), "utf8"));
    write(fixtureRoot, "data/Civication/scenePipelinePolicyV1.json", policy);
    write(fixtureRoot, "data/Civication/sceneContractV1.schema.json", contract);

    write(fixtureRoot, "js/Civication/systems/civicationMailRuntime.js", `
      (function () {
        const MAIL_TYPES = ["job", "faction_choice", "people", "story", "conflict", "event"];
        const proto = window.CivicationEventEngine?.prototype;
        const originalAnswer = proto.answer;
        proto.answer = async function (eventId, choiceId) {
          return originalAnswer.call(this, eventId, choiceId);
        };
      })();
    `);
    write(fixtureRoot, "js/Civication/systems/civicationDailyMailBuilder.js", `
      const EXTRA_MAIL_TYPES = ["people", "story", "conflict", "event", "faction_choice", "micro", "followup", "knowledge", "consequence"];
      const fallback = { __civi_fallback_choice: true };
    `);

    const plan = {
      schema: "civication_mail_plan_v1",
      id: "fixture_role_v1",
      category: "fixture",
      role_scope: "fixture_role",
      sequence: [
        {
          step: 1,
          type: "knowledge",
          phase: "intro",
          allowed_families: ["fixture_knowledge"],
          fallback_types: ["knowledge", "job"]
        },
        {
          step: 2,
          type: "job",
          phase: "early",
          allowed_families: ["fixture_job"],
          fallback_types: ["job"]
        }
      ]
    };
    write(fixtureRoot, "data/Civication/mailPlans/fixture/fixture_role_plan.json", plan);
    write(
      fixtureRoot,
      "data/Civication/mailFamilies/fixture/knowledge/fixture_role_knowledge.json",
      makeCatalog({
        category: "fixture",
        roleScope: "fixture_role",
        mailType: "knowledge",
        familyId: "fixture_knowledge",
        id: "fixture_knowledge_001"
      })
    );
    write(
      fixtureRoot,
      "data/Civication/mailFamilies/fixture/job/fixture_role_job.json",
      makeCatalog({
        category: "fixture",
        roleScope: "fixture_role",
        mailType: "job",
        familyId: "fixture_job",
        id: "fixture_job_001"
      })
    );
    write(fixtureRoot, "data/Civication/mailDayProgram.json", {
      schema: "civication_mail_day_program_v1",
      reading_model: {
        target_word_count_per_day_min: 8500,
        target_word_count_per_day_max: 12000
      },
      day_structure: {
        phases: [
          { id: "forenoon", mail_slots: [{ slot: "primary", type: "job", count: 4 }] },
          { id: "workday", mail_slots: [{ slot: "main", type: "job", count: 5 }] }
        ]
      },
      daily_mail_volume: {
        target_total_items_per_day_min: 18,
        target_total_items_per_day_max: 26,
        recommended_total_items_per_day: 22
      }
    });

    const before = listFiles(fixtureRoot);
    const fixtureAudit = auditRepository(fixtureRoot);
    const after = listFiles(fixtureRoot);
    assert.deepEqual(after, before, "auditten skal være read-only");

    assert.deepEqual(fixtureAudit.runtime.runtime_mail_types, ["job", "faction_choice", "people", "story", "conflict", "event"]);
    assert(fixtureAudit.runtime.missing_runtime_types.includes("knowledge"));
    assert.equal(fixtureAudit.runtime.answer_wrappers.length, 1);
    assert.equal(fixtureAudit.runtime.generic_fallback_choice_sources.length, 1);

    const fixturePlan = fixtureAudit.plan_reachability.plans.find((row) => row.id === "fixture_role_v1");
    assert(fixturePlan, "fixture-planen skal finnes i auditten");
    const knowledgeStep = fixturePlan.steps.find((step) => step.type === "knowledge");
    const jobStep = fixturePlan.steps.find((step) => step.type === "job");
    assert.equal(knowledgeStep.content_exists, true, "knowledge-innholdet finnes fysisk");
    assert.equal(knowledgeStep.content_loaded, false, "normal runtime laster ikke knowledge-katalogen");
    assert.equal(knowledgeStep.direct_reachable, false);
    assert.equal(knowledgeStep.resolution, "fallback_any_family");
    assert.equal(knowledgeStep.resolved_type, "job");
    assert.equal(knowledgeStep.semantic_substitution, true);
    assert.equal(jobStep.direct_reachable, true);
    assert.equal(jobStep.resolution, "direct");
    assert.equal(fixtureAudit.day_program.budget_conflict, true);
    assert(renderMarkdown(fixtureAudit).includes("Innhold finnes, men lastes ikke"));
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }

  if (fs.existsSync(path.join(repoRoot, "data/Civication/mailPlans/by/by_radgiver_plan_plan.json"))) {
    // Baseline mot faktisk repo: testen skal ikke erklære gjelden løst. Neste
    // migreringsleveranse endrer policy fra observe til gate og oppdaterer disse
    // forventningene til direkte reachability for alle ni typer.
    const actual = auditRepository(repoRoot);
    assert.equal(actual.contract.present, true);
    assert.equal(actual.policy.present, true);
    assert.equal(actual.mode, "observe");
    for (const type of ["job", "knowledge", "micro", "people", "conflict", "followup", "story", "event", "consequence"]) {
      assert(actual.runtime.plan_types.includes(type), `plantype mangler i global inventory: ${type}`);
    }
    for (const type of ["knowledge", "micro", "followup", "consequence"]) {
      assert(actual.runtime.missing_runtime_types.includes(type), `baseline skal oppdage at MailRuntime ikke laster ${type}`);
    }
  
    const areal = actual.plan_reachability.plans.find((row) => row.path.endsWith("/by_radgiver_plan_plan.json"));
    const barnehage = actual.plan_reachability.plans.find((row) => row.path.endsWith("/barnehageassistent_plan.json"));
    assert(areal, "Arealplanlegger-planen skal auditeres");
    assert(barnehage, "Barnehageassistent-planen skal auditeres");
  
    assert.deepEqual(
      areal.steps.filter((step) => step.content_exists && !step.content_loaded).map((step) => step.type).sort(),
      ["consequence", "followup", "knowledge", "micro"]
    );
    assert.deepEqual(
      barnehage.steps.filter((step) => step.content_exists && !step.content_loaded).map((step) => step.type).sort(),
      ["consequence", "followup", "knowledge"]
    );
    assert(actual.runtime.answer_wrappers.length > 1, "auditten skal oppdage den parallelle answer-pipelinen");
    assert(actual.runtime.generic_fallback_choice_sources.some((file) => file.endsWith("civicationDailyMailBuilder.js")));
  }

  console.log("civication-scene-pipeline-reachability.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
