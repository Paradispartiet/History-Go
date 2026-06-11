(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.HistoryGoAhaModules = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const HEALTH_STATUSES = ["ready", "warning", "blocked", "empty", "missing", "unknown"];

  function appendTextElement(parent, tagName, text, className) {
    const element = parent.ownerDocument.createElement(tagName);
    element.textContent = text;
    if (className) element.className = className;
    parent.appendChild(element);
    return element;
  }

  function normalizeHealthStatus(value) {
    const candidate = String(value || "").trim().toLowerCase();
    return HEALTH_STATUSES.includes(candidate) ? candidate : "unknown";
  }

  function readHealthStatus(input) {
    const source = input && typeof input === "object" ? input : {};
    const explicit = source.healthStatus || source.status || source.moduleHealth?.status || source.moduleHealth;
    if (explicit) return normalizeHealthStatus(explicit);
    if (source.error) return "blocked";
    if (source.dataSourceAvailable === false) return "missing";
    if (Array.isArray(source.items)) return source.items.length ? "ready" : "empty";
    return "unknown";
  }

  function statusLabel(status) {
    return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
  }

  function isActionable(action) {
    return Boolean(action && !action.disabled && (typeof action.onClick === "function" || action.href));
  }

  function renderAction(parent, action, className) {
    if (!action || action.hidden) return null;
    const documentRef = parent.ownerDocument;
    const actionable = isActionable(action);
    const element = action.href && actionable
      ? documentRef.createElement("a")
      : documentRef.createElement("button");
    element.textContent = action.label;
    element.className = className;

    if (element.tagName.toLowerCase() === "a") {
      element.setAttribute("href", action.href);
    } else {
      element.setAttribute("type", "button");
      if (!actionable || action.disabled) {
        element.disabled = true;
        element.setAttribute("aria-disabled", "true");
        element.setAttribute("title", action.unavailableLabel || "Action unavailable");
      } else {
        element.addEventListener("click", action.onClick);
      }
    }

    if (action.ariaLabel) element.setAttribute("aria-label", action.ariaLabel);
    parent.appendChild(element);
    return element;
  }

  function renderAdvancedDetails(parent, details) {
    if (!details) return null;
    const section = parent.ownerDocument.createElement("details");
    section.className = "aha-module-advanced";
    const summary = appendTextElement(section, "summary", "Advanced details");
    summary.setAttribute("aria-label", "Show advanced details");

    if (typeof details === "function") {
      details(section);
    } else {
      const values = Array.isArray(details) ? details : [details];
      values.filter((value) => typeof value === "string" && value.trim()).forEach((value) => {
        appendTextElement(section, "p", value, "aha-module-detail");
      });
    }

    parent.appendChild(section);
    return section;
  }

  function renderModuleShell(element, config, input) {
    if (!element?.ownerDocument) return { ok: false, error: "Could not render module." };

    const options = input && typeof input === "object" ? input : {};
    const items = Array.isArray(options.items) ? options.items : [];
    const status = readHealthStatus(options);
    const titleId = `${config.id}-title`;
    element.replaceChildren();
    element.className = "aha-module-shell";
    element.setAttribute("aria-labelledby", titleId);
    element.dataset.module = config.id;

    const header = element.ownerDocument.createElement("header");
    header.className = "aha-module-header";
    const heading = appendTextElement(header, "h1", config.title, "aha-module-title");
    heading.setAttribute("id", titleId);
    appendTextElement(header, "p", config.purpose, "aha-module-purpose");
    const badge = appendTextElement(header, "span", statusLabel(status), `aha-module-health aha-module-health--${status}`);
    badge.setAttribute("role", "status");
    badge.setAttribute("aria-label", `Module status: ${statusLabel(status)}`);
    element.appendChild(header);

    const primaryAction = options.primaryAction === false ? null : {
      label: config.primaryActionLabel,
      ...(options.primaryAction || {})
    };
    const secondaryActions = Array.isArray(options.secondaryActions) ? options.secondaryActions : [];
    if (primaryAction || secondaryActions.length) {
      const actions = element.ownerDocument.createElement("div");
      actions.className = "aha-module-actions";
      renderAction(actions, primaryAction, "aha-module-action aha-module-action--primary");
      secondaryActions.forEach((action) => renderAction(actions, action, "aha-module-action aha-module-action--secondary"));
      element.appendChild(actions);
    }

    const body = element.ownerDocument.createElement("div");
    body.className = "aha-module-body";
    body.setAttribute("aria-live", options.error ? "assertive" : "polite");

    if (options.error) {
      appendTextElement(body, "p", options.renderError ? "Could not render module." : "Could not read module data.", "aha-module-error-state");
    } else if (options.dataSourceAvailable === false) {
      appendTextElement(body, "p", "No module data found.", "aha-module-empty-state");
    } else if (typeof options.renderContent === "function") {
      options.renderContent(body, items, options);
    } else if (options.contentNode) {
      body.appendChild(options.contentNode);
    } else if (items.length === 0) {
      appendTextElement(body, "p", config.emptyState, "aha-module-empty-state");
    } else {
      appendTextElement(body, "p", `${items.length} ${items.length === 1 ? "item" : "items"}.`, "aha-module-content-summary");
    }
    element.appendChild(body);

    renderAdvancedDetails(element, options.advancedDetails);
    return { ok: !options.error, status, itemCount: items.length };
  }

  function createModuleRenderer(config) {
    function render(element, input) {
      return renderModuleShell(element, config, input);
    }

    function mount(documentRef, input) {
      const element = documentRef?.getElementById?.(config.mountId);
      return element ? render(element, input) : null;
    }

    return { config: { ...config }, render, mount };
  }

  return {
    HEALTH_STATUSES,
    normalizeHealthStatus,
    readHealthStatus,
    renderModuleShell,
    createModuleRenderer
  };
});
