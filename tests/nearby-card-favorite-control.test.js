const assert = require("node:assert/strict");
const fs = require("node:fs");

const lists = fs.readFileSync("js/ui/lists.js", "utf8");
const nearbyCss = fs.readFileSync("css/nearby.css", "utf8");
const nearbyFilterControls = fs.readFileSync("js/ui/nearbyFilterControls.ts", "utf8");
const nearbyFilters = fs.readFileSync("js/ui/nearbyFilters.ts", "utf8");
const placeCard = fs.readFileSync("js/ui/place-card.js", "utf8");

assert(!lists.includes("createNearbyFavoriteButton"), "Nearby cards must not create a favorite star button");
assert(!lists.includes("nearby-favorite-btn"), "Nearby card markup must not contain the removed favorite control");
assert(!nearbyCss.includes(".nearby-favorite-btn"), "Nearby card favorite overlay styles must be removed");

assert(nearbyFilterControls.includes("nearbyFavoritesFilterBtn"), "The Nearby favorites filter must remain available");
assert(nearbyFilters.includes("HG_NEARBY_FAVORITES_ONLY"), "The favorites-only filter behavior must remain intact");
assert(placeCard.includes('document.getElementById("pcFavorite")'), "PlaceCard must remain the place-level favorite control");
assert(lists.includes("bruk stjernen i stedskortet"), "The empty state must point users to the remaining PlaceCard control");

console.log("nearby card favorite control tests passed");
