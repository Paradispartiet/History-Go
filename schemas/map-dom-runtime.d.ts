export {};

// Transitional DOM bridge for the map strangler migration. Keep this file small
// and delete individual augmentations as map.ts replaces legacy query patterns.
declare global {
  /** Internal resize-listener guard used by the MapLibre host element. */
  interface HTMLElement {
    __hgResizeBound?: boolean;
  }

  /**
   * History Go runs in an HTML/SVG browser DOM where interactive elements expose
   * DOMStringMap. The legacy map runtime queries buttons as Element during the
   * strangler migration; keep that browser contract explicit until map.ts owns
   * typed query selectors directly.
   */
  interface Element {
    readonly dataset: DOMStringMap;
  }
}
