# Oslo koordinatkontroll – batch 25

Dato: 2026-07-19

Kontroll 154–160 er fullført. Ingen av de sju aktive recordene kan få et nytt verified coordinate contract uten først å løse identitet, objekttype eller områdegeometri. Ingen place-koordinater er derfor endret.

| placeId | resultat | hovedkonflikt |
|---|---|---|
| `jernbanetorget_trafikknutepunkt` | needs_review | fysisk duplikat av canonical `jernbanetorget` |
| `oslo_kraftselskap` | needs_review | institusjon/system uten ett entydig fysisk place-scope |
| `grensen_kjopesenter` | needs_review | gate feilmodellert som kjøpesenter/knutepunkt; mangler lineær geometri |
| `vippetangen_fisketorg` | needs_review | feil tidslinje og sammenblanding av fiskehavn, marked og Fiskehallen |
| `frysja_industriomrade` | needs_review | bredt område uten kildebelagt geometri/area-ankre |
| `norges_varemesse` | needs_review | institusjon blandet med revet historisk Sjølyst-venue |
| `bryn_industriomrade` | needs_review | bredt, uavgrenset industriområde uten geometri/area-ankre |

## Kilder og metode

- Canonical overlap-audit mot eksisterende `jernbanetorget`.
- Oslo byleksikon: Oslo Lysverker, Grensen, Fiskehallen/Vippetangen, Norges Varemesse og Bryn.
- Oslo kommune: Frysja-området som transformasjonsområde.
- Ingen nærmeste-punkt-, midpoint- eller adressegjetting er brukt.
