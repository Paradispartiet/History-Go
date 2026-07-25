#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const file = path.resolve(root, "data/fag/sport/sport_scientific_evidence_manifest_v1.json");
const evidence = JSON.parse(await readFile(file, "utf8"));

evidence.pipeline_status = "scientific_pipeline_infrastructure_ready_evidence_materialization_pending";
evidence.first_priority_package_status = "search_strategy_locked_peer_review_assignment_and_execution_pending";
evidence.search_readiness_status = {
  locked_database_strategies: 6,
  completed_database_searches: 0,
  PRESS_peer_review: "pending",
  assigned_human_reviewers: 0,
  deduplication: "protocol_locked_not_run",
  screening: "schema_locked_not_started"
};

await writeFile(file, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ status: "passed", pipeline_status: evidence.pipeline_status, first_priority_package_status: evidence.first_priority_package_status }, null, 2));
