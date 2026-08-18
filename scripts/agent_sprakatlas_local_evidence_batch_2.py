import json
from pathlib import Path

ROOT = Path('.')
ATLAS_PATH = ROOT / 'data/leksikon/sprak/norge_atlas_v1.json'
SCHEMA_PATH = ROOT / 'data/leksikon/sprak/atlas_schema_v1.json'
DOCS_PATH = ROOT / 'docs/SPRAKLEKSIKON.md'
TEST_PATH = ROOT / 'tests/place-language-dialect-scope.test.mjs'
VERIFIED = '2026-08-18'
KINDS = {'structural_feature', 'social_variation', 'language_change', 'contact_history', 'corpus_basis'}


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def merge_sources(existing, additions):
    rows = []
    seen = set()
    for row in [*(existing or []), *additions]:
        url = str(row.get('url', '')).strip()
        if not url or url in seen:
            continue
        seen.add(url)
        rows.append({'label': str(row.get('label', 'Kilde')).strip() or 'Kilde', 'url': url})
    return rows


def evidence(id_, label, kind, claim, time_scope, *urls):
    assert kind in KINDS
    return {
        'id': id_,
        'label': label,
        'kind': kind,
        'claim': claim,
        'time_scope': time_scope,
        'source_urls': list(urls),
    }


SNL_KRS = 'https://snl.no/Kristiansand_bym%C3%A5l'
SNL_SOR = 'https://snl.no/s%C3%B8rlandsk'
SNL_SETESDAL = 'https://snl.no/dialekter_i_Setesdal'
SNL_SOR_E = 'https://snl.no/s%C3%B8rleg_e-m%C3%A5l'
SNL_BODO = 'https://snl.no/Bod%C3%B8_bym%C3%A5l'
UIT_BODO = 'https://nordnorsk.uit.no/dialekt/bodo/'
UIT_NARVIK = 'https://nordnorsk.uit.no/dialekt/narvik/'
UIT_OFOTEN = 'https://nordnorsk.uit.no/dialekt/08-malet-i-sor-troms-vesteralen-og-ofoten/'
UIT_HAMMERFEST = 'https://nordnorsk.uit.no/dialekt/hammerfest/'
UIT_VESTFINNMARK = 'https://nordnorsk.uit.no/dialekt/03-vestfinnmarksmal/'
UIT_HAMMERFEST_OLDER = 'https://nordnorsk.uit.no/malprover/stream/hammerfest-eldre-mann-haveiendom/'
UIT_HAMMERFEST_YOUNG = 'https://nordnorsk.uit.no/malprover/stream/hammerfest-ung-kvinne-skuter/'

PROFILES = {
    'kristiansand_local_speech': {
        'summary': 'Kristiansand bymål er et dokumentert sørvestlig e-mål på Agderkysten med egne bymålsdrag og tydelig dokumentert endring hos yngre språkbrukere.',
        'variation_note': 'Profilen skiller tradisjonelle bymålstrekk fra nyere utvikling. Kristiansand kommune rommer også talemål som avviker fra sentrumsmålet, blant annet i Søgne, og ingen enkeltform gjelder alle talere.',
        'feature_labels': ['e-infinitiv', 'høgtone', 'skarre-r', '-ane i bestemt flertall', 'blaute konsonanter i endring'],
        'sources': [
            {'label': 'Store norske leksikon – Kristiansand bymål', 'url': SNL_KRS},
            {'label': 'Store norske leksikon – sørlandsk', 'url': SNL_SOR},
        ],
        'feature_evidence': [
            evidence('krs_e_mal', 'Sørvestlig e-mål', 'structural_feature', 'Kristiansand bymål beskrives som et sørvestlig e-mål, med -e i infinitiv og tydelig avstand til både østligere og vestligere nabomål.', 'tradisjonelt og fortsatt strukturelt orienteringsdrag', SNL_KRS, SNL_SOR),
            evidence('krs_hogtone', 'Høgtone', 'structural_feature', 'Kristiansandsmålet har høgtone i tonem-1-ord; SNL beskriver et markant toneskille mot lågtoneområdet øst for byen.', 'dokumentert bymålsdrag', SNL_KRS),
            evidence('krs_skarre_r', 'Skarre-r', 'structural_feature', 'Skarre-r inngår i den dokumenterte lydstrukturen i Kristiansand bymål og i det sørlandske kystområdet rundt byen.', 'dokumentert bymålsdrag', SNL_KRS, SNL_SOR),
            evidence('krs_blaute_endring', 'Blaute konsonanter i retur', 'language_change', 'Tradisjonelle blaute konsonanter b, d og g etter lang vokal er på retur; en ungdomsundersøkelse fra 2016 omtales som tydelig belegg for økt bruk av p, t og k.', 'nyere ungdomsspråk sammenlignet med tradisjonelt bymål', SNL_KRS),
            evidence('krs_ane_kontinuitet', '-ane holder seg', 'language_change', 'Endingen -ane i bestemt flertall beskrives som bemerkelsesverdig stabil også i ungdomsspråket, selv mens flere andre tradisjonelle trekk svekkes.', 'nyere ungdomsspråk og tradisjonelt bymål', SNL_KRS),
        ],
    },
    'valle_setesdal_local_speech': {
        'summary': 'Valle er kjernen i det klassiske setesdalsmålet og materialiseres her som en lokal profil med eksplisitt skille mellom tradisjonell beskrivelse og nåtidig bruk.',
        'variation_note': 'Hovedkilden beskriver i stor grad det tradisjonelle setesdalsmålet. Trekkene nedenfor skal derfor ikke presenteres som om alle nålevende språkbrukere i Valle bruker dem likt.',
        'feature_labels': ['e-infinitiv', 'tradisjonelt Setesdalsmål', 'a i flertall', 'a-presens', 'eldre formverk'],
        'sources': [
            {'label': 'Store norske leksikon – dialekter i Setesdal', 'url': SNL_SETESDAL},
            {'label': 'Store norske leksikon – sørleg e-mål', 'url': SNL_SOR_E},
        ],
        'feature_evidence': [
            evidence('valle_core', 'Kjerneområde', 'corpus_basis', 'Valle blir uttrykkelig omtalt som kjernen i det klassiske setesdalsmålet, og er derfor et faglig relevant lokalt anker fremfor bare en administrativ plassering.', 'dialektologisk områdebeskrivelse', SNL_SETESDAL),
            evidence('valle_e_inf', 'E-infinitiv', 'structural_feature', 'Det klassiske setesdalsmålet som Valle står sentralt i, hører til de sørlige e-målene og har -e i infinitiv og i svake hunkjønnsord i ubestemt entall.', 'tradisjonelt Setesdalsmål', SNL_SETESDAL),
            evidence('valle_a_morph', 'A i flertall og presens', 'structural_feature', 'Den tradisjonelle beskrivelsen har -a i flertall av substantiv og -ar i presens av a-verb, samtidig som infinitiven er et e-mål.', 'tradisjonelt Setesdalsmål', SNL_SETESDAL),
            evidence('valle_old_consonants', 'Eldre konsonanttrekk', 'structural_feature', 'SNL beskriver Setesdalsområdet som et område som har bevart eldre konsonantforbindelser og særutviklinger; dette registreres her som historisk/regionalt belegg, ikke som et universelt nåtidstrekk i Valle.', 'tradisjonell og historisk områdebeskrivelse', SNL_SOR_E, SNL_SETESDAL),
            evidence('valle_scope', 'Tradisjonell kildeprofil', 'social_variation', 'Hovedartikkelen presiserer at framstillingen i hovedsak gjelder det tradisjonelle setesdalsmålet; atlaset må derfor holde nåtidig variasjon åpen i stedet for å gjøre eldre trekk absolutte.', 'kildeavgrensning for nåtidig bruk', SNL_SETESDAL),
        ],
    },
    'bodo_local_speech': {
        'summary': 'Bodø har et veldokumentert folkelig bymål med mye felles med Salten, men også tydelige lokale særdrag og målbar generasjonsvariasjon.',
        'variation_note': 'Bodø har både historisk sosial variasjon og forskjeller mellom informanter og aldersgrupper. Profilen gjelder dokumenterte trekk i det folkelige bymålet og må ikke brukes som én norm for alle bodøværinger.',
        'feature_labels': ['apokope', 'nullinfinitiv', 'æ–mæ–dæ', 'nu og ikke', 'palatalisering i endring'],
        'sources': [
            {'label': 'UiT Nordnorske dialekter – Bodø', 'url': UIT_BODO},
            {'label': 'Store norske leksikon – Bodø bymål', 'url': SNL_BODO},
        ],
        'feature_evidence': [
            evidence('bodo_salten_distinct', 'Bodø skiller seg fra Salten rundt', 'structural_feature', 'Bodø deler tonefall, apokope og palatalisering med Salten, men skiller seg blant annet gjennom mindre apokope, enklere bøying og egne pronomen- og adverbformer.', 'dokumentert bymål sammenlignet med omlandet', UIT_BODO, SNL_BODO),
            evidence('bodo_pron_adv', 'æ, mæ, dæ – nu – ikke', 'structural_feature', 'Det folkelige Bodø-bymålet er dokumentert med pronomenformene æ, mæ og dæ, tidsadverbet nu og nektingsadverbet ikke, i kontrast til flere omkringliggende Saltenformer.', 'dokumentert bymålsdrag', UIT_BODO, SNL_BODO),
            evidence('bodo_apokope', 'Apokope og nullinfinitiv', 'structural_feature', 'Bodø ligger i et sterkt apokopeområde og har i opptakene stort sett apokopert infinitiv, men bymålet har mindre apokope enn mange Saltenmål omkring byen.', 'tradisjonelt og moderne opptaksmateriale', UIT_BODO, SNL_BODO),
            evidence('bodo_e_inf_change', 'Mer e-infinitiv hos yngre', 'language_change', 'UiT beskriver innslag av e-infinitiv i ScanDiaSyn-opptakene og peker på at dette kan være vanligere hos yngre enn hos eldre informanter.', 'yngre sammenlignet med eldre ScanDiaSyn-informanter', UIT_BODO),
            evidence('bodo_palatal_change', 'Palatalisering varierer med alder', 'language_change', 'Palatalisering er ulikt gjennomført i Bodø-opptakene; den eldre kvinnelige informanten har mye, mens den unge kvinnelige informanten knapt har palatalisering.', 'yngre sammenlignet med eldre ScanDiaSyn-informanter', UIT_BODO),
        ],
    },
    'narvik_local_speech': {
        'summary': 'Narvik er et veldokumentert lokalt bymål som skiller seg markant fra flere Ofoten-mål rundt byen og har egne opptak av yngre og eldre språkbrukere.',
        'variation_note': 'Narvikprofilen bygger på både tradisjonell beskrivelse og ScanDiaSyn-opptak. Kontrasten til omlandet er tydelig, men enkeltinformanter og aldersgrupper skal fortsatt kunne variere.',
        'feature_labels': ['e-infinitiv', 'e-presens', 'ikke', 'retroflektering', 'æ(g) og nu'],
        'sources': [
            {'label': 'UiT Nordnorske dialekter – Narvik', 'url': UIT_NARVIK},
            {'label': 'UiT Nordnorske dialekter – Sør-Troms, Vesterålen og Ofoten', 'url': UIT_OFOTEN},
        ],
        'feature_evidence': [
            evidence('narvik_e_mal', 'E-mål og lite apokope', 'structural_feature', 'Narvikmålet beskrives som et e-mål med e-infinitiv, e-presens og relativt lite apokope sammenlignet med dialektene omkring Narvik.', 'tradisjonell beskrivelse støttet av opptak', UIT_NARVIK, UIT_OFOTEN),
            evidence('narvik_ikke', 'ikke som lokalt bytrekk', 'structural_feature', 'Nektingsadverbet ikke er et markant tradisjonelt Narvik-trekk i kontrast til ikkje i flere omkringliggende Ofoten-dialekter.', 'særlig tydelig i eldre kontrast til omlandet', UIT_NARVIK, UIT_OFOTEN),
            evidence('narvik_retroflex', 'Retroflektering', 'structural_feature', 'Narvik har tradisjonelt retroflektering eller dental uttale der omkringliggende dialekter kan ha palatalisering av historiske dentaler.', 'dokumentert lokalt kontrasttrekk', UIT_NARVIK, UIT_OFOTEN),
            evidence('narvik_pron_nu', 'æ(g) og nu', 'structural_feature', 'UiTs lokale profil dokumenterer pronomenet æ(g) og tidsadverbet nu sammen med hær/dær som karakteristiske former i Narvikmaterialet.', 'opptak av yngre og eldre informanter', UIT_NARVIK),
            evidence('narvik_corpus', 'Yngre og eldre målprøver', 'corpus_basis', 'UiT har lokale målprøver fra både eldre og yngre Narvik-informanter, slik at profilen kan bygge på faktisk talemålsmateriale og ikke bare regional arv.', 'ScanDiaSyn/Nordnorske dialekter', UIT_NARVIK),
        ],
    },
    'hammerfest_local_speech': {
        'summary': 'Hammerfest har et UiT/ScanDiaSyn-dokumentert lokalt talemål i Vestfinnmark med konkrete opptak som viser både stabile trekk og generasjonsendring.',
        'variation_note': 'Hammerfestmaterialet viser tydelige forskjeller mellom yngre og eldre informanter. Profilen skiller derfor strukturelle trekk fra endring og skal ikke gjøre kystfinnmarksmål eller Hammerfest til én homogen språkform.',
        'feature_labels': ['e/a-mål', 'e-infinitiv', 'æ og demm', 'tre kjønn', 'palatalisering i endring', 'no → nu'],
        'sources': [
            {'label': 'UiT Nordnorske dialekter – Hammerfest', 'url': UIT_HAMMERFEST},
            {'label': 'UiT Nordnorske dialekter – Vestfinnmarksmål', 'url': UIT_VESTFINNMARK},
            {'label': 'UiT målprøve – Hammerfest eldre mann', 'url': UIT_HAMMERFEST_OLDER},
            {'label': 'UiT målprøve – Hammerfest ung kvinne', 'url': UIT_HAMMERFEST_YOUNG},
        ],
        'feature_evidence': [
            evidence('hammerfest_ea', 'E/a-mål', 'structural_feature', 'Hammerfestopptakene beskrives som e/a-mål: infinitiv har e-ending, mens svake hunkjønnsord kan ha a-ending med dokumentert variasjon mot e-ending.', 'ScanDiaSyn-materiale', UIT_HAMMERFEST, UIT_VESTFINNMARK),
            evidence('hammerfest_pron', 'æ, demm og ikke', 'structural_feature', 'Det lokale materialet dokumenterer nektingsadverbet ikke og pronomenformene æ og demm; de konkrete målprøvene gir direkte eksempler på disse formene.', 'yngre og eldre opptak', UIT_HAMMERFEST, UIT_HAMMERFEST_OLDER, UIT_HAMMERFEST_YOUNG),
            evidence('hammerfest_gender', 'Tre grammatiske kjønn', 'structural_feature', 'Både yngre og eldre Hammerfest-informanter er dokumentert med tre grammatiske kjønn, blant annet feminine substantivformer.', 'yngre og eldre ScanDiaSyn-informanter', UIT_HAMMERFEST),
            evidence('hammerfest_palatal', 'Palatalisering svekkes hos yngre', 'language_change', 'Palatalisering av historiske lange dentaler er gjennomført hos de eldre informantene, men mindre gjennomført hos de yngre; apokope ser også ut til å være vanligere hos eldre.', 'yngre sammenlignet med eldre ScanDiaSyn-informanter', UIT_HAMMERFEST),
            evidence('hammerfest_no_nu', 'Fra no mot nu', 'language_change', 'De eldre Hammerfest-informantene bruker mest no, mens de yngre bruker mest nu, noe UiT presenterer som en tydelig aldersrelatert forskjell i materialet.', 'yngre sammenlignet med eldre ScanDiaSyn-informanter', UIT_HAMMERFEST, UIT_HAMMERFEST_YOUNG),
        ],
    },
}

atlas = read_json(ATLAS_PATH)
locals_by_id = {row.get('id'): row for row in atlas.get('local_varieties', [])}
for id_, material in PROFILES.items():
    row = locals_by_id.get(id_)
    if not row:
        raise RuntimeError(f'Mangler lokalprofil {id_}')
    row['profile_status'] = 'evidence_materialized'
    row['evidence_last_verified'] = VERIFIED
    row['summary'] = material['summary']
    row['variation_note'] = material['variation_note']
    row['feature_labels'] = material['feature_labels']
    row['feature_evidence'] = material['feature_evidence']
    row['sources'] = merge_sources(row.get('sources'), material['sources'])
    if len(row['sources']) < 2:
        raise RuntimeError(f'{id_}: trenger minst to profilkilder')
    if len(row['feature_labels']) < 4 or len(row['feature_evidence']) < 4:
        raise RuntimeError(f'{id_}: utilstrekkelig evidensmaterialisering')
    for item in row['feature_evidence']:
        if len(item['claim']) < 20 or not item['source_urls'] or any(not url.startswith('https://') for url in item['source_urls']):
            raise RuntimeError(f'{id_}/{item["id"]}: ugyldig belegg')
write_json(ATLAS_PATH, atlas)

schema = read_json(SCHEMA_PATH)
local_item = schema['properties']['local_varieties']['items']
local_item['properties']['feature_labels']['minItems'] = 4
local_item['properties']['feature_evidence']['minItems'] = 4
rule = next((r for r in local_item.get('allOf', []) if r.get('x-history-go-rule') == 'evidence-materialized'), None)
if rule is None:
    raise RuntimeError('Mangler evidence-materialized-regel i schema')
rule['then']['properties'] = {
    'sources': {'minItems': 2},
    'feature_labels': {'minItems': 4},
    'feature_evidence': {'minItems': 4},
}
write_json(SCHEMA_PATH, schema)

# Dokumenter forskningsstyrt progresjon uten å gjøre batchnummer til produktnavn.
docs = DOCS_PATH.read_text(encoding='utf-8').rstrip()
marker = '## Videre evidensmaterialisering av lokale talemål'
if marker not in docs:
    docs += f'''\n\n{marker}\n\nEtter første materialisering skal nye lokale profiler velges etter **dokumentasjonsstyrke**, ikke etter bystørrelse eller en forhåndslaget eksempel-liste. Neste materialiserte profiler er Kristiansand, Valle i Setesdal, Bodø, Narvik og Hammerfest. Utvalget kombinerer bymål, et tydelig dal-/bygdemålsanker og lokale nordnorske profiler med direkte målprøver.\n\nFor `evidence_materialized` er minstekravet nå låst til minst **fire synlige målmerker**, **fire strukturerte beleggpunkter** og **to profilkilder**. Hvert beleggpunkts `time_scope` skal gjøre det mulig å skille tradisjonelle beskrivelser, nåtidige opptak og dokumentert språkendring. En kilde som hovedsakelig beskriver tradisjonelt talemål gir ikke tillatelse til å presentere trekket som universelt nåtidsspråk.\n'''
DOCS_PATH.write_text(docs + '\n', encoding='utf-8')

tests = TEST_PATH.read_text(encoding='utf-8').rstrip()
marker_test = 'Evidensmaterialiserte lokalprofiler har en generell kvalitetsport og forskningsstyrt andre gruppe'
if marker_test not in tests:
    tests += f'''\n\n\ntest("{marker_test}", () => {{\n  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");\n  const schema = json("data/leksikon/sprak/atlas_schema_v1.json");\n  const contract = read("docs/SPRAKLEKSIKON.md");\n  const locals = atlas.local_varieties || [];\n  const materialized = locals.filter(row => row.profile_status === "evidence_materialized");\n  assert.ok(materialized.length >= 10, `for få evidensmaterialiserte lokalprofiler: ${{materialized.length}}`);\n  for (const row of materialized) {{\n    assert.match(String(row.evidence_last_verified || ""), /^\\d{{4}}-\\d{{2}}-\\d{{2}}$/, `${{row.id}}: mangler verifiseringsdato`);\n    assert.ok((row.feature_labels || []).length >= 4, `${{row.id}}: trenger minst fire synlige målmerker`);\n    assert.ok((row.feature_evidence || []).length >= 4, `${{row.id}}: trenger minst fire beleggpunkter`);\n    assert.ok((row.sources || []).length >= 2, `${{row.id}}: trenger minst to profilkilder`);\n    for (const item of row.feature_evidence || []) {{\n      assert.ok(text(item.claim).length >= 20, `${{row.id}}/${{item.id}}: påstanden er for tynn`);\n      assert.ok(text(item.time_scope), `${{row.id}}/${{item.id}}: time_scope mangler`);\n      assert.ok((item.source_urls || []).length >= 1, `${{row.id}}/${{item.id}}: direkte kilde mangler`);\n      for (const url of item.source_urls || []) assert.ok(String(url).startsWith("https://"), `${{row.id}}/${{item.id}}: kilde må være HTTPS`);\n    }}\n  }}\n\n  const expected = new Map([\n    ["kristiansand_local_speech", ["e-infinitiv", "høgtone"]],\n    ["valle_setesdal_local_speech", ["e-infinitiv", "tradisjonelt Setesdalsmål"]],\n    ["bodo_local_speech", ["apokope", "nu og ikke"]],\n    ["narvik_local_speech", ["e-infinitiv", "retroflektering"]],\n    ["hammerfest_local_speech", ["e/a-mål", "tre kjønn"]]\n  ]);\n  const byId = new Map(locals.map(row => [row.id, row]));\n  for (const [id, labels] of expected) {{\n    const row = byId.get(id);\n    assert.ok(row, `${{id}}: profil mangler`);\n    assert.equal(row.profile_status, "evidence_materialized", `${{id}}: skal være evidensmaterialisert`);\n    for (const label of labels) assert.ok((row.feature_labels || []).includes(label), `${{id}}: mangler ${{label}}`);\n  }}\n\n  const localItem = schema.properties.local_varieties.items;\n  assert.ok(localItem.properties.feature_labels.minItems >= 4);\n  assert.ok(localItem.properties.feature_evidence.minItems >= 4);\n  const rule = (localItem.allOf || []).find(row => row["x-history-go-rule"] === "evidence-materialized");\n  assert.ok(rule?.then?.properties?.sources?.minItems >= 2, "schema må kreve minst to profilkilder for evidence_materialized");\n  assert.match(contract, /dokumentasjonsstyrke/i);\n  assert.match(contract, /tradisjonelt talemål[^\\n]*ikke[^\\n]*universelt nåtidsspråk/i);\n}});\n'''
TEST_PATH.write_text(tests + '\n', encoding='utf-8')

print('Materialized local speech evidence:', ', '.join(PROFILES))
