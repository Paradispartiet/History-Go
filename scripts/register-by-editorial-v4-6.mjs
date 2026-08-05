import fs from "node:fs";

const manifestPath = "data/fag/fag_manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (!manifest.by) throw new Error("Missing BY manifest entry");

Object.assign(manifest.by, {
  qualityContract: "by/quality_contract_by_v1.json",
  curriculumArchitecture: "by/curriculum_architecture_by_v1.json",
  sourcePriorityRules: "by/quiz_generator_rules_by_v5_1_source_priority_patch.json",
  sourceRegistry: "by/source_registry_by_v1.json"
});

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Registered BY editorial v4.6 contracts in fag_manifest.json.");
