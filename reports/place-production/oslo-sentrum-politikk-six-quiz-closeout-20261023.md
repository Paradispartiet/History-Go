# History GO – Oslo sentrum Politikk seks steder: produksjonsstatus

**PR:** https://github.com/Paradispartiet/History-Go/pull/6579

**Steder:** Høyesteretts hus, Folkets Hus, Høyres Hus, Høyblokka, Victoria terrasse og historiske Y-blokka.

## Levert på arbeidsgrenen

- Fagverk: 6 av 6 stedsspesifikke, registrerte blokker
- Bilder: 12 virkelige, kildekrediterte WebP-filer, `image` + `frontImage` per sted, uten nye `cardImage`
- Fullquiz: 6 × 3 sett × 7 flervalgsspørsmål = **126**
- QuizCard: 6 × 10 = **60**, koblet til de kanoniske quizspørsmålene
- Knowledge: 126 av 126 canonical quizspørsmål med `linked` etter regenerering
- Source briefs: 6; produksjonskontekster: 6; manifestkoblinger: 6
- Folkets Hus: fem eksisterende spørsmåls-ID-er bevart, kildekritisk svak fasade-slutning skrevet om
- Redaksjonelt grunnlag: 143 kandidatspørsmål, hvorav 3 markert HOLD. Ikke-kvalitetssikrede kandidater ble holdt utenfor de innførte settfilene.

## Kontroll som gjenstår før v1/merge

1. Den målrettede quizkontrollen har passert, men full ordinær PR-CI må være `success` på siste GitHub-commit og dokumenteres.
2. Full manuell/ekstern redaksjonell claim–distraktor–kildegjennomgang på **hver av de 126 publiseringskandidatene**, særlig plausibilitet og ikke-ledende svaralternativer. Noen kilder har bare bekreftet kjernepåstanden.
3. Browser- og reell appkontroll for smal mobil og desktop: bilder, bildelisens, stedskort, QuizCards, fullquiz, Knowledge og Fagverk. Særlig historisk datostempel for Y-blokka og Høyblokka.
4. Kontroller at den separate GPS-opplåsingsfeilen og stedshoppingen ikke påvirker disse seks stedene. Denne PR-en har ikke endret GPS-logikk.
5. Globalt `audit:quiz-manifest:v2` har en **forhåndseksisterende** fehlende sett-ID på *Nasjonalmuseet*. Ikke endre denne andre arbeidslinjen uten egen oppgave. Produksjonsjobben krevde eksakt denne kjente baseline-avviket og ingen nye avvik.

**Beslutning:** Dette er en teknisk komplett **quiz- og bildeintegrert draft**, men **ikke redaksjonelt eller browser-QA-godkjent v1**. Ikke endre PR til ready eller merge uten kontrollene ovenfor.

## Teknisk etterrettelse av full PR-CI – 23. oktober

Etter quiz- og Knowledge-regenerering krevde standardkontrollen at `data/fagverk/fagverk_release.json` ble regenerert mot det nå oppdaterte `data/fag/fag_manifest.json`; dette er gjennomført og --check bestod. `reports/knowledge-contract-audit.json`, et generert diagnostikkprodukt på 1,6 MB, er tatt ut av Git slik at repo-hygienens 500 KiB-grense overholdes. [Rettet med GitHub Actions #39948914426](https://github.com/Paradispartiet/History-Go/actions/runs/39948914426). Ingen quiz-, Place- eller bildetekster er endret i denne oppryddingen.

Ordinære PR-tester på commit etter oppryddingen må fortsatt bestå. Ingen v1-erklæring eller merge uten kontroll av faktisk appvisning og faglig gjennomgang av de innførte distraktorene.

## Andre redaksjonelle revisjon – svaralternativer, 23. oktober 2026

På arbeidsgrenen ble 27 fullquizspørsmål gjennomgått med **53 forbedrede feilalternativer** fordelt på alle seks stedene. 25 tilhørende alternativtekster i 13 QuizCard-spørsmål ble endret tilsvarende; dessuten ble to tvetydige alternativer i et *annet* Y-blokka-spørsmål presisert. Spørsmåls-ID-er, fasit, Knowledge-koblinger, kilde-URL-er og settrekkefølge ble beholdt.

Konsistenskontrollen sammenlignet alle 60 QuizCards med kanonisk fullquiz på spørsmålsformulering, tre alternativ, fasit og svarindeks: **60/60 samsvar, null avvik**. Seks kanoniske quizfiler har fortsatt tre sett med sju spørsmål per sted, totalt 126.

Nyere datoer er kryssjekket mot offisielle kilder: Regjeringens omtale 13. april 2026 av åpningen av første byggetrinn i regjeringskvartalet og UD i D-blokka (https://www.regjeringen.no/no/aktuelt/det-nye-regjeringskvartalet-offisielt-apnet/id3155987/), og Riksantikvarens markering av fredningen av Victoria terrasse 21. mars 2025 (https://riksantikvaren.no/kalender/fredingsmarkering-victoria-terrasse/).

**Avgrensning:** Dette er delvis redaksjonell kvalitetsforbedring og teknisk paritetskontroll; den er **ikke** uavhengig kilde–påstand–distraktor-evaluering av samtlige 126 oppgaver. Skjermbilder og faktisk apprespons på smal mobil og desktop er fortsatt ikke dokumentert. Gjennomfør disse portene før v1-godkjenning og merge. Oslo-bolk 04 og andre arbeidsspor er ikke berørt.
