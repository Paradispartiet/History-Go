#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
ATLAS = ROOT / 'data/leksikon/sprak/norge_atlas_v1.json'
SCHEMA = ROOT / 'data/leksikon/sprak/atlas_schema_v1.json'
RUNTIME = ROOT / 'js/ui/place-language-layer.js'
CSS = ROOT / 'css/place-language-layer.css'
DOCS = ROOT / 'docs/SPRAKLEKSIKON.md'
TEST = ROOT / 'tests/place-language-dialect-scope.test.mjs'

atlas = json.loads(ATLAS.read_text())
atlas['notes'] = (
    'Atlaset er en faglig navigasjonsflate. De fire hovedområdene er svært grove dialektologiske '
    'orienteringsområder, ikke dialektnavn og ikke talemålsprofiler. Faktiske profiler skal ligge på '
    'regionalt og særlig lokalt nivå. Dialektgrenser er glidende, og ett sted kan romme flere samtidige '
    'talemålsvarianter etter blant annet alder, sosialt miljø, mobilitet og språkkontakt.'
)
principles = list(atlas.get('editorial_principles') or [])
new_principles = [
    'Austlandsk, vestlandsk, trøndersk og nordnorsk er grove orienteringsområder, ikke enkeltstående dialekter.',
    'Lokale talemål og bytalemål skal være egne profiler når dokumentasjonen finnes; de skal ikke arve konkrete trekk ukritisk fra et hovedområde.',
    'En by eller kommune er heller ikke automatisk ett ensartet talemål. Intern geografisk, sosial, aldersmessig og kontaktbasert variasjon skal kunne modelleres eksplisitt.'
]
for item in reversed(new_principles):
    if item not in principles:
        principles.insert(0, item)
atlas['editorial_principles'] = principles

atlas['local_varieties'] = [
    {
        'id': 'oslo_local_speech', 'name': 'Oslo', 'kind': 'local_speech', 'macro_region_id': 'austlandsk',
        'region_id': 'midtostlandsk', 'profile_status': 'documented_seed',
        'summary': 'Oslo må behandles som et eget bytalemålsområde med intern variasjon, ikke som synonym for østlandsk. Historiske øst-/vestvarianter, sosiale mønstre og nyere talemålspraksiser må kunne vises som egne lag.',
        'variation_note': 'Én Oslo-profil skal ikke antyde at hele byen snakker likt.',
        'sources': [
            {'label': 'Språkrådet – språk i Oslo', 'url': 'https://sprakradet.no/spraksporsmal-og-svar/er-spraket-i-oslo-dialekt-eller-bokmal/'},
            {'label': 'UiO Tekstlab – NoTa/TAUS Oslo', 'url': 'https://tekstlab.uio.no/nota/oslo/'}
        ]
    },
    {
        'id': 'fredrikstad_local_speech', 'name': 'Fredrikstad', 'kind': 'local_speech', 'macro_region_id': 'austlandsk',
        'region_id': 'vikvaersk', 'profile_status': 'local_research_required',
        'summary': 'Fredrikstad skal ha en egen lokal talemålsprofil og skal ikke presenteres som det samme som Oslo, Lillehammer eller hele Østlandet.',
        'variation_note': 'Konkrete språkdrag holdes tilbake til lokal korpus- eller arkivdokumentasjon er knyttet til profilen.',
        'sources': [{'label': 'UiO Tekstlab – LIA norsk', 'url': 'https://tekstlab.uio.no/LIA/norsk/'}]
    },
    {
        'id': 'lillehammer_local_speech', 'name': 'Lillehammer', 'kind': 'local_speech', 'macro_region_id': 'austlandsk',
        'region_id': 'opplandsmal', 'profile_status': 'local_research_required',
        'summary': 'Lillehammer skal ha en egen lokal talemålsprofil og skal ikke reduseres til en generell østlandsk etikett.',
        'variation_note': 'Konkrete språkdrag holdes tilbake til lokal korpus- eller arkivdokumentasjon er knyttet til profilen.',
        'sources': [{'label': 'UiO Tekstlab – LIA norsk', 'url': 'https://tekstlab.uio.no/LIA/norsk/'}]
    },
    {
        'id': 'arendal_local_speech', 'name': 'Arendal', 'kind': 'local_speech', 'macro_region_id': 'vestlandsk',
        'region_id': 'sorleg_e_mal', 'profile_status': 'local_research_required',
        'summary': 'Arendal skal ha en egen lokal talemålsprofil. Den skal ikke slås sammen med Kristiansand eller presenteres som én generell sør- eller vestlandsk dialekt.',
        'variation_note': 'Konkrete språkdrag holdes tilbake til lokal dokumentasjon er knyttet til profilen.',
        'sources': [{'label': 'UiO Tekstlab – LIA norsk', 'url': 'https://tekstlab.uio.no/LIA/norsk/'}]
    },
    {
        'id': 'kristiansand_local_speech', 'name': 'Kristiansand', 'kind': 'local_speech', 'macro_region_id': 'vestlandsk',
        'region_id': 'sorleg_e_mal', 'profile_status': 'documented_seed',
        'summary': 'Kristiansand skal ha en egen lokal talemålsprofil, adskilt fra Arendal og andre sørlandske talemål.',
        'variation_note': 'LIA norsk har eksplisitt Kristiansand-materiale; konkrete trekk skal fortsatt hentes fra selve materialet før de publiseres som lokale kjennetegn.',
        'sources': [{'label': 'UiO Tekstlab – LIA norsk brukerveiledning', 'url': 'https://tekstlab.uio.no/brukerveiledninger/LIA%20norsk/index.html'}]
    },
    {
        'id': 'stavanger_local_speech', 'name': 'Stavanger', 'kind': 'local_speech', 'macro_region_id': 'vestlandsk',
        'profile_status': 'documented_seed',
        'summary': 'Stavanger skal ha en egen bytalemålsprofil, ikke arve en generell «vestlandsk dialekt».',
        'variation_note': 'UiB har egne talemåls- og dialektendringsressurser for Stavanger; intern og historisk variasjon må bevares.',
        'sources': [{'label': 'UiB – sosiolingvistikk og språkendring', 'url': 'https://www4.uib.no/forskning/forskergrupper/forskergruppa-sosiolingvistikk-og-sprakendring'}]
    },
    {
        'id': 'haugesund_local_speech', 'name': 'Haugesund', 'kind': 'local_speech', 'macro_region_id': 'vestlandsk',
        'profile_status': 'local_research_required',
        'summary': 'Haugesund skal ha en egen lokal talemålsprofil og skal ikke slås sammen med Stavanger eller Bergen.',
        'variation_note': 'Konkrete språkdrag holdes tilbake til lokal dokumentasjon er knyttet til profilen.',
        'sources': [{'label': 'UiB – Målføresamlinga', 'url': 'https://www.uib.no/lle/51977/m%C3%A5lf%C3%B8resamlinga'}]
    },
    {
        'id': 'bergen_local_speech', 'name': 'Bergen', 'kind': 'local_speech', 'macro_region_id': 'vestlandsk',
        'profile_status': 'documented_seed',
        'summary': 'Bergen skal ha en egen bytalemålsprofil. Bergensk har både særtrekk og intern variasjon og skal ikke behandles som synonymt med talemålet ellers på Vestlandet.',
        'variation_note': 'UiB dokumenterer både bergensk som bymål og flere bergensvarieteter; profilen må kunne romme intern variasjon.',
        'sources': [
            {'label': 'UiB – sosiolingvistikk og språkendring', 'url': 'https://www4.uib.no/forskning/forskergrupper/forskergruppa-sosiolingvistikk-og-sprakendring'},
            {'label': 'UiB – Målføresamlinga', 'url': 'https://www.uib.no/lle/51977/m%C3%A5lf%C3%B8resamlinga'}
        ]
    }
]
ATLAS.write_text(json.dumps(atlas, ensure_ascii=False, indent=2) + '\n')

schema = json.loads(SCHEMA.read_text())
required = schema.setdefault('required', [])
if 'local_varieties' not in required:
    required.append('local_varieties')
schema.setdefault('properties', {})['local_varieties'] = {
    'type': 'array',
    'minItems': 8,
    'items': {
        'type': 'object',
        'required': ['id', 'name', 'kind', 'macro_region_id', 'profile_status', 'summary', 'variation_note'],
        'properties': {
            'id': {'type': 'string', 'minLength': 1},
            'name': {'type': 'string', 'minLength': 1},
            'kind': {'const': 'local_speech'},
            'macro_region_id': {'type': 'string', 'minLength': 1},
            'region_id': {'type': 'string', 'minLength': 1},
            'profile_status': {'enum': ['documented_seed', 'local_research_required']},
            'summary': {'type': 'string', 'minLength': 1},
            'variation_note': {'type': 'string', 'minLength': 1},
            'sources': {'type': 'array'}
        },
        'additionalProperties': True
    }
}
SCHEMA.write_text(json.dumps(schema, ensure_ascii=False, indent=2) + '\n')

runtime = RUNTIME.read_text()
runtime = runtime.replace('Fra lokale språkspor til hele dialektlandskapet', 'Fra lokale talemål til større dialektområder')
runtime = runtime.replace('Skjematisk oversikt. Dialektgrenser er glidende, og et områdeanker beskriver aldri alle som bor der.', 'De store feltene er grove orienteringsområder, ikke dialekter. Utforsk lokale talemål under dem; grensene er glidende, og ingen stedsprofil beskriver alle som bor der.')
runtime = runtime.replace('aria-label="Utforsk de fire norske hovedgruppene"', 'aria-label="Grove dialektologiske hovedområder – velg for orientering"')
runtime = runtime.replace('<summary>Utforsk hele Norge</summary>', '<summary>Utforsk lokale talemål og regioner</summary>')

needle = '    const languageLayers = list(atlas?.language_status_layers);\n'
if needle not in runtime:
    raise SystemExit('runtime localVarieties insertion anchor missing')
runtime = runtime.replace(needle, needle + '    const localVarieties = list(atlas?.local_varieties);\n', 1)

needle = '        <details class="hg-language-atlas-details">\n          <summary>Utforsk lokale talemål og regioner</summary>\n          <div class="hg-language-atlas-grid">${macros.map(macro => renderAtlasMacroCard(macro, atlas, activeIds)).join("")}</div>\n'
insert = '''        <details class="hg-language-atlas-details">\n          <summary>Utforsk lokale talemål og regioner</summary>\n          ${localVarieties.length ? `<section class="hg-language-atlas-local"><h3>Lokale talemål</h3><p>Dette er atlasets viktigste nivå. En by kan samtidig romme flere varianter; en lokal profil er derfor et startpunkt, ikke en påstand om at alle snakker likt.</p><div>${localVarieties.map(row => `<button type="button" data-atlas-local="${esc(row?.id)}" data-atlas-macro-id="${esc(row?.macro_region_id)}" data-atlas-region-id="${esc(row?.region_id || "")}" aria-pressed="false"><strong>${esc(row?.name)}</strong><span>${row?.profile_status === "local_research_required" ? "Lokal research gjenstår" : "Lokal profil"}</span></button>`).join("")}</div></section>` : ""}\n          <div class="hg-language-atlas-grid"><div class="hg-language-atlas-grid-label"><strong>Grove dialektologiske områder</strong><span>Orientering – ikke enkeltstående dialekter</span></div>${macros.map(macro => renderAtlasMacroCard(macro, atlas, activeIds)).join("")}</div>\n'''
if needle not in runtime:
    raise SystemExit('runtime details anchor missing')
runtime = runtime.replace(needle, insert, 1)

old = '''    const regions = list(atlas?.dialect_regions);\n    const macros = list(atlas?.macro_regions);\n    const region = regions.find(row => text(row?.id) === id) || null;\n    const macroId = text(macroHint || region?.macro_region_id || id);\n    const macro = macros.find(row => text(row?.id) === macroId) || null;\n    const item = region || macro;\n    if (!item || !macro) return;\n'''
new = '''    const regions = list(atlas?.dialect_regions);\n    const macros = list(atlas?.macro_regions);\n    const locals = list(atlas?.local_varieties);\n    const local = locals.find(row => text(row?.id) === id) || null;\n    const region = regions.find(row => text(row?.id) === id) || (local ? regions.find(row => text(row?.id) === text(local?.region_id)) || null : null);\n    const macroId = text(macroHint || local?.macro_region_id || region?.macro_region_id || id);\n    const macro = macros.find(row => text(row?.id) === macroId) || null;\n    const item = local || (regions.find(row => text(row?.id) === id) || null) || macro;\n    if (!item || !macro) return;\n'''
if old not in runtime:
    raise SystemExit('activateAtlasSelection lookup block missing')
runtime = runtime.replace(old, new, 1)

runtime = runtime.replace('panel.querySelectorAll("[data-atlas-focus],[data-atlas-region]").forEach(button => {', 'panel.querySelectorAll("[data-atlas-focus],[data-atlas-region],[data-atlas-local]").forEach(button => {', 1)
runtime = runtime.replace('const buttonId = text(button.getAttribute("data-atlas-region") || button.getAttribute("data-atlas-focus"));', 'const buttonId = text(button.getAttribute("data-atlas-local") || button.getAttribute("data-atlas-region") || button.getAttribute("data-atlas-focus"));', 1)
runtime = runtime.replace('const macroButtonSelected = Boolean(region) && button.hasAttribute("data-atlas-focus") && buttonId === macroId;', 'const macroButtonSelected = Boolean(region || local) && button.hasAttribute("data-atlas-focus") && buttonId === macroId;', 1)
runtime = runtime.replace('if (summary) summary.textContent = text(region?.area_summary || item?.summary || macro?.summary);', 'if (summary) summary.textContent = [text(local?.summary || region?.area_summary || item?.summary || macro?.summary), text(local?.variation_note)].filter(Boolean).join(" ");', 1)

needle = '''      const atlasRegion = target?.closest("[data-atlas-region]");\n      if (atlasRegion && atlas) {\n        activateAtlasSelection(\n          panel,\n          atlas,\n          atlasRegion.getAttribute("data-atlas-region"),\n          atlasRegion.getAttribute("data-atlas-macro-id")\n        );\n        return;\n      }\n\n'''
insert = needle + '''      const atlasLocal = target?.closest("[data-atlas-local]");\n      if (atlasLocal && atlas) {\n        activateAtlasSelection(\n          panel,\n          atlas,\n          atlasLocal.getAttribute("data-atlas-local"),\n          atlasLocal.getAttribute("data-atlas-macro-id")\n        );\n        return;\n      }\n\n'''
if needle not in runtime:
    raise SystemExit('bind local insertion anchor missing')
runtime = runtime.replace(needle, insert, 1)
RUNTIME.write_text(runtime)

css = CSS.read_text()
css_add = r'''

/* Lokale talemål er hovednivået; makroområdene er kun orientering. */
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local{display:grid;gap:9px;margin-top:12px}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local h3{margin:0;color:#fff;font-size:13px}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local>p{margin:0;color:rgba(255,255,255,.66);font-size:11px;line-height:1.5}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local button{display:grid;gap:3px;padding:10px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.035);color:rgba(255,255,255,.88);text-align:left;cursor:pointer}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local button strong{font-size:12px}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local button span{color:rgba(255,255,255,.48);font-size:9px;text-transform:uppercase;letter-spacing:.04em}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local button:hover,
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local button:focus-visible,
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local button[aria-pressed="true"]{border-color:rgba(246,200,0,.55);background:rgba(246,200,0,.1);outline:none}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-grid-label{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding-top:4px;color:rgba(255,255,255,.82)}
body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-grid-label span{color:rgba(255,255,255,.44);font-size:9px;text-transform:uppercase;letter-spacing:.04em;text-align:right}
@media (max-width:720px){body.hg-app .hg-place-popup-v2[data-hg-language-layer="1"] .hg-language-atlas-local>div{grid-template-columns:1fr}}
'''
if 'Lokale talemål er hovednivået' not in css:
    css += css_add
CSS.write_text(css)

docs = DOCS.read_text()
marker = '## Språkatlas Norge v1\n'
if marker not in docs:
    raise SystemExit('docs atlas marker missing')
addition = '''## Språkatlas Norge v1\n\n### Viktig presisering: hovedområder er ikke dialekter\n\n`austlandsk`, `vestlandsk`, `trøndersk` og `nordnorsk` er **grove dialektologiske orienteringsområder**. De skal aldri presenteres som om hver av dem var én dialekt. Den faktiske utforskningen skal gå videre til regionale soner og særlig til **lokale talemål/bytalemål**.\n\nAtlaset har derfor `local_varieties` som et eget canonical nivå. Lokale profiler kan finnes for byer, bygder og andre dokumenterte talemålsmiljøer. En lokal profil betyr heller ikke at alle på stedet snakker likt: intern variasjon etter geografi, alder, sosialt miljø, mobilitet og språkkontakt skal kunne modelleres som egne lag. Konkrete lokale språkdrag skal ikke arves automatisk fra makroområdet; de krever lokale kilder.\n\nFørste profiler er Oslo, Fredrikstad, Lillehammer, Arendal, Kristiansand, Stavanger, Haugesund og Bergen. Profiler uten tilstrekkelig lokal detaljdokumentasjon står som `local_research_required` og skal **ikke** fylles med gjetninger.\n\n'''
docs = docs.replace(marker, addition, 1)
DOCS.write_text(docs)

test = TEST.read_text()
append = r'''

test("Språkatlaset behandler hovedområder som orientering og lokale talemål som eget nivå", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const runtime = read("js/ui/place-language-layer.js");
  const contract = read("docs/SPRAKLEKSIKON.md");

  assert.match(atlas.notes, /hovedområdene[^.]*ikke dialektnavn/i);
  assert.ok(Array.isArray(atlas.local_varieties));
  const byName = new Map(atlas.local_varieties.map(row => [row.name, row]));
  for (const name of ["Oslo", "Fredrikstad", "Lillehammer", "Arendal", "Kristiansand", "Stavanger", "Haugesund", "Bergen"]) {
    assert.ok(byName.has(name), `mangler lokal talemålsprofil for ${name}`);
    assert.equal(byName.get(name).kind, "local_speech");
    assert.ok(text(byName.get(name).variation_note), `${name}: lokal profil må eksplisitt bevare intern variasjon`);
  }
  assert.notEqual(byName.get("Arendal").id, byName.get("Kristiansand").id);
  assert.notEqual(byName.get("Stavanger").id, byName.get("Haugesund").id);
  assert.notEqual(byName.get("Haugesund").id, byName.get("Bergen").id);

  assert.match(runtime, /data-atlas-local=/);
  assert.match(runtime, /Lokale talemål/);
  assert.match(runtime, /grove orienteringsområder, ikke dialekter/i);
  assert.match(runtime, /local_research_required/);
  assert.match(contract, /hovedområder er ikke dialekter/i);
  assert.match(contract, /Konkrete lokale språkdrag skal ikke arves automatisk/i);
});
'''
if 'hovedområder som orientering og lokale talemål som eget nivå' not in test:
    test += append
TEST.write_text(test)
