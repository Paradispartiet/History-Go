from __future__ import annotations

from pathlib import Path
import re

ROOT = Path('.')
REPORT_PATH = ROOT / 'reports/place-production/regjeringskvartalet-politikk-v1.md'
WORKFLOW_PATH = ROOT / '.github/workflows/place-rounds-governance.yml'
PHASE_TEST_GLOB = 'regjeringskvartalet-*-phase.test.mjs'

PHASE12_APPROVED_ASSERTION = (
    "assert.match(report, /\\| 12 \\| Brands \\| "
    "\\*\\*GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`"
    "\\*\\* \\|/);"
)
PHASE13_ASSERTION = (
    "assert.match(report, /\\| 13 \\| Badges, fagverk, alle åtte popupfaner, rundinger og "
    "full UI-\\/produksjonsaudit \\| \\*\\*(?:KLAR FOR REVIEW – FULL UI-\\/PRODUKSJONSAUDIT PASS|"
    "GODKJENT – PR #[0-9]+, merge `[0-9a-f]{40}`)\\*\\* \\|/);"
)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


def update_report() -> None:
    report = REPORT_PATH.read_text(encoding='utf-8')
    replacements = [
        (
            '- Status: **fase 12 – Brands vurdert som N/A med evidens; stedet er ikke samlet produksjonsklart**',
            '- Status: **fase 13 – full UI-/produksjonsaudit PASS; stedet er ikke produksjonsklart før fasen er merget og kontrollert på fersk `main`**',
            'report status',
        ),
        (
            '| Fagverk-sted | Regjeringskvartalet har kuratert stedsside og relevante Politikk-linser. Den canonicale URL-en og synlig UI må kontrolleres på nytt i sluttfasen. |',
            '| Fagverk-sted | **PASS – fase 13.** `fagverk-sted.html?place=regjeringskvartalet` er kontrollert i Chromium med canonicalt bilde, tre undermerker, Politikk-domener, linser, spørsmål, kapitler, begreper, emner og sikre kildelenker. |',
            'fagverk row',
        ),
        (
            '| Badges/fagverk | DELVIS | Data og kuratert fagverk finnes, men sluttfasen må kontrollere faktisk badgegrafikk, klikk og stedsside i UI. |',
            '| Badges/fagverk | PASS – fase 13 | Badges ligger ved overskriften, peker til canonical fagverk-rute og viser de tre Politikk-undermerkene og stedets faglige stier. |',
            'badges row',
        ),
        (
            '| 12 | Brands | **KLAR FOR REVIEW – N/A MED EVIDENS** |',
            '| 12 | Brands | **GODKJENT – PR #4673, merge `f4e078f06422747dd6f1ee34985d9c5752bcb3b6`** |',
            'phase 12 row',
        ),
        (
            '| 13 | Badges, fagverk, alle åtte popupfaner, rundinger og full UI-/produksjonsaudit | **NESTE AKTIVE FASE ETTER MERGE AV FASE 12** |',
            '| 13 | Badges, fagverk, alle åtte popupfaner, rundinger og full UI-/produksjonsaudit | **KLAR FOR REVIEW – FULL UI-/PRODUKSJONSAUDIT PASS** |',
            'phase 13 row',
        ),
    ]
    for old, new, label in replacements:
        report = replace_once(report, old, new, label)

    tail = '''## Resultat i fase 13

- Den faktiske popup-runtimeen er kjørt i Chromium mot canonical Regjeringskvartalet-data på både desktop (`1440 × 1000`) og mobil (`390 × 844`).
- Alle åtte faner vises i riktig rekkefølge: Om, Historie, Fortellinger, Før/etter, Nyheter, Lesespor, Kilder og Mer.
- Fanene har `tablist`/`tab`/`tabpanel`, korrekt `aria-selected` og tastaturnavigasjon med piltaster, Home og End.
- Mobilvisningen har horisontal fanescroll og én kolonne for Før/etter-bildene; desktop beholder to kolonner.
- Den faste rundingsprofilen er kontrollert som Personer · Gjenstander · Brands, mens Badges ligger separat ved overskriften.
- Objects-rundingen viser «Fiskerne» og «Grass Roots Square» med de canonicale Commons-bildene. Brands forblir kontrollert N/A uten filler eller per-place runtime-unntak.
- Badges-klikkets canonicale mål er `fagverk-sted.html?place=regjeringskvartalet`.
- Fagverk-stedet er kjørt i Chromium og viser Regjeringskvartalet, hovedbilde, tre undermerker, Politikk-domener, minst fire linser, minst fire stedsspørsmål, kapitler, begreper, emner og brukerrettede HTTPS-kilder.
- Popup- og fagverksflater er kontrollert uten synlige pekerstrenger til `reports/`, `tests/`, quiz-produksjonskontekst, koordinat-evidens eller interne claims/audits.
- Eksterne lenker åpnes sikkert med `noopener noreferrer`, og canonical bilde-URL-er er HTTPS.
- Den permanente `Place rounds governance`-workflowen kjører nå den samme Chromium-baserte sluttporten ved relevante endringer.

## Sluttstatus for review

Alle fase 13-portene består på den validerte PR-headen. Regjeringskvartalet er fortsatt **ikke produksjonsklart før fase 13 er merget og den identiske sluttdiffen er kontrollert på fersk `main`**. Etter merge skal fasekortet lukkes med PR-nummer og merge-SHA; ingen ny innholdsproduksjonsfase åpnes.
'''
    report, count = re.subn(r'## Neste aktive fase\n[\s\S]*\Z', tail, report, count=1)
    if count != 1:
        raise RuntimeError(f'report tail: expected exactly one match, found {count}')
    REPORT_PATH.write_text(report, encoding='utf-8')


def update_phase_tests() -> None:
    paths = sorted((ROOT / 'tests').glob(PHASE_TEST_GLOB))
    if len(paths) < 7:
        raise RuntimeError(f'expected at least seven phase tests, found {len(paths)}')

    old_phase12 = (
        "assert.match(report, /\\| 12 \\| Brands \\| "
        "\\*\\*KLAR FOR REVIEW – N\\/A MED EVIDENS\\*\\* \\|/);"
    )
    old_phase13_next = (
        "assert.match(report, /\\| 13 \\| Badges, fagverk, alle åtte popupfaner, rundinger og "
        "full UI-\\/produksjonsaudit \\| \\*\\*NESTE AKTIVE FASE ETTER MERGE AV FASE 12"
        "\\*\\* \\|/);"
    )

    changed = 0
    for path in paths:
        text = path.read_text(encoding='utf-8')
        original = text
        text = text.replace(old_phase12, PHASE12_APPROVED_ASSERTION)
        text = text.replace(old_phase13_next, PHASE13_ASSERTION)
        text = text.replace('assert.match(report, /ikke produksjonsklart/);', PHASE13_ASSERTION)
        text = text.replace('\n// Phase 13 bootstrap trigger; removed from the final diff.\n', '\n')
        if text != original:
            path.write_text(text, encoding='utf-8')
            changed += 1
    if changed < 7:
        raise RuntimeError(f'expected to update at least seven phase tests, updated {changed}')


def update_workflow() -> None:
    workflow = WORKFLOW_PATH.read_text(encoding='utf-8')
    brand_path = '      - "tests/regjeringskvartalet-brands-phase.test.mjs"\n'
    audit_path = '      - "tests/regjeringskvartalet-ui-production-audit.test.mjs"\n'
    if workflow.count(brand_path) != 2:
        raise RuntimeError(f'workflow path anchors: expected 2, found {workflow.count(brand_path)}')
    if audit_path not in workflow:
        workflow = workflow.replace(brand_path, brand_path + audit_path)

    workflow = workflow.replace('timeout-minutes: 10', 'timeout-minutes: 20', 1)

    install_step = '      - name: Install dependencies\n        run: npm ci\n\n'
    browser_step = (
        '      - name: Install dependencies\n'
        '        run: npm ci\n\n'
        '      - name: Install Chromium for Regjeringskvartalet UI audit\n'
        '        run: npx playwright install --with-deps chromium\n\n'
    )
    if 'Install Chromium for Regjeringskvartalet UI audit' not in workflow:
        workflow = replace_once(workflow, install_step, browser_step, 'workflow install step')

    command = (
        '          node --test tests/regjeringskvartalet-before-after-phase.test.mjs '
        'tests/regjeringskvartalet-news-phase.test.mjs '
        'tests/regjeringskvartalet-reading-phase.test.mjs '
        'tests/regjeringskvartalet-sources-phase.test.mjs '
        'tests/regjeringskvartalet-more-phase.test.mjs '
        'tests/regjeringskvartalet-objects-phase.test.mjs '
        'tests/regjeringskvartalet-brands-phase.test.mjs\n'
    )
    audit_command = '          node tests/regjeringskvartalet-ui-production-audit.test.mjs\n'
    if audit_command not in workflow:
        workflow = replace_once(workflow, command, command + audit_command, 'workflow test command')

    WORKFLOW_PATH.write_text(workflow, encoding='utf-8')


def main() -> None:
    update_report()
    update_phase_tests()
    update_workflow()
    print('Regjeringskvartalet phase 13 materialization: PASS')


if __name__ == '__main__':
    main()
