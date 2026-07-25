# Criciúma coordinate control — batch 1

Date: 2026-07-25  
Scope: central Praça Nereu Ramos cluster and city-package evidence integration

## Architecture repair

- `tools/audit-coordinate-evidence.mts` now reads registered city packages from `data/cities/manifest.json` in addition to the legacy place manifest.
- Evidence directories declared by city manifests are discovered recursively.
- All 40 Criciúma evidence snapshots now include the exact `coordNote` stored on their place records.
- Criciúma evidence therefore participates in the canonical audit instead of remaining outside it.

## Central records reviewed

| Place | Result | Coordinate state |
|---|---|---|
| Praça Nereu Ramos | Official identity and Avenida Getúlio Vargas location recorded; exact square geometry still required | `candidate_sources_collected` / `needs_geometry` |
| Catedral São José | Official Rua São José, 16 address recorded; exact building/entrance geometry still required | `candidate_sources_collected` / `needs_geometry` |
| Casa da Cultura Neusa Nunes Vieira | Official Praça Nereu Ramos, 50 address recorded; exact building geometry still required | `candidate_sources_collected` / `needs_geometry` |
| Prédio da Casa Londres | Official identity on Praça Nereu Ramos recorded; exact number/building object remains unresolved | `candidate_sources_collected` / `needs_address_source` |
| Monumento ao Mineiro | Identity corrected: inaugurated in front of the cathedral in 1946 and moved to Praça Etelvina Luz in 1971; exact current monument object still required | `candidate_sources_collected` / `needs_geometry` |

## Coordinate decision

No coordinate was promoted to verified in this batch. Candidate markers remain unchanged until stable geometry or address/source objects satisfy Coordinate Source Contract v1.

## Content correction

The Monumento ao Mineiro place text now distinguishes the original 1946 inauguration site from the post-1971 location and documents the later municipal use of Praça Nereu Ramos as the broader current area name.
