# History GO — stedspopup-system

Status: **canonical presentasjonskontrakt**  
Eier: `place_popup_presentation_contract`  
Basisruntime: `js/ui/place-popup-v2.js`  
Faner: `js/ui/place-popup-tabs.js`  
Språkadapter: `js/ui/place-language-layer.js`  
På stedet: `js/ui/place-onsite-surface.js`  
Sist kontrollert: **2026-08-25**

Stedspopupen er den komplette brukerrettede **kunnskapsflaten** for ett canonical History GO-sted. PlaceCard er det kompakte kontrollrommet.

Sted-for-sted produksjon:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`.

## 1. Denne filen eier presentasjon, ikke detaljproduksjon

Denne kontrakten bestemmer **hvor kunnskap vises og hvordan popupflatene skilles**. Den eier ikke hvordan hvert innhold produseres.

Viktige eiergrenser:

| Innhold | Produksjonseier |
| --- | --- |
| `desc` / `popupDesc` | `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md` |
| Stories | `docs/STORIES_DATA_GOVERNANCE.md` |
| People | `docs/PEOPLE_PROFILE_CANONICAL.md` + `docs/people-of-places-method.md` |
| Quiz | `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md` |
| Rundinger | `data/places/README_place_rounds.md` |
| Språkleksikon | `docs/SPRAKLEKSIKON.md` |
| Nature | `README/nature_mapping_workflow.md` |
| Koordinater | coordinate-kontraktene |

Popupen skal aggregere ferdige canonical data, ikke lage en ny sannhetskilde.

### Placegrensen gjelder hele popupen

Før innhold fordeles på faner eller eierflater, skal canonical place-register/manifester kontrolleres for bygg, virksomheter, parker, plasser og andre delsteder som har egne place-oppføringer. Innholdet skal ligge hos riktig place-eier. Et slikt delsted kan vises som tydelig merket relasjon eller supplement, men kan ikke brukes i stedet for parent-place i Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder, Språk eller andre eierflater. Den samme grensen gjelder rundinger, bildepar og hovedpåstander utenfor popupen.

## 2. De tre stedflatene

Tre roller skal holdes adskilt:

1. **Rundinger/samlinger** = visuelle samlinger av identifiserbare ting, med egne popuper.
2. **På stedet** = hva som skjer eller kan gjøres der.
3. **Stedspopup** = kunnskap om stedet.

Ikke flytt innhold mellom disse bare for å fylle UI. Samtidig skal kunnskap som beskriver en konkret samlingsenhet vises hos samlingen som eier enheten, slik at den samme informasjonen ikke dupliseres som en ekstra stedspopupfane.

## 3. Source of truth

Popupen leser fra eksisterende eide systemer:

- manifest-loadede place-filer → identitet, `desc`, `popupDesc`, place-profiler;
- Leksikon → hovedartikkel, facts, chronology, nyhetsspor, `externalLinks`;
- Språkleksikon → `data/leksikon/sprak/manifest.json` og stedsspesifikke språkfiler;
- Stories → canonical Stories;
- `for_na` → Før/etter;
- Lesespor → Lesespor;
- source summaries / eksterne lenker → Kilder;
- observations/Knowledge → egne systemer;
- play/events/møteflater → På stedet;
- `training_profile` → sportsinnhold i stedspopupen for sportssteder.

Data skal ikke kopieres inn i én gigantisk place-fil bare fordi flere brukerflater viser dem samlet eller kontekstuelt.

## 4. Canonical popupfaner

Popupen har **åtte faste faner** for alle canonical Places:

```text
Om
Historie
Fortellinger
Før/etter
Nyheter
Lesespor
Kilder
Språk
```

**Språk er obligatorisk.** Alle steder har navn, begreper, fagord, historiske navneformer, lokale betegnelser eller andre språklige innganger som kan vurderes etter `docs/SPRAKLEKSIKON.md`. Et produksjonsklart sted kan derfor ikke ha Språk som N/A eller mangle Språk-fanen.

Dette betyr ikke at alle steder har dialekt. **Dialekt er et valgfritt, strengere underlag inne i Språkleksikonet** og følger area-eierskapet i språk-kontrakten. En bygning, gate, institusjon eller annen enkelt-Place skal ikke få et konstruert dialektlag for å oppfylle Språk-kravet.

Hvis et eldre sted ennå mangler materialisert språkdata, beholdes Språk-fanen med en tydelig produksjonsgap-tilstand. Gapet skal lukkes ved fullproduksjon; det er ikke en godkjent sluttstatus og skal aldri fylles med oppdiktede begreper.

Følgende er **ikke selvstendige stedspopupfaner**:

```text
Spor & objekter
Legg merke til
Betydning
Motpunkter
Relasjoner
Kunnskap
Observasjoner
```

Disse navnene beskriver kunnskapslag som tidligere kunne havne under legacy-`Mer`. De skal nå rutes til sin canonical eierflate etter punkt 13. De skal ikke gjøres til faste faner, tomme faner eller et parallelt navigasjonssystem.

Det finnes **ingen brukerrettet `Mer`-fane**. Legacy-runtimen kan fortsatt bruke et frakoblet `more`-panel som intern staging under migrering, men brukeren skal aldri se `Mer`, «Annet», «Tillegg» eller en ny generell restkategori. Staging-innholdet skal rutes uten tap til riktig eierflate.

På alle skjermstørrelser er fanene **én sammenhengende horisontal rad**. Raden brytes ikke. På mobil og smale vinduer kan fanestripen sveipes/rulles horisontalt, og aktiv fane rulles inn i synsfeltet. Tab-semantikk og tastaturnavigasjon beholdes.

## 5. Om

Om svarer på **hva stedet er**.

Typisk innhold:

- `popupDesc` som hovedartikkel;
- `desc` som ingress når den tilfører noe;
- nøkkelfakta;
- Leksikonets hovedartikkel/facts når relevant;
- `spatial_profile`;
- `temporal_profile`-hoveddata;
- `subplaces`;
- fysisk miljø/funksjon;
- `nature_profile`;
- type-spesifikke fysiske seksjoner;
- kildebelagt `interpretation.why_it_matters` når dette forklarer selve stedet;
- kildebelagte `interpretation.counterpoints` og inferensgrenser når de nyanserer selve stedet;
- source-eid Knowledge og dokumenterte observasjonsopplysninger når de er **kunnskap om stedet**, ikke en handling eller en konkret samlingsenhet;
- en kompakt «Språk på stedet»-teaser når den tilfører orientering uten å duplisere Språk-fanen.

### Én visuell eier per opplysning

Samme nøkkeltall skal ikke gjentas i heroen og i en type-spesifikk detaljseksjon. Headeren eier orientering som kategori, primært år og stedstype. Den relevante detaljseksjonen eier areal, høyde, høyeste punkt, terreng, fysisk utstrekning, etasjer, kapasitet, materiale og konstruksjon.

People- og Story-antall skal normalt ikke vises som egne hero-nøkkeltall når innholdet allerede har egne seksjoner. Badgeflaten eier fagområde, epoke, underbadges og emner.

Språkteaseren eier bare oppdagelsen av språkflaten. Den skal ikke duplisere hele språkfanen.

### Viktig `popupDesc`-regel

Denne popupkontrakten eier bare **plasseringen** av `popupDesc`.

All produksjon, claims, setning→claim-mapping, teksthash og review eies av:

- `data/places/regler/PLACE_DESCRIPTION_CANONICAL.md`.

Ikke bruk denne filens Om-liste som skriveoppskrift for `popupDesc`.

People skal ikke bli en lang katalog i Om. Personer og personrelasjoner eies brukerrettet av People-samlingen.

Fysiske gjenstander og deres stedsspesifikke «legg merke til»-spor eies brukerrettet av Objects-samlingen.

`nature_profile` er ikke det samme som Nature-rundingen.

## 6. Historie

Historie er tidslinje- og kontekstflaten.

Den kan samle:

- Leksikon `chronology`;
- place `history_layers`;
- dokumenterte historiske bruksspor;
- viktige daterte hendelser;
- historiske sportsarrangementer/rekorder når hovedverdien er kronologi og kontekst.

`chronology` svarer på **hva skjedde når**. En viktig milepæl skal ikke automatisk gjøres om til Story.

Kamper, rekorder, mesterskap og historiske sportsøyeblikk hører normalt her, ikke i en egen Sports-runding.

## 7. Fortellinger

Fortellinger renderer canonical Stories.

Produksjon eies av `docs/STORIES_DATA_GOVERNANCE.md`.

En Story skal ha selvstendig narrativ verdi. Den er ikke:

- en parallell chronology;
- en bred stedsbiografi;
- en viktig dato blåst opp til episode uten narrativ akse.

Nye Stories produseres i Stories-systemet, ikke som lokale popup-objekter.

## 8. Før/etter

Før/etter bruker `place.for_na` / canonical Før/etter-data.

Kan vise:

- historisk bilde;
- dagens bilde;
- `before`;
- `now`;
- `change`;
- konkrete sammenligningspunkter;
- kilder.

Før/etter handler om samme sted gjennom tid og er popupkunnskap, ikke runding.

Før motivvalg skal canonical place-register/manifester kontrolleres. Et bygg, en virksomhet, en park, en plass eller et annet delsted som allerede har egen place-oppføring kan ikke brukes som primært Før/etter-stedfortreder for et overordnet place. Slike steder kan bare vises som tydelig merket supplement eller lenket relasjon. Eksempel: Torggata Bad kan ikke bære hovedparet for Torggata når badet selv er et eget History GO-place; hovedparet for Torggata må vise selve gaten.

## 9. Nyheter

Nyheter holder presse-/notisspor adskilt fra Om, Historie og Stories.

Kan omfatte:

- historiske avisnotiser og samtidige pressebilder;
- nyere dokumenterte driftssaker eller hendelser.

Samtidsopplysninger skal tidskontrolleres og kildebelegges. En liten notis skal ikke blåses opp til Story.

## 10. Lesespor

Lesespor er egen fane.

På stedssiden vises bare oppføringer som eksplisitt er koblet til stedet. Åpne, direkte lesbare tekster prioriteres; betalingsmur skal ikke presenteres som åpent lesespor.

## 11. Kilder

Kilder kan samle brukerrettede, sikre kilder fra:

- `place.source_summary.safe_sources`;
- place/Leksikon `externalLinks`;
- Før/etter-kilder;
- offisielle nettsider, arkiver, databaser og statistikkilder.

Regler:

- brukerrettede URL-er skal være HTTPS;
- duplikater ryddes;
- eksterne lenker åpnes sikkert;
- interne researchnotater, coordinate-audits, hold-back claims og tekniske IDs vises ikke som vanlig kildeinnhold.

## 12. Språk

Språk er en **obligatorisk, stedbundet kunnskapsfane på alle canonicale steder**. Produksjons- og datakontrakten eies av `docs/SPRAKLEKSIKON.md`.

Hvert sted skal researches for stedsspesifikke begreper. Relevante typer kan være:

- fagord og begreper som faktisk hjelper brukeren å forstå stedet;
- stedsnavn, historiske navneformer, kallenavn og lokale betegnelser;
- ord knyttet til stedets funksjon, arkitektur, natur, praksiser, institusjoner eller historie;
- uttrykk og talemåter når de kan dokumenteres;
- uttale når den tilfører stedsspesifikk verdi;
- språkhistorie;
- betydning og eksempelbruk;
- tidsstatus og geografisk utbredelse;
- etymologi når den er dokumentert;
- relaterte steder og språkspor;
- kilder.

**Dialekttrekk er ikke et universelt krav.** De vises bare når dialektlaget er relevant og lovlig eiet etter `docs/SPRAKLEKSIKON.md`. Språkkravet skal aldri brukes som begrunnelse for å dikte dialekt, slang eller lokal egenart.

Brukeren kan eksplisitt samle en språkoppføring. Samlingen skrives til canonical Knowledge V2 (`hg_knowledge_entries_v2`) med `source.type = "language_lexicon"`. Det skal ikke opprettes et parallelt språk- eller dialektlager.

Et produksjonsklart sted kan ikke ha null språkoppføringer eller sette Språk til N/A. Manglende språkfil/oppføringer på et eldre sted er et **produksjonsgap**, ikke bevis på at stedet mangler språk. Runtime beholder Språk-fanen og viser gapet ærlig til innholdet er materialisert.

## 13. Eierstyrt routing av tidligere `Mer`-innhold

Legacy-`Mer` er et **internt staging-lag**, ikke en brukerflate. Alt innhold som kommer dit skal bevares, men rutes etter semantisk eier:

- **Spor og objekter** — `artifacts`, object-like Leksikon-oppføringer og andre dokumenterte fysiske spor vises i **Objects/Gjenstander-popupen**. De blir ikke en ny PlaceCard-samling og teller ikke automatisk som nye Objects dersom canonical Objects-reglene ikke er oppfylt.
- **Legg merke til** — `interpretation.what_to_notice` vises som en underseksjon i **Objects/Gjenstander-popupen** når observasjonen gjelder fysiske gjenstander eller spor. Dette endrer ikke Objects-antallet.
- **Personrelasjoner** — relasjoner mellom personer, eller mellom en person og andre relevante aktører, vises i **People-popupen**. De er ikke en egen `Relasjoner`-fane.
- **Sted→sted-relasjoner** — faktiske relasjoner mellom canonical History GO-steder eies fortsatt av **Relaterte steder (`related`)**. De skal ikke flyttes inn i People.
- **Betydning** — `interpretation.why_it_matters` vises under **Om** når det forklarer hvorfor stedet er viktig.
- **Motpunkter** — `interpretation.counterpoints` og tydelige inferensgrenser vises under **Om** som nyansering av stedskunnskapen.
- **Kunnskap** — source-eid Knowledge/funfacts plasseres under **Om** eller den subsystem-/samlingsflaten som semantisk eier opplysningen. `Kunnskap` er ikke en generell popupfane.
- **Observasjoner** — dokumenterte observasjonsopplysninger som er kunnskap om stedet plasseres under **Om** eller riktig samling. Selve handlingen Observer beholder sitt eget flow og blir ikke popupfane.
- **Språk** — eies separat av Språkleksikon-kontrakten og er en fast obligatorisk stedspopupfane.

### Ingen informasjon skal forsvinne

Routing er en **presentasjonsendring**, ikke en datasanering. Source-data skal ikke slettes, omskrives eller kopieres til en ny sannhetskilde bare fordi brukerflaten endres.

Den samme opplysningen skal heller ikke vises parallelt som både egen stedspopupfane og som seksjon i Objects/People/Om. Én brukerrettet eier per opplysning er hovedregelen.

Ukjent legacy-innhold skal ikke bli en ny `Mer`, «Annet» eller «Tillegg»-fane. Det skal holdes synlig under **Om** inntil canonical eier er avklart og reviewet.

## 14. På stedet

På stedet er **ikke en fast knapperekke**. Synlighet eies av den canonical kategori-/stedstype-kontrakten:

- `docs/PLACE_ONSITE_SYSTEM.md`;
- `data/categories/place_onsite_contract.json`.

Policyen har tre moduser: `always`, `whenData` og `never`. Canonical kategori bestemmer grunnpolicyen, mens fysisk stedstype kan overstyre den.

Bredt tilgjengelige møteflater er **Social Meet / Avtal å møtes** og **Kunnskapsmøte / Spotmeeting**. Events er kategori- og datastyrt. **Lek vises bare for faktiske lekeplasser/lekeparker**, uavhengig av hvilken overordnet kategori stedet tilhører.

`tasks_profile` / Oppgaver er ikke en del av History GO-produktet og skal ikke produseres eller presenteres.

`training_profile` er ikke en generell På stedet-handling. Trening er type-spesifikt innhold og vises i **stedspopupen for sportssteder** når relevant.

Quiz, Observer, Notat og Rute beholder egne flows utenfor På stedet-baren.

## 15. Rundinger og samlingspopuper

Rundings-/samlingsmodellen eies **kun** av `data/places/README_place_rounds.md`. Popup-kontrakten gjentar ikke palett, profiler, antall eller naturkartkrav.

Eiergrensen mot stedspopupen er likevel eksplisitt:

- People-popupen kan vise personrelasjoner i tillegg til personlisten;
- Objects-popupen kan vise `Spor og objekter` og `Legg merke til` i tillegg til canonical Objects-listen;
- `related` eier place→place-relasjoner;
- disse underseksjonene oppretter aldri nye PlaceCard-samlingsflater og endrer ikke samlingsantall uten at canonical samlingsdata faktisk gjør det.

Språk er et popup-/kunnskapslag, ikke en ny runding.

## 16. Wonderkammer

Wonderkammer er legacy migreringsgrunnlag, ikke en ny popupflate eller runding.

Legacy-innhold migreres etter faktisk type til subsystemet som eier innholdet. Personverk hører i People-profilen, fysiske kunstverk kan være Objects, og tidsbundne produksjoner hører i Events/På stedet.

Nye Wonderkammer-entries skal ikke produseres gjennom popup-systemet.

## 17. Strukturerte place-felt

### `spatial_profile`

Kildebelagte mål og fysisk form. Gameplay-radius `r` er ikke areal.

### `temporal_profile`

Få hovedmilepæler når ett `year` ikke er nok. Detaljert chronology hører i Historie.

### `subplaces`

Reelle delsteder/soner. De kan være compatibility-kilde for Spots, men nye rent visuelle Spot-kort bruker normalt `place.spots` etter rundingkontrakten.

### `history_layers`

Kort historisk lagdeling til Historie; ikke erstatning for canonical chronology.

### `nature_profile`

Landskap/naturtype/habitat/sesong til Om. Ikke automatisk Nature-runding.

### `source_summary`

Brukerrettede sikre kilder til Kilder. Interne audits/researchfelt vises ikke.

Språkleksikon skal ikke legges inn som et nytt strukturert place-felt; språkdata eies separat av `data/leksikon/sprak/`.

## 18. Typeprofiler

Typeprofiler er researchprioritering, ikke krav om kunstig feltdekning.

Eksempler:

- park/grøntområde → areal, topografi, geologi, landskap, delsteder, historiske lag;
- gate/vei → start/slutt, lengde, segmenter, kryss, adresser, infrastruktur, navnehistorie;
- bygning → arkitekt, byggeår, stil, materialer, konstruksjon, bruk, vern;
- torg/plass/byrom → avgrensning, fasader, monumenter, bruk, ombygging;
- sportssted → sportstype, arena-/anleggstype, klubber/lag og relevant `training_profile` i stedspopupen.

Faktiske tekster følger fortsatt `PLACE_DESCRIPTION_CANONICAL.md`.

## 19. Sluttregel

Popupen er produksjonsklar når:

1. alle åtte faste faner er vurdert og fungerer;
2. Språk har reelt, stedsspesifikt og kildebundet innhold; Språk kan ikke være N/A;
3. dialekt er bare produsert når area-eierskap og kilder tillater det;
4. tidligere `Mer`-innhold er rutet til riktig eierflate uten tap eller duplisering;
5. Objects-popupen eier relevante `Spor og objekter`/`Legg merke til`-seksjoner, og People-popupen eier personrelasjoner;
6. place→place-relasjoner forblir hos `related`;
7. betydning, motpunkter og generell stedskunnskap ligger under Om eller annen faktisk canonical eier;
8. innholdet kommer fra riktig canonical eier;
9. `desc`/`popupDesc` har bestått sin egen produksjonsprotokoll;
10. Stories/People/Nature/Quiz/Språk ikke er lokalt improvisert;
11. popupen ikke brukes som restplass for rundinger eller handlinger;
12. UI og relevante audits/tester passerer.

Full stedsgate ligger i `docs/PLACE_PRODUCTION_CHECKLIST.md`.