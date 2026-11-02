# History Go – fast typografisk oppbygging for undermerker

Fra 2. november 2026.

## Oppbygging
1. **Øverst:** Fullt underkategorinavn med store, broderte bokstaver som følger den øvre innerkanten.
2. **Midten:** Eget, gjenkjennelig motiv for underkategorien, realistisk sydde sting og tekstilstruktur.
3. **Nederst:** Fullt hovedkategorinavn med broderte bokstaver langs den **nedre innerkanten**, om lag **48 % av størrelsen** på øverste tittel. Dette er en hierarkisk undertekst, ikke en separat billedtekst utenfor merket.

### Farge og format
- Både navnene og motivet tilpasses de vedtatte primær- og sekundærfargene i `data/badges/*.json`.
- Nedre hovedkategorinavn skal fortrinnsvis bruke en dempet sekundærfarge, men være tydelig i visning rundt 64 px.
- Begge navn **innenfor** ringen; aldri rett tekst under eller over bildet.
- Bruk komplett korrekt kategorinavn. Lange navn må typograferes med bedre plass, ikke endres til feil ord.
- En illustrasjon per bildefil, 1024 × 1024 WebP med alfa, ingen samlebilder eller utklipp.

### Konkrete eksempler
| Øvre bue | Nedre bue |
|---|---|
| DOKUMENTARFILM | FILM & TV |
| TEATER | SCENEKUNST |
| KLASSISK ARKITEKTUR | BY |
| KRISTENDOM | RELIGION |
| MATEMATIKK | VITENSKAP |

**Viktig:** Dette er en produksjonsstandard for **nye** undermerker. Allerede godkjente og aktive bilder skal beholdes inntil en separat, visuell revisjon er bestemt. Endringen i seg selv autoriserer ikke masseutskifting av tidligere broderimerkebilder.

## Aktivering
Et nytt bilde skal ikke aktiveres før korrekt øvre navn, korrekt nedre navn, lesbarhet, realistisk tekstur, kategori-ID, WebP-fil, SHA-256 og visuell kontroll er bestått. Åpne PR-er kan inneholde inaktive kandidater, men skal ikke hevde at kategoribildet er ferdig uten dette.
