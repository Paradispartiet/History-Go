# Regjeringskvartalet – Politikk-sted V1

- Dato: 2026-08-02
- Place ID: `regjeringskvartalet`
- Canonical place-fil: `data/places/politikk/oslo/places_politikk/regjeringskvartalet.json`
- Politikk-produksjonsrapport: `data/places/politikk-production/regjeringskvartalet.json`
- Leksikon: `data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json`
- Quiz: `data/quiz/politikk/regjeringskvartalet_sets.json`
- Primærkategori: `politikk`
- Produksjonsprofil: `narrow` – 3 sett × 7 spørsmål
- Status: **fase 2 – kildebelagt chronology og Historie-fane klar for review; stedet er ikke samlet produksjonsklart**

## Arbeidskort

| Felt | Status ved nullmåling |
| --- | --- |
| Hva place-objektet representerer | Det offisielle institusjonsområdet mellom Akersgata og Møllergata der Statsministerens kontor og departementer samles. Det er ikke synonymt med Høyblokka, ett departement, 22. juli-senteret, minnestedet eller den revne Y-blokka. |
| Kategori | `politikk` er riktig hovedidentitet fordi stedet primært er et fysisk område for utøvende statsmakt og sentralforvaltning. |
| Underbadges | `storting_og_regjering`, `politi_og_beredskap`, `velferd_og_institusjoner`; alle må beholdes bare så lenge category-/badgekontrollen fortsatt løser ID-ene og fagverksiden viser riktig sted. |
| Politikk-emner | `em_pol_byrakrati_forvaltning`, `em_pol_politi_sikkerhet_makt`, `em_pol_mediert_offentlighet`. |
| Politikk-evidens | Tre komplette kjeder finnes for samlokalisert forvaltning, sikkerhet/gjenoppbygging og offentlighet/minne. Rapporten skiller institusjon, kompetanse, vedtak, ressurs, gjennomføring, output og udokumentert langsiktig effekt. |
| Nåtidskontroll | `currentVerification.status: PASS`, kontrollert 2026-08-02 mot offisielle kilder om byggetrinn 1, minnestedet og 22. juli-senteret. |
| Koordinat | `verified_geometry`; deterministisk sentroid av den offisielle S-5100-planflaten. Høyblokka eller et tilfeldig adressepunkt brukes ikke som proxy for hele området. |
| Description-pakke | Canonical 4.2-pakke og Politikk-rapport er `ready`. `desc` og `popupDesc` ble senest synkronisert og kontrollert i PR #4659. |
| Hovedbilde | Gyldig eksternt `popupImage` finnes og bildebackloggen ble oppdatert i PR #4659. Nullmålingen finner ikke et dokumentert lokalt full-/kortbildepar som egen ferdig fase. |
| Leksikon | Fire manifestlastede artikler finnes. Hovedartikkelen er versjon 2 med tre fakta og tolv kildebelagte chronology-punkter fra 1883 til juli 2026. |
| Rundingsprofil | Fast `people · objects · brands`, med Badges ved overskriften. Wonderkammer-innhold skal ikke telles som ferdig Objects-runding. |
| People | Tolv canonicale personer er dokumentert ved stedet, med maksimalt to arkitekter og flertall av faktiske brukere, beslutningstakere, kunst-/ingeniøraktører og hendelsespersoner. Dekningen ble låst i PR #3604. |
| Objects | Ingen ferdig canonical Objects-pakke for rundingen er dokumentert. `Grass Roots Square` finnes som Wonderkammer-oppføring, men er ikke dermed et validert Object-kort. `Fiskerne`, `Måken`, minnestedet og andre fysiske kandidater må identitets-, kilde-, plassering- og bildeauditeres før bruk. |
| Brands | Ingen kvalifiserende canonical Brand-runding med dokumentert stedskobling er funnet i nullmålingen. Departementer, Statsbygg, arkitektkontorer og kunstnere skal ikke brukes som filler. |
| Quiz | Full 3×7-pakke med 21 spørsmål. De første to settene gir 14 ordinære spørsmål; sett 3 bærer teori-/metodefordypning. |
| Knowledge | 21 eksplisitte Knowledge-ID-er er materialisert og synkronisert. Alle spørsmål er stedsskopet og har emne-, begreps- og kunnskapskoblinger. |
| Stories | Tre canonicale `episode_v1`-fortellinger er narrativt revidert: «Staten leter etter et hjem», «Kunst støpt inn i staten» og «Etter bomben». |
| Før/etter | Ingen canonical og lisenskontrollert bildepakke er funnet. |
| Nyheter | Ingen daterte `news_note`-records for stedet er funnet i den manifestlastede Leksikon-filen. |
| Lesespor | `data/lesespor/oslo/lesespor_oslo_politikk.json` har ingen oppføring med `place_ids: ["regjeringskvartalet"]`. |
| Brukerrettede kilder | Place og Leksikon har flere offisielle lenker, men ingen separat, deduplisert og fasegodkjent Kilder-flate med grupper, navn, kildebruk og avgrensninger er dokumentert. |
| Mer | Tematiske Leksikon-artikler finnes, men ingen fasegodkjent pakke med Språkleksikon, observasjon/betydning/motpunkt eller eksplisitt begrunnet N/A for de øvrige Mer-komponentene. |
| Fagverk-sted | Regjeringskvartalet har kuratert stedsside og relevante Politikk-linser. Den canonicale URL-en og synlig UI må kontrolleres på nytt i sluttfasen. |

## Canonical identitetsgate

Nullmålingen finner ingen grunn til å opprette et nytt sted eller endre place-ID-en.

`regjeringskvartalet` skal representere **det samlede institusjonsområdet i den offisielle planavgrensningen**, ikke:

- Høyblokka alene;
- G-blokka, A-blokka, D-blokka eller C-blokka alene;
- Statsministerens kontor eller ett departement som organisasjon;
- 22. juli-senteret;
- det nasjonale minnestedet;
- den tidligere Y-blokka;
- terrorangrepet 22. juli 2011 som hendelse løsrevet fra stedet;
- hele den norske regjeringen eller statsforvaltningen som abstrakt institusjon.

Bygg, kunstverk, minnefunksjoner og institusjoner kan kobles til området når egen identitet og fysisk tilknytning beholdes presist.

## Politikk-nullmåling etter stedsgaten

| Gate | Status | Nullmåling |
| --- | --- | --- |
| Hovedfunksjon | PASS | Stedet er presist avgrenset som fysisk kjerneområde for regjering og departementer. |
| Canonicale emner | PASS | Tre `em_pol_*` er eksplisitt begrunnet med stedsspesifikke evidenskjeder. |
| Institusjon og kompetanse | PASS | Regjeringen, Statsministerens kontor, departementene og Statsbygg er skilt etter rolle i de relevante kjedene. |
| Regel, beslutning og ressurs | PASS | Reguleringsvedtak, byggetrinn, sikring, bygg og kontrollfunksjoner er dokumentert. |
| Gjennomføring og output | PASS | Innflytting, åpning 13. april 2026, minnested 19. juli 2026 og permanent 22. juli-senter 22. juli 2026 er dokumentert. |
| Outcome/inferensgrense | PASS | Rapporten hevder ikke målt bedre styring, redusert sikkerhetsrisiko, økt tillit eller læring uten dokumentasjon. |
| Nåtidskontroll | PASS | Aktive og planlagte forhold er kontrollert 2026-08-02. |
| Quizåpning | PASS | 14 ordinære spørsmål kommer før teori-/metodefordypningen. |

## Popup-nullmåling

| Fane | Status | Begrunnelse |
| --- | --- | --- |
| Om | PASS – eksisterende grunnlag | Canonical identitet, Politikk-rapport, 4.2-dekket `desc`/`popupDesc`, hovedartikkel, kilder og gyldig eksternt popupbilde er på plass. |
| Historie | PASS – fase 2 | Tolv kildebelagte chronology-punkter følger samlokaliseringsforsøk, bygg, utvidelser, terrorangrep, gjenoppbygging og åpningene i 2026. Punktene er korte hendelsesrecords og erstatter ikke de tre narrative Stories. |
| Fortellinger | PASS – PR #4428 | Tre ulike narrative akser er konsolidert og reviewet mot `episode_v1`; de dupliserer ikke bare en datooversikt. |
| Før/etter | MANGLER | Ingen canonical bildeparpakke med samme identitetsanker, rettigheter, attribusjon og eksplisitt inferensgrense er funnet. |
| Nyheter | MANGLER | Ingen stedsspesifikke `news_note`-records finnes. |
| Lesespor | MANGLER | Ingen manifestlastede Lesespor peker til `regjeringskvartalet`. |
| Kilder | DELVIS / IKKE GODKJENT | Kilder finnes i place-, rapport-, Story- og Leksikon-data, men den brukerrettede flaten er ikke separat kuratert, deduplisert og fasegodkjent. |
| Mer | DELVIS / IKKE GODKJENT | Fire tematiske artikler gir innhold, men Mer-fanens egne kontrakter og eiergrenser er ikke ferdig vurdert. |

## Rundings- og progresjonsnullmåling

| Fase | Status | Begrunnelse |
| --- | --- | --- |
| Quiz og Knowledge | PASS – PR #4664 | 21 spørsmål, 14-spørsmåls normalåpning, teori/metode i sett 3 og 21 eksplisitte Knowledge-enheter. |
| People | PASS – PR #3604 | Tolv dokumenterte canonicale personer og eksplisitt rollebalanse med maksimalt to arkitekter. |
| Objects | IKKE STARTET | Ingen canonical bildeklare Object-kort er dokumentert for rundingen. |
| Brands | IKKE STARTET / mulig N/A | Ingen kvalifiserende Brand er dokumentert; N/A kan bare godkjennes etter eksplisitt research og audit. |
| Badges/fagverk | DELVIS | Data og kuratert fagverk finnes, men sluttfasen må kontrollere faktisk badgegrafikk, klikk og stedsside i UI. |

## Sanerings- og produksjonsplan

### Behold

- canonical place-ID, områdeidentitet, source-fil og offisiell plangeometri;
- `politikk` som hovedkategori, de tre underbadgene og de tre Politikk-emnene, forutsatt fortsatt runtimekontroll;
- de tre evidenskjedene og deres eksplisitte inferensgrenser;
- revidert `desc`, `popupDesc`, Politikk-produksjonsrapport og eksternt popupbilde;
- den kildebelagte chronology-pakken med tolv avgrensede hendelser;
- de tre narrative Stories;
- full 3×7 Quiz og Knowledge-materialisering;
- de tolv dokumenterte People-koblingene;
- fire Leksikon-artikler som innholdsgrunnlag.

### Revider eller bygg separat

- Før/etter med kontrollert historisk og nyere bilde av samme område/anker;
- Nyheter med daterte nåtidsrecords og tydelig skille mellom gjennomført, pågående og planlagt;
- Lesespor med åpne, komplementære `link_only`-kilder;
- Kilder som deduplisert og brukerrettet flate;
- Mer med Språkleksikon og avgrensede observasjon-/betydning-/motpunktspor, eller begrunnet N/A;
- Objects bare for fysiske elementer som kan identifiseres, lokaliseres, kildebelegges og vises korrekt;
- Brands bare dersom en faktisk canonical merke-/virksomhetsidentitet oppfyller rundingkontrakten.

### Hold tilbake

- langsiktig effekt på styringskvalitet, sikkerhetsrisiko, tillit, demokratisk deltakelse eller læring uten måling;
- departementer, etater, arkitektkontorer eller kunstnere som Brand-filler;
- hele bygninger, minnested eller 22. juli-senteret som om de var synonymer for parent-place;
- Wonderkammer-oppføringer som automatisk bevis på ferdige Object-kort;
- generelle Oslo-, regjering- eller 22. juli-lenker uten egen stedsspesifikk funksjon;
- interne rapporter og audits i brukerrettede Kilder.

## Faseplan

Bare én fase kan være aktiv om gangen. En godkjent fase skal merges og kontrolleres på fersk `main` før neste starter.

| Fase | Leveranse | Status |
| --- | --- | --- |
| 0 | Nullmåling, identitetsgate og saneringsplan | **GODKJENT – PR #4665, merge `c00d94430ea82da5afb4f0e1b10ead2b504f6ff8`** |
| 1 | Kildebank, Politikk-rapport, description 4.2, bilde og Om | **EKSISTERENDE GRUNNLAG PASS – #4353, #4368, #4408 og #4659; slutt-UI gjenstår** |
| 2 | Kildebelagt chronology og Historie-fane | **KLAR FOR REVIEW** |
| 3 | Story-review og episodeproduksjon | **GODKJENT – PR #4428** |
| 4 | Før/etter | **NESTE AKTIVE FASE ETTER MERGE AV FASE 2** |
| 5 | Nyheter | IKKE STARTET |
| 6 | Lesespor | IKKE STARTET |
| 7 | Brukerrettede Kilder | IKKE STARTET |
| 8 | Mer | IKKE STARTET |
| 9 | Quizåpning 2 × 7 og Knowledge | **GODKJENT – PR #4664, merge `94cdc10e328b216dd374179fa5c12bf250def50e`** |
| 10 | People | **GODKJENT – PR #3604** |
| 11 | Objects | IKKE STARTET |
| 12 | Brands | IKKE STARTET / mulig begrunnet N/A |
| 13 | Badges, fagverk, alle åtte popupfaner, rundinger og full UI-/produksjonsaudit | IKKE STARTET |

## Resultat i fase 2

- Hovedartikkelen er løftet fra versjon 1 til versjon 2.
- Chronology er utvidet fra seks til tolv unike, kildebelagte hendelser.
- Den tidligere åpningen i 1906 er supplert med departementsinnflyttingen i 1883, konkurransene 1887–1891, den resultatløse konkurransen i 1939 og omjuryeringen i 1946.
- Utbyggingen etter 1969 er samlet i ett avgrenset 1978–2012-punkt i stedet for å skape en rekke mekaniske byggeposter.
- 2011, riving/byggestart 2020–2021, åpningen 13. april 2026 og åpningene 19. og 22. juli 2026 er holdt som separate hendelser.
- Alle chronology-punkter har minst én inspectable HTTPS-kilde; elleve av tolv bruker en offisiell `regjeringen.no`-kilde, mens terrorpunktet også har SNL som supplerende kontroll.
- De tre Story-filene er urørt. Chronology svarer på hva og når; Stories beholder årsak, konflikt, aktører og konsekvens som narrativ akse.
- Senere byggetrinn og framtidig ferdigstillelse er ikke gjort til gjennomførte chronology-hendelser.

## Neste aktive fase

Etter at fase 2 er merget og kontrollert på faktisk `main`, starter **fase 4: Før/etter**.

Fasen skal:

1. finne et historisk og et nyere bilde som faktisk viser samme identifiserbare del av Regjeringskvartalet;
2. kontrollere lisens, attribusjon, filproveniens og synlig årstall;
3. beskrive observerbar endring uten å late som ett bildepar dokumenterer hele kvartalets transformasjon;
4. skille bildeobservasjon fra tolkning om stat, sikkerhet, vern og byrom;
5. endre bare canonical place-data, nødvendige bilde-/attribusjonsfiler, arbeidskort og målrettet regresjon.

## Samlet status etter fase 2

Regjeringskvartalet har et sterkt faglig grunnlag, men er **ikke produksjonsklart etter den canonicale sted-for-sted-checklista**. Om-grunnlag, Historie, Stories, Quiz/Knowledge og People er nå produsert eller reviewet. Før/etter, Nyheter, Lesespor, brukerrettede Kilder, Mer, Objects, Brands og sluttkontroll av Badges, fagverk og faktisk UI står fortsatt åpne.
