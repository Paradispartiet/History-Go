# Civication – skjemaer og produksjonsstandard for bok- og filminspirerte historier

**Revisjon 1 · 17. oktober 2026 · Redaksjonell kontrakt, ikke ny runtime.** Dette dokumentet er arbeidsgrunnlaget som skal brukes *før* vi skriver flere Civication-historier. Det supplerer [synopsismatrisen](CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md), [personmodellen](CIVICATION_PERSON_MODEL_V1.md), [fortellingsprinsippene](CIVICATION_SYMPOSIUM_NARRATIVE_PRINCIPLES.md) og [Life Story-systemet](civication-life-story-system.md). Gamle scener, manifests, IDs, spilltilstand og eksisterende registrerte historier endres ikke av skjemaene.

## Hvorfor fire skjemaer?

Vi skal ikke lenger gå direkte fra «en film handler om noe interessant» til generiske moralvalg. Kildene, det menneskelige problemet, den konkrete Civication-fortellingen og produksjonsdekningen er **fire forskjellige ting**.

| Nivå | Fil / schema-ID | Eier / funksjon | Ferdig når |
| --- | --- | --- | --- |
| 1. **Verk** | [`referenceWorkV1.schema.json`](../data/Civication/lifestory/editorial/inspiration/referenceWorkV1.schema.json) · `civication_reference_work_v1` | Dokumenterer bok/film med navn, kildeidentitet og verifikasjonsnivå. Goodreads-voksenutvalg og Film Producer må aldri blandes sammen med løse kandidater. | Verket har sporbar kilde; status er korrekt også om det er uverifisert. |
| 2. **Allmenngyldig problem** | [`universalProblemV1.schema.json`](../data/Civication/lifestory/editorial/inspiration/universalProblemV1.schema.json) · `civication_universal_problem_v1` | Analyserer tid, samfunnsforhold, motstridende interesser, kildebelegg og hvilken **idé** som kan overføres til Civication. | Temaet er konkret og begge parters interesser er forståelige; verktolkning er merket utkast eller kildekontrollert. |
| 3. **Rolle- og personbundet historie** | [`roleStoryBlueprintV1.schema.json`](../data/Civication/lifestory/editorial/inspiration/roleStoryBlueprintV1.schema.json) · `civication_role_story_blueprint_v1` | Gjør problemet til en original historie: hvem, når, hvor, hva som skjer, hva som står på spill, spillerens valg og varige følger. | Rollens myndighet, NPC-ens egen vilje, grenbetingelser, alternative utfall og senere tilbakekomst er spesifisert. |
| 4. **Dekning og faktisk status** | [`storyCoverageInventoryV1.schema.json`](../data/Civication/lifestory/editorial/inspiration/storyCoverageInventoryV1.schema.json) · `civication_story_coverage_inventory_v1` | Måler C01–C24, bokstatus, IMDb/Film Producer, litterære spor, plottlinser og rolletilpasninger separat. | Alle rader har ærlige statusverdier og dokumenterte referanser til faktisk innhold. |

**Eksempelfil:** [`exampleC05PipelineV1.json`](../data/Civication/lifestory/editorial/inspiration/exampleC05PipelineV1.json) viser de tre første skjemaene fylt ut for **C05: Byråkratiet og personen**, med Kafka-kandidat og *Brazil* fra Film Producer. Det er et didaktisk eksempel; status er uttrykkelig **uverifisert og ikke spillbar**. **Faktisk [dekningsregister](../data/Civication/lifestory/editorial/inspiration/storyCoverageInventoryV1.json)** har alle 24 radene og er ikke det samme som eksempelfilen.

## 1. Bok- og filmkildene – nøyaktige regler

### Goodreads

- Det eksisterende importskriptet [`import-goodreads-literature-canon.mjs`](../scripts/import-goodreads-literature-canon.mjs) bruker kun titler som står på **`read`** og har **minst 4 av 5 i den private vurderingen**. Dette er et *utvalgskriterium*, ikke en litteraturkritisk fasit.
- **Ingen private Goodreads-data** (personlig rating, anmeldelser, lesedato, notater, eierstatus, bokhyllehistorikk eller personlige ID-er) kopieres inn i Civications offentlige redaksjonelle registre. Først når importen har bekreftet kvalifikasjon, kan `goodreads_match` endres fra `not_checked` til `verified_read_4_plus`.
- Barne- og ungdomsbøker rutes til det egne barne-/ungdomslitteraturspillet. Et verk på eksisterende litterær crosswalk er ikke dermed bekreftet Goodreads-treff. Sammenlign mot faktisk eksport/import, aldri mot antakelser.
- Opprinnelig forfatter/verk, romanens samtid, dens skildrede tid og temaets mulige allmenngyldighet kan være forskjellige størrelser. Dokumenter hva som er etterprøvd.

### IMDb og HG Film Producer

- Kilden er `Paradispartiet/HG_Film_Producer/data/film/imdb_ls000064637_titles.md` (161 filmer), koblet til `data/film/scenarios/film_scenarios_seed.json` (161 Film Producer-seeds). Bruk **IMDb-ID (`tt...`)** og scenario-ID; tittel alene er ikke tilstrekkelig.
- En `imported_seed_needs_film_specific_design` er bare et gjenfinnbart filmscenario. Den er **ikke** bevis på at en temaanalyse av filmen er kvalitetssikret. Merk verkfortolkningen som hypotese til filmen/etterprøvbare analyser faktisk er undersøkt.
- Film Producer forblir eget spill, og Civication bruker filmene som **forteller- og samfunnsreferanser**, ikke som nye Film Producer-produksjonsoppdrag.

### Begrepsskille

| Betegnelse | Betyr | Betyr ikke |
| --- | --- | --- |
| **Kildeidentitet verifisert** | Bok/film og tilhørende bibliografisk/IMDb-post er identifisert. | At vi har analysert verkets innhold grundig. |
| **Goodreads-kvalifisert** | Match mot faktisk voksenutvalg (`read`, minst 4). | At personlig rating skal lagres eller publiseres. |
| **Tematolkning kildekontrollert** | Verkspesifikk lesning med etterprøvbar evidens. | At Civication bør gjenskape plottet. |
| **Synopsis godkjent** | Realistisk, original fortelling med karakter- og valgrunnlag. | At en scene er kodet og registrert. |
| **Registrert spillbar** | Faktiske scene-ID-er/paths i eksisterende spilleruntime, med relevante valgruter. | At alle bok- og filmkoblinger automatisk er endelig validert. |

## 2. Hvordan filmens/bokas tema oversettes til Civication

For hver referanse må analysen svare på disse spørsmålene i feltene i `universalProblemV1`:

1. **Hvilket menneskelig eller sosialt problem?** Ikke «identitet» alene, men f.eks. at et menneske kan miste sosial verdi i andres øyne når jobben forsvinner.
2. **Hvilken tid og hvilke maktforhold?** Skille når verket ble til, tiden det skildrer og situasjonen i Civication. Klasse, kjønn, institusjoner, arbeid, penger, familie, kultur og teknologi kan påvirke valgmulighetene.
3. **Hvem ønsker hva, med hvilke legitime grunner?** Ikke reduser motparten til en moralsk karikatur.
4. **Hva bruker vi fra hvert verk?** Sosialt tema, fortellerperspektiv, karakterpress, moralsk konflikt eller form – navngi påvirkningen og graden av kildesikkerhet.
5. **Hva er Civications nye hendelse?** Originale personer, egne steder, egne interesser, nytt årsaksforløp og utfall som springer ut av spillerens handlinger.
6. **Hva må vi ikke kopiere?** Ingen særegne handlingsrekker, karakterer, replikker, avsløringer eller større beskyttede tekstutdrag.

En historie kan hente **ulike sider av samme problem fra flere verk**. Én film er heller ikke en fasit: Et problem skal gjerne undersøkes fra flere samtidige og historiske perspektiver.

## 3. Krav til en god synopsis

`roleStoryBlueprintV1` krever følgende **før** produksjon av flere kapitler:

- **Person og rolle:** Stabil actor-ID når den finnes, status for kjente fakta, mål, styrker, begrensninger og relasjoner. Jobbtittel gir ikke dokumentert kompetanse eller fullmakt. En NPC beholder retten til egne beslutninger.
- **Situasjon:** Konkret tid, sted, foranledning, frist eller faktisk hendelse. Ingen tilfeldig krise bare for å få et dilemma. Konflikten må være forståelig i personens eksisterende liv.
- **Synopsis:** En lesbar fortelling med start, utvikling, beslutning og ettervirkning – ikke generiske læringsmål, diagnose eller abstrakte læresetninger.
- **Spillervalg:** Minst to troverdige og ulike handlinger, hver med legitim begrunnelse, umiddelbar konsekvens, senere tilbakekomst og avgrensing mot beslutninger spilleren ikke eier.
- **Kontinuitet:** Tidligere fakta/valg som må være sanne, antakelser som er forbudt, og eksakt plan for hva som vises hvis en tidligere scene ikke fant sted. Mottatte opplysninger må ikke bli minner om selvopplevde hendelser.
- **Ulike avslutninger:** Minst to mulige, betingede utfall. Det kan ende i forsinkelse, tap, kompromiss, framgang eller uavklart kontakt. Ikke tving fram forsoning.
- **Rettigheter:** Originalt Civication-innhold. Identiske formuleringer, kjente figurer eller filmscener er ikke et produksjonsmål.

**Eksempel på godt valg:** Etter at et dokument tilsynelatende er borte, kan spilleren sende på nytt med kvittering eller kontakte saksbehandler før ny innsending. Begge har reell nytte og kostnad. **Dårlig valg:** «Vær hyggelig og løs problemet» mot «Oppfør deg egoistisk». Slike alternativer tester bare ønsket moral, ikke faktisk handlefrihet.

## 4. Statusmaskin – ingen falsk ferdigstillelse

| Trinn | Tillatt redaksjonell status | Hva som kreves |
| --- | --- | --- |
| V1-idébank | `legacy_candidate` i dekning | Konkret synopsis fra eksisterende 24-raders matrise. **Ingen godkjenning.** |
| Kildelag | `not_checked` / `imported_unverified` / `hypothesis` | Synlig usikkerhet, ingen pyntet bevisstatus. |
| Temaanalyse | `draft` → `reviewed` | Verkspesifikk begrunnelse, historisk kontekst og evidens. En `reviewed`-analyse krever kildebelegg. |
| Historieplan | `synopsis_candidate` → `blueprint_ready_for_review` → `editorially_approved` | Personforankring, to reelle valg, kontinuitet og senere konsekvens. |
| Sceneproduksjon | `authored_unregistered` | Faktiske scener skrevet i eksisterende Civication-format; ikke telles som spillbare. |
| Publisering | `registered_playable` | Faktiske runtime-paths, manifest/registrering og målrettet test etter fullført bolk. |

Statusfelt i ulike skjemaer er **ikke** utbyttbare. En verifisert IMDb-ID løfter ikke tematolkning til `reviewed`. Et godt synopsis løfter ikke produksjon til `registered_playable`.

### Hva vi teller

**Historietypedekning:** C01–C24 har hver sin rad, men foreløpig bare `legacy_candidate`. **Litterær dekning:** alle 24 L-spor må følges separat; 24 valgte bøker gir *ikke* automatisk 24/24 L-spor. **Plottlinsedekning:** Booker P01–P07 er frivillige analytiske linser, ikke påbud om én av hver i hver rolle. **Kildedekning:** antall verk med faktisk Goodreads-match, IMDb-identitet, og temaanalyse er tre ulike tall. **Rolledekning:** `role_adaptations` må fylles med konkrete rolle-ID-er, vurdering av anvendelighet, blueprint-ID og runtime-path; én generell tekst med nytt jobbtittelnavn er ikke en ny historie. **Spillbar dekning:** tell bare registrerte faktiske scener etter validering.

Per 17. oktober 2026 er [dekningsregisteret](../data/Civication/lifestory/editorial/inspiration/storyCoverageInventoryV1.json) en ærlig start: 24/24 C-rader med synopsis-kandidater, 24 filmidentitetskoblinger fra Film Producer, **0 verifiserte Goodreads-matcher i denne kartleggingen**, **0 nye ferdige rolleplaner**, **0 nye spillbare historier**. Dette sier ikke at Civication mangler andre eksisterende spillbare historier.

## 5. Hvordan en ny produksjonsbolk skal arbeide

**Fase A – kilde- og temagrunnlag, samlet:** Les voksenbøkene fra den faktiske kvalifiserte Goodreads-kanonen; samkjør ISBN/tittel/forfatter med eksisterende litteraturregistrering når identitet kan stadfestes. Samkjør filmer med Film Producer/IMDb-ID. Velg bredde i tema og tid framfor flere eksempler på samme problem. Harde kilder legges i pending-kø uten å stoppe resten.

**Fase B – scenariodesign:** Fyll temaanalyse og én rollespesifikk blueprint for hver valgt historie. Start der Civication allerede har en eksisterende rolle/person og valgbaserte fakta. Skriv ulike varianter for relevante roller når problemet faktisk endrer karakter med kompetanse, myndighet, livssituasjon og relasjoner.

**Fase C – innholdsproduksjon:** Skriv **8–12 sammenhengende historier per PR-bolk**, med flere kapitler og grenuavhengig/særskilt grenavhengig kontinuitet. Ikke opprett egne PR-er for hver bok eller film. Avslagsgrener og tapte muligheter skal gi logiske senere scener.

**Fase D – én målrettet kontroll:** Sjekk etter ferdig bolk schema-konformitet, C-ID/dekningsmapping, kilde-ID-er, valgruter, scene-ID-er, aktøridentitet, role/authority-gater og bevaring av lagret historikk. Ordinær CI er tilstrekkelig utover dette når ingen runtime er endret. Ingen gjentatt full regresjon etter små innholdsleveranser.

## 6. Fysiske filer og ansvar

```text
data/Civication/lifestory/editorial/
  narrativeCrosswalkV1.json                  # gammel L/P/C-taksonomi
  storyInspirationCoverageV1.json            # 24 innledende synopsis-kandidater
  inspiration/
    referenceWorkV1.schema.json              # skjema: bok eller film
    universalProblemV1.schema.json           # skjema: problem og verkfortolkning
    roleStoryBlueprintV1.schema.json         # skjema: original rollespesifikk historie
    storyCoverageInventoryV1.schema.json     # skjema: faktisk dekningsstatus
    storyCoverageInventoryV1.json            # 24 C-rader / synlig arbeidsrest
    exampleC05PipelineV1.json                # opplyst eksempel, ikke kanon
docs/
  CIVICATION_BOOK_FILM_STORY_MATRIX_V1.md    # eksisterende oversikts- og synopsisdokument
  CIVICATION_BOOK_FILM_STORY_SCHEMAS_V1.md   # dette dokumentet
```

Et godkjent kildelag skal etter hvert få egne instanser av `referenceWorkV1`, en temaanalyse en instans av `universalProblemV1`, og en konkret ny historie en instans av `roleStoryBlueprintV1`. **Foreløpig er det kun skjemaer, dekningsregister og et merket eksempel:** V1-synopsisbanken er ikke stilletiende konvertert til fullgodkjente historier. JSON Schema kontrollerer struktur; faktisk kildeidentitet, unike C-ID-er, kryssreferanser og spillkontinuitet må kontrolleres mot de virkelige kildene og runtime ved produksjon.

## 7. Redaksjonelle kvalitetsporter

En historie kan ikke erklæres ferdig bare fordi JSON-et er gyldig. Den må tåle seks lesninger: **(1)** kildepåstander, **(2)** sosial/historisk kontekst, **(3)** personenes egne ønsker og relevante egenskaper, **(4)** logisk hendelsesforløp, **(5)** spillerens faktiske beslutningsrett og grenavhengige følger, **(6)** originalitet og selvstendighet. Historier som virker absurde, ufortjente, preker eller forutsetter uspilte handlinger skrives om før registrering; de gis ikke en kunstig god kvalitetsscore.

**Neste produksjonsoppgave:** Fylle verkregisteret fra reelle kildeuttrekk, bearbeide 24 kandidat-synopser gjennom temaanalyse/rolleblåkopier og skrive store bolker først når skjemaene og rollekravene er på plass.
