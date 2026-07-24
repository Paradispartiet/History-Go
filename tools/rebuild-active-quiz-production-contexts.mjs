import fs from 'node:fs';
import path from 'node:path';
import { runBuildQuizProductionContext } from '../scripts/build-quiz-production-context.mjs';

const manifest = JSON.parse(fs.readFileSync('data/fag/fag_manifest.json', 'utf8'));
const manifestDirectory = path.join('data', 'fag');
let count = 0;

for (const [categoryId, entry] of Object.entries(manifest)) {
  const targets = entry?.quizProduction?.targets;
  if (!targets || typeof targets !== 'object' || Array.isArray(targets)) continue;

  for (const [targetId, target] of Object.entries(targets)) {
    const manifestRelativePath = target?.context_artifact;
    if (!manifestRelativePath) {
      throw new Error(`Mangler context_artifact for ${categoryId}/${targetId}`);
    }

    const outputPath = path.normalize(path.join(manifestDirectory, manifestRelativePath));
    if (!outputPath.startsWith(path.join('data', 'quiz', 'production_context') + path.sep)) {
      throw new Error(`Ugyldig context_artifact-bane for ${categoryId}/${targetId}: ${outputPath}`);
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

console.log(`Regenererte, validerte og staging-klargjorde ${count} aktive quizkontekster.`);
