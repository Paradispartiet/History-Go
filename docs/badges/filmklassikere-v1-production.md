# Filmklassikere – undermerke v1
2. november 2026

## Status
**Produksjonskontrakt, ikke ferdig bildefil.** Film & TV har allerede fem aktive undermerker, og Scenekunst har sju. Ingen ferdige merker erstattes.

## Motivet
- **FILMKLASSIKERE** i stor buet, sydd tekst langs øvre innerkant.
- **FILM & TV** i mindre buet, sydd tekst langs nedre innerkant (ca. 48 % av hovedtittelens størrelse).
- Klassisk filmkunst framfor generisk filmproduksjon: en svart-hvitt fortellingsscene, liten gammel 35 mm-projektor, en smal filmstrimmel og laurbær.
- Magenta `#C2188B` som primærfarge, liljehvit `#E7F8FF` sekundært; svart/hvitt/grått i svart-hvitt-filmen. Ingen dominerende gull.
- Selve broderiet skal ha realistisk kant, tekstilstoff og synlige sting.
- Ikke kopier hovedmerkets filmkamera, Spillefilms manus/klapper, Kortfilms korte episodekort, Dokumentarfilms intervju, TV-seriers fjernsyn eller Nyheter og reportasjes journalist.
- Unngå gjenkjennelige karakterer, logoer og tekst fra beskyttede filmer.
- En **selvstendig**, rund 1024 × 1024 WebP med alfa, lesbar i 64 px.

## Kvalitetsavvisning
Tre genererte illustrasjoner i denne produksjonsrunden viste feilaktig **NYHETER OG REPORTASJE** og nyhetsmotiver. Ingen er godkjent, lagret som Filmklassikere eller aktivert.

## Integrasjon
1. Lag en ny korrekt illustrasjon med begge navnene inne i kanten.
2. Visuell kontroll i 1024 px og 64 px; kontroll mot de fem publiserte Film & TV-undermerkene.
3. Skriv faktisk WebP til `bilder/merker/film_tv/undermerker/klassikere-brodert-v1.webp`.
4. Verifiser WebP, alfa, dimensjoner og SHA-256; oppdater produksjonsmanifestet og `data/badges/film_tv.json` kun ved godkjenning.
5. Kjør den målrettede testen og bygg videre.

## Målrettet test
`node --test tests/badge-filmklassikere-v1-production.test.mjs`

**Ingen bildefiler er inkludert i denne PR-en før et visuelt riktig originalmerke foreligger.**

## Kvalitetsoppdatering – 2. november 2026 (senere samme dag)

Ytterligere **tre** bildegenereringer ble forkastet fordi de fortsatt viste **NYHETER OG REPORTASJE** og reporter-/nyhetsmotiver. En separat tegnet komposisjon viste riktig **FILMKLASSIKERE** og **FILM & TV** rundt en original svart-hvitt-filmsekvens, men hadde for flate vektorformer og tilfredsstilte **ikke** kravet om realistisk hevet broderitråd. Også denne kandidaten er avvist, og det skal **ikke** legges til bilde- eller registerreferanse fra den.

**Totalt sju forkastede utkast** (seks med feil motiv/navn, ett med for svak tekstur). Disse er ikke aktive bilder og teller ikke som ferdige undermerker. Det finnes fortsatt fem aktive Film & TV-undermerker. Produksjonen trenger et nytt, selvstendig brodert bilde med en original svart-hvitt-kinoscene, liten 35 mm-projektor og filmstripe, men uten journalistikk.

### Akseptkrav før aktivering
- Visuell kontroll av **nøyaktig** `FILMKLASSIKERE` øverst, og `FILM & TV` som mindre brodert tekst i nedre innerkant.
- Ingen reporter, TV-nyhetskamera, nyhetsbil, TV-serieruter eller gjenbruk av de fem eksisterende undermerkene.
- Må ligne godkjente realistiske broderimerker, **ikke** et flatt vektorikon eller et generert kontaktark.
- Manuell godkjenning ved 1024 px og 64 px, deretter faktisk 1024×1024 RGBA/WebP-fil, SHA-256 og test før `subBadgeImages.klassikere` opprettes.

Automatisert filtest kan ikke alene verifisere at broderte bokstaver i selve bildet er riktige. Den visuelle godkjenningen er et selvstendig obligatorisk trinn.
