# History GO — canonical PlaceCard-rundinger

Status: **canonical produksjons- og presentasjonskontrakt**  
Eier: `place_rounds_contract`  
Runtime: `js/ui/place-rounds-visual-collections.js`  
Sted-for-sted arbeidsflyt: `docs/PLACE_PRODUCTION_CHECKLIST.md`  
Sist kontrollert: **2026-07-28**

PlaceCard-rundinger er små, visuelle samlingsinnganger. De skal representere **identifiserbare ting med et meningsfullt bilde**, ikke bli en ekstra meny for all kunnskap eller alle handlinger ved et sted.

> **Rundinger viser ting brukeren kan se, åpne og samle. Stedspopupen viser kunnskap om stedet. På stedet viser hva man kan gjøre og hva som skjer her.**

## 1. Layout

Et ferdig PlaceCard viser nøyaktig **4 eller 6** rundinger.

- fire = 2 × 2;
- seks = 3 × 2;
- fem vises aldri;
- `badges` er obligatorisk;
- hver valgt runding skal ha reelt stedsspesifikt og bildeklart innhold;
- tekst-only placeholder, tom compatibility-rad eller fallback-emoji gjør ikke en runding produksjonsklar;
- ikke produser filler for å nå seks.

Hvis bare fire samlinger er sterke nok, brukes fire.

## 2. Canonical palett

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

`rounds` er presentasjonskuratering, ikke fagklassifisering eller spillerprogress.

## 3. `badges`

Badges viser stedets canonical hovedkategori og relevante underbadges.

- hovedkategori kommer fra `place.category`;
- underbadges kommer fra `underbadge_ids`;
- klikk åpner `fagverk-sted.html?place=<place_id>`;
- navigasjonsrollen mellom Merket og Faget eies av `docs/FAGVERK_NAVIGATION.md`.

Badge-rundingen skal bruke faktisk badgegrafikk, ikke en filler-emoji som produksjonsbilde.

## 4. `people`

Navngitte personer med dokumentert konkret stedstilknytning og egnet portrett/bilde.

People skal gjenbruke canonical People-records. Nye/reviderte koblinger følger:

- `docs/people-of-places-method.md`;
- `docs/PEOPLE_PROFILE_CANONICAL.md`;
- `docs/PEOPLE_IMAGES.md`.

En tilfeldig kjent person, gjest eller generell bransjetilknytning er ikke nok.

## 5. `works`

Identifiserbare verk og produksjoner skapt som verk.

Eksempler:

- billedkunst og skulptur;
- litterære verk;
- musikkverk/album;
- film;
- fotografisk verk;
- scenisk verk;
- arkitekturverk;
- selvstendig street art.

Skille mot Objects:

- en bok som verk → `works`;
- et bestemt originalmanuskript → `objects`.

Historiske hendelser, kamper, rekorder og mesterskap er ikke Works; de hører normalt i popupens Historie.

## 6. `objects`

Fysiske, identifiserbare gjenstander med dokumentert stedstilknytning.

Typiske undertyper:

- artefakt;
- arkeologisk funn;
- maskin;
- kjøretøy;
- våpen;
- instrument;
- klær/drakt;
- pokal/medalje;
- produkt;
- dokumentobjekt;
- relikvie;
- museumsgjenstand;
- teknisk utstyr.

### Canonical dataform for nye/reviderte place-data

Bruk **`place.objects`**.

Et minimumselement er:

```json
{
  "id": "stabil_lokal_eller_canonical_id",
  "title": "Navn på gjenstanden",
  "image": "bilder/...",
  "description": "Kort stedsspesifikk forklaring"
}
```

Krav:

- `id` skal være stabil og unik innen relevant eierflate;
- `title`/navn skal identifisere selve tingen;
- `image` skal vise riktig ting;
- `description` skal forklare hvorfor akkurat denne tingen hører til stedet;
- faktiske påstander skal være kildebelagt gjennom stedets/eierens canonical evidenssystem;
- ikke opprett nye ustandardiserte kildefelt bare fordi runtime ikke renderer kilder i rundingen.

### Compatibility

Runtime kan lese eldre `place.artifacts` og enkelte fysisk kvalifiserte Civication-elementer. Dette er compatibility/migreringskilder.

**Nye Objects skal normalt legges i `place.objects`, ikke `artifacts`.**

Et Object kan samtidig være et Civication-element når det er en virkelig, fysisk, stedsspesifikk og visuelt kvalifisert ting.

```text
Objects = hva tingen er
Civication = kjøp/eierskap/bruk i Civication
```

## 7. `details`

Små, konkrete og visuelt oppdagbare detaljer ved stedet.

Eksempler:

- skilt;
- symbol/våpenskjold;
- inskripsjon;
- ornament/relieff;
- steinhuggermerke;
- materialskifte;
- dokumentert skadespor;
- industrispor;
- liten rest etter tidligere konstruksjon;
- liten graffiti-/street-art-detalj som ikke er et selvstendig Work.

### Canonical dataform

Bruk **`place.details`** for nye/reviderte detaljer som skal vises som rundingskort.

```json
{
  "id": "stabil_detail_id",
  "title": "Hva brukeren skal se etter",
  "image": "bilder/...",
  "description": "Hva detaljen er og hvorfor den er relevant"
}
```

Compatibility-aliaser som runtime kan lese:

```text
visual_details
site_details
```

Disse skal ikke være førstevalg i ny produksjon.

## 8. `spots`

Konkrete fysiske delpunkter eller delsteder innenfor et større canonical sted.

Eksempler:

- port;
- tårn;
- bro;
- tunnelinngang;
- rom;
- scene;
- tribune;
- gårdsrom;
- bunker;
- batteri;
- utsiktspunkt;
- ruin;
- fysisk delområde.

Praktisk skille:

```text
Object = en ting
Detail = noe lite du ser på eller oppdager
Spot = et fysisk punkt/delsted du går bort til
```

### Canonical dataform

Bruk **`place.spots`** for nye/reviderte rundingskort når elementet primært er et fysisk delpunkt.

```json
{
  "id": "stabil_spot_id",
  "title": "Navn på delpunktet",
  "image": "bilder/...",
  "description": "Kort forklaring av delpunktets rolle"
}
```

`subplaces` er et eget strukturert place-felt og kan brukes som compatibility-kilde for Spots. Ikke opprett nytt globalt Place bare for å fylle en Spots-runding.

Nye rent visuelle Spot-kort skal normalt bruke `place.spots`; bruk `subplaces` når dataene faktisk skal uttrykke struktur/soner utover rundingspresentasjonen.

## 9. `nature`

Konkrete naturentiteter eller naturfenomener med dokumentert stedstilknytning.

Eksempler:

- art;
- dyr;
- plante/tre;
- bergart/mineral;
- fossil;
- geologisk formasjon;
- annet konkret naturspor.

Nature er helt valgfri utenfor steder der naturen faktisk er relevant. Et teater, bygg, minnesmerke eller plakett skal ikke få Nature fordi det tilfeldigvis finnes vegetasjon i nærheten.

Nature-produksjon følger `README/nature_mapping_workflow.md` og aktive naturdata. `nature_profile` i popupens Om-fane er ikke det samme som Nature-rundingen.

## 10. `brands`

Brands beholder eksisterende betydning og datamodell.

> **Brands er bedrifter og kjente merker med dokumentert kobling til stedet.**

Regler:

- gjenbruk eksisterende canonical Brand;
- eksisterende Brands-data er source of truth;
- korrekt logo/brandbilde skal kunne brukes;
- Brands er ikke generell aktørkategori;
- ikke legg lag, institusjoner, organisasjoner, skilt, Objects eller andre ting i Brands bare fordi de mangler annen plass;
- rundingsarbeid skal ikke omskrive eksisterende Brands-semantikk eller Brands-data.

## 11. Tidligere kandidater er undertyper

Ikke opprett egne rundingstyper for disse uten en ny canonical beslutning.

### Objects

Artifacts, Finds, Machines, Vehicles, Products, Food products, Documents, Costumes, Relics, Instruments, Weapons, Trophies.

### Details

Signs, Symbols, Inscriptions, Ornamentation, Traces, små arkitekturdetaljer, små graffiti-/street-art-detaljer.

### Spots

Architecture components, Subplaces, Rooms, Viewpoints, Structures, porter, tårn, tunneler, broer, tribuner.

### Nature

Species, Animals, Plants, Trees, Geology, Fossils, Natural formations.

### Works

Billedkunst, skulptur, litteratur, musikk, film, fotografiske verk, arkitekturverk, sceniske verk, selvstendig street art.

## 12. Ikke rundinger

Følgende kan ha bilder, men hovedrollen er kunnskap, hendelse eller handling:

- historiske events;
- kamper/løp/stevner som hendelser;
- rekorder/mesterskap;
- chronology;
- Stories;
- nyheter;
- kart som kunnskapsmateriale;
- statistikk;
- quiz;
- tasks/play/training.

De hører i popupen, På stedet eller egne flows. Det finnes derfor ikke en egen Sports-runding.

## 13. Kategori → rundingmatrise

Matrisen er **prioritet**, ikke tvang. Faktisk dokumentert, bildeklart innhold avgjør.

| Canonical kategori | 4-runders kjerne | Normal utvidelse til 6 |
| --- | --- | --- |
| `by` | Badges · Works · Spots · Details | People · Objects |
| `historie` | Badges · People · Objects · Spots | Details · Works |
| `kunst` | Badges · Works · People · Details | Spots · Objects |
| `litteratur` | Badges · People · Works · Objects | Spots · Details |
| `media` | Badges · People · Works · Objects | Spots · Details |
| `musikk` | Badges · People · Works · Objects | Spots · Details |
| `naeringsliv` | Badges · Brands · People · Objects | Spots · Details |
| `natur` | Badges · Nature · Spots · Details | People · Objects |
| `politikk` | Badges · People · Spots · Details | Objects · Works |
| `psykologi` | Badges · People · Works · Objects | Spots · Details |
| `religion` | Badges · People · Works · Objects | Spots · Details |
| `scenekunst` | Badges · People · Works · Spots | Objects · Details |
| `sport` | Badges · People · Objects · Spots | Details · Works |
| `subkultur` | Badges · People · Works · Details | Spots · Objects |
| `vitenskap` | Badges · People · Objects · Spots | Details · Works |
| `teknologi` | Badges · Objects · People · Spots | Details · Works |
| `filosofi` | Badges · People · Works · Spots | Objects · Details |
| `film_tv` | Badges · People · Works · Spots | Objects · Details |

Erstatningsregel:

1. ikke lag filler;
2. hopp over irrelevant/tom samling;
3. bruk neste relevante canonical runding;
4. eksisterende Brands brukes bare ved reell Brand-kobling;
5. Nature brukes bare ved reell natur;
6. stopp på fire eller seks.

## 14. `rounds` og compatibility

For nye/reviderte steder brukes `place.rounds`.

Krav:

- bare canonical IDs;
- `badges` med;
- nøyaktig 4 eller 6 unike IDs.

`rounds_exclude` kan hoppe over en ellers naturlig valgfri runding; `badges` kan ikke ekskluderes.

`rundinger` er legacy alias og skal ikke brukes i ny produksjon.

Eksempel:

```json
{
  "rounds": ["badges", "people", "objects", "spots"]
}
```

## 15. Wonderkammer

Wonderkammer er legacy migreringsgrunnlag, ikke ny runding eller ny produksjonsmodell.

Legacy-data klassifiseres etter faktisk innhold til Objects, Details, Spots, People, Works, Nature, På stedet, relations/NextUp, Historie eller Stories.

Nye Wonderkammer-entries skal ikke produseres i sted-for-sted-arbeidet.

## 16. Produksjonsgate

En runding kan krysses av som ferdig når:

1. typen er canonical;
2. stedskoblingen er dokumentert;
3. elementene har riktig identitet;
4. visuelt materiale viser riktig entitet/ting;
5. canonical datakilde/felt brukes for ny produksjon;
6. compatibility-data er ikke feilaktig behandlet som ny standard;
7. PlaceCard viser riktig 2 × 2 eller 3 × 2 uten tomme/falske samlinger;
8. relevant governance/CI passerer.

For full stedproduksjon brukes `docs/PLACE_PRODUCTION_CHECKLIST.md`.