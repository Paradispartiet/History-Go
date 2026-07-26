# Historie V5.5 — permanent kvalitetsfrys

Status: **FROZEN** etter individuell kuratering av 20 domener, 200 emner, 826 begreper og 200 teoriobjekter.

## Hva som er frosset

Frysemanifestet `data/fag/historie/historie_v5_5_freeze_manifest.json` inneholder SHA-256-fingeravtrykk for kontrakten og alle filene som `historie_v5_contract.json` peker ut som autoritative.

V5.5 er den kuraterte faglige basen. V6 skal legge til kilde-, claim- og stedsevidens i egne kontrakter og skal ikke stille endre V5.5-objektene.

## Hva frysen ikke beviser

`FROZEN`, `FREEZE_READY` og 20/20 interne domener betyr at den valgte V5.5-strukturen er utfylt, individuelt kuratert og beskyttet mot stille regresjon.

Dette er ikke bevis på at hele historiefaget er universelt dekket. De gamle portene sammenligner dataene med et forhåndsvalgt inventar på 20 domener og 200 emner; de tester ikke uavhengig om nødvendige tidsperioder, historiske felt, geografier eller aktørperspektiver mangler.

Universell fagdekning eies derfor av:

```text
data/fag/historie/historie_universal_coverage_contract_v1.json
tools/audit-historie-universal-coverage.mjs
reports/historie-universal-coverage/historie-universal-coverage.json
reports/historie-universal-coverage/historie-universal-coverage.md
```

Så lenge denne auditen har status `INCOMPLETE`, skal V5.5 omtales som en gjennomarbeidet og frosset kjerne — ikke som et bevist komplett historiefag.

Dersom heldekningsauditen avdekker et reelt faglig hull, skal det lukkes gjennom en begrunnet og versjonert fagendring. Frysen kan ikke brukes til å blokkere nødvendig faglig utvidelse, men den skal fortsatt hindre ubegrunnede eller skjulte omskrivinger.

## Materialisert kvalitetsløft

Den globale dybdeauditen avdekket restgjeld som den tidligere V5.5-validatoren ikke målte. Før frysen ble følgende reparert i canonical-dataene:

- 544 manglende begrepsfelt for indikatorer og kildekrav;
- 70 teoriobjekter som manglet en tredje, eksplisitt avgrensning;
- én semantisk relasjon til et ikke-eksisterende begrep.

Etter reparasjonen har alle 826 begreper minst to indikatorer og to kildekrav, alle 200 teorier minst tre begrensninger, og relasjonsintegriteten er uten ukjente mål. Dybdeauditen har status `PASSED`, og frysemanifestet har status `FROZEN`.

Leksikalske ankervarsler er informative, ikke blokkerende: de brukes som manuell kontrollliste for definisjoner der bøyning, sammensatte ord eller en bevisst faglig parafrase gjør at label-tokenet ikke gjentas ordrett. De skal ikke masseendres automatisk, fordi ordrett repetisjon i seg selv ikke dokumenterer bedre faglig kvalitet.

## Permanent kvalitetsport

`tools/audit-historie-v5-5-quality-depth.mjs` kontrollerer blant annet:

- `FREEZE_READY`, 20/20 domener og null registrerte kvalitetsfeil;
- eksakte dekningsmål for domener, emner, mappings, begreper og teorier;
- unike og tilstrekkelig spesifikke begrepsdefinisjoner;
- gyldige semantiske relasjoner uten selvlenker eller ukjente mål;
- særskilt misbruksvern, indikatorer, kildekrav og proveniens for alle begreper;
- individuelle teoridefinisjoner, minst tre fagspesifikke begrensninger, metodekobling, tenkersti og source hook;
- at alle V5.5-teorier fortsatt har `evidence_ready: false`;
- at autoritative filer fortsatt matcher frysemanifestets SHA-256-fingeravtrykk.

GitHub Actions-workflowen `history-v5-5-quality-freeze.yml` kjører porten ved alle relevante pull requests og ved endringer på `main`.

## Bevisst endringsprosedyre

En autoritativ V5.5-fil kan bare endres når:

1. endringen er eksplisitt avgrenset og faglig begrunnet i en egen PR;
2. permanent V5.5-validator og dybdeaudit er grønne;
3. Knowledge- og quizkontraktene fortsatt passerer;
4. frysemanifestet oppdateres bevisst med `--write-freeze` og en konkret `--reason=...`;
5. PR-en viser hvilke fingeravtrykk og kvalitetsmål som endres.

En manifestoppdatering er ikke en måte å omgå porten på. Verktøyet skriver bare nytt manifest når samtlige innholdskrav er bestått.

## Forholdet til V6

V6 kan bruke V5.5 som godkjent faglig input, men dokumenterte claims, kilder, kildekvalitet, alternative fortolkninger og place evidence skal ligge i nye V6-filer. `evidence_ready` skal først endres gjennom V6-kontrakten, ikke ved å omskrive den frosne V5.5-basen.

<!-- V5_8_ACTIVE_MODEL:START -->
## Aktiv modell etter tredje heldekningsreparasjon

V5.5–V5.7 beholdes som historiske, reproduserbare baselines. Den aktive universelle Historie-modellen er **V5.8**, som legger til domenet **Den kalde krigen og etterkrigssamfunnet 1945–1991** med ti emner, femti begreper, ti teoriobjekter og sju nye metoder.

Compatibility-stien `tools/audit-historie-v5-5-quality-depth.mjs` beholdes foreløpig, men validerer aktiv V5.8-kontrakt og V5.8-manifest. Eksakte tellinger beskytter inventaret; universell heldekning avgjøres fortsatt separat av den uavhengige dekningsauditen.
<!-- V5_8_ACTIVE_MODEL:END -->
