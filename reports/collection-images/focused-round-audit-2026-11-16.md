# Samlingsbilder – kontrollert pilot (16.11.2026)

**Status:** pågående. Pilot i fem Place-pakker; dette er ingen katalogdekkende audit eller ferdigmelding.

## Kontrollert utvalg

| Place | Brands fra `data/brands/brands_master.json` | Structures | Objects | Registrerte bildebane-treff |
| --- | ---: | ---: | ---: | ---: |
| `freia_fabrikken` | 1 | 2 | 0 | 3/3 |
| `schous_bryggeri` | 1 | 1 | 1 | 3/3 |
| `myrens_verksted` | 1 | 1 | 2 | 4/4 |
| `ringnes_bryggeri` | 1 | 2 | 2 | 5/5 |
| `toyen_trafo` | 0 i undersøkt master | 0 | 2 | 2/2 |
| **Totalt** | **4** | **6** | **7** | **17/17** |

Bildebaner ble sammenholdt mot katalogoppføringene i `bilder/kort/brands`, `bilder/kort/structures`, `bilder/kort/objects`, `bilder/objects` og `bilder/places` på bildearbeidsgrenen. At en bane finnes, **beviser ikke** at bildets visuelle representasjon, dimensjoner, lisens eller mobilvisning er godkjent. Brands er hentet fra brand-masterens `place_ids`, ikke fra Places' toppnivåfelt (som i utvalget mangler egne `brands`-arrayer).

## Faktiske rettelser

### Freiasalen – feil lisens rettet

`data/places/naeringsliv/oslo/places_naeringsliv/freia_fabrikken.json` oppga `Public domain` for et foto av Tore Sætre fra 2018. Filens **eksakte** Commons-side dokumenterer **CC BY-SA 4.0** med fotografering og kreditering. Metadata er rettet på denne grenen til CC BY-SA 4.0 med lisens-URL, kilde og rettighetsgrunnlag. Fotografiet er **ikke** byttet ut.

Kontrollert kilde: https://commons.wikimedia.org/wiki/File:Munchmaleriene_i_Freiasalen_%C3%85pne_hus_2018_(145748).jpg

**Aksept før publisering:** bildebruk må vise korrekt kreditering, lisens og lenke ved bildet, og videreføre eventuelle lisensvilkår for bearbeidelser. Et verks mulige fri-status kan ikke brukes som erstatning for å kontrollere den særskilte fotografretten.

### Freiaparken – illustrasjonsbegrensning tydeliggjort

`freiaparken` bruker et KI-generert Place-frontbilde, ikke en bekreftet gjengivelse av parkens geografiske form. Metadata er supplert med illustrasjonskreditering, rettighetsgrunnlag, synlig merknadsbehov og status `needs_source_bounded_replacement_image`. **Ikke** påstå at dette utgjør en stedstro Structure-illustrasjon. Bytt til et dokumentert parkbilde eller en illustrasjon laget etter faktisk verifiserte parkreferanser.

## To Tøyen-Objects – nye bildekandidater uten publisering

1. `toyen_trafo_apparatpult_1916`: original visuell kandidat registrert i `reports/collection-images/toyen-trafo-apparatpult-1916-candidate.json`.
   Arkiv: https://www.oslobilder.no/BAR/A-20138/Ua/0004/054
2. `toyen_trafo_transformatorkjerne_1918`: original visuell kandidat registrert i `reports/collection-images/toyen-trafo-transformatorkjerne-1918-candidate.json`.
   Arkiv: https://oslobilder.no/BAR/A-20138/Ua/0004/091

Begge bildene er nye, maleriske tolkninger, ikke kildefaste tekniske rekonstruksjoner. De bruker mer materiell og dybde enn de eksisterende skjematiske SVG-ene. **Antall måleinstrumenter, viklinger, farger, fasonger, rom og detaljer er ikke verifisert mot arkivfotografiene.** Bildepakken er først generert som ChatGPT-vedlegg, og de to binære WebP-kandidatene er nå **lagt inn i GitHub på PR #7348** under `bilder/kort/objects/candidates/toyen_trafo/`. Manifestene har eksakte SHA-256- og blob-hasher. Filene er **ikke** koblet til runtime, og ingen er publisert.

## Kvalitetsport før kandidat blir et ekte samlingsbilde

- Sammenhold den nye illustrasjonen med originalarkivfoto. Hvis det ligner for lite på dokumentert gjenstand, korriger eller forkast den.
- For Structures: bruk korrekt, dokumentert bygg og epoke. For Brands: kun ekte logo-/ordmerke uten KI-generert rekonstruksjon.
- **Gjennomført:** Binære bildekandidater og oppdaterte manifester ligger i GitHub-kandidatmapper med kontrollsummer. **Gjenstår:** Uavhengig visuell kildekontroll og full kontroll av `sourcePage`, lisens/rettighetsgrunnlag og representasjonsgrenser.
- Kjøre relevant bilde- og PlaceCard-kontroll på mobil og desktop, også bildeutsnitt, synlig illustrasjonsmerking og kreditering.
- Kun når alle porter består: oppdater canonical bildereferanser. Inntil da brukes fortsatt eksisterende originalbilder.

## Egenvurdering denne piloten (1–5)

| Dimensjon | Score | Evidens / begrensning |
| --- | ---: | --- |
| Korrekthet | 4 | Arkivobjekter og eksakt Freiasalen-lisens kontrollert; tolkningene ennå ikke arkiv-sammenlignet |
| Dekning | 2 | Fem steder, 17 samlingsmedlemmer av en langt større katalog |
| Redaksjonell kvalitet | 3 | Mer fysisk bildeuttrykk, men ikke ennå tilstrekkelig kildetro visuelt |
| Teknisk integritet | 2 | JSON- og filbanekontroll, ingen full app-/mobilregresjon |
| Sikkerhet/ansvarlighet | 4 | Korrekt rettighetsmerking og publiseringsstopp |
| Vedlikeholdbarhet | 4 | Egen kandidatmetadata, isolert gren, etterprøvbart utvalg |
| **Sum** | **19/30** | **Ikke ferdig / PR forblir draft** |


## Oppdatering etter binær staging

2026-11-16: De tre WebP-kandidatene, inkludert Freiaparken v2, er lagt direkte i PR-grenen som egne filer, uten å endre canonical bildefelter. Integritetskontroll på SHA-256, Git-blob-SHA, filstørrelse, WebP-dimensjoner og kandidatbaner er lagt til som `scripts/check-collection-image-candidates.py` og egen GitHub-workflow.

`data/runtime/place-open/freia_fabrikken.json` er regenerert/synkronisert mot oppdatert Structure-metadata, for å rette tidligere Place-open payload mismatch. Denne oppdateringen er ikke en visuell godkjenning.
