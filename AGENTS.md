# History GO — agentregler

Disse reglene gjelder for hele repositoriet.

## GitHub-tilgang: connector først

- Canonical repository er `Paradispartiet/History-Go`.
- GitHub-connectoren/GitHub App er primær kanal for å lese filer, søke, opprette brancher, skrive filer, åpne PR-er, lese CI og merge.
- Lokal clone, `git fetch`, `git ls-remote` og `gh` er kun en valgfri optimalisering når miljøet faktisk har direkte GitHub-tilgang.
- Feil som `origin missing`, DNS/proxy-feil, `CONNECT tunnel failed`, 403 eller blokkert `git fetch` betyr bare at **lokal git-transport er utilgjengelig**. Det betyr ikke at repositoriet eller GitHub er utilgjengelig.
- En agent skal aldri stoppe repoarbeid eller si at en audit ikke kan utføres bare fordi lokal clone ikke får kontakt med GitHub.

## Obligatorisk fallback-rekkefølge

1. Les og søk i repositoriet gjennom GitHub-connectoren.
2. Gjør endringer gjennom connectoren: branch → filendringer → PR → CI → merge.
3. Gjør statisk audit direkte mot filene hentet gjennom connectoren.
4. Når en audit må kjøre kode mot hele repositoriet, bruk eksisterende GitHub Actions-sjekker eller fjern-auditen i `.github/workflows/remote-audit.yml`.
5. Bruk lokal clone bare dersom den allerede fungerer; lokal clone er aldri en forutsetning for å begynne.

## Fjern-audit uten lokal clone

For en eksplisitt kjørbar audit når lokal git-transport er blokkert:

1. Opprett en branch fra aktuell `main` gjennom GitHub-connectoren.
2. Oppdater `.github/audit-request.json` på branchen med ønsket `suite` og en ny unik `nonce`.
3. Åpne en PR fra samme repository. PR-en starter `Remote repository audit`.
4. Les workflow-run, jobber og logger gjennom GitHub-connectoren.
5. Rapporter faktiske resultater. Ikke presenter en ikke-kjørt audit som kjørt.

Tillatte suites er `data`, `coordinates`, `quiz` og `full`.

## Arbeidsregel

- Skill mellom **statisk audit** og **kjørbar audit**.
- Utfør alltid den statiske delen umiddelbart via connectoren.
- Dersom en kjørbar kontroll mangler en eksisterende suite, utvid den sikre, eksplisitte mappingen i `remote-audit.yml`; aldri kjør vilkårlig kommando fra audit-request-filen.
- Les hele relevante filer før de endres.
- Oppgi konkret hva som ble kontrollert, hvilken commit/PR som inneholder endringen, og hvilke kontroller som faktisk kjørte.
