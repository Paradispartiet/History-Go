# Stories governance metrics

`tools/report_stories_governance.mts` gir et deterministisk øyeblikksbilde av hvor langt Stories-systemet er kommet i migreringen til `episode_v1`.

## Kjøring

Tekstrapport:

```bash
npx tsx tools/report_stories_governance.mts
```

Maskinlesbar rapport:

```bash
npx tsx tools/report_stories_governance.mts --json
```

## Måltall

Rapporten beregner:

- antall canonical place-records
- antall aktive, unike storyfiler
- totalt antall stories
- antall og andel `episode_v1`-stories
- antall legacy-stories som fortsatt ikke er migrert
- antall steder med minst én primær story
- samlet story place-coverage
- antall episode-ready places med minst én primær `episode_v1`-story
- episode-ready place-coverage

## Definisjoner

### Story-covered place

Et canonical sted som er brukt som `place_id` i minst én aktiv story.

Sekundære `related_places` og `next_scenes` teller ikke som primær dekning.

### Episode-ready place

Et canonical sted som er brukt som `place_id` i minst én story som enten:

- ligger i en fil registrert i `data/stories/stories_episode_v1_manifest.json`, eller
- eksplisitt har `quality_profile: "episode_v1"`.

### Legacy story

En aktiv story som ikke regnes som `episode_v1` etter definisjonen over. Begrepet sier bare at storyen ikke er migrert til den strenge episodekontrakten; det er ikke i seg selv en påstand om at innholdet er feil.

## Feilgrenser

Rapportøren stopper med feil dersom den finner blant annet:

- ugyldige eller uleselige JSON-filer
- manifest-entryer uten filsti
- duplikate canonical place-ID-er
- duplikate story-ID-er
- episodefiler som ikke er aktivert i det ordinære Stories-manifestet

Rapportøren erstatter ikke `npm run check:stories`. Integritetskontrollen avgjør om dataene er gyldige; metrics-rapporten beskriver migrerings- og dekningsstatusen.