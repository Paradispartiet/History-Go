# Wonderkammer – datastandard

Wonderkammer er History Gos stedlige forundringskammer: en samling av faktiske små skatter, spor, objekter, naturfunn, lyder, materialer, navn og detaljer som finnes ved et sted — og som åpner for lek, sansing, undring, historie og samling.

Denne mappa inneholder data som leses inn i `window.WONDERKAMMER` ved boot via manifestet i `data/wonderkammer/index.json`, og rendres av `js/ui/wonderkammer-entry.js`.

---

## Grunnregel

1. Først tingen.
2. Så undringen.
3. Så handlingen.
4. Så samlingen.

- **Tingen** kan være et objekt, spor, detalj, lyd, materiale, naturfunn, lekeapparat, treningsobjekt, teknisk innretning, navn, relikvie, synlig historisk rest eller fast romlig forhold.
- **Undringen** er hva tingen åpner: hvorfor den er rar, fin, sjelden, viktig, oversett eller interessant.
- **Handlingen** er hva brukeren kan gjøre: se, finne, lytte, kjenne, sammenligne, bruke, leke, trene, følge eller undersøke.
- **Samlingen** er hvordan funnet kan bli et History Go-objekt: spor, lydminne, stedsord, relikvie, materialprøve, kroppserfaring, naturfunn, symbol, observasjon.

---

## Presiseringer

- Filosofiske/sanselige smartfelt er tillatt, men de skal springe ut fra en konkret ting.
- Aktiviteter er tillatt, men de skal være forankret i en konkret ting.
- Lekeplass-entries er tillatt, men apparater skal behandles som små maskiner/objekter/skatter, ikke bare «noe barnet kan gjøre».
- Treningsentries er tillatt, men skal knyttes til konkrete flater, linjer, trapper, bakker, ramper, apparater eller kroppslige spor.
- Byromsentries skal knyttes til konkrete skilt, kanter, dører, murer, materialer, lyder, navn, former eller spor.
- Naturentries skal knyttes til konkrete planter, vannløp, jord, stein, røtter, fugler, værspor, sesongtegn eller lyder.
- Historieentries skal knyttes til synlige rester, navn, minnesmerker, murer, porter, plaketter, bygninger eller dokumenterte artefakter.

---

## Kvalitetsregel

En ny Wonderkammer-entry skal kunne svare på:

- Hva er den faktiske tingen?
- Hvor finnes den konkret?
- Hva er forunderlig ved den?
- Hva kan brukeren gjøre med den?
- Hva kan den samles som?

---

## Felter på en chamber/entry

### Eksisterende kjernefelt (bakoverkompatible, ikke fjern)

| Felt | Bruk |
|---|---|
| `id` | Unik streng. Konvensjon: `wk_<placeid>_<short>` |
| `title` | Kort visningstittel |
| `type` | Type fra typetabellen i renderer (`play_zone`, `art_zone`, `urban_space`, …) |
| `description` | Hva dette nivået eller objektet er |
| `activityText` | Hva man kan gjøre her (særlig for `play_*`, `training_*`, `activity`) |
| `ageHint` | Anbefalt aldersnivå eller "alle nivåer" |
| `items` | Array med underliggende entries (lekeobjekter, items, detaljer) |

Eksisterende meta-felt (rendres som meta-grid):
`safetyNote`, `durationHint`, `intensity`, `equipment`, `season`, `playMode`, `socialMode`.

### Eksisterende smart-felt fra PR #498

`observationHook`, `whyItMatters`, `placeSpecificDetail`, `sensoryPrompt`, `microMission`, `childAction`, `adultRole`, `historyLayer`, `socialLayer`, `materialLayer`, `conceptHook`, `collectibleHint`.

### Nye valgfrie treasure-felt

Fjern ikke gamle felt. Disse feltene er tillegg og rendres kun hvis de finnes:

- `treasureTitle`
- `treasureType`
- `cabinetCategory`
- `curiosity`
- `whereToFind`
- `whatToDo`
- `whatToNotice`
- `material`
- `rarity`
- `collectible`
- `collectionNote`
- `sourceNote`

`sourceNote` skal angi grunnlaget for tingen, med verdier som:

- `synlig fast stedselement`
- `dokumentert historisk objekt`
- `navngitt kunstverk`
- `kjent arkitekturdetalj`
- `fast naturfenomen`
- `place-data`
- `offisiell kilde`

Ikke bruk `må verifiseres` i vanlige datafiler.

---

## Praktiske notater

- Gamle entries uten smart- og treasure-felt skal fortsatt fungere uendret.
- Renderer viser bare seksjoner som finnes.
- Wonderkammer-popupen åpnes via `window.Wonderkammer.openEntry(id)`. API-en endres ikke når nye felter legges til.
- Validering: `node scripts/audit-wonderkammer-data.mjs`.
  Balanse-/kvalitetsvarsler er warnings, ikke hard errors, slik at eksisterende data fortsatt parses.
