# Address-first coordinate policy

Status: **operational compatibility-peker**  
Dokumentasjonskart: [`README.md`](./README.md)  
Canonical regler: [`coordinate-source-contract-v1.md`](./coordinate-source-contract-v1.md)  
Arbeidsflyt: [`../coordinate-finder.md`](../coordinate-finder.md)  
Sist kontrollert: **2026-07-25**

Denne siden bevarer den korte address-first-inngangen. Den eier ikke coordinate-felter, statuser, trust eller full arbeidsflyt.

## Når address-first gjelder

Bruk offisiell norsk adressekilde først når alle disse vilkårene er oppfylt:

1. stedet er aktivt og fysisk eksisterende;
2. det har en konkret norsk gateadresse;
3. adressen representerer selve History Go-objektet, ikke bare eiendommen, administrasjonen eller et nærliggende bygg;
4. markøren skal være et adressepunkt/display-marker.

Standardkommando:

```bash
mkdir -p reports/<coordinate-batch>

npm run places:coords:find:address -- --address "<full adresse>" \
  | tee reports/<coordinate-batch>/<place-id>.json
```

Verktøyet produserer en kandidat. Kandidaten kan først bli `verified` etter fysisk identitetskontroll, komplett Coordinate Source Contract og relevante validators.

## Når address-first ikke gjelder

Ikke bruk et adressepunkt automatisk for:

- parker, baner, pumptracks, skateparker og andre uteanlegg;
- kaier, brygger, strender, vannflater, gater, ruter og større områder;
- monumenter eller objekter som står et annet sted enn adressebygget;
- revne, flyttede eller historiske steder;
- steder med flere plausible adressetreff eller uklar fysisk identitet.

Bruk da offisiell objekt-/geometrikilde, dokumentert historisk kilde eller evidensløypen. Uavklart resultat skal bli `needs_review`, ikke et kompromisspunkt.

## Fast grense

- `coordType: address_point` og `coordRole: display_marker` er standard for et egnet offisielt adresserepresentasjonspunkt.
- `building_center` krever faktisk bygningsgeometri eller en kilde som dokumenterer midtpunktet.
- `manual_map_check` kan aldri alene gi `verified`.
- Nominatim/OSM-public geokoding skal ikke være standard for norske adresser når Geonorge finnes.
