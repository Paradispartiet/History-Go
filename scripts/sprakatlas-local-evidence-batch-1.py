import json
from pathlib import Path

ATLAS = Path('data/leksikon/sprak/norge_atlas_v1.json')
SCHEMA = Path('data/leksikon/sprak/atlas_schema_v1.json')
RUNTIME = Path('js/ui/place-language-layer.js')
CSS = Path('css/place-language-layer.css')
DOCS = Path('docs/SPRAKLEKSIKON.md')
TESTS = Path('tests/place-language-dialect-scope.test.mjs')


def load_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def source(label, url):
    return {'label': label, 'url': url}


S = {
    'oslo_snl': source('Store norske leksikon – dialekter og språk i Oslo', 'https://snl.no/dialekter_og_spr%C3%A5k_i_Oslo'),
    'nota': source('UiO Tekstlab – NoTa-Oslo', 'https://tekstlab.uio.no/nota/'),
    'taus': source('UiO Tekstlab – TAUS', 'https://tekstlab.uio.no/nota/taus/'),
    'bergen_snl': source('Store norske leksikon – Bergen bymål', 'https://snl.no/Bergen_bym%C3%A5l'),
    'uib_change': source('UiB – Sosiolingvistikk og språkendring', 'https://www4.uib.no/forskning/forskergrupper/forskergruppa-sosiolingvistikk-og-sprakendring'),
    'talebanken': source('UiB CLARINO – Talebanken', 'https://clarino.uib.no/corpuscle-classic/corpus-list'),
    'stavanger_snl': source('Store norske leksikon – Stavanger bymål', 'https://snl.no/Stavanger_bym%C3%A5l'),
    'trondheim_snl': source('Store norske leksikon – Trondheim bymål', 'https://snl.no/Trondheim_bym%C3%A5l'),
    'trondheim_sample': source('NTNU – Nordavinden og sola, Trondheim', 'https://www.hf.ntnu.no/nos/dialect.php?t=09'),
    'tromso_uit': source('UiT – Nordnorske dialekter: Tromsø', 'https://nordnorsk.uit.no/dialekt/tromso/'),
    'tromso_uit_samples': source('UiT – Tromsø målmerker og målprøver', 'https://nordnorsk.uit.no/kommuner/troms/tromso/'),
    'troms_snl': source('Store norske leksikon – dialekter og språk i Troms', 'https://snl.no/dialekter_og_spr%C3%A5k_i_Troms'),
}


def ev(id_, label, kind, claim, time_scope, *sources):
    return {
        'id': id_,
        'label': label,
        'kind': kind,
        'claim': claim,
        'time_scope': time_scope,
        'source_urls': [item['url'] for item in sources],
    }


EVIDENCE = {
    'oslo_local_speech': {
        'feature_labels': ['kløyvd infinitiv', 'tjukk l', 'sosial og geografisk variasjon', 'pågående språkendring'],
        'sources': [S['oslo_snl'], S['nota'], S['taus']],
        'feature_evidence': [
            ev('oslo_folkemaal_jamvekt', 'Kløyvd infinitiv i tradisjonelt folkemål', 'structural_feature', 'Den tradisjonelle folkemålsvarianten i Oslo følger jamvektsmønster med kløyvd infinitiv, med a-ending i jamvektsord og e-ending i andre infinitiver.', 'traditional', S['oslo_snl']),
            ev('oslo_tjukk_l', 'Tjukk l som tradisjonelt østlandsk trekk', 'structural_feature', 'Tjukk l er dokumentert som et tradisjonelt trekk i det folkelige Oslo-målet, sammen med andre østlandske lyd- og bøyningstrekk.', 'traditional', S['oslo_snl']),
            ev('oslo_varieteter_register', 'Flere varieteter og registerveksling', 'social_variation', 'Oslo har historisk hatt en folkemålsvariant og en riksmålsnær variant, og språkbrukere kan veksle mellom trekk etter situasjon, samtalepartner og sosial betydning.', 'historical_and_contemporary', S['oslo_snl'], S['taus'], S['nota']),
            ev('oslo_endring_yngre', 'Tradisjonelle østkanttrekk er på vikende front', 'language_change', 'I nyere Oslo-mål er blant annet førstestavingstrykk, tjukk l fra historisk rd og a-ending i enkelte jamvektsinfinitiver mindre brukt blant yngre enn i eldre østkantmål.', 'ongoing_change', S['oslo_snl']),
            ev('oslo_realtime_corpora', 'Korpusgrunnlag fra to perioder', 'corpus_basis', 'TAUS dokumenterer Oslo-talemål fra 1971–73, mens NoTa-Oslo dokumenterer et sosialt og geografisk bredt Oslo-materiale fra 2004–06, slik at endring og variasjon kan undersøkes mot to tidsperioder.', 'corpus_basis', S['taus'], S['nota']),
        ],
    },
    'bergen_local_speech': {
        'feature_labels': ['-æ i infinitiv', 'to grammatiske kjønn', 'garpegenitiv', 'intern og generasjonell variasjon'],
        'sources': [S['bergen_snl'], S['uib_change'], S['talebanken']],
        'feature_evidence': [
            ev('bergen_ae_infinitiv', '-æ i infinitiv', 'structural_feature', 'Tradisjonelt Bergen bymål har infinitivending på -æ, i kontrast til a-infinitiv i mange av bygdemålene rundt byen.', 'traditional', S['bergen_snl']),
            ev('bergen_to_kjonn', 'To grammatiske kjønn', 'structural_feature', 'Bergensdialekten har tradisjonelt to grammatiske kjønn i substantivbøyingen, der tidligere hunkjønnsord mønstrer sammen med hankjønn.', 'traditional_and_contemporary', S['bergen_snl']),
            ev('bergen_garpegenitiv', 'Sin-konstruksjon / garpegenitiv', 'contact_history', 'Sin-konstruksjonen i genitiv er et dokumentert trekk i bergensk med historisk forbindelse til langvarig nedertysk språkkontakt.', 'historical_contact', S['bergen_snl']),
            ev('bergen_intern_variasjon', 'Intern variasjon i byen', 'social_variation', 'Forskningen ved UiB dokumenterer intern variasjon mellom bergenske varieteter, blant annet gjennom studier av Bergenhus og Fana, og viser at ett Bergen ikke er én homogen talemålsprofil.', 'contemporary_variation', S['uib_change'], S['talebanken']),
            ev('bergen_kje_sje_eg_jeg', 'Generasjonell endring i uttale og pronomenvalg', 'language_change', 'UiB beskriver nyere bergensk endring blant annet gjennom sammenfall mellom tradisjonell kje-lyd og sje-lyd hos yngre, samt variasjon mellom eg og jeg.', 'ongoing_change', S['uib_change']),
        ],
    },
    'stavanger_local_speech': {
        'feature_labels': ['-a i tradisjonell infinitiv', 'skarre-r', 'tre grammatiske kjønn', 'endring hos yngre'],
        'sources': [S['stavanger_snl'], S['uib_change'], S['talebanken']],
        'feature_evidence': [
            ev('stavanger_a_infinitiv', '-a i tradisjonell infinitiv', 'structural_feature', 'Det tradisjonelle folkemålet i Stavanger har a-infinitiv, som å lesa og å skriva, og står dialektgeografisk mellom sør- og nordrogalandske talemål.', 'traditional', S['stavanger_snl']),
            ev('stavanger_skarre_r', 'Skarre-r', 'structural_feature', 'Skarre-r er gjennomført i det tradisjonelle folkelige stavangermålet.', 'traditional_and_contemporary', S['stavanger_snl']),
            ev('stavanger_tre_kjonn', 'Tre grammatiske kjønn', 'structural_feature', 'Stavanger bymål har tre grammatiske kjønn og tradisjonell r-ending i ubestemt flertall av substantiv.', 'traditional_and_contemporary', S['stavanger_snl']),
            ev('stavanger_sosial_variasjon', 'Folkemål og høyere talemål', 'social_variation', 'Stavanger har historisk hatt tydelig sosial variasjon mellom folkemålet og en høyere, mer riksmålsnær stavangersk talemålsvariant; dette skillet er svakere i yngre språkbruk.', 'historical_and_contemporary', S['stavanger_snl'], S['uib_change']),
            ev('stavanger_endring_yngre', 'E-infinitiv og harde konsonanter øker hos yngre', 'language_change', 'Nyere beskrivelser dokumenterer at e-infinitiv kommer inn hos yngre Stavanger-talere, og at tradisjonelle bløte konsonanter er på retur.', 'ongoing_change', S['stavanger_snl'], S['uib_change']),
        ],
    },
    'trondheim_local_speech': {
        'feature_labels': ['jamvekt og apokope', 'tjukk l', 'palatalisering', 'sosial variasjon i endring'],
        'sources': [S['trondheim_snl'], S['trondheim_sample']],
        'feature_evidence': [
            ev('trondheim_jamvekt_apokope', 'Jamvekt og apokope', 'structural_feature', 'Det folkelige Trondheim bymålet er et trøndersk jamvektsmål der enkelte infinitiver beholder vokal mens andre har apokope.', 'traditional_and_contemporary', S['trondheim_snl']),
            ev('trondheim_tjukk_l_palatalisering', 'Tjukk l og palatalisering', 'structural_feature', 'Tjukk l og palatalisering av historiske n- og l-lyder er sentrale dokumenterte trekk i Trondheim bymål.', 'traditional_and_contemporary', S['trondheim_snl']),
            ev('trondheim_fin_brei', 'Historisk «fin-» og folkelig trøndersk', 'social_variation', 'Trondheim har historisk hatt sosialt markerte talemålsvarianter ofte omtalt som «fintrøndersk» og «breitrøndersk», men grensene mellom dem er ikke lenger homogene eller faste.', 'historical_and_contemporary', S['trondheim_snl']),
            ev('trondheim_prestisjeendring', 'Prestisjehierarkiet er i endring', 'language_change', 'Den riksmålsnære «fintrønderske» varieteten har mistet terreng og prestisje, mens folkelig Trondheimsmål står sterkere blant unge enn tidligere.', 'ongoing_change', S['trondheim_snl']),
            ev('trondheim_lydprove', 'Direkte dialektprøve', 'corpus_basis', 'NTNUs Nordavinden og sola-base har lyd, IPA/XSAMPA og ortografisk transkripsjon fra en informant som selv beskriver talemålet som Trondheim bymål.', 'corpus_basis', S['trondheim_sample']),
        ],
    },
    'tromso_local_speech': {
        'feature_labels': ['e/a-mål', 'ikkje og æ(g)', 'no/nu-variasjon', 'språkkontakt og endring'],
        'sources': [S['tromso_uit'], S['tromso_uit_samples'], S['troms_snl']],
        'feature_evidence': [
            ev('tromso_ea_mal', 'E/a-mål', 'structural_feature', 'Tradisjonell Tromsø-dialekt er et e/a-mål, med e-ending i infinitiv og a-ending i ubestemt entall av svake hunkjønnsord.', 'traditional_and_contemporary', S['tromso_uit'], S['tromso_uit_samples']),
            ev('tromso_ikkje_aeg', 'Ikkje og æ(g)', 'structural_feature', 'UiTs materiale registrerer tradisjonelt blant annet nektingsadverbet ikkje og førstepersonspronomenet æ(g) i Tromsø.', 'traditional_and_contemporary', S['tromso_uit_samples']),
            ev('tromso_no_nu', 'Variasjon mellom no og nu', 'social_variation', 'Både eldre og yngre informanter i UiT-materialet varierer mellom tidsadverbene no og nu; variasjonen skal derfor ikke reduseres til én obligatorisk lokal form.', 'contemporary_variation', S['tromso_uit']),
            ev('tromso_ikke_endring', 'Økende bruk av ikke blant ungdom', 'language_change', 'UiTs oversikt viser til forskning der formen ikke brukes mer av ungdom enn av eldre Tromsø-talere, selv om ikkje fortsatt er dokumentert i korpusmaterialet.', 'ongoing_change', S['tromso_uit']),
            ev('tromso_smeltedigel', 'Dialektmøte og språkkontakt', 'contact_history', 'Tromsø beskrives som et sterkt dialektmøte- og språkkontaktmiljø, særlig som følge av omfattende tilflytting siden 1980-årene.', 'contemporary_contact', S['tromso_uit'], S['troms_snl']),
        ],
    },
}

atlas = load_json(ATLAS)
for profile_id, materialized in EVIDENCE.items():
    row = next((item for item in atlas.get('local_varieties', []) if item.get('id') == profile_id), None)
    if row is None:
        raise RuntimeError(f'Mangler lokalprofil {profile_id}')
    row['profile_status'] = 'evidence_materialized'
    row['evidence_last_verified'] = '2026-08-18'
    row['feature_labels'] = materialized['feature_labels']
    row['feature_evidence'] = materialized['feature_evidence']
    merged = {item['url']: item for item in [*row.get('sources', []), *materialized['sources']] if item and item.get('url')}
    row['sources'] = list(merged.values())

basis = atlas.setdefault('research_basis', {})
batches = [item for item in basis.get('local_evidence_batches', []) if item.get('id') != 'local_evidence_batch_1']
batches.append({
    'id': 'local_evidence_batch_1',
    'verified_at': '2026-08-18',
    'profile_ids': list(EVIDENCE.keys()),
    'rule': 'Konkrete lokale trekk publiseres bare når påstanden har eksplisitt kildebelegg; historisk trekk, samtidssituasjon og endring holdes fra hverandre.',
})
basis['local_evidence_batches'] = batches
write_json(ATLAS, atlas)

schema = load_json(SCHEMA)
local_item = schema['properties']['local_varieties']['items']
statuses = local_item['properties']['profile_status']['enum']
local_item['properties']['profile_status']['enum'] = list(dict.fromkeys([*statuses, 'evidence_materialized']))
local_item['properties']['feature_labels'] = {'type': 'array', 'items': {'type': 'string', 'minLength': 1}}
local_item['properties']['evidence_last_verified'] = {'type': 'string', 'pattern': '^\\d{4}-\\d{2}-\\d{2}$'}
local_item['properties']['feature_evidence'] = {
    'type': 'array',
    'minItems': 3,
    'items': {
        'type': 'object',
        'required': ['id', 'label', 'kind', 'claim', 'time_scope', 'source_urls'],
        'properties': {
            'id': {'type': 'string', 'minLength': 1},
            'label': {'type': 'string', 'minLength': 1},
            'kind': {'enum': ['structural_feature', 'social_variation', 'language_change', 'contact_history', 'corpus_basis']},
            'claim': {'type': 'string', 'minLength': 20},
            'time_scope': {'type': 'string', 'minLength': 1},
            'source_urls': {'type': 'array', 'minItems': 1, 'items': {'type': 'string', 'pattern': '^https://'}},
        },
        'additionalProperties': False,
    },
}
rule = {
    'x-history-go-rule': 'evidence-materialized',
    'if': {'properties': {'profile_status': {'const': 'evidence_materialized'}}, 'required': ['profile_status']},
    'then': {'required': ['feature_labels', 'feature_evidence', 'evidence_last_verified']},
}
local_item['allOf'] = [item for item in local_item.get('allOf', []) if item.get('x-history-go-rule') != 'evidence-materialized'] + [rule]
write_json(SCHEMA, schema)

runtime = RUNTIME.read_text(encoding='utf-8')
needle = '          <div data-atlas-selection-features></div>\n'
if 'data-atlas-selection-evidence' not in runtime:
    if needle not in runtime:
        raise RuntimeError('Fant ikke atlas selection-template')
    runtime = runtime.replace(needle, needle + '          <div class="hg-language-atlas-evidence" data-atlas-selection-evidence hidden></div>\n', 1)

old_status = '${row?.profile_status === "local_research_required" ? "Lokal research gjenstår" : "Lokal profil"}'
new_status = '${row?.profile_status === "local_research_required" ? "Lokal research gjenstår" : row?.profile_status === "evidence_materialized" ? "Dokumentert profil" : "Lokal profil"}'
if 'Dokumentert profil' not in runtime:
    if old_status not in runtime:
        raise RuntimeError('Fant ikke lokalprofil-status i runtime')
    runtime = runtime.replace(old_status, new_status, 1)

old_activate = '''      const features = selection.querySelector("[data-atlas-selection-features]");
      if (title) title.textContent = text(item?.name || macro?.name);
      if (summary) summary.textContent = [text(local?.summary || region?.area_summary || item?.summary || macro?.summary), text(local?.variation_note)].filter(Boolean).join(" ");
      if (features) features.innerHTML = list(item?.feature_labels).map(label => `<span>${esc(label)}</span>`).join("");
      selection.hidden = false;'''
new_activate = '''      const features = selection.querySelector("[data-atlas-selection-features]");
      const evidence = selection.querySelector("[data-atlas-selection-evidence]");
      if (title) title.textContent = text(item?.name || macro?.name);
      if (summary) summary.textContent = [text(local?.summary || region?.area_summary || item?.summary || macro?.summary), text(local?.variation_note)].filter(Boolean).join(" ");
      if (features) features.innerHTML = list(item?.feature_labels).map(label => `<span>${esc(label)}</span>`).join("");
      if (evidence instanceof HTMLElement) {
        const rows = list(local?.feature_evidence);
        evidence.hidden = !rows.length;
        evidence.innerHTML = rows.length ? `<strong>Dokumenterte målmerker og endringer</strong><ul>${rows.map(row => {
          const links = list(row?.source_urls).map(url => safeHttpsUrl(url)).filter(Boolean);
          return `<li><span>${esc(row?.label || row?.claim)}</span><p>${esc(row?.claim)}</p>${links.length ? `<div>${links.map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Kilde${links.length > 1 ? ` ${index + 1}` : ""} ↗</a>`).join("")}</div>` : ""}</li>`;
        }).join("")}</ul>` : "";
      }
      selection.hidden = false;'''
if 'Dokumenterte målmerker og endringer' not in runtime:
    if old_activate not in runtime:
        raise RuntimeError('Fant ikke activateAtlasSelection-blokken')
    runtime = runtime.replace(old_activate, new_activate, 1)
RUNTIME.write_text(runtime.rstrip() + '\n', encoding='utf-8')

css = CSS.read_text(encoding='utf-8').rstrip()
if '/* local-evidence-materialized-v1 */' not in css:
    css += '''

/* local-evidence-materialized-v1 */
.hg-language-atlas-evidence {
  margin-top: 12px;
  border-top: 1px solid currentColor;
  padding-top: 10px;
}

.hg-language-atlas-evidence > strong {
  display: block;
  margin-bottom: 8px;
}

.hg-language-atlas-evidence ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hg-language-atlas-evidence li {
  padding: 10px;
  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  border-radius: 10px;
}

.hg-language-atlas-evidence li > span {
  font-weight: 700;
}

.hg-language-atlas-evidence li p {
  margin: 4px 0 7px;
}

.hg-language-atlas-evidence li div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
'''
CSS.write_text(css.rstrip() + '\n', encoding='utf-8')

docs = DOCS.read_text(encoding='utf-8').rstrip()
if '## Lokalt evidensmateriale' not in docs:
    docs += '''

## Lokalt evidensmateriale

Lokale talemålsprofiler har tre modenhetsnivåer:

- `local_research_required`: atlaset kjenner stedet/ankeret, men publiserer ikke konkrete lokale trekk ennå.
- `documented_seed`: lokalprofilen har dokumentert eksistens og kildegrunnlag, men detaljtrekkene er ikke ferdig materialisert.
- `evidence_materialized`: konkrete trekk, variasjon og/eller endringer er knyttet til eksplisitte kildebelegg i `feature_evidence`.

Et `feature_evidence`-element skal skille mellom strukturelle trekk, sosial variasjon, språkendring, språkkontakt og korpusgrunnlag. Historiske trekk skal aldri presenteres som om alle nålevende talere bruker dem. Endring skal beskrives som endring, ikke som én ny homogen dialekt. Hver publisert påstand skal ha minst én HTTPS-kilde direkte knyttet til påstanden.

Første evidensmaterialiserte batch omfatter Oslo, Bergen, Stavanger, Trondheim og Tromsø fordi disse har særlig sterke kombinasjoner av direkte bymålsbeskrivelser, korpus/lydmateriale og sosiolingvistisk forskning. Utvalg i senere batcher skal fortsatt styres av dokumentasjonsstyrke, ikke av størrelse eller tilfeldige eksempler.
'''
DOCS.write_text(docs.rstrip() + '\n', encoding='utf-8')

tests = TESTS.read_text(encoding='utf-8').rstrip()
marker = 'Lokale talemålsprofiler materialiserer konkrete påstander med direkte kildebelegg'
if marker not in tests:
    tests += r'''


test("Lokale talemålsprofiler materialiserer konkrete påstander med direkte kildebelegg", () => {
  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");
  const schema = json("data/leksikon/sprak/atlas_schema_v1.json");
  const runtime = read("js/ui/place-language-layer.js");
  const contract = read("docs/SPRAKLEKSIKON.md");
  const materializedIds = [
    "oslo_local_speech",
    "bergen_local_speech",
    "stavanger_local_speech",
    "trondheim_local_speech",
    "tromso_local_speech"
  ];
  const locals = new Map((atlas.local_varieties || []).map(row => [row.id, row]));
  for (const id of materializedIds) {
    const row = locals.get(id);
    assert.ok(row, id + ": lokalprofil mangler");
    assert.equal(row.profile_status, "evidence_materialized", id + ": skal være evidensmaterialisert");
    assert.match(String(row.evidence_last_verified || ""), /^\d{4}-\d{2}-\d{2}$/);
    assert.ok((row.feature_labels || []).length >= 4, id + ": for få synlige målmerkelapper");
    assert.ok((row.feature_evidence || []).length >= 4, id + ": for få beleggpunkter");
    assert.ok((row.sources || []).length >= 2, id + ": evidensmaterialisert profil trenger minst to profilkilder");
    for (const item of row.feature_evidence || []) {
      assert.ok(text(item.label), id + "/" + item.id + ": label mangler");
      assert.ok(text(item.claim).length >= 20, id + "/" + item.id + ": påstanden er for tynn");
      assert.ok(["structural_feature", "social_variation", "language_change", "contact_history", "corpus_basis"].includes(item.kind), id + "/" + item.id + ": ukjent evidenstype");
      assert.ok((item.source_urls || []).length >= 1, id + "/" + item.id + ": mangler direkte kilde");
      for (const url of item.source_urls || []) assert.ok(String(url).startsWith("https://"), id + "/" + item.id + ": kilde må være HTTPS");
    }
  }

  assert.ok(locals.get("oslo_local_speech").feature_labels.includes("kløyvd infinitiv"));
  assert.ok(locals.get("bergen_local_speech").feature_labels.includes("to grammatiske kjønn"));
  assert.ok(locals.get("stavanger_local_speech").feature_labels.includes("skarre-r"));
  assert.ok(locals.get("trondheim_local_speech").feature_labels.includes("jamvekt og apokope"));
  assert.ok(locals.get("tromso_local_speech").feature_labels.includes("e/a-mål"));

  assert.ok(schema.properties.local_varieties.items.properties.profile_status.enum.includes("evidence_materialized"));
  assert.ok(schema.properties.local_varieties.items.properties.feature_evidence);
  assert.match(runtime, /Dokumentert profil/);
  assert.match(runtime, /data-atlas-selection-evidence/);
  assert.match(runtime, /Dokumenterte målmerker og endringer/);
  assert.match(contract, /evidence_materialized/);
  assert.match(contract, /Historiske trekk skal aldri presenteres/i);
});
'''
TESTS.write_text(tests.rstrip() + '\n', encoding='utf-8')
