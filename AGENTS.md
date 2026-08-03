# History GO — agentregler

Disse reglene gjelder for hele repositoriet.

## GitHub-arbeid: `gh` og lokal checkout først

- Canonical repository er `Paradispartiet/History-Go`.
- GitHub CLI `gh` er installert og skal brukes som primær operativ kanal for repository-, branch-, PR-, review-, CI-, Actions- og mergearbeid.
- Begynn alltid i den faktiske History-Go-checkouten. Ikke bruk en generell artefaktcontainer, PDF-/dokumentcontainer eller et annet isolert skall som grunnlag for å vurdere om `gh` finnes.
- Før GitHub-arbeid skal agenten kjøre:

  ```bash
  git rev-parse --show-toplevel
  gh --version
  gh auth status
  gh repo view --json nameWithOwner,defaultBranchRef
  ```

- `gh repo view` skal bekrefte `Paradispartiet/History-Go` før skriving, push, PR eller merge.
- Tomt resultat fra `command -v gh` i et annet isolert miljø betyr at agenten er i feil kjøringskontekst. Det betyr ikke at `gh` mangler eller må installeres.
- Agenten skal aldri si «gh er ikke installert», be om reinstallasjon eller erstatte `gh` med connectorarbeid uten først å ha gått til den faktiske repository-checkouten og kjørt kontrollene over.
- GitHub-connectoren kan brukes som supplerende metadata- eller nødfallback, men den erstatter ikke `gh` som normal arbeidsvei når brukeren har bedt om `gh`.

## Obligatorisk arbeidsrekkefølge

1. Finn eller åpne den faktiske lokale History-Go-checkouten.
2. Kontroller repo, branch, remote, `gh --version` og `gh auth status`.
3. Synkroniser mot fersk `main` før audit eller produksjon.
4. Bruk lokal `git` for diff, staging, commit, worktree og push.
5. Bruk `gh` for PR-er, reviews, checks, workflow runs, logger og merge.
6. Lås alltid forventet head-SHA før merge.
7. Rapporter bare kontroller som faktisk er kjørt.

## Korrekt diagnose ved feil kontekst

Når `gh` ikke kan kjøres i det aktuelle skallet:

- ikke konkluder med at programmet ikke er installert;
- ikke søk bare i den generelle containerens rotfilsystem;
- lokaliser repository-arbeidsområdet som tidligere History-Go-jobber bruker;
- start et skall i den checkouten og kjør kontrollrekken på nytt;
- fortsett med `gh` så snart riktig arbeidskontekst er aktiv.

## Audit og publisering

- Skill mellom statisk audit og kjørbar audit.
- Les hele relevante filer før de endres.
- Kontroller `git status -sb`, branch, base og faktisk diff før staging.
- Stage bare avtalte filer.
- Bruk `gh pr view`, `gh pr checks`, `gh run view`, `gh run watch` og `gh pr merge` for PR-løpet.
- Oppgi konkret checkout, branch, commit, PR, head-SHA og kontroller i sluttrapporten.
