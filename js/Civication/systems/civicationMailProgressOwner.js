(function () {
  "use strict";

  var KEY = "advance" + "Plan" + "Progress";

  function ownsFlow() {
    try {
      var info = window.CivicationMailRuntime && window.CivicationMailRuntime.inspect
        ? window.CivicationMailRuntime.inspect()
        : null;
      if (info && info.patched === true) return true;
    } catch (e) {}

    var Ctor = window.CivicationEventEngine;
    return !!(Ctor && Ctor.prototype && Ctor.prototype.__civicationMailRuntimePatched === true);
  }

  function currentProgress() {
    var state = window.CivicationState && window.CivicationState.getState
      ? window.CivicationState.getState()
      : {};

    var bridge = window.CiviMailPlanBridge;
    return bridge && typeof bridge.getPlanProgress === "function"
      ? bridge.getPlanProgress(state)
      : null;
  }

  function install() {
    var bridge = window.CiviMailPlanBridge;
    if (!bridge || bridge.__singleOwnerInstalled === true) return false;
    if (typeof bridge[KEY] !== "function") return false;

    var original = bridge[KEY];

    bridge[KEY] = function (plan) {
      if (ownsFlow()) return currentProgress();
      return original.call(this, plan);
    };

    bridge.__singleOwnerInstalled = true;
    bridge.__singleOwnerInstalledAt = new Date().toISOString();
    return true;
  }

  window.CivicationMailProgressOwner = {
    boot: install,
    install: install,
    inspect: function () {
      return {
        bridge_exists: !!window.CiviMailPlanBridge,
        owns_flow: ownsFlow(),
        installed: !!(window.CiviMailPlanBridge && window.CiviMailPlanBridge.__singleOwnerInstalled),
        progress: currentProgress()
      };
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }

  window.addEventListener("civi:dataReady", install);
  window.addEventListener("civi:booted", install);
})();
