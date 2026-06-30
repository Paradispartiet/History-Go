# Civication RolePack

Oppdatert: 2026-06-30

Dette er **inngangsdokumentet** for en Civication-rollepakke. Det rammer inn de fem
lagene som **én rollepakke** og sier hvem som eier hva, slik at den samme
sannheten ikke beskrives fem steder samtidig.

> Dette dokumentet erstatter ikke de detaljerte standardene — det binder dem
> sammen. Når du skal bygge en rolle, les dette først, deretter
> [`CIVICATION_ROLE_PACK_STANDARD.md`](CIVICATION_ROLE_PACK_STANDARD.md) og
> [`CIVICATION_WORK_GRAMMAR_STANDARD.md`](CIVICATION_WORK_GRAMMAR_STANDARD.md).

## De fem lagene

En rollepakke er **ikke** fem separate systemer som hver beskriver rollen. Den er
ett kort med fem ansvar:

| Lag | Rolle i pakken | Hva det er | Fil |
|---|---|---|---|
| **RoleModel** | identitet | frontkortet: hvem stillingen er | `data/Civication/roleModels/{category}/{role}.json` |
| **FWG / workGrammar** | arbeidslogikk | hvordan stillingen fungerer som arbeid | `data/Civication/workGrammars/{category}/{role_scope}.json` |
| **MailPlan** | dramaturgi | dagsregi og progresjon | `data/Civication/mailPlans/{category}/{role_scope}_plan.json` |
| **MailFamilies** | innhold | de konkrete scenene/meldingene | `data/Civication/mailFamilies/{category}/{type}/{role_scope}_{type}.json` |
| **Runtime** | utførelse | motoren som bygger og kjører dagen | `js/Civication/systems/civicationDailyMailBuilder.js` m.fl. |

Kort sagt:

```text
RoleModel   = identitet      (hvem er dette?)
FWG         = arbeidslogikk   (hvordan jobber denne?)
MailPlan    = dramaturgi      (hvilken rekkefølge skjer det i?)
MailFamilies = innhold        (hva sier den konkrete mailen?)
Runtime     = utførelse       (hvordan bygges dagen?)
```

Kjeden gjennom lagene:

```text
badge tier / fagfiler
  -> FWG / workGrammar     (arbeidslogikk)
  -> roleModel             (identitet)
  -> mailPlan              (dramaturgi)
  -> mailFamilies          (innhold)
  -> DailyMailBuilder / MailRuntime  (utførelse)
  -> Day 1-test og audit
```

## Eierskap av sannhet (dedup-kontrakten)

Den største risikoen er at felter som `role_id`, `minimum_counts` eller
konfliktakser begynner å finnes i flere lag samtidig og sier ulike ting. Hvert
felt skal eies av **ett** lag. Andre lag refererer, de dupliserer ikke.

| Sannhet | Eies av | Andre lag |
|---|---|---|
| `role_id`, `role_scope`, `role_key`, `category`, `title` | **CivicationCareerRoleResolver** er autoritativ runtime-resolver; RoleModel/role-manifest er datakilden | FWG, mailPlan, mailFamilies og tester **refererer** scope, lager ikke egne mappinger |
| badge-binding, tier, progresjon inn/ut | **RoleModel** (kanonisk) | FWG `badge_binding` speiler dette for arbeidslogikk, men RoleModel er fasit |
| fag, begreper, metoder, kompetanseakser | **FWG** (`fag_bindings`, `task_grammar`) | RoleModel kan nevne dem narrativt; mailene bruker dem |
| arbeidsoppgaver, problemer, konflikter, aktørtyper, steder | **FWG** (`*_grammar`) | mailFamilies **instansierer** dem som konkrete scener |
| minimum mailvolum (`minimum_counts`) | **FWG** (`mail_generation_contract`) | tester og audit **leser** herfra — ikke hardkod tall andre steder |
| dagfase, steg-progresjon, `allowed_families`, `outcome_rules` | **MailPlan** | runtime følger planen; FWG sier ikke rekkefølge |
| konkrete meldinger, valg (`choices`), effekter, feedback | **MailFamilies** | planen peker på familier, men eier ikke teksten |
| dagsbunke, faseflyt, slot-låsing, scoring | **Runtime** | leser data, eier ikke narrativet |

Regelen er den samme som ellers i prosjektet: **ingen duplikate sannheter, og
resolveren eier rolleidentitet** (se `README/SYSTEM_REGISTRY.md` og
`data/Civication/README-mailsystem-og-rolemodels.md`).

### Hva som **ikke** skal slås sammen

- **MailFamilies inn i FWG** — nei. Da blir FWG en gigantisk tekstfil med både
  arbeidsgrammatikk og konkrete mailer; tung å lese, teste og gjenbruke. FWG
  beskriver *mønsteret*, mailFamilies er *instansene*.
- **Runtime blandet med data** — nei. DailyMailBuilder/MailRuntime er motor. Den
  skal lese data, ikke eie narrativet.
- **MailPlan blandet med MailFamilies** — nei. MailPlan sier «morgen skal ha åpne
  meldinger, konflikt før followup, kveld kan lande i knowledge/consequence».
  MailFamilies sier «her er den konkrete meldingen fra pedagogisk leder».

## Navnekonvensjon: FWG

**FWG = Faglig Work Grammar / stillingsgrammatikk.** I dokumentasjon på norsk:
**arbeidsgrammatikk**. I filsystemet: `workGrammars/`. Skriv `FWG`, ikke `FGW`.

## FWG skal styre kvaliteten på mailene

FWG har bare verdi hvis den faktisk styrer mailFamilies. Ellers blir den enda et
dokument som ligger dekorativt ved siden av systemet. Broen er auditen
[`audit-civication-fwg-governance.mjs`](../scripts/audit-civication-fwg-governance.mjs),
som sjekker at mailFamilies følger grammatikken:

| FWG-del | Styrer | Auditsjekk |
|---|---|---|
| `conflict_grammar` | conflict-mails må bruke disse konfliktaksene | pressure forankret i akse/id; konfliktfamilier finnes |
| `actor_grammar` | people-mails må bruke disse persontypene | grammatikkens aktører dukker opp; `can_send_mail_types` respekteres |
| `place_grammar` | mailene må være forankret i riktige steder | brukte og deklarerte steder samsvarer |
| `solution_patterns` | gode valg skal matche faglige løsninger | `choice_tags` brukes i mailenes valg |
| `failure_patterns` | dårlige valg skal gi passende konsekvens | `followup_hooks` peker på faktiske family/mail/trigger |
| `mail_generation_contract.minimum_counts` | minimumsvolum | teller mot faktiske mailer |
| `mail_generation_contract.required_axes` | obligatoriske felt | hver mail deklarerer aksene |

Auditen er **report-only**: den endrer ikke runtime/UI og feiler ikke bygget.
Den skriver [`CIVICATION_FWG_GOVERNANCE.md`](CIVICATION_FWG_GOVERNANCE.md) (og
`reports/civication-fwg-governance.md`) med konkrete avvik per rolle.

## Audits og status

| Kommando | Hva den gjør |
|---|---|
| `npm run audit:civication:role-packs` | eksistens-status per rolle (hvilke lag finnes) → `CIVICATION_ROLE_PACK_INDEX.md` |
| `npm run audit:civication:fwg-governance` | innholds-status: styrer FWG faktisk mailene → `CIVICATION_FWG_GOVERNANCE.md` |

Den første svarer «finnes lagene?». Den andre svarer «henger lagene faglig
sammen?». Sammen er de kvalitetskontrakten for en rollepakke.

## Statusnivåer for en rollepakke

Fra rollepakke-standarden:

- `complete_reference_v2` — komplett referanse **med** FWG, roleModel, mailPlan,
  alle mailFamilies og test.
- `complete_reference` — legacy referanse uten FWG.
- `playable_v1` — spillbar, men ikke referanse.
- `partial_pack` / `role_model_only` / `broken_mapping` / `missing` — ufullstendig.

Ingen ny `complete_reference_v2` uten FWG-fil.

## Referanserolle

**Arealplanlegger** (`by/by_radgiver_plan`, fortellingen «Linjen på kartet») er
første komplette `complete_reference_v2`. Bruk den som kvalitets- og
strukturreferanse — kopier modellen, ikke datapakken. Test:
`tests/civication-arealplanlegger-mail-plan.test.js`.

## Kortversjon for neste rolle

1. Skriv **FWG** (arbeidslogikk: oppgaver, konflikter, aktører, steder, mønstre, `minimum_counts`).
2. Skriv/forbedre **RoleModel** (identitet og badge-binding).
3. Skriv **MailPlan** (dramaturgisk bue, `allowed_families`).
4. Skriv **MailFamilies** (konkrete scener som instansierer FWG-mønstrene).
5. Skriv **Day 1-test** (leser `minimum_counts` fra FWG, bygger full dag).
6. Kjør begge audits og lukk avvikene FWG-governance-rapporten viser.
