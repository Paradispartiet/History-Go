# History GO — lokale stedsfunksjoner

Status: **canonical handlingskontrakt**  
Eier: `place_onsite_contract`  
Runtime: `js/ui/place-onsite-surface.js`  
Datakontrakt: `data/categories/place_onsite_contract.json`  
Sist kontrollert: **2026-09-11**

## Hovedregel

PlaceCard skal ikke være hovednavigasjon for globale oppdagelses- eller møteflater.

**Events** og de sosiale møteflatene er flyttet til **Utforsk i venstre panel**:

- **Utforsk → Events** viser kommende canonical events fra `HGEvents`.
- **Utforsk → Møtes** er én samlet brukerinngang for møteproduktet.
  - **Foreslå kunnskapsmøte** starter `HG_SpotmeetingUI` i valgt Place-kontekst.
  - **Mine møter / Social Meet** åpner `HG_SocialMeetUI` for forslag, avtaler, svar, læringssirkler og historikk.

Det finnes derfor ikke lenger separate PlaceCard-knapper for **Events**, **Avtal å møtes**, **Kunnskapsmøte** eller **Social Meet**.

## Møtes er én brukerflate, to interne ansvar

Kunnskapsmøte og Social Meet skal **slås sammen på navigasjons-/UX-nivå**, men ikke til én domenemotor:

- `HG_SpotmeetingUI` eier opprettelsen av et konkret møteforslag.
- `HG_SocialMeetUI` eier oppfølging av forslag, avtaler, status og historikk.

Dette bevarer eksisterende state-, backend- og privacy-kontrakter samtidig som spilleren bare trenger å finne én **Møtes**-inngang.

## Hva kan fortsatt ligge i PlaceCard/På stedet?

Bare handlinger som faktisk er bundet til den konkrete stedstypen eller stedet og som ikke er globale oppdagelsesflater.

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

- `movedSurfaces` låser Events og begge møteansvarene til Utforsk.
- `categoryPolicy` og `placeTypeOverrides` styrer bare gjenværende lokale stedsfunksjoner.

## Sluttregel

**Utforsk eier oppdagelse: Events og Møtes. PlaceCard eier bare ekte, lokale stedsfunksjoner.**
