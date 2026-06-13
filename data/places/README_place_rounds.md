# Place schema: `rounds` (datastyrte PlaceCard-rundinger)

PlaceCard viser en rad med runde knapper ("rundinger") for innholdstyper som
personer, historier, Wonderkammer, natur og merker. Hvilke rundinger et sted
viser bestemmes **datastyrt** av stedet selv, ikke av en hardkodet liste.

## `rounds`

- **Type:** `string[]`
- **Purpose:** Controls which PlaceCard round buttons this place shows, in the
  order they are listed.
- **Valid ids:** `people`, `stories`, `wonderkammer`, `nature`, `badges`,
  `routes`, `football`, `lexicon`
  (i tillegg støttes de eksisterende `civication`, `brands`, `music`).
- **Fallback:** Hvis feltet mangler, brukes standard-rundingene
  `people`, `stories`, `wonderkammer`, `nature`, `badges`.
- **Alias:** `rundinger` støttes som alias for bakoverkompatibilitet, men
  **`rounds` er canonical** og skal brukes i nye data.

### Regler

- Bare id-er som finnes i registeret vises. Ukjente id-er ignoreres trygt
  (logges med `console.warn`, krasjer ikke appen).
- Duplikater fjernes; rekkefølgen følger `rounds`.
- En runding som er eksplisitt deklarert vises selv om den ikke har innhold
  ennå — innholdet inni kan vise en tom tilstand (f.eks. "Ingen historier ennå"),
  fordi rundingen representerer en funksjon brukeren kan åpne.

### Eksempel

```json
{
  "id": "torggata",
  "rounds": ["lexicon", "stories", "wonderkammer"],
  "name": "Torggata",
  "category": "by"
}
```

## Implementasjon

Registeret og hjelpefunksjonene er sentralisert i `js/ui/place-card.js`:

- `PLACE_ROUND_REGISTRY` — eneste kilde for kjente rundinger (id, label,
  fallbackIcon, DOM-ikon, liste-container, popup-`kind`).
- `getPlaceRounds(place)` — leser `place.rounds` (eller alias `place.rundinger`),
  filtrerer mot registeret, fjerner duplikater og returnerer gyldige rundinger i
  definert rekkefølge.
- `applyPlaceRounds(place)` — viser/skjuler runding-ikonene og setter
  grid-rekkefølgen.

Eksponert som `window.HGPlaceRounds` og `window.getPlaceRounds`.

`rounds` er **ikke** et felt i `places_index.json` (light index) — det leses fra
full place-data via `DataHub.loadFullPlace`, så ingen ombygging av indeksen
trengs når feltet legges til.
