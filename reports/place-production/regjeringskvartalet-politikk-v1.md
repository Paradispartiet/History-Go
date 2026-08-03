# Regjeringskvartalet – Politikk-sted V1

- Dato: 2026-08-02
- Place ID: `regjeringskvartalet`
- Canonical place-fil: `data/places/politikk/oslo/places_politikk/regjeringskvartalet.json`
- Politikk-produksjonsrapport: `data/places/politikk-production/regjeringskvartalet.json`
- Leksikon: `data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json`
- Quiz: `data/quiz/politikk/regjeringskvartalet_sets.json`
- Primærkategori: `politikk`
- Produksjonsprofil: `narrow` – 3 sett × 7 spørsmål
- Status: **fase 13 – full UI-/produksjonsaudit PASS; produksjonsklart etter PR #4674 og kontroll på fersk `main`**

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
| People | Tolv canonicale personer er dokumentert ved stedet, med maksimalt to arkitekter og flertall av faktiske brukere, beslutningstakere, kunst-/ingeniøraktører og hendelsespersoner. Dekningen ble låst i PR #3604. |
| Objects | To fysiske og stedsspesifikke kunstobjekter er canonicalisert: «Fiskerne» på A-blokka og «Grass Roots Square» på Einar Gerhardsens plass. Begge har KORO-belegg for dagens plassering og lisenskontrollert Commons-foto med synlig tids-/stedsgrense. |
| Brands | **N/A – fase 12.** Canonical Brand-master og `brands_by_place` er søkt uten treff. Departementer, Statsbygg, KORO, arkitektteam og kunstnere er institusjoner/aktører, ikke Brands. |
| Quiz | Full 3×7-pakke med 21 spørsmål. De første to settene gir 14 ordinære spørsmål; sett 3 bærer teori-/metodefordypning. |
| Knowledge | 21 eksplisitte Knowledge-ID-er er materialisert og synkronisert. Alle spørsmål er stedsskopet og har emne-, begreps- og kunnskapskoblinger. |
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
| Quiz og Knowledge | PASS – PR #4664 | 21 spørsmål, 14-spørsmåls normalåpning, teori/metode i sett 3 og 21 eksplisitte Knowledge-enheter. |
| People | PASS – PR #3604 | Tolv dokumenterte canonicale personer og eksplisitt rollebalanse med maksimalt to arkitekter. |
| Objects | PASS – fase 11 | To avgrensede kunstobjekter har identitet, fysisk plassering, kilde, bilde, attribusjon, lisens og eksplisitt skille mellom eldre foto og dagens plassering. |
| Brands | N/A – fase 12 | Brand-master og stedskoblinger er eksplisitt kontrollert uten kandidat. Ingen organisasjon eller person omklassifiseres for å fylle rundingen. |
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
- full 3×7 Quiz og Knowledge-materialisering;
- de tolv dokumenterte People-koblingene;
- fire tematiske Leksikon-artikler som innholdsgrunnlag;
- to daterte Nyheter-notiser med eksplisitt `ongoing`/`completed`-status;
- fire godkjente Lesespor med ærlige datoer, åpne lenker og `link_only`-rettigheter;
- seks brukerrettede kildegrupper og en deduplisert, navngitt lenkeflate med eksplisitte hold-back-grenser;
- fem Språkleksikon-oppslag og avgrensede observasjon-, betydning- og motpunktspor for Mer;
- to canonicale, fysiske og stedsspesifikke Objects med lisenskontrollerte fotografier;
- eksplisitt Brands-N/A med evidens fra canonical Brand-master og `brands_by_place`.

### Revider eller bygg separat


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

- `data/brands/brands_master.json` og `data/brands/brands_by_place.json` er eksplisitt søkt; Regjeringskvartalet har ingen canonical Brand og ingen stedskobling.
- Statsbygg er byggherre/prosjektaktør, ikke et forbrukermerke som kvalifiserer rundingen.
- KORO er statens fagorgan for kunst i offentlige rom, ikke et Brand for stedet.
- Statsministerens kontor og departementene er offentlige institusjoner.
- Team Urbis, arkitektkontorer, entreprenører, kunstnere og fotografer har roller i prosjektet, men denne leveransen dokumenterer ikke en selvstendig, kjent Brand-identitet med varig stedskobling og egnet logo.
- Picasso-navnet tilhører kunstner-/Object-/People-kontekst og skal ikke brukes som Brand-filler.
- Brands er derfor **N/A med fanespesifikk begrunnelse og evidenspeker**, i tråd med regelen om at manglende relevant innhold kan være N/A mens glemt kontroll ikke kan det.
- Ingen tom `brands`-liste, lokal `brand_ids`-kuratering, ny master-record eller falsk logo er opprettet.
- Den faste vanlige rundingsprofilen er fortsatt `people · objects · brands`; N/A-statusen er redaksjonell evidens og endrer ikke runtimekontrakten.

## Resultat i fase 13

- Den faktiske popup-runtimeen er kjørt i Chromium mot canonical Regjeringskvartalet-data på både desktop (`1440 × 1000`) og mobil (`390 × 844`).
- Alle åtte faner vises i riktig rekkefølge: Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder og Mer.
- Fanene har `tablist`/`tab`/`tabpanel`, korrekt `aria-selected` og tastaturnavigasjon med piltaster, Home og End.
- Mobilvisningen har horisontal fanescroll og én kolonne for Før/etter-bildene; desktop beholder to kolonner.
- Den faste rundingsprofilen er kontrollert som Personer · Gjenstander · Brands, mens Badges ligger separat ved overskriften.
- Objects-rundingen viser «Fiskerne» og «Grass Roots Square» med de canonicale Commons-bildene. Brands forblir kontrollert N/A uten filler eller per-place runtime-unntak.
- Badges-klikkets canonicale mål er `fagverk-sted.html?place=regjeringskvartalet`.
- Fagverk-stedet er kjørt i Chromium og viser Regjeringskvartalet, hovedbilde, tre undermerker, Politikk-domener, minst fire linser, minst fire stedsspørsmål, kapitler, begreper, emner og brukerrettede HTTPS-kilder.
- Popup- og fagverksflater er kontrollert uten synlige pekerstrenger til `reports/`, `tests/`, quiz-produksjonskontekst, koordinat-evidens eller interne claims/audits.
- Eksterne lenker åpnes sikkert med `noopener noreferrer`, og canonical bilde-URL-er er HTTPS.
- Den permanente `Place rounds governance`-workflowen kjører nå den samme Chromium-baserte sluttporten ved relevante endringer.

## Sluttstatus

Fase 13 er squash-merget i PR #4674 med commit `06d6c462e549be34e784d81317333bbfb20fd5ef`. Den permanente ellevefilersdiffen er kontrollert gjennom closure-PR-CI på en gren opprettet direkte fra fersk `main`; `Place rounds governance` og `TypeScript guard` må begge bestå før denne avslutningen merges.

Regjeringskvartalet er dermed **produksjonsklart etter den canonicale sted-for-sted-checklista**. Alle tretten faser er lukket, og ingen ny innholdsproduksjonsfase står åpen.
