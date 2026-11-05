# People – regel for AI-genererte illustrasjoner

**Status:** fast design- og dokumentasjonsregel for History Go.

**Innføring:** 2026-11-03, Tøyenbadet.

Når et kildekontrollert People-medlem mangler et publiserbart portrett, kan History Go bruke en **original, tydelig illustrert** personfremstilling i stedet. Illustrasjonen er et kunstnerisk bilde, ikke dokumentasjon av utseendet.

## Synlig design

- Portrettet skal oppleves som **maleri/tegning** med tydelige penselstrøk, stiliserte former og ikke-fotografisk hud og lys.
- Unngå fotorealisme og naturtro syntetiske pressefotografier.
- Teksten **«AI-ILLUSTRASJON»** skal være tydelig lesbar i selve bildefilen, også når bildet åpnes utenfor History Go.
- Behold samme gjennomførte illustrasjonsstil på tvers av People-kort, men ikke oppfinn likhet med en historisk eller nålevende person og presenter den som et verifisert ansikt.

## Metadata og sannferdig presentasjon

Canonical People-profil skal skille ekte foto fra illustrasjon:

```json
{
  "imageMeta": {
    "imageKind": "ai_generated_illustration",
    "nonDocumentary": true,
    "facialLikenessVerified": false,
    "noSourcePhotographClaim": true,
    "visibleLabel": "AI-ILLUSTRASJON"
  }
}
```

- Biografiske påstander må fortsatt støttes av egne godkjente kilder og påstandskart. Illustrasjonen kan aldri brukes som bevis for identitet, utseende, stedstilstedeværelse eller historiske hendelser.
- Dersom det finnes et autentisk, rettighetsavklart foto, skal det aldri merkes som AI-illustrasjon. Behold eksisterende godkjente fotografier.
- Ikke baser AI-bildene på et ulisensiert pressefoto som omskriving av det samme bildet.
- Ta vare på originalgenerering, lokal WebP-variant, kildetype, dato, SHA-256, dimensjoner, creator/credit og en test som verifiserer bildets faktiske bytes.
- Bildet kan brukes som People-kortets forhåndsvisning når resten av samlingskontrakten er oppfylt og bildet tydelig er erklært illustrasjon.

**Eksempel:** Tøyenbadet har én People-profil med autentisk Commons-foto av Anne Lindboe og fire kildebelagte People-profiler der bildene er merkede originale AI-illustrasjoner. Disse fire bildene hevder ingen dokumentert ansiktslikhet.
