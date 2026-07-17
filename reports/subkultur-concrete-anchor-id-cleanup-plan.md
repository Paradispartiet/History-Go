# Cleanup plan — concrete anchor IDs

Dato: 2026-07-10

## Scope

Denne oppryddingen gjelder bare tre miljøgrupper:

- Hausmania: behold stabil `hausmania_miljoet`; fjern `hausmania_miljoet_concrete_anchor` som duplikat.
- X-Ray: behold stabil `xray_ungdomskulturhus_miljoet`; fjern `xray_ungdomskulturhus_miljoet_concrete_anchor` som duplikat.
- Blå: fjern gammel stabil `bla_miljoet` fra subkultur-root, og omdøp den allerede musikk-kategoriserte `bla_miljoet_concrete_anchor` til stabil `bla_miljoet`.

## Hvorfor Blå behandles annerledes

Etter PR #2068 og #2073 er Blå primært `musikk` på både place- og people-nivå. Den gamle stabile `bla_miljoet` ligger fortsatt i root-filen for subkultur, mens den nyere concrete-anchor-entryen ligger riktig i musikk-filen. Cleanup skal derfor beholde musikk-versjonen som den stabile ID-en.

## Script

```bash
node scripts/cleanup-subkultur-concrete-anchor-ids.mjs
```

Scriptet verifiserer før skriving at:

- stabile `hausmania_miljoet`, `xray_ungdomskulturhus_miljoet` og `bla_miljoet` finnes i subkultur-root
- Hausmania- og X-Ray-concrete-anchor-duplikatene finnes
- `bla_miljoet_concrete_anchor` finnes i musikk-filen
- musikk-filen ikke allerede inneholder stabil `bla_miljoet`

## Kjøring

```bash
node scripts/cleanup-subkultur-concrete-anchor-ids.mjs
bash scripts/check-people.sh
```

Forventede endrede filer:

- `data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json`
- `data/people/subkultur/oslo/people_subkultur_oslo.json`
- `data/people/musikk/oslo/people_musikk_oslo.json`
- `reports/subkultur-concrete-anchor-id-cleanup-validation.md`

## Ikke gjør

- Ikke endre places.
- Ikke endre manifests.
- Ikke flytt flere people.
- Ikke endre kategori eller placeId for Hausmania eller X-Ray.
- Ikke endre Blitzhuset, Torggata Blad eller andre miljøankre.
