# Oslo koordinatkontroll – batch 25

Dato: 2026-07-19

Sju kontroller er fullført. Oslo Lysverkers dokumenterte hovedbygning i Sommerrogata 1 får et nytt kildebelagt adresseanker. Seks records avsluttes som `needs_review` fordi de er duplikater, lineære/arealmessige places uten tilstrekkelig geometri, eller institusjoner/historiske steder med uavklart fysisk scope.

| placeId | resultat | kilde / avgjørelse |
|---|---|---|
| `jernbanetorget_trafikknutepunkt` | needs_review | fysisk duplikat av `jernbanetorget` |
| `oslo_kraftselskap` | verified | `geonorge-adresser-v1:0301:16854:1` – Sommerrogata 1 |
| `grensen_kjopesenter` | needs_review | hele gaten krever flersegment-geometri/line anchors |
| `vippetangen_fisketorg` | needs_review | historisk fisketorg/fiskehavn er ikke identisk med uavklart 1890-record og dagens Fiskehallen-anker |
| `frysja_industriomrade` | needs_review | bredt område uten kildebelagt polygon/fleranker |
| `norges_varemesse` | needs_review | fler-lokasjons institusjon: Akershus, Sjølyst og Lillestrøm |
| `bryn_industriomrade` | needs_review | bredt industri-/utviklingsområde uten eksplisitt geometri |

## Metode

- Sommerrogata 1 og Akershusstranda 23 ble kjørt gjennom den normative Geonorge-finneren med output lagret via `tee`.
- Bare Sommerrogata 1 ble anvendt, etter identitetskontroll mot Oslo Lysverkers dokumenterte hovedbygning.
- Akershusstranda 23 ble ikke anvendt fordi den konkrete Fiskehallen ikke automatisk er identisk med den brede historiske Vippetangen-recorden.
- Grensen ble kontrollert som flersegment-gate; ingen enkelt OSM-way ble valgt som hele gaten.
- Frysja og Bryn ble behandlet som områder og får ikke punktverifisering uten polygon eller dokumentert fleranker.
- Norges Varemesse beholdes uendret til ett fysisk tidslag er valgt eller recorden splittes.
