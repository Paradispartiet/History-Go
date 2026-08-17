#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditFilmTvCulturalHeritageCanonStarsMemoryEditorialV1
} from './audit-film-tv-cultural-heritage-canon-stars-memory-editorial-v1.mjs';

// Historical Unit15 fulltext verification delegates to the completion-aware editorial audit.
// A later proven 192-topic / 17-chapter state and its normalized paragraph-claim trace shape
// are therefore reauditable without reopening or regressing the completed Film & TV subject.
// Keep this alias on the one-shot path filter so audit diagnostics retrigger the same final gate.
export const auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1 = auditFilmTvCulturalHeritageCanonStarsMemoryEditorialV1;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const writeReport = process.argv.includes('--write');
  const checkReport = process.argv.includes('--check');
  const report = auditFilmTvCulturalHeritageCanonStarsMemoryEditorialV1({ writeReport, checkReport });
  console.log(`Film & TV Unit15 fulltekstaudit: ${report.summary.paragraph_count}/56 redaksjonelle fagavsnitt, ${report.summary.minimum_paragraph_word_count} ord minimum, ${report.summary.forbidden_editorial_fragment_count} forbudte malfragmenter.`);
}
