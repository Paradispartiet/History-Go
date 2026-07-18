# Etne People of Places batch 15 — Sølve Funderud ved Skånevik discgolf

## Resultat

Batchen legg til éin namngjeven initiativtakar med ei eksplisitt dokumentert fysisk kopling til eitt tidlegare udekt sportsanlegg. Ingen place-recordar blir oppretta eller endra.

| peopleId | person | fysisk hovudanker | dokumentert fysisk kopling |
|---|---|---|---|
| `solve_funderud` | Sølve Funderud | `skanevik_discgolf` | Etne kommune omtalar Funderud som «primus motor» og viser han fysisk på bana som rettleiar; Skånevik IL sine årsmøtepapir fører han som ein av dei namngjevne initiativtakarane. |

## Fersk main-audit før skriving

- `main`: `b09085ac5` (`Add Etne People of Places batch 14 (#2333)`)
- Aktive Etne-stader: `81`
- Stader med minst éin aktiv person før batch 15: `55`
- Stader utan person før batch 15: `26`
- Canonical people-filer i manifestet før batchen: `543`
- Canonical people-oppføringar før batchen: `1 114`
- Kandidat-ID-en og variantane `Sølve Funderud`, `Sølve W. Funderud`, `Solve Funderud`, `Soelve Funderud`, `Sölve Funderud` og `Solvi Funderud` gav `0` canonical treff før skriving. Eit fulltekstsøk etter etternamnet `Funderud` gav òg `0` treff i people-data før batchen.
- Batchen legg til `1` ny people-ID, `1` ny people-fil og `0` nye place-recordar.

Etter batchen får `skanevik_discgolf` si første aktive people-lenkje. Dekninga blir `56/81`, og restgjelda blir `25` Etne-stader utan people-anker.

## Kjeldegrunnlag

Etne kommune sitt eige formidlingsinnslag dokumenterer den avgjerande person- og stadkoplinga: Sølve Funderud blir omtalt som «primus motor» og er fysisk på Skånevik discgolf medan han rettleier kommunelegen gjennom løypa.

Skånevik Idrettslag sine signerte årsmøtepapir frå 2026 dokumenterer Funderud som forslagsstillar for å ta Skånevik Discgolf inn som eiga gruppe i idrettslaget. I avtaleteksten blir Sølve Funderud og Frederic Bull-Tornøe namngjevne som initiativtakarar. Dokumentet stadfestar dermed at Funderud si rolle gjeld sjølve det konkrete anlegget, ikkje eit generelt idrettsverv.

Etne kommune si stadanalyse for Skånevik sentrum dokumenterer at 18-holsbana opna i 2023, vart bygd på dugnad og fekk støtte frå Ildsjelfondet, lokale sponsorar og kommunen. Denne kjelda gir den fysiske byggje- og årskonteksten, men blir ikkje brukt til å påstå at Funderud utførte alt arbeidet.

Kjelder:

- https://www.instagram.com/p/DLnVuEgIm_2/
- https://skaanevikidrettslag.no/__static/jdj5jdewjhdoszkus0vbszqxmem2skza/Skanevik-Idrettslag-Sakliste-Arsmote-2026_komplett-med-sakspapirer.pdf
- https://www.etne.kommune.no/_f/p1/iaed56af7-0455-47a7-9d42-e1ae9bcae881/stadanalyse-2025.pdf

## Streng utvalsport

- Funderud er ikkje teken inn berre fordi han har eit noverande verv eller er kontaktperson. Kjeldene dokumenterer både initiativtakarrolle og fysisk aktivitet på den canonical bana.
- Kommunen si formulering «primus motor» blir støtta av idrettslaget sitt eige dokument, som namngir Funderud i initiativtakarleddet.
- Kortet påstår ikkje at Funderud var einegrunnleggjar, at han åleine bygde bana eller at han stod bak alle dugnads-, sponsor- eller kommunebidraga.
- Dei andre personane i kommunen sitt formidlingsinnslag blir ikkje lagde til berre fordi dei demonstrerte eller brukte bana.
- Året 2023 er dokumentert som opningsår for det fysiske anlegget og blir ikkje overført frå eit organisasjonsregister.

## Integrasjonskontrakt

- `solve_funderud` skal finnast nøyaktig éin gong globalt, også ved normalisert ID-, namn- og variantkontroll.
- Personen skal berre peike på `skanevik_discgolf`.
- People-manifestet skal registrere `people/sport/vestland/etne/people_skanevik_discgolf_batch1.json` nøyaktig éin gong.
- `tests/etne-people-of-places-batch15.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-data, story-data, UI, bilete eller quizdata.

## Lokal validering

- `node tests/etne-people-of-places-batch15.test.js`: **PASS** — éin namngjeven initiativtakar, éi nydekt fysisk discgolfbane og éin canonical identitet.
- `bash scripts/check-people.sh`: **PASS** — 1 115 people-ID-ar, 1 115 unike, 0 ugyldige place-referansar og grøne Etne batch 9–15-testar.
- `npm run typecheck`: **PASS**.
- `npm run tools:check`: place-, koordinat-, emne-, i18n-, leksikon- og aliasportane passerer. Den samla kommandoen stoppar deretter i den eksisterande story-integritetsporten på fem referansar frå `main`: `utoya`, `norges_hjemmefrontmuseum` og `operaen`.
- `git diff --name-only -- data/places data/stories`: ingen output. Batch 15 endrar ikkje place- eller story-data.
- `git diff --check`: **PASS**.

Fullstendig terminalutskrift og separat duplikatrevisjon er lagra i denne rapportmappa. PR-en skal vente på GitHub CI før merge.

Verifisert: `2026-07-18`.
