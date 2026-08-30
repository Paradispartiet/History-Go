import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditMediaPhase3 } from './audit-fagverk-media-phase3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ACTIVE = 'data/fag/media/populaerkultur_som_mediefelt/merke_populaerkultur.html';
const ARCHIVE = 'data/fag/media/populaerkultur_som_mediefelt/archive/merke_populaerkultur_full_teori_legacy_20260830.html';
const ADJUDICATION = 'data/fag/media/populaerkultur_legacy_theory_adjudication_v1.json';
const MANIFEST = 'data/fag/fag_manifest.json';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const DEAD_STYLESHEET = 'merker/merker.css';
const ORIGINAL_BLOB_SHA = '737ea0dd1a8233d108877d8b58030ba96417c43d';
const TARGET = 'fagverk.html?subject=media#fagverkIaEmner';
const RELATIVE_TARGET = '../../../../fagverk.html?subject=media#fagverkIaEmner';
const CANONICAL_FILES = Object.freeze([
  'data/fag/media/populaerkultur_som_mediefelt/populaerkulturpensum_canonical_v4_5.json',
  'data/fag/media/emner_media_populaerkultur_canonical_v4_5.json',
  'data/fag/media/populaerkultur_som_mediefelt/fagkart_populaerkultur_canonical_v4_5.json',
  'data/fag/media/methods_media_canonical_v4_5.json',
  'data/fag/media/populaerkultur_som_mediefelt/emnemapping_populaerkultur_canonical_v4_5.json'
]);
const SECTION_POLICY = Object.freeze({
  felt: { role: 'knowledge', anchors: [
    ['massemedier'], ['film'], ['tv'], ['spill'], ['internettfenomen'], ['kjendis'],
    ['humor'], ['reklame'], ['meme'], ['ikonisk'], ['sirkulasjon']
  ] },
  normativ: { role: 'knowledge', anchors: [
    ['underholdning'], ['siterbarhet'], ['aktualitet'], ['visuell slagkraft'], ['normanalyse'], ['oppmerksomhet']
  ] },
  doxa: { role: 'knowledge', anchors: [
    ['underholdning'], ['kropp'], ['kjønn'], ['språk'], ['relasjon'], ['humor'], ['suksess'], ['fantasi']
  ] },
  metode: { role: 'knowledge', anchors: [
    ['symbol- og motivanalyse', 'symbol og motivanalyse'], ['klisje'], ['formatanalyse'], ['trend'],
    ['seertall'], ['plattformanalyse'], ['algoritme'], ['oppmerksomhetsanalyse'], ['representasjonsanalyse']
  ] },
  materiell: { role: 'knowledge', anchors: [
    ['studio'], ['plattform'], ['distribusjonsnettverk'], ['spillstudio'], ['kino'], ['scene'], ['reklame'], ['merch']
  ] },
  sosial: { role: 'knowledge', anchors: [
    ['fandom'], ['influenceranalyse'], ['programleder'], ['komiker'], ['skuespiller'], ['produksjon'],
    ['anbefaling'], ['plattformøkonomi'], ['remix'], ['meme']
  ] },
  geografisk: { role: 'knowledge', anchors: [
    ['studio'], ['kino'], ['scene'], ['filmlokasjon'], ['bydel'], ['sted'], ['kulisse']
  ] },
  temporal: { role: 'knowledge', anchors: [
    ['mediehistorisk'], ['streaming'], ['plattformhistorisk'], ['viralitet'], ['nostalgi'], ['generasjon']
  ] },
  blindsoner: { role: 'knowledge', anchors: [
    ['algoritmisk synlighet'], ['oppmerksomhetsøkonomi'], ['hype'], ['skandale'], ['representasjon'],
    ['usynlig arbeid'], ['moderering']
  ] },
  begreper: { role: 'knowledge', anchors: [
    ['sirkulasjon'], ['massemedier'], ['ikon'], ['identitet'], ['narrativ'], ['medier'], ['algoritme'], ['trend']
  ] },
  bidrag: { role: 'legacy_product_copy', anchors: [] }
});

const abs = (file) => path.join(ROOT, file);
const exists = (file) => fs.existsSync(abs(file));
const read = (file) => fs.readFileSync(abs(file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const text = (value) => String(value == null ? '' : value).trim();
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function blobSha(buffer) {
  return crypto.createHash('sha1').update(Buffer.from(`blob ${buffer.length}\0`)).update(buffer).digest('hex');
}

function decodeEntities(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&#039;', "'").replaceAll('&nbsp;', ' ');
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalize(value) {
  return text(value).toLocaleLowerCase('nb-NO').normalize('NFKC')
    .replace(/[«»“”„"'’`´]/g, '')
    .replace(/[^a-zæøå0-9]+/gi, ' ')
    .replace(/\s+/g, ' ').trim();
}

function flattenStrings(value, output = []) {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) for (const item of value) flattenStrings(item, output);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) flattenStrings(item, output);
  return output;
}

function extractSections(html) {
  const sections = [];
  for (const match of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)) {
    const className = match[1].match(/class=["']([^"']+)["']/i)?.[1] || '';
    if (!className.split(/\s+/).includes('merke-blokk')) continue;
    const id = match[1].match(/id=["']([^"']+)["']/i)?.[1] || '';
    if (id) sections.push({ id, text: stripHtml(match[2]) });
  }
  return sections;
}

function walkHtml(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'reports') continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['archive', 'arkiv'].includes(entry.name)) walkHtml(file, output);
    } else if (entry.name.endsWith('.html')) output.push(file);
  }
  return output;
}

function resolvedHtmlReferences(targetFile) {
  const target = path.resolve(abs(targetFile));
  const references = [];
  for (const htmlFile of walkHtml(ROOT)) {
    const source = fs.readFileSync(htmlFile, 'utf8');
    for (const match of source.matchAll(/\bhref=["']([^"']+)["']/gi)) {
      const href = decodeEntities(match[1]).split(/[?#]/)[0];
      if (!href || href.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
      if (path.resolve(path.dirname(htmlFile), href) === target) {
        references.push(path.relative(ROOT, htmlFile).replaceAll(path.sep, '/'));
      }
    }
  }
  return [...new Set(references)].sort();
}

export function auditMediaPopularCultureRetirement() {
  for (const file of [ACTIVE, ARCHIVE, ADJUDICATION, MANIFEST, CATEGORY_CONTRACT, PORTAL, ...CANONICAL_FILES]) {
    assert(exists(file), `Mangler Populærkultur-retirementfil: ${file}`);
  }
  const archiveBlobSha = blobSha(fs.readFileSync(abs(ARCHIVE)));
  assert(archiveBlobSha === ORIGINAL_BLOB_SHA, `Populærkultur-arkivet har feil blob: ${archiveBlobSha}`);

  const activeHtml = read(ACTIVE);
  assert(activeHtml.includes('location.replace(target)') && activeHtml.includes(RELATIVE_TARGET), 'Compatibility-ruten peker ikke til Media-emner.');
  assert(activeHtml.includes(`rel="canonical" href="${RELATIVE_TARGET}"`), 'Compatibility-ruten mangler canonical Media-mål.');
  assert(!/merke-blokk|<h2>1\. Felt<\/h2>|id=["']begreper["']/i.test(activeHtml), 'Compatibility-ruten inneholder fortsatt legacy-teori.');

  const manifest = readJson(MANIFEST);
  const contract = readJson(CATEGORY_CONTRACT);
  const portal = readJson(PORTAL);
  const supplement = manifest.media?.supplements?.populaerkultur_som_mediefelt;
  assert(supplement?.status === 'migrated_subfield' && supplement?.root === 'media/populaerkultur_som_mediefelt', 'Manifestet eier ikke Populærkultur som migrert Media-delfelt.');
  assert(contract.aliases?.populaerkultur === 'media' && contract.aliases?.popkultur === 'media', 'Category-contracten mangler Media-aliasene.');
  assert(/Ikke eget domene/.test(contract.decisions?.populaerkultur || ''), 'Category-contracten tillater feilaktig Populærkultur som toppdomene.');
  assert(!portal.categories?.some((row) => ['populaerkultur', 'popkultur'].includes(row.id)), 'Populærkultur har konkurrerende portalpost.');
  assert(portal.categories?.some((row) => row.id === 'media' && row.subjectPage === 'fagverk.html?subject=media'), 'Canonical Media-portal mangler.');

  const { report: mediaReport } = auditMediaPhase3();
  assert(mediaReport.gates?.popularCulturePreservedAsCompleteNestedField === true, 'Media Phase 3 beviser ikke komplett nested Populærkultur-felt.');
  assert(mediaReport.nestedSupplement?.domainCount === 6 && mediaReport.nestedSupplement?.emneCount === 56, 'Nested Populærkultur har feil canonical omfang.');
  assert(mediaReport.nestedSupplement?.methodCount === 48 && mediaReport.nestedSupplement?.mappingCount === 56, 'Nested Populærkultur har ufullstendig metode-/mappingdekning.');

  const sections = extractSections(read(ARCHIVE));
  const expectedIds = Object.keys(SECTION_POLICY);
  assert(JSON.stringify(sections.map((row) => row.id)) === JSON.stringify(expectedIds), 'Legacy-seksjonsrekkefølgen er uventet.');
  const canonicalCorpus = normalize(CANONICAL_FILES.flatMap((file) => flattenStrings(readJson(file))).join(' '));
  assert(canonicalCorpus.length > 100000, 'Canonical Populærkultur/Media-korpus er uventet lite.');
  const decisions = readJson(ADJUDICATION);
  assert(decisions.schema === 'history_go_fagverk_media_populaerkultur_legacy_adjudication_v1', 'Ukjent Populærkultur-adjudiseringsschema.');
  assert(decisions.subject_id === 'media' && decisions.legacy_alias === 'populaerkultur', 'Adjudiseringen har feil subject/alias.');
  assert(decisions.original_blob_sha === ORIGINAL_BLOB_SHA && decisions.redirect_target === TARGET, 'Adjudiseringen har feil arkivhash eller redirectmål.');
  assert(decisions.policy?.canonical_content_wins === true && decisions.policy?.copy_legacy_prose === false, 'Adjudiseringen kan ikke kopiere legacy-prosa.');
  assert(decisions.policy?.top_level_subject === false && decisions.policy?.canonical_owner === 'media', 'Adjudiseringen må eie Populærkultur som Media-delfelt.');
  assert(JSON.stringify(decisions.sections?.map((row) => row.id)) === JSON.stringify(expectedIds), 'Adjudiseringen dekker ikke alle legacy-seksjoner.');

  const allowedOwners = new Set(CANONICAL_FILES);
  const rows = sections.map((section) => {
    const policy = SECTION_POLICY[section.id];
    const decision = decisions.sections.find((row) => row.id === section.id);
    const anchors = policy.anchors.map((alternatives) => ({
      alternatives,
      found: alternatives.find((candidate) => canonicalCorpus.includes(normalize(candidate))) || null
    }));
    const missingAnchors = anchors.filter((row) => !row.found).map((row) => row.alternatives);
    const ownerFiles = Array.isArray(decision.owner_files) ? decision.owner_files : [];
    const migrationRefs = Array.isArray(decision.migration_refs) ? decision.migration_refs : [];
    assert(decision.role === policy.role, `${section.id}: feil rolle.`);
    assert(text(decision.rationale).length >= 180, `${section.id}: begrunnelsen er for svak.`);
    assert(migrationRefs.length === 0, `${section.id}: auditen har ikke bevist et migreringsgap.`);
    for (const owner of ownerFiles) {
      assert(allowedOwners.has(owner) && exists(owner), `${section.id}: ugyldig canonical eier ${owner}`);
    }
    if (policy.role === 'knowledge') {
      assert(!missingAnchors.length, `${section.id}: mangler canonicale ankere ${JSON.stringify(missingAnchors)}`);
      assert(decision.disposition === 'canonical_supersedes' && ownerFiles.length > 0, `${section.id}: kunnskapen er ikke eksplisitt eid.`);
    } else {
      assert(decision.disposition === 'retire_legacy_product_copy' && ownerFiles.length === 0, `${section.id}: produkttekst har feil disposisjon.`);
    }
    return {
      id: section.id,
      role: policy.role,
      anchorCoverage: anchors.length ? 1 : 1,
      anchorCount: anchors.length,
      missingAnchors,
      disposition: decision.disposition,
      ownerFiles,
      migrationRefs,
      rationale: decision.rationale
    };
  });

  const directInboundReferences = resolvedHtmlReferences(ACTIVE).filter((file) => file !== ACTIVE);
  const activeStylesheetReferences = resolvedHtmlReferences(DEAD_STYLESHEET);
  assert(directInboundReferences.length === 0, `Aktive innlenker peker fortsatt til Populærkultur-legacy: ${directInboundReferences.join(', ')}`);
  assert(activeStylesheetReferences.length === 0, `Aktive HTML-filer bruker fortsatt ${DEAD_STYLESHEET}: ${activeStylesheetReferences.join(', ')}`);
  assert(!exists(DEAD_STYLESHEET), `${DEAD_STYLESHEET} er bevist død, men ikke fjernet.`);

  const knowledgeRows = rows.filter((row) => row.role === 'knowledge');
  return {
    schema: 'history_go_fagverk_media_populaerkultur_retirement_audit_v1',
    subject: 'media',
    legacyAlias: 'populaerkultur',
    source: { activePage: ACTIVE, archivePage: ARCHIVE, originalBlobSha: ORIGINAL_BLOB_SHA, archiveBlobSha },
    canonical: {
      owner: 'media',
      manifestStatus: supplement.status,
      topLevelSubject: false,
      domainCount: mediaReport.nestedSupplement.domainCount,
      emneCount: mediaReport.nestedSupplement.emneCount,
      methodCount: mediaReport.nestedSupplement.methodCount,
      mappingCount: mediaReport.nestedSupplement.mappingCount,
      ownerFiles: CANONICAL_FILES
    },
    navigation: { redirectTarget: TARGET, routeRetired: true, directInboundReferences },
    cleanup: { removedStylesheet: DEAD_STYLESHEET, activeStylesheetReferences, deadStylesheetRemoved: true },
    summary: {
      legacySectionCount: rows.length,
      knowledgeSectionCount: knowledgeRows.length,
      canonicalSupersedesCount: knowledgeRows.filter((row) => row.disposition === 'canonical_supersedes').length,
      migratedSectionCount: knowledgeRows.filter((row) => row.disposition === 'migrated_to_canonical').length,
      retiredProductCopyCount: rows.filter((row) => row.disposition === 'retire_legacy_product_copy').length,
      redirectReady: true
    },
    rows
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(`${JSON.stringify(auditMediaPopularCultureRetirement(), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Populærkultur-retirement FEIL: ${error.message}\n`);
    process.exitCode = 1;
  }
}
