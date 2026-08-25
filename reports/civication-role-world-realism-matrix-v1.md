# Civication Role World Realism Matrix v1

Dato: **2026-08-25**

Status: **separat Matrix/gate aktiv; bred rollout fortsatt blokkert**

## Formål

Denne leveransen låser bare de tverrrollefeltene som fire strukturelt forskjellige Civication-piloter faktisk har bevist. Den introduserer ingen ny runtime, ingen ny sceneformatfamilie og ingen ny completion-status.

De eksisterende grensene består:

- `reference_complete` er fortsatt Career Gameplay-status;
- `role_world_complete` er fortsatt Role World-status;
- Role World Realism Matrix er en separat audit/gate;
- `civication_scene_v1` og eksisterende Scene Pipeline forblir canonical runtime;
- bred rollout er eksplisitt `false` til en senere policyendring kan vise at gjenstående programkrav er oppfylt.

## Fire strukturelle bevis

### Arkiv/dokumentasjon

`historie/historie_arkiv_og_dokumentasjon` er den første runtime-vertikalen for persistent arbeidsobjekt, tilgang/provenance og senere lesing av samme arbeidsstate. Den er bevisst ikke fabrikkert inn i Role World-indeksen bare for å få en Matrix-rad.

### By-plan

`by/by_radgiver_plan` beviser en forvaltningsverden med persistent plansak, lokal evidens, institusjonslinje, knapp juridisk kapasitet, eskalering, ledergodkjenning og History Go-kunnskap som forbedrer et faglig valg uten å gi politisk eller administrativ myndighet.

### Sport/prestasjon

`sport/sport_utover` beviser en kropp-/prestasjonshverdag med treningssyklus, kroppssignal, fysioterapeut-/trener-handoff, venting, restitusjon, rework, uttaksmyndighet og motstridende trener-/fag-/teamtillit.

### Journalistikk

`media/media_redaksjon` beviser kilder, publikum, redaktørmyndighet, feedback/rework, synlig rettelse og en situert kildeakse `source:*` uten å gjøre tillit til publiseringsmyndighet.

## De sju feltene som låses

Matrix v1 låser nøyaktig disse tverrrolle-dimensjonene:

1. `persistent_work_object`
2. `institution_authority`
3. `rhythm_waiting_handoff_rework`
4. `history_go_affordance`
5. `situated_audience_types`
6. `people_places_integrity`
7. `provenance`

Hver låst dimensjon må ha eksplisitt evidens fra minst tre av de fire strukturelle pilotene. Dette hindrer at et særtrekk i én rolle blir opphøyd til global kontrakt.

## Situated audience-vokabular

Den eksisterende bounded standing-kontrakten har nå flerpilotbevis for:

```text
manager:*
team:*
professional:*
public:*
source:*
```

Dette er audience-typer, ikke en global sosial score. `career.reputation` forblir legacy/globalt sammendrag og standing kan ikke gi formell myndighet.

## Felter som forblir rolle-eid

Matrixen gjør uttrykkelig følgende til ikke-globale felter:

- arbeidsobjektets konkrete `kind`;
- objektenes konkrete fase-/statusnavn;
- recurring actor-/relationship-ID-er;
- institusjons- og unit-ID-er;
- rolle-spesifikke authority-actions;
- konfidensialitetsregler;
- feedbackflater;
- profesjonskultur;
- arbeidsvilkår.

Dermed blir `training_cycle` fortsatt sport, `publication_case` fortsatt journalistikk, Lillebekk fortsatt plan og arkivets objektarter fortsatt arkiv. Matrixen standardiserer behovet for en stabil kontrakt, ikke innholdet i livsverdenen.

## Bevisst utsatte dimensjoner

### Employment conditions — `editorial_only`

Sport-piloten viste at eksisterende career/contract-kontekst var tilstrekkelig for den aktuelle buen. Det finnes derfor ikke flerpilotbevis for en ny felles arbeidsvilkår-runtime.

### Professional culture — `editorial_only`

Journalistikk har sterkt redaksjonelt bevis, men ett domene er ikke nok til å låse et globalt runtimefelt. Profesjonskultur forblir primært authored Role World/roleModel/FWG-data.

### Cross-role links — `not_started`

Programmets Definition of Done krever fortsatt minst ett faktisk shared object som kan oppleves fra to roller med samme stabile objekt-ID, ulikt handlingsrom og uten privilege leakage. Matrixen markerer dette som synlig gjeld i stedet for å late som pilotene allerede har bevist det.

## Permanent gate

`tests/civication-role-world-realism-matrix.test.js` blokkerer blant annet:

- endring av Career-/Role World-completion-semantikk gjennom Matrixen;
- ny runtime eller parallell sceneformatfamilie;
- færre eller flere enn de fire avtalte strukturelle bevisene i Matrix v1;
- globale felter med evidens fra færre enn tre piloter;
- tap av `source:*` eller andre bounded audience-typer;
- manglende People/Places/provenance-evidens;
- at arkivvertikalen feilaktig blir gjort `role_world_complete` av Matrixen;
- at `employment_conditions`, `professional_culture` eller `cross_role_links` blir fremstilt som ferdigbevist;
- manglende semantic playthrough, compiled-registry parity, Career Matrix- eller Role World-kontraktstest i den obligatoriske gate-listen.

Fordi `tests/run-civication-tests.mjs` globber alle `tests/civication-*.test.js`, inngår Matrix-gaten automatisk i full Civication-suite.

## Hva dette betyr for roadmapen

De fire strukturelt forskjellige pilotene er nå omgjort til en eksplisitt, maskinlesbar grense for hva som faktisk kan generaliseres. Det betyr at vi kan slutte å diskutere Matrix-feltene som forslag: de sju feltene over er nå den permanente v1-gaten.

Det betyr **ikke** at Role World Realism-programmet er ferdig eller at masse-rollout skal starte automatisk. Den tydeligste gjenværende tekniske realismeprøven er cross-role shared world: ett faktisk arbeidsobjekt må overleve perspektivskifte mellom to roller uten å lekke myndighet, sensitive data eller rolleprivilegier. Først etter et slikt bevis og en eksplisitt rollout-policy kan `broad_rollout_allowed` vurderes endret.

## Kvalitetsvurdering

| Dimensjon | Score | Evidens |
| --- | ---: | --- |
| Korrekthet og evidens | 5/5 | Alle låste dimensjoner peker tilbake på flere eksisterende pilotbevis; arkiv behandles som runtime-vertikal, ikke fabrikkert Role World-completion. |
| Dekning og ferdigstillelse | 5/5 | De sju avtalte tverrrollefeltene er maskinlesbare; tre ikke-beviste områder er eksplisitt utsatt. |
| Faglig/redaksjonell kvalitet | 5/5 | Matrixen generaliserer struktur, ikke profesjonenes egne objektarter, faser eller språk. |
| Teknisk integritet | 5/5 | Ingen runtimekode eller sceneformat endres; policy, data og permanent gate er separate fra Career/Role World-status. |
| Sikkerhet og ansvarlighet | 5/5 | Authority leakage, People-fiksjon, sosial-score-inflasjon og cross-role privilege leakage forblir eksplisitte grenser. |
| Vedlikeholdbarhet og etterprøvbarhet | 5/5 | Ett lite maskinlesbart dokument, én permanent test og eksplisitte evidensreferanser holder gaten lesbar og reviderbar. |

**Total: 30/30 innen Matrix/gate-scope.** Bred rollout og hele realism-programmet er fortsatt uferdig til gjenstående gates faktisk er bevist.
