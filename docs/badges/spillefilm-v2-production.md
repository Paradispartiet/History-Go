# History Go – Spillefilm undermerke v2
2. november 2026

## Status
Produksjonen er åpnet etter at Scenekunst 7/7 ble merget til `main` i PR #6906. Dette er en **produksjonskontrakt** for Film & TV sitt første undermerke, ikke en ferdig illustrasjon.

Eksisterende `spillefilm-brodert-v1.webp` er avvist: det dupliserer hovedmerkets filmkamera og bruker dominerende gult. Det gamle bildet beholdes som arkiv, **ikke aktivert**.

## Bildemotiv
- Rund brodert stoffpatch med kraftig, naturtro sydd kant, dybde og tekstur.
- `SPILLEFILM` som tydelig buet tekst **inni øvre innerkant**, ikke utenfor.
- Motiv: **filmklapperbrett + åpent manus + kort filmstrimmel med bildefelter**. Ingen kamera, projektor eller lyskaster som kopierer Film & TV-hovedmerket.
- Magenta `#C2188B` som primærfarge. Liljehvit `#E7F8FF` som tydelig sekundærfarge. Små grå/svarte nøytrale tråder kan gi dybde. Ingen dominerende gull eller gult.
- Bare **ett merke per selvstendige WebP**, 1024 × 1024 med alfa. Ikke klipp fra samlebilde.
- Motivet skal være gjenkjennelig ned til 64 px.

## Implementeringsregel
1. Først visuell kvalitetskontroll av reelt bilde på full størrelse og 64 px; sjekk bokstavene.
2. Etter godkjenning: last opp `bilder/merker/film_tv/undermerker/spillefilm-brodert-v2.webp` og verifiser byte, SHA-256, 1024 × 1024, alfa.
3. Oppdater `subBadgeImages.spillefilm` i `data/badges/film_tv.json` og `selectedImage` i `data/badges/underbadge_batch01_production.json`.
4. Kjør målrettet test. **Før dette skal ingen Film & TV-undermerker aktiveres.**

Neste etter Spillefilm: Kortfilm og Dokumentarfilm, etter samme kontrakt med hvert sitt særmotiv.

Ingen av de 19 hovedmerkene eller ferdige Scenekunst-undermerkene skal endres.
