# Torggata – gjenåpnet fase 7H Mer audit V1

- Dato: 2026-08-14
- Place ID: `torggata`
- Canonical hovedartikkel: `data/leksikon/places/oslo/by/leksikon_oslo_by_torggata.json`
- Canonical språkeier: `data/leksikon/sprak/places/europe/norway/oslo/torggata.json`
- Språkmanifest: `data/leksikon/sprak/manifest.json`
- Runtime: `js/ui/place-popup-tabs.js`
- Status: **KLAR FOR REVIEW**

## Problem og mål

Manuell kvalitetsgjennomgang gjenåpnet Torggata fordi Mer-fanen var tom. Tidligere N/A bygget bare på at Torggata manglet en eksisterende Språkleksikon-post. Det var ikke et redaksjonelt bevis på at gaten manglet egnet innhold.

Målet er et smalt, kildebelagt tillegg som lar brukeren lese navnespor og observere dagens gateutforming. Mer skal ikke være en restkategori, gjenta Om/Histories tidslinje eller fylles med et tilfeldig objekt.

## Canonical eier og runtime

`renderMore(main, buckets.objects, language)` viser:

1. `main.interpretation.what_to_notice`;
2. `main.interpretation.why_it_matters`;
3. `main.interpretation.counterpoints`;
4. entries fra Språkleksikon-filen som `data/leksikon/sprak/manifest.json` peker til for aktiv place-ID.

Fase 7H bruker disse eksisterende eierne. Ingen ny runtimegren eller kunstig Objects-artikkel er opprettet.

## Publisert observasjonslag

### Legg merke til

- Det nordlige fortauet mellom Youngstorget og Ring 1 er to meter bredere og rommer møbleringsfelt og vareleveringslommer.
- Den samme strekningen har en rekke tempeltrær (Ginkgo biloba), benker og sykkelstativer.

### Hvorfor det betyr noe

- Fire meter kjørebane, innsnevrede kryss og brede fortau gjør prioriteringen av gående og syklende fysisk lesbar.
- Gaten er samtidig forbindelsesåre mellom sentrum og Grünerløkka, ikke bare et oppholdsrom.

### Motpunkt

- «Gågate» beskriver ikke hele Torggata likt: vestre del er ren gågate, mens østre del omtales som gang- og sykkelprioritert.

Kilder:

- NLA – Torggata: https://landskapsarkitektur.no/prosjekter/torggata
- Torggata Gateforening – Om Torggata: https://www.torggata.oslo.no/om-torggata/

Begge sidene ble åpnet og kontrollert 2026-08-14. NLA dokumenterer asymmetrisk profil, bredder, vegetasjon og prioritering. Gateforeningen dokumenterer skillet mellom vestre og østre del samt forbindelsen mellom sentrum og Grünerløkka.

## Publisert Språkleksikon

| ID | Term | Funksjon | Kilder |
| --- | --- | --- | --- |
| `torggata_ovre_torvegade` | Øvre Torvegade | Første navn på 1846-strekningen Stortorvet–Youngstorget | Oslo byleksikon; Lokalhistoriewiki |
| `torggata_torvegaden_1852` | Torvegaden | Vedtatt navneform fra 1852 | Oslo byleksikon; Lokalhistoriewiki |
| `torggata_gang_og_sykkelprioritert_gate` | gang- og sykkelprioritert gate | Forklarer dagens skille fra ren gågate | Torggata Gateforening; NLA |

Kilder:

- Oslo byleksikon – Torggata: https://oslobyleksikon.no/index.php/Torggata
- Lokalhistoriewiki – Torggata (Oslo): https://lokalhistoriewiki.no/wiki/Torggata_(Oslo)

Teksten hevder ikke en udokumentert dato for overgangen til dagens skrivemåte «Torggata».

## Placegrense og own-place-kontroll

Canonical place-register/manifester skal kontrolleres før innhold velges i **alle** faner og rundinger, ikke bare Før/etter. Et bygg, en virksomhet, en park, en plass eller et annet delsted med egen place-oppføring kan lenkes som relasjon eller brukes som tydelig avgrenset supplement, men kan ikke brukes i stedet for parent-place.

Fase 7H handler derfor om selve gateløpets navn og utforming. Torggata Bad, Rockefeller, Youngstorget og andre egne/avgrensede steder brukes ikke som Mer-erstatning. Den generelle regelen er lagt både i produksjonschecklisten og popupkontrakten.

## Redaksjonell avgrensning

- Ingen ny Objects-post brukes for å fylle Mer.
- Språksporene er tre ulike begreper, ikke tre omskrivninger av samme faktasetning.
- Observasjonene er synlige i gaterommet og kildebelagt.
- Språk- og observasjonslaget er smalere enn Om og mer brukerrettet enn en kildeliste.
- Eksterne tekster kopieres ikke; bare egne korte forklaringer og lenker lagres.

## QA-grense

Automatiske tester kan låse manifest, place-ID, entry-ID-er, HTTPS-kilder, runtimefelter, backlog og dokumentasjonsregelen. De beviser ikke alene at Mer-fanen er visuelt god. Ny manuell UI- og innholds-QA inngår fortsatt i sluttporten.

## Beslutning

**Mer-blokkeren er løst av gjenåpnet fase 7H** når data, dokumentasjon, backlog, workcard og tester er merget med grønn CI.

Neste og eneste gjenstående redaksjonelle innholdsblokker: **rundingskoherens – fjern den kunstige Objects/Structures-splittingen uten å bryte 4+1-kontrakten**.
