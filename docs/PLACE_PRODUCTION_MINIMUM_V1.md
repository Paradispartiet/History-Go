# Stedsproduksjon: v1 først, vFerdig etterpå

Vedtak 17. oktober 2026: Innfør to **innholdsnivåer**, ikke to konkurrerende canonicale stedssannheter.

## v1 – spillbar grunnversjon

For et ordinært sted er minimum:
- Korrekt sted-ID, koordinat og kategori; kort **historisk** `desc` og selvstendig, stedsspesifikk `popupDesc` med kildegrunnlag.
- Ett ekte foto/illustrasjon av riktig sted med dokumentert opphav, publiseringsrett og relevant format. Ikke erstatt med generisk illustrasjon, tilfeldig bilde eller CSS-maskert `frontImage`.
- **Nøyaktig ti**, forskjellige, forståelige, kildebelagte faktaspørsmål med verifisert fasit og troverdige alternativer. Ett v1-sett; normalåpningen for full quiz med to eller flere sett er uendret.
- Ett QuizCard med **de samme ti spørsmålene** og korrekt fasit. Ikke dupliser et allerede eksisterende QuizCard; revider og gjenbruk.
- Faktisk registrering i quizmanifest og quizkortkatalog, og målrettet sted-/quiz-integrasjon.

Dette er en egen **minimumsprofil**, `minimum_v1_1x10`, ikke `narrow`, `normal`, `rich` eller `major` fra full quizproduksjon. Fullproduksjonens `3×7`, `4×7`, etc. blir ikke nedjustert. Når full quiz publiseres, revideres/utvides de ti spørsmålene i samme stedlige kunnskapsløp; ingen konkurrerende aktiv dublett.

## vFerdig – komplett sted

Eksisterende `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_V3.md`, kategoriavhengige samlinger, full Fagverk, person-/gjenstands-/verk-/historieproduksjon, relevante bildetyper, QuizCard, Knowledge og manual review gjelder uendret. Bare `vFerdig` tilsvarer `complete` i fullworkflow. v1 skal aldri sette V3-`state: complete` eller gjøre en blokkert fullprofil grønn.

## Gjennomføring uten unødvendige kontroller

1. Hent gjeldende stedsindeks og quiz-/QuizCard-manifester; bevar eksisterende ferdige steder, quiz og assets.
2. Prioriter allerede dokumentert tekst + korrekt publiserbart bilde; produser/forbedre de ti spørsmålene og QuizCard i **samme batch**.
3. Lag egen bildekø for steder uten publiserbart bilde. Manglende bilder skal markeres som faktisk rest, aldri erstattes av en fiktiv PASS. Tekst/quiz kan produseres uavhengig før bildene blir klare.
4. Produser helst 20–50 steder om gangen etter de første integrasjonsavklaringene; skip kilde-/rettighetsblokkerte enkeltsteder så batchen ikke stopper.
5. Én målrettet quiz-/PlaceCard-test av ferdig batch; eksisterende ordinær CI er mergeport. Ingen gjentatte helkatalog-, nettleser- eller stedsregresjoner etter hver håndfull spørsmål.
6. Oppgrader v1-steder til vFerdig etter kildedekning og faktisk stedskompleksitet; ingen omstart eller sletting av kvalitetssikret v1-innhold.

## Første innholdsleveranse

`data/places/production-tiers/v1-oslo-by-20261017-batch01.json` eier det første **batchnotatet** (ikke en ny V3-workflow). Den første runden gjenbruker fire faktiske stedsbilder og `desc`/`popupDesc`, og erstatter generiske quizkort med 40 konkrete kildebelagte spørsmål. Den har én ti-spørsmålsquiz per sted. Nivået står først som `ready_for_targeted_validation`; ingen merge eller brukbarhet er hevdet før ordinære integrasjonsporter har kjørt.
