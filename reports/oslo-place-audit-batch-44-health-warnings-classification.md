# Batch 44: klassifisering av gjenværende place health warnings

Dato: 2026-06-01

## Formål

Denne batchen er en read-only audit av gjenværende warnings fra `npm run health:places` etter at emneoppryddingen ble avsluttet i Batch 43. Den gjør ingen retting av data, scripts, canonical-filer eller assets.

Batch 43-rapporten dokumenterte at emnesporet var ferdig og at videre arbeid bør være et eget warnings-/datakvalitets- eller bilde-/asset-spor, ikke mer emneopprydding.

## Kommandoer kjørt

```bash
npm run health:places > /tmp/health_places_batch44.txt 2>&1
npm run places:emner:check > /tmp/places_emner_check_batch44.txt 2>&1
npm run places:index:check > /tmp/places_index_check_batch44.txt 2>&1
```

I tillegg ble outputen analysert read-only med korte Python-opptellinger fra `/tmp/health_places_batch44.txt`.

## Baseline etter Batch 43 og faktisk status i denne audit-kjøringen

Batch 43-rapporten oppga følgende sluttstatus fra opprinnelig validering:

| Kontrollpunkt | Batch 43-rapport |
| --- | ---: |
| Missing emne_ids | 0 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Errors | 0 |
| Warnings | 1109 |
| Allowlisted cross-disciplinary emne_ids | 217 |
| `places:index:check` | OK |

Denne Batch 44-kjøringen på gjeldende branch gir en avvikende baseline:

| Kontrollpunkt | Batch 44 audit-kjøring |
| --- | ---: |
| Files checked | 40 |
| Places checked | 460 |
| Hidden places | 0 |
| Stub places | 0 |
| Canonical emne files checked | 16 |
| emne_ids checked | 1035 |
| Canonical emne_ids | 1035 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Allowlisted cross-disciplinary emne_ids | 187 |
| Errors | 1 |
| Warnings | 1089 |

Avviket skyldes ikke denne rapporten. Denne batchen har ikke endret data eller verktøy. Den faktiske `health:places`-feilen i audit-kjøringen er en duplikat-id:

```text
- data/places/historie/oslo/places_historie.json #damstredet_telthusbakken: duplicate id "damstredet_telthusbakken" also seen in data/places/by/oslo/places_by.json #damstredet_telthusbakken
```

`places:emner:check` bekrefter fortsatt at emneoppryddingen er ferdig på de relevante emnepunktene, men returnerer exit code 1 fordi samme duplikat-id fanges der:

| Kontrollpunkt | Resultat |
| --- | ---: |
| Active place files | 40 |
| Canonical emne files scanned | 15 |
| Canonical emne ids loaded | 996 |
| Missing emne_ids | 0 |
| Duplicate emne_ids within same place | 0 |
| Duplicate place ids across active files | 1 |
| Duplicate canonical emne_ids across canonical files | 0 |

`places:index:check` er heller ikke OK i denne audit-kjøringen. Den feiler med `length_mismatch` og mange feltavvik mellom aktive place-filer og `data/places/places_index.json`, blant annet for `torggata`, `bispelokket`, `gronland_basarene`, `karl_johan`, `radhusplassen` og `bjorvika`.

## Bekreftelse: emneoppryddingen er ferdig

Emneoppryddingen bør ikke gjenåpnes i dette sporet:

- Missing emne_ids: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 0
- Canonical emne_ids i `health:places`: 1035 av 1035 sjekket
- `places:emner:check` rapporterer 0 missing, 0 duplicate emne_ids innen samme place og 0 duplicate canonical emne_ids

Det eneste `places:emner:check`-avviket er ikke emne-relatert, men duplikat place-id for `damstredet_telthusbakken`.

## Metode for warning-klassifisering

`tools/placeHealthReport.mjs` produserer warnings i disse relevante delene av valideringen:

- `legacy/secondary category` når place-kategorien er en kjent legacy-/sekundærkategori.
- Manglende eller ikke-eksisterende `image`.
- Manglende eller ikke-eksisterende `cardImage`.
- Ikke-eksisterende `frontImage` hvis feltet finnes.
- Ikke-eksisterende `popupImage` hvis feltet finnes.
- Tekstfelt-, årstall- og emne-warnings dersom slike finnes.

I denne kjøringen finnes det ingen warninger for tekstkvalitet, quiz-profiler, koordinater/radius, story-lenker, people-lenker, leksikon-/wonderkammer-lenker eller emne-id-prefixer. Alle 1089 warnings faller i asset-/bildefelt eller informativ legacy-kategori.

## Total warnings-count

Total warnings-count i faktisk Batch 44-kjøring: **1089**.

Batch 43 forventet omtrent 1109, men gjeldende branch gir 1089 warnings og 1 error. Det bør derfor brukes dagens faktiske baseline for neste fix-batch, ikke Batch 43-tallet alene.

## Klassifisering av warnings

| Gruppe | Antall warnings | Berørte steder | Alvorlighetsgrad | Anbefaling |
| --- | ---: | ---: | --- | --- |
| `assets_missing_or_path` | 421 | 421 | middels | Fikses i eget asset-/path-spor, prioritert etter aktive brukerflater. |
| `card_image_or_front_image` | 576 | 424 | middels | Fikses strukturelt sammen med asset-/kortbilde-strategi. |
| `informational_only` | 92 | 92 | informativ | Dokumenteres eller håndteres i separat kategori-policy-spor; ikke akutt. |
| `legacy_image_fields` | 0 | 0 | informativ | Ingen funn i health-outputen. |
| `place_text_quality` | 0 | 0 | lav | Ingen funn i health-outputen. |
| `quiz_profile_quality` | 0 | 0 | lav | Ingen funn i health-outputen. |
| `coordinate_or_radius_quality` | 0 | 0 | lav | Ingen warning-funn; merk at `places:index:check` har index-sync-avvik for lat/lon/r. |
| `stories_links` | 0 | 0 | lav | Ingen funn i health-outputen. |
| `people_links` | 0 | 0 | lav | Ingen funn i health-outputen. |
| `leksikon_or_wonderkammer_links` | 0 | 0 | lav | Ingen funn i health-outputen. |
| `index_or_manifest_related` | 0 warnings / 1 separat check-feil | n/a | kritisk | Bør tas først som egen sync-/duplikat-id-batch, fordi validering ikke er grønn. |
| `unclear_needs_manual_review` | 0 | 0 | lav | Ingen uklassifiserte warnings. |

### `assets_missing_or_path`

Antall: **421 warnings** på **421 steder**.

Undertyper:

| Warning-type | Antall |
| --- | ---: |
| `missing image` | 371 |
| `image file not found` | 50 |

Eksempel-warnings:

```text
- data/places/by/oslo/places_by.json #torggata: image file not found (bilder/places/torggata_IMG.JPG)
- data/places/by/oslo/places_by.json #bispelokket: image file not found (bilder/places/bispelokket_IMG.JPG)
- data/places/by/oslo/places_by.json #gronland_basarene: image file not found (bilder/places/gronland_basarene.JPG)
- data/places/by/oslo/places_by.json #karl_johan: image file not found (bilder/places/karl_johan.JPG)
- data/places/by/oslo/places_by.json #radhusplassen: image file not found (bilder/places/radhusplassen.JPG)
- data/places/by/oslo/places_by.json #bjorvika: image file not found (bilder/places/bjorvika.JPG)
```

Filer/stedstyper som går igjen:

| Fil | Antall warnings i gruppen |
| --- | ---: |
| `data/places/by/oslo/places_by.json` | 54 |
| `data/places/naeringsliv/oslo/places_naeringsliv.json` | 28 |
| `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` | 26 |
| `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` | 23 |
| `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` | 20 |
| `data/places/sport/oslo/places_sport.json` | 15 |
| `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` | 15 |
| `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` | 14 |

Vurdering: Dette påvirker brukeropplevelsen direkte der stedskort eller popups forventer hovedbilde. Gruppen bør fikses, men ikke i samme batch som denne rapporten. Best fix-spor er først å skille mellom reelt manglende bildeproduksjon og rene path-/filnavn-avvik.

### `card_image_or_front_image`

Antall: **576 warnings** på **424 steder**.

Undertyper:

| Warning-type | Antall |
| --- | ---: |
| `missing cardImage` | 375 |
| `frontImage file not found` | 152 |
| `cardImage file not found` | 48 |
| `popupImage file not found` | 1 |

Eksempel-warnings:

```text
- data/places/by/oslo/places_by.json #torggata: cardImage file not found (bilder/kort/places/by/torggata_CardImage.PNG)
- data/places/by/oslo/places_by.json #torggata: frontImage file not found (bilder/kort/places/by/torggata_Front.WEBP)
- data/places/by/oslo/places_by.json #bispelokket: cardImage file not found (bilder/kort/places/by/bispelokket_CardImage.PNG)
- data/places/by/oslo/places_by.json #bispelokket: frontImage file not found (bilder/kort/places/by/bispelokket_Front.WEBP)
- data/places/by/oslo/places_by.json #gronland_basarene: cardImage file not found (bilder/kort/places/gronland_basarene.PNG)
- data/places/by/oslo/places_by.json #karl_johan: cardImage file not found (bilder/kort/places/karl_johan.PNG)
```

Filer/stedstyper som går igjen:

| Fil | Antall warnings i gruppen |
| --- | ---: |
| `data/places/by/oslo/places_by.json` | 54 |
| `data/places/by/europe/portugal/lisbon/places_lisbon_by.json` | 52 |
| `data/places/historie/europe/portugal/lisbon/places_lisbon_historie.json` | 40 |
| `data/places/naeringsliv/oslo/places_naeringsliv.json` | 29 |
| `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` | 28 |
| `data/places/natur/oslo/places_oslo_natur_akerselvarute.json` | 23 |
| `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` | 22 |
| `data/places/natur/europe/portugal/lisbon/places_lisbon_natur.json` | 22 |

Vurdering: Dette er den største warning-gruppen og påvirker kort-/frontvisninger direkte. Den bør fikses, men strukturelt. En trygg fix bør først avklare om appen kan bruke eksisterende `image` som fallback, om `frontImage` skal være obligatorisk når feltet finnes, og om tomme `frontImage`-/`popupImage`-felt bør fjernes eller fylles.

### `informational_only`

Antall: **92 warnings** på **92 steder**.

Undertyper:

| Warning-type | Antall |
| --- | ---: |
| `legacy/secondary category "naeringsliv"` | 41 |
| `legacy/secondary category "litteratur"` | 31 |
| `legacy/secondary category "media"` | 11 |
| `legacy/secondary category "film_tv"` | 8 |
| `legacy/secondary category "psykologi"` | 1 |

Eksempel-warnings:

```text
- data/places/litteratur/oslo/places_litteratur.json #ibsen_quotes: legacy/secondary category "litteratur"
- data/places/litteratur/oslo/places_litteratur.json #nasjonalbiblioteket: legacy/secondary category "litteratur"
- data/places/litteratur/oslo/places_litteratur.json #camilla_collett_statue: legacy/secondary category "litteratur"
- data/places/litteratur/oslo/places_litteratur.json #henrik_wergeland_statue: legacy/secondary category "litteratur"
- data/places/litteratur/oslo/places_litteratur.json #grotta: legacy/secondary category "litteratur"
- data/places/litteratur/oslo/places_litteratur.json #nationaltheatret: legacy/secondary category "litteratur"
```

Filer/stedstyper som går igjen:

| Fil | Antall warnings i gruppen |
| --- | ---: |
| `data/places/naeringsliv/oslo/places_naeringsliv.json` | 33 |
| `data/places/litteratur/oslo/places_litteratur.json` | 20 |
| `data/places/litteratur/europe/portugal/lisbon/places_lisbon_litteratur.json` | 11 |
| `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json` | 8 |
| `data/places/media/oslo/places_oslo_media.json` | 6 |
| `data/places/film_tv/europe/portugal/lisbon/places_lisbon_film_tv.json` | 6 |
| `data/places/media/europe/portugal/lisbon/places_lisbon_media.json` | 5 |
| `data/places/popkultur/oslo/places_oslo_populaerkultur.json` | 2 |

Vurdering: Dette er lav risiko og i praksis informativt. Det er ikke et brukeropplevelsesproblem på samme måte som manglende bilder. Bør dokumenteres eller håndteres i et separat category-policy-spor, ikke blandes med asset-fiks.

## Negative funn: foreslåtte grupper uten warninger

Følgende foreslåtte grupper hadde **0 warnings** i `health:places`-outputen:

- `legacy_image_fields`
- `place_text_quality`
- `quiz_profile_quality`
- `coordinate_or_radius_quality`
- `stories_links`
- `people_links`
- `leksikon_or_wonderkammer_links`
- `unclear_needs_manual_review`

Merk: `coordinate_or_radius_quality` har 0 health-warnings, men `places:index:check` rapporterer index-sync-avvik for enkelte `lat`, `lon` og `r`-verdier. Det bør håndteres som index-sync, ikke som health-warning-klassifisering.

## Separat funn utenfor warning-count: index/manifest/sync

Selv om `index_or_manifest_related` har 0 warnings i `health:places`, er dette det viktigste valideringsfunnet i Batch 44 fordi valideringen ikke er grønn:

1. `health:places` har 1 error for duplikat-id `damstredet_telthusbakken`.
2. `places:emner:check` har exit code 1 på grunn av samme duplikat-id.
3. `places:index:check` feiler med `length_mismatch` og mange feltavvik.

Dette bør prioriteres før warnings ryddes, fordi ellers er baseline ustabil og health-scriptet returnerer ikke grønt.

## Anbefalt neste Batch 45

Anbefalt Batch 45: **stabiliser valideringsbaseline før warning-fiks**.

Foreslått scope:

- Løs duplikat place-id `damstredet_telthusbakken` mellom `data/places/by/oslo/places_by.json` og `data/places/historie/oslo/places_historie.json`.
- Sync `data/places/places_index.json` mot aktive place-filer på en kontrollert måte.
- Kjør `npm run health:places`, `npm run places:emner:check` og `npm run places:index:check` til alle tre har forventet grønn status bortsett fra kjente warnings.
- Ikke gjør ny emneopprydding.

Begrunnelse: Dette er ikke den største warning-gruppen, men det er den viktigste rotårsaken for en stabil pipeline. Når error og index-sync er fikset, kan asset-warningene telles og prioriteres uten baseline-støy.

## Topp 3–5 anbefalte fix-spor etter baseline-stabilisering

1. **Index-/duplicate-id-spor**
   - Kritisk fordi dagens validering feiler.
   - Liten, avgrenset risiko hvis det gjøres separat.
   - Bør komme før asset-arbeid.

2. **Asset path-verifisering for eksisterende bildefelt**
   - Start med `image file not found` og `cardImage file not found`, totalt 98 warnings.
   - Dette kan ofte løses uten ny bildeproduksjon dersom filene finnes med annen sti, mappe, case eller filendelse.
   - Høy brukeropplevelsesverdi og lavere risiko enn å fylle alle manglende bildefelt.

3. **Card/front-image policy-spor**
   - Avklar om `cardImage` alltid skal finnes, om `frontImage` er valgfritt, og om tomme eller foreldede felter bør fjernes.
   - Treffer 576 warnings, den største gruppen.
   - Bør gjøres strukturelt, ikke som 576 enkelttilfeller.

4. **Manglende hovedbilder etter prioriterte stedstyper**
   - Treffer 371 `missing image` warnings.
   - Bør prioriteres etter aktive brukerflater og høyt trafikkerte kategorier, for eksempel Oslo/by før mindre synlige datasett.
   - Kan kreve bildeproduksjon eller kuratering og bør derfor ikke blandes med path-fiks.

5. **Legacy-/secondary category policy**
   - Treffer 92 informasjonswarnings.
   - Lavere prioritet fordi dette ikke ser ut til å bryte UI direkte.
   - Bør enten dokumenteres som akseptert legacy-status eller ryddes i et eget kategori-policy-spor.

## Scope-bekreftelser

Denne Batch 44-auditen gjorde kun én tillatt endring: denne rapportfilen.

Bekreftelser:

- Ingen filer under `data/places/**` ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen canonical-filer ble endret.
- Ingen scripts/tools ble endret.
- `tools/placeHealthReport.mjs` ble kun lest og ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Manifest ble ikke endret.
- UI, CSS, HTML og JS ble ikke endret.
- Bilder/assets ble ikke endret.
- Stories, people og leksikon ble ikke endret.
- Det ble ikke gjort ny emneopprydding.
- Wrong-prefix-sporet ble ikke gjenåpnet.

## Valideringsstatus

| Kommando | Exit code | Status |
| --- | ---: | --- |
| `npm run health:places` | 1 | Feiler på 1 duplikat-id error; warnings: 1089; unknown/wrong-prefix: 0. |
| `npm run places:emner:check` | 1 | Emnepunktene er grønne, men kommandoen feiler på 1 duplikat place-id. |
| `npm run places:index:check` | 1 | Feiler på index-sync-avvik, inkludert `length_mismatch` og feltavvik. |

Dette er en read-only audit. Avvikene over er dokumentert som input til neste batch og er ikke forsøkt rettet her.
