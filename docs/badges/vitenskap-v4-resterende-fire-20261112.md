# Vitenskap v4 – 16 broderikandidater for fire undermerker

Dato: 12. november 2026  
Kildepakke: #7267 → #7268 → #7273 → #7281  
Arbeids-PR: #7284

## Leverte bildefiler

For hvert av fire undermerker – **Informasjonsteknologi**, **Matematikk**, **Astronomi og fysikk** og **Kjemi og materialvitenskap** – ligger ny v4 i fire språkmapper `en`, `es`, `pt`, `fr`.

Format: **1024 × 1024 WebP, gjennomsiktig utside**. Alle 16 bygger på hver sin tidligere verifiserte v2-oversettelse, og ingen originaler er overskrevet.

Felles navnemønster:

`bilder/merker/vitenskap/kandidater/revisjoner/{locale}/{id}-v4-broderi.webp`

Samlet kontaktark:

`bilder/merker/vitenskap/kandidater/contact-sheet-v4-remaining-four.jpg`

## Produksjonsmetode

Det eksisterende skriptet `scripts/revise-vitenskap-v4-embroidery.py` brukes kun for den avgrensede `thread_relief`-bearbeidingen. Eksportskriptet `scripts/revise-vitenskap-v4-remaining-four.py` gjenbruker samme algoritme på 16 tidligere godkjent *lagrede*, men **ikke designgodkjente** v2-språkfilkandidater.

Kun tekstbåndenes gullbokstav- og mørke tekstilpiksler behandles. Gjenbruk av kildefil per språk beholder eksisterende sentralmotiver, laurbær, dekor, språkoverskrifter og hovedkategorinavn.

`data/badges/vitenskap_v4_remaining_four_locales_20261112.json` gir per bildefil:
- faktisk SHA-256 og Git-blob-SHA
- eksakt kildebane og originalens Git-blob-SHA
- format, filstørrelse, språk, navn og oversatte tekster
- antall retusjerte gull- og stoffpiksler
- målt komprimeringsavvik i den bevarte illustrasjonens sentrum

`tests/vitenskap-v4-remaining-four.test.mjs` kontrollerer 16/16 kontrollsummer, transparent WebP-størrelse, kildesporing og uendrede 16 aktive Vitenskap-undermerker. Testen er lagt inn i eksisterende badge-QA.

## Visuell kvalitetsvurdering

Alle 16 faktiske bildene er gjennomgått samlet i kontaktark, og kontrollsummene er kontrollert mot de lagrede enkeltfilene.

**Positivt:** God sammenheng mellom språkvarianter, samme opprinnelige detaljrike illustrasjon per tema, lilla sydd ytterkant, lokaliserte overskrifter og korrekt kategorinavn nederst. V4 har noe mer gulltrådrelieff og stofftekstur enn v2.

**Åpne kvalitetsmerknader:**
1. Den maskerte retusjen gir bare en moderat endring. Det er **ikke dokumentert** at den når samme realistiske, tredimensjonale broderinivå som de fem norske originalene.
2. Lange overskrifter på IT og Kjemi/materialvitenskap ligger nær overgangen mellom øvre bånd og motivet. Må vurderes separat i 1:1-størrelse og i mobilstørrelse før aktivering.
3. Et grønt teknisk CI-resultat kan ikke bekrefte tekstlesbarhet og estetisk kvalitet. Dette er **16 revisjonskandidater**, ikke endelige designerstatninger.

## Integritets- og aktiveringssperre

**Ikke aktiver kandidater automatisk.** Ingen endring av `data/badges/vitenskap.json`, PlaceCard-logikk eller kartprikkene. Alle aktive 16 undermerker, 20 v2-språkbilder, de fem norske v2-originalene og eksisterende Forskning v3/v4-originaler er bevart.

Kartprikk: hovedkategorimerke. PlaceCard: aktivt undermerke med fallback til hovedmerke. Aktiver bare senere etter tydelig individuell visuell godkjenning og kontrollert historikk/arkivering av gammel aktiv original.

Dette dokumentet er en QA-rapport, ikke en attestasjon av endelig visuell godkjenning.
