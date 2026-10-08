# History Go — separat quizproduksjonsløp

**Status:** Operativ arbeidsdeling. Innholdsreglene eies fortsatt utelukkende av `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`.

## Formål og eierskap

Stedsproduksjon og quizproduksjon kan foregå uavhengig og i separate PR-er, men deler samme canonical `place_id`/`targetId` og source-grunnlag. Denne filen er en arbeidsruter, **ikke** en konkurrerende quizkontrakt.

- **Stedsproduksjonen** eier identitet, koordinater, kilder, Badge-/underbadge-routing, beskrivelser, Fagverk, PlaceCard, QuizCard/flip og statusoverlevering.
- **Quizproduksjonen** eier eksistensaudit, faktisk eksternt kildegrunnlag, påstandsbank, utvalg, adaptiv settplan, spørsmål, troverdige feilalternativer, kilde- og Knowledge-koblinger, quizregistrering og quiz-QA.
- **Integrasjonen** kontrollerer at riktig `categoryId` og `targetId` når riktig quiz, at ingen legacy-alias eller person/sted-ID er forvekslet, og at den fysiske besøksgaten og QuizCard-handlingen virker.

## Fra dekningsrapport til aktiv quizoppgave

Utgangspunkt per 8. oktober 2026: `reports/quiz-place-coverage-2026-10-08.csv`. Rapporten viste 308 av 1 533 steder med eksplisitt quizkobling. Rapportstatus er et *snapshot*, ikke sannhet etter senere merges; oppdater og sammenlign mot gjeldende manifest og stedsindeks før en ny produksjonsbatch.

Velg ett sted eller én tydelig avgrenset batch. Før spørsmål skrives må produsenten:

1. verifisere canonical `targetId`, kategori, stedsscope og eksisterende manifest/aktive-/arkiverte quizfiler;
2. skille **ikke registrert**, **eksisterende quiz på annen ID**, **ferdig quiz med mangelfull kobling** og **reelt spørsmålshull**;
3. kontrollere relevant `source_brief`, fagmanifest og alle `required_inputs`, og gjennomgå eksterne kilder;
4. bygge stedets påstandsbank før settplan og spørsmål;
5. la `QUIZ_PRODUCTION_CANONICAL.md` styre valg av antall sett, normalåpning, progresjon, quizfelter og synkronisering med Knowledge;
6. kjøre quiz- og innholdsvalideringer, teste registrering og quizåpning, kontrollere korrekt premie-/besøkssemantikk og gjennomføre PR/CI på exact head.

Eksisterende godt innhold bevares. Nye quizfiler for samme bygg/sted skal ikke lages uten først å avklare alias, tidligere quiz og kategoriscope. Eksempel til særskilt audit: `operahuset` (sted i Scenekunst) versus eldre `operaen` (quizmål i By).

## Arbeidsstatus

I arbeidsrapporter kan quizarbeidet skilles som **mangler/ukjent**, **eksisterende under audit**, **kildegrunnlag klart**, **quizpakke i produksjon**, **quiz faglig godkjent**, **integrasjon godkjent**. Disse er beskrivende arbeidsstatuser, ikke nye maskinelle V3-statusverdier; schema, generatorer og existing `PASS`/`BLOCKED` skal ikke endres ved dokumentasjonsvedtak alene.

Et sted kan være **canonical stedsinnhold ferdig** før quizen. Stedet kan ikke merkes **`SLUTTFØRT`/spillbart fullført** mens en obligatorisk quiz, QuizCard/flip eller korrekt runtime-binding mangler. Stedschecklisten viser den reelle integrasjonsstatusen uten å eie produksjonen av spørsmålene.

## Kontroller og PR-grenser

Ren quiztekst eller quizdata må testes med Quiz Production Canonical og relevante quiz-/Knowledge-gater. Endringer som også treffer genererte manifests, release-feeds eller PlaceCard-runtime krever synkronisering og kontroll av disse avhengighetene før merge. En rød avledet gate er ikke grunn til å svekke kvalitetskravet; identifiser den presise genererte input-/output-grensen.

Ikke bruk stedschecklisten som spørsmålsmal. Ikke behold falsk dekning ved å koble en quiz til en annen canonical identitet bare fordi navnet ligner.

Relevante styrende dokumenter:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`
- `docs/PLACE_PRODUCTION_V3.md`
- `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`
- `data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json`
- `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`
