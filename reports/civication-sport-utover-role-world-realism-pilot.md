# Civication Sport-utøver — strukturelt annerledes Role World-pilot

Dato: **2026-08-24**

Rolle: `sport/sport_utover`

Status: **runtime-bevist fullpilot; ingen Role World Realism Matrix opprettes i denne leveransen**

## Hvorfor denne rollen

`sport/sport_utover` var den sterkeste ferske kandidaten: rollen var allerede `reference_complete`, hadde 15/15 Career Gameplay-komponenter, to praksisuker, 14 dagers Role World-dekning, åtte tilbakevendende relasjoner og eksplisitte grenser mellom kontrakt, trening, medisinsk vurdering, uttak og offentlig status.

Piloten tester derfor ikke enda en kontorjobb. Den tester en livsverden der arbeidsobjektet er en kroppslig og tidsbundet treningssyklus, kapasitet uttrykkes som restitusjonsrom, handoff går til fysioterapeut og trener, og den avgjørende fristen er konkurranseuttaket.

## Den sammenhengende spillbuen

```text
baseline og belastningsplan
→ kroppssignal under høyintensiv blokk
→ handoff til fysioterapeut og trener
→ venting og History Go ved Bislett
→ vurdering med vilkår
→ restitusjon og rework av mikroplan
→ relasjonell følge hos faglinje eller lag
→ konkurranse bare med registrert trenergodkjenning
```

Alle åtte scenes bruker det samme persistente arbeidsobjektet `sport_utover_microcycle_001`. Objektet har `kind: training_cycle`, medisinsk avgrenset konfidensialitet og egne faser for baseline, vurderingsventing, revidert belastning, restitusjon, konkurranseberedskap og avslutning. Det er ikke en omdøpt plansak.

## Arbeidsrytme og kapasitet

Piloten gjenbruker `CivicationWorkRhythm` og eksisterende Scene Pipeline:

- morgenen etablerer baseline før belastning;
- et kroppssignal avbryter den planlagte høyintensive blokken;
- `handoff_to_actor_id: fysio_elias` gjør den faglige overleveringen eksplisitt;
- `waiting_for_actor_id: fysio_elias` gjør vurderingsperioden til spillbar venting;
- vurderingen returnerer som et avbrudd med synlige vilkår;
- restitusjon materialiseres som redusert kapasitet og rework, ikke som tom tid;
- konkurransedagen rangeres som en presserende, men myndighetsavgrenset frist.

Ingen ny clock, backlog, recovery engine eller parallell sceneleverandør er introdusert.

## Relasjoner og situert tillit

Kroppssignalet har to plausible, kostbare utfall:

| Valg | Fysioterapeut | Trener | Lag | Senere scene |
| --- | ---: | ---: | ---: | --- |
| Rapporter før mer belastning | +3 | +2 | -1 | Elias deler belastningstrenden tidligere |
| Fullfør lagblokken og rapporter etterpå | -2 | -3 | +2 | Nora ber om ny lagtilgjengelighet |

Den første grenen gir bedre faglig informasjonsflyt, men gjør lagets kortsiktige kostnad reell. Den andre gir sterkere teamtillit her og nå, men svekker trenerens og fysioterapeutens tillit til tidspunktet for rapporteringen. SceneDirector slipper bare gjennom den followup-scenen som samsvarer med lagret situert tillit.

Ingen standing-verdi gir uttak, medisinsk klarering eller ny formell myndighet. `career.reputation` forblir uendret.

## Institusjon og myndighet

Den fiktive klubben `fjordby_il_prestasjonsgruppe_001` holder dagens rolleliv adskilt fra virkelige institusjoner og personer. Maja, Elias, Nora og de andre rollefigurene er scenariofigurer, ikke virkelige History Go-personer.

Myndighetskontrakten skiller:

- utøverens direkte rett og plikt til å rapportere eget kroppssignal;
- fysioterapeutens avgrensede faglige vurdering;
- trenerens beslutning om plan, full konkurransebelastning og uttak;
- den forbudte handlingen `self_clear_for_selection`.

Det persistente approval-objektet `sport_utover_readiness_approval_001` må stå som `granted` før `return_to_full_competition_load` kan utføres. Kontrakt, kunnskap, resultat og tillit kan ikke omgå denne porten.

## History Go-kobling

`sport_utover_realism_knowledge_bislett_001` sender spilleren til det canonicale stedet `bislett_stadion` og den eksisterende Bislett-quizen. Arenaens dokumenterte tidtaking, resultattavler, rekordkultur og publikum brukes til ett presist skille:

- et offentlig målt resultat er reelt;
- en intern belastningstrend svarer på et annet spørsmål;
- en faglig vurdering og trenerbeslutning har egne premisser.

Når History Go-oppgaven er korrekt fullført, åpnes et tredje og bedre rework-valg som holder disse signaltypene adskilt. Kunnskapen gir bedre profesjonell sortering, ikke medisinsk autoritet.

## Employment-conditions-audit

Piloten bruker den eksisterende kontrakts- og karrieremodellen som kontekst, men trenger ingen ny employment-state. Det faktiske, vedvarende state-behovet var treningssyklus, vurderingsgodkjenning, restitusjonsfase og situert tillit; alle fire dekkes av eksisterende additive kontrakter.

Konklusjon: en egen `EmploymentConditionsEngine` eller fri nested state ville økt kompleksiteten uten å løse et påvist gap.

## Permanente bevis

- **285/285 Civication-testfiler** består etter at pilotens permanente semantic-playthrough er lagt til;
- `tests/civication-sport-utover-role-world-realism-pilot.test.js` spiller gjennom hele vertikalen og en alternativ tillitsgren;
- `tests/civication-sport-utover-role-world.test.js` beskytter den eksisterende 14-dagers Role World- og praksisukedekningen;
- source → compiled registry-paritet kontrolleres for alle åtte nye scenes;
- semantic playthrough beviser persistent state, waiting/handoff, History Go-affordance, rework, approval og avslutning;
- den alternative grenen beviser at den motsatte situated-standing-followupen er den eneste kvalifiserte;
- den eksisterende Scene Pipeline, work-rhythm-, authority-, task- og standing-runtimeen gjenbrukes uendret.

Materialisert registry etter piloten:

- **1126 scener**
- **44 roller**
- **347 kompilerte kilder**
- **0 shadowed duplicates**
- registry-hash: `5030555c3ff2e4e516581ce01dd8e729dd02a9c32b201ed8375127f358e304a0`

## Hva piloten lærer oss om en framtidig Matrix

Universelle kandidater som nå er bevist på tvers av kontor- og prestasjonshverdager:

- persistent object identity og history;
- institution/authority context;
- deadline, waiting, handoff, interrupt og rework;
- History Go-affordance uten authority leakage;
- situated standing med senere scenevalg;
- explicit People/Places/provenance.

Felt som foreløpig er rolletypespesifikke og ikke skal gjøres globale:

- `training_cycle` som object kind;
- recovery-/belastningsfaser;
- faglig klarering før full konkurransebelastning;
- teamtilgjengelighet som egen sosial kostnad;
- offentlig resultat kontra intern beredskap.

Matrix opprettes ikke nå. Pilot D må først teste undervisning eller journalistikk, særlig student-/publikum-/kilderelasjoner og profesjonskultur.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Evidens |
| --- | ---: | --- |
| Korrekthet og evidens | 5/5 | Canonical Bislett- og måleregisterkilder brukes innen avgrenset evidens; fiktiv klubb og scenariofigurer er eksplisitte. |
| Dekning og ferdigstillelse | 5/5 | Hele buen fra baseline til konkurransebeslutning, alternativ tillitsgren, planrekkefølge og compiled parity er kontrollert. |
| Faglig/redaksjonell kvalitet | 5/5 | Belastning, restitusjon, laglojalitet, trener-/fysiogrense, kontrakt og uttak har egne konflikter og konsekvenser uten generisk kontormal. |
| Teknisk integritet | 5/5 | Eksisterende work-object-, rhythm-, authority-, task-, standing- og Scene Pipeline-kontrakter gjenbrukes; semantic playthrough og registry-paritet er permanente. |
| Sikkerhet og ansvarlighet | 5/5 | Ingen diagnose, selvlisensiering, virkelige personer som fiktive NPC-er, sensitive delingsflater eller authority leakage. |
| Vedlikeholdbarhet og etterprøvbarhet | 4/5 | Leveransen er additiv og rolle-eid; Pilot D gjenstår før tverrrollefeltene kan låses i en Matrix. |

**Total: 29/30 — høy kvalitet.** Piloten er komplett innen eget scope, men Role World Realism-programmet og Matrix er uttrykkelig ikke ferdige.
