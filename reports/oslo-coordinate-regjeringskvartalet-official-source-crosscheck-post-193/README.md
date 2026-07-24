# Regjeringskvartalet official source crosscheck after batch 193

Date: 2026-07-24

This research closes the identity/scope gap left by the merged Oslo Planinnsyn WFS pass.

## Official state decision

- title: `Vedtak av statlig reguleringsplan for nytt regjeringskvartal`
- decision date: `2017-02-10`
- reference: `16/2890-8`
- legal basis: plan- og bygningsloven § 6-4
- decision: adopted state regulation for the new Regjeringskvartalet

The official decision defines the combined institutional area with:

- Akersgata as western boundary
- Møllergata as eastern boundary
- Trefoldighetskirken and Deichmanske bibliotek to the north
- Høyesterett and Grensen 1 to the south
- R5 included west of Akersgata

## Planinnsyn crosscheck

The merged municipal WFS research found exactly one area-plan polygon covering the existing canonical centre:

- map: `REGTILLEGG`
- feature type: `ms:Omraadeplan`
- plan ID: `202020172`
- plan name: `S-5100`
- plan type: `34`
- geometry: `Polygon`

The official state decision and the municipal polygon describe the same parent institutional-area identity. The state decision establishes authoritative identity and scope; Oslo Planinnsyn supplies the machine-traceable geometry.

## Production decision

A later coordinate batch may promote `regjeringskvartalet` to `verified_geometry` only when live WFS still returns the exact locked feature and geometry, protocol max batch remains 193, and parent/subplace overlap is explicitly separated from duplicate collision.

`regjeringen.no` returns HTTP 403 to GitHub-hosted Actions runners. No proxy or third-party cached page may replace the official source. Production must therefore hard-gate this merged source contract and validate the official municipal WFS live.

No canonical place or coordinate data changed in this research PR.
