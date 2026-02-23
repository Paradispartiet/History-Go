/* /js/core/CoreEngine.js */

import { StorageAdapter } from "/js/core/StorageAdapter.js";

const CORE_VERSION = 1;

const KEYS = {
  version: "core:version",
  profile: "core:profile",
  snapshots: "core:snapshots"
};

function isoNow() {
  return new Date().toISOString();
}

function ensureCoreProfile() {
  const existing = StorageAdapter.load(KEYS.profile, null);
  if (existing) return existing;

  const profile = {
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
  return profile;
}

function ensureCoreSnapshots() {
  const existing = StorageAdapter.load(KEYS.snapshots, null);
  if (existing) return existing;

  const snapshots = {
    schemaVersion: CORE_VERSION
  };

  StorageAdapter.save(KEYS.snapshots, snapshots);
  return snapshots;
}

export const CoreEngine = {
  init() {
    ensureCoreProfile();
    ensureCoreSnapshots();
  },

  getProfile() {
    return StorageAdapter.load(KEYS.profile, null);
  },

  setLastActive(moduleName) {
    const profile = ensureCoreProfile();
    profile.lastActive = { module: moduleName, at: isoNow() };
    StorageAdapter.save(KEYS.profile, profile);
  },

  getSnapshots() {
    return ensureCoreSnapshots();
  },

  publishSnapshot(namespace, snapshotObj) {
    const snapshots = ensureCoreSnapshots();
    snapshots[namespace] = {
      ...snapshotObj,
      updatedAt: isoNow()
    };
    StorageAdapter.save(KEYS.snapshots, snapshots);

    window.dispatchEvent(new Event("core:snapshot_changed"));
    window.dispatchEvent(new Event("updateProfile")); // din globale regel
  }
};
