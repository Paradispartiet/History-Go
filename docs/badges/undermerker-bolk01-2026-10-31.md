# History Go – undermerker: produksjonsbolk 01
Dato: 31.10.2026

## Status
- **29 underkategorier** fordelt på Scenekunst (7), By (10) og Film & TV (12) er kartlagt i aktivt kategoriregister.
- Ingen har foreløpig registrert eget undermerkebilde i `data/badges/{scenekunst,by,film_tv}.json`.
- Ingen av de foreslåtte nye filene er generert eller aktivert. `data/badges/underbadge_batch01_production.json` er designspesifikasjon, **ikke en publiseringsmanifest**.
- De fem originalmerkene og de fire nylig godkjente hovedmerkene er beskyttet. De 15 ferdige undermerkene i Religion/Vitenskap beholdes.
- En bildegenerert plakat/samleillustrasjon kan ikke brukes som source-of-truth eller klippes opp til enkelmerker.

## Første pilot
| Prioritet | Kategori | Undermerke | Symbol | Farger |
|---|---|---|---|---|
| 1 | Scenekunst | Teater | Prosceniumscene og scenelys, ikke hovedmerkets masker | `#C96E8B` + `#808080` |
| 1 | By | Klassisk arkitektur | Søyle og trekantgavl i grå stein | `#808080` + `#404040` |
| 1 | Film & TV | Spillefilm | Filmklapper, objektiv og filmstrimmel | `#C2188B` + `#E7F8FF` |

## Produksjonskontrakt
1. Tegn én selvstendig 1024×1024-fil per undermerke i brodert stil; aldri generer et kontaktark og klipp ut detaljene. Inngående plan angir motiv og hva som skal unngås for alle 29.
2. Bruk foreldrekategoriens fargepar, tydelig vevd bakgrunn, brodert kant og et gjenkjennelig symbol som også fungerer i 48–64 px.
3. Kunstnerisk vurdering før aktivering. Teknisk CI kan bare verifisere fil, SHA-256, oppløsning, alfa, kategori-ID og lenker.
4. Etter godkjenning: WebP lastes opp i foreslått `bilder/merker/<kategori>/undermerker/<id>-brodert-vN.webp`; fyll manifestets `selectedImage` og status; legg til `subBadgeImages` i riktig kategori-JSON; oppdater manifest/kilder, test og kontaktark.
5. Ingen eksisterende hoved- eller undermerker skal overskrives eller byttes ut på grunn av den nye bolken.

## Neste etter pilot
- Scenekunst: dans, performance, musikkteater, sceneproduksjon, regi, dramaturgi.
- By: modernisme, funksjonalisme, brutalisme, postmodernisme, samtidsarkitektur, byplanlegging, infrastruktur, monumenter_og_landemerker, bolig_og_bomiljo.
- Film & TV: kortfilm, dokumentarfilm, tv_serier, nyheter_og_reportasje, klassikere, norsk_film_og_tv, filmfestivaler, filmlocations, film_og_tv_produksjon, arkiv_og_kanon, visningssteder.

## Relevante registre
- `data/badges/scenekunst.json`
- `data/badges/by.json`
- `data/badges/film_tv.json`
- `data/badges/religion_underbadge_artwork.json`
- `data/badges/vitenskap_underbadge_artwork.json`
- `badge-kontaktark.html`

Kjør bare `node --test tests/badge-underbadge-batch01.test.mjs` for kontrakten i denne grenen.
