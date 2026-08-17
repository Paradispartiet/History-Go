from pathlib import Path

path = Path('tests/civication-mail-loop.test.js')
source = path.read_text()
needle = "  loadScript('js/Civication/systems/civicationWorkdayMailBuilder.js');\n  loadScript('js/Civication/systems/day/dayChoiceDirector.js');"
replacement = "  loadScript('js/Civication/systems/civicationWorkdayMailBuilder.js');\n  loadScript('js/Civication/systems/civicationLifeMailRuntime.js');\n  loadScript('js/Civication/systems/day/dayChoiceDirector.js');"
if needle not in source:
    raise SystemExit('Expected WorkdayBuilder -> ChoiceDirector harness sequence not found')
path.write_text(source.replace(needle, replacement, 1))
