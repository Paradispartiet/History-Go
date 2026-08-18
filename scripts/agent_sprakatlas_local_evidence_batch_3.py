import json
from pathlib import Path

ROOT = Path('.')
ATLAS_PATH = ROOT / 'data/leksikon/sprak/norge_atlas_v1.json'
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


SNL_VOSS = 'https://snl.no/vossam%C3%A5l'
SNL_SW_A = 'https://snl.no/s%C3%B8rvestlandsk_a-m%C3%A5l'
SNL_HALLING = 'https://snl.no/dialekter_i_Hallingdal'
SNL_BUSKERUD = 'https://snl.no/dialekter_i_Buskerud'
NDC_TREEBANK = 'https://tekstlab.uio.no/nota/scandiasyn/treebank.html'
UIT_HATTFJELLDAL = 'https://nordnorsk.uit.no/dialekt/h/'
UIT_VEFSN = 'https://nordnorsk.uit.no/dialekt/11-vefsnmal/'
UIT_SPLIT_FEM = 'https://nordnorsk.uit.no/malmerker/substantiv-delt-hokjonn/'
SNL_HATTFJELLDAL = 'https://snl.no/Hattfjelldal'
UIT_SOMNA = 'https://nordnorsk.uit.no/dialekt/somna/'
UIT_BRONNOY = 'https://nordnorsk.uit.no/dialekt/12-bronnoymal/'
UIT_TANA = 'https://nordnorsk.uit.no/dialekt/tana/'
UIT_INNER_FINNMARK = 'https://nordnorsk.uit.no/dialekt/02-indre-finnmarksmal/'
SAMI_ADMIN = 'https://www.regjeringen.no/no/tema/urfolk-og-minoriteter/samepolitikk/samiske-sprak/forvaltningsomradet-for-samisk-sprak/id2910947/'

PROFILES = {
    'voss_local_speech': {
        'summary': 'Vossamålet er et dokumentert sørvestlandsk a-mål med en rik tradisjonell struktur og tydelig nyere regionalisering og generasjonsendring.',
        'variation_note': 'Profilen skiller tradisjonelle vossatrekk fra utvikling hos yngre og fra sentrumsmålet på Vossevangen. Ingen av trekkene skal brukes som en påstand om at alle på Voss snakker likt.',
        'feature_labels': ['a-infinitiv', 'vossa-u', 'ao-diftongering', 'skarre-r i framgang', 'dativ i tilbakegang'],
        'sources': [
            {'label': 'Store norske leksikon – vossamål', 'url': SNL_VOSS},
            {'label': 'Store norske leksikon – sørvestlandsk a-mål', 'url': SNL_SW_A},
        ],
        'feature_evidence': [
            evidence('voss_a_mal', 'Sørvestlandsk a-mål', 'structural_feature', 'Det tradisjonelle vossamålet hører til sørvestlandsk a-mål og har -a i infinitiv og i svake hunkjønnsord i ubestemt entall.', 'tradisjonelt vossamål', SNL_VOSS, SNL_SW_A),
            evidence('voss_vossa_u', 'Vossa-u', 'structural_feature', 'Voss og Hardanger har en særskilt vokalkvalitet omtalt som vossa-u, dokumentert i blant annet sterke verb og enkelte substantivformer.', 'tradisjonelt vossamål', SNL_VOSS),
            evidence('voss_diphthong', 'Diftongering av å', 'structural_feature', 'Vossabygdene har tradisjonelt markert diftongering av å til ao, mens flere eldre vokal- og konsonantsærdrag har mindre plass i talemålet til unge.', 'tradisjonelt trekk med dokumentert nyere reduksjon i deler av systemet', SNL_VOSS),
            evidence('voss_r_change', 'Skarre-r brer seg', 'language_change', 'Rulle-r holdt lenge stand på Voss, men skarre-r beskrives nå som ekspansiv og som en form som tar over hos mange yngre språkbrukere.', 'nyere generasjonsendring', SNL_VOSS),
            evidence('voss_regionalization', 'Dativ og særdrag svekkes', 'language_change', 'Dativ og flertallsbøying av verb er på retur hos unge, og Vossevangen beskrives som et sentrumsmål under påvirkning fra Bergen bymål.', 'nyere generasjons- og regionaliseringsendring', SNL_VOSS),
        ],
    },
    'aal_local_speech': {
        'summary': 'Ål er et dokumentert lokalt korpusanker i Hallingdal. Profilen skiller mellom hallingmålstrekk på regionalt nivå og endringer som kildene uttrykkelig knytter til Ål og andre bygdesentre.',
        'variation_note': 'Kløyvd infinitiv og delt hunkjønn er dokumentert for Hallingdal som dialektområde og skal ikke fremstilles som unike Ål-trekk. Kildene beskriver samtidig tydelig utjevning i Ål og hos yngre språkbrukere.',
        'feature_labels': ['kløyvd infinitiv', 'delt hunkjønn', 'dativ i tilbakegang', '-dn i tilbakegang', 'NDC-opptak fra Ål'],
        'sources': [
            {'label': 'Store norske leksikon – dialekter i Hallingdal', 'url': SNL_HALLING},
            {'label': 'Store norske leksikon – dialekter i Buskerud', 'url': SNL_BUSKERUD},
            {'label': 'UiO Tekstlab – NDC Treebank', 'url': NDC_TREEBANK},
        ],
        'feature_evidence': [
            evidence('aal_halling_structure', 'Hallingmål som regional ramme', 'structural_feature', 'Hallingmålet er et midlandsmål med kløyvd infinitiv og delt hunkjønn; Ål-profilen bruker dette som regional ramme, ikke som påståtte unike Ål-trekk.', 'regional tradisjonell beskrivelse av Hallingdal', SNL_HALLING),
            evidence('aal_ndc', 'Direkte korpusanker', 'corpus_basis', 'Ål i Hallingdal er ett av de eksplisitt navngitte norske opptaksstedene i den manuelt korrigerte NDC Treebank, som bygger på Nordisk dialektkorpus.', 'NDC-opptak brukt i treebank', NDC_TREEBANK),
            evidence('aal_mixed_today', 'Utjevnet sentrumsmål', 'language_change', 'SNL beskriver Ål sammen med andre bygdesentre i Hallingdal som steder der en i dag hører et mer oppblandet mål med flere avslipte tradisjonelle dialekttrekk.', 'nyere talemål i bygdesentre', SNL_BUSKERUD),
            evidence('aal_dative_change', 'Dativ på retur', 'language_change', 'Dativbruk beskrives som lite brukt av unge i Hallingdal og som et trekk som faller bort i dagens talemål i blant annet bygdesentrene.', 'nyere generasjonsendring', SNL_HALLING, SNL_BUSKERUD),
            evidence('aal_dn_change', '-dn svekkes', 'language_change', 'Den særmerkte -dn-uttalen er dokumentert som vikende i tettsteder i Hallingdal og hos ungdom generelt, med mer utjevnede former i stedet.', 'nyere tettsteds- og generasjonsendring', SNL_BUSKERUD),
        ],
    },
    'hattfjelldal_local_speech': {
        'summary': 'Hattfjelldal har direkte ScanDiaSyn-opptak av et tradisjonelt norsk talemål med apokope, delt hunkjønn og flere konservative trekk, samtidig som kommunen er et sørsamisk språkområde.',
        'variation_note': 'UiT-informantene er ikke et tilfeldig tverrsnitt: særlig de yngre beskriver selv talemålet sitt som bredere enn hos mange jevnaldrende. Profilen gjelder norsk talemål; sørsamisk er et eget språk og modelleres separat.',
        'feature_labels': ['apokope i infinitiv', 'delt hunkjønn', 'tjukk l', 'palatalisering', 'ikke/ikkje-variasjon', 'sørsamisk er eget språk'],
        'sources': [
            {'label': 'UiT Nordnorske dialekter – Hattfjelldal', 'url': UIT_HATTFJELLDAL},
            {'label': 'UiT Nordnorske dialekter – Vefsnmål', 'url': UIT_VEFSN},
            {'label': 'Store norske leksikon – Hattfjelldal', 'url': SNL_HATTFJELLDAL},
        ],
        'feature_evidence': [
            evidence('hatt_apocope', 'Apokope og verbbøying', 'structural_feature', 'De fire Hattfjelldal-informantene har apokope i infinitiv, mens presens varierer etter verbklasse med blant annet a-ending i kaste-klassen.', 'ScanDiaSyn-informanter, tradisjonelt lokalt talemål', UIT_HATTFJELLDAL),
            evidence('hatt_split_fem', 'Delt hunkjønn', 'structural_feature', 'Hattfjelldalmaterialet har delt hunkjønn, og den bredere korpusbeskrivelsen viser at systemet er bedre bevart hos eldre enn hos yngre informanter fra Sør-Helgeland.', 'eldre og yngre korpusmateriale', UIT_HATTFJELLDAL, UIT_SPLIT_FEM),
            evidence('hatt_consonants', 'Tjukk l og palatalisering', 'structural_feature', 'Det lokale opptaksmaterialet dokumenterer både tjukk l og palatalisering av historiske dentaler og velarer, sammen med rester av dativ.', 'ScanDiaSyn-informanter', UIT_HATTFJELLDAL),
            evidence('hatt_negation_variation', 'Ikke/ikkje varierer', 'social_variation', 'De registrerte yngre informantene bruker tradisjonell dialekt og blant annet ikkje, samtidig som en eldre informant beskriver ikke som en form som forekommer i ungdomsspråket ellers; dette er intern variasjon, ikke én ny norm.', 'samtidig lokal og generasjonsmessig variasjon', UIT_HATTFJELLDAL),
            evidence('hatt_language_separation', 'Norsk og sørsamisk holdes atskilt', 'contact_history', 'Hattfjelldal er del av forvaltningsområdet for samisk språk, og sørsamisk og norsk har egen språkstatus. Den norske talemålsprofilen skal derfor aldri absorbere sørsamisk som et dialekttrekk.', 'nåtidig institusjonell og språklig kontekst', SNL_HATTFJELLDAL, SAMI_ADMIN),
        ],
    },
    'soemna_local_speech': {
        'summary': 'Sømna har direkte ScanDiaSyn-materiale fra Sør-Helgeland med trekk som knytter talemålet både til nordnorsk og til nordlig trøndersk, og med tydelig variasjon hos yngre.',
        'variation_note': 'Kildene skiller mellom eldre informanters tradisjonelle system og yngre informanters blanding av tradisjonelle, regionale og mer standardnære former. Profilen skal bevare denne variasjonen.',
        'feature_labels': ['kløyvd/nullinfinitiv', 'a-presens', 'delt hunkjønn', 'tjukk l', 'ungdomsvariasjon'],
        'sources': [
            {'label': 'UiT Nordnorske dialekter – Sømna', 'url': UIT_SOMNA},
            {'label': 'UiT Nordnorske dialekter – Brønnøymål', 'url': UIT_BRONNOY},
            {'label': 'UiT målmerke – delt hunkjønn', 'url': UIT_SPLIT_FEM},
        ],
        'feature_evidence': [
            evidence('somna_north_trond', 'Nordnorsk og trøndersk kontaktflate', 'structural_feature', 'Sømna-materialet kombinerer trekk som er typiske for nordnorsk med flere trekk som også finnes i nordlige trøndermål, og skal derfor ikke reduseres til én grov hovedgruppe.', 'tradisjonelt lokalt talemål i regional kontaktflate', UIT_SOMNA),
            evidence('somna_morph', 'A-presens og svakt hunkjønn', 'structural_feature', 'De eldre Sømna-informantene har blant annet a-presens i kaste-klassen, a-ending i svakt hunkjønn ubestemt entall og nektingsadverbet ikkje.', 'eldre ScanDiaSyn-informanter', UIT_SOMNA, UIT_BRONNOY),
            evidence('somna_inf_l', 'Infinitiv og tjukk l', 'structural_feature', 'Brønnøymålsgruppen som Sømna inngår i er dokumentert med kløyvd/nullinfinitiv og tjukk l, og Sømna har egne målprøver i korpuset.', 'regional struktur med direkte lokale målprøver', UIT_SOMNA, UIT_BRONNOY),
            evidence('somna_young_variation', 'Yngre varierer mer', 'language_change', 'De unge Sømna-informantene har fortsatt mange tradisjonelle former, men talemålet deres beskrives som preget av variasjon mellom tradisjonelle, regionale og standardnære former.', 'yngre sammenlignet med eldre ScanDiaSyn-informanter', UIT_SOMNA),
            evidence('somna_gender_change', 'Delt hunkjønn svekkes', 'language_change', 'Korpusoversikten viser at delt hunkjønn fortsatt er delvis bevart hos eldre Sømna-informanter, mens yngre viser større variasjon mellom endingene.', 'eldre sammenlignet med yngre korpusinformanter', UIT_SPLIT_FEM),
        ],
    },
    'tana_norwegian_local_speech': {
        'summary': 'Tana har direkte ScanDiaSyn-opptak av norsk talemål i et historisk og nåtidig flerspråklig miljø. Profilen beskriver bare det norske talemålet i materialet; samiske språk og kvensk er egne språk.',
        'variation_note': 'De fire informantene har ulike familiebakgrunner og språkerfaringer. Språkkontakt registreres som dokumentert kontekst for disse opptakene, ikke som en egenskap ved alle i Tana eller som et norsk dialekttrekk.',
        'feature_labels': ['e-infinitiv', 'ikke og nu', 'æ–mæ–dåkker–dæmm', 'presens -r hos yngre', 'språkkontakt i opptak', 'samiske språk er egne språk'],
        'sources': [
            {'label': 'UiT Nordnorske dialekter – Tana', 'url': UIT_TANA},
            {'label': 'UiT Nordnorske dialekter – indre finnmarksmål', 'url': UIT_INNER_FINNMARK},
            {'label': 'Regjeringen – forvaltningsområdet for samisk språk', 'url': SAMI_ADMIN},
        ],
        'feature_evidence': [
            evidence('tana_e_mal', 'E-mål', 'structural_feature', 'De fire Tana-informantene har norsk e-mål med -e i infinitiv; svakt hunkjønn har stort sett -e, men de eldre opptakene har også enkelte a-former.', 'ScanDiaSyn-materiale med aldersvariasjon', UIT_TANA),
            evidence('tana_pron_adv', 'ikke, nu og pronomenformer', 'structural_feature', 'Tana-opptakene dokumenterer nektingsadverbet ikke, tidsadverbet nu og pronomenformer som æ, mæ, dåkker og dæmm.', 'ScanDiaSyn-informanter', UIT_TANA, UIT_INNER_FINNMARK),
            evidence('tana_present_change', 'Presens -r sterkere hos yngre', 'language_change', 'Presens med -r beskrives som dominerende hos de unge Tana-informantene, mens de eldre har større variasjon mellom -r, -e og apokope.', 'yngre sammenlignet med eldre ScanDiaSyn-informanter', UIT_TANA),
            evidence('tana_contact_sample', 'Flerspråklig opptakskontekst', 'contact_history', 'I dette konkrete informantutvalget har de eldre bakgrunn fra samisk- eller samisk/kvensktalende familier, mens yngre informanter har delvis samisktalende foreldre og samiskopplæring; dette beskriver utvalget, ikke alle i Tana.', 'informantbakgrunn i ScanDiaSyn-materialet', UIT_TANA),
            evidence('tana_language_separation', 'Norsk profil er ikke samisk språklag', 'contact_history', 'Tana er del av forvaltningsområdet for samisk språk. Atlaset skal derfor holde norsk talemålsvariasjon, samiske språk og kvensk som separate språk-/talemålslag selv når språkkontakt er dokumentert.', 'nåtidig institusjonell og språklig kontekst', SAMI_ADMIN, UIT_TANA),
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
    if len(row['sources']) < 2 or len(row['feature_labels']) < 4 or len(row['feature_evidence']) < 4:
        raise RuntimeError(f'{id_}: utilstrekkelig evidensmaterialisering')
    for item in row['feature_evidence']:
        if len(item['claim']) < 20 or not item['time_scope'] or not item['source_urls'] or any(not url.startswith('https://') for url in item['source_urls']):
            raise RuntimeError(f'{id_}/{item["id"]}: ugyldig belegg')
write_json(ATLAS_PATH, atlas)

docs = DOCS_PATH.read_text(encoding='utf-8').rstrip()
marker = '## Lokal evidens: regional arv, lokalt korpus og språkkontakt'
if marker not in docs:
    docs += f'''\n\n{marker}\n\nLokal materialisering må skille mellom tre ulike typer belegg: **lokalt opptak/korpus**, **regionalt målmerke** og **lokalt dokumentert endring**. Et regionalt trekk kan brukes som ramme for et lokalt anker, men skal ikke merkes som unikt for stedet uten lokalt belegg. Ål er et eksempel: Hallingdal gir den strukturelle rammen, mens NDC og kilder om dagens Buskerud gir lokalt/nyere belegg.\n\nSpråkkontakt skal heller ikke gjøre separate språk til dialekttrekk. For norsk talemål i Tana og Hattfjelldal registreres samisk språkkontakt og institusjonell flerspråklighet som kontekst, mens samiske språk fortsatt eies av egne språklag. Den tredje forskningsstyrte gruppen materialiserer Voss, Ål, Hattfjelldal, Sømna og norsk talemål i Tana.\n'''
DOCS_PATH.write_text(docs.rstrip() + '\n', encoding='utf-8')

tests = TEST_PATH.read_text(encoding='utf-8').rstrip()
marker_test = 'Lokal evidens skiller regional ramme, direkte korpus og separate språk'
if marker_test not in tests:
    tests += f'''\n\n\ntest("{marker_test}", () => {{\n  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");\n  const contract = read("docs/SPRAKLEKSIKON.md");\n  const locals = atlas.local_varieties || [];\n  const materialized = locals.filter(row => row.profile_status === "evidence_materialized");\n  assert.ok(materialized.length >= 15, `for få evidensmaterialiserte lokalprofiler: ${{materialized.length}}`);\n\n  const expected = new Map([\n    ["voss_local_speech", ["a-infinitiv", "vossa-u", "skarre-r i framgang"]],\n    ["aal_local_speech", ["kløyvd infinitiv", "NDC-opptak fra Ål", "dativ i tilbakegang"]],\n    ["hattfjelldal_local_speech", ["apokope i infinitiv", "delt hunkjønn", "sørsamisk er eget språk"]],\n    ["soemna_local_speech", ["kløyvd/nullinfinitiv", "delt hunkjønn", "ungdomsvariasjon"]],\n    ["tana_norwegian_local_speech", ["e-infinitiv", "presens -r hos yngre", "samiske språk er egne språk"]]\n  ]);\n  const byId = new Map(locals.map(row => [row.id, row]));\n  for (const [id, labels] of expected) {{\n    const row = byId.get(id);\n    assert.ok(row, `${{id}}: profil mangler`);\n    assert.equal(row.profile_status, "evidence_materialized", `${{id}}: skal være evidensmaterialisert`);\n    assert.ok((row.sources || []).length >= 2, `${{id}}: trenger minst to profilkilder`);\n    assert.ok((row.feature_evidence || []).length >= 4, `${{id}}: trenger minst fire beleggpunkter`);\n    for (const label of labels) assert.ok((row.feature_labels || []).includes(label), `${{id}}: mangler ${{label}}`);\n  }}\n\n  const aal = byId.get("aal_local_speech");\n  assert.ok((aal.feature_evidence || []).some(item => item.kind === "corpus_basis" && /Ål/.test(item.claim)), "Ål må ha direkte korpusbelegg");\n  assert.match(`${{aal.summary}} ${{aal.variation_note}}`, /regional|Hallingdal/i, "Ål må skille regional ramme fra lokale påstander");\n\n  for (const id of ["hattfjelldal_local_speech", "tana_norwegian_local_speech"]) {{\n    const row = byId.get(id);\n    assert.match(`${{row.summary}} ${{row.variation_note}}`, /eget språk|egne språk|separat/i, `${{id}}: samiske språk må holdes separate fra norsk dialekt`);\n    assert.ok((row.feature_evidence || []).some(item => item.kind === "contact_history"), `${{id}}: dokumentert språkkontaktkontekst mangler`);\n  }}\n\n  assert.match(contract, /regionalt målmerke/i);\n  assert.match(contract, /separate språk[^\\n]*dialekttrekk/i);\n}});\n'''
TEST_PATH.write_text(tests.rstrip() + '\n', encoding='utf-8')

print('Materialized local speech evidence:', ', '.join(PROFILES))
