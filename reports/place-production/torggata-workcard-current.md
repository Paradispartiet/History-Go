# Torggata – aktivt stedproduksjonskort

- Oppdatert: 2026-08-11
- Place ID: `torggata`
- Canonical source: `data/places/by/oslo/places/torggata.json`
- Styrende kontrakt: `docs/PLACE_PRODUCTION_CHECKLIST.md`
- Obligatorisk preflight-tillegg: `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md`
- Nullmåling: `reports/place-production/torggata-nullmaaling-v1.md`
- Kildebase: `reports/place-production/torggata-source-base-v1.md`
- Fase 4-audit: `reports/place-production/torggata-phase4-fagverk-audit-v1.md`

## Korrigert fasestatus

| Fase | Status | Dokumentasjon |
| --- | --- | --- |
| 0. Nullmåling | **GODKJENT** | PR #4794, merge `694310c4e9b1b009b38f530479d823621bf5a388` |
| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge `3f8d3b3a832e8604f2c1d1406365398c13e21c49` |
| 2. Kildebase | **GODKJENT** | PR #4796, merge `15ed74e57cb18940bb9fcba6b4907ac7dc862ae0` |
| 3. Koordinater/geometri | **ALLEREDE FERDIG – BEHOLD** | tidligere coordinate-produksjon, særlig PR #3773 og #3775 |
| 4. Kategori, Badges, emner og Fagverk | **PÅGÅR – KLAR FOR REVIEW** | fase-4-audit ferdig; konkret generisk Fagverk-runtimefeil rettet på aktiv branch; CI/merge/main-kontroll gjenstår |
| 5–15 | **IKKE STARTET** | styres av hovedchecklisten |

## Tidligere-arbeid-gate – koordinater

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: PR #3775 / 794e0cad02f54ba561e2af06e0ae839a95f11e52
SISTE GODKJENTE TILSTAND: verified_geometry, street_geometry_midpoint, ordnede routeSegments
KONKRET REGRESJONSEVIDENS: PR #4799 flyttet displaypunktet til Youngstorget og fjernet den tidligere routeSegments-modellen uten at tidligere ferdig coordinate-jobb først ble behandlet som baseline
BESLUTNING: REGRESJON – gjenopprett tidligere godkjent tilstand; ingen ny coordinate-produksjon
```

## Bindende coordinate-baseline

Torggata skal bruke den tidligere godkjente coordinate-tilstanden fra PR #3775:

- `lat`: `59.91700148933685`
- `lon`: `10.75330911912394`
- `r`: `180`
- `coordType`: `street_geometry_midpoint`
- `coordStatus`: `verified_geometry`
- operativt geometry-anker: `osm-way:467290774`
- ordnede `routeSegments` beholdes

Denne tilstanden ble etablert gjennom eksakt gategeometri-research i PR #3773 og anvendt/validert i PR #3775. Punktet ligger på selve Torggata-geometrien og skal ikke erstattes med et punkt midt på Youngstorget bare fordi torget inngår i den bredere gateidentiteten.

Følgende senere coordinatearbeid brukes ikke som gjeldende fasit: PR #4797, #4799, #4800 og #4802. Feilen var å gjøre om en allerede ferdig koordinatjobb uten først å kontrollere og respektere den tidligere godkjente coordinate-historikken.

## Fase 4 – tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE PR/COMMIT: Ingen tidligere PR funnet som godkjenner fase 4 etter dagens place-checklist
SISTE GODKJENTE TILSTAND: Arvet category=by, to em_by_* og Badges-runding
KONKRET REGRESJONSEVIDENS: Generisk fagverk-sted.html og Politikk-overlaget lekker Politikk-presentasjon inn i ikke-Politikk-steder
BESLUTNING: REELT NYTT AUDITARBEID – behold beståtte fagdata, rett runtimefeilen
```

### Fase 4-funn

- `category: by` er canonical og beholdes;
- `em_by_gentrifisering_eiendom` beholdes med kildebasens dokumenterte inferensgrense;
- `em_by_styring_forvaltning_planmakt` beholdes med avgrensning mot udokumentert enkel kausalitet;
- ingen `underbadge_ids` legges til bare for å fylle felt;
- `badges` finnes allerede;
- By-merket og By-faget er materialisert i portalregisteret;
- `fagverk-sted.html?place=torggata` hadde en konkret runtimeblokkering fordi den generiske siden og et etterfølgende overlay var hardkodet til Politikk.

### Fase 4-retting på aktiv branch

- generisk `fagverk-sted.html` er gjort fagnøytral;
- Politikk-integrasjonen kjører bare ved eksplisitt Politikk-identitet;
- Torggatas korrekte generiske By-rendering kan ikke lenger overskrives av tom Politikk-modell;
- regresjonstest krever Torggatas `by`-identitet, begge By-emnene, Badges-rundingen og materialisert By-portal.

Fase 4 settes først **GODKJENT** etter grønn CI, merge og kontroll på faktisk `main`. Fase 5 starter ikke før dette er gjort.
