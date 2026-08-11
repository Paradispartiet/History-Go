# Torggata – fase 7C Fortellinger audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Story-fil: `data/stories/stories_torggata.json`
- Story-governance: `docs/STORIES_DATA_GOVERNANCE.md`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Baseline: 7B Historie merget i PR #4822, merge `20f775df7a7c09f3d0c1debaa2d2d45a16431d68`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
AKTIV STORY: st_torggata_ga_og_sykkelgate_2010
AKTIV MANIFESTSTATUS: story-filen er registrert i data/stories/stories_manifest.json
TIDLIGERE EPISODE-V1-MIGRASJON: ingen funnet
BESLUTNING: BEHOLD DEN ENE NARRATIVE HOVEDIDEEN, MEN MIGRER STORYEN TIL DAGENS KONTRAKT
```

## Hvorfor dette fortsatt er en Story

Materialet er ikke bare en chronology-post. Fortellingen har en selvstendig narrativ akse:

1. Torggata skulle få en annen trafikkløsning og rolle i byen;
2. flere hensyn måtte forenes: gående, syklende, handel, varelevering og byliv;
3. den ferdige løsningen skapte nye konflikter om hvordan samme gateflate skulle leses og brukes.

Hvis årstallene tas bort, står det fortsatt igjen et tydelig spørsmål: **hvordan endrer man en gate for flere brukergrupper uten at kampen om plassen forsvinner?**

Storyen skal derfor ikke splittes i egne Stories for 2009, 2010 og 2014. De datoene hører i chronology; Storyen samler dem i én konflikt- og transformasjonsfortelling.

## Kildereview

Fase 7C kontrollerte storyens sentrale påstander mot eksterne kilder:

- Oslo byleksikon dokumenterer at den østre delen ble gågate i 2009, at Torggata ble bygget om for prioritering av gående og syklende, og at den nye gateutformingen åpnet i 2014.
- `Arkitektur skaper verdi – Torggata` dokumenterer bystyrevedtaket i 2010 om prioritert gå- og sykkelgate med mulighet for biladkomst og beskriver de konkurrerende hensynene i planleggingen.
- Transportøkonomisk institutt dokumenterer senere konflikter i Torggata og forklarer dem med at gående og syklende kunne oppfatte samme gate som henholdsvis gågate og sykkelgate.

Den tidligere formuleringen om at 2009 var et «prøveprosjekt» ble ikke beholdt. Storyen bruker den mer presise, kildebårne formuleringen om fysiske sperrer/bilbegrensning og bystyrevedtaket i 2010.

## Episode-v1-migrasjon

Storyen oppgraderes til:

```text
quality_profile: episode_v1
type: conflict
year: 2010
```

`conflict` velges fordi fortellingens motor er konkurrerende bruk og fortolkning av samme gateareal, ikke bare at en fysisk ombygging fant sted.

Primært episodeanker:

- aktører: Oslo bystyre, Bymiljøetaten, gående og syklende, næringsdrivende og gårdeiere;
- dato: 2010;
- handling: bystyrevedtak om prioritert gå- og sykkelgate med biladkomst;
- konsekvens: ombyggingen fram mot åpning i 2014 og et nytt gaterom der brukergrupper fortsatt måtte forhandle om samme flate.

## Next scenes

Den gamle koblingen til `markveien` fjernes.

Begrunnelsen var bare at Markveien er «en annen indre øst-gate der handel, servering og attraktivitet former bylivet». Det er et tematisk naboskap, ikke en dokumentert narrativ fortsettelse av Torggata-storyen. Story-governance tillater ikke `next_scenes` som generell kuratorisk anbefaling.

`related_places` tømmes også i denne Storyen fordi Storgata og Markveien ikke er nødvendige aktører eller fysiske ledd i den konkrete 2010-fortellingen.

## Score

Score er beregnet etter den aktive scoringmotoren i `tools/check_stories_integrity.mts`, ikke satt redaksjonelt:

```json
{
  "narrative": 5,
  "historical": 2,
  "source": 5,
  "play_value": 5,
  "originality": 3,
  "total": 20
}
```

Filen registreres i `data/stories/stories_episode_v1_manifest.json`, slik at full `episode_v1`-integritet blir bindende.

## Bevisst ikke gjort

- ingen nye Torggata-Stories opprettes;
- chronology fra 7B kopieres ikke inn som separate Stories;
- canonical place-record, `desc`, `popupDesc`, koordinater og place-profiler endres ikke;
- Før/etter, Kilder, Quiz, People, Brands og rundinger berøres ikke;
- ingen person-ID-er legges til uten dokumentert canonical personkobling.

## Regresjonslås

`tests/torggata-phase7c-story.test.mjs` låser:

1. nøyaktig én Torggata-story;
2. `quality_profile: episode_v1`;
3. canonical type `conflict`;
4. episodefelt og minst tre HTTPS-kilder;
5. tomme `related_places` og `next_scenes`;
6. maskinberegnet score 20;
7. registrering i episode-v1-manifestet.

7C settes først **GODKJENT** etter `npm run check:stories` / relevant CI, squash-merge og kontroll på faktisk `main`.
