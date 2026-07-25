# Criciúma coordinate control — batch 6

Date: 2026-07-25  
Scope: Gruta Nossa Senhora de Lourdes completion and São Roque snapshot repair

## Gruta Nossa Senhora de Lourdes

- Official address: Rua Engenheiro Fiuza da Rocha 512, Lote Seis.
- Construction year corrected from the unsupported 1940 value to the official 1946 date.
- The municipal source documents the stone grotto, native vegetation, a natural spring, religious images and stairs added in the 1950s.
- Decision: `needs_geometry`. The address resolves identity, but exact grotto/site or entrance geometry is still required.

## São Roque regression repair

PR #3786 had already upgraded Capela de São Roque’s place metadata and evidence snapshot to the official Rua Luiz José Mariano 405 source. Batch 5 accidentally retained the correct research content but restored the older foundation `currentCoordinate` metadata in the evidence file.

This batch restores the exact evidence file from PR #3786 so that `currentCoordinate` again matches the active place record.

## Coordinate decision

No coordinate is promoted to verified and no latitude or longitude is changed. The batch corrects content, source metadata and audit consistency only.
