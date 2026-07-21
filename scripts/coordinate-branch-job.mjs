#!/usr/bin/env node
import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";

const result = spawnSync("bash", ["scripts/check-places.sh"], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024
});
const report = [
  "exit_code=" + String(result.status),
  "signal=" + String(result.signal || ""),
  "",
  "--- stdout ---",
  result.stdout || "",
  "",
  "--- stderr ---",
  result.stderr || ""
].join("\n");
await fs.mkdir("reports", { recursive: true });
await fs.writeFile("reports/hovedoya-places-check-diagnostic.log", report, "utf8");
console.log("Captured scripts/check-places.sh with exit code", result.status);
