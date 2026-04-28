(function initCareerRoleResolver(globalScope) {
  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function resolveCareerRoleScope(activePosition) {
    const careerId = normalize(activePosition?.career_id);
    const roleKey = normalize(activePosition?.role_key);
    const title = normalize(activePosition?.title);

    if (careerId === 'naeringsliv') {
      if (roleKey === 'ekspeditor' || roleKey.includes('ekspedit') || title.includes('ekspeditør / butikkmedarbeider') || title.includes('ekspeditor') || title.includes('ekspedit') || title === 'arbeider') return 'ekspeditor';
      if (roleKey.includes('fagarbeider') || title.includes('fagarbeider')) return 'fagarbeider';
      if (roleKey.includes('mellomleder') || title.includes('mellomleder')) return 'mellomleder';
      if (roleKey.includes('formann') || title.includes('formann')) return 'formann';
    }

    if (roleKey.includes('ekspeditor') || roleKey.includes('butikk')) return 'ekspeditor';
    if (roleKey.includes('fagarbeider')) return 'fagarbeider';
    if (roleKey.includes('mellomleder')) return 'mellomleder';
    if (roleKey.includes('formann')) return 'formann';
    if (roleKey.includes('arbeider')) return 'arbeider';
    return 'unknown';
  }

  const api = { resolveCareerRoleScope };
  globalScope.CivicationCareerRoleResolver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
