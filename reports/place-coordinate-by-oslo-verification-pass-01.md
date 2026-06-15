# Ekte kartkontroll – verification pass 01: `data/places/by/oslo/places_by.json`

Generert: 2026-06-15. Arbeidsbranch: `claude/oslo-places-verify-coords-046hdo`.

Dette er **ekte kartkontroll** (verification pass) av samme fil som ble semantisk ryddet i batch 01 (PR #1340). Der batch 01 eksplisitt **ikke** gjorde live kartoppslag og derfor ikke satte noe sted til `verified`, er hvert konkret punkt her kontrollert mot eksterne kartkilder (Wikidata `P625`, OpenStreetMap, offisielle/encyklopediske kilder, Bane NOR/Wikipedia for stasjoner). Kun koordinatrelaterte felt er endret (`lat`, `lon`, `coordType`, `coordStatus`, `coordNote`, `coordSource`, `coordSourceId`, `coordSourceUrl`, `coordPrecisionM`, `coordVerifiedAt`). Innhold som `desc`, `popupDesc`, `quiz_profile`, `emne_ids`, `rounds`, `images`, `category`, `id` og `name` er **ikke** rørt.

## Metode og ærlighet om kontroll

- **Kilder brukt:** Wikidata (`P625`-koordinat med QID), OpenStreetMap (way/node-id), offisielle/encyklopediske kilder (Wikipedia, Bane NOR for stasjoner, Fortidsminneforeningen, Oslo byleksikon). For hvert sted ble eksisterende punkt sammenholdt med minst én autoritativ kilde, og krysssjekket mot nærliggende, allerede verifiserte landemerker (f.eks. plassering i Kvadraturen, ved Jernbanetorget, ved en kjent stasjon). Manuell vurdering av stedstype (bygg vs. plass vs. stasjon vs. park) avgjorde hvor punktet skulle ligge.
- **`verified`** er satt **kun** der et autoritativt punkt faktisk ble kontrollert og stedstypen vurdert. Hvert verified-sted har `coordSource`, `coordSourceId`, `coordSourceUrl`, `coordPrecisionM` og `coordVerifiedAt`.
- **`semantic_anchor`** beholdt for parker/områder/knutepunkt der ett presist punkt ikke er riktig modell, men der ankeret nå er stadfestet mot kilde (og flyttet til faktisk sentroide der det lå utenfor området). Disse har også `coordSource`/`coordSourceUrl`.
- **`needs_review`** beholdt der ekte kartkontroll **ikke** ga et sikkert nok punkt. Disse er **ikke flyttet** (ingen gjetting); `coordNote` forklarer hva som ble stadfestet og hva som mangler.
- **Verktøybegrensning:** direkte henting fra Nominatim/Wikidata/Wikipedia via fetch var blokkert i miljøet; kontrollen er derfor gjort via websøk mot de samme autoritative kildene (Wikidata-QID/`P625`, OSM-id, offisielle sider) med manuell kryssjekk og vurdering. Der en kilde ikke kunne bekreftes godt nok, er stedet bevisst holdt på `needs_review`.

## Oppsummering

- Antall steder kartkontrollert: **29**
- Antall satt til `verified`: **16**
- Antall beholdt som `semantic_anchor` (nå med kilde): **6** kontrollert i denne runden (filen har totalt 36 `semantic_anchor`)
- Antall fortsatt `needs_review`: **7** (alle kontrollert, men uten sikkert nok punkt)
- Antall koordinater faktisk endret (lat/lon flyttet): **20**

Filstatus etter runden: `verified` **16**, `semantic_anchor` **36**, `needs_review` **7** (sum 59).
Koordinat-quality-gate: **0 harde feil** (grønn). `places:index:check`: i synk. `health:places`: **Errors: 0** (kun forhåndseksisterende bilde-varsler, ikke koordinatrelatert).

## Per kontrollert sted

| id | name | gammel lat/lon/r | ny lat/lon/r | coordStatus | coordType | kilde | endret? | begrunnelse |
|---|---|---|---|---|---|---|---|---|
| operahuset | Operahuset | 59.9075/10.7533/190 | 59.9075/10.7527/190 | verified | building_center | Wikidata Q43280 + OSM | ja | Operabygget i Bjørvika; lon justert til bygningskoordinat. |
| oslo_s | Oslo S | 59.9106/10.7523/200 | 59.9111/10.7508/200 | verified | transit_anchor | Wikipedia (Oslo Central Station) + Bane NOR | ja | Stasjonshall vest mot Jernbanetorget; skilt fra torget og tigeren. |
| jernbanetorget | Jernbanetorget | 59.9112/10.7505/180 | 59.9110/10.7500/180 | verified | transit_anchor | Wikidata Q1783215 | ja | Selve torget foran Oslo S. |
| deichman_bjorvika | Deichman Bjørvika | 59.9078/10.7546/180 | 59.9087/10.7527/180 | verified | building_center | Wikidata Q81027761 | ja | Bibliotekbygget; korrigert ~140 m fra punkt som lå mot Operaen. |
| kampen_kirke | Kampen kirke | 59.9167/10.7781/160 | 59.9120/10.7820/160 | verified | building_center | Wikidata Q10297259 | ja | Korrigert sør/øst til faktisk kirkebygg (Bøgata 1) – bekreftet batch 01-mistanke. |
| gronland_kirke | Grønland kirke | 59.9125/10.7678/160 | 59.9111/10.7677/160 | verified | building_center | Wikidata Q5612884 | ja | Korrigert ~155 m sørover til kirkebygg. |
| radhusplassen | Rådhusplassen | 59.9111/10.7314/220 | 59.9109/10.7326/220 | verified | square_center | Wikidata Q251078 | ja | Plassanker stadfestet. |
| christiania_torv | Christiania Torv | 59.9077/10.7414/150 | 59.9104/10.7397/150 | verified | square_center | OSM way 594329484 + Google Maps | ja | Korrigert ~330 m nordover; lå feil ved havnefronten. |
| bankplassen | Bankplassen | 59.9077/10.7419/150 | 59.9089/10.7415/150 | verified | square_center | Wikidata Q4856441 | ja | Korrigert ~130 m nordover (Kvadraturen). |
| universitetsplassen | Universitetsplassen | 59.915/10.7397/150 | 59.9154/10.7355/150 | verified | square_center | Wikidata Q12008507 + OSM | ja | Korrigert ~245 m vestover til plassen ved de gamle universitetsbygningene. |
| bislett | Bislett | 59.9254/10.7332/200 | 59.9247/10.7333/200 | verified | sports_area_anchor | Wikidata Q866409 | ja | Anleggskoordinat stadfestet. |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | 59.9293/10.7146/170 | 59.9297/10.7147/170 | verified | transit_anchor | Wikidata Q3356829 | ja | Stasjonspunkt stadfestet. |
| nationaltheatret_stasjon | Nationaltheatret stasjon | 59.9145/10.7319/170 | 59.9147/10.7318/170 | verified | transit_anchor | Wikipedia (rail + metro) | ja | Anker sentralt i stasjonsanlegget (rail ~10.730 / metro ~10.733). |
| carl_berner_plass | Carl Berners plass | 59.9282/10.7819/180 | 59.9256/10.7779/180 | verified | square_center | Wikidata Q1772284 (2 kilder) | ja | Korrigert ~350 m sørvest fra punkt mot Sinsen. |
| olaf_ryes_plass | Olaf Ryes plass | 59.9238/10.7589/170 | 59.9231/10.7589/170 | verified | square_center | Wikidata Q4993079 | ja | Plass/parkanker stadfestet (lat justert). |
| oslo_bussterminal | Oslo bussterminal | 59.9095/10.759/180 | 59.9112/10.7585/180 | verified | transit_anchor | Wikidata Q7107012 + Wikipedia | ja | Korrigert ~180 m nordover til terminalbygget (Galleri Oslo). |
| st_hanshaugen_park | St. Hanshaugen park | 59.9234/10.7463/220 | 59.9273/10.7414/220 | semantic_anchor | park_anchor | OSM way 3426697 / Wikidata Q4566796 | ja | Parkanker flyttet ~500 m NV til faktisk parkpolygon. |
| stensparken | Stensparken | 59.9268/10.7406/200 | 59.9272/10.7330/200 | semantic_anchor | park_anchor | Wikidata Q7703624 / OSM (Stensgata) | ja | Korrigert ~470 m vest; lå utenfor parken. |
| birkelunden | Birkelunden | 59.9256/10.7574/190 | 59.9270/10.7601/190 | semantic_anchor | park_anchor | OSM (Birkelunden) / Paulus kirke | ja | Parkanker korrigert ~235 m NØ til faktisk park. |
| slottsparken | Slottsparken | 59.9166/10.7278/250 | 59.9166/10.7278/250 | semantic_anchor | park_anchor | Wikidata Q4583462 | nei | Anker beholdt i søndre del nær Slottet (innenfor parken); kilde lagt til. |
| vigelandsparken | Vigelandsparken | 59.9269/10.7003/260 | 59.9269/10.7003/260 | semantic_anchor | park_anchor | OSM (Frogner Park) / Vigeland-skulpturer | nei | Bevisst sentralt parkanker; plassering bekreftet, eksakt Monolitt-punkt ikke kildebelagt. |
| helsfyr | Helsfyr | 59.9139/10.8015/200 | 59.9128/10.8008/200 | semantic_anchor | transit_anchor | Wikipedia (Helsfyr station) | ja | Anker satt på Helsfyr T-banestasjon (knutepunkt). |
| tigeren | Tigerstatuen | 59.9114/10.7508/150 | 59.9114/10.7508/150 | needs_review | approximate | (Jernbanetorget/Oslo S som kryssref) | nei | Området stadfestet, men eksakt statuepunkt mangler autoritativ kilde – ikke flyttet. |
| gronland_basarene | Grønland basarene | 59.9128/10.7645/160 | 59.9128/10.7645/160 | needs_review | building_center | (Grønland st. som kryssref) | nei | Område stadfestet; eksakt basarbygg ikke kildebelagt – ikke flyttet. |
| toyen_torg | Tøyen torg | 59.9154/10.7765/170 | 59.9154/10.7765/170 | needs_review | square_center | (Tøyen T-bane som kryssref) | nei | Område stadfestet via T-bane; eksakt torgsenter ikke kildebelagt. |
| vulkan_energisentral | Vulkan energisentral | 59.9233/10.7518/140 | 59.9233/10.7518/140 | needs_review | building_center | (Vulkan/Mathallen som kryssref) | nei | Vulkan-området stadfestet; eksakt energisentral-bygg ikke kildebelagt. |
| majorstuen_krysset | Majorstuen krysset | 59.9295/10.7146/200 | 59.9295/10.7146/200 | needs_review | street_midpoint | (Majorstuen st. som kryssref) | nei | Stadfestet via stasjon; eksakt kryssenter flytende – ikke flyttet. |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | 59.9237/10.7576/220 | 59.9237/10.7576/220 | needs_review | street_midpoint | – | nei | Eksakt krysspunkt ikke kildebelagt i denne runden. |
| voienvolden | Voienvolden | 59.926/10.7435/170 | 59.926/10.7435/170 | needs_review | building_center | Fortidsminneforeningen / Wikidata Q12010282 | nei | **Ser feilplassert ut ~1 km sør** for faktisk Vøienvolden gård (Maridalsveien 120, Sagene, ~59.935/10.755). Presist desimalpunkt ikke kildebelagt – ikke flyttet, flagget for egen runde. |

## Steder som ikke kunne kontrolleres godt nok (beholdt `needs_review`, ikke flyttet)

- **`voienvolden`** – identitet bekreftet (Vøienvolden gård, Maridalsveien 120, Sagene, Wikidata Q12010282), og nåværende punkt ser ut til å ligge ~1 km for langt sør. Men presist desimalpunkt (4 desimaler) ble ikke kildebelagt i denne runden, derfor ikke flyttet. **Bør korrigeres til ~59.935/10.755 i egen runde** med presis kilde (jf. søsterpunkt `voien_gard_voienvolden` i Akerselva-rutefilen, 59.935/10.7535).
- **`tigeren`** – statuepunkt; OSM-node for selve tigerstatuen ikke funnet. Området er stadfestet via verifiserte `jernbanetorget` og `oslo_s`.
- **`gronland_basarene`**, **`toyen_torg`**, **`vulkan_energisentral`**, **`majorstuen_krysset`** – område/nærhet stadfestet mot verifisert nabolandemerke (Grønland st., Tøyen T-bane, Vulkan/Mathallen, Majorstuen st.), men eksakt bygg-/senter-/krysspunkt mangler autoritativ kilde.
- **`grunerlokka_helgesens_tm`** – eksakt gatekryss ikke kildebelagt.
- **`spikersuppa`** (allerede `semantic_anchor`, ikke i tabellen) – autoritativt senterpunkt ikke funnet; ankeret er beholdt uendret og bør stadfestes i en senere runde.

## Steder som bør tas i senere rute-/anchor-spesialrunde (ikke behandlet her)

Denne runden var konsentrert om konkrete punktfeatures. Følgende er bevisst **ikke** kartkontrollert i denne passeringen og bør tas i en egen rute-/områderunde (de står uendret som `semantic_anchor` fra batch 01):

- **Lineære gater/ruter med anchors:** `torggata`, `karl_johan`, `storgata`, `bogstadveien`, `markveien`, `gronlandsleiret`, `akerselva` – ruteankrene bør kontrolleres endepunkt for endepunkt mot faktisk trasé.
- **Symbolske rute-ankre (bevisst lav presisjon):** `ring_3`, `trikk_17_18` – bør deles i ruteankre.
- **Område-/bydelsankre:** `bjorvika`, `aker_brygge`, `tjuvholmen`, `sorenga`, `barcode`, `bispelokket`, `tullin`, `okern`, `skoyen`, `torshov`, `grorud`, `sagene`, `nydalen`, `ullern`, `vinderen`, `vaalerenga`, `rodelokka`, `romsaås`, `ullevål_hageby`, `botsparken` – beholdes som bevisste områdeankre; bør få en autoritativ kilde (Wikidata/OSM-bydelssentroide) i egen runde.

## Bekreftelser

- Ingen andre place-filer er endret. Kun `data/places/by/oslo/places_by.json` (kilde) og `data/places/places_index.json` (regenerert via build-script).
- Ingen UI/kartkode, Leaflet/MapLibre, PlaceCard, Nearby, unlock/profil/quiz/Civication er rørt.
- Sport/Lisboa-filer er ikke rørt; Blå-konflikten (`blaa`/`bla`) er ikke behandlet.
- Ingen `desc`, `popupDesc`, `quiz_profile`, `emne_ids`, `rounds`, `images`, `category`, `id` eller `name` er endret.
- `places_index.json` er kun regenerert av build-verktøyet, ikke håndrettet.
- Verifisert pipeline: `places:coords:check` (0 harde feil), `places:index:check` (i synk), `health:places` (Errors: 0).
