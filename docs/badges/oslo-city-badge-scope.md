# Oslo-specific By badge

The approved embroidered Oslo city image is stored separately at `bilder/merker/by/cities/oslo-by-brodert-v1.webp`.

It is **not** the universal By & arkitektur category badge. `data/badges/by.json` remains on `bilder/merker/by-brodert-v6.webp` and category image selection must not inherit Oslo artwork.

Map markers use this image only when `category=by` and a place's canonical `sourceFile` begins with `places/by/oslo/` (allowing an optional `data/` prefix). Names, nearby coordinates, and the literal word Oslo in another path do not confer eligibility.

A place without a trusted source path uses the ordinary global category badge. This deliberately avoids mislabeling places in Akershus, other Norwegian cities, or Criciúma.

Approved original design: Oslo tram 12, Storting, Akershus fortress, City Hall, harbour, and greenery, with dark-gray stitched border and gray embellishments. The global badge is left unchanged.

Verify: `node --test tests/badge-oslo-city-scope.test.mjs`.
