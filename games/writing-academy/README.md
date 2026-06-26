# Skrivekunstakademiet

Skrivekunstakademiet er et uavhengig History Go-læringsspill. Det leser felles History Go-samlinger for steder, personer, verk, institusjoner, ruter, merker, objekter og relasjoner, men eies ikke av Civication.

## v1-scope

Denne mappen inneholder kun datascaffold:

- `data/tracks.json`
- `data/assignments.json`
- `data/craft_parameters.json`
- `data/goodreads_author_seed.json`

Spillet skal lære brukeren skrivekunst gjennom forfattere, steder, verk, scener, fortellerstemmer, dialog, essay, rytme og komposisjon. Det skal ikke kopiere beskyttet boktekst.

## Profilkontrakt

Når senere kode endrer progresjon, unlocks, badges, steder, personer, verk eller poeng, skal spillet kalle:

```js
window.dispatchEvent(new Event("updateProfile"));
```
