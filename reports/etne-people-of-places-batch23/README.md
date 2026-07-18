# Etne People of Places batch 23 — Anna Molden og Etne Tinghus

## Resultat

Batchen legg til éin namngjeven arkitekt med ei dokumentert skaparkopling til det kommunale rådhusbygget i Etne:

- `anna_molden` → `etne_tinghus`

## Arkitekturkjeldene

Store norske leksikon og Norsk kunstnerleksikon fører begge `Etne rådhus, Etne (1968)` blant dei utførte arbeida til Anna Molden / Anna Grønstad Molden.

Kjelder:
- https://snl.no/Anna_Molden
- https://nkl.snl.no/Anna_Molden

## Identitetsbrua til canonical place

History Go sitt canonical place heiter `etne_tinghus` og representerer Etne kommune sitt administrasjonsbygg.

Etne kommune omtalar den eksisterande bygningen som Tinghuset i dokumentasjonen av oppgraderinga i 2025–2026. Kommunen dokumenterer at rivefasen tømde bygget for veggar og vindauge, men lét sjølve bygningsskalet stå igjen. Brønnøysundregistrene fører Etne kommune med forretningsadresse Etne Tinghus og postadresse Sjoarvegen 2.

Kjelder:
- https://www.etne.kommune.no/aktuelt/oppgradering-av-tinghuset.15354.aspx
- https://virksomhet.brreg.no/nb/oppslag/enheter/959435375

Batchen brukar denne kjeldekombinasjonen til å knyte det historiske arkitektverket `Etne rådhus (1968)` til den kommunale bygningen som canonical-posten i dag representerer under Tinghus-namnet.

Dette er medvite formulert konservativt:

- Anna Molden blir berre kreditert for rådhusarbeidet frå 1968.
- Ho blir ikkje kreditert for rehabiliteringa i 2025–2026.
- Dei historiske arkitekturkjeldene oppgir ikkje dagens gateadresse.
- Namne- og bygningskontinuiteten er derfor dokumentert som ei eksplisitt kjeldekombinasjon, ikkje som eit direkte adressefunn frå 1968.

## Duplikatport

Før skriving vart fersk repo-state søkt etter:

- `anna_molden`
- `Anna Molden`
- `Anna Grønstad Molden`

Ingen eksisterande canonical people-identitet vart funnen.

## Kategori og år

- `category: politikk` følgjer det eksisterande canonical place-et `etne_tinghus`.
- `year: 1968` er året arkitekturkjeldene oppgir for Etne rådhus.

## Dekning

Etter batch 22 er Etne-dekninga 63 av 81 aktive stader, med 18 udekte. `etne_tinghus` står framleis på restlista.

Batch 23 skal dekkje eitt nytt fysisk place og gi 64/81 dersom hovudlinja ikkje endrar seg før merge.

## Integrasjonskontrakt

- `people/politikk/vestland/etne/people_etne_tinghus_batch1.json` skal stå nøyaktig éin gong i people-manifestet.
- `anna_molden` skal vere globalt unik ved normalisert ID-, namn- og variantkontroll.
- Personen skal berre peike på `etne_tinghus`.
- `tests/etne-people-of-places-batch23.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-, story-, UI-, bilete- eller quizdata.
