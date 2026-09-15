#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { materialize as materializeStrictCompletion } from './materialize-sosiologi-antropologi-applied-public-ethics-decolonization-fulltext-v1.mjs';
import { materialize as materializeAdvancedTheory } from './materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs';

export const MATERIALIZER_CHAIN = [
  'materialize-sosiologi-antropologi-applied-public-ethics-decolonization-fulltext-v1.mjs',
  'materialize-sosiologi-antropologi-advanced-theory-fulltext-refresh-v1.mjs',
];

export function materialize() {
  const strictCompletion = materializeStrictCompletion();
  const advancedTheory = materializeAdvancedTheory();
  return { strictCompletion, advancedTheory };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = materialize();
  console.log(`Sosiologi maintenance materialisert: strict=${result.strictCompletion.strictCompletionProven}, advanced=${result.advancedTheory.counts.works} verk/${result.advancedTheory.counts.theory_units} teorienheter.`);
}
