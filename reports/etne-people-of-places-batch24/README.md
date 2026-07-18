# Etne People of Places batch 24 — Johannes Hundseid ved Fikse skytebane

## Resultat

Batchen legg til éin namngjeven skyttar med ei eksplisitt dokumentert konkurranseprestasjon ved `fikse_skytebane`:

- `johannes_hundseid`

## Kjeldegrunnlag

Grannar dokumenterer Fiksestemnet 2013 som eit stort stemne på Fikse med 211 deltakarar. I klasse 3–5 vann Johannes Hundseid frå Etne med 345 poeng. Artikkelen seier også at stemnet var generalprøve før Hordastemnet som skulle arrangerast på Fikse.

Kjelde:
- https://www.grannar.no/sport/johannes-hundseid-til-topps/132188

## Fysisk people-port

Koplinga byggjer på ei konkret, stadfesta konkurransehending ved den canonical skytebanen. Hundseid blir ikkje teken inn berre fordi han var medlem av eit lokalt skyttarlag eller fordi han deltok i skytesport generelt.

## Duplikatport

Før skriving vart fersk repo-state søkt etter:

- `johannes_hundseid`
- `Johannes Hundseid`

Ingen eksisterande canonical people-identitet vart funnen.

Batchtesten skal i tillegg kontrollere normalisert ID, namn og utvalde variantar på tvers av heile people-manifestet etter integrasjon.

## År og kategori

- `year: 2013` viser den dokumenterte Fiksestemne-sigeren.
- `category: sport` følgjer det eksisterande canonical place-et `fikse_skytebane`.

## Dekning

Etter batch 23 er Etne-dekninga 64 av 81 aktive stader, med 17 udekte. `fikse_skytebane` står framleis på restlista.

Batch 24 skal dekkje eitt nytt fysisk place og gi 65/81 dersom hovudlinja ikkje endrar seg før merge.

## Integrasjonskontrakt

- `people/sport/vestland/etne/people_fikse_skytebane_batch1.json` skal stå nøyaktig éin gong i people-manifestet.
- `johannes_hundseid` skal vere globalt unik ved normalisert ID-, namn- og variantkontroll.
- Personen skal berre peike på `fikse_skytebane`.
- `tests/etne-people-of-places-batch24.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-, story-, UI-, bilete- eller quizdata.
