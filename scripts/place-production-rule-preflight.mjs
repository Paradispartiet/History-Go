#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();

export const STATIC_RULE_FILES = [
  "docs/PLACE_PRODUCTION_CHECKLIST.md",
  "docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md",
  "docs/PLACE_PRODUCTION_PROFILES.md",
  "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
  "data/places/README_place_rounds.md",
  "data/badges/index.json",
  "data/badges/place_production_routing_v1.json",
  "docs/PLACE_OBJECTS_CANONICAL.md",
  "data/brands/brand_rules_v1_1.json"
];

const WORKCARD_SCHEMA = "history_go_place_workcard_v2";
const PREFLIGHT_SCHEMA = "history_go_place_rule_preflight_v1";

function fail(message) {
  console.error(`PLACE RULE PREFLIGHT: ${message}`);
  process.exitCode = 1;
}

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), "utf8"));
}

function sha256(relPath) {
  const buffer = fs.readFileSync(path.join(root, relPath));
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function parseArgs(argv) {
  const result = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      result._.push(token);
      continue;
    }
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    result[key] = value;
    i += 1;
  }
  return result;
}

export function resolveBadgeFile(category) {
  const index = readJson("data/badges/index.json");
  const matches = (index.files || []).filter(file => path.basename(file, ".json") === category);
  if (matches.length !== 1) throw new Error(`Expected exactly one badge file for category ${category}, found ${matches.length}`);
  return matches[0];
}

export function requiredRuleFiles(category) {
  return [...STATIC_RULE_FILES, resolveBadgeFile(category)];
}

function currentContractSnapshot(category) {
  const routing = readJson("data/badges/place_production_routing_v1.json");
  const route = routing.badges?.[category];
  if (!route) throw new Error(`No canonical place-production routing for category ${category}`);
  const candidateCollections = route.candidate_collections || [];
  if (candidateCollections.length !== 4) throw new Error(`Category ${category} must resolve to exactly four candidate collections`);
  return {
    full_place_collection_count: routing.rules?.full_place_collection_count,
    candidate_collections: candidateCollections,
    category_expression: candidateCollections[3],
    related_is_placecard_collection: routing.rules?.related_is_placecard_collection,
    no_filler: routing.rules?.no_filler,
    routing_order: routing.rules?.routing_order || []
  };
}

export function buildRulePreflight(placeId, category) {
  const files = requiredRuleFiles(category).map(relPath => ({ path: relPath, sha256: sha256(relPath) }));
  return {
    schema: PREFLIGHT_SCHEMA,
    status: "PASS",
    place_id: placeId,
    category,
    recorded_at: new Date().toISOString(),
    rule: "Files must be read in full before this evidence is recorded; hashes prove freshness, not comprehension.",
    files,
    contract_snapshot: currentContractSnapshot(category)
  };
}

export function validateWorkcard(workcard, workcardPath = "<workcard>") {
  const errors = [];
  if (!workcard || typeof workcard !== "object") return [`${workcardPath}: invalid JSON object`];
  const placeId = workcard.place_id;
  const category = workcard.category;
  const preflight = workcard.rule_preflight;
  if (!placeId) errors.push(`${workcardPath}: missing place_id`);
  if (!category) errors.push(`${workcardPath}: missing category`);
  if (!preflight) return [...errors, `${workcardPath}: missing rule_preflight`];
  if (preflight.schema !== PREFLIGHT_SCHEMA) errors.push(`${workcardPath}: rule_preflight.schema must be ${PREFLIGHT_SCHEMA}`);
  if (preflight.status !== "PASS") errors.push(`${workcardPath}: rule_preflight.status must be PASS`);
  if (preflight.place_id !== placeId) errors.push(`${workcardPath}: rule_preflight.place_id does not match workcard place_id`);
  if (preflight.category !== category) errors.push(`${workcardPath}: rule_preflight.category does not match workcard category`);
  if (!preflight.recorded_at) errors.push(`${workcardPath}: missing rule_preflight.recorded_at`);

  if (!category) return errors;

  let expectedFiles;
  try {
    expectedFiles = requiredRuleFiles(category);
  } catch (error) {
    errors.push(`${workcardPath}: ${error.message}`);
    return errors;
  }

  const actualFiles = new Map((preflight.files || []).map(entry => [entry.path, entry.sha256]));
  for (const relPath of expectedFiles) {
    if (!actualFiles.has(relPath)) {
      errors.push(`${workcardPath}: preflight missing required rule file ${relPath}`);
      continue;
    }
    const currentHash = sha256(relPath);
    if (actualFiles.get(relPath) !== currentHash) errors.push(`${workcardPath}: stale preflight for ${relPath}; re-read and re-record`);
  }
  for (const relPath of actualFiles.keys()) {
    if (!expectedFiles.includes(relPath)) errors.push(`${workcardPath}: unexpected preflight rule file ${relPath}`);
  }

  try {
    const expectedContract = currentContractSnapshot(category);
    if (JSON.stringify(preflight.contract_snapshot) !== JSON.stringify(expectedContract)) {
      errors.push(`${workcardPath}: contract_snapshot is stale or differs from current canonical routing`);
    }
  } catch (error) {
    errors.push(`${workcardPath}: ${error.message}`);
  }

  return errors;
}

function record(args) {
  const workcardPath = args.workcard;
  const placeId = args["place-id"];
  const category = args.category;
  if (!workcardPath || !placeId || !category) throw new Error("record requires --workcard, --place-id and --category");
  const abs = path.join(root, workcardPath);
  let workcard = {};
  if (fs.existsSync(abs)) workcard = JSON.parse(fs.readFileSync(abs, "utf8"));
  if (workcard.place_id && workcard.place_id !== placeId) throw new Error(`Existing workcard place_id ${workcard.place_id} does not match ${placeId}`);
  if (workcard.category && workcard.category !== category) throw new Error(`Existing workcard category ${workcard.category} does not match ${category}`);
  workcard.schema = workcard.schema || WORKCARD_SCHEMA;
  workcard.place_id = placeId;
  workcard.category = category;
  workcard.status = workcard.status || "preflight";
  workcard.rule_preflight = buildRulePreflight(placeId, category);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(workcard, null, 2)}\n`);
  console.log(`Recorded current rule preflight in ${workcardPath}`);
}

function git(args, options = {}) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options }).trim();
}

function changedFiles(base) {
  return git(["diff", "--name-only", `${base}...HEAD`]).split("\n").map(value => value.trim()).filter(Boolean);
}

function jsonAtBase(base, relPath) {
  try {
    const raw = git(["show", `${base}:${relPath}`]);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeReadJson(relPath) {
  try {
    return readJson(relPath);
  } catch {
    return null;
  }
}

function isCanonicalPlaceFile(relPath) {
  if (!relPath.startsWith("data/places/") || !relPath.endsWith(".json")) return false;
  if (relPath.includes("/regler/") || relPath.endsWith("places_index.json")) return false;
  const current = safeReadJson(relPath);
  return Boolean(current && current.id && current.category);
}

function requiresFreshWorkcard(base, relPath) {
  const current = safeReadJson(relPath);
  if (!current) return false;
  const previous = jsonAtBase(base, relPath);
  if (!previous) return current.profile_status === "confirmed" || Boolean(current.place_card_profile);
  if (previous.profile_status !== "confirmed" && current.profile_status === "confirmed") return true;
  if (JSON.stringify(previous.place_card_profile || null) !== JSON.stringify(current.place_card_profile || null)) return true;
  if (previous.production_profile !== current.production_profile && current.profile_status === "confirmed") return true;
  return false;
}

function allWorkcards() {
  const dir = path.join(root, "reports/place-production");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith("-workcard-current.json"))
    .map(entry => path.relative(root, path.join(entry.parentPath || entry.path, entry.name)).replaceAll("\\", "/"));
}

function findWorkcardForPlace(placeId) {
  for (const relPath of allWorkcards()) {
    const workcard = safeReadJson(relPath);
    if (workcard?.place_id === placeId) return relPath;
  }
  return null;
}

function check(args) {
  const base = args.base;
  if (!base) throw new Error("check requires --base <base-sha>");
  const changed = changedFiles(base);
  const errors = [];
  const workcardsToValidate = new Set(changed.filter(file => file.startsWith("reports/place-production/") && file.endsWith("-workcard-current.json")));

  for (const relPath of changed.filter(isCanonicalPlaceFile)) {
    if (!requiresFreshWorkcard(base, relPath)) continue;
    const place = readJson(relPath);
    const workcardPath = findWorkcardForPlace(place.id);
    if (!workcardPath) {
      errors.push(`${relPath}: full-production change for ${place.id} requires reports/place-production/*-workcard-current.json with rule_preflight`);
      continue;
    }
    workcardsToValidate.add(workcardPath);
  }

  for (const workcardPath of workcardsToValidate) {
    const workcard = safeReadJson(workcardPath);
    errors.push(...validateWorkcard(workcard, workcardPath));
  }

  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Place READ-FIRST preflight PASS (${workcardsToValidate.size} workcard(s) validated).`);
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  try {
    if (command === "record") record(args);
    else if (command === "check") check(args);
    else if (command === "validate") {
      if (!args.workcard) throw new Error("validate requires --workcard");
      const errors = validateWorkcard(readJson(args.workcard), args.workcard);
      if (errors.length) {
        errors.forEach(error => fail(error));
      } else {
        console.log(`Place READ-FIRST preflight PASS: ${args.workcard}`);
      }
    } else {
      throw new Error("Usage: place-production-rule-preflight.mjs record|check|validate ...");
    }
  } catch (error) {
    fail(error.message);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) runCli();
