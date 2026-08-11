#!/usr/bin/env node

// One-shot coordinate runner job for Torggata phase 3c.
// Canonical place/evidence were already merged in PR #4799.
// The workflow owns regeneration of data/places/places_index.json and the
// coordinate validation chain; this job deliberately makes no place-data edit.

console.log('Torggata coordinate phase 3c: regenerate runtime place index from canonical main-derived source and run coordinate gates.');
