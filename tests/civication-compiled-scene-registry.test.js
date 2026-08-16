#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const compilerPath = path.join(repoRoot, "scripts/build-civication-scene-registry.mjs");
const schemaPath = path.join(repoRoot, "data/Civication/compiledSceneRegistryV1.schema.json");
const sceneSchemaPath = path.join(repoRoot, "data/Civication/sceneContractV1.schema.json");

// Career Gameplay Matrix scans civication test source text for literal role IDs.
// Build fixture identifiers at runtime so this architecture test cannot become
// false gameplay evidence merely because it names a role-owned source file.
const sampleRoleStem = ["by", ["rad", "giver"].join("")].join("_");
const sampleRoleScope = `${sampleRoleStem}_plan`;
const sampleSceneId = `${sampleRoleStem}_job_sted_001`;
const samplePath = path.join(repoRoot, "data/Civication/mailFamilies/by/job", `${sampleRoleScope}_job.json`);
const duplicateRoleScope = ["mel", "lom", "le", "der"].join("");
const duplicateSceneId = ["ml", "faction", "001"].join("_");
const unreachableDuplicateCopy = `data/Civication/mailFamilies/naeringsliv/job/${duplicateRoleScope}_fraksjonsvalg.json`;
const keptDuplicateSource = `data/Civication/mailFamilies/naeringsliv/job/${duplicateRoleScope}_job.json`;
const shadowedDuplicateSource = `data/Civication/mailFamilies/naeringsliv/faction_choice/${duplicateRoleScope}_faction_choice.json`;

const registrySchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const sceneSchema = JSON.parse(fs.readFileSync(sceneSchemaPath, "utf8"));
const sample = JSON.parse(fs.readFileSync(samplePath, "utf8"));

assert.equal(registrySchema.properties.schema.const, "compiled_scene_registry_v1");
assert.equal(registrySchema.properties.version.const, 1);
assert.equal(registrySchema.$defs.entry.properties.scene.$ref, "./sceneContractV1.schema.json");
assert(registrySchema.required.includes("shadowed_duplicates"));
assert.equal(sceneSchema.properties.schema.const, "civication_scene_v1");

(async () => {
  const compiler = await import(pathToFileURL(compilerPath).href);
  const first = await compiler.compileRegistryFromRepo(repoRoot);
  const second = await compiler.compileRegistryFromRepo(repoRoot);

  assert.deepEqual(second, first, "compiler output skal være deterministisk på samme kilde-tree");
  assert.equal(first.schema, "compiled_scene_registry_v1");
  assert.equal(first.version, 1);
  assert.equal(first.compiler_version, 1);
  assert.equal(first.scene_contract, "data/Civication/sceneContractV1.schema.json");
  assert.equal(first.source_root, "data/Civication/mailFamilies");
  assert.match(first.registry_hash, /^[a-f0-9]{64}$/);
  assert(first.stats.input_file_count > 0, "registry skal inventere mailFamilies-kildene");
  assert(first.stats.compiled_source_file_count > 0, "registry skal kompilere runtime-reachable mail-family-kataloger");
  assert(first.stats.ignored_source_file_count > 0, "ikke-reachable overgangsfiler skal være synlige i inventory");
  assert(first.stats.scene_count > 0, "registry skal inneholde scener");
  assert(first.stats.role_count > 0, "registry skal ha rolleindeks");
  assert.equal(first.entries.length, first.stats.scene_count);
  assert.equal(Object.keys(first.role_index).length, first.stats.role_count);
  assert.equal(first.shadowed_duplicates.length, first.stats.shadowed_duplicate_count);

  assert.deepEqual(
    first.runtime_materialized_sources.map((source) => source.name),
    ["private", "life", "narrative", "social"],
    "4G-adapterne skal beskrives som runtime-materialiserte under 4H-A"
  );
  for (const source of first.runtime_materialized_sources) {
    assert.equal(source.materialization, "runtime");
    assert(source.source_format);
  }

  // Runtime-reachability skal speile 4C SceneCatalog, ikke fysisk filtilstedeværelse.
  assert(first.ignored_source_files.includes(unreachableDuplicateCopy));
  assert(!first.compiled_source_files.includes(unreachableDuplicateCopy));

  // To canonicale runtime-paths har i dagens datatre samme scene-ID og identisk
  // routing-signatur. Runtime laster job-kilden først; compileren skal derfor
  // beholde den første og inventere den senere kopien som eksplisitt gjeld.
  const duplicateEntries = first.entries.filter((entry) => entry.id === duplicateSceneId);
  assert.equal(duplicateEntries.length, 1);
  assert.equal(duplicateEntries[0].source_path, keptDuplicateSource);
  const duplicateDebt = first.shadowed_duplicates.find((entry) => entry.id === duplicateSceneId);
  assert(duplicateDebt, "kjent route-ekvivalent duplicate skal inventeres");
  assert.equal(duplicateDebt.kept_source_path, keptDuplicateSource);
  assert.equal(duplicateDebt.shadowed_source_path, shadowedDuplicateSource);
  assert(duplicateDebt.kept_source_rank < duplicateDebt.shadowed_source_rank);
  assert.match(duplicateDebt.routing_signature, /^[a-f0-9]{64}$/);

  const ids = new Set();
  const indexedIds = new Set();
  for (const roleIds of Object.values(first.role_index)) {
    for (const id of roleIds) {
      assert(!indexedIds.has(id), `scene ${id} skal bare ligge i én rolleindeks`);
      indexedIds.add(id);
    }
  }

  for (const entry of first.entries) {
    assert(!ids.has(entry.id), `duplikat scene-id ${entry.id}`);
    ids.add(entry.id);
    assert(indexedIds.has(entry.id), `${entry.id} mangler i role_index`);
    assert(entry.source_path.startsWith("data/Civication/mailFamilies/"));
    assert(!entry.source_path.includes("/jobbmails/"));
    assert.match(entry.source_hash, /^[a-f0-9]{64}$/);
    assert.equal(entry.scene.schema, "civication_scene_v1");
    assert.equal(entry.scene.version, 1);
    assert.equal(entry.scene.id, entry.id);
    assert.equal(entry.scene.domain, "work");
    assert.equal(entry.scene.delivery, "mail");
    assert.equal(entry.scene.provenance.adapter, "mail_family");
    assert.equal(entry.scene.provenance.source_path, entry.source_path);
    assert.equal(entry.scene.provenance.source_id, entry.id);
    assert.equal(entry.scene.provenance.compiled_at_build, true);
    assert.equal(entry.compatibility_projection.id, entry.id);
    assert.equal(entry.compatibility_projection.scene_catalog_source_path, entry.source_path);
    assert.equal(entry.compatibility_projection.scene_catalog_version, 1);

    const choices = Array.isArray(entry.scene.choices) ? entry.scene.choices : [];
    if (entry.scene.interaction_mode === "decision") assert(choices.length >= 2, `${entry.id} decision krever to valg`);
    if (entry.scene.interaction_mode === "info") assert.equal(choices.length, 0, `${entry.id} info kan ikke ha valg`);
    if (entry.scene.interaction_mode === "ack") assert(choices.length <= 1, `${entry.id} ack kan ha maks ett valg`);
    if (entry.scene.interaction_mode === "task") assert(entry.scene.task_contract, `${entry.id} task krever task_contract`);
  }
  assert.equal(ids.size, first.stats.scene_count);
  assert.equal(indexedIds.size, first.stats.scene_count);

  // Lås én kjent byfaglig scene mot dagens kilde slik at 4H-B kan bevise
  // runtime-paritet uten å tolke gameplay på nytt.
  const sourceMail = sample.families
    .flatMap((family) => family.mails || [])
    .find((mail) => mail.id === sampleSceneId);
  assert(sourceMail, "byfaglig fixture skal finnes");
  const compiled = first.entries.find((entry) => entry.id === sourceMail.id);
  assert(compiled, "kjent byfaglig scene skal finnes i registry");
  assert.equal(compiled.category, "by");
  assert.equal(compiled.role_scope, sampleRoleScope);
  assert.equal(compiled.mail_type, "job");
  assert.equal(compiled.scene.scene_kind, "task");
  assert.equal(compiled.scene.interaction_mode, "decision");
  assert.equal(compiled.scene.content.subject, sourceMail.subject);
  assert.equal(compiled.scene.content.summary, sourceMail.summary);
  assert.deepEqual(compiled.scene.content.situation, sourceMail.situation);
  assert.deepEqual(
    compiled.scene.choices.map((choice) => [choice.id, choice.effects.score_delta]),
    sourceMail.choices.map((choice) => [choice.id, Number(choice.effect || 0)])
  );
  assert.deepEqual(
    compiled.compatibility_projection.choices.map((choice) => choice.tags),
    sourceMail.choices.map((choice) => choice.tags),
    "compatibility_projection skal bevare choice tags til runtimeforbrukerne er migrert"
  );

  // Gamle jobbmails skal inventeres som eksplisitt gjeld, aldri kompileres inn
  // som en konkurrerende scene-kilde.
  assert.equal(first.legacy_fallback_inventory.root, "data/Civication/jobbmails");
  assert(first.legacy_fallback_inventory.file_count > 0, "4H-A skal synliggjøre gjenværende jobbmails-gjeld");

  const stableA = compiler.stableStringify(first, 2);
  const stableB = compiler.stableStringify(second, 2);
  assert.equal(stableB, stableA);
  assert(!stableA.includes('"generated_at"'), "registry-hash skal ikke avhenge av klokketid");

  console.log(`civication-compiled-scene-registry.test.js: PASS (${first.stats.scene_count} scener / ${first.stats.role_count} roller / ${first.stats.ignored_source_file_count} ignored / ${first.stats.shadowed_duplicate_count} shadowed / ${first.legacy_fallback_inventory.file_count} legacy fallback-filer)`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
