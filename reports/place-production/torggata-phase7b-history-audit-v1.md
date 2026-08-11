# Torggata – fase 7B Historie audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Fase-7-audit: `reports/place-production/torggata-phase7-popup-tabs-audit-v1.md`
- 7A baseline: PR #4820, merge `49b79250403bdbfd6db0a4d07aa57887fa7eefe4`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid-gate

```text
TIDLIGERE-ARBEID-SØK: UTFØRT
TIDLIGERE GODKJENT CHRONOLOGYJOBB: ingen funnet etter dagens popup-/place-kontrakt
LEGACY-FUNN: leksikon_oslo_by_batch1.json har én navnløs Torggata-post med ukildet chronology «Senmodernitet»
BEHOLD: fase-6 history_layers og fase-5 kilde-/claim-base
BESLUTNING: REELT NYTT 7B-ARBEID – bygg kort kildebåret chronology og undertrykk bare den navnløse legacy-posten i popupen
```

## Historieflaten før 7B

Etter 7A hadde popupen:

- fem kildebårne `history_layers` fra canonical place-data;
- ny `title: Torggata`-hovedartikkel med kilder;
- men `mainArticle()` beholdt alle øvrige Leksikon-poster som `extras`;
- den gamle batchposten hadde ingen tittel/navn, tom `sources` og én generisk chronology-post: `Senmodernitet`;
- tabs-runtime samlet både hovedartikkelens chronology og `extras[*].chronology`, og viste navnløse extras som «Historie og bruksspor».

Dermed var legacy-posten fortsatt synlig i Historie selv om 7A hadde fått riktig Om-hovedartikkel.

## Canonical chronology

`data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json` oppgraderes til version 3 og får seks korte milepæler:

| År | Milepæl | Kildegrunnlag |
| --- | --- | --- |
| 1846 | Stortorvet–Youngstorget opparbeides som Øvre Torvegade | Oslo byleksikon |
| 1852 | Navneformen Torvegaden vedtas | Oslo byleksikon |
| 1876 | Gaten er ført fram til Ankerbrua | Oslo byleksikon |
| 1929 | Eldorado gjenåpner som Norges første lydfilmkino | Oslo byleksikon + SNL |
| 1986 | Rockefeller åpner i tidligere Torggata bad | Rockefeller |
| 2014 | Ny gateutforming åpner med prioritet for gående og syklende | Oslo byleksikon + Torggata Gateforening |

Chronology svarer bare på **hva som skjedde når**. Den kopierer ikke den narrative Storyen og erstatter ikke `history_layers`.

## Forholdet til `temporal_profile`

Fase 6 registrerte samme hovedmilepæler som kompakt strukturell profil. 7B bruker Leksikon `chronology` som den brukerrettede tidslinjeeieren i Historie-fanen.

Det bygges derfor ikke en ny generell `temporal_profile`-renderer. Profilen forblir canonical struktur; chronology er den eksplisitte brukerrettede tidslinjen som popupkontrakten allerede eier og renderer.

## Opt-in legacy-supersession

Hovedartikkelen får:

```json
"suppress_untitled_legacy_articles": true
```

`place-popup-tabs.js` får en generell, opt-in helper `visibleArticlesForPopup()`:

- uten flagget skjer ingen endring;
- med flagget beholdes hovedartikkelen og alle navngitte ekstraartikler;
- bare navnløse legacy-artikler filtreres bort fra popupens extras;
- filtreringen brukes også når Kilder-fanen samler Leksikon-lenker, slik at undertrykt legacy ikke blir en parallell popupkilde.

Ingen place-ID er hardkodet i runtime. Ingen andre steder påvirkes før de eksplisitt bruker samme flagg.

## Bevisst ikke gjort

- legacy batchposten slettes ikke; den beholdes fysisk for historisk sporbarhet;
- ingen Story endres i 7B;
- `desc`, `popupDesc`, description package, koordinater og structured profiles endres ikke;
- `history_layers` omskrives ikke;
- Før/etter, Kilder, Quiz, People, Brands og rundinger berøres ikke;
- ingen nye historiske påstander introduseres utenfor fase-5-påstandsbanken.

## Regresjonslås

`tests/torggata-phase7b-history.test.mjs` låser:

1. chronology-år = `1846, 1852, 1876, 1929, 1986, 2014`;
2. alle chronology-poster har konkrete tekster og HTTPS-kilder;
3. legacy-posten er fortsatt fysisk til stede, navnløs og ukildet;
4. popup-runtime bruker opt-in supersession og bygger `extras` fra `visibleArticles`;
5. Kilder-fanen bruker samme synlige artikkelsett.

7B settes først **GODKJENT** etter grønn relevant CI, squash-merge og kontroll på faktisk `main`.
