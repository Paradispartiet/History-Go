# History GO — stedspopup-system

Status: **canonical**  
Eier: `place_popup_presentation_contract`  
Basisruntime: `js/ui/place-popup-v2.js`  
Faner: `js/ui/place-popup-tabs.js`  
På stedet: `js/ui/place-onsite-surface.js`  
Sist kontrollert: **2026-07-28**

Stedspopupen er den komplette brukerrettede **kunnskapssiden** for ett canonical History GO-sted. PlaceCard er det kompakte kontrollrommet.

Sted-for-sted produksjonsoppskrift:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

Tre flater har forskjellige roller:

1. **Rundinger** = visuelle samlinger av ting.
2. **På stedet** = events, møter/kunnskapsmøter og konkrete handlinger.
3. **Stedspopupen** = kunnskap om stedet.

---

## 1. Source of truth

Popupen aggregerer eksisterende canonical data. Den oppretter ikke en ny stedssannhet.

- manifest-loadede place-filer eier identitet, `desc`, `popupDesc` og place-profiler;
- Leksikon eier hovedartikkel, facts, chronology, nyhetsspor og `externalLinks`;
- Stories-systemet eier canonical Stories;
- `for_na` eier Før/etter;
- Lesespor-systemet eier Lesespor;
- source summaries og eksterne lenker gir brukerrettede kilder;
- observations/knowledge eies av sine systemer;
- `tasks_profile`, `training_profile`, `play_profile`, events og møteflater eier På stedet-innhold.

Data skal ikke kopieres inn i én gigantisk place-fil bare fordi de vises samlet.

---

## 2. Canonical popupfaner

Popupen har åtte faner:

1. **Om**
2. **Historie**
3. **Fortellinger**
4. **Før/etter**
5. **Nyheter**
6. **Lesespor**
7. **Kilder**
8. **Mer**

På mobil er dette én horisontalt scrollbar fanestripe, ikke et nytt menygrid.

Fanene skal bruke tilgjengelig semantikk og tastaturnavigasjon (`tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`, venstre/høyre/Home/End).

---

## 3. Om

**Om** forklarer hva stedet er.

Typisk innhold:

- `popupDesc` som hovedartikkel;
- `desc` som ingress når den tilfører noe;
- nøkkelfakta;
- Leksikonets hovedartikkel/facts når det tilfører dokumentert innhold;
- `spatial_profile`;
- `temporal_profile`-hoveddata;
- `subplaces`;
- bygd miljø/funksjon;
- `nature_profile` som landskaps-/naturkarakter;
- type-spesifikke fysiske seksjoner;
- «Se etter på stedet» når det beskriver et fysisk kjennetegn, ikke en oppgave.

People skal ikke bli en lang katalog i Om. Personer eies brukerrettet av People-rundingen.

`nature_profile` er ikke det samme som Nature-rundingen.

---

## 4. Historie

**Historie** er tidslinje- og kontekstflaten.

Den kan samle:

- Leksikon `chronology`;
- place `history_layers`;
- dokumenterte historiske bruksspor;
- viktige daterte hendelser;
- historiske sportsarrangementer/rekorder når hovedverdien er kronologi og kontekst.

### Chronology-regel

`chronology` svarer på **hva skjedde når**. Den skal ikke gjøres om til Story bare for å fylle Fortellinger.

En milepæl hører her; en sammenhengende kildebelagt episode kan høre i Stories.

---

## 5. Fortellinger

**Fortellinger** renderer canonical Stories.

Reglene i `docs/STORIES_DATA_GOVERNANCE.md` gjelder:

- Story skal ha egen narrativ verdi;
- Story er ikke parallell chronology;
- Story er ikke bred stedsbiografi bare fordi stedet er viktig;
- episode-validitet erstatter ikke narrativ storytest;
- aktører, tid, handling og sted må være dokumentert.

Legacy Leksikon-stories kan bare vises som kompatibilitet når de ikke dupliserer canonical Stories. Nye Stories produseres i Stories-systemet.

---

## 6. Før/etter

**Før/etter** bruker `place.for_na`.

Den kan vise:

- historisk bilde;
- dagens bilde;
- `before`;
- `now`;
- `change`;
- konkrete ting brukeren kan sammenligne;
- kilder.

Før/etter handler om **samme sted gjennom tid** og er derfor popupkunnskap, ikke runding.

---

## 7. Nyheter

**Nyheter** holder presse-/notisspor adskilt fra Om, Historie og Stories.

### Gamle nyheter

Historiske avisnotiser, lokale konflikter, samtidige pressebilder og andre arkivbaserte nyhetsspor.

### Nyere notiser

Nyere dokumenterte hendelser/driftssaker der de er relevante for stedet.

Nyheter skal behandles proporsjonalt. En liten notis skal ikke blåses opp til Story.

Samtidsopplysninger skal tidskontrolleres og kildebelegges.

---

## 8. Lesespor

**Lesespor** er egen fane.

På stedssiden vises bare oppføringer der `place_ids` eksplisitt inneholder stedet.

Den stedsspesifikke flaten prioriterer åpne, direkte lesbare tekster. Oppføringer eksplisitt merket betalingsmur/abonnement skal ikke vises som åpne stedsspor.

---

## 9. Kilder

**Kilder** kan samle:

- `place.source_summary.safe_sources`;
- brukerrettede source-summary-strenger;
- place `externalLinks`;
- Leksikon `externalLinks`;
- Før/etter-kilder;
- offisielle nettsider, arkiv, databaser og statistikkilder.

Regler:

- brukerrettede URL-er skal være HTTPS;
- eksterne lenker åpnes sikkert;
- duplikater ryddes;
- interne researchnotater, coordinate-audits, hold-back-påstander og tekniske IDs skal ikke vises som vanlig kildeinnhold.

---

## 10. Mer

**Mer** er smalere kunnskapsinnhold, ikke en restkategori.

Tillatt innhold kan være:

- Språkleksikon;
- observations;
- knowledge/funfacts når unlockregler tillater det;
- curated relations som forklarer stedet;
- kildebelagte «legg merke til»-momenter;
- brukerrettede klassifikasjoner/tags.

Handlinger skal ikke ligge under Mer.

Fysiske objekter/detaljer/spots skal migreres til sine visuelle samlinger, ikke bli liggende som permanent restinnhold i Mer.

---

## 11. På stedet

`#pcEventsBox` / **På stedet** ligger i PlaceCard under rundingene og er canonical flate for det som kan gjøres eller skjer ved stedet.

Tre grupper:

### Events

Canonical events som faktisk skjer/er registrert ved stedet. Historiske events hører i Historie.

### Møter

- Social Meet;
- Kunnskapsmøte / Spotmeeting.

Møteflater skal bruke eksisterende privacy- og backendgrenser. Presentasjonen skal ikke eksponere live-posisjon.

### Gjør på stedet

- `tasks_profile` → Oppgaver;
- `training_profile` → Trening;
- `play_profile` → Lek når det faktisk finnes.

Quiz, Observer, Notat og Rute kan fortsatt ha egne handlingsknapper/flows.

---

## 12. Rundinger

Canonical rundingkontrakt ligger i `data/places/README_place_rounds.md`.

Rundingpaletten er:

```text
badges
people
works
objects
details
spots
nature
brands
```

Et ferdig sted viser nøyaktig 4 eller 6.

- Badges er obligatorisk.
- Alle valgte rundinger skal være bildeklare.
- Nature er valgfri.
- Brands betyr bedrifter og kjente merker med dokumentert stedskobling.
- Civication Store er ikke runding.
- Wonderkammer er ikke runding.
- Leksikon/Fortellinger/Før/etter er popupkunnskap.
- Tasks/Training/Play er På stedet.

---

## 13. Wonderkammer

Wonderkammer er **legacy migreringsgrunnlag**, ikke ny PlaceCard-runding eller ny popupflate.

Canonical beslutning ligger i `data/wonderkammer/wonderkammer.md`.

Legacy-innhold klassifiseres etter faktisk type:

- fysisk gjenstand → Objects;
- liten detalj/spor → Details;
- fysisk delsted → Spots;
- person → People;
- verk → Works;
- natur → Nature;
- handling → På stedet;
- navigasjon → relations/NextUp;
- chronology/hendelse → Historie;
- narrativ episode → Stories når storytesten består.

Nye Wonderkammer-entries skal ikke produseres.

---

## 14. Strukturerte place-felt

### `spatial_profile`

Kildebelagte mål og fysisk form. Areal lagres i m², utstrekning/høyde i meter og `elevation_masl` i meter over havet. Gameplay-radius `r` er ikke areal.

### `temporal_profile`

Få tydelige hovedmilepæler når ett `year` ikke er nok. Detaljert kronologi hører i Historie.

### `subplaces`

Tydelige delsteder/objekter/soner. Et delsted uten egen canonical place-identitet skal ikke automatisk opprettes som nytt sted og kan være kilde for Spots.

### `history_layers`

Kort historisk lagdeling til Historie. Er ikke erstatning for canonical chronology.

### `nature_profile`

Beskriver landskap/naturtype/habitat/sesong og observerbare naturtrekk i Om. Nature-rundingen er visuell samling av konkrete naturentiteter/fenomener.

### `source_summary`

Brukerrettede sikre kilder til Kilder. Interne audits/researchfelt vises ikke.

---

## 15. Typeprofiler

Typeprofiler er researchprioritering, ikke krav om rundinger eller kunstig feltdekning.

- park/grøntområde: areal, topografi, geologi, delsteder, landskap, historiske lag;
- gate/vei/allé: start/slutt, lengde, segmenter, kryss, adresser, infrastruktur, navnehistorie;
- bygning: arkitekt, byggeår, stil, materialer, konstruksjon, høyde, etasjer, bruk, vern;
- torg/plass/byrom: areal, avgrensning, fasader, monumenter, bruk, ombygging;
- elv/bekk/innsjø/kyst: lengde/vannflate, kilde/utløp, natur, regulering, industri, restaurering;
- rute/sti: start/slutt, lengde, etapper, høydeprofil, underlag, sesong, sikkerhet;
- institusjon/anlegg: grunnlagt, funksjon, bygninger, samlinger, saler, aktører, milepæler;
- kulturminne/monument/kunstverk: opphavsperson, år, materiale, mål, motiv, plassering, vern;
- arkeologisk/historisk lokalitet: datering, synlige strukturer, funn, undersøkelser, vern;
- bydel/strøk/område: avgrensning, delområder, hovedakser, landskap, utviklingsfaser, møteplasser;
- idrettsanlegg: åpning, kapasitet, banemål, hjemmebrukere, arrangementer/rekorder som historiedata, konstruksjon;
- industrielt/teknisk sted: funksjon, driftsperiode, maskiner, energi, størrelse, råvarer, transport, gjenbruk.

---

## 16. Presentasjonsregler

1. Vis bare dokumentert data fra canonical eller eksplisitt kompatible kilder.
2. Skjul tomme seksjoner når de ikke tilfører verdi.
3. Rolig tomtilstand er bedre enn oppdiktet fallback.
4. Ikke dupliser identisk tekst i `popupDesc`, Leksikon og Stories.
5. Ikke generer chronology fra Stories eller Stories fra chronology i runtime.
6. Ikke trekk nye fakta automatisk ut av fri tekst.
7. Ikke vis interne IDs/researchgjeld/coordinate-notater.
8. Bevar én intern vertikal scrollflate for popupen.
9. Header/lukk/hero skal være forståelig uansett aktiv fane.
10. Farge skal ikke være eneste signal for aktiv fane.

---

## 17. Runtime

`js/ui/place-popup-v2.js` lager basispopupen.

`js/ui/place-popup-tabs.js`:

- etablerer fanestrukturen;
- flytter V2-seksjoner til riktig fane;
- laster Leksikon read-only;
- laster canonical Stories;
- laster stedsspesifikke Lesespor;
- renderer Før/etter;
- grupperer nyhetsspor;
- samler brukerrettede kilder;
- laster Språkleksikon.

`js/ui/place-rounds-visual-collections.js` eier canonical visuell rundingpresentasjon.

`js/ui/place-onsite-surface.js` samler events, møter/Kunnskapsmøte og Oppgaver/Lek/Trening under På stedet.

---

## 18. QA

Ved stedproduksjon skal popupen kontrolleres gjennom `docs/PLACE_PRODUCTION_CHECKLIST.md`.

Ved endring av popup-arkitekturen skal minst følgende testes:

1. JavaScript-syntaks;
2. sted med rik Leksikon-data;
3. sted uten Leksikon-data;
4. sted med/uten Stories;
5. sted med `for_na`;
6. sted med gamle/nyere nyheter;
7. sted med Lesespor;
8. sted med externalLinks;
9. mobil med åtte faner;
10. tastaturnavigasjon;
11. Badges/People/Works/Objects/Details/Spots/Nature/Brands som canonical rundingpalett;
12. Leksikon/Fortellinger/Før/etter/Tasks/Training/Play/Civication/Wonderkammer ute av canonical rundinggrid;
13. Badges går til fagverksiden;
14. events/møter ligger under På stedet;
15. Oppgaver/Lek/Trening ligger under På stedet når data finnes;
16. popupen har én vertikal scrollflate.
