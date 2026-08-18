import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const run = (command, args = []) => execFileSync(command, args, { stdio: 'inherit' });
const read = path => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content.endsWith('\n') ? content : `${content}\n`);
const json = path => JSON.parse(read(path));
const writeJson = (path, value) => write(path, JSON.stringify(value, null, 2));

const atlasPath = 'data/leksikon/sprak/norge_atlas_v1.json';
const schemaPath = 'data/leksikon/sprak/atlas_schema_v1.json';
const runtimePath = 'js/ui/place-language-layer.js';
const cssPath = 'css/place-language-layer.css';
const docsPath = 'docs/SPRAKLEKSIKON.md';
const testPath = 'tests/place-language-dialect-scope.test.mjs';

const S = {
  oslo_snl: { label: 'Store norske leksikon – dialekter og språk i Oslo', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Oslo' },
  nota: { label: 'UiO Tekstlab – NoTa-Oslo', url: 'https://tekstlab.uio.no/nota/' },
  taus: { label: 'UiO Tekstlab – TAUS', url: 'https://tekstlab.uio.no/nota/taus/' },
  bergen_snl: { label: 'Store norske leksikon – Bergen bymål', url: 'https://snl.no/Bergen_bym%C3%A5l' },
  uib_change: { label: 'UiB – Sosiolingvistikk og språkendring', url: 'https://www4.uib.no/forskning/forskergrupper/forskergruppa-sosiolingvistikk-og-sprakendring' },
  talebanken: { label: 'UiB CLARINO – Talebanken', url: 'https://clarino.uib.no/corpuscle-classic/corpus-list' },
  stavanger_snl: { label: 'Store norske leksikon – Stavanger bymål', url: 'https://snl.no/Stavanger_bym%C3%A5l' },
  trondheim_snl: { label: 'Store norske leksikon – Trondheim bymål', url: 'https://snl.no/Trondheim_bym%C3%A5l' },
  trondheim_sample: { label: 'NTNU – Nordavinden og sola, Trondheim', url: 'https://www.hf.ntnu.no/nos/dialect.php?t=09' },
  tromso_uit: { label: 'UiT – Nordnorske dialekter: Tromsø', url: 'https://nordnorsk.uit.no/dialekt/tromso/' },
  tromso_uit_samples: { label: 'UiT – Tromsø målmerker og målprøver', url: 'https://nordnorsk.uit.no/kommuner/troms/tromso/' },
  troms_snl: { label: 'Store norske leksikon – dialekter og språk i Troms', url: 'https://snl.no/dialekter_og_spr%C3%A5k_i_Troms' }
};

const evidence = {
  oslo_local_speech: {
    feature_labels: ['kløyvd infinitiv', 'tjukk l', 'sosial og geografisk variasjon', 'pågående språkendring'],
    sources: [S.oslo_snl, S.nota, S.taus],
    feature_evidence: [
      {
        id: 'oslo_folkemaal_jamvekt',
        label: 'Kløyvd infinitiv i tradisjonelt folkemål',
        kind: 'structural_feature',
        claim: 'Den tradisjonelle folkemålsvarianten i Oslo følger jamvektsmønster med kløyvd infinitiv, med a-ending i jamvektsord og e-ending i andre infinitiver.',
        time_scope: 'traditional',
        source_urls: [S.oslo_snl.url]
      },
      {
        id: 'oslo_tjukk_l',
        label: 'Tjukk l som tradisjonelt østlandsk trekk',
        kind: 'structural_feature',
        claim: 'Tjukk l er dokumentert som et tradisjonelt trekk i det folkelige Oslo-målet, sammen med andre østlandske lyd- og bøyningstrekk.',
        time_scope: 'traditional',
        source_urls: [S.oslo_snl.url]
      },
      {
        id: 'oslo_varieteter_register',
        label: 'Flere varieteter og registerveksling',
        kind: 'social_variation',
        claim: 'Oslo har historisk hatt en folkemålsvariant og en riksmålsnær variant, og språkbrukere kan veksle mellom trekk etter situasjon, samtalepartner og sosial betydning.',
        time_scope: 'historical_and_contemporary',
        source_urls: [S.oslo_snl.url, S.taus.url, S.nota.url]
      },
      {
        id: 'oslo_endring_yngre',
        label: 'Tradisjonelle østkanttrekk er på vikende front',
        kind: 'language_change',
        claim: 'I nyere Oslo-mål er blant annet førstestavingstrykk, tjukk l fra historisk rd og a-ending i enkelte jamvektsinfinitiver mindre brukt blant yngre enn i eldre østkantmål.',
        time_scope: 'ongoing_change',
        source_urls: [S.oslo_snl.url]
      },
      {
        id: 'oslo_realtime_corpora',
        label: 'Korpusgrunnlag fra to perioder',
        kind: 'corpus_basis',
        claim: 'TAUS dokumenterer Oslo-talemål fra 1971–73, mens NoTa-Oslo dokumenterer et sosialt og geografisk bredt Oslo-materiale fra 2004–06, slik at endring og variasjon kan undersøkes mot to tidsperioder.',
        time_scope: 'corpus_basis',
        source_urls: [S.taus.url, S.nota.url]
      }
    ]
  },
  bergen_local_speech: {
    feature_labels: ['-æ i infinitiv', 'to grammatiske kjønn', 'garpegenitiv', 'intern og generasjonell variasjon'],
    sources: [S.bergen_snl, S.uib_change, S.talebanken],
    feature_evidence: [
      {
        id: 'bergen_ae_infinitiv',
        label: '-æ i infinitiv',
        kind: 'structural_feature',
        claim: 'Tradisjonelt Bergen bymål har infinitivending på -æ, i kontrast til a-infinitiv i mange av bygdemålene rundt byen.',
        time_scope: 'traditional',
        source_urls: [S.bergen_snl.url]
      },
      {
        id: 'bergen_to_kjonn',
        label: 'To grammatiske kjønn',
        kind: 'structural_feature',
        claim: 'Bergensdialekten har tradisjonelt to grammatiske kjønn i substantivbøyingen, der tidligere hunkjønnsord mønstrer sammen med hankjønn.',
        time_scope: 'traditional_and_contemporary',
        source_urls: [S.bergen_snl.url]
      },
      {
        id: 'bergen_garpegenitiv',
        label: 'Sin-konstruksjon / garpegenitiv',
        kind: 'contact_history',
        claim: 'Sin-konstruksjonen i genitiv er et dokumentert trekk i bergensk med historisk forbindelse til langvarig nedertysk språkkontakt.',
        time_scope: 'historical_contact',
        source_urls: [S.bergen_snl.url]
      },
      {
        id: 'bergen_intern_variasjon',
        label: 'Intern variasjon i byen',
        kind: 'social_variation',
        claim: 'Forskningen ved UiB dokumenterer intern variasjon mellom bergenske varieteter, blant annet gjennom studier av Bergenhus og Fana, og viser at ett Bergen ikke er én homogen talemålsprofil.',
        time_scope: 'contemporary_variation',
        source_urls: [S.uib_change.url, S.talebanken.url]
      },
      {
        id: 'bergen_kje_sje_eg_jeg',
        label: 'Generasjonell endring i uttale og pronomenvalg',
        kind: 'language_change',
        claim: 'UiB beskriver nyere bergensk endring blant annet gjennom sammenfall mellom tradisjonell kje-lyd og sje-lyd hos yngre, samt variasjon mellom eg og jeg.',
        time_scope: 'ongoing_change',
        source_urls: [S.uib_change.url]
      }
    ]
  },
  stavanger_local_speech: {
    feature_labels: ['-a i tradisjonell infinitiv', 'skarre-r', 'tre grammatiske kjønn', 'endring hos yngre'],
    sources: [S.stavanger_snl, S.uib_change, S.talebanken],
    feature_evidence: [
      {
        id: 'stavanger_a_infinitiv',
        label: '-a i tradisjonell infinitiv',
        kind: 'structural_feature',
        claim: 'Det tradisjonelle folkemålet i Stavanger har a-infinitiv, som å lesa og å skriva, og står dialektgeografisk mellom sør- og nordrogalandske talemål.',
        time_scope: 'traditional',
        source_urls: [S.stavanger_snl.url]
      },
      {
        id: 'stavanger_skarre_r',
        label: 'Skarre-r',
        kind: 'structural_feature',
        claim: 'Skarre-r er gjennomført i det tradisjonelle folkelige stavangermålet.',
        time_scope: 'traditional_and_contemporary',
        source_urls: [S.stavanger_snl.url]
      },
      {
        id: 'stavanger_tre_kjonn',
        label: 'Tre grammatiske kjønn',
        kind: 'structural_feature',
        claim: 'Stavanger bymål har tre grammatiske kjønn og tradisjonell r-ending i ubestemt flertall av substantiv.',
        time_scope: 'traditional_and_contemporary',
        source_urls: [S.stavanger_snl.url]
      },
      {
        id: 'stavanger_sosial_variasjon',
        label: 'Folkemål og høyere talemål',
        kind: 'social_variation',
        claim: 'Stavanger har historisk hatt tydelig sosial variasjon mellom folkemålet og en høyere, mer riksmålsnær stavangersk talemålsvariant; dette skillet er svakere i yngre språkbruk.',
        time_scope: 'historical_and_contemporary',
        source_urls: [S.stavanger_snl.url, S.uib_change.url]
      },
      {
        id: 'stavanger_endring_yngre',
        label: 'E-infinitiv og harde konsonanter øker hos yngre',
        kind: 'language_change',
        claim: 'Nyere beskrivelser dokumenterer at e-infinitiv kommer inn hos yngre Stavanger-talere, og at tradisjonelle bløte konsonanter er på retur.',
        time_scope: 'ongoing_change',
        source_urls: [S.stavanger_snl.url, S.uib_change.url]
      }
    ]
  },
  trondheim_local_speech: {
    feature_labels: ['jamvekt og apokope', 'tjukk l', 'palatalisering', 'sosial variasjon i endring'],
    sources: [S.trondheim_snl, S.trondheim_sample],
    feature_evidence: [
      {
        id: 'trondheim_jamvekt_apokope',
        label: 'Jamvekt og apokope',
        kind: 'structural_feature',
        claim: 'Det folkelige Trondheim bymålet er et trøndersk jamvektsmål der enkelte infinitiver beholder vokal mens andre har apokope.',
        time_scope: 'traditional_and_contemporary',
        source_urls: [S.trondheim_snl.url]
      },
      {
        id: 'trondheim_tjukk_l_palatalisering',
        label: 'Tjukk l og palatalisering',
        kind: 'structural_feature',
        claim: 'Tjukk l og palatalisering av historiske n- og l-lyder er sentrale dokumenterte trekk i Trondheim bymål.',
        time_scope: 'traditional_and_contemporary',
        source_urls: [S.trondheim_snl.url]
      },
      {
        id: 'trondheim_fin_brei',
        label: 'Historisk «fin-» og folkelig trøndersk',
        kind: 'social_variation',
        claim: 'Trondheim har historisk hatt sosialt markerte talemålsvarianter ofte omtalt som «fintrøndersk» og «breitrøndersk», men grensene mellom dem er ikke lenger homogene eller faste.',
        time_scope: 'historical_and_contemporary',
        source_urls: [S.trondheim_snl.url]
      },
      {
        id: 'trondheim_prestisjeendring',
        label: 'Prestisjehierarkiet er i endring',
        kind: 'language_change',
        claim: 'Den riksmålsnære «fintrønderske» varieteten har mistet terreng og prestisje, mens folkelig Trondheimsmål står sterkere blant unge enn tidligere.',
        time_scope: 'ongoing_change',
        source_urls: [S.trondheim_snl.url]
      },
      {
        id: 'trondheim_lydprove',
        label: 'Direkte dialektprøve',
        kind: 'corpus_basis',
        claim: 'NTNUs Nordavinden og sola-base har lyd, IPA/XSAMPA og ortografisk transkripsjon fra en informant som selv beskriver talemålet som Trondheim bymål.',
        time_scope: 'corpus_basis',
        source_urls: [S.trondheim_sample.url]
      }
    ]
  },
  tromso_local_speech: {
    feature_labels: ['e/a-mål', 'ikkje og æ(g)', 'no/nu-variasjon', 'språkkontakt og endring'],
    sources: [S.tromso_uit, S.tromso_uit_samples, S.troms_snl],
    feature_evidence: [
      {
        id: 'tromso_ea_mal',
        label: 'E/a-mål',
        kind: 'structural_feature',
        claim: 'Tradisjonell Tromsø-dialekt er et e/a-mål, med e-ending i infinitiv og a-ending i ubestemt entall av svake hunkjønnsord.',
        time_scope: 'traditional_and_contemporary',
        source_urls: [S.tromso_uit.url, S.tromso_uit_samples.url]
      },
      {
        id: 'tromso_ikkje_aeg',
        label: 'Ikkje og æ(g)',
        kind: 'structural_feature',
        claim: 'UiTs materiale registrerer tradisjonelt blant annet nektingsadverbet ikkje og førstepersonspronomenet æ(g) i Tromsø.',
        time_scope: 'traditional_and_contemporary',
        source_urls: [S.tromso_uit_samples.url]
      },
      {
        id: 'tromso_no_nu',
        label: 'Variasjon mellom no og nu',
        kind: 'social_variation',
        claim: 'Både eldre og yngre informanter i UiT-materialet varierer mellom tidsadverbene no og nu; variasjonen skal derfor ikke reduseres til én obligatorisk lokal form.',
        time_scope: 'contemporary_variation',
        source_urls: [S.tromso_uit.url]
      },
      {
        id: 'tromso_ikke_endring',
        label: 'Økende bruk av ikke blant ungdom',
        kind: 'language_change',
        claim: 'UiTs oversikt viser til forskning der formen ikke brukes mer av ungdom enn av eldre Tromsø-talere, selv om ikkje fortsatt er dokumentert i korpusmaterialet.',
        time_scope: 'ongoing_change',
        source_urls: [S.tromso_uit.url]
      },
      {
        id: 'tromso_smeltedigel',
        label: 'Dialektmøte og språkkontakt',
        kind: 'contact_history',
        claim: 'Tromsø beskrives som et sterkt dialektmøte- og språkkontaktmiljø, særlig som følge av omfattende tilflytting siden 1980-årene.',
        time_scope: 'contemporary_contact',
        source_urls: [S.tromso_uit.url, S.troms_snl.url]
      }
    ]
  }
};

const atlas = json(atlasPath);
for (const [id, materialized] of Object.entries(evidence)) {
  const row = (atlas.local_varieties || []).find(item => item.id === id);
  if (!row) throw new Error(`Mangler lokalprofil ${id}`);
  row.profile_status = 'evidence_materialized';
  row.evidence_last_verified = '2026-08-18';
  row.feature_labels = materialized.feature_labels;
  row.feature_evidence = materialized.feature_evidence;
  const byUrl = new Map([...(row.sources || []), ...materialized.sources].filter(Boolean).map(source => [source.url, source]));
  row.sources = [...byUrl.values()];
}
atlas.research_basis = atlas.research_basis || {};
atlas.research_basis.local_evidence_batches = [
  ...((atlas.research_basis.local_evidence_batches || []).filter(batch => batch.id !== 'local_evidence_batch_1')),
  {
    id: 'local_evidence_batch_1',
    verified_at: '2026-08-18',
    profile_ids: Object.keys(evidence),
    rule: 'Konkrete lokale trekk publiseres bare når påstanden har eksplisitt kildebelegg; historisk trekk, samtidssituasjon og endring holdes fra hverandre.'
  }
];
writeJson(atlasPath, atlas);

const schema = json(schemaPath);
const localItem = schema.properties.local_varieties.items;
const statuses = localItem.properties.profile_status.enum || [];
localItem.properties.profile_status.enum = [...new Set([...statuses, 'evidence_materialized'])];
localItem.properties.feature_labels = { type: 'array', items: { type: 'string', minLength: 1 } };
localItem.properties.evidence_last_verified = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
localItem.properties.feature_evidence = {
  type: 'array',
  minItems: 3,
  items: {
    type: 'object',
    required: ['id', 'label', 'kind', 'claim', 'time_scope', 'source_urls'],
    properties: {
      id: { type: 'string', minLength: 1 },
      label: { type: 'string', minLength: 1 },
      kind: { enum: ['structural_feature', 'social_variation', 'language_change', 'contact_history', 'corpus_basis'] },
      claim: { type: 'string', minLength: 20 },
      time_scope: { type: 'string', minLength: 1 },
      source_urls: { type: 'array', minItems: 1, items: { type: 'string', pattern: '^https://' } }
    },
    additionalProperties: false
  }
};
const materializedRule = {
  'x-history-go-rule': 'evidence-materialized',
  if: { properties: { profile_status: { const: 'evidence_materialized' } }, required: ['profile_status'] },
  then: { required: ['feature_labels', 'feature_evidence', 'evidence_last_verified'] }
};
localItem.allOf = [...(localItem.allOf || []).filter(rule => rule?.['x-history-go-rule'] !== 'evidence-materialized'), materializedRule];
writeJson(schemaPath, schema);

let runtime = read(runtimePath);
const templateNeedle = '          <div data-atlas-selection-features></div>\n';
const templateReplacement = '          <div data-atlas-selection-features></div>\n          <div class="hg-language-atlas-evidence" data-atlas-selection-evidence hidden></div>\n';
if (!runtime.includes('data-atlas-selection-evidence')) {
  if (!runtime.includes(templateNeedle)) throw new Error('Fant ikke atlas selection-template');
  runtime = runtime.replace(templateNeedle, templateReplacement);
}
const statusNeedle = '${row?.profile_status === "local_research_required" ? "Lokal research gjenstår" : "Lokal profil"}';
const statusReplacement = '${row?.profile_status === "local_research_required" ? "Lokal research gjenstår" : row?.profile_status === "evidence_materialized" ? "Dokumentert profil" : "Lokal profil"}';
if (!runtime.includes('Dokumentert profil')) {
  if (!runtime.includes(statusNeedle)) throw new Error('Fant ikke lokalprofil-status i runtime');
  runtime = runtime.replace(statusNeedle, statusReplacement);
}
const activateNeedle = '      const features = selection.querySelector("[data-atlas-selection-features]");\n      if (title) title.textContent = text(item?.name || macro?.name);\n      if (summary) summary.textContent = [text(local?.summary || region?.area_summary || item?.summary || macro?.summary), text(local?.variation_note)].filter(Boolean).join(" ");\n      if (features) features.innerHTML = list(item?.feature_labels).map(label => `<span>${esc(label)}</span>`).join("");\n      selection.hidden = false;';
const activateReplacement = '      const features = selection.querySelector("[data-atlas-selection-features]");\n      const evidence = selection.querySelector("[data-atlas-selection-evidence]");\n      if (title) title.textContent = text(item?.name || macro?.name);\n      if (summary) summary.textContent = [text(local?.summary || region?.area_summary || item?.summary || macro?.summary), text(local?.variation_note)].filter(Boolean).join(" ");\n      if (features) features.innerHTML = list(item?.feature_labels).map(label => `<span>${esc(label)}</span>`).join("");\n      if (evidence instanceof HTMLElement) {\n        const rows = list(local?.feature_evidence);\n        evidence.hidden = !rows.length;\n        evidence.innerHTML = rows.length ? `<strong>Dokumenterte målmerker og endringer</strong><ul>${rows.map(row => {\n          const links = list(row?.source_urls).map(url => safeHttpsUrl(url)).filter(Boolean);\n          return `<li><span>${esc(row?.label || row?.claim)}</span><p>${esc(row?.claim)}</p>${links.length ? `<div>${links.map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Kilde${links.length > 1 ? ` ${index + 1}` : ""} ↗</a>`).join("")}</div>` : ""}</li>`;\n        }).join("")}</ul>` : "";\n      }\n      selection.hidden = false;';
if (!runtime.includes('Dokumenterte målmerker og endringer')) {
  if (!runtime.includes(activateNeedle)) throw new Error('Fant ikke activateAtlasSelection-blokken');
  runtime = runtime.replace(activateNeedle, activateReplacement);
}
write(runtimePath, runtime);

let css = read(cssPath).replace(/\s+$/u, '');
const cssMarker = '/* local-evidence-materialized-v1 */';
if (!css.includes(cssMarker)) {
  css += `\n\n${cssMarker}\n.hg-language-atlas-evidence {\n  margin-top: 12px;\n  border-top: 1px solid currentColor;\n  padding-top: 10px;\n}\n\n.hg-language-atlas-evidence > strong {\n  display: block;\n  margin-bottom: 8px;\n}\n\n.hg-language-atlas-evidence ul {\n  display: grid;\n  gap: 10px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.hg-language-atlas-evidence li {\n  padding: 10px;\n  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);\n  border-radius: 10px;\n}\n\n.hg-language-atlas-evidence li > span {\n  font-weight: 700;\n}\n\n.hg-language-atlas-evidence li p {\n  margin: 4px 0 7px;\n}\n\n.hg-language-atlas-evidence li div {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n`;
}
write(cssPath, css);

let docs = read(docsPath).replace(/\s+$/u, '');
const docsMarker = '## Lokalt evidensmateriale';
if (!docs.includes(docsMarker)) {
  docs += `\n\n${docsMarker}\n\nLokale talemålsprofiler har tre modenhetsnivåer:\n\n- \`local_research_required\`: atlaset kjenner stedet/ankeret, men publiserer ikke konkrete lokale trekk ennå.\n- \`documented_seed\`: lokalprofilen har dokumentert eksistens og kildegrunnlag, men detaljtrekkene er ikke ferdig materialisert.\n- \`evidence_materialized\`: konkrete trekk, variasjon og/eller endringer er knyttet til eksplisitte kildebelegg i \`feature_evidence\`.\n\nEt \`feature_evidence\`-element skal skille mellom strukturelle trekk, sosial variasjon, språkendring, språkkontakt og korpusgrunnlag. Historiske trekk skal aldri presenteres som om alle nålevende talere bruker dem. Endring skal beskrives som endring, ikke som én ny homogen dialekt. Hver publisert påstand skal ha minst én HTTPS-kilde direkte knyttet til påstanden.\n\nFørste evidensmaterialiserte batch omfatter Oslo, Bergen, Stavanger, Trondheim og Tromsø fordi disse har særlig sterke kombinasjoner av direkte bymålsbeskrivelser, korpus/lydmateriale og sosiolingvistisk forskning. Utvalg i senere batcher skal fortsatt styres av dokumentasjonsstyrke, ikke av størrelse eller tilfeldige eksempler.\n`;
}
write(docsPath, docs);

let tests = read(testPath).replace(/\s+$/u, '');
const testMarker = 'Lokale talemålsprofiler materialiserer konkrete påstander med direkte kildebelegg';
if (!tests.includes(testMarker)) {
  tests += `\n\n\ntest("${testMarker}", () => {\n  const atlas = json("data/leksikon/sprak/norge_atlas_v1.json");\n  const schema = json("data/leksikon/sprak/atlas_schema_v1.json");\n  const runtime = read("js/ui/place-language-layer.js");\n  const contract = read("docs/SPRAKLEKSIKON.md");\n  const materializedIds = [\n    "oslo_local_speech",\n    "bergen_local_speech",\n    "stavanger_local_speech",\n    "trondheim_local_speech",\n    "tromso_local_speech"\n  ];\n  const locals = new Map((atlas.local_varieties || []).map(row => [row.id, row]));\n  for (const id of materializedIds) {\n    const row = locals.get(id);\n    assert.ok(row, \\`${id}: lokalprofil mangler\\`);\n    assert.equal(row.profile_status, "evidence_materialized", \\`${id}: skal være evidensmaterialisert\\`);\n    assert.match(String(row.evidence_last_verified || ""), /^\\d{4}-\\d{2}-\\d{2}$/);\n    assert.ok((row.feature_labels || []).length >= 4, \\`${id}: for få synlige målmerkelapper\\`);\n    assert.ok((row.feature_evidence || []).length >= 4, \\`${id}: for få beleggpunkter\\`);\n    assert.ok((row.sources || []).length >= 2, \\`${id}: evidensmaterialisert profil trenger minst to profilkilder\\`);\n    for (const item of row.feature_evidence || []) {\n      assert.ok(text(item.label), \\`${id}/${item.id}: label mangler\\`);\n      assert.ok(text(item.claim).length >= 20, \\`${id}/${item.id}: påstanden er for tynn\\`);\n      assert.ok(["structural_feature", "social_variation", "language_change", "contact_history", "corpus_basis"].includes(item.kind), \\`${id}/${item.id}: ukjent evidenstype\\`);\n      assert.ok((item.source_urls || []).length >= 1, \\`${id}/${item.id}: mangler direkte kilde\\`);\n      for (const url of item.source_urls || []) assert.ok(String(url).startsWith("https://"), \\`${id}/${item.id}: kilde må være HTTPS\\`);\n    }\n  }\n\n  assert.ok(locals.get("oslo_local_speech").feature_labels.includes("kløyvd infinitiv"));\n  assert.ok(locals.get("bergen_local_speech").feature_labels.includes("to grammatiske kjønn"));\n  assert.ok(locals.get("stavanger_local_speech").feature_labels.includes("skarre-r"));\n  assert.ok(locals.get("trondheim_local_speech").feature_labels.includes("jamvekt og apokope"));\n  assert.ok(locals.get("tromso_local_speech").feature_labels.includes("e/a-mål"));\n\n  assert.ok(schema.properties.local_varieties.items.properties.profile_status.enum.includes("evidence_materialized"));\n  assert.ok(schema.properties.local_varieties.items.properties.feature_evidence);\n  assert.match(runtime, /Dokumentert profil/);\n  assert.match(runtime, /data-atlas-selection-evidence/);\n  assert.match(runtime, /Dokumenterte målmerker og endringer/);\n  assert.match(contract, /evidence_materialized/);\n  assert.match(contract, /Historiske trekk skal aldri presenteres/i);\n});\n`;
}
write(testPath, tests);

run('python3', ['-m', 'json.tool', atlasPath]);
run('python3', ['-m', 'json.tool', schemaPath]);
run('node', ['--check', runtimePath]);
run('node', ['--test', testPath]);
run('node', ['--test', 'tests/place-language-layer.test.mjs']);
