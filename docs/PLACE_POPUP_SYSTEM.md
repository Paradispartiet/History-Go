# History GO — stedspopup-system

Status: **canonical**  
Eier: `place_popup_presentation_contract`  
Basisruntime: `js/ui/place-popup-v2.js`  
Faner: `js/ui/place-popup-tabs.js`  
På stedet: `js/ui/place-onsite-surface.js`  
Design: `css/place-popup-v2.css` + `css/place-popup-tabs.css` + `css/place-onsite-surface.css`  
Sist kontrollert: **2026-07-28**

Stedspopupen er den komplette brukerrettede **kunnskapssiden** for ett canonical History GO-sted. PlaceCard er fortsatt det kompakte kontrollrommet rundt stedet.

Tre flater har forskjellige roller:

1. **Rundinger** = visuelle samlinger av ting.
2. **På stedet** = events, møter/kunnskapsmøter og konkrete handlinger.
3. **Stedspopupen** = kunnskap om stedet.

## 1. Source of truth

Popupen aggregerer eksisterende canonical data. Den oppretter ikke en ny stedssannhet.

- manifest-lastede place-filer eier stedets identitet, `desc`, `popupDesc` og place-profiler;
- Leksikon-data eier leksikonartikkel, `chronology`, historiske bruksspor, notiser, språk og `externalLinks`;
- Stories-systemet eier canonical Stories;
- Lesespor-systemet eier Lesespor;
- `for_na` eier før/etter-innhold;
- source summaries og `externalLinks` eier brukerrettede kildereferanser;
- observations og knowledge eies fortsatt av sine respektive systemer;
- `tasks_profile`, `training_profile`, eventuelle `play_profile`, Social Meet, Spotmeeting og canonical events eier På stedet-innholdet.

Dataene skal ikke kopieres inn i én gigantisk place-fil bare fordi de vises samlet.

## 2. Canonical popupfaner

Under hero ligger en horisontalt scrollbar fanestripe:

1. **Om**
2. **Historie**
3. **Fortellinger**
4. **Før/etter**
5. **Nyheter**
6. **Lesespor**
7. **Kilder**
8. **Mer**

På mobil skal fanene være én horisontal stripe, ikke et flerraders menygrid.

Fanene bruker `tablist` / `tab` / `tabpanel`, `aria-selected`, `aria-controls` og tastaturnavigasjon med venstre/høyre/Home/End.

## 3. Om

**Om** forklarer hva stedet er.

Typisk innhold:

- `popupDesc` som hovedartikkel;
- `desc` som kort ingress når den avviker fra hovedartikkelen;
- nøkkelfakta;
- leksikonets hovedartikkel når den tilfører dokumentert innhold utover `popupDesc`;
- leksikonets `facts`;
- `spatial_profile`;
- `temporal_profile`-hoveddata;
- `subplaces`;
- bygd miljø og funksjon;
- `nature_profile` som landskaps-/naturkarakter;
- type-spesifikke fysiske seksjoner;
- «Se etter på stedet» når dette beskriver et fysisk kjennetegn, ikke en oppgave.

People skal ikke bli en lang sekundær katalog i Om. Personer eies brukerrettet av People-rundingen.

## 4. Historie

**Historie** er tidslinje- og kontekstflaten.

Den kan samle:

- Leksikon `chronology`;
- place `history_layers`;
- leksikonoppføringer klassifisert som historie / bruksspor;
- dokumenterte historiske hendelser og samfunnslag;
- historiske arrangementer når hovedverdien er kronologi/kontekst.

### Chronology-regel

`chronology` svarer på **hva skjedde når**. Den skal ikke gjøres om til Stories bare for å fylle Fortellinger-fanen.

En kort milepæl som «1969 — Y-blokka sto ferdig» hører hjemme her. En sammenhengende fortelling om kunst, arkitektur og strid hører hjemme i Stories.

## 5. Fortellinger

**Fortellinger** renderer canonical Stories fra Stories-systemet.

Reglene i `docs/STORIES_DATA_GOVERNANCE.md` gjelder:

- Stories skal ha egen narrativ verdi;
- de skal ikke være en parallell chronology;
- flere chronology-punkter kan inngå i én Story;
- teknisk `episode_v1`-gyldighet erstatter ikke den narrative storytesten.

Eldre `article.stories` fra Leksikon kan vises som legacy-spor når de ikke dupliserer canonical Stories. Nye fortellinger skal produseres i Stories-systemet.

## 6. Før/etter

**Før/etter** overtar brukerrollen til den tidligere `før_nå`-rundingen.

Source-data beholdes i `place.for_na`.

Fanen kan vise:

- historisk bilde;
- dagens bilde;
- `before`;
- `now`;
- `change`;
- konkrete ting brukeren kan sammenligne i dagens landskap;
- egne kilder for materialet.

Før/etter handler om **samme sted gjennom tid** og er derfor en popupfane, ikke en samling av separate entiteter.

## 7. Nyheter

**Nyheter** er egen fane og holder korte presse-/notisspor adskilt fra hovedartikkel og Stories.

### Gamle nyheter

Historiske avisnotiser, eldre mediesaker, moralpanikker, lokale konflikter og andre arkivbaserte nyhetsspor.

### Nyere notiser

Nyere lokalsaker og korte hendelsesspor, for eksempel drift, brann, politi eller annen dokumentert samtidshendelse.

Notiser skal behandles proporsjonalt. En liten lokalsak skal ikke omskrives til en stor Story bare fordi den finnes i nyhetsarkivet.

## 8. Lesespor

**Lesespor** er egen fane.

Når fanen åpnes fra et bestemt sted, skal den bare vise tekster hvis `place_ids` eksplisitt inneholder stedet.

Den stedsspesifikke flaten prioriterer åpne, direkte lesbare tekster. Oppføringer eksplisitt merket betalingsmur/abonnement skal ikke vises her.

Den globale Lesespor-samlingen kan fortsatt eksistere separat.

## 9. Kilder

**Kilder** er egen fane.

Den kan samle:

- `place.source_summary.safe_sources`;
- andre brukerrettede source-summary-strenger;
- place `externalLinks`;
- Leksikon-artiklenes `externalLinks`;
- før/etter-kilder;
- offisielle nettsider, arkiv, databaser og statistikkilder.

Eksterne lenker skal være HTTPS og åpnes med `target="_blank"` + `rel="noopener noreferrer"`.

Kilder-fanen skal aldri vise interne researchnotater, koordinataudit, hold-back-påstander eller tekniske IDs som vanlig brukerinnhold.

## 10. Mer

**Mer** er den smalere kunnskapsflaten. Den skal ikke bli et nytt ustrukturert Leksikon.

Tillatt innhold:

- Språkleksikon;
- observations;
- knowledge/funfacts der eksisterende unlock-regler tillater det;
- curated relations som forklarende koblinger;
- leksikonets tolkning / «legg merke til» / motpunkter;
- klassifikasjon/tagger når de er brukerrettede;
- eldre `artifacts` / objekter som ennå ikke er migrert til riktig samlingssystem.

**Handlinger skal ikke ligge under Mer.**

## 11. På stedet

`#pcEventsBox` / **På stedet** ligger i PlaceCard direkte under rundingene og er den canonical flaten for det som kan gjøres eller skjer ved stedet.

Den kan inneholde tre tydelige grupper:

### Events

Canonical events for stedet. Dette er hendelser som faktisk skjer/er registrert ved stedet, ikke historiske Stories.

### Møter

- vanlig møte / Social Meet;
- Kunnskapsmøte / Spotmeeting.

Møteflater skal bruke de eksisterende privacy- og backendgrensene. Ingen live-posisjon skal eksponeres gjennom denne presentasjonen.

### Gjør på stedet

Tidligere handlingsrundinger flyttes hit:

- `tasks` → Oppgaver;
- `training` → Trening;
- `play` → Lek når stedet faktisk har et `play_profile`.

Source-data beholdes i `tasks_profile`, `training_profile` og eventuelle `play_profile`.

Quiz, Observer, Notat og Rute kan fortsatt ha egne tydelige handlingsknapper/flows i PlaceCard-footer. De skal ikke gjøres til visuelle rundinger bare for å fylle gridet.

Runtime: `js/ui/place-onsite-surface.js`.

## 12. Wonderkammer

Wonderkammer skal ikke vises automatisk i den nye stedspopupen før den konkurrerende datamodellen er konsolidert.

Repoet har historisk brukt navnet om minst tre produktidéer:

1. navigasjonsnett av personer, steder, praksiser og institusjoner;
2. leke-/trenings-/aktivitetssoner med instruksjoner og alder;
3. stedsspesifikke kuriositeter, observerbare detaljer og `actual_site_treasure`-samleobjekter.

Disse er ikke én informasjonsarkitektur. Canonical beslutning og migreringsregler ligger i `data/wonderkammer/wonderkammer.md`.

Inntil migreringen er gjennomført:

- ikke opprett nye generic activity-Wonderkammer;
- ikke bruk Wonderkammer som synonym for relations/NextUp;
- ikke legg Wonderkammer tilbake under Leksikon eller Mer bare for å bevare gammel navigasjon;
- eksisterende source-data beholdes for migrering og audit.

## 13. Strukturerte place-felt

### `spatial_profile`

Brukes for kildebelagte mål og fysisk form. Areal lagres i m², utstrekning/høyde i meter og `elevation_masl` i meter over havet. Gameplay-radius `r` er ikke stedets areal.

### `temporal_profile`

Brukes for få tydelige hovedmilepæler når ett `year` ikke forklarer stedets utvikling. Detaljert kronologi hører hjemme i **Historie**.

### `subplaces`

Brukes når stedet inneholder tydelige delsteder, objekter eller soner. Et delsted uten egen canonical place-identitet skal ikke automatisk opprettes som nytt sted.

### `history_layers`

Kort lesbar historisk lagdeling som vises i **Historie**. Er ikke erstatning for canonical `chronology`.

### `nature_profile`

Beskriver stedets landskap, naturtype, habitat, sesong og observerbare naturtrekk og kan vises i **Om**. Nature-rundingen har en annen rolle: visuell samling av naturentiteter/objekter.

### `source_summary`

Brukerrettede sikre kilder vises i **Kilder**. Interne audit- eller researchfelt vises ikke.

## 14. Typeprofiler

Typeprofilene består som innholdsprioriteringer, ikke rundingskrav:

- park/grøntområde: areal, topografi, geologi, delsteder, landskap, historiske lag;
- gate/vei/allé: start/slutt, lengde, segmenter, kryss, adresser, infrastruktur, navnehistorie;
- bygning: arkitekt, byggeår, stil, materialer, konstruksjon, høyde, etasjer, bruk, vern;
- torg/plass/byrom: areal, avgrensning, fasader, monumenter, bruk, ombygging;
- elv/bekk/innsjø/kyst: lengde, vannflate, kilde/utløp, natur, regulering, industri, restaurering;
- rute/sti: start/slutt, lengde, etapper, høydeprofil, underlag, sesong, sikkerhet;
- institusjon/anlegg: grunnlagt år, funksjon, bygninger, samlinger, saler, aktører, milepæler;
- kulturminne/monument/kunstverk: opphavsperson, år, materiale, mål, motiv, plassering, vern;
- arkeologisk/historisk lokalitet: datering, synlige strukturer, funn, undersøkelser, vern;
- bydel/strøk/område: avgrensning, delområder, hovedakser, landskap, utviklingsfaser, møteplasser;
- idrettsanlegg: åpning, kapasitet, banemål, hjemmeaktører, arrangementer, rekorder, konstruksjon;
- industrielt/teknisk sted: funksjon, driftsperiode, maskiner, energi, størrelse, råvarer, transport, gjenbruk.

## 15. Presentasjonsregler

1. Vis bare dokumentert data fra canonical eller eksplisitt kompatible kilder.
2. Skjul tomme seksjoner når de ikke tilfører verdi.
3. En fane kan ha en rolig tomtilstand uten at appen krasjer.
4. Ikke dupliser samme tekst i `popupDesc`, Leksikon og Stories når innholdet er identisk.
5. Ikke generer chronology fra Stories eller Stories fra chronology i runtime.
6. Ikke trekk nye fakta automatisk ut av fri tekst.
7. Ikke vis interne IDs, researchgjeld eller coordinate-notater.
8. Bevar én intern vertikal scrollflate for popupen.
9. Header, lukkeknapp og hero skal være forståelige uansett aktiv fane.
10. Farge skal ikke være eneste aktiv-tab-signal.

## 16. Runtime

`js/ui/place-popup-v2.js` lager basispopupen.

`js/ui/place-popup-tabs.js`:

- legger på canonical fanestruktur;
- flytter eksisterende V2-seksjoner til riktig fane;
- laster Leksikon-data read-only;
- laster canonical Stories;
- laster stedsspesifikke Lesespor;
- renderer Før/etter fra `for_na`;
- grupperer gamle nyheter og nyere notiser;
- samler brukerrettede kilder;
- laster Språkleksikon;
- opprettholder `read_leksikon`-signalet når leksikoninnhold faktisk finnes.

`js/ui/place-rounds-visual-collections.js` sørger for at PlaceCard bare viser canonical visuelle samlingsrundinger selv om legacy round registry fortsatt kjenner eldre IDs.

`js/ui/place-onsite-surface.js` samler events, møter/Kunnskapsmøte og Oppgaver/Lek/Trening under På stedet.

## 17. QA

Ved endring av denne arkitekturen skal minst følgende kontrolleres:

1. JavaScript-syntaks for nye/endrede UI-filer;
2. sted med rik Leksikon-data;
3. sted uten Leksikon-data;
4. sted med og uten Stories;
5. sted med `for_na`;
6. sted med gamle nyheter og nyere notiser;
7. sted med Lesespor;
8. sted med `externalLinks`;
9. smal mobilvisning med åtte faner;
10. tastaturnavigasjon i fanestripen;
11. People/Nature/Badges/Works/Civication/Brands som visuelle rundinger;
12. Leksikon/Fortellinger/Før-nå/Tasks/Training/Play skjult som canonical rundinger;
13. events og møter synlige under På stedet;
14. Oppgaver/Lek/Trening synlige under På stedet når data finnes;
15. Wonderkammer ikke dukker opp som uavklart blandingsflate;
16. popupen fortsatt har én vertikal scrollflate.
