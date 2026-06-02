# Batch 50: by/oslo asset generation prompts

Dato: 2026-06-02

## Formål

Dette er en plan-/promptbatch for de 20 topp-prioriterte `by/oslo`-assetene fra Batch 49. Batchen lager genereringsstrategi og en strukturert produksjonskø for ordinære `image`-assets og dedikerte `cardImage`-assets. Den lager ikke bildefiler og endrer ikke place-data, indeks, scripts/tools, UI eller eksisterende assets.

## Kommandoer kjørt

```bash
npm run health:places
npm run places:emner:check
npm run places:index:check
```

## Baseline etter Batch 49

| Kontrollpunkt | Resultat |
| --- | ---: |
| `health:places` Files checked | 40 |
| `health:places` Places checked | 459 |
| `health:places` Hidden places | 0 |
| `health:places` Stub places | 0 |
| `health:places` Canonical emne files checked | 16 |
| `health:places` emne_ids checked | 1032 |
| `health:places` Canonical emne_ids | 1032 |
| `health:places` Unknown emne_ids | 0 |
| `health:places` Wrong-prefix emne_ids | 0 |
| `health:places` Allowlisted cross-disciplinary emne_ids | 187 |
| `health:places` Errors | 0 |
| `health:places` Warnings | 1085 |
| `places:emner:check` | OK; Missing emne_ids 0; duplicate place ids 0 |
| `places:index:check` | OK; `places_index.json` is in sync |

## Policybekreftelse

- `bilder/QuizCards/**` skal bare brukes som quizkort / flip-support.
- `bilder/QuizCards/**` skal ikke brukes i place JSON-feltene `image`, `cardImage` eller `frontImage`.
- `image` skal bruke canonical place assets under `bilder/places/**`.
- `cardImage` skal bruke dedikerte card assets under `bilder/kort/places/**`.
- `frontImage` skal bare brukes der dedikert front-asset finnes; denne batchen lager ikke frontside-/quizkort.
- `ImageCard` er ikke i bruk og skal ikke innføres, repareres eller bygges videre på.
- Ikke opprett eller bruk `imageCard`.
- Ikke bruk samme asset som `image` og `cardImage` uten eksplisitt senere beslutning.

## Leste kilder og referansemapper

- `reports/oslo-place-audit-batch-49-by-oslo-dedicated-asset-production-queue.md`
- `reports/oslo-place-audit-batch-48-quizcards-image-policy.md`
- `reports/oslo-place-audit-batch-47-by-oslo-asset-path-fixes.md`
- `reports/oslo-place-audit-batch-46-asset-warning-path-audit.md`
- `data/places/by/oslo/places_by.json`
- `js/ui/place-card.js`
- `bilder/places/**`
- `bilder/kort/places/**`
- `bilder/QuizCards/** kun som negativ referanse`

## De 20 prioriterte assetene

| # | place_id | place_name | field | target_path | asset_type |
| ---: | --- | --- | --- | --- | --- |
| 1 | `torggata` | Torggata | `cardImage` | `bilder/kort/places/by/torggata_CardImage.PNG` | `dedicated_card_image` |
| 2 | `barcode` | Barcode | `image` | `bilder/places/barcode.PNG` | `ordinary_place_image` |
| 3 | `barcode` | Barcode | `cardImage` | `bilder/kort/places/barcode.PNG` | `dedicated_card_image` |
| 4 | `bogstadveien` | Bogstadveien | `image` | `bilder/places/bogstadveien.JPG` | `ordinary_place_image` |
| 5 | `bogstadveien` | Bogstadveien | `cardImage` | `bilder/kort/places/bogstadveien.PNG` | `dedicated_card_image` |
| 6 | `bispelokket` | Bispelokket / Trafikkmaskinen | `image` | `bilder/places/bispelokket_IMG.JPG` | `ordinary_place_image` |
| 7 | `bispelokket` | Bispelokket / Trafikkmaskinen | `cardImage` | `bilder/kort/places/by/bispelokket_CardImage.PNG` | `dedicated_card_image` |
| 8 | `oslo_s` | Oslo S | `image` | `bilder/places/oslo_s.JPG` | `ordinary_place_image` |
| 9 | `oslo_s` | Oslo S | `cardImage` | `bilder/kort/places/oslo_s.PNG` | `dedicated_card_image` |
| 10 | `jernbanetorget` | Jernbanetorget | `image` | `bilder/places/jernbanetorget.JPG` | `ordinary_place_image` |
| 11 | `jernbanetorget` | Jernbanetorget | `cardImage` | `bilder/kort/places/jernbanetorget.PNG` | `dedicated_card_image` |
| 12 | `karl_johan` | Karl Johans gate | `cardImage` | `bilder/kort/places/karl_johan.PNG` | `dedicated_card_image` |
| 13 | `bjorvika` | Bjørvika | `image` | `bilder/places/bjorvika.JPG` | `ordinary_place_image` |
| 14 | `bjorvika` | Bjørvika | `cardImage` | `bilder/kort/places/bjorvika.PNG` | `dedicated_card_image` |
| 15 | `aker_brygge` | Aker Brygge | `image` | `bilder/places/by/oslo/aker_brygge.JPG` | `ordinary_place_image` |
| 16 | `aker_brygge` | Aker Brygge | `cardImage` | `bilder/kort/places/by/oslo/aker_brygge.PNG` | `dedicated_card_image` |
| 17 | `gronland_basarene` | Grønland basarene | `cardImage` | `bilder/kort/places/gronland_basarene.PNG` | `dedicated_card_image` |
| 18 | `radhusplassen` | Rådhusplassen | `image` | `bilder/places/radhusplassen.JPG` | `ordinary_place_image` |
| 19 | `radhusplassen` | Rådhusplassen | `cardImage` | `bilder/kort/places/radhusplassen.PNG` | `dedicated_card_image` |
| 20 | `operahuset` | Operahuset | `image` | `bilder/places/operahuset.PNG` | `ordinary_place_image` |

## Promptstrategi

- Hver prompt bygger på place-objektets `name`, `desc`, `popupDesc`, `quiz_profile`, `category` og `emne_ids`, kombinert med motivføringene fra Batch 49.
- `image`-assets spesifiseres som ordinære canonical place images under `bilder/places/**`, i bredt landskapsformat, minimum 1600x1000 eller tilsvarende.
- `cardImage`-assets spesifiseres som dedikerte kortbilder under `bilder/kort/places/**`, i bredt landskap/2:1-vennlig format, minimum 1600x800.
- Promptene ber om realistisk eller dokumentarisk stedsgjengivelse i norsk bymiljø med naturlig lys og tydelig stedskarakter.
- Alle prompts forbyr tekst, labels, logo-fokus, quiz card layout, ramme, typografi, illustrasjonsstil, fantasy, tegneserie og plakatestetikk.
- Ingen prompt ber om History Go-kortflate, quizspørsmål, frontside/quizkort eller gjenbruk av `bilder/QuizCards/**`.
- Bispelokket behandles eksplisitt som dokumentarisk historisk visualisering fordi anlegget er revet, ikke som moderne faktisk nåsituasjon.

## Asset-spesifikasjoner og prompts

### 1. `torggata.cardImage` — Torggata

- Target-path: `bilder/kort/places/by/torggata_CardImage.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: Torggata som urban gateakse med handel, servering, syklister og fotgjengere
- Must show: urban gate axis, active storefronts/cafes without readable signs, sidewalks, cyclists, pedestrians, central Oslo street character
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic anonymous street, readable signs as main subject, quiz-card look
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; bygger på transformert sentrumsgate/gentrifisering og styrt byliv

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Torggata i Oslo som en urban gateakse med handel, servering, syklister og fotgjengere. Vis sentrumsgatepreg, oppgradert gateprofil, fortausliv og spenningen mellom råere fortid og kuratert nåtid uten å gjøre skilttekst lesbar. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Torggata in Oslo as an urban street axis with commerce, cafes, cyclists, and pedestrians. Show a central Oslo street character, upgraded street profile, sidewalk life, and the tension between a rougher past and a curated present without readable signage. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 2. `barcode.image` — Barcode

- Target-path: `bilder/places/barcode.PNG`
- Asset-type: `ordinary_place_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Barcode-rekken i Bjørvika som moderne byutvikling og høyhusrekke
- Must show: distinct row of narrow high-rises, Bjørvika context, modern skyline, controlled spacing and scale
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic high-rise district, QuizCards, unrelated Oslo landmarks dominating
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; viser romlig orden, eiendomsutvikling og skala/gateplan-konflikt

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Barcode-rekken i Bjørvika som moderne byutvikling og markant høyhusrekke. Vis rekkelogikken som gir strekkodepreg, moderne næringsbygg, skyline og byrom ved gateplan. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of the Barcode row in Bjørvika as modern urban development and a distinctive high-rise sequence. Show the barcode-like row logic, modern office architecture, skyline, and street-level urban space. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 3. `barcode.cardImage` — Barcode

- Target-path: `bilder/kort/places/barcode.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig bredt bilde av Barcode som skyline/arkitekturrekke
- Must show: clear skyline/row of Barcode buildings, strong horizontal composition, Bjørvika modern city feel
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic skyscrapers, cropped-away row, QuizCards
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; bred komposisjon prioriterer rekken og arkitekturen

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Barcode i Bjørvika i et bredt kortvennlig utsnitt med tydelig skyline og arkitekturrekke. La høyhusrekken fylle bildet horisontalt med synlig rytme, mellomrom, glassflater og urbant gateplan. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Barcode in Bjørvika in a wide card-friendly composition with a clear skyline and architectural row. Let the high-rise sequence fill the image horizontally with visible rhythm, gaps, glass facades, and urban street level. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 4. `bogstadveien.image` — Bogstadveien

- Target-path: `bilder/places/bogstadveien.JPG`
- Asset-type: `ordinary_place_image`
- Format: `JPG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Bogstadveien som vestkantpreget handlegate med butikker, fortau og byliv
- Must show: shopping street, storefront rhythm without readable text, broad sidewalks, pedestrians, west-side Oslo commercial character
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic shopping street, readable brand/logo focus, empty suburb street
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; bygger på handlegate, vestkantpreg og gateopphold

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Bogstadveien i Oslo som handlegate med butikker, brede fortau, byliv og vestkantpreg. Vis kommersiell gateaktivitet, gående, servering eller butikkfronter uten lesbare logoer, og et tydelig urbant vestkantmiljø. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Bogstadveien in Oslo as a shopping street with storefronts, broad sidewalks, urban life, and a west-side city character. Show commercial street activity, pedestrians, cafes or shopfronts without readable logos, and a distinctly urban west-side Oslo environment. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 5. `bogstadveien.cardImage` — Bogstadveien

- Target-path: `bilder/kort/places/bogstadveien.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig Bogstadveien-handlegate med aktivt fortausliv
- Must show: wide street view, storefronts, pedestrians, cafes, west-side commercial feel
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, quiz card, generic mall street, logo focus
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; bredt gateutsnitt for cardImage

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Bogstadveien i et bredt kortvennlig utsnitt som viser handlegate, fortausliv, butikker og vestkantpreg. Prioriter en horisontal gateakse med mennesker i bevegelse og opphold, men uten lesbar skilttekst eller merkevarefokus. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Bogstadveien in a wide card-friendly view showing a shopping street, sidewalk life, storefronts, and west-side Oslo character. Prioritize a horizontal street-axis composition with people walking and lingering, but without readable signage or brand focus. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 6. `bispelokket.image` — Bispelokket / Trafikkmaskinen

- Target-path: `bilder/places/bispelokket_IMG.JPG`
- Asset-type: `ordinary_place_image`
- Format: `JPG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: dokumentarisk historisk visualisering av Bispelokket som treplans trafikkmaskin i Bjørvika
- Must show: multi-level road interchange, concrete infrastructure, cars, Bjørvika barrier effect, historical Oslo traffic-planning atmosphere
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, modern present-day Bjørvika as if Bispelokket still exists, map, diagram, fantasy reconstruction
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; historisk visualisering fordi anlegget er revet

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Bispelokket som dokumentarisk historisk visualisering av den tidligere treplans trafikkmaskinen i Bjørvika. Vis betongramper, vei-infrastruktur, biltrafikk, støyende barrierepreg og bilbyens planlogikk; dette skal være historisk visualisering, ikke moderne faktisk nåsituasjon, og ikke kart eller diagram. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Bispelokket as a documentary historical visualization of the former three-level road interchange in Bjørvika. Show concrete ramps, road infrastructure, car traffic, a noisy barrier-like presence, and car-oriented planning logic; this must be a historical visualization, not a modern present-day scene, and not a map or diagram. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 7. `bispelokket.cardImage` — Bispelokket / Trafikkmaskinen

- Target-path: `bilder/kort/places/by/bispelokket_CardImage.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig historisk visualisering av Bispelokket/trafikkmaskinen
- Must show: wide multi-level interchange, ramps crossing horizontally, historical documentary atmosphere
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, modern Bjørvika-only scene, map/diagram, quiz-card design
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; historisk visualisering i bredt utsnitt

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Bispelokket i et bredt kortvennlig utsnitt som dokumentarisk historisk visualisering av trafikkmaskinen. Vis treplans veikonstruksjon, ramper, betong, biltrafikk og fysisk barriere mot Bjørvika; ikke fremstille det som dagens situasjon, og ikke lag kart eller diagram. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Bispelokket in a wide card-friendly documentary historical visualization of the road interchange. Show the three-level road structure, ramps, concrete, car traffic, and its physical barrier toward Bjørvika; do not present it as today’s situation, and do not make a map or diagram. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 8. `oslo_s.image` — Oslo S

- Target-path: `bilder/places/oslo_s.JPG`
- Asset-type: `ordinary_place_image`
- Format: `JPG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Oslo S som nasjonalt transportknutepunkt med stasjon, innganger, menneskestrømmer og kollektivtrafikk
- Must show: station entrance/area, crowds, train/tram/bus/taxi context, transition between station and street
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic station, isolated train, logo/sign focus
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; viser mobilitet, venting, bytte og konsum

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Oslo S som hovedknutepunkt med stasjonsområde, inngangssoner, menneskestrømmer og kollektivtrafikk. Vis overgangen mellom stasjon og gate, tog/trikk/buss/taxi-kontekst der mulig, venting og bevegelse i et tett organisert byrom. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Oslo Central Station as Norway’s main transport hub with station areas, entrances, passenger flows, and public transport. Show the transition between station and street, train/tram/bus/taxi context where possible, waiting and movement in a dense organized urban space. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 9. `oslo_s.cardImage` — Oslo S

- Target-path: `bilder/kort/places/oslo_s.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig Oslo S-knutepunkt med flyt av reisende
- Must show: wide station-front composition, people moving and waiting, public transport cues
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic terminal, readable sign text, quiz card
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; bredt utsnitt for knutepunktkarakter

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Oslo S i et bredt kortvennlig utsnitt som viser stasjonen som knutepunkt. Prioriter horisontal komposisjon med stasjonsfront eller inngangsområde, reisende i strømmer, venting og kollektivtrafikkpreg. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Oslo Central Station in a wide card-friendly composition showing the station as a transport hub. Prioritize a horizontal composition with station frontage or entrance area, passenger flows, waiting, and public-transport character. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 10. `jernbanetorget.image` — Jernbanetorget

- Target-path: `bilder/places/jernbanetorget.JPG`
- Asset-type: `ordinary_place_image`
- Format: `JPG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Jernbanetorget som urbant transportknutepunkt foran Oslo S
- Must show: tram/bus/pedestrians, dense central square, relation to station, mobility bottleneck
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic square, empty plaza, logo/sign focus
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; viser forplass, ankomstrom og flaskehals

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Jernbanetorget som tett urbant transportknutepunkt foran Oslo S med trikk, buss og gående. Vis torget som ankomstrom og flaskehals, med kroppslige strømmer, kollektivtrafikk og sentrumsintensitet. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Jernbanetorget as a dense urban transport hub in front of Oslo Central Station with trams, buses, and pedestrians. Show the square as an arrival space and bottleneck, with human flows, public transport, and central-city intensity. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 11. `jernbanetorget.cardImage` — Jernbanetorget

- Target-path: `bilder/kort/places/jernbanetorget.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig Jernbanetorget med trikk/buss/gående i bredt byrom
- Must show: wide urban hub, public transport lines, pedestrians, station-adjacent density
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic transit stop, unreadable place, quiz card
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; bred komposisjon for overgangsrom

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Jernbanetorget i et bredt kortvennlig utsnitt med trikk, buss, gående og tett sentrumsrom. La kollektivtrafikk og menneskestrømmer lese tydelig, med Oslo S-relasjon uten at skilttekst blir hovedmotiv. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Jernbanetorget in a wide card-friendly view with trams, buses, pedestrians, and dense central urban space. Make public transport and human flows clearly readable, with a relationship to Oslo Central Station without making signage the main subject. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 12. `karl_johan.cardImage` — Karl Johans gate

- Target-path: `bilder/kort/places/karl_johan.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: Karl Johans gate som paradeakse og hovedgate med institusjonelt sentrumspreg
- Must show: broad pedestrian street axis, city life, ceremonial/institutional character, perspective toward key civic buildings
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, automatic reuse of frontImage, generic high street, parade text/banners as focus
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert cardImage-spesifikasjon, ikke frontImage/quizkort

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Karl Johans gate som bred paradeakse og hovedgate med byliv og institusjonelt sentrumspreg. Vis gateperspektiv, publikum, historisk hovedstadsakse og representativt byrom uten å bruke eksisterende frontImage som utgangspunkt. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Karl Johans gate as a broad parade axis and main street with urban life and institutional capital-city character. Show street perspective, public life, the historic capital axis, and representative urban space without using an existing frontImage as the basis. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 13. `bjorvika.image` — Bjørvika

- Target-path: `bilder/places/bjorvika.JPG`
- Asset-type: `ordinary_place_image`
- Format: `JPG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Bjørvika som fjordby, transformert havneområde og moderne bylandskap
- Must show: waterfront, promenade, culture buildings, modern development, people using fjord edge
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic waterfront, only Barcode or only Opera dominating, luxury-only lifestyle ad
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; viser havn-til-fjordby transformasjon og offentlig vannkant

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Bjørvika som fjordby og moderne byutviklingsområde med vannkant, kulturbygg, nye byrom og mennesker ved fjorden. Vis transformasjonen fra havn/trafikkareal til promenade, opera-/bibliotek-/kulturpreg og moderne byrom uten å redusere motivet til bare ett nabosted. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Bjørvika as a fjord-city district and modern urban development area with waterfront, cultural buildings, new public spaces, and people by the fjord. Show the transformation from harbor/traffic land to promenade, opera/library/cultural character, and modern urban spaces without reducing the subject to only one neighboring landmark. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 14. `bjorvika.cardImage` — Bjørvika

- Target-path: `bilder/kort/places/bjorvika.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig Bjørvika med fjordkant, kulturbygg og nye byrom
- Must show: wide waterfront composition, promenade, modern buildings, cultural district feel
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, single unrelated landmark, generic marina, quiz card
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; bred fjordby-komposisjon

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Bjørvika i et bredt kortvennlig utsnitt med fjordkant, promenade, kulturbygg og moderne byrom. Prioriter vannkant og offentlig bruk, med moderne byutvikling lesbar i bakgrunnen og uten tekst eller kortlayout. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Bjørvika in a wide card-friendly composition with waterfront, promenade, cultural buildings, and modern public spaces. Prioritize the fjord edge and public use, with modern urban development readable in the background and without text or card layout. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 15. `aker_brygge.image` — Aker Brygge

- Target-path: `bilder/places/by/oslo/aker_brygge.JPG`
- Asset-type: `ordinary_place_image`
- Format: `JPG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Aker Brygge som tidligere verftsområde omformet til fjordpromenade, handel, servering og byliv
- Must show: waterfront promenade, former industrial/verft hints, restaurants, pedestrians, fjord view
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic harbor, luxury ad, readable restaurant logos
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; anbefalt path for nå manglende felt i senere asset/data-batch

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Aker Brygge som tidligere verfts- og industriområde transformert til fjordpromenade med handel, servering og byliv. Vis promenaden, vannkontakt, mennesker i opphold og bevegelse, og gjerne subtile spor av postindustriell arkitektur uten lesbare logoer. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Aker Brygge as a former shipyard and industrial area transformed into a fjord promenade with commerce, restaurants, and urban life. Show the promenade, water contact, people lingering and moving, and subtle post-industrial architectural cues without readable logos. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 16. `aker_brygge.cardImage` — Aker Brygge

- Target-path: `bilder/kort/places/by/oslo/aker_brygge.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig Aker Brygge-promenade med fjord, servering og byliv
- Must show: wide promenade, waterfront, outdoor seating without logo focus, post-industrial commercial urban space
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic waterfront shopping, quiz card, logo focus
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; anbefalt path for senere asset/data-batch

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Aker Brygge i et bredt kortvennlig utsnitt som fjordpromenade med servering, handel, byliv og postindustrielt preg. La vannkanten og publikumsbruk være tydelig, med horisontal komposisjon som fungerer i kortformat. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Aker Brygge in a wide card-friendly view as a fjord promenade with restaurants, commerce, urban life, and post-industrial character. Make the waterfront and public use clear, with a horizontal composition that works in card format. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 17. `gronland_basarene.cardImage` — Grønland basarene

- Target-path: `bilder/kort/places/gronland_basarene.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: Grønland basarene som historisk basar-/handelsmiljø i mangfoldig byområde
- Must show: historic bazaar buildings, active everyday commerce, pedestrians, Grønland urban intensity
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, QuizCards, generic historic facade, exoticizing stereotypes, readable signs as focus
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; viser basarform, handel og sosial geografi

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Grønland basarene som historisk basar- og handelsmiljø i et mangfoldig byområde. Vis basararkitektur, hverdagslig handel, fotgjengere og tett byliv på Grønland på en respektfull og dokumentarisk måte uten stereotyper eller lesbar skilttekst. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Grønland bazaar buildings as a historic bazaar and commercial environment in a diverse urban district. Show bazaar architecture, everyday commerce, pedestrians, and dense Grønland street life in a respectful documentary way without stereotypes or readable signage. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 18. `radhusplassen.image` — Rådhusplassen

- Target-path: `bilder/places/radhusplassen.JPG`
- Asset-type: `ordinary_place_image`
- Format: `JPG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Rådhusplassen som åpent byrom foran Oslo rådhus med fjordkontakt og representasjonspreg
- Must show: large open plaza, Oslo City Hall presence, fjord/harbor edge, people using space
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic plaza, event banners/text, logo focus
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; viser politisk forplass, havn og offentlig scene

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Rådhusplassen som stort åpent byrom foran Oslo rådhus med fjordkontakt, byromspreg og representativ karakter. Vis rådhuset som bakgrunn eller romlig anker, åpen plass, havne-/fjordnærhet og hverdagslig offentlig bruk uten bannere eller lesbar tekst. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Rådhusplassen as a large open urban space in front of Oslo City Hall with fjord contact and representative civic character. Show City Hall as background or spatial anchor, the open plaza, harbor/fjord proximity, and everyday public use without banners or readable text. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 19. `radhusplassen.cardImage` — Rådhusplassen

- Target-path: `bilder/kort/places/radhusplassen.PNG`
- Asset-type: `dedicated_card_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x800
- Orientation: landscape 2:1 card-friendly crop
- Visual subject: kortvennlig Rådhusplassen med åpen plass, rådhus og fjordbyrom
- Must show: wide plaza, City Hall, open civic space, waterfront feel
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, cropped City Hall towers, event-poster look, quiz card
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: dedikert kortasset; bred komposisjon for representativt byrom

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Rådhusplassen i et bredt kortvennlig utsnitt med åpen plass, Oslo rådhus og fjord-/havnepreg. Komponer horisontalt slik at både plassen og rådhusets representasjonspreg er lesbart, uten tekst, sceneplakater eller ramme. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of Rådhusplassen in a wide card-friendly composition with the open plaza, Oslo City Hall, and fjord/harbor character. Compose horizontally so both the plaza and City Hall’s representative civic character are readable, without text, event posters, or frame. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

### 20. `operahuset.image` — Operahuset

- Target-path: `bilder/places/operahuset.PNG`
- Asset-type: `ordinary_place_image`
- Format: `PNG`
- Recommended dimensions: minimum 1600x1000
- Orientation: landscape wide photo format
- Visual subject: Operahuset som åpent kulturbygg ved fjorden med hvit marmor, rampe og offentlig byrom
- Must show: white marble/sloping roof, fjord edge, glass/culture building, people walking/sitting on building
- Must avoid: no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, no History Go card surface, do not use bilder/QuizCards/**, do not use ImageCard or imageCard, no fantasy, illustration, cartoon or poster aesthetic, generic opera house, poster/typography, only interior performance
- Style: Realistisk dokumentarisk stedsgjengivelse av norsk bymiljø i naturlig lys, med tydelig stedskarakter; no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.
- Notes: ordinary place image; viser gangbart nasjonalbygg og offentlig landskap

**Norsk prompt**

> Lag et realistisk dokumentarisk bilde av Operahuset i Bjørvika som åpent kulturbygg ved fjorden med hvit marmor, skrå ramper og offentlig byrom. Vis bygget som et landskap folk kan gå på og oppholde seg i, med fjord, glass, marmor og naturlig lys. Naturlig nordisk dagslys, norsk bymiljø, tydelig stedskarakter og troverdig menneskelig aktivitet der det passer. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

**English prompt**

> Create a realistic documentary image of the Oslo Opera House in Bjørvika as an open cultural building by the fjord with white marble, sloping ramps, and public urban space. Show the building as a landscape people can walk on and inhabit, with fjord, glass, marble, and natural light. Use natural Nordic daylight, an Oslo urban environment, clear place character, and believable human activity where appropriate. no text in image, no labels, no logo focus, no quiz card layout, no frame, no typography, realistic documentary style.

## Quality checklist before committing generated assets

- Filen ligger på nøyaktig target-path.
- Bildet viser riktig sted eller riktig dokumentarisk/historisk visualisering.
- Ingen tekst/labels/quizlayout i bildet.
- Ikke QuizCards.
- Ikke ImageCard.
- Filformat matcher target-path.
- Bildet er ikke åpenbart AI-feil.
- Bildet er ikke beskåret på en måte som gjør stedet uleselig.
- For `cardImage`: fungerer i bredt kortformat.
- For `image`: fungerer som ordinært place image.

## Anbefalt Batch 51

- Hvis genererte assets kan legges inn: `Batch 51: add generated top by/oslo canonical image assets`.
- Hvis assets må produseres eksternt først: `Batch 51: review generated by/oslo asset files before commit`.

## Avgrensningsbekreftelser

- Ingen datafiler ble endret.
- `data/places/**` og `data/places/places_index.json` ble ikke endret.
- Ingen bilder/assets ble endret, lagt til, slettet eller flyttet.
- `bilder/QuizCards/**` ble ikke brukt som place JSON-asset og ble kun behandlet som negativ referanse.
- Ingen scripts/tools ble endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen canonical-filer eller manifest ble endret.
- Emneoppryddingen ble ikke gjenåpnet.
- Legacy/secondary category warnings ble ikke rørt.
