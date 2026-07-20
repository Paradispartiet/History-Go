import fs from 'node:fs';
import './materialize-groruddammen-nature-rounds.mjs';

for (const file of [
  'scripts/materialize-groruddammen-nature-rounds.mjs',
  '.github/workflows/materialize-groruddammen-nature-rounds.yml',
  'reports/groruddammen-materializer-trigger.txt'
]) {
  fs.rmSync(file, { force: true });
}

console.log('Groruddammen materialized; temporary files removed.');
