# Kortfilm – brodert undermerke v1

**2. november 2026**

## Publisert merketype
- Fil: `bilder/merker/film_tv/undermerker/kortfilm-brodert-v1.webp`
- 1024 × 1024, WebP med alfa, 382 864 byte
- SHA-256: `64257f44bbbf3a763fe8b3b8e3f621c6a708d4213d8c5559c0e1a8994e94df56`
- **KORTFILM** sydd i bue inne i øvre kant
- Film & TV-farger: magenta `#C2188B`, liljehvit `#E7F8FF`
- Motiv: tre separate storyboardruter, analogt tidsur, visningsskjerm og filmstrimmel. Mindre filmklapper i bakgrunnen.
- Kvalitet: enkeltstående realistisk broderi; kontrollert både i 1024 px og 64 px

Bildet er forskjellig fra Spillefilm v2, som vektlegger manus og filmklapper. Kortfilm v1 vektlegger historien i tre ruter og spilletid.

## Integrasjon
`data/badges/film_tv.json` har ny kobling i `subBadgeImages.kortfilm`. `underbadge_batch01_production.json` registrerer status, SHA-256, visuell og teknisk kontroll.

Eldre Spillefilm og alle sju Scenekunst-undermerker er bevart. Målrettet kontroll:
`node --test tests/badge-kortfilm-v1.test.mjs`

## Videre
Neste planlagte undermerke i Film & TV er `dokumentarfilm`.
