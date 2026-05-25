# Motorsport Østlandet import report (2026-05-25)

## Leste filer
- data/places/manifest.json
- data/badges/index.json
- data/badges/sport.json
- data/places/sport/oslo/places_sport.json
- data/places/sport/oslo/places_oslo_lekeplasser_trening.json

## Nye steder lagt til
Ny fil: `data/places/sport/ostlandet/places_motorsport_ostlandet.json`

Lagt til 10 steder:
1. rudskogen_motorsenter
2. valerbanen
3. gardermoen_raceway
4. grenland_motorsportsenter
5. varna_kartring
6. naf_gokartsenter_andebu
7. kongsberg_motorsenter
8. finnskogbanen
9. momarken_bilbane
10. lyngasbanen (historisk)

## Kandidater utelatt i denne batchen
Mange kandidater fra listen er ikke lagt inn i første batch fordi verifisering av nøyaktig lokasjon/anleggstype/år ikke ble vurdert som tilstrekkelig sikker i denne runden. Dette gjelder særlig mindre lokale baner, isbaner og enkelte flerbruksanlegg med varierende navnebruk.

## Usikre årstall eller koordinater
- `kongsberg_motorsenter`, `finnskogbanen`, `momarken_bilbane`: `year` satt til `0` (usikkert etablert år).
- Flere koordinater bør etterkontrolleres mot primærkilder i neste iterasjon for produksjonsnøyaktighet.

## Duplikatsjekk mot eksisterende sportsteder
- Kjørte duplikatsjekk på alle `id` i `data/places/sport/**/*.json`.
- Ingen duplikate `id` funnet etter innlegging av ny fil.

## Underbadge-kontroll
- Alle brukte `underbadge_ids` er validert mot badge-IDer i `data/badges/sport.json`.
- Ingen nye underbadge-IDer ble opprettet.

## Manifestoppdatering
- `data/places/manifest.json` er oppdatert med:
  - `places/sport/ostlandet/places_motorsport_ostlandet.json`
