# History GO — TypeScript-first policy

Dette dokumentet er den overordnede kodepolicyen for nye og vesentlig endrede programmoduler i History GO.

Den eksisterende migreringshistorikken i `TYPESCRIPT_MIGRATION.md` og den operative strangler-planen i `docs/typescript-migration-plan.md` beskriver **hvordan** kode flyttes stegvis. Dette dokumentet beskriver **hvilken retning som gjelder nå**.

## Beslutning

History GO er et **TypeScript-first prosjekt**.

Det betyr:

- Ny programlogikk skal som hovedregel skrives i TypeScript.
- Nye browsermoduler skal opprettes som `.ts` og bygges gjennom den etablerte esbuild-pipelinen.
- Nye Node-verktøy og scripts skal skrives i `.ts` eller `.mts`.
- Eksisterende JavaScript er legacy-kode som kan leve videre mens den gradvis migreres.
- JSON for places, people, quiz, pensum og annet innhold forblir datafiler og skal ikke gjøres om til TypeScript bare for språkets skyld.
- HTML og CSS forblir HTML og CSS.

TypeScript er det profesjonelle standardspråket for programkoden i repoet. Målet er ikke å bytte til et annet språk, men å få en tydeligere, mer typesikker og mer vedlikeholdbar kodebase.

## Viktig skille: moderne kode og legacy-baseline

Historisk har root-`tsconfig.json` brukt `allowJs` + `checkJs` til å typeanalysere store deler av den gamle JavaScript-kodebasen. Dette har vært nyttig i migreringen, men det kan også føre til at gamle eller urelaterte typefeil blir en generell merge-blokkering.

Derfor gjelder følgende prinsipp:

> En ny eller endret modul skal holdes til den kvalitetsstandarden den selv tilhører. Historisk typegjeld i urelatert legacy-JavaScript skal ikke være en permanent, generell portvakt for alle fremtidige PR-er.

Dette betyr ikke at kvalitetssjekker skal fjernes. Det betyr at CI skal skille mellom:

1. **Moderne TypeScript-kode som må være grønn.**
2. **Bygg og genererte artefakter som må være i sync.**
3. **Målrettede data- og domenekontroller som må være grønne når de berørte områdene endres.**
4. **Legacy-baseline som skal overvåkes og forbedres, men ikke automatisk blokkere enhver urelatert endring på grunn av eksisterende gjeld.**

## Regler for ny kode

### Browserkode

Ny browserlogikk skal som hovedregel:

- skrives i TypeScript,
- registreres i `build/build-web.mjs` når den er et eget migrert entrypoint,
- bygges med `npm run build:web`,
- valideres med `npm run typecheck:web`,
- beholde nødvendige `window.X`-interop-kontrakter så lenge legacy-konsumenter fortsatt finnes,
- committe oppdatert `dist/web/` når den etablerte buildmodellen krever det.

Se `docs/typescript-migration-plan.md` for den detaljerte strangler-prosessen.

### Node-verktøy og scripts

Nye verktøy og automatiseringsscripts skal skrives i TypeScript (`.ts`/`.mts`) og bruke de etablerte `typecheck:*`- og `build:*`-løpene.

### Data og innhold

Data skal fortsatt bo i de canonical formatene repoet allerede bruker. TypeScript skal brukes til å validere og behandle data, ikke til å erstatte JSON som innholdsformat.

## Regler når legacy-JavaScript endres

En liten, lokal feilretting krever ikke automatisk full migrering av en stor legacy-fil.

Når en legacy-modul derimot får en vesentlig ombygging, ny arkitektur eller større ny funksjonalitet, skal TypeScript-migrering vurderes som en del av arbeidet.

Tommelregel:

- liten og trygg patch → behold filformatet hvis migrering ville øke risikoen vesentlig,
- ny modul → TypeScript,
- større omskriving av eksisterende modul → migrer til TypeScript når det er praktisk og trygt,
- delt kjernefil med mange globale konsumenter → følg strangler-planen og migrer kontrollert.

Det skal ikke opprettes ny løs, utypet JavaScript som et permanent mønster når samme funksjon naturlig kan implementeres i TypeScript.

## CI- og merge-policy

Målbildet for CI er:

### Skal kunne blokkere merge

- typefeil i ny eller migrert TypeScript-kode,
- feil i relevante builds,
- `dist/web` ute av sync med TypeScript-kilden,
- målrettede tester som dekker endret funksjonalitet,
- relevante datakontrakter, indekskontroller og domenegates,
- nye typefeil som faktisk introduseres i den berørte kodeflaten.

### Skal ikke være en generell merge-blokkering

- eksisterende typegjeld i urelaterte legacy-filer,
- historiske baseline-feil som PR-en ikke har introdusert,
- brede repo-sjekker som feiler på et helt annet subsystem enn det PR-en endrer, med mindre feilen viser en reell kontraktsbrudd eller integrasjonsregresjon.

En bred baseline-sjekk kan fortsatt kjøres som observasjon og rapportering. Den skal ikke forveksles med en presis kvalitetsgate.

## TypeScript guard — implementert modell

GitHub Actions-workflowen `.github/workflows/typescript-guard.yml` følger denne policyen:

- `npm run typecheck:web` er en hard gate for migrert browser-TypeScript.
- `npm run build:web:check` er en hard gate og stopper når committed `dist/web` er ute av sync med TypeScript-kilden.
- `npm run typecheck:scripts` og `npm run build:scripts` er harde gates for Node-scripts.
- `npm run typecheck:tools` og `npm run build:tools` er harde gates for verktøy.
- Root-`npm run typecheck` brukes fortsatt til å overvåke legacy-JavaScript med `allowJs`/`checkJs`.
- På pull requests sammenlignes den normaliserte root-diagnostikken med PR-ens base. Bare nye diagnostikkfeil som PR-en introduserer stopper gaten; eksisterende baseline-gjeld gjør det ikke.
- Linje- og kolonneposisjoner normaliseres i sammenligningen, slik at rene linjeforskyvninger ikke feilaktig registreres som nye typefeil.
- På `main` og manuelle kjøringer kjøres den brede root-sjekken observasjonelt, mens de moderne TypeScript- og build-gatene fortsatt er obligatoriske.

Dette er den operative merge-modellen. Den brede legacy-sjekken er fortsatt verdifull som migreringssignal, men er ikke lenger en generell null-gjeld-portvakt for alle PR-er.

## Prioritet ved konflikt mellom dokumenter

For språkvalg og TypeScript-retning gjelder denne prioriteten:

1. `docs/TYPESCRIPT_FIRST_POLICY.md` — overordnet beslutning og kvalitetsprinsipp.
2. `docs/typescript-migration-plan.md` — operativ migreringsmetode for browser-runtime.
3. `TYPESCRIPT_MIGRATION.md` — historikk og fasejournal for migreringsarbeidet.

Eldre formuleringer om at TypeScript bare er en utviklingssjekk over JavaScript skal forstås som historisk kontekst, ikke som dagens målarkitektur.

## Kortversjon

**Ny programkode: TypeScript.**

**Legacy-JavaScript: migreres gradvis og kontrollert.**

**Data: beholdes i canonical dataformater.**

**CI: skal stoppe reelle regresjoner, ikke la gammel urelatert typegjeld blokkere alt.**
