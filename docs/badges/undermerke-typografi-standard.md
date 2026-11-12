# History Go – fast typografisk oppbygging for undermerker

Fra 2. november 2026.

## Oppbygging
1. **Øverst:** Fullt underkategorinavn med store, broderte bokstaver som følger den øvre innerkanten.
2. **Midten:** Eget, gjenkjennelig motiv for underkategorien, realistisk sydde sting og tekstilstruktur.
3. **Nederst – obligatorisk:** Hele hovedkategorinavnet, nøyaktig som kategorien heter i `data/badges/<kategori>.json` (`name`), med broderte bokstaver langs den **nedre innerkanten**, om lag **48 % av størrelsen** på øverste tittel som utgangspunkt. Bruk fullt navn også når det inneholder «&» eller «og»; **aldri forkort til bare første ord**. Dette er en hierarkisk undertekst, ikke en separat billedtekst utenfor merket.

### Farge og format
- Både navnene og motivet tilpasses de vedtatte primær- og sekundærfargene i `data/badges/*.json`.
- Nedre hovedkategorinavn skal fortrinnsvis bruke en dempet sekundærfarge, men være tydelig i visning rundt 64 px.
- Begge navn **innenfor** ringen; aldri rett tekst under eller over bildet.
- Bruk hele, korrekt stavede **hovedkategorinavnet**, for eksempel **VITENSKAP & TEKNOLOGI** (ikke «VITENSKAP») og **BY & ARKITEKTUR** (ikke «BY»). Lange navn må få egen buelinje, mindre skrift eller bredere tekstbånd; ikke forkort eller erstatt kategorinavnet.
- I språkvarianter oversettes **både øvre underkategorinavn og nedre hovedkategorinavn**. Det skal være det samme motivet i alle språk, og begge tekster skal være synlige i bildet – registrering i metadata alene er ikke nok.
- Kontroller nedre tekst ved faktisk visuell gjennomgang av originalbildet før aktivering. Et kategoriikon, atomtegn, laurbær eller dekorbånd alene erstatter ikke kategorinavnet.
- En illustrasjon per bildefil, 1024 × 1024 WebP med alfa, ingen samlebilder eller utklipp.

### Konkrete eksempler
| Øvre bue | Nedre bue |
|---|---|
| DOKUMENTARFILM | FILM & TV |
| TEATER | SCENEKUNST |
| KLASSISK ARKITEKTUR | BY & ARKITEKTUR |
| KRISTENDOM | RELIGION |
| MATEMATIKK | VITENSKAP & TEKNOLOGI |
| NETTVERK OG DIGITAL INFRASTRUKTUR | VITENSKAP & TEKNOLOGI |

**Påbud fra 11. november 2026:** Hovedkategorinavnet skal **alltid** stå nederst på hvert undermerke. Et undermerke som mangler den synlige nedre teksten er ikke visuelt ferdig selv om WebP og merkeregister finnes.

**Viktig:** Dette er en produksjonsstandard for **nye** undermerker. Allerede godkjente og aktive bilder skal beholdes inntil en separat, visuell revisjon er bestemt. Endringen i seg selv autoriserer ikke masseutskifting av tidligere broderimerkebilder.

## Aktivering
Et nytt bilde skal ikke aktiveres før korrekt øvre navn, korrekt nedre navn, lesbarhet, realistisk tekstur, kategori-ID, WebP-fil, SHA-256 og visuell kontroll er bestått. Åpne PR-er kan inneholde inaktive kandidater, men skal ikke hevde at kategoribildet er ferdig uten dette.
