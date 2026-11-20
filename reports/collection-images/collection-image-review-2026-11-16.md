# History GO – bildearbeid i samlingene (arbeidskø, 16.11.2026)

**Status:** første kataloggjennomgang; ikke en bildepublisering eller redaksjonell godkjenning.  
**Omfang:** Brands, Structures, Objects og etter hvert People, Historical Events og Productions.  
**Base:** `main` ved opprettelse av denne grenen.

## Grunnlag og skille mellom samlingene

- **Brands:** Følg `docs/BRAND_ASSETS.md` og `data/brands/brand_rules_v1_1.json`. Bruk autentisk, verifisert logo eller historisk ordmerke. **Ikke lag nye merkevarelogoer med KI**, og bruk ikke vanlige foto som erstatning for logoporten.
- **Structures:** Navngitte bygninger og faste anlegg eies av Structures, ikke Objects. Kontroller riktig bygg, epoke, arkitektoniske hovedtrekk, kilde og bildeutsnitt før utskifting. Et illustrert bygg må merkes som illustrasjon og aldri fremstå som dokumentarisk foto.
- **Objects:** Følg `docs/PLACE_OBJECTS_CANONICAL.md`. Bare dokumenterte, fysiske, stedsspesifikke gjenstander. Mangler gjenbrukbart foto, kan vi lage kildebasert originalillustrasjon, tydelig merket **«Illustrasjon – ikke fotografi»** i bilde og visning; aldri en påstått eksakt rekonstruksjon.
- **People / Historical Events / Productions:** Egne produksjons- og rettighetskrav. Ikke bruk en illustrasjon som identitetsbevis eller generer historiske ansikter uten kildekritisk kontroll.

**Felles:** Les gjeldende data-/bildemetadata, bevar kildeoriginal og gammel publisert fil, oppgi `sourcePage`, creator/credit, lisens eller `rightsBasis`, `imageKind`, usikre detaljer, assetpath og reviewstatus. Bruk originalt, gjennomarbeidet bildespråk; unngå generiske, flate vektorillustrasjoner, tekstplakater og repeterte malmotiver. Vis hele relevant motiv uten utilsiktet beskjæring. Verifiser faktisk PlaceCard- og rundingsvisning på mobil og desktop før publisering.

## Foreløpig katalogstatus

Filopptelling fra GitHub-mappene på `main` 16.11.2026; **antall eksisterende filer er ikke dekningsgrad, kvalitet eller rettighetsstatus**:

| Publisert samlingsmappe | Bildefiler (ekskl. kildeundermapper) |
| --- | ---: |
| `bilder/kort/brands/` | 76 |
| `bilder/kort/structures/` | 51 |
| `bilder/kort/objects/` | 103 |

Stedsbilder er et eget spor. `data/places/place_image_backlog_summary.json` er merket generert 12.11.2026, med 1538 Places og 1100 registrert manglende hovedbilder. Dette tallet må oppdateres ved ny audit; det er **ikke** antall manglende Brands-/Structures-/Objects-bilder.

## Første kildebundne forbedringskø

| Asset / samling | Nåværende spor | Neste handling | Publisering |
| --- | --- | --- | --- |
| Tøyen Trafo, apparatpult 1916 — Objects | `bilder/objects/toyen_trafo_apparatpult_1916_illustrasjon.svg`; Oslo byarkiv A-20138/Ua/0004/054 angitt i SVG | Prøveillustrasjon med mer materialitet og mindre diagramfølelse. Ikke utled eksakt antall brytere, farge eller plassering. Sammenhold med kildens gjenstandsbeskrivelse. | **Kun kandidat** inntil provenance, synlig illustrasjonsmerking og runtime-kontroll er oppfylt |
| Tøyen Trafo, transformatorkjerne 1918 — Objects | `bilder/objects/toyen_trafo_transformatorkjerne_1918_illustrasjon.svg`; Oslo byarkiv A-20138/Ua/0004/091 angitt i SVG | Separat illustrasjon av dokumentert gjenstandstype, uten å påstå eksakte viklinger/dimensjoner. | **Kun kandidat** |
| Freiasalen — Structures | `bilder/kort/structures/freiasalen.webp` | Kontroller kilde, tidsstatus, eksisterende bildekvalitet og eventuell behov for korrektiv; ikke erstatt blindt. | Uendret inntil kontroll |
| Schous bryggeri, portbygningen — Structures | `bilder/kort/structures/schous_bryggeri_portbygningen.webp` | Kontroller lesbarhet, utsnitt, kilde og dokumentert bygningsform. | Uendret inntil kontroll |
| VG — Brands | `bilder/kort/brands/vg_logo.svg` | Behold autentisk, kildeført identitet; kontroller bare runtime-plassering/lesbarhet hvis nødvendig. | Ingen KI-logo |
| Historiske brands uten autentisk ordmerke | `docs/BRAND_ASSETS.md` | Lag researchkø for ekte merke, skilt eller ordmerke fra arkiv; ingen syntetisk utfylling. | Holdback |

## Arbeidsmetode per bilde

1. Velg en **allerede identifisert** canonical samlingsmedlem; kontroller riktig entity-eier og eksisterende publisert asset.
2. Kontroller kilde og rettigheter. Marker *bevist*, *sannsynlig* og *ukjent* før illustrasjonsbrief skrives.
3. Lag kandidat i separat staging; aldri overskriv original i første omgang. Eventuell dokumentarisk logo skal ikke genereres.
4. Rediger kunstnerisk: særpreg, komposisjon, fysiske materialer, historisk lesbarhet, naturlig variasjon; unngå generisk KI-estetikk.
5. Registrer nøyaktig proveniens, bildeart, usikkerhetsgrense, lisens/rettighetsgrunnlag og reviewstatus.
6. Kontroller ingen brutte bildebaner, størrelser, mobil-/desktopvisning og at ingen illustrasjoner blir presentert som autentiske fotografier.
7. Publiser kun et faktisk gjennomgått asset med knyttet metadata. Først da kan samlingsmedlemmets bildegate godkjennes.

## Avgrensning for denne første PR-en

Dette er bare en kilde- og kvalitetskø. Ingen eksisterende bilde-, person-, steds- eller branddata er endret, ingen KI-logoer er produsert, og ingen visning er erklært ferdig. Neste leveranse må inneholde faktiske lokale bildekandidater, bildemetadata og kontroller før publisering.
