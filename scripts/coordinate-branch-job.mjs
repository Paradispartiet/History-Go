#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const workcard = "reports/place-production/stortorget-workcard-current.json";
const base = "0b0e215c3a33a89f59d2b65d9b7910f6287a33d2";

execFileSync(process.execPath, [
  "scripts/place-production-rule-preflight.mjs",
  "record",
  "--workcard", workcard,
  "--place-id", "stortorget",
  "--category", "by"
], { stdio: "inherit" });

execFileSync(process.execPath, [
  "scripts/place-production-rule-preflight.mjs",
  "validate",
  "--workcard", workcard
], { stdio: "inherit" });

execFileSync(process.execPath, [
  "scripts/place-production-rule-preflight.mjs",
  "check",
  "--base", base
], { stdio: "inherit" });

execFileSync(process.execPath, ["--test", "tests/place-production-rule-preflight.test.mjs"], { stdio: "inherit" });
execFileSync("git", ["diff", "--check"], { stdio: "inherit" });
