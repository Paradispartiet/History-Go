#!/usr/bin/env node

// Canonical reproducible entrypoint for Stortorget production.
// Keep the base materializer, canonical quiz production and strict v4.2 repair
// together so a future rebuild cannot silently recreate the pre-closure packet.
await import('./finalize-stortorget-completion.mjs');
await import('./finalize-stortorget-quiz.mjs');
await import('./finalize-stortorget-v42.mjs');
console.log('Stortorget canonical production rebuild complete.');
