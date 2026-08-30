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

## Place production: obligatorisk READ-FIRST-gate

Disse reglene gjelder hver gang en agent, assistent eller automasjon oppretter, fullfører eller vesentlig reviderer et canonical Place.

**Stedsproduksjon skal aldri starte fra hukommelse, chatsammendrag, gamle workcards eller mønsterkopiering fra et annet sted.** Før produksjonsprofil, samlinger, medlemmer, kategoriuttrykk, Stories, quizomfang eller annen stedsspesifikk innholdsplan bestemmes, skal gjeldende branch-versjoner av disse filene leses:

1. `docs/PLACE_PRODUCTION_CHECKLIST.md`
2. `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`
3. `docs/PLACE_PRODUCTION_PROFILES.md`
4. `data/places/README_place_rounds.md`
5. `data/badges/index.json`
6. `data/badges/place_production_routing_v1.json`
7. gjeldende Place-kategoris canonical `data/badges/<badge>.json`
8. `docs/PLACE_OBJECTS_CANONICAL.md`
9. `data/brands/brand_rules_v1_1.json`

Deretter skal den canonicale rekkefølgen gjennomføres: **Hovedbadge → underbadges → source review → confirmed produksjonsprofil → endelig innholdsplan**.

### Obligatorisk preflight-bevis

Et nytt eller vesentlig revidert fullprofil-sted skal ha et aktuelt stedsproduksjons-workcard med `rule_preflight`-bevis som registreres **etter at filene over er lest**:

```bash
node scripts/place-production-rule-preflight.mjs record \
  --workcard reports/place-production/<place>-workcard-current.json \
  --place-id <canonical_place_id> \
  --category <canonical_category>
```

Hjelperen registrerer SHA-256 for de eksakte regelfilene. Den erstatter ikke selve lesingen. CI avviser manglende eller foreldet preflight når et Place går inn i eller tilbake til fullproduksjon.

### Harde regler

- Et tidligere chatsammendrag eller husket regelsett kan aldri erstatte lesing av gjeldende repo-dokumentasjon.
- Samlingsvalg skal ikke gjøres før kategori-Badge, routingfil og PlaceCard-samlingskontrakt er lest.
- Et annet Place kan ikke brukes som semantisk mal uten at det aktuelle stedets Badge-/source-preflight gjennomføres på nytt.
- Hvis én obligatorisk regelfil endres etter preflight, skal den leses på nytt og preflight registreres på nytt før videre stedsproduksjon.
- CI-/schema-PASS overstyrer aldri semantiske eierskapsregler i canonical dokumentasjon.
- `related`, bilder, Stories, kronologi, Badges og popup-handlinger er aldri reservesamlinger.
- Ingen filler-entities. Mangler en obligatorisk fullprofil-samling en ekte kandidat, forblir stedet blokkert til source-bounded research løser det eller canonical scope vurderes på nytt.

Repoets READ-FIRST-CI finnes uttrykkelig for at denne sekvensen ikke skal kunne hoppes over og likevel nå merge.

## Obligatorisk kvalitetsvurdering før ferdigstatus

Alt arbeid som skal omtales som `complete`, «ferdig», produksjonsklart eller klart for merge, skal først ha en eksplisitt og etterprøvbar kvalitetsvurdering. Grønn CI, stor datamengde, ordtelling eller utfylt schema er nødvendige signaler der de er relevante, men er aldri alene bevis på høy kvalitet.

Vurderingen skal dekke disse seks dimensjonene på en skala fra 1 til 5:

1. **Korrekthet og evidens:** Faktiske påstander, kildebruk, beregninger og tekniske premisser er korrekte, sporbare og avgrenset til det evidensen støtter.
2. **Dekning og ferdigstillelse:** Hele avtalt scope er implementert; mangler, plassholdere, uferdige varianter og skjulte restpunkter er fraværende.
3. **Faglig/redaksjonell kvalitet:** Innholdet er spesifikt for emnet, presist, sammenhengende og selvstendig redigert. Generisk maltekst, kunstige modellnavn, tautologiske definisjoner og volumprodusert fyll teller som kritiske avvik.
4. **Teknisk integritet:** Relevante tester, auditer, determinismekontroller, schemaer, regresjoner og integrasjoner består uten å svekke eksisterende kontrakter.
5. **Sikkerhet og ansvarlighet:** Personvern, kliniske/juridiske grenser, misbruksvern, usikkerhet og konsekvenser er håndtert eksplisitt der domenet krever det.
6. **Vedlikeholdbarhet og etterprøvbarhet:** Endringen er forståelig, minst mulig kompleks, kilde- og claimsporet der det finnes slike kontrakter, og kan reproduseres og reviewes fra repository-data.

Arbeid kan bare klassifiseres som **høy kvalitet** når alle vilkår under er oppfylt:

- hver dimensjon har minst 4/5;
- totalsummen er minst 27/30;
- ingen kritiske avvik eller uløste blokkere finnes;
- hvert delresultat som hevdes ferdig er kontrollert, ikke bare et representativt utvalg;
- vurderingen viser konkret evidens: kommandoer/tester, auditresultater, kilde-/claimdekning eller manuell diff-/innholdskontroll;
- vurderingen er ærlig om hva automatiske kontroller ikke beviser.

Hvis porten ikke består, skal agenten fortsette å forbedre arbeidet innenfor avtalt scope. Status, metadata, rapporter og PR-tekst skal ikke hevde `complete` før vurderingen faktisk består. En materialiserer eller audit kan ikke selv erklære redaksjonell godkjenning uten kontroller som kan oppdage generisk gjenbruk, svak kilde–påstand-kobling og manglende emnespesifisitet.

For fag- og kunnskapsinnhold gjelder i tillegg:

- hver artikkel skal ha en presis definisjon, historisk eller systemisk bakgrunn, navngitte teorier/forskere, relevante funn, metoder med begrensninger, reell faglig uenighet, minst to tydelig deklarerte dokumenterte case eller undervisningsscenarioer, nøkkelspørsmål og løste kilde-/claim-ID-er;
- hypotetiske undervisningsscenarioer skal aldri merkes som dokumenterte hendelser eller steder;
- kilder skal støtte den konkrete påstanden de er koblet til; tematisk nærhet er ikke tilstrekkelig;
- redaksjonell egenart skal kontrolleres på tvers av hele leveransen, slik at samme avsnittsramme ikke masseproduseres med utskiftede emneord;
- `complete` krever full gjennomgang av alle berørte artikler, begreper og registre, ikke bare korrekte antall.

PR-beskrivelsen og sluttrapporten skal inneholde den seksdelte vurderingen med score, evidens og samlet konklusjon. Det er ikke tillatt å runde opp en middels leveranse til «høy kvalitet».

## Prinsipp ved verktøybegrensning

- Ikke stopp bare fordi én bestemt kanal mangler dersom en annen tilgjengelig kanal kan utføre oppgaven korrekt.
- Ikke erstatt en faktisk nødvendig CI-, test- eller mergekontroll med en antakelse; bruk den beste tilgjengelige kanalen og vær presis om hva som er verifisert.
- Brukerens eksplisitte instruks om å gjennomføre GitHub-arbeid skal følges gjennom connectoren når lokal checkout/`gh` ikke er tilgjengelig, så lenge operasjonen kan utføres sikkert med de tilgjengelige verktøyene.
