# Torggata – fase 8A1 People audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Foregående gate: `reports/place-production/torggata-phase8a-people-audit-v1.md`
- Styrende metode: `docs/people-of-places-method.md`
- Status: **8A1 IMPLEMENTERT – MERGE-GATE GJENSTÅR**

## Omfang

8A1 omfatter bare Torggatas dokumenterte byggere, arkitekter og teaterledere. Jensen-familien tilhører 8A2, og beboere/arbeidende/minnespor tilhører 8A3.

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
8A1-BRANCH/PR FRA FØR: ingen funnet
EKSISTERENDE CANONICAL PROFILER: thorvald_meyer, henrik_bull, christian_morgenstierne, arne_eide
NYE KANDIDATER ETTER FERSKT REPO-SØK: thoger_binneballe, harald_olsen, alma_fahlstrom, johan_fahlstrom
BESLUTNING: REELT NYTT ARBEID – gjenbruk fire eksisterende profiler og opprett fire manglende, uten å flytte eksisterende primærankere
```

## Gjenbrukte profiler

| ID | Beholdt primæranker | Ny Torggata-kobling | Evidens |
| --- | --- | --- | --- |
| `thorvald_meyer` | `birkelunden` | `places[] += torggata`; Bade- og Vadskeanstalten i Torggata 16 | Oslo byleksikon – Torggata bad |
| `henrik_bull` | `nationaltheatret` | `places[] += torggata`; 1903-ombyggingen av Eldorado/Fahlstrøms Theater | Oslo byleksikon – Fahlstrøms Theater |
| `christian_morgenstierne` | `folketeateret` | `places[] += torggata`; dagens Torggata bad | Oslo byleksikon – Torggata bad |
| `arne_eide` | `folketeateret` | `places[] += torggata`; dagens Torggata bad | Oslo byleksikon – Torggata bad |

Ingen av de fire eksisterende personene er duplisert eller flyttet til nytt primærsted.

## Nye canonical profiler

| ID | Rolle ved Torggata | Canonical plassering |
| --- | --- | --- |
| `thoger_binneballe` | murmester for Bade- og Vadskeanstalten i 1861 | `people/by/oslo/torggata/` |
| `harald_olsen` | arkitekt for Eldorado varietéteater i Torggata 9 | `people/by/oslo/torggata/` |
| `alma_fahlstrom` | instruktør og teaterleder ved Fahlstrøms Theater | `people/litteratur/oslo/torggata/` |
| `johan_fahlstrom` | skuespiller og teaterleder ved Fahlstrøms Theater | `people/litteratur/oslo/torggata/` |

De fire nye profilene har `torggata` som primæranker, konkret rollebeskrivelse og inspectable HTTPS-kilder. Ingen lokal bildepath er oppdiktet; `image` og `cardImage` står tomme når sikkert lisensiert portrett ikke er materialisert.

## Manifest og runtime-readiness

De fire nye splitfilene er lagt én gang hver i `data/people/manifest.json`. Eksisterende aggregate/split-profiler beholdes i sine opprinnelige eierskap, slik at People-loaderen kan samle dem gjennom `places` uten å skape parallelle canonical personer.

## Regresjonsport

`tests/torggata-phase8a1-people.test.mjs` låser:

- nøyaktig de åtte 8A1-ID-ene i denne batchen;
- unike ID-er;
- bevarte primærankere for de fire gjenbrukte personene;
- `torggata` i `places[]` for alle åtte;
- minst én inspectable HTTPS-kilde per koblet person;
- Torggata som primæranker for de fire nye profilene;
- ingen oppdiktede bildepaths for de fire nye;
- nøyaktig én manifestoppføring per ny splitfil;
- Henrik Bulls konkrete 1903-arbeid og Thorvald Meyers Torggata 16-anker.

## Avgrensning

Denne batchen endrer ikke:

- Torggata-place-record eller koordinater;
- `desc`, `popupDesc` eller strukturerte place-profiler;
- Story, Før/etter, Kilder eller andre popupfaner;
- Quiz;
- Jensen-familien (8A2);
- beboere, arbeidende og minnespor (8A3);
- Brands, Objects eller Structures.

## Godkjenningsgate

8A1 kan settes **GODKJENT** når målrettet regresjonstest og relevante repo-audits/CI er grønne på samme PR-head og PR-en er squash-merget til `main`. Hele 8A forblir pågående etter 8A1; neste delsteg er 8A2 Jensen-handel.
