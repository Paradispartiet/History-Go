# History Go – inventar for undermerker

Opprettet 31.10.2026. Dette er en oversikt over eksplisitte bildekoblinger i `data/badges/*.json` og kjente undermerke-manifester, **ikke en komplett oversikt over alle mulige illustrasjonsfiler i repositoryet**.

## Kontrollert

- **19** kategorier med **384** underkategori-ID-er i `sub`-feltene.
- **15** eksplisitt tilknyttede WebP-undermerker: 8 Religion og 7 Vitenskap.
- Manglende `subBadgeImages` betyr **ikke** at illustrasjoner ikke eksisterer andre steder. Underkategorier er heller ikke automatisk bestillinger på egne merker.
- De fem historiske originalene og de fire senere godkjente hovedmerkene skal ikke erstattes.

## Oversikt

| Kategori-ID | Underkategorier | Koblete undermerker | Hovedmerke | Neste handling |
|---|---:|---:|---|---|
| `historie` | 14 | 0 | Behold original | Avklare om egne undermerker er ønsket |
| `religion` | 14 | 8 | Behold godkjent | Åtte faktiske WebP-undermerker registrert i manifest |
| `vitenskap` | 16 | 7 | Behold godkjent | Sju faktiske WebP-undermerker registrert i manifest |
| `filosofi` | 12 | 0 | Nylig integrert | Ingen eksplisitte bildefiler koblet i kategori-JSON |
| `kunst` | 10 | 0 | Behold godkjent | Ingen eksplisitte bildefiler koblet i kategori-JSON |
| `scenekunst` | 7 | 0 | Nylig integrert | Vurder sju mulige undermerker etter hovedmerkekontroll |
| `by` | 10 | 0 | Nylig integrert | Vurder ti undermerker etter hovedmerkekontroll |
| `musikk` | 9 | 0 | Nylig integrert | Undersøk gamle musikkrelaterte bilder før produksjon |
| `litteratur` | 8 | 0 | Nylig integrert | Ingen eksplisitte koblinger til undermerkebilder |
| `natur` | 88 | 0 | Nylig integrert | Viktig: underkategoriene er ikke automatisk 88 bildebestillinger |
| `sport` | 110 | 0 | Behold original | Behold hovedmerket; inventer eksisterende sportsillustrasjoner |
| `politikk` | 11 | 0 | Behold original | Ingen eksplisitte koblinger til undermerkebilder |
| `naeringsliv` | 8 | 0 | Behold original | Ingen eksplisitte koblinger til undermerkebilder |
| `subkultur` | 14 | 0 | Behold original | Ingen eksplisitte koblinger til undermerkebilder |
| `film_tv` | 12 | 0 | Nylig integrert | Vurder undermerker etter hovedmerkekontroll |
| `media` | 8 | 0 | Behold godkjent | Ingen eksplisitte koblinger til undermerkebilder |
| `psykologi` | 6 | 0 | Nylig integrert | Seks underkategorier, ikke nødvendigvis seks merker |
| `helse` | 12 | 0 | Nylig integrert | Undersøk eksisterende illustrasjoner først |
| `utdanning` | 15 | 0 | Nylig integrert | Undersøk eksisterende illustrasjoner først |

## Godkjente undermerke-familier

- Religion: `data/badges/religion_underbadge_artwork.json`, 8 WebP-bilder i `bilder/merker/religion/familie/godkjent/`.
- Vitenskap: `data/badges/vitenskap_underbadge_artwork.json`, 7 WebP-bilder i `bilder/merker/vitenskap/brodert/`.

## Produksjonsrekkefølge

1. Se **faktiske** 19 hovedmerker på `badge-kontaktark.html` og avklar eventuelle visuelle avvik. Samlebilder fra bildegenerator skal ikke erstatte filkontroll.
2. Les kategoriregistre, andre eventuelle undermerke-manifester og allerede produserte filmapper før nye bildebestillinger.
3. Prioriter en pilot med Scenekunst (7), By (10) og Film & TV (12) som egen vurdering; ikke lag 29 bilder automatisk.
4. For hvert godkjente nytt undermerke: eget visuelt motiv, foreldrekategoriens fargepar, registrert kobling, kilde/versjon, faktisk WebP og målrettet QA.
5. Natur (88) og Sport (110): avklar hvilke underkategori-ID-er som representerer egne merker, i stedet for å produsere svært mange duplikater.

## Beskyttelsesregel

Ingen eksisterende hoved- eller undermerkebilder skal overskrives. Nye bilder produseres med nye filnavn og aktiveres først når de er godkjent. At en test er grønn, betyr kun at det tekniske formatet og registerkontrakten stemmer, ikke at illustrasjonen er visuelt godkjent.

Kontaktark: [badge-kontaktark.html](../../badge-kontaktark.html)
