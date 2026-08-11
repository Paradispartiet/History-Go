# Torggata – fase 7 popupfaner closeout V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md` og `docs/PLACE_POPUP_SYSTEM.md`
- Fase-7-audit: PR #4817 / merge `16c790fcf809b879f0a029e6e3eb7b7dd079ec56`
- Status: **FASE 7 GODKJENT**

## Godkjente delsteg

| Delsteg / fane | Status | Merge |
| --- | --- | --- |
| Om / 7A | **GODKJENT** | PR #4820 / `49b79250403bdbfd6db0a4d07aa57887fa7eefe4` |
| Historie / 7B | **GODKJENT** | PR #4822 / `20f775df7a7c09f3d0c1debaa2d2d45a16431d68` |
| Fortellinger / 7C | **GODKJENT** | PR #4824 / `d07c55f1ec9b790bfa64b26cf7d3c87d3d4c7771` |
| Før/etter / 7D | **GODKJENT** | PR #4826 / `3c6b12635438ef07947a82f972d09a0eab50ff6e` |
| Nyheter | **BEGRUNNET N/A** | ingen relevant canonical Torggata-notis dokumentert |
| Lesespor | **BEGRUNNET N/A** | eksisterende Torggata-koblinger er subscription/paywall og filtreres fra åpen stedflate |
| Kilder / 7E | **GODKJENT** | PR #4827 / `364bdec196aef811bb3d2f2cb76fa4fc994068ae` |
| Mer | **BEGRUNNET N/A** | ingen Torggata-post i Språkleksikon og ingen canonical Mer-pakke som bør fylles kunstig |

## Sluttresultat

### Om

- fase-5 `popupDesc` er hovedartikkel og beholdes;
- fase-6 `spatial_profile` og `subplaces` vises;
- manifest-lastet Torggata-hovedartikkel har kildebårne facts og prioriteres foran ukildet legacy fallback.

### Historie

- fem `history_layers` beholdes;
- Leksikon chronology har seks korte, kildebårne milepæler: 1846, 1852, 1876, 1929, 1986 og 2014;
- navnløs legacy-extra undertrykkes bare via eksplisitt opt-in;
- chronology og Story holdes adskilt.

### Fortellinger

- nøyaktig én Torggata-story beholdes;
- Storyen er migrert til `episode_v1`, canonical type `conflict`;
- primært episodeanker er bystyrevedtaket i 2010;
- tematisk Markveien-`next_scenes` er fjernet;
- Stories governance passerte.

### Før/etter

- ekstern faktabasis erstatter interne History Go-/Wonderkammer-kilder;
- 2009/2017 Commons-bilder har fotograf, CC BY-SA 3.0, dato og kildeside;
- teksten sier eksplisitt at kamerastandpunktene ikke er identiske;
- fysisk gateombygging skilles fra udokumentert automatisk gentrifiserings-/leiekausalitet.

### Kilder

- alle syv `source_summary.safe_sources` har inspectable HTTPS-oppslag i det sammenslåtte source-laget;
- Eldorado og Torggata bad har egne navngitte lenker;
- Arkitektur skaper verdi, TØI og begge Commons-kildesidene har meningsfulle labels;
- runtimeens eksisterende URL-deduplisering gjør at navngitte configured links vinner over generiske Før/etter-lenker;
- ingen intern audit-/production-URL er gjort brukerrettet.

## CI og avgrensning

7A, 7B, 7C og 7E ble merget etter grønne relevante porter.

7D hadde grønne Torggata-relevante porter, inkludert Places data, Place description governance og TypeScript. Den eneste røde workflowgruppen var en dokumentert, arvet Film/TV-templatefeil i Category and quiz governance på base `main`; 7D berørte ikke Film/TV eller quiz templates. Feilen ble eksplisitt avgrenset i PR #4826 før merge og skal ikke behandles i denne stedstråden.

## Stoppregel

Fase 7 skal ikke åpnes på nytt bare fordi en tom N/A-fane senere kan fylles. Nyheter, Lesespor eller Mer gjenåpnes først når det finnes konkret nytt canonical materiale som består sin egen kontrakt.

Torggata kan nå gå videre til **fase 8: PlaceCard-rundinger**, etter obligatorisk tidligere-arbeid-gate og lesing av `data/places/README_place_rounds.md`.
