import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));
const html = fs.readFileSync('fagverk.html', 'utf8');
const badgeUi = fs.readFileSync('js/fagverk-ia-v3-badge-progress.js', 'utf8');
const fallback = fs.readFileSync('js/merke-fallback.js', 'utf8');
const portalUi = fs.readFileSync('js/fagverk-forside.js', 'utf8');
const badgeIndex = fs.readFileSync('merker/merker.html', 'utf8');
const badgeIndexArchive = fs.readFileSync('merker/archive/merker_index_legacy_20260830.html', 'utf8');
const profile = fs.readFileSync('profile.html', 'utf8');
const byLegacy = fs.readFileSync('data/fag/by/merke_by.html', 'utf8');
const byLegacyArchive = fs.readFileSync('data/fag/by/archive/merke_by_full_teori_legacy_20260830.html', 'utf8');
const popularCultureLegacy = fs.readFileSync('data/fag/media/populaerkultur_som_mediefelt/merke_populaerkultur.html', 'utf8');
const compatibilityBySubject = new Map([
  ['by', byLegacy],
  ['historie', fs.readFileSync('data/fag/historie/merke_historie (1).html', 'utf8')],
  ['kunst', fs.readFileSync('data/fag/kunst/merke_kunst (2).html', 'utf8')],
  ['litteratur', fs.readFileSync('data/fag/litteratur/merke_litteratur (1).html', 'utf8')],
  ['media', fs.readFileSync('data/fag/media/merke_media.html', 'utf8')],
  ['musikk', fs.readFileSync('data/fag/musikk/merke_musikk (1).html', 'utf8')],
  ['naeringsliv', fs.readFileSync('data/fag/naeringsliv/merke_naeringsliv (1).html', 'utf8')],
  ['natur', fs.readFileSync('data/fag/natur/merke_natur (1).html', 'utf8')],
  ['psykologi', fs.readFileSync('data/fag/psykologi/merke_psykologi (1).html', 'utf8')],
  ['religion', fs.readFileSync('data/fag/religion/merke_religion.html', 'utf8')],
  ['scenekunst', fs.readFileSync('data/fag/scenekunst/merke_scenekunst.html', 'utf8')],
  ['sport', fs.readFileSync('data/fag/sport/merke_sport.html', 'utf8')],
  ['subkultur', fs.readFileSync('data/fag/subkultur/merke_subkultur.html', 'utf8')],
  ['vitenskap', fs.readFileSync('data/fag/vitenskap/merke_vitenskap (2).html', 'utf8')],
  ['filosofi', fs.readFileSync('data/fag/filosofi/merke_filosofi.html', 'utf8')],
  ['film_tv', fs.readFileSync('data/fag/TV_og_Film/merke_film_tv.html', 'utf8')],
  ['politikk', fs.readFileSync('data/fag/politikk/merke_politikk.html', 'utf8')]
]);
const MIGRATED = ['by', 'historie', 'kunst', 'litteratur', 'media', 'musikk', 'naeringsliv', 'natur', 'politikk', 'psykologi', 'religion', 'scenekunst', 'sport', 'subkultur', 'vitenskap', 'filosofi', 'film_tv'];

function runAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-badge-equivalence.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function gitBlob(content) {
  const body = Buffer.from(content, 'utf8');
  return crypto.createHash('sha1').update(Buffer.from(`blob ${body.length}\0`)).update(body).digest('hex');
}

function legacyBadgeHtmlFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['archive', 'arkiv'].includes(entry.name)) legacyBadgeHtmlFiles(file, files);
    } else if (/^merke.*\.html$/.test(entry.name)) {
      files.push(file.replaceAll(path.sep, '/'));
    }
  }
  return files;
}

test('badge equivalence audit klassifiserer alle canonicale fag uten ukjent familie', () => {
  const audit = runAudit();
  assert.equal(audit.rows.length, audit.canonicalSubjectCount);
  assert.equal(audit.counts.progress_route, audit.canonicalSubjectCount);
  assert.equal(audit.counts.rich_runtime ?? 0, 0);
  assert.equal(audit.counts.legacy_static_theory ?? 0, 0);
  assert.equal(audit.rows.some((row) => ['unknown', 'missing'].includes(row.family)), false);
});

test('generic fallback-fagene og ferdigmigrerte legacy-fag går til integrert Progresjon', () => {
  const byId = new Map(portal.categories.map((item) => [item.id, item]));
  for (const id of ['helse', 'utdanning', ...MIGRATED]) assert.equal(byId.get(id).badgePage, `fagverk.html?subject=${id}#fagverkIaProgresjon`);
  assert.equal(portal.categories.some((item) => String(item.badgePage).startsWith('merke.html?badge=')), false);
});

test('Fagverk Progresjon overtar badgeidentitet, nivåstige, undermerker og fagets Knowledge-inngang', () => {
  assert.match(html, /href="css\/fagverk-ia-v3-badge-progress\.css"/);
  assert.match(html, /src="js\/fagverk-ia-v3\.js"[\s\S]*src="js\/fagverk-ia-v3-badge-progress\.js"/);
  assert.match(badgeUi, /data\/badges\/\$\{encodeURIComponent\(model\.subject\.id\)\}\.json/);
  assert.match(badgeUi, /badge\?\.description/);
  assert.match(badgeUi, /badge\?\.tiers/);
  assert.match(badgeUi, /badge\?\.sub/);
  assert.match(badgeUi, /place\?\.source/);
  assert.match(badgeUi, /progress\.visited\?\.has/);
  assert.match(badgeUi, /Nivåstige/);
  assert.match(badgeUi, /Undermerker/);
  assert.match(badgeUi, /knowledge\.html\?subject=\$\{encodeURIComponent\(model\.subject\.id\)\}/);
  assert.match(badgeUi, /Åpne fagets kunnskapsprofil →/);
  assert.doesNotMatch(badgeUi, /localStorage\.setItem|sessionStorage\.setItem|indexedDB/);
});

test('den gamle generiske merke-URL-en er compatibility-redirect, ikke en ny produktflate', () => {
  assert.match(fallback, /global\.location\.replace\(target\)/);
  assert.match(fallback, /#fagverkIaProgresjon/);
  assert.match(fallback, /subjectStatus\)!=='materialized'/);
  assert.doesNotMatch(fallback, /genericBadgeTiers|genericBadgeProgress|renderSubjectAction/);
});

test('gamle direkte URL-er er compatibility-redirects etter arkivering', () => {
  const forbiddenBySubject = {
    by: /merke-blokk|<h2>1\. Felt<\/h2>|id="begreper"/i,
    historie: /id="felt"|id="begreper"/,
    kunst: /id="felt"|id="offentlig-rom"/,
    litteratur: /id="felt"|id="begreper"/,
    media: /id="felt"|id="begreper"|id="bidrag"/,
    musikk: /merke-blokk|sekundærbadge|<h2>1\. Felt<\/h2>/i,
    naeringsliv: /merke-blokk|<h2>1\. Felt<\/h2>|profesjonalitet|offshoring/i,
    natur: /merke-blokk|Alle tolv Natur-områder|Natur blir ikke tildelt|Tolv canonicale fagområder|Slik arbeider Natur|Hva teller som belegg\?/i,
    psykologi: /Hva er dette feltet\?|Kobling til din kunnskap|psykoanalyse til kognitiv psykologi/i,
    religion: /Religionsfaget samler|kildebasert og respektfullt studieløp/,
    scenekunst: /Teater, dans, musikal, revy|scenografi, regi, dramaturgi/,
    sport: /merke-blokk|SPORT & LEK\s*[–-]\s*full teoretisk beskrivelse|<h2>1\. Felt<\/h2>|Groundhopper-logikk/i,
    subkultur: /merke-blokk|SUBKULTUR\s*[–-]\s*full teoretisk beskrivelse|<h2>1\. Felt<\/h2>|id="begreper"/i,
    vitenskap: /merke-blokk|VITENSKAP\s*&\s*TEKNOLOGI\s*[–-]\s*full teoretisk beskrivelse|<h2>1\. Felt<\/h2>|emner-vitenskap/i,
    filosofi: /Kjerneområder|Eget faggrunnlag|argumentasjon, logikk og begrepsanalyse/,
    film_tv: /merke-blokk|FILM\s*&\s*TV\s*[–-]\s*full teoretisk beskrivelse|<h2>1\. Felt<\/h2>|id="begreper"/i,
    politikk: /politikk-fagportal\.js|politikkEmneProgress|politikkQuizHistory|politikkConcepts/i
  };
  for (const [subject, source] of compatibilityBySubject) {
    assert.match(source, /location\.replace/);
    assert.match(source, new RegExp(`subject=${subject}#fagverkIaProgresjon`));
    assert.doesNotMatch(source, forbiddenBySubject[subject]);
  }
});

test('direkte legacy-inventar har bare Populærkultur-underfeltet igjen som innholdsflate', () => {
  const fullContentRoutes = legacyBadgeHtmlFiles('data/fag')
    .filter((file) => !/location\.replace/.test(fs.readFileSync(file, 'utf8')))
    .sort();
  assert.deepEqual(fullContentRoutes, [
    'data/fag/media/populaerkultur_som_mediefelt/merke_populaerkultur.html'
  ]);
});

test('Fagverkforsiden skjuler compatibility-lenken når merket allerede er integrert i Progresjon', () => {
  assert.match(portalUi, /integratedBadgeRoute = subjectReady && badgePage === `\$\{subjectPage\}#fagverkIaProgresjon`/);
  assert.match(portalUi, /badgePage && !integratedBadgeRoute/);
  assert.match(portalUi, /class="fagverk-portal-compat"/);
});

test('den separate merkeindeksen er bytearkivert og gammel URL går til Fagverket', () => {
  assert.equal(gitBlob(badgeIndexArchive), 'bb0cf746552d671d4341da198c210b41bacc55d1');
  assert.equal((badgeIndexArchive.match(/class="merke-kort"/g) || []).length, 18);
  assert.match(badgeIndexArchive, /data\/fag\/populaerkultur\/merke_populaerkultur\.html/);
  assert.match(badgeIndex, /rel="canonical" href="\.\.\/fagverk-forside\.html"/);
  assert.match(badgeIndex, /location\.replace\('\.\.\/fagverk-forside\.html'\)/);
  assert.doesNotMatch(badgeIndex, /class="merke-kort"|populaerkultur|subject=/);
  assert.doesNotMatch(profile, /href="merker\/merker\.html"/);
  assert.match(profile, /href="fagverk-forside\.html"[^>]*>Utforsk alle fag og merker/);
  assert.match(profile, /href="fagverk-forside\.html">Fagverket<\/a>/);
  assert.equal(gitBlob(byLegacyArchive), 'bdc5ffef999db78ab2670571615f7fcf1327216f');
  assert.doesNotMatch(byLegacy, /href="\.\.\/\.\.\/\.\.\/merker\/merker\.html"/);
  assert.doesNotMatch(popularCultureLegacy, /href="\.\.\/\.\.\/\.\.\/merker\/merker\.html"/);
  assert.match(popularCultureLegacy, /href="\.\.\/\.\.\/\.\.\/fagverk\.html\?subject=media"/);
});

test('Politikk rich runtime og all canonical legacy static theory er pensjonert', () => {
  const audit = runAudit();
  const politics = audit.rows.find((row) => row.id === 'politikk');
  assert.equal(politics.family, 'progress_route');
  assert.equal(politics.equivalence, 'complete');
  for (const id of MIGRATED) {
    const migrated = audit.rows.find((row) => row.id === id);
    assert.equal(migrated.family, 'progress_route');
    assert.equal(migrated.equivalence, 'complete');
    assert.equal(migrated.action, 'already_migrated');
  }
  assert.equal(audit.rows.filter((row) => row.family === 'legacy_static_theory').length, 0);
});
