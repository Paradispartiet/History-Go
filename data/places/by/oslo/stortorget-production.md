# Stortorget production

Canonical scope is the named square surface `stortorget` / Stortorvet in front of Oslo domkirke. The cathedral, Kirkeristen, Christiania Torv and Youngstorget remain separate Places.

Rebuild the complete production package with:

```bash
node tools/build-stortorget-completion.mjs
```

The entrypoint materializes the base place package, canonical quiz production and the strict place-description v4.2 packet together. The production regression is `tests/stortorget-production-closure.test.mjs`.
