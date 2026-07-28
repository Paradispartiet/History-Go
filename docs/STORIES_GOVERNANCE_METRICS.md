# Stories governance metrics

Sist kontrollert: **2026-07-28**

`tools/report_stories_governance.mts` gir et deterministisk øyeblikksbilde av hvor langt Stories-systemet er kommet i den **tekniske migreringen** til `episode_v1` og hvor mange steder som har aktive primære Story-koblinger.

Rapporten er ikke et mål på narrativ kvalitet. Den kan ikke avgjøre om en Story egentlig bare gjentar `chronology`.

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

Disse tallene beskriver aktivering, referansedekning og teknisk migrering. De beskriver ikke om innholdet består den narrative storytesten i `docs/STORIES_DATA_GOVERNANCE.md`.

## Definisjoner

### Story-covered place

Et canonical sted som er brukt som `place_id` i minst én aktiv story.

Sekundære `related_places` og `next_scenes` teller ikke som primær dekning.

Begrepet sier ingenting om hvorvidt Storyen er narrativt sterk eller bare tidslinjepreget.

### Episode-ready place

Et canonical sted som er brukt som `place_id` i minst én story som enten:

- ligger i en fil registrert i `data/stories/stories_episode_v1_manifest.json`, eller
- eksplisitt har `quality_profile: "episode_v1"`.

`episode-ready` er dermed en **teknisk profilstatus**. Den skal ikke brukes som synonym for «narrativt ferdig» eller «story-rich».

Et sted kan være 100 % episode-ready og samtidig trenge redaksjonell konsolidering dersom flere Stories bare gjengir hvert sitt chronology-punkt.

### Legacy story

En aktiv story som ikke regnes som `episode_v1` etter definisjonen over. Begrepet sier bare at storyen ikke er migrert til den strenge tekniske episodekontrakten; det er ikke i seg selv en påstand om at innholdet er feil eller narrativt svakere.

## Hva rapporten ikke måler

Metrics-rapporten beregner foreløpig ikke:

- om Storyen har et tydelig narrativt spørsmål;
- om den har konflikt, valg, overraskelse, spenning eller forvandling;
- om flere daterte Stories bør konsolideres til én større fortelling;
- om en Story hovedsakelig dupliserer stedets `chronology`;
- om Storyen har selvstendig verdi når dato og årstall tas bort fra tittelen;
- om et sted er `narrative-ready` eller `story-rich` etter den redaksjonelle definisjonen.

Slike vurderinger må gjøres mot den narrative storytesten i `docs/STORIES_DATA_GOVERNANCE.md`.

## Chronology-grensen

`chronology` er riktig lag for korte milepæler der hovedverdien er **hva som skjedde når**.

Stories er riktig lag for sammenhengende fortellinger med en selvstendig narrativ motor. Flere chronology-punkter kan inngå i én Story.

Derfor skal høy `episode_v1`-dekning aldri brukes som insentiv til å opprette én Story per viktig årstall.

## Feilgrenser

Rapportøren stopper med feil dersom den finner blant annet:

- ugyldige eller uleselige JSON-filer
- manifest-entryer uten filsti
- duplikate canonical place-ID-er
- duplikate story-ID-er
- episodefiler som ikke er aktivert i det ordinære Stories-manifestet

Rapportøren erstatter ikke `npm run check:stories`. Integritetskontrollen avgjør om dataene er teknisk gyldige; metrics-rapporten beskriver migrerings- og dekningsstatusen; den narrative storytesten avgjør om innholdet faktisk fungerer som Stories fremfor en parallell tidslinje.
