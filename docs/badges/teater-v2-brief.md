# Teater undermerke – designbrief v2 (2. november 2026)

## Status
**Ny illustrasjon mangler.** Eksisterende `teater-brodert-v1.webp` ble avvist fordi det kopierer de to maskene fra Scenekunst-hovedmerket. Tre ytterligere illustrasjonsforsøk ble også avvist for samme feil. Ingen av dem skal aktiveres.

## Påkrevd bilde
- Én **selvstendig** 1024 × 1024 WebP, realistisk sydd og med gjennomsiktig bakgrunn rundt merket.
- **TEATER** brodert i bue **inne i øvre kant**.
- En virkelig skuespiller på en liten prosceniumscene, med tydelig scenegulv, draperier og mykt scenelys.
- Scenekunsts farger: roserosa `#C96E8B`, grå `#808080`; lys kremtråd tillates i mindre detaljer. Ikke dominerende gull.
- Den enkle komposisjonen må fungere i 64 px, og samme høye teksturkvalitet som de eksisterende hovedmerkene.

## Forbud i dette motivet
**Ingen** komedie-/tragediemasker, teaterkikkert eller billettsymboler. Ikke bruk kopi fra Scenekunst, Teater v1 eller andre ferdige merker.

## Implementering etter visuell godkjenning
Plasser `bilder/merker/scenekunst/undermerker/teater-brodert-v2.webp`, registrer SHA-256, kontroller alfa/dimensjoner og oppdater først da `subBadgeImages.teater` i `data/badges/scenekunst.json`. Oppdater samtidig `selectedImage` og godkjenningsstatus i `underbadge_batch01_production.json`.

**Ingen bildereferanser eller eksisterende originaler er endret av denne briefen.**
