# Religion place migration — Innlandet

Dato: 2026-07-20

## Resultat

43 kirker, kyrkjer, stavkirker og kirkesteder flyttes til primærbadge `religion` gjennom `data/places/category_overrides/innlandet.json`.

Batchen omfatter blant annet:

- Lom stavkirke
- Ringebu stavkirke
- Hegge stavkirke
- Reinli stavkirke
- Granavollen Søsterkirkene
- Øye stavkirke
- Vågå kyrkje
- Lomen stavkirke
- Hedalen stavkirke
- Sør-Fron kirke / Gudbrandsdalsdomen
- Ringsaker kirke
- Slidredomen
- en rekke aktive lokal- og middelalderkirker i Gudbrandsdalen, Valdres, Hedmarken, Toten og Østerdalen

Den fullstendige listen ligger i kategori-override-filen.

## Beholdes under Historie

### `garmo_stavkirke_maihaugen`

Flyttes ikke. Place-data beskriver eksplisitt stedet som en flyttet, museumsgjenreist stavkirke og et kulturminneverncase på Maihaugen. Primærfunksjonen i denne place-modellen er museum/bevaring, ikke ordinært lokalt kirkested.

### `domkirkeodden_hamar`

Flyttes ikke. Stedet er et museums- og ruinmiljø knyttet til middelalderdomkirken, og primæridentiteten er historisk/arkeologisk kulturminne.

### Brannminner og kirketomt

- `grue_kirke_brannminne`
- `valer_kirke_brannminne`
- `vang_stavkirke_tomta_valdres`

Disse er minne-/stedsspor etter tidligere kirker, ikke dagens kirkebygg, og beholder derfor Historie.

### Prestegårder og museer

`ullinsvin_vagaa_prestegard`, `ringebu_prestegard`, bygdemuseer, folkemuseer og andre records som bare har kirkelig tilknytning beholder sine eksisterende primærkategorier.

## Prinsipp

Eksisterende kirkebygg og tydelige kirkesteder får Religion, også når de er gamle og kulturhistorisk viktige. Flyttede museumsbygg, ruiner, minnesteder, tomter og prestegårder klassifiseres etter sin faktiske primærfunksjon og flyttes ikke automatisk.
