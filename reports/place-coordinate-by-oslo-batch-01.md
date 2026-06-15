# Koordinatgjennomgang – batch 01: `data/places/by/oslo/places_by.json`

Generert: 2026-06-15. Arbeidsbranch: `claude/oslo-places-coords-batch-01-75va0o`.

Dette er den **første systematiske, fil-for-fil koordinatgjennomgangen** av en place-fil, utført etter at koordinatverktøysporet ble reparert (PR #1338) og audit-statuslogikken rettet (PR #1339). Kun filen `data/places/by/oslo/places_by.json` er behandlet. Hvert sted er gått gjennom i filrekkefølge, klassifisert etter stedstype og gitt koordinatmetadata. Kun koordinatrelaterte felt er endret (`lat`, `lon`, `r`, `anchors`, `coordType`, `coordStatus`, `coordPrecisionM`, `coordNote`). Innhold som `desc`, `popupDesc`, `quiz_profile`, `emne_ids`, `rounds`, `images`, `category`, `id` og `name` er ikke rørt.

## Metode og ærlighet om kontroll

- Det er ikke utført live kartoppslag i denne batchen (ingen runtime-geocoding, Nominatim er ikke brukt som automatisk fasit).
- `coordStatus` er derfor satt konservativt og ærlig:
  - **`semantic_anchor`** for bevisste spill-/områdeankre (områder, bydeler, parker, elv, gater, transittkorridorer, store plasser brukt som anker). `coordNote` forklarer ankervalget.
  - **`needs_review`** for konkrete punkter som beholdes, men som bør stadfestes mot kart.
  - **`verified`** er **ikke** brukt på noe sted, fordi faktisk kartkontroll ikke er gjort i denne batchen. Ingen `verified` uten kontroll.
- Der presisjon er forbedret (f.eks. Operahuset, Oslo S), er det gjort mot kjent landemerkeplassering og likevel markert `needs_review` for endelig stadfesting.

## Oppsummering

- Antall steder gjennomgått: **59**
- Antall steder med endret koordinatpunkt (lat/lon/r/anchors): **16**
- Antall steder med beholdt punkt (kun metadata lagt til): **43**
- Antall satt til `semantic_anchor`: **36**
- Antall satt til `needs_review`: **23**
- Antall satt til `verified`: **0**

Koordinat-quality-gate: **0 harde feil** (grønn). Varsler for denne filen falt fra 24 til 8, og review-kandidatsignaler for filen ble kraftig redusert ved at hvert sted nå har coordType/coordStatus/coordNote.

## Per sted

| id | name | status | gammel lat/lon/r | ny lat/lon/r | coordType | coordStatus | endret? | begrunnelse |
|---|---|---|---|---|---|---|---|---|
| torggata | Torggata | semantic_anchor_changed | 59.9145/10.7539/180 | 59.9145/10.7539/180 (+2 anchors) | street_midpoint | semantic_anchor | ja | Lineær handlegate. Hovedpunktet er satt midt på gata; semantiske ruteankre markerer søndre (Youngstorget) og nordre (Ankerbrua) ende for kartvisning. |
| bispelokket | Bispelokket / Trafikkmaskinen | semantic_anchor_unchanged | 59.9078/10.7538/220 | 59.9078/10.7538/220 | area_anchor | semantic_anchor | nei | Revet trafikkmaskin i Bjørvika. Punktet er et bevisst områdeanker som markerer den tidligere plasseringen mellom Bispegata og Nylandsveien; ingen bygning står her i dag. |
| gronland_basarene | Grønland basarene | needs_review | 59.9128/10.7645/160 | 59.9128/10.7645/160 | building_center | needs_review | nei | Konkret basarbygg på Grønland. Punktet ser rimelig ut, men eksakt byggsenter bør stadfestes mot kart. |
| karl_johan | Karl Johans gate | semantic_anchor_changed | 59.9138/10.7387/250 | 59.9138/10.7387/250 (+2 anchors) | street_midpoint | semantic_anchor | ja | Nasjonal paradeakse mellom Jernbanetorget og Slottet. Hovedpunktet er satt sentralt (Egertorget/Stortinget); semantiske ruteankre markerer begge ender for kartvisning. |
| radhusplassen | Rådhusplassen | needs_review | 59.9111/10.7314/220 | 59.9111/10.7314/220 | square_center | needs_review | nei | Stort åpent byrom foran Rådhuset. Punktet ligger rimelig sentralt på plassen, men bør stadfestes mot kart. |
| bjorvika | Bjørvika | semantic_anchor_unchanged | 59.9075/10.7531/220 | 59.9075/10.7531/220 | area_anchor | semantic_anchor | nei | Utstrakt transformasjonsområde. Punktet er et bevisst områdeanker sentralt i Bjørvika, ikke en enkelt adresse. |
| ring_3 | Ring 3 | semantic_anchor_unchanged | 59.931/10.792/400 | 59.931/10.792/400 | route_midpoint | semantic_anchor | nei | Ringvei rundt byen. Ett punkt kan ikke dekke hele traseen; punktet er et bevisst symbolsk anker for kartvisning. Lav presisjon beholdt bevisst; bør deles opp i ruteankre ved senere manuell kartrunde. |
| trikk_17_18 | Trikkelinje 17/18 | semantic_anchor_unchanged | 59.92/10.76/300 | 59.92/10.76/300 | route_midpoint | semantic_anchor | nei | Tverrgående trikkelinjer. Ett punkt dekker ikke linjene; punktet er et bevisst symbolsk anker midt i indre by. Lav presisjon beholdt bevisst; bør få ruteankre ved senere manuell kartrunde. |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | needs_review | 59.9237/10.7576/220 | 59.9237/10.7576/220 | street_midpoint | needs_review | nei | Gatekryss Helgesens gate / Thorvald Meyers gate. Punktet ser rimelig ut, men eksakt krysspunkt bør stadfestes mot kart. |
| toyen_torg | Tøyen torg | needs_review | 59.9154/10.7765/170 | 59.9154/10.7765/170 | square_center | needs_review | nei | Nabolagstorg. Punktet ser rimelig ut; eksakt torgsenter bør stadfestes mot kart. |
| majorstuen_krysset | Majorstuen krysset | needs_review | 59.9295/10.7146/200 | 59.9295/10.7146/200 | street_midpoint | needs_review | nei | Stort trafikkryss ved Majorstuen. Punktet ser rimelig ut; eksakt krysspunkt bør stadfestes mot kart. |
| st_hanshaugen_park | St. Hanshaugen park | semantic_anchor_unchanged | 59.9234/10.7463/220 | 59.9234/10.7463/220 | park_anchor | semantic_anchor | nei | Bypark på høyde. Punktet er et bevisst parkanker; radius dekker oppholdsarealene. Park bør ikke behandles som ett presist punkt. |
| oslo_s | Oslo S | needs_review | 59.911/10.7528/200 | 59.9106/10.7523/200 | transit_anchor | needs_review | ja | Stasjonsbygningen. Flyttet vekk fra delt punkt med Jernbanetorget/Tigeren; markerer Oslo S’ hovedbygning. Bør stadfestes mot kart. |
| vulkan_energisentral | Vulkan energisentral | needs_review | 59.9233/10.7518/140 | 59.9233/10.7518/140 | building_center | needs_review | nei | Teknisk anlegg på Vulkan. Punktet ser rimelig ut; eksakt plassering bør stadfestes mot kart. |
| aker_brygge | Aker Brygge | semantic_anchor_unchanged | 59.9097/10.7256/180 | 59.9097/10.7256/180 | area_anchor | semantic_anchor | nei | Utstrakt havne- og bryggeområde. Punktet er et bevisst områdeanker, ikke en enkelt adresse. |
| tigeren | Tigerstatuen | needs_review | 59.9111/10.7528/150 | 59.9114/10.7508/150 | approximate | needs_review | ja | Tigerstatuen («Christiania-tigeren») foran Oslo S på Jernbanetorget. Flyttet vekk fra delt punkt med Oslo S/Jernbanetorget; presist punkt bør stadfestes mot kart. |
| gronland_kirke | Grønland kirke | needs_review | 59.9125/10.7678/160 | 59.9125/10.7678/160 | building_center | needs_review | nei | Kirkebygg på Grønland. Punktet ser rimelig ut; eksakt byggpunkt bør stadfestes mot kart. |
| kampen_kirke | Kampen kirke | needs_review | 59.9167/10.7781/160 | 59.9167/10.7781/160 | building_center | needs_review | nei | Kampen kirke. Oppgitt punkt (lat ~59.9167) ser ut til å ligge for langt nord for Kampen-høyden (kirken ligger nærmere ~59.912); må stadfestes mot kart før eventuell flytting. |
| jernbanetorget | Jernbanetorget | needs_review | 59.9111/10.7528/180 | 59.9112/10.7505/180 | transit_anchor | needs_review | ja | Kollektiv- og handelsknutepunkt. Flyttet vekk fra delt punkt med Oslo S/Tigeren; markerer selve torget vest for stasjonen. Bør stadfestes mot kart. |
| oslo_bussterminal | Oslo bussterminal | needs_review | 59.9095/10.759/180 | 59.9095/10.759/180 | transit_anchor | needs_review | nei | Bussterminalen ved Schweigaards gate. Lav presisjon i oppgitt punkt; eksakt terminalpunkt bør stadfestes mot kart. |
| helsfyr | Helsfyr | semantic_anchor_unchanged | 59.9139/10.8015/200 | 59.9139/10.8015/200 | transit_anchor | semantic_anchor | nei | Kollektivknutepunkt og delområde. Punktet er et bevisst områdeanker ved Helsfyr; ikke én adresse. |
| bogstadveien | Bogstadveien | semantic_anchor_changed | 59.9279/10.7157/220 | 59.9279/10.7157/220 (+2 anchors) | street_midpoint | semantic_anchor | ja | Lineær handlegate mellom Majorstuen og Hegdehaugsveien. Hovedpunktet er satt midt på gata; semantiske ruteankre markerer begge ender for kartvisning. |
| markveien | Markveien | semantic_anchor_changed | 59.9235/10.7584/210 | 59.9235/10.7584/210 (+2 anchors) | street_midpoint | semantic_anchor | ja | Lineær gate gjennom Grünerløkka langs Akerselva. Hovedpunktet er satt midt på gata; semantiske ruteankre markerer søndre og nordre ende for kartvisning. |
| gronlandsleiret | Grønlandsleiret | semantic_anchor_unchanged | 59.9124/10.7608/210 | 59.9124/10.7608/210 | street_midpoint | semantic_anchor | nei | Lineær gate på Grønland. Hovedpunktet er satt midt på strekningen; gata bør få ruteankre ved senere manuell kartrunde. |
| storgata | Storgata | semantic_anchor_changed | 59.9153/10.7521/230 | 59.9153/10.7521/230 (+2 anchors) | street_midpoint | semantic_anchor | ja | Lineær gate mellom Kirkeristen og Nybrua. Hovedpunktet er satt midt på gata; semantiske ruteankre markerer begge ender for kartvisning. |
| ullevål_hageby | Ullevål Hageby | semantic_anchor_unchanged | 59.9369/10.7317/240 | 59.9369/10.7317/240 | district_anchor | semantic_anchor | nei | Hageby/boligområde. Punktet er et bevisst områdeanker, ikke én adresse. |
| romsaås | Romsås | semantic_anchor_unchanged | 59.9626/10.8842/300 | 59.9626/10.8842/300 | district_anchor | semantic_anchor | nei | Drabantby/bydelsområde. Punktet er et bevisst områdeanker; radius dekker området. |
| rodelokka | Rodeløkka | semantic_anchor_unchanged | 59.9272/10.7704/220 | 59.9272/10.7704/220 | district_anchor | semantic_anchor | nei | Boligområde (Rodeløkka). Punktet er et bevisst områdeanker, ikke én adresse. |
| vaalerenga | Vålerenga | semantic_anchor_unchanged | 59.9079/10.7891/240 | 59.9079/10.7891/240 | district_anchor | semantic_anchor | nei | Bydelsområde (Vålerenga). Punktet er et bevisst områdeanker, ikke én adresse. |
| vinderen | Vinderen | semantic_anchor_unchanged | 59.9471/10.7086/260 | 59.9471/10.7086/260 | district_anchor | semantic_anchor | nei | Bydelsområde (Vinderen). Punktet er et bevisst områdeanker, ikke én adresse. |
| ullern | Ullern | semantic_anchor_unchanged | 59.9216/10.6647/280 | 59.9216/10.6647/280 | district_anchor | semantic_anchor | nei | Bydelsområde (Ullern). Punktet er et bevisst områdeanker, ikke én adresse. |
| spikersuppa | Spikersuppa | semantic_anchor_unchanged | 59.9139/10.7391/160 | 59.9139/10.7391/160 | square_center | semantic_anchor | nei | Avlangt park-/fontenerom (Studenterlunden) mellom Stortinget og Nationaltheatret. Punktet er et bevisst anker midt i anlegget. |
| bankplassen | Bankplassen | needs_review | 59.9077/10.7419/150 | 59.9077/10.7419/150 | square_center | needs_review | nei | Konkret plass i Kvadraturen. Punktet ser rimelig ut; eksakt plassenter bør stadfestes mot kart. |
| christiania_torv | Christiania Torv | needs_review | 59.9074/10.741/150 | 59.9077/10.7414/150 | square_center | needs_review | ja | Historisk plass i Kvadraturen. Forbedret til 4 desimaler; eksakt plassenter bør stadfestes mot kart. |
| slottsparken | Slottsparken | semantic_anchor_unchanged | 59.9166/10.7278/250 | 59.9166/10.7278/250 | park_anchor | semantic_anchor | nei | Stor bypark rundt Slottet. Punktet er et bevisst parkanker; park bør ikke behandles som ett presist punkt. |
| botsparken | Botsparken | semantic_anchor_changed | 59.9053/10.769/170 | 59.9052/10.7685/170 | park_anchor | semantic_anchor | ja | Park ved Grønland/Botsfengselet. Forbedret til 4 desimaler; bevisst parkanker. |
| stensparken | Stensparken | semantic_anchor_unchanged | 59.9268/10.7406/200 | 59.9268/10.7406/200 | park_anchor | semantic_anchor | nei | Bypark (Stensparken). Punktet er et bevisst parkanker; park bør ikke behandles som ett presist punkt. |
| nydalen | Nydalen | semantic_anchor_unchanged | 59.9497/10.7675/260 | 59.9497/10.7675/260 | district_anchor | semantic_anchor | nei | Nærings- og boligområde (Nydalen). Punktet er et bevisst områdeanker, ikke én adresse. |
| tjuvholmen | Tjuvholmen | semantic_anchor_changed | 59.9075/10.72/200 | 59.9069/10.7215/200 | area_anchor | semantic_anchor | ja | Utstrakt brygge-/boligområde (Tjuvholmen). Forbedret presisjon; bevisst områdeanker, ikke én adresse. |
| sorenga | Sørenga | semantic_anchor_unchanged | 59.9029/10.7586/200 | 59.9029/10.7586/200 | area_anchor | semantic_anchor | nei | Utstrakt sjøfront-/boligområde (Sørenga). Punktet er et bevisst områdeanker, ikke én adresse. |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | needs_review | 59.9293/10.7146/170 | 59.9293/10.7146/170 | transit_anchor | needs_review | nei | T-banestasjon ved Majorstukrysset. Deler omtrent punkt med majorstuen_krysset (stasjonen ligger ved krysset) – forventet overlapp. Eksakt stasjonspunkt bør stadfestes mot kart. |
| nationaltheatret_stasjon | Nationaltheatret stasjon | needs_review | 59.9145/10.7319/170 | 59.9145/10.7319/170 | transit_anchor | needs_review | nei | Stasjon ved Nationaltheatret. Punktet ser rimelig ut; eksakt stasjonspunkt bør stadfestes mot kart. |
| bislett | Bislett | needs_review | 59.925/10.7328/200 | 59.9254/10.7332/200 | sports_area_anchor | needs_review | ja | Bislett stadion. Forbedret til 4 desimaler; eksakt anleggspunkt bør stadfestes mot kart. |
| olaf_ryes_plass | Olaf Ryes plass | needs_review | 59.9238/10.7589/170 | 59.9238/10.7589/170 | square_center | needs_review | nei | Plass/park på Grünerløkka. Punktet ser rimelig ut; eksakt plassenter bør stadfestes mot kart. |
| birkelunden | Birkelunden | semantic_anchor_unchanged | 59.9256/10.7574/190 | 59.9256/10.7574/190 | park_anchor | semantic_anchor | nei | Park/plass på Grünerløkka. Punktet er et bevisst parkanker for kartvisning. |
| akerselva | Akerselva | semantic_anchor_changed | 59.9225/10.7572/420 | 59.9225/10.7572/420 (+3 anchors) | river_anchor | semantic_anchor | ja | Elv gjennom byen fra Maridalsvannet til Bjørvika. Hovedpunktet er et bevisst elveanker ved Grünerløkka-strekningen; semantiske ruteankre markerer øvre, midtre og nedre del. |
| universitetsplassen | Universitetsplassen | needs_review | 59.915/10.7397/150 | 59.915/10.7397/150 | square_center | needs_review | nei | Plassen foran det gamle universitetet ved Karl Johans gate. Lav presisjon i oppgitt punkt; eksakt plassenter bør stadfestes mot kart. |
| operahuset | Operahuset | needs_review | 59.9074/10.753/190 | 59.9075/10.7533/190 | building_center | needs_review | ja | Operahuset i Bjørvika. Forbedret til 4 desimaler mot kjent landemerkeplassering; bør stadfestes mot offisiell kilde. |
| deichman_bjorvika | Deichman Bjørvika | needs_review | 59.9078/10.7546/180 | 59.9078/10.7546/180 | building_center | needs_review | nei | Deichman bibliotek i Bjørvika. Punktet ser rimelig ut; eksakt byggpunkt bør stadfestes mot kart. |
| barcode | Barcode | semantic_anchor_changed | 59.91/10.7594/210 | 59.9086/10.7588/210 | area_anchor | semantic_anchor | ja | Rekke med høyhus langs Dronning Eufemias gate. Ett punkt dekker ikke rekka; forbedret til et bevisst områdeanker midt i Barcode. |
| vigelandsparken | Vigelandsparken | semantic_anchor_changed | 59.927/10.7005/260 | 59.9269/10.7003/260 | park_anchor | semantic_anchor | ja | Skulpturpark i Frognerparken. Punktet er et bevisst parkanker nær Monolitten; park bør ikke behandles som ett presist punkt. |
| voienvolden | Voienvolden | needs_review | 59.926/10.7435/170 | 59.926/10.7435/170 | building_center | needs_review | nei | Vøienvolden gård ved Akerselva. Lav presisjon i oppgitt punkt; eksakt byggpunkt bør stadfestes mot kart. |
| carl_berner_plass | Carl Berners plass | needs_review | 59.9282/10.7819/180 | 59.9282/10.7819/180 | square_center | needs_review | nei | Stort kryss/plass (Carl Berners plass). Punktet ser rimelig ut; eksakt plassenter bør stadfestes mot kart. |
| tullin | Tullin | semantic_anchor_unchanged | 59.916519/10.73645/350 | 59.916519/10.73645/350 | area_anchor | semantic_anchor | nei | Tullinløkka-området. Punktet er et bevisst områdeanker; radius dekker området rundt løkka. |
| okern | Økern | semantic_anchor_unchanged | 59.930161/10.808531/450 | 59.930161/10.808531/450 | district_anchor | semantic_anchor | nei | Bydels-/næringsområde (Økern). Punktet er et bevisst områdeanker, ikke én adresse. |
| skoyen | Skøyen | semantic_anchor_unchanged | 59.922086/10.683861/450 | 59.922086/10.683861/450 | district_anchor | semantic_anchor | nei | Bydels-/næringsområde (Skøyen). Punktet er et bevisst områdeanker, ikke én adresse. |
| torshov | Torshov | semantic_anchor_unchanged | 59.933611/10.764167/450 | 59.933611/10.764167/450 | district_anchor | semantic_anchor | nei | Bydelsområde (Torshov). Punktet er et bevisst områdeanker, ikke én adresse. |
| grorud | Grorud | semantic_anchor_unchanged | 59.9575/10.880833/600 | 59.9575/10.880833/600 | district_anchor | semantic_anchor | nei | Drabantby/bydelsområde (Grorud). Bevisst områdeanker; stor radius (600 m) dekker bevisst et utstrakt område, ikke ett presist punkt. |
| sagene | Sagene | semantic_anchor_unchanged | 59.937222/10.756111/550 | 59.937222/10.756111/550 | district_anchor | semantic_anchor | nei | Bydelsområde (Sagene). Bevisst områdeanker; stor radius (550 m) dekker bevisst et utstrakt område, ikke ett presist punkt. |

## Steder som trenger senere manuell kartkontroll

Alle `needs_review`-steder bør stadfestes mot kart i en senere runde. Spesielt prioritert:

- **`kampen_kirke`** – oppgitt punkt (lat ~59.9167) ser ut til å ligge for langt nord for Kampen-høyden; kirken ligger trolig nærmere ~59.912. Ikke flyttet (ikke gjettet), men flagget for kartkontroll.
- **`oslo_s`, `tigeren`, `jernbanetorget`** – lå tidligere på nøyaktig samme punkt (59.9111/10.7528). Skilt fra hverandre etter beste kjennskap (stasjonsbygg vs. tigerstatue vs. torg), men eksakte punkter bør stadfestes.
- **`oslo_bussterminal`, `universitetsplassen`, `voienvolden`** – lav presisjon beholdt bevisst (ikke padd med falske desimaler); trenger eksakt punkt fra kart.
- **`ring_3`, `trikk_17_18`, `gronlandsleiret`** – lineære/utstrakte steder uten anchors ennå; bør få ruteankre ved senere kartrunde. (`ring_3`/`trikk_17_18` beholder bevisst lav presisjon som symbolske ankerpunkter.)
- Øvrige `needs_review`: gronland_basarene, radhusplassen, grunerlokka_helgesens_tm, toyen_torg, majorstuen_krysset, vulkan_energisentral, gronland_kirke, bankplassen, christiania_torv, majorstuen_tbanestasjon, nationaltheatret_stasjon, bislett, olaf_ryes_plass, operahuset, deichman_bjorvika, carl_berner_plass.

## Heuristikk-artefakt (ikke en reell feil)

- `christiania_torv` flagges fortsatt som «lineært sted uten anchors». Dette er en falsk positiv i gate-heuristikken: regexet `/sti/` treffer bokstavene «sti» inne i «Chri**sti**ania». Stedet er en konkret plass, ikke lineært. Ingen datafiks gjort (kan ikke endre navn).

## Bekreftelser

- Ingen andre place-filer er endret. Kun `data/places/by/oslo/places_by.json` (kilde) og `data/places/places_index.json` (regenerert via `npm run places:index:build`).
- Ingen UI/kartkode, Leaflet/MapLibre, PlaceCard, Nearby, unlock/profil/quiz/Civication er rørt.
- Sport/Lisboa-filer er ikke rørt; Blå-konflikten (`blaa`/`bla`) er ikke behandlet i denne batchen.
- `places_index.json` er kun regenerert av build-verktøyet, ikke håndrettet.
- Verifisert pipeline: `places:coords:check` (0 harde feil), `places:index:check` (i synk), `health:places` (Errors: 0).
