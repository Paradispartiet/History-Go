# Historie V5.5 — permanent kvalitetsfrys

Status: **FROZEN** etter individuell kuratering av 20 domener, 200 emner, 826 begreper og 200 teoriobjekter.

## Hva som er frosset

Frysemanifestet `data/fag/historie/historie_v5_5_freeze_manifest.json` inneholder SHA-256-fingeravtrykk for kontrakten og alle filene som `historie_v5_contract.json` peker ut som autoritative.

V5.5 er den kuraterte faglige basen. V6 skal legge til kilde-, claim- og stedsevidens i egne kontrakter og skal ikke stille endre V5.5-objektene.

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
