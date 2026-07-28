# History GO — Stories data governance

Status: **operational production, narrative quality and integrity guide**  
Sist kontrollert: **2026-07-28**

Denne guiden avklarer hvilke filer som eier aktive Stories-data, hva en produksjonsklar story er, hvordan Stories skiller seg fra `chronology`, hvordan nye stories produseres, og hvordan tidsbundne research- og dekningsrapporter skal behandles.

## Autoritetsrekkefølge

1. `data/stories/stories_manifest.json` er canonical runtime-manifest for aktive story-filer.
2. Manifest-loadede filer under `data/stories/` eier selve story-objektene.
3. `data/stories/story_types.json` eier gyldige story-typer.
4. `data/stories/stories_episode_v1_manifest.json` eier listen over filer som er migrert til den strenge tekniske `episode_v1`-kontrakten.
5. `chronology`-arrayer i canonical leksikon-/steddata eier korte daterte milepæler når slike finnes. De er tidslinjedata og skal ikke dupliseres som Stories uten selvstendig narrativ grunn.
6. `data/places/manifest.json` og manifest-loadede place-filer eier gyldige `place_id`-er.
7. `data/people/manifest.json` og manifest-loadede people-filer eier gyldige `person_id`-er.
8. `tools/check_stories_integrity.mts` og `npm run check:stories` håndhever struktur, required fields, unike story-ID-er, referanseintegritet og den aktive episodekontrakten.
9. Researchnotater og coverage-rapporter er tidsbundne snapshots. De kan støtte en batch, men eier aldri aktiv status.

Ved konflikt gjelder manifestene, source-dataene, type-registeret og integritetskontrollen. En Markdown-rapport kan ikke aktivere en story eller overstyre en ID.

## Hva en Story er

Stories-laget skal formidle **selvstendige fortellinger knyttet til et sted eller en person**. En story skal gi spilleren noe annet enn en kronologisk liste over hva som skjedde når.

En produksjonsstory skal normalt ha:

- et tydelig narrativt spørsmål, problem eller hovedidé;
- konflikt, valg, overraskelse, spenning eller forvandling;
- konkrete aktører eller tydelige handlende institusjoner;
- et fysisk eller biografisk anker;
- dokumenterte hendelser og konsekvenser som hører sammen;
- en sammenhengende begynnelse, utvikling og avslutning;
- en egen grunn til å eksistere utenfor stedets `chronology`.

En story **kan** være konsentrert om én dag eller én scene dersom hendelsen har selvstendig narrativ dybde. En story kan også gå over flere år og bruke flere chronology-punkter dersom disse inngår i én sammenhengende fortelling.

Dato er evidens og orientering. Dato er ikke storyformen.

Eksempler:

- svak story: «I 1969 sto Y-blokka ferdig.»
- chronology: `1969 — Y-blokka sto ferdig.`
- mulig story: «Kunst støpt inn i staten» — hvordan naturbetong, Viksjø, Nesjar og Picasso bandt kunst til regjeringsarkitekturen, og hvorfor disse verkene senere ble sentrale i striden om Y-blokka og gjenoppbyggingen.

En komprimert stedsbiografi, institusjonshistorie eller generell utviklingsoversikt er heller ikke automatisk en god story. Stoffet må ha en tydelig narrativ akse, ikke bare dekke mange år.

## Chronology og Stories

`chronology` og Stories har forskjellige produktroller.

### `chronology`

Brukes til korte, daterte milepæler:

- byggestart;
- åpning;
- vedtak;
- navneskifte;
- ombygging;
- etablering eller nedleggelse;
- andre hendelser der hovedverdien er **hva som skjedde når**.

En chronology-post skal kunne forstås som et konsist tidslinjepunkt uten å måtte bli en fortelling.

### Stories

Brukes når materialet har selvstendig narrativ verdi:

- en konflikt mellom aktører eller interesser;
- et avgjørende valg;
- en scene med menneskelig eller politisk drama;
- en uventet utvikling;
- en større forvandling som må forklares gjennom flere sammenhengende hendelser;
- et spørsmål som endrer hvordan spilleren forstår stedet eller personen.

### Anti-dupliseringsregel

Det skal **ikke** opprettes en Story bare fordi et chronology-punkt er viktig.

Før en ny Story produseres skal produsenten spørre:

> Hvis datoen og årstallet fjernes fra overskriften, finnes det fortsatt en tydelig fortelling her?

Hvis svaret er nei, hører materialet normalt hjemme i `chronology`, faktafelt eller leksikontekst — ikke som egen Story.

Flere chronology-punkter kan inngå i én Story. Dette er ofte bedre enn én Story per milepæl.

## Aktiv story

En story teller som aktiv når:

- story-filen finnes på manifestets `path`;
- manifest-entryen har riktig kategori og peker til den tiltenkte filen;
- story-objektet har required fields;
- `story.id` er unikt;
- storyen har gyldig `place_id` eller `person_id`;
- `sources` er en ikke-tom array;
- alle `related_places` og `next_scenes[].place_id` finnes i aktive place-data;
- `npm run check:stories` passerer.

En story-fil som ligger i repoet, men ikke er manifestregistrert, er ikke aktiv runtime-data.

Teknisk aktivitet betyr ikke automatisk at storyen består den narrative kvalitetsgrensen. Integritetskontrollen og den redaksjonelle storytesten er to forskjellige porter.

## Episode v1

Alle nye eller vesentlig omskrevne produksjonsstories skal bruke:

```json
"quality_profile": "episode_v1"
```

Filen skal registreres i `data/stories/stories_episode_v1_manifest.json`. Eksisterende legacy-filer kan foreløpig mangle profilen inntil de blir migrert.

`episode_v1` er en **teknisk evidens- og integritetsprofil**, ikke en produktdefinisjon som sier at hver Story må være ett tidslinjepunkt.

For `episode_v1` kreves i tillegg:

- `type` må finnes i `data/stories/story_types.json`;
- `summary` må være konkret;
- `year` må være et heltall og fungere som storyens primære kronologiske anker;
- minst to kildeobjekter med `title` og HTTPS-`url`;
- et `episode`-objekt med:
  - `actors`;
  - `date`;
  - `action`;
  - `consequence`;
- `related_people` må finnes som array og bare inneholde canonical person-ID-er;
- `score` må samsvare nøyaktig med den aktive scoringmotoren.

`episode`-objektet beskriver storyens **primære dokumenterte scene eller vendepunkt**. Det trenger ikke romme hele den narrative tidsutstrekningen. Storyteksten kan trekke inn dokumenterte hendelser før og etter hovedankeret når de er nødvendige for samme fortelling.

Eksempel:

```json
{
  "quality_profile": "episode_v1",
  "type": "cultural",
  "title": "Kunst støpt inn i staten",
  "year": 1958,
  "episode": {
    "actors": ["Erling Viksjø", "Carl Nesjar", "den norske staten"],
    "date": "1958",
    "action": "Høyblokka ble tatt i bruk med naturbetong og integrert kunst som del av arkitekturen.",
    "consequence": "Kunst og regjeringsarkitektur ble fysisk bundet sammen i et anlegg som senere ble sentrum for en stor verne- og gjenoppbyggingsdebatt."
  }
}
```

En slik Story kan dokumentert følge samme narrative spørsmål videre til Y-blokka og den senere behandlingen av kunsten. Det er ikke nødvendig å opprette separate Stories bare fordi 1969, 2020 eller 2026 også er viktige chronology-år.

## Narrativ storytest

Før en ny `episode_v1`-story aktiveres skal følgende vurderes redaksjonelt:

1. **Narrativt spørsmål** — hva prøver fortellingen å forklare eller vise?
2. **Dramatisk motor** — finnes konflikt, valg, overraskelse, spenning eller forvandling?
3. **Sammenheng** — hører hendelsene faktisk til samme fortelling?
4. **Steds-/personverdi** — blir storyen sterkere av akkurat dette fysiske eller biografiske ankeret?
5. **Chronology-uavhengighet** — gir storyen mer enn en serie årstall og milepæler?
6. **Avslutning** — ender den i en dokumentert konsekvens eller ny forståelse, ikke bare «og senere skjedde ...»?

Hvis storyen primært består av dato + hendelse + konsekvens, skal den normalt flyttes til eller beholdes i `chronology` i stedet for å produseres som egen Story.

## Story-typer

Bruk bare ID-er fra `data/stories/story_types.json`, blant annet:

- `historical_event`
- `political`
- `cultural`
- `turning_point`
- `conflict`
- `rise`
- `fall`

`historical` er ikke en canonical story-type.

Story-type erstatter ikke den narrative testen. En `turning_point` uten faktisk fortelling er fortsatt bare en milepæl.

## Score

Score skal ikke settes kuratorisk for å uttrykke at en story «føles sterk». Feltene skal beregnes av den aktive scoringmotoren:

- `narrative`
- `historical`
- `source`
- `play_value`
- `originality`
- `total`

`npm run check:stories` beregner scoren på nytt for `episode_v1` og feiler ved avvik.

Maskinscoren erstatter ikke den narrative storytesten. En teknisk gyldig story med korrekt score kan fortsatt være for tidslinjepreget og bør da konsolideres eller flyttes ut av Stories-laget.

## Person- og stedskoblinger

- `person_id` er storyens primære personanker.
- `place_id` er storyens primære stedsanker.
- `related_people` inneholder involverte personer som canonical people-ID-er.
- `related_places` inneholder faktiske relaterte steder med canonical place-ID-er.

At `person_id` er `null`, betyr ikke at `related_people` skal være tom. En stedskoblet story om en navngitt person skal bruke canonical person-ID når personen finnes i people-dataene.

## Next scenes og narratives

`next_scenes` skal bare brukes når neste sted er en tydelig narrativ fortsettelse av den konkrete Storyen. Tematiske, geografiske eller kuratoriske naboskap er ikke nok.

Eksempler på utilstrekkelig kobling:

- «viser en annen side av Bygdøy»;
- «gir en bredere historie om museer»;
- «ligger i samme byområde».

Større tematiske klynger skal modelleres i narrative-laget, ikke som en kunstig sirkel av `next_scenes`.

## Dekningsnivåer

Coverage må ikke omtales som ferdig Stories-innhold. Skill mellom:

- **covered**: minst én aktiv story peker til stedet eller personen;
- **episode-v1 migrated**: minst én primær Story bruker den tekniske `episode_v1`-profilen;
- **narrative-ready**: minst én Story består den narrative storytesten og har selvstendig verdi utover chronology;
- **story-rich**: flere **ulike narrative fortellinger**, ikke bare flere daterte milepæler;
- **narrative-linked**: Stories inngår i en dokumentert større fortelling på tvers av steder eller personer.

En coverage-rapport må oppgi hvilken definisjon den bruker. `episode_v1`-dekning skal ikke omtales som et direkte mål på narrativ kvalitet.

## Produksjonsflyt

1. Start fra fersk `main`.
2. Kontroller om place/person og story allerede finnes, inkludert navne- og ID-varianter.
3. Les eksisterende `chronology`, fakta- og leksikonstoff før Story-kandidater velges.
4. Definer storyens narrative spørsmål eller hovedidé **før** dato og episodeanker velges.
5. Avgjør om materialet faktisk krever en Story. Hvis hovedverdien er «hva skjedde når», bruk chronology i stedet.
6. Finn det primære dokumenterte scene-/episodeankeret for `episode_v1`.
7. Verifiser fysisk eller biografisk ankertilknytning og bygg fortellingen på eksplisitte kilder.
8. Konsolider flere chronology-milepæler i samme Story når de tilhører samme narrative akse; ikke produser én Story per årstall.
9. Opprett eller oppdater den avgrensede story-filen under `data/stories/`.
10. Registrer filen i `data/stories/stories_manifest.json` med korrekt `entity_id`, kategori og path.
11. Registrer nye eller vesentlig omskrevne filer i `data/stories/stories_episode_v1_manifest.json`.
12. Kontroller type, episodefelt, `related_people`, `related_places`, `next_scenes`, kilder og maskinberegnet score.
13. Gjennomfør den narrative storytesten.
14. Kjør:

```bash
npm run check:stories
```

En non-zero exit er en reell integritetsfeil i det aktuelle datagrunnlaget, ikke en dokumentasjonsadvarsel. Manifestet skal da ikke omtales som integrity-clean før feilene er rettet eller eksplisitt avgrenset i en separat data-PR.

15. Sammenlign slutt-diffen mot fersk `main`; en story-batch skal ikke inneholde tilfeldige place-, people-, UI- eller dokumentendringer.

## Researchnotater

Researchnotater kan inneholde:

- kandidat og foreslått narrativt spørsmål;
- place-/personanker;
- kilder og hva de faktisk støtter;
- konflikt, valg, overraskelse eller forvandling;
- primært episodeanker og relevante chronology-punkter;
- vurdering av om materialet hører hjemme i Story eller bare chronology;
- overlapps- og duplikatvurdering;
- status som klar, trenger mer research eller skal vente.

De skal ikke presenteres som ferdige stories eller som varig dekningsstatus. Når batchen er gjennomført eller forlatt, flyttes notatet til et datert arkiv under `reports/archive/` og registreres som historisk.

## Coverage og statusrapporter

Story-dekning er et beregnet øyeblikksbilde. En gyldig rapport må minst oppgi:

- input-commit eller tydelig `main`-tidspunkt;
- antall aktive places fra det aktuelle place-manifestet;
- antall manifest-loadede story-filer og story-objekter;
- metode for duplikater og flere stories per place;
- hvilket dekningsnivå som måles;
- om målet er teknisk `episode_v1`-migrering eller redaksjonell narrativ kvalitet;
- kontrollresultat fra `npm run check:stories`;
- genereringstidspunkt.

Gamle prosent- og totaltall skal ikke kopieres videre som fasit. En rapport legges under `reports/`, og blir historisk når inputgrunnlaget flytter seg. Det finnes ingen Markdown-baseline som kan erstatte en ny beregning fra aktive manifests.

## Historiske snapshots

Følgende tidligere dokumenter er arkivert fordi de blandet tidsbundet status med aktiv dokumentasjon:

- `reports/archive/2026-07/stories/STORIES_BATCH_4_RESEARCH_NOTES_2026-07-26.md`
- `reports/archive/2026-07/stories/STORIES_COVERAGE_REPORT_PRE_CONSOLIDATION_2026-07-26.md`

De bevarer research- og coveragehistorikk, men skal ikke brukes som produksjonskø, nåstatus eller kontrakt.

## Avgrensninger

Stories-governance eier ikke place-kategorier, people-profiler, koordinater, quiz, leksikon, bilder eller UI-rendering. Den eier manifestaktivering, story-sourcefiler, narrativ Stories-kvalitet, produksjonsflyt og integritetskrav for Stories-laget.

`chronology` eies av de canonical datafeltene der tidslinjen faktisk ligger. Stories-governance eier bare **grensen**: Stories skal ikke bli en parallell tidslinje.