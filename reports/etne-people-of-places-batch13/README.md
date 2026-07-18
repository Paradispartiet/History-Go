# Etne People of Places batch 13 — grunnleggjaren i den faste dojoen

## Resultat

Batchen legg til éin ny canonical person med ei eksplisitt dokumentert kopling til eitt tidlegare udekt fysisk sted. Ingen place-recordar blir oppretta eller endra.

| peopleId | person | fysisk hovudanker | dokumentert fysisk kopling |
|---|---|---|---|
| `geir_arne_havreberg` | Geir Arne Havreberg | `etne_kyokushin_dojo` | Klubbens eiga nettside plasserer Havreberg som hovudtrenar og Shihan i klubbens eigen dojo ved idrettsbanen og Skakke. Brønnøysundregistera stadfestar klubbadressa Stadionvegen 38, og kommunal formidling dokumenterer trening med Havreberg inne i dojoen på same adresse. KWF dokumenterer grunnleggjarrolla. |

## Fersk main-audit før skriving

- `main`: `39e00cac3` (`Resolve final Etne coordinate identities (#2325)`)
- Aktive Etne-stader: `81`
- Stader med minst éin aktiv person før batch 13: `53`
- Stader utan person før batch 13: `28`
- Canonical people-filer i manifestet før batchen: `541`
- Canonical people-oppføringar før batchen: `1 112`
- Kandidat-ID-en og namnevariantane `Geir Havreberg`, `Geir A. Havreberg` og `Geir Arne Havreberg` gav `0` canonical treff før skriving.
- Batchen legg til `1` ny person-ID, `1` ny people-fil og `0` nye place-recordar.

Etter batchen får `etne_kyokushin_dojo` si første aktive personlenkje. Dekninga blir `54/81`, og restgjelda blir `27` Etne-stader utan person.

Baseline er lågare enn dei `83` stadene i batch 12-rapporten fordi PR #2325 flytta `gjerdesvagen_jernvinne` til Kvinnherad og `grindheim_jernvinne` til Bømlo i samsvar med primærkjeldene. Begge hadde people-anker; derfor går førdekninga frå `55/83` til `53/81` før den nye dojo-lenkja blir lagd til.

## Kjeldegrunnlag

Kyokushin World Federation omtalar Geir Havreberg uttrykkjeleg som grunnleggjaren som leier Etne-klubbens vinterleir. Klubbens eiga nettside dokumenterer både at klubben har ein eigen dojo ved idrettsbanen og Skakke, at Geir A. Havreberg er hovudtrenar, og at han blir titulert Shihan i dojoen. Instruktørsida stadfestar den same hovudtrenarrolla.

Brønnøysundregistera gir klubben forretningsadressa Stadionvegen 38, 5590 Etne. Eit formidlingsinnslag delt av Etne kommune/kommunelegen inviterer publikum inn i klubbens dojo og på trening med Shihan Geir Havreberg, og oppgir Stadionvegen 38 som stad. Kjeldene bind dermed saman identitet, grunnleggjar- og trenarrolla, den fysiske dojoen og den canonical adressa.

Kjelder:

- https://kyokushinworldfederation.org/kyokushin-winter-camp-in-etne-norway-26-29-january-2023/
- https://kyokushin-etne.net/wordpress/?page_id=2
- https://kyokushin-etne.net/wordpress/?page_id=16
- https://www.instagram.com/reel/DOZJg2-imW8/
- https://virksomhet.brreg.no/nb/oppslag/enheter/993454729

## Streng utvalsport

- Havreberg blir ikkje vald fordi han står som ein noverande kontaktperson. Han passerer fordi KWF dokumenterer grunnleggjarrolla, medan klubb- og kommunekjeldene dokumenterer hans konkrete trenararbeid inne i den faste dojoen.
- `etne_kyokushin_dojo` blir ikkje blanda saman med `etne_idrettsanlegg`. Klubbkjelda seier at dojoen ligg ved idrettsbanen og Skakke, medan Brønnøysundregistera og kommunal formidling gir den eigne adressa Stadionvegen 38.
- `year` er medvite `null`. Klubbens historiske startår blir ikkje presentert som opningsår for dagens dojo; dette følgjer også `avoid_angles` i canonical place-recorden.
- Hans Kristian Åsheim Havreberg, Frode S. Robberstad og andre noverande instruktørar blir ikkje lagde til. Kjeldene dokumenterer aktivitet, men batchen held seg til den eine historisk forankra grunnleggjaren.
- Vinterleiren åleine ville ikkje vore nok som stadskopling. Den blir berre brukt til å dokumentere grunnleggjarrolla; den eksakte dojo-koplinga kjem frå klubb-, register- og kommunekjeldene.

## Integrasjonskontrakt

- `geir_arne_havreberg` skal finnast nøyaktig éin gong globalt, også når namn blir normaliserte og mellomnamnet blir forkorta eller utelate.
- Personen skal berre peike på `etne_kyokushin_dojo`.
- People-manifestet skal registrere `people/sport/vestland/etne/people_sport_etne_batch2.json` nøyaktig éin gong.
- `tests/etne-people-of-places-batch13.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-data, story-data, UI, bilete eller quizdata.

## Lokal validering

- `node tests/etne-people-of-places-batch13.test.js`: **PASS** — éin grunnleggjar/hovudtrenar, éin nydekt fysisk dojo og éin canonical identitet.
- `bash scripts/check-people.sh`: **PASS** — 1 113 people-ID-ar, 1 113 unike, 0 ugyldige place-referansar og grøne Etne batch 9/10/11/12/13-testar.
- `npm run typecheck`: **PASS**.
- `npm run tools:check`: place-, koordinat-, emne-, i18n-, leksikon- og aliasportane passerer. Den samla kommandoen stoppar deretter i den eksisterande story-integritetsporten på fem referansar frå `main`: `utoya`, `norges_hjemmefrontmuseum` og `operaen`.
- `git diff --name-only origin/main -- data/places data/stories`: ingen output. Batch 13 endrar ikkje place- eller story-data.
- `git diff --check`: **PASS**.

Den fullstendige terminalutskrifta og den separate duplikatrevisjonen er lagra i denne rapportmappa. PR-en skal vente på GitHub CI før merge.

Verifisert: `2026-07-18`.
