# Voldsløkka pumptrack – Subkultur-vurdering

Dato: 2026-07-22

## Konklusjon

`voldslokka_pumptrack` opprettes som canonical `sport`-place med `secondaryBadgeIds: ["subkultur"]`.

Begrunnelsen er todelt:

- fysisk er stedet et pumptrack-/idrettsanlegg og skal derfor ikke feilklassifiseres som ren Subkultur
- sosialt er det dokumentert som en frivillig drevet, lavterskel møteplass for barn og unge på tvers av BMX/sykkel, skateboard, sparkesykkel og rulleskøyter, med tydelig egenorganisert hjul- og gatekultur

## Duplikatkontroll

Global place-index og manifest ble kontrollert før implementering. Ingen canonical Voldsløkka pumptrack fantes. `oslo_skatehall` finnes allerede som et separat fysisk Subkultur-place og beholdes uendret.

## Koordinat

Sagene IFs dokumenterte besøks- og veibeskrivelsesadresse Stavangergata 32 er kjørt address-first mot Geonorge. Ett eksakt treff brukes som `address_point` / `display_marker` med `locatorType: current_place`, i tråd med Coordinate Source Contract v1.

## Endelig QA

Sluttsettet er bygget på fersk `main`, registrert eksplisitt i `data/places/manifest.json` og inkludert i regenerert `places_index.json`. Det passerer split-manifest-sync, global place-index-kontroll, canonical emne-kontroll og strict-new koordinat-intake. `health:places` er lagret som ikke-blokkerende repo-rapport fordi den inneholder kjent global backlog utenfor denne recorden.