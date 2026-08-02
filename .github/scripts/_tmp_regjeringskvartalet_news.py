import json
from pathlib import Path

LEKSIKON_PATH = Path("data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json")
REPORT_PATH = Path("reports/place-production/regjeringskvartalet-politikk-v1.md")
TEST_PATH = Path("tests/regjeringskvartalet-news-phase.test.mjs")

NEWS_IDS = {
    "regjeringskvartalet_nyhet_g_blokka_forprosjekt_2026",
    "regjeringskvartalet_nyhet_kunstmarkering_2026",
}

articles = json.loads(LEKSIKON_PATH.read_text(encoding="utf-8"))
articles = [article for article in articles if article.get("id") not in NEWS_IDS]
articles.extend(
    [
        {
            "id": "regjeringskvartalet_nyhet_g_blokka_forprosjekt_2026",
            "place_id": "regjeringskvartalet",
            "type": "news_note",
            "category": "nyere_notis",
            "title": "Forprosjektering av G-blokka er i gang",
            "year": 2026,
            "date": "2026-01-29",
            "popupDesc": "Regjeringen opplyste 29. januar 2026 at forprosjekteringen av G-blokka var startet med en bevilgning på 140 millioner kroner.",
            "wikiText": [
                "Målet er å utrede hvordan regjeringsbygningen fra 1906 kan rehabiliteres og fortsatt brukes av Finansdepartementet og et ekstra departement. Arbeidet er del av byggetrinn 2 del II.",
                "Forprosjektet er planlagt ferdigstilt i løpet av 2026 før regjeringen legger fram sin vurdering for Stortinget. Notisen dokumenterer bevilgningen og et pågående forprosjekt, ikke at rehabiliteringen er vedtatt, startet eller ferdig.",
            ],
            "summary": {
                "one_liner": "140 millioner kroner ble satt av til et pågående forprosjekt for rehabilitering og videre bruk av G-blokka.",
                "themes": ["forprosjekt", "G-blokka", "statlig eiendomsforvaltning"],
                "tone": ["nøktern", "prosessavgrenset"],
            },
            "sources": [
                {
                    "label": "Regjeringen.no – Forprosjektering av G-blokka er i gang",
                    "url": "https://www.regjeringen.no/no/aktuelt/forprosjektering-av-g-blokka-finansdepartementet-er-i-gang/id3147551/",
                }
            ],
            "source_checked_at": "2026-08-02",
            "reporting_period": "januar–desember 2026",
            "classification": {
                "source_quality": "official_primary",
                "temporal_status": "ongoing",
                "quiz_use": "none",
            },
        },
        {
            "id": "regjeringskvartalet_nyhet_kunstmarkering_2026",
            "place_id": "regjeringskvartalet",
            "type": "news_note",
            "category": "nyere_notis",
            "title": "Kunsten i kvartalet ble markert med åpent arrangement",
            "year": 2026,
            "date": "2026-06-06",
            "popupDesc": "Mer enn 600 mennesker deltok da KORO markerte kunsten i det nye Regjeringskvartalet 6. juni 2026.",
            "wikiText": [
                "KORO opplyste etter arrangementet at over 300 kunstverk av bortimot 150 kunstnere var montert gjennom vinteren og våren 2026. Markeringen samlet musikk, performance, teater og kunst i uterommene.",
                "Notisen gjelder det åpne kunstarrangementet og den dokumenterte monteringsstatusen i første byggetrinn. Den betyr ikke at hele kunstprogrammet eller alle senere byggetrinn i Regjeringskvartalet er ferdige.",
            ],
            "summary": {
                "one_liner": "Et åpent arrangement 6. juni samlet over 600 deltakere rundt mer enn 300 monterte kunstverk.",
                "themes": ["offentlig kunst", "arrangement", "åpent byrom"],
                "tone": ["datert", "avgrenset"],
            },
            "sources": [
                {
                    "label": "KORO – Strålende markering av kunsten i Regjeringskvartalet",
                    "url": "https://koro.no/stralende-markering-av-kunsten-i-regjeringskvartalet-6-juni/",
                }
            ],
            "source_checked_at": "2026-08-02",
            "reporting_period": "juni 2026",
            "classification": {
                "source_quality": "official_primary",
                "temporal_status": "completed",
                "quiz_use": "none",
            },
        },
    ]
)
LEKSIKON_PATH.write_text(json.dumps(articles, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

report = REPORT_PATH.read_text(encoding="utf-8")
replacements = {
    "- Status: **fase 4 – lisenskontrollert Før/etter-par klart for review; stedet er ikke samlet produksjonsklart**": "- Status: **fase 5 – to daterte Nyheter-notiser klare for review; stedet er ikke samlet produksjonsklart**",
    "| Leksikon | Fire manifestlastede artikler finnes. Hovedartikkelen er versjon 2 med tre fakta og tolv kildebelagte chronology-punkter fra 1883 til juli 2026. |": "| Leksikon | Fire tematiske artikler og to `news_note`-records finnes. Hovedartikkelen er versjon 2 med tre fakta og tolv kildebelagte chronology-punkter fra 1883 til juli 2026. |",
    "| Nyheter | Ingen daterte `news_note`-records for stedet er funnet i den manifestlastede Leksikon-filen. |": "| Nyheter | To daterte og stedsspesifikke `news_note`-records dekker G-blokkas pågående forprosjekt og den gjennomførte kunstmarkeringen 6. juni 2026. |",
    "| Nyheter | MANGLER | Ingen stedsspesifikke `news_note`-records finnes. |": "| Nyheter | PASS – fase 5 | To notiser skiller et pågående forprosjekt fra et gjennomført arrangement og dupliserer ikke åpningene 13. april, 19. juli eller 22. juli fra chronology. |",
    "- Nyheter med daterte nåtidsrecords og tydelig skille mellom gjennomført, pågående og planlagt;\n": "",
    "- fire Leksikon-artikler som innholdsgrunnlag.": "- fire tematiske Leksikon-artikler som innholdsgrunnlag;\n- to daterte Nyheter-notiser med eksplisitt `ongoing`/`completed`-status.",
    "| 4 | Før/etter | **KLAR FOR REVIEW** |": "| 4 | Før/etter | **GODKJENT – PR #4667, merge `dd31ba5d7852eba372c82477e9fc40a5f563b5ca`** |",
    "| 5 | Nyheter | **NESTE AKTIVE FASE ETTER MERGE AV FASE 4** |": "| 5 | Nyheter | **KLAR FOR REVIEW** |",
    "| 6 | Lesespor | IKKE STARTET |": "| 6 | Lesespor | **NESTE AKTIVE FASE ETTER MERGE AV FASE 5** |",
}
for old, new in replacements.items():
    if old not in report:
        raise SystemExit(f"Mangler forventet rapporttekst: {old}")
    report = report.replace(old, new, 1)

marker = "## Neste aktive fase\n"
if marker not in report:
    raise SystemExit("Mangler Neste aktive fase-seksjon")
report = report.split(marker, 1)[0].rstrip() + """

## Resultat i fase 5

- To `news_note`-records er lagt i den eksisterende manifestlastede Leksikon-filen.
- G-blokka-notisen dokumenterer bevilgningen på 140 millioner kroner og at forprosjekteringen var i gang 29. januar 2026. Den hevder ikke at rehabiliteringen er besluttet eller gjennomført.
- Kunstnotisen dokumenterer det åpne arrangementet 6. juni 2026, mer enn 600 deltakere og KOROs opplysning om over 300 monterte verk av bortimot 150 kunstnere.
- Begge notiser bruker navngitte offisielle HTTPS-kilder, er kontrollert 2. august 2026 og er eksplisitt uten quizbruk.
- Åpningen av byggetrinn 1 den 13. april og åpningene av minnestedet og 22. juli-senteret den 19. og 22. juli eies fortsatt av chronology og er ikke duplisert som nyhetskort.
- Ingen canonical place-, Story-, Quiz-, Knowledge-, People-, Lesespor-, manifest-, bilde- eller runtimefil er endret.

## Neste aktive fase

Etter at fase 5 er merget og kontrollert på faktisk `main`, starter **fase 6: Lesespor**.

Fasen skal:

1. velge et lite antall åpne, komplementære `link_only`-ressurser som tilfører noe utover Leksikon og Nyheter;
2. knytte hvert spor eksplisitt til `regjeringskvartalet` i den manifestlastede Politikk-filen;
3. prioritere offisielle prosjekt-, kunst-, minne- og forvaltningsressurser uten å duplisere Kilder-fanen;
4. kontrollere lenkestatus, label, språk, type og stedskobling;
5. oppdatere Lesespor-data, fasekort og målrettet regresjon uten å endre runtime dersom den eksisterende kontrakten holder.

## Samlet status etter fase 5

Regjeringskvartalet har et sterkt faglig grunnlag, men er **ikke produksjonsklart etter den canonicale sted-for-sted-checklista**. Om-grunnlag, Historie, Stories, Før/etter, Nyheter, Quiz/Knowledge og People er nå produsert eller reviewet. Lesespor, brukerrettede Kilder, Mer, Objects, Brands og sluttkontroll av Badges, fagverk og faktisk UI står fortsatt åpne.
"""
REPORT_PATH.write_text(report, encoding="utf-8")

TEST_PATH.write_text(
    """import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const leksikonPath = 'data/leksikon/places/oslo/politikk/leksikon_regjeringskvartalet.json';
const articles = readJson(leksikonPath);
const news = articles.filter(article => article.place_id === 'regjeringskvartalet' && article.type === 'news_note');
const mainArticle = articles.find(article => article.id === 'regjeringskvartalet_hovedartikkel');
const runtime = fs.readFileSync('js/ui/place-popup-tabs.js', 'utf8');
const report = fs.readFileSync('reports/place-production/regjeringskvartalet-politikk-v1.md', 'utf8');

test('Regjeringskvartalet har to daterte og stedsspesifikke Nyheter-notiser', () => {
  assert.equal(news.length, 2);
  assert.deepEqual(news.map(item => item.id), [
    'regjeringskvartalet_nyhet_g_blokka_forprosjekt_2026',
    'regjeringskvartalet_nyhet_kunstmarkering_2026'
  ]);
  assert.ok(news.every(item => item.category === 'nyere_notis'));
  assert.ok(news.every(item => item.year === 2026));
  assert.ok(news.every(item => item.source_checked_at === '2026-08-02'));
  assert.ok(news.every(item => item.classification?.source_quality === 'official_primary'));
  assert.ok(news.every(item => item.classification?.quiz_use === 'none'));
});

test('Notisene skiller pågående prosess fra gjennomført arrangement', () => {
  const byId = new Map(news.map(item => [item.id, item]));
  const gBlock = byId.get('regjeringskvartalet_nyhet_g_blokka_forprosjekt_2026');
  assert.equal(gBlock.date, '2026-01-29');
  assert.equal(gBlock.classification.temporal_status, 'ongoing');
  assert.match(gBlock.popupDesc, /140 millioner kroner/);
  assert.match(gBlock.wikiText.join(' '), /ikke at rehabiliteringen er vedtatt, startet eller ferdig/);

  const art = byId.get('regjeringskvartalet_nyhet_kunstmarkering_2026');
  assert.equal(art.date, '2026-06-06');
  assert.equal(art.classification.temporal_status, 'completed');
  assert.match(art.popupDesc, /Mer enn 600 mennesker/);
  assert.match(art.wikiText.join(' '), /over 300 kunstverk av bortimot 150 kunstnere/);
  assert.match(art.wikiText.join(' '), /ikke at hele kunstprogrammet eller alle senere byggetrinn/);
});

test('Åpningsdatoene forblir i chronology og dupliseres ikke som Nyheter', () => {
  assert.ok(mainArticle);
  assert.ok(mainArticle.chronology.some(item => item.id === 'chrono_rkv_2026_04'));
  assert.ok(mainArticle.chronology.some(item => item.id === 'chrono_rkv_2026_07'));
  assert.equal(news.some(item => ['2026-04-13', '2026-07-19', '2026-07-22'].includes(item.date)), false);
  assert.equal(news.some(item => /offisielt åpnet|minnestedet åpnet|22\\. juli-senteret åpnet/i.test(item.title)), false);
});

test('Nyheter bruker navngitte offisielle HTTPS-kilder og eksisterende runtime', () => {
  const allowedHosts = new Set(['www.regjeringen.no', 'koro.no']);
  for (const item of news) {
    assert.equal(item.sources.length, 1);
    const source = item.sources[0];
    assert.ok(source.label);
    assert.ok(URL.canParse(source.url));
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.ok(allowedHosts.has(new URL(source.url).hostname));
    assert.equal(item.externalLinks, undefined);
  }
  assert.match(runtime, /function newsCards\\(items\\)/);
  assert.match(runtime, /list\\(item\\?\\.sources\\)\\[0\\]/);
  assert.match(runtime, /class="hg-place-news-source"/);
  assert.match(runtime, /rel="noopener noreferrer"/);
});

test('Fasekortet lukker Før/etter og åpner bare Lesespor som neste fase', () => {
  assert.match(report, /\\| 4 \\| Før\\/etter \\| \\*\\*GODKJENT – PR #4667, merge `dd31ba5d7852eba372c82477e9fc40a5f563b5ca`\\*\\* \\|/);
  assert.match(report, /\\| Nyheter \\| PASS – fase 5 \\|/);
  assert.match(report, /\\| 5 \\| Nyheter \\| \\*\\*KLAR FOR REVIEW\\*\\* \\|/);
  assert.match(report, /\\| 6 \\| Lesespor \\| \\*\\*NESTE AKTIVE FASE ETTER MERGE AV FASE 5\\*\\* \\|/);
  assert.match(report, /Åpningen av byggetrinn 1 den 13\\. april.*ikke duplisert som nyhetskort/s);
  assert.match(report, /ikke produksjonsklart/);
});
""",
    encoding="utf-8",
)
