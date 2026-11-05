# Civication – People-basert fortellingsmodell (v1)
 
**Status:** Besluttet redaksjonell retning; teknisk migrering og faktisitetsendring er **ikke implementert**. Opprettet 12. oktober 2026. Ingen endring av History Go-kjernen, runner, lagring, rolle-gates, historiske People eller eksisterende scener.

## Beslutning

Mira, Lea og Arvid utgår som **obligatoriske identiteter**. De eksisterende scenene og fortellingene er kilde til konflikter, konsekvenser og dramaturgiske forløp – **ikke** dialogmaler som kan få et nytt navn.

**History Go avgjør hvem spilleren har oppdaget. Civication avgjør hvilke relasjoner og historier spilleren kan utvikle med dem.** En oppdaget People er kandidat til en kontakt, ikke automatisk venn, samarbeidspartner, kontrakt eller NPC.

### Fem adskilte datanivåer

| Nivå | Autoritativ kilde | Betydning | Hva det aldri alene gir |
| --- | --- | --- | --- |
| Faglig identitet | `data/people/manifest.json` → `historyPeople_index.json` | Faktisk person, dokumentert sted, faglig bakgrunn | Samtale, vennskap, samtykke, løfte |
| Oppdagelse | History Go sitt faktiske unlock-signal | Spilleren har besøkt stedet og oppfylt People-kravet | Historisk persons automatiske deltakelse |
| Spillerrolle | Career, Life Position, circumstance og rolleverden | Ønsker, konflikter, tilgang til hverdagsmiljø | Jobb, lønn og utnevning uten career-gate |
| Relasjon | Eksisterende `CivicationRelationshipEngine` og faktisk hendelseshistorikk | Fremmed → kontakt → mulig vennskap eller avstand | En ferdig «venn» ved unlock |
| Fortelling og arkiv | Life Story, Scene Pipeline og Symposium | Valg, konsekvenser, tidslinje og kapitler | Omskriving av fakta eller tidligere spillvalg |

Ikke gjenbruk `personRepresentanter` som sannhetskilde for all People-tilgang. Feltet er en **legacy representant-binding** i Life Story State. En eventuell ny adapter må bevare gamle saves og arkiv-snapshots uten å bytte aktør retroaktivt.

### Relasjonsmatrise – normative overganger

| Tilstand | Påkrevd utløser | Tilgjengelig handling | Sperre |
| --- | --- | --- | --- |
| Ikke oppdaget | Ingen | Historisk omtale/kart etter History Go-regler | Ingen Civication-relasjon påstås |
| Oppdaget | Canonical People er låst opp | Se faktaprofil, foreslå kontaktscenario | Ingen automatisk dialog eller vennestatus |
| Kontakt etablert | Eksplisitt møte og player choice i et tillatt scenario | Begrenset kontakt, mulig invitasjon | Ingen garantert gjensidighet |
| Bekjent / samarbeid | Gjentatte faktiske spillhendelser | Rollen åpner relevante tråder | Ikke generiske scener uten faglig/personlig passform |
| Nær relasjon | Historikk + frivillig gjensidighet i fiksjonslaget | Varige relasjonskonsekvenser | Ingen tvungen vennskap, romantikk eller tilgivelse |
| Avstand / brudd | Reelt valg eller avslått kontakt | Avstand opprettholdes; eventuell ny invitasjon må være ny hendelse | Ikke stille reset av historikken |

En spiller uten innsamlede People skal fortsatt kunne spille jobb, bolig, økonomi, plikter og egentid. People-spesifikke vennskapstråder er betingede. Miljøkontakt kan også skje gjennom saklig organisasjonsrolle når et historisk individ ikke er relevant; slike aktører er egne, korrekt merkede fiksjonsroller.

## Kritisk faktisitets- og sikkerhetsport

Nåværende `docs/FACTUALITY_CONTRACT.md` (§4.1) og `docs/CIVICATION_SCENARIO_PEOPLE.md` forbyr at ekte People spiller frie NPC-er med oppdiktede replikker, meldinger, private motiver eller relasjoner. **Forslaget her kan ikke implementeres ved å ignorere disse kontraktene.** Før runtime-produksjon må separat governance godkjenne et klart markert simulert lag:

1. Canonical People er uforanderlig faktakilde; fakta og kilde-ID-er er lesbare, aldri omskrevet av spillet.
2. Hvert interaktivt scenario med en navngitt virkelig person må vise at det er **fiksjon / simulering**, og skille det fra historisk dokumentert hendelse.
3. Det må besluttes hva som er tillatt for nålevende kontra avdøde personer. Ingen udokumenterte private forhold, oppdiktet kriminalitet, intime relasjoner, belastende ytringer eller gjengitt tale som kan forveksles med ekte sitat.
4. Kontakt er en fiktiv handling i Civication; den må aldri leses som kontakt med personen i virkeligheten.
5. Hvis et scenario ikke oppfyller denne porten, brukes den oppdagede People bare som kunnskaps- og miljøinngang; dialogrollen må være en selvstendig tydelig fiktiv karakter eller utelates.
6. Ny policy, eventuell schema- og UI-kontrakt, test og eksplisitt aksept må komme **før** endring i runtime. Denne planen endrer ikke eksisterende normer.

## Spillbarhetskontrakt

`eligibility = faktisk_spillerrolle + eksplisitt_oppdagelse + tillatt_simuleringsmodus + relevant_personprofil + relasjonsstatus + tidligere_vedtak + tidslinje`.

En dramatisk type (C01–C24), et litterært spor (L01–L24) eller et av Bookers modellplott (P01–P07) er en **redaksjonell linse**, aldri en automatisk game-gate.

- En fremmed kan ikke opptre som gammel venn.
- En avtale som ikke ble inngått, kan ikke være gjennomført.
- En reell People fra musikkfeltet kan ikke få industrialistens prosjekt- eller miljødialog.
- To People med samme fag må få **ulike** synopsiser basert på kildeforankret yrke, periode, faglig virke og stedsrelasjon.
- Ingen scene gir lønn, kontrakt, utnevnelse, romantikk eller kriminell status via fortellertype alene.
- Den historiske People-profilen og Civication-arkivet har hver sin provenance.

## Symposium: arkivmatrise

| Element | Lagres fra hva | Vises som | Må aldri gjøre |
| --- | --- | --- | --- |
| Spillerrolle | Canonical aktiv rolle/livsposisjon | «I denne perioden spilte du …» | Skrive om opprinnelig rolle |
| People-oppdagelse | People-ID og sted-ID | Faktabundet funn med sted | Hevde at personen faktisk møtte spilleren |
| Simulert kontakt | Scenario-ID, aktørtype, label | Tydelig fiksjonsmerket møte | Fremstille oppdiktet dialog som kildesitat |
| Relasjon | Hendelser og status over tid | Fremmed/bekjent/nær/avstand | Lage vennskap ved oppdagelse |
| Beslutning | Scene-ID + choice-ID + state-effekt | «Du svarte …» | Låne valg fra alternativ gren |
| Konsekvens | Reell senere tråd / hendelse | Reaksjon og ettervirkning | Påstå at den har inntruffet før trigger |
| Kapittel | Faktisk aktivert fortsettelse | Synopsis + reelt utfall | Låse narrativt sluttpunkt som allerede skjedd |
| Kilde | Canonical People/Place kilde | Lesbar faktareferanse | Tolke kilden som støtte for fiksjonen |

## Produksjonsrekkefølge

1. Frys dagens scene-ID-er, save-formater og arkiv-koplinger. Registrer alle legacy-filer, uten å slette.
2. Godkjenn policy for simulert People-bruk, inkludert nålevende/avdøde og visningsmerking.
3. Lag en minimal autorisert People→fiktiv-scenario-adapter med **ingen** endring i History Go unlock.
4. Migrer **én** musikktråd med to kildeforskjellige eksempler; bevis at de får forskjellig handling, ikke navnebytte.
5. Migrer én prosjekttråd og én miljøtråd, med rolle-, sted- og tidskrav.
6. Test ingen-People-spilleren, sen unlock, tidligere avslag, avlysning, gjenopptakelse, gamle saves, og Symposium-arkivet.
7. Utvid til alle 24 C-synopsiser etter redaksjonell godkjenning og faktisk scenematerialisering.

## Koblet dokumentasjon

- `CIVICATION_ROLE_PEOPLE_STORY_MATRIX_V1.md`: komplett 24 × rolle-/kontaktmatrise.
- `CIVICATION_STORY_SYNOPSES_V1.md`: 24 konkrete synopsis + personspesifikke varianter.
- `CIVICATION_PEOPLE_STORY_MIGRATION_V1.md`: eksisterende fortsettelsesfiler med migreringsrisiko.
- `data/Civication/lifestory/editorial/peopleStoryPlanningV1.json`: maskinlesbar redaksjonell produksjonsliste.
- `CIVICATION_SYMPOSIUM_MASTER_ATLAS_V1.md`: hovedoversikten med ni trinn, 45 kapittel-ID-er, rollestatus og produksjonsrekkefølge.
- `CIVICATION_FOUNDATION_SYNOPSES_V1.md`: ti grunnkapittel-synopsiser for dag 8–13.
- `data/Civication/lifestory/editorial/storyProductionLedgerV1.json`: maskinlesbar oversikt over alle 45 eksisterende pakker og deres reelle rolle-/tidsbindinger.
- Eksisterende `data/Civication/lifestory/editorial/narrativeCrosswalkV1.json` forblir urørt inntil migrering er godkjent.
