from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path('.')
MASTER_PATH = ROOT / 'data/brands/brands_master.json'
BY_PLACE_PATH = ROOT / 'data/brands/brands_by_place.json'
AUDIT_PATH = ROOT / 'reports/place-production/torggata-phase8c-brands-audit-v1.json'
TEST_PATH = ROOT / 'tests/torggata-phase8c-brands.test.mjs'
WORKCARD_PATH = ROOT / 'reports/place-production/torggata-workcard-current.md'

VERIFIED_AT = '2026-08-11'


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


master = read_json(MASTER_PATH)
by_place = read_json(BY_PLACE_PATH)
if not isinstance(master, list) or not isinstance(by_place, dict):
    raise SystemExit('Unexpected brand data shape')

previous_mapping = list(by_place.get('torggata', []))
expected_previous = [
    'angst', 'arakataka', 'big_dipper', 'eldorado_bokhandel',
    'john_dee', 'justisen', 'the_villa', 'tilt'
]
if previous_mapping != expected_previous:
    raise SystemExit(f'Torggata brand baseline changed: {previous_mapping!r}')

records = [
    {
        'id': 'angst',
        'name': 'Angst',
        'brand_group': 'venue_brand',
        'brand_type': 'legendary_venue',
        'brand_kind': 'bar_club',
        'sector': 'nightlife',
        'state': 'catalog',
        'status': 'active',
        'verification': 'verified',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'Angst Bar er en selvstendig utestedsidentitet i bakgården ved Torggata 11. VisitOSLO dokumenterer både adressen og den tydelige bakgårdsprofilen; koblingen til Torggata er derfor direkte, ikke en områdemapping.',
        'desc': 'Bakgårdsbar i Torggata 11.',
        'tags': ['brand', 'nightlife', 'oslo', 'torggata', 'venue'],
        'source_urls': [
            'https://www.visitoslo.com/no/produkt/?name=Angst-Bar&tlp=3006243',
            'https://www.visitoslo.com/no/artikler/bakgardsperler-i-oslo/'
        ]
    },
    {
        'id': 'john_dee',
        'name': 'John Dee',
        'brand_group': 'venue_brand',
        'brand_type': 'music_venue',
        'brand_kind': 'bar_club',
        'sector': 'music',
        'state': 'catalog',
        'status': 'active',
        'verification': 'verified',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'John Dee ble etablert i 1997 som klubbscene i kjelleren under Rockefeller i det tidligere Torggata Bad-komplekset. Publikum går inn fra Mariboes gate 5A; Torggata-koblingen gjelder det fysiske Torggata 16-komplekset og skal ikke leses som en egen gateinngang i Torggata.',
        'desc': 'Klubbscene i Torggata Bad/Rockefeller-komplekset.',
        'tags': ['brand', 'music', 'oslo', 'torggata', 'venue'],
        'source_urls': [
            'https://www.rockefeller.no/en/booking-utleie-johndee',
            'https://www.rockefeller.no/en/booking-utleie'
        ]
    },
    {
        'id': 'eldorado_bokhandel',
        'name': 'Eldorado Bokhandel',
        'brand_group': 'subculture_brand',
        'brand_type': 'bookstore_brand',
        'brand_kind': 'legacy',
        'sector': 'books',
        'state': 'catalog',
        'status': 'dead',
        'verification': 'verified_legacy',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'Eldorado Bokhandel åpnet i de tidligere kinolokalene i Torggata 9 i 2013 og opphørte som egen bokhandel i 2018 da Norli overtok lokalene. Brandet vises derfor bare som historisk Torggata-identitet, ikke som nåværende virksomhet.',
        'desc': 'Historisk bokhandel i Torggata 9, 2013–2018.',
        'tags': ['books', 'brand', 'legacy_brand', 'oslo', 'torggata'],
        'source_urls': [
            'https://oslobyleksikon.no/index.php?title=Eldorado',
            'https://e24.no/naeringsliv/i/70j6XK/snart-slutt-for-norges-stoerste-bokhandel-lokalene-overtas-av-konkurrenten'
        ]
    },
    {
        'id': 'jernia_torggata',
        'name': 'Jernia Torggata',
        'aliases': ['Stensbak', 'Jernia Torggata (tidligere Stensbak)'],
        'brand_group': 'oslo_associated_brand',
        'brand_type': 'specialty_store_brand',
        'brand_kind': 'shop',
        'sector': 'hardware_retail',
        'state': 'catalog',
        'status': 'active',
        'verification': 'verified',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'Jernia Torggata i Torggata 11 viderefører en lokal jernvarehandel som Torggata Gateforening daterer til 1896 og som tidligere het Stensbak. Den stedsspesifikke kontinuiteten gjør Jernia Torggata til mer enn en tilfeldig kjedefilial i denne brand-rundingen.',
        'desc': 'Historisk jernvarelinje i Torggata 11, nå Jernia Torggata.',
        'tags': ['brand', 'hardware', 'legacy_continuity', 'oslo', 'retail', 'torggata'],
        'source_urls': [
            'https://www.jernia.no/butikker/oslo/jernia-torggata',
            'https://www.torggata.oslo.no/jernia/'
        ]
    },
    {
        'id': 'oslo_sportslager',
        'name': 'Oslo Sportslager',
        'brand_group': 'oslo_based_brand',
        'brand_type': 'specialty_store_brand',
        'brand_kind': 'shop',
        'sector': 'sports_retail',
        'state': 'catalog',
        'status': 'active',
        'verification': 'verified',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'Oslo Sportslager er en selvstendig sportsbutikk i Torggata 20 med lang kontinuitet og tydelig egen fag- og butikkidentitet. Torggata Gateforening beskriver virksomheten som en av landets største og eldste sportsforretninger, og Brønnøysundregistrene bekrefter beliggenhetsadressen.',
        'desc': 'Selvstendig sportsforretning i Torggata 20.',
        'tags': ['brand', 'oslo', 'sports_retail', 'specialty_store', 'torggata'],
        'source_urls': [
            'https://oslosportslager.no/',
            'https://www.torggata.oslo.no/oslo-sportslager/',
            'https://virksomhet.brreg.no/nb/oppslag/underenheter/971751266'
        ]
    },
    {
        'id': 'norli_eldorado',
        'name': 'Norli Eldorado',
        'aliases': ['Norli Oslo Eldorado'],
        'brand_group': 'subculture_brand',
        'brand_type': 'bookstore_brand',
        'brand_kind': 'shop',
        'sector': 'books',
        'state': 'catalog',
        'status': 'active',
        'verification': 'verified',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'Norli Eldorado er den nåværende bokhandelsidentiteten i de historiske Eldorado-lokalene i Torggata 9A. Den egne Eldorado-profilen og videreføringen av bokhandel i det tidligere kinobygget gir butikken en stedsspesifikk identitet utover en ordinær Norli-filial.',
        'desc': 'Stedsspesifikk Norli-bokhandel i Eldorado, Torggata 9A.',
        'tags': ['books', 'brand', 'oslo', 'torggata', 'venue_identity'],
        'source_urls': [
            'https://www.norli.no/butikker/oslo/norli-oslo-eldorado',
            'https://www.torggata.oslo.no/norli-eldorado-bokhandel/',
            'https://oslobyleksikon.no/index.php?title=Eldorado'
        ]
    },
    {
        'id': 'oslo_bar_bowling',
        'name': 'Oslo Bar & Bowling',
        'brand_group': 'venue_brand',
        'brand_type': 'legendary_venue',
        'brand_kind': 'bar_club',
        'sector': 'entertainment',
        'state': 'catalog',
        'status': 'active',
        'verification': 'verified',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'Oslo Bar & Bowling holder til i kjelleren i det tidligere Torggata Bad i Torggata 16. Torggata Gateforening dokumenterer både adressen og kontinuiteten siden åpningen i 2002, slik at venue-navnet har en direkte og varig Torggata-kobling.',
        'desc': 'Bowling- og underholdningsvenue i Torggata 16.',
        'tags': ['brand', 'entertainment', 'nightlife', 'oslo', 'torggata', 'venue'],
        'source_urls': [
            'https://www.torggata.oslo.no/oslo-bar-and-bowling/',
            'https://oslobowling.no/'
        ]
    },
    {
        'id': 'oslo_street_food',
        'name': 'Oslo Street Food',
        'brand_group': 'venue_brand',
        'brand_type': 'hospitality_brand',
        'brand_kind': 'restaurant',
        'sector': 'food_and_drink',
        'state': 'catalog',
        'status': 'active',
        'verification': 'verified',
        'verified_at': VERIFIED_AT,
        'popupdesc': 'Oslo Street Food er mathall- og venue-identiteten i deler av det tidligere Torggata Bad i Torggata 16. Virksomhetens egen side og Torggata Gateforening dokumenterer både adressen, mathallprofilen og den direkte koblingen til det historiske badekomplekset.',
        'desc': 'Mathall og venue i det tidligere Torggata Bad, Torggata 16.',
        'tags': ['brand', 'food_and_drink', 'hospitality', 'oslo', 'torggata', 'venue'],
        'source_urls': [
            'https://www.oslo-streetfood.no/om-oss',
            'https://www.torggata.oslo.no/oslo-street-food/'
        ]
    },
    {
        'id': 'adelsten',
        'name': 'Adelsten',
        'aliases': ['Adelsten Jensen', 'Adelsten Jensen A/S', 'Adelsten Kjølner'],
        'brand_group': 'legacy_brand',
        'brand_type': 'historic_company',
        'brand_kind': 'legacy',
        'sector': 'fashion_retail',
        'state': 'catalog',
        'status': 'dead',
        'verification': 'verified_legacy',
        'verified_at': VERIFIED_AT,
        'founded': 1890,
        'popupdesc': 'Adelsten Jensen etablerte herre- og barneekvipering i Torggata i 1890; virksomheten flyttet til Torggata 1 i 1901, hadde egen logo og utviklet seg senere til den landsomfattende kjeden Adelsten. Brandet er derfor en tydelig historisk Torggata-identitet, ikke personprofilen Adelsten Jensen.',
        'desc': 'Historisk konfeksjonsbrand med utspring i Torggata.',
        'tags': ['brand', 'fashion', 'legacy_brand', 'oslo', 'torggata'],
        'source_urls': [
            'https://oslobyleksikon.no/side/Adelsten_Jensen',
            'https://arkiv.nrk.no/blogg.nrk.no/byen/2009/10/01/butikker-i-gamle-dager/index.html'
        ]
    },
    {
        'id': 'ludvig_jensen_co',
        'name': 'Ludvig Jensen & Co.',
        'aliases': ['Jensen & Co.'],
        'brand_group': 'legacy_brand',
        'brand_type': 'historic_company',
        'brand_kind': 'legacy',
        'sector': 'food_retail',
        'state': 'catalog',
        'status': 'dead',
        'verification': 'verified_legacy',
        'verified_at': VERIFIED_AT,
        'founded': 1873,
        'popupdesc': 'Ludvig Jensen & Co. var delikatesseforretningen Ludvig Christian Jensen drev i Torggata 5a fra 1873. Firmaet er ett av fire Jensen-handelsnavn Oslo byleksikon trekker fram som særpreget for Torggata, og modelleres som historisk virksomhetsbrand adskilt fra personen.',
        'desc': 'Historisk delikatesseforretning i Torggata 5a fra 1873.',
        'tags': ['brand', 'food_retail', 'legacy_brand', 'oslo', 'torggata'],
        'source_urls': [
            'https://oslobyleksikon.no/index.php/Torggata',
            'https://www.estatenyheter.no/aktuelt/torggata-5-til-olav-thon-for-110-millioner-kroner/137090'
        ]
    },
    {
        'id': 'pm_jensen',
        'name': 'P. M. Jensen',
        'brand_group': 'legacy_brand',
        'brand_type': 'historic_company',
        'brand_kind': 'legacy',
        'sector': 'food_retail',
        'state': 'catalog',
        'status': 'dead',
        'verification': 'verified_legacy',
        'verified_at': VERIFIED_AT,
        'founded': 1896,
        'popupdesc': 'P. M. Jensen var Peter Marinius Jensens kjøttvare- og delikatesseforretning i Torggata 5b fra 1896. Navnet inngår i den dokumenterte Jensen-klyngen av fire forretninger som gjorde familien særpreget i Torggata.',
        'desc': 'Historisk kjøtt- og delikatesseforretning i Torggata 5b.',
        'tags': ['brand', 'food_retail', 'legacy_brand', 'oslo', 'torggata'],
        'source_urls': [
            'https://oslobyleksikon.no/index.php/Torggata',
            'https://www.estatenyheter.no/aktuelt/torggata-5-til-olav-thon-for-110-millioner-kroner/137090'
        ]
    },
    {
        'id': 'karl_a_jensen_forretning',
        'name': 'Karl A. Jensen Vilt- og lakseforretning',
        'aliases': ['Karl A. Jensen'],
        'brand_group': 'legacy_brand',
        'brand_type': 'historic_company',
        'brand_kind': 'legacy',
        'sector': 'food_retail',
        'state': 'catalog',
        'status': 'dead',
        'verification': 'verified_legacy',
        'verified_at': VERIFIED_AT,
        'founded': 1914,
        'popupdesc': 'Karl A. Jensen drev vilt- og lakseforretning i Torggata 7 fra 1914. Forretningsnavnet inngår i den dokumenterte Jensen-klyngen som Oslo byleksikon fremhever som et særtrekk ved Torggatas handelshistorie.',
        'desc': 'Historisk vilt- og lakseforretning i Torggata 7 fra 1914.',
        'tags': ['brand', 'food_retail', 'legacy_brand', 'oslo', 'torggata'],
        'source_urls': [
            'https://oslobyleksikon.no/index.php/Torggata',
            'https://www.estatenyheter.no/aktuelt/torggata-5-til-olav-thon-for-110-millioner-kroner/137090'
        ]
    },
    {
        'id': 'ingwald_nielsen',
        'name': 'Ingwald Nielsen',
        'aliases': ['Ingwald'],
        'brand_group': 'legacy_brand',
        'brand_type': 'historic_company',
        'brand_kind': 'legacy',
        'sector': 'retail',
        'state': 'catalog',
        'status': 'dead',
        'verification': 'verified_legacy',
        'verified_at': VERIFIED_AT,
        'founded': 1897,
        'popupdesc': 'Jernvareforretningen Ingwald Nielsen åpnet i 1897 og flyttet til Torggata 4 i 1914. I Torggata utviklet «Ingwald» seg til et varemagasin med et bredt og tydelig handelsnavn, dokumentert både i Oslo byleksikon og Lokalhistoriewiki.',
        'desc': 'Historisk varemagasin og jernvarebrand i Torggata 4–6.',
        'tags': ['brand', 'hardware', 'legacy_brand', 'oslo', 'retail', 'torggata'],
        'source_urls': [
            'https://oslobyleksikon.no/index.php/Torggata',
            'https://lokalhistoriewiki.no/wiki/Torggata_(Oslo)'
        ]
    }
]

final_mapping = [record['id'] for record in records]
by_place['torggata'] = final_mapping

index_by_id = {str(item.get('id', '')): idx for idx, item in enumerate(master) if isinstance(item, dict)}
for record in records:
    existing_idx = index_by_id.get(record['id'])
    if existing_idx is None:
        master.append(record)
        index_by_id[record['id']] = len(master) - 1
    else:
        existing = dict(master[existing_idx])
        existing.update(record)
        master[existing_idx] = existing

# Remove stale Torggata linkage from legacy area-only candidates without disturbing other place links.
for stale_id in ['arakataka', 'big_dipper', 'justisen', 'the_villa', 'tilt']:
    idx = index_by_id.get(stale_id)
    if idx is None:
        continue
    item = dict(master[idx])
    if isinstance(item.get('place_ids'), list):
        item['place_ids'] = [pid for pid in item['place_ids'] if pid != 'torggata']
        if not item['place_ids']:
            item.pop('place_ids', None)
    master[idx] = item

# Canonical place_ids are derived from the complete mapping table for the audited records.
reverse = {brand_id: [] for brand_id in final_mapping}
for place_id, brand_ids in by_place.items():
    if not isinstance(brand_ids, list):
        continue
    for brand_id in brand_ids:
        if brand_id in reverse and place_id not in reverse[brand_id]:
            reverse[brand_id].append(place_id)
for brand_id, place_ids in reverse.items():
    idx = index_by_id[brand_id]
    item = dict(master[idx])
    item['place_ids'] = sorted(place_ids)
    master[idx] = item

write_json(MASTER_PATH, master)
write_json(BY_PLACE_PATH, by_place)

scores = {
    'angst': 8,
    'john_dee': 9,
    'eldorado_bokhandel': 9,
    'jernia_torggata': 8,
    'oslo_sportslager': 9,
    'norli_eldorado': 8,
    'oslo_bar_bowling': 8,
    'oslo_street_food': 9,
    'adelsten': 10,
    'ludvig_jensen_co': 8,
    'pm_jensen': 8,
    'karl_a_jensen_forretning': 8,
    'ingwald_nielsen': 9,
}

audit = {
    'schema': 'history_go_place_brand_audit_v1',
    'version': '1.0.0',
    'generated_at': '2026-08-11',
    'place_id': 'torggata',
    'phase': '8C Brands',
    'result': 'PASS',
    'policy': 'data/brands/brand_rules_v1_1.json',
    'previous_mappings': previous_mapping,
    'final_mapping': final_mapping,
    'included': [
        {
            'id': record['id'],
            'name': record['name'],
            'score': scores[record['id']],
            'state': 'catalog',
            'verification': record['verification'],
            'temporal_scope': 'current' if record['status'] == 'active' else 'historical',
            'visual_decision': 'name_fallback_no_logo_copied',
            'source_urls': record['source_urls'],
        }
        for record in records
    ],
    'held_back': [
        {
            'candidate': 'Arakataka',
            'reason': 'Område-/nabogate-mapping; dokumentert adresse er Mariboes gate 7, ikke Torggata.',
            'source_urls': ['https://arakataka.no/']
        },
        {
            'candidate': 'Big Dipper',
            'reason': 'Område-/nabogate-mapping; dokumentert butikkadresse er Møllergata 3A, ikke Torggata.',
            'source_urls': ['https://bigdipper.no/']
        },
        {
            'candidate': 'Justisen',
            'reason': 'Historisk Møllergata/Pløens gate og nå Universitetsgata 14; ingen direkte Torggata-lokasjon.',
            'source_urls': ['https://justisen.no/']
        },
        {
            'candidate': 'The Villa',
            'reason': 'Dokumentert adresse Møllergata 23–25; områdenærhet er ikke direkte Torggata-kobling.',
            'source_urls': ['https://www.thevilla.no/']
        },
        {
            'candidate': 'Tilt',
            'reason': 'Offisiell adresse er Badstugata 6. Intern/områdemessig forbindelse til Torggata 16 er ikke nok til å gjøre Tilt til en direkte Torggata-brand-mapping.',
            'source_urls': ['https://tiltoslo.no/']
        },
        {
            'candidate': 'Rockefeller',
            'reason': 'Brand-reglene nevner Rockefeller eksplisitt som place-first; den fysiske Torggata Bad/Rockefeller-identiteten hører hjemme i 8D Structures, ikke som Brand-fyll.',
            'source_urls': ['https://www.rockefeller.no/en/booking-utleie']
        },
        {
            'candidate': 'Torggata Bar',
            'reason': 'Direkte Torggata-lokasjon, men navnet fungerer primært som generisk lokasjons-/venueetikett og har svakere autonom brandidentitet enn terskelen krever.',
            'source_urls': ['https://www.torggatabar.no/']
        },
        {
            'candidate': 'Kiwi Torggata / Kjell & Company / Anton Sport / Kitch’n / Los Tacos',
            'reason': 'Direkte eller nær Torggata, men behandles som ordinære kjede-/filialidentiteter uten dokumentert eksepsjonell lokal symbolkraft. Jernia Torggata er unntaket på grunn av dokumentert lokal jernvarekontinuitet fra 1896/Stensbak.',
            'source_urls': ['https://www.torggata.oslo.no/gate-kart-torggata/']
        },
        {
            'candidate': 'Qomo og øvrige mindre nåværende aktører',
            'reason': 'Direkte kandidatfunn, men foreløpig utilstrekkelig dokumentert autonom offentlig gjenkjennelse og kildegrunnlag til catalog-terskel.',
            'source_urls': ['https://www.torggata.oslo.no/gate-kart-torggata/']
        },
        {
            'candidate': 'Stensbak',
            'reason': 'Bevares som historisk alias/forløper i Jernia Torggata-recorden for å unngå å doble samme lokale handelslinje som to brands.',
            'source_urls': ['https://www.torggata.oslo.no/jernia/']
        },
        {
            'candidate': 'Eldorado kino / Fahlstrøms Theater',
            'reason': 'Historisk sted-/venueidentitet med sterk fysisk og kulturhistorisk primærvekt; håndteres i stedshistorie/8D Structures fremfor å dobles som Brands.',
            'source_urls': ['https://oslobyleksikon.no/index.php?title=Eldorado']
        }
    ],
    'removed_legacy_mappings': ['arakataka', 'big_dipper', 'justisen', 'the_villa', 'tilt'],
    'logo_policy': 'Ingen logo er kopiert, generert eller rekonstruert. PlaceCard bruker canonical navnefallback når en rettighetsklar logo ikke er dokumentert.',
    'quota_policy': 'Ingen antallskvote. Inkludering følger brand-reglene, direkte Torggata-relasjon og dokumentert identitet.',
    'notes': [
        'Gateforeningens område omfatter også side- og parallellgater; medlemskap/områdenærhet alene er derfor ikke mapping-evidens.',
        'Historiske brands er eksplisitt temporalmerket som dead + verified_legacy og presenteres ikke som nåværende virksomheter.',
        'Personprofilene for Jensen-familien dupliseres ikke; brand-recordene modellerer de selvstendige handelsnavnene.'
    ]
}
write_json(AUDIT_PATH, audit)

TEST_PATH.write_text(r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const master = readJson('data/brands/brands_master.json');
const byPlace = readJson('data/brands/brands_by_place.json');
const rules = readJson('data/brands/brand_rules_v1_1.json');
const audit = readJson('reports/place-production/torggata-phase8c-brands-audit-v1.json');
const place = readJson('data/places/by/oslo/places/torggata.json');
const loader = fs.readFileSync('js/brands/brands_loader.js', 'utf8');
const placeCard = fs.readFileSync('js/ui/place-card.js', 'utf8');
const workcard = fs.readFileSync('reports/place-production/torggata-workcard-current.md', 'utf8');

const expected = [
  'angst', 'john_dee', 'eldorado_bokhandel', 'jernia_torggata',
  'oslo_sportslager', 'norli_eldorado', 'oslo_bar_bowling', 'oslo_street_food',
  'adelsten', 'ludvig_jensen_co', 'pm_jensen', 'karl_a_jensen_forretning',
  'ingwald_nielsen'
];
const removed = ['arakataka', 'big_dipper', 'justisen', 'the_villa', 'tilt'];
const byId = new Map(master.map(item => [item.id, item]));

test('Torggata 8C har bare reviderte canonical brand-mappinger', () => {
  assert.deepEqual(byPlace.torggata, expected);
  assert.equal(new Set(expected).size, expected.length);
  for (const id of removed) assert.equal(byPlace.torggata.includes(id), false, id);
  assert.equal(Object.hasOwn(place, 'brands'), false);
  assert.equal(Object.hasOwn(place, 'brand_ids'), false);
});

test('alle 8C-brands er catalog, kildebårne og temporalmerket', () => {
  for (const id of expected) {
    const brand = byId.get(id);
    assert.ok(brand, id);
    assert.equal(brand.state, 'catalog', id);
    assert.ok(['verified', 'verified_legacy'].includes(brand.verification), id);
    assert.equal(brand.verified_at, '2026-08-11', id);
    assert.ok(Array.isArray(brand.place_ids) && brand.place_ids.includes('torggata'), id);
    assert.ok(Array.isArray(brand.source_urls) && brand.source_urls.length >= 2, id);
    assert.ok(brand.source_urls.every(url => /^https:\/\//.test(url)), id);
    assert.match(brand.popupdesc, /Torggata/i, id);
    assert.ok(['active', 'dead'].includes(brand.status), id);
  }
});

test('historiske brands kan ikke presenteres som nåværende', () => {
  for (const id of ['eldorado_bokhandel', 'adelsten', 'ludvig_jensen_co', 'pm_jensen', 'karl_a_jensen_forretning', 'ingwald_nielsen']) {
    const brand = byId.get(id);
    assert.equal(brand.status, 'dead', id);
    assert.equal(brand.verification, 'verified_legacy', id);
  }
  assert.ok(byId.get('jernia_torggata').aliases.includes('Stensbak'));
  assert.ok(byId.get('adelsten').aliases.includes('Adelsten Jensen'));
});

test('audit dokumenterer kandidatfunn, holdback, logo og null kvote', () => {
  assert.equal(audit.result, 'PASS');
  assert.deepEqual(audit.final_mapping, expected);
  assert.deepEqual(audit.removed_legacy_mappings, removed);
  assert.equal(audit.included.length, expected.length);
  assert.ok(audit.included.every(item => item.score >= 8));
  assert.ok(audit.included.every(item => item.visual_decision === 'name_fallback_no_logo_copied'));
  for (const candidate of ['Arakataka', 'Big Dipper', 'Justisen', 'The Villa', 'Tilt', 'Rockefeller', 'Stensbak']) {
    assert.ok(audit.held_back.some(item => item.candidate.includes(candidate)), candidate);
  }
  assert.match(audit.logo_policy, /Ingen logo er kopiert, generert eller rekonstruert/);
  assert.match(audit.quota_policy, /Ingen antallskvote/);
});

test('brand-reglene og runtime bruker catalog-mappingen uten stedsspesifikk særkode', () => {
  assert.equal(rules.status, 'canonical_brand_definition');
  assert.match(rules.place_production_gate.na_rule, /Zero hits.*not evidence of N\/A/i);
  assert.match(loader, /BRANDS_BY_PLACE_PATH/);
  assert.match(loader, /filter\(item => item\.state === ["']catalog["']\)/);
  assert.match(loader, /window\.BRANDS_BY_PLACE = this\.byPlace/);
  assert.match(placeCard, /window\.BRANDS_BY_PLACE/);
  assert.match(placeCard, /window\.HGBrands\?\.getById/);
  assert.doesNotMatch(loader, /torggata/);
});

test('workcard lukker 8C og peker videre til 8D', () => {
  assert.match(workcard, /\| 8\. Rundinger \| \*\*PÅGÅR – 8D Bygg og anlegg\*\*/);
  assert.match(workcard, /\*\*8C Brands = GODKJENT\.\*\*/);
  assert.match(workcard, /Neste fase-8-del: \*\*8D Bygg og anlegg\*\*\./);
});
''', encoding='utf-8')

workcard = WORKCARD_PATH.read_text(encoding='utf-8')
audit_anchor = '- Fase 8B-audit: `reports/place-production/torggata-phase8b-objects-audit-v1.md`\n'
if audit_anchor not in workcard:
    raise SystemExit('8B audit anchor missing from workcard')
if 'torggata-phase8c-brands-audit-v1.json' not in workcard:
    workcard = workcard.replace(
        audit_anchor,
        audit_anchor + '- Fase 8C-audit: `reports/place-production/torggata-phase8c-brands-audit-v1.json`\n',
        1,
    )

status_pattern = re.compile(r'^\| 8\. Rundinger \| \*\*PÅGÅR – 8C Brands\*\* \|.*\|$', re.M)
status_new = '| 8. Rundinger | **PÅGÅR – 8D Bygg og anlegg** | audit PR #4829; **8A People GODKJENT**; **8B Objects GODKJENT**; **8C Brands GODKJENT** etter full re-audit; 8D er neste del |'
workcard, count = status_pattern.subn(status_new, workcard, count=1)
if count != 1:
    raise SystemExit('8C status row missing or ambiguous')

tail = 'Neste fase-8-del: **8C Brands**.'
if tail not in workcard:
    raise SystemExit('8C tail anchor missing')
section = '''## Fase 8C – Brands

8C re-auditerer den gamle åttelisten mot `brand_rules_v1_1` og direkte Torggata-evidens. Fem eldre mappings fjernes fordi de gjelder side-/nabogater eller for svak fysisk kobling: Arakataka, Big Dipper, Justisen, The Villa og Tilt. De blir ikke slettet som brands globalt.

Den canonical Torggata-mappingen består etter re-audit av kildebårne, selvstendig gjenkjennelige identiteter med direkte eller presist avgrenset fysisk Torggata-relasjon. Nåværende brands omfatter Angst, John Dee, Jernia Torggata, Oslo Sportslager, Norli Eldorado, Oslo Bar & Bowling og Oslo Street Food. Eldorado Bokhandel beholdes bare som historisk brand. I tillegg materialiseres de dokumenterte legacy-handelsnavnene Adelsten, Ludvig Jensen & Co., P. M. Jensen, Karl A. Jensen Vilt- og lakseforretning og Ingwald Nielsen.

Alle historiske records er merket `dead` + `verified_legacy`; dagens virksomheter er `active` + `verified`. Ingen logo er kopiert eller rekonstruert uten dokumentert rettighetskjede, så PlaceCard bruker navnefallback. Vanlige kjedebutikker og svake kandidater holdes ute kandidatspesifikt i auditen. Rockefeller holdes ute fordi brand-kontrakten uttrykkelig behandler navnet som place-first, og hører til 8D Structures.

**8C Brands = GODKJENT.**

Neste fase-8-del: **8D Bygg og anlegg**.'''
workcard = workcard.replace(tail, section, 1)
WORKCARD_PATH.write_text(workcard, encoding='utf-8')

print(f'Materialized Torggata 8C: {len(final_mapping)} canonical brand mappings')
