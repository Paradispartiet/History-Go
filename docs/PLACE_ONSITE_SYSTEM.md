# History GO — lokale stedsfunksjoner

Status: **canonical handlingskontrakt**  
Eier: `place_onsite_contract`  
Runtime: `js/ui/place-onsite-surface.js`  
Datakontrakt: `data/categories/place_onsite_contract.json`  
Sist kontrollert: **2026-09-12**

## Hovedregel

**Events** og **Møtes** er en del av PlaceCard sin lokale **Utforsk**-flate.

I standard Place Sheet ligger de i **venstre hero-kolonne**, direkte under de fire canonicale Utforsk-samlingene:

`frontImage → Utforsk-rundinger/rektangler → Events / Møtes`

- **PlaceCard → Utforsk → Events** bruker canonical `HGEvents` filtrert på aktivt Place.
- **PlaceCard → Utforsk → Møtes** samler oppstart og oppfølging:
  - **Foreslå kunnskapsmøte** → `HG_SpotmeetingUI`.
  - **Mine møter / Social Meet** → `HG_SocialMeetUI`.
- Header-menyens **Møtes / Social Meet** er fortsatt en direkte snarvei til `HG_SocialMeetUI`.
- Det globale venstre Utforsk-panelet skal ikke ha egne Events-/Møtes-tabs.

PlaceCard-snarveiene bruker de samme canonicale data- og møte-runtime-ene og oppretter ingen parallell state.

## Møtes er én brukerflate, to interne ansvar

Kunnskapsmøte og Social Meet skal **slås sammen på navigasjons-/UX-nivå**, men ikke til én domenemotor:

- `HG_SpotmeetingUI` eier opprettelsen av et konkret møteforslag.
- `HG_SocialMeetUI` eier oppfølging av forslag, avtaler, status og historikk.

Dette bevarer eksisterende state-, backend- og privacy-kontrakter samtidig som spilleren bare trenger å finne én **Møtes**-inngang.

## Hva kan fortsatt ligge i PlaceCard/På stedet?

Under Events/Møtes kan PlaceCard også vise handlinger som faktisk er bundet til den konkrete stedstypen eller stedet.

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

- `movedSurfaces` låser Events/Møtes til `PlaceCard → Utforsk`.
- Place Sheet-shellen eier den fysiske plasseringen i venstre hero-kolonne.
- `categoryPolicy` og `placeTypeOverrides` styrer øvrige lokale stedsfunksjoner.

## Sluttregel

**Events og Møtes ligger i PlaceCard sin venstre Utforsk-kolonne, direkte under samlingene.**
