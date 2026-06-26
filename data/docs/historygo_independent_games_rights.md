# Rettighetsregel for uavhengige History Go-læringsspill

Spillene kan bruke forfatternavn, titler, historiske fakta, tema, formgrep, public domain-tekster og brukerens egne tekster.

Spillene skal ikke importere eller gjengi opphavsrettsbeskyttet boktekst som treningsdata, oppgaveinnhold, fasit, eksempeltekst eller seed-data.

Ratinger eller private metadata fra eksterne leselister kan bare brukes som kurateringsfilter. De skal ikke lagres i History Go-data når de ikke trengs for spillets åpne datagrunnlag.

Civication kan lenke til spillene og vise status fra dem, men Civication skal ikke eie motor, datagrunnlag eller progresjon for Football Manager, Film Producer, Kunstskolen eller Skrivekunstakademiet.

Når spill senere endrer progresjon, unlocks, badges, steder, personer, verk eller poeng, skal de varsle profilen med:

```js
window.dispatchEvent(new Event("updateProfile"));
```
