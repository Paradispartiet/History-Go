# Vitenskap v2 – visuell QA for 20 språkmerkekandidater

Dato: 12. november 2026
Relatert: #7267 (fem norske originaler), #7268 (femspråklig produksjonsplan), #7273 (bildeforsøk).

## Dokumentert resultat

- Fem norske 1024 × 1024 WebP-originaler beholdt byte-identisk i `bilder/merker/vitenskap/kandidater/`.
- 20 nye **ikke-aktive** WebP-kandidater for en/es/pt/fr lagret i `bilder/merker/vitenskap/kandidater/locales/`.
- `data/badges/vitenskap_v2_locale_candidates_artwork_20261112.json` lagrer SHA-256, Git-blob-SHA og kildetilknytning for hver kandidat.
- Fem vedlagte originaler og 20 kandidater kan ses samlet i `bilder/merker/vitenskap/kandidater/contact-sheet-localized-v2.jpg`.
- Verifiserte tekniske kontroller: WEBP, 1024², identisk alfakanal, begrenset komprimeringsavvik i sentralmotivet, kanonisk lokalisert topp-/bunntekst i produksjonsplanen, SHA og 16 uendrede aktive undermerker.

## Visuell kontroll – sperrer før aktivering

**IKKE GODKJENT FOR PRODUKSJON.** De 20 filene er kontroll- og viderebearbeidingskandidater, ikke ferdige identiske oversettelser av originalillustrasjonene.

1. Lengre oversatte overskrifter (særlig fransk Informasjonsteknologi og Kjemi/materialvitenskap) ligger for nær enkelte instrumenter og illustrasjonsdetaljer ved øvre overgang mellom bånd og midtfelt.
2. Den lokalt syntetiserte tekstilen og serifteksten er flatere enn originalenes realistiske, opphøyde brodertråd. Skal løftes til samme visuelle kvalitet som norske originaler.
3. Midtmotivet er bevart, men Forskningsmerket har norsk tekst inne i selve motivet (bl.a. «HYPOTESE», «METODE», «KONKLUSJON»). Dette er ikke språklig gjennomarbeidet i fremmedspråkutgavene.
4. Automatisk QA beviser at filene er gyldige, ikke at all synlig tekst er korrekt stavet eller plassert. En manuell visuell tekst-/motivkontroll per språkfil er nødvendig før bytte til aktive `subBadgeImages`.

## Sikker integrasjon

Ingen overskriving av `bilder/merker/vitenskap/brodert/*.webp`, ingen endring av `data/badges/vitenskap.json`, og ingen kart-/PlaceCard-endring. Når nye verifiserte, visuelt godkjente språkfiler foreligger, skal v1-originalene arkiveres byte-identisk og aktivering skje i egen PR med målrettet test og mobilvisning.
