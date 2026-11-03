# History Go – produksjonsplan for broderte merker
Dato: 2026-10-31

## Status
- 19 hovedkategorier, med registrerte primær- og sekundærfarger i `data/badges/*.json`.
- 9 hovedmerker skal beholdes uendret: Historie, Sport, Politikk, Næringsliv, Subkultur, Religion, Kunst, Medier og Vitenskap.
- 15 eksisterende vitenskap-/religion-undermerker beholdes (8 Religion og 7 Vitenskap).
- 10 nye broderte WebP-hovedmerker er merget i to bolker: PR #6829 (By v6, Film & TV v5, Litteratur v4, Natur v4) og PR #6842 (Musikk, Scenekunst, Filosofi, Psykologi, Helse, Utdanning).
- Begge målrettede QA-jobber er bestått. Binærfiler, SHA-256 og registerkoblinger er verifisert i `data/badges/embroidered_rollout_v1.json` og `data/badges/embroidered_rollout_v2.json`.
- Alle 19 hovedkategorier har dermed aktiv bildereferanse i `main`, fordelt på 9 beskyttede eksisterende og 10 nyintegrerte. GitHub Pages for den siste bolken er ennå ikke bekreftet ferdig.

## Vernede hovedmerker
| Kategori | Fil |
|---|---|
| historie | `bilder/merker/historie.PNG` |
| sport | `bilder/merker/sport.PNG` |
| politikk | `bilder/merker/politikk.PNG` |
| naeringsliv | `bilder/merker/naeringsliv3.webp` |
| subkultur | `bilder/merker/Subkultur3.PNG` |
| religion | `bilder/merker/religion-godkjent.webp` |
| kunst | `bilder/merker/kunst-brodert.webp` |
| media | `bilder/merker/media-brodert-lysbla.webp` |
| vitenskap | `bilder/merker/vitenskap/brodert/vitenskap.webp` |

Ingen av disse ni bildereferansene skal byttes ut i dette arbeidet.

## Eksisterende undermerker
- Religion: `data/badges/religion_underbadge_artwork.json` (8 bildefiler).
- Vitenskap: `data/badges/vitenskap_underbadge_artwork.json` (7 bildefiler).
- Før eventuelle nye undermerker: inventer egne registrerte bilder og manifest; aldri behandle ukjent status som manglende bilde.

## Produksjonskø
| Prioritet | Kategori | Farger | Status |
| --- | --- | --- | --- |
| 1 | by | #808080 / #404040 | merged_main (Pages-status kontrolleres separat) |
| 2 | film_tv | #C2188B / #E7F8FF | merged_main (Pages-status kontrolleres separat) |
| 3 | litteratur | #F5B4C8 / #FFF4E3 | merged_main (Pages-status kontrolleres separat) |
| 4 | natur | #2E4F21 / #DC7A04 | merged_main (Pages-status kontrolleres separat) |
| 5 | Musikk | #E354A0 / #000000 | merged_main (Pages-status kontrolleres separat) |
| 6 | Scenekunst | #C96E8B / #808080 | merged_main (Pages-status kontrolleres separat) |
| 7 | Filosofi | #7A5FD0 / #FFFFFF | merged_main (Pages-status kontrolleres separat) |
| 8 | Psykologi | #06D6A0 / #00A896 | merged_main (Pages-status kontrolleres separat) |
| 9 | Helse | #0B7A75 / #2E8B57 | merged_main (Pages-status kontrolleres separat) |
| 10 | Utdanning | #7D8534 / #F2C94C | merged_main (Pages-status kontrolleres separat) |

## Kvalitetskrav
1. Bruk allerede godkjente merkeillustrasjoner; fem historiske originaler og fire nyere godkjente er låst.
2. Ny illustrasjon kun ved dokumentert behov. Kontroller broderikant, stofftekstur, lesbarhet i kartstørrelse, symbol og faktiske kategorifarger.
3. For nye WebP: 1024×1024, ekte alfa, manifest med byte, SHA-256, aktiv bildereferanse, målrettet automatisert QA.
4. Unngå revisjon eller utilsiktet endring av undermerker.
5. Merk `integrated_candidate` før CI og visuell kontroll, `merged_main` etter merge, og `published` først etter vellykket GitHub Pages-publisering.
