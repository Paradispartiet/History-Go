#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="agent/people-docs-personal-info-source-presentation"

git fetch origin main
git reset --hard origin/main
git clean -fdx

python3 - <<'PY'
import json
from pathlib import Path

canonical_path = Path('docs/PEOPLE_PROFILE_CANONICAL.md')
canonical = canonical_path.read_text(encoding='utf-8')
canonical = canonical.replace('Sist kontrollert: **2026-07-27**', 'Sist kontrollert: **2026-07-28**', 1)
marker = '- private forhold skal ikke samles bare fordi de er tilgjengelige.\n\n## 10. Ingen faste fyldekrav'
section = '''- private forhold skal ikke samles bare fordi de er tilgjengelige.

### 9.1 Personlig informasjon og privatliv

I denne standarden betyr **personlig informasjon** dokumentert personbakgrunn og privatliv. Det er ikke et annet navn på flere karriereopplysninger.

Personlig informasjon kan omfatte oppvekst, familieforhold, identitet, tro, samliv og andre sider av privatlivet når opplysningen:

1. er gjort offentlig av personen selv eller dokumentert i en pålitelig, åpen biografisk kilde;
2. bidrar til reell forståelse av personens liv, bakgrunn eller offentlige virke;
3. fremstilles nøkternt, uten spekulasjon, diagnose, motivtolkning eller tabloid vinkling;
4. har egne claims og full felt- eller setningsmapping;
5. ikke samles bare for å gjøre profilen lengre eller mer underholdende.

For sensitive opplysninger om blant annet helse, seksualitet, religion, familie og samliv gjelder en høyere terskel:

- personen skal selv ha gjort opplysningen offentlig, eller en solid biografisk kilde skal dokumentere den uttrykkelig;
- History GO skal aldri utlede identitet, diagnose, tro, konflikt eller relasjonsstatus fra indirekte tegn;
- bare den delen som er biografisk relevant skal publiseres;
- nåværende samlivs-, familie- eller livssituasjon krever et ferskt `current`-claim;
- motstridende eller uklare opplysninger skal utelates eller publiseres kvalifisert etter konfliktreglene.

Følgende skal ikke publiseres som profilfyll:

- privat adresse, kontaktinformasjon, reiseplaner eller andre lokaliserende detaljer;
- opplysninger om mindreårige som ikke er nødvendige for en dokumentert historisk sammenheng;
- partneres alder, tidligere forhold eller andre tredjepartsdetaljer uten klar biografisk relevans;
- rykter, sladder, anonyme påstander eller opplysninger som bare er gjengitt av sekundære aggregatorsider;
- unødvendig intime detaljer, selv når de teknisk sett finnes i en åpen kilde.

Karrierestoff skal fortsatt beskrives som karriere. Personlig informasjon skal ikke kamufleres som «mer biografi» eller blandes inn i et karriereavsnitt slik at skillet mellom offentlig virke og privatliv blir uklart.

## 10. Ingen faste fyldekrav'''
if marker not in canonical:
    raise SystemExit('Canonical privacy insertion marker not found')
canonical_path.write_text(canonical.replace(marker, section, 1), encoding='utf-8')

popup_path = Path('docs/PEOPLE_POPUP_SYSTEM.md')
popup = popup_path.read_text(encoding='utf-8')
popup = popup.replace('Sist kontrollert: **2026-07-27**', 'Sist kontrollert: **2026-07-28**', 1)
bio_marker = '`popupDesc` skal være en selvstendig, faktabasert biografi. Avsnittstallet bestemmes av stoffets naturlige struktur; tre avsnitt er ikke et krav. Biografien skal formidle dokumenterte livsdata, handlinger, verk, institusjoner og stedstilknytninger uten å forklare hvorfor redaksjonen valgte personen eller hva spilleren skal lære.\n'
bio_addition = bio_marker + '\nNår claim-dekket personlig informasjon finnes, kan `popupDesc` ha ett eller flere tydelige avsnitt om personbakgrunn og privatliv etter reglene i `PEOPLE_PROFILE_CANONICAL.md`. Personlig informasjon skal presenteres som personlig biografi, ikke omskrives til eller skjules som mer karrierehistorie.\n'
if bio_marker not in popup:
    raise SystemExit('Popup biography marker not found')
popup = popup.replace(bio_marker, bio_addition, 1)
source_marker = '- PR- eller researchmaterialet skal dokumentere hvilke kilder som støtter hvilke grupper av påstander.\n'
source_addition = source_marker + '''- popupen dedupliserer kilder på normalisert URL, ikke på kombinasjonen URL og label;
- dersom samme URL finnes i både `externalLinks` og `source_urls`, skal den navngitte `externalLinks`-oppføringen beholdes og den bare domenemerkede fallbacken utelates;
- `source_urls` er en kompatibilitetsfallback og skal ikke skape ekstra rader som bare viser `sceneweb.no`, `snl.no` eller andre domenenavn når en lesbar lenke allerede finnes;
- Wikipedia kan registreres som `type: "further_reading"`, men skal normalt ikke være eneste faktakilde eller eneste claim-bevis;
- en Wikipedia-lenke skal ha en lesbar label, for eksempel `Wikipedia – Personnavn`, og skal vises som videre lesning, ikke som institusjonell verifikasjon.
'''
if source_marker not in popup:
    raise SystemExit('Popup source marker not found')
popup_path.write_text(popup.replace(source_marker, source_addition, 1), encoding='utf-8')

profile_test_path = Path('tests/people-profile-canonical.test.mjs')
profile_test = profile_test_path.read_text(encoding='utf-8')
test_marker = "  assert.match(docs, /legacy_unreviewed/);\n"
test_addition = test_marker + '''  assert.match(docs, /Personlig informasjon og privatliv/);
  assert.match(docs, /ikke et annet navn på flere karriereopplysninger/);
  assert.match(docs, /personen skal selv ha gjort opplysningen offentlig/);
  assert.match(docs, /privat adresse, kontaktinformasjon/);
  assert.match(docs, /Personlig informasjon skal ikke kamufleres/);
'''
if test_marker not in profile_test:
    raise SystemExit('People profile test marker not found')
profile_test_path.write_text(profile_test.replace(test_marker, test_addition, 1), encoding='utf-8')

popup_test_path = Path('tests/people-popup-system-contract.test.mjs')
popup_test = popup_test_path.read_text(encoding='utf-8')
popup_test_marker = "  assert.match(docs, /PEOPLE_PROFILE_CANONICAL\\.md/);\n"
popup_test_addition = popup_test_marker + '''  assert.match(docs, /normalisert URL/);
  assert.match(docs, /navngitte `externalLinks`-oppføringen beholdes/);
  assert.match(docs, /Wikipedia kan registreres som `type: "further_reading"`/);
  assert.match(docs, /Personlig informasjon skal presenteres som personlig biografi/);
'''
if popup_test_marker not in popup_test:
    raise SystemExit('People popup test marker not found')
popup_test_path.write_text(popup_test.replace(popup_test_marker, popup_test_addition, 1), encoding='utf-8')

registry_path = Path('docs/documentation_registry.json')
registry = json.loads(registry_path.read_text(encoding='utf-8'))
registry['last_verified'] = '2026-07-28'
for entry in registry['documents']:
    if entry.get('path') in {
        'docs/PEOPLE_PROFILE_CANONICAL.md',
        'docs/PEOPLE_POPUP_SYSTEM.md',
        'docs/documentation_registry.json',
    }:
        entry['last_verified'] = '2026-07-28'
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
PY

npm ci --no-audit --no-fund
npm run test:factuality-contract
npm run build:scripts
node dist/scripts/check-documentation-governance.mjs
git restore --worktree --staged reports/documentation-governance 2>/dev/null || true

expected=(
  docs/PEOPLE_PROFILE_CANONICAL.md
  docs/PEOPLE_POPUP_SYSTEM.md
  docs/documentation_registry.json
  tests/people-profile-canonical.test.mjs
  tests/people-popup-system-contract.test.mjs
)
git diff --check -- "${expected[@]}"
mapfile -t actual < <(git status --porcelain=v1 --untracked-files=all | sed -E 's/^.. //' | sort)
mapfile -t wanted < <(printf '%s\n' "${expected[@]}" | sort)
diff -u <(printf '%s\n' "${wanted[@]}") <(printf '%s\n' "${actual[@]}")
git add -- "${expected[@]}"
git diff --cached --check
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git commit -m 'Document People personal information and source presentation rules'
git push --force origin HEAD:"$TARGET_BRANCH"
