# Minneparken – konkret ferdigstillingskontroll 11. november 2026

## Omfang og beslutning

Teknisk integrasjon av PR #6966 med et navngitt main-snapshot, ikke en
redaksjonell publiseringsgodkjenning. Ingen feltobservasjon eller uavhengig
review er utført eller signert på vegne av andre.

- Opprinnelig PR-head: `3a9badc815caa8677c865c831b79cd835f87e069`.
- Testet main-snapshot: `1a3c2a4f812a28fa7207b1e28338c4bdc5e34089`.
- Integrasjonscommit: `220bd335ae0fc756497a25a253b6fc44f2e7718f`.
- Integrasjonstre: `fa7235bf04a59f88c1a5cd982228ddc4a2822c04`, identisk lokalt og i GitHub.
- Main-snapshotet har 342 commits som ikke ligger i opprinnelig draft-head.
- Isolert nettleserkjøring: https://github.com/Paradispartiet/History-Go/actions/runs/43014800965

## Faktisk gjennomført

Fem mergekonflikter er løst. Epokeindeks, Fagverk-release og Place-indeks er
regenerert fra det kombinerte kildetreet. Språkmanifestet er slått sammen
uten å miste Minneparken, Tøyen hovedgård, Tveten gård eller Trosterudvillaen.
Bildebackloggens aggregater og kategorifordeling er beregnet på nytt fra
hele bildeauditen, i stedet for å velge en av de motstridende gamle tellingene.

De eksisterende foreslåtte rettelsene fra #7028/#7034 for By-originaler og
WebP-lokaler er integrert i testgrunnlaget. Verifikasjonsskriptet for
Byplanlegging er i tillegg oppdatert til å godta senere originaler bare i
canonical rekkefølge og på eksakte filstier. Ingen bildebytes, hashkrav,
alpha- eller dimensjonskrav er endret. Grini-testrettelsen fra #7159 er
integrert uten produksjonskodeendringer eller økte timeouter.

## Lokale kontroller

| Kontroll | Resultat |
| --- | --- |
| TypeScript build:tools og build:scripts | PASS |
| Minneparken-kilder, bildeproveniens, Knowledge, quiz/QuizCard, Story og epokeindeks | 41/41 PASS |
| Samtidsarkitektur og Byplanlegging | 4/4 PASS, separat verifikasjonsskript PASS |
| Historie-validatorens kontrakter, bildetekst og stabil QuizCard-hydrering | 16/16 PASS |
| Place-indeks, 1 538 Place-open-payloads, epokeindeks og Fagverk-release determinisme | PASS |
| Canonical Knowledge --check | 0 kontraktsfeil; 4 707 eksisterende spørsmålsadvarsler og 451 uløste emnekoblinger er ikke godkjent som rettet |
| Full bildeaudit og samsvar med backlog-summary | 1 538 steder: 216 lokale, 142 eksterne, 79 valgfrie, 1 101 manglende, 0 ugyldige |
| Diff-whitespace mot det testede main-snapshotet | PASS |
| Historie-publiseringsport | FAIL: blocked og F=N/A, to eksplisitte feil |
| Lokal Chrome-start | Ikke kjørt ferdig: kjøremiljøet avviser nettleserens socket-opprettelse; dette er ikke app-PASS |

Bildeauditen dekker hele katalogen; de 1 101 manglende bildene er ikke
tilskrevet Minneparken. Historiske Minneparken-bildebytes og synlig datert
proveniens består egne kontrakttester. Et historisk bilde fra 2007 er fortsatt
ikke bevis for fysisk tilstand i 2026.

## Ny kildesjekk

Følgende faktiske sider er åpnet 11. november 2026:

- [Oslo kommunes Minneparken-side](https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/): beskriver fortsatt tilretteleggingen som planlagt; dokumenterer ikke ferdigstillelse i 2026.
- [Kulturetatens pressemelding 26. mars 2026](https://www.mynewsdesk.com/no/kulturbyen-oslo/pressreleases/pilegrim-i-oslo-opplev-byen-som-en-moderne-pilegrim-3440057): inviterer til vandring og skiltavduking i Minneparken 30. mars. Den dokumenterer en invitasjon, ikke at arrangementet faktisk fant sted eller plen, gangsti, universell tilgang og sikring var ferdige.

Denne nye 2026-kilden løser derfor ikke F. Ingen kilde er ommerket til
feltbefaring, og ingen review-signatur er oppdiktet.

## Seksdelt kvalitetsvurdering

Dette er en foreløpig vurdering av hele leveransen, ikke bare kodepakken.

| Dimensjon | Score | Evidens og begrensning |
| --- | --- | --- |
| Korrekthet og evidens | 4/5 | Kilde-/fasitparitet og proveniens består; usikker 2026-status er eksplisitt beholdt. |
| Dekning og ferdigstillelse | 2/5 | Feltbevis, uavhengige godkjenninger og publiseringsaktivering mangler. |
| Faglig/redaksjonell kvalitet | 3/5 | Kildebundet innhold og struktur er kontrollert, men uavhengig redaksjonell sluttkontroll foreligger ikke. |
| Teknisk integritet | 3/5 | 61 lokale tester og determinismekontroller består; ny samkjørt nettleser-QA og full endelig PR-CI er fortsatt under kontroll. |
| Sikkerhet og ansvarlighet | 4/5 | Ingen feilaktig fysisk besøksregistrering eller falske felt-/review-godkjenninger introdusert; manifestene er inaktive. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Pinet grunnlag, identiske Git-trær, permanente testkrav og eksakte kildehenvisninger. |

Sum: **20/30**. Hele Minneparken-leveransen er **ikke ferdig, ikke
publiseringsklar og ikke klassifisert som høy kvalitet** etter repoets
sluttport. Dette kan ikke omgjøres med en automatisk ferdigmelding.

## Reelle gjenstående leveranser

1. Datert og etterprøvbar fysisk tilstand i 2026, vurdert av fagansvarlig.
2. Faktisk separat stående `frontImage` med proveniens. Kilden har fremdeles bare historisk liggende `image` og legacy `cardImage`; ingen `frontImage`. Den grønne historiske bildetestingen godkjenner ikke full bildekontrakt.
3. Full READ-FIRST-/rule-preflight og kildebundet samlingsproduksjon. Kilden har ingen `place_card_profile`; People/Objects/Brands/historiske hendelser er ennå ikke materialisert som en komplett profil. Et kandidatnavn eller en legacy-visning er ikke ferdig samling.
4. Selvstendig gjennomgang av alle 21 quizspørsmål, ti QuizCard-spørsmål og Knowledge-kildene.
5. Selvstendig narrativ godkjenning av Story, med faktisk navn og dato.
6. Kodegjennomgang og full ordinær CI på den endelige integrerte PR-headen.
7. Først deretter dokumentert aktivering, slutt-QA og merge etter gjeldende kontrakter.

Kravene ligger i [issue #7068](https://github.com/Paradispartiet/History-Go/issues/7068).
