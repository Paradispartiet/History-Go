# Filosofi – slutt-QA for faglig kvalitet

## Status

**QA-resultat etter reparasjon: bestått.** Filosofi beholder den canonicale sluttstrukturen fra PR #5002 og registry-reconciliation fra PR #5004. Den dedikerte quality-repairen har nå reparert statuskonfliktene, kildeprosaen, kjente generator-/malmønstre, manglende substantive fagankere og en redaksjonell skjøtefeil i teorihistorien som ble oppdaget i manuell stikkprøve etter første grønne repair-run.

Dette var **ikke** en ny completion-runde. Canonicalen forblir 20 hovedfelt, 68 artikler, 204 begreper, 34 metoder, 51 hooks og 20 kapitler. Reparasjonen gjaldt kvalitet, statusintegritet og permanente kvalitetsporter.

## Hva slutt-QA-en fant

Stikkprøven leste faktisk prosa på tvers av argumentasjon/logikk, etikk, sosial epistemologi, estetikk, globale tradisjoner, språkfilosofi, religionsfilosofi, rettsfilosofi, fysikkfilosofi, sannsynlighetsfilosofi og teknologi/AI.

Mange artikler hadde allerede reell faglig substans: identifiserbare filosofiske problemer, faktiske rivaler, argumentrekonstruksjoner, navngitte primærverk og emnespesifikke sekundærkilder. Problemet var derfor ikke at hele fagverket var tomt eller måtte produseres på nytt.

QA-en avdekket likevel systematiske avvik som viste at `68/68 university_depth_reviewed` alene ikke var et tilstrekkelig kvalitetsbevis:

1. **Statuskonflikt i artiklene.** 50 artikkelfiler bar fortsatt `quality.review_state: "requires_substantive_rewrite"` selv om toppnivået kunne stå som `editorial_quality: "university_depth_reviewed"`. Reparasjonen gjør nå intern review-state og universitetsport konsistente.
2. **Generator-/malprosa i faktisk artikkeltekst.** Identiske kvalitetsfraser og generiske metode-/problemformuleringer ble fjernet eller erstattet med emnespesifikk argument-, rival-, metode- og begrepsprosa. Den permanente testen blokkerer de kjente mønstrene.
3. **Feilkopiert kildeprosa.** `Kinesisk filosofi` deklarerte kinesiske sekundærkilder i `source_ids`, men kildeseksjonen navnga også sekundærkilder om andre tradisjoner. Kildedrøftingen er nå bygget fra artikkelens faktiske kilder, og permanent QA krever samsvar mellom deklarerte kilder og kildeseksjonen.
4. **Manglende substantive fagankere.** En artikkel kunne deklarere et `required_anchor` uten å bruke det i argument, uenighet eller teorihistorie. Reparasjonen kontrollerte hele det reviewede corpuset og materialiserte manglende ankere i den faktiske debatten før universitetsporten fikk passere.
5. **Redaksjonell transformasjonsartefakt.** Manuell stikkprøve etter en grønn repair-run fant en feilskjøtt Ramsey-referanse i sannsynlighetsartikkelen. Feilen ble rettet på tvers av corpuset, og `fagverk-filosofi-final-quality.test.mjs` har nå en permanent guard mot tilsvarende teorihistoriske regex-skjøter.
6. **P1/P2/P3/K er ikke i seg selv et problem.** Flere rekonstruksjoner er faglig reelle. Formen eller metadataflagget kan derimot ikke brukes som proxy for substans. Kvalitetsporten tester derfor argumentankere, rivaler, kildebruk, primærverk og intern konsistens i tillegg til struktur.

## Permanent kvalitetskontrakt

Alle 68 artikler skal oppfylle følgende uten selvmotsigende metadata:

- et faktisk filosofisk problem er formulert presist;
- minst én substansiell posisjon og en reell rival rekonstrueres på emnets egne premisser;
- deklarerte fagankere brukes i argument, uenighet eller teorihistorie;
- primærverk brukes når en navngitt filosofs verkargument står sentralt;
- sekundærkilder er emnespesifikke og samsvarer med den faktiske kildedrøftingen;
- generator-/malprosa er ikke kvalitetsbevis og blokkeres når den erstatter faglig formulering;
- teorihistoriske reparasjoner kan ikke etterlate mekaniske skjøteartefakter;
- `editorial_quality`, `quality.review_state` og `reviewed_against_university_gate` må være konsistente;
- ingen obligatorisk ekstern fagreview-gate innføres.

`tests/fagverk-filosofi-final-quality.test.mjs` er permanent guard for statusintegritet, kjent malprosa, kildekonsistens, reell bruk av primærverk, substantive fagankere og teorihistoriske transformasjonsartefakter. `Fagverk Filosofi phase 3` kjører denne guarden sammen med de eksisterende completion-, editorial-style- og university-depth-portene.

## Reparasjonsresultat

Reparasjonen beholdt gode argumenter, rivaler, verkreferanser og canonicalt eierskap, men omskrev eller fjernet generisk filler, korrigerte kildedrøfting, materialiserte manglende fagankere og samordnet review-status først etter at artikkelprosaen passerte kvalitetskontrakten. Midlertidige repair-skript og one-shot-workflows er fjernet; bare corpusendringene, denne QA-rapporten, den permanente testen og den ordinære Filosofi-workflowens nye guard står igjen.

Den dedikerte repair- og cleanup-kjøringen besto hele Filosofi-kontrakten. Endelig repo-status er likevel først låst når ordinær PR-CI på den endelige menneske-eide headen er grønn og PR #5016 er merget. Etter merge går Filosofi over til maintenance-only. Fremtidige endringer begrenses til konkrete faglige feil, bedre kilder, nye relevante case/steder, bedre begrepskoblinger eller dokumentert manglende faglig dekning.
