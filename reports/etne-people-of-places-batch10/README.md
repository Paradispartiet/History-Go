# Etne People of Places batch 10 — industri og landskapsarkitektur

## Resultat

Batchen legg til tre canonical personar med eksplisitte roller ved to aktive, fysiske Etne-stader:

| peopleId | person | placeId | dokumentert stadskopling |
|---|---|---|---|
| `christian_bjelland_industrimann` | Christian Bjelland | `skanevik_hermetikkfabrikk` | Chr. Bjelland kjøpte gjestgjevaranlegget i 1908, og hermetikkfabrikken vart reist på eigedomen. |
| `christine_gjermo` | Christine Gjermo | `skakkeringen_etne` | Ansvarleg landskapsarkitekt for skisseprosjektet. |
| `ellen_reitan` | Ellen Reitan | `skakkeringen_etne` | Ansvarleg landskapsarkitekt for detaljprosjekt og gjennomføring. |

## Fersk main-audit etter siste rebase

- Aktive Etne-stader: `78`
- Stader med minst éin aktiv person: `50`
- Stader utan person før batch 10: `28`
- Normalisert søk etter ID, namn og namnevariantar for dei tre kandidatane gav `0` canonical treff.
- Ingen nye place-filer vart oppretta eller endra.

Etter batchen får `skanevik_hermetikkfabrikk` og `skakkeringen_etne` sine første aktive personlenkjer. Restgjeld blir dermed `26` Etne-stader utan person. Tala vart oppdaterte etter at `main` fekk fem andre Etne-ankre medan PR-en vart publisert.

## Kjeldegrunnlag

### Christian Bjelland

- Store norske leksikon dokumenterer Christian Bjelland (1858–1927) som grunnleggjar av Chr. Bjelland & Co. og industrigründer innan hermetikk.
- Kringom dokumenterer at Chr. Bjelland kjøpte heile gjestgjevaranlegget i Skånevik i 1908, og at hermetikkfabrikken vart bygd på staden der sjøhuset med krambu stod.

Kjelder:

- https://snl.no/Christian_Bjelland_-_industrimann
- https://www.kringom.no/nb/sunnhordland/etne/skanevik-handelsstaden

ID-en bruker suffikset `_industrimann` fordi fleire generasjonar ber namnet Christian Bjelland. Dette hindrar ei framtidig namnekollisjon utan å endre visningsnamnet.

### Christine Gjermo og Ellen Reitan

- Norske landskapsarkitekters forening oppgir Christine Gjermo som ansvarleg landskapsarkitekt for skisseprosjektet til Skakkeringen.
- Same prosjektoversikt oppgir Ellen Reitan som ansvarleg landskapsarkitekt for detaljprosjekt og gjennomføring.
- PIR2 si tilsetteoversikt stadfestar yrkesrollene deira som landskapsarkitektar.

Kjelder:

- https://landskapsarkitektur.no/prosjekter/skakkeringen-i-etne
- https://pir2.no/ansatte

## Streng utvalsport

Følgjande namn vart ikkje tekne med i denne batchen:

- Juan Berasategui er kreditert som prosjekterande landskapsarkitekt, men ikkje med same individuelle hovudansvar som Gjermo og Reitan i kjelda.
- Jérôme Picard, Elida Mosquera og Kjartan Neckelmann er krediterte som arkitektar, men batchen stoppar ved dei to eksplisitt ansvarlege landskapsarkitektane.
- Olav Lovra Viskjer er oppført som kommunen sin kontakt ved oppdragsgjevaren, ikkje som dokumentert formgivar av anlegget.
- Severin Hansson Bjelland og Lars Christophersen er berre funne med direkte fabrikkroller i ei sekundær lokalhistorisk framstilling utan presise originaltilvisingar. Dei blir haldne tilbake til sterkare kjelder finst.
- Ingen noverande leiarar ved brannstasjonar, helse-/rustenester eller idrettslag er brukte som standardankre for institusjonane.

## Integrasjonskontrakt

- Dei to nye datafilene skal stå nøyaktig éin gong i `data/people/manifest.json`.
- Alle tre ID-ar skal vere globalt unike.
- `placeId` og `places` skal peike på aktive stader i `data/places/places_index.json`.
- `tests/etne-people-of-places-batch10.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-data, UI, bilete eller quizdata.

## Lokal validering

- `bash scripts/check-people.sh`: **PASS** — 1 109 people-ID-ar, 1 109 unike, 0 ugyldige place-referansar og grøne Etne batch 9/10-testar.
- `npm run typecheck`: **PASS**.
- `npm run tools:check`: TypeScript- og split-manifestportane passerer. Den samla kommandoen stoppar deretter i den eksisterande place-index-porten frå `main`: `regjeringskvartalet` har ulik `year` og `desc` i kjeldefila og `places_index.json`.
- `git diff --name-only origin/main -- data/places data/stories`: ingen output. Batch 10 endrar ikkje filene som utløyser den repo-breie restgjelda.

Den fullstendige terminalutskrifta er lagra i denne rapportmappa. PR-en skal framleis vente på GitHub CI før merge.

Verifisert: `2026-07-18`.
