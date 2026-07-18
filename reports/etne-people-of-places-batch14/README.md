# Etne People of Places batch 14 — bygdafolket og Lions bak musikkpaviljongen

## Resultat

Batchen legg til eitt avgrensa kollektivt miljøanker med ei eksplisitt dokumentert kopling til eitt tidlegare udekt fysisk sted. Ingen place-recordar blir oppretta eller endra.

| peopleId | people-anker | fysisk hovudanker | dokumentert fysisk kopling |
|---|---|---|---|
| `bygdafolket_og_lions_musikkpaviljongen` | Bygdafolket og Lions bak musikkpaviljongen | `musikkpaviljongen_doktorhagen` | Skånevik Fjordhotell dokumenterer at paviljongen vart reist med midlar frå bygdafolk og Lions Club, finansiert gjennom lotteri, innsamlingar og arrangement og overlevert til Etne kommune 3. juni 2000. |

## Fersk main-audit før skriving

- `main`: `0683e2f1e` (`Correct Etne batch 13 coverage counts (#2329)`)
- Aktive Etne-stader: `81`
- Stader med minst éin aktiv person før batch 14: `54`
- Stader utan person før batch 14: `27`
- Canonical people-filer i manifestet før batchen: `542`
- Canonical people-oppføringar før batchen: `1 113`
- Kandidat-ID-en og variantane `Bygdafolket og Lions bak musikkpaviljongen`, `Bygdafolk og Lions Club` og `Musikkpaviljongen sitt dugnadsmiljø` gav `0` canonical treff før skriving.
- Batchen legg til `1` ny people-ID, `1` ny people-fil og `0` nye place-recordar.

Etter batchen får `musikkpaviljongen_doktorhagen` si første aktive people-lenkje. Dekninga blir `55/81`, og restgjelda blir `26` Etne-stader utan people-anker.

## Kjeldegrunnlag

Skånevik Fjordhotell si lokale aktivitetsoversikt dokumenterer heile den fysiske kjeda: Musikkpaviljongen i Doktorhagen vart reist av midlar frå bygdafolk og Lions Club, finansiert gjennom lotteri, innsamlingar og ulike arrangement, og innvia og overlevert til Etne kommune 3. juni 2000. Sida gir også den stadlege funksjonen som open arena for musikkrefter i nærområdet.

Etne kommune si stadanalyse for Skånevik sentrum dokumenterer paviljongen som eit eksisterande element i Doktorhagen og gjentek den frivillige finansieringa. Kjeldene gir ikkje ei namneliste over byggjarar, innsamlarar eller bidragsytarar.

Kjelder:

- https://www.fjordhotellet.no/aktivitetar
- https://www.etne.kommune.no/_f/p1/iaed56af7-0455-47a7-9d42-e1ae9bcae881/stadanalyse-2025.pdf

## Streng utvalsport

- Ankeret er avgrensa til menneska bak finansieringa og reisinga av den konkrete paviljongen. Det er ikkje eit generelt kort for alle innbyggjarar i Skånevik eller alle Lions-medlemmer.
- Kjeldene gir ingen namn. Batchen diktar derfor ikkje ein initiativtakar, byggjeleiar eller representant, og bruker heller ikkje ein noverande Lions-leiar som erstatning.
- Namnet følgjer kjeldeordlyden `bygdafolk og Lions Club`; popupteksten seier uttrykkjeleg at ikkje alle i desse gruppene blir påstått å ha delteke.
- Innviingsåret 2000 er dokumentert for den fysiske paviljongen og kan derfor brukast utan å overføre eit organisasjonsår til byggverket.
- Festivalartistar, hotelltilsette og dagens brukarar blir ikkje lagde til berre fordi dei har opptredd, arbeidd eller opphalde seg i Doktorhagen.

## Integrasjonskontrakt

- `bygdafolket_og_lions_musikkpaviljongen` skal finnast nøyaktig éin gong globalt, også ved normalisert variantkontroll.
- Ankeret skal berre peike på `musikkpaviljongen_doktorhagen`.
- People-manifestet skal registrere `people/kunst/vestland/etne/people_musikkpaviljongen_doktorhagen_batch1.json` nøyaktig éin gong.
- `tests/etne-people-of-places-batch14.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-data, story-data, UI, bilete eller quizdata.

## Lokal validering

- `node tests/etne-people-of-places-batch14.test.js`: **PASS** — eitt avgrensa kollektiv, éin nydekt fysisk paviljong og éin canonical identitet.
- `bash scripts/check-people.sh`: **PASS** — 1 114 people-ID-ar, 1 114 unike, 0 ugyldige place-referansar og grøne Etne batch 9/10/11/12/13/14-testar.
- `npm run typecheck`: **PASS**.
- `npm run tools:check`: place-, koordinat-, emne-, i18n-, leksikon- og aliasportane passerer. Den samla kommandoen stoppar deretter i den eksisterande story-integritetsporten på fem referansar frå `main`: `utoya`, `norges_hjemmefrontmuseum` og `operaen`.
- `git diff --name-only -- data/places data/stories`: ingen output. Batch 14 endrar ikkje place- eller story-data.
- `git diff --check`: **PASS**.

Den fullstendige terminalutskrifta og den separate duplikatrevisjonen er lagra i denne rapportmappa. PR-en skal vente på GitHub CI før merge.

Verifisert: `2026-07-18`.
