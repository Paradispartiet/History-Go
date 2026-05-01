# Place coordinate refinement – batch 1

## Formål
Denne runden starter finjustering av `needs_review`-stedene etter at de harde koordinatfeilene ble løst i PR #125.

Denne batchen gjør bare sikre kildedata-endringer. Brede steder som gater, elver, parker og ruter er ikke endret uten konkret verifisering av hvilket punkt som skal representere stedet.

## Endrede filer
- `data/places/places_politikk.json`
- `data/places/places_musikk.json`

## Rettede steder

| id | navn | fil | gammel lat/lon/r | ny lat/lon/r | coordType | status |
|---|---|---|---|---|---|---|
| `tinghuset` | Oslo tinghus | `data/places/places_politikk.json` | `59.9167, 10.741, 140` | `59.915634, 10.741291, 100` | `building_center` | verified |
| `det_norske_teatret` | Det Norske Teatret | `data/places/places_musikk.json` | `59.913, 10.7418, 140` | `59.915, 10.738611, 100` | `building_center` | verified |

## Metadata lagt til
For rettede byggpunkter er følgende metadata lagt til:

```json
"coordType": "building_center",
"coordStatus": "verified",
"coordSource": "manual_map_check" / "wikidata_manual_check",
"coordPrecisionM": 20-25,
"coordVerifiedAt": "2026-04-30"
```

## Bevisst ikke endret i denne batchen
Følgende typer `needs_review`-steder er ikke endret i denne runden:

- lange gater som `karl_johan`, `bogstadveien`, `markveien`
- transportlinjer som `trikk_17_18`
- store veistrukturer som `ring_3`
- elver/ruter som `akerselva`, `alnaelva`, `ljanselva`
- store parker/naturområder der radius og representasjonspunkt må vurderes samlet

Disse krever en egen semantisk gjennomgang: punktet må velges ut fra om appen skal låse opp ved inngang, midtpunkt, hovedscene, utsiktspunkt, ruteetappe eller områdeanker.

## Videre anbefalt rekkefølge
1. Fortsett med små, entydige bygg/steder som fortsatt bare er flagget for `low_precision_coord`.
2. Deretter ta parker/torg hvor ett tydelig midtpunkt kan bestemmes.
3. Til slutt ta ruter, elver, gater og store områder. Disse bør ikke bare få mer presise tall; de bør få bevisst `coordType` og vurdert radius.
