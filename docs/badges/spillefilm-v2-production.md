# History Go – Spillefilm undermerke v2

## Publisert i PR
- Nytt separat brodert undermerke: `bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp`.
- **1024 × 1024 WebP**, transparent, **510 186 byte**.
- SHA-256: `6d2bb5097dd1c0de21e817358ef2d45e1ddd75daaf8b400eaf38147997387db7`.
- `SPILLEFILM` er sydd i bue øverst, **inne i merket**, med et filmklapperbrett, manus og kort filmstrimmel.
- Magenta `#C2188B` og liljehvit `#E7F8FF`, med nøytrale svarte/grå sting i dybden.
- Nytt motiv uten filmkamera og projeksjonslys fra hovedmerket. Det gamle `spillefilm-brodert-v1.webp` beholdes som avvist arbeidsutkast.

## Visuell og teknisk kontroll
Originalillustrasjonen ble produsert som et selvstendig bilde, ikke klippet fra et kontaktark. Det ble kontrollert i full oppløsning og med nedskalering til 64 px. Bildekanten er sydd, motiv og tekst lesbare. Visuell vurdering godkjent 2. november 2026.

`data/badges/film_tv.json` har nå én aktiv undermerkereferanse: `subBadgeImages.spillefilm`. Alle 7 Scenekunst-undermerker og 19 hovedmerker bevares uendret.

Kjør målrettede tester:
```bash
node --test tests/badge-spillefilm-v2-production.test.mjs tests/badge-underbadge-batch01.test.mjs
```

## Videre
Neste undermerke: **Kortfilm** (`film_tv/kortfilm`), deretter **Dokumentarfilm**. Produksjonen skal være én selvstendig WebP per undermerke, med navn sydd i kanten og egen komposisjon.

![Spillefilm v2](../../bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp)
