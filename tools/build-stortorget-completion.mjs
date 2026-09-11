#!/usr/bin/env node

// Canonical reproducible entrypoint for Stortorget production.
// Keep base materialization, quiz, strict v4.2 and story integrity together
// so a future rebuild cannot silently recreate a pre-closure derivative.
await import('./finalize-stortorget-completion.mjs');
await import('./finalize-stortorget-quiz.mjs');
await import('./finalize-stortorget-v42.mjs');
await import('./finalize-stortorget-story-contract.mjs');
console.log('Stortorget canonical production rebuild complete.');
