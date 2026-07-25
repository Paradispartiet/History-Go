#!/usr/bin/env node

console.error([
  "tools/build-historie-v5.mjs is disabled.",
  "",
  "The previous builder generated uniform synthetic emner, concepts, hooks and",
  "theory objects from a blueprint. Those files are not production canonical and",
  "must not be used as the basis for V6 evidence.",
  "",
  "Use the active production files under data/fag/historie and run:",
  "  node tools/validate-historie-v5.mjs --write",
  "",
  "Use --require-freeze only when validating the final V5.5 freeze gate."
].join("\n"));
process.exit(1);
