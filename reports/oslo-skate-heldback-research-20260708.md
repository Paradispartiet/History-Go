# Oslo skate / pumptrack heldback research — 2026-07-08

## Scope

Dette er en manuell researchrapport laget i ChatGPT. Codex er ikke brukt til research.

Rapporten vurderer de tre kandidatene som ble holdt tilbake etter Oslo urban movement batch 1:

- `jordal_skatepark`
- `voldslokka_pumptrack`
- `torshovdalen_skatepark`

Ingen place-filer, manifest, index, people, quiz, UI eller loader-filer endres i denne PR-en.

## Konklusjon

Ingen av de tre kandidatene bør opprettes som place-fil ennå.

| kandidat | beslutning | begrunnelse |
|---|---|---|
| `jordal_skatepark` | `needs_more_research` | Det finnes svakt sekundærspor om Jordal skatepark, men ikke godt nok kildegrunnlag for egen place-fil og presis koordinat. |
| `voldslokka_pumptrack` | `needs_more_research` | Ingen god kilde funnet for eget pumptrack-anlegg med presis fysisk lokasjon. |
| `torshovdalen_skatepark` | `needs_more_research` | Ingen god kilde funnet for egen skatepark/skatespot med presis fysisk lokasjon. |

## Kandidatvurdering

### `jordal_skatepark`

**Funn:**

- Sterk kilde for `Jordal Idrettspark` dokumenterer Jordal som kommunalt fleridrettsanlegg med Jordal Amfi, Ungdomshallen og Jordal Stadion, med koordinat `59.9112278, 10.7839417`.
- Den samme kilden dokumenterer fotball, amerikansk fotball, ishockey, tidligere skøyter/friidrett/kappgang, men ikke skatepark som egen fasilitet.
- Svakt sekundærspor: en biografiside for Marlon Langeland oppgir at han deltok i byggingen av skateparken på Jordal. Dette etablerer et mulig spor, men er ikke god nok kilde alene for en egen place-entry.

**Beslutning:**

`needs_more_research`

**Hva som trengs før append:**

- Kommunal anleggsinfo, idrettsanleggsregister, OSM-node/way eller lokal/foreningskilde som eksplisitt viser `Jordal skatepark`.
- Presis koordinat for skateparken, ikke bare Jordal Idrettspark-anker.
- Bekreftelse på om dette er aktivt/fysisk eksisterende anlegg, historisk anlegg eller bare uformelt spot.

**Ikke gjør:**

- Ikke opprett `jordal_skatepark` bare med Jordal Idrettspark-koordinat.
- Ikke legg den under subkultur uten tydelig skate-/miljøkilde.
- Ikke bruk Marlon Langeland-sporet alene som hovedkilde.

### `voldslokka_pumptrack`

**Funn:**

- Repoet dekker allerede `oslo_skatehall` på Voldsløkka som innendørs skatehall.
- Jeg fant ikke tilstrekkelig kilde for et eget `voldslokka_pumptrack`-anlegg med presis lokasjon.

**Beslutning:**

`needs_more_research`

**Hva som trengs før append:**

- Kilde som eksplisitt dokumenterer pumptrack på Voldsløkka.
- Presis koordinat eller kartobjekt for pumptracken.
- Avklaring mot eksisterende `oslo_skatehall`, slik at vi ikke dupliserer samme aktivitetsmiljø eller feilaktig lager eget sted for en underdel.

**Ikke gjør:**

- Ikke opprett egen place-fil før fysisk anlegg er verifisert.
- Ikke bruk `oslo_skatehall` som proxykoordinat for pumptrack.

### `torshovdalen_skatepark`

**Funn:**

- Kilder dokumenterer Torshovdalen som park/byrom, men jeg fant ikke en god kilde som eksplisitt dokumenterer skatepark/skatespot som egen fasilitet.

**Beslutning:**

`needs_more_research`

**Hva som trengs før append:**

- Kilde som eksplisitt dokumenterer skatepark/skatespot i Torshovdalen.
- Presis koordinat.
- Avklaring om dette er formelt anlegg, uformelt spot eller feilnavn for et annet nærliggende sted.

**Ikke gjør:**

- Ikke opprett `torshovdalen_skatepark` bare fordi Torshovdalen er en stor park.
- Ikke gi skate-vinkel til Torshovdalen uten eksplisitt kilde.

## Kilder kontrollert / brukt

- Jordal Idrettspark, Wikipedia: dokumenterer idrettsparken, koordinat, hovedfasiliteter og idretter, men ikke egen skatepark.
- Marlon Langeland, italiensk/spansk Wikipedia: svakt sekundærspor som nevner bygging av Jordal skatepark, men dette er ikke tilstrekkelig alene.
- Torshovdalen / parks and open spaces in Oslo: dokumenterer Torshovdalen som park/byrom, men ikke skatepark.
- Søk etter `Voldsløkka pumptrack`, `Voldslokka pumptrack`, `Torshovdalen skatepark`, `Jordal skatepark`, `rullepark`, `skateanlegg`, `skateboardanlegg` ga ikke nok til sikker place-append.

## Eksisterende dekning som fortsatt gjelder

Følgende steder dekker allerede skate/urban movement i repoet:

- `skur13` — subkultur/skate/graffiti/urban aktivitet
- `gamlebyen_sport_og_fritid` — skate/bowl/scene/bandrom/dugnad
- `oslo_skatehall` — innendørs skatehall på Voldsløkka
- `verdensparken_parkour` — sport/parkour/urban movement
- `furuset_aktivitetspark` — sport/fleraktivitet/nærmiljøanlegg

## Anbefalt neste researchmetode

For å få disse tre over terskelen må neste research gå via konkrete kart-/anleggsregistre, ikke vanlig nettsøk:

1. Oslo kommunes idretts-/aktivitetsanleggskart.
2. Kulturdepartementets / anleggsregisterets anleggssøk, hvis tilgjengelig.
3. OSM/Overpass-søk på `leisure=skatepark`, `sport=skateboard`, `sport=cycling`, `pumptrack` rundt Jordal, Voldsløkka og Torshovdalen.
4. Oslo Skateboardforening / lokale klubber / bydelsdokumenter.
5. Eventuelle prosjekt-/anskaffelsesdokumenter for parker eller nærmiljøanlegg.

## Append-kriterier for senere PR

En kandidat kan først bli place-fil når minst ett av disse er sant:

- offisiell kommunal/anleggsregister-kilde dokumenterer anlegget, eller
- OSM/Overpass har presis node/way med relevant tagg og navn, eller
- lokal forening/arrangørkilde dokumenterer fysisk sted og bruk, kombinert med presis kartplassering.

Da bør opprettelse skje som sport-place, ikke automatisk subkultur:

- `jordal_skatepark` → `sport`, underbadge `skate`, `skatepark`, `naermiljoanlegg`
- `voldslokka_pumptrack` → `sport`, underbadge `sykling`, `naermiljoanlegg`, eventuelt `skatepark` bare hvis skatebruk er dokumentert
- `torshovdalen_skatepark` → `sport` eller `subkultur` avhengig av kildegrunnlag og miljøvinkel

## Validering

Denne PR-en er rapport-only.

Forventede endringer:

- `reports/oslo-skate-heldback-research-20260708.md`

Ikke forventede endringer:

- `data/places/**`
- `data/places/manifest.json`
- `data/places/places_index.json`
- `data/people/**`
- `data/quiz/**`
- UI/runtime/loader-filer
