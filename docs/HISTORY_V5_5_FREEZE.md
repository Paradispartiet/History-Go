# Historie V5.5 — historisk kvalitetsbaseline

Status: **historical** — reproduserbar baseline, ikke aktiv fag-, deknings- eller kvalitetskontrakt.  
Sist kontrollert: **2026-07-26**

## Autoritetsgrense

V5.5 dokumenterer den første permanente kvalitetsfrysen for den kuraterte kjernen på 20 domener, 200 emner, 826 begreper og 200 teoriobjekter. Dokumentet bevarer beslutningen og kontrollmodellen som historisk sporbarhet.

Aktiv autoritet ligger nå i:

```text
data/fag/historie/historie_v5_contract.json
data/fag/historie/historie_v5_7_freeze_manifest.json
reports/historie-v5/historie-v5-7-quality-depth.json
docs/HISTORY_UNIVERSAL_COVERAGE.md
data/fag/historie/historie_universal_coverage_contract_v1.json
reports/historie-universal-coverage/historie-universal-coverage.json
```

V5.5 og V5.6 er historiske, reproduserbare baselines. Den aktive universelle Historie-modellen er V5.7. Dette dokumentet eier derfor ingen aktiv kontrakt og skal ikke brukes til å overstyre V5.7-kontrakten, V5.7-manifestet eller den uavhengige heldekningsauditen.

## Historisk fryseomfang

Frysemanifestet `data/fag/historie/historie_v5_5_freeze_manifest.json` bevarer SHA-256-fingeravtrykk for V5.5-kontrakten og de daværende autoritative filene.

V5.5-frysen dokumenterte at den valgte strukturen var utfylt, individuelt kuratert og beskyttet mot stille regresjon. Den beviste ikke at hele historiefaget var universelt dekket.

Den globale dybdeauditen avdekket restgjeld som den tidligere validatoren ikke målte. Før V5.5-frysen ble følgende reparert i canonical-dataene:

- 544 manglende begrepsfelt for indikatorer og kildekrav;
- 70 teoriobjekter som manglet en tredje, eksplisitt avgrensning;
- én semantisk relasjon til et ikke-eksisterende begrep.

Etter reparasjonen hadde alle 826 begreper minst to indikatorer og to kildekrav, alle 200 teorier minst tre begrensninger, og relasjonsintegriteten var uten ukjente mål. Den daværende dybdeauditen fikk status `PASSED`, og V5.5-manifestet fikk status `FROZEN`.

## Hva frysen ikke beviser

`FROZEN`, `FREEZE_READY` og fulle interne domenetall viser at et definert inventar er kontrollert. De er ikke en uavhengig måling av nødvendige tidsperioder, historiske felt, geografier, aktørperspektiver eller produksjonslag.

Universell fagdekning eies derfor av den canonical heldekningspolicyen, den maskinlesbare dekningskontrakten og den materialiserte dekningsrapporten. Så lenge rapporten har status `INCOMPLETE`, skal heller ikke V5.7 omtales som et bevist komplett historiefag.

## Compatibility-navn

Følgende paths beholder foreløpig V5.5-navnet av kompatibilitetshensyn:

```text
tools/audit-historie-v5-5-quality-depth.mjs
.github/workflows/history-v5-5-quality-freeze.yml
```

Navnene er historiske. Verktøyet leser aktiv kontrakt, V5.7-readiness, V5.7-manifest og V5.7-rapport, og workflowen heter og kjører **History V5.7 quality freeze**. Path-navnet gjør dem ikke til aktive V5.5-kontrakter.

## Historisk endringsprosedyre

V5.5-frysen etablerte prinsippet om at autoritative fagfiler bare skulle endres gjennom en eksplisitt, faglig begrunnet PR med grønne kvalitetsporter og et bevisst oppdatert frysemanifest.

Prinsippet videreføres for aktiv versjon, men den konkrete prosedyren og de aktive fingeravtrykkene eies nå av V5.7-kontrakten, V5.7-auditen og V5.7-manifestet.

## Forholdet til evidenslag

V5-seriens fagobjekter kan brukes som godkjent faglig input, men dokumenterte claims, kilder, kildekvalitet, alternative fortolkninger og place evidence skal ligge i egne evidenskontrakter og produksjonslag. `evidence_ready` skal ikke endres bare fordi et versjonert inventar er frosset.
