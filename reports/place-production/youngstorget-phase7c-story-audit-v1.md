# Youngstorget – fase 7C Fortellinger audit v1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Story ID: `st_youngstorget_mayday`
- Baseline: `main` etter fase 7B / PR #5231 / `d2ab0e7f845ee530c071f3aebfb430dc12efabf7`
- Story-governance: `docs/STORIES_DATA_GOVERNANCE.md`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Shared source pack: `reports/place-production/content-factory-pilot-01-oslo-sentrum-ost-source-pack-v1.json`
- Phase addendum: `reports/place-production/youngstorget-phase7c-story-source-addendum-v1.json`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
AKTIV STORY: st_youngstorget_mayday
AKTIV MANIFESTSTATUS: data/stories/stories_youngstorget.json er allerede runtime-registrert
TIDLIGERE EPISODE-V1-MIGRASJON: ingen funnet
NARRATIVE-REFERANSE: nar_workers_movement_oslo peker til eksisterende Story-ID
BESLUTNING: BEHOLD STORY-ID OG NARRATIV HOVEDAKSE, MEN MIGRER VESENTLIG OMSKRIVING TIL episode_v1
```

## Hvorfor legacy-storyen ikke var god nok

Den gamle Storyen hadde `year: 1930`, men fortalte generelt om «første halvdel av 1900-tallet». Den beskrev faner, taler, arbeidere og politisk makt på et høyt abstraksjonsnivå uten én dokumentert scene som faktisk drev fortellingen framover.

I tillegg hadde den:

- bare kildeetiketter, ikke inspectable HTTPS-kildeobjekter;
- `related_people: ["martin_tranmael"]` uten at Tranmæl var aktør i det valgte episodeankeret;
- `next_scenes -> stortinget` med en generell begrunnelse om at krav «flyttes» fra torget til parlamentet, uten at den konkrete ruten/hendelsen var skrevet inn og kildebelagt i Storyen;
- legacy-score som ikke var bindende mot dagens scoringmotor.

En kosmetisk omskriving ville derfor ikke vært tilstrekkelig.

## Narrativt spørsmål

Den nye Storyen svarer på et konkret spørsmål:

> Hvordan kunne et markedstorg bli startpunktet for at et arbeidslivskrav fysisk ble båret fra et offentlig byrom til Stortinget?

Det gir selvstendig Story-verdi utover `history_layers` og `temporal_profile`. 1890 er episodeankeret, men hovedverdien er handlingsforløpet: oppmøte → avmarsj → overlevering av krav → videre tog → dokumentert senere mobiliseringsbruk.

## Kildereview og kildekonflikt

Fase 7C gjenbruker eksisterende Youngstorget-kilder fra Content Factory-pakken og legger til én ny, uavhengig institusjonell side:

- Oslo byleksikon – Youngstorget: markedsbakgrunn og senere arbeiderbevegelsesbruk;
- Arbeiderbevegelsens arkiv og bibliotek – Åttetimersdagen del 3: 1. mai 1890, åttetimerskravet, omtrent 4 000 deltakere og videre marsj til Tullinløkka;
- Oslo byleksikon – 1. mai: ruten fra Youngstorget via Torggata/Karl Johan til Stortinget, overleveringen til Stortingets presidentskap, videre ferd til Tullinløkka og 3 600 deltakere.

Kildene er enige om hendelsen og hovedruten, men ikke om eksakt deltakertall:

```text
Oslo byleksikon: 3 600
Arbark: nærmere 4 000
```

Storyen skjuler ikke dette. Den bruker «flere tusen» i sammendraget og oppgir begge tall med kildeeier i hovedteksten. Dermed unngår vi falsk presisjon.

Den tidligere held-back formuleringen om «det første 1. mai-demonstrasjonstoget i hovedstaden» **promoteres ikke i 7C**. Storyen trenger ikke superlativet for å fungere, og vi utvider ikke claim-scope bare for å gjøre teksten mer dramatisk.

## Episode-v1-migrasjon

Storyen beholder ID-en:

```text
st_youngstorget_mayday
```

men migreres til:

```text
quality_profile: episode_v1
type: political
year: 1890
episode.date: 1890-05-01
```

`political` er en canonical Story-type og passer fordi den dokumenterte scenen handler om et politisk arbeidslivskrav som blir båret til den formelle politiske institusjonen.

Episodeankeret er:

- aktører: flere tusen arbeidere;
- dato: 1. mai 1890;
- handling: demonstrantene går fra Youngstorget via Torggata/Karl Johan til Stortinget med åttetimerskravet, før toget fortsetter til Tullinløkka;
- konsekvens: kravet blir overlevert Stortingets presidentskap, mens senere 1. mai-bruk dokumenterer at Youngstorget fortsetter som oppstillings- og møtested.

## People-, Place- og next-scene-grense

### Martin Tranmæl

`martin_tranmael` fjernes fra `related_people`.

Denne Storyen er nå forankret i 1890-hendelsen. Tranmæl er ikke en dokumentert aktør i denne episoden, og en generell senere arbeiderbevegelsesrelasjon er ikke nok til å gjøre ham til Story-aktør.

### Stortinget

`stortinget` beholdes som `related_places` og `next_scenes`, men med en helt ny og konkret begrunnelse: demonstrasjonstoget gikk faktisk dit, åttetimerskravet ble overlevert presidentskapet, og toget fortsatte derfra til Tullinløkka.

Dette består governance-kravet om narrativ fortsettelse; det er ikke bare tematisk naboskap.

### Tullinløkka

Tullinløkka nevnes som dokumentert mål for toget, men 7C oppretter ikke en ny canonical Place. Repo-auditen fant ikke en canonical Tullinløkka-Place som kan brukes som referanse, og denne Story-fasen skal ikke skape Places som sideeffekt.

## Score

Scoren er beregnet etter den aktive `runtimeScore()`-motoren i `tools/check_stories_integrity.mts`, ikke satt som redaksjonell kvalitetskarakter:

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

Tre inspectable HTTPS-kilder gir source-score 5. De øvrige feltene følger tekstens faktiske tokenmønster i den bindende motoren. Den maskinelle scoren erstatter ikke den narrative Story-testen.

## Graph/narrative-avhengigheter

Story-ID-en bevares fordi `data/stories/narratives.json` bruker den i `nar_workers_movement_oslo`.

Legacyfilene `data/stories/graph_nodes.json` og `data/stories/graph_edges.json` er ikke Stories source-of-truth i denne fasen. Den aktive graph-builderen bygger Story-noder og relasjoner fra story-manifestet og Story-dataene. Fase 7C endrer derfor ikke disse legacy-snapshotene; graph/discovery cleanup hører til den senere relations-/discovery-fasen.

## Bevisst ikke endret

- canonical Youngstorget Place JSON;
- `desc`, `popupDesc`, spatial/temporal/history/source-profiler;
- Stories runtime-manifestets eksisterende Youngstorget-entry;
- `narratives.json` eller Story-ID;
- Leksikon/chronology;
- popup-runtime;
- Før/etter, Nyheter, Lesespor, Kilder eller Språk;
- People-canonical data;
- Stortinget-canonical data;
- nye Places for Tullinløkka eller rutesegmentene;
- senere graph/discovery-fase.

## Regresjonslås

`tests/youngstorget-phase7c-story.test.mjs` låser:

1. nøyaktig én Youngstorget Story og bevart ID;
2. `quality_profile: episode_v1`, `type: political`, `year: 1890` og `episode.date: 1890-05-01`;
3. tre inspectable HTTPS-kilder;
4. eksplisitt behandling av 3 600 vs. nærmere 4 000;
5. fravær av held-back «første 1. mai-demonstrasjon»-superlativ;
6. tom `related_people` og dermed fjerning av den gamle Tranmæl-koblingen;
7. `stortinget` som eneste related/next Place med dokumentert overleveringsgrunn;
8. score 20 etter aktiv motor;
9. registrering i `stories_episode_v1_manifest.json`;
10. fortsatt runtime-registrering og fortsatt narrative-referanse gjennom bevart Story-ID;
11. evidence-addendumets kildekonflikt og scopebeslutninger.

## Kvalitetsvurdering før CI

1. Korrekthet og evidens: **5/5** – hendelse, rute, krav og kildekonflikt er eksplisitt kildebelagt.
2. Dekning og ferdigstillelse: **5/5** – legacy-storyen er migrert samlet, ikke delvis.
3. Faglig/redaksjonell kvalitet: **5/5** – Storyen har scene, handling, politisk konflikt, konsekvens og stedsverdi utover chronology.
4. Teknisk integritet: **4/5** – episode-v1, manifest og permanent test er materialisert; endelig score krever grønn Story-integritet/CI.
5. Sikkerhet og ansvarlighet: **5/5** – historisk politisk innhold presenteres kildebåret uten udokumenterte personkoblinger eller falsk presisjon.
6. Vedlikeholdbarhet og etterprøvbarhet: **5/5** – ID bevares, kildene er inspectable, discrepancy er maskinlesbar og scope er eksplisitt.

Foreløpig sum: **29/30**.

7C kan først settes **FERDIG OG MERGET** etter grønn relevant CI, squash-merge og kontroll på fersk `main`.

Neste delsteg er **7D – Før/etter**.
