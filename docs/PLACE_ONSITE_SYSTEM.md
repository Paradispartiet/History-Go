# History GO — lokale stedsfunksjoner

Status: **canonical handlingskontrakt**  
Eier: `place_onsite_contract`  
Runtime: `js/ui/place-onsite-surface.js`  
Datakontrakt: `data/categories/place_onsite_contract.json`  
Sist kontrollert: **2026-09-12**

## Hovedregel

Utforsk er fortsatt hovedoversikten for globale **Events** og **Møtes**, men PlaceCard skal også ha kompakte, stedskontekstuelle snarveier til de samme canonicale runtime-ene.

- **Utforsk → Events** viser den globale oversikten fra `HGEvents`.
- **PlaceCard → Events** filtrerer samme `HGEvents` på aktivt Place.
- **Utforsk → Møtes** samler oppstart og oppfølging.
- **PlaceCard → Møtes** åpner samme samlede inngang i aktiv Place-kontekst:
  - **Foreslå kunnskapsmøte** → `HG_SpotmeetingUI`.
  - **Mine møter / Social Meet** → `HG_SocialMeetUI`.
- Header-menyens **Møtes / Social Meet** åpner `HG_SocialMeetUI` direkte og er ikke avhengig av at Utforsk-draweren er initialisert.

PlaceCard-snarveiene er ikke parallelle state-eiere; de peker til de samme canonicale data- og møte-runtime-ene som Utforsk.

## Møtes er én brukerflate, to interne ansvar

Kunnskapsmøte og Social Meet skal **slås sammen på navigasjons-/UX-nivå**, men ikke til én domenemotor:

- `HG_SpotmeetingUI` eier opprettelsen av et konkret møteforslag.
- `HG_SocialMeetUI` eier oppfølging av forslag, avtaler, status og historikk.

Dette bevarer eksisterende state-, backend- og privacy-kontrakter samtidig som spilleren bare trenger å finne én **Møtes**-inngang.

## Hva kan fortsatt ligge i PlaceCard/På stedet?

I tillegg til de faste Events-/Møtes-snarveiene kan PlaceCard vise handlinger som faktisk er bundet til den konkrete stedstypen eller stedet.

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

- `placeCardShortcuts` låser de stedskontekstuelle Events-/Møtes-snarveiene.
- `movedSurfaces` beskriver Utforsk som global hovedoversikt uten å forby PlaceCard-snarveier.
- `categoryPolicy` og `placeTypeOverrides` styrer øvrige lokale stedsfunksjoner.

## Sluttregel

**Utforsk eier de globale oversiktene. PlaceCard kan alltid åpne Events og Møtes i aktiv stedskontekst, uten å eie parallelle data eller state.**
