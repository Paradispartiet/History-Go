# History GO — agentregler

Disse reglene gjelder for hele repositoriet.

## GitHub-arbeid: lokal checkout/`gh` foretrukket, connector tillatt

- Canonical repository er `Paradispartiet/History-Go`.
- Når den faktiske History-Go-checkouten er tilgjengelig, skal lokal `git` og GitHub CLI `gh` normalt brukes som primær operativ kanal for repository-, branch-, PR-, review-, CI-, Actions- og mergearbeid.
- GitHub-connectoren er samtidig en gyldig operativ kanal for både lesing og skriving.
- Connector-only arbeid er uttrykkelig tillatt når lokal History-Go-checkout, `git` eller `gh` ikke er tilgjengelig i den aktive kjøringskonteksten, eller når connectoren dekker oppgaven bedre.
- Manglende lokal checkout eller manglende tilgang til `gh` i den aktive kjøringskonteksten skal ikke alene stoppe arbeid som kan utføres korrekt og etterprøvbart gjennom GitHub-connectoren.
- Agenten skal ikke kreve at brukeren åpner Codespace eller en lokal checkout dersom den forespurte GitHub-operasjonen kan gjennomføres sikkert gjennom connectoren.
- Agenten skal ikke konkludere med at `gh` generelt er «ikke installert» bare fordi det ikke finnes i et isolert skall. Formuler i stedet at `gh` ikke er tilgjengelig i den aktuelle kjøringskonteksten.

## Lokal arbeidsvei når checkout er tilgjengelig

Før lokal GitHub-skriving skal agenten normalt kjøre:

```bash
git rev-parse --show-toplevel
gh --version
gh auth status
gh repo view --json nameWithOwner,defaultBranchRef
```

- `gh repo view` skal bekrefte `Paradispartiet/History-Go` før lokal skriving, push, PR eller merge.
- Bruk lokal `git` for diff, staging, commit, worktree og push når lokal checkout er arbeidsgrunnlaget.
- Bruk `gh` for PR-er, reviews, checks, workflow runs, logger og merge når `gh` er tilgjengelig og egnet.

## Connector-arbeidsvei

Når lokal checkout/`gh` ikke er tilgjengelig, eller connectoren er den operative kanalen:

1. Bekreft repository og aktuell base/head-ref gjennom connectoren.
2. Les relevante filer og metadata før endringer.
3. Bruk connectorens branch-, fil-, commit-, PR-, workflow- og mergeoperasjoner der de finnes.
4. Lås forventet base/head-SHA før kritiske writes eller merge når verktøyet støtter det.
5. Verifiser resultatet ved å lese tilbake fil, commit, PR eller ref etter skriving.
6. Rapporter bare kontroller og handlinger som faktisk er utført.

Connector-only skriving er ikke en nødprosedyre som krever særskilt godkjenning; den er en tillatt normal arbeidsvei når lokal verktøykjede ikke er tilgjengelig.

## Audit og publisering

- Skill mellom statisk audit og kjørbar audit.
- Les hele relevante filer før de endres.
- Kontroller branch, base, forventet SHA og faktisk diff så langt den aktive verktøykjeden tillater det.
- Stage bare avtalte filer når lokal `git` brukes.
- Bruk `gh pr view`, `gh pr checks`, `gh run view`, `gh run watch` og `gh pr merge` når `gh` er arbeidskanalen.
- Bruk tilsvarende connectoroperasjoner for PR-, CI- og mergeflyt når connectoren er arbeidskanalen og operasjonene er tilgjengelige.
- Oppgi konkret branch, commit, PR, head-SHA og kontroller i sluttrapporten når disse finnes.

## Prinsipp ved verktøybegrensning

- Ikke stopp bare fordi én bestemt kanal mangler dersom en annen tilgjengelig kanal kan utføre oppgaven korrekt.
- Ikke erstatt en faktisk nødvendig CI-, test- eller mergekontroll med en antakelse; bruk den beste tilgjengelige kanalen og vær presis om hva som er verifisert.
- Brukerens eksplisitte instruks om å gjennomføre GitHub-arbeid skal følges gjennom connectoren når lokal checkout/`gh` ikke er tilgjengelig, så lenge operasjonen kan utføres sikkert med de tilgjengelige verktøyene.
