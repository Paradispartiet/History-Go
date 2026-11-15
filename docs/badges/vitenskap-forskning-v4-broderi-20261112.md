# Vitenskap – Forskning og metode v4: reviderte broderte tekstbånd

Dato: 12. november 2026.

## Omfang og visuell sammenligning
Denne PR-en gjelder **kun tekstbåndene på fire oversatte undermerkekandidater** for `forskning_og_metode`, og viderefører allerede lagrede, språklig korrigerte v3-kandidater. Kildeoriginalenes sentralmotiv, små faglige etiketter, lilla ytterbroderi og gjennomsiktighet beholdes.

- Fransk: `bilder/merker/vitenskap/kandidater/revisjoner/fr/forskning_og_metode-v4-broderi.webp`
- Engelsk: `bilder/merker/vitenskap/kandidater/revisjoner/en/forskning_og_metode-v4-broderi.webp`
- Spansk: `bilder/merker/vitenskap/kandidater/revisjoner/es/forskning_og_metode-v4-broderi.webp`
- Portugisisk: `bilder/merker/vitenskap/kandidater/revisjoner/pt/forskning_og_metode-v4-broderi.webp`

Alle er 1024 × 1024 transparent WebP, eksportert som ekte filer i egen revisjonsmappe. Én maskert bildebearbeiding er brukt på gullbokstavenes høylys, skyggekant og mikrostruktur samt diskret mørkt tekstil i annulus. Ingen bokstavtekst legges til eller fjernes. Derfor beholdes de fullt lokaliserte topp-, bunn- og interne forskningsetikettene fra v3.

Før-/etter-ark for fransk: `bilder/merker/vitenskap/kandidater/revisjoner/fr/forskning_og_metode-v4-comparison.jpg`. Faktiske alle fire WebP-filer er åpnet og inspisert. V4 gir mer markerte gulltråder og diskret stofftekstur, men forskjellen er moderat. Det er **ikke dokumentert at tekstbåndene nå er helt visuelt identiske med den langt mer tredimensjonale norske originalbroderingen**. Derfor er disse fortsatt kandidater.

## Teknisk integritet
`data/badges/vitenskap_forskning_v4_embroidered_candidates_20261112.json` registrerer faktisk filstørrelse, SHA-256, Git-blob-SHA, kildefil per språk, antall retusjerte gull-/stoffpiksler og målt WebP-komprimeringsavvik i sentrum.

`tests/vitenskap-forskning-v4-embroidery.test.mjs` inngår i `Embroidered badges - focused validation` og kontrollerer alle fire WebP-filene, eksakte kontrollsummer og uendrede 16 aktive undermerker. Genereringsskriptet `scripts/revise-vitenskap-v4-embroidery.py` kan reprodusere produksjonen fra v3. Den midlertidige write-workflowen er fjernet etter at ekte bildefiler er overført.

## Aktiveringssperre
- **IKKE AKTIVERT.** `data/badges/vitenskap.json` og de nåværende `bilder/merker/vitenskap/brodert/*.webp` er urørt.
- De fire v3-originalene, de 20 tidligere oversatte v2-originalene og alle fem norske v2-kandidatene er beholdt.
- Kartprikken bruker fortsatt hovedkategorimerket, mens PlaceCard bruker aktivt undermerke når det finnes, ellers hovedmerket.
- Aktivering av disse v4-filene krever eksplisitt visuell stilgodkjenning og en egen kontrollert integrasjonsendring. Ikke la grønn teknisk CI alene regnes som slik godkjenning.
