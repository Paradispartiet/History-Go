# History GO — stedsfunksjonsrad

Status: **canonical handlingskontrakt**  
Eier: `place_onsite_contract`  
Runtime: `js/ui/place-onsite-surface.js`  
Datakontrakt: `data/categories/place_onsite_contract.json`  
Sist kontrollert: **2026-07-29**

## Fast hovedrad

PlaceCard viser alltid disse fire knappene, i denne rekkefølgen:

1. **Events**
2. **Avtal å møtes**
3. **Kunnskapsmøte**
4. **Mer**

Det skal ikke stå «På stedet» som egen overskrift, og det skal ikke finnes en egen `+`-knapp i raden.

### Events

Events-knappen er alltid synlig. Hvis stedet ikke har aktuelle canonical events, åpner knappen en tomtilstand som sier at ingen aktuelle events er registrert ennå.

Historiske hendelser er ikke «Events»; de hører i Historie.

### Avtal å møtes

Bred sosial stedsfunksjon. Den er alltid tilgjengelig i hovedraden. Privacy- og backendgrenser gjelder fortsatt; live-posisjon skal ikke eksponeres.

### Kunnskapsmøte

Bred stedsbundet lærings-/samtalefunksjon. Den er alltid tilgjengelig i hovedraden.

### Mer

`Mer` er alltid siste knapp. Alle kategori-, stedstype- eller innholdsavhengige stedsfunksjoner skal ligge her i stedet for å utvide hovedraden.

Synlighet inne i Mer bestemmes i denne rekkefølgen:

1. canonical kategori;
2. stedstype (`placeType`, `place_type`, `locatorType`, `type` eller `subtype`);
3. om funksjonen har reelt innhold når policyen er `whenData`.

Stedstype kan overstyre kategori.

## Relative funksjoner under Mer

### Lek

Lek vises **bare inne i Mer-popupen**, og bare når stedstypen er en faktisk lekeplass/lekepark (`lekeplass`, `lekepark`, `playground`).

En park, stadion, kirke, konsertscene eller annet sted får ikke Lek bare fordi lek kan forekomme der.

Andre framtidige kategori- eller stedstypeavhengige funksjoner skal følge samme mønster: de legges i `Mer`, ikke som nye faste knapper i hovedraden.

## Ekskluderte konsepter

### Oppgaver

Oppgaver/`tasks_profile` er fjernet som History GO-produktkonsept og skal ikke presenteres i stedsfunksjonsraden eller Mer.

### Trening

Trening er ikke en generell stedsfunksjon. `training_profile` er type-spesifikt sportsinnhold og vises i stedspopupen for sportssteder når relevant.

### Quiz, Observer, Notat og Rute

Disse beholder sine egne etablerte flows og skal ikke dupliseres inn i hovedraden eller Mer.

## Canonical kategori-policy

Den maskinlesbare matrisen ligger i `data/categories/place_onsite_contract.json`. Matrisen styrer relative funksjoner som kan dukke opp under `Mer`; den skal ikke brukes til å skjule de fire faste hovedknappene.

## Sluttregel

Hovedraden er alltid **Events | Avtal å møtes | Kunnskapsmøte | Mer**. Alt annet er sekundært og må kvalifisere gjennom kategori, stedstype eller reelle data før det kan vises under `Mer`.
