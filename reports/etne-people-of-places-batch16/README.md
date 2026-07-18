# Etne People of Places batch 16 — arbeidsleiinga bak Skånevik kunstgras

## Resultat

Batchen legg til to namngjevne personar med eksplisitt dokumentert arbeidsleiing ved eitt tidlegare udekt fysisk idrettsanlegg. Ingen place-recordar blir oppretta eller endra.

| peopleId | person | fysisk hovudanker | dokumentert fysisk kopling |
|---|---|---|---|
| `leif_bjornar_larsen` | Leif Bjørnar Larsen | `skanevik_idrettsanlegg` | Skånevik IL takkar Larsen og Torleiv Sydnes særskilt som dei som leidde arbeidet med den nye kunstgrasbana. |
| `torleiv_sydnes` | Torleiv Sydnes | `skanevik_idrettsanlegg` | Skånevik IL takkar Sydnes og Leif Bjørnar Larsen særskilt som dei som leidde arbeidet med den nye kunstgrasbana. |

## Fersk main-audit før skriving

- `main`: `e200d056d` (`Add Etne People of Places batch 15 (#2337)`)
- Aktive Etne-stader: `81`
- Stader med minst éin aktiv person før batch 16: `56`
- Stader utan person før batch 16: `25`
- Canonical people-filer i manifestet før batchen: `544`
- Canonical people-oppføringar før batchen: `1 115`
- ID-ane og variantane `Leif Bjørnar Larsen`, `Leif Bjornar Larsen`, `Leif B. Larsen`, `Leif Bj. Larsen`, `Torleiv Sydnes` og `T. Sydnes` gav `0` canonical treff før skriving.
- `skanevik_idrettsanlegg` hadde `0` people-lenkjer før batchen.
- Batchen legg til `2` nye people-ID-ar, `1` ny people-fil og `0` nye place-recordar.

Etter batchen får `skanevik_idrettsanlegg` sine første aktive people-lenkjer. Dekninga blir `57/81`, og restgjelda blir `24` Etne-stader utan people-anker.

## Kjeldegrunnlag

Skånevik Idrettslag si årsmelding for 2025 dokumenterer opninga av den nye kunstgrasbana og gir ein særleg takk til Leif Bjørnar Larsen og Torleiv Sydnes, som leidde arbeidet. Formuleringa dokumenterer ei konkret prosjektrolle ved det fysiske anlegget og er sterkare enn eit generelt styre-, trenar- eller kontaktverv.

Etne kommune sitt eige formidlingsinnslag dokumenterer at den nye kunstgrasbana i Skånevik vart opna laurdag 21. juni 2025. Norges Fotballforbund fører Skånevik Kunstgras og Skånevik stadion som baner under same klubbanlegg. Dette samsvarer med canonical place-recorden, som samlar naturgras- og kunstgrasbanene i `skanevik_idrettsanlegg` og held uteanlegget skilt frå kultur- og idrettshallen.

Kjelder:

- https://skaanevikidrettslag.no/__static/jdj5jdewjhdoszkus0vbszqxmem2skza/Skanevik-Idrettslag-Sakliste-Arsmote-2026_komplett-med-sakspapirer.pdf
- https://www.instagram.com/p/DLQWXocs2s1/
- https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=820

## Streng utvalsport

- Begge personane er namngjevne i idrettslaget si eiga årsmelding som dei som leidde arbeidet med den konkrete kunstgrasbana.
- Kjelda fordeler ikkje oppgåver mellom Larsen og Sydnes og gir dei ingen formell prosjekttittel. Kortet bruker derfor berre den dokumenterte formuleringa «leidde arbeidet».
- Ingen av korta påstår eineleiing, at dei utførte alt byggjearbeidet eller at dei stod bak alle økonomiske bidrag.
- Dagens spelarar, trenarar, styremedlemmer og kontaktpersonar blir ikkje lagde til berre fordi dei bruker eller administrerer anlegget.
- Opningsåret 2025 er dokumentert for den fysiske kunstgrasbana og kan brukast utan å overføre eit organisasjonsår til anlegget.

## Integrasjonskontrakt

- `leif_bjornar_larsen` og `torleiv_sydnes` skal kvar finnast nøyaktig éin gong globalt, også ved normalisert ID-, namn- og variantkontroll.
- Begge skal berre peike på `skanevik_idrettsanlegg`.
- People-manifestet skal registrere `people/sport/vestland/etne/people_skanevik_idrettsanlegg_batch1.json` nøyaktig éin gong.
- `tests/etne-people-of-places-batch16.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-data, story-data, UI, bilete eller quizdata.

## Lokal validering

- `node tests/etne-people-of-places-batch16.test.js`: **PASS** — to namngjevne arbeidsleiarar, eitt nydekt fysisk uteanlegg og to canonical identitetar.
- `bash scripts/check-people.sh`: **PASS** — 1 117 people-ID-ar, 1 117 unike, 0 ugyldige place-referansar og grøne Etne batch 9–16-testar.
- `npm run typecheck`: **PASS**.
- `npm run tools:check`: place-, koordinat-, emne-, i18n-, leksikon- og aliasportane passerer. Den samla kommandoen stoppar deretter i den eksisterande story-integritetsporten på fem referansar frå `main`: `utoya`, `norges_hjemmefrontmuseum` og `operaen`.
- `git diff --name-only -- data/places data/stories`: ingen output. Batch 16 endrar ikkje place- eller story-data.
- `git diff --check`: **PASS**.

Fullstendig terminalutskrift og separat duplikatrevisjon er lagra i denne rapportmappa. PR-en skal vente på GitHub CI før merge.

Verifisert: `2026-07-18`.
