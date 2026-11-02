# Norsk film og TV – brodert undermerke v1
Dato: 2. november 2026

## Status
**Produksjonskontrakt. Ingen ny bildefil godkjent eller aktivert.** `main` har 6 av 12 Film & TV-undermerker aktive. Alle tidligere godkjente merker skal beholdes urørt.

## Navn og farger
- **Øverst:** NORSK FILM OG TV, tydelig brodert i bue **innenfor** øvre innerkant; ved nødvendig plass kan typografien fordeles i to godt lesbare linjer.
- **Nederst:** FILM & TV, mindre brodert tekst i bue **innenfor** nedre innerkant, ca. 48 % av størrelsen på øvre tekst.
- **Primær:** magenta `#C2188B`; **sekundær:** liljehvit `#E7F8FF`.
- Begge tekster og broderikant må være lesbare når merket vises på 64 px.

## Eget filmhistorisk motiv
Tre egne, **originale** broderte filmruter gir ulike bilder av norsk film og TV – et eldre svart-hvitt norsk kystmiljø, et fiktivt filmscene-motiv i et moderne norsk sted og et dramatisk norsk vinter-/fjordlandskap. En liten filmstripe kan binde dem sammen. Motivets norske stedstilknytning må være lesbar, men flagget skal **ikke** dominere. Bruk ekte sydd stoff og broderitråd.

**Forbudt:** illustrasjon merket ANIMASJON, tegneserie/robot, dominerende filmkamera fra hovedmerket, den samme svart-hvitt-filmscenen som Filmklassikere, journalistikk fra Nyheter og reportasje, beskyttede filmkarakterer, filmlogoer eller gjenbruk av andre undermerker.

## Forkastet bildegenerering
To utkast 2.11.2026 fikk feil ordet **ANIMASJON** og animasjonsstudio i motivet. De skal aldri lagres eller aktiveres som Norsk film og TV. Den kategorien er ikke en av de 12 eksisterende underkategoriene i `film_tv.json`.

## Integrering etter ny visuell godkjenning
1. Ett selvstendig realistisk brodert bilde med **riktig begge navn**, kontrollert i 1024 og 64 px.
2. WebP 1024 × 1024 med alfa til `bilder/merker/film_tv/undermerker/norsk_film_og_tv-brodert-v1.webp`, verifisert SHA-256, størrelse og gjennomsiktighet.
3. `subBadgeImages.norsk_film_og_tv` settes først etter at faktisk WebP er kontrollert.
4. Oppdater produksjonsmanifestets `selectedImage`, teknisk og visuell godkjenning. Kjør den målrettede testen.
5. Ingen eksisterende merkebilder overskrives.

Målrettet test: `node --test tests/badge-norsk-film-tv-v1-production.test.mjs`.
