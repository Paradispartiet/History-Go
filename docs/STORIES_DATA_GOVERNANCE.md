# History GO — Stories data governance

Status: **operational production, episode quality and integrity guide**  
Sist kontrollert: **2026-07-27**

Denne guiden avklarer hvilke filer som eier aktive Stories-data, hva en produksjonsklar story er, hvordan nye stories produseres, og hvordan tidsbundne research- og dekningsrapporter skal behandles.

## Autoritetsrekkefølge

1. `data/stories/stories_manifest.json` er canonical runtime-manifest for aktive story-filer.
2. Manifest-loadede filer under `data/stories/` eier selve story-objektene.
3. `data/stories/story_types.json` eier gyldige story-typer.
4. `data/stories/stories_episode_v1_manifest.json` eier listen over filer som er migrert til den strenge episodekontrakten.
5. `data/places/manifest.json` og manifest-loadede place-filer eier gyldige `place_id`-er.
6. `data/people/manifest.json` og manifest-loadede people-filer eier gyldige `person_id`-er.
7. `tools/check_stories_integrity.mts` og `npm run check:stories` håndhever struktur, required fields, unike story-ID-er, referanseintegritet og den aktive episodekontrakten.
8. Researchnotater og coverage-rapporter er tidsbundne snapshots. De kan støtte en batch, men eier aldri aktiv status.

Ved konflikt gjelder manifestene, source-dataene, type-registeret og integritetskontrollen. En Markdown-rapport kan ikke aktivere en story eller overstyre en ID.

## Hva en Story er

Stories-laget skal formidle **narrative historier, hendelser, scener, historiske øyeblikk og hva som skjedde her**.

En produksjonsstory skal normalt avgrenses til én dokumentert episode:

- konkrete aktører;
- et tidspunkt eller en tydelig periode;
- en handling eller hendelse;
- et fysisk eller biografisk anker;
- en dokumentert konsekvens eller betydning.

En komprimert stedsbiografi, institusjonshistorie eller generell utviklingsoversikt er ikke automatisk en god story. Slike oversikter kan brukes som researchgrunnlag, men må vanligvis deles i konkrete episoder før aktivering.

Eksempel på riktig avgrensning:

- ikke: «Museets historie fra grunnleggelsen til i dag»;
- men: «Da museet åpnet på Bygdøy i 1902».

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

## Episode v1

Alle nye eller vesentlig omskrevne produksjonsstories skal bruke:

```json
"quality_profile": "episode_v1"
```

Filen skal registreres i `data/stories/stories_episode_v1_manifest.json`. Eksisterende legacy-filer kan foreløpig mangle profilen inntil de blir migrert.

For `episode_v1` kreves i tillegg:

- `type` må finnes i `data/stories/story_types.json`;
- `summary` må være konkret og episodebasert;
- `year` må være et heltall;
- minst to kildeobjekter med `title` og HTTPS-`url`;
- et `episode`-objekt med:
  - `actors`;
  - `date`;
  - `action`;
  - `consequence`;
- `related_people` må finnes som array og bare inneholde canonical person-ID-er;
- `score` må samsvare nøyaktig med den aktive scoringmotoren.

Eksempel:

```json
{
  "quality_profile": "episode_v1",
  "type": "political",
  "episode": {
    "actors": ["Christian Frederik", "Stortingets utsendinger"],
    "date": "1814-10-10",
    "action": "Kongen overleverte sin abdikasjon.",
    "consequence": "Stortinget kunne gjennomføre kongeskiftet og grunnlovsrevisjonen."
  }
}
```

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

## Score

Score skal ikke settes kuratorisk for å uttrykke at en story «føles sterk». Feltene skal beregnes av den aktive scoringmotoren:

- `narrative`
- `historical`
- `source`
- `play_value`
- `originality`
- `total`

`npm run check:stories` beregner scoren på nytt for `episode_v1` og feiler ved avvik.

## Person- og stedskoblinger

- `person_id` er storyens primære personanker.
- `place_id` er storyens primære stedsanker.
- `related_people` inneholder involverte personer som canonical people-ID-er.
- `related_places` inneholder faktiske relaterte steder med canonical place-ID-er.

At `person_id` er `null`, betyr ikke at `related_people` skal være tom. En stedskoblet episode om en navngitt person skal bruke canonical person-ID når personen finnes i people-dataene.

## Next scenes og narratives

`next_scenes` skal bare brukes når neste sted er en tydelig narrativ fortsettelse av den konkrete episoden. Tematiske, geografiske eller kuratoriske naboskap er ikke nok.

Eksempler på utilstrekkelig kobling:

- «viser en annen side av Bygdøy»;
- «gir en bredere historie om museer»;
- «ligger i samme byområde».

Større tematiske klynger skal modelleres i narrative-laget, ikke som en kunstig sirkel av `next_scenes`.

## Dekningsnivåer

Coverage må ikke omtales som ferdig Stories-innhold. Skill mellom:

- **covered**: minst én aktiv story peker til stedet eller personen;
- **episode-ready**: minst én konkret og kildebelagt episode;
- **story-rich**: flere ulike, kildebelagte episoder;
- **narrative-linked**: episodene inngår i en dokumentert større fortelling.

En coverage-rapport må oppgi hvilken definisjon den bruker.

## Produksjonsflyt

1. Start fra fersk `main`.
2. Kontroller om place/person og story allerede finnes, inkludert navne- og ID-varianter.
3. Finn en konkret episode før teksten skrives.
4. Verifiser fysisk eller biografisk ankertilknytning og bygg episoden på eksplisitte kilder.
5. Opprett eller oppdater den avgrensede story-filen under `data/stories/`.
6. Registrer filen i `data/stories/stories_manifest.json` med korrekt `entity_id`, kategori og path.
7. Registrer nye eller vesentlig omskrevne filer i `data/stories/stories_episode_v1_manifest.json`.
8. Kontroller type, episodefelt, `related_people`, `related_places`, `next_scenes`, kilder og maskinberegnet score.
9. Kjør:

```bash
npm run check:stories
```

En non-zero exit er en reell integritetsfeil i det aktuelle datagrunnlaget, ikke en dokumentasjonsadvarsel. Manifestet skal da ikke omtales som integrity-clean før feilene er rettet eller eksplisitt avgrenset i en separat data-PR.

10. Sammenlign slutt-diffen mot fersk `main`; en story-batch skal ikke inneholde tilfeldige place-, people-, UI- eller dokumentendringer.

## Researchnotater

Researchnotater kan inneholde:

- kandidat og foreslått episodevinkel;
- place-/personanker;
- kilder og hva de faktisk støtter;
- aktør, hendelse, tidspunkt og konsekvens;
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
- kontrollresultat fra `npm run check:stories`;
- genereringstidspunkt.

Gamle prosent- og totaltall skal ikke kopieres videre som fasit. En rapport legges under `reports/`, og blir historisk når inputgrunnlaget flytter seg. Det finnes ingen Markdown-baseline som kan erstatte en ny beregning fra aktive manifests.

## Historiske snapshots

Følgende tidligere dokumenter er arkivert fordi de blandet tidsbundet status med aktiv dokumentasjon:

- `reports/archive/2026-07/stories/STORIES_BATCH_4_RESEARCH_NOTES_2026-07-26.md`
- `reports/archive/2026-07/stories/STORIES_COVERAGE_REPORT_PRE_CONSOLIDATION_2026-07-26.md`

De bevarer research- og coveragehistorikk, men skal ikke brukes som produksjonskø, nåstatus eller kontrakt.

## Avgrensninger

Stories-governance eier ikke place-kategorier, people-profiler, koordinater, quiz, leksikon, bilder eller UI-rendering. Den eier manifestaktivering, story-sourcefiler, episodekvalitet, produksjonsflyt og integritetskrav for Stories-laget.
