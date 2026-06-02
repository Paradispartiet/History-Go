# Batch 51: by/oslo asset intake and review plan

Dato: 2026-06-02

## Formål

Dette er en read-only/plan-batch for intake og manuell review av de 20 genererte `by/oslo`-assetene som ble planlagt i Batch 50. Batch 50 laget prompts og en strukturert produksjonskø, men la ikke inn faktiske bildefiler. Batch 51 legger derfor heller ikke inn bilder: målet er å definere nøyaktig hvordan genererte filer skal leveres, kontrolleres og først senere committes.

Denne batchen oppretter bare:

- `reports/by-oslo-asset-intake-manifest-batch-51.json`
- `reports/oslo-place-audit-batch-51-by-oslo-asset-intake-review-plan.md`

## Kommandoer kjørt

```bash
npm run health:places
npm run places:emner:check
npm run places:index:check
python3 - <<'PY'
import json
from pathlib import Path
expected = [
  ('torggata', 'cardImage'),
  ('barcode', 'image'),
  ('barcode', 'cardImage'),
  ('bogstadveien', 'image'),
  ('bogstadveien', 'cardImage'),
  ('bispelokket', 'image'),
  ('bispelokket', 'cardImage'),
  ('oslo_s', 'image'),
  ('oslo_s', 'cardImage'),
  ('jernbanetorget', 'image'),
  ('jernbanetorget', 'cardImage'),
  ('karl_johan', 'cardImage'),
  ('bjorvika', 'image'),
  ('bjorvika', 'cardImage'),
  ('aker_brygge', 'image'),
  ('aker_brygge', 'cardImage'),
  ('gronland_basarene', 'cardImage'),
  ('radhusplassen', 'image'),
  ('radhusplassen', 'cardImage'),
  ('operahuset', 'image'),
]
queue = json.loads(Path('reports/by-oslo-asset-generation-queue-batch-50.json').read_text())
actual = [(entry['place_id'], entry['field']) for entry in queue]
print('count', len(queue))
print('matches expected', actual == expected)
PY
```

## Baseline etter Batch 50

| Kontrollpunkt | Resultat |
| --- | ---: |
| `health:places` Files checked | 40 |
| `health:places` Places checked | 459 |
| `health:places` Hidden places | 0 |
| `health:places` Stub places | 0 |
| `health:places` Canonical emne files checked | 16 |
| `health:places` emne_ids checked | 1032 |
| `health:places` Canonical emne_ids | 1032 |
| `health:places` Unknown emne_ids | 0 |
| `health:places` Wrong-prefix emne_ids | 0 |
| `health:places` Allowlisted cross-disciplinary emne_ids | 187 |
| `health:places` Errors | 0 |
| `health:places` Warnings | 1085 |
| `places:emner:check` | OK; Missing emne_ids 0; duplicate place ids 0 |
| `places:index:check` | OK; `places_index.json` is in sync |
| Batch 50 queue check | OK; 20 objekter og forventet rekkefølge |

## Leste kilder

- `reports/oslo-place-audit-batch-50-by-oslo-asset-generation-prompts.md`
- `reports/by-oslo-asset-generation-queue-batch-50.json`
- `reports/oslo-place-audit-batch-49-by-oslo-dedicated-asset-production-queue.md`
- `reports/oslo-place-audit-batch-48-quizcards-image-policy.md`
- `data/places/by/oslo/places_by.json`
- `js/ui/place-card.js`

## Policybekreftelse

- `bilder/QuizCards/**` skal bare brukes som quizkort / flip-support.
- `bilder/QuizCards/**` skal ikke brukes i place JSON-feltene `image`, `cardImage` eller `frontImage`.
- `image` skal bruke canonical place assets under `bilder/places/**`.
- `cardImage` skal bruke dedikerte card assets under `bilder/kort/places/**`.
- `ImageCard` er ikke i bruk og skal ikke innføres, repareres eller bygges videre på.
- Ikke opprett eller bruk `imageCard`.
- Ikke bruk samme asset som både `image` og `cardImage` uten eksplisitt senere beslutning.

## Hvorfor bilder ikke legges inn ennå

Batch 50 produserte gode genereringsprompter og en strukturert kø, men faktiske bildefiler finnes ikke i repoet ennå. Det er derfor for tidlig å commite assets: hver generert fil må først sammenlignes med sin prompt, sitt planlagte target-path, riktig filformat, riktig beskjæring og gjeldende asset-policy. Batch 51 er en kontrollport før asset-commit, slik at neste batch kan være trygg og smal.

## Intake-/reviewflyt

1. Generer eller importer de 20 filene fra Batch 50-køen uten å endre repo-data.
2. Plasser genererte filer midlertidig lokalt etter staging-konvensjonen under.
3. Kontroller hver fil mot `reports/by-oslo-asset-intake-manifest-batch-51.json`.
4. Avvis filer som bryter kvalitetskriterier, avvisningskriterier eller policy.
5. Merk bare godkjente filer som klare for senere commit i en egen oppfølgingsbatch.
6. Flytt godkjente filer til nøyaktig `target_path` først i Batch 52 eller senere.
7. Hvis `target_path` allerede finnes i place-data som manglende fil, kan oppfølgingsbatchen være ren asset-addition uten JSON-endring.
8. Hvis feltet mangler i place-data eller target-path er en anbefalt ny path, må dataendring tas separat etter at asset-path er godkjent.

## De 20 forventede assetene

| # | place_id | place_name | field | target_path | asset_type | gruppe |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `torggata` | Torggata | `cardImage` | `bilder/kort/places/by/torggata_CardImage.PNG` | `dedicated_card_image` | A |
| 2 | `barcode` | Barcode | `image` | `bilder/places/barcode.PNG` | `ordinary_place_image` | A |
| 3 | `barcode` | Barcode | `cardImage` | `bilder/kort/places/barcode.PNG` | `dedicated_card_image` | A |
| 4 | `bogstadveien` | Bogstadveien | `image` | `bilder/places/bogstadveien.JPG` | `ordinary_place_image` | A |
| 5 | `bogstadveien` | Bogstadveien | `cardImage` | `bilder/kort/places/bogstadveien.PNG` | `dedicated_card_image` | A |
| 6 | `bispelokket` | Bispelokket / Trafikkmaskinen | `image` | `bilder/places/bispelokket_IMG.JPG` | `ordinary_place_image` | A |
| 7 | `bispelokket` | Bispelokket / Trafikkmaskinen | `cardImage` | `bilder/kort/places/by/bispelokket_CardImage.PNG` | `dedicated_card_image` | A |
| 8 | `oslo_s` | Oslo S | `image` | `bilder/places/oslo_s.JPG` | `ordinary_place_image` | A |
| 9 | `oslo_s` | Oslo S | `cardImage` | `bilder/kort/places/oslo_s.PNG` | `dedicated_card_image` | A |
| 10 | `jernbanetorget` | Jernbanetorget | `image` | `bilder/places/jernbanetorget.JPG` | `ordinary_place_image` | A |
| 11 | `jernbanetorget` | Jernbanetorget | `cardImage` | `bilder/kort/places/jernbanetorget.PNG` | `dedicated_card_image` | A |
| 12 | `karl_johan` | Karl Johans gate | `cardImage` | `bilder/kort/places/karl_johan.PNG` | `dedicated_card_image` | A |
| 13 | `bjorvika` | Bjørvika | `image` | `bilder/places/bjorvika.JPG` | `ordinary_place_image` | A |
| 14 | `bjorvika` | Bjørvika | `cardImage` | `bilder/kort/places/bjorvika.PNG` | `dedicated_card_image` | A |
| 15 | `aker_brygge` | Aker Brygge | `image` | `bilder/places/by/oslo/aker_brygge.JPG` | `ordinary_place_image` | B |
| 16 | `aker_brygge` | Aker Brygge | `cardImage` | `bilder/kort/places/by/oslo/aker_brygge.PNG` | `dedicated_card_image` | B |
| 17 | `gronland_basarene` | Grønland basarene | `cardImage` | `bilder/kort/places/gronland_basarene.PNG` | `dedicated_card_image` | A |
| 18 | `radhusplassen` | Rådhusplassen | `image` | `bilder/places/radhusplassen.JPG` | `ordinary_place_image` | A |
| 19 | `radhusplassen` | Rådhusplassen | `cardImage` | `bilder/kort/places/radhusplassen.PNG` | `dedicated_card_image` | A |
| 20 | `operahuset` | Operahuset | `image` | `bilder/places/operahuset.PNG` | `ordinary_place_image` | A |

## Target-path-regel

`target_path` i intake-manifestet er den nøyaktige planlagte repo-plasseringen for en godkjent fil. Filnavn, mappe, format og store/små bokstaver skal ikke improviseres i asset-batchen. Hvis en generert fil godkjennes, skal den senere flyttes til nøyaktig `target_path`. Hvis reviewer vil endre path, skal det dokumenteres og behandles som separat data-/path-beslutning, ikke som stille avvik i asset-commit.

## Anbefalt staging-konvensjon

Ikke opprett staging-mappen i denne batchen. Når faktiske genererte filer finnes, kan de midlertidig legges lokalt her:

```text
_asset_intake/by-oslo-batch-50/
```

Konvensjon:

- Filnavn i staging skal matche `expected_filename` fra intake-manifestet.
- Staging-filer er midlertidige og skal sammenlignes med `target_path` før godkjenning.
- Godkjente filer skal senere flyttes til nøyaktig `target_path`.
- Staging-mappen skal ikke committes med mindre prosjektet senere bestemmer det eksplisitt.

## Kvalitetskriterier for manuell review

Hver fil skal kontrolleres mot minst disse punktene:

- exact target_path planned
- correct place or correct historical/documentary visualization
- no text
- no labels
- no logo focus
- no quiz card layout
- no frame
- no typography
- not QuizCards
- not ImageCard/imageCard
- format matches target_path
- no obvious AI artifacts
- readable composition
- for cardImage: works in wide 2:1 card format
- for image: works as ordinary place image

## Avvisningskriterier

Avvis filen hvis ett eller flere av disse punktene gjelder:

- contains visible generated text or labels
- looks like a quiz card
- contains History Go frame or card layout
- uses QuizCards source
- uses ImageCard/imageCard
- wrong place
- generic unrelated city
- severe AI artifacts
- wrong file format
- wrong aspect/crop for intended field
- unreadable/cropped main subject

## Gruppe A: kan senere legges inn uten JSON-endring

Disse target-pathene finnes allerede i place-data for feltet og er nå bare manglende filer. Når en fil er godkjent, kan en senere asset-batch legge inn filen uten JSON-endring:

- `torggata.cardImage` → `bilder/kort/places/by/torggata_CardImage.PNG`
- `barcode.image` → `bilder/places/barcode.PNG`
- `barcode.cardImage` → `bilder/kort/places/barcode.PNG`
- `bogstadveien.image` → `bilder/places/bogstadveien.JPG`
- `bogstadveien.cardImage` → `bilder/kort/places/bogstadveien.PNG`
- `bispelokket.image` → `bilder/places/bispelokket_IMG.JPG`
- `bispelokket.cardImage` → `bilder/kort/places/by/bispelokket_CardImage.PNG`
- `oslo_s.image` → `bilder/places/oslo_s.JPG`
- `oslo_s.cardImage` → `bilder/kort/places/oslo_s.PNG`
- `jernbanetorget.image` → `bilder/places/jernbanetorget.JPG`
- `jernbanetorget.cardImage` → `bilder/kort/places/jernbanetorget.PNG`
- `karl_johan.cardImage` → `bilder/kort/places/karl_johan.PNG`
- `bjorvika.image` → `bilder/places/bjorvika.JPG`
- `bjorvika.cardImage` → `bilder/kort/places/bjorvika.PNG`
- `gronland_basarene.cardImage` → `bilder/kort/places/gronland_basarene.PNG`
- `radhusplassen.image` → `bilder/places/radhusplassen.JPG`
- `radhusplassen.cardImage` → `bilder/kort/places/radhusplassen.PNG`
- `operahuset.image` → `bilder/places/operahuset.PNG`

## Gruppe B: krever senere JSON-endring etter godkjent asset-path

Disse target-pathene gjelder manglende felt eller anbefalt ny path. Selv om en fil blir godkjent, skal eventuell place-dataendring tas separat etter at asset-path er godkjent:

- `aker_brygge.image` → `bilder/places/by/oslo/aker_brygge.JPG` (`image` mangler i dagens place-data)
- `aker_brygge.cardImage` → `bilder/kort/places/by/oslo/aker_brygge.PNG` (`cardImage` mangler i dagens place-data)

## Anbefalt Batch 52

Hvis faktiske assets finnes og er reviewet/godkjent:

```text
Batch 52: add reviewed by/oslo top asset files without data changes
```

Hvis assets fortsatt ikke finnes:

```text
Batch 52: generate or import reviewed by/oslo asset files
```

Batch 52 bør være en ren asset-addition-batch med ingen JSON-endringer for Gruppe A. For Gruppe B bør asset-path-godkjenning og eventuell dataendring planlegges eksplisitt, og dataendring bør ikke blandes inn i en ren asset-addition-batch uten ny beslutning.

## Endringsbekreftelser for Batch 51

- Ingen datafiler ble endret.
- `data/places/**` ble ikke endret.
- `data/places/places_index.json` ble ikke endret.
- Ingen bilder/assets ble lagt til, slettet, flyttet eller endret.
- `bilder/**` ble ikke endret.
- Ingen placeholder-bilder ble opprettet.
- Ingen scripts/tools ble endret.
- Ingen CSS/HTML/JS/UI-filer ble endret.
- `js/ui/place-card.js` ble bare lest og ikke endret.
- Ingen canonical-filer eller manifestfiler utenfor Batch 51-rapport/manifest ble endret.
- Emneoppryddingen ble ikke gjenåpnet.
- Legacy/secondary category warnings ble ikke rørt.
- Eksisterende asset-policy ble ikke endret.
