import sharp from 'sharp';

export type QualityTier = 'recommended' | 'usable' | 'best_available' | 'unusable';
export type AnalysisStatus = 'complete' | 'unavailable' | 'failed';
export type Quality = {
  tier: QualityTier; score: number; width: number; height: number; minSide: number; aspectRatio: number;
  meanLuminance: number | null; clippedHighlightsRatio: number | null; crushedShadowsRatio: number | null;
  contrast: number | null; sharpness: number | null; warnings: string[]; hardErrors: string[];
  analysisStatus: AnalysisStatus; analyzerVersion: 'people-image-quality-v2';
};
export type FaceDetection = { status: 'unavailable'; faceCount: null };

const MAX_ANALYSIS_SIDE = 768;
// Thresholds are deliberately conservative: normalized luminance uses sRGB luma,
// contrast is its population standard deviation, and sharpness is mean Laplacian edge energy.
const WARN = {
  lowResolution: 'lav_oppløsning', tooBright: 'for_lyst', tooDark: 'for_mørkt', clippedHighlights: 'utbrente_høylys', crushedShadows: 'svært_mørke_partier', lowContrast: 'lav_kontrast', blurry: 'mulig_uskarphet'
} as const;
const noFaces = (): FaceDetection => ({ status: 'unavailable', faceCount: null });

function unavailableQuality(width: number, height: number, analysisStatus: AnalysisStatus, hardErrors: string[] = []): Quality {
  const minSide = Math.min(width, height);
  return { tier: hardErrors.length ? 'unusable' : 'best_available', score: 0, width, height, minSide,
    aspectRatio: height ? Number((width / height).toFixed(3)) : 0,
    meanLuminance: null, clippedHighlightsRatio: null, crushedShadowsRatio: null, contrast: null, sharpness: null,
    warnings: [], hardErrors, analysisStatus, analyzerVersion: 'people-image-quality-v2' };
}

function orientedDimensions(width: number, height: number, orientation?: number): [number, number] {
  return orientation && orientation >= 5 && orientation <= 8 ? [height, width] : [width, height];
}

export async function analyzeImageBuffer(buffer: Uint8Array): Promise<{ quality: Quality; faceDetection: FaceDetection }> {
  try {
    // Metadata is read before pixels. resize is part of the decode pipeline so libvips does not
    // materialize a full-size raw buffer for an enormous Commons original.
    const input = sharp(buffer, { animated: false, pages: 1, limitInputPixels: 100_000_000, failOn: 'error' });
    const metadata = await input.metadata();
    if (!metadata.width || !metadata.height) throw new Error('Missing image dimensions');
    const [width, height] = orientedDimensions(metadata.width, metadata.height, metadata.orientation);
    const decoded = await input.autoOrient().resize({ width: MAX_ANALYSIS_SIDE, height: MAX_ANALYSIS_SIDE, fit: 'inside', withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const channels = decoded.info.channels;
    const pixels = decoded.data;
    const count = decoded.info.width * decoded.info.height;
    if (!count || channels < 1) throw new Error('Decoded image has no pixels');
    const luminance = new Float32Array(count);
    let sum = 0, hi = 0, lo = 0;
    for (let p = 0, j = 0; p < count; p++, j += channels) {
      const y = channels === 1 ? pixels[j] / 255 : (0.2126 * pixels[j] + 0.7152 * pixels[j + 1] + 0.0722 * pixels[j + 2]) / 255;
      luminance[p] = y; sum += y; if (y >= .98) hi++; if (y <= .03) lo++;
    }
    const mean = sum / count;
    let variance = 0;
    for (const y of luminance) variance += (y - mean) ** 2;
    const contrast = Math.sqrt(variance / count);
    let edge = 0, edgeCount = 0;
    for (let y = 1; y < decoded.info.height - 1; y++) for (let x = 1; x < decoded.info.width - 1; x++) {
      const k = y * decoded.info.width + x;
      edge += Math.abs(4 * luminance[k] - luminance[k - 1] - luminance[k + 1] - luminance[k - decoded.info.width] - luminance[k + decoded.info.width]); edgeCount++;
    }
    const sharpness = Math.min(1, (edge / Math.max(1, edgeCount)) * 8);
    const minSide = Math.min(width, height), aspectRatio = width / height, warnings: string[] = [];
    if (minSide < 500) warnings.push(WARN.lowResolution);
    if (mean > .78) warnings.push(WARN.tooBright); if (mean < .22) warnings.push(WARN.tooDark);
    if (hi / count > .08) warnings.push(WARN.clippedHighlights); if (lo / count > .12) warnings.push(WARN.crushedShadows);
    if (contrast < .12) warnings.push(WARN.lowContrast); if (sharpness < .28) warnings.push(WARN.blurry);
    let score = 100 - warnings.length * 9; if (minSide < 300) score -= 12; score += Math.round(Math.min(10, sharpness * 10)); score = Math.max(1, Math.min(100, score));
    const tier: QualityTier = warnings.length <= 1 && score >= 82 ? 'recommended' : warnings.length <= 4 && score >= 55 ? 'usable' : 'best_available';
    return { quality: { tier, score, width, height, minSide, aspectRatio: Number(aspectRatio.toFixed(3)), meanLuminance: Number(mean.toFixed(3)), clippedHighlightsRatio: Number((hi / count).toFixed(3)), crushedShadowsRatio: Number((lo / count).toFixed(3)), contrast: Number(contrast.toFixed(3)), sharpness: Number(sharpness.toFixed(3)), warnings, hardErrors: [], analysisStatus: 'complete', analyzerVersion: 'people-image-quality-v2' }, faceDetection: noFaces() };
  } catch {
    return { quality: unavailableQuality(0, 0, 'failed', ['filen_kan_ikke_dekodes']), faceDetection: noFaces() };
  }
}

/** Metadata-only state used only after a download failure; it never invents pixel metrics. */
export function unavailableAnalysisQuality(width: number, height: number): { quality: Quality; faceDetection: FaceDetection } {
  return { quality: unavailableQuality(width, height, 'unavailable'), faceDetection: noFaces() };
}
