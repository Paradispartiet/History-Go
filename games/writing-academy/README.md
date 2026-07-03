# Skrivekunstakademiet

Skrivekunstakademiet er et uavhengig History Go-læringsspill. Det leser felles History Go-samlinger for steder, personer, verk, institusjoner, ruter, merker, objekter og relasjoner, men eies ikke av Civication. Spillet er registrert som `hgWritingAcademy` i `data/historygo/shared/game_registry.json`.

## Datagrunnlag

Denne mappen inneholder datascaffold og referanseindeks, ikke kopier av canonical History Go-data:

- `data/literature_source_index.json` peker til canonical litteraturpersoner, litteratursteder, quiz, stories og Goodreads-seed.
- `data/goodreads_author_seed.json` er et privatfelt-sikkert supplement basert på Goodreads-importfilteret `My Rating >= 4`.
- `data/tracks.json`
- `data/assignments.json`
- `data/craft_parameters.json`

History Go eier canonical `people`, `places`, `works` og `relations`. Skrivekunstakademiet bruker referanser og matcher-resultater.

## Tre kilder i spillet

1. `historyGoLiteraturePeople` — alle personer fra litteraturmerket i History Go kan bli forfatterkort.
2. `historyGoLiteraturePlaces` — alle litteratursteder i History Go kan bli oppdragssteder.
3. `personalGoodreadsCanon` — Goodreads-bøker som passerte importfilteret, uten lagring av rating eller private Goodreads-felt.

## Goodreads-regel

Goodreads-rating brukes bare som importfilter. Seed-filen skal ikke lagre `My Rating`, `Date Added`, `Date Read` eller `Private Notes`. Barnebøker og YA skal ikke inn i `personalGoodreadsCanon`; de markeres med `excludedForWritingAcademy` og rutes til `hgChildrenLiteratureGame`.

## Matcher og review

Goodreads-forfattere matches mot eksisterende History Go-personer på normalisert navn. Ved treff brukes eksisterende `personId`. Ved manglende treff legges forfatteren i `pending_person_candidates` for menneskelig review. Spillet skal ikke opprette nye canonical people automatisk.

## Oppdrag og rettigheter

Steder låser opp skriveoppgaver som `scene`, `dialog`, `essay`, `stedsskildring`, `fortellerstemme` og `litterær analyse`. Steder med eksisterende stories eller quiz prioriteres først.

Spillet kan bruke forfatternavn, titler, historiske fakta, steder, tema, formgrep og public domain-materiale. Det skal ikke importere eller gjengi opphavsrettsbeskyttet boktekst.

## Profilkontrakt

Når senere kode endrer progresjon, unlocks, badges, steder, personer, verk eller poeng, skal spillet kalle:

```js
window.dispatchEvent(new Event("updateProfile"));
```

## Audit

Kjør:

```bash
npm run audit:writing-academy-literature-index
```
