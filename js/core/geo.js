// ==============================
// 4. GEO OG AVSTANDSBEREGNING
// ==============================
function distMeters(a, b) {
  const aLat = Number(a?.lat);
  const aLon = Number(a?.lon);
  const bLat = Number(b?.lat);
  const bLon = Number(b?.lon);

  if (![aLat, aLon, bLat, bLon].every(Number.isFinite)) return Infinity;

  const R = 6371e3;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const la1 = toRad(aLat);
  const la2 = toRad(bLat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
