import fs from "node:fs";

function replaceExact(file: string, before: string, after: string): void {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(before)) throw new Error(`Expected contract text missing in ${file}`);
  fs.writeFileSync(file, source.replace(before, after));
}

replaceExact(
  "js/knowledgeV2.ts",
  "      emners: emneRows.sort((a, b) => b.knowledge_count - a.knowledge_count || a.title.localeCompare(b.title, \"nb\")),",
  "      emner: emneRows.sort((a, b) => b.knowledge_count - a.knowledge_count || a.title.localeCompare(b.title, \"nb\")),"
);

replaceExact(
  "tests/knowledge-v2-model.test.js",
  "  assert.equal(profile.subjects.by.emners[0].knowledge_count, 1);",
  "  assert.equal(profile.subjects.by.emner[0].knowledge_count, 1);"
);

console.log("Knowledge emner contract fixed");
