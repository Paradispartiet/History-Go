# Synlig kartmarkør-fiks – pass 01: `data/places/by/oslo/places_by.json`

Generert: 2026-06-15. Arbeidsbranch: `claude/oslo-map-markers-fix-uyehdf`.

## Bakgrunn og hvorfor denne runden trengs

Forrige runder (batch 01 + verification pass 01/02, PR-er #1340–#1342) ryddet **metadata**:
de satte `coordType`/`coordStatus`/`coordNote`, la til `anchors` på lineære gater og
verifiserte mange konkrete punkter mot Wikidata/OSM. Men flere **synlige hovedmarkører**
lå fortsatt feil.

Årsaken er bekreftet i koden: kartmarkøren tegnes **bare fra `lat`/`lon`** på stedet.
I `js/map.js` (`drawPlaceMarkers`, linje 618–638) bygges hver markør som
`geometry: { type:"Point", coordinates:[lon, lat] }` direkte fra `p.lat`/`p.lon`.
Feltet `anchors` leses **ikke** av markørkoden – det er kun støttemetadata.
Derfor: hvis `lat/lon` er feil, hjelper ikke ankrene. For History GO må `lat/lon`
være punktet der markøren faktisk skal vises i kartet.

Denne runden retter `lat/lon` (og enkelte `r`) for bysteder der den synlige
hovedmarkøren fortsatt lå på feil sted. Kun koordinatrelaterte felt er rørt.

## Metode og ærlighet om kontroll

- **Map marker-kode lest og bekreftet** (`js/map.js`): markør = `lat/lon`, anchors er kun metadata.
- **Botsparken** er kartkontrollert mot **Wikidata Q11973058** (Grønlands park – Botsparken),
  som ga et autoritativt punkt. Flere steder (Grønland Basar-adresse, Tøyen torg, tigerstatuen)
  er kryssjekket mot websøk (Yelp/Waze/1881, Wikipedia, visitnorway) og verifiserte nabolandemerker.
- For lineære gater er hovedmarkøren satt til et **bevisst, gjenkjennelig spillpunkt**
  (ikke et tilfeldig geometrisk midtpunkt), kontrollert mot kjent gategeometri og de
  eksisterende endepunkt-ankrene. Disse beholdes som `semantic_anchor`.
- **Ingen gjetting / ingen falsk presisjon:** der ekte kartkontroll ikke ga en autoritativ
  node (tigeren, gronland_basarene, toyen_torg), er punktet bare nudget inn på riktig
  objekt/torgrom og stedet beholdt som `needs_review`. `verified` er ikke satt på disse.
- Direkte `fetch` mot Wikidata/OSM ga fortsatt HTTP 403 i miljøet; kontrollen er gjort via
  websøk + manuell vurdering, slik som i tidligere passeringer.

## Oppsummering

- Antall steder visuelt vurdert: **33** (hele prioritetslisten)
- Antall hovedmarkører endret (lat/lon flyttet): **11**
- Antall beholdt (markør allerede på riktig sted): **22**
- Steder som fikk lagt til ruteankre i denne runden: **1** (`gronlandsleiret`)

Koordinat-quality-gate: **0 harde feil** (grønn). `places:index:check`: i synk.
`health:places`: 2 errors, men begge er **forhåndseksisterende duplikat-id-er i
`data/places/historie/akershus/places_historie_akershus_batch1.json`** (eidsvollsbygningen,
oscarsborg_festning) – helt urelatert til denne filen og ikke introdusert her.

## Per vurdert sted

| id | name | gammel lat/lon/r | ny lat/lon/r | endret? | hvorfor hovedmarkør var feil/riktig | kilde/metode | coordStatus |
|---|---|---|---|---|---|---|---|
| torggata | Torggata | 59.9145/10.7539/180 | 59.915/10.7526/180 | ja | Lå ~120 m øst for gateløpet; flyttet til den gjenkjennelige gågate-/serveringsstrekningen (Torggata 11–13). | Manuell kartvurdering + endepunkt-ankre | semantic_anchor |
| storgata | Storgata | 59.9153/10.7521/230 | 59.9154/10.7539/230 | ja | Lå ~130 m vest for gateløpet (mot Torggata); flyttet til sentral Storgata-strekning. | Manuell kartvurdering + endepunkt-ankre | semantic_anchor |
| markveien | Markveien | 59.9235/10.7584/210 | 59.9235/10.7584/210 | nei | Lå allerede på riktig Grünerløkka-strekning (Markveien ved Olaf Ryes plass), riktig side av Akerselva/Thorvald Meyers gate. | Manuell kartvurdering | semantic_anchor |
| karl_johan | Karl Johans gate | 59.9138/10.7387/250 | 59.9136/10.7419/250 | ja | Lå på den åpne Eidsvolls plass-strekningen; flyttet ~170 m øst til Egertorget – mest gjenkjennelige gågate-punkt. | Manuell kartvurdering | semantic_anchor |
| bogstadveien | Bogstadveien | 59.9279/10.7157/220 | 59.9276/10.7178/220 | ja | Lå ~110 m vest for gateløpet; flyttet til midt på handlestrekningen. | Manuell kartvurdering + endepunkt-ankre | semantic_anchor |
| gronlandsleiret | Grønlandsleiret | 59.9124/10.7608/210 | 59.9116/10.767/210 | ja | Lå for langt vest/nord (mot Vaterland); flyttet til bygate-strekningen forbi Grønland kirke. La til 2 ruteankre. | Manuell kartvurdering + verifisert Grønland kirke | semantic_anchor |
| jernbanetorget | Jernbanetorget | 59.911/10.75/180 | 59.911/10.75/180 | nei | Allerede verifisert mot Wikidata Q1783215 (selve torget). | Wikidata (tidl. pass) | verified |
| oslo_s | Oslo S | 59.9111/10.7508/200 | 59.9111/10.7508/200 | nei | Allerede verifisert (stasjonshall vest mot Jernbanetorget). | Wikipedia/Bane NOR (tidl. pass) | verified |
| tigeren | Tigerstatuen | 59.9114/10.7508/150 | 59.9113/10.7514/120 | ja | Lå på stasjonsbygget; nudget til forplassen der statuen står, radius strammet til monumentet. Autoritativ node mangler fortsatt. | Websøk + verifiserte nabolandemerker | needs_review |
| christiania_torv | Christiania Torv | 59.9104/10.7397/150 | 59.9104/10.7397/150 | nei | Allerede verifisert mot OSM way 594329484. | OSM (tidl. pass) | verified |
| universitetsplassen | Universitetsplassen | 59.9154/10.7355/150 | 59.9154/10.7355/150 | nei | Allerede verifisert mot Wikidata Q12008507 + OSM. | Wikidata/OSM (tidl. pass) | verified |
| radhusplassen | Rådhusplassen | 59.9109/10.7326/220 | 59.9109/10.7326/220 | nei | Allerede verifisert mot Wikidata Q251078. | Wikidata (tidl. pass) | verified |
| bankplassen | Bankplassen | 59.9089/10.7415/150 | 59.9089/10.7415/150 | nei | Allerede verifisert mot Wikidata Q4856441. | Wikidata (tidl. pass) | verified |
| tjuvholmen | Tjuvholmen | 59.9069/10.7215/200 | 59.9061/10.7211/200 | ja | Lå på landtangen mot Aker Brygge; flyttet ~90 m sør til museet/skulpturparken/badeplassen folk oppsøker. | Manuell kartvurdering | semantic_anchor |
| barcode | Barcode | 59.9086/10.7588/210 | 59.908/10.7602/210 | ja | Lå i vestenden mot Operaen; flyttet til midt i selve Barcode-rekka langs Dronning Eufemias gate. | Manuell kartvurdering | semantic_anchor |
| operahuset | Operahuset | 59.9075/10.7527/190 | 59.9075/10.7527/190 | nei | Allerede verifisert mot Wikidata Q43280 + OSM (bygget). | Wikidata/OSM (tidl. pass) | verified |
| deichman_bjorvika | Deichman Bjørvika | 59.9087/10.7527/180 | 59.9087/10.7527/180 | nei | Allerede verifisert mot Wikidata Q81027761 (bygget). | Wikidata (tidl. pass) | verified |
| bislett | Bislett | 59.9247/10.7333/200 | 59.9247/10.7333/200 | nei | Allerede verifisert mot Wikidata Q866409 (anlegget). | Wikidata (tidl. pass) | verified |
| kampen_kirke | Kampen kirke | 59.912/10.782/160 | 59.912/10.782/160 | nei | Allerede verifisert mot Wikidata Q10297259 (Bøgata 1). | Wikidata (tidl. pass) | verified |
| gronland_basarene | Grønland basarene | 59.9128/10.7645/160 | 59.9125/10.765/150 | ja | Nudget til selve basarbygget (Tøyengata 2–6, ved Grønlandsleiret); radius strammet. Adresse bekreftet, men ingen autoritativ node. | Websøk (Yelp/Waze/1881) | needs_review |
| gronland_kirke | Grønland kirke | 59.9111/10.7677/160 | 59.9111/10.7677/160 | nei | Allerede verifisert mot Wikidata Q5612884 (kirkebygg). | Wikidata (tidl. pass) | verified |
| toyen_torg | Tøyen torg | 59.9154/10.7765/170 | 59.9153/10.7756/160 | ja | Nudget inn i selve torgrommet ved Tøyensenteret (lå litt øst for torget). Autoritativt torgsenter mangler. | Websøk + Tøyen T-bane som kryssref | needs_review |
| majorstuen_krysset | Majorstuen krysset | 59.9295/10.7146/200 | 59.9295/10.7146/200 | nei | Allerede på Majorstukrysset (ved verifisert Majorstuen st.); kryssenter flytende av natur. | Kryssref verifisert stasjon | needs_review |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | 59.9297/10.7147/170 | 59.9297/10.7147/170 | nei | Allerede verifisert mot Wikidata Q3356829. | Wikidata (tidl. pass) | verified |
| nationaltheatret_stasjon | Nationaltheatret stasjon | 59.9147/10.7318/170 | 59.9147/10.7318/170 | nei | Allerede verifisert (sentralt i stasjonsanlegget). | Wikipedia (tidl. pass) | verified |
| carl_berner_plass | Carl Berners plass | 59.9256/10.7779/180 | 59.9256/10.7779/180 | nei | Allerede verifisert mot Wikidata Q1772284. | Wikidata (tidl. pass) | verified |
| olaf_ryes_plass | Olaf Ryes plass | 59.9231/10.7589/170 | 59.9231/10.7589/170 | nei | Allerede verifisert mot Wikidata Q4993079 (plass/park). | Wikidata (tidl. pass) | verified |
| birkelunden | Birkelunden | 59.927/10.7601/190 | 59.927/10.7601/190 | nei | Allerede korrigert til faktisk park (OSM, ved Paulus kirke). | OSM (tidl. pass) | semantic_anchor |
| stensparken | Stensparken | 59.9272/10.733/200 | 59.9272/10.733/200 | nei | Allerede korrigert ~470 m vest til faktisk park (Wikidata Q7703624). | Wikidata/OSM (tidl. pass) | semantic_anchor |
| botsparken | Botsparken | 59.9052/10.7685/170 | 59.9096/10.7695/170 | ja | **Lå ~490 m for langt sør** (sør for fengselsmuren mot Klosterenga). Flyttet til selve parkrommet mellom Grønlandsleiret, politihuset og Oslo fengsel. | **Wikidata Q11973058** | semantic_anchor |
| slottsparken | Slottsparken | 59.9166/10.7278/250 | 59.9166/10.7278/250 | nei | Bevisst anker i søndre del nær Slottet (innenfor parken); bekreftet mot Wikidata Q4583462. | Wikidata (tidl. pass) | semantic_anchor |
| vigelandsparken | Vigelandsparken | 59.9269/10.7003/260 | 59.9269/10.7003/260 | nei | Bevisst sentralt parkanker nær Monolitten/fontenen; bekreftet mot OSM/Vigeland-skulpturer. | OSM (tidl. pass) | semantic_anchor |
| voienvolden | Voienvolden | 59.9344/10.7548/170 | 59.9344/10.7548/170 | nei | Allerede korrigert ~1,05 km nord til faktisk Vøienvolden gård (Maridalsveien 120). | Fortidsminneforeningen (tidl. pass) | verified |

## Antall

- **Visuelt vurdert:** 33
- **Hovedmarkører endret:** 11 (`torggata`, `storgata`, `karl_johan`, `bogstadveien`, `gronlandsleiret`, `tigeren`, `tjuvholmen`, `barcode`, `gronland_basarene`, `toyen_torg`, `botsparken`)
- **Beholdt:** 22

## Steder som fortsatt trenger manuell kontroll

- **`tigeren`** – markøren er nå på forplassen til Oslo S der statuen står, men en autoritativ OSM-node/Wikidata-koordinat for selve statuen ble fortsatt ikke funnet (`needs_review`).
- **`gronland_basarene`** – adresse (Tøyengata 2–6) bekreftet og markøren nudget til bygget, men presist byggsenter mangler autoritativ node (`needs_review`).
- **`toyen_torg`** – markøren er nå i torgrommet, men et autoritativt torgsenter-punkt mangler (`needs_review`).
- **`majorstuen_krysset`** – ligger korrekt ved Majorstukrysset/stasjonen, men kryssenteret er flytende av natur (`needs_review`).
- **`vulkan_energisentral`**, **`grunerlokka_helgesens_tm`** (ikke i prioritetslisten denne runden) står fortsatt som `needs_review` fra tidligere passeringer.

## Steder der anchors finnes, men hovedmarkøren var hovedproblemet

Dette er kjernen i runden: for disse var ankrene allerede på plass / rimelige, men den
**synlige** `lat/lon`-markøren lå feil og er nå rettet:

- **`torggata`** – anchors (Youngstorget/Ankerbrua) OK; hovedmarkøren lå øst for gata → flyttet til gågatestrekningen.
- **`storgata`** – anchors (Kirkeristen/Nybrua) OK; hovedmarkøren lå vest mot Torggata → flyttet til sentral Storgata.
- **`bogstadveien`** – anchors (Majorstuen/Hegdehaugsveien) OK; hovedmarkøren lå vest for gata → flyttet til handlestrekningen.
- **`karl_johan`** – anchors (Jernbanetorget/Slottet) OK; hovedmarkøren flyttet til Egertorget (mer gjenkjennelig enn Eidsvolls plass-strekningen).
- **`gronlandsleiret`** – manglet anchors; hovedmarkøren lå mot Vaterland → flyttet til bygatestrekningen og fikk 2 ruteankre.

## Note om søsterfil utenfor scope

`gronlandsleiret`/`botsparken`: sportsfilen
`data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json #lekeplass_botsparken`
ligger fortsatt på det gamle (sørlige) Botsparken-punktet (59.9053/10.769). Den er
**bevisst ikke rørt** (sportfiler er utenfor scope for denne runden) og bør korrigeres i en
egen sport-runde.

## Bekreftelser

- **Ingen andre place-filer er endret.** Kun `data/places/by/oslo/places_by.json` (kilde)
  og `data/places/places_index.json` (regenerert via `npm run places:index:build`).
- Ingen UI/kartkode, Leaflet/MapLibre, PlaceCard, Nearby, unlock/profil/quiz/Civication er rørt.
- Sport-/Lisboa-filer er ikke rørt; Blå-konflikten (`blaa`/`bla`) er ikke behandlet.
- Ingen `desc`, `popupDesc`, `quiz_profile`, `emne_ids`, `rounds`, `images`, `category`,
  `id` eller `name` er endret.
- `places_index.json` er kun regenerert av build-verktøyet, ikke håndrettet.
- Verifisert pipeline: `places:coords:check` (0 harde feil), `places:index:check` (i synk),
  `health:places` (kun forhåndseksisterende, urelaterte errors/varsler).
</content>
</invoke>
