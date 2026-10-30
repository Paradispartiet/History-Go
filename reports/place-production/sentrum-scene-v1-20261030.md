# Sentrum Scene – v1 kilde- og kvalitetsrevisjon (30.10.2026)

Sted-ID: `sentrum_scene`. Canonical eier: `musikk`. Produksjonsprofil: v1-redaksjonell forbedring, ikke vFerdig/V3 complete.

## Eksisterende materiale og omfang
Gjenbruker fotografier med CC BY-SA 4.0, koordinater, 30 quizspørsmål fordelt på fem sett (6+6+6+6+6), ett QuizCard på ti spørsmål, eksisterende claim-register med 24 verifiserte påstander og den kanoniske Story-ID-en.

## Kildekritisk funn
Eldre Story påsto feilaktig at konsertscenen åpnet i 1992. Sceneweb skiller konferansesenter i 1992 fra konsertscene i 2005; Auditorium AS overtok i 2006 ifølge Rockefeller. Oslo byleksikon dokumenterer Ove Bang, Inger Sitter, 1956-premieren, okkupasjonsbruken og gjenåpningen i 1945. Forveksle ikke Samfunnshusets ulike saler, heller ikke Rockefeller/John Dee med Sentrum Scene.

## Redaksjonell endring
- Story-revisjon beholder ID og presiserer 1940, 1945, 1956, 1988, 1992, 2005 og 2006, men unngår oppkonstruerte hendelser.
- Stedseiet Fagverk v2 med tre egne fagavsnitt, tre linser og fysiske spor/fortolkningsgrenser.
- Ni redigerte spørsmål bytter ut meta-spørsmål om interne emne-ID-er og generisk læringsspråk med dokumenterte hendelser, personer og arkitektur. Alle 30 spørsmåls-ID-er og fem sett beholdes.
- QuizCard velger ti faktaspørsmål fra manifestregistrert fullquiz; fasit, svaralternativer og Knowledge-tekst skal være identiske.
- `underbadge_ids: ["konsertsteder"]` er innenfor canonical Musikk-badge.
- Mulige People: Ove Bang (arkitekt) og Inger Sitter (veggdekorasjon). Ingen ny personprofil/tilknytning opprettes uten separat People-kilde- og ID-kontroll; personene er foreløpig dokumentert i historie og quiz.

## Kilder
- https://oslobyleksikon.no/side/Sentrum_kino
- https://oslobyleksikon.no/side/Samfunnshuset
- https://sceneweb.no/nb/venue/37610/Sentrum_Scene
- https://magasin.oslo.kommune.no/byplan/moderne-og-allerede-klassikere
- https://www.rockefeller.no/booking-utleie-sentrumscene
- https://www.rockefeller.no/om-oss

## Etterkontroller
Kjør målrettet 30/30 manifestparitet og QuizCard 10/10, Story/årstall, Fagverk og preflight; regenerer Knowledge, Fagverk-release og Place-open. Ingen full katalogregresjon før merge. V1 og full place completion er ulike modningstrinn.

## Kvalitetsgate
Korrekthet/evidens: 5 (primær- og leksikonkilder med eksplisitte skillelinjer).
Dekning: 4 (v1 inkludert quiz, Story, bilder og Fagverk; People-fullprofil og appgjennomspilling ikke dokumentert).
Redaksjonell kvalitet: 5 (stedshistorisk 1956-hendelse, akustikk, funksjonsendring).
Teknisk integritet: 4 (målrettet 30/30 fullquiz-, 10/10 QuizCard-, Fagverk-, Story- og Knowledge-kontroll samt genererte runtime-artefakter bestod i GitHub Actions 41105244246).
Ansvarlighet: 5 (kildeskille og ingen oppdiktede konsert- eller People-referanser).
Etterprøvbarhet: 5 (stabile ID-er, konkrete kilder og særskilt rettetid).

**Samlet v1-vurdering:** 28/30 (5 + 4 + 5 + 4 + 5 + 5). Alle seks dimensjoner minst 4/5. Dette er godkjent v1-revisjon, ikke påstand om fullstendig place-production-vFerdig; ytterligere People/Objects/Brands/Productions-arbeid gjenstår før en slik status.
