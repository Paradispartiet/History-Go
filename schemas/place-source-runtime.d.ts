import "./place";

declare module "./place" {
  interface Place {
    /** Source place file exposed by generated places_index.json for fast full-place loading. */
    sourceFile?: string;
    /** Legacy/private source-file alias used by older loaders and transitional indexes. */
    _sourceFile?: string;
    /** Lightweight index file pointer used by split place indexes. */
    file?: string;
  }
}

declare global {
  interface Element {
    /** HTML button/input compatibility for DOM query results narrowed dynamically at runtime. */
    type?: string;
  }
}

export {};
