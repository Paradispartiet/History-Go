# Civication Psykologi Psykolog Role World rollout — source first

Dato: **2026-08-28**

## Canonical inngang

`data/Civication/roleWorldRolloutReadiness.json` på base `e8879b8e11f37f1ad01092c59a0df2380805f133` velger eksplisitt `psykologi/psykolog` som neste kontrollerte Role World-PR.

- classification: `rollout_ready`
- authored work required: **ingen (`[]`)**
- cross-role: `not_required_for_rollout`
- broad rollout-policy er grønn og eksisterende Scene Pipeline forblir canonical.

Dette er derfor ikke en PR som oppfinner manglende realisme. Readiness-auditoren bruker `authored_work_required` bare for dimensjoner med status `needs_role_authored_work`; Psykolog har allerede foundation-signaler for alle låste dimensjoner. Denne PR-en skal materialisere, binde og bevise den eksisterende komplette pakken som Role World uten å late som det finnes ny authored debt.

## Eksisterende pakke som skal bevares

Psykolog er allerede canonical playable med runtime gate, 14 complete Career Gameplay-komponenter og bare `practice_stories` som tillatt partial contract-komponent.

Eksisterende pakke:

- role model: `data/Civication/roleModels/psykologi/psykolog.json`
- work grammar: `data/Civication/workGrammars/psykologi/psykolog.json`
- mail plan: `data/Civication/mailPlans/psykologi/psykolog_plan.json`
- playability proof: `tests/civication-psykolog-rollout-playability.test.js`
- clinical ladder proof: `tests/civication-psychology-clinical-career-ladder.test.js`
- clinical evidence: `data/Civication/psychologyClinicalCareerEvidence.json`

Mailplanen har ni steg og bruker alle ni canonical mailtyper: `job`, `people`, `conflict`, `event`, `micro`, `story`, `knowledge`, `followup`, `consequence`. Rollouten skal ikke endre planen eller mailfamiliene.

## Hard authority / safety boundary

Disse grensene er ikke reputasjon eller narrativ pynt; de er canonicale kontrakter som skal forbli uendret:

- rollen krever eksplisitt norsk autorisasjon eller lisens som psykolog;
- History Go-poeng kan aldri erstatte autorisasjon/lisens;
- autorisasjon er ikke spesialistgodkjenning;
- psykologrollen gir ikke automatisk lovregulert vedtakskompetanse som `faglig ansvarlig`;
- behandling må være innen stilling, lovverk, virksomhetens forsvarlige rammer og egen kompetanse;
- taushetsbelagt informasjon kan ikke deles bare fordi team eller leder ønsker den;
- økt risiko, utilstrekkelig kompetanse eller manglende myndighet skal eskaleres til riktig kompetanse/eier.

`tests/civication-psychology-clinical-career-ladder.test.js` skal fortsatt bevise at Psykolog, Spesialistpsykolog, Fagansvarlig og Klinikkleder har distinkte kvalifikasjons-/utnevnelsesporter.

## De sju foundation-kontraktene som materialiseres

### 1. `persistent_work_object`

Det eksisterende kliniske forløpet bruker en stabil formulering-/plantråd. `followup` og `consequence` deler allerede `thread_key = psykologi_plan_001`. Role World-en binder denne til et vedvarende, editorial-only klinisk arbeidsobjekt: pasientens mål, foreløpig formulering, behandlingsplan, risikobilde, nødvendige handoffs og neste avgrensede spørsmål. Ingen ny runtime state introduseres.

### 2. `institution_authority`

Role model/work grammar har allerede eksplisitt `may`, `may_not` og `escalate_when`. Materialiseringen skal gjøre skillet mellom psykologens kliniske handlingsrom, veiledning/spesialistkompetanse, teamets oppgaver, lederens driftsansvar og særskilt lovregulert myndighet synlig uten å endre noen gate.

### 3. `rhythm_waiting_handoff_rework`

Den eksisterende ni-stegs kliniske dagen gir et naturlig forløp: nye opplysninger kan kreve venting før formulering lukkes; pasientens prioritet kan sende plan til rework; endret risiko kan kreve handoff/eskalering; journalformulering kan revideres; followup og consequence lar samme plan komme tilbake senere. Dette bindes eksplisitt i Role World-en uten ny dagmotor.

### 4. `history_go_affordance`

Work grammar bruker `psykologisk_institutt_uio` som canonical History Go-place, og knowledge-mailen er allerede en source-bounded History Go People-task. Playability-testen beviser at oppgaven peker på en canonical person/place og at profesjonshistorie **ikke** presenteres som klinisk beslutningsmyndighet. Role World-en skal bevare akkurat denne grensen.

### 5. `situated_reputation`

Standing materialiseres som audience-spesifikk og aldri som global score. Relevante authored audience-typer er blant annet pasient, tverrfaglig team, veilednings-/spesialistmiljø, driftsledelse, profesjonelle fagfeller og privat nærmiljø. Tillit kan påvirke samarbeid og senere narrativ respons, men kan aldri skape autorisasjon, spesialiststatus, taushetsgrunnlag eller lovregulert vedtakskompetanse.

### 6. `people_places_integrity`

Work grammar har ett canonical History Go-place og krever at kliniske arbeidsflater/nålevende pasienter er fiktive. Playability-testen avviser impersonasjon av canonical historiske personer i workplace mail og beviser at History Go-personen bare brukes som kildeforankret kunnskapsmål.

### 7. `provenance`

Role World-en skal bruke én eksakt canonical mailscene per plantype. Materializeren og strict testen løser scenen fra planens `allowed_families[0]` i riktig katalog, slik at provenance er låst til eksisterende authored mail og ikke en ny generisk fallback.

## Role World-kontrakt

Materialiseringen skal:

- bruke schema `civication_role_world_v1`, status `role_world_complete`;
- ha 14 dager × fire faser = 56 unike beats;
- ha `materialization.authored_dimensions: []` fordi canonical readiness har ingen authored debt;
- ha `materialization.foundation_dimensions_bound` med nøyaktig de sju dimensjonene over;
- bruke nøyaktig ni source refs, én fra hver eksisterende plantype;
- bevare 9-stegs mailplan, role model, work grammar, clinical ladder og Scene Pipeline;
- ha minst seks recurring archetypes, åtte slow axes, fem primary threads, fem private aftermath og seks delayed consequences;
- ha audience-spesifikk standing med `global_score_allowed: false`;
- ikke materialisere cross-role;
- ikke introdusere ny runtime, ny autorisasjonsmodell, ny reputation-motor eller parallell sceneformat.

## Fail-closed proof

Permanent state kan først skrives etter:

1. TEMP materialisering;
2. scene-registry regeneration/check;
3. Career Gameplay Matrix regeneration/check;
4. rollout readiness regeneration/check;
5. `tests/civication-psykolog-rollout-playability.test.js`;
6. `tests/civication-psychology-clinical-career-ladder.test.js`;
7. ny strict Psykolog Role World-test;
8. Professor + Forsker Role World precedent gates;
9. generic Role World contract + broad rollout-policy;
10. full `npm run test:civication`;
11. TEMP workflow/materializer fjernet før permanent commit.

Etter materialisering skal readiness vise minst 24 complete/pilot, maks 61 igjen, Psykolog skal være fjernet fra køen, og testen skal **ikke** hardkode hvilket køhode som kommer etterpå.

Rollouten er ikke ferdig før exact-head PR-CI, SHA-låst merge, post-merge Main integrity og Pages er grønne på composed `main`.
