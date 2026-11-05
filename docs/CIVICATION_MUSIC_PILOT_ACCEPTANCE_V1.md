# Civication – musikkpilot, kontinuitetsmatrise og akseptansekriterier (v1)

**Status 12. oktober 2026:** Produksjonskontrakt for første migreringspilot, **ikke** spillbar People-migrering. Kilde: tre faktiske continuation-pakker på `main` og de seks redaksjonelle kandidatene i PR #6283. Ingen runtime, History Go-canon, unlock, scenes, save-data eller faktisitetskontrakt endres her.

## 1. Hvorfor akkurat denne piloten

Piloten undersøker én spillerrolle, `musikk_frilansmusiker`, over tre eksisterende kapitler. Legacy-materialet inneholder **31 scener og 12 endings**:

| Dager | Kapittel-ID (stabil) | Scener | Endings | Dramaturgisk spørsmål |
| --- | --- | ---: | ---: | --- |
| 8–10 | `musikk_med_mira` | 10 | 3 | Vil spilleren gjennomføre ny prøve, arbeide selv eller ta pause? |
| 11–13 | `musikk_foresporselen` | 10 | 4 | Hvordan besvares en uforpliktende forespørsel fra en selvstendig booker? |
| 14–16 | `musikk_etter_foresporselen` | 11 | 5 | Hvilken av de tidligere beslutningene får ettervirkning? |

**Migreringsregelen er bevaring, ikke navnebytte.** Stable chapter-ID, gamle scene-ID-er, choice-ID-er, lagrede effekter og historiske arkivhendelser beholdes. Nye scenevarianter skal ha nye ID-er og en eksplisitt opprinnelsesmarkør. Navnet `mira` i legacy-flagg eller sender-ID betyr ikke at en virkelig People-person har opptrådt.

## 2. Aktører og avgrensning

| Aktør | Rolle i piloten | Autoritet |
| --- | --- | --- |
| Spilleren | Frilansmusiker; velger arbeid, pauser, opptreden, grenser | Canonical aktiv rolle og player choices |
| Eldre medmusiker (`mira`) | Bare legacy-konversasjonsaktør og save-historikk | Eksisterende fiktiv scene; skal ikke retroaktivt bli People |
| Booker (`booker`) | Selvstendig arrangør som spør om dag 16 og vilkår | Egen fiktiv/institusjonell aktør; ingen automatisk People-binding |
| History Go People | Dokumentert musikkhistorie, place og unlock-gate | Read-only canonical `person_id` og `placeId` |
| Ny sosial sceneaktør | Eventuell selvstendig tydelig fiktiv ensemble-/arrangørkontakt | Krever eget scenariovalg og relasjonshendelser |
| Fremtidig simulerte People | Ikke godkjent | Krever separat policy, visningsmerking, kronologi og arkivskille |

Med dagens `FACTUALITY_CONTRACT.md` §4.1 er Bugge Wesseltoft og Mari Boine **faglige People-referanser, ikke oppdiktede samtalepartnere**. Dette dokumentet autoriserer ikke noe annet.

## 3. Nøyaktig inngangs- og konsekvensmatrise fra kildefilene

| Tidspunkt | Source conditions / choices | Eksisterende videre tilstand | Akseptkrav |
| --- | --- | --- | --- |
| Dag 8 | `sett_gjennomfort=true` eller `{finnes:false}` | Samme tre valg: `prove`, `hjemme`, `pause` | Begge innganger bevares, også når tidligere sett uteble |
| Dag 9 | `musikk_videre_valg=prove` | `forbered`, `uten_nytt`, `avlys` | Materiale/avlysning er separate hendelser |
| Dag 10 | `mira_ny_prove_avtalt=true` og ikke avbrutt | `mira_ny_prove_gjennomfort=true` ved `spill` eller `snakk` | Avtalt er ikke det samme som gjennomført |
| Dag 10 | `mira_ny_prove_avbrutt=true` | Avlyst-hendelse og ny avgjørelse | Avlyst prøve kan ikke samtidig telles som gjennomført |
| Dag 10 | `musikk_videre_valg=hjemme/pause` | Selvstendig arbeid, notat, hvile | Ingen usynlig samtale eller kontaktpremie |
| Dag 11 | Gjennomført / avbrutt / ingen prøveavtale | Alle åpner booker-valg `avklar`, `avsta`, `vent` | Bookerforespørselen skjer uavhengig av People-vennskap |
| Dag 12 | `musikk_foresporsel_valg=avklar` | `hold` eller `avsta` | `hold` reserverer foreløpig dato; **ikke booking** |
| Dag 12 | `musikk_foresporsel_valg=avsta/vent` | Status `avsta` / `vent` | Aldri påstå oppdrag eller avtalt betaling |
| Dag 13 | `musikk_foresporsel_status=hold` | `behold` → `musikk_foresporsel_beholdt_hold`; `frigjor` → avslått | Beholder forbehold, med frist dag 14 kl. 12 |
| Dag 13 | `musikk_foresporsel_status=avsta/vent` | Avslått/uavklart flagg | Fravær av avklaring må kunne gi legitim fortsettelse |
| Dag 14 | `musikk_foresporsel_beholdt_hold/avslatt/uavklart` | `mira14_retning` etter faktisk choice | Bare korrekt utfall kan åpne senere scene |
| Dag 15 | `mira14_retning=avklar/mira/ro` | `mira15_retning=vilkar/kontakt/egen/slutt` | «Kontakt» er ikke automatisk vennskap |
| Dag 16 | `mira15_retning` | `mira16_grense/kontakt/egen/avsluttet` eller standard | Symposium viser valgt utfall, ikke alle mulige utfall |

**Særlig legacy-risiko:** `mira_*` og `mira14_retning`–`mira16_*` er navngitte **lagringsnøkler** og må bestå som historiske nøkler. De må aldri tolkes som `canonical_person_id`. Relasjonseffektene `relasjoner.mira` må ikke oversettes til `relasjoner.bugge_wesseltoft` eller `relasjoner.mari_boine` ved migrering.

## 4. To ulike People-faglige pilotvarianter

**PPL-M01 – Bugge Wesseltoft / `bugge_wesseltoft` / `blaa`**

- Rolleport: frilansmusiker, dokumentert People-unlock, og ny eksplisitt valgt faglig oppgave.
- Premiss dag 8–10: Spilleren utvikler egen skisse og velger å dokumentere en improvisert øving eller avgrense en versjon.
- Dag 11–13: Fiktiv booker spør etter spilletid, lyd, kreditering og faktisk innøvd materiale; tidligere opptak må foreligge før det kan nevnes.
- Dag 14–16: Program og tilrettelegging følger valgt skissestatus; spilleren kan sette grenser eller trekke seg.
- Symposium: People-funn ved Blå, eget opptak/øving, bookerens faktiske forespørsel, svar, eventuelt avlysning, utfall. Ingen uttalelser eller privat invitasjon fra Bugge.

**PPL-M02 – Mari Boine / `mari_boine` / `rockefeller`**

- Rolleport: samme canonical musikkrolle og selvstendig unlock, men **annet innhold**.
- Premiss dag 8–10: Spilleren vurderer egen komposisjon opp mot opphav, språk og dokumentert inspirasjonsgrunnlag.
- Dag 11–13: Fiktiv arrangør etterspør programtekst. Spilleren kan gjøre kildekontroll og presisere egen posisjon eller fjerne usikkert materiale.
- Dag 14–16: En senere krediterings-/programavgjørelse må følge den opprinnelige beslutningen; det finnes ingen kunstnerisk godkjenning fra Mari uten kildebevis.
- Symposium: People-funn ved Rockefeller, egen tekst og dokumentert kildesjekk, eget programvalg, arrangørrespons, faktisk utfall.

To People-unlocks gir altså **ikke samme historie med forskjellige navn**. Deres ulike historiske virke bestemmer faglig kontekst, mens spillerens handlinger bestemmer dramaet. Enhver faktisk sosial kontakt må ha en separat og korrekt merket aktør-/fiksjonskontrakt.

## 5. Akseptmatrise før første runtime-endring

| Test-ID | Gitt | Når | Kreves |
| --- | --- | --- | --- |
| M-01 | Spiller uten innsamlede People | Starter dag 8 | Kan spille eksisterende rolle-/grunnhistorie uten tildelt People-venn |
| M-02 | Bugge låst opp, Mari ikke | Åpner faglig oppgave | Bare Bugges relevante fagvariant er kvalifisert; ingen fiktiv «melding fra Bugge» |
| M-03 | Mari låst opp, Bugge ikke | Åpner faglig oppgave | Maris kilde-/krediteringsvariant, ikke Bugges produksjonsvariant |
| M-04 | Begge People låst opp | Velger spor | Spor valgbare individuelt; verken relasjon eller fortelling byttes i aktivt kapittel |
| M-05 | Ny prøve akseptert dag 8 | Avlyser dag 9 | Dag 10 er avlyst; dag 11 bokeren kan spørre uten å late som prøven fant sted |
| M-06 | Arbeid alene / pause | Kommer til dag 11 | Egenhistorien består; ingen tvungne møter |
| M-07 | `avklar` dag 11, `hold` dag 12 | Kommer til dag 14 | Bare foreløpig hold; ingen kontrakt, betaling eller sikker oppføring |
| M-08 | Avslår bookerforespørsel | Kommer til dag 14–16 | Avslått behandling, ikke bekreftet sceneopptreden |
| M-09 | Åpner et gammelt save med `mira`/navnede flags | Fortsetter | Legacy-relasjon, choices, scene-ID-er og Symposium beholdes uendret |
| M-10 | People samles etter dag 10/14 | Fortsetter | Ingen retroaktiv dialog, møte, booking eller tilskrevet vennestatus |
| M-11 | Spiller setter avstand / utsetter | Nytt kapittel | Avstanden bevares; ny kontakt krever ny hendelse og godkjenning |
| M-12 | Aktiv musikkfortelling + annen jobb-/livsposisjon | Kjører scenegater | Karriere, privatliv, lønn og relasjoner holdes adskilt; ingen gratis jobbstatus |
| M-13 | Simuleringspolicy fortsatt ikke godkjent | Starter People-inspirert aktivitet | Bare faktakort og separate fiktive aktører er mulige; ingen navngitt People-dialog |
| M-14 | Sammenligner Symposium og historikk | Etter et kapittel | Faktisk valgt scene/choice og begrunnet ettervirkning; kilder støtter fakta, aldri fiktive hendelser |

## 6. Implementeringsrekkefølge og stopppunkter

1. Frys de tre eksisterende musikkapakkene og noter alle lagrings-/choice-ID-er. Ikke endre dem på bakgrunn av denne pilotspesifikasjonen.
2. Registrer eksplisitt policyvedtak om eventuell simulering av navngitte virkelige personer, særskilt for nålevende og avdøde. **Uten vedtak går piloten kun i faktabasert People-kontekst med separate fiktive aktører.**
3. Definer read-only adapter fra virkelig History Go unlock til faglig varianttilgang. Ikke gjenbruk legacy `personRepresentanter` eller skjult relasjonsbootstrap.
4. Lag **nye** musikkpilotscener etter to forskjellige synopsiser og innfør en egen aktørtype for fiktiv sosial kontakt. Ikke klon gamle replikker.
5. Verifiser M-01–M-14, samt eksisterende Civication-/History Go-regresjoner. Ingen merge av runtime før disse er bevist.
6. Først deretter utvid til prosjekt og miljø, og senere til C01–C24.

**Begrepsdisiplin:** «Synopsis skrevet» ≠ «scene produsert» ≠ «integrert» ≠ «testet spillbar» ≠ «godkjent for merge». Et redaksjonelt atlas må aldri vises som levert spillinnhold.
