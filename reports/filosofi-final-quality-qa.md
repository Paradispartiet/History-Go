# Filosofi – slutt-QA for faglig kvalitet

## Status

**QA-resultat: ikke bestått.** Filosofi beholder den canonicale sluttstrukturen fra PR #5002 og registry-reconciliation fra PR #5004, men skal ikke regnes som kvalitativt lukket før denne quality-repairen er fullført.

Dette er **ikke** en ny completion-runde. Canonicalen forblir 20 hovedfelt, 68 artikler, 204 begreper, 34 metoder, 51 hooks og 20 kapitler. Reparasjonen gjelder kvalitet, statusintegritet og permanente kvalitetsporter.

## Hva slutt-QA-en fant

Stikkprøven leste faktisk prosa på tvers av argumentasjon/logikk, etikk, sosial epistemologi, estetikk, globale tradisjoner, språkfilosofi, religionsfilosofi, rettsfilosofi, fysikkfilosofi, sannsynlighetsfilosofi og teknologi/AI.

Mange artikler har reell faglig substans: identifiserbare filosofiske problemer, faktiske rivaler, argumentrekonstruksjoner, navngitte primærverk og emnespesifikke sekundærkilder. Problemet er derfor ikke at hele fagverket er tomt eller må produseres på nytt.

QA-en avdekket likevel systematiske avvik som gjør at `68/68 university_depth_reviewed` ikke kan brukes som tilstrekkelig kvalitetsbevis:

1. **Statuskonflikt i artiklene.** Code search på `main` finner 50 artikkelfiler som fortsatt inneholder `quality.review_state: "requires_substantive_rewrite"`, selv om toppnivået samtidig kan stå som `editorial_quality: "university_depth_reviewed"`. Dette er den alvorligste feilen: sluttstatusen kan overstyre artikkelens egen kvalitetsdom i stedet for å bevise at den er reparert.
2. **Generator-/malprosa finnes i faktisk artikkeltekst.** Flere artikler bruker identiske eller nær-identiske kvalitetsfraser, blant annet `ikke som navnegjetting`, standardsetningen om at et begrep må «gjøre arbeid i argumentet», og generiske metode-/problemformuleringer. Slike setninger kan være redaksjonelle huskeregler, men de skal ikke stå som substansiell universitetsprosa eller fungere som kvalitetsbevis.
3. **Kildeprosa kan være feilkopiert mellom emner.** `Kinesisk filosofi` deklarerer kinesiske sekundærkilder i `source_ids`, men kildeseksjonen navngir også sekundærkilder om indisk, islamsk, afrikansk og latinamerikansk filosofi som om de var artikkelens fem kilder. Dette viser at kildetall og gyldige IDs alene ikke er nok; kildedrøftingen må faktisk samsvare med emnet.
4. **P1/P2/P3/K er ikke i seg selv et problem.** Flere rekonstruksjoner er faglig reelle. Feilen oppstår hvis formen eller metadataflagget brukes som proxy for substans. Kvalitetsporten skal derfor teste argumentankere, rivaler, kildebruk og intern konsistens – ikke bare forekomst av seksjoner eller labels.

## Permanent kvalitetskontrakt

Filosofi kan først gå til maintenance-only når alle 68 artikler oppfyller følgende uten selvmotsigende metadata:

- et faktisk filosofisk problem er formulert presist;
- minst én substansiell posisjon og en reell rival rekonstrueres på emnets egne premisser;
- primærverk brukes når en navngitt filosofs verkargument står sentralt;
- sekundærkilder er emnespesifikke og samsvarer med den faktiske kildedrøftingen;
- generator-/malprosa er ikke kvalitetsbevis og fjernes der den erstatter faglig formulering;
- `editorial_quality`, `quality.review_state` og `reviewed_against_university_gate` må være konsistente;
- ingen obligatorisk ekstern fagreview-gate innføres.

`tests/fagverk-filosofi-final-quality.test.mjs` er lagt til som permanent guard for statusintegritet, kjent malprosa, kildekonsistens og reell bruk av primærverk.

## Reparasjonsscope

Reparasjonen skal være kirurgisk: behold gode argumenter, rivaler, verkreferanser og artiklenes canonicale eierskap; omskriv eller fjern generisk filler; korriger feil kildedrøfting; og sett review-status til `university_depth_reviewed` først etter faktisk artikkelvis kontroll. Canonical counts fra #5002/#5004 skal ikke endres.

Når alle 68 artikler består den permanente quality-guarden og CI er grønn, kan Filosofi lukkes kvalitativt og gå over til maintenance-only. Fremtidige endringer skal da begrenses til konkrete faglige feil, bedre kilder, nye relevante case/steder, bedre begrepskoblinger eller dokumentert manglende faglig dekning.
