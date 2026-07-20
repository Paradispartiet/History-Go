# History GO — canonical teknisk arkitektur

Status: **Normativ målarkitektur**  
Gjelder: History GO-hovedproduktet og nye delsystemer som skal inngå i den felles produksjonsplattformen.  

Dette dokumentet er den overordnede tekniske beslutningen for hvordan History GO skal utvikles fra dagens local-first/browser-baserte kodebase til en profesjonell produksjonsapp med tydelige språk-, data-, API- og eierskapsgrenser.

Dokumentet beskriver **målarkitekturen**. Det betyr ikke at alle komponentene er ferdig implementert i dag. Eksisterende local-first-flyt, JavaScript, Supabase-adaptere og andre overgangsløsninger skal migreres kontrollert og uten unødvendig total omskriving.

---

## 1. Beslutning i én setning

> **TypeScript eier klienten. Python/FastAPI eier serverlogikken. PostgreSQL eier muterbar produksjonsdata. Supabase kan levere PostgreSQL, Auth, Storage og avgrenset Realtime-infrastruktur. JSON forblir canonical format for redaksjonelt History GO-innhold.**

Dette er den autoritative språk- og plattformdelingen for ny arkitektur.

---

## 2. Teknologistack

| Lag | Standard | Ansvar |
| --- | --- | --- |
| Web-/appklient | TypeScript | UI, kart, lokal interaksjon, klienttilstand, typed API-klient |
| Eksisterende browserkode | JavaScript → TypeScript | Migreres gradvis gjennom strangler-modellen |
| Server/backend | Python + FastAPI | Forretningslogikk, autoritative writes, sikkerhet, API-er, integrasjoner |
| Serverdatamodeller | Pydantic | Validering av request/response og interne kontrakter |
| Database | PostgreSQL | Brukere, sync, sosial state, moderasjon og annen muterbar serverdata |
| Managed backend-infrastruktur | Supabase | PostgreSQL, Auth, Storage og eventuelt avgrenset Realtime |
| Redaksjonelt innhold | JSON + manifests | Places, people, quiz, fag, ruter og annet canonical spillinnhold |
| Webpresentasjon | HTML + CSS | Struktur og presentasjon; ikke domene-/serverlogikk |
| Node-verktøy | TypeScript (`.ts`/`.mts`) | Build, audits, migreringer og data tooling som allerede tilhører Node-sporet |
| Native kode | Swift/Kotlin kun ved behov | Smale plattformspesifikke integrasjoner som ikke kan løses forsvarlig i web/app-laget |

Ingen ny teknologi skal introduseres bare fordi den er populær. Et nytt rammeverk eller språk må løse et konkret problem som ikke allerede dekkes av denne arkitekturen.

---

## 3. Overordnet systembilde

```text
┌─────────────────────────────────────────────┐
│              HISTORY GO CLIENT              │
│                                             │
│  TypeScript                                 │
│  - kart / places / people                   │
│  - PlaceCard                                │
│  - quiz / progresjon UI                     │
│  - profil / Nearby / ruter                  │
│  - Civication-klientflater                  │
│  - Social Meet / Spotmeeting UI             │
│  - offline/local cache                      │
└──────────────────────┬──────────────────────┘
                       │ HTTPS / JSON
                       │ typed API contract
                       ▼
┌─────────────────────────────────────────────┐
│            HISTORY GO BACKEND               │
│                                             │
│  Python + FastAPI                           │
│  - auth boundary                            │
│  - bruker- og progresjonssync               │
│  - autoritative spill-writes                │
│  - Social Meet / Spotmeeting                │
│  - moderasjon / rate limiting               │
│  - admin / integrasjoner                    │
│  - AHA/andre tjenestekoblinger              │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          DATA / PLATFORM SERVICES           │
│                                             │
│  PostgreSQL                                 │
│  Supabase Auth                              │
│  Supabase Storage                           │
│  Avgrenset Realtime ved dokumentert behov   │
└─────────────────────────────────────────────┘

Canonical redaksjonelt innhold:
JSON + manifests → valideres av tooling → distribueres til klient/backend etter behov
```

---

## 4. Hvem eier hva

### 4.1 TypeScript-klienten eier

Klienten eier presentasjon og brukerinteraksjon:

- kartvisning og kartinteraksjon,
- PlaceCard og andre UI-flater,
- navigasjon og klientruting,
- skjema og input før innsending,
- lokal cache og offline-first-lesing,
- optimistisk UI når det er trygt,
- typed API-klient,
- visning av serverautoritative resultater.

Klienten skal **ikke** være den endelige sannhetskilden for sikkerhetskritiske eller flerbrukerbaserte writes.

### 4.2 Python/FastAPI-backenden eier

Backenden eier serverautoritative regler og mutasjoner:

- identitet og autentiserte serveroperasjoner,
- synkronisering av brukerdata mellom enheter,
- autoritative progresjons- og belønningsoperasjoner når disse flyttes server-side,
- Social Meet / Spotmeeting-regler,
- block/report/moderation,
- rate limiting og misbruksvern,
- administrative operasjoner,
- server-side validering,
- integrasjoner mot eksterne tjenester,
- bakgrunnsjobber som krever servertilgang eller hemmeligheter.

UI skal ikke duplisere serverens forretningsregler som en alternativ sannhet. Klienten kan ha forhåndsvalidering for brukeropplevelse, men serveren må validere på nytt.

### 4.3 PostgreSQL eier

PostgreSQL er sannhetskilden for muterbar produksjonsdata som må deles på tvers av enheter eller brukere, blant annet:

- konto-/profilkoblinger,
- server-syncet progresjon,
- brukerinnstillinger som skal følge brukeren,
- Social Meet-profiler,
- Spotmeeting-invitasjoner og tilstander,
- blocks/reports/moderation,
- audit- og operasjonsdata der det er nødvendig og personvernmessig forsvarlig.

PostgreSQL skal ikke bli et tilfeldig lager for statisk redaksjonelt innhold som allerede har en etablert canonical JSON-pipeline.

### 4.4 JSON + manifests eier

Redaksjonelt History GO-innhold forblir filbasert og versjonskontrollert når dette er riktig modell:

- places,
- people,
- quiz,
- fag/emner/pensum,
- ruter,
- stories,
- Wonderkammer-innhold,
- andre redaksjonelle datasett med etablert manifest- og auditflyt.

Disse dataene skal fortsatt valideres med repoets eksisterende tooling. De skal ikke flyttes til database bare for å «modernisere» teknologistacken.

---

## 5. Supabase sin rolle

Supabase er **plattform/infrastruktur**, ikke eieren av History GO sin forretningslogikk.

Målrollen er:

- managed PostgreSQL,
- autentisering,
- sikker lagring av filer/brukeropplastinger der det er nødvendig,
- eventuelt Realtime for avgrensede, eksplisitt dokumenterte sync-behov.

### Viktig grense

Klientkode skal ikke få brede eller privilegerte databaseadganger.

- Service-role-nøkler skal aldri ligge i klienten.
- Sensitive eller komplekse writes skal gå gjennom FastAPI.
- Eksisterende direkte Supabase-adaptere kan leve under migreringen der RLS-kontrakten allerede er trygg, men de er ikke automatisk målarkitekturen for all ny backendfunksjonalitet.
- RLS skal fortsatt brukes som forsvar i dybden der klienten har legitim direkte tilgang.

Eksisterende Social Meet-SQL er standard PostgreSQL og kan derfor gjenbrukes selv om FastAPI blir det autoritative serverlaget.

---

## 6. API-kontrakten

FastAPI er den primære HTTP-grensen mellom klient og server.

### Regler

1. Alle nye produksjonsendepunkter skal ha eksplisitte Pydantic request- og response-modeller.
2. FastAPI/OpenAPI er canonical beskrivelse av HTTP-kontrakten.
3. TypeScript-klienten skal bruke en liten, sentral API-klient i stedet for spredte `fetch()`-kall i UI-filer.
4. Domene- og feilstatus skal bruke stabile maskinlesbare koder, ikke være avhengig av fritekst.
5. API-versjonering innføres når en inkompatibel produksjonskontrakt faktisk krever det; ikke versjoner alt på forhånd uten behov.
6. UI-komponenter skal ikke eie autentiserings-, database- eller retrylogikk direkte.

Mål:

```text
UI
 ↓
TypeScript service/API client
 ↓
FastAPI endpoint
 ↓
Python domain/service layer
 ↓
repository/database layer
 ↓
PostgreSQL
```

---

## 7. Backendstruktur

Ny produksjonsbackend skal organiseres som en egen, tydelig kodeflate, for eksempel:

```text
backend/
  app/
    api/
      routes/
    auth/
    core/
    domains/
      users/
      progression/
      social_meet/
      spotmeeting/
      moderation/
      civication/
      integrations/
    models/
    schemas/
    services/
    repositories/
    main.py
  tests/
  migrations/
  pyproject.toml
  README.md
```

Dette er et målprinsipp, ikke et krav om å opprette tomme mapper før de trengs.

### Lagdeling

- `api/`: HTTP og transport.
- `schemas/`: Pydantic input/output-kontrakter.
- `domains/` / `services/`: forretningsregler.
- `repositories/`: database- og persistensgrense.
- `auth/`: autentisering/autorisasjon.
- `core/`: konfigurasjon og tverrgående teknisk infrastruktur.

FastAPI-route-funksjoner skal være tynne. Forretningslogikk skal ikke samles direkte i route-handlerne.

---

## 8. Frontendstruktur og TypeScript-migrering

History GO-klienten migreres gradvis fra legacy JavaScript til ekte TypeScript.

Den eksisterende esbuild-strangleren beholdes som overgangsmekanisme:

```text
legacy .js
  ↓ én kontrollert modul om gangen
.ts source
  ↓ esbuild
committed dist/web bundle
  ↓
eksisterende HTML-konsumenter
```

På lengre sikt er målet:

- TypeScript som standard for ny klientlogikk,
- mindre avhengighet av `window.X`,
- eksplisitte imports/exports,
- modulgrenser med tydelige typer,
- `strict` TypeScript for nye og ferdigmigrerte kodeflater,
- sentral API-klient,
- færre skjulte avhengigheter til scriptrekkefølge.

Det er **ikke** et mål å totalomskrive fungerende History GO i én stor rewrite.

---

## 9. `strict` TypeScript

Ny, selvstendig TypeScript-kode bør være strict som standard.

Migreringsrekkefølgen er:

1. ekte `.ts`-modul,
2. tydelige typer og kontrakter,
3. fjern midlertidige `any`/`@ts-nocheck` når kodeflaten er stabil,
4. aktiver strengere compiler-regler per avgrenset område,
5. flytt flere områder inn i den strengere konfigurasjonen.

Repoet skal ikke slå på maksimal strictness globalt dersom dette bare skaper tusenvis av urelaterte legacy-feil. Strenghet skal økes kontrollert uten å stoppe all annen utvikling.

---

## 10. Offline-first og synk

History GO skal fortsatt kunne være robust ved dårlig eller manglende nettverk.

Offline-first betyr ikke at localStorage skal forbli permanent produksjonsdatabase for alle funksjoner.

### Målmodell

- statisk/redaksjonelt innhold kan caches lokalt,
- klienten kan ha lokal state for rask UI og offline arbeid,
- brukerdata som skal følge brukeren får en eksplisitt sync-modell,
- konflikter og idempotens må defineres per domene,
- flerbrukerdata er serverautoritativt.

Det skal ikke innføres én generisk «sync alt»-mekanisme uten domeneregler.

---

## 11. Autentisering og autorisasjon

Målmodellen er:

1. Supabase Auth autentiserer brukeren.
2. Klienten mottar brukerens normale session/JWT.
3. FastAPI verifiserer tokenet på serveren.
4. FastAPI mapper autentisert identitet til History GO sine interne profiler og rettigheter.
5. Autorisasjon kontrolleres per operasjon på serveren.

Et gyldig token er ikke i seg selv nok til å få tilgang til alle ressurser.

Admin- og moderasjonsoperasjoner skal ha eksplisitte roller/permissions og egne tester.

---

## 12. Social Meet / Spotmeeting

Eksisterende privacy-, identity-, invite- og moderation-kontrakter gjelder fortsatt.

Den langsiktige implementasjonen skal passe inn i denne arkitekturen:

```text
TypeScript Social Meet UI
          ↓
FastAPI social/spotmeeting API
          ↓
server-side policy + state machine
          ↓
PostgreSQL / eksisterende Supabase-schema
```

Eksisterende Supabase-tabeller og RLS er verdifulle og kan gjenbrukes. Kritiske tilstandsoverganger, moderasjon, rate limiting og operasjonelle regler skal likevel være serverautoritative når produksjonsbackenden er aktivert.

Ingen arkitekturendring opphever de eksisterende personvernforbudene mot blant annet live location, nearby people, presence, public visit history eller fri chat.

---

## 13. AHA og andre delsystemer

AHA, Civication og andre større delsystemer skal integreres gjennom tydelige data-/API-grenser når de trenger produksjonsserveren.

Regel:

- Ikke la to delsystemer skrive direkte i hverandres interne state.
- Ikke del database-tabeller tilfeldig bare fordi de ligger i samme prosjekt.
- Del eksplisitte kontrakter, API-er eller events.
- Hvert subsystem skal ha tydelig eier av sin sannhet.

Når et eksisterende subsystem har sin egen runtime eller serverhistorikk, skal det migreres inn i felles plattform bare gjennom en egen, dokumentert beslutning.

---

## 14. Testing og kvalitetsporter

### Frontend

Obligatoriske relevante kontroller:

- TypeScript typecheck,
- build/sync-kontroll,
- målrettede unit/integration tests,
- Playwright eller tilsvarende end-to-end for sentrale produksjonsflyter,
- domenespesifikke audits og datagates.

### Backend

Når `backend/` etableres, skal den ha:

- `pytest` som standard testløper,
- tester for API-kontrakter,
- tester for domene-/state-machine-regler,
- database-/repository-tester der nødvendig,
- auth- og permission-tester,
- migrasjonstester/smoke checks,
- formatter/linter/typecheck som egne CI-gates.

Python-kode skal bruke type hints konsekvent. Typekontroll skal inngå i CI når backendsporet etableres.

### Kontrakter mellom frontend og backend

En endring i API-kontrakten skal testes på begge sider eller gjennom generert/validerbar kontrakt. Det skal ikke være mulig å endre et response-felt tilfeldig uten at en relevant gate oppdager bruddet.

---

## 15. Sikkerhet og hemmeligheter

- Ingen service-role-nøkler eller private secrets i browserkode eller committed config.
- Secrets leveres gjennom produksjonsmiljøets secret management.
- Serveren validerer all ubetrodd input.
- Databaseoperasjoner følger least privilege.
- Sensitiv logging skal unngås.
- Personvernregler i Social Meet-kontraktene er bindende.
- Adminendepunkter skal være rollebeskyttet og auditerbare.

---

## 16. Observability og drift

Produksjonsbackenden skal ha strukturert observability fra starten:

- strukturerte logger,
- request/correlation-id,
- feilrapportering,
- helseendepunkt,
- latency/error-rate-målinger,
- database- og migrasjonsstatus,
- personvernbevisst auditlogging der det er nødvendig.

Observability skal aldri brukes som bakdør for å lagre data produktkontraktene forbyr.

---

## 17. Deploymodell

Målarkitekturen skiller klient og server:

```text
Frontend build/static hosting
          +
Python/FastAPI service
          +
Managed PostgreSQL/Supabase services
```

Deployleverandør er ikke en del av den permanente domene-arkitekturen. Plattformen skal kunne flyttes uten at klient- eller domenekode må skrives om.

Backend skal derfor konfigureres gjennom miljøvariabler og standardiserte database-/HTTP-kontrakter, ikke leverandørspesifikke globale antakelser.

---

## 18. Migreringsplan

### Fase 0 — arkitekturkontrakt

- Denne beslutningen er canonical.
- Oppdater TypeScript-policy og utviklerdokumentasjon slik at de ikke omtaler hele serverstakken som TypeScript.
- Nye backendbeslutninger skal følge Python/FastAPI-retningen.

### Fase 1 — profesjonell backendgrunnmur

Opprett først når faktisk backendimplementasjon starter:

- `backend/` med FastAPI,
- `pyproject.toml`,
- konfigurasjon/miljøvariabler,
- health endpoint,
- testoppsett,
- lint/typecheck,
- CI-gate,
- databasekobling uten å flytte spilldata ennå.

### Fase 2 — auth boundary

- verifiser Supabase Auth-token i FastAPI,
- etabler intern bruker-/profilidentitet,
- definer permissions,
- hold klienten kompatibel med local-first modus under migreringen.

### Fase 3 — første serverautoritative domene

Velg ett tydelig domene med reelt produksjonsbehov og migrer ende-til-ende.

Gode kandidater er:

- brukerprofil/sync,
- Social Meet identity,
- Spotmeeting invite persistence.

Ikke migrer fem domener samtidig.

### Fase 4 — progresjon og cross-device sync

- definer canonical servermodell per progresjonsdomene,
- migrer uten å duplisere eksisterende sannheter,
- bevar offline-first klientcache,
- bygg eksplisitt conflict/idempotency-strategi.

### Fase 5 — Social Meet produksjonsbackend

Følg eksisterende roadmap og safety gates for:

- identity,
- opt-in publication,
- invite lifecycle,
- block/report,
- moderation,
- rate limiting,
- rollout controls.

### Fase 6 — konsolidering

- reduser direkte Supabase-kall fra UI,
- reduser legacy-globals,
- stram TypeScript strictness,
- samle API-klient og kontrakter,
- fjern overgangsadaptere først når alle konsumenter er migrert.

---

## 19. Hva vi eksplisitt ikke skal gjøre

- Ikke skriv hele appen om fra bunnen av.
- Ikke migrer JSON-innhold til database uten et faktisk produktbehov.
- Ikke skriv ny produksjonsbackend i tilfeldig Node/TypeScript bare fordi frontend bruker TypeScript.
- Ikke la klienten bli autoritativ for sikkerhetskritiske flerbrukeroperasjoner.
- Ikke la alle UI-filer kalle Supabase eller FastAPI direkte.
- Ikke introduser microservices før én modulær backend faktisk trenger å deles.
- Ikke innfør Kubernetes eller tung plattforminfrastruktur uten et dokumentert skaleringsbehov.
- Ikke fjern local-first-egenskaper bare fordi en backend introduseres.
- Ikke la en total rewrite stoppe produktutviklingen.

---

## 20. Beslutningsregler for nye PR-er

Når ny kode opprettes:

- Browser/app-logikk → **TypeScript**.
- Server-/API-/autoritativ backendlogikk → **Python/FastAPI**.
- Node-basert repo tooling → **TypeScript**.
- Canonical redaksjonelt innhold → eksisterende **JSON/dataformat**.
- Databaseendring → **PostgreSQL migration**.
- Presentasjon → eksisterende **HTML/CSS** eller godkjent framtidig klientarkitektur.

Dersom en PR ønsker å bryte denne matrisen, skal begrunnelsen dokumenteres eksplisitt før implementasjon.

---

## 21. Dokumentprioritet

Ved konflikt om teknisk målarkitektur gjelder:

1. `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` — overordnet teknisk målarkitektur og språk-/plattformdeling.
2. `docs/TYPESCRIPT_FIRST_POLICY.md` — klient-, browser- og Node-TypeScript-policy samt CI.
3. `docs/typescript-migration-plan.md` — operativ browser-migrering.
4. Backend-/domene-kontrakter, for eksempel Social Meet-dokumentene — domeneregler innenfor målarkitekturen.
5. `TYPESCRIPT_MIGRATION.md` — historisk migreringsjournal.

Eldre dokumenter som beskriver Supabase som hele backenden, TypeScript som standardspråk for all programkode eller en direkte klient→database-modell skal forstås som implementasjonshistorikk eller overgangsløsning dersom de strider mot dette dokumentet.

---

## Kortversjon

**Klient:** TypeScript.  
**Backend:** Python + FastAPI.  
**Database:** PostgreSQL.  
**Plattform:** Supabase for database/auth/storage og avgrensede plattformtjenester.  
**Innhold:** JSON + manifests.  
**Migrering:** gradvis, testet og uten total rewrite.  
**Prinsipp:** UI presenterer, serveren håndhever, databasen lagrer muterbar produksjonssannhet, og canonical innhold forblir versjonskontrollert.