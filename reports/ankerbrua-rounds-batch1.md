# Ankerbrua – PlaceCard-rundinger batch 1

## Resultat

Ankerbrua er fylt med canonical `by`-profil:

`people`, `nature`, `badges`, `works`, `civication`, `brands`, `før_nå`, `fortellinger`, `leksikon`.

## Identitet og år

- Canonical sted: Ankerbrua / Eventyrbrua over Akerselva.
- Dagens eksisterende bro: 1926.
- Forgjenger: trebro oppført 1874–76.
- Offentlig kunst: Dyre Vaas fire bronsegrupper fra 1937.
- Canonical motiver: Kvitebjørn kong Valemon, Per Gynt, Kari Trestakk og Veslefrikk med fela.
- Oscar Hoff er dokumentert som arkitekt for 1926-broen.

## Koordinat

Canonical koordinat og radius beholdes fra verifisert OSM-geometri:

- `59.9182571, 10.7562989`
- radius `120`
- `coordStatus: verified_geometry`
- OSM way `381749949`

## Konfliktfri registrering

PR-grenen ble opprinnelig liggende bak `main` mens Etne-registre ble utvidet. Sluttversjonen overskriver derfor ingen globale append-only-registre:

- Dyre Vaa er lagt inn i det allerede registrerte Akerselva-persondokumentet `data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json`.
- `placeId` og `places` kobler Dyre Vaa direkte til Ankerbrua gjennom den dokumenterte runtime-fallbacken i `getPeopleForPlace()`.
- Ankerbrua-fortellingen er lagt i det allerede registrerte storydokumentet `data/stories/stories_hausmannsbrua.json`.
- `data/people/manifest.json`, `data/relations.json` og `data/stories/stories_manifest.json` beholdes fra aktuell `main`.

## Innhold

- seks quizsett med sju kildebelagte spørsmål per sett
- leksikonartikkel versjon 2
- sju dokumenterte works, inkludert brofasene og de fire bronsegruppene
- fem fysiske, stedsspesifikke Civication-objekter
- fem stedsspesifikke brands/aktører
- før/nå-seksjon med minst åtte konkrete observasjonspunkter
- lang natur-/elveromstekst
- egen fortelling: «Broen som ble et eventyr»

## Kilder

- Oslo byleksikon – Ankerbrua
- Store norske leksikon – Dyre Vaa
- Norsk kunstnerleksikon – Dyre Vaa
- Oslo byleksikon – Ankerløkken
- Store norske leksikon – Christian Ancher
- Lokalhistoriewiki – Ankerbrua

## Kontroll

Den målrettede testen kontrollerer:

- canonical koordinatparitet mot coordinate-evidence
- riktig `by`-rundingsprofil
- Dyre Vaa lastet gjennom eksisterende People-manifest
- runtime-fallback fra personens `placeId`/`places`
- storyfil registrert i eksisterende story-manifest
- works, Civication, brands, før/nå og naturtekst
- badge-ID-er
- seks quizsett × sju spørsmål
- route-index og split-manifest-hash
- canonical år og motivnavn
- at Tyrihans-avviket ikke er tatt inn i canonical data

I tillegg kjøres People-of-Places, leksikon-ID-er, TypeScript, split-manifest, place-index, koordinatkildekontrakt, koordinatkvalitet og coordinate-evidence som harde porter. Den globale story-integritetskontrollen og strict-new-koordinatinntaket har eksisterende, urelaterte feil andre steder i datasettet og brukes derfor ikke som Ankerbrua-port; Ankerbruas egne story- og koordinatkrav er dekket av måltesten og de øvrige koordinatportene.
