# Oslo koordinatkontroll – batch 23

Dato: 2026-07-19

Sju kontroller er fullført. Tre konkrete fysiske steder er godkjent med entydige Geonorge-adresseankre og dokumentert identitetskilde. Fire records står som needs_review på grunn av duplikat, feil kommune eller manglende entydig fysisk scope.

| placeId | resultat | kilde / avgjørelse |
|---|---|---|
| `vinmonopolet_lager` | verified | `geonorge-adresser-v1:0301:12723:16` |
| `nrk_marienlyst` | needs_review | duplikat av `nrk_huset_marienlyst` |
| `jernbaneverkstedet_lodalen` | verified | `geonorge-adresser-v1:0301:11370:2` |
| `grunnlovsbygget_bankplassen` | verified | `geonorge-adresser-v1:0301:10412:3` |
| `fornebu_teknologipark` | needs_review | feil Oslo-geografi + bredt område uten entydig objekt |
| `ulven_handelspark` | needs_review | ingen stabil dokumentert fysisk entitet med dette navnet |
| `akershus_energi` | needs_review | selskap med flere Akershus-anlegg, ikke ett Oslo-anlegg |

## Koordinatavgjørelser

- Vinmonopolets historiske sentralanlegg flyttes fra det gamle feilpunktet til den dokumenterte adressen Haslevangen 16.
- Lodalen verksted flyttes til Bane NORs dokumenterte verkstedsadresse Dyvekes vei 2. Radiusen beholdes fordi stedet er et større jernbaneanlegg.
- Den gamle Norges Bank flyttes fra et eldre manuelt kontrollpunkt til det offisielle adressepunktet Bankplassen 3.
- Ingen koordinater endres for de fire needs_review-recordene.
