# Minneparken – sluttintegrasjon 11. november 2026

## Gjeldende beslutning

PR #6966 er fortsatt draft mens faktisk mobil-/desktop-QA og endelig CI
kontrolleres. Ingen main-merge eller produksjonsdeploy hevdes i denne rapporten.
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
