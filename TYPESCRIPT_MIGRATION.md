# TypeScript migration phase 1

This repository now has TypeScript configured as a **development-only type checker** without changing runtime behavior.

## What is set up

- `typescript` added as a dev dependency.
- Root `tsconfig.json` created.
- New `schemas/` folder with starter interfaces:
  - `place.ts`
  - `person.ts`
  - `badge.ts`
  - `quiz.ts`
  - `civication.ts`

## Why `allowJs`, `checkJs`, and `noEmit`

- `allowJs: true` lets TypeScript read existing JavaScript files.
- `checkJs: true` enables static type analysis directly in `.js` files.
- `noEmit: true` guarantees no output files are generated (no build/runtime change).

This supports gradual migration with no framework, bundler, or architecture changes.

## How gradual migration should work

1. Keep existing runtime in JavaScript.
2. Add JSDoc type hints in high-value JS modules.
3. Introduce utility-level TypeScript files as isolated additions.
4. Migrate larger loaders/data layers later, in controlled steps.

## Recommended next steps

- Start adding JSDoc types to shared helpers and data normalization functions.
- Migrate low-risk utility modules to `.ts` one by one.
- Plan loader migration later when schemas and data contracts are stable.
