# PlaceCard-rundinger (`rounds`)

Status: **canonical presentasjonskontrakt**  
Sist kontrollert: **2026-07-28**

PlaceCard-rundinger er små, visuelle samlingsinnganger. De skal ikke være en ekstra meny for all kunnskap eller alle handlinger ved et sted.

Sted-for-sted-produksjonsrekkefølge:

- `docs/PLACE_PRODUCTION_CHECKLIST.md`

---

## Hovedregel

> **Rundinger viser identifiserbare ting med et meningsfullt visuelt uttrykk. Stedspopupen viser kunnskap om stedet. På stedet viser hva man kan gjøre og hva som skjer her.**

Tre produktroller holdes adskilt:

- **Rundinger** = visuelle samlinger av entiteter, verk, objekter eller fysiske stedselementer.
- **Stedspopup** = Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder og Mer.
- **På stedet** = events, møter/kunnskapsmøter og handlinger som oppgaver, lek og trening.

Den gamle 3×3-/ni-rundersmodellen er avviklet.

---

## Layout: nøyaktig 4 eller 6

Et ferdig PlaceCard viser **nøyaktig fire eller seks rundinger**.

- Fire er standard.
- Seks brukes når stedet faktisk har seks sterke visuelle samlinger.
- Fem vises aldri.
- `badges` er obligatorisk.
- Innhold skal aldri konstrueres bare for å fylle layouten.

En tom compatibility-rad, tekst-only placeholder eller fallback-emoji gjør ikke en runding produksjonsklar. Valgt runding skal ha reelt stedsspesifikt og bildeklart innhold.

---

## Canonical rundingpalett

Paletten består av åtte rundinger:

1. `badges`
2. `people`
3. `works`
4. `objects`
5. `details`
6. `spots`
7. `nature`
8. `brands`

Et sted bruker fire eller seks av disse. Ingen plass skal ha alle av plikt.

---

## `badges`

Badges viser stedets faglige hovedkategori og relevante underbadges.

- hovedbadget kommer fra `place.category`;
- rundingen er obligatorisk;
- klikk åpner `fagverk-sted.html?place=<place_id>`.

Badges er den visuelle inngangen fra stedet til fagområde, emner og progresjon.

---

## `people`

Navngitte personer med dokumentert, konkret stedstilknytning.

Typiske roller:

- grunnleggere;
- arkitekter/kunstnere/skapere;
- eiere/ledere;
- beboere/arbeidende;
- utøvere/forskere/politikere/aktivister med særskilt dokumentert forbindelse;
- personer som et fysisk minne uttrykkelig gjelder.

Personen skal bruke canonical People-record, ikke lokal kopi.

Rundingen er visuell: korrekt portrett/bilde skal kunne brukes.

---

## `works`

Identifiserbare verk og produksjoner som er skapt som verk.

Eksempler:

- maleri og skulptur;
- bok og dikt;
- sang og album;
- film;
- fotografisk verk;
- forestilling;
- arkitekturverk;
- selvstendig street art.

Skillet mot Objects:

- en bok som verk → `works`;
- et bestemt originalmanuskript → `objects`.

Kamper, rekorder, mesterskap, sportsresultater og generelle historiske hendelser er ikke Works. De hører i stedspopupens kunnskapsflater, normalt Historie.

---

## `objects`

Fysiske, identifiserbare gjenstander med dokumentert stedstilknytning.

Kan blant annet romme:

- artefakter;
- arkeologiske funn;
- maskiner;
- kjøretøy;
- våpen;
- instrumenter;
- klær/drakter;
- pokaler/medaljer;
- produkter;
- dokumentobjekter;
- relikvier;
- museumsgjenstander;
- teknisk utstyr.

Et Object kan samtidig være et Civication-element når det faktisk er en fysisk, stedsspesifikk og visuelt kvalifisert ting.

> **Objects beskriver hva tingen er. Civication beskriver hva spillet kan gjøre med den.**

Ikke alle Objects skal kunne kjøpes.

---

## `details`

Små, konkrete og visuelt oppdagbare detaljer ved stedet.

Eksempler:

- skilt;
- symboler/våpenskjold;
- inskripsjoner;
- ornamenter/relieffer;
- steinhuggermerker;
- materialskifter;
- dokumenterte skadespor;
- industrispor;
- små rester etter tidligere konstruksjoner;
- små graffiti-/street-art-detaljer som ikke er selvstendige Works.

Details skal få brukeren til å se nærmere på stedet.

---

## `spots`

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

Spots kan bygge på `subplaces`, men skal ikke automatisk bli egne globale Places.

Praktisk skille:

- **Object** = en ting.
- **Detail** = noe lite du ser på eller oppdager.
- **Spot** = et fysisk punkt/delsted du går bort til.

---

## `nature`

Konkrete naturentiteter og naturfenomener med dokumentert stedstilknytning.

Eksempler:

- arter;
- dyr;
- planter/trær;
- bergarter/mineraler;
- fossiler;
- geologiske formasjoner;
- andre konkrete naturspor.

Nature er **helt valgfri** utenfor steder der naturen faktisk er relevant.

Et teater, bygg, minnesmerke eller plakett skal ikke få Nature fordi det finnes vegetasjon i nærheten.

`nature_profile` i popupens Om-fane og Nature-rundingen har forskjellige roller.

---

## `brands`

Brands beholder sin eksisterende betydning og datamodell.

> **Brands er bedrifter og kjente merker med dokumentert kobling til stedet.**

Regler:

- gjenbruk eksisterende canonical Brand når den finnes;
- eksisterende Brands-data er source of truth;
- logo/brandbilde skal kunne brukes visuelt;
- Brands er ikke generell aktørkategori;
- ikke putt lag, institusjoner, organisasjoner, skilt, objekter eller andre ting i Brands bare fordi de mangler annen plass;
- rundingsarbeid skal ikke omskrive eksisterende Brands-semantikk.

---

## Tidligere kandidater er undertyper, ikke nye rundinger

### Under `objects`

Artifacts, Finds, Machines, Vehicles, Products, Food products, Documents, Costumes, Relics, Instruments, Weapons og Trophies.

### Under `details`

Signs, Symbols, Inscriptions, Ornamentation, Traces, små arkitekturdetaljer og små graffiti-/street-art-detaljer.

### Under `spots`

Architecture components, Subplaces, Rooms, Viewpoints, Structures, porter, tårn, tunneler, broer, tribuner og andre fysiske delpunkter.

### Under `nature`

Species, Animals, Plants, Trees, Geology, Fossils og Natural formations.

### Under `works`

Billedkunst, skulptur, litteratur, musikk, film, fotografiske verk, arkitekturverk, sceniske verk og selvstendige street-art-verk.

---

## Ikke rundinger

Følgende kan ha bilder, men hovedrollen deres er kunnskap, hendelse eller handling:

- historiske events;
- kamper;
- løp/stevner som hendelser;
- rekorder;
- mesterskap;
- chronology;
- Stories;
- nyheter;
- kart som kunnskapsmateriale;
- statistikk;
- quiz;
- oppgaver;
- lek;
- trening.

Disse hører i stedspopupen, På stedet eller egne handlingsflows.

Det finnes derfor ikke en egen Sports-runding.

Sportseksempel:

- spiller → `people`;
- drakt/pokal → `objects`;
- tribune/baneelement → `spots`;
- rekordtavle/fysisk markering → `details`;
- kunst/arkitekturverk → `works`;
- kamp/rekord/mesterskap → Historie;
- bedrift/kjent merke med canonical Brand → `brands`.

---

# Kategori → rundingmatrise

Canonical kategorier eies av `data/categories/category_contract.json`.

Matrisen er **produksjonsprioritet**, ikke tvang. Ferdige steder kurateres etter faktisk dokumentert, bildeklart innhold.

| Canonical kategori | 4-runders kjerne | Normal utvidelse til 6 |
| --- | --- | --- |
| `by` — By & arkitektur | Badges · Works · Spots · Details | People · Objects |
| `historie` | Badges · People · Objects · Spots | Details · Works |
| `kunst` | Badges · Works · People · Details | Spots · Objects |
| `litteratur` | Badges · People · Works · Objects | Spots · Details |
| `media` | Badges · People · Works · Objects | Spots · Details |
| `musikk` | Badges · People · Works · Objects | Spots · Details |
| `naeringsliv` — Økonomi og næringsliv | Badges · Brands · People · Objects | Spots · Details |
| `natur` — Natur & miljø | Badges · Nature · Spots · Details | People · Objects |
| `politikk` — Politikk & samfunn | Badges · People · Spots · Details | Objects · Works |
| `psykologi` | Badges · People · Works · Objects | Spots · Details |
| `religion` | Badges · People · Works · Objects | Spots · Details |
| `scenekunst` | Badges · People · Works · Spots | Objects · Details |
| `sport` — Sport & lek | Badges · People · Objects · Spots | Details · Works |
| `subkultur` | Badges · People · Works · Details | Spots · Objects |
| `vitenskap` | Badges · People · Objects · Spots | Details · Works |
| `teknologi` | Badges · Objects · People · Spots | Details · Works |
| `filosofi` | Badges · People · Works · Spots | Objects · Details |
| `film_tv` — Film & TV | Badges · People · Works · Spots | Objects · Details |

### Erstatningsregel

Hvis en foreslått samling er irrelevant eller mangler godt visuelt innhold:

1. ikke lag filler;
2. gå videre til neste relevante canonical runding;
3. eksisterende Brands kan brukes når stedet faktisk har bedrift/kjent merke-kobling;
4. Nature brukes bare ved reell, stedsspesifikk natur;
5. ferdig place må ende på fire eller seks reelle bildeklare samlinger.

For den detaljerte sted-for-sted-sjekken brukes `docs/PLACE_PRODUCTION_CHECKLIST.md`.

---

## `rounds` og `rounds_exclude`

`place.rounds` er eksplisitt kuratering.

For nye eller reviderte steder:

- bruk bare IDs fra den åtte-runders paletten;
- inkluder `badges`;
- bruk nøyaktig fire eller seks unike IDs;
- fire er standard;
- seks brukes når seks samlinger er sterke og bildeklare;
- `rounds_exclude` kan hoppe over en ellers naturlig valgfri runding;
- `badges` kan ikke ekskluderes;
- `rundinger` er legacy alias og skal ikke brukes i nye data.

Eksempel, fire:

```json
{
  "id": "eksempel_sted",
  "rounds": ["badges", "people", "objects", "spots"]
}
```

Eksempel, seks:

```json
{
  "id": "eksempel_kunststed",
  "rounds": ["badges", "works", "people", "details", "spots", "objects"]
}
```

---

## Wonderkammer

Wonderkammer er ikke lenger canonical PlaceCard-runding eller ny produksjonsmodell.

Legacy-data migreres etter faktisk innhold:

- fysisk gjenstand → `objects`;
- liten detalj/spor → `details`;
- fysisk delsted → `spots`;
- person → `people`;
- verk → `works`;
- natur → `nature`;
- handling → På stedet;
- navigasjon → relations/NextUp;
- chronology/hendelse → Historie.

Legacy-data beholdes til destinasjonen er validert. Se `data/wonderkammer/wonderkammer.md`.

---

## Civication

Civication Store / Thingstore er ikke canonical runding.

Store-data og kjøps-/eierskapslogikk består. En virkelig stedsspesifikk fysisk ting kan også presenteres gjennom `objects`.

---

## Flyttet ut av runding-gridet

Kunnskap:

- Leksikon → popup;
- Fortellinger/Stories → Fortellinger;
- `for_na` → Før/etter;
- chronology/historiske hendelser → Historie.

Handlinger:

- `play`;
- `training`;
- `tasks`.

Disse vises under På stedet eller i egne flows.

Quiz, Observer, Notat og Rute kan ha egne knapper/flows.

---

## Runtime og kompatibilitet

`js/ui/place-rounds-visual-collections.js` er brukerrettet presentasjonsgrense.

Den:

- begrenser paletten til de åtte canonical rundingene;
- håndhever 4/6-presentasjon;
- gjør Badges obligatorisk;
- kobler Badges til fagverksiden;
- gir visuelle samlingsflater for Objects, Details og Spots;
- bruker faktisk bilde/readiness som kvalitetsgrense;
- holder Civication/Wonderkammer og andre legacy-rundinger ute av canonical grid;
- markerer ufullstendige legacy-steder som ikke visuelt produksjonsklare.

Legacy registry i `js/ui/place-card.js` er compatibility-input, ikke produktkontrakten.

---

## Produksjonsklar runding

En runding er produksjonsklar når:

1. den representerer identifiserbare ting/entiteter/verk/fysiske delsteder;
2. elementene har dokumentert stedskobling;
3. samlingen har reelt visuelt materiale;
4. previewbildet viser riktig innhold;
5. samlingen gir mening uten popupens brødtekst;
6. den ligger i riktig hovedgruppe i stedet for å opprette en ny smal runding.

Hvis ikke, skal innholdet normalt til en annen runding, stedspopupen eller På stedet.
