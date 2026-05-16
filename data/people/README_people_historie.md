# People historie

Dette dokumentet definerer hva som skal ligge i `data/people/people_historie.json`.

## Formål

`people_historie.json` skal inneholde personer som primært fungerer som historiske skikkelser i History Go. Filen skal brukes til eldre historie, epoker, minne, krig, kongemakt, middelalder, vikingtid, statsdannelse og historiske brudd.

## Skal inn i `people_historie`

Typiske kandidater:

- vikingtid og rikssamling
- middelalder og borgerkrigstid
- konger, dronninger, helgener og sentrale middelalderfigurer
- reformasjon, tidlig moderne stat og Christiania 1624
- Akershus festning, kongemakt, forsvar og eldre institusjoner
- okkupasjon, motstand, fengselshistorie og rettsoppgjør
- minnesteder, kulturarv og historisk etterliv
- personer der hovedpoenget er historisk epoke, hendelse eller minnespor

Eksempler på riktig type:

- `harald_harfagre`
- `olav_den_hellige`
- `kong_sverre`
- `haakon_v_magnusson`
- `st_hallvard`
- `vidkun_quisling`
- `gunnar_sonsteby`
- `gregers_gram`
- `petter_moen`

## Skal vanligvis ikke inn i `people_historie`

Personer skal ikke legges i historie bare fordi de er gamle eller historisk viktige. De skal ligge i sin sterkeste fagkategori hvis hovedrollen deres er politisk, litterær, kunstnerisk, vitenskapelig eller kulturell.

Typisk plassering utenfor historie:

- stortingspolitikere, parlamentarisme, partier og sosialpolitikk -> `people_politikk.json`
- kvinnestemmerett, demokratibevegelse og moderne politisk representasjon -> vanligvis `people_politikk.json`
- forfattere og litterær offentlighet -> `people_litteratur.json`
- forskere, oppdagere og vitenskapelige institusjoner -> `people_vitenskap.json`, med historietag ved behov
- kunstnere og kulturpersoner -> relevant kunst-/kulturfil

Eksempler som ikke bør legges i `people_historie` som hovedkategori:

- Anna Rogstad -> politikk
- Johan Castberg -> politikk
- C.J. Hambro -> politikk
- Jørgen Løvland -> politikk
- Fredrikke Marie Qvam -> politikk
- Ragna Nielsen -> utdanning/politikk, ikke kjerne-historie
- Fernanda Nissen -> politikk/kultur/arbeiderbevegelse

## Krysskategorier

En person kan ha historisk betydning uten å ligge i `people_historie`.

Bruk da:

```json
"tags": ["politikk", "historie"]
```

eller tilsvarende, men behold `category` som den sterkeste hovedkategorien.

Eksempel:

```json
{
  "id": "fredrikke_marie_qvam",
  "category": "politikk",
  "tags": ["politikk", "historie"]
}
```

## Place-koblinger

Ikke lag duplikatsteder for historiepersoner. Bruk eksisterende `placeId` på tvers av kategorier.

Eksempler:

- `stortinget` kan brukes av historiepersoner selv om stedet ligger i politikk
- `oslo_radhus` kan brukes av historiepersoner selv om stedet ligger i politikk
- `nobelinstituttet` kan brukes hvis stedet finnes i vitenskap
- `karl_johan` kan brukes hvis stedet finnes i by

Før nye personer legges inn, sjekk alltid at `placeId` finnes i aktiv place-manifest.

## Praktisk regel

Legg en person i `people_historie` bare når svaret på dette er ja:

> Er personens viktigste funksjon i appen å forklare en historisk epoke, hendelse, krig, middelalder, kongemakt, minne eller kulturarv?

Hvis svaret er nei, legg personen i riktig fagkategori og bruk `historie` som tag ved behov.
