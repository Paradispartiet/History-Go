import fs from 'node:fs';
import './materialize-groruddammen-nature-rounds.mjs';

// One-shot job: the established main-branch runner executes this file,
// publishes the generated content, and then removes the runner entrypoint.
for (const file of [
  'scripts/materialize-groruddammen-nature-rounds.mjs',
  '.github/workflows/materialize-groruddammen-nature-rounds.yml',
  'reports/groruddammen-materializer-trigger.txt'
]) {
  fs.rmSync(file, { force: true });
}

console.log('Groruddammen materialized; temporary files removed.');
