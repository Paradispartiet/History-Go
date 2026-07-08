# Bislett Stadion image asset todo

User request: add the stadium image shown in chat / use the hero images visible inside Bislett Stadion.

Status in this PR:

- No image file was added.
- No external image URL was copied into data.
- New people entries use empty `image` and `cardImage` fields.

Reason:

- The displayed chat image was an external illustrative image, not a verified committed repository asset.
- Repository search did not identify a safe existing Bislett stadium photo asset to reference.
- Hero-wall photos inside the stadium need a separate asset pass with either user-provided photos or verified/licensed files.

Recommended next asset PR:

1. Add user-provided or licensed Bislett Stadion image assets under the existing image convention.
2. Add person card assets for the hero-wall people if available.
3. Update `image` and `cardImage` for the new batch entries.
4. Consider updating existing Bislett people entries with better local assets if needed:
   - `grete_waitz`
   - `hjalmar_andersen`
   - `ingrid_kristiansen`
   - `karsten_warholm`
   - `jakob_ingebrigtsen`
