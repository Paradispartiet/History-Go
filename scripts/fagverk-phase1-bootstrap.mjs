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

// GitHub Actions-tokenet kan ikke skrive workflowfiler. De materialiseres
// separat med repo-connectoren etter at den øvrige Phase 1-committen er pushet.
execFileSync("git", [
  "checkout", "HEAD", "--",
  ".github/workflows/fagverk.yml",
  ".github/workflows/fagverk-inventory.yml"
], { stdio: "inherit" });
if (fs.existsSync(".github/workflows/fagverk-general-engine.yml")) {
  fs.unlinkSync(".github/workflows/fagverk-general-engine.yml");
}

for (const name of parts) fs.unlinkSync(`scripts/${name}`);
if (fs.existsSync("scripts/fagverk-phase1-bootstrap.mjs")) {
  fs.unlinkSync("scripts/fagverk-phase1-bootstrap.mjs");
}

console.log("Materialiserte Phase 1-filer uten workflowendringer.");
