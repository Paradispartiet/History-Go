# Film & TV – visuell omtegning v2 (2. november 2026)

**Status: kandidater – IKKE visuelt godkjent, IKKE aktivert.**

Brukeren avviste de flate v1-illustrasjonene for Filmfestivaler og Filminnspillingssteder. De to nye bildene har tydeligere satinbroderi, fysisk magentakant, trådtekstur og motivdybde. Begge er separate 1024×1024 WebP med alfa og 64px kontroll. Produksjonsdata og bildereferanser til v1 i main beholdes urørt.

| Merke | Kandidat | SHA-256 | Byte |
|---|---|---|---:|
| Filmfestivaler | `bilder/merker/film_tv/undermerker/filmfestivaler-brodert-v2-kandidat.webp` | `ebb59193a4bb0c92ad0806f7d7a3a4c15a9ce2953107c5f1688b221e3266ca98` | 508544 |
| Filminnspillingssteder | `bilder/merker/film_tv/undermerker/filmlocations-brodert-v2-kandidat.webp` | `7549f03819a8f5e67d6a9652471937b62f6c202b8ab14de895ddff13da686796` | 523002 |

## Før aktivering
- **Kun runde, realistiske broderte merker**, som Filmklassikere og Nyheter og reportasje.
- Øverst: `FILMFESTIVALER` / `FILMINNSPILLINGSSTEDER` i tydelig hevet brodert bue.
- Nederst: `FILM & TV` mindre, hevet brodert og innenfor kanten.
- Kategorifarger magenta #C2188B / liljehvit #E7F8FF.
- Motiv Filmfestivaler: filmrull, laurbær, stjerne og rødt festivalløper, ingen beskyttede logoer.
- Motiv Filminnspillingssteder: ekte miljø med kamera på lokasjon, ikke generisk kartvektor eller festivalkopi.
- **Åpent avvik i v2-kandidatene:** navnet ligger nederst og `FILM & TV` mangler. De må derfor ikke merges som aktiverte undermerker.
- Bildene må inspiseres i 1024 og 64 px, og de sju opprinnelig godkjente Film & TV-merkene må bevares.

Målrettet test: `node --test tests/badge-film-tv-v2-rework-candidates.test.mjs`.
