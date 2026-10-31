# History Go – produksjonsplan for broderte merker
Dato: 2026-10-31

## Status
- 19 hovedkategorier, med registrerte primær- og sekundærfarger i `data/badges/*.json`.
- 9 hovedmerker skal beholdes uendret: Historie, Sport, Politikk, Næringsliv, Subkultur, Religion, Kunst, Medier og Vitenskap.
- 15 eksisterende vitenskap-/religion-undermerker beholdes (8 Religion og 7 Vitenskap).
- 4 nye WebP-kandidater er lagt i GitHub-grenen og koblet til registeret: By v6, Film & TV v5, Litteratur v4 og Natur v4. Se `data/badges/embroidered_rollout_v1.json` for eksakte SHA-256 og dimensjoner.
- Binærintegrasjon betyr ikke publisering. Målrettet bilde-QA er bestått på forrige commit. Oppdatert By v6 krever ny QA før merge.

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
| 1 | by | #808080 / #404040 | integrated_candidate (ikke publisert) |
| 2 | film_tv | #C2188B / #E7F8FF | integrated_candidate (ikke publisert) |
| 3 | litteratur | #F5B4C8 / #FFF4E3 | integrated_candidate (ikke publisert) |
| 4 | natur | #2E4F21 / #DC7A04 | integrated_candidate (ikke publisert) |
| 5 | Musikk | #E354A0 / #000000 | review_existing |
| 6 | Scenekunst | #C96E8B / #808080 | review_existing |
| 7 | Filosofi | #7A5FD0 / #FFFFFF | review_existing |
| 8 | Psykologi | #06D6A0 / #00A896 | review_existing |
| 9 | Helse | #0B7A75 / #2E8B57 | review_existing |
| 10 | Utdanning | #7D8534 / #F2C94C | review_existing |

## Kvalitetskrav
1. Bruk allerede godkjente merkeillustrasjoner; fem historiske originaler og fire nyere godkjente er låst.
2. Ny illustrasjon kun ved dokumentert behov. Kontroller broderikant, stofftekstur, lesbarhet i kartstørrelse, symbol og faktiske kategorifarger.
3. For nye WebP: 1024×1024, ekte alfa, manifest med byte, SHA-256, aktiv bildereferanse, målrettet automatisert QA.
4. Unngå revisjon eller utilsiktet endring av undermerker.
5. Merk `integrated_candidate` før CI og visuell kontroll; `published` først etter merge og vellykket publisering.
