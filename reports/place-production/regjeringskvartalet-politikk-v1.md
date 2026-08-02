# Regjeringskvartalet – Politikk-sted V1

- Dato: 2026-08-02
- Place ID: `regjeringskvartalet`
- Canonical place-fil: `data/places/politikk/oslo/places_politikk/regjeringskvartalet.json`
- Politikk-produksjonsrapport: `data/places/politikk-production/regjeringskvartalet.json`
- Leksikon: `data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json`
- Quiz: `data/quiz/politikk/regjeringskvartalet_sets.json`
- Primærkategori: `politikk`
- Produksjonsprofil: `narrow` – 3 sett × 7 spørsmål
- Status: **fase 6 – fire godkjente Lesespor klare for review; stedet er ikke samlet produksjonsklart**

## Arbeidskort

| Felt | Status |
| --- | --- |
| Hva place-objektet representerer | Det offisielle institusjonsområdet mellom Akersgata og Møllergata der Statsministerens kontor og departementer samles. Det er ikke synonymt med Høyblokka, ett departement, 22. juli-senteret, minnestedet eller den revne Y-blokka. |
| Kategori | `politikk` er riktig hovedidentitet fordi stedet primært er et fysisk område for utøvende statsmakt og sentralforvaltning. |
| Underbadges | `storting_og_regjering`, `politi_og_beredskap`, `velferd_og_institusjoner`; alle må beholdes bare så lenge category-/badgekontrollen fortsatt løser ID-ene og fagverksiden viser riktig sted. |
| Politikk-emner | `em_pol_byrakrati_forvaltning`, `em_pol_politi_sikkerhet_makt`, `em_pol_mediert_offentlighet`. |
| Politikk-evidens | Tre komplette kjeder finnes for samlokalisert forvaltning, sikkerhet/gjenoppbygging og offentlighet/minne. Rapporten skiller institusjon, kompetanse, vedtak, ressurs, gjennomføring, output og udokumentert langsiktig effekt. |
| Nåtidskontroll | `currentVerification.status: PASS`, kontrollert 2026-08-02 mot offisielle kilder om byggetrinn 1, minnestedet og 22. juli-senteret. |
| Koordinat | `verified_geometry`; deterministisk sentroid av den offisielle S-5100-planflaten. Høyblokka eller et tilfeldig adressepunkt brukes ikke som proxy for hele området. |
| Description-pakke | Canonical 4.2-pakke og Politikk-rapport er `ready`. `desc` og `popupDesc` ble senest synkronisert og kontrollert i PR #4659. |
| Hovedbilde | Gyldig eksternt `popupImage` finnes og bildebackloggen ble oppdatert i PR #4659. |
| Leksikon | Fire tematiske artikler og to `news_note`-records finnes. Hovedartikkelen er versjon 2 med tre fakta og tolv kildebelagte chronology-punkter fra 1883 til juli 2026. |
| Rundingsprofil | Fast `people · objects · brands`, med Badges ved overskriften. Wonderkammer-innhold skal ikke telles som ferdig Objects-runding. |
| People | Tolv canonicale personer er dokumentert ved stedet, med maksimalt to arkitekter og flertall av faktiske brukere, beslutningstakere, kunst-/ingeniøraktører og hendelsespersoner. Dekningen ble låst i PR #3604. |
| Objects | Ingen ferdig canonical Objects-pakke for rundingen er dokumentert. `Grass Roots Square` finnes som Wonderkammer-oppføring, men er ikke dermed et validert Object-kort. `Fiskerne`, `Måken`, minnestedet og andre fysiske kandidater må identitets-, kilde-, plassering- og bildeauditeres før bruk. |
| Brands | Ingen kvalifiserende canonical Brand-runding med dokumentert stedskobling er funnet. Departementer, Statsbygg, arkitektkontorer og kunstnere skal ikke brukes som filler. |
| Quiz | Full 3×7-pakke med 21 spørsmål. De første to settene gir 14 ordinære spørsmål; sett 3 bærer teori-/metodefordypning. |
| Knowledge | 21 eksplisitte Knowledge-ID-er er materialisert og synkronisert. Alle spørsmål er stedsskopet og har emne-, begreps- og kunnskapskoblinger. |
| Stories | Tre canonicale `episode_v1`-fortellinger er narrativt revidert: «Staten leter etter et hjem», «Kunst støpt inn i staten» og «Etter bomben». |
| Før/etter | Lisenskontrollert Wikimedia-par fra Johan Nygaardsvolds plass: 1. juli 2008 og åpningen 13. april 2026. Begge er CC BY-SA 4.0, har navngitt fotograf, verifisert kildeside og eksplisitt inferensgrense. |
| Nyheter | To daterte og stedsspesifikke `news_note`-records dekker G-blokkas pågående forprosjekt og den gjennomførte kunstmarkeringen 6. juni 2026. |
| Lesespor | Fire åpne og godkjente `link_only`-spor dekker stedshistorie, politisk beslutningsgrunnlag, offentlig kunst og Statsbyggs prosjektgjennomføring. |
| Brukerrettede kilder | Place og Leksikon har flere offisielle lenker, men ingen separat, deduplisert og fasegodkjent Kilder-flate med grupper, navn, kildebruk og avgrensninger er dokumentert. |
| Mer | Tematiske Leksikon-artikler finnes, men ingen fasegodkjent pakke med Språkleksikon, observasjon/betydning/motpunkt eller eksplisitt begrunnet N/A for de øvrige Mer-komponentene. |
| Fagverk-sted | Regjeringskvartalet har kuratert stedsside og relevante Politikk-linser. Den canonicale URL-en og synlig UI må kontrolleres på nytt i sluttfasen. |

## Canonical identitetsgate

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

## Politikk-gate

| Gate | Status | Begrunnelse |
| --- | --- | --- |
| Hovedfunksjon | PASS | Stedet er presist avgrenset som fysisk kjerneområde for regjering og departementer. |
| Canonicale emner | PASS | Tre `em_pol_*` er eksplisitt begrunnet med stedsspesifikke evidenskjeder. |
| Institusjon og kompetanse | PASS | Regjeringen, Statsministerens kontor, departementene og Statsbygg er skilt etter rolle i de relevante kjedene. |
| Regel, beslutning og ressurs | PASS | Reguleringsvedtak, byggetrinn, sikring, bygg og kontrollfunksjoner er dokumentert. |
| Gjennomføring og output | PASS | Innflytting, åpning 13. april 2026, minnested 19. juli 2026 og permanent 22. juli-senter 22. juli 2026 er dokumentert. |
| Outcome/inferensgrense | PASS | Rapporten hevder ikke målt bedre styring, redusert sikkerhetsrisiko, økt tillit eller læring uten dokumentasjon. |
| Nåtidskontroll | PASS | Aktive og planlagte forhold er kontrollert 2026-08-02. |
| Quizåpning | PASS | 14 ordinære spørsmål kommer før teori-/metodefordypningen. |

## Popup-status

| Fane | Status | Begrunnelse |
| --- | --- | --- |
| Om | PASS – eksisterende grunnlag | Canonical identitet, Politikk-rapport, 4.2-dekket `desc`/`popupDesc`, hovedartikkel, kilder og gyldig eksternt popupbilde er på plass. |
| Historie | PASS – PR #4666 | Tolv kildebelagte chronology-punkter følger samlokaliseringsforsøk, bygg, utvidelser, terrorangrep, gjenoppbygging og åpningene i 2026. Punktene er korte hendelsesrecords og erstatter ikke de tre narrative Stories. |
| Fortellinger | PASS – PR #4428 | Tre ulike narrative akser er konsolidert og reviewet mot `episode_v1`; de dupliserer ikke bare en datooversikt. |
| Før/etter | PASS – fase 4 | To CC BY-SA 4.0-bilder bruker Johan Nygaardsvolds plass som felles fysisk anker. Teksten skiller observerbar endring fra forklaring og sier uttrykkelig at ulike utsnitt ikke dokumenterer hele kvartalet. |
| Nyheter | PASS – fase 5 | To notiser skiller et pågående forprosjekt fra et gjennomført arrangement og dupliserer ikke åpningene 13. april, 19. juli eller 22. juli fra chronology. |
| Lesespor | PASS – fase 6 | Fire komplementære oppføringer er eksplisitt koblet bare til `regjeringskvartalet`, uten kopiert fulltekst eller betalingsmur. |
| Kilder | DELVIS / IKKE GODKJENT | Kilder finnes i place-, rapport-, Story- og Leksikon-data, men den brukerrettede flaten er ikke separat kuratert, deduplisert og fasegodkjent. |
| Mer | DELVIS / IKKE GODKJENT | Fire tematiske artikler gir innhold, men Mer-fanens egne kontrakter og eiergrenser er ikke ferdig vurdert. |

## Rundings- og progresjonsstatus

| Fase | Status | Begrunnelse |
| --- | --- | --- |
| Quiz og Knowledge | PASS – PR #4664 | 21 spørsmål, 14-spørsmåls normalåpning, teori/metode i sett 3 og 21 eksplisitte Knowledge-enheter. |
| People | PASS – PR #3604 | Tolv dokumenterte canonicale personer og eksplisitt rollebalanse med maksimalt to arkitekter. |
| Objects | IKKE STARTET | Ingen canonical bildeklare Object-kort er dokumentert for rundingen. |
| Brands | IKKE STARTET / mulig N/A | Ingen kvalifiserende Brand er dokumentert; N/A kan bare godkjennes etter eksplisitt research og audit. |
| Badges/fagverk | DELVIS | Data og kuratert fagverk finnes, men sluttfasen må kontrollere faktisk badgegrafikk, klikk og stedsside i UI. |

## Før/etter-research og eiergrense

### Før-bildet

- Fil: `File:Regjeringskvartalet H-blokk Johan Nygaardsvolds plass Oslo Norway (2008.07.01).jpg`.
- Dato: 1. juli 2008.
- Fotograf: Geir Hval (www.MacWhale.eu).
- Lisens: CC BY-SA 4.0.
- Stedssignal: Wikimedia-beskrivelsen identifiserer Johan Nygaardsvolds plass langs Akersgata med Høyblokka og Y-blokka i bakgrunnen.
- Bruk: direkte HTTPS-redirect fra Wikimedia Commons uten lokal beskjæring eller bearbeiding.

### Nå-bildet

- Fil: `File:Official opening Regjeringskvartalet April 13th 2026.jpg`.
- Dato: 13. april 2026.
- Fotograf: Helge Høifødt.
- Lisens: CC BY-SA 4.0.
- Stedssignal: bildet er tatt under den offisielle åpningen på Johan Nygaardsvolds plass og viser den nye A-blokka.
- Bruk: direkte HTTPS-redirect fra Wikimedia Commons uten lokal beskjæring eller bearbeiding.

### Hva paret kan og ikke kan dokumentere

Paret kan vise en fysisk omforming rundt samme navngitte plass: Y-blokka i den eldre situasjonen, A-blokka i det nye anlegget og endret bakkeplan/uterom. Høyblokka fungerer som orienteringspunkt, men kameravinklene er ikke identiske.

Paret kan ikke alene dokumentere:

- hele planområdets endring;
- årsakene til riving og bevaring;
- hvordan sikkerhetsløsningene fungerer;
- adgang og tilgjengelighet for alle deler av området;
- forholdene etter åpningene av minnestedet og det permanente 22. juli-senteret i juli 2026;
- målt effekt på trygghet, tillit, forvaltning eller demokratisk offentlighet.

## Sanerings- og produksjonsplan

### Behold

- canonical place-ID, områdeidentitet, source-fil og offisiell plangeometri;
- `politikk` som hovedkategori, de tre underbadgene og de tre Politikk-emnene, forutsatt fortsatt runtimekontroll;
- de tre evidenskjedene og deres eksplisitte inferensgrenser;
- revidert `desc`, `popupDesc`, Politikk-produksjonsrapport og eksternt popupbilde;
- den kildebelagte chronology-pakken med tolv avgrensede hendelser;
- de tre narrative Stories;
- Før/etter-paret med full Commons-attribusjon og avgrenset bildelesning;
- full 3×7 Quiz og Knowledge-materialisering;
- de tolv dokumenterte People-koblingene;
- fire tematiske Leksikon-artikler som innholdsgrunnlag;
- to daterte Nyheter-notiser med eksplisitt `ongoing`/`completed`-status;
- fire godkjente Lesespor med ærlige datoer, åpne lenker og `link_only`-rettigheter.

### Revider eller bygg separat

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
| 2 | Kildebelagt chronology og Historie-fane | **GODKJENT – PR #4666, merge `ba71c8684a0b8f8eb5470ee9c256728122661c0f`** |
| 3 | Story-review og episodeproduksjon | **GODKJENT – PR #4428** |
| 4 | Før/etter | **GODKJENT – PR #4667, merge `dd31ba5d7852eba372c82477e9fc40a5f563b5ca`** |
| 5 | Nyheter | **GODKJENT – PR #4668, merge `7cd5a0041e3f1bb4b312bc2b32ca5f8ae27df246`** |
| 6 | Lesespor | **KLAR FOR REVIEW** |
| 7 | Brukerrettede Kilder | **NESTE AKTIVE FASE ETTER MERGE AV FASE 6** |
| 8 | Mer | IKKE STARTET |
| 9 | Quizåpning 2 × 7 og Knowledge | **GODKJENT – PR #4664, merge `94cdc10e328b216dd374179fa5c12bf250def50e`** |
| 10 | People | **GODKJENT – PR #3604** |
| 11 | Objects | IKKE STARTET |
| 12 | Brands | IKKE STARTET / mulig begrunnet N/A |
| 13 | Badges, fagverk, alle åtte popupfaner, rundinger og full UI-/produksjonsaudit | IKKE STARTET |

## Resultat i fase 4

- `for_na` er lagt i canonical place-record, ikke i en separat duplikatfil.
- Begge bilder lastes via eksisterende HTTPS-støtte i `renderBeforeAfter`; ingen runtimeendring er nødvendig.
- Begge kildesider oppgir navngitt fotograf, opptaksdato og CC BY-SA 4.0.
- Johan Nygaardsvolds plass er felles fysisk anker, mens ulik kameravinkel beskrives åpent.
- Før-bildet viser Høyblokka og Y-blokka 1. juli 2008.
- Nå-bildet viser plassen og A-blokka under åpningen 13. april 2026.
- Teksten hevder ikke at paret viser hele planområdet, full sikkerhetsløsning eller status etter juliåpningene.
- Ingen Leksikon-, Story-, Quiz-, Knowledge-, People-, koordinat-, manifest- eller runtimefil er endret.

## Resultat i fase 5

- To `news_note`-records er lagt i den eksisterende manifestlastede Leksikon-filen.
- G-blokka-notisen dokumenterer bevilgningen på 140 millioner kroner og at forprosjekteringen var i gang 29. januar 2026. Den hevder ikke at rehabiliteringen er besluttet eller gjennomført.
- Kunstnotisen dokumenterer det åpne arrangementet 6. juni 2026, mer enn 600 deltakere og KOROs opplysning om over 300 monterte verk av bortimot 150 kunstnere.
- Begge notiser bruker navngitte offisielle HTTPS-kilder, er kontrollert 2. august 2026 og er eksplisitt uten quizbruk.
- Åpningen av byggetrinn 1 den 13. april og åpningene av minnestedet og 22. juli-senteret den 19. og 22. juli eies fortsatt av chronology og er ikke duplisert som nyhetskort.
- Ingen canonical place-, Story-, Quiz-, Knowledge-, People-, Lesespor-, manifest-, bilde- eller runtimefil er endret.

## Resultat i fase 6

- Fire oppføringer er lagt til i den eksisterende manifestlastede Politikk-filen for Lesespor.
- 22. juli-senterets «Om Regjeringskvartalet» gir en navngitt, stedsspesifikk historisk fagartikkel fra 2020; eksakt publiseringsdag er ikke konstruert.
- Meld. St. 21 (2018–2019) er det canonicale politiske lesesporet for funksjon, sikkerhet, bymiljø, miljø, arbeidsformer og beslutningsprosess.
- KOROs prosjektside gir et eget kunstspor, mens Statsbyggs prosjektside gir byggherre- og gjennomføringssporet. Ukjent publiseringsdato og år står som `null`.
- Alle fire oppføringer er `open`, `link_only`, `approved`, bruker HTTPS og peker eksplisitt bare til `regjeringskvartalet`.
- Ingen artikkeltekst er kopiert. Oppføringene lagrer bare tittel, ansvarlig aktør, publikasjon, dato/år når kjent, tema, relevans og ekstern lenke.
- Ingen record er kopiert inn i Leksikon, canonical place-`externalLinks`, Nyheter, Quiz eller Knowledge.
- Ingen canonical place-, Leksikon-, Story-, Quiz-, Knowledge-, People-, bilde-, manifest- eller runtimefil er endret.

## Neste aktive fase

Etter at fase 6 er merget og kontrollert på faktisk `main`, starter **fase 7: brukerrettede Kilder**.

Fasen skal:

1. samle en liten, deduplisert kildeflate som dokumenterer stedets sentrale faktalag og ikke fungerer som en ny Lesespor-liste;
2. gruppere og navngi offisielle kilder etter hva de faktisk dokumenterer: identitet/historie, plan/vedtak, bygg/gjennomføring, kunst og minne;
3. kontrollere HTTPS, språk, tilgang, verifiseringsdato og direkte støtte for brukerrettede påstander;
4. holde interne rapporter, audits og produksjonsfiler utenfor brukerflaten;
5. oppdatere bare canonical place-/Leksikon-kildedata, fasekort og målrettede regresjoner dersom eksisterende runtimekontrakt holder.

## Samlet status etter fase 6

Regjeringskvartalet har et sterkt faglig grunnlag, men er **ikke produksjonsklart etter den canonicale sted-for-sted-checklista**. Om-grunnlag, Historie, Stories, Før/etter, Nyheter, Lesespor, Quiz/Knowledge og People er nå produsert eller reviewet. Brukerrettede Kilder, Mer, Objects, Brands og sluttkontroll av Badges, fagverk og faktisk UI står fortsatt åpne.
