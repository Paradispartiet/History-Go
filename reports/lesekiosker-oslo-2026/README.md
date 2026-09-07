# Oslo Lesekiosker — objektkoordinater 2026-09-07

## Status

Denne mappen dokumenterer utvalg, intake og den senere koordinatrettingen for 21 aktive Lesekiosk-mikrosteder i Oslo.

Den opprinnelige kartleggingen 25. august brukte koordinatene i Lesekiosks «åpne i kart»-lenker. De viste seg å være område-, adresse- eller nabostedsankre og var derfor publisert med `geocodeAccuracy: approximate` og `coordStatus: needs_manual_visual_qa`.

7. september ble alle 21 kontrollert mot selve telefonkioskobjektet. 17 har egne OSM-fotavtrykk eller -punkter, og to har navngitte Google Maps-stedsposter for telefonkiosken. Sagene-paret har to separate OSM-punkter, men mangler fortsatt sikker dokumentasjon på hvilket punkt som er nummer 70 og 71; de står derfor ærlig som `needs_manual_visual_qa`.

Maskinlesbar fasit er `lesekiosker-oslo-litteratur-inventory.json`. Før/etter-avstander og kildeobjekter ligger i `object-coordinate-corrections.json`.

## Inklusjonsregel

Kildelisten for denne kartleggingen er:

- `https://lesekiosk.no/finn-en-kiosk/`
- de individuelle Lesekiosk-sidene og deres «åpne i kart»-lenker der de lot seg entydig knytte til riktig kiosk.

Bare Oslo-kiosker som står i den **nåværende Lesekiosk-listen** er med. Eldre oversikter over fredede telefonkiosker brukes som historisk kontroll, men får ikke overstyre dagens Lesekiosk-status.

## Korrigerte objektpunkter

| Nr. | Kandidat | Korrigert koordinat | Flyttet | Kildeobjekt | Status |
| ---: | --- | --- | ---: | --- | --- |
| 11 | Gamle Telemuseet | 59.9659814, 10.7830648 | 19 m | `osm-way:1192611826` | `verified_geometry` |
| 22 | Vigelandsparken | 59.9254315, 10.704871 | 131 m | `osm-way:669155295` | `verified_geometry` |
| 79 | Inkognitogata | 59.9153107, 10.7208611 | 337 m | `osm-way:668983403` | `verified_geometry` |
| 42 | Munkedamsveien | 59.9118415, 10.7189098 | 466 m | `osm-way:669303908` | `verified_geometry` |
| 10 | Bjerke | 59.9426535, 10.8134408 | 38 m | `osm-way:669605657` | `verified_geometry` |
| 76 | Hjemmets kolonihager | 59.9411041, 10.7548409 | 26 m | `osm-node:12790115997` | `verified` |
| 13 | Fagerborg/Majorstua | 59.9316901, 10.7254466 | 30 m | `osm-way:669586276` | `verified_geometry` |
| 74 | Huk | 59.9044564, 10.6862806 | 78 m | `osm-way:605176436` | `verified_geometry` |
| 56 | John Colletts plass | 59.9407512, 10.7294955 | 45 m | `osm-node:12092702423` | `verified` |
| 51 | Kampen | 59.9131116, 10.7827777 | 33 m | `osm-node:12090528535` | `verified` |
| 9 | Rådhuskaia | 59.9093294, 10.7346325 | 21 m | `osm-way:669390501` | `verified_geometry` |
| 70 | Sagene kirke | 59.9380765, 10.7525542 | 43 m | `osm-node:10069592234` | `needs_manual_visual_qa` |
| 71 | Sagene kirke | 59.9380673, 10.7525367 | 43 m | `osm-node:10069592235` | `needs_manual_visual_qa` |
| 0 | Sentralen | 59.9109386, 10.7402001 | 22 m | `osm-way:886781211` | `verified_geometry` |
| 23 | Skøyen stasjon | 59.9222519, 10.6779623 | 577 m | `osm-way:669605654` | `verified_geometry` |
| 1 | Solli plass | 59.9148491, 10.7182501 | 24 m | `osm-way:668983401` | `verified_geometry` |
| 50 | Bislett stadion | 59.9257368, 10.7311442 | 147 m | `osm-way:669586271` | `verified_geometry` |
| 78 | Olav Kyrres plass | 59.9191394, 10.6955202 | 56 m | `google-maps-feature:0x46416d2048c589db:0xc12a02f1196a8566` | `verified` |
| 80 | Majorstukrysset | 59.9292094, 10.7157735 | 29 m | `osm-way:669586275` | `verified_geometry` |
| 8 | Rådhusgata 28 | 59.9114168, 10.7361632 | 307 m | `google-maps-feature:0x46416f021b2e8929:0xde1ce8221951be50` | `verified` |
| 48 | Vålerenga kirke | 59.9072601, 10.785392 | 23 m | `osm-way:669605658` | `verified_geometry` |

## Bevarte avvik og åpen QA

- **Sagene 70 og 71:** OSM dokumenterer to separate fysiske bokkioskpunkter. Nummer-til-punkt-koblingen er ikke dokumentert, så de to markørene ligger nå på paret, men beholder `needs_manual_visual_qa` frem til feltkontroll.
- **Sagene 70:** den individuelle siden er nå løst til `https://lesekiosk.no/lesekiosk/lesekiosk-i-theresesgate-louisesgate/`; sidens innhold og kartlenke gjelder Sagene-paret til tross for den misvisende URL-sluggen.
- **Skøyen:** Lesekiosks kartlenke bruker `Drammensveien 127`, mens kioskobjektet og eldre vernekilder ligger ved `Drammensveien 157`. Markøren bruker nå OSM-fotavtrykket til selve kiosken.
- **Bjerke:** dagens Lesekiosk-kilde bruker `Refstadsvingen 1`; eldre vernekilder har brukt `Refstadsvingen 2`. Samme regel gjelder.
- **Vålerenga:** kartlenkens adresseanker er erstattet med OSM-fotavtrykket til den fysiske Lesekiosken ved Danmarksgata/Opplandsgata.
- **Norsk Folkemuseum og Dyvekes bro:** finnes i eldre telefonkiosk-/Lesekiosk-materiale, men er ikke med i den nåværende Oslo-listen som brukes som fasit her. De aktiveres derfor ikke som nåværende bokkiosker på grunnlag av gammel dokumentasjon.

## Identitet og duplikater

En Lesekiosk er et **eget fysisk objekt**, selv når den står ved et allerede eksisterende History GO-sted som Bislett stadion, Vigelandsparken, Sagene kirke, Sentralen eller Vålerenga kirke. Nærhet er derfor ikke i seg selv en duplikatkonflikt.

Canonical identitet skal ved aktivering formuleres omtrent som: «Denne oppføringen representerer den røde, vernede telefonkiosken på [sted] i dens nåværende funksjon som Lesekiosk, ikke området, kirken, stadionet eller institusjonen ved siden av.»

## Koordinatkjede

Objektkoordinatene ligger i inventory-filen og materialiseres av `tools/materialize-oslo-micro-places.mjs`. Den idempotente rettingen `tools/correct-lesekiosk-object-coordinates.mjs` oppdaterer canonical place-filer, production claims, evidensfiler og denne rapportens maskinlesbare før/etter-ledger. `data/places/places_index.json` bygges deretter fra canonical source.

Mål-kategorien er fortsatt bindende: **`litteratur` for alle 21.**
