# Grev Wedels plass – final completion audit v1

Dato: 2026-08-24

## Konklusjon

Grev Wedels plass er fullprodusert som tredje enkeltsted i Content Factory Pilot 03. Leveransen beholder parken som canonical eier, gir PlaceCard et ekte frontbilde og fyller den faste firefeltskomposisjonen med People, Objects, Brands-fallback og Related.

## Dekning

| Område | Resultat |
| --- | --- |
| Identitet og koordinat | Navngitt OSM-parkgeometri; nabobygg eksplisitt ekskludert |
| Kilder og claims | 9/9 verifiserte produksjonsclaims og full setningsbinding |
| Popup og media | Seks avsnitt, fem historielag, før/nå og kontrollert Commons-attribusjon |
| Entiteter | Herman Wedel Jarlsberg, tre fysiske parkobjekter og fire canonical relasjoner |
| Quiz/Knowledge | 5×7; 35/35 spørsmål er Knowledge-koblet |
| Stedshandling | Konkret observasjon av fontene, kunst, ganglinjer og eiergrense |
| PlaceCard | Én People-sirkel + Objects, Brands og Related som rektangler; ingen svart medieflate |

## Strenge N/A-/fallback-beslutninger

- Ingen oppdiktet Brand: Oslo Byes Vel mangler kvalifisert brandprofil og lokal logo i registeret.
- Ingen oppdiktede Place-ID-er for Gamle Logen eller Militærhospitalet.
- Ingen egen Story når parkens dokumenterte lag allerede bæres av popup, Objects, før/nå og quiz.
- Brands-feltet er visuelt komplett gjennom systemets ærlige ikonfallback, uten falskt antall eller falsk logo.

## Seksdelt kvalitetsport

| Dimensjon | Score | Evidens |
| --- | ---: | --- |
| Korrekthet og evidens | 5/5 | Institusjonelle kilder, fersk 2026-kontroll og eksplisitt eiergrense |
| Dekning og ferdigstillelse | 5/5 | Alle checkpoints er fullført eller begrunnet N/A/fallback |
| Faglig/redaksjonell kvalitet | 5/5 | Parkrommet styrer teksten; nabobygg og organisasjoner overtas ikke |
| Teknisk integritet | 5/5 | Deterministisk quiz, Knowledge, index, runtime og målrettet regresjon |
| Sikkerhet og ansvarlighet | 4/5 | Ingen høyrisikodomene; lisens og kildegrenser er eksplisitte |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Canonical data, produksjonspakke, brief, kontekst, audit og test |
| **Totalt** | **29/30** | **Klar for merge når obligatorisk CI er grønn** |

Automatiske porter verifiserer struktur og runtime, mens den redaksjonelle faktakontrollen er gjort mot kildene oppført i produksjonspakken.
