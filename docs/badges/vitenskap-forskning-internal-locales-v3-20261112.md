# Forskning og metode – språkmerker v3 (EN, ES, PT)

Dato: 12. november 2026. Viderefører #7273.

## Utført
Tre nye individuelle **1024 × 1024 WebP-kandidater**, aldri automatisk aktive:

- Engelsk: `bilder/merker/vitenskap/kandidater/revisjoner/en/forskning_og_metode-v3.webp`
- Spansk: `bilder/merker/vitenskap/kandidater/revisjoner/es/forskning_og_metode-v3.webp`
- Portugisisk: `bilder/merker/vitenskap/kandidater/revisjoner/pt/forskning_og_metode-v3.webp`

Alle bruker de eksisterende språkspesifikke v2-merkene som kilde. Midtmotiv, person, mikroskop, instrumenter, fjellmotiv, hovedkant og alfakanal er bevart. Bare ti avgrensede små tekstetiketter inne i motivet er erstattet: hypotese, test, resultat, konklusjon, metode, utvalg, prosedyre, måling, analyse og prøveidentifikasjon.

Manifestet `data/badges/vitenskap_forskning_internal_locales_v3_20261112.json` viser nøyaktig original og ny bane, oversettelser, tekstfelt, SHA-256 og Git-blob-SHA per fil. `tests/vitenskap-forskning-internal-locales-v3.test.mjs` tester binærintegritet, nøyaktige oversettelser og uendrede 16 aktive Vitenskap-undermerker.

## Visuell QA (faktiske WebP-filer)

Alle tre ble åpnet og kontrollert som rasterbilder. Ti etikettfelt er nå på korrekt språk. Tolinjet prøveetikett er synlig som SAMPLE, MUESTRA og AMOSTRA med `A-037`. Den geometriske oppbyggingen og hovedmotivet er beholdt. Noen av de minste etikettene er fortsatt svært små i mobilskalering.

**IKKE GODKJENT FOR AKTIVERING.** Ytterbåndets oversatte tekst er fremdeles noe flatere enn de fem norske originalenes detaljerte broderirelieff, og dette er ikke løst ved intern etikettoversettelse. En visuell sluttgodkjenning av hver bildefil og arkivering av tidligere aktive originaler må skje før endring av `data/badges/vitenskap.json`. Kart-prikk viser fortsatt hovedmerke; PlaceCard viser aktivt undermerke (fallback hovedmerke).

## Sikkerhetsramme

Ingen gjeldende `bilder/merker/vitenskap/brodert/*.webp` er endret. Ingen eksisterende v2-kandidat eller #7273-fil er overskrevet. De nye revisjonene kan fjernes eller erstattes uavhengig av aktive visninger.
