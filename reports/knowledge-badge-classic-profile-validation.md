# Validation checklist

- [x] Knowledge V2 loads badge data through `DataHub.loadBadges()`.
- [x] Subject rows, subject pills and subject hero are enhanced with `badge.image` assets.
- [x] Classic knowledge profile exists as a separate page and reads `HGKnowledgeV2.buildProfile()`.
- [x] Subject links and `?view=v2` remain on the new Knowledge V2 page.
- [x] Existing profile navigation to bare `knowledge.html` is routed to the restored classic profile on same-origin navigation.

CI on the pull request is the final regression gate before merge.
