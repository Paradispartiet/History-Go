# 🧰 HISTORY GO — README_DEV
Operativ utvikler-README: hvordan du kjører, feilsøker, validerer data, og jobber trygt i team.

Dette dokumentet er skrevet for **daglig drift**: “hva gjør jeg når X skjer?”.

---

## 0) Kjerne-fasit (kort)
- **Ingen `core.js`**: `app.js` er orkestrator og står for init + progresjon + AHA-export.  [oai_citation:0‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)
- **DataHub er datasentralen** for lasting/caching/enrichment. 
- **QuizEngine** gir rewards/hooks (insights + knowledge + trivia) på riktige svar. 
- **Knowledge/Trivia** lagres i egne univers og trigger `updateProfile`.  [oai_citation:1‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)  [oai_citation:2‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)
- **AHA-bridge**: HG skriver `aha_import_payload_v1`, AHA importerer med knapp.  [oai_citation:3‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)  [oai_citation:4‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)

---

## 1) Kjøring lokalt (uten surprises)
### Anbefalt
- Kjør fra en lokal webserver (ikke `file://`), pga service worker og fetch.
- Åpne:
  - `index.html` (hovedapp)  [oai_citation:5‡index.html](sediment://file_00000000d58c720c8a39ec5ab4986634)
  - `profile.html` (profil)  [oai_citation:6‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)
  - `AHA/index.html` (AHA)  [oai_citation:7‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)

### Offline-test
- Først: last siden online (så SW får cache).
- Deretter: slå av nett / flymodus → reload.
- SW-strategi:
  - HTML: network-first → cache fallback
  - static: cache-first  [oai_citation:8‡sw.js](sediment://file_00000000b114720aa19a322a09c81c5a)

---

## 2) Debug-hurtigknapper (validering)

### A) DomainHealthReport (domener + filer)
**Når:** etter endring i domener, merkesider, quiz-filer, emner.  
**Hvorfor:** fanger feil filnavn/alias og manglende domene-filer tidlig.  [oai_citation:9‡domainHealthReport.js](sediment://file_00000000e7f471f4aedee10968b3595c)

Kjør i konsoll:
```js
DomainHealthReport.run({ toast: true });
```

---

## Codex/GitHub: verifiser at `origin` faktisk fungerer
I Codex-runner skal tasken normalt provisioneres via GitHub-integrasjonen, og `origin` skal da eksistere automatisk.
Hvis `origin` mangler, behandle det som et provisioning/integration-problem (ikke som vanlig repo-feil).

### Hurtigsjekk
```bash
git remote get-url origin
git ls-remote --heads origin main
git fetch origin "+refs/heads/main:refs/remotes/origin/main" --prune
git rev-parse --verify refs/remotes/origin/main
```
Bruk full refspec/full ref som over for å unngå tvetydig fetch i Codespaces.

### Repo-script (anbefalt)
```bash
./scripts/verify-git-origin.sh
```

Scriptet stopper med feilkode hvis:
- `origin` mangler
- `origin` ikke kan nås
- `origin/main` ikke kan verifiseres

Valgfrie argumenter:
```bash
./scripts/verify-git-origin.sh <remote> <branch>
```
Eksempel:
```bash
./scripts/verify-git-origin.sh upstream main
```

### Operativ regel før migrering (TypeScript/JSDoc)
- Hvis scriptet feiler på **remote missing**: stopp migreringsarbeid og løs runner-provisioning/GitHub-integrasjon først.
- Hvis scriptet feiler med **`CONNECT tunnel failed, response 403`**: stopp migreringsarbeid og behandle det som runner/proxy/GitHub-integrasjon-problem.
- Ikke start TypeScript/JSDoc-migrering før scriptet passerer.

### Om manuell `git remote add origin ...`
Manuell `git remote add origin https://github.com/Paradispartiet/History-Go.git` kan brukes lokalt eller diagnostisk,
men er ikke en fullverdig løsning i Codex-runner hvis proxy/auth fortsatt blokkerer `fetch`.
