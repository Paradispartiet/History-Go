# Civication v0.1 reference loop polish

Oppdatert: 2026-07-01

## Omfang

Denne polish-runden dekker de tre `complete_reference_v2`-rollene som skal være første spillbare referanseløype i v0.1:

- Arealplanlegger (`by/by_radgiver_plan`)
- Renholder (`naeringsliv/renholder`)
- Barnehageassistent (`sosial_laering/barnehageassistent`)

Avgrensningen er bevisst liten: ingen ny motor, ingen nye rollepakker, ingen FWG-arkitekturendring og ingen endring i NextAction-eierskapet. NextAction er fortsatt eneste aktive svarflate; Innboks er arkiv/detalj/handover; Dagens fase er status/progresjon.

## QA-kontrakt

- Én tydelig aktiv NextAction per spilløyeblikk: valgt av `CivicationNextActionSelector` og besvart i `CivicationNextActionUI`.
- Innboks viser åpne saker som «Håndteres i Neste handling» / handover, ikke egne svarvalg.
- Dagens fase viser fase, progresjon og vei til NextAction, ikke primære valg.
- MailPlan `allowed_families` peker til konkrete mailfamilier; referanserollene skal ikke lekke fallback-valg i Day 1.
- `broken_mapping` står fortsatt på 0 i rollepakkeindeksen.
- Day 1 skal leses som én arbeidshistorie med åpning, arbeidspress, sosial/faglig konflikt, ettermiddags-/kveldslanding og carryover mot neste dag.

## Arealplanlegger — første spilldag

Rollefortelling: «Linjen på kartet» — spilleren lærer at én tilsynelatende ryddig kartlinje flytter verdi, ansvar, skolevei, grøntdrag, støy og politisk lesbarhet.

| Fase | Day 1-funksjon | Aktiv rytme |
| --- | --- | --- |
| Morgen | Åpner Lillebekk-saken med plankart, linje og juridisk/faglig forberedelse. | Story/people/micro etablerer hvorfor kartet ser ryddigere ut enn saken er. |
| Formiddag | Første faglige sakslesning. | Jobbmailer gjør plankart, anbefaling og politisk bylivsspørsmål konkrete. |
| Arbeidsdag | Hovedleveranse og fristpress. | Jobb, event og followup tvinger fram tydelig avveiing før utvalgsfrist. |
| Lunsj | Kort sosial/faglig avklaring. | Fasekort og people/micro-mail lar spilleren se at også uformelle avklaringer påvirker saken. |
| Ettermiddag | Utbygger, nabo og praktiske avveiinger presser saken fra flere kanter. | People/micro holder NextAction konkret: signal, grønnstruktur, sol/skygge og nabokunnskap. |
| Kveld | Saken lander i læring og konsekvens. | Kveldsmailer viser at juridisk presisjon og politisk lesbarhet er carryover, ikke pynt. |
| Dagslutt | Dagen oppsummeres og carryover låses. | Day-end-slottene oppsummerer arbeid, score, rolleprogresjon, hvile og hva som må følges opp neste dag. |

Kontrollpunkt: Day 1 har deterministiske ankere for morgenbrief, plankart, utvalgsfrist, followup, lunsj-person, utbygger og evening consequence. Ingen dobbelt svarflate er nødvendig for å spille dagen.

## Renholder — første spilldag

Rollefortelling: «Rommet må være klart før noen vet at du var der» — spilleren lærer forskjellen på synlig rent og hygienisk trygt, og at kroppen og verdigheten ikke skal betale for dårlig drift.

| Fase | Day 1-funksjon | Aktiv rytme |
| --- | --- | --- |
| Morgen | Rommet som ser rent ut åpner faget. | Første NextAction bør peke på soner, berøringspunkter og smittevern framfor ren synlighet. |
| Formiddag | Berøringspunkter og hygieneprioritering blir konkrete. | Jobb/private praksisfortellinger viser at små flater og små snarveier får stor effekt. |
| Arbeidsdag | Tidspresset kommer inn. | Spilleren må velge mellom tempo, standard, avvik og kroppslig belastning. |
| Lunsj | Pustepunkt uten å miste driftsblikket. | Innboks kan vise arkiv/detalj, men svar håndteres fortsatt i NextAction. |
| Ettermiddag | Kjemikalier, rombruk og servicepress gjør renholdet synlig. | Konkrete valg handler om riktig metode, høflig grense og HMS. |
| Kveld | Kroppen etter dagen og faglig stolthet synliggjøres. | Kvelden bør lande i læring/followup/consequence om ergonomi, avvik eller verdighet. |
| Dagslutt | Carryover mot neste vakt. | Day-end-copy skal minne om risikoflater, tidsavvik og hva som må meldes videre. |

Kontrollpunkt: Renholder-planen bruker konkrete praksisfortelling-familier med tomme `fallback_types`, så Day 1 skal ikke hente generiske fallback-valg. Runtime-testen dekker full dag og flere mailtyper.

## Barnehageassistent — første spilldag

Rollefortelling: «Den lange dagen på avdelingen» — spilleren lærer at omsorg er praksis under tidspress: overgang, frilek, måltid, forelder, observasjon, slitasje og egen profesjonell grense.

| Fase | Day 1-funksjon | Aktiv rytme |
| --- | --- | --- |
| Morgen | Levering og første overgang. | Barnet slipper ikke hånden; spilleren må være trygg voksen før dagen har kommet i gang. |
| Formiddag | Barnet, forelder og frilek blir lesbare som arbeid. | People/story/job/micro gjør observasjon og overgang mer konkret enn magefølelse. |
| Arbeidsdag | Frilek, hvile, konflikt og vikarpress viser avdelingsarbeidet. | NextAction er konkret valgflate for gruppeledelse, observasjon og trygg base. |
| Lunsj | Relasjonelt pustepunkt. | Måltid/kollega/barn-relasjon og fasekort holder status uten å lage egen svarflate. |
| Ettermiddag | Lav bemanning og slitasje blir tydelig. | Mikrovalg og people-mail viser hvordan forelder, vikar, måltid og overgang henger sammen. |
| Kveld | Læring og oppfølging. | Kveld lander i followup/kunnskap/konsekvens om hva slags voksen spilleren ble under press. |
| Dagslutt | Omsorg som praksis oppsummeres. | Day-end og carryover spør hva som må huskes om trygghet, observasjon og voksenrollen neste dag. |

Polish-justering: FWG `place_grammar` er utvidet med tre små, konkrete barnehagerom/arbeidsflater (`måltidsbord`, `stellerom`, `hentebenken`) slik at Day 1-rapporten og testen har samme romlige presisjon som de andre referanserollene. Dette er ikke en ny rollepakke og endrer ikke runtime.

## Svarflate- og fallback-status

| Kontroll | Status |
| --- | --- |
| Én aktiv NextAction | OK — NextAction er fortsatt eneste klikkbare svarflate for progresjon. |
| Innboks | OK — arkiv/detalj/handover, ikke dobbelt svarflate. |
| Dagens fase | OK — status/progresjon og «gå til neste handling», ikke inline mailvalg. |
| Konkrete valg | OK — referanserollene har konkrete mailfamilier; Renholder har tomme fallback-lister i praksisfortelling-planen. |
| Mailer matcher FWG | OK — rollepakke-testene validerer roleModel, FWG, mailPlan, mailFamilies og required mail fields. |
| Day 1-fortelling | OK — alle tre dekker full dag fra morgen til dagslutt med tydelig narrativ bue. |
| Carryover | OK — day_end/carryover-slottene finnes og peker framover. |
| Dobbelt svarflate | OK — NextAction-lock-testene dekker NextAction, Dagens fase og Innboks. |
| `broken_mapping` | OK — rollepakkeindeksen står på `broken_mapping: 0`. |

## Kjørte kontroller

- `node tests/civication-arealplanlegger-mail-plan.test.js` — passerer og skriver Day 1 audit map.
- `node tests/civication-renholder-mail-plan.test.js` — passerer rollepakke-/Day 1-kontrakt.
- `node tests/civication-barnehageassistent-mail-plan.test.js` — passerer og skriver Day 1 audit map.
- `node tests/civication-next-action-consolidation.test.js` — passerer NextAction/Dagens fase/Innboks single-owner-kontrakt.
- `node tests/civication-inbox-top-action-open-status.test.js` — passerer Innboks handover-kontrakt.
- `node tests/civication-day-phase-single-owner.test.js` — passerer Dagens fase single-owner-kontrakt.
- `npm run test:civication -- --runInBand` — passerer full Civication-suite.
