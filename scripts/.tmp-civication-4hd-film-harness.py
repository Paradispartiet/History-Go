from pathlib import Path
path = Path('tests/civication-film-tv-produksjonsassistent-playability.test.js')
text = path.read_text()
if 'civicationWorkdayMailBuilder.js' not in text:
    old = "    'js/Civication/systems/civicationMailRuntime.js',\n    'js/Civication/systems/civicationDailyMailBuilder.js',"
    new = "    'js/Civication/systems/civicationMailRuntime.js',\n    'js/Civication/systems/civicationWorkdayMailBuilder.js',\n    'js/Civication/systems/civicationDailyMailBuilder.js',"
    if old not in text:
        raise SystemExit('Film/TV script-array MailRuntime sequence not found')
    path.write_text(text.replace(old, new, 1))
