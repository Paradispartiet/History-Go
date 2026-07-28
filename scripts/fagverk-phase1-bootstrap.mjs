#!/usr/bin/env node
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const parts = fs.readdirSync("scripts")
  .filter((name) => name.startsWith(".fagverk-phase1-part-"))
  .sort();

if (!parts.length) throw new Error("Mangler Phase 1-arkivdeler");

const archive = parts
  .map((name) => fs.readFileSync(`scripts/${name}`, "utf8").trim())
  .join("");
const temp = ".phase1-files.tar.gz";
fs.writeFileSync(temp, Buffer.from(archive, "base64"));
execFileSync("tar", ["-xzf", temp, "-C", "."], { stdio: "inherit" });
fs.unlinkSync(temp);

for (const name of parts) fs.unlinkSync(`scripts/${name}`);
for (const file of [
  "scripts/fagverk-phase1-bootstrap.mjs",
  ".github/workflows/fagverk-phase1-bootstrap.yml"
]) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

console.log("Materialiserte Phase 1-filer.");
