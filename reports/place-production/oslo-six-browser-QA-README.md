# History Go – seks Oslo-steder: offline QA

Dette er en **intern, isolert forhåndsvisning** av seks forskningskandidater fra PR #6563. Den er ikke den samme som det ordinære History Go-grensesnittet. Ekebergrestauranten og Frognerseteren er også integrert som canonical Place-kandidater på PR-grenen; de øvrige fire stedene er ikke integrert.

Pakk ut hele GitHub Actions-artefaktet `oslo-six-browser-review.zip` uten å flytte enkeltfiler. Åpne deretter `reports/place-production/oslo-six-browser-review.html` i en vanlig nettleser. Stilarket, visningsskriptet og de 15 WebP-bildene finnes i samme uttrekk og bruker relative filbaner.

Naviger mellom stedene, åpne Fortelling, QuizCard, Fullquiz og Fagverk, besvar spørsmålene og bytt mellom hovedbilde, kortbilde og popupbilde. Fotoenes opphav og lisens følger med bildevisningen. Denne forhåndsvisningen lagrer **ingen** poeng, QuizCard-progresjon eller besøksdata og oppretter **ingen** kartmarkører.

**Ingen av de seks stedene er bekreftet publisert som v1 på main.** To er integrert på PR-grenen, ikke ferdig sertifisert. De fire andre stedene må senere få kildegodkjent fortelling og quiz, geografisk oppmøtepunkt og radius, godkjente bilde- og fotoattributter i ordinært PlaceCard, korrekt Knowledge/Fagverk/quiz-registrering og sluttkontroll av den faktiske appen. Kristiania Teglverk mangler fortsatt sikkert fotografi og avklart besøksposisjon.

Tekst og quiz hentes av `scripts/build-oslo-six-browser-review.mjs` fra eksisterende kilder. Filen med HTML genereres av CI og er ikke en ny canonical sannhetskilde.

## Synkronisering og sluttport, 24.10.2026

Quizprogresjonen for de to integrerte kandidatene er korrigert, og genererte Knowledge-filer for By/Historie samt Fagverk-release-manifestet er gjenoppbygd. Disse filene skal kontrolleres i ordinær siste-head CI; at en generator har fullført gir ikke automatisk godkjent app- eller nettlesertest. Kristiania Teglverk forblir uten aktiv markør så lenge ringovnens bygningsidentitet og publikumsadkomst er uavklart. Ikke slå sammen PR #6563 som sekssteds-v1 før de øvrige tre besøksankrene og integrasjonene er dokumentert og verifisert.
