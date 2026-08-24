# Bankplassen – final completion audit v1

Dato: 2026-08-24

## Konklusjon

Bankplassen er fullprodusert som enkeltsted under Content Factory Pilot 03. Leveransen beskriver plassflaten presist, viser nabobyggene som separate relasjoner, og fyller PlaceCards faste firefeltskontrakt med `people`, `objects`, `brands` og `related`.

## Dekning

| Område | Resultat |
| --- | --- |
| Identitet og koordinat | Navngitt plassgeometri; fire nabosteder ekskludert som egne eiere |
| Kilder og claims | 15/15 verifiserte claims; 21/21 synlige setninger dekket |
| Popup | Seks redigerte avsnitt, fem historielag, før/nå og kildeattribusjon |
| Entiteter | Johannes Brun, fire fysiske Objects, Engebret Café og fire Related; falske byggankre fjernet |
| Quiz/Knowledge | 5×7; 35/35 unike og Knowledge-koblede spørsmål |
| Stedshandling | Konkret observasjonsoppgave uten placeholder |
| PlaceCard | Full 2×2-layout: én People-sirkel og tre rektangler; ingen Bildesamling eller oppdiktet innhold |

## Strenge N/A-beslutninger

- Ingen ny Story på plassflaten: de sterke hendelsene eies av separate byggesteder.
- Ingen byggarkitekter lånes inn til plassflaten: Johannes Brun kvalifiserer gjennom det fysiske monumentet på Bankplassen.
- Brands-reserven bruker bare den dokumenterte Engebret Café-koblingen og oppgir korrekt antall.
- Ingen egen natur- eller språkprofil uten stedsspesifikt kildegrunnlag.
- Ingen nyhetsfyll basert på flyktige arrangementer eller leietakere.

## Seksdelt kvalitetsport

| Dimensjon | Score | Evidens |
| --- | ---: | --- |
| Korrekthet og evidens | 5/5 | Claim-/setningsspor, institusjonelle kilder og eksplisitt eiergrense |
| Dekning og ferdigstillelse | 5/5 | Hele workcardet kontrollert; N/A er begrunnet, ikke utelatt |
| Faglig/redaksjonell kvalitet | 5/5 | Ett styrende grep, stedsspesifikk tekst og ingen generisk quizfiller |
| Teknisk integritet | 5/5 | Schema-, Quiz-, Knowledge-, PlaceCard-, index-, build- og UI-porter kreves grønne |
| Sikkerhet og ansvarlighet | 4/5 | Ingen personvern-/høyrisikodomene; bilde- og kildegrenser er eksplisitte |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical data, produksjonspakke, brief, kontekst og målrettet regresjonstest |
| **Totalt** | **29/30** | **Høy kvalitet når de oppførte sluttportene er grønne** |

Automatiske tester kan bevise struktur, binding og rendering, men ikke historisk sannhet alene. Den redaksjonelle kontrollen er derfor gjort mot de oppførte kildene og med separate canonical eiere som hovedgrense.
