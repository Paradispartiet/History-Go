# Civication audit: `naer_arbeider` vertikal rollepakke

Dato: 2026-06-03

Formål: Kontrollere om `naer_arbeider` faktisk mangler mailFamily-dekning for `allowed_families` i `arbeider_plan.json`, og avklare neste reelle kvalitetsløft.

Konklusjon:

```text
`naer_arbeider` har allerede vertikal mailFamily-dekning for planens sentrale allowed_families.
Det skal derfor ikke opprettes nye filer bare for å fylle antatte hull.
Neste kvalitetsløft bør være kvalitativt: styrke faglig konsistens, eventuelt oppgradere relevante v1-familier til v2-felt med from/place_id/purpose/stakes/reply der det er trygt.
```

---

## Filer kontrollert

```text
data/Civication/roleSchools/naer_arbeider_ROLE_SCHOOL.md
data/Civication/roles/naer_arbeider.json
data/Civication/jobLearningProfiles.json
data/Civication/mailPlans/naeringsliv/arbeider_plan.json
data/Civication/mailFamilies/naeringsliv/job/arbeider_intro_v2.json
data/Civication/mailFamilies/naeringsliv/job/arbeider_job.json
data/Civication/mailFamilies/naeringsliv/conflict/arbeider_conflict.json
data/Civication/mailFamilies/naeringsliv/people/arbeider_people.json
data/Civication/mailFamilies/naeringsliv/story/arbeider_story.json
data/Civication/mailFamilies/naeringsliv/event/arbeider_event.json
data/Civication/npcs/naeringsliv.json
package.json
scripts/validate-civication-mails.js
```

---

## Rollegrunnlag

`naer_arbeider` finnes som rolleinnhold med:

```text
role_id: naer_arbeider
role_scope: arbeider
category: naeringsliv
primary_conflict: tempo_vs_kvalitet
secondary_conflict: lojalitet_vs_selvoppholdelse
background_conflict: gulvlogikk_vs_lederlogikk
```

Rollen er allerede modellert rundt konkret arbeid, rytme, rutiner, uformelle regler, små maktforskjeller, praktisk drift og sosial lesning.

Eksisterende læringsprofil dekker:

```text
arbeidsrytme
praktisk drift
rutineforståelse
avvikshåndtering
sosial lesning
stabilitet
```

`mastery_threshold` er `8`, og `dead_end_risk` er `medium`.

---

## MailPlan-dekning

`data/Civication/mailPlans/naeringsliv/arbeider_plan.json` peker på disse sentrale family-id-ene:

```text
arbeider_intro_v2
arbeider_intro
drift_basics
oppgaveflyt
tempo_vs_kvalitet_intro
lojalitet_vs_selvoppholdelse_intro
uformell_leder_intro
kollega_press_intro
taus_lojalitet
drift_press
forbedring_uten_mandat
tempo_vs_kvalitet_early
lojalitet_vs_selvoppholdelse_early
industrihistorisk_ekko
arbeidets_usynlighet
kollega_skyld
feil_i_linja
inspeksjon
ansvarsforskyvning
```

Kontrollert faktisk dekning:

| family.id | funnet i fil | status |
|---|---|---|
| `arbeider_intro_v2` | `job/arbeider_intro_v2.json` | OK |
| `arbeider_intro` | `job/arbeider_job.json` | OK |
| `drift_basics` | `job/arbeider_job.json` | OK |
| `oppgaveflyt` | `job/arbeider_job.json` | OK |
| `drift_press` | `job/arbeider_job.json` | OK |
| `forbedring_uten_mandat` | `job/arbeider_job.json` | OK |
| `tempo_vs_kvalitet_intro` | `conflict/arbeider_conflict.json` | OK |
| `lojalitet_vs_selvoppholdelse_intro` | `conflict/arbeider_conflict.json` | OK |
| `tempo_vs_kvalitet_early` | `conflict/arbeider_conflict.json` | OK |
| `lojalitet_vs_selvoppholdelse_early` | `conflict/arbeider_conflict.json` | OK |
| `uformell_leder_intro` | `people/arbeider_people.json` | OK |
| `kollega_press_intro` | `people/arbeider_people.json` | OK |
| `taus_lojalitet` | `people/arbeider_people.json` | OK |
| `kollega_skyld` | `people/arbeider_people.json` | OK |
| `industrihistorisk_ekko` | `story/arbeider_story.json` | OK |
| `arbeidets_usynlighet` | `story/arbeider_story.json` | OK |
| `feil_i_linja` | `event/arbeider_event.json` | OK |
| `inspeksjon` | `event/arbeider_event.json` | OK |
| `ansvarsforskyvning` | `event/arbeider_event.json` | OK |

Resultat:

```text
Ingen av de kontrollerte allowed_families mangler som family.id.
```

---

## Viktig funn

Tidligere antakelse om at flere mailFamilies manglet kom fra søketreff, ikke fra direkte fillesning. Direkte fillesning viser at strukturene allerede finnes.

Derfor bør vi ikke opprette parallelle eller dupliserte familier.

---

## Kvalitativ vurdering

`naer_arbeider` er allerede et sterkt grunnlag for en arbeidslivsskole:

```text
- job-familiene lærer drift, flyt, små avvik og forbedring uten mandat
- conflict-familiene lærer tempo vs kvalitet og lojalitet vs selvoppholdelse
- people-familiene lærer uformell rang, kollegapress, taus lojalitet og skyldfordeling
- story-familiene kobler arbeiderrollen til industrihistorie og arbeidets usynlighet
- event-familiene gjør feil, inspeksjon og ansvarsforskyvning til systemiske hendelser
```

Dette passer godt med rolle-skolens kjerne:

```text
Arbeider = praktisk drift + sosial lesning + lav formell makt + høy systemnærhet + rytme under press
```

---

## Hva bør ikke gjøres nå

```text
- Ikke opprett nye mailFamily-filer for `arbeider` bare fordi søk ikke fant dem.
- Ikke dupliser eksisterende family.id-er.
- Ikke endre runtime/UI/CSS.
- Ikke endre jobLearningProfiles.json uten konkret mismatch.
- Ikke legge inn humor/twist-lag før faglig kvalitetspass er ferdig.
```

---

## Neste reelle kvalitetsløft

Anbefalt neste PR/pass:

```text
1. Auditere kvaliteten i eksisterende `arbeider_*` mailfamilier mot `roleSchools/naer_arbeider_ROLE_SCHOOL.md`.
2. Vurdere om v1-familiene bør få enkelte v2-felt der det er trygt:
   - from
   - place_id
   - purpose
   - stakes
   - reply på valg
3. Beholde eksisterende family.id-er og mailPlan-koblinger.
4. Ikke endre dramaturgisk struktur før innholdet er vurdert.
5. Eventuelt lage en egen `arbeider_v2_quality_pass` senere, men uten å bryte eksisterende runtime.
```

---

## Teststatus

Tester ble ikke kjørt i denne auditten fordi repoet ikke ble kjørt i et lokalt Node-miljø her.

Kommandoene som bør kjøres i faktisk repo-miljø:

```bash
npm run audit:job-learning-profiles
npm run test:civication
```

Merk: `scripts/validate-civication-mails.js` kontrollerer i dagens form primært ekspeditør-runtimekataloger og brand-mails, ikke hele `arbeider`-pakken.

---

## Endelig vurdering

`naer_arbeider` er ikke i en “mangler filer”-fase. Den er i en “kvalitet, konsistens og eventuell v2-berikelse”-fase.

Dette betyr at neste arbeid bør være presis faglig forbedring, ikke ny struktur.
