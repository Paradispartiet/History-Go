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

## Stedsskatt eller kategoriobjekt

Wonderkammer skal først og fremst handle om konkrete faktiske ting som finnes på akkurat dette stedet. Generelle ting som pleier å finnes på en type sted kan brukes som støtte, men bare når de er tydelig merket som typiske kategoriobjekter.

### `actual_site_treasure`

En konkret, faktisk skatt knyttet til akkurat dette stedet. Dette er hovedtypen i Wonderkammer.

Eksempler:
- en navngitt port
- en bestemt mur
- et konkret skilt
- en plakett
- en statue
- en bestemt løpebane slik den finnes på dette stadionet
- en faktisk rampe i et skateanlegg
- en bestemt foss
- et synlig vannløp
- en konkret fasadedetalj
- en faktisk dør, klokke, benk, trapp, tribuneseksjon, stein, bro eller bygning

### `category_object`

Et objekt som er typisk for en stedstype, men ikke i seg selv unikt for dette stedet.

Eksempler:
- en løpebane på en friidrettsarena
- en tribune på et stadion
- en sklie på en lekeplass
- en huske på en lekeplass
- en rampe i en skatehall
- en scene i et kulturhus
- en sti i en park
- en port i en festning

### Presiseringer

- Wonderkammer skal først og fremst bestå av `actual_site_treasure`.
- `category_object` kan brukes som støtte, men skal ikke dominere et sted.
- Nye Wonderkammer-batcher bør som hovedregel ha minst 70–80 % `actual_site_treasure`.
- Maks 20–30 % bør være `category_object`.
- Et `category_object` må alltid knyttes til hvordan objektet faktisk fremstår på dette stedet.
- Hvis en entry kunne vært flyttet til et hvilket som helst tilsvarende sted uten endring, er den for generisk.

### Eksempel: Bislett

For generisk:

> Skatten er løpebanen. En løpebane brukes til sprint og langdistanseløp.

Bedre:

> Skatten er den røde løpebanen på Bislett Stadion. Den er ikke bare en standard friidrettsbane, men en konkret norsk rekordflate knyttet til Bislett Games, publikumslyd, tidtaking og internasjonal friidrettshistorie.

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
- `treasureScope`
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

`treasureScope` skiller faktiske stedsskatter fra typiske kategoriobjekter.

Tillatte verdier:

- `actual_site_treasure`: faktisk stedsspesifikk skatt, førsteprioritet.
- `category_object`: typisk objekt for stedstypen, bare støtte.

Presiseringer:

- Nye entries bør bruke `treasureScope`.
- Gamle entries uten feltet skal fortsatt fungere.
- `sourceNote` skal fortsatt brukes for å forklare grunnlag.

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
