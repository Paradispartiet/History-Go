# Ekte kartkontroll – verification pass 02 (oppfølging): `data/places/by/oslo/places_by.json`

Generert: 2026-06-15. Arbeidsbranch: `claude/oslo-places-verify-coords-f4ora2`.

Dette er en **oppfølgende kartkontrollrunde** etter verification pass 01 (commit `9bb453b`, allerede i `main`). Pass 01 verifiserte 16 konkrete punkter og lot bevisst **7 steder stå som `needs_review`** fordi et autoritativt, presist punkt ikke kunne kildebelegges i den runden (direkte henting fra Wikidata/OSM/Wikipedia var blokkert; bare websøk var tilgjengelig). Denne runden tar de samme 7 stedene opp igjen og forsøker ekte kartoppslag på nytt.

Som i pass 01 er **bare koordinatrelaterte felt** rørt (`lat`, `lon`, `coordType`, `coordStatus`, `coordNote`, `coordSource`, `coordSourceId`, `coordSourceUrl`, `coordPrecisionM`, `coordVerifiedAt`). Ingen `desc`, `popupDesc`, `quiz_profile`, `emne_ids`, `rounds`, `images`, `category`, `id` eller `name` er endret.

## Metode og ærlighet om kontroll

- **Kilder brukt denne runden:** websøk mot autoritative kilder (Fortidsminneforeningen, offisielle nettsteder, Wikipedia, adresseoppslag, OSM-/Wikidata-refererte koordinater i søketreff) med manuell kryssjekk mot nærliggende, allerede verifiserte landemerker og mot søsterpunkter i andre place-filer.
- **Verktøybegrensning (uendret fra pass 01):** direkte `fetch` mot `wikidata.org`/`no.wikipedia.org` ga HTTP 403 i miljøet. Kontrollen er derfor gjort via websøk + manuell vurdering. Et sted er bare satt til `verified` når flere uavhengige signaler peker på samme punkt.
- **Streng regel fulgt:** der ekte kartkontroll ikke ga et sikkert nok presist punkt, er stedet **ikke flyttet** og **ikke** satt til `verified`. Det står fortsatt som `needs_review`. Ingen gjetting.

## Oppsummering

- Antall steder kartkontrollert denne runden: **7** (alle gjenstående `needs_review` fra pass 01)
- Antall satt til `verified` denne runden: **1** (`voienvolden`)
- Antall koordinater faktisk endret (lat/lon flyttet): **1** (`voienvolden`, ~1,05 km)
- Antall fortsatt `needs_review` etter runden: **6**

Filstatus etter runden: `verified` **17**, `semantic_anchor` **36**, `needs_review` **6** (sum 59).
Koordinat-quality-gate: **0 harde feil** (grønn). `places:index:check`: i synk. `health:places`: **Errors: 0** (kun forhåndseksisterende bilde-varsler, ikke koordinatrelatert). Varsler i gaten falt 138 → 137 og review-kandidatsignaler 207 → 206 (voienvolden ikke lenger flagget for lav presisjon).

## Per kontrollert sted

| id | name | gammel lat/lon/r | ny lat/lon/r | coordStatus | coordType | kilde | endret? | begrunnelse |
|---|---|---|---|---|---|---|---|---|
| voienvolden | Voienvolden | 59.926/10.7435/170 | 59.9344/10.7548/170 | verified | building_center | Fortidsminneforeningen + adresse Maridalsveien 120 + kryssjekk voien_gard_voienvolden | ja | Korrigert ~1,05 km nordover til faktisk Vøienvolden gård (Maridalsveien 120, Sagene). Bekrefter og lukker mistanken fra pass 01. Tre samstemte signaler: adresse, koordinattreff (59.9344/10.7548) og søsterpunkt (59.935/10.7535). |
| tigeren | Tigerstatuen | 59.9114/10.7508/150 | 59.9114/10.7508/150 | needs_review | approximate | (Oslo S / Jernbanetorget som kryssref) | nei | Statuen står foran Oslo S på Jernbanetorget. Området er stadfestet via verifiserte `oslo_s` (59.9111/10.7508) og `jernbanetorget` (59.9110/10.7500), men en autoritativ OSM-node/Wikidata-koordinat for selve tigerstatuen ble ikke funnet. Ikke flyttet. |
| gronland_basarene | Grønland basarene | 59.9128/10.7645/160 | 59.9128/10.7645/160 | needs_review | building_center | Adresse Tøyengata 2-6 (Grønland Basar) | nei | Identitet/adresse bekreftet (Grønland Basar, Tøyengata 2-6, Grønland), men et presist byggsenter-punkt med autoritativ koordinat ble ikke kildebelagt. Ikke flyttet. |
| toyen_torg | Tøyen torg | 59.9154/10.7765/170 | 59.9154/10.7765/170 | needs_review | square_center | (Tøyen T-bane som kryssref) | nei | Punktet ligger nær Tøyen T-banestasjon (59.9150/10.7761); området er stadfestet, men et autoritativt torgsenter-punkt ble ikke funnet. Ikke flyttet. |
| vulkan_energisentral | Vulkan energisentral | 59.9233/10.7518/140 | 59.9233/10.7518/140 | needs_review | building_center | (Vulkan/Mathallen som kryssref) | nei | Energisentralens geobrønner ligger «inne i Mathallen» (Vulkan-området). Punktet ligger ved Mathallen, men koordinattreffene for Mathallen spriker mellom kilder (~59.9222 vs ~59.9234), så et presist byggpunkt ble ikke fastslått. Ikke flyttet. |
| majorstuen_krysset | Majorstuen krysset | 59.9295/10.7146/200 | 59.9295/10.7146/200 | needs_review | street_midpoint | (Majorstuen st. som kryssref) | nei | Stadfestet via verifisert `majorstuen_tbanestasjon` (59.9297/10.7147); eksakt kryssenter er flytende av natur. Ikke flyttet. |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | 59.9237/10.7576/220 | 59.9237/10.7576/220 | needs_review | street_midpoint | – | nei | Eksakt gatekryss ble ikke kildebelagt med autoritativ koordinat. Ikke flyttet. |

## Steder som fortsatt ikke kunne kontrolleres godt nok (beholdt `needs_review`, ikke flyttet)

- **`tigeren`** – område stadfestet via verifiserte `oslo_s`/`jernbanetorget`; mangler autoritativ node for selve statuen.
- **`gronland_basarene`** – adresse (Tøyengata 2-6) bekreftet; mangler presist byggsenter-punkt.
- **`toyen_torg`** – nærhet til Tøyen T-bane bekreftet; mangler autoritativt torgsenter.
- **`vulkan_energisentral`** – tilhørighet til Mathallen/Vulkan bekreftet; sprikende koordinatkilder for Mathallen, mangler presist byggpunkt.
- **`majorstuen_krysset`** – stadfestet via stasjon; kryssenter flytende.
- **`grunerlokka_helgesens_tm`** – eksakt krysspunkt ikke kildebelagt.

Disse bør stadfestes når direkte oppslag mot Wikidata `P625`/OSM-node er tilgjengelig (per nå blokkert i miljøet).

## Steder som bør tas i senere rute-/anchor-spesialrunde (uendret fra pass 01)

Lineære gater/ruter (`torggata`, `karl_johan`, `storgata`, `bogstadveien`, `markveien`, `gronlandsleiret`, `akerselva`), symbolske rute-ankre (`ring_3`, `trikk_17_18`) og område-/bydelsankre (`bjorvika`, `aker_brygge`, `tjuvholmen`, `sorenga`, `barcode`, `bispelokket`, `tullin`, `okern`, `skoyen`, `torshov`, `grorud`, `sagene`, `nydalen`, `ullern`, `vinderen`, `vaalerenga`, `rodelokka`, `romsaås`, `ullevål_hageby`, `botsparken`, `spikersuppa`) er ikke kartkontrollert i denne punktrunden og står som `semantic_anchor`. De bør få autoritativ kilde / endepunktskontroll i en egen rute-/områderunde.

## Bekreftelser

- Ingen andre place-filer er endret. Kun `data/places/by/oslo/places_by.json` (kilde) og `data/places/places_index.json` (regenerert via build-script).
- Ingen UI/kartkode, Leaflet/MapLibre, PlaceCard, Nearby, unlock/profil/quiz/Civication er rørt.
- Sport/Lisboa-filer er ikke rørt; Blå-konflikten (`blaa`/`bla`) er ikke behandlet.
- Ingen `desc`, `popupDesc`, `quiz_profile`, `emne_ids`, `rounds`, `images`, `category`, `id` eller `name` er endret.
- `places_index.json` er kun regenerert av build-verktøyet, ikke håndrettet.
- Verifisert pipeline: `places:coords:check` (0 harde feil), `places:index:check` (i synk), `health:places` (Errors: 0).
