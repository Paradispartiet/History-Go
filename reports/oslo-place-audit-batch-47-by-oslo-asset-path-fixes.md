# Batch 47: by/oslo asset-path fixes

Dato: 2026-06-01

## Formål

Denne batchen er en smal datafix for lavrisiko asset-path warnings i `data/places/by/oslo/places_by.json`, basert på Batch 46-auditen. Det er ikke laget, slettet eller endret bildeassets, og det er ikke gjort bred bildeopprydding.

## Kommandoer kjørt

```bash
npm run health:places
npm run places:emner:check
npm run places:index:check
rg -n "voienvolden|torggata|bogstadveien|barcode|QuizCards|Lavrisiko|Batch 47" reports/oslo-place-audit-batch-46-asset-warning-path-audit.md
python - <<'PY'
import json
from pathlib import Path
p='data/places/by/oslo/places_by.json'
data=json.load(open(p))
for id in ['torggata','voienvolden','bogstadveien','barcode']:
    o=next(x for x in data if x.get('id')==id)
    print(id, {k:o.get(k) for k in ['image','frontImage','cardImage']})
PY
for f in bilder/places/Voienvolden.JPG bilder/kort/places/voienvolden.PNG bilder/places/by/torggata_IMG.JPG bilder/places/by/torggata_Front.WEBP bilder/QuizCards/Bogstadveien.PNG bilder/QuizCards/Barcode.PNG; do test -f "$f" && echo "EXISTS $f" || echo "MISSING $f"; done
rg -n 'bilder/QuizCards|QuizCards' -g '!node_modules' -g '!dist' .
npm run places:index:check
npm run places:index:build
npm run health:places
npm run places:emner:check
npm run places:index:check
git diff -- data/places/by/oslo/places_by.json data/places/places_index.json
git status --short
```

Merk: `npm` skrev `npm warn Unknown env config "http-proxy"` under kontrollene. Kontrollene fullførte likevel.

## Baseline før endring

| Kontrollpunkt | Resultat |
| --- | ---: |
| `health:places` files checked | 40 |
| `health:places` places checked | 459 |
| Hidden places | 0 |
| Stub places | 0 |
| Canonical emne files checked | 16 |
| emne_ids checked | 1032 |
| Canonical emne_ids | 1032 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Allowlisted cross-disciplinary emne_ids | 187 |
| `health:places` errors | 0 |
| `health:places` warnings | 1088 |
| `places:emner:check` | OK |
| `places:index:check` | OK |
| Missing emne_ids | 0 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |

## Batch 46-kandidater og vurdering

| # | Place | Felt | Nåverdi | Kandidat(er) | Kandidatfil eksisterte | Endret? | Begrunnelse |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | `voienvolden` | `image` | `bilder/places/voienvolden.PNG` | `bilder/places/Voienvolden.JPG`; alternativ: `bilder/kort/places/voienvolden.PNG` | Ja, begge finnes | Ja | `bilder/places/Voienvolden.JPG` ligger i ordinær `bilder/places/`-plassering, er et faktisk hovedbilde av Voienvolden-anlegget og matcher `image`-feltets asset-type bedre enn alternativet i `bilder/kort/places/`. Lav risiko fordi det kun retter casing/extension til en eksisterende place-asset. |
| 2 | `torggata` | `image` | `bilder/places/torggata_IMG.JPG` | `bilder/places/by/torggata_IMG.JPG` | Ja | Ja | Kandidaten har samme filnavn som nåverdien, men ligger i faktisk eksisterende `bilder/places/by/`-mappe. Bildet er et ordinært gatebilde og passer som `image`. Lav risiko fordi dette er en directory-path mismatch, ikke et nytt eller semantisk annet bildevalg. |
| 3 | `torggata` | `frontImage` | `bilder/kort/places/by/torggata_Front.WEBP` | `bilder/places/by/torggata_Front.WEBP` | Ja | Ja | Kandidaten har samme frontImage-filnavn som nåverdien, men i eksisterende `bilder/places/by/`-mappe. Bildet er et stående historisk/front-format bilde og beholder feltets frontImage-intensjon. Lav risiko fordi dette er en directory-path mismatch til samme navngitte asset. |
| 4 | `torggata` | `cardImage` | `bilder/kort/places/by/torggata_CardImage.PNG` | `bilder/places/by/torggata_Front.WEBP`; `bilder/places/by/torggata_IMG.JPG` | Ja, begge kandidater finnes | Nei | Det finnes ingen dedikert `torggata_CardImage.PNG`. De to eksisterende kandidatene er allerede brukt/egnet som `frontImage` og `image`. Å gjenbruke en av dem som `cardImage` ville være et semantisk fallback-valg, ikke en eksakt path-fiks. Avvist for å holde batchen lavrisiko. |
| 5 | `bogstadveien` | `cardImage` | `bilder/kort/places/bogstadveien.PNG` | `bilder/QuizCards/Bogstadveien.PNG` | Ja | Nei | Kandidaten finnes, men repo-søk viser `QuizCards` brukt som UI fallback i `js/ui/place-card.js`, ikke som etablert datakilde i place JSON. Å flytte place-data til `bilder/QuizCards/` ville være en policy-/asset-type-endring. Avvist. |
| 6 | `barcode` | `image` | `bilder/places/barcode.PNG` | `bilder/QuizCards/Barcode.PNG` | Ja | Nei | Kandidaten finnes, men `image` forventes å være et ordinært place-bilde. `QuizCards` er observert som UI fallback-kilde, ikke etablert place-data-kilde. Avvist fordi det ikke er trygt å bruke QuizCards som hovedbilde uten egen policybeslutning. |
| 7 | `barcode` | `cardImage` | `bilder/kort/places/barcode.PNG` | `bilder/QuizCards/Barcode.PNG` | Ja | Nei | Kandidaten finnes, men `QuizCards` er ikke bekreftet som akseptert `cardImage`-kilde i place-data. Avvist for å unngå ukritisk bruk av QuizCards-kandidater som place images. |

## Faktiske path-endringer

| Place | Felt | Før | Etter |
| --- | --- | --- | --- |
| `torggata` | `image` | `bilder/places/torggata_IMG.JPG` | `bilder/places/by/torggata_IMG.JPG` |
| `torggata` | `frontImage` | `bilder/kort/places/by/torggata_Front.WEBP` | `bilder/places/by/torggata_Front.WEBP` |
| `voienvolden` | `image` | `bilder/places/voienvolden.PNG` | `bilder/places/Voienvolden.JPG` |

## `places_index.json`

`npm run places:index:check` feilet etter source-endringen fordi indeksen var ute av sync for `torggata.image`, `torggata.frontImage` og `voienvolden.image`. Derfor ble `npm run places:index:build` kjørt. `data/places/places_index.json` er kun generator-synkronisert for disse source-endringene.

## Etter-resultat

| Kontrollpunkt | Resultat |
| --- | ---: |
| `health:places` files checked | 40 |
| `health:places` places checked | 459 |
| `health:places` errors | 0 |
| `health:places` warnings | 1085 |
| `places:emner:check` | OK |
| `places:index:check` | OK |
| Missing emne_ids | 0 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |

Warnings før/etter: **1088 -> 1085**. Reduksjon: **3** warnings.

## Avgrensningsbekreftelser

- Ingen filer under `bilder/**` ble endret.
- Ingen scripts/tools ble endret.
- Ingen canonical-filer ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen manifest-, UI-, CSS-, HTML- eller JS-filer ble endret.
- Emneoppryddingen ble ikke gjenåpnet.
- Ingen legacy/secondary category warnings ble rørt.
- Ingen bred bildeopprydding, bulk-rewrite eller ny bildeproduksjon ble gjort.

## Anbefalt Batch 48

Anbefalt Batch 48: en egen, eksplisitt policy-/dataavklaringsbatch for de avviste basename-/fallback-kandidatene, særlig om `bilder/QuizCards/**` skal kunne brukes i place JSON (`image`/`cardImage`) eller fortsatt bare være UI fallback. Dersom policyen sier nei, bør neste lavrisiko-batch heller produsere/legge inn dedikerte `bilder/places/**` og `bilder/kort/places/**` assets for `torggata.cardImage`, `bogstadveien`, `barcode` og tilsvarende Oslo-funn.
