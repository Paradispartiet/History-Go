# Minneparken – sluttintegrasjon 11. november 2026

## Kontrollsnapshot før endelig merge

Gjeldende merge- og CI-status føres i [PR #6966](https://github.com/Paradispartiet/History-Go/pull/6966). Denne rapporten dokumenterer kontrollen før merge.

Dette er et historisk snapshot fra 11. november da PR-en ennå var utkast.
Gjeldende sluttintegrasjon og evidens er oppdatert i seksjonen 12. november nedenfor.
Ingen main-merge eller separat produksjonsdeploy er foretatt ved rapportskrivingen.
Historie-innholdets A–H er kilde- og redaksjonskontrollert; dette er ikke det
samme som at hele app-leveransen er ferdig godkjent.

Arbeidet er samkjørt med `main a855755c52ed7f01c350eb5f2ac42709bbf05385`.
Det nye kandidatinnholdet er først publisert til PR-grenen i `779b1710921b62b9014114df3735202a53183aed`;
`2341b92479b39a91e1d8e8cf66c7cc4fa8f48fb5` retter materialiseringen i app-testen.
Den etterfølgende aktiveringscommiten er en separat, reviewbar endring.

## Faktisk ferdigstilt innhold

- Separat stående `frontImage`, 800 × 1200, fra Ssus foto 19. august 2025.
  Opptaksdato, fotograf, CC BY-SA 4.0 og crop er registrert. Bildet fra 2007
  beholdes som et eksplisitt historisk bilde; ingen av bildene kalles 2026-foto.
- Gerhard Fischer og Harry Fett er nye canonical People med individuelle
  profiler, claims, setningsmapping og identitetskontrollerte Commons-portretter.
  Begge nye profilene består People Profile-validatoren uten feil.
- Objects: Gudrun på Hauges gravstein og det katalogførte gravminnet over
  Magdalena Frantzdotter/Jens Nilssøn. Medlemsbilder, kilde, rettigheter og
  usikker nåværende plassering er ført for hvert objekt.
- Historiske hendelser: parkåpningen i 1932 og avdekkingen i 2024. Fotoene
  merkes som senere kontekstbilder og utgis ikke for bilder av selve hendelsen.
- Adaptiv PlaceCard-profil med tre samlinger. Kandidataudit av stedsnavn,
  forvaltningsaktører og prosjektaktører ligger i gjeldende workcard.
- Alle 21 quizfasiter og Knowledge-forklaringer gjennomgått; distraktorer
  revidert til sammenlignbare alternativer. Ti QuizCard-spørsmål speiler
  fullquiz nøyaktig. Ingen Knowledge-påstand eller ID er omskrevet.
- Kildebundet Story har gjennomgått separat seksleddet narrativ kontroll.
  Quiz-, QuizCard- og Story-manifester aktiveres i draften før endelig app-QA.
- Datert nyhetsnotis om det faktiske besøket i juni 2026 og et åpent Lesespor
  om avdekking, murverk og rekonstruksjon. Ingen kopiert artikkelfulltekst.
- Indekser, Place-open, People-/scenario-People, Lesespor, Stories og Fagverk
  materialiseres med repositoryets generatorer.

## F – dagens spor og den faktiske kildegrensen

[Besøksrapporten fra Kolsås Rotaryklubb](https://kolsas.rotary.no/no/nyhetsdetaljer/201)
er skrevet av Tore Nedrebø og publisert 11. juni 2026. Den omtaler besøket
9. juni og viser deltakerne ved Hallvardskatedralens ruiner. Kilden er åpnet,
og fotografiet er inspisert. Dette er førstehåndsdokumentasjon av synlige
ruiner og besøk i 2026, ikke en opplysning om kommunens fullføringsdato.

[Oslo kommunes eiendomsside](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/)
er kontrollert på nytt. Planlagt plen, gangsti, universell tilgjengelighet,
gjerdeutforming og murtopper skal ikke omtales som ferdigstilt på grunnlag
av disse kildene. Kildene fra september/november 2025 beholder sine datoer.

Canonical F gjelder skala, årsak, usikkerhet og ferskverifiserte fysiske spor
(`PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md` §4B F). PASS betyr her at disse
forholdene er kontrollert og avgrenset; det betyr ikke at kommunen har
ferdigstilt alle parktiltak. Egen befaring og uavhengig menneskelig
fagfellesignatur er ikke utført eller antatt.

## Før/etter og kandidater som ikke publiseres

Commons-kategoriene for Minneparken og Hallvardskatedralen, 1917-arkivkandidaten,
2007-fotoet og 2025-fotoet er undersøkt. De kontrollerte bildene viser ulike
kamerastandpunkter eller andre avgrensninger. De publiseres derfor ikke som et
falskt sammenlignbart Før/etter-par. Historisk og nyere foto har sine egne
medieflater. Ingen tilfeldig kirkeruin, parkaktør eller generell gjenstand
brukes som reserve for en manglende samling.

## Kontroller og gjenværende port

- READ-FIRST med ferske filhasher: PASS.
- De to nye People-profilenes claims-/setningsvalidering: PASS.
- Minneparken: 16 målrettede kilde-, bilde-, quiz-, Knowledge- og Story-tester: PASS.
- Historie changed-mode: én pakke, null feil etter utfylt G-kontrakt.
- Målrettet quiz-kontekst: deterministisk rebuild og metadataparitet: PASS.
- Full Stories-integritet: 219 filer / 356 historier, PASS.
- Fagverk-release og Place-open bygges fra canonical data; endelig --check
  og uendret Git-tre skal være grønne på siste PR-head.
- Faktisk appkjøring på `2341b924`: tekst/PlaceCard/Fagverk mobil og desktop PASS; QuizCard desktop 10/10, flip/utvid/Escape/tastatur PASS. Mobilen avdekket 0,1 px overlapp mellom den lange bildekrediteringen og quizhandlingen. Krediteringen er redigert kortere med datoer og begge fotografnavn bevart. Ny uendret-head app-QA kreves.
- Faktisk app-QA [#43094257390](https://github.com/Paradispartiet/History-Go/actions/runs/43094257390) har bestått på `094309fb`: mobil/desktop PlaceCard, Fagverk, tre samlinger, alle åtte popupfaner, Språk-innsamling, favoritt, nær/fjern-besøkskontroll i isolert testkontekst, QuizCard 10/10 og fullquiz 21/21. Skjermbildeartefakt og endelig CI må fortsatt kontrolleres.
- Originalenes SHA-256 er registrert; distinct-photo-audit består. Utgått `cardImage` er fjernet fra kilde og runtime, og kontrakttesten krever fravær.
- Epokeindeks og Knowledge-backfill-rapport er regenerert etter aktiv Story/quiz. 39 epoketester og canonical Knowledge-check består, med null kontraktsfeil.
- Faktisk app-QA og ordinær PR-CI må leses på **samme endelige commit**.
  Tidligere kjøringer og en grønn statisk test erstatter ikke denne porten.

Den eksisterende globale People Profile-auditen rapporterte også 34 feil i
andre profiler. Ingen av feilene gjaldt de to nye Minneparken-profilene;
ingen generell katalogopprydding eller uavhengig signoff hevdes her.

## Seksdelt kvalitetsvurdering før ferdigmelding

| Dimensjon | Score | Evidens og begrensning |
| --- | --- | --- |
| Korrekthet og evidens | 5/5 | Identiteter, avgrensede claims, foto-/lisensproveniens og ærlige dateringsgrenser. |
| Dekning og ferdigstillelse | 4/5 | Tre ferdige innholdssamlinger og hele quiz/Story/Knowledge-kjeden; faktisk slutt-QA gjenstår. |
| Faglig/redaksjonell kvalitet | 4/5 | Individuelle profiler, konkrete gravminner, plausible distraktorer og separat narrativ kontroll. |
| Teknisk integritet | 3/5 | Målrettede porter består; endelig CI og faktisk app-kontroll pågår. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen falske feltbevis, signaturer, ferdigattester eller fysisk besøksregistrering. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical eierskap, generatorer, hasher, kilde-/claim- og manifestspor. |

**26/30, foreløpig.** Dette er ikke en ferdig- eller mergegodkjenning.
Teknisk integritet og dekning omscores først når den endelige app-/CI-porten
faktisk består; main-merge skal deretter verifiseres separat.


## Supplerende sluttkontroll – 12. november 2026

Dette tillegget oppdaterer kontrollsnapshotet ovenfor. Tidligere utkaststatus og
foreløpige kvalitetspoeng var riktige da de ble skrevet, ikke dagens endelige
mergebevis. PR-beskrivelsen er sannhetskilde for løpende exact-head CI og merge.

- En [ny full appakseptanse](https://github.com/Paradispartiet/History-Go/actions/runs/43162939358)
  på PR-kandidat `a913c864f7aff7f3114f67e095c34aa884eb5a62` er grønn på mobil
  og desktop. Skjermbildeartefakt `13919027211` er inspisert: de tre
  samlingene, popupvisningene, Fagverk, QuizCard 10/10 og fullquiz 21/21
  uten skrivehandling til fysisk besøksstatus. Strukturerte rapporter viser
  ingen JS-sidefeil eller ødelagte synlige bilder.
- Bildeutsnittsregresjonen [Akerselva](https://github.com/Paradispartiet/History-Go/actions/runs/43162939285)
  og [PlaceCard media](https://github.com/Paradispartiet/History-Go/actions/runs/43162939566)
  består. De oppdaterte testene bevarer bildekilde-/synlighetskrav, og følger
  `docs/PLACE_IMAGE_FRAMING.md`: `object-fit: contain`, ikke en foreldet
  `cover`-forventning. QuizCard-/hit-testing er ikke svekket.
- [Oslo sentrum Politikk real browser](https://github.com/Paradispartiet/History-Go/actions/runs/43162938935)
  og [Grini staging preflight](https://github.com/Paradispartiet/History-Go/actions/runs/43162939066)
  er grønne på samme tidligere kandidat. Ved tilleggets utforming var 48 av
  49 ordinære workflow-kjøringer grønne; en separat Oslo batch04-fullquiz- og
  QuizCard-nettleserkontroll kjørte fortsatt. **Dette er ikke påstått 49/49**.
- Kildegrensen består: besøksfoto fra juni 2026 dokumenterer synlige ruiner og
  besøk. Kommunale planer om plen, gangsti, gjerder og universell tilgjengelighet
  er ikke behandlet som ferdigattest. Ingen uavhengig menneskelig signatur
  eller egen befaring hevdes.
- Nytt main-grunnlag integreres i siste toforeldres commit. Den overlappende
  Oslo visual-browser-testen ble løst ved å bevare streng `contain`-
  **og sentreringskontroll** fra denne PR-grenen; øvrige ferske main-filer tas
  uendret med. Det innfører ikke nye Places-/Quiz-/Story-publiseringsporter.

### Seksdelt kvalitetsport for siste kandidat

| Dimensjon | Score | Etterprøvbar begrunnelse |
| --- | ---: | --- |
| Korrekthet og evidens | 5/5 | Dokumentert identitet, kilde-/claim- og foto-/lisensspor med 2026-avgrensning. |
| Dekning og ferdigstillelse | 4/5 | Tre eide samlinger, 21 quizspørsmål, 10 QuizCard-kort, 32 Knowledge-enheter, Story, språk, Fagverk og appvisning. |
| Faglig/redaksjonell kvalitet | 4/5 | Egen stedshistorie, konkrete personer/gravminner og kildekontrollert quiz/narrativ. |
| Teknisk integritet | **3/5 inntil full grønn exact-head CI; 4/5 ved PASS** | Samlet browser-/datakontroll må også passere etter siste main-integrasjon, ikke bare tidligere delkjøringer. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen falske besøk, ferdigattester eller menneskelige godkjenninger. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical data, generatorer, determinisme, synlig kilde-/testspor og avgrensede testkorreksjoner. |

**Foreløpig 26/30; 27/30 når alle 49 relevante CI-kjøringene er grønne på
eksakt endelig PR-head.** Ingen merge skal utføres før den betingelsen er
oppfylt, PR-en er teknisk mergebar og kvaliteten er kontrollert mot siste
main. Dette er ikke et forsøk på å forhåndsgodkjenne en ventende CI-jobb.
