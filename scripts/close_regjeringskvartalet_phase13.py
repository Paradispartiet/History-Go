from __future__ import annotations

from pathlib import Path
import re

REPORT = Path('reports/place-production/regjeringskvartalet-politikk-v1.md')
MERGE_SHA = '06d6c462e549be34e784d81317333bbfb20fd5ef'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected one match, found {count}')
    return text.replace(old, new, 1)


def main() -> None:
    report = REPORT.read_text(encoding='utf-8')
    report = replace_once(
        report,
        '- Status: **fase 13 – full UI-/produksjonsaudit PASS; stedet er ikke produksjonsklart før fasen er merget og kontrollert på fersk `main`**',
        '- Status: **fase 13 – full UI-/produksjonsaudit PASS; produksjonsklart etter PR #4674 og kontroll på fersk `main`**',
        'overall status',
    )
    report = replace_once(
        report,
        '| 13 | Badges, fagverk, alle åtte popupfaner, rundinger og full UI-/produksjonsaudit | **KLAR FOR REVIEW – FULL UI-/PRODUKSJONSAUDIT PASS** |',
        f'| 13 | Badges, fagverk, alle åtte popupfaner, rundinger og full UI-/produksjonsaudit | **GODKJENT – PR #4674, merge `{MERGE_SHA}`** |',
        'phase 13 row',
    )
    final = f'''## Sluttstatus

Fase 13 er squash-merget i PR #4674 med commit `{MERGE_SHA}`. Den permanente ellevefilersdiffen er kontrollert gjennom closure-PR-CI på en gren opprettet direkte fra fersk `main`; `Place rounds governance` og `TypeScript guard` må begge bestå før denne avslutningen merges.

Regjeringskvartalet er dermed **produksjonsklart etter den canonicale sted-for-sted-checklista**. Alle tretten faser er lukket, og ingen ny innholdsproduksjonsfase står åpen.
'''
    report, count = re.subn(r'## Sluttstatus for review\n[\s\S]*\Z', final, report, count=1)
    if count != 1:
        raise RuntimeError(f'final status: expected one match, found {count}')
    REPORT.write_text(report, encoding='utf-8')
    print('Regjeringskvartalet phase 13 closure: PASS')


if __name__ == '__main__':
    main()
