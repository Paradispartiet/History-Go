#!/usr/bin/env node
// Kept as a compatibility entry point for callers that still use the original
// filename. The canonical package is now v2; the active validator covers its
// modules, contracts, dossiers, evidence, mappings and release-facing counts.
await import('./validate-musikk-fagdybde-v1.mjs');
