# Oslo kultureiendommer completeness pass — batch 1

Date: 2026-07-18

Source set: Oslo kommune / Kulturetaten cultural properties, cross-checked against current History Go repository search.

## Canonical candidates selected

### Folkeobservatoriet

- No canonical History Go record found under `Folkeobservatoriet`, `Kikkert-Olsen`, `Christian H.O. Gran Olsen`, or the address Holmenkollveien 119.
- Oslo kommune documents the former public observatory created around inventor Christian H.O. Gran Olsen's ambition to make astronomy accessible to ordinary people.
- The building later lost its telescope and now functions as an artist residence, but remains a strong physical science-history site.
- Proposed category: `vitenskap`.
- Representation guardrail: distinguish this public-observatory history from the older university `observatoriet` record already in History Go.
- Address-first coordinate: `59.9605731651147, 10.666638892994078`, Geonorge object `geonorge-adresser-v1:0301:13070:119`.

### Kjeglebanen på Langgaardsløkken

- No canonical History Go record found under `Kjeglebanen`, `Langgaardsløkken`, `Rolighed`, or Briskebyveien 21.
- Oslo kommune describes it as the only preserved bowling-alley building in Oslo and one of the country's last historic skittle alleys.
- Proposed category: `sport`, with strong history and material-culture angles.
- Representation guardrail: model the preserved purpose-built alley itself, not Langgaardsløkken as a generic estate or park place.
- Address-first coordinate: `59.92335742553447, 10.7148429989095`, Geonorge object `geonorge-adresser-v1:0301:10898:21`.

## Next candidates pre-geocoded in the same coordinate pass

- Rådmannsgården og Anatomibygget — Rådhusgata 19 — `59.91014146776003, 10.740325400685213`, Geonorge object `geonorge-adresser-v1:0301:16115:19`.
- Magistratgården — Dronningens gate 11 — `59.9092795875744, 10.745055179458067`, Geonorge object `geonorge-adresser-v1:0301:11309:11`.

These are held for the next canonical batch after duplicate and representation review.

## Coordinate method

All four candidates have concrete Norwegian street addresses. The repository's normative address-first method is used with `places:coords:find:address`, and all terminal output is saved under `reports/oslo-kultureiendommer-batch-1/coordinates/` with `tee`.
