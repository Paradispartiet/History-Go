# Youngstorget – aktivt stedproduksjonskort

- Oppdatert: 2026-08-25
- Place ID: `youngstorget`
- Permanent branch: `agent/content-factory-pilot-01-youngstorget-phase7d-before-after`
- Canonical source: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Autoritative produksjonskontrakter: `PLACE_PRODUCTION_CHECKLIST (2).md` og `PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1 (2).md` i HG Data/Kilder
- Tidligere leveranser: PR #5213, #5214, #5215, #5216, #5218, #5222, #5227, #5228, #5230, #5231 og #5232

## Scope

Youngstorget er selve det navngitte offentlige torget fra anlegget i 1846 til dagens plassrom. Torggata og Storgata er gater, mens Folkets Hus, Folketeateret og Møllergata 19 er egne nabosteder. Nærhet gir aldri automatisk People-, Brand-, Object- eller Story-eierskap.

## Fasestatus

| Fase | Status | Evidens |
| --- | --- | --- |
| 0–7C | **FERDIG OG MERGET** | Tidligere PR-er gjennom #5232 |
| 7D Før/etter | **FERDIG** | Sammenlignbart 1939/2025-par, 86 år, faste ankre, proveniens og lisens |
| 7E Nyheter | **FERDIG** | Tre daterte 2026-notiser med `archived`/`scheduled` og ferske kilder |
| 7F Lesespor | **FERDIG** | Tre nye åpne spor fra Arbark og LO; paywalled legacyspor er ikke omklassifisert |
| 7G Kilder | **FERDIG** | Tolv inspectable HTTPS-lenker, inkludert kilde-, kart- og bildeproveniens |
| 7H Språk og tolkning | **FERDIG** | Nytorvet, Youngstorget og meningstorg; Legg merke til, Betydning og Motpunkter |
| 8 PlaceCard | **FERDIG** | Eksakt `people · objects · brands · related`; Badges separat; Quiz tydelig; ingen Images-reserve |
| 9 Onsite | **FERDIG** | Canonical universell onsite-rad og stedseide observasjonsankre beholdt; ingen nye falske oppgaver |
| 10 Quiz | **FERDIG** | Rich 5 × 7, 19 fakta / 9 sammenheng / 7 teori, normal første 14, 35 claims |
| 11 Observer / Notat / Rute | **FERDIG / BEGRUNNET N/A** | Observer/Notat eies av runtime; ingen uverifisert historisk rute er opprettet |
| 12 People | **FERDIG** | Fire direkte kildebelagte personer; brede legacy-koblinger er eksplisitt holdt ute |
| 13 Brands | **FERDIG MED ÆRLIG TOMTILSTAND** | Fire nabovirksomheter fjernet; ingen kandidat bestod own-place + logo/proveniens |
| 14 Discovery | **FERDIG** | Alias, index, Related, Nearby/NextUp-kompatibilitet, søk og tre fulltekstoversettelser |
| 15–18 Besøk/progresjon/profil/legacy | **FERDIG / BEGRUNNET N/A** | Besøk er separat fra Quiz; eksisterende state-kontrakter bevart; ingen falske belønninger eller Wonderkammer-innhold |
| 19 Bilder | **FERDIG** | Hero + reelt før/etter-par; ingen irrelevante bilder som collection eller object-reserve |
| 20 Data-QA | **FERDIG LOKALT** | Schema, indeks, People, Stories, Leksikon, fagverk, Knowledge og quiz-porter grønne |
| 21 Manuell UI-QA | **VENTER PÅ REACHABLE PREVIEW** | Lokal browser-binær finnes ikke; sky-QA kjøres på PR-preview/merged site |
| 22 Innholds-QA | **FERDIG LOKALT** | Stedsspesifisitet, grenselinjer, kildekjede, språk og tomtilstander kontrollert |
| 23 CI | **VENTER PÅ PR** | Full CI følges etter push |
| 24 Ett-sted-gate | **VENTER PÅ UI + CI + MERGE** | Endelig audit oppdateres med PR og mergecommit |

## Redaksjonelle beslutninger

- `year: 1852` beholdes som navnemilepæl; tekst og kronologi skiller 1846, 1852 og 1951.
- Synlige People er Jørgen Young, Jacob Wilhelm Nordan, Per Palle Storm og Hagbart Solløs. De har hver en direkte Youngstorget-kobling.
- Objects er Pioneren, Fredsmonumentet, den permanente fotoutstillingen og fontenen. Alle fire er fysiske, stedsspesifikke og kildebelagte.
- Brands bruker canonical tomtilstand. Internasjonalen, Mono, Sentrum Scene og Stratos var nabo-/virksomhetsproxyer og er fjernet. LO, Arbeiderpartiet og Arbark tilhører egne bygg/organisasjonssteder rundt torget; Bymiljøetaten mangler den krevde own-place-logo-/wordmark-proveniensen. Derfor er også legacy `actors_by_place`-proxyene fjernet.
- Related bruker canonicale naboer som relasjon, aldri som Youngstorget-innhold.
- Max Manus-relasjonen ble fjernet fordi den var en automatisk migrert kobling uten dokumentert egen Youngstorget-evidens.
- Ingen ny historisk rute materialiseres: 1890-Storyen går til Tullinløkka, som ikke er canonical Place i dagens datagrunnlag. Et falskt eller delvis løst stopp ville bryte rutekontrakten.

## Neste handling

Push branchen, åpne PR, bruk preview til desktop/mobile QA, reparer eventuelle reelle feil, få CI grønn og merge til `main`. Storgata/Brugata starter først etter verifisert merge.
