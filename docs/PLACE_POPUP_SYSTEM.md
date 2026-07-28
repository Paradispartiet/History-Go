# History GO — stedspopup-system

Status: **canonical**  
Eier: `place_popup_presentation_contract`  
Basisruntime: `js/ui/place-popup-v2.js`  
Faner: `js/ui/place-popup-tabs.js`  
Handlingsovergang: `js/ui/place-popup-actions.js`  
Design: `css/place-popup-v2.css` + `css/place-popup-tabs.css`  
Sist kontrollert: **2026-07-28**

Stedspopupen er den komplette brukerrettede kunnskapsflaten for ett canonical History GO-sted. PlaceCard er fortsatt stedets kompakte kontrollrom; rundingene er visuelle samlinger av ting. Brukeren skal ikke måtte åpne en egen «Leksikon»-runding for å komme til stedets artikkel, historie, kilder eller videre lesning.

## 1. Produktgrense

Stedspopupen skal samle og presentere eksisterende canonical data uten å opprette en ny stedssannhet.

Source of truth ligger fortsatt i de systemene som eier dataene:

- manifest-lastede place-filer eier stedets identitet, `desc`, `popupDesc` og strukturerte place-profiler;
- Leksikon-data eier leksikonartikkel, `chronology`, historiske bruksspor, notiser, språk og `externalLinks` der disse finnes;
- Stories-systemet eier canonical Stories;
- Lesespor-systemet eier Lesespor;
- `for_na` eier før/etter-innhold;
- source summaries og `externalLinks` eier brukerrettede kildereferanser;
- observations, knowledge og actions eies fortsatt av sine eksisterende systemer.

Popupen **aggregerer** disse dataene. Den skal ikke kopiere dem inn i én gigantisk place-fil.

## 2. Fast popupstruktur

Header og hero er stedets faste ramme. Under hero ligger en horisontalt scrollbar fanestripe.

Canonical faner:

1. **Om**
2. **Historie**
3. **Fortellinger**
4. **Før/etter**
5. **Nyheter**
6. **Lesespor**
7. **Kilder**
8. **Mer**

På mobil skal fanene være én horisontal stripe som kan scrolles. De skal ikke pakkes til et tett flerraders menygrid.

Fanene bruker semantisk `tablist` / `tab` / `tabpanel`, `aria-selected`, `aria-controls` og tastaturnavigasjon med venstre/høyre/Home/End.

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
- `nature_profile` som beskrivelse av stedets landskap/naturkarakter;
- type-spesifikke fysiske seksjoner;
- «Se etter på stedet» når dette er et kjennetegn ved stedet, ikke et Wonderkammer- eller oppgaveobjekt.

**People er ikke en lang sekundær katalog i Om.** Personer eies brukerrettet av People-rundingen som visuell samling. Relasjoner kan fortsatt ligge under Mer når de gir forklarende verdi.

## 4. Historie

**Historie** er tidslinje- og kontekstflaten.

Den kan samle:

- Leksikon `chronology`;
- place `history_layers`;
- leksikonoppføringer klassifisert som historie / bruksspor;
- dokumenterte historiske hendelser og samfunnslag;
- relevante historiske arrangementer.

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

Eldre `article.stories` fra Leksikon kan vises som legacy-spor når de ikke dupliserer canonical Stories, men nye fortellinger skal produseres i Stories-systemet.

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
- egne kilder for før/etter-materialet.

Før/etter handler om **samme sted gjennom tid** og er derfor en stedspopupfane, ikke en samling av separate entiteter.

## 7. Nyheter

**Nyheter** er egen fane og skal holde korte presse-/notisspor adskilt fra hovedartikkel og Stories.

To hovedseksjoner:

### Gamle nyheter

Historiske avisnotiser, eldre mediesaker, moralpanikker, lokale konflikter og andre arkivbaserte nyhetsspor.

Runtimeklassifikasjon omfatter blant annet historiske `historical_news`, `gamle_nyheter`, avisnotiser og tilsvarende typer.

### Nyere notiser

Nyere lokalsaker og korte hendelsesspor, for eksempel drift, brann, politi, arrangement eller annen dokumentert samtidshendelse.

Notiser skal behandles proporsjonalt. En liten lokalsak skal ikke omskrives til en stor Story bare fordi den finnes i nyhetsarkivet.

## 8. Lesespor

**Lesespor** er egen fane.

Når fanen åpnes fra et bestemt sted, skal den bare vise tekster hvis `place_ids` eksplisitt inneholder dette stedet.

Den stedsspesifikke fanen skal prioritere åpne, direkte lesbare tekster. Oppføringer som eksplisitt er merket som betalingsmur, abonnement eller tilsvarende skal ikke vises i denne flaten.

Den globale Lesespor-samlingen kan fortsatt eksistere separat; stedspopupen er bare et stedsspesifikt utsnitt.

Lesespor-data flyttes ikke inn i place-filen.

## 9. Kilder

**Kilder** er egen fane.

Den kan samle:

- `place.source_summary.safe_sources`;
- andre brukerrettede source-summary-strenger;
- place `externalLinks`;
- Leksikon-artiklenes `externalLinks`;
- før/etter-kilder;
- offisielle nettsider, arkiv, databaser, statistikk og andre eksplisitt kuraterte oppslag.

Eksterne lenker skal være HTTPS og åpnes sikkert med `target="_blank"` og `rel="noopener noreferrer"`.

Kilder-fanen skal aldri vise interne researchnotater, koordinataudit, hold-back-påstander eller tekniske IDs som vanlig brukerinnhold.

## 10. Mer

**Mer** er den smalere restflaten. Den skal ikke bli et nytt ustrukturert Leksikon.

Tillatt innhold:

- Språkleksikon;
- observations;
- knowledge/funfacts der eksisterende unlock-regler tillater det;
- curated relations som forklarende koblinger;
- leksikonets tolkning / «legg merke til» / motpunkter;
- klassifikasjon/tagger når de er brukerrettede;
- eldre `artifacts` / objekter som ennå ikke er migrert til riktig samlingssystem;
- overgangsseksjonen **Gjør på stedet**.

### Gjør på stedet

Tidligere handlingsrundinger er ikke visuelle samlinger:

- `tasks`
- `training`
- `play`

Eksisterende `tasks_profile`, `training_profile` og eventuelle `play_profile` skal derfor fortsatt være tilgjengelige under **Mer → Gjør på stedet** frem til en egen canonical handlingsflate eventuelt etableres.

## 11. Wonderkammer er midlertidig avgrenset

Wonderkammer skal **ikke** vises automatisk i den nye stedspopupen før den konkurrerende datamodellen er konsolidert.

Repoet har over tid brukt navnet Wonderkammer om minst tre ulike produktidéer:

1. et navigasjonsnett av personer, steder, praksiser og institusjoner;
2. leke-/trenings-/aktivitetssoner med instruksjoner og alder;
3. stedsspesifikke kuriositeter, observerbare detaljer og `actual_site_treasure`-samleobjekter.

Disse er ikke én informasjonsarkitektur. Canonical beslutning og migreringsregler ligger i `data/wonderkammer/wonderkammer.md`.

Inntil migreringen er gjennomført:

- ikke opprett nye generic activity-Wonderkammer;
- ikke bruk Wonderkammer som synonym for relations/NextUp;
- ikke legg Wonderkammer tilbake under Leksikon eller Mer bare for å bevare gammel navigasjon;
- eksisterende source-data beholdes for migrering og audit.

## 12. Strukturerte place-felt

### `spatial_profile`

Brukes for kildebelagte mål og fysisk form.

```json
{
  "spatial_profile": {
    "area_m2": 48000,
    "linear_extent_m": 500,
    "highest_point": {
      "name": "Blåsen",
      "elevation_masl": 81
    },
    "height_m": null,
    "terrain_type": "kalksteinsrygg",
    "landform": "langstrakt høydepark",
    "boundary_description": "Mellom Pilestredet, Stensgata, Thereses gate og Sporveisgata.",
    "measurement_status": "source_verified",
    "sources": []
  }
}
```

Regler:

- areal lagres i kvadratmeter;
- lengde og høyde lagres i meter;
- `elevation_masl` betyr meter over havet;
- `height_m` betyr fysisk byggehøyde eller konstruksjonshøyde;
- popupen formaterer enhetene;
- gameplay-radius `r` er ikke stedets areal.

### `temporal_profile`

Brukes for få tydelige hovedmilepæler når ett `year` ikke forklarer stedets utvikling.

```json
{
  "temporal_profile": {
    "official_name_year": 1891,
    "development_period": "1890–1900",
    "completed_year": 1943
  }
}
```

Detaljert kronologi hører hjemme i chronology/History-fanen, ikke som stadig flere temporal_profile-felter.

### `subplaces`

Brukes når stedet inneholder tydelige delsteder, objekter eller soner.

Hvis `id`, `place_id` eller `target_id` treffer et eksisterende canonical place, kan kortet åpne det stedet. Et delsted uten egen canonical place-identitet skal ikke automatisk opprettes som nytt sted.

### `history_layers`

`history_layers` er en kort lesbar historisk lagdeling og vises i **Historie**. Den er ikke erstatning for `popupDesc` eller canonical `chronology` når detaljert årstidslinje allerede finnes.

### `nature_profile`

Beskriver stedets landskap, naturtype, habitat, sesong og observerbare naturtrekk. Dette kan vises i **Om**.

Nature-rundingen har en annen rolle: den er den visuelle samlingen av naturentiteter/objekter.

### `source_summary`

Brukerrettede sikre kilder vises i **Kilder**. Interne audit- eller researchfelt vises ikke.

## 13. Typeprofiler

Typeprofilene fra tidligere kontrakt består som innholdsprioriteringer:

- park/grøntområde: areal, topografi, geologi, delsteder, landskap og historiske lag;
- gate/vei/allé: start/slutt, lengde, segmenter, kryss, adresser, infrastruktur og navnehistorie;
- bygning: arkitekt, byggeår, stil, materialer, konstruksjon, høyde, etasjer, bruk og vern;
- torg/plass/byrom: areal, avgrensning, fasader, monumenter, bruk og ombygging;
- elv/bekk/innsjø/kyst: lengde, vannflate, kilde/utløp, natur, regulering, industri og restaurering;
- rute/sti: start/slutt, lengde, etapper, høydeprofil, underlag, sesong og sikkerhet;
- institusjon/anlegg: grunnlagt år, funksjon, bygninger, samlinger, saler, aktører og milepæler;
- kulturminne/monument/kunstverk: opphavsperson, år, materiale, mål, motiv, plassering, vern og restaurering;
- arkeologisk/historisk lokalitet: datering, synlige strukturer, funn, undersøkelser, vern og hypoteseskille;
- bydel/strøk/område: avgrensning, delområder, hovedakser, landskap, utviklingsfaser og møteplasser;
- idrettsanlegg: åpning, kapasitet, banemål, hjemmeaktører, arrangementer, rekorder og konstruksjon;
- industrielt/teknisk sted: funksjon, driftsperiode, maskiner, energi, størrelse, råvarer, transport og gjenbruk.

Profilen bestemmer **hva Om og Historie bør prioritere**, ikke hvilke rundinger som må fylles.

## 14. Presentasjonsregler

1. Vis bare dokumentert data fra canonical eller eksplisitt kompatible kilder.
2. Skjul tomme seksjoner inne i en fane når de ikke tilfører verdi.
3. En fane kan ha en rolig tomtilstand uten at appen krasjer.
4. Ikke dupliser samme tekst i `popupDesc`, Leksikon og Stories hvis innholdet er identisk.
5. Ikke generer chronology fra Stories eller Stories fra chronology i runtime.
6. Ikke trekk nye fakta automatisk ut av fri tekst.
7. Ikke vis interne IDs, researchgjeld eller coordinate-notater.
8. Bevar én intern vertikal scrollflate for popupen.
9. Header, lukkeknapp og hero skal være forståelige uansett aktiv fane.
10. Farge skal ikke være eneste aktiv-tab-signal.

## 15. Bildelogikk

Hero-bildekandidater prøves fortsatt i denne rekkefølgen:

`popupImage` → `image` → `cardImage` → `imageCard` → `frontImage`.

Når ingen kandidater virker, skal popupen vise en designet stedflate, ikke et ødelagt bildeikon.

Før/etter-fanen kan i tillegg bruke egne historiske og nåværende bilder når `for_na` har eksplisitte bildefelt.

## 16. Runtime-arkitektur

`js/ui/place-popup-v2.js` lager fortsatt basispopupen og eksisterende strukturerte seksjoner.

`js/ui/place-popup-tabs.js`:

- legger på den canonical fanestrukturen;
- flytter eksisterende V2-seksjoner til riktig fane;
- laster Leksikon-data read-only;
- laster canonical Stories;
- laster stedsspesifikke Lesespor;
- renderer Før/etter fra `for_na`;
- grupperer gamle nyheter og nyere notiser;
- samler brukerrettede kilder;
- laster Språkleksikon;
- opprettholder `read_leksikon`-signalet når leksikoninnholdet faktisk finnes.

`js/ui/place-popup-actions.js` holder eldre handlingsprofiler tilgjengelige under Mer.

`js/ui/place-rounds-visual-collections.js` sørger for at PlaceCard bare viser canonical visuelle samlingsrundinger selv om legacy round registry fortsatt kjenner eldre IDs.

## 17. QA

Ved endring av denne arkitekturen skal minst følgende kontrolleres:

1. JavaScript-syntaks for nye/endrede UI-filer;
2. sted med rik Leksikon-data, for eksempel Stensparken;
3. sted uten Leksikon-data;
4. sted med Stories;
5. sted uten Stories;
6. sted med `for_na`;
7. sted med gamle nyheter og nyere notiser;
8. sted med Lesespor;
9. sted med `externalLinks`;
10. smal mobilvisning med åtte faner;
11. tastaturnavigasjon i fanestripen;
12. at People/Nature/Badges/Works/Civication/Brands fortsatt fungerer som PlaceCard-rundinger;
13. at Leksikon/Fortellinger/Før-nå/Tasks/Training/Play ikke vises som canonical rundinger;
14. at Wonderkammer ikke dukker opp som uavklart blandingsflate;
15. at popupen fortsatt har én vertikal scrollflate.
