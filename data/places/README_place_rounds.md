# PlaceCard-rundinger (`rounds`)

Status: **canonical presentasjonskontrakt**  
Sist kontrollert: **2026-07-28**

PlaceCard-rundinger er små, visuelle samlingsinnganger. De skal ikke brukes som en ekstra meny for alt som finnes om et sted.

## Hovedregel

> **Rundinger viser identifiserbare ting med et meningsfullt visuelt uttrykk. Stedspopupen viser kunnskap om stedet. På stedet viser hva man kan gjøre og hva som skjer her.**

Dette skiller tre produktroller:

- **PlaceCard-rundinger** = visuelle samlinger av entiteter, verk, objekter eller fysiske stedselementer;
- **stedspopupfaner** = artikkel, historie, Stories, før/etter, nyheter, Lesespor, kilder og øvrig stedskunnskap;
- **På stedet** = events, møter/kunnskapsmøter og konkrete handlinger på eller knyttet til stedet.

Den tidligere 3×3-/ni-rundersmodellen er avviklet som produktkontrakt.

## Layoutregel: nøyaktig 4 eller 6

Et canonical PlaceCard skal vise **nøyaktig fire eller seks rundinger**.

- Fire er standard og kategoriens kjerneprofil.
- Seks brukes når stedet faktisk har seks sterke visuelle samlinger.
- Fem skal aldri vises.
- Tre eller færre er ikke en ferdig produksjonstilstand for et revidert sted.
- Et sted skal ikke få konstruert innhold bare for å nå seks.

`badges` er den eneste obligatoriske rundingen på alle canonical steder.

Fallback-emoji eller tomme kompatibilitetsrader i runtime teller **ikke** som ferdig visuelt innhold. For produksjonsklart rundingsinnhold skal samlingen kunne vise et relevant bilde, portrett, logo, verkbilde eller annet konkret visuelt kort.

## Canonical rundingpalett

Nye og reviderte data bruker disse åtte rundingene:

1. `badges`
2. `people`
3. `works`
4. `objects`
5. `details`
6. `spots`
7. `nature`
8. `brands`

Dette er en **palett**, ikke et krav om at hvert sted skal bruke alle åtte.

## `badges`

`badges` viser stedets faglige kategori og relevante underbadges.

Hovedbadget kommer fra stedets canonical `category`. Badge-rundingen er obligatorisk og skal åpne stedets fagverkside:

`fagverk-sted.html?place=<place_id>`

Badges har dermed en annen rolle enn de øvrige samlingsrundingene: den er den visuelle inngangen fra stedet til fagområdet, emnene og progresjonen.

## `people`

Navngitte personer med canonical personprofil og meningsfull stedstilknytning.

Typiske eksempler:

- kunstnere;
- forfattere;
- politikere;
- forskere;
- arkitekter;
- idrettsutøvere og trenere;
- historiske personer med dokumentert kobling til stedet.

Rundingen bør kunne bruke portrett eller annet egnet personbilde.

## `works`

Identifiserbare verk og produksjoner som er skapt som verk.

Typiske undertyper:

- maleri;
- skulptur;
- bok;
- dikt;
- sang;
- album;
- film;
- fotografisk verk;
- forestilling;
- arkitekturverk;
- street art når den behandles som et konkret verk.

Et verk er ikke det samme som et fysisk originalobjekt. En bok kan være `works`; et bestemt originalmanuskript kan være `objects`.

Sportsresultater, kamper, rekorder, mesterskap og historiske sportsøyeblikk er **ikke Works**. De er kunnskap/historie og hører i stedspopupen.

## `objects`

Fysiske, identifiserbare gjenstander knyttet til stedet.

Dette er hovedgruppen for det som tidligere lett kunne havne i Wonderkammer eller Civication bare fordi det var en «ting».

Typiske undertyper:

- artefakter;
- arkeologiske funn;
- maskiner;
- kjøretøy;
- våpen;
- instrumenter;
- klær og drakter;
- pokaler og medaljer;
- produkter produsert på stedet;
- historiske dokumentobjekter;
- relikvier;
- museumsgjenstander;
- teknisk utstyr.

Et Object kan samtidig ha Civication-egenskaper og være kjøpbart eller brukbart i spillet. **Objects er hva tingen er; Civication beskriver hva spillet kan gjøre med den.** Derfor er Civication Store ikke en egen canonical runding.

Eksisterende Civication Store-data skal ikke slettes eller flyttes mekanisk. Presentasjonslaget kan bruke dem som objektkilde når de representerer reelle stedsspesifikke ting.

## `details`

Små, konkrete og visuelt oppdagbare detaljer ved stedet.

Typiske undertyper:

- skilt;
- symboler;
- våpenskjold;
- inskripsjoner;
- ornamenter;
- relieffer;
- steinhuggermerker;
- materialskifter;
- kulehull eller dokumenterte skadespor;
- industrispor;
- rester av tidligere konstruksjoner;
- graffiti-/gatekunstdetaljer som ikke behandles som egne Works.

Details skal få brukeren til å **se nærmere på selve stedet**. En generell observasjonsoppgave er derimot en handling og hører ikke automatisk her.

## `spots`

Konkrete fysiske delpunkter eller delsteder innenfor det større stedet.

Typiske undertyper:

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
- fysisk delområde;
- monument når hovedverdien er det konkrete stedet/strukturen.

Spots kan bygge på `subplaces`, men et Spot skal ikke automatisk opprettes som et nytt globalt canonical Place.

Skillet mot Details er skala: et Spot er noe brukeren går bort til; en Detail er noe brukeren ser på eller oppdager i/ved et større element.

## `nature`

Konkrete naturentiteter og naturfenomener med dokumentert stedstilknytning.

Typiske undertyper:

- arter;
- dyr;
- planter;
- trær;
- bergarter;
- mineraler;
- fossiler;
- geologiske formasjoner;
- andre konkrete naturspor.

`nature` er **helt valgfri utenfor Natur & miljø**. Et teater, en bygård, et minnesmerke eller et politisk institusjonssted skal ikke få Nature-runding bare fordi det finnes et tre i nærheten.

Nature skal heller ikke opprette en kopi av et canonical place. Akerselva, Øyungen eller Stensparken er steder; arter og konkrete naturfenomener ved dem er Nature-innhold.

## `brands`

Brands beholder sin eksisterende betydning og datamodell.

> **Brands er bedrifter og kjente merker med dokumentert kobling til stedet.**

Eksisterende Brands-oppføringer er source of truth og skal ikke omklassifiseres som del av rundingsarbeidet.

Denne kontrakten skal ikke bruke Brands som restkategori for institusjoner, lag, skilt, objekter eller andre ting som passer bedre i en annen runding.

## Gruppering av tidligere kandidater

Den brede idélisten skal normalt foldes inn i hovedrundingene, ikke bli nye rundinger:

### Under `objects`

- Artifacts / artefakter
- Finds / funn
- Machines / maskiner
- Vehicles / kjøretøy
- Products / produkter
- Food products / matprodukter
- Documents / dokumentobjekter
- Costumes / drakter
- Relics / relikvier
- Instruments / instrumenter
- Weapons / våpen
- Trophies / pokaler

### Under `details`

- Signs / skilt
- Symbols / symboler
- Inscriptions / inskripsjoner
- Ornamentation / ornamentikk
- Traces / fysiske spor
- små arkitekturdetaljer
- graffiti-/street-art-detaljer

### Under `spots`

- Architecture components / bygningsdeler
- Subplaces / delsteder
- Rooms / rom
- Viewpoints / utsiktspunkter
- Structures / konstruksjoner
- porter, tårn, tunneler, broer, tribuner og lignende

### Under `nature`

- Species / arter
- Animals / dyr
- Plants / planter
- Trees / trær
- Geology / geologi
- Fossils / fossiler
- Natural formations / naturformasjoner

### Under `works`

- billedkunst
- skulptur
- litteratur
- musikk
- film
- fotografiske verk
- arkitekturverk
- sceniske verk
- street art behandlet som selvstendig verk

## Ikke rundinger

Følgende kan ha bilder, men hovedrollen er kunnskap, hendelse eller handling og de skal derfor ikke bli canonical rundinger:

- historiske events;
- kamper;
- løp og stevner som hendelser;
- rekorder;
- mesterskap;
- historiske sportsøyeblikk;
- chronology;
- Stories;
- nyheter;
- kart som kunnskapsmateriale;
- statistikk;
- quiz;
- oppgaver;
- lek;
- trening.

Eksempel sport:

- spiller → `people`
- klubbmerke som allerede er canonical Brand → `brands`
- drakt eller pokal → `objects`
- tribune eller baneelement → `spots`
- rekordtavle eller fysisk markering → `details`
- kamp, rekord eller mesterskap → stedspopup/Historie, ikke runding

## Badge-kategorier og rundingsmatrise

Badges er kategoriankeret. Tabellen viser kategoriens **4-runders kjerne** og de to normale utvidelsene til **6 rundinger**.

| Badge/kategori | 4-runders kjerne | Utvid til 6 med |
| --- | --- | --- |
| **Historie** | Badges · People · Objects · Spots | Details · Works |
| **Kunst** | Badges · Works · People · Details | Brands · Spots |
| **Politikk & samfunn** | Badges · People · Brands · Spots | Objects · Details |
| **Musikk** | Badges · People · Works · Brands | Objects · Spots |
| **Litteratur & poesi** | Badges · People · Works · Objects | Spots · Brands |
| **Sport & lek** | Badges · People · Brands · Spots | Objects · Details |
| **Natur & miljø** | Badges · Nature · Spots · Details | People · Objects |
| **Vitenskap** | Badges · People · Objects · Brands | Spots · Details |
| **Filosofi** | Badges · People · Works · Spots | Objects · Brands |

Dette er prioritering, ikke en ordre om å produsere kunstig innhold. Hvis en av de foreslåtte samlingene ikke gir mening for stedet, brukes neste relevante runding i kategoriens prioriteringsliste.

Nature skal for eksempel ikke presses inn i Historie, Kunst eller Politikk bare for å fylle layouten.

## Prioriteringsrekkefølge

Runtime kan bruke følgende rekkefølge ved kuratering og fallback:

- **Historie:** Badges → People → Objects → Spots → Details → Works → Brands → Nature
- **Kunst:** Badges → Works → People → Details → Brands → Spots → Objects → Nature
- **Politikk:** Badges → People → Brands → Spots → Objects → Details → Works → Nature
- **Musikk:** Badges → People → Works → Brands → Objects → Spots → Details → Nature
- **Litteratur:** Badges → People → Works → Objects → Spots → Brands → Details → Nature
- **Sport:** Badges → People → Brands → Spots → Objects → Details → Works → Nature
- **Natur:** Badges → Nature → Spots → Details → People → Objects → Works → Brands
- **Vitenskap:** Badges → People → Objects → Brands → Spots → Details → Nature → Works
- **Filosofi:** Badges → People → Works → Spots → Objects → Brands → Details → Nature

## `rounds` og `rounds_exclude`

`place.rounds` / `rundinger` er den eksplisitte kurateringen.

For nye eller reviderte steder:

- bruk bare canonical IDs fra den åtte-runders paletten;
- inkluder alltid `badges`;
- bruk nøyaktig fire eller seks unike ID-er;
- fire er standard;
- seks brukes når seks samlinger faktisk er gode nok;
- bruk `rounds_exclude` bare for å hoppe over en ellers naturlig standardrunding;
- `badges` kan ikke ekskluderes;
- ikke legg kunnskapsfaner eller handlinger inn i `rounds`.

Eksempel med fire:

```json
{
  "id": "eksempel_sted",
  "rounds": ["badges", "people", "objects", "spots"]
}
```

Eksempel med seks:

```json
{
  "id": "eksempel_kunststed",
  "rounds": ["badges", "works", "people", "details", "brands", "spots"]
}
```

## Wonderkammer

`wonderkammer` er ikke lenger en canonical PlaceCard-runding.

Begrepet har historisk dekket navigasjon, aktiviteter og actual-site-treasures. Disse skal migreres etter faktisk innhold:

- fysisk gjenstand → `objects`;
- liten fysisk detalj/spor → `details`;
- fysisk delsted → `spots`;
- person → `people`;
- verk → `works`;
- handling → På stedet;
- navigasjon → relations/NextUp;
- chronology/hendelse → Historie.

Legacy Wonderkammer-data beholdes inntil hver entry har en validert destinasjon. Se `data/wonderkammer/wonderkammer.md`.

## Civication

Civication Store / Thingstore er ikke en canonical runding.

Store-data og kjøps-/eierskapslogikk består. Når et Civication-element også er en virkelig, stedsspesifikk gjenstand kan PlaceCard presentere det gjennom `objects`.

Det er ingen automatisk regel om at alle Objects skal kunne kjøpes.

## Flyttet ut av runding-gridet

Kunnskapsflater:

- `leksikon` / `lexicon` → stedspopup **Om** / øvrige faner
- `fortellinger` / `stories` / `story` → **Fortellinger**
- `før_nå` → **Før/etter**
- `routes` som gammelt alias for `før_nå` → ikke canonical runding

Handlinger:

- `play`
- `training`
- `tasks`

Disse vises under **På stedet → Gjør på stedet** eller i egne handlingsflows.

Quiz, Observer, Notat og Rute kan fortsatt ha egne tydelige handlingsknapper/flows. De skal ikke gjøres til visuelle samleobjekter.

## Runtime og kompatibilitet

`js/ui/place-rounds-visual-collections.js` er den brukerrettede presentasjonsgrensen.

Den:

- begrenser canonical palett til de åtte visuelle rundingene;
- håndhever fire eller seks synlige slots i ny kuratering;
- bruker Badge som obligatorisk faglig inngang;
- oppretter kompatibilitetsflater for `objects`, `details` og `spots`;
- kan lese eksisterende Civication Store-objekter som Object-kilde uten å endre Store-data;
- skjuler gamle ikke-visuelle rundinger;
- lar legacy source-data migreres separat.

Den eldre PlaceCard-runtimekoden kjenner fortsatt historiske round-ID-er. Den er compatibility-input, ikke den canonical brukerrettede modellen.

## Kuratoriske kvalitetsporter

En foreslått runding består testen når svaret på alle disse er ja:

1. Representerer den en identifiserbar ting, entitet, verk eller fysisk del av stedet – ikke en artikkel, tidslinje eller handling?
2. Kan samlingen få et meningsfullt bilde, portrett, logo eller visuelt kort?
3. Har elementene egen identitet som brukeren kan forstå og åpne/utforske?
4. Er koblingen til stedet dokumentert og stedsspesifikk?
5. Gir samlingen mening uten stedspopupens brødtekst?
6. Er typen plassert i riktig hovedgruppe i stedet for å opprette enda en smal runding?

Hvis nei, skal innholdet normalt inn i stedspopupen, På stedet eller et eksisterende canonical system.

## Minneskilt og små markører

Et minneskilt skal ikke få Nature-runding bare fordi det står ute.

Et enkelt minnesmerke kan for eksempel ha:

- Badges
- People
- Works
- Details

Det er en fullverdig 4-runders profil.

## Filer

- Canonical rundingpresentasjon og kategori-prioriteter: `js/ui/place-rounds-visual-collections.js`
- Legacy round registry/source-renderere: `js/ui/place-card.js`
- Rundingsinnhold skjult fra inlineflaten: `js/ui/place-card-round-content-guard.js`
- På stedet-runtime: `js/ui/place-onsite-surface.js`
- Popupfaner: `js/ui/place-popup-tabs.js`
- Popupkontrakt: `docs/PLACE_POPUP_SYSTEM.md`
- Legacy Wonderkammer-migrering: `data/wonderkammer/wonderkammer.md`
