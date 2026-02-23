/* js/core/StorageAdapter.js */

(function () {

  const StorageAdapter = {

    load(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        console.warn("Storage load error:", key, e);
        return fallback;
      }
    },

    save(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    remove(key) {
      localStorage.removeItem(key);
    }

  };

  window.StorageAdapter = StorageAdapter;

})();
