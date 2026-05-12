(function (global) {
  'use strict';

  const M = global.AHAModules;
  if (!M) return;

  const STORAGE_KEY = 'aha_groups_v1';

  function readStore() {
    const data = M.readJsonStorage(STORAGE_KEY, {});
    if (!data || typeof data !== 'object') return { groups: [] };
    const groups = Array.isArray(data.groups) ? data.groups : [];
    return { ...data, groups };
  }

  function writeStore(next) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function getActiveGroups() {
    return readStore().groups.filter((group) => group && !group.deletedAt);
  }

  function addReferenceToGroup(groupId, reference) {
    const store = readStore();
    const idx = store.groups.findIndex((g) => g && g.id === groupId && !g.deletedAt);
    if (idx === -1) return { ok: false, reason: 'group_not_found' };

    const group = store.groups[idx];
    const refs = Array.isArray(group.references) ? group.references : [];
    const exists = refs.some((r) => r && r.source === reference.source && r.refId === reference.refId);
    if (exists) return { ok: true, duplicate: true, reason: 'duplicate' };

    refs.push({
      title: reference.title,
      type: reference.type,
      source: reference.source,
      refId: reference.refId,
      ...(reference.meta ? { meta: reference.meta } : {})
    });

    store.groups[idx] = { ...group, references: refs, updatedAt: new Date().toISOString() };
    writeStore(store);
    return { ok: true, duplicate: false };
  }

  function addReferenceToGroupByObject(groupId, objectInput) {
    const reference = {
      title: objectInput?.title || 'Uten tittel',
      type: objectInput?.type || 'unknown',
      source: objectInput?.source || 'unknown',
      refId: objectInput?.refId,
      ...(objectInput?.meta ? { meta: objectInput.meta } : {})
    };

    if (!reference.refId) return { ok: false, reason: 'missing_refId' };
    return addReferenceToGroup(groupId, reference);
  }

  global.AHAGroups = {
    getActiveGroups,
    addReferenceToGroup,
    addReferenceToGroupByObject
  };
})(window);
