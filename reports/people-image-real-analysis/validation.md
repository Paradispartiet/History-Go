# Validation: real people-image pixel analysis

- **Test images:** JPEG, PNG and WebP synthetic fixtures, plus bright, dark, low-contrast, sharp, blurred, large and invalid-buffer cases.
- **Supported formats:** Sharp decodes JPEG, PNG, WebP and (with `animated: false`) the first GIF frame when libvips supports the input.
- **Metrics:** sRGB-luminance mean, clipped-highlight and crushed-shadow ratios, population-standard-deviation contrast, and deterministic four-neighbour Laplacian edge energy.
- **Memory strategy:** metadata is read first; `autoOrient()` is followed by `resize({ fit: 'inside', width: 768, height: 768 })` before `.raw()`. Original quality dimensions retain the EXIF-oriented metadata dimensions, while the raw buffer is bounded to the thumbnail.
- **Regression coverage:** `analyzeCandidate()` receives an actual JPEG `Response` and asserts complete analysis, nonzero metrics, and no obsolete limited-analysis warning.
- **Previous failure:** the former production decoder accepted only PNM P5/P6. Commons JPEG/PNG/WebP files therefore produced `filen_kan_ikke_dekodes`, after which the pipeline silently replaced the failure with fabricated fallback values. The new pipeline retains decode failures as `failed`/`unusable`, and download failures as explicit `unavailable` analysis without pixel metrics.

Thresholds are documented next to the analyzer constants: bright > 0.78, dark < 0.22, low contrast < 0.12, clipped highlights >= 0.98, and crushed shadows <= 0.03.
