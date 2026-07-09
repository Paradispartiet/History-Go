# Coordinate Source Contract v1 implementation

Generert: 2026-07-09

## Kanonisk system

History Go bruker nå Coordinate Source Contract v1 som kanonisk koordinatkontrakt. Den maskinlesbare definisjonen ligger i `tools/coordinate-source-contract.mts`, mens den menneskelige kontrakten ligger i `docs/coordinates/coordinate-source-contract-v1.md`.

## Legacy-felt

`lat`, `lon`, `r`, `coordType`, `coordStatus`, `coordSource`, `coordNote` og `coordVerifiedAt` er legacy-kompatible felt. De kan fortsatt rendres og migreres, men de beviser ikke lenger `verified` alene.

## Hvorfor `manual_map_check` ikke er nok

`manual_map_check` beskriver bare at noen har sett på et kart. Det dokumenterer ikke adresse, kartobjekt, place-id, OSM-id, geocode accuracy eller historisk kildeobjekt. Derfor behandles det nå som QA-lag (`manualQa`) og aldri som primær `sourceProvider`.

## Migrering av gamle steder

Gamle steder skal enten oppgraderes med `locatorType`, `sourceProvider`, `sourceObjectId` eller strukturert `address`, `geocodeAccuracy` og `coordRole`, eller degraderes til `needs_source`, `needs_manual_visual_qa`, `legacy_unverified` eller `historical_approximation`.

## Verified uten source

Et sted med `coordStatus: "verified"` uten komplett v1-kontrakt får ikke canonical trust `verified`. Browser-logikken i `js/map.js` speiler contract v1 og viser slike punkter som review/unknown, ikke verified.

## Nye PR-er

`tools/place-coordinate-intake-gate.mts` importerer `validateCoordinateSource(place)`. I `--strict-new` blir nye eller endrede `verified`-steder blokkert hvis de mangler v1-kontrakt, bruker `manual_map_check` som eneste kilde, bruker `legacy_unknown`, eller er lineære uten geometry/anchors/line-/area-anchor.

## De fem havnepunktene

`havnelageret`, `oslo_mek`, `salt`, `tollbukaia` og `akershus_kaier` ble ikke flyttet. Siden de sto som verified uten full v1-kontrakt og bruker rapporterte at de fortsatt var feil etter batch 02, ble de satt til `coordStatus: "needs_source"` og `coordSource: "legacy_manual_map_check"`. `oslo_mek` må migreres med historisk kilde og ikke blandes med dagens Oslo Mek-navnebruk.

## Systemer som må oppgraderes eller kasseres

Legacy-auditen i `tools/audit-legacy-coordinate-system.mts` finner verified uten v1-felt, manual-map-only, `legacy_unknown`, lineære/kai/gate/park-punkter uten geometry/anchors, historiske steder uten historisk source og lavpresisjonskoordinater. Rapporten skrives til `reports/legacy-coordinate-system-audit.md` og er foreløpig rapportmodus, ikke en blokkering i `tools:check`.
