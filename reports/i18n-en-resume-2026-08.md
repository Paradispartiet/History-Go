# EN i18n – gjenopptatt oversetterjobb (august 2026)

## Utgangspunkt

Oversetterjobben ble gjenopptatt på grenen
`claude/historygo-translator-work-8g9dut`. Stedsdatasettet har vokst
kraftig siden forrige oversettelsesrunde, og etterslepet var stort.

Status før arbeidet, fra `node dist/scripts/i18n-audit-places.js <lang>`:

| | en | es | pt |
|---|---|---|---|
| Master places | 1543 | 1543 | 1543 |
| OK | 331 | 331 | 331 |
| Missing | 816 | 816 | 816 |
| Stale | 396 | 396 | 396 |
| Missing `_sourceHash` | 0 | 0 | 0 |
| Extra translation IDs | 4 | 4 | 4 |

Alle tre språkene har identisk etterslep: 1212 oppføringer per språk,
3636 totalt. Kun 21 % av stedene har gyldig oversettelse.

## Feil i kvalitetsgaten (rettet)

`scripts/i18n-quality-places.ts` leste ikke stedsfiler som inneholder
ett enkelt stedsobjekt uten `places`-array. `rows()` returnerte tom
liste for slike filer, så stedene manglet i master-oppslaget og
**samtlige 731 oversettelser** ble rapportert som
`extra_translation_id`. Gaten var i praksis ubrukelig — den ga 731
feil uansett innhold.

`extractRows()` i `i18n-audit-places.ts` håndterer allerede dette
tilfellet. `rows()` er rettet til samme oppførsel, slik at revisjon og
kvalitetskontroll bruker identisk master-tolkning.

Etter rettelsen rapporterer gaten reelle funn: stale-hasher,
`popup_much_shorter`, `paragraphs_collapsed` og de fire faktiske
ekstra-ID-ene.

## Fordeling av etterslepet (en)

| Region | Missing | Stale |
|---|---|---|
| oslo | 288 | 234 |
| agder | 140 | 0 |
| vestland | 121 | 0 |
| innlandet | 10 | 71 |
| vestfold | 57 | 0 |
| telemark | 57 | 0 |
| ostfold | 2 | 44 |
| akershus | 8 | 38 |
| europa/europe | 56 | 4 |
| norge | 38 | 0 |
| øvrige fylker | 38 | 5 |

Oslo utgjør 522 av 1212 og er spillebrettet i hovedappen. Foreldede
Oslo-oppføringer ble prioritert først: de vises allerede i appen, men
med oversettelser som er langt kortere enn dagens norske kildetekst
(typisk 120 engelske ord mot 400 norske).

## Utført i denne økten

Fem batcher à 12 foreldede Oslo-steder, oversatt mot gjeldende norsk
kildetekst og verifisert enkeltvis i kvalitetsgaten.

1. bispelokket, gronland_basarene, karl_johan, radhusplassen, bjorvika,
   ring_3, trikk_17_18, grunerlokka_helgesens_tm, toyen_torg,
   majorstuen_krysset, st_hanshaugen_park, oslo_s
2. vulkan_energisentral, aker_brygge, tigeren, gronland_kirke,
   kampen_kirke, jernbanetorget, oslo_bussterminal, helsfyr,
   bogstadveien, gronlandsleiret, ullevål_hageby, romsaås
3. rodelokka, vaalerenga, vinderen, ullern, spikersuppa, bankplassen,
   christiania_torv, slottsparken, botsparken, stensparken, nydalen,
   tjuvholmen
4. sorenga, majorstuen_tbanestasjon, nationaltheatret_stasjon, bislett,
   birkelunden, akerselva, universitetsplassen, deichman_bjorvika,
   barcode, vigelandsparken, voienvolden, carl_berner_plass
5. tullin, okern, skoyen, torshov, grorud, sagene, saga_kino,
   klingenberg_kino, gimle_kino, vika_kino, hartvig_nissens_skole_skam,
   middelalder_oslo

Alle 60 er rene i kvalitetsgaten — ingen feil, ingen advarsler. Hver
oppføring beholder avsnittsinndelingen og lengden i kilden, slik at
`popup_much_shorter` og `paragraphs_collapsed` ikke utløses.

## Status etter økten (en)

| | Før | Etter |
|---|---|---|
| OK | 331 | 391 |
| Stale | 396 | 336 |
| Missing | 816 | 816 |
| Extra | 4 | 4 |

## Gjenstående og åpne spørsmål

- **1152 oppføringer igjen for `en`** (816 missing + 336 stale), og
  tilsvarende 1212 for hver av `es` og `pt`. Ved 12 per batch er dette
  omkring 290 batcher totalt. Jobben trenger flere økter.
- **Prioritering ikke avklart for `es`/`pt`.** `DEFAULT_LANGS` i
  skriptene er `["en"]`, og arbeidet her har fulgt det. Om spansk og
  portugisisk skal følge engelsk løpende eller tas som egne runder er
  et produktvalg.
- **Fire ekstra oversettelses-ID-er** (`schous_plass`, `kampen`,
  `vaterland`, `gamlebyen`) har ikke lenger noe master-sted. De er
  bevisst ikke slettet: navnene er reelle Oslo-strøk som kan bli lagt
  inn igjen, og da er teksten gjenbrukbar. Sletting bør være en
  eksplisitt beslutning.
- **`i18n:places:check` inngår ikke i `tools:check`.** Nå som gaten
  faktisk virker, kan den vurderes som eget CI-steg — men den vil
  feile til etterslepet er tatt igjen.

## Kommandoer brukt

```bash
npm run build:scripts
node dist/scripts/i18n-audit-places.js en
node dist/scripts/i18n-quality-places.js en
node dist/scripts/i18n-worklist-places.js en --only=missing,stale --limit=5000 --out=<fil>
```
