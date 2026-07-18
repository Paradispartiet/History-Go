# Etne People of Places batch 19 — Halfdan Greve ved Litledalen kraftverk

## Resultat

Batchen legg til éin namngjeven person med ei eksplisitt dokumentert fysisk prosjektrolle ved eitt tidlegare udekt Etne-kraftverk:

| peopleId | person | fysisk hovudanker | dokumentert fysisk kopling |
|---|---|---|---|
| `halfdan_greve` | Halfdan Greve | `litledalen_kraftverk` | Grannar dokumenterer Greve som byggeleiar då Haugesund kommune sette i gang bygginga av kraftverket i 1916. |

## Fersk dekningsstatus

Etter merge av batch 18 var Etne-dekninga 59 av 81 aktive stader, med 22 udekte stader. `litledalen_kraftverk` stod framleis på restlista.

Batch 19 dekkjer eitt nytt fysisk place og bør derfor, dersom ingen parallelle Etne-place-endringar kjem inn før merge, flytte dekninga til 60/81 og restgjelda til 21.

## Kjeldegrunnlag

Grannar si historiske gjennomgang av kraftutbygginga i Etne seier uttrykkeleg at Haugesund kommune ved byggeleiar Halfdan Greve sette i gang bygginga av Litledalen kraftverk i 1916. Etter fire års byggetid stod kraftverket ferdig i 1920.

NVE si vannkraftdatabase stadfestar Litledalen som kraftverk i Etne og oppgir 1920 som opphavleg driftsår.

Kjelder:
- https://www.grannar.no/nyhende/i-mal-med-omfattande-oppgradering/516543
- https://www.nve.no/energi/energisystem/vannkraft/vannkraftdatabase/vannkraftverk/?id=248

## Streng utvalsport

- Greve blir ikkje teken inn berre fordi han var ingeniør eller offentleg tenestemann; kjelda namngir han direkte som byggeleiar for dette konkrete anlegget.
- `year: 1916` er byggjestarten som kjelda knyter direkte til rolleformuleringa, ikkje driftsåret 1920.
- Kortet påstår ikkje at Greve åleine planla, finansierte eller utførte heile utbygginga.
- Hardeland kraftverk blir ikkje lagt til i same batch fordi dei brukte kjeldene ikkje gir ein tilsvarande namngitt historisk prosjektperson med eksplisitt fysisk rolle.

## Duplikatport

Før skriving vart fersk repo-state søkt etter:

- `halfdan_greve`
- `Halfdan Greve`

Det vart ikkje funne nokon eksisterande canonical people-identitet.

Batchtesten skal i tillegg kontrollere normalisert ID, namn og utvalde variantar på tvers av heile people-manifestet etter integrasjon.

## Integrasjonskontrakt

- `people/naeringsliv/vestland/etne/people_litledalen_kraftverk_batch1.json` skal stå nøyaktig éin gong i people-manifestet.
- `halfdan_greve` skal vere globalt unik ved normalisert ID-, namn- og variantkontroll.
- Personen skal berre peike på `litledalen_kraftverk`.
- `tests/etne-people-of-places-batch19.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-, story-, UI-, bilete- eller quizdata.
