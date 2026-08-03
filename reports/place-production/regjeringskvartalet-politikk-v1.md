# Regjeringskvartalet – Politikk-sted V1

- Dato: 2026-08-03
- Place ID: `regjeringskvartalet`
- Canonical place-fil: `data/places/politikk/oslo/places_politikk/regjeringskvartalet.json`
- Politikk-produksjonsrapport: `data/places/politikk-production/regjeringskvartalet.json`
- Leksikon: `data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json`
- Quiz: `data/quiz/politikk/regjeringskvartalet_sets.json`
- Primærkategori: `politikk`
- Aktiv quiz per 3. august 2026: `major_10x7` – 10 sett × 7 spørsmål
- Korrigert produksjonsmål: **oppnådd**
- Status: **PRODUKSJONSKLAR – fase 17 PASS med hele sted-checklisten eksplisitt kontrollert**

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
| Leksikon | Fire tematiske artikler og to `news_note`-records finnes. Hovedartikkelen er versjon 3 med tre fakta, tolv chronology-punkter og kildebelagt Mer-tolkning. |
| Rundingsprofil | Fast `people · objects · brands`, med Badges ved overskriften. Wonderkammer-innhold skal ikke telles som ferdig Objects-runding. |
| People | **PASS – utvidet i PR #4681.** Tjueto canonicale personer er dokumentert ved stedet, med maksimalt to arkitekter og 20 andre regjerings-, gjenoppbyggings-, 22. juli- og kunstroller. |
| Objects | To fysiske og stedsspesifikke kunstobjekter er canonicalisert: «Fiskerne» på A-blokka og «Grass Roots Square» på Einar Gerhardsens plass. Begge har KORO-belegg for dagens plassering og lisenskontrollert Commons-foto med synlig tids-/stedsgrense. |
| Brands | **PASS – fase 15.** Fjorten canonicale Brands er koblet til stedet: Statsbygg, KORO, sju Team Urbis-medlemmer og fem hovedentreprenører. Team Urbis som midlertidig prosjektteam og tre andre entitetstyper er holdt tilbake med kandidatspesifikk begrunnelse. |
| Quiz | **PASS – fase 14.** `major_10x7` med 70 unike spørsmål og ti selvstendige læringsjobber. Den historiske 1×5-pakken og tidligere 3×7 er dokumentert i behold/omskriv/flytt/fjern-auditen. |
| Knowledge | 70 unike primære Knowledge-ID-er er materialisert og synkronisert; 49 nye enheter er lagt til uten å endre de 21 eksisterende primær-ID-ene. |
| Stories | Tre canonicale `episode_v1`-fortellinger er narrativt revidert: «Staten leter etter et hjem», «Kunst støpt inn i staten» og «Etter bomben». |
| Før/etter | Lisenskontrollert Wikimedia-par fra Johan Nygaardsvolds plass: 1. juli 2008 og åpningen 13. april 2026. Begge er CC BY-SA 4.0, har navngitt fotograf, verifisert kildeside og eksplisitt inferensgrense. |
| Nyheter | To daterte og stedsspesifikke `news_note`-records dekker G-blokkas pågående forprosjekt og den gjennomførte kunstmarkeringen 6. juni 2026. |
| Lesespor | Fire åpne og godkjente `link_only`-spor dekker stedshistorie, politisk beslutningsgrunnlag, offentlig kunst og Statsbyggs prosjektgjennomføring. |
| Brukerrettede kilder | Seks redaksjonelle kildegrupper og tolv navngitte place-lenker dekker identitet/historie, plan/vedtak, bygg/gjennomføring, kunst/arkitektur, 22. juli/minne og bilde/lisens. Runtime aggregerer Leksikon- og Før/etter-lenker og dedupliserer på URL. |
| Mer | Fem stedsspesifikke Språkleksikon-oppslag og tre kildebelagte spor hver for observasjon, betydning og motpunkt er ferdige. Knowledge, funfacts, relasjoner og Objects dupliseres ikke inn i fanen. |
| Fagverk-sted | **PASS – fase 13.** `fagverk-sted.html?place=regjeringskvartalet` er kontrollert i Chromium med canonicalt bilde, tre undermerker, Politikk-domener, linser, spørsmål, kapitler, begreper, emner og sikre kildelenker. |

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
| Kilder | PASS – fase 7 | Seks kildegrupper forklarer hva kildene brukes til. Tolv navngitte place-lenker er HTTPS, språkmerket og datokontrollert; Leksikon- og Før/etter-lenker dedupliseres av eksisterende runtime. |
| Mer | PASS – fase 8 | Fem kildebelagte begreper og 3 × 3 tolkningspunkter rendres av eksisterende runtime. Øvrige komponenter har fanespesifikk N/A/eiergrense. |

## Rundings- og progresjonsstatus

| Fase | Status | Begrunnelse |
| --- | --- | --- |
| Quiz og Knowledge | PASS – fase 14 | 10 × 7 spørsmål, eksplisitt eksisterende-quiz-audit, major-begrunnelse, 70 unike primære Knowledge-ID-er og 49 nye canonicale enheter. |
| People | PASS – PR #3604 og #4681 | Tjueto dokumenterte canonicale personer, null dupliserte ID-er og eksplisitt rollebalanse med maksimalt to arkitekter. |
| Objects | PASS – fase 11 | To avgrensede kunstobjekter har identitet, fysisk plassering, kilde, bilde, attribusjon, lisens og eksplisitt skille mellom eldre foto og dagens plassering. |
| Brands | PASS – fase 15 | Fjorten kvalifiserende profesjonelle og institusjonelle Brand-identiteter har canonical record, direkte stedsevidens og mapping; fire kandidater er holdt tilbake med konkret grunn. |
| Badges/fagverk | PASS – fase 13 | Badges ligger ved overskriften, peker til canonical fagverk-rute og viser de tre Politikk-undermerkene og stedets faglige stier. |

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
- full `major_10x7`-quiz med alle 21 tidligere spørsmål bevart og 49 nye spørsmål/Knowledge-enheter;
- de tjueto dokumenterte People-koblingene og claims-auditen i `reports/place-production/regjeringskvartalet-people-v2.md`;
- fire tematiske Leksikon-artikler som innholdsgrunnlag;
- to daterte Nyheter-notiser med eksplisitt `ongoing`/`completed`-status;
- fire godkjente Lesespor med ærlige datoer, åpne lenker og `link_only`-rettigheter;
- seks brukerrettede kildegrupper og en deduplisert, navngitt lenkeflate med eksplisitte hold-back-grenser;
- fem Språkleksikon-oppslag og avgrensede observasjon-, betydning- og motpunktspor for Mer;
- to canonicale, fysiske og stedsspesifikke Objects med lisenskontrollerte fotografier;
- fjorten canonicale Brands og kandidat-/rettighetsauditen i `reports/place-production/regjeringskvartalet-brands-v2.json`.

### Revider eller bygg separat

- Ingen åpne produksjonsfaser. Nye utvidelser skal behandles som ny, avgrenset produksjon og må ikke gjenåpne ferdigstatus uten et konkret avvik.

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
| 1 | Kildebank, Politikk-rapport, description 4.2, bilde og Om | **GODKJENT – #4353, #4368, #4408 og #4659; slutt-UI kontrollert i PR #4674** |
| 2 | Kildebelagt chronology og Historie-fane | **GODKJENT – PR #4666, merge `ba71c8684a0b8f8eb5470ee9c256728122661c0f`** |
| 3 | Story-review og episodeproduksjon | **GODKJENT – PR #4428** |
| 4 | Før/etter | **GODKJENT – PR #4667, merge `dd31ba5d7852eba372c82477e9fc40a5f563b5ca`** |
| 5 | Nyheter | **GODKJENT – PR #4668, merge `7cd5a0041e3f1bb4b312bc2b32ca5f8ae27df246`** |
| 6 | Lesespor | **GODKJENT – PR #4669, merge `c68881578a5a56c6ae9b610f7c5132fc448297c3`** |
| 7 | Brukerrettede Kilder | **GODKJENT – PR #4670, merge `318119d72d63838d487bbaeec85bda2dd58209b1`** |
| 8 | Mer | **GODKJENT – PR #4671, merge `5effd690c06502b68a5870ca2bc089459fac56b9`** |
| 9 | Quizåpning 2 × 7 og Knowledge | **GODKJENT – PR #4664, merge `94cdc10e328b216dd374179fa5c12bf250def50e`** |
| 10 | People | **GODKJENT – PR #3604** |
| 11 | Objects | **GODKJENT – PR #4672, merge `1b8b277cc70b4a26f332091194de667d1a32da53`** |
| 12 | Brands | **GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`** |
| 13 | Badges, fagverk, alle åtte popupfaner, rundinger og full UI-/produksjonsaudit | **GODKJENT – PR #4674, merge `06d6c462e549be34e784d81317333bbfb20fd5ef`** |
| 14 | Quiz `major_10x7`, eksisterende-quiz-audit og Knowledge | **GODKJENT – PR #4680, merge `4f15fd4c20949366c023593b96dfa2308623ee5a`** |
| 15 | Brands V2 | **GODKJENT – PR #4680, merge `4f15fd4c20949366c023593b96dfa2308623ee5a`** |
| 15b | People V2 | **GODKJENT – PR #4681, merge `a91a0ee590d1c6994092234a5090ea99837cd15b`** |
| 16 | Ny samlet sluttkontroll på fersk `main` | **PASS – kontrollert fra `a91a0ee590d1c6994092234a5090ea99837cd15b`** |
| 17 | Full sted-checklist: onsite, Observer/Notat/Rute, relasjoner, i18n, besøk, profil og spillerstatus | **PASS – kontrollert fra `66f1bdce519149eecd659674dbf8c3213972e1bf`** |

### Governance-korrigering 3. august 2026

Fasetabellen dokumenterer både den opprinnelige leveransen og korrigeringen. Fase 9 og fase 12 ble gjenåpnet fordi de bygde på henholdsvis et ubegrunnet `narrow`-valg og en for snever Brand-definisjon. PR #4680 lukket begge avvikene, PR #4681 utvidet People uten dubletter, og fase 16 kjører den samlede produksjonsporten på deres felles ferske `main`.

- Før PR #4664 fantes én aktiv Regjeringskvartalet-quiz med 1 sett og 5 spørsmål. Etter PR-en finnes 3 sett og 21 spørsmål. Begge tilstandene skal inngå i den nye eksisterende-quiz-auditen.
- Regjeringskvartalet har dokumenterte perioder, bygg, institusjoner, People, kunst, 22. juli, plan-/beslutningsprosesser, sikkerhet/åpenhet, gjenoppbygging, minnepolitikk og store prosjektaktører. Det bærer ti selvstendige settplaner og er derfor produsert som `major_10x7`.
- Statsbyggs og Regjeringens prosjektoversikter navngir Team Urbis samt Nordic Office of Architecture, COWI, Rambøll, Aas-Jakobsen, Asplan Viak, Bjørbekk & Lindheim og SLA. Regjeringens aktøroversikt navngir også Veidekke, HENT, Skanska, Agaia og Mebyr som hovedentreprenører. Kandidatene er nå identitets-, steds-, kilde- og rettighetsauditert; 14 er canonicalisert, mens Team Urbis-navnet og tre andre entitetstyper er holdt tilbake.
- Kilder: `https://www.statsbygg.no/nyheter/regjeringskvartalet-kontrakt-undertegnet/`, `https://www.regjeringen.no/no/aktuelt/forste-byggetrinn-i-regjeringskvartalet-ferdigstilles-under-kostnadsrammen/id3141936/` og `https://www.statsbygg.no/byggeprosjekter/nytt-regjeringskvartal/`.

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

## Resultat i fase 7

- `source_summary` er lagt til i canonical place-record med seks brukerrettede grupper: identitet/historie, plan/vedtak, bygg/gjennomføring, kunst/arkitektur, 22. juli/minne og bilde/lisens.
- Tolv navngitte place-`externalLinks` dekker de samme funksjonene. Fem manglende innganger er lagt til: Meld. St. 21, Statsbyggs prosjektoversikt, KOROs kunstside, 22. juli-senterets historikk og SNLs hovedartikkel.
- Eksisterende Regjeringen.no-lenker og CC BY-SA 4.0-lisensen er kontrollert 2. august 2026. Den tekniske S-5100/WFS-lenken beholder sin særskilte koordinatverifisering fra 24. juli 2026.
- Eksisterende runtime samler place- og Leksikon-`externalLinks` med Før/etter-kildene og dedupliserer etter URL. Lesespor kopieres ikke inn i Kilder-fanen.
- Interne rapporter, quiz-kontekst, claims og coordinate-audits er eksplisitt holdt utenfor brukerflaten.
- Planlagte byggetrinn og framtidig ferdigstillelse må fortsatt presenteres med kontrollert status og dato.
- Canonical place-endringen er synkronisert deterministisk i Quiz-produksjonskonteksten; Quiz-innhold, Knowledge, Leksikon, Stories, People, bilder og runtime er uendret.

## Resultat i fase 8

- Hovedartikkelen er oppgradert til versjon 3 med tre «Legg merke til»-punkter, tre betydningspunkter og tre motpunkter.
- Tolkningssporet skiller observerbare fysiske forhold fra institusjonell betydning og fra påstander som ikke kan utledes av byggene alene.
- Et stedsspesifikt Språkleksikon med fem oppslag forklarer `regjeringskvartal`, `utøvende makt`, `departement`, `naturbetong` og `perimetersikring`.
- Alle oppslag er koblet til canonical place-ID, har stedskontekst og én navngitt HTTPS-kilde kontrollert 2. august 2026.
- Observations er levert som `interpretation.what_to_notice`. Separat Knowledge i Mer er N/A fordi de 21 canonicale Knowledge-enhetene eies av quizpakken og ikke skal dupliseres.
- Funfacts er N/A: korte kuriositeter har ingen selvstendig læringsverdi her og kan trivialisere terror-, minne- og sikkerhetslaget.
- Curated relations er N/A i Mer: canonicale personer og relasjoner eies av People-/relasjonsdata. Kopiering ville skape parallelle identiteter.
- Artifacts/Objects er N/A i denne fanefasen og forblir åpne i egen fase 11 med krav til identitet, fysisk plassering, kilder og bilde.
- Eksisterende runtime og CSS håndterer alle leverte komponenter; ingen visningskode er endret.

## Resultat i fase 11

- Canonical place-record har fått to Objects: «Fiskerne» og «Grass Roots Square».
- Begge er fysiske, identifiserbare kunstobjekter med dokumentert tilknytning til Regjeringskvartalet og presis `whereToFind`.
- KORO dokumenterer dagens plassering på henholdsvis A-blokka og Einar Gerhardsens plass.
- Commons-fotografiene er lisenskontrollert som CC BY-SA 3.0 NO og CC BY-SA 3.0, med navngitte fotografer og direkte kildesider.
- Begge foto er tatt ved verkenes tidligere plassering. `representationScope` sier uttrykkelig at bildene dokumenterer objektidentiteten, ikke dagens plassering.
- «Måken» holdes tilbake fordi publikumsadgang og et egnet fritt bilde av dagens innvendige plassering ikke er tilstrekkelig dokumentert.
- «En opprettholdelse» holdes tilbake fra denne runden fordi tilgjengelige nye fotografier har BONO-/fotografkreditering uten dokumentert gjenbrukslisens; minnestedets betydning er fortsatt dekket i Historie, Kilder og Mer.
- Hele bygg, 22. juli-senteret, departementer, kunstnere og abstrakte sikkerhetstiltak er ikke Objects.
- Eksterne Commons-bilder støttes av eksisterende rundingsruntime; ingen genererte illustrasjoner, lokale binærfiler eller runtimeendringer er nødvendig.
- Den deterministiske quizkonteksten er synkronisert med canonical place-filens nye byte-/SHA-verdi. Quizinnhold og Knowledge er uendret.

## Resultat i fase 12

PR #4673 dokumenterte at `brands_master.json` og `brands_by_place.json` manglet treff, og opprettet ikke filler. Den tekniske observasjonen står, men N/A-konklusjonen er **underkjent** av governance-korrigeringen 3. august 2026.

- Null eksisterende record betyr at kandidatene må researches og eventuelt canonicaliseres; det betyr ikke at Brands er N/A.
- Fase 12 brukte «forbrukermerke» som terskel og avviste arkitektkontorer og entreprenører som aktørtyper. `data/brands/brand_rules_v1_1.json` inkluderer uttrykkelig profesjonelle merker og arkitektfirmaer når identitetskravene består.
- Team Urbis-medlemmene og de navngitte hovedentreprenørene er derfor gjenåpnede kandidater. Det endelige Brand-settet bestemmes først etter identitets-, rolle-, kilde-, logo- og rettighetsaudit.
- Statsministerens kontor, departementene, enkeltkunstnere og Picasso-navnet forblir andre entitetstyper med mindre en separat Brand-identitet faktisk dokumenteres.
- Den faste vanlige rundingsprofilen er fortsatt `people · objects · brands`; korrigeringen krever ingen place-spesifikk runtimevariant.

## Resultat i fase 13

- Den faktiske popup-runtimeen er kjørt i Chromium mot canonical Regjeringskvartalet-data på både desktop (`1440 × 1000`) og mobil (`390 × 844`).
- Alle åtte faner vises i riktig rekkefølge: Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder og Mer.
- Fanene har `tablist`/`tab`/`tabpanel`, korrekt `aria-selected` og tastaturnavigasjon med piltaster, Home og End.
- Mobilvisningen har horisontal fanescroll og én kolonne for Før/etter-bildene; desktop beholder to kolonner.
- Den faste rundingsprofilen er kontrollert som Personer · Gjenstander · Brands, mens Badges ligger separat ved overskriften.
- Objects-rundingen viser «Fiskerne» og «Grass Roots Square» med de canonicale Commons-bildene. Den tekniske Brands-tomtilstanden ble kontrollert, men den redaksjonelle N/A-konklusjonen er senere gjenåpnet.
- Badges-klikkets canonicale mål er `fagverk-sted.html?place=regjeringskvartalet`.
- Fagverk-stedet er kjørt i Chromium og viser Regjeringskvartalet, hovedbilde, tre undermerker, Politikk-domener, minst fire linser, minst fire stedsspørsmål, kapitler, begreper, emner og brukerrettede HTTPS-kilder.
- Popup- og fagverksflater er kontrollert uten synlige pekerstrenger til `reports/`, `tests/`, quiz-produksjonskontekst, koordinat-evidens eller interne claims/audits.
- Eksterne lenker åpnes sikkert med `noopener noreferrer`, og canonical bilde-URL-er er HTTPS.
- Den permanente `Place rounds governance`-workflowen kjører nå den samme Chromium-baserte sluttporten ved relevante endringer.

## Korrigert sluttstatus

Fase 13 ble squash-merget i PR #4674 med commit `06d6c462e549be34e784d81317333bbfb20fd5ef`. Den permanente UI-auditen er nå kjørt på nytt etter at Quiz/Brands ble merget i PR #4680 og People ble merget i PR #4681.

Regjeringskvartalet er samlet produksjonsklart: `major_10x7` med 70 spørsmål, 70 primære Knowledge-ID-er, 14 Brands, 22 People, 2 Objects, 3 underbadges og alle åtte popupfaner består den samme permanente Chromium-/produksjonsporten på fersk `main`.

## Resultat i korrigeringsfase 14

- Quizprofilen er `major_10x7`: ti sett, 70 unike spørsmål og ti egne læringsjobber.
- Alle 21 spørsmål fra 3×7-pakken er beholdt. Spørsmål 15–21 er flyttet til sluttsettet uten å endre sine primære Knowledge-ID-er.
- Den eldre 1×5-pakken er dokumentert fra git-historikken. Behold/omskriv/flytt/fjern-beslutningene ligger både i source brief, quizpakke og deterministisk kontekst.
- 49 nye spørsmål og 49 nye canonicale Knowledge-enheter dekker personer, kunst, arkitektur, prosjektaktører, forvaltning, sikkerhet, byrom, minne og planstrid.
- Innholdsbalansen er 39 fakta-, 19 kontekst-/analyse- og 12 begreps-/teorispørsmål. De første 14 spørsmålene er fortsatt en normal, stedsspesifikk åpning.

## Resultat i korrigeringsfase 15

- Fjorten Brand-records er canonicalisert og koblet gjennom `brands_by_place`: Statsbygg, KORO, Nordic Office of Architecture, COWI, Rambøll, Aas-Jakobsen, Asplan Viak, Bjørbekk & Lindheim, SLA, Veidekke, HENT, Skanska, Agaia og Mebyr.
- Team Urbis-medlemmene er modellert som selvstendige profesjonelle Brands; det midlertidige prosjektteamnavnet er holdt tilbake.
- Statsbygg og KORO kvalifiserer som autonome institusjonelle aktørbrands med direkte stedstilknytning. Departementene, enkeltpersoner og 22. juli-senteret beholdes i sine primære entitetslag.
- Kandidatauditen dokumenterer Brand-kriterier, direkte prosjektkilde og fire kandidatspesifikke avslag.
- Ingen firmalogo er kopiert, generert eller rekonstruert uten eksplisitt gjenbruksgrunnlag. Kortene bruker canonical navn og eksisterende runtime-fallback; dette er en rettighetsavgjørelse, ikke manglende Brand-identitet.

## Resultat i korrigeringsfase 15b

- People-rundingen er utvidet fra 12 til 22 canonicale personer i PR #4681.
- Fem eksisterende profiler er gjenbrukt og claim-oppgradert; fem nye profiler er opprettet. Repositoryet har fortsatt null dupliserte person-ID-er.
- Utvidelsen dekker regjeringshistorie, 22. juli-senteret, gjenoppbygging og offentlig kunst og beholder maksimalt to arkitekter.
- Eksisterende Stortinget-, Youngstorget- og Victoria Terrasse-koblinger er bevart med egne offisielle claims.

## Resultat i fase 16

- Sluttkontrollen bygger på fersk `main` `a91a0ee590d1c6994092234a5090ea99837cd15b`, som inneholder både PR #4680 og PR #4681.
- Quizpakken har 10 sett × 7 spørsmål, 70 unike spørsmål og 70 unike primære Knowledge-ID-er.
- `brands_by_place.regjeringskvartalet` inneholder 14 unike canonicale Brand-ID-er.
- People-manifestet gir 22 unike koblinger til Regjeringskvartalet, med 2 arkitekter og 20 andre roller.
- Canonical place har 2 Objects og 3 underbadges. Popupen har 8 faner i riktig rekkefølge.
- Data checks, TypeScript guard og Chromium-basert `Place rounds governance` er grønne på de mergede produksjonsheadene; fase 16-porten kjører de samme kontrollene samlet.
- De ferdigproduserte innholdsflatene har ingen åpen rest, og ingen interne rapport-, test-, claims- eller produksjonskontekststier eksponeres i brukerflaten. Den bredere produktflaten kontrolleres separat i fase 17.

## Resultat i fase 17 – full sted-checklist

Fase 17 er en nullmålt runtime- og dokumentasjonsaudit fra `main` `66f1bdce519149eecd659674dbf8c3213972e1bf`. Den oppretter ikke filler for subsystemer som ikke passer stedet. Hvert tidligere udokumenterte punkt er enten verifisert mot eksisterende eier/runtime eller avsluttet som begrunnet N/A.

| Checklistområde | Status | Bevis og avgrensning |
| --- | --- | --- |
| Events | PASS / innhold N/A | Politikkprofilen viser alltid Events. Regjeringskvartalet har ingen aktiv canonical event-kobling, og eksisterende tomtilstand brukes; ingen oppdiktet kalenderhendelse er laget. |
| Avtal å møtes | PASS | Den faste onsite-raden åpner eksisterende Social Meet med canonical place-ID. Backend-/identitetsgater og personvernregler beholdes; flaten feiler lukket hvis tjenesten ikke er tilgjengelig. |
| Kunnskapsmøte | PASS | Eksisterende Spotmeeting åpnes med `contextType: place` og `contextId: regjeringskvartalet`; ingen parallell møte- eller deltakerlagring er laget. |
| Tasks | N/A | Tasks er fjernet fra produktkontrakten og skal ikke gjeninnføres som sted-filler. |
| Training | N/A | Stedet er ikke et idretts-/treningssted og har ingen trygg, canonical `training_profile`. |
| Play | N/A | Politikkprofilen har `play: never`; området er ikke en lekeplass og får ingen konstruert `play_profile`. |
| Observer | PASS | Observer bruker den deployede urbane `by_byliv`-linsen og beholder `politikk` som kategori i learning-log-konteksten. Observerbare forhold er bruk av byrommet, ferdselslinjer og forholdet mellom åpenhet og sikring. |
| Notat | PASS | Footerhandlingen bruker eksisterende `handlePlaceNote(place)` og eksisterende notat-eier. |
| Rute | PASS / historisk rute N/A | «Gå hit» bruker eksisterende navigasjon til place-ankeret. Ingen canonical historisk rute/stopp er dokumentert for stedet, og en rute opprettes ikke bare for completeness. |
| Curated relations | PASS | Fire kildebelagte relasjoner til Erling Viksjø, Henrik Bull, Pablo Picasso og Carl Nesjar eies av `data/relations_philanthropy.json`. De dupliseres ikke som `related_place_ids` eller innebygde relasjoner i place-recorden. |
| NextUp | PASS | PlaceCard sender place-kontekst til `HGNavigator.buildForPlace` og viser reelle eksisterende kandidatspor uten stedsspesifikk hardkoding. |
| Nearby | PASS | Listen viser canonical navn og kategori, bruker nå `popupImage` som gyldig bildefallback og åpner canonical `#/place/regjeringskvartalet`. |
| Søk og alias | PASS | Canonicalnavnet, `RKV` og `Nytt regjeringskvartal` er søkbare. Aliasene endrer ikke ID eller visningsnavn. |
| i18n | PASS | Engelske, spanske og portugisiske entries er synkronisert til source-hash `c0421036b6d22a2f`, beholder ni avsnitt og dekker hele den reviderte stedsteksten. |
| Offentlig hjemsted | N/A i place-record | Offentlig hjemsted er en brukervalgt sosial profilverdi, ikke en egenskap ved stedet. Regjeringskvartalet er en canonical offentlig place-ID med verifisert områdeanker; ingen privat adresse eller stedsspesifikk profilverdi er lagt til. |
| Fysisk besøk | PASS | PlaceCard har en eksplisitt «Registrer besøk»-handling. Eksisterende fysisk visit-service bruker canonical områdeanker og radius 200 m, viser avstandsstatus og skriver bare eksisterende `visited_places`-eier. |
| Quiz ↔ fysisk besøk | PASS | Digital quiztilgang skriver aldri besøksstatus. Quiz alene gir nå neste handling «Registrer besøk», ikke «Ferdig her». |
| Favoritt | PASS | `pcFavorite`, Nearby og progress-leseren bruker eksisterende `HGFavoritePlaces`/`hg_favorite_place_ids_v1`; ingen konkurrerende nøkkel er opprettet. |
| Place-progress og Next Action | PASS | Besøkt og quizfullført er uavhengige akser: besøkt alene → quiz, quiz alene → fysisk besøk, begge → fullført. |
| Profil / miniProfile | PASS | miniProfile leder til profilsiden. Stedsamlingen er unionen av fysisk besøkte og quiz-samlede steder, viser kildeetikett og bruker place-bildets canonicale fallback. |
| People/Object/andre unlocks | N/A | Ingen eksisterende regel låser automatisk opp de 22 personene, 2 objektene eller 14 Brands ved besøk/quiz; en slik belønning er ikke oppfunnet. |
| Badge/merit/Bronse–Sølv–Gull | N/A | Politikk-badges og fagverk er innholdsnavigasjon. Det finnes ingen Regjeringskvartalet-spesifikk Bronze/Silver/Gold-kontrakt som kan materialiseres. |
| Konsistent status | PASS | PlaceCard, Nearby og profil bruker samme progresjonseiere og skiller favoritt, fysisk besøk og quizfullføring. |
| QA | PASS | Fase-17-testen låser alle beslutningene, TypeScript og genererte web-bundles er synkronisert, og den permanente Chromium-porten kjøres av `Place rounds governance`. |

### Runtimeavvik rettet i fase 17

- En synlig `pcVisit` erstatter den manglende gamle `pcUnlock`-hooken uten å gjeninnføre den misvisende teksten «Lås opp».
- Next Action erklærer ikke et sted fullført etter bare digital quiz; fysisk besøk og quiz må begge være fullført.
- Observer peker på den eneste deployede og gyldige observation-filen (`observations_by.json`) og beholder stedets Politikk-kategori separat.
- Nearby og profil bruker `popupImage` når et sted ikke har eget `image`/`cardImage`.
- Globalt søk inkluderer canonicale aliaser, og Regjeringskvartalet har de dokumenterte aliasene `RKV` og `Nytt regjeringskvartal`.
