# Filmklassikere – undermerke v1
2. november 2026

## Status
**Produksjonskontrakt, ikke ferdig bildefil.** Film & TV har allerede fem aktive undermerker, og Scenekunst har sju. Ingen ferdige merker erstattes.

## Motivet
- **FILMKLASSIKERE** i stor buet, sydd tekst langs øvre innerkant.
- **FILM & TV** i mindre buet, sydd tekst langs nedre innerkant (ca. 48 % av hovedtittelens størrelse).
- Klassisk filmkunst framfor generisk filmproduksjon: en svart-hvitt fortellingsscene, liten gammel 35 mm-projektor, en smal filmstrimmel og laurbær.
- Magenta `#C2188B` som primærfarge, liljehvit `#E7F8FF` sekundært; svart/hvitt/grått i svart-hvitt-filmen. Ingen dominerende gull.
- Selve broderiet skal ha realistisk kant, tekstilstoff og synlige sting.
- Ikke kopier hovedmerkets filmkamera, Spillefilms manus/klapper, Kortfilms korte episodekort, Dokumentarfilms intervju, TV-seriers fjernsyn eller Nyheter og reportasjes journalist.
- Unngå gjenkjennelige karakterer, logoer og tekst fra beskyttede filmer.
- En **selvstendig**, rund 1024 × 1024 WebP med alfa, lesbar i 64 px.

## Kvalitetsavvisning
Tre genererte illustrasjoner i denne produksjonsrunden viste feilaktig **NYHETER OG REPORTASJE** og nyhetsmotiver. Ingen er godkjent, lagret som Filmklassikere eller aktivert.

## Integrasjon
1. Lag en ny korrekt illustrasjon med begge navnene inne i kanten.
2. Visuell kontroll i 1024 px og 64 px; kontroll mot de fem publiserte Film & TV-undermerkene.
3. Skriv faktisk WebP til `bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp`.
4. Verifiser WebP, alfa, dimensjoner og SHA-256; oppdater produksjonsmanifestet og `data/badges/film_tv.json` kun ved godkjenning.
5. Kjør den målrettede testen og bygg videre.

## Målrettet test
`node --test tests/badge-filmklassikere-v1-production.test.mjs`

**Ingen bildefiler er inkludert i denne PR-en før et visuelt riktig originalmerke foreligger.**
