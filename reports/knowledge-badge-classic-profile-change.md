# Knowledge badge/logo + classic profile follow-up

## Scope

- Knowledge V2 uses canonical badge image assets from `data/badges/index.json` / `badge.image` instead of generic Unicode subject icons.
- The classic knowledge profile is restored as `knowledge-profile.html` and reads the canonical `HGKnowledgeV2` profile model.
- Navigation from `profile.html` through the existing `knowledge.html` link is routed back to the classic profile view, while `knowledge.html?view=v2` and subject links remain on Knowledge V2.

## Changed runtime files

- `knowledge.html`
- `knowledge-profile.html`
- `js/knowledgeBadgeLogos.js`
- `js/knowledgeProfileClassic.js`
- `css/knowledge-badge-logos.css`

## Data contract

Badge images are loaded via `DataHub.loadBadges()`; no duplicate badge-image registry is introduced.
