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
- ikke produser filler for å nå seks;
- rundingen er bare en **visuell inngang**: preview-bildet skal aldri brukes til å avgrense eller redefinere innholdet som ligger bak rundingen.

Hvis bare fire samlinger er sterke nok, brukes fire.

Ved sted-for-sted-produksjon skal valget mellom **4 og 6** være eksplisitt redaksjonelt avklart. Hvis antallet ikke allerede er bestemt, skal det spørres før rundingssettet låses.

## 2. Canonical palett

```text
badges
people
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

### People-rundingen er en inngang, ikke et filter

Bildet i People-rundingen er et **representativt preview for syns skyld**. Det kan vise én egnet person, men skal ikke tolkes som at bare denne personen eller et lite kuratert utvalg finnes bak rundingen.

- preview-bildet styrer ikke hvilke People-records som vises etter klikk;
- People-popupen skal fortsatt bruke alle canonical personer med gyldig stedstilknytning etter People-kontrakten;
- ikke innfør stedsspesifikke personfiltre, `people_ids`-overstyring eller tilsvarende bare for å kontrollere rundingspreviewet;
- et eventuelt redaksjonelt avgrenset People-sett er en egen produkt-/databeslutning og må ikke oppstå som bieffekt av rundingsarbeid.

### Verk hører under personen

`works` er **ikke en canonical PlaceCard-runding for nye/reviderte steder**. Verk som uttrykker en persons produksjon skal i stedet ligge i personens profil/popup, for eksempel:

- forfatter → bibliografi;
- filmskaper/skuespiller → filmografi eller relevante produksjoner/roller;
- komponist/musiker → komposisjoner/diskografi;
- kunstner → kunstnerisk produksjon;
- arkitekt → arkitekturverk/prosjekter.

Dette er personinnhold. Det skal ikke opprettes en egen `works`-runding på PlaceCard for å vise det.

Legacy `works` i place-data/runtime er migrerings-/compatibility-gjeld og skal ikke brukes som ny canonical runding.

## 5. `objects`

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
- teknisk utstyr;
- billedkunstverk;
- skulptur/statue;
- installasjon/offentlig kunst;
- fysisk stedsspesifikk street art.

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

Et fysisk kunstverk ved stedet er et Object når det behandles som en identifiserbar ting på stedet. Det gjelder for eksempel et maleri, en skulptur, en installasjon eller et annet fysisk kunstobjekt. At objektet samtidig er et «verk» i kunsthistorisk forstand gjør det ikke til en egen Works-runding.

Et Object kan samtidig være et Civication-element når det er en virkelig, fysisk, stedsspesifikk og visuelt kvalifisert ting.

```text
Objects = hva tingen er
Civication = kjøp/eierskap/bruk i Civication
```

## 6. `details`

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
- liten graffiti-/street-art-detalj som ikke behandles som et selvstendig fysisk Object.

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

## 7. `spots`

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

## 8. `nature`

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

## 9. `brands`

Brands beholder eksisterende betydning og datamodell.

> **Brands er bedrifter og kjente merker med dokumentert kobling til stedet.**

Regler:

- gjenbruk eksisterende canonical Brand;
- eksisterende Brands-data er source of truth;
- korrekt logo/brandbilde skal kunne brukes;
- Brands er ikke generell aktørkategori;
- ikke legg lag, institusjoner, organisasjoner, skilt, Objects eller andre ting i Brands bare fordi de mangler annen plass;
- rundingsarbeid skal ikke omskrive eksisterende Brands-semantikk eller Brands-data.

## 10. Tidligere kandidater er undertyper

Ikke opprett egne rundingstyper for disse uten en ny canonical beslutning.

### Objects

Artifacts, Finds, Machines, Vehicles, Products, Food products, Documents, Costumes, Relics, Instruments, Weapons, Trophies.

### Details

Signs, Symbols, Inscriptions, Ornamentation, Traces, små arkitekturdetaljer, små graffiti-/street-art-detaljer.

### Spots

Architecture components, Subplaces, Rooms, Viewpoints, Structures, porter, tårn, tunneler, broer, tribuner.

### Nature

Species, Animals, Plants, Trees, Geology, Fossils, Natural formations.

## 11. Ikke rundinger

Følgende kan ha bilder, men er ikke canonical PlaceCard-rundinger:

- `works` som egen place-runding; personverk hører under People-profil/popup;
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

### Forestillinger og oppsetninger = Events i «På stedet»

En forestilling, teateroppsetning, konsert, visning eller annen tidsbundet produksjon som skjer ved stedet er et **Event** og skal ligge under **Events i «På stedet»-baren**. Den skal ikke legges i People, Objects eller en Works-runding.

En historisk forestilling/oppsetning kan i tillegg omtales i Historie eller Stories når den utgjør en dokumentert historisk episode. Det endrer ikke identiteten til selve forestillingen: **event-objektet er fortsatt et Event**.

De øvrige elementene hører i popupen, På stedet eller egne flows. Det finnes derfor ikke en egen Sports-runding.

## 12. Kategori → rundingprioritet

Tabellen under angir **prioritet mellom canonical rundingstyper**, ikke hvor mange rundinger et konkret sted skal ha. Antallet **4 eller 6 skal avklares eksplisitt per sted**.

`works` er fjernet fra canonical rundingspalett. Tidligere prioriteringer er derfor normalisert ved å la neste relevante visuelle samling rykke frem; dette er ikke en instruks om å produsere filler.

| Canonical kategori | Prioritet blant aktuelle rundinger |
| --- | --- |
| `by` | Badges · Spots · Details · People · Objects · Brands · Nature |
| `historie` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `kunst` | Badges · People · Details · Spots · Objects · Brands · Nature |
| `litteratur` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `media` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `musikk` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `naeringsliv` | Badges · Brands · People · Objects · Spots · Details · Nature |
| `natur` | Badges · Nature · Spots · Details · People · Objects · Brands |
| `politikk` | Badges · People · Spots · Details · Objects · Brands · Nature |
| `psykologi` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `religion` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `scenekunst` | Badges · People · Spots · Objects · Details · Brands · Nature |
| `sport` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `subkultur` | Badges · People · Details · Spots · Objects · Brands · Nature |
| `vitenskap` | Badges · People · Objects · Spots · Details · Brands · Nature |
| `teknologi` | Badges · Objects · People · Spots · Details · Brands · Nature |
| `filosofi` | Badges · People · Spots · Objects · Details · Brands · Nature |
| `film_tv` | Badges · People · Spots · Objects · Details · Brands · Nature |

Utvalgsregel:

1. avklar først om stedet skal ha fire eller seks rundinger;
2. ikke lag filler;
3. hopp over irrelevant/tom samling;
4. bruk neste relevante canonical runding;
5. eksisterende Brands brukes bare ved reell Brand-kobling;
6. Nature brukes bare ved reell natur;
7. lås bare et 4- eller 6-sett som faktisk har dokumentert, bildeklart innhold.

## 13. `rounds` og compatibility

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

## 14. Wonderkammer

Wonderkammer er legacy migreringsgrunnlag, ikke ny runding eller ny produksjonsmodell.

Legacy-data klassifiseres etter faktisk innhold til Objects, Details, Spots, People, Nature, På stedet, relations/NextUp, Historie eller Stories. Personverk flyttes til relevant People-profil/popup; forestillinger/oppsetninger og andre tidsbundne produksjoner flyttes til Events i På stedet.

Nye Wonderkammer-entries skal ikke produseres i sted-for-sted-arbeidet.

## 15. Produksjonsgate

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
