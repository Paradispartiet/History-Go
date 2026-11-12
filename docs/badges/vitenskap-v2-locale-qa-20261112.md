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

## Individuell forbedring: Forskning og metode, fransk v3

Den første franske oversettelsen beholdt norsk interntekst i midtmotivet og var derfor ikke språkferdig. En isolert v3-revisjon er lagret som **ny, ikke-aktiv kandidat**:

- `bilder/merker/vitenskap/kandidater/revisjoner/fr/forskning_og_metode-v3.webp`
- `data/badges/vitenskap_forskning_fr_internal_labels_v3.json`

Ti avgrensede tekstfelt i forskningsmotivet er korrigert på fransk: **HYPOTHÈSE, TEST, RÉSULTAT, CONCLUSION, MÉTHODE, Échantillon, Procédure, Mesure, Analyse, PRÉLÈV. / A-037**. Den siste står på to linjer. Originalillustrasjonens person, mikroskop, instrumenter, landskap, lilla broderikant og ytre alfakanal er bevart.

Visuell inspeksjon av den faktiske v3-WebP viser at de tidligere norske ordene i tekstfeltene ikke lenger dominerer bildet. V3-tekstene er leselige, men de lokaliserte tekstbåndene på ytterringen har fortsatt en flatere relieffvirkning enn norsk broderi. **Godkjenn derfor ikke serien eller aktiver v3 automatisk.** Oppgraderingen gjelder ett fransk undermerke, ikke de øvrige 19 kandidatene.

Den separate v3-originalen er SHA-256/Git-blob-verifisert og inngår i målrettet `badge-qa`. De 20 eksisterende v2-språkmerkene forblir uendret og kan fremdeles brukes som sporbare revisjonskilder.
