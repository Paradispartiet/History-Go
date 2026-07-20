# Religion place migration — batch 1

Dato: 2026-07-20

## Formål

Første kontrollerte place-migrering etter at `religion` ble etablert som egen top-level badge/domain.

Primærregelen er dagens hovedfunksjon:

- aktive trossteder → `category: "religion"`
- tidligere religiøse bygg med primær kulturfunksjon → `category: "kunst"`
- ingen navnebasert automatikk

## Flyttes til Religion

- `oslo_domkirke`
- `gamle_aker_kirke`
- `central_jam_e_mosque`
- `gronland_kirke`
- `kampen_kirke`
- `fagerborg_kirke`
- `uranienborg_kirke`
- `frogner_kirke`
- `trefoldighetskirken`
- `st_hallvard_kirke_kloster`

## Eksplisitte kulturunntak

- `sofienberg_kirke` → `kunst`
- `kulturkirken_jakob_litteratur` → `kunst`

Disse skal ikke flyttes til Religion bare fordi navnene fortsatt inneholder «kirke».

## Teknisk gjennomføring

Kategoriene ligger eksplisitt i `data/places/category_overrides.json`.

`js/geo/place-coordinate-overrides.js` leser både eksisterende koordinat-overrides og de nye kategori-overridene etter at `DataHub` er lastet. Det gjør at:

- `places_index.json` kan være eldre uten at kart/Nearby viser feil primærbadge
- `loadFullPlace`, `getPlaceEnriched` og `loadEnrichedAll` får samme kategori
- kategorier valideres gjennom `DomainRegistry.toRuntimeCategoryId()`

Dette er en kontrollert migreringsflate, ikke en regelmotor. Nye steder skal fortsatt klassifiseres eksplisitt etter dagens hovedfunksjon.

## Videre arbeid

Fortsett i små, auditerte batcher. Ikke flytt klosterruiner, kirkegårder, tidligere kirkebygg eller kulturminner blindt på grunnlag av navn; vurder dagens primærfunksjon først.
