# Civication rolle-skole Codex-prompter

Dette dokumentet inneholder detaljerte Codex-prompter for videre arbeid med Civication-roller.

Fast prinsipp:

```text
ChatGPT kuraterer og skriver det faglige innholdet først.
Codex strukturerer, setter inn, validerer og rapporterer.
Codex skal ikke oppdage nye roller eller finne opp ny faglighet alene.
```

Rollebygging skal være sosiologisk presis. Hver jobb skal fungere som en liten skole i arbeidslivet: spilleren skal lære praksis, makt, hierarki, institusjoner, taus kunnskap, dilemmaer og overførbare ferdigheter.

Humor, absurditet og twists kan legges til senere. Første pass skal være faglig korrekt og datamessig ryddig.

---

## Prompt 1 — Audit av én eksisterende rollepakke

Bruk denne når en rolle allerede finnes og du vil vite hva som mangler.

```text
Du skal gjøre en read-only audit av én Civication-rollepakke i History-Go-repoet.

Rolle:
- role_id: <ROLE_ID>
- role_scope: <ROLE_SCOPE>
- category: naeringsliv

Viktig:
- Ikke endre filer.
- Ikke lag ny rolledata.
- Ikke finn opp ny faglighet.
- Les faktiske kildefiler før du konkluderer.

Sjekk disse filene hvis de finnes:
- data/Civication/roles/naer_<ROLE_SCOPE>.json
- data/Civication/jobLearningProfiles.json
- data/Civication/mailPlans/naeringsliv/<ROLE_SCOPE>_plan.json
- data/Civication/mailFamilies/naeringsliv/job/<ROLE_SCOPE>_intro_v2.json
- data/Civication/mailFamilies/naeringsliv/job/<ROLE_SCOPE>_job.json
- data/Civication/mailFamilies/naeringsliv/conflict/<ROLE_SCOPE>_conflict.json
- data/Civication/mailFamilies/naeringsliv/story/<ROLE_SCOPE>_story.json
- data/Civication/mailFamilies/naeringsliv/event/<ROLE_SCOPE>_event.json
- relevante validatorer/audits under scripts/

Rapporter:
1. Hvilke filer finnes.
2. Hvilke filer mangler.
3. Om role_id og role_scope er konsistente.
4. Om jobLearningProfiles.json har egen profil under profiles[role_id].
5. Om mailPlan allowed_families faktisk matcher family.id i mailFamilies.
6. Om rollen har tydelig sosiologisk kjerne.
7. Om rolleinnhold, learning profile og mailer peker mot samme læringsmål.
8. Om det finnes fallback/generisk innhold som bør forbedres.
9. Hvilke konkrete dataendringer som bør gjøres i neste PR.

Avslutt med en kort prioriteringsliste:
- Må fikses før rollen kan regnes som spillbar
- Bør forbedres for faglig kvalitet
- Kan tas senere som humor/twist/polish
```

---

## Prompt 2 — Legg inn ferdig kuratert rolleinnhold

Bruk denne når ChatGPT allerede har laget ferdig innhold for en rolle.

```text
Du skal legge inn ferdig kuratert rolleinnhold for én Civication-rolle.

Viktig:
- Bruk kun innholdet som er gitt under.
- Ikke finn opp nye roller.
- Ikke legg til ekstra scenarioer, storylets eller læringsmål på egen hånd.
- Ikke endre runtime-kode.
- Ikke endre UI.
- Ikke gjør opprydding utenfor filene som er eksplisitt relevante for denne rollen.
- Les eksisterende filer først og bevar eksisterende struktur der den allerede er riktig.

Rolle:
- role_id: <ROLE_ID>
- role_scope: <ROLE_SCOPE>
- category: naeringsliv

Filer som kan endres:
- data/Civication/roles/naer_<ROLE_SCOPE>.json
- data/Civication/jobLearningProfiles.json
- data/Civication/mailPlans/naeringsliv/<ROLE_SCOPE>_plan.json
- data/Civication/mailFamilies/naeringsliv/job/<ROLE_SCOPE>_intro_v2.json
- data/Civication/mailFamilies/naeringsliv/job/<ROLE_SCOPE>_job.json
- data/Civication/mailFamilies/naeringsliv/conflict/<ROLE_SCOPE>_conflict.json
- data/Civication/mailFamilies/naeringsliv/story/<ROLE_SCOPE>_story.json
- data/Civication/mailFamilies/naeringsliv/event/<ROLE_SCOPE>_event.json

Krav:
1. role_id skal være stabil og lik i rollefil og jobLearningProfiles.
2. role_scope skal være lik i rollefil, mailPlan og mailFamilies.
3. jobLearningProfiles.json skal ha egen profil under profiles[role_id].
4. jobLearningProfiles.json skal ikke inneholde storylets eller full rollebeskrivelse.
5. mailPlan skal peke på eksisterende family.id-er.
6. MailFamilies skal ha konkrete arbeidslivssituasjoner, ikke generiske meldinger.
7. Alle valg skal være reelle dilemmaer, ikke bare rett/galt.
8. JSON skal formateres ryddig og være parsebar.

Kuratert innhold:

<PASTE_ROLE_SCHOOL_AND_STRUCTURED_CONTENT_HERE>

Etter endring:
- Kjør relevante tester/audits hvis tilgjengelig, særlig:
  - npm run audit:job-learning-profiles
  - npm run test:civication
  - eventuelle validate-civication-mails-skript
- Rapporter nøyaktig hvilke filer som ble endret.
- Rapporter hvilke kommandoer som ble kjørt og resultatet.
- Rapporter eventuelle feil uten å skjule dem.
```

---

## Prompt 3 — Lag role school draft fra eksisterende rollefil

Bruk denne når en rollefil finnes, men du vil lage et faglig utkast i Markdown før JSON endres.

```text
Du skal lage et read-only faglig utkast for én Civication-rolle basert på eksisterende repo-data.

Viktig:
- Ikke endre filer.
- Ikke skriv JSON-endringer.
- Ikke finn opp ny struktur.
- Les eksisterende rollefil, learning profile, mailPlan og mailFamilies hvis de finnes.

Rolle:
- role_id: <ROLE_ID>
- role_scope: <ROLE_SCOPE>
- category: naeringsliv

Les:
- data/Civication/roles/naer_<ROLE_SCOPE>.json
- data/Civication/jobLearningProfiles.json
- data/Civication/mailPlans/naeringsliv/<ROLE_SCOPE>_plan.json
- eksisterende mailFamilies for rollen
- data/Civication/ROLE_SCHOOL_TEMPLATES.md

Lag en Markdown-rapport med:

1. Sosiologisk kjerne
2. Arbeidets faktiske praksis
3. Institusjonell plassering
4. Klasse, status og hierarki
5. Taus kunnskap
6. Kapitalformer
7. Formell og uformell makt
8. Typiske konflikter
9. Dilemmaer
10. Hva spilleren skal lære
11. Rollen som skole
12. Forslag til scenariofamilier
13. Forslag til mailfamilier
14. Hva som bør inn i jobLearningProfiles.json
15. Hva som bør vente til humor/twist-laget

Rapporten skal være faglig presis, sosiologisk forankret og konkret knyttet til arbeidshverdagen. Ikke bruk generiske formuleringer som kunne passet alle jobber.
```

---

## Prompt 4 — Kontroller at learning profile matcher rolleinnhold

Bruk denne når `jobLearningProfiles.json` er oppdatert og du vil sikre at profilen faktisk stemmer med rollen.

```text
Du skal kontrollere at Job Learning Profile matcher rolleinnholdet for én Civication-rolle.

Viktig:
- Ikke endre filer.
- Les faktiske kildefiler.
- Ikke vurder ut fra antakelser.

Rolle:
- role_id: <ROLE_ID>
- role_scope: <ROLE_SCOPE>
- category: naeringsliv

Les:
- data/Civication/roles/naer_<ROLE_SCOPE>.json
- data/Civication/jobLearningProfiles.json

Sjekk:
1. Finnes profiles[role_id]?
2. Har profilen alle nødvendige felt?
   - learning_value
   - teaches
   - mastery_threshold
   - usefulness
   - transferable_skills
   - dead_end_risk
3. Speiler teaches faktisk role.what_player_learns og scenario_families.what_it_teaches?
4. Er teaches kortere og mer kontraktsaktig enn rolleinnholdet?
5. Er transferable_skills konkrete ferdigheter, ikke bare abstrakte verdier?
6. Er mastery_threshold logisk for rollens kompleksitet?
7. Er dead_end_risk faglig begrunnet?
8. Er det duplisering som bør ryddes?
9. Mangler det læringspunkter som burde vært med?

Rapporter:
- Godkjent / ikke godkjent
- konkrete funn
- anbefalt endring i profiles[role_id], men ikke endre filen
```

---

## Prompt 5 — Bygg første komplette rollepakke fra chat-kuratert innhold

Bruk denne når du vil ha en vertikal PR for én rolle.

```text
Du skal lage en komplett vertikal Civication-rollepakke for én rolle basert på ferdig kuratert innhold fra chat.

Viktig:
- Ikke finn opp innhold selv.
- Ikke bygg flere roller.
- Ikke endre runtime-kode, UI eller CSS.
- Ikke endre andre dataområder enn det som trengs for denne rollen.
- Bevar eksisterende schema og filstruktur.
- Bruk role_id og role_scope nøyaktig som oppgitt.

Rolle:
- role_id: <ROLE_ID>
- role_scope: <ROLE_SCOPE>
- category: naeringsliv

Oppgaver:
1. Les eksisterende rollefiler og dokumentasjon:
   - data/Civication/ROLE_SCHOOL_TEMPLATES.md
   - data/Civication/README-mailsystem-og-rolemodels.md
   - docs/CIVICATION_DATA_LAYERS.md
   - eksisterende rollefil hvis den finnes
   - eksisterende mailPlan/mailFamilies hvis de finnes

2. Opprett eller oppdater:
   - data/Civication/roles/naer_<ROLE_SCOPE>.json
   - data/Civication/jobLearningProfiles.json > profiles[role_id]
   - data/Civication/mailPlans/naeringsliv/<ROLE_SCOPE>_plan.json
   - data/Civication/mailFamilies/naeringsliv/job/<ROLE_SCOPE>_intro_v2.json
   - data/Civication/mailFamilies/naeringsliv/job/<ROLE_SCOPE>_job.json
   - data/Civication/mailFamilies/naeringsliv/conflict/<ROLE_SCOPE>_conflict.json
   - data/Civication/mailFamilies/naeringsliv/story/<ROLE_SCOPE>_story.json
   - data/Civication/mailFamilies/naeringsliv/event/<ROLE_SCOPE>_event.json

3. Sørg for at:
   - role_id matcher overalt der role_id brukes
   - role_scope matcher plan og families
   - allowed_families matcher family.id
   - mailer har minst to valg
   - mailer er konkrete arbeidslivssimuleringer
   - learning profile ikke inneholder storylets
   - rollefil ikke inneholder spillerens faktiske progresjon

4. Kjør tester/audits:
   - npm run audit:job-learning-profiles
   - npm run test:civication
   - relevante mail-validatorer hvis de finnes

5. Lag sluttrapport:
   - filer endret
   - tester kjørt
   - eventuelle feil
   - hva som fortsatt bør forbedres i neste pass

Kuratert innhold fra chat:

<PASTE_CURATED_ROLE_PACKAGE_HERE>
```

---

## Prompt 6 — Lag humor/twist-lag etter at rollen er faglig ferdig

Bruk denne senere. Ikke bruk den før rollen er faglig stabil.

```text
Du skal foreslå et humor/twist-lag for én allerede ferdig Civication-rolle.

Viktig:
- Ikke endre filer.
- Ikke gjør rollen mindre faglig presis.
- Humor skal komme fra faktisk arbeidslivsfriksjon, ikke tilfeldige vitser.
- Bevar rollens sosiologiske kjerne.

Rolle:
- role_id: <ROLE_ID>
- role_scope: <ROLE_SCOPE>
- category: naeringsliv

Les:
- data/Civication/roles/naer_<ROLE_SCOPE>.json
- data/Civication/mailPlans/naeringsliv/<ROLE_SCOPE>_plan.json
- eksisterende mailFamilies for rollen

Lag forslag til:
1. Tørre observasjoner som kan flettes inn i mails.
2. Absurd, men realistisk byråkrati.
3. Små arbeidslivsøyeblikk som kan bli morsomme uten å ødelegge realismen.
4. NPC-stemmer som skaper gjenkjennelig friksjon.
5. Re:-tråder der konsekvensen blir litt komisk, men fortsatt meningsfull.
6. Hva som ikke bør gjøres fordi det vil gjøre rollen useriøs.

Ikke skriv endringer til fil. Rapporter bare forslag.
```

---

## Prompt 7 — Sjekk om Codex har funnet opp innhold

Bruk denne etter en PR hvis du vil kontrollere at Codex ikke har gått utenfor kuratert innhold.

```text
Du skal kontrollere om en Civication-rolle-PR har lagt til ukuratert eller oppfunnet innhold.

Viktig:
- Ikke endre filer.
- Sammenlign PR-endringene med kuratert innhold fra chat hvis det finnes i PR-beskrivelsen eller arbeidsnotatet.
- Marker alle tilfeller der Codex har lagt til nye læringsmål, scenarioer, NPC-er, place_id-er eller mailer uten at de var oppgitt.

Sjekk:
1. Nye eller endrede role_id-er.
2. Nye scenario_families.
3. Nye storylets.
4. Nye teaches/transferable_skills.
5. Nye mailFamilies eller family.id-er.
6. Nye NPC/from-id-er.
7. Nye place_id-er.
8. Endringer i runtime/UI/CSS som ikke var bedt om.

Rapporter:
- Godkjent / ikke godkjent
- nøyaktige filer og linjer
- hva som bør fjernes eller flyttes tilbake til chat-kuratering
```

---

## Anbefalt arbeidsflyt

```text
1. ChatGPT lager faglig rolle-skole.
2. ChatGPT lager strukturert rollepakke.
3. Codex kjører Prompt 2 eller Prompt 5.
4. Codex validerer.
5. ChatGPT/bruker vurderer PR.
6. Codex kjører Prompt 7 ved behov.
7. Humor/twist-lag tas senere med Prompt 6.
```
