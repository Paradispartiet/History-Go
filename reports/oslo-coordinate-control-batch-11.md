# Oslo koordinatkontroll – batch 11, fullføring

Dato: 2026-07-19

Batch 11 fullføres fra 2/7 til 7/7 og Oslo-protokollen går fra 60 til 65 kildekontrollerte canonical steder.

| placeId | objekttype | status | kildeobjekt |
|---|---|---|---|
| `torggata` | lineær gate | verified_geometry | `oslobyleksikon:torggata` |
| `bispelokket` | revet historisk trafikkanlegg | verified_historical_source | `regjeringen:stmeld-28-2001-2002:bispelokket` |
| `karl_johan` | lineær gate/paradeakse | verified_geometry | `oslobyleksikon:karl-johans-gate` |
| `radhusplassen` | stort plassrom | verified_geometry | `oslo-kommune:fjordbyen:radhusplassen` |
| `bjorvika` | større transformasjonsområde | verified_geometry | `oslo-kommune:fjordbyen:bjorvika` |

Kontrakten presiseres samtidig slik at dokumenterte semantiske linje-/områdeankre kan ha `verified_geometry`, og historiske approximasjoner kan ha `verified_historical_source`, uten å feilklassifiseres som adressepunkter.
