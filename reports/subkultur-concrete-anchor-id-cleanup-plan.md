# Cleanup plan — concrete anchor IDs

Dato: 2026-07-10

## Scope

Denne oppryddingen gjelder bare tre people-ID-er:

- Fjern `hausmania_miljoet_concrete_anchor` fordi stabil `hausmania_miljoet` allerede finnes.
- Omdøp `xray_ungdomskulturhus_miljoet_concrete_anchor` til `xray_ungdomskulturhus_miljoet`.
- Omdøp `bla_miljoet_concrete_anchor` til `bla_miljoet`.

## Script

```bash
node scripts/cleanup-subkultur-concrete-anchor-ids.mjs
```

Scriptet verifiserer før skriving at:

- stabil `hausmania_miljoet` finnes
- source-ID-ene finnes i forventede filer
- stabile X-Ray- og Blå-ID-er ikke finnes fra før
- destination ikke introduserer duplikater

## Kjøring

```bash
node scripts/cleanup-subkultur-concrete-anchor-ids.mjs
bash scripts/check-people.sh
```

Forventede endrede filer:

- `data/people/subkultur/oslo/people_subkultur_oslo_concrete_anchors_batch4.json`
- `data/people/musikk/oslo/people_musikk_oslo.json`
- `reports/subkultur-concrete-anchor-id-cleanup-validation.md`

## Ikke gjør

- Ikke endre places.
- Ikke endre manifests.
- Ikke flytt flere people.
- Ikke endre kategori eller placeId for X-Ray eller Blå.
- Ikke endre Blitzhuset, Torggata Blad eller andre miljøankre.
