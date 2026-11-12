# Tjuvholmen – trygg import av illustrerte People-kandidater

Denne delen ferdigstiller **importverktøyet**, ikke ansiktslikhet eller publikasjon.
De tre ekte 900×1200 WebP-filene finnes i ChatGPT-vedlegget
`tjuvholmen_people_webp_importpakke.zip`. De er ikke publisert i repoet.

## Kontroll og staging

Fra en lokal utsjekk av `Paradispartiet/History-Go`:

```bash
python3 -m pip install Pillow
python3 scripts/stage-tjuvholmen-people-illustrations.py --package /sti/til/tjuvholmen_people_webp_importpakke.zip
python3 scripts/stage-tjuvholmen-people-illustrations.py --package /sti/til/tjuvholmen_people_webp_importpakke.zip --stage
```

Den første kommandoen kontrollerer bare. Den andre kopierer **kun de tre
SHA-256-verifiserte WebP-filene** til
`bilder/kort/people/candidates/tjuvholmen/` og oppretter
`reports/place-production/tjuvholmen-generated-people-illustration-import.json`.
Originale genererings-PNG-er er ikke del av denne WebP-pakken, og oppgis
derfor ikke som arkivert.

**Bildekontroller:** alle person-ID-ene må stemme med kandidatmanifestet,
bildene må være faktiske WebP 900×1200, kontrollsummer må være identiske, og
en avvikende eksisterende fil får ikke overskrives.

**Publisering:** Staging er ikke godkjenning. Portrettene må sammenlignes med
korrekt identifiserte kildeportretter og godkjennes redaksjonelt, med
`imageMeta.assetKind="illustration"` og tydelig synlig
`Illustrasjon` i People-visningen. Det skal aldri stå at de er fotografier.
Verken `People`-kildene, `place-open` eller
`vFerdig` endres av importverktøyet.

**Status:** 2/5 People-fotografier er fortsatt godkjent; de tre illustrasjonene
er kandidater, ikke identitetssikre portratter. Skulpturrettigheter og
Structures-fulloriginaler må fortsatt avklares separat. Sak #7290.
