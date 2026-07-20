# History GO — TypeScript-first policy

Status: **Normativ språk- og CI-policy for klientkode og Node-verktøy.**

Den overordnede tekniske målarkitekturen ligger i `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` og har høyere prioritet ved konflikt.

Denne policyen beskriver hvordan History GO sin **browser/app-klient**, eksisterende JavaScript og repoets Node-baserte scripts/tools skal utvikles. Den gjelder ikke som språkvalg for produksjonsbackenden.

---

## Beslutning

History GO er **TypeScript-first på klienten og i Node-tooling**.

Produksjonsbackenden skal følge den separate canonical beslutningen:

- **Klient/browser/app:** TypeScript.
- **Produksjonsbackend/server/API:** Python + FastAPI.
- **Node scripts/tools:** TypeScript (`.ts`/`.mts`).
- **Database:** PostgreSQL.
- **Redaksjonelt canonical innhold:** eksisterende JSON/dataformater.
- **HTML/CSS:** beholdes som presentasjonsformater der de eier ansvaret.

Det betyr for denne policyens kodeflate:

- Ny browser-/app-logikk skal som hovedregel skrives i TypeScript.
- Nye browsermoduler skal opprettes som `.ts` og bygges gjennom den etablerte esbuild-pipelinen så lenge strangler-migreringen pågår.
- Nye Node-verktøy og automatiseringsscripts skal skrives i `.ts` eller `.mts`.
- Eksisterende JavaScript er legacy-kode som kan leve videre mens den gradvis migreres.
- JSON for places, people, quiz, pensum og annet innhold skal ikke gjøres om til TypeScript bare for språkets skyld.
- Ny server-/API-logikk skal ikke legges i Node/TypeScript uten en eksplisitt arkitekturendring; målarkitekturen for backend er Python/FastAPI.

TypeScript er dermed det profesjonelle standardspråket for klientprogramkode og repoets Node-tooling, ikke for absolutt all kode i hele plattformen.

---

## Viktig skille: moderne kode og legacy-baseline

Historisk har root-`tsconfig.json` brukt `allowJs` + `checkJs` til å typeanalysere store deler av den gamle JavaScript-kodebasen. Dette har vært nyttig i migreringen, men det kan også føre til at gamle eller urelaterte typefeil blir en generell merge-blokkering.

Derfor gjelder følgende prinsipp:

> En ny eller endret modul skal holdes til den kvalitetsstandarden den selv tilhører. Historisk typegjeld i urelatert legacy-JavaScript skal ikke være en permanent, generell portvakt for alle fremtidige PR-er.

CI skal skille mellom:

1. Moderne TypeScript-kode som må være grønn.
2. Bygg og genererte artefakter som må være i sync.
3. Målrettede data- og domenekontroller som må være grønne når de berørte områdene endres.
4. Legacy-baseline som skal overvåkes og forbedres, men ikke automatisk blokkere enhver urelatert endring på grunn av eksisterende gjeld.
5. Framtidig Python-backend, som skal få egne Python-kvalitetsporter når `backend/` etableres.

---

## Regler for ny klientkode

### Browser/app-kode

Ny browserlogikk skal som hovedregel:

- skrives i TypeScript,
- registreres i `build/build-web.mjs` når den er et eget migrert entrypoint i dagens strangler-arkitektur,
- bygges med `npm run build:web`,
- valideres med `npm run typecheck:web`,
- beholde nødvendige `window.X`-interop-kontrakter så lenge legacy-konsumenter fortsatt finnes,
- committe oppdatert `dist/web/` når den etablerte buildmodellen krever det,
- bevege seg mot eksplisitte imports/exports og bort fra nye globale avhengigheter,
- bruke en sentral API-/servicegrense når den kommuniserer med framtidig FastAPI-backend.

Se `docs/typescript-migration-plan.md` for den detaljerte strangler-prosessen.

### Node-verktøy og scripts

Nye verktøy og automatiseringsscripts skal skrives i TypeScript (`.ts`/`.mts`) og bruke de etablerte `typecheck:*`- og `build:*`-løpene.

Node-tooling er et repo-/buildvalg og betyr ikke at produksjonsbackenden skal være Node-basert.

### Produksjonsbackend

Ny autoritativ serverlogikk, HTTP-API-er og backenddomener skal følge `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`:

- Python,
- FastAPI,
- Pydantic-kontrakter,
- PostgreSQL,
- Supabase som avgrenset plattform/infrastruktur der relevant.

Backend får egne lint-, test- og typecheck-gates når den kodeflaten etableres.

### Data og innhold

Data skal fortsatt bo i de canonical formatene repoet allerede bruker. TypeScript og Python skal brukes til å validere og behandle data, ikke til å erstatte JSON som innholdsformat uten et reelt produktbehov.

---

## Regler når legacy-JavaScript endres

En liten, lokal feilretting krever ikke automatisk full migrering av en stor legacy-fil.

Når en legacy-modul derimot får en vesentlig ombygging, ny arkitektur eller større ny funksjonalitet, skal TypeScript-migrering vurderes som en del av arbeidet.

Tommelregel:

- liten og trygg patch → behold filformatet hvis migrering ville øke risikoen vesentlig,
- ny klientmodul → TypeScript,
- større omskriving av eksisterende klientmodul → migrer til TypeScript når det er praktisk og trygt,
- delt kjernefil med mange globale konsumenter → følg strangler-planen og migrer kontrollert,
- ny backendmodul → Python/FastAPI, ikke ny browser-/Node-JavaScript.

Det skal ikke opprettes ny løs, utypet JavaScript som et permanent mønster når samme klientfunksjon naturlig kan implementeres i TypeScript.

---

## `strict` TypeScript

Målretningen er strengere TypeScript, men ikke en risikofylt global bryter som stopper all utvikling på grunn av legacy-gjeld.

- Ny, avgrenset TypeScript-kode bør være strict som standard.
- Nye delte kontrakter skal være eksplisitt typet.
- `any` og `@ts-nocheck` skal behandles som overgangsgjeld når de brukes.
- Eksisterende migrerte moduler strammes gradvis når kodeflaten er stabil.
- Strengere compiler-regler innføres per avgrenset kodeflate før de gjøres globale.

---

## CI- og merge-policy

### Skal kunne blokkere merge

- typefeil i ny eller migrert TypeScript-kode,
- feil i relevante builds,
- `dist/web` ute av sync med TypeScript-kilden,
- målrettede tester som dekker endret funksjonalitet,
- relevante datakontrakter, indekskontroller og domenegates,
- nye typefeil som faktisk introduseres i den berørte legacy-kodeflaten,
- framtidige Python-backend-feil i lint/typecheck/tests når backendsporet etableres.

### Skal ikke være en generell merge-blokkering

- eksisterende typegjeld i urelaterte legacy-filer,
- historiske baseline-feil som PR-en ikke har introdusert,
- brede repo-sjekker som feiler på et helt annet subsystem enn det PR-en endrer, med mindre feilen viser et reelt kontraktsbrudd eller en integrasjonsregresjon.

En bred baseline-sjekk kan fortsatt kjøres som observasjon og rapportering. Den skal ikke forveksles med en presis kvalitetsgate.

---

## TypeScript guard — implementert modell

GitHub Actions-workflowen `.github/workflows/typescript-guard.yml` følger denne policyen for dagens TypeScript-/JavaScript-kodeflate:

- `npm run typecheck:web` er en hard gate for migrert browser-TypeScript.
- `npm run build:web:check` er en hard gate og stopper når committed `dist/web` er ute av sync med TypeScript-kilden.
- `npm run typecheck:scripts` og `npm run build:scripts` er harde gates for Node-scripts.
- `npm run typecheck:tools` og `npm run build:tools` er harde gates for verktøy.
- Root-`npm run typecheck` brukes fortsatt til å overvåke legacy-JavaScript med `allowJs`/`checkJs`.
- På pull requests sammenlignes den normaliserte root-diagnostikken med PR-ens base. Bare nye diagnostikkfeil som PR-en introduserer stopper gaten; eksisterende baseline-gjeld gjør det ikke.
- Linje- og kolonneposisjoner normaliseres i sammenligningen, slik at rene linjeforskyvninger ikke feilaktig registreres som nye typefeil.
- På `main` og manuelle kjøringer kjøres den brede root-sjekken observasjonelt, mens de moderne TypeScript- og build-gatene fortsatt er obligatoriske.

Når Python-backenden etableres, skal den få en separat CI-workflow eller tydelig separat jobb. Python-kvalitet skal ikke presses inn i TypeScript-guarden.

---

## Prioritet ved konflikt mellom dokumenter

For teknisk språk- og plattformvalg gjelder:

1. `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` — overordnet teknisk målarkitektur.
2. `docs/TYPESCRIPT_FIRST_POLICY.md` — klient-/Node-TypeScript og dagens TypeScript-CI.
3. `docs/typescript-migration-plan.md` — operativ migreringsmetode for browser-runtime.
4. `TYPESCRIPT_MIGRATION.md` — historikk og fasejournal for migreringsarbeidet.

Eldre formuleringer om at TypeScript skal være standardspråk for all programkode skal forstås som for brede. TypeScript gjelder klient og Node-tooling; Python/FastAPI gjelder produksjonsbackenden.

---

## Kortversjon

**Klientprogramkode: TypeScript.**

**Produksjonsbackend: Python + FastAPI.**

**Node tooling: TypeScript.**

**Legacy-JavaScript: migreres gradvis og kontrollert.**

**Data: beholdes i canonical dataformater.**

**CI: skal stoppe reelle regresjoner, ikke la gammel urelatert typegjeld blokkere alt.**