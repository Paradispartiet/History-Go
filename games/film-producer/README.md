# HG Film Producer

HG Film Producer er scaffoldet som et uavhengig History Go-læringsspill. Civication kan lenke hit og vise status, men skal ikke være motoren til spillet.

## Data

`data/` er reservert for senere manifest, locations, personer, verk, produksjonsoppgaver og progresjonsregler.

## Profilkontrakt

Når senere kode endrer progresjon, unlocks, badges, steder, personer, verk eller poeng, skal spillet kalle:

```js
window.dispatchEvent(new Event("updateProfile"));
```
