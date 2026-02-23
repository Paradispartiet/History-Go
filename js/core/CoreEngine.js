/* js/core/CoreEngine.js */

(function () {

  const CORE_VERSION = 1;

  const KEYS = {
    version: "core:version",
    profile: "core:profile",
    snapshots: "core:snapshots"
  };

  function isoNow() {
    return new Date().toISOString();
  }

  function ensureProfile() {
    let profile = StorageAdapter.load(KEYS.profile, null);

    if (!profile) {
      profile = {
        schemaVersion: CORE_VERSION,
        user: {
          id: "local-" + Math.random().toString(16).slice(2),
          displayName: "",
          createdAt: isoNow()
        },
        preferences: {
          language: "no"
        },
        lastActive: {
          module: "historygo",
          at: isoNow()
        }
      };

      StorageAdapter.save(KEYS.profile, profile);
      StorageAdapter.save(KEYS.version, CORE_VERSION);
    }

    return profile;
  }

  function ensureSnapshots() {
    let snapshots = StorageAdapter.load(KEYS.snapshots, null);

    if (!snapshots) {
      snapshots = { schemaVersion: CORE_VERSION };
      StorageAdapter.save(KEYS.snapshots, snapshots);
    }

    return snapshots;
  }

  const CoreEngine = {

    init() {
      ensureProfile();
      ensureSnapshots();
    },

    publishSnapshot(namespace, snapshotObj) {
      const snapshots = ensureSnapshots();

      snapshots[namespace] = {
        ...snapshotObj,
        updatedAt: isoNow()
      };

      StorageAdapter.save(KEYS.snapshots, snapshots);

      window.dispatchEvent(new Event("core:snapshot_changed"));
      window.dispatchEvent(new Event("updateProfile"));
    },

    getSnapshots() {
      return ensureSnapshots();
    }

  };

  window.CoreEngine = CoreEngine;

})();
