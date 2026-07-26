# Historie V5.5 — historisk kvalitetsbaseline

Status: **HISTORICAL BASELINE** — ikke aktiv Historie-modell, heldekningspolicy eller kvalitetskontrakt.

Dette dokumentet bevarer beslutningene og kontrollene som etablerte V5.5 som en reproduserbar kvalitetsbaseline. V5.6 er en senere historisk mellomversjon. Den aktive universelle Historie-modellen er V5.7.

## Aktiv autoritet

Bruk disse kildene for gjeldende status:

```text
data/fag/historie/historie_v5_contract.json
docs/HISTORY_UNIVERSAL_COVERAGE.md
data/fag/historie/historie_universal_coverage_contract_v1.json
data/fag/historie/historie_v5_7_freeze_manifest.json
reports/historie-v5/historie-v5-7-quality-depth.json
reports/historie-universal-coverage/historie-universal-coverage.json
```

`docs/HISTORY_UNIVERSAL_COVERAGE.md` eier den menneskelesbare universelle dekningspolicyen. V5.7-kontrakten, V5.7-manifestet og de materialiserte rapportene eier aktiv modell-, kvalitets- og auditstatus.

## Historisk V5.5-frys

V5.5 ble frosset etter individuell kuratering av 20 domener, 200 emner, 826 begreper og 200 teoriobjekter.

Det daværende frysemanifestet inneholdt SHA-256-fingeravtrykk for kontrakten og alle filene som `historie_v5_contract.json` pekte ut som autoritative. Formålet var å hindre stille regresjon og ubegrunnede omskrivinger av den kuraterte basen.

V5.5-frysen dokumenterte at den valgte strukturen var utfylt, individuelt kuratert og beskyttet. Den dokumenterte ikke universell heldekning av hele historiefaget.

`FROZEN`, `FREEZE_READY` og 20/20 interne domener var derfor kvalitets- og integritetsmål for et forhåndsvalgt inventar, ikke en uavhengig test av nødvendige tidsperioder, temafelt, geografier, aktørperspektiver eller produksjonsgrunnlag.

## Historisk kvalitetsløft

Den globale dybdeauditen avdekket restgjeld som den tidligere V5.5-validatoren ikke målte. Før V5.5-frysen ble følgende reparert i canonical-dataene:

- 544 manglende begrepsfelt for indikatorer og kildekrav;
- 70 teoriobjekter som manglet en tredje, eksplisitt avgrensning;
- én semantisk relasjon til et ikke-eksisterende begrep.

Etter reparasjonen hadde alle 826 begreper minst to indikatorer og to kildekrav, alle 200 teorier minst tre begrensninger, og relasjonsintegriteten var uten ukjente mål. Dybdeauditen hadde status `PASSED`, og V5.5-manifestet hadde status `FROZEN`.

Leksikalske ankervarsler var informative, ikke blokkerende. De fungerte som manuell kontrollliste der bøyning, sammensatte ord eller en bevisst faglig parafrase gjorde at label-tokenet ikke ble gjentatt ordrett.

## Overgangen via V5.6 til V5.7

Den uavhengige heldekningsauditen dokumenterte at V5.5 var en gjennomarbeidet kjerne, men ikke et komplett historiefag.

V5.6 opprettet domenet **Forhistorie og arkeologi** og ble den første versjonerte heldekningsreparasjonen. V5.7 opprettet deretter **Første verdenskrig og mellomkrigstiden** og er nå aktiv universell Historie-modell.

V5.7 har eget aktivt frysemanifest og egen materialisert kvalitetsrapport. Når heldekningsauditen dokumenterer nye reelle hull, skal de lukkes gjennom begrunnede og versjonerte fagendringer med oppdatert kontrakt, grønn kvalitetskontroll og bevisst manifestoppdatering.

## Compatibility-navn

Følgende paths beholder foreløpig V5.5 i filnavnet av kompatibilitetshensyn:

```text
tools/audit-historie-v5-5-quality-depth.mjs
.github/workflows/history-v5-5-quality-freeze.yml
```

De er ikke bevis på at V5.5 fortsatt er aktiv modell. Auditverktøyet leser den aktive kontrakten, validerer `historie_v5_7_freeze_manifest.json` og skriver V5.7-rapporter. Workflowens visningsnavn og jobbnavn identifiserer også den aktive porten som V5.7.

## Bevisst endringsregel

Dette historiske dokumentet skal ikke brukes som prosedyre for å endre aktive fagfiler. Gjeldende endringskrav leses fra:

- `data/fag/historie/historie_v5_contract.json`;
- `docs/HISTORY_UNIVERSAL_COVERAGE.md`;
- `data/fag/historie/historie_v5_7_freeze_manifest.json`;
- den permanente V5.7-kvalitetsworkflowen.

V5.5- og V5.6-baselinene kan brukes til historisk sammenligning og sporbarhet, men kan ikke overstyre V5.7-kontrakten, den universelle heldekningspolicyen eller aktiv auditstatus.
