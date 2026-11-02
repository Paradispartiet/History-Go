# Teater undermerke – designbrief v2 (2. november 2026)

## Status
**Ny illustrasjon er produsert som inaktiv kandidat.** Eksisterende `teater-brodert-v1.webp` ble avvist fordi det kopierer de to maskene fra Scenekunst-hovedmerket. Tre ytterligere illustrasjonsforsøk ble også avvist for samme feil. Ingen av dem skal aktiveres.

## Påkrevd bilde
- Én **selvstendig** 1024 × 1024 WebP, realistisk sydd og med gjennomsiktig bakgrunn rundt merket.
- **TEATER** brodert i bue **inne i øvre kant**.
- En virkelig skuespiller på en liten prosceniumscene, med tydelig scenegulv, draperier og mykt scenelys.
- Scenekunsts farger: roserosa `#C96E8B`, grå `#808080`; lys kremtråd tillates i mindre detaljer. Ikke dominerende gull.
- Den enkle komposisjonen må fungere i 64 px, og samme høye teksturkvalitet som de eksisterende hovedmerkene.

## Forbud i dette motivet
**Ingen** komedie-/tragediemasker, teaterkikkert eller billettsymboler. Ikke bruk kopi fra Scenekunst, Teater v1 eller andre ferdige merker.

## Implementering etter visuell godkjenning
WebP-filen er lagt inn som inaktiv kandidat med SHA-256 `bfa38522935c7895a495a2b470b77120e9164037c5832e6125d8448f305948ad` (449 234 byte, 1024×1024 med alfa). Kontroller visuell kvalitet og oppdater først da `subBadgeImages.teater` i `data/badges/scenekunst.json`. Oppdater samtidig `selectedImage` og godkjenningsstatus i `underbadge_batch01_production.json`.

**Ingen bildereferanser eller eksisterende originaler er endret av denne briefen.**

## Ny kandidat fra 2. november 2026
- **Teater v2** er selvstendig generert med en aktør foran tre publikummere, grå klær, scenelys og forheng. Den inneholder **ingen teatermasker, teaterkikkert eller billett**.
- Øvre innskrift **TEATER** er brodert i stoffet.
- Faktisk fil: [Teater v2](../../bilder/merker/scenekunst/undermerker/teater-brodert-v2.webp).
- WebP 1024×1024, 449 234 byte, SHA-256 `bfa38522935c7895a495a2b470b77120e9164037c5832e6125d8448f305948ad`.
- **Ikke visuelt sluttgodkjent; ikke aktivert**. Ingen eksisterende Scenekunst-undermerker eller -hovedmerker er endret.

## Ferdigstilt 2. november 2026
Teater v2 er visuelt sluttvurdert med eget scenemotiv: én skuespiller i grått foran publikum, brodert sceneteppe og lyskastere. **Ingen teatermasker**. Navnet **TEATER** er sydd inne i øvre kant.

- Aktiv fil: `bilder/merker/scenekunst/undermerker/teater-brodert-v2.webp`
- Oppløsning: 1024 × 1024 WebP med alfa
- Filstørrelse: 449 234 byte
- SHA-256: `bfa38522935c7895a495a2b470b77120e9164037c5832e6125d8448f305948ad`
- Aktiv kobling: `data/badges/scenekunst.json -> subBadgeImages.teater`.
