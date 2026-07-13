export type QualityTier = 'recommended' | 'usable' | 'best_available' | 'unusable';
export type Quality = { tier: QualityTier; score: number; width: number; height: number; minSide: number; aspectRatio: number; meanLuminance: number; clippedHighlightsRatio: number; crushedShadowsRatio: number; contrast: number; sharpness: number; warnings: string[]; hardErrors: string[]; analyzerVersion: 'people-image-quality-v1' };
export type FaceDetection = { status: 'unavailable'; faceCount: null };

const WARN = {
  lowResolution: 'lav_oppløsning', tooBright: 'for_lyst', tooDark: 'for_mørkt', clippedHighlights: 'utbrente_høylys', crushedShadows: 'svært_mørke_partier', lowContrast: 'lav_kontrast', blurry: 'mulig_uskarphet', extremeAspect: 'ekstremt_sideforhold', decodeUnavailable: 'automatisk_bildeanalyse_begrenset'
} as const;

function emptyQuality(hardErrors: string[] = []): Quality {
  return { tier: hardErrors.length ? 'unusable' : 'usable', score: hardErrors.length ? 0 : 55, width: 0, height: 0, minSide: 0, aspectRatio: 0, meanLuminance: 0, clippedHighlightsRatio: 0, crushedShadowsRatio: 0, contrast: 0, sharpness: 0, warnings: hardErrors.length ? [] : [WARN.decodeUnavailable], hardErrors, analyzerVersion: 'people-image-quality-v1' };
}
function parsePnm(buffer: Uint8Array): { width: number; height: number; channels: number; data: Uint8Array } | null {
  const text = new TextDecoder('latin1').decode(buffer.subarray(0, Math.min(buffer.length, 1024 * 1024)));
  let i = 0; const token = () => { while (/\s/.test(text[i]) || text[i] === '#') { if (text[i] === '#') while (i < text.length && text[i] !== '\n') i++; else i++; } const s = i; while (i < text.length && !/\s/.test(text[i])) i++; return text.slice(s, i); };
  const magic = token(); if (magic !== 'P6' && magic !== 'P5') return null;
  const width = Number(token()), height = Number(token()), max = Number(token()); if (/\s/.test(text[i])) i++;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || max !== 255) return null;
  const channels = magic === 'P6' ? 3 : 1; const start = i; const needed = width * height * channels; if (buffer.length < start + needed) return null;
  return { width, height, channels, data: buffer.subarray(start, start + needed) };
}
export function analyzeImageBuffer(buffer: Uint8Array): { quality: Quality; faceDetection: FaceDetection } {
  const img = parsePnm(buffer);
  if (!img) return { quality: emptyQuality(['filen_kan_ikke_dekodes']), faceDetection: { status: 'unavailable', faceCount: null } };
  const luminance = new Float64Array(img.width * img.height); let sum = 0, hi = 0, lo = 0;
  for (let p = 0, j = 0; p < luminance.length; p++, j += img.channels) { const y = (img.channels === 1 ? img.data[j] : 0.2126 * img.data[j] + 0.7152 * img.data[j+1] + 0.0722 * img.data[j+2]) / 255; luminance[p] = y; sum += y; if (y >= .98) hi++; if (y <= .03) lo++; }
  const mean = sum / luminance.length; let variance = 0; for (const y of luminance) variance += (y - mean) ** 2; const contrast = Math.sqrt(variance / luminance.length);
  let edge = 0, edgeN = 0; for (let y = 1; y < img.height - 1; y++) for (let x = 1; x < img.width - 1; x++) { const k = y * img.width + x; edge += Math.abs(4*luminance[k]-luminance[k-1]-luminance[k+1]-luminance[k-img.width]-luminance[k+img.width]); edgeN++; }
  const sharpness = Math.min(1, (edge / Math.max(1, edgeN)) * 8);
  const minSide = Math.min(img.width, img.height), aspectRatio = img.width / img.height; const warnings: string[] = [];
  if (minSide < 500) warnings.push(WARN.lowResolution); if (mean > .78) warnings.push(WARN.tooBright); if (mean < .22) warnings.push(WARN.tooDark); if (hi / luminance.length > .08) warnings.push(WARN.clippedHighlights); if (lo / luminance.length > .12) warnings.push(WARN.crushedShadows); if (contrast < .12) warnings.push(WARN.lowContrast); if (sharpness < .28) warnings.push(WARN.blurry); if (aspectRatio > 2.2 || aspectRatio < .35) warnings.push(WARN.extremeAspect);
  let score = 100 - warnings.length * 9; if (minSide < 300) score -= 12; score += Math.round(Math.min(10, sharpness * 10)); score = Math.max(1, Math.min(100, score));
  const tier: QualityTier = warnings.length <= 1 && score >= 82 ? 'recommended' : warnings.length <= 4 && score >= 55 ? 'usable' : 'best_available';
  return { quality: { tier, score, width: img.width, height: img.height, minSide, aspectRatio: Number(aspectRatio.toFixed(3)), meanLuminance: Number(mean.toFixed(3)), clippedHighlightsRatio: Number((hi/luminance.length).toFixed(3)), crushedShadowsRatio: Number((lo/luminance.length).toFixed(3)), contrast: Number(contrast.toFixed(3)), sharpness: Number(sharpness.toFixed(3)), warnings, hardErrors: [], analyzerVersion: 'people-image-quality-v1' }, faceDetection: { status: 'unavailable', faceCount: null } };
}
export function fallbackQuality(width: number, height: number): { quality: Quality; faceDetection: FaceDetection } { const q = emptyQuality(); q.width = width; q.height = height; q.minSide = Math.min(width, height); q.aspectRatio = height ? Number((width/height).toFixed(3)) : 0; if (q.minSide && q.minSide < 500) q.warnings.push(WARN.lowResolution); q.score = q.minSide >= 700 ? 70 : 52; q.tier = q.score >= 55 ? 'usable' : 'best_available'; return { quality: q, faceDetection: { status: 'unavailable', faceCount: null } }; }
