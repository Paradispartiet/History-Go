# Wonderkammer model audit — 2026-07-28

Status: **architecture audit / migration input**  
Scope: `data/wonderkammer/` + current PlaceCard/Leksikon integration

## Konklusjon

Repoet bruker navnet **Wonderkammer** om minst tre forskjellige produktmodeller. De kan ikke fortsette som én brukerflate uten å skape semantisk sammenblanding.

Canonical retning fra denne auditen:

1. **actual-site-treasure / stedsspesifikk kuriositet** beholdes som Wonderkammer-kjernen;
2. **aktivitet, lek, trening og oppgaver** migreres til **På stedet → Gjør på stedet**;
3. **navigasjon til personer/steder/institusjoner/praksiser/verk** migreres til relations, NextUp og de relevante visuelle samlingene;
4. chronology- og story-lignende entries flyttes bare når de faktisk passer History eller Stories-reglene;
5. Wonderkammer vises ikke som canonical PlaceCard-runding eller automatisk popupseksjon før denne klassifiseringen er gjennomført.

## Modell A — navigasjons-Wonderkammer

Den tidligere Wonderkammer-kontrakten definerte typer som `place`, `person`, `institution`, `practice`, `work` og `trace`, og beskrev hovedfølelsen som «Her kan jeg gå videre».

Dette er i praksis en kuratert graf.

### Overlapp i dagens system

- `relations`
- NextUp / Fortsett reisen
- People-rundingen
- Brands-rundingen
- Works-rundingen
- ruter og stedskoblinger

### Beslutning

Ikke produser nye navigasjons-Wonderkammer. Legacy-data skal flyttes til riktig relasjons-/navigasjonslag når de auditeres.

## Modell B — aktivitets-/undrings-Wonderkammer

Denne modellen er omfattende og tydelig i aktive data.

### Representative filer

`data/wonderkammer/base.json`

- `st_hanshaugen_park` inneholder `play_zone`, `open_play_area`, `exploration_zone`, `activityText`, `ageHint`, `adultRole`, `childAction` og `microMission`.
- Samme fil inneholder også abstrakte media-/kunnskapskonsepter som `media_concept` på NRK Marienlyst.

`data/wonderkammer/urban_culture.json`

- `sofienbergparken` har plenstafett, rolig base og rute rundt parken.
- `skur13` har `training_zone`, balanse på brett, rullelinje og eksplisitte treningsinstruksjoner.

`data/wonderkammer/person_chambers.json`

- Munch, Birkeland, Wergeland og Undset har `activityText`, aldershint, observasjonsoppgaver og lesings-/forskningsaktiviteter.
- Dette er ikke stedsspesifikke samleobjekter; det er aktivitet/undring og pedagogiske prompts.

### Beslutning

Denne modellen er ikke canonical Wonderkammer.

Migreringsmål:

- `play_zone`, `open_play_area`, lek og barneaktiviteter → `play_profile` / På stedet;
- `training_zone`, øvelser og sikkerhetsinstruksjoner → `training_profile` / På stedet;
- generiske oppgaver og mikrooppdrag → `tasks_profile` / På stedet;
- rene observasjonsoppgaver → observations/Observer-flow;
- personbaserte pedagogiske prompts → People-/knowledge-/quiz-system etter innholdstype.

## Modell C — actual-site-treasure

Dette er den tydeligste samlingsmodellen og den som passer best med den nye visuelle samleobjekt-tanken.

### Representative filer

`data/wonderkammer/actual_site_treasures_batch_1.json`

Eksempler:

- Bisletts løpebane;
- Bislett som OL-skøytearena;
- Akershus festningsmurer;
- bastionene mot fjorden;
- slottsgården;
- fysisk minnespor etter rettsoppgjøret.

Feltene er typisk:

- `treasureScope: "actual_site_treasure"`;
- `treasureTitle`;
- `treasureType`;
- `cabinetCategory`;
- `curiosity`;
- `whereToFind`;
- `whatToNotice`;
- `material`;
- `rarity`;
- `collectible`;
- `collectionNote`.

`data/wonderkammer/atlas_obscura_oslo_microplaces_batch_1.json`

Eksempler:

- Oslo-djevelen i Oslo domkirke;
- `She Lies` ved Operahuset;
- `Liberté`-toalettene i Spikersuppa.

Disse er konkrete, fysisk lokaliserbare og samlingsvennlige. De mister mening hvis de flyttes til et tilfeldig annet sted.

### Beslutning

Dette er basis for canonical Wonderkammer videre.

`whatToDo` kan beholdes når det bare er en liten observasjonshandling som hjelper brukeren å se selve kuriositeten. Det skal ikke bli trenings-/oppgaveinnhold.

## Blandingsproblemet i dagens manifest

`data/wonderkammer/index.json` laster i samme runtime blant annet:

- `base.json`
- `urban_culture.json`
- playground-/training-filer
- `person_chambers.json`
- `time_layers.json`
- `actual_site_treasures_batch_1.json`
- `site_package_*`
- Atlas Obscura-batcher
- Oppdag Kvadraturen-batcher

Dermed blandes aktivitet, personpedagogikk, historie, kuriositeter og samleobjekter før UI-laget får en sjanse til å skille dem.

Dette er hovedårsaken til at Wonderkammer har fremstått både som «undring/gjør noe her» og som «rar fysisk skatt».

## UI-beslutning i denne PR-en

Wonderkammer:

- fjernes ikke fra source-data;
- slettes ikke fra manifestet;
- vises ikke som canonical PlaceCard-runding;
- vises ikke automatisk i den nye stedspopupen;
- beholdes som migreringsgrunnlag.

Det forhindrer at den blandede legacy-modellen styrer den nye informasjonsarkitekturen.

## Foreslått migreringsklassifisering

Hver fil/entry bør få én intern auditstatus:

- `canonical_treasure_candidate`
- `migrate_to_actions`
- `migrate_to_relations_navigation`
- `migrate_to_history`
- `migrate_to_people_or_knowledge`
- `migrate_to_other_collection`
- `reject_or_duplicate`

## Prioritert migreringsrekkefølge

1. **Playground/training-familien** — høy semantisk klarhet; flyttes til På stedet-profiler.
2. **`base.json` og `urban_culture.json`** — store blandingsfiler med både nyttig stedskunnskap og aktivitetstekst.
3. **`person_chambers.json`** — skill pedagogiske prompts fra eventuelle genuine objekter/spor.
4. **`actual_site_treasures_batch_1.json` + Atlas Obscura-batcher** — valider som første canonical Wonderkammer-pool.
5. **`site_package_*` og Oppdag Kvadraturen-batcher** — entry-for-entry-audit fordi mange inneholder både sterke treasures og historie-/aktivitetstekst.
6. **Navigasjonslegacy** — flytt eksplisitte entity-pekerne til relations/NextUp.

## Ferdigkriterium for Wonderkammer v2

Wonderkammer kan få en egen visuell brukerflate igjen når:

- aktive entries er klassifisert;
- aktivitetstyper ikke lenger lastes som Wonderkammer;
- navigasjonspekere ikke lenger lastes som Wonderkammer;
- canonical treasure-schema er dokumentert og validert;
- alle aktive treasures har gyldig `place_id` og stedsspesifikk begrunnelse;
- UI-et kan vise en samling uten å måtte tolke legacy-typer heuristisk.
