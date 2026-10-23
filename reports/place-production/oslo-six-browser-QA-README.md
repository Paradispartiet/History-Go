# History Go – seks Oslo-steder: offline QA

Dette er en **intern, isolert forhåndsvisning** av seks upubliserte steder fra PR #6563.

Pakk ut hele GitHub Actions-artefaktet `oslo-six-browser-review.zip` uten å flytte enkeltfiler. Åpne deretter `reports/place-production/oslo-six-browser-review.html` i en vanlig nettleser. Stilarket, visningsskriptet og de 15 WebP-bildene finnes i samme uttrekk og bruker relative filbaner.

Naviger mellom stedene, åpne Fortelling, QuizCard, Fullquiz og Fagverk, besvar spørsmålene og bytt mellom hovedbilde, kortbilde og popupbilde. Fotoenes opphav og lisens følger med bildevisningen. Denne forhåndsvisningen lagrer **ingen** poeng, QuizCard-progresjon eller besøksdata og oppretter **ingen** kartmarkører.

**Ingen av de seks stedene er publisert i History Go.** Stedene må senere få kildegodkjent fortelling og quiz, geografisk oppmøtepunkt og radius, godkjente bilde- og fotoattributter i ordinært PlaceCard, korrekt Knowledge/Fagverk/quiz-registrering og sluttkontroll av den faktiske appen. Kristiania Teglverk mangler fortsatt sikkert fotografi og avklart besøksposisjon.

Tekst og quiz hentes av `scripts/build-oslo-six-browser-review.mjs` fra eksisterende kilder. Filen med HTML genereres av CI og er ikke en ny canonical sannhetskilde.
