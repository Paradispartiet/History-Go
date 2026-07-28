# PlaceCard-rundinger (`rounds`)

Status: **canonical presentasjonskontrakt**  
Sist kontrollert: **2026-07-28**

PlaceCard-rundinger er små, visuelle samlingsinnganger. De skal ikke være en ekstra meny for all kunnskap eller alle handlinger ved et sted.

## Hovedregel

> **Rundinger viser identifiserbare ting med et meningsfullt visuelt uttrykk. Stedspopupen viser kunnskap om stedet. På stedet viser hva man kan gjøre og hva som skjer her.**

Tre produktroller holdes adskilt:

- **Rundinger** = visuelle samlinger av entiteter, verk, objekter eller fysiske stedselementer.
- **Stedspopup** = Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder og øvrig stedskunnskap.
- **På stedet** = events, møter/kunnskapsmøter og handlinger som oppgaver, lek og trening.

Den gamle 3×3-/ni-rundersmodellen er avviklet som produktkontrakt.

## Layout: nøyaktig 4 eller 6

Et ferdig PlaceCard viser **nøyaktig fire eller seks rundinger**.

- Fire er standard.
- Seks brukes når stedet faktisk har seks sterke visuelle samlinger.
- Fem vises aldri.
- Innhold skal ikke konstrueres bare for å fylle layouten.
- `badges` er obligatorisk på alle canonical steder.

En fallback-emoji eller tom kompatibilitetsrad teller ikke som ferdig visuelt innhold. Produksjonsklart rundingsinnhold skal kunne representeres med bilde, portrett, logo, verkbilde eller et annet konkret visuelt kort.

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

Et sted bruker fire eller seks av disse, aldri alle av plikt.

## `badges`

Badges viser stedets faglige hovedkategori og relevante underbadges.

- Hovedbadget kommer fra `place.category`.
- Rundingen er obligatorisk.
- Klikk skal åpne stedets fagverkside: `fagverk-sted.html?place=<place_id>`.

Badges er dermed den visuelle inngangen fra stedet til fagområde, emner og progresjon.

## `people`

Navngitte personer med dokumentert stedstilknytning og egnet visuelt materiale.

Eksempler:

- kunstnere
- forfattere
- politikere
- forskere
- arkitekter
- idrettsutøvere og trenere
- historiske personer

## `works`

Identifiserbare verk og produksjoner som er skapt som verk.

Typiske undertyper:

- maleri og skulptur
- bok og dikt
- sang og album
- film
- fotografisk verk
- forestilling
- arkitekturverk
- street art behandlet som selvstendig verk

Skillet mot Objects er viktig: en bok er et Work; et bestemt originalmanuskript kan være et Object.

**Kamper, rekorder, mesterskap, sportsresultater og historiske sportsøyeblikk er ikke Works.** De er kunnskap/historie og hører i stedspopupen.

## `objects`

Fysiske, identifiserbare gjenstander knyttet til stedet.

Denne hovedgruppen rommer blant annet:

- artefakter
- arkeologiske funn
- maskiner
- kjøretøy
- våpen
- instrumenter
- klær og drakter
- pokaler og medaljer
- produkter produsert på stedet
- dokumentobjekter
- relikvier
- museumsgjenstander
- teknisk utstyr

Et Object kan samtidig ha Civication-egenskaper og være kjøpbart eller brukbart i spillet.

> **Objects beskriver hva tingen er. Civication beskriver hva spillet kan gjøre med den.**

Civication Store er derfor ikke en egen canonical runding. Eksisterende Store-data beholdes og kan brukes som Object-kilde når de representerer en virkelig, stedsspesifikk ting.

## `details`

Små, konkrete og visuelt oppdagbare detaljer ved stedet.

Typiske undertyper:

- skilt
- symboler og våpenskjold
- inskripsjoner
- ornamenter og relieffer
- steinhuggermerker
- materialskifter
- dokumenterte skadespor
- industrispor
- rester etter tidligere konstruksjoner
- graffiti-/street-art-detaljer som ikke er egne Works

Details skal få brukeren til å se nærmere på selve stedet.

## `spots`

Konkrete fysiske delpunkter eller delsteder innenfor det større stedet.

Typiske undertyper:

- port
- tårn
- bro
- tunnelinngang
- rom
- scene
- tribune
- gårdsrom
- bunker
- batteri
- utsiktspunkt
- ruin
- fysisk delområde

Spots kan bygge på `subplaces`, men et Spot skal ikke automatisk bli et nytt globalt canonical Place.

Praktisk skille:

- **Object** = en ting.
- **Detail** = noe lite du ser på eller oppdager.
- **Spot** = et fysisk punkt eller delsted du går bort til.

## `nature`

Konkrete naturentiteter og naturfenomener med dokumentert stedstilknytning.

Typiske undertyper:

- arter
- dyr
- planter og trær
- bergarter og mineraler
- fossiler
- geologiske formasjoner
- andre konkrete naturspor

Nature er **helt valgfri utenfor Natur & miljø**. Et teater, en bygård, et minnesmerke eller et politisk sted skal ikke få Nature bare fordi det finnes et tre i nærheten.

Nature skal heller ikke kopiere et canonical Place. Øyungen og Akerselva er steder; arter og konkrete naturfenomener ved dem er Nature-innhold.

## `brands`

Brands beholder sin eksisterende betydning og datamodell.

> **Brands er bedrifter og kjente merker med dokumentert kobling til stedet.**

Eksisterende Brands-oppføringer er source of truth og skal ikke omklassifiseres som del av rundingsarbeidet.

Brands er ikke en restkategori for lag, institusjoner, skilt, objekter eller andre ting som ikke allerede er canonical Brands.

Hvis et sted allerede har reelle Brands-data, kan runtime prioritere Brands foran en ellers tom anbefalt samling. Den nye matrisen skal ikke gjøre eksisterende Brands-innhold usynlig.

## Tidligere kandidater grupperes, de blir ikke egne rundinger

### Under `objects`

Artifacts, Finds, Machines, Vehicles, Products, Food products, Documents, Costumes, Relics, Instruments, Weapons og Trophies.

### Under `details`

Signs, Symbols, Inscriptions, Ornamentation, Traces, små arkitekturdetaljer og små graffiti-/street-art-detaljer.

### Under `spots`

Architecture components, Subplaces, Rooms, Viewpoints, Structures, porter, tårn, tunneler, broer, tribuner og tilsvarende fysiske delpunkter.

### Under `nature`

Species, Animals, Plants, Trees, Geology, Fossils og Natural formations.

### Under `works`

Billedkunst, skulptur, litteratur, musikk, film, fotografiske verk, arkitekturverk, sceniske verk og selvstendige street-art-verk.

## Ikke rundinger

Følgende kan illustreres med bilder, men hovedrollen deres er kunnskap, hendelse eller handling:

- historiske events
- kamper
- løp og stevner som hendelser
- rekorder
- mesterskap
- historiske sportsøyeblikk
- chronology
- Stories
- nyheter
- kart som kunnskapsmateriale
- statistikk
- quiz
- oppgaver
- lek
- trening

Disse hører i stedspopupen, På stedet eller egne handlingsflows.

### Sportseksempel

- spiller → `people`
- eksisterende bedrift-/merkeoppføring → `brands`
- drakt eller pokal → `objects`
- tribune eller baneelement → `spots`
- rekordtavle eller fysisk markering → `details`
- kamp, rekord eller mesterskap → stedspopup/Historie

Det finnes derfor ikke en egen Sports-runding.

## Badge-kategorier og 4/6-matrise

Badges er kategoriankeret. Tabellen viser kategoriens fire kjernetypiske rundinger og de to normale utvidelsene til seks.

| Badge/kategori | 4-runders kjerne | Utvid til 6 med |
| --- | --- | --- |
| **Historie** | Badges · People · Objects · Spots | Details · Works |
| **Kunst** | Badges · Works · People · Details | Spots · Objects |
| **Politikk & samfunn** | Badges · People · Spots · Details | Objects · Works |
| **Musikk** | Badges · People · Works · Objects | Spots · Details |
| **Litteratur & poesi** | Badges · People · Works · Objects | Spots · Details |
| **Sport & lek** | Badges · People · Objects · Spots | Details · Works |
| **Natur & miljø** | Badges · Nature · Spots · Details | People · Objects |
| **Vitenskap** | Badges · People · Objects · Spots | Details · Works |
| **Filosofi** | Badges · People · Works · Spots | Objects · Details |

Brands er bevisst ikke tvunget inn i generiske kategori-defaults. Et sted med eksisterende Brands-data kan bruke Brands i stedet for en svak eller tom anbefalt samling.

## Prioriteringsrekkefølge

Runtime bruker kategorirekkefølgen sammen med faktisk eksisterende rundingsinnhold:

- **Historie:** Badges → People → Objects → Spots → Details → Works → Brands → Nature
- **Kunst:** Badges → Works → People → Details → Spots → Objects → Brands → Nature
- **Politikk:** Badges → People → Spots → Details → Objects → Works → Brands → Nature
- **Musikk:** Badges → People → Works → Objects → Spots → Details → Brands → Nature
- **Litteratur:** Badges → People → Works → Objects → Spots → Details → Brands → Nature
- **Sport:** Badges → People → Objects → Spots → Details → Works → Brands → Nature
- **Natur:** Badges → Nature → Spots → Details → People → Objects → Works → Brands
- **Vitenskap:** Badges → People → Objects → Spots → Details → Works → Brands → Nature
- **Filosofi:** Badges → People → Works → Spots → Objects → Details → Brands → Nature

Hvis en lavere prioritert runding allerede har ekte innhold mens en høyere prioritert runding er tom, kan den eksisterende samlingen løftes inn. Dette er særlig viktig for eksisterende Brands-data og gjør samtidig Nature valgfri der den ikke passer.

## `rounds` og `rounds_exclude`

`place.rounds` / `rundinger` er eksplisitt kuratering.

For nye eller reviderte steder:

- bruk bare IDs fra den åtte-runders paletten
- inkluder alltid `badges`
- bruk nøyaktig fire eller seks unike IDs
- fire er standard
- seks brukes når seks samlinger faktisk er gode nok
- `rounds_exclude` kan hoppe over en ellers naturlig valgfri runding
- `badges` kan ikke ekskluderes
- ikke legg kunnskapsfaner eller handlinger inn i `rounds`

Fire rundinger:

```json
{
  "id": "eksempel_sted",
  "rounds": ["badges", "people", "objects", "spots"]
}
```

Seks rundinger:

```json
{
  "id": "eksempel_kunststed",
  "rounds": ["badges", "works", "people", "details", "spots", "objects"]
}
```

Et sted med gode eksisterende Brands-oppføringer kan eksplisitt bruke `brands` i stedet for en svakere valgfri runding.

## Wonderkammer

Wonderkammer er ikke lenger en canonical PlaceCard-runding eller ny produksjonsmodell.

Legacy-data migreres etter hva entryen faktisk representerer:

- fysisk gjenstand → `objects`
- liten fysisk detalj eller spor → `details`
- fysisk delsted → `spots`
- person → `people`
- verk → `works`
- naturentitet → `nature`
- handling → På stedet
- navigasjon → relations/NextUp
- chronology/hendelse → Historie

Legacy-data beholdes til hver entry har en validert destinasjon. Se `data/wonderkammer/wonderkammer.md`.

## Civication

Civication Store / Thingstore er ikke en canonical runding.

Store-data og kjøps-/eierskapslogikk består. Et Civication-element som også er en virkelig stedsspesifikk gjenstand kan presenteres gjennom `objects`.

Det finnes ingen regel om at alle Objects skal kunne kjøpes.

## Flyttet ut av runding-gridet

Kunnskapsflater:

- `leksikon` / `lexicon` → stedspopup
- `fortellinger` / `stories` / `story` → Fortellinger-fanen
- `før_nå` → Før/etter
- `routes` som gammelt alias for `før_nå` → ikke canonical runding

Handlinger:

- `play`
- `training`
- `tasks`

Disse vises under **På stedet → Gjør på stedet** eller i egne handlingsflows.

Quiz, Observer, Notat og Rute kan fortsatt ha egne knapper/flows.

## Runtime og kompatibilitet

`js/ui/place-rounds-visual-collections.js` er den canonical brukerrettede presentasjonsgrensen.

Den:

- begrenser paletten til de åtte visuale rundingene
- håndhever fire eller seks synlige slots
- gjør Badges obligatorisk og sender den til fagverksiden
- gir kompatibilitetsflater for `objects`, `details` og `spots`
- prioriterer eksisterende reelt innhold foran tomme standardvalg
- kan lese eksisterende Civication Store-objekter som Object-kilde uten å endre Store-data
- holder sportsmetadata som kamper/arena/lag ute av Works-presentasjonen
- skjuler gamle ikke-visuelle rundinger
- lar legacy source-data migreres separat

Den eldre round-registryen i `js/ui/place-card.js` er compatibility-input og ikke lenger den brukerrettede kontrakten.

## Kvalitetsport

En runding er produksjonsklar når:

1. den representerer en identifiserbar ting, entitet, et verk eller en fysisk del av stedet
2. den kan få et meningsfullt visuelt kort
3. elementene har egen forståelig identitet
4. koblingen til stedet er dokumentert og stedsspesifikk
5. samlingen gir mening uten stedspopupens brødtekst
6. innholdet ligger i riktig hovedgruppe i stedet for å opprette en ny smal runding

Hvis ikke, hører innholdet normalt i stedspopupen, På stedet eller et annet eksisterende canonical system.

## Eksempel: lite minnesmerke

Et lite minnesmerke trenger ikke Nature eller seks rundinger. En fullverdig profil kan være:

- Badges
- People
- Works
- Details

## Filer

- Rundingpresentasjon og kategori-prioriteringer: `js/ui/place-rounds-visual-collections.js`
- Legacy round-registry/source-renderere: `js/ui/place-card.js`
- Inline-guard for rundingsinnhold: `js/ui/place-card-round-content-guard.js`
- På stedet-runtime: `js/ui/place-onsite-surface.js`
- Popupfaner: `js/ui/place-popup-tabs.js`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Wonderkammer-migrering: `data/wonderkammer/wonderkammer.md`
