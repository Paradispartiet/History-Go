# Civication Psykologi Fagansvarlig Role World rollout — source-first

Dato: **2026-08-28**

## Autoritativ scope

- Rolle: `psykologi/fagansvarlig`
- Canonical readiness ved oppstart: `rollout_ready`
- Gjenstående authored dimensions: `rhythm_waiting_handoff_rework` og `situated_reputation`
- Cross-role: `not_required_for_rollout`; ingen shared work object skal konstrueres for å tilfredsstille et ikke-krav.
- Eksisterende Scene Pipeline, Career Runtime, mailplan, roleModel og work grammar forblir autoritative.
- Ingen ny runtime-state, ingen parallell scenemotor og ingen endring av klinisk eller lovregulert myndighet.

## Eksisterende kilder som skal gjenbrukes

Rollen har allerede en komplett runtime-pakke med åtte plansteg og ni authored mailtyper. Role World-en skal derfor materialisere eksisterende arbeid som én langsom faglig kvalitetsverden i stedet for å omskrive mailene.

Provenance-scener:

1. `data/Civication/mailFamilies/psykologi/job/fagansvarlig_job.json#psykologi_fagansvarlig_job_avvik_001`
2. `data/Civication/mailFamilies/psykologi/people/fagansvarlig_people.json#psykologi_fagansvarlig_people_skjonn_001`
3. `data/Civication/mailFamilies/psykologi/conflict/fagansvarlig_conflict.json#psykologi_fagansvarlig_conflict_veiledning_001`
4. `data/Civication/mailFamilies/psykologi/knowledge/fagansvarlig_knowledge.json#psykologi_fagansvarlig_knowledge_myndighet_001`
5. `data/Civication/mailFamilies/psykologi/event/fagansvarlig_event.json#psykologi_fagansvarlig_event_implementering_001`
6. `data/Civication/mailFamilies/psykologi/micro/fagansvarlig_micro.json#psykologi_fagansvarlig_micro_indikator_001`
7. `data/Civication/mailFamilies/psykologi/followup/fagansvarlig_followup.json#psykologi_fagansvarlig_followup_avvik_001`
8. `data/Civication/mailFamilies/psykologi/story/fagansvarlig_story.json#psykologi_fagansvarlig_story_retning_001`
9. `data/Civication/mailFamilies/psykologi/consequence/fagansvarlig_consequence.json#psykologi_fagansvarlig_consequence_avvik_001`

`followup` og `consequence` deler allerede `thread_key: psykologi_fagansvarlig_avvik_001`. Dette brukes som editorial continuity-bevis, men skal ikke omdefineres til et nytt runtime-work-object.

## Rhythm-kontrakt

Rollouten skal gjøre fem trekk eksplisitte gjennom 14 dager:

1. **Waiting** — kvalitetsarbeid må kunne stå i ventetilstand mens data, mandat, kapasitet eller ny måling mangler. Venting er en reell arbeidsfase, ikke en skjult timeout eller automatisk suksess.
2. **Handoff** — avvik, prosedyre, veiledningssignal, implementeringsbehov og måledefinisjon må kunne overleveres med tydelig eier, siste bekreftede status og åpent spørsmål.
3. **Rework** — funn, prosedyrer og anbefalinger må kunne returnere for ny avgrensning uten at retur blir tolket som straff eller statustap.
4. **Interruption** — nye avvik, ressursbeslutninger og myndighetsgrenser kan avbryte planlagt forbedringsarbeid uten at fagansvarlig automatisk overtar andre roller.
5. **Delayed consequence** — et tiltak vurderes først etter at rettidighet, bivirkning og reservekapasitet faktisk kan observeres.

Den eksisterende 8-trinns mailplanen beholdes uendret. Role World-en bygger langsom kontinuitet rundt den, ikke en ny beslutningskvote.

## Situated reputation-kontrakt

Det skal ikke finnes én global reputation-score. Standing er audience-spesifikk og kan divergere mellom minst disse publikummene:

- **klinikerne** — bryr seg om faglig rom, tydelig minimumsstandard, rettferdig rework og at individuell profesjonsmyndighet respekteres;
- **organisatorisk ledelse** — bryr seg om styrbar risiko, kapasitet, sporbar fremdrift og at ressursbehov blir synlige;
- **kvalitets- og forbedringspartnere** — bryr seg om målevaliditet, årsaksnøkternhet, eierskap og læringssløyfer;
- **veiledningsmiljøet** — bryr seg om at usikkerhet kan undersøkes uten å bli skjult prestasjonsrangering;
- **implementeringsteam** — bryr seg om realistisk opplæring, ventetid, støtte og tydelige handoff-punkter;
- **private relasjoner** — bryr seg om at faglig status og organisatorisk uro ikke blir hele personens identitet hjemme.

Ingen form for standing kan gi diagnose-/behandlingsmyndighet, lovregulert vedtakskompetanse, ressursbeslutningsmyndighet eller rett til å overstyre en klinikers individuelle profesjonsansvar.

## Sikkerhets- og myndighetsgrense

Role World-en skal gjenta, ikke svekke, eksisterende canonicale grenser:

- Civication-tittelen `Fagansvarlig` er ikke den lovregulerte rollen «faglig ansvarlig» etter psykisk helsevernloven.
- Rollen kan koordinere kvalitet, prosedyrer, kompetanse, avviksanalyse og eskalering innen arbeidsgiverens mandat.
- Rollen kan ikke diagnostisere eller behandle uten separat profesjonskompetanse og klinisk mandat.
- Rollen kan ikke fatte lovregulerte vedtak uten særskilt kvalifikasjon, praksis og formell utpeking.
- Rollen kan ikke bruke lokal prosedyre eller sosial/faglig standing som erstatning for en klinikers individuelle ansvar.

## Personvern og fiksjonsgrense

Role World-en handler om **anonymiserte kvalitets- og arbeidsflytsignaler**, ikke pasienthistorier. Ingen pasientidentifiserbare opplysninger, behandlingsråd eller fiktive kliniske vedtak skal materialiseres. De tre eksisterende arbeidsflatene forblir eksplisitt `fictionalized_work_surface`.

## Completion proof

PR-en kan bare regnes som ferdig når:

- 14 dager × 4 faser = 56 unike beats er materialisert;
- rhythm-bevisene dekker waiting, handoff, rework, interruption og delayed consequence;
- situated reputation har separate audiences og forbyr global score;
- alle ni eksisterende mail-scener er eksakt provenance;
- den eksisterende 8-trinns plan- og myndighetskontrakten er uendret;
- Career Matrix fortsatt viser rollen `playable` med `runtime_gate: true`;
- readiness fjerner `psykologi/fagansvarlig` fra rollout-køen og beholder bred kontrollert rollout grønn;
- full Civication-suite passerer;
- TEMP-materializer og TEMP-workflow er fjernet før permanent commit;
- ordinary exact-head PR-CI, merge, Main integrity og Pages er grønne på GitHub.
