# Synlig kartmarkør-fiks – oppfølging 02: `data/places/by/oslo/places_by.json`

Generert: 2026-06-15. Arbeidsbranch: `claude/oslo-visual-marker-followup-02-flyutt`.

## Bakgrunn

Dette er en **oppfølging etter PR #1343** (commit `f576742`, "Fix visible map markers
for by/oslo street and downtown places"). PR #1343 rettet flere synlige hovedmarkører
(Torggata, Storgata, Karl Johan, Bogstadveien, Grønlandsleiret, Barcode, Tjuvholmen,
Tøyen torg og Botsparken).

Brukeren melder at flere bysteder **fortsatt** ligger feil visuelt på kartet, **spesielt
Markveien**. Denne runden er derfor en ny **visuell** markørpassering basert på faktisk
kartplassering – ikke auditrapport, ikke gammel `coordNote`, og ikke anchors som
erstatning for `lat/lon`.

## Bekreftelse på markørmodell

Kontrollert i `js/map.js` (`drawPlaceMarkers`, linje 608–638): hver synlig markør bygges
som `geometry: { type:"Point", coordinates:[lon, lat] }` direkte fra `p.lat`/`p.lon`.
Feltet `anchors` leses **ikke** av markørkoden – det er ren støttemetadata. Konklusjon
uendret fra forrige runde: hvis `lat/lon` er feil, hjelper ikke ankrene.

## Metode og ærlighet om kontroll

- **Markveien er kartkontrollert på nytt** – forrige rapport (pass 01) er **ikke** godtatt
  alene. Den hevdet markøren allerede lå riktig ("nei, beholdt"). Uavhengig kartoppslag
  motbeviser dette: se egen Markveien-seksjon.
- **Kilder:** websøk mot autoritative/refererte koordinater (OSM-/Wikidata-treff i
  søketreff, visitlokka.no, lokalhistoriewiki, kart.1881.no) + manuell kryssjekk mot
  allerede verifiserte nabolandemerker (`olaf_ryes_plass` 59.9231/10.7589 verifisert,
  `birkelunden` 59.927/10.7601, `majorstuen_tbanestasjon` 59.9297/10.7147 verifisert,
  `oslo_s`/`jernbanetorget` verifisert).
- **Verktøybegrensning (uendret):** direkte `fetch`/Nominatim/Wikidata/Wikipedia ga HTTP
  403 i miljøet. Punktkontroll er derfor gjort via websøk + manuell vurdering mot kjent
  gategeometri.
- **Streng regel fulgt:** der ekte kartkontroll ikke ga et sikkert nok presist punkt, er
  stedet **ikke flyttet** og beholdt som `needs_review`/`semantic_anchor`. Ingen gjetting,
  ingen falsk presisjon, ingen geocoding som fasit uten vurdering.

## Oppsummering

- **Antall steder visuelt vurdert:** 27 (hele prioritetslisten)
- **Antall hovedmarkører endret (lat/lon flyttet):** 1 (`markveien`)
- **Antall beholdt:** 26
- **Anchors justert:** 1 nordlig ruteanker på `markveien` (lå for langt øst).

Koordinat-quality-gate: **0 harde feil** (grønn). `places:index:check`: i synk.
`health:places`: `Errors: 2`, men begge er **forhåndseksisterende duplikat-id-er** i
`data/places/historie/akershus/places_historie_akershus_batch1.json`
(`eidsvollsbygningen`, `oscarsborg_festning`) – helt urelatert til denne filen og ikke
introdusert her. Resten er forhåndseksisterende bilde-varsler.

## Per vurdert sted

| id | name | gammel lat/lon/r | ny lat/lon/r | endret? | vurdering | kilde/metode | coordStatus |
|---|---|---|---|---|---|---|---|
| markveien | Markveien | 59.9235/10.7584/210 | 59.9234/10.7573/210 | **ja** | Lå ~60 m for langt **øst**, oppå Olaf Ryes plass / Thorvald Meyers gate (feil gate/plass). Flyttet vest inn på selve Markveien-gateløpet ved kafé-/handelsstrekningen. | Gatesentroide via websøk (visitlokka/OSM-treff, ~59.9234/10.7573) + kryssjekk mot verifisert Olaf Ryes plass | semantic_anchor |
| grunerlokka_helgesens_tm | Grünerløkka – Helgesens / Thorvald Meyers | 59.9237/10.7576/220 | 59.9237/10.7576/220 | nei | Generisk gatekrysspunkt i Grünerløkka-kjernen. Krysset Helgesens gate × Thorvald Meyers gate ligger noe lenger øst (~10.7589), men autoritativ koordinat for selve krysset ble ikke kildebelagt. Ikke flyttet (no-guessing). | Websøk (DigitaltMuseum bekrefter krysset finnes; lokalhistoriewiki 403) | needs_review |
| vulkan_energisentral | Vulkan energisentral | 59.9233/10.7518/140 | 59.9233/10.7518/140 | nei | Ligger ved Mathallen/Vulkan 5 på Akerselva (bekreftet område). Presist byggpunkt for energisentralen mangler fortsatt autoritativ node. | Websøk (Vulkan 5 / Mathallen) | needs_review |
| gronland_basarene | Grønland basarene | 59.9125/10.765/150 | 59.9125/10.765/150 | nei | På selve basarbygget (Tøyengata 2–6, ved Grønlandsleiret); allerede nudget i PR #1343. Visuelt riktig nok. | Websøk (adresse Tøyengata 2–6) | needs_review |
| toyen_torg | Tøyen torg | 59.9153/10.7756/160 | 59.9153/10.7756/160 | nei | I torgrommet ved Tøyensenteret, NV for Tøyen T-bane (59.9150/10.7761). Allerede nudget i PR #1343. Visuelt riktig nok. | Kryssref Tøyen T-bane | needs_review |
| tigeren | Tigerstatuen | 59.9113/10.7514/120 | 59.9113/10.7514/120 | nei | På forplassen til Oslo S ut mot Jernbanetorget der statuen står. Område stadfestet via verifisert `oslo_s`/`jernbanetorget`. Riktig nok visuelt. | Websøk + verifiserte nabolandemerker | needs_review |
| majorstuen_krysset | Majorstuen krysset | 59.9295/10.7146/200 | 59.9295/10.7146/200 | nei | Ved Majorstukrysset, inntil verifisert Majorstuen T-bane (59.9297/10.7147). Kryssenter flytende av natur, men visuelt riktig. | Kryssref verifisert stasjon | needs_review |
| majorstuen_tbanestasjon | Majorstuen T-banestasjon | 59.9297/10.7147/170 | 59.9297/10.7147/170 | nei | Verifisert mot Wikidata i tidligere pass. | Wikidata (tidl.) | verified |
| nationaltheatret_stasjon | Nationaltheatret stasjon | 59.9147/10.7318/170 | 59.9147/10.7318/170 | nei | Verifisert sentralt i stasjonsanlegget. | Wikipedia (tidl.) | verified |
| carl_berner_plass | Carl Berners plass | 59.9256/10.7779/180 | 59.9256/10.7779/180 | nei | Verifisert mot Wikidata i tidligere pass; ligger i selve plassrommet. | Wikidata (tidl.) | verified |
| olaf_ryes_plass | Olaf Ryes plass | 59.9231/10.7589/170 | 59.9231/10.7589/170 | nei | Verifisert mot Wikidata (plass/park på Grünerløkka). Brukt som kontrollpunkt for Markveien. | Wikidata (tidl.) | verified |
| birkelunden | Birkelunden | 59.927/10.7601/190 | 59.927/10.7601/190 | nei | I faktisk park ved Paulus kirke (korrigert mot OSM i tidl. pass). Riktig parkrom. | OSM (tidl.) | semantic_anchor |
| stensparken | Stensparken | 59.9272/10.733/200 | 59.9272/10.733/200 | nei | I faktisk park (Fagerborg), korrigert ~470 m vest i tidl. pass. | Wikidata/OSM (tidl.) | semantic_anchor |
| slottsparken | Slottsparken | 59.9166/10.7278/250 | 59.9166/10.7278/250 | nei | Bevisst områdeanker i søndre del nær Slottet, innenfor parken. | Wikidata (tidl.) | semantic_anchor |
| vigelandsparken | Vigelandsparken | 59.9269/10.7003/260 | 59.9269/10.7003/260 | nei | Sentralt parkanker nær Monolitten/fontenen; treffer Frognerparken/Vigelandsanlegget. | OSM (tidl.) | semantic_anchor |
| aker_brygge | Aker Brygge | 59.9097/10.7256/180 | 59.9097/10.7256/180 | nei | Bevisst områdeanker midt i brygge-/havneområdet. Visuelt riktig. | Manuell kartvurdering | semantic_anchor |
| sorenga | Sørenga | 59.9029/10.7586/200 | 59.9029/10.7586/200 | nei | Bevisst områdeanker på sjøfronten Sørenga. Visuelt riktig. | Manuell kartvurdering | semantic_anchor |
| bjorvika | Bjørvika | 59.9075/10.7531/220 | 59.9075/10.7531/220 | nei | Bevisst områdeanker sentralt i Bjørvika. Visuelt riktig. | Manuell kartvurdering | semantic_anchor |
| bispelokket | Bispelokket / Trafikkmaskinen | 59.9078/10.7538/220 | 59.9078/10.7538/220 | nei | Områdeanker for den revne trafikkmaskinen i Bjørvika (ingen bygning står her i dag). Riktig nok. | Manuell kartvurdering | semantic_anchor |
| spikersuppa | Spikersuppa | 59.9139/10.7391/160 | 59.9139/10.7391/160 | nei | Midt i Studenterlunden mellom Stortinget og Nationaltheatret. Riktig anlegg. | Manuell kartvurdering | semantic_anchor |
| helsfyr | Helsfyr | 59.9128/10.8008/200 | 59.9128/10.8008/200 | nei | Anker på Helsfyr T-banestasjon (verifisert tidl.); riktig delområde. | Wikipedia (tidl.) | semantic_anchor |
| nydalen | Nydalen | 59.9497/10.7675/260 | 59.9497/10.7675/260 | nei | Områdeanker i Nydalen nærings-/boligområde. Visuelt riktig. | Manuell kartvurdering | semantic_anchor |
| okern | Økern | 59.930161/10.808531/450 | 59.930161/10.808531/450 | nei | Bydels-/næringsanker på Økern. Stor radius dekker området. Riktig. | Manuell kartvurdering | semantic_anchor |
| skoyen | Skøyen | 59.922086/10.683861/450 | 59.922086/10.683861/450 | nei | Bydels-/næringsanker på Skøyen. Innenfor området. Riktig nok. | Manuell kartvurdering | semantic_anchor |
| torshov | Torshov | 59.933611/10.764167/450 | 59.933611/10.764167/450 | nei | Bydelsanker på Torshov. Riktig område. | Manuell kartvurdering | semantic_anchor |
| sagene | Sagene | 59.937222/10.756111/550 | 59.937222/10.756111/550 | nei | Bydelsanker; stor radius dekker bevisst området. Riktig. | Manuell kartvurdering | semantic_anchor |
| grorud | Grorud | 59.9575/10.880833/600 | 59.9575/10.880833/600 | nei | Drabantby-/bydelsanker; stor radius dekker bevisst området. Riktig. | Manuell kartvurdering | semantic_anchor |

## Antall

- **Visuelt vurdert:** 27
- **Hovedmarkører endret:** 1 (`markveien`)
- **Beholdt:** 26

## Steder som fortsatt trenger manuell kontroll

Disse beholdes som `needs_review` fordi et autoritativt presist punkt ikke kunne
kildebelegges i miljøet (direkte oppslag mot Wikidata `P625`/OSM-node blokkert). De er
**ikke** grovt feilplassert, men mangler endelig stadfesting:

- **`grunerlokka_helgesens_tm`** – generisk Grünerløkka-krysspunkt; det navngitte krysset
  (Helgesens gate × Thorvald Meyers gate) ligger trolig noe lenger øst (~10.7589), men
  uten autoritativ koordinat er punktet ikke flyttet.
- **`vulkan_energisentral`** – tilhørighet til Vulkan/Mathallen bekreftet; presist byggpunkt mangler.
- **`gronland_basarene`** – adresse (Tøyengata 2–6) bekreftet; presist byggsenter mangler.
- **`toyen_torg`** – torgrommet stadfestet; autoritativt torgsenter mangler.
- **`tigeren`** – forplass ved Oslo S stadfestet; autoritativ node for selve statuen mangler.
- **`majorstuen_krysset`** – stadfestet via stasjon; kryssenter flytende.

## Markveien (egen seksjon)

**Hvor den lå:** `59.9235 / 10.7584`, r 210. Forrige rapport (pass 01) hevdet dette var
riktig ("lå allerede på riktig Grünerløkka-strekning ved Olaf Ryes plass").

**Hvorfor den var feil:** Markveien går nord–sør på Grünerløkka **vest for** Thorvald
Meyers gate, nærmere Akerselva. Uavhengig kartkontroll gir gatesentroide ca.
`59.9234 / 10.7573`. Det gamle punktet (`10.7584`) lå ca. **60 m øst** for selve
gateløpet – i praksis oppå **Olaf Ryes plass** (verifisert til `10.7589`) og inntil
**Thorvald Meyers gate**. Det vil si: den synlige markøren pekte på **feil plass og feil
gate**, akkurat slik brukeren rapporterte. At forrige rapport brukte nettopp Olaf Ryes
plass som "bevis" på at punktet var riktig, bekrefter feilen – de to er ikke samme sted.

**Hvor den ble flyttet:** Til `59.9234 / 10.7573` (r 210 beholdt). Punktet ligger nå på
selve Markveien-gateløpet, på den kafé-/handelsstrekningen som best representerer gaten
som bysted (byliv/handel/kafé på høyde med Olaf Ryes plass-kvartalet), tydelig vest for
Thorvald Meyers gate og på riktig side av området mot Akerselva.

**Anchors:** Søndre ruteanker `markveien_sor_nybrua` (59.9205/10.7566) beholdt – ligger
allerede vest, mot Nybrua. Nordre ruteanker `markveien_nord` lå på `10.76`, som er for
langt øst (mot Thorvald Meyers gate / Birkelunden); justert til `59.9266/10.7585` slik at
det følger Markveien-løpet i nord. Ankrene er kun støttemetadata og endrer **ikke** den
synlige markøren – hovedfiksen er `lat/lon`.

## Note om generert indeks

`data/places/places_index.json` er **kun regenerert** via `npm run places:index:build`
(aldri håndrettet). Utover Markveiens nye `lat/lon` tok regenereringen også med flere
**Akershus-historie-steder fra batch 5** som allerede lå i kildefilene (commitene
"Add/Register Akershus history places batch 5", før denne branchen) men ikke var indeksert.
Dette er forventet generert output som bringer indeksen i synk – ingen manuell redigering
og ingen koordinatendring utenfor `markveien`.

## Bekreftelser

- **Ingen andre place-filer er endret.** Kun `data/places/by/oslo/places_by.json` (kilde)
  og `data/places/places_index.json` (regenerert via build-script).
- Ingen UI/kartkode, Leaflet/MapLibre, PlaceCard, Nearby, unlock/profil/quiz/Civication er rørt.
- Sport-/Lisboa-filer er ikke rørt; Blå-konflikten (`blaa`/`bla`) er ikke behandlet.
- Ingen `desc`, `popupDesc`, `quiz_profile`, `emne_ids`, `rounds`, `images`, `category`,
  `id` eller `name` er endret. Kun koordinatfelt (`lat`, `lon`, `coordNote`) + anchors på
  `markveien`.
- `anchors` er ikke brukt som erstatning for korrekt `lat/lon`; den synlige hovedmarkøren
  er rettet direkte.
- Verifisert pipeline: `places:coords:check` (0 harde feil), `places:index:build` +
  `places:index:check` (i synk), `health:places` (kun forhåndseksisterende, urelaterte
  duplikat-id-errors og bilde-varsler).
