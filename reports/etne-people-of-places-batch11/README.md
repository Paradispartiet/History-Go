# Etne People of Places batch 11 — stiftarane av Norsk Motormuseum

## Resultat

Batchen legg til tre canonical personar med eksplisitt dokumentert stiftarrolle ved eitt aktivt, fysisk Etne-stad:

| peopleId | person | placeId | dokumentert stadskopling |
|---|---|---|---|
| `ove_wiland` | Ove Wiland | `norsk_motormuseum_skanevik` | Medstiftar i 1986; seinare innsamlar, styremedlem og formidlar ved museet. |
| `paul_hovda` | Paul Hovda | `norsk_motormuseum_skanevik` | Namngitt medstiftar av museet i 1986. |
| `gudvin_hovda` | Gudvin Hovda | `norsk_motormuseum_skanevik` | Namngitt medstiftar av museet i 1986. |

## Fersk main-audit før skriving

- `main`: `4c1bc18a6012b6097af09040de721e7bed8d841b`
- Aktive Etne-stader: `78`
- Stader med minst éin aktiv person: `52`
- Stader utan person før batch 11: `26`
- Normalisert søk etter ID, namn, omvend namnerekkjefølgje og namnevariantar gav `0` canonical treff.
- Ingen nye place-filer vart oppretta eller endra.

Etter batchen får `norsk_motormuseum_skanevik` sine første aktive personlenkjer. Dekninga blir `53/78`, og restgjelda blir `25` Etne-stader utan person.

## Kjeldegrunnlag

Kyrkjeposten si reportasje frå Norsk Motormuseum seier uttrykkeleg at museet vart stifta i 1986 av Ove Wiland, Paul Hovda og Gudvin Hovda med hjelp frå Etne kommune. Same reportasje plasserer stiftinga og samlingsarbeidet i museumsbygningen i Skånevik.

Etne kommune sin kulturmiljøplan stadfestar at Norsk Motormuseum vart stifta i 1986, at det er eit dugnadsdrive dokumentarmuseum, og at museet tok over den tidlegare verkstadbygningen. Skånevik Fjordhotel si lokale oversikt stadfestar stiftingsåret og museumsfunksjonen. For Ove Wiland dokumenterer museet i tillegg det langvarige arbeidet hans med innsamling, styrearbeid og formidling.

Kjelder:

- https://www.etne.kyrkja.no/Portals/0/Kyrkjeposten%20sept%2021.pdf
- https://www.etne.kommune.no/organisasjon/planar-og-strategiar/kommunedelplan-for-kulturmiljo-2022-2026/kulturmiljoplan/del-2-kunnskapsgrunnlaget/
- https://www.fjordhotellet.no/aktivitetar
- https://www.facebook.com/norskmotormuseum/photos/a.197011757297242/405623769769372/?type=3

## Streng utvalsport

- Dei tre stiftarane er tekne med fordi kjelda namngir dei i den konkrete etableringa av museet.
- Dagens styre, leiar og kontaktpersonar er ikkje brukte som standardankre for institusjonen.
- Lars Ebne og andre seinare museumsleiarar er ikkje tekne med i denne stiftarbatchen.
- Ragnar Knudsen og Anders Hovda er knytte til den tidlegare industrihistoria i bygningen, men ikkje dokumenterte som museumsstiftarar i dei brukte kjeldene.
- Ingen person er lagd inn berre fordi vedkomande har samla motorar, vore omtalt i Skånevik eller hatt ei generell organisasjonsrolle.

## Integrasjonskontrakt

- Datafila skal stå nøyaktig éin gong i `data/people/manifest.json`.
- Alle tre ID-ar skal vere globalt unike.
- `placeId` og `places` skal berre peike på `norsk_motormuseum_skanevik`.
- `tests/etne-people-of-places-batch11.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-data, UI, bilete eller quizdata.

## Lokal validering

- `bash scripts/check-people.sh`: **PASS** — 1 112 people-ID-ar, 1 112 unike, 0 ugyldige place-referansar og grøne Etne batch 9/10/11-testar.
- `npm run typecheck`: **PASS**.
- `npm run tools:check`: place-, koordinat-, emne-, i18n-, leksikon- og aliasportane passerer. Den samla kommandoen stoppar deretter i den eksisterande story-integritetsporten på fem referansar frå `main`: `utoya`, `norges_hjemmefrontmuseum` og `operaen`.
- `git diff --name-only origin/main -- data/places data/stories`: ingen output. Batch 11 endrar ikkje filene som utløyser den repo-breie restgjelda.

Den fullstendige terminalutskrifta er lagra i denne rapportmappa. PR-en skal framleis vente på GitHub CI før merge.

Verifisert: `2026-07-18`.
