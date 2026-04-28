(function initCareerRoleResolver(globalScope) {
  function resolveCareerRoleScope(activePosition) {
    const key = String(activePosition?.role_key || '').toLowerCase();
    if (key.includes('ekspeditor') || key.includes('butikk')) return 'ekspeditor';
    if (key.includes('fagarbeider')) return 'fagarbeider';
    if (key.includes('arbeider')) return 'arbeider';
    return 'unknown';
  }

  const api = { resolveCareerRoleScope };
  globalScope.CivicationCareerRoleResolver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
