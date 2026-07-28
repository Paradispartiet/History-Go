# History GO — På stedet-system

Status: **canonical handlingskontrakt**  
Eier: `place_onsite_contract`  
Runtime: `js/ui/place-onsite-surface.js`  
Datakontrakt: `data/categories/place_onsite_contract.json`  
Sist kontrollert: **2026-07-28**

## Formål

«På stedet» viser handlinger som gir mening **på akkurat den typen sted brukeren står ved**. Flaten skal ikke fylles med generiske knapper bare fordi en funksjon finnes et sted i History GO.

Synlighet bestemmes i denne rekkefølgen:

1. canonical kategori;
2. stedstype (`placeType`, `place_type`, `locatorType`, `type` eller `subtype`);
3. om funksjonen har reelt innhold når policyen er `whenData`.

Stedstype kan overstyre kategori. Dette er nødvendig for funksjoner som bare gir mening på bestemte fysiske stedstyper.

## Tre synlighetsmoduser

- `always` — funksjonen skal alltid være synlig for kategorien/stedstypen;
- `whenData` — funksjonen vises bare når stedet faktisk har relevant innhold;
- `never` — funksjonen hører ikke hjemme i På stedet for denne kategorien/stedstypen.

## Handlinger

### Avtal å møtes

Bred sosial stedsfunksjon. Den er tilgjengelig på tvers av kategorier. Privacy- og backendgrenser gjelder fortsatt; live-posisjon skal ikke eksponeres.

### Kunnskapsmøte

Bred stedsbundet lærings-/samtalefunksjon. Den er tilgjengelig på tvers av kategorier.

### Events

Events er kategori- og datastyrt.

Kategorier der aktuelle arrangementer er en naturlig del av selve stedets bruk viser Events fast:

- kunst;
- litteratur;
- musikk;
- politikk;
- religion;
- scenekunst;
- sport;
- subkultur;
- film/TV.

For by, historie, media, næringsliv, natur, psykologi, vitenskap, teknologi og filosofi vises Events når stedet faktisk har canonical event-data.

Historiske hendelser er ikke «Events»; de hører i Historie.

### Lek

Lek er **ikke kategoribasert som hovedregel**. Lek vises bare når stedstypen er en faktisk lekeplass/lekepark (`lekeplass`, `lekepark`, `playground`).

En park, stadion, kirke, konsertscene eller annet sted får ikke Lek bare fordi stedet ligger i en kategori der lek kan forekomme.

## Ekskluderte konsepter

### Oppgaver

Oppgaver/`tasks_profile` er fjernet som History GO-produktkonsept og skal ikke presenteres i På stedet.

### Trening

Trening er ikke en generell På stedet-handling. `training_profile` er type-spesifikt sportsinnhold og vises i stedspopupen for sportssteder når relevant.

### Quiz, Observer, Notat og Rute

Disse beholder sine egne etablerte flows og skal ikke dupliseres inn i På stedet.

## Canonical kategori-policy

Den maskinlesbare matrisen ligger i:

- `data/categories/place_onsite_contract.json`.

Alle canonical runtime-kategorier fra `data/categories/category_contract.json` skal være eksplisitt dekket. Nye kategorier må få På stedet-policy samtidig som de tas inn i kategori-kontrakten.

## Sluttregel

En knapp skal ikke vises fordi «det kan kanskje passe». Den skal vises fordi **kategori-policy, stedstype eller reelle data** tilsier at funksjonen hører hjemme akkurat der.
