# Civication Role World Standard

Status: **canonical redaksjonell kvalitets- og completionkontrakt**  
Sist kontrollert: **2026-08-18**

## 1. Formål

Role World er broen mellom Civications tekniske Scene Pipeline og visjonen om at en rolle skal oppleves som **en liten sosial serie**, ikke som en samling jobbtitler eller enkeltstående beslutningsmailer.

Standarden oppretter **ingen ny runtime**. Den bestemmer hva slags liv authored innhold må beskrive før en rolle kan kalles `role_world_complete`.

Canonical kontrakter og produksjonsfiler:

- [`../data/Civication/roleWorldPolicy.json`](../data/Civication/roleWorldPolicy.json)
- [`../data/Civication/roleWorldV1.schema.json`](../data/Civication/roleWorldV1.schema.json)
- [`../data/Civication/roleWorldThemeBank.json`](../data/Civication/roleWorldThemeBank.json)
- [`../data/Civication/roleWorldAuthoringChecklist.json`](../data/Civication/roleWorldAuthoringChecklist.json)
- [`CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md`](CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md)
- [`../data/Civication/roleWorlds/index.json`](../data/Civication/roleWorlds/index.json)
- [`../tests/civication-role-world-contract.test.js`](../tests/civication-role-world-contract.test.js)

## 2. Civication som én samlet modell

### Lag A — spillerens liv

Role World skal lese og påvirke et liv som kan bestå av:

- Badge-progresjon
- livsposisjon
- formell jobb / arbeidsstatus
- levevei / `CivicationLivelihoods`
- økonomi / kapital
- psyke
- relasjoner / nettverk
- bolig / livssituasjon
- ytelser / arbeidsevne der systemet faktisk har data
- omdømme / status

Role World eier ikke disse systemene. De er kontekst og konsekvensflater.

Levevei er allerede implementert. Role World skal kunne åpne eller påvirke livelihood opportunities gjennom eksisterende EventEngine-/Min dag-kjeder, ikke lage en ny inntektsmotor.

### Lag B — Role World

Role World er den redaksjonelle modellen av verden spilleren lever i:

- sosiologisk hovedproblem
- klasse, status og makt
- arbeid og institusjon
- kropp, tid og følelsesarbeid
- familie og privatliv
- ambisjon og stagnasjon
- sosialt miljø
- faste sosiale typer
- langsomme state-akser
- 14-dagers dramaturgi

### Lag C — Scene Pipeline

Role World materialiseres gjennom eksisterende authored sources:

```text
roleModel
FWG / work grammar
mailPlan
mailFamilies
private / life / social / narrative-kilder
        ↓
normalisering / build
        ↓
civication_scene_v1
        ↓
compiledSceneRegistryV1 / SceneCatalog-adapters
        ↓
SceneCatalog → SceneDirector → NextAction/delivery → ChoiceDirector
```

Det skal ikke opprettes `role_world_scene_v2`, egen RoleWorldEngine eller en parallell dagsmotor.

### Lag D — livet forandrer seg

Valg og hendelser kan via den eksisterende konsekvenskjeden påvirke blant annet:

- jobbprogresjon, tillit og myndighet
- relasjoner
- stress, energi og andre psykefelt som faktisk finnes
- livelihood opportunities
- økonomi/kapital
- bolig/livssituasjon når relevant system finnes
- omdømme/status
- flags og senere scener

En god Role World lar tidligere valg komme tilbake senere og lekke mellom jobb og privatliv.

## 3. Sosiologisk kjerne

Hver Role World skal ha et eksplisitt hovedproblem som er mer presist enn «hvordan er det å ha denne jobben?».

Eksempel for Ekspeditør:

```text
servicearbeid som underordnet makt
```

Mulige delakser er fremmedgjøring, klasse, emosjonelt arbeid, forbruk, statusangst, sosial maske og ambisjon/stagnasjon.

Andre roller skal ha sine egne problemer; de skal ikke kopiere Ekspeditør-innholdet mekanisk.

## 4. Film/Story Theme Bank

Film- og dramaturgihistorie kan brukes som **redaksjonelt råstoff** fordi kunst ofte undersøker arbeid, makt, identitet og moderne liv.

Riktig kjede er:

```text
abstrakt tema
→ menneskelig konflikt
→ sosiologisk oversettelse
→ passende Role World
→ konkrete personer og sesongbuer
→ authored scenes
```

Banken skal aldri brukes til å:

- kopiere handling eller sekvenser fra et verk
- kopiere eller etterligne en konkret karakter
- gjenbruke dialog
- rekonstruere en gjenkjennelig scene
- bruke en filmtittel eller franchise som gameplay-state, scene-ID eller mekanisk regel

Theme Bank inneholder derfor abstrakte tema-ID-er, ikke filmplot.

## 5. NPC-/persongrammatikk

Faste personer skal først forstås som sosiale posisjoner og deretter få individuell dybde.

Hver viktig recurring NPC-type skal minst beskrive:

- `id`
- sosial funksjon
- klasseposisjon
- status i miljøet
- makt over spilleren
- hva personen vil
- hva personen skjuler eller ikke sier direkte
- talemåte / kommunikativ stil
- hva personen lærer spilleren om verden

I tillegg bør authored innhold beskrive relasjon, frykt, lojalitet, motsetninger og hvordan personen endres gjennom sesongen.

Arketypen er et produksjonsverktøy, ikke en unnskyldning for karikatur. NPC-er skal få motsetninger og menneskelig egeninteresse.

## 6. 14 dager × fire beats

En full Role World skal dekke:

```text
14 dager
× morning / lunch / afternoon / evening
= 56 dramaturgiske dekningspunkter
```

Dette er **ikke** 56 store beslutninger.

Et dekningspunkt kan være:

- `info`
- `conversation`
- `relationship`
- `social`
- `task`
- `decision`
- `consequence`
- `private_consequence`

En god dag kan for eksempel være:

```text
morgen       info: sjefen setter presset
lunsj        relationship: kollega avslører noe
ettermiddag  decision/task: spilleren må faktisk velge
kveld        private_consequence: valget får personlig etterklang
```

1–2 strategiske valg per dag er et redaksjonelt mål når stoffet bærer det, **ikke** en hard kvote. Vi skal unngå 56 falske A/B/C-spørsmål.

## 7. Flerstegs relasjonelle tråder

«5–10 meldingsutvekslinger» betyr ikke at hver scene trenger ti klikk.

En **primær relasjonell tråd** skal utvikle seg over omtrent 5–10 beats/scener/meldinger. Tråden kan hoppe mellom work/private/social og flere dager.

Eksempelstruktur:

```text
dag 2   leder setter forventning
dag 4   kollega tolker forventningen annerledes
dag 6   spilleren tar ekstra ansvar
dag 8   ansvar uten status skaper friksjon
dag 10  privat/personlig effekt blir synlig
dag 12  spilleren presses til å velge side
dag 14  tidligere mønster får konsekvens
```

Det avgjørende er sosial hukommelse: mennesker og systemer skal reagere på det spilleren faktisk har gjort.

## 8. Langsomme akser

Role World skal definere et lite sett langsomme akser som kan bære sesongen, for eksempel:

```text
service_mask
manager_trust
colleague_trust
stress
status
relationship_private
economic_room
stagnation
ambition
```

Dette er eksempler, ikke universelle feltnavn. En Role World skal gjenbruke eksisterende state når den finnes og bare introdusere nye felt gjennom ordinær datamodell-/runtime-governance.

Role World-dokumentet kan beskrive ønsket dramaturgisk akse uten å late som et runtimefelt allerede finnes.

## 9. Privat etterklang

En jobbscene er ikke ferdig når arbeidstiden slutter.

Role World skal planlegge hvordan arbeid kan påvirke:

- vennskap og familie
- selvbilde
- stress/energi
- forbruk og økonomisk rom
- ambisjon eller resignasjon
- språk og sosial maske
- neste dags valg

Privat etterklang skal ikke alltid være negativ. Den kan også gi mestring, fellesskap, stolthet, nye muligheter eller bedre relasjoner.

## 10. Senere konsekvenser

Valg skal kunne sette flags, `next_bias`, thread state eller andre eksisterende consequence-signaler som gjør at noe kommer tilbake senere.

En Role World skal ikke bestå av isolerte dilemmasett. Minst de primære buene skal ha:

```text
oppsett → valg/handling → sosial reaksjon → forsinket effekt → senere møte med konsekvensen
```

Den tekniske grunnkjeden er allerede bevist av 4H-D og skal ikke bygges på nytt.

## 11. Completion-semantikk

### Career status

`reference_complete` i Career Gameplay Matrix betyr at den eksisterende 15-komponents jobbløkken, Life Story og praksisdybden er bevist.

Det er en verdifull status, men `reference_complete` er **ikke det samme som Role World-completion**.

### Role World status

Canonical statuser er:

- `role_world_not_started`
- `role_world_in_production`
- `role_world_complete`

`role_world_complete` kan bare brukes når den maskinlesbare Role World-filen består den permanente kontraktstesten.

En rolle kan være `reference_complete` og samtidig `role_world_not_started`.

## 12. Krav for `role_world_complete`

Den blokkerende porten skal kreve minst:

1. gyldig `civication_role_world_v1`-fil registrert i Role World-indeksen;
2. sosiologisk hovedproblem;
3. gyldige abstrakte Theme Bank-ID-er;
4. definert sosialt miljø;
5. recurring NPC-er med den obligatoriske sosialstrukturen;
6. langsomme akser;
7. nøyaktig 56 unike dag/fase-dekningspunkter for 14 dager × fire faser;
8. primære relasjonelle tråder med 5–10 faktiske beat-referanser hver;
9. eksplisitt privat etterklang;
10. minst én forsinket consequence-bue;
11. materialiseringsreferanser til eksisterende sourceformater;
12. eksplisitt `no_new_runtime: true`;
13. ingen filmplot/karakter/dialog/scenekopiering;
14. ingen RoleStoryletBridge-/jobbmails-/generisk fallback som completionbevis.

Dette er kvalitetskrav, ikke ordmengdekrav.

## 13. Reference-status og neste produksjon

De fem reference Role Worlds i proof-bølgen er nå materialisert og permanent testet:

```text
naeringsliv/ekspeditor → role_world_complete
naeringsliv/renholder  → role_world_complete
by/by_radgiver_plan     → role_world_complete
naeringsliv/controller  → role_world_complete
sport/sport_utover       → role_world_complete
```

Ekspeditør, Renholder, By-rådgiver, Controller og Sport-utøver er strukturreferanser for metoden, ikke innholdsmaler. Sport-utøver beviser at standarden også fungerer i en kropp-/prestasjonshverdag der helse, lag, kontrakt, uttak, omdømme og privat identitet må holdes sammen uten å bli samme statusmål.

**Reference wave complete.** Proof-bølgen dekker nå servicearbeid, usynlig arbeid, forvaltning, tall/kontroll og kropp/prestasjon. Neste bredere produksjonsrolle skal velges eksplisitt i en ny rollout-policy, ikke arves som en skjult `next_reference_world`.

Den fjerde strukturelt annerledes piloten er nå materialisert i `media/media_redaksjon`, sentrert på Journalisten. Den er ikke en sjette skjult reference world, men et bevis på at samme standard tåler kilder, publikum, profesjonskultur, redaktørmyndighet, feedback/rework og synlig rettelse. Piloten utvider den eksisterende situated-standing-kontrakten additivt med audience-typen `source:*`; den oppretter ingen ny reputation- eller Role World-runtime.

Neste produksjonssteg er en separat Role World Realism Matrix/gate-PR som bare skal låse felter med faktisk bevis fra arkiv, plan, sport og journalistikk. Bred rollout skal ikke starte før den gaten beskytter mot completion-inflasjon og parallell runtime.

## 14. Canonical authoring workflow

Den praktiske produksjonsoppskriften er canonical i:

- [`CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md`](CIVICATION_ROLE_WORLD_AUTHORING_GUIDE.md)
- [`../data/Civication/roleWorldAuthoringChecklist.json`](../data/Civication/roleWorldAuthoringChecklist.json)

Kortform:

```text
lock scope
→ inventory existing sources
→ sociological world bible
→ NPC grammar + slow axes
→ 14×4 season grid
→ 5–10-beat primary threads
→ private aftermath + delayed consequences
→ materialize through existing sources
→ register + permanent tests
→ generators
→ clean final branch
→ full CI
→ SHA-locked merge
```

Hvert beat skal ha reell provenance. Hvis substansen ikke finnes, skal den først skrives i en eksisterende governed sourcefamilie; Role World-filen alene er ikke spillbart innhold.

## 15. Forbud mot completion-teater

Ingen rolle skal kalles `role_world_complete` fordi den har mange filer, mange ord eller mange mailer.

Porten må bevise sammenheng:

```text
verden → mennesker → daglig rytme → tråder → valg → reaksjoner → privatliv → senere konsekvenser
```

Manglende innhold skal forbli synlig gjeld. Runtime skal ikke fylle hull med generiske valg eller legacy-fallback.
