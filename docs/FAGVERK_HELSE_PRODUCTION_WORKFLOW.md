# Fagverk Helse — produksjons- og CI-flyt v2

Status: **canonical prosess for Helse-domener**  
Sist kontrollert: **2026-08-23**

Helse bruker én registry-drevet kvalitetsgate. Nye domener skal ikke opprette egne GitHub Actions-workflows eller CI-only PR-er for source brief og fulltext.

## Canonical eiere

- Domenerekkefølge og script/test-kontrakter: `.github/ci/fagverk-helse-domain-registry-v1.json`
- Permanent CI-runner: `scripts/run-helse-domain-ci-v1.mjs`
- Permanent workflow: `.github/workflows/fagverk-helse.yml`
- Cumulative kvalitet: eksisterende Helse-/Fagverk-auditer, aktiv domenetest og cumulative tester

CI-registryet ligger bevisst under `.github/ci/`, ikke under `data/fagverk/**`. Det er orkestreringsmetadata, ikke produktdata, og skal derfor ikke vekke irrelevante fagspesifikke workflows bare fordi Helse-gaten endres.

## Produksjonsrekkefølge

Source-first-prinsippet består:

1. research og source/claim brief;
2. review av claims, grenser og kilder;
3. fulltext/materialisering;
4. domain audit og permanent test;
5. cumulative Helse/Fagverk-audit;
6. deterministisk output-kontroll.

Disse er **review-checkpoints**, ikke obligatoriske separate CI-PR-er.

Normal leveranse er én eller to fokuserte PR-er:

- **source/evidence + content/fulltext i én PR** når grensene er stabile og checkpointene kan reviewes separat i samme diff; eller
- **source/evidence PR + content/fulltext PR** når researchbeslutningen er en reell risikogrense som bør etableres først.

Det skal ikke lenger lages følgende per domene:

- `*-source-brief.yml`;
- `*-fulltext.yml`;
- en egen «Add permanent ... source-first CI»-PR;
- en egen «Add permanent ... fulltext CI»-PR;
- TEMP writeback/writer-PR bare for å få genererte filer inn på permanent branch.

## Hva den generiske gaten gjør

Den registry-drevne runneren:

- leser faktisk `registeredChapterCount`;
- validerer registry-kontrakten og at alle tidligere materialiserte domener fortsatt har sine permanente scripts/auditer/tester;
- kjører source-first brief + source-test for neste domene når et neste domene finnes;
- re-materialiserer/auditerer og tester siste registrerte domene deterministisk;
- kjører cumulative progress, subject inventory, general engine, theory quality/integrity og release-check **én gang**;
- kjører cumulative/shared tester i samme Node testprosess;
- kjører ikke historiske fase-tester blindt på senere N/12-tilstander når testen selv låser et eldre eksakt chapter count; slike tidligere domener eies da av cumulative audit;
- feiler hvis deterministiske genererte Helse/Fagverk-output ikke matcher branchens committed state.

Kvalitetskrav er dermed fortsatt monotone; bare duplisert GitHub-orkestrering og ugyldig replay av historiske fase-checkpoints er fjernet.

## Nytt domene eller endret kontrakt

Når et framtidig Helse-domene legges til eller kontrakten utvides:

1. legg/oppdater domain entry i `.github/ci/fagverk-helse-domain-registry-v1.json`;
2. legg source brief-script + test;
3. legg fulltext materializer + audit + test når innholdet materialiseres;
4. bruk den eksisterende `.github/workflows/fagverk-helse.yml`;
5. endre den generiske runneren bare dersom selve Helse-produksjonskontrakten har fått en ny generell capability.

Ikke kopier en workflow fra et gammelt domene.

## TEMP-regel

Disposable GitHub workflow/PR skal ikke brukes som normal writeback- eller proof-mekanisme. Genererte outputs materialiseres på den faktiske arbeidsgrenen og den permanente generiske gaten verifiserer determinismen på eksakt PR-head.

En egen midlertidig diagnostisk branch er bare berettiget når den undersøker en farlig/ukjent runtime- eller produksjonstilstand som ikke kan observeres gjennom permanente read-only verktøy. Slike tilfeller skal være unntak, ikke produksjonsmetoden.

## Kort regel

**Source-first og full faglig kontroll består. Én generell Helse-gate eier CI. Nye domener tilfører innhold og tester — ikke nye workflowkopier.**
