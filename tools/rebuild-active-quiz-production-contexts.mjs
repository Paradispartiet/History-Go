import fs from 'node:fs';
import { runBuildQuizProductionContext } from '../scripts/build-quiz-production-context.mjs';

const manifest = JSON.parse(fs.readFileSync('data/fag/fag_manifest.json', 'utf8'));
let count = 0;

for (const [categoryId, entry] of Object.entries(manifest)) {
  const targets = entry?.quizProduction?.targets;
  if (!targets || typeof targets !== 'object' || Array.isArray(targets)) continue;

  for (const [targetId, target] of Object.entries(targets)) {
    const outputPath = target?.context_artifact;
    if (!outputPath) {
      throw new Error(`Mangler context_artifact for ${categoryId}/${targetId}`);
    }

    await runBuildQuizProductionContext({
      root: process.cwd(),
      categoryId,
      targetId,
      outputPath
    });
    console.log(`Skrev ${outputPath}`);
    count += 1;
  }
}

if (count !== 8) {
  throw new Error(`Forventet 8 aktive quizkontekster, fikk ${count}`);
}

console.log(`Regenererte ${count} aktive quizkontekster.`);
