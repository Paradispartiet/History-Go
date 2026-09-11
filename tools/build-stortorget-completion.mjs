#!/usr/bin/env node

// Canonical reproducible entrypoint for Stortorget production.
// Keep base materialization, Story governance alignment, canonical quiz production
// and strict v4.2 repair together so future rebuilds reproduce the closed state.
await import('./finalize-stortorget-completion.mjs');
await import('./finalize-stortorget-story-integrity.mjs');
await import('./finalize-stortorget-quiz.mjs');
await import('./finalize-stortorget-v42.mjs');
console.log('Stortorget canonical production rebuild complete.');
