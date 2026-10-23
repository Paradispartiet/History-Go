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

## Sluttkontroll – konkrete distraktoravvik, 23. oktober 2026

Kontrollert GitHub-head før revisjon: `26b08d39e3866cc9d0ad615c024371575f6d8944`. Alle 21 registrerte arbeidsflyter var completed/success, inkludert real app browser QA og fullquiz live playthrough. Dette er maskinelt testbevis; skjermbildene er ikke visuelt godkjent i denne revisjonen.

Sju spørsmål fikk fjorten nye feilalternativer; to berørte QuizCard-spørsmål er synkronisert. Korrekte svar, indeks, spørsmåls-ID, Knowledge og kilder er uendret. Endringene fjerner anakronistiske, faglig usammenlignbare eller åpenbart uvedkommende valg: unionsoppløsning/flom ved 22. juli, middelalderglass/laft ved naturbetong, dramatiker/komponist ved billedkunst, høyesterettslokale/jernbaneterminal ved Folkets Hus og bank/Røde Kors ved tysk politi. Nye alternativer er hypoteser som skal avvises, ikke nye historiske påstander.

Reviderte ID-er: `hoyblokka_card_05`, `hoyblokka_card_06`, `hoyblokka_fullquiz_research_17`, `folkets_hus_fullquiz_research_12`, `folkets_hus_fullquiz_research_17`, `hoyres_hus_fullquiz_research_16`, `hoyres_hus_fullquiz_research_18`.

Fortsatt redaksjonell blocker: `hoyres_hus_card_10` tester hva fasaden ikke dokumenterer og inngår i de ti QuizCard-spørsmålene; dette oppfyller ikke kravet om ti direkte stedsspesifikke faktaspørsmål. `hoyesteretts_card_10` har samme metaspørsmålstype i fullquiz. `victoria_terrasse_card_10` er et generelt normativt spørsmål i åpningsblokken. Disse trenger kildebårne erstatninger med oppdatert brief/Knowledge/paritet. Andre åpenbare feilalternativer og datotung progresjon må inngå i full sluttgjennomgang. Ingen fullstendig kilde–påstand-godkjenning gis her.

Avgrenset verifikasjon før commit: alle endrede spørsmål har tre forskjellige alternativer, gyldig indeks og bevart fasit; QuizCard synkronisert fra canonical fullquiz. Ny ordinær CI kreves på revisjonscommit.

Kvalitetsporten består ikke ennå: korrekthet/evidens 3/5 (full kildepassasjeaudit gjenstår), dekning 3/5 (metaspørsmål gjenstår), redaksjon 3/5 (konkrete forbedringer, fortsatt svakheter), teknisk integritet 4/5 (21 grønne før endringen; ny CI avventes), ansvarlighet 4/5 (historisk ansvar avgrenset, ingen nye fasitpåstander), etterprøvbarhet 4/5 (ID-festet revisjon og bevart paritet). Sum 21/30; draft beholdes.

## Visuell gjennomgang av CI-artefakt 12504098676

Alle 36 skjermbilder fra head `26b08d39` er gjennomgått som tre oversiktsark (front, quizcard, fagverk) med to skjermbredder og seks steder. Foto og Fagverk-forsider vises. Y-blokka er tydelig omtalt som historisk/revet. Men QuizCard-skjermbildene viser i stedet nedrullet stedstekst og tom kortflate uten synlige spørsmål; de dokumenterer ikke godkjent kortlesbarhet. Testen kontrollerte tekst i DOM og flipklasse, men ikke kortets plass i skjermutsnittet. Screenshot rettes til selve det rendrerte kortet etter scrolling og positiv skjermgeometri.

Historisk fotodatering er en faktisk uløst blocker: rapporten har `historicalYearVisible:false` for både Høyblokka og Y-blokka på mobil og desktop, men status ble likevel grønn. Reproduksjon: les artefaktets report.json og assert at ingen checks har historicalYearVisible === false; kontrollen feilet med akkurat disse fire kombinasjonene. Browser-testen strammes inn til å feile etter bevisopptak når årstallet mangler. Dette løser testens falske grønnstatus; det hevder ikke at bildedatering i appen er rettet. Ny CI og nye kortbilder må vurderes før godkjenning.

Ytterligere kontrollpunkt: Høyblokkas Fagverk-forside sier 1959, mens quiz og stedstekst bruker 1958. Skill ferdigstillelse og datering i kildegrunnlaget før sluttreview. Ingen publisering eller v1-godkjenning er gitt.

## Rettelser etter reprodusert sluttkontroll – 23. oktober 2026

- **Korrigering av forrige visuelle observasjon:** Påstått 1959-avvik var en feillesning av nedskalert oversiktsark. Originalen `hoyblokka-mobile-fagverk.png` og canonical `fagverk.intro` viser begge **1958**. Ingen årstallsendring er nødvendig.
- `hoyres_hus_card_10` spør nå hvem som står bak det blå Tivoli-skiltet (Oslo Byes Vel), støttet av Oslo byleksikon, Stortingsgata nr. 20, avsnittet om skiltet.
- `victoria_terrasse_card_10` spør nå om salgsplanen som aktualiserte fredningen, støttet av Riksantikvarens fredningsomtale, avsnittet Eiendommen skal selges og begrunnelsen fra Hanna Geiran.
- `hoyesteretts_card_10` spør nå om prøvingsretten i Grunnloven § 89, støttet av Stortingets sak 66436, Vedtak i korthet (vedtak 14. mai 2020). Rettslig kontroll skilles fra politisk hensiktsmessighet og valgoppslutning. Maktfordelingsbindingen er konkretisert.
- Disse tre spørsmålenes claim-baser, source briefs, produksjonskontekster og berørte QuizCards er oppdatert. Knowledge er regenerert fra endrede påstander; gamle generiske forklaringer gjenbrukes ikke som fasitgrunnlag.
- Historisk bildetekst fra eksisterende `imageMeta.historicalCaption` rendres nå synlig i PlaceCard ved bildet. DOM-test viste først forventet feil, deretter bestått datering, tømming ved stedsskifte og trygg tekstvisning.
- Browser-kjøring 40007481517 avdekket også `Element is not attached to the DOM` under kortfotografering: to eksisterende renderere skrev samme QuizCard på nytt ved bakgrunnshydrering. Begge beholder nå identisk kort-DOM når data er uendret, men oppdaterer ved endret kortinnhold. En DOM-identitetstest feilet før rettelsen og består etterpå. TypeScript-kilde og deployede JS-bundler er bygget sammen.

### Utført lokal verifikasjon

`npm run build:web`, `npm run typecheck:web`, `npm run knowledge:canonical:write`, `npm run audit:quiz-content`, `npm run audit:quiz-production-context`, `npm run audit:quiz-progression`, `npm run audit:quiz-theory-binding`, `npm run audit:quiz-templates`, `npm run test:quiz-content-audit`, `node scripts/build-place-open-payloads.mjs --check`, samt sju DOM-/QuizCard-regresjoner bestod. Innholds-auditen rapporterer globale redaksjonelle advarsler; exit 0 er ikke redaksjonell sluttgodkjenning. Knowledge rapporterte 0 feil og eksisterende advarsler (451 uløste emnekoblinger, 2853 varselspørsmål globalt).

Lokal Playwright-nedlasting feilet med ugyldig/tom zip fra nettverkskanalen; dette er ikke en bestått browser-kjøring. GitHub Actions brukes til ny faktisk mobil-/desktopkontroll. PR beholder draft til ny CI, visuell kontroll og full kilde–påstand–distraktor-review er godkjent.

### Uavhengig review og siste innholdsrevisjon

En separat reviewer har lest alle 126 spørsmålsformuleringer, alternativer, fasiter og forklaringer. Reviewen fant ikke en etablert faktafeil i de kontrollerte originalkildene, men krevde flere konkrete forbedringer. Full kildepassasje-godkjenning av alle 126 er fortsatt ikke etablert.

Revidert etter review: Folkets Hus spør direkte om foreslått ekstra ukekontingent og funnet av overvåkingsanlegget; Y-blokkas doble riveårspåstand er erstattet med planlagt mellomlagring på Johan Nygaardsvolds plass; sluttdelen for Høyres Hus sammenligner de dokumenterte sentrale/lokale kontorfunksjonene, og Victoria terrasse tester hva en framtidig kjøper må ta hensyn til i det konkrete fredningsvedtaket. Teoribindingene er presisert uten å framstille fortolkninger som stedlige primærfakta. Åtte andre stem-/distraktortekster er forbedret med sammenlignbare alternativer. 1912/1913- og 1969/1970-spørsmål ble uttrykkelig holdt utenfor på grunn av kildeskillene.

Teknisk review fant at full bildetekst under tittelen ble klippet bort ved sticky rulling. Bildeteksten ligger nå foran tittelraden i bevart region; browser-testen ruller og kontrollerer reelle rektangler innenfor den synlige bildehoderegionen. Controlleren bruker den eksisterende canonicale kort-rendereren i appen, slik at første async renderer ikke avgjør alternativmarkeringen.

Knowledge-overføringen måtte gå gjennom GitHub-tilkoblingen fordi lokal git-push manglet legitimasjon. En engangsjobb gjenopprettet de lokalt kontrollerte filbytene med SHA-256 `727842aba92570ce5ade25aceac6a70f68994e06becd784f504150e5210a47d3` og slettet seg selv. En siste begrenset patchoverføring gjør det samme etter siste innholdsrevisjon; formatteringen skal være eksakt, ikke en svekket determinismekontrakt.

### Kildepresisjon og strengere visuell evidens – siste oppfølging

Separat reviewer kontrollerte alle 21 Y-blokka-spørsmål mot tilgjengelige kildepassasjer. Klimakravet gjelder behandling av søknaden for søndre del, ikke all riving. Formuleringen er rettet. Regjeringens bygningshistorikk oppgir 2020 for riving; Statsbygg oppgir rivingsperioden 2020–2021. Spørsmålet attribuerer nå året uttrykkelig til bygningshistorikken, uten å konstruere en forklaring på forskjellen. Det ubekreftede felles monteringsåret 2024 er fjernet; KOROs omtale fra april 2026 støtter plasseringen i/på A-blokka. Direkte kildebindinger for arkitekt, kunstnere og opprinnelige plasseringer er styrket. Spørsmålet om arkitektonisk sammenheng markeres som tolkning.

GitHub-kjøring 40014302752 på 5c0fe2df bestod alle tolv mobile/desktop-kombinasjoner, historisk bildetekst og hydrering. Artefakten inneholder 40 bilder. Visuell kontroll fant imidlertid at QuizCard-bildene fanget den lange, rullbare etterkommeren i stedet for det avgrensede snudde kortet. Disse tolv bildene godkjennes ikke. Testen krever nå ferdig 180-graders transformasjon og treff på baksiden ved faktisk skjermkoordinat, og tar både kortutsnitt og viewport. Fersk kjøring må bestå og bildene må gjennomgås før visuell sluttgodkjenning.

TypeScript guard på samme head fant én ny feil i bildeteksthjelperens parameter. Hjelperen tar nå unknown og validerer metadataobjektet før bruk. Lokal root-typekontroll viser etter rettelsen bare de eksisterende diagnostikkene i andre filer; ny GitHub-guard gjenstår.

Status er fortsatt utkast, ikke v1-godkjent eller publisert. Bestått CI fra tidligere head erstatter ikke sluttkontroll av siste head. De seks foreslåtte nye stedene skal eventuelt produseres i en separat PR.
