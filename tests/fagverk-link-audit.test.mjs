import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const exists = (file) => fs.existsSync(path.join(repoRoot, file));

function cleanLocalReference(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.startsWith('#')) return '';
  if (/^(?:https?:|mailto:|tel:|javascript:|data:|blob:)/i.test(raw)) return '';
  return raw.split('#')[0].split('?')[0];
}

function resolveHtmlReference(pageFile, baseHref, reference) {
  let local = cleanLocalReference(reference);
  if (!local) return '';

  if (local.startsWith('/History-Go/')) local = local.slice('/History-Go/'.length);
  else if (local.startsWith('/')) local = local.slice(1);

  const pageDir = path.posix.dirname(pageFile);
  const baseDir = baseHref
    ? path.posix.normalize(path.posix.join(pageDir, baseHref))
    : pageDir;
  let resolved = path.posix.normalize(path.posix.join(baseDir, local));
  while (resolved.startsWith('../')) resolved = resolved.slice(3);
  if (resolved.endsWith('/')) resolved += 'index.html';
  return resolved;
}

function htmlReferences(file) {
  const html = read(file);
  const baseHref = html.match(/<base\b[^>]*\bhref=["']([^"']+)["']/i)?.[1] || '';
  const refs = [];
  const tagPattern = /<(a|link|script|img)\b[^>]*?\b(?:href|src)=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(tagPattern)) {
    refs.push({ tag: match[1].toLowerCase(), value: match[2] });
  }
  return { baseHref, refs };
}

for (const page of [
  'fagverk-forside.html',
  'fagverk.html',
  'fagverk-sted.html',
  'merke.html',
  'data/fag/politikk/merke_politikk.html'
]) {
  test(`${page} har bare gyldige lokale lenker og ressurser`, () => {
    const { baseHref, refs } = htmlReferences(page);
    const missing = [];
    for (const ref of refs) {
      const resolved = resolveHtmlReference(page, baseHref, ref.value);
      if (resolved && !exists(resolved)) missing.push(`${ref.tag}: ${ref.value} -> ${resolved}`);
    }
    assert.deepEqual(missing, []);
  });
}

test('runtime-manifestets filer og ruter finnes', () => {
  const manifest = json('data/fag/politikk/politikk_runtime_manifest.json');
  for (const [role, file] of Object.entries(manifest.sourceOfTruth || {})) {
    assert.ok(exists(file), `${role}: ${file}`);
  }
  for (const [role, route] of Object.entries(manifest.routes || {})) {
    const file = String(route).replace(/\{[^}]+\}/g, 'example').split('?')[0].split('#')[0];
    assert.ok(exists(file), `${role}: ${route}`);
  }
});

test('fagverkregisterets kapitler, moduler og eksterne kilder er gyldige', () => {
  const registry = json('data/fagverk/fagverk_registry.json');
  for (const [subjectId, subject] of Object.entries(registry.subjects || {})) {
    for (const chapterMeta of subject.chapters || []) {
      assert.ok(exists(chapterMeta.file), `${subjectId}/${chapterMeta.id}: ${chapterMeta.file}`);
      const chapter = json(chapterMeta.file);
      for (const moduleFile of chapter.moduleFiles || []) {
        assert.ok(exists(moduleFile), `${chapterMeta.id}: ${moduleFile}`);
        const module = json(moduleFile);
        for (const source of module.sources || []) {
          assert.doesNotThrow(() => {
            const url = new URL(source.url);
            assert.ok(['http:', 'https:'].includes(url.protocol));
          }, `${moduleFile}: ${source.url}`);
        }
      }
      for (const source of chapter.sources || []) {
        assert.doesNotThrow(() => {
          const url = new URL(source.url);
          assert.ok(['http:', 'https:'].includes(url.protocol));
        }, `${chapterMeta.file}: ${source.url}`);
      }
    }
  }
});

test('headerens to læringsinnganger peker til forskjellige eksisterende sider', () => {
  const header = read('js/ui/header-menu.js');
  assert.match(header, /id:\s*"btnFagverk"[\s\S]*?href:\s*"fagverk-forside\.html"/);
  assert.match(header, /id:\s*"btnKnowledge"[\s\S]*?href:\s*"knowledge\.html"/);
  assert.ok(exists('fagverk-forside.html'));
  assert.ok(exists('knowledge.html'));
  assert.notEqual('fagverk-forside.html', 'knowledge.html');
});

test('fagverkportalen skiller merkesider fra materialiserte fagsider', () => {
  const portal = json('data/fagverk/fagverk_portal.json');
  for (const item of portal.categories || []) {
    assert.ok(item.badgePage, `${item.id}: badgePage`);
    assert.ok(exists(cleanLocalReference(item.badgePage)), `${item.id}: ${item.badgePage}`);
    if (item.subjectStatus === 'materialized') {
      assert.ok(item.subjectPage, `${item.id}: subjectPage`);
      assert.ok(exists(cleanLocalReference(item.subjectPage)), `${item.id}: ${item.subjectPage}`);
      assert.notEqual(item.badgePage, item.subjectPage, `${item.id}: merke og fag må være ulike mål`);
    }
  }
});

test('alle hardkodede fagverkruter i politikkmodellen har eksisterende mål', () => {
  const model = read('js/politikk-fag-model.js');
  const expectedTargets = [
    'fagverk.html',
    'fagverk-sted.html'
  ];
  for (const target of expectedTargets) {
    assert.ok(model.includes(target), target);
    assert.ok(exists(target), target);
  }
});
