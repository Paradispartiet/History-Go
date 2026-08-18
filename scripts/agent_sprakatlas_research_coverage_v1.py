#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
ATLAS_PATH = ROOT / 'data/leksikon/sprak/norge_atlas_v1.json'
SCHEMA_PATH = ROOT / 'data/leksikon/sprak/atlas_schema_v1.json'
DOCS_PATH = ROOT / 'docs/SPRAKLEKSIKON.md'
TEST_PATH = ROOT / 'tests/place-language-dialect-scope.test.mjs'

atlas = json.loads(ATLAS_PATH.read_text())


def src(label, url):
    return {'label': label, 'url': url}


NDC_LIST = src('UiO Tekstlab – NorDiaSyn/Nordisk dialektkorpus, opptakssteder', 'https://tekstlab.uio.no/nota/NorDiaSyn/opptakssteder.pdf')
NDC_INFO = src('UiO Tekstlab – NorDiaSyn datainnsamling', 'https://tekstlab.uio.no/nota/NorDiaSyn/datainnsamling.html')
LIA = src('UiO Tekstlab – LIA norsk', 'https://tekstlab.uio.no/LIA/norsk/')
DIALECT_WORDS = src('UiO Tekstlab – dialektordlister', 'https://tekstlab.uio.no/dialektord')
UIT_NORTH = src('UiT – Nordnorske dialekter, dialektoversikt', 'https://nordnorsk.uit.no/dialekt/')
SNL_NORWAY = src('Store norske leksikon – dialekter i Noreg', 'https://snl.no/dialekter_i_Noreg')
SNL_DIVISION = src('Store norske leksikon – inndeling av dialekter i Noreg', 'https://snl.no/dialekter_i_Noreg_-_inndeling')

atlas['research_basis'] = {
    'verified_at': '2026-08-18',
    'methodology': [
        'De fire nasjonale hovedgruppene brukes bare som grov orientering; regionale og lokale profiler er den konkrete atlasenheten.',
        'Et lokalt talemål kan opprettes som corpus-anker når stedet er dokumentert i et talemålskorpus, men konkrete målmerker publiseres ikke uten egen lokal eller regional fagkilde.',
        'Bymål og tettstedstalemål behandles som internt variable. Sosial, geografisk, aldersmessig og kontaktbasert variasjon skal ikke jevnes ut til én stereotyp profil.',
        'Samiske språk, kvensk og andre minoritetsspråk modelleres som språk, ikke som norske dialekter; norske talemålsprofiler i flerspråklige områder skal si dette eksplisitt.'
    ],
    'source_coverage': [
        {
            'id': 'ndc_v4',
            'kind': 'spoken_corpus',
            'coverage': '111 utvalgte målepunkter i Norge i Nordisk dialektkorpus v4.0',
            'source': NDC_INFO
        },
        {
            'id': 'lia_norsk',
            'kind': 'historical_spoken_corpus',
            'coverage': '1382 informanter fra 227 steder/kommuner og om lag 3,5 millioner ord',
            'source': LIA
        },
        {
            'id': 'dialektordlister',
            'kind': 'derived_wordlists',
            'coverage': 'automatisk genererte ordlister fra et stort antall norske dialekter basert på eldre universitetsopptak',
            'source': DIALECT_WORDS
        },
        {
            'id': 'uit_nordnorsk',
            'kind': 'regional_dialect_atlas',
            'coverage': '13 navngitte nordnorske dialektgrupper med lokale målmerker og målprøver',
            'source': UIT_NORTH
        }
    ],
    'baseline_sources': [SNL_NORWAY, SNL_DIVISION, NDC_INFO, LIA, UIT_NORTH]
}


def upsert_region(row):
    regions = atlas.setdefault('dialect_regions', [])
    for index, current in enumerate(regions):
        if current.get('id') == row['id']:
            regions[index] = row
            return
    regions.append(row)


# Dokumenterte underområder som gjør mellomnivået mindre grovt.
regions = [
    {
        'id': 'hallingmal', 'macro_region_id': 'austlandsk', 'parent_region_id': 'midlandsmal', 'name': 'Hallingmål',
        'area_summary': 'Hallingdal. Et midlandsmål med tydelig intern og historisk variasjon.',
        'feature_labels': ['midlandsmål', 'kløyvd infinitiv', 'lokal dalvariasjon'],
        'sources': [src('SNL – dialekter i Hallingdal', 'https://snl.no/dialekter_i_Hallingdal'), NDC_LIST]
    },
    {
        'id': 'valdresmal', 'macro_region_id': 'austlandsk', 'parent_region_id': 'midlandsmal', 'name': 'Valdresmål',
        'area_summary': 'Valdres. Hører til det midlandske målområdet og har flere fellestrekk med Hallingdal, men er ikke samme talemål.',
        'feature_labels': ['midlandsmål', 'lokal dalvariasjon'],
        'sources': [src('SNL – dialekter i Valdres', 'https://snl.no/dialekter_i_Valdres')]
    },
    {
        'id': 'gudbrandsdalsmal', 'macro_region_id': 'austlandsk', 'parent_region_id': 'midlandsmal', 'name': 'Gudbrandsdalsmål',
        'area_summary': 'Gudbrandsdalen. Et langt dalføre med lokale forskjeller mellom sør-, midt- og norddalen.',
        'feature_labels': ['jamvekt', 'kløyvd infinitiv', 'lokal dalvariasjon'],
        'sources': [src('SNL – dialekter i Gudbrandsdalen', 'https://snl.no/dialekter_i_Gudbrandsdalen'), NDC_LIST]
    },
    {
        'id': 'osterdalsmal', 'macro_region_id': 'austlandsk', 'parent_region_id': 'opplandsmal', 'name': 'Østerdalsmål',
        'area_summary': 'Østerdalen fra Elverum nordover, med Rendalen, Engerdal og Trysil; området har markert intern variasjon og kontakt mot trøndersk og svensk.',
        'feature_labels': ['jamvekt', 'regional variasjon', 'grensekontakt'],
        'sources': [src('SNL – dialekter i Østerdalen', 'https://snl.no/dialekter_i_%C3%98sterdalen'), NDC_LIST]
    },
    {
        'id': 'setesdalsmal', 'macro_region_id': 'vestlandsk', 'parent_region_id': 'sorleg_e_mal', 'name': 'Setesdalsmål',
        'area_summary': 'Indre Setesdal. Et særpreget sørleg e-mål med sterk lokal kontinuitet og tydelig forskjell fra ytre Agder.',
        'feature_labels': ['e-infinitiv', 'eldre bøyningstrekk', 'lokal dalvariasjon'],
        'sources': [src('SNL – dialekter i Setesdal', 'https://snl.no/dialekter_i_Setesdal'), NDC_LIST]
    },
    {
        'id': 'jaermal', 'macro_region_id': 'vestlandsk', 'parent_region_id': 'sorvestlandsk_a_mal', 'name': 'Jærmål',
        'area_summary': 'Jæren. Rogalandsk a-målsområde som må skilles fra Ryfylke og Stavanger bymål.',
        'feature_labels': ['a-mål', 'jærsk regional variasjon'],
        'sources': [src('SNL – dialekter i Rogaland', 'https://snl.no/dialekter_i_Rogaland'), NDC_LIST]
    },
    {
        'id': 'ryfylkemal', 'macro_region_id': 'vestlandsk', 'parent_region_id': 'sorvestlandsk_a_mal', 'name': 'Ryfylkemål',
        'area_summary': 'Ryfylke. Fjord- og innlandsmål med interne forskjeller, blant annet en tydelig særstilling for Suldal.',
        'feature_labels': ['a-mål', 'fjord–innlandsvariasjon'],
        'sources': [src('SNL – dialekter i Rogaland', 'https://snl.no/dialekter_i_Rogaland'), NDC_LIST]
    },
    {
        'id': 'hardangermal', 'macro_region_id': 'vestlandsk', 'parent_region_id': 'sorvestlandsk_a_mal', 'name': 'Hardangermål',
        'area_summary': 'Hardanger. Et vestlandsk a-målsområde som ikke skal slås sammen med Bergen eller hele Hordaland.',
        'feature_labels': ['a-mål', 'indre vestlandsmål'],
        'sources': [src('SNL – dialekter i Hordaland', 'https://snl.no/dialekter_i_Hordaland'), src('SNL – a-mål', 'https://snl.no/a-m%C3%A5l')]
    },
    {
        'id': 'sognamal', 'macro_region_id': 'vestlandsk', 'name': 'Sognamål',
        'area_summary': 'Sogn har stor forskjell mellom indre og ytre områder og ligger ved møtet mellom vestlandske a- og e-mål.',
        'feature_labels': ['indre–ytre variasjon', 'a-/e-målsgrense'],
        'sources': [src('SNL – dialekter i Sogn og Fjordane', 'https://snl.no/dialekter_i_Sogn_og_Fjordane'), NDC_LIST]
    },
    {
        'id': 'sunnmorsmal', 'macro_region_id': 'vestlandsk', 'parent_region_id': 'nordvestlandsk_e_mal', 'name': 'Sunnmørsmål',
        'area_summary': 'Sunnmøre. Nordvestlandsk e-mål med lokal kyst- og fjordvariasjon.',
        'feature_labels': ['e-mål', 'nordvestlandsk', 'lokal variasjon'],
        'sources': [src('SNL – dialekter i Møre og Romsdal', 'https://snl.no/dialekter_i_M%C3%B8re_og_Romsdal'), NDC_LIST]
    },
    {
        'id': 'romsdalsmal', 'macro_region_id': 'vestlandsk', 'parent_region_id': 'nordvestlandsk_e_mal', 'name': 'Romsdalsmål',
        'area_summary': 'Romsdal. Nordvestlandsk e-mål med enkelte østnorske innslag; skal skilles fra både Sunnmøre og Nordmøre.',
        'feature_labels': ['e-mål', 'nordvestlandsk', 'kontaktstrekk'],
        'sources': [src('SNL – dialekter i Romsdal', 'https://snl.no/dialekter_i_Romsdal'), NDC_LIST]
    },
    {
        'id': 'fosenmal', 'macro_region_id': 'trondersk', 'parent_region_id': 'uttrondersk', 'name': 'Fosenmål',
        'area_summary': 'Ytre trøndermål på Fosen. Tiljamning er viktigere som skille mot de indre målene enn én enkelt «trøndersk» profil.',
        'feature_labels': ['uttrøndersk', 'tiljamning'],
        'sources': [src('SNL – dialekter i Sør-Trøndelag', 'https://snl.no/dialekter_i_S%C3%B8r-Tr%C3%B8ndelag'), NDC_LIST]
    },
    {
        'id': 'nordmorsmal', 'macro_region_id': 'trondersk', 'parent_region_id': 'uttrondersk', 'name': 'Nordmørsmål',
        'area_summary': 'Nordmøre. Språklig trøndersk område nord i Møre og Romsdal, tydelig skilt fra Romsdal.',
        'feature_labels': ['trøndersk', 'jamvekt', 'uttrøndersk overgang'],
        'sources': [src('SNL – dialekter på Nordmøre', 'https://snl.no/Dialekter_p%C3%A5_Nordm%C3%B8re'), NDC_LIST]
    },
    {
        'id': 'indre_namdalsmal', 'macro_region_id': 'trondersk', 'parent_region_id': 'inntrondersk', 'name': 'Indre namdalsmål',
        'area_summary': 'Indre Namdalen som nordlig grein av inntrøndersk, med egne jamningsmønstre.',
        'feature_labels': ['inntrøndersk', 'jamning'],
        'sources': [src('SNL – dialektgrenser', 'https://snl.no/dialektgrenser'), src('SNL – dialekter i Nord-Trøndelag', 'https://snl.no/dialekter_i_Nord-Tr%C3%B8ndelag')]
    },
    {
        'id': 'ytre_namdalsmal', 'macro_region_id': 'trondersk', 'parent_region_id': 'uttrondersk', 'name': 'Ytre namdalsmål',
        'area_summary': 'Ytre Namdalen hører til de ytre trøndermålene og har intern nord–sør-variasjon.',
        'feature_labels': ['uttrøndersk', 'tiljamning', 'lokal variasjon'],
        'sources': [src('SNL – dialektgrenser', 'https://snl.no/dialektgrenser'), src('SNL – dialekter i Nord-Trøndelag', 'https://snl.no/dialekter_i_Nord-Tr%C3%B8ndelag')]
    },
]

# UiTs eksplisitte dialektgrupper for Nord-Norge. De er regionale grupper, ikke påstander om at alle innenfor området snakker likt.
north_groups = [
    ('austfinnmarksmal', 'Austfinnmarksmål', 'Østlige Finnmark, blant annet Sør-Varanger og Vardø.'),
    ('indre_finnmarksmal', 'Indre finnmarksmål', 'Indre Finnmark, blant annet Kautokeino, Lakselv og Tana.'),
    ('vestfinnmarksmal', 'Vestfinnmarksmål', 'Vestlige Finnmark, blant annet Hammerfest og Kjøllefjord.'),
    ('nordtromsmal', 'Nordtromsmål', 'Nord-Troms, blant annet Kvænangen, Manndalen, Nordreisa og Vannøya.'),
    ('midttromsmal', 'Midttromsmål', 'Midt-Troms, blant annet Botnhamn, Mefjordvær og Tromsø.'),
    ('senjamal', 'Senjamål', 'Senja-området med flere dokumenterte lokale målepunkter og egen ordsamling.'),
    ('indre_tromsmal', 'Indre tromsmål', 'Indre Troms, med dokumentert målepunkt i Kirkesdalen/Målselv.'),
    ('sor_troms_vesteralen_ofoten', 'Sør-Troms, Vesterålen og Ofoten', 'Regional gruppe med blant annet Kvæfjord, Myre, Narvik og Ballangen.'),
    ('lofotmal', 'Lofotmål', 'Lofoten, blant annet Borge og Stamsund.'),
    ('saltenmal', 'Saltenmål', 'Salten, blant annet Beiarn, Bodø og Steigen; Bodø bymål har samtidig egen lokal profil.'),
    ('ranamal', 'Ranamål', 'Rana-området, blant annet Mo i Rana og Selfors.'),
    ('vefsnmal', 'Vefsnmål', 'Vefsn/Helgeland, blant annet Hattfjelldal, Herøy og Alstahaug.'),
    ('bronnoymal', 'Brønnøymål', 'Sør-Helgeland, blant annet Brønnøysund og Sømna.')
]
for region_id, name, area in north_groups:
    regions.append({
        'id': region_id,
        'macro_region_id': 'nordnorsk',
        'name': name,
        'area_summary': area,
        'feature_labels': ['UiT-dokumentert regionalgruppe', 'lokal variasjon'],
        'sources': [UIT_NORTH]
    })

for row in regions:
    upsert_region(row)


def local(row_id, name, macro, summary, variation, sources, region_id=None, status='local_research_required', features=None):
    row = {
        'id': row_id,
        'name': name,
        'kind': 'local_speech',
        'macro_region_id': macro,
        'profile_status': status,
        'summary': summary,
        'variation_note': variation,
        'sources': sources
    }
    if region_id:
        row['region_id'] = region_id
    if features:
        row['feature_labels'] = features
    return row


locals_out = [
    # Austlandsk
    local('oslo_local_speech', 'Oslo', 'austlandsk', 'Oslo er et eget bytalemålsområde med omfattende dokumentasjon av sosial og geografisk variasjon.', 'NoTa og TAUS viser at Oslo ikke kan reduseres til én øst-/vestprofil eller ett «oslomål».', [src('UiO Tekstlab – NoTa/TAUS', 'https://tekstlab.uio.no/nota/'), src('UiO – TAUS brukerveiledning', 'https://tekstlab.uio.no/brukerveiledninger/taus/')], 'midtostlandsk', 'documented_seed'),
    local('fredrikstad_local_speech', 'Fredrikstad', 'austlandsk', 'Fredrikstad er et eget NorDiaSyn-målepunkt i det vikværske Østfold-området.', 'Konkrete lokale trekk skal hentes fra målepunktet og lokale kilder, ikke kopieres fra hele Østfold.', [NDC_LIST, src('SNL – dialekter i Østfold', 'https://snl.no/dialekter_i_%C3%98stfold')], 'vikvaersk'),
    local('aremark_local_speech', 'Aremark', 'austlandsk', 'Aremark er et eget NorDiaSyn-målepunkt i Østfold.', 'Profilen er et corpus-anker; konkrete trekk må dokumenteres lokalt før de vises som Aremark-kjennetegn.', [NDC_LIST, src('SNL – dialekter i Østfold', 'https://snl.no/dialekter_i_%C3%98stfold')], 'vikvaersk'),
    local('enebakk_local_speech', 'Enebakk', 'austlandsk', 'Enebakk er et eget NorDiaSyn-målepunkt i det midtøstlandske Akershus-området.', 'Akershus har sterk dialektendring og Oslo-påvirkning; profilen må derfor romme generasjons- og tettstedsforskjeller.', [NDC_LIST, src('SNL – dialekter i Akershus', 'https://snl.no/dialekter_i_Akershus')], 'midtostlandsk'),
    local('aal_local_speech', 'Ål', 'austlandsk', 'Ål er et dokumentert NorDiaSyn-målepunkt i Hallingdal.', 'Hallingdal har lokale forskjeller; Ål skal ikke gjøres til representant for hele dalen.', [NDC_LIST, src('SNL – dialekter i Hallingdal', 'https://snl.no/dialekter_i_Hallingdal')], 'hallingmal', 'documented_seed'),
    local('vang_valdres_local_speech', 'Vang i Valdres', 'austlandsk', 'Vang er et dokumentert NorDiaSyn-målepunkt i Valdres.', 'Valdresmål har fellestrekk med Hallingdal, men Vang-profilen må bygge på lokale data.', [NDC_LIST, src('SNL – dialekter i Valdres', 'https://snl.no/dialekter_i_Valdres')], 'valdresmal', 'documented_seed'),
    local('lom_local_speech', 'Lom', 'austlandsk', 'Lom er et NorDiaSyn-målepunkt i Gudbrandsdalen.', 'Gudbrandsdalen er lang og internt variert; Lom skal ikke arve alle trekk fra hele dalføret.', [NDC_LIST, src('SNL – dialekter i Gudbrandsdalen', 'https://snl.no/dialekter_i_Gudbrandsdalen')], 'gudbrandsdalsmal', 'documented_seed'),
    local('lillehammer_local_speech', 'Lillehammer', 'austlandsk', 'Lillehammer skal ha egen lokal talemålsprofil i overgangslandskapet mellom by/tettsted og opplandske dialekter.', 'Konkrete trekk holdes tilbake til lokalt korpus- eller forskningsbelegg er knyttet til profilen.', [LIA, src('SNL – dialekter i Oppland', 'https://snl.no/dialekter_i_Oppland')], 'opplandsmal'),
    local('trysil_local_speech', 'Trysil', 'austlandsk', 'Trysil er dokumentert både som NorDiaSyn-målepunkt og som del av Østerdalsmålene.', 'Østerdalen er internt variert og har kontakt mot svenske mål; lokale trekk må merkes med kilde og tidslag.', [NDC_LIST, src('SNL – dialekter i Østerdalen', 'https://snl.no/dialekter_i_%C3%98sterdalen')], 'osterdalsmal', 'documented_seed'),
    local('vinje_local_speech', 'Vinje', 'austlandsk', 'Vinje er et eget NorDiaSyn-målepunkt i Telemark.', 'Vest-Telemark har sterke lokale særtrekk; profilen skal ikke generaliseres til hele Telemark.', [NDC_LIST, src('SNL – dialekter i Telemark', 'https://snl.no/dialekter_i_Telemark')], 'midlandsmal'),
    local('tinn_local_speech', 'Tinn', 'austlandsk', 'Tinn er et eget NorDiaSyn-målepunkt i Telemark.', 'Profilen er et corpus-anker; konkrete trekk publiseres etter lokal analyse.', [NDC_LIST, src('SNL – dialekter i Telemark', 'https://snl.no/dialekter_i_Telemark')], 'midlandsmal'),

    # Vestlandsk
    local('valle_setesdal_local_speech', 'Valle i Setesdal', 'vestlandsk', 'Valle er kjernen i den klassiske Setesdalsdialekten og et NorDiaSyn-målepunkt.', 'Artikkelkilden beskriver først og fremst tradisjonelt talemål; yngre og mer normaliserte talemålsformer må skilles fra dette tidslaget.', [src('SNL – dialekter i Setesdal', 'https://snl.no/dialekter_i_Setesdal'), NDC_LIST], 'setesdalsmal', 'documented_seed', ['e-infinitiv', 'tradisjonell dativ', 'eldre bøyningstrekk']),
    local('arendal_local_speech', 'Arendal', 'vestlandsk', 'Arendal skal ha en egen lokal profil innen sørlandske e-mål.', 'Arendal skal ikke slås sammen med Kristiansand; konkrete lokale målmerker krever egen dokumentasjon.', [LIA, src('SNL – dialekter på Agder', 'https://snl.no/dialekter_p%C3%A5_Agder')], 'sorleg_e_mal'),
    local('kristiansand_local_speech', 'Kristiansand', 'vestlandsk', 'Kristiansand er eksplisitt representert i LIA norsk og skal ha egen by-/lokalprofil.', 'Korpusmateriale og regional beskrivelse må brukes før konkrete trekk gjøres til kjennetegn for hele byen.', [LIA, src('UiO – LIA norsk brukerveiledning', 'https://tekstlab.uio.no/brukerveiledninger/LIA%20norsk/index.html')], 'sorleg_e_mal', 'documented_seed'),
    local('stavanger_local_speech', 'Stavanger', 'vestlandsk', 'Stavanger har et dokumentert eget bymål og er også representert i talemålskorpus.', 'Bymålet har historisk flere sosiale varianter og skal ikke reduseres til «rogalandsk».', [src('SNL – Stavanger bymål', 'https://snl.no/Stavanger_bym%C3%A5l'), NDC_LIST], 'sorvestlandsk_a_mal', 'documented_seed'),
    local('time_jaeren_local_speech', 'Time/Jæren', 'vestlandsk', 'Time er et NorDiaSyn-målepunkt på Jæren.', 'Jærmål må skilles fra Stavanger og Ryfylke; lokale trekk skal bindes til målepunkt eller lokal fagkilde.', [NDC_LIST, src('SNL – dialekter i Rogaland', 'https://snl.no/dialekter_i_Rogaland')], 'jaermal'),
    local('suldal_local_speech', 'Suldal', 'vestlandsk', 'Suldal har en dokumentert særstilling innen Ryfylke og er eget NorDiaSyn-målepunkt.', 'Suldal skal ikke arve en generell Ryfylke-profil når kildene beskriver lokale avvik.', [src('SNL – dialekter i Rogaland', 'https://snl.no/dialekter_i_Rogaland'), NDC_LIST], 'ryfylkemal', 'documented_seed'),
    local('voss_local_speech', 'Voss', 'vestlandsk', 'Voss er et NorDiaSyn-målepunkt i det sørvestlandske a-målsområdet.', 'Konkrete Voss-trekk skal dokumenteres lokalt og ikke kopieres fra Hardanger eller Hordaland generelt.', [NDC_LIST, src('SNL – a-mål', 'https://snl.no/a-m%C3%A5l'), src('SNL – dialekter i Hordaland', 'https://snl.no/dialekter_i_Hordaland')], 'sorvestlandsk_a_mal'),
    local('bergen_local_speech', 'Bergen', 'vestlandsk', 'Bergen har et eget, historisk godt dokumentert bymål som skiller seg tydelig fra bygdemålene rundt.', 'Bergen har intern sosial og historisk variasjon; én profil skal ikke beskrive alle bergensere.', [src('SNL – Bergen bymål', 'https://snl.no/Bergen_bym%C3%A5l'), src('UiB – Målføresamlinga', 'https://www.uib.no/lle/51977/m%C3%A5lf%C3%B8resamlinga')], status='documented_seed'),
    local('luster_local_speech', 'Luster', 'vestlandsk', 'Luster er et NorDiaSyn-målepunkt i Sogn.', 'Sogn har sterke indre–ytre forskjeller; Luster-profilen skal utvikles fra lokale data.', [NDC_LIST, src('SNL – dialekter i Sogn og Fjordane', 'https://snl.no/dialekter_i_Sogn_og_Fjordane')], 'sognamal'),
    local('joelster_local_speech', 'Jølster', 'vestlandsk', 'Jølster er et NorDiaSyn-målepunkt i det tidligere Sogn og Fjordane.', 'Profilen er et corpus-anker; konkrete målmerker krever lokal dokumentasjon.', [NDC_LIST, src('SNL – dialekter i Sogn og Fjordane', 'https://snl.no/dialekter_i_Sogn_og_Fjordane')], 'nordvestlandsk_e_mal'),
    local('volda_local_speech', 'Volda', 'vestlandsk', 'Volda er et NorDiaSyn-målepunkt på Sunnmøre.', 'Sunnmøre har lokal variasjon; Volda skal være en egen profil, ikke en kopi av hele Sunnmøre.', [NDC_LIST, src('SNL – dialekter i Møre og Romsdal', 'https://snl.no/dialekter_i_M%C3%B8re_og_Romsdal')], 'sunnmorsmal'),
    local('aandalsnes_local_speech', 'Åndalsnes/Rauma', 'vestlandsk', 'Rauma/Åndalsnes er et NorDiaSyn-målepunkt i Romsdal.', 'Romsdalsmål skiller seg fra både Sunnmøre og Nordmøre; lokale trekk må kildebindes.', [NDC_LIST, src('SNL – dialekter i Romsdal', 'https://snl.no/dialekter_i_Romsdal')], 'romsdalsmal', 'documented_seed'),
    local('haugesund_local_speech', 'Haugesund', 'vestlandsk', 'Haugesund skal ha egen lokal talemålsprofil i det nordlige Rogaland/Haugalandet.', 'Konkrete språkdrag holdes tilbake til lokal dokumentasjon er koblet direkte til profilen.', [src('SNL – dialekter i Rogaland', 'https://snl.no/dialekter_i_Rogaland'), src('UiB – Målføresamlinga', 'https://www.uib.no/lle/51977/m%C3%A5lf%C3%B8resamlinga')]),

    # Trøndersk
    local('trondheim_local_speech', 'Trondheim', 'trondersk', 'Trondheim har et dokumentert eget bymål med trøndersk grunnlag og historisk sosial variasjon.', 'Tradisjonell «brei» og mer normalisert tale er historiske/sosiale lag, ikke faste kategorier for alle innbyggere.', [src('SNL – Trondheim bymål', 'https://snl.no/Trondheim_bym%C3%A5l'), NDC_LIST], 'uttrondersk', 'documented_seed'),
    local('oppdal_local_speech', 'Oppdal', 'trondersk', 'Oppdal er et dokumentert NorDiaSyn/NORMS-målepunkt ved den sørlige kanten av inntrøndersk.', 'Lokale trekk skal ikke uten videre generaliseres til Røros, Trondheim eller Fosen.', [NDC_LIST, src('SNL – dialekter i Sør-Trøndelag', 'https://snl.no/dialekter_i_S%C3%B8r-Tr%C3%B8ndelag')], 'inntrondersk'),
    local('roeros_local_speech', 'Røros', 'trondersk', 'Røros er et eget NorDiaSyn-målepunkt i inntrøndersk område.', 'Røros har kontaktflater mot østlandske og svenske mål; konkrete trekk må knyttes til lokal kilde.', [NDC_LIST, src('SNL – dialekter i Sør-Trøndelag', 'https://snl.no/dialekter_i_S%C3%B8r-Tr%C3%B8ndelag')], 'inntrondersk'),
    local('selbu_local_speech', 'Selbu', 'trondersk', 'Selbu er et eget NorDiaSyn-målepunkt i Trøndelag.', 'Profilen er et corpus-anker; målmerker publiseres først etter lokal analyse.', [NDC_LIST, src('SNL – dialekter i Sør-Trøndelag', 'https://snl.no/dialekter_i_S%C3%B8r-Tr%C3%B8ndelag')], 'inntrondersk'),
    local('inderoey_local_speech', 'Inderøy', 'trondersk', 'Inderøy er et eget NorDiaSyn-målepunkt i tidligere Nord-Trøndelag.', 'Profilen skal skille lokalt talemål fra både Trondheim og Namdalen.', [NDC_LIST, src('SNL – dialekter i Nord-Trøndelag', 'https://snl.no/dialekter_i_Nord-Tr%C3%B8ndelag')], 'inntrondersk'),
    local('namdalen_local_speech', 'Namdalen', 'trondersk', 'Namdalen er dokumentert som NorDiaSyn-målepunkt og har et viktig skille mellom indre og ytre talemål.', 'Namdalen skal ikke presenteres som én homogen dialekt; atlaset har derfor egne regionale underlag for indre og ytre Namdal.', [NDC_LIST, src('SNL – dialekter i Nord-Trøndelag', 'https://snl.no/dialekter_i_Nord-Tr%C3%B8ndelag')]),
    local('bjugn_fosen_local_speech', 'Bjugn/Fosen', 'trondersk', 'Bjugn er et NORMS-målepunkt i Fosen-området.', 'Fosenprofilen representerer et lokalt anker i uttrøndersk, ikke alle ytre trøndermål.', [NDC_LIST, src('SNL – dialekter i Sør-Trøndelag', 'https://snl.no/dialekter_i_S%C3%B8r-Tr%C3%B8ndelag')], 'fosenmal'),
    local('surnadal_local_speech', 'Surnadal', 'trondersk', 'Surnadal er et dokumentert målepunkt på Nordmøre, et område som dialektologisk regnes til trøndersk.', 'Nordmøre skal ikke slås sammen med Romsdal selv om begge ligger i samme fylke.', [NDC_LIST, src('SNL – dialekter på Nordmøre', 'https://snl.no/Dialekter_p%C3%A5_Nordm%C3%B8re')], 'nordmorsmal', 'documented_seed'),

    # Nordnorsk
    local('bodo_local_speech', 'Bodø', 'nordnorsk', 'Bodø har et dokumentert bymål som skiller seg fra omkringliggende Saltenmål på flere punkter.', 'Bodø må behandles som egen byprofil, samtidig som yngre og eldre talemål kan variere.', [src('UiT – Bodø', 'https://nordnorsk.uit.no/dialekt/bodo/'), NDC_LIST], 'saltenmal', 'documented_seed'),
    local('narvik_local_speech', 'Narvik', 'nordnorsk', 'Narvik har et dokumentert bymål som skiller seg tydelig fra flere omkringliggende Ofoten-mål.', 'Lokale generasjonsforskjeller må beholdes; profilen skal ikke representere hele Ofoten.', [src('UiT – Narvik', 'https://nordnorsk.uit.no/dialekt/narvik/'), NDC_LIST], 'sor_troms_vesteralen_ofoten', 'documented_seed'),
    local('tromso_local_speech', 'Tromsø', 'nordnorsk', 'Tromsø har et dokumentert bymål og er samtidig et sterkt dialektmøte- og språkkontaktmiljø.', 'Tradisjonelt bymål, nyere talemål og andre norske dialekter i byen må kunne eksistere side om side.', [src('UiT – Tromsø', 'https://nordnorsk.uit.no/dialekt/tromso/'), src('SNL – Tromsø bymål', 'https://snl.no/Troms%C3%B8_bym%C3%A5l')], 'midttromsmal', 'documented_seed'),
    local('hammerfest_local_speech', 'Hammerfest', 'nordnorsk', 'Hammerfest er et UiT/ScanDiaSyn-dokumentert lokalt talemål i Vestfinnmark.', 'Kildene viser generasjonsvariasjon; profilen skal ikke gjøre eldre målmerker obligatoriske for yngre talere.', [src('UiT – Hammerfest', 'https://nordnorsk.uit.no/dialekt/hammerfest/'), NDC_LIST], 'vestfinnmarksmal', 'documented_seed'),
    local('kautokeino_norwegian_local_speech', 'Kautokeino – norsk talemål', 'nordnorsk', 'Kautokeino er et dokumentert målepunkt for norsk talemål i et sterkt flerspråklig område.', 'Denne profilen gjelder norsk talemål. Nordsamisk er et eget språk og skal aldri behandles som norsk dialekt.', [NDC_LIST, UIT_NORTH], 'indre_finnmarksmal'),
    local('kirkenes_norwegian_local_speech', 'Kirkenes/Sør-Varanger – norsk talemål', 'nordnorsk', 'Sør-Varanger/Kirkenes er dokumentert i UiTs austfinnmarksgruppe og i dialektkorpuset.', 'Profilen gjelder norsk talemål i et historisk flerspråklig område; samisk og kvensk/finsk hører hjemme i egne språklag.', [NDC_LIST, UIT_NORTH], 'austfinnmarksmal'),
    local('tana_norwegian_local_speech', 'Tana – norsk talemål', 'nordnorsk', 'Tana er et dokumentert målepunkt i UiTs indre finnmarksgruppe.', 'Profilen gjelder norsk talemål; samiske språk er egne språk og modelleres separat.', [NDC_LIST, UIT_NORTH], 'indre_finnmarksmal'),
    local('kvaenangen_norwegian_local_speech', 'Kvænangen – norsk talemål', 'nordnorsk', 'Kvænangen er et dokumentert NorDiaSyn-målepunkt i Nord-Troms.', 'Området har langvarig norsk, samisk og kvensk språkkontakt; profilen må ikke gjøre kontaktbakgrunn til ett ensartet talemål.', [NDC_LIST, UIT_NORTH], 'nordtromsmal'),
    local('senja_local_speech', 'Senja', 'nordnorsk', 'Senja har en egen UiT-dialektgruppe med flere lokale målepunkter og en egen ordsamling.', 'Senjamål er selv internt variert; Mefjordvær, Botnhamn, Medby og Stonglandseidet skal kunne skilles videre.', [src('UiT – Senja', 'https://nordnorsk.uit.no/dialekt/senja/'), src('UiT – dialektord fra Senja', 'https://nordnorsk.uit.no/ordlister/dialektord-fra-senja/')], 'senjamal', 'documented_seed'),
    local('kvaefjord_local_speech', 'Kvæfjord', 'nordnorsk', 'Kvæfjord er et dokumentert målepunkt i gruppen Sør-Troms, Vesterålen og Ofoten.', 'Profilen er lokalt anker; konkrete trekk må hentes fra målprøvene og ikke generaliseres til hele regionen.', [NDC_LIST, UIT_NORTH], 'sor_troms_vesteralen_ofoten'),
    local('stamsund_local_speech', 'Stamsund/Lofoten', 'nordnorsk', 'Stamsund er et dokumentert målepunkt i Lofotmål-gruppen.', 'Lofoten har lokal variasjon; Stamsund skal være et målepunkt, ikke en fasit for alle øyene.', [NDC_LIST, UIT_NORTH], 'lofotmal'),
    local('mo_i_rana_local_speech', 'Mo i Rana', 'nordnorsk', 'Mo i Rana er et dokumentert målepunkt i Rana-området.', 'By- og industristedspåvirkning må kunne skilles fra eldre regionalt talemål.', [NDC_LIST, UIT_NORTH], 'ranamal'),
    local('hattfjelldal_local_speech', 'Hattfjelldal', 'nordnorsk', 'Hattfjelldal er et dokumentert målepunkt i UiTs Vefsnmål-gruppe.', 'Området ligger også i et sørsamisk språkområde; sørsamisk skal behandles som eget språk.', [NDC_LIST, UIT_NORTH], 'vefsnmal'),
    local('soemna_local_speech', 'Sømna', 'nordnorsk', 'Sømna er et dokumentert målepunkt i Brønnøymål-gruppen sør på Helgeland.', 'Sør-Helgeland ligger nær den trønderske dialektgrensen; lokale trekk må kildebindes og ikke gjøres absolutte.', [NDC_LIST, UIT_NORTH], 'bronnoymal')
]

atlas['local_varieties'] = locals_out
atlas['verified_at'] = '2026-08-18'
ATLAS_PATH.write_text(json.dumps(atlas, ensure_ascii=False, indent=2) + '\n')

schema = json.loads(SCHEMA_PATH.read_text())
required = schema.setdefault('required', [])
if 'research_basis' not in required:
    required.append('research_basis')
props = schema.setdefault('properties', {})
props['dialect_regions']['minItems'] = 25
props['local_varieties']['minItems'] = 40
props['local_varieties']['items']['properties']['sources'] = {'type': 'array', 'minItems': 1}
props['research_basis'] = {
    'type': 'object',
    'required': ['verified_at', 'methodology', 'source_coverage', 'baseline_sources'],
    'properties': {
        'verified_at': {'type': 'string', 'pattern': '^\\d{4}-\\d{2}-\\d{2}$'},
        'methodology': {'type': 'array', 'minItems': 4},
        'source_coverage': {'type': 'array', 'minItems': 4},
        'baseline_sources': {'type': 'array', 'minItems': 5}
    },
    'additionalProperties': True
}
SCHEMA_PATH.write_text(json.dumps(schema, ensure_ascii=False, indent=2) + '\n')

docs = DOCS_PATH.read_text()
marker = '## Forskningsgrunnlag for Språkatlas Norge'
section = '''\n\n## Forskningsgrunnlag for Språkatlas Norge\n\nSpråkatlaset skal ikke bygges fra eksempellister eller antatte «kjente dialekter». Før en regional eller lokal profil materialiseres skal den ha et eksplisitt dokumentasjonsgrunnlag. Første nasjonale research-pass bruker særlig Nordisk dialektkorpus/NorDiaSyn, LIA norsk, UiTs Nordnorske dialekter og fagartiklene om dialektinndeling i Store norske leksikon.\n\n- Nordisk dialektkorpus v4.0 dokumenterer 111 utvalgte norske målepunkter.\n- LIA norsk inneholder historiske dialektopptak fra 1382 informanter på 227 steder/kommuner.\n- UiTs Nordnorske dialekter gir et finmasket nordnorsk mellomnivå med 13 navngitte dialektgrupper, lokale målmerker og målprøver.\n- Lokale corpus-ankre kan registreres før alle målmerker er ferdig analysert, men skal da ikke få oppdiktede eller arvede lokale kjennetegn.\n- Konkrete lokale målmerker krever lokal eller klart relevant regional kilde.\n- Bymål og flerspråklige steder skal alltid modelleres med intern variasjon; språk som nordsamisk, sørsamisk og kvensk er egne språk og aldri «norske dialekter».\n'''
if marker not in docs:
    docs = docs.rstrip() + section + '\n'
DOCS_PATH.write_text(docs)

test_src = TEST_PATH.read_text()
marker_test = 'test("Språkatlas research coverage er nasjonal og kildebåret"'
if marker_test not in test_src:
    test_src += r'''\n\ntest("Språkatlas research coverage er nasjonal og kildebåret", () => {\n  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");\n  assert.ok(atlas.research_basis, "atlaset må dokumentere research-grunnlaget");\n  assert.ok((atlas.research_basis.methodology || []).length >= 4);\n  const coverage = (atlas.research_basis.source_coverage || []).map(row => `${row.id} ${row.coverage}`).join(" ");\n  assert.match(coverage, /ndc_v4[\\s\\S]*111/i, "Nordisk dialektkorpus-dekningen må være eksplisitt");\n  assert.match(coverage, /lia_norsk[\\s\\S]*227/i, "LIA-dekningen må være eksplisitt");\n  assert.match(coverage, /uit_nordnorsk[\\s\\S]*13/i, "UiTs nordnorske mellomnivå må være eksplisitt");\n\n  const regions = new Set((atlas.dialect_regions || []).map(row => text(row.id)));\n  for (const id of [\n    "hallingmal", "valdresmal", "gudbrandsdalsmal", "osterdalsmal",\n    "setesdalsmal", "jaermal", "ryfylkemal", "sunnmorsmal", "romsdalsmal",\n    "fosenmal", "nordmorsmal", "indre_namdalsmal", "ytre_namdalsmal",\n    "austfinnmarksmal", "indre_finnmarksmal", "vestfinnmarksmal", "nordtromsmal",\n    "midttromsmal", "senjamal", "indre_tromsmal", "sor_troms_vesteralen_ofoten",\n    "lofotmal", "saltenmal", "ranamal", "vefsnmal", "bronnoymal"\n  ]) assert.ok(regions.has(id), `mangler forskningsbasert mellomnivå ${id}`);\n\n  const locals = atlas.local_varieties || [];\n  assert.ok(locals.length >= 40, `for få lokale research-ankre: ${locals.length}`);\n  const perMacro = new Map();\n  for (const row of locals) {\n    perMacro.set(row.macro_region_id, (perMacro.get(row.macro_region_id) || 0) + 1);\n    assert.ok(Array.isArray(row.sources) && row.sources.length >= 1, `${row.id}: lokal profil mangler kilde`);\n    for (const source of row.sources) assert.match(String(source?.url || ""), /^https:\\/\\//, `${row.id}: kilden må være HTTPS`);\n    assert.ok(text(row.variation_note), `${row.id}: variasjonsavgrensning mangler`);\n  }\n  for (const macro of ["austlandsk", "vestlandsk", "trondersk", "nordnorsk"]) {\n    assert.ok((perMacro.get(macro) || 0) >= 8, `${macro}: utilstrekkelig lokal research-dekning`);\n  }\n\n  const localIds = new Set(locals.map(row => text(row.id)));\n  for (const id of [\n    "aal_local_speech", "vang_valdres_local_speech", "lom_local_speech", "trysil_local_speech",\n    "valle_setesdal_local_speech", "suldal_local_speech", "voss_local_speech", "aandalsnes_local_speech",\n    "trondheim_local_speech", "surnadal_local_speech", "bodo_local_speech", "narvik_local_speech",\n    "tromso_local_speech", "hammerfest_local_speech", "senja_local_speech", "soemna_local_speech"\n  ]) assert.ok(localIds.has(id), `mangler lokalt research-anker ${id}`);\n\n  for (const id of ["kautokeino_norwegian_local_speech", "kirkenes_norwegian_local_speech", "tana_norwegian_local_speech", "hattfjelldal_local_speech"]) {\n    const row = locals.find(item => item.id === id);\n    assert.ok(row, `${id}: flerspråklig profil mangler`);\n    assert.match(`${row.summary} ${row.variation_note}`, /eget språk|egne språk|språklig område|språkområde/i, `${id}: minoritetsspråk må skilles eksplisitt fra norsk dialekt`);\n  }\n});\n'''.replace('\\n', '\n')
TEST_PATH.write_text(test_src)
