# Finn Fauna – Bokfink nr. 31 | binary handoff

**Status:** draft candidate. Do not merge until binary upload, visual review, four focused Fauna/Flora checks and Pages verification.

This branch deliberately leaves `js/ui/nature-fauna-approved.js` and `finn-fauna.html` unchanged. The other 30 approved originals remain live and Bokfink stays on its existing SVG fallback.

## Exact binary to upload

| Property | Value |
|---|---|
| Target path | `bilder/natur/fauna/godkjent/31_bokfink_v1.webp` |
| Dimensions | 1024 × 1536 |
| Bytes | 139174 |
| SHA-256 | `9908d15ca862609274486e27e99ad9748a0575dea40603d7581124aef9043173` |
| Expected Git blob SHA | `f48fafe915612bc0b520af1388e62230901d3060` |

The file is available in the ChatGPT conversation as `31_bokfink_v1_candidate.webp`. The original RGB PNG is also included in the candidate ZIP. Upload the **WebP bytes unchanged**; do not regenerate or recompress.

After upload, verify the Git blob and SHA-256, and run:

```bash
node scripts/test-fauna-bokfink-031-candidate.mjs
```

## Promotion steps (not yet executed)

1. Open the WebP on black and white backgrounds and confirm the bird, wings, branch and transparency. Mark its quality manifest approved only after an individual review.
2. Register `emne_fauna_bokfink`, point to the exact WebP and verified Git blob, and update `finn-fauna.html` cache version to 31. Preserve `quiz_fauna_bokfink`.
3. Upgrade the Bokfink contract and Playwright coverage from legacy SVG to WebP with black `contain`, details modal, and intentional failed-image fallback on mobile and desktop.
4. Require the focused Fauna illustration contract, Fauna browser, Flora illustration contract and Flora browser regression to pass on the final PR commit; unrelated `trikk_17_18` failure must be reported independently.
5. Merge only after passing checks. Verify GitHub Pages `completed/success` for the *merge commit* before reporting 31 published.
