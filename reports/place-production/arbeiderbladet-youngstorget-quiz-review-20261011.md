# Arbeiderbladet / Dagsavisen – separat quizproduksjon

Mål: `media / arbeiderbladet_youngstorget`. Dette er quizløpet etter core PR #6212, ikke en ny adresse eller en duplisert avisidentitet. Youngstorget-perioden er 1934–1988 med okkupasjonsavbrudd; avisens navn før og etter denne perioden er uttrykkelig datert.

## Kildeledet produksjon

Den nye målidentiteten hadde ingen aktive, alternative eller arkiverte quizsett og ingen stedsspesifikke QuizCards i de auditerte registrene. Kildebriefen ble skrevet før quizfilen. Kontekstbyggeren lastet hele kategoripakken gjennom Fag-manifestet: pensum, emner, fagkart, methods, supersettmal og begge globale quizkontrakter. 28 selvstendige læringsoppgaver ga normalprofilen 4 × 7. Det er ikke en konsekvens av stedets standardprofil.

Kildegrunnlaget er Oslo byleksikons to artikler, Arbarks navnelinje, SNLs redaksjonshistorie og Stanghelle-biografi, Arbeiderpartiets samtidige beretning (PDF-side 101 / trykt side 98), det navngitte tilbakeblikket om Hasle-striden, Commons' faktisk inspiserte fotografi og faksimile samt Cambridge-kapittelets åpne summary om Hallin og Mancinis politiske parallellitet. Betalingskapitlet er ikke fremstilt som lest.

Hvert spørsmål har egen claim-ID og kildehenvisning. Direkte faktapåstander fra den verifiserte stedsbanken er bevart i claim_basis sammen med den enkelte oppgavens forklaring. Forklaringene skiller mellom bygning og avis, innflytting og innvielse, ansettelsesperioder og eget arbeidssted, nåtidig navn og historisk adresse, samtidig beretning og senere intervju. Et avisnavn, en partiforbindelse eller et fasadefoto beviser ikke en enkeltartikkels innhold eller innvendig arbeidsdeling.

## Redaksjonell kontroll

Alle 28 oppgaver, fasitsvar, distraktorer og forklaringer er gjennomgått. De første 14 er konkrete spørsmål om bygning, navn, redaktørvalg og produksjon; metode og teori introduseres først i siste sett. Siste oppgave bruker gyldig `kildekritikk / daniel_hallin` og undersøker skillet mellom institusjonelle partibånd og bevis for en konkret artikkels innhold. Den er forankret i ekstern teori og dokumentert redaktørvalg, ikke generert fra et emnenavn.

Riktige svar fordeles 9/10/9 mellom de tre posisjonene. Ingen personoppfatning brukes som objektiv fasit. Omstridt eksakt stoppdato, Larssens tiltredelsesår, Hirstis motiver og alle ansattes meninger er holdt tilbake.

QuizCard er én egen flate med ti valgte spørsmål og nummerert fasit. Kortet er registrert i kategorimanifestet og bruker samme kildebaserte spørsmål; ingen generert grafisk avisforside eller feil bruk av kortet som stedsbilde. Knowledge-ID-er kommer fra canonical generator, ikke manuell oppfinnelse. Bare registreringsdiffet og nødvendige avledede data beholdes.

## Kvalitetsvurdering før browser-QA

| Akse | Score | Belegg |
|---|---:|---|
| Faglig og faktisk korrekthet | 5/5 | Åpnede kilder, egne claim-ID-er og eksplisitte tid-/stedgrenser. |
| Omfang og fullstendighet | 4/5 | 28 oppgaver og ti kortspørsmål; faktisk avspilling og flip gjenstår ved dette checkpointet. |
| Redaksjonell kvalitet | 5/5 | Fire ulike læringsjobber, konkrete åpninger, forklarte distraktorer og utsatt metode/teori. |
| Teknisk integrasjon og verifikasjon | 4/5 | Manifest, produksjonskontekst og canonical Knowledge-synkronisering; nettleserbevis er neste gate. |
| Ansvarlighet og kildebruk | 5/5 | Publikasjonens 1884-forløper og senere navn får ikke falsk Youngstorget-datering; partsinteresse og retrospektiv sjanger presiseres. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Separat quizløp, kildebrief, deterministisk kontekst og kjørbar audit. Global Knowledge-fil er fortsatt en reviewkostnad. |

**27/30. Ikke SLUTTFØRT før reell quizavspilling, QuizCard-flip, visuell kontroll og endelig V3-closeout.** Kontrollresultater og faktisk head registreres i sluttgjennomgangen etter nettleserkjøringen.

## Faktiske kontrollresultater

Kildekontekst: 97 pakker, 0 feil; egen pakke 28 spørsmål. Progresjon: egen pakke 11 fact / 10 context / 7 concept_theory, og de første 14 kontrollert. Teori: én eksplisitt Hallin-kobling og sju metodeoppgaver, 0 feil. Quiz-manifest, runtime-wiring, QuizCard-manifest (3 tester) og canonical Knowledge-check består. Alle 28 spørsmål har Knowledge-ID-er. `place:verify` består med 9 tester og én eksisterende lokal browserskip.

Actions [38163175595](https://github.com/Paradispartiet/History-Go/actions/runs/38163175595), kildehead `e0b482d8127bd14ea292ad7af702c799b81792b0`, fullfører 28 spørsmål / fire sett på både desktop og mobil. Hvert sett lagrer progresjon én gang, fire læringshendelser blir registrert, én stedsbelønning blir gitt, og fysisk besøksstatus endres ikke. Fire UI-profiler (320, 390, 768 og 1440 px) har null runtimefeil. QuizCard-flip, utvidelse og Fagverk-navigasjon er reelt kjørt.

Alle 20 skjermbilder er åpnet og manuelt kontrollert. Quizen og QuizCard fungerer. Den videre steds-closeouten skal rette den hvite logoens forhåndsvisning, Stanghelle-teaseren og Fagverk-tittelen ved nettbrettbredde før manuell final_ui kan godkjennes. Den automatiske visuelle kjøringen alene er ikke en slik godkjenning. Evidens ligger under `reports/visual-qa/arbeiderbladet-youngstorget/20261011-closeout/`, og botcommit `ef34efa417c9c6862d94106b1ae63f2b8bb79145` materialiserer nøyaktig canonical Knowledge fra dette kildeheadet. Engangsworkflowen er fjernet fra sluttdiffet.
