# History GO — lokale stedsfunksjoner

Status: **canonical handlingskontrakt**  
Eier: `place_onsite_contract`  
Runtime: `js/ui/place-onsite-surface.js`  
Datakontrakt: `data/categories/place_onsite_contract.json`  
Sist kontrollert: **2026-09-12**

## Hovedregel

Utforsk i venstre panel er den canonicale synlige plasseringen for globale **Events** og **Møtes**.

- Øverste Utforsk-rad består av rundingene **Steder, Folk, Natur, Ruter og Merker**.
- **Events** og **Møtes** ligger i en egen sekundærrad direkte under disse rundingene.
- **Utforsk → Events** viser den globale oversikten fra `HGEvents`.
- **Utforsk → Møtes** samler oppstart og oppfølging:
  - **Foreslå kunnskapsmøte** → `HG_SpotmeetingUI`.
  - **Mine møter / Social Meet** → `HG_SocialMeetUI`.
- Header-menyens **Møtes / Social Meet** er en snarvei som åpner `HG_SocialMeetUI` direkte.

PlaceCard skal ikke vise globale Events- eller Møtes-snarveier.

## Møtes er én brukerflate, to interne ansvar

Kunnskapsmøte og Social Meet skal **slås sammen på navigasjons-/UX-nivå**, men ikke til én domenemotor:

- `HG_SpotmeetingUI` eier opprettelsen av et konkret møteforslag.
- `HG_SocialMeetUI` eier oppfølging av forslag, avtaler, status og historikk.

Dette bevarer eksisterende state-, backend- og privacy-kontrakter samtidig som spilleren bare trenger å finne én **Møtes**-inngang.

## Hva kan fortsatt ligge i PlaceCard/På stedet?

PlaceCard kan bare vise handlinger som faktisk er bundet til den konkrete stedstypen eller stedet.

### Lek

Lek vises bare når stedstypen er en faktisk lekeplass/lekepark (`lekeplass`, `lekepark`, `playground`).

En park, stadion, kirke, konsertscene eller annet sted får ikke Lek bare fordi lek kan forekomme der.

Framtidige lokale handlinger må på samme måte kvalifisere gjennom canonical kategori/stedstype eller reelle data. Et ordinært Place uten slike handlinger skal ikke vise en tom «På stedet»-flate.

## Ekskluderte konsepter

### Oppgaver

Oppgaver/`tasks_profile` er fjernet som History GO-produktkonsept og skal ikke presenteres som stedsfunksjon.

### Trening

Trening er ikke en generell stedsfunksjon. `training_profile` er type-spesifikt sportsinnhold og vises i stedspopupen for sportssteder når relevant.

### Quiz, Observer, Notat og Rute

Disse beholder sine egne etablerte flows og skal ikke dupliseres inn i Utforsk → Møtes eller den lokale stedsflaten.

## Canonical kategori-policy

Den maskinlesbare matrisen ligger i `data/categories/place_onsite_contract.json`.

- `movedSurfaces` beskriver Utforsk som global hovedoversikt.
- Events/Møtes eies av venstre Utforsk-panel og finnes ikke i `js/ui/place-onsite-surface.js`.
- `categoryPolicy` og `placeTypeOverrides` styrer lokale stedsfunksjoner.

## Sluttregel

**Utforsk eier Events og Møtes. PlaceCard eier bare lokale stedsfunksjoner.**
