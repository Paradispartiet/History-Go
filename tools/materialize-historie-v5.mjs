#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { domains, emner, concepts, theories } from "../data/fag/historie/historie_v5_registry.mjs";

const outDir = path.join(process.cwd(), "data/fag/historie/generated-v5");
fs.mkdirSync(outDir, { recursive: true });
const files = {
  "domains_historie_canonical_v5.json": domains,
  "emner_historie_canonical_v5.json": emner,
  "concepts_historie_canonical_v5.json": concepts,
  "theories_historie_canonical_v5.json": theories,
};
for (const [name, value] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`);
}
console.log(JSON.stringify({ status: "MATERIALIZED", outDir, domains: domains.length, emner: emner.length, concepts: concepts.length, theories: theories.length }, null, 2));
