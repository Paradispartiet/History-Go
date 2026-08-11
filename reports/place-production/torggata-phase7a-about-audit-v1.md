# Torggata – fase 7A Om audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Fase-7-audit: `reports/place-production/torggata-phase7-popup-tabs-audit-v1.md`
- Baseline: PR #4817, merge `16c790fcf809b879f0a029e6e3eb7b7dd079ec56`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: fase-5 popupDesc + fase-6 spatial/subplaces er canonical og skal beholdes
EKSISTERENDE LEGACY: Torggata ligger også i leksikon_oslo_by_batch1.json med generisk gentrifiseringsprosa og tomme sources
BESLUTNING: SANER OM-FANEN UTEN Å OMSKRIVE STEDSARTIKKELEN
```

## Problem

Om-fanen bruker riktig `popupDesc` som hovedartikkel og viser allerede `spatial_profile` og `subplaces`. Deretter laster `place-popup-tabs.js` Leksikon og velger en hovedartikkel for samme place.

Legacy-posten i `leksikon_oslo_by_batch1.json` hadde:

- ingen eksplisitt `title`/`name` som canonical hovedartikkel;
- generiske analyser om gentrifisering, leienivå, sosial sortering og kommersialisering;
- tom `sources`-array;
- et ukildet fact-lag.

Dette kunne legge et svakere, ukildet tolkningslag oppå den allerede godkjente fase-5-artikkelen.

## Løsning

Det opprettes en egen manifest-lastet hovedartikkel:

`data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json`

Den har:

- `place_id: torggata`;
- `title: Torggata`;
- `type: main`;
- kort, stedsspesifikk gateidentitet;
- to kildebelagte facts om etappevis opparbeiding og navneformen fra 1852;
- minst to inspectable HTTPS-kilder;
- tom `chronology` slik at 7A ikke forskutterer 7B Historie.

Filen registreres i `data/leksikon/manifest.json`.

## Hvorfor dette overstyrer legacy-posten rent

Både popupfanenes `mainArticle()` og Leksikon-loaderens `resolveMainLeksikonArticle()` prioriterer en artikkel der `title`/`name` matcher canonical `place.name` før de faller tilbake til første legacy-post.

Den nye artikkelen har `title: "Torggata"`; den gamle batchposten har ingen slik tittel. Om-fanen bruker dermed den kildebårne hovedartikkelen uten en Torggata-spesifikk runtime-hack.

Legacy-posten beholdes foreløpig for sporbarhet og håndteres som rest i 7B Historie, fordi den ellers fortsatt kan ligge som ekstra Leksikon-/historiepost.

## Temporal profile

`temporal_profile` kopieres ikke inn i Om som en ny parallell tidslinje. Fase-7-auditen fant at helperen finnes uten renderer, men kontrakten krever samtidig én visuell eier per opplysning og legger detaljert tidslinje i Historie.

Beslutning for 7A:

- Om eier `popupDesc`, spatial orientering og reelle delsteder;
- `temporal_profile` vurderes sammen med chronology/history_layers i **7B Historie**;
- ingen dupliserende milepælrad bygges i Om bare for å vise feltet.

## Bevisst ikke endret

- `data/places/by/oslo/places/torggata.json`;
- fase-5 description package;
- `desc` / `popupDesc`;
- koordinater, anchors eller routeSegments;
- `spatial_profile`, `temporal_profile`, `subplaces`, `history_layers` eller `source_summary`;
- legacy batchposten;
- Story, Før/etter, Lesespor, Quiz, People, Brands eller andre senere faser.

## Regresjonslås

`tests/torggata-phase7a-about.test.mjs` låser at:

1. den nye artikkelen er manifest-lastet;
2. den har `title: Torggata`, `type: main`, kilder og HTTPS-lenker;
3. runtime fortsatt prioriterer navnematchet hovedartikkel foran legacy fallback;
4. 7A ikke legger chronology inn i hovedartikkelen.

7A settes først **GODKJENT** etter grønn relevant CI, squash-merge og kontroll på faktisk `main`.
