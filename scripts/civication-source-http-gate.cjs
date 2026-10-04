// HTTP errors on required place sources block cold-boot verification. Optional
// sibling-manifest probes are outside this set unless explicitly listed.
module.exports = function sourceHttpErrors(httpErrors, origin, files) {
  const required = new Set([new URL('data/places/manifest.json', origin).href,
    ...files.map(rel => new URL(`data/${rel}`, origin).href)]);
  return httpErrors.filter(error => {
    const url = new URL(error.url);
    url.search = '';
    url.hash = '';
    return required.has(url.href);
  });
};
