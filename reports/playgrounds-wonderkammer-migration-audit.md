# Audit: lekeplasser som Wonderkammer-innhold

## Modellregel

Lekeplasser skal være Wonderkammer-innhold under et faktisk parent-place, ikke egne `place`-poster. Parker, plasser, idrettsanlegg, baner, haller, stadioner og større aktivitetsområder kan fortsatt være `places`.

Denne rapporten er kun audit og migreringsplan. Den sletter ikke places, flytter ikke Wonderkammer-data, endrer ikke manifest og endrer ikke UI/kartkode.

## Scope

- Primær place-fil: `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- Eksplisitt sjekkede Wonderkammer-filer:
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds.json`
  - `data/wonderkammer/playgrounds_expansion.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
  - `data/wonderkammer/index.json`
- I tillegg er alle `data/wonderkammer/**/*.json` skannet etter eksakte forekomster av dagens place-id-er.

## Oppsummering

- Auditerte poster: **15**
- Anbefalt `migrate_to_parent_wonderkammer`: **10**
- Anbefalt `keep_as_place`: **0**
- Anbefalt `needs_manual_review`: **5**

## Tabell

| Nåværende place-id | Fil | Navn | Type | Foreslått parent-place-id | Parent finnes? | Wonderkammer-filer som peker til dagens id | Anbefalt handling |
|---|---|---|---|---|---:|---|---|
| `lekeplass_sofienbergparken` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Sofienbergparken lekeplass | `lekeplass` | `sofienbergparken_subkultur` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `lekeplass_st_hanshaugen` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | St. Hanshaugen lekeplass | `lekeplass` | `st_hanshaugen_park` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `lekeplass_birkelunden` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Birkelunden lekeplass | `lekeplass` | `birkelunden` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `lekeplass_olaf_ryes_plass` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Olaf Ryes plass lekeplass | `lekeplass` | `olaf_ryes_plass` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `lekeplass_botsparken` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Botsparken lekeplass | `lekeplass` | `botsparken` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `lekeplass_stensparken` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Stensparken lekeplass | `lekeplass` | `stensparken` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `lekeplass_kirsebarlunden` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Kirsebærlunden lekeplass | `lekeplass` | `toyen_torg` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `needs_manual_review` |
| `lekeplass_snippen` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Snippen lekepark | `lekeplass` | `botanisk_hage` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `needs_manual_review` |
| `lekeplass_frognerborgen` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Frognerborgen | `lekeplass` | `frognerparken` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `lekeplass_kampen_park` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Kampen park lekeplass | `lekeplass` | `kampen_park` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `migrate_to_parent_wonderkammer` |
| `aktivitet_rudolf_nilsens_plass` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Rudolf Nilsens plass aktivitetspark | `aktivitetspark` | `toyen_torg` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects.json`<br>`data/wonderkammer/playgrounds/oslo_playground_objects_flat.json` | `needs_manual_review` |
| `treningssted_torshovdalen` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Torshovdalen trenings- og aktivitetspark | `treningssted` | `torshov` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json` | `needs_manual_review` |
| `treningssted_kampen_park` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Kampen park treningssted | `treningssted` | `kampen_park` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json` | `migrate_to_parent_wonderkammer` |
| `treningssted_sognsvann` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Sognsvann treningsrunde | `treningssted` | `sognsvann` | nei | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json` | `needs_manual_review` |
| `treningssted_skur13` | `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | Skur 13 skate- og balansetrening | `treningssted` | `skur13` | ja | `data/wonderkammer/oslo_lekeplasser_trening.json`<br>`data/wonderkammer/oslo_lekeplasser_trening_flat.json` | `migrate_to_parent_wonderkammer` |

## Vurderinger per post

### `lekeplass_sofienbergparken` — Sofienbergparken lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `sofienbergparken_subkultur`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Ren lekeplass/barnepark i park; bør flyttes til Wonderkammer under eksisterende park-place. Merk at repoet bruker sofienbergparken_subkultur som eksisterende park-nær place-id.

### `lekeplass_st_hanshaugen` — St. Hanshaugen lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `st_hanshaugen_park`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Ren lekeplass i høydepark; parent er åpenbar.

### `lekeplass_birkelunden` — Birkelunden lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `birkelunden`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Ren lekeplass i Birkelunden; parent er åpenbar.

### `lekeplass_olaf_ryes_plass` — Olaf Ryes plass lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `olaf_ryes_plass`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Ren lekeplass på Olaf Ryes plass; parent er åpenbar.

### `lekeplass_botsparken` — Botsparken lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `botsparken`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Ren lekeplass i Botsparken; parent er åpenbar.

### `lekeplass_stensparken` — Stensparken lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `stensparken`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Ren lekeplass i Stensparken; parent er åpenbar.

### `lekeplass_kirsebarlunden` — Kirsebærlunden lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `toyen_torg`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `needs_manual_review`
- **Auditnotat:** Ren lekeplass, men eksisterende Wonderkammer-objekt peker mot toyen_torg. Det bør manuelt avklares om Tøyen torg, Tøyenparken/område eller en annen faktisk parent er riktig.

### `lekeplass_snippen` — Snippen lekepark

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `botanisk_hage`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `needs_manual_review`
- **Auditnotat:** Ren lekepark ved Botanisk hage; Botanisk hage finnes som place og virker mer faktisk parent enn toyen_torg, men bør bekreftes før migrering.

### `lekeplass_frognerborgen` — Frognerborgen

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `frognerparken`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Ren lekeplass/lekeborg i Frognerparken; bør være Wonderkammer under Frognerparken.

### `lekeplass_kampen_park` — Kampen park lekeplass

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `kampen_park`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Lekeplass i Kampen park; parent er åpenbar. Kan samordnes med treningssted_kampen_park ved migrering.

### `aktivitet_rudolf_nilsens_plass` — Rudolf Nilsens plass aktivitetspark

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `toyen_torg`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects.json`
  - `data/wonderkammer/playgrounds/oslo_playground_objects_flat.json`
- **Anbefalt fremtidig handling:** `needs_manual_review`
- **Auditnotat:** Grensefall: aktivitetspark med småbarnslekeplass, multibane, treningsapparater og kunstgress/kunstis. Kan være place hvis det behandles som større selvstendig anlegg; krever manuell vurdering.

### `treningssted_torshovdalen` — Torshovdalen trenings- og aktivitetspark

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `torshov`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
- **Anbefalt fremtidig handling:** `needs_manual_review`
- **Auditnotat:** Trenings-/aktivitetsinnhold i parkdal. Torshov finnes, men faktisk parent Torshovdalen ser ikke ut til å finnes som egen parent-place i repoet; vurder separat før eventuell migrering.

### `treningssted_kampen_park` — Kampen park treningssted

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `kampen_park`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Treningsmuligheter i Kampen park; bør trolig være Wonderkammer/activity under Kampen park, ikke eget treningssted-place.

### `treningssted_sognsvann` — Sognsvann treningsrunde

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `sognsvann`
- **Parent finnes i repoet:** nei
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
- **Anbefalt fremtidig handling:** `needs_manual_review`
- **Auditnotat:** Større frilufts- og treningsområde, men foreslått parent sognsvann finnes ikke som place-id i data/places. Krever manuell vurdering/import av parent er eksplisitt utenfor denne PR-en.

### `treningssted_skur13` — Skur 13 skate- og balansetrening

- **Nåværende fil:** `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- **Foreslått parent-place-id:** `skur13`
- **Parent finnes i repoet:** ja
- **Wonderkammer-filer som peker til dagens id:**
  - `data/wonderkammer/oslo_lekeplasser_trening.json`
  - `data/wonderkammer/oslo_lekeplasser_trening_flat.json`
- **Anbefalt fremtidig handling:** `migrate_to_parent_wonderkammer`
- **Auditnotat:** Skate-/aktivitetsarena ved Skur 13. Skur 13 finnes som selvstendig place; vurder om treningsinnholdet skal ligge som Wonderkammer under skur13.

## Migreringsprinsipp for senere PR

Når migrering faktisk gjøres i en senere PR, bør Wonderkammer kobles til faktisk parent-place og ikke til de kunstige `lekeplass_*`-/`treningssted_*`-place-id-ene. `data/wonderkammer/index.json` skal først endres når datamigreringen gjennomføres, ikke i denne audit-PR-en.
