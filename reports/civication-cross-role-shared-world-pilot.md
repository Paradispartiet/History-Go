# Civication cross-role shared world — newsroom pilot

Dato: **2026-08-25**

Roller:

- eierperspektiv: `media/media_redaksjon` (journalist/reporter/redaksjonsmedarbeider)
- andre perspektiv: `media/media_redaksjonell_ledelse` (redaktør/sjefredaktør/nyhetsleder)

Persistensobjekt: `media_redaksjon_publication_case_001`

Institusjon: `fjordby_dagblad_redaksjonen_001` (fiktiv)

Status: **cross-role proof authored; broad Role World rollout remains policy-gated**

## Hvorfor denne piloten

Role World Realism Matrix låste de tverrrollefeltene som allerede var bevist gjennom arkiv, plan, sport og journalistikk, men lot `cross_role_links` stå som eksplisitt programgjeld. Definition of Done krevde fortsatt at ett og samme persistente arbeidsobjekt faktisk skulle oppleves fra to canonicale roller med forskjellige handlingsrom uten privilege leakage.

Nyhetsrommet er det sterkeste eksisterende testmiljøet fordi begge rollene allerede er playable, begge arbeider i samme institusjonelle kjede, og journalistikkpiloten allerede har en sammenhengende publiseringssak med kilder, dokumentasjon, rework og redaktørmyndighet. Piloten trenger derfor ikke en ny motor eller et kunstig nytt objekt.

## Ett objekt, to perspektiver

Reporteren åpner først den eksisterende saken gjennom:

`media_redaksjon_realism_case_open_001`

Den oppretter `media_redaksjon_publication_case_001` med canonical `role_scope: media_redaksjon`. Objektet starter `shared: false` og beholder reporterens kilde-, dokument-, versjons- og spørsmålsspor.

Den nye leder-scenen er:

`media_cross_role_editor_shared_case_review_001`

Den peker på nøyaktig samme `work_object_id`. `work_context.rework_of_scene_id` peker tilbake på reporterens saksåpning, slik at eksisterende `CivicationWorkRhythm` holder lederperspektivet utilgjengelig før reporterens arbeid faktisk finnes i objektets historikk.

Når lederperspektivet brukes, markeres det eksisterende objektet eksplisitt `shared: true` med `upsert`. Det opprettes ikke en kopi og `role_scope` flyttes ikke til lederrollen. `shared_object_ids` får objektet, mens den canonicale rolleindeksen fortsatt eies av `media_redaksjon`.

## Ulikt handlingsrom

Lederrollen får to legitime direkte handlinger på den samme saken:

1. returnere samme sak for målrettet reporter-rework;
2. flytte samme sak til redaksjonell beslutningsberedskap.

Begge handlingene kan endre arbeidsflyt og fase fordi det er nettopp lederens institusjonelle ansvar. De kan derimot ikke endre hvem som eier det reporterproduserte evidenssporet.

En tredje authored handling forsøker bevisst å omskrive reporterens usikre funn til bekreftet premiss bare fordi spilleren er leder. Den har `authority: forbidden` og skal blokkeres av den eksisterende authority-porten før state muteres.

## Privilege leakage er eksplisitt blokkert

Piloten tester to forskjellige lekkasjer:

- **oppover:** redaksjonell rang kan ikke gjøre et kilde- eller dokumentfunn sannere;
- **nedover:** reporterrollen kan ikke arve lederens direkte rework-/beslutningsmyndighet bare fordi den samme saken nå er shared.

`CivicationInstitutionAuthority.evaluate()` får aktivt role scope ved vurdering. Når lederhandlingen evalueres som `media_redaksjonell_ledelse`, er de to legitime handlingene `direct_authority`. Når identisk handling evalueres med reporterens role scope, returnerer resolveren `role_scope_mismatch`.

Det betyr at shared state ikke er shared privilege.

## Ingen ny runtime

Piloten gjenbruker uendret:

- `CivicationWorkWorld` for persistent objektstate, `upsert`, historikk og shared-indeks;
- `CivicationWorkRhythm` for å kreve faktisk reporterhistorikk før lederperspektivet blir tilgjengelig;
- `CivicationInstitutionAuthority` for direkte, forbudt og role-scope-avgrenset myndighet;
- eksisterende Scene Pipeline og compiled registry;
- eksisterende mail plan for redaksjonell ledelse.

Det finnes ingen `SharedWorldEngine`, ingen ny sceneleverandør, ingen ny authority-store og ingen kopi av publiseringssaken.

## Matrix-konsekvens

`cross_role_links` flyttes fra `not_started` til `runtime_proven` som et programnivåbevis. Dette endrer ikke `reference_complete`, `role_world_complete` eller de sju allerede låste tverrrolledimensjonene.

Bred Role World rollout forblir **false**. Denne piloten beviser den siste eksplisitte shared-object-gjelden; en eventuell åpning av bred rollout skal fortsatt være en egen, synlig policybeslutning etter grønn CI, ikke en bivirkning av piloten.

## Permanente bevis

`tests/civication-cross-role-shared-world.test.js` skal permanent bevise at:

- leder-scenen ikke er tilgjengelig før reporterens saksåpning finnes i samme objekt;
- reporterens opening og lederens review havner i historikken til samme `work_object_id`;
- objektet blir shared uten at canonical `role_scope` flyttes;
- lederens to legitime actions passerer som `direct_authority`;
- samme actions blokkeres som `role_scope_mismatch` når reporterrollen prøver å bruke dem;
- lederens forsøk på å omskrive evidens gjennom rang blokkeres som `forbidden_action`;
- source → compiled registry-paritet bevarer begge perspektivene og samme institusjon;
- Matrix holder broad rollout policy-gated.

Focused materialisering og semantic gate kjøres på branch-head før ordinær PR-CI; et grønt Matrix-statusfelt skal aldri brukes som erstatning for faktisk testresultat.

## Kvalitetsvurdering før merge

| Dimensjon | Vurdering | Begrunnelse |
| --- | --- | --- |
| Korrekthet og evidens | høy | Piloten bruker bare eksisterende fiktiv redaksjon og eksisterende journalistikk-case; ingen virkelige personer får oppdiktet rolle. |
| Dekning | målrettet | Scope er ett shared object og to klart forskjellige role scopes; ingen kunstig full Role World-produksjon. |
| Faglig kvalitet | høy | Reporterens evidensansvar og lederens beslutningsansvar holdes eksplisitt fra hverandre. |
| Teknisk integritet | høy | Eksisterende WorkWorld, WorkRhythm, Authority og Scene Pipeline gjenbrukes uten ny runtime. |
| Sikkerhet/ansvarlighet | høy | Hierarki kan ikke gjøre påstander til fakta; authority leakage er en blokkerende test. |
| Vedlikeholdbarhet | høy | Én ny scene, én planbinding, én programgate og én permanent test. |

Endelig grønn-status, suite-tall og registry-tall skal først fastslås fra CI på PR-ens eksakte final head.
