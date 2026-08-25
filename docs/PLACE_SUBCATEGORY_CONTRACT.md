# History GO — canonical Place-underkategorier

Status: canonical tilleggskontrakt

Sist kontrollert: 2026-08-25

## Prinsipp

En underkategori spesialiserer et vanlig `Place` under en eksisterende toppkategori. Den oppretter ikke ny kartfarge, ny topp-badge eller et parallelt Place-tier. Feltet er `subcategory_id` og skal bevares i `places_index.json`.

Underkategorier kan eie en avgrenset presentasjonsprofil når toppkategoriens standardkomposisjon ville gitt feil semantikk. Unntaket skal være eksplisitt, testet og begrenset til den aktuelle underkategorien. Ordinære steder i toppkategorien skal forbli uendret.

## Natur & miljø → Miljø & gjenbruk

Canonical ID: `natur / miljo_gjenbruk`.

Dette er vanlige Places. De skal ha egen kartprikk med Natur & miljø-farge, kilder, koordinatbevis, PlaceCard, obligatorisk quiz og fungerende Fagverk-side. De er ikke Micro Places.

Miljø- og gjenbrukssteder bruker følgende faste 2 × 2-komposisjon:

1. `reuse` — **Ombruk**
2. `materials` — **Materialer**
3. `environment` — **Kretsløp & miljø**
4. `systems` — **Sted & system**

Alle fire er avrundede rektangler. Flora og Fauna skal ikke fylles kunstig på et gjenvinnings- eller ombrukspunkt bare fordi toppkategorien er `natur`.

Innholdet eies av `circular_profile`, som også kan angi stedstype, driftsstatus og praktiske egenskaper som gratis uthenting, salg, adgangsbegrensning, selvbetjening og mobil tjeneste. Tidsavhengige egenskaper må kildeverifiseres på nytt ved stedsproduksjon.

Faglig grunnmur er Natur-kapitlene `miljopavirkning_forvaltning_regenerasjon` og `sirkulaer_okonomi_avfall_ombruk`.

## Språk & litteratur → Lesekiosk

Canonical ID: `litteratur / lesekiosk`.

En Lesekiosk er et eget fysisk litteratursted og beholder egen Litteratur-prikk selv når den står ved et annet History GO-sted. Den kan relateres til nærliggende sted, men skal ikke skjules som underinnhold hos dette.

Lesekiosker bruker den vanlige Litteratur-PlaceCarden: `people`, `objects`, `brands`, `productions` (Bøker og tekster). Tomme samlinger skal være ærlige tomtilstander og aldri fylles med oppdiktet innhold. Bilder ligger fortsatt bare i medieflaten.

Faglig grunnmur inkluderer `lesekultur_bokdeling_offentlighet`.

## Identitet og duplikater

- Ett fysisk tilbud får én canonical Place-identitet.
- Et tilbud inne i et større område kan ha egen Place når det er en selvstendig oppsøkbar fysisk funksjon, for eksempel en gjenvinningsstasjon i en park eller en Lesekiosk ved et stadion.
- Samme tilbud skal ikke få en ekstra Place bare fordi det har både avfalls- og ombruksfunksjon; funksjonene beskrives i samme `circular_profile`.
- Mobile eller midlertidig utilgjengelige tjenester skal ikke presenteres som permanente aktive kartpunkter uten eksplisitt statusmodell.
