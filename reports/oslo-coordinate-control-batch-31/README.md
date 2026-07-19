# Oslo coordinate control batch 31

Dato: 2026-07-19

Batch 31 kontrollerer de sju aktive recordene i `data/places/natur/oslo/places_oslo_alna.json`.

## Resultat

- `alnabru_jernbane_og_logistikk` → **verified_geometry** på eksakt OSM terminalpolygon `way 84268939`, kryssjekket mot Bane NOR. Visningsnavnet korrigeres til **Alnabru godsterminal**.
- `alnaelva` → **needs_review**: langt og fragmentert elveobjekt uten ett legitimt hovedpunkt.
- `alnaelvstien` → **needs_review**: flere separate Alnastien-segmenter uten samlet ruterelasjon.
- `loelva_historisk` → **needs_review**: historisk alias for Alna, ikke separat fysisk vassdrag.
- `trosterud_friomrade` → **needs_review**: ingen stabil navngitt fysisk entitet dokumentert.
- `furuset_haugerud_skogbelte` → **needs_review**: bred beskrivende grøntdrag-identitet uten avgrenset geometri.
- `hellerud_gard` → **needs_review**: flere Hellerud-gårdsidentiteter; Haugerudtunet 1 gjelder en separat Haugerud-gård og brukes ikke som proxy.

Ingen av de seks avviste recordene får nytt proxy-punkt. Bare Alnabru-markøren flyttes fysisk i denne batchen, og den skal gjennom visuell kart-QA før merge.
