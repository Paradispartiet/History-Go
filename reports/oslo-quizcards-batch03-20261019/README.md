# Oslo – 20 nye QuizCards, 19. oktober 2026

## Leveranse og avgrensning

20 nye tekstbaserte kort med 200 eksisterende spørsmål. 14 steder i Næringsliv, fem i By og ett i Historie. Spørsmål, alternativer, fasit og eksisterende Knowledge-ID-er er bevart. Kortene har egne kildehenvisninger, og svake eller omstridte spørsmål er utelatt. Forklaringer som bare sa «Kildekontrollert spørsmål» eller gjentok et kort svar, er redigert til faktisk historisk kontekst. Ingen fullquiz er forkortet eller skrevet om.

Dette er en QuizCard-/integrasjonsbolk: ingen canonical Place, produksjonsprofil, samling, bilde eller V3-fullføringsstatus revideres. READ-FIRST/preflight for ny eller vesentlig revidert fullprofil utløses derfor ikke. Nye v1: **0**. Nye vFerdig: **0**. Bilde- og helhetsaksept for disse 20 stedene er ikke del av leveransen.

## Kilde- og redaksjonskontroll

Alle 200 valgte spørsmål er lest med alternativer, fasit og forklaring; minst én faktisk åpnet kilde er ført i `reviewed_source_urls` per spørsmål. Opprinnelige referanser står separat, også når de ikke ble gjenåpnet. Kommunale beskrivelser, institusjonshistorikk, Bane NOR, Sporveien, Norges Bank, Nasjonalmuseets ressurshefte og lokale oppslagsverk er brukt. Kildesidene er ikke kopiert inn i rapporten.

To direkte dateringskonflikter er holdt utenfor de nye kortene: Seildugsfabrikkens nedleggelse (1976/1978) og Høyesteretts innflytting i Gamle rådhus (1815/1821). Grev Wedels plass har et kildeavvik: quizens oppgitte kilde angir bare 1860-årene, mens kommunens Oppdag Kvadraturen bekrefter 1869; kortet bruker et annet spørsmål. Eksisterende fullquizer krever et eget reparasjonsløp før disse spørsmålene endres. Seks næringslivsmål er ført i den separate reparasjonskøen med konkret årsak.

## Runtime

Næringsliv-manifestet manglet både i den canonicale PlaceCard-loaderen og i kompatibilitetskontrolleren. Begge runtimebaner, samt TypeScript-kilden til kompatibilitetskontrolleren, registrerer nå manifestet. De allerede publiserte vernene mot asynkrone stedsskifter er flyttet tilbake til TypeScript-kilden og beholdt i begge bygde utgaver. Øvrig runtimeatferd er bevart. Nye kort registreres i kategoriens eksisterende manifest; ingen konkurrerende target-ID-er eller bildebaserte kort lages.

## Målrettede kontroller

```bash
node --test tests/oslo-quizcards-batch03.test.mjs tests/place-quizcards-category-manifests.test.mjs tests/oslo-v1-quizcard-manifest-binding.test.mjs
node tests/oslo-quizcards-batch03-browser-audit.mjs
```

Datakontrollen undersøker alle 20 kort/200 spørsmål, bytehash for uendrede fullquizer, fasit, Knowledge-ID-er, unike mål og begge faktiske resolverbaner. Nettleserkontrollen starter ekte `index.html`, bruker appens egne funksjoner og DataHub, og prøver alle 20 steder ved 390 og 768 px: riktig kort, ti spørsmål, fasit, vanlig pekerklick, stor visning, Escape, Enter og Space. Ingen testbilder eller testerstattede appfunksjoner.

GitHub Actions: **Oslo twenty QuizCards / Verify twenty native PlaceCard QuizCards**. Den eksakte PR-headens resultat og artefakt `oslo-twenty-quizcards-review` eier kjørebeviset. Bilder og fysisk mobil er ikke godkjent gjennom denne kontrollen. Ordinær CI skal også være grønn før merge.

## Steder

| Sted | Kategori | Spørsmål |
| --- | --- | ---: |
| Oslo Havnelager | naeringsliv | 10 |
| Tollbukaia | naeringsliv | 10 |
| Lodalen jernbaneverksted | naeringsliv | 10 |
| Den gamle Norges Bank | naeringsliv | 10 |
| Akershuskaiene | naeringsliv | 10 |
| Akers mekaniske Verksted | naeringsliv | 10 |
| Grensen – handelsgate | naeringsliv | 10 |
| Fiskehallen på Vippetangen | naeringsliv | 10 |
| Frysja industriområde | naeringsliv | 10 |
| Norges Varemesse – Sjølystsenteret | naeringsliv | 10 |
| Bryn industriområde | naeringsliv | 10 |
| Grønlikaia | naeringsliv | 10 |
| Christiania Seildugsfabrik | naeringsliv | 10 |
| Norges Bank – Bankplassen 4 | naeringsliv | 10 |
| Sagene skole | historie | 10 |
| Gamle trikkestallen på Torshov | by | 10 |
| Gamle rådhus | by | 10 |
| Stortorget | by | 10 |
| Grev Wedels plass | by | 10 |
| Sofienbergparken | by | 10 |

Den eldre generelle fliptesten er tilpasset den allerede publiserte containerbaserte typografien: den kontrollerer nå de responsive skriftgrensene og at hele tittelen faktisk passer, i tillegg til uendrede krav for stor visning. CSS er uendret. Den nye native testen velger et faktisk synlig treffpunkt på høye kort og bruker fortsatt vanlige pointerkontroller uten `force`.
