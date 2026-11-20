#!/usr/bin/env node
/**
 * History GO: audit real source-backed brand artwork for place-linked Brands.
 *
 * Deliberately informational about MISSING artwork, because missing historical
 * marks must not be replaced by generated/guessed logos. Nonexistent or unsafe
 * paths among already declared assets are hard errors.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE_EXT = /\.(?:webp|png|jpe?g|svg|gif)$/i;

const list = (x) => Array.isArray(x) ? x : [];
const value = (x) => typeof x === 'string' ? x.trim() : '';
const linked = (brand) => value(brand.place_id) || list(brand.place_ids).some((id) => value(id));

export function auditLinkedBrandAssets(root = PROJECT_ROOT) {
  const full = path.resolve(root);
  const sourcePath = path.join(full, 'data/brands/brands_master.json');
  const entries = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  if (!Array.isArray(entries)) throw new Error('Brands master must be an array');
  const records = [];
  for (const brand of entries.filter(linked)) {
    const image = value(brand.logo || brand.image || brand.cardImage);
    const meta = brand.logoMeta || brand.imageMeta || {};
    const source = value(meta.sourcePage || meta.sourceUrl || meta.sourceAsset);
    const rights = value(meta.rightsBasis || meta.license);
    const issues = [];
    const review = [];
    if (!image) {
      review.push('authentic_logo_or_wordmark_missing');
    } else {
      const normalized = image.replace(/\\/g, '/');
      const target = path.resolve(full, normalized);
      if (!normalized.startsWith('bilder/') || normalized.includes('/candidates/')
          || !IMAGE_EXT.test(normalized) || !target.startsWith(full + path.sep)) {
        issues.push('unsafe_or_noncanonical_asset_path');
      } else if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        issues.push('declared_asset_file_missing');
      }
      if (!source) issues.push('source_page_missing');
      if (!rights) issues.push('rights_basis_missing');
      if (meta.generated === true || /openai_imagegen|ai_generated_logo/i.test(value(meta.source))) {
        issues.push('generated_brandmark_not_allowed');
      }
      if (!value(brand.logo)) review.push('asset_not_explicitly_declared_as_logo');
      if (meta.reviewStatus !== 'manually_approved') review.push('manual_authenticity_review_pending');
    }
    records.push({
      id: value(brand.id),
      name: value(brand.name),
      place_ids: list(brand.place_ids).map(value).filter(Boolean).concat(value(brand.place_id) ? [value(brand.place_id)] : []),
      image: image || null,
      sourcePage: source || null,
      assetKind: value(meta.assetKind || meta.assetType) || null,
      rightsBasis: rights || null,
      issues,
      review
    });
  }
  const hardFailures = records.filter((r) => r.issues.length > 0);
  return {
    schema: 'history-go-linked-brand-assets-audit-v1',
    totalLinkedBrands: records.length,
    withAnyImage: records.filter((r) => r.image).length,
    missingImage: records.filter((r) => !r.image).length,
    needsManualReview: records.filter((r) => r.review.length > 0).length,
    invalidDeclaredAssets: hardFailures.length,
    missingImageQueue: records.filter((r) => !r.image).map((r) => ({ id: r.id, name: r.name, place_ids: r.place_ids })),
    hardFailures,
    records
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = auditLinkedBrandAssets();
  if (process.argv.includes('--summary') || process.argv.includes('--check')) {
    console.log(JSON.stringify(Object.fromEntries(
      Object.entries(result).filter(([key]) => key !== 'records')
    ), null, 2));
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  if (result.invalidDeclaredAssets) process.exitCode = 1;
}
