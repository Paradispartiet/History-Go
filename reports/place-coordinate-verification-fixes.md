# Place coordinate verification fixes

Generert: 2026-05-03

## Endrede datafiler
- Ingen coordinate-verdier ble endret i denne batchen.

## Brukerrapporterte steder
- Kuba / Kuba-parken: satt til manuell QA i rapport (ikke koordinatendret).
- St. Hanshaugen park: satt til manuell QA i rapport (ikke koordinatendret).

## Skjerpede metadataregler
- coordStatus=verified uten coordSource gir varsel i quality gate.
- coordStatus=verified uten coordPrecisionM gir varsel i quality gate.
- coordStatus=verified uten coordNote for område/gate/rute gir varsel i quality gate.
- Lav koordinatpresisjon (<4 desimaler) gir varsel i quality gate.

## Nøkkeltall
- claimed_verified_no_source: 22
- må gjennom manuell kontroll (unverified + needs_manual_visual_qa): 290
