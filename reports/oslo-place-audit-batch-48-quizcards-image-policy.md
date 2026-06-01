# Oslo place audit batch 48: QuizCards image policy

## Scope and method

This is a read-only policy/data clarification batch. The only repository change in this PR is this report file.

The batch inspected the Batch 46/47 audit reports, the active place-card UI image logic, active place JSON usage, and repository references to `bilder/QuizCards/**`. It did **not** change place data, `places_index.json`, image assets, UI/runtime code, scripts, manifests, package files, canonical emne files, or any warning-producing image paths.

Commands used for inspection:

```bash
rg -n "bilder/QuizCards|QuizCards" . --glob '!node_modules'
rg -n "bilder/QuizCards|QuizCards" data/places data/places/places_index.json --glob '*.json'
rg -n "cardImage|frontImage|image|quizCard|setPlaceCardQuizImage|pcMainImage|src" js/ui/place-card.js
python - <<'PY'
import json
from pathlib import Path
from collections import Counter
fields=['image','cardImage','frontImage','popupImage','quizCardImage','quizCard','quiz_card_image']
counts=Counter(); refs=[]
for p in Path('data/places').rglob('*.json'):
    if p.name=='places_index.json':
        continue
    try:
        data=json.loads(p.read_text())
    except Exception:
        continue
    items=data if isinstance(data,list) else data.get('places',[]) if isinstance(data,dict) else []
    for obj in items:
        if not isinstance(obj,dict): continue
        for f in fields:
            v=obj.get(f)
            if isinstance(v,str) and v:
                if v.startswith('bilder/QuizCards/'):
                    counts['quiz'] += 1; refs.append((str(p),obj.get('id'),f,v))
                elif v.startswith('bilder/places/'):
                    counts['places'] += 1
                elif v.startswith('bilder/kort/places/'):
                    counts['kort_places'] += 1
                elif v.startswith('bilder/'):
                    counts['other_bilder'] += 1
print(counts)
print('quiz refs', refs)
PY
find bilder -path '*QuizCards*' -maxdepth 3 -type f | sort
```

## Current observed usage of `bilder/QuizCards/**`

Repository-wide search found `bilder/QuizCards/**` in these active/non-report locations:

| Location | Usage |
| --- | --- |
| `js/ui/place-card.js` | Hard-coded quiz-card lookup table for selected place ids. |
| `bilder/QuizCards/` | Seven existing PNG files plus an empty `QuizCards.md` placeholder. |

The current QuizCards files are:

- `bilder/QuizCards/Akerbrygge.PNG`
- `bilder/QuizCards/Barcode.PNG`
- `bilder/QuizCards/Bispelokket.PNG`
- `bilder/QuizCards/Bjørvika.PNG`
- `bilder/QuizCards/Bogstadveien.PNG`
- `bilder/QuizCards/DamstredetTelthusbakken.PNG`
- `bilder/QuizCards/Grønland basarene.PNG`
- `bilder/QuizCards/QuizCards.md` (empty placeholder file)

Batch 46 identified `bilder/QuizCards/Bogstadveien.PNG` and `bilder/QuizCards/Barcode.PNG` as basename candidates for missing/mismatched `bogstadveien` and `barcode` place-image fields. Batch 47 deliberately did not apply those candidates because the observed repo usage showed `QuizCards` as UI fallback/card support, not as an established canonical place-data source.

## Current place JSON references to `bilder/QuizCards/**`

There are currently **no** active place JSON references to `bilder/QuizCards/**`.

The direct active-data search returned no matches:

```bash
rg -n "bilder/QuizCards|QuizCards" data/places data/places/places_index.json --glob '*.json'
# no matches
```

A field-level scan of active place source files also found zero references in image-bearing place fields:

| Prefix in active place image fields | Count |
| --- | ---: |
| `bilder/places/**` | 123 |
| `bilder/kort/places/**` | 102 |
| `bilder/QuizCards/**` | 0 |

This supports the current convention that place JSON image fields point to canonical place assets under `bilder/places/**` and card-formatted place assets under `bilder/kort/places/**`, not to `bilder/QuizCards/**`.

## Relevant UI fallback behavior

`js/ui/place-card.js` separates ordinary place images from quiz-card images:

- `PLACE_CARD_QUIZ_CARD_BY_ID` maps selected place ids directly to `bilder/QuizCards/**` files.
- `resolveQuizCardImage(place)` first accepts explicit quiz-card-only fields (`quizCardImage`, `quizCard`, `quiz_card_image`) if present, then falls back to the hard-coded id/name/title lookup.
- `setPlaceCardQuizImage(card, quizImgEl, place)` writes the resolved quiz-card image to the separate quiz-card image element and toggles `has-quiz-card` / flip behavior.
- The normal front image element still uses `place.frontImage || place.cardImage || place.image || ""`.

The important distinction is that `bilder/QuizCards/**` is currently wired as the **back/quiz-card face** for PlaceCard flip behavior, while the normal place image pipeline uses `frontImage`, `cardImage`, and `image` separately. Reusing `bilder/QuizCards/**` directly in `image` or `cardImage` would make generated quiz/card assets double as canonical place images.

## Policy decision

Recommendation: **keep `bilder/QuizCards/**` out of place JSON `image` and `cardImage` fields**.

Place JSON should continue to use canonical assets under:

- `bilder/places/**` for ordinary/source place images such as `image`, `frontImage`, and `popupImage` when applicable.
- `bilder/kort/places/**` for dedicated place card images such as `cardImage`.

Rationale:

1. No active place JSON currently uses `bilder/QuizCards/**`; introducing it would create a new data convention rather than fixing an existing convention.
2. UI code already treats `bilder/QuizCards/**` as quiz-card/flip support, not as the ordinary front image pipeline.
3. The existing active place-image field population is concentrated under `bilder/places/**` and `bilder/kort/places/**`.
4. Allowing `QuizCards` in `image`/`cardImage` would blur the distinction between canonical place photos/card images and generated quiz/card assets.
5. The Batch 47 rejected candidates are therefore policy-risk candidates, not low-risk path fixes.

If future work wants data-driven quiz-card overrides, use explicit quiz-card-only fields (`quizCardImage`, `quizCard`, or `quiz_card_image`) and keep that separate from `image` / `cardImage`. This report does not recommend adding those fields in Batch 49; it only notes that the UI already reserves a separate path for quiz-card-specific assets.

## Consequences for Batch 47 rejected candidates

| Candidate | Current field value | Existing candidate | Batch 48 policy consequence |
| --- | --- | --- | --- |
| `torggata.cardImage` | `bilder/kort/places/by/torggata_CardImage.PNG` | `bilder/places/by/torggata_Front.WEBP`; `bilder/places/by/torggata_IMG.JPG` | Do not reuse `image`/`frontImage` assets as a semantic fallback in this policy batch. Next implementation should either add/select a dedicated canonical `bilder/kort/places/**` card asset or document a separate safe reuse decision. |
| `bogstadveien.cardImage` | `bilder/kort/places/bogstadveien.PNG` | `bilder/QuizCards/Bogstadveien.PNG` | Do not point `cardImage` at `bilder/QuizCards/Bogstadveien.PNG`. Resolve by adding/selecting a canonical `bilder/kort/places/**` card asset, or by correcting the path only if such an asset already exists. |
| `barcode.image` | `bilder/places/barcode.PNG` | `bilder/QuizCards/Barcode.PNG` | Do not point `image` at `bilder/QuizCards/Barcode.PNG`. Resolve by adding/selecting a canonical ordinary place asset under `bilder/places/**`. |
| `barcode.cardImage` | `bilder/kort/places/barcode.PNG` | `bilder/QuizCards/Barcode.PNG` | Do not point `cardImage` at `bilder/QuizCards/Barcode.PNG`. Resolve by adding/selecting a canonical card asset under `bilder/kort/places/**`. |

## Recommended Batch 49 implementation plan

Recommended Batch 49: implement a narrow canonical-asset fix batch that keeps `bilder/QuizCards/**` out of `image` and `cardImage` fields.

Suggested plan:

1. Re-run `npm run health:places` and capture the current warning baseline before editing.
2. Limit edits to the smallest safe subset of place image warnings whose target assets already exist under `bilder/places/**` or `bilder/kort/places/**`.
3. For the four Batch 47 rejected candidates:
   - Leave `bogstadveien.cardImage`, `barcode.image`, and `barcode.cardImage` unresolved unless canonical replacement assets exist or are deliberately added in-scope for that future batch.
   - Treat `torggata.cardImage` separately from the QuizCards question; it needs either a real `bilder/kort/places/**` card asset or an explicit, documented decision to reuse an existing canonical place asset as `cardImage`.
4. If Batch 49 is allowed to add image files, add or generate canonical assets in `bilder/places/**` and/or `bilder/kort/places/**`; otherwise, only update JSON paths where canonical assets already exist.
5. Rebuild/check `data/places/places_index.json` only if place source JSON changes require index synchronization.
6. Confirm that no `bilder/QuizCards/**` path is introduced into active place JSON.

## Non-changes in this batch

- No image-warning fixes were implemented.
- No `data/places/**` files were changed.
- No `data/places/places_index.json` changes were made.
- No files under `bilder/**` were created, deleted, moved, renamed, or edited.
- No JS/UI/CSS/HTML/runtime, scripts/tools, manifest, package, canonical emne, People, Stories, Leksikon, Wonderkammer, Civication, or TypeScript migration files were changed.
- Warning counts are expected to remain unchanged except for upstream/main changes outside this PR.
