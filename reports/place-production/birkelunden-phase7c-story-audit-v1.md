# Birkelunden – fase 7C Fortellinger audit v1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Story ID: `st_birkelunden_bench_to_association`
- Baseline: `main` etter fase 7B / PR #5262 / `54e7177a5a3b4563eafe4b0c40e8667348cbe67e`, med senere TypeScript-scope-merge bevart i branch-baseline `847a2e8ca3e71a3bfdd9bc41e7029a41e1c9dec4`
- Story-governance: `docs/STORIES_DATA_GOVERNANCE.md`
- Evidence addendum: `reports/place-production/birkelunden-phase7c-story-source-addendum-v1.json`
- Status: **KLAR FOR REVIEW / CI**

## Tidligere-arbeid-gate

```text
AKTIV BIRKELUNDEN STORY FØR 7C: ingen
STORY-MANIFEST BIRKELUNDEN: ingen
EPISODE-V1 BIRKELUNDEN: ingen
CANONICAL JACK JOHNSEN PEOPLE-ID: ingen funnet
BESLUTNING: materialiser én ny stedseid episode_v1-story; ikke opprett People som sideeffekt
```

## Narrativt spørsmål

> Hvordan kunne noen få pensjonister på en benk i Birkelunden bli til en organisert forening?

Dette består anti-chronology-testen. Hovedverdien er ikke «1937 – forening stiftet», men forvandlingen:

1. 10–12 pensjonister møtes på en benk;
2. gruppen får låne en hvilebrakke;
3. gruppen vokser til 18 personer;
4. den organiserer seg som forening i 1937;
5. organiseringen får et senere fysisk minnespor i samme park gjennom Jack Johnsen-bysten i 1984.

Story-type er `turning_point` fordi 1937 er overgangen fra uformell møtepraksis til formell organisering.

## Kilder

### Pensjonistforbundet – Vår historie

Støtter den konkrete scenesekvensen:

- Jack Johnsen som pioner;
- 10–12 pensjonister på en benk i Birkelunden;
- senere lån av hvilebrakke;
- 18 personer i 1937;
- etablering av forening;
- navneformen `Venner i Bjerkelunden`.

### Oslo Byarkiv – TOBIAS 2–3/2006

Birkelunden-artikkelen støtter uavhengig:

- at Jack Johnsen stiftet pensjonistforening i Birkelunden i 1937;
- navnevarianten `Venner i Birkelund`;
- at han var formann i 23 år;
- senere verv i Pensjonistforbundet;
- bysten og innskriften `Reist av pensjonister 1984`.

PDF-en ble åpnet gjennom web-PDF-verktøyet. Forsøk på side-screenshot ble også gjort som påkrevd for PDF-analyse, men kildeserveren returnerte cache-miss i screenshot-endepunktet. Storyen bruker derfor bare tekst som også er direkte tilgjengelig i den indekserte Byarkiv-PDF-teksten; ingen visuelt avhengige bilde-/layoutclaims er brukt.

### Oslo byleksikon – Birkelunden

Støtter uavhengig:

- at Jack Johnsen stiftet pensjonistforeningen her i 1937;
- at bysten ble satt opp i 1984;
- innskriften på bysten.

## Navnevariant – ikke skjult

Kildene har en reell ordlydsforskjell:

```text
Pensjonistforbundet: Venner i Bjerkelunden
Oslo Byarkiv:        Venner i Birkelund
```

Storyen gjengir begge formene og sier eksplisitt at kildene bruker ulik navneform. Den normaliserer ikke historien til én form uten ytterligere dokumentasjon.

## Held-back superlativ

Påstanden om at dette var `Norges/landets eldste pensjonistforening` er **ikke** promotert.

Storyens narrative verdi er komplett uten superlativet, og fase-2-pakken hadde allerede klassifisert denne som held-back inntil eget uavhengig superlativ-review.

## People- og relationsgrense

Repo-søk og People-manifest-audit fant ingen canonical Jack Johnsen People-ID.

Derfor:

```text
person_id: null
related_people: []
```

Jack Johnsen navngis i teksten og episode-aktørene fordi kildene dokumenterer ham. En ikke-eksisterende People-ID opprettes ikke eller gjettes.

Det finnes heller ingen nødvendig dokumentert canonical `related_places`-/`next_scenes`-fortsettelse for akkurat denne episoden. Geografiske eller tematiske nabosteder blir derfor ikke kunstige Story-relasjoner.

## Runtime og manifest

Ny fil:

`data/stories/stories_birkelunden.json`

registreres i canonical runtime-/governance-manifest:

`data/stories/stories_manifest.json`

og i streng episodekontrakt:

`data/stories/stories_episode_v1_manifest.json`.

`tools/check_stories_integrity.mts` krever at alle `episode_v1`-filer også er aktive i hovedmanifestet, og `stories_loader.js` laster hovedmanifestet direkte. Birkelunden registreres derfor **ikke** i `data/stories/stories_manifest_by_batch_01.json`; By-batch-manifestet forblir uendret slik at samme Story-fil ikke hentes to ganger før Story-ID-deduplisering.

## Maskinscore

Aktiv `runtimeScore()` i `tools/check_stories_integrity.mts` gir:

```json
{
  "narrative": 3,
  "historical": 2,
  "source": 5,
  "play_value": 3,
  "originality": 3,
  "total": 16
}
```

Scoren er ikke pyntet med nøkkelord for å jage høyere poeng. Den må samsvare nøyaktig med den aktive motoren, mens den separate narrative Story-testen avgjør om fortellingen faktisk er god nok.

## Permanent regresjonslås

`tests/birkelunden-phase7c-story.test.mjs` låser blant annet:

1. én samlet Birkelunden Story;
2. canonical Story-ID, place ID, `episode_v1`, type og år 1937;
3. benk → hvilebrakke → 18 personer → organisering;
4. tre inspectable HTTPS-kilder;
5. eksplisitt håndtering av `Bjerkelunden` / `Birkelund`-varianten;
6. fravær av `Norges/landets eldste`;
7. tom `related_people`, `related_places` og `next_scenes`;
8. eksakt maskinscore 16;
9. registrering i canonical `stories_manifest.json` og `stories_episode_v1_manifest.json`;
10. evidence-addendumets scopebeslutninger.

Testen er koblet direkte inn i `.github/workflows/stories-governance.yml`.

## Bevisst ikke endret

- canonical Birkelunden Place JSON;
- descriptions, profiler eller history layers;
- People-data;
- Objects;
- Leksikon;
- popup-runtime;
- narratives/graph;
- Før/etter, Nyheter, Lesespor, Kilder eller Språk;
- `data/stories/stories_manifest_by_batch_01.json`.

## Økonomi

Modell/API-kreditter i Story-produksjonen: **0 eksterne modellkall**. Eksisterende Content Factory-evidence ble gjenbrukt, og tre offentlige kilder ble manuelt/verktøyverifisert. Dette er en arbeidsmåling, ikke en kvalitetsreduksjon.

## Kvalitetsvurdering før CI

1. Korrekthet/evidens: **5/5**
2. Dekning: **5/5**
3. Narrativ/redaksjonell kvalitet: **5/5**
4. Teknisk integritet: **4/5** – endelig 5 krever grønn Stories governance
5. Sikkerhet/ansvarlighet: **5/5**
6. Vedlikeholdbarhet: **5/5**

Foreløpig **29/30**. Fase 7C er ferdig først etter grønn CI og merge.

Neste delsteg: **7D – Før/etter**.
